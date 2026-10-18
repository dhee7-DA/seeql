// Burger King — Wave-11 (Task 102), food domain, no tagged pool (0 rows) — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12, incl. the wave-8+9 canonicalized cells).
// Franchisee-economics SQL: the storefront db read as a franchisor's back office — customers are
// franchisee operator accounts (region = market; 16 operator groups), orders are franchise orders
// booked against those accounts (delivered = completed-and-settled 52, shipped = fired-and-
// transmitted with shipped_at as the fire stamp 30, pending = in queue 14, cancelled = aborted 7),
// order_items are menu line items (quantity = units, unit_price = menu price; 251 lines over 103
// orders, a 2.44 fan-out, max line quantity 3), products are menu SKUs (16 = the limited-menu
// discipline), suppliers are the six distribution partners, invoices are royalty + ad-fund
// statements (28), payments are remittance rails (card = ACH/tender rails 16 legs, wire = treasury
// rails 11 legs), expenses are ad-fund / co-op opex, ledger_entries the GL. Money tables store
// INTEGER cents — the dollar read is amount_cents / 100.0; orders.total and order_items.unit_price
// are REAL dollars. Pool provenance: company-pools.md carries NO Burger King section (0 tagged
// rows, grep-verified) — all 10 topic slug sets and all 16 problems are theme-curated from the
// theme menu's sql rows (no w*/d*/f*-initial rows) and say so in brief P4. Extended wave R6-B:
// 30 MCQs, 24 theory, 6 cases (s6/j5/q6/j7 added — none used by food siblings), 32 problems.
// Probe-declared cells (readonly bun:sqlite probes against db/custom.db, nothing written, no files
// left behind — every other figure quoted here is verbatim from scripts/company-facts.md):
// (1) DATE-grain census — created_at carries no sub-day resolution: strftime('%H', created_at)
//     reads '00' on all 103 rows; daypart reads therefore stay at date grain and say so.
// (2) Split-rail fold — every one of the 22 leg-carrying statements satisfies legs = distinct
//     rails; the 5 split-rail statements (1, 5, 12, 19, 22) each carry exactly 1 card + 1 wire leg,
//     so a COUNT(*) = 2 gate reproduces the distinct-method census on this book by coincidence.
// (3) Orphan-leg census — 0 payment legs point at a missing statement (the FULL OUTER orphan arm
//     is empty by probe; the arm exists to prove it).
// (4) cs-burgerking-1 bench ladder and cs-burgerking-2 coverage buckets re-verified cell-for-cell
//     before slotting (16-row rank ladder 24/17/14/13/5 with the four-way tie at 4; buckets exact
//     21/65,612.00 both sides · never-remitted 6/15,217.00/0.00 · partial 1/6,148.00/4,000.00).
// Case families t5 + x5 — neither used by any food-domain sibling (mcdonalds s7/x3/j7/t4/j5/q6,
// kfc s6/j4, dominos j3/t4/s6/q6/l8/x2); universes growth + month-close; tiers easy + hard.
// Angle kept DISTINCT from mcdonalds (company-owned menu-mix emphasis) and kfc (digital-guest
// emphasis): Burger King's lens is the FRANCHISEE as the P&L unit — royalty statements, remittance
// discipline, the 6-row no-leg dunning register (royalties never remitted), ad-fund/co-op opex.
// NOTE for the wave-11 registry wiring agent: burgerking is NOT yet in registry COMPANY_META
// (wave-11 unwired). Wire id "burgerking", domainId "food", name "Burger King",
// tagline "Franchisee economics at the flame grill: royalties, remittances, coupon traffic",
// accent "text-amber-300" to match this header exactly.

import type { CompanyKit } from "../types";

