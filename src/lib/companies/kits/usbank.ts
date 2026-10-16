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
    "Preparation strategy: the pools file carries no U.S. Bank section — **0 tagged rows** — so every topic slug and all sixteen problems here are **theme-curated** to the kit's known screen shapes: branch-market censuses, rails folds, coverage CASE arms, tie-heavy in-market ladders, settlement clocks and cents-safe money math. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:branch-market census} the regional review opens with, the other rebuilds the {violet:in-market relationship ladder} the market-depth deck is built on. The bar to clear: *state the grain and the denominator before you compute anything* — then make every fate census reconcile to 103 and every coverage census reconcile to 28.",
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
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Rails discipline (card vs wire)",
      why: "Settlement legs arrive on two rails with different meanings: card legs are merchant/POS acquiring traffic (16 legs, 37,364.00) and wire legs are corporate settlement (11, 32,248.00). Rail folds are conditional counts and sums over a method column, and the mix between rails is itself a managed number — five statements ride both rails in one cycle, so per-statement folds must pre-aggregate before they roll up.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "count-salary-categories"],
    },
    {
      name: "Statement settlement coverage",
      why: "The coverage census classifies every statement at leg grain: 21 settle to the cent, 6 never collected, 1 partial. The trap is folding before classifying — a statement with two legs must have its legs summed first — and the second trap is trusting labels: paid-status #28 has zero legs and voided #11 received its 925.00, so classification reads legs, not status.",
      slugs: ["products-worth-over-invoices", "immediate-food-delivery-i", "weather-type-in-each-country"],
    },
    {
      name: "Settlement clocks",
      why: "The settlement clock measures issue-to-payment days over the paid book that actually carries legs — 20 statements averaging 28.4 days against uniform 30-day terms, fastest 13, slowest 84. That is julianday arithmetic with a stated population, and the follow-up is always the denominator: which statements earned a settlement day, and which ones only claim one.",
      slugs: ["average-time-of-process-per-machine", "immediate-food-delivery-ii", "second-day-confirmation"],
    },
    {
      name: "In-market leaderboards",
      why: "The market-depth deck ranks relationships inside each market, and ties are guaranteed: EU has a three-way tie at 4 cycles (Isabella Rossi, Noah Meyer, Pedro Alvarez) and APAC a two-way tie at 3. RANK shares rungs and skips (the next EU relationship lands on rank 6), DENSE_RANK shares rungs without gaps, ROW_NUMBER splits peers arbitrarily — a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Tier bands with CASE",
      why: "Bank reads band everything: opex categories, statement sizes, rail arms. CASE arms must be exhaustive and ordered — a hole in the CASE is a hole in the census, and a reordered WHEN quietly re-bands the base. The dunning queue is banded the same way: five no-payment statements from 873.00 to 4,937.00, each one an arm that must reconcile to the 6-statement total.",
      slugs: ["triangle-judgement", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month spine (2024-01 to 2025-02) is the close deck's home turf: booked dollars walk from 3,731.97 down to the 1,193.86 July trough, jump +1,158.21 into August, and the cancelled column spikes in the same months (July 2, November 2). LAG drives the walk; the first row's NULL is the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "year-on-year-growth-rate", "game-play-analysis-i"],
    },
    {
      name: "Coverage set algebra",
      why: "Exception lists are anti-joins: which statements have no settlement legs (6, worth 15,217.00), which relationships never cycled. On this db the relationship anti-join returns a confident zero — all 16 relationships appear in the cycle table — and proving a zero is the analyst's job, because a confident zero you did not verify is how whitespace reports die in review.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets delivered, in-flight, pending and withdrawn in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (arms sum to COUNT(*)) is the correctness argument reviewers listen for.",
      slugs: ["active-businesses", "user-activity-for-the-past-30-days-ii", "create-a-session-bar-chart"],
    },
    {
      name: "Concentration & share math",
      why: "Concentration is the regional bank's risk lens: 63.5% of the booked book rides relationships spending 3,000-plus lifetime (71.2% above 2,000), and shares are ratios with stated denominators. The 100.0 multiplier goes BEFORE the division or integer truncation flattens every share to zero — and chargeback-rate reads at the acquiring desk use the same honest-denominator shape.",
      slugs: ["percentage-of-users-attended-a-contest", "queries-quality-and-percentage", "card-launch-success"],
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
  ],
};
