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
    "Preparation strategy: the pools file carries no Paytm section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: rail folds, two-grain market censuses, bill-pay funnels, split-statement counts, CASE rail pivots and the cents-safe statement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {sky:settlement-rail scorecard} the growth board opens with, the other rebuilds the {emerald:market-by-rail close pivot} finance ships at every month-end. The bar to clear: *say which rail, which grain, which denominator* — then make every leg census reconcile to 27 and every statement census to 22 by construction.",
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
      slugs: ["number-of-rich-customers", "monthly-transactions-ii", "count-salary-categories"],
    },
    {
      name: "Two-grain market censuses",
      why: "Transactions and wallet accounts are different grains of the same join, and every market report here shows both: EU runs 45 transactions from 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides where acquiring pushes next.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-ii", "students-and-examinations"],
    },
    {
      name: "Bill-pay fate funnels",
      why: "The fate census is the ops heartbeat: completed, settling, pending, failed — each a conditional count over a status or timestamp. The trap is calling a settling transaction 'complete' — 30 versus 52 on this db — and the second trap is the denominator: pending stays in a conversion base and drops out of a latency base, and the panel wants you to say which before writing SQL.",
      slugs: ["trial-to-paid-funnel", "email-engagement-funnel", "immediate-food-delivery-i"],
    },
    {
      name: "Whale & biller leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four wallet accounts sit at 4 transactions each on this db, and the ladder above them runs 24, 17, 14, 13, 5 with the top account at 7,262.35. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax. Paytm's growth board publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary"],
    },
    {
      name: "CASE rail pivots",
      why: "The market-by-rail close pivot is CASE work: wallet dollars, bank/UPI dollars and a leg count per market, with arms that must be exhaustive and ordered. A reordered WHEN quietly re-buckets the book, a 'WIRE' literal matches nothing, and the empty arm must sum to a real zero (US reads 11,738.00 against 0.00) rather than a NULL. Arm order is the whole answer.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "loan-types"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month transaction spine (2024-01 to 2025-02) is the volume call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Failed transactions concentrate in July and November (2 each of 7), and the walk is how that pattern gets defended.",
      slugs: ["year-on-year-growth-rate", "hopper-company-queries-i", "biggest-window-between-events"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — wallet-rail legs beside bank/UPI legs, this quarter beside last — and UNION answers by stacking while deduping whole rows silently, which makes it a correctness question. EXCEPT answers 'which settled statements never rode the wallet rail'. The dunning anti-join (6 legless statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "league-statistics"],
    },
    {
      name: "Nested gates & staging",
      why: "Screens escalate into staging: fold per-account transaction counts, then judge them against a computed platform mean (6.44 here — exactly four accounts clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Paytm's acquiring targeting is exactly this: which markets run above the platform's settlement cadence.",
      slugs: ["investments-in-2016", "game-play-analysis-iv", "market-analysis-i"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board wants completed, settling, pending and failed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "count-the-number-of-experiments", "create-a-session-bar-chart"],
    },
    {
      name: "Cents discipline & statement folds",
      why: "Settled is not paid — the finance tables (28 statements, 27 legs, INTEGER paise) are where the wallet world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) ride the wallet, wire legs (11, 32,248.00) settle straight from bank accounts.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "account-balance"],
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
  ],
};
