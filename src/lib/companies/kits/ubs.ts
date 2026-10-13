// UBS — kit 12 of the Banking & Capital Markets domain (Batch L, wave 7).
// Global wealth & investment banking, post-CS integration: two legal entities'
// books merging into one, which turns every close into a cross-entity
// reconciliation — coverage censuses, whale-concentration reviews and
// integration-era data audits where a status column is a claim and a rail hit
// is evidence. The storefront db maps on honestly: invoices are client fee
// billings (advisory mandates, billing cycles, fee memos — the receivables the
// wealth books carry), payments are settlement legs (method card / wire — the
// house debit rail and the interbank wire rail), ledger_entries is the
// double-entry book of record, expenses are opex lines, customers are client
// households across four booking centers (EU / US / APAC / LATAM standing in
// for Zurich, New York, Singapore, São Paulo), orders are booked fee events
// (REAL dollars — the one table where money is already dollars). Money in
// invoices/payments/expenses/ledger is INTEGER cents — the dollar read is
// always amount_cents / 100.0.
// Pool provenance: UBS has 0 tagged sql rows in the band (checked
// company-pools.md for ubs / UBS variants) — 0 tagged LC — theme-curated:
// every topic and problem slug is curated from the theme menu to UBS's known
// question families (cross-entity folds, coverage censuses, whale boards,
// rails, books of record, wealth KPIs), provenance stated per problem.
// Case figures: scripts/company-facts.md (probed 2026-10-12), case cells
// re-probed against db/custom.db (read-only) before authoring.

import type { CompanyKit } from "../types";

