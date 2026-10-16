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
// theme menu's sql rows (no w*/d*/f*-initial rows) and say so in brief P4.
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
    "Preparation strategy: the pools file carries no Burger King section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fate funnels with stated denominators, two-grain censuses, tie-heavy operator ladders, band CASE folds, cents-safe remittance math and the never-remitted register. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:operator bench ladder} the franchise review opens with, the other rebuilds the {rose:royalty coverage census} finance reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction, and every coverage census to 28.",
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
      slugs: ["percentage-of-users-attended-a-contest", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Two-grain market censuses",
      why: "Orders and operator accounts are different grains of the same join, and every census here reports both: EU runs 45 orders from 8 operator accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded; the ratio (5.6 versus 9.5 orders per account) is the intensity read that decides where field support flies.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-ii", "reported-posts"],
    },
    {
      name: "Coupon-window month spines",
      why: "The coupon calendar is Burger King's traffic story, but orders carry no coupon flag — so the honest read is the month spine at date grain: 14 buckets from 2024-01 to 2025-02, launch at 3,731.97, the July trough at 1,193.86. `STRFTIME('%Y-%m', created_at)` is the spine; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction.",
      slugs: ["list-the-products-ordered-in-a-period", "monthly-transactions-i", "sales-analysis-iii"],
    },
    {
      name: "Operator leaderboards & tie policy",
      why: "The franchisee bench ranks operator accounts, and ties are guaranteed: the ladder runs 24, 17, 14, 13, 5 booked orders, then FOUR operators tie at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow — a policy about peer franchisees, not syntax. The field team publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "top-five-artists"],
    },
    {
      name: "Menu-band CASE folds",
      why: "Menu bands are CASE-classified — the fold splits 16 SKUs into 8 budget (< 50) at 32.06 average and 8 mid (50–200) at 111.5, with the premium arm EMPTY by probe (ceiling 199.99). The arms must be exhaustive and ordered: a hole in the CASE is a hole in the mix story, and a reordered WHEN quietly re-bands the base. An empty arm is a population fact to state, not a bug to patch.",
      slugs: ["calculate-special-bonus", "triangle-judgement", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Fire-clock latency",
      why: "The fire clock measures order open to fire stamp — julianday(shipped_at) minus julianday(created_at) — over the 82 of 103 orders that carry the stamp, averaging 2.98 days on a 2–4 spread. The 14 queued orders have no stamp and no cycle yet, and the regional cut (APAC 2.93 to LATAM 3.5) only reconciles if the population is stated. AVG with a silent NULL-shrink is the classic wrong number wearing the right name.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "second-day-confirmation"],
    },
    {
      name: "Never-remitted anti-joins",
      why: "The dunning register is the anti-join that runs every close: statements carrying zero remittance legs — 6 rows worth 15,217.00, including paid-claim #28 at 1,756.00, which is why the payments table is the ledger of record and the status column is a claim. Building it honestly (LEFT JOIN plus IS NULL, or NOT EXISTS) and reconciling it against the 22 leg-carrying statements is the exact discipline being graded.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "Royalty-coverage CASE classification",
      why: "The coverage census classifies at statement grain — legs equal billed → 'exact' (21, including void-but-remitted #11 at 925.00, which folds in by construction), zero legs → 'never remitted' (6), else 'partial' (1: 4,000.00 of 6,148.00). Classification happens BEFORE any rollup, the buckets must foot to 28, and the two error modes — void-but-remitted, paid-but-never-remitted — are mirrors the census catches and the status column never will.",
      slugs: ["count-salary-categories", "type-of-triangle", "evaluate-boolean-expression"],
    },
    {
      name: "Cents-safe money reads",
      why: "Royalty statements and remittance legs bill in INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and eats cents on every odd-cent row. The rails matter too: card legs (16, 37,364.00) versus wire legs (11, 32,248.00) tie to 69,612.00 at the ledger cash credit, and the split-rail statements straddle both.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "npv-queries"],
    },
    {
      name: "Concentration & share arithmetic",
      why: "The book concentrates hard: 63.5% of booked value sits with operator accounts whose lifetime spend crosses 3,000 (71.2% above 2,000), and the top distribution partner carries 32% of network revenue (11,130.25) with the top two at 58.7%. Shares are 100.0-multiplied BEFORE the division — SUM of 0/1 flags over COUNT is integer arithmetic, and the abort share truncates to a displayed 0 while APAC actually runs 8.1%.",
      slugs: ["queries-quality-and-percentage", "ads-performance", "compute-the-rank-as-a-percentage"],
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
  ],
};
