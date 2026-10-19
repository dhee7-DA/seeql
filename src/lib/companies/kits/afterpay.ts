// Afterpay — Wave-11 (Task 102), fintech domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// BNPL on the 4-pay installment clock (distinct from klarna's pay-later plan book and affirm's underwriting/funding read):
// the storefront db read as an installment-schedule book — customers are shoppers (region = market), orders are financed
// checkouts (delivered = fully settled, all installments paid, 52; shipped = schedule live mid-clock with shipped_at as the
// activation stamp, 30; pending = approved, first debit not yet landed, 14; cancelled = declined at the no-credit-check gate, 7),
// order_items are installment lines (quantity = installments on the line — 498 scheduled debits across the book, max 3 per line;
// unit_price = per-installment amount; SUM(quantity * unit_price) = 34,833.28 foots to the checkout book exactly), products =
// the retail catalog financed, suppliers = merchant partners (the fee base), invoices = installment statements, payments = the
// card/wire legs (card = consumer debits, wire = merchant settlements — 5 statements settle on BOTH rails per the facts
// split-rail cell), expenses = credit-loss opex, ledger_entries = GL. Finance tables store INTEGER cents — dollar read =
// amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars.
// Pool provenance: company-pools.md carries NO Afterpay section — 0 tagged rows (grep-verified) — so all 10 topic slug sets
// and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f*-initial slugs) and say so in brief P4.
// Case briefs quote figures from scripts/company-facts.md (incl. the wave-8+9 canonicalized cells); probe-derived cells were
// re-probed readonly against db/custom.db (wave-11, bun:sqlite readonly, no db copies, nothing written) and are declared
// here: per-stage principals (completed 15,571.07 / mid_schedule 11,996.72 / approved_not_started 6,113.00 / declined
// 1,152.49 — footing to 34,833.28) and per-merchant distinct schedules (38/45/34/25/41/35 beside the canonical
// 43/56/40/25/47/40 lines; per-merchant debits 82/109/77/51/99/80). Every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: afterpay is NOT yet in registry COMPANY_META (wave-11 unwired). Wire
// id "afterpay", domainId "fintech", name "Afterpay", tagline "The 4-pay installment clock: approval funnel, merchant fees, split rails",
// accent "text-lime-400" to match this header exactly.
// Wave-3x expansion (Task 103-afterpay), APPEND-ONLY: brief 4→6, dayInLife 3→4, metrics 8→12, topics 10→15,
// theory 8→24 (afterpay-t9..t24), mcqs 10→30 (afterpay-mcq-11..30), cases 2→6 (cs-afterpay-3..6), problems 16→32.
// New case families l7 / t3 / t5 / q5 — distinct from the original s6 + j3 pair and from each other. The 31 new
// topic/problem slugs stay theme-curated from company-pools.md sql rows (still no tagged Afterpay pool; no
// w*/d*/f*-initial slugs) and are all distinct from every slug already in this file.
// Expansion probe-derived cells (re-probed readonly against db/custom.db, bun:sqlite readonly, nothing written):
// settlement-clock ROUND-2dp 28.45 and the per-status-with-legs clock reads (open 19.0 on #25 alone, void 27.0 on
// #11); wrong-key join reads (payments joined to invoices by i.customer_id: 21 rows averaging -34.7 days; the
// coverage fold joined by i.customer_id: 27 phantom-partial + 1); ladder floor shapes (>=1,000 admits the
// 1,686.17/1,458.97/1,098.60 trio → 8 rows, >=3,000 cuts Dubois → 4). All other figures verbatim from
// scripts/company-facts.md. No existing entry was modified; every slot mechanically verified by scripts/case-audit.ts.
// Finisher note (Task 103-afterpay, cases 3-6 + problems 17-32): rail-avg legs probed 2,335.25 (card) / 2,931.64 (wire),
// footing with the sums to the facts' 69,612.00; statement-grain first-leg clock re-probed paid 28.45 / void 27.0 (#11) /
// open 19.0 (#25), leg-grain paid read 29.52 beside it; wrong-key statement-grain clock = 28 rows of negative-day fiction;
// census wrong-key fold = 1 exact + 27 phantom partials; NULLIF zero-arm = 21 exact / 7 partial / 0 none. No entry modified.

import type { CompanyKit } from "../types";

