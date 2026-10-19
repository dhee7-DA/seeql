// Paytm — Wave-11 (Task 102), fintech domain, no tagged pool — theme-curated; facts from
// scripts/company-facts.md. The storefront db read as a super-app rails sandbox — distinct from
// nubank/chime (neobanks): the angle is the RAILS mix at super-app scale. customers = wallet
// accounts (region = market), orders = consumer transactions (recharge, bill-pay, ticketing:
// delivered = completed 52, shipped = bank leg settling with shipped_at as the settlement stamp 30,
// pending = initiated-awaiting-the-payer 14, cancelled = failed-or-reversed 7), order_items = line
// services inside a transaction (quantity = units on the line), products = service SKUs (price =
// denomination; the premium band >= 200 is empty), suppliers = billers & merchants per market,
// invoices = merchant settlement statements, payments = settlement rails (card = wallet top-up rail
// 16 legs / 37,364.00, wire = bank/UPI settlement rail 11 legs / 32,248.00 — the 16/11 split maps
// wallet-vs-bank), expenses = cashback & opex, ledger_entries = GL. Finance tables store INTEGER
// paise — dollar read = amount_cents / 100.0; orders.total and order_items.unit_price are REAL
// dollars already. The settlement clock maps created_at -> shipped_at onto the leg clock (82 of 103
// transactions stamped, 2.98-day average, 2-4 spread).
// Pool provenance: company-pools.md carries NO Paytm section (0 tagged rows) — all 30 topic slugs and
// all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows) and say so in
// brief P4. Case briefs quote probed figures from scripts/company-facts.md; the per-market rail-split
// cells are probe-derived readonly against db/custom.db and declared here: EU 14 legs — wallet
// 19,124.50 / bank-UPI 18,136.50 over 10 statements; APAC 8 — wallet 6,501.50 / bank-UPI 14,111.50
// over 7; US 5 — wallet 11,738.00 / bank-UPI 0.00 (wallet-only) over 5; LATAM 0 legs on a
// 0-statement book. No-leg statements by market: EU 4 (18/873.00, 21/1,295.00, 26/3,562.00,
// 27/2,794.00), US 1 (24/4,937.00), APAC 1 (28/1,756.00, the paid-status lie). Rail ticket sizes
// average 2,335.25 (wallet) vs 2,931.64 (bank/UPI).
// NOTE for the wave-11 registry wiring agent: paytm is NOT yet in registry COMPANY_META (wave-11
// unwired) — wire id "paytm", domainId "fintech", name "Paytm", tagline "Wallet + UPI rails at
// super-app scale: bill-pay, recharge, QR acquiring", accent "text-sky-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const paytmKit: CompanyKit = {
  id: "paytm",
  domainId: "fintech",
  name: "Paytm",
  tagline: "Wallet + UPI rails at super-app scale: bill-pay, recharge, QR acquiring",
  accent: "text-sky-400",

  brief: [
    "**Paytm** is India's original super-app — wallet first, then UPI, then everything that touches money in a day: mobile recharges, electricity and FASTag bill payments, movie and travel ticketing, and the merchant QR network that lets a chai stall take digital money. The analytics reality is rails engineering at consumer scale: every rupee rides either the {sky:wallet rail} or the bank/UPI rail, and the product's whole job is making both feel instant. This kit maps the storefront db onto that world: the 16 customers rows are wallet accounts (region = market), the 103 orders are consumer transactions worth **34,833.28**, and the 251 order_items rows are the line services inside them (2.44 per transaction). The status map is fixed: delivered = {emerald:completed} (52, 50.5%), shipped = bank leg settling (30, 29.1%), pending = awaiting the payer (14, 13.6%), cancelled = {rose:failed or reversed} (7, 6.8%).",
    "The data org splits into the rails desk, risk and growth, and they read the same settlement spine at different grains. Money movement owns the rails: 27 settlement legs fold onto just **22 merchant statements**, because five statements settle in two legs (ids 1, 5, 12, 19, 22) — card legs are {amber:wallet-rail settlement} at 16 legs / 37,364.00, wire legs are {emerald:bank/UPI settlement} at 11 legs / 32,248.00. The coverage census is the margin check: **21 exact, 1 partial, 6 none** — the six legless statements carry 15,217.00 and include #28, which reads paid with nothing behind it (1,756.00). Rails also carry different tickets: the wallet rail averages 2,335.25 a leg against the bank/UPI rail's 2,931.64 — *small change on the wallet, bigger tickets straight from the bank*.",
    "Interview screens are denominator-first with a rails accent. A loop opens with a two-grain census — EU runs 45 transactions from just 8 wallet accounts while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'of all transactions, or only the 82 that stamped?'*), then into the CASE rail pivot where arm order decides whether a market reads wallet-heavy or UPI-heavy. Late rounds walk the 14-month spine (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or fold legs to statements and probe whether the count says 27 or 22. Candidates who state the rail, the grain and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Paytm section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: rail folds, two-grain market censuses, bill-pay funnels, split-statement counts, CASE rail pivots and the cents-safe statement spine. Do the topics in order, then run all six case studies on the live storefront db, spaced across a week rather than one sitting: the {sky:settlement-rail scorecard} the growth board opens with, the {emerald:market-by-rail close pivot} finance ships at every month-end, the 14-month volume walk, the one-pass fate census, the dunning queue, and the whale ladder with its tie-block policy call. The bar to clear: *say which rail, which grain, which denominator* — then make every leg census reconcile to 27 and every statement census to 22 by construction.",
  ],

  dayInLife: [
    "**08:20 —** The day starts on the rails dashboard. First query is the overnight read: legs that landed versus statements they claim to settle — 27 legs across only 22 distinct statements, because five settle in two legs — *a census that can't say both grains out loud is the one that double-counts a statement during close*. Then the transaction pulse: did the overnight bill-pay batch complete, does the {rose:failed-or-reversed} share still sit at 6.8%, did any recharge line stall pending past the payer window? A mismatch between legs and statements pages the rails desk, not a shrug. The morning artifact is one number: wallet-rail share of legs, **16 of 27**, printed beside the bank/UPI count so nobody quotes 100% by accident.",
    "**11:40 —** Midday is the merchant QR read. The {emerald:market-by-rail pivot} refreshes for the acquiring review: EU settles near-even (19,124.50 wallet against 18,136.50 bank/UPI over 14 legs), APAC leans UPI (6,501.50 against 14,111.50), and the US is **wallet-only** — 11,738.00 against a flat 0.00 — while LATAM's statement book is empty outright. Each ask is a join, a CASE arm and one judgment call about which market stays on the pack. The analyst writes the query twice — *once to answer, once with the population spelled out so the number survives the pricing argument* — and staples the leg-to-statement key (`invoice_id`, never the id coincidence) into the review notes.",
    "**16:15 —** The afternoon is the close cycle. The coverage census runs first — **21 exact, 1 partial, 6 none** — before finance sends a single dunning email; the dunning queue is an EU story (four statements: 873.00, 1,295.00, 3,562.00, 2,794.00) plus US's 4,937.00 and APAC's #28, which reads {emerald:paid} with nothing behind it. The two standing contradictions get walked line by line: a void statement with a 925.00 leg (#11) and a paid statement with zero legs (#28) — both are findings, and neither survives a COALESCE that launders the truth. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Rail mix (wallet vs bank/UPI)", what: "Settlement legs by rail: card = wallet top-ups at 16 legs / 37,364.00, wire = bank/UPI settlement at 11 legs / 32,248.00 — 27 legs onto 22 distinct statements. Where the money actually moves, and which rail the QR roadmap is winning." },
    { name: "Average ticket by rail", what: "Wallet rail 2,335.25 per leg against bank/UPI 2,931.64 — the instant bank rail carries bigger tickets. The pricing pod's weekly read on how consumer behavior splits across the two rails." },
    { name: "Transaction fate census", what: "52 completed, 30 settling, 14 pending, 7 failed-or-reversed — 103 by construction. Every stage is a conditional count over a status or timestamp, and the denominator question ('of all, or only the 82 stamped?') is the interview inside the metric." },
    { name: "Settlement latency", what: "created_at to shipped_at over stamped transactions only: 82 of 103, 2.98-day average, range 2 to 4. The instant-promise clock — the 14 pending have no stamp and no cycle yet, which is a population definition, not a cleanup job." },
    { name: "Statement coverage", what: "Merchant statements classified exact / partial / no legs: 21 / 1 / 6. The 65,612.00 exact book settles clean (void-but-settled #11 at 925.00 folds in by construction); the ladder is how finance proves it instead of asserting it." },
    { name: "Unsettled exposure", what: "Statements with zero settlement legs: 6 worth 15,217.00 — EU carries four (873.00, 1,295.00, 3,562.00, 2,794.00), US one (4,937.00), APAC one (#28, the paid-status lie at 1,756.00). The dunning queue and the data-quality queue, in one anti-join." },
    { name: "Split-statement census", what: "Statements settling in two legs: exactly 5 (ids 1, 5, 12, 19, 22) — hybrid wallet-plus-bank settlement. Fold per statement before you sum, or the 65,612.00 exact book reads 69,687.00 and the close is wrong." },
    { name: "Market concentration", what: "EU 45 transactions from 8 accounts (15,089.23), APAC 37 from 5 (11,605.45), US 19 from 2 (7,286.16), LATAM 2 from 1 (852.44); 63.5% of spend sits with accounts over 3,000 lifetime (71.2% over 2,000). One churned whale moves the wallet book." },
  ],

  topics: [
    {
      name: "Rail folds & conditional counts",
      why: "Every rails read at Paytm is a fold with a conditional inside: legs per rail, dollars per method, split statements per market. The denominator rides on every one — 27 legs is not 27 statements, and the wallet share is 16 of 27 legs, not of dollars, until someone says which. Conditional aggregation over the method column is the shape being graded.",
      slugs: ["number-of-rich-customers", "monthly-transactions-ii", "count-salary-categories", "monthly-transactions-i", "queries-quality-and-percentage", "classes-more-than-5-students", "confirmation-rate", "average-selling-price", "immediate-food-delivery-ii", "bank-account-summary", "list-the-products-ordered-in-a-period", "spend-histogram"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transactions and wallet accounts are different grains of the same join, and every market report here shows both: EU runs 45 transactions from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides where acquiring pushes next.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-ii", "students-and-examinations", "active-users", "product-sales-analysis-ii", "sales-analysis-i", "capital-gain-loss", "combine-two-tables", "trips-and-users"],
    },
    {
      name: "Bill-pay fate funnels",
      why: "The fate census is the ops heartbeat: completed, settling, pending, failed — each a conditional count over a status or timestamp. The trap is calling a settling transaction 'complete' — 30 versus 52 on this db — and the second trap is the denominator: pending stays in a conversion base and drops out of a latency base, and the panel wants you to say which before writing SQL.",
      slugs: ["trial-to-paid-funnel", "email-engagement-funnel", "immediate-food-delivery-i", "customer-who-visited-but-did-not-transact", "chargeback-rate-ranking"],
    },
    {
      name: "Whale & biller leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four wallet accounts sit at 4 transactions each on this db, and the ladder above them runs 24, 17, 14, 13, 5 with the top account at 7,262.35. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax. Paytm's growth board publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary", "top-travellers", "compute-the-rank-as-a-percentage", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "CASE rail pivots",
      why: "The market-by-rail close pivot is CASE work: wallet dollars, bank/UPI dollars and a leg count per market, with arms that must be exhaustive and ordered. A reordered WHEN quietly re-buckets the book, a 'WIRE' literal matches nothing, and the empty arm must sum to a real zero (US reads 11,738.00 against 0.00) rather than a NULL. Arm order is the whole answer.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "loan-types", "credit-utilization-bands", "number-of-employees-who-met-the-target"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the volume call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Failed transactions concentrate in July and November (2 each of 7), and the walk is how that pattern gets defended.",
      slugs: ["year-on-year-growth-rate", "hopper-company-queries-i", "biggest-window-between-events", "consecutive-numbers", "balance-rollforward"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — wallet-rail legs beside bank/UPI legs, this quarter beside last — and UNION answers by stacking while deduping whole rows silently, which makes it a correctness question. EXCEPT answers 'which settled statements never rode the wallet rail'. The dunning anti-join (6 legless statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "league-statistics", "customers-who-never-order", "sellers-with-no-sales"],
    },
    {
      name: "Nested gates & staging",
      why: "Screens escalate into staging: fold per-account transaction counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Paytm's acquiring targeting is exactly this: which markets run above the platform's settlement cadence.",
      slugs: ["investments-in-2016", "game-play-analysis-iv", "market-analysis-i", "amount-anomaly-zscore", "average-time-of-process-per-machine"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board wants completed, settling, pending and failed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "count-the-number-of-experiments", "create-a-session-bar-chart", "daily-balance-interest"],
    },
    {
      name: "Cents discipline & statement folds",
      why: "Settled is not paid — the finance tables (28 statements, 27 legs, INTEGER paise) are where the wallet world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) ride the wallet, wire legs (11, 32,248.00) settle straight from bank accounts.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "account-balance", "ar-aging-schedule", "deferred-revenue", "budget-pacing"],
    },
  ],

  theory: [
    {
      id: "paytm-t1",
      q: "Your settlement report joins legs to merchant statements. When do you INNER and when do you LEFT — and what silently breaks if you filter a statement column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A coverage report joins legs to statements: a leg with no statement row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dunning report must be LEFT from statements: the statements with no legs ARE the answer, arriving with NULL leg columns — on this db six of them, worth 15,217.00, including #28 which reads paid with nothing behind it. The classic break: filtering method = 'card' in WHERE after the LEFT JOIN kills every NULL-payload statement row — the LEFT quietly became an INNER and the dunning queue vanished. The fix is moving the predicate into ON or an outer query. On the clean core db the reverse anti-join (legs without statements) returns a confident zero — all 27 legs cite a real statement — and proving that zero is part of the job, because a confident zero you did not verify is how settlement reports die in review.",
      tag: "joins",
    },
    {
      id: "paytm-t2",
      q: "The whale ladder runs 24, 17, 14, 13, 5 transactions, then FOUR accounts tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the winback pod's attention first. There is a second layer Paytm candidates get asked: the same tie problem shows up inside a running settlement walk — SUM OVER (ORDER BY paid_on) uses a default RANGE frame, so legs tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "paytm-t3",
      q: "The rails desk says 27 legs; finance says 22 statements. Why do the two numbers disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains of the same join. COUNT(*) counts settlement legs — one row per leg, so a statement settling in two legs contributes 2. COUNT(DISTINCT invoice_id) folds those legs back to statements — 27 legs collapse to 22, because exactly five statements (ids 1, 5, 12, 19, 22) settle in two legs. Neither is wrong: legs measure rail throughput, statements measure merchant coverage. Fold per statement before you sum dollars, or the 65,612.00 exact book reads 69,687.00 — a double-counted close. The same discipline runs the market census: EU's 45 transactions collapse to 8 wallet accounts, the US's 19 to 2, and the ratio — 5.6 transactions per account versus 9.5 — is the intensity signal. Saying 'one row per what?' for every COUNT is the habit the panel grades, and the split census is where it cashes out: a census that cannot say both grains out loud is the one that double-counts a statement during close.",
      tag: "aggregation",
    },
    {
      id: "paytm-t4",
      q: "shipped_at is NULL until a transaction's bank leg lands. What is your policy for the latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped transactions have a settlement cycle, so the report measures created-to-stamp for the 82 of 103 transactions that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL transactions returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 failed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlement for transactions still awaiting their payer, and it poisons the 2.98 baseline every drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Paytm reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "paytm-t5",
      q: "The board wants wallet-rail dollars per market for markets carrying at least five settlement legs. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The rail rule is a row-level fact — it lives inside a CASE arm (method = 'card' routes the leg's paise to the wallet column), because rail is an attribute of a leg, not of a market. The five-leg floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a close-pack line and an error. One more placement rule the screens love: the percentage — 100.0 * SUM(CASE WHEN method = 'card' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the wallet share truncates toward zero; on this db it is the difference between 59.3 and a displayed 0. The strong answer places every filter by asking: is this a fact about one leg, or about a market?",
      tag: "pipeline",
    },
    {
      id: "paytm-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 transactions always produce a mean (6.4375 transactions per account, 6.44 rounded — exactly four accounts clear it). On filtered staging tables — one market, one rail, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each transaction to ITS market's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a market's staging slice is empty — which is LATAM's permanent state on this book. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "paytm-t7",
      q: "The volume trend buckets transactions by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the volume trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's transactions, and month-end is exactly when bill-pay batches land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is volume discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "paytm-t8",
      q: "Finance says a merchant statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER paise, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats paise on every odd-paise row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "paytm-t9",
      q: "The two-grain market census shows EU at 45 transactions from 8 accounts. Walk me through the query that prints both grains side by side — and why folding to the wrong grain sinks it.",
      a: "One scan, two aggregates: SELECT c.region, COUNT(*) AS transactions, COUNT(DISTINCT o.customer_id) AS accounts FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region. COUNT(*) measures load — 45 for EU; COUNT(DISTINCT) measures coverage — 8 accounts — and the ratio 5.6 per account is the intensity read that decides where acquiring pushes next. The fold must happen at market grain: GROUP BY o.customer_id instead gives one row per wallet account and the census becomes a leaderboard wearing a market report's name. The US row is the punchline the panel waits for: 19 transactions from just 2 accounts — 9.5 per account, the densest book on the platform despite being the smallest by rows. Say 'one row per what?' before writing the GROUP BY; that sentence is the whole answer.",
      tag: "groupby",
    },
    {
      id: "paytm-t10",
      q: "The board packet stacks this quarter's wallet legs on last quarter's. UNION or UNION ALL — and what is the correctness argument you owe the reviewer?",
      a: "UNION ALL by default, with the argument written down. UNION dedups whole rows silently, and a board stack is exactly where two branches can emit byte-identical rows — same market, same counts, no rail label — collapsing into one row with no error anywhere; a market vanishes from the packet and nobody learns why. The rule on this desk: UNION ALL plus a comment stating WHY duplicates are impossible — the branches partition by quarter, so identical rows cannot exist by construction. Reach for bare UNION only when dedup is the requirement itself — say, collapsing a two-sided stack where the same settlement leg legitimately appears in both branches — and say that out loud too. The reviewer is not grading the keyword; they are grading whether you know which query shape can lose a row.",
      tag: "sets",
    },
    {
      id: "paytm-t11",
      q: "A staging query filters WHERE method = 'WIRE' and returns zero legs. The rails desk insists the bank/UPI rail exists. What is going on?",
      a: "Case sensitivity. SQLite compares strings with = byte-by-byte — there is no default collation folding case — and the payments.method column stores lowercase literals: 'card' and 'wire'. 'WIRE' matches nothing, the filter empties, and the report reads a 100% wallet book, which is a data defect wearing a query's clothes. The same trap hides inside IN lists ('CARD', 'WIRE') and inside CASE arms — an arm keyed on 'Wire' is dead code that silently routes every bank/UPI leg to the ELSE branch. LIKE, by contrast, IS case-insensitive for ASCII by default, so status LIKE 'DELIVERED' matches 'delivered' — which makes 'the LIKE fixed it' its own bug, because the two predicates disagree about case. The discipline: normalize once (LOWER(method) = 'wire' or a data contract on literals), then use exact lowercase everywhere and prove the census still foots to 27 legs.",
      tag: "casing",
    },
    {
      id: "paytm-t12",
      q: "Invoices carry numbers like 'INV-2024-001'. The close pack needs the issue year beside every statement. How do you extract it, and what does the edge case look like?",
      a: "SUBSTR(i.number, 5, 4) — characters 5 through 8 hold the year in this format — and CAST it to integer if arithmetic follows: CAST(SUBSTR(i.number, 5, 4) AS INTEGER) = 2024. The format contract is doing real work here: the prefix 'INV-' is fixed width, so a positional slice is honest; the moment the contract changes ('INV2024-1', a two-letter prefix), the slice reads garbage with no error, which is why a sanity check — every row matching number LIKE 'INV-____-%' — belongs in the same query. The string-built alternative INSTR(i.number, '-') finds the first dash and generalizes across prefix widths, at the cost of being harder to read at review. Whatever you pick, the interview point is the same: text slicing is only as safe as the format contract, and stating the contract is part of the answer.",
      tag: "strings",
    },
    {
      id: "paytm-t13",
      q: "The dunning anti-join over invoices and payments runs at the top of every close. How do you make it fast, and what does the index buy you?",
      a: "The query shape is invoices LEFT JOIN payments ON p.invoice_id = i.id WHERE p.id IS NULL — an anti-join at statement grain. The index that matters is payments(invoice_id): each invoice probes the leg table through it instead of scanning 27 legs per statement, and because the probe reads only invoice_id and the row id, the index nearly covers the whole join. On this db the tables are small enough that EXPLAIN QUERY PLAN shows a scan either way — the interview answer is about the SHAPE, not the speedup: a LEFT JOIN whose WHERE clause only tests p.id IS NULL is the canonical anti-join, it cannot be rewritten as INNER without losing the answer, and NOT IN is the wrong twin because one NULL invoice_id empties the queue. Name the index, name the plan you expect (SCAN invoices; SEARCH payments USING INDEX), and the panel hears an engineer, not a guesser.",
      tag: "indexes",
    },
    {
      id: "paytm-t14",
      q: "The dunning email needs all six legless statement numbers in one cell. How do you fold rows into a string — and what ordering trap rides along?",
      a: "GROUP_CONCAT: GROUP_CONCAT(i.number) over the anti-join collapses the six rows into 'INV-2024-011,INV-2024-021,…'. Two controls belong in the call. Order: without an ORDER BY inside the aggregate (SQLite supports GROUP_CONCAT(i.number ORDER BY i.number)), the list order is whatever the scan produced — the email reads fine today and shuffles after a vacuum; pin it. Separator: the default is a bare comma; GROUP_CONCAT(i.number, ', ') is the readable form. The deeper trap is grouping grain — GROUP_CONCAT outside a GROUP BY folds the whole result set, so pairing it with c.region silently produces one list per market, which is usually the intent but must be said. And remember the fold is lossy: you cannot un-concatenate a cell back into rows, so it belongs on the presentation edge of the report, never in the reconciliation layer where the census still counts six.",
      tag: "groupby",
    },
    {
      id: "paytm-t15",
      q: "The merchant-facing ledger walks settlement legs in paid order per statement. What does PARTITION BY buy that a bare OVER cannot — and what does the wrong frame do?",
      a: "PARTITION BY invoice_id resets the walk: SUM(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on) restarts the cumulative at every statement, which is what the merchant sees — their balance, not the platform's. Drop the partition and the same expression runs one cumulative across all 27 legs, so statement 12's row prints a number that mixes in statement 1's paise — a plausible-looking total that reconciles to nothing. The frame rides the same choice: ORDER BY inside OVER defaults to RANGE, so two legs sharing a paid_on second enter the running sum together — at leg grain that is common, and ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the strict per-leg walk if the balance must move one leg at a time. Say the partition, the order and the frame out loud; that triple IS the ledger's semantics.",
      tag: "windows",
    },
    {
      id: "paytm-t16",
      q: "Settlement latency is created_at to shipped_at in days. Walk me through the timestamp math and where TEXT columns try to hurt you.",
      a: "JULIANDAY(shipped_at) - JULIANDAY(created_at) gives fractional days — that is the honest spine, and ROUND(…, 2) is the display layer, never the storage layer. On this db the stamped population is 82 of 103 transactions averaging 2.98 days in a 2-to-4 spread; the 14 pending carry no stamp and stay out of the base by policy, which the report title says. The TEXT trap: these columns are ISO-8601 text, which compares correctly as strings — BETWEEN '2024-01-01' AND '2024-04-01' works — but any arithmetic needs JULIANDAY first, and a non-ISO format ('01/02/2024') would silently produce NULLs instead of errors. Subtracting the raw strings '2024-01-05' - '2024-01-02' evaluates to 3 by numeric coercion luck on some values and NULL on others — that is the answer to never give. Bucket by STRFTIME for the spine, measure by JULIANDAY for the clock, and never mix the two in one expression.",
      tag: "dates",
    },
    {
      id: "paytm-t17",
      q: "Some expense rows arrive with a NULL category, and the cashback board's category breakdown no longer foots to the total. What is your policy?",
      a: "Diagnose before you launder. The breakdown foots wrong because SUM per category skips NULL-category rows — every aggregate ignores them — so the categories sum to less than COUNT(*) proves exists. The wrong fix is COALESCE(category, 'Other') inside the report: it makes the numbers foot by inventing a bucket, and the invented bucket is indistinguishable from a real one downstream. The right fix is explicit: report the NULL bucket as its own row — either by grouping on COALESCE(category, 'unclassified') with the label saying so, or by printing category beside COUNT(*) FILTER (WHERE category IS NULL). On this book the categories are Rent, Ads, Travel and Tools (16,800 / 4,570 / 2,521 / 1,525 — 25,416 total); if a NULL-category row appeared, the board wants to see 'unclassified — 1 row', not a rent number that quietly absorbed it. Policy: NULLs get names, never free rides into someone else's bucket.",
      tag: "nulls",
    },
    {
      id: "paytm-t18",
      q: "Which billers (suppliers) have never received a settlement leg? Compare EXISTS, IN and the LEFT JOIN anti-join — which do you ship and why?",
      a: "All three can answer; only two survive contact with NULLs. The LEFT JOIN … IS NULL anti-join is the desk standard — it is the same shape as the dunning queue, plan-friendly, and immune to NULLs in the join key. EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) short-circuits on the first match and reads like the business question, which makes it the best code-review citizen. NOT IN (SELECT invoice_id FROM payments) is the trap: if one leg ever carries a NULL invoice_id, every comparison turns UNKNOWN and the 'billers with no legs' list silently empties — on this db the honest answer is a confident zero across all six partners, and a NOT IN that returns zero because of NULL poisoning is indistinguishable from a zero that is true. Ship the anti-join or EXISTS, state the NULL story unprompted, and prove the zero rather than asserting it.",
      tag: "subqueries",
    },
    {
      id: "paytm-t19",
      q: "The wallet rail's average leg is 2,335.25 and bank/UPI's is 2,931.64. Why is AVG(amount_cents)/100.0 not the same as SUM(amount_cents)/100.0/COUNT(*) — and which belongs on the scorecard?",
      a: "They differ only when the paise conversion happens at the wrong point. SUM(amount_cents)/100.0/COUNT(*) folds every leg's exact paise first, then divides — the true mean ticket, 2,335.25 on the wallet rail. AVG(amount_cents)/100.0 is the same mean here (AVG over paise, converted after), but AVG(amount_cents/100) would be broken twice over: the inner integer division truncates each leg's paise BEFORE averaging, so odd-paise legs lose up to 99 kopecks each and the mean drifts low. The general lesson the panel wants: convert once, at the outermost edge — fold in integer paise for exactness, divide by 100.0 exactly once for display. And the sibling trap is weighting: an average of per-day averages is not the same as the leg-weighted mean when days carry different leg counts; the scorecard always prints the leg-weighted one, and says so.",
      tag: "aggregation",
    },
    {
      id: "paytm-t20",
      q: "The growth pod wants wallet accounts whose transaction counts moved in the same months — pairs of accounts that both traded in a given month. What join shape answers that?",
      a: "A self-join over the (account, month) fold. Stage it first: WITH monthly AS (SELECT customer_id, STRFTIME('%Y-%m', created_at) AS month, COUNT(*) AS n FROM orders GROUP BY 1, 2). Then join monthly a JOIN monthly b ON a.month = b.month AND a.customer_id < b.customer_id — the strict less-than is the whole trick: it pairs each co-trading duo exactly once and blocks an account from pairing with itself. Without the inequality you get (a, b) and (b, a) twice plus (a, a) rows that inflate the pair census by construction. Fold the pairs with COUNT(DISTINCT a.month) to keep only duos that moved together in more than one month, and name the grain in the title — pairs-per-month, not transactions. Self-joins are where 'one row per what?' earns its keep, because every alias is a copy of the same table and the join keys decide whether you built pairs, mirrors or noise.",
      tag: "joins",
    },
    {
      id: "paytm-t21",
      q: "Close checklist item: prove no statement number is duplicated. Write the check and defend what an empty result means.",
      a: "GROUP BY the natural key and gate on the count: SELECT number, COUNT(*) FROM invoices GROUP BY number HAVING COUNT(*) > 1 — duplicates return rows, and a clean book returns zero rows. The interview point is that the empty result is the PASS, not a failure: an analyst who reads 'no output' as 'query broken' reruns it with the HAVING dropped and prints the whole book, which is the same data wearing a different shirt. To make the check audit-proof, pair it with the total — COUNT(*) = 28 statements scanned — so the packet proves the check ran over the full population, not an empty staging slice that vacuously passed. The same shape guards every natural key on this desk: invoice numbers, statement ids, ledger entry pairs. State the population, then let the zero be the finding.",
      tag: "quality",
    },
    {
      id: "paytm-t22",
      q: "ORDER BY rail_dollars DESC LIMIT 3 — what exactly does LIMIT cut, and why is the top-3 rails table not a guarantee?",
      a: "LIMIT runs last: after WHERE filtered rows, after GROUP BY folded them, after HAVING gated the groups, after ORDER BY ranked them — it truncates the final result set, nothing else. So LIMIT 3 on the rails scorecard prints the three biggest rails by settled dollars — wallet and bank/UPI both survive on two rails, and a third rail would be invisible. The guarantee-shaped trap: ties at the boundary. ORDER BY rail_dollars DESC with two rails at the same dollars and LIMIT 1 is nondeterministic — the engine returns one of them, a different one after a data reorder. If the cutoff must be defensible, add a deterministic tie-breaker (ORDER BY rail_dollars DESC, method) or use a window (RANK() OVER (ORDER BY rail_dollars DESC)) and keep every tied row. 'The query returned a different top-3 this morning' is a tie problem, not a mystery — and saying that sentence is the answer.",
      tag: "pipeline",
    },
    {
      id: "paytm-t23",
      q: "The ops board wants completed, settling, pending and failed counts in ONE scan. Show the FILTER form and the portable twin — and the identity that proves the scan is right.",
      a: "One pass, four branches: COUNT(*) FILTER (WHERE status = 'delivered'), the same FILTER for 'shipped', 'pending' and 'cancelled' — SQLite accepts FILTER on any aggregate and evaluates each branch per row, so the 103-row scan happens once. The portable twin is SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END), which any engine reads and which sums to the same 30. The correctness argument is the reconciliation identity: the branches must sum to COUNT(*) — 52 + 30 + 14 + 7 = 103 — and if a fifth status ever appears, the identity breaks loudly instead of silently undercounting, which is exactly what you want from a census. What you do not do is run four sequential queries with four WHERE clauses: four scans, four chances for the status list to drift, and no identity to catch it. One scan, one COUNT(*), branches that must foot — that is the whole pattern.",
      tag: "groupby",
    },
    {
      id: "paytm-t24",
      q: "The growth board wants each market's share of settled dollars as a column beside the dollars. Build it with a window — and defend why not with a self-join.",
      a: "Percent of total is a window one-liner: 100.0 * SUM(amount_cents) OVER () / SUM(amount_cents) OVER (PARTITION BY c.region) beside the per-region fold — OVER () is the grand total, OVER (PARTITION BY …) the local one, and the ratio is the share with no second pass over the table. The 100.0 sits before the division for the same integer-truncation reason it always does here. A self-join answer — join the market fold back to a cross-joined grand total — works but costs a second aggregation and reads like two queries stapled together; the reviewer asks why the scan happened twice. The subtlety worth naming: OVER () runs AFTER grouping in a grouped query, so the shares are exact at market grain; mixing a window with a GROUP BY is one of the few places window functions and aggregates compose cleanly. Shares that must reconcile: 19,124.50 + 18,136.50 + 6,501.50 + 14,111.50 + 11,738.00 over EU/APAC/US — the denominators are stated, so every share is auditable.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "paytm-mcq-1",
      prompt: "A settlement leg's method reads 'wire'. On this kit's rail map, where did the consumer's money come from?",
      choices: ["Straight from the bank account over UPI — the bank/UPI settlement rail", "From the Paytm Wallet — the wallet top-up rail", "From a credit line repaid the following month", "Cash the merchant collected and deposited"],
      answer: 0,
      why: "The rail map is fixed: wire = bank/UPI settlement (11 legs / 32,248.00); card = wallet top-ups (16 legs / 37,364.00). A wire leg means the money never touched the wallet float.",
      notes: [
        { choice: 1, why: "Wallet money rides card legs — the 16-leg rail. Calling wire 'wallet' double-credits the wallet rail and erases the UPI story the roadmap is judged on." },
        { choice: 2, why: "Credit lines are not on this rail map — payments.method carries exactly two values, card and wire. Inventing a third rail is how a census stops footing to 27." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-2",
      prompt: "The rails census counts 27 settlement legs. How many distinct merchant statements do they settle?",
      choices: ["22 — five statements settle in two legs", "27 — one leg per statement", "28 — every statement carries a leg", "5 — only the split ones do"],
      answer: 0,
      why: "COUNT(*) says legs (27); COUNT(DISTINCT invoice_id) says statements (22). The gap is exactly the five split statements — ids 1, 5, 12, 19, 22 — each settled by two legs.",
      notes: [
        { choice: 1, why: "One-leg-per-statement is the assumption that double-counts the split statements at close — the 65,612.00 exact book would read 69,687.00." },
        { choice: 2, why: "28 is the statement book, but six statements carry no legs at all (15,217.00) — 28 minus 6 leaves 22 settled." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-3",
      prompt: "A wallet transaction's status reads 'shipped'. In this kit's stage map, what happened?",
      choices: ["The bank leg is in flight — money settling, not yet completed", "Completed and fully settled", "Failed and reversed", "Initiated, waiting on the payer"],
      answer: 0,
      why: "The stage map is fixed: shipped = bank leg settling (30 of 103 transactions), with shipped_at as the settlement stamp. It is stamped and moving — but not a completed transaction.",
      notes: [
        { choice: 1, why: "Completed is 'delivered' — 52 transactions. Calling settling transactions complete inflates the settled base before a single leg lands." },
        { choice: 3, why: "Waiting-on-the-payer is 'pending' — 14 transactions with no stamp yet. Pending is not settling and not failure; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN method = 'card' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters the census to wallet legs only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the wallet share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 59.3 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 16/27 to 0 first, then scales — the rail-mix map reads zero everywhere, including EU's 14 legs." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-5",
      prompt: "Keep only markets carrying at least 8 settlement legs. Where does the bar live?",
      choices: ["WHERE COUNT(*) >= 8, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 8", "WHERE legs >= 8 on the raw payments table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A leg-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (14 legs) and APAC (8) clear an 8-leg bar; the US at 5 does not.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'legs' column on the raw payments table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-6",
      prompt: "The close pack prints '22 statements settled'. A reviewer objects that the payments table holds 27 rows. Who is right?",
      choices: ["The reviewer — the pack undercounts settlement activity", "The pack — 27 legs fold onto 22 statements because five settle in two legs; the fold is per statement, not per leg", "Both — the pack should print 27", "Neither — the book holds 28 statements"],
      answer: 1,
      why: "The pack counts at statement grain: 27 legs fold to 22 distinct invoice_ids because ids 1, 5, 12, 19, 22 settle in two legs. Both numbers are true; they answer different questions.",
      notes: [
        { choice: 0, why: "Counting per leg double-counts every split statement — the exact book 65,612.00 becomes 69,687.00 and the coverage census stops footing." },
        { choice: 3, why: "28 is the full statement book, and 6 of them carry no legs at all (15,217.00) — 'settled' statements are 22, not 28." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-7",
      prompt: "The US close row reads wallet 11,738.00 and bank/UPI 0.00. Which fold produced that 0.00?",
      choices: ["No wire legs exist for US statements — the CASE arm summed an arm whose every row contributes 0", "A COALESCE turned missing legs into zeros", "Wire legs exist but were cancelled", "The wire column was divided by zero"],
      answer: 0,
      why: "All 5 US legs ride the card rail. SUM(CASE WHEN method = 'wire' THEN amount_cents ELSE 0 END) sums 5 rows of ELSE-0 contributions — a real 0, not a NULL artifact.",
      notes: [
        { choice: 1, why: "COALESCE never touches this fold — the ELSE 0 arm already guarantees the empty rail sums to a genuine 0. Reaching for COALESCE here is a tell, not a fix." },
        { choice: 2, why: "Cancellation status lives on transactions, not on settlement legs — a landed leg does not carry a cancelled flag. The 0.00 is absence of legs, not presence of failure." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-8",
      prompt: "A staging-table dunning list uses statement_id NOT IN (SELECT invoice_id FROM payments) and returns ZERO rows. First suspicion?",
      choices: ["Every statement has a leg — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole list silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the list empties while looking valid. Policy: NOT EXISTS or a LEFT JOIN … IS NULL for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero here contradicts the probed dunning queue — the honest core-db read is 6 legless statements worth 15,217.00. A zero that contradicts a known census is the bug waving at you." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-9",
      prompt: "A board stack UNIONs the wallet-rail branch onto the bank/UPI branch. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION dedups whole rows silently — two branches printing byte-identical rows (same market, same counts) collapse into one", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table", "The branches need the same column names or UNION fails"],
      answer: 0,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no rail label — collapse into one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 1, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
        { choice: 3, why: "Column names bind by position, not by name — mismatched aliases stack fine. The vanishing row is a dedup event, not a schema complaint." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-10",
      prompt: "The settlement walk runs SUM(amount_cents) OVER (ORDER BY paid_on). Two legs share a paid_on second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on paid_on join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous leg's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-11",
      prompt: "A draft scorecard computes the wallet rail's average leg as SUM(amount_cents) / COUNT(*) / 100. It prints 2,335. The rails desk says the number is 2,335.25. What bit them?",
      choices: ["Integer division — SUM/COUNT is INTEGER over INTEGER, so the paise were truncated before the /100 ever ran", "Floating-point rounding error in the SUM", "The COUNT(*) double-counted split statements", "amount_cents stores dollars, not paise"],
      answer: 0,
      why: "SUM(amount_cents) and COUNT(*) are both integers in SQLite, so the first division truncates — the wallet rail's 3,736,400 paise over 16 legs gives 233,525 exactly, and 233,525 / 100 as integers reads 2,335, eating the 25 paise. The fix is dividing by 100.0 (or multiplying by 1.0) before the truncation can happen.",
      notes: [
        { choice: 2, why: "Split statements change per-statement folds, not a per-leg average — COUNT(*) here counts legs on purpose, and the average is per leg." },
        { choice: 3, why: "The finance tables store INTEGER paise by contract; assuming dollars is how a 1,756.00 statement prints as 175,600." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-12",
      prompt: "A volume trend buckets transactions with STRFTIME('%m', created_at). The analyst expects a 14-month spine but gets 12 buckets. Why?",
      choices: ["'%m' emits the month only — January 2024 and January 2025 collapse into one bucket", "STRFTIME drops months with no transactions", "The data only covers 12 months", "'%m' must be uppercase to include the year"],
      answer: 0,
      why: "The spine needs year AND month — STRFTIME('%Y-%m', created_at) — because '%m' alone merges every January into one bucket and the 2024-01 to 2025-02 window reads as a 12-point loop. Zero-padding is the second half of the fix: without it, '2024-10' sorts before '2024-2'.",
      notes: [
        { choice: 1, why: "STRFTIME buckets whatever rows the GROUP BY receives — empty months are absent from the spine, but this db has all 14 present once grouped correctly." },
        { choice: 2, why: "The orders table spans 2024-01 through 2025-02 — 14 distinct year-months. The collapse is a format-string bug, not a data gap." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-13",
      prompt: "A Q1 transaction pull uses created_at BETWEEN '2024-01-01' AND '2024-03-31'. The close counts one transaction short versus the monthly spine. What happened?",
      choices: ["BETWEEN on TEXT timestamps includes '2024-03-31' at midnight only — the last night's transactions are dropped", "The spine double-counts March", "BETWEEN cannot compare TEXT dates", "The spine counts cancelled transactions, BETWEEN does not"],
      answer: 0,
      why: "created_at is ISO text with a time component, so '2024-03-31' as a literal means midnight at the start of that day — every transaction stamped later that night falls outside the BETWEEN. The fix is the half-open window: created_at >= '2024-01-01' AND created_at < '2024-04-01'.",
      notes: [
        { choice: 3, why: "Both queries read the same status column — the discrepancy is a boundary artifact, and blaming the fate census is how the real bug survives review." },
        { choice: 2, why: "ISO-8601 text compares correctly with BETWEEN precisely because zero-padded fields sort lexicographically — the failure is the endpoint, not the comparison." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-14",
      prompt: "The month walk computes volume - LAG(volume) OVER (ORDER BY month) AS delta. What does the 2024-01 row print in the delta column?",
      choices: ["NULL — there is no prior month, and the baseline is not a zero", "0 — the delta defaults to zero", "3,731.97 — the opening volume", "The query errors on the first row"],
      answer: 0,
      why: "LAG reads the previous row's value, and the first row has none — the delta is NULL by definition. The desk policy: label it 'baseline' or leave the NULL, never COALESCE it to zero, which reads as a flat month and poisons every downstream average of deltas.",
      notes: [
        { choice: 1, why: "COALESCE(delta, 0) is the exact laundering the panel hunts — a zero delta means 'no movement', and the opening month has no prior to move from." },
        { choice: 2, why: "That is the volume column's job. Printing the level in the delta column double-reports the open and breaks the column's meaning." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-15",
      prompt: "On the orders table, COUNT(shipped_at) reads 82 and COUNT(*) reads 103. What is the 21-row gap?",
      choices: ["The 14 pending plus 7 failed-or-reversed transactions — no stamp until the bank leg lands", "21 duplicated transactions", "21 transactions still inside the payer window", "Rows where shipped_at equals created_at"],
      answer: 0,
      why: "COUNT(shipped_at) counts non-NULL stamps only: the 52 delivered plus 30 shipped transactions carry stamps, the 14 pending (initiated, awaiting the payer) and 7 cancelled (failed or reversed) do not. 103 minus 82 is 21 — the unstamped population, which is a definition of the latency base, not a cleanup job.",
      notes: [
        { choice: 2, why: "The payer window is why pending rows exist, but cancelled rows are outside it entirely — the gap is 'no stamp', and only the status split says why." },
        { choice: 3, why: "A stamped row with shipped_at = created_at still counts in both — same-day settlement is a latency fact, not a count gap." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-16",
      prompt: "RANK() OVER (ORDER BY COUNT(*) DESC) runs over the whale ladder: 24, 17, 14, 13, 5, then FOUR accounts tie at 4, then two at 3. What rank do the 3-transaction accounts get?",
      choices: ["10 — the tie block consumes ranks 6-9 and RANK skips", "7 — ties share a rung and counting continues without gaps", "6 — all accounts at or below the tie share its rank", "11 — the engine counts every row including ties"],
      answer: 0,
      why: "RANK gives the tied 4-transaction accounts rank 6 each, consumes positions 6 through 9, and hands the next distinct count rank 10 — the gaps are the policy, not a bug. DENSE_RANK would hand the 3s rank 7; ROW_NUMBER would split the tie block 6,7,8,9 arbitrarily.",
      notes: [
        { choice: 1, why: "That is DENSE_RANK's contract — shared rungs, no gaps. Quoting it for RANK misprices every rank after the tie block." },
        { choice: 2, why: "RANK never demotes later rows to the tie's rank — only the tied rows share it. The 5-transaction account stays at rank 5, alone." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-17",
      prompt: "The dunning queue is invoices LEFT JOIN payments ON p.invoice_id = i.id WHERE p.id IS NULL. What does it return on this db?",
      choices: ["6 statements worth 15,217.00 — the statements with zero settlement legs", "0 rows — every statement has a leg", "27 rows — one per leg", "21 statements worth 65,612.00"],
      answer: 0,
      why: "The anti-join keeps statement rows with no matching leg: six of them — four in the EU (873.00, 1,295.00, 3,562.00, 2,794.00), the US's 4,937.00, and APAC's #28 at 1,756.00, the paid-status lie. 8,524.00 + 4,937.00 + 1,756.00 = 15,217.00.",
      notes: [
        { choice: 1, why: "A confident zero contradicts the probed census — 22 of 28 statements carry legs, six do not. Proving the zero instead of asserting it is the job." },
        { choice: 3, why: "21 exact / 65,612.00 is the EXACT-coverage bucket — statements with legs matching their value, the opposite population of the anti-join." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-18",
      prompt: "The cashback board buckets expenses by category. On this book, which category carries the largest spend, and what share of the 25,416.00 total is it?",
      choices: ["Rent — 16,800.00, about 66% of the book", "Ads — 4,570.00, about 18%", "Travel — 2,521.00, about 10%", "Tools — 1,525.00, about 6%"],
      answer: 0,
      why: "Rent dominates: 14 expense rows worth 16,800.00 of 25,416.00 total — 66.1%. Ads follows at 4,570.00 (18.0%), Travel 2,521.00 (9.9%), Tools 1,525.00 (6.0%). The share math is the interview: 100.0 * SUM(amount_cents) / SUM(amount_cents) OVER () — the .0 guard riding along.",
      notes: [
        { choice: 1, why: "Ads is the biggest VOLUME-after-Rent story and the natural place to cut budget — quoting it as the largest category confuses 'second' with 'first'." },
        { choice: 2, why: "Travel carries only 3 rows but fat ones — a per-row average read, not a share read. The board quotes shares of the total." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-19",
      prompt: "The coverage census CASE classifies each statement: legs match total → 'exact', legs cover part → 'partial', zero legs → 'none'. Where does statement #28 land, and why is that the finding?",
      choices: ["'none' — it has zero legs despite reading 'paid'; the status column lies", "'exact' — the status column says paid", "'partial' — some legs exist", "It is excluded — cancelled statements leave the census"],
      answer: 0,
      why: "#28 carries 1,756.00 of claimed value, a 'paid' status, and zero settlement legs — the anti-join catches it in the 'none' bucket because the census classifies by LEGS, not by the status claim. That mismatch (paid with nothing behind it) is the data-quality finding the census exists to surface.",
      notes: [
        { choice: 1, why: "Trust the ledger of record, not the claim — 'paid' with no legs is precisely the row the census must NOT wave through as exact." },
        { choice: 3, why: "#28 is not void or cancelled — it is active and unpaid. Excluding it hides the anomaly instead of surfacing it." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-20",
      prompt: "The dunning email must print all legless statement numbers as one cell, ordered. Which expression does it?",
      choices: ["GROUP_CONCAT(i.number ORDER BY i.number) — ordered fold to one string", "CONCAT(i.number) — concatenates the group", "STRING_AGG(i.number) — SQLite's ordered aggregate", "GROUP_CONCAT ordered by the outer ORDER BY"],
      answer: 0,
      why: "GROUP_CONCAT folds rows to one string and takes an ORDER BY inside the aggregate to pin the list order — without it, the order is whatever the scan produced and reshuffles after maintenance. The separator defaults to a comma; a second argument sets a readable ', '.",
      notes: [
        { choice: 1, why: "CONCAT is a scalar function — it joins its arguments per row and ignores grouping entirely; six rows in, six rows out." },
        { choice: 3, why: "The outer ORDER BY orders result rows, not the values inside a folded cell — the list can still print shuffled within each row." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-21",
      prompt: "The close runs SELECT SUM(CASE WHEN side='debit' THEN amount ELSE 0 END) - SUM(CASE WHEN side='credit' THEN amount ELSE 0 END) AS delta FROM ledger_entries GROUP BY ledger_id HAVING delta <> 0. The result is ZERO rows. The junior analyst calls the query broken. What is the truth?",
      choices: ["The book balances — 181,080 debits against 181,080 credits — and an empty result IS the pass", "The GROUP BY swallowed the rows", "delta <> 0 filters out all legitimate entries", "The query needs COUNT(*) instead of SUM"],
      answer: 0,
      why: "The check returns rows only for ledgers that FAIL to balance. Zero rows means every ledger's debits and credits reconcile — on this book, 181,080 against 181,080, delta zero. Reading emptiness as failure is the classic error; the empty result is the close shipping.",
      notes: [
        { choice: 2, why: "delta <> 0 keeps exactly the anomalies and nothing else — that is the design. 'Legitimate entries' balance to zero by construction and must be filtered out." },
        { choice: 3, why: "COUNT(*) proves rows exist, not that money reconciles — pairing the check with a total (28 statements scanned) is good practice, but the pass signal is the empty delta set." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-22",
      prompt: "Why does the one-pass fate census prefer COUNT(*) FILTER (WHERE status = 'shipped') over four sequential queries with four WHERE clauses?",
      choices: ["One scan, four branches — and the branches must sum to COUNT(*), which is a built-in reconciliation check", "FILTER is faster because it skips NULLs", "Four queries would exceed the connection limit", "FILTER auto-deduplicates the statuses"],
      answer: 0,
      why: "FILTER (WHERE …) evaluates each aggregate per row over one 103-row scan: 52, 30, 14, 7 — and the reconciliation identity (52+30+14+7 = 103 = COUNT(*)) catches any fifth status the day it appears. Four sequential queries are four scans, four chances for the status list to drift, and no identity to catch it. SUM(CASE …) is the portable twin when an engine lacks FILTER.",
      notes: [
        { choice: 1, why: "Aggregate performance is the footnote, not the argument — the census exists so the branches FOOT. A faster wrong census is still wrong." },
        { choice: 3, why: "FILTER neither dedups nor changes NULL semantics — it is a per-aggregate WHERE. Dedup is DISTINCT's job and never belongs in a fate census." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-23",
      prompt: "WHERE total > (SELECT COUNT(*) * 1.0 / COUNT(DISTINCT customer_id) FROM orders) — how many wallet accounts clear the platform's mean cadence on this db?",
      choices: ["4 — the accounts at 24, 17, 14 and 13 transactions", "8 — every account above 8 transactions", "6 — the accounts at 6.44 or better", "12 — all but the dormant accounts"],
      answer: 0,
      why: "The mean is 103 transactions over 16 accounts = 6.4375 (6.44 rounded), and exactly four accounts exceed it: 24, 17, 14 and 13 transactions. The scalar subquery returns one number, the comparison is row-level, and the fold must multiply by 1.0 or the integer division reads 6 and changes the boundary.",
      notes: [
        { choice: 2, why: "The mean is 6.44 and no account trades exactly at it — '6.44 or better' sounds like the bar but 6.44 itself clears nothing; the honest cut is strictly greater, and the count is four." },
        { choice: 3, why: "'Above the mean' is a statistical statement, not a dormancy screen — the mean sits far above the dormant accounts, so the filter excludes the middle of the ladder too." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-24",
      prompt: "A CASE arm keyed WHEN method = 'WIRE' routes zero dollars into the bank/UPI column, and the pivot still runs. What is the defect class?",
      choices: ["Case-sensitive literal mismatch — SQLite's = compares bytes, 'WIRE' never equals stored 'wire', and the arm silently sums ELSE-branch zeros", "The column is collated as BINARY and must be cast", "WIRE is a reserved keyword needing quotes", "The arm order reordered the buckets"],
      answer: 0,
      why: "The pivot does not error — that is what makes it dangerous. 'WIRE' matches none of the 11 wire legs, every row takes the ELSE arm, and the bank/UPI column prints a real-looking 0.00 for every market while the wallet column absorbs nothing extra. The census still foots (the ELSE zeros sum to the same total), so only a cross-check — the bank/UPI column reconciling to 32,248.00 — catches it.",
      notes: [
        { choice: 1, why: "No cast exists that fixes a literal mismatch — LOWER(method) = 'wire' would, but that is normalization, not casting, and the defect is the data contract on literals." },
        { choice: 3, why: "Arm order re-buckets when predicates overlap — a real trap, but here the arm matches nothing at all, which is a different failure with the same symptom: a silent zero." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-25",
      prompt: "The merchant ledger runs SUM(amount_cents) OVER (ORDER BY paid_on) WITHOUT PARTITION BY invoice_id. Statement 12's fourth row prints a balance of 400,000+. What went wrong?",
      choices: ["Without the partition, one cumulative runs across ALL 27 legs — each statement's balance is polluted by every prior statement's paise", "The ORDER BY needs DESC", "The frame must be ROWS, not RANGE", "paid_on ties double-count legs"],
      answer: 0,
      why: "PARTITION BY invoice_id is what restarts the walk per statement; drop it and the window runs one global cumulative, so statement 12's balance includes statements 1-11's money. The frame and the tie behavior are real refinements, but neither fixes a missing partition — the walk is answering the wrong question entirely.",
      notes: [
        { choice: 2, why: "ROWS vs RANGE changes tie granularity at leg level — a second-order concern that cannot restore per-statement reset. Partition first, frame second." },
        { choice: 3, why: "RANGE frames absorb tied paid_on legs together — a deliberate semantic here, and still per-partition. The 400,000+ number is cross-statement pollution." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-26",
      prompt: "A junior joins legs to statements ON p.id = i.id. The EU wallet column reads 20,879.50 instead of 19,124.50. What is the diagnosis?",
      choices: ["The join paired legs to the WRONG statements — the key is p.invoice_id = i.id; p.id = i.id pairs leg #7 with statement #7, an id coincidence", "The EU legs were double-counted", "The CASE arm's ELSE branch leaked", "The 100.0 divider truncated the figure"],
      answer: 0,
      why: "The id-coincidence join is the canonical grain bug on this schema: payments.id and invoices.id are both surrogate keys, so p.id = i.id executes happily and pairs leg 7 with statement 7 whether or not leg 7 settled statement 7. The correct key rides the relationship — p.invoice_id = i.id — and the shifted figures (20,879.50 vs 19,124.50) are the smell.",
      notes: [
        { choice: 1, why: "Nothing double-counts — each leg pairs with exactly one wrong statement. The total can even stay close while every merchant's attribution is wrong." },
        { choice: 2, why: "The ELSE branch zeroes non-matching arms by design; a leak would show as zeros turning positive, not as a modestly shifted total." },
      ],
      difficulty: "medium",
    },
    {
      id: "paytm-mcq-27",
      prompt: "The US market: 19 transactions from 2 wallet accounts. The EU: 45 from 8. Which market is more intense per account, and by how much?",
      choices: ["The US — 9.5 per account against the EU's 5.6", "The EU — 45 transactions beats 19", "Tied — both average about 6", "Cannot say without revenue figures"],
      answer: 0,
      why: "Intensity is transactions per account: 19/2 = 9.5 versus 45/8 = 5.6. The EU carries more load; the US carries more intensity — the smallest book by rows is the densest by behavior, which is the two-grain census teaching its lesson: COUNT(*) and COUNT(DISTINCT) answer different questions, and the ratio is the acquisition signal.",
      notes: [
        { choice: 1, why: "Raw load is the first grain, not the ratio — quoting 45 versus 19 without the account denominator is exactly the fold the census exists to prevent." },
        { choice: 3, why: "Intensity is a count ratio; revenue weighting is a different read. The question as asked is fully answerable from the two counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-28",
      prompt: "Which statements settled ONLY on the bank/UPI rail? The desk writes: SELECT invoice_id FROM payments WHERE method = 'wire' EXCEPT SELECT invoice_id FROM payments WHERE method = 'card'. What does the result set contain?",
      choices: ["Statements with wire legs and zero card legs — pure bank/UPI settlement", "All statements that have any wire leg", "Statements with no legs at all", "Statements whose wire dollars exceed their card dollars"],
      answer: 0,
      why: "EXCEPT keeps left-set rows absent from the right set: wire-leg statements minus card-leg statements = statements that never rode the wallet rail. The five split statements (ids 1, 5, 12, 19, 22) are exactly the rows the right side removes — they rode BOTH rails, which is what hybrid settlement means.",
      notes: [
        { choice: 1, why: "That is the left query alone, not the EXCEPT — the set difference exists to subtract the hybrid statements that the plain wire filter would keep." },
        { choice: 2, why: "Legless statements appear in NEITHER set — the anti-join (LEFT JOIN … IS NULL) is the tool for that population, and the two queries must never be conflated." },
      ],
      difficulty: "hard",
    },
    {
      id: "paytm-mcq-29",
      prompt: "New hire question, first week: which join key attaches a settlement leg to the merchant statement it paid?",
      choices: ["p.invoice_id = i.id — the leg carries its statement's id", "p.id = i.id — both tables have id columns", "p.paid_on = i.issued_on — dates pair naturally", "No key exists — legs and statements are unrelated grains"],
      answer: 0,
      why: "payments.invoice_id is the foreign key to invoices.id — that IS the relationship. The id-coincidence join (p.id = i.id) executes and misattributes money; the date join pairs a leg with whatever statement issued that day. Grain discipline starts with knowing the key.",
      notes: [
        { choice: 1, why: "Both tables' surrogate ids collide numerically — that is why the coincidence join runs without error and why it is the most expensive silent bug on this schema." },
        { choice: 2, why: "A leg can settle days after the statement issues; date equality pairs a subset by luck and leaves the rest NULL. Dates are stamps, never keys." },
      ],
      difficulty: "easy",
    },
    {
      id: "paytm-mcq-30",
      prompt: "The winback pod takes the top 9 accounts by transaction count. Four accounts tie at 4 transactions and LIMIT 9 cuts inside the tie block. What makes the cut defensible?",
      choices: ["A named deterministic tie-breaker — ORDER BY COUNT(*) DESC, lifetime DESC, id — written into the query and the deck", "LIMIT is deterministic — same data, same rows", "RANK() with the tie block sharing rank 6 fixes it", "Increasing LIMIT to 10 removes the ambiguity"],
      answer: 0,
      why: "The engine may return tie-block rows in any order, so LIMIT 9 keeps an arbitrary three of the four tied accounts unless a tie-breaker is stated. The policy answer: name the secondary sort (lifetime, then id) so the same data always yields the same pod — and the deck carries the policy, not just the rows. RANK surfaces the tie but keeps all four rows; a bigger LIMIT just moves the arbitrary cut.",
      notes: [
        { choice: 1, why: "ORDER BY on tied keys gives NO ordering guarantee among the tied rows — same data can legally reorder after a plan change or vacuum, silently swapping who gets the winback." },
        { choice: 2, why: "RANK keeps every tied row — no LIMIT cut, no pod — which is a different report. It labels the tie honestly but does not choose the nine." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-paytm-1",
      tier: "easy",
      topic: "l7",
      universe: "growth",
      title: "The settlement-rail scorecard",
      brief:
        "Paytm-flavored brief on the storefront db: the growth board opens with the settlement-rail scorecard — how QR money moves. Card legs are wallet-rail settlement (the consumer paid from Paytm Wallet); wire legs are bank/UPI settlement (straight from the bank account). Probed facts: 27 legs settle 22 merchant statements; the wallet rail runs 16 legs for 37,364.00 (2,335.25 average leg), the bank/UPI rail 11 legs for 32,248.00 (2,931.64 average). The scorecard keeps rails carrying at least 11 legs — a materiality bar both rails clear — and reads the dominant rail first. Statement tables carry INTEGER paise; the dollar read is amount_cents / 100.0.",
      ask: "Return each rail with its leg count, settled dollars and average leg in dollars to 2 decimals, dominant rail first.",
      template:
        "SELECT method,\n       COUNT(*) AS legs,\n       SUM(amount_cents) / 100.0 AS rail_dollars,\n       ROUND(SUM(amount_cents) / 100.0 / COUNT(*), {1}) AS avg_leg_dollars\nFROM payments\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY rail_dollars {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the ticket-size precision",
          why: "Rail tickets read to 2 decimals — the bank/UPI rail's 2,931.64 against the wallet rail's 2,335.25 is the comparison the pricing pod quotes. ROUND(…, 1) prints 2,931.6 and the ticket-size story stops reconciling with the number the board deck carries.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the rail axis",
          why: "The census folds legs by rail — method is the wallet-versus-bank switch on this table. GROUP BY paid_on re-folds the 27 legs into 27 one-leg days and the scorecard stops being a rail read at all.",
        },
        {
          answer: "11",
          kind: "number",
          label: "the materiality gate",
          why: "The scorecard keeps rails carrying at least 11 legs — card's 16 and wire's 11 both clear, and the wire count itself is the boundary row. A 12-leg bar ghosts the bank/UPI rail and the board reads a 100% wallet book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the dominant-rail-first direction",
          why: "The board reads the dominant rail on top: wallet card 37,364.00 over bank/UPI wire 32,248.00. ASC opens the meeting on the challenger rail — a correct query aimed at the wrong end of the deck.",
        },
      ],
      distractors: ["12", "16", "ASC", "paid_on"],
      walkthrough:
        "One table, one fold. GROUP BY method splits the 27 legs into the two rails: card reads 16 legs / 37,364.00 with a 2,335.25 average leg, wire reads 11 legs / 32,248.00 with a 2,931.64 average — and the materiality gate at 11 legs keeps both rows, with the wire count sitting exactly on the boundary. The read is the ticket-size spread: the wallet rail wins legs and dollars but carries a SMALLER average ticket — the bank/UPI rail's 2,931.64 is about 25.5% fatter, small change on the wallet, bigger tickets straight from the bank. The distractors fail honestly: 12 or 16 in the gate slot ghosts the wire rail and the deck reads a 100% wallet book; 12 or 16 in the rail axis are out-of-range positional groups that error; ASC in the direction slot opens on the challenger rail; paid_on in the axis re-folds the census into 27 one-leg days, and in the precision slot it feeds a date string into ROUND where a decimal belongs.",
      },
    {
      id: "cs-paytm-2",
      tier: "hard",
      topic: "s7",
      universe: "month-close",
      title: "The market-by-rail close pivot",
      brief:
        "Paytm-flavored brief on the storefront db: at every close, finance re-cuts the merchant settlement book by market and rail — card legs settle from the Paytm Wallet rail, wire legs settle straight from bank/UPI. Probed facts: 27 legs settle 22 statements; EU carries 14 legs (wallet 19,124.50 / bank-UPI 18,136.50), APAC 8 (6,501.50 / 14,111.50), US 5 (11,738.00 / 0.00 — wallet-only), and LATAM's statement book is empty outright — zero statements, zero legs. The close pack reads markets carrying at least 5 legs, busiest first. Statement tables carry INTEGER paise; the dollar read is amount_cents / 100.0.",
      ask: "Return each market with wallet-rail dollars, bank/UPI dollars and leg count, busiest market first — figures to 2 decimals.",
      template:
        "SELECT c.region AS market,\n       ROUND(SUM(CASE WHEN {1} THEN p.amount_cents ELSE 0 END) / {2}, 2) AS wallet_topups,\n       ROUND(SUM(CASE WHEN p.method = 'wire' THEN p.amount_cents ELSE 0 END) / 100.0, 2) AS bank_upi,\n       COUNT(*) AS legs\nFROM payments p\nJOIN invoices i ON {3}\nJOIN customers c ON c.id = i.customer_id\nGROUP BY {4}\nHAVING COUNT(*) >= {5}\nORDER BY legs {6};",
      slots: [
        {
          answer: "p.method = 'card'",
          kind: "keyword",
          label: "the wallet arm",
          why: "The wallet column sums only card legs — the consumer paid from Paytm Wallet. 'WIRE' in caps matches nothing and the wallet column reads 0.00 everywhere; swapping in the wire arm makes the two columns twins and the pivot says nothing.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the paise divider",
          why: "Statements and legs store INTEGER paise; /100.0 is the dollar read that prints 19,124.50 instead of 1,912,450. The .0 matters at the display edge — fold in paise, divide once, never round before the fold.",
        },
        {
          answer: "p.invoice_id = i.id",
          kind: "keyword",
          label: "the leg-to-statement key",
          why: "A leg joins to ITS statement on invoice_id. p.id = i.id pairs leg 7 with statement 7 — the id coincidence — and the EU wallet column reads 20,879.50 instead of 19,124.50: money settled to the wrong merchants with no error anywhere.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market axis",
          why: "The pivot folds at market grain — region rides the statement's customer. A boolean expression in the axis folds everything into one row; an out-of-range positional group errors; anything else re-grains the pack away from markets.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the materiality gate",
          why: "Markets carrying at least 5 settlement legs stay on the pack — EU 14, APAC 8 and the US exactly 5 clear it, and the US count is the boundary row. Any bar above 5 ghosts the wallet-only market (11,738.00 against a flat 0.00) and the close loses its cleanest rails story.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-market-first direction",
          why: "The close reads biggest leg volume on top: EU 14, APAC 8, US 5. ASC buries the market that carries over half the legs and opens the close on its thinnest row — a correct query aimed at the wrong end of the pack.",
        },
      ],
      distractors: ["p.method = 'WIRE'", "p.id = i.id", "i.customer_id = c.id", "ASC", "9"],
      walkthrough:
        "Three tables, one pivot. The joins staple each leg to its statement (invoice_id — never the id coincidence) and each statement to its market's wallet accounts; GROUP BY region folds 27 legs into three markets; the CASE arms split each market's money by rail; HAVING 5 keeps all three on the pack. EU reads 19,124.50 wallet against 18,136.50 bank/UPI over 14 legs — a near-even split that says EU merchants get paid from both rails. APAC leans bank/UPI, 14,111.50 against 6,501.50. The US is wallet-only, 11,738.00 against 0.00 — every leg rode the wallet rail. LATAM never enters: no statements exist there yet, so the inner join drops it before the gate even runs. The distractors each break differently: 'WIRE' matches no leg and the wallet column reads 0.00 everywhere; p.id = i.id re-pairs legs to the wrong statements and EU's wallet column reads 20,879.50; i.customer_id = c.id in the leg join reaches for a table not joined yet and dies before it runs; 9 in the gate drops two markets; ASC flips the pack to US-first. The close rule holds: fold legs per statement, split by rail inside the fold, and let the empty arm print a real 0.00 — a zero that means 'no legs', not 'no data'.",
    },
    {
      id: "cs-paytm-3",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The 14-month volume walk",
      brief:
        "Paytm-flavored brief on the storefront db: the growth board opens the volume call with the month walk — transactions bucketed by month, prior month beside current, delta named. Probed facts: the spine runs 14 buckets from 2024-01 to 2025-02; the book opens at 3,731.97 (8 transactions), troughs at 1,193.86 in July 2024 (8 transactions on thin tickets), jumps +1,158.21 into August, and takes its steepest drop, -1,326.87, into November. February 2025 closes the spine at 2,390.53. The board reads the walk with the baseline row dropped — a first row with no prior is labeled, never zero-filled. Orders.total is REAL dollars already; no paise conversion on this table.",
      ask: "Return each month with its volume, the prior month's volume and the rounded delta — baseline row dropped, spine in calendar order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME({1}, created_at) AS month,\n         ROUND(SUM(total), 2) AS volume\n  FROM orders\n  GROUP BY 1\n),\nwalked AS (\n  SELECT month, volume,\n         LAG(volume) OVER (ORDER BY month) AS prior_month\n  FROM spine\n)\nSELECT month, volume, prior_month,\n       ROUND({4} - prior_month, {2}) AS delta\nFROM walked\nWHERE prior_month {3}\nORDER BY month;",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the spine format",
          why: "Year plus zero-padded month is the only bucket key that sorts correctly and keeps Januaries apart — 14 buckets from 2024-01 to 2025-02. '%m' alone merges January 2024 with January 2025 into one bucket and the 14-point spine reads as a 12-point loop with double-weighted months.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the delta precision",
          why: "Volumes carry two decimals, so the delta carries paise: August's +1,158.21 and November's -1,326.87 are the two moves the board quotes. ROUND(…, 0) prints 1,158 and 1,327 and the audit trail stops matching the deck.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the baseline gate",
          why: "The first row's LAG is NULL by definition — the baseline, not a zero. WHERE prior_month IS NOT NULL drops exactly that row from the walk; IS NULL would return the baseline alone, and a bare string comparison would return nothing at all, because a real volume never equals a literal.",
        },
        {
          answer: "volume",
          kind: "keyword",
          label: "the current-month side",
          why: "The delta reads current minus prior — volume minus prior_month. Swapping the sides flips every sign: August prints -1,158.21 and the jump becomes a slump, a plausible-looking trend pointing the wrong way.",
        },
      ],
      distractors: ["'%m'", "'total'", "0", "IS NULL", "'%Y'"],
      walkthrough:
        "Two stages, one walk. The spine folds 103 transactions into 14 month buckets — 2024-01 to 2025-02 — and the window stage hands each month its calendar neighbor's volume, LAG over ORDER BY month. LAG on a month-ordered spine makes the first row NULL by definition, and the WHERE IS NOT NULL gate drops it: thirteen walked months, baseline labeled upstream, never zero-filled. The delta is current minus prior — volume - prior_month — rounded to 2 decimals. The story the deltas tell is the reason this artifact survives: open 3,731.97, the summer sag bottoms at 1,193.86 in July, the largest jump — +1,158.21 — lands into August, and the steepest drop, -1,326.87, lands into November before the book stabilizes near 2,400. The distractors each break differently: '%m' merges the two Januaries into one bucket and the spine reads 12 points; 'total' casts to zero inside the delta and every month prints minus its prior — a mirrored trend; '0' rounds the paise out of the two headline moves; IS NULL returns the baseline alone and '%Y' collapses the spine to two year-rows. The discipline: the window's ORDER BY must match the report's ORDER BY, and the subtraction's sign convention must match the deck's, or the walk walks a different road.",
    },
    {
      id: "cs-paytm-4",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Paytm-flavored brief on the storefront db: the ops board wants the transaction fate census in ONE scan — completed, settling, awaiting-the-payer, failed-or-reversed — with the completed share beside it. Probed facts: 103 transactions total; delivered = completed 52, shipped = bank leg settling 30, pending = awaiting the payer 14, cancelled = failed or reversed 7 — the branches foot to 103 by construction, which is the reconciliation identity the census exists to enforce. Statuses live on orders.status as lowercase literals; the share math needs the 100.0 guard before the division or integer truncation prints a flat zero. One table, no joins — the census is the denominator argument in query form.",
      ask: "Return one row: total transactions, completed, settling, awaiting-payer, failed-or-reversed counts, and the completed percentage to 2 decimals — gated so the row only prints when the census foots to 103.",
      template:
        "SELECT COUNT(*) AS all_txns,\n       COUNT(*) FILTER (WHERE {1}) AS completed,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS settling,\n       COUNT(*) FILTER (WHERE status = 'pending') AS awaiting_payer,\n       COUNT(*) FILTER (WHERE status = 'cancelled') AS failed_reversed,\n       ROUND({2} * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), 2) AS completed_pct\nFROM orders\nHAVING COUNT(*) = {3};",
      slots: [
        {
          answer: "status = 'delivered'",
          kind: "keyword",
          label: "the completed branch",
          why: "Completed is the 'delivered' literal — 52 of 103. 'shipped' in the arm returns the 30 settling transactions wearing the completed name; 'complete' or 'DELIVERED' match nothing and the branch prints 0 while the query runs clean.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share guard",
          why: "100.0 * 52 / 103 is real division — 50.49. The bare 100 forces integer arithmetic after the multiply: 5,200 / 103 truncates to 50, and the completed share prints a flat 50 while every analyst copies it into the funnel deck.",
        },
        {
          answer: "103",
          kind: "number",
          label: "the reconciliation gate",
          why: "HAVING COUNT(*) = 103 makes the census assert its own total: the row prints only when the book holds exactly 103 transactions. 104 or 102 gate to zero rows — a loud empty result that says the population moved, instead of a plausible row that says nothing.",
        },
      ],
      distractors: ["status = 'complete'", "status = 'shipped'", "status = 'DELIVERED'", "100", "104"],
      walkthrough:
        "One scan, four branches, one identity. FILTER (WHERE …) hangs a private WHERE off each aggregate: delivered counts 52, shipped 30, pending 14, cancelled 7 — and COUNT(*) prints 103 beside them so the reader can check 52+30+14+7 = 103 without opening a second tab. The completed share rides the same scan: 100.0 * 52 / 103 = 50.49, the .0 guarding real division. The HAVING gate is the census's self-check — the aggregate query has no GROUP BY, so HAVING judges the single fold, and any drift in the population (a fifth status, a backfill, a purge) prints an empty grid instead of a stale row. The distractors each break differently: 'complete' and 'DELIVERED' match no literal and completed reads 0 with a 0.00 share; 'shipped' fills the completed branch with the 30 settling transactions and the funnel's top stage shrinks by 42%; the bare 100 truncates the share to 50; 104 silences the whole row. The portable twin is SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) — same numbers, no FILTER keyword, same identity to defend.",
    },
    {
      id: "cs-paytm-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The dunning queue finance ships",
      brief:
        "Paytm-flavored brief on the storefront db: before finance sends a single dunning email, the queue runs — statements with zero settlement legs, folded by market. Probed facts: six statements never received a leg, worth 15,217.00: the EU carries four (873.00, 1,295.00, 3,562.00, 2,794.00 — 8,524.00), the US one (4,937.00), APAC one (#28 at 1,756.00 — the statement that reads 'paid' with nothing behind it, the paid-status lie). The queue prints biggest exposure first so the collections call goes out in priority order. Statement tables carry INTEGER paise; the dollar read is amount_cents / 100.0.",
      ask: "Return each market with its count of legless statements and total dunning dollars to 2 decimals — biggest exposure first, keeping markets with at least one legless statement.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS legless_statements,\n       ROUND(SUM({1}) / 100.0, 2) AS dunning_dollars\nFROM invoices i\nJOIN customers c ON {2}\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {3}\nGROUP BY c.region\nHAVING COUNT(*) >= {4}\nORDER BY dunning_dollars DESC;",
      slots: [
        {
          answer: "i.amount_cents",
          kind: "keyword",
          label: "the exposure fold",
          why: "Dunning exposure is what the statement CLAIMS — the invoice's amount_cents. p.amount_cents over an unmatched LEFT JOIN is all NULLs, so the fold prints NULL dollars for a queue that owns 15,217.00 — exposure silently erased.",
        },
        {
          answer: "i.customer_id = c.id",
          kind: "keyword",
          label: "the statement-to-market key",
          why: "A statement reaches its market through the wallet account that holds it: i.customer_id = c.id. c.id = i.id pairs statement 1 with account 1 by id coincidence — some pairs happen to match and the market split comes out plausible and wrong.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the anti-join gate",
          why: "The LEFT JOIN keeps every statement; p.id IS NULL keeps exactly the ones where no leg matched — the anti-join. IS NOT NULL flips the query to the 22 SETTLED statements, and '= 0' matches nothing because ids start at 1 — a silent empty queue on collections day.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the queue floor",
          why: "The queue keeps markets carrying at least one legless statement — every market that qualifies on this book (EU 4, US 1, APAC 1) clears the bar, and the count 1 appears in the output. A floor of 2 silently drops the US and APAC rows and the 4,937.00 plus 1,756.00 exposure never reaches the collections call.",
        },
      ],
      distractors: ["p.amount_cents", "c.id = i.id", "IS NOT NULL", "2", "p.customer_id = c.id"],
      walkthrough:
        "Three tables, one anti-join, one queue. The inner join to customers stamps each statement with its market; the LEFT JOIN to payments offers each statement its legs; WHERE p.id IS NULL keeps only the offers that came back empty — six statements, and no COALESCE anywhere to launder them back in. GROUP BY region folds the six into three queue rows: EU 4 statements / 8,524.00, US 1 / 4,937.00, APAC 1 / 1,756.00, ordered so the biggest exposure leads the call. The APAC row IS the finding: #28 reads 'paid' in the status column and still lands in the dunning queue, because legs — not claims — are the ledger of record. The distractors each break differently: p.amount_cents sums NULLs into a NULL dollar column; c.id = i.id mispairs statements to accounts by id coincidence; IS NOT NULL flips the query into the settled book (22 statements) and the dunning email goes out to merchants who already got paid; 2 on the floor drops two of three markets; p.customer_id = c.id reaches for a column the payments table does not have and dies before it runs. The close rule: the anti-join IS the answer, the empty-paise arithmetic stays integer until one /100.0, and a paid status with no legs is a finding, not a filter.",
    },
    {
      id: "cs-paytm-6",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The whale ladder and the tie block",
      brief:
        "Paytm-flavored brief on the storefront db: the growth board's winback pod targets the ladder of accounts by transaction count — and the tie block is the policy decision. Probed facts: the ladder runs 24, 17, 14, 13, 5 transactions (account 1 leads at 7,262.35 lifetime), then FOUR accounts tie at 4 transactions (lifetimes 1,686.17 / 1,098.60 / 985.65 / 737.68). RANK awards the tie block rank 6 four times; the pod takes the top 9 accounts, so the tie block sits exactly at the cut. Lifetime values are REAL dollars on orders.total — no paise conversion here. The board wants shared rungs for peer accounts and the ladder ordered by rank, then by lifetime within ties.",
      ask: "Return every account at or above the tie block with transaction count, lifetime dollars to 2 decimals and a shared rank — ties share the rung, biggest lifetime first within ties.",
      template:
        "SELECT customer_id AS account,\n       COUNT(*) AS txns,\n       ROUND(SUM(total), {1}) AS lifetime,\n       RANK() OVER (ORDER BY COUNT(*) {2}) AS rk\nFROM orders\nGROUP BY customer_id\nHAVING {3}\nORDER BY rk, lifetime DESC;",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the lifetime precision",
          why: "Lifetimes are money — 7,262.35 reads to 2 decimals or the ladder stops matching the deck. ROUND(…, 0) prints 7,262 and the whale's exact lifetime — the number the winback budget defends — is gone from the report.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the ladder direction",
          why: "The board reads the biggest book on top: 24 transactions at rank 1. ASC hands rank 1 to the two-transaction account and the pod's top row becomes its bottom — a correct window aimed at the wrong end of the ladder.",
        },
        {
          answer: "COUNT(*) >= 4",
          kind: "keyword",
          label: "the tie bar",
          why: "The bar keeps exactly the accounts at or above the tie block — 24, 17, 14, 13, 5 and the four 4s: nine accounts, the whole tie block present and sharing rank 6. A bar of 5 drops all four tied accounts and the shared rung vanishes; equality on the count alone (= 4) keeps only the peers and loses the ladder above them.",
        },
      ],
      distractors: ["0", "1", "ASC", "COUNT(*) >= 5", "COUNT(*) = 4"],
      walkthrough:
        "One fold, one window, one policy. GROUP BY customer_id folds 103 transactions to 16 account counts; the HAVING bar keeps the nine accounts at or above the tie block; RANK() OVER (ORDER BY COUNT(*) DESC) stamps shared rungs — 1, 2, 3, 4, 5, then 6, 6, 6, 6 — and the lifetime DESC tie-break orders the tied peers by book size: 1,686.17, 1,098.60, 985.65, 737.68. The tie block is the interview: RANK (gaps follow — the next count below 4 would land at rank 10), DENSE_RANK (no gaps — rank 7) and ROW_NUMBER (arbitrary 6, 7, 8, 9) are three different policies about peer accounts, and the board publishes which one it chose. No LIMIT sits under this report — the HAVING bar IS the pod's membership rule, so no cutoff can silently evict a tied peer the way LIMIT 8 would. The distractors each break differently: 0 in the precision slot prints whole-dollar lifetimes and 1 shaves the second decimal; ASC flips the ladder so the dormant tail leads; the bar at 5 drops the entire tie block and its shared rank 6; the equality bar keeps only the four peers and loses the whales above them; and the bare 0 or 1 predicates on HAVING either empty the grid or flood it with all sixteen accounts.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-transaction line-service revenue is the monetization pod's first chart — fold line records to SKU grain and rank. This problem drills the exact fold the service-mix report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Service-SKU revenue beside units sold is how the recharge catalog gets defended — 498 units across 251 lines folding into a weighted read is this problem's shape at db scale." },
    { slug: "queries-quality-and-percentage", why: "Settlement quality reads as a ratio with a stated denominator — average days beside a percentage of stamped transactions. Same division-discipline drill, Paytm flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in acquiring targeting — which markets carry at least N legs, which billers carry at least N statements. This problem drills the group-level gate." },
    { slug: "capital-gain-loss", why: "Wallet top-ups minus spend nets out to the float movement the treasury board reads. This problem drills ordered buy/sell folds — the same add/drain algebra the wallet float uses." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-transaction account is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder wallet read is written." },
    { slug: "confirmation-rate", why: "Bill-pay outcomes arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. This drills the payer-funnel denominator discipline." },
    { slug: "combine-two-tables", why: "Wallet accounts LEFT JOINed to transactions: the whitespace read. A transaction without an account is corruption, an account without transactions is dormancy — choosing the join type is the business statement." },
    { slug: "trips-and-users", why: "Cancellation rate per account with attribution — the canonical two-sided trust query, and Paytm's failed-transaction economics at practice scale: who initiated, who ate the failure, and which denominator the rate quotes." },
    { slug: "average-selling-price", why: "Volume-weighted average ticket per service family is the pricing pod's first chart — 498 units folding into a weighted mean, exactly this problem's divide-by-the-sum shape." },
    { slug: "immediate-food-delivery-ii", why: "Share of bill payments completing inside the promised window versus late — the instant-promise SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "number-of-employees-who-met-the-target", why: "Markets hitting settlement targets is a conditional count against a bar — the rails desk's weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "sellers-with-no-sales", why: "Billers with no settlement legs would be the dead-acquiring alarm — on this db the anti-join returns a confident zero across all six partners, and proving that zero is part of the job." },
    { slug: "bank-account-summary", why: "Running settlement balances per statement over ordered legs — the merchant-facing balance view is a running-sum walk, paise-safe by construction." },
    { slug: "list-the-products-ordered-in-a-period", why: "Which service SKUs turned volume inside a month window — the campaign-retro input is a date-bounded per-SKU fold, exactly this problem's shape." },
    { slug: "spend-histogram", why: "Top-up sizes bucketed into a histogram is how the wallet team reads denomination health — CASE bands over amounts, the same fold the ticket-size report runs." },
    { slug: "active-users", why: "Wallet actives are the two-grain census at platform grain — accounts that transacted beside the total book. This problem drills the distinct-activity fold the acquiring board opens with." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Initiated-but-never-completed is the 14 pending transactions in problem form — accounts that started a bill-pay and stalled. The funnel's whitespace read, drilled exactly." },
    { slug: "monthly-transactions-i", why: "Per-account monthly transaction counts are the intensity fold behind the 5.6-vs-9.5 market ratio. This problem drills the month-bucketed per-account census the rails desk re-cuts." },
    { slug: "consecutive-numbers", why: "Consecutive-month moves — was last month up, and the month before too — are streak logic over the LAG walk. This problem drills the window-self-comparison shape the volume call leans on." },
    { slug: "customers-who-never-order", why: "The dormant-account anti-join mirrors the dunning queue: who holds a wallet and never transacts. This problem drills the LEFT JOIN IS NULL shape finance ships at every close." },
    { slug: "average-time-of-process-per-machine", why: "Settlement latency is created_at to shipped_at per leg — the same dated-diff-per-pair fold, drilled against the 2.98-day average the instant-promise SLA quotes." },
    { slug: "ar-aging-schedule", why: "Aging buckets for the 15,217.00 dunning book — 0-30, 31-60, 60+ — are CASE bands over due dates. This problem drills the receivables ladder the collections call reads from." },
    { slug: "deferred-revenue", why: "Money claimed but not settled is exactly the #28 paid-status lie and the 15,217.00 legless book. This problem drills the claim-versus-ledger reconciliation shape." },
    { slug: "chargeback-rate-ranking", why: "Failed-or-reversed share ranked by market is the trust metric beside the fate census — 7 of 103 overall, concentrated by market. This problem drills the rate-then-rank fold." },
    { slug: "credit-utilization-bands", why: "CASE bands over settlement tickets — under 1,000, 1,000-3,000, 3,000+ — are the denomination health read the ticket-size report runs. This problem drills the banded fold." },
    { slug: "daily-balance-interest", why: "Day-weighted balance math is the float walk the treasury board reads — ordered legs, per-day folds, paise-safe. This problem drills the cumulative-then-weight shape." },
    { slug: "balance-rollforward", why: "Opening balance plus ordered movements equals closing — the reconciliation identity behind every settlement statement. This problem drills the rollforward fold the close pack ships." },
    { slug: "budget-pacing", why: "Cashback spend versus plan is the expense board's pacing read — Rent at 16,800.00 of 25,416.00 is the shape at db scale. This problem drills the actual-versus-bar fold." },
    { slug: "amount-anomaly-zscore", why: "Fat-ticket legs against the rail mean are the fraud desk's first flag — 2,931.64 mean makes a 4,937.00 outlier. This problem drills the standardize-and-flag fold." },
    { slug: "top-travellers", why: "The payer ladder beside per-account totals — 24, 17, 14, 13, 5 — is this problem's exact shape, and the whale board's weekly artifact at db scale." },
    { slug: "compute-the-rank-as-a-percentage", why: "Rank as a percentile converts the tie-block ladder into share-of-book terms the growth board quotes. This problem drills the window-ratio fold." },
  ],
};
