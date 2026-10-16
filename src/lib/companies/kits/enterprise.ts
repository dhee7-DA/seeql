// Enterprise — Wave-11 (Task 102), mobility domain, 0 tagged rows — theme-curated; facts from scripts/company-facts.md.
// Neighborhood-branch car rental + insurance-replacement SQL: the storefront db read as a branch-market
// sandbox — customers are corporate/retail accounts (region = branch market), orders are rental agreements
// per branch (delivered = returned-and-billed 52, shipped = on-rent with shipped_at as the dispatch stamp 30,
// pending = reserved-awaiting pickup 14, cancelled = no-show 7), order_items = rental lines (quantity =
// rental days, unit_price = the daily rate the line locked), products = bookable vehicle classes (category =
// the fleet family, price = day rate, stock = branch pool), suppliers = fleet partners per branch market,
// invoices/payments = statement cycles on card-wire rails (wire = the insurance-replacement/corporate
// direct-bill legs, card = retail walk-ins), expenses = branch opex, ledger_entries = the GL. Finance tables
// store INTEGER cents — the dollar read is amount_cents / 100.0; orders.total and order_items.unit_price are
// REAL dollars already. Angle kept DISTINCT from hertz (counter-to-return fleet rotation + loyalty ladder)
// and sixt (premium turnover + station P&L + damage register): Enterprise's read is BRANCH-grain economics
// and repeat-ACCOUNT depth — the buyers-per-depth ladder (2 one-time / 3 at two / 2 at three / 4 at four /
// 1 at five, corporate tier at 13/14/17/24) maps corporate accounts perfectly, and the replacement book
// rides the wire rails (11 legs / 32,248.00 vs card 16 / 37,364.00, 5 split-rail statements).
// Pool provenance: company-pools.md carries NO Enterprise section (0 tagged rows, grep-verified) — all 10
// topic slug sets and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows)
// and say so in brief P4.
// Facts source: scripts/company-facts.md (probed 2026-10-12, incl. the wave-8+9 canonicalized cells). The
// cs-enterprise-2 rail-bucket cells were additionally probe-verified live against db/custom.db (readonly):
// split-rail 5 statements / 24,940.00 billed, card-only 11 / 24,894.00, wire-only 6 / 21,926.00, no legs
// 6 / 15,217.00 (foots to the AR line; split ids 1/5/12/19/22 match the facts' split-payment list; #11's
// single 925.00 leg is a CARD leg, so void-but-settled folds into card-only).
// Every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: enterprise is NOT yet in registry COMPANY_META — wire id
// "enterprise", domainId "mobility", name "Enterprise", tagline "Neighborhood branches, corporate accounts:
// branch P&L, replacement billing", accent "text-zinc-300" to match this header exactly (accent grepped:
// held only by asos in ecom; unused across all 23 mobility siblings).

import type { CompanyKit } from "../types";

