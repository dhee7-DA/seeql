// Getaround — Wave-11 (Task 102), mobility domain, 0 tagged pool rows — theme-curated; facts from
// scripts/company-facts.md (probed 2026-10-12, incl. the wave-8+9 canonicalized probe-derived cells)
// plus live readonly probes against db/custom.db for the case cells printed below. Instant-key
// peer-to-peer car sharing — the angle is INSTANT access (no handover) + per-car utilization +
// no-show economics, kept distinct from turo (key-handover checkout) and zipcar (round-trip pods/fobs):
// customers = host/guest accounts (region = market), orders = trips (delivered = completed 52,
// shipped = on-trip with shipped_at as the app-unlock stamp 30, pending = booked, unlock pending 14,
// cancelled = no-show-or-cancelled 7), order_items = trip line items (quantity = booked days,
// unit_price = the day rate locked per line), products = car listings (price = list day rate, stock =
// listed-available days, category = fleet family), suppliers = host fleets, invoices/payments = payout
// statements + rails (INTEGER cents — dollar read = amount_cents/100.0; orders.total and
// order_items.unit_price are REAL dollars), expenses = claims/opex, ledger_entries = GL. The unlock
// clock maps created_at -> shipped_at onto booking-to-unlock lead (82 of 103 stamped, 2.98-day
// average, 2-4 spread) and the utilization read maps order_items onto booked days per listing
// (498 days on 251 lines; top listing 47; ties 36x2, 30x3, 21x3 under RANK).
// Pool provenance: company-pools.md carries NO Getaround section — 0 tagged rows — so all 10 topic
// slug sets and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows)
// and say so in brief P4. Case briefs quote canonical facts-file figures; every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: getaround is NOT yet in registry COMPANY_META — wire
// id "getaround", domainId "mobility", name "Getaround", tagline "Instant-key car sharing:
// utilization, host earnings, no-show economics", accent "text-amber-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const getaroundKit: CompanyKit = {
  id: "getaround",
  domainId: "mobility",
  name: "Getaround",
  tagline: "Instant-key car sharing: utilization, host earnings, no-show economics",
  accent: "text-amber-400",

  brief: [
    "**Getaround** is the instant-key car-sharing marketplace — *hosts list their cars, guests unlock them with the app, no key handover ever happens* — and the whole product promise is that access is immediate. That one design choice rewrites the analytics: there is no handover appointment to no-show, so the platform's fate map leans on the app-unlock stamp and on per-car utilization instead. On this kit's proxy ledger that's 103 trips worth **34,833.28** (average 338.19, spread 25.47 to 1,088.44) across 16 host/guest accounts, 6 host fleets and 16 car listings, folded from 251 trip line items — quantity is booked days, unit_price is the day rate each line locked. The fate map is fixed: 52 {emerald:completed} (50.5%), 30 on-trip (29.1%), 14 booked-unlock-pending (13.6%), 7 {rose:no-show-or-cancelled} (6.8%) — and the drilled habit is completed ÷ ALL booked, never ÷ resolved.",
    "The data org splits into marketplace (demand), {amber:host supply} and a trust & payments pod that owns the payout books, and all three read the same trip spine at different grains. The unlock clock is the heartbeat: a trip books at created_at and shipped_at stamps the day the guest actually opens the car with the app — **82 of 103 trips** carry the stamp, averaging **2.98 days** of booking-to-unlock lead with a 2–4 day spread, while the 14 unlock-pending rows have none yet (a population definition, not a cleanup job). Utilization is the supply-side story: **498 booked days** ride on those 251 lines, the hardest-worked listing turns **47 booked days**, and the ladder underneath it ties — two listings at 36, three at 30, three at 21 — so rank semantics are a daily argument. Trust is the third story: the top host fleet carries 32% of earnings value (11,130.25), and the 4.5-plus-rated bench is exactly two fleets deep.",
    "Interview screens are census-then-denominator with a utilization accent. A typical loop opens with a **two-grain market census** — EU runs 45 trips from just 8 accounts (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do unlock-pending trips sit in your no-show base?'*), then into the utilization ladder where the ties at 36 and 30 turn RANK, DENSE_RANK and ROW_NUMBER into a business decision about which cars get repositioned. Late rounds walk the {sky:14-month trip spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL, or open the payout books where INTEGER cents and a paid-status statement with zero settlement legs (#28, 1,756.00) are waiting. Candidates who state the stamp filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Getaround section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: unlock funnels, two-grain market censuses, tie-heavy utilization ladders, no-show CASE bands and the cents-safe payout spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:instant-utilization ladder} fleet ops re-cuts weekly, the other rebuilds the {rose:no-show bar census} trust & safety reads monthly. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:05 —** The day starts with the unlock-funnel refresh. A marketplace analyst opens the trip dashboard before standup: did overnight bookings land, does any trip show an unlock stamp while status still reads pending, does the one-pass fate census reconcile — 52 completed + 30 on-trip + 14 unlock-pending + 7 no-show = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the **2.98-day** booking-to-unlock lead drifts — the US runs 3.07 against APAC's 2.93 — the unlock-support queue gets pulled before the supply team's weekly read ships.",
    "**11:20 —** Midday is the utilization read. Fleet ops wants the per-listing ladder re-cut — the hardest-worked car at **47 booked days**, the three-way tie at 30 handled honestly with a named rank policy — beside the fleet-family earnings ledger, top family at **11,744.01 over 97 booked days** across 3 listings; a regional lead wants trips per account beside account counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about fates — and the analyst writes the query twice, *once to answer, once with the definition spelled out so the number survives the ops-review argument*.",
    "**16:10 —** The afternoon tilts toward money. The payout anti-join refreshes first — **6 never-settled statements worth 15,217** — before a single host gets a payment-chasing email; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the payout-ops queue; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). Claims and opex get their glance — Rent 14 lines at 16,800.00, Ads 14 at 4,570.00 — and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Instant-unlock rate", what: "Trips with an app-unlock stamp ÷ ALL trips booked: 82 of 103 (79.6%). The top-of-funnel number the marketplace team reads every Monday — the 14 unlock-pending rows are 'not yet', never a silent zero." },
    { name: "Booking-to-unlock lead", what: "Booking to app unlock (created_at → shipped_at) over stamped trips only: 2.98-day average, range 2..4. Instant access does not mean same-second access — the lead clock sizes the unlock-support queue, and the population definition ships with the number." },
    { name: "Completed-trip rate", what: "Delivered ÷ ALL trips booked: 52 of 103 (50.5%), with 30 more on-trip (29.1%). 'Completed' is a status-filtered conditional count, and the denominator — unlock-pending and on-trip included — is the whole interview." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1% worst, EU 6.7%, US 5.3%, LATAM 0. The trust map that prices the no-show fee and sizes the claim-review funnel." },
    { name: "Trip book", what: "Total trip value booked: 34,833.28 across 103 trips, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the day-rate story — one 1,088.44 trip outweighs the smallest 42 combined." },
    { name: "Booked days per listing", what: "498 booked days folded from 251 trip lines (2.44 lines per trip, max 3 days on a line); the hardest-worked listing turns 47, the widest tail 38 of 500 listed-available days. Utilization per car — the number repositioning and pricing both key off." },
    { name: "Host concentration", what: "Share of the book from accounts spending 3,000-plus lifetime: 63.5% (71.2% above 2,000); the top host fleet carries 32% of earnings value (11,130.25) and the 4.5-plus trust bench is two fleets deep. One fleet leaving moves a quarter." },
    { name: "Payout coverage", what: "Tripped versus paid out: 21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00 — against a 28.4-day average settlement, fastest 13, slowest 84. The anti-join payout ops refreshes every close." },
  ],

  topics: [
    {
      name: "Instant-unlock funnel counts",
      why: "Getaround's funnel is booking → app unlock → completed, and every stage is a conditional count over a status or timestamp. The trap is calling an on-trip unlock 'completed' — 30 versus 52 on this db — and the interviewer's first question is always what the denominator holds. Trips that never unlock (14 pending, 7 no-show) are the interesting rows, not noise.",
      slugs: ["percentage-of-users-attended-a-contest", "trial-to-paid-funnel", "immediate-food-delivery-i"],
    },
    {
      name: "Two-grain market censuses",
      why: "Trips and accounts are different grains of the same join, and every census here reports both: EU runs 45 trips from just 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and naming which is load and which is coverage — is the habit every census here grades. The ratio (5.6 versus 9.5) is the intensity read that decides where unlock-support hours go.",
      slugs: ["unique-orders-and-customers-per-month", "number-of-rich-customers", "students-and-examinations"],
    },
    {
      name: "Utilization ladders & tie policy",
      why: "The per-listing ladder is rank-window reporting where ties are structural — booked days run 47, 46, 38, then two listings tie at 36 and three at 30, and further down three tie at 21. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer cars, not syntax. Fleet ops publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary"],
    },
    {
      name: "Booked-day folds",
      why: "Utilization lives in order_items: quantity is booked days, so SUM(quantity) per listing turns 251 lines into the 498-day fleet read, and quantity × unit_price turns it into earnings. The trap is grain drift — COUNT(*) counts lines, COUNT(DISTINCT order_id) counts trips, and only the SUM counts days. Saying 'one row per what?' for every fold is the habit being graded.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "queries-quality-and-percentage"],
    },
    {
      name: "Unlock-lead math on timestamps",
      why: "The booking-to-unlock clock — created_at to shipped_at — is julianday arithmetic over text timestamps: 82 stamped unlocks averaging 2.98 days with a 2–4 day spread. The NULL policy ships with the number, because the 21 stamp-less trips have no clock and must not dilute the average. The regional cut (US 3.07, APAC 2.93) is where drift alerts live.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "game-play-analysis-i"],
    },
    {
      name: "No-show bands with CASE",
      why: "No-show fees, claim tiers and day-rate bands are CASE-classified with fixed edges — the trip lines split 268 units at a 31.01 average line rate against 230 at 115.85, and a premium 200-plus price arm is honestly empty (max list rate 199.99). The arms must be exhaustive and ordered: a hole in the CASE is a hole in the trust census, and the empty band is a finding, not padding.",
      slugs: ["calculate-special-bonus", "the-winner-university", "evaluate-boolean-expression"],
    },
    {
      name: "Month spine & LAG walk",
      why: "The 14-month trip spine (2024-01 to 2025-02) is the demand board's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, and the biggest single-month jump is +1,158.21 into August. LAG drives the walk and the first row is NULL by definition — the baseline, never a zero. No-shows cluster in the same walk: July and November carry 2 each of the 7.",
      slugs: ["hopper-company-queries-i", "biggest-window-between-events", "second-day-confirmation"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — completed under no-show, this quarter beside last — and EXCEPT answers 'which booked accounts never stamped an unlock'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The payout anti-join (6 never-settled statements) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "customers-who-never-order"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets completed, on-trip, unlock-pending and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "count-the-number-of-experiments", "create-a-session-bar-chart"],
    },
    {
      name: "Payout books & cents discipline",
      why: "Completed is not paid out — the settlement tables (28 statements, 27 payment legs, INTEGER cents) are where the trip world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve, wire legs (11, 32,248.00) fleet-invoiced, and 5 statements settle on both.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "account-balance"],
    },
  ],

  theory: [
    {
      id: "getaround-t1",
      q: "Your utilization report joins car listings to trip lines. When do you INNER and when do you LEFT — and what silently breaks if you filter a trip column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An earnings report joins trip lines to listings: a line with no listing is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A fleet-coverage report must be LEFT from listings: the listings with no trip lines ARE the answer, arriving with NULL line columns — and on this db that anti-join returns a confident zero, because all 16 listings booked somewhere. Proving the zero is the analyst's job, not an assumption. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload listing row — the LEFT quietly became an INNER and the idle fleet vanished. The fix is moving the predicate into ON or an outer query. Instant-access marketplaces sharpen this: the host side and the guest side are separate survival rules, and one join type for both is wrong for one of them.",
      tag: "joins",
    },
    {
      id: "getaround-t2",
      q: "The utilization ladder runs 47, 46, 38 booked days, then TWO listings tie at 36 and THREE tie at 30. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the 36-tie consumes ranks 4 and 5, so the next listing (33 days) lands on 6, implying a phantom position that does not exist; the 30-tie consumes 8 through 10 and the next enters at 11. DENSE_RANK shares rungs without gaps — the 36-tie reads 4, 4 and the 33-day listing is 5. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which car gets the repositioning slot first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer listings, or an explicitly named tie-breaker like listing id — and writing it in the query comment so the next analyst inherits the decision, not the debate. On a fleet this small the tie blocks ARE the middle of the ladder; a leaderboard that hides them is lying about scarcity.",
      tag: "windows",
    },
    {
      id: "getaround-t3",
      q: "The census shows 103 trips and 16 accounts; EU shows 45 trips and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts trip rows after the join — one row per trip, so an account with 24 trips contributes 24. COUNT(DISTINCT customer_id) folds those rows back to accounts — EU's 45 trips collapse to 8. Neither is wrong: trips measure load and booking momentum, accounts measure installed base and coverage. The ratio — 5.6 trips per account in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the trip lines and COUNT(*) silently counts lines, not trips — 251 of them — while SUM(quantity) counts booked days, 498. Three grains, three different businesses: trips, relationships, and utilization. Saying 'one row per what?' for every COUNT in the query is the habit the panel grades, and it is the same habit Getaround's own dashboards encode.",
      tag: "aggregation",
    },
    {
      id: "getaround-t4",
      q: "shipped_at is NULL until a guest actually unlocks the car. What is your policy for the lead-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped trips have a lead, so the report measures booking-to-unlock for the 82 of 103 trips that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL trips returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 unlock-pending plus 7 no-show rows, which is a feature, not a bug — it is the instant-access promise being tested. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day unlocks for trips that have not happened, and it poisons the 2.98 baseline every regional drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Getaround reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "getaround-t5",
      q: "The trust review wants no-show share per market for markets carrying at least ten trips. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards completed, on-trip and pending rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-trip floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a trust line and an error. One more placement rule Getaround screens love: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the no-show share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one trip, or about a market?",
      tag: "pipeline",
    },
    {
      id: "getaround-t6",
      q: "WHERE trips > (SELECT AVG(trips) FROM folded) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and trips > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 16 accounts always produce a mean (6.44 trips per account on this db — exactly four accounts clear it, at 24, 17, 14 and 13). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each trip to ITS account's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when an account's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "getaround-t7",
      q: "The demand trend buckets trips by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the demand trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and trip-start is exactly when instant unlocks land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the deltas tell is concrete: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is demand discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "getaround-t8",
      q: "Finance says a payout statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: payout statements LEFT JOIN payment legs, keep the NULL side — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "getaround-mcq-1",
      prompt: "A trip row's status reads 'pending'. In this kit's Getaround fate map, what happened?",
      choices: ["Booked, unlock pending — 14 of 103 trips, no app-unlock stamp yet", "On-trip — the guest already unlocked the car", "No-show — the trip was cancelled at term", "Completed — awaiting host payout"],
      answer: 0,
      why: "The fate map is fixed: pending = booked with the app unlock still ahead — 14 of 103 trips (13.6%), no shipped_at stamp and no lead-time clock yet. It stays in every funnel denominator.",
      notes: [
        { choice: 1, why: "On-trip is 'shipped' — 30 trips whose unlock stamp HAS landed. Calling unlock-pending rows on-trip books demand that has not opened a door yet." },
        { choice: 2, why: "No-show-or-cancelled is 'cancelled' — 7 trips (6.8%). Pending is 'not yet', not failure; conflating them inflates the trust incident count by 2x." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-2",
      prompt: "The fleet read says 498 booked days. Which expression over order_items returns it?",
      choices: ["COUNT(*)", "COUNT(DISTINCT order_id)", "SUM(quantity)", "SUM(DISTINCT quantity)"],
      answer: 2,
      why: "order_items rows are trip line items with quantity = booked days, so SUM(quantity) folds 251 lines into the 498-day utilization read. The other two counts answer different grains entirely.",
      notes: [
        { choice: 0, why: "COUNT(*) = 251 — trip lines, not days. A trip with 3 booked days carries up to 3 lines; counting lines understates utilization and overstates nothing." },
        { choice: 1, why: "COUNT(DISTINCT order_id) = 103 — trips, not days. Right answer to a different question; the utilization board wants days per car." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-3",
      prompt: "LATAM shows 2 trips, 1 account, average trip value 426.22. Which read is honest?",
      choices: ["LATAM is the strongest market — highest average trip value on the platform", "LATAM is the thinnest market — 2 trips from 1 account; the AOV is real but the base is a single account's habit", "The AOV is a bug — averages over fewer than 10 rows should return NULL", "LATAM has no trips — the census must be empty"],
      answer: 1,
      why: "Both grains travel together: LATAM's 852.44 book over 2 trips from 1 account yields 426.22 AOV — the platform's highest — but the base is one account. Load, coverage and intensity (2.0 trips per account) all belong on the same slide.",
      notes: [
        { choice: 0, why: "Quoting AOV without the base is how a two-trip market wins a board deck. The intensity read — 2 trips, 1 account — caps the claim immediately." },
        { choice: 2, why: "Nothing is wrong with the arithmetic: 852.44 / 2 = 426.22. Small-n caution is a presentation rule, not a SQL rule — suppress it in the deck note, not the query." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-4",
      prompt: "The utilization ladder books 47, 46, 38 days, then TWO listings tie at 36. Under RANK, what rank does the next listing (33 days) carry?",
      choices: ["5", "6", "4", "3"],
      answer: 1,
      why: "RANK shares rungs and then skips: 47→1, 46→2, 38→3, the two 36-day listings share rank 4, consuming ranks 4 and 5 — so the 33-day listing enters at 6. On this db the next tie (three listings at 30) consumes 8 through 10 and the ladder resumes at 11.",
      notes: [
        { choice: 0, why: "5 is the DENSE_RANK answer — shared rungs without gaps. Fleet ops' published policy is RANK semantics, gaps included." },
        { choice: 2, why: "4 is the rank the tie itself holds. Handing the next car a shared rung erases the tie boundary and mis-sizes the repositioning queue." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-5",
      prompt: "Keep only listings carrying at least 30 booked days — on this db, exactly 10 cars. Where does the threshold live?",
      choices: ["WHERE SUM(quantity) >= 30, before GROUP BY", "GROUP BY listing HAVING SUM(quantity) >= 30", "WHERE quantity >= 30 on the raw line table", "ORDER BY SUM(quantity) >= 30"],
      answer: 1,
      why: "Booked days only exist after the fold: groups must form before they can be judged, so HAVING follows GROUP BY. The 10 survivors are the 47, 46, 38, both 36s, 33, 31 and the three 30s.",
      notes: [
        { choice: 0, why: "SUM does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "quantity >= 30 filters LINES, not listings — no single line carries 30 days (max line quantity is 3), so the report returns zero rows while looking valid." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-6",
      prompt: "The regional instant-lead clock: US averages 3.07 days over 15 stamped trips, LATAM 3.5 over 2. What makes the cut defensible?",
      choices: ["Average over ALL trips per region, letting NULLs count as zero", "Filter shipped_at IS NOT NULL per region and print the stamped count beside every average", "Drop regions with fewer than 10 stamped trips from the SQL entirely", "Use MAX(created_at) as the unlock stamp for unstamped trips"],
      answer: 1,
      why: "The clock is stamped-only — 82 of 103 trips — and the count travels with the average: LATAM's 3.5 on 2 stamps is a different-grade signal than the US's 3.07 on 15. The regional table (LATAM 3.5, US 3.07, EU 2.94, APAC 2.93) reads slowest-first with counts attached.",
      notes: [
        { choice: 0, why: "NULL-as-zero invents same-day unlocks for trips that never opened — and AVG skips NULLs anyway, so 'letting them count' quietly means they don't. Either way the 2.98 baseline is poisoned." },
        { choice: 3, why: "MAX(created_at) is a booking date, not an unlock stamp — the fill fabricates a clock for trips still waiting to happen." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-7",
      prompt: "5 payout statements settle on BOTH card and wire legs. After joining statements to payment legs, what counts statements once each?",
      choices: ["COUNT(*)", "COUNT(DISTINCT invoice_id)", "COUNT(invoice_id)", "SUM(invoice_id)"],
      answer: 1,
      why: "The join fans out — a split-rail statement contributes 2 leg rows — so COUNT(*) counts legs, not statements. COUNT(DISTINCT invoice_id) folds the fan-out back to the statement grain; the rails read card 16 legs / 37,364.00 versus wire 11 / 32,248.00 only makes sense at leg grain, statement counts at statement grain.",
      notes: [
        { choice: 2, why: "COUNT(invoice_id) skips only NULLs — every joined row carries an invoice_id, so it equals COUNT(*): 27 legs, not 28-or-fewer statements." },
        { choice: 3, why: "SUM(invoice_id) adds id codes together — a number that means nothing. The deduplicator is DISTINCT, and the grain is the whole argument." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-8",
      prompt: "A payout statement reads 'paid' but has zero payment legs behind it — #28 at 1,756.00. Which query finds every such row?",
      choices: ["SELECT … FROM invoices WHERE status = 'paid' AND amount_cents > 0", "invoices LEFT JOIN payments … WHERE p.id IS NULL AND i.status = 'paid'", "invoices INNER JOIN payments … WHERE i.status = 'paid'", "SELECT … FROM payments WHERE invoice_id IS NULL"],
      answer: 1,
      why: "Status is a claim; legs are the ledger. The LEFT JOIN anti-join keeps statements with no legs at all, and the status predicate slices the claim-that-lies cohort — on this db exactly #28, 1,756.00. The INNER JOIN version can never find it: no legs means no join row.",
      notes: [
        { choice: 0, why: "That lists every paid statement — 21 of them, 66,443.00 — with no existence test on legs. The bug ships silently because every returned row looks plausible." },
        { choice: 3, why: "payments.invoice_id is never NULL — orphan legs are not the anomaly. The direction matters: statements missing legs, not legs missing statements." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-9",
      prompt: "The no-show bar: per-market shares average 5.0, but the platform pooled share is 6.8 (7 of 103). Which expression computes the POOLED bar?",
      choices: ["AVG(no_show_pct) over the per-market fold", "100.0 * SUM(no_shows) / SUM(trips) over the whole book", "MAX(no_show_pct) of the market shares", "AVG(no_shows) over accounts"],
      answer: 1,
      why: "The pooled share pools numerator and denominator first: 7 no-shows over 103 trips = 6.8. The mean of market shares (8.1, 6.7, 5.3, 0 → 5.0) weights every market equally and lets LATAM's 2-trip zero drag the bar down. Same data, two definitions — the deck must say which it printed.",
      notes: [
        { choice: 0, why: "That is the mean-of-shares — 5.0, the bar case-2 prints beside every market. Defensible, but it is NOT the pooled rate and the 1.8-point gap is exactly the argument trust & safety referees." },
        { choice: 2, why: "MAX returns the worst market (APAC 8.1) — a target, not a bar. Comparing every market against the worst is how every market fails forever." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-10",
      prompt: "One query must return, per market, total trips AND no-shows. Which fold keeps both numbers honest in a single pass?",
      choices: ["Filter WHERE status = 'cancelled', then COUNT(*) per market", "COUNT(*) for trips and SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) for no-shows, grouped by market", "COUNT(status = 'cancelled') for no-shows beside COUNT(*)", "Two queries — fold the census, then join the results on market"],
      answer: 1,
      why: "The conditional aggregate keeps every row in play: COUNT(*) = trips (45 in EU), the CASE flag = no-shows (3 in EU), branches reconcile to the total by construction — 52 + 30 + 14 + 7 = 103. One scan, one denominator, no drift.",
      notes: [
        { choice: 0, why: "The WHERE drops every other fate before the fold — the trips column silently counts 3, not 45, and the census loses its denominator while both numbers still look real." },
        { choice: 2, why: "COUNT(expr) counts NON-NULL results — status = 'cancelled' evaluates to 0 or 1, both non-NULL, so it equals COUNT(*): 45 'no-shows' in EU. The classic boolean-count trap." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-getaround-1",
      tier: "easy",
      topic: "t5",
      universe: "inventory",
      title: "The instant-utilization ladder",
      brief:
        "Getaround-flavored brief on the storefront db: fleet ops re-cuts the per-listing utilization ladder every week — how many booked days each car turned, ranked hardest-first, because repositioning and pricing both key off it. Probed facts: the 251 trip line items carry quantity = booked days, folding to 498 booked days across the 16 listings; the hardest-worked listing turns 47 booked days, the runner-up 46, the third 38; the ladder then ties — two listings at 36, three at 30 (ranks 8 through 10 under RANK), and the tail ties three-deep at 21. Instant access means a car idle today is visible to every guest in the city, so the ladder reads the top twelve only.",
      ask: "Return the twelve hardest-worked listings with booked days and a RANK by booked days, hardest first, sharing rungs where days tie.",
      template:
        "SELECT oi.product_id AS listing,\n       SUM(oi.quantity) AS booked_days,\n       {1}() OVER (ORDER BY SUM(oi.quantity) {2}) AS utilization_rank\nFROM order_items oi\nGROUP BY {3}\nORDER BY utilization_rank, listing\nLIMIT {4};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-aware rank function",
          why: "RANK shares rungs on ties and then skips: the 36-tie consumes ranks 4-5, the 30-tie consumes 8-10, so the next listings enter at 6 and 11. DENSE_RANK closes the gaps (6 becomes 5) and ROW_NUMBER splits ties arbitrarily — both print a different ladder and both mis-state the repositioning queue.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the hardest-worked-first direction",
          why: "The window must rank by booked days descending — 47 on top. ASC crowns the 21-day tail as utilization_rank 1: a correct query aimed at the wrong end of the fleet, and the repositioning crew drives to the idlest cars first.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the listing fold key",
          why: "The fold is per listing: GROUP BY oi.product_id gives one row per car with its booked days. Folding by order_id rebuilds the 103-trip grain (day-sums of 1 to 3) and the ladder stops being a fleet read; folding by a constant collapses all 16 listings into one row.",
        },
        {
          answer: "12",
          kind: "number",
          noVerify: true,
          label: "the board's top-twelve cut",
          why: "The ops board prints twelve rows — ranks 1 through 12, which lands exactly between the tie blocks (the 30-tie completes at row 10, the 21-tie starts at 14). LIMIT is a display constant: move it to 6 and half the ladder vanishes; the cut belongs to the deck, not the query.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "SUM", "ASC", "oi.order_id", "6"],
      walkthrough:
        "One fold, one window, one display cut. GROUP BY listing folds 251 trip lines into 16 booked-day sums — 498 days in total — and RANK() OVER (ORDER BY SUM(quantity) DESC) stamps the ladder: 47 (rank 1), 46, 38, then the two 36-day listings sharing rank 4, 33 at rank 6, 31 at 7, the three-way 30-tie on ranks 8-10, 28 at 11, 27 at 12 — the LIMIT 12 cut lands between tie blocks, so no tied car gets sliced off the board. The distractors each break differently: DENSE_RANK renumbers the 33-day listing to rank 5 and the post-tie block to 9, quietly shrinking the ladder; ROW_NUMBER splits both ties arbitrarily and ranks the 36-tie 4-5, inventing a pecking order no one set; SUM in the window slot is a running sum wearing a rank's name; ASC flips the board so the 21-day tail leads; folding by oi.order_id rebuilds the trip grain and the fleet read dissolves into 103 one-trip rows; LIMIT 6 drops the whole 30-tie block the ops meeting exists to argue about. The read: ten cars turn 30-plus days while the widest tail sits at 38 of 500 listed-available days — utilization, not supply, is the binding constraint.",
    },
    {
      id: "cs-getaround-2",
      tier: "hard",
      topic: "q5",
      universe: "refund-audit",
      title: "The no-show bar census",
      brief:
        "Getaround-flavored brief on the storefront db: trust & safety prices the no-show fee off a per-market census — trips, no-shows, the no-show share, and the platform bar it gets compared against, printed on one slide. Probed facts: 7 of 103 trips cancelled (6.8% pooled); the market split reads APAC 3 of 37 (8.1%), EU 3 of 45 (6.7%), US 1 of 19 (5.3%), LATAM 0 of 2 (0.0%). The bar the deck quotes is the MEAN OF MARKET SHARES — (8.1 + 6.7 + 5.3 + 0.0) / 4 = 5.0 — not the pooled 6.8; the 1.8-point gap between the two definitions is exactly the argument the meeting referees. Shares print to 1 decimal.",
      ask: "Return each market with trips, no-shows, its no-show share and the platform bar (mean of market shares) to 1 decimal, worst share first.",
      template:
        "WITH flagged AS (\n  SELECT c.region AS region,\n         CASE WHEN o.status = {1} THEN 1 ELSE 0 END AS no_show\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n),\nmarkets AS (\n  SELECT region,\n         COUNT(*) AS trips,\n         SUM(no_show) AS no_shows,\n         ROUND({2} * SUM(no_show) / COUNT(*), {3}) AS no_show_pct\n  FROM flagged\n  GROUP BY {5}\n)\nSELECT region, trips, no_shows, no_show_pct,\n       ROUND((SELECT AVG(no_show_pct) FROM markets), 1) AS platform_bar\nFROM markets\nORDER BY no_show_pct {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show arm",
          why: "The flag arm must test the exact status value 'cancelled' — 7 rows. 'pending' flags the 14 unlock-pending trips instead and the census indicts demand that simply has not traveled yet; 'delivered' flags the 52 successes and every market reads 50-plus percent no-show.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the real-arithmetic multiplier",
          why: "The 100.0 sits BEFORE the division: SUM of 0/1 flags over COUNT is integer division, and bare 100 truncates the shares to 8, 6, 5, 0 — APAC's 8.1 versus EU's 6.7 gradient, the whole point of the census, collapses to a flat 8-6-5-0 staircase.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Shares print to 1 decimal — 8.1 against 6.7 is the APAC-versus-EU gap trust & safety quotes. ROUND(…, 2) prints 8.11 and 6.67, precision the probed census never carried, and the slide stops reconciling with the 6.8 pooled figure beside it.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-share-first direction",
          why: "The census reads worst first: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0. ASC opens the meeting on the clean market — a correct query aimed at the wrong end of the trust board.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the market fold key",
          why: "The fold is per market: GROUP BY region gives four rows whose branches must foot to 103 by construction. Folding by any other key re-grains the census — a single constant fold returns one 103-trip row and the market gradient vanishes into one number.",
        },
      ],
      distractors: ["'pending'", "'delivered'", "100", "2", "ASC", "city"],
      walkthrough:
        "Two stages: flag fates at trip grain, then fold and bar at market grain. The flagged CTE stamps each of the 103 trips 0/1 on status = 'cancelled'; the markets CTE folds per region — trips 45/37/19/2, no-shows 3/3/1/0 — and the share is the real-arithmetic read 100.0 * SUM(no_show) / COUNT(*) rounded to 1 decimal: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0. The outer SELECT carries the bar as a scalar subquery over the same fold — AVG of the four shares = 5.0 — so every row prints the definition it will be judged against, ordered worst-first. The distractors each break differently: 'pending' flags 14 not-yet-traveled trips and the census reads 13-15 percent everywhere; 'delivered' flags successes; bare 100 triggers integer division and flattens the shares to 8/6/5/0; precision 2 prints 8.11/6.67 and desyncs from the probed census; ASC opens on LATAM; folding by city re-grains to 16 single-account rows; folding by a constant returns one 103-trip row and the market cut disappears. The definition is the deliverable: bar 5.0 (mean of shares) beside pooled 6.8 — LATAM's two-trip zero drags the mean down, and which bar the fee keys off is the call the meeting exists to make.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-iii", why: "Per-listing day-line revenue is the fleet-earnings chart — fold line records to listing grain across listing lifetimes, not one snapshot. This problem drills the multi-window fold the utilization ledger re-cuts weekly." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in fleet ops — which listings turn at least N booked days, which markets carry at least N trips. This problem drills the group-level gate behind the ten-car utilization cut." },
    { slug: "capital-gain-loss", why: "Fleet adds minus drops net out to the movement number the supply board reads. This problem drills ordered buy/sell folds — the same add/remove algebra listing turnover uses." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-trip power account is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "confirmation-rate", why: "Unlock outcomes arrive with gaps — COALESCE turns missing confirmation data into an explicit rate instead of a silent NULL. This drills the instant-lead funnel's denominator discipline." },
    { slug: "combine-two-tables", why: "Accounts LEFT JOINed to trips: the whitespace read. A trip without an account is corruption, an account without trips is idle supply — choosing the join type is the business statement." },
    { slug: "trips-and-users", why: "Cancellation rate per account with bans and attribution — the canonical two-sided trust query, and Getaround's no-show economics at practice scale: hosts, guests, and who eats the cancellation." },
    { slug: "average-selling-price", why: "Days-weighted average day rate per fleet family is the pricing pod's first chart — 498 booked days folding into a weighted mean, exactly this problem's divide-by-the-sum shape." },
    { slug: "immediate-food-delivery-ii", why: "Share of trips unlocking inside the promised instant window versus late — the access-SLA read is a conditional rate over a timestamp comparison, exactly this shape." },
    { slug: "market-analysis-i", why: "Markets clearing a spend gate, staged through a derived fold — the expansion-targeting query is a per-market fold judged against a computed bar, this problem's exact structure." },
    { slug: "number-of-employees-who-met-the-target", why: "Hosts hitting utilization targets is a conditional count against a bar — the fleet-ops weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "sellers-with-no-sales", why: "Host fleets with no booked days would be the idle-supply alarm — on this db the anti-join returns a confident zero, and proving that zero is part of the job." },
    { slug: "bank-account-summary", why: "Running payout balances per account over ordered settlement legs — the host-facing balance view is a running-sum walk, cents-safe by construction." },
    { slug: "list-the-products-ordered-in-a-period", why: "Which listings turned booked days inside a month window — the repositioning input is a date-bounded per-listing fold, exactly this problem's shape." },
    { slug: "game-play-analysis-iv", why: "Share of accounts whose FIRST trip unlocked the next day — the instant-access promise measured on day one, a first-event fold with a dated follow-up." },
    { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT folds each unlock day's listings into one cell — the ops board's day-by-day fleet-activity strip, built with the exact aggregate this problem drills." },
  ],
};
