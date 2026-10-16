// IHG — Wave-11 (Task 102-ihg), travel domain, standard spec (brief 4 / dayInLife 3 /
// metrics 8 / topics 10 / theory 8 / mcqs 10 / cases 2 / problems 16). The FRANCHISE
// lever: asset-light economics where the statements are royalty checks — distinct from
// marriott (portfolio math + Bonvoy tier roll-up), hilton (stay nights + Honors ladder),
// hyatt (brand flags + no-show census) and accor (brand ladder + network opex roll-up):
// IHG's angle is property-level franchise performance, IHG One Rewards tiers and
// RevPAR-style rate×volume folds, with the fee desk reading royalty statements.
// Storefront db mapping: suppliers = franchised properties (6 = the estate; rating =
// brand-standard audit score), customers = guests / corporate accounts (region =
// market), orders = stays (created_at = booking stamp, shipped_at = check-in stamp;
// delivered = completed+closed 52, shipped = in-house 30, pending = awaiting arrival
// 14, cancelled = cancelled/no-show 7), order_items = folio lines (quantity = rooms on
// the line, unit_price = nightly rate — the seat-band fold reads as the 55.00 rate-band
// fold: economy 268 rooms @ 31.01 vs upscale 230 rooms @ 115.85), products = room
// types (db category codes = brand-family codes), invoices = franchise royalty
// statements, payments = remittance rails (card = enrolled auto-debit, wire = manual
// remittance), expenses = property opex, ledger_entries = GL. Finance tables store
// INTEGER cents — dollar read = amount_cents / 100.0; orders.total and
// order_items.unit_price are REAL dollars.
// Pool provenance: company-pools.md carries NO IHG section (0 tagged rows) — all 10
// topic slug sets and all 16 problems are theme-curated from the pools' sql rows
// (no w*/d*/f* rows) and say so in brief P4.
// Facts source: scripts/company-facts.md (scale census 16/6/16/103/251/28/27/36/80;
// status mix 52/30/14/7; regional books 15,089.23 / 11,605.45 / 7,286.16 / 852.44;
// cancel shares 8.1/6.7/5.3/0; concentration 63.5/71.2; seat-band fold 268/230 @
// 31.01/115.85; corridor grid 36/29/15/2; coverage census 21 exact / 1 partial /
// 6 none 15,217.00; rails card 16/37,364 vs wire 11/32,248; anomalies #11 925.00 and
// #28 1,756.00; kfc chase split open 5/13,461.00 + paid 1/1,756.00; kroger
// per-property folio-line counts 43/56/40/25/47/40; opex Rent 16,800 / Ads 4,570 /
// Travel 2,521 / Tools 1,525; ledger 181,080 = 181,080). Probe-verified readonly
// against db/custom.db for cells the facts file lacks: per-band folio-line counts
// 133/118, per-band folio revenue 8,227.77 / 26,605.51, folio lines priced 50-54.99
// = 2, line-rate range 14.28-209.68. Every case slot is mechanically verified by
// scripts/case-audit.ts against the live seed db.
// NOTE for the wave-11 registry wiring agent: ihg is NOT yet in registry COMPANY_META
// (wave-11 unwired). Wire id "ihg", domainId "travel", name "IHG", tagline
// "The franchise lever: rate bands, RevPAR folds, royalty checks",
// accent "text-violet-300" to match this header exactly.

import type { CompanyKit } from "../types";

