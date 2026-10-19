// SoFi — Wave-9 (Task 98), fintech domain. Pool provenance: company-pools.md
// carries no "Tagged pool = sofi" section, but four SoFi-tagged SQL rows exist
// in the theme menu (loan-amortization-schedule, daily-balance-interest,
// vintage-default-curves, risk-based-pricing) — all four are used here; the
// remaining topic slugs and all 32 problems are theme-curated from the pools
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
    "Preparation strategy: the pools file tags only **four SoFi rows** (loan-amortization-schedule, daily-balance-interest, vintage-default-curves, risk-based-pricing) — all four are in this kit, and the rest of the thirty-two problems and topic slugs are theme-curated to the known screen shapes: origination funnels, two-grain censuses, vintage reads, CASE-banded pricing, amortization math and the cents-safe servicing spine. Do the topics in order, then run the six case studies on the live storefront db: the {emerald:origination-book census} credit ops opens the monthly committee with, the {sky:collections coverage census} servicing reads at every close, the two-grain market census, the member velocity ladder, the one-pass stage census, and the vintage month walk. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks SoFi data teams rehearse most: the origination-book census with its withdrawn-share denominators, the collections coverage census with its status-versus-legs anomalies, the two-grain market census where load and coverage split into separate columns, the member velocity ladder with its published tie policy, the one-pass stage census that reconciles to 103 by construction, and the vintage month walk built on `LAG`. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'what's your denominator?' follow-up tests.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "ads-funnel", "analyze-subscription-conversion", "game-play-analysis-v", "funnel-step-conversion"],
    },
    {
      name: "Two-grain member censuses",
      why: "Originations and members are different grains of the same join, and every census here reports both: EU runs 45 originations from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "basket-depth-aov"],
    },
    {
      name: "Joining members to the book",
      why: "Members carry market and join dates; funded products inherit them through joins, and the join type decides who survives. A product without a member is corruption; a member without products is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "customers-who-never-order", "analyze-organization-hierarchy"],
    },
    {
      name: "Member value ladders",
      why: "Cross-sell leaderboards are rank-window reporting where ties are guaranteed — four members sit at 4 funded products each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "capital-gain-loss"],
    },
    {
      name: "Risk-based pricing & tier bands",
      why: "Loan pricing is banded — risk tiers, autopay discounts, fixed versus variable — and bands are CASE-classified with fixed edges the rate sheet publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the priced book, and a reordered WHEN quietly re-bands every borrower. The premium band on this db is honestly empty (max ticket 199.99), and proving a band is empty is a valid answer.",
      slugs: ["risk-based-pricing", "weather-type-in-each-country", "count-salary-categories", "calculate-salaries", "calculate-compressed-mean", "cohort-retention-matrix", "dormant-reactivation", "rfm-segmentation"],
    },
    {
      name: "Vintage cohorts & month spines",
      why: "Credit committees read the book by origination month: 14 buckets from 2024-01 to 2025-02, each vintage's size and quality side by side. Monthly folds with date-grain keys are the raw material — and the July trough (1,193.86) versus the January open (3,731.97) is the conversation starter.",
      slugs: ["vintage-default-curves", "immediate-food-delivery-ii", "monthly-transactions-i", "budget-pacing", "calculate-orders-within-each-interval", "delinquency-buckets", "delinquency-roll-rates", "expected-credit-loss", "credit-utilization-bands", "amount-anomaly-zscore", "top-percentile-fraud", "structuring-detection"],
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
      slugs: ["loan-amortization-schedule", "daily-balance-interest", "find-the-missing-ids", "gl-reconciliation", "trial-balance-check", "portfolio-weights", "portfolio-concentration-hhi"],
    },
    {
      name: "Cents discipline & servicing folds",
      why: "Performing is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the member world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning list.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule", "balance-rollforward", "account-balance", "bank-account-summary", "duplicate-charge-pairs"],
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
    {
      id: "sofi-t9",
      q: "Walk me through cutting a period — say, the March vintage — without losing its last night.",
      a: "Half-open intervals, always: created_at >= '2024-03-01' AND created_at < '2024-04-01'. The form is inclusive at the start, exclusive at the end, so it catches '2024-03-31 23:58:12' with no boundary judgment and composes cleanly — April's filter starts exactly where March's ends, with no overlap and no gap. BETWEEN '2024-03-01' AND '2024-03-31' silently drops everything after midnight on the 31st, and quarter-end is precisely when originations land, so the missing rows are never random. On this db March holds 8 originations — but the point is the policy, not the count: the analyst who states the boundary rule before writing the WHERE clause is the one whose vintage tables survive audit. Date bugs are boundary bugs.",
      tag: "dates",
    },
    {
      id: "sofi-t10",
      q: "Why can't you filter on a window function's output in WHERE, and what is the fix?",
      a: "Because of stage order: WHERE runs before SELECT, and window functions are computed IN the SELECT stage — so RANK() OVER (...) AS rnk simply does not exist yet when WHERE evaluates. The engine either errors or, worse, you write the filter against a column you think exists and get an empty result. The fix is staging: compute the window in a CTE or derived table — member_ladder AS (SELECT name, RANK() OVER (ORDER BY funded DESC) AS rnk …) — then filter rnk <= 5 in the outer SELECT. This is the two-step shape behind every top-N-per-group read in this kit, and it is also why the same query sometimes needs the window twice: the outer stage can see the alias, the inner stage cannot. Saying 'windows live in SELECT, filters that need them live one stage up' is the complete answer.",
      tag: "windows",
    },
    {
      id: "sofi-t11",
      q: "A pipeline retry re-booked the same origination twice. How do you keep exactly one row — and which one?",
      a: "The window dedupe: ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY updated_at DESC) AS rn, then keep rn = 1 and discard the rest. The PARTITION BY names what 'the same loan' means — the business key, not the surrogate id, if retries mint new ids — and the ORDER BY names the survivor policy: newest ingest wins, with created_at or id as the deterministic tie-breaker when two rows share a timestamp. Detect first with GROUP BY the key HAVING COUNT(*) > 1 so you know the blast radius before deleting anything. The naive DELETE with no tie-breaker can remove BOTH copies — at a bank that is not a cleanup, it is an incident. Keep-newest-with-a-stated-order-by is the answer a servicing reviewer wants to hear.",
      tag: "windows",
    },
    {
      id: "sofi-t12",
      q: "What is your NULL policy for the funding-stamp column — in filters, joins, GROUP BY and aggregates?",
      a: "Four behaviors, one policy. Filters: NULL fails both = and != comparisons, so WHERE shipped_at IS NOT NULL is the funded population (82) and IS NULL is the union of pending and withdrawn (21) — state which states that union covers. Joins: NULL keys match nothing, so an unstamped row never joins on the stamp. GROUP BY: NULLs form one bucket — group by shipped_at and the 21 unstamped rows collapse into a single honest mega-bucket. Aggregates: COUNT(shipped_at) counts stamps, COUNT(*) counts rows, and the gap between them IS the unfunded story. The policy I state out loud: never IFNULL a stamp to zero or a sentinel date — inventing same-day funding misstates the latency read; NULL is a population definition, not a cleanup job.",
      tag: "nulls",
    },
    {
      id: "sofi-t13",
      q: "When does a CASE expression need the ELSE branch — and what silently happens without it?",
      a: "CASE without ELSE returns NULL for every non-matching row, which is invisible in SUM and COUNT (both ignore NULLs) until a group matches nothing: SUM(CASE WHEN status = 'delivered' THEN 1 END) over a withdrawn-only cohort is NULL, while the ELSE 0 version is 0 — and a NULL flowing into 100.0 * x / y prints NULL, breaks formatting, and poisons downstream division. The ELSE 0 is the zero-bucket honesty clause: every rate read in this kit writes it, so the empty bucket prints 0 instead of vanishing. The second rule is exhaustiveness: the arms must partition the population — a CASE pricing map with a hole between two bands silently drops borrowers into NULL, and a reordered WHEN re-bands every row above the moved edge. Write the ELSE, order the arms, and test the boundary values.",
      tag: "case-when",
    },
    {
      id: "sofi-t14",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — how do you choose on the origination book?",
      a: "Each counts a different grain, and the choice IS the metric. COUNT(*) counts rows — 103 originations, every status included. COUNT(column) skips NULLs — COUNT(shipped_at) is 82, and the 21-row gap is the unfunded population, which makes the two counts a feature, not a discrepancy. COUNT(DISTINCT customer_id) folds repeats back to members — 103 originations are 16 members, and EU's 45 are 8 logos. The trap that fails candidates is the third grain: join order_items for tranches and COUNT(*) silently counts 251 tranches, not 103 loans. Say out loud 'one row per what?' for every COUNT — the census that reports 45 originations AND 8 members in one row is exactly the two-grain discipline this kit drills.",
      tag: "aggregation",
    },
    {
      id: "sofi-t15",
      q: "Why is an average of per-market average tickets wrong, and what do you compute instead?",
      a: "Because it weights every market equally regardless of size. On this db the regional average tickets run EU 335.32 (45 originations), APAC 313.66 (37), US 383.48 (19), LATAM 426.22 (2) — averaging those four numbers gives 364.67, which describes a book that does not exist; the true all-book average is 338.19, where LATAM's two loans barely register. The honest options: re-aggregate from the base rows (SUM(total) over everything divided by COUNT(*)), or re-weight the group averages — SUM(avg * n) / SUM(n), the same arithmetic one level up. The interview move is naming WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim to defend, not assume. On a concentration-driven book, the difference is not cosmetic.",
      tag: "aggregation",
    },
    {
      id: "sofi-t16",
      q: "IN (SELECT …) versus EXISTS (SELECT …) — which do you reach for when the growth pod asks for members with a direct deposit but no Invest product?",
      a: "EXISTS, and the reason is the NULL trap plus intent. NOT IN over a subquery that returns even one NULL makes every comparison UNKNOWN and the list silently empties — the classic staging-table bug — while NOT EXISTS short-circuits on the first match and never trips on NULLs. IN is fine for small static-looking sets from clean dimensions; EXISTS is the presence test that survives messy data. The third shape, a LEFT JOIN + IS NULL anti-join, is the row-honest version when you also want the unmatched rows' columns. On this db the member-side anti-join returns a confident zero — all 16 members hold products — and proving that zero, rather than shipping a query you haven't reasoned about, is the part of the answer that lands.",
      tag: "subqueries",
    },
    {
      id: "sofi-t17",
      q: "Your book total doubles after joining tranches. Walk me through the diagnosis and the fix.",
      a: "Diagnose by counts: COUNT(*) on orders alone is 103; on orders JOIN order_items it is 251 — the jump is the fan-out, each multi-tranche loan repeating its total on every tranche row. Confirm with GROUP BY order_id HAVING COUNT(*) > 1 to see which loans carry multiple disbursements. Then fix by grain: for order-grain revenue, pre-aggregate tranches to order grain in a CTE (SUM by order_id) and join that — one row per loan, totals intact; for tranche-grain reads, keep the join and use COUNT(DISTINCT o.id) for any entity count, with every ratio naming its denominator. The number to never ship: SUM(o.total) over the raw join, which inflates the 34,833.28 book by roughly 2.4x. Pre-aggregate-then-join is the muscle; the before-and-after count is the habit.",
      tag: "joins",
    },
    {
      id: "sofi-t18",
      q: "Where does a self-join earn its keep in lending analytics?",
      a: "Anywhere two rows of the same table must meet. Duplicate payment legs: join payments to itself on statement_id where the two ids differ and the amounts and dates sit within a suspicious window — the servicing fraud-adjacent screen. Member-to-member structures: joint applicants and referral chains are parent-child relations inside one members table, walked with a self-join plus a depth counter. Even the market census's intensity read has a self-join cousin: pairing a member's products to each other to find cross-holdings. The discipline a self-join forces is alias hygiene — o1 and o2 with an explicit inequality (o1.id < o2.id) to avoid mirrored pairs — and the trap is the join condition that forgets the inequality and pairs every row with itself. Name the two aliases' roles out loud and the query writes itself.",
      tag: "joins",
    },
    {
      id: "sofi-t19",
      q: "What makes a predicate sargable, and which habits keep the servicing dashboards cheap?",
      a: "Sargable means the predicate can use an index: the bare column compares to a value. SUBSTR(created_at, 1, 7) = '2024-03' wraps the column in a function and forces a scan of every origination; the sargable twin is the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' — same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT *; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question instead of joining first and filtering after. On servicing tables that grow every close, these are not micro-optimizations — they are why the dunning refresh finishes before the reminders send.",
      tag: "performance",
    },
    {
      id: "sofi-t20",
      q: "Money is stored in INTEGER cents. Where does that discipline earn its keep, and where does it usually break?",
      a: "It earns its keep at every comparison and every sum. The break points are the obvious ones: amount_cents / 100 is integer division — 614800 / 100 is fine, but an odd-cent row truncates silently, so the dollar read is always amount_cents / 100.0; ROUND in mid-pipeline discards precision a later SUM still needed; and REAL comparisons after conversion make equality checks unreliable, which is why the trial balance compares 181080 against 181080 in cents and only converts at the presentation edge. The policy I state in reviews: aggregate in cents, convert once, round only what a human reads, and let a delta-zero check prove the pipeline — the collections census footing 65,612 on both sides is only provable because nothing was rounded away en route. A number that survives that chain is a number the close can sign.",
      tag: "numbers",
    },
    {
      id: "sofi-t21",
      q: "UNION versus UNION ALL — when is the dedupe correct business logic and when is it a silent bug?",
      a: "UNION ALL concatenates and that is the honest default: status arms stacked under their totals, this month's rows above last month's — branches that are logically disjoint, where every row belongs. UNION adds a distinct pass over the combined set, which is correct only when a duplicated row would double-count — and a silent bug when duplicates are the signal: a servicing deck that lost one member's statement row to a whole-row collapse across branches had a UNION bug that printed no error at all. The discipline: default to UNION ALL, add the branch-label column so rows can never be byte-identical, and reach for UNION only when you can say out loud which duplicated rows you are paying to collapse. On a close, a dedupe you cannot explain is an audit finding.",
      tag: "set-ops",
    },
    {
      id: "sofi-t22",
      q: "How does WITH RECURSIVE build an amortization schedule — and what stops it?",
      a: "Two members. The anchor SELECT seeds month 0: balance, annual rate, monthly payment. The recursive SELECT reads the CTE itself — that self-reference is the recursion — and computes the next month: interest = balance × rate / 12, principal = payment − interest, new_balance = balance − principal. The terminator is a WHERE in the recursive member: new_balance > 0, or a month counter under the term — without it the CTE runs forever (SQLite caps it, then errors). This is how servicing builds schedules set-based: no cursor, no loop, one query returning every month of every loan, and the same shape walks daily accrual along a date spine. The interview follow-up is always 'what stops it?' — name the terminator, or admit you would have shipped an infinite loop.",
      tag: "ctes",
    },
    {
      id: "sofi-t23",
      q: "Before you write a single line of the cross-sell report, what do you pin down?",
      a: "The definition, in writing. Four decisions: the event (funded products booked — including approved-but-unfunded or not?), the numerator (members holding 2+ product families), the denominator (all 16 members, or only members past onboarding — the two can disagree by double digits), and the window (lifetime, or trailing quarter?). Then the discipline move: encode the definition as a named CTE — invest_holders AS (SELECT customer_id FROM … GROUP BY customer_id HAVING …) — so the SQL IS the definition and a reviewer can audit it instead of arguing with you. Lenders live and die on definitions drifting between decks: 'performing' must mean the same thing in the committee slide and the query. The analyst who says 'repeat means 2+ funded products, withdrawn excluded, lifetime' owns the room.",
      tag: "metrics",
    },
    {
      id: "sofi-t24",
      q: "The funding dashboard's performing count moved overnight. What do you check in the first ten minutes?",
      a: "Five checks, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream number. Reconciliation: the one-pass status census must still sum to 103 — 52 + 30 + 14 + 7 — and a branch that fails the identity is the incident. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. NULL spikes: COUNT(shipped_at) versus COUNT(*) — a stamp column that went 21% to 40% NULL moves every funding-rate read built on it. On this db that ritual is how the paid-status-no-legs statement (#28, 1,756.00) surfaces: status says paid, legs say zero. The deliverable is which check passed and when — not 'looks fine'.",
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
    {
      id: "sofi-mcq-11",
      prompt: "How many of the 103 originations have shipped_at IS NULL — and who are they?",
      choices: ["14 — the approved-not-yet-funded rows", "21 — the 14 unfunded plus the 7 withdrawn", "7 — the withdrawn rows", "82 — the funded rows, listed inversely"],
      answer: 1,
      why: "The funding stamp lands only when cash moves: 82 of 103 originations carry it. The other 21 are the 14 approved-not-yet-funded AND the 7 withdrawn pre-funding — neither population ever gets a stamp. WHERE shipped_at IS NULL returns the union, not the pending queue alone.",
      notes: [
        { choice: 0, why: "Pending is a status, not a NULL test. Status = 'pending' returns 14; shipped_at IS NULL returns 21 — withdrawn rows were unfunded too, and NULL can't tell you which business state caused it." },
        { choice: 2, why: "Withdrawn is 7 by status, but their shipped_at is equally NULL. Filtering on absence of a stamp conflates two funnel states into one bucket." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-12",
      prompt: "The vintage spine needs one row per origination month, 2024-01 through 2025-02 (14 buckets). Which GROUP BY key builds it?",
      choices: ["STRFTIME('%m', created_at)", "SUBSTR(created_at, 1, 7)", "STRFTIME('%Y', created_at)", "MONTH(created_at)"],
      answer: 1,
      why: "SUBSTR(created_at, 1, 7) keeps year plus zero-padded month — 14 distinct buckets on this db. STRFTIME('%m') returns month alone, merging January 2024 with January 2025 into one bucket (12 rows); '%Y' collapses to 2; MONTH() is not a SQLite function.",
      notes: [
        { choice: 0, why: "Dropping the year is the classic vintage-table bug: the committee reads one giant January instead of two. Always keep the year in the bucket key." },
        { choice: 2, why: "Year-only gives 2 buckets — a trend read with no months in it. The spine's grain IS the month." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-13",
      prompt: "`SELECT status, COUNT(*) FROM orders GROUP BY status` — how many rows come back, and what do they read?",
      choices: ["3 rows — delivered, shipped, pending", "4 rows — 52, 30, 14, 7", "16 rows — one per member", "1 row — 103 total"],
      answer: 1,
      why: "GROUP BY status folds 103 originations into one row per distinct status: delivered 52, shipped 30, pending 14, cancelled 7 — the four arms of the origination census that must reconcile to 103 by construction.",
      notes: [
        { choice: 0, why: "There are four statuses on this db — forgetting 'cancelled' is how a census silently loses the withdrawal story. The reconciliation check (arms sum to 103) catches it." },
        { choice: 3, why: "Without GROUP BY, COUNT(*) prints one row — the total, not the mix. The mix is the business read; the total is its footer." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-14",
      prompt: "A servicing rollup LEFT JOINs statements to payment legs; the 6 never-paid statements arrive with NULL paid_cents. What does the collected column print without a guard?",
      choices: ["0", "NULL", "The billed amount", "The statement count"],
      answer: 1,
      why: "SUM over a group with no rows is NULL, not zero — so the never-paid block prints a NULL collected column unless the query wraps it: COALESCE(SUM(p.amount_cents), 0). The dunning list then reads 0 collected instead of a blank.",
      notes: [
        { choice: 0, why: "Zero is the BUSINESS answer but not the SQL default — aggregates over empty sets return NULL. COALESCE is the policy, not the engine's habit." },
        { choice: 2, why: "Nothing makes NULL fall back to billed — that would misstate the claim as collected money. The two columns must stay independent." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-15",
      prompt: "The market census is ordered by originations DESC. Which query returns just the SECOND-heaviest market?",
      choices: ["ORDER BY COUNT(*) DESC LIMIT 2", "ORDER BY COUNT(*) DESC LIMIT 1 OFFSET 1", "ORDER BY COUNT(*) ASC LIMIT 1", "ORDER BY COUNT(*) DESC OFFSET 2"],
      answer: 1,
      why: "DESC ranks EU 45, APAC 37, US 19, LATAM 2; LIMIT 1 OFFSET 1 skips the first row and returns APAC. LIMIT 2 returns two rows (a top-two read), ASC LIMIT 1 returns LATAM, and OFFSET without LIMIT isn't a cut.",
      notes: [
        { choice: 0, why: "LIMIT 2 returns the top TWO markets — a different deliverable. The 'nth' ask is the OFFSET skill, and the follow-up is always what happens on ties." },
        { choice: 2, why: "ASC LIMIT 1 returns the SMALLEST market — a correct query answering the opposite question. Direction errors look like ranking errors." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-16",
      prompt: "Count March 2024 originations (8 of them). Which WHERE clause is the professional default?",
      choices: ["BETWEEN '2024-03-01' AND '2024-03-31'", "created_at >= '2024-03-01' AND created_at < '2024-04-01'", "SUBSTR(created_at, 6, 2) = '03'", "created_at LIKE '2024-03%'"],
      answer: 1,
      why: "The half-open range [Mar 1, Apr 1) keeps every instant of March — including the last night's originations, which is exactly when loans land. BETWEEN '2024-03-01' AND '2024-03-31' drops everything after midnight on the 31st; the LIKE and SUBSTR forms work but scan every row and can't use an index.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends, so '2024-03-31 14:22:00' falls outside '2024-03-31'. Quarter-end is precisely when the missing rows hurt most." },
        { choice: 3, why: "LIKE works on TEXT timestamps but wraps the column in a pattern match — unreadable at index time and fragile if the format ever gains precision." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-17",
      prompt: "`SELECT COUNT(*) FROM orders WHERE status = delivered` errors. What is the engine actually saying?",
      choices: ["delivered must be wrapped in ROUND()", "delivered is read as a column name — and there is no such column on orders", "COUNT(*) cannot follow a WHERE clause", "The query needs GROUP BY to use a literal"],
      answer: 1,
      why: "Unquoted text is an identifier: the engine looks for a column called delivered, fails with 'no such column', and stops. Status literals are TEXT and need single quotes: status = 'delivered'. Double quotes would make it an identifier again in standard SQL.",
      notes: [
        { choice: 0, why: "ROUND is numeric grammar — irrelevant here. The error is lexical: bare words resolve as identifiers, not values." },
        { choice: 2, why: "COUNT(*) after WHERE is perfectly legal — every census in this kit is exactly that shape. The error is the bare word, not the clause order." },
      ],
      difficulty: "easy",
    },
    {
      id: "sofi-mcq-18",
      prompt: "Which expression computes book-to-fund latency in days on this SQLite warehouse?",
      choices: ["DATEDIFF(day, created_at, shipped_at)", "julianday(shipped_at) - julianday(created_at)", "shipped_at - created_at", "strftime('%d', shipped_at) - strftime('%d', created_at)"],
      answer: 1,
      why: "julianday converts each timestamp to a fractional day count, so the difference IS the elapsed days — 2.98 on average across the 82 stamped rows. DATEDIFF does not exist in SQLite; subtracting TEXT timestamps yields 0; day-of-month arithmetic breaks the moment a loan crosses a month boundary.",
      notes: [
        { choice: 0, why: "DATEDIFF is SQL Server dialect. Reaching for it in a SQLite screen is a dialect tell the interviewer notes — know your engine's date toolkit." },
        { choice: 2, why: "TEXT minus TEXT coerces to numbers and returns 0 — silently. A latency dashboard built on it reads same-day funding forever." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-19",
      prompt: "Orders (103) join disbursement tranches (order_items, 251). `SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id` returns what, relative to the true book?",
      choices: ["Exactly 34,833.28 — the join is clean", "Inflated — each order's total repeats once per tranche, roughly 2.4x", "Deflated — the join drops multi-tranche orders", "Zero — REAL totals cannot be SUMmed after a join"],
      answer: 1,
      why: "The join fans 103 orders out to 251 rows, and each order's total rides along on every tranche row — SUM(o.total) over the join roughly doubles-and-a-halves the book. Order-grain revenue requires pre-aggregating tranches to order grain first (SUM by order_id in a CTE), then joining.",
      notes: [
        { choice: 0, why: "The join is referentially clean — every tranche matches an order. Clean matches are exactly what makes the inflation silent: no NULLs, no misses, just multiplicity." },
        { choice: 2, why: "Fan-out never drops rows — it multiplies them. The 34,833.28 book is the SUM over orders alone, or over pre-aggregated tranches." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-20",
      prompt: "SUM(CASE WHEN status = 'delivered' THEN 1 END) versus SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — when do they return different numbers?",
      choices: ["Never — the ELSE 0 is cosmetic", "When a group contains ONLY non-delivered rows: the first returns NULL, the second 0", "When the group contains NULL statuses", "Only when COUNT is used instead of SUM"],
      answer: 1,
      why: "CASE without ELSE yields NULL for non-matching rows, and SUM ignores NULLs — so mixed groups aggregate identically. But a group where NOTHING matches sums to NULL on the first form and 0 on the second, and a NULL share column breaks downstream division and formatting. The ELSE 0 is the zero-bucket honesty clause.",
      notes: [
        { choice: 0, why: "On a per-market census it happens to never differ — LATAM's withdrawn count would be 0 either way. But stage tables and filtered grains trip it constantly; the ELSE is the habit, not the fix." },
        { choice: 2, why: "NULL statuses inside a mixed group contribute NULL to both forms equally — SUM skips them either way. The divergence is the all-non-matching group." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-21",
      prompt: "`SELECT * FROM members_ranked WHERE velocity_rank = 1` fails — velocity_rank is computed by RANK() OVER (...) in the same SELECT. Why?",
      choices: ["RANK() must be wrapped in ROUND()", "Window functions evaluate in the SELECT stage — WHERE runs earlier and cannot see their output", "Rank columns need an alias before filtering", "WHERE cannot reference any computed column, ever"],
      answer: 1,
      why: "The logical pipeline runs FROM → WHERE → GROUP BY → SELECT (windows live here) → ORDER BY. WHERE executes before the window exists, so the filter errors or misses. The fix is staging: compute the rank in a CTE, filter rn = 1 in the outer SELECT — exactly the ladder case's two-step shape.",
      notes: [
        { choice: 2, why: "Aliases are a red herring — even the underlying expression COUNT(*) in WHERE errors, because groups don't exist yet. The stage order is the whole answer." },
        { choice: 3, why: "WHERE happily uses computed columns when they are computed EARLIER (in a subquery or CTE). The restriction is stage timing, not computeds." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-22",
      prompt: "`GROUP BY shipped_at` over the 103 originations — how many rows, and what is the biggest bucket?",
      choices: ["82 rows; the biggest is one timestamp", "21 rows; the NULL bucket holds all 21 unstamped rows", "103 rows; every value is distinct", "14 rows; one per month"],
      answer: 1,
      why: "SQL groups NULLs together as one bucket: the 21 rows with no funding stamp (14 pending + 7 withdrawn) collapse into a single NULL row, and the 82 stamped rows split by exact timestamp. A GROUP BY on a sparse column always asks 'where do the NULLs land?' — the answer is one honest mega-bucket.",
      notes: [
        { choice: 0, why: "82 counts the stamped rows, but each distinct timestamp is its own group — and the 21 NULLs don't vanish, they merge. The NULL bucket is the row a stamp-coverage report leads with." },
        { choice: 2, why: "Stamped timestamps DO repeat (same-day fundings), but even if all were distinct, the NULLs would still collapse to one row — never 103." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-23",
      prompt: "NTILE(4) OVER (ORDER BY lifetime_spend DESC) across the 16 members builds the spend quartiles. What lands in tile 1?",
      choices: ["The 4 heaviest members — the 24/17/14/13 ladder", "The 4 lightest members", "All 16 members, split by median", "The members above 3,000 lifetime spend"],
      answer: 0,
      why: "NTILE(4) deals members into four ranked tiles in ORDER BY sequence — descending spend puts the top four (Alice 24, Emma 17, Grace 14, Maya 13 originations) in tile 1. 16 members divide evenly into 4-per-tile; the 3,000-plus line happens to fall between tiles, which is why thresholds and tiles are different tools.",
      notes: [
        { choice: 1, why: "Tiles follow the ORDER BY — descending puts the biggest first. Ascending would label the lightest members 'tile 1' and the readout would invert." },
        { choice: 3, why: "NTILE cuts by ROW COUNT, not by value — tile 1 is the heaviest four members, whatever their dollar line. The 3,000 threshold is a CASE/HAVING decision, not a tile boundary." },
      ],
      difficulty: "medium",
    },
    {
      id: "sofi-mcq-24",
      prompt: "The amortization schedule is built WITH RECURSIVE schedule AS (anchor UNION ALL recursive-step). What does the recursive member reference?",
      choices: ["The loans table, once per month", "The schedule CTE itself — each step reads the prior month's ending balance", "A cursor that walks the months", "The payments table joined to itself"],
      answer: 1,
      why: "A recursive CTE's second SELECT reads the CTE being defined: month 0 comes from the anchor (balance, rate, payment), and each step computes interest = balance × rate / 12, principal = payment − interest, and the new balance — then feeds itself the next month. That self-reference is what 'recursive' means, and it is how servicing builds schedules without cursors.",
      notes: [
        { choice: 0, why: "The loans table seeds the anchor only. Re-referencing it per month would restart the balance every step — the schedule would never amortize." },
        { choice: 3, why: "Payments are inputs to the step's arithmetic, not the recursion's spine. The spine is the CTE's own prior output." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-25",
      prompt: "One row per market with each market's share of the 34,833.28 book: `SELECT c.region, ROUND(100.0 * SUM(o.total) / {X}, 1)` — what is {X}?",
      choices: ["COUNT(*)", "SUM(SUM(o.total)) OVER ()", "MAX(o.total)", "103"],
      answer: 1,
      why: "SUM(o.total) is already a per-market aggregate, so the denominator needs the grand total OVER all rows of the folded result: SUM(SUM(o.total)) OVER () — a window over an aggregate, evaluated after GROUP BY. COUNT(*) counts rows (markets), MAX is one market's biggest order, and the literal 103 is a row count wearing a dollar denominator's name.",
      notes: [
        { choice: 0, why: "COUNT(*) is 4 here — dividing dollars by market count is the category error. The denominator must be dollars." },
        { choice: 3, why: "103 originations is a count, not a value — and hardcoding it breaks the moment the db changes. Windows compute the grand total from the data." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-26",
      prompt: "Return the ids of statements that have NO payment legs, as a set difference: `SELECT id FROM invoices {X} SELECT invoice_id FROM payments` — which keyword is {X}?",
      choices: ["EXCEPT", "INTERSECT", "UNION", "UNION ALL"],
      answer: 0,
      why: "EXCEPT keeps rows in the left set that never appear in the right — the 6 never-funded statement ids, #28's paid-status lie included. INTERSECT returns the funded set (22), UNION concatenates both populations (28 ids), and UNION ALL does the same without dedupe. The anti-join's twin in set-operator clothing.",
      notes: [
        { choice: 1, why: "INTERSECT answers 'which statements HAVE legs' — the mirror image. Direction of the diff is the entire question." },
        { choice: 2, why: "UNION answers 'who is in either population' — all 28. Useful for a coverage census, useless for a dunning list." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-27",
      prompt: "Two predicates return the same March rows: SUBSTR(created_at, 1, 7) = '2024-03' versus created_at >= '2024-03-01' AND created_at < '2024-04-01'. Why does the second win in production?",
      choices: ["It is shorter", "It is sargable — the bare column compares to a constant, so an index on created_at can be used; SUBSTR wraps the column and forces a full scan", "SQLite cannot run SUBSTR on timestamps", "The range form rounds timestamps to midnight"],
      answer: 1,
      why: "Sargable means the predicate compares the bare column to a value, leaving the index usable. Wrapping the column in SUBSTR hides it from the index — every row gets the function applied. Same rows, different cost profile: on warehouse-sized tables that is the difference between a dashboard that renders and one that times out.",
      notes: [
        { choice: 2, why: "SQLite runs SUBSTR on text timestamps all day — correctness is not the issue. Cost is." },
        { choice: 3, why: "No rounding happens — the range is exact on timestamps. The win is index usage, not precision." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-28",
      prompt: "The trial balance folds ledger_entries to debits 181,080 and credits 181,080 cents. Why does finance compare IN CENTS instead of a rounded dollar figure?",
      choices: ["Cents avoid REAL arithmetic drift — 181080/100.0 computed per row can accumulate rounding differences that break an equality check", "Cents sort faster than dollars", "Dollars cannot be SUMmed in SQLite", "The ledger stores both formats and cents is the backup"],
      answer: 0,
      why: "The delta-zero gate is an equality test, and equality dies under accumulated rounding: divide each row by 100.0, round for display, then compare — two 'equal' sides can differ by a cent that no viewer can see. Aggregate in INTEGER cents, compare, and convert to dollars once at the presentation edge.",
      notes: [
        { choice: 1, why: "Sort cost is nanoseconds-scale noise. The gate is about arithmetic exactness, not speed." },
        { choice: 2, why: "SQLite sums REALs happily — the problem is that REAL equality after rounding is a coin flip. The format is the policy, not a capability." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-29",
      prompt: "Walk collected dollars WITHIN each statement: `SELECT statement_id, paid_on, SUM(amount_cents) OVER ({X}) AS running_paid FROM payments ORDER BY statement_id, paid_on`. What is {X} for the five split-payment statements to walk independently?",
      choices: ["ORDER BY paid_on", "PARTITION BY statement_id ORDER BY paid_on", "PARTITION BY paid_on", "GROUP BY statement_id"],
      answer: 1,
      why: "PARTITION BY statement_id restarts the running sum per statement — each of the five two-leg statements (#1, #5, #12, #19, #22) walks its own 0 → leg 1 → leg 2 progression — and ORDER BY paid_on sequences the legs. Without the partition, the sum runs across ALL 27 legs and smears one statement's collection into the next statement's balance.",
      notes: [
        { choice: 0, why: "ORDER BY alone is a global window: leg 3 of statement #1 inherits statement #2's first leg. The running total must reset where the business unit resets." },
        { choice: 3, why: "GROUP BY collapses rows — a running total that loses its legs is not a walk. Windows keep every row; that is the point." },
      ],
      difficulty: "hard",
    },
    {
      id: "sofi-mcq-30",
      prompt: "A staging-table withdrawal share divides withdrawn by originations, and one filtered market has ZERO originations. Which denominator guard keeps the query alive?",
      choices: ["ROUND(denominator, 0)", "NULLIF(originations, 0) — division by NULL yields NULL instead of an error", "COALESCE(originations, 1)", "CAST(originations AS REAL)"],
      answer: 1,
      why: "Integer division by zero crashes the read; NULLIF(x, 0) turns the zero into NULL, and any share divided by NULL is NULL — an honest 'no base' rather than a crash or an invented percentage. The NULL-propagating behavior that plagues NOT IN is exactly what makes this guard work.",
      notes: [
        { choice: 0, why: "ROUND changes display precision, not zero-ness. Zero remains zero and the division still fails." },
        { choice: 2, why: "COALESCE fires on NULL, not on zero — and substituting 1 fabricates a denominator, printing a share for a market with no originations. A lie with better manners than a crash." },
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
    {
      id: "cs-sofi-3",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The two-grain market census",
      brief:
        "SoFi-flavored brief on the storefront db: the membership-funnel pod wants the market census that opens every growth read — originations AND members per market, with booked dollars beside them so intensity is computable on sight. Probed facts: 103 originations across 16 members worth 34,833.28; by market EU runs 45 originations from 8 members (15,089.23), APAC 37 from 5 (11,605.45), US 19 from 2 (7,286.16), LATAM 2 from 1 (852.44). The intensity read is the punchline: EU carries 5.6 products per member while the US carries 9.5 — load and installed base are different columns, and the pod reads biggest book first.",
      ask: "Return each market with its origination count, distinct member count and booked dollars to 2 decimals — the full census, biggest book first.",
      template:
        "SELECT c.region AS market,\n       {1} AS originations,\n       COUNT(DISTINCT o.customer_id) AS members,\n       ROUND(SUM(o.total), {2}) AS booked\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY originations {3}\nLIMIT {4};",
      slots: [
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the origination counter",
          why: "COUNT(*) counts product rows after the join — 45, 37, 19 per market. SUM would add order totals into a column named originations, and the load read becomes dollars wearing a count's name.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the dollar precision",
          why: "Booked dollars report to 2 decimals — 15,089.23, 11,605.45, 7,286.16, exactly the probed figures. Precision 1 rounds the cents off the facts file and the census stops reconciling with the published book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The pod reads EU 45 on top and walks down to US 19. ASC would open the read on LATAM's 2-originations-from-1-member row — a correct query aimed at the quietest end of the book.",
        },
        {
          answer: "4",
          kind: "number",
          noVerify: true,
          label: "the census cut",
          why: "Four markets exist, so LIMIT 4 is the full census — the cut the pod re-widens to 3 when the deck needs a shortlist. The honest version of the figure: the LIMIT is presentation, not population.",
        },
      ],
      distractors: ["SUM", "1", "ASC", "0", "MAX"],
      walkthrough:
        "One join, two grains, three columns. The join attaches every origination to its member's market — all 103 survive — and GROUP BY region folds them into four rows. COUNT(*) counts the product grain (45, 37, 19, 2) while COUNT(DISTINCT customer_id) folds repeats back to people (8, 5, 2, 1) — the gap between the columns is intensity, 5.6 products per member in EU against 9.5 in the US, the difference between a broadening market and a concentrated one. ROUND(SUM(o.total), 2) books the dollars: 15,089.23 + 11,605.45 + 7,286.16 + 852.44 = 34,833.28, the full book. ORDER BY originations DESC reads biggest book first; LIMIT 4 is the whole census (drop to 3 and LATAM vanishes — fine for a shortlist, a lie for a census). The distractors fail honestly: SUM in the count slot makes dollars answer a count question; precision 1 rounds cents off the probed figures; ASC inverts the read; MAX in the count slot errors outright and MAX in the precision slot is a misuse-of-aggregate rejection. The panel's follow-up is the intensity line: say 5.6 versus 9.5 out loud, and name which column is load and which is coverage.",
    },
    {
      id: "cs-sofi-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The member velocity ladder",
      brief:
        "SoFi-flavored brief on the storefront db: member success builds the funded-product ladder every quarter — who carries the deepest relationships, with ties shown as ties, because four members sitting at 4 products each are four equally-sticky relationships. Probed facts: the ladder runs Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5 — then the four-way tie at 4 (Pedro Alvarez, Keiko Sato, Isabella Rossi, Noah Meyer), then two members at 3. RANK semantics are the published policy: ties share a rung and the next rung skips — the two 3-product members land on rank 10, not 7.",
      ask: "Return each member with at least 3 funded products, their count, and a shared-rung velocity rank that keeps gaps honest — heaviest first.",
      template:
        "SELECT c.name AS member,\n       COUNT(*) AS funded,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS velocity_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.name\nHAVING COUNT(*) >= {3}\nORDER BY velocity_rank, member;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung ranker",
          why: "RANK gives the four-way tie at 4 the same rank (6, 6, 6, 6) and hands the next distinct count rank 10 — the skip IS the tie's footprint. ROW_NUMBER would split the four members arbitrarily, inventing a pecking order the business never decided.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The ladder ranks deepest relationship first, so the window's ORDER BY runs descending. ASC would crown the 3-product members rank 1 and make the 24-product anchor look like the tail of the book.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 members — the 24/17/14/13/5 head, the four-way tie at 4, AND the two 3s that make the skip-to-10 visible. A floor of 4 amputates the two 3-product members and the rank arithmetic loses its proof.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4", "SUM"],
      walkthrough:
        "A fold, a floor, and a window. GROUP BY member folds 103 originations into 16 relationship rows; HAVING COUNT(*) >= 3 keeps the 11 that clear the floor — the probed ladder verbatim: 24, 17, 14, 13, 5, then the four-way tie at 4, then the two 3s. RANK() OVER (ORDER BY COUNT(*) DESC) numbers them 1 through 5, shares rank 6 across the tie, and stamps the two 3-product members rank 10 — ranks 7, 8, 9 consumed by the tie and visibly skipped, which is exactly the gap-honest behavior the published policy asks for. The floor is the quiet star: without the two 3s, RANK and DENSE_RANK print identical output (6, 6, 6, 6 and nothing after), and the case loses its lesson. The distractors fail honestly: DENSE_RANK compacts the tie block (the 3s land on 7, no gap — a different rank policy wearing the same query); ROW_NUMBER deals the four tied members ranks 6 through 9 arbitrarily; ASC inverts the ladder; 4 in the floor drops the proof rows; SUM as the ranker or in the window's ORDER BY errors outright. Say the rank sequence out loud — 1, 2, 3, 4, 5, 6, 6, 6, 6, 10, 10 — and the tie policy explains itself.",
    },
    {
      id: "cs-sofi-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass stage census",
      brief:
        "SoFi-flavored brief on the storefront db: the ops board prints the whole origination funnel in ONE row — booked, performing, disbursing, approved-not-yet-funded, withdrawn — and the identity 52 + 30 + 14 + 7 = 103 must hold by construction, because four sequential queries are four ways to drift apart mid-morning. Probed facts: 103 originations split delivered 52 (50.5%), shipped 30 (29.1%), pending 14 (13.6%), cancelled 7 (6.8%). FILTER (WHERE …) branches per aggregate in a single scan; SUM(CASE …) is the portable twin. The board reads the arms left to right, funnel order.",
      ask: "Return one row: total booked plus the four stage counts — performing, disbursing, approved-not-yet-funded, withdrawn — reconciling to 103 by construction.",
      template:
        "SELECT COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE status = {1}) AS performing,\n       COUNT(*) FILTER (WHERE status = {2}) AS disbursing,\n       COUNT(*) FILTER (WHERE status = {3}) AS approved_not_funded,\n       COUNT(*) {4} (WHERE status = {5}) AS withdrawn\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the performing-arm literal",
          why: "Performing is status 'delivered' — 52 loans amortizing on schedule. 'shipped' would print the 30 disbursing rows under a performing header and the board would read 29.1% as the performing share.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the disbursing-arm literal",
          why: "Disbursing carries status 'shipped' — 30 rows with shipped_at as the funding stamp. 'pending' here moves the 14 approved-not-yet-funded rows into the disbursing column and the funding-exposure read doubles its queue.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the approved-arm literal",
          why: "Approved-not-yet-funded is status 'pending' — 14 rows with no stamp yet, the population that can still fund or withdraw. 'cancelled' would print the 7 withdrawn rows in this column and the funnel's middle stage would vanish.",
        },
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the per-branch clause",
          why: "FILTER (WHERE …) is the one-pass branch syntax: one scan, four conditional counts, one shared denominator story. COUNT(*) without it counts every row into every arm — the census would read 103 in all five columns and reconcile to nothing.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the withdrawn-arm literal",
          why: "Withdrawn pre-funding is status 'cancelled' — 7 rows, 6.8% of the book. 'delivered' would print the 52 performing loans as withdrawals and the funnel would end with its largest stage.",
        },
      ],
      distractors: ["'pending'", "'delivered'", "'shipped'", "COUNT", "SUM"],
      walkthrough:
        "One scan, five arms, one identity. COUNT(*) books the denominator — 103 — and each FILTER (WHERE status = …) branch counts its stage in the same pass: delivered 52 performing, shipped 30 disbursing, pending 14 approved-not-yet-funded, cancelled 7 withdrawn. The columns reconcile by construction — 52 + 30 + 14 + 7 = 103 — which is the whole point of the one-pass shape: four sequential queries can drift apart mid-morning while this row cannot, and the remainder (approved-not-yet-funded) is named as a population, not inferred. The board reads it left to right: half the book performing, three-tenths disbursing, a sixth queued for a funding decision, seven loans withdrawn. The distractors fail honestly: any swapped stage literal moves its neighbor's count and the identity breaks visibly (52 + 30 + 14 + 52 = 148); COUNT as the branch clause errors outright; SUM without an argument errors too. Say the reconciliation out loud — that sentence is what the interviewer is listening for.",
    },
    {
      id: "cs-sofi-6",
      tier: "hard",
      topic: "t7",
      universe: "month-close",
      title: "The vintage month walk",
      brief:
        "Month-close brief, in-world: the credit committee's trend page walks the origination book month by month — each vintage's booked dollars beside the prior month's, with the step delta printed so the story writes itself off the table. Probed on the storefront db: a 14-month spine from 2024-01 to 2025-02 totalling 34,833.28; the book opens at 3,731.97, slides to the 1,193.86 July trough, jumps +1,158.21 into August, and takes its steepest drop, -1,326.87, into November. The first row's delta is honestly NULL — no prior month exists, and inventing a zero is a misstatement, not a convenience.",
      ask: "Return month, origination count, booked dollars, the prior month's booked dollars, and the step delta to 2 decimals — chronological, first seven months.",
      template:
        "WITH monthly AS (\n  SELECT {1}(created_at, 1, 7) AS month,\n         COUNT(*) AS originations,\n         ROUND(SUM(total), 2) AS booked\n  FROM orders\n  GROUP BY month\n),\nlagged AS (\n  SELECT month, originations, booked,\n         {2}(booked) OVER (ORDER BY month) AS prev_booked\n  FROM monthly\n)\nSELECT month, originations, booked, prev_booked,\n       ROUND(booked - prev_booked, 2) AS delta\nFROM lagged\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "SUBSTR",
          kind: "keyword",
          label: "the month-bucket key",
          why: "SUBSTR(created_at, 1, 7) keeps year plus month — 14 distinct vintage buckets from 2024-01 to 2025-02. Dropping the year merges January 2024 with January 2025 and the vintage table becomes fiction.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(booked) walks the window backwards one row — February's prev_booked is January's 3,731.97, and the first month's prev is NULL: the honest baseline, never a zero. LEAD would read forward and label March's book as February's history.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A vintage walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC presents the newest month first with its baseline below — the numbers survive, the story doesn't.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 7 returns the first seven months — through the July trough (1,193.86), the run the deck opens with. The figure 7 is also April's origination count sitting in the output, and the trough is the row the committee quotes.",
        },
      ],
      distractors: ["LEAD", "STRFTIME", "DESC", "14", "MAX"],
      walkthrough:
        "Staged windows over a money grain. The monthly CTE folds 103 originations into 14 vintages via the year-month key, carrying COUNT and ROUND(SUM(total), 2) side by side — volume AND dollars, because a trough in dollars with a bump in volume is a mix story, not a demand story. The lagged CTE layers LAG(booked) OVER (ORDER BY month), and the outer SELECT does the only arithmetic left: delta = booked − prev_booked, rounded once. The walk reads exactly like the probed spine: 3,731.97 opens, -122.33 into February, -992.56 into March, then the slide to the July trough at 1,193.86, and the +1,158.21 August jump that ends the page. January's delta is NULL by design — no baseline, no invented zero — and any share built on it must inherit that NULL, not divide by nothing. The distractors fail honestly: LEAD reads the future (February's prev becomes March's 2,617.08); STRFTIME with SUBSTR's arguments errors on wrong arity; DESC tells the story backwards; LIMIT 14 returns the whole spine instead of the opener the deck quotes; MAX in the reader slot prints a running maximum wearing prev_booked's name. The committee quote is the trough row: month, count, dollars, delta — four columns, one argument.",
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
    { slug: "ar-aging-schedule", why: "Aged receivables by days-past-due is the collections calendar SoFi servicing prints at every close — the 21-exact / 1-partial / 6-none census, aged." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing balance — the servicing proof that a member's balance only moves through booked events. Roll-forward arithmetic is the close's backbone." },
    { slug: "capital-gain-loss", why: "SoFi Invest reads realized gain or loss per lot. Buy-cost matching with signed arithmetic is the exact fold the invest dashboards run on member positions." },
    { slug: "basket-depth-aov", why: "Multi-product membership is the strategy; basket depth and AOV over member orders measure it. The two-grain ratio — value over originations — drilled." },
    { slug: "budget-pacing", why: "Growth pod reads spend pacing month-to-date against plan — cumulative windows over a monthly spine, the same shape as the vintage walk." },
    { slug: "ads-funnel", why: "Member acquisition spend to funded product is SoFi's costliest funnel. Stage-by-stage conversion with stated denominators is the drill." },
    { slug: "analyze-subscription-conversion", why: "Direct deposit is the membership glue — conversion into it is the engagement read. First-event conversion logic, one conditional join deep." },
    { slug: "account-balance", why: "Current balance per member account is the servicing home screen. It is the last-event-wins fold — order by date, keep the latest row." },
    { slug: "bank-account-summary", why: "Monthly in-and-out per account is the member-level cash view servicing and invest both read. Conditional sums by direction, one row per month." },
    { slug: "calculate-orders-within-each-interval", why: "Funding latency buckets — how many originations funded in 2, 3, 4 days — are the ops SLA read. Interval counting over julianday diffs is the drill." },
    { slug: "calculate-compressed-mean", why: "Blended averages under weight constraints — the pricing pod's weighted-coupon math. Mean arithmetic that respects denominators, exactly." },
    { slug: "calculate-salaries", why: "Band medians and deltas over compensation rows drill the percentile and diff windows the pricing team reuses for APR bands." },
    { slug: "analyze-organization-hierarchy", why: "Walking a hierarchy level by level is the self-join discipline — for account structures, joint-member chains and servicing pod trees alike." },
    { slug: "second-highest-salary", why: "The tie-aware second value — second-highest APR in a tier — is the DENSE_RANK or MAX-below-MAX drill, and the classic LIMIT-OFFSET trap in lending clothes." },
    { slug: "game-play-analysis-v", why: "Did a newly funded member take a second product on day one? First-event-then-return logic is the early-engagement read membership growth lives by." },
    { slug: "customers-who-never-order", why: "The dormant-member anti-join — on this db it returns a confident zero, all 16 members holding products. Proving a zero is the exercise." },
  ],
};
