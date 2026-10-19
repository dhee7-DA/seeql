// Deutsche Bank — kit 13 of the Banking & Capital Markets domain.
// Wave-8 (Task 96), banking domain, 0 tagged LC — theme-curated; facts from
// scripts/company-facts.md (case cells re-probed against db/custom.db,
// read-only, before authoring).
// Frankfurt's universal bank, read the way its control functions read it:
// the corporate bank moves trade — letters of credit, documentary collections,
// guarantees, supply-chain finance — and every one of those flows ends as a
// receivable that must settle on a rail and post to a double-entry book. The
// storefront db maps on honestly: orders are booked trade events (REAL dollars
// — the one table where money is already dollars), customers are counterparties
// assigned to four corridors (EU / US / APAC / LATAM), invoices are
// trade-finance receivables, payments are settlement legs (method card = the
// local clearing rail, wire = the cross-border SWIFT rail), expenses are opex
// lines, ledger_entries is the book of record. Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0. Pool provenance: Deutsche Bank has 0 tagged sql
// rows in the band (checked company-pools.md for deutsche / Deutsche variants)
// — every topic and problem slug is theme-curated from the theme menu to the
// question families its screens are known for (corridor folds, settlement
// states, break hunts, regulatory month buckets, T+2 lag), provenance stated
// per topic and per problem.

import type { CompanyKit } from "../types";

