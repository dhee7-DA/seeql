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
    "Preparation strategy: the pools file carries no Mercari section — fewer than 2 tagged rows, none SQL-graded — so all **sixteen problems** and every topic slug here are **theme-curated** to this kit's known screen shapes: listing-to-sale folds, two-grain market censuses, trust ladders with tie policy, flat-fee arithmetic, CASE banding, and cents-safe settlement reads. Do the topics in order, then run **both case studies** on the live storefront db: one rebuilds the {emerald:flat take-rate census} the growth board opens with, the other rebuilds the {sky:market supply ladder} the seller-ops review quotes. The bar to clear: *state the grain, the fee basis and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["product-sales-analysis-ii", "top-earners", "group-sold-products-by-the-date"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets report at two grains simultaneously: EU runs 45 purchases from 8 accounts, the US 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is demand and which is coverage — is the reflex. The intensity ratio (9.5 versus 5.6) is the market-maturity signal hiding between the columns.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "students-and-examinations"],
    },
    {
      name: "Joining buyers to the seller bench",
      why: "Purchase lines carry no seller, no trust score, no market — everything joins through listings and the seller table, and the join type decides who survives. A line with no listing is corruption; a listing with no sale is dead supply — though on this db the anti-join returns a confident zero (all 16 listings sold), and proving that zero is part of the job.",
      slugs: ["sales-analysis-i", "combine-two-tables", "top-travellers"],
    },
    {
      name: "Trust ladders & tie policy",
      why: "Seller reviews rank accounts by rating and by revenue, and buyer ladders tie — 24, 17, 14, 13, 5 purchases with a three-way tie at 4 below. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which on a trust ladder is a policy about peer sellers, not syntax.",
      slugs: ["rank-scores", "ratings-histogram", "department-top-three-salaries"],
    },
    {
      name: "Flat take-rate arithmetic",
      why: "The fee book is a flat 10% of GMV, so every fee read is a multiplication with a rounding rule — and every ratio read (cancel share, repeat rate, promoted-listing lift) punishes integer division. The house habit: 100.0 (or the rate) before the division, population fixed before the ratio, ROUND last.",
      slugs: ["queries-quality-and-percentage", "percentage-of-users-attended-a-contest", "ads-performance"],
    },
    {
      name: "CASE banding & the ask ladder",
      why: "Listing asks band into budget (8 SKUs averaging 32.06) and mid (8 at 111.5), with the premium ladder honestly empty — the catalog tops out at 199.99. CASE arms must be exhaustive and ordered; a hole in the CASE is a hole in the folio, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Liquidity subquery gates",
      why: "Screens escalate into staging: which sellers beat the 5,805.55 platform mean (exactly 2 do), which listings out-sell the family average, which markets clear a purchase floor. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted — the above-average filter is where silent zeros ship.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i"],
    },
    {
      name: "Cadence & month buckets",
      why: "The 14-month purchase spine (2024-01 to 2025-02, every month 6-9 purchases) is the C2C cadence read: STRFTIME or SUBSTR month keys, half-open windows that never drop the last night of a month, and '%m' traps that merge January 2024 into January 2025. Cadence analytics is date discipline.",
      slugs: ["list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "find-golden-hour-customers"],
    },
    {
      name: "Anti-joins & the never-remitted",
      why: "Marketplace hygiene runs on anti-joins: accounts that never bought, listings that never sold, statements no rail ever touched. On this db the account and listing anti-joins return a confident zero, while the settlement anti-join returns 6 statements worth 15,217 — proving which zero you have IS the deliverable.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets delivered, in-transit, paid-awaiting-ship and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. Query budget is a real constraint on marketplace-review nights.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
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
      q: "The buyer ladder runs 24, 17, 14, 13, 5 purchases — then a three-way tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — the ladder reads 1 through 5, then the three-way tie consumes ranks 6 through 8, and the next distinct count lands on 9, implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6 and the next account is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which account gets the re-buy nudge first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. On a C2C trust ladder the same question bites twice: rank sellers by rating and you will tie the moment two accounts share a score, so the tie-breaker policy is a trust-and-safety decision, not a SQL footnote.",
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
  ],

  problems: [
    { slug: "product-sales-analysis-iii", why: "Units sold per listing inside a date window — the sell-through read. A C2C listing either converts in its window or it is dead supply, and this problem drills the exact per-listing fold the marketplace-health desk runs." },
    { slug: "average-selling-price", why: "Weighted ASP per listing — price times units over units, across a join. C2C asks move constantly, so the naive average of ask prices lies; this is the weighted fold that does not, and it is the base under every take-rate read." },
    { slug: "confirmation-rate", why: "Trust scores with honest denominators: confirmed ÷ total, with NULLs folded deliberately. Mercari's trust floor (2 of 6 sellers at 4.5-plus) lives or dies on the same COALESCE-and-count discipline." },
    { slug: "customer-order-frequency", why: "Re-buy cadence: accounts with 2-plus purchases in a window. The HAVING-gate shape behind the repeat-buyer rate (14 of 16 here) that growth reads as the healthiest C2C signal there is." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The re-buy ladder argmax — this book's ladder runs 24, 17, 14, 13, 5 with a three-way tie at 4. Finding the top buyer is easy; handling the tie is the interview." },
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
  ],
};
