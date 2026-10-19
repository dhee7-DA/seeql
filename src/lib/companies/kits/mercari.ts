// Mercari — Wave-10 (Task 100-mercari), ecom domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Japan-origin C2C marketplace: seller liquidity, listing-to-sale conversion,
// trust scoring, and flat-fee take-rate economics. The storefront db reads as a
// C2C trading sandbox — customers are app accounts (buyers on the demand side;
// region = market buckets EU/APAC/US/LATAM; in C2C the same accounts sell, but
// the supply side this db can fold lives in suppliers = the 6 seller accounts),
// orders are completed purchases (delivered = delivered-and-kept 52, shipped =
// in-transit with shipped_at as the ship stamp 30, pending = paid-awaiting-ship
// 14, cancelled = cancelled 7), order_items are purchase line records (quantity
// = units, unit_price = the agreed line price), products are listings (catalog
// SKUs; price = the ask), invoices are seller fee/settlement statements,
// payments are the payment rails (card vs wire), expenses are platform opex,
// and ledger_entries are the GL. Finance tables store INTEGER cents — the
// dollar read is amount_cents / 100.0; orders.total and order_items.unit_price
// are REAL dollars.
// Angle kept DISTINCT from ebay (auctions, two-sided trust anti-joins) and
// etsy (shops, GMS, listing freshness): the flat 10% take rate — every sale
// pays the same fee, so the fee book is a straight multiplication of GMV —
// plus trust-score economics on the seller bench.
// Pool provenance: company-pools.md carries NO Mercari section (0 tagged rows),
// so all 10 topic slug sets and all 16 problems are theme-curated from the
// pools file's theme menu (sql rows only, no w*/d*/f* rows) and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12,
// wave-8+9 canonical dumps 2026-10-16) plus this kit's own probe (Task 100):
// fee book 3,483.33 (1,508.92 / 1,160.55 / 728.62 / 85.24 per market), seller
// mean 5,805.55 with exactly 2 above, trust mean 4.3, stock 2,845 vs 498 sold
// (17.5%), seller units 109/99/82/80/77/51, market-internal supply shares
// 70/30/100/50.6/49.4. Every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts. Accent text-rose-300 is unused by all
// 20 ecom sibling kits (amazon..asos) and all 8 wave-10 kits already landed.

import type { CompanyKit } from "../types";