export const deutscheKit: CompanyKit = {
  id: "deutsche",
  domainId: "banking",
  name: "Deutsche Bank",
  tagline: "Frankfurt's universal bank, trade to balance sheet",
  accent: "text-blue-300",

  brief: [
    "**Deutsche Bank** is Frankfurt's universal bank — the corporate bank financing world trade through {sky:letters of credit}, documentary collections and guarantees, the investment bank running one of the market's biggest FX books, and a control culture that treats every figure as a claim until a ledger proves it. An analyst here reconciles trade flows to cash to books for a living. On this training db the mapping is honest: `orders` are booked trade events (REAL dollars — the one table where money is already dollars), customers are counterparties assigned to four corridors, and every financing fee a trade generates lands as a receivable. Probed scale: **103 booked trade events worth 34833.28**, average ticket **338.19** against a floor of 25.47 and a ceiling of 1088.44, with the corridor books reading EU 45 events / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44.",
    "The money tables are where Deutsche screens live, and they are integer cents — the dollar read is always `amount_cents / 100.0`. Invoices carry the trade-finance receivables: 21 paid for 66443.00, 6 open at 19609.00, 1 void at 925.00. Payments are the settlement legs that clear them on two rails — {emerald:local clearing}, the domestic rail (16 legs for 37364.00), and {sky:wire}, the cross-border SWIFT rail (11 legs for 32248.00) — with five receivables settled on split plans, two legs each. The ledger is the book of record: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. *A number that can't be split by corridor and tied back to the books doesn't leave the desk — that sentence is the bank's control culture in one line.*",
    "The SQL screens are reconciliation and regulatory screens. A warm-up corridor fold, then the two questions the break desk is famous for: the {emerald:coverage census} — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — where settlement is a rail hit, never the status column, and the {rose:break pair} — a void receivable that still drew its **925.00** leg, and a paid-status receivable at **1756.00** with no leg at all. Then the settlement clock, because this is a T+2 house: 82 of the 103 trades have settled, lag averages **2.98 days**, and the band runs 2..4 — a month that drifts outside the band is a regulatory conversation, not a footnote.",
    "Prep the way the screens run. Drill conditional folds and status-aware counts — 52 settled, 30 in flight, 14 pending, 7 fallen is a mix you must be able to cut by corridor in one pass — then month keys (`SUBSTR(created_at,1,7)`, never the '%M' minutes trap), per-corridor whale boards in windows, and the no-leg anti-join until the **15217.00**-versus-**19609.00** membership gap is reflex. Finish on the sentence that gets hired at a bank whose whole reputation is controls: *same trade, different corridor — the definition travels, the corridor split stays honest, and every count names its evidence.*",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks Frankfurt's control functions rehearse most: the {sky:corridor settlement-state census} the strategy deck's first page is built on, the {emerald:T+2 settlement lag control} the month pack ships with, the {rose:no-leg receivable watch} whose six rows carry 15217.00 of untouched exposure, the one-pass FILTER census surveillance reads per corridor, the per-corridor whale board the concentration review runs, and the month-over-month opex walk the cost pack opens with. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below; thirty MCQs and twenty-four theory answers round the kit, and the walkthroughs narrate the failure each wrong chip causes — the exact muscle a bank whose whole reputation is controls demands.",
  ],

  dayInLife: [
    "**07:30 —** Frankfurt opens on the books proof. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: local clearing **16 legs / 37364.00**, wire 11 / 32248.00, cross-footed to the cash book's 69612.00 debit fold. The break queue pairs state with evidence: one void receivable that still drew **925.00**, one paid-status receivable with no leg at 1756.00 — routed to the trade-finance desk, never deleted. *The books tie before the corridor calls start, or the day starts twice.*",
    "**13:00 —** deep work: the regulatory month pack. The corridor-by-state census rebuilds — EU 24 settled / 12 in flight / 6 pending / 3 fallen, APAC 21/8/5/3, US 10/5/3/1 — each count carrying its corridor and its state in the same row, because a regulator's first question is always *of what population?* Then the T+2 control: month-keyed lag over settled trades, every month read against the book-wide **2.98** and the 2..4 band. The instinct being drilled: bucket on the 'YYYY-MM' key, `ROUND` once at the edge, and let a drifting month speak for itself — *the pack annotates, it never airbrushes.*",
    "**17:30 —** the stakeholder cycle. The trade-finance desk wants the open book: 19609.00 across 6 receivables, the no-leg watch at **15217.00** split by corridor so relationship managers know who to call, and the one partial — 4000.00 received against a 6148.00 balance — flagged for its second leg. The EOD writeup ships the ledger proof, the break pair and the lag control on one page, every figure with its definition in the caption. *A control that can't be re-run from the caption is a screenshot; the bank pays for controls, not screenshots.*",
  ],

  metrics: [
    { name: "Corridor trade book", what: "Booked trade events and value per corridor — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every regulatory and strategy read starts from." },
    { name: "Settlement-state mix", what: "Trades by state — 52 settled / 50.5%, 30 in flight / 29.1%, 14 pending / 13.6%, 7 fallen / 6.8%. Corridor cuts of this mix are the pack's first page; the group total is believed only after the split reproduces it." },
    { name: "T+2 settlement lag", what: "Days from booked to settled on the 82 events carrying a value date — 2.98-day average inside a 2..4 band (EU 2.94, APAC 2.93, US 3.07). A month drifting off the band is a controls conversation, not a footnote." },
    { name: "Receivable-state mix", what: "Trade-finance receivables by state — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00. The receivables book a collections desk manages corridor by corridor." },
    { name: "Coverage census", what: "Receivables by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). Membership is evidence (folded rail hits vs billed), never the status column." },
    { name: "Rail mix", what: "Settlement legs per rail — local clearing 16 / 37364.00, cross-border wire 11 / 32248.00. The pair cross-foots to the cash book's 69612.00 debit fold; five split plans explain why legs outnumber covered receivables." },
    { name: "Ledger proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 over 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Break watch", what: "The two breaks every controls review opens with: void-but-drawn (925.00) and paid-with-no-leg (1756.00). State paired with evidence, quantified, routed to the owning desk — never deleted, never averaged away." },
  ],

  topics: [
    {
      name: "Corridor folds & the book split",
      why: "Every number at this bank is read twice: as the group total and as the corridor split that must reproduce it. Trade events, receivables and counterparties GROUP BY corridor, with group-versus-corridor benchmarks and per-corridor ratio reads doing the tie-back check — the drill behind every regulatory page.",
      slugs: ["sales-analysis-i", "number-of-rich-customers", "find-expensive-cities", "generate-the-invoice", "portfolio-concentration-hhi"],
    },
    {
      name: "Settlement-state filters",
      why: "52 settled, 30 in flight, 14 pending, 7 fallen — and the fallen share differs by corridor (APAC 8.1%, EU 6.7%, US 5.3%). Status-aware filters, honest denominators and conditional counts are the difference between a census and a vibe on the trade book.",
      slugs: ["recyclable-and-low-fat-products", "not-boring-movies", "weather-type-in-each-country", "delinquency-roll-rates"],
    },
    {
      name: "Coverage & partial settlements",
      why: "A receivable can be open AND received — the 4000.00 leg against the 6148.00 balance is the case study the break desk cites. Coverage folds settlement legs per receivable and compares to billed; the classification is computed, never stored.",
      slugs: ["bank-account-summary", "number-of-times-a-driver-was-a-passenger", "calculate-orders-within-each-interval", "deferred-revenue", "expected-credit-loss"],
    },
    {
      name: "Break hunts & no-leg anti-joins",
      why: "The bank's daily control is pairing state with evidence: a receivable claiming paid with no rail hit, a void that still drew cash. LEFT JOIN ... IS NULL and EXISTS screens are how the 15217.00 no-leg book and the 1756.00 paid-unmoved receivable surface — and how they stay surfaced.",
      slugs: ["customers-who-never-order", "employees-with-missing-information", "books-with-null-ratings", "journal-gap-detection"],
    },
    {
      name: "The T+2 settlement clock",
      why: "A trade settles on a value date, and the lag is pure date arithmetic: julianday deltas over the 82 settled events, averaged 2.98 days inside a 2..4 band. Aging buckets, date-diff screens and weekend-aware counts are the settlement-ops drills — the trap is the silent NULL that drifts the denominator.",
      slugs: ["settlement-fails-aging", "ar-aging-schedule", "average-time-of-process-per-machine", "point-in-time-asof", "npv-queries"],
    },
    {
      name: "Corridor whale boards (windows)",
      why: "Exposure is read per corridor, never one global ladder: each corridor's biggest receivables ranked within its own book, rung by rung. RANK with PARTITION BY, per-corridor top-N and share-of-book windows are how the concentration review reads single-counterparty risk.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders", "scd2-build", "loan-amortization-schedule"],
    },
    {
      name: "Regulatory month buckets",
      why: "Every regulatory trend buckets on the 'YYYY-MM' key — SUBSTR of the event date, width 7 — over a book that runs 2024-01 to 2025-02 at a flat 6-to-9 events a month. The spine discipline matters: months ride the axis even when quiet, and a '%Y' (or '%M' by accident) key dissolves the calendar the regulator expects.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i", "snapshot-delta-detect", "vintage-default-curves", "dividend-income-calendar"],
    },
    {
      name: "One-pass censuses",
      why: "Regulators want state columns side by side, not stacked pages: settled, in-flight, pending and fallen counts from one scan. FILTER (WHERE …) and conditional SUM folds produce the census in a single pass — the shape the reporting pack is built on.",
      slugs: ["reported-posts", "daily-leads-and-partners", "find-books-with-polarized-opinions"],
    },
    {
      name: "Stacked censuses & set ops",
      why: "Two feeds describe one book — the receivables ledger that claims and the rail feed that proves. UNION ALL stacks censuses that are disjoint by construction (the clearing arm beside the wire arm), EXCEPT stands one census against another and hands back exactly the misfits; matching column shapes comes first, the cross-foot argues second.",
      slugs: ["count-salary-categories", "team-scores-in-football-tournament", "monthly-transactions-ii"],
    },
    {
      name: "LAG walks & movement reads",
      why: "Movement reporting is deltas, not levels: month-over-month opex walks, settlement-state transitions, balance rollforwards where each line explains the move from the last. LAG hands every row its predecessor, the edge rows go NULL by definition, and the walk must be staged before any WHERE trims the predecessor away.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "biggest-window-between-events", "year-on-year-growth-rate", "balance-rollforward", "late-arriving-restatement"],
    },
  ],

  theory: [
    {
      id: "deutsche-t1",
      q: "You join receivables to their settlement legs and the per-corridor receivable counts stop summing to the covered book. What happened?",
      a: "Fan-out: five receivables were settled on split plans — two legs each — so the join prints 27 rows on a 22-receivable covered book, and every COUNT(*) on that result counts rail hits, not receivables. The fix is grain discipline: fold the legs per receivable first (derived table or CTE), or protect the census with COUNT(DISTINCT i.id). At Deutsche this is the daily trap because the split plans are real client arrangements, not dirty data — the control rule is that the corridor split must reproduce the covered book, and a fold at leg grain breaks that identity by exactly the five splits.",
      tag: "joins",
    },
    {
      id: "deutsche-t2",
      q: "The concentration review wants each corridor's largest receivables ranked within its own book. Build it.",
      a: "Windows with PARTITION BY: RANK() OVER (PARTITION BY corridor ORDER BY amount_cents DESC) gives every corridor its own rung 1, and ORDER BY corridor, rung on the outside makes the board read corridor by corridor. Without the partition you get one global ladder where one corridor owns the top ten and the other books' relationship managers read boards with no top of them. I keep the tie policy explicit — RANK shares rungs on ties, ROW_NUMBER doesn't — and pin a deterministic tiebreaker inside the window so the rerun reproduces the board row for row.",
      tag: "windows",
    },
    {
      id: "deutsche-t3",
      q: "The pack keeps only corridors whose settled dollars cross a threshold. WHERE or HAVING — and why does it matter?",
      a: "The gate is on a fold — SUM of settled legs per corridor — and folds exist only after GROUP BY, so the gate is HAVING, written against the fold (or the alias it names). WHERE runs row-by-row before any grouping exists: it can filter which settlement legs enter the fold, but it cannot see the fold. Getting this wrong at a bank isn't a style issue — a WHERE that can't see the alias either errors out or, worse, silently filters a raw column and ships a corridor census that never reconciles to the books it claims to prove.",
      tag: "aggregation",
    },
    {
      id: "deutsche-t4",
      q: "The no-leg receivable watchlist LEFT JOINs receivables to settlement legs, then adds WHERE method = 'wire' to focus the read. What ships?",
      a: "An empty watchlist. A predicate on the right table in WHERE can only be satisfied by rows that matched — the NULL-extended no-leg rows fail it, the LEFT JOIN silently becomes an INNER join, and 15217.00 of receivables leave the read. Rail filters belong in the ON clause, or the inner semantics are accepted knowingly and named. The deeper discipline: COALESCE at the display edge with the reason stated, never mid-pipeline — at a bank whose brand is controls, a filter that launders an outer join into an inner join is the kind of bug that becomes a finding.",
      tag: "nulls",
    },
    {
      id: "deutsche-t5",
      q: "'Booked trades above the book-wide average ticket.' A candidate writes WHERE total > AVG(total) OVER (). Your read?",
      a: "It errors — and the error is the lesson. WHERE runs before SELECT computes anything, and a window needs the final row set, so a window call in WHERE fails outright. The honest shapes: WHERE total > (SELECT AVG(total) FROM orders) — the book-wide 338.19 — or stage the AVG() OVER () in a derived table or CTE and filter outside it. The pipeline order — FROM, WHERE, GROUP BY, HAVING, windows, ORDER BY — is not trivia here; the regulatory pack is full of benchmarks against group folds, and the analyst who knows where each clause lives is the one whose pack survives review.",
      tag: "pipeline",
    },
    {
      id: "deutsche-t6",
      q: "How do you isolate the void receivable that still drew a 925.00 settlement leg — and the paid one with no leg at all?",
      a: "Both breaks are PAIRINGS of claim and evidence, so both are EXISTS questions. Void-but-drawn: status = 'void' AND EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — the status column alone shows the claim, the EXISTS proves the leg. Paid-unmoved is the mirror: status = 'paid' AND NOT EXISTS (...). I reach for NOT EXISTS over NOT IN without thinking, because one NULL invoice_id in the subquery makes NOT IN return nothing at all — an empty break queue at a bank is not peace, it is a blind control, and nobody signed up for that.",
      tag: "subqueries",
    },
    {
      id: "deutsche-t7",
      q: "The settlement lag control. How do you compute booked-to-settled days and bucket it by month without lying?",
      a: "Two moves. The lag: JULIANDAY(shipped_at) - JULIANDAY(created_at) over settled trades only — 82 of 103, average 2.98, band 2..4 — and a trade without shipped_at must be excluded by an IS NOT NULL guard, not trusted to NULL arithmetic that would NULL the average silently. The bucket: SUBSTR(created_at,1,7) for the 'YYYY-MM' key — strftime('%Y-%m') is the same intent, but '%M' is minutes and '%Y' alone folds twelve months into one bar. Keys are definitions: the regulator reads the month axis as a claim, so the format string is reviewed like a figure, and ROUND runs once at the display edge.",
      tag: "dates",
    },
    {
      id: "deutsche-t8",
      q: "Two runs of the regulatory pack return the corridor board's rows in different order. Same data, same query. What do you do?",
      a: "Hunt the underspecified ORDER BY first: tied amounts with no tiebreaker let the engine deal ties in plan order, which can change between runs. The fix is a deterministic tiebreak — ORDER BY amount_cents DESC, invoice_id — plus declared window frames and named GROUP BY columns (never ordinals, which shatter when the SELECT list changes). Then the money discipline: integer cents end to end, `/ 100.0` once at the edge, ROUND once — float drift is not a thing when the book is integers. A pack whose rerun can't reproduce its own rows byte for byte isn't a control; it's a coin flip with formatting.",
      tag: "quality",
    },
    {
      id: "deutsche-t9",
      q: "The break pair as set operations: build the claimed-but-unevidenced read and its mirror with EXCEPT.",
      a: "Two EXCEPTs in mirror. Status-fold EXCEPT leg-fold hands back receivables that CLAIM settlement with no rail hit — the paid-status 1756.00 with no leg; leg-fold EXCEPT status-fold hands back legs that moved cash with no live claim — the void 925.00. Set grain keeps it honest: one row per receivable, deduped, no fan-out from the five split plans to trip the counts. EXCEPT is also NULL-safe where NOT IN would empty the queue on one NULL leg — an empty break queue at a bank reads as peace when it's blindness. The query's job is to keep the pair surfaced and quantified; routing the finding to the owning desk is a human act, and the pack annotates it, never averages it away.",
      tag: "setops",
    },
    {
      id: "deutsche-t10",
      q: "The regulatory pack wants state columns side by side per corridor from one scan. Walk me through the FILTER census — and its one discipline.",
      a: "COUNT(*) FILTER (WHERE o.status = 'delivered') per corridor, four state arms over one GROUP BY — one scan, four columns, every corridor complete: LATAM's zeros print as zeros, not missing rows, because a regulator reads an absent cell as 'no settlements, and why does the corridor exist at all?'. FILTER versus the CASE fold is syntax, not semantics — same population, same zeros. The one discipline neither tool provides: a WHERE trimming the book first shrinks every column at once, and the corridor split stops reproducing the group totals. The identity the reviewer checks is split-reaggregates-to-total; the syntax just has to not get in its way.",
      tag: "aggregation",
    },
    {
      id: "deutsche-t11",
      q: "The nostro replay steps the cash account leg by leg, and two legs share a timestamp. Which frame, and what does the default do to the walk?",
      a: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — every leg moves the balance once, and the replay ties to the ledger's line-by-line walk. RANGE, the default, treats same-timestamp legs as peers: both show one combined cumulative value, a two-leg jump printed as a single step, and the replay no longer matches the books a rerun of the cash fold would produce. Ties are routine when a rail batch-posts, so the frame keyword is load-bearing. The strong answer states the replay contract first — one row, one balance step — and lets the frame follow; the weak answer picks a keyword and can't say what it protects.",
      tag: "windows",
    },
    {
      id: "deutsche-t12",
      q: "The concentration deck: each corridor's largest receivables, ties sharing a rung with no gap beneath. Which window call — and what makes the board reproducible?",
      a: "DENSE_RANK() OVER (PARTITION BY region ORDER BY amount_cents DESC) — every corridor its own ladder, ties packed with no missing rung 2. RANK is honest about ties but gappy (1, 1, 3 — a tier nobody occupies); ROW_NUMBER deals ties by plan order, so the crowned counterparty can swap between reruns, which on a controls board is the worst possible property. Reproducibility comes from the details around the call: a deterministic tiebreak inside the window's ORDER BY, corridor-major ordering outside, and no ordinals anywhere. A concentration deck that reshuffles overnight isn't a control — it's a coin flip with formatting.",
      tag: "windows",
    },
    {
      id: "deutsche-t13",
      q: "FX restatement at this bank: every cross-border leg reprices at the rate in force at value date. Build the as-of join.",
      a: "JOIN rates r ON r.currency = leg.currency AND r.effective_on = (SELECT MAX(effective_on) FROM rates r2 WHERE r2.currency = leg.currency AND r2.effective_on <= leg.value_date) — the latest rate that went live at or before the value date. The classic failure is joining to today's rate: last month's corridor flow restates in a currency it never traded in, the FX book's P&L explanation and the query disagree, and nothing errors anywhere. State the boundary convention as policy — effective_on <= value_date keeps a rate that went live the same day — because the regulator reads the restatement rule, not just the figure. The as-of rule is the answer; the correlated MAX is just its transcription.",
      tag: "subqueries",
    },
    {
      id: "deutsche-t14",
      q: "The ECL provision: exposure folded per band, weighted by loss factor, summed across jurisdictions. Where does this arithmetic lie?",
      a: "Two places. Integer division: SUM(exposure_cents * loss_bp) divides by 10000.0 ONCE at the edge — per-row division by an integer 10000 truncates the cents that live in the bands, and the provision reads low by construction. Band scoping: the loss factor belongs to the BAND, so the weight must join from the band's own row — weighting exposures with a neighboring band's factor produces a number that still balances, just to nothing true. The regulator's rerun is band by band: exposure × factor per band, summed; the defensible query ships those band rows beside the total and says the fold's grain out loud before its syntax.",
      tag: "aggregation",
    },
    {
      id: "deutsche-t15",
      q: "The month-over-month opex walk: fold, walk, filter. Why is that order load-bearing, and what does filtering first do?",
      a: "Fold the months (SUBSTR month key, SUM), walk them (LAG(month_total) OVER (ORDER BY month_key)), then filter — because WHERE trims rows before SELECT's windows compute, and a filter inside the walk removes the baseline a delta needs. Filter January away first and February's LAG has no predecessor: the delta computes against nothing, or NULLs out, and the walk silently misstates the year's first move. Stage the walk over ALL months, filter outside, and every printed delta rests on the baseline it names. The edge rows read NULL by definition — the first month has no prior — and printing that NULL honestly beats inventing a zero baseline the books can't support.",
      tag: "pipeline",
    },
    {
      id: "deutsche-t16",
      q: "The clearing arm and the wire arm stack into one board with UNION ALL. What is the contract, and what fails without an error?",
      a: "The contract is positional: same number of columns, same order, compatible types — names come from the FIRST branch and the engine checks nothing else. The silent failure is swapped positions: a branch listing dollars, count under a header that says count, dollars ships with no error and a cross-foot that can't tie — the worst failure class, because the board looks finished. The hygiene: identical SELECT lists written side by side for visual diffing, a literal rail column so every row self-identifies, and the cross-foot — clearing 37364.00 + wire 32248.00 = the cash fold 69612.00 — run in the same breath as the read. UNION (dedupe) adds nothing here: the two arms are disjoint by construction, and dedup could only ever delete a row that was telling the truth.",
      tag: "setops",
    },
    {
      id: "deutsche-t17",
      q: "T+2 bucketing: why are the pack's windows half-open, and what does BETWEEN get wrong at the seam?",
      a: "BETWEEN on timestamps includes the upper bound, so a value date batch-posting at 00:00:00 counts in BOTH adjacent windows — volume neither day owns, invented at the seam, found by reconciliation and never by testing. Half-open predicates — booked >= window start AND booked < window end — tile the calendar with no overlap and no gap, which is what a pack read in two time zones needs. The lag itself is julianday(shipped_at) − julianday(created_at) under an IS NOT NULL guard: the 21 unsettled trades would NULL the average into silence if trusted. And the band read ships beside the count, because an average without its denominator is a vibe, and the pack doesn't take vibes.",
      tag: "dates",
    },
    {
      id: "deutsche-t18",
      q: "The RM read wants each counterparty's corridor spread folded into one evidence cell. How — and where does the cell's honesty end?",
      a: "GROUP_CONCAT(DISTINCT c.region) per counterparty, ORDER BY inside the fold so the cell reproduces run over run — 'APAC, EU' today and 'EU, APAC' tomorrow is a nondeterministic cell on a controls desk. Treat it as text, not math: the cell proves MEMBERSHIP — who banks where — while the SUM column beside it proves VALUE; a counterparty in five small corridors and one in a single whale read the same width. The honesty ends at arithmetic: the cell never aggregates, never orders money, never survives a currency question. Evidence cell and value column ship together; the text is the who, the number is the how much.",
      tag: "aggregation",
    },
    {
      id: "deutsche-t19",
      q: "The no-leg watchlist prints NULL dollars for its rows. Where does COALESCE belong — and where does it do damage?",
      a: "At the display edge, never mid-pipeline. The relationship manager's page should read 0.00, not NULL — COALESCE there is presentation. But the classification upstream must still SEE NULL, because 'no leg' is a fact about the join: COALESCE before the CASE turns no-leg rows into zero-paid rows, some arm reads zero as a settled value, and the 15217.00 exposure silently joins the funded book — the watchlist's whole point deleted by a display nicety. The rule: membership decisions see NULL; labels see the ELSE; the page sees COALESCE. A control that can't state which layer it lives in is a screenshot, not a control.",
      tag: "nulls",
    },
    {
      id: "deutsche-t20",
      q: "Surveillance wants the settled book dealt into lag quartiles. How does NTILE behave, and what must you say before the deck ships?",
      a: "NTILE(4) OVER (ORDER BY lag_days) deals rows into four near-equal COUNT buckets — quartiles by rank, not by value, so the top band holds as many trades as the bottom and 'worst quartile' is a rank claim, not a severity claim; severity needs the band's average lag printed beside it. Unsettled trades sit out of the deal entirely — they have no lag, and trusting them into the window NULLs the sort. Value-threshold bands need CASE instead; the definitional honesty is saying which banding you shipped. NTILE answers 'who's in which quarter of the book' — it never answers 'how bad is that quarter'.",
      tag: "windows",
    },
    {
      id: "deutsche-t21",
      q: "Two runs of the pack must reproduce its rows byte for byte. What goes into that reproducibility contract?",
      a: "Four clauses. ORDER BY with a declared tiebreak (amount_cents DESC, invoice_id) — tied amounts dealt in plan order are the classic reshuffle. Window frames named explicitly, because default frames treat peer rows as one. GROUP BY columns written out — ordinals shatter the moment the SELECT list changes. And integer cents end to end, so the money half of the contract is free: float drift isn't a thing when the book is integers. The deeper point: a pack whose rerun can't reproduce its own rows isn't a control, it's a coin flip with formatting — and the reviewer reads the ORDER BY before they read any figure.",
      tag: "quality",
    },
    {
      id: "deutsche-t22",
      q: "COUNT(DISTINCT invoice_id) on the fanned join versus a pre-folded derived table — when is each the honest census?",
      a: "DISTINCT protects a count inside a fanned-out join: five split plans turn 22 receivables into 27 legs, and COUNT(DISTINCT i.id) folds back to receivable grain without restructuring the query. But DISTINCT fixes counts and nothing else — a SUM over the same fanned join still double-counts the splits' money. So the rule: bare census, DISTINCT is the cheaper honest answer; any read that mixes counts and money, pre-fold — derive one row per receivable with its leg total, join one-to-one, and every aggregate downstream stays honest at once. The tell in an interview is whether you know which shape you shipped and what it protects; 'DISTINCT makes it right' is the answer that ships a double-counted corridor.",
      tag: "joins",
    },
    {
      id: "deutsche-t23",
      q: "The break pair as mirrored EXISTS probes. Write both — and say why EXISTS over NOT IN.",
      a: "Claim-without-evidence: status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — the 1756.00 receivable whose status column promises a settlement the rails never delivered. Evidence-without-claim: status = 'void' AND EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — the 925.00 the void receivable still drew. EXISTS over NOT IN because one NULL invoice_id in the subquery makes every NOT IN comparison UNKNOWN and the queue empties silently — at a bank, an empty break queue is not peace, it's a blind control. The pair ships together: state plus evidence, both directions, quantified and routed to the desk that owns the fix.",
      tag: "subqueries",
    },
    {
      id: "deutsche-t24",
      q: "'Same trade, different corridor — the corridor split must reproduce the group total.' Write the query that proves it.",
      a: "The corridor fold stacked under a grand row: GROUP BY region for the split, a second SELECT folding the same population whole and labeling itself 'TOTAL', glued with UNION ALL. If the split's rows sum to the grand row, the split is honest; if they don't, a WHERE trimmed one corridor's legs somewhere upstream and the pack is proving a population it no longer contains. That single identity — split reaggregates to total — is the bank's whole reporting culture in one check: every number read twice, as the total and as the split that must rebuild it. The strong answer also names what would break it silently: a corridor filtered out (reads as if it never existed) or a fold at leg grain (double-counts the five split plans).",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "deutsche-mcq-1",
      prompt: "The wire rail cleared 32248.00 across 11 legs, summed from integer-cent amounts. Which expression prints dollars correctly?",
      choices: [
        "SUM(amount_cents) / 100",
        "ROUND(SUM(amount_cents) / 100.0, 2)",
        "SUM(amount_cents) / 1000",
        "SUM(amount_cents / 100)",
      ],
      answer: 1,
      why: "Money is integer cents; the dollar read is amount_cents / 100.0 — float division — rounded once at the display edge. The integer divisor truncates odd-cent legs until the cross-foot misses the cash book by half-dollars.",
      notes: [
        { choice: 0, why: "100 is an INTEGER, so the division is integer division: an odd-cent leg loses its last two cents silently, and 32248.00 reconciles to nothing." },
        { choice: 2, why: "Wrong scale by ten: the rail prints 3224.80 and the corridor calls start with apologies." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-2",
      prompt: "Receivables joined to their settlement legs print 27 rows. The covered book is 22 receivables. COUNT(*) vs COUNT(DISTINCT invoice_id):",
      choices: [
        "27 legs and 22 receivables — five split plans carry two legs each",
        "27 and 27 — the join is lossless, so the counts must agree",
        "22 and 27 — DISTINCT inflates the count",
        "Both 22 — rows and groups are the same thing",
      ],
      answer: 0,
      why: "COUNT(*) counts leg rows (27); COUNT(DISTINCT invoice_id) folds back to receivable grain (22). The five-receivable gap IS the five split plans — real client arrangements, not dirty data — which is why the alias must name its grain: legs or receivables, never just 'count'.",
      notes: [
        { choice: 1, why: "A join multiplies on match: one receivable, two legs, two rows. Counts that 'must agree' are the first thing the break desk distrusts." },
        { choice: 2, why: "DISTINCT never inflates — it collapses. The direction of the disagreement (rows above groups) is the fingerprint of fan-out." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-3",
      prompt: "The regulatory trend page buckets trades by month. Which key is correct?",
      choices: [
        "SUBSTR(created_at, 1, 7)",
        "SUBSTR(created_at, 1, 4)",
        "strftime('%M', created_at)",
        "SUBSTR(created_at, 6, 2)",
      ],
      answer: 0,
      why: "'YYYY-MM' is the month key — SUBSTR(created_at,1,7), width 7. It buckets the 2024-01..2025-02 book into the 14 calendar months the regulator expects, quiet months riding the axis.",
      notes: [
        { choice: 1, why: "Width 4 is the '%Y' trap: twelve months fold into one annual bar and the monthly trend dissolves." },
        { choice: 2, why: "'%M' is MINUTES in strftime — every trade lands in a bucket named 00..59, and the trend page becomes a clock." },
        { choice: 3, why: "Width 2 at offset 6 is the month NUMBER alone — '01' from 2024 and 2025 collapse into one bucket a year apart." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-4",
      prompt: "The pack keeps only corridors whose folded settled dollars exceed 10000.00. Where does the gate go?",
      choices: [
        "WHERE settled_dollars > 10000",
        "HAVING SUM(p.amount_cents) / 100.0 > 10000",
        "LIMIT 3",
        "WHERE method = 'wire'",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the settlement fold itself. WHERE runs before any fold exists; LIMIT caps rows, it doesn't qualify them.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — settled_dollars isn't born yet at row-filter time. It errors or filters something else entirely." },
        { choice: 2, why: "LIMIT 3 keeps three rows, not the qualifying ones — a gate and a cap are different sentences, and this one drops corridors by accident of ordering." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-5",
      prompt: "The no-leg watchlist: receivables LEFT JOINed to settlement legs, WHERE p.method IS NULL... a colleague changes it to WHERE p.method = 'card'. What ships?",
      choices: [
        "The watchlist, card legs only",
        "An empty watchlist — the predicate on the right table converts the LEFT JOIN into an INNER join and the six no-leg receivables vanish",
        "The watchlist with NULL rails preserved",
        "An error — WHERE cannot reference the right table",
      ],
      answer: 1,
      why: "No-leg receivables have NULL right-table columns; 'card' can never equal NULL, so the NULL-extended rows fail the filter and the 15217.00 book leaves the read. The IS NULL arm IS the anti-join — remove it and you have silently written an inner join.",
      notes: [
        { choice: 0, why: "There are no card legs on a no-leg receivable — the rows the watchlist exists for fail the filter first. That's the mechanism, not bad luck." },
        { choice: 2, why: "NULL-extended rows never survive a WHERE that demands a right-table value — preservation requires the filter to live in the ON clause." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-6",
      prompt: "CASE WHEN status = 'paid' THEN 'settled' END labels the receivable census — the void row prints NULL. Why?",
      choices: [
        "The void row is excluded from the query",
        "No ELSE arm: CASE defaults to NULL when no WHEN matches — 'other' must be written, not assumed",
        "NULL propagates from the status column",
        "CASE cannot compare TEXT values",
      ],
      answer: 1,
      why: "A CASE without ELSE yields NULL for every row matching no WHEN — the void receivable falls through and prints NULL, which downstream decks read as 'missing data' rather than 'unclassified'. Exhaustive arms with a deliberate ELSE are the census discipline.",
      notes: [
        { choice: 0, why: "The row is in the result — carrying a NULL label. Exclusion and NULL-labeling are different defects with different fixes." },
        { choice: 2, why: "The status column holds 'void', a perfectly good TEXT value; the NULL is manufactured by the missing ELSE, not inherited." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-7",
      prompt: "Two receivables in one corridor share the top amount and the board needs both to read rung 1. Which window call?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY corridor ORDER BY amount_cents DESC)",
        "RANK() OVER (PARTITION BY corridor ORDER BY amount_cents DESC)",
        "GROUP BY corridor with MAX(amount_cents)",
        "ORDER BY amount_cents DESC, corridor",
      ],
      answer: 1,
      why: "RANK shares rungs on ties — both tied receivables print rung 1 and the next amount prints rung 3. ROW_NUMBER deals ties arbitrarily (plan-order luck), which is a nondeterministic board — the one thing a controls bank cannot ship.",
      notes: [
        { choice: 0, why: "ROW_NUMBER breaks the tie by execution plan — a rerun can swap who is rung 1. Ties need a declared policy, not luck." },
        { choice: 2, why: "GROUP BY collapses the corridor to one row — you get the maximum but lose which receivable holds it, and the board needs the counterparty, not just the number." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-8",
      prompt: "'Booked trades above the book-wide average ticket (338.19).' Which shape survives review?",
      choices: [
        "WHERE total > AVG(total) OVER ()",
        "WHERE total > (SELECT AVG(total) FROM orders), or stage AVG() OVER () in a CTE and filter outside it",
        "HAVING total > AVG(total)",
        "ORDER BY total DESC and read down to the average",
      ],
      answer: 1,
      why: "WHERE runs before windows exist, so the window call errors; the benchmark must be a scalar subquery (the book-wide 338.19) or a staged fold filtered outside its own stage. HAVING compares per-group folds, not rows against a global benchmark.",
      notes: [
        { choice: 0, why: "The pure pipeline-order trap: windows need the final row set, WHERE precedes SELECT — loud error, not silent wrongness." },
        { choice: 3, why: "Reading down to a line is an eyeball, not a query — the next refresh reorders the ties and the 'read' changes." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-9",
      prompt: "The break desk rewrites NOT EXISTS as WHERE i.id NOT IN (SELECT invoice_id FROM payments) — and one unallocated leg carries a NULL invoice_id. Result?",
      choices: [
        "Same queue, one extra row",
        "An empty result — x NOT IN (…, NULL) can never be proven true, so every receivable fails the test",
        "An error — NOT IN rejects NULLs at parse time",
        "Only the receivables whose ids appear in payments",
      ],
      answer: 1,
      why: "NOT IN is a three-valued-logic trap: any NULL in the list makes every comparison UNKNOWN, UNKNOWN is not TRUE, and the anti-join returns nothing. The empty break queue reads as 'no breaks' — at a bank that is the most dangerous output a query can produce. NOT EXISTS (or LEFT JOIN ... IS NULL) is the defensible shape.",
      notes: [
        { choice: 0, why: "No rows survive at all — not one extra. The all-or-nothing collapse is exactly why the trap is famous." },
        { choice: 2, why: "It parses and runs fine; the failure is logical, not syntactic — which is why it ships." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-10",
      prompt: "A month-over-month opex walk uses LAG(month_total) OVER (ORDER BY month_key), then WHERE month_key >= '2024-02'. What's wrong?",
      choices: [
        "Nothing — the filter just drops one month",
        "The WHERE trims January before the walk, so February's LAG has no predecessor — stage the walk first, filter after",
        "LAG requires a GROUP BY month_key",
        "The walk needs LEAD instead",
      ],
      answer: 1,
      why: "Pipeline order bites: WHERE evaluates before SELECT's windows, so January never reaches the LAG and February's delta is computed against nothing (or NULLs out). Stage the walk in a CTE or derived table with all months, then filter — the first printed delta must rest on the baseline it names.",
      notes: [
        { choice: 0, why: "February's delta is now measured off a baseline that was filtered away — the number prints, and it is wrong, which is worse than not printing." },
        { choice: 2, why: "LAG needs an ORDER BY inside OVER, not a GROUP BY — adding one collapses the months you're walking between." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-11",
      prompt: "The RM read wants each counterparty's corridors folded into one cell — 'APAC, EU'. Which aggregate builds it, and what must be pinned for the cell to reproduce?",
      choices: [
        "CONCAT per row — it folds naturally under GROUP BY",
        "GROUP_CONCAT over the counterparty's rows — with the fold running over an ordered subquery, since GROUP_CONCAT's order is otherwise unspecified",
        "SUM of the corridor strings, ordered by exposure",
        "MAX(corridor) — the dominant corridor per counterparty",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds many rows into one TEXT cell at counterparty grain — the evidence cell the relationship manager reads. Its concatenation order is engine-unspecified unless the fold runs over an ordered subquery, and 'APAC, EU' today versus 'EU, APAC' tomorrow is a nondeterministic cell on a controls desk.",
      notes: [
        { choice: 0, why: "CONCAT is a row-level function — under GROUP BY it errors or returns one row's value, never the fold. The folding aggregate is GROUP_CONCAT." },
        { choice: 2, why: "SUM coerces TEXT to 0 — a cell of zeros. Strings fold with string aggregates; the type system is the first reviewer." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-12",
      prompt: "The rail board stacks the clearing arm (16 legs / 37364.00) beside the wire arm (11 / 32248.00). Both branches are disjoint. Why UNION ALL and never UNION?",
      choices: [
        "UNION sorts faster on indexed tables",
        "UNION ALL concatenates without a dedupe pass — the arms are disjoint by construction, and a bare UNION would silently collapse any future identical row",
        "UNION requires identical table names",
        "UNION ALL converts cents to dollars automatically",
      ],
      answer: 1,
      why: "The two arms are disjoint by construction, so dedupe buys nothing — and the risk runs the other way: a bare UNION collapses byte-identical rows across branches, and a future duplicate vanishes without a trace while the board still foots. Stack with ALL unless you can say which duplicated rows you are paying to collapse.",
      notes: [
        { choice: 1, why: "The dedup is the bug: identical (rail, legs, value) rows across the arms are legitimate, and UNION deletes one silently. The cross-foot to 69612.00 would catch it an hour later with no hint which branch ate the row." },
        { choice: 3, why: "No conversion happens in set operations — the /100.0 lives inside each branch's SUM, written once, at the edge." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-13",
      prompt: "The pack buckets value dates into months: booked >= '2025-02-01' AND booked < '2025-03-01'. A colleague rewrites it as BETWEEN '2025-02-01' AND '2025-03-01'. What changes?",
      choices: [
        "Nothing — BETWEEN is the same range",
        "March 1st's 00:00:00 batch now counts in BOTH February and March — volume neither month owns, invented at the seam",
        "February 28th drops out",
        "The strings compare numerically and the query errors",
      ],
      answer: 1,
      why: "BETWEEN is inclusive on BOTH ends, so a leg batch-posting at '2025-03-01 00:00:00' satisfies the February range too — double-counted at the seam, found by reconciliation and never by testing. Half-open intervals tile the calendar with no overlap and no gap.",
      notes: [
        { choice: 0, why: "The upper bound is the whole difference: < excludes the seam instant, <= (and BETWEEN) includes it. The double-count lives exactly there." },
        { choice: 2, why: "February's last evening survives both shapes — the leak is at the TOP of the range, March 1st's first instant, not the bottom." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-14",
      prompt: "Leg-fold EXCEPT claims-fold — SELECT DISTINCT invoice_id FROM payments EXCEPT SELECT id FROM invoices WHERE status = 'paid'. What surfaces, and in what grain?",
      choices: [
        "The 6 no-leg receivables, one row each",
        "The void receivable's 925.00 leg — cash moved with no live claim, one row per receivable",
        "All 28 receivables — EXCEPT returns the union",
        "Nothing — EXCEPT requires identical column names",
      ],
      answer: 1,
      why: "Legs that exist minus receivables that claim settlement = evidence without a claim: the void receivable whose 925.00 leg still moved. Set grain dedupes both inputs first, so the five split plans (two legs each) cannot fan the count — one row per receivable regardless of how many legs it drew.",
      notes: [
        { choice: 0, why: "That's the mirror: claims-fold EXCEPT legs-fold surfaces paid-status receivables with no leg — the 1756.00. The direction of the EXCEPT IS the direction of the break." },
        { choice: 2, why: "EXCEPT is a difference, not a union — it hands back the rows of the left input that never appear in the right." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-15",
      prompt: "Surveillance deals the settled book into lag quartiles with NTILE(4) OVER (ORDER BY lag_days). What must you say before the deck ships?",
      choices: [
        "NTILE divides the average by four",
        "Quartiles are by COUNT, not by value — the top band holds as many trades as the bottom, and 'worst quartile' is a rank claim, so the band's average lag prints beside it",
        "NTILE ignores NULL lags automatically",
        "Quartiles need a GROUP BY to be legal",
      ],
      answer: 1,
      why: "NTILE(4) deals rows into four near-equal COUNT buckets by the ordering — quartile by rank, not by severity. The worst band can average 3.2 days or 4.0; only the average printed beside the rank tells the desk how bad it is. Unsettled trades (NULL lag) sit out of the deal — trusting them in NULLs the sort.",
      notes: [
        { choice: 1, why: "That's RANK/4 arithmetic — rank 8 of 82 is not quartile 2 of 20. The tiles are dealt by the window, not divided." },
        { choice: 2, why: "NULLs do sort — they land at an engine-chosen end and poison the deal. Exclude them with IS NOT NULL and say so." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-16",
      prompt: "The no-leg watchlist prints NULL exposure for its rows; the RM's page wants 0.00. Where does COALESCE go — and where does it do damage?",
      choices: [
        "At the display edge only — the classification upstream must still see NULL, because 'no leg' is a fact about the join",
        "Inside the CASE that classifies coverage, so no-leg reads as zero-paid",
        "Inside the ON clause, to pre-fill the join",
        "In the ledger at load time, so every query sees 0",
      ],
      answer: 0,
      why: "COALESCE is a display decision: wrap the final SELECT so the page reads 0.00 while the pipeline keeps NULL — the honest 'no evidence'. Coalesce before the coverage CASE and no-leg rows become zero-paid rows, some arm reads zero as a settled value, and the 15217.00 exposure silently joins the funded book.",
      notes: [
        { choice: 1, why: "That's the exact damage: the classification's job is to SEE the missing legs. A COALESCE'd count flowing into a ratio also silently changes the denominator's population." },
        { choice: 2, why: "ON joins on keys — COALESCE there fabricates join keys and attaches wrong matches. The join stays honest and unmatched." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-17",
      prompt: "The footprint census needs settled, in-flight and fallen counts per corridor from ONE scan — and LATAM (2 events, both settled) must print its zeros. Which shape guarantees the zero cells?",
      choices: [
        "Four separate queries stitched in a spreadsheet",
        "GROUP BY corridor with COUNT(*) FILTER (WHERE …) arms — conditional counts from one scan, every corridor row complete with zeros",
        "INNER JOIN orders to a status dimension and count the matches",
        "GROUP BY corridor, status and read the grid — missing pairs simply don't print",
      ],
      answer: 1,
      why: "FILTER (WHERE …) makes each column a conditional count over the same GROUP BY fold — EU 24/12/3, APAC 21/8/3, US 10/5/1, LATAM 2/0/0, all in one pass. A regulator reads an absent cell as 'no settlements, and why does the corridor exist at all?' — the zero must print, and the one-pass shape prints it.",
      notes: [
        { choice: 3, why: "Grouping by the PAIR prints only observed combinations — LATAM's in-flight cell vanishes instead of printing 0. The zeros are the deliverable." },
        { choice: 0, why: "Four queries lose the shared denominator: their populations can drift between runs, and the census is no longer one scan with one truth." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-18",
      prompt: "The nostro replay walks the cash account leg by leg, and two legs batch-posted at the same timestamp. Which frame makes the replay tie to the books?",
      choices: [
        "SUM(amount_cents) OVER (ORDER BY posted_at) — the default frame is fine",
        "SUM(amount_cents) OVER (ORDER BY posted_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — every leg moves the balance once",
        "SUM(amount_cents) OVER (PARTITION BY posted_at)",
        "SUM(amount_cents) OVER (ORDER BY posted_at RANGE BETWEEN 1 PRECEDING AND CURRENT ROW)",
      ],
      answer: 1,
      why: "The default frame is RANGE, and RANGE treats same-timestamp legs as peers: both enter the running balance together, one combined jump printed as a single step — and the replay stops matching the ledger's line-by-line walk. ROWS moves the balance once per leg; ties are routine when rails batch-post, so the frame keyword is load-bearing.",
      notes: [
        { choice: 2, why: "Partitioning by timestamp makes every timestamp its own partition — each 'balance' equals that row's amount. Partition and frame answer different questions." },
        { choice: 3, why: "A 1-preceding RANGE window is a two-row rolling sum, not a replay — the balance would forget everything older than the previous leg." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-19",
      prompt: "Every cross-border leg reprices at the FX rate in force at value date. Which join builds the as-of restatement?",
      choices: [
        "JOIN rates r ON r.currency = leg.currency AND r.effective_on = (SELECT MAX(effective_on) FROM rates r2 WHERE r2.currency = leg.currency AND r2.effective_on <= leg.value_date)",
        "JOIN rates r ON r.currency = leg.currency — the latest row per currency is the current rate",
        "JOIN rates r ON r.currency = leg.currency AND r.effective_on = leg.value_date",
        "JOIN rates r ON r.currency = leg.currency ORDER BY r.effective_on DESC LIMIT 1",
      ],
      answer: 0,
      why: "The as-of rule is 'the latest rate that went live at or before the value date' — effective_on <= value_date, maximized. Joining today's rate restates last month's corridor flow in a currency it never traded at; demanding equality drops every leg whose value date sits between rate changes; ORDER BY + LIMIT joins nothing per row.",
      notes: [
        { choice: 1, why: "That's the today-rate bug: last month's book restates silently in today's FX — the P&L explanation and the query disagree, and nothing errors anywhere." },
        { choice: 2, why: "Exact-match equality is the boundary bug: legs settling between effective dates match nothing and vanish from the restatement. <= is the convention, stated as policy." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-20",
      prompt: "ECL provision: exposure_cents folded per band, weighted by loss_bp (basis points). Which arithmetic survives the regulator's rerun?",
      choices: [
        "SUM(exposure_cents * loss_bp) / 10000 — divide the total by an integer 10000",
        "SUM(exposure_cents * loss_bp) / 10000.0, computed once at the display edge, with each band's factor joined from the band's own row",
        "ROUND(exposure_cents * loss_bp / 10000) per row, then SUM",
        "AVG(exposure_cents) * AVG(loss_bp) — the average exposure times the average factor",
      ],
      answer: 1,
      why: "Per-row integer division by 10000 truncates the cents that live in the bands and the provision reads low by construction; the /10000.0 runs ONCE at the edge. And the weight must come from the band's own row — weighting exposures with a neighboring band's factor produces a number that still balances, just to nothing true.",
      notes: [
        { choice: 0, why: "Integer / integer is integer division — the truncation happens inside the fold, before any display rounding could fix it. The .0 is the type switch." },
        { choice: 3, why: "Average times average is not the expectation of a product — bands with big exposures and big factors dominate, and the fold must weight them as they occur." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-21",
      prompt: "A custody onboarding feed mixed cases and padding — 'Müller@…' beside 'müller@… '. The counterparty match join misses. First move?",
      choices: [
        "SELECT DISTINCT to collapse the duplicates that do match",
        "Join on UPPER(TRIM(a.email)) = UPPER(TRIM(b.email)) — normalize the key on both sides",
        "JOIN on name — names are cleaner than emails",
        "WHERE email IS NOT NULL and retry",
      ],
      answer: 1,
      why: "Equality is byte-for-byte; the fix lives in the key expression, applied to BOTH sides, so the padded and cased variants resolve to the same key. This is the KYC-grade hygiene drill: a missed match is a counterparty the bank treats as two, and 'know your customer' begins with 'match your customer'.",
      notes: [
        { choice: 0, why: "DISTINCT hides the rows that matched twice and does nothing for the rows that never matched — the miss survives downstream where the manifest still shows two counterparties." },
        { choice: 2, why: "Names collide harder than emails, and the dedupe question is identity, not display. Normalize the key the source systems actually share." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-22",
      prompt: "The T+2 control needs booked-to-settled days: created_at and shipped_at are TEXT timestamps. Which expression is correct?",
      choices: [
        "shipped_at - created_at",
        "julianday(shipped_at) - julianday(created_at), over rows where shipped_at IS NOT NULL",
        "CAST(shipped_at AS INTEGER) - CAST(created_at AS INTEGER)",
        "DATEDIFF(shipped_at, created_at)",
      ],
      answer: 1,
      why: "SQLite applies numeric affinity to TEXT arithmetic: '2024-05-10' - '2024-05-07' reads each string's leading number (2024) and subtracts — 0. julianday() parses the full timestamp into a real day count (the book-wide 2.98 average), and the IS NOT NULL guard keeps the 21 unsettled trades from NULLing the average into silence.",
      notes: [
        { choice: 2, why: "The CAST reads the leading digits — 2024 minus 2024 — the same trap raw subtraction hits. Parsing is the fix, not casting." },
        { choice: 3, why: "There is no DATEDIFF in SQLite. julianday arithmetic is the portable answer, and portability is part of the control." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-23",
      prompt: "The double-settlement screen self-joins payments. Which predicate returns each suspect pair ONCE — and leaves the five split plans out of the queue?",
      choices: [
        "a JOIN b ON a.customer_id = b.customer_id — same counterparty is enough",
        "a JOIN b ON a.invoice_id = b.invoice_id AND a.amount_cents = b.amount_cents AND a.paid_on = b.paid_on AND a.id < b.id",
        "a JOIN b ON a.amount_cents = b.amount_cents",
        "a JOIN b ON a.invoice_id = b.invoice_id",
      ],
      answer: 1,
      why: "The duplicate definition is all three equalities (same receivable, same cents, same day) plus the ordering trick — a.id < b.id yields each unordered pair once and kills self-pairs. The five split plans carry two legs each with different amounts and dates, so the equality predicates keep them out; invoice_id alone would pair every split leg with its sibling.",
      notes: [
        { choice: 0, why: "Same counterparty pairs every leg a counterparty ever drew — the queue fills with history, not duplicates. The definition needs the full natural key." },
        { choice: 2, why: "Equal amounts across different receivables and days are routine — the queue drowns. Two of the three equalities, or none, are all the same bug: a definition that doesn't match the screen's intent." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-24",
      prompt: "Two runs of the corridor board return its rows in different order — same data, same query. What's the first thing you fix?",
      choices: [
        "Add an index on the corridor column",
        "The underspecified ORDER BY: tied amounts are dealt in plan order — pin a deterministic tiebreak (amount_cents DESC, invoice_id) and write GROUP BY columns out, no ordinals",
        "Convert the amounts to REAL for stable sorting",
        "Add LIMIT so the row count is stable",
      ],
      answer: 1,
      why: "Ties with no tiebreaker let the engine deal rows in plan order, which can change between runs — a pack that can't reproduce its own rows byte for byte isn't a control, it's a coin flip with formatting. The fix is a declared tiebreak inside the ORDER BY; ordinals in GROUP BY shatter the moment the SELECT list changes.",
      notes: [
        { choice: 0, why: "An index can change the plan and the luck — it doesn't declare intent. Reproducibility is a contract in the query, not a hope in the schema." },
        { choice: 3, why: "LIMIT caps rows, it doesn't order them — the ties underneath still shuffle, and now the pack truncates arbitrarily too." },
      ],
      difficulty: "medium",
    },
    {
      id: "deutsche-mcq-25",
      prompt: "A rail re-sent a settlement leg; both copies sit in the table. Build the keep-latest restatement — and what makes it reproducible?",
      choices: [
        "DELETE the rows you don't recognize",
        "ROW_NUMBER() OVER (PARTITION BY natural_key ORDER BY received_at DESC, id DESC) = 1, keeping the newest with a deterministic tiebreak, removed rows printed never discarded",
        "SELECT DISTINCT on the leg columns",
        "GROUP BY natural_key with MAX(received_at), then eyeball the rest",
      ],
      answer: 1,
      why: "The window dedupe numbers each natural-key group newest-first and keeps rn = 1 — and the tiebreak (id DESC) is what makes the rerun reproduce the choice when two copies share a received_at. The restatement discipline: the removed rows are printed as part of the control, because a dedupe that silently deletes evidence is just a tidier version of the break.",
      notes: [
        { choice: 2, why: "DISTINCT collapses identical rows and keeps one arbitrarily — no ordering policy, no receipt of what was dropped. Identical rows are exactly the case where you can't say which copy the books saw." },
        { choice: 3, why: "The MAX fold finds the newest timestamp but doesn't select the ROW — joining it back returns both copies when timestamps tie. The window with a tiebreak is the complete answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-26",
      prompt: "Which counterparties drew legs on BOTH rails this cycle? Four of them do. Which shape answers in one predicate set?",
      choices: [
        "UNION of the clearing-customer set and the wire-customer set",
        "INTERSECT of the two per-rail customer sets — set membership, each counterparty once",
        "WHERE method = 'card' AND method = 'wire' on one row",
        "A LEFT JOIN of card customers to wire customers with IS NOT NULL",
      ],
      answer: 1,
      why: "Two memberships, one intersection: fold each rail's customer set, INTERSECT, and the 4 dual-rail counterparties arrive exactly once — no fan-out, no DISTINCT ceremony. The row-level AND is never true (one column can't hold two values), and UNION answers 'either rail', the outreach population, not the dual-relationship one.",
      notes: [
        { choice: 0, why: "UNION is the either-or merge — every customer who touched any rail, which is the campaign list. The panel grades the difference between either and both." },
        { choice: 3, why: "The join shape works but returns pair-grain — one row per (card, wire) leg pairing, so a counterparty with three card legs and two wire legs appears six times before any DISTINCT." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-27",
      prompt: "'Show me each corridor's biggest receivable.' A candidate writes ORDER BY amount_cents DESC LIMIT 4. What ships?",
      choices: [
        "The four biggest receivables, one per corridor",
        "Whatever four rows the engine happened to read first — LIMIT without an ORDER BY over the whole set is nondeterministic, and even the ORDER BY version returns the four biggest overall, not per corridor",
        "A syntax error — LIMIT needs an ORDER BY",
        "The four corridors sorted by their biggest receivable",
      ],
      answer: 1,
      why: "LIMIT cuts rows from whatever order the query produced — with no ORDER BY that order is engine-arbitrary, and even ordered, the global DESC returns the four biggest RECEIVABLES (all likely EU), not one per corridor. Per-corridor argmax is a window job: ROW_NUMBER() OVER (PARTITION BY region ORDER BY amount_cents DESC).",
      notes: [
        { choice: 0, why: "The four biggest are all EU's top tickets (6148, 5614, 5284, 4937...) — one corridor owning the board is exactly the failure the per-corridor partition prevents." },
        { choice: 2, why: "LIMIT without ORDER BY is legal SQL — that's the problem. It compiles, ships, and means nothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "deutsche-mcq-28",
      prompt: "'Each corridor's single biggest receivable' — a candidate writes WHERE RANK() OVER (PARTITION BY region ORDER BY amount_cents DESC) = 1. What happens, and what ships instead?",
      choices: [
        "It works — RANK with a PARTITION is exactly right",
        "It errors: windows compute in the SELECT stage and WHERE runs before them — stage the rank in a CTE or derived table, filter rung = 1 outside",
        "It works but returns two rows per corridor on ties",
        "It returns the smallest receivable per corridor",
      ],
      answer: 1,
      why: "Pipeline order: WHERE evaluates before SELECT computes anything, and a window needs the final row set — the window call in WHERE fails outright. The honest shape stages the rank in a CTE and filters rung = 1 outside, which also makes the tie policy explicit: ROW_NUMBER decides one row per corridor; RANK reports both co-leaders.",
      notes: [
        { choice: 2, why: "That's the tie behavior of the join-back shape, not this one — this query never executes at all. The error is the lesson." },
        { choice: 3, why: "Direction is an ORDER BY choice inside OVER, orthogonal to the stage violation — the query dies before direction could matter." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-29",
      prompt: "The corridor AOVs are EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The deck averages them to 364.67. The book-wide average ticket is 338.19. Which number is real, and why?",
      choices: [
        "364.67 — each corridor carries equal weight in the book",
        "338.19 — the true average re-aggregates from the base rows: SUM(total)/COUNT(*) over 103 trades, where EU's 45 trades outweigh LATAM's 2",
        "Both — one is per corridor, one is per trade",
        "Neither — averages of REAL columns are unreliable",
      ],
      answer: 1,
      why: "Averaging the four corridor AOVs weights every corridor equally — LATAM's 2 trades count as much as EU's 45. The true average lives at the base grain: 34833.28 / 103 = 338.19. The honest blends re-aggregate from base rows or weight by counts — SUM(aov * orders)/SUM(orders) — and an average of averages is only correct when every group has equal counts, a claim this book refutes on its face.",
      notes: [
        { choice: 2, why: "'Both' is the diplomatic trap: 364.67 is a real computation about a book that doesn't exist — one where every corridor trades the same volume. The deck quotes the book that does exist." },
        { choice: 3, why: "REAL arithmetic is fine at this scale — the bug is weighting, not floating point. Naming the wrong suspect is how the real one survives." },
      ],
      difficulty: "hard",
    },
    {
      id: "deutsche-mcq-30",
      prompt: "The custody pack prints a corridor × rail grid — every corridor against every rail, even where no legs moved, as explicit zeros. Which shape builds the full grid?",
      choices: [
        "GROUP BY corridor, rail on the joined facts — observed pairs print, empty pairs vanish",
        "CROSS JOIN the corridor dimension with the rail dimension, LEFT JOIN the folded facts, COALESCE the counts to 0",
        "INNER JOIN corridors to rails, then filter zero counts out",
        "A recursive CTE generating corridor names",
      ],
      answer: 1,
      why: "The grid's rows must exist before the facts meet them: CROSS JOIN the dimensions builds every combination (4 corridors × 2 rails), LEFT JOIN attaches the observed folds, and COALESCE prints the zeros. A report that omits empty cells lies by omission — LATAM with no wire legs must read 0, not vanish.",
      notes: [
        { choice: 0, why: "Grouping observed pairs is the classic silent omission: the empty cells don't error, they just never print — and the regulator reads the gap as a hidden corridor." },
        { choice: 2, why: "INNER JOIN deletes exactly the rows the pack exists to print. Zero-fill is an anti-join with a COALESCE at the edge, not an inner fold." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-deutsche-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The corridor settlement-state census",
      brief:
        "Deutsche-flavored memo on the storefront db (orders = booked trade events, customers = counterparties, regions = corridors): the corridor footprint review wants booked trade events cut by corridor and settlement state — the census behind the strategy deck's first page. Probed facts: the book reads 52 settled, 30 in flight, 14 pending, 7 fallen, and the corridor cuts are EU 24/12/6/3, APAC 21/8/5/3, US 10/5/3/1, LATAM 2 settled. The review keeps only state rows with a material book — at least **10** events — so a single-counterparty corridor doesn't headline a deck off two rows. *A footprint without a materiality gate flatters the tail.*",
      ask: "Return the census: corridor, settlement state, booked events — state rows of 10+ events only, corridors A-to-Z, biggest state first within each.",
      template:
        "SELECT c.{1} AS corridor,\n       o.{2} AS state,\n       COUNT(*) AS events\nFROM orders o\nJOIN customers c ON c.id = o.{3}\nGROUP BY corridor, state\nHAVING COUNT(*) >= {4}\nORDER BY corridor, events {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the corridor grouping key",
          why: "c.region is the corridor — the census's grouping axis and the join's payload. Any other counterparty column groups the book at the wrong grain: a city where a corridor belongs, a name where a market belongs.",
        },
        {
          answer: "status",
          kind: "keyword",
          label: "the state grouping key",
          why: "o.status is the settlement state — settled, in flight, pending, fallen — the second axis of the census. Grouping by the order id would shred 103 events into 103 one-row states, a census of nothing.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the join key",
          why: "Each trade points at its counterparty's primary key — o.customer_id = c.id. Joining on region compares integers to text and matches nothing; joining on id pairs trades with whichever counterparty shares their row number.",
        },
        {
          answer: "10",
          kind: "number",
          label: "the materiality gate",
          why: "HAVING COUNT(*) >= 10 keeps exactly the material movement: EU settled 24, APAC settled 21, EU in flight 12, US in flight 10 — and 10 is verifiably in the result, the US in-flight cell. The gate at 5 would wave the tail through: pending rows of 5 and 6 headline a deck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the within-corridor order",
          why: "DESC headlines each corridor's biggest state — the deck reads exposure top-down. ASC opens every corridor on its smallest surviving row and the review reads upside-down books.",
        },
      ],
      distractors: ["city", "cancelled", "7", "ASC"],
      walkthrough:
        "A corridor census is a two-key GROUP BY with a materiality gate, and the join is grain-safe: each trade points at exactly one counterparty, so 103 events in, 103 rows out, folded per corridor and state into twelve rows before the gate. The HAVING keeps the four rows whose book is material — EU settled **24**, APAC settled **21**, EU in flight **12**, US in flight **10** — and drops the tail: APAC's 8 in flight, the 6-and-5 pendings, US settled at 5, and LATAM's entire 2-event book, which is one counterparty and gets its own relationship review, not a deck headline. The group total cross-foots to the probed mix — 52 settled, 30 in flight, 14 pending, 7 fallen — and the outer ORDER BY corridor, events DESC makes the board read corridor by corridor. The distractors fail honestly: a city grouping key re-titles every row at street grain, a cancelled column doesn't exist (status is the state; cancelled is one of its values), the gate at 7 lets the 8-and-6 tail through, and ASC turns every corridor's order upside down. The habit being graded: name the population in the gate — a footprint census without materiality flatters the tail, and the regulator reads the tail first.",
    },
    {
      id: "cs-deutsche-2",
      tier: "hard",
      topic: "t4",
      universe: "month-close",
      title: "The T+2 settlement lag control",
      brief:
        "Deutsche-flavored memo on the storefront db (orders = booked trade events, created_at = booked date, shipped_at = value date): the month-close pack ships a settlement-lag control — monthly average lag from booked to settled — because this is a T+2 house and the lag lives in a tight band. Probed facts: **82** of the 103 trades have settled (shipped_at set), book-wide lag **2.98 days**, band 2..4. The control buckets settled trades by month key and ships the count beside the average — *an average without its denominator is a vibe, and the regulator doesn't take vibes.*",
      ask: "Return the monthly control: month key, settled trades, average booked-to-settled lag in days (2dp) — months in calendar order.",
      template:
        "SELECT {1}(created_at, 1, {2}) AS month_key,\n       COUNT(*) AS settled_trades,\n       ROUND(AVG({3}(shipped_at) - julianday(created_at)), {4}) AS avg_lag_days\nFROM orders\nWHERE shipped_at IS NOT NULL\nGROUP BY month_key\nORDER BY month_key;",
      slots: [
        {
          answer: "SUBSTR",
          kind: "keyword",
          label: "the month-key function",
          why: "SUBSTR(created_at,1,7) carves the 'YYYY-MM' key the regulatory axis expects. UPPER returns the date untouched (and takes one argument, not three) — the key stops being a key.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the month-key width",
          noVerify: true,
          why: "Width 7 is 'YYYY-MM'. Width 5 carves '2024-' — every month in the book collapses into one bucket, and the monthly control becomes an annual shrug with a trend line of one point.",
        },
        {
          answer: "julianday",
          kind: "keyword",
          label: "the lag function",
          why: "JULIANDAY turns both dates into day numbers so the difference is days — the T+2 clock. MAX as a scalar max would swallow the constant arms; DATE minus julianday coerces a text date to 2024 and reports lags measured in millennia.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the display rounding",
          noVerify: true,
          why: "ROUND to 2dp matches the control's contract — 2.98 book-wide, monthly cells like 3.25 and 2.40. One dp rounds 2.89 to 2.9 and two months into apparent ties; zero dp lies outright about a control whose whole point is the decimals.",
        },
      ],
      distractors: ["UPPER", "1", "DATE", "MIN"],
      walkthrough:
        "A lag control is date arithmetic under a NULL guard. The WHERE keeps the 82 trades carrying a value date — the honest denominator, since the 21 unsettled trades would NULL the average into nonsense if julianday saw them — and SUBSTR(created_at,1,7) buckets them into the 14-month spine. Each month ships count and average together: 2024-02 reads **8 trades / 3.25 days**, the slowest month is 2024-08 at **3.71** on 7 trades, the fastest 2024-07 at **2.40** on 5 — every cell inside the probed 2..4 band, every month judged against the book-wide **2.98**. The count column is the control's credibility: 8 settled trades can carry a 3.25 average with dignity; 1 trade cannot, and the pack would say so. The distractors fail honestly: UPPER as the key function takes one argument (error) or leaves the key a full timestamp; width 1 carves '2' and one bucket eats the calendar; DATE minus julianday coerces the value date to 2024 and reports lags of negative two-million days; MIN as a scalar min collapses the key to the constant 1, while AVG(MIN(...)) inside the lag is a nested-aggregate error; and 1dp rounding blurs the decimals the band is read with. The habit being graded: guard the NULL, carve the key to 'YYYY-MM', and ship the denominator beside every average.",
    },
    {
      id: "cs-deutsche-3",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The no-leg receivable watch",
      brief:
        "Month-close brief, in-world: the break desk's daily control pairs claims with evidence — receivables that never drew a settlement leg are the no-leg watch, and the trade-finance desk reviews them corridor by corridor with a grand TOTAL row underneath, one query, one stack. Probed on the storefront db: 28 receivables, of which **6** carry no leg at all — EU 4 untouched for 8524.00, US 1 for 4937.00, APAC 1 for 1756.00 (the paid-status anomaly INV-2025-028) — 15217.00 of billed exposure the rails never touched. The watch stacks the corridor rows above the labelled TOTAL row so the pack shows the split AND the whole, and the split's exposures summing to the TOTAL is the check the reviewer runs first.",
      ask: "Return the no-leg watch: corridor, untouched receivable count, and exposure in dollars (2 decimals) — plus a labelled TOTAL row for the whole watch, biggest exposure first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS untouched,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS exposure\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nJOIN customers c ON c.id = i.customer_id\nWHERE p.id IS NULL\nGROUP BY corridor\nUNION ALL\nSELECT {2}, {3}, ROUND(SUM(i2.amount_cents) / 100.0, 2)\nFROM invoices i2\nLEFT JOIN payments p2 ON p2.invoice_id = i2.id\nWHERE p2.id IS NULL\nORDER BY exposure {4};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 receivables and hands the 6 with no legs a NULL payload that WHERE p.id IS NULL catches. INNER JOIN deletes exactly the rows the watch exists to list — the queue would ship empty and 15217.00 would read as settled.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The literal labels the stack's second branch so the row self-identifies as the whole watch, not another corridor. Any other label and the pack reads as four corridors — the reviewer would sum the wrong rows into the split and the identity check dies.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the all-in untouched count",
          why: "The TOTAL row must count the whole watch — 6 receivables untouched, the count the desk owns as a queue — while its exposure column carries the full 15217.00. Pinning the count keeps the row honest even if the corridor split upstream changes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The TOTAL row (15217.00) floats to the top and EU's 8524.00 leads the corridor rows — the pack opens on the whole and the biggest book. ASC would open on APAC's 1756.00 and bury both.",
        },
      ],
      distractors: ["INNER", "'ALL'", "5", "ASC"],
      walkthrough:
        "Two branches, one stack, one population. The detail branch is the anti-join: LEFT JOIN preserves all 28 receivables, the 6 with no legs survive WHERE p.id IS NULL carrying a NULL payload, and the customers join attaches each untouched receivable to its corridor — GROUP BY folds them into EU 4 / 8524.00, US 1 / 4937.00, APAC 1 / 1756.00. The TOTAL branch re-runs the same anti-join over the whole book: one row, labelled, 6 untouched and 15217.00 — and the identity the reviewer checks is that the corridor exposures sum to it, because a split that doesn't rebuild the whole means a WHERE trimmed a corridor upstream. UNION ALL glues the grains without a dedupe pass — the branches are disjoint by construction, and the outer ORDER BY exposure DESC floats the TOTAL to the top. The failure each wrong chip causes is different: INNER JOIN empties the detail branch and the pack prints a TOTAL with no split beneath it — the exact shape of a control that stopped looking; a different label breaks the pack's grammar; 5 understates the queue the desk owns; ASC reads the watch upside down. The APAC row is the one that pays for the query: 1756.00 billed, status says paid, no leg ever moved — state and evidence, paired, routed.",
    },
    {
      id: "cs-deutsche-4",
      tier: "easy",
      topic: "x2",
      universe: "growth",
      title: "The one-pass corridor census",
      brief:
        "Growth-board brief, in-world: the strategy deck's first page is the corridor footprint — settled, in-flight and fallen counts per corridor — and it ships as ONE scan, so no two queries can disagree about the population. Probed on the storefront db (orders = booked trade events, status = settlement state, regions = corridors): the book reads EU 45 events (24 settled / 12 in flight / 3 fallen), APAC 37 (21 / 8 / 3), US 19 (5 / 10 / 1), LATAM 2 (2 / 0 / 0) — 103 events, 52 settled, 30 in flight, 14 pending, 7 fallen in total. The zeros are the deliverable: LATAM's in-flight and fallen cells print 0 because a regulator reads an absent cell as 'no settlements — and why does the corridor exist at all?'",
      ask: "Return one row per corridor: corridor, total events, settled count, in-flight count, and fallen count — every state column from one scan, corridors A-to-Z.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS events,\n       COUNT(*) FILTER ({1} o.status = {2}) AS settled,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS in_flight,\n       COUNT(*) FILTER (WHERE o.status = {4}) AS fallen\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY corridor\nORDER BY corridor;",
      slots: [
        {
          answer: "WHERE",
          kind: "keyword",
          label: "the conditional-count grammar",
          why: "FILTER (WHERE …) is the syntax a conditional count takes: rows failing the predicate don't enter that aggregate, but the row itself survives for the others. Writing the predicate as a plain WHERE would filter the WHOLE scan — every corridor row would shrink to one state and the census would lie about its population.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled-state literal",
          why: "The db stores settlement state as delivered / shipped / pending / cancelled — the pack's 'settled' is the literal 'delivered', and the arm folds EU 24, APAC 21, US 5, LATAM 2. A literal the status column never holds folds nothing: the column prints 0 and the corridor reads as dormant.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight-state literal",
          why: "The in-flight arm carries the pipeline read — EU 12, APAC 8, US 10, LATAM 0 — and the US row is the story: 10 of its 19 events still in flight, the heaviest pipeline share in the book. Swap the literal with another state and the pipeline read moves to the wrong column without an error.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the fallen-state literal",
          why: "The fallen arm keeps the 7 failed settlements visible per corridor — EU 3, APAC 3, US 1, LATAM 0. Dropping the arm from the query is how states get edited out of censuses; here every state survives because each arm is written, and the columns cross-foot to the group mix (52 / 30 / 7).",
        },
      ],
      distractors: ["'pending'", "'void'", "AND"],
      walkthrough:
        "One scan, four corridors, five columns, no second query to disagree with the first. The join is grain-safe — each trade points at exactly one counterparty, so 103 events in, 103 rows out — and GROUP BY corridor folds them into four books. The leading COUNT(*) anchors the footprint: EU 45, APAC 37, US 19, LATAM 2. The three FILTER arms are conditional counts over the same fold: 'delivered' reads settled (24 / 21 / 5 / 2), 'shipped' reads in flight (12 / 8 / 10 / 0), 'cancelled' reads fallen (3 / 3 / 1 / 0) — and the columns cross-foot to the group mix, 52 settled, 30 in flight, 7 fallen, with the 14 pending readable as whatever the totals leave. LATAM's zeros print because the row exists and the arms ran over it; that is the entire argument for the one-pass shape over a pair-grid — an absent cell reads as a hidden corridor, a printed 0 reads as an honest empty book. The failure each wrong chip causes is quiet: a plain WHERE instead of FILTER collapses every corridor to its cancelled rows only; a wrong literal empties a state column without an error; AND isn't FILTER's grammar and the query refuses to compile. The census is one scan with one population — which is why the deck's first page and the regulator's rerun agree.",
    },
    {
      id: "cs-deutsche-5",
      tier: "hard",
      topic: "t6",
      universe: "month-close",
      title: "The running exposure board",
      brief:
        "Month-close brief, in-world: the concentration review reads each corridor's receivables as a cumulative curve — biggest ticket first, every row carrying the exposure SO FAR within its corridor — so the reviewer sees how few counterparties carry the book before the top-N cut is argued. Probed on the storefront db: 28 receivables across three corridors (EU 14, APAC 8, US 6 — LATAM books no receivables at all); EU's curve opens at Alice Chen's 6148.00 and crosses 11762.00 by the second row, APAC's at Maya Patel's 4459.00, US's at Emma Wilson's 4937.00. The board partitions by corridor — each corridor's curve is its own walk — and rows order biggest exposure first inside their corridor so the running column accumulates in the same order the eye reads.",
      ask: "Return the running exposure board: corridor, receivable number, counterparty, exposure in dollars (2 decimals), and running exposure within the corridor — corridor A-to-Z, biggest exposure first within each.",
      template:
        "WITH board AS (\n  SELECT c.region AS corridor,\n         i.number,\n         c.name AS counterparty,\n         ROUND(i.amount_cents / 100.0, 2) AS exposure,\n         {1}(i.amount_cents) OVER (PARTITION BY {2} ORDER BY i.amount_cents {3}, i.id) AS running_exposure\n  FROM invoices i\n  JOIN customers c ON c.id = i.customer_id\n)\nSELECT corridor, number, counterparty, exposure, running_exposure\nFROM board\nORDER BY corridor, exposure DESC;",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the cumulative adder",
          why: "SUM as a window aggregate accumulates the corridor's exposures in the window's order — 6148.00, then 11762.00, then 17046.00 on EU's curve. COUNT would accumulate a row count wearing a dollars name, and MAX would freeze at each row's own value, printing a running column that never accumulates.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the corridor partition",
          why: "PARTITION BY c.region restarts the accumulation per corridor — each corridor's curve opens at its own biggest ticket. Partitioning by counterparty would restart at every name: each running value would equal that row's own exposure, and the concentration curve the review reads would cease to exist.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first window order",
          why: "The curve accumulates biggest-first so the top of the board carries the whale and the running column shows concentration arriving fast — EU crosses 11762.00 by row two. ASC would accumulate from the smallest tickets and the concentration story would hide until the bottom of each corridor's block.",
        },
      ],
      distractors: ["COUNT", "c.id", "ASC", "MAX"],
      walkthrough:
        "A concentration curve is a running SUM with its restart rule named. The CTE prices every receivable in dollars, PARTITION BY c.region deals the 28 rows into three corridor walks — EU 14, APAC 8, US 6, and LATAM's absence is itself the finding, a corridor that books no receivables at all — and the window's ORDER BY amount_cents DESC, i.id accumulates each walk biggest-first with the id as the pinned tiebreak so the rerun reproduces the curve row for row. Reading EU's block: Alice Chen's 6148.00 opens, the second row lifts the running column to 11762.00 — two counterparties already carry a third of the corridor's 15089.23 of trade-book scale — and by the bottom of the block the running value is the corridor's whole receivable book. That curve is the argument the top-N cut is made from: the reviewer sees exactly where concentration saturates instead of trusting a cut taken blind. The outer SELECT orders corridor-major, exposure-DESC, so each block reads top-down. The chips fail differently: COUNT accumulates 1, 2, 3 — a row count wearing a dollars name; partitioning by c.id restarts the walk at every counterparty, each running value degenerating to its own exposure; ASC buries the whales at the bottom of each block; MAX prints each row's own value — a running column that never runs. The default frame is doing the work here: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW over a DESC order accumulates every smaller ticket into the walk — and because i.id pins the tiebreak, even tied amounts can't smudge the curve.",
    },
    {
      id: "cs-deutsche-6",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The month-over-month opex walk",
      brief:
        "Spend-report brief, in-world: the cost pack opens with the month-over-month opex walk — each month's spend, the prior month's spend beside it, and the percentage change — so the narrative writes itself from the table instead of from a spreadsheet stitched between two queries. Probed on the storefront db: 36 expense lines across 14 months (2024-01 through 2025-02), totaling 25416.00; the walk opens at 1719.00, dips to 1440.00 in 2024-02 (−16.2%), and peaks at 3210.00 in 2024-08 against July's 1794.00 — a +78.9% step the pack annotates, immediately answered by September's −51.9% give-back. LAG carries the prior month over the '%Y-%m' spine; the first month's change is honestly NULL — no baseline exists.",
      ask: "Return the 14-month opex walk: month key, spend, prior-month spend, and the month-over-month percentage change (1dp) — calendar order, oldest first.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(spent_on, 1, 7) AS month_key,\n         ROUND(SUM(amount_cents) / 100.0, 2) AS spend\n  FROM expenses\n  GROUP BY month_key\n),\nwalked AS (\n  SELECT month_key, spend,\n         {1}(spend) OVER (ORDER BY month_key) AS prior_spend\n  FROM monthly\n)\nSELECT month_key, spend, prior_spend,\n       ROUND(100.0 * (spend - prior_spend) / prior_spend, {2}) AS mom_pct\nFROM walked\nORDER BY month_key\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking window",
          why: "LAG(spend) hands each month the row before it in the window's calendar order — August's prior reads July's 1794.00. LEAD points forward and labels NEXT month as prior, flipping every delta's sign; SUM piles a running total into the prior column; and the first month's NULL is the honest 'no prior month', never a zero.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the delta's display rounding",
          why: "The walk's contract is one decimal — −16.2, +78.9, −51.9 — enough to read the move, not enough to fake precision the cents don't carry. Two decimals prints 78.93 and implies a control the month fold doesn't support; zero rounds 78.9 into 79 and two months into apparent ties.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the full-calendar cut",
          why: "The spine holds exactly 14 month buckets, 2024-01 through 2025-02 — the walk ships complete or it hides a month. Any shorter LIMIT truncates the calendar mid-year, and the pack's first page would read a year that ended in July.",
        },
      ],
      distractors: ["LEAD", "SUM", "2", "7"],
      walkthrough:
        "Fold, walk, then arithmetic — in that order, because each stage owns one job. The monthly CTE folds 36 expense lines onto the SUBSTR month spine at dollar grain: 1719.00 to open, 1440.00 in February, the 3210.00 August peak. The walked CTE layers the window: LAG(spend) OVER (ORDER BY month_key) reaches one bucket back in CALENDAR order and parks the prior month beside the current one — and because the walk runs over ALL 14 months, every printed delta rests on the baseline it names. The outer SELECT does only arithmetic: 100.0 * (spend − prior) / prior, rounded once at the edge — the August step-up reads +78.9 against July's 1794.00, September gives back −51.9, and the pack's annotation writes itself from the table. The first month's mom_pct is NULL by design: 2024-01 has no prior, and NULL is the honest print — a zero would assert 'flat month' on a month with no baseline. The two-step staging matters: the percentage needs prior_spend as a NAME, and a window can't be referenced by its sibling expressions in the same SELECT — stage the walk, then compute. LEAD labels September's give-back as July's baseline; SUM turns the prior column into a running cumulative that grows monotonically and makes every delta nonsense; 2dp fakes precision; LIMIT 7 amputates the calendar the pack opens with.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "T+2 aging buckets over unsettled items: the no-leg receivable watch (6 / 15217.00) aged against flat 30-day terms — the settlement break queue's ladder, straight from the ops desk." },
    { slug: "fx-exposure-report", why: "Latest-rate joins normalizing currency legs: the FX settlement read where every corridor's value lands in one reporting currency before the group pack prints." },
    { slug: "gl-reconciliation", why: "Ledger-versus-subledger break pairing: the daily control that turns 'the receivable says paid' into 'the leg proves it' — the bank's whole evidence discipline in one join." },
    { slug: "trial-balance-check", why: "Debits-equal-credits as a conditional fold: the 181080.00-against-181080.00, delta-0 proof in textbook shape — the first query every Frankfurt morning runs." },
    { slug: "ar-aging-schedule", why: "Receivables by age bucket per corridor: the trade-finance collections read — 19609.00 open, 15217.00 of it with no leg at all, aged and routed." },
    { slug: "bank-account-summary-ii", why: "Money-in, money-out and net per account: the nostro statement fold — every correspondent account's cash movement on one row, both directions, no vibes." },
    { slug: "account-balance", why: "Running balance replayed in event order: the auditor's cash walk — the 69612.00 debit fold proven one settlement leg at a time." },
    { slug: "transaction-velocity", why: "Velocity bursts per rail and hour: the surveillance read on clearing legs — a corridor that suddenly doubles its leg count gets a call before it gets a finding." },
    { slug: "duplicate-charge-pairs", why: "Self-joined leg pairs: the double-settlement screen that keeps the five split plans (two legs each) from masquerading as ten breaks." },
    { slug: "amount-anomaly-zscore", why: "Z-score outliers on leg amounts: the anomaly screen that flags the 1088.44 ceiling trade for a second look — statistical, defensible, documented." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window surveillance over rolling sums: the financial-crime desk's drill on settlement legs — windows declared, frames named, every alert reproducible." },
    { slug: "structuring-detection", why: "HAVING-gated threshold screens over grouped money movement: the structuring census the financial-crime team defends line by line, corridor by corridor." },
    { slug: "prepayment-detection", why: "Early-settlement flags against a schedule: receivables settled before their 30-day terms — the 13-day fastest settlement found mechanically instead of by anecdote." },
    { slug: "second-most-recent-activity", why: "Per-counterparty argmax with rank: each counterparty's second-latest settlement — the 'who lapsed since last cycle' screen the relationship desks live by." },
    { slug: "maximum-transaction-each-day", why: "Per-day largest leg with tie discipline: the treasury surveillance board — biggest single movement per day, ties broken by a declared rule, never by plan order." },
    { slug: "keep-latest-dedupe", why: "Keep-latest with a declared tiebreak: the restatement discipline when a rail re-sends a leg — the newest copy wins, the removed rows are printed, never discarded." },
    { slug: "generate-the-invoice", why: "Line items folded into one bill at receivable grain: the trade-finance invoicing read — the fold that must survive the five split plans without fanning." },
    { slug: "point-in-time-asof", why: "As-of reads where the record in force at the event date wins: the FX restatement drill — today's row is the wrong row, the boundary convention is policy." },
    { slug: "scd2-build", why: "Versioned counterparty records with valid-from windows: the custody discipline that keeps an as-of join honest when names, ratings and mandates change." },
    { slug: "late-arriving-restatement", why: "Restating a closed month when a leg arrives late: the month-close integrity read — the pack annotates the restatement, it never airbrushes it." },
    { slug: "journal-gap-detection", why: "Gaps-and-islands over journal sequences: the ledger completeness control — a missing sequence number is a break the books must declare, not smooth over." },
    { slug: "snapshot-delta-detect", why: "Diffing two regulatory snapshots: what changed between month-end folds, at set grain — the EXCEPT-shaped read behind every delta report the pack ships." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing: the rollforward identity the nostro proof runs every morning — one line per account, both directions." },
    { slug: "deferred-revenue", why: "Money received before it is earned: the liability fold that keeps the receivables book honest about billed versus banked." },
    { slug: "expected-credit-loss", why: "Exposure by band, weighted by loss factor, summed across corridors: the ECL provision where integer division and band scoping are the two places it lies." },
    { slug: "loan-amortization-schedule", why: "Scheduled draws and payments walked against a running balance: the lending read where a missing period silently under-accrues." },
    { slug: "delinquency-roll-rates", why: "State-to-state movement rates between cycles: the LAG read that turns the aging ladder into a flow — how the credit review narrates deterioration." },
    { slug: "vintage-default-curves", why: "Default rates by cohort and months-on-book: the vintage curve the credit pack reads — cohorts bucketed by the same month-key spine the regulatory pack uses." },
    { slug: "portfolio-concentration-hhi", why: "Concentration folded from squared shares per corridor: the single-name risk number the whale board feeds, proven against the corridor split." },
    { slug: "dividend-income-calendar", why: "Income events folded onto a calendar spine: the custody read where a month with no distributions must still print — the zero-bucket honesty drill." },
    { slug: "npv-queries", why: "Discounted cash flows over dated legs: the time-value fold behind prepayment and early-settlement economics — one rate, one edge conversion, no mid-pipeline rounding." },
    { slug: "monthly-transactions-i", why: "The month-key fold with a withheld bucket: the regulatory spine in textbook form — every month on the axis, every state named, nothing dissolved." },
  ],
};