export const ihgKit: CompanyKit = {
  id: "ihg",
  domainId: "travel",
  name: "IHG",
  tagline: "The franchise lever: rate bands, RevPAR folds, royalty checks",
  accent: "text-violet-300",

  brief: [
    "**IHG** — InterContinental Hotels Group — runs the biggest franchise lever in hotels: most of the estate flies its flags (Holiday Inn Express at the volume base, Crowne Plaza and Hotel Indigo in the middle, Kimpton and InterContinental at the top) under **franchise agreements**, so the company earns royalties on rooms revenue instead of owning the real estate. The analytics reality follows the lever: performance is read property by property, loyalty rides the IHG One Rewards ladder, and the statements that matter are **royalty checks** owed by properties. This kit maps the storefront db onto that world honestly: the 6 suppliers rows are the franchised estate, the 16 customers rows are guests and corporate accounts, the 103 orders are stays worth **34,833.28** (created_at = booking stamp, shipped_at = check-in stamp), and the 251 order_items rows are folio lines — quantity = rooms on the line, unit_price = the nightly rate. The status map is fixed: delivered = {emerald:completed and closed} (52, 50.5%), shipped = in-house (30, 29.1%), pending = awaiting arrival (14, 13.6%), cancelled or no-show (7, 6.8%).",
    "The data org splits along the lever. Revenue management owns the RevPAR-style read — rate times volume in one fold: at the 55.00 band edge the estate sold **268 rooms at a 31.01 average nightly rate** in the economy band against 230 rooms at 115.85 in the upscale band, and that band mix moves the royalty base. Estate analytics owns the property scorecards: six franchised properties, with Nordic Gadgets AB carrying **32%** of folio value (11,130.25) and Midwest Hardware Co 26.7% (9,294.93) — one flag moving moves the quarter. Loyalty owns the One Rewards ladder: per-guest lifetime value folded first, tiered second, with guests crossing 3,000 lifetime spend holding **63.5%** of stay value (71.2% above the 2,000 line). The fee desk moves property money across 28 royalty statements and 27 remittance legs in {rose:INTEGER cents} — every dollar read is `amount_cents / 100.0`.",
    "Interview screens are live-db and grain-ruthless. You get folio lines joined through room types to properties and asked for the estate read — and the audit is whether you counted LINES (251), stays (103) or rooms (498), three different folds over the same rows. The arrival clock is {sky:stamp-based}: 82 of 103 stays carry a check-in stamp averaging **2.98 days** (2–4 spread), 14 sit pending with no stamp yet and 7 cancelled — the population definition ships with the number. Anti-join drills return **confident zeros** here (every guest and every room type has transacted), so the real leaks live in status mix and in the 6 never-remitted royalty statements worth 15,217.00. Band filters must state their edge out loud: at product grain the ladder tops out at 199.99, so a premium-band filter at 200 comes back empty by construction.",
    "Prep strategy: the pools file carries no IHG section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: folio-line grain folds, the 55-edge rate-band CASE, One Rewards tier ladders, the arrival clock, two-grain market censuses, month pace walks and the cents-safe royalty spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:rate×volume band fold} revenue management opens the week with, the other rebuilds the {rose:never-remitted chase list} the fee desk walks at every close. The bar to clear: *state the band edge, the stamp filter and the denominator before you compute anything* — then make every census reconcile to 103 stays and 28 statements by construction.",
  ],

  dayInLife: [
    "**08:10 —** The day opens on the pace board before standup. The analyst runs the one-pass stay-fate census first — 52 completed and closed, 30 in-house, 14 awaiting arrival, 7 {rose:cancelled or no-show} = **103 by construction** — because any branch that fails that identity is an incident, not a rounding note. Then the arrival clock: **2.98 days** average booking-to-check-in over the 82 stamped stays, with the regional drift map beside it (LATAM 3.5 slowest on just 2 stamps, APAC 2.93 quickest on 29). July and November each carry 2 of the 7 cancellations — if a third cancellation lands in either month, the franchisee scorecard call moves before the revenue review does.",
    "**11:40 —** Midday is property work. The estate scorecard re-cuts: Nordic Gadgets AB on 43 folio lines and **11,130.25** (32% of the book), Midwest Hardware Co on 56 lines — the volume crown — while Andes Naturals SA runs 25 lines and 3,613.25; the per-property line counts (43 / 56 / 40 / 25 / 47 / 40) are the workload read the area directors argue about. Then the {amber:rate×volume band fold}: 268 economy rooms at 31.01 against 230 upscale rooms at 115.85, re-cut market by market — the US book averages 383.48 a stay on only 19 stays, so band mix and market mix get separated before anyone says 'RevPAR' out loud. The guest ladder underneath reads 24 / 17 / 14 / 13 / 5 stays with a three-way tie at 4 — rank semantics get named, not shrugged at.",
    "**15:30 —** The afternoon tilts to the fee desk. The {rose:never-remitted} chase list refreshes first — 6 statements worth **15,217.00**: 5 open at 13,461.00, plus paid-status #28 at 1,756.00 with zero remittance legs, a status that lies — while the mirror anomaly (#11, void but remitted at 925.00) gets walked line by line, never averaged away. The rails split goes into the pack: card auto-debit 16 legs / 37,364.00 versus wire remittance 11 legs / 32,248.00, settlement averaging 28.4 days against flat 30-day terms. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Rate-band mix", what: "The RevPAR-style rate×volume fold at the 55.00 line-rate edge: 268 economy rooms at a 31.01 average nightly rate against 230 upscale rooms at 115.85. The royalty base is rooms revenue, so this one CASE fold is the first chart revenue management re-cuts every week." },
    { name: "Check-in clock", what: "Booking stamp (created_at) to check-in stamp (shipped_at) over stamped stays only: 82 of 103, averaging 2.98 days with a 2–4 spread. Regional drift: LATAM 3.5, US 3.07, EU 2.94, APAC 2.93. The 14 awaiting-arrival stays have no stamp and no clock — a population definition, not a cleanup job." },
    { name: "Stay-fate census", what: "52 completed-and-closed, 30 in-house, 14 awaiting arrival, 7 cancelled-or-no-show — 103 by construction. Every stage is a conditional count over a status or timestamp, and the census must foot before any rate read ships." },
    { name: "Cancellation share by market", what: "Cancelled share of booked stays: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 on 2 stays. The no-show map franchisees get graded on — conditional counts with the full booked denominator stated, never the completed one." },
    { name: "Estate concentration", what: "Six franchised properties carry the book: Nordic Gadgets AB 11,130.25 (32%), Midwest Hardware Co 9,294.93 (26.7%), then 13.7% / 10.4% / 8.8% / 8.6%. Folio-line workloads run 43 / 56 / 40 / 25 / 47 / 40 — revenue and workload rank differently, and both go on the scorecard." },
    { name: "Rewards-tier concentration", what: "Guests whose lifetime stay value crosses 3,000 hold 63.5% of the book (71.2% above the 2,000 line); the top guest runs 24 stays worth 7,262.35. The One Rewards ladder is a fold-then-tier query, and the concentration numbers are its KPIs." },
    { name: "Royalty coverage", what: "28 franchise statements against 27 remittance legs: 21 settle to the cent (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-remitted worth 15,217.00 — the chase list splits 5 open at 13,461.00 plus the paid-status lie #28 at 1,756.00. Status is a claim; legs are the ledger." },
    { name: "Remittance rails", what: "Card auto-debit 16 legs / 37,364.00 versus wire remittance 11 legs / 32,248.00; settlement averages 28.4 days (fastest 13, slowest 84) against flat 30-day terms. The rail mix decides who the fee desk calls and who the enrolled-debit report chases." },
  ],

  topics: [
    {
      name: "Folio-line grain folds",
      why: "Everything at IHG starts with the folio: 251 order_items lines fold up to 103 stays and 498 rooms, and every screen audits which grain you actually counted. Fold line records to room-type grain (revenue, rooms, distinct stays) and the fan-out trap — COUNT(*) after the join counts lines and calls them stays — becomes muscle memory.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Rate bands & the RevPAR fold",
      why: "The rate×volume read is a CASE band over folio-line rates: at the 55.00 edge the estate splits into 268 economy rooms at 31.01 and 230 upscale rooms at 115.85. Arms must be exhaustive, ordered and edge-stated — moving the edge to 50 flips two folio lines (five rooms) across the boundary, and a hole in the CASE is a hole in the royalty story.",
      slugs: ["count-salary-categories", "calculate-special-bonus", "immediate-food-delivery-i"],
    },
    {
      name: "One Rewards tier ladders",
      why: "Tiering is fold-then-classify: per-guest lifetime value first (the top guest runs 7,262.35 over 24 stays), tier bands second. Tier the raw stay rows and you tier folio lines, not guests — the fan-out bug in its most expensive costume. Ladders with ceilings (second-highest, top-N) are the supporting drills.",
      slugs: ["top-earners", "second-highest-salary", "winning-candidate"],
    },
    {
      name: "The booking-to-check-in clock",
      why: "The arrival clock runs created_at to shipped_at over the 82 of 103 stays that carry the stamp, averaging 2.98 days — and the interviewer's first question is what the denominator holds. julianday arithmetic with the stamp filter stated out loud is the shape being graded; the 14 awaiting-arrival stays stay in the funnel but out of the clock.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "second-day-confirmation"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets are read at two grains at once: EU books 45 stays from 8 accounts while the US books 19 from 2 — load versus coverage, and the ratio (5.6 versus 9.5) is the intensity signal. COUNT(*) beside COUNT(DISTINCT customer_id), plus month-bucket twins of the same pair, is the habit the census screens grade.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Month pace walks",
      why: "The 14-month stay spine (2024-01 to 2025-02) is the pace call's home turf: prior month beside current, deltas rounded, the July trough (1,193.86) and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero — and churned stays concentrate in July and November.",
      slugs: ["week-over-week-churn", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Set algebra on the estate",
      why: "Board packets stack populations — markets won beside markets merely present, remitted statements beside the never-remitted chase list — and UNION/EXCEPT answer which is which. UNION dedups whole rows silently, which makes it a correctness question; EXCEPT is the anti-join's set-op twin pointed at the estate.",
      slugs: ["movie-rating", "team-scores-in-football-tournament", "the-airport-with-the-most-flights"],
    },
    {
      name: "Nested property gates",
      why: "Screens escalate into staging: fold per-property folio-line counts (43 / 56 / 40 / 25 / 47 / 40), then judge them against the estate mean (41.83 — exactly three properties clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted, and NOT IN over an unguarded column is the trap that empties triage lists.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, in-house, awaiting-arrival and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity is the correctness argument.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "number-of-employees-who-met-the-target"],
    },
    {
      name: "Royalty statements & cents discipline",
      why: "Royalty is not remittance — the finance tables (28 statements, 27 legs, INTEGER cents) are where the estate meets money. Every dollar read is amount_cents / 100.0, the coverage split 21 exact / 1 partial / 6 none is one CASE away, and the rails matter: card auto-debit (16 legs, 37,364.00) versus wire remittance (11 legs, 32,248.00).",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "ihg-t1",
      q: "Your estate scorecard joins franchised properties to room types to folio lines. When do you INNER and when do you LEFT — and what does an anti-join return on this db?",
      a: "Decide from the survival rule the question implies. A folio read joins lines to room types to properties: a line whose property is missing is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from properties: a property with no folio lines yet would arrive with NULL payload columns, and deleting it would flatter the estate. Then the anti-join question: guests who never stayed, room types never folioed — on this db both return a confident ZERO, because all 16 accounts and all 16 room types have transacted. Proving that zero (LEFT JOIN + IS NULL, count the survivors) is the analyst's job, because a zero you did not verify is how coverage reports die in review. The anti-join that DOES bite is on money: 6 royalty statements worth 15,217.00 have no remittance legs, and that is where the real chase list lives — the leaks moved from inventory to the fee desk.",
      tag: "joins",
    },
    {
      id: "ihg-t2",
      q: "The property board ranks six franchised properties by folio lines: 56, 47, 43, 40, 40, 25. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips: the two properties at 40 folio lines share rank 4 and the 25-line property lands on rank 6 — implying a phantom fifth position that does not exist. DENSE_RANK shares rungs without gaps: 1, 2, 3, 4, 4, then 5. ROW_NUMBER splits the tie arbitrarily, which is a silent judgment call about which area director's property gets the flagship spotlight first. There is a second layer IHG candidates get asked: the same tie problem lives inside a running rooms walk — SUM(quantity) OVER (ORDER BY created_at) uses a default RANGE frame, so stays tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer properties, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment where the board's audit trail can see it.",
      tag: "windows",
    },
    {
      id: "ihg-t3",
      q: "251 folio lines, 103 stays, 498 rooms — which COUNT answers 'how busy was the estate', and why do the three disagree?",
      a: "They disagree because they count at different grains, and the interview grades whether you can name the grain before you run the query. COUNT(*) on order_items joined to its parents counts folio lines — 251 — one row per booked line. COUNT(DISTINCT o.id) folds the fan-out back to stays — 103 folios. SUM(quantity) counts rooms — 498, because a folio line can carry up to 3 rooms on one row. None is 'the busy number': lines measure billing detail, stays measure demand events, rooms measure the royalty base — and the royalty check is computed on rooms revenue, so the room count is the one the fee desk defends. The two-grain census is the same discipline at market level: EU runs 45 stays from just 8 accounts (5.6 per account) while the US runs 19 from 2 (9.5) — COUNT(*) beside COUNT(DISTINCT customer_id), and saying out loud which column is load and which is coverage. A report that prints one number without its grain is exactly what an IHG reviewer sends back.",
      tag: "aggregation",
    },
    {
      id: "ihg-t4",
      q: "shipped_at is the check-in stamp and 21 of 103 stays have none. What is your policy for the arrival clock, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped stays have a check-in, so the clock measures booking-to-check-in for the 82 of 103 stays that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. The 21 unstamped rows are not missing data: 14 are awaiting arrival (a clock that has not started) and 7 are cancelled-or-no-show (a clock that will never run), so the population definition is the metric. Then mechanics: AVG ignores NULLs, so AVG over ALL stays returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name; COUNT(shipped_at) counts the stamped subset and the gap to COUNT(*) is exactly 21, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day check-ins for stays that have not arrived and poisons the 2.98 baseline every drift alert keys off. State the 82-row population before the panel asks; that sentence is the screen.",
      tag: "nulls",
    },
    {
      id: "ihg-t5",
      q: "The cancellation read reports share of booked stays that cancelled, per market. Where does the status filter live, where does 100.0 live, and why?",
      a: "Two placements, two different failure modes. The status rule is a row-level fact — status = 'cancelled' must be evaluated per stay, so it lives inside the conditional SUM (SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)) or a WHERE for a cancelled-only count; putting a market floor like HAVING COUNT(*) >= 10 in WHERE is impossible because counts do not exist before groups form. The 100.0 sits BEFORE the division: SUM of 0/1 flags over COUNT(*) is integer arithmetic in spirit, and the truncation turns the share toward zero — on this db it is the difference between printing EU's 6.7 and a displayed 0. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it decides whether the APAC 8.1 / EU 6.7 / US 5.3 / LATAM 0 map ships or errors. And the denominator sentence ships with the number: share of BOOKED stays (the full 103-grain denominator), never share of completed — the no-shows are the population the read exists to watch.",
      tag: "pipeline",
    },
    {
      id: "ihg-t6",
      q: "Flag properties whose folio-line count beats the estate average. Which subquery shape do you reach for, and what happens when the inner fold comes back empty?",
      a: "Stage then compare. The estate mean is 41.83 folio lines (251 over 6 properties) and exactly three properties clear it — Midwest Hardware Co at 56, Shenzhen Electro at 47, Nordic Gadgets AB at 43 — so the clean shape is a derived table or CTE that folds lines per property, then an outer query that filters against the mean. A scalar subquery is contractually 0-or-1 rows, 1 column: one row drives the comparison, zero rows return NULL — not an error — and count > NULL is UNKNOWN, so the flag list silently empties while looking valid. On the full estate the mean always exists; on a staging slice (one region, one month) the empty-inner bug ships regularly. The correlated cousin (compare each property to ITS market's average) re-runs per outer row and answers a different question at a different cost. And the NOT IN variant is worse: one NULL property id in the subquery list poisons every comparison and the whole report empties — policy is NOT EXISTS or a NULL-guarded list. The strong candidate states the inner fold's population and its empty-case behavior unprompted.",
      tag: "subqueries",
    },
    {
      id: "ihg-t7",
      q: "The pace trend buckets stays by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the pace trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and check-in stamps land exactly at the edges. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell the story concretely: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, and takes the steepest drop, -1,326.87, into November — the same month carrying 2 of the 7 cancellations. Date discipline is pace discipline: the spine, the window and the edge row are where trend decks go wrong.",
      tag: "dates",
    },
    {
      id: "ihg-t8",
      q: "A franchise statement is marked 'paid' but the remittance table has no legs for it. Walk me through the first query you write — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN remittance legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a remittance leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The full coverage census must read 21 exact (65,612.00 both sides — void-but-remitted #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00 — no SUM may call it settled), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent leg. And the close does not ship until the ledger trial balance lands at 181,080 debits against 181,080 credits, delta zero.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "ihg-mcq-1",
      prompt: "A stay's status reads 'shipped'. In this kit's IHG stage map, what happened?",
      choices: ["The guest checked in — the stay is in-house, with shipped_at as the check-in stamp", "The stay completed and the folio closed", "The stay cancelled or the guest no-showed", "The stay is still awaiting arrival"],
      answer: 0,
      why: "The stage map is fixed: shipped = in-house (30 of 103 stays), with shipped_at as the check-in stamp. The guest is on property — but the folio has not closed, so the stay is not yet completed revenue.",
      notes: [
        { choice: 1, why: "Completed-and-closed is 'delivered' — 52 stays. Calling in-house stays completed books revenue before the folio closes and flatters the royalty base." },
        { choice: 3, why: "Awaiting arrival is 'pending' — 14 stays with no check-in stamp yet. Pending is not in-house and not cancelled; it is 'not yet', and it stays in the funnel denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-2",
      prompt: "The arrival clock counts stamped stays only. The db holds 82 stamped, 14 awaiting arrival and 7 cancelled of 103 booked. What is the stamped share, and over which population?",
      choices: ["82/89 = 92.1% — stamped over stamped-plus-cancelled", "82/103 = 79.6% — stamped over ALL stays booked", "52/82 — completed over stamped", "82/6 = 1,366.7% — stamped over properties"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL stays booked — the 14 awaiting-arrival stays stay in the denominator because 'not yet stamped' is exactly what the clock watches next. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting-arrival stays inflates the share to 92.1% by deleting the population the arrival funnel exists to watch — the check-ins that have not happened yet." },
        { choice: 2, why: "52/82 mixes two funnel steps into one ratio — completed is folio closure, shipped_at is the check-in stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-3",
      prompt: "EU books 45 stays from 8 guest accounts. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts stay rows (45); COUNT(DISTINCT customer_id) folds repeats back to accounts (8). The gap between them — 5.6 stays per account — is the intensity read the market review actually discusses.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every stay carries an account. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not accounts — a third grain nobody asked for. The census is stays AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before truncation", "It filters to cancelled stays only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, the SUM-of-flags over COUNT folds under integer-style truncation and the cancellation share collapses toward 0 — every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — the no-show map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-5",
      prompt: "Brand standard requires each franchised property to run at least 3 room types. The estate runs 3/3/2/2/3/3. Where does the 'at least 3' gate live?",
      choices: ["WHERE room_types >= 3, before GROUP BY", "GROUP BY property HAVING COUNT(DISTINCT product_id) >= 3", "HAVING before GROUP BY, wherever it fits", "WHERE COUNT(*) >= 3 on the raw folio lines"],
      answer: 1,
      why: "A room-type floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY — and DISTINCT matters, because four properties at 3 types must survive a fold that would otherwise count lines. On this db the gate keeps exactly 4 of 6 properties.",
      notes: [
        { choice: 0, why: "COUNT(DISTINCT …) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 3, why: "COUNT(*) on folio lines counts lines (43/56/40/25/47/40), not room types — the gate would keep every property and audit nothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-6",
      prompt: "The rate-band CASE uses unit_price < 55 for the economy arm. A reviewer moves the edge to 50. What moves?",
      choices: ["Nothing — no folio line is priced between 50 and 55", "Two folio lines priced 50–54.99 (five rooms between them) flip to the upscale arm — the economy fold reads 263 rooms, not 268", "Every line flips to the economy arm", "The query errors — the edge must be an integer"],
      answer: 1,
      why: "The band edge is load-bearing: two folio lines priced 50–54.99 carry five rooms, and moving the edge flips them into the upscale arm — the economy fold drops from 268 rooms at 31.01 to 263 at 30.71. The band edge ships in the chart title, or the fold is unauditable.",
      notes: [
        { choice: 0, why: "The 50-to-55 pocket is NOT empty — that is exactly why the edge is stated out loud. Silent edge drift between reports is how two 'economy' numbers stop reconciling." },
        { choice: 2, why: "The cheapest line rate is 14.28, well under either edge — loosening to 50 cannot pull anything down into economy; it only pushes lines up." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the stamp filter still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending stays double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-filter version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 stays.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-8",
      prompt: "A staging-slice triage list uses property_id NOT IN (SELECT supplier_id FROM folio_staging WHERE market = 'LATAM') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL supplier_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: NOT EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every folio line carries a property id. But staging slices are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-9",
      prompt: "The fee desk stacks a 'remitted' board and a 'never-remitted' board with UNION. A reviewer says one statement vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement id, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement id, same counts, no branch label or side column — collapse into one, and the pack loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate repeated count exists (the same statement can appear on both sides of an anomaly walk), UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-10",
      prompt: "A dashboard walks rooms sold stay by stay: SUM(quantity) OVER (ORDER BY created_at). Two stays share a booking second, and the cumulative 'jumps two stays at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so stays tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at stay grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the estate total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ihg-1",
      tier: "easy",
      topic: "cap",
      universe: "pricing",
      title: "The rate-band RevPAR fold",
      brief:
        "IHG-flavored brief on the storefront db: revenue management opens the week with the rate×volume fold — how many rooms the franchised estate sold in the economy rate band versus the upscale band, and at what average nightly rate, because the royalty base is rooms revenue and the band mix moves it. Probed facts: the 103 stays carry 251 folio lines worth 34,833.28 (498 rooms); the band edge is 55.00 on the nightly line rate, holding 133 economy lines worth 8,227.77 and 118 upscale lines worth 26,605.51. The board reads rooms and average rate to 2 decimals, biggest room count first.",
      ask: "Return each rate band with folio-line count, rooms sold, band revenue and average nightly rate to 2 decimals, biggest room count first.",
      template:
        "SELECT CASE WHEN oi.unit_price < {1} THEN {2} ELSE 'upscale' END AS rate_band,\n       COUNT(*) AS folio_lines,\n       SUM(oi.quantity) AS rooms,\n       ROUND(SUM({3}), 2) AS band_revenue,\n       ROUND(AVG(oi.unit_price), {4}) AS avg_rate\nFROM order_items oi\nGROUP BY rate_band\nORDER BY rooms {5};",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the band edge",
          why: "The published edge is 55.00 — the fold reads 268 economy rooms at 31.01 against 230 upscale at 115.85 with it. Moving the edge to 50 flips two folio lines (five rooms) across the boundary; to 1 empties the economy arm entirely.",
        },
        {
          answer: "'economy'",
          kind: "keyword",
          label: "the low-band label",
          why: "The sub-55 arm is 'economy' — the band name the revenue deck prints. Any other label renames the row the board reads, and an unlabeled arm merges the two bands into one row and kills the rate×volume story.",
        },
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the line-value fold",
          why: "Band revenue is rooms times rate, line by line: SUM(quantity * unit_price) folds to 8,227.77 and 26,605.51. SUM(quantity) counts rooms again, SUM(unit_price) adds rates without rooms — three different numbers wearing one column name.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Average nightly rate prints to 2 decimals — 31.01 and 115.85, the cells the rate card quotes. ROUND(…, 1) prints 31.0 and 115.8 and the band board stops reconciling with the rate card.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first order",
          why: "The board reads the volume band on top: economy 268 rooms, then upscale 230. ASC opens the review on the 230-room arm — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["50", "1", "'econ'", "ASC", "MAX", "rooms"],
      walkthrough:
        "One table, one CASE, one fold — the RevPAR-style read in five lines. The CASE bands every folio line at the 55.00 edge, the GROUP BY folds each arm once, and the row the board reads is: economy 133 lines / 268 rooms / 8,227.77 / 31.01, then upscale 118 lines / 230 rooms / 26,605.51 / 115.85 — the two revenues footing to the 34,833.28 book and the two room counts to 498. The rate column is AVG(unit_price) at line grain — per-folio-line ADR, not rooms-weighted (rooms-weighted reads 30.70 and 115.68), which is exactly the grain note a reviewer will ask for. The distractors fail honestly: an edge of 50 flips five rooms across the boundary (263/30.71), an edge of 1 collapses the fold to a single 498-room upscale row, 'econ' as the edge compares numbers to text and bands EVERY line economy (SQLite sorts numbers below text); SUM(1) or SUM(50) prints line counts and constants where revenue belongs, MAX as the value fold errors on aggregate-in-aggregate, ROUND(…, 'econ') errors, and ASC opens the board on the smaller band. The read that closes the meeting: economy is 53.8% of rooms but 23.6% of revenue — the rate×volume tension in one sentence.",
    },
    {
      id: "cs-ihg-2",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The never-remitted royalty audit",
      brief:
        "IHG-flavored brief on the storefront db: at every close the fee desk reconciles franchise royalty statements against the remittance legs that actually landed — status is a claim, payment rows are the ledger of record. Probed facts: 28 statements — 21 settle to the cent (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00 on #25), and 6 never-remitted worth 15,217.00; the chase list splits 5 open statements at 13,461.00 against one paid-status lie (#28 at 1,756.00 with zero legs). Statements and legs carry INTEGER cents; the dollar read is amount_cents / 100.0.",
      ask: "Return each statement status on the never-remitted list with statement count and royalty total in dollars to 2 decimals, biggest total first.",
      template:
        "SELECT i.status AS statement_status,\n       COUNT(*) AS statements,\n       ROUND(SUM(i.amount_cents) / {1}, 2) AS royalty_due\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE {3} IS NULL\nGROUP BY i.status\nORDER BY royalty_due {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements store INTEGER cents; /100.0 is the dollar read that prints 13,461.00 and 1,756.00. The .0 matters — bare 100 keeps the read honest here only because these sums are whole multiples; /10.0 prints a hundredfold-off book at 134,610.00.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement key",
          why: "Legs attach by p.invoice_id = i.id — statement id to remittance key. Matching on the wrong column (i.customer_id, p.id) mis-joins every leg and the anti-join returns the wrong chase list or an empty one.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the leg-survivor probe",
          why: "WHERE p.id IS NULL keeps exactly the statements whose LEFT JOIN produced no leg — the 6 never-remitted. Probing i.id IS NULL instead keeps nothing (statement ids are never NULL); probing p.invoice_id IS NULL happens to match here, but p.id is the row-existence probe the pattern teaches.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The close reads the biggest chase on top: open 5 / 13,461.00, then the paid-status lie 1 / 1,756.00. ASC buries the open cohort under the single-leg lie — a correct query aimed at the wrong end of the ledger.",
        },
      ],
      distractors: ["p.id", "i.customer_id", "10.0", "ASC", "'open'"],
      walkthrough:
        "The anti-join is the fee desk's whole morning. LEFT JOIN keeps all 28 statements; legs attach on p.invoice_id = i.id; WHERE p.id IS NULL keeps the 6 with no remittance at all; GROUP BY status splits the chase into open 5 / 13,461.00 and paid 1 / 1,756.00 — and the paid row IS the story: #28 claims paid while carrying zero legs, which is why legs are the ledger and status is a claim. The dollar read divides by 100.0, and the two buckets foot to the probed 15,217.00. The distractors each break differently: p.id as the statement key matches legs to themselves (leg id = leg's invoice id) and the chase list empties; i.customer_id joins legs to the wrong key entirely and returns nothing; 10.0 scales every dollar read tenfold (134,610.00 — the classic cents slip); i.customer_id or 10.0 or 'open' in the probe slot kills every row ('x' IS NULL is never true for a real value) and the audit ships an empty chase list; ASC opens the close on the 1,756.00 lie instead of the 13,461.00 cohort; 'open' as the join key compares ids to text, matches nothing, and the 'chase list' balloons to all 28 statements (21 'paid' included) — the exact misread the ledger-of-record rule exists to prevent. The reconciliation identity holds: 21 exact + 1 partial + 6 none = 28, or the close does not ship.",
    },
  ],

  problems: [
    { slug: "top-travellers", why: "Per-guest lifetime stay value is the One Rewards ladder's first fold — the 7,262.35 guest outranks the 6,640.56 one. This problem drills the SUM-join-ORDER BY shape the tier board re-cuts weekly." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-stay guest is the estate's frequency crown. Argmax with a subquery guard is exactly how the top-of-ladder read is written when ties are possible." },
    { slug: "combine-two-tables", why: "Guests LEFT JOINed to stays: a stay without a guest is corruption, a guest without a stay is whitespace. On this db the anti-join side returns a confident zero you are expected to prove." },
    { slug: "confirmation-rate", why: "COALESCE turns missing guest-confirmation data into an explicit rate instead of a silent NULL — the arrival-funnel denominator depends on the distinction." },
    { slug: "find-churn-risk-customers", why: "Dormancy anti-join over a dated cutoff: accounts whose last stay fell before the line. The same shape drives the winback calendar for One Rewards members who stopped booking." },
    { slug: "average-selling-price", why: "ADR by room type is a line-weighted rate fold — revenue over rooms, not an average of averages. This problem is the exact join-fold the rate-band board re-cuts weekly." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor gates every property board: properties running at least N room types, markets carrying at least N stays. This problem drills the group-level gate." },
    { slug: "immediate-food-delivery-ii", why: "Share of stays checked in inside the promised window versus late — the arrival-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "rank-scores", why: "Property boards tie for real — folio-line workloads run 56 / 47 / 43 / 40 / 40 / 25 and the two 40s share a rung. RANK versus DENSE_RANK is a policy about peer properties, not syntax." },
    { slug: "game-play-analysis-i", why: "First stay per guest — MIN over the stay spine — anchors every One Rewards cohort and winback window. Same first-touch fold, hotel flavor." },
    { slug: "employees-with-missing-information", why: "Profile completeness reads as a missing-information join before any guest census ships: rows that exist on one side and not the other are the data-quality gate." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of guests crossing a stay threshold — the repeat-guest read is a conditional count with the denominator stated, this problem's exact fold." },
    { slug: "capital-gain-loss", why: "Rooms booked minus rooms cancelled nets to the movement number the ops board reads. This problem drills ordered add/drop algebra — the same book/cancel netting." },
    { slug: "consecutive-available-seats", why: "Adjacent-room availability for a party is a self-join over room ordering — the hotel-native drill, and the reason the estate read teaches self-joins at all." },
    { slug: "sales-by-day-of-the-week", why: "Check-in-day mix pivots by weekday: STRFTIME day buckets turned into columns. The pace board's weekly cut is this problem's exact pivot." },
    { slug: "null-blank-audit", why: "The estate's data-quality gate: audit NULL and blank fields with conditional SUMs before any census ships — a confident zero beats an unverified one every close." },
  ],
};
