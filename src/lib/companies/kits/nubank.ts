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
  ],

  dayInLife: [
    "**08:10 —** The day starts on the authorization funnel. First query is the overnight read: authorizations by outcome — 52 of 103 posted all-time, the {rose:decline} share watched hardest (6.8% book-wide, and the region cut is what the growth review quotes) — then the settlement mirror: legs that landed overnight versus cycles they claim to cover. The morning artifact is a two-grain count: 27 settlement legs across only 22 distinct cycles, because five cycles settle in two legs — *a census that can't say both grains out loud is the one that double-counts a cycle during close*. A mismatch pages payments ops, not a shrug.",
    "**11:30 —** Midday is delinquency surgery. The coverage ladder runs: every billing cycle folded against its legs, classified exact / partial / no legs — **21 / 1 / 6** — with the arm order written before the rows: a cycle with no legs is 'no legs' first, exact only when settled equals billed, partial is the ELSE that explains itself. The committee pack wants the two contradictions named, not smoothed: #11 is {rose:void} with a $925.00 leg on the books, #28 reads {emerald:paid} at $1,756.00 with nothing behind it — *both are findings, and neither survives a COALESCE that launders NULL into zero*. Each ladder ships with the folded CTE shown, so the fold can be replayed row by row.",
    "**16:00 —** The afternoon is the credit-committee cycle. The pack charts the {violet:authorization walk}: month buckets via SUBSTR, 6 to 9 authorizations a month, LAG deltas annotated, the first month's delta printed as NULL because no prior month means no comparison. Rails walk beside it: card 16 legs / $37,364.00 against wire 11 legs / $32,248.00, average leg $2,335.25 versus $2,931.64 — *the instant rail carries bigger tickets, and the committee reads that as Pix doing its job*. Every branch of every pack query reconciles against a plain `COUNT(*)` before it ships — and the ledger gets the last word: debits **181,080** equal credits **181,080**, delta zero, the one number allowed to be boring.",
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
  ],
};
