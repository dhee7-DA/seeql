// Goldman Sachs — kit 1 of the Banking & Capital Markets domain (Batch H).
// Markets data, risk counts and the Marquee screen: the sell-side read, where
// every number must reconcile before it ships. The storefront db maps on
// honestly: invoices are trade confirmations (receivables), payments are the
// settlements that clear them, ledger_entries is the double-entry ledger,
// expenses are op-cost lines. Money in those tables is INTEGER cents — the
// dollar read is always amount_cents / 100.0.
// Pool provenance: Goldman has 2 tagged sql rows in the band
// (countries-you-can-safely-invest-in, value-at-risk); the rest of the pool
// and topic slugs are theme-curated from company-pools.md — provenance stated
// per problem below. Case figures: scripts/company-facts.md (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const goldmanKit: CompanyKit = {
  id: "goldman",
  domainId: "banking",
  name: "Goldman Sachs",
  tagline: "Markets data, risk counts, the marquee screen",
  accent: "text-amber-300",

  brief: [
    "Goldman Sachs is the trading-and-markets firm — founded in **1869**, organized today around Global Banking & Markets, Asset & Wealth Management and Platform Solutions, with **Marquee** as the client-facing screen where positions, risk counts and market data meet the outside world. The firm's product is judgment on {rose:risk}, and risk is counts: exposures by book, settlements against confirmations, {amber:break queues} by age. The cultural rule every analyst absorbs in week one is that a number which does not reconcile is not a number — *it is a rumor with a decimal point, and it does not go near the marquee screen.*",
    "The data org lives close to the books of record. Every trade confirmation lands as a receivable; every settlement clears against it on a rail; every dollar of both is posted twice into the double-entry ledger, debit and credit, with money stored as **INTEGER cents** — the dollar read is always `cents / 100.0`, and the missing .0 is how half-dollars quietly leak out of client reports. The daily proof is mechanical and non-negotiable: fold the ledger and total debits must equal total credits — on this book that is **181080.00 against 181080.00 across 80 entries, delta 0** — before any desk-level fold is believed. Op-cost lines feed the `operating_expenses` account the same way, and the month-close pack is the artifact everything else exists to serve.",
    "Interview style is precise, audit-minded and deliberately unforgiving about grain. A screen typically walks from a warm-up fold — settle counts against confirmations — into a reconciliation question where the denominator or the join key IS the test: '**28 confirmations, 27 settlements, five of them split across two rails** — how many rows does your join return, and which confirmations vanish?' Follow-ups probe the {rose:NULL policy} out loud ('is that number excluding the unsettled book, and do you mean to?') and the units ('is that cents or dollars?'). Candidates who narrate grain, units and survival rules before writing SQL outperform; *cleverness that cannot reconcile is graded as a bug*.",
    "Preparation strategy: Goldman has **two tagged problems** in this app's band — the country-investment ratio screen and the **Value-at-Risk** fold — and the rest of the pool is theme-curated to its known question families: settlement folds, anti-join watchlists, CASE-classified coverage, risk ladders, balance walks and cents-precision reads (provenance stated per problem). Do the topics in order, then run both case studies on the live storefront database: one rebuilds the {amber:split-settlement worklist} cash application ships every morning, the other rebuilds the {emerald:trial-balance proof} the controller closes the month with.",
  ],

  dayInLife: [
    "**08:00 —** the day opens on risk counts, not headlines. The desk analyst checks the {rose:overnight reconciliation} first: did total debits still equal total credits on the ledger fold (delta 0, or page someone), did any new settlement attach to a confirmation with no booking, and is the unsettled watchlist — **6 confirmations carrying 15217.00** — {amber:aging} the way the terms say it should? The first query of the day is a proof, not a chart: confirmations folded against settlements, void-but-paid and paid-no-settlement breaks classified and quantified before the **Marquee** screen refreshes, because a client-facing number that fails its own control is the day's first fire.",
    "**11:00 —** midday is cash application, the deep-work block of the day. The split-settlement worklist lands: **five confirmations** that settled across two rails each — 4860.00, 5284.00, 4723.00, 5614.00, 4459.00 — and the analyst writes the fold that proves each pair reconciles to its booked amount before the cash positions publish. This is the quiet, careful hour: pairs either {emerald:tie} or they do not, and the fold — not hope — is what says which.",
    "**14:00 —** the aging read feeds the afternoon exposure meeting. The open book goes against its **30-day terms** line, the **84-day** slowest tail isolated, days-to-settle (**28.4** average across the settled book) trended by rail. Each query is written twice — once to answer, once with the grain and units stated in a comment — because the exposure ladder gets challenged by someone who reads denominators for sport.",
    "**17:00 —** the close takes over: month-end packs assemble and the EOD writeup begins. The trial-balance proof by account (**cash netting 44196.00, operating expenses 25416.00, receivables netting 16440.00** against the revenue credit of **86052.00**), the coverage census — **21 confirmations settled exact, 1 partial, 6 untouched** — and the counterparty concentration read for the risk committee. There are rituals: every number in the pack carries its query attached, definitions are printed beside the figures they name, and a mis-defined metric is treated as a {rose:control failure}, not a typo. The best-prepared candidate knows this rhythm: Goldman SQL exists to defend numbers that money will move on.",
  ],

  metrics: [
    { name: "Trial-balance delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00 here, delta 0. The daily proof every other number inherits its credibility from; a nonzero delta is a page, not a footnote." },
    { name: "Settlement coverage", what: "Settled value against booked value, classified exact / partial / none. The books read 21 exact (65612.00), 1 partial (4000.00 against 6148.00) and 6 with nothing (15217.00) — the census the cash-application desk is sized on." },
    { name: "Unsettled exposure", what: "Confirmations with no settlement row — count and dollar amount (6 / 15217.00 here). The receivables watchlist that ages against the 30-day terms line, and the anti-join every screen here writes from memory." },
    { name: "Break count", what: "Process breaks the books still balance through: void-but-paid (one confirmation, 925.00) and paid-no-settlement (one confirmation, 1756.00). Classified, quantified and routed — never deleted." },
    { name: "Split-settlement share", what: "Share of settled confirmations that cleared across two rails — 5 of the settled book here. The cash-application load metric that decides how much manual reconciliation headcount the close needs." },
    { name: "Days-to-settle", what: "Booked-to-settled latency on the settled book — 28.4 days average, 13 fastest, 84 slowest against flat 30-day terms. The slow tail, not the average, is what the desk manages." },
    { name: "Counterparty concentration", what: "Share of book value held by the largest counterparties — the top tier here carries 63.5%. The risk instinct that turns a GROUP BY into a limit discussion." },
    { name: "Risk-count freshness", what: "How current the exposure counts on the marquee screen are — the fold that feeds them must reconcile before it publishes. Freshness here is a control property, not a dashboard preference." },
  ],

  topics: [
    {
      name: "Folds at the confirmation grain",
      why: "Every morning read here starts by folding settlement rows onto the confirmations they clear — counts and values per status, per rail, per day. The trap is baked into the books: 27 settlements against 28 confirmations means the fold's input is not the population the stakeholder assumes, and the interviewer listens for whether you count rows or confirmations before you sum.",
      slugs: ["products-worth-over-invoices", "monthly-transactions-i", "number-of-rich-customers"],
    },
    {
      name: "Cash-application joins",
      why: "A settlement only counts when it reconciles to a booked confirmation, so the join is a control, not a convenience. Goldman screens drill the two-table fold until the survival rule is reflex: INNER for settled value, LEFT when the unmatched rows ARE the story.",
      slugs: ["bank-account-summary-ii", "combine-two-tables", "employee-bonus"],
    },
    {
      name: "The receivables anti-join",
      why: "The unsettled watchlist — 6 confirmations, 15217.00 — is a LEFT JOIN plus an IS NULL on the join key, and it is the single most-quoted query shape in this building. Screens escalate it: NOT EXISTS twins, WHERE-placement traps that silently convert the anti-join back to an inner fold.",
      slugs: ["customers-who-never-order", "number-of-accounts-that-did-not-stream", "sellers-with-no-sales"],
    },
    {
      name: "CASE-classified coverage",
      why: "Coverage is a definition, not a vibe: exact when the folded settlement value equals the booked amount, partial when it does not, none when no rail ever hit. That classification is a CASE arm ladder folded per confirmation, and the interviewer checks whether your arms are exhaustive and your boundary operators deliberate.",
      slugs: ["count-salary-categories", "loan-types", "monthly-transactions-ii"],
    },
    {
      name: "Risk ladders and rank windows",
      why: "Exposure ladders, top-counterparty lists and VaR-style percentile cuts are leaderboard questions wearing a suit. The rank trio decides who shares a rung and what the next rung is called — and ties in money amounts are common enough that LIMIT-with-OFFSET instincts break publicly.",
      slugs: ["rank-scores", "value-at-risk", "second-highest-salary"],
    },
    {
      name: "NULL policy on unsettled books",
      why: "An unsettled confirmation is a NULL settlement row; an unposted credit is a NULL fold. Goldman screens check whether you treat NULL as data to report, coalesce to zero for display with a stated reason, or exclude with the exclusion named — deliberately, never by accident.",
      slugs: ["calculate-special-bonus", "books-with-null-ratings", "find-customer-referee"],
    },
    {
      name: "Honest denominators on risk shares",
      why: "Wire share of settled value, concentration of book, coverage percentages — every ratio here sits one integer division away from printing zero. The house habit: 100.0 before the division, the denominator's population decided before the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "countries-you-can-safely-invest-in", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Balance walks and running positions",
      why: "The cash position is a running sum over posted entries, and the desk reads it as a walk — current balance beside prior balance, deltas visible. Window frames decide whether ties double-count, and the interviewer wants the frame stated out loud before the query runs.",
      slugs: ["account-balance", "running-total-for-different-genders", "gl-reconciliation"],
    },
    {
      name: "Settlement-calendar date math",
      why: "Aging, T+1 settlement windows and month-close cutoffs make date arithmetic a daily tool. The recurring traps are all here: BETWEEN dropping the last night of a window, STRFTIME buckets that merge years, and an aging read whose population quietly excludes the very rows it is naming.",
      slugs: ["settlement-fails-aging", "rising-temperature", "friday-purchases-i"],
    },
    {
      name: "Integer cents and the balanced proof",
      why: "Money in the finance tables is INTEGER cents — the dollar read is cents / 100.0 and every precision bug in the building is a variant of forgetting that. The trial-balance fold (181080.00 = 181080.00, delta 0) is the cheapest audit in SQL and the habit the screens reward most.",
      slugs: ["trial-balance-check", "odd-and-even-transactions", "bank-account-summary"],
    },
  ],

  theory: [
    {
      id: "goldman-t1",
      q: "A confirmation can settle across two rails, and some confirmations never settle at all. For the end-of-day settlement report, which join do you pick — and what happens to each population either way?",
      a: "Decide from the survival rule the report implies. The settled-value report is an INNER fold from settlements to confirmations: it runs at settlement grain, 27 rows here, with the five split confirmations appearing twice — so the fold that follows must aggregate per confirmation before the number means 'settled value'. The coverage report is LEFT from confirmations: the 6 confirmations with no settlement row are the receivables story — 15217.00 of exposure — and they survive only if no right-table predicate leaks into WHERE, because WHERE p.amount_cents > 0 quietly converts the LEFT JOIN into an INNER and the watchlist vanishes. The proof this discipline matters is in the anomalies: a void confirmation settled 925.00 anyway, and a paid one has no settlement at all — status and settlement presence are different facts, and only the join decision decides which fact your report can even see. Say the survival rule out loud before the join type; the join is the consequence, not the choice.",
      tag: "joins",
    },
    {
      id: "goldman-t2",
      q: "The books hold 28 confirmations and 27 settlements, five of them split across two rails. Narrate every COUNT in the fold that reports both populations.",
      a: "Every COUNT gets its grain said out loud. COUNT(*) over the bare confirmations table is 28 — booked confirmations, the denominator the exposure report quotes. COUNT(*) over the INNER join is 27 — one row per settlement, where the five split confirmations each contribute two rows; it counts rails, not books. COUNT(DISTINCT i.id) over the LEFT join is 22 — the confirmations with at least one settlement, 5 splits folded back to single books. The remaining 6 are the no-settlement watchlist, and 22 + 6 = 28 is the reconciliation identity that proves the fold's populations are exhaustive. The Goldman-flavored trap is a fourth count pretending to be one of these: after a careless join, COUNT(p.id) reads 27 and looks like a confirmation count while actually counting settlement rows. The strong candidate answers 'one row per WHAT?' for every aggregate before computing any of them — in this building that question is the interview.",
      tag: "aggregation",
    },
    {
      id: "goldman-t3",
      q: "Build the running cash position through the session — every entry beside the balance it leaves behind. What does the window actually compute, and what do you state about the frame?",
      a: "The fold is SUM(debit_cents - credit_cents) as a running total, and the frame is the entire answer. SUM(…) OVER (ORDER BY entry_seq) defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — which includes every PEER sharing the current ordering value. On a unique key that is harmless; order two entries on the same timestamp and the running balance jumps by both at once, and the walk lies by one entry for the rest of the session. The defensible shape is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW over a deterministic order — entry sequence, or entry_date with id as the tie-break — so each row carries exactly the postings before it. The prior-balance column is LAG(running) beside it, not a second scan. At Goldman the habit being graded is saying the frame out loud: 'running total' without a frame means 'running total including peers', and on a book where every cent reconciles, a walk that double-counts one timestamp is a control failure, not a cosmetic artifact.",
      tag: "windows",
    },
    {
      id: "goldman-t4",
      q: "The unsettled book is a NULL problem wearing a finance costume. What is your NULL policy for the receivables report?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — the comparison is UNKNOWN — so WHERE settled_amount < booked_amount silently drops the rows with no settlement, which are precisely the rows the receivables report exists to name. Joins: NULL keys never match, which is why the anti-join that builds the watchlist tests the join key IS NULL — 6 confirmations, 15217.00. Aggregates: SUM and COUNT(col) skip NULLs while COUNT(*) keeps the row, so the gap between the two counts IS the unsettled population. The policy: define the population first, then choose where NULL lives. The watchlist keeps unmatched rows visible with NULL settlement columns — the honest print; the display layer may COALESCE to 0.00 for a summary table, at the edge, with the note that zero-means-no-rail-hit here. What is never acceptable is a mid-pipeline COALESCE that launders 'no settlement' into 'settled zero' — the paid-no-settlement break (a confirmation marked paid, 1756.00 booked, no rail hit) is exactly the bug that habit produces, and it shipped to a close before.",
      tag: "nulls",
    },
    {
      id: "goldman-t5",
      q: "Where does the 'only settled rows' filter live, and where does the 'only rails with five-plus settlements' filter live? Same instinct, different clauses — explain.",
      a: "The first is a row-level fact: settled-ness is a property of one settlement row, so it lives in WHERE and discards rows before the fold touches them. The second is a group-level fact: 'five or more' is a property of a folded group, so it lives in HAVING, which runs after GROUP BY and can see COUNT. The clauses cannot swap: WHERE COUNT(*) >= 5 fails to compile — aggregates do not exist pre-fold — and a row predicate in HAVING wastes the fold by filtering populations that were already discarded. The pipeline order is the whole answer: FROM builds the rows, WHERE filters them, GROUP BY folds them, HAVING judges the groups, SELECT projects, ORDER BY displays. The Goldman twist is control placement: filter cheap and early (the date window, the rail) in WHERE to shrink the fold, and judge thresholds and coverage classes in HAVING where they are definitional. A screen that asks this is really asking whether you know WHEN each fact becomes true in the engine — because that is when it can be acted on.",
      tag: "pipeline",
    },
    {
      id: "goldman-t6",
      q: "Flag confirmations whose booked value beats their client's average booking. Scalar or correlated subquery — and what happens when the inner fold comes back empty?",
      a: "The two shapes answer different questions, and the cost profiles differ with them. The scalar shape — booked > (SELECT AVG(amount) FROM confirmations) — computes the firm-wide average once and compares every row to it; it is 'above the book average'. The correlated shape — booked > (SELECT AVG(amount) FROM confirmations c2 WHERE c2.client_id = c.client_id) — re-runs per outer row and answers 'above this client's own average', which is the concentration question the desk actually wants. The trap both share: a scalar subquery is contractually 0-or-1 rows, and 0 rows yields NULL, not an error — every comparison against NULL is UNKNOWN, so the flag report silently returns nothing on a filtered staging table where the client fold is empty. The defensible answer names the inner population per row, states the empty case, and picks the shape from the question's population, not from habit. On the books here that discipline is the difference between 'above average for the book' — a 338-ish line — and 'above their own line', which is where the outlier clients actually live.",
      tag: "subqueries",
    },
    {
      id: "goldman-t7",
      q: "Settlements arrive on TEXT timestamps. Bucket them by month, measure days-to-settle, and keep the calendar whole while you do it.",
      a: "Three tools, three caveats. Buckets: STRFTIME('%Y-%m', paid_on) — or SUBSTR(paid_on, 1, 7) on fixed-width ISO text — gives '2025-02', the year-first key that sorts as a calendar; '%m' alone merges Februaries across years and silently re-folds the close. Diffs: JULIANDAY(paid_on) - JULIANDAY(issued_on) returns fractional days — this book's settled latency is a 28.4-day average with a 13-day floor and an 84-day tail against flat 30-day terms, and the round happens once, at the END, not per row. Windows: half-open intervals — issued_on >= '2025-02-01' AND < '2025-03-01' — never BETWEEN on the last day, which drops the final evening's settlements and with them the month-end burst. The deeper caveat is population: only settled confirmations HAVE a days-to-settle, so the NULL filter is definitional work and gets said out loud — 'this measures the settled book; the 6 unsettled are out of scope by construction.' State the convention, then query it — never the reverse.",
      tag: "dates",
    },
    {
      id: "goldman-t8",
      q: "A void confirmation settled 925.00 anyway, and a paid one has no settlement at all. Walk me through your break-handling policy — and tell me what the trial balance says about both.",
      a: "Breaks are data, not noise, and the policy has four moves. Detect: classify every confirmation by the pair (status, settlement presence) — void-but-paid and paid-no-settlement are the two labeled failure modes, and both are CASE arms over a LEFT join. Quantify: one confirmation at 925.00 settled against a void booking; one at 1756.00 booked with no rail hit — numbers route work, adjectives do not. Reconcile: the ledger still proves — 181080.00 debits against 181080.00 credits, delta 0 — because double-entry records what HAPPENED, and the break is a process failure the books absorbed, which is exactly why the trial balance alone is never sufficient evidence of correctness. Route: flag and hand to the desk that owns the fix; never delete, never silently re-status. The coverage census then reconciles end to end — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — and the exact fold's arithmetic closes: settled-paid value plus the void's wrongful 925.00 equals the booked 65612.00. A candidate who can narrate that loop — detect, quantify, reconcile, route — is describing the job, not answering a question.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "goldman-mcq-1",
      prompt: "A confirmation row stores amount_cents = 92500. Which SELECT prints the booked value the way the Marquee screen shows it — 925.00?",
      choices: [
        "SELECT amount_cents / 100 AS amount",
        "SELECT amount_cents / 100.0 AS amount",
        "SELECT ROUND(amount_cents) AS amount",
        "SELECT amount_cents * 100.0 AS amount",
      ],
      answer: 1,
      why: "Finance money here is INTEGER cents; the dollar read is amount_cents / 100.0. The .0 promotes the division to real arithmetic — 92500 / 100.0 prints 925.0 — while integer 100 truncates odd-cent rows toward zero and leaks half-dollars.",
      notes: [
        { choice: 0, why: "92500 happens to divide evenly, which is exactly why this bug survives review — the next row at 486150 cents prints 4861 instead of 4861.50. The unit test that catches it uses an odd-cents row." },
        { choice: 2, why: "ROUND(amount_cents) rounds cents to cents: 92500. No unit conversion happened at all." },
        { choice: 3, why: "That multiplies to 9,250,000 — cents read as tenths of cents. The direction of the conversion is the whole discipline." },
      ],
      difficulty: "easy",
    },
    {
      id: "goldman-mcq-2",
      prompt: "28 booked confirmations, 27 settlement rows, every settlement on a booked confirmation, 5 confirmations carrying 2 settlements each. How many rows does the INNER JOIN return?",
      choices: [
        "27 — one row per settlement",
        "28 — one row per confirmation",
        "33 — one row per matched or orphaned confirmation",
        "55 — both tables added",
      ],
      answer: 0,
      why: "The join runs at settlement grain: each of the 27 settlement rows matches exactly one confirmation, so 27 rows return and the 5 split confirmations appear twice. Confirmations without settlements vanish from an INNER fold entirely.",
      notes: [
        { choice: 1, why: "28 is the confirmation count — reachable from the bare table or as COUNT(DISTINCT i.id) over a LEFT JOIN. The join alone folds nothing back to confirmation grain." },
        { choice: 2, why: "33 is the LEFT JOIN row count: 27 matched rows plus 6 confirmations with no settlement (5 open, plus the paid one with no rail hit). INNER drops those 6." },
        { choice: 3, why: "55 adds the tables — no SQL fold adds row counts across a join. Row counts multiply by cardinality, they never sum." },
      ],
      difficulty: "medium",
    },
    {
      id: "goldman-mcq-3",
      prompt: "The ledger's global fold reads 181080.00 debits, 181080.00 credits, delta 0 across 80 entries. Tomorrow the same fold returns delta 925.00. What is the defensible first read?",
      choices: [
        "A rounding artifact from the /100.0 conversion",
        "A one-sided posting — something hit one side of the books without its pair",
        "Float drift accumulating over 80 rows",
        "The delta column should be NULL, not 0",
      ],
      answer: 1,
      why: "Double-entry is an identity, not an estimate: every posting writes both sides, so the global delta is 0 by construction — 181080.00 = 181080.00 here. A nonzero delta means a row or an edit broke the pair, and 925.00 matching the void confirmation's settlement value exactly is where you look first.",
      notes: [
        { choice: 0, why: "The ledger stores integer cents end to end; the /100.0 read happens once at the display edge and cannot drift. Integers do not round." },
        { choice: 2, why: "Same refutation: whole cents, integer arithmetic. Float drift is a REAL-column story and this is not one." },
        { choice: 3, why: "Delta 0 is the success state — the proof the books balanced. NULL would mean the fold itself failed to compute, a different and louder failure." },
      ],
      difficulty: "hard",
    },
    {
      id: "goldman-mcq-4",
      prompt: "The unsettled watchlist is confirmations LEFT JOIN settlements, keeping the misses. Which WHERE returns all 6 unpaid confirmations (15217.00) and nothing else?",
      choices: [
        "WHERE p.invoice_id IS NULL",
        "WHERE p.invoice_id = NULL",
        "WHERE COUNT(p.invoice_id) = 0",
        "WHERE p.id IS NOT NULL",
      ],
      answer: 0,
      why: "LEFT JOIN hands unmatched confirmations NULL settlement columns; the canonical miss test is the join key IS NULL — 6 rows, 15217.00. The predicate reads 'no settlement row exists', which is the definition of unsettled.",
      notes: [
        { choice: 1, why: "= NULL is never TRUE — the comparison is UNKNOWN and the watchlist ships empty. NULL is tested with IS, never with =." },
        { choice: 2, why: "COUNT is an aggregate; it cannot run in WHERE at all — wrong clause, wrong layer. Row-level WHERE runs before any fold exists." },
        { choice: 3, why: "IS NOT NULL returns the opposite book: the 22 confirmations that DID settle. An inverted anti-join looks identical in the editor and opposite in the review." },
      ],
      difficulty: "medium",
    },
    {
      id: "goldman-mcq-5",
      prompt: "Confirmation #1 books 4860.00 and settled across two rails of 2430.00 each. Why does the coverage CASE need SUM(p.amount_cents) = i.amount_cents rather than p.amount_cents = i.amount_cents?",
      choices: [
        "The row-level test compares one rail against the whole booking — neither rail equals 4860.00, so a clean split misfiles as partial",
        "p.amount_cents is NULL for split settlements",
        "The SUM overflows the INTEGER range on split books",
        "They are interchangeable; the engine picks one",
      ],
      answer: 0,
      why: "Coverage is a per-confirmation definition, but settlement rows arrive per rail: the fold must aggregate the rails (SUM) before comparing to the booked amount. The row-level comparison tests 2430.00 against 4860.00 and files a clean split as partial.",
      notes: [
        { choice: 1, why: "Matched rails carry real amounts — 243000 cents each here. NULLs appear on the no-settlement side of a LEFT JOIN, not on settled rails." },
        { choice: 2, why: "The whole ledger folds to 18108000 cents, nowhere near the 64-bit INTEGER ceiling. Overflow is not a live failure mode at these magnitudes." },
      ],
      difficulty: "medium",
    },
    {
      id: "goldman-mcq-6",
      prompt: "The exposure ladder ties two books at the top; the next book is third by value. DENSE_RANK hands that third book rank…",
      choices: ["3", "2", "1", "4"],
      answer: 1,
      why: "DENSE_RANK shares rungs on ties (1, 1) and hands the next distinct value rank 2 — no gaps. RANK would say 3; ROW_NUMBER would say 3 with an arbitrary tie order.",
      notes: [
        { choice: 0, why: "That is RANK: ties share 1 and the next jumps to 3 — implying a missing second book that does not exist. Ladder consumers read that gap as data loss." },
        { choice: 3, why: "Ranks reach 4 only with four distinct values. Two tied firsts plus one follower is three positions, densely numbered 1, 1, 2." },
      ],
      difficulty: "easy",
    },
    {
      id: "goldman-mcq-7",
      prompt: "The safe-to-trade screen runs `WHERE counterparty_id NOT IN (SELECT id FROM restricted)`. One restricted row carries id = NULL. What ships?",
      choices: [
        "The full book minus NULL counterparties",
        "An empty result — silently",
        "Only the NULL-counterparty rows",
        "A type error",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE: the comparison against NULL is UNKNOWN, and NOT UNKNOWN is still UNKNOWN. One NULL empties the entire screen while the query looks healthy — the most expensive NULL in sell-side SQL. NOT EXISTS or LEFT JOIN + IS NULL is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "NOT IN does not skip NULLs — it poisons the whole membership test. The result is not reduced, it is gone." },
        { choice: 2, why: "NULL counterparties fail every membership test too. Nothing survives, not even them." },
      ],
      difficulty: "hard",
    },
    {
      id: "goldman-mcq-8",
      prompt: "Wire settled 32248.00 of the 69612.00 total. Which expression prints the wire share as 46.3?",
      choices: [
        "100.0 * SUM(wire_cents) / SUM(all_cents)",
        "100 * SUM(wire_cents) / SUM(all_cents)",
        "SUM(wire_cents) / SUM(all_cents) * 100",
        "ROUND(SUM(wire_cents) / SUM(all_cents), 3)",
      ],
      answer: 0,
      why: "The 100.0 multiplier forces real arithmetic at the first operation: 100.0 × 32248.0 ÷ 69612.0 = 46.3. Every other option performs an integer division somewhere upstream and truncates before the result can be real.",
      notes: [
        { choice: 1, why: "Integer 100: 3224800 / 69612 = 46 in integer math — the share prints 46 and the desk argues over four-tenths of a point that never existed." },
        { choice: 2, why: "32248 / 69612 in integer math is 0 — the share prints 0.0. Truncation does not care that you multiply later." },
        { choice: 3, why: "The inner division is integer 0; ROUND(0, 3) is still 0. Rounding belongs at the END, after the arithmetic is real." },
      ],
      difficulty: "medium",
    },
    {
      id: "goldman-mcq-9",
      prompt: "The settlement calendar runs on TEXT timestamps including '2025-02-28 18:40:11'. Which WHERE returns every February settlement?",
      choices: [
        "WHERE paid_on BETWEEN '2025-02-01' AND '2025-02-28'",
        "WHERE paid_on >= '2025-02-01' AND paid_on < '2025-03-01'",
        "WHERE paid_on >= '2025-02-01' AND paid_on <= '2025-02-28'",
        "WHERE STRFTIME('%m', paid_on) = '2'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) admits every February timestamp — '2025-02-28 18:40:11' < '2025-03-01' is TRUE. The month does not end at midnight on the 28th; it ends at March 1.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive both ends: everything after midnight on Feb 28 — the day's late settlements — falls outside the '2025-02-28' bound and vanishes. Month-end bursts are exactly that evening." },
        { choice: 2, why: "Same wall, different syntax: <= '2025-02-28' still drops the evening of the 28th." },
        { choice: 3, why: "STRFTIME('%m') returns '02', not '2' — the comparison is never TRUE and the calendar ships empty. And a bare month key would merge Februaries across years." },
      ],
      difficulty: "hard",
    },
    {
      id: "goldman-mcq-10",
      prompt: "The balance walk shows each entry beside the balance BEFORE it. Which window hands each row its predecessor?",
      choices: [
        "LAG(...) OVER (ORDER BY entry_date)",
        "LEAD(...) OVER (ORDER BY entry_date)",
        "ROW_NUMBER() OVER (ORDER BY entry_date)",
        "NTILE(2) OVER (ORDER BY entry_date)",
      ],
      answer: 0,
      why: "LAG reaches one row BACK in the window's order — the prior balance walks beside the current one. LEAD points forward; ROW_NUMBER only numbers; NTILE buckets.",
      notes: [
        { choice: 1, why: "LEAD is the forward read — next entry, not previous. A swapped window walks the book backwards while the column label still says 'prior', and the delta column flips sign." },
        { choice: 2, why: "ROW_NUMBER assigns positions; it never carries a value from another row. You would still need a self-join on the computed number to fetch the prior balance." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-goldman-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The split-settlement worklist",
      brief:
        "Goldman-flavored memo on the storefront db: cash application flagged five confirmations that settled across TWO rails — value arriving in pieces is normal markets plumbing, but every piece must reconcile to the booked amount before the close publishes. Probed facts: 28 booked confirmations against 27 settlement rows; the five split confirmations are #1, #5, #12, #19 and #22, each carrying exactly 2 settlement rows — settled values 4860.00, 5284.00, 4723.00, 5614.00 and 4459.00. Contrast: the partial cover on #25 (4000.00 of 6148.00) rides ONE rail, so it is deliberately not on this worklist. The desk wants the list biggest settled value first.",
      ask: "Return the five split-settled confirmations: id, status, settlement count and settled value in dollars (2 decimals), biggest value first.",
      template:
        "SELECT i.id,\n       i.status,\n       {1}(p.id) AS settlements,\n       ROUND(SUM(p.amount_cents) / {2}, 2) AS settled\nFROM invoices i\nJOIN payments p ON p.invoice_id = i.{3}\nWHERE i.id IN (1, 5, 12, 19, 22)\nGROUP BY i.id\nORDER BY settled {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-confirmation settlement counter",
          why: "COUNT(p.id) counts settlement rows folded onto each confirmation — 2 for every split pair. SUM would add the payment ids themselves (3, 13, 27…) and print counts that reconcile to nothing.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Settlement money is stored as INTEGER cents, so the dollar read is amount_cents / 100.0. The .0 forces real division — integer 100 would truncate odd-cent rows and leak half-dollars into the worklist.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the confirmation-side join key",
          why: "The settlement's invoice_id must match the confirmation's id — that join IS the reconciliation control: all 27 settlement rows attach to booked confirmations, none dangle. The TEXT number column matches nothing and the worklist ships empty.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The desk works the largest cash first: 5614.00 on top, 4459.00 last. ASC would open the worklist with the smallest item — a correct query pointed at the wrong end of the queue.",
        },
      ],
      distractors: ["SUM", "10.0", "number", "ASC"],
      walkthrough:
        "Cash application is a reconciliation, and the fold is per confirmation, not per settlement row. The join attaches each of the 27 settlement rows to its booked confirmation; the WHERE narrows to the five splits the anomaly scan flagged (ids 1, 5, 12, 19, 22), and GROUP BY i.id folds each confirmation's rails together — COUNT(p.id) reads 2 on every row, and SUM(p.amount_cents)/100.0 prices the pair: 4860.00, 5284.00, 4723.00, 5614.00, 4459.00, each exactly the booked amount, which is what makes these clean splits rather than breaks. The divisor is where cents discipline lives: the tables store integer cents, so /100.0 — with the .0 — is the only honest read. The join key is the control: invoice_id = id means no settlement dangles; joining on the TEXT number column matches nothing and the worklist returns empty, silently. ORDER BY settled DESC queues the desk biggest-first. Note what is NOT here: #25's 4000.00-of-6148.00 partial — one rail, a shortfall story, a different list with a different owner.",
    },
    {
      id: "cs-goldman-2",
      tier: "hard",
      topic: "s7",
      universe: "month-close",
      title: "The trial-balance proof, account by account",
      brief:
        "Goldman-flavored memo on the storefront db: month-close does not end until the books prove, and the proof is double-entry — total debits must equal total credits, then every account must fold to a defensible net. Probed facts: 80 ledger entries; the global fold reads 181080.00 debits against 181080.00 credits, delta 0. The four accounts behind it: cash 27 entries (69612.00 debits / 25416.00 credits / net 44196.00), operating_expenses 14 (25416.00 / 0.00 / net 25416.00), accounts_receivable 26 (86052.00 / 69612.00 / net 16440.00), sales_revenue 13 (0.00 / 86052.00 / net -86052.00). The controller wants the per-account pivot, biggest net first, with the debits fold computed from the debit side only.",
      ask: "Return each ledger account with entry count, debit-side and credit-side folds and net in dollars (2 decimals), biggest net first.",
      template:
        "SELECT account,\n       COUNT(*) AS entries,\n       ROUND(SUM(CASE WHEN {1} THEN debit_cents ELSE 0 END) / {2}, 2) AS debits,\n       ROUND(SUM(CASE WHEN credit_cents > 0 THEN credit_cents ELSE 0 END) / 100.0, 2) AS credits,\n       ROUND((SUM(debit_cents) - SUM(credit_cents)) / 100.0, 2) AS net\nFROM ledger_entries\nGROUP BY account\nORDER BY {3} {4};",
      slots: [
        {
          answer: "debit_cents > 0",
          kind: "keyword",
          label: "the debit-side arm",
          why: "CASE WHEN debit_cents > 0 keeps the debits fold on the debit side — credit-heavy rows fall to the ELSE 0 arm. The mirrored predicate credit_cents > 0 would quietly re-point the debits column at credit value and the pivot would still look balanced.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "Ledger money is INTEGER cents; every fold here reads dollars through / 100.0. Integer 100 truncates odd-cent accounts toward zero and the close ships half-dollars light.",
        },
        {
          answer: "net",
          kind: "keyword",
          label: "the controller's sort axis",
          why: "ORDER BY net DESC opens the close with the account treasury defends: cash 44196.00. Sorting by entries instead interleaves activity with exposure — 27, 26, 14, 13 is a workload read, not a balance read.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-net-first direction",
          why: "Biggest net first: cash 44196.00, operating_expenses 25416.00, receivables 16440.00, revenue -86052.00. ASC would open the pack with the revenue account's credit balance — a correct pivot reading bottom-up.",
        },
      ],
      distractors: ["credit_cents > 0", "entries", "MAX", "ASC"],
      walkthrough:
        "The proof has two layers and both must hold. The global layer: SUM(debit_cents) and SUM(credit_cents) across all 80 entries read 181080.00 on both sides — delta 0 — the identity that makes everything downstream believable. The account layer is this pivot: GROUP BY account folds the four books; the CASE arm keeps the debits column pure (debit_cents > 0, credit-heavy rows contributing their zero arm) while the credits column mirrors it. Read the nets — cash 44196.00, operating_expenses 25416.00, accounts_receivable 16440.00, sales_revenue -86052.00 — and then cross-foot them: 69612.00 + 25416.00 + 86052.00 + 0.00 = 181080.00 on the debit side, 25416.00 + 0.00 + 69612.00 + 86052.00 on the credit side. The pivot reconciles to the global proof, which is the whole audit. Swap the CASE predicate to the credit side and the debits column silently starts reporting credit value — the pivot still 'balances' and is now wrong in a way that survives review. ORDER BY net DESC is the controller's read order; the cents rule holds in every fold: integer cents in, dollars out, /100.0 with the .0, ROUND at the very end.",
    },
  ],

  problems: [
    { slug: "countries-you-can-safely-invest-in", why: "Tagged Goldman problem: the ratio screen with a deduped denominator — risk-share logic where the eligible population is defined before the percentage, exactly the desk's denominator discipline." },
    { slug: "value-at-risk", why: "Tagged Goldman problem: the VaR 95 fold — a percentile read over a loss distribution, the risk-count shape the marquee screen is built from." },
    { slug: "trial-balance-check", why: "The daily proof in one query: conditional SUMs of debits and credits that must reconcile to zero — the reflex this kit's ledger folds reward." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the double-entry read: money in, money out, net per book, cents handled honestly." },
    { slug: "gl-reconciliation", why: "Ledger-versus-subledger reconciliation — the confirmations-versus-settlements proof, which is the cash-application desk's whole morning." },
    { slug: "settlement-fails-aging", why: "Aging buckets over unsettled items — the receivables watchlist read against its 30-day terms line, oldest tail first." },
    { slug: "ar-aging-schedule", why: "The AR aging schedule itself: amount by age bucket — the same CASE-classified coverage the close ships, in graded form." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing balance — the walk identity that makes a running cash position auditable." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — the coverage census shape (exact / partial / none) where branch totals must reconcile to the whole." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every exposure ladder, said out loud with the 1, 1, 2 pattern." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill behind every risk share here." },
    { slug: "monthly-transactions-ii", why: "Two-population month packets via UNION — settled versus unsettled by month, the close pack's stitched-report shape." },
    { slug: "customers-who-never-order", why: "The anti-join watchlist in textbook form — confirmations with no settlement are this query with the table names swapped." },
    { slug: "wash-trade-detection", why: "Pair-matching over trade rows — the surveillance read: same book, offsetting sides, timestamps close enough to matter." },
    { slug: "duplicate-charge-pairs", why: "Self-join pair detection over payment rows — the duplicate-rail screen that keeps one settlement from posting twice." },
    { slug: "account-balance", why: "Running totals per account — the balance walk: every entry beside the position it leaves behind, frame discipline included." },
  ],
};
