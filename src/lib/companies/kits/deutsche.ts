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
      slugs: ["sales-analysis-i", "number-of-rich-customers", "find-expensive-cities"],
    },
    {
      name: "Settlement-state filters",
      why: "52 settled, 30 in flight, 14 pending, 7 fallen — and the fallen share differs by corridor (APAC 8.1%, EU 6.7%, US 5.3%). Status-aware filters, honest denominators and conditional counts are the difference between a census and a vibe on the trade book.",
      slugs: ["recyclable-and-low-fat-products", "not-boring-movies", "weather-type-in-each-country"],
    },
    {
      name: "Coverage & partial settlements",
      why: "A receivable can be open AND received — the 4000.00 leg against the 6148.00 balance is the case study the break desk cites. Coverage folds settlement legs per receivable and compares to billed; the classification is computed, never stored.",
      slugs: ["bank-account-summary", "number-of-times-a-driver-was-a-passenger", "calculate-orders-within-each-interval"],
    },
    {
      name: "Break hunts & no-leg anti-joins",
      why: "The bank's daily control is pairing state with evidence: a receivable claiming paid with no rail hit, a void that still drew cash. LEFT JOIN ... IS NULL and EXISTS screens are how the 15217.00 no-leg book and the 1756.00 paid-unmoved receivable surface — and how they stay surfaced.",
      slugs: ["customers-who-never-order", "employees-with-missing-information", "books-with-null-ratings"],
    },
    {
      name: "The T+2 settlement clock",
      why: "A trade settles on a value date, and the lag is pure date arithmetic: julianday deltas over the 82 settled events, averaged 2.98 days inside a 2..4 band. Aging buckets, date-diff screens and weekend-aware counts are the settlement-ops drills — the trap is the silent NULL that drifts the denominator.",
      slugs: ["settlement-fails-aging", "ar-aging-schedule", "average-time-of-process-per-machine"],
    },
    {
      name: "Corridor whale boards (windows)",
      why: "Exposure is read per corridor, never one global ladder: each corridor's biggest receivables ranked within its own book, rung by rung. RANK with PARTITION BY, per-corridor top-N and share-of-book windows are how the concentration review reads single-counterparty risk.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders"],
    },
    {
      name: "Regulatory month buckets",
      why: "Every regulatory trend buckets on the 'YYYY-MM' key — SUBSTR of the event date, width 7 — over a book that runs 2024-01 to 2025-02 at a flat 6-to-9 events a month. The spine discipline matters: months ride the axis even when quiet, and a '%Y' (or '%M' by accident) key dissolves the calendar the regulator expects.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i"],
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
      slugs: ["consecutive-transactions-with-increasing-amounts", "biggest-window-between-events", "year-on-year-growth-rate"],
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
  ],
};
