// U.S. Bank — Wave-11 kit (Task 102), Banking & Capital Markets domain.
// Angle: the REGIONAL NETWORK — four branch markets read as two-grain censuses
// (cycles beside relationships), payments rails discipline (card = merchant/POS
// acquiring legs, wire = corporate settlement legs), and statement settlement
// coverage. Distinct from wellsfargo (consent-order recovery framing) and
// capitalone (data-first card-bank framing): this kit leads with the branch
// -market map and the rails/settlement reads, not credit buckets.
// Pool provenance: scripts/company-pools.md carries NO U.S. Bank section
// (0 tagged rows) — all 10 topic slug sets and all 16 problems are
// theme-curated from the theme menu's sql rows (no w*/d*/f* rows); brief P4
// says so. The db's region spine is FOUR branch markets (EU 8, APAC 5, US 2,
// LATAM 1 relationships — probed read-only), not five.
// Facts source: scripts/company-facts.md verbatim (region census, rails mix,
// coverage census, reconciliation anomalies, opex calendar, ledger tie, month
// spine, ship clock, product-line census); case cells re-verified live against
// db/custom.db read-only.
// NOTE for the wave-11 registry wiring agent: usbank is NOT yet in registry
// COMPANY_META — wire id "usbank", domainId "banking", name "U.S. Bank",
// tagline "The regional network bank: branch markets, rails discipline, settlement coverage",
// accent "text-sky-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const usbankKit: CompanyKit = {
  id: "usbank",
  domainId: "banking",
  name: "U.S. Bank",
  tagline: "The regional network bank: branch markets, rails discipline, settlement coverage",
  accent: "text-sky-400",

  brief: [
    "**U.S. Bank** is the consumer-and-commercial arm of U.S. Bancorp — one of America's largest regional banking franchises, built on a heartland-weighted branch map, a mass-market deposit book, and two payments businesses most people never associate with a branch bank: **Elavon**, a major merchant acquirer that settles card rails for other people's storefronts, and a corporate-payments card book that moves commercial money on wire rails. The analyst's world here is therefore double-jointed: *branch-market coverage* on one side, settlement discipline on the other. This kit maps the storefront db onto that world: the 16 customers rows are **account relationships** (region = branch market), the 103 orders are statement cycles worth **34,833.28**, order_items are line items, products are deposit/card SKUs, invoices are the 28 statements, payments are the 27 settlement legs on card and wire rails, expenses are branch opex, and ledger_entries is the GL.",
    "The branch-market census is the regional read everything else hangs off: EU runs **45 cycles from 8 relationships** for 15,089.23, APAC 37 from 5 for 11,605.45, US 19 from 2 for 7,286.16, LATAM 2 from 1 for 852.44 — and the depth gap is the story, because the US market books 9.5 cycles per relationship against EU's 5.6. Cycle fates split {emerald:delivered} 52 (50.5%), in flight 30 (29.1%), pending 14 (13.6%), {rose:withdrawn} 7 (6.8%) — 103 by construction. The org reality is bank-grade schema discipline: money lands as **INTEGER cents** (a 37,364.00-dollar rail prints only after `amount_cents / 100.0`), and every dollar figure finance quotes reconciles back to a ledger that ties.",
    "Interview screens are census-then-denominator with a {sky:rails} accent. A typical loop opens with a two-grain market census (cycles beside relationships — say out loud which column is load and which is coverage), escalates into the settlement-coverage read — **21 statements settle to the cent** (65,612.00), 6 never collected (15,217.00), 1 partial (4,000.00 of 6,148.00) — then into the anomaly hunt where the labels lie: void-but-settled #11 at 925.00, paid-status #28 at 1,756.00 with *zero settlement legs behind it*. Rails follow: 16 card legs (37,364.00) are merchant/POS acquiring traffic, 11 wire legs (32,248.00) are corporate settlement, and five statements ride **both rails in one cycle**. Candidates who state the grain before the join consistently outperform.",
    "Preparation strategy: the pools file carries no U.S. Bank section — **0 tagged rows** — so every topic slug set and all thirty-two problems here are **theme-curated** to the kit's known screen shapes: branch-market censuses, rails folds, coverage CASE arms, tie-heavy in-market ladders, settlement clocks and cents-safe money math. Do the topics in order, then run all six case studies on the live storefront db: the {amber:branch-market census} the regional review opens with, the {violet:in-market relationship ladder} the market-depth deck is built on, the settlement coverage census, the rails-by-month mix, the dunning anti-join and the statement-cycle spine. The bar to clear: *state the grain and the denominator before you compute anything* — then make every fate census reconcile to 103 and every coverage census reconcile to 28.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the reads the bank's screens rehearse most: the branch-market census with its two grains, the in-market relationship ladder with its published tie policy, the settlement coverage census that must foot to 28, the rails-by-month mix treasury manages, the dunning anti-join that feeds the letter run, and the statement-cycle spine walk built on LAG. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'state your grain and denominator' follow-up tests.",
  ],

  dayInLife: [
    "**08:10 —** The day opens with the rails-and-ledger tie. Payments ops checks last night's settlement legs — card legs (16, 37,364.00) against merchant acquiring, wire legs (11, 32,248.00) against corporate settlement — then the GL identity: debits **181,080.00 against credits 181,080.00, delta zero** before anyone opens a dashboard. Cash-account movement ties to the settlement feed (44,196.00 net) and opex to the expense ledger (25,416.00 on both sides). A rail whose dollars don't tie to the cash account is *the day's first incident*, not a rounding note — and the analyst who writes the diff (which leg, how many cents, which statement) is the one the ops channel waits on.",
    "**11:30 —** Midday is the settlement-coverage census. Finance refreshes the three buckets — {emerald:exact} 21 statements (65,612.00 both sides), no payment 6 (15,217.00), partial 1 (#25 at 4,000.00 of 6,148.00) — then walks the two anomalies a human has to rule on: {rose:voided} #11 that still received its 925.00, and paid-status #28 (1,756.00) whose zero legs make it a *finding, not a dunning item*. The dunning queue takes the clean five — 873.00, 1,295.00, 4,937.00, 3,562.00, 2,794.00 — aged against uniform 30-day terms while the settlement clock reads **28.4 days** average, fastest 13, slowest 84. Classification happens at statement grain before any rollup; buckets that don't foot to 28 don't ship.",
    "**15:30 —** The afternoon tilts toward branch-market stakeholders. Regional banking wants the {sky:market census} with both grains — EU 45 cycles from 8 relationships beside US 19 from 2 — plus the in-market ladder that names who leads each market and how deep the bench runs. Branch ops wants the {amber:opex calendar}: rent 14 entries / 16,800.00, advertising 14 / 4,570.00, travel 3 / 2,521.00, tools 5 / 1,525.00, with the **3,210.00 August-2024 spike** carrying a story and its query attached. Every number ships with its SQL and its definition, because a regional network defends numbers market by market — *and the EOD read is only as good as the census it reconciles to*.",
  ],

  metrics: [
    { name: "Branch-market book", what: "Cycles, relationships and booked dollars per market: EU 45 / 8 / 15,089.23; APAC 37 / 5 / 11,605.45; US 19 / 2 / 7,286.16; LATAM 2 / 1 / 852.44. The regional read the whole kit hangs off — two grains, always reported together." },
    { name: "Market depth", what: "Relationships per market (8 EU, 5 APAC, 2 US, 1 LATAM) against cycles run: 9.5 cycles per relationship in the US against EU's 5.6. Depth versus load is the expansion call — broadening markets add relationships, concentrated ones add cycles." },
    { name: "Rails mix", what: "Settlement legs by rail: card 16 legs / 37,364.00 (merchant and POS acquiring traffic) versus wire 11 / 32,248.00 (corporate settlement) — 27 legs, 69,612.00, average leg 2,578.22. Five statements ride both rails in one cycle; the mix is a managed number." },
    { name: "Settlement coverage", what: "Statements versus legs: 21 settle to the cent (65,612.00 both sides), 6 never collected (15,217.00), 1 partial (4,000.00 of 6,148.00). Classification happens at statement grain before any rollup, and the buckets must foot to 28." },
    { name: "Settlement clock", what: "Issue-to-payment days on the paid book that carries legs: 20 statements, 28.4-day average against uniform 30-day terms, fastest 13, slowest 84. The 21st paid statement (#28) has zero legs — a status claim, not a settlement." },
    { name: "Statement book", what: "28 statements: 21 paid totalling 66,443.00 (average 3,163.95), 6 open at 19,609.00, 1 void at 925.00. The label census is the triage spine; the movement census (legs) is the ledger of record when labels lie." },
    { name: "Branch opex calendar", what: "36 expense entries, 25,416.00: rent 14 / 16,800.00, advertising 14 / 4,570.00, travel 3 / 2,521.00, tools 5 / 1,525.00 — with the 3,210.00 August-2024 spike the budget review always asks about." },
    { name: "Ledger tie", what: "Debits 181,080.00 against credits 181,080.00, delta zero: cash net 44,196.00, receivables net 16,440.00, opex 25,416.00, revenue 86,052.00. The close ships only when the trial balance ties — the bank's oldest SQL ritual." },
  ],

  topics: [
    {
      name: "Branch-market censuses",
      why: "Every regional read here reports two grains at once: cycles are load, relationships are coverage, and the ratio between them is the depth signal (US 19 cycles from 2 relationships against EU 45 from 8). COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is which — is the reflex being graded before any harder query is written.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "portfolio-weights", "customer-order-frequency", "product-sales-analysis-ii", "sales-analysis-i", "article-views-ii", "classes-more-than-5-students", "find-total-time-spent-by-each-employee", "list-the-products-ordered-in-a-period", "combine-two-tables", "confirmation-rate", "number-of-rich-customers", "duplicate-charge-pairs"],
    },
    {
      name: "Rails discipline (card vs wire)",
      why: "Settlement legs arrive on two rails with different meanings: card legs are merchant/POS acquiring traffic (16 legs, 37,364.00) and wire legs are corporate settlement (11, 32,248.00). Rail folds are conditional counts and sums over a method column, and the mix between rails is itself a managed number — five statements ride both rails in one cycle, so per-statement folds must pre-aggregate before they roll up.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "count-salary-categories", "monthly-transactions-i", "settlement-fails-aging", "rolling-7d-actives"],
    },
    {
      name: "Statement settlement coverage",
      why: "The coverage census classifies every statement at leg grain: 21 settle to the cent, 6 never collected, 1 partial. The trap is folding before classifying — a statement with two legs must have its legs summed first — and the second trap is trusting labels: paid-status #28 has zero legs and voided #11 received its 925.00, so classification reads legs, not status.",
      slugs: ["products-worth-over-invoices", "immediate-food-delivery-i", "weather-type-in-each-country", "ar-aging-schedule", "expected-credit-loss"],
    },
    {
      name: "Settlement clocks",
      why: "The settlement clock measures issue-to-payment days over the paid book that actually carries legs — 20 statements averaging 28.4 days against uniform 30-day terms, fastest 13, slowest 84. That is julianday arithmetic with a stated population, and the follow-up is always the denominator: which statements earned a settlement day, and which ones only claim one.",
      slugs: ["average-time-of-process-per-machine", "immediate-food-delivery-ii", "second-day-confirmation", "daily-balance-interest", "prepayment-detection"],
    },
    {
      name: "In-market leaderboards",
      why: "The market-depth deck ranks relationships inside each market, and ties are guaranteed: EU has a three-way tie at 4 cycles (Isabella Rossi, Noah Meyer, Pedro Alvarez) and APAC a two-way tie at 3. RANK shares rungs and skips (the next EU relationship lands on rank 6), DENSE_RANK shares rungs without gaps, ROW_NUMBER splits peers arbitrarily — a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "the-most-recent-three-orders", "uber-first-transaction", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Tier bands with CASE",
      why: "Bank reads band everything: opex categories, statement sizes, rail arms. CASE arms must be exhaustive and ordered — a hole in the CASE is a hole in the census, and a reordered WHEN quietly re-bands the base. The dunning queue is banded the same way: five no-payment statements from 873.00 to 4,937.00, each one an arm that must reconcile to the 6-statement total.",
      slugs: ["triangle-judgement", "calculate-special-bonus", "type-of-triangle", "amount-anomaly-zscore"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month spine (2024-01 to 2025-02) is the close deck's home turf: booked dollars walk from 3,731.97 down to the 1,193.86 July trough, jump +1,158.21 into August, and the cancelled column spikes in the same months (July 2, November 2). LAG drives the walk; the first row's NULL is the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "year-on-year-growth-rate", "game-play-analysis-i", "cohort-repeat-revenue", "fx-exposure-report", "employees-with-missing-information"],
    },
    {
      name: "Coverage set algebra",
      why: "Exception lists are anti-joins: which statements have no settlement legs (6, worth 15,217.00), which relationships never cycled. On this db the relationship anti-join returns a confident zero — all 16 relationships appear in the cycle table — and proving a zero is the analyst's job, because a confident zero you did not verify is how whitespace reports die in review.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "winback-recovery"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets delivered, in-flight, pending and withdrawn in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (arms sum to COUNT(*)) is the correctness argument reviewers listen for.",
      slugs: ["active-businesses", "user-activity-for-the-past-30-days-ii", "create-a-session-bar-chart", "top-percentile-fraud"],
    },
    {
      name: "Concentration & share math",
      why: "Concentration is the regional bank's risk lens: 63.5% of the booked book rides relationships spending 3,000-plus lifetime (71.2% above 2,000), and shares are ratios with stated denominators. The 100.0 multiplier goes BEFORE the division or integer truncation flattens every share to zero — and chargeback-rate reads at the acquiring desk use the same honest-denominator shape.",
      slugs: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "card-launch-success", "portfolio-concentration-hhi", "countries-you-can-safely-invest-in", "chargeback-rate-ranking", "structuring-detection"],
    },
  ],

  theory: [
    {
      id: "usbank-t1",
      q: "Your settlement-coverage report joins statements to their payment legs. When do you INNER and when do you LEFT — and what silently breaks if you filter a payments column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. The coverage census must LEFT JOIN from statements: the 6 statements with no settlement legs (15,217.00) ARE the answer, arriving with NULL leg columns. An INNER join silently deletes the never-collected book and the census reads a clean bank that doesn't exist. The classic break: filtering method = 'card' in WHERE after the LEFT JOIN kills every NULL-payload statement row — the LEFT quietly became an INNER and the dunning queue vanished. The fix is moving the predicate into the ON clause or an outer query. And the mirror-image anomaly matters here: voided statement #11 still received its 925.00, so it survives the INNER and folds INTO the exact-coverage bucket — both error modes are visible only if you keep the population and let the data disagree with the labels.",
      tag: "joins",
    },
    {
      id: "usbank-t2",
      q: "The EU ladder runs 24, 5, 4, 4, 4, 2, 1, 1 cycles. RANK, DENSE_RANK or ROW_NUMBER for the in-market rank — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips: the EU three-way tie at 4 cycles (Isabella Rossi, Noah Meyer, Pedro Alvarez) reads 3, 3, 3 and Dmitri Volkov's 2 cycles land on rank 6 — implying two phantom positions that don't exist. DENSE_RANK shares rungs without gaps: the tie reads 3, 3, 3 and the next relationship is 4. ROW_NUMBER splits peers arbitrarily, which silently ranks Noah above Pedro by rowid luck. There's a second layer: PARTITION BY region is what makes the ladder in-market at all — without it, Alice Chen's 24 cycles own rank 1 platform-wide and every other market's leader is invisible. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer relationships or a named tie-breaker like created_at then id — and writing it in the query comment where the market review can defend it.",
      tag: "windows",
    },
    {
      id: "usbank-t3",
      q: "The US market reads 19 statement cycles and 2 relationships. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per statement cycle, so a relationship with 17 cycles contributes 17. COUNT(DISTINCT o.customer_id) folds those rows back to relationships — 19 cycles collapse to 2 logos. Neither is wrong: cycles measure load and cadence, relationships measure installed base and coverage. The ratio — 9.5 cycles per relationship in the US against EU's 5.6 across 8 relationships — is the depth signal that decides whether a market is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for line items and COUNT(*) silently counts lines, not cycles — 251 of them at 2.44 lines per cycle. Saying 'one row per what?' for every COUNT is the habit the panel grades, and it is the same habit the market census encodes on its slide.",
      tag: "aggregation",
    },
    {
      id: "usbank-t4",
      q: "shipped_at is NULL until a cycle completes its processing window. What is your policy for the processing-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped cycles have a processing time, so the report measures open-to-stamp for the 82 of 103 cycles that carry shipped_at — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 withdrawn cycles, which is a feature, not a bug. The same discipline hits the settlement side from the other direction: a statement LEFT JOINed to no legs carries SUM(p.amount_cents) = NULL, and the no-payment bucket only appears if you COALESCE it to 0 deliberately. What is never acceptable is IFNULL-ing a clock to zero to 'fix' the average — that invents same-day settlements and poisons the 2.98 and 28.4 baselines every alert keys off.",
      tag: "nulls",
    },
    {
      id: "usbank-t5",
      q: "The market review wants markets carrying at least ten statement cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, pending and withdrawn rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2 — a survivor set you should be able to name before running it. One more placement rule the bank drills: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the withdrawn share truncates toward zero; the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one cycle, or about a market?",
      tag: "pipeline",
    },
    {
      id: "usbank-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that's theoretical: 103 cycles always produce a mean (338.19 average cycle book, and EU's 45-cycle depth dwarfs it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each cycle to ITS market's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a market's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. State the inner fold's population and its empty-case behavior unprompted — that's the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "usbank-t7",
      q: "The close deck buckets cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone merges January 2024's 8 cycles with January 2025's 6 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's cycles, and month-end is exactly when statement activity lands. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell the bank's story: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop lands into November's 1,648.80. Date discipline is close discipline: the spine, the window and the edge row are where trend decks go wrong.",
      tag: "dates",
    },
    {
      id: "usbank-t8",
      q: "Finance says a statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of the six (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the mirror: void statement #11 WITH a leg (925.00) never appears in that anti-join — the two error modes are reflections, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none — footing to 28 or it doesn't ship. And the fan-out rule: five statements carry two legs each, so legs get folded to one row per statement BEFORE the join to the book, or their cents double-count — a naive join prints 96,700.00 against an 86,977.00 book. The money rule underneath all of it: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row, and the trial balance (181,080.00 versus 181,080.00, delta zero) is what catches it.",
      tag: "quality",
    },
    {
      id: "usbank-t9",
      q: "The close deck wants a 3-month moving average of booked dollars beside every month of the cycle spine. How do you frame the window, and where do ROWS and RANGE disagree?",
      a: "AVG(booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — three rows including the current one, with the first two months printing partial windows and saying so. ROWS counts rows; RANGE peers over VALUES, so a tied or gapped month key makes the frame reach further than three calendar months. On a '%Y-%m' spine with no gaps the two agree; at cycle grain, where created_at ties are guaranteed, they diverge and the frame must be stated. The strong answer names the frame out loud and never ships the default.",
      tag: "windows",
    },
    {
      id: "usbank-t10",
      q: "The close pack stacks the settled bucket, the uncollected bucket and a grand-total row into one result set. Walk me through building it so no row silently vanishes.",
      a: "Two folds, one pack: GROUP BY the buckets separately, then UNION ALL them together — ALL, not plain UNION, because UNION dedupes and two buckets with identical figures would collapse into one row. The grand-total row is a third SELECT with no GROUP BY, its label column hard-coded so the pack can find it. Every branch must project the same column list in the same order, and the reconciliation check is the point: the branches add back to 28 statements and the 86,977.00 book, or the pack does not ship.",
      tag: "pipeline",
    },
    {
      id: "usbank-t11",
      q: "A market's uncollected cell prints 0 while an empty LEFT JOIN payload prints NULL. Defend the difference — when is each the right print?",
      a: "Zero and NULL answer different questions. Zero is a measured fact: cycles ran, none matched the condition — COUNT over a matched population. NULL means no measurement happened: a SUM over an empty LEFT JOIN payload, or a stage that cannot exist for that row. Zero-filling a true NULL invents a fact (a never-collected statement would read as settled-at-zero); leaving a real zero as NULL hides a finding. The policy: COALESCE only where zero is the honest value — settled cents on a no-leg statement — and let NULL stand where the population is undefined.",
      tag: "nulls",
    },
    {
      id: "usbank-t12",
      q: "Derived tables, correlated subqueries and window functions can all answer 'how does this market's depth compare to the network's'. When do you reach for each?",
      a: "The derived table (or CTE) stages the per-market fold once and joins back — right when many rows need the comparison and you want to inspect the staging set itself. The correlated subquery re-runs per outer row — readable for a one-off comparison, wrong for a cycle book at settlement scale. The window (AVG(cycles) OVER ()) computes the network mean once and attaches it to every row without a self-join — right when the bar must ride beside each ladder row. State the re-evaluation cost out loud and the choice makes itself.",
      tag: "subqueries",
    },
    {
      id: "usbank-t13",
      q: "Five statements settle on both rails at once. How do you find them with a self-join, and what stops every pair printing twice?",
      a: "Join payments to itself on invoice_id: SELECT a.invoice_id FROM payments a JOIN payments b ON a.invoice_id = b.invoice_id AND a.method < b.method — the strict inequality keeps one row per unordered pair, never a leg against itself. GROUP BY invoice_id HAVING COUNT(DISTINCT method) = 2 is the fold-based twin and is easier to read. Both return the same five statements. What breaks it: joining on <> (keeps both orderings) or joining on nothing at all — the cross product.",
      tag: "joins",
    },
    {
      id: "usbank-t14",
      q: "Your dunning staging list uses NOT IN against a loaded subquery and returns zero rows. Walk me through the diagnosis and the query you rewrite it to.",
      a: "Diagnosis first: NOT IN over a list containing one NULL is never TRUE — every comparison lands UNKNOWN, and the list empties while looking valid. Check the inner fold for NULLs — unverified statements are where identifiers go missing. The rewrite is NOT EXISTS: SELECT … FROM statements i WHERE NOT EXISTS (SELECT 1 FROM legs l WHERE l.invoice_id = i.id) — the correlated probe short-circuits on the first match, treats NULL as just another non-matching row, and returns the honest chase list. The two-step answer — name the NULL, then name the EXISTS — is what the panel listens for.",
      tag: "subqueries",
    },
    {
      id: "usbank-t15",
      q: "The settlement clock averages 28.4 days against 30-day terms. Rebuild that number for me — every decision that keeps it honest.",
      a: "Population first: only paid statements that carry legs have a settlement day — 20 of the 28; paid-status #28 (1,756.00, zero legs) claims a settlement it never had and must not dilute the base. Then the arithmetic: julianday(paid_on) - julianday(issued_on) converts TEXT dates to day floats — subtracting the raw TEXT values coerces each to its numeric prefix and prints clean zeros that look like same-day settlement. AVG over the deltas reads 28.4, fastest 13, slowest 84, and the 84 against uniform 30-day terms is the aged tail the review asks about. Finally the print: ROUND at the display edge, and the population stated in the title — a clock without its population is a rumor.",
      tag: "dates",
    },
    {
      id: "usbank-t16",
      q: "The relationship master arrives from a merger with case-broken and padded names — 'de Vries' as 'DE VRIES ', 'Van Dijk LLC' as 'van dijk'. What breaks downstream, and what is the hygiene pass?",
      a: "Everything that groups or joins on name: the in-market ladder splits one relationship into two, the market census overstates coverage, and COUNT(DISTINCT customer_id) quietly inflates. The hygiene pass runs once, upstream of the folds: TRIM(name) to strip padding, an explicit casing rule (INITCAP for display, UPPER only for display-normalized comparisons — never as a join key), and a dedupe staged on the natural key with ROW_NUMBER keeping the freshest row. Names are display artifacts, never join keys — the honest fix keys on customer_id and treats the text as cargo.",
      tag: "quality",
    },
    {
      id: "usbank-t17",
      q: "The desk wants relationships tiered into quartiles by booked value — but peers tied at the edge keep landing in different tiers. What is happening and what do you ship instead?",
      a: "NTILE(4) deals buckets by row position: with 16 relationships it deals 4-4-4-4, and any tie block straddling a boundary splits — peers land in different quartiles. Nothing is broken; position-based tiering has no tie semantics. If peers must share a tier, ship explicit CASE bands with fixed dollar edges (0-1,000 / 1,000-3,000 / 3,000-plus — the edges the concentration read already quotes), or PERCENT_RANK with a stated rounding policy. The reviewer's question is always 'why is this peer in a different tier than that one' — position is not an answer, an edge is.",
      tag: "windows",
    },
    {
      id: "usbank-t18",
      q: "Make every fate census reconcile to 103 by construction. What does that identity look like in SQL, and why does the one-pass version beat four queries?",
      a: "The identity: SUM of the branch counts equals COUNT(*) — 52 delivered + 30 in flight + 14 pending + 7 withdrawn = 103, checked in the same query as a CASE that adds the arms, or by summing the printed columns. One pass does it: COUNT(*) FILTER (WHERE status = 'delivered') and its siblings, or SUM(CASE WHEN status = … THEN 1 ELSE 0 END) — the portable twin — all over the same scan. Four sequential queries are four chances to drift: different WHERE filters, different run times, no shared denominator. The one-pass census cannot disagree with itself, and the ELSE 0 keeps empty arms printed instead of vanished.",
      tag: "aggregation",
    },
    {
      id: "usbank-t19",
      q: "'Give me the oldest unpaid statement' and 'give me each market's deepest relationship' — how do you write argmax queries whose answers survive review?",
      a: "An argmax is a fold plus a tie policy. Oldest unpaid: ORDER BY due_on ASC LIMIT 1 — but only because no two statements tie; if they do, LIMIT 1 picks one arbitrarily. The survivor-proof shape is the window: RANK() OVER (ORDER BY due_on ASC) = 1 keeps every tied row, and the review sees the whole tie set. Per-market deepest relationships are the same pattern partitioned by market: ROW_NUMBER with a named tie-breaker (booked DESC, then id) when exactly one row is wanted and the tie-breaker is published; RANK when peers should share the call. The failing pattern is ORDER BY inside a correlated subquery with LIMIT 1 and no stated tie rule — it works until the day it silently changes its mind.",
      tag: "windows",
    },
    {
      id: "usbank-t20",
      q: "The settlement pull re-runs the same market folds against 103 cycles in milliseconds — but a colleague's version takes minutes. Walk me through making it fast.",
      a: "Read the plan first: EXPLAIN QUERY PLAN shows seeks versus scans. The usual culprits are all self-inflicted — a function wrapped around the join or filter column (UPPER(method), STRFTIME('%Y', paid_on) in WHERE) defeats the index, so every query degrades to a full scan; SELECT * drags columns the fold never uses; and correlated subqueries re-run per row where a GROUP BY fold once would do. The fixes are boring and compounding: compare columns bare, filter on ranges the index can seek (half-open date bounds), pre-stage the per-market fold in a CTE and let the outer query read it once. At 103 cycles the difference is milliseconds; at acquirer scale it is the batch window.",
      tag: "indexes",
    },
    {
      id: "usbank-t21",
      q: "The market-depth deck re-runs nightly and reviewers noticed the three tied EU relationships swap positions between runs. How do you make a query's output reproducible?",
      a: "Ties leave the within-tie order undefined, so the engine's scan order decides — and plans shift with statistics and schema changes. The fix is a named, deterministic tie-breaker appended to every ORDER BY that matters: cycles DESC, booked DESC, relationship id — stable columns, unique at the tail. The same discipline applies to LIMIT cuts (dunning queues) and to GROUP_CONCAT rosters (concatenate in the published order or the email reads differently every night). Reproducibility is a query property: the ORDER BY is the policy, and the policy comment beside it is what the review defends.",
      tag: "windows",
    },
    {
      id: "usbank-t22",
      q: "Where does COALESCE belong in the settlement reads — and where does it belong nowhere?",
      a: "It belongs where zero is the honest value: COALESCE(SUM(p.amount_cents), 0) on the LEFT JOIN payload keeps the six never-collected statements on the coverage board at zero settled instead of vanishing into NULL; the same guard belongs on display columns a stakeholder will subtract against. It belongs nowhere in the clocks: IFNULL-ing a NULL settlement latency to zero invents same-day settlements and poisons the 28.4-day baseline every aging alert keys off — and it belongs nowhere in the LAG baseline, where the first row's NULL is the definition, not a gap. The test is one sentence: is zero a measurement, or an invention?",
      tag: "nulls",
    },
    {
      id: "usbank-t23",
      q: "The close ships only when four proofs pass. Name the four checks you run before the pack goes out, and what each would catch.",
      a: "One: the coverage census — 21 exact, 1 partial, 6 none footing to 28 statements, 65,612.00 both sides on the exact bucket; it catches a fan-out double-count (96,700.00 against an 86,977.00 book) and a LEFT JOIN quietly turned INNER. Two: the rails cross-foot — card 16 legs for 37,364.00 plus wire 11 for 32,248.00 equals 27 legs, 69,612.00; it catches a mislabeled method and a leg dropped to the wrong rail. Three: the GL tie — debits 181,080.00 against credits 181,080.00, delta 0; it catches a half-loaded batch and a cents-divisor error. Four: the fate census — 52 + 30 + 14 + 7 = 103; it catches any WHERE that dropped a status arm. Four proofs, each one query, each one number — the pack ships on zero deltas.",
      tag: "quality",
    },
    {
      id: "usbank-t24",
      q: "Every rate the desk quotes gets challenged on its denominator. Walk me through the denominator decisions behind dispute share, settled share and market depth.",
      a: "Dispute share: disputed legs over ALL legs on the rail — never over approved traffic, which is the flattering denominator the panel baits you toward. Settled share: settled value over billed value per bucket, computed at statement grain before any rollup — the 21-of-28 census is meaningless if the partial statement's shortfall (2,148.00) hides inside a rolled-up average. Market depth: cycles per relationship — US 19 from 2 is 9.5 against EU's 5.6 across 8 — the ratio that decides where expansion dollars go. The discipline is the same: state the numerator's population, state the denominator's population, and put the 100.0 before the division or integer truncation flattens the share to zero.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "usbank-mcq-1",
      prompt: "In this kit's rail map, what does a payment row with method = 'wire' represent?",
      choices: [
        "A corporate settlement leg — 11 legs moving 32,248.00",
        "A merchant POS card presentment on the acquiring rail",
        "A branch cash deposit into the vault",
        "An interest accrual posted to the deposit book",
      ],
      answer: 0,
      why: "The rail map is fixed: wire = corporate settlement (11 legs / 32,248.00), card = merchant and POS acquiring traffic (16 legs / 37,364.00). 27 legs, 69,612.00, average leg 2,578.22.",
      notes: [
        { choice: 1, why: "Merchant/POS presentments are the CARD rail — 16 legs. Calling a wire leg acquiring traffic mislabels the mix treasury manages." },
        { choice: 2, why: "Branch cash isn't a settlement rail in this db — the rails table carries exactly two methods, and both legs move against statements, not vault deposits." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-2",
      prompt: "The US market reads 19 statement cycles from 2 relationships. Which column pair reports both grains in one row?",
      choices: [
        "COUNT(*) and COUNT(customer_id)",
        "COUNT(*) and COUNT(DISTINCT customer_id)",
        "SUM(total) and COUNT(*)",
        "COUNT(DISTINCT region) and COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(*) counts cycle rows (19 — load); COUNT(DISTINCT customer_id) folds repeats back to relationships (2 — coverage). The gap between the columns is the depth signal: 9.5 cycles per relationship.",
      notes: [
        { choice: 0, why: "Without DISTINCT, COUNT(customer_id) reads 19 again — every cycle carries a relationship id, so both columns print load and the coverage story disappears." },
        { choice: 2, why: "SUM(total) is money, not a census — 7,286.16 of booked dollars is a different slide. The depth read needs load AND coverage counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-3",
      prompt: "Which branch-opex category owns the largest share of the 25,416.00 book — and what's the trap in reading it?",
      choices: [
        "Rent — 14 entries / 16,800.00, roughly two-thirds of the book despite tying Ads on entry count",
        "Ads — it has the most entries, 14, so it must be the biggest",
        "Travel — its per-entry amounts are the largest",
        "Tools — the most entries per dollar",
      ],
      answer: 0,
      why: "Rent is 16,800.00 of 25,416.00 — about two-thirds of branch opex. The trap is entry count: Ads ALSO has 14 entries but only 4,570.00. Count and dollars are different grains.",
      notes: [
        { choice: 1, why: "Ads ties Rent on entry count (14) and loses on dollars by 12,230.00 — the classic count-versus-money misread the opex calendar exists to prevent." },
        { choice: 2, why: "Travel is 3 entries / 2,521.00 — the FEWEST entries. Its average entry (840.33) leads, but averages are not the book." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-4",
      prompt: "Statement #1 settled on two legs totalling 4,860.00. A per-statement report uses COUNT(p.amount_cents) AS settled_cents. What prints?",
      choices: [
        "2 — the leg count wearing a money column name",
        "4,860.00 — the settled total",
        "2,430.00 — the average leg",
        "NULL — COUNT ignores cent columns",
      ],
      answer: 0,
      why: "COUNT folds to row count: statement #1 prints 2, not 4,860.00. SUM is the money fold. Five statements on this book ride two legs each, so COUNT-versus-SUM is the difference between legs and dollars on exactly the statements finance watches.",
      notes: [
        { choice: 1, why: "4,860.00 is SUM's answer — the fold you wanted. The column alias 'settled_cents' makes the wrong fold look right in the deck." },
        { choice: 2, why: "2,430.00 is AVG's answer — a per-leg read nobody asked for. One fold, three wrong monies wearing one column name." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-5",
      prompt: "Keep only branch markets carrying at least 10 statement cycles. Where does the floor live?",
      choices: [
        "WHERE COUNT(*) >= 10, before GROUP BY",
        "GROUP BY region HAVING COUNT(*) >= 10",
        "WHERE cycles >= 10 on the raw cycles table",
        "HAVING before GROUP BY, wherever it fits",
      ],
      answer: 1,
      why: "A cycle-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU 45, APAC 37 and US 19 — LATAM's 2 cycles drop out.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'cycles' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-6",
      prompt: "The EU ladder runs 24, 5, 4, 4, 4, 2, 1, 1 cycles. Under RANK, what rank does the 2-cycle relationship (Dmitri Volkov) carry?",
      choices: ["6", "4", "5", "3"],
      answer: 0,
      why: "RANK shares rungs and then skips: Alice 1, Chloe 2, then the three-way tie at 4 cycles consumes ranks 3, 4 and 5 — so Dmitri's 2 cycles land on rank 6. The gap IS the tie policy.",
      notes: [
        { choice: 1, why: "4 is the DENSE_RANK answer — shared rungs without gaps. The market deck's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "5 is the LAST rank the tie block consumes, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-7",
      prompt: "The settlement clock prints 28.4 days average. Which population does that average own?",
      choices: [
        "20 paid statements that carry settlement legs — paid-status #28 (1,756.00, zero legs) is excluded",
        "All 21 paid statements",
        "All 28 statements, open and void included",
        "The 27 settlement legs individually",
      ],
      answer: 0,
      why: "Issue-to-payment days exist only where legs exist: 20 of the 21 paid statements carry legs. #28's paid label has no settlement day behind it — legs are the ledger of record, labels are claims.",
      notes: [
        { choice: 1, why: "Including #28 doesn't crash anything — it just averages a population where one member contributes nothing, and the denominator silently includes a lie." },
        { choice: 3, why: "Legs aren't statements — five statements ride two legs each, so a leg-grain average would double-weight exactly the split settlements the census treats as one statement." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-8",
      prompt: "Finance joins 28 statements to their 27 settlement legs and reads SUM(invoices.amount_cents)/100.0 as 96,700.00. The statement book is actually 86,977.00. What happened?",
      choices: [
        "Five statements ride two legs each — their cents count twice (+24,940.00) while six no-leg statements drop out (−15,217.00): 86,977.00 + 24,940.00 − 15,217.00 = 96,700.00",
        "Rounding drift accumulated across the 27 legs",
        "The /100.0 conversion ran twice",
        "SUM over a joined column always returns the payments total, 69,612.00",
      ],
      answer: 0,
      why: "The statement-to-legs join is 1:N with fan-out: each two-leg statement contributes its billed cents twice. Fold legs to one row per statement BEFORE joining to the book, and the 28-statement census reads 86,977.00 — 66,443.00 paid, 19,609.00 open, 925.00 void.",
      notes: [
        { choice: 2, why: "Dividing by 100.0 twice would read 869.77, not 96,700.00. The /100.0 happens once, at display; the error is in the join grain." },
        { choice: 3, why: "69,612.00 is the LEGS total (SUM over payments) — a different fold entirely. The 96,700.00 is statement cents inflated by fan-out, which is worse because it looks plausible." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-9",
      prompt: "The close deck buckets cycles with STRFTIME('%m', created_at). The regional review rejects the chart. Why?",
      choices: [
        "'%m' returns month only — January 2024 (8 cycles, 3,731.97) and January 2025 (6 cycles, 1,669.50) collapse into one bucket, cutting 14 months to 12; the spine needs '%Y-%m'",
        "'%m' is not zero-padded, so buckets sort as 1, 10, 11, 12, 2, 3…",
        "STRFTIME cannot take a created_at column directly",
        "The spine needs 14 buckets because the db holds 14 relationships",
      ],
      answer: 0,
      why: "The db spans 2024-01 to 2025-02 — 14 months. '%Y-%m' gives 14 buckets; '%m' merges same-numbered months across years and the January bucket double-loads. The zero-padded year prefix is what makes the spine sortable and honest.",
      notes: [
        { choice: 1, why: "Zero-padding is exactly what '%m' DOES do ('01'…'12') — the sort is fine. The defect is the missing year, not the padding." },
        { choice: 3, why: "14 is the MONTH count on this spine. The relationship count is 16 — two different numbers the kit keeps separate on purpose." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-10",
      prompt: "A staging slice feeds WHERE total > (SELECT AVG(total) FROM staging_slice) and the report returns ZERO rows even though the slice holds cycles. First diagnosis?",
      choices: [
        "The slice is genuinely below average — zero is the correct answer",
        "An empty inner fold returns NULL; total > NULL is UNKNOWN, so every row filters out silently",
        "AVG over a staging table is a syntax error",
        "The outer query needs DISTINCT before the comparison works",
      ],
      answer: 1,
      why: "A scalar subquery over an empty population returns NULL, not an error — and x > NULL is UNKNOWN, which WHERE treats as false for every row. The report empties while looking valid. Check the inner fold's row count before trusting any above-average zero.",
      notes: [
        { choice: 0, why: "Sometimes zero IS right — but the confident zero is exactly how this bug ships. Verify the inner fold returned one row before defending the result." },
        { choice: 2, why: "AVG is perfectly legal over an empty table — it returns NULL. Silent NULL, not a crash, is the whole trap." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-11",
      prompt: "The acquiring desk computes dispute share per rail: 100.0 * SUM(CASE WHEN disputed THEN 1 ELSE 0 END) / COUNT(*). Why does the 100.0 sit BEFORE the division?",
      choices: [
        "It promotes the division to real arithmetic before integer truncation flattens the share",
        "It rounds the result to two decimals",
        "It filters the census to disputed legs only",
        "It is cosmetic — moving it after the division changes nothing",
      ],
      answer: 0,
      why: "SUM of 0/1 flags over COUNT is integer division in SQLite — the share truncates toward zero and every market reads flat. The 100.0 multiplier forces real division first; it is the difference between 6.8 and a displayed 0 on the branch-market board.",
      notes: [
        { choice: 1, why: "ROUND is the display step and runs after the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates the share to 0 first, then scales — the coverage board prints zeros for every market including the worst one." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-12",
      prompt: "Cycles join to their line items and the count reads 251 against a 103-cycle census. What is the honest read?",
      choices: [
        "The join fanned out to line grain — 251 lines across 103 cycles, 2.44 lines per cycle; fold back with COUNT(DISTINCT order_id)",
        "148 cycles were ingested twice and need a dedupe job",
        "The line-items table is the true census; 103 was stale",
        "GROUP BY market collapsed the cycles to 251",
      ],
      answer: 0,
      why: "The cycle-to-lines join is 1:N: 103 cycles carry 251 lines. COUNT(*) after the join counts lines — the third grain that ambushes every census follow-up. The market census counts cycles (COUNT(*)) and relationships (COUNT(DISTINCT customer_id)); lines are a different slide.",
      notes: [
        { choice: 1, why: "The multiplication is the join's honest shape, not an ingest bug. Deduping it would delete real lines and the product-mix read would shrink." },
        { choice: 3, why: "GROUP BY cannot reduce below the grain it grouped at — 251 lines fold to 103 cycles only via a DISTINCT count or a pre-aggregated derived table." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-13",
      prompt: "Treasury wants legs per rail — card versus wire — in one pass. Which fold returns 16 and 11?",
      choices: [
        "SELECT method, COUNT(*) FROM payments GROUP BY method",
        "SELECT COUNT(method) FROM payments WHERE method = 'card' OR 'wire'",
        "SELECT COUNT(DISTINCT method) FROM payments",
        "SELECT SUM(method) FROM payments GROUP BY method",
      ],
      answer: 0,
      why: "GROUP BY method folds the 27 settlement legs into one row per rail: card 16, wire 11 — the rails mix treasury manages. The same query with SUM(amount_cents)/100.0 beside it gives the money: 37,364.00 against 32,248.00.",
      notes: [
        { choice: 1, why: "'card' OR 'wire' is not a comparison — SQLite evaluates the non-zero string as TRUE, so the WHERE keeps every row and the count reads 27 twice." },
        { choice: 2, why: "COUNT(DISTINCT method) reads 2 — the number of rails, not the legs on each. Different question, different fold." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-14",
      prompt: "The dunning queue pulls its next five statements with LIMIT 5 and no ORDER BY. Ops notices the queue reshuffles between runs. Why?",
      choices: [
        "LIMIT without ORDER BY is nondeterministic — the engine returns whichever rows the scan reached first",
        "The statements table is rewritten by the nightly close",
        "LIMIT 5 always returns the five oldest rowids — stable but wrong",
        "The queue has ties, so it must differ between runs",
      ],
      answer: 0,
      why: "No ORDER BY means no contract on row order, and LIMIT cuts whatever the plan produced. The dunning queue must read biggest-owed or oldest-due by explicit ORDER BY, with a tie-breaker stated — reproducibility is a query property, not a data property.",
      notes: [
        { choice: 2, why: "Scan order often follows rowid, which is why the bug hides in dev — but nothing guarantees it, and a plan change reshuffles the queue overnight." },
        { choice: 3, why: "Ties make the cut fragile, but the deeper defect is the missing ORDER BY — even untied data can reorder. Name the tie-breaker too." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-15",
      prompt: "The coverage report LEFT JOINs statements to settlement legs; the 6 never-collected statements print NULL in the settled column. How do you keep them on the board?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0) — zero-fill the miss so the row survives the fold",
        "Switch to INNER JOIN — statements without legs are noise",
        "Filter WHERE amount_cents > 0 to hide the empties",
        "Fill the NULL with the billed amount — a statement is worth what it claims",
      ],
      answer: 0,
      why: "The NULL payload IS the answer — the six statements no rail ever touched, worth 15,217.00. COALESCE to 0 keeps them visible at zero settled, which is the honest print that feeds the dunning queue and the #28 finding.",
      notes: [
        { choice: 1, why: "The INNER JOIN deletes exactly the rows the dunning letter needs — the census would read 22 statements and the 15,217.00 exposure vanishes." },
        { choice: 3, why: "Filling from the claim turns 'never collected' into 'collected' — #28's 1,756.00 paid-status lie would look reconciled. Zero-fill, never fill-from-claims." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-16",
      prompt: "A candidate writes WHERE RANK() OVER (PARTITION BY region ORDER BY COUNT(*) DESC) = 1 to crown each market's leader, and the engine rejects the query. What is the rule?",
      choices: [
        "Window functions cannot run in WHERE — rank after the fold, then filter rung = 1 in an outer query or CTE",
        "RANK over aggregates requires the window to be partitioned, which WHERE forbids",
        "The comparison must be <= 1, never = 1",
        "PARTITION BY must reference the GROUP BY column list verbatim",
      ],
      answer: 0,
      why: "WHERE evaluates before the fold and before any window is computed, so a window call there is a semantic error. The working shape stages the ranked ladder in a CTE and keeps rung = 1 in the outer SELECT — which also lets the market deck show the whole bench, not just the crown.",
      notes: [
        { choice: 1, why: "PARTITION BY is irrelevant to the rejection — windows are illegal in WHERE with or without it. The clause order is the lesson." },
        { choice: 2, why: "= 1 versus <= 1 changes which rows survive, not whether the query parses. The defect is placement, not comparison." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-17",
      prompt: "A Q1 settlement cut reads paid_on BETWEEN '2024-01-01' AND '2024-03-31' and the close pack's Q1 rails total looks light. What is the defect?",
      choices: [
        "Timestamped legs on March 31 after midnight fall outside BETWEEN — the honest cut is half-open: >= '2024-01-01' AND < '2024-04-01'",
        "BETWEEN cannot compare TEXT dates — the query needs DATE()",
        "The quarter needs 92 days; BETWEEN spans 91",
        "Nothing — BETWEEN is inclusive on both ends and the cut is correct",
      ],
      answer: 0,
      why: "paid_on carries a time component, so '2024-03-31' matches midnight exactly and the last night's settlements vanish from the quarter. Month-end is exactly when legs land heaviest — the half-open range is the house rule across the settlement feeds.",
      notes: [
        { choice: 1, why: "SQLite compares TEXT dates lexicographically and BETWEEN works — the defect is the inclusive upper bound, not the function." },
        { choice: 3, why: "Inclusive-on-both-ends is precisely the bug: it reads as safe but drops every leg stamped 2024-03-31T00:00:01 onward." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-18",
      prompt: "The coverage pivot reads CASE WHEN legs IS NULL THEN 'none' WHEN legs = billed THEN 'exact' ELSE 'partial' END. A colleague moves the 'exact' arm FIRST. What changes?",
      choices: [
        "Nothing for exact statements, but the no-leg statements now test legs = billed with NULL legs — the comparison is UNKNOWN, they fall through to 'partial', and the none bucket empties",
        "Nothing — CASE arms are independent and order never matters",
        "Only statements billed exactly at the partial amount change buckets",
        "The ELSE arm stops firing and NULLs appear across the board",
      ],
      answer: 0,
      why: "CASE fires the first matching arm top-down. For the six no-leg statements, legs IS NULL is the ONLY arm that can catch them — NULL = billed is UNKNOWN, never true. Move the exact arm first and the none bucket reads 0 while a phantom partial bucket absorbs all six: the coverage census stops footing to 28.",
      notes: [
        { choice: 2, why: "The boundary statement is the least of it — the entire none bucket migrates. Overlapping predicates plus NULL payloads make arm order load-bearing." },
        { choice: 3, why: "ELSE still fires (that is where the six land after the reorder) — the damage is mis-banding into 'partial', not NULLs on the board." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-19",
      prompt: "A chase list built as invoice_id NOT IN (SELECT invoice_id FROM staging_slice) returns zero rows even though most statements qualify. First diagnosis?",
      choices: [
        "One NULL invoice_id in the staging slice poisons NOT IN — every comparison becomes UNKNOWN; rewrite as NOT EXISTS",
        "The staging slice is empty, so NOT IN returns everything by definition",
        "NOT IN needs an index on invoice_id to return rows",
        "The outer query needs DISTINCT before the membership test works",
      ],
      answer: 0,
      why: "NOT IN over a list containing one NULL can never be TRUE — x NOT IN (1, 2, NULL) is UNKNOWN for every x. Unverified statements are exactly where a NULL id hides, which is why the dunning staging pattern is NOT EXISTS: it short-circuits and never trips on NULL.",
      notes: [
        { choice: 1, why: "An empty slice makes NOT IN trivially TRUE for all rows — the opposite symptom. Zero rows with a populated slice points at NULL in the list." },
        { choice: 2, why: "Membership tests do not need indexes to be correct — this is a semantics bug, not a performance one." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-20",
      prompt: "The close pack wants the five dual-rail statements listed in ONE cell for the settlement review email. Which fold does it?",
      choices: [
        "GROUP_CONCAT over the statements whose legs carry COUNT(DISTINCT method) = 2 — one comma-separated cell listing the numbers",
        "SUM over the statement numbers — one number that encodes all five",
        "COUNT(*) || ' dual-rail statements' — a count wearing a list's clothes",
        "MAX over the statement numbers — the biggest stands for the set",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds a column into one delimited string cell — the roster read. Classify dual-rail statements first (a per-statement fold with COUNT(DISTINCT method)), then concatenate their numbers; the email quotes all five exposures, not one.",
      notes: [
        { choice: 1, why: "SUM on text numbers coerces them to values or zero — the 'total' is unrecoverable noise. Lists concatenate; they do not add." },
        { choice: 3, why: "MAX quotes one statement and discards four. The reviewer who only sees the biggest misses the rest of the dual-rail pattern." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-21",
      prompt: "The market dashboard's filter reads UPPER(method) = 'CARD' and the overnight settlement pull that ran in seconds now takes minutes. What happened?",
      choices: [
        "Wrapping the column in UPPER() defeats sargability — the planner cannot seek a method index and scans the table; compare the column bare",
        "UPPER() is quadratic on long columns and must be replaced by LOWER()",
        "The index was dropped by the last release and needs a rebuild",
        "Text comparisons are inherently an order of magnitude slower than numeric ones",
      ],
      answer: 0,
      why: "An index stores the column's stored form; a function wrapped around the column hides it from the planner and every read degrades to a full scan. If casing is unreliable, clean the stored values once or index the expression — never pay the scan on every settlement pull.",
      notes: [
        { choice: 1, why: "UPPER and LOWER cost the same per row; the collapse is the lost index seek, not the function's arithmetic." },
        { choice: 3, why: "Text-versus-numeric cost is noise next to scan-versus-seek. The minutes came from the full table scan, not the datatype." },
      ],
      difficulty: "medium",
    },
    {
      id: "usbank-mcq-22",
      prompt: "Set algebra over the statement book: which EXCEPT direction isolates paid-status #28 — the 1,756.00 claim with zero settlement legs?",
      choices: [
        "paid_claims EXCEPT statements_with_legs — claims on the left that no rail ever evidenced on the right",
        "statements_with_legs EXCEPT paid_claims — legs on the left that no claim ever covered",
        "paid_claims INTERSECT statements_with_legs — the claims that settled",
        "The direction does not matter; EXCEPT is symmetric",
      ],
      answer: 0,
      why: "EXCEPT keeps left-side rows absent from the right. Claims EXCEPT evidence is the no-evidence queue — #28 surfaces exactly, because its paid label has no leg behind it. The reverse direction returns the mirror anomaly: rail evidence behind a non-paid claim, void-but-settled #11 at 925.00.",
      notes: [
        { choice: 1, why: "Legs EXCEPT claims returns the opposite population — useful, but it is the reconciliation exception list, not the dunning queue." },
        { choice: 2, why: "INTERSECT returns claims WITH legs — the honest settled core. It can never surface a no-leg claim by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-23",
      prompt: "Per-market mean cycle books: EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 — their average is 364.67, but the platform mean is 338.19. Why do both numbers exist?",
      choices: [
        "The average-of-averages weights each market equally; the platform mean weights each cycle — they diverge whenever market sizes differ (45 cycles versus 2)",
        "The platform mean is stale — 364.67 is the corrected figure",
        "One market's average is miscomputed and the truth sits between them",
        "Rounding drift accumulated across the four divisions",
      ],
      answer: 0,
      why: "AVG of market AVGs is a different statistic: LATAM's 426.22 on two cycles counts as much as EU's 335.32 on forty-five. The platform mean folds all 103 cycles once — 338.19 — and it is the number the concentration read keys off. Name the denominator before quoting either.",
      notes: [
        { choice: 1, why: "Neither number is wrong — they answer different questions. Quoting the unweighted mean flatters the book by 26.48 per cycle." },
        { choice: 3, why: "A 26.48 gap is far too large for double-precision drift. It is a weighting difference, reproducible in any spreadsheet." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-24",
      prompt: "NTILE(4) runs over the 16-relationship bench ordered by lifetime value DESC. The EU book carries a three-way tie at 4 cycles mid-table. What prints at the quartile edges?",
      choices: [
        "Tied peers can split across buckets — NTILE deals by row position, not value ties, so peers land in different quartiles",
        "All tied peers share a quartile because NTILE respects ties",
        "The query errors — NTILE cannot run over tied order keys",
        "The tie stretches one quartile and leaves another short",
      ],
      answer: 0,
      why: "NTILE assigns buckets by row position: 16 rows deal 4-4-4-4 regardless of ties, and any tie block straddling a boundary splits. Peer relationships end up in different tiers, which is why tier reporting here prefers explicit CASE bands with fixed dollar edges when ties matter.",
      notes: [
        { choice: 1, why: "That is DENSE_RANK-style thinking — NTILE has no tie semantics at all. Probing the bench confirms the split." },
        { choice: 3, why: "Bucket sizes are fixed by the row count — 4/4/4/4 for 16 rows. Ties shift membership, never bucket sizes." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-25",
      prompt: "The acquiring desk hunts duplicate settlement legs by self-joining payments to itself. Every pair prints twice and every leg pairs with itself. What fixes it?",
      choices: [
        "Join on a.id < b.id — the strict inequality pairs each leg once, never with itself",
        "Add DISTINCT to the SELECT — the duplicates are the engine's fault",
        "GROUP BY a.invoice_id after the join — folding hides the double count",
        "Join on a.id <> b.id — excluding equality is enough",
      ],
      answer: 0,
      why: "A self-join produces every ordered pair: (x, y) and (y, x) both appear, plus (x, x). The strict < keeps exactly one of each unordered pair — the canonical pair-once shape behind the duplicate-leg screen and the five split-rail statements this book carries.",
      notes: [
        { choice: 1, why: "DISTINCT dedupes identical output rows, but (x, y) and (y, x) differ as rows — DISTINCT cannot see the symmetry. Only the ordered inequality removes it." },
        { choice: 3, why: "<> removes self-pairs but keeps both orderings — the double count survives. The direction of the inequality is the whole fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-26",
      prompt: "The market-depth deck re-runs nightly and the three EU relationships tied at 4 cycles (Rossi, Meyer, Alvarez) swap positions between runs. What makes the ladder reproducible?",
      choices: [
        "A named, deterministic tie-breaker — ORDER BY cycles DESC, booked DESC, relationship id — published with the deck",
        "ROW_NUMBER instead of RANK — numbering the rows fixes the order",
        "An index on cycles — indexes force row order on output",
        "Sorting in the presentation layer after the query returns",
      ],
      answer: 0,
      why: "Ties leave the within-tie order undefined, so the engine's scan order decides — and plans shift with statistics and schema changes. A published tie-breaker keyed on stable columns makes the deck reproducible run over run, and the policy comment is what the market review defends.",
      notes: [
        { choice: 1, why: "ROW_NUMBER numbers the rows but does not say WHICH row gets which number — the arbitrary split remains, hidden behind clean integers." },
        { choice: 3, why: "Sorting in the app moves the arbitrariness out of SQL without removing it — two layers must now agree on a rule that should live in one ORDER BY." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-27",
      prompt: "A staging slice holds exactly ONE cycle and feeds WHERE total > (SELECT AVG(total) FROM staging_slice). The report returns zero rows. Bug or truth?",
      choices: [
        "Truth — one row's total can never strictly exceed its own average, so a one-row slice always returns empty under >",
        "Bug — the scalar subquery returned NULL and emptied the report",
        "Bug — AVG over one row is undefined and poisoned the comparison",
        "Truth — the cycle is withdrawn, and withdrawn cycles compare as zero",
      ],
      answer: 0,
      why: "The mean of a single value is that value, and x > x is false — the empty result is arithmetically correct. It matters here because above-average screens stage one market or one status at a time, and a one-cycle slice is exactly where the screen goes legitimately blank.",
      notes: [
        { choice: 1, why: "The empty-inner NULL trap empties a populated slice too — but here the inner fold returned one row and one value. Different failure: check the inner row count before either diagnosis." },
        { choice: 3, why: "Withdrawn cycles carry real totals on this book — 1,152.49 across the 7. Status has nothing to do with a mean-of-one." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-28",
      prompt: "Concentration reads 63.5% of the 34,833.28 book riding relationships above 3,000 lifetime. Which window shape computes the cumulative-share ladder behind that number?",
      choices: [
        "SUM(SUM(total)) OVER (ORDER BY lifetime DESC) / SUM(SUM(total)) OVER () — running fold over the ladder divided by the grand fold",
        "AVG(total) OVER (ORDER BY lifetime DESC) — the moving mean carries the share",
        "PERCENT_RANK() OVER (ORDER BY lifetime) — the percentile IS the share",
        "ROW_NUMBER() OVER (ORDER BY lifetime DESC) divided by COUNT(*) — position over population",
      ],
      answer: 0,
      why: "A share needs money over money: the running SUM of per-relationship totals over the grand total, one pass, two windows. Ordered by lifetime DESC, the row where the running share crosses 63.5% is exactly the 3,000 line the market review quotes.",
      notes: [
        { choice: 2, why: "PERCENT_RANK returns a row's relative POSITION (0 to 1), not the share of value it carries. The two coincide only when every relationship books the same lifetime." },
        { choice: 3, why: "Position over population is head-count concentration — a different lens. Money concentrates harder than head-count here." },
      ],
      difficulty: "hard",
    },
    {
      id: "usbank-mcq-29",
      prompt: "Void statement #11 carries a settlement leg of 925.00. Which bucket of the legs-based coverage census does it fold into, and why?",
      choices: [
        "'exact' — classification reads rail evidence, and its leg matches its billed cents exactly",
        "'none' — a voided statement has no legs by definition",
        "'partial' — voided statements always settle partially",
        "It folds out of the census — voided statements are excluded from the denominator",
      ],
      answer: 0,
      why: "Coverage reads legs, not labels: #11's one leg matches its billed 925.00 to the cent, so it folds INTO the 21-statement exact bucket (65,612.00 both sides). That is the point of legs-as-ledger: the census agrees with the money even when the status column disagrees with itself — and #28, the paid claim with zero legs, folds OUT.",
      notes: [
        { choice: 1, why: "That is classification by label — the exact mistake the census exists to catch. #11 has a leg; 'none' would hide evidence behind a claim." },
        { choice: 3, why: "Excluding #11 changes the denominators: exact would read 20 and the 65,612.00 cross-foot would break. The census keeps the population and lets the data disagree with the label." },
      ],
      difficulty: "easy",
    },
    {
      id: "usbank-mcq-30",
      prompt: "A candidate computes the settlement clock as AVG(paid_on - issued_on) on TEXT dates and gets 0 for every statement. What is the defect and the fix?",
      choices: [
        "TEXT dates subtract as numbers — SQLite coerces each to its numeric prefix and the difference collapses to 0; the fix is julianday(paid_on) - julianday(issued_on)",
        "Subtraction is not defined on dates — the fix is DATEDIFF(paid_on, issued_on)",
        "AVG needs integer inputs — cast the dates to INT before subtracting",
        "The order is reversed — issued_on - paid_on returns the positive day count",
      ],
      answer: 0,
      why: "SQLite stores dates as TEXT here, and TEXT minus TEXT coerces each operand to its leading numeric prefix — '2024-02-15' minus '2024-01-18' is 2024 minus 2024, a clean zero that looks like same-day settlement. julianday() converts to day floats first; over the 20 paid-with-legs statements that average reads 28.4 days against 30-day terms, fastest 13, slowest 84.",
      notes: [
        { choice: 1, why: "DATEDIFF is not a SQLite function — the engine would reject it before the numbers lie. The defect is the missing conversion, not a missing function to bolt on top." },
        { choice: 3, why: "Reversing the operands on a broken coercion still returns 0. The zero is the tell that the conversion never happened." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-usbank-1",
      tier: "easy",
      topic: "j1",
      universe: "growth",
      title: "The branch-market census",
      brief:
        "U.S. Bank regional brief on the storefront db: the monthly market review opens with the branch-market census — statement cycles, account relationships and booked dollars per market, both grains on one slide. The regional banking lead is explicit: 'cycles are load, relationships are coverage; I need both or I can't see whether a market is broadening or concentrating.' Probed facts: 103 cycles worth 34,833.28 across 16 relationships — EU 45 cycles / 8 relationships / 15,089.23; APAC 37 / 5 / 11,605.45; US 19 / 2 / 7,286.16; LATAM 2 / 1 / 852.44. All 16 relationships appear in the cycle table, so no market rows go missing.",
      ask: "Return each branch market with its cycle count, distinct relationship count and booked dollars to 2 decimals, biggest book first.",
      template:
        "SELECT c.region AS market,\n       {1}(*) AS cycles,\n       COUNT({2} o.customer_id) AS relationships,\n       ROUND({3}(o.total), {4}) AS booked_dollars\nFROM orders o\nJOIN customers c ON o.customer_id = c.{5}\nGROUP BY c.region\nORDER BY booked_dollars {6};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the cycle counter",
          why: "COUNT(*) counts the cycle rows folded into each market — 45 EU, 37 APAC, 19 US, 2 LATAM, reconciling to the 103 booked cycles. SUM(*) doesn't exist and MAX(*) is a syntax error: only COUNT takes the star to count rows rather than values.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the relationship fold",
          why: "COUNT(DISTINCT o.customer_id) folds repeat cycles back to relationships: EU reads 8, not 45. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census, and the depth read (8 relationships behind 45 cycles) is the slide's whole point.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book fold",
          why: "SUM(o.total) adds each market's booked dollars to the probed books: 15,089.23 / 11,605.45 / 7,286.16 / 852.44. COUNT prints the cycle count wearing a money name; AVG prints the per-cycle averages 335.32 / 313.66 / 383.48 / 426.22 — a real table answering a different question.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the dollar precision",
          why: "Booked dollars print to 2 decimals — 15,089.23 matching the probed book to the cent. ROUND(…, 1) prints 15,089.2 and the four market books stop footing to the 34,833.28 platform total in the deck's footer.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the join key",
          why: "The join is o.customer_id = c.id — every cycle attaches to the relationship that owns it, all 103 survive. c.customer_id does not exist on the relationships table, and joining on a name column would fan out on duplicates instead of keying on identity.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review opens with the biggest market book: EU 15,089.23, then APAC 11,605.45, US 7,286.16, LATAM 852.44. ASC would open the regional review on LATAM's two cycles — the tail, not the story.",
        },
      ],
      distractors: ["MAX", "AVG", "balance", "ASC", "1", "NULL"],
      walkthrough:
        "One join, two grains, one direction. The join attaches every cycle to its relationship's market, GROUP BY region folds them into four rows, and each row counts twice: COUNT(*) at the cycle grain (45 / 37 / 19 / 2 — load) and COUNT(DISTINCT o.customer_id) at the relationship grain (8 / 5 / 2 / 1 — coverage), while SUM(o.total) rounds the book to 15,089.23 / 11,605.45 / 7,286.16 / 852.44 — footing upward to 103 cycles and 34,833.28. ORDER BY booked_dollars DESC opens the review on EU. The distractors fail honestly: MAX as the counter or the fold is a syntax error; AVG in the money slot prints the per-cycle averages 335.32 / 313.66 / 383.48 / 426.22 — plausible numbers, wrong slide; customer_id in the key slot errors because relationships carry id, not customer_id; balance in the precision slot errors — no such column exists on cycles or relationships, the book lives in o.total; 1 truncates the books to one decimal and the footer stops footing; NULL rounds every book to NULL; ASC opens the review on LATAM. The read the deck makes: US books 19 cycles from 2 relationships (9.5 per logo) against EU's 5.6 — concentration versus breadth, and the expansion queue follows the concentration.",
      },
    {
      id: "cs-usbank-2",
      tier: "hard",
      topic: "t6",
      universe: "month-close",
      title: "The in-market relationship ladder",
      brief:
        "U.S. Bank market-depth brief on the storefront db: the month-close deck names who leads each branch market and how deep the bench runs — an in-market ladder over the same 16 relationships and 103 cycles, ranked WITHIN market, not across the platform. Probed facts: EU runs 8 relationships — Alice Chen 24 cycles, Chloe Dubois 5, then a THREE-WAY tie at 4 (Isabella Rossi, Noah Meyer, Pedro Alvarez), then Dmitri Volkov at 2 and two at 1; APAC runs 5 with its own tie (Farid Nasser and Hiro Tanaka at 3); US is two deep (Emma Wilson 17, Jamal Wright 2); LATAM is one (Bruno Silva, 2). The tie policy is the argument: shared rungs with the gap that follows, or compressed rungs with none.",
      ask: "Return every relationship with its market, cycle count and in-market rank, ordered by market then rank, deepest book on top within each market.",
      template:
        "SELECT c.region AS market,\n       c.name AS relationship,\n       COUNT(o.id) AS cycles,\n       {1}() OVER ({2} BY c.region ORDER BY COUNT(o.id) {3}) AS cycle_rank\nFROM customers c\nJOIN orders o ON o.customer_id = {4}\nGROUP BY c.id\nORDER BY {5}, cycle_rank, cycles DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the rung function",
          why: "RANK shares rungs and then skips: the EU three-way tie at 4 cycles reads 3, 3, 3 and Dmitri's 2 lands on rank 6 — the gap IS the tie policy. DENSE_RANK compresses the same block to 3, 3, 3, 4; ROW_NUMBER splits peer relationships arbitrarily by scan order.",
        },
        {
          answer: "PARTITION",
          kind: "keyword",
          label: "the market restart",
          why: "PARTITION BY c.region restarts the ladder inside each market — EU's rank 1 (Alice Chen, 24 cycles) and APAC's rank 1 (Grace Kim, 14) are different relationships. Without the restart the ladder runs 1-to-16 across the platform and every market's leader below Alice disappears from the top of the deck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-book-first direction",
          why: "ORDER BY COUNT(o.id) DESC crowns each market's leader on rank 1: Alice 24 in EU, Emma 17 in US, Grace 14 in APAC. ASC would crown the 1-cycle relationships — Olivia Brown leading EU is a bug report, not a leaderboard.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the join key",
          why: "The join is o.customer_id = c.id — every cycle attaches to the relationship that owns it, all 103 survive, and GROUP BY c.id gives one row per relationship. o.id would marry each cycle to the cycle whose row number matches its customer id, silently re-forming the ladder around nonsense pairs.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market-first sort",
          why: "ORDER BY c.region groups the deck by market — APAC, EU, LATAM, US — before cycle_rank breaks order inside each block. Sorting by name scatters marketmates across the page; sorting by cycles flattens the ladder into one global list where rank 1 means the platform, not the market.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "o.id", "ASC", "SUM", "AVG"],
      walkthrough:
        "One join, one fold per relationship, one window partitioned by market. The join attaches all 103 cycles to their relationships, GROUP BY c.id folds them to 16 rows, and RANK() OVER (PARTITION BY c.region ORDER BY COUNT(o.id) DESC) restarts the ladder in each market: EU reads Alice 24 (1), Chloe 5 (2), the three-way 4-tie (3, 3, 3), Dmitri 2 (6 — the skip the tie forces), then the 1-cycle pair (7, 7); APAC reads Grace 14 (1), Maya 13 (2), Keiko 4 (3), then the two 3s sharing rank 4; US reads Emma 17 (1), Jamal 2 (2); LATAM reads Bruno 2 (1). ORDER BY c.region, cycle_rank, cycles DESC lays the deck out market by market. The distractors each break differently: DENSE_RANK deletes the EU gap (Dmitri reads 4, not 6 — a different tie policy masquerading as a tie-break); ROW_NUMBER splits the peer ties by scan order, so Isabella, Noah and Pedro land on 3, 4, 5 in whatever order the engine scanned them; o.id in the join key marries cycles to row numbers and the ladder re-forms around nonsense; ASC crowns the 1-cycle relationships; SUM and AVG in the rung slot are syntax errors, and o.id or ASC in the sort slot reorders the deck into a shape the market review can't read. The depth read is the point: EU's bench runs eight deep with a mid-table pileup, US is two deep, LATAM is one — concentration the platform ladder would hide.",
    },
    {
      id: "cs-usbank-3",
      tier: "medium",
      topic: "s7",
      universe: "month-close",
      title: "The settlement coverage census",
      brief:
        "U.S. Bank month-close brief on the storefront db: finance classifies every statement by rail evidence — legs summed per statement, then bucketed exact / partial / none in ONE pass, footing to 28 or the pack does not ship. Probed facts: 21 statements settle to the cent (65,612.00 billed, 65,612.00 settled — void-but-settled #11 at 925.00 folds IN by construction), 6 statements never collected (15,217.00 billed, zero settled — including paid-status #28 at 1,756.00 whose zero legs make it a finding, not a dunning item), and 1 partial (#25: 4,000.00 of 6,148.00 billed, a 2,148.00 shortfall). Classification reads legs, not labels: the status column is a claim, the payments table is the ledger of record. The board reads biggest bucket first.",
      ask: "Return each coverage bucket with its statement count and billed dollars to 2 decimals, biggest bucket first — exact where legs match the bill, none where no leg exists, partial otherwise.",
      template:
        "WITH legs AS (\n  SELECT invoice_id,\n         SUM(amount_cents) AS settled_cents\n  FROM payments\n  GROUP BY invoice_id\n)\nSELECT CASE\n         WHEN l.invoice_id IS {1} THEN 'none'\n         WHEN l.settled_cents = i.{2} THEN 'exact'\n         ELSE 'partial'\n       END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / {3}, 2) AS billed\nFROM invoices i\nLEFT JOIN legs l ON l.invoice_id = i.id\nGROUP BY coverage\nORDER BY statements {4};",
      slots: [
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg test",
          why: "Statements with no legs leave the LEFT JOIN payload NULL, and NULL needs the IS test: l.invoice_id IS NULL catches the 6 never-collected statements. l.invoice_id = NULL evaluates to NULL for every row — the none bucket empties and the census stops footing to 28.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the billed column",
          why: "Exact means settled legs equal the bill: l.settled_cents = i.amount_cents — 21 statements, 65,612.00 both sides. i.id in that slot compares money against an id: nothing matches, every leg-carrying statement re-bands to 'partial', and the exact bucket reads zero.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Statements carry INTEGER cents — billed prints only after amount_cents / 100.0: 6,561,200 cents reads 65,612.00. Divide by 10.0 and every figure inflates tenfold; the board quotes 656,120.00 and stops reconciling with the 86,977.00 statement book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The board opens on the 21-statement exact bucket — the healthy core — then the 6-statement none bucket the dunning queue works, then the 1-statement partial with its 2,148.00 shortfall. ASC opens on the single partial statement and buries both the core and the queue.",
        },
      ],
      distractors: ["0", "id", "10.0", "ASC"],
      walkthrough:
        "Fold legs to statement grain first, then classify once. The legs CTE sums each statement's settlement legs to one settled_cents row — pre-aggregation is the grain discipline that stops the five two-leg statements from double-counting. The outer SELECT LEFT JOINs the fold to the statement book and CASE-classifies: no leg row at all is 'none' (6 statements, 15,217.00 billed), legs equal to the bill is 'exact' (21 statements, 65,612.00 both sides — void-but-settled #11 folds in because the money matches, paid-status #28 folds out because its zero legs land it in 'none'), anything between is 'partial' (#25, 6,148.00 billed against 4,000.00 settled). The buckets read 21 + 6 + 1 = 28 by construction. The distractors each break differently: 0 in the no-leg test matches nothing — ids start at 1 — so the none bucket reads zero and the 15,217.00 exposure vanishes from the census; id in the billed slot compares dollars to ids and empties the exact bucket; 10.0 inflates every billed figure tenfold; ASC opens the board on the one-statement partial bucket. Classify at leg grain, print the billed cents over one hundred, and the buckets must foot to 28 — that is the coverage census.",
    },
    {
      id: "cs-usbank-4",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The rails-by-month census",
      brief:
        "U.S. Bank settlement brief on the storefront db: treasury reads the rails mix month by month — card legs (merchant/POS acquiring traffic) beside wire legs (corporate settlement), counts and dollars in ONE pass, because the mix between rails is a managed number and two queries are two chances to disagree. Probed facts: 27 settlement legs land across 13 months (2024-02 to 2025-02 — no legs in 2024-01): card 16 legs for 37,364.00, wire 11 legs for 32,248.00; the busiest months carry 3 legs (2024-03, 2024-08, 2024-09, 2024-12, 2025-01); February 2024 opens the feed with a single card leg worth 2,430.00, and 2025-02 closes with 1 card leg plus a 4,000.00 wire (the partial statement's second payment). Five statements ride both rails in one cycle — the per-month census counts legs, not statements, so those split plans land on both sides of the mix.",
      ask: "Return each month with its card-leg count, wire-leg count, card dollars to 2 decimals and wire dollars to 2 decimals, chronological.",
      template:
        "SELECT STRFTIME({1}, paid_on) AS month,\n       COUNT(*) FILTER (WHERE method = {2}) AS card_legs,\n       COUNT(*) FILTER (WHERE method = 'wire') AS wire_legs,\n       ROUND(SUM(CASE WHEN method = 'card' THEN {3} ELSE 0 END) / 100.0, 2) AS card_dollars,\n       ROUND(SUM(CASE WHEN method = 'wire' THEN amount_cents ELSE 0 END) / 100.0, 2) AS wire_dollars\nFROM payments\nGROUP BY month\nORDER BY month {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key",
          why: "The spine key must carry the year: '%Y-%m' gives 13 distinct months from 2024-02 to 2025-02. '%m' alone merges February 2024 into February 2025 (2,430.00 + 3,076.00 into one '02' row) — the census prints 12 rows and every year-boundary month is fiction.",
        },
        {
          answer: "'card'",
          kind: "keyword",
          label: "the acquiring rail literal",
          why: "Card is the acquiring rail: method = 'card', 16 legs for 37,364.00. 'wire' in this slot makes both leg columns read the corporate rail (11 legs) and the card column disappears from the mix; 'CARD' matches nothing — the stored values are lowercase, and the silent zero hides the rail.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the card-money fold",
          why: "Card dollars are SUM over the leg cents filtered to the card branch — the ELSE 0 keeps wire legs from polluting the card column. Drop the CASE and SUM(amount_cents) folds both rails into the card column; swap in a text literal and the fold collapses to 0.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A rails-mix trend reads oldest first: February 2024's single 2,430.00 card leg opens the feed and 2025-02's 4,000.00 wire closes it. DESC walks the mix backwards and every quarter-over-quarter argument about acquiring growth reads inverted.",
        },
      ],
      distractors: ["'%m'", "'wire'", "quantity", "DESC", "'%d'"],
      walkthrough:
        "One scan over the settlement legs, two FILTER branches, two CASE folds. STRFTIME('%Y-%m', paid_on) buckets the 27 legs into 13 monthly rows; COUNT(*) FILTER (WHERE method = 'card') counts acquiring legs beside its wire twin; the CASE folds sum each rail's cents and the /100.0 read prints dollars — February 2024 opens at 1 card leg / 2,430.00, the busy months carry 3 legs, and 2025-02 closes at 1 card leg / 1 wire leg / 3,076.00 / 4,000.00. Foot the columns and you get the managed mix: 16 card legs for 37,364.00 against 11 wire legs for 32,248.00 — card leads on count AND dollars, but wire's average leg is bigger (2,931.64 against 2,335.25), which is exactly the nuance the monthly mix exists to show. The distractors each break differently: '%m' merges the two Februarys and the census loses a row; 'wire' in the card slot makes both rail columns count corporate legs; quantity is a no-such-column error before the first bucket forms; DESC walks the trend backwards; '%d' explodes the spine to day grain. Census in one pass, both rails on one slide, dollars over one hundred — that is the rails read.",
    },
    {
      id: "cs-usbank-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The dunning anti-join",
      brief:
        "U.S. Bank month-close brief on the storefront db: before any dunning letter goes out, finance refreshes its anti-join — statements that NO settlement rail ever touched. Probed facts: exactly 6 statements worth 15,217.00 in total have zero settlement legs — INV-2025-024 Emma Wilson US open 4,937.00 due 2025-02-07 (the biggest exposure), INV-2025-026 Liam O'Brien EU open 3,562.00, INV-2025-027 Isabella Rossi EU open 2,794.00, INV-2025-028 Hiro Tanaka APAC paid 1,756.00, INV-2024-021 Chloe Dubois EU open 1,295.00 and INV-2024-018 Pedro Alvarez EU open 873.00 (the oldest, due 2024-11-28). The queue reads biggest owed first. Two facts get walked line by line in every review: #28 is paid-STATUS with zero legs — a status that lies, a finding rather than a dunning item — and the EU market carries three of the six, so the batch starts there. Statements that DO carry a leg (even void-but-settled #11 at 925.00) are reconciliations, not dunning.",
      ask: "Return each never-collected statement with its number, relationship, market, status claim, due date and owed amount in dollars to 2 decimals, biggest owed first.",
      template:
        "SELECT i.number AS statement,\n       c.name AS relationship,\n       c.region AS market,\n       i.status AS claim,\n       i.due_on,\n       ROUND(i.amount_cents / {4}, 2) AS owed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = {1}\nWHERE p.id {2} {3}\nORDER BY owed DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "The LEFT JOIN must ride the statement's own id: ON p.invoice_id = i.id keeps every statement and attaches its legs, leaving NULL payloads where no rail ever touched. c.id would join legs to the CUSTOMER's id — a pairing that means nothing on this book and empties the queue.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the unmatched test",
          why: "Unmatched legs leave p.id NULL, and NULL needs the IS test: p.id IS NULL selects exactly the never-collected rows. p.id = NULL evaluates to NULL for every row — even the ones you want — and the queue silently empties to zero rows.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg marker",
          why: "The anti-join's answer set is the NULL payload from the LEFT JOIN — statements with zero settlement legs. NOT NULL here flips to the opposite queue: every statement a rail HAS touched, the reconciliation list including void-but-settled #11, not the dunning list.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Statements carry INTEGER cents — the house read is amount_cents / 100.0, printing Emma Wilson's 493,700 cents as 4,937.00. Divide by 10.0 and every figure inflates tenfold; the dunning letter quotes 49,370.00 and the batch stops reconciling with the 15,217.00 queue total.",
        },
      ],
      distractors: ["NOT NULL", "=", "c.id", "10.0"],
      walkthrough:
        "A LEFT JOIN anti-join, then a cents-safe fold. Join statements to relationships INNER — every statement has an owner — then LEFT JOIN payments ON p.invoice_id = i.id: statements with legs carry their payment rows, the never-collected six carry NULL payloads, and WHERE p.id IS NULL keeps exactly those. Six statements survive, biggest first because the ORDER BY owed DESC is hardcoded: Emma Wilson's INV-2025-024 at 4,937.00 opens the batch, down to Pedro Alvarez's 873.00 due 2024-11-28, the oldest. The pad is INTEGER cents, so owed = ROUND(amount_cents / 100.0, 2) — 493,700 cents prints 4,937.00, 87,300 prints 873.00, and the six rows cross-foot to 15,217.00, the number finance quotes in every review. The rows that make it interesting: INV-2025-028 is paid-STATUS with zero legs — a status that lies, so dunning proceeds on legs, not labels, and #28 goes to the findings list instead of the letter run; and the EU market holds three of the six (3,562.00 + 2,794.00 + 1,295.00), which is where the batch starts. The distractors each break differently: c.id in the key slot pairs legs to customer ids — no customer id in this book lacks a payment, so the queue empties; = in the test slot turns the WHERE into p.id = NULL, which is NULL for every row — the classic anti-join kill; NOT NULL in the marker slot flips to the settled list, void-but-settled #11 included; 10.0 in the divisor inflates every figure tenfold and breaks the 15,217.00 cross-foot. LEFT JOIN for coverage, IS NULL for the miss, cents over one hundred, biggest first — that is the dunning refresh.",
    },
    {
      id: "cs-usbank-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The statement-cycle spine",
      brief:
        "U.S. Bank regional brief on the storefront db: the quarterly business review opens with the statement-cycle spine — every month of the 14-month cycle book (2024-01 to 2025-02) with its month-over-month step, so seasonality arguments start from one query. Probed facts: the book opens at 3,731.97 in 2024-01 (8 cycles) with a NULL step — the baseline row, not a zero; it sags -122.33 into February (3,609.64), troughs at 1,193.86 in July on a -853.57 step, then jumps +1,158.21 into August's 2,352.07; the steepest single step is -1,326.87 into 2024-11 (1,648.80); and the walk closes at 2,390.53 in 2025-02 (7 cycles) on a +721.03 step. The month key is the '%Y-%m' STRFTIME format — the '%m' shortcut merges January 2024 (3,731.97) into January 2025 (1,669.50) and silently deletes a month from the spine. The deck reads oldest month first, and the first row's NULL step is quoted as-is in the appendix, never coalesced to zero.",
      ask: "Return the monthly spine with cycle count, booked dollars to 2 decimals, the previous month's value beside it, and the month-over-month step to 2 decimals, oldest month first.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({3}, created_at) AS month,\n         COUNT(*) AS cycles,\n         ROUND(SUM(total), 2) AS booked\n  FROM orders\n  GROUP BY month\n), steps AS (\n  SELECT month,\n         cycles,\n         booked,\n         {1}(booked) OVER (ORDER BY month) AS prev_booked\n  FROM spine\n)\nSELECT month,\n       cycles,\n       booked,\n       prev_booked,\n       ROUND(booked - prev_booked, 2) AS step\nFROM steps\nORDER BY month {2};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking offset",
          why: "A step is this month minus LAST month: LAG(booked) OVER (ORDER BY month) reaches back one row and leaves the first row NULL — the baseline by definition. LEAD reaches forward and flips every sign; SUM(booked) OVER (…) builds a running total, a different board entirely.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first spine direction",
          why: "The walk reads chronologically — 2024-01's 3,731.97 opens the deck and the 2025-02 close lands last, so the trough and rebound read left to right. DESC tells the same story backwards and puts the NULL baseline at the bottom, where nobody expects a baseline.",
        },
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month key format",
          why: "The spine key must carry the year: '%Y-%m' gives 14 distinct months from 2024-01 to 2025-02. '%m' alone merges January 2024 into January 2025 (3,731.97 + 1,669.50 into one 5,401.47 '01' row) — the spine prints 13 rows, every LAG step across the year boundary is fiction, and nothing errors.",
        },
      ],
      distractors: ["LEAD", "DESC", "%m", "SUM"],
      walkthrough:
        "Two stages: fold the calendar, then step it. The spine CTE folds all 103 cycles into 14 monthly rows keyed by STRFTIME('%Y-%m', created_at) — the year in the key is what keeps January 2024 and January 2025 apart — carrying cycle counts (8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7 — foot to 103) beside booked dollars. The steps CTE adds LAG(booked) OVER (ORDER BY month): each month now carries its predecessor, 2024-01's prev_booked is NULL because there is no December 2023 to reach back to, and the outer SELECT prints the step as ROUND(booked - prev_booked, 2) — -122.33 into February, the -853.57 slide into the July trough at 1,193.86, the +1,158.21 August rebound to 2,352.07, the -1,326.87 November slump, and the +721.03 close at 2,390.53. The first row's NULL is quoted, never coalesced: a zero would make the opening month look like it lost 3,731.97 overnight. The '%m' trap deserves the horror story it gets — the query still runs, the spine shrinks to 13 rows, and every step across the December-January boundary compares a month against a merged Frankenstein key. The distractors each break differently: LEAD flips every sign and moves the NULL to the last row; SUM builds a cumulative running total instead of steps; DESC walks the spine backwards with the baseline at the bottom; '%m' merges the two Januaries and deletes a month from the board. Fold on the year-aware key, step with LAG, read oldest first, and quote the NULL as the baseline it is.",
    },
    ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Product-line revenue at SKU grain — fold line items per deposit/card SKU and rank. The branch-market product-mix read re-cuts this fold every cycle." },
    { slug: "sales-analysis-i", why: "SKU revenue beside units sold — the product-line census that shows a family can lead units (Accessories, 121) and trail dollars (3,294.29). Same two-column fold, bank flavor." },
    { slug: "article-views-ii", why: "Two-grain census per period — events beside distinct actors. The branch-market read is the same shape: cycles beside relationships, EU 45-from-8 against US 19-from-2." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor — which markets carry at least 10 cycles (EU 45, APAC 37, US 19; LATAM's 2 drops). The market-review gate is exactly this predicate." },
    { slug: "find-total-time-spent-by-each-employee", why: "Duration folds per entity — the cycle-clock muscle behind created_at to shipped_at (82 stamped cycles, 2.98-day average). Aggregate the deltas, state the population." },
    { slug: "list-the-products-ordered-in-a-period", why: "Date-filtered fold — the month-bucket calendar finance reads at close (2024-01 to 2025-02, 14 buckets). Same SUBSTR created_at spine, same period discipline." },
    { slug: "uber-first-transaction", why: "First touch per relationship — the account-opening read that anchors every cohort. MIN over a timestamp window, one row per relationship, no fan-out." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax with a subquery guard — which relationship leads each market (Alice Chen's 24 cycles in EU; Emma Wilson's 17 in the US's two-deep book). The top-of-ladder read is this query." },
    { slug: "combine-two-tables", why: "Relationships LEFT JOINed to cycles — the whitespace read. A relationship with no cycle is dormancy; a cycle with no relationship is corruption. Choosing the join type IS the business statement." },
    { slug: "confirmation-rate", why: "COALESCE on sparse attributes — contact and status fields arrive with gaps, and a NULL-folded rate beats a silently-shrunk one. Same discipline the no-payment bucket needs." },
    { slug: "employees-with-missing-information", why: "The missing-records anti-join — relationships missing attributes versus cycles missing legs. Two error modes, one shape: surface the gap, don't drop the row." },
    { slug: "number-of-rich-customers", why: "The threshold census — relationships above a lifetime line (63.5% of the book rides 3,000-plus relationships). COUNT over a filtered fold with the denominator stated." },
    { slug: "countries-you-can-safely-invest-in", why: "Population-conditional rates — qualify the population first, then compute the share. The settlement-coverage discipline (21 of 28 to the cent) in practice form." },
    { slug: "chargeback-rate-ranking", why: "Merchant-acquiring flavor — dispute rates ranked by counterparty with HAVING-guarded denominators. The acquiring desk reads exactly this shape on card-leg traffic." },
    { slug: "duplicate-charge-pairs", why: "Self-join on near-identical money events — the duplicate-leg hunt: two hits, same statement, one of them shouldn't exist. Five statements ride two legs, so grain discipline is non-negotiable." },
    { slug: "structuring-detection", why: "Branch cash compliance — amounts pattern-matched against a reporting threshold with HAVING guards. The regional bank's quiet surveillance read, and a HAVING-floor drill." },
    { slug: "ar-aging-schedule", why: "The 15,217.00 never-collected queue aged into 30/60/90 buckets over due dates against uniform 30-day terms. This is the dunning letter's spine — the aging fold finance re-runs weekly." },
    { slug: "daily-balance-interest", why: "Deposit interest accrues on daily balances in INTEGER cents — the per-day fold with the /100.0 rule, drilled on the same cents-safe discipline as the settlement legs." },
    { slug: "settlement-fails-aging", why: "Legs that missed their value date age into fails buckets — T+2 style aging over paid_on, the back-office beat behind the 28.4-day settlement clock and its 84-day tail." },
    { slug: "top-percentile-fraud", why: "Acquiring fraud concentrates in the tail: percentile screens, not averages, are how the Elavon desk hunts suspicious card traffic — the same tail logic the z-score screen generalizes." },
    { slug: "amount-anomaly-zscore", why: "Leg z-scores against the 2,578.22 average leg: the outlier read that flags a 2-leg statement for a second look. The acquiring desk's statistical spine." },
    { slug: "portfolio-concentration-hhi", why: "A concentration index over the 34,833.28 cycle book: 63.5% rides the 3,000-plus cohort, and HHI turns that story into one defensible number the market review can trend." },
    { slug: "portfolio-weights", why: "Each relationship's share of the book via window partitions — the concentration board's base read, computed over the same ladder the market-depth deck ranks." },
    { slug: "rolling-7d-actives", why: "Rolling weekly counts of legs moving per rail — the settlement pulse read that separates an acquiring surge from a one-day spike. Window frames drilled properly." },
    { slug: "cohort-repeat-revenue", why: "Repeat cycles by opening-quarter cohort — relationships that came back after their first statement cycle, tracked on the same 14-month spine the review reads." },
    { slug: "winback-recovery", why: "Dormant relationships whose cycle count aged out — the whitespace census that decides which branch market gets the winback visit. Anti-join shaped, census proved." },
    { slug: "customer-order-frequency", why: "Cycle cadence per relationship with HAVING gates — the frequency read that decides statement-cycle terms and flags relationships going quiet between bills." },
    { slug: "the-most-recent-three-orders", why: "Latest cycles per relationship — the recency snapshot the branch banker pulls before a call. Window ranking with a stated tie policy, three rows deep." },
    { slug: "monthly-transactions-i", why: "Month-by-month transaction census with chargebacks beside them — the rails-month fold treasury reads, count and money in one pass over INTEGER cents." },
    { slug: "expected-credit-loss", why: "Provisioning folds over the statement book: exposure bucketed by stage with a weighted loss fold. The card book's allowance read, in cents-safe SQL." },
    { slug: "prepayment-detection", why: "Early payoffs on the commercial book — settlements landing well inside the 30-day terms, detected as minimums over the issue-to-payment clock. The treasury desk's delight screen." },
    { slug: "fx-exposure-report", why: "Cross-border legs grouped by currency pairing with net exposure per market — the corporate-payments treasury read, folded at leg grain with the rails census's two-grain discipline." },
  ],
};