export const ubsKit: CompanyKit = {
  id: "ubs",
  domainId: "banking",
  name: "UBS",
  tagline: "Global wealth & investment banking, post-CS integration",
  accent: "text-red-200",

  brief: [
    "**UBS** is the world's largest wealth manager, and since absorbing Credit Suisse it runs as one bank with two integration-era truths: the client books merged, the data pipelines did not finish merging. An analyst here reconciles across legal entities for a living. On this training db the mapping is honest: `orders` are booked fee events (REAL dollars — the one table where money is already dollars), customers are client households assigned to four booking centers, and every fee a mandate generates — advisory cycle, product fee, billing memo — lands as a receivable. Probed scale: **103 booked fee events worth 34833.28**, the busiest household holding **24 events for 7262.35**, with the books reading EU 45 events / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44.",
    "The money tables are where UBS screens live, and they are integer cents — the dollar read is always `amount_cents / 100.0`. `invoices` carry the fee billings: 21 paid for 66443.00, 6 open at 19609.00, 1 void at 925.00. `payments` are the settlement legs that clear them on two rails — {emerald:card}, the house debit rail (16 legs for 37364.00), and {sky:wire}, the interbank rail (11 legs for 32248.00) — and five billings were settled on split plans, two legs each. `ledger_entries` is the book of record: **181080.00 debits against 181080.00 credits across 80 entries, delta 0**. *A number that can't be split by booking center and tie back to the books doesn't leave the desk.*",
    "The SQL screens are integration-audit screens. A warm-up per-center fold, then the two questions the integration program is famous for: the {emerald:coverage census} — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00) — where membership is settlement evidence, not the status column, and the {rose:anomaly pair} — a void billing that still drew its **925.00** rail hit, and a paid-status billing at **1756.00** with no rail hit at all. Follow-ups probe the denominator ('open-status or no-leg — which six?') and the fan-out ('billing count or leg count — one billing can take two rail hits').",
    "Prep the way the screens run. Drill conditional folds and `FILTER (WHERE …)` censuses, strftime month buckets across the 2024-01 to 2025-02 window, the opex reads (Rent at 14 lines / **16800.00**, monthly opex peaking **3210.00** in 2024-08), and the settlement clock — billings average **28.4 days** to first settlement, fastest 13, slowest 84, against flat 30-day terms. Then practice the sentence that gets hired at a house that just merged two banks: *same mandate, different booking center — the definition travels, the entity split stays honest, and every census names its evidence.*",
    "The desk's deepest habit is keeping the two clocks every UBS read runs on apart: the {violet:trade date} — fee events keyed on `created_at`, the booked curve that reads 103 events worth 34833.28 — and the {emerald:settlement date} — the rail legs keyed on `paid_on`, the cash curve that reads 27 legs for 69612.00. The gap between them is the working capital of the wealth book: billings average **28.4 days** to first settlement (fastest 13, slowest 84) against flat 30-day terms, so a booked curve and a cash curve for the same month never agree, and the pack prints both with their date keys named. The cost side reads the same way: Rent is **16800.00** of the 25416.00 opex book — two-thirds of the cost stack in 14 lines — and the revenue side concentrates the way wealth books do, with 63.5% of book value from households whose lifetime spend crosses 3000.00. *Same mandate, two clocks, one book of record — the analyst who conflates the curves double-counts February.*",
    "Prep as the screens sequence. Pass one is money discipline — every fold in integer cents, `/ 100.0` at the display edge, `ROUND` once, because the ledger proof is an integer-exact identity the display layer must reconcile back to. Pass two is the coverage census and its evil twin, the no-leg anti-join, until you can narrate the **19609.00-versus-15217.00** membership gap without notes. Pass three is windows — per-center whale boards, running cash walks with the frame declared, month-over-month deltas whose first row prints NULL on purpose. Pass four is set ops — stacking rail censuses with UNION ALL, standing state against evidence with EXCEPT, and knowing why NOT IN is the one gate this desk refuses to ship. Then rehearse the closing sentence until it is reflex: *the definition travels, the entity split stays honest, and every count ships with its population in the same sentence.*",
  ],

  dayInLife: [
    "**07:45 —** the books proof before Zurich wakes up. First query proves the ledger — **181080.00 against 181080.00, delta 0** across 80 entries — then the rail census: card **16 legs / 37364.00**, wire **11 / 32248.00**, cross-footed to the cash book's 69612.00 debit fold. The break list pairs state with evidence: one void billing that still drew **925.00**, one paid-status billing with no rail hit at **1756.00**. The integration PMO reads the break list at 08:00 sharp; the books tie before it lands.",
    "**11:30 —** deep work: the coverage census, re-cut per booking center. Billings LEFT JOINed to their settlement legs, receipts folded per billing, then CASE arms classify — exact, partial, none — and the split-plan billings get named, not averaged: one took a **4000.00** leg against a 6148.00 balance and is still open. The instinct being trained: the census counts *billings* (`COUNT(DISTINCT i.id)`), never leg rows — *the plan is the billing's story; the leg is just today's entry.*",
    "**16:30 —** the risk-committee pack and the EOD writeup. The whale board ships: each center's biggest fee billings ranked within itself, EU's rung 1 being the **6148.00** open partial — the book's largest single billing is also its least settled. Every slide carries its definition — what counts as settled (a rail hit, not the word paid), which month key buckets the cohorts — and tomorrow's ask is queued for the data-quality board: the paid-unmoved **1756.00**, waiting on the source system's own explanation. *The committee doesn't argue with evidence; it argues with definitions — so the definitions go in writing.*",
    "**21:15 —** the night window belongs to the restatement queue. The wire rail clears late — legs for billings the close already published — so the handoff note pre-stages tomorrow's first query: the {rose:late-leg diff} that stands the closed months' settled folds against the feed and labels anything new a restatement candidate rather than quietly re-drawing a closed bucket. The ledger proof re-runs on the overnight postings — **181080.00 against 181080.00, delta 0**, or the morning stops — and the census re-versions by run date, because a coverage read without its as-of stamp is a screenshot, not a control. *The night shift's whole job is to make 07:45 boring.*",
  ],

  metrics: [
    { name: "Booked fee events by center", what: "Fee events with value per booking center — EU 45 / 15089.23, APAC 37 / 11605.45, US 19 / 7286.16, LATAM 2 / 852.44. The footprint view every integration read starts from." },
    { name: "Billing-state mix", what: "Fee billings by state — 21 paid / 66443.00, 6 open / 19609.00, 1 void / 925.00. The group total is believed only after the center split reproduces it." },
    { name: "Coverage census", what: "Billings by settlement coverage — 21 exact (65612.00), 1 partial (4000.00 of 6148.00), 6 none (15217.00). Membership is evidence (folded rail hits vs billed), never the status column." },
    { name: "Rail mix", what: "Settlement legs per rail — card 16 / 37364.00 (house debit), wire 11 / 32248.00 (interbank). The pair cross-foots to the cash book's 69612.00 debit fold." },
    { name: "Books proof delta", what: "Total debits minus total credits across the ledger — 181080.00 against 181080.00, delta 0 across 80 entries. A nonzero delta pages the close, not a footnote." },
    { name: "Anomaly pair watch", what: "The two breaks every integration review opens with: void-but-drawn (925.00) and paid-with-no-rail (1756.00). State paired with evidence, quantified in dollars, routed — never deleted." },
    { name: "Client concentration", what: "Share of fee revenue from the top books — 63.5% of value from households whose lifetime spend crosses 3000.00, 71.2% from those above 2000.00. The whale board the risk committee reads." },
    { name: "Settlement lag", what: "Days from billing to first settlement on settled billings — 20 billings, 28.4 days average, fastest 13, slowest 84, against flat 30-day terms. The collections tempo, per center." },
    { name: "Trade-date vs settlement clock", what: "The booked curve keys fee events on created_at (103 events / 34833.28); the cash curve keys rail legs on paid_on (27 legs / 69612.00). Billings average 28.4 days to first settlement — 13 fastest, 84 slowest — against flat 30-day terms, so the two curves never agree by month, and every pack prints both with their date keys named." },
    { name: "Opex concentration", what: "Rent is 16800.00 across 14 lines — two-thirds of the 25416.00 opex book — with Ads at 4570.00, Travel 2521.00 and Tools 1525.00. Monthly opex peaks at 3210.00 in 2024-08; the synergy deck lives on this fold." },
    { name: "Center household census", what: "Buying households per booking center — EU 8, APAC 5, US 2, LATAM 1. The LATAM book's entire 852.44 rides one household, which is why the center split is read before any group total ships." },
    { name: "Ticket spread by center", what: "Average fee event — US 383.48 (the richest ticket), EU 335.32, APAC 313.66 — against the book-wide 338.19 with a floor of 25.47 and a ceiling of 1088.44. Concentration claims are checked against the spread, not the mean." },
  ],

  topics: [
    {
      name: "Cross-entity book folds",
      why: "Post-CS, every number is read twice: as the group total and as the center split that must reproduce it. Billings, value and households GROUP BY booking center, with group-versus-center benchmarks and per-entity ratio reads doing the tie-back check.",
      slugs: ["countries-you-can-safely-invest-in", "find-expensive-cities", "average-salary-of-departments"],
    },
    {
      name: "Coverage & partial settlements",
      why: "A billing can be open AND received — the 4000.00 leg against the 6148.00 balance is the case study every integration review cites. Coverage folds receipts per billing and compares to billed; the classification is computed, never stored.",
      slugs: ["bank-account-summary", "monthly-transactions-ii", "immediate-food-delivery-ii"],
    },
    {
      name: "Whale boards & concentration",
      why: "A wealth house manages concentration risk on purpose: top billings per center, share-of-book windows and percentile cuts are how the risk committee reads exposure — each booking center ranked within itself, never one global ladder.",
      slugs: ["portfolio-concentration-hhi", "department-top-three-salaries", "value-at-risk"],
    },
    {
      name: "Rails & settlement legs",
      why: "Settlement is leg-level: five billings ride two rails each, so leg counts and billing counts disagree by exactly the split plans. Velocity bursts per rail, duplicate-pair screens and rate rankings are the rails desk's daily reads.",
      slugs: ["transaction-velocity", "duplicate-charge-pairs", "circular-transfers"],
    },
    {
      name: "Anomaly screens",
      why: "The integration doubled the surfaces where state and evidence disagree: void-but-drawn, paid-unmoved, amount outliers. Sliding-window checks, z-score screens and percentile-ranked suspicion pair the status column with what actually moved.",
      slugs: ["suspicious-bank-account-transactions", "amount-anomaly-zscore", "top-percentile-fraud"],
    },
    {
      name: "Books of record & reconciliation",
      why: "The ledger ties or nothing ships: trial-balance folds (181080.00 against 181080.00, delta 0), ledger-versus-rail reconciliation and balance rollforwards are the proof drills behind every close call.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
    {
      name: "Wealth-book KPIs",
      why: "The books read like portfolios: weights and shares per mandate, concentration indices, performance ratios computed over window frames — the math the investment review runs, expressed as SQL over the same fold discipline.",
      slugs: ["portfolio-weights", "sharpe-ratio", "time-weighted-return"],
    },
    {
      name: "Credit & counterparty watch",
      why: "Fee receivables age like credit exposures: days-past-terms buckets, utilization-style bands and weighted-loss folds are the language the collections desk borrows from credit risk — built on the same no-leg anti-join.",
      slugs: ["delinquency-buckets", "credit-utilization-bands", "expected-credit-loss"],
    },
    {
      name: "Household activity & cadence",
      why: "Advisors read households, not events: repeat-fee frequencies, loyal-household screens and short-window repeat detection decide who gets the call — and the 24-event household is exactly the record this drill finds.",
      slugs: ["customer-order-frequency", "find-loyal-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Opex & cost lines",
      why: "Integration years are cost years: category folds over opex lines (Rent 14 lines / 16800.00), pacing against plan and month-bucketed spend (peaking 3210.00 in 2024-08) are the reads behind every synergy deck.",
      slugs: ["spend-histogram", "budget-pacing", "friday-purchase-iii"],
    },
    {
      name: "Set-op censuses & diffs",
      why: "Two feeds describing one book is the integration's standing condition: a status column that claims and a rail feed that proves. UNION ALL stacks censuses that are disjoint by construction — the card arm beside the wire arm — while EXCEPT stands one census against another and hands back exactly the misfits; the discipline is matching column shapes first and letting the cross-foot argue second.",
      slugs: ["count-salary-categories", "league-statistics", "movie-rating"],
    },
    {
      name: "Month spines & trend buckets",
      why: "Every trend page here buckets on the 'YYYY-MM' key — SUBSTR of the event date, width 7 — and the flat 6-to-9 monthly pace is the metronome every claimed spike is tested against. The spine discipline matters as much as the key: months ride the axis even when quiet, and a '%Y' key (or '%M' by accident) dissolves the calendar.",
      slugs: ["unique-orders-and-customers-per-month", "monthly-transactions-i", "hopper-company-queries-i"],
    },
    {
      name: "LAG walks & movement reads",
      why: "Movement reporting at a merged house is deltas, not levels: month-over-month opex walks, roll-forward waterfalls, status-transition reads where each line explains the move from the last. LAG hands every row its predecessor, the edge rows go NULL by definition, and the walk must be staged before any WHERE trims the predecessor away — a delta column that never shows a first-row NULL is hiding its baseline.",
      slugs: ["year-on-year-growth-rate", "week-over-week-churn", "mrr-waterfall"],
    },
    {
      name: "Integration audit trails",
      why: "Post-CS, feeds arrive twice and late: duplicate rail hits, restatements after a published close, snapshots that drift between runs. Keep-latest dedupe with a declared tiebreak, FULL OUTER JOIN snapshot diffs and late-arriving-watermark reads are how the audit trail survives the merge — and the removed rows are printed, never discarded.",
      slugs: ["snapshot-delta-detect", "late-arriving-restatement", "null-blank-audit"],
    },
    {
      name: "The settlement clock",
      why: "Days from billing to first rail hit is the collections tempo — 28.4 average, 13 fastest, 84 slowest against flat 30-day terms — and it is pure date arithmetic: julianday deltas, first-leg MIN folds, due-date comparisons where negative deltas mean the household paid early. The trap is the silent NULL: a malformed date juliandays to NULL and the clock's denominator drifts without a word.",
      slugs: ["average-time-of-process-per-machine", "users-that-actively-request-confirmation-messages", "second-day-verification"],
    },
  ],

  theory: [
    {
      id: "ubs-t1",
      q: "You join fee billings to their settlement legs and the per-center billing counts stop summing to the 28-billing book. What happened?",
      a: "Fan-out: five billings were settled on split plans — two legs each — so the join prints 33 rows and every COUNT(*) on that result counts rail hits, not billings. The fix is grain discipline: fold the legs per billing first (derived table or CTE), or protect the census with COUNT(DISTINCT i.id). At UBS this is the daily trap because the split plans are real client arrangements, not dirty data — the integration reporting rule is that the center split must reproduce the 28-billing book, and a fold at leg grain breaks that identity by exactly the five splits.",
      tag: "joins",
    },
    {
      id: "ubs-t2",
      q: "The risk committee wants each booking center's largest fee billings ranked within its own book. Build it.",
      a: "Windows with PARTITION BY: RANK() OVER (PARTITION BY center ORDER BY amount_cents DESC) gives every booking center its own rung 1, and ORDER BY center, rung on the outside makes the board read center by center. Without the partition you get one global ladder where one center owns the top ten and the other books' advisors read boards with no top of them. I keep the tie policy explicit — RANK shares rungs on ties, ROW_NUMBER doesn't — and pin a deterministic tiebreaker inside the window so the committee's rerun reproduces the board row for row.",
      tag: "windows",
    },
    {
      id: "ubs-t3",
      q: "Build the coverage census — exact, partial, no rail — so the integration review can argue with real numbers.",
      a: "Fold settlements per billing, then classify, then fold again per center: LEFT JOIN billings to legs, GROUP BY billing id, COALESCE the receipt sum to 0, and CASE arms — no leg is the none arm, SUM < billed is partial, equal is exact. The follow-ups are where candidates die: open status is not the no-leg book (19609.00 versus 15217.00 — the open 4000.00-partial has a leg and leaves the anti-join, while a paid-status 1756.00 has none and stays), and the legs join fans split billings, so the census counts DISTINCT billings. I quote the actuals — 21 exact / 65612.00, 1 partial, 6 none / 15217.00 — and insist the center split reproduce them before the pack ships.",
      tag: "aggregation",
    },
    {
      id: "ubs-t4",
      q: "A stakeholder says 'the uncollected book is the open book — both are six billings.' Where does that identity break?",
      a: "At membership, which the coincidental count hides. The open-status census carries 19609.00; the no-leg anti-join carries 15217.00 — the 4392.00 gap is two honest anomalies: an open billing with a 4000.00 partial settlement (evidence exists, so it leaves the watch) and a paid-status billing at 1756.00 with no rail hit (a claim without evidence, so it stays). The lesson: the anti-join's IS NULL on the right-side key defines 'never settled', and a status column is a claim about a state machine that integration just made twice as complicated. I name both lists per center before choosing which one the review works.",
      tag: "nulls",
    },
    {
      id: "ubs-t5",
      q: "Walk me through SQL's logical evaluation order and where it bites in a per-center fold.",
      a: "FROM and JOIN build rows, WHERE filters rows, GROUP BY folds them, HAVING filters groups, SELECT projects, ORDER BY and LIMIT run last. The bites: the 'centers with a live uncollected book' gate is HAVING, because the fold doesn't exist at WHERE time; a WHERE on center is a row predicate and belongs above the fold; SELECT aliases are usable in GROUP BY and ORDER BY in SQLite but not in WHERE. On the integration board I keep the center filter in WHERE, the small-book gate in HAVING, and I narrate the order out loud — interviewers here are checking whether pipeline order is a mental model, because cross-entity reporting is folds and gates landing in the right clause, every close.",
      tag: "pipeline",
    },
    {
      id: "ubs-t6",
      q: "One center's book looks expensive per billing versus the group average. Scalar subquery, window, or CTE for the benchmark?",
      a: "By how much definition the benchmark needs. A scalar subquery — WHERE billed > (SELECT AVG(amount_cents) FROM invoices) — is the smallest correct form for one group-wide line. AVG() OVER (PARTITION BY center) is the better shape when the review wants each billing beside its own center's mean, because the benchmark travels with the row. A CTE earns its keep when the benchmark gets a definition — 'group average over open-and-paid billings, void excluded' — because a named, commented fold is auditable across two merged legal entities and a nested one-liner isn't. Integration-era benchmarks always grow per-entity definitions here, so I stage the CTE earlier than fashion suggests.",
      tag: "subqueries",
    },
    {
      id: "ubs-t7",
      q: "The collections read needs billing-cohort months and days-past-terms. How do you handle dates in SQLite for both?",
      a: "Two tools. Cohort buckets with strftime('%Y-%m', issued_on) — a '2024-10' style key that GROUP BY folds cleanly across the 2024-01 to 2025-02 window and sorts correctly as text. Aging needs instant arithmetic: julianday(reference) - julianday(due_on) per billing, against flat 30-day terms — and the trap I name out loud: julianday over a missing or malformed date NULLs the row silently, so the watch's denominator drifts unless the NULL arm is handled on purpose. The settled billings' own clock runs 28.4 days average billing-to-settlement (fastest 13, slowest 84), which is why 'terms are flat 30' is a definition worth verifying — min and max terms both print 30 here.",
      tag: "dates",
    },
    {
      id: "ubs-t8",
      q: "A void billing still drew a 925.00 settlement, and a paid billing shows no rail hit at all. What's the break policy?",
      a: "Detect, quantify, route — per center, then as a group. Detect by pairing state with evidence: status = 'void' AND a settlement exists (the 925.00 break), status = 'paid' AND no settlement (the 1756.00 break) — a one-pass FILTER (WHERE …) census counts both arms on the same scan so every center's numbers come from one query. Quantify in dollars; route to the desk that owns the source system; never delete, never silently re-status. Then reconcile to the book of record — the ledger still proves 181080.00 against 181080.00, delta 0, because double-entry records what happened. The trial balance alone is never sufficient evidence of correctness — that sentence is the integration's control culture.",
      tag: "quality",
    },
    {
      id: "ubs-t9",
      q: "The cash-book walk — SUM over the ledger in entry order — jumps two postings at once where two share a date. Why, and which frame fixes it?",
      a: "The default frame with ORDER BY is RANGE, and RANGE folds peers: rows sharing the sort key enter the window together, so same-date postings land in the walk as one step and the intermediate position never prints. The fix is the explicit frame — SUM(...) OVER (ORDER BY entry_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — which walks entry by entry even where dates tie. But the choice is a definition, not a repair: ROWS answers 'position after each posting', RANGE answers 'position at each distinct event date', and the cash book (69612.00 debits over 27 entries) supports both readings. On integration packs the frame is quoted in the slide footer next to the fold, because the same 80 ledger entries produce two different-looking walks and only one is the one the controller asked for.",
      tag: "windows",
    },
    {
      id: "ubs-t10",
      q: "Your month-over-month delta column never shows a NULL. Why is that a smell, and what does an honest walk look like?",
      a: "Because the first bucket of any LAG walk has no predecessor — the honest delta is NULL, and a column that never shows it means someone COALESCE'd it to zero mid-pipeline, which reads as 'flat' when the truth is 'unknown'. The walk I ship stages LAG(opex) OVER (ORDER BY month_key) in a CTE before any outer WHERE, prints the first row as NULL with a caption, and declares the tiebreaker — month_key alone ties if two buckets ever collide, so the id joins the sort when the grain allows. Direction is a definition too: LAG pairs a month with its past, LEAD with its future — swap them and every interior delta flips sign while the NULL parks on the last row. At UBS the NULL-first-row is a feature: the restatement queue reads it as 'baseline month, nothing prior to argue with'.",
      tag: "windows",
    },
    {
      id: "ubs-t11",
      q: "The close stacks the card census and the wire census into one sheet. UNION or UNION ALL — and what does the wrong choice cost you when the sheet is wrong?",
      a: "UNION ALL is a raw stack: every row of both arms survives, and here the arms are disjoint by the rail column — 16 card rows plus 11 wire rows cross-foot to 27, so nothing can collide and the cheap operator is the honest one. UNION runs an implicit DISTINCT across the whole stack: wasted work in a clean world and evidence destruction in a dirty one, because if a card row and a wire row were ever row-for-row identical, UNION silently deletes the duplicate — and on a reconciliation sheet, the rows an operator removes are the audit trail. The other discipline is shape: both arms must project the same columns in the same order, or the stack compares dollars to ids. House rule: UNION ALL for stacked censuses, UNION only where deduplication is the declared goal.",
      tag: "setops",
    },
    {
      id: "ubs-t12",
      q: "The anomaly queue is 'billings with a rail hit that the status column does not call paid'. Why EXCEPT rather than NOT IN — and what does each do with NULLs?",
      a: "Two single-column censuses: the 22 billing ids with at least one rail hit, and the 21 ids the status column calls paid. EXCEPT returns the first census's rows absent from the second — billing 11, the void that settled 925.00, and billing 25, the open partial at 4000.00 of 6148.00 — and its distinct-row semantics treat NULL as just a row, so a NULL in either arm is data, not poison. NOT IN evaluates x = NULL per row, UNKNOWN is not TRUE, and one NULL in the subquery's list empties the entire gate silently — the anomaly queue ships blank and the close signs a clean bill on a dirty book. Note the mirror: billing 28 — paid status, 1756.00, zero rail hits — lives in the opposite diff (paid EXCEPT has-rail). The queue is always two queries; one diff is half an audit.",
      tag: "setops",
    },
    {
      id: "ubs-t13",
      q: "For 'households whose lifetime fee value beats their booking center's average', do you reach for a correlated subquery, a window, or a CTE — and what breaks with the wrong pick?",
      a: "Three shapes, three definitions. The correlated form — WHERE spend > (SELECT AVG(spend) FROM lifetime l2 WHERE l2.center = l1.center) — carries the center benchmark inside the row loop: correct, re-run per household, fine at 16 households and a habit worth flagging at 16 million. AVG(spend) OVER (PARTITION BY center) computes the benchmark once and carries it beside every row — the shape I stage when the read is 'each household against its own book's mean'. A CTE earns its keep when the benchmark grows a definition ('center average over open-and-paid billings, void excluded'), because a named fold is auditable across two merged entities and a nested one-liner isn't. What breaks with the wrong pick is rarely the number — it is the follow-up, the moment the definition grows a center qualifier and the scalar one-liner has nowhere to put it.",
      tag: "subqueries",
    },
    {
      id: "ubs-t14",
      q: "Why stage a fold in a CTE when one dense query would do?",
      a: "Because each stage owns a definition, and a CTE gives each one a name a reviewer can interrogate. Stage one folds — SUM(amount_cents) per billing, grain stated in a comment. Stage two classifies or ranks — the CASE arms or the RANK window, tie policy decided here and nowhere else. Stage three delivers — the gate, the cut, the display conversion. Nest all of that inline and the reader re-derives the grain on every line; a named CTE ships the definitions in order, and the inevitable follow-up — 'what if the whale line moves from 6148.00?' — becomes a one-line edit to the stage that owns it. On the integration program this is policy, not preference: every fold in a pack carries its stage names, because the review that re-runs a query across two merged legal entities needs to know which stage produced which number.",
      tag: "staging",
    },
    {
      id: "ubs-t15",
      q: "Sell me FILTER (WHERE …) over the CASE-conditional SUM for the close's one-scan census — and name the trap inside it.",
      a: "FILTER counts or sums only the rows that pass its predicate inside one aggregate pass: COUNT(*) FILTER (WHERE status = 'paid'), COUNT(*) FILTER (WHERE status = 'open'), COUNT(*) FILTER (WHERE status = 'void') — the state census ships in a single scan and the columns cross-foot, 21 plus 6 plus 1 equals 28. The conditional-SUM twin computes identical numbers and reads fine; FILTER's edge is that it composes with any aggregate without an ELSE, so the census reads like the memo. The trap is the star: COUNT(*) FILTER counts surviving rows, COUNT(col) FILTER skips NULLs inside the count first — on a LEFT-joined fold where the no-cover rows carry NULL rail columns, the two forms disagree by exactly the watchlist. Say which you mean; on this desk the difference between the two is 15217.00 of receivables.",
      tag: "aggregation",
    },
    {
      id: "ubs-t16",
      q: "Flat 30-day terms, and someone writes the overdue gate as julianday(reference) - julianday(due_on) BETWEEN 1 AND 30. What's the argument about?",
      a: "Boundaries. BETWEEN is closed on both ends, so day 30 lands inside '1 to 30' and day 31 falls out — where the second month's late book starts is a policy the memo states, not a fact the query reveals. The sibling traps: a BETWEEN on dates includes both endpoints, so a window meant to be half-open [issue, due) quietly counts the boundary day itself; and a negative delta means the leg landed before terms — this book pays early, most settlements land a few days ahead of the 30-day line — so an ABS() in the gate would fold early payers into the late book. My rule: half-open intervals written as >= start AND < end, the boundary day named in the memo, and negatives routed to their own arm before any absolute value touches them.",
      tag: "dates",
    },
    {
      id: "ubs-t17",
      q: "The opex trend page must show all fourteen months even where a month is quiet. How do you build that, and where does the join direction matter?",
      a: "A spine is the calendar as a first-class table: distinct 'YYYY-MM' keys LEFT JOINed to the activity fold, so a month with no rows survives as a zero-filled bucket instead of vanishing. The join direction is the whole trick — fold the activity first and join the spine to it as an INNER fold, and the quiet months are deleted, leaving a chart that inventories a cliff that never happened. Here 2024-01 through 2025-02 run 2 to 3 opex lines every month, so the spine looks ceremonial — right up until a cost category goes quiet mid-integration and the page must show the hole, not skip it. The zero-fill lives at the display edge with its reason stated — zero means 'no lines', not 'no data' — because a mid-pipeline COALESCE launders missing months into settled zeros and the synergy deck starts believing them.",
      tag: "dates",
    },
    {
      id: "ubs-t18",
      q: "Pair each split-plan billing's two rail legs without double-counting or mirror rows. Write the join.",
      a: "Three predicates, in this order: the equality — p1.invoice_id = p2.invoice_id — restricts to the same billing; the strict ordering — p1.id < p2.id — both excludes self-pairs and canonicalizes, so (card, wire) and (wire, card) collapse to one oriented pair; and, if the review wants cross-rail pairs only, the method inequality. The verification is arithmetic, not vibes: 27 rail rows fold onto 22 billings, five of which carry two legs — so the pairing must return exactly five pairs, ten rows without the ordering, and 27 squared with no predicate at all. The same shape runs the rails desk's duplicate-charge screen: same natural key, adjacent ids, amounts compared, tiebreak declared. A self-join without the canonicalization is a triangle count wearing a settlement report's name.",
      tag: "joins",
    },
    {
      id: "ubs-t19",
      q: "Define 'booked value' and 'settled value' so the numbers survive the risk committee — and tell me where the trade-date and settlement-date split lives in each.",
      a: "Booked value lives on the trade date: SUM over fee events keyed on created_at — 34833.28 across 103 events, and it includes money no rail has touched. Settled value lives on the settlement date: SUM over rail legs keyed on paid_on — 69612.00 across 27 legs, which fold onto 22 distinct billings because five split plans ride two legs each. Every qualifier is a denominator decision: 27 leg rows, 22 billings, or 28 booked billings including the 6 with no rail at all — three populations, three shares, and quoting any of them without its grain is how a 53.7 percent card mix becomes an argument. The client-balance ledger under both is integer cents, reconciled to the book of record — 181080.00 against 181080.00, delta 0 — and the committee rule is one sentence: the number ships with its grain and its date key in the same breath.",
      tag: "kpi",
    },
    {
      id: "ubs-t20",
      q: "What does 'regulatory count reporting' demand from a SQL query that a business report does not?",
      a: "That the count is a control, not a figure. A control number ships twice from two different queries — the census and its independent re-derivation — and the pack asserts the two agree before it leaves the desk; a single uncorroborated count is a claim. Membership is written down: 'open billings' is the status census (6 / 19609.00), 'never-settled billings' is the no-leg anti-join (6 / 15217.00), and the report names which one it is quoting, because the coincidental equality of the counts is exactly the coincidence a regulator probes. Restatements are versioned by run date, never overwritten. And the trial balance — 181080.00 against 181080.00 — proves symmetry, never correctness: a void-but-drawn 925.00 balances perfectly. Necessary, not sufficient — that sentence is the whole control culture.",
      tag: "kpi",
    },
    {
      id: "ubs-t21",
      q: "The tables here are tiny. Why do interviewers at a bank still probe performance instincts?",
      a: "Because habits scale, and the small db is where they are visible. Sargability: do not wrap the join or filter column in a function when the predicate can be written against the bare column — an index on issued_on is worthless the moment the WHERE computes strftime on it, so the month filter becomes a range on the raw date. Filter early: a WHERE on rail or center before the fold shrinks every downstream aggregate — pipeline order as a performance tool, not just correctness. Project deliberately: SELECT * in an export drags columns nobody reads. And keep the instinct to ask how the plan executes — is this correlated subquery re-running per row, is this window re-scanning — because that is what is actually being graded: the query that is fine at 103 orders dies at 103 million, and a wealth book's ledger is measured in the latter.",
      tag: "performance",
    },
    {
      id: "ubs-t22",
      q: "Two rail rows describe the same settlement. Dedupe them without losing a real split plan.",
      a: "Define the natural key first: billing, rail, amount, paid_on — the fields that together make one settlement event. A real split differs from its sibling on rail (one card hit, one wire hit) and survives any dedupe keyed on the natural key; a true duplicate matches on every field and is noise. Then keep-latest: ROW_NUMBER() OVER (PARTITION BY billing_id, method, amount_cents, paid_on ORDER BY id DESC), keep rn = 1, tiebreak declared. The verification is the delta: count before, count after, and the removed rows printed — on this desk the dedupe's victim list is the finding, not a byproduct. Dedupe on vibes — DISTINCT over a subset of columns — and the five split pairs are one careless predicate away from collapsing into two, which is exactly how a coverage census undercounts its own settled book.",
      tag: "dedupe",
    },
    {
      id: "ubs-t23",
      q: "Fee tiers by quartile: NTILE(4) or an explicit CASE band ladder on a 16-household book?",
      a: "NTILE(4) over 16 households ranked by lifetime value hands each tile exactly four — equal counts whatever the values — which is right when the tier IS a census of the ranking: the top quarter of the book by position. What it is not is value-aware: the 3000.00 concentration line has no reason to fall on a tile boundary, and NTILE has never heard of the fee schedule. The CASE ladder is value-based: every household at or above the line lands in the same tier because the line says so, and the boundary operator is quoted in the query, because the gate decides which books the committee sees at all. PERCENT_RANK is the honest middle ground when someone asks 'where in the book is this household, exactly?' — position as a fraction, not a bucket. Tier by position: NTILE. Tier by business line: CASE. Never let one impersonate the other.",
      tag: "windows",
    },
    {
      id: "ubs-t24",
      q: "The pack ships nightly to stakeholders who re-run your queries. What makes a number in it reproducible?",
      a: "Determinism at every layer where the engine is allowed to improvise. ORDER BY with a tiebreaker: ORDER BY amount_cents DESC, billing_id — without the second key, tied billings print in whatever order the plan found, and two runs can disagree on row order. Declared frames and tie policies: the walk's ROWS frame, the dedupe's keep-latest key, the window's PARTITION — written, not implied. Populations in comments: every fold states its grain (leg rows, billings, households) because a re-runner needs the expected population before they can trust a match. And no positional tricks: GROUP BY 1, LIMIT without ORDER BY — all legal, all fragile. The bar is one sentence and hard to fake: same input, same bytes, every run. A review that cannot be re-run is not a control; it is a hope.",
      tag: "audit",
    },
  ],

  mcqs: [
    {
      id: "ubs-mcq-1",
      prompt: "The morning proof needs the rail census: settlement legs and dollars per rail. Which query delivers it?",
      choices: [
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0,2) FROM payments GROUP BY method",
        "SELECT method, COUNT(amount_cents) FROM payments",
        "SELECT method, SUM(amount_cents) FROM invoices GROUP BY method",
        "SELECT rail, COUNT(*) FROM payments GROUP BY rail",
      ],
      answer: 0,
      why: "Legs live on payments; fold per rail with COUNT(*) for legs and SUM(amount_cents)/100.0 for dollars — card 16 / 37364.00, wire 11 / 32248.00, cross-footing to 69612.00.",
      notes: [
        { choice: 2, why: "Invoices have no method column — the query errors before it lies. Rails are a property of settlement legs, not of billings." },
        { choice: 3, why: "'rail' isn't the column name — the db calls it method. A wrong identifier errors, and the morning proof ships late rather than wrong." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-2",
      prompt: "The pack prints a billing as 614800.00. The billed amount is stored as amount_cents = 614800. What's the correct dollar read?",
      choices: [
        "amount_cents / 100.0, rounded once at the edge",
        "amount_cents / 100",
        "amount_cents, formatted with two decimals",
        "ROUND(amount_cents) / 1000",
      ],
      answer: 0,
      why: "Money is integer cents; divide by 100.0 (float) and round once — 614800 cents reads 6148.00. The /100 integer read truncates halves: a 222950-cent leg prints 2229 instead of 2229.50.",
      notes: [
        { choice: 1, why: "Integer division drops the remainder — every odd-cent leg silently loses its cents. On a book with split-plan legs like 222950, the truncation is visible and the pack is wrong." },
        { choice: 2, why: "Formatting doesn't divide — 614800 formatted is still six hundred fourteen thousand eight hundred dollars. The unit conversion has to happen in the math." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-3",
      prompt: "The cohort card buckets fee billings by issue month ('2024-11', '2025-01', …). Which expression builds the key?",
      choices: [
        "strftime('%Y-%m', issued_on)",
        "strftime('%M', issued_on)",
        "SUBSTR(issued_on, 9, 2)",
        "YEAR(issued_on)",
      ],
      answer: 0,
      why: "strftime('%Y-%m', issued_on) prints the '2024-11' month key the cohort card buckets on — and the keys sort correctly as text across the 2024-01 to 2025-02 window.",
      notes: [
        { choice: 1, why: "%M is MINUTES in SQLite, not month — every billing buckets by wallclock minute 00–59. The classic strftime trap, and the cohort card dissolves into forty buckets." },
        { choice: 3, why: "YEAR() isn't a SQLite function — the query errors. SQLite speaks strftime, not the T-SQL date-name shorthand." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-4",
      prompt: "A billings-to-legs join for the per-center split returns 33 rows on a 28-billing book. The honest per-center billing count is:",
      choices: [
        "COUNT(*) per center — 33 is the book now",
        "COUNT(DISTINCT i.id) per center — five split-plan billings carry two legs each",
        "27 per center — the void billing vanished",
        "Whatever the join returns — counts never need protecting",
      ],
      answer: 1,
      why: "Five split-plan billings ride two legs each, so the join prints 33 rows at leg grain. COUNT(DISTINCT i.id) folds back to billing grain — the grain whose center split must reproduce the 28-billing book.",
      notes: [
        { choice: 0, why: "COUNT(*) counts rail hits — the split then exceeds the whole by exactly the five split plans, and nobody can explain why the parts outrun the book." },
        { choice: 2, why: "The void billing is still a billing on the book — it holds its place in the census whether or not a rail ever hit it. Dropping it conflates the billing book with the settlement feed." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-5",
      prompt: "The board keeps only booking centers whose settled dollars exceed zero. Where does that gate go?",
      choices: [
        "WHERE settled_dollars > 0",
        "HAVING SUM(p.amount_cents) > 0",
        "LIMIT 1",
        "WHERE method IS NOT NULL",
      ],
      answer: 1,
      why: "The gate is on a fold, and folds exist only after GROUP BY — the gate is HAVING, written against the settlement fold itself. WHERE runs before any fold exists.",
      notes: [
        { choice: 0, why: "WHERE can't see SELECT aliases or folds — settled_dollars isn't born yet at row-filter time. It either errors or filters something else entirely." },
        { choice: 2, why: "LIMIT 1 keeps one row, not the qualifying rows — a gate and a cap are different sentences, and this one silently deletes four of the five centers." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-6",
      prompt: "One billing was billed 6148.00 and took a 4000.00 leg. Which read classifies it partial?",
      choices: [
        "WHERE status = 'partial'",
        "Fold legs per billing and compare: SUM(receipts) < billed",
        "WHERE amount_cents = 614800",
        "GROUP BY status and eyeball the open row",
      ],
      answer: 1,
      why: "Coverage is evidence across two tables: fold the billing's settlement legs, compare to billed — 4000.00 against 6148.00 is partial. No such status exists in the book; the state is computed, never stored.",
      notes: [
        { choice: 0, why: "The billing still says open while carrying 4000.00 of settlements — filtering on a status that doesn't exist returns an empty census and the partial never surfaces." },
        { choice: 2, why: "Hardcoding one amount finds one billing today and nothing next quarter. The definition is the comparison — every partial, present and future, falls out of SUM(receipts) < billed." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-7",
      prompt: "The whale board must give every booking center its own top-billing rung 1. What makes that true?",
      choices: [
        "RANK() OVER (PARTITION BY center ORDER BY amount DESC)",
        "RANK() OVER (ORDER BY amount DESC)",
        "ORDER BY center, amount DESC",
        "GROUP BY center with MAX(amount)",
      ],
      answer: 0,
      why: "PARTITION BY restarts the ranking per booking center — each book gets its own rung 1 (EU's is the 6148.00 open partial). Without the partition, one global ladder swallows all five rungs into a single book.",
      notes: [
        { choice: 1, why: "No partition means one global ranking — rung 1 exists once in the whole bank and four centers' advisors read boards with no top of them." },
        { choice: 3, why: "GROUP BY collapses each center to one row — you get the maximum but lose the identity of which billing holds it, and the board needs the billing, not just the number." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-8",
      prompt: "Which read isolates the void billing that still drew a 925.00 rail hit — per center?",
      choices: [
        "WHERE status = 'void', grouped by center",
        "Pair state with evidence: status='void' AND an EXISTS settlement leg, grouped by center",
        "WHERE method = 'void' on the settlement feed",
        "The no-leg anti-join, grouped by center",
      ],
      answer: 1,
      why: "The break is a PAIR — a void claim and a leg that exists. The paired read proves the rail hit should never have cleared and attributes it to the center whose book absorbed the 925.00; status alone shows the void but not the drawn leg.",
      notes: [
        { choice: 2, why: "'void' is a billing state, not a rail — the settlement feed carries card and wire only. The query errors and the break stays invisible in the pack." },
        { choice: 3, why: "The anti-join finds NEVER-settled billings — the opposite evidence. The void-but-drawn row HAS a leg, so the anti-join is structurally blind to it." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-9",
      prompt: "Two sixes again: the open-status census reads 6 billings / 19609.00; the no-leg anti-join reads 6 billings / 15217.00. The 4392.00 gap is:",
      choices: [
        "Rounding drift between cents and dollars",
        "Membership: the open 4000.00-partial has a leg (out of the anti-join), and a paid-status 1756.00 has none (in it)",
        "The anti-join excludes void billings",
        "Nothing — same six billings, same dollars",
      ],
      answer: 1,
      why: "Same count, different sets — the anti-join keys on settlement evidence, not status. The swing is exactly the two honest anomalies in the book, and per center they sit differently, which is why the tie-back rule exists.",
      notes: [
        { choice: 3, why: "If the sets were identical the dollars would tie too — they don't. Equal counts with unequal dollars is the signature of different membership, not of agreement." },
        { choice: 0, why: "Both reads divide by 100.0 the same way. 'Rounding' is the excuse that stops the investigation one step before the actual finding." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-10",
      prompt: "The ledger proves 181080.00 debits against 181080.00 credits, delta 0. What does that proof NOT establish?",
      choices: [
        "That every settlement leg posted to cash",
        "That billings were classified correctly — a void-but-drawn 925.00 still balances",
        "That the cash account's debit fold is 69612.00",
        "That the ledger has 80 entries",
      ],
      answer: 1,
      why: "Double-entry records what happened, including mistakes: the void-but-drawn 925.00 and the paid-unmoved 1756.00 both balance perfectly. The trial balance proves symmetry, never correctness of classification — that's what the anomaly census is for.",
      notes: [
        { choice: 0, why: "It does establish posting symmetry — the cash fold (69612.00 debits) ties to the rail census line for line. The gap is classification, not posting." },
        { choice: 2, why: "The cash account's 69612.00 debit fold is part of what ties. The proof's blind spot is whether each posting was RIGHT, not whether it happened." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-11",
      prompt: "The close stacks the card rail census and the wire rail census into one sheet; the arms are disjoint by method. The honest stack is:",
      choices: [
        "UNION ALL — every row of both arms survives and the counts cross-foot to 27",
        "UNION — it sorts the sheet by rail",
        "UNION — it deduplicates the two censuses, which is what a close wants",
        "INTERSECT — it keeps the rows both censuses share",
      ],
      answer: 0,
      why: "UNION ALL is a raw stack; disjoint arms cannot collide, and 16 card rows plus 11 wire rows cross-foot to 27. UNION runs an implicit DISTINCT — wasted work here, and in a dirty reconciliation the rows it removes are exactly the evidence the cross-foot needed.",
      notes: [
        { choice: 1, why: "Sort order is an implementation detail, not a contract — UNION's guarantee is deduplication, and assuming sort behavior is how cross-engine bugs are born." },
        { choice: 2, why: "Backwards: deduplication is the risk, not the feature. If a card row and a wire row were ever identical, UNION would silently delete the duplicate instead of letting the cross-foot fail." },
        { choice: 3, why: "INTERSECT keeps rows present in BOTH censuses — with disjoint arms that ships an empty sheet." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-12",
      prompt: "The whale ladder runs ORDER BY lifetime spend DESC, LIMIT 1. Two households tie at the top. What ships?",
      choices: [
        "Both tied households",
        "One of them — whichever row the engine's sort happened to finish first",
        "An error — LIMIT requires a tie policy",
        "The second-highest household",
      ],
      answer: 1,
      why: "LIMIT 1 keeps one row after a sort that broke the tie arbitrarily — by rowid or plan luck. The ladder prints one name with no record that a tie existed. A tie-aware shape — RANK with a cut, or an explicit tiebreak column — is the honest ladder.",
      notes: [
        { choice: 0, why: "LIMIT never returns two rows. If the tie matters — and on a wealth ladder it does — the query needs a tie-aware shape, not hope." },
        { choice: 3, why: "The tie is at the TOP; the second-highest household is a third account the query never considered." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-13",
      prompt: "A billings-to-legs LEFT JOIN returns 28 rows; COUNT(p.id) over the fold reads 22. The missing six are:",
      choices: [
        "Void billings — they are excluded from COUNT by definition",
        "The no-cover billings — their NULL rail columns are dropped by COUNT(p.id), kept by COUNT(*)",
        "Split-plan billings — counted twice by COUNT(*)",
        "Nothing — the fold should read 22 everywhere",
      ],
      answer: 1,
      why: "COUNT(column) skips NULLs: the six billings with no rail hit carry NULL leg columns after the LEFT JOIN and vanish from COUNT(p.id), while COUNT(*) keeps every row of the fold — 28. The two counts disagree by exactly the watchlist.",
      notes: [
        { choice: 0, why: "The void billing #11 has a rail hit and survives both counts. The watchlist is about missing legs, not void status." },
        { choice: 2, why: "Split-plan billings have legs — both counts see them. The gap is the no-cover book: 15217.00 that COUNT(p.id) quietly declines to see." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-14",
      prompt: "Concentration: households above the 3000.00 lifetime line carry 63.5% of book value. Which query prints 63.5 and not 100?",
      choices: [
        "100.0 * SUM(CASE WHEN lifetime_spend >= 3000 THEN lifetime_spend ELSE 0 END) / SUM(lifetime_spend) over all 16 households",
        "SELECT 100.0 * SUM(lifetime_spend) / SUM(lifetime_spend) FROM households WHERE lifetime_spend >= 3000",
        "The same conditional fold but with integer 100 instead of 100.0",
        "ROUND(AVG(lifetime_spend), 1) over households above the line",
      ],
      answer: 0,
      why: "The share's denominator is the whole book — 34833.28 across all 16 households — so the threshold must live inside a conditional fold, not in WHERE. Filter first and the denominator shrinks to the numerator's own population; the share prints 100 and says nothing.",
      notes: [
        { choice: 1, why: "Classic denominator collapse: the WHERE removed exactly the rows the denominator needed. Well-defined, useless." },
        { choice: 2, why: "Integer 100 truncates before the division goes real — the share sags below 63.5 even with the population right." },
        { choice: 3, why: "That prints an average ticket for the segment, not a share of book value — the right population wearing the wrong statistic." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-15",
      prompt: "GROUP_CONCAT(paid_on, ' · ') folds a billing's rail dates into one review cell. What does it NOT guarantee?",
      choices: [
        "A separator between values",
        "The order of values inside the string",
        "That every row of the group contributes a value",
        "That the result is TEXT",
      ],
      answer: 1,
      why: "GROUP_CONCAT joins the group's values with the separator, but the order inside the string is not contractual unless the query orders deterministically. A cell reading '2025-02-11 · 2025-01-28' is the same pair folded backwards — same facts, misleading narrative.",
      notes: [
        { choice: 0, why: "The second argument IS the separator; without it the default is a comma. Both are guaranteed." },
        { choice: 2, why: "Every row of the group contributes a value (DISTINCT aside) — that part is contractual." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-16",
      prompt: "One scan, three columns: paid, open and void billings, cross-footing to 28. Which shape is the one-pass census?",
      choices: [
        "Three queries joined by UNION",
        "COUNT(*) FILTER (WHERE status = ...) per state, in one SELECT",
        "GROUP BY status, then pivot in the deck",
        "A correlated subquery per state in the SELECT list",
      ],
      answer: 1,
      why: "FILTER (WHERE …) counts only matching rows inside one aggregate pass — 21, 6, 1 in a single scan, columns side by side, cross-foot 21+6+1=28. The conditional-SUM/CASE ladder is its twin; the single scan is the argument.",
      notes: [
        { choice: 0, why: "UNION stacks rows, not columns — the output is a three-row list, not the one-row census the pack wants, and each arm is a separate scan." },
        { choice: 3, why: "A correlated subquery per column re-scans the table per state — three passes wearing one query's clothes." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-17",
      prompt: "'Fee events above the book-wide average ticket.' A colleague writes WHERE total > AVG(total) OVER (). What happens?",
      choices: [
        "It works — window functions are allowed in WHERE",
        "It errors — windows evaluate after WHERE, so the gate must be a scalar subquery or a staged fold",
        "It silently returns every row",
        "It returns rows above the average of the filtered set",
      ],
      answer: 1,
      why: "WHERE runs before windows exist: a window needs the final row set, so a window call in WHERE is an error. The honest shapes: WHERE total > (SELECT AVG(total) FROM orders) — the book-wide 338.19 — or stage the AVG() OVER () in a derived table and filter outside it.",
      notes: [
        { choice: 0, why: "This is the pipeline-order trap in its purest form: WHERE filters rows before SELECT's windows are computed — the benchmark does not exist yet." },
        { choice: 2, why: "It does not run at all, so 'silently returns everything' flatters it. The failure is loud, which is the kind thing." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-18",
      prompt: "Five split-plan billings ride two rail legs each. Pairing legs of the same billing must return exactly five pairs. Which predicate set does it?",
      choices: [
        "ON p1.invoice_id = p2.invoice_id AND p1.id < p2.id",
        "ON p1.invoice_id = p2.invoice_id",
        "ON p1.invoice_id = p2.invoice_id AND p1.id <> p2.id",
        "No predicate — CROSS JOIN the legs and count",
      ],
      answer: 0,
      why: "Equality restricts to the same billing; the strict ordering both excludes self-pairs and canonicalizes, so (card, wire) and (wire, card) collapse to one oriented pair — five billings, five pairs. The verification is arithmetic: 27 legs fold onto 22 billings, five with two legs.",
      notes: [
        { choice: 1, why: "Equality alone keeps self-pairs and both mirror orders — ten rows for five plans, and the duplicate screen reports phantom pairs." },
        { choice: 2, why: "The <> kills self-pairs but keeps both mirrors — still ten rows. Only the strict ordering canonicalizes." },
        { choice: 3, why: "27 legs squared is 729 rows — a triangle count wearing a settlement report's name." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-19",
      prompt: "The gate is WHERE i.id NOT IN (SELECT invoice_id FROM ...). One NULL row slips into that subquery's result. What ships?",
      choices: [
        "The gate ignores the NULL and returns the honest list",
        "The gate returns every row — the inverse list",
        "The gate returns nothing — one NULL empties the whole NOT IN",
        "An error — NULLs are illegal in IN lists",
      ],
      answer: 2,
      why: "NOT IN evaluates x = NULL per row; UNKNOWN is not TRUE, so no row passes and the gate empties silently — the anomaly queue ships blank and the close signs a clean bill on a dirty book. NOT EXISTS and EXCEPT compare under distinctness semantics where NULL is just a row; those are the gates this desk trusts.",
      notes: [
        { choice: 0, why: "That is the intuition, and it is exactly why the bug ships: nothing errors, the list is just quietly empty." },
        { choice: 1, why: "Backwards — the poisoned gate returns nothing, not everything. Either way the answer is 'rebuild it as NOT EXISTS'." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-20",
      prompt: "The trend page must show booked value and settled cash for the same month. Which keying is honest?",
      choices: [
        "Both curves keyed on the billing's issue month",
        "Booked curve keyed on the fee event's created_at; cash curve keyed on the leg's paid_on — two date keys, both named",
        "Both curves keyed on paid_on — cash is what counts",
        "Booked keyed on paid_on, cash keyed on created_at — symmetric",
      ],
      answer: 1,
      why: "Booked value lives on the trade date (created_at: 103 events / 34833.28); settled value lives on the settlement date (paid_on: 27 legs / 69612.00), and the 28.4-day average gap between them is the book's working capital. Conflating the keys double-counts some months and hollows others.",
      notes: [
        { choice: 0, why: "The issue date is a third clock — the billing's, not the event's and not the cash's. Three curves, three keys; collapsing them is how a month gains money it never booked." },
        { choice: 2, why: "Keying the booked curve on paid_on deletes the 15217.00 that never settled — the curve stops describing the book and starts describing the cash." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-21",
      prompt: "Two households tie in lifetime value on the ladder. RANK() and ROW_NUMBER() return, respectively:",
      choices: [
        "1, 2 and 1, 2 — identical on ties",
        "1, 1 and 1, 2 — RANK shares the rung, ROW_NUMBER breaks it arbitrarily",
        "1, 1 and 2, 2",
        "1, 3 and 1, 2",
      ],
      answer: 1,
      why: "RANK hands both tied rows rung 1 and skips to 3 next; ROW_NUMBER deals 1 and 2 in whatever order the sort found. On a fee-tier ladder the difference is whether the tie is published — RANK's shared rung is the honest print, with a declared tiebreak when the deck needs one row.",
      notes: [
        { choice: 0, why: "That is the mistake that ships quietly: ROW_NUMBER looks like RANK until a tie appears, and then two households with the same value hold different tiers." },
        { choice: 3, why: "That first shape is DENSE_RANK's signature — shared rungs WITHOUT the skip (1, 1, 2). Worth knowing all three out loud." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-22",
      prompt: "The walk's first month prints a NULL delta. The deck wants a zero there. What's the defensible move?",
      choices: [
        "COALESCE the delta to 0 in the query — zeros are friendlier",
        "Leave the NULL, caption it 'baseline month — no prior'; COALESCE only at the display edge, with the reason stated",
        "Drop the first row from the result",
        "Backfill the first delta with the second row's value",
      ],
      answer: 1,
      why: "The NULL is information: 'no predecessor exists', which is different from 'no change'. A mid-pipeline COALESCE launders unknown into zero and the trend's first step lies. Display-edge formatting with a stated reason keeps the fold honest and the deck readable.",
      notes: [
        { choice: 0, why: "A zero first delta reads as 'flat opening month' — a claim the data never made. This is how baselines get invented." },
        { choice: 2, why: "Dropping the row hides the baseline itself — the deck loses the month every later delta is measured against." },
        { choice: 3, why: "Copying a neighbor's value fabricates a fact. Restatements and backfills are labeled, never silent." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-23",
      prompt: "The month filter WHERE strftime('%Y-%m', issued_on) = '2024-10' runs slowly at scale. The sargable rewrite is:",
      choices: [
        "issued_on >= '2024-10-01' AND issued_on < '2024-11-01'",
        "WHERE CAST(issued_on AS TEXT) LIKE '2024-10%'",
        "WHERE strftime('%Y%m', issued_on) = '202410'",
        "Add an index on strftime('%Y-%m', issued_on)",
      ],
      answer: 0,
      why: "Wrapping the filtered column in a function defeats any index on it — the engine computes strftime per row. A range predicate on the bare column (>= start, < next month, half-open) uses the index and says the same thing, with the boundary handled explicitly.",
      notes: [
        { choice: 1, why: "LIKE on a computed CAST is the same per-row function call wearing a different coat — still non-sargable." },
        { choice: 3, why: "An expression index on strftime re-teaches the planner what the range predicate gives for free — and ordinary indexes on issued_on stay useless under the function wrap." },
      ],
      difficulty: "easy",
    },
    {
      id: "ubs-mcq-24",
      prompt: "NTILE(4) over 16 households ranked by lifetime value gives:",
      choices: [
        "Four tiers whose boundaries follow the 3000.00 concentration line",
        "Exactly four households per tile, whatever the values say",
        "Sixteen tiles of one household",
        "An error — NTILE needs a PARTITION BY",
      ],
      answer: 1,
      why: "NTILE is positional: it deals ranked rows into equal-count tiles — 4/4/4/4 on a 16-household book. It has never heard of the 3000.00 line; if the tier must respect a business threshold, the CASE band ladder is the tool, with the boundary operator quoted.",
      notes: [
        { choice: 0, why: "That is the CASE ladder's job. NTILE can put two households an inch apart in different tiles, or the reverse — position, not value, decides." },
        { choice: 2, why: "NTILE(n) makes n tiles; the argument is 4. Sixteen tiles is NTILE(16), and the tier definition died on the way." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-25",
      prompt: "CASE WHEN status = 'paid' THEN 'settled' END labels the census — and the void row prints NULL. Why?",
      choices: [
        "The void row is excluded from the query",
        "No ELSE arm: CASE defaults to NULL when no WHEN matches — 'other' must be written, not assumed",
        "NULL propagates from the status column",
        "CASE cannot compare TEXT values",
      ],
      answer: 1,
      why: "A CASE without ELSE yields NULL for every row that matches no WHEN — the void billing falls through and prints NULL, which downstream decks read as 'missing data' rather than 'unclassified'. Exhaustive arms with a deliberate ELSE are the census discipline here.",
      notes: [
        { choice: 0, why: "The row is very much in the result — with a NULL label. Exclusion and NULL-labeling are different defects." },
        { choice: 2, why: "The status column is 'void', a perfectly good TEXT value; the NULL is manufactured by the missing ELSE, not inherited." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-26",
      prompt: "A colleague buckets the settlement trend with strftime('%Y', paid_on). The chart shows two bars. What actually happened?",
      choices: [
        "The feed only has two years of legs",
        "The '%Y' key buckets by year alone — '2024' folds twelve months into one bar and the monthly trend dissolves",
        "GROUP BY collapsed duplicates",
        "strftime requires a GROUP BY per year",
      ],
      answer: 1,
      why: "'%Y' prints the four-digit year; GROUP BY it and 2024's legs land in one bucket. The month key is '%Y-%m' — the same family of trap as '%M', which is minutes, not months. Keys are definitions: the trend is only as honest as the format string.",
      notes: [
        { choice: 0, why: "The feed spans 2024-01 to 2025-02 — the two bars are the two years, honestly bucketed at the wrong grain for a monthly trend." },
        { choice: 2, why: "GROUP BY did its job — on the key it was given. The defect is the format string, not the aggregation." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-27",
      prompt: "The cash walk — SUM(amount_cents) OVER (ORDER BY paid_on) — jumps two legs at once where two share a date. The leg-by-leg frame is:",
      choices: [
        "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "No frame — the default already walks row by row",
        "ORDER BY paid_on, id outside the window",
      ],
      answer: 0,
      why: "The default frame with ORDER BY is RANGE, and RANGE folds peers — rows sharing the sort key step together. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks entry by entry even where dates tie. The frame is a definition: peer-total or per-entry position — say which one the committee is getting.",
      notes: [
        { choice: 1, why: "That is the default written out — same peer-folding behavior, same two-leg jump." },
        { choice: 3, why: "The outside ORDER BY arranges the print; the frame still folds peers inside the window. The fix lives in the OVER clause." },
      ],
      difficulty: "medium",
    },
    {
      id: "ubs-mcq-28",
      prompt: "Two runs of the pack return the whale board's rows in different order. Same data, same query. The most likely cause is:",
      choices: [
        "The database is nondeterministic",
        "ORDER BY amount_cents DESC with tied amounts and no tiebreaker — the engine deals ties in plan order, which can change between runs",
        "Floating-point cents drifted between runs",
        "The LIMIT clause reordered rows",
      ],
      answer: 1,
      why: "Ties plus an underspecified ORDER BY is the classic nondeterminism: tied rows may legally return in any order, and plan changes flip it. The fix is a deterministic tiebreak — ORDER BY amount_cents DESC, billing_id — plus declared frames and no positional GROUP BY. Same input, same bytes, every run.",
      notes: [
        { choice: 0, why: "The engine is deterministic given the same plan; the query underspecified the order. Blaming the db stops the fix one step early." },
        { choice: 2, why: "Money is integer cents — there is no float drift to drift. That excuse is how the real defect survives review." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-29",
      prompt: "The no-cover watchlist LEFT JOINs billings to legs, then adds WHERE p.method = 'wire' to focus the read. What ships?",
      choices: [
        "The watchlist, wire legs only",
        "An empty watchlist — the WHERE on the right table converts the LEFT JOIN into an INNER join and the six no-cover billings vanish",
        "The watchlist with NULL rail columns preserved",
        "An error — WHERE cannot reference the right table of a LEFT JOIN",
      ],
      answer: 1,
      why: "A predicate on the right table in WHERE can only be satisfied by rows that matched — the NULL-extended no-cover rows fail it, the LEFT JOIN silently becomes an INNER join, and 15217.00 of receivables leave the read. Rail filters belong in the ON clause, or the inner semantics are accepted knowingly and named.",
      notes: [
        { choice: 0, why: "There are no wire legs on a no-cover billing — the rows the watchlist exists for fail the filter first." },
        { choice: 2, why: "The NULL-extended rows never survive a WHERE on the right table — that is the mechanism of the vanishing." },
        { choice: 3, why: "It is legal SQL that runs fine and returns the wrong book — the worst kind of bug." },
      ],
      difficulty: "hard",
    },
    {
      id: "ubs-mcq-30",
      prompt: "A wire leg for a December billing lands in February, after the close published. The defensible treatment is:",
      choices: [
        "Insert it into December's fold — the cash belongs there",
        "Post into the current open period with the as-of date carried, and re-run December only as a labeled restatement if it materially moves a closed bucket",
        "Delete the leg — late data is bad data",
        "Average it across both months",
      ],
      answer: 1,
      why: "Closed buckets are immutable; a silent rewrite makes every previously printed number untrustworthy. Late legs post forward with their as-of date, and material impacts re-run as labeled restatements with the delta shipped in the pack. A trend that cannot say which version of the truth it is showing is a screenshot, not a control.",
      notes: [
        { choice: 0, why: "That is the silent rewrite: December's settled fold changes under everyone who already read it. Restatement is a feature; stealth is the bug." },
        { choice: 2, why: "Deleting evidence to protect a close is the one move this desk never makes — the anomaly census exists to route exactly this row." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ubs-1",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The cross-rail settlement fold",
      brief:
        "UBS-flavored memo on the storefront db (payments = settlement legs, customers = client households, regions = booking centers): the integration close wants the settlement read per booking center and per rail — legs, distinct billings touched and settled dollars — so the center split can be cross-footed against the rail census before the pack ships. Probed facts: the two rails cleared 27 legs for 69612.00 — card 16 legs / 37364.00, wire 11 / 32248.00 — and the cash book's debit fold reads the same 69612.00. The rule: *legs are leg grain, billings are billing grain, and both columns must say which one they are.*",
      ask: "Return the fold: booking center, rail, settlement legs, distinct billings touched, settled dollars (2dp) — centers A-to-Z, biggest rail first within each.",
      template:
        "SELECT c.{1} AS booking_center,\n       p.{2} AS rail,\n       COUNT(*) AS settlement_legs,\n       COUNT(DISTINCT p.invoice_id) AS billings_touched,\n       ROUND(SUM(p.{3}) / {4}, 2) AS settled_dollars\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nJOIN customers c ON c.id = i.customer_id\nGROUP BY booking_center, rail\nORDER BY booking_center, settled_dollars {5};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the booking-center grouping key",
          why: "c.region is the booking center — the fold's grouping axis and the join's payload. Any other customer column groups the book at the wrong grain: a city where a center belongs, a name where a market belongs.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the rail grouping key",
          why: "p.method is the rail — card and wire, the two settlement paths the census names. paid_on would re-fold the book per payment date and shred the two-rail census into a calendar.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the settled-money column",
          why: "Settled dollars are the legs' own amounts — SUM(p.amount_cents), integer cents. The billing's amount column doesn't exist on this table, and folding leg ids would sum primary keys with a straight face.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Money is integer cents; the dollar read is amount_cents / 100.0 — float division, rounded once. The integer 100 truncates every odd-cent leg: the 2361.50 wire leg prints 2361 and the cross-foot misses the cash book by half-dollars.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the within-center order",
          why: "DESC headlines each center's bigger rail — the pack reads exposure top-down. ASC opens every center on its smaller rail and the hour is spent reading upside-down books.",
        },
      ],
      distractors: ["city", "paid_on", "i.amount_cents", "100", "ASC"],
      walkthrough:
        "A cross-rail fold is a two-key GROUP BY with the unit conversion at the edge. The joins are grain-safe: each leg points at exactly one billing and one household, so no fan-out here — 27 legs in, 27 rows out, folded per center and rail into five rows. COUNT(*) is the leg census; COUNT(DISTINCT p.invoice_id) is the billing census, and the two disagree exactly where split plans live (a billing with two legs counts once); SUM(p.amount_cents)/100.0 — rounded once — is the dollars. The result cross-foots: EU card 8 legs / 19124.50 and wire 6 / 18136.50, APAC wire 5 / 14111.50 and card 3 / 6501.50, US card 5 / 11738.00 — 27 legs, 69612.00, tying the cash book's debit fold line for line, with the US book card-only (its wire rail prints nothing — absence, not zero, and no LATAM rows at all because that book holds no settled billings). The distractors fail honestly: a city or payment-date grouping key shreds the census into streets and days, folding the billing-side amount column errors (it isn't on the leg table), the integer 100 truncates odd-cent legs until the cross-foot misses, and ASC turns every center's rail order upside down. The habit being graded: name the grain in the column alias — legs are legs, billings are billings, and the pack says which.",
    },
    {
      id: "cs-ubs-2",
      tier: "hard",
      topic: "t5",
      universe: "fraud",
      title: "The whale board, per center",
      brief:
        "UBS-flavored memo on the storefront db (invoices = client fee billings, customers = households, regions = booking centers): the integration risk committee wants the concentration board — every fee billing ranked within its own booking center — to see where single-mandate exposure sits. Probed facts: the book's biggest billing is the **6148.00** open partial in the EU book; EU's next rungs are 5614.00, 5284.00, 4860.00 and 4723.00 — four of the five being split-plan billings — while the US book tops at **4937.00** and APAC at 4459.00. The committee reads rungs, not averages: *concentration hides inside means.*",
      ask: "Return the board: booking center, billing id, billed dollars (2dp), rung within center — centers A-to-Z, best rung first.",
      template:
        "SELECT c.{1} AS booking_center,\n       i.id AS billing_id,\n       ROUND(i.{2} / {3}, 2) AS billed,\n       RANK() OVER (PARTITION BY c.region ORDER BY i.amount_cents {4}) AS rung\nFROM invoices i\nJOIN customers c ON c.id = i.{5}\nORDER BY booking_center, rung;",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the center label",
          why: "c.region names the booking center each rung belongs to. The city column would relabel the board with streets — real values, wrong grain, and the committee's center-by-center reading collapses.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the billed column",
          why: "Exposure is the billing's own amount — amount_cents, integer cents. The id column would rank billings by primary key and print the board's dollar column as row numbers divided by a hundred.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "The dollar read is amount_cents / 100.0, rounded once — 614800 cents prints 6148.00. The wrong divisor moves the decimal: divide by 1000 and the committee reads a book a tenth its size.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rung direction",
          why: "Rungs count exposure down — rung 1 is the biggest billing in the book. ASC hands rung 1 to the smallest billing in every center and the board ranks in exactly the wrong direction.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the join key",
          why: "Each billing points at its household's primary key — i.customer_id = c.id. Joining on region compares integers to text and matches nothing; joining on id pairs billings with whichever household shares their row number.",
        },
      ],
      distractors: ["city", "id", "1000", "ASC"],
      walkthrough:
        "A whale board is a ranking window that must restart per book. The join attaches each billing to its household (28 billings, no fan-out — one billing, one customer); the window ranks by amount_cents DESC inside PARTITION BY region, so every booking center owns a rung 1; ROUND(amount_cents/100.0, 2) converts once at the edge. Read the board and the integration story appears: EU's rung 1 is the **6148.00 open partial** — the book's largest single billing is also its least settled — and EU's rungs 2 through 5 (5614.00, 5284.00, 4860.00, 4723.00) are split-plan billings, the reason leg counts and billing counts disagree. The US book tops at **4937.00**, APAC at 4459.00, and the outer ORDER BY center, rung makes the board read center by center instead of one global ladder where EU owns the top five rungs outright. The distractors fail honestly: the city label re-titles every row at street grain, the id column ranks by primary key, the wrong divisor slides the decimal until the dollar column reads a book a tenth its size, and ASC crowns every center's smallest billing as its whale. The habit being graded: the partition is the entity boundary — a wealth house never ranks one center's whales against another's minnows.",
    },
    {
      id: "cs-ubs-3",
      tier: "medium",
      topic: "s6",
      universe: "refund-audit",
      title: "The state-versus-evidence census",
      brief:
        "UBS integration-audit memo on the storefront db (invoices = client fee billings, payments = settlement legs): the data-quality board's standing {rose:exception census} pairs each billing's **status column — a claim** — with its rail fold — evidence — and files the disagreements. Probed facts: one void billing that still drew its **925.00** rail hit, one paid-status billing at **1756.00** with no leg at all, against a coverage backdrop of 21 exact (65612.00), 1 partial (4000.00 of 6148.00) and 6 no-leg billings (15217.00). The classes are computed in the query, never stored, and both break classes print even at size one — *a census that hides a single-member cohort is a screenshot, not a control.*",
      ask: "Return the census: exception class, billing count, settled and billed dollars (2dp) — biggest class first, break classes included.",
      template:
        "SELECT CASE\n         WHEN i.status = 'void' AND folded.legs IS NOT NULL THEN {1}\n         WHEN i.status = 'paid' AND folded.legs IS NULL THEN {2}\n         ELSE 'clean'\n       END AS exception_class,\n       COUNT(*) AS billings,\n       ROUND(COALESCE(SUM(folded.settled_cents), {3}) / 100.0, 2) AS settled,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed\nFROM invoices i\nLEFT JOIN (\n  SELECT invoice_id, COUNT(*) AS legs, SUM(amount_cents) AS settled_cents\n  FROM payments\n  GROUP BY invoice_id\n) folded ON folded.invoice_id = i.id\nGROUP BY {4}\nORDER BY billings DESC;",
      slots: [
        {
          answer: "'drawn-void'",
          kind: "keyword",
          label: "the void-but-cleared label",
          why: "The first arm names the billing whose void claim still drew a rail hit — the 925.00 break the rail desk owns. Arm order is the definition: void-with-legs must file before any coverage arm can call it exact.",
        },
        {
          answer: "'unmoved'",
          kind: "keyword",
          label: "the paid-with-no-rail label",
          why: "The second arm names the paid-status billing with no settlement leg — the 1756.00 break. The LEFT JOIN hands its fold columns as NULL, and IS NULL is the only honest test of a no-leg billing.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the settled floor",
          why: "COALESCE(SUM(folded.settled_cents), 0) prices the unmoved class's settled cell at 0.00 — and that 0 is verifiably in the result, the unmoved class's settled cell. Without the floor, SUM over NULL legs reads NULL and the census loses its column.",
        },
        {
          answer: "exception_class",
          kind: "keyword",
          label: "the census grain",
          why: "GROUP BY exception_class — the alias of the CASE itself — collapses the 28 classified billings into their classes. GROUP BY an aggregate like billings is refused outright; GROUP BY a row-level column never forms the three cohorts.",
        },
      ],
      distractors: ["billings", "folded.invoice_id", "i.amount_cents", "10.0"],
      walkthrough:
        "An exception census stages evidence, then classifies. The stage: payments folded per billing — COUNT(*) as legs, SUM(amount_cents) as settled_cents — 22 billings carry legs. The join is LEFT, so the no-leg billings survive with NULL fold columns, and the arms read in order: void with legs files drawn-void — the **925.00** draw; paid with no legs files unmoved — the **1756.00**; everything else files clean, 26 billings whose settled fold reads 68687.00 against 84296.00 billed. COALESCE(..., 0) prices the unmoved class's settled cell at **0.00** instead of NULL — the floor is the number the board reads, and the settled column cross-foots to the rail census: 925.00 + 0.00 + 68687.00 = the 69612.00 cash fold. The result ships biggest class first with both single-member break classes printed — the drawn-void at 925.00 billed and 925.00 settled, the unmoved at 1756.00 billed and 0.00 settled. The distractors fail honestly: `billings` in the census grain is an aggregate in GROUP BY — refused outright; `folded.invoice_id` as the join key pairs every billing with every fold, the tautology that dissolves the census; `i.amount_cents` as the floor prices the unmoved class's settled cell at 1756.00 — its own booking masquerading as settlement, a break repriced into a non-event; `10.0` as the floor shifts the cell a dime and the cross-foot dies loudly.",
    },
    {
      id: "cs-ubs-4",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The opex walk and the peak flag",
      brief:
        "The {violet:integration synergy deck} lives on the opex walk, and the walk is deltas, not levels: 36 expense lines bucket into 14 months on `STRFTIME('%Y-%m')`, every month running between 1440.00 and 1974.00 — except the 2024-08 integration push at **3210.00**, which hands back -1665.00 the month after. Probed backdrop: Rent is **16800.00** across 14 lines of the 25416.00 book. LAG hands each month its predecessor and the first row prints NULL *by design* — a delta column with no NULL is hiding its baseline — while the tempo flag marks spend at or above the 3210.00 peak line.",
      ask: "Return the walk: month, spend (2dp), prior-month spend, month-over-month delta, and the tempo flag at or above 3210.00 — peak month first, then calendar order.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME('%Y-%m', spent_on) AS month_key,\n         SUM(amount_cents) / 100.0 AS spend\n  FROM expenses\n  GROUP BY month_key\n)\nSELECT month_key,\n       ROUND(spend, 2) AS spend,\n       ROUND({1}(spend) OVER ({2} {3}), 2) AS prior_spend,\n       ROUND(spend - LAG(spend) OVER (ORDER BY month_key), 2) AS delta,\n       CASE WHEN spend >= {4} THEN {5} ELSE 'run-rate' END AS tempo\nFROM monthly\nORDER BY {6}, month_key;",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the walk's direction",
          why: "LAG carries each month its predecessor — prior spend sits to the left of the delta. LEAD would point the walk backwards: every month inheriting its successor, with the last month reading NULL instead of the first.",
        },
        {
          answer: "ORDER BY",
          kind: "keyword",
          label: "the window's ordering clause",
          why: "A movement window must know the calendar before it can name a predecessor — LAG(spend) OVER (ORDER BY ...) is the whole mechanic. PARTITION BY here gives every month a one-row window, so every prior reads NULL.",
        },
        {
          answer: "month_key",
          kind: "keyword",
          label: "the window's calendar key",
          why: "The window orders on month_key, the staged 'YYYY-MM' bucket — year-first, sorts as a calendar. Ordering by spend instead sorts neighbors by size, so 'prior month' silently means 'next-smaller month'.",
        },
        {
          answer: "3210.00",
          kind: "number",
          label: "the peak line",
          why: "The flag fires at spend >= 3210.00 — and 3210.00 is verifiably in the result: the 2024-08 spend cell. The next-best month is 1974.00, so the line keeps exactly one month; 1974.00 would flag two, 3211.00 none.",
        },
        {
          answer: "'peak'",
          kind: "keyword",
          label: "the flagged tempo's label",
          why: "The flag's label is what the deck colors: one month above the line, everything else run-rate. An unquoted token errors, and a different label breaks every reader that filters the walk for the flagged row.",
        },
        {
          answer: "tempo",
          kind: "keyword",
          label: "the pack's leading sort",
          why: "ORDER BY tempo, month_key leads with the flagged peak and trails the run-rate months in calendar order — the deck reads exception first. Ordering by month alone buries the spike mid-pack where nobody budgets against it.",
        },
      ],
      distractors: ["LEAD", "PARTITION BY", "spend", "spent_on"],
      walkthrough:
        "A movement read stages its fold before it windows it. The CTE folds 36 opex lines into 14 month buckets — SUM(amount_cents)/100.0, dollars at the edge — and the outer SELECT windows the folded spend: LAG(spend) OVER (ORDER BY month_key) hands each month its predecessor, the delta subtracts inside the same calendar order, and 2024-01 honestly prints NULL/NULL. The story the walk tells: 2024-08 steps to **3210.00** over 1794.00 — delta **+1416.00**, the integration push — and 2024-09 hands back **-1665.00**; every other month stays run-rate, bounded by 1440.00 and 1974.00. The tempo flag fires exactly once: spend >= **3210.00** lands on the peak and nothing else clears the line, and ORDER BY tempo, month_key puts that exception at the top of the pack. The distractors fail honestly: LEAD points the walk backwards, so the last month reads NULL and every delta flips sign; PARTITION BY month_key gives every month a one-row window, killing every prior and every delta; spend as the window key sorts neighbors by size — plausible numbers, wrong calendar, 'prior month' meaning next-smaller month; spent_on is never staged in the CTE and errors loudly. The habit being graded: stage the fold, then window it — a delta column that never shows a first-row NULL is hiding its baseline.",
    },
    {
      id: "cs-ubs-5",
      tier: "easy",
      topic: "x3",
      universe: "growth",
      title: "The rail stack and the interbank bar",
      brief:
        "The {emerald:cash-curve} pack ships one stack: the two settlement rails, then ONE grand row labeled **TOTAL**, because the close must prove detail and identity in the same breath. Probed facts: the {emerald:card} rail — the house debit rail — cleared **16 legs for 37364.00**; the {sky:wire} rail — interbank — **11 legs for 32248.00**; cross-foot 27 legs / 69612.00, the cash book's debit fold. The pacing bar is the house rail's own 37364.00 take: lines at or above it flag `at-bar`, and the wire rail rides below it. The stack is UNION ALL, not UNION — the TOTAL row must survive, and UNION's dedupe is exactly the kind of help this desk refuses.",
      ask: "Return the stack: rail, legs, settled dollars (2dp), bar flag — grand row labeled TOTAL, closing the stack, not opening it.",
      template:
        "SELECT method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS settled,\n       CASE WHEN SUM(amount_cents) / 100.0 >= {1} THEN {2} ELSE 'below-bar' END AS bar\nFROM payments\nGROUP BY method\nUNION ALL\nSELECT {3} AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS settled,\n       'book-total' AS bar\nFROM payments\nORDER BY rail {4};",
      slots: [
        {
          answer: "37364.00",
          kind: "number",
          label: "the pacing bar",
          why: "The bar is the house rail's own take — 37364.00, verifiably in the result as the card rail's settled cell. Card clears it exactly (the >= boundary case), wire rides below at 32248.00, and any other line moves a flag.",
        },
        {
          answer: "'at-bar'",
          kind: "keyword",
          label: "the flagged line's label",
          why: "The label marks the rail that carries the load — quoted, or the engine reads a column name and errors. A different label breaks every reader that filters the stack for the flagged line.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The literal 'TOTAL' names the appended identity row so the close reads detail, then proof. Unquoted, TOTAL parses as a column reference and errors; a different label breaks every reader that greps for the grand row.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the grand-row-last direction",
          why: "Uppercase 'TOTAL' sorts before lowercase rail names, so DESC closes the stack with the identity row after the detail. ASC opens the pack with the summary — the answer read before its evidence.",
        },
      ],
      distractors: ["COUNT(*)", "wire", "method", "ASC"],
      walkthrough:
        "Two folds, one stack. Arm one groups 27 settlement legs by rail: card **16 / 37364.00**, wire **11 / 32248.00**, dollars via SUM(amount_cents)/100.0 rounded once. Arm two folds the same table whole — **27 / 69612.00** — and labels itself 'TOTAL', the cross-foot row whose cells must equal the column sums of the detail above; they do by construction, which is what makes the stack its own audit evidence against the cash book's debit fold. UNION ALL is load-bearing — the arms are different populations, and UNION's dedupe could eat a detail row that happens to equal a total. ORDER BY rail DESC leans on collation: uppercase 'TOTAL' sorts before lowercase rail names, so descending lands wire, card, then the grand row last — detail, then identity. The bar fires once: card at **37364.00** clears the 37364.00 line exactly, the >= boundary case the reviewer argues on purpose; wire rides below at 32248.00; the grand row is labeled 'book-total' by construction — a class of one, on purpose. The distractors fail honestly: COUNT(*) as the bar compares dollars to leg counts, both rails clear it and the flag stops discriminating; 'wire' as the grand-row label breaks every reader that greps for TOTAL; method in the grand arm is a bare column beside aggregates — one arbitrary rail name where the identity belongs; ASC opens the pack with the summary instead of closing with it.",
    },
    {
      id: "cs-ubs-6",
      tier: "hard",
      topic: "q6",
      universe: "funnel",
      title: "The settlement clock, staged",
      brief:
        "The receivable lifecycle is a {violet:funnel} — mandate booked, fee billed, first rail hit — and the stage the collections desk manages is bill-to-settle. The clock is `JULIANDAY(first leg) - JULIANDAY(issued_on)` on settled billings only: the paid-status claim is not enough (the **1756.00** paid-unmoved billing has no leg to time) and the open partial's early **4000.00** leg would flatter the average. Probed tempo: **20** settled billings, **28.4**-day average, fastest **13**, slowest **84**, against flat 30-day terms. The control row ships only while the book-wide average still holds at or above 28.4 — *a control that can't fail is a decoration.*",
      ask: "Return the control row: settled billings, average clock days (1dp), fastest and slowest — shipped only while the average holds at or above 28.4.",
      template:
        "WITH first_leg AS (\n  SELECT invoice_id, MIN(paid_on) AS first_paid\n  FROM payments\n  GROUP BY {1}\n),\nclock AS (\n  SELECT i.id AS billing_id,\n         JULIANDAY(fl.first_paid) - JULIANDAY(i.{2}) AS days\n  FROM invoices i\n  JOIN first_leg fl ON fl.invoice_id = i.id\n  WHERE i.status = 'paid'\n)\nSELECT COUNT(*) AS settled_billings,\n       ROUND(AVG(days), 1) AS avg_days,\n       {3}(days) AS fastest,\n       MAX(days) AS slowest\nFROM clock\nHAVING AVG(days) >= {4};",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the staging fold's key",
          why: "first_leg folds MIN(paid_on) per invoice_id — billing grain, one first-leg row per settled billing. Group by paid_on and the fold runs on calendar dates; group by the leg id and every leg becomes its own billing.",
        },
        {
          answer: "issued_on",
          kind: "keyword",
          label: "the clock's start anchor",
          why: "The clock runs from issued_on — the day the fee was billed. due_on measures from the terms date instead, shifting every delta by the flat 30 days and reporting a book that always pays early.",
        },
        {
          answer: "MIN",
          kind: "keyword",
          label: "the fastest fold",
          why: "MIN(days) is the fastest settlement — 13, the probed floor. MAX would print 84 as the fastest and 13 as the slowest: a control row that contradicts the clock it claims to prove.",
        },
        {
          answer: "28.4",
          kind: "number",
          label: "the control gate",
          why: "HAVING AVG(days) >= 28.4 passes exactly on the line — and 28.4 is verifiably in the result, the avg_days cell. Half a day of drift (28.5) empties the row: the gate is the exactly-on-the-line case the control exists to catch.",
        },
      ],
      distractors: ["MAX", "due_on", "paid_on", "28.5"],
      walkthrough:
        "A staged clock, twice over. `first_leg` folds each billing's earliest rail hit — MIN(paid_on) grouped per invoice_id — and `clock` juliandays the delta from issued_on; the WHERE keeps status = 'paid', the honest denominator: 22 billings carry legs and 21 claim paid, but only the 20 in both sets are settled-and-timed, exactly the population the probed tempo quotes. The outer fold reads **20 / 28.4 / 13 / 84**, and the HAVING is the control: AVG(days) >= **28.4** passes exactly on the line, so any drift — a late leg, a restated date — empties the row instead of shipping a stale tempo. The distractors fail honestly: MAX as the fastest fold runs the clock backwards, printing fastest 84 and slowest 13; due_on as the anchor measures from the terms date, shifting every delta by the flat 30 days, dropping the average to -1.6 and emptying the gate; paid_on as the staging key groups legs by calendar date, the invoice_id goes arbitrary, and the join times the wrong billings; 28.5 as the gate is half a day of drift — the exactly-on-the-line design means the row ships or dies, never approximates. The habit being graded: stage before you fold, anchor on the billing date, and let a control that can fail be the proof.",
    },
  ],

  problems: [
    { slug: "settlement-fails-aging", why: "T+2 aging buckets over unsettled items: the no-leg watch (6 billings / 15217.00) aged against flat 30-day terms — the integration close's collections ladder in textbook shape." },
    { slug: "journal-gap-detection", why: "Sequence gaps in a journal: the ledger's 80 entries audited for missing post dates — the integration-era control that catches feeds that dropped a day." },
    { slug: "ar-aging-schedule", why: "AR aging by bucket: the fee book's open balances aged per booking center — the collections read the wealth service desks live in." },
    { slug: "delinquency-roll-rates", why: "State-to-state roll rates: how billings move open-to-partial-to-settled between months — the movement read behind the coverage census." },
    { slug: "wash-trade-detection", why: "Self-offsetting pair screens: split-plan legs that mirror each other across rails — the rails desk's screen for round-tripped value." },
    { slug: "max-drawdown", why: "Running-maximum arithmetic: the deepest peak-to-trough on a balance fold — exposure language the risk committee already speaks." },
    { slug: "beta-benchmark", why: "Series-versus-benchmark covariance: each center's fee curve against the group's — the relative-read drill behind per-entity benchmarking." },
    { slug: "split-adjusted-position", why: "Normalizing quantities across corporate actions: the split-plan billing read in miniature — one economic event, several recorded legs." },
    { slug: "realized-pnl-average-cost", why: "Layer-consumption math over a fill series: partial receipts consuming billed exposure — the 4000.00-of-6148.00 story at portfolio grain." },
    { slug: "dividend-income-calendar", why: "Income events on a calendar spine: recurring fee cycles per household — the advisory-billing cadence read." },
    { slug: "risk-based-pricing", why: "Band joins between exposure and price tables: fee schedules that step by band — the billing-cycle engine as a join problem." },
    { slug: "daily-balance-interest", why: "Interest over a date spine: day-weighted balance math on the cash book — where the 69612.00 fold earns its keep." },
    { slug: "fx-exposure-report", why: "Latest-rate joins normalizing currencies: the cross-entity read where Zurich and Singapore books must land in one reporting currency." },
    { slug: "prepayment-detection", why: "Early-settlement flags against a schedule: billings settled before day 30 of flat terms — the 13-day fastest settlement found mechanically." },
    { slug: "chargeback-rate-ranking", why: "Rate gates with HAVING and ranking: anomaly rates per center ranked for review — the anomaly census's companion board." },
    { slug: "second-most-recent-activity", why: "Argmax with rank: each household's second-latest fee event — the advisor's 'who lapsed last cycle' screen, windows drilled properly." },
    { slug: "structuring-detection", why: "HAVING-guarded thresholds over grouped money movement — the AML structuring screen the financial-crime team defends line by line, run across two legacy rails at once post-CS." },
    { slug: "vintage-default-curves", why: "Billing cohorts tracked vintage by vintage — how each quarter's fee book cures or sours — the collections read behind the coverage census's movement story." },
    { slug: "deferred-revenue", why: "Fee billed up front, earned over the advisory cycle — the recognition schedule that keeps the wealth books' revenue honest between billing dates." },
    { slug: "loan-amortization-schedule", why: "Recursive principal-and-interest schedules — UBS lends against portfolios (lombard, mortgage), and the amortization spine is day-count discipline in miniature." },
    { slug: "dormant-reactivation", why: "Households whose activity went quiet — the advisor-coverage screen that turns the no-leg watch into a client call list before the mandate lapses." },
    { slug: "bank-account-summary-ii", why: "Money-in, money-out and net per client account — the custody statement fold: every household's cash movement on one row, both directions, no vibes." },
    { slug: "account-balance", why: "Running balance replayed in event order — the auditor's cash walk: the 69612.00 debit fold proven one settlement leg at a time." },
    { slug: "npv-queries", why: "Present value per mandate at a stated rate — the wealth-planning fold that discounts a book's cash flows before the committee compares mandates." },
    { slug: "investments-in-2016", why: "Holdings grouped by type within a reporting window — the portfolio-analytics drill behind per-mandate asset-mix reads the investment review ships." },
    { slug: "capital-gain-loss", why: "Realized gain/loss per position from matched lots — the performance read the wealth desk ships per household, with fees riding on the answer." },
    { slug: "find-customers-with-positive-revenue-this-year", why: "HAVING-gated profitability per household — the coverage-economics screen: which relationships earned their keep this year, decided in the fold, not the filter." },
    { slug: "find-churn-risk-customers", why: "Anti-join at-risk households — clients with a relationship but no recent activity, the advisor book's standing hygiene list between cycles." },
    { slug: "maximum-transaction-each-day", why: "Per-day argmax with tie discipline — the surveillance board's largest single rail hit per day, ties broken honestly, not by row order." },
    { slug: "uber-first-transaction", why: "First settlement per household — the onboarding clock: how long a new mandate waits for its first rail hit, the funnel's last stage measured." },
    { slug: "product-price-at-a-given-date", why: "As-of valuation — the state of a book at a point in time, not 'latest': the restatement discipline a merged bank lives on after every late wire leg." },
    { slug: "median-employee-salary", why: "Median emulation with windows — no MEDIAN() here: the drill behind the median-billing-per-center read the committee quotes when whales would lie." },
  ],
};
