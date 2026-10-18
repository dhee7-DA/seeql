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
    "Prep strategy: the pools file carries no IHG section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: folio-line grain folds, the 55-edge rate-band CASE, One Rewards tier ladders, the arrival clock, two-grain market censuses, month pace walks and the cents-safe royalty spine. Do the topics in order, then work the six case studies on the live storefront db: the {amber:rate×volume band fold} revenue management opens the week with, the {rose:never-remitted chase list} the fee desk walks at every close, the one-pass stay-fate census the ops board reconciles against, the month-over-month pace walk, the One Rewards repeat cohort, and the property workload ladder with its shared-rung tie. The bar to clear: *state the band edge, the stamp filter and the denominator before you compute anything* — then make every census reconcile to 103 stays and 28 statements by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. The **thirty MCQs** and **twenty-four theory cards** now cover the full screen vocabulary — grain folds, band edges, coverage CASE order, frame discipline, the NOT IN NULL trap and the reconciliation identities — and the six cases each rehearse a different live-db ask. Run each case, then re-run it a week later from a blank editor: *the second pass is where recall actually forms*. Treat the walkthroughs as the real content — they narrate the failure each wrong chip causes, which is exactly the muscle the grain-ruthless follow-up tests.",
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
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "most-frequently-ordered-product-per-customer", "group-sold-products-by-the-date", "find-the-team-size"],
    },
    {
      name: "Rate bands & the RevPAR fold",
      why: "The rate×volume read is a CASE band over folio-line rates: at the 55.00 edge the estate splits into 268 economy rooms at 31.01 and 230 upscale rooms at 115.85. Arms must be exhaustive, ordered and edge-stated — moving the edge to 50 flips two folio lines (five rooms) across the boundary, and a hole in the CASE is a hole in the royalty story.",
      slugs: ["count-salary-categories", "calculate-special-bonus", "immediate-food-delivery-i", "product-price-at-a-given-date", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "One Rewards tier ladders",
      why: "Tiering is fold-then-classify: per-guest lifetime value first (the top guest runs 7,262.35 over 24 stays), tier bands second. Tier the raw stay rows and you tier folio lines, not guests — the fan-out bug in its most expensive costume. Ladders with ceilings (second-highest, top-N) are the supporting drills.",
      slugs: ["top-earners", "second-highest-salary", "winning-candidate", "department-top-three-salaries", "game-play-analysis-iv"],
    },
    {
      name: "The booking-to-check-in clock",
      why: "The arrival clock runs created_at to shipped_at over the 82 of 103 stays that carry the stamp, averaging 2.98 days — and the interviewer's first question is what the denominator holds. julianday arithmetic with the stamp filter stated out loud is the shape being graded; the 14 awaiting-arrival stays stay in the funnel but out of the clock.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "second-day-confirmation"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets are read at two grains at once: EU books 45 stays from 8 accounts while the US books 19 from 2 — load versus coverage, and the ratio (5.6 versus 9.5) is the intensity signal. COUNT(*) beside COUNT(DISTINCT customer_id), plus month-bucket twins of the same pair, is the habit the census screens grade.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "sellers-with-no-sales"],
    },
    {
      name: "Month pace walks",
      why: "The 14-month stay spine (2024-01 to 2025-02) is the pace call's home turf: prior month beside current, deltas rounded, the July trough (1,193.86) and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero — and churned stays concentrate in July and November.",
      slugs: ["week-over-week-churn", "biggest-window-between-events", "year-on-year-growth-rate", "active-users"],
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
      slugs: ["active-businesses", "create-a-session-bar-chart", "number-of-employees-who-met-the-target", "weather-type-in-each-country"],
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
    {
      id: "ihg-t9",
      q: "The ops board wants stays, rooms and folio value in ONE scan over order_items. Walk me through the one-pass census — and why four sequential queries are the wrong shape.",
      a: "One scan, many lenses: SELECT COUNT(*), SUM(quantity), SUM(quantity * unit_price) over the 251 folio lines returns lines, rooms and value together — 251 / 498 / 34,833.28 — because every lens folds the same rows in a single pass. When the lenses need different filters, use FILTER (WHERE …) branches per aggregate, or the portable SUM(CASE WHEN …) twin. Four sequential queries are four chances for the filters to drift — one silently excludes no-shows, another rounds differently — and the board's identity check (the branches must foot back to 103 stays) breaks for reasons nobody can point to. The census discipline is the correctness argument: one scan, one population, branches that reconcile by construction.",
      tag: "aggregation",
    },
    {
      id: "ihg-t10",
      q: "Give me each market's flagship property — the one carrying the most folio value in its region. How do you write the argmax without losing rows?",
      a: "Stage the fold, then rank, then cut. A CTE folds folio value per property per market (JOIN order_items to room types to properties, GROUP BY region, property), then ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(value) DESC) numbers the properties inside each market, and the outer query keeps rn = 1. The join-back alternative — a correlated subquery comparing each property's total to its market's MAX — works but re-runs per row and reads worse. What the interviewer checks: you ranked AFTER the fold (ranking raw folio lines ranks lines, not properties), you used ROW_NUMBER deliberately because the business wants ONE flagship even on a tie, and you can name what a tie means — two properties at exactly the same value would silently pick whichever the ORDER BY tie-break finds first, so the tie-break (property id, or name for determinism) gets written into the query.",
      tag: "windows",
    },
    {
      id: "ihg-t11",
      q: "A folio read joins order_items to room types to franchised properties — a two-hop chain. Where do the filters live, and how do you decide join-time versus post-join?",
      a: "Every filter lands either inside a JOIN's ON clause or in the WHERE, and for an INNER chain they are equivalent — the discipline is picking the spot that states the business rule. A market scoping rule ('US estate only') is a property attribute, so it reads cleanest in WHERE after the chain; a line-type rule ('folio lines on room types only') belongs in the join that introduces that table. The traps are positional, not syntactic: a LEFT JOIN followed by a right-table WHERE predicate converts the join back to an INNER silently — on this db every folio line has a room type and every room type a property, so the bug hides until a staging slice arrives with gaps. And each hop multiplies by the fan-out: order_items to orders to customers is safe one-to-one upward, but joining DOWN to something with multiple rows per key inflates counts — 251 lines can quietly become 500 before anyone notices the revenue doubled.",
      tag: "joins",
    },
    {
      id: "ihg-t12",
      q: "A franchisee feed arrives with property names in five casings — 'midwest hardware co', 'MIDWEST HARDWARE CO', padded variants. The join to the estate table keys on name. Fix it in SQL.",
      a: "Normalize both sides to the same canonical form before the join, never one side: TRIM(UPPER(name)) on the feed and TRIM(UPPER(name)) on the estate table makes the keys collide correctly — 'MIDWEST HARDWARE CO' and 'midwest hardware co' both fold to one key and the folio lines attach. The interview follow-ups: normalization is a display concern too, so keep the original casing in a companion column and project the pretty form at the edge (SQLite has no INITCAP; UPPER plus LOWER plus SUBSTR composition builds one); and casing fixes never rescue truncation or spelling drift — 'Midwest Hardware' without the Co is a different key, and that class of mismatch is a mapping-table problem, not a string-function problem. State the rule out loud: keys normalize, display preserves.",
      tag: "casing",
    },
    {
      id: "ihg-t13",
      q: "Statements carry issued_on and due_on, and the fee desk wants an aging read against the 30-day terms. Build it — and keep the calendar whole.",
      a: "Two layers. The clock: CAST(julianday(due_on) - julianday(issued_on) AS INTEGER) gives the terms window itself, and aging measures the gap between due date and today or remittance — julianday diffs, rounded once at the end, never per row. The buckets: a CASE ladder — 'current' when nothing is past due, '1-30' when the remittance landed within a month of the due date, '31-84' for the drift band (this book's settlement runs 13 fastest to 84 slowest, averaging 28.4), 'broken' beyond. The calendar traps: half-open windows — paid_on >= '2025-01-01' AND < '2025-02-01' — never BETWEEN on the last day, which drops the evening's remittances; and the population sentence ships with the read — aging runs over UNSETTLED statements, so the 21 exact and 1 partial fold into their own buckets and the 6 never-remitted worth 15,217.00 are the rows the aging ladder exists to name.",
      tag: "dates",
    },
    {
      id: "ihg-t14",
      q: "The nightly folio feed retried, and the same line may have landed twice. How do you detect and remove duplicate folio lines in SQL?",
      a: "Detect at the business key: GROUP BY the natural key — order_id, product_id, quantity, unit_price — with HAVING COUNT(*) > 1; the id column differs between retries, which is exactly why the natural key is the detector. Remove with the window dedupe: ROW_NUMBER() OVER (PARTITION BY order_id, product_id ORDER BY rowid DESC) numbers each key's copies newest-first, and you keep rn = 1 — filtering or deleting rn > 1 in a staged pass, never with a bare DELETE that has no tie-breaker and can take both copies. At IHG the stakes are the royalty base: a duplicated folio line double-counts rooms revenue on a franchise statement, and the fee desk pays on the inflated number. The habit being graded: dedupe is detect-then-keep-newest with the tie-breaker named, and the surviving row count reconciles to the pre-dedupe census minus the flagged copies.",
      tag: "quality",
    },
    {
      id: "ihg-t15",
      q: "The revenue review wants each market's folio value beside the estate average. Derived table or correlated subquery — and what happens when the inner fold comes back empty?",
      a: "The derived-table shape stages once: a CTE folds value per market (GROUP BY region), the outer query joins it back and every row gets the same estate-side number — computed once, cheap, readable. The correlated shape (compare each property to ITS market's average) re-runs the inner fold per outer row and answers a different question — 'above my market's line, not the estate's' — which is the concentration read the area directors actually want. The shared trap is the empty case: a scalar subquery is contractually 0-or-1 rows, and 0 rows returns NULL, not an error — value > NULL is UNKNOWN, so the comparison list silently empties while looking valid. On a regional slice (one market, one month) the empty-inner bug ships regularly, so the strong candidate states the inner population and its empty-case behavior unprompted: 'the fold always exists on the full estate; on a slice it can be NULL, and the query says so.'",
      tag: "subqueries",
    },
    {
      id: "ihg-t16",
      q: "You want to keep only markets whose stays exceed the estate's monthly average — but the average is itself a window result. Why does filtering on it directly fail, and what is the fix?",
      a: "Because window output does not exist at WHERE time. The pipeline runs FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and window functions evaluate in the SELECT stage — after every WHERE row has already been chosen — so WHERE monthly_stays > AVG(monthly_stays) OVER () is either a syntax error or, wrapped in a subquery, a comparison against a value that isn't computed yet. The fix is the two-step: stage the month fold and its window column in a CTE (SELECT month, COUNT(*) AS stays, AVG(COUNT(*)) OVER () AS estate_avg FROM orders GROUP BY month), then filter in the OUTER query — WHERE stays > estate_avg. The same wall blocks sibling SELECT expressions from seeing each other, which is why the month-over-month query computes LAG once per expression or stages it. Say the pipeline order out loud; the interviewer is checking whether you know WHEN each value becomes real inside the engine.",
      tag: "pipeline",
    },
    {
      id: "ihg-t17",
      q: "The board packet stacks a remitted board and a never-remitted board, and a reviewer asks why EXCEPT wasn't used for the chase list instead of the anti-join. Answer them.",
      a: "EXCEPT is the set-op twin of the anti-join: SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments returns exactly the statements with no leg — the same 6 rows, 15,217.00, as the LEFT JOIN + IS NULL shape. The honest comparison: EXCEPT reads like the business rule ('statements minus remitted ones') and dedups automatically, which makes it elegant for board packets where the populations are already distinct; the anti-join generalizes better — you can carry the statement's status, amount and due date through the LEFT JOIN, while EXCEPT compares the projected column list only, so anything you need beside the id must be joined back afterward. And the discipline both share: name the columns explicitly (EXCEPT over SELECT * compares every column and silently returns everything if the tables drift), and remember UNION dedups too — the stacked packet that lost a statement to a silent UNION collapse was the same mechanism wearing the other operator.",
      tag: "setops",
    },
    {
      id: "ihg-t18",
      q: "Nordic Gadgets AB carries 32% of folio value. Walk me through the query that proves that share — and the grain decisions hiding inside it.",
      a: "The share is a ratio of two folds at the same grain. Numerator: SUM over the property's folio lines — quantity times unit_price folded per supplier, 11,130.25. Denominator: the estate's total — 34,833.28 — computed either as a scalar subquery over the whole order_items join or as a window SUM(…) OVER () beside each property row. Then 100.0 * numerator / denominator, with the 100.0 BEFORE the division so the arithmetic is real, ROUND(…, 1) at the very end. The grain decisions: the fold runs at folio-line grain (not stay grain — a stay's total is booked value, the royalty base is rooms revenue), and the denominator's population is stated — the full estate, all 251 lines, not the completed-stay subset. The output — Nordic 32.0, Midwest Hardware Co 26.7, then 13.7 / 10.4 / 8.8 / 8.6 — foots to 100 by construction, and that identity is the proof the fold is honest.",
      tag: "ratios",
    },
    {
      id: "ihg-t19",
      q: "The band fold says economy ADR is 31.01 and upscale is 115.85. Why is the estate's average nightly rate NOT the average of those two numbers?",
      a: "Because averaging the band averages throws away the weights. The estate sold 268 economy rooms at 31.01 and 230 upscale rooms at 115.85 — the true estate ADR is the rooms-weighted fold: (268 × 31.01 + 230 × 115.85) / 498 ≈ 70.36, not (31.01 + 115.85) / 2 = 73.43. The average-of-averages is only correct when every group has equal weight, and band mix is exactly what revenue management exists to measure — the mix shift IS the story, and flattening it erases the story. In SQL the honest fold is SUM(quantity * unit_price) / SUM(quantity) computed once over the base rows, or AVG(quantity * unit_price) only when the intended grain is per-folio-line rather than per-room — and the kit's own band board prints 30.70 / 115.68 rooms-weighted versus 31.01 / 115.85 line-weighted, which is why the ADR definition (per line or per room) ships in the chart title. Ratio-of-sums, never sum-of-ratios — that sentence is the answer.",
      tag: "aggregation",
    },
    {
      id: "ihg-t20",
      q: "The fee desk wants month-to-date royalty value accumulated across the stay spine — a running total. What do you state about the frame before writing it?",
      a: "That 'running total' means a frame, and the frame is the whole answer. SUM(SUM(total)) OVER (ORDER BY month) — layered over a month fold — defaults to RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which includes every peer sharing the current ORDER BY value; on a month spine with one row per month that is harmless, but the moment the walk runs at stay grain, two stays sharing a booking second enter the cumulative together and the walk jumps. The defensible shape states ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW over a deterministic order — month, or created_at with id as tie-break — so each row carries exactly the bookings before it. The month-to-date variant resets the frame per partition: PARTITION BY year-month … no — month-to-date within a month means the frame is the month itself, which is why the read is usually just SUM over the month's GROUP BY, and the RUNNING total is the year-to-date spine. State which one you are building before you write it; that sentence is the screen.",
      tag: "windows",
    },
    {
      id: "ihg-t21",
      q: "Benchmark each franchised property against its region-mates in one query. Self-join, window, or CTE — pick one and defend it.",
      a: "The window shape wins on this db: AVG over a PARTITION BY region computes each region's average once and leaves every property row in place — SELECT s.region, s.name, SUM(oi.quantity * oi.unit_price) AS value, AVG(SUM(value)) OVER (PARTITION BY region) — staged in a CTE because you cannot nest aggregates directly. The self-join shape (properties joined to properties on region) pairs every property with every region-mate — 6 properties make region-sized cross products — and then aggregates the pairs; correct, but the fold runs over pair rows and the reader has to reconstruct the grain. The CTE-join shape stages the per-region fold and joins back, which is the self-join's answer without the fan-out. What the interviewer grades: the PARTITION BY answer names the population (region-mates, not the estate), states that the window keeps every row (each property still appears with its own value beside its region's benchmark), and knows the estate-wide comparison is the same query with the PARTITION BY removed.",
      tag: "joins",
    },
    {
      id: "ihg-t22",
      q: "Two coverage checks look interchangeable: COUNT(p.id) = 0 and SUM(p.amount_cents) IS NULL, both over a LEFT JOIN. Are they? Where do they diverge?",
      a: "On well-formed data they agree — no legs means no payment rows, so the count is 0 and the sum is NULL — and the divergence is the lesson. SUM is NULL only when it folds zero rows OR rows whose values are all NULL; a remittance leg with a NULL amount_cents would make SUM NULL while COUNT(p.id) reads 1, splitting 'no leg' from 'a leg with no amount' — which is exactly the distinction a control wants to make. COUNT(p.id) = 0 is the row-existence probe and survives NULL amounts; SUM(...) IS NULL conflates them. The converse trap: SUM over legs of a statement whose legs sum to zero returns 0, not NULL — a zero-valued leg is data, not absence. At IHG the rule lands on the chase list: the never-remitted census (6 statements, 15,217.00) must key on row existence, because the fee desk's claim is 'no remittance ever landed', not 'the remittances summed to nothing' — and the paid-status lie #28 (booked 1,756.00, zero legs) is the anomaly that proves status and leg presence are different facts.",
      tag: "nulls",
    },
    {
      id: "ihg-t23",
      q: "Build the month-over-month royalty walk: each month's folio value, the prior month's beside it, and the percentage change. What does the first row print, and why?",
      a: "Stage the month fold in a CTE (SUBSTR(created_at, 1, 7) as the key — 14 buckets from 2024-01 to 2025-02), then the outer query layers LAG(SUM(total)) OVER (ORDER BY month) for the prior value and 100.0 * (current - LAG) / LAG for the change, rounded once at the end. The first row's prior is NULL and the change is NULL — no baseline exists, and that NULL is the honest print: coalescing it to zero reads as a flat month, dividing anyway yields NULL (not an error), and labeling it 'baseline' in the deck is the defensible move. The walk itself reads: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, and takes the steepest drop, -1,326.87, into November — the same month carrying 2 of the 7 cancellations. The mechanics the interviewer listens for: the CTE exists because window output can't be filtered or reused in the same SELECT, and the percentage's denominator is the same LAG expression — state that the first row divides by NULL and returns NULL, and you have answered the whole question.",
      tag: "dates",
    },
    {
      id: "ihg-t24",
      q: "Before any IHG census ships, it must reconcile. What are the identities this kit's numbers must satisfy, and what does a failed identity tell you?",
      a: "Four identities, and each is a fold checking another fold. The stay census: 52 completed-and-closed + 30 in-house + 14 awaiting arrival + 7 cancelled-or-no-show = 103 booked — every branch a conditional count over the same rows, so a failed foot means a filter drifted, not that a stay vanished. The statement census: 21 exact + 1 partial + 6 none = 28 royalty statements, and the exact bucket's arithmetic closes — settled-paid value plus the void statement's wrongful 925.00 remittance equals the 65,612.00 booked on both sides. The rails: card 16 legs + wire 11 legs = 27 remittance legs, which fold onto 22 statements — 5 splits carrying 2 legs, 6 statements carrying none — and 22 + 6 = 28 closes the loop. The ledger: 181,080.00 debits against 181,080.00 credits across 80 entries, delta 0. A failed identity is never a rounding note — it is a filter, a join type or a CASE arm that changed under you, and the census that does not foot does not ship. Candidates who recite the identities unprompted are describing the job's daily discipline, not answering a question.",
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
    {
      id: "ihg-mcq-11",
      prompt: "The pace walk adds prior_stays with LAG(stays) OVER (ORDER BY month). What prints in the prior_stays column for 2024-01, the spine's first month?",
      choices: ["NULL — no prior month exists on the spine", "0 — the month before any bookings is an empty month", "8 — LAG wraps around to the last row", "The query errors on the first row"],
      answer: 0,
      why: "LAG reads one row back in the window's order; before the first row there is nothing, so the value is NULL — the honest 'no baseline'. Coalescing it to 0 would print a flat empty month and invent demand history the estate never had.",
      notes: [
        { choice: 1, why: "A zero reads as 'the prior month existed and sold nothing' — a data claim, not a baseline marker. The pace deck labels the first row 'baseline' instead." },
        { choice: 2, why: "LAG never wraps. Reading forward from the last row is LEAD's behavior — and even LEAD stops at the end, it does not cycle." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-12",
      prompt: "LATAM booked 2 stays and cancelled 0 of them. What does the cancellation-share map print for LATAM, and what does the row prove?",
      choices: ["NULL — you cannot divide by a population this small", "0.0% — a real conditional count over the 2 booked stays; the zero is a finding, not a gap", "The row is dropped — markets below 10 bookings are excluded", "8.1% — LATAM inherits the estate-wide share"],
      answer: 1,
      why: "The share is SUM(cancel flags) over COUNT(*), and 0 over 2 is 0.0 — a computed zero with a stated denominator. The market stays on the map because 'no cancellations on two bookings' is exactly the kind of small-sample fact the no-show review discusses out loud.",
      notes: [
        { choice: 0, why: "The arithmetic is well-defined — 0/2 = 0.0. NULL would mean the fold failed, which it did not." },
        { choice: 2, why: "A sample-size floor is a presentation policy and must be stated; silently dropping LATAM also drops the estate's only 0% market, which the franchisee scorecard names." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-13",
      prompt: "The estate census over 251 folio lines must report rooms sold. Which expression is the room count?",
      choices: ["COUNT(*)", "SUM(quantity)", "COUNT(DISTINCT order_id)", "SUM(unit_price)"],
      answer: 1,
      why: "quantity carries the rooms on each folio line, so SUM(quantity) folds to the estate's 498 rooms. The royalty base is rooms revenue, which is why the room fold — not the line count — sits on the band board.",
      notes: [
        { choice: 0, why: "COUNT(*) counts folio lines — 251, a billing-detail number. Calling it rooms understates the estate by half." },
        { choice: 2, why: "COUNT(DISTINCT order_id) folds back to stays — 103. A third grain wearing the same column name; the census audits which one you counted." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-14",
      prompt: "27 remittance legs fold onto 22 of the 28 statements — five statements carry 2 legs each. How many statements have NO remittance leg, and how does the query prove it?",
      choices: ["1 — 28 minus 27, one statement short", "6 — 22 statements have legs, 22 + 6 = 28; the anti-join (LEFT JOIN + p.id IS NULL) returns them", "5 — the five split statements are the unremitted ones", "0 — every statement has at least one leg"],
      answer: 1,
      why: "The fold reconciles by construction: 27 legs land on 22 statements (the 5 splits contributing 2 each), so 6 statements carry none — worth 15,217.00, the chase list. The anti-join proves it row by row; the arithmetic identity is the sanity check on the query.",
      notes: [
        { choice: 0, why: "Subtracting row counts across tables assumes one leg per statement — the splits break that assumption, and the difference lands on the wrong number." },
        { choice: 2, why: "The splits are the MOST remitted statements — two rails each. Inverting the fold's direction is the classic misread of a many-side join." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-15",
      prompt: "One Rewards needs each guest's enrollment anchor: the first booking stamp. Which query returns it per guest?",
      choices: ["SELECT customer_id, MAX(created_at) FROM orders GROUP BY customer_id", "SELECT customer_id, MIN(created_at) FROM orders GROUP BY customer_id", "SELECT customer_id, created_at FROM orders WHERE ROWNUM = 1", "SELECT customer_id, COUNT(created_at) FROM orders GROUP BY customer_id"],
      answer: 1,
      why: "MIN(created_at) over the guest's stay rows is the first booking stamp — the cohort anchor every winback window and One Rewards tenure read hangs from. MAX is the most recent stay; the anchor and the recency read are different metrics with different owners.",
      notes: [
        { choice: 0, why: "MAX returns the latest stay — the churn-watch stamp, not the enrollment anchor. Both fold the same rows; only the direction differs." },
        { choice: 2, why: "ROWNUM picks one arbitrary row of the whole table, not each guest's first — and SQLite does not have ROWNUM at all; the shape needs GROUP BY or a window." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-16",
      prompt: "Guests crossing 3,000 lifetime stay value hold 63.5% of the book. Why does the tier filter have to fold BEFORE it classifies?",
      choices: ["Filtering early is faster — WHERE total >= 3000 first, then group", "Lifetime value is a per-guest aggregate; tiering raw stay rows would tier folio lines and misclassify repeat guests whose individual stays are small", "GROUP BY must come after every filter by SQL law", "The 3,000 line is in dollars and totals are in cents"],
      answer: 1,
      why: "The ladder is fold-then-classify: SUM(total) GROUP BY customer_id first (the top guest runs 7,262.35 over 24 stays), then HAVING or an outer filter applies the 3,000 line to the folded value. A guest with 24 modest stays is a tier-1 member; row-level filtering would show them as 24 sub-threshold rows.",
      notes: [
        { choice: 0, why: "WHERE total >= 3000 keeps only individual stays above the line — the opposite of lifetime value, and the 63.5% collapses to single-big-stay share." },
        { choice: 3, why: "Units matter but are not the trap here — the trap is grain: the threshold is a property of the guest fold, so it must be judged after GROUP BY." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-17",
      prompt: "The pace spine buckets stays by month with SUBSTR/STRFTIME. Which key keeps the 14 buckets from 2024-01 to 2025-02 intact?",
      choices: ["STRFTIME('%m', created_at)", "STRFTIME('%Y-%m', created_at)", "SUBSTR(created_at, 6, 2)", "STRFTIME('%Y', created_at)"],
      answer: 1,
      why: "Year plus zero-padded month — '2025-01' — sorts as a calendar and keeps the 14 monthly buckets distinct. The log spans two Januarys; the year is what separates them.",
      notes: [
        { choice: 0, why: "'%m' alone merges January 2024 with January 2025 into one bucket — the pace trend becomes fiction with one bound and no error." },
        { choice: 2, why: "SUBSTR from position 6 grabs the month digits only — the same year-merge bug in a different function's clothing." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-18",
      prompt: "The board asks for each property's share of estate folio value — Nordic's 32% first. Which query shape computes the share correctly?",
      choices: ["AVG per property, then divide by the number of properties", "SUM(value) per property in a CTE, divided by the estate total from a scalar subquery or SUM OVER (), with 100.0 before the division", "COUNT(*) per property divided by COUNT(*) of the estate", "MAX(value) per property divided by SUM of the maximums"],
      answer: 1,
      why: "The share is a ratio of two folds at the same grain: the property's SUM (11,130.25 for Nordic) over the estate's 34,833.28 — staged in a CTE or computed with a window SUM OVER (), multiplied by 100.0 BEFORE dividing so the arithmetic is real, rounded last.",
      notes: [
        { choice: 0, why: "Averaging then dividing by 6 produces a per-property average share — a different metric that cannot reproduce the 32% the board quotes." },
        { choice: 2, why: "COUNT(*) per property over the estate's line count is a workload share (43/251) — folio lines, not value. The scorecard prints both, labeled." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-19",
      prompt: "The estate folds to 251 folio lines over 6 properties — a mean of 41.83 lines each. How many franchised properties clear their estate average?",
      choices: ["3 — Midwest Hardware Co 56, Shenzhen Electro 47, Nordic Gadgets AB 43", "4 — the two properties at 40 lines also clear it", "2 — only the properties above 50", "6 — every property beats the mean of a skewed fold"],
      answer: 0,
      why: "56, 47 and 43 all clear 41.83; the two properties at 40 and Andes Naturals SA at 25 sit below it. The mean gate is the kit's signature nested drill — fold per property first, judge the folded counts against the estate mean second.",
      notes: [
        { choice: 1, why: "40 < 41.83 — near the line is still below it. 'Close to the mean' is not 'above the mean', and HAVING COUNT(*) >= 41.83 is the gate that says so." },
        { choice: 3, why: "With a right-skewed workload the mean sits above most properties — that is WHY the gate is interesting; it flags the flags carrying the estate." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-20",
      prompt: "The guest ladder runs 24 / 17 / 14 / 13 / 5 stays, then a three-way tie at 4. Why does 'top 5 guests by stays' (LIMIT 5) survive the tie without controversy?",
      choices: ["It doesn't — every LIMIT over a tie is ambiguous", "The tie sits entirely below the cut: five distinct stay counts fill the top five slots, so LIMIT 5 returns a deterministic set", "SQLite breaks ties alphabetically, which is deterministic", "The tie is impossible — stay counts are unique per guest"],
      answer: 1,
      why: "The top five values are 24, 17, 14, 13 and 5 — no value at the cut is shared, so LIMIT 5 returns exactly those guests regardless of tie-break. The ambiguity would begin at LIMIT 7, where the three 4-stay guests contend for the sixth and seventh slots.",
      notes: [
        { choice: 0, why: "LIMIT is ambiguous only when the cut lands INSIDE a tie. Here the cut falls between distinct values — the tie never reaches the boundary." },
        { choice: 2, why: "The engine's tie-break is an implementation detail, not a business rule; the safe claim is 'the cut falls between distinct values', not 'the engine sorts names'." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-21",
      prompt: "The drift map shows LATAM check-in latency at 3.5 days — the estate's slowest — but LATAM carries only 2 stamped stays. How does the analyst present that number?",
      choices: ["As the headline — slowest market is slowest market", "Beside its sample: 3.5 days on 2 stamps, flagged as a small-base read the area director verifies before the map ships", "Excluded — markets under 10 stays never appear in the drift map", "Rounded down to the estate average of 2.98"],
      answer: 1,
      why: "The number is real but its base is two rows — one slow check-in moves it by half a day. The population ships beside the rate (2 stamps, versus APAC's 29), which is exactly how the kit's own day-in-life presents it: 'LATAM 3.5 slowest on just 2 stamps, APAC 2.93 quickest on 29.'",
      notes: [
        { choice: 0, why: "Ranking on an unflagged 2-row base is how a single late transfer becomes a 'regional problem' — the follow-up ('how many stamps?') is the interviewer checking for the flag." },
        { choice: 3, why: "Blending a market into the estate average deletes the very drift the map exists to surface — and invents agreement between 2 rows and 82." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-22",
      prompt: "Void statement #11 remitted 925.00 — a leg EXISTS for a voided booking. Why does the never-remitted chase list anti-join miss it, and which probe surfaces it?",
      choices: ["The anti-join is broken — LEFT JOIN + IS NULL always misses void statements", "The anti-join returns statements with NO legs; #11 has one, so only the mirror probe — void status WITH legs (join + status filter) — surfaces it", "Re-run the anti-join with INNER JOIN", "Filter the chase list WHERE status = 'void'"],
      answer: 1,
      why: "The chase list answers 'who never remitted' — #11 remitted, so the anti-join correctly excludes it. The anomaly is the MIRROR: remitted-but-void. Surfacing it needs the opposite population — join legs to statements and keep status = 'void' — one of the two error modes each probe owns exclusively.",
      notes: [
        { choice: 0, why: "The anti-join is doing its job; the population it returns is defined by leg absence, and #11 is not in it. The bug would be expecting one query to be two." },
        { choice: 3, why: "Filtering the chase list by void finds nothing — #11 was never on the chase list. Anomaly walks need their own query, not a filter on the wrong population." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-23",
      prompt: "Royalty statement #25 books 6,148.00 and stores amount_cents = 614800. Which SELECT prints 6148.0 — and why does the .0 matter?",
      choices: ["SELECT amount_cents / 100 — the .0 is cosmetic", "SELECT amount_cents / 100.0 — the .0 forces real division so odd-cent rows keep their cents", "SELECT ROUND(amount_cents / 100) — rounding fixes the truncation", "SELECT amount_cents * 0.01 — scaling down is equivalent"],
      answer: 1,
      why: "Finance tables here store INTEGER cents; the dollar read is amount_cents / 100.0. 614800 divides evenly either way — which is exactly why the rule is drilled on the whole book, where an odd-cent leg under integer division leaks half-dollars silently.",
      notes: [
        { choice: 0, why: "It works on this row and fails on the next — integer division truncates toward zero, and the missing cents never announce themselves." },
        { choice: 3, why: "0.01 is a REAL literal so the arithmetic happens to be real — but the idiom invites the integer variant later, and the kit's rule is one consistent read: / 100.0." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-24",
      prompt: "Which pair of counts proves that exactly 21 of the 103 booked stays lack a check-in stamp?",
      choices: ["COUNT(*) = 82 and MAX(created_at) is not NULL", "COUNT(*) = 103 and COUNT(shipped_at) = 82 — the 21-row gap IS the unstamped population", "COUNT(DISTINCT status) = 4 and SUM(total) = 34833.28", "AVG(shipped_at) IS NULL and COUNT(*) = 103"],
      answer: 1,
      why: "COUNT(*) counts all stays (103); COUNT(shipped_at) counts non-NULL stamps (82). The difference — 21 — is the unstamped population: 14 awaiting arrival plus 7 cancelled-or-no-show. COUNT's NULL-skipping behavior turns into a population proof.",
      notes: [
        { choice: 0, why: "82 alone proves nothing without the 103 beside it — and MAX(created_at) says nothing about stamps at all." },
        { choice: 3, why: "AVG(shipped_at) IS NULL is only true if NO stay has a stamp; with 82 stamps the average is 2.98. The probe tests the wrong aggregate." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-25",
      prompt: "The workload ladder reads 56 / 47 / 43 / 40 / 40 / 25 folio lines. DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) hands the 25-line property which rank?",
      choices: ["6", "5", "4", "3"],
      answer: 1,
      why: "DENSE_RANK shares rungs on ties without gaps: 56→1, 47→2, 43→3, the two 40s both→4, and the next distinct value lands on 5. RANK would hand it 6 — implying a phantom fifth position that no property occupies.",
      notes: [
        { choice: 0, why: "That is RANK's answer: the tie at 4 consumes rungs 4 and 5, so the next property is rank 6. The ladder consumer reads a missing tier 5 as data loss." },
        { choice: 3, why: "Rank 3 belongs to the 43-line property. A tie one rung below does not move earlier ranks — only the rows after the tie renumber." },
      ],
      difficulty: "hard",
    },
    {
      id: "ihg-mcq-26",
      prompt: "A three-band CASE adds a 'premium' arm: unit_price >= 200. The folio ladder tops out at 199.99. What does the banded GROUP BY print for premium?",
      choices: ["A premium row with 0 lines and 0.00 revenue", "No premium row at all — GROUP BY only folds values that exist; printing the empty band needs a zero-fill (dimension-side LEFT JOIN or UNION ALL bucket)", "An error — the CASE must cover observed values only", "All 251 lines under premium — the arm captures everything"],
      answer: 1,
      why: "GROUP BY materializes groups from the data; a band with zero members never becomes a group, so the row silently vanishes. A band read that must print the empty tier builds the band dimension first and LEFT JOINs the fold onto it, or UNION ALLs an explicit zero bucket.",
      notes: [
        { choice: 0, why: "That is what the reader WANTS — and exactly what GROUP BY will not produce by itself. The zero row is an artifact you build, not one the fold emits." },
        { choice: 2, why: "An uncaptured value falls to ELSE (or NULL) — never an error. The silent-empty is precisely why exhaustive arms and stated edges are the band discipline." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-27",
      prompt: "For each statement the fee desk needs its LATEST remittance leg — the most recent by paid_on. Which shape returns one row per statement without losing statements?",
      choices: ["GROUP BY invoice_id with MAX(paid_on), picking the amount by eye", "ROW_NUMBER() OVER (PARTITION BY invoice_id ORDER BY paid_on DESC) = 1 over the joined legs — then the statements with no legs arrive separately via the anti-join", "SELECT DISTINCT invoice_id FROM payments", "ORDER BY paid_on DESC LIMIT 1"],
      answer: 1,
      why: "ROW_NUMBER partitioned by statement and ordered newest-first keeps exactly one leg per statement — and the whole leg row, not just the date. The 6 statements with no legs survive nowhere in a payments-driven fold, so the anti-join companion is part of the answer, not an afterthought.",
      notes: [
        { choice: 0, why: "MAX(paid_on) in a bare GROUP BY pairs the newest date with an ARBITRARY amount from the group — SQLite tolerates it, the reconciliation does not." },
        { choice: 3, why: "LIMIT 1 returns one leg for the whole book, not one per statement. A window is per-partition; LIMIT is global." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-28",
      prompt: "The US market books 19 stays from just 2 guest accounts; EU books 45 stays from 8. Which pair of numbers carries the 'intensity' story?",
      choices: ["19 and 45 — stay volume alone", "9.5 and 5.6 — stays per account, the load-versus-coverage ratio COUNT(*) / COUNT(DISTINCT customer_id) produces", "2 and 8 — account counts alone", "63.5% and 71.2% — the tier concentrations"],
      answer: 1,
      why: "Intensity is stays divided by distinct accounts: the US runs 9.5 stays per account against the EU's 5.6 — a corporate-book signature. Both census grains (load and coverage) print in one row; the ratio is the read the market review argues about.",
      notes: [
        { choice: 0, why: "Volume without coverage says nothing about mix — 19 stays could be 19 accounts (leisure) or 2 (corporate block). The ratio is the story." },
        { choice: 3, why: "Those are lifetime-value tier concentrations — a different fold over different rows. The census keeps its grains straight." },
      ],
      difficulty: "easy",
    },
    {
      id: "ihg-mcq-29",
      prompt: "The coverage CASE must classify 28 statements into 'no payment', 'exact', 'partial'. Which arm ORDER makes the classification misfire-proof?",
      choices: ["exact first (SUM = amount), then partial (SUM < amount), ELSE 'no payment'", "no payment first (COUNT(p.id) = 0), then exact (SUM = amount), ELSE 'partial'", "partial first, then exact, ELSE 'no payment'", "Order is irrelevant — CASE arms are evaluated independently"],
      answer: 1,
      why: "A statement with no legs has SUM(p.amount_cents) = NULL, and NULL = amount is UNKNOWN — so if 'exact' is evaluated first, the no-payment rows fall through to whatever arm catches UNKNOWN. Testing COUNT(p.id) = 0 FIRST pins the no-leg rows before any NULL comparison runs, and the ELSE 'partial' catches the one short-settled statement (#25, 4,000.00 of 6,148.00) by construction.",
      notes: [
        { choice: 0, why: "The NULL comparison is not FALSE — it is UNKNOWN, and UNKNOWN fails the arm and falls through. The misfired rows land in ELSE, rebranded 'partial'." },
        { choice: 3, why: "Arms are evaluated IN ORDER and the first true one wins. Order is the whole difference between a census that reconciles (21 + 1 + 6 = 28) and one that doesn't." },
      ],
      difficulty: "medium",
    },
    {
      id: "ihg-mcq-30",
      prompt: "The close ships only when the ledger proof lands. The fold reads 181,080.00 debits and 181,080.00 credits across 80 entries. What makes tomorrow's fold 'the same query, different answer'?",
      choices: ["Rounding drift across 80 REAL columns", "A one-sided posting — an entry (or an edit) that wrote one side of the books without its pair; delta nonzero is a page, not a footnote", "A new statement arriving after the fold ran", "The fold should exclude void entries first"],
      answer: 1,
      why: "Double-entry is an identity: every posting writes debit and credit together, so the global delta is 0 by construction — the 181,080 = 181,080 proof. A nonzero delta means the PAIRING broke, and the first suspects are the day's inserts and updates, starting with any amount matching a known anomaly (the 925.00 void remittance, for instance).",
      notes: [
        { choice: 0, why: "The ledger is INTEGER cents end to end — the /100.0 read happens once at the display edge and cannot drift. Integers do not accumulate error." },
        { choice: 3, why: "Void entries are data the books absorbed; the trial balance proves what HAPPENED, voids included. Excluding rows to force delta 0 is the control failure itself." },
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
    {
      id: "cs-ihg-3",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The one-pass stay-fate census",
      brief:
        "IHG-flavored brief on the storefront db: the ops board opens with the stay-fate census — every booked stay classified into exactly one fate, in ONE scan, with the branches footing to the booked total. Probed facts: the 103 stays split delivered (completed and closed) 52 stays worth 15,571.07, shipped (in-house) 30 stays worth 11,996.72, pending (awaiting arrival) 14 stays worth 6,113.00, and cancelled 7 stays worth 1,152.49 — 52 + 30 + 14 + 7 = 103 by construction, and the folio values foot to the 34,833.28 book. The map's vocabulary is the kit's: closed, in_house, awaiting, no_show.",
      ask: "Return each stay fate with its stay count and folio value to 2 decimals, busiest fate first.",
      template:
        "SELECT CASE WHEN status = {1} THEN 'closed'\n            WHEN status = 'shipped' THEN 'in_house'\n            WHEN status = {2} THEN 'awaiting'\n            ELSE 'no_show' END AS fate,\n       COUNT(*) AS stays,\n       ROUND(SUM(total), {3}) AS folio_value\nFROM orders\nGROUP BY fate\nORDER BY stays {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-and-closed status",
          why: "The db's delivered status IS the closed fate — 52 stays, 15,571.07. Any other literal misses those rows and they fall into ELSE, inflating no_show and breaking the 52/30/14/7 identity the board checks first.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting-arrival status",
          why: "pending is the 14 stays whose clock has not started — awaiting arrival. Swapping in 'cancelled' misfiles them as no_show and merges two fates the ops review separates: not-yet versus never.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Folio value prints to 2 decimals so the branches foot to the 34,833.28 book exactly. ROUND(…, 1) prints 15,571.1 and the census stops reconciling to the stay ledger to the cent.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-fate-first order",
          why: "The board reads volume first: closed 52, in_house 30, awaiting 14, no_show 7. ASC would open the census on the smallest bucket — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'completed'", "'cancelled'", "1", "ASC"],
      walkthrough:
        "One table, one CASE, one scan — the census the whole kit reconciles against. The CASE maps the db's four statuses onto the ops vocabulary (delivered→closed, shipped→in_house, pending→awaiting, cancelled→no_show), GROUP BY fate folds each bucket once, and the read is: closed 52 / 15,571.07, in_house 30 / 11,996.72, awaiting 14 / 6,113.00, no_show 7 / 1,152.49 — counts footing to 103 and values to 34,833.28, the identity that makes the census a proof rather than a chart. The distractors fail honestly: 'completed' is not a db status, so the 52 delivered rows fall into ELSE and no_show balloons to 59; 'cancelled' in the awaiting slot misfiles the 14 pending stays the same way (no_show 21, awaiting gone); ROUND at 1 decimal breaks the cent-level foot; ASC reads the census bottom-up. No row can appear twice — the arms are exhaustive and ordered, which is what makes ELSE the no_show bucket and not a silent loss.",
    },
    {
      id: "cs-ihg-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month pace walk",
      brief:
        "Growth-review brief, in-world: the pace call wants the stay spine walked month by month — each month's stays beside the prior month's, with the percentage change — so the narrative quotes real steps, not vibes. Probed on the storefront db: 14 monthly buckets from 2024-01 to 2025-02 over 103 stays; the walk opens 8 → 9 → 8 → 7 → 8 → 6, with the May→June fade at -25.0% and the June trough of 6 stays the review's caution row. LAG carries the prior month; the first month's prior is honestly NULL — no baseline exists on the spine's first row.",
      ask: "Return month, stays, the prior month's stays and the month-over-month percentage change, for the first six months.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS stays\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       stays,\n       {1}(stays) OVER (ORDER BY month) AS prev_stays,\n       ROUND(100.0 * (stays - LAG(stays) OVER (ORDER BY month))\n             / LAG(stays) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(stays) walks the window backwards one row — February's prev_stays is January's 8. LEAD would read forward and hand February March's count, silently re-labeling the future as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A pace walk is chronological: ASC keeps 2024-01 on top so each row compares against the row above it. DESC would LIMIT the walk to the NEWEST six months — a different cut of the spine and a different story.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 6 returns the first six months — the run the deck opens with, ending on the 6-stay June trough. The figure 6 is also the June stay count sitting in the output, and the fade is the row the narrative quotes.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "9"],
      walkthrough:
        "Staged windows over a month spine. The CTE folds 103 stays into 14 monthly buckets (the SUBSTR key keeps 2024 and 2025 separate), and the outer query reads each month with its neighbor: LAG(stays) OVER (ORDER BY month) brings January's 8 into February's row, and the percentage divides the delta by that same LAG — 100.0 × 1 / 8 = 12.5% for the Feb step, then 8 → 7 → 8 → 6 drives -11.1, +14.3 and the -25.0 May→June fade. The first month is NULL by design: no prior row, no baseline, no invented zero. The two-step matters — window output is not visible to WHERE or to sibling expressions in the same SELECT, so the CTE stages the grain and the outer SELECT layers the windows. LEAD would read the future (February's prev would be March's 8); SUM would pile a running total into prev_stays; DESC plus LIMIT 6 would show the newest months instead of the opening run; LIMIT 9 amputates the wrong end. Every chip changes what the pace call would conclude.",
    },
    {
      id: "cs-ihg-5",
      tier: "medium",
      topic: "q1",
      universe: "growth",
      title: "The One Rewards repeat cohort",
      brief:
        "Loyalty brief, in-world: the One Rewards review wants the repeat cohort isolated — guests whose booking history shows real frequency — and the cohort's stay count and folio value read beside the whole book. Probed on the storefront db: guests with 10 or more booked stays are exactly 4 of the 16 accounts; their stays number 68 of 103 (66.0%) and their folio value 22,121.70 of the 34,833.28 book (63.5% — the tier-concentration figure the ladder board quotes). The cohort is defined by a fold (stays per guest), so the outer read must select INTO the folded set with an IN subquery — not filter raw stay rows.",
      ask: "Return the repeat cohort's guest count, stay count and folio value to 2 decimals, as one row.",
      template:
        "SELECT {1}(DISTINCT customer_id) AS guests,\n       COUNT(*) AS stays,\n       ROUND(SUM(total), 2) AS folio_value\nFROM orders\nWHERE customer_id IN (\n  SELECT customer_id FROM orders\n  GROUP BY customer_id\n  {2} COUNT(*) >= {3}\n);",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the people counter",
          why: "COUNT(DISTINCT customer_id) folds the cohort's 68 stay rows back to the 4 people who made them. SUM(DISTINCT customer_id) runs but adds the guests' id numbers — a meaningless figure that changes if an id is reissued.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the group threshold",
          why: "COUNT(*) >= 10 judges a per-guest aggregate that only exists after GROUP BY, so it lives in HAVING. WHERE COUNT(*) is a syntax error — no groups exist yet at row-filter time — and the error is the lesson.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the frequency threshold",
          why: "The 10-stay line defines the repeat cohort the review reads: 4 guests, 68 stays, 22,121.70. Loosening to 5 admits more of the ladder's long tail and rewrites every cell — the threshold ships beside the figures it produced.",
        },
      ],
      distractors: ["SUM", "WHERE", "15"],
      walkthrough:
        "Two grains, two layers — the cohort read is a fold inside a filter. The inner query works at the guest grain: GROUP BY customer_id folds 103 stays into 16 accounts, HAVING COUNT(*) >= 10 keeps the 4 whose history crosses the line. The outer query works at the stay grain again: WHERE customer_id IN (…) keeps only the cohort's stays — 68 rows — and folds them twice more: COUNT(DISTINCT customer_id) names the people (4), COUNT(*) the demand (68 stays, 66.0% of the book), SUM(total) the value (22,121.70, 63.5% — the concentration figure the One Rewards board quotes). SUM as the counter would print the guests' id sum where a headcount belongs; WHERE in the threshold slot is a syntax error that teaches the pipeline order; tightening to 15 shrinks the cohort to the two ladder-toppers (41 stays, 13,902.91) — a different, quieter cohort. The threshold is the definition; every figure downstream is its consequence.",
    },
    {
      id: "cs-ihg-6",
      tier: "medium",
      topic: "t5",
      universe: "supplier",
      title: "The property workload ladder",
      brief:
        "Estate-ops brief, in-world: the area directors argue over workload — folio lines per franchised property — and the ladder must respect ties, not split them. Probed on the storefront db: Midwest Hardware Co carries 56 folio lines, Shenzhen Electro 47, Nordic Gadgets AB 43, then Pacific Textiles and Alpine Audio GmbH tie at 40 each, and Andes Naturals SA runs 25 — 251 lines over 6 properties, a 41.83 mean. The tie is real and the board's policy is shared rungs: the two 40s are both rank 4, and the next distinct count shares nothing. Ranking is layered over the fold — lines fold per property first, then the window numbers the folded counts.",
      ask: "Return each property with its folio-line count and a no-gap workload rank, busiest first by rank.",
      template:
        "SELECT s.name,\n       COUNT(*) AS folio_lines,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS workload_rank\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = {3}\nGROUP BY s.name\nORDER BY workload_rank;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK gives the two 40-line properties both rank 4 and hands Andes' 25 lines rank 5 — tiers without gaps, the board's shared-rungs policy. RANK would stamp the 25-line property rank 6, inventing a phantom fifth position no property occupies; ROW_NUMBER would split the tie arbitrarily between two equal flags.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Rank 1 must be the workload crown — Midwest Hardware Co at 56 lines — so the window ORDER BY runs descending. ASC would crown Andes Naturals SA's 25 lines rank 1 and hand Midwest rank 6: a correct query answering the opposite question.",
        },
        {
          answer: "p.supplier_id",
          kind: "keyword",
          label: "the property key",
          why: "Room types carry supplier_id — the franchised property that owns them — so the second hop joins ON s.id = p.supplier_id. Matching on anything else (the line's own product id, or the order id) mis-attaches every folio line and the ladder ranks noise.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "oi.product_id"],
      walkthrough:
        "Fold, then rank — the order IS the lesson. The two-hop join walks folio lines to room types to properties (the supplier_id on products is the franchise flag), GROUP BY s.name folds 251 lines into six properties — 56, 47, 43, 40, 40, 25 — and the window ranks the FOLDED counts: DENSE_RANK OVER (ORDER BY COUNT(*) DESC) reads 1, 2, 3, 4, 4, 5. The tie is the point: Pacific Textiles and Alpine Audio GmbH share rank 4 because the board's policy is shared rungs, and DENSE_RANK is the function that neither skips a number (RANK would hand Andes rank 6, implying a missing tier 5) nor splits ties (ROW_NUMBER would break 40/40 by whatever order the engine finds first). Flip the direction and the quietest property crowns the ladder; join on the line's own product id and every count mis-attaches. Rank semantics are a business policy here — the interviewer wants the policy named, the function chosen to match, and the tie-breaker discussion had out loud.",
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
    { slug: "department-top-three-salaries", why: "Top room types per franchised property: DENSE_RANK per group, join back for names, NULL-safe on the tie — the estate board's per-flag ladder in textbook form." },
    { slug: "second-highest-salary", why: "Ladder ceilings are the One Rewards drill: the second DISTINCT lifetime-value tier must survive duplicate totals, which is the DENSE_RANK-or-MAX-below-MAX instinct the tier board assumes." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain census at month grain: stays beside distinct guests per month bucket — load and coverage in one row, the census habit this kit grades on." },
    { slug: "average-time-of-process-per-machine", why: "Per-property booking-to-check-in latency over stamped stays only — the arrival clock with its 2.98-day baseline, grouped the way the drift map groups it." },
    { slug: "weather-type-in-each-country", why: "CASE labels folded per market: db status codes translated into ops vocabulary in one pass — the one-scan census shape the board requires." },
    { slug: "active-users", why: "Consecutive-month booking runs via gaps-and-islands — the One Rewards engagement streak, turned into a countable window instead of an eyeball read." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Self-join plus a HAVING floor on group size — the franchise gate shape: properties carrying at least N room types, judged after the fold." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Nested gate: folio lines whose room count beats the estate average — fold, mean, compare, with the empty-inner-query answer expected unprompted." },
    { slug: "movie-rating", why: "The two-population board packet: one argmax plus one per-entity fold in a single query — the set-algebra composition the estate scorecard is built from." },
    { slug: "second-day-confirmation", why: "The check-in gap at its simplest: days between booking and arrival — the arrival clock's raw arithmetic before any population filter is applied." },
    { slug: "game-play-analysis-iv", why: "First-stay-then-return conversion: guests whose second booking follows their first — the repeat-guest engine behind the One Rewards ladder, as a dated window check." },
    { slug: "sellers-with-no-sales", why: "Properties with zero folio lines in a window — the anti-join with a date filter, honest about the confident zero this estate returns and why the proof still ships." },
    { slug: "product-price-at-a-given-date", why: "The as-of nightly rate: the price in force on the booking date, not today's — the slowly-changing-rate instinct behind every RevPAR restatement." },
    { slug: "list-the-products-ordered-in-a-period", why: "Date-bounded room types with a half-open window — the quarter cut that keeps its last night, the calendar discipline the pace spine lives on." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT folio rollups per check-in day — many lines folded into one readable cell, the board-packet stitch in miniature." },
    { slug: "find-the-team-size", why: "COUNT() OVER (PARTITION BY …) enrichment: attach each property's folio-line count to every line without collapsing rows — window-on-fact-table fluency." },
  ],
};
