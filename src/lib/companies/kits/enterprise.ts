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
    "Preparation strategy: the pools file carries no Enterprise section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's screen shapes: two-grain branch censuses, repeat-depth ladders, dispatch clocks, CASE day-rate bands, rail set algebra and the cents-safe billing spine. Do the topics in order, then run the six case studies on the live storefront db: they rebuild the reads this org actually re-cuts — the {emerald:deep-account book} the corporate desk opens every weekly review, the {violet:replacement-rail census} billing splits at every close, the fleet-family ledger where the days leader and the money leader are different families, the market fate grid that reconciles to 103 by construction, the one-pass opex census with FILTER, and the per-market account leaderboard with its PARTITION-BY rungs. The bar to clear: *state the account grain and the denominator before you compute anything* — then make every census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. Six case studies now span the asks Enterprise data teams rehearse most — account depth, branch fates, fleet economics, rail money — and each one rewards the second pass: run it on the live db, then re-run it a week later from a blank editor and say the grain out loud before the first SELECT lands. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate what each wrong chip silently re-files, which is exactly the muscle the 'how do you know?' follow-up tests in a branch review.",
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
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "new-users-daily-count", "employees-earning-more-than-their-managers", "basket-depth-aov"],
    },
    {
      name: "Repeat-account depth",
      why: "The depth ladder is Enterprise's corporate health read: 2 accounts at depth 1, 3 at 2, 2 at 3, 4 at 4, 1 at 5, then the national tier at 13/14/17/24. Every cohort, winback and account-review agenda starts from this fold, and the exactly-versus-at-least distinction (4 accounts at depth 4, 9 at 4-plus) is the classic ladder trap.",
      slugs: ["repeat-purchase-rate", "find-loyal-customers", "cohort-repeat-revenue", "rfm-segmentation", "dormant-reactivation", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Agreement fate counting",
      why: "Every dispatch rate, no-show share and returned share is a conditional count over a status or timestamp, and the interviewer asks the denominator out loud — 'do the 14 reservations count in your base?'. The trap is calling an on-rent agreement returned: 30 versus 52 on this db, and the share flips by half.",
      slugs: ["percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "number-of-employees-who-met-the-target", "hopper-company-queries-ii", "flight-occupancy-and-waitlist-analysis"],
    },
    {
      name: "Account-to-agreement joins",
      why: "Accounts carry region and created_at; agreements inherit the branch market through the join, and the join type decides who survives. An agreement without an account is corruption; an account without agreements is whitespace — though on this db the anti-join returns a confident zero (all 16 accounts appear), and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "employees-with-missing-information", "duplicate-emails"],
    },
    {
      name: "Day-rate bands with CASE",
      why: "Vehicle classes are CASE-banded — the shelf runs 14.99 economy to 199.99 flagship, split 8 mid classes averaging 111.50 against 8 budget classes at 32.06 — with fixed edges the rate card publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the branch revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Depth gates & HAVING floors",
      why: "Account tiering is a group-level gate: which accounts carry at least N agreements, which branch markets carry at least N bookings. The floor lives in HAVING after the fold — WHERE cannot see a COUNT that has not formed — and the 13-agreement gate is exactly how the national-account tier gets isolated from the retail tail that tops out at 5.",
      slugs: ["classes-more-than-5-students", "managers-with-at-least-5-direct-reports", "find-users-with-high-token-usage", "department-top-three-salaries", "nth-highest-salary"],
    },
    {
      name: "Dispatch clocks & month walks",
      why: "The booking-ahead clock (created_at to shipped_at, 82 stamped of 103, 2.98-day average) and the 14-month agreement spine (2024-01 to 2025-02) are the same date discipline: julianday arithmetic over a stated population, then LAG deltas where the first row is NULL by definition. The walk names the trough (1,193.86 in July) and the jump (+1,158.21 into August) — branch seasonality defended one delta at a time.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "users-with-two-purchases-within-seven-days", "calculate-orders-within-each-interval"],
    },
    {
      name: "Rail & coverage set algebra",
      why: "Close packets stack populations — billed beside settled, wire beside card — and EXCEPT answers 'which billed statements never settled' with the direction AS the question: A-EXCEPT-B is not B-EXCEPT-A. UNION dedups whole rows silently, which makes it a correctness question, not a style one; the branch packet must add up or it does not ship.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "the-airport-with-the-most-flights", "ar-aging-schedule"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets returned, on-rent, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the branch is calling for its board.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "rolling-7d-actives", "bikes-last-time-used"],
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
    {
      id: "enterprise-t9",
      q: "UNION versus UNION ALL — when is the dedupe step correct business logic for a close packet, and when is it a silent bug?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and the honest default when the branches are logically disjoint, like the wire-leg census stacked over the card-leg census in a close packet. UNION adds a distinct pass over the combined set, and that pass is a business decision: correct only when you can name which duplicated rows you are paying to collapse. In billing, duplicates are usually the signal — a settlement leg ingested twice by a pipeline retry looks identical to a real repeat payment, and UNION makes the anomaly vanish exactly when the packet is being audited. Column discipline matters too: both branches need matching column counts and compatible types, with names taken from the first branch. The opinionated version Enterprise's billing team works by: default to UNION ALL, and reach for UNION only with a written sentence saying which duplicates you are collapsing and why.",
      tag: "set-ops",
    },
    {
      id: "enterprise-t10",
      q: "EXCEPT and INTERSECT — which branch questions do they answer more honestly than a join, and what does each silently do to duplicate rows first?",
      a: "Diff and overlap questions. 'Which billed statements never settled?' is SELECT billed EXCEPT SELECT settled — no join gymnastics, and the direction IS the question: swapping the sides flips billed-not-settled into settled-not-billed, a different reconciliation. INTERSECT answers the mirror: statements that appear in both the billed and the collected snapshot. Two discipline points: set operations deduplicate both inputs first, so EXCEPT silently collapses an internally duplicated feed — if a double-ingested settlement leg is the anomaly you are hunting, the row-honest tool is a LEFT JOIN … IS NULL anti-join on the full multiset; and both sides must share column count and compatible types. EXCEPT and INTERSECT for set-level diffs across snapshots, anti-joins for row-level forensics — knowing which question you are answering is the whole skill.",
      tag: "set-ops",
    },
    {
      id: "enterprise-t11",
      q: "Day-rate bands, rail buckets, fate labels — walk me through writing a CASE the branch review can trust.",
      a: "Three properties. Exhaustive: every row must land somewhere — a hole in the CASE is a hole in the branch revenue forecast, so the ELSE arm is load-bearing even when it 'should' be empty. Ordered: arms evaluate top-down and the first true branch wins, so overlapping conditions go most-specific first — the wire-only arm below the split-rail arm is dead code, and moving it above silently re-buckets the 5 split-rail statements. Honest about empties: the shelf tops out at 199.99, so a 200-plus flagship band prints no rows — and that empty band is a finding about the fleet, not padding to delete. The finishing discipline is labeling: band names are business words ('budget', 'standard'), not SQL shorthand, because the column ships straight into the deck. A CASE that fails any of the three does not error — it just quietly re-files the fleet, which is worse.",
      tag: "case-when",
    },
    {
      id: "enterprise-t12",
      q: "What does GROUP_CONCAT do, and where does a branch report genuinely need it instead of a join or a GROUP BY?",
      a: "GROUP_CONCAT folds a group's text values into one delimited cell — 'Nordic Gadgets AB, Alpine Audio GmbH' per market. It earns its place when the consumer is a human reading a row, not another query: fleet-partner strips per market, agreement-status trails per account, vendor lists per expense category. The grammar that matters: GROUP_CONCAT(DISTINCT name) keeps repeated partners from printing twice, the optional second argument sets the separator, and there is no ORDER BY inside — so cell order follows scan order and must not be relied on for presentation. The trap is overuse: a comma-cell is unqueryable downstream (no joins, no counts, no indexes), so any field another query will consume belongs as rows, not as a folded string. Fold for the readout, keep rows for the warehouse.",
      tag: "strings",
    },
    {
      id: "enterprise-t13",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a branch team?",
      a: "Three concrete buys. Readability: a chain of named steps — stamped, market_clock, worst_markets — reads like the branch process instead of a Russian-doll subquery, and each CTE is a natural checkpoint to SELECT from while debugging. Reuse: one CTE can feed several later references in the same statement, so the per-account fold is written once, not three times. Correctness under review: naming a CTE national_accounts forces you to state the definition (13-plus agreements) where the reviewer can see it — Enterprise's metric culture is the answer to definitions that drift between decks. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step — the 103-row agreement table is small, but the habit is what scales. When a query grows past two grains, the CTE stops being style and becomes the only way the next analyst can audit your number.",
      tag: "ctes",
    },
    {
      id: "enterprise-t14",
      q: "A correlated subquery compares each account to ITS market's average book. Why is it slow, and what do you reach for instead?",
      a: "A correlated subquery references the outer query's current row, so the inner average re-evaluates once per account — 16 re-runs on this db, millions on a warehouse table. It is readable and correct, which is why it appears in screens, but the set-based equivalents are the professional default: a JOIN to a derived table of per-market means (GROUP BY region in a CTE, join back on region), or a window function AVG(book) OVER (PARTITION BY market), which computes each partition's mean once and keeps every row. On this db the two answers differ in shape, not in numbers: the US mean is 3,643.08 across 2 accounts (6,640.56 and 645.60), so the window version puts the market mean beside every account and the above/below comparison becomes a visible column. The strong answer names the trade: correlated form for clarity on small data, join-to-CTE or window form for anything that ships.",
      tag: "subqueries",
    },
    {
      id: "enterprise-t15",
      q: "How would you build a year-to-date book and a trailing average for the branch trend — and where do ROWS and RANGE disagree?",
      a: "Window frames. Running total: SUM(month_book) OVER (ORDER BY month) — the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and its final row must equal the grand total, 34,833.28 on this spine; if it does not, the frame or the ORDER BY is broken. Trailing average: AVG(month_book) OVER (ORDER BY month ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) — a four-month smoothing window. The expert detail: ROWS peers 4 ROWS back, RANGE peers 4 MONTH-VALUES back — identical on a dense spine, different the moment a month is missing from the data. On a 14-month spine with no gaps the two coincide, but the discipline is stating which you chose, because the branch trend's shape changes the moment a quiet month drops a row. LAG for the delta, frames for the accumulation — and the first row stays NULL either way.",
      tag: "windows",
    },
    {
      id: "enterprise-t16",
      q: "What does COUNT(*) OVER (PARTITION BY region) buy a report that a GROUP BY cannot — and when do you reach for each?",
      a: "The window keeps every row; the GROUP BY collapses them. PARTITION BY region computes each market's agreement count — EU 45, APAC 37, US 19, LATAM 2 — and stamps it onto every agreement row, so a per-agreement detail report can carry its market's load without losing the row it is about. That is the pattern behind 'flag every below-average account with its market's mean' and 'mark agreements inside markets running hot' — enrichment, not collapse. Reach for GROUP BY when the deliverable IS the group (one row per market for the deck), and for the window when the deliverable is still the row but the decision needs group context. The cost note: the window recomputes per partition cheaply, but stacking several different PARTITION BYs in one SELECT re-scans per window — stage them in CTEs when the query grows.",
      tag: "windows",
    },
    {
      id: "enterprise-t17",
      q: "Why is an average of averages wrong, and what do you compute instead for branch-level reads?",
      a: "Because it weights every group equally regardless of size. On this db the per-account mean book is 2,177.08 (34,833.28 over 16 accounts) and the per-agreement mean is 338.19 — averaging the four MARKET means (EU's per-account 4,354.16, the US's 3,643.08, APAC's 1,643.76, LATAM's 852.44) gives a number that describes a market mix nobody operates, because LATAM's single account gets the same weight as EU's eight. The honest blends are re-aggregation from the base — sum the numerators, divide by the summed denominators — or a weighted average, SUM(mean * weight) / SUM(weight), the same arithmetic one level up. One legitimate exception: when every group has equal counts, the mean of means equals the pooled mean — and that is a claim you should have to defend, not assume. The interview move is saying WHERE the weighting lives.",
      tag: "aggregation",
    },
    {
      id: "enterprise-t18",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — when does each give a different answer in the branch world?",
      a: "COUNT(*) counts rows: 103 agreements, or 251 rental lines after the join — whichever grain the FROM clause produced. COUNT(column) counts non-NULL values of that column: COUNT(shipped_at) is 82, the stamped subset, and the gap to 103 is exactly the 21 unstamped rows (14 reserved plus 7 no-shows) — a feature to report, not a bug to patch. COUNT(DISTINCT column) folds repeats back to entities: 16 accounts behind the 103 agreements, 7 fleet families behind the 16 vehicle classes. The branch-flavored trap is the two-grain census: COUNT(*) beside COUNT(DISTINCT customer_id) — 45 agreements from 8 accounts in EU — where the ratio 5.6 is the intensity read. Saying out loud which grain each form counts is the whole answer; the numbers change shape with each one, and so does the business decision they feed.",
      tag: "aggregation",
    },
    {
      id: "enterprise-t19",
      q: "Money lives in integer cents in the finance tables. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: a statement at 493,700 cents is 4,937.00 dollars, and amount_cents / 100 is integer division — divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision that a later SUM still needed — round only what a human reads, because a cent per row across 28 statements is a trial balance that no longer foots. Float drift: SQLite REALs are IEEE doubles, so keep money in integer cents until the last step rather than casting early. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the ledger prove it — this close lands at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A number that survives that chain is a number the controller will sign.",
      tag: "numbers",
    },
    {
      id: "enterprise-t20",
      q: "What makes a predicate sargable, and which habits keep a branch query cheap?",
      a: "Sargable means the predicate can use an index: it compares the bare column to a value. Wrapping the column in a function — STRFTIME('%Y-%m', created_at) = '2024-07' — forces a scan of every agreement row; the sargable twin is the half-open range created_at >= '2024-07-01' AND created_at < '2024-08-01', same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT * so payloads you never read stop crossing the wire; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question rather than joining first and filtering after. Branch tables are small today and that is exactly the trap — the habits are free to build now and expensive to retrofit when the agreement log is a million rows and the morning board times out.",
      tag: "performance",
    },
    {
      id: "enterprise-t21",
      q: "In a branch review you are asked for 'the dispatch rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the event (agreements dispatched, or agreements returned-and-billed — different clocks), the numerator (82 stamped dispatches), the denominator (all 103 booked, or only agreements old enough to have dispatched — the two definitions disagree by double digits on a growing book), and the window (calendar month, trailing 90 days, lifetime?). Then the discipline move: encode the definition as a named CTE — stamped AS (SELECT … WHERE shipped_at IS NOT NULL) — so the SQL IS the definition and the reviewer can audit it instead of arguing with you. The follow-up the panel always runs: 'do the 14 reservations count in your base?' The strong candidate has already answered it in the CTE name. Enterprise's review culture punishes vibes-based definitions; the analyst who says 'dispatched means stamped, denominator is all booked, trailing quarter' owns the room.",
      tag: "metrics",
    },
    {
      id: "enterprise-t22",
      q: "When is DISTINCT a bug report rather than a feature?",
      a: "When it is papering over a fan-out nobody diagnosed. `SELECT DISTINCT customer_name, agreement_total FROM …` returning sane-looking rows usually means the orders-to-order_items join multiplied 103 agreements into 251 rows and DISTINCT is de-duplicating the damage — while the SUM next to it is still wrong (103,244.55 where 34,833.28 belongs). The honest sequence: notice the DISTINCT, run the counts with and without it, find the multiplicity (GROUP BY the join key HAVING COUNT(*) > 1), and fix the join or pre-aggregate. Legitimate DISTINCT exists: collapsing a dimension's value set (16 distinct accounts, 4 markets, 7 fleet families on this db), or a genuinely coarser business grain than the storage grain. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
    },
    {
      id: "enterprise-t23",
      q: "How does a self-join work, and what branch question needs one?",
      a: "A self-join joins a table to itself under two aliases, turning rows into pairs. The classic discipline: pair accounts within the same market — FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id — where the id inequality keeps each pair once and kills the a=a diagonal, so 8 EU accounts yield 28 pairs, not 64. Branch questions that need the shape: market-mate comparisons (which account's intensity lags its neighbor's), coverage hand-offs (two accounts sharing a market during a transition), and the review-agenda pair-up for markets with exactly two national logos. The follow-up to expect: why a.id < b.id and not != — because != double-counts every pair (A,B and B,A) and keeps self-pairs out only by luck of the data. Aggregating over the pairs (COUNT per region) turns the pair list into the market-pair density read the expansion team actually uses.",
      tag: "joins",
    },
    {
      id: "enterprise-t24",
      q: "A stakeholder says the branch dashboard moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's agreement count versus the 7-day average, because a half-loaded feed halves every downstream number. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of agreement keys against the account table to catch reference-integrity breaks. NULL spikes: COUNT(shipped_at) versus COUNT(*) — a dispatch stamp that went 82 to 40 stamped will empty every clock built on it. On this db, that ritual is exactly how the paid-no-legs statement (#28, 1,756.00) would surface: status says paid, payment rows say zero. The deliverable is not 'it looks fine' — it is which check passed, when it last ran, and what the number was before the move.",
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
    {
      id: "enterprise-mcq-11",
      prompt: "The dispatch clock measures booking-ahead days. Which expression computes it for a stamped agreement?",
      choices: ["julianday(shipped_at) - julianday(created_at)", "shipped_at - created_at", "CAST(shipped_at AS INTEGER) - CAST(created_at AS INTEGER)", "DATEDIFF('day', created_at, shipped_at)"],
      answer: 0,
      why: "julianday() parses the TEXT timestamps into fractional day numbers, so the 2.98-day average and its 2-to-4 range come out honest. The platform's dispatch clock — 82 stamped agreements — is built on exactly this subtraction.",
      notes: [
        { choice: 1, why: "Raw TEXT subtraction reads each string's leading number (the year) and lands near 2024 − 2024 = 0 — a plausible-looking zero that silently flattens the clock." },
        { choice: 3, why: "DATEDIFF is not a SQLite function — the query fails outright. Knowing your engine's date toolkit is part of the answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-12",
      prompt: "`SELECT COUNT(*) FILTER (WHERE status = 'pending') FROM orders` — the reserved-agreement count on this db?",
      choices: ["14", "103", "7", "0"],
      answer: 0,
      why: "FILTER (WHERE …) counts only rows passing the predicate: pending = reserved-awaiting-pickup, 14 of 103. It is the one-pass fate census in miniature — every stage count shares the same scan and the same denominator.",
      notes: [
        { choice: 2, why: "7 is the no-show count ('cancelled'). Pending is 'not yet', not failure — conflating them doubles the trust incident count." },
        { choice: 1, why: "103 is COUNT(*), the unfiltered total. The whole point of FILTER is stage counts beside the total without four separate queries." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-13",
      prompt: "The agreement spine buckets orders by month. What does `SUBSTR(created_at, 1, 7)` return for a booking made 2024-07-14?",
      choices: ["'2024-07'", "7", "'2024'", "'Jul'"],
      answer: 0,
      why: "SUBSTR on the ISO string takes the first seven characters — year plus zero-padded month — the exact month key behind the 14-bucket spine (2024-01 to 2025-02). Zero-padded is what keeps months sortable and merge-free.",
      notes: [
        { choice: 1, why: "SUBSTR(..., 1, 7) takes 7 characters, not the numeric month. And a bare 7 loses the year — July 2024 and July 2025 would fold together." },
        { choice: 3, why: "Month names come from STRFTIME('%m') or '%b' territory, and 'Jul' sorts alphabetically between other names, not chronologically." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-14",
      prompt: "US branch markets run 19 agreements from 2 accounts. Which expression, computed per market after the join, yields the 9.5-agreements-per-account intensity read?",
      choices: ["COUNT(*) * 1.0 / COUNT(DISTINCT customer_id)", "SUM(total) / COUNT(*)", "COUNT(DISTINCT customer_id) / COUNT(*)", "AVG(customer_id)"],
      answer: 0,
      why: "Intensity is agreement load over account coverage: 19 rows folded by 2 distinct accounts = 9.5. The 1.0 forces real division — and the ratio is only meaningful because the two COUNTs answer different grains of the same fold.",
      notes: [
        { choice: 1, why: "That is AOV — dollars per agreement, not agreements per account. Both are 'per' ratios; only one describes branch intensity." },
        { choice: 2, why: "That divides coverage by load — 2/19 ≈ 0.11, the reciprocal. Inverting the ratio is how a 9.5 becomes 'accounts per agreement', a number nobody uses." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-15",
      prompt: "The reservations report prints a blank dispatch column for the 14 awaiting-pickup agreements. The stakeholder wants the words 'not dispatched'. The fix?",
      choices: ["COALESCE(shipped_at, 'not dispatched')", "IFNULL(shipped_at, 0)", "WHERE shipped_at IS NOT NULL", "NULLIF(shipped_at, created_at)"],
      answer: 0,
      why: "COALESCE substitutes the display string only when the stamp is NULL — reservations read as a labeled state instead of a hole. The 14 rows stay in the report, which is the point: they are pipeline, not missing data.",
      notes: [
        { choice: 1, why: "IFNULL(..., 0) prints a numeric 0 into a timestamp column — type-mismatched dressing that reads as a falsy date rather than a status." },
        { choice: 2, why: "That deletes the 14 rows entirely — the stakeholder asked to relabel the gap, not to amputate the pipeline from the report." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-16",
      prompt: "The 14-month book spine runs 2024-01 through 2025-02, opening at 3,731.97. What does LAG(book) OVER (ORDER BY month) return for the 2024-01 row?",
      choices: ["NULL — no prior row exists on the spine", "3,731.97 — LAG wraps around to itself", "0 — the baseline is always zero", "It errors — LAG needs a PARTITION BY"],
      answer: 0,
      why: "LAG has no row before the first one, so the opening month's baseline is honestly NULL — unknown movement, not flat movement. Coalescing it to 0 would read as a −100% collapse and poison every downstream delta.",
      notes: [
        { choice: 1, why: "Windows do not wrap. The edge row's neighbor does not exist; inventing one is exactly the 'flat month' lie the walkthrough warns about." },
        { choice: 3, why: "PARTITION BY is optional — without it the window is the whole result set. It errors never; it just spans everything." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-17",
      prompt: "The close packet stacks the wire-leg census on top of the card-leg census, then appends a labelled TOTAL row. Which operator joins the branches, and why?",
      choices: ["UNION ALL — the branches are disjoint, and a dedupe pass could silently collapse rows that are meant to be there", "UNION — dedupe protects against double-counting", "INTERSECT — only shared rows matter", "JOIN — the branches share the same columns"],
      answer: 0,
      why: "UNION ALL is raw concatenation — cheap and honest when every row belongs. The wire and card branches are disjoint populations, so UNION's distinct pass buys nothing but risk: a genuine repeated leg row would vanish into the dedupe and the packet would never foot.",
      notes: [
        { choice: 1, why: "The dedupe is the bug here, not the safety feature. Collapsing identical rows hides exactly the anomalies the close exists to catch." },
        { choice: 2, why: "INTERSECT keeps the overlap — wire legs that are also card legs, a population that does not exist. The packet would come back empty." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-18",
      prompt: "The depth ladder runs 24, 17, 14, 13, 5 agreements, then FOUR accounts tie at 4. Under RANK, what rank does the first depth-3 account carry?",
      choices: ["10 — the tie block consumes ranks 6 through 9", "7 — ties share rank 6 and counting resumes immediately", "9 — one rank per account so far", "6 — RANK reuses the last rank for the next distinct value"],
      answer: 0,
      why: "RANK gives the four tied accounts rank 6 each and then skips: positions 6, 7, 8, 9 are all consumed by the tie, so the next distinct count (3) enters at 10. The gap IS the tie, made visible — which is why the ladder policy names RANK, not DENSE_RANK.",
      notes: [
        { choice: 1, why: "That is DENSE_RANK semantics — shared rungs without gaps. A defensible policy, but not the one the corporate desk publishes, and the interview wants you to know which you computed." },
        { choice: 2, why: "Nine accounts appear before the depth-3 tier, but rank counts distinct values plus ties, not rows. The four 4s hold one rank, not four." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-19",
      prompt: "Year-to-date branch book: `SUM(month_book) OVER (ORDER BY month)` over the 14-month spine. What does the running total's final row equal?",
      choices: ["34,833.28 — the full book, accumulated", "3,731.97 — the opening month", "239.14 — the per-month average", "14 — the number of rows accumulated"],
      answer: 0,
      why: "The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, so the last row of the spine carries the accumulated total of all 14 months — 34,833.28. A running total that does not end at the grand total is the first sign the frame or the ORDER BY is wrong.",
      notes: [
        { choice: 1, why: "That is the FIRST row's value — the running total starts there, it does not end there." },
        { choice: 2, why: "That is what AVG would give (roughly — 34,833.28 / 14 ≈ 2,488, and the actual per-month mean differs). The SUM accumulates; it never averages." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-20",
      prompt: "Branch ops wants each market's fleet-partner names folded into one cell: 'Nordic Gadgets AB, Alpine Audio GmbH'. Which aggregate builds that?",
      choices: ["GROUP_CONCAT(DISTINCT name)", "CONCAT(name)", "STRING_AGG(name) GROUP_CONCAT", "SUM(name)"],
      answer: 0,
      why: "GROUP_CONCAT folds a group's text values into one delimited cell — the branch readout's partner strip. DISTINCT keeps repeated partners from printing twice, and the comma separator is the classic default. It is an aggregate: one row per group, not one per partner.",
      notes: [
        { choice: 1, why: "CONCAT joins values within a single row — it cannot fold rows together. Without an aggregate the query returns one row per partner, the opposite of the ask." },
        { choice: 3, why: "SUM coerces text to numbers (every name becomes 0) and returns 0 — a legal query printing a meaningless answer, which is worse than an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "enterprise-mcq-21",
      prompt: "The coverage census reads 21 exact, 1 partial (4,000.00 of 6,148.00), 6 never-collected. Which HAVING clause isolates the one partial statement?",
      choices: ["HAVING COUNT(p.id) > 0 AND SUM(p.amount_cents) < i.amount_cents", "HAVING COUNT(p.id) = 0", "HAVING SUM(p.amount_cents) = i.amount_cents", "HAVING p.amount_cents IS NULL"],
      answer: 0,
      why: "Partial means money arrived but fell short: at least one payment leg, and settled cents strictly under billed cents — exactly one statement qualifies. The clause encodes the business rule, and each half of the AND removes one of the other two buckets.",
      notes: [
        { choice: 1, why: "That is the never-collected bucket — 6 statements with no legs at all. Zero legs and short money are different anomalies with different owners." },
        { choice: 2, why: "That is the exact bucket — 21 statements. Equality is the clean case; the audit exists for the row that misses it." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-22",
      prompt: "A colleague buckets the spine with `STRFTIME('%m', created_at)` instead of '%Y-%m'. The 14-month trend now returns 12 rows. What happened?",
      choices: ["'%m' keeps only the month number, so January 2024 and January 2025 merge into one bucket — the trend is fiction", "SQLite truncated the result set at 12 for display", "The extra two months fell outside the WHERE clause", "STRFTIME ignores years by design; use DATE() instead"],
      answer: 0,
      why: "'%m' emits '01' through '12' with no year, so the two Januaries (and the two Februaries) fold together: 14 buckets collapse to 12 and the 2025 opening overwrites 2024's. The spine key must carry the year — '%Y-%m' — or the branch trend is quietly wrong.",
      notes: [
        { choice: 1, why: "Nothing truncates. GROUP BY folds honestly — the dishonesty is in the key, which no longer identifies a month uniquely." },
        { choice: 3, why: "STRFTIME handles years fine ('%Y'). The fix is a format string change, not a function swap — and DATE() would not bucket at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-23",
      prompt: "`SELECT customer_id, ROUND(SUM(total), 2) AS book FROM orders GROUP BY customer_id` — a colleague adds `WHERE book > 3000` and the query fails. The fix that keeps the four national books?",
      choices: ["Move the threshold to HAVING: HAVING SUM(total) > 3000", "Move it to WHERE as WHERE SUM(total) > 3000", "Filter with WHERE book > 3000 but drop the alias", "ORDER BY book DESC LIMIT 4"],
      answer: 0,
      why: "WHERE runs before SELECT, so the alias does not exist yet — and aggregates do not exist before GROUP BY either. HAVING is the clause that judges groups after the fold: SUM(total) > 3000 keeps exactly the four accounts at 7,262.35, 6,640.56, 4,574.23 and 3,644.56.",
      notes: [
        { choice: 1, why: "Aggregate in WHERE is the same stage violation one level up — COUNT/SUM do not exist before groups form. The engine rejects it, same as the alias." },
        { choice: 3, why: "LIMIT 4 assumes exactly four accounts clear 3,000 — a coincidence today, a silent lie the moment the book shifts. Thresholds belong in HAVING, not in row-count luck." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-24",
      prompt: "`SELECT COUNT(CASE WHEN status = 'cancelled' THEN 1 END) FROM orders` — the no-show count, without an ELSE. What does it return?",
      choices: ["7 — rows failing the CASE yield NULL, and COUNT skips NULLs", "103 — COUNT counts every row's CASE output", "0 — the missing ELSE returns 0 for non-cancelled rows", "It errors — CASE inside COUNT needs an ELSE"],
      answer: 0,
      why: "Without ELSE, the CASE yields NULL for every non-cancelled row, and COUNT(expression) counts non-NULLs only: 7. The trap cuts both ways — add ELSE 0 and the same COUNT returns 103, counting the zeros. SUM(CASE …) with an explicit ELSE 0 is the form whose behavior you can reason about at a glance.",
      notes: [
        { choice: 2, why: "That is the ELSE 0 behavior — but there IS no ELSE here. The missing arm produces NULL, not 0, and NULL is exactly what COUNT ignores." },
        { choice: 3, why: "ELSE is optional everywhere in CASE. Its absence is a semantics choice, not a syntax error — which is precisely why this shape slips through code review." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-25",
      prompt: "The whitespace report: accounts LEFT JOIN agreements, then `WHERE o.status = 'cancelled'` to count no-shows. Accounts with zero agreements vanish from the output. Why?",
      choices: [
        "The WHERE filter on the right table's column discards NULL-payload rows — the LEFT JOIN silently became an INNER JOIN",
        "LEFT JOIN cannot preserve unmatched left rows when aggregates are present",
        "The accounts never existed — the anti-join is empty by construction",
        "GROUP BY customer_id re-adds the missing accounts automatically",
      ],
      answer: 0,
      why: "Unmatched accounts arrive with NULL agreement columns; status = 'cancelled' is UNKNOWN against NULL, so those rows fail the filter and the whitespace disappears — on this db the anti-join is empty anyway (all 16 accounts appear), but on the staging db the prospect list would silently evaporate. The fix: move the predicate into the ON clause, where it filters the match, not the survival.",
      notes: [
        { choice: 1, why: "Aggregates have nothing to do with it — the predicate placement alone converts the join. This is the single most common silent-INNER bug in branch reporting." },
        { choice: 2, why: "It may be empty on the clean core db — but proving that zero and assuming it are different jobs, and the query as written could never surface a prospect even if one existed." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-26",
      prompt: "The ops board wants months whose running YTD book first crosses 20,000. Why does `WHERE SUM(month_book) OVER (ORDER BY month) > 20000` fail, and what is the fix?",
      choices: [
        "Window output does not exist at WHERE time — stage the running sum in a CTE or derived table, then filter outside",
        "Running totals cannot be compared to literals; use a CASE expression",
        "The window needs ROWS BETWEEN to be filterable",
        "SUM OVER is not allowed with ORDER BY; use GROUP BY instead",
      ],
      answer: 0,
      why: "Logical evaluation order: WHERE runs before SELECT, and windows are SELECT-stage work. The running sum has to be materialized first — a CTE (or subquery) named ytd, then SELECT … WHERE ytd_book > 20000 outside it. The same staging rule governs filtering on RANK or LAG output.",
      notes: [
        { choice: 1, why: "CASE cannot see window output either — the problem is evaluation stage, not expression type. Any comparison against a window must happen after SELECT." },
        { choice: 2, why: "The frame changes which rows the sum accumulates over; it never changes when the window is computed. ROWS BETWEEN is orthagonal to the failure." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-27",
      prompt: "The deep-account query selects customer_id, COUNT(*) AS rentals, ROUND(SUM(total), 2) AS book, ending `ORDER BY 2 DESC`. Which column actually sorts the output?",
      choices: ["rentals — a bare integer in ORDER BY is an output-column ordinal, not a value", "book — 2 refers to the second argument of ROUND", "customer_id — ordinals count from the FROM clause", "It errors — ORDER BY takes column names only"],
      answer: 0,
      why: "ORDER BY 2 sorts by the second output column — rentals, 24 through 13 — while the desk asked for deepest BOOK first. The query runs, the ladder looks plausible, and the ordering is quietly wrong: ordinal sorts are how reviewed-and-shipped reports drift from their spec.",
      notes: [
        { choice: 1, why: "Function arguments have nothing to do with ORDER BY. The ordinal is positional over the SELECT list — column 2 is rentals." },
        { choice: 2, why: "Ordinals count output columns from the left, starting at the SELECT list, not the FROM clause." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-28",
      prompt: "`WHERE depth > (SELECT AVG(depth) FROM per_account_fold)` — the above-average gate on the 16-account fold. How many accounts survive?",
      choices: ["4 — the national tier at 24, 17, 14 and 13 agreements", "12 — everyone above the median", "0 — a scalar subquery cannot feed a comparison", "8 — exactly half by definition"],
      answer: 0,
      why: "The fold's mean is 6.44 agreements per account, and exactly four accounts clear it — the same four that form the corporate tier. The gate and the HAVING floor (>= 13) agree on this db, which is a property of the distribution, not a law: mean-gates shift with the tail, floors do not.",
      notes: [
        { choice: 3, why: "Above-mean is not above-median — a heavy tail (one 24 against a retail tail topping at 5) drags the mean up and shrinks the survivor set below half." },
        { choice: 2, why: "A scalar subquery returns 0-or-1 rows and is built for exactly this comparison. The empty-inner edge case is the real risk, not the comparison itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "enterprise-mcq-29",
      prompt: "The close's trial balance must land at 181,080 debits against 181,080 credits. Which rounding policy guarantees the reconciliation still foots?",
      choices: [
        "Aggregate in integer cents, convert to dollars once at the presentation edge, and round only what a human reads",
        "ROUND(amount_cents / 100.0, 2) on every row before summing, so each line is clean",
        "Cast to REAL early — floats keep the most precision",
        "Round everything to whole dollars; cents are noise at close scale",
      ],
      answer: 0,
      why: "Rounding mid-pipeline discards precision that the later SUM still needed: per-row rounding can drift the foot by a cent per row, and the trial balance fails its delta-zero check by construction. Cents are exact integers — keep them intact through every aggregate and convert once at the edge.",
      notes: [
        { choice: 1, why: "Each ROUND is individually harmless and collectively fatal — the drift is invisible per row and decisive across 28 statements. Round at the edge, not en route." },
        { choice: 2, why: "IEEE doubles make 0.1 unrepresentable exactly; money in floats re-introduces the drift the integer cents existed to prevent." },
      ],
      difficulty: "hard",
    },
    {
      id: "enterprise-mcq-30",
      prompt: "`SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id` prints 103,244.55 — not the 34,833.28 book. What happened and what is the honest fix?",
      choices: [
        "The join fanned 103 agreements out to 251 lines, repeating each total once per line — pre-aggregate lines to order grain, then join",
        "The totals column contains duplicates that DISTINCT must remove",
        "SUM over a joined table is undefined; use AVG and scale",
        "Divide the result by 251/103 to correct the fan-out",
      ],
      answer: 0,
      why: "Every agreement with multiple rental lines contributes its total once per line — 103 rows became 251 and the book tripled. The fix is grain discipline: fold order_items to order grain in a CTE first (SUM by order_id), then join, so every total appears exactly once. COUNT(DISTINCT o.id) is the bandage for counts; only pre-aggregation fixes sums.",
      notes: [
        { choice: 3, why: "The inflation factor is not uniform — it varies per agreement with line count. A global ratio divides the wrong orders by the wrong factor and never reconciles." },
        { choice: 1, why: "DISTINCT collapses genuinely equal totals (two 100.00 agreements print once) — a different number, wrong for a different reason." },
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
    {
      id: "cs-enterprise-3",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The fleet-family ledger",
      brief:
        "Enterprise-flavored brief on the storefront db: the fleet review opens with the per-family ledger — how many rental days each vehicle family turned, and what book value it carried — because repositioning and rate-card decisions both key off it. Probed facts: 251 rental lines fold to 498 rental days and a 34,833.28 book across 7 fleet families; the DAYS leader is Accessories (121 rental days over 54 agreements) while the MONEY leader is Audio (11,744.01 over just 97 days) — the two leaderboards point at different families, and Electronics (85 days / 4,818.61) rounds out the workhorse tier. Every family in the census carries at least 85 rental days when the gate is set at the workhorse cut.",
      ask: "Return each fleet family carrying at least 85 rental days with its agreement count, rental days and book value in dollars to 2 decimals, busiest days first.",
      template:
        "SELECT p.category AS family,\n       COUNT(DISTINCT oi.order_id) AS agreements,\n       SUM(oi.quantity) AS rental_days,\n       ROUND(SUM({1}), {2}) AS book\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nHAVING SUM(oi.quantity) >= {3}\nORDER BY rental_days {4};",
      slots: [
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the book fold",
          why: "Rental days times the locked day rate is the money a line carried: SUM over it prints Audio's 11,744.01. Folding oi.quantity alone would print the day counts wearing a dollars name — 3,294.29 becomes 97.0 — and SUM(oi.unit_price) alone adds rates, not bookings.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the book precision",
          why: "Money prints to 2 decimals — 11,744.01 is the cell the fleet review reads. ROUND(…, 0) prints 11,744 and every family book drifts by up to half a dollar against the ledger.",
        },
        {
          answer: "85",
          kind: "number",
          label: "the workhorse gate",
          why: "The gate judges a per-family aggregate, so it lives in HAVING after the fold — and 85 is the Electronics row itself, so the census keeps exactly the three workhorse families: 121, 97 and 85 rental days. A gate of 100 drops Electronics; a gate of 50 lets Video (61) and Wearables (53) back in.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-days-first direction",
          why: "The review reads the days leader on top — Accessories 121, Audio 97, Electronics 85 — which is exactly what exposes the days-versus-money split. ASC opens on Electronics and buries the point; the ordering is the argument.",
        },
      ],
      distractors: ["COUNT", "AVG", "ASC", "1"],
      walkthrough:
        "One join, one fold, and a gate that makes the leaderboard honest. The join enriches each of the 251 rental lines with its vehicle family — no fan-out, because every line matches exactly one product — and GROUP BY p.category folds them to 7 families. SUM(oi.quantity) counts rental days (498 platform-wide), SUM(days × rate) folds the book, and HAVING SUM(oi.quantity) >= 85 keeps the workhorse tier: Accessories 54 agreements / 121 days / 3,294.29, Audio 46 / 97 / 11,744.01, Electronics 40 / 85 / 4,818.61. The read writes itself: the DAYS leader turns 3.7x the volume and earns a third of the money — Accessories averages 27.23 per day against Audio's 121.07 — so repositioning and pricing are different conversations with different families. The distractors each break differently: COUNT in the fold prints row counts as money, AVG prints per-line averages, 1 rounds the book to a tenth and the cells stop reconciling, ASC flips the ladder so the review opens on the smallest workhorse. Grain, gate, order — the ledger reproduces itself.",
    },
    {
      id: "cs-enterprise-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The market fate grid",
      brief:
        "Enterprise-flavored brief on the storefront db: the ops board prints the agreement-fate grid — every branch market's bookings decomposed into the four stages, one row per market, all four columns reconciling to the market total by construction. Probed facts: 103 agreements split EU 45 / APAC 37 / US 19 / LATAM 2, and the stage grid reads EU 24 returned-and-billed / 12 on-rent / 6 reserved / 3 no-show, APAC 21 / 8 / 5 / 3, US 5 / 10 / 3 / 1, LATAM 2 / 0 / 0 / 0. The platform columns foot to 52 + 30 + 14 + 7 = 103 — the reconciliation identity the board checks before it reads a single ratio. Notice the story already visible: the US runs only 5 returned against 10 still on-rent, while LATAM's two agreements are both returned and closed.",
      ask: "Return one row per branch market with booked agreements and the four stage counts (returned-and-billed, on-rent, reserved, no-show), biggest book first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS booked,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS returned,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS on_rent,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS reserved,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS no_shows\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY booked {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the returned-and-billed arm",
          why: "The stage map is fixed: 'delivered' is returned-and-billed — 52 agreements, 24 of them in EU. 'on-rent' or 'returned' match nothing (the literal is shipped/delivered), and the column would print zeros while the other three stages foot to the market totals — a grid that reconciles everywhere except the column the board reads first.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the on-rent arm",
          why: "On-rent is 'shipped' — the dispatch stamp has landed and the car is out: 30 agreements, 10 of them in the US. 'delivered' here would mirror slot 1, printing the returned count twice and shrinking the on-rent column to zero.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show arm",
          why: "No-shows are 'cancelled' — 7 agreements, and the trust read lives in this column: APAC 3, EU 3, US 1, LATAM 0. Flagging 'pending' here would indict the 14 reservations — demand that simply has not picked up yet — as failures.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The board reads biggest market on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens on LATAM — two agreements, one account — and the eye compares a two-row market against a forty-five-row one before the totals are even on screen.",
        },
      ],
      distractors: ["'on-rent'", "'returned'", "ASC", "'pending'"],
      walkthrough:
        "One pass, four lenses, one reconciliation. The join attaches each agreement to its branch market and GROUP BY region folds them into four rows; each stage is a conditional aggregate — SUM of a 0/1 CASE flag — so the four stage columns partition the same rows their COUNT totals: every row sums to booked, and the platform columns foot to 52 + 30 + 14 + 7 = 103 by construction. The grid earns its keep in the comparisons: the US runs 5 returned against 10 on-rent (a mid-cycle snapshot), APAC carries the worst no-show count (3 of 37, 8.1%), and LATAM's two agreements both returned — two rows, zero open fleet. The distractors each break differently: 'on-rent' and 'returned' are not status literals, so their column prints zeros and the grid's reconciliation visibly breaks in the column the board reads first; 'pending' re-files the 14 reservations as no-shows and the trust map doubles; ASC opens the meeting on the quietest market. One scan, four honest columns, and the identity does the auditing.",
    },
    {
      id: "cs-enterprise-5",
      tier: "easy",
      topic: "x2",
      universe: "expense",
      title: "The one-pass opex census",
      brief:
        "Enterprise-flavored brief on the storefront db: the branch P&L's opex strip gets refreshed with ONE query — total entries, total spend, the two fixed-cost categories broken out as line counts, and the Tools share as a sanity column — because four sequential queries are four ways to drift while the branch is calling for its board. Probed facts: 36 expense entries footing to 25,416.00; Rent runs 14 lines worth 16,800.00 (the neighborhood-branch footprint tax) and Ads 14 lines worth 4,570.00, so the fixed pair carries 21,370.00 of the 25,416.00 (84.0%); Tools runs 5 lines for 1,525.00 — a 6.0% share — with Travel (3 lines, 2,521.00) making up the rest. Expense tables store INTEGER cents; the dollar read divides by 100.0 once, at the edge.",
      ask: "Return one row: total entries, total spend in dollars, Rent's line count, Ads' line count, and the Tools share of spend — all from a single scan.",
      template:
        "SELECT COUNT(*) AS entries,\n       ROUND(SUM(amount_cents) / {1}, 2) AS total_dollars,\n       COUNT(*) FILTER (WHERE category = {2}) AS rent_lines,\n       COUNT(*) FILTER (WHERE category = {3}) AS ads_lines,\n       ROUND(100.0 * SUM(CASE WHEN category = 'Tools' THEN amount_cents ELSE 0 END) / SUM(amount_cents), 1) AS tools_pct\nFROM expenses;",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Expenses store INTEGER cents; /100.0 is the dollar read that prints 25,416.00 instead of 2,541,600. The .0 matters — bare 100 keeps integer arithmetic and the P&L strip reads a hundredfold-off book. And it divides at the presentation edge only, after SUM has folded the exact cents.",
        },
        {
          answer: "'Rent'",
          kind: "keyword",
          label: "the footprint category",
          why: "The FILTER arm must match the exact stored category 'Rent' — case-sensitive — for the 14 footprint lines to surface. 'rent' matches nothing and prints a silent 0 in the P&L, and 'Travel' would put program spend in the footprint row.",
        },
        {
          answer: "'Ads'",
          kind: "keyword",
          label: "the demand-build category",
          why: "Ads is the second fixed cost: 14 lines, 4,570.00 — the spend that pulls demand into the branches the Rent line pays for. Substituting 'Tools' (5 lines) would understate the fixed stack and misprice the 84.0% coverage the memo quotes.",
        },
      ],
      distractors: ["10.0", "1000.0", "'Travel'", "'rent'"],
      walkthrough:
        "One scan, five honest numbers. COUNT(*) counts all 36 entries and SUM(amount_cents) folds their exact integer cents — 2,541,600 — before the single /100.0 at the edge prints 25,416.00; the FILTER (WHERE …) branches count the fixed-cost subsets inside the same pass — Rent 14 lines, Ads 14 — and the Tools share folds a 0/1 CASE over the same cents: 152,500 of 2,541,600, a 6.0% column the board reads as the sanity check. The fixed pair's 28 lines cover 21,370.00 of 25,416.00 — 84.0% — the sentence the memo exists to say, and it can only be quoted because every number shares one denominator from one scan. The distractors each break differently: /10.0 prints a tenfold book (254,160.00) and /1000.0 a tenfold-shrunk one (2,541.60) — both plausible to a hurried reader until the GL is checked; 'Travel' would put program spend inside a fixed-cost row; 'rent' — lowercase — matches nothing and prints a silent 0 in the middle of a clean P&L, the most dangerous failure mode on the board. One query, one scan, every number reconcilable to the ledger.",
    },
    {
      id: "cs-enterprise-6",
      tier: "hard",
      topic: "t6",
      universe: "growth",
      title: "The market leaderboard",
      brief:
        "Enterprise-flavored brief on the storefront db: the expansion team wants the local leaderboard — the top two accounts by lifetime book in EACH branch market — because branch strategy is local: the account that dominates one market barely registers in another. Probed facts: EU's top rung is account 1 at 7,262.35 with account 3 second at 2,667.93; APAC runs account 7 at 4,574.23 over account 13 at 3,644.56; the US pairs account 5 (6,640.56) with account 10 (645.60); LATAM has exactly one account — account 2 at 852.44 — so its leaderboard is one row long. The four top-rung accounts together hold 19,329.58 of the 34,833.28 book (55.5%): the concentration read the expansion memo opens with. Books carry no ties inside any market's top two, so the rank function's gap behavior never fires — the policy lives in the PARTITION BY.",
      ask: "Return each branch market's top two accounts by lifetime book: market, account id, book in dollars to 2 decimals, and the rung within the market, ordered by market then rung.",
      template:
        "WITH books AS (\n  SELECT c.region AS market,\n         o.customer_id AS account_id,\n         ROUND(SUM(o.total), 2) AS book\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region, o.customer_id\n),\nranked AS (\n  SELECT market,\n         account_id,\n         book,\n         RANK() OVER (PARTITION BY market ORDER BY book {1}) AS rung\n  FROM books\n)\nSELECT market, account_id, book, rung\nFROM ranked\nWHERE rung <= {2}\nORDER BY market {3}, rung;",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-book-first rank",
          why: "The leaderboard ranks by book descending inside each market — the biggest account is rung 1. ASC would crown each market's SMALLEST account and the expansion memo would open on the 645.60 tail instead of the 6,640.56 national book — a correct query aimed at the wrong end of the market.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the local cut",
          why: "The ask is the TOP TWO per market, so the outer filter keeps rung 1 and 2 — 7 rows, because LATAM's single account yields no second rung. The cut is applied OUTSIDE the window in a staged query: a WHERE cannot see RANK() output computed in the same SELECT, so the CTE is not style, it is the only legal shape.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the market-alphabetical outer sort",
          why: "The memo files one leaderboard per market, so the outer ORDER BY walks markets alphabetically — APAC, EU, LATAM, US — with rungs nested inside. DESC would shuffle the market order between deck cuts and every side-by-side comparison against last month's slide breaks.",
        },
      ],
      distractors: ["3", "5", "COUNT", "books"],
      walkthrough:
        "Two grains, two stages, one leaderboard per market. The books CTE folds 103 agreements to 16 account-books grouped by market — the two-grain discipline (SUM per account, region attached through the join) — and the ranked CTE stamps each account with RANK() OVER (PARTITION BY market ORDER BY book DESC): rungs are computed WITHIN each market, so EU's second-place 2,667.93 outranks nothing in the US, where 645.60 is also rung 2. The outer SELECT filters rung <= 2 — the top-two cut, applied after the window exists — and orders by market then rung: EU 7,262.35 / 2,667.93, APAC 4,574.23 / 3,644.56, US 6,640.56 / 645.60, LATAM 852.44 alone. The read is concentration: the four rung-1 accounts hold 19,329.58 — 55.5% of the book — and LATAM's one-row leaderboard is the expansion whitespace, not a bug. The distractors each break differently: ASC inverts every leaderboard and the memo opens on the tails; 3 and 5 widen the cut and drag the retail tail into a national-account slide; COUNT() OVER would number rows within each partition the same way here but is not a rank — it cannot share rungs on ties, which is exactly the silent policy change the market leaderboard cannot afford. Partition, cut, direction — the local read reproduces itself.",
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
    { slug: "department-top-three-salaries", why: "Top accounts per branch market, ranked and joined back for names — the local leaderboard is the market-window drill, and ties on the depth ladder are the tie-breaker follow-up." },
    { slug: "employees-earning-more-than-their-managers", why: "Row-versus-row comparison inside one market: which account out-books its market's anchor. The self-join-with-condition shape behind every peer benchmark." },
    { slug: "nth-highest-salary", why: "The Nth rung of the depth ladder — second-deepest, third-deepest — where LIMIT/OFFSET breaks on the four-way tie at 4 and window shapes do not." },
    { slug: "duplicate-emails", why: "Account hygiene by GROUP BY + HAVING: duplicate contacts poison the corporate book's counts, and detection-before-dedupe is the branch feed's first gate." },
    { slug: "new-users-daily-count", why: "New accounts per day is the branch-opening pipeline read — a dated first-activity fold with a trend line, exactly the whitespace chart expansion wants." },
    { slug: "dormant-reactivation", why: "Accounts that lapsed and came back are the replacement book's quiet growth engine — the reactivation cohort is a two-window fold over agreement dates." },
    { slug: "rfm-segmentation", why: "Recency, frequency, monetary bands turn the depth ladder into an actionable account grid — CASE-band three dimensions and the review agenda writes itself." },
    { slug: "basket-depth-aov", why: "Rental lines per agreement (251 over 103, 2.44) beside average agreement value 338.19 — basket depth and AOV are the two-grain ratio drill in fleet clothing." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Rental lines longer than the platform's average day count — the long-rental outliers that flag accounts outgrowing the standard rate plan." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Accounts whose agreement values climb book over book are the deepening tail — a LAG-comparison fold that finds them before the quarterly review does." },
    { slug: "hopper-company-queries-ii", why: "Active-versus-dropped driver censuses map one-to-one onto on-rent versus returned fleet counts — the fate census as a cohort walk." },
    { slug: "bikes-last-time-used", why: "Last return per vehicle class is the rotation input — a MAX-over-group fold that tells the ready line which cars just came back." },
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Occupancy against capacity is the ready-line utilization read — booked days against listed-available stock, the branch's fleet-coverage ratio." },
    { slug: "calculate-orders-within-each-interval", why: "Bookings bucketed by dispatch-lead interval — the 2-to-4-day spread turned into a histogram the ready-line staffing model actually consumes." },
    { slug: "rolling-7d-actives", why: "Rolling-week actives per market is the branch pulse — a windows-over-dates fold that smooths the weekend booking spike without hiding it." },
    { slug: "ar-aging-schedule", why: "Statements bucketed by days outstanding is the collections board — CASE aging bands over the settlement clock, the close's other half." },
  ],
};
