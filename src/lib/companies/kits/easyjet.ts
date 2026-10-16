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
// Pool provenance: company-pools.md carries NO easyJet section (0 tagged rows) — all 10
// topic slug sets and all 16 problems are theme-curated from the theme menu's sql rows
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
      slugs: ["product-sales-analysis-iii", "basket-depth-aov", "repeat-purchase-rate"],
    },
    {
      name: "Booking-state censuses",
      why: "The load read is a conditional census — booked, flown, in-window, cancelled, share — folded in one pass over status and timestamps. The trap is filtering the denominator: drop the 7 cancelled before the fold and the 79.6% flown share inflates to a number the network never earned. FILTER (WHERE …) and SUM(CASE …) are the exact drills.",
      slugs: ["flight-occupancy-and-waitlist-analysis", "immediate-food-delivery-i", "number-of-rich-customers"],
    },
    {
      name: "Two-grain market censuses",
      why: "Bookings and passengers are different grains of the same join — every market census here reports both: EU runs 45 bookings from 8 passengers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id), and saying which column is load and which is coverage, is the habit being graded; the ratio is the intensity read that decides where ancillary offers get pushed.",
      slugs: ["article-views-ii", "students-and-examinations", "sales-by-day-of-the-week"],
    },
    {
      name: "Attach boards & rank policy",
      why: "The attach board ranks families by units — 121, 97, 85, 61, 54, 53, 27 — a ladder with no ties today and guaranteed ties tomorrow as families converge. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer families, not syntax. easyJet's own pricing boards publish the tie policy; candidates are asked to defend it.",
      slugs: ["top-five-artists", "compute-the-rank-as-a-percentage", "sort-the-olympic-table"],
    },
    {
      name: "Booking-pace walks & LAG",
      why: "The 14-month booking spine (2024-01 to 2025-02) is the pace call's home turf: prior month beside current, delta rounded, the July trough (1,193.86 with 2 cancellations) and the November dip (1,648.80, again 2 cancelled) named and defended. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["week-over-week-churn", "consecutive-transactions-with-increasing-amounts", "monthly-transactions-i"],
    },
    {
      name: "Ratio discipline",
      why: "easyJet screens are ratio culture: attach rates, basic shares, flown percentages — each a fold over a stated denominator with real division. The 100.0 multiplier sits BEFORE the slash or integer division truncates the attach share toward zero and the board reads flat. Naming the numerator and denominator out loud is the graded move.",
      slugs: ["ads-performance", "friend-requests-i-overall-acceptance-rate", "low-quality-problems"],
    },
    {
      name: "Zero-attach anti-joins",
      why: "A passenger who books a seat but never attaches a bag, a family with no takers — the anti-join is the ancillary team's leak detector. On this db every passenger and every SKU has moved, so the drill includes proving that a confident zero is the true answer rather than a broken join. NOT EXISTS versus LEFT JOIN … IS NULL versus NOT IN is a three-way argument the panel expects you to referee.",
      slugs: ["customer-who-visited-but-did-not-transact", "number-of-accounts-that-did-not-stream", "students-with-invalid-departments"],
    },
    {
      name: "Nested fee gates",
      why: "Screens escalate into staging: fold per-passenger fee totals, then judge them against a computed platform mean (the 338.19 average booking). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Ancillary targeting is exactly this: which passengers ride above the platform's fee curve.",
      slugs: ["second-highest-salary", "investments-in-2016", "game-play-analysis-iv"],
    },
    {
      name: "Statements & cents discipline",
      why: "Partner settlement moves as INTEGER cents across 28 statements and 27 payment legs, and a skipped /100.0 turns a clean tie-out into a phantom break a hundredfold. The coverage census — 21 exact, 1 partial (4,000 of 6,148), 6 none — is one CASE away, and the void-but-debited 925.00 statement is the standing reconciliation catch the panel watches for.",
      slugs: ["bank-account-summary-ii", "count-apples-and-oranges", "monthly-transactions-ii"],
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
  ],
};