export const mercariKit: CompanyKit = {
  id: "mercari",
  domainId: "ecom",
  name: "Mercari",
  tagline: "Japan's C2C app marketplace: seller liquidity, trust scores, the flat take rate",
  accent: "text-rose-300",

  brief: [
    "**Mercari** is the Japan-origin C2C marketplace where individuals sell to individuals from a phone — list it, ship it, get paid, and the platform takes a **flat 10% sales fee** on every completed purchase. No auctions, no storefronts to decorate: supply is a stream of fresh listings from ordinary accounts, and demand health is read as listing-to-sale conversion. This kit maps the storefront db onto that world: 16 app accounts (the buyer side; region = market buckets), **6 seller accounts** as the foldable supply side, 16 listings, and 103 completed purchases worth **34,833.28** fanning into 251 line records and 498 units. The status map is fixed: delivered = {emerald:delivered-and-kept} (52, 50.5%), shipped = {sky:in-transit} with `shipped_at` as the ship stamp (30, 29.1%), pending = paid-awaiting-ship (14), cancelled = {rose:cancelled} (7, 6.8%).",
    "The data org splits into marketplace health (seller liquidity and sell-through), trust & safety (ratings, returns, dispute hygiene) and a fee-settlement pod that bills sellers. One house fact shapes every money read: the take rate is **flat — 10% of every sale** — so the fee book is a straight multiplication of GMV, not a rate table: **3,483.33 in platform fees** on the 34,833.28 book (EU 1,508.92, APAC 1,160.55, US 728.62, LATAM 85.24). Seller money sits one layer down in fee/settlement statements stored as **INTEGER cents**, so the dollar read is `amount_cents / 100.0` — and the paid book (**21 statements, 66,443.00**) still carries a void-but-debited statement (#11, 925.00) and a paid-status statement with no legs (#28, 1,756.00) that every close must catch.",
    "Interview screens are census-then-denominator, two-sided. A loop opens with a **two-grain market census** — EU runs 45 purchases from 8 accounts while the US runs 19 from 2 — then escalates into the **seller trust ladder** (6 accounts, ratings 4.8 down to 3.9, only 2 clearing the 4.5 trust floor, the top account booking **32%** of the platform's sell-through), then into a rate where the interviewer asks the denominator out loud (*'does a cancelled purchase sit in your base?'*), then a window walk over the {sky:14-month spine} (2024-01 to 2025-02) where the first LAG row is NULL by design. Candidates who state the grain, the fee basis and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Mercari section — fewer than 2 tagged rows, none SQL-graded — so all **thirty-two problems** and every topic slug here are **theme-curated** to this kit's known screen shapes: listing-to-sale folds, two-grain market censuses, trust ladders with tie policy, flat-fee arithmetic, CASE banding, and cents-safe settlement reads. Do the topics in order, then run **all six case studies** on the live storefront db — built for spaced practice rather than one sitting: the {emerald:flat take-rate census} the growth board opens with, the {sky:market supply ladder} the seller-ops review quotes, the re-buy ladder with its tie policy, the market cancel map, the one-pass close census, and the above-the-mean supply bench. The bar to clear: *state the grain, the fee basis and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the marketplace pulse. An analyst on the seller-liquidity desk opens the conversion dashboard before standup: did overnight purchases land, how many listings moved units, does the one-pass status census reconcile — 52 delivered + 30 in-transit + 14 paid-awaiting-ship + 7 cancelled = **103 by construction**? Then the demand clock: 82 stamped purchases averaging **2.98 days** to ship, and the sell-through read — every one of the 16 listings sold at least once, 498 units against a 2,845-unit shelf. A branch that breaks the 103 identity is *the day's first incident*, not a rounding note — and if the ship clock drifts off the 2-4 day band, the shipping-label queue gets pulled before trust & safety's weekly read ships.",
    "**11:30 —** Midday is the seller read. Seller ops wants the **trust ladder** re-cut — 6 accounts, 4.8 down to 3.9, and the honest note that only 2 clear the 4.5 floor (*the bench is thin, and the deck says so*); growth wants the market census beside it — EU 45 purchases from 8 accounts against US 19 from 2 — and the concentration cell: the top seller books **32%** of platform revenue, the top two 26.7 more. The fee pod wants the flat-fee book by market — 1,508.92 / 1,160.55 / 728.62 / 85.24 — which is one multiplication per market *as long as everyone agrees the 10% applies to GMV, not to fees-net-of-refunds*. Each ask is a join, a conditional aggregate and one judgment call about which base the number sits on.",
    "**15:30 —** The afternoon tilts toward settlement. The AR anti-join refreshes first — **6 never-settled statements worth 15,217** — before any seller gets a dunning email; the coverage census reads **21 exact, 1 partial** (4,000.00 of 6,148.00) and feeds the payout queue; and the anomaly list gets walked line by line: statement #11 is void at 925.00 yet carries a settlement leg, and #28 is paid-status at 1,756.00 with zero legs — *a status that lies*. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "GMV & the flat fee book", what: "Completed-purchase value 34,833.28 across 103 purchases; the flat 10% take rate books 3,483.33 in platform fees (EU 1,508.92, APAC 1,160.55, US 728.62, LATAM 85.24). Because the rate is flat, fee reads are GMV multiplications — which makes the fee basis (gross vs net-of-refunds) the whole argument." },
    { name: "Sell-through at the listing grain", what: "Listings that sold at least once ÷ listings carried: 16 of 16 on this book (the dead-listing anti-join returns a confident zero), 498 units moved against a 2,845-unit shelf — 17.5% unit sell-through. The C2C health metric: conversion is measured at the listing grain, never the line grain." },
    { name: "Trust floor bench", what: "Seller accounts at 4.5-plus rating ÷ all sellers: 2 of 6 (4.6 and 4.8) against a 4.3 platform mean. Trust scoring gates promotion and payout priority here — and a thin bench is a supply-risk number, not a vanity one." },
    { name: "Seller concentration", what: "Revenue share by seller account: the top account books 32% of the platform, the second 26.7%. One seller leaving dents a quarter — the liquidity read that staffs seller-success and sizes the supply pipeline." },
    { name: "Repeat-buyer rate", what: "Share of accounts with 2+ purchases: 14 of 16 (2 one-time). C2C retention is the re-buy loop; the denominator (all accounts, including the one-timers) is the follow-up the interviewer is fishing for." },
    { name: "Cancel share", what: "Cancelled ÷ placed, sliced by market: 7 of 103 (6.8%) overall — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 on a two-purchase base. The refusal map that decides where listing quality and shipping promises get fixed." },
    { name: "Ship latency", what: "Purchase to ship stamp (created_at → shipped_at) over the 82 stamped purchases only: 2.98-day average, 2-4 day spread. The population definition ships with the number — 14 paid-awaiting-ship purchases have no cycle yet and must not dilute it." },
    { name: "Basket depth & AOV", what: "Line records ÷ purchases: 251 over 103 = 2.44 lines per basket (max 3 units per line), average purchase 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 basket outweighs the smallest 42 combined." },
  ],

  topics: [
    {
      name: "Listing-to-sale folds",
      why: "Every Mercari screen opens by folding 251 purchase lines into per-listing or per-family reads — units, revenue, distinct baskets touched. The trap is grain drift: 103 purchases fan into 251 lines and 498 units, and COUNT(*) stops counting purchases the moment the join lands. Saying 'one row per what?' is the habit being graded.",
      slugs: ["product-sales-analysis-ii", "top-earners", "group-sold-products-by-the-date", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets report at two grains simultaneously: EU runs 45 purchases from 8 accounts, the US 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is demand and which is coverage — is the reflex. The intensity ratio (9.5 versus 5.6) is the market-maturity signal hiding between the columns.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "students-and-examinations", "cohort-repeat-revenue", "user-purchase-platform", "game-play-analysis-v", "customer-order-frequency", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Joining buyers to the seller bench",
      why: "Purchase lines carry no seller, no trust score, no market — everything joins through listings and the seller table, and the join type decides who survives. A line with no listing is corruption; a listing with no sale is dead supply — though on this db the anti-join returns a confident zero (all 16 listings sold), and proving that zero is part of the job.",
      slugs: ["sales-analysis-i", "combine-two-tables", "top-travellers", "find-the-team-size", "product-sales-analysis-iii"],
    },
    {
      name: "Trust ladders & tie policy",
      why: "Seller reviews rank accounts by rating and by revenue, and buyer ladders tie — 24, 17, 14, 13, 5 purchases with a four-way tie at 4 below. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which on a trust ladder is a policy about peer sellers, not syntax.",
      slugs: ["rank-scores", "ratings-histogram", "department-top-three-salaries", "chargeback-rate-ranking", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Flat take-rate arithmetic",
      why: "The fee book is a flat 10% of GMV, so every fee read is a multiplication with a rounding rule — and every ratio read (cancel share, repeat rate, promoted-listing lift) punishes integer division. The house habit: 100.0 (or the rate) before the division, population fixed before the ratio, ROUND last.",
      slugs: ["queries-quality-and-percentage", "percentage-of-users-attended-a-contest", "ads-performance", "average-selling-price", "confirmation-rate", "basket-depth-aov", "repeat-purchase-rate", "returns-rate-by-category"],
    },
    {
      name: "CASE banding & the ask ladder",
      why: "Listing asks band into budget (8 SKUs averaging 32.06) and mid (8 at 111.5), with the premium ladder honestly empty — the catalog tops out at 199.99. CASE arms must be exhaustive and ordered; a hole in the CASE is a hole in the folio, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle", "find-churn-risk-customers", "rfm-segmentation"],
    },
    {
      name: "Liquidity subquery gates",
      why: "Screens escalate into staging: which sellers beat the 5,805.55 platform mean (exactly 2 do), which listings out-sell the family average, which markets clear a purchase floor. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted — the above-average filter is where silent zeros ship.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Cadence & month buckets",
      why: "The 14-month purchase spine (2024-01 to 2025-02, every month 6-9 purchases) is the C2C cadence read: STRFTIME or SUBSTR month keys, half-open windows that never drop the last night of a month, and '%m' traps that merge January 2024 into January 2025. Cadence analytics is date discipline.",
      slugs: ["list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "find-golden-hour-customers", "rolling-7d-actives", "dau-wau-stickiness", "find-bursty-behavior", "calculate-orders-within-each-interval", "most-frequently-ordered-product-per-customer", "monthly-transactions-ii", "sales-by-day-of-the-week"],
    },
    {
      name: "Anti-joins & the never-remitted",
      why: "Marketplace hygiene runs on anti-joins: accounts that never bought, listings that never sold, statements no rail ever touched. On this db the account and listing anti-joins return a confident zero, while the settlement anti-join returns 6 statements worth 15,217 — proving which zero you have IS the deliverable.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "wash-trade-detection", "top-percentile-fraud", "suspicious-bank-account-transactions", "winback-recovery", "ar-aging-schedule", "fix-product-name-format"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets delivered, in-transit, paid-awaiting-ship and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. Query budget is a real constraint on marketplace-review nights.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "bank-account-summary-ii"],
    },
  ],

  theory: [
    {
      id: "mercari-t1",
      q: "Your seller report joins purchase lines to listings to seller accounts. When do you INNER and when do you LEFT — and what silently breaks if you filter a listing column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins lines to listings to sellers: a line with no listing row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A supply-health report must be LEFT from sellers (or listings): the listings with no sales ARE the answer, arriving with NULL line columns. The classic break: filtering category = 'Audio' in WHERE after the LEFT JOIN kills every NULL-payload listing row — the LEFT quietly became an INNER and the dead supply vanished. The fix is moving the predicate into ON or an outer query. On this db the listing anti-join returns a confident zero — all 16 listings sold at least once — and proving that zero is itself the analyst's job, because the same shape against the settlement tables returns 6 never-settled statements, not zero. The join type is a business claim; make it deliberately.",
      tag: "joins",
    },
    {
      id: "mercari-t2",
      q: "The buyer ladder runs 24, 17, 14, 13, 5 purchases — then a four-way tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — the ladder reads 1 through 5, then the four-way tie consumes ranks 6 through 9, and the next distinct count lands on 10, implying three phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next account is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which account gets the re-buy nudge first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a C2C trust ladder the same question bites twice: rank sellers by rating and you will tie the moment two accounts share a score, so the tie-breaker policy is a trust-and-safety decision, not a SQL footnote.",
      tag: "windows",
    },
    {
      id: "mercari-t3",
      q: "The census shows 103 purchases and 16 accounts; EU shows 45 purchases and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts purchase rows after the join — one row per purchase, so an account with 24 purchases contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 purchases collapse to 8. Neither is wrong: purchases measure demand, accounts measure installed base. The ratio — 9.5 purchases per account in the US versus 5.6 in EU on this db — is the intensity signal that decides whether a market is deepening or broadening. The trap that catches candidates is a third grain: join order_items for basket reads and COUNT(*) silently counts line records — 251 of them — or SUM(quantity) counts units, 498 of them; three grains, three different business claims, one query. On a C2C marketplace the line-to-purchase gap is also the attach story (2.44 lines per basket), so a census that cannot name its grain cannot be defended in the review. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "mercari-t4",
      q: "shipped_at is NULL until a purchase ships. What is your policy for the ship-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only shipped purchases have a latency, so the report measures purchase-to-ship for the 82 of 103 purchases that carry the stamp — averaging 2.98 days with a 2-4 day spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL purchases returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name, and the 14 paid-awaiting-ship purchases never had a cycle to measure. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly those 21 rows (14 pending plus 7 cancelled), which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day shipping for purchases still sitting in the paid-awaiting-ship queue, and on a C2C marketplace where sellers print labels themselves, a fake zero-day ship is a lie the trust team would have to unpick. A report whose WHERE clause is doing definitional work without saying so is exactly what a Mercari reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "mercari-t5",
      q: "The fee pod wants per-market platform fees for markets carrying at least ten purchases. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The fee basis is a row-level fact — the flat 10% multiplies each purchase's total before any fold, in WHERE (or as the SELECT expression itself); putting it in HAVING is impossible because purchase totals no longer exist once rows are grouped. The ten-purchase floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a fee line and an error, and between a threshold applied to purchases versus to fee dollars. On this db the floor matters: EU (45), APAC (37) and US (19) clear ten purchases while LATAM's 2 do not — a fee folio built with the filter in the wrong clause either fails to parse or quietly keeps the two-purchase market it was told to exclude. And because the take rate is flat, the honest fee fold is ROUND(0.10 * SUM(total), 2) per market — 1,508.92 / 1,160.55 / 728.62 / 85.24 — not a lookup against a rate table that does not exist.",
      tag: "pipeline",
    },
    {
      id: "mercari-t6",
      q: "Which sellers beat the platform-average seller revenue — and what is that scalar subquery allowed to return when the inner fold comes back empty?",
      a: "The staging shape: fold revenue per seller account in a derived table or CTE, then filter against the mean — on this db the mean is 5,805.55 and exactly 2 of 6 sellers clear it (the 11,130.25 and 9,294.93 accounts). A scalar subquery is contractually 0-or-1 rows, 1 column: one row drives the comparison; zero rows return NULL — not an error — and revenue > NULL is UNKNOWN, so the above-average list silently returns nothing while looking valid. On the full seller table that is theoretical: 6 accounts always produce a mean. On filtered staging tables — one market, one rating tier, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each seller to ITS market's average) re-runs per outer row and answers a different question at a different cost — and on a 6-row bench the cost is trivial while the semantics are everything. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "mercari-t7",
      q: "The marketplace trend buckets purchases by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the cadence trend becomes fiction. The window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's purchases, and month-end is exactly when C2C relists and payday buys land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell the marketplace story: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, and drops -1,326.87 into November — and every one of those claims depends on the spine key being right before any window runs.",
      tag: "dates",
    },
    {
      id: "mercari-t8",
      q: "A seller's fee statement says 'paid' but the payment rails have no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep the NULL side — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; between them sits one partial (4,000.00 of 6,148.00). The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage census must read 21 exact / 1 partial / 6 never-settled, the rails split 16 card legs (37,364) against 11 wire legs (32,248), and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "mercari-t9",
      q: "The purchase-by-purchase GMV walk shows the running total jumping two purchases at once. Walk me through the frame that causes it and the frame that fixes it.",
      a: "With ORDER BY created_at, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE treats ORDER BY peers as a block, so two purchases sharing the same timestamp enter the cumulative together. The fix is saying the frame out loud: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, ties broken by whatever secondary key you add to the ORDER BY. On a month spine ties are rare and RANGE is harmless; at purchase grain on a C2C app — where bursts of buys land in the same second — ROWS is the honest frame. The interview move is naming which axis you are accumulating on: rows (event grain) or values (calendar grain), because they disagree exactly when the data ties.",
      tag: "windows",
    },
    {
      id: "mercari-t10",
      q: "The close packet stacks the settled statement list over the never-settled list. When is UNION the right stacker and when is it a silent bug?",
      a: "UNION ALL is the honest default: it concatenates branches without a dedupe pass, which is what you want when the branches are logically disjoint — settled statements and never-settled statements cannot be the same row. UNION adds a distinct pass over the combined set, and that pass deletes rows silently: two branches that emit a byte-identical row (same statement id, same totals, same labels) collapse into one, and a 27-row close prints 26 with no error anywhere. The discipline is to default to UNION ALL and reach for UNION only when you can say out loud which duplicated rows you are paying to collapse — and to label the branches (a 'population' column) so no row can be byte-identical across them. On this db the packet's row count — 21 exact plus 6 never-settled — is the only witness that catches a wrong UNION.",
      tag: "set-ops",
    },
    {
      id: "mercari-t11",
      q: "How would you answer 'which purchase months exist in 2024 but not in 2025' — and what does EXCEPT silently do to duplicates?",
      a: "Set algebra: SELECT DISTINCT month from the 2024 side EXCEPT SELECT DISTINCT month from the 2025 side — 12 buckets against 2, and the diff reads straight off the page with no join gymnastics. The discipline points: EXCEPT deduplicates both inputs first, so it answers the DISTINCT-value question whether you meant it or not — if duplicated rows are the anomaly you are hunting, the row-honest tool is a LEFT JOIN … IS NULL anti-join on the full multiset; and both sides must share column count and compatible types, which is why the month key must be the same SUBSTR/STRFTIME expression on both sides. INTERSECT answers the mirror — months both years traded, on this spine all 14 qualify. Set operators for set-level diffs across periods, anti-joins for row-level forensics — naming which question you are answering is the skill.",
      tag: "set-ops",
    },
    {
      id: "mercari-t12",
      q: "Which sellers beat their OWN market's average revenue — and how do derived tables, correlated subqueries and window functions each answer it?",
      a: "Derived-table shape: fold revenue per seller in a CTE, fold the per-market mean in a second CTE, join back on market — the means compute once, and the query reads like the question. Correlated shape: WHERE seller_revenue > (SELECT AVG(seller_revenue) FROM … WHERE region = outer.region) — re-runs per outer row, correct but re-computing the same six market means six times, and on staging tables the empty-inner case silently returns nothing because revenue > NULL is UNKNOWN. Window shape: seller_revenue - AVG(seller_revenue) OVER (PARTITION BY region) puts the gap beside every row — one scan, no join, and the partition key IS the business definition. On this six-seller bench all three run instantly; the interview value is stating the trade: derived for auditability, correlated for readability on small data, windows for one-pass scans at scale.",
      tag: "subqueries",
    },
    {
      id: "mercari-t13",
      q: "The ops board needs delivered, in-transit, paid-awaiting-ship and cancelled in one scan. Why is a conditional aggregate the right shape, and what does the FILTER spelling buy?",
      a: "One scan, four lenses, one denominator. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — or the SQLite-native COUNT(*) FILTER (WHERE status = 'delivered') — prints 52, 30, 14, 7 from the same 103-row pass, and because the branches partition the same rows they reconcile to 103 by construction: a branch that drifts is visible immediately, which is the branch that breaks the close. Four sequential queries share no denominator and drift independently — the review-night failure mode. FILTER reads like the metric definition and keeps the condition attached to the aggregate that owns it; SUM(CASE) is the portable twin that runs on any engine. Both matter here because the census IS the daily identity: 52 + 30 + 14 + 7 = 103, and a branch that stops footing is the day's first incident.",
      tag: "case-when",
    },
    {
      id: "mercari-t14",
      q: "The dunning queue needs statements with no settlement legs. Why does the team standard say NOT EXISTS, and when does NOT IN bite?",
      a: "NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) is an existence probe: it short-circuits on the first match and never trips on NULLs, so it finds the 6 never-settled statements worth 15,217 regardless of what else is in the legs table. NOT IN (SELECT invoice_id FROM payments) materializes the list and compares every statement against it — and if one leg carries a NULL invoice_id, x NOT IN (…, NULL) is UNKNOWN for every row, and the dunning queue silently empties while looking valid. On the clean core db every leg carries its FK, so both shapes return 6 today; the standard exists because staging tables — the mid-ingest feeds where dunning lists actually get built — are exactly where NULLs sneak in. The habit to narrate: NOT EXISTS for anti-joins by default, NOT IN only over columns you have NULL-guarded out loud.",
      tag: "nulls",
    },
    {
      id: "mercari-t15",
      q: "Two clocks run this marketplace: purchase-to-ship (2.98 days) and statement-to-settlement. How do you compute both honestly on TEXT timestamps?",
      a: "julianday first: julianday(paid_on) - julianday(issued_on) returns fractional days per leg — on this db the settlement legs run 27 pairs, 29.04-day average, fastest 13, slowest 84 — and julianday(shipped_at) - julianday(created_at) gives the ship clock, 2.98-day average over the 82 stamped purchases. Then population policy: AVG ignores NULLs, so both clocks must name their WHERE — shipped_at IS NOT NULL for the ship clock (the 14 paid-awaiting-ship purchases have no cycle), and the join itself defines the settlement population (never-settled statements never enter it; a per-statement MIN clock avoids double-counting the five split statements). Finally boundaries: half-open ranges — issued_on >= '2024-01-01' AND issued_on < '2024-02-01' — because BETWEEN on TEXT timestamps drops the last night's legs, and month-end is exactly when C2C payouts batch.",
      tag: "dates",
    },
    {
      id: "mercari-t16",
      q: "A relist feed renames 'Wireless Mouse M3' to 'wireless mouse m3'. What breaks, and what is the hygiene pass before any join?",
      a: "Every equality join and every GROUP BY splits one listing into two: the census now counts two SKUs, the per-listing units fold halves, and the seller roster's GROUP_CONCAT carries both spellings as if they were different products. The hygiene pass runs before the join, in a CTE named for what it does: TRIM whitespace, collapse case with UPPER or LOWER into a normalized key column, and — the step teams skip — GROUP BY the id, not the name, because ids are the join's contract and names are display. The honest extra: report the drift. COUNT(DISTINCT name) beside COUNT(DISTINCT id) on the listings table is a one-line canonicalization audit; when the two disagree, the feed's casing is the bug, not the catalog. On a C2C marketplace where sellers type their own titles, string hygiene is supply-side data quality, not cosmetics.",
      tag: "casing",
    },
    {
      id: "mercari-t17",
      q: "Growth wants buyer accounts tiered into four re-buy bands. How do NTILE and PERCENT_RANK do it, and what breaks on ties?",
      a: "NTILE(4) OVER (ORDER BY purchases DESC) deals the 16 accounts into four bands as evenly as the data allows — here exactly 4/4/4/4, because the account count divides cleanly; with 15 accounts the first buckets absorb the remainder, and the deck must say so. PERCENT_RANK returns each row's relative position 0 to 1, which is the same tiering as a continuous score rather than fixed buckets. The tie problem: eight accounts sit at 4 or fewer purchases, and NTILE must break ties arbitrarily by whatever the ORDER BY holds — so add the deterministic second key (purchases DESC, customer_id) or two accounts with identical books land in different tiers with no explanation. The rule: NTILE for fixed band counts the business names ('top quartile of re-buyers'), PERCENT_RANK for share-of-field reads, deterministic tie-breaker always, and the band edges published next to the metric.",
      tag: "windows",
    },
    {
      id: "mercari-t18",
      q: "'Show each account's favorite listing by units bought.' Give me the three query shapes and how each behaves when two listings tie.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY units DESC, product_id) = 1 in a CTE — one deterministic row per account even on ties, because the second key decides. Join-back on the maximum: fold MAX(units) per account, join back on account AND units = max — honest, but a tie returns BOTH listings, which is a feature when the feed should show co-favorites and a bug when it double-counts accounts. Correlated filter: WHERE units = (SELECT MAX(…) for that account) — same tie behavior as the join-back at per-row re-evaluation cost. On this book the ladder is tie-rich — four accounts at 4 purchases, two SKUs dead-even in several family folds — so the three shapes genuinely diverge, and the complete answer names the divergence: ROW_NUMBER decides, join-back reports, correlated simplifies. 'Which one do you want on ties' is the interviewer's real question.",
      tag: "windows",
    },
    {
      id: "mercari-t19",
      q: "The cadence dashboard filters purchases with SUBSTR(created_at, 1, 7) = '2024-07'. Why is that the slow shape, and what is the sargable twin?",
      a: "Wrapping the column in a function — SUBSTR(created_at, 1, 7) = '2024-07' — forces the engine to evaluate the expression for every row, so any index on created_at is unusable and the scan reads the whole table. The sargable twin compares the bare column to a range: created_at >= '2024-07-01' AND created_at < '2024-08-01' — same rows, half-open so the last night of July survives, and index-usable. The GROUP BY key can stay SUBSTR-based (that fold happens after the filter, on the surviving rows); it is the WHERE predicate that must stay bare. The habits that compound on marketplace data: filter early inside each CTE, name columns instead of SELECT *, probe with LIMIT before the full run — because the cadence board re-runs on every app open, and a scan-per-open is the difference between a dashboard and a loading spinner.",
      tag: "performance",
    },
    {
      id: "mercari-t20",
      q: "The re-buy ladder is reviewed every week, and one week it printed in a different order. What makes an ORDER BY reproducible?",
      a: "A sort key that cannot tie. ORDER BY purchases DESC leaves every tied account — four of them at 4 purchases — ordered by storage luck, which can change between runs after a vacuum, an ingest, or a plan flip. The reproducible ladder orders by the business key then a stable tie-breaker: ORDER BY purchases DESC, customer_id — same ladder every run, and reviewers can diff week over week. The deeper rule: any board a human screenshots needs a total order, because 'about the same order' is indistinguishable from 'the metric moved' at review time; and the tie-breaker is a policy decision (earliest registrant first? biggest basket first?) that belongs in a comment beside the metric definition, not in the analyst's muscle memory. Determinism is not pedantry — it is what makes last week's deck comparable to this week's.",
      tag: "pipeline",
    },
    {
      id: "mercari-t21",
      q: "Where does COALESCE belong in a marketplace report — and where does it quietly lie?",
      a: "COALESCE belongs at the display edge, on LEFT JOIN payloads a human will read: the never-settled statements arrive with NULL settlement columns, and COALESCE(SUM(p.amount_cents)/100.0, 0.00) prints a clean 0.00 in the folio. It lies when it substitutes for a definition: COALESCE(shipped_at, created_at) inside the ship-latency average invents a zero-day ship for the 14 paid-awaiting-ship purchases — a fake speed-up the trust team would have to unpick — and COALESCE(NULL, 0) inside a COUNT changes the census the branch was supposed to protect. The placement rule: filter with IS NULL when absence is the answer (the anti-join), aggregate over the NULL-honest base and let AVG skip what it should skip, and coalesce only the last-mile column a spreadsheet will read. If you cannot say what the NULL meant, you are not ready to replace it.",
      tag: "nulls",
    },
    {
      id: "mercari-t22",
      q: "The regional AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The deck averaged them to 364.67. What is wrong, and what is right?",
      a: "An average of averages weights every market equally regardless of size. The four AOVs average to 364.67, but the true all-purchases AOV is SUM(total)/COUNT(*) over the base rows: 338.19 — because EU's 45 purchases and APAC's 37 dominate the base while LATAM's two purchases, despite the highest AOV, barely register. The honest blends: re-aggregate from the base (sum the numerators, divide by the summed denominators), or weight explicitly — SUM(aov * purchases)/SUM(purchases) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: an average of averages is only correct when every group has equal counts, and on a two-grain marketplace census that claim is false by construction — EU runs 45 purchases from 8 accounts, LATAM 2 from 1. The deck's 364.67 describes a marketplace that does not exist; the analyst who catches it owns the room.",
      tag: "aggregation",
    },
    {
      id: "mercari-t23",
      q: "Walk me through the four checks that prove a Mercari close before it ships.",
      a: "One: the status identity — the one-pass census must read 52 delivered + 30 in-transit + 14 paid-awaiting-ship + 7 cancelled = 103 by construction; a branch that stops footing is the incident. Two: the coverage census — 21 exact settlements, 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00, with the anomaly pair walked line by line: #11 void-but-settled at 925.00 and #28 paid-status with zero legs at 1,756.00 — the two mirror-image lies that make payment legs the ledger of record. Three: the rails — card 16 legs at 37,364.00 against wire 11 at 32,248.00, with the five split statements counted once each. Four: the ledger trial balance — 181,080.00 debits against 181,080.00 credits, delta zero. The deliverable is not 'it looks fine'; it is each check, its figure, and the timestamp it last ran — because the close ships on evidence, not vibes.",
      tag: "quality",
    },
    {
      id: "mercari-t24",
      q: "Growth asks for the cancel share by market. What do you pin down before writing the ratio?",
      a: "The denominator, out loud, first. Cancel share is cancelled ÷ placed — 7 of 103, 6.8% — with cancelled purchases inside the base, because the metric is a refusal rate and refusals are the signal; the alternative (completed ÷ placed) answers a different question and the two diverge exactly where trust & safety is looking. Then the grain: per market the shares spread — APAC 8.1% on 37 purchases, EU 6.7% on 45, US 5.3% on 19, LATAM 0.0% on a two-purchase base — and a 0.0 on n = 2 is a small-sample zero, not a clean bill, which the deck must say beside the cell. Then the arithmetic: 100.0 before the division so integer truncation never flattens 8.1 to 8, ROUND last for display only. Finally the named CTE: cancel_map AS (SELECT region … GROUP BY region) — the SQL IS the definition, and the reviewer audits the query instead of arguing with the analyst.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "mercari-mcq-1",
      prompt: "A purchase row's status reads 'pending'. In this kit's Mercari stage map, what happened?",
      choices: ["Cancelled before shipping", "Delivered and kept", "In transit, with shipped_at as the ship stamp", "Paid and awaiting ship — no shipped_at yet"],
      answer: 3,
      why: "The stage map is fixed: pending = paid-awaiting-ship (14 of 103 purchases). The buyer paid; the seller has not printed the label — no shipped_at stamp exists yet.",
      notes: [
        { choice: 0, why: "Cancelled is its own status — 7 purchases. Pending is 'not yet', which is exactly why those rows stay in funnel denominators instead of being written off." },
        { choice: 2, why: "In transit is 'shipped' — 30 purchases that DO carry the stamp. Calling pending purchases in-transit inflates the shipped share before any label was printed." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-2",
      prompt: "The dead-listing anti-join (listings LEFT JOIN purchase lines, keep the NULL side) returns ZERO rows. What is the honest read?",
      choices: ["The query is broken — a marketplace always has unsold listings", "Every one of the 16 listings sold at least once — sell-through is 16/16 and the zero is the finding", "Zero means 16 listings have no sales", "The join should have been INNER to find unsold listings"],
      answer: 1,
      why: "On this book the anti-join's confident zero IS the sell-through story: all 16 listings moved at least one unit (498 units total). Reporting 'no dead listings' with the population stated is the deliverable.",
      notes: [
        { choice: 0, why: "Suspicion is healthy, but the correct response is to prove the zero — rerun the fold per listing — not to assume breakage. On other tables (settlement legs) the same shape returns 6, so the operator knows the difference." },
        { choice: 2, why: "Sign flip — the NULL side of a LEFT JOIN keeps UNSOLD listings; zero rows means there are none, not sixteen." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-3",
      prompt: "The platform books 34,833.28 in completed purchases and the take rate is a flat 10%. What does ROUND(0.10 * SUM(total), 2) print as the fee book?",
      choices: ["348.33", "3,483.32", "3,483.33", "34,833.28"],
      answer: 2,
      why: "0.10 × 34,833.28 = 3,483.328, and ROUND to 2 decimals gives 3,483.33 — the flat-fee book. Per market it reads 1,508.92 / 1,160.55 / 728.62 / 85.24.",
      notes: [
        { choice: 1, why: "3,483.32 is the truncation trap — dropping instead of rounding the last digit. Settlement reads ROUND, they do not floor." },
        { choice: 0, why: "348.33 is a decimal slip — that is a 1% take rate, not the flat 10% the fee schedule publishes." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-4",
      prompt: "EU carries 45 purchases from 8 accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 1,
      why: "COUNT(*) counts purchase rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 purchases per account — is the intensity read.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every purchase has an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not accounts — a third grain nobody asked for. The census is purchases AND accounts." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled purchases only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancel share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8 — or worse, a 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the cancel map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-6",
      prompt: "The seller bench runs 6 accounts with 3, 3, 2, 2, 3, 3 listings. HAVING COUNT(DISTINCT p.id) >= 3 keeps whom?",
      choices: ["All 6 — the floor is below every count", "The 4 three-listing accounts; the two 2-listing boutiques drop", "Just the top seller", "Nobody — HAVING cannot compare a COUNT"],
      answer: 1,
      why: "A listing-count floor is a group-level fact judged after the fold: the four 3-listing accounts survive, the two 2-listing boutiques (the 4.8-rated one and the LATAM account) drop out of the ladder.",
      notes: [
        { choice: 0, why: "That is the >= 2 read — and it is why the gate's constant is a business decision: at 3 the bench loses its highest-trust seller, which the deck must say out loud." },
        { choice: 3, why: "HAVING exists precisely to judge aggregates after GROUP BY. The pipeline-order lesson is WHERE-vs-HAVING, not a ban on the comparison." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The 14 paid-awaiting-ship purchases double-counted their purchase day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 purchases.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-8",
      prompt: "A promo-eligibility query uses seller_id NOT IN (SELECT supplier_id FROM purchases WHERE status = 'cancelled') and returns ZERO sellers. First suspicion?",
      choices: ["The zero is correct — every seller had a cancelled purchase", "One NULL in the subquery's list poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL makes every row UNKNOWN and the eligibility list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every purchase carries its FKs. But staging tables are exactly where NULLs sneak in, and empty promo lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-9",
      prompt: "A close packet stacks the settled statement list over the never-settled list with UNION — 21 rows plus 6 rows should ship 27, but the packet prints 26 with no error. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches emitted one byte-identical row (same statement id, same totals), and UNION dedups whole rows silently — label the branches or use UNION ALL with a stated uniqueness argument", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit identical rows collapse into one, and the close loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible — the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate shared row exists, UNION is the bug, and the packet's row count is the only witness." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-10",
      prompt: "A growth deck walks booked GMV purchase by purchase: SUM(total) OVER (ORDER BY created_at). Two purchases share a created_at second, and the cumulative 'jumps two purchases at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at purchase grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-11",
      prompt: "order_items holds 251 line records carrying 498 units. What does `SELECT COUNT(quantity), SUM(quantity) FROM order_items` return?",
      choices: ["498, 251", "251, 498", "251, 251", "498, 498"],
      answer: 1,
      why: "COUNT(quantity) counts non-NULL line rows — 251; SUM(quantity) adds the units they carry — 498. The two numbers ARE the basket story: 2.44 lines per purchase and roughly 2 units per line, and confusing them misprices every attach-rate read.",
      notes: [
        { choice: 0, why: "Swapped — COUNT never adds. The 498 is the units fold; the 251 is the row count. Reading units off COUNT understates demand by half." },
        { choice: 3, why: "SUM cannot count rows: it adds values. 498 in the COUNT column claims 498 line records — a grain error the review catches the moment lines-per-basket reads 1.0." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-12",
      prompt: "The promo gate targets sellers with a 4.5-plus rating. Which clause filters `suppliers` correctly?",
      choices: [
        "WHERE rating >= 4.5, before any grouping",
        "HAVING rating >= 4.5, after GROUP BY supplier",
        "HAVING AVG(rating) >= 4.5",
        "WHERE AVG(rating) >= 4.5",
      ],
      answer: 0,
      why: "rating is a per-seller row-level fact, so the filter lives in WHERE: 2 of 6 sellers clear it (Alpine 4.8, Nordic 4.6). HAVING judges group aggregates — and with one row per seller there is no group to judge.",
      notes: [
        { choice: 2, why: "AVG over one row per group is just the rating — the clause works but announces confusion about where facts live, and on a joined bench the AVG would blend something else entirely." },
        { choice: 3, why: "Aggregate in WHERE is a hard syntax error — groups do not exist at filter time. The pipeline-order lesson in its purest form." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-13",
      prompt: "`SELECT DISTINCT region FROM customers` — how many rows, and what does the census do with it?",
      choices: ["16 — one row per account", "6 — one per seller account", "4 — EU, APAC, US, LATAM", "1 — the platform is one market"],
      answer: 2,
      why: "DISTINCT collapses the 16 accounts to their market buckets: 4 rows. The market census is built on this value set — purchases AND accounts per bucket — so a fifth row would mean a new market shipped to the app without the census knowing.",
      notes: [
        { choice: 0, why: "That is the count WITHOUT DISTINCT — 16 accounts across 4 markets. DISTINCT is the fold back to the dimension's value set." },
        { choice: 1, why: "6 is the seller bench, a different table. Customers are the demand side; the supply side lives in suppliers." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-14",
      prompt: "Payday relists land on the last night of every month. Which WHERE clause captures ALL of March 2024's purchases?",
      choices: [
        "created_at BETWEEN '2024-03-01' AND '2024-03-31'",
        "created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "SUBSTR(created_at, 6, 2) = '03'",
        "YEAR(created_at) = 2024 AND MONTH(created_at) = 3",
      ],
      answer: 1,
      why: "The half-open range catches every timestamp from the first second of March to the last second of March 31 — BETWEEN on a TEXT timestamp silently drops '2024-03-31 23:59:59', and month-end is exactly when C2C activity peaks.",
      notes: [
        { choice: 2, why: "The month-only key ignores the year — March 2025 lands in the same filter. It also wraps the column in a function, killing any index." },
        { choice: 3, why: "SQLite has no YEAR()/MONTH() functions — the query errors outright. The portable spelling is STRFTIME('%Y-%m', …), and even that belongs in the GROUP BY key, not the range filter." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-15",
      prompt: "One-pass census: which branch counts the paid-awaiting-ship purchases?",
      choices: [
        "SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)",
        "SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END)",
        "SUM(CASE WHEN shipped_at IS NULL THEN 1 ELSE 0 END)",
        "COUNT(status = 'pending')",
      ],
      answer: 0,
      why: "The stage map fixes the arm: pending = paid-awaiting-ship, 14 of 103. 'shipped' counts in-transit (30), and shipped_at IS NULL counts 21 — the pending 14 PLUS the 7 cancelled, which never ship either. Three arms, three different claims.",
      notes: [
        { choice: 2, why: "Close but wrong by 7: cancelled purchases also carry no stamp. The NULL-stamp count is the unstamped census, not the pending census." },
        { choice: 3, why: "COUNT(expr) counts non-NULL results — status = 'pending' evaluates to 1 or 0, never NULL, so every row counts: 103. The conditional-count spelling is SUM(CASE …), not COUNT(comparison)." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-16",
      prompt: "The fee book must print 3,483.33. Which expression guarantees the cents survive?",
      choices: [
        "CAST(SUM(total) AS INTEGER) * 0.10",
        "ROUND(SUM(total) * 0.10, 2)",
        "SUM(total) * 0.10",
        "ROUND(SUM(total) * 0.10)",
      ],
      answer: 1,
      why: "0.10 × 34,833.28 = 3,483.328, and ROUND to 2 decimals prints the 3,483.33 the fee pod quotes. Cast to integer truncates to 3,483; the unrounded float carries binary drift; ROUND without a precision rounds to 0 decimals.",
      notes: [
        { choice: 0, why: "INTEGER cast floors the GMV first (34,833), then multiplies — the fee book loses the cents it was computed from. Casts truncate, they never round." },
        { choice: 2, why: "It computes the right value and prints 3483.32800…-ish — presentation drift that stops the folio footing with the 3,483.33 on the slide. Round at the display edge." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-17",
      prompt: "Sell-through at the listing grain: how many DISTINCT listings moved at least one unit this book?",
      choices: ["COUNT(DISTINCT product_id) over order_items — 16 of 16", "COUNT(*) over order_items — 251", "COUNT(*) over products — 16 regardless of sales", "SUM(quantity) over order_items — 498"],
      answer: 0,
      why: "COUNT(DISTINCT product_id) folds 251 line records back to the listings behind them: 16 distinct — all of them sold, so the dead-listing anti-join returns a confident zero. The count IS the sell-through numerator.",
      notes: [
        { choice: 1, why: "251 is line records — the fan-out, not the catalog. Reading it as listings overstates the shelf 15-fold." },
        { choice: 2, why: "COUNT(*) over products counts carried listings, not sold ones — the denominator of sell-through, never the numerator. On this book they coincide, which is exactly why the distinction must be stated." },
      ],
      difficulty: "easy",
    },
    {
      id: "mercari-mcq-18",
      prompt: "The cadence spine built with STRFTIME('%m', created_at) prints 12 monthly buckets. What is broken?",
      choices: [
        "Nothing — a year has 12 months",
        "The year is lost: 2024-01 merges with 2025-01, so the 14-bucket spine becomes a 12-bucket fiction",
        "STRFTIME cannot take '%m' — it must be '%M'",
        "The spine needs 13 buckets because one month had no purchases",
      ],
      answer: 1,
      why: "'%m' emits the month alone — '01' through '12' — so the two Januaries fold into one bucket and the trend compares February 2024 against a merged January. The spine key is '%Y-%m': 14 buckets, 2024-01 through 2025-02, every month 6-9 purchases.",
      notes: [
        { choice: 0, why: "12 buckets from 14 months of data is the tell — two buckets were silently merged. The bucket count is the first thing to check on any time spine." },
        { choice: 2, why: "'%M' is minutes in SQLite's strftime. The format codes are the trap: %Y-%m for months, %d for days — and the merged-January bug is silent, not an error." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-19",
      prompt: "August's row must show July's 1,193.86 as its prior month. Which window fetches it, and what does the spine's first row print?",
      choices: [
        "LEAD(gmv) OVER (ORDER BY month) — first row prints 0",
        "LAG(gmv) OVER (ORDER BY month) — first row prints NULL",
        "LAG(gmv) OVER (ORDER BY month) — first row prints 3,731.97",
        "SUM(gmv) OVER (ORDER BY month) — first row prints the January total",
      ],
      answer: 1,
      why: "LAG reads one row back on the month-ordered spine — August's prev is July's 1,193.86 — and the first row has no prior, so it prints NULL: the honest 'no baseline'. Coalescing it to zero would read January as a 100% crash month.",
      notes: [
        { choice: 0, why: "LEAD reads FORWARD — August's 'prior' would be September's 3,116.04, re-labeling the future as history. And window boundaries print NULL, never 0." },
        { choice: 3, why: "SUM OVER is the running total, not the prior value — a different metric wearing the same column name. The pulse needs LAG, the cumulative needs SUM." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-20",
      prompt: "Seller-ops wants each account's listing roster. GROUP_CONCAT(p.name) over the sellers⋈listings⋈lines join prints 43 names for Nordic's 3 listings. Diagnosis?",
      choices: [
        "Nordic carries 43 listings — trust the fold",
        "The join fans out one row per line record; the bare fold repeats each listing name per line — GROUP_CONCAT(DISTINCT p.name) prints the real 3-listing roster",
        "GROUP_CONCAT caps at 40 items and wrapped around",
        "The join must be a LEFT JOIN to dedup the roster",
      ],
      answer: 1,
      why: "Nordic's 3 listings appear across 43 line records, so the bare fold concatenates 43 names with repetitions. DISTINCT inside GROUP_CONCAT folds to the true roster; COUNT(DISTINCT p.id) is the matching census column.",
      notes: [
        { choice: 0, why: "43 is the LINE count, not the listing count — the probed bench reads Nordic 3 listings, 43 lines. Trusting the string ships a roster that lies by repetition." },
        { choice: 2, why: "No cap and no wrap — GROUP_CONCAT faithfully concatenated 43 fanned-out rows. The bug is the join's grain, not the function." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-21",
      prompt: "The ask ladder reads: WHEN price >= 150 THEN 'premium', WHEN price >= 55 THEN 'mid', ELSE 'budget'. The shelf tops out at 199.99 (Smart Watch S). What happens if the first two arms swap?",
      choices: [
        "Nothing — CASE picks the closest match",
        "The premium arm starves: every ask at 150-plus hits the mid arm first, so premium prints zero rows and mid gains the halo SKUs — no error anywhere",
        "SQLite errors on overlapping WHEN arms",
        "The ELSE branch absorbs everything",
      ],
      answer: 1,
      why: "CASE stops at the first true arm, so order is logic: 199.99 must meet the 150 gate before the 55 gate catches it. Swapped, the shelf still renders — every halo ask just relabeled 'mid', and the premium band the merch deck quotes goes silently empty.",
      notes: [
        { choice: 0, why: "CASE is first-true-wins, not best-fit. Overlapping ranges make arm order the whole semantics — the silent re-banding bug." },
        { choice: 2, why: "Overlapping WHEN arms are legal SQL — the engine simply takes the first. That legality is exactly why the bug ships unnoticed." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-22",
      prompt: "Which purchases beat their OWN market's average total — not the platform's 338.19? What is the honest shape?",
      choices: [
        "WHERE total > 338.19 — the platform mean, one number for everyone",
        "A correlated subquery keyed to the outer row's region, or a window: total > AVG(total) OVER (PARTITION BY region)",
        "WHERE total > MAX(total) grouped by region",
        "GROUP BY region HAVING total > AVG(total)",
      ],
      answer: 1,
      why: "Per-market baselines need a per-market aggregate: the correlated subquery re-runs AVG per row (correct, re-computes the same four means), the window computes each partition's mean once. They answer 'above ITS market' — a different report from the platform 338.19 bar.",
      notes: [
        { choice: 0, why: "The platform mean answers 'above the platform' — a fine report, the wrong question. LATAM's 426.22 AOV clears 338.19 trivially on two purchases; its own 426.22 bar is a different gate." },
        { choice: 3, why: "HAVING cannot see row-level totals next to a group mean in that shape — and mixing the compared row into its own average's base is the deeper grain error the window spelling avoids." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-23",
      prompt: "Growth bands the 16 buyer accounts into four re-buy tiers: NTILE(4) OVER (ORDER BY purchases DESC). How do the tiles land?",
      choices: [
        "4 / 4 / 4 / 4 — 16 divides evenly by 4",
        "16 / 1 — one account per tier except the last",
        "Randomly — NTILE shuffles",
        "1 / 1 / 1 / 13 — all weight falls on the first tile",
      ],
      answer: 0,
      why: "NTILE deals rows as evenly as the count allows — 16 accounts into 4 tiles of exactly 4. With 15 accounts the first tiles absorb the remainder, which the deck must say; the tiles are band EDGES, not performance claims.",
      notes: [
        { choice: 1, why: "That is a top-N read, not a tile. NTILE's contract is even dealing — the tier sizes are the first thing to verify when the account count changes." },
        { choice: 2, why: "NTILE is deterministic given the ORDER BY — but ties inside the ORDER BY break arbitrarily, so a deterministic second key (customer_id) belongs beside purchases DESC." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-24",
      prompt: "The re-buy ladder must break account ties the same way every week. Two accounts sit at 4 purchases. Which ORDER BY makes the board reproducible?",
      choices: [
        "ORDER BY purchases DESC — the tie resolves itself",
        "ORDER BY purchases DESC, customer_id — business key first, stable tie-breaker second",
        "ORDER BY RANDOM() — fair rotation week to week",
        "No ORDER BY — GROUP BY output is naturally sorted",
      ],
      answer: 1,
      why: "A sort key that can tie leaves tied rows in storage-luck order, which changes between runs. The stable ladder orders by the business key, then a deterministic second key — same board every week, diffable review over review.",
      notes: [
        { choice: 0, why: "It does not resolve — SQLite's order for tied rows is unspecified and can flip after a vacuum or plan change. 'About the same order' is indistinguishable from 'the metric moved'." },
        { choice: 2, why: "RANDOM is the opposite of reproducible — the ladder would reshuffle weekly and no reviewer could compare runs. Tie-breakers are policy, not noise." },
      ],
      difficulty: "medium",
    },
    {
      id: "mercari-mcq-25",
      prompt: "You write WHERE RANK() OVER (ORDER BY COUNT(*) DESC) <= 3 to keep the top re-buyers. The query fails. Why, and what is the fix?",
      choices: [
        "RANK needs a PARTITION BY clause",
        "Window functions evaluate in the SELECT stage, after WHERE — stage the rank in a CTE (or derived table) and filter in the outer query",
        "COUNT(*) cannot appear inside a window ORDER BY",
        "The comparison must be = 3, not <= 3",
      ],
      answer: 1,
      why: "The pipeline order puts WHERE before SELECT: the rank does not exist yet when WHERE runs. The fix is staging — WITH ranked AS (…), then WHERE re_buy_rank <= 3 outside. Every 'window in WHERE' bug is the same stage violation.",
      notes: [
        { choice: 0, why: "PARTITION BY is optional — without it the whole result is one partition, which is legal. The error is the stage, not a missing clause." },
        { choice: 2, why: "Aggregates inside window ORDER BY are fine after GROUP BY — COUNT(*) DESC is exactly how the re-buy ladder ranks. The failure is evaluating the window in WHERE." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-26",
      prompt: "Trust & safety wants co-purchase pairs: which two listings keep landing in the same basket. Which join predicate pairs each combo ONCE?",
      choices: [
        "oi1.product_id = oi2.product_id on the same order",
        "oi1.product_id < oi2.product_id on the same order_id",
        "oi1.product_id != oi2.product_id, no other condition",
        "oi1.order_id = oi2.order_id only",
      ],
      answer: 1,
      why: "The strict inequality pairs each combo exactly once (A-B, never B-A, never A-A). Equality pairs a listing with itself; != double-counts every pair; order_id alone re-pairs every combination twice and pairs each line with its own siblings in both directions.",
      notes: [
        { choice: 0, why: "Equality self-pairs every line — 'Mouse & Mouse' is not a combo, it is one line reflected. The pair predicate needs both same-basket and strict ordering." },
        { choice: 2, why: "!= still generates both A-B and B-A — the pair count doubles and every attach rate halves. The inequality direction is what makes the pairing one-to-one." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-27",
      prompt: "Which months exist in the 2024 purchase log but not in 2025's? The spine runs 2024-01 to 2025-02.",
      choices: [
        "SELECT month FROM log_2024 EXCEPT SELECT month FROM log_2025 — 12 rows",
        "SELECT month FROM log_2024 UNION SELECT month FROM log_2025 — 12 rows",
        "SELECT month FROM log_2024 INTERSECT SELECT month FROM log_2025 — 12 rows",
        "An INNER JOIN of the two month lists ON month",
      ],
      answer: 0,
      why: "EXCEPT is the set difference: 12 buckets on the 2024 side, 2 on the 2025 side, no overlap — 12 rows. UNION would stack both sides (14), INTERSECT returns the shared months (none), and the inner join needs an anti-join twist to answer a difference question.",
      notes: [
        { choice: 1, why: "UNION is the sum of both sets — it cannot answer 'not in'. 14 distinct months, 2024-01 through 2025-02." },
        { choice: 2, why: "INTERSECT is the overlap — zero rows here, since 2025's two months both exist in 2024's list. The mirror of what the memo asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-28",
      prompt: "The cadence board smooths GMV: AVG(gmv) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). What do the spine's first two rows print?",
      choices: [
        "NULL, NULL — the frame has no full window yet",
        "3,731.97, then (3,731.97 + 3,609.64) / 2 = 3,670.81 — partial frames at the edge are honest",
        "3,670.81 twice — SQLite backfills the first rows",
        "The full-series average, twice",
      ],
      answer: 1,
      why: "ROWS frames shrink at the partition edge: the first row's window holds only itself, the second holds two rows. The edge values are real averages over what exists — printing them as NULL or backfilling would fake a trend the spine never had.",
      notes: [
        { choice: 0, why: "That is the behavior of requiring a full window — some engines' moving-average idioms do it, SQLite's ROWS frame does not. The edge row IS the average of one row." },
        { choice: 3, why: "No backfill, no series-wide default: the frame is strictly the rows specified, clipped by the partition edge. The opening months are the smoothest-looking and least-informed — say so on the chart." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-29",
      prompt: "The regional AOVs read EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The deck prints their simple average, 364.67, as 'platform AOV'. What is wrong?",
      choices: [
        "Nothing — four regions, four AOVs, one average",
        "It weights every market equally regardless of size; the true all-purchases AOV is SUM(total)/COUNT(*) = 338.19 over the 103-row base",
        "The AOVs should have been rounded before averaging",
        "364.67 is right but must be labeled 'median AOV'",
      ],
      answer: 1,
      why: "An average of averages weights LATAM's two purchases as heavily as EU's forty-five. The platform's real AOV re-aggregates from the base rows: 34,833.28 over 103 = 338.19. The honest blend re-weights — SUM(aov × purchases)/SUM(purchases) — the same arithmetic one level up.",
      notes: [
        { choice: 0, why: "Equal weighting is only correct when every group has equal counts — false by construction on a two-grain census (EU 45 from 8 accounts, LATAM 2 from 1). The claim must be defended, not assumed." },
        { choice: 3, why: "It is not the median either — the median sits inside the sorted per-purchase totals, not among four regional means. Relabeling a wrong number does not fix its denominator." },
      ],
      difficulty: "hard",
    },
    {
      id: "mercari-mcq-30",
      prompt: "The census uses COUNT(*) FILTER (WHERE status = 'delivered'). What does it return, and what is the portable twin?",
      choices: [
        "52 — the delivered count; the twin is SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)",
        "103 — FILTER is decoration over COUNT(*)",
        "82 — delivered plus anything with a ship stamp",
        "NULL — FILTER cannot attach to COUNT",
      ],
      answer: 0,
      why: "FILTER restricts that one aggregate to matching rows: 52 delivered, while COUNT(*) on the same scan stays 103 — four lenses, one pass, one shared denominator. SUM(CASE …) is the identical arithmetic spelled for any engine.",
      notes: [
        { choice: 1, why: "FILTER binds to the aggregate it decorates — COUNT(*) FILTER counts only delivered rows. The unfiltered 103 is exactly what the sibling branches reconcile against: 52 + 30 + 14 + 7." },
        { choice: 2, why: "82 is the ship-stamped count — a different population (delivered purchases carry stamps, but so do in-transit ones, and the filter never looked at timestamps)." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mercari-1",
      tier: "easy",
      topic: "j7",
      universe: "growth",
      title: "The flat take-rate census",
      brief:
        "Mercari-flavored brief on the storefront db: the growth board opens with the flat take-rate census — per market, how many completed purchases, how many distinct accounts bought, the GMV, and the platform's flat 10% fee book. The board is explicit that the fee is a flat 10% of GMV (no rate table — one multiplication per market) and that buyers are counted as distinct accounts, not purchase rows. Probed facts: the book is 103 purchases worth 34,833.28; the market census reads EU 45 purchases from 8 accounts (15,089.23), APAC 37 from 5 (11,605.45), US 19 from 2 (7,286.16), LATAM 2 from 1 (852.44); the fee book lands at 3,483.33 — EU 1,508.92, APAC 1,160.55, US 728.62, LATAM 85.24. The board reads biggest market first.",
      ask: "Return each market with its purchase count, distinct buyer accounts, GMV to 2 decimals and the flat 10% platform fee to 2 decimals, biggest GMV first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS purchases,\n       COUNT({1} o.customer_id) AS buyers,\n       ROUND(SUM(o.total), 2) AS gmv,\n       ROUND({2} * SUM(o.total), {3}) AS platform_fee\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY gmv {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the buyer deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat purchases back to accounts: EU reads 8, not 45. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "0.10",
          kind: "number",
          label: "the flat take rate",
          noVerify: true,
          why: "The fee schedule is a flat 10% of GMV — one constant, no rate table. Move it to 0.25 and the folio books two-and-a-half times the platform's real take; leave the rate implicit and the fee column is someone's guess.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "Money prints to 2 decimals — EU's 1,508.92. ROUND(…, 1) prints 1,508.9 and the fee book stops reconciling with the 3,483.33 total the fee pod quotes on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The board reads biggest market on top: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. ASC would open the meeting on LATAM's two purchases — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "ASC", "0.25", "1"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every purchase to its account's market — all 103 rows — and GROUP BY region folds them into four rows where COUNT(*) reads purchases (45 / 37 / 19 / 2), COUNT(DISTINCT o.customer_id) reads buyer accounts (8 / 5 / 2 / 1), ROUND(SUM(o.total), 2) reads GMV (15,089.23 / 11,605.45 / 7,286.16 / 852.44 — the probed region books verbatim), and ROUND(0.10 * SUM(o.total), 2) reads the flat-fee book (1,508.92 / 1,160.55 / 728.62 / 85.24), footing to 3,483.33 on the 34,833.28 platform. Because the take rate is flat, the fee column is arithmetic, not a lookup — which is exactly why the rate constant and its basis (gross GMV) must be stated on the slide. The distractors fail honestly: SUM and MAX in the buyer slot add id codes together or report the largest id — a census of nothing; 0.25 in the rate slot books a 25% take nobody publishes; 1 makes the fee equal the GMV; 1 and 0.25 in the precision slot break the 2-decimal money rule; ASC opens the board on LATAM. The read under the numbers: US demand is concentrated (19 purchases from 2 accounts) while EU's is broad (45 from 8) — the fee book rides on both, and only the stated grain keeps them apart.",
    },
    {
      id: "cs-mercari-2",
      tier: "medium",
      topic: "t6",
      universe: "supplier",
      title: "The market supply ladder",
      brief:
        "Mercari-flavored brief on the storefront db: seller ops wants the market supply ladder — per seller account, the trust score, listings carried, units moved and revenue, plus each seller's share of its OWN market's supply book, so a sole-seller market reads 100. Probed facts: 6 seller accounts behind the 16 listings — Nordic Gadgets AB (EU, 4.6, 3 listings, 11,130.25), Midwest Hardware Co (US, 4.4, 3, 9,294.93), Alpine Audio GmbH (EU, 4.8, 2, 4,765.63), Andes Naturals SA (LATAM, 4.0, 2, 3,613.25), Shenzhen Electro (APAC, 4.1, 3, 3,049.07), Pacific Textiles (APAC, 3.9, 3, 2,980.15); platform shares read 32 and 26.7 for the top two. Only 2 of 6 clear the 4.5 trust floor. The ladder reads biggest seller revenue first.",
      ask: "Return each seller account with its market, trust score, listings, units sold, revenue to 2 decimals and its share of its own market's supply book to 1 decimal, biggest revenue first.",
      template:
        "WITH seller_book AS (\n  SELECT s.name AS seller,\n         s.region AS market,\n         s.rating AS trust_score,\n         COUNT(DISTINCT p.id) AS listings,\n         SUM(oi.{1}) AS units_sold,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS seller_revenue\n  FROM suppliers s\n  JOIN products p ON p.{2} = s.id\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY s.name\n  HAVING COUNT(DISTINCT p.id) >= {3}\n)\nSELECT seller,\n       market,\n       trust_score,\n       listings,\n       units_sold,\n       seller_revenue,\n       ROUND(100.0 * seller_revenue / SUM(seller_revenue) OVER (PARTITION BY {4}), {5}) AS market_share\nFROM seller_book\nORDER BY seller_revenue {6};",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the units fold",
          why: "SUM(oi.quantity) folds unit counts per seller — Midwest's 109 units lead the bench, Andes trails at 51. SUM(unit_price) adds agreed prices together and COUNT counts line rows — neither is units moved.",
        },
        {
          answer: "supplier_id",
          kind: "keyword",
          label: "the seller join key",
          why: "Listings link to sellers through products.supplier_id — the only key that maps a listing to the account that carries it. p.id = s.id pairs products to sellers by coincidence of id codes and silently re-books the revenue.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the boutique floor",
          why: "The supply bench keeps accounts carrying at least 2 listings — all six clear it, including the two 2-listing boutiques (the 4.8-rated EU audio seller and the LATAM account). Raise the floor to 3 and the bench loses its highest trust score, which the deck must say out loud.",
        },
        {
          answer: "market",
          kind: "keyword",
          label: "the share partition key",
          why: "SUM(seller_revenue) OVER (PARTITION BY market) makes each seller's share sum to 100 within its own market — Nordic 70 against Alpine 30 in EU. PARTITION BY seller makes every row 100, a share of nothing.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          noVerify: true,
          why: "Market shares print to 1 decimal — 50.6 against 49.4 in APAC's near-tie. ROUND(…, 2) prints 50.57/49.43 and the ladder stops matching the one-decimal convention seller ops publishes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue-first direction",
          why: "The ladder reads biggest revenue on top: 11,130.25, 9,294.93, 4,765.63, 3,613.25, 3,049.07, 2,980.15. ASC would open the review on the smallest account — a correct ladder aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["id", "unit_price", "product_id", "AVG", "MAX", "ASC"],
      walkthrough:
        "Two stages: fold the seller book, then window the market share. The CTE keys every purchase line to its seller through products.supplier_id, folds 251 lines into 6 accounts (units 109 / 99 / 82 / 80 / 77 / 51 — footing to the platform's 498), keeps the 2-listing boutique floor, and the outer SELECT windows the share: SUM(seller_revenue) OVER (PARTITION BY market) divides each seller by its own market's book, so the ladder reads Nordic 11,130.25 at 70 of EU's 15,895.88, Alpine 4,765.63 at 30, Midwest 9,294.93 at 100 (the US has exactly one seller), Andes 3,613.25 at 100, and the APAC near-tie Shenzhen 3,049.07 at 50.6 against Pacific 2,980.15 at 49.4. The trust read rides on top: only Nordic (4.6) and Alpine (4.8) clear the 4.5 floor, so EU's supply is both concentrated AND trusted while APAC splits evenly between two sub-4.5 accounts — concentration and trust are different risks, and the ladder shows both. The distractors each break differently: p.id = s.id re-pairs listings to sellers by id coincidence and re-books every revenue cell; SUM(unit_price) turns the units column into a price sum; raising the floor to 3 silently deletes the bench's best trust score; PARTITION BY seller makes every share 100; the wrong precision drifts the one-decimal convention; ASC flips the ladder. State the partition key and the floor, and the ladder defends itself.",
    },
    {
      id: "cs-mercari-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The re-buy ladder",
      brief:
        "Growth-board brief on the storefront db: the review opens with the re-buy ladder — every buyer account ranked by completed purchases, with a tie policy stated in the deck, because the nudge calendar works top-down and ties must not be broken by storage luck. Probed on the storefront db: 16 accounts behind 103 purchases; the ladder runs 24, 17, 14, 13, 5, then a FOUR-way tie at 4 (accounts 9, 11, 14, 16), a pair at 3, and the floor keeps accounts with 3-plus purchases — 11 rows. Under RANK the tie block consumes ranks 6 through 9, so the 3-purchase pair lands on rank 10 — the gap IS the tie block, and the deck quotes it.",
      ask: "Return each account with 3-plus purchases: account id, purchase count, and a rank that shares rungs for ties and keeps the gaps the tie block earns, biggest first with a stable tie-break.",
      template:
        "SELECT o.customer_id AS account,\n       COUNT(*) AS purchases,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS re_buy_rank\nFROM orders o\nGROUP BY o.customer_id\nHAVING COUNT(*) >= {3}\nORDER BY purchases DESC, account;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-keeping rank",
          why: "RANK shares rungs AND keeps gaps: the four 4-purchase accounts read 6, 6, 6, 6, and the 3-purchase pair lands on rank 10 — the honest shape of a four-deep tie block. DENSE_RANK would renumber them 7, 7, hiding how deep the tie ran; ROW_NUMBER would split four identical accounts arbitrarily.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The ladder ranks purchases biggest first, so the window ORDER BY runs descending and account 1 (24 purchases) is rank 1. ASC crowns the 3-purchase accounts and pushes the anchor account to the bottom — a correct query aimed at the wrong end of the calendar.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 accounts — the 24/17/14/13/5 head, the four-way tie at 4, and the pair at 3 — so the tie block AND the gap it earns both stay visible in the output. The floor judges a per-account aggregate, which is why it lives in HAVING, not WHERE.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A census, a floor, and a tie policy. GROUP BY customer_id folds 103 purchases into 16 accounts; HAVING COUNT(*) >= 3 keeps the 11-row ladder — 24, 17, 14, 13, 5, then 4, 4, 4, 4, then 3, 3. The window ranks the folded counts with RANK: the head takes ranks 1-5, the four-way tie shares rank 6 four times, and the pair at 3 lands on rank 10 — ranks 7, 8, 9 are consumed by the tie, and the gap is the deck's honest read of how deep the tie block ran. DENSE_RANK would print 7, 7 for the 3-purchase pair — shared rungs, no gaps — which is a different policy the nudge calendar did not sign; ROW_NUMBER would deal 1 through 11, breaking four identical accounts by storage luck. The floor is load-bearing: raise it to 4 and the pair drops out — and inside the kept set RANK and DENSE_RANK would coincide, hiding the very policy the case teaches. The stable tie-break (account id) keeps the board reproducible week over week. One query, and the tie policy ships beside the ladder it produced.",
    },
    {
      id: "cs-mercari-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The market cancel map",
      brief:
        "Trust & safety brief on the storefront db: the weekly read wants the cancel map by market — purchases, cancelled purchases, the cancel share, and a risk band the escalation calendar keys off: elevated at 8-plus percent, watch at 5-plus, normal below. Probed on the storefront db: 103 purchases split EU 45, APAC 37, US 19, LATAM 2; cancels run 7 total — APAC 3 of 37 (8.1%), EU 3 of 45 (6.7%), US 1 of 19 (5.3%), LATAM 0 of 2 (0.0%, a two-purchase base — a small-sample zero, not a clean bill). The share prints to 1 decimal and the map reads highest risk first.",
      ask: "Return each market with purchase count, cancelled count, cancel share to 1 decimal, and the risk band, highest share first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS purchases,\n       SUM(CASE WHEN o.status = '{1}' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n             / COUNT(*), 1) AS cancel_share,\n       CASE\n         WHEN 100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n              / COUNT(*) >= {2} THEN 'elevated'\n         WHEN 100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END)\n              / COUNT(*) >= 5 THEN 'watch'\n         ELSE '{3}'\n       END AS risk_band\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY cancel_share {4};",
      slots: [
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the refused-stage arm",
          why: "The stage map fixes the arm: cancelled = refused before shipping, 7 of 103. 'shipped' would count in-transit purchases as cancels (EU 12, APAC 8 — the map would triple its escalation list), and a status like 'returned' matches nothing and prints a zero column.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the elevated threshold",
          noVerify: true,
          why: "The band edge is policy: 8-plus percent escalates. APAC's 8.1 clears it and EU's 6.7 does not — move the edge to 9 and APAC slides to watch, re-assigning the escalation before anyone re-reads the base.",
        },
        {
          answer: "normal",
          kind: "keyword",
          label: "the below-watch label",
          why: "The ELSE branch is the bucket for markets below watch: LATAM at 0.0 — on two purchases. Labeling it anything else (or dropping the arm) leaves a hole in the CASE, and a hole in the CASE is a market that vanishes from the map.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-risk-first direction",
          why: "The escalation calendar works top-down: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0. ASC would open the read on the two-purchase market — a correct map aimed at the wrong end of the worklist.",
        },
      ],
      distractors: ["shipped", "returned", "9", "ASC"],
      walkthrough:
        "A conditional aggregate wearing a policy. The join attaches every purchase to its market and GROUP BY region folds 103 into four rows; SUM(CASE WHEN status = 'cancelled') counts refusals per market — 3, 3, 1, 0, footing to the platform's 7 — and the share divides by COUNT(*) over the SAME fold, so the base is placed-including-cancelled by construction. The 100.0 multiplier forces real division first (8.1, not a truncated 8), and ROUND to 1 decimal matches the deck. The CASE reads the policy: APAC 8.1 >= 8 prints 'elevated'; EU 6.7 and US 5.3 clear the 5 arm and print 'watch'; LATAM falls to ELSE 'normal' — with the two-purchase base printed beside it, because a 0.0 on n = 2 is small-sample silence, not proof of clean supply. The distractors each break differently: 'shipped' turns in-transit volume into cancels; 'returned' invents a status the map has no rows for; moving the edge to 9 re-bands APAC; ASC opens the meeting on LATAM. One scan, one policy, and the escalation list is auditable line by line.",
    },
    {
      id: "cs-mercari-5",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass close census",
      brief:
        "Month-close brief, in-world: the ops board opens every morning with the status census — delivered, in-transit, paid-awaiting-ship, cancelled — and the identity that all four branches foot to 103 by construction. This close adds the ship-stamp column: how many purchases carry a shipped_at stamp at all. Probed on the storefront db: 103 purchases — delivered 52, shipped (in-transit) 30, pending (paid-awaiting-ship) 14, cancelled 7 — and the stamp count reads 82, so exactly 21 purchases (the 14 paid-awaiting-ship plus the 7 cancelled) have no dispatch stamp to carry.",
      ask: "Return one row: total purchases, the four status counts, and the count of purchases carrying a ship stamp.",
      template:
        "SELECT COUNT(*) AS purchases,\n       COUNT(*) FILTER (WHERE status = '{1}') AS delivered,\n       COUNT(*) FILTER (WHERE status = '{2}') AS in_transit,\n       COUNT(*) FILTER (WHERE status = 'pending') AS paid_awaiting_ship,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,\n       COUNT({3}) AS ship_stamped\nFROM orders;",
      slots: [
        {
          answer: "delivered",
          kind: "keyword",
          label: "the delivered-and-kept arm",
          why: "The stage map fixes the arm: delivered = delivered-and-kept, 52 of 103 — the platform's keep-rate numerator. A status like 'complete' matches nothing and the branch prints 0, breaking the 103 identity the board reconciles against.",
        },
        {
          answer: "shipped",
          kind: "keyword",
          label: "the in-transit arm",
          why: "In-transit is the status literal 'shipped' — 30 purchases with a stamp but no delivery confirmation yet. Calling the arm 'dispatched' (a plausible label with no rows behind it) prints a zero column and silently inflates the share of unaccounted purchases.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the stamp counter",
          why: "COUNT(shipped_at) counts non-NULL stamps — 82 of 103. COUNT(*) would print 103 and erase the 21-row gap (14 paid-awaiting-ship plus 7 cancelled) that defines which purchases still have a dispatch cycle to run.",
        },
      ],
      distractors: ["complete", "dispatched", "created_at", "*"],
      walkthrough:
        "One scan, five lenses, one identity. COUNT(*) is the base — 103 purchases — and each FILTER branch restricts one aggregate to its status: 52 delivered-and-kept, 30 in-transit, 14 paid-awaiting-ship, 7 cancelled. The branches partition the same rows, so they foot to 103 by construction — a branch that drifts is visible the moment the four numbers stop adding up, which is why the census runs as one query and not four. The stamp column is the population check: COUNT(shipped_at) skips NULLs, reads 82, and the 21-row gap is exactly the pending plus cancelled purchases — the ones with no dispatch to stamp. COUNT(created_at) would print 103 (every purchase has a spine key) and COUNT(*) likewise, erasing the gap the close needs to see. The wrong status literals — 'complete', 'dispatched' — are labels the stage map never issued: they match zero rows, print zero columns, and the identity they break is the day's first incident. One row, six columns, and the board can defend every cell.",
    },
    {
      id: "cs-mercari-6",
      tier: "medium",
      topic: "q5",
      universe: "supplier",
      title: "The above-the-mean supply bench",
      brief:
        "Supplier-audit brief on the storefront db: before the quarterly seller-success plan, the pod runs the above-the-mean scan — which seller accounts carry a lifetime book bigger than the platform per-seller mean — because the bench is six deep and the concentration story decides where the supply pipeline spends its time. Probed on the storefront db: 251 line records fold into 6 seller books footing to 34,833.28; the per-seller mean is 5,805.55, and exactly TWO accounts clear it — Nordic Gadgets AB (EU, 4.6 trust, 11,130.25) and Midwest Hardware Co (US, 4.4, 9,294.93). Their gaps over the mean read 5,324.70 and 3,489.38 — and of the two, only Nordic clears the 4.5 trust floor.",
      ask: "Return each seller account above the per-seller mean: name, market, trust score, revenue to 2 decimals, and its gap over the mean to 2 decimals, biggest revenue first.",
      template:
        "WITH seller_book AS (\n  SELECT s.name AS seller,\n         s.region AS market,\n         s.rating AS trust_score,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS seller_revenue\n  FROM suppliers s\n  JOIN products p ON p.supplier_id = s.id\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY s.id\n)\nSELECT seller,\n       market,\n       trust_score,\n       seller_revenue,\n       ROUND(seller_revenue - (SELECT AVG(seller_revenue) FROM seller_book), 2) AS gap_over_mean\nFROM seller_book\nWHERE seller_revenue {1} (SELECT {2}(seller_revenue) FROM seller_book)\nORDER BY seller_revenue {3};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-mean operator",
          why: "The scan lists sellers ABOVE the per-seller mean — the call list. '<' returns the below-mean complement (four accounts) and '=' returns zero rows, since no seller's book sits exactly on the 5,805.55 line.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the mean fold",
          why: "The baseline is the MEAN seller book: AVG over the six-row fold reads 5,805.55. MAX would baseline against the biggest book (11,130.25) — a bar only Nordic could never clear against itself — and SUM returns a number no seller exceeds, emptying the list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The pod reads the call list biggest book first: Nordic 11,130.25, Midwest 9,294.93. ASC would open the planning call on the smallest above-mean account and bury the concentration headline.",
        },
      ],
      distractors: ["<", "=", "MAX", "ASC"],
      walkthrough:
        "Stage the fold, then judge it against its own mean. The CTE keys every line record to its seller through products.supplier_id and folds 251 lines into six books footing to 34,833.28 — the grain the mean lives at. The outer query keeps every book strictly above (SELECT AVG(seller_revenue) FROM seller_book): the mean is 5,805.55, two sellers clear it, and the gap column prints 5,324.70 for Nordic and 3,489.38 for Midwest — the concentration read the supply plan cites (the pair carries 58.6% of the platform book). The trust cross-read rides on top: Nordic 4.6 clears the 4.5 floor, Midwest 4.4 does not — the platform's second-biggest book is below the trust bar, which is a different risk than concentration and belongs on the same slide. The distractors each break differently: '<' serves the four below-mean accounts the pod did not ask for; '=' returns an empty list that reads like a clean bill of health; MAX baselines against Nordic itself and empties the list; ASC flips the call order. One CTE, one scalar baseline, one direction — and the quarter plan starts from a defensible two-row list.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-iii", why: "Units sold per listing inside a date window — the sell-through read. A C2C listing either converts in its window or it is dead supply, and this problem drills the exact per-listing fold the marketplace-health desk runs." },
    { slug: "average-selling-price", why: "Weighted ASP per listing — price times units over units, across a join. C2C asks move constantly, so the naive average of ask prices lies; this is the weighted fold that does not, and it is the base under every take-rate read." },
    { slug: "confirmation-rate", why: "Trust scores with honest denominators: confirmed ÷ total, with NULLs folded deliberately. Mercari's trust floor (2 of 6 sellers at 4.5-plus) lives or dies on the same COALESCE-and-count discipline." },
    { slug: "customer-order-frequency", why: "Re-buy cadence: accounts with 2-plus purchases in a window. The HAVING-gate shape behind the repeat-buyer rate (14 of 16 here) that growth reads as the healthiest C2C signal there is." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The re-buy ladder argmax — this book's ladder runs 24, 17, 14, 13, 5 with a four-way tie at 4. Finding the top buyer is easy; handling the tie is the interview." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-account favorite listing — the personalization read. Argmax inside a group with ties that need a stated policy, exactly what a C2C feed ranks on." },
    { slug: "bank-account-summary-ii", why: "Cents-safe monthly folds with credits and debits beside each other. INTEGER cents and the /100.0 rule make this exact practice for the seller fee statements' true-up reads." },
    { slug: "monthly-transactions-ii", why: "The transferred-versus-not census with EXCEPT — the never-settled statement list (6 statements, 15,217) is this exact set algebra, run against the rails before every seller payout batch." },
    { slug: "find-churn-risk-customers", why: "Dormant-account detection: sellers whose listings went quiet or buyers who stopped re-buying. The anti-join plus recency shape that feeds Mercari's win-back calendar — and the dunning list uses the identical skeleton." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV in one fold — 2.44 lines per basket at a 338.19 average here. The two-metric single-query shape the marketplace review opens with." },
    { slug: "repeat-purchase-rate", why: "Repeat rate with the denominator stated: re-buyers ÷ ALL accounts, one-timers included. The denominator decision is the whole C2C retention argument, and this problem forces it." },
    { slug: "returns-rate-by-category", why: "Returns per family with a LEFT JOIN rate — the trust-and-safety read. A family whose return rate drifts is a listing-quality problem before it is a seller problem." },
    { slug: "rfm-segmentation", why: "Buyer tiers via NTILE buckets — recency, frequency, monetary. Mercari's re-buy nudges and coupon targeting segment on exactly this three-window fold." },
    { slug: "fix-product-name-format", why: "Listing title hygiene before any join: C2C titles arrive case-broken, and 'wireless mouse' versus 'Wireless Mouse' silently splits one listing into two in every census." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Fast re-buys inside a window — the impulse-loop read. C2C momentum shows up as accounts re-buying within days; the self-join-plus-date-math shape is exactly this problem." },
    { slug: "sales-by-day-of-the-week", why: "The weekend relist rhythm: purchases and listings by weekday via strftime. C2C activity concentrates on paydays and Sunday-night relists, and the pivot proves it." },
    { slug: "wash-trade-detection", why: "Self-dealing detection on a C2C marketplace: accounts trading with themselves to fake sell-through. The pair-once self-join is exactly how trust & safety screens shill loops before a payout batch." },
    { slug: "top-percentile-fraud", why: "Fraud watchlist by percentile: the riskiest slice of listings and accounts, not a fixed count. NTILE/percent-rank banding is how the trust queue stays proportional as the book grows." },
    { slug: "chargeback-rate-ranking", why: "Chargebacks per seller with a rate and a rank — the trust-ladder's dark twin. A seller whose dispute rate outruns its rating is the interview's favorite tie of two denominators." },
    { slug: "ar-aging-schedule", why: "The never-settled 6 worth 15,217 need an age column before dunning: T+N buckets over unpaid seller statements. The AR-aging fold is the fee pod's standing worklist." },
    { slug: "suspicious-bank-account-transactions", why: "Settlement-leg anomalies — wrong rail, odd timing, duplicate legs — screen exactly like suspicious bank transactions. The same flag-and-census shape protects every seller payout." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest sale per listing — the freshness read. A C2C listing's momentum lives in its most recent conversion, and argmax-per-group with a deterministic tie-break is the query." },
    { slug: "game-play-analysis-v", why: "First-purchase-then-return retention: the share of new buyers whose second purchase lands the next day. The day-1 retention shape is the re-buy loop Mercari's growth model is built on." },
    { slug: "cohort-repeat-revenue", why: "Revenue by first-purchase cohort — which signup month keeps re-buying. The cohort fold is how the fee book separates durable demand from one-off spikes." },
    { slug: "winback-recovery", why: "Dormant accounts that came back: the winback read on the 2 one-time buyers and the quiet re-buy tiers. Same anti-join-plus-recency skeleton as the dunning calendar." },
    { slug: "rolling-7d-actives", why: "Rolling weekly actives over the purchase spine — the liquidity pulse between month closes. A C2C marketplace lives or dies on the trailing-7 curve, and this drills it." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU on app sessions — the stickiness ratio the growth board quotes beside GMV. Ratio with two denominators is the honest-denominator drill at marketplace cadence." },
    { slug: "find-bursty-behavior", why: "Burst detection: accounts that fire several purchases in a short window, then go quiet. Bursts are the impulse loop this app monetizes — and the self-join-over-windows shape finds them." },
    { slug: "calculate-orders-within-each-interval", why: "Purchases bucketed by days-since-prior — the re-buy interval histogram. Same-window CASE banding over date math, exactly how the nudge calendar picks its send day." },
    { slug: "find-the-team-size", why: "Attach a computed count to every row without collapsing it — listings per seller beside each line. COUNT() OVER (PARTITION BY) is the window enrichment behind the supply-side roster." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Attach-rate rule: buyers of the headset AND the mic but never the stand. The set-membership gate behind every 'complete your setup' nudge this marketplace sends." },
    { slug: "user-purchase-platform", why: "Purchases split across app surfaces with the total footing — the channel census. One scan, one denominator, the same discipline as the market census this kit opens with." },
  ],
};