export const burgerkingKit: CompanyKit = {
  id: "burgerking",
  domainId: "food",
  name: "Burger King",
  tagline: "Franchisee economics at the flame grill: royalties, remittances, coupon traffic",
  accent: "text-amber-300",

  brief: [
    "**Burger King** is the flame-grilled flagship of Restaurant Brands International — nearly 19,000 restaurants and one of the most heavily franchised systems in food, which means the P&L the analysts actually model is the franchisee's, not just the brand's. Every number in the building is a conditional count over the same small set of objects, and this kit maps the storefront db onto that world: the 16 customers rows are **franchisee operator accounts** (region = market), the 103 orders are franchise orders worth **34,833.28**, and the 251 order_items rows are menu line items — quantity = units, unit_price = menu price. The status map is fixed: delivered = {emerald:completed-and-settled} (52, 50.5%), shipped = {sky:fired-and-transmitted} (30, 29.1%), pending = in queue (14, 13.6%), cancelled = {rose:aborted} (7, 6.8%). The 16 products are menu SKUs — the limited-menu discipline is a real strategy here, and the db carries exactly 16.",
    "The data org splits into franchise finance, ops analytics and a small menu-mix pod, and all three read the same spine at different grains. Franchise finance owns the royalty book: **28 statements billed against 27 remittance legs**, where every dollar read is `amount_cents / 100.0` — and the register that opens every close is the **6 statements never remitted, worth 15,217.00** (the open cohort 18/873.00, 21/1,295.00, 24/4,937.00, 26/3,562.00, 27/2,794.00, plus the paid-claim lie #28 at 1,756.00 with zero legs). Remittances ride two rails — card 16 legs / 37,364.00, wire 11 / 32,248.00 — and 5 statements settle on both. The ops pod owns the fire clock: 82 of 103 orders carry the `shipped_at` stamp, averaging **2.98 days** on a 2–4 spread, and the 14 queued orders have no stamp yet (a population definition, not a cleanup job).",
    "Interview screens are census-then-denominator with a franchisee accent. A typical loop opens with a **two-grain market census** — EU runs 45 orders from 8 operator accounts while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'do aborted orders belong in your kept rate?'*), then into the operator ladder where the bench runs 24/17/14/13/5 booked orders with a **four-way tie at 4** and rank semantics become a policy call about peer operators. The menu questions lean on bands: the budget band (< 50) holds 8 SKUs at 32.06 average, the mid band holds 8 at 111.5, and the premium band is {rose:empty} — the ceiling is 199.99. One honesty rule surfaces in every loop: created_at is DATE-grain only — *no hour component exists* — so daypart and coupon reads ship at date grain or not at all.",
    "Preparation strategy: the pools file carries no Burger King section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fate funnels with stated denominators, two-grain censuses, tie-heavy operator ladders, band CASE folds, cents-safe remittance math and the never-remitted register. Do the topics in order, then run the six case studies on the live storefront db — built for spaced practice rather than one sitting: the {amber:operator bench ladder} and the {rose:royalty coverage census} open the set, the menu-band CASE fold and the dunning anti-join drill the pricing and close reads, and the coupon-window spine gate and the distribution partner fold cover growth and supply. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction, and every coverage census to 28.",
  ],

  dayInLife: [
    "**08:20 —** The day starts with the franchise-order fate refresh. An ops-analytics analyst opens the dashboard before standup: did overnight orders land, did any fired order go out without its `shipped_at` stamp, does the one-pass fate census reconcile — 52 completed + 30 fired + 14 queued + 7 aborted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the fire clock drifts off the **2.98-day** norm — the US already runs 3.07 against APAC's 2.93 — the queue gets pulled before marketing's weekly read ships. Marketing also wants the breakfast-vs-dinner split; the honest answer is *the db is DATE-grain*, so the split ships as a weekday fold or it does not ship.",
    "**11:40 —** Midday is the coupon-window read. The calendar flight is live, and there is **no coupon flag on orders** — so the traffic read is the month spine at date grain: launch month 3,731.97 on 8 orders, the February and September peaks at 9 orders, the July trough at **1,193.86** with both that month's aborts attached. The menu-mix pod wants the band re-cut (8 SKUs at 32.06 against 8 at 111.5, premium arm empty), and regional ops wants the operator ladder with the four-way tie at 4 handled honestly — shared rungs, named policy. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the population spelled out so the number survives the franchisee council argument*.",
    "**16:15 —** The afternoon tilts toward money. The dunning register refreshes first — **6 never-remitted royalty statements worth 15,217** — before franchise finance sends a single reminder; the coverage census reads **21 exact (65,612.00 both sides), 1 partial** (4,000.00 of 6,148.00, #25) and feeds the chase list; and the anomaly walk goes line by line: a void-but-remitted statement (#11, 925.00), a paid-claim statement with zero legs (#28, 1,756.00), and the 5 split-rail statements (1, 5, 12, 19, 22) whose legs straddle card and wire. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Franchise order book", what: "103 franchise orders booked worth 34,833.28, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the ticket-band story — one 1,088.44 family-pack night outweighs the smallest order forty-fold." },
    { name: "Order kept rate", what: "Completed ÷ ALL orders booked: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count, and the denominator — queued and fired orders included — is the whole interview." },
    { name: "Fire clock", what: "Order open to fire stamp (created_at → shipped_at) over stamped orders only: 82 of 103, 2.98-day average, range 2–4. The 14 queued orders carry no stamp — a population definition the report's title is required to state." },
    { name: "Royalty coverage census", what: "Billed versus remitted: 21 exact settlements (65,612.00 both sides), 1 partial (#25: 4,000.00 of 6,148.00), 6 never-remitted worth 15,217.00. One CASE away from the AR line, and the buckets must foot to 28 or the close does not ship." },
    { name: "Dunning register", what: "The 6-row no-leg list: open statements 18/873.00, 21/1,295.00, 24/4,937.00, 26/3,562.00, 27/2,794.00 (13,461.00) plus paid-claim #28 at 1,756.00 — a status that lies. #24 is the biggest single chase; status is a claim, remittance rows are the ledger of record." },
    { name: "Remittance rails", what: "Card 16 legs / 37,364.00 against wire 11 legs / 32,248.00 — 69,612.00 total, tying to the ledger cash credit. 5 statements (1, 5, 12, 19, 22) settle on BOTH rails; settlement averages 28.4 days, fastest 13, slowest 84." },
    { name: "Coupon-window spine", what: "The 14-month order spine (2024-01 to 2025-02) read at DATE grain: launch 3,731.97 on 8 orders, February and September peak at 9 orders, July troughs at 1,193.86. There is no coupon flag on orders — lift is a controlled-experiment read, not a column." },
    { name: "Menu band mix", what: "16 SKUs = the limited-menu discipline: budget band (< 50) 8 SKUs at 32.06 average, mid band (50–200) 8 at 111.5, premium band EMPTY (ceiling 199.99). Line fan-out runs 251 lines over 103 orders (2.44), max line quantity 3." },
  ],

  topics: [
    {
      name: "Order-fate funnels & kept-rate denominators",
      why: "Every Burger King read starts from the franchise-order fate census: 52 completed-and-settled, 30 fired-and-transmitted, 14 queued, 7 aborted — 103 by construction. The kept rate is a conditional count, and the interviewer's first question is what the denominator holds: queued orders stay in a funnel base and drop out of a completion base, and saying which before writing SQL is the habit being graded.",
      slugs: ["percentage-of-users-attended-a-contest", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "funnel-step-conversion", "basket-depth-aov"],
    },
    {
      name: "Two-grain market censuses",
      why: "Orders and operator accounts are different grains of the same join, and every census here reports both: EU runs 45 orders from 8 operator accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio (5.6 versus 9.5 orders per account) is the intensity read that decides where field support flies.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-ii", "reported-posts", "growth-accounting"],
    },
    {
      name: "Coupon-window month spines",
      why: "The coupon calendar is Burger King's traffic story, but orders carry no coupon flag — so the honest read is the month spine at date grain: 14 buckets from 2024-01 to 2025-02, launch at 3,731.97, the July trough at 1,193.86. `STRFTIME('%Y-%m', created_at)` is the spine; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction.",
      slugs: ["list-the-products-ordered-in-a-period", "monthly-transactions-i", "sales-analysis-iii", "ads-funnel", "budget-pacing"],
    },
    {
      name: "Operator leaderboards & tie policy",
      why: "The franchisee bench ranks operator accounts, and ties are guaranteed: the ladder runs 24, 17, 14, 13, 5 booked orders, then FOUR operators tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — a policy about peer franchisees, not syntax. The field team publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "top-five-artists", "cohort-retention-matrix"],
    },
    {
      name: "Menu-band CASE folds",
      why: "Menu bands are CASE-classified — the fold splits 16 SKUs into 8 budget (< 50) at 32.06 average and 8 mid (50–200) at 111.5, with the premium arm EMPTY by probe (ceiling 199.99). The arms must be exhaustive and ordered: a hole in the CASE is a hole in the mix story, and a reordered WHEN quietly re-bands the base. An empty arm is a population fact to state, not a bug to patch.",
      slugs: ["calculate-special-bonus", "triangle-judgement", "the-category-of-each-member-in-the-store", "credit-utilization-bands", "calculate-product-final-price"],
    },
    {
      name: "Fire-clock latency",
      why: "The fire clock measures order open to fire stamp — julianday(shipped_at) minus julianday(created_at) — over the 82 of 103 orders that carry the stamp, averaging 2.98 days on a 2–4 spread. The 14 queued orders have no stamp and no cycle yet, and the regional cut (APAC 2.93 to LATAM 3.5) only reconciles if the population is stated. AVG with a silent NULL-shrink is the classic wrong number wearing the right name.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "second-day-confirmation"],
    },
    {
      name: "Never-remitted anti-joins",
      why: "The dunning register is the anti-join that runs every close: statements carrying zero remittance legs — 6 rows worth 15,217.00, including paid-claim #28 at 1,756.00, which is why the payments table is the ledger of record and the status column is a claim. Building it honestly (LEFT JOIN plus IS NULL, or NOT EXISTS) and reconciling it against the 22 leg-carrying statements is the exact discipline being graded.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "find-the-missing-ids"],
    },
    {
      name: "Royalty-coverage CASE classification",
      why: "The coverage census classifies at statement grain — legs equal billed → 'exact' (21, including void-but-remitted #11 at 925.00, which folds in by construction), zero legs → 'never remitted' (6), else 'partial' (1: 4,000.00 of 6,148.00). Classification happens BEFORE any rollup, the buckets must foot to 28, and the two error modes — void-but-remitted, paid-but-never-remitted — are mirrors the census catches and the status column never will.",
      slugs: ["count-salary-categories", "type-of-triangle", "evaluate-boolean-expression", "ar-aging-schedule", "delinquency-buckets"],
    },
    {
      name: "Cents-safe money reads",
      why: "Royalty statements and remittance legs bill in INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and eats cents on every odd-cent row. The rails matter too: card legs (16, 37,364.00) versus wire legs (11, 32,248.00) tie to 69,612.00 at the ledger cash credit, and the split-rail statements straddle both.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "npv-queries", "balance-rollforward", "gl-reconciliation", "trial-balance-check", "duplicate-charge-pairs"],
    },
    {
      name: "Concentration & share arithmetic",
      why: "The book concentrates hard: 63.5% of booked value sits with operator accounts whose lifetime spend crosses 3,000 (71.2% above 2,000), and the top distribution partner carries 32% of network revenue (11,130.25) with the top two at 58.7%. Shares are 100.0-multiplied BEFORE the division — SUM of 0/1 flags over COUNT is integer arithmetic, and the abort share truncates to a displayed 0 while APAC actually runs 8.1%.",
      slugs: ["queries-quality-and-percentage", "ads-performance", "compute-the-rank-as-a-percentage", "amount-anomaly-zscore"],
    },
  ],

  theory: [
    {
      id: "burgerking-t1",
      q: "Your franchise review joins operator accounts to franchise orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a status column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue board joins orders to operator accounts: an order with no operator row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-account report must be LEFT from operators: the accounts with no orders ARE the answer, arriving with NULL order columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload account row — the LEFT quietly became an INNER and the dormant bench vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-booked operators — all 16 accounts appear in the order table somewhere — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how dormant-operator reports die in the franchisee council review.",
      tag: "joins",
    },
    {
      id: "burgerking-t2",
      q: "The operator ladder runs 24, 17, 14, 13, 5 booked orders, then FOUR operators tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this bench the four-way tie consumes ranks 6 through 9 and the next distinct count (3) lands on rank 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose operator gets the field team's attention first — defensible only with a named tie-breaker like booked value or account id. There is a second layer: a running ad-fund walk uses SUM OVER (ORDER BY paid_on), whose default frame is RANGE — rows tied on the same settlement date enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer operators, an explicitly named tie-breaker otherwise — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "burgerking-t3",
      q: "The census shows 103 franchise orders and 16 operator accounts; EU shows 45 orders and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts order rows after the join — one row per franchise order, so the 24-order operator contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 orders collapse to 8 operator groups. Neither is wrong: orders measure load and traffic, accounts measure installed base and coverage. The ratio — 5.6 orders per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating, and the platform mean (103 over 16 = 6.44, with exactly four operators above it) is the gate the field team actually uses. The trap that catches candidates is a third grain: join order_items for menu lines and COUNT(*) silently counts lines, not orders — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "burgerking-t4",
      q: "shipped_at is NULL until a franchise order is fired. What is your policy for the fire-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only fired orders have a fire time, so the report measures open-to-fire for the 82 of 103 orders that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL orders returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 aborted rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day fires for queued orders that have not fired, and it poisons the 2.98 baseline every regional drift alert keys off. On a franchise system where the operator pays the labor for every queued minute, a report whose WHERE clause is doing definitional work without saying so is exactly what the ops review hunts for.",
      tag: "nulls",
    },
    {
      id: "burgerking-t5",
      q: "The growth review wants booked value per market for markets carrying at least ten orders. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards fired, queued and aborted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error. One more placement rule these screens love: the abort share — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer arithmetic and the share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0 while APAC actually runs 8.1. The strong answer places every filter by asking: is this a fact about one order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "burgerking-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 orders always produce a mean (6.44 orders per operator, exactly four operators above it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The NOT IN variant is worse: one NULL invoice_id in a remittance-leg staging list poisons every comparison and the dunning register empties while looking valid — policy is EXISTS for existence tests. The correlated cousin (compare each order to ITS market's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "burgerking-t7",
      q: "Marketing wants a breakfast-versus-dinner daypart split and a coupon-window trend from this db. What can you honestly ship, and how do you build the month spine?",
      a: "The honest headline comes first: created_at is DATE-grain — strftime('%H') reads '00' on all 103 rows — so a daypart split cannot ship at hour grain, and the answer is to say so and offer the date-grain stand-in: weekday folds and month buckets, labeled as such. Fabricating hours from julianday deltas invents data; shipping a disclaimer-free hour column is worse than declining. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the trend invents a spike. Cut windows half-open — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN the month ends silently drops the last night's orders, which is exactly when a coupon flight lands. And on a LAG walk the first row's prior value is NULL — the baseline, never a zero. Coupon lift itself has no column here: it is a controlled-experiment read, and the strong candidate says so before marketing asks twice.",
      tag: "dates",
    },
    {
      id: "burgerking-t8",
      q: "Finance says a royalty statement is 'paid' but the remittance rails have no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.invoice_id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) claims status 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the coverage census: 21 exact (65,612.00 both sides — void-but-remitted #11 folds in by construction, paid-claim #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — bare /100 is integer division that eats cents on odd rows. Then the rails: card legs 16 / 37,364.00 and wire legs 11 / 32,248.00 must tie to the 69,612.00 cash credit, with 5 split-rail statements (1, 5, 12, 19, 22) straddling both. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "burgerking-t9",
      q: "Two analysts write the dunning register: one with LEFT JOIN + IS NULL, one with NOT EXISTS. When do the two shapes disagree, and which do you ship?",
      a: "On this book they agree: both return the 6 zero-leg statements worth 15,217.00, because payments.invoice_id is NOT NULL by schema, so there is no NULL-leg row for the two shapes to treat differently. They diverge when the joined column can be NULL — LEFT JOIN + IS NULL keeps a leg row whose invoice_id is NULL in the 'matched' bucket, while NOT EXISTS asks the existence question directly and is immune. NOT EXISTS is also the shape that survives staging tables, where NULLs sneak in, and it short-circuits on the first hit. The house default is NOT EXISTS for existence tests, with the LEFT JOIN version kept as the cross-check — when the two disagree on a close, the disagreement IS the finding, and neither ships until you know which population each one read.",
      tag: "joins",
    },
    {
      id: "burgerking-t10",
      q: "The ad-fund walk runs SUM(amount_cents) OVER (ORDER BY paid_on) across remittance legs. Two legs settled the same day and the cumulative jumps twice at once. What is happening and what is the fix?",
      a: "With ORDER BY, the window default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers: rows tied on paid_on enter the cumulative together, so the walk steps two legs in one day. The fix is to say the frame out loud — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly leg by leg. Which one is right is a policy question: the finance walk wants per-leg settlement order, so ROWS with a named tie-breaker (leg id) is the honest shape; RANGE is only correct if same-day legs are meant to settle as a batch. On a book where 5 statements settle on both rails and settlement runs 13 to 84 days, ties on paid_on are routine, not edge cases — and the wrong frame quietly redefines the running number every reviewer reads.",
      tag: "windows",
    },
    {
      id: "burgerking-t11",
      q: "Franchise ops wants operator accounts tiered into quartiles by booked orders. How do you build the tiers, and what do ties do to them?",
      a: "NTILE(4) OVER (ORDER BY booked_orders) is the tile fold — it splits the 16 operator rows into four buckets of 4 as evenly as the rows allow, biggest book first. Ties do not break NTILE: it counts rows, not values, so two operators tied at 4 booked orders can land in different quartiles — a defensible tile is still a peer split the franchisee council will argue about, so the tier definition ships with the tie policy named. PERCENT_RANK is the value-based alternative: tied operators share the same percentile, which is the fairer read for peer accounts but no longer guarantees equal-size buckets. The trap to avoid is computing tiers with scalar math — ROUND(4 * rank / 16) — which re-derives NTILE badly and drifts whenever the bench size changes. State which grain the tile counts (rows) and which the percentile measures (values), then let the business pick.",
      tag: "windows",
    },
    {
      id: "burgerking-t12",
      q: "The close packet wants one cell listing the never-remitted statement numbers, comma-separated, beside the bucket totals. How do you fold rows into that string, and what breaks?",
      a: "GROUP_CONCAT is the fold: GROUP_CONCAT(i.id) over the zero-leg statements returns the dunning ids as '18,21,24,26,27,28' inside one cell, and GROUP_CONCAT(i.id ORDER BY i.id) — SQLite supports the ORDER BY inside the aggregate — pins the order so the cell is stable across reruns. The things that break: no ORDER BY means the id order is whatever the scan produced, so the cell shuffles between environments and someone diffs it by eye; no separator argument means the default comma, which is right here but wrong for names; and folding at the wrong grain — grouping by region as well — splits the register into per-market strings whose parts no longer foot to 6. GROUP_CONCAT is a display fold, not a numeric one: it belongs in the presentation layer of the close packet, after the buckets foot to 28, never as the arithmetic that proves them.",
      tag: "aggregation",
    },
    {
      id: "burgerking-t13",
      q: "The ops board wants all four fate counts — delivered, shipped, pending, cancelled — in one pass over orders. Compare FILTER (WHERE …) against SUM(CASE …) for that job.",
      a: "Both shapes produce the four branches in one scan: COUNT(*) FILTER (WHERE status = 'delivered') reads cleanest on SQLite 3.30+, and SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs anywhere. The discipline both enforce is the reconciliation identity: the four branches must sum to COUNT(*) — 52 + 30 + 14 + 7 = 103 — and a branch built with a sloppy predicate is what breaks it. SUM(CASE) without the ELSE silently returns NULL on the branches that never fire, which prints a blank cell instead of a zero; FILTER never does that. Four sequential queries are the anti-pattern: four scans, four chances for a status list to drift, and no identity forcing them to reconcile. One pass, one population, branches that foot by construction — that is the answer the panel listens for.",
      tag: "aggregation",
    },
    {
      id: "burgerking-t14",
      q: "Where does COALESCE belong in the dunning register — and where is IFNULL(latency, 0) actively dangerous?",
      a: "COALESCE belongs on money folds over outer joins: COALESCE(SUM(p.amount_cents), 0) makes a zero-leg statement print remitted 0.00 instead of NULL, so the register's arithmetic — billed, remitted, gap — stays numeric down the column. The danger case is the fire clock: IFNULL(julianday(shipped_at) - julianday(created_at), 0) invents a same-day fire for every queued and aborted order, drags the 2.98-day average toward ~2.37, and poisons the baseline every regional drift alert keys off — a fabricated number wearing the right name. The rule is about what the NULL means: an outer-join NULL is 'nothing settled', so zero is the honest fold; a missing event stamp is 'has not happened', so zero is a lie and the row belongs in a stated-out population instead. Same function, opposite verdicts — the panel wants the reasoning, not a blanket rule.",
      tag: "nulls",
    },
    {
      id: "burgerking-t15",
      q: "The bench ladder shares rungs on ties and reads alphabetical within a shared rung. How do you write an ORDER BY that guarantees that, and what does 'stable sort' actually promise here?",
      a: "Two keys, explicit: ORDER BY booked_orders DESC, operator ASC — the count descends, and within a shared count the operator name breaks the tie alphabetically. Never rely on the database to 'remember' insertion order: SQL result order is undefined without ORDER BY, and a sort is only stable in the sense that the keys you named decide it — SQLite makes no stability promise beyond the columns you list, so the second key must be IN the query, not assumed. The same discipline runs through the close: buckets ordered by statement count DESC with the bucket name as tie-breaker, remittance legs by paid_on then leg id. The follow-up the panel loves: ORDER BY bench_rank, operator after a window function — ranking first, alphabetical second — which is exactly how the published bench avoids two printings of the same ladder disagreeing.",
      tag: "pipeline",
    },
    {
      id: "burgerking-t16",
      q: "Growth wants each operator's booked value beside its MARKET's average booked value. Walk me through the correlated-subquery shape and its cost.",
      a: "The correlated shape re-runs an inner fold per outer row: SELECT c.name, o_value.v, (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE c2.region = c.region) — the inner query carries a reference to the outer row's region, so for each of the 16 operators SQLite re-folds that market's orders. On 16 rows it is free; on a book of millions it is the classic N+1, and the honest alternatives are a window — AVG(total) OVER (PARTITION BY region) after joining to operators — or a derived table of market averages joined back on region, both of which fold each market once. The behavior difference to state out loud: the window computes every market's average whether you display it or not, the correlated form only computes the markets present in the outer result, and an empty market slice leaves the correlated scalar NULL — which then silently drops from any comparison built on top of it.",
      tag: "subqueries",
    },
    {
      id: "burgerking-t17",
      q: "EXISTS, IN, and a JOIN against a DISTINCT subquery all can answer 'which operators booked something last month'. Which do you reach for and why?",
      a: "EXISTS is the house default: it short-circuits on the first matching order, it is NULL-proof — an IN list containing one NULL turns every NOT IN comparison UNKNOWN and empties the report — and it states the intent (existence) rather than the mechanism. IN with a literal subquery is fine when the list is small, known-NULL-free, and static, but it materializes the whole list and dies on NULLs exactly when staging tables are involved. The JOIN-against-DISTINCT shape is the semi-join you write when the planner needs help or when you also need columns from the matched side — but a plain JOIN without DISTINCT fans the outer rows back out, one per match, and silently double-counts operators who booked twice. The interview answer: name the semantics you want (does at least one row exist?), pick the shape whose failure mode you can state, and on this db prove the edge — the anti-join of the same three shapes must all return the same 6 dunning statements or one of them misread the population.",
      tag: "subqueries",
    },
    {
      id: "burgerking-t18",
      q: "Statements settle in 28.4 days on average — fastest 13, slowest 84. How is that latency computed off this schema, and what are the grain traps?",
      a: "The latency is julianday(paid_on) - julianday(issued_on) folded per statement — the FIRST leg's paid_on if you count settlement from the first remittance, or the leg-level average if you read per rail; saying which is the whole answer, because 5 statements settle on both rails and their two legs land on different days. Fold at statement grain: MIN(paid_on) per invoice for time-to-first-remittance, then AVG over the 22 leg-carrying statements — the 6 zero-leg statements have no latency and must be excluded by a stated population, not silently by a NULL-shrinking AVG. The traps: comparing TEXT dates with bare subtraction works only while the format is uniform ISO — julianday is the explicit cast that survives format drift — and the 84-day tail is a real operator, not an outlier to trim, because the dunning register exists precisely to chase that tail. Averages without the min/max spread are how a 28.4 that looks stable hides a 13-to-84 spread that is not.",
      tag: "dates",
    },
    {
      id: "burgerking-t19",
      q: "created_at is DATE-grain, so the daypart read is dead. What is the honest weekday-fold stand-in, and how do you build it?",
      a: "Say the limitation first — strftime('%H', created_at) reads '00' on all 103 orders, so breakfast-versus-dinner cannot ship at hour grain, and fabricating hours from julianday decimals invents resolution the stamps do not carry. The stand-in is the weekday fold: STRFTIME('%w', created_at) buckets the week 0 (Sunday) through 6 (Saturday), and the traffic story ships as Monday-versus-Saturday instead of dayparts — labeled as a date-grain read, in the title and the footnote. Build it with the same census discipline as everything else: seven buckets, counts foot to 103, revenue foots to 34,833.28, and the ordering is on the numeric cast or the code order 0-6, not on the label text. If the business insists on hour grain, the answer is to request the timestamp feed — not to ship a chart whose x-axis pretends the db knows what time it is.",
      tag: "dates",
    },
    {
      id: "burgerking-t20",
      q: "Walk me through writing the menu-band CASE so it cannot silently mis-band a SKU.",
      a: "Three rules. Exhaustive arms: budget under 50, mid 50 to 200, premium ELSE — the ELSE is what guarantees every one of the 16 SKUs lands somewhere, and the empty premium arm is a population fact to state, not a hole to patch. Ordered predicates: WHEN price < 50 before WHEN price <= 200 — CASE evaluates top-down, so a reordered pair quietly re-bands the 49.00 SKU into mid, and the band counts stop footing to 16 with no error anywhere. Literal-typed bounds: the thresholds are numbers against a REAL column — a text '50' compares by type rules and re-bands everything. Then verify by construction: the band counts must sum to COUNT(*) over products, the averages must reconcile with the quoted 32.06 and 111.5, and the premium arm must print zero rows because the ceiling is 199.99. A band fold that cannot prove those three things is a slide, not a census.",
      tag: "case",
    },
    {
      id: "burgerking-t21",
      q: "The board stacks a completed-orders block over a fired-orders block. UNION or UNION ALL — and what does the choice have to do with the 103 reconciliation?",
      a: "UNION ALL, and the reason is the reconciliation: the fate board exists so the branches foot to 103 by construction — 52 + 30 + 14 + 7 — and UNION dedups whole ROWS silently, so two branches that emit byte-identical rows (same label, same count shape, no distinguishing column) collapse into one and the board loses a row with no error anywhere. The safe pattern is UNION ALL plus either a literal branch label ('completed', 'fired') or a column list that cannot collide, with a comment stating why duplicates are impossible. UNION is only correct when you genuinely want set semantics — dedup across branches is the feature, not decoration. The close-culture version of the same rule: EXCEPT answers 'which orders are in the funnel but never got a stamp', and if an EXCEPT between two branches that should be disjoint returns rows, the branches overlap and the 103 identity is already broken upstream.",
      tag: "sets",
    },
    {
      id: "burgerking-t22",
      q: "The rail census says card 37,364.00 plus wire 32,248.00 must tie to the ledger cash credit of 69,612.00. How do you write that tie-out so it cannot lie?",
      a: "Two folds, one delta: fold payments by method — SUM(amount_cents) / 100.0 over card legs and wire legs, with COUNT(*) beside it so the leg counts 16 and 11 ship with the dollars — then subtract the ledger cash credit and assert the delta is zero in the query's own output: a CASE that prints 'TIE' or the offending delta. The tie-out discipline: every dollar read is amount_cents / 100.0 exactly once — a bare /100 truncates odd cents and a second division eats them back off, and either way the 69,612.00 stops footing while looking plausible. Watch the grain: folding by method at LEG grain then comparing to a statement-grain ledger line only ties because the legs are the ledger — the 5 split-rail statements (1, 5, 12, 19, 22) contribute one leg to each rail, so no statement appears twice on one rail. When the delta is not zero, the census that finds the offending legs — method fold beside per-statement coverage — ships with the close; the number alone does not.",
      tag: "money",
    },
    {
      id: "burgerking-t23",
      q: "Why does this team treat the payments table as the ledger of record and the statement status column as a claim? Give the query-level version.",
      a: "Because the status column is an assertion about the world and the legs are the world. Query-level: the coverage census classifies by leg folds — legs sum to billed is 'exact', zero legs is 'never remitted', else 'partial' — and it catches both mirror-image lies: #28 claims 'paid' at 1,756.00 with zero settlement legs (paid-claim lie), and #11 is 'void' at 925.00 yet carries a leg for exactly 925.00 (void-but-remitted). A status-filtered report ships both lies to the franchisee council; the leg-fold census reconciles 21 exact (65,612.00 both sides, void-but-remitted folding in by construction, paid-claim folding out), 1 partial and 6 none, footing to 28 statements and 86,977.00 billed. The rule generalizes: any column that asserts a state ('paid', 'void', 'settled') is a claim to be tested against the transaction rows that constitute it — and the analyst who reports the claim without the test is the one the close review is hunting for.",
      tag: "quality",
    },
    {
      id: "burgerking-t24",
      q: "The market ladder ranks operator accounts within each region, and the global ladder ranks them across the system. How does the window change between the two — and what stays fixed?",
      a: "Only the partition changes: RANK() OVER (PARTITION BY c.region ORDER BY COUNT(*) DESC) restarts the ladder per market, while dropping the PARTITION BY ranks the whole 16-operator bench against each other. What stays fixed is the fold underneath — GROUP BY o.customer_id still collapses 103 orders to 16 operators, and COUNT(*) still counts orders, not lines — because the classic bug is adding a window and accidentally changing the grain (join order_items for a menu read and the rank silently ranks line counts). The reads answer different questions: the global ladder feeds the concentration story (top four operators carry 63.5% of booked value), the partitioned one feeds field support (EU's 8 accounts rank among themselves, where the 45-order load actually lives). And state the tie policy again per cut — the four-way tie at 4 shares rungs in both ladders, but 'peer within region' and 'peer across the system' are different peer groups, and the published policy names which one it means.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "burgerking-mcq-1",
      prompt: "A franchise order's status reads 'shipped'. In this kit's Burger King stage map, what happened?",
      choices: ["Fired-and-transmitted — the fire stamp shipped_at has landed", "Completed and settled — the order finished its cycle", "Aborted — the operator voided the order", "Still in queue awaiting the kitchen"],
      answer: 0,
      why: "The stage map is fixed: shipped = fired-and-transmitted (30 of 103 orders), with shipped_at as the fire stamp. It is stamped and in motion — but not a completed, settled cycle.",
      notes: [
        { choice: 1, why: "Completed-and-settled is 'delivered' — 52 orders. Calling fired orders completed inflates the settled base before a single cycle closes." },
        { choice: 3, why: "Queued is 'pending' — 14 orders with no fire stamp yet. Pending is not in-motion; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-2",
      prompt: "The kept rate counts completed orders. The db holds 52 delivered, 30 fired, 14 queued and 7 aborted of 103 booked. What is the kept share, and over which population?",
      choices: ["52/89 = 58.4% — completed over completed-plus-fired", "52/103 = 50.5% — completed over ALL orders booked", "52/82 — completed over fire-stamped", "52/16 = 325% — completed over operator accounts"],
      answer: 1,
      why: "The house definition: completed ÷ ALL orders booked — queued and fired stay in the denominator because 'not yet completed' is exactly what the kept rate watches. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 queued inflates the share to 58.4% by deleting the population the funnel exists to watch — the orders that convert next." },
        { choice: 2, why: "52/82 mixes two funnel steps into one ratio — delivered is completion, shipped_at is the fire stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-3",
      prompt: "EU carries 45 franchise orders from 8 operator accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to operator accounts (8). The gap between them — 5.6 orders per account — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every order carries an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "SUM(total) reads 15,089.23 — booked value, not coverage. Money answers a different question than the census asks." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-4",
      prompt: "Statement #25 bills 614,800 raw cents (a 4,000.00 partial). Why does the house fold read amount_cents / 100.0 and never bare /100?",
      choices: ["The .0 rounds the result to two decimals", "It promotes the division to real arithmetic — bare /100 is integer division and truncates odd-cent rows to whole dollars", "It converts cents to paise for the rupee reports", "It is cosmetic — /100 and /100.0 always print the same digits"],
      answer: 1,
      why: "INTEGER cents ÷ integer 100 is integer division: odd-cent sums lose their tail before ROUND ever runs. The .0 forces real division first, which is what prints 4,000.00 instead of 4,000.",
      notes: [
        { choice: 0, why: "ROUND is the presentation step and happens AFTER the damage if the division already truncated. The .0 is about arithmetic type, not display." },
        { choice: 3, why: "On this book every statement-group cent sum happens to be a whole multiple, so the digits reproduce — a coincidence you never build on. One odd-cent leg and the register misprints." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-5",
      prompt: "Statement #11 is status 'void' at 925.00 and carries exactly one remittance leg for 925.00. In the coverage census, which bucket does it land in?",
      choices: ["'never remitted' — a void statement cannot have settled", "'exact' — its legs sum to its billed cents, and coverage classifies by legs, not status", "'partial' — a void means the leg never counted", "No bucket — the census excludes void statements"],
      answer: 1,
      why: "Classification is a leg fold, not a status read: #11's one leg equals its billed cents, so it lands in 'exact' — 21 statements, 65,612.00 both sides. The void status is the anomaly; the census is what catches it.",
      notes: [
        { choice: 0, why: "'Never remitted' is the zero-leg arm — #11 carries a leg. Dropping voids by status would hide the exact error the census exists to surface." },
        { choice: 2, why: "Partial means legs BELOW billed. #11's leg matches billed to the cent — calling it partial breaks the 21/1/6 foot against the AR line." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-6",
      prompt: "You bucket the coupon spine with STRFTIME('%m', created_at) and the trend shows a January spike twice as big as any other month. Diagnosis?",
      choices: ["The launch month really was double — ship it", "'%m' drops the year: January 2024 and January 2025 merge into one bucket — use '%Y-%m' for the 14-month spine", "The cancelled orders double-counted into January", "STRFTIME cannot bucket TEXT timestamps"],
      answer: 1,
      why: "'%m' yields the two-digit month alone, so 2024-01 and 2025-02's neighbors across the year boundary fold together — the spine needs '%Y-%m' to hold 14 honest buckets from 2024-01 to 2025-02.",
      notes: [
        { choice: 0, why: "The launch month is real — 3,731.97 on 8 orders — but a year-merged bucket is not evidence of anything. The spike is two Januaries stacked." },
        { choice: 2, why: "Cancellations are conditional counts, not multiplications — 7 across the whole book. The doubling is the year fold, not status contamination." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-7",
      prompt: "Marketing asks for the premium-band (>= 200) menu read. The band CASE runs and returns zero SKUs. What is the right response?",
      choices: ["Widen the band to >= 150 until rows appear", "Ship the empty arm as a population fact — the menu's price ceiling is 199.99, so the premium band is EMPTY by construction", "IFNULL the band count to 1 so the slide has a bar", "Drop the CASE arm; unlisted SKUs belong to premium"],
      answer: 1,
      why: "The menu holds 16 SKUs: 8 budget (< 50) at 32.06 average, 8 mid (50–200) at 111.5, and the ceiling is 199.99 — the premium arm is empty because the menu is, not because the query is broken.",
      notes: [
        { choice: 0, why: "Moving the threshold until rows appear manufactures a segment. The band architecture is the story: value band versus core band, premium absent." },
        { choice: 2, why: "IFNULL-ing a count to 1 invents a SKU that does not exist. Empty arms reconcile the band counts to 16 — patching them breaks the foot." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-8",
      prompt: "Marketing wants the breakfast-vs-dinner daypart split off this db, hour by hour. What is the honest deliverable?",
      choices: ["Derive the hour from julianday(shipped_at) decimals and ship the split", "Refuse at hour grain and ship the date-grain stand-in — created_at carries date only (strftime('%H') reads '00' on all 103 orders), so the split ships as weekday/month folds, labeled as such", "Ship the split from status: delivered = dinner, pending = breakfast", "Copy the daypart mix from the production db and join it on"],
      answer: 1,
      why: "The db is DATE-grain: no hour component exists anywhere in created_at. The honest move is naming the limitation and shipping what the grain supports — weekday and month folds — with the label saying so.",
      notes: [
        { choice: 0, why: "There are no hour decimals to derive from — the stamps carry none. Any hour split would be fabricated resolution, the worst kind of dashboard lie." },
        { choice: 2, why: "Status is an order fate, not a time of day. Mapping fates to dayparts invents a semantic the schema does not carry." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-9",
      prompt: "The rail census wants statements settled on BOTH card and wire — the split-rail list. Which fold finds it, and why is HAVING COUNT(*) = 2 dangerous?",
      choices: ["COUNT(*) = 2 is the definition — two legs, two rails", "HAVING COUNT(DISTINCT p.method) = 2 — distinct methods is the definition; COUNT(*) = 2 only reproduces it because every 2-leg statement on this book happens to straddle rails", "SUM(amount_cents) = 2 — the rails sum to two statements", "COUNT(method) = 2 — non-null method legs, distinct or not"],
      answer: 1,
      why: "On this book the 5 split-rail statements (1, 5, 12, 19, 22) each carry exactly 1 card + 1 wire leg, so COUNT(*) = 2 happens to match — but one same-rail double-tap breaks it. COUNT(DISTINCT method) = 2 is the definition that survives.",
      notes: [
        { choice: 0, why: "Two legs on ONE rail reads COUNT(*) = 2 and lands on the split list falsely. The coincidence is verified on this db — and verified coincidences still are not definitions." },
        { choice: 2, why: "SUM of cents is money, not a rail census — it returns dollars, and no split-rail property survives it." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-10",
      prompt: "The dunning register uses id NOT IN (SELECT invoice_id FROM payments) over a remittance staging table and returns ZERO rows — but finance knows at least one statement has no legs. First suspicion?",
      choices: ["The register is right — zero is plausible", "One NULL invoice_id in the staging legs poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The register needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN materializes the subquery list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL leg makes every statement UNKNOWN and the register empties while looking valid. Policy: EXISTS for existence tests, or NULL-guard the subquery column.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — the clean core db carries 0 orphan legs. But staging tables are exactly where NULLs sneak in, and dunning lists ship from staging." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic — and EXISTS is the NULL-safe rewrite." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-11",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) runs over ALL 103 orders and returns 2.98. A reviewer says the number is a lie wearing the right name. Why?",
      choices: ["julianday cannot subtract TEXT dates", "AVG skips the 21 NULL-latency rows, so the average is stamped-only (82 orders) but was reported over the whole book", "2.98 is the median, not the mean", "The 7 cancelled orders drag the average down"],
      answer: 1,
      why: "AVG ignores NULLs, so the fold silently computes over the 82 stamped orders and prints a population-free 2.98. The number is real; the population label is the lie — the title must say 'stamped orders only'.",
      notes: [
        { choice: 0, why: "julianday() handles ISO text dates fine. The problem is definitional, not a cast failure." },
        { choice: 3, why: "Cancelled orders have no shipped_at — they are part of the NULL-skipped 21, not a drag on anything. The bias is the silent shrink, not a tail pull." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-12",
      prompt: "The market board gates at 'at least ten orders'. Where does that predicate live?",
      choices: ["WHERE COUNT(*) >= 10", "HAVING COUNT(*) >= 10 after GROUP BY region", "ORDER BY COUNT(*) >= 10", "A subquery on region"],
      answer: 1,
      why: "The ten-order floor is a group-level fact: groups must exist before COUNT does, so it lands in HAVING after GROUP BY. WHERE errors — aggregates do not exist before groups form.",
      notes: [
        { choice: 0, why: "WHERE runs before grouping; COUNT(*) is not yet defined there. This is the pipeline-order error the screens grade first." },
        { choice: 2, why: "ORDER BY sorts, never filters — the predicate would order the rows by a boolean and keep every market." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-13",
      prompt: "The bench ladder runs 24, 17, 14, 13, 5 booked orders, then FOUR operators tie at 4. Under RANK, what rank does the next operator (3 orders) carry?",
      choices: ["7", "10", "6", "9"],
      answer: 1,
      why: "RANK shares rungs and skips: the tie occupies ranks 6-9, so the next distinct count lands on 10. DENSE_RANK would say 7; ROW_NUMBER would have already split the tie.",
      notes: [
        { choice: 0, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The bench publishes RANK semantics, gaps included, so phantom positions 7-9 are the point." },
        { choice: 2, why: "6 is inside the tie block — all four 4-order operators share rank 6. The next DISTINCT count cannot land inside the block it follows." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-14",
      prompt: "EU runs 45 orders from 8 operator accounts; the US runs 19 from 2. Which market gets the field-support visit, and on which read?",
      choices: ["EU — it has the most orders", "US — 9.5 orders per account versus EU's 5.6, the intensity read", "EU — 8 accounts is the bigger installed base", "Whichever the ORDER BY puts first"],
      answer: 1,
      why: "The two-grain census reports load AND coverage; the ratio is the intensity signal. The US concentrates ~9.5 orders on each of 2 accounts — thinner coverage per unit of load, which is exactly where a field visit buys the most.",
      notes: [
        { choice: 0, why: "45 orders is load, not intensity. A market can lead on load and still be well covered — the ratio, not the raw count, picks the flight." },
        { choice: 2, why: "8 accounts is coverage, again without intensity. Both single-column reads ignore the ratio that the two-grain census exists to expose." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-15",
      prompt: "The coupon flight runs March 1 to May 31. The window filter is BETWEEN '2024-03-01' AND '2024-05-31' at DATE grain. What is the edge risk?",
      choices: ["None — BETWEEN is inclusive and correct here", "Half-open windows (>= 03-01 AND < 06-01) are the safe shape; BETWEEN on the last boundary silently relies on the stamps carrying no time component", "BETWEEN cannot compare TEXT dates", "The start boundary drops March 1's orders"],
      answer: 1,
      why: "At DATE grain BETWEEN happens to work — but it is the fragile shape: one hour component and the last day's orders fall out the back. The house pattern is half-open windows, which survive grain drift by construction.",
      notes: [
        { choice: 0, why: "It works today and breaks the day created_at gains a time component. The screens grade the shape, not the current luck." },
        { choice: 2, why: "BETWEEN compares TEXT fine in ISO order. The risk is boundary inclusiveness against future grain, not type handling." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-16",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE region = 'LATAM') — the LATAM staging slice is empty. What does the report return?",
      choices: ["An error about empty subqueries", "Zero rows silently — the scalar subquery returns NULL and total > NULL is UNKNOWN for every row", "All 103 orders", "Only LATAM orders"],
      answer: 1,
      why: "A scalar subquery over an empty fold returns NULL, not an error, and every comparison against NULL is UNKNOWN — the above-average report empties while looking valid. Stating the empty-inner behavior is the unprompted follow-up panels fish for.",
      notes: [
        { choice: 0, why: "Empty is the trap: scalar subqueries are contractually 0-or-1 rows, and the 0-row case returns NULL instead of failing loudly." },
        { choice: 2, why: "UNKNOWN is never true, so nothing passes the filter. An all-rows read would require the opposite bug (NULL-safe comparison)." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-17",
      prompt: "The menu-mix read joins orders to order_items and COUNT(*) reads 251, not 103. What happened?",
      choices: ["A fan-out — the join multiplied orders by their menu lines; COUNT(*) now counts lines", "The orders table has 251 rows", "DISTINCT is missing", "251 is the revenue, mislabeled as a count"],
      answer: 0,
      why: "251 line items over 103 orders is the 2.44 fan-out: after the join, one row per LINE. COUNT(DISTINCT o.id) recovers the order grain — 'one row per what?' is the habit being graded.",
      notes: [
        { choice: 2, why: "DISTINCT on COUNT(*) would dedup whole rows — with the order id included there are no duplicate rows to dedup. The fix is counting the right key, not deduping." },
        { choice: 3, why: "Booked value is 34,833.28, not 251. The number is a real line count; it is just answering a different question than the ticket census." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-18",
      prompt: "The top distribution partner carries 11,130.25 of partner-served line revenue and the top two carry 58.7%. How is the 32% share computed so it does not read 0?",
      choices: ["100 * SUM(flag) / COUNT(*) with integer literals", "100.0 * SUM(line_revenue) OVER () — the multiplier before any division", "ROUND the ratio after dividing integers", "CAST the share to TEXT"],
      answer: 1,
      why: "Shares are 100.0-multiplied BEFORE the division: SUM of 0/1 flags over COUNT is integer arithmetic and truncates toward zero — the abort share reads a displayed 0 while APAC actually runs 8.1%. The .0 is arithmetic type, not rounding.",
      notes: [
        { choice: 0, why: "That is exactly the truncating shape — integer division first, then the 100 lands on an already-truncated 0." },
        { choice: 2, why: "ROUND is presentation and happens after the damage. The truncation happens inside the division itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-19",
      prompt: "Settlement latency averages 28.4 days, fastest 13, slowest 84. Which fold computes time-to-first-remittance per statement?",
      choices: ["julianday(paid_on) - julianday(issued_on) per payment leg, averaged over legs", "julianday(MIN(p.paid_on)) - julianday(i.issued_on) grouped per invoice, over the 22 leg-carrying statements", "AVG(due_on - issued_on)", "COUNT(paid_on) per invoice"],
      answer: 1,
      why: "Time-to-first-remittance folds MIN(paid_on) per statement — the first leg — then averages over the statements that have legs. The 6 zero-leg statements have no latency and are excluded by a stated population, not a silent NULL-shrink.",
      notes: [
        { choice: 0, why: "That averages every leg — the 5 split-rail statements contribute two latencies each, which is a per-rail read, not time-to-first-remittance." },
        { choice: 2, why: "due_on is a contractual date, not a settlement event — that fold measures terms, not behavior. The 28.4-versus-net-30 gap is the whole story." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-20",
      prompt: "Two shapes return the dunning register: invoices LEFT JOIN payments ... WHERE p.id IS NULL, and WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id). When do they disagree?",
      choices: ["Never — they are always identical", "Only when the joined column can be NULL — a NULL invoice_id leg stays 'unmatched' for the LEFT JOIN but is handled cleanly by NOT EXISTS", "LEFT JOIN is faster so they disagree on performance, not results", "NOT EXISTS cannot reference the outer table"],
      answer: 1,
      why: "On this clean core both return the same 6 statements. They diverge on NULL-able join keys: LEFT JOIN + IS NULL buckets NULL-key legs as unmatched, while NOT EXISTS asks existence directly and is immune. House default: NOT EXISTS.",
      notes: [
        { choice: 0, why: "Identical HERE is verified — and verified here is not identical everywhere. Staging tables are where the two shapes split." },
        { choice: 2, why: "The question is semantics, not speed. EXISTS short-circuits, but the agreement question is about what each shape counts." },
      ],
      difficulty: "medium",
    },
    {
      id: "burgerking-mcq-21",
      prompt: "The royalty coverage outer runs a FULL OUTER JOIN and the orphan arm (legs with no statement) returns zero rows. What does that empty arm prove?",
      choices: ["The query is broken — an outer join arm should never be empty", "The leg side reconciles: every one of the 27 legs points at a statement, so the register is complete in both directions", "There are no payments in the db", "The orphan arm is where cancelled statements go"],
      answer: 1,
      why: "The FULL OUTER runs both directions: the statement arm finds the 6 never-remitted, and the leg arm is the proof there is no orphan remittance — a confident zero you can defend because the query shape could have caught one.",
      notes: [
        { choice: 0, why: "An empty outer arm is a RECONCILIATION, not a failure. The audit value of the arm is precisely that it could have been non-empty." },
        { choice: 2, why: "27 legs exist across two rails. The arm is empty because none is orphaned, not because the table is empty." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-22",
      prompt: "The ad-fund walk computes SUM(amount_cents) OVER (ORDER BY paid_on). Two legs settled the same day and the cumulative jumps for both at once. Fix?",
      choices: ["Change SUM to COUNT", "Write the frame explicitly: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — the default RANGE includes paid_on peers", "Add DISTINCT to the SUM", "ORDER BY paid_on DESC"],
      answer: 1,
      why: "With ORDER BY the default frame is RANGE, and RANGE includes peers — tied rows enter the cumulative together. ROWS walks strictly leg by leg; on a book where same-day settlements are routine, the frame is the definition.",
      notes: [
        { choice: 2, why: "DISTINCT dedups values, not rows — and on cents sums it would actively corrupt the walk. The semantics live in the frame clause." },
        { choice: 3, why: "Reversing the order changes which direction the walk runs, not how ties behave. The peer-jump is a RANGE property." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-23",
      prompt: "In the coverage census, COALESCE(SUM(p.amount_cents), 0) guards the zero-leg statements. What does the register print for #28's remitted cell without that guard?",
      choices: ["0.00 — SUM returns zero for no rows", "NULL — SUM over zero matched rows is NULL, so the cell prints blank and the dollar math above it dies", "1,756.00 — billed flows through", "The query errors"],
      answer: 1,
      why: "SUM of an empty set is NULL, not zero — the remitted cell prints blank and every gap/balance computation built on it inherits the NULL. COALESCE folds the no-leg case to 0 so the register stays numeric down the column.",
      notes: [
        { choice: 0, why: "That is COUNT's behavior, not SUM's. Confusing the two is exactly how blank remitted cells reach the close packet." },
        { choice: 2, why: "Billed is a different column; nothing 'flows through' an aggregate over no rows. The guard is about the fold, not the carry." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-24",
      prompt: "A teammate rewrites the band CASE with WHEN price <= 200 THEN 'mid band' BEFORE WHEN price < 50 THEN 'budget band'. What happens to the 49.00 SKU?",
      choices: ["It stays in budget — CASE arms commute", "It lands in mid band — CASE evaluates top-down, so the reordered pair re-bands everything under 200 into mid", "It errors — arms must be ascending", "It falls to the premium ELSE"],
      answer: 1,
      why: "CASE is ordered evaluation: the first true arm wins, and 49.00 <= 200 fires the mid arm before the budget arm is ever tested. The band counts stop footing to the quoted 8/8/0 mix with no error anywhere.",
      notes: [
        { choice: 0, why: "Arms commute only when the predicates are disjoint. Overlapping bounds make order semantic — this is the silent re-band." },
        { choice: 3, why: "49.00 <= 200 is true, so the ELSE never runs. The damage is budget-to-mid leakage, not a premium misprint." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-25",
      prompt: "The one-pass fate census returns 52, 30, 14, 7 as four SUM(CASE …) branches. What identity proves it in one assertion?",
      choices: ["Each branch is even", "The four branches sum to COUNT(*) — 103", "The branches are all under 60", "MAX(branch) - MIN(branch) < 50"],
      answer: 1,
      why: "The reconciliation identity is branches sum to COUNT(*) — 52 + 30 + 14 + 7 = 103 by construction. A sloppy predicate breaks the identity, which is what makes one-pass censuses self-checking.",
      notes: [
        { choice: 2, why: "Magnitude bounds are coincidences of this db, not invariants. The identity holds for any status split; the bounds do not." },
        { choice: 3, why: "Spread checks measure the story, not the census. Only the sum-to-population identity can catch a drifted status list." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-26",
      prompt: "COUNT(*) over orders reads 103; COUNT(DISTINCT customer_id) reads 16. What is the third number a menu read would produce, and what does it count?",
      choices: ["498 — units pulled, from SUM(quantity) over order_items", "251 — operator accounts, from the join", "14 — months, from the spine", "34,833.28 — dollars"],
      answer: 0,
      why: "The menu read adds two more grains: 251 lines (COUNT(*) over order_items) and 498 units (SUM(quantity), max 3 on a line). Each grain answers a different question — demand events, basket depth, kitchen pull.",
      notes: [
        { choice: 1, why: "251 is line count, not accounts — accounts are the DISTINCT customer fold at 16. Mixing these two up is the classic fan-out read." },
        { choice: 3, why: "Dollars are an aggregate, not a count — and it belongs to the money spine, not the menu census." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-27",
      prompt: "Marketing claims the July coupon flight 'lifted traffic' and points at the 8 July orders. What can this db honestly say about lift?",
      choices: ["The 8 orders prove the lift", "Nothing causal — there is no coupon flag on orders, so lift is a controlled-experiment read; the db supports the month spine, not attribution", "July's 1,193.86 trough proves negative lift", "Compare July to June and divide"],
      answer: 1,
      why: "There is no coupon column on orders — any flight attribution would be an assertion, not a measurement. The honest deliverable is the month spine (July 1,193.86 on 8 orders, launch 3,731.97) labeled as descriptive; lift needs an experiment or a flag that does not exist here.",
      notes: [
        { choice: 2, why: "A trough beside a flight is exactly the kind of coincidence the spine exists to contextualize — it cannot separate the flight from seasonality on 8 orders." },
        { choice: 3, why: "Month-over-month ratios are still descriptive reads; the causal word 'lift' is what the db cannot support." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-28",
      prompt: "The close packet claims the ledger trial balance reads 181,080 against 181,080. What is the query-level meaning of 'delta zero', and what does a non-zero delta forbid?",
      choices: ["SUM(debits) - SUM(credits) = 0 — a non-zero delta forbids shipping the close until the offending entries are found", "COUNT(debits) = COUNT(credits)", "The ledger has 181,080 rows on each side", "MAX equals MIN on both sides"],
      answer: 0,
      why: "Delta zero is the folded identity: total debits equal total credits to the cent. Close culture here is binary — the close ships at delta zero or becomes tomorrow's incident, and the offending entries ship WITH the delta, not after it.",
      notes: [
        { choice: 1, why: "Row counts can tie while dollars do not — money folds, not row folds, are what a trial balance asserts." },
        { choice: 2, why: "181,080 is a dollar total, not a row count. Reading totals as counts is the cents-blind misread this kit exists to kill." },
      ],
      difficulty: "hard",
    },
    {
      id: "burgerking-mcq-29",
      prompt: "The intensity crown: which query safely names the operator with the most booked orders, given the ladder's known ties further down?",
      choices: ["ORDER BY COUNT(*) DESC LIMIT 1", "A subquery guard — WHERE COUNT(*) = (SELECT MAX over the fold) — which returns ALL rows tied at the max, then a named tie-breaker if one must win", "ROW_NUMBER() = 1", "MAX(customer_id)"],
      answer: 1,
      why: "LIMIT 1 splits any tie at the top arbitrarily; the guarded-max shape returns every row tied at the crown and forces the tie-breaker to be a named policy. On this db the crown is unique at 24 — but the same ladder ties four ways at 4, and the habit must survive contact with ties.",
      notes: [
        { choice: 2, why: "ROW_NUMBER picks one row before the policy is named — the arbitrary split the bench review forbids. Same failure as LIMIT 1, fancier." },
        { choice: 3, why: "MAX over an id is not an order count — it answers 'highest id', a different question entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "burgerking-mcq-30",
      prompt: "The board prints the average order as 338.19. A refactor replaces ROUND(AVG(total), 2) with CAST(AVG(total) AS INTEGER). What does the board show?",
      choices: ["338.19 — the cast is cosmetic", "338 — the cast truncates, and every money cell loses its cents; money cells round, they never cast", "338.2 — the cast rounds to 1 decimal", "An error — AVG cannot be cast"],
      answer: 1,
      why: "CAST to INTEGER truncates the fractional part: 338.19 becomes 338, and across a book of odd-cent totals the board drifts from every reconciliation keyed to the cents-safe fold. Rounding is ROUND's job; casting is a type change, not a display choice.",
      notes: [
        { choice: 0, why: "The cast is exactly not cosmetic — it deletes the cents column-wide. Same family of bug as the bare /100 integer division." },
        { choice: 2, why: "CAST AS INTEGER never rounds — SQLite truncates toward zero. 338.2 would be ROUND(...,1)'s output." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-burgerking-1",
      tier: "easy",
      topic: "t5",
      universe: "growth",
      title: "The operator bench ladder",
      brief:
        "Franchise-ops brief on the storefront db: Monday's franchisee bench review ranks the 16 operator accounts by booked orders — who carries the system, who rides it. The bench ladder is known: 24, 17, 14, 13, 5 booked orders, then FOUR operators tied at 4 (the tie is a shared-rung policy call, not a bug), and booked value concentrates hard behind them — 7,262.35, 6,640.56, 4,574.23 and 3,644.56 at the top. The review reads the full 16-row bench, biggest book first, alphabetical within shared rungs, and wants the rank semantics settled before anyone argues about peer operators.",
      ask: "Return all 16 operator accounts with booked order count, booked value to 2 decimals and a shared-rung rank, biggest book first, alphabetical within shared rungs.",
      template:
        "SELECT c.name AS operator,\n       c.region AS market,\n       {1}(*) AS booked_orders,\n       ROUND(SUM(o.total), {2}) AS booked_value,\n       {3}() OVER (ORDER BY COUNT(*) {4}) AS bench_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {5}\nORDER BY bench_rank, operator;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the load counter",
          why: "COUNT(*) reads one row per franchise order — the load each operator carries. SUM and AVG are not valid zero-argument folds here and the ladder errors; a column-name counter counts something other than orders.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the value precision",
          why: "Booked value reports to 2 decimals — 7,262.35 against 6,640.56. ROUND(…, 1) prints 7,262.4 and the bench stops reconciling with the 338.19 average the franchise review quotes on the same slide.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie policy",
          why: "The bench publishes shared rungs WITH gaps: the four-way tie at 4 consumes ranks 6–9 and the next distinct count lands on 10. DENSE_RANK prints 7 next — a different policy — and ROW_NUMBER splits the tie arbitrarily, which is a silent judgment call about peer operators.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads the 24-order operator on top. ASC opens the meeting on the single-order tail — a correct query aimed at the wrong end of the bench.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the operator grain",
          why: "GROUP BY o.customer_id folds 103 orders to 16 operator rows — the bench grain. c.region folds to 4 market rows and o.status to 4 fate rows: right shape, wrong universe, and the review loses every operator it came to see.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "SUM", "ASC", "c.region", "0"],
      walkthrough:
        "One join, one fold, one window. The join attaches every franchise order to its operator account, GROUP BY o.customer_id folds 103 orders into 16 rows, and RANK() OVER (ORDER BY COUNT(*) DESC) paints the ladder: 24, 17, 14, 13, 5 — then the four-way tie at 4 sharing rank 6, the two 3-order operators at 10, three at 12 and the single-order tail at 15. Booked value rides beside the counts to 2 decimals: 7,262.35, 6,640.56, 4,574.23, 3,644.56 at the top, and the concentration read falls out for free — the top four operators carry 63.5% of the book's 34,833.28. The distractors fail honestly: DENSE_RANK hands out 7 after the tie and the phantom-gap policy silently changes; ROW_NUMBER splits the shared rungs 6-7-8-9 and two peer operators lose their tie; SUM is not a zero-argument counter and the fold errors; ASC opens the review on the 1-order tail; c.region folds the bench to 4 market rows; 0 in the grouping or precision slot either errors the fold positionally or truncates the value off the 7,262.35 cells. The tie block is the point: four operators at 4 orders each are peers, and the bench review needs the shared-rung semantics said out loud before anyone is promised field support.",
    },
    {
      id: "cs-burgerking-2",
      tier: "hard",
      topic: "x5",
      universe: "month-close",
      title: "The royalty coverage outer",
      brief:
        "Month-close brief on the storefront db from franchise finance: 28 royalty statements billed to operator accounts meet 27 remittance legs across two rails — card 16 legs / 37,364.00, wire 11 / 32,248.00. The close reconciles in ONE outer: statements whose legs sum to billed are 'exact' (21, worth 65,612.00 both sides — void-but-remitted #11 at 925.00 folds in by construction), statements with zero legs are 'never remitted' (6, worth 15,217.00, including the paid-claim lie #28 at 1,756.00), everything between is 'partial' (#25: 4,000.00 of 6,148.00). The FULL OUTER also proves the reverse direction — an orphan leg with no statement would surface as its own arm, and the probed census says there are none. Statement tables carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each coverage bucket with statement count, billed total and remitted total in dollars to 2 decimals, biggest bucket first — and prove neither side of the outer has an unexplained row.",
      template:
        "WITH legs AS (\n  SELECT i.id AS sid,\n         i.amount_cents AS billed_cents,\n         {2}(SUM(p.amount_cents), 0) AS paid_cents,\n         CASE WHEN i.id IS NULL THEN 'orphan leg'\n              WHEN SUM(p.amount_cents) IS NULL THEN 'never remitted'\n              WHEN SUM(p.amount_cents) = i.amount_cents THEN {3}\n              ELSE 'partial' END AS coverage\n  FROM invoices i\n  {1} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id, i.amount_cents\n)\nSELECT coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(billed_cents) / {4}, 2) AS billed_total,\n       ROUND(SUM(paid_cents) / 100.0, 2) AS remitted_total\nFROM legs\nGROUP BY coverage\nORDER BY statements {5};",
      slots: [
        {
          answer: "FULL OUTER",
          kind: "keyword",
          label: "the both-directions join",
          why: "The census has to survive statements with no legs AND legs with no statement: FULL OUTER keeps both, and the orphan arm is the proof the leg side reconciles — 0 rows by probe. INNER evaporates the six never-remitted statements the case exists to find; CROSS and every other join shape lose one direction or cartesian the book.",
        },
        {
          answer: "COALESCE",
          kind: "keyword",
          label: "the zero-leg guard",
          why: "COALESCE(SUM(p.amount_cents), 0) folds the zero-leg statements to paid 0 so the register's remitted cell prints 0.00 instead of NULL. MAX scalar-folds NULL to NULL and the cell goes blank anyway; COUNT in a two-argument position errors the fold.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the to-the-cent label",
          why: "Statements whose legs sum to billed_cents are 'exact' — 21 of 28, with void-but-remitted #11 (925.00) landing here by construction. 'paid' would label by claim instead of by legs and reads a status that lies — #28 proves the difference.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements and legs store INTEGER cents; /100.0 is the dollar read that prints 65,612.00 instead of 6,561,200. The .0 matters — bare 100 keeps integer arithmetic and quietly eats cents on every odd-cent row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads biggest bucket on top: exact 21, never remitted 6, partial 1. ASC opens the close on the single partial — a correct query aimed at the wrong end of the ledger.",
        },
      ],
      distractors: ["INNER", "CROSS", "ASC", "MAX", "'paid'", "10"],
      walkthrough:
        "Two stages: fold legs per statement, then classify and roll up. The CTE runs the FULL OUTER — every one of the 28 statements survives, every leg survives, and the orphan arm (legs with no statement) is empty by probe, which is the leg-side reconciliation. Classification at statement grain: legs sum to billed → 'exact' (21 — void-but-remitted #11 at 925.00 lands here because its one leg matches its billed cents), legs at zero → 'never remitted' (6 — the dunning register, including paid-claim #28 at 1,756.00 whose status lies), else 'partial' (1 — #25 at 4,000.00 of 6,148.00). The outer SELECT rolls each bucket to count and dollars via the /100.0 read: exact 21 / 65,612.00 / 65,612.00, never remitted 6 / 15,217.00 / 0.00, partial 1 / 6,148.00 / 4,000.00 — footing to the probed AR lines, and the billed column sums to the 86,977.00 statement book. The distractors each break differently: INNER and CROSS evaporate the six never-remitted statements — the register the case exists to find — while RIGHT keeps the legs and drops the statements; MAX scalar-folds the zero-leg guard to NULL so the register's remitted cell prints blank; 'paid' relabels the census by claim and hides the exact error the legs caught; ASC opens the close on the partial; 10 as the divider inflates every dollar cell tenfold. The close rule holds: buckets must foot to 28 statements and the rails' 69,612.00 must tie to the cash credit, or the trial balance — 181,080 against 181,080 — does not ship at delta zero.",
    },
    {
      id: "cs-burgerking-3",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The menu-band CASE fold",
      brief:
        "Pricing memo on the storefront db: the menu-mix pod re-cuts the band fold for the franchisee council — 16 SKUs classified into budget (< 50), mid (50 to 200) and premium (>= 200), with count and average price per band. The probed fold: budget band 8 SKUs averaging 32.06 (14.99 floor, 49.00 ceiling), mid band 8 SKUs averaging 111.5 (59.99 to 199.99), and the premium band EMPTY — the menu's price ceiling is 199.99, so the empty arm is a population fact the slide must state, not a bug to patch. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the mix story, and a reordered WHEN quietly re-bands the 49.00 SKU.",
      ask: "Return each price band with SKU count and average price to 2 decimals, biggest average first — the empty premium arm named, the band counts footing to 16.",
      template:
        "SELECT CASE WHEN price < {1} THEN 'budget band'\n              WHEN price <= {2} THEN 'mid band'\n              ELSE 'premium band' END AS band,\n       COUNT(*) AS skus,\n       ROUND({3}(price), 2) AS avg_price\nFROM products\nGROUP BY {4};",
      slots: [
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the budget ceiling",
          why: "The budget band is price < 50 — 8 SKUs averaging 32.06, topping out at 49.00. Move the threshold and the band re-draws: 100 swallows the 59.99 SKUs into budget and the quoted 32.06 average is gone.",
        },
        {
          answer: "200",
          kind: "number",
          noVerify: true,
          label: "the premium floor",
          why: "The mid band runs 50 to 200, and the ELSE catches 200-plus — empty on this menu because the ceiling is 199.99. Tighten to 100 and the 100-to-199.99 SKUs fall into premium, inventing a tier the menu does not carry.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the band average",
          why: "Average price per band is the fold — 32.06 and 111.5. SUM prints band totals (244.42 / 256.49-ish) wearing an avg_price label, and COUNT prints row counts: right shape, wrong measure.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the band grain",
          why: "GROUP BY band folds 16 SKUs to band rows — the CASE alias. GROUP BY price scatters to one row per SKU (16 rows, no bands) and GROUP BY category re-folds by menu family (7 rows): right tables, wrong universe.",
        },
      ],
      distractors: ["MAX", "COUNT", "ASC", "0"],
      walkthrough:
        "One CASE, one fold, one stated empty arm. The CASE evaluates top-down: price < 50 fires budget first, price <= 200 fires mid second, and the ELSE catches 200-plus — which is why the arms' ORDER is semantic: rewrite it mid-first and the 49.00 SKU lands in mid before budget is ever tested. The fold reads 16 SKUs into three arms: budget band 8 SKUs at 32.06 (ceiling 49.00), mid band 8 at 111.5 (59.99 to 199.99), premium band zero rows — the empty arm is the slide's footnote, because the limited-menu discipline tops out at 199.99 and pretending otherwise manufactures a tier. The distractors each break differently: MAX as the average prints ceiling prices (49 / 199.99) under an avg_price label and the 32.06 the council quotes is gone; COUNT prints 8 / 8 row counts where averages belong; ASC in any expression position is a syntax error; 0 as the budget ceiling folds every SKU into mid — one arm eats the mix and the band story is a single row. The read the pod takes: two bands, eight SKUs each, a 3.5x average gap — value band versus core band, premium absent by construction.",
    },
    {
      id: "cs-burgerking-4",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The dunning anti-join",
      brief:
        "Month-close brief on the storefront db from franchise finance: before a single reminder goes out, the dunning register refreshes — royalty statements carrying ZERO remittance legs. The probed register: 6 statements worth 15,217.00 — #24 (4,937.00), #26 (3,562.00), #27 (2,794.00), #21 (1,295.00), #18 (873.00), all status 'open', plus #28 (1,756.00), which claims status 'paid' with zero legs: a status that lies, and the reason the payments table is the ledger of record. The register reads biggest exposure first, and every dollar read is amount_cents / 100.0 — INTEGER cents, exactly once.",
      ask: "Return each never-remitted statement with id, claimed status and billed dollars to 2 decimals, biggest exposure first.",
      template:
        "SELECT i.id AS statement_id,\n       i.status AS claim,\n       ROUND(i.amount_cents / {4}, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON {1}\nWHERE p.id IS {2}\nORDER BY billed {3};",
      slots: [
        {
          answer: "p.invoice_id = i.id",
          kind: "keyword",
          label: "the remittance stitch",
          why: "Legs reference their statement by invoice_id, so the stitch is p.invoice_id = i.id. Stitch on p.id = i.id and legs pair with whatever statement shares their row number — #28's phantom payment is the tell that the stitch is wrong.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched arm",
          why: "IS NULL keeps the zero-leg statements — the whole register. IS NOT NULL flips the query into the 22 leg-carrying statements, the exact complement, and the dunning list silently becomes a paid list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The chase list opens on #24 at 4,937.00 — the biggest single chase. ASC opens on #18 at 873.00: a correct register aimed at the wrong end of the queue.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements bill in INTEGER cents; /100.0 is the dollar read that prints 4,937.00. Bare 100 keeps integer arithmetic and eats cents on every odd-cent row; 10 prints a tenfold register.",
        },
      ],
      distractors: ["p.id = i.id", "NOT NULL", "ASC", "10"],
      walkthrough:
        "An anti-join is a stitch, a null test and a direction. The stitch attaches each statement to its remittance legs by invoice_id; the IS NULL arm keeps the statements the stitch never matched — 6 of 28, worth 15,217.00 — and the direction opens the chase list on the biggest exposure: #24 at 4,937.00, then 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00. Five rows claim 'open' and one (#28 at 1,756.00) claims 'paid' with zero legs — the status column is a claim, the legs are the ledger, and that one row is why the register reads the payments table instead of the status field. The distractors each break differently: p.id = i.id stitches legs to whatever statement shares their row number — most statements find a phantom match and the register collapses to a fragment; NOT NULL flips the arm and the dunning list becomes the 22 paid statements, its exact complement; ASC opens the chase on the 873.00 tail; 10 as the cents divider prints a tenfold register the ledger catch-file rejects instantly. The cross-check the close requires: the register's 6 must foot against the coverage census — 21 exact + 1 partial + 6 none = 28 — or the anti-join misread its population.",
    },
    {
      id: "cs-burgerking-5",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The coupon-window spine gate",
      brief:
        "Growth memo on the storefront db: the calendar team wants the busy months isolated for the coupon-flight proposal — months whose order volume beats the spine's own average, so the flight lands on months that already carry traffic. The month spine reads at DATE grain (created_at carries no hour — say so): 14 buckets from 2024-01 to 2025-02, launch month 3,731.97 on 8 orders, February and September peaking at 9 orders, July troughing at 1,193.86. The average month on this spine carries about 7.4 orders, so the gate must be computed INSIDE the query — a staging CTE first, the average folded from the spine itself, never hard-coded.",
      ask: "Return each month whose order count exceeds the spine-wide average order count, with month, order count and booked value to 2 decimals, calendar order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME('%Y-%m', created_at) AS month,\n         COUNT(*) AS orders,\n         ROUND(SUM(total), {4}) AS booked_value\n  FROM orders\n  GROUP BY {1}\n)\nSELECT month, orders, booked_value\nFROM spine\nWHERE {3} > (SELECT {2}(orders) FROM spine)\nORDER BY month;",
      slots: [
        {
          answer: "month",
          kind: "keyword",
          label: "the spine grain",
          why: "GROUP BY month folds 103 orders into the 14-month spine — '%Y-%m' keeps January 2024 and January 2025 apart. GROUP BY status re-folds into 4 fate rows and the calendar is gone; GROUP BY 0 collapses everything into one row.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the spine's own baseline",
          why: "The gate is 'beats the average month', so the inner fold is AVG over the spine — about 7.4. MAX gates at the best month (9) and returns nothing; SUM gates above 103 and the report empties.",
        },
        {
          answer: "orders",
          kind: "keyword",
          label: "the gated column",
          why: "The flight buys traffic, so the gate rides order count: 8 and 9 beat the baseline, 6 and 7 do not. Gating booked_value answers a pricing question — 2024-07 passes on value logic that its 8 orders fail on traffic logic.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Booked value ships to 2 decimals — 3,731.97, 1,193.86. ROUND(…, 0) flattens the spine to integers and the cells stop reconciling with every other money read in the deck.",
        },
      ],
      distractors: ["SUM", "MAX", "status", "0"],
      walkthrough:
        "A gate is a baseline computed where it lives. The CTE folds 103 orders into the 14-month spine — 2024-01 through 2025-02 — because the calendar team reads months, not days, and created_at is DATE-grain anyway. The outer query then gates the spine against its OWN average: (SELECT AVG(orders) FROM spine) folds the 14 buckets to roughly 7.4, and six months clear it — 2024-01 (8 orders / 3,731.97), 2024-02 (9 / 3,609.64), 2024-03 (8 / 2,617.08), 2024-05 (8 / 2,910.31), 2024-07 (8 / 1,193.86), 2024-09 (9 / 3,116.04). The June–July trough is the honest headline: 2024-07 clears the volume gate with 8 orders while carrying the smallest booked value on the spine — volume without value, exactly the month a discount flight would make worse. The distractors each break differently: SUM as the baseline gates above 103 total orders and the report empties while looking valid; MAX gates above the best month (9) — nothing can pass, silently; GROUP BY status discards the calendar for a fate census; 0 as the value precision flattens 3,731.97 to 3,732 and the spine stops footing with the money deck. And the subquery's population is stated by construction: the average folds the SPINE (14 months), not the raw 103 orders — gate the baseline to the wrong grain and the cutoff drifts.",
    },
    {
      id: "cs-burgerking-6",
      tier: "hard",
      topic: "j7",
      universe: "supplier",
      title: "The distribution partner fold",
      brief:
        "Supply brief on the storefront db: the six distribution partners (suppliers) each carry a slice of the 16-SKU menu, and the supply review ranks them by partner-served line revenue — units pulled through their SKUs, SKU count beside it — before the distribution-contract renegotiation. The probed fold, biggest first: Nordic Gadgets AB (EU) 3 SKUs / 82 units / 11,130.25, Midwest Hardware Co (US) 3 / 109 / 9,294.93, Alpine Audio GmbH (EU) 2 / 77 / 4,765.63, Andes Naturals SA (LATAM) 2 / 51 / 3,613.25, Shenzhen Electro (APAC) 3 / 99 / 3,049.07, Pacific Textiles (APAC) 3 / 80 / 2,980.15. The concentration headline: the top partner carries 32% of partner-served line revenue and the top two 58.7%.",
      ask: "Return each distribution partner with its market, SKU count, units pulled and partner-served line revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS partner,\n       s.region AS market,\n       COUNT(DISTINCT p.id) AS skus,\n       {3}(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), {4}) AS line_revenue\nFROM suppliers s\nJOIN products p ON {1}\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY {2};",
      slots: [
        {
          answer: "p.supplier_id = s.id",
          kind: "keyword",
          label: "the supply stitch",
          why: "SKUs reference their distribution partner by supplier_id, so the stitch is p.supplier_id = s.id. Stitch on s.id = s.id and every product pairs with every partner — all six partners inherit all 16 SKUs and the concentration story is fiction.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the partner grain",
          why: "GROUP BY s.id folds to one row per partner — 6 rows, the contract grain. GROUP BY p.category re-folds by menu family (7 rows of no-partner) and GROUP BY 0 collapses the bench into one row.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the units pull",
          why: "Units pulled is SUM(oi.quantity) — 82 for Nordic, 109 for Midwest. COUNT counts menu LINES (the 2.44 fan-out) and MAX reads the biggest single line quantity (3): right table, wrong measure.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the revenue precision",
          why: "Partner revenue ships to 2 decimals — 11,130.25 against 2,980.15. ROUND(…, 0) prints integers and the 32% share the contract memo quotes stops reconciling with the cells beneath it.",
        },
      ],
      distractors: ["s.id = s.id", "p.category", "COUNT", "0"],
      walkthrough:
        "A supply fold is two stitches and two measures. The first stitch attaches each of the 16 SKUs to its distribution partner by supplier_id; the second rides the menu lines through product_id, so each partner's row is the units and line revenue that flowed through ITS SKUs. The fold reads: Nordic Gadgets AB 3 SKUs / 82 units / 11,130.25, Midwest Hardware Co 3 / 109 / 9,294.93, Alpine Audio GmbH 2 / 77 / 4,765.63, Andes Naturals SA 2 / 51 / 3,613.25, Shenzhen Electro 3 / 99 / 3,049.07, Pacific Textiles 3 / 80 / 2,980.15 — and the concentration read falls out of the ranking: the top partner carries 32% of partner-served line revenue, the top two 58.7%, which is the dependence the renegotiation is about. The volume-versus-value split is the ops read: Midwest pulls the most units (109) and still lands second — its SKUs are the traffic family — while Nordic converts fewer units into a third more revenue. The distractors each break differently: s.id = s.id cross-joins partners to SKUs, so every partner inherits all 16 SKUs and the fold reads six identical 16-SKU rows; p.category in the stitch or the fold key re-grains the bench by menu family and the partners vanish; COUNT in the units slot counts lines (the fan-out) instead of units; 0 as the precision flattens 11,130.25 to 11130 and the memo's share arithmetic loses its footing. State the fold grain out loud — one row per partner, units from lines, dollars from the line's own price — and the contract table holds.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-i", why: "Menu-line revenue beside units is the first chart the menu-mix pod re-cuts weekly — fold line records to SKU grain and the limited-menu discipline reads straight off the board." },
    { slug: "product-sales-analysis-ii", why: "Per-SKU revenue across a coupon flight is the velocity read: the month spine moves, the mix answers whether the flight lifted the value band or the core band." },
    { slug: "sales-analysis-i", why: "Operator-account revenue beside order counts is the franchisee bench — 24/17/14/13/5 booked orders with booked value concentrated behind them is this problem's shape at db scale." },
    { slug: "sales-analysis-ii", why: "Operators with no orders in a window are the dormant bench — the anti-join read field support runs before a single visit gets scheduled." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is the expansion shortlist gate — which operator accounts carry at least N booked orders. This problem drills the group-level gate the field team actually uses." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-order operator is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written before the bench review." },
    { slug: "customer-order-frequency", why: "Order cadence per operator account is how supply planning reads reorder rhythm — frequency gates drive the distribution schedule the six partners bill against." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-operator core SKU: each account's default menu item. Ties on the argmax are the follow-up, because 'their usual' must resolve to one SKU on the limited menu." },
    { slug: "combine-two-tables", why: "Operator accounts LEFT JOINed to franchise orders: the whitespace read. A confident zero never-booked operator is itself the proof — and proving it is the analyst's job." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders completed inside the promised window versus late — the coupon-window SLA read at date grain, a conditional rate over a timestamp comparison." },
    { slug: "sales-by-day-of-the-week", why: "The weekday traffic pivot is the honest daypart stand-in: the db is DATE-grain, so breakfast-vs-dinner ships as Monday-vs-Saturday or not at all." },
    { slug: "bank-account-summary", why: "Remittance legs folded per statement with no-leg statements surviving at zero — the LEFT JOIN money fold the dunning register is built from." },
    { slug: "number-of-rich-customers", why: "Big-ticket statement legs above a threshold — the ad-fund burn census counts legs over the line the same way this problem counts rich customers." },
    { slug: "employee-bonus", why: "CASE-guarded bonus math — co-op payouts computed only where the legs exist. The guard-else-zero shape is how ad-fund accruals are written here." },
    { slug: "game-play-analysis-i", why: "First order per operator account — the onboarding cohort anchor. MIN-over-window per account is the shape every franchisee ramp read starts from." },
    { slug: "average-selling-price", why: "Weighted menu price per window — band mix shifts the average even when prices never change. The 32.06-versus-111.5 band story is this weighting discipline at db scale." },
    { slug: "funnel-step-conversion", why: "Fate-to-fate conversion with the denominator stated — delivered-over-booked is the kept-rate fold, and this problem drills the conditional rate without letting the base drift." },
    { slug: "basket-depth-aov", why: "Lines per ticket beside average order value is the 2.44 fan-out read — basket depth separates the density story from the price story, and this problem drills both grains in one fold." },
    { slug: "growth-accounting", why: "New versus returning operator accounts per market is the growth memo's opening table — the intensity read that decides whether growth is broadening or concentrating on this book." },
    { slug: "ads-funnel", why: "The ad-fund spend has to trace to coupon-window traffic — a staged funnel over the month spine, which is exactly the coupon-window read this kit ships at date grain." },
    { slug: "budget-pacing", why: "Ad-fund co-op opex pacing against the flight calendar — spend-to-date versus plan is the pacing fold the marketing review opens with before a single coupon flight is approved." },
    { slug: "cohort-retention-matrix", why: "Operator accounts cohorted by first-order month, retained by repeat bookings — the franchisee ramp read that turns the 16-account bench into a retention story." },
    { slug: "credit-utilization-bands", why: "Band-classified utilization with exhaustive ordered arms — the exact CASE discipline the menu-band fold demands, drilled on a different table so the shape transfers." },
    { slug: "calculate-product-final-price", why: "Final price after conditional adjustments — menu pricing with CASE-guarded modifiers, the same guard-else-shape the band fold and ad-fund accruals use." },
    { slug: "find-the-missing-ids", why: "Which ids never appear on the far side — the dunning register's engine. This problem drills the anti-join that returns the 6 never-remitted statements at practice scale." },
    { slug: "ar-aging-schedule", why: "Receivables bucketed by age is the chase list formalized — 15,217.00 of never-remitted royalties aging into dunning tiers is exactly this problem's shape on the statements table." },
    { slug: "delinquency-buckets", why: "Classification before rollup — buckets that must foot to the population. The coverage census (21 exact / 1 partial / 6 none) is this problem's discipline wearing royalty clothes." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing — the remittance rails' 69,612.00 rolling against the ledger cash credit, with the delta asserted in the query's own output." },
    { slug: "gl-reconciliation", why: "Two ledgers, one delta — the 181,080-against-181,080 trial balance made a drill. This problem is close culture: reconcile or the close does not ship." },
    { slug: "trial-balance-check", why: "Debits equal credits to the cent, computed, not assumed — the delta-zero gate that ends every Burger King close, drilled until writing it is reflex." },
    { slug: "duplicate-charge-pairs", why: "The same statement settling twice — the split-rail read at practice scale. Five statements carry 1 card + 1 wire leg, and telling a split from a double-tap is this problem's exact skill." },
    { slug: "amount-anomaly-zscore", why: "Statistical outliers over the statement book — the void-but-remitted 925.00 and the paid-claim 1,756.00 are the anomalies this fold is built to surface before the walk goes line by line." },
  ],
};