export const afterpayKit: CompanyKit = {
  id: "afterpay",
  domainId: "fintech",
  name: "Afterpay",
  tagline: "The 4-pay installment clock: approval funnel, merchant fees, split rails",
  accent: "text-lime-400",

  brief: [
    "**Afterpay** is the BNPL pioneer that fixed the clock at **four installments over six weeks** — no interest, no application forms, approval decided at the checkout in seconds because there is no traditional credit check to run. Revenue is a merchant fee on every financed checkout plus capped late fees on missed debits, so the whole P&L is a claim about *schedules actually paying on time*. This kit maps the storefront db onto that world: 16 shoppers, **103 financed checkouts worth 34,833.28**, and 251 installment lines carrying 498 scheduled consumer debits — SUM(quantity × unit_price) foots to the checkout book to the cent. The stage map is fixed: delivered = {emerald:fully settled} (52, 50.5%), shipped = live mid-clock (30, 29.1%), pending = approved-not-activated (14, 13.6%), cancelled = {rose:declined at the gate} (7, 6.8%).",
    "The data org splits into credit policy, merchant partnerships and settlement ops, and all three read the same schedule spine at different grains. Credit policy owns the activation stamp: a checkout books at created_at and shipped_at stamps the day the schedule goes live — **82 of 103 checkouts** carry it, averaging a **2.98-day** approval-to-activation with a 2–4 day spread, while the 14 not-yet-activated rows are a population definition, not a cleanup job. Settlement ops owns the rails: card legs are {rose:consumer debits} (16 legs, 37,364.00), wire legs are {sky:merchant settlements} (11 legs, 32,248.00), and the two sides meet on the same statement. Money columns are INTEGER cents; the dollar read is `amount_cents / 100.0`.",
    "Interview screens are funnel-then-denominator with an installment-clock accent. A loop opens with the **stage census** — one CASE fold, four buckets, reconciling to 103 by construction — then asks the denominator out loud (*'does a declined checkout sit in the approval base?'*), then goes two-grain: EU runs 45 schedules from 8 shoppers while the US runs 19 from 2, and the 6.44 schedules-per-shopper mean clears exactly four logos. Late rounds band tickets (the mid band averages 111.50 against budget's 32.06 and the {amber:200-plus band the 4-pay ladder most wants is empty}) or walk the {violet:merchant fee base} — Nordic Gadgets AB and Midwest Hardware Co hold **58.7%** of it — and candidates who state the stage map, the denominator and the rail before writing SQL are the ones who get callbacks.",
    "Preparation strategy: company-pools.md carries no Afterpay section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: stage censuses with honest denominators, two-grain shopper counts, ticket-band CASE ladders, merchant fee attribution, split-rail statement reconciliation and the cents-safe settlement books. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {violet:approval funnel census} risk policy reviews after every decline-rate move, the other rebuilds the {orange:merchant fee book} partnerships refreshes before every renewal call, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the stage map, the denominator and the rail before you compute anything* — then make every stage census reconcile to 103 by construction.",
    "Settlement side, the deep blocks. Past the census the screens go reconciliation-first: the {violet:coverage census} — 21 exact (65,612.00 both sides), 1 partial (#25: 4,000.00 of 6,148.00), 6 never-collected (15,217.00) — only reconciles once the mirror anomalies are understood, void-but-debited #11 folding IN and paid-lie #28 folding OUT. The rail census rides the same page: {rose:card legs} are consumer debits (16 legs, 37,364.00), {sky:wire legs} are merchant settlements (11 legs, 32,248.00), and 5 statements settle on both. The money rule is non-negotiable: finance tables store INTEGER cents, so every dollar read is `amount_cents / 100.0` — and the close ships only when the ledger reads **181,080 against 181,080**, delta zero.",
    "How to prep for the senior loop: the sixteen theory items and twenty new MCQs below go past the census into pipeline-order traps, window frames, set-op stacks, subquery shapes and the cents-versus-dollars rounding policy — the questions that separate a report-writer from a reconciliation owner. Four new case studies extend the board: a single-table {emerald:rail census}, the {amber:settlement clock} dunning keys off, the {violet:financed-dollars ladder} partnerships quotes, and the full coverage-census rebuild. Run them after the originals — *the originals teach the map, these teach the mirror* — and keep the one habit the whole kit grades: state the stage map, the denominator and the rail before you compute anything.",
  ],

  dayInLife: [
    "**08:05 —** The day starts on the approval-funnel dashboard, not the marketing one. First query is the one-pass stage census — 52 fully settled + 30 live + 14 not-yet-activated + 7 declined = **103 by construction** — followed by the activation clock over the 82 stamped checkouts: **2.98 days** average, US slowest at 3.07, APAC quickest at 2.93. A checkout that sits approved without a first debit is *the morning's first page*, not a rounding note — {rose:approved money that never activates} is a schedule that never collects and a merchant that waits for a settlement. Decline rate gets a one-line pull: 7 of 103 (6.8%), with the note that a no-credit-check gate means declines concentrate in thin files, not FICO bands.",
    "**11:30 —** Midday is the merchant read. Partnerships wants the {orange:fee base} refreshed: Nordic Gadgets AB carries **11,130.25 — 32% of the book** — and with Midwest Hardware Co's 9,294.93 the top two hold 58.7%, so one renegotiation moves the whole fee P&L. The two-grain caveat ships with the chart: Nordic's 43 installment lines came from just 38 distinct checkouts — *lines are debits, schedules are checkouts, and quoting the wrong one overstates reach*. Credit wants the ticket-band re-cut beside it: 8 mid-band SKUs averaging 111.50 against budget's 8 at 32.06, with the 200-plus band empty because **199.99 is the catalog ceiling** — the 4-pay ladder stops exactly where the bigger ticket would begin.",
    "**16:10 —** The afternoon tilts to settlement. The dunning anti-join refreshes first — **6 statements worth 15,217.00 with zero legs behind them** — before a single late-fee notice goes out; the exception queue gets walked line by line: statement #11 is {rose:void} yet carries a 925.00 consumer debit, and #28 reads paid with nothing collected at all (1,756.00 promised) — *status is a claim, legs are the ledger*. The rail census closes the loop: 16 card debits (37,364.00) against 11 wire settlements (32,248.00), 5 statements settling on both rails, and the day ends the way every close does — the ledger trial balance must read 181,080 against 181,080 with delta zero, or {emerald:the close does not ship}.",
    "**19:45 —** The close memo goes out as one paragraph of reconciliations, not prose: coverage 21 exact / 1 partial / 6 none, rails card-versus-wire with the 5 split-rail statements flagged, ledger delta zero — {emerald:the close ships} because every fold said the same thing. Then tomorrow is staged: #25's missing 2,148.00 tops the dunning queue, #28 stays documented as the status-versus-ledger note, and the {violet:vintage watch} rolls the 14 approved-not-activated checkouts (6,113.00) into the morning census. Last habit of the day is the grain check — *statements, legs, checkouts, debits, four different counts of one book* — because the reader who cannot tell 251 lines from 498 debits will quote the wrong one upward, and *the memo is where that error starts.*",
  ],

  metrics: [
    { name: "Stage census", what: "Fully settled / live mid-clock / approved-not-activated / declined: 52 / 30 / 14 / 7 over 103 checkouts — dollars 15,571.07 / 11,996.72 / 6,113.00 / 1,152.49, footing to the 34,833.28 book. One CASE fold, and the buckets must reconcile to 103 by construction — the identity every other metric hangs off." },
    { name: "Activation clock", what: "created_at → shipped_at over activated checkouts only: 82 of 103 carry the stamp, 2.98-day average, 2–4 spread (APAC 2.93 on 29, EU 2.94 on 36, US 3.07 on 15, LATAM 3.5 on 2). The 14 approved-not-activated rows have no clock yet — a population definition the metric must state, not a cleanup job." },
    { name: "Installment load", what: "251 installment lines across 103 checkouts (2.44 lines per checkout), 498 scheduled consumer debits, max 3 installments on a line. Quantity is the installment count and unit_price the per-installment amount — SUM(quantity × unit_price) foots to 34,833.28 exactly, the fee base before any rate card." },
    { name: "Decline share", what: "Cancelled share of the approval base: 7 of 103 (6.8%) — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0.0 on the same fold. The no-credit-check gate's honesty number, and the denominator argument (declines in or out?) that decides whether it reads 6.8 or 7.3." },
    { name: "Ticket bands", what: "Mid band (50–200): 8 SKUs averaging 111.50; budget (<50): 8 SKUs at 32.06; the 200-plus band is empty — the catalog tops out at the 199.99 Smart Watch S. Ticket size drives the merchant fee and the late-fee exposure alike, so the band ladder is the rate card's spine." },
    { name: "Merchant fee base", what: "Financed GMV per merchant partner: Nordic Gadgets AB 11,130.25 (32%), Midwest Hardware Co 9,294.93 (26.7%) — the top two hold 58.7% of the fee P&L. The renegotiation-risk number the partnerships team quotes, read off one three-table chain and one fold." },
    { name: "Settlement rails", what: "Card legs are consumer debits (16 legs, 37,364.00), wire legs are merchant settlements (11, 32,248.00); 5 statements settle on BOTH rails — split-rail statements are normal on a marketplace, not anomalies. The rail census is the statement-grain read collections runs every close." },
    { name: "Dunning & coverage", what: "Statements classified exact / partial / none: 21 / 1 (#25, 4,000.00 of 6,148.00) / 6 worth 15,217.00 — including paid-status #28 (1,756.00) with zero legs: a status that lies. Against uniform 30-day terms and a 28.4-day average settlement (13 fastest, 84 slowest); underneath, the ledger trial balance reads 181,080 against 181,080." },
    { name: "Paid book", what: "The settled side of the statement book: 21 paid statements totaling 66,443.00, average statement 3,163.95 — against 27 settlement legs summing 69,612.00 (average leg 2,578.22). 22 of 28 statements carry at least one leg (17 single-leg, 5 two-leg split-rail); the paid book and the leg book disagree by exactly the anomalies (#11 folds in, #28 folds out), which is the census's whole point." },
    { name: "Ops burn", what: "Credit-loss ops and platform spend at expense grain: 36 lines totaling 25,416.00 — Rent 14 lines / 16,800.00 (66.1%), Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00. The August spike (3,210.00) is the month the ops board asks why; the ledger folds the same burn into operating_expenses at 25,416.00 debits, tying the two books to the cent." },
    { name: "Shopper concentration", what: "The checkout ladder runs 24, 17, 14, 13, 5 with a four-way tie at 4 underneath; on dollars, 63.5% of financed GMV comes from shoppers whose lifetime total crosses 3,000.00 and 71.2% from the 2,000-plus cohort — five shoppers led by Alice Chen (24 checkouts, 7,262.35). The same 58.7% concentration instinct partnerships aims at merchants, credit policy aims at shoppers." },
    { name: "Category mix", what: "What gets financed: Audio leads at 11,744.01 over 97 scheduled debits, Wearables follows at 6,929.12, Accessories touches the most checkouts (54 of 103) while Fitness trails at 863.91. The catalog's 199.99 ceiling caps the ladder — the mid band (8 SKUs averaging 111.50) is where the fee base actually lives." },
  ],

  topics: [
    {
      name: "Approval funnel counts",
      why: "The stage census is Afterpay's heartbeat: fully settled, live mid-clock, not-yet-activated, declined — each a conditional count over a status or timestamp, reconciling to 103 by construction. The trap is calling a live schedule 'paid' — 30 versus 52 — and the second trap is the denominator: declines sit in an approval-rate base and drop out of a settlement base, and the panel wants you to say which before writing SQL.",
      slugs: ["trial-to-paid-funnel", "percentage-of-users-attended-a-contest", "create-a-session-bar-chart", "consecutive-transactions-with-increasing-amounts", "customers-with-strictly-increasing-purchases", "confirmation-rate"],
    },
    {
      name: "Two-grain shopper censuses",
      why: "Checkouts and shoppers are different grains of the same join, and every census reports both: EU runs 45 checkouts from 8 shoppers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded; the ratio (5.6 versus 9.5) is the market-intensity read that decides where the 4-pay rollout leans next.",
      slugs: ["unique-orders-and-customers-per-month", "number-of-rich-customers", "top-earners", "investments-in-2016", "portfolio-weights"],
    },
    {
      name: "The activation clock",
      why: "A checkout books at created_at and the schedule goes live at shipped_at — 82 of 103 stamped, 2.98 days average, 2–4 spread. julianday arithmetic with the stamp filter stated is the shape being graded; the 14 not-yet-activated rows must be excluded by definition, never by silence, because an average that silently shrinks its population is a real number wearing the wrong name.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "biggest-window-between-events", "loan-amortization-schedule"],
    },
    {
      name: "Ticket bands with CASE",
      why: "The rate card lives in CASE folds: budget under 50 (8 SKUs at 32.06), mid 50–200 (8 at 111.50), and a 200-plus arm that is provably empty on this catalog. Arms must be exhaustive and ordered — a hole in the CASE is a hole in the fee model, and a reordered WHEN quietly re-bands the book the merchant deck quotes.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "count-salary-categories", "basket-depth-aov", "card-launch-success", "gl-reconciliation"],
    },
    {
      name: "Merchant fee attribution",
      why: "Afterpay's fee base is financed GMV per merchant partner, which means a three-table chain — installment lines to catalog to merchant — folded per partner. Nordic Gadgets AB reads 11,130.25 (32%) and the top two hold 58.7%, so join hygiene at the product and supplier keys is literally revenue hygiene.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "average-selling-price", "combine-two-tables", "number-of-calls-between-two-persons", "market-analysis-i", "top-travellers"],
    },
    {
      name: "Schedule leaderboards & ties",
      why: "The repeat-schedule ladder runs 24, 17, 14, 13, 5 checkouts with a four-way tie at 4 underneath, and rank semantics decide who shares a rung. RANK, DENSE_RANK and ROW_NUMBER differ in shared rungs and gaps — a policy about peer shoppers and winback budgets, not syntax, and the interviewer expects the policy named out loud.",
      slugs: ["rank-scores", "group-employees-of-the-same-salary", "compute-the-rank-as-a-percentage", "second-highest-salary", "keep-latest-dedupe"],
    },
    {
      name: "Coverage set algebra",
      why: "Dunning stacks populations — statements with no legs against statements with legs, consumer-debit sets against merchant-settlement sets — and EXCEPT answers 'which billed statements never collected a debit' while UNION dedups whole rows silently. The 6-statement / 15,217.00 anti-join is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "sales-analysis-ii", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "One-pass stage censuses",
      why: "The ops board gets all four stages in ONE scan — FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin. Four sequential queries are four chances to drift, and the branches-sum-to-COUNT(*) identity is the correctness argument the reconciliation review listens for.",
      slugs: ["active-businesses", "user-activity-for-the-past-30-days-ii", "number-of-employees-who-met-the-target", "uber-first-transaction"],
    },
    {
      name: "Statement legs & cents discipline",
      why: "Billed is not settled — 28 statements against 27 legs in INTEGER cents, dollar read amount_cents / 100.0. The exact/partial/none fold (21 / 1 / 6) is one CASE away, and a bare-column ROUND can silently reproduce dollar digits because every cent sum on this book is a whole multiple — prefer the /100.0 read and say the units out loud.",
      slugs: ["bank-account-summary-ii", "trial-balance-check", "monthly-transactions-i", "expected-credit-loss"],
    },
    {
      name: "Month buckets & the book spine",
      why: "The 14-month spine (2024-01 to 2025-02) is where the schedule book gets read as a trend: 3,731.97 opening, the 1,193.86 July trough, both cancellations-heavy months sitting exactly on the dips. STRFTIME('%Y-%m') buckets, half-open window edges, a calendar spine when a month must exist even with no checkouts — and two spines, approval and activation, never mixed in one chart.",
      slugs: ["list-the-products-ordered-in-a-period", "hopper-company-queries-i", "the-latest-login-in-2020", "hopper-company-queries-ii", "orders-with-maximum-quantity-above-average", "median-employee-salary"],
    },
    {
      name: "Settlement aging & the clock",
      why: "Dunning runs on the statement clock: uniform 30-day terms, 28.4-day average settlement, fastest 13, slowest 84 — and the aging bucket a statement lands in decides the dunning letter. JULIANDAY arithmetic over paid_on minus issued_on, bucketed with floor divisions, is the exact shape; the trap is averaging over the wrong population (20 settled statements, not 21 paid — #28 has no clock at all).",
      slugs: ["ar-aging-schedule", "settlement-fails-aging", "calculate-parking-fees-and-duration"],
    },
    {
      name: "Cohort & vintage reads",
      why: "BNPL books are read by vintage: checkouts approved in a month form a cohort whose settlement behavior you chase forward. Cohort folds and retention matrices are how credit policy separates a good month that aged well from a good month that aged badly — the 14-month spine makes every cohort a small, honest sample worth arguing about.",
      slugs: ["cohort-retention-matrix", "vintage-default-curves", "cohort-repeat-revenue"],
    },
    {
      name: "Rolling & running balances",
      why: "The collections dashboard is a running story: cumulative settled dollars across the 14 months, rolling checkout counts per market, balance rollforwards that open where last month closed. Window aggregates without PARTITION BY — the frame IS the answer — and the trap is the default RANGE frame swallowing tied dates, which on a 27-leg ledger with same-day settlements happens more than once.",
      slugs: ["balance-rollforward", "running-total-for-different-genders", "rolling-7d-actives", "bank-account-summary", "classes-more-than-5-students", "manager-of-the-largest-department"],
    },
    {
      name: "NULL policy & hygiene audits",
      why: "This book's NULLs are definitional — shipped_at is NULL until activation, #28's paid status sits on zero legs — so hygiene queries must classify, not delete. Audits that surface missing values, malformed records and stale rows are the muscle; the instinct to prove a zero instead of asserting one is exactly what the data-quality review grades.",
      slugs: ["null-blank-audit", "employees-with-missing-information", "invalid-tweets", "employee-bonus", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "number-of-accounts-that-did-not-stream", "books-with-null-ratings"],
    },
    {
      name: "Ticket distribution cuts",
      why: "Beyond averages: NTILE quartiles over the 103-checkout book, spend histograms, percentile ranks on the shopper ladder — the distribution cut that shows what the 2.98-day clock and the 338.19 mean both hide. Interviewers push from 'what is the average' to 'what does the average hide', and these are the operators that answer.",
      slugs: ["usage-tier-percentiles", "spend-histogram", "value-at-risk", "calculate-compressed-mean"],
    },
  ],

  theory: [
    {
      id: "afterpay-t1",
      q: "Your dunning report joins installment statements to their settlement legs. When do you INNER and when do you LEFT — and what silently breaks if you filter a leg column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A settlement ledger joins statements to legs: a leg with no statement is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dunning list must be LEFT from statements: the statements with no legs ARE the answer, arriving with NULL leg columns — on this db, 6 statements worth 15,217.00. The classic break: filtering method = 'card' in WHERE after the LEFT JOIN kills every NULL-payload statement row — the LEFT quietly became an INNER and the dunning list emptied. The fix is moving the predicate into ON or an outer query. And the mirror anomaly cuts the other way: void statement #11 carries a 925.00 consumer debit, so a leg-side census sees it while the status-side report hides it. A confident zero you did not verify is how whitespace reports die in review — prove the zero or state the filter.",
      tag: "joins",
    },
    {
      id: "afterpay-t2",
      q: "The repeat-schedule ladder runs 24, 17, 14, 13, 5 checkouts, then FOUR shoppers tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which silently decides whose repeat-borrower gets the winback budget first. There is a second layer worth volunteering: the same tie problem shows up inside a running settlement walk — SUM OVER (ORDER BY paid_on) uses a default RANGE frame, so legs tied on the same date enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer shoppers, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment where the growth pod can see it.",
      tag: "windows",
    },
    {
      id: "afterpay-t3",
      q: "The book holds 103 checkouts, 251 installment lines and 498 scheduled debits. Why do the three counts disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains of the same book. COUNT(*) over checkouts is 103 — the approval-funnel population every share divides by. COUNT(*) over installment lines is 251 — the debit-calendar grain, 2.44 lines per checkout on average, because a big basket fans into several lines. SUM(quantity) is 498 — the actual consumer debits scheduled, since quantity is the installment count on a line and maxes at 3. None is wrong: checkouts measure reach, lines measure schedule complexity, debits measure collection workload. The merchant cut makes the trap concrete: Nordic Gadgets AB shows 43 lines from 38 distinct checkouts — quote the lines and you overstate reach by 5 checkouts — while Andes Naturals shows 25 and 25, the only merchant with zero repeat checkouts, which is itself a finding. Saying 'one row per what?' for every COUNT and SUM is the habit the panel grades, and it is the same habit the fee-base deck encodes.",
      tag: "aggregation",
    },
    {
      id: "afterpay-t4",
      q: "shipped_at is NULL until the schedule activates. What is your policy for the activation-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only activated checkouts have a clock, so the report measures approval-to-activation for the 82 of 103 checkouts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL checkouts returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the activated subset; the gap between it and COUNT(*) is exactly the 14 not-yet-activated plus 7 declined rows — 21 rows with no stamp, and that gap is a population read, not a cleanup job. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day activation for approved money that has not debited, and it poisons the 2.98 baseline every regional drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a BNPL reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "afterpay-t5",
      q: "The approval review wants decline share by market for markets carrying at least ten checkouts. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The numerator rule is a row-level fact — the CASE that flags cancelled checkouts folds inside the aggregate, in SELECT. The ten-checkout floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY region; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a funnel line and an error, and between a threshold applied to checkouts versus to dollars. One more placement rule Afterpay screens love: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the decline share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0, and APAC's 8.1 flatlines too. The strong answer places every filter by asking: is this a fact about one checkout, or about a market?",
      tag: "pipeline",
    },
    {
      id: "afterpay-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 checkouts always produce a mean (338.19 on this book), and the big-ticket monitor above it has real members. On filtered staging tables — one market, one stage, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each checkout to ITS shopper's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a shopper's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "afterpay-t7",
      q: "The activation trend buckets checkouts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves, plus one BNPL twist. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's checkouts, and approvals land late exactly when activations do. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The twist: a checkout can approve in one month and activate in the next, so keep TWO spines — approval by created_at, activation by shipped_at — and never mix them in one chart. On the approval spine the deltas tell a concrete story: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, and drops steepest, -1,326.87, into November — with the 2 cancellations in July and November sitting exactly where the troughs do.",
      tag: "dates",
    },
    {
      id: "afterpay-t8",
      q: "Finance says an installment statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00 on the consumer rail) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-debited #11 folds in by construction, paid-status #28 folds out), 1 partial (#25: 4,000.00 of 6,148.00), 6 none. And the rail read belongs on the same page: 16 card legs (37,364.00) are consumer debits, 11 wire legs (32,248.00) are merchant settlements, and 5 statements carry both — split-rail statements are normal on a marketplace, not anomalies. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "afterpay-t9",
      q: "The fee-base query groups by s.id but selects s.name. A colleague switches to GROUP BY s.name and the numbers do not move — until two merchants share a name. What is the difference between grouping by identity and grouping by label, and where does GROUP BY 1 fit?",
      a: "s.id is the identity, s.name is the label — and folds must bind to identity. On this book the six merchant names are unique, so GROUP BY s.name reproduces the s.id fold exactly: Nordic 11,130.25, Midwest 9,294.93, six rows either way. But the contract you ship is s.id: rename a merchant and the label-fold splits its history into two rows or merges it with a stranger, while the id-fold holds. GROUP BY 1 — the ordinal — points at the first output column, a convenience that turns hostile the moment someone reorders SELECT and silently re-binds the fold; and note SQLite resolves SELECT aliases inside GROUP BY and HAVING as an extension while standard SQL and most engines refuse, which is its own portability trap. The habit the panel grades: name what one row of the fold IS — one merchant identity, not one label string — and group by that.",
      tag: "grouping",
    },
    {
      id: "afterpay-t10",
      q: "You join payments to invoices and SUM(i.amount_cents) to size the billed book — the number comes back too high. Walk me through why.",
      a: "Fan-out. Payments holds 27 legs against 28 statements, and the five split-rail statements (#1, #5, #12, #19, #22) carry TWO legs each — so their billed amounts enter the sum twice: 4,860 + 5,284 + 4,723 + 5,614 + 4,459 = 24,940.00 of phantom bill, and the billed book inflates from 86,977.00 by exactly that. The fix is folding the many-side first — a derived table GROUP BY invoice_id — then joining the fold 1:1 back to statements, or simply never summing a one-side column through a many-side join. The rule that survives review: SUM a column only from the table you are grouped at; the moment one-side money rides a many-side join, it multiplies by leg count. The same instinct catches COUNT(*) on the statement side quietly reading legs — the grain question ('one row per what?') is not pedantry, it is the arithmetic.",
      tag: "joins",
    },
    {
      id: "afterpay-t11",
      q: "Your trailing four-week activation average uses SUM(checkouts) OVER (ORDER BY week) — and it feels wrong at the edges. What frame is actually running, and how do you pin it?",
      a: "With ORDER BY and no frame clause, the default is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — cumulative, not trailing — and RANGE treats peer rows (same week value) as one unit, so tied rows enter together. A trailing window must be pinned explicitly: ROWS BETWEEN 3 PRECEDING AND CURRENT ROW counts physical rows, RANGE BETWEEN 3 PRECEDING AND CURRENT ROW counts peer groups — different answers the moment ties exist, and on a 27-leg ledger with same-day settlements, ties exist. The subtler trap is the spine itself: a week with zero checkouts is absent from the grouped result, so a 4-ROW window silently spans more than 4 weeks. Generate the calendar spine first (the 14-month spine, 2024-01 to 2025-02, from a CTE) and join the folds onto it — then the frame means exactly what it says. Frames are policy; saying which one is running is the senior move.",
      tag: "windows",
    },
    {
      id: "afterpay-t12",
      q: "You stack the approval-month spine over the activation-month spine with UNION. What does UNION deduplicate, and when is UNION ALL the honest choice?",
      a: "UNION dedupes whole rows across BOTH arms — if the approval spine and the activation spine happen to produce an identical month-plus-revenue row, bare UNION collapses them into one and the stack silently undercounts the book. UNION ALL keeps everything and is the honest default when the arms are disjoint by construction — which you make true by carrying a label column ('approval' versus 'activation') in each arm. Three mechanical rules ride along: arms align positionally (TEXT month beside TEXT month, REAL dollars beside REAL dollars — SQLite flexes on types but the report should not); a sort inside an arm is lost — ORDER BY after the stack applies to the whole result; and column aliases come from the first arm. On this book: 14 approval rows + 14 activation rows = 28 under UNION ALL, and the two spines must never be mixed into one trend — the stack exists precisely to compare them side by side.",
      tag: "set-ops",
    },
    {
      id: "afterpay-t13",
      q: "'Shoppers whose every checkout activated' — do you reach for IN, EXISTS, or a JOIN, and what does each shape actually say?",
      a: "It is a semi-join — filter shopper rows by a per-shopper fact, no duplication — and the three shapes say different things. IN (subquery) is fine when the inner list is small and NULL-free; EXISTS correlates and stops at the first match, which makes it NULL-proof and cheap on long lists; a JOIN alone fans out and needs DISTINCT to fake a semi-join — the habit the panel watches for. 'Every' is stronger than 'some': the direct shape is relational division — compare COUNT(*) of a shopper's checkouts to COUNT of the activated subset inside the same fold, and keep the shoppers where they agree. On this book that set is every shopper EXCEPT the ones carrying the 14 not-yet-activated checkouts (6,113.00 of pending money) — and saying WHICH population you are excluding, by name, is the difference between an answer and a guess. The mirror question — 'some but not all' — is the same fold with a strict inequality.",
      tag: "subqueries",
    },
    {
      id: "afterpay-t14",
      q: "The month-close rebuild runs the coverage census, the anomaly list and the rail census off the same statement fold. CTE, nested derived tables, or a view — and what does SQLite actually do with your CTE?",
      a: "Stage the per-statement fold once — WITH fold AS (SELECT i.id, i.amount_cents AS billed, COALESCE(SUM(p.amount_cents), 0) AS paid FROM invoices i LEFT JOIN payments p ...) — and read it three ways: the census classifies it, the anomaly list filters it, the rail census joins legs back through it. Derived tables are fine when the fold is used once; a view is the right call only when the definition is shared across teams and versioned. The honest caveat: SQLite historically re-evaluates a CTE at each reference rather than materializing it — invisible at 28 statements, a performance decision at a hundred-million-row ledger, and worth saying out loud because it shows you know the engine, not just the syntax. WITH RECURSIVE earns its place generating the 14-month calendar spine instead of pasting 14 literals. Readability is the primary product of a close script; the CTE is how the fold gets one name and one owner.",
      tag: "ctes",
    },
    {
      id: "afterpay-t15",
      q: "Dunning wants aging buckets: current, 1-30, 31-60, 60-plus days past due. Walk me through the date arithmetic and the traps.",
      a: "JULIANDAY subtraction gives fractional days — CAST or FLOOR for whole-day buckets, and ((julianday(ref) - julianday(due_on)) / 7) with a floor for week ladders. The reference date is a decision, not a constant: MAX(paid_on) is the book's last activity, today is today — pick one and print it on the report, or the buckets drift every run. TEXT timestamps compare lexicographically, so '2024-09-01' range edges work — but a hand-built '2024-9-1' breaks the sort and the join; never assemble dates by string. STRFTIME('%Y-%m') gives month grain (14 buckets on this book), '%d' day-of-month, '%w' weekday for the letter-scheduling read. The gift on this book is uniformity: every statement's due_on sits exactly 30 days after issued_on — 30/30/30 across all 28 — so one bucket ladder fits every statement, and day-30 is the same edge for the whole book. State that assumption; it is what makes the aging fair.",
      tag: "dates",
    },
    {
      id: "afterpay-t16",
      q: "A feeds glitch double-loads settlement legs. What is your keep-latest dedupe, and what makes two legs 'the same leg'?",
      a: "Identity first: define the business key before writing SQL — a leg is (invoice_id, paid_on, amount_cents, method) — because deduping on the wrong key deletes real history. Then rank: ROW_NUMBER() OVER (PARTITION BY invoice_id, paid_on, amount_cents, method ORDER BY loaded_at DESC, id DESC) and keep rn = 1 — the latest load wins, ties break on the surrogate key. Flag rather than delete where the process allows: a quarantined flag lets the reconciliation own the drop. Then prove the result against the book's own anchors: after dedupe, 27 legs over 22 statements summing 69,612.00 — the ledger's cash credit to the cent; if the tie breaks, the key was wrong, not the rows. What it never licenses is DISTINCT: two genuinely distinct legs that share values — same statement, same day, same amount — are two debits, and DISTINCT collapses them into one. Dedupe by key and rank, never by value.",
      tag: "quality",
    },
    {
      id: "afterpay-t17",
      q: "Your dashboard prints the settlement clock as 28.4 days; finance's ledger report prints 28.45 — same fold. Walk me through a rounding policy that survives review.",
      a: "Same fold, different presentation edge — and the policy is: round ONCE, at the edge that ships, never per-row mid-pipeline. AVG(amount_cents) / 100.0 equals SUM/COUNT/100.0 exactly; but ROUND-per-row-then-average is a different number than ROUND-of-the-average, and averaging pre-rounded values drifts. Pick precision per audience — 1 decimal for the dashboard (28.4), 2 for the ledger (28.45) — and put it in the report title, because 28.4 versus 28.45 is exactly the 'whose number is right' meeting you want to pre-empt. Know the engine: SQLite's ROUND is half-away-from-zero over binary floats, so the .5 tie case is not where you build policy; the cents rule is. Finance tables store INTEGER cents — SUM in cents, fold /100.0 once, and never round cents at all until the human reads them. The discipline is not the decimal; it is one rounding point, named.",
      tag: "rounding",
    },
    {
      id: "afterpay-t18",
      q: "The ops board wants all four stage counts in ONE row. FILTER (WHERE ...) or SUM(CASE ...) — and what is the correctness argument you make?",
      a: "Both, knowingly. COUNT(*) FILTER (WHERE status = 'delivered') is the readable one-pass form — each aggregate carries its own branch; SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs on any engine and any reviewer's mental model. Either way the shape is ONE scan and four branches — four sequential queries are four chances to drift — and the correctness argument is the identity: branches sum to COUNT(*), 52 + 30 + 14 + 7 = 103, by construction. That identity is what the reconciliation review actually listens for; it breaks the moment an arm is missing or an ELSE returns NULL (NULL poisons the SUM — always ELSE 0), and it catches the fan-out bugs a JOIN would introduce. SQLite has supported FILTER since 3.30, so know your engine before shipping it to prod — but know the CASE twin too, because the portable version is the one that survives the code review.",
      tag: "aggregation",
    },
    {
      id: "afterpay-t19",
      q: "The funnel board must read completed, mid_schedule, approved_not_started, declined — not alphabetical. How do you own row order?",
      a: "ORDER BY is part of the report's contract, not decoration. Business order comes from a CASE-assigned stage_order (or a lookup join): ORDER BY CASE stage WHEN 'completed' THEN 1 ... END — because alphabetical publishes approved_not_started first and the committee reads top-down. Two more policies to state: NULL placement — SQLite sorts NULLs first ascending, so an unclassified stage would lead the board, which is one more reason the ELSE-arm identity matters (an unclassified stage should be impossible); and multi-key stability — ORDER BY stage_order, checkouts DESC so rows within a stage read biggest-first, dollars 15,571.07 / 11,996.72 / 6,113.00 / 1,152.49 as the committee expects. The asymmetry worth volunteering: output aliases are legal in ORDER BY (the pipeline's last stop) but not in WHERE — the alias does not exist yet when WHERE runs. Ordering is a definition; ship it with the query, not in the chart tool.",
      tag: "ordering",
    },
    {
      id: "afterpay-t20",
      q: "This db is 103 checkouts — why talk about indexes at all? What instinct are you actually being graded on?",
      a: "The shape, because the shape survives scale. WHERE SUBSTR(created_at, 1, 7) = '2024-07' wraps the column in a function and kills any index on created_at — the sargable form is the half-open range created_at >= '2024-07-01' AND created_at < '2024-08-01', which is also the edge-correct form (no lost last night). SELECT * drags columns the census never reads; a covering index on (region, status) answers the stage census from the index alone. SELECT DISTINCT as a habit, ORDER BY on unindexed expressions, correlated subqueries that re-run per outer row — each is a shape that is instant at 103 rows and career-defining at 103 million. The interviewer cannot wait for your future prod incident, so they grade the instinct now: name the predicate form that keeps the index, and say why the census you just wrote would still be a seek, not a scan, at BNPL scale. That is the whole question.",
      tag: "performance",
    },
    {
      id: "afterpay-t21",
      q: "The clock says 2.98 days and the ticket mean says 338.19 — what do those averages hide, and how do you show it?",
      a: "Distributions. NTILE(4) tiles the 103-checkout book into 26/26/26/25 quartiles — the top tile's floor is nowhere near 338.19, and the tile edges are the honest version of 'big-ticket'. PERCENT_RANK pins any checkout on the 0-to-1 curve; the median — ROW_NUMBER-picked middle, or the average of the two middles — answers 'what does typical look like' when a tail pulls. And the tail is real on this book: the activation clock is tight (2 to 4 days around 2.98), but the settlement clock is NOT — 28.4 average with a 13-to-84 spread, meaning one 84-day statement sits under a mean that reads almost ordinary. Report the spread beside the mean or the mean is a lie the tail tells. The ladder makes the same point: counts run 24, 17, 14, 13, 5 against a 6.44 mean that clears exactly four shoppers — averages describe nobody; distributions describe everybody.",
      tag: "percentiles",
    },
    {
      id: "afterpay-t22",
      q: "Five statements settle on both rails. How do you pair each statement's card leg with its wire leg — and count each pair exactly once?",
      a: "Self-join payments to itself with the roles in the join condition: p1 JOIN p2 ON p1.invoice_id = p2.invoice_id AND p1.method = 'card' AND p2.method = 'wire'. The method predicates are the count-once guarantee — the card arm and the wire arm cannot collide because they select disjoint rows, so no canonical-ordering trick is needed; COUNT(*) then reads exactly 5. The classic failures are instructive: joining on p1.id = p2.id matches nothing (a leg never pairs with itself); dropping the invoice predicate pairs every card with every wire — 16 × 11 = 176 phantom pairs; and bare symmetric joins need p1.id < p2.id to avoid double-counting, which the role-filtered shape makes unnecessary. The cheaper census is often GROUP BY invoice_id HAVING COUNT(DISTINCT method) = 2 — same 5 statements, no pairing at all. Pair when you need the two legs' amounts side by side; census when you only need to know they exist.",
      tag: "self-join",
    },
    {
      id: "afterpay-t23",
      q: "COALESCE, IFNULL, NULLIF — three different jobs. Give me the policy for each on this book.",
      a: "COALESCE(a, b, ...) is the n-ary fallback and the workhorse: zero-fill outer-join folds so the 'none' arm becomes countable — COALESCE(SUM(p.amount_cents), 0) is the difference between a 6-statement dunning bucket and 6 statements silently filed as 'partial'. IFNULL is the two-argument SQLite-ism — same job, less portable; reach for COALESCE so the query travels. NULLIF(a, b) runs the other direction: it turns a value INTO NULL to defeat a computation — the divide-by-zero guard is 100.0 * x / NULLIF(base, 0), so a zero-base shopper yields NULL instead of an error. What fallbacks never license: IFNULL(shipped_at, created_at) to 'fix' the activation clock — that invents same-day activation for 14 checkouts that have not debited and poisons the 2.98 baseline. The policy in one line: fallbacks fill display holes, not definitional ones — 21 rows with no stamp are a population, and a population is not a NULL to be papered over.",
      tag: "nulls",
    },
    {
      id: "afterpay-t24",
      q: "The concentration slide wants each shopper's share of its region's book — without losing the shopper rows. GROUP BY cannot do both. What can?",
      a: "A window share. SUM(SUM(o.total)) OVER (PARTITION BY c.region) is legal because the GROUP BY folds first and the window reads group results — nested aggregates inside OVER are standard, not a trick. The ratio is 100.0 * SUM(o.total) / that fold, a RATIO_TO_REPORT emulation, and it keeps one row per shopper: Alice Chen's 7,262.35 beside her share of EU's 15,089.23. The GROUP BY version can only publish the four region totals — EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44 — and destroys the detail rows the ladder and the winback list need. One scan, both grains, which is the entire point of window SQL on this book. Two habits to volunteer: the window fold includes every group, so the shares sum to 100 per region by construction — verify it; and keep the denominator's definition in the column name (region_book), because a share without its denominator visible is the next analyst's bug.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "afterpay-mcq-1",
      prompt: "A financed checkout's status reads 'shipped'. In this kit's Afterpay stage map, what happened?",
      choices: ["The schedule went live mid-clock — the activation stamp has landed and installments are riding", "Fully settled — every installment has been paid and the checkout is done", "Declined at the no-credit-check gate before any debit", "Approved, but the first installment has not landed yet"],
      answer: 0,
      why: "The stage map is fixed: shipped = live mid-clock (30 of 103 checkouts, 29.1%), with shipped_at as the activation stamp. Installments are scheduled and debiting — but the checkout is not fully settled.",
      notes: [
        { choice: 1, why: "Fully settled is 'delivered' — 52 checkouts. Calling live schedules settled overstates the paid book by 30 before a single schedule completes." },
        { choice: 3, why: "Approved-not-started is 'pending' — 14 checkouts with no stamp yet. Pending is not mid-clock; it stays in the funnel as 'not yet'." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-2",
      prompt: "The decline share prints 6.8%. Which fraction is that, and why does the denominator matter?",
      choices: ["7/96 — declined over the approved-only base", "7/103 — declined over ALL checkouts booked, declines included", "52/103 — settled over the full book", "7/82 — declined over activated checkouts"],
      answer: 1,
      why: "The house definition: declines ÷ ALL checkouts booked. The no-credit-check gate's honesty read keeps the 7 declines in the base — 6.8% — because 'declined' is a funnel outcome the gate produced, not noise.",
      notes: [
        { choice: 0, why: "Dropping the declines inflates the share to 7.3% by deleting the outcome the gate exists to measure — the classic approval-rate inflation." },
        { choice: 3, why: "82 is the activation-stamp base, a different population entirely — it measures the clock, not the gate." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-3",
      prompt: "SUM(quantity) over the 251 installment lines returns 498. What does 498 count?",
      choices: ["Consumer debits scheduled across the book — quantity is the installment count on each line", "Installment lines", "Financed checkouts", "Merchant settlement legs"],
      answer: 0,
      why: "quantity is the installment count on a line (max 3), so SUM(quantity) is the book's scheduled debit count: 498. Lines (251) and checkouts (103) are the coarser grains above it.",
      notes: [
        { choice: 1, why: "Lines are 251 — COUNT(*), not SUM(quantity). Summing counts the quantity column; counting rows counts lines." },
        { choice: 2, why: "Checkouts are 103 — the approval-funnel grain. 498 debits across 103 checkouts is the multi-leg story, not a contradiction." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-4",
      prompt: "A financed line carries quantity 3 and unit_price 45.00. What value did the shopper actually finance, and which expression reports it?",
      choices: ["45.00 — unit_price already carries the full line value", "135.00 — quantity × unit_price, the multi-leg total", "3.00 — quantity is the value in installments", "48.00 — unit_price plus one installment"],
      answer: 1,
      why: "In this kit's mapping, quantity is the installment count and unit_price the per-installment amount — so the line finances 3 × 45.00 = 135.00. SUM(quantity * unit_price) is how the fee base folds, and it foots the whole book to 34,833.28.",
      notes: [
        { choice: 0, why: "unit_price alone prices ONE installment — quoting it as line value understates the financed principal threefold and the merchant fee with it." },
        { choice: 2, why: "quantity is a count of legs, not money. Adding a count to a price is a units error the fee deck would catch instantly." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-5",
      prompt: "The fee-base report shows Nordic Gadgets AB with 43 in one column and 38 in another. Which query produced the 38?",
      choices: ["COUNT(DISTINCT oi.order_id) — repeat lines folded back to distinct checkouts", "COUNT(*) over the joined lines", "SUM(oi.quantity) over the joined lines", "COUNT(p.id) over the joined lines"],
      answer: 0,
      why: "43 is installment lines, 38 is distinct checkouts behind them — COUNT(DISTINCT oi.order_id). Lines are debits, schedules are checkouts; quoting lines as reach overstates Nordic's footprint by 5 checkouts.",
      notes: [
        { choice: 1, why: "COUNT(*) IS the 43 — the line grain. The two-grain census exists precisely because 43 and 38 disagree." },
        { choice: 2, why: "SUM(quantity) counts Nordic's scheduled debits — 82 on this book — a third grain again. Three columns, three populations." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-6",
      prompt: "The activation clock reads LATAM 3.5, US 3.07, EU 2.94, APAC 2.93 — yet the platform prints 2.98. A colleague insists LATAM's 3.5 must be dragging it up most. Why is that wrong?",
      choices: ["The platform average is count-weighted over the 82 stamped checkouts — LATAM's 2 barely move it; the big EU and APAC books anchor it", "The platform number is the median, not the mean", "LATAM's 3.5 is excluded from the platform average as an outlier", "The platform average is the plain mean of the four regional numbers"],
      answer: 0,
      why: "The 2.98 is a per-checkout average over 82 stamped rows — dominated by EU's 36 and APAC's 29 stamps; LATAM carries 2. The mean-of-region-averages trap gives (2.93+2.94+3.07+3.5)/4 = 3.11, a number no one computes and nobody publishes.",
      notes: [
        { choice: 1, why: "It is AVG — the mean, per checkout. A median of 82 values is a different statistic and not what the clock reports." },
        { choice: 3, why: "That unweighted mean is 3.11 — the drift-report version of fiction. Regional averages only reconcile to the platform number when weighted by their stamp counts." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-7",
      prompt: "WHERE shipped_at IS NULL returns 21 checkouts, but the approved-not-started stage holds only 14. What are the other 7?",
      choices: ["Declined checkouts — all 7 cancelled rows also carry no activation stamp", "Approved checkouts that were activated without a stamp", "Duplicate checkout rows", "Merchant settlements missing legs"],
      answer: 0,
      why: "Every cancelled checkout on this book predates activation, so the stamp-less population is 14 pending + 7 declined = 21. The stamp is a lifecycle fact; status is a label — the 21-vs-14 gap is the two classifications disagreeing, and both are true.",
      notes: [
        { choice: 1, why: "An activated checkout without a stamp would break the census — on this book, zero exist. The gap is the declined stage, not dirty stamps." },
        { choice: 2, why: "No duplicates — 103 rows reconcile across every census. The 7 are real declines that never reached a debit." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-8",
      prompt: "A colleague writes GROUP BY s.id ... HAVING fee_base > 5000 on the fee-base query, and it runs fine in SQLite. A reviewer objects. What is the real issue?",
      choices: ["Referring to a SELECT alias inside HAVING is a SQLite extension, not standard SQL — the portable form re-states the aggregate: HAVING SUM(oi.quantity * oi.unit_price) > 5000", "HAVING cannot take numeric comparisons", "The alias must be declared inside GROUP BY to be usable in HAVING", "Nothing — aliases are standard in HAVING everywhere"],
      answer: 0,
      why: "SQLite resolves output aliases in HAVING as an extension; PostgreSQL and most engines reject fee_base in that position. The portable form re-states the aggregate. On this book both forms keep the same two merchants — Nordic 11,130.25 and Midwest 9,294.93, with Alpine's 4,765.63 under the bar — but portability, not the rows, is the argument.",
      notes: [
        { choice: 1, why: "HAVING compares group-level values all day — numeric thresholds are its whole job. The objection is to the alias reference, not the comparison." },
        { choice: 2, why: "Aliases belong to SELECT, not GROUP BY. The portable fix is re-stating the aggregate, not relocating the alias." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-9",
      prompt: "The coverage fold reads CASE WHEN SUM(p.amount_cents) = i.amount_cents THEN 'exact' ELSE 'partial' END — with no zero arm. Where do the six never-collected statements land?",
      choices: ["'partial' — SUM over no legs is NULL, NULL = anything is UNKNOWN, so they miss 'exact' and fall to ELSE", "'exact' — an empty SUM equals any amount", "The query errors on the NULL comparison", "They are excluded from the result entirely"],
      answer: 0,
      why: "An empty fold returns NULL, and NULL = 15217-style comparisons are UNKNOWN — never true. So all 6 statements (15,217.00 promised) silently file as 'partial', inflating that bucket to 7 and breaking the census against the probed 21 exact / 1 partial / 6 none.",
      notes: [
        { choice: 1, why: "An empty SUM is NULL, not zero — equality with NULL is UNKNOWN, never true. That is exactly why the bug is silent." },
        { choice: 2, why: "Nothing errors — NULLs flow through comparisons quietly. The fix is an explicit zero arm (or COALESCE) BEFORE the equality test, so 'no payment' gets its own bucket." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-10",
      prompt: "The repeat-schedule ladder runs 24, 17, 14, 13, 5 checkouts, then FOUR shoppers tie at 4. Under DENSE_RANK, what rank do the two 3-checkout shoppers carry?",
      choices: ["6", "10", "7", "9"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: 1, 2, 3, 4, 5, then the four-way tie reads 6 — the next distinct count (3) lands on 7. RANK would have consumed ranks 6 through 9 and handed the 3s a 10.",
      notes: [
        { choice: 1, why: "10 is the RANK answer — shared rungs plus the skip. The ladder's published policy decides which function ships." },
        { choice: 2, why: "7 is the rank of the NEXT distinct count under DENSE_RANK, not the tie block's rank. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-11",
      prompt: "In the Afterpay stage map, a checkout's status reads 'pending'. What does that mean?",
      choices: ["Approved, but the first installment has not landed yet — 14 checkouts with no activation stamp", "Live mid-clock — installments are riding", "Fully settled — every installment paid", "Declined at the no-credit-check gate"],
      answer: 0,
      why: "Pending = approved-not-activated: 14 of 103 checkouts (13.6%, 6,113.00) whose shipped_at is still NULL. They carry no clock yet — a population definition, not a cleanup job.",
      notes: [
        { choice: 1, why: "Mid-clock is 'shipped' — 30 checkouts with the stamp landed. Pending has no stamp; that is the entire distinction." },
        { choice: 3, why: "Declined is 'cancelled' — 7 checkouts the gate turned away. Pending money is approved; it just has not debited." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-12",
      prompt: "The payments table splits 16 card legs and 11 wire legs. In this kit's mapping, the card rail carries…",
      choices: ["Merchant settlements — partner money moving back", "Late fees collected on missed debits", "Consumer debits — the 4-pay installments, 37,364.00 across 16 legs", "Refunds issued to shoppers"],
      answer: 2,
      why: "Card legs are consumer debits: 16 legs totaling 37,364.00. Wire legs (11, 32,248.00) are merchant settlements — the two rails meet on the same statement, 5 of them.",
      notes: [
        { choice: 0, why: "Wire is the merchant-settlement rail. Swapping the rails misreads which side of the marketplace the money belongs to." },
        { choice: 2, why: "Late fees are capped revenue on missed debits — not a rail. The rail split is about WHO the money moves between, not why." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-13",
      prompt: "Across the 36-line expense book, which category is the biggest opex line?",
      choices: ["Ads — 14 lines, 4,570.00", "Rent — 14 lines, 16,800.00, about 66.1% of the 25,416.00 book", "Travel — 3 lines, 2,521.00", "Tools — 5 lines, 1,525.00"],
      answer: 1,
      why: "Rent dominates: 16,800.00 of 25,416.00 total — 66.1% of the ops burn, and the ledger's operating_expenses account (25,416.00 debits) reconciles to exactly this rollup.",
      notes: [
        { choice: 0, why: "Ads ties Rent on line count (14) but not dollars — 4,570.00. Line counts and money are different grains; the biggest CATEGORY is by dollars." },
        { choice: 2, why: "Travel is 3 lines at 2,521.00 — fewer lines, more per line, still a distant third. The per-line read is a different question." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-14",
      prompt: "Which market carries the most financed checkouts?",
      choices: ["APAC — 37 checkouts from 5 shoppers", "US — 19 checkouts from 2 shoppers", "EU — 45 checkouts from 8 shoppers", "LATAM — 2 checkouts from 1 shopper"],
      answer: 2,
      why: "EU leads on both grains: 45 checkouts from 8 distinct shoppers (15,089.23). The US is the intensity outlier — 19 checkouts from just 2 shoppers, 9.5 per shopper.",
      notes: [
        { choice: 1, why: "The US wins AOV (383.48) and intensity, not volume. Count and ratio are different claims — the deck quotes both." },
        { choice: 3, why: "LATAM is 2 checkouts, both delivered — the smallest book, not the biggest. Its 0.0% decline share is a sample-size story." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-15",
      prompt: "251 installment lines across 103 checkouts — the kit quotes 2.44. What does that number measure?",
      choices: ["Installments per line", "Scheduled debits per checkout", "Checkouts per shopper", "Installment lines per checkout"],
      answer: 3,
      why: "251 lines / 103 checkouts = 2.44 lines per checkout — a big basket fans into several installment lines. The other grain divides are 498/251 = 1.98 debits per line and 498/103 = 4.84 debits per checkout.",
      notes: [
        { choice: 1, why: "Debits per checkout is SUM(quantity) / checkouts = 498/103 = 4.84 — the collection-workload read, not the basket-fan-out read." },
        { choice: 0, why: "Debits per line is 498/251 = 1.98, and max is 3 per line. Every ratio on this book is a fraction of two specific counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-16",
      prompt: "Every statement's issue-to-due window reads exactly 30 days (30/30/30 across all 28). What does that uniformity buy the dunning engine?",
      choices: ["Statements all fall due on the same calendar date", "One aging ladder fits the whole book — day-30 is the same edge for every statement", "The clock resets every time a partial payment lands", "Terms are renegotiated per merchant"],
      answer: 1,
      why: "Uniform 30-day terms mean a single aging ladder classifies all 28 statements identically — the bucket logic is written once and means the same thing everywhere.",
      notes: [
        { choice: 0, why: "Due DATES differ — statements issue across 14 months. Uniform TERMS, not uniform dates, is what makes one ladder valid." },
        { choice: 2, why: "The issue-to-due window never moves; what moves is the settlement clock (13 to 84 days). Conflating them misbuilds the aging." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-17",
      prompt: "The approval-month spine troughs at 1,193.86. Which month is the trough?",
      choices: ["2024-11 (1,648.80)", "2025-01 (1,669.50)", "2024-06 (2,047.43)", "2024-07 (1,193.86, with 2 cancellations)"],
      answer: 3,
      why: "July 2024 is the trough — 1,193.86 — and it carries 2 of the book's 7 cancellations. November 2024 (also 2 cancellations) is the other dip at 1,648.80.",
      notes: [
        { choice: 0, why: "November is the steepest DROP into a dip (-1,326.87 into it) and the other 2-cancellation month — close, but its book is 1,648.80, not the trough." },
        { choice: 1, why: "January 2025 is the second-lowest month (1,669.50) with 1 cancellation — the near-miss that makes the trend read interesting." },
      ],
      difficulty: "easy",
    },
    {
      id: "afterpay-mcq-18",
      prompt: "How many shoppers carry a lifetime financed total of at least 2,000.00?",
      choices: ["4", "8", "11", "5 — and that cohort holds 71.2% of the book"],
      answer: 3,
      why: "Exactly five: 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56 / 2,667.93 — the next shopper sits at 1,686.17. That 2,000-plus cohort is 71.2% of the 34,833.28 book.",
      notes: [
        { choice: 0, why: "Four is the 3,000-plus cut (63.5%) — Dubois at 2,667.93 just misses it. The floor moves the cohort; that is the concentration slide's whole point." },
        { choice: 1, why: "Eight is the >=1,000 cohort — the 1,686.17 / 1,458.97 / 1,098.60 trio joins. Same ladder, wrong threshold." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-19",
      prompt: "Statement #25 shows 4,000.00 collected of 6,148.00 billed. What share has been collected, to 1 decimal?",
      choices: ["65.1%", "153.7%", "35.0%", "64.9%"],
      answer: 0,
      why: "100.0 * 4000 / 6148 = 65.1 — the REAL multiplier before the division keeps it floating point. It is the book's single partial-coverage statement.",
      notes: [
        { choice: 1, why: "153.7% is the division inverted (6148/4000). Billed-over-collected reads as a coverage factor, not a share." },
        { choice: 2, why: "35.0% is the SHORTFALL share (2,148.00 missing of 6,148.00). Collected share and outstanding share sum to 100 — know which one the deck quotes." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-20",
      prompt: "The paid book is 21 statements totaling 66,443.00. What is the average PAID STATEMENT?",
      choices: ["2,578.22", "3,314.86", "3,163.95", "69,612.00"],
      answer: 2,
      why: "66,443.00 / 21 = 3,163.95 per paid statement — the statement-grain average the credit committee quotes. The cents read is AVG(amount_cents) / 100.0.",
      notes: [
        { choice: 0, why: "2,578.22 is the average PAYMENT ROW (69,612.00 over 27 legs) — the leg grain, not the statement grain. Three grains, three averages." },
        { choice: 1, why: "3,314.86 divides ALL 27 legs' dollars by the 21 paid statements — a mixed-grain fraction that matches no population on the book." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-21",
      prompt: "The ledger's operating_expenses account carries 25,416.00 debits. Which rollup does that reconcile to?",
      choices: ["Rent 16,800.00 + Ads 4,570.00 + Travel 2,521.00 + Tools 1,525.00", "Rent 16,800.00 alone", "Rent + Ads = 21,370.00", "sales_revenue at 86,052.00"],
      answer: 0,
      why: "The four expense categories sum to 25,416.00 over 36 lines — exactly the operating_expenses debits. The GL account and the category fold are two views of one burn.",
      notes: [
        { choice: 2, why: "21,370.00 is the two-biggest-categories trap. Dropping Travel and Tools breaks the tie to the ledger by 4,046.00." },
        { choice: 3, why: "sales_revenue is the revenue account (86,052.00 credits) — a different side of the trial balance entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-22",
      prompt: "SELECT i.number, SUM(i.amount_cents) FROM invoices i JOIN payments p ON p.invoice_id = i.id GROUP BY i.id — what is wrong with sizing the billed book this way?",
      choices: ["Nothing — the join deduplicates legs automatically", "The five two-leg statements contribute their billed amount TWICE — 24,940.00 of phantom bill", "The sum undercounts because legs are cents", "It errors — you cannot SUM a column from a joined table"],
      answer: 1,
      why: "Fan-out: 27 legs against 28 statements means #1, #5, #12, #19, #22 each join twice, doubling their billed cents. Fold payments per statement first, then join 1:1.",
      notes: [
        { choice: 0, why: "Joins never deduplicate — they multiply by matching rows. The billed book reads 86,977.00 + 24,940.00 of phantom unless the fold comes first." },
        { choice: 3, why: "It runs fine — that is exactly why fan-out is dangerous. The wrong number ships silently, with a plausible-looking total." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-23",
      prompt: "NTILE(4) over the 103-checkout book ordered by total — how do the four tiles fall?",
      choices: ["25.75 rows each", "25/25/25/28", "26/26/26/25", "26/25/26/26"],
      answer: 2,
      why: "103 rows into 4 tiles: the remainder 3 is distributed to the EARLIER tiles — 26/26/26/25. Tiles are integer row buckets, never fractions.",
      notes: [
        { choice: 0, why: "25.75 is the arithmetic mean, not a tile size. NTILE cannot create a quarter-row; the remainder goes to the front tiles." },
        { choice: 1, why: "That is the remainder-to-the-back distribution. The standard gives extra rows to the leading tiles — check your engine's tie behavior before quoting tile edges." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-24",
      prompt: "How many of the 28 statements carry at least one settlement leg?",
      choices: ["22 — 17 single-leg plus 5 two-leg", "21 — the paid book", "27 — one per leg", "28 — every statement settles"],
      answer: 0,
      why: "22 statements carry legs: 17 with exactly one leg and 5 with two (the split-rail statements) — 27 legs total. The leg distribution 0/1/2 legs reads 6/17/5.",
      notes: [
        { choice: 1, why: "21 is the paid-STATUS count — but #28 is paid with zero legs while void #11 carries one. Status and legs disagree by design; that is the census." },
        { choice: 2, why: "27 is the LEG count. Counting legs and calling them statements is the grain trap the whole kit drills." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-25",
      prompt: "Five statements settle on BOTH rails. Which query finds them?",
      choices: ["WHERE method IN ('card', 'wire')", "GROUP BY invoice_id HAVING COUNT(DISTINCT method) = 2", "GROUP BY method HAVING COUNT(*) > 5", "A UNION of the card query and the wire query"],
      answer: 1,
      why: "Fold legs per statement, then keep statements whose DISTINCT method count is 2 — that is the definition of split-rail. It returns exactly the 5 statements.",
      notes: [
        { choice: 0, why: "That matches every card leg OR wire leg — all 22 leg-carrying statements, not the 5 with BOTH. OR is not BOTH." },
        { choice: 2, why: "GROUP BY method counts rails, not statements — it can never answer a per-statement question. The fold grain is wrong before the HAVING is even read." },
      ],
      difficulty: "medium",
    },
    {
      id: "afterpay-mcq-26",
      prompt: "SUM(amount_cents) OVER (ORDER BY paid_on) builds a running total — but two legs share the same paid_on. What does the running sum do at that pair?",
      choices: ["Adds one leg, then the other across two rows — ROWS semantics", "Errors — ties are undefined in windows", "Skips the second leg entirely", "Adds BOTH tied legs at once — the default frame is RANGE, and ties are peers"],
      answer: 3,
      why: "With ORDER BY and no frame clause, the frame is RANGE — peer rows with equal ORDER BY values enter the aggregate together. Same-day settlements move the running total twice on one row boundary.",
      notes: [
        { choice: 0, why: "That is ROWS BETWEEN behavior — real, but only when you write ROWS explicitly. The default is RANGE, and the difference is the bug." },
        { choice: 2, why: "Nothing is skipped — both legs land in the total. The subtlety is WHEN: together on the same row, not one per row." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-27",
      prompt: "Find statements with no settlement legs: NOT IN (SELECT invoice_id FROM payments) versus NOT EXISTS. A stray NULL invoice_id appears in payments. Which report survives?",
      choices: ["NOT EXISTS — NOT IN's NULL poisons the comparison list and empties the report", "NOT IN — NULLs are ignored in IN lists", "Both survive — they are equivalent", "Neither — you must use a LEFT JOIN … IS NULL"],
      answer: 0,
      why: "NOT IN with one NULL in the subquery makes every comparison UNKNOWN — the report returns zero rows while looking valid. NOT EXISTS stops at the first match and ignores NULL payloads entirely.",
      notes: [
        { choice: 1, why: "NULLs are not ignored in NOT IN — they are fatal. x NOT IN (1, NULL) is never TRUE, for any x. That is the silent-empty bug." },
        { choice: 3, why: "LEFT JOIN … IS NULL also works and is the classic anti-join — but NOT EXISTS was never broken. The question is which survives the NULL, and only EXISTS does." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-28",
      prompt: "A stage-census CASE has arms for delivered, shipped and pending — but no ELSE. What does the result look like over this book?",
      choices: ["The query errors — CASE requires an ELSE", "The 7 declined checkouts print as 'pending'", "A seventh group appears under a NULL stage, holding all 7 declined — and the named stages count 96, not 103", "The declined checkouts vanish silently from the result"],
      answer: 2,
      why: "Without an ELSE, unmatched rows fall through as NULL, and GROUP BY folds NULLs into their own group — a NULL-stage row of 7. The three named buckets sum to 96; the branches-sum-to-103 identity breaks visibly.",
      notes: [
        { choice: 0, why: "CASE without ELSE is legal — the missing arm becomes NULL, not a syntax error. That is precisely why the hole is silent." },
        { choice: 3, why: "They do not vanish — they pool in the NULL group. Either way the census is broken; the fix is an explicit ELSE arm and the 103 reconciliation." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-29",
      prompt: "100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (PARTITION BY c.region) — grouped by shopper. What does the window fold compute?",
      choices: ["Errors — aggregates cannot nest inside OVER", "Each shopper's share of the GLOBAL book", "Each shopper's share of its REGION's book — while keeping one row per shopper", "The region total repeated on every row, replacing the shopper's own total"],
      answer: 2,
      why: "The GROUP BY folds first; the window then reads GROUP-level results — SUM(SUM(...)) is standard. The fold is the region book (EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44), so each row carries shopper dollars and that shopper's regional share.",
      notes: [
        { choice: 0, why: "Nesting an aggregate inside a window is exactly how window shares work — RATIO_TO_REPORT is this pattern with a name. It runs fine in SQLite." },
        { choice: 1, why: "Global share needs SUM(SUM(o.total)) OVER () with no PARTITION — the whole book, 34,833.28. The PARTITION BY region is what scopes the denominator." },
      ],
      difficulty: "hard",
    },
    {
      id: "afterpay-mcq-30",
      prompt: "The month spine uses SUBSTR(created_at, 1, 7) — 14 buckets from 2024-01 to 2025-02. A colleague switches to SUBSTR(created_at, 6, 2). The result:",
      choices: ["12 buckets — January 2024 merges with January 2025 and the trend becomes fiction", "Still 14 buckets — the substrings are equivalent", "7 buckets", "The query errors on the new substring"],
      answer: 0,
      why: "Dropping the year keeps only the month digits: 12 distinct values, with the two Januaries folded into one bucket. The 14-month spine needs year + month — '%Y-%m', not '%m'.",
      notes: [
        { choice: 1, why: "14 versus 12 — the counts differ, so the substrings are not equivalent. The two Januaries (3,731.97 and 1,669.50) would sum into one fiction." },
        { choice: 2, why: "Seven would be quarters-by-position or a half-year read — no fold of month digits produces 7. The real collapse is 14 → 12." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-afterpay-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The approval funnel census",
      brief:
        "Risk-policy memo ahead of the quarterly decline-rate review: the approval funnel goes to the committee as one census — four stages, one pass, reconciling to the book by construction. Probed facts: 103 financed checkouts worth 34,833.28 — 52 fully settled (50.5%), 30 live mid-clock (29.1%), 14 approved but not yet activated (13.6%), 7 declined at the no-credit-check gate (6.8%). Stage dollars ride the same fold: completed 15,571.07, mid-schedule 11,996.72, approved-not-started 6,113.00, declined 1,152.49. The committee reads biggest stage first and asks the denominator before anything else.",
      ask: "Return each funnel stage with its checkout count, share of the 103-checkout book to 1 decimal, and principal to 2 decimals, biggest stage first.",
      template:
        "SELECT CASE WHEN o.status = 'delivered' THEN 'completed'\n            WHEN o.status = {3} THEN 'mid_schedule'\n            WHEN o.status = 'pending' THEN 'approved_not_started'\n            ELSE {4} END AS stage,\n       COUNT(*) AS checkouts,\n       ROUND({2} * COUNT(*) / {1}, 1) AS book_share,\n       ROUND(SUM(o.total), 2) AS principal\nFROM orders o\nGROUP BY stage\nORDER BY checkouts {5};",
      slots: [
        {
          answer: "103",
          kind: "number",
          noVerify: true,
          label: "the funnel denominator",
          why: "The share base is ALL checkouts booked — declines stay in, because 'declined at the gate' is a funnel outcome, not noise. 82 re-bases to the activated population (completed reads 63.4) and 96 to the approved-only base; both make the census read a different funnel than the one policy reviews.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the share multiplier",
          why: "100.0 is REAL, so the division runs in floating point: completed prints 50.5. Bare 100 multiplies after an integer division that already truncated — 52*100/103 floors to 50 and every stage reads a whole number that reconciles with nothing.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the live-stage arm",
          why: "The live stage is the 'shipped' status — 30 checkouts riding the clock. 'Paid' matches no status on this book, so all 30 silently fall through to the ELSE arm and the declined bucket swells to 37; 'completed' re-tests arm one and never fires.",
        },
        {
          answer: "'declined'",
          kind: "keyword",
          label: "the gate-outcome arm",
          why: "Declined is the ELSE arm — 7 checkouts the no-credit-check gate turned away. Any other label re-files those 7 (or merges them into another stage) and the census stops reconciling to the 103 the committee quotes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-stage-first",
          why: "The committee reads the funnel top-down: 52, 30, 14, 7. ASC opens on the 7 declined — a correct query aimed at the wrong end of the funnel.",
        },
      ],
      distractors: ["100", "82", "'paid'", "'completed'", "ASC", "COUNT"],
      walkthrough:
        "One table, one CASE fold, four stages. The CASE maps each checkout's status to a funnel stage — delivered to completed, the shipped arm to mid_schedule, pending to approved_not_started, everything else to declined — and GROUP BY folds the 103 rows into four. The share column divides by the full book: 100.0 × 52 / 103 prints 50.5, and the REAL multiplier keeps the division floating-point. Ordered biggest-first the census reads: completed 52 (50.5%, principal 15,571.07), mid_schedule 30 (29.1%, 11,996.72), approved_not_started 14 (13.6%, 6,113.00), declined 7 (6.8%, 1,152.49) — principals footing to 34,833.28. The distractors fail honestly: 82 in the denominator re-bases the funnel to activated checkouts only and reads 63.4 for completed; bare 100 truncates the integer division and prints 50.0; 'paid' matches no status so the 30 live checkouts collapse into the declined bucket (37); 'completed' in the ELSE arm merges the 7 declined into a 59-row completed stage; ASC inverts the read; COUNT in any constant slot is a syntax error. The definition ships with the number: declined stays in the base — 6.8%, not the 7.3 an approved-only denominator would print.",
    },
    {
      id: "cs-afterpay-2",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The merchant fee book",
      brief:
        "Partnerships memo before the Nordic renewal call: the fee base goes into the deck at merchant grain — Afterpay's revenue is a merchant fee on financed GMV, so per-merchant financed principal IS the negotiation table. Probed facts: the installment ledger foots to the 34,833.28 checkout book — SUM(quantity × unit_price) over the 251 lines — and the merchant fold reads Nordic Gadgets AB 11,130.25 (32% of the base), Midwest Hardware Co 9,294.93 (26.7%), Alpine Audio GmbH 4,765.63, Andes Naturals SA 3,613.25, Shenzhen Electro 3,049.07, Pacific Textiles 2,980.15. Nordic's 43 installment lines came from 38 distinct checkouts — lines are debits, checkouts are schedules, and the deck quotes both grains.",
      ask: "Return each merchant with its region, distinct SKUs financed, installment lines, distinct checkouts financed and fee base to 2 decimals, biggest fee base first.",
      template:
        "SELECT s.name AS merchant,\n       s.region AS region,\n       COUNT(DISTINCT p.id) AS skus_financed,\n       COUNT(*) AS financed_lines,\n       COUNT({2} oi.order_id) AS checkouts_financed,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS fee_base\nFROM order_items oi\nJOIN products p ON p.id = oi.{3}\nJOIN suppliers s ON s.id = {4}\nGROUP BY s.id\nORDER BY fee_base {5};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the cents precision",
          why: "Fee bases are quoted to the cent — Nordic 11,130.25 exactly as the ledger reads. ROUND to 1 decimal prints 11,130.3 and the deck stops reconciling with the 34,833.28 book finance quotes on the same slide.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the checkout deduplicator",
          why: "COUNT(DISTINCT oi.order_id) folds repeat lines back to checkouts: Nordic reads 38 checkouts behind its 43 lines. Bare COUNT(*) counts lines, SUM(quantity) counts debits, COUNT(p.id) counts SKUs — three different wrong grains wearing one column name.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "Installment lines attach to the catalog via oi.product_id matching p.id. Joining oi.order_id instead compares catalog keys to checkout keys and fans the fold into noise; oi.customer_id does not exist on lines and errors loudly — the better failure.",
        },
        {
          answer: "p.supplier_id",
          kind: "keyword",
          label: "the merchant join key",
          why: "The merchant key is p.supplier_id matching s.id. Substituting s.id compares the merchant to itself — every line matches every merchant and the fee base explodes sixfold; oi.product_id double-jumps the chain and prices merchants with other merchants' SKUs.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-base-first",
          why: "The renewal deck reads biggest base on top: Nordic 11,130.25 leads, Pacific Textiles 2,980.15 closes. ASC buries the merchant the meeting is actually about.",
        },
      ],
      distractors: ["0", "1", "ALL", "s.id", "ASC", "MAX"],
      walkthrough:
        "A three-table chain, folded at merchant grain. Installment lines join the catalog on the product key and the catalog joins merchants on the supplier key, so every line carries its merchant's name and region; GROUP BY s.id folds 251 lines into six rows. The fee base is the financed principal — SUM(quantity × unit_price) to 2 decimals: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15, footing to 34,833.28. The two-grain columns are the read: Nordic shows 3 SKUs, 43 lines but 38 distinct checkouts — lines are debits, checkouts are schedules — and Andes is the one merchant where 25 lines and 25 checkouts agree, meaning zero repeat checkouts. The distractors fail honestly: ROUND to 0 or 1 decimal breaks the cents reconciliation; ALL in the deduplicator counts lines (43) where the deck wants checkouts (38); s.id in the merchant-key slot joins every line to every merchant; ASC opens the deck on Pacific; MAX in the precision slot errors outright. Concentration is the punchline: the top two merchants hold 58.7% of the fee base — one renegotiation moves the P&L.",
    },
    {
      id: "cs-afterpay-3",
      tier: "easy",
      topic: "l7",
      universe: "month-close",
      title: "The rail census",
      brief:
        "Settlement-ops memo on close day, before the ledger tie-out: the rail census goes into the close pack as one single-table fold over the payments book — card legs are {rose:consumer debits} riding the 4-pay installments, wire legs are {sky:merchant settlements} moving partner money back. Probed facts: 27 legs across 22 statements — card 16 legs settling 37,364.00, wire 11 legs settling 32,248.00 — and 5 statements settle on BOTH rails, so the census counts legs, never statements. Money columns are INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each rail with its leg count, settled dollars and average leg, both money columns to 2 decimals, biggest rail first.",
      template:
        "SELECT {1} AS rail,\n       {3} AS legs,\n       ROUND(SUM(amount_cents) / {2}, 2) AS rail_dollars,\n       ROUND(AVG(amount_cents) / 100.0, 2) AS avg_leg\nFROM payments\nGROUP BY method\nORDER BY rail_dollars {4};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail key",
          why: "method is the rail column: card folds to 16 legs / 37,364.00 (consumer debits), wire to 11 / 32,248.00 (merchant settlements). invoice_id as the rail key re-files the fold at leg grain — 27 one-leg groups instead of two rails — and a constant prints the same label on both rows.",
        },
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents divider",
          why: "Payments store INTEGER cents, so the dollar read divides by 100.0: card prints 37,364.00 exactly as the close pack quotes. /1000 misreads the book ten times small (3,736.40) and /10 ten times large (373,640.00) — either way the rails stop footing to the 69,612.00 the ledger's cash credit carries.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the leg counter",
          why: "Legs are rows of payments, so COUNT(*) reads 16 and 11 — the leg grain the census is named for. A numeric constant prints the same fake count on both rails, and any non-aggregate expression replaces the count with something that is not a count.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-rail-first",
          why: "The close pack reads the consumer rail first: card 37,364.00, then wire 32,248.00. ASC opens on wire — the merchant side — when the memo reads card first, and a numeric constant in the sort slot is read as an out-of-range ordinal that errors the build.",
        },
      ],
      distractors: ["10", "1000", "ASC", "DISTINCT"],
      walkthrough:
        "One table, one fold, two rails. payments GROUP BY method folds 27 legs into two rows: card 16 legs, 37,364.00, average leg 2,335.25; wire 11 legs, 32,248.00, average leg 2,931.64 — the sums footing to the 69,612.00 the ledger's cash credit carries. The read is leg-grain by definition: 5 of the 22 leg-carrying statements settle on BOTH rails, so a statement-grain census would double-count them. The cents rule does the money work: SUM(amount_cents) / 100.0 with ROUND(...,2) prints dollars to the cent, and the AVG column exposes the rails' shape — wire legs run bigger because a merchant settlement batches a whole statement cycle. The distractors fail honestly: 10 in the divider inflates the book to 373,640.00, 1000 deflates it to 3,736.40, either breaking the 69,612.00 tie-out; 10 or 1000 in an expression slot is a constant wearing a label's clothes; ASC opens the pack on wire or errors outright; DISTINCT is a syntax error wherever it lands. Definition ships with the number: this is a LEG census — 27 legs over 22 statements, 5 split-rail — never quote it as 28.",
    },
    {
      id: "cs-afterpay-4",
      tier: "medium",
      topic: "t3",
      universe: "refund-audit",
      title: "The settlement clock",
      brief:
        "Dunning memo before the letter run: the {amber:settlement clock} decides who gets chased first, and it runs issued_on → first settlement leg — not the 30-day terms clock every statement shares. Probed facts: terms are uniform 30/30/30 across all 28 statements; the paid book settles in 28.4 days on average (fastest 13, slowest 84), with 20 of the 21 paid statements carrying legs; the per-status rebuild reads paid 28.45 days at 2 decimals, void 27.0 on the lone void-but-debited statement (#11, 925.00), open 19.0 on the lone partially-collected one (#25, 4,000.00 of 6,148.00). Status is a claim, legs are the ledger — the clock only counts statements that actually settled.",
      ask: "Return each statement status with its statement count and average issue-to-first-leg clock in days to 2 decimals, slowest status first.",
      template:
        "SELECT i.status AS statement_status,\n       COUNT(*) AS statements,\n       ROUND(AVG(julianday({2}) - julianday(i.issued_on)), 2) AS clock_days\nFROM invoices i\nJOIN (SELECT invoice_id, {3}(paid_on) AS first_leg FROM payments GROUP BY invoice_id) f\n  ON f.invoice_id = {1}\nGROUP BY i.status\nORDER BY clock_days DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "Legs tie to statements on p.invoice_id = i.id — one fold row per statement. i.customer_id compares leg keys to shopper keys: the join still runs and returns 28 rows whose clocks are nonsense negatives, which is exactly why wrong-key joins ship — they execute.",
        },
        {
          answer: "f.first_leg",
          kind: "keyword",
          label: "the settle stamp",
          why: "The clock runs issued_on → the statement's FIRST settlement leg. i.due_on measures the uniform 30-day terms (30/30/30 across the book — a terms clock, not a settlement clock) and i.issued_on measures zero days everywhere.",
        },
        {
          answer: "MIN",
          kind: "keyword",
          label: "the first-leg fold",
          why: "MIN(paid_on) per statement stamps the day the schedule first collected — the anchor dunning keys off. MAX stamps the LAST leg and stretches the paid book past the 28.4 the facts file quotes; a bare number in the fold slot is a syntax error.",
        },
      ],
      distractors: ["0", "1", "i.due_on", "i.issued_on", "MAX"],
      walkthrough:
        "Stage the fold, then read the clock. The derived table folds payments to one first-leg stamp per statement (MIN(paid_on) over the 22 leg-carrying statements), the join attaches stamps to invoices on the statement key, and GROUP BY i.status averages the clock per status: paid 20 statements at 28.45 days — the facts file's 28.4 at one decimal — void 1 at 27.0, open 1 at 19.0. The two single-row statuses ARE the anomaly list: void-but-debited #11 collected its 925.00 leg 27 days after issue, and open #25's 4,000.00 partial landed in 19 — a status that lies in both directions, caught only because legs are the ledger. Grain note: this clock is first-leg at statement grain; leg-grain averaging reads 29.52 on the paid book (probed) because the 5 split-rail statements carry two legs each. The distractors fail honestly: i.customer_id joins on shopper keys and returns 28 rows of negative-day fiction; i.due_on prints the uniform 30/30/30 terms — a clock nobody duns on; i.issued_on zeroes the book; MAX reads last legs and inflates the clock; 0 or 1 in the join key collapses the census to zero or one row.",
    },
    {
      id: "cs-afterpay-5",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The financed-dollars ladder",
      brief:
        "Winback memo ahead of the quarterly budget call: the repeat-spend ladder goes to the committee at shopper grain, and the winback budget follows the {violet:2,000-plus cohort} — five shoppers holding 71.2% of the 34,833.28 book, led by Alice Chen at 24 checkouts / 7,262.35. The floor is a policy, not a default: probed floor shapes — 1,000 admits the 1,686.17 / 1,458.97 / 1,098.60 trio for 8 rows, 3,000 cuts Dubois for 4 — so the number in HAVING is the decision the deck quotes. Financed dollars ride orders.total (REAL, no cents fold), the ladder counts booked checkouts with declines included, and ranks share out with no dollar ties on this book.",
      ask: "Rank shoppers by lifetime financed dollars, keep the 2,000-plus cohort, and return name, market, checkout count, dollars to 2 decimals and rank.",
      template:
        "SELECT c.name AS shopper,\n       c.region AS market,\n       COUNT(o.id) AS checkouts,\n       ROUND(SUM(o.total), {3}) AS financed_total,\n       RANK() OVER (ORDER BY SUM(o.total) DESC) AS dollar_rank\nFROM orders o\nJOIN customers c ON {2} = c.id\nGROUP BY c.id\nHAVING SUM(o.total) >= {1}\nORDER BY dollar_rank, financed_total DESC;",
      slots: [
        {
          answer: "2000",
          kind: "number",
          noVerify: true,
          label: "the cohort floor",
          why: "The winback cohort is the 2,000-plus five — 71.2% of the book. 1,000 re-admits the 1,686.17 / 1,458.97 / 1,098.60 trio for 8 rows and 3,000 cuts Dubois to 4: same query, different committee decision. The threshold never appears in the result cells, which is why it ships with its definition attached.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the checkout-to-shopper key",
          why: "Checkouts attach to shoppers on o.customer_id = c.id. o.id compares checkout ids to shopper ids and pairs 16 unrelated rows; c.id = c.id is a tautology that fans all 103 checkouts onto every shopper and ties the whole ladder at one number.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cents precision",
          why: "Financed totals quote to the cent — Dubois reads 2,667.93 exactly as the ladder prints. ROUND to 1 prints 2,667.9 and the cohort's dollars stop footing with the 34,833.28 book the same slide quotes.",
        },
      ],
      distractors: ["0", "1", "ASC", "c.region"],
      walkthrough:
        "Aggregate, rank, then cut by policy. The join attaches each checkout to its shopper, GROUP BY c.id folds 103 checkouts into 16 shoppers, and RANK() OVER (ORDER BY SUM(o.total) DESC) ladders them — Alice Chen 24 / 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56, Chloe Dubois 5 / 2,667.93 — before HAVING keeps the 2,000-plus five, the 71.2% cohort. No dollar ties on this book, so RANK, DENSE_RANK and ROW_NUMBER agree up here — the tie policy matters one floor down, where four shoppers sit at 4 checkouts each. The distractors fail honestly: 0 or 1 in the floor re-admits all sixteen shoppers and the cohort read dissolves; c.region in the join key matches text to integer ids and empties the ladder, in the floor it compares dollars to a zero-cast region and re-admits everyone, in the precision slot it rounds to zero decimals; ASC errors in every slot — the direction is baked into the window's ORDER BY. Definition ships with the number: booked dollars, declines included — the same denominator the stage census defends.",
    },
    {
      id: "cs-afterpay-6",
      tier: "hard",
      topic: "q5",
      universe: "fraud",
      title: "The coverage census rebuild",
      brief:
        "Close memo, last gate before the ledger tie-out: the {violet:coverage census} must read 21 exact (65,612.00 both sides), 1 partial (#25: 4,000.00 of 6,148.00) and 6 never-collected (15,217.00) or the close does not ship. The fold is a derived table — one paid_cents line per statement — because status is a claim and legs are the ledger: void-but-debited #11 folds INTO exact (its 925.00 leg equals its 925.00 bill), paid-status #28 (1,756.00) folds OUT to never-collected on zero legs. The zero arm is explicit, not implied: an empty LEFT-joined SUM returns NULL, and NULL = anything is UNKNOWN — without COALESCE the six silently file as partial and the census lies.",
      ask: "Classify every statement exact, partial or never-collected, and return each class with statement count, billed and collected dollars to 2 decimals.",
      template:
        "SELECT coverage AS coverage_class,\n       COUNT(*) AS statements,\n       ROUND(SUM(billed_cents) / 100.0, 2) AS billed_dollars,\n       ROUND(SUM(paid_cents) / 100.0, 2) AS collected_dollars\nFROM (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents,\n         CASE WHEN {2}(SUM(p.amount_cents), 0) = 0 THEN {3}\n              WHEN SUM(p.amount_cents) = i.amount_cents THEN {4}\n              ELSE 'partial' END AS coverage\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = {1}\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY statements DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement grain key",
          why: "Legs tie to statements on p.invoice_id = i.id — one fold row per statement. i.customer_id joins leg keys to shopper keys: the census still runs and reads 1 exact beside 27 phantom partials (probed), a close-killing result that looks plausible on a slide.",
        },
        {
          answer: "COALESCE",
          kind: "keyword",
          label: "the zero-arm guard",
          why: "COALESCE(SUM(p.amount_cents), 0) turns the never-collected arm's NULL into a countable zero. NULLIF hands that arm a NULL instead — every comparison goes UNKNOWN and the six file as partial (probed: 21 exact / 7 partial / 0 none); SUM nested in SUM is a hard error.",
        },
        {
          answer: "'no payment'",
          kind: "keyword",
          label: "the never-collected label",
          why: "The close memo's bucket name — 6 statements, 15,217.00 billed, 0.00 collected, paid-lie #28 among them. 'none' or 'open' renames the bucket the reconciliation review quotes verbatim and the memo stops matching the census.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the covered label",
          why: "Legs summing to billed — 21 statements including void-but-debited #11, which folds in BY CONSTRUCTION. 'paid' would claim status proves coverage — the exact lie #28 taught this kit to stop telling.",
        },
      ],
      distractors: ["SUM", "NULLIF", "i.customer_id", "ASC", "'none'", "'open'"],
      walkthrough:
        "Fold first, classify second. The derived table LEFT-joins legs to statements on the statement key and folds one paid_cents line per statement — 28 rows, six of them zero by COALESCE — and the CASE reads arm by arm: zero first ('no payment'), then legs = billed ('exact'), else 'partial'. The outer fold prints the census the close quotes: exact 21 / 65,612.00 / 65,612.00, no payment 6 / 15,217.00 / 0.00, partial 1 / 6,148.00 / 4,000.00. The anomalies are the proof: #11's 925.00 leg equals its 925.00 bill, so void folds INTO exact; #28's zero legs push a 'paid' status INTO no payment — status is a claim, legs are the ledger. The distractors fail honestly: SUM(SUM(...), 0) errors outright; NULLIF leaves the none-arm NULL so the six file as partial (21/7/0, probed); i.customer_id builds 27 phantom partials; 'none' and 'open' rename buckets the memo quotes; ASC breaks the CASE arms wherever it lands. Definition ships with the number: coverage is measured in LEGS — the census reconciles because the fold, not the status column, decides.",
    },
  ],

  problems: [
    { slug: "sales-analysis-ii", why: "Shoppers who financed the flagship SKU but never came back — the cross-sell leak read is an anti-join over financed lines, exactly this problem's shape at schedule grain." },
    { slug: "combine-two-tables", why: "Shoppers LEFT JOINed to checkouts: the whitespace read. A shopper with no checkout is whitespace, a checkout with no shopper is corruption — choosing the join type is the business statement." },
    { slug: "employee-bonus", why: "Late-fee waivers are conditional: the fee posts only above a band, NULL otherwise — COALESCE turns the waiver gap into an explicit value instead of a silent NULL." },
    { slug: "number-of-calls-between-two-persons", why: "A split-rail statement settles with a consumer debit AND a merchant settlement on the same cycle — the symmetric-pair fold that counts both legs once each is this problem's exact shape." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Repeat-borrower gates: settled a schedule, opened another, never declined — the conditional-aggregation gate the winback pod runs before spending a dollar." },
    { slug: "second-highest-salary", why: "The second-priciest financed SKU (149.99 under the 199.99 ceiling) — scalar-subquery argmax with the tie question attached, exactly how the ticket-band ceiling gets defended." },
    { slug: "game-play-analysis-iv", why: "Share of approved checkouts whose shopper returns the next day — first-debit-to-return ratios are this problem's dated-cohort fold at BNPL grain." },
    { slug: "investments-in-2016", why: "Split schedules whose two legs share an amount — the same-value tie detection that finds equal-installment pairs is this problem's shape at line grain." },
    { slug: "market-analysis-i", why: "Checkouts and shoppers per month, both grains, one row — the 45-from-8 EU versus 19-from-2 US intensity read is this problem at db scale." },
    { slug: "bank-account-summary", why: "Statements LEFT JOINed to leg folds with zero-fill: debits and settlements per statement, NULLs to explicit zeros — the coverage census's exact fold." },
    { slug: "top-travellers", why: "Lifetime financed total per shopper, ranked, zero-checkout shoppers included — the LEFT-JOIN-and-SUM ladder the concentration review opens with." },
    { slug: "hopper-company-queries-ii", why: "Monthly decline share — cancelled over booked per month, honest denominator included — the funnel trend line the policy review re-cuts quarterly." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Installment legs that step across a schedule — LAG-flag reading of consecutive amounts is how the debit calendar gets audited before it ships." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Repeat borrowers whose baskets strictly grow — the islands-and-LAG pattern behind the ticket-growth cohort the fee forecast loves." },
    { slug: "sellers-with-no-sales", why: "Signed merchants with zero financed GMV this quarter — the fee-base anti-join partnerships runs before every renewal call." },
    { slug: "portfolio-weights", why: "Per-merchant share of the fee base — Nordic 32%, Midwest 26.7% — the window-share fold behind the concentration slide." },
    { slug: "loan-amortization-schedule", why: "The 4-pay clock IS an amortization schedule: four installments over six weeks, zero interest — a recursive spine that lays out every scheduled debit is exactly how the installment calendar gets published." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV at checkout grain: 2.44 lines per financed checkout against the 338.19 mean — the fan-out read that decides how many debits one schedule carries." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Approved but never debited: the 14 pending checkouts (6,113.00) are shoppers who cleared the no-credit-check gate with no installment landed — the visited-but-did-not-transact anti-join at BNPL grain." },
    { slug: "card-launch-success", why: "Card-rail share of the settlement book: 16 consumer-debit legs against 11 merchant wires — the take-rate-by-rail fold the rails dashboard opens with before the 5 split-rail statements get flagged." },
    { slug: "classes-more-than-5-students", why: "Markets carrying at least ten checkouts before a decline share is quoted — the HAVING floor that keeps APAC's 8.1% honest instead of answered by LATAM's 2-checkout sample." },
    { slug: "confirmation-rate", why: "Approved-to-activated rate per shopper: a checkout that books but never stamps is a confirmation that never lands — COALESCE keeps the zero-activation shoppers countable instead of silent." },
    { slug: "keep-latest-dedupe", why: "A feeds glitch double-loads settlement legs: keep-latest by business key (statement, day, cents, method) before the coverage census — two identical debits are two debits, and DISTINCT would eat one." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Statements with zero settlement legs: the 6-statement / 15,217.00 dunning block is a NOT EXISTS read — and paid-status #28 (1,756.00) is exactly why legs, not status, are the ledger." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Installment lines whose quantity clears the book's mean — the per-line debits cut that finds the schedules carrying more than their share of the 498-debit calendar." },
    { slug: "median-employee-salary", why: "Median financed ticket by ROW_NUMBER emulation: the 338.19 mean is a tail story, and the median is the number the fee model should have quoted instead." },
    { slug: "calculate-compressed-mean", why: "The 2.98-day activation clock is count-weighted — EU's 36 stamps anchor it while LATAM's 2 barely move it; the weighted-mean fold behind every regional drift alert." },
    { slug: "uber-first-transaction", why: "First debit per schedule: shipped_at stamps activation on orders, paid_on stamps the first collection on statements — the same first-transaction shape run on the settlement side of the book." },
    { slug: "books-with-null-ratings", why: "COUNT(shipped_at) versus COUNT(*): 82 stamps over 103 checkouts — the gap IS the 14 not-yet-activated plus 7 declined, and COUNT(col) versus COUNT(*) is how the report says so out loud." },
    { slug: "gl-reconciliation", why: "The close ships at 181,080 debits against 181,080 credits, delta zero — general-ledger reconciliation is the last query of every Afterpay close, not a nice-to-have." },
    { slug: "expected-credit-loss", why: "Credit-loss opex as weighted provision: 36 expense lines totaling 25,416.00 fold into the ledger's operating_expenses account — the ECL instinct at storefront-book grain." },
    { slug: "manager-of-the-largest-department", why: "Biggest fee base per market: Nordic Gadgets AB's 11,130.25 carries the EU book the way a top department carries its division — group argmax at merchant grain before every renewal call." },
  ],
};
