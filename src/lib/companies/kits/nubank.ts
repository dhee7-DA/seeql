// Nubank — kit 12 of the Fintech & Payments domain (Batch L, wave 7).
// LatAm's purple neobank: the storefront db read as a card-and-Pix book —
// orders are card authorizations (delivered = posted, shipped = clearing,
// pending = open authorization, cancelled = declined), order_items are the
// line items inside an authorization, customers are account holders,
// suppliers are merchants, products are card plans, invoices are billing
// cycles, payments are settlement legs on two rails (card = revolving
// billing, wire = Pix-era instant settlement, both INTEGER cents), expenses
// are opex and ledger_entries are the GL. Credit-limit reads, card spend,
// settlement coverage and delinquency bands are the daily bread.
// Pool provenance: 0 tagged LC rows for Nubank — the whole pool is
// theme-curated to known credit-risk and settlement screen shapes and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const nubankKit: CompanyKit = {
  id: "nubank",
  domainId: "fintech",
  name: "Nubank",
  tagline: "LatAm neobank: accounts, cards, credit lines",
  accent: "text-purple-300",

  brief: [
    "Nubank is the neobank that pulled a hundred million LatAm customers out of branch banking — credit cards first, then accounts, lending and the Pix instant-rail era on top. The analytics reality is a credit book wearing a growth badge: every authorization either posts, clears, or declines, and the delinquency ladder behind it is the margin. On this storefront db the mapping is honest: `orders` are card authorizations (103 of them), order_items are the line items inside those authorizations (251 — about 2.4 lines each), customers are account holders, suppliers are merchants, and products are card plans. Authorization outcomes mirror the status mix exactly: **52 posted** (50.5%), **30 clearing** (29.1%), **14 open** (13.6%), **7 declined** (6.8%) — and shipped_at is the settlement timestamp, populated only for the 82 authorizations that got there.",
    "The data org splits into credit risk, payments, and growth. Credit risk owns the ladder: 28 billing cycles against 27 settlement legs, INTEGER cents end to end, with the standing contradictions — cycle #11 is {rose:void} yet carries a $925.00 settlement leg, #28 reads {emerald:paid} with no leg behind it ($1,756.00), and one cycle sits {amber:partial} at $4,000.00 of $6,148.00. Payments owns the rails: card legs run 16 for **$37,364.00**, Pix-era wire legs 11 for **$32,248.00**, five cycles settle in two legs (1, 5, 12, 19, 22), and accounts-receivable carries **6 untouched cycles worth $15,217.00**. Growth owns the funnel: EU 45 authorizations from 8 holders, APAC 37 from 5, US 19 from 2, LATAM 2 from 1.",
    "Interview style is denominator-first, then the ladder. A screen opens with a conditional count (posted share — *of all authorizations, or only the 82 that settled?*), moves to the two-table read (settlement legs joined onto billing cycles, where one wrong key pairs a leg with the wrong cycle), escalates into the CASE ladder — exact, partial, no legs — where arm order is the whole answer, and lands on the walk: month-over-month authorization volume with LAG, first-row NULL acknowledged. The graded habits: state the denominator, order the CASE arms, and never let a void-with-a-leg hide inside a paid average.",
    "Preparation: the registry tags zero SQL problems for Nubank — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror credit-risk and settlement screens — coverage ladders, rail folds, delinquency CASE bands, anti-joins for untouched cycles and rolling exposure windows. Then run both case studies on the live db: one rebuilds the {violet:settlement-rail scorecard} the payments desk ships weekly (card 16 legs / $37,364.00 leading), the other rebuilds the {emerald:coverage ladder} credit risk presents at the committee (21 exact / 1 partial / 6 no legs). Say the denominator, the join key and the CASE arm order out loud before you compute — at a credit book, all three are the margin.",
    "The margin stack tells you where the screens will drill. Revolving exposure is the product: the {amber:open book} carries **$19,609.00** across 6 cycles, with #25 sitting *partial* at $4,000.00 of $6,148.00 — the delinquency ladder in miniature. Cost of risk prints as behavior first: **7 declines** (6.8%) are the hard losses, and the standing exceptions — void #11 with its $925.00 leg, paid #28 with nothing behind it — are how a credit book lies to itself. Rails carry different tickets (**card $2,335.25 vs wire $2,931.64** average), and opex is two-thirds fixed — Rent $16,800.00 of $25,416.00. Every one of those numbers is a CASE arm, a denominator, or a fold; that is not a coincidence, it is the interview.",
    "Preparation scales by level, and the ladder is public. Juniors get single folds — a rail scorecard, a month bucket, a cents-correct `SUM(amount_cents) / 100.0`. Mid-levels get the two-stage builds: the coverage census (21 / 1 / 6), the first-leg settlement clock, a board whose parts reconcile to the whole. Seniors get the {violet:definition fight} — *approval share over all authorizations or only the settled 82, revolving exposure over the open book or the whole billed book* — and the expectation is that you state the denominator, ship the query, and hand over the reconciliation that proves it. Rehearse out loud: the join key (`p.invoice_id`, never the id coincidence), the CASE arm order (no legs, exact, ELSE partial), and the cents promotion — at this book those three habits are the margin, and the screens grade all three.",
  ],

  dayInLife: [
    "**08:10 —** The day starts on the authorization funnel. First query is the overnight read: authorizations by outcome — 52 of 103 posted all-time, the {rose:decline} share watched hardest (6.8% book-wide, and the region cut is what the growth review quotes) — then the settlement mirror: legs that landed overnight versus cycles they claim to cover. The morning artifact is a two-grain count: 27 settlement legs across only 22 distinct cycles, because five cycles settle in two legs — *a census that can't say both grains out loud is the one that double-counts a cycle during close*. A mismatch pages payments ops, not a shrug.",
    "**11:30 —** Midday is delinquency surgery. The coverage ladder runs: every billing cycle folded against its legs, classified exact / partial / no legs — **21 / 1 / 6** — with the arm order written before the rows: a cycle with no legs is 'no legs' first, exact only when settled equals billed, partial is the ELSE that explains itself. The committee pack wants the two contradictions named, not smoothed: #11 is {rose:void} with a $925.00 leg on the books, #28 reads {emerald:paid} at $1,756.00 with nothing behind it — *both are findings, and neither survives a COALESCE that launders NULL into zero*. Each ladder ships with the folded CTE shown, so the fold can be replayed row by row.",
    "**16:00 —** The afternoon is the credit-committee cycle. The pack charts the {violet:authorization walk}: month buckets via SUBSTR, 6 to 9 authorizations a month, LAG deltas annotated, the first month's delta printed as NULL because no prior month means no comparison. Rails walk beside it: card 16 legs / $37,364.00 against wire 11 legs / $32,248.00, average leg $2,335.25 versus $2,931.64 — *the instant rail carries bigger tickets, and the committee reads that as Pix doing its job*. Every branch of every pack query reconciles against a plain `COUNT(*)` before it ships — and the ledger gets the last word: debits **181,080** equal credits **181,080**, delta zero, the one number allowed to be boring.",
    "**20:45 —** EOD is the writeup and the handoff. The day's boards ship with their SQL attached: the funnel read, the coverage ladder (still **21 / 1 / 6**), the rail scorecard (card 16 legs / $37,364.00 against wire 11 / $32,248.00), every branch reconciled against a plain `COUNT(*)` before it left. The fraud queue gets tonight's exceptions — #11's $925.00 void-but-settled leg and #28's $1,756.00 paid-but-unmoved status are *one row each and enormous in consequence* — with the query that found them pinned to the ticket. Last look is the ledger: debits **181,080**, credits 181,080, delta zero — the one number allowed to be boring, and the only one required to be.",
  ],

  metrics: [
    { name: "Authorization approval share", what: "Posted authorizations ÷ ALL authorizations: 52 of 103 (50.5%), with 7 declined (6.8%) the only hard losses. The funnel's headline — and the denominator argument ('of all, or only the 82 that settled?') is the interview before the metric." },
    { name: "Settlement rail mix", what: "Settlement legs by rail: card 16 legs / $37,364.00 vs wire 11 legs / $32,248.00 — 27 legs onto just 22 distinct cycles. Where the money actually moves, and which rail the product roadmap is winning." },
    { name: "Billing-cycle coverage", what: "Cycles classified exact / partial / no legs: 21 / 1 / 6. The $65,612.00 exact book settles clean; the ladder is how credit risk proves it instead of asserting it." },
    { name: "AR untouched exposure", what: "Cycles with zero settlement legs: 6 worth $15,217.00 — five open, plus #28 which reads paid with nothing behind it. The collections queue and the data-quality queue, in one anti-join." },
    { name: "Partial-settlement clock", what: "The one partial cycle sits at $4,000.00 of $6,148.00 — a $2,148.00 gap riding open. The number the dunning workflow watches before it becomes a delinquency band." },
    { name: "Split-cycle census", what: "Cycles settling in two legs: exactly 5 (ids 1, 5, 12, 19, 22). Fold per cycle before you sum, or the $65,612.00 book reads $69,687.00 and the close is wrong." },
    { name: "Ledger balance delta", what: "Total debits − total credits: $0.00 (181,080 = 181,080 here). The GL's proof — the one metric allowed, and required, to be boring." },
    { name: "Settlement latency", what: "JULIANDAY(shipped_at) − JULIANDAY(created_at) over completed authorizations: 2.98 days average, tight 2-to-4 spread. The posting SLA — computed over the 82 completions, never over NULL open authorizations." },
    { name: "Open-book coverage", what: "Of the $19,609.00 open book, only #25's $4,000.00 has landed — a $2,148.00 gap riding unsettled while five cycles carry nothing at all. The revolving balance the interest engine actually earns on, and the dunning queue's starting map." },
    { name: "Holder concentration", what: "Share of book value from the top of the holder file: 63.5% of spend sits with holders whose lifetime value crosses $3,000, 71.2% with the $2,000-plus tier. Credit-line reviews open here, and the denominator (all holders, not active ones) is the interview inside the metric." },
    { name: "Terms-vs-clock gap", what: "Flat 30-day terms against a 28.4-day average first-leg clock (fastest 13, slowest 84). The instant rail settles inside terms; the 84-day tail is the dunning queue the coverage ladder feeds." },
    { name: "Cost-of-risk exceptions", what: "The anomaly census the committee prices: 1 void-but-settled cycle ($925.00), 1 paid-but-unmoved ($1,756.00), 5 split settlements, 1 partial. Behavior losses before they become P&L losses — the leading indicators the decline share (6.8%) rides beside." },
  ],

  topics: [
    {
      name: "Authorization folds & conditional counts",
      why: "Every funnel read at Nubank is a fold with a conditional count inside: authorizations per day, declined per merchant, posted per plan. The denominator question rides on every one — COUNT(*) over all authorizations versus the settled subset is the difference between an approval rate and a posting rate.",
      slugs: ["number-of-rich-customers", "reported-posts", "find-total-time-spent-by-each-employee"],
    },
    {
      name: "Two-table reads: legs onto cycles",
      why: "Settlement analytics is a two-table read: legs carry the cycle's foreign key, cycles carry the status and the billed amount. One wrong join key pairs a leg with the wrong cycle and every coverage number downstream inherits the fiction — and the id-coincidence trap (payment id equals invoice id) is exactly the silent mis-pairing Nubank screens hunt.",
      slugs: ["bank-account-summary-ii", "npv-queries", "employee-bonus"],
    },
    {
      name: "Per-merchant & per-holder scorecards",
      why: "The portfolio review reads scorecards: spend per merchant, authorizations per holder, both grains side by side. The queries drill the shape — fold, count twice, break ties explicitly — because a scorecard that reshuffles between renders is a scorecard nobody re-runs.",
      slugs: ["students-and-examinations", "top-travellers", "average-selling-price"],
    },
    {
      name: "Delinquency CASE bands",
      why: "The delinquency ladder is CASE arms evaluated in order: exact, partial, charged-off, no legs. Arm ordering matters — a cycle the earlier arms don't catch lands in the ELSE by definition — and Nubank's screens test whether the ELSE is a contract or a leak.",
      slugs: ["loan-types", "type-of-triangle", "classifying-triangles-by-lengths"],
    },
    {
      name: "Untouched-cycle anti-joins",
      why: "Six billing cycles carry zero settlement legs — the collections anti-join. LEFT JOIN + IS NULL (or NOT EXISTS) is the shape, and the trap is filtering the joined table in WHERE, which converts the join and deletes exactly the exposure you were hunting.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "NULL policy: void legs & blank settlements",
      why: "Cycle #11 is void with a leg; #28 is paid with none. SUM over missing legs is NULL, not zero, and COUNT(column) versus COUNT(*) diverges exactly there. The policy — audit, report, or guard — is a stated decision, not a default.",
      slugs: ["books-with-null-ratings", "find-customer-referee", "employees-with-missing-information"],
    },
    {
      name: "Billing calendars & month spines",
      why: "The book runs on calendar buckets: authorizations per month via SUBSTR, terms windows, cycles issued in a period. Half-open intervals and month keys are the mechanics, and the midnight boundary is where two 'identical' close reports disagree.",
      slugs: ["friday-purchase-iii", "monthly-transactions-i", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "LAG/LEAD settlement walks",
      why: "The volume walk is LAG-shaped: this month's authorizations minus last month's, exposure transitions classified, growth accounting built from status changes. The first row's NULL delta is part of the story — no prior month, no delta — and hand-waving it to zero mislabels the baseline.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "year-on-year-growth-rate", "week-over-week-churn"],
    },
    {
      name: "One-pass censuses & conditional folds",
      why: "Committee packs want everything in one pass: total legs, settled value, declined count, per-rail splits — FILTER (WHERE …) folds them side by side. The one-scan identity (the pieces must sum back to the whole) is the reconciliation the pack ships with.",
      slugs: ["snaps-analysis", "total-traveled-distance", "count-the-number-of-experiments"],
    },
    {
      name: "Ranking the exposure book",
      why: "Risk reads rankings: worst cycles first, exposure bands, vintage curves. RANK versus DENSE_RANK over real ties, PARTITION BY resets per segment, and a deterministic tie-break are what keep the watchlist stable between the render and the meeting.",
      slugs: ["rank-scores", "delinquency-buckets", "vintage-default-curves"],
    },
    {
      name: "Window frames & running balances",
      why: "Exposure reads are cumulative: settled value walked leg by leg, rolling authorization volume across the quarter, the ledger balance applied in sequence. The frame is the whole answer — ROWS versus RANGE changes every running number the moment ties appear, and the default frame is silently RANGE. The screens drill whether your running total means rows-so-far or values-in-range, because the close's balance walk breaks on the difference.",
      slugs: ["find-cumulative-salary-of-an-employee", "last-person-to-fit-in-the-elevator", "rolling-average-steps"],
    },
    {
      name: "Set-op stacks & reconciliations",
      why: "Close reports are stacks: category lines UNION ALL'd into a labelled TOTAL row, paid legs stacked beside open exposure, two rails folded into one board. UNION deduplicates — a silent row-killer when two legs legitimately match — and UNION ALL is the reconciliation-safe default. The craft is keeping every branch's grain and column list identical so the stack sums back to its parts.",
      slugs: ["movie-rating", "odd-and-even-transactions", "same-day-sale"],
    },
    {
      name: "Subquery shapes: scalar, EXISTS, derived",
      why: "Credit screens nest constantly: a scalar benchmark beside every row, an EXISTS probe for cycles-with-legs, a derived table that folds before it joins. The three shapes differ in cost and in NULL behavior — the scalar that returns no rows, the correlated probe that re-runs per row — and Nubank wants the shape chosen on purpose, not by habit.",
      slugs: ["second-highest-salary", "orders-with-maximum-quantity-above-average", "game-play-analysis-iv"],
    },
    {
      name: "CASE pivots & spend reshapes",
      why: "Committee packs read sideways: rails as columns, delinquency bands as columns, weekday settlement calendars as columns. Every pivot is conditional aggregation — SUM(CASE WHEN …) with an arm per column — and the ELSE is where spend silently disappears. The screens drill pivots because every board the committee ships is one.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "occupations-pivot"],
    },
    {
      name: "Risk KPIs: utilization, roll rates, vintage",
      why: "The credit book lives on defined ratios: utilization against the line, roll rates between delinquency buckets, vintage curves per cohort month. Each is a CASE band plus a stated denominator, and each is exactly where an interview asks you to define the KPI before computing it. Say the band edges and the denominator out loud first; after that the query is arithmetic.",
      slugs: ["credit-utilization-bands", "delinquency-roll-rates", "expected-credit-loss"],
    },
  ],

  theory: [
    {
      id: "nubank-t1",
      q: "A billing cycle counts as delinquent if it carries no settlement leg. In a query reporting delinquency share by cycle status, where does that rule live — and what breaks when it lands in HAVING instead?",
      a: "The no-leg test is a row-level fact about the folded pair, so it belongs in WHERE (if untouched cycles are the population) or inside the aggregate as SUM(CASE WHEN legs IS NULL THEN 1 ELSE 0 END) (if the share compares untouched to all). Once folded by cycle status, the row-level comparison no longer exists: HAVING can only judge group aggregates. The classic failure is folding all cycles per status and trying to subtract 'the untouched' in HAVING — they're already inside the total, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every rule by asking: is this a fact about one cycle, or about a status class? At Nubank that question is the margin itself: a delinquency rule in the wrong clause doesn't error, it reports a ladder that never existed.",
      tag: "pipeline",
    },
    {
      id: "nubank-t2",
      q: "Settlement legs join onto billing cycles on invoice_id. A teammate joins on the primary keys instead — and the totals still look right. Walk me through why, and the guard you'd add.",
      a: "On this book the ids collide: 27 payment rows with ids 1..27 against invoice ids 1..28, so i.id = p.id matches nearly every leg by coincidence — same row counts, plausible sums, wrong pairings, and nothing errors. The silent mis-pairing is the worst failure mode in a credit book because the coverage census inherits it downstream. The guard is mechanical: join on the declared foreign key p.invoice_id, then verify the join didn't change grains — COUNT(*) legs (27) and COUNT(DISTINCT invoice_id) cycles (22) before and after the join; spot-check one known cycle by hand (#25 must pair only with its $4,000.00 wire leg, never a card leg); and fold per cycle id in a CTE so the split cycles (1, 5, 12, 19, 22) sum once each. At Nubank the join key IS the audit trail — a coverage ladder built on an id coincidence is fiction with a footer.",
      tag: "joins",
    },
    {
      id: "nubank-t3",
      q: "27 settlement legs land across 22 billing cycles. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over settlement legs reads 27 — leg events, the rows the rail logged. COUNT(DISTINCT invoice_id) reads 22 — cycles served, the business object. COUNT(invoice_id) also reads 27 because the FK is never NULL — NULL-skipping is not deduplication. The gap is five cycles that settle in two legs (1, 5, 12, 19, 22), and folding their billed amounts naively inflates the book: SUM over a leg-grain fold reads $69,687.00 where the cycle book is $65,612.00. The two-grain scorecard folds once and counts twice: per rail, legs AND distinct cycles side by side, because legs-per-cycle is the depth read and a rail with many single-leg cycles is a different operational problem from one with splits. The habit the interviewer grades: before any COUNT, say 'one row per what?' — leg event, cycle, rail bucket. Both numbers ship, to different audiences, on purpose.",
      tag: "aggregation",
    },
    {
      id: "nubank-t4",
      q: "Cycle #11 is void but settled for $925.00; cycle #28 is paid with no settlement leg at all. Your coverage query COALESCEs missing legs to zero. What does the committee see — and what should it see?",
      a: "As written it sees a clean book: #28's missing leg becomes $0.00, the SUM reads 0 for a cycle marked paid, and the contradiction is laundered into a footnote nobody reads. Worse, #11's leg still counts — a void cycle contributing $925.00 to 'settled' value — so the census is wrong in both directions at once. The honest versions: keep NULL as NULL and classify with CASE — WHEN settled IS NULL THEN 'no legs' — so the six untouched cycles ($15,217.00) surface as a population, not a zero; and carry the status column beside the fold so void-but-settled #11 and paid-but-unmoved #28 print as the contradictions they are. The general policy: NULL settlement means 'no evidence yet', not 'settled for nothing'. COALESCE to zero invents evidence; COALESCE to a sentinel poisons the sum. At Nubank the NULL policy is the audit — the interviewer wants the contradictions named before the totals, not defended after.",
      tag: "nulls",
    },
    {
      id: "nubank-t5",
      q: "Build the month-over-month authorization volume walk. Where do LAG's edges bite — the first row, ties, and the ORDER BY?",
      a: "Stage the fold first — month buckets via SUBSTR(created_at, 1, 7), COUNT(*) per bucket — then delta over it: authorizations - LAG(authorizations) OVER (ORDER BY month). The edges: the first month's LAG is NULL, so its delta is NULL — report it as NULL (no prior month, no delta), never COALESCE to zero, which manufactures a baseline out of nothing. The ORDER BY inside OVER is the entire meaning of 'previous': order by the month key, not by volume — ordering by the measure makes 'previous month' mean 'the month with the next-lower count', which is a different and quietly wrong series. Ties in the sort key would need a tie-break, but a month key is unique by construction — say that, rather than assuming it. On this book the walk reads 8, 9, 8, 7 … with deltas +1, −1, −1 — small numbers, which is exactly why the edges matter: a wrong ORDER BY on a flat series is invisible until the quarter it isn't.",
      tag: "windows",
    },
    {
      id: "nubank-t6",
      q: "WHERE billed > (SELECT AVG(billed) FROM cycles WHERE region = 'nordeste') — no cycles run in nordeste. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and billed > NULL is UNKNOWN, so WHERE passes nothing: an above-average-cycle report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones — 'it worked for the Sudeste book' is the bug report. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise the inner fold's GROUP BY has to keep. The correlated cousin — above THIS segment's own trailing average, re-run per outer row — is a different question with a different cost. At Nubank the follow-up is always: what population did the inner fold cover, and does the empty result mean 'nothing is above average' or 'nothing was measured'? Those are opposite incidents.",
      tag: "subqueries",
    },
    {
      id: "nubank-t7",
      q: "Every billing cycle on this book runs flat 30-day terms, and settlement latency averages 2.98 days with a 2-to-4 spread. How do you compute the aging clock, and where does BETWEEN break?",
      a: "Compute: JULIANDAY(paid_on) − JULIANDAY(issued_on) per leg, aggregate, then ROUND(..., 2) exactly once at the display edge. The population must be stated: 20 cycles carry a first settlement date — #28's paid status has no leg behind it, so an unfiltered average silently skips it while claiming the paid book. Terms are a constant here (30/30/30), which is itself a finding: any aging variance is settlement behavior, not contract terms. Windows: half-open intervals — issued_on >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and double-counts exactly the midnight boundary when month-end cycles land. And the spread matters more than the mean: 2-to-4 days is a stable rail; the same mean with an 84-day tail is a dunning queue — the query should print fastest and slowest beside the average, not just the average.",
      tag: "dates",
    },
    {
      id: "nubank-t8",
      q: "Your dashboard shows 6 untouched cycles out of 28. The collections lead insists the denominator is 22 'because five settle twice and one is void'. Both numbers are real. Resolve it.",
      a: "The two figures are different fractions wearing the same name. 6 of 28 is the share of the whole billing book carrying zero legs — the funnel honest about every cycle it issued. 6 of 22 is the same numerator over cycles that received at least one leg — an untouched-rate conditional on being touched, which is a different (and stranger) metric. Both queries are correct SQL; they disagree because the denominators disagree. The fix is definitional, not computational: pick one population, state it in the title, and make the headline and its slices share it — then verify by reconciliation: 21 exact + 1 partial + 6 no-legs must fold back to 28 cycles and $65,612.00 + $6,148.00 + $15,217.00 to the book. At Nubank a denominator that silently changes between the summary and its slices isn't a rounding bug — it's the ladder lying, and it's the data-quality finding the committee actually wants.",
      tag: "quality",
    },
    {
      id: "nubank-t9",
      q: "The rail board shows a running settled-value column: SUM(amount_cents) OVER (ORDER BY paid_on). Two legs settled the same day print identical running values. Bug or feature — and what's the fix when the desk wants per-leg walking?",
      a: "Feature — it's the default frame. With ORDER BY inside OVER, SQLite's default window frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers: rows that tie on paid_on share the frame, so same-day legs print the same running total. It's the mathematically careful choice — a value 'as of that moment' genuinely includes its simultaneous peers — and it looks like a bug the first time a split cycle settles twice in one day. The fix is to say what you mean: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks row by row regardless of ties. The discipline the interviewer grades: no running column ships without its frame written out — defaults are where two analysts' boards silently disagree, and at Nubank the running exposure is the number the committee replays row by row.",
      tag: "frames",
    },
    {
      id: "nubank-t10",
      q: "The close stack UNION ALLs four category lines into a labelled TOTAL row. A reviewer asks why not just UNION. What's the difference that matters at close?",
      a: "UNION is UNION ALL plus a dedup pass over the whole stack — and at close, deduplication is a silent row-killer. Two branches that legitimately produce identical rows (two one-line categories with the same count and value; a zero bucket matching another zero) collapse into one, the stack no longer reconciles to its parts, and nothing errors. UNION ALL is the reconciliation-safe default: every branch prints, the TOTAL row must equal their sum, and any discrepancy is visible instead of laundered. The corollary discipline: ORDER BY sits once, at the end of the stack — it sorts the combined set, not a branch — and every branch must project the same column count and compatible types or the stack refuses to build. At Nubank the stack is the close: category lines, a TOTAL anchor at $25,416.00, and a reconciliation identity — parts sum to the anchor — that a bare UNION could quietly break.",
      tag: "setops",
    },
    {
      id: "nubank-t11",
      q: "The untouched-cycle census exists three ways — NOT EXISTS, LEFT JOIN … IS NULL, EXCEPT. Which do you reach for, and what does each one actually promise?",
      a: "They promise different contracts. NOT EXISTS is the row-level test: 'no settlement leg exists for this cycle' — it reads as the business question, ignores duplicates in the probed table automatically, and is NULL-safe by construction. LEFT JOIN … IS NULL is the join-shaped equivalent: keep cycles whose anti-join payload stayed NULL — powerful when you also want columns from the fold, fatal when a teammate 'cleans it up' by filtering the joined table in WHERE, which converts the whole thing to an inner join. EXCEPT is set arithmetic: project ids from cycles, EXCEPT ids from legs, and the difference is the untouched set — but it compares whole rows, needs matching column lists and grain, and deduplicates both sides. At Nubank the habit is NOT EXISTS for the census, LEFT JOIN IS NULL when the fold's columns ride along, EXCEPT when the audit is literally 'this set minus that set' — and never NOT IN, which one stray NULL empties.",
      tag: "setops",
    },
    {
      id: "nubank-t12",
      q: "You need every billing cycle beside its rail's average ticket. Correlated subquery or derived table — how do you choose, and what does each cost?",
      a: "A correlated subquery re-runs its inner fold for every outer row: the average recomputes per cycle unless the planner caches it. It earns its cost when the inner query genuinely depends on the outer row — this cycle's legs against the book's, this holder's ticket against their cohort's. A derived table (or CTE) materializes the fold once and joins it back on the key: one scan, one benchmark, the shape for 'the same number beside every row'. The rule of thumb: correlated for per-row exceptions, derived for shared benchmarks — and on a 27-leg book either runs instantly, which is exactly why the interviewer asks: habits formed on toy data are what break the hundred-million-customer book. The Nubank discipline: if the inner query doesn't reference the outer row, it has no business being correlated — stage it in a CTE and say so in the review.",
      tag: "subqueries",
    },
    {
      id: "nubank-t13",
      q: "The collections anti-join runs slow in staging. Walk me through making EXISTS / IN / LEFT JOIN IS NULL fast — and what 'sargable' has to do with it.",
      a: "First, shape: for 'cycles with no legs', NOT EXISTS and LEFT JOIN IS NULL give the planner the most options; NOT IN against a subquery is both the NULL hazard and often the worst plan. Then indexes: the probe needs an index on payments.invoice_id — the foreign key — or every outer cycle scans all 27 legs; with it, each probe is a seek. Sargable means the predicate can use that index: p.invoice_id = i.id is sargable; SUBSTR(p.paid_on, 1, 7) = '2024-01' or any function wrapped around the join column is not — the index sits unused while the engine computes per row. The staging fix is usually: index the FK, keep predicates bare-column, and pre-aggregate the many side in a CTE so the anti-join probes a small folded set instead of raw rows. At Nubank scale — this shape runs against a hundred million authorizations — the difference between a seek per cycle and a scan per cycle is the difference between the morning board and the afternoon outage.",
      tag: "perf",
    },
    {
      id: "nubank-t14",
      q: "Two analysts bucket settlements by month and get different keys — one used SUBSTR(paid_on, 1, 7), one STRFTIME('%Y-%m', paid_on). When do they disagree, and which do you standardize on?",
      a: "For ISO 'YYYY-MM-DD' text they agree on every full date — the prefix cut and the format both yield '2024-07'. They disagree at the edges: SUBSTR trusts the string shape (a '2024-7-9' variant or a differently laid-out timestamp silently produces garbage keys), while STRFTIME parses the date and generalizes — '%W' for weeks, '%j' for day-of-year, the tools the settlement calendar actually grows into. Both share one flaw: they wrap the column, so no index helps — month-keyed boards precompute the key or stage the fold in a CTE. Standardize on STRFTIME for anything that might grow beyond months, SUBSTR only where the format is contractually ISO and the read is a pure prefix. The Nubank corollary: a month spine generated once and LEFT JOINed under the fold is what makes quiet months print as zeros — aggregation can never invent the months a quiet book skips.",
      tag: "dates",
    },
    {
      id: "nubank-t15",
      q: "Why does this book keep every money column in INTEGER cents — and what's the full discipline for turning cents into dollars in a query?",
      a: "Because cents are exact and floats are not: INTEGER arithmetic ties the ledger to the cent — debits 181,080 equals credits 181,080, delta zero — where REAL arithmetic drifts in the last bits (0.1 + 0.2 is the textbook admission). The discipline: store and fold in cents; promote with /100.0 exactly once at the display edge; ROUND last, never first; and never let an INTEGER 100 touch the division — amount_cents / 100 truncates, 236,150 cents prints 2361.00 instead of 2,361.50, and the loss is real money multiplied by every leg. CAST counts as truncation too — CAST(x AS INTEGER) chops toward zero, which matters the day reversal legs go negative. The audit habit that closes it: every dollar column reconciles back to the cent fold it came from, and the trial balance re-runs in the same query set — at a credit book the cents discipline is not style, it is the difference between a ledger and a rumor.",
      tag: "types",
    },
    {
      id: "nubank-t16",
      q: "The deck says approval rate 50.5%; the risk team says 63.4%. Both divide 52 by something. Which is right — and what's the rule that ends the argument?",
      a: "Both — they're different metrics wearing one name. 52 posted of ALL 103 authorizations is the approval share: every authorization the book issued, including the 14 still open and the 7 declined. 52 of the 82 that reached settlement (shipped_at populated) is the posting rate: of the authorizations that got where money moves, how many posted. The 12.9-point gap is the 21 unresolved authorizations, and neither number is wrong until a slide prints one under the other's name. The rule: the denominator is part of the metric's name — 'approval share, all authorizations' or 'posting rate, settled only' — and the query's WHERE and the slide's title must agree. The Nubank version: state the population before you state the number, because at a credit book the denominator is where the margin hides, and two honest analysts with unstated denominators will fight for a week.",
      tag: "kpi",
    },
    {
      id: "nubank-t17",
      q: "The exposure watchlist ranks billing cycles, and two cycles tie. Walk me through RANK versus DENSE_RANK versus ROW_NUMBER — and which one the watchlist ships.",
      a: "RANK leaves gaps: ties share a rank and the next row jumps — two cycles tied at rank 6 make the next one 8. DENSE_RANK compresses: the next row is 7. ROW_NUMBER breaks the tie arbitrarily and hands out 6, 7, 8 — and without an explicit tie-break, 'arbitrarily' means the planner's mood, so the watchlist reshuffles between renders. The shipped choice depends on what the rank means: if the committee reviews the top 10 by position, ROW_NUMBER with a deterministic tie-break (cycle id) keeps the board stable; if the rank encodes a tier ('everything in the top tier'), DENSE_RANK keeps tied cycles together with no phantom gaps. The non-negotiable either way: the ORDER BY inside OVER is the definition of 'worst first', and a tie-break rides in every window the committee reads. On the paid book's settlement clock, seven cycles tie at 25 days — that's not a corner case, that's the middle of the distribution.",
      tag: "windows",
    },
    {
      id: "nubank-t18",
      q: "The committee pack needs legs, settled value, declines and per-rail splits from one scan. Build it — and tell me why FILTER beats four queries.",
      a: "COUNT(*) AS legs, SUM(amount_cents) / 100.0 AS settled_usd, COUNT(*) FILTER (WHERE status = 'cancelled') AS declined, COUNT(*) FILTER (WHERE method = 'card') AS card_legs, COUNT(*) FILTER (WHERE method = 'wire') AS wire_legs — one pass, every board cell born together. FILTER beats four queries for the same reason it beats SUM(CASE …): the census is one scan of the fold, the arms read as a checklist, and the reconciliation identity is structural — card 16 + wire 11 must equal legs 27, because the pieces and the whole came from the same rows in the same pass. Four separate queries can drift (different snapshots, filters copied wrong) and nothing forces their sum to check out. The discipline: every one-pass census ships with its identity stated — the parts sum to the whole — because that identity IS the audit. SQLite supports FILTER on aggregates; the habit costs nothing and the pack gets honest arithmetic for free.",
      tag: "aggregation",
    },
    {
      id: "nubank-t19",
      q: "A teammate's untouched-cycle query does LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents IS NULL — and a reviewer 'fixes' it by tightening the WHERE. What's actually going on, and where do predicates belong?",
      a: "The original is a correct anti-join: the LEFT JOIN preserves cycles with no legs, their p.amount_cents is NULL, and IS NULL selects exactly the untouched. The 'fix' is fatal the moment any bare predicate on the right table lands in WHERE — p.amount_cents > 0, a status filter, a date cut — because WHERE runs after the join is materialized and keeps only rows where the join matched, silently converting the outer join to an inner one and deleting the very exposure the query hunts. The rule follows from the pipeline: predicates on the joined table's columns belong in the ON clause (where they shape the match) or in the fold's CTE (where they shape the population) — never in WHERE unless 'drop unmatched rows' is the stated intent. At Nubank this is the collections queue's favorite bug: the queue empties, the query still runs green, and the only symptom is a Monday morning with nothing to call.",
      tag: "pipeline",
    },
    {
      id: "nubank-t20",
      q: "You're asked to gate a report to 'significant' categories. Where does the threshold come from, and what makes a HAVING gate defensible?",
      a: "From observed boundaries, not round numbers. A defensible gate sits at a value that means something in the data — the smallest category that clears the bar has exactly 5 lines, so HAVING COUNT(*) >= 5 says 'categories with a real bench' and 5 is auditable: point at the row that earned it. A gate of 4 produces the same rows today but sits in the empty space between 3 and 5 — no row justifies it, and next quarter it and the 5-gate diverge with nobody able to say which was the policy. The mechanics to recite: HAVING evaluates after GROUP BY, so it compares group aggregates, never row facts (that's WHERE's job, before the fold); it can reference aggregates and — in SQLite's courtesy — output aliases, which is convenient and non-portable, so the shipped version spells the aggregate out. And the interview-grade answer: a gate is a KPI definition, so it gets a name, an owner and a comment — 'recurring = at least 5 lines' — the same way the delinquency bands do.",
      tag: "gates",
    },
    {
      id: "nubank-t21",
      q: "The audit pack wants the split-cycle ids in one cell — '1,5,12,19,22'. Why is GROUP_CONCAT the right tool, and what does it take to make the cell trustworthy?",
      a: "GROUP_CONCAT folds many rows into one display cell — exactly the audit footprint: five cycles that settle in two legs, listed so a reviewer can spot-check each. Trust takes three things. Order: SQLite does not guarantee order within the group, so the ids must be forced — ORDER BY inside the aggregate (SQLite 3.44+) or a sorted subquery feeding it — or '1,5,12,19,22' and '22,19,12,5,1' are both legal outputs and every diff-check flags a phantom change. Separators: the second argument sets the delimiter; the default is a comma, and quoting matters once the folded values are text. Grain: the fold groups by whatever the outer query groups by — folding ids across the whole table in a GROUP BY-less query is a one-row footgun that hides which fold produced it. And the caveat the interviewer waits for: the folded cell is a display artifact, not a number — it sorts as text, it sums as nothing, and it must never be parsed back in SQL when a join would do.",
      tag: "folds",
    },
    {
      id: "nubank-t22",
      q: "Pivot columns on the committee packs are SUM(CASE WHEN … END) arms. What are the three ways a pivot lies, and how do you catch each?",
      a: "One: the ELSE leak. CASE with no ELSE yields NULL on a miss, and while SUM ignores NULLs — a count-style pivot survives — the same habit in a printed flag column shows NULL where the desk expects 0, and in arithmetic the NULL propagates. Write the ELSE every time the arm's miss has a meaning. Two: the arm-order lie. CASE stops at the first true arm — overlap the bands (utilization under 0.8, then under 0.5) and every low-utilization row lands in the high band; the arms must partition, and the census should prove it: the pivot columns must sum back to COUNT(*). Three: the grain lie. A pivot folded at the wrong grain — SUM over a fan-out where the five split cycles double-count — inflates exactly one arm while the others look fine; fold per key in a CTE first, then pivot. The Nubank habit is the one-pass identity: rail arms 16 + 11 equal legs 27, band arms sum to the book — the pivot ships with its own reconciliation or it doesn't ship.",
      tag: "pivots",
    },
    {
      id: "nubank-t23",
      q: "Joining legs onto cycles, the billed book reads $69,687.00 instead of $65,612.00. What happened, and what's the shape that never does?",
      a: "Fan-out. Five cycles settle in two legs (1, 5, 12, 19, 22), so the leg-grain join multiplies those cycles' billed amounts: 27 leg rows carry 22 cycles' worth of billed value, and SUM(i.amount_cents) over the join counts the five splits twice — $4,075.00 of phantom book. The shape that never does: fold-then-join. Stage the many side in a CTE — per invoice_id, SUM(p.amount_cents) once — so the CTE is one row per cycle, then join the cycle facts onto that fold; billed and settled now share a grain and the sum is honest. The tell-tale check that belongs in every review: COUNT(*) after the join equals the driver's count (28 cycles), and the folded sums reconcile to the branch totals ($65,612.00 exact + $6,148.00 partial + $15,217.00 untouched). At Nubank this is the first question asked of any money query — one row per what? — because the fan-out doesn't error, it just quietly prints a book that doesn't exist.",
      tag: "grain",
    },
    {
      id: "nubank-t24",
      q: "Define the delinquency ladder the way the committee reads it — buckets, roll rates, and where revolving balance and cost of risk attach.",
      a: "Buckets first: days-past-due bands — current, 1–30, 31–60, 61–90, 90-plus — as CASE arms whose edges partition with no overlap and no gaps; on this book the analog is the coverage ladder (21 exact / 1 partial / 6 untouched), where the untouched $15,217.00 book is the current bucket's opposite extreme. Roll rates are the movement layer: this month's bucket versus last month's, via LAG over the bucket key — the first month's NULL is 'no prior', not zero — and the committee reads the transitions (current into 1–30) far more anxiously than the stock. Revolving balance attaches as the stock that rolls: the open book's $19,609.00, within it #25's $2,148.00 gap riding partial — the balance the interest engine actually earns on. Cost of risk attaches as the flow: expected loss priced per bucket, led by behavior — the 6.8% decline share, the void-but-settled $925.00 and paid-but-unmoved $1,756.00 exceptions. The SQL discipline is the same at every layer: define the bucket edges once, name the denominator, and let the movement query prove the story.",
      tag: "kpi",
    },
  ],

  mcqs: [
    {
      id: "nubank-mcq-1",
      prompt: "A Pix-era settlement leg of 236,150 cents (real rows: payments #13 and #14) is reported as ROUND(amount_cents / 100, 2). What prints?",
      choices: [
        "2361.50 — integer division keeps the cents",
        "2361 — the .50 was truncated before ROUND ran",
        "2362 — SQLite rounds the division up",
        "2361.00 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Two INTEGERs divide with truncation: 236150 / 100 = 2361 before ROUND ever runs. The house shape is amount_cents / 100.0 — real division first, ROUND last — which prints the true 2361.50.",
      notes: [
        { choice: 0, why: "Integer division discards the remainder entirely — 236150/100 is 2361, and this is a real odd-cent leg on the books, so the loss is real money at scale." },
        { choice: 2, why: "Nothing rounds the division — SQLite truncates it. ROUND runs downstream on the already-truncated 2361 and can only leave it there." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-2",
      prompt: "103 authorizations: 52 posted, 30 clearing, 14 open, 7 declined. SELECT status, COUNT(*) FROM orders GROUP BY status returns how many rows?",
      choices: ["4", "103", "82", "21"],
      answer: 0,
      why: "GROUP BY folds to one row per distinct status — the 4 outcomes present — and the counts sum to 103. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 1, why: "103 is the input row count. GROUP BY collapses it; you'd only see 103 rows folding on a 103-distinct-value column." },
        { choice: 2, why: "82 is the settled count — a filtered population, not a fold output. The GROUP BY keeps all 4 status groups including the 21 unresolved." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-3",
      prompt: "Which expression counts distinct billing cycles served (not settlement-leg rows) from the payments table?",
      choices: ["COUNT(*)", "COUNT(method)", "COUNT(DISTINCT invoice_id)", "SUM(invoice_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(method) both read 27 — one row per leg. COUNT(DISTINCT invoice_id) folds the legs back to 22 cycles, the five two-leg splits counting once. Both grains are real; the census must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 27. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds foreign keys — a meaningless number that changes when any cycle settles twice. Keys are for joining, never for folding." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-4",
      prompt: "The untouched-cycle share reads 6 of 28 (21.4%) in the committee pack, 6 of 22 (27.3%) in the collections tool. What most likely happened?",
      choices: [
        "Rounding drift between two engines",
        "The tool's denominator excludes the 6 untouched cycles themselves — it's a touched-book rate wearing the untouched name",
        "The tool double-counts the five split cycles",
        "The tool divides by 100.0 twice",
      ],
      answer: 1,
      why: "Same numerator, different denominator: a tool that only folds cycles with legs computes the share among the touched book. Both are real metrics — but a dashboard where the headline and its slices use different denominators is the disagreement reviewers can't un-see.",
      notes: [
        { choice: 0, why: "21.4 versus 27.3 isn't rounding — the denominators differ by 6 cycles. Rounding drift lives in the third decimal, not 6 points." },
        { choice: 2, why: "Split cycles (1, 5, 12, 19, 22) all HAVE legs, so they'd inflate a leg count, not appear in the untouched numerator at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-5",
      prompt: "Wire-leg share per month: which expression is safe against integer division AND denominator drift?",
      choices: [
        "SUM(CASE WHEN method = 'wire' THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN method = 'wire' THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(method = 'wire') / COUNT(*)",
        "The same CASE share over rows pre-filtered to wire in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division, and COUNT(*) runs over the same unfiltered fold as the numerator — no drift. Pre-filtering to wire makes every month's share read 100%.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated — an 11/27 share computes as 11/27 = 0, then 0 × 100." },
        { choice: 2, why: "COUNT(boolean) counts non-NULL results, and the comparison returns 0 or 1, never NULL — the 'share' reads ~100 for every month." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-6",
      prompt: "Cycles LEFT JOIN their folded legs, then WHERE l.legs > 0 to drop empties. What happens to the six untouched cycles?",
      choices: [
        "Nothing — the join already kept them",
        "They vanish: the leg-count filter on the joined fold's columns deletes them, silently converting the join to an INNER",
        "They appear once with legs = 0",
        "SQLite keeps them and fills legs with '0'",
      ],
      answer: 1,
      why: "Filtering the LEFT-joined fold's columns in WHERE discards the NULL-payload rows — the untouched cycles — converting the anti-join into an inner join. The fold belongs in a CTE and the untouched census in its own branch; predicates on joined columns belong in ON or in the fold, not WHERE.",
      notes: [
        { choice: 0, why: "The join kept them, but a WHERE on right-side columns un-keeps them — filter placement, not join type, decided the population." },
        { choice: 2, why: "A WHERE can't manufacture zero rows — that's COALESCE territory, and only when NULL genuinely means zero rather than 'no legs landed'." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-7",
      prompt: "Your LAG exposure walk prints NULL in the first month's delta column. The committee wants 'no blanks'. What's the right move?",
      choices: [
        "COALESCE the delta to 0 — the first month simply didn't change",
        "COALESCE the delta to 0 and label the column 'change vs prior month (0 for first month)'",
        "Keep the NULL and explain: no prior month means no delta — the blank IS the meaning",
        "Drop the first month's row entirely",
      ],
      answer: 2,
      why: "NULL here is semantic: 'no prior month exists', not 'zero change'. Coalescing to 0 manufactures a baseline and makes the first month look flat-on-purpose; dropping the row hides it from the axis. The label fixes the presentation complaint without lying about the data.",
      notes: [
        { choice: 0, why: "Zero is a measurement (flat month); NULL is an absence (no comparison possible). Conflating them is how a baseline gets invented." },
        { choice: 1, why: "The label is honest but the value isn't — a first-month bar of 0 still reads as 'flat' in every chart the pack feeds downstream." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-8",
      prompt: "In the coverage CTE, the classification reads: WHEN SUM(p.amount_cents) IS NULL THEN 'no legs' … ELSE 'partial'. A teammate swaps the first arm to WHEN SUM(p.amount_cents) = 0. What changes?",
      choices: [
        "Nothing — a missing fold and a zero fold are the same thing",
        "The 6 untouched cycles fall through to 'partial' — the ladder reports 21 exact / 7 partial / 0 no-legs and the collections queue empties",
        "All 28 cycles classify as partial",
        "The query errors on the NULL comparison",
      ],
      answer: 1,
      why: "A cycle with no legs folds to SUM = NULL, not 0. NULL = 0 is UNKNOWN, so the arm never fires, every untouched cycle falls to the ELSE, and 'partial' balloons from 1 to 7. NULL-meaning-missing must be tested with IS NULL, never with an equality.",
      notes: [
        { choice: 0, why: "SUM of no rows is NULL by the SQL contract — equality against it is UNKNOWN. The whole ladder re-shuffles on that one test." },
        { choice: 3, why: "Comparisons with NULL don't error — they evaluate to UNKNOWN silently. The failure is a mislabeled ladder, not an exception." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-9",
      prompt: "WHERE cycle_id NOT IN (SELECT cycle_id FROM disputed_legs) — the staging table's cycle_id is nullable. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL empties the entire result — every cycle fails the test",
        "NULL cycle_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'clean cycles' report that looks like an all-clear to the collections team." },
        { choice: 2, why: "NOT IN has no 'treat as unmatched' mode. UNKNOWN poisons the whole list; only NOT EXISTS or the IS NULL anti-join is NULL-safe." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-10",
      prompt: "The ladder's CASE arms get reordered: 'partial' checked BEFORE the exact test. What does the committee's census print?",
      choices: [
        "The same census — arm order is cosmetic",
        "21 exact / 1 partial / 6 no legs, sorted differently",
        "0 exact / 27 partial / 1 no legs: every settled cycle that isn't exact-by-arm-1 lands in partial, including the exact ones",
        "A syntax error — CASE requires a specific arm order",
      ],
      answer: 2,
      why: "CASE evaluates arms in order and stops at the first hit. With partial tested first and defined as settled <> billed, the untouched cycles and any arm-1 misses land correctly, but the exact test only sees what arm 1 rejected — the exact class collapses and 'partial' swallows the book. Arm order is the contract, not a style choice.",
      notes: [
        { choice: 0, why: "Arm order changes which rows reach which test — the census is a decision tree, and reordering branches re-classifies the book." },
        { choice: 3, why: "CASE accepts arms in any order; that's precisely why the burden of a correct order sits on the author." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-11",
      prompt: "The growth deck buckets the authorization walk by month. created_at reads '2024-07-15 10:00:00' — which expression produces the month key '2024-07'?",
      choices: [
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 6, 2)",
        "STRFTIME('%m', created_at)",
        "YEAR(created_at)",
      ],
      answer: 0,
      why: "The prefix cut takes characters 1–7 of the ISO string — '2024-07' — and the walk folds 14 distinct months (2024-01 through 2025-02). A key that keeps only the month digits would merge the two Januarys; a function that doesn't exist never runs at all.",
      notes: [
        { choice: 1, why: "'07' keeps the month digits only — 2024-01 and 2025-01 fold into one '01' bucket and the walk silently loses a month." },
        { choice: 2, why: "STRFTIME('%m') also returns '07' — month without year. It's STRFTIME('%Y-%m') that matches the prefix cut." },
        { choice: 3, why: "SQLite has no YEAR() — that's MySQL. The port errors on the first run instead of printing a key." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-12",
      prompt: "SELECT COUNT(*), COUNT(shipped_at) FROM orders — the settlement mirror needs both numbers. What prints?",
      choices: ["103, 103", "103, 82", "82, 82", "103, 21"],
      answer: 1,
      why: "COUNT(*) counts rows — 103 authorizations. COUNT(shipped_at) skips NULLs — only the 82 that reached settlement carry a timestamp. The 21-row gap (14 open, 7 declined) is exactly the unresolved population the mirror exists to expose.",
      notes: [
        { choice: 0, why: "COUNT(column) is NULL-skipping, not row-counting — a column populated on 82 rows can't read 103." },
        { choice: 2, why: "Swapped. The row census is the bigger number; the timestamp count is the settled subset." },
        { choice: 3, why: "21 is the DIFFERENCE between the two counts, not a COUNT output — nothing here subtracts." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-13",
      prompt: "SELECT method, SUM(amount_cents)/100.0 AS usd FROM payments WHERE usd > 3000 GROUP BY method — the desk wants rails with over $3,000 settled. What happens?",
      choices: [
        "Both rails return — card $37,364.00 and wire $32,248.00 both clear the bar",
        "It errors — WHERE runs before SELECT, so the aggregate alias 'usd' doesn't exist there yet",
        "Returns only rows where usd is NULL",
        "Silently ignores the filter and returns both rails",
      ],
      answer: 1,
      why: "The pipeline is FROM, WHERE, GROUP BY, SELECT: the alias is born in SELECT, after WHERE has already run — SQLite refuses the query ('misuse of aggregate'). A folded test lives in HAVING SUM(amount_cents)/100.0 > 3000, which evaluates after the fold.",
      notes: [
        { choice: 0, why: "The intent is right — both rails clear $3,000 settled — but the query never compiles. Placement, not logic, is the failure." },
        { choice: 3, why: "SQLite doesn't drop filters it can't understand — it refuses to run. A silently-ignored WHERE is a different bug class." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-14",
      prompt: "Report only the rails whose AVERAGE ticket clears $2,900 — card averages $2,335.25, wire $2,931.64. Where does the test live?",
      choices: [
        "WHERE AVG(amount_cents)/100.0 > 2900",
        "HAVING AVG(amount_cents)/100.0 > 2900",
        "WHERE avg_usd > 2900 — the alias from SELECT",
        "ORDER BY avg_usd > 2900",
      ],
      answer: 1,
      why: "The average is a fold product, so its filter runs after GROUP BY — that's HAVING's whole job. Only wire survives: 2931.64 clears 2900, card's 2335.25 does not. WHERE evaluates pre-fold and cannot host aggregates; the alias doesn't exist until SELECT.",
      notes: [
        { choice: 0, why: "Same predicate, wrong clause — AVG() in WHERE is a compile error because the fold hasn't happened yet." },
        { choice: 2, why: "Aliases are SELECT-stage; HAVING precedes SELECT in the pipeline. SQLite's alias-in-HAVING courtesy is non-portable — shipped SQL spells the aggregate out." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-15",
      prompt: "The exposure walk uses SUM(amount_cents) OVER (ORDER BY paid_on ROWS BETWEEN 1 PRECEDING AND CURRENT ROW). What does the FIRST settlement leg's running value print?",
      choices: [
        "0 — the frame is empty at the start",
        "NULL — there is no preceding row",
        "That leg's own amount — the frame holds exactly one row",
        "The book total",
      ],
      answer: 2,
      why: "The frame is 1 PRECEDING to CURRENT ROW, intersected with what exists: on the first row the PRECEDING side is empty, so the frame is the single current row and the running value IS that leg's amount. Frames trim to reality; they never pad with zeros or NULLs.",
      notes: [
        { choice: 1, why: "LAG returns NULL with no prior row; a SUM over a frame sums what's in it — one row here, a number, never NULL." },
        { choice: 0, why: "An empty frame would sum to NULL, not 0 — and this frame isn't empty: CURRENT ROW always belongs to it." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-16",
      prompt: "SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments — the collections anti-join as set arithmetic. How many rows return?",
      choices: ["22", "6", "28", "0"],
      answer: 1,
      why: "EXCEPT keeps the left set minus the right: 28 billing-cycle ids minus the 22 distinct ids carrying legs = 6 untouched cycles — $15,217.00 of exposure. Set ops fold to DISTINCT rows, so the five split cycles (1, 5, 12, 19, 22) can't sneak duplicates back in.",
      notes: [
        { choice: 0, why: "22 is the INTERSECT — cycles with at least one leg — the EXACT opposite direction of this anti-join." },
        { choice: 2, why: "28 is the left set alone; EXCEPT must subtract the right side's members before printing." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-17",
      prompt: "A close stack UNIONs branch A and branch B; both legitimately produce ('refunds', 3, 2521.0). How many rows print?",
      choices: [
        "2 — every branch prints",
        "1 — UNION deduplicates identical rows",
        "0 — duplicates cancel out",
        "Error — duplicate rows are illegal in a stack",
      ],
      answer: 1,
      why: "UNION is UNION ALL plus a dedup pass over the whole stack: the identical row collapses to one and nothing warns you. That's why close stacks ship UNION ALL — every branch must print so the parts reconcile to the total.",
      notes: [
        { choice: 0, why: "That's UNION ALL's contract. UNION's dedup pass fires before anything prints." },
        { choice: 3, why: "Duplicates are legal — they're just silently merged. Silent is precisely the problem at close." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-18",
      prompt: "paid_on is a TEXT timestamp. WHERE paid_on BETWEEN '2024-01-01' AND '2024-01-31' — which legs can silently drop?",
      choices: [
        "None — BETWEEN is inclusive on both ends",
        "Legs on Jan 31 with a time component — '2024-01-31 08:00:00' sorts after the bare '2024-01-31'",
        "Legs on Jan 1 — the lower bound is exclusive",
        "All legs — dates compare as numbers",
      ],
      answer: 1,
      why: "BETWEEN is inclusive, but the bound is the STRING '2024-01-31', and '2024-01-31 08:00:00' sorts lexicographically AFTER it — end-of-month legs with timestamps fall outside. The robust month window is half-open: paid_on >= '2024-01-01' AND paid_on < '2024-02-01'.",
      notes: [
        { choice: 0, why: "Inclusive of the boundary VALUE — but every same-day timestamp sorts after that boundary. The inclusiveness is exactly the trap." },
        { choice: 2, why: "'2024-01-01 08:00:00' >= '2024-01-01' — Jan 1 legs stay. The damage lives only at the UPPER edge." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-19",
      prompt: "WHERE billed > (SELECT AVG(amount_cents) FROM payments GROUP BY method) — the inner fold returns TWO rows (one per rail). What does SQLite do?",
      choices: [
        "Errors — a scalar subquery must return at most one row",
        "Yields NULL — the comparison filters everything out",
        "Runs — and compares against ONE of the two averages, silently",
        "Compares against both — effectively OR semantics",
      ],
      answer: 2,
      why: "SQLite does not raise the multi-row error other engines do: a scalar subquery used as an expression quietly takes one row of the inner result — and which row is an artifact of the plan. The screen prints plausible numbers built on an arbitrary rail's average. Guard it yourself: aggregate to one row, or stage the benchmark in a CTE and join on it.",
      notes: [
        { choice: 0, why: "That's Postgres. On this engine the failure is worse than an error: silence with wrong numbers." },
        { choice: 1, why: "NULL-yielding is the ZERO-row behavior. Two rows take a value — that's the bug, not a guard." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-20",
      prompt: "A month spine LEFT JOINs the settlement fold; a quiet month carries zero legs (2024-01 is one on this book). ROUND(SUM(p.amount_cents)/100.0/COUNT(p.id), 2) prints for that month?",
      choices: ["0.00", "NULL", "Error — division by zero", "'0' as text"],
      answer: 1,
      why: "SUM over no rows is NULL; NULL/100.0 is NULL; NULL/0 is NULL; ROUND(NULL) is NULL — the whole arithmetic chain propagates the absence, and the spine row prints a blank. If the desk's policy is 'quiet months show 0.00', that's a COALESCE at the display edge — a stated decision, not a default.",
      notes: [
        { choice: 0, why: "Zero is a measurement; NULL is an absence. The chain never manufactures a zero unless you write it." },
        { choice: 2, why: "SQLite returns NULL for division by zero — it doesn't raise. The row prints, carrying NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-21",
      prompt: "SELECT id, amount_cents FROM invoices WHERE status = 'open' LIMIT 3 is claimed to show 'the 3 biggest open cycles'. The ordered truth: #25 ($6,148.00), #24 ($4,937.00), #26 ($3,562.00). What's wrong?",
      choices: [
        "Nothing — LIMIT takes the biggest first",
        "Without ORDER BY the three rows are whichever the plan touches first — an arbitrary three, not the biggest",
        "LIMIT needs a TOP keyword",
        "Only 1 open cycle exists",
      ],
      answer: 1,
      why: "LIMIT truncates whatever order the engine produced; with no ORDER BY that order is an implementation artifact. The guarantee you want is ORDER BY amount_cents DESC LIMIT 3 — sort first, cut second. The unordered run can hand back #18, #21 and #24 and look authoritative doing it.",
      notes: [
        { choice: 0, why: "LIMIT cuts, never ranks — the cut is only as meaningful as the sort in front of it." },
        { choice: 3, why: "The open book is 6 cycles / $19,609.00 — plenty for a top-3, and the claim fails on ordering, not on supply." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-22",
      prompt: "WHERE status = 'PAID' over the invoice statuses — what returns?",
      choices: [
        "The 21 paid cycles — SQL is case-insensitive",
        "Zero rows — string equality is case-sensitive; the stored status is 'paid'",
        "An error — unknown status literal",
        "The 6 open cycles",
      ],
      answer: 1,
      why: "SQLite compares TEXT case-sensitively — no case-folding without COLLATE NOCASE — so 'PAID' matches nothing and a green query reports an empty paid book. The fix is the exact stored literal, or UPPER(status) = 'PAID' on both sides of the comparison.",
      notes: [
        { choice: 0, why: "SQL KEYWORDS are case-insensitive; DATA isn't. The literal must match the stored casing." },
        { choice: 3, why: "Wrong population entirely — and still zero: 'PAID' matches no stored status, open or otherwise." },
      ],
      difficulty: "easy",
    },
    {
      id: "nubank-mcq-23",
      prompt: "Two billing cycles tie for the largest billed amount. RANK() OVER (ORDER BY amount_cents DESC) hands them both rank 1. What rank does the NEXT cycle get?",
      choices: ["2", "3", "4", "NULL"],
      answer: 1,
      why: "RANK counts rows, not distinct values: two rows share rank 1, so the next row is rank 3 — the gap is the tie, visible on purpose. DENSE_RANK would say 2; ROW_NUMBER would have broken the tie arbitrarily (1, 2, 3) with the planner's mood as tie-break.",
      notes: [
        { choice: 0, why: "That's DENSE_RANK — no gaps. RANK leaves the tie's footprint in the sequence." },
        { choice: 2, why: "A three-way tie at the top would produce 4; here only two rows tie." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-24",
      prompt: "The terms clock: JULIANDAY('2024-03-01') - JULIANDAY('2024-02-28') over the 2024 calendar returns?",
      choices: ["1 — February ends on the 28th", "2 — 2024 is a leap year; Feb 29 sits between", "3", "0.5"],
      answer: 1,
      why: "JULIANDAY counts real calendar days — 2024 has a Feb 29, so Mar 1 minus Feb 28 is 2.0. Aging ladders and dunning clocks computed across Februaries drift a day if the leap day is assumed away — exactly the bug that fires only in leap years and survives every non-leap test suite.",
      notes: [
        { choice: 0, why: "True in 2023, false in 2024 — a year-dependent bug, the worst kind to ship." },
        { choice: 2, why: "That would be Mar 2 minus Feb 28 — one day past the question." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-25",
      prompt: "Find the billing cycles carrying at least one wire leg. Which predicate is the correlated probe?",
      choices: [
        "WHERE EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id AND p.method = 'wire')",
        "WHERE EXISTS (SELECT 1 FROM payments WHERE method = 'wire')",
        "WHERE p.method = 'wire'",
        "WHERE i.id IN (SELECT invoice_id FROM payments WHERE method = 'card')",
      ],
      answer: 0,
      why: "The probe must reference the outer row — p.invoice_id = i.id — so each cycle is tested against ITS OWN legs; 11 cycles qualify. EXISTS stops at the first match, the cheap way to ask 'at least one', and it's NULL-safe where NOT IN is not.",
      notes: [
        { choice: 1, why: "Uncorrelated: 11 wire legs exist somewhere, so EXISTS is TRUE once and forever — the census returns all 28 cycles." },
        { choice: 3, why: "Wrong rail — 'card' probes the revolving legs, not the wire legs, and returns a different set entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-26",
      prompt: "A UNION ALL stack: branch 1 projects 3 columns, branch 2 projects 4. What happens?",
      choices: [
        "The stack builds — the 4th column NULL-fills on branch 1",
        "Error — every branch must project the same number of columns",
        "The extra column is dropped",
        "Only branch 1 runs",
      ],
      answer: 1,
      why: "A stack is one result set with one shape: SQLite refuses to build it — 'SELECTs to the left and right of UNION do not have the same number of result columns'. The contract is column count AND compatible types per position; a NULL-filled 4th column would be the reader's guess, not the engine's.",
      notes: [
        { choice: 0, why: "That's an OUTER JOIN's behavior between tables, not a set op between branches. Stacks are stricter." },
        { choice: 2, why: "Nothing is silently dropped — the engine stops at compile time. The fix is padding the short branch with an explicit NULL literal, on purpose." },
      ],
      difficulty: "medium",
    },
    {
      id: "nubank-mcq-27",
      prompt: "SELECT id FROM invoices i WHERE EXISTS (SELECT 1 FROM payments p WHERE p.method = 'wire') — the probe forgot its correlation. How many rows return?",
      choices: ["11", "22", "28", "6"],
      answer: 2,
      why: "The inner query never references the outer row: 11 wire legs exist, so EXISTS is TRUE once and forever — for every one of the 28 cycles. The correlation (p.invoice_id = i.id) is what turns a constant TRUE into a per-cycle test, which would return 11.",
      notes: [
        { choice: 1, why: "22 is the touched-cycle count — the CORRELATED probe's answer, not this one's." },
        { choice: 3, why: "6 is the untouched census — the anti-join's answer, again not a constant-TRUE probe's." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-28",
      prompt: "A reversal leg promotes to -2361.50. CAST(-2361.5 AS INTEGER) returns?",
      choices: [
        "-2362 — SQLite rounds to nearest",
        "-2361 — CAST truncates toward zero",
        "-2361.5 — CAST preserves the fraction",
        "Error — CAST can't take negatives",
      ],
      answer: 1,
      why: "CAST to INTEGER truncates toward zero: the .5 vanishes and a -2361.5 reversal becomes -2361 — half a dollar invented out of a ledger. Reversal legs are why the house rule is fold in cents, promote with /100.0, and never let CAST touch money.",
      notes: [
        { choice: 0, why: "That's ROUND's away-from-zero behavior (or FLOOR's -2362). CAST does neither — it chops toward zero." },
        { choice: 2, why: "CAST to INTEGER changes the type; the fraction cannot survive it." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-29",
      prompt: "Two legs settle the same day. SUM(amount_cents) OVER (ORDER BY paid_on) prints IDENTICAL running values for both rows. Why?",
      choices: [
        "The SUM is deduplicating rows",
        "The default frame is RANGE — rows tying on the ORDER BY key are peers and share the frame",
        "OVER without a frame means no accumulation",
        "The engine collapsed the two rows into one",
      ],
      answer: 1,
      why: "With ORDER BY and no explicit frame, the default is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — and RANGE includes peers: same paid_on, same frame, same running value. It's the 'value as of that moment' reading. When the desk wants per-leg walking, write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — then the frame, not the tie, decides.",
      notes: [
        { choice: 0, why: "Nothing deduplicates — both rows print. Their shared frame is what makes the numbers match." },
        { choice: 2, why: "No frame means the DEFAULT frame, not the absence of one — the accumulation still runs." },
      ],
      difficulty: "hard",
    },
    {
      id: "nubank-mcq-30",
      prompt: "SELECT AVG(amount_cents) FROM payments — amount_cents is INTEGER. What type does AVG return?",
      choices: [
        "INTEGER — AVG keeps the column's type",
        "REAL — AVG always returns a floating-point value",
        "TEXT",
        "NULL — 27 rows is too few",
      ],
      answer: 1,
      why: "AVG's contract is REAL, always: 6,961,200 cents over 27 legs = 257822.222… The cents discipline then promotes at display — /100.0 and ROUND(..., 2) once — printing $2,578.22. INTEGER in, REAL out: plan the formatting downstream of the fold, never inside it.",
      notes: [
        { choice: 0, why: "SUM keeps INTEGER over INTEGER; AVG never does — the division promotes to REAL by contract." },
        { choice: 3, why: "Row count has nothing to do with it; AVG over 27 non-NULL legs is a number, not a shrug." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-nubank-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "Settlement rail scorecard: legs by rail",
      brief:
        "Payments memo, before the rail review: the scorecard reads settlement legs per rail from one two-table fold — each leg's method against the cycle it settles. Probed scale: 27 legs across 28 billing cycles, only 22 distinct cycles touched (five settle in two legs); card runs 16 legs for $37,364.00, wire 11 legs for $32,248.00. The join is the audit trail: legs bind to cycles on the declared foreign key, never on id coincidence — payment ids 1..27 against cycle ids 1..28 match by accident and the mis-pairing still sums plausibly.",
      ask: "Return each rail with its settlement-leg count and settled dollar value, biggest value first.",
      template:
        "SELECT p.{1} AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_usd\nFROM payments p\nJOIN invoices i ON i.id = p.{2}\nGROUP BY 1\nORDER BY settled_usd {3};",
      slots: [
        {
          answer: "method",
          kind: "keyword",
          label: "the rail column",
          why: "The rail lives on the leg: p.method. Substituting p.paid_on folds by settlement date — 26 groups of one leg each, a calendar wearing the rail scorecard's name; p.amount_cents folds by amount, and p.status doesn't exist on payments at all.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the leg→cycle key",
          why: "Legs bind to cycles on the declared FK: p.invoice_id. Substituting p.id joins on id coincidence — payment ids 1..27 against cycle ids 1..28 match almost everywhere, so the totals look right while legs pair with the wrong cycles. Substituting p.paid_on or p.amount_cents compares an integer to a date or an amount: zero matches, an empty book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first direction",
          why: "The rail review opens with money: card's $37,364.00 above wire's $32,248.00. ASC is a correct query answering the opposite question — it leads with the smaller rail and buries the one the roadmap is winning.",
        },
      ],
      distractors: ["status", "paid_on", "amount_cents", "ASC"],
      walkthrough:
        "A two-table fold, one key deliberate. The join binds legs to cycles (i.id = p.invoice_id) — the declared FK, not the id coincidence: with p.id the join matches legs to cycles by equal primary keys and the scorecard still sums plausibly, which is exactly the silent mis-pairing a close can't survive. Folded per rail: COUNT(*) is the leg grain — card 16, wire 11 — and ROUND(SUM(p.amount_cents) / 100.0, 2) is the money grain, INTEGER cents promoted with /100.0 before a single final ROUND: card $37,364.00, wire $11-legs' $32,248.00. ORDER BY settled_usd DESC leads with card; ASC inverts the board and buries the bigger rail; ORDER BY a nonexistent p.status, a raw date, or the amount column either errors or reshapes the fold into a calendar or a histogram. Two rails, one fold, cents promoted once — the scorecard the rail review actually walks.",
    },
    {
      id: "cs-nubank-2",
      tier: "hard",
      topic: "s6",
      universe: "refund-audit",
      title: "The coverage ladder: exact, partial, no legs",
      brief:
        "Credit-risk memo, ahead of committee: the coverage ladder classifies every billing cycle by its settlement evidence, and the classification is the finding. Probed book: 28 cycles — 21 settle exact ($65,612.00), 1 sits partial at $4,000.00 of $6,148.00, 6 carry no legs at all ($15,217.00, five open plus #28 which reads paid-but-unmoved). The ladder stages a per-cycle fold (LEFT JOIN so untouched cycles survive), then CASE-classifies — no legs first, exact only when settled equals billed, partial is the ELSE — and the arm order is the contract the committee audits.",
      ask: "Return the coverage census: classification, cycle count, billed dollars and settled dollars per class, biggest class first.",
      template:
        "WITH covered AS (\n  SELECT i.id,\n         i.amount_cents AS billed,\n         SUM(p.amount_cents) AS settled\n  FROM invoices i\n  LEFT JOIN payments p ON p.{1} = i.id\n  GROUP BY i.id\n)\nSELECT CASE\n         WHEN settled {2} THEN 'no legs'\n         WHEN settled = {3} THEN 'exact'\n         ELSE 'partial'\n       END AS coverage,\n       COUNT(*) AS cycles,\n       ROUND(SUM(billed) / 100.0, 2) AS billed_usd,\n       ROUND(SUM(COALESCE(settled, 0)) / 100.0, 2) AS settled_usd\nFROM covered\nGROUP BY coverage\nORDER BY cycles {4}, coverage DESC;",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the fold's join key",
          why: "The per-cycle fold binds legs on p.invoice_id. Substituting p.id joins on id coincidence — 27 legs against 28 cycle ids match almost everywhere, and the census reads 27 'exact' cycles plus #28: a ladder with the contradictions laundered out. p.customer_id doesn't exist on payments and errors.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the untouched test",
          why: "A cycle with no legs folds to SUM = NULL, so the first arm must test IS NULL. Swapping in IS NOT NULL reclassifies the 22 touched cycles as 'no legs' and dumps the truly untouched into partial — the census inverts. A bare = NULL never fires: NULL = NULL is UNKNOWN, and the six untouched cycles silently fall to the ELSE.",
        },
        {
          answer: "billed",
          kind: "keyword",
          label: "the exact-match comparison",
          why: "Exact means settled equals the cycle's own billed amount: settled = billed. Substituting settled = settled passes every touched cycle — 'exact' balloons to 22 and partial vanishes; substituting settled = id compares dollars to primary keys and reclassifies the whole book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-class-first direction",
          why: "The committee reads the ladder top-down: 21 exact cycles first, the 6 untouched below, the 1 partial last. ASC leads with the one-row partial and buries the class that carries the book — and the coverage DESC tie-break keeps the order deterministic.",
        },
      ],
      distractors: ["id", "IS NOT NULL", "settled", "ASC"],
      walkthrough:
        "Stage the fold, then classify, then census. The CTE folds 28 cycles to one row each: LEFT JOIN keeps the legless, SUM(p.amount_cents) per cycle — NULL for the six untouched, exact for 21, $4,000.00 for the partial #25. The CASE ladder runs in contract order: IS NULL catches 'no legs' (NULL = anything is UNKNOWN, so an equality arm can never catch them), settled = billed catches 'exact', and the ELSE is 'partial' — 21 / 6 / 1. The census folds again per class: exact 21 cycles / $65,612.00 billed / $65,612.00 settled; no legs 6 / $15,217.00 / $0.00 (the COALESCE only guards the display sum — the classification already kept NULL meaning 'no evidence'); partial 1 / $6,148.00 / $4,000.00. Every distractor breaks a different wall: p.id mispairs by coincidence, IS NOT NULL inverts the ladder, settled = settled makes everything exact, ASC buries the headline class. Fold, ladder, census — and the contradictions (#11 void-but-settled $925.00, #28 paid-but-unmoved $1,756.00) stay visible in the no-legs and partial rows instead of dissolving into zero.",
    },
    {
      id: "cs-nubank-3",
      tier: "medium",
      topic: "t8",
      universe: "growth",
      title: "The authorization walk, month by month",
      brief:
        "Growth memo, ahead of the monthly board: the committee reads authorization volume as a walk — each month's count beside its delta versus the prior month, newest months first. Probed series: 14 months, 2024-01 through 2025-02, counts 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7 — a flat-to-the-eye book where the deltas (+1, -1, -1, +1, -2, +2, -1, +2, -2, -1, +1, -1, +1) carry all the signal, and the first month's delta is NULL because no prior month exists to beat. The board wants the most recent five months of the walk, newest first.",
      ask: "Return the last five months of the walk: month, authorization count, delta vs prior month — newest month first.",
      template:
        "WITH monthly AS (\n  SELECT {1} AS month,\n         COUNT(*) AS auths\n  FROM orders\n  GROUP BY month\n),\nwalk AS (\n  SELECT month,\n         auths,\n         auths - {2}(auths) OVER (ORDER BY {3}) AS delta\n  FROM monthly\n)\nSELECT month, auths, delta\nFROM walk\nORDER BY month {4}\nLIMIT {5};",
      slots: [
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month key",
          why: "The prefix cut turns the ISO timestamp into a 'YYYY-MM' key — 14 distinct months from 2024-01 to 2025-02. SUBSTR(created_at, 6, 2) keeps only '01'..'12' and folds the two Januarys into one bucket; a bare created_at groups per instant, 103 groups of one.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookback",
          why: "Delta means this month minus the PRIOR month in calendar order — LAG. LEAD flips every sign (the series reads against the calendar) and NULLs the newest row instead of the oldest, exactly backwards for a walk that ends at today.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the window's sort key",
          why: "Previous means previous in calendar order: the window must ORDER BY month. Ordering by auths makes 'prior' mean 'next-lower count' — a different series that prints zeros wherever counts repeat and nonsense wherever they don't.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first direction",
          why: "The board reads the freshest months first: month DESC puts 2025-02 on top. ASC is a correct query answering the opposite question — it leads with the book's oldest bucket, 2024-01.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the five-month cut",
          why: "The ask names five months, so the cut is 5 — a display constant, not a metric. 3 would hide December's +1; 10 would drag the walk back into mid-2024 where the +2 spikes live.",
        },
      ],
      distractors: ["LEAD", "SUBSTR(created_at, 6, 2)", "auths", "ASC"],
      walkthrough:
        "Two stages, then a cut. Stage one folds 103 authorizations into 14 month buckets via the SUBSTR prefix key — 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7, a series that never leaves the 6-to-9 band. Stage two windows over the fold: LAG(auths) ORDER BY month hands each month its predecessor, and auths - LAG(auths) prints the walk — +1, -1, -1, +1, -2, +2, -1, +2, -2, -1, +1, -1, +1 — with 2024-01's delta NULL because no prior month means no comparison; the +2 spikes (2024-07, 2024-09) and the -2 dips (2024-06, 2024-10) are the only beats the committee circles. The display sort runs month DESC and LIMIT 5 hands over the newest five: 2025-02 (7, +1), 2025-01 (6, -1), 2024-12 (7, +1), 2024-11 (6, -1), 2024-10 (7, -2). Each distractor fails a different joint: LEAD flips the lookback so the newest row goes NULL and every sign inverts; the (6, 2) prefix merges both Januarys into a 13-bucket fold; ORDER BY auths makes 'previous' mean 'next-lower count' and flattens the walk to zeros on every plateau; ASC leads with 2024-01; LIMIT 10 truncates to a different deliverable. Fold in the CTE, walk in the second stage, cut at the edge — the shape the committee replays.",
    },
    {
      id: "cs-nubank-4",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "One-pass funnel census by region",
      brief:
        "Funnel memo, Monday growth standup: the authorization funnel needs its regional cut in ONE pass — every status counted beside the decline share, no four-query drift. Probed book: 103 authorizations — 52 posted / 30 clearing / 14 open / 7 declined; by region, APAC runs 37 with 3 declined (8.1%), EU 45 with 3 (6.7%), US 19 with 1 (5.3%), and LATAM's 2 authorizations sit below the desk's 10-authorization reporting gate. The identity the standup checks: the four status arms must sum back to COUNT(*), and the decline share's denominator is the region's own authorization count, never the settled subset.",
      ask: "Return regions with at least 10 authorizations: region, total, posted, clearing, open, declined and decline share — worst share first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS auths,\n       COUNT(*) {1} ({2} o.status = 'delivered') AS posted,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS clearing,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS open_auths,\n       COUNT(*) FILTER (WHERE {3} = 'cancelled') AS declined,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), 1) AS decline_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {4}\nORDER BY decline_pct {5};",
      slots: [
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the one-pass census clause",
          why: "FILTER (WHERE …) arms each count off the same scan — the census's structural identity is that posted + clearing + open + declined sums back to COUNT(*). SUM() in that position is a parse error, and a second query would drift by snapshot.",
        },
        {
          answer: "WHERE",
          kind: "keyword",
          label: "the arm's row test",
          why: "FILTER's grammar is FILTER (WHERE <row test>): the row test rides inside. HAVING there is a parse error — HAVING belongs to group filters, and this arm judges rows, not groups.",
        },
        {
          answer: "o.status",
          kind: "keyword",
          label: "the decline arm's column",
          why: "The decline arm tests the authorization's own status column, qualified to the orders alias. o.method doesn't exist on orders — payments carry methods — and leaving the column unqualified happens to resolve today, which is how alias drift starts.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the reporting gate",
          why: "The memo sets the gate at 10 authorizations so LATAM's 2-row sample can't print a 0.0% decline share that reads as safety. 20 would also drop the US row; 5 reads the same today and diverges the day LATAM grows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "Risk reads worst first: APAC's 8.1% decline share leads, then EU 6.7%, then US 5.3%. ASC hands the standup its safest region on top and buries the one the review exists to discuss.",
        },
      ],
      distractors: ["SUM", "HAVING", "o.method", "20", "ASC"],
      walkthrough:
        "One scan, six cells, one identity. The join binds authorizations to holders (o.customer_id = c.id) and folds per region: COUNT(*) is the denominator — APAC 37, EU 45, US 19 — and the FILTER arms count statuses off the same rows: posted 21/24/5, clearing 8/12/10, open 5/6/3, declined 3/3/1. The identity ships with the census: 21+8+5+3 = 37, 24+12+6+3 = 45, 5+10+3+1 = 19 — pieces equal whole because every arm read the same scan. The decline share promotes BEFORE dividing (100.0 * 3 / 37) and rounds once at the edge: 8.1%, 6.7%, 5.3% — APAC leads the board, US trails. HAVING COUNT(*) >= 10 applies the memo's reporting gate; LATAM (2 authorizations, 0 declined) stays off the board so a small-sample 0.0% can't impersonate safety. The distractors each break a joint: SUM in the FILTER slot is a parse error; HAVING inside FILTER is a parse error; o.method doesn't exist on orders; a gate of 20 deletes the US row; ASC flips the board to lead with the safest region. One pass, one denominator, one identity — the census the standup can audit in thirty seconds.",
    },
    {
      id: "cs-nubank-5",
      tier: "hard",
      topic: "q5",
      universe: "fraud",
      title: "The contradiction hunt: void-but-settled, paid-but-unmoved",
      brief:
        "Fraud spot-check memo, escalated from the recon queue: two billing cycles carry status/evidence contradictions, and both are one row each and enormous in consequence. Probed: cycle #11 reads void yet carries a settled leg of $925.00; cycle #28 reads paid at $1,756.00 billed with no settlement leg behind it at all. The hunt stages a per-cycle fold of the 27 settlement legs as a derived table, LEFT JOINs it onto the 28 cycles so legless cycles survive as NULL, and the WHERE arms name each contradiction family — void WITH evidence, paid WITHOUT it.",
      ask: "Return both contradiction cycles: id, status, billed dollars and settled dollars — biggest settled exposure first.",
      template:
        "SELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS billed_usd,\n       ROUND(COALESCE(f.settled, {1}) / 100.0, 2) AS settled_usd\nFROM invoices i\nLEFT JOIN (SELECT invoice_id, SUM({2}) AS settled\n           FROM payments\n           GROUP BY {3}) f\n       ON f.invoice_id = i.id\nWHERE (i.status = 'void' AND f.settled {4})\n   OR (i.status = 'paid' AND f.settled IS NULL)\nORDER BY settled_usd DESC;",
      slots: [
        {
          answer: "0",
          kind: "number",
          label: "the display fallback",
          why: "A legless cycle folds to NULL and the display needs a number: COALESCE(settled, 0) prints #28's settled as $0.00 — evidence of nothing settled, which IS the finding. The classification never sees the zero: the WHERE arms test f.settled IS NULL, so the COALESCE cannot launder the contradiction.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the fold's money column",
          why: "The fold sums the leg's money: SUM(amount_cents). SUM(id) folds primary keys — #11's leg reads $0.22; SUM(paid_on) converts dates to their numeric prefix — #11 reads $20.24. Both print plausible-looking cells that are nobody's settlement.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the fold's grain",
          why: "One row per cycle is the contract: GROUP BY invoice_id, the declared key legs bind on. Folding by paid_on or by the leg's own id survives today only because #11 carries exactly one leg — any second leg on that cycle, or any same-day leg elsewhere, re-pairs rows and the fraud queue quietly loses its row.",
        },
        {
          answer: "IS NOT NULL",
          kind: "keyword",
          label: "the void-with-evidence test",
          why: "The void arm needs evidence PRESENT: settled IS NOT NULL catches #11's $925.00 leg. IS NULL selects the legless — the void arm goes empty and only #28 survives, half the finding. A bare = 0 never fires on a void leg and drops #11 the same silent way.",
        },
      ],
      distractors: ["p.status", "925", "IS NULL", "= 0", "AND"],
      walkthrough:
        "Fold, join, name the contradictions, sort by exposure. The derived fold reduces 27 legs to one row per cycle: SUM(amount_cents) grouped by invoice_id — five cycles fold two legs (1, 5, 12, 19, 22), 22 distinct cycles served. LEFT JOIN keeps all 28 cycles; the legless fold to NULL, which the WHERE arms read as evidence ABSENT: the void arm (settled IS NOT NULL) catches #11 — void, $925.00 billed, $925.00 settled; the paid arm (settled IS NULL) catches #28 — paid, $1,756.00 billed, nothing behind it. COALESCE(settled, 0) exists for display only — #28 prints $0.00 settled — because the classification already happened on the NULL, and laundering it earlier would turn a fraud finding into a footnote. ORDER BY settled_usd DESC leads with the cycle that took money it shouldn't have: #11 first at $925.00, #28 below at $0.00. The distractors each break a wall: p.status doesn't exist on payments and errors everywhere it's dropped; 925 as the display fallback prints #28 as $9.25-settled — the finding inverted; IS NULL in the void arm keeps only #28, half the hunt; = 0 compares dollars to NULL and drops #11; AND demands void-and-paid in one cycle, which no row can be, and the queue empties.",
    },
    {
      id: "cs-nubank-6",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The opex stack with its TOTAL anchor",
      brief:
        "Spend-report memo, close week: opex ships as a stacked board — one line per expense category, then a TOTAL anchor, and the anchor must reconcile to the parts or the board doesn't leave. Probed book: 36 opex lines worth $25,416.00 — Rent 14 lines / $16,800.00, Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00 (one vendor each: Atlas Property GmbH, AdWorks Media, Skyline Travel, DevTools Inc). Every money cell is INTEGER cents folded with /100.0 exactly once, and the stack is UNION ALL — UNION's dedup pass would be a silent row-killer at close.",
      ask: "Return the opex board: category, line count, dollars — with a TOTAL row anchoring the fold, biggest dollars first.",
      template:
        "SELECT {1} AS bucket,\n       COUNT(*) AS lines,\n       ROUND(SUM({2}) / 100.0, 2) AS usd\nFROM expenses\nGROUP BY bucket\nUNION ALL\nSELECT {3},\n       COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY usd {4};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the board's fold key",
          why: "One row per expense category: GROUP BY category — Rent, Ads, Travel, Tools. vendor cuts the same 36 lines into four DIFFERENT groups (Atlas, AdWorks, Skyline, DevTools) with identical dollar values — a board that looks right and audits wrong; spent_on is a calendar wearing the fold's name.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the money column",
          why: "INTEGER cents end to end: SUM(amount_cents), promoted once with /100.0, rounded once at the edge. SUM(id) folds primary keys — Rent prints $2.51; SUM(spent_on) converts dates to their numeric prefix — Rent prints $283.38. Both are plausible-looking nonsense.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the anchor's label",
          why: "The anchor is a literal — 'TOTAL', quoted, so it's a value not a column reference. Unquoted TOTAL errors (no such column); 'total' is a different label and every diff-check downstream flags a phantom rename; a real category name would masquerade as data and double-count in the reader's eye.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "Close reads money first: the TOTAL anchor ($25,416.00) tops the board, then Rent $16,800.00, Ads $4,570.00, Travel $2,521.00, Tools $1,525.00. ASC inverts the board and leads with the smallest line — a correct query answering the opposite question.",
        },
      ],
      distractors: ["vendor", "spent_on", "id", "'total'", "ASC"],
      walkthrough:
        "A stack with an anchor, built to reconcile. Branch one folds 36 opex lines per category: COUNT(*) is the line grain — Rent 14, Ads 14, Travel 3, Tools 5 — and ROUND(SUM(amount_cents)/100.0, 2) is the money grain — $16,800.00, $4,570.00, $2,521.00, $1,525.00, cents promoted once and rounded once. Branch two is the anchor: the same two aggregates over the whole table, labelled with the 'TOTAL' literal — 36 lines, $25,416.00 — and the reconciliation identity is the board's audit: 16800 + 4570 + 2521 + 1525 = 25416, parts equal anchor or the board doesn't ship. UNION ALL keeps every branch; UNION would dedupe identical branch rows and quietly break the identity. ORDER BY usd DESC runs once over the combined set — TOTAL first, then Rent down to Tools. The distractors each break a wall: vendor refolds the same dollars under supplier names, a board that reconciles to the wrong segments; spent_on folds per day — 30-odd one-line rows; SUM(id) and SUM(spent_on) print $2.51-style nonsense; 'total' (lowercase) is a phantom rename every diff-check flags; ASC leads with Tools and buries the anchor's logic. Fold, anchor, reconcile — the close board's whole grammar.",
    },
  ],

  problems: [
    { slug: "capital-gain-loss", why: "Fold each cycle's settled value against what went out — bought vs sold as debit-leg vs credit-leg reads, the settlement mirror's simplest graded form." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Top transactor by authorization count — the holder-exposure leader the credit line review opens with, subquery included." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of holders active per cycle — engagement coverage whose denominator must be all holders, not the active ones." },
    { slug: "queries-quality-and-percentage", why: "Per-merchant quality ratio above a threshold — the merchant watchlist shape: ratio by group, flagged rows surfaced, NULLs handled." },
    { slug: "combine-two-tables", why: "Holders LEFT JOINed onto their activity with zero-fill — the scorecard where a holder with no authorizations appears at zero, not missing." },
    { slug: "average-salary-of-departments", why: "Holder spend versus book average — the above-benchmark screen that compares each segment's fold to the global mean." },
    { slug: "find-the-team-size", why: "COUNT OVER per group — cohort size attached to every authorization, the credit-vintage read before any delinquency curve." },
    { slug: "team-scores-in-football-tournament", why: "Two-orientation fold with zero-fill — card legs and Pix legs scored home and away, rails that must both appear even when quiet." },
    { slug: "count-salary-categories", why: "UNION ALL with zero buckets — the delinquency ladder where an empty band must still print as a row, or the committee misreads coverage." },
    { slug: "weather-type-in-each-country", why: "CASE classification joined onto the segment table — status bands mapped per region, the regional risk cut in its drill form." },
    { slug: "running-total-for-different-genders", why: "Running totals per segment — the exposure walk within each rail, frame edges and all." },
    { slug: "account-balance", why: "Running balance per account in time order — the ledger walk: every settlement leg applied in sequence, order the whole point." },
    { slug: "trial-balance-check", why: "Debits equal credits — the GL assertion behind the 181,080 = 181,080 tie, graded as a single fold." },
    { slug: "gl-reconciliation", why: "General-ledger reconciliation — the month-close ritual: legs to cycles to ledger, every branch summing back before it ships." },
    { slug: "maximum-transaction-each-day", why: "Peak leg per day — the biggest ticket per settlement date, window-argmax with a deterministic tie-break." },
    { slug: "first-and-last-call-on-the-same-day", why: "First and last leg per day — the settlement window the ops desk watches, two aggregates that must agree on the day's boundary." },
    { slug: "portfolio-concentration-hhi", why: "Concentration the way the credit committee reads it: share of book value by holder tier — the 63.5% / 71.2% concentration facts rebuilt as a fold with the denominator stated." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain monthly census: authorizations placed versus holders served — 27 settlement legs over 22 cycles is the same lesson at settlement grain, and the board prints both." },
    { slug: "bank-account-summary", why: "Holder-level settlement ledger: money in versus money out per account, the two-column walk the account team reconciles at close — cents exact or it isn't a ledger." },
    { slug: "products-worth-over-invoices", why: "Merchant price checked against the billed cycle — plan-price versus cycle-amount drift, the read that feeds the disputes queue before chargebacks do." },
    { slug: "confirmation-rate", why: "Two-rail confirmation quality: settled share per rail with the driver's share as denominator — the Pix-versus-revolving reliability cut, NULL-leg safe." },
    { slug: "card-launch-success", why: "Card-plan launch census: adoption by plan since launch — the growth read that decides which card product gets the next marketing push." },
    { slug: "spend-histogram", why: "Revolving exposure bands: authorizations bucketed by ticket size — the spend histogram the credit-line team reads before raising limits." },
    { slug: "create-a-session-bar-chart", why: "Aging bands as a bar chart: cycles bucketed into CASE arms that must partition with no overlap and no gaps — the delinquency ladder's histogram form." },
    { slug: "suspicious-bank-account-transactions", why: "The fraud queue's shape: accounts flagged by behavior predicates — the void-but-settled $925.00 / paid-but-unmoved $1,756.00 hunt generalized to any account table." },
    { slug: "customer-order-frequency", why: "Dunning cadence: holders active in consecutive months — recurring settlement behavior separated from one-off tickets, the roll rate's raw input." },
    { slug: "the-most-recent-three-orders", why: "Recency ladder per holder: the last three authorizations each — collections reads recency before it reads balance, and ties need a deterministic break." },
    { slug: "product-price-at-a-given-date", why: "Point-in-time reads: the plan price as of a date — the as-of discipline the credit-line review needs when limits changed mid-cycle." },
    { slug: "immediate-food-delivery-i", why: "Same-day settlement share: authorizations settled immediately versus held — the instant-rail promise measured over ALL authorizations, denominator stated." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Rolling 30-day window census: activity inside a stated date window — the growth board's trailing read, boundaries half-open so the window never double-counts." },
    { slug: "total-sales-amount-by-year", why: "Year-fold settlement totals that must reconcile to the monthly walk's parts — the annual board line whose identity the close checks first." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT per day: legs folded into an audit cell per settlement date — the split-cycle list ('1,5,12,19,22') generalized, order forced or every diff-check lies." },
  ],
};
