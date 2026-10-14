// SoFi — Wave-9 (Task 98), fintech domain. Pool provenance: company-pools.md
// carries no "Tagged pool = sofi" section, but four SoFi-tagged SQL rows exist
// in the theme menu (loan-amortization-schedule, daily-balance-interest,
// vintage-default-curves, risk-based-pricing) — all four are used here; the
// remaining topic slugs and all 16 problems are theme-curated from the pools
// file's SQL rows (no w*/d*/f* rows). Facts from scripts/company-facts.md
// (probed 2026-10-12); every case slot mechanically verified against
// db/custom.db by scripts/case-audit.ts (temp probe scripts/tmp-probe-98-sofi.ts,
// deleted after use).
// db mapping (loan-book honest, distinct from klarna/affirm's BNPL reads):
// customers = members (region = market), orders = funded loans & financial
// products (delivered = performing-and-amortizing, shipped = funded-and-
// disbursing with shipped_at as the funding stamp, pending = approved-not-yet-
// funded, cancelled = withdrawn pre-funding), order_items = disbursement
// tranches (quantity = units, unit_price = per-unit amounts), products = the
// product shelf (student refi, personal loan, mortgage, invest), suppliers =
// capital/warehouse-line partners & servicers, invoices = member billing
// statements (installments due), payments = borrower payment legs (INTEGER
// cents, /100.0), expenses = opex, ledger_entries = GL.
// NOTE for the wave-9 registry wiring agent: sofi is NOT yet in registry
// COMPANY_META — wire id "sofi", domainId "fintech", name "SoFi", tagline
// exactly as below, accent text-cyan-300 (unused by all 17 fintech siblings).

import type { CompanyKit } from "../types";

