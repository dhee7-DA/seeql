// easyJet — Wave-11 (Task 102), travel domain, standard spec. No tagged pool —
// theme-curated; facts from scripts/company-facts.md.
// Europe's low-cost carrier on an ANCILLARY-ATTACH angle (distinct from ryanair's
// load-factor/yield-per-basket framing and southwest's open-seating/boarding framing):
// the storefront db read as the unbundled-fare P&L for an allocated-seating carrier —
// customers are passengers (region = market), orders are bookings (PNRs: delivered =
// flown and closed 52, shipped = flown with the trip still open 30, pending = inside the
// booking window 14, cancelled = never boarded 7), order_items are fare/ancillary lines
// (quantity = seats or units, unit_price = the per-item fee), products = ancillary SKUs
// with the db category codes as the seven ancillary families, suppliers = airport/handling
// and route partners, invoices = settlement statements, payments = rails (card = direct,
// wire = partner-invoiced), expenses = the fixed opex stack (gate rent, marketing, crews),
// ledger_entries = GL. Finance tables store INTEGER cents — dollar read = amount_cents/100.0;
// orders.total and order_items.unit_price are REAL dollars. The attach story rides the
// fare-band fold: unit_price < 55 = the basic band (seat-allocation and cabin-bag fees —
// 268 seats @ 31.01 average line price), >= 55 = the flex band (hold bags and flexible
// fares — 230 seats @ 115.85), 498 units across 251 lines, 2.44 lines per booking.
// Pool provenance: company-pools.md carries NO easyJet section (0 tagged rows) — every
// topic slug set and all 32 problems are theme-curated from the theme menu's sql rows
// (no w*/d*/f* rows) and say so in brief P4.
// Facts source: scripts/company-facts.md (scale census, status grid, region books, band
// fold, category crowns, settlement anomalies — all verbatim). Probe-derived cells,
// probed read-only against db/custom.db on this task and declared for canonicalization:
// per-market fare-band pivot (basic/flex units + basic share: US 66/46/58.9, APAC
// 96/78/55.2, LATAM 7/6/53.8, EU 99/100/49.7). Every case slot is mechanically verified
// against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: easyjet is NOT yet in registry COMPANY_META
// — wire id "easyjet", domainId "travel", name "easyJet",
// tagline "Ancillary attach by SQL: fee bands, fare classes, the unbundled P&L",
// accent "text-orange-500" to match this header exactly.

import type { CompanyKit } from "../types";

