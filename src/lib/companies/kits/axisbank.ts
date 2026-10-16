// Axis Bank — Wave-11 (Task 102-axisbank), banking domain, 0 tagged sql rows — theme-curated.
// Private Indian universal bank on a cards + retail-lending growth angle (distinct from icici's
// circle-book/settlement-hygiene framing and hdfc's authorization-fate framing): the storefront
// db read as a cards-and-lending sandbox — customers are card/loan customers across four market
// codes (EU / APAC / US / LATAM), orders are statement cycles (delivered = posted-and-closed
// clean 52, shipped = closed-and-settling with shipped_at as the settlement stamp 30, pending =
// open cycle still accruing 14, cancelled = declined/reversed 7), order_items are transaction
// lines (quantity = swipe count on the line, unit_price = per-swipe amount), products = card/loan
// SKUs, suppliers = the co-brand/partner bench, invoices = card statements (the 6 with zero
// payment legs are the dunning book — dues never remitted), payments = settlement rails
// (card = POS/auto-debit legs, wire = NEFT-style manual settlements), expenses = opex,
// ledger_entries = the double-entry book of record. Finance tables store INTEGER paise — the
// rupee read is always amount_cents / 100.0; orders.total and order_items.unit_price are REAL
// rupees already. The kit's two signatures: the LIMIT-BAND ladder (customers dense-ranked by
// lifetime booked spend — the limit proxy — with the 2,000/3,000 band floors at 24,789.63 /
// 22,121.70 cohort foots, 71.2% / 63.5% of the book) and the collections ANTI-JOIN (statements
// with zero payment legs = the dunning register: 6 / 15,217.00, splitting open-cohort 5 /
// 13,461.00 vs the one paid-status lie #28 / 1,756.00).
// Pool provenance: company-pools.md carries NO Axis Bank section (0 tagged rows) — all 10 topic
// slug sets and all 16 problems are theme-curated from the pools file's theme menu (sql rows
// only, no w*/d*/f* rows) and say so in brief P4. All 46 slugs (30 topic + 16 problem) are
// distinct.
// Facts source: scripts/company-facts.md (probed 2026-10-12; wave-8+9 canonicalized cells
// included). Probe-derived cells re-probed read-only against db/custom.db before authoring and
// declared here: the dunning register by claimed status (open 5 / 13,461.00, oldest due
// 2024-11-28; paid 1 / 1,756.00, due 2025-03-14), the dunning region grid (EU open 4 / 8,524.00,
// US open 1 / 4,937.00, APAC paid 1 / 1,756.00), and the five-rung spend ladder cut
// (7,262.35 / 6,640.56 / 4,574.23 / 3,644.56 / 2,667.93). Every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: axisbank is NOT yet in registry COMPANY_META —
// wire id "axisbank", domainId "banking", name "Axis Bank", tagline "Cards and retail-lending
// growth, read through limit bands and the dunning book", accent "text-rose-400" to match this
// header exactly.
//
// Wave-3x expansion (Task 103-axisbank), APPEND-ONLY: brief 4->6, dayInLife 3->4, metrics
// 8->12, topics 10->15, theory 8->24 (t9..t24), mcqs 10->30 (mcq-11..30), cases 2->6
// (cs-axisbank-3..6, topic families x2 / j7 / s6 / t7 — disjoint from the wave-11 pair
// t5+j5 and from each other; universes fraud / supplier / pricing / expense; tiers easy /
// medium / medium / hard), problems 16->32. Still 0 tagged Axis Bank rows — the appended
// topic slug sets and problems stay theme-curated from the pools theme menu (sql rows
// only, no w*/d*/f* rows), and every slug in the file remains distinct (77 total).
// Expansion probe-derived cells re-probed read-only against db/custom.db before authoring
// and declared here: the one-pass fate census (103 / 52 / 30 / 14 / 7, decline share 6.8),
// the trusted-bench fold (Nordic 4.6 / 3 listings / 43 lines / 11,130.25; Alpine 4.8 / 2 /
// 40 / 4,765.63; the p.id-in-key probe re-reads 95 lines / 16,562.62 per surviving
// partner), the ticket-band fold at the 55 per-swipe floor (micro 268 swipes / 133 lines /
// 31.01 avg per-swipe; big 230 / 118 / 115.85; 498 total swipes), and the opex walk (14
// monthly buckets 2024-01..2025-02, opening 1,719.00, August spike 3,210.00, step
// +1,416.00 then -1,665.00, first step NULL baseline). Every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const axisbankKit: CompanyKit = {
  id: "axisbank",
  domainId: "banking",
  name: "Axis Bank",
  tagline: "Cards and retail-lending growth, read through limit bands and the dunning book",
  accent: "text-rose-400",

  brief: [
    "**Axis Bank** is one of India's largest private-sector universal banks — a retail franchise whose growth engine runs on cards and retail lending: issue the card, watch the swipe book compound, set the limit, and collect on time. Every analyst here learns the same two truths early. First, *the limit is a band, not a number* — customers are managed in spend-based bands (mass, preferred, priority), and every portfolio read is a ladder over lifetime booked spend with the band floors drawn in. Second, **a status column is a claim; a settlement leg is evidence** — a statement marked paid with zero legs on the rails is still a due. On this training db the mapping is honest: the 16 customers rows are card/loan customers across four market codes (EU / APAC / US / LATAM), the 103 orders are statement cycles worth **34,833.28** (average ticket 338.19 against a 25.47 to 1,088.44 spread), and the 251 order_items rows are transaction lines — quantity = swipes on the line, unit_price = per-swipe amount. The status map is fixed: delivered = {emerald:posted-and-closed clean} (52, 50.5%), shipped = closed-and-settling (30, 29.1%), pending = open cycle, still accruing (14, 13.6%), cancelled = {rose:declined/reversed} (7, 6.8%).",
    "The data org splits into cards portfolio analytics, retail-lending risk, and a collections pod, all reading one cycle spine at different grains. A cycle books at created_at and shipped_at stamps the day it actually closed and settled — **82 of 103 cycles** carry the stamp, averaging a 2.98-day close lag with a 2–4 day spread; the 14 open cycles have none yet (a population definition, not a cleanup job). Money sits one layer down in INTEGER paise, where the rupee read is `amount_cents / 100.0`: 28 card statements — 21 paid for 66,443, 6 open at 19,609, 1 void at 925 — clear on two rails, the {emerald:card rail} (16 POS/auto-debit legs for 37,364) and the wire rail (11 NEFT-style legs for 32,248), with five statements settled on split plans crossing both. The book of record ties: **181,080 debits against 181,080 credits across 80 ledger entries, delta 0** — *a market number that can't tie back to the books is a rumor, not a read.*",
    "Interview screens are census-then-denominator with two Axis signatures. The first is the {violet:limit-band ladder}: rank customers by lifetime booked spend, dense-ranked, cut at a band floor — the four customers above 3,000 carry **22,121.70 (63.5% of the book)**, the 2,000-plus cohort foots to **24,789.63 (71.2%)**, and the cycle-count ladder runs 24 / 17 / 14 / 13 / 5 with a four-way tie at 4 that turns rank semantics into a policy argument. The second is the {rose:dunning register}: statements with ZERO payment legs, membership by rail evidence — 6 statements / 15,217.00, splitting into an open cohort of 5 / 13,461.00 and one paid-status lie (#28, 1,756.00, no leg ever moved), while the mirror anomaly (void-but-debited #11, 925.00) stays off-book. Follow-ups probe the denominator out loud: *'does an open cycle count in your close-lag base?'*, 'is that share per cycle or per customer?'",
    "Preparation strategy: the pools file carries no Axis Bank section — **0 tagged sql rows** — so every topic slug and all sixteen problems here are **theme-curated** to this kit's known screen shapes: statement-cycle folds, limit-band ladders, spend-based segmentation, the collections anti-join, rails, and the rupee-safe ledger tie-out. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:limit-band ladder} the cards portfolio review opens with, the other rebuilds the {rose:dunning register} the collections huddle works from. The bar to clear: *state the band floor and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction, and every paise fold divide by 100.0 exactly once.",
    "There is a third reader of the same spine: the risk pod, and it reads for {rose:stress}. Declines are thin on this book — **7 of 103 cycles, a 6.8% share** — but they concentrate: APAC runs 8.1%, EU 6.7%, US 5.3%, LATAM a clean 0 across its 2 cycles. The grid habit matters as much as the numbers: the status-by-market census only prints observed combinations, so LATAM's missing pending-and-cancelled cells are *absent rows, not zero rows* — a census that assumes the zero is a census that miscounts. Forensics stays evidence-first: the void-but-debited #11 (925.00) and the paid-status lie #28 (1,756.00) are mirrored anomalies, 5 statements settle on split plans across both rails, and the settlement clock reads **28.4 days** against flat 30-day terms (fastest 13, slowest 84) — the clock is where prepayment and stress both show up first.",
    "The senior screens assume the warm-ups are done and go one layer deeper: window frames (a running settled-dues walk on the default `RANGE` frame quietly pulls tied stamps into one step — say which frame you meant), set logic (the dunning and recovered registers ship as one packet, and the follow-up is always *why UNION here and not UNION ALL*), subquery shapes (above-average gate, derived stage, correlated per-market mean — different costs, different empty-case behaviors), and fan-out, the silent killer: join transaction lines under statement cycles and the SUM near-triples the book, so *fold first, then join*. Prepare by rebuilding the four new case files on the live db, then re-cutting each one with a different denominator — **if you can say what would change and why, you are interview-ready.**",
  ],

  dayInLife: [
    "**08:20 —** The day starts with the cycle-close refresh. A cards portfolio analyst opens the market dashboard before standup: did overnight settlements land, did any closing cycle post without its stamp, does the one-pass fate census reconcile — 52 posted clean + 30 settling + 14 open + 7 declined = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. The ledger proof runs next — **181,080 against 181,080, delta 0** — because nothing downstream is believed until the books tie. If the **2.98-day** close lag drifts (US already runs 3.07 against APAC's 2.93), the pending-cycle queue gets pulled before the portfolio pack ships.",
    "**11:45 —** Midday is the limit-band deep-dive. The portfolio lead wants the ladder re-cut with the four-way tie at 4 cycles handled honestly — shared rungs, named policy; risk wants the band floors re-proved: 4 customers above 3,000 holding **22,121.70 (63.5%)**, the 2,000-plus foot at **24,789.63 (71.2%)**; the product pod wants ticket bands — **268 micro-ticket lines averaging 31.01** against 230 big-ticket lines at 115.85; a market head wants cycles beside customers (EU 45-from-8 versus US 19-from-2, intensity 5.6 vs 9.5). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the band definition spelled out so the number survives the portfolio-review argument*.",
    "**16:00 —** The afternoon belongs to collections, and it ends the day. The dunning anti-join refreshes first — **6 never-remitted statements worth 15,217.00** — before a single reminder fires: the open cohort reads 5 / 13,461.00 with the oldest due 2024-11-28, and one row is a {rose:status lie} — #28, marked paid at 1,756.00, zero legs ever moved. The partial (#25: 4,000.00 of 6,148.00) routes to soft-dunning, the settlement clock reads **28.4 days** average against flat 30-day terms (fastest 13, slowest 84), and the rails census cross-foots — card 16 legs / 37,364.00, wire 11 / 32,248.00 — against opex checked on the way out (Rent 14 lines / **16,800.00**). The close ships only when the register foots to the anti-join: *the dunning book is defined by what never moved, and everyone on the huddle can say so.*",
    "**18:40 —** The day closes with the writeup, not the query. The analyst drafts the portfolio note while the numbers are fresh: the fate census reconciles to **103 by construction**, the ladder foots to 24,789.63 above the 2,000 floor, the dunning register stands at 6 / 15,217.00 with the paid lie called out by statement id. Every figure gets a denominator line — *a number without its population is a rumor with formatting* — and the queries ship as definitions-inlined artifacts the morning shift can re-run cold. The last pass is the ledger proof: 181,080 debits against 181,080 credits, **delta 0** — if it ties, the close ships; if it does not, the writeup waits. The note ends the way the day began, on the stage map: *52 posted, 30 settling, 14 open, 7 declined — and which of those your number counts.*",
  ],

  metrics: [
    { name: "Cycle book", what: "103 statement cycles worth 34,833.28 — average ticket 338.19 against a 25.47 to 1,088.44 spread. The spread IS the portfolio story: one 1,088.44 ticket outweighs the smallest 42 combined, and the limit desk reads it before anything else." },
    { name: "Cycle fate mix", what: "52 posted-and-closed clean, 30 closed-and-settling, 14 open still accruing, 7 declined/reversed — 103 by construction. Every stage is a conditional count over a status or timestamp, and calling a settling cycle 'posted' inflates the clean book before a single close lands." },
    { name: "Cycle-close lag", what: "Booking to settlement stamp (created_at → shipped_at) over stamped cycles only: 82 of 103, 2.98-day average, range 2–4. The population ships with the number — the 14 open cycles have no close yet and must not dilute the average." },
    { name: "Market intensity", what: "Cycles beside customers per market: EU 45-from-8 (5.6) versus US 19-from-2 (9.5); APAC 37-from-5, LATAM 2-from-1. The two-grain census that decides whether growth is broadening the base or concentrating in heavy relationships." },
    { name: "Decline share by market", what: "Declined ÷ ALL cycles booked, per market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The risk huddle's opening map — and the denominator (booked, not settled) is the whole interview." },
    { name: "Limit-band concentration", what: "Share of the book by lifetime-spend band: 63.5% sits with the four customers above 3,000 (22,121.70), 71.2% above the 2,000 floor (24,789.63). One priority relationship moves a market's month — the ladder and its floors are the limit desk's daily read." },
    { name: "Dunning register", what: "Statements with zero payment legs: 6 worth 15,217.00 — open cohort 5 / 13,461.00 (oldest due 2024-11-28) plus paid-status lie #28 at 1,756.00. Membership is rail evidence, never the status column; the wider coverage census reads 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 none." },
    { name: "Rails mix & the tie-out", what: "Settlement legs by rail: card 16 legs / 37,364.00, wire 11 / 32,248.00 — 27 legs on 22 statements (5 split across rails), averaging 2,578.22 a leg. The book of record ties behind it: 181,080 debits vs 181,080 credits, delta 0, cash netting 44,196." },
    { name: "Ticket-band mix", what: "Settled transaction lines banded at the 55 per-swipe floor: the micro-ticket arm carries 268 swipes across 133 lines averaging 31.01, the big-ticket arm 230 swipes across 118 lines averaging 115.85. Volume lives micro, value lives big — the product pod reads the arms before pricing any annual-fee test." },
    { name: "Partner concentration", what: "Co-brand bench revenue folded through products and lines: Nordic Gadgets AB 11,130.25 on 3 listings, Midwest Hardware Co 9,294.93 on 3 — together more than half of the 34,833.28 book. Two partners carry the settled volume, while the trusted-quality ladder (rating 4.5-plus) reads just Nordic and Alpine." },
    { name: "Settlement clock", what: "Issue-to-settlement on the paid book: 28.4 days average against flat 30-day terms, fastest 13, slowest 84 — 22 statements carry legs and 20 of the paid book settle with them. The gap to 30 is the float story; the 84-day tail is the collections referral." },
    { name: "Opex fold", what: "36 expense lines fold to four categories: Rent 14 lines / 16,800.00, Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00. Rent alone outweighs the other three combined (8,616.00) — the fixed-cost floor every growth read is netted against." },
  ],

  topics: [
    {
      name: "Statement-cycle aggregation",
      why: "The cards book folds one way: statement cycles grouped by month and market, with declined demand either in or out by definition. Axis screens open with a GROUP BY that must state its status rule out loud — the 2024-01 to 2025-02 spine (8 cycles / 3,731.97 opening, trough 1,193.86 in July) is where every warm-up lands.",
      slugs: ["monthly-transactions-i", "group-sold-products-by-the-date", "product-sales-analysis-ii"],
    },
    {
      name: "The two-grain market census",
      why: "'Cycles AND customers per market' is the opening read of every Axis portfolio review — and the trap is counting both at the same grain. COUNT(*) counts cycles; COUNT(DISTINCT customer_id) counts relationships; the gap between them (EU 45-from-8 = 5.6, US 19-from-2 = 9.5) is the intensity signal the limit desk actually manages.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Spend-based segmentation with CASE",
      why: "The mass / preferred / priority bands are CASE-classified over lifetime spend, and transaction lines band into micro-ticket and big-ticket arms the same way. The arms must be exhaustive and ordered — a hole in the CASE is a customer with no band, and a reordered WHEN quietly re-bands the book.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "spend-histogram"],
    },
    {
      name: "Limit-band ladders (rank windows)",
      why: "The limit proxy is lifetime booked spend, and the ladder over it is rank-window reporting: the cycle-count ladder runs 24 / 17 / 14 / 13 / 5 with a four-way tie at 4, so RANK, DENSE_RANK and ROW_NUMBER genuinely diverge. Axis drills the trio because who shares a rung is a policy about peer relationships, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "The collections anti-join",
      why: "The dunning register is defined by absence: statements with ZERO settlement legs, found by LEFT JOIN + IS NULL (or its NOT EXISTS twin). The status column lies on both edges — a paid statement with no legs is on the register, a void statement with a leg is off it — so the anti-join arm IS the metric.",
      slugs: ["customers-who-never-order", "find-churn-risk-customers", "dormant-reactivation"],
    },
    {
      name: "Rails: settlement legs and the fold",
      why: "Card and wire are two rails with one job: legs fold to statements, statements foot to the book. Split plans (five statements ride both rails) make leg-count versus statement-count a fan-out question, and every rupee read is amount_cents / 100.0 — integer paise one misplaced division away from a hundredfold lie.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Rates with honest denominators",
      why: "Decline shares, settlement rates, utilization percentages — Axis ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio (booked, not settled), and rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "Cycle clocks and date math",
      why: "The close lag is julianday(shipped_at) - julianday(created_at) over stamped cycles — 82 of 103, 2.98 days — and every windowed read (latest payment in the cycle year, two purchases inside seven days) lives on half-open intervals. BETWEEN on a close boundary silently drops the last night's settlements.",
      slugs: ["average-time-of-process-per-machine", "the-latest-login-in-2020", "find-golden-hour-customers"],
    },
    {
      name: "One-pass fate censuses",
      why: "The portfolio board gets posted, settling, open and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift; the branch sums reconciling to COUNT(*) is the correctness argument.",
      slugs: ["active-businesses", "immediate-food-delivery-i", "number-of-rich-customers"],
    },
    {
      name: "LAG walks across the cycle spine",
      why: "The month-close walk runs the 14-month spine with LAG deltas — the book opens at 3,731.97, troughs at 1,193.86 in July, and the first row's prior value is NULL by definition (baseline, never zero). Declined cycles concentrate where the walk says they do — two each in July and November of the seven.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "The co-brand bench fold",
      why: "Partners sit one join away from the transaction grain, and the bench review folds listings, lines and booked volume per partner in one pass — Nordic Gadgets AB reads 11,130.25 on 3 listings and 43 lines, and the trusted cut (rating 4.5-plus) drops the same fold to two partners. The screen is whether you can run products through the bench to lines without fanning the money out.",
      slugs: ["average-selling-price", "warehouse-manager", "sales-person"],
    },
    {
      name: "Nested gates and argmax guards",
      why: "Above-average gates and top-of-book reads run as scalar and IN subqueries: relationships beating the 6.44-cycle platform mean, the single biggest statement, the partner with the most settled lines. Axis probes the empty-inner behavior and the NULL-poisoned NOT IN until you state the inner fold's population unprompted.",
      slugs: ["department-highest-salary", "orders-with-maximum-quantity-above-average", "winning-candidate"],
    },
    {
      name: "Set-operation registers",
      why: "Month-close packets stack books that are computed differently — dunning beside recovered, declined beside kept — and set ops are that grammar. UNION dedups whole rows, UNION ALL keeps the packet honest behind a book-label column, INTERSECT finds the 5 split-rail statements, and EXCEPT's direction is the anomaly pair.",
      slugs: ["count-salary-categories", "league-statistics", "team-scores-in-football-tournament"],
    },
    {
      name: "Running books and window frames",
      why: "The settled-dues walk and the cumulative cycle book are running aggregates, and the frame decides whether tied stamps enter together or row by row — the default RANGE frame shares a step, ROWS BETWEEN makes each row its own. Axis drills frames because a walk that disagrees with the statement fold by one leg is a reconciliation incident.",
      slugs: ["account-balance", "find-cumulative-salary-of-an-employee", "rolling-average-steps"],
    },
    {
      name: "Recency, aging and intervals",
      why: "Collections works in intervals: re-swipe windows, aging buckets pinned to a reference date, cadence gaps between a customer's cycles. The discipline is half-open bounds — BETWEEN drops the boundary night, and the boundary is exactly where due dates and auto-debit legs land.",
      slugs: ["users-with-two-purchases-within-seven-days", "leetflex-banned-accounts", "customer-order-frequency"],
    },
  ],

  theory: [
    {
      id: "axisbank-t1",
      q: "You build the dunning register by joining statements to their settlement legs. When do you INNER and when do you LEFT — and what silently breaks if you filter a leg column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A rails-performance report joins legs to statements: a leg with no statement is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. The dunning register must be LEFT from statements: the statements with NO legs ARE the register, arriving with NULL leg columns, and the anti-join arm (WHERE p.id IS NULL) is the metric itself. The classic break: adding status = 'open' to WHERE after the LEFT JOIN does two jobs badly — it kills the paid-status lie (#28, 1,756.00, zero legs, status 'paid') that belongs on the register, and it drags in the partial (#25, 4,000.00 of 6,148.00) that has a leg and does not. Same count of six, wrong book. The fix is putting statement-level predicates in the outer query or the ON clause, and letting the IS NULL arm define membership by evidence. On this db the register reads 6 / 15,217.00 — five genuinely open plus one lie — and being able to say WHY each row qualifies is the answer the panel is listening for.",
      tag: "joins",
    },
    {
      id: "axisbank-t2",
      q: "The cycle-count ladder runs 24, 17, 14, 13, 5 — then FOUR relationships tie at 4 cycles. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the Axis interviewer wants you to say that out loud. RANK shares rungs and then skips: the four-way tie at 4 consumes ranks 6 through 9, and the next distinct count (3) lands on 10 — implying five phantom rungs that do not exist. DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose relationship gets the limit-increase offer first. On the spend ladder the three coincide — all 16 lifetime spends are distinct — but the policy still matters, because the day two customers tie at a band floor, the default frame does too: SUM(total) OVER (ORDER BY created_at) uses RANGE semantics, so cycles sharing a timestamp enter the running total together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer relationships, or an explicitly named tie-breaker like created_at then id — and writing it into the query comment.",
      tag: "windows",
    },
    {
      id: "axisbank-t3",
      q: "The market review shows 103 statement cycles and 16 customers; EU shows 45 cycles and 8 customers. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts cycle rows after the join — one row per statement cycle, so a customer with 24 cycles contributes 24. COUNT(DISTINCT customer_id) folds those rows back to relationships — EU's 45 cycles collapse to 8 customers. Neither is wrong: cycles measure load and cadence, customers measure installed base. The ratio — 5.6 cycles per customer in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating, and the platform mean (6.44 cycles per customer, with exactly four relationships above it) is the gate the limit desk actually uses. The trap that catches candidates is a third grain: join order_items for transaction lines and COUNT(*) silently counts lines — 251 of them, 2.44 per cycle — not cycles. Saying 'one row per what?' out loud for every COUNT in the query is the habit the panel grades, and it is the same habit Axis's own portfolio packs encode.",
      tag: "aggregation",
    },
    {
      id: "axisbank-t4",
      q: "shipped_at is NULL until a statement cycle closes and settles. What is your policy for the close-lag report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped cycles have a close, so the report measures booking-to-settlement for the 82 of 103 cycles that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 open cycles plus 7 declined rows — 21 rows with no stamp — which is a feature, not a bug. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day closes for cycles that have not closed, and it poisons the 2.98 baseline every regional drift alert keys off. The regional cut makes the discipline concrete: LATAM 3.5 on just 2 stamped cycles, US 3.07 on 15, EU 2.94 on 36, APAC 2.93 on 29 — small-base cells get labeled as small-base cells. A report whose WHERE clause is doing definitional work without saying so is exactly what an Axis reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "axisbank-t5",
      q: "The risk review wants decline share per market for markets carrying at least ten booked cycles. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' flags declined cycles before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-cycle floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a risk line and an error. One more placement rule Axis screens love: the share — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the decline share truncates toward zero; on this db it is the difference between APAC's 8.1 and a displayed 0. The strong answer places every filter by asking: is this a fact about one cycle, or about a market? — and states the denominator (booked, not settled) before computing anything.",
      tag: "pipeline",
    },
    {
      id: "axisbank-t6",
      q: "The limit desk wants relationships whose lifetime spend beats the platform average. WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce a mean (338.19 per cycle; 6.44 cycles per customer, exactly four relationships above it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each customer to ITS market's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a market's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the limit desk is fishing for when it asks how the gate behaves mid-refresh.",
      tag: "subqueries",
    },
    {
      id: "axisbank-t7",
      q: "The month-close walk buckets cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the collections calendar becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's cycles, and month-end is exactly when auto-debit legs land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, and the declined rows concentrate where the walk says they do — two each in July and November. Date discipline is collections discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "axisbank-t8",
      q: "Collections says a statement is 'paid' but the rails table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why rail rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-debited #11 folds in by construction, paid-status #28 folds out), 1 partial (#25: 4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER paise, so every rupee read is amount_cents / 100.0 — the missing .0 keeps integer division alive, and it truncates odd-paise legs even when whole-multiple group foots let it pass QA. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "axisbank-t9",
      q: "You build a running settled-dues walk with SUM(amount_cents) OVER (ORDER BY paid_on). A reviewer says the walk disagrees with the statement-level fold by one leg on a day where two legs share a stamp. What is the first thing you check?",
      a: "The frame. With ORDER BY inside OVER, the default frame is RANGE between unbounded preceding and the current row — and RANGE treats peers as one step: both same-stamp legs enter the running total together, so the intermediate step that would reconcile statement-by-statement never exists. The fix is saying what you meant: ROWS BETWEEN UNPRECEDING AND CURRENT ROW makes each leg its own step, and a tiebreak in the ORDER BY (paid_on, then id) makes the walk deterministic. On this book it is not theoretical — 27 settlement legs carry 5 statements that settle on split plans, and split legs can share a stamp. The habit the panel grades: window frames are semantics, not syntax — state the frame in a comment, and reconcile the walk to the statement fold before the packet ships.",
      tag: "windows",
    },
    {
      id: "axisbank-t10",
      q: "The month-close packet stacks the dunning register and the recovered register. When is UNION wrong, when is UNION ALL mandatory, and what are INTERSECT and EXCEPT for on this book?",
      a: "UNION dedups whole rows across branches — wrong whenever two branches can legitimately print identical cells, because the packet loses a register silently. Registers ship as UNION ALL with a book-label column, so every row announces which fold produced it. INTERSECT answers 'in both': the statements settled on BOTH rails — the 5 split plans — fall out of an INTERSECT of the card-leg and wire-leg statement sets. EXCEPT answers 'left without right', and its direction is the semantics: paid-status statements EXCEPT leg-covered statements returns the paid-status lie; the reverse returns statements whose legs moved without a paid claim — the void-but-debited #11 and the open partial #25, two rows for two different reasons. Two directions, two anomaly families, one operator. The discipline: pick the operator by the membership question, label every branch, and never let dedup do your reconciliation for you.",
      tag: "setops",
    },
    {
      id: "axisbank-t11",
      q: "Membership tests: where do you reach for EXISTS instead of IN or a join, and what does EXISTS buy you on this db?",
      a: "EXISTS when the question is presence, not enumeration: 'statements with no settlement legs' is NOT EXISTS's twin of the LEFT JOIN + IS NULL anti-join, and it fails differently. IN builds a list and compares against it — one NULL in that list poisons every comparison and the report empties; EXISTS short-circuits on the first matching row and never looks at NULLs. The LEFT JOIN + IS NULL semi-join works too, but it drags join machinery into a read that only needs a yes/no, and on a fan-out join you must remember the row you keep is the statement, not the leg. On this db the collections anti-join is small — 28 statements, 27 legs — so all three run fast; the screen is which one you can defend. EXISTS for presence with NULL-immunity, IN for small static lists you can guarantee, the join when you also need columns from the other side. The strong answer names the failure mode of each, not just the syntax.",
      tag: "exists",
    },
    {
      id: "axisbank-t12",
      q: "A spend band is written as CASE WHEN spend >= 3000 THEN 'priority' WHEN spend >= 2000 THEN 'preferred' END. What does the mass band read, and what is the house rule for CASE arms?",
      a: "NULL. An ELSE-less CASE yields NULL for every row no arm captures — the 11 mass-band customers print no band at all, vanish from equality filters, and sort unpredictably. The house rule has three clauses. Exhaustive: every row must land somewhere — on this book the ELSE is the mass arm, not an afterthought. Ordered: WHEN arms evaluate top-down, so floors must descend — swap the order and 'preferred' swallows 'priority' before the 3,000 test ever runs. Disjoint by construction: one row, one arm, so branch counts reconcile to COUNT(*) — the same argument that makes the fate census 52 + 30 + 14 + 7 = 103. And when the ask is a one-pass census rather than a re-labeling, FILTER (WHERE …) is the tighter tool. The reviewer's tell: a band column with a non-zero NULL count is a CASE missing its ELSE, and it ships back the same day.",
      tag: "case",
    },
    {
      id: "axisbank-t13",
      q: "Your per-market share divides by a count that is zero for one market. SQLite prints NULL for x/0 rather than erroring. What is the honest guard, and what does a dishonest one hide?",
      a: "The honest guard is NULLIF(COUNT(*), 0): it converts the zero denominator to NULL on purpose, the share NULL-propagates, and the report shows an empty cell — which is the truth, because a share over zero cycles is undefined, not zero. The dishonest guards: IFNULL(COUNT(*), 1) is dead code — COUNT never returns NULL, so the fallback never fires and the division still NULLs out, except now the reader believes it was guarded; coalescing the share to 0 invents a 0% market where no cycles exist, and the next reader books it as 'clean market'. The same policy as the stamps: an average over the wrong population is a real number wearing the wrong name. On this book LATAM's 2 cycles keep zero-denominators rare — staging slices are where it bites, one market, one month — and the habit is to state the empty-case behavior before the ratio ships.",
      tag: "nulls",
    },
    {
      id: "axisbank-t14",
      q: "The bench pack folds each partner's SKUs with GROUP_CONCAT. The same partner printed two different strings on two runs. What happened, and what is the fix?",
      a: "GROUP_CONCAT's order is undefined unless you demand one: the fold concatenates in scan order, and scan order changes with the query plan — a different index, a different join order, a different string. The fix is an explicit ORDER BY inside the aggregate (GROUP_CONCAT(p.name, ', ' ORDER BY p.name) on modern SQLite) or folding from a pre-sorted derived table. The second-order rules: the separator is an argument, so ', ' versus ',' is a formatting decision, not an accident; and the fold is an aggregate — GROUP BY partner, one row per partner, or the strings multiply across the join. Do not build packs on unordered folds: cells that reshuffle between refreshes train stakeholders to distrust every cell, and the reconciliation culture this shop runs on dies quietly. Deterministic in, deterministic out — the fold is part of the pack's contract, and the reviewer reads it that way.",
      tag: "strings",
    },
    {
      id: "axisbank-t15",
      q: "Two versions of the same month filter: STRFTIME('%Y-%m', created_at) = '2024-01' versus a half-open range on created_at. Same 8 cycles. Why does the review prefer the range?",
      a: "Because the rows are the same and the plans are not. Wrapping the column in a function makes the predicate opaque to an index on created_at — the engine scans every row and evaluates the function per row. The half-open range — created_at >= '2024-01-01' AND created_at < '2024-02-01' — is sargable: the index seeks the month's span directly. At 103 rows the scan is free; at ten million it is the difference between a dashboard and an outage, and the reviewer is grading the habit, not today's cost. The range is also more honest about boundaries: it includes the last night of the month, which BETWEEN '2024-01-01' AND '2024-01-31' silently drops — and month-end is exactly when auto-debit legs land. Sibling habits: filter on the join key, keep SELECT lists narrow, and let the small-db prototypes build instincts you will not have to unlearn at scale.",
      tag: "performance",
    },
    {
      id: "axisbank-t16",
      q: "Risk quotes 'decline share 6.8%' and marketing quotes 'decline rate 6.8%' — same number, different folds. How does this shop keep KPI definitions from drifting?",
      a: "By pinning the denominator to the definition, in writing, next to the query. Decline share is declined divided by ALL cycles booked — 7 of 103 — and it is a funnel read: how much demand never became exposure. A decline rate over settled cycles divides by 96 and prints 7.3 — a different number for the same events, and both would be 'correct'. So the house rules: the population ships in the title ('share of booked cycles'), the query comment states the denominator before the SELECT does the arithmetic, and any KPI whose denominator can be argued prints both versions side by side rather than silently choosing one. The same discipline fixed the close-lag base (stamped cycles only, 82 of 103) and the intensity read (cycles per customer, not per line). A number without its population is a rumor with formatting — the definition is part of the artifact, and reviewers reject packets that omit it.",
      tag: "kpis",
    },
    {
      id: "axisbank-t17",
      q: "Collections asks for aging buckets of the open dues. Which reference date do you pin, and how do you build the buckets so the close can defend them?",
      a: "Pin the reference and print it. 'Days past due' needs an as-of anchor: MAX(paid_on) over the rails — the last day money actually moved — keeps the report reproducible from the db alone, while date('now') makes every refresh re-age the book and two runs of the same query disagree. Then the buckets: age = julianday(anchor) - julianday(due_on) over the no-leg register, CASEd into current / 1-30 / 31-60 / 61-plus bands that are exhaustive and half-open at the edges. The oldest open due on this book is 2024-11-28 — months past the flat 30-day terms — and the bucket is where it belongs, not a shrug called 'old'. The traps: due dates are DATE strings, so subtracting them as text is nonsense — julianday both sides; and the 6-statement register is small enough to eyeball, which is exactly why the buckets must be mechanical — eyeballing does not scale to the real book.",
      tag: "dates",
    },
    {
      id: "axisbank-t18",
      q: "The market review wants each market's top relationship by lifetime spend — top-1 per market, four markets, one query. How do you write it, and where does the tie policy live?",
      a: "PARTITION BY is the one-pass shape: ROW_NUMBER() OVER (PARTITION BY region ORDER BY lifetime_spend DESC) over a derived table that folds spend per customer first, then keep rn = 1 outside. The pre-fold matters — window functions run after grouping, so stage the fold (spend per customer-market) and partition the folded rows; partitioning raw transaction lines re-introduces the fan-out and the fold doubles. The tie policy lives in the ORDER BY: lifetime_spend DESC, then a named tiebreak (cycles DESC, then customer id), written into the comment — ROW_NUMBER splits ties arbitrarily and the pack must not pretend it did not. If the desk wants shared rungs instead, RANK or DENSE_RANK per partition: same partition logic, different tie semantics, and the reviewer asks which you chose and why. The correlated-subquery cousin (max per market, then join back) answers the same question in two reads of the table; the window is one pass and it scales.",
      tag: "windows",
    },
    {
      id: "axisbank-t19",
      q: "A per-customer cycle-gap walk uses LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at), and someone COALESCEs the gap to 0 to clean the first row. What did that do?",
      a: "It invented a same-day repeat cycle for every customer's first cycle. The first row of EVERY partition carries NULL as its look-back — that is the definition of LAG at a partition boundary, not dirt to clean. Zero-filling fabricates a 0-day gap per customer: on this book, 16 fabricated zeros drag every interval average down and the 'average days between cycles' KPI is silently wrong. The honest shape: report the first row's gap as NULL, or label it 'baseline' in the packet — the same policy as the month-walk's first step and the unstamped close lag. LAG's third argument (a default) exists for genuinely known defaults, and 'no prior cycle' is not one. The partition discipline cuts both ways: without PARTITION BY, one customer's cycle becomes another customer's 'previous' — the walk crosses relationships and every gap is fiction. Partition, order, then decide what the boundary row means.",
      tag: "windows",
    },
    {
      id: "axisbank-t20",
      q: "Derived tables versus CTEs: the opex walk stages monthly folds before the window. When do you reach for each, and what does the reader owe you?",
      a: "Same mechanics, different contracts. A derived table stages one fold for one use — the opex walk's inner SELECT folds 36 expense lines to 14 monthly buckets and the outer LAG reads the folded months; you cannot window an unfolded scan, so the stage is structural. A CTE is the same stage with a name: reach for it when the fold is reused (the dunning register feeding both the status split and the aging buckets), when the chain of stages gets long enough that the names are the documentation, or when the team reviews staged logic line by line. On SQLite both inline into the plan — the choice is readability and reuse, not speed. The reader owes you: one stage per name, each named for what it is (monthly_opex, dunning_register), and the window reading the fold, never the raw scan. The failure the screens hunt: windowing the raw table and GROUP BY-ing after — the window runs over ungrouped rows and the walk doubles.",
      tag: "subqueries",
    },
    {
      id: "axisbank-t21",
      q: "The status column says 'paid'; the rails say nothing ever moved. Walk the shop's data-quality stance — which column wins, and what is the closing rule?",
      a: "Evidence wins. A status column is a claim typed by a process; a settlement leg is a row that moved money — so membership in any register (dunning, recovered, voided) is defined by rail evidence, and the status column only labels what the evidence already proved. The stance has teeth because the errors are mirrored: a paid claim with no legs (#28, 1,756.00) and a void claim with a leg (#11, 925.00) are complements, and catching one without the other means your anomaly census is a filter, not a census. The closing rule is the trial balance: 181,080 debits against 181,080 credits, delta 0, every close — a book that cannot tie is a book you cannot quote. The habits: reconcile on members and rupees, never on row counts (two registers can both read six and share one member); write the anomaly definition as a query, not a memo; and when a status disagrees with evidence, the fix is a ticket against the claiming process, not an UPDATE to make the columns agree.",
      tag: "quality",
    },
    {
      id: "axisbank-t22",
      q: "You need the detail rows for every market carrying at least ten booked cycles. WHERE cannot see COUNT(*). How does the gate actually work?",
      a: "Two passes with different jobs. The gate is a group fact — COUNT(*) >= 10 only exists after GROUP BY, so it lives in HAVING, or in a folded derived table filtered outside. The detail rows are row facts, and they come back by joining the qualified groups to the detail: fold per market in a CTE, filter the fold, join back on the market key. The order is the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — WHERE runs before groups exist, which is why it cannot see aggregates and why the status rule (a row fact) must live there, not in HAVING. On this db the gate admits three markets (EU 45, APAC 37, US 19) and drops LATAM's 2 — and the join-back returns every cycle row in the surviving markets, a different artifact than the three summary rows. The screens probe exactly this: which clause, which grain, what the output grain is. Saying 'one row per what?' for every stage is the answer.",
      tag: "pipeline",
    },
    {
      id: "axisbank-t23",
      q: "ROUND the paise fold per row, or aggregate first and ROUND once at the edge? Defend the house rule.",
      a: "Aggregate first, ROUND once, at the edge where the number meets a human. Rounding per row then summing accumulates per-row drift — 251 half-paise losses are a visible hole in a book that ties to the paise; SUM(amount_cents) / 100.0 keeps full precision through the fold and rounds the final cell to the display grain (2dp) once. Storage stays INTEGER — cents are exact, floats are not — so the only float in the pipeline is the last read. The rules that hang off it: the rupee read is amount_cents / 100.0 (the .0 is the arithmetic, not decoration — bare 100 is integer division and truncates odd-paise rows); never round inside a running window, because the walk's steps must foot back to the level column; and display grain is a contract — the pack prints 15,217.00, not 15,216.9999, because stakeholders reconcile the printed cell, not the raw sum. Rounding is presentation, and presentation happens once.",
      tag: "money",
    },
    {
      id: "axisbank-t24",
      q: "An analyst joins transaction lines to statement cycles and reports the cycle book at 103,244.55. The true book is 34,833.28. What is the general rule that was violated?",
      a: "Fold before you join money. The join fanned 103 cycles out to 251 lines — one row per transaction line — and SUM(o.total) over that grain counts each cycle's total once per line, multiplying the book by the basket depth. The rule: decide the grain of the money first, fold to that grain, then join. If the ask is the cycle book, SUM(o.total) over orders alone; if the ask is per-customer spend, fold lines to cycles, then cycles to customers. The symptoms that diagnose it after the fact: a total that overshoots a known figure by roughly the join's fan-out factor, and COUNT(DISTINCT) reads that disagree with COUNT(*) on the same rows — 251 lines against 103 distinct cycles. The same rule protects the rails fold (legs to statements) and the bench fold (lines to partners): every one-to-many money join is a multiplication waiting to happen, and the fold order is the only guard. State the grain out loud before the SUM, and this bug cannot reach a pack.",
      tag: "fanout",
    },
  ],

  mcqs: [
    {
      id: "axisbank-mcq-1",
      prompt: "A statement cycle's status reads 'shipped' in this kit's Axis Bank stage map. What happened?",
      choices: ["The cycle closed and is settling — the settlement stamp shipped_at has landed", "The cycle posted-and-closed clean", "The cycle is open and still accruing spend", "The cycle was declined or reversed"],
      answer: 0,
      why: "The stage map is fixed: shipped = closed-and-settling (30 of 103 cycles), with shipped_at as the settlement stamp. It closed and is clearing — but it is not yet a posted-clean cycle.",
      notes: [
        { choice: 1, why: "Posted-and-closed clean is 'delivered' — 52 cycles. Calling settling cycles posted inflates the clean book before a single settlement lands." },
        { choice: 2, why: "Open-and-accruing is 'pending' — 14 cycles with no shipped_at yet. Pending is not settling; it stays in the funnel denominator but out of the close-lag base." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-2",
      prompt: "EU carries 45 statement cycles from 8 customers; the US carries 19 from 2. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to relationships (8). The gap between them — 5.6 cycles per customer in EU versus 9.5 in the US — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle carries a customer. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "SUM(total) is money, not coverage — 15,089.23 for EU. Pairing it with COUNT(*) gives load and value but never the relationship count the limit desk needs." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-3",
      prompt: "82 of 103 cycles carry the settlement stamp. What is the gap between COUNT(shipped_at) and COUNT(*) over the cycles table?",
      choices: ["21 — the 14 open cycles plus 7 declined rows have no stamp", "14 — only the open cycles lack a stamp", "82 — the stamped rows double-count", "0 — every cycle is stamped eventually"],
      answer: 0,
      why: "COUNT(shipped_at) counts non-NULL stamps (82); COUNT(*) counts all rows (103). The 21-row gap is the 14 open cycles plus the 7 declined rows — populations with no close to stamp, by definition.",
      notes: [
        { choice: 1, why: "The declined rows have no stamp either — a reversed cycle never settles, so it never closes. Forgetting them overstates the stamp coverage as 82/89 instead of 82/103." },
        { choice: 3, why: "'Eventually' is a projection, not a fact — the 7 declined rows will never stamp. A census that assumes future settlement is a forecast wearing a census label." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-4",
      prompt: "Two analysts build the dunning register and both return SIX statements. One filtered i.status = 'open'; the other filtered p.id IS NULL after a LEFT JOIN to legs. Whose book is right, and what are the books?",
      choices: ["IS NULL — 6 statements / 15,217.00, including a paid-status lie; the status filter returns 6 / 19,609.00 including a part-paid statement", "status = 'open' — it reads the true open book; the IS NULL version wrongly includes a void statement", "Both identical — open statements never have legs, so the two queries always agree", "Neither — the register must be built from the payments table alone"],
      answer: 0,
      why: "Membership is rail evidence: the no-leg register reads 6 / 15,217.00 — five open statements (13,461.00) plus #28, marked paid at 1,756.00 with zero legs. The status='open' book (6 / 19,609.00) catches partial #25 (6,148.00 with a 4,000.00 leg) and misses the lie — same count, different book.",
      notes: [
        { choice: 1, why: "The void-but-debited #11 (925.00) has a leg, so IS NULL correctly EXCLUDES it — the anti-join never pulls voids in. The claim inverts the evidence rule." },
        { choice: 2, why: "They agree on the COUNT (6) and disagree on the rows — which is exactly why 'same count' audits fail. Reconcile on members and rupees, never on row counts alone." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It promotes the division to real arithmetic before integer truncation", "It rounds the result to a percentage", "It filters to declined cycles only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 0,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 0.",
      notes: [
        { choice: 1, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the decline map reads zero everywhere, including APAC." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-6",
      prompt: "The cycle-count ladder runs 24, 17, 14, 13, 5 cycles, then FOUR relationships tie at 4. Under RANK, what rank do the two 3-cycle relationships carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-cycle relationships share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. A portfolio pack publishing RANK semantics with a DENSE_RANK number is how ladder disputes start." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic ladder bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-7",
      prompt: "The limit desk gates an offer at '13 or more statement cycles'. Relationships run 24, 17, 14, 13, 5, then a four-way tie at 4. How many clear the HAVING COUNT(*) >= 13 gate?",
      choices: ["4", "5", "8", "9"],
      answer: 0,
      why: "The ladder above the tie is 24, 17, 14, 13 — exactly four relationships. The 5-cycle relationship misses the floor, and the whole tie block at 4 sits below it regardless of how the rungs are shared.",
      notes: [
        { choice: 1, why: "5 counts the fifth-ranked relationship (5 cycles) — that gate is >= 5, not >= 13. Reading the ladder's positions as its values is the tie-adjacent trap." },
        { choice: 2, why: "8 would need the tie block inside the gate — four relationships at 4 cycles each, all below 13. Rank position never changes the underlying count." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-8",
      prompt: "SUM(amount_cents) / 100 passes QA because every group foot on this book is a whole multiple of 100. When is that query still wrong?",
      choices: ["On odd-paise rows — integer division truncates a 2,361.50 leg to 2,361; only amount_cents / 100.0 is safe row-wide", "Never — whole-multiple foots prove every row divides cleanly", "Only when the result is displayed, not computed", "Only for the wire rail; card legs are always even paise"],
      answer: 0,
      why: "Group foots being whole multiples says nothing about the rows inside them: SUM of truncated integers is wrong even when its input happened to foot. The paise read is amount_cents / 100.0 — the .0 forces real division before any truncation, and the rounding happens once at the edge.",
      notes: [
        { choice: 1, why: "The foots ARE whole multiples on this book — which is exactly why the bug passes QA. Aggregate-level checks cannot certify row-level division." },
        { choice: 3, why: "Both rails carry odd-paise legs — the rail is not a currency property. Any INTEGER/INTEGER division on money is one odd row away from a silent half-paise leak." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-9",
      prompt: "A staging slice feeds WHERE spend > (SELECT AVG(spend) FROM staging_customers) and the report returns ZERO rows for a market that definitely has spenders. First suspicion?",
      choices: ["The inner fold returned zero rows — AVG over an empty set is NULL, spend > NULL is UNKNOWN, and the whole report silently empties", "The market's customers genuinely spend below average — the zero is correct", "The comparison needs an index to run on staging tables", "The outer query needs DISTINCT before the comparison works"],
      answer: 0,
      why: "A scalar subquery over an empty staging slice returns NULL — not an error — and every comparison against NULL is UNKNOWN, so zero rows pass the filter while the query looks valid. The fix is staging hygiene: assert the inner fold's population before trusting the gate.",
      notes: [
        { choice: 1, why: "A confident zero is sometimes right — but 'definitely has spenders' plus an empty result is the NULL-comparison signature, and it reproduces on every refresh until the slice is fixed." },
        { choice: 2, why: "No index changes three-valued logic. The failure is semantic, not physical — the query plan is fine and the answer is still empty." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-10",
      prompt: "A month-close packet stacks the dunning register and the recovered register with UNION, and a reviewer says one row vanished. Diagnosis?",
      choices: ["The branches emitted identical rows (same status label, same counts) and UNION deduped them — stack with UNION ALL plus a column that says which book each row is from", "UNION caps the stack at the first branch's row count", "UNION cannot stack two SELECTs over the same table", "The rows were never in the second branch — UNION has no effect on duplicates"],
      answer: 0,
      why: "UNION dedups whole rows across branches. Two registers that print byte-identical rows — same status label, same count, same rupees, no branch label — collapse into one, and the packet loses a register with no error anywhere. UNION ALL plus a distinguishing book column is the fix, with the comment stating why duplicates are impossible.",
      notes: [
        { choice: 1, why: "UNION never truncates by count — it collapses only exact duplicate rows, which is worse because nothing announces the loss." },
        { choice: 3, why: "Dedup across branches is UNION's defining behavior. The two registers legitimately can print identical cells (one open statement, one rupee figure), which is precisely when it bites." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-11",
      prompt: "The close packet prints the ledger proof. What are the numbers that gate the ship?",
      choices: ["181,080 debits against 181,080 credits — delta 0", "69,612 debits against 69,612 credits — delta 0", "181,080 debits against 69,612 credits — delta 111,468", "44,196 debits against 44,196 credits — delta 0"],
      answer: 0,
      why: "The trial balance across all 80 ledger entries ties at 181,080 debits and 181,080 credits — delta 0, or the close does not ship. Every other figure in the packet nets into that identity.",
      notes: [
        { choice: 1, why: "69,612 is the cash account's credit side (the payments total), one account — not the whole-book fold. Quoting it as the trial balance shrinks the proof by three-quarters." },
        { choice: 2, why: "A 111,468 delta would be a blown books-tie — a stop-the-line incident, not a line in the packet. If you ever compute that delta, the first move is checking which column you summed." },
        { choice: 3, why: "44,196 is cash's NET (debits minus credits) — a balance, not a trial balance. Balances never prove the books; the debit and credit TOTALS do." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-12",
      prompt: "The rails census reads 27 settlement legs across 22 statements. What explains the five extra legs?",
      choices: ["Five statements settle on split plans crossing both the card and wire rails", "Five legs are duplicate filings the rails team entered twice", "Five statements paid twice their dues by bank error", "The census double-counts the wire rail's NEFT legs"],
      answer: 0,
      why: "Leg distribution reads 0 legs × 6 statements, 1 leg × 17, 2 legs × 5 — the five two-leg statements settle on split plans, one leg per rail. 27 legs, 22 statements, no anomaly in it.",
      notes: [
        { choice: 1, why: "Duplicates would be a reconciliation anomaly — and the verified anomaly list is the void-but-debited #11 and the paid-status #28, plus the split plans, which are by design." },
        { choice: 2, why: "Split plans are card-then-wire or partial-and-rest arrangements, not errors — the coverage census still reads 21 exact with them included." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-13",
      prompt: "The status-by-market grid prints no LATAM row for 'pending'. What does the grid mean?",
      choices: ["LATAM has zero pending cycles — only observed combinations print, so absent rows are zero counts", "LATAM's pending cycles are missing from the db — a data-loss incident", "The grid has a bug — every status-market pair must print", "LATAM pending cycles exist but carry NULL in the status column"],
      answer: 0,
      why: "GROUP BY region, status prints observed combinations only: 13 of the 16 cells appear, and LATAM's 2 cycles are both delivered — its other three fates are zeros that never print. Absent means zero, not missing.",
      notes: [
        { choice: 1, why: "Nothing is missing — the count IS the definition. A 16-cell grid is a LEFT JOIN from a pairs spine plus COALESCE, a presentation choice, not a correctness fix." },
        { choice: 3, why: "NULL statuses would print as their own row in the grid — the fact that no NULL row appears is itself evidence the status column is fully populated." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-14",
      prompt: "The coverage census reads 21 exact-covered statements — but 22 statements carry legs. Which statement moved, and which way?",
      choices: ["#11 is void but drew its 925.00 leg — it folds INTO exact by construction, while paid-no-leg #28 folds OUT", "#28 is paid with no legs — it folds INTO exact while void #11 folds OUT", "Both #11 and #28 fold into exact — the census double-counts", "Neither folds in — the census under-counts by two"],
      answer: 0,
      why: "Exact means covered-to-the-paise both sides: #11's leg makes its covered amount equal its (void) amount, so it folds in; #28 has no legs, so it folds out of exact and into the no-payment register. 22 leg carriers, 21 exact — the one-statement gap is #28.",
      notes: [
        { choice: 1, why: "Reversed — #28 has zero legs, so nothing on the rail side can equal its amount. It cannot be exact-covered by construction." },
        { choice: 2, why: "Folding both in would read 23, not 21 — the census reconciles precisely because one folds in and the other folds out." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-15",
      prompt: "A collections calendar buckets statements by STRFTIME('%m', issued_on). What breaks?",
      choices: ["January 2024 and January 2025 merge into one bucket — '%m' has no year, so the spine needs '%Y-%m'", "Nothing — '%m' is the standard month bucket", "Only day boundaries shift — the months still separate correctly", "'%m' returns a number, so the ORDER BY breaks"],
      answer: 0,
      why: "The 28 statements span 2024-01 to 2025-02: '%m' yields 12 buckets instead of 14 and merges January-2024 into January-2025. The fold still foots to the same total — the merge is silent, which is why it survives QA.",
      notes: [
        { choice: 1, why: "Compiling and footing are not correctness — the aged book becomes fiction the moment two years share a bucket, and no error ever fires." },
        { choice: 2, why: "'01' through '12' sorts fine as text — the damage is the merge, not the sort. That is what makes this trap expensive: everything looks ordered." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-16",
      prompt: "One-pass fate census: 52 / 30 / 14 / 7 reconciling to 103. Which pair of folds makes the branch sums reconcile by construction?",
      choices: ["COUNT(*) FILTER (WHERE status = …) per fate — with SUM(CASE WHEN status = … THEN 1 ELSE 0 END) as the portable twin", "COUNT(status) per fate — the NULLs do the separation", "SUM(1) per fate with GROUP BY status and a HAVING clause per fate", "COUNT(*) with GROUP BY status — four sequential queries, one total each"],
      answer: 0,
      why: "FILTER (WHERE …) branches per aggregate in one scan, and the branch counts sum to COUNT(*) = 103 because the arms are exhaustive and disjoint — that reconciliation IS the correctness argument. SUM(CASE …) is the same census in portable dialect.",
      notes: [
        { choice: 1, why: "COUNT(status) counts non-NULL values — every cycle carries a status, so every branch would read 103 and the census would fold to nonsense." },
        { choice: 2, why: "HAVING filters groups after they form — it cannot produce four branches in one pass. Four sequential queries are four chances to drift between refreshes." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-17",
      prompt: "The bench pack folds each partner's SKUs with GROUP_CONCAT(p.name). A reviewer says the same partner printed two different strings on two runs. Why?",
      choices: ["GROUP_CONCAT's concatenation order is undefined — demand one with ORDER BY inside the fold or fold from a pre-sorted stage", "The partner has duplicate rows in products — dedupe first", "GROUP_CONCAT truncates at 8 KB and the tail was cut", "The strings differ by stray whitespace — TRIM before folding"],
      answer: 0,
      why: "The fold follows scan order, and scan order changes with the query plan — a different index, a different string. Deterministic packs need an explicit order: GROUP_CONCAT(p.name, ', ' ORDER BY p.name) on modern SQLite, or a sorted derived stage feeding the fold.",
      notes: [
        { choice: 1, why: "Duplicates would shift every count in the pack, not just the string cell — and this bench has 16 products across 6 partners with no duplicate names." },
        { choice: 2, why: "8 KB limits bite on million-row folds — three SKUs per partner never gets near it. The reshuffle is order, not length." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-18",
      prompt: "An analyst joins transaction lines to statement cycles and reports the cycle book at 103,244.55. The true book is 34,833.28. What happened?",
      choices: ["Fan-out: 251 lines joined against 103 cycles counts each cycle's total once per line — fold the money before joining", "The book grew between refreshes — re-pull the table", "ROUND dropped precision across 251 lines", "The join should be INNER, not LEFT"],
      answer: 0,
      why: "SUM(o.total) after the join runs at line grain — one row per transaction line — so each cycle's total is counted once per line. The fix is folding at the money's grain first, then joining the fold.",
      notes: [
        { choice: 1, why: "The 103,244.55 is not drift, it is arithmetic — the overshoot tracks the line-per-cycle fan-out. No refresh will fix a grain error." },
        { choice: 2, why: "The error is roughly triple the true book — far beyond any rounding drift. Precision is a red herring here." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-19",
      prompt: "A spend band is CASE WHEN spend >= 3000 THEN 'priority' WHEN spend >= 2000 THEN 'preferred' END — no ELSE. What does the pack print for the other 11 customers?",
      choices: ["NULL — the mass band is a hole, and its rows vanish from equality filters and sort unpredictably", "'mass' — CASE defaults to the last WHEN", "0 — CASE returns zero when nothing matches", "A syntax error — CASE requires ELSE"],
      answer: 0,
      why: "An ELSE-less CASE yields NULL for non-matching rows: the mass band never prints, band counts quietly exclude 11 customers, and the hole is invisible unless someone reconciles band counts to COUNT(*).",
      notes: [
        { choice: 1, why: "The default is NULL, not the last WHEN — the WHEN arms are tests, not a fallback chain." },
        { choice: 2, why: "NULL sorts first or last depending on the dialect's NULL ordering — the band is still gone, and the sort order now differs between environments." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-20",
      prompt: "A per-market share divides 100.0 * SUM(declines) by COUNT(*). One staging slice has zero cycles, and SQLite prints NULL for x/0 rather than erroring. Why is IFNULL(COUNT(*), 1) the wrong guard, and what is the right one?",
      choices: ["IFNULL never fires — COUNT(*) returns 0, not NULL; the honest guard is NULLIF(COUNT(*), 0), which NULL-propagates the share on purpose", "IFNULL is right — it turns the zero into a one and the share reads 0", "NULLIF is wrong — it errors on zero; only IFNULL is legal", "No guard is needed — zero denominators print 0"],
      answer: 0,
      why: "COUNT(*) is never NULL, so IFNULL(COUNT(*), 1) is dead code — the division still NULLs out while the reader believes it was guarded. NULLIF(COUNT(*), 0) converts the zero to NULL deliberately: the share prints an empty cell, which is the honest read of a market with no cycles.",
      notes: [
        { choice: 1, why: "IFNULL(0, 1) returns 0 — the fallback only replaces NULLs, and COUNT never produces one. The share still prints NULL, just with false confidence attached." },
        { choice: 2, why: "NULLIF is a legal scalar — it returns NULL when its two arguments match, which is exactly the deliberate empty cell this report wants." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-21",
      prompt: "A running settled-dues walk uses SUM(amount_cents) OVER (ORDER BY paid_on). Two legs share one paid_on stamp and the walk's step disagrees with the statement-level fold. Why?",
      choices: ["The default frame is RANGE — tied stamps enter the running total together; ROWS BETWEEN UNPRECEDING AND CURRENT ROW makes each leg its own step", "The default frame is ROWS — tied stamps enter twice; dedupe the legs first", "The ORDER BY is wrong — walks must order by the leg id", "Window sums cannot agree with GROUP BY folds — use a correlated subquery instead"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE between unbounded preceding and current row — and RANGE treats peers as one step: both same-stamp legs enter together, so the intermediate step that would reconcile leg-by-leg never exists. ROWS gives each leg its own step.",
      notes: [
        { choice: 1, why: "ROWS is not the default — with ORDER BY the default is RANGE. Switching to ROWS is the fix, and a tiebreak (paid_on, id) makes the walk deterministic." },
        { choice: 2, why: "Ordering by id changes which leg leads a tie — it does not create the missing intermediate step, and it hides the frame question instead of answering it." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-22",
      prompt: "Which fold finds the statements settled on BOTH rails — the 5 split plans?",
      choices: ["INTERSECT of the card-leg statement set and the wire-leg statement set", "UNION of the two rail sets — union means both", "INNER JOIN of payments to itself on invoice_id", "EXCEPT of the card set from the wire set"],
      answer: 0,
      why: "INTERSECT keeps members present in both sets — exactly the split plans. 27 legs across 22 statements with 5 two-leg statements is the census the INTERSECT reproduces.",
      notes: [
        { choice: 1, why: "UNION merges the sets — every settled statement on either rail, not the ones on both. The word 'union' seduces; the semantics say otherwise." },
        { choice: 2, why: "A self-join on invoice_id pairs a statement's legs with each other — it counts ordered pairs and double-counts, and it never answers 'in both sets'." },
      ],
      difficulty: "medium",
    },
    {
      id: "axisbank-mcq-23",
      prompt: "Anomaly hunting with set ops: paid-status book EXCEPT leg-covered book, versus the reverse. What does each direction return?",
      choices: ["A EXCEPT B = statements claiming paid whose legs never moved (the #28 lie); B EXCEPT A = statements whose legs moved without a paid claim (void-but-debited #11 and the open partial #25)", "Both directions return the same rows — EXCEPT is symmetric", "A EXCEPT B returns the void anomalies; the reverse returns the paid lies", "EXCEPT errors on text columns — cast everything to ids first"],
      answer: 0,
      why: "EXCEPT keeps left-side rows absent from the right side — the direction IS the semantics. Forward finds claims without evidence; backward finds evidence without a matching claim. The two anomaly families are the two directions.",
      notes: [
        { choice: 1, why: "Set difference is asymmetric by definition — if both directions matched, the operator would be an expensive equality check." },
        { choice: 2, why: "Swapped directions swap the families — which is how a 'verified' anomaly list ships with both rows mislabeled and nobody notices until the call list fires." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-24",
      prompt: "Per-market average gates: one analyst writes a correlated subquery in WHERE; another folds a per-market derived table and joins it back. Both return the same 4 markets. What actually differs?",
      choices: ["Cost and failure modes — the correlated version re-runs per outer row and silently empties when a market's inner fold comes back empty; the staged fold computes once and its join makes empty markets explicit", "Nothing — identical plans, identical semantics, identical failure modes", "The correlated version is always faster on small tables", "The staged version cannot feed window functions"],
      answer: 0,
      why: "Semantics can coincide while behavior diverges: the correlated gate re-executes per row with a silent empty case, the staged fold is one computation that is reusable, reviewable, and visible in the join. The screen is which trade-offs you can name.",
      notes: [
        { choice: 1, why: "Small tables hide cost today — the grade is the habit that survives a thousand markets, not the plan on 16 rows." },
        { choice: 3, why: "Staged folds are the standard input to window logic — the opex walk and the ladder both stage folds before the window. The claim inverts practice." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-25",
      prompt: "A per-customer cycle-gap walk uses LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at). The analyst COALESCEs the gap to 0 'to clean the first row'. What did that do?",
      choices: ["Invented a same-day repeat cycle for every customer's first cycle — the boundary is NULL by definition, so label it baseline", "Nothing — the first row's gap was already 0", "Broke the query — partitions cannot carry an ORDER BY", "Fixed it — NULL gaps are errors that break downstream averages"],
      answer: 0,
      why: "The first row of EVERY partition carries NULL as its look-back — that is LAG at a partition boundary, not dirt. Zero-filling fabricates a 0-day gap per customer: 16 fake zeros drag every interval average down and the KPI is silently wrong.",
      notes: [
        { choice: 1, why: "PARTITION BY and ORDER BY coexist — that combination IS the per-customer walk. Removing either breaks the semantics, not the syntax." },
        { choice: 2, why: "Reporting NULL as 'baseline' is the honest label — the same policy as the month-walk's first step and the unstamped close lag. An average that includes fabricated zeros is a different number." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-26",
      prompt: "Two versions of the same month filter: WHERE STRFTIME('%Y-%m', created_at) = '2024-01' versus WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01'. Both return 8 cycles. Why does the review prefer the second?",
      choices: ["The range predicate stays sargable — an index on created_at serves it, while wrapping the column in a function forces a full scan", "The first is wrong — it returns a different month", "STRFTIME is deprecated in modern SQLite", "The range version rounds timestamps — the first is more precise"],
      answer: 0,
      why: "Same rows, different plans: the half-open range lets an index on created_at seek the month's span; the wrapped column is opaque to the index and scans every row. At 103 rows the scan is free — the review is grading the habit that survives at scale.",
      notes: [
        { choice: 1, why: "Both predicates select the same 8 cycles — the difference is the plan, not the result, which is exactly why this bug ships quietly and surfaces only under load." },
        { choice: 3, why: "The range is exact, not approximate: created_at < '2024-02-01' includes the last night of January, which BETWEEN '2024-01-01' AND '2024-01-31' would silently drop." },
      ],
      difficulty: "hard",
    },
    {
      id: "axisbank-mcq-27",
      prompt: "The co-brand bench folds settled volume through products and lines. Which partner tops the book, and at what figure?",
      choices: ["Nordic Gadgets AB — 11,130.25 on 3 listings", "Midwest Hardware Co — 9,294.93 on 3 listings", "Alpine Audio GmbH — 4,765.63 on 2 listings", "Shenzhen Electro — 3,049.07 on 3 listings"],
      answer: 0,
      why: "The bench fold reads Nordic first at 11,130.25 — roughly a third of the 34,833.28 book — with Midwest Hardware second at 9,294.93. Two partners carry more than half the settled volume.",
      notes: [
        { choice: 1, why: "Midwest is the volume #2 — a strong bench partner, but not the top of this ladder." },
        { choice: 2, why: "Alpine tops the trust ladder (4.8 rating) but not the volume ladder — two different reads of the same bench, and the pack must say which one it is printing." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-28",
      prompt: "The opex fold over 36 expense lines: which category carries the biggest rupee foot?",
      choices: ["Rent — 14 lines for 16,800.00", "Ads — 14 lines for 4,570.00", "Travel — 3 lines for 2,521.00", "Tools — 5 lines for 1,525.00"],
      answer: 0,
      why: "Rent's 16,800.00 outweighs Ads, Travel and Tools combined (8,616.00) — the fixed-cost floor every growth read is netted against.",
      notes: [
        { choice: 1, why: "Ads ties Rent on line count (14 each) — count is not value. Reading line counts as a money ladder is the trap." },
        { choice: 2, why: "Travel's 2,521.00 over just 3 lines is the highest per-line average in the book — a different ladder entirely, and worth naming as such." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-29",
      prompt: "The settlement clock reads 28.4 days average against flat 30-day terms. What is the 13?",
      choices: ["The fastest settlement in the paid book — 13 days from issue to first payment", "The number of statements settled within terms", "The median settlement day", "The grace period before dunning fires"],
      answer: 0,
      why: "The clock ships as fastest 13, slowest 84, average 28.4 — the spread is the float story. 20 of the paid book's statements settle with legs; the 84-day tail is the collections referral.",
      notes: [
        { choice: 1, why: "22 statements carry legs across the whole book — 'within terms' is a different census and needs its own WHERE clause, not a borrow from the clock." },
        { choice: 2, why: "28.4 is the mean; nobody quoted a median. Upgrading a mean to a median in the packet is exactly the kind of silent redefinition the definition discipline exists to stop." },
      ],
      difficulty: "easy",
    },
    {
      id: "axisbank-mcq-30",
      prompt: "Transaction lines band at the 55 per-swipe floor: the micro-ticket arm runs 268 swipes averaging 31.01. What does the big-ticket arm read?",
      choices: ["230 swipes averaging 115.85 — value lives big, volume lives micro", "230 swipes averaging 31.01 — the bands share an average", "268 swipes averaging 115.85 — the arms split the volume evenly", "498 swipes averaging 70.89 — the blended book average"],
      answer: 0,
      why: "The big-ticket arm carries 230 swipes at a 115.85 average per swipe — 498 total swipes split 268/230, and the two arm averages are nearly four times apart. That spread is the pricing pod's whole story.",
      notes: [
        { choice: 3, why: "70.89 is the blended per-swipe average across both arms — quoting it as a band average erases the split the fold exists to show." },
        { choice: 1, why: "The arms do not split evenly on lines either — 133 micro lines against 118 big lines. Volume and value land on different arms on purpose." },
      ],
      difficulty: "medium",
    },
  ],

  cases: [
    {
      id: "cs-axisbank-1",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The limit-band ladder",
      brief:
        "Axis-flavored brief on the storefront db: the cards portfolio review opens with the limit-band ladder — every card/loan customer ranked by lifetime booked spend, the number the limit desk treats as the limit proxy, cut at the preferred-band floor. Probed facts: 103 statement cycles worth 34,833.28 (average ticket 338.19, spread 25.47 to 1,088.44); the ladder reads Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56, Chloe Dubois 2,667.93 — the 2,000-plus cohort foots to **24,789.63, the 71.2% band boundary**, and the four customers above 3,000 carry **22,121.70, 63.5% of the book**. The ladder reads biggest book first, and the rungs are dense so tied books can share one when they come.",
      ask: "Return each customer with lifetime spend (2dp) and a dense rank, biggest book first, cut at the 2,000-plus preferred band floor.",
      template: `SELECT name,
       spend,
       DENSE_RANK() OVER (ORDER BY spend {1}) AS rung
FROM (SELECT c.name AS name,
             ROUND({2}(o.total), 2) AS spend
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      GROUP BY c.id)
WHERE spend >= {3}
ORDER BY rung, spend DESC`,
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book direction",
          why: "The rank rides spend DESC, so Alice Chen's 7,262.35 takes rung 1 and the final ORDER BY rung reads the ladder top-down. ASC dense-ranks the smallest book first — an inverted ladder that opens the review on Chloe's 2,667.93 and calls it coverage.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the spend fold",
          why: "Lifetime booked spend is SUM(o.total) per customer — the limit proxy itself. COUNT folds cycles into counts (24, 17, 14…), AVG into per-cycle tickets — both real numbers wearing the wrong name, and both fall through the 2,000 floor into an empty ladder.",
        },
        {
          answer: "2000",
          kind: "number",
          noVerify: true,
          label: "the preferred-band floor",
          why: "The preferred band starts at 2,000: five customers clear it and their books foot to 24,789.63 — the 71.2% boundary the limit desk quotes. A 3,000 floor re-cuts the ladder to the four priority relationships (22,121.70, 63.5%) mid-review.",
        },
      ],
      distractors: ["COUNT", "AVG", "ASC", "1000", "MAX"],
      walkthrough:
        "Two stages: fold spend per relationship, then rank and cut at the band floor. The derived table joins 103 cycles to their customers and folds SUM(o.total) per id — rounded once at the edge — then the window dense-ranks the folded rows and the outer WHERE draws the floor: five customers clear 2,000, reading Alice Chen 7,262.35 (rung 1), Emma Wilson 6,640.56 (2), Grace Kim 4,574.23 (3), Maya Patel 3,644.56 (4), Chloe Dubois 2,667.93 (5) — a five-row foot of 24,789.63, the 71.2% band boundary, with the top four (22,121.70, 63.5%) forming the priority tier above 3,000. DENSE_RANK is the policy: on this book the spends are all distinct so RANK and ROW_NUMBER print the same rungs today, but the dense choice is what keeps tied books sharing a rung the day the ladder ties — and the floor cut means a tie AT 2,667.93 would still make the cut whole. The distractors fail honestly: COUNT in the fold turns spend into cycle counts (24, 17, 14…) and every one falls below the floor — the ladder empties; AVG folds per-cycle tickets (302.60 for Alice, not 7,262.35) and empties it too; MAX folds each customer's biggest single ticket (topping out at 1,088.44) — empty again; ASC inverts the read so Chloe opens the review; a 1000 floor lets the micro-ticket relationships back in (eight rows, foot broken). The habit being graded: the band floor is a definition — state it, then let the ladder prove it.",
    },
    {
      id: "cs-axisbank-2",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The dunning register, by status",
      brief:
        "Axis-flavored brief on the storefront db: the collections huddle builds the dunning register from rail evidence, never from the status column — a statement enters the book when ZERO payment legs ever touched it. Probed facts: the no-leg register reads **6 statements / 15,217.00**, splitting by claimed status into an open cohort of 5 / **13,461.00** (oldest due 2024-11-28) and one paid-status lie, statement #28 at **1,756.00** due 2025-03-14 with no leg ever moved. The mirror anomaly stays off-book: #11 is void but drew its 925.00 leg, so it settles out by construction. Money is INTEGER paise — the rupee read is amount_cents / 100.0 — and the register reads biggest book first, oldest due date beside each book for the call list.",
      ask: "Return the dunning register by claimed status: status, statement count, dues (2dp) and oldest due date, biggest book first.",
      template: `SELECT i.status AS claimed_status,
       COUNT(*) AS dunning_rows,
       ROUND(SUM(i.amount_cents) / {1}, 2) AS dues,
       {2}(i.due_on) AS oldest_due
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = {3}
WHERE p.id IS {4}
GROUP BY i.status
ORDER BY dues {5}`,
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the paise divider",
          why: "The rupee read is amount_cents / 100.0 — float division, rounded once. Divide by 1000 and every book prints a tenth its size (the open cohort reads 1,346.10 instead of 13,461.00); bare integer division is the truncation habit the whole kit drills against.",
        },
        {
          answer: "MIN",
          kind: "keyword",
          label: "the oldest-due fold",
          why: "The call list works oldest-first, so the register carries MIN(due_on) — 2024-11-28 for the open cohort. MAX would print the NEWEST due and send collections to the freshest rows first, quietly starving the aged book it exists to chase.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "Legs point at their statement: ON p.invoice_id = i.id. Joining on p.id pairs the rail's own row numbers against itself — the anti-join loses its meaning and the register folds to the wrong book entirely.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg arm",
          why: "IS NULL is the register: statements whose LEFT JOIN found no legs — 6 / 15,217.00, the paid lie included. IS NOT NULL flips to the 22 settled statements and the dunning book becomes its own complement.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book order",
          why: "The huddle reads the biggest book on top: open 13,461.00, then the paid lie 1,756.00. ASC headlines the single-statement lie above the five-statement cohort — a correct query that buries the real exposure.",
        },
      ],
      distractors: ["MAX", "1000", "p.id", "NOT", "ASC"],
      walkthrough:
        "A dunning register is an anti-join with the evidence rule attached, cut by the status the system claims. The LEFT JOIN keeps every statement and hands the legless ones NULL rails; WHERE p.id IS NULL keeps exactly the never-remitted six, and GROUP BY status splits them into the book collections actually works: open 5 statements / 13,461.00 with oldest due 2024-11-28, and paid 1 / 1,756.00 — statement #28, whose status claims settled and whose rails say nothing ever moved, due 2025-03-14. The mirror anomaly never appears: void #11 drew its 925.00 leg, so it has a rail hit and stays off the register — the two error modes are complements, and both are why membership is evidence. SUM(i.amount_cents) / 100.0, rounded once, sizes each book in rupees; MIN(i.due_on) carries the call list's starting point. The distractors fail honestly: 1000 prints every book a tenth its size; MAX in the date fold sends the call list to the newest dues; p.id in the join key pairs the rail against itself and the register dissolves; NOT flips the arm to the 22 settled statements — the register becomes its own complement; ASC headlines the 1,756.00 lie above the 13,461.00 cohort. The habit being graded: the IS NULL arm IS the metric, and the status column is only there to label what the rails already proved.",
    },
    {
      id: "cs-axisbank-3",
      tier: "easy",
      topic: "x2",
      universe: "fraud",
      title: "The one-pass decline census",
      brief:
        "Axis-flavored brief on the storefront db: the risk pod opens every fraud stand-up with a one-pass fate census — booked, posted clean, settling, open and declined in a single scan, because four sequential queries are four ways to drift. Probed facts: 103 statement cycles booked; the fate mix reads 52 posted-and-closed clean (50.5%), 30 closed-and-settling, 14 open still accruing, 7 declined/reversed (6.8%). The decline share is the headline: **6.8% booked**, with APAC the hottest market at 8.1% and LATAM clean at 0 across its 2 cycles. The branch sums must reconcile to 103 by construction — *a census that needs a second query to prove itself is not a census.*",
      ask: "Return the one-pass fate census over statement cycles — booked, posted-clean, settling, open-accruing and declined counts plus the decline share (1dp) — in a single scan.",
      template: `SELECT COUNT(*) AS booked,
       COUNT(*) FILTER (WHERE status = {1}) AS posted_clean,
       COUNT(*) FILTER (WHERE status = 'shipped') AS settling,
       COUNT(*) FILTER (WHERE status = 'pending') AS open_accruing,
       COUNT(*) FILTER (WHERE status = 'cancelled') AS declined,
       ROUND({2} * {3}(*) FILTER (WHERE status = 'cancelled') / COUNT(*), 1) AS decline_share
FROM orders`,
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the posted-clean arm",
          why: "Posted-and-closed clean is the stage map's 'delivered' fate — 52 of 103 cycles (50.5%). 'Shipped' is the settling stage, one step earlier: slotting it reads 30 posted clean and quietly deflates the clean book by 22 cycles.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent scaler",
          why: "The share is 100.0 BEFORE the division — bare 100 keeps integer arithmetic (100 × 7 / 103 truncates to 6) and the headline reads 6.0 instead of 6.8. The .0 is the arithmetic, not decoration.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the conditional fold",
          why: "The census folds row presence per fate: COUNT(*) FILTER (WHERE …) counts cycles in one scan. SUM and AVG are value folds, not presence folds — SUM(*) is not even legal, and the branches must sum to COUNT(*) = 103 by construction.",
        },
      ],
      distractors: ["'shipped'", "'open'", "SUM", "AVG", "10"],
      walkthrough:
        "One scan, six cells. COUNT(*) over orders books 103 cycles; each FILTER (WHERE …) branch counts one fate of the stage map — delivered 52, shipped 30, pending 14, cancelled 7 — and the four branches reconcile to 103 because the arms are exhaustive and disjoint; that reconciliation IS the correctness argument. The decline share rides the same scan: 100.0 scales first so the division is real arithmetic, the cancelled branch counts the 7 declined rows, and ROUND(..., 1) prints 6.8 — the figure the risk huddle quotes beside APAC's 8.1% market heat. The distractors fail honestly: 'shipped' in the posted-clean arm reads 30 and deflates the clean book while double-reading the settling stage; 'open' is invoice vocabulary, not a cycle status, and counts 0; SUM and AVG are not row-presence folds and error out of the census; a bare 10 scales the share back into integer math and prints 6.0 — a wrong headline that still looks plausible. The habit being graded: one scan, exhaustive arms, denominators stated before the ratio.",
    },
    {
      id: "cs-axisbank-4",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The co-brand bench fold",
      brief:
        "Axis-flavored brief on the storefront db: the partnerships desk folds the co-brand bench through its SKUs to the settled line grain — listings, lines and booked volume per partner, cut to the trusted tier. Probed facts: the trusted bench (rating 4.5-plus) is two partners — Nordic Gadgets AB at 4.6 with 3 listings and Alpine Audio GmbH at 4.8 with 2 — and the fold through products and transaction lines reads Nordic **43 lines for 11,130.25** and Alpine **40 lines for 4,765.63**. Midwest Hardware Co (9,294.93, rating 4.4) and the rest of the bench sit below the trust floor. Money here is REAL rupees at the line grain — quantity is swipes, unit_price is the per-swipe amount — and the desk reads biggest book first.",
      ask: "Return the trusted-bench fold — partner, rating, listing count, settled line count and booked volume (2dp) — biggest book first.",
      template: `SELECT s.name AS partner,
       s.rating AS grade,
       COUNT(DISTINCT p.id) AS listings,
       COUNT(oi.id) AS lines,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS booked
FROM suppliers s
JOIN products p ON p.supplier_id = {1}
JOIN order_items oi ON oi.product_id = p.id
WHERE s.rating >= {2}
GROUP BY s.id
ORDER BY booked {3}`,
      slots: [
        {
          answer: "s.id",
          kind: "keyword",
          label: "the bench join key",
          why: "Products point at their partner: ON p.supplier_id = s.id. Joining on p.id pairs the catalog against itself and the fold re-reads the whole book per partner — 95 lines / 16,562.62 under every surviving name instead of 43 and 40.",
        },
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the trust floor",
          why: "The trusted bench is rating 4.5-plus: Nordic 4.6 and Alpine 4.8 in, Midwest 4.4 out. A 4.4 floor re-admits Midwest's 9,294.93 and the pack is no longer the trusted tier — the floor IS the definition.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book order",
          why: "The desk reads Nordic's 11,130.25 first, Alpine's 4,765.63 second. ASC inverts the pack and headlines the smaller book — a correct fold wearing the wrong order.",
        },
      ],
      distractors: ["p.id", "oi.id", "4.4", "2", "ASC"],
      walkthrough:
        "Three hops, one fold per partner. The chain runs suppliers → products → order_items on the keys, the WHERE draws the trust floor at 4.5, and GROUP BY s.id folds each partner once: COUNT(DISTINCT p.id) counts listings (3 and 2 — the fan-out guard, since lines repeat products), COUNT(oi.id) counts settled lines (43 and 40), and SUM(quantity × unit_price) books Nordic 11,130.25 and Alpine 4,765.63 — the desk's two books, biggest first. The grain matters: quantity × unit_price is swipes × per-swipe amount on REAL rupees, so no paise fold applies on this path. The distractors fail honestly: p.id in the join key self-pairs the catalog and prints 95 lines / 16,562.62 under every surviving partner; oi.id pairs products against rail row numbers and the fold collapses to a single line; 4.4 re-admits Midwest and the trusted tier becomes three partners; a floor of 2 trusts all six partners and the pack loses its point; ASC hands the desk Alpine's 4,765.63 as the headline. The habit being graded: fold per partner at one grain, guard listings with DISTINCT, and let the trust floor do the cutting.",
    },
    {
      id: "cs-axisbank-5",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The ticket-band fold",
      brief:
        "Axis-flavored brief on the storefront db: the pricing pod bands settled transaction lines at the 55 per-swipe floor — a micro-ticket arm and a big-ticket arm — because annual-fee tests price differently against swipe volume than against ticket size. Probed facts: the micro arm carries **268 swipes averaging 31.01** a swipe; the big arm carries **230 swipes averaging 115.85**. Volume lives micro, value lives big — 498 swipes across 251 lines, a 2.44 line-per-cycle basket. The arms must be exhaustive (every line lands in exactly one), and the averages are line-grain AVG of the per-swipe amount, rounded once at the edge.",
      ask: "Return the ticket-band fold — band label, settled swipes, line count and average per-swipe ticket (2dp) per band — biggest swipe book first.",
      template: `SELECT CASE WHEN unit_price < {1} THEN 'micro_ticket' ELSE 'big_ticket' END AS band,
       SUM(quantity) AS swipes,
       COUNT(*) AS lines,
       ROUND(AVG(unit_price), 2) AS avg_swipe
FROM order_items
GROUP BY {2}
ORDER BY swipes {3}`,
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the band floor",
          why: "The pricing pod's floor is 55 per swipe: 133 micro lines average 31.01 against 118 big lines at 115.85. A 45 floor re-bands the 49.00 hub and both arms move; a 65 floor pulls the 59.99 speaker up — the floor IS the definition.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the CASE-alias group",
          why: "GROUP BY band folds the CASE's two arms once each. GROUP BY unit_price explodes the fold to one group per distinct price — 247 groups where the pod asked for 2, and no annual-fee read survives that.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-arm order",
          why: "micro 268 swipes headlines the volume story, big 230 second. ASC buries the volume arm under the value arm and the pod reads the pricing test backwards.",
        },
      ],
      distractors: ["45", "65", "quantity", "ASC", "unit_price"],
      walkthrough:
        "One CASE, two arms, one fold. The WHEN splits lines at the 55 per-swipe floor — micro below, big at or above — the ELSE guarantees exhaustiveness (every line prints in exactly one arm), and GROUP BY band folds each arm once: 268 swipes over 133 lines averaging 31.01, then 230 over 118 at 115.85, ordered biggest arm first. The averages are line-grain — AVG over unit_price, rounded once — because the pod prices per swipe, not per rupee. The distractors fail honestly: a 45 floor re-bands the 49.00 hub into micro and both arms move (247/251); a 65 floor pulls the 59.99 speaker up (297/201); banding on quantity puts every line in micro — no line swipes 55 times — and the big arm vanishes; GROUP BY unit_price shatters the fold into 247 groups; ASC headlines the 230-swipe value arm and buries the volume story. The habit being graded: the floor is a definition, the ELSE is the exhaustiveness proof, and the fold is one pass.",
    },
    {
      id: "cs-axisbank-6",
      tier: "hard",
      topic: "t7",
      universe: "expense",
      title: "The opex walk",
      brief:
        "Axis-flavored brief on the storefront db: the close's last read is the opex walk — month-by-month rupee foot of the expense book with the step to the prior month, so the CFO sees the spike before the footnote. Probed facts: 36 expense lines fold to **14 monthly buckets** from 2024-01 to 2025-02, opening at **1,719.00** and stepping **+1,416.00** into the August 3,210.00 spike, then giving **-1,665.00** back in September. The money is INTEGER paise on the wire — the rupee read is amount_cents / 100.0, rounded once — and the walk's first step is NULL by definition: *January has no prior month, and a zero there is a fabricated movement.*",
      ask: "Return the opex walk — month, opex foot (2dp) and step versus the prior month (2dp), chronological — staged so the LAG reads a folded month.",
      template: `SELECT month,
       opex,
       ROUND(opex - {1}(opex) OVER (ORDER BY month), 2) AS step
FROM (SELECT STRFTIME('%Y-%m', {2}) AS month,
             ROUND(SUM(amount_cents) / {3}, 2) AS opex
      FROM expenses
      GROUP BY month)
ORDER BY month {4}`,
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back",
          why: "Step = this month minus the PRIOR month: LAG(opex) walks backwards. LEAD walks forwards and every sign mirrors; MAX substitutes the running ceiling and the walk stops being a walk at every new high.",
        },
        {
          answer: "spent_on",
          kind: "keyword",
          label: "the expense stamp",
          why: "The opex clock is spent_on — the day the expense landed. created_at belongs to the cycle spine and is not an expenses column; pointing the walk at a foreign stamp errors the fold.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the paise divider",
          why: "Expenses book INTEGER paise: SUM(amount_cents) / 100.0, rounded once. A 1000 divider prints the August spike at 321.00 and every cell shrinks tenfold — the .0 is the arithmetic, not decoration.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological order",
          why: "The CFO reads January to February. DESC hands over the newest month first with its step already computed — an upside-down walk that reads like a forecast.",
        },
      ],
      distractors: ["LEAD", "MAX", "DESC", "created_at"],
      walkthrough:
        "Stage, then walk. The derived table folds 36 expense lines into 14 monthly buckets — STRFTIME('%Y-%m', spent_on) on the expense stamp, SUM(amount_cents) / 100.0 rounded once — and the outer query windows the folded months: LAG(opex) OVER (ORDER BY month) carries each month's predecessor, so the step column reads 2024-01 NULL (baseline, never zero), 2024-02 -279.00, the August step +1,416.00 into the 3,210.00 spike, and September's -1,665.00 give-back. The staging matters: you cannot LAG an unfolded scan, and the derived table is what lets the window read a folded month. The distractors fail honestly: LEAD mirrors every sign and hands the CFO a walk that predicts rather than compares; MAX replaces the walk with the running ceiling — flat zeros at every new high; DESC reverses the ledger and headlines February; created_at is not an expenses column and the fold errors. The habit being graded: stage the fold, walk the fold, and let January's NULL say baseline.",
    },
  ],

  problems: [
    { slug: "delinquency-buckets", why: "DPD aging of the no-leg book — the dunning register's next layer: buckets built off a pinned reference date, exactly how the collections huddle tiers 13,461.00 of open dues." },
    { slug: "credit-utilization-bands", why: "Utilization bands are the limit-band ladder's cousin — CASE-classified exposure per customer, the same mass/preferred/priority muscle at a different denominator." },
    { slug: "basket-depth-aov", why: "Lines per cycle beside average ticket — 2.44 lines and 338.19 on this book. The portfolio pod's ticket-depth read, drilled at practice scale." },
    { slug: "immediate-food-delivery-ii", why: "Share settled inside the promised window versus late — the in-cycle settlement rate is a conditional ratio with the denominator doing all the work." },
    { slug: "percentage-of-users-attended-a-contest", why: "A share whose denominator must include the customers who never transacted — the decline-share discipline (8.1% APAC) in textbook form." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Swiped-but-never-settled anti-join — authorization activity with no rail hit, the dunning register's behavioral cousin." },
    { slug: "sellers-with-no-sales", why: "Partner bench with no settled volume — co-brand SKUs that never drew a leg, the supplier-side twin of the no-leg statement read." },
    { slug: "second-highest-salary", why: "Second-biggest statement without LIMIT-OFFSET luck — nested logic the screens use to test whether you can rank money without re-ranking the whole book." },
    { slug: "managers-with-at-least-5-direct-reports", why: "HAVING-gated subquery — relationships carrying 5+ cycles before any offer ships, the gating pattern ahead of every limit-band read." },
    { slug: "game-play-analysis-iv", why: "First-event subquery plus join — customers whose FIRST swipe landed in the acquisition window: the onboarding cohort definition, computed not asserted." },
    { slug: "capital-gain-loss", why: "Limit increases minus limit drops net to the movement number — ordered add/drop algebra that mirrors how the limit desk reads band migrations." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-cycle relationship is the intensity crown on this book. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-customer argmax with tie-proof ordering — each relationship's top SKU, the cross-sell query the product pod runs before a campaign." },
    { slug: "the-most-recent-three-orders", why: "Per-customer latest-3 via window — the 'recent activity' rail on the servicing dashboard, ROW_NUMBER with a deterministic tie-break." },
    { slug: "keep-latest-dedupe", why: "Latest leg per statement — five statements settle on split plans across both rails, and the dedupe that keeps one authoritative leg is a real rails workflow." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger reflex behind the 181,080 against 181,080, delta-0 proof that gates every close." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window burst detection over account activity — the rails pod's velocity screen, tuned to the same 'too many legs in too few days' question it asks of settlement bursts." },
    { slug: "structuring-detection", why: "Sub-threshold splits that sum to a flagged total — the fraud pod's read on swipe structuring, exactly the pattern the decline census hunts at market scale." },
    { slug: "chargeback-rate-ranking", why: "Declined-and-reversed volume ranked per market — the 6.8% booked decline share broken out the way the risk huddle actually ranks it." },
    { slug: "gl-reconciliation", why: "Debits-equal-credits with a delta column — the 181,080 against 181,080, delta-0 reflex drilled at practice scale before the close owns it." },
    { slug: "journal-gap-detection", why: "Missing entries in a sequence of book rows — the ledger-hygiene scan that backs the 'books tie before anything ships' rule." },
    { slug: "balance-rollforward", why: "Opening balance plus movements equals closing — the cash walk behind the 44,196 net, staged exactly the way the close packets it." },
    { slug: "daily-balance-interest", why: "Accrual off daily balances — the lending desk's interest-earned read, computed the paise-safe way with the fold before the rate." },
    { slug: "prepayment-detection", why: "Legs that land before the due date — the fast tail of the 28.4-day settlement clock (13-day fastest), isolated per statement." },
    { slug: "duplicate-charge-pairs", why: "Same-amount, close-together leg pairs — the split-plan-versus-duplicate question the rails census answers with evidence, not vibes." },
    { slug: "transaction-velocity", why: "Swipes bucketed into burst windows — velocity limits are a time-bucket fold, and this is the pattern at practice scale." },
    { slug: "uber-first-transaction", why: "First-ever leg per customer — the onboarding cohort's first-swipe stamp, computed with the argmax guard the screens expect." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Consecutive-day swipe streaks — behavioral intensity for the limit desk, ranked without fan-out lies." },
    { slug: "maximum-transaction-each-day", why: "Peak settlement per day via window MAX — the daily high-water mark the rails huddle plots against the 2,578.22 average leg." },
    { slug: "delinquency-roll-rates", why: "Dues rolling from one aging bucket to the next — the collections pod's roll-rate read, the dunning register's forward-looking cousin." },
    { slug: "same-day-sale", why: "Swipe and settle on the same stamp — the instant-clearance read, and a first-occurrence pattern the rails team ships monthly." },
    { slug: "vintage-default-curves", why: "Cohorts tracked by booking month against later outcomes — vintage curves are the lending desk's way of saying LAG over a spine." },
  ],
};