export const sofiKit: CompanyKit = {
  id: "sofi",
  domainId: "fintech",
  name: "SoFi",
  tagline: "Loan-book economics behind one-stop membership finance",
  accent: "text-cyan-300",

  brief: [
    "**SoFi** is the digital personal-finance company that started in student-loan refinancing and turned itself into a one-stop membership: personal loans, mortgages, SoFi Invest, and a national bank charter operated like a tech product, with direct deposit and APY perks as the membership glue. Loan-book economics is the home turf — origination cohorts, funding stamps, delinquency, cross-product membership — and every number in the building is a fold over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are members, the 103 orders are funded loans and financial products worth **34,833.28**, and the 251 order_items rows are disbursement tranches — quantity = units, unit_price = per-unit amounts. The status map is fixed: delivered = {emerald:performing-and-amortizing} (52, 50.5%), shipped = funded-and-disbursing (30, 29.1%, with `shipped_at` as the funding stamp), pending = approved-not-yet-funded (14), cancelled = {rose:withdrawn pre-funding} (7, 6.8%).",
    "The data org splits into lending analytics — credit risk, pricing, servicing — and a membership-funnel growth pod, with bank-finance running the close. The heartbeat is the funding clock: an origination books at booking, and `shipped_at` is stamped the day cash actually moves — **82 of 103** funded products carry the stamp, averaging **2.98 days** book-to-fund with a 2–4 day spread, and the 14 approved-not-yet-funded rows have none yet (*a population definition, not a cleanup job*). Money sits one layer down: member billing statements and borrower payment legs in INTEGER cents, where the dollar read is amount_cents / 100.0. Concentration is the third story: **63.5%** of the book sits with members whose lifetime borrow crosses 3,000 (71.2% above 2,000) — one lost member moves a quarter.",
    "Interview screens are census-then-denominator, same as every lender. A typical loop opens with a **two-grain market census** — EU runs 45 originations from just 8 members while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator question out loud (*'do approved-but-never-funded loans count in your base?'*), then into the member ladder where four members sit tied at 4 funded products and rank semantics become a business decision. Servicing rounds walk the {sky:collections fold} — 21 statements settled exact, 1 partial (4,000 of 6,148), 6 never paid worth 15,217 — and probe the two anomalies by name. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file tags only **four SoFi rows** (loan-amortization-schedule, daily-balance-interest, vintage-default-curves, risk-based-pricing) — all four are in this kit, and the rest of the sixteen problems and topic slugs are theme-curated to the known screen shapes: origination funnels, two-grain censuses, vintage reads, CASE-banded pricing, amortization math and the cents-safe servicing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:origination-book census} credit ops opens the monthly committee with, the other rebuilds the {sky:collections coverage census} servicing reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the origination dashboard refresh. A lending analyst opens the book dashboard before standup: did overnight funded products land, did any disbursement tranche move without a funding stamp, does the one-pass status census reconcile — 52 performing + 30 disbursing + 14 approved + 7 withdrawn = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If funding latency drifts off the **2.98-day** norm, the approved-not-yet-funded queue (14 rows) gets pulled before the credit committee's weekly read ships.",
    "**11:30 —** Midday is credit-committee prep. Risk wants the vintage read on the 14-month spine — the book opens at **3,731.97**, troughs at 1,193.86 in July 2024 — plus withdrawal share per market ({rose:APAC 8.1%} versus EU 6.7% on stated denominators); growth wants the concentration re-cut, **63.5% of the book** from 3,000-plus members, and the cross-sell read: direct-deposit members holding a loan but no Invest product. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the committee argument*.",
    "**15:45 —** The afternoon tilts toward servicing and money. The collections coverage refresh runs first — **21 statements exact, 1 partial** (4,000 of 6,148), 6 never paid worth 15,217 — before dunning sends a single reminder; the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero payment legs (#28, 1,756.00). The rails split goes into the treasury pack — autopay card rail 16 legs / 37,364 versus manual wire rail 11 legs / 32,248 — and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Funded-book volume", what: "Total funded loans and financial products on the book: 34,833.28 across 103 originations, average ticket 338.19 against a 25.47 to 1,088.44 spread. The spread IS the product-mix story — student-refi tickets to mortgage-size ones — and every volume query here is a status-aware version of this fold." },
    { name: "Performing share", what: "Delivered ÷ ALL originations booked: 52 of 103 (50.5%). 'Performing' is a status-filtered conditional count, and the denominator — approved-but-unfunded included — is the whole interview." },
    { name: "Funding latency", what: "Booking to cash movement (created_at → shipped_at) over funded products only: 2.98-day average across the 82 of 103 rows that carry the stamp, range 2–4. The population definition ships with the number — unfunded rows have no cycle yet and must not dilute it." },
    { name: "Withdrawal rate", what: "Cancelled share of booked originations, sliced by market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0% (on a 2-row base). The pre-funding withdrawal map that drives the credit committee's demand-quality read." },
    { name: "Member concentration", what: "Share of the book from members spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs member success and sizes the premium-servicing pod." },
    { name: "Origination trend", what: "Monthly book across the 14-month spine (2024-01 to 2025-02): opens at 3,731.97, troughs at 1,193.86 in July 2024, closes at 2,390.53. Vintage reads and funding-capacity plans both hang off this spine." },
    { name: "Collections coverage", what: "Statements settled versus billed: 21 exact (65,612 footing both sides), 1 partial (4,000 of 6,148), 6 never paid worth 15,217. The servicing anti-join refreshed every close — billed is a claim, payment legs are the ledger." },
    { name: "Payment rails mix", what: "Borrower payments by rail: autopay card legs 16 / 37,364 versus manual wire legs 11 / 32,248 — 27 legs, 69,612 total that must foot to the cash account. Rails drift is how a servicing break announces itself." },
  ],

  topics: [
    {
      name: "Origination funnel counts",
      why: "Every SoFi lending screen opens with the funnel: originations booked, funded (shipped_at stamped), performing at term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a disbursing loan 'performing' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain member censuses",
      why: "Originations and members are different grains of the same join, and every census here reports both: EU runs 45 originations from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining members to the book",
      why: "Members carry market and join dates; funded products inherit them through joins, and the join type decides who survives. A product without a member is corruption; a member without products is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Member value ladders",
      why: "Cross-sell leaderboards are rank-window reporting where ties are guaranteed — four members sit at 4 funded products each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Risk-based pricing & tier bands",
      why: "Loan pricing is banded — risk tiers, autopay discounts, fixed versus variable — and bands are CASE-classified with fixed edges the rate sheet publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the priced book, and a reordered WHEN quietly re-bands every borrower. The premium band on this db is honestly empty (max ticket 199.99), and proving a band is empty is a valid answer.",
      slugs: ["risk-based-pricing", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Vintage cohorts & month spines",
      why: "Credit committees read the book by origination month: 14 buckets from 2024-01 to 2025-02, each vintage's size and quality side by side. Monthly folds with date-grain keys are the raw material — and the July trough (1,193.86) versus the January open (3,731.97) is the conversation starter.",
      slugs: ["vintage-default-curves", "immediate-food-delivery-ii", "monthly-transactions-i"],
    },
    {
      name: "Funding-stamp date math",
      why: "The funding clock is date arithmetic: created_at to shipped_at in days, cohorts funded within N days of approval, periods cut with half-open intervals. SoFi probes whether your windows lose the last night — quarter-end is exactly when originations land — and whether the latency average states its 82-row population.",
      slugs: ["the-latest-login-in-2020", "find-golden-hour-customers", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets performing, disbursing, approved and withdrawn in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. Approved-not-yet-funded is read as the remainder and named as a population.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Amortization, accrual & recursion",
      why: "Loan servicing is recursive by nature: an amortization schedule steps balance, interest and principal month by month; daily interest accrual walks a date spine. WITH RECURSIVE and running-total windows are how these schedules get built — the closest a generalist SQL screen gets to credit math.",
      slugs: ["loan-amortization-schedule", "daily-balance-interest", "find-the-missing-ids"],
    },
    {
      name: "Cents discipline & servicing folds",
      why: "Performing is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning list.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "sofi-t1",
      q: "Your loan-book report joins members to funded products. When do you INNER and when do you LEFT — and what silently breaks if you filter a product column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A volume report joins funded products to members: a product with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A membership-coverage report must be LEFT from members: the members with no funded products ARE the answer, arriving with NULL product columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or staging the fold in a CTE. On this db the member anti-join returns a confident zero never-funded members — all 16 members hold at least one product, from the 24-product heavyweights down to the single-product tail — and proving that zero is itself the analyst's job. The anti-join you actually write in anger is the servicing one: statements LEFT JOIN payment legs, where 6 statements have none.",
      tag: "joins",
    },
    {
      id: "sofi-t2",
      q: "Four members tie at 4 funded products on the cross-sell leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose relationship manager gets the cross-sell credit. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer members (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at then id — and writing it in the query comment. On a membership business, a tie at 4 products is four equally-sticky members; the leaderboard should say so, not shuffle them by accident.",
      tag: "windows",
    },
    {
      id: "sofi-t3",
      q: "The census shows 103 funded products and 16 members; EU shows 45 products from 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts product rows after the join — one row per funded product, so a member with 24 products contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 products collapse to 8 logos. Neither is wrong: products measure load and cross-sell depth, members measure installed base and market coverage. The ratio — 5.6 products per member in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for disbursement tranches and COUNT(*) silently counts tranches, not products — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, because the same census at the wrong grain re-prices the cross-sell story.",
      tag: "aggregation",
    },
    {
      id: "sofi-t4",
      q: "shipped_at is NULL until funding lands. What is your policy for the funding-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only funded products have a latency, so the report measures booking-to-cash for the 82 of 103 originations that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL originations returns the funded-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the funded subset; the gap between it and COUNT(*) is exactly the 14 approved-not-yet-funded plus 7 withdrawn rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day funding for loans that have not funded, and at a bank that is not a rounding choice, it is a misstatement. A report whose WHERE clause is doing definitional work without saying so is exactly what a SoFi reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "sofi-t5",
      q: "The credit committee wants withdrawn share per market for markets carrying at least ten originations. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards performing, disbursing and approved rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-origination floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; on this db it keeps EU (45), APAC (37) and US (19) and drops LATAM's 2-row base, which is exactly the denominator honesty the committee wants. Putting it in WHERE errors because COUNT does not exist before groups form. And the percentage itself: 100.0 must sit before the division or integer truncation flattens the map — EU's 3/45 is 6.7 with real arithmetic and 0 without it. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a committee slide and an error, and between a share of originations and a share of dollars.",
      tag: "pipeline",
    },
    {
      id: "sofi-t6",
      q: "WHERE n > (SELECT AVG(n) FROM ...) — the above-average cross-sell list. What is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and n > NULL is UNKNOWN, so the above-average list silently returns nothing while looking valid. On the full book that is theoretical: 103 products across 16 members always produce a mean (6.4375 per member, 6.44 rounded — exactly four members clear it, the 24/17/14/13 ladder). On filtered staging tables — one market, one status, one origination month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each member to ITS market's average) re-runs per outer row and answers a different question at a different cost — per-vintage intensity instead of platform intensity. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for before they let the list near a campaign.",
      tag: "subqueries",
    },
    {
      id: "sofi-t7",
      q: "The origination trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the vintage table becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's originations, and quarter-end is exactly when loans land. The latency variant: julianday(shipped_at) - julianday(created_at), computed only where the stamp exists. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — the baseline, never a zero. The walk itself tells the year's story: the book opens at 3,731.97, slides to the 1,193.86 July trough, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is credit discipline: the spine, the window and the edge row are where vintage reports go wrong.",
      tag: "dates",
    },
    {
      id: "sofi-t8",
      q: "Servicing says a statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero payment legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The classification fold then reads 21 exact (65,612 footing both sides) / 1 partial (4,000 of 6,148) / 6 never-paid — and a day close that cannot reproduce those three blocks does not ship. The money rule: statements and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1756 and quietly eats cents on every odd-cent row. Final gate: the ledger trial balance must land at 181,080 debits against 181,080 credits, delta zero.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "sofi-mcq-1",
      prompt: "A funded product's status reads 'shipped'. In this kit's SoFi stage map, what happened?",
      choices: ["Funded and disbursing — cash moved, shipped_at is the funding stamp", "Performing — amortizing on schedule", "Approved but not yet funded", "Withdrawn before funding landed"],
      answer: 0,
      why: "The stage map is fixed: shipped = funded-and-disbursing (30 of 103, 29.1%), and shipped_at is the funding stamp that powers the 2.98-day latency read. Performing is a later stage.",
      notes: [
        { choice: 1, why: "Performing is 'delivered' — 52 products amortizing at term. Calling disbursing money performing inflates the performing share before a single schedule run proves out." },
        { choice: 2, why: "Approved-not-yet-funded is 'pending' — 14 rows with no shipped_at yet. Pending is not disbursing; it stays in the denominator of every funding rate." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-2",
      prompt: "Withdrawal rate is cancelled ÷ which population? The db holds 52 performing, 30 disbursing, 14 approved-not-funded and 7 withdrawn of 103 booked.",
      choices: ["Performing + disbursing only (7/82 = 8.5%)", "All originations booked (7/103 = 6.8%)", "Performing only (7/52)", "Distinct members (7/16)"],
      answer: 1,
      why: "The house definition: withdrawn ÷ ALL originations booked — the 14 approved-not-yet-funded stay in the denominator because 'not yet funded' is exactly the population that can still withdraw. 6.8% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 unfunded inflates the rate to 8.5% by deleting the rows most likely to withdraw — the population the funnel exists to watch." },
        { choice: 2, why: "7/52 mixes funnel stages into one rate — performing is an outcome stage, not the at-risk base. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-3",
      prompt: "EU carries 45 originations from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts product rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 products per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every product has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is products AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to withdrawn originations only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — EU's 3/45 truncates toward 0 and the market map reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.7 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.067 to 0 first, then scales — the withdrawal map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-5",
      prompt: "Keep only members carrying at least 5 funded products. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY member HAVING COUNT(*) >= 5", "WHERE products >= 5 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A product-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly five members clear it — 24, 17, 14, 13 and 5 products.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'products' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-6",
      prompt: "The cross-sell ladder runs 24, 17, 14, 13, 5 products, then FOUR members tied at 4. Under RANK, what rank do the two 3-product members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-product members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The approved-not-yet-funded rows double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the funded-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 originations.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-8",
      prompt: "A staging-table dunning list uses invoice_id NOT IN (SELECT invoice_id FROM payments WHERE legs_pending) and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: NOT EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every payment carries an invoice_id. But staging tables are exactly where NULLs sneak in, and an empty dunning list is a silent write-off." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-9",
      prompt: "A servicing deck stacks performing statements under withdrawn ones in one layout, built with UNION. A reviewer says one member's statement row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement, same counts, no block label — collapse into one, and the deck loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-10",
      prompt: "A dashboard walks collected dollars leg by leg: SUM(amount) OVER (ORDER BY settled_at). Two payment legs settle in the same second and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on settled_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly leg by leg. On this db the five split-payment statements guarantee tied-leg pairs.",
      notes: [
        { choice: 2, why: "LAG gives the previous leg's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-sofi-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The origination-book census",
      brief:
        "SoFi-flavored brief on the storefront db: the monthly credit committee opens with the origination census — originations booked, performing, disbursing and withdrawn counts per market, plus the withdrawn share with denominators stated on the slide. Probed facts: 103 originations worth 34,833.28; the status mix runs 52 performing / 30 disbursing / 14 approved-not-yet-funded / 7 withdrawn; by market the book is EU 45, APAC 37, US 19, LATAM 2, and withdrawn share reads APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0%. The committee reads biggest book first.",
      ask: "Return each market with its origination count, performing, disbursing and withdrawn counts plus withdrawn share to 1 decimal, biggest book first.",
      template:
        "WITH book AS (\n  SELECT c.region AS market,\n         COUNT(*) AS originations,\n         SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS performing,\n         SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS disbursing,\n         SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS withdrawn\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT market, originations, performing, disbursing, withdrawn,\n       ROUND(100.0 * withdrawn / originations, {4}) AS withdrawn_pct\nFROM book\nORDER BY originations {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the performing-arm literal",
          why: "The performing arm counts status 'delivered' — 52 loans amortizing on schedule (24/21/5/2 by market). 'pending' would count the 14 approved-but-unfunded rows and the committee reads demand as performance.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the disbursing-arm literal",
          why: "Disbursing loans carry status 'shipped' — 30 rows with shipped_at as the funding stamp (12/8/10/0). 'delivered' here double-books performing money into the disbursing column and the arms stop reconciling to their market totals.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the withdrawn-arm literal",
          why: "Withdrawn pre-funding is status 'cancelled' — 7 rows, 3 in EU and APAC, 1 in the US. Any other literal moves the numerator and the withdrawn share stops matching the published 6.8% book rate.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Withdrawn share reports to 1 decimal — 6.7 / 8.1 / 5.3 / 0.0, exactly the probed market shares. Precision 2 prints 6.67 and drifts off the committee slide; precision 0 rounds 6.7 up to 7 and APAC reads over EU.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The committee reads biggest book on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's 2 originations — a correct query aimed at the wrong end of the table.",
        },
      ],
      distractors: ["'pending'", "0", "2", "ASC", "SUM"],
      walkthrough:
        "Two stages: fold the book per market, then attach the rate. The CTE joins every origination to its member's market and folds with SUM(CASE) arms — performing reads 24/21/5/2, disbursing 12/8/10/0, withdrawn 3/3/1/0 against originations 45/37/19/2, so every row reconciles by construction (EU 24+12+6+3 = 45, with approved-not-yet-funded as the named remainder 6/5/3/0). The outer SELECT divides withdrawn by originations with the 100.0 multiplier first — ROUND(..., 1) prints 6.7 / 8.1 / 5.3 / 0.0, exactly the probed market shares. The distractors fail honestly: 'pending' in any status arm re-counts the 14 unfunded rows and every column lies at once; 0 or 2 in the precision slot re-rounds the share off the published figures; SUM as an arm collapses the CASE into a misuse-of-aggregate error; ASC in the status arms errors outright, and ASC in the ORDER BY opens the committee on LATAM. The read: APAC carries the highest withdrawn share (8.1% on 37 originations) while LATAM's zero sits on a 2-row base — a share without its denominator is a rumor.",
    },
    {
      id: "cs-sofi-2",
      tier: "medium",
      topic: "q8",
      universe: "month-close",
      title: "The collections coverage census",
      brief:
        "SoFi-flavored brief on the storefront db: month-close servicing walks the collections fold — every member billing statement classified by what actually settled against it, with billed and collected footing per block. Probed facts: 28 statements carrying 27 payment legs; the coverage rollup reads 21 exact footing 65,612 on both sides, 6 with no payment worth 15,217, and 1 partial at 4,000 of 6,148; the anomalies are known by name — void-but-settled #11 (925.00) and paid-status #28 (1,756.00) with zero legs. Servicing reads biggest block first.",
      ask: "Return each coverage block with its statement count, billed total and collected total in dollars to 2 decimals, biggest block first.",
      template:
        "WITH per_statement AS (\n  SELECT i.id,\n         i.status,\n         i.amount_cents,\n         COUNT(p.id) AS legs,\n         SUM(p.amount_cents) AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.{1}\n  GROUP BY i.id\n)\nSELECT CASE WHEN legs = {2} THEN 'no payment'\n            WHEN paid_cents = amount_cents THEN {3}\n            ELSE 'partial' END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS billed,\n       ROUND(SUM(COALESCE(paid_cents, 0)) / 100.0, 2) AS collected\nFROM per_statement\nGROUP BY coverage\nORDER BY statements {4};",
      slots: [
        {
          answer: "id",
          kind: "keyword",
          label: "the statement join key",
          why: "The fold keys statements to their legs on i.id — the statement primary key. Any other column either errors or joins on values that never match, collapsing every statement into the no-payment block.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the zero-legs gate",
          why: "legs = 0 is the never-paid gate — the 6 statements with no leg at all, #28's paid-status lie included, collected reading a clean 0. legs = 1 would swallow the 17 one-leg statements and the partial would hide inside a fake no-payment block.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the paid-in-full label",
          why: "Paid-in-full means collected cents equal billed cents — 21 statements footing 65,612.00 on both sides. 'partial' here folds the exact block into the partial and the dunning list doubles overnight.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-block-first direction",
          why: "Biggest block first: exact 21, no payment 6, partial 1 — the order servicing reads. ASC would lead with the single partial and bury the 65,612.00 footing the close signs off on.",
        },
      ],
      distractors: ["1", "2", "ASC", "NOT", "'partial'", "'paid'"],
      walkthrough:
        "Two stages: settle the statement grain, then classify and roll. The CTE LEFT JOINs each statement to its payment legs and folds per statement — COUNT(p.id) as legs, SUM(p.amount_cents) as paid_cents — and the outer SELECT labels each statement: legs = 0 is the never-paid block, collected equal to billed is exact, everything else is partial, then rolls with COUNT and cents-safe dollar sums (/100.0). The rollup reproduces the probed census cell for cell: exact 21 statements footing 65,612.00 billed and collected; no payment 6 worth 15,217.00 with collected reading 0 thanks to the COALESCE guard; partial 1 at 6,148.00 billed, 4,000.00 collected. The anomalies live exactly where the anomaly list says: void-but-settled #11 (925.00) sits inside exact, paid-status #28 (1,756.00) sits inside no payment — status is a claim, legs are the ledger. The distractors fail honestly: 1 or 2 in the legs gate re-cuts the blocks around one-leg or two-leg statements (the five split-payment statements would masquerade as never paid); 'partial' as the exact label folds 21 statements into the partial and the dunning list doubles; 'paid' relabels without reconciling to the published census; ASC flips the read; NOT and any wrong join key error or empty the fold. One statement short of footing means the close does not ship.",
    },
  ],

  problems: [
    { slug: "delinquency-buckets", why: "Days-past-due buckets (current, 1-29, 30-59, 60-89, 90+) are the servicing map SoFi's collections pod lives in — a CASE-band fold over statement age that must leave no borrower unclassified." },
    { slug: "delinquency-roll-rates", why: "Roll rates — what share of 30-59 DPD loans slid to 60-89 — are the credit committee's early-warning table. State-transition counting over bucketed balances is exactly this problem's shape." },
    { slug: "expected-credit-loss", why: "The allowance is a weighted fold: exposure times probability of default per bucket. This problem drills the conditional-aggregation shape the finance pod uses for provision math." },
    { slug: "credit-utilization-bands", why: "Member health before a pre-qual offer: utilization banded into tiers. Band-classify-then-count is the same CASE discipline the pricing sheet uses." },
    { slug: "gl-reconciliation", why: "Under a national bank charter the GL must reconcile daily. This problem is the delta-zero discipline behind the 181,080 = 181,080 trial-balance gate." },
    { slug: "trial-balance-check", why: "Debits must equal credits before the close ships — the exact gate SoFi finance runs at 181,080 against 181,080. Conditional SUMs over a ledger are the drill." },
    { slug: "duplicate-charge-pairs", why: "Servicing ops hunts duplicate payment legs before they become member disputes. Self-join window pairing over payment rows is the fraud-adjacent shape." },
    { slug: "amount-anomaly-zscore", why: "A borrower payment far off its baseline sigma is either a prepayment or a problem. Z-score screening over amounts is how servicing triages the tail." },
    { slug: "top-percentile-fraud", why: "PERCENT_RANK-flagged top-decile risk rows feed the fraud review queue. Percentile windows over payment behavior are the screen's core move." },
    { slug: "portfolio-weights", why: "SoFi Invest reports each member's holdings as portfolio weights. Window shares over positions are the exact computation the invest dashboards run." },
    { slug: "portfolio-concentration-hhi", why: "Concentration is the kit's recurring theme — 63.5% of the loan book from 3,000-plus members. HHI folds the same concentration instinct into invest portfolios." },
    { slug: "cohort-retention-matrix", why: "Membership economics: does the direct-deposit cohort stick? Cohort-offset retention grids over member activity are the growth pod's home query." },
    { slug: "dormant-reactivation", why: "Members who funded one product and went quiet are the winback list. NOT EXISTS dormancy detection is the anti-join shape, with the honest-zero caveat this db teaches." },
    { slug: "structuring-detection", why: "A bank's compliance desk watches for transaction patterns just under reporting thresholds. Threshold-plus-window logic is the AML-flavored screen." },
    { slug: "funnel-step-conversion", why: "The membership funnel — member, direct deposit, second product — is SoFi's cross-sell engine. Step-to-step conversion rates with stated denominators are the drill." },
    { slug: "rfm-segmentation", why: "NTILE member segmentation (recency, frequency, monetary) drives who gets the next pre-qual offer. Quintile windows over member value are the shape." },
  ],
};