export const easyjetKit: CompanyKit = {
  id: "easyjet",
  domainId: "travel",
  name: "easyJet",
  tagline: "Ancillary attach by SQL: fee bands, fare classes, the unbundled P&L",
  accent: "text-orange-500",

  brief: [
    "**easyJet** is Europe's low-cost carrier built around one pricing idea: the fare is unbundled, every extra is a line item, and the margin lives in what attaches after the seat is sold — {orange:allocated seating}, cabin and hold bags, flex fares. Since allocated seating became the default, the seat map itself is inventory with a price, and every booking is a small P&L. In this app's training db the mapping is honest: `orders` are bookings (PNRs), order_items are the fare and ancillary lines a PNR carries, products are ancillary SKUs whose category codes stand in for the seven ancillary families, customers are passengers, and shipped_at is the flight flown. Probed scale: **103 bookings worth 34833.28** carrying **251 fee/fare lines** — quantity is seats or units, unit_price is the per-item fee — about 2.44 lines per booking.",
    "The data org splits the way the P&L does. Ancillary pricing owns the band story: the fare-band fold splits the 498-unit book into **268 seats on sub-55 fees** (31.01 average line price — the basic band: seat allocation, cabin bags) against **230 seats on 55-plus fees** (115.85 — the flex band: hold bags, flexible fares), and that one CASE fold is the most re-cut query in the building. The market cut flips it: the US books 58.9% basic while EU runs flex-led at 49.7% — 99 basic units against 100 flex. Revenue management owns load: **82 of 103** bookings flew (52 {emerald:closed} plus 30 open), 14 sit pending in the booking window, and 7 are {rose:cancelled} — 6.8% of demand that never boarded. Finance owns settlement, where partner money moves as integer cents across 28 invoices and 27 payments.",
    "The SQL screens are live-db and denominator-ruthless. You will be asked for a fare-band mix by market in one pass — units per band, share, ordered — and the traps are three different counts wearing one column name: **251 lines, 498 units, 103 bookings**. You will be asked for the attach board — families ranked by units with each one's share of the 498-unit book — and the trap is the fan-out: join lines to SKUs and COUNT(*) counts lines while the business asked for seats. Dead-attach anti-joins return **zero rows** here — every passenger and every SKU has moved — and the per-item fee ceiling sits at **199.99**, so premium-band filters come back empty by construction.",
    "Prep the way the screens run: CASE folds until a fee-band pivot is one query with exhaustive, ordered arms; conditional counts (`COUNT(*) FILTER (WHERE …)`, SUM(CASE …)) until the booking-state census folds in one pass; window ranks with an opinion on ties and a `SUM(SUM(…)) OVER ()` share; julianday for the **2.98-day** average booking-to-departure lead; month buckets via SUBSTR(created_at, 1, 7) across 2024-01 to 2025-02. The pools file carries no easyJet section — **0 tagged rows** — so every problem and slug here is theme-curated to these screen shapes. Then rehearse the two sentences the interviewer grades: *the numerator is fee units in the band, the denominator is every unit booked — and lines, seats and bookings are three different counts on the same rows*.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks easyJet's data desks rehearse most: the fare-class band pivot, the ancillary attach board, a one-pass fate census by market, the upsell-window clock on julianday leads, the settlement coverage census that classifies on money instead of status, and the above-mean fare gate with its scalar-subquery empty-case drill. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the **30 MCQs** and theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'how do you know?' follow-up tests.",
  ],

  dayInLife: [
    "**07:40 —** The day opens on the attach dashboard before standup: did the overnight bookings land, does the fate census reconcile — 52 closed + 30 open + 14 in-window + 7 cancelled = **103 by construction** — and did any market's fare-band mix drift? Yesterday's pivot had EU at 49.7% basic (99 against 100 flex — the one flex-led market), and a two-point move there is *an ancillary-pricing incident*, not a rounding note. The analyst re-runs the band fold — **268 basic seats at 31.01, 230 flex at 115.85** — before anyone quotes a mix number in the standup.",
    "**11:30 —** Deep work: the ancillary pricing pack. The fare-band pivot by market (US 66/46, APAC 96/78, LATAM 7/6, EU 99/100), then the attach board — families ranked by units, shares of the 498-unit book, and the standing awkwardness that the units leader (121, 24.3%) is not the value leader (another family carries 11,744.01 on just 97 units). Each ask is a join, a conditional fold and one judgment call about grain. The analyst writes the share column twice — *once with the units denominator, once with the value denominator, both labelled, so the meeting argues strategy instead of arithmetic*.",
    "**16:15 —** Stakeholder cycle: revenue management wants the **6.8%** cancellation haircut on every forecast slide and the 2.98-day booking-to-departure lead beside it (the upsell window); the airport-partners desk wants settlement hygiene — 21 statements settled to the cent, one partial stuck at 4,000 of 6,148, **6 never-collected worth 15,217** — before the partner call at five. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the pack ships} or the partner call opens with an apology.",
  ],

  metrics: [
    { name: "Ancillary lines per booking", what: "Fee/fare lines over bookings — 251 over 103, 2.44, max line quantity 3. The attach-rate proxy: how many priced extras the average PNR carries beyond the seat, and the first number the ancillary pricing pack re-cuts each week." },
    { name: "Fare-band mix", what: "Seats by fee band — 268 on sub-55 basic fees (31.01 average line price) against 230 on 55-plus flex fees (115.85). The CASE-band fold is the carrier's monetization spine: one threshold, two fare classes, and every mix claim must state which band fed it." },
    { name: "Band mix by market", what: "Basic share of units per market — US 58.9% (66/46), APAC 55.2% (96/78), LATAM 53.8% (7/6), EU 49.7% (99/100). EU is the flex-led market; a two-point drift there reroutes the ancillary-pricing queue before lunch." },
    { name: "Attach concentration", what: "Share of the 498-unit book by family — the leader holds 121 units (24.3%), the ladder runs 121/97/85/61/54/53/27. Units leadership and fee-value leadership are different families; the board shows both or it misleads." },
    { name: "Flown share (load state)", what: "Bookings that flew over bookings made — 82 of 103 on the db, 79.6% (52 closed plus 30 open). Every read that filters the 7 cancelled out of the base first prints a load factor the network never earned." },
    { name: "Booking-to-departure lead", what: "julianday(flight) minus julianday(booking) on flown bookings — 2.98 days average, range 2 to 4. The length of the window in which seat-allocation and bag offers still attach; the upsell clock by market." },
    { name: "Cancellation share by market", what: "Cancelled bookings over booked — 6.8% network, 8.1% in the busiest APAC-like market, 0 in LATAM. The haircut every load and revenue forecast carries before seats are re-released." },
    { name: "Settlement coverage", what: "Partner statements versus money moved: 21 settled to the cent (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — INTEGER cents until the /100.0 read, 28.4-day average settlement against uniform 30-day terms." },
  ],

  topics: [
    {
      name: "Fee-band CASE folds",
      why: "easyJet's fare classes are CASE arms: sub-55 fees ride basic, 55-and-over ride flex, and the band fold (268 seats at 31.01 versus 230 at 115.85) is the carrier's most re-cut query. Arms must be exhaustive and ordered — a hole in the CASE is a hole in the fare book, and a reordered WHEN quietly re-bands the base. NULL prices falling into a catch-all ELSE is the standing data-quality trap.",
      slugs: ["exchange-seats", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Attach-rate line folds",
      why: "Ancillary analytics lives on order_items: units and fee value folded per family, per market, per booking. The join from bookings to lines fans out, so every fold must state its grain — 251 lines, 498 units or DISTINCT bookings are three different answers to one question. Lines per booking (2.44) is the attach headline and it is a ratio of two different counts.",
      slugs: ["product-sales-analysis-iii", "basket-depth-aov", "repeat-purchase-rate", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Booking-state censuses",
      why: "The load read is a conditional census — booked, flown, in-window, cancelled, share — folded in one pass over status and timestamps. The trap is filtering the denominator: drop the 7 cancelled before the fold and the 79.6% flown share inflates to a number the network never earned. FILTER (WHERE …) and SUM(CASE …) are the exact drills.",
      slugs: ["flight-occupancy-and-waitlist-analysis", "immediate-food-delivery-i", "number-of-rich-customers", "trips-and-users", "user-activity-for-the-past-30-days-i", "same-day-sale"],
    },
    {
      name: "Two-grain market censuses",
      why: "Bookings and passengers are different grains of the same join — every market census here reports both: EU runs 45 bookings from 8 passengers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id), and saying which column is load and which is coverage, is the habit being graded; the ratio is the intensity read that decides where ancillary offers get pushed.",
      slugs: ["article-views-ii", "students-and-examinations", "sales-by-day-of-the-week", "the-number-of-passengers-in-each-bus-i", "the-number-of-passengers-in-each-bus-ii", "big-countries"],
    },
    {
      name: "Attach boards & rank policy",
      why: "The attach board ranks families by units — 121, 97, 85, 61, 54, 53, 27 — a ladder with no ties today and guaranteed ties tomorrow as families converge. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer families, not syntax. easyJet's own pricing boards publish the tie policy; candidates are asked to defend it.",
      slugs: ["top-five-artists", "compute-the-rank-as-a-percentage", "sort-the-olympic-table", "the-airport-with-the-most-flights", "the-most-recent-orders-for-each-product", "the-most-recent-three-orders"],
    },
    {
      name: "Booking-pace walks & LAG",
      why: "The 14-month booking spine (2024-01 to 2025-02) is the pace call's home turf: prior month beside current, delta rounded, the July trough (1,193.86 with 2 cancellations) and the November dip (1,648.80, again 2 cancelled) named and defended. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["week-over-week-churn", "consecutive-transactions-with-increasing-amounts", "monthly-transactions-i", "consecutive-available-seats", "calculate-orders-within-each-interval"],
    },
    {
      name: "Ratio discipline",
      why: "easyJet screens are ratio culture: attach rates, basic shares, flown percentages — each a fold over a stated denominator with real division. The 100.0 multiplier sits BEFORE the slash or integer division truncates the attach share toward zero and the board reads flat. Naming the numerator and denominator out loud is the graded move.",
      slugs: ["ads-performance", "friend-requests-i-overall-acceptance-rate", "low-quality-problems", "user-purchase-platform"],
    },
    {
      name: "Zero-attach anti-joins",
      why: "A passenger who books a seat but never attaches a bag, a family with no takers — the anti-join is the ancillary team's leak detector. On this db every passenger and every SKU has moved, so the drill includes proving that a confident zero is the true answer rather than a broken join. NOT EXISTS versus LEFT JOIN … IS NULL versus NOT IN is a three-way argument the panel expects you to referee.",
      slugs: ["customer-who-visited-but-did-not-transact", "number-of-accounts-that-did-not-stream", "students-with-invalid-departments"],
    },
    {
      name: "Nested fee gates",
      why: "Screens escalate into staging: fold per-passenger fee totals, then judge them against a computed platform mean (the 338.19 average booking). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Ancillary targeting is exactly this: which passengers ride above the platform's fee curve.",
      slugs: ["second-highest-salary", "investments-in-2016", "game-play-analysis-iv", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Statements & cents discipline",
      why: "Partner settlement moves as INTEGER cents across 28 statements and 27 payment legs, and a skipped /100.0 turns a clean tie-out into a phantom break a hundredfold. The coverage census — 21 exact, 1 partial (4,000 of 6,148), 6 none — is one CASE away, and the void-but-debited 925.00 statement is the standing reconciliation catch the panel watches for.",
      slugs: ["bank-account-summary-ii", "count-apples-and-oranges", "monthly-transactions-ii", "ar-aging-schedule", "gl-reconciliation"],
    },
  ],

  theory: [
    {
      id: "easyjet-t1",
      q: "You are building the zero-attach report: passengers who booked a seat but never bought an ancillary. INNER or LEFT — and what does the fan-out do to your counts?",
      a: "The zero-attach read is an anti-join, so it is LEFT from passengers to fee lines with IS NULL — the passengers with no ancillary rows ARE the answer, arriving with NULL line columns. INNER would delete exactly the population the ancillary team wants. Then the fan-out: one booking carries 2.44 fee lines on average, so joining passengers to order_items multiplies rows and COUNT(*) counts lines, not passengers — the fix is COUNT(DISTINCT customer_id) or folding bookings first. The honest wrinkle on this db: the anti-join returns ZERO never-attaching passengers — all 16 have moved — and a confident zero you did not verify is how attach reports die in review, because the same shape run on a staging feed with a broken join also returns zero. Prove the zero: run the unconditional count beside it and state both.",
      tag: "joins",
    },
    {
      id: "easyjet-t2",
      q: "The attach ladder reads 121, 97, 85, 61, 54, 53, 27 units. RANK, DENSE_RANK or ROW_NUMBER — and what does each imply when two families tie next quarter?",
      a: "The rank trio is a business policy about shared rungs and gaps, and the interviewer wants the policy named, not the syntax recited. RANK gives tied families the same rung and then skips — two families tied at 54 would both read 5 and the 27-unit family would land on 7, implying a phantom position 6 that no family occupies. DENSE_RANK shares rungs without gaps — the tie reads 5, 5 and the next distinct family is 6. ROW_NUMBER splits ties arbitrarily, which silently decides whose family gets the pricing team's attention first. On this db the ladder has no ties, so all three agree — which is exactly why the question is asked: the day two families converge, the published board must already carry its tie policy. The strong answer picks shared rungs for peer families or names an explicit tie-breaker (fee value, then family id) and writes it in the query comment.",
      tag: "windows",
    },
    {
      id: "easyjet-t3",
      q: "One question, three numbers: 251 lines, 498 units, 103 bookings. Which aggregate returns which, and why does the panel care?",
      a: "COUNT(*) over order_items counts lines — 251 fee/fare rows. SUM(quantity) counts units — 498 seats, bags and extras, because a line can carry up to 3 units. COUNT(DISTINCT order_id) counts bookings touched — 103. Every attach claim on this db is one of the three wearing a name, and the panel grades whether you say which before you compute: lines-per-booking is 251/103 = 2.44, units-per-booking is 498/103 = 4.83, and calling either 'attach rate' without the grain is the disqualifying move. The trap compounds through joins — fold lines to families and COUNT(*) counts line records (the busiest family by lines is not the busiest by units) — and through fan-out, where a careless join to passengers triple-counts multi-unit lines. One row per what? is the habit the whole interview funnels toward.",
      tag: "aggregation",
    },
    {
      id: "easyjet-t4",
      q: "shipped_at is NULL until a booking's flight actually flies. What is your policy for the booking-to-departure lead, and what do NULLs do inside the aggregate?",
      a: "Policy first: only flown bookings have a lead, so the metric is open-to-flight for the 82 of 103 bookings that carry the stamp — averaging 2.98 days, range 2 to 4 — and the title says so. Then mechanics: AVG ignores NULLs, so AVG over ALL bookings returns the flown-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the flown subset; the gap between it and COUNT(*) is exactly the 14 in-window plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day flights for bookings that have not departed and poisons the 2.98 baseline every upsell-window decision keys off. State the 82-row population before the panel asks; the strong candidate ships the denominator with the number.",
      tag: "nulls",
    },
    {
      id: "easyjet-t5",
      q: "The fare-band share query computes 100.0 * SUM(band units) / SUM(all units). Where does every filter live, and why does the 100.0 sit where it sits?",
      a: "Three placements, three failure modes. The band rule is a row-level fact — CASE WHEN unit_price < 55 inside the fold; putting it in WHERE would delete the flex arm and the denominator with it. A market floor like 'at least ten bookings' is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; it errors in WHERE because COUNT does not exist before groups form. The 100.0 sits BEFORE the division because SUM of 0/1 flags over a COUNT is integer arithmetic — the share truncates toward zero and a 46.2% flex share prints as 46 or, worse, a thin band prints as 0. On this db the band fold is 268 basic seats against 230 flex — 53.8 versus 46.2 — and both numbers die quietly under integer division. Pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a fare-mix slide and an error, or between a share and a zero.",
      tag: "pipeline",
    },
    {
      id: "easyjet-t6",
      q: "WHERE fee_total > (SELECT AVG(fee_total) FROM staged) — what is that scalar subquery contractually allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and fee_total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full book that is theoretical: 103 bookings always produce a mean (338.19 here). On staged slices — one market, one band, one month — the empty-inner-query bug ships regularly, and the above-average gate is where it hides; a LATAM-only staging table (2 bookings) is exactly where a future filter empties the fold. The correlated cousin (compare each booking to ITS passenger's average) re-runs per outer row and answers a different question at a different cost, inheriting the same empty-case behavior. And the NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. State the inner fold's population and its empty-case behavior unprompted — that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "easyjet-t7",
      q: "The pace report buckets bookings by month on TEXT timestamps. How do you build the spine, cut a peak window without losing its last night, and read the first row of the LAG walk?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the pace trend becomes fiction. The peak window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-09-01' — because BETWEEN '2024-08-01' AND '2024-08-31' silently drops the last night's bookings, and departures are exactly when late bookings land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell the story: the book opens at 3,731.97, troughs at 1,193.86 in July with 2 of the 7 cancellations, and dips again to 1,648.80 in November, also 2 cancelled. Date discipline is pace discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "easyjet-t8",
      q: "The partners desk says a settlement statement is 'paid' but payments has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the mirror error: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join, and it folds INTO the 'exact' bucket by construction — the coverage census must read 21 exact (65,612.00 both sides), 1 partial (#25: 4,000.00 of 6,148.00), 6 none, footing to 28. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the partner call does not happen.",
      tag: "quality",
    },
    {
      id: "easyjet-t9",
      q: "Build the market census the ops review opens with: bookings and passengers per market, one pass. What are the two aggregates, and what does their ratio mean?",
      a: "COUNT(*) over the bookings-joined-to-passengers fold counts bookings — EU 45, APAC 37, US 19, LATAM 2 — and COUNT(DISTINCT o.customer_id) counts the passengers behind them — EU 8, APAC 5, US 2, LATAM 1. Both columns come from one GROUP BY c.region; the star is volume, the DISTINCT is coverage, and they are different facts about the same rows. The ratio — 45/8 = 5.6 bookings per EU passenger versus 9.5 in the US — is the intensity read that decides where ancillary offers get pushed: a market can be big by bookings and tiny by people, and the attach strategy differs accordingly. Name the grain of each column before the fold ships; the panel grades the naming, not the syntax.",
      tag: "aggregation",
    },
    {
      id: "easyjet-t10",
      q: "Walk me through a cumulative booked-value column over the 14-month spine. Which window shape keeps every row, and where do people go wrong?",
      a: "Fold first, then accumulate: GROUP BY the '%Y-%m' key, then SUM(SUM(o.total)) OVER (ORDER BY month_key) — the inner SUM is the monthly fold, the outer SUM walks it across the spine and every row survives. The two wrong shapes are PARTITION BY month (each bucket becomes 100% of itself — a 'cumulative' that equals the monthly total) and a self-join to prior months (quadratic cost and fan-out the windows were invented to replace). The ORDER BY inside OVER is the direction of accumulation — oldest first — and it is independent of the display's ORDER BY. On this spine the cumulative opens at 3,731.97 and crosses 20,000 inside the first six months; the curve, not the monthly bars, is what the pace call projects forward.",
      tag: "windows",
    },
    {
      id: "easyjet-t11",
      q: "Which passengers attached both a cabin-bag family line and a hold-bag family line? Give me the set-algebra answer and the join answer — and when each wins.",
      a: "Set algebra: fold each family's passenger set with SELECT DISTINCT customer_id ... WHERE the family matches, then INTERSECT — each side is 'attached X', the intersection is 'both', and every passenger appears once. The join answer: order_items self-joined on order_id (or customer) with the two families on opposite sides and a family inequality in the ON clause — correct but at pair grain, so a passenger with three cabin lines and two hold lines arrives six times and needs a DISTINCT. INTERSECT wins on readability and dedupes by definition; the self-join wins when you need the pairing detail (which specific families co-attach) rather than just membership. What fails silently is the row-level WHERE family = 'cabin' AND family = 'hold' — one column, one row, never both values — the empty result that looks like 'nobody bundles' rather than 'wrong shape'.",
      tag: "setops",
    },
    {
      id: "easyjet-t12",
      q: "A merged feed left emails in mixed case and padded with spaces, and the passenger-dedupe join is missing matches. Fix it.",
      a: "Normalize the key on both sides of the equality: JOIN ON UPPER(TRIM(a.email)) = UPPER(TRIM(b.email)). The join is a byte-for-byte comparison — 'Alice.Chen@x' and 'alice.chen@x ' never match no matter how obviously the same person they are — so the fix belongs in the key expression, not in the rows. Two things the fix must not do: DISTINCT after the fact only hides the duplicate rows that DID match and leaves the missing matches missing, and rewrites-at-load destroy the original value the source system still keys on. The follow-up worth saying: pick one canonical case for the printed report (LOWER at the display edge) and document that the join is case-insensitive by construction — 'know your passenger' begins with 'match your passenger'.",
      tag: "casing",
    },
    {
      id: "easyjet-t13",
      q: "Two date questions in one: how do you compute the booking-to-departure lead on TEXT timestamps, and how do you cut 'the last 30 days of bookings' without losing a night?",
      a: "The lead is julianday(shipped_at) - julianday(created_at) — each TEXT stamp converts to a Julian day number and the difference is days, averaging 2.98 over the 82 flown bookings. The window is half-open: created_at >= date('now', '-30 days') AND created_at < date('now') — the upper bound excludes today's partial day, whereas BETWEEN ... AND today's midnight-to-midnight bucket silently includes or drops the boundary depending on the timestamp's time component. The two rules rhyme: both are about treating TEXT timestamps as numbers only after an explicit conversion, and both are about stating the boundary convention in the query comment. On this book the lead range is 2 to 4 days — tight enough that one lost evening moves the average.",
      tag: "dates",
    },
    {
      id: "easyjet-t14",
      q: "NULLIF, IFNULL, COALESCE — the panel asks you to assign each a job on the attach board.",
      a: "Three jobs, one each. NULLIF guards division: SUM(quantity) / NULLIF(COUNT(DISTINCT order_id), 0) turns a zero-denominator empty slice into NULL — the honest gap — instead of a fabricated 0.00 attach rate. IFNULL supplies a display default at the edge: IFNULL(seat_pref, 'none') prints a cell for the ops board while the pipeline above keeps NULL. COALESCE is the generalist — first non-NULL among candidates — and its honest use is fallback chains (preferred name, then booked name, then 'PAX-' || id), not laundering missing data mid-pipeline. The dividing line the panel wants stated: NULL means unknown-or-absent and survives until display; 0 means measured-zero and is a claim. A NULLIF'd gap and a zero attach rate lead to opposite pricing decisions — that is why the engine gives you all three.",
      tag: "nulls",
    },
    {
      id: "easyjet-t15",
      q: "Flag passengers whose average fee per booking rides above the platform curve. Write the correlated shape and say what it costs.",
      a: "The correlated shape: FROM passengers p JOIN orders o ... GROUP BY p.id HAVING AVG(o.total) > (SELECT AVG(total) FROM orders o2 WHERE o2.customer_id = p.id) is the wrong question — the platform curve is the UNCORRELATED mean, 338.19: HAVING AVG(o.total) > (SELECT AVG(total) FROM orders). Correlated means the inner query re-runs per outer row (its WHERE references the outer row), which is the right tool when the benchmark is per-group — each passenger against THEIR market's mean — and the cost is one inner scan per row. The uncorrelated scalar computes once and compares everyone to one number. The empty-inner-query behavior is inherited either way: if a staging slice empties the fold, the scalar returns NULL and the comparison goes UNKNOWN — the target list silently empties. Say which benchmark you are using before writing the shape; the panel is testing whether cost and semantics are one decision for you.",
      tag: "subqueries",
    },
    {
      id: "easyjet-t16",
      q: "The per-booking ancillary manifest must read 'cabin-bag, hold-bag' in load order, one cell per PNR. How do you build and validate it?",
      a: "GROUP_CONCAT folds the family labels: after joining lines to SKUs, GROUP_CONCAT(p.category, ', ') with GROUP BY o.id produces the cell. Validate two ways. Ordering: GROUP_CONCAT's order is unspecified without a trick — fold from an ordered subquery or sort in the display layer; 'load order' is a claim someone will check. Grain: a multi-unit line repeats its family in the manifest, which is honest — the PNR carried two hold bags — but a deduplicated variant (families touched, not units) is a different deliverable worth a second column. The cell is a display artifact: you cannot aggregate over it after folding, so any downstream count folds from the underlying lines first. The manifest is the query the ramp agents actually read — format is a requirement, not decoration.",
      tag: "quality",
    },
    {
      id: "easyjet-t17",
      q: "Same attach ladder, two questions: share of the network book, and rank within market. What changes in the window spec?",
      a: "Only the partition — but everything follows from it. Network share: the denominator is SUM(SUM(oi.quantity)) OVER () under GROUP BY family — one grand total, 498 units, and the US basic fold divides by it only if the question really is 'share of the network'. Rank within market: RANK() OVER (PARTITION BY c.region ORDER BY units DESC) restarts the ladder at 1 in every market — EU's most-attached family is rank 1 there even if it is rank 3 network-wide. The failure mode is mixing the two: a market share computed over the unpartitioned window prints 13.3 where the board promised 58.9, and a 'network rank' computed over a partition prints six rank-1s where the board promised one. Write the partition clause first, then ask what the denominator's population is — the spec is the definition.",
      tag: "windows",
    },
    {
      id: "easyjet-t18",
      q: "Three filters, one query: fee lines under 55, markets with at least 20 bookings, top market only. Where does each live in the pipeline, and why?",
      a: "The band rule is row-level — WHERE unit_price < 55, applied while rows still exist, before any fold. The market floor is group-level — HAVING COUNT(*) >= 20, judgeable only after GROUP BY creates the markets (and the alias form HAVING bookings >= 20 works in SQLite; the concept is placement, not spelling). 'Top market only' is display-level — ORDER BY bookings DESC LIMIT 1, the last pipeline stage, after sorting exists. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not ceremony here; it is the engine's evaluation order, and each filter can only judge facts that exist at its stage. The classic shipped bug is a band rule in HAVING (correct output, folded before filtering — wasteful but honest) versus a floor in WHERE (compile error) — and the sneaky one is a display LIMIT confused for a threshold, which changes meaning the day a fourth market qualifies.",
      tag: "pipeline",
    },
    {
      id: "easyjet-t19",
      q: "The fate census — closed, open, in-window, cancelled per market — must fold in ONE pass. Show the shape and defend why not four queries.",
      a: "COUNT(*) FILTER (WHERE o.status = 'delivered') AS closed, FILTER (WHERE status = 'shipped') AS open_flown, and so on — four conditional counts under one GROUP BY c.region, every row read once. Four separate queries means four scans and, worse, four chances for the WHERE populations to drift apart — the census must reconcile upward to 103 by construction (24+12+6+3 in EU; 21+8+5+3 APAC; 5+10+3+1 US; 2+0+0+0 LATAM), and one pass makes the reconciliation structural: the arms are exhaustive over status, so the rows sum to the GROUP BY's count. SUM(CASE WHEN ... THEN 1 ELSE 0 END) is the portable twin; FILTER is the readable one. The defense in one sentence: a census that cannot disagree with itself is the cheapest control the ops review owns.",
      tag: "aggregation",
    },
    {
      id: "easyjet-t20",
      q: "Fraud wants duplicate-booking detection: the same passenger with two bookings created in the same window. Sketch the self-join and its two traps.",
      a: "Self-join orders to itself: o1 JOIN o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id AND ABS(julianday(o1.created_at) - julianday(o2.created_at)) <= 1 — the id ordering makes each pair appear once and kills self-pairs; the julianday window is the 'same window' definition, stated as a number. Trap one: without o1.id < o2.id every pair arrives twice and every booking pairs with itself — the alert count doubles and fills with non-duplicates. Trap two: the window predicate belongs in the ON clause, not WHERE — same placement logic as the LEFT JOIN survival rule; in WHERE it still works for INNER joins but the shape breaks the moment someone flips the join type to catch 'the other booking'. The output is pair-grain — one row per suspicious pair — and the reviewer's follow-up 'is pair-grain the alert grain?' is exactly the question to answer unprompted.",
      tag: "joins",
    },
    {
      id: "easyjet-t21",
      q: "The basic band's 31.01 and the all-lines 63.74 are both 'average line price'. Reconcile them for the panel.",
      a: "Population, then weighting. 31.01 folds the sub-55 band only — an implicit WHERE the metric's name carries — while 63.74 folds all 251 lines including the 115.85 flex band, so it lands between the band averages. The weighted reconciliation: 268 basic seats at 31.01 plus 230 flex at 115.85 reconstructs the book's fee value, and the all-lines average is that value over 498... no — over 251 lines, at line grain, which is why multi-unit lines make line-averages and unit-yields differ. The discipline being graded: every average is a SUM over a stated population divided by a stated count, and 'average line price' without the filter is an incomplete sentence. Ship the population with the number — '31.01 across the 268-seat basic band' — and the follow-up 'how do you know?' is already answered.",
      tag: "ratio",
    },
    {
      id: "easyjet-t22",
      q: "SUBSTR versus STRFTIME on the pace spine — when does each win, and what breaks if you pick wrong?",
      a: "On TEXT ISO timestamps they overlap: SUBSTR(created_at, 1, 7) and STRFTIME('%Y-%m', created_at) both yield '2024-07'. STRFTIME wins the moment the source format wobbles — it parses multiple layouts and returns NULL on garbage instead of silently slicing mid-field, which makes it the auditable choice for a spine 14 months long. SUBSTR wins when the column is guaranteed ISO and the fold is hot — it avoids the parse. The breakages are different: a wrong SUBSTR offset yields plausible-looking wrong buckets ('07' alone merges Julys across years), while a wrong STRFTIME format yields NULLs that group together and announce themselves as one giant bucket. The spine is the foundation of every walk and every share; one wrong character is a quarter of trend fiction.",
      tag: "strings",
    },
    {
      id: "easyjet-t23",
      q: "IN versus EXISTS for 'passengers on the premium-fee list' — the panel wants the trade said out loud, then the NULL story.",
      a: "IN (SELECT ...) membership-tests against a materialized list — readable, set-shaped, and it dedupes naturally because membership is boolean; the list can come from any fold, including a GROUP BY. EXISTS (SELECT 1 ... WHERE correlation) is a per-row probe that short-circuits at the first match and keeps NULLs honest — the NULL row in the subquery kills IN's three-valued logic but leaves EXISTS untouched. On the clean core db both return the same premium list; the difference is staging behavior, where one NULL in the list empties the IN report while EXISTS keeps matching. The tie-handling nuance: IN returns each outer row once by definition, while a correlated scalar comparison (= (SELECT ...)) can match multiple rows and needs care. The rule of thumb to ship: IN for membership over trusted folds, EXISTS for existence against live predicates, never NOT IN over an unguarded column.",
      tag: "subqueries",
    },
    {
      id: "easyjet-t24",
      q: "Last question of the screen: your attach slide ships with four numbers and no words. What words make it defensible?",
      a: "Population, grain, window, definition. Population: '498 units across 251 fee lines on 103 bookings, 2024-01 through 2025-02' — the denominator sentence first, always. Grain: 'units' beside 'lines' beside 'bookings' — 121 units is not 62 lines is not the 44 bookings that bought the family — each column names its own grain. Window: the fold's dates, because next quarter's book re-divides every share. Definition: the band boundary is unit_price < 55 at LINE grain, boundary fees at exactly 55.00 ride flex, and NULL prices — none today — would need an explicit arm. The interviewer's 'how do you know?' is not hostility; it is the check that the number and its definition are one artifact. A slide that carries those four words survives the review; a bare 53.8% does not.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "easyjet-mcq-1",
      prompt: "A booking row's status reads 'shipped'. In this kit's easyJet stage map, what happened?",
      choices: ["The flight flew — 30 of 103 bookings with shipped_at stamped; the trip is not yet closed", "The booking was flown and closed — the completed state", "The booking never boarded and was cancelled", "The booking is still inside the booking window"],
      answer: 0,
      why: "The stage map is fixed: shipped = flown, trip open (30 of 103, 29.1%); delivered = flown and closed (52, 50.5%). Together they are the 82 flown bookings behind the 79.6% flown share.",
      notes: [
        { choice: 1, why: "Flown-and-closed is 'delivered' — 52 bookings. Calling open flown bookings closed inflates the completed base before the trip settles." },
        { choice: 3, why: "In-window is 'pending' — 14 bookings with no shipped_at yet. Pending is not flown and not cancelled; it is 'not yet', and it stays in the booked denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-2",
      prompt: "The fare-band fold splits the 498-unit book: 268 seats ride sub-55 basic fees (31.01 average line price), 230 ride 55-plus flex fees (115.85). What is the flex share?",
      choices: ["46.2% — 230 of 498 units", "53.8% — the bigger arm must be flex", "91.6% — 230 of 251 lines", "115.85 / 31.01 = 3.7x, so 37.3%"],
      answer: 0,
      why: "Flex share is 230/498 = 46.2% — units over units, stated denominator. The basic arm holds 268/498 = 53.8%, so basic leads the seat count even though flex leads the average line price by 3.7x.",
      notes: [
        { choice: 1, why: "53.8% is the BASIC share — 268/498. Grabbing the bigger arm for flex flips the fare-mix slide upside down." },
        { choice: 2, why: "230/251 divides units by LINES — two different grains. Lines per booking is 2.44; a unit and a line are not the same thing on this db." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-3",
      prompt: "Which single expression over order_items returns 498?",
      choices: ["SUM(quantity)", "COUNT(*)", "COUNT(DISTINCT order_id)", "COUNT(quantity)"],
      answer: 0,
      why: "SUM(quantity) counts units — 498 seats, bags and extras across the 251 lines. Lines, units and bookings are the three grains every attach claim must name.",
      notes: [
        { choice: 1, why: "COUNT(*) counts line rows — 251. Calling lines 'units' overstates the book by lines that carry 2 or 3 units (max quantity 3)." },
        { choice: 2, why: "COUNT(DISTINCT order_id) counts bookings touched — 103. That is the denominator of lines-per-booking (2.44), not the unit count." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN unit_price < 55 THEN quantity ELSE 0 END) / SUM(quantity) — why does the 100.0 sit BEFORE the division?",
      choices: ["It promotes the division to real arithmetic before integer truncation", "It rounds the result to a percentage", "It filters the fold to basic-band units only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 0,
      why: "Without it, the flag-sum over the denominator is integer division — the band share truncates toward 0 and thin bands read flat. The 100.0 forces real division first; on this db it is the difference between 46.2 and a displayed 46 — or worse, 0 on a thin arm.",
      notes: [
        { choice: 1, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.462 to 0 first, then scales — the fare-mix board reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-5",
      prompt: "Next quarter two families tie at 54 units; the 27-unit family follows. Under RANK, what rank does the 27-unit family carry?",
      choices: ["7 — ties share rung 5 and consume 5 and 6, so the next distinct lands on 7", "6 — ties share a rung and the next family moves up one", "5 — no gaps are left behind", "8 — a tie always adds an extra rung"],
      answer: 0,
      why: "RANK shares rungs and then skips: 121, 97, 85, 61 get 1-4, the two 54s share rank 5, position 6 is consumed by the tie, and the 27-unit family lands on 7. DENSE_RANK would hand it 6.",
      notes: [
        { choice: 1, why: "6 is the DENSE_RANK answer — shared rungs without gaps. The attach board's published policy is RANK semantics, gaps included." },
        { choice: 3, why: "A tie does not add rungs — it consumes positions. The tie block occupies 5 and 6; nothing is appended." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-6",
      prompt: "A staging feed can carry NULL unit_price. In the band fold CASE WHEN unit_price < 55 THEN 'basic' ELSE 'flex' END, where do NULL-price lines land?",
      choices: ["Into 'flex' — ELSE catches everything the WHENs miss, including NULLs; guard with an IS NULL arm", "Into 'basic' — NULL compares as less than 55 in SQLite", "Nowhere — the row is dropped from the fold", "Into both bands — the CASE fires twice"],
      answer: 0,
      why: "NULL < 55 is UNKNOWN, so the WHEN fails and ELSE swallows the row — NULL prices silently inflate the flex band and the fare-mix slide lies. The fix is an explicit WHEN unit_price IS NULL arm (or a pre-filter with a count) so the unknowns are named.",
      notes: [
        { choice: 1, why: "Three-valued logic: NULL compared to anything is UNKNOWN, never true. The basic arm cannot catch the row — that is exactly why ELSE is dangerous here." },
        { choice: 2, why: "CASE never drops rows — every row exits through some arm. Dropped rows would be a WHERE problem, and the silent arm-swap is the actual bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-7",
      prompt: "In the attach board, unit_share is written ROUND(100.0 * SUM(oi.quantity) / SUM(SUM(oi.quantity)) OVER (), 1). Why the doubled SUM?",
      choices: ["The inner SUM folds lines to families under GROUP BY; the outer SUM over () totals across all groups — 498", "It is a SQLite bug workaround; SUM(oi.quantity) alone gives the same result", "The outer SUM counts families; the inner counts units", "OVER () makes the outer SUM restart per family"],
      answer: 0,
      why: "Under GROUP BY family, SUM(oi.quantity) is the per-family unit count; SUM(SUM(oi.quantity)) OVER () takes that grouped aggregate and totals it across the whole partition — the 498-unit book. One expression, two grains, and the share is the ratio of the two.",
      notes: [
        { choice: 1, why: "SUM(oi.quantity) alone in the denominator makes every share 100.0 — the ratio of each family to itself. The doubled SUM is the whole point." },
        { choice: 3, why: "OVER () with an empty specification is the WHOLE partition — one grand total, not per-family restarts. PARTITION BY is what would restart it." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-8",
      prompt: "A staged triage list uses passenger_id NOT IN (SELECT customer_id FROM bookings WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "The two tables genuinely share no ids — the zero is correct", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 0,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, never NOT IN over an unguarded column.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every booking carries a customer_id. But staging feeds are exactly where NULLs sneak in, and empty triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-9",
      prompt: "A board stack puts basic-band rows above flex-band rows via UNION, and a reviewer says one market's row vanished. Diagnosis?",
      choices: ["The branches emitted byte-identical rows — UNION dedups whole rows silently, and identical (market, counts) rows collapsed", "UNION ALL is only a performance choice — the results would be identical", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 0,
      why: "UNION dedups whole rows across branches. A market whose basic and flex folds coincide — same units, no band label — produces two identical rows and loses one with no error anywhere. The discipline: UNION ALL plus a band label column, and a comment stating why duplicates are impossible.",
      notes: [
        { choice: 1, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate coincidence exists, UNION is the bug, and EU's 99/100 near-tie is exactly where it bites." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-10",
      prompt: "The settlement census reads 21 statements 'exact'. The void statement #11 (925.00) carries one payment leg of exactly 925.00. Where does it land, and why?",
      choices: ["Into 'exact' — legs sum to billed cents, so the CASE fold catches it; status is a claim, legs are the ledger", "Out of the census — void statements are excluded by definition", "Into 'partial' — void means the leg cannot equal billed", "Nowhere — the fold errors on the status mismatch"],
      answer: 0,
      why: "The coverage fold classifies on money, not status: #11's single leg (925.00) equals its billed cents, so it folds into exact — that is why exact reads 21 of 28 while paid-status #28 (1,756.00, zero legs) folds out. The census foots to 28 either way; the composition is the audit finding.",
      notes: [
        { choice: 1, why: "Excluding voids up front hides the anomaly — a debited void is exactly the row the partners desk needs surfaced. The fold catches it BECAUSE it is status-blind." },
        { choice: 2, why: "Partial means legs sum to less than billed (that is #25: 4,000.00 of 6,148.00). #11's leg matches to the cent — nothing partial about it." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-11",
      prompt: "The booking-to-departure lead averages 2.98 days across 82 flown bookings. Which expression computes it?",
      choices: ["AVG(julianday(shipped_at) - julianday(created_at)) over bookings WHERE shipped_at IS NOT NULL", "AVG(shipped_at - created_at) over all bookings", "SUM(shipped_at - created_at) / 103", "julianday(AVG(shipped_at)) - julianday(AVG(created_at))"],
      answer: 0,
      why: "TEXT timestamps have no arithmetic until julianday() converts each side to a day number — the difference is the lead in days, and the flown-only WHERE matches the metric's stated population (2.98 on the 82 that flew). TEXT subtraction or averaging the dates first are both type errors dressed as queries.",
      notes: [
        { choice: 1, why: "shipped_at - created_at on TEXT does string-to-number coercion at best — '2024-01-15' coerces to 2024. The 2.98 baseline dies quietly." },
        { choice: 3, why: "The average of a date is not a date — julianday(AVG(...)) averages day numbers, then the outer julianday re-reads them as days-since-4713BC. The operands must convert before the subtraction, not after." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-12",
      prompt: "The attach headline reads '2.44 fee lines per booking'. Which pair of aggregates produces it?",
      choices: ["COUNT(*) over order_items divided by COUNT(DISTINCT order_id) over order_items — 251 / 103", "SUM(quantity) divided by COUNT(*) — 498 / 251", "COUNT(*) divided by 103 bookings from the orders table only", "AVG(quantity) over order_items"],
      answer: 0,
      why: "Lines-per-booking is a ratio of two different counts on the same rows: 251 fee/fare lines over 103 bookings that carry lines. Both sides come from order_items — counting bookings from orders alone would include any booking with no lines and shift the denominator.",
      notes: [
        { choice: 1, why: "498 / 251 is units-per-line (~1.98) — a real ratio, but a different one. The attach headline is lines per booking, and the units read is 4.83 per booking." },
        { choice: 3, why: "AVG(quantity) is units per LINE (1.98) — it never sees the bookings that carry zero extra lines, which is exactly the population attach rate claims to describe." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-13",
      prompt: "EU shows 45 bookings from 8 passengers; the US shows 19 from 2. Which SELECT pair reports both grains in one pass?",
      choices: ["COUNT(*) AS bookings, COUNT(DISTINCT o.customer_id) AS passengers with GROUP BY c.region", "COUNT(*) AS bookings, COUNT(o.customer_id) AS passengers", "COUNT(DISTINCT o.id) AS bookings, COUNT(*) AS passengers", "SUM(customer_id) AS bookings, MAX(customer_id) AS passengers"],
      answer: 0,
      why: "COUNT(*) counts booking rows (45, 19) and COUNT(DISTINCT customer_id) counts distinct passengers inside the same fold (8, 2) — the two-grain census every market read here ships. The ratio is the intensity read: 5.6 bookings per EU passenger versus 9.5 in the US.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL rows — every booking has one, so it reads 45 and 19 again. Without DISTINCT the passenger column is a copy of the booking column." },
        { choice: 2, why: "COUNT(*) counts line-level join rows if lines got joined in — 251 lines would masquerade as 'passengers'. The grain of the input decides the meaning of the star." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-14",
      prompt: "Ops wants each booking's ancillary manifest as one cell — 'seat-allocation, cabin-bag, hold-bag' — beside the booking id. Which aggregate builds it?",
      choices: ["GROUP_CONCAT(p.category, ', ') with the join to products and GROUP BY o.id", "CONCAT(p.category) with GROUP BY o.id", "STRING_AGG is the only option — SQLite has no cell-folding aggregate", "SUM(p.category) over the joined lines"],
      answer: 0,
      why: "GROUP_CONCAT folds the joined family labels into one comma-separated cell per booking — the per-PNR manifest the ops team ships daily. The join to products comes first; the fold happens at booking grain, so a multi-unit line repeats its family and the manifest reads like the booking actually looked.",
      notes: [
        { choice: 1, why: "CONCAT is not an aggregate — it joins its arguments per row and errors or misfires under GROUP BY. The folding aggregate in SQLite is GROUP_CONCAT." },
        { choice: 3, why: "SUM over TEXT family names coerces them to 0 and returns a number — a manifest of zeros. Folding strings needs a string aggregate." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-15",
      prompt: "The pricing pack only quotes markets with at least 10 bookings. Bookings per market: EU 45, APAC 37, US 19, LATAM 2. Which clause enforces the floor, and what ships?",
      choices: ["HAVING COUNT(*) >= 10 after GROUP BY c.region — EU, APAC and US survive, LATAM drops", "WHERE COUNT(*) >= 10 before GROUP BY — all four markets survive", "HAVING bookings >= 10 placed in the subquery that folds lines — errors on the fold", "LIMIT 3 after ORDER BY bookings DESC — the same three markets, honestly"],
      answer: 0,
      why: "The floor judges a folded count, so it lives in HAVING after the GROUP BY: LATAM's 2 bookings fail the wall and the pack quotes three markets. HAVING bookings >= 10 (the alias) works in SQLite but the concept is identical — the judgment happens post-fold.",
      notes: [
        { choice: 1, why: "WHERE runs before groups exist — COUNT(*) is not a row-level fact. The engine rejects it, and the concept fails even where a dialect tolerates it." },
        { choice: 3, why: "LIMIT 3 happens to keep the same rows today, but it encodes 'top three' not 'at least ten' — the day a fourth market clears the floor, the pack silently ignores it. Thresholds are definitions, not row counts." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-16",
      prompt: "The pace read wants a cumulative booked-value column beside each of the 14 month buckets — every row kept. Which window does that?",
      choices: ["SUM(SUM(o.total)) OVER (ORDER BY month_key) inside the month fold", "SUM(o.total) OVER (PARTITION BY month_key)", "SUM(o.total) grouped by month with a self-join to the prior months", "ROW_NUMBER() OVER (ORDER BY month_key) multiplied by the monthly total"],
      answer: 0,
      why: "The doubled SUM is the cumulative pattern: the inner SUM folds bookings to months, the outer SUM OVER (ORDER BY month_key) accumulates the fold across the spine, and every row survives. PARTITION BY month would give each month 100% of itself.",
      notes: [
        { choice: 1, why: "PARTITION BY month_key restarts the sum inside every bucket — each row's 'cumulative' is just that month's own total. The running column needs one partition spanning the spine." },
        { choice: 2, why: "The self-join version fans out and costs quadratic time on the spine; windows exist precisely to replace it. It also drops the frame discipline that keeps same-month rows from double-counting." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-17",
      prompt: "Two shapes find passengers with no cancelled bookings: NOT EXISTS (SELECT 1 FROM orders c WHERE c.customer_id = p.id AND c.status = 'cancelled') and a LEFT JOIN to cancelled orders with WHERE ... IS NULL. What is the real difference?",
      choices: ["None on a clean db — both return the never-cancelled population; NOT EXISTS reads intent and stops at the first match", "LEFT JOIN is faster by definition, so EXISTS is legacy", "NOT EXISTS cannot use the status filter; the filter must live in WHERE outside", "They differ only when the outer table is empty"],
      answer: 0,
      why: "On this db both return the same passenger set — the equality is the point: the anti-join has two spellings and the panel wants you to know they coincide when the data is clean. NOT EXISTS puts the whole predicate in the subquery (status included), reads declaratively, and short-circuits per row.",
      notes: [
        { choice: 2, why: "That is the WHERE-placement trap in EXISTS clothing: the status filter belongs INSIDE the correlated subquery. Pulling it outside the EXISTS turns the query into 'has any booking' — a silent population swap." },
        { choice: 1, why: "Plan-dependent, not definitional. The graded skill is choosing the shape that keeps the NULL semantics honest — both do here; NOT IN over an unguarded column does not." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-18",
      prompt: "Passenger contact data arrives with missing seat preferences; the ops board wants a printed 'none' instead of blanks. Where does COALESCE(seat_pref, 'none') belong?",
      choices: ["In the final SELECT — a display-edge decision; the pipeline above keeps NULL", "In the GROUP BY so blanks fold together", "In an UPDATE that rewrites the table once at load", "In the WHERE clause to exclude blank preferences"],
      answer: 0,
      why: "COALESCE at the display edge prints 'none' while every upstream step keeps NULL — the honest 'not collected yet'. Rewriting the table destroys the distinction between 'no preference given' and 'preference unknown', which the personalization engine treats differently.",
      notes: [
        { choice: 2, why: "A load-time UPDATE is irreversible data surgery — after it, 'none' the string and NULL the absence are indistinguishable, and the funnel's denominator loses a population." },
        { choice: 3, why: "Filtering on the coalesced value confuses 'no preference' with 'exclude these passengers' — the board would silently shrink. IS NULL is the filter that means missing." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-19",
      prompt: "The booking-pace spine buckets created_at (TEXT) into months. Which expression yields '2024-07' and sorts as a calendar?",
      choices: ["SUBSTR(created_at, 1, 7)", "SUBSTR(created_at, 6, 2)", "SUBSTR(created_at, 1, 4)", "LOWER(created_at)"],
      answer: 0,
      why: "Characters 1-7 of an ISO timestamp are the year and zero-padded month — '2024-07' — which string-sorts in calendar order across the 14-bucket spine. The bare month merges July 2024 with July 2025; the bare year collapses the whole book into 2024 and 2025.",
      notes: [
        { choice: 1, why: "Position 6 for 2 characters is '07' — twelve buckets that merge across years. The pace trend becomes seasonal fiction." },
        { choice: 2, why: "Four characters is the year '2024' — two rows. The July trough (1,193.86) and the November dip (1,648.80) vanish into it." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-20",
      prompt: "Units-per-booking is SUM(quantity) / COUNT(DISTINCT order_id). A staged slice has bookings but zero lines. What guards the division?",
      choices: ["SUM(quantity) / NULLIF(COUNT(DISTINCT order_id), 0) — the empty fold yields NULL, the honest gap", "IFNULL(SUM(quantity) / COUNT(DISTINCT order_id), 0) so the board shows 0.00", "CAST the denominator to REAL — real division cannot fail", "Wrap the whole query in a CASE WHEN COUNT(*) > 0"],
      answer: 0,
      why: "NULLIF turns a zero denominator into NULL, and x / NULL is NULL — the board shows a gap that reads as 'no bookings to average', not a fabricated 0.00 attach rate. IFNULL-ing to zero invents an attach rate for a market with no bookings, which is exactly the number a pricing meeting will act on.",
      notes: [
        { choice: 1, why: "0.00 reads as 'measured zero attach' — a claim about the world. The empty slice cannot measure anything; NULL is the honest print and the dashboard renders it as a gap." },
        { choice: 2, why: "CAST fixes the type of a division that exists; it does nothing when the denominator is zero — SQLite returns NULL for x/0 anyway, masking the empty-slice case instead of labeling it." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-21",
      prompt: "Marketing wants passengers who attached BOTH a cabin-bag family line AND a hold-bag family line. Which query shape returns each such passenger once?",
      choices: ["INTERSECT of two passenger sets: one per family attachment, each folded with SELECT DISTINCT customer_id", "INNER JOIN of order_items to itself on customer_id WHERE family_a <> family_b", "WHERE family = 'cabin-bag' AND family = 'hold-bag' on the joined lines", "UNION of the two family sets with DISTINCT"],
      answer: 0,
      why: "One row cannot carry two values of one column, so family = 'a' AND family = 'b' is never true — the AND shape returns nothing. INTERSECT of the two folded sets is the set-algebra answer: each side is 'passengers who attached X', and the intersection is 'both'.",
      notes: [
        { choice: 1, why: "The self-join version works but fans out — one row per (cabin, hold) pair — so a passenger with three of each appears nine times. It needs a DISTINCT the INTERSECT shape gets for free." },
        { choice: 3, why: "UNION merges the sets — passengers with EITHER family. The question asked for BOTH; UNION answers the upsell-eligibility question, INTERSECT answers the bundle question." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-22",
      prompt: "The zero-attach anti-join returns 0 passengers. What turns a confident zero into a verified one?",
      choices: ["Run the unconditional count beside it — 16 passengers, 251 lines, 498 units — and show the join keys are populated", "Add DISTINCT so the zero cannot be a fan-out artifact", "Cast the join keys to TEXT before comparing", "Re-run it with INNER JOIN — if that also returns 0, the zero is confirmed"],
      answer: 0,
      why: "A zero is proven by showing the input population is non-empty and the join key carries values: 16 passengers against 251 fee lines with customer_id populated means the zero is a real finding, not a broken join. On this db every passenger has moved — the zero is the true answer and the panel wants the proof ritual.",
      notes: [
        { choice: 2, why: "Casting changes types, not emptiness — a broken join on TEXT keys returns the same confident zero. The failure mode is cardinality, not collation." },
        { choice: 3, why: "INNER JOIN returning 0 would mean the tables share NO keys at all — stronger evidence of breakage, not confirmation. The null-inner-query test is the reverse: run the unconditional count first." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-23",
      prompt: "A fee line prices at exactly 55.00. In the band fold CASE WHEN unit_price < 55 THEN 'basic' WHEN unit_price >= 55 THEN 'flex' END, where does it land — and what would move it?",
      choices: ["'flex' — the < arm fails at equality, the >= arm catches it; swapping >= to > would strand it in neither arm", "'basic' — < 55 is true at 55 in SQLite's REAL comparison", "'flex' — CASE evaluates both arms and the ELSE decides", "Nowhere — the fold drops boundary rows"],
      answer: 0,
      why: "55.0 < 55.0 is false, so the first arm misses and >= catches the boundary into flex. The silent re-banding bug is the operator: >= to > on the second arm leaves exact-55 lines with no arm (NULL) and the fare-mix slide loses its boundary population without an error.",
      notes: [
        { choice: 1, why: "Three-valued logic works normally on REALs — strict < excludes equality. Trusting 'SQLite rounds' is how boundary fees get banded by folklore." },
        { choice: 2, why: "CASE is first-match-wins and stops; there is no ELSE here. A row with no true arm yields NULL, which is the bug being described, not the behavior." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-24",
      prompt: "The pace walk's first row — 2024-01 at 3,731.97 — carries NULL in the delta column. Why is that correct?",
      choices: ["LAG has no row before the first — NULL is the honest 'no prior', the baseline of the walk", "The delta is 0 because January is the start of the year", "LAG returns the row itself on the first row, so the delta should read 0.00", "The NULL means 2024-01 had no bookings"],
      answer: 0,
      why: "LAG reaches one row back in the window's order; before the first row there is nothing to reach, so the engine returns NULL — the baseline every later delta is measured against. Coalescing it to 0 reads as 'January crashed 3,731.97' and the walk opens with a phantom catastrophe.",
      notes: [
        { choice: 2, why: "LAG never wraps — there is no default prior. Reading the first row as flat erases the only month whose movement is genuinely unknowable from this table." },
        { choice: 3, why: "January holds 3,731.97 of bookings — the NULL is about the window, not the data. Confusing the two is how 'no prior month' becomes 'no demand' in a slide." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-25",
      prompt: "Fare-band share must restart per MARKET, not span the whole book. Which window earns '58.9% basic in the US'?",
      choices: ["SUM(SUM(CASE ...)) OVER (PARTITION BY c.region) as the denominator under GROUP BY c.region", "SUM(SUM(CASE ...)) OVER () as the denominator under GROUP BY c.region", "RANK() OVER (PARTITION BY c.region ORDER BY units DESC) as the denominator", "AVG(units) OVER (PARTITION BY c.region) as the denominator"],
      answer: 0,
      why: "PARTITION BY c.region makes the window total restart at each market — the US denominator is its own 112 units, so 66/112 prints 58.9. OVER () without the partition is the whole 498-unit book: the same query would print 13.3 and call it a market share.",
      notes: [
        { choice: 1, why: "The unpartitioned window is the global denominator — correct for the network-level fold (268/498 = 53.8), wrong for the market board. Both numbers are real; only one answers this ask." },
        { choice: 3, why: "AVG of units is a mean, not a total — dividing by it produces a meaningless ratio that still sorts plausibly. Denominators in share queries are sums, stated at the partition's grain." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-26",
      prompt: "The band stack now labels each branch — 'basic' and 'flex' columns included — before UNION ALL. What did the label buy over plain UNION?",
      choices: ["Rows can no longer collide across branches — the band column makes every row unique, so nothing is silently deduped", "UNION ALL is faster, and the label is documentation only", "The label enables ORDER BY across the stack; UNION could not order its output", "UNION ALL requires a label column to compile"],
      answer: 0,
      why: "With a band label, two branches can never emit byte-identical rows — EU's near-tie (99 basic / 100 flex) can no longer collapse one branch into the other the way unlabeled UNION would. UNION ALL's speed is real but secondary; the guarantee is that the stack foots to both arms.",
      notes: [
        { choice: 2, why: "Both UNION and UNION ALL accept ORDER BY on the final SELECT — ordering was never the differentiator. The label is about identity of rows, not sortability." },
        { choice: 3, why: "Nothing about UNION ALL requires extra columns. The label column is the analytical control: it makes dedup impossible and provenance visible on the printed board." },
      ],
      difficulty: "medium",
    },
    {
      id: "easyjet-mcq-27",
      prompt: "The loyalty desk wants pairs of passengers who share a market (region) — each unordered pair once. Which join produces that?",
      choices: ["customers c1 JOIN customers c2 ON c1.region = c2.region AND c1.id < c2.id", "customers c1 JOIN customers c2 ON c1.region = c2.region", "customers c1 JOIN customers c2 ON c1.id = c2.id AND c1.region = c2.region", "customers c1 CROSS JOIN customers c2 WHERE c1.id <> c2.id"],
      answer: 0,
      why: "The self-join pairs rows of one table; c1.id < c2.id is the ordering trick that yields each pair once and excludes self-pairs — (A,B) survives, (B,A) and (A,A) do not. EU's 8 passengers produce 28 such pairs; the symmetric join would print 56.",
      notes: [
        { choice: 1, why: "Without the id ordering, every pair arrives twice — (A,B) and (B,A) — and every passenger pairs with themselves. The desk reads 112 EU pairs instead of 28." },
        { choice: 2, why: "c1.id = c2.id is the self-pair — one row per passenger paired with itself, no market pairs at all. The equality that identifies 'same region' must not become the equality that identifies 'same person'." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-28",
      prompt: "The basic band reads '31.01 average line price'. A colleague computes AVG(unit_price) over ALL 251 lines and gets 63.74. Both queries are correct — what differs?",
      choices: ["The population: 31.01 folds the sub-55 band only (268 seats); 63.74 folds every line including the 115.85 flex band — the average must name its filter", "The colleague forgot ROUND; 63.74 is a rounding artifact", "31.01 is a median, not an average — AVG cannot produce it", "The band average divides by units, not lines"],
      answer: 0,
      why: "Averages are population claims: the band average carries an implicit WHERE unit_price < 55, the all-lines average does not — mixing the 31.01 basic lines with the 115.85 flex lines lands between them at 63.74. The weighted check (268 × 31.01 + 230 × 115.85 ≈ the book's fee value) reconciles the two.",
      notes: [
        { choice: 2, why: "It is an average — the band fold's average line price at unit grain. Calling uncomfortable averages 'medians' is how population errors survive review." },
        { choice: 3, why: "Dividing fee value by UNITS would produce a per-seat yield (lower than per-line because multi-unit lines amortize); 31.01 is the per-line read and says so in the metric's name." },
      ],
      difficulty: "hard",
    },
    {
      id: "easyjet-mcq-29",
      prompt: "A staging feed mixed-cases emails ('Alice.Chen@...' alongside 'alice.chen@...'). The dedupe join on email returns two rows for one passenger. First move?",
      choices: ["Fold both sides through UPPER(TRIM(email)) before the join — normalize the key, not the row", "JOIN on name instead — names are cleaner than emails", "Add DISTINCT to the SELECT so duplicates collapse", "WHERE email LIKE '%@%' to drop malformed rows first"],
      answer: 0,
      why: "Join keys must match byte-for-byte, so the fix is normalizing the key on both sides — UPPER(TRIM(...)) — before the equality. DISTINCT after a fan-out join hides the symptom and keeps the wrong row count; the manifest would still show a passenger twice downstream.",
      notes: [
        { choice: 1, why: "Names collide harder than emails — two passengers can share a name, and the kit's roster has near-duplicates. The email is the identity key; normalize it." },
        { choice: 3, why: "That filters validity, not case — 'Alice.Chen@' and 'alice.chen@' both pass the LIKE and still refuse to match. The two rows survive the join and the census." },
      ],
      difficulty: "easy",
    },
    {
      id: "easyjet-mcq-30",
      prompt: "The board wants each family's rank WITHIN its market, not network-wide. Which window resets the ladder at each market?",
      choices: ["RANK() OVER (PARTITION BY c.region ORDER BY units DESC) under the market-folding GROUP BY", "RANK() OVER (ORDER BY units DESC) filtered by market in WHERE", "ROW_NUMBER() OVER (ORDER BY c.region, units DESC)", "DENSE_RANK() OVER (PARTITION BY units ORDER BY c.region)"],
      answer: 0,
      why: "PARTITION BY c.region restarts the rank at 1 inside every market; ORDER BY units DESC inside the window makes rank 1 the most-attached family there. Ranking network-wide and filtering after would keep only one market's rows — the other markets' ladders are computed then thrown away.",
      notes: [
        { choice: 2, why: "ORDER BY region, units is a single global ladder that happens to be region-adjacent — ranks run 1..28 across the whole book and every market except the first starts mid-ladder. Resetting is the PARTITION's job." },
        { choice: 3, why: "The partition and the order are swapped: partitioning by units makes every distinct-unit value its own ladder (ranks all 1), ordered by region. Nonsense output, valid syntax — the audit is reading the window spec carefully." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-easyjet-1",
      tier: "easy",
      topic: "s7",
      universe: "pricing",
      title: "The fare-class band pivot",
      brief:
        "easyJet-flavored brief on the storefront db: Monday's ancillary-pricing review opens with the fare-band pivot — how the unbundled book splits between the basic band (per-item fees under 55: allocated seats, cabin bags) and the flex band (55 and over: hold bags, flexible fares), market by market, with the share printed on the slide. Probed facts: 103 bookings carrying 251 fee/fare lines and 498 units; the band fold reads 268 basic seats at 31.01 average line price against 230 flex seats at 115.85. The market cut: US 66 basic units against 46 flex (58.9% basic), APAC 96/78 (55.2%), LATAM 7/6 (53.8%), EU 99/100 (49.7% — the one flex-led market). The review reads the most basic-led market first.",
      ask: "Return each market with its basic-band units, flex-band units and basic share of units to 1 decimal, highest basic share first.",
      template:
        "SELECT c.region AS market,\n       SUM(CASE WHEN oi.unit_price < 55 THEN oi.quantity ELSE 0 END) AS basic_fee_units,\n       SUM(CASE WHEN oi.unit_price >= 55 THEN oi.{1} ELSE 0 END) AS flex_fee_units,\n       ROUND({2} * SUM(CASE WHEN oi.unit_price < 55 THEN oi.quantity ELSE 0 END) / {3}, 1) AS basic_share\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {4}\nORDER BY basic_share {5};",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the flex unit counter",
          why: "SUM(quantity) counts seats and extras — the flex band carries 230 of them. SUM(unit_price) would add fees together and call the sum a seat count, and COUNT(*) counts lines, not units — 251 versus 498, two different books.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share scaler",
          why: "100.0 before the slash forces real division: without it the flag-sum over units is integer arithmetic and 96/174 prints as 55 — or a thin band truncates to 0. The .0 is the type switch, not decoration.",
        },
        {
          answer: "SUM(oi.quantity)",
          kind: "keyword",
          label: "the whole-book denominator",
          why: "The basic share is basic units over ALL units — 498 across every band and market. COUNT(*) would divide by lines (251) and print an attach-of-lines number; the denominator must be the same grain as the numerator.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market grouping",
          why: "GROUP BY c.region folds lines to the four markets the pricing board reads. GROUP BY o.status would pivot the census onto booking states and c.id would fan it to 16 passenger rows — right query, wrong board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-basic-led-first direction",
          why: "The review opens on the most basic-led market: US 58.9, APAC 55.2, LATAM 53.8, EU 49.7. ASC would open on EU — the one flex-led market — a correct query aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["unit_price", "COUNT(*)", "o.status", "ASC", "100"],
      walkthrough:
        "One pivot, two CASE arms, one stated denominator. The join attaches every fee line to its booking's market, the two CASE arms split the 498 units at the 55 fee boundary, and GROUP BY market folds them into four rows ordered most-basic-led first: US 66 basic against 46 flex (58.9%), APAC 96/78 (55.2%), LATAM 7/6 (53.8%), EU 99/100 (49.7%) — reconciling upward to the probed fold, 268 basic seats at 31.01 against 230 flex at 115.85. EU is the story: the only market where flex units beat basic, and the reason the pack leads with this slide. The distractors each break differently: unit_price in a counter slot sums fees and calls them seats; COUNT(*) counts the 251 lines instead of the 498 units; o.status regroups the census onto booking states and erases the market board; bare 100 keeps integer arithmetic so 96/174 prints 55 not 55.2; ASC opens the review on EU, the flex-led market. The discipline being graded: one threshold, two arms, a denominator at unit grain — and a share that names its numerator before the meeting starts.",
    },
    {
      id: "cs-easyjet-2",
      tier: "hard",
      topic: "t5",
      universe: "catalog",
      title: "The ancillary attach board",
      brief:
        "easyJet-flavored brief on the storefront db: the ancillary-pricing board ranks the seven ancillary families by attached units — which families actually ride on bookings — and prints each family's share of the 498-unit book beside its fee value, because units leadership and value leadership are different stories. Probed facts: 498 units across 251 lines on 103 bookings; the units ladder reads 121, 97, 85, 61, 54, 53, 27 with fee values 3,294.29, 11,744.01, 4,818.61, 5,198.41, 1,984.93, 6,929.12, 863.91 — the units leader (121, 24.3%) is NOT the value leader (11,744.01 on 97 units). Shares to 1 decimal: 24.3, 19.5, 17.1, 12.2, 10.8, 10.6, 5.4.",
      ask: "Return each ancillary family with its attached units, fee value to 2 decimals, attach rank and unit share to 1 decimal, best rank first.",
      template:
        "SELECT p.category AS family,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS fee_value,\n       RANK() OVER (ORDER BY SUM(oi.quantity) {1}) AS attach_rank,\n       ROUND({2} * SUM(oi.quantity) / {3} OVER (), 1) AS unit_share\nFROM order_items oi\nJOIN products p ON p.id = oi.{4}\nGROUP BY p.category\nORDER BY {5};",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-attached-first rank direction",
          why: "Rank 1 must be the family with the MOST units — 121 — so the window orders units descending. ASC crowns the 27-unit family; a board that promotes the smallest attach family is a correct query aimed upside down.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share scaler",
          why: "100.0 before the slash forces real division — 121/498 prints 24.3. Bare 100 keeps integer arithmetic, 12100/498 truncates to 24, and every share on the board loses its decimal before ROUND ever runs.",
        },
        {
          answer: "SUM(SUM(oi.quantity))",
          kind: "keyword",
          label: "the whole-book partition total",
          why: "The inner SUM folds lines to family units under GROUP BY; the outer SUM over () totals them across the partition — the 498-unit book. SUM(oi.quantity) alone makes every family 100.0% of itself; COUNT(*) divides by families, not units.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the family-join key",
          why: "p.id = oi.product_id attaches each fee line to its SKU and family. Joining on order_id matches booking ids to product ids — a silent wrong-fold that re-labels units under the wrong families and the board stops footing to 498.",
        },
        {
          answer: "attach_rank",
          kind: "keyword",
          label: "the board ordering",
          why: "The board reads best rank on top: 121/24.3%, 97/19.5%, 85/17.1%. ORDER BY COUNT(*) would re-sort by line counts (a different grain — 62, 51, 44 lines) and swap adjacent families; the rank column is the published order.",
        },
      ],
      distractors: ["ASC", "100", "order_id", "COUNT(*)", "category"],
      walkthrough:
        "Two grains in one query: fold lines to families, then window over the fold. The join keys each of the 251 fee lines to its SKU's family, GROUP BY folds units and fee value per family, RANK() OVER (ORDER BY units DESC) ladders them 121, 97, 85, 61, 54, 53, 27, and the share divides each family by SUM(SUM(oi.quantity)) OVER () — the 498-unit book — printing 24.3, 19.5, 17.1, 12.2, 10.8, 10.6, 5.4. The board's punchline is the units-versus-value split: the units leader carries 3,294.29 while the family at 97 units carries 11,744.01 — attach breadth and attach depth are different levers. The distractors each break differently: ASC crowns the 27-unit family; bare 100 truncates every share to an integer before ROUND; order_id in the join slot re-folds lines under the wrong families so the ladder stops footing to the probed cells; COUNT(*) in the partition slot divides by 7 families and the shares explode; ORDER BY COUNT(*) re-sorts by line counts and swaps families whose lines and units disagree. The graded habit: state which SUM is which — family units versus the 498-unit denominator — because a share without its denominator is a rumor.",
    },
    {
      id: "cs-easyjet-3",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The fate census by market",
      brief:
        "easyJet-flavored brief on the storefront db: the load review opens with the fate census — every booking lands in exactly one of four states (delivered = flown and closed, shipped = flown with the trip open, pending = inside the booking window, cancelled = never boarded) — folded per market in ONE pass so the four arms are guaranteed to reconcile upward to the 103 bookings by construction. Probed facts: EU 24 closed / 12 open / 6 in-window / 3 cancelled, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0. EU leads closed flights (24) but the US is the only market where open trips (10) outnumber closed ones. The census reads most-closed first.",
      ask: "Return each market with its four booking-state counts folded in one pass — closed flown, open flown, in-window, cancelled — most closed first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS closed_flown,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS open_flown,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS in_window,\n       COUNT(*) FILTER (WHERE o.status = {4}) AS cancelled\nFROM orders o\nJOIN customers c ON c.id = o.{5}\nGROUP BY c.region\nORDER BY closed_flown DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the closed-flown state",
          why: "The stage map is fixed: delivered = flown and closed — 52 network-wide, 24 in EU. 'closed' is not a status value on this db; the filter would count zero and the census's first column would read as if nobody completed a trip.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the open-flown state",
          why: "shipped = flown, trip still open — 30 network-wide, and the US is the only market where it outnumbers closed (10 against 5). Swapping it with the delivered arm does not error; it mislabels the two flown states and the load read quietly inverts.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the in-window state",
          why: "Pending bookings sit inside the booking window — 14 network-wide, 6 of them EU. They have no shipped_at yet, and dropping this arm from the census makes the rows stop footing to 103 — the reconciliation that licenses the whole read.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the never-boarded state",
          why: "Cancelled is 7 bookings network-wide — 6.8% of demand that never boarded, the haircut every load forecast carries. The census must count it IN the same fold, not filter it out first, or the denominators the load read depends on are already laundered.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the booking-to-passenger join key",
          why: "o.customer_id = c.id attaches each booking to its passenger's market. o.id would equate booking ids to passenger ids — an accidental numeric overlap that re-labels markets by row number and the census stops footing to the probed states.",
        },
      ],
      distractors: ["'paid'", "'closed'", "order_id"],
      walkthrough:
        "One fold, four arms, zero scans wasted. The join keys each booking to its passenger's market, and four FILTER counts read the stage map in one pass: delivered (closed flown), shipped (open flown), pending (in-window), cancelled. The result reconciles by construction — EU 24+12+6+3=45, APAC 21+8+5+3=37, US 5+10+3+1=19, LATAM 2 — summing to the 103 bookings the book holds, which is the control: arms exhaustive over status cannot disagree with the total. The story in the cells: EU leads closed flights (24) and carries a third of the network's cancellations (3 of 7), while the US is the only market where open trips (10) outnumber closed (5) — a young book still inside its trips. The distractors each break differently: 'paid' and 'closed' are not status values on this db, so their arms read zero and the census stops footing; order_id in the join slot equates booking ids to passenger ids and re-labels markets by accident of numbering. The graded habit: one pass, exhaustive arms, a census that sums to itself before anyone reads it.",
    },
    {
      id: "cs-easyjet-4",
      tier: "medium",
      topic: "t4",
      universe: "growth",
      title: "The upsell-window clock",
      brief:
        "easyJet-flavored brief on the storefront db: the growth board prices the upsell window — how long between booking and departure the seat-allocation and bag offers still attach — from the booking-to-departure lead on flown bookings. Probed facts: the network average is 2.98 days over the 82 of 103 bookings that flew (range 2 to 4); by market the lead reads LATAM 3.50 on 2 flown bookings, US 3.07 on 15, EU 2.94 on 36, APAC 2.93 on 29. The board quotes markets with at least 2 flown bookings — a floor LATAM sits exactly on, which is the audit: the floor is real and someone is on it.",
      ask: "Return each market with its flown-booking count and average booking-to-departure lead in days (2 decimals), longest lead first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS flown_bookings,\n       ROUND(AVG({1}(o.shipped_at) - julianday(o.created_at)), 2) AS avg_lead_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS {2} NULL\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY avg_lead_days {4};",
      slots: [
        {
          answer: "julianday",
          kind: "keyword",
          label: "the TEXT-to-days converter",
          why: "shipped_at and created_at are TEXT; julianday() converts each to a day number and the difference is the lead in days. DATE() would subtract a date string from a number — SQLite coerces '2024-01-15' to 2024 and the lead becomes astronomical nonsense that still sorts.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the flown-only filter",
          why: "Only flown bookings carry shipped_at, so IS NOT NULL keeps the 82 that flew. Dropping NOT inverts the filter to IS NULL — the 21 unflown bookings, whose lead is undefined — and AVG over NULLs is NULL: the board ships empty columns, not an error.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the market floor",
          why: "The board quotes markets with at least 2 flown bookings; LATAM sits exactly on the floor with 2 — the query keeps it and the audit is visible. Raising the floor to 3 silently erases LATAM, and with it the market whose 3.50-day lead is the longest upsell window on the board.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the longest-window-first direction",
          why: "The upsell story opens on the longest window: LATAM 3.50, US 3.07, EU 2.94, APAC 2.93. ASC would open on APAC — a correct read aimed at the wrong end, since the ask is where offers have the most runway.",
        },
      ],
      distractors: ["3", "ASC", "DATE"],
      walkthrough:
        "The upsell window is a clock, and the query is how it is read. The join keys bookings to markets, the WHERE keeps only flown bookings — shipped_at stamped, 82 of 103 — because an unflown booking has no departure to lead to. julianday() converts both TEXT stamps to day numbers and AVG over the differences prices each market's window: LATAM 3.50 (its 2 flown bookings are exactly the HAVING floor — the audit rides in the cells), US 3.07 on 15, EU 2.94 on 36, APAC 2.93 on 29 — a 0.57-day spread that the board reads as 'the window barely varies; the offer timing is a network constant'. The NULL discipline holds underneath: AVG ignores the NULLs the WHERE already excluded, and the population statement — 82 flown of 103 booked — ships with the number. The distractors each break differently: a floor of 3 erases LATAM and its longest-window story; ASC opens the board on the shortest window; DATE() in the converter slot subtracts a coerced year from a Julian day number and the leads become fiction that still sorts. The graded habit: state the population (flown only), the conversion (julianday, both sides), and the floor — because a lead time without its denominator is a rumor.",
    },
    {
      id: "cs-easyjet-5",
      tier: "hard",
      topic: "s6",
      universe: "month-close",
      title: "The settlement coverage census",
      brief:
        "easyJet-flavored brief on the storefront db: the partners desk closes the week with the settlement coverage census — every statement classified by what its payment legs actually did: exact (legs sum to at least the billed cents), partial (legs started but fell short), none (no legs at all). Probed facts: 28 statements — 21 exact footing 65,612.00, 6 none footing 15,217.00, 1 partial (the 6,148.00 statement with 4,000.00 collected). The classification is money-driven, not status-driven: the void statement with a leg (925.00) folds into exact because its leg matches to the cent, and the statement marked 'paid' with zero legs folds into none — status is a claim, legs are the ledger.",
      ask: "Return the coverage census: class, statement count and billed value in dollars (2 decimals), most statements first.",
      template:
        "SELECT coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(billed_cents) / 100.0, 2) AS billed\nFROM (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         CASE\n           WHEN SUM(p.amount_cents) IS NULL THEN 'none'\n           WHEN SUM(p.amount_cents) {1} i.amount_cents THEN 'exact'\n           ELSE 'partial'\n         END AS coverage\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.{2}\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY statements {3};",
      slots: [
        {
          answer: ">=",
          kind: "keyword",
          label: "the exact-match boundary",
          why: "Exact means legs cover billed — >= keeps an over-collected statement in 'exact' where a business review would want it flagged, not dropped into partial. Strict = would read the same numbers today (no overpays exist) but the arm's definition is 'covered', and the boundary operator is the documented policy.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the statement-to-legs join key",
          why: "p.invoice_id = i.id is the books' referential spine — every leg points at the statement it settles. i.number is TEXT against an INTEGER id: the comparison matches nothing, every statement folds to 'none', and the census reports 28 uncovered statements the rails would dispute.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-statements-first direction",
          why: "The review reads the biggest bucket first: exact 21, none 6, partial 1. ASC would open on the partial — one row — and bury the 6 never-collected statements (15,217.00) that are the actual audit finding.",
        },
      ],
      distractors: ["<", "number", "COUNT", "ASC"],
      walkthrough:
        "The census is a CASE over money, fed by a pre-fold — and the pre-fold is the whole trick. Per statement, LEFT JOIN to its payment legs and SUM the cents: NULL means no legs ('none'), legs >= billed means 'exact', anything between means 'partial'. The outer fold counts and values the classes: 21 exact footing 65,612.00, 6 none footing 15,217.00, 1 partial at 6,148.00 — footing to 28 statements and 86,977.00 billed, the numbers the partner call opens with. The status column never entered the query, and that is the point: the void statement with a 925.00 leg folds INTO exact (its leg matches to the cent — money settled, status stale) and the 'paid' statement with zero legs folds into none — the two rows that make 'status is a claim, legs are the ledger' more than a slogan. The distractors each break differently: < flips the exact arm into 'legs below billed' and the census inverts; joining on i.number matches TEXT to INTEGER and everything folds to none; COUNT in the comparison slot is a syntax break; ASC buries the never-collected six under a one-row partial. The graded habit: classify on money, pre-fold per statement, and let the census disagree with status — that disagreement IS the finding.",
    },
    {
      id: "cs-easyjet-6",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The above-mean fare gate",
      brief:
        "easyJet-flavored brief on the storefront db: the pricing review's targeting pass starts from the platform mean — the average booking total is 338.19 across 103 bookings — and asks which individual bookings ride above it, since those PNRs carry the fare weight the yield team models. Probed facts: 42 of 103 bookings clear the mean (40.8%); the top of the list reads booking #74 (APAC) at 1,088.44, #43 (EU) at 945.21, #39 (US) at 845.92, #15 (APAC) at 826.03, #57 (US) at 785.79. The review reads the top 5, longest fare first.",
      ask: "Return the top 5 bookings above the platform-mean fare: booking id, market and fare, highest fare first.",
      template:
        "SELECT o.id AS booking,\n       c.region AS market,\n       o.total AS fare\nFROM orders o\nJOIN customers c ON c.id = o.{1}\nWHERE o.total > (SELECT {2}(total) FROM orders)\nORDER BY fare {3}\nLIMIT {4};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the booking-to-passenger join key",
          why: "o.customer_id = c.id is the honest key — every booking belongs to exactly one passenger and inherits that passenger's market. o.id would equate booking ids to passenger ids: an accidental numeric overlap that mislabels the top bookings' markets while the fares stay right — the worst kind of wrong, plausible-looking.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the platform-mean aggregate",
          why: "The gate is the MEAN fare — 338.19 over all 103 bookings — which is what 'above the platform curve' means here. MAX would gate at 1,088.44 (the top booking itself) and return nothing; SUM gates above the whole book's 34,833.28 — an empty report that looks like a clean run.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the longest-fare-first direction",
          why: "The yield team models from the top: #74 at 1,088.44 down. ASC would open on the 42nd-above-mean booking — the thinnest fare in the target set — and the review would spend its hour on the bottom of its own list.",
        },
        {
          answer: "5",
          kind: "number",
          noVerify: true,
          label: "the review cut",
          why: "The pack reads the top 5 — enough to anchor the yield curve without drowning the slide. Any other cut changes the table's length; the LIMIT is a display decision, printed beside the row count so nobody mistakes 5 for 'the bookings above mean'.",
        },
      ],
      distractors: ["SUM", "ASC", "id", "3"],
      walkthrough:
        "A scalar subquery is the gate, and the case is really about what the gate measures. The inner SELECT AVG(total) FROM orders computes once — 338.19, the platform mean — and the outer WHERE keeps the 42 bookings above it, 40.8% of the book: a minority of PNRs carrying a majority of the fare weight, which is the concentration story the yield team opens with. The join keys each booking to its passenger for the market cut, ORDER BY fare DESC reads from the top — #74 (APAC) 1,088.44, #43 (EU) 945.21, #39 (US) 845.92, #15 (APAC) 826.03, #57 (US) 785.79 — and LIMIT 5 is the printed review cut, a display decision separate from the gate. The scalar's empty-case behavior is the unprompted add: on a staging slice with no bookings the inner AVG returns NULL, the comparison goes UNKNOWN, and the target list empties silently — the reason the population statement ('103 bookings, mean 338.19') ships beside the number. The distractors each break differently: MAX gates above the top booking and ships nothing; SUM gates above the whole book; id in the join slot mislabels markets by accidental numeric overlap; ASC inverts the read onto the thinnest fares; a LIMIT of 3 silently narrows the review set. The graded habit: a gate is a definition — name the aggregate, its population, and its empty-case behavior before the result ships.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-booking fee-line revenue folded to family grain is the ancillary pricing pack's first chart. This problem drills the exact line-to-family fold the fare-band report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Family units beside fee value is how the attach board gets defended — 121 units at 3,294.29 against 97 units at 11,744.01 is this problem's shape at db scale." },
    { slug: "queries-quality-and-percentage", why: "Fee quality reads as a ratio with a stated denominator — average line price beside a share. Same division-discipline drill, easyJet flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in ancillary targeting — which markets carry at least N bookings, which families clear an attach bar. This problem drills the group-level gate." },
    { slug: "immediate-food-delivery-ii", why: "Share of bookings hitting the promised window versus late — the departures-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "number-of-employees-who-met-the-target", why: "Families hitting attach targets is a conditional count against a bar — the pricing pack's weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "top-travellers", why: "The passenger fare-book ladder — lifetime fee value ranked — is the whale read behind the 63.5% concentration line. This problem is that ladder at practice scale." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-booking passenger is the frequency crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "find-users-with-high-token-usage", why: "Fee-line outliers flag passengers out-attaching their fare — the upsell-signal query is a threshold fold over per-passenger fee totals, this problem's exact shape." },
    { slug: "combine-two-tables", why: "Passengers LEFT JOINed to bookings: the whitespace read. A passenger with no booking is a market gap, a booking with no passenger is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Contact and seat-preference data arrives with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. The drill the check-in funnel denominator needs." },
    { slug: "top-earners", why: "The top-fee-line earners board is the ancillary team's leaderboard — ranked with ties shared honestly. HackerRank's classic is the exact fold." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each passenger's most-attached SKU drives the personalized offer engine. Argmax per group is the shape, and the tie policy has to be named." },
    { slug: "group-sold-products-by-the-date", why: "The per-booking ancillary manifest — every family a PNR touched, folded into one cell — is a GROUP_CONCAT read the ops team ships daily." },
    { slug: "average-selling-price", why: "Average fee per unit per family (fee value over units, not lines) is the yield read under the band fold — this problem drills exactly that weighted division." },
    { slug: "calculate-parking-fees-and-duration", why: "Bag and service fees bill by duration bands with threshold arithmetic — CEIL-style fee tiers are the same algebra the 55-boundary band fold applies." },
    { slug: "trips-and-users", why: "Cancellation rate per market with an excluded-population clause — the 6.8% never-boarded haircut is this problem's exact shape: a ratio whose denominator must be defended." },
    { slug: "the-airport-with-the-most-flights", why: "The busiest-hub census is the route-network read — fold movements to endpoints, rank, break ties by name. easyJet's attach boards rank families the same way." },
    { slug: "consecutive-available-seats", why: "Seat-map inventory is a runs problem: find consecutive open seats the way this problem finds consecutive gaps. The allocated-seating carrier's literal inventory query." },
    { slug: "the-number-of-passengers-in-each-bus-i", why: "Load per departure — seats sold against capacity per vehicle — is the load-factor drill at practice scale, and the boarding census maps one-to-one onto bookings per flight." },
    { slug: "the-number-of-passengers-in-each-bus-ii", why: "The waiting/broken-down variant adds a status CASE to the load fold — exactly the fate census's delivered/shipped/pending/cancelled arms in textbook form." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Rolling-window activity census with per-key conditional counts — the in-window booking read (14 pending) rides the same five-day/30-day frame logic." },
    { slug: "calculate-orders-within-each-interval", why: "Bucketing events into defined intervals is the booking-pace fold — the 14-month spine and its July trough are this drill at db scale." },
    { slug: "user-purchase-platform", why: "Desktop-versus-mobile spend shares are the channel-mix read — same 100.0-before-division discipline as the fare-band share, different dimension." },
    { slug: "big-countries", why: "The area/population WHERE screen is the warm-up filter drill — easyJet opens screens here before the band fold, and this is that warm-up." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat attachment inside a window is the upsell-eligibility query — the self-join-plus-window shape the cabin-bag-then-hold-bag bundle read uses verbatim." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest event per key is the freshness drill — per-family last-attach date feeds the offer-rotation logic, and correlated-scalar cost is the graded follow-up." },
    { slug: "the-most-recent-three-orders", why: "Top-N-per-group without window functions is the ladder drill's harder sibling — the attach board's per-market top-3 reads exactly this shape." },
    { slug: "ar-aging-schedule", why: "Aging buckets over outstanding balances — the never-collected 15,217.00 and the partial 4,000-of-6,148 read their days-late ladder from this exact fold." },
    { slug: "gl-reconciliation", why: "Debits-equal-credits by account — the 181,080-against-181,080 trial balance is this problem's proof shape, and the close ships or slips on it." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Fold, then judge against a computed mean — the above-the-curve targeting gate (mean booking 338.19) is this problem's two-step at booking grain." },
    { slug: "same-day-sale", why: "Rows matching across two roles of one table — here, bookings and departures on the same day. The 2-day floor of the lead range is this query's edge case." },
  ],
};