export const enterpriseKit: CompanyKit = {
  id: "enterprise",
  domainId: "mobility",
  name: "Enterprise",
  tagline: "Neighborhood branches, corporate accounts: branch P&L, replacement billing",
  accent: "text-zinc-300",

  brief: [
    "**Enterprise** is the rental network that put a counter on every corner — neighborhood branches where the car comes to the customer, plus the insurance-replacement niche that keeps households mobile while the claim settles. The unit of analysis here is the branch market, not the airport: every market books its own agreements, runs its own fleet partners and carries its own P&L. This kit maps the storefront db onto that world: 16 customer rows are corporate and retail accounts (region = branch market), 103 orders are rental agreements worth **34,833.28**, 251 order_items rows are rental lines (quantity = rental days, unit_price = the locked daily rate), 16 products are bookable vehicle classes across seven fleet families, and 6 suppliers are the fleet partners per market. Status map: delivered = {emerald:returned-and-billed} (52, 50.5%), shipped = {sky:on-rent} (30, 29.1%), pending = reserved (14), cancelled = {rose:no-show} (7, 6.8%).",
    "The data org is branch-led: a market-ops pod reading per-branch utilization, a corporate-account desk owning the repeat book, and a small billing team running the replacement-money rails. Two reads are signature. First, **branch intensity**: EU books 45 agreements from 8 accounts (5.6 per account) while the US books 19 from just 2 (9.5) — the platform mean is 6.44 agreements per account and *exactly four national accounts clear it*. Second, the **repeat-depth ladder**: 2 accounts rented once, 3 twice, 2 three times, 4 four times, 1 five times — then the corporate tier at 13, 14, 17 and 24 agreements, with the deepest single account worth {amber:7,262.35} of the 34,833.28 book. Concentration is the same story in dollars: 63.5% of revenue rides accounts spending 3,000-plus lifetime (71.2% above 2,000).",
    "Money sits one layer down, and it is where Enterprise differs from every airport-counter sibling: the replacement book bills insurers and corporate accounts on statement cycles settled over {violet:wire} (11 legs, 32,248.00) while retail walk-ins settle on {orange:card} (16 legs, 37,364.00) — and 5 statements ride both rails. Statements carry INTEGER cents, so the dollar read is `amount_cents / 100.0`. The close reads 21 statements settled to the cent, 1 partial (4,000.00 of 6,148.00) and 6 never-collected worth 15,217.00 — including paid-status #28 with zero legs behind it (1,756.00) and the void-but-settled #11 (925.00). Interview style is census-then-denominator: *the interviewer asks 'do reservations count in your dispatch clock?' before you write a line*, and every fate census must reconcile to 103 by construction.",
    "Preparation strategy: the pools file carries no Enterprise section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's screen shapes: two-grain branch censuses, repeat-depth ladders, dispatch clocks, CASE day-rate bands, rail set algebra and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:deep-account book} the corporate desk re-cuts weekly, the other rebuilds the {violet:replacement-rail census} billing reads at every close. The bar to clear: *state the account grain and the denominator before you compute anything* — then make every census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**07:50 —** The day starts with the branch P&L refresh. A market-ops analyst opens the utilization board before branches staff the ready line: did overnight reservations land, does any on-rent agreement lack a dispatch stamp, does the one-pass fate census reconcile — 52 returned-and-billed + 30 on-rent + 14 reserved + 7 no-show = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the dispatch clock drifts off the **2.98-day** booking-ahead norm — APAC runs 2.93, LATAM 3.5 — the ready-line queue gets re-cut before the corporate desk's morning read ships, because a car on the ready line is the only car earning nothing at all.",
    "**11:45 —** Midday is the repeat-book read. The corporate-account desk wants the depth ladder re-cut — the four national accounts at 13, 14, 17 and 24 agreements beside a retail tail that tops out at 5 — with the four accounts tied at depth 4 handled honestly (*shared rungs, named policy*); a regional VP wants agreements per account beside account counts (EU 45-from-8 versus US 19-from-2); fleet ops wants partner mix — the busiest family turning **121 rental days over 54 agreements** while the money family books {amber:11,744.01}. Each ask is a join, a conditional aggregate and one judgment call about account grain. The analyst writes the query twice — *once to answer, once with the grain spelled out so the number survives the branch-review argument*.",
    "**16:10 —** The afternoon tilts toward the replacement money. The rail census refreshes first — wire legs 11 / 32,248.00 against card 16 / 37,364.00, with **5 split-rail statements** flagged for the insurer packet — before billing sends a single replacement invoice. The coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) against the 6 never-collected worth 15,217.00, and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero legs (#28, 1,756.00). The day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Agreement book", what: "103 rental agreements worth 34,833.28, average 338.19 against a 25.47 to 1,088.44 spread. The branch P&L's top line — the spread is the corporate-versus-retail mix in one column." },
    { name: "Repeat-depth ladder", what: "2 accounts rented once, 3 twice, 2 three times, 4 four times, 1 five times, then the corporate tier at 13, 14, 17 and 24 agreements. The repeat-renter engine the corporate desk manages — exactly 9 accounts sit at depth 4-plus." },
    { name: "Branch intensity", what: "Agreements per account per branch market: EU 45 from 8 (5.6) versus US 19 from 2 (9.5), platform mean 6.44 with exactly four accounts above it. The broad-versus-concentrated read that decides where branches expand." },
    { name: "Replacement rail mix", what: "Wire legs 11 worth 32,248.00 (the replacement/corporate direct-bill book) against card legs 16 worth 37,364.00 (retail walk-ins), with 5 statements settling on both rails. Which rail paid is a billing-ops question before it is a finance one." },
    { name: "Dispatch clock", what: "created_at to dispatch (shipped_at) over stamped agreements only: 82 of 103, 2.98-day average, range 2–4 — APAC fastest at 2.93, LATAM slowest at 3.5. The 14 reservations have no stamp yet: a population definition, not a cleanup job." },
    { name: "No-show share", what: "Cancelled agreements ÷ booked: 7 of 103 (6.8%), sliced by branch market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. Prices the reminder cadence and the no-show fee policy." },
    { name: "Branch opex", what: "36 expense lines footing to 25,416.00: Rent 14 lines / 16,800.00 (the neighborhood-branch footprint tax), Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00 — tying to the GL's operating_expenses balance." },
    { name: "Collections coverage", what: "21 statements settle to the cent (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against 30-day terms and a 28.4-day average settlement, fastest 13, slowest 84. The AR anti-join billing refreshes every close." },
  ],

  topics: [
    {
      name: "Two-grain branch censuses",
      why: "Agreements and accounts are different grains of the same join, and every branch census here reports both: EU runs 45 agreements from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is branch load and which is account coverage — is the habit being graded, because the ratio (5.6 versus 9.5) is the intensity read that drives branch expansion.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Repeat-account depth",
      why: "The depth ladder is Enterprise's corporate health read: 2 accounts at depth 1, 3 at 2, 2 at 3, 4 at 4, 1 at 5, then the national tier at 13/14/17/24. Every cohort, winback and account-review agenda starts from this fold, and the exactly-versus-at-least distinction (4 accounts at depth 4, 9 at 4-plus) is the classic ladder trap.",
      slugs: ["repeat-purchase-rate", "find-loyal-customers", "cohort-repeat-revenue"],
    },
    {
      name: "Agreement fate counting",
      why: "Every dispatch rate, no-show share and returned share is a conditional count over a status or timestamp, and the interviewer asks the denominator out loud — 'do the 14 reservations count in your base?'. The trap is calling an on-rent agreement returned: 30 versus 52 on this db, and the share flips by half.",
      slugs: ["percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "number-of-employees-who-met-the-target"],
    },
    {
      name: "Account-to-agreement joins",
      why: "Accounts carry region and created_at; agreements inherit the branch market through the join, and the join type decides who survives. An agreement without an account is corruption; an account without agreements is whitespace — though on this db the anti-join returns a confident zero (all 16 accounts appear), and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "employees-with-missing-information"],
    },
    {
      name: "Day-rate bands with CASE",
      why: "Vehicle classes are CASE-banded — the shelf runs 14.99 economy to 199.99 flagship, split 8 mid classes averaging 111.50 against 8 budget classes at 32.06 — with fixed edges the rate card publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the branch revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Depth gates & HAVING floors",
      why: "Account tiering is a group-level gate: which accounts carry at least N agreements, which branch markets carry at least N bookings. The floor lives in HAVING after the fold — WHERE cannot see a COUNT that has not formed — and the 13-agreement gate is exactly how the national-account tier gets isolated from the retail tail that tops out at 5.",
      slugs: ["classes-more-than-5-students", "managers-with-at-least-5-direct-reports", "find-users-with-high-token-usage"],
    },
    {
      name: "Dispatch clocks & month walks",
      why: "The booking-ahead clock (created_at to shipped_at, 82 stamped of 103, 2.98-day average) and the 14-month agreement spine (2024-01 to 2025-02) are the same date discipline: julianday arithmetic over a stated population, then LAG deltas where the first row is NULL by definition. The walk names the trough (1,193.86 in July) and the jump (+1,158.21 into August) — branch seasonality defended one delta at a time.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Rail & coverage set algebra",
      why: "Close packets stack populations — billed beside settled, wire beside card — and EXCEPT answers 'which billed statements never settled' with the direction AS the question: A-EXCEPT-B is not B-EXCEPT-A. UNION dedups whole rows silently, which makes it a correctness question, not a style one; the branch packet must add up or it does not ship.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "the-airport-with-the-most-flights"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets returned, on-rent, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the branch is calling for its board.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the branch world meets money, and every dollar read is amount_cents / 100.0. The coverage census (21 exact / 1 partial / 6 none) and the rail split (wire replacement book versus card retail) are one CASE away each, and the anomalies — #11 void-but-settled, #28 paid with no legs — are the row-level proof that status is a claim, not a ledger.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "enterprise-t1",
      q: "Your branch report joins accounts to rental agreements. When do you INNER and when do you LEFT — and what silently breaks if you filter an agreement column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins agreements to accounts: an agreement with no account row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from accounts: the accounts with no agreements ARE the answer, arriving with NULL agreement columns — on this db that anti-join returns a confident zero, because all 16 accounts appear in the agreement table somewhere, and proving that zero is itself the analyst's job. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. Enterprise's twist: an account with no agreements is not dirt, it is the branch-opening pipeline — an INNER JOIN deletes the prospect list exactly when the expansion team asks for it.",
      tag: "joins",
    },
    {
      id: "enterprise-t2",
      q: "The depth ladder runs 24, 17, 14, 13, 5 agreements, then FOUR accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account manager gets the renewal call first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment. On the corporate desk the policy IS the benefit: the depth ladder is the account-review agenda, and two accounts sharing a rung share the call.",
      tag: "windows",
    },
    {
      id: "enterprise-t3",
      q: "The census shows 103 agreements and 16 accounts; EU shows 45 agreements and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts agreement rows after the join — one row per agreement, so an account with 24 agreements contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 agreements collapse to 8 logos. Neither is wrong: agreements measure branch load, accounts measure installed base. The ratio — 5.6 agreements per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating, and the platform mean (6.44, with exactly four national accounts above it) is the gate the corporate desk actually uses. The trap that catches candidates is a third grain: join order_items for rental lines and COUNT(*) silently counts lines, not agreements — 251 of them — while SUM(quantity) counts rental days, 498. Saying 'one row per what?' for every COUNT is the habit the panel grades, because the branch P&L changes shape with each grain.",
      tag: "aggregation",
    },
    {
      id: "enterprise-t4",
      q: "shipped_at is NULL until the vehicle actually leaves the lot. What is your policy for the dispatch-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched agreements have a clock, so the report measures booking-ahead for the 82 of 103 agreements that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title; the 14 reservations are a population definition, not a cleanup job. Then mechanics: AVG ignores NULLs, so AVG over ALL agreements returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 reservations plus 7 no-shows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for cars still on the ready line and poisons the 2.98 baseline every branch alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what an Enterprise reviewer hunts for; state the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "enterprise-t5",
      q: "The branch review wants booked value per market for markets carrying at least ten agreements. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards on-rent, reserved and no-show rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-agreement floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to agreements versus to dollars. One more placement rule Enterprise screens love: the no-show share — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the share truncates toward zero; on this db it is the difference between APAC's 8.1 and a displayed 0. The strong answer places every filter by asking: is this a fact about one agreement, or about a market?",
      tag: "pipeline",
    },
    {
      id: "enterprise-t6",
      q: "WHERE depth > (SELECT AVG of per-account agreement counts) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and depth > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 16 accounts always produce a mean (6.4375 agreements per account, 6.44 rounded — exactly four national accounts clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each account to ITS market's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a market's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole replacement-account list empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "enterprise-t7",
      q: "The branch trend buckets agreements by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the branch trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when weekend renters book. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell a concrete branch story: the book opens at 3,731.97, troughs at 1,193.86 in July (2 no-shows that month), jumps +1,158.21 into August, then takes its steepest drop, -1,326.87, in November. Date discipline is branch discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "enterprise-t8",
      q: "Billing says a replacement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00 on a card leg) never appears in that anti-join — the two error modes are mirrors. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row. And the rail read matters here: wire legs (11, 32,248.00) carry the replacement and corporate direct-bill book, card legs (16, 37,364.00) the retail counter, 5 statements on both rails. Close culture: the GL trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "enterprise-mcq-1",
      prompt: "A rental agreement's status reads 'shipped'. In this kit's Enterprise stage map, what happened?",
      choices: ["On-rent — the dispatch stamp shipped_at has landed and the car is out", "Returned-and-billed — the agreement completed its cycle", "No-show — the renter never arrived", "Reserved — still awaiting pickup"],
      answer: 0,
      why: "The stage map is fixed: shipped = on-rent (30 of 103 agreements), with shipped_at as the dispatch stamp. The car is out and earning — but not yet returned and billed.",
      notes: [
        { choice: 1, why: "Returned-and-billed is 'delivered' — 52 agreements. Calling on-rent cars returned inflates the closed book before a single return posts." },
        { choice: 3, why: "Reserved is 'pending' — 14 agreements with no shipped_at yet. Pending is not on-rent and not no-show; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-2",
      prompt: "The repeat-depth ladder on this db: 2 accounts at depth 1, 3 at 2, 2 at 3, then 4 at 4, 1 at 5, and singles at 13, 14, 17, 24. How many accounts have EXACTLY 4 agreements?",
      choices: ["4 — the depth-4 rung holds four accounts", "9 — everyone with 4 or more", "1 — the ladder's fifth rung", "16 — every account rents at least once"],
      answer: 0,
      why: "The ladder reports accounts PER depth: the depth-4 rung carries exactly 4 accounts. The corporate tier above (13, 14, 17, 24) is one account each — 16 accounts total, 103 agreements.",
      notes: [
        { choice: 1, why: "9 is the at-least-4 cohort (4 at depth 4, plus the five singles at 5/13/14/17/24). Exactly-versus-at-least is the ladder's classic misread." },
        { choice: 2, why: "The depth-5 rung holds 1 account — that is a different rung of the same ladder. Rung membership, not the count above it, answers this question." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-3",
      prompt: "EU books 45 rental agreements from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts agreement rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 agreements per account — is the branch intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every agreement carries an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts branch markets, not accounts — a third grain nobody asked for. The census is agreements AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-4",
      prompt: "The insurance-replacement book bills insurers on statement cycles. Which payment rail carries it on this db, and what does the platform read?",
      choices: ["Wire — 11 legs worth 32,248.00", "Card — 16 legs worth 37,364.00", "Both equally — 5 legs each", "Neither — replacement billing sits in expenses"],
      answer: 0,
      why: "Wire is the replacement/corporate direct-bill rail: 11 legs, 32,248.00. Card (16 legs, 37,364.00) is the retail walk-in counter. Five statements ride BOTH rails — the split-rail set.",
      notes: [
        { choice: 1, why: "Card is the retail counter rail. Assigning the replacement book to card silently re-labels who pays — the rail split IS the customer-type read." },
        { choice: 2, why: "5 is the count of SPLIT-RAIL statements (ids 1/5/12/19/22), not a leg count per rail. Legs total 27: 16 card + 11 wire." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-5",
      prompt: "Keep only accounts carrying at least 13 agreements — the national-account gate. Where does the threshold live?",
      choices: ["GROUP BY account HAVING COUNT(*) >= 13", "WHERE COUNT(*) >= 13, before GROUP BY", "WHERE agreements >= 13 on the raw orders table", "HAVING before GROUP BY, wherever it fits"],
      answer: 0,
      why: "A depth gate is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the >= 13 gate isolates exactly the four national accounts — 24, 17, 14 and 13 agreements.",
      notes: [
        { choice: 1, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'agreements' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-6",
      prompt: "The no-show share by branch market: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*). APAC reads 8.1%. A colleague writes (SUM(flags) / COUNT(*)) * 100 and APAC prints 0. Why?",
      choices: ["SUM of 0/1 flags over COUNT is integer division — 3/37 truncates to 0 before the ×100", "ROUND was dropped, so decimals vanished", "Cancelled agreements are NULL and dropped out", "The CASE arm never fires on APAC rows"],
      answer: 0,
      why: "Without the 100.0 multiplier BEFORE the division, the fold is integer arithmetic: 3 cancelled of 37 booked truncates to 0, then scales to 0. The multiplier forces real division first — 8.1 survives.",
      notes: [
        { choice: 1, why: "ROUND is presentation and happens after the damage. The failure is arithmetic type at the division, not missing rounding." },
        { choice: 2, why: "Nothing is NULL — the CASE emits explicit 0/1 flags and COUNT(*) counts all rows. The zero is truncation, not attrition." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The 14 reservations double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 agreements.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-8",
      prompt: "A staging list of replacement accounts uses account_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "The two tables genuinely share no ids — the zero is correct", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 0,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 1, why: "A confident zero is sometimes right — on the clean core db every agreement carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty replacement lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-9",
      prompt: "Finance wants 'billed but never wired' and separately 'wired but not yet billed to the cent'. One EXCEPT query can serve both by swapping the two SELECTs. What does swapping the sides actually do?",
      choices: ["It answers the mirror question — EXCEPT keeps the left set minus the right, so direction IS the question", "Nothing — EXCEPT is symmetric like INTERSECT", "It widens the result — EXCEPT returns the union minus the overlap either way", "It errors — EXCEPT requires the right side to be a literal list"],
      answer: 0,
      why: "A EXCEPT B keeps rows of A with no match in B; B EXCEPT A is the mirror. Swapping sides flips billed-not-wired into wired-not-billed — a different population, not a different view of the same one.",
      notes: [
        { choice: 1, why: "INTERSECT is the symmetric one. EXCEPT is directional by definition — treating it as symmetric ships the wrong reconciliation to the insurer packet." },
        { choice: 2, why: "The union-minus-overlap description is FULL OUTER JOIN / symmetric difference territory. EXCEPT never returns rows from both sides." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-10",
      prompt: "The rail census CASE reads: WHEN legs = 0 THEN 'no legs'; WHEN wire_cents > 0 AND card_cents > 0 THEN 'split-rail'; WHEN wire_cents > 0 THEN 'wire-only'; ELSE 'card-only'. A colleague moves the wire-only arm ABOVE the split-rail arm. What happens to the 5 split-rail statements?",
      choices: ["They re-bucket as wire-only — both arms satisfy wire_cents > 0, so arm order is semantics", "Nothing — CASE arms commute, only the labels move", "The query errors — two arms cannot test the same column", "The ELSE arm swallows them into card-only"],
      answer: 0,
      why: "CASE evaluates arms top-down and takes the FIRST true branch. Split-rail statements satisfy wire_cents > 0, so once the wire-only arm sits above them, they are caught early and labeled wire-only — 5 statements misfiled with no error anywhere.",
      notes: [
        { choice: 1, why: "Arms do not commute when their conditions overlap — and wire-only's condition is a strict subset of split-rail's. Order most-specific first, always." },
        { choice: 3, why: "The ELSE only fires when nothing above it matched — and wire-only matches these rows before ELSE is ever reached. The bug happens earlier in the arm list." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-enterprise-1",
      tier: "easy",
      topic: "l8",
      universe: "growth",
      title: "The deep-account book",
      brief:
        "Enterprise-flavored brief on the storefront db: the corporate-account desk opens every weekly review with the deep-account book — the accounts whose repeat depth makes them national, with agreement counts and lifetime book beside each. Probed facts: 103 agreements worth 34,833.28 across 16 accounts; the repeat-depth ladder reads 2 accounts at depth 1, 3 at 2, 2 at 3, 4 at 4, 1 at 5, then a natural break and the national tier at 13, 14, 17 and 24 agreements. The top accounts by depth: account 1 with 24 agreements / 7,262.35, account 5 with 17 / 6,640.56, account 7 with 14 / 4,574.23, account 13 with 13 / 3,644.56. The gate at 13 agreements is the desk's definition of national.",
      ask: "Return each account carrying 13 or more agreements with its agreement count and lifetime book in dollars to 2 decimals, deepest book first.",
      template:
        "SELECT o.customer_id AS account_id,\n       COUNT(*) AS rentals,\n       ROUND({1}(o.total), {2}) AS book\nFROM orders o\nGROUP BY {3}\nHAVING COUNT(*) >= {4}\nORDER BY rentals {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the book fold",
          why: "SUM(o.total) per account totals the lifetime book: 7,262.35 for the deepest. COUNT would print the agreement count twice, AVG a per-agreement 302.60, MAX the single biggest agreement — three different wrong monies wearing one column name.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the book precision",
          why: "Money reports to 2 decimals — 7,262.35 is the cell the desk reads. ROUND(…, 0) prints 7,262 and every book drifts by up to half a dollar against the ladder.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the account axis",
          why: "GROUP BY o.customer_id folds agreements back to accounts — the depth ladder's grain. GROUP BY o.status regroups by agreement fate (52/30/14/7) and the census reads one delivered row instead of four national accounts.",
        },
        {
          answer: "13",
          kind: "number",
          label: "the national-account gate",
          why: "HAVING COUNT(*) >= 13 isolates the corporate tier: 13, 14, 17 and 24 agreements — exactly the four accounts above the ladder's natural break at 5. A gate of 4 lets the retail tail back in (9 accounts), a gate of 14 drops the 13-agreement account.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "deepest book first",
          why: "The review reads the deepest account on top: 24, 17, 14, 13. ASC opens the meeting on the retail tail — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "ASC", "o.status", "0"],
      walkthrough:
        "One table, one fold, one gate. GROUP BY o.customer_id folds 103 agreements into 16 accounts, the HAVING gate keeps only the depth-13-plus tier, and SUM(o.total) rounded to 2 decimals prints the book: account 1 at 24 agreements / 7,262.35, account 5 at 17 / 6,640.56, account 7 at 14 / 4,574.23, account 13 at 13 / 3,644.56 — 22,121.70 of the 34,833.28 book across 68 of 103 agreements, deepest first. The gate at 13 is the point: the ladder breaks naturally below it (the retail tail tops out at 5), so the tier is a fact of the distribution, not an arbitrary cut. The distractors fail honestly: COUNT in the fold prints 24.00 / 17.00 / 14.00 / 13.00 — the depths twice, no money; AVG prints per-agreement averages (302.60 for the deepest) and the book collapses; MAX caps at each account's single biggest agreement; 0 drops the gate and all 16 accounts walk in; o.status regroups by agreement fate and the census reads one delivered row; ASC flips the ladder upside down. The desk's rule holds: state the grain (accounts), state the gate (13-plus), and the ladder reproduces itself.",
    },
    {
      id: "cs-enterprise-2",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The replacement-rail census",
      brief:
        "Enterprise-flavored brief on the storefront db: at every close, billing splits the statement book by the rail that settled it — wire legs carry the insurance-replacement and corporate direct-bill book, card legs carry retail walk-ins, some statements ride both. Probed facts: 28 statements, 27 payment legs — wire 11 legs / 32,248.00, card 16 / 37,364.00, with 5 split-rail statements; 6 statements never collected worth 15,217.00 (including paid-status #28 at 1,756.00 with zero legs — a status that lies), and void-but-settled #11 at 925.00 rides a single card leg. Statement tables carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each rail bucket with its statement count and billed total in dollars to 2 decimals, biggest book first.",
      template:
        "WITH stmt AS (\n  SELECT i.id AS invoice_id,\n         i.amount_cents AS billed_cents,\n         COALESCE(SUM(CASE WHEN p.method = {1} THEN p.amount_cents ELSE 0 END), 0) AS wire_cents,\n         COALESCE(SUM(CASE WHEN p.method = {2} THEN p.amount_cents ELSE 0 END), 0) AS card_cents,\n         COUNT(p.id) AS legs\n  FROM invoices i\n  {3} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT CASE WHEN legs = {4} THEN 'no legs'\n            WHEN wire_cents > 0 AND card_cents > 0 THEN 'split-rail'\n            WHEN wire_cents > 0 THEN 'wire-only'\n            ELSE 'card-only' END AS rail,\n       COUNT(*) AS statements,\n       ROUND(SUM(billed_cents) / {5}, 2) AS billed_total\nFROM stmt\nGROUP BY rail\nORDER BY billed_total {6};",
      slots: [
        {
          answer: "'wire'",
          kind: "keyword",
          label: "the replacement-rail selector",
          why: "The wire CASE arm folds each statement's wire legs into wire_cents — the replacement/corporate direct-bill book (11 legs, 32,248.00 platform-wide). 'card' here would double-count the retail rail into the wire fold and the buckets dissolve.",
        },
        {
          answer: "'card'",
          kind: "keyword",
          label: "the retail-rail selector",
          why: "The card CASE arm is what makes split detection possible: a statement is split-rail only when BOTH folds are positive. 'wire' here mirrors slot 1 and every card leg re-labels as wire money.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the no-legs keeper",
          why: "LEFT JOIN keeps the 6 statements with zero payment legs — the never-collected bucket worth 15,217.00. INNER silently deletes them, and the AR line the close foots against loses its whole no-payment row.",
        },
        {
          answer: "0",
          kind: "number",
          noVerify: true,
          label: "the legless boundary",
          why: "legs = 0 is the never-collected arm — 6 statements whose buckets print 0 settlement by construction, including paid-status #28 (1,756.00). A boundary of 1 drags all 17 single-leg statements into 'no legs' and the census stops footing.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 24,940.00 instead of 2,494,000. The .0 matters — bare 100 keeps integer arithmetic and the board reads a hundredfold-off book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest book first",
          why: "The close reads biggest bucket on top: split-rail 24,940.00, card-only 24,894.00, wire-only 21,926.00, no legs 15,217.00. ASC opens the close on the least-collected bucket — a correct query aimed at the wrong end of the ledger.",
        },
      ],
      distractors: ["'cash'", "INNER", "10.0", "ASC", "'WIRE'", "'replacement'"],
      walkthrough:
        "Two stages: fold legs per statement by rail, then classify and roll up. The CTE LEFT JOINs 28 statements to 27 legs and CASE-folds each rail into its own cents column; the outer CASE classifies — legs = 0 → 'no legs' (6 statements / 15,217.00, the AR line, including paid-status #28 at 1,756.00), both folds positive → 'split-rail' (5 / 24,940.00, the both-rails set), wire only → 'wire-only' (6 / 21,926.00), else 'card-only' (11 / 24,894.00 — void-but-settled #11 at 925.00 folds in here, its single leg is a card leg). Buckets foot to 28 statements and 86,977.00 billed. The distractors each break differently: 'cash' or 'WIRE' (case-sensitive) match no method and collapse the rail split; INNER drops the 6 no-leg statements and the AR line loses 15,217.00; a legless boundary of 1 or 10 re-buckets the single-leg book; /10.0 prints a tenfold book and 'replacement' divides money by text into NULLs; ASC opens the close on the no-legs bucket. The census rule holds: classification happens at statement grain before any rollup, the arms go most-specific first, and the buckets must foot to 28 or the close does not ship.",
    },
  ],

  problems: [
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-agreement national account is the intensity crown on this db — argmax with a subquery guard is exactly how the corporate desk finds its deepest book." },
    { slug: "product-sales-analysis-ii", why: "Rental lines fold to vehicle-class grain — revenue and rental days per class. This problem drills the exact fold behind every branch fleet review." },
    { slug: "sales-analysis-i", why: "Class revenue beside units turned: the busiest family runs 121 rental days over 54 agreements while the money family books 11,744.01 — a two-column class fold at db scale." },
    { slug: "rank-scores", why: "Four accounts sit tied at 4 agreements on the depth ladder. RANK/DENSE_RANK semantics decide who shares rungs on the corporate tier list — a policy, not syntax." },
    { slug: "queries-quality-and-percentage", why: "Dispatch quality reads as a ratio with a stated denominator — days-to-dispatch beside a stamped share. Same division discipline, branch flavor." },
    { slug: "immediate-food-delivery-ii", why: "Share of agreements dispatched inside the booking window versus late — the ready-line SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "capital-gain-loss", why: "Cars out on rent and cars back net to fleet movement. Ordered add/return folds mirror the daily branch dispatch-and-return walk." },
    { slug: "game-play-analysis-i", why: "First rental per account anchors every repeat-depth cohort the corporate desk builds. MIN-over-window is the shape." },
    { slug: "find-users-with-high-token-usage", why: "Long-rental outliers flag accounts outgrowing their rate plan — a threshold fold over per-account rental days, this problem's exact shape." },
    { slug: "confirmation-rate", why: "Branch feeds arrive with gaps — COALESCE turns missing dispatch data into an explicit rate instead of a silent NULL. The drill the branch P&L denominator needs." },
    { slug: "customers-who-never-order", why: "The never-rented anti-join returns a confident zero on this db — all 16 accounts appear — and proving that zero is the analyst's job before the expansion team trusts it." },
    { slug: "top-travellers", why: "Heaviest books per account across branch markets — a join, an aggregate and an ORDER BY: the weekly account-review query in practice form." },
    { slug: "average-salary-of-departments", why: "Branch book versus platform mean (338.19 per agreement) — the group-versus-global comparison that flags which markets price above the network." },
    { slug: "find-golden-hour-customers", why: "Accounts that rent again within N days of return are the repeat engine — date-math cohorting over agreement timestamps, exactly this problem's shape." },
    { slug: "second-highest-salary", why: "The second-deepest account — subquery and LIMIT/OFFSET shapes break on ties, and the depth ladder is full of them. The null-when-absent edge is the interview follow-up." },
    { slug: "growth-accounting", why: "New, retained, reactivated, lapsed accounts per month — the account-accounting identity that keeps the repeat-depth ladder honest period over period." },
  ],
};
