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
    "Preparation strategy: the pools file carries no Getaround section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: unlock funnels, two-grain market censuses, tie-heavy utilization ladders, no-show CASE bands and the cents-safe payout spine. Do the topics in order, then run the six case studies on the live storefront db: they rebuild the reads this org actually re-cuts — the {amber:instant-utilization ladder} fleet ops ranks weekly, the {rose:no-show bar census} trust & safety referees monthly, the host-fleet earnings ledger where the days leader is not the money leader, the day-rate band census with its honest empty flagship arm, the one-pass fate census that reconciles to 103 by construction, and the never-settled payout audit that catches the paid-status statement with zero legs. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. Six case studies now span the asks Getaround data teams rehearse most — utilization, trust, host economics, payout money — and each one rewards the second pass: run it on the live db, then re-run it a week later from a blank editor and say the denominator out loud before the first SELECT lands. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate what each wrong chip silently re-files, which is exactly the muscle the 'do the pending trips sit in your base?' follow-up tests.",
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
      slugs: ["percentage-of-users-attended-a-contest", "trial-to-paid-funnel", "immediate-food-delivery-i", "funnel-step-conversion", "game-play-analysis-v", "classes-more-than-5-students", "game-play-analysis-iv"],
    },
    {
      name: "Two-grain market censuses",
      why: "Trips and accounts are different grains of the same join, and every census here reports both: EU runs 45 trips from just 8 accounts while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and naming which is load and which is coverage — is the habit every census here grades. The ratio (5.6 versus 9.5) is the intensity read that decides where unlock-support hours go.",
      slugs: ["unique-orders-and-customers-per-month", "number-of-rich-customers", "students-and-examinations", "dau-wau-stickiness", "repeat-purchase-rate", "trips-and-users"],
    },
    {
      name: "Utilization ladders & tie policy",
      why: "The per-listing ladder is rank-window reporting where ties are structural — booked days run 47, 46, 38, then two listings tie at 36 and three at 30, and further down three tie at 21. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer cars, not syntax. Fleet ops publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "group-employees-of-the-same-salary", "second-most-recent-activity", "product-sales-analysis-iii", "bank-account-summary"],
    },
    {
      name: "Booked-day folds",
      why: "Utilization lives in order_items: quantity is booked days, so SUM(quantity) per listing turns 251 lines into the 498-day fleet read, and quantity × unit_price turns it into earnings. The trap is grain drift — COUNT(*) counts lines, COUNT(DISTINCT order_id) counts trips, and only the SUM counts days. Saying 'one row per what?' for every fold is the habit being graded.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "queries-quality-and-percentage", "game-play-analysis-iii", "total-traveled-distance", "keep-latest-dedupe", "list-the-products-ordered-in-a-period", "group-sold-products-by-the-date"],
    },
    {
      name: "Unlock-lead math on timestamps",
      why: "The booking-to-unlock clock — created_at to shipped_at — is julianday arithmetic over text timestamps: 82 stamped unlocks averaging 2.98 days with a 2–4 day spread. The NULL policy ships with the number, because the 21 stamp-less trips have no clock and must not dilute the average. The regional cut (US 3.07, APAC 2.93) is where drift alerts live.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "game-play-analysis-i", "median-time-to-convert", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "No-show bands with CASE",
      why: "No-show fees, claim tiers and day-rate bands are CASE-classified with fixed edges — the trip lines split 268 units at a 31.01 average line rate against 230 at 115.85, and a premium 200-plus price arm is honestly empty (max list rate 199.99). The arms must be exhaustive and ordered: a hole in the CASE is a hole in the trust census, and the empty band is a finding, not padding.",
      slugs: ["calculate-special-bonus", "the-winner-university", "evaluate-boolean-expression", "ratings-histogram", "customer-purchasing-behavior-analysis", "confirmation-rate", "average-selling-price", "immediate-food-delivery-ii"],
    },
    {
      name: "Month spine & LAG walk",
      why: "The 14-month trip spine (2024-01 to 2025-02) is the demand board's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, and the biggest single-month jump is +1,158.21 into August. LAG drives the walk and the first row is NULL by definition — the baseline, never a zero. No-shows cluster in the same walk: July and November carry 2 each of the 7.",
      slugs: ["hopper-company-queries-i", "biggest-window-between-events", "second-day-confirmation", "week-over-week-churn", "cohort-retention-matrix", "combine-two-tables", "sellers-with-no-sales"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — completed under no-show, this quarter beside last — and EXCEPT answers 'which booked accounts never stamped an unlock'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The payout anti-join (6 never-settled statements) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "customers-who-never-order", "customer-who-visited-but-did-not-transact", "number-of-times-a-driver-was-a-passenger", "market-analysis-i"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets completed, on-trip, unlock-pending and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "count-the-number-of-experiments", "create-a-session-bar-chart", "capital-gain-loss"],
    },
    {
      name: "Payout books & cents discipline",
      why: "Completed is not paid out — the settlement tables (28 statements, 27 payment legs, INTEGER cents) are where the trip world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve, wire legs (11, 32,248.00) fleet-invoiced, and 5 statements settle on both.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "account-balance", "chargeback-rate-ranking"],
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
    {
      id: "getaround-t9",
      q: "UNION versus UNION ALL — when is the dedupe step correct business logic for a payout packet, and when is it a silent bug?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and the honest default when the branches are logically disjoint, like card-leg payouts stacked over wire-leg payouts in a close packet. UNION adds a distinct pass over the combined set, and that pass is a business decision: correct only when you can name which duplicated rows you are paying to collapse. In payout land, duplicates are usually the signal — a settlement leg ingested twice by a pipeline retry looks identical to a real repeat payment, and UNION makes the anomaly vanish exactly when the packet is being audited. Column discipline matters too: both branches need matching column counts and compatible types, with names taken from the first branch. The opinionated version the trust & payments pod works by: default to UNION ALL, and reach for UNION only with a written sentence saying which duplicates you are collapsing and why.",
      tag: "set-ops",
    },
    {
      id: "getaround-t10",
      q: "EXCEPT and INTERSECT — which marketplace questions do they answer more honestly than a join, and what does each silently do to duplicate rows first?",
      a: "Diff and overlap questions. 'Which accounts booked a trip but never stamped an unlock?' is SELECT booked EXCEPT SELECT unlocked — no join gymnastics, and the direction IS the question: swapping the sides flips booked-not-unlocked into unlocked-not-booked, a different funnel leak. INTERSECT answers the mirror: accounts present in both the booking and the unlock snapshots. Two discipline points: set operations deduplicate both inputs first, so EXCEPT silently collapses an internally duplicated feed — if a double-ingested unlock event is the anomaly you are hunting, the row-honest tool is a LEFT JOIN … IS NULL anti-join on the full multiset; and both sides must share column count and compatible types. EXCEPT and INTERSECT for set-level diffs across snapshots, anti-joins for row-level forensics — knowing which question you are answering is the whole skill.",
      tag: "set-ops",
    },
    {
      id: "getaround-t11",
      q: "No-show fee bands, day-rate bands, fate labels — walk me through writing a CASE the trust review can trust.",
      a: "Three properties. Exhaustive: every row must land somewhere — a hole in the CASE is a hole in the trust census, so the ELSE arm is load-bearing even when it 'should' be empty. Ordered: arms evaluate top-down and the first true branch wins, so overlapping conditions go most-specific first — a 200-plus arm placed below a 150-plus arm is dead code, and moving it above silently re-bands every rate in between. Honest about empties: the shelf tops out at 199.99, so a 200-plus flagship band prints no rows — and that empty band is a finding about the fleet, not padding to delete. The finishing discipline is labeling: band names are business words ('budget', 'standard'), not SQL shorthand, because the column ships straight into the deck. A CASE that fails any of the three does not error — it just quietly re-files the fleet, which is worse.",
      tag: "case-when",
    },
    {
      id: "getaround-t12",
      q: "What does GROUP_CONCAT do, and where does a marketplace report genuinely need it instead of a join or a GROUP BY?",
      a: "GROUP_CONCAT folds a group's text values into one delimited cell — a day's unlock list as 'listing 11, listing 4, listing 9'. It earns its place when the consumer is a human reading a row, not another query: per-day fleet-activity strips, per-account status trails, per-market city lists. The grammar that matters: GROUP_CONCAT(DISTINCT name) keeps repeated values from printing twice, the optional second argument sets the separator, and there is no ORDER BY inside — so cell order follows scan order and must not be relied on for presentation. The trap is overuse: a comma-cell is unqueryable downstream (no joins, no counts, no indexes), so any field another query will consume belongs as rows, not as a folded string. Fold for the readout, keep rows for the warehouse.",
      tag: "strings",
    },
    {
      id: "getaround-t13",
      q: "When do you stage a WITH (CTE) instead of nesting a subquery — and what does a well-named CTE buy a marketplace team?",
      a: "Three concrete buys. Readability: a chain of named steps — flagged, markets, bar — reads like the trust process instead of a Russian-doll subquery, and each CTE is a natural checkpoint to SELECT from while debugging. Reuse: one CTE can feed several later references in the same statement, so the per-market fold is written once, not three times. Correctness under review: naming a CTE unlock_pending forces you to state the definition (booked, no stamp yet) where the reviewer can see it — marketplace metric culture is the answer to definitions that drift between decks. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step — the 103-row trip table is small, but the habit is what scales. When a query grows past two grains, the CTE stops being style and becomes the only way the next analyst can audit your number.",
      tag: "ctes",
    },
    {
      id: "getaround-t14",
      q: "A correlated subquery compares each trip to ITS market's average value. Why is it slow, and what do you reach for instead?",
      a: "A correlated subquery references the outer query's current row, so the inner average re-evaluates once per trip — 103 re-runs on this db, millions on a warehouse table. It is readable and correct, which is why it appears in screens, but the set-based equivalents are the professional default: a JOIN to a derived table of per-market means (GROUP BY region in a CTE, join back on region), or a window function AVG(total) OVER (PARTITION BY region), which computes each partition's mean once and keeps every row. On this db the market means are EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 — the window version puts each market's mean beside every trip and the above/below comparison becomes a visible column. The strong answer names the trade: correlated form for clarity on small data, join-to-CTE or window form for anything that ships.",
      tag: "subqueries",
    },
    {
      id: "getaround-t15",
      q: "How would you build a running booked-days total per listing — and where do ROWS and RANGE disagree?",
      a: "Window frames. Running total: SUM(booked_days) OVER (PARTITION BY listing ORDER BY unlock_day) — the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and its final row per listing must equal that listing's total booked days; if it does not, the frame or the ORDER BY is broken. A trailing window: SUM(booked_days) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) — the last seven rows, not the last seven days. The expert detail: ROWS peers 7 ROWS back, RANGE peers 7 DAY-VALUES back — identical on a dense calendar, different the moment a day is missing from the data. On a marketplace whose demand has gaps, the calendar-true frame (or a date-spine join) is the honest choice, and the discipline is stating which you chose. LAG for the delta, frames for the accumulation — and the first row stays NULL either way.",
      tag: "windows",
    },
    {
      id: "getaround-t16",
      q: "What does COUNT(*) OVER (PARTITION BY region) buy a report that a GROUP BY cannot — and when do you reach for each?",
      a: "The window keeps every row; the GROUP BY collapses them. PARTITION BY region computes each market's trip count — EU 45, APAC 37, US 19, LATAM 2 — and stamps it onto every trip row, so a per-trip detail report can carry its market's load without losing the row it is about. That is the pattern behind 'flag every below-average account with its market's mean' and 'mark trips inside markets running hot' — enrichment, not collapse. Reach for GROUP BY when the deliverable IS the group (one row per market for the deck), and for the window when the deliverable is still the row but the decision needs group context. The cost note: the window recomputes per partition cheaply, but stacking several different PARTITION BYs in one SELECT re-scans per window — stage them in CTEs when the query grows.",
      tag: "windows",
    },
    {
      id: "getaround-t17",
      q: "Why is an average of averages wrong, and what do you compute instead for marketplace reads?",
      a: "Because it weights every group equally regardless of size. On this db the per-account mean book is 2,177.08 (34,833.28 over 16 accounts) and the per-trip mean is 338.19 — averaging the four MARKET AOVs (EU 335.32, APAC 313.66, US 383.48, LATAM 426.22) gives 364.67, a number that describes a marketplace nobody operates, because LATAM's two trips get the same weight as EU's forty-five. The same trap wears a trust badge: the mean of market no-show shares is 5.0 while the pooled share is 6.8 — 1.8 points apart, and which bar the fee keys off is a referee call. The honest blends are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average, SUM(mean * weight) / SUM(weight), the same arithmetic one level up. The interview move is saying WHERE the weighting lives — and an average of averages is only correct when every group has equal counts, which is a claim you should have to defend.",
      tag: "aggregation",
    },
    {
      id: "getaround-t18",
      q: "COUNT(*) versus COUNT(column) versus COUNT(DISTINCT column) — when does each give a different answer on the trip spine?",
      a: "COUNT(*) counts rows: 103 trips, or 251 trip lines after the join — whichever grain the FROM clause produced. COUNT(column) counts non-NULL values of that column: COUNT(shipped_at) is 82, the stamped subset, and the gap to 103 is exactly the 21 unstamped rows (14 unlock-pending plus 7 no-shows) — a feature to report, not a bug to patch. COUNT(DISTINCT column) folds repeats back to entities: 16 accounts behind the 103 trips, 16 listings behind the 251 lines, and — after the payout join — 28 statements behind 27 legs, where COUNT(DISTINCT invoice_id) is the only counter that does not double-count the 5 split-rail statements. Saying out loud which grain each form counts is the whole answer; the numbers change shape with each one, and so does the business decision they feed.",
      tag: "aggregation",
    },
    {
      id: "getaround-t19",
      q: "Payout money lives in integer cents in the finance tables. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: a statement at 493,700 cents is 4,937.00 dollars, and amount_cents / 100 is integer division — divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision that a later SUM still needed — round only what a human reads, because a cent per row across 28 statements is a payout ledger that no longer foots. Float drift: SQLite REALs are IEEE doubles, so keep money in integer cents until the last step rather than casting early. The policy I state in reviews: aggregate in cents, convert once, round at the edge, and let the ledger prove it — this close lands at 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route. A number that survives that chain is a number the trust & payments pod will sign.",
      tag: "numbers",
    },
    {
      id: "getaround-t20",
      q: "What makes a predicate sargable, and which habits keep a marketplace query cheap?",
      a: "Sargable means the predicate can use an index: it compares the bare column to a value. Wrapping the column in a function — STRFTIME('%Y-%m', created_at) = '2024-07' — forces a scan of every trip row; the sargable twin is the half-open range created_at >= '2024-07-01' AND created_at < '2024-08-01', same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT * so payloads you never read stop crossing the wire; probe with LIMIT before committing to the full run; and aggregate on the smallest table that answers the question rather than joining first and filtering after. Marketplace tables are small today and that is exactly the trap — the habits are free to build now and expensive to retrofit when the trip log is a million rows and the supply board times out before the ops meeting.",
      tag: "performance",
    },
    {
      id: "getaround-t21",
      q: "In a trust review you are asked for 'the completed-trip rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the event (trips completed, or trips with a settled payout — different clocks), the numerator (52 completed), the denominator (all 103 booked, or only trips old enough to have resolved — the two definitions disagree by double digits on a growing marketplace), and the window (calendar month, trailing 90 days, lifetime?). Then the discipline move: encode the definition as a named CTE — completed AS (SELECT … WHERE status = 'delivered') — so the SQL IS the definition and the reviewer can audit it instead of arguing with you. The follow-up the panel always runs: 'do the 14 unlock-pending trips sit in your base?' The strong candidate has already answered it in the CTE name. Getaround's review culture punishes vibes-based definitions; the analyst who says 'completed means delivered, denominator is all booked, trailing quarter' owns the room.",
      tag: "metrics",
    },
    {
      id: "getaround-t22",
      q: "When is DISTINCT a bug report rather than a feature?",
      a: "When it is papering over a fan-out nobody diagnosed. `SELECT DISTINCT account_name, trip_total FROM …` returning sane-looking rows usually means the trips-to-order_items join multiplied 103 trips into 251 rows and DISTINCT is de-duplicating the damage — while the SUM next to it is still wrong (103,244.55 where 34,833.28 belongs). The honest sequence: notice the DISTINCT, run the counts with and without it, find the multiplicity (GROUP BY the join key HAVING COUNT(*) > 1), and fix the join or pre-aggregate. Legitimate DISTINCT exists: collapsing a dimension's value set (16 distinct accounts, 16 listings, 4 markets, 7 fleet families on this db), or a genuinely coarser business grain than the storage grain. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
    },
    {
      id: "getaround-t23",
      q: "How does a self-join work, and what marketplace question needs one?",
      a: "A self-join joins a table to itself under two aliases, turning rows into pairs. The classic discipline: pair accounts within the same market — FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id — where the id inequality keeps each pair once and kills the a=a diagonal, so 8 EU accounts yield 28 pairs, not 64. Marketplace questions that need the shape: market-mate comparisons (which host's utilization lags its neighbor's), co-listing reads (two accounts active in the same city the same week), and the peer-benchmark pairs the supply team reviews quarterly. The follow-up to expect: why a.id < b.id and not != — because != double-counts every pair (A,B and B,A) and keeps self-pairs out only by luck of the data. Aggregating over the pairs (COUNT per market) turns the pair list into the market-pair density read that sizes the peer program.",
      tag: "joins",
    },
    {
      id: "getaround-t24",
      q: "A stakeholder says the supply dashboard moved overnight. Which SQL checks do you run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises by itself. Volume: today's trip count versus the 7-day average, because a half-loaded feed halves every downstream number. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of trip keys against the listing table to catch reference-integrity breaks. NULL spikes: COUNT(shipped_at) versus COUNT(*) — an unlock stamp that went 82 to 40 stamped will empty every lead clock built on it. On this db, that ritual is exactly how the paid-no-legs statement (#28, 1,756.00) would surface: status says paid, payment rows say zero. The deliverable is not 'it looks fine' — it is which check passed, when it last ran, and what the number was before the move.",
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
    {
      id: "getaround-mcq-11",
      prompt: "The booking-to-unlock clock: a trip books at created_at and the app-unlock stamp lands at shipped_at. Which expression computes the lead in fractional days?",
      choices: ["julianday(shipped_at) - julianday(created_at)", "shipped_at - created_at", "CAST(shipped_at AS INTEGER) - CAST(created_at AS INTEGER)", "DATEDIFF('day', created_at, shipped_at)"],
      answer: 0,
      why: "julianday() parses the TEXT timestamps into real day numbers — the 2.98-day average over the 82 stamped trips is exactly this subtraction. Instant access still has a lead clock; this is how it is measured.",
      notes: [
        { choice: 1, why: "Raw TEXT subtraction coerces both sides to their leading numbers (the years) and lands near 0 — a plausible zero that silently flattens the unlock clock." },
        { choice: 3, why: "DATEDIFF is not a SQLite function — the query fails outright. The engine's date toolkit is part of the answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-12",
      prompt: "`SELECT COUNT(*) FILTER (WHERE status = 'shipped') FROM orders` — the on-trip count on this db?",
      choices: ["30", "103", "52", "14"],
      answer: 0,
      why: "FILTER (WHERE …) counts only rows passing the predicate: shipped = on-trip, 30 of 103. It is the one-pass fate census in miniature — completed, on-trip, unlock-pending and no-show all share one scan and one denominator.",
      notes: [
        { choice: 2, why: "52 is the completed count ('delivered'). Calling on-trip trips completed inflates the success rate before any trip actually ends." },
        { choice: 3, why: "14 is the unlock-pending count ('pending'). The unlock stamp has not landed for those — they have no clock yet, and they are not on-trip." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-13",
      prompt: "The demand spine buckets trips by month. What does `SUBSTR(created_at, 1, 7)` return for a booking made 2024-07-14?",
      choices: ["'2024-07'", "7", "'2024'", "'Jul'"],
      answer: 0,
      why: "SUBSTR on the ISO string takes the first seven characters — year plus zero-padded month — the exact month key behind the 14-bucket trip spine (2024-01 to 2025-02). Zero-padded is what keeps months sortable and merge-free.",
      notes: [
        { choice: 1, why: "SUBSTR(..., 1, 7) takes 7 characters, not the numeric month — and a bare 7 loses the year, folding July 2024 into July 2025." },
        { choice: 3, why: "Month names come from STRFTIME('%b') territory, and 'Jul' sorts alphabetically, not chronologically — the spine would lose its order." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-14",
      prompt: "The completed-trip rate: 52 trips completed. Which denominator does this kit's drilled habit use?",
      choices: ["103 — ALL trips booked, unlock-pending and no-shows included", "89 — resolved trips only (completed plus no-shows)", "82 — stamped trips only", "45 — EU trips, the biggest market"],
      answer: 0,
      why: "Completed ÷ ALL booked = 52/103 = 50.5% — the denominator includes the 30 on-trip, the 14 unlock-pending and the 7 no-shows, because supply that is committed is not supply that is free. Completed ÷ resolved (89) reads 58.4% and quietly deletes the pipeline from the risk picture.",
      notes: [
        { choice: 1, why: "The resolved-only denominator is the classic inflation — it flatters the funnel by pretending pending trips cannot still complete. The panel asks for the base out loud." },
        { choice: 2, why: "82 is the stamped subset — the lead-clock population, not the fate denominator. Two different populations, two different numbers, one habit: state which." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-15",
      prompt: "The bookings report prints a blank unlock column for the 14 unlock-pending trips. The stakeholder wants the words 'not unlocked'. The fix?",
      choices: ["COALESCE(shipped_at, 'not unlocked')", "IFNULL(shipped_at, 0)", "WHERE shipped_at IS NOT NULL", "NULLIF(shipped_at, created_at)"],
      answer: 0,
      why: "COALESCE substitutes the display string only when the stamp is NULL — unlock-pending trips read as a labeled state instead of a hole, and the 14 rows stay in the report. They are the instant-access promise in flight, not missing data.",
      notes: [
        { choice: 1, why: "IFNULL(..., 0) prints a numeric 0 into a timestamp column — a falsy pseudo-date that reads as 'unlocked instantly', the opposite of the truth." },
        { choice: 2, why: "That deletes the 14 rows entirely — the stakeholder asked to relabel the gap, not to amputate the funnel from the report." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-16",
      prompt: "Fleet ops wants each unlock day's busiest listings folded into one cell: 'listing 11, listing 4, listing 9'. Which aggregate builds that?",
      choices: ["GROUP_CONCAT(DISTINCT product_id)", "CONCAT(product_id)", "SUM(product_id)", "STRING_AGG(product_id) OVER ()"],
      answer: 0,
      why: "GROUP_CONCAT folds a group's text values into one delimited cell — one row per unlock day with the car list inside. DISTINCT keeps a repeated listing from printing twice, and the comma separator is the classic default. It is an aggregate: one row per group, not one per listing.",
      notes: [
        { choice: 1, why: "CONCAT joins values within a single row — it cannot fold rows together. Without an aggregate the query returns one row per line, the opposite of the ask." },
        { choice: 2, why: "SUM coerces the ids to numbers and adds them — a meaningless checksum that hides every listing it collapses. Legal SQL, useless answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-17",
      prompt: "The 14-month demand spine opens at 3,731.97 in 2024-01. What does LAG(book) OVER (ORDER BY month) return for that first row?",
      choices: ["NULL — no prior row exists on the spine", "3,731.97 — LAG wraps around to itself", "0 — the baseline is always zero", "It errors — LAG requires a PARTITION BY"],
      answer: 0,
      why: "LAG has no row before the first one, so the opening month's baseline is honestly NULL — unknown movement, not flat movement. Coalescing it to 0 would read as a −100% collapse and poison every downstream delta on the demand board.",
      notes: [
        { choice: 1, why: "Windows do not wrap. The edge row's neighbor does not exist; inventing one is exactly the 'flat month' lie the walkthrough warns about." },
        { choice: 3, why: "PARTITION BY is optional — without it the window spans the whole result set. No error, just no partition boundary." },
      ],
      difficulty: "easy",
    },
    {
      id: "getaround-mcq-18",
      prompt: "The utilization ladder runs 47, 46, 38, then TWO listings tie at 36. Under DENSE_RANK, what rank does the next listing (33 days) carry?",
      choices: ["5 — shared rungs without gaps", "6 — the tie consumes two positions", "4 — the next listing shares the tie's rank", "3 — DENSE_RANK renumbers from the top"],
      answer: 0,
      why: "DENSE_RANK gives both 36-day listings rank 4 and then continues without a gap: the 33-day listing enters at 5. RANK would hand it 6 — the tie consumes positions 4 and 5 — and which of the two the ops board publishes is a policy about peer cars, not a syntax preference.",
      notes: [
        { choice: 1, why: "That is the RANK answer — correct semantics, wrong policy. This kit's ladder publishes DENSE_RANK rungs precisely so the middle of the fleet has no phantom positions." },
        { choice: 2, why: "Sharing the tie's rank erases the boundary between the 36-day cars and the 33-day car — a real utilization difference the repositioning queue acts on." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-19",
      prompt: "`SELECT SUM(oi.quantity) FROM order_items oi JOIN products p ON p.id = oi.product_id` — does the join change the 498 booked days?",
      choices: [
        "No — every line matches exactly one listing, so the join adds columns without adding rows; 251 lines stay 251",
        "Yes — every join at least doubles the rows",
        "Yes — the 16 listings each multiply their lines",
        "It errors — you cannot SUM a column across a join",
      ],
      answer: 0,
      why: "Fan-out comes from one-to-many joins in the wrong direction: order_items to products is many-to-one (each line has one listing), so the join is safe and the 498-day fold survives. The dangerous join is order_items to ORDERS — lines per trip — which is where 103 trips becomes 251 rows.",
      notes: [
        { choice: 2, why: "That is the orders-join direction. products is the dimension here: one row per listing, matched many times — the join multiplies nothing." },
        { choice: 1, why: "Joins do not universally double rows — cardinality decides. The habit is checking counts before and after, not fearing every JOIN." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-20",
      prompt: "The payout census reads 21 exact, 1 partial, 6 never-settled. Which HAVING clause isolates the one partial statement (4,000.00 of 6,148.00)?",
      choices: ["HAVING COUNT(p.id) > 0 AND SUM(p.amount_cents) < i.amount_cents", "HAVING COUNT(p.id) = 0", "HAVING SUM(p.amount_cents) = i.amount_cents", "HAVING p.amount_cents IS NULL"],
      answer: 0,
      why: "Partial means money arrived but fell short: at least one settlement leg, and settled cents strictly under billed cents — exactly one statement qualifies. Each half of the AND removes one of the other two buckets, which is what makes the clause a definition.",
      notes: [
        { choice: 1, why: "That is the never-settled bucket — 6 statements with no legs at all. Zero legs and short money are different anomalies with different owners." },
        { choice: 2, why: "That is the exact bucket — 21 statements. Equality is the clean case; the census exists for the row that misses it." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-21",
      prompt: "A colleague buckets the demand spine with `STRFTIME('%m', created_at)` instead of '%Y-%m'. The 14-month trend now returns 12 rows. What happened?",
      choices: ["'%m' keeps only the month number, so January 2024 and January 2025 merge into one bucket — the trend is fiction", "SQLite truncated the result set at 12 for display", "The extra two months fell outside the WHERE clause", "STRFTIME ignores years by design; use DATE() instead"],
      answer: 0,
      why: "'%m' emits '01' through '12' with no year, so the two Januaries (and the two Februaries) fold together: 14 buckets collapse to 12 and the 2025 opening overwrites 2024's. The spine key must carry the year — '%Y-%m' — or the demand trend is quietly wrong.",
      notes: [
        { choice: 1, why: "Nothing truncates. GROUP BY folds honestly — the dishonesty is in the key, which no longer identifies a month uniquely." },
        { choice: 3, why: "STRFTIME handles years fine ('%Y'). The fix is a format string change, not a function swap — and DATE() would not bucket at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-22",
      prompt: "`WHERE trips > (SELECT AVG(trips) FROM per_account_fold)` — the above-average gate on the 16-account fold. How many accounts survive?",
      choices: ["4 — the tier at 24, 17, 14 and 13 trips", "12 — everyone above the median", "0 — a scalar subquery cannot feed a comparison", "8 — exactly half by definition"],
      answer: 0,
      why: "The fold's mean is 6.44 trips per account, and exactly four accounts clear it — the same four that form the top tier. The gate and a HAVING floor agree on this db, which is a property of the distribution, not a law: mean-gates shift with the tail, floors do not.",
      notes: [
        { choice: 3, why: "Above-mean is not above-median — one 24-trip account against a tail topping at 5 drags the mean up and shrinks the survivor set below half." },
        { choice: 2, why: "A scalar subquery returns 0-or-1 rows and is built for exactly this comparison. The empty-inner edge case is the real risk, not the comparison itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-23",
      prompt: "The day-rate census adds a CASE arm: WHEN p.price >= 200 THEN 'flagship'. The shelf's list rates run 14.99 to 199.99. What does the flagship band print?",
      choices: ["No row at all — the band never fires, and the empty band IS the finding", "One row with 0s — ELSE guarantees every band appears", "The 199.99 listing — the arm's boundary is inclusive", "An error — CASE arms cannot be empty"],
      answer: 0,
      why: "GROUP BY only materializes bands that have rows, and no listing prices at 200-plus — so the flagship band is absent from the output. That absence is honest: the fleet has no flagship tier, and padding it with a zero row would imply supply that does not exist.",
      notes: [
        { choice: 2, why: "The 199.99 listing fails >= 200 — and even if it passed, boundary-inclusiveness is a WHERE/CASE decision you state, not a default you assume." },
        { choice: 1, why: "ELSE catches un-matched ROWS, not un-represented GROUPS. A band with zero members has no row to catch — empty means absent." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-24",
      prompt: "Instant-unlock share: `ROUND(100.0 * COUNT(shipped_at) / COUNT(*), 1)` prints 79.6. What does the bare-100 version — `ROUND(100 * COUNT(shipped_at) / COUNT(*), 1)` — print?",
      choices: ["79.0 — integer division truncates 8200/103 to 79 before the rounding", "79.6 — SQLite auto-promotes to real arithmetic", "82.0 — the share of stamped trips flips direction", "It errors — ROUND needs a REAL argument"],
      answer: 0,
      why: "COUNT returns integers, so 100 * 82 = 8200 divides by 103 as INTEGER division: 79, rounded to 79.0. The 100.0 multiplier BEFORE the division forces real arithmetic — 79.6116 → 79.6. One character of type is the difference between a share and a floor.",
      notes: [
        { choice: 1, why: "No auto-promotion — SQLite keeps the integer chain exactly as written. The .0 on the multiplier is the promotion, not the engine's courtesy." },
        { choice: 2, why: "The share's direction never flips; the numerator and denominator are unchanged. Only the arithmetic type moved." },
      ],
      difficulty: "medium",
    },
    {
      id: "getaround-mcq-25",
      prompt: "`SELECT customer_id, ROUND(SUM(total), 2) AS book FROM orders GROUP BY customer_id` — a colleague adds `WHERE book > 3000` and the query fails. The fix that keeps the four big books?",
      choices: ["Move the threshold to HAVING: HAVING SUM(total) > 3000", "Move it to WHERE as WHERE SUM(total) > 3000", "Filter with WHERE book > 3000 but drop the alias", "ORDER BY book DESC LIMIT 4"],
      answer: 0,
      why: "WHERE runs before SELECT, so the alias does not exist yet — and aggregates do not exist before GROUP BY either. HAVING is the clause that judges groups after the fold: SUM(total) > 3000 keeps exactly the four accounts at 7,262.35, 6,640.56, 4,574.23 and 3,644.56.",
      notes: [
        { choice: 1, why: "Aggregate in WHERE is the same stage violation one level up — SUM does not exist before groups form. The engine rejects it, same as the alias." },
        { choice: 3, why: "LIMIT 4 assumes exactly four accounts clear 3,000 — a coincidence today, a silent lie the moment the book shifts. Thresholds belong in HAVING." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-26",
      prompt: "`SELECT COUNT(CASE WHEN status = 'cancelled' THEN 1 END) FROM orders` — the no-show count, without an ELSE. What does it return?",
      choices: ["7 — rows failing the CASE yield NULL, and COUNT skips NULLs", "103 — COUNT counts every row's CASE output", "0 — the missing ELSE returns 0 for non-cancelled rows", "It errors — CASE inside COUNT needs an ELSE"],
      answer: 0,
      why: "Without ELSE, the CASE yields NULL for every non-cancelled row, and COUNT(expression) counts non-NULLs only: 7. The trap cuts both ways — add ELSE 0 and the same COUNT returns 103, counting the zeros. SUM(CASE …) with an explicit ELSE 0 is the form whose behavior you can reason about at a glance.",
      notes: [
        { choice: 2, why: "That is the ELSE 0 behavior — but there IS no ELSE here. The missing arm produces NULL, not 0, and NULL is exactly what COUNT ignores." },
        { choice: 3, why: "ELSE is optional everywhere in CASE. Its absence is a semantics choice, not a syntax error — which is why this shape slips through review." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-27",
      prompt: "The idle-supply report: listings LEFT JOIN trip lines, then `WHERE o.status = 'delivered'` to count completed trips. Listings with zero lines vanish. Why?",
      choices: [
        "The WHERE filter on the right table's column discards NULL-payload rows — the LEFT JOIN silently became an INNER JOIN",
        "LEFT JOIN cannot preserve unmatched left rows when aggregates are present",
        "The listings never existed — the anti-join is empty by construction",
        "GROUP BY product_id re-adds the missing listings automatically",
      ],
      answer: 0,
      why: "Unmatched listings arrive with NULL line columns; status = 'delivered' is UNKNOWN against NULL, so those rows fail the filter and the idle fleet disappears — on this db the anti-join is empty anyway (all 16 listings booked somewhere), but the query as written could never surface an idle car even if one existed. The fix: move the predicate into the ON clause, where it filters the match, not the survival.",
      notes: [
        { choice: 1, why: "Aggregates have nothing to do with it — the predicate placement alone converts the join. This is the single most common silent-INNER bug in marketplace reporting." },
        { choice: 2, why: "It may be empty on the clean core db — but proving that zero and assuming it are different jobs, and instant-access marketplaces are exactly where an idle listing costs the most." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-28",
      prompt: "Fleet ops wants only the top three rungs of the utilization ladder. Why does `WHERE utilization_rank <= 3` fail on the query that computes `RANK() OVER (ORDER BY SUM(quantity) DESC) AS utilization_rank` in the same SELECT?",
      choices: [
        "Window output is computed in the SELECT stage, after WHERE — stage the ladder in a CTE or derived table, then filter outside",
        "RANK cannot be compared to integers; cast it first",
        "The window needs PARTITION BY to be filterable",
        "WHERE cannot reference aggregate functions at all — use LIMIT 3 instead",
      ],
      answer: 0,
      why: "Logical evaluation order: WHERE runs before SELECT, and windows are SELECT-stage work — the rank does not exist when the filter executes. The fix is staging: CTE for the ladder, outer SELECT for the cut. LIMIT 3 is not equivalent — it takes the first three ROWS, which on ties chops the block arbitrarily.",
      notes: [
        { choice: 3, why: "LIMIT 3 answers a different question — three rows, not rank 3. On the tie-heavy ladder (two 36s, three 30s) it silently decides which tied car keeps its slot." },
        { choice: 1, why: "The comparison is fine — the timing is not. Casting changes nothing about when the window is computed." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-29",
      prompt: "The close's ledger trial balance must land at 181,080 debits against 181,080 credits. Which rounding policy guarantees the reconciliation still foots?",
      choices: [
        "Aggregate in integer cents, convert to dollars once at the presentation edge, and round only what a human reads",
        "ROUND(amount_cents / 100.0, 2) on every row before summing, so each line is clean",
        "Cast to REAL early — floats keep the most precision",
        "Round everything to whole dollars; cents are noise at close scale",
      ],
      answer: 0,
      why: "Rounding mid-pipeline discards precision that the later SUM still needed: per-row rounding can drift the foot by a cent per row, and the payout ledger fails its delta-zero check by construction. Cents are exact integers — keep them intact through every aggregate and convert once at the edge.",
      notes: [
        { choice: 1, why: "Each ROUND is individually harmless and collectively fatal — the drift is invisible per row and decisive across 28 statements. Round at the edge, not en route." },
        { choice: 2, why: "IEEE doubles make 0.1 unrepresentable exactly; money in floats re-introduces the drift the integer cents existed to prevent." },
      ],
      difficulty: "hard",
    },
    {
      id: "getaround-mcq-30",
      prompt: "`SELECT SUM(o.total) FROM orders o JOIN order_items oi ON oi.order_id = o.id` prints 103,244.55 — not the 34,833.28 trip book. What happened and what is the honest fix?",
      choices: [
        "The join fanned 103 trips out to 251 lines, repeating each total once per line — pre-aggregate lines to trip grain, then join",
        "The totals column contains duplicates that DISTINCT must remove",
        "SUM over a joined table is undefined; use AVG and scale",
        "Divide the result by 251/103 to correct the fan-out",
      ],
      answer: 0,
      why: "Every trip with multiple line items contributes its total once per line — 103 rows became 251 and the book tripled. The fix is grain discipline: fold order_items to trip grain in a CTE first (SUM by order_id), then join, so every total appears exactly once. COUNT(DISTINCT o.id) bandages counts; only pre-aggregation fixes sums.",
      notes: [
        { choice: 3, why: "The inflation factor is not uniform — it varies per trip with line count. A global ratio divides the wrong trips by the wrong factor and never reconciles." },
        { choice: 1, why: "DISTINCT collapses genuinely equal totals (two 100.00 trips print once) — a different number, wrong for a different reason." },
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
    {
      id: "cs-getaround-3",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The host-fleet earnings ledger",
      brief:
        "Getaround-flavored brief on the storefront db: the supply team opens the host-fleet ledger every week — how many booked days and how much earnings value each fleet carries — because host concentration is the platform's structural risk. Probed facts: 251 trip lines fold to 498 booked days and a 34,833.28 book across 6 host fleets; the EARNINGS leader is Nordic Gadgets AB (11,130.25 over just 82 booked days) while the DAYS leader is Midwest Hardware Co (109 booked days over 9,294.93) — the fleet that works hardest is not the fleet that earns most, a rate-mix story in one table. Shenzhen Electro (99 days / 3,049.07) and Pacific Textiles (80 days / 2,980.15) round out the 80-plus-day tier the census gates on.",
      ask: "Return each host fleet carrying at least 80 booked days with its trip count, booked days and earnings in dollars to 2 decimals, biggest earnings first.",
      template:
        "SELECT s.name AS fleet,\n       COUNT(DISTINCT oi.order_id) AS trips,\n       SUM(oi.quantity) AS booked_days,\n       ROUND(SUM({1}), 2) AS earnings\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.name\nHAVING SUM(oi.quantity) >= {2}\nORDER BY earnings {3};",
      slots: [
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the earnings fold",
          why: "Booked days times the locked day rate is what a line paid the fleet: SUM over it prints Nordic's 11,130.25. Folding oi.quantity alone would print the day counts wearing a dollars name — 11,130.25 becomes 82.0 — and SUM(oi.unit_price) alone adds rates, not bookings.",
        },
        {
          answer: "80",
          kind: "number",
          label: "the supply-tier gate",
          why: "The gate judges a per-fleet aggregate, so it lives in HAVING after the fold — and 80 is the Pacific Textiles row itself, so the census keeps exactly the four heavy fleets: 82, 109, 99 and 80 booked days. A gate of 100 drops Nordic and Pacific; a gate of 50 lets Alpine (77) and Andes (51) back in.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-earnings-first direction",
          why: "The supply review reads the concentration risk on top — Nordic 11,130.25, Midwest 9,294.93, Shenzhen 3,049.07, Pacific 2,980.15 — which is exactly what exposes the days-versus-earnings split. ASC opens on Pacific and buries the 32%-of-value fleet the memo is about.",
        },
      ],
      distractors: ["AVG", "COUNT", "ASC", "40"],
      walkthrough:
        "Two joins, one fold, one gate. The chain runs trip lines to listings to host fleets — 251 lines each matching exactly one product and one supplier, so no fan-out — and GROUP BY s.name folds them to 6 fleets. SUM(oi.quantity) counts booked days (498 platform-wide), SUM(days × rate) folds earnings, and HAVING SUM(oi.quantity) >= 80 keeps the heavy tier: Nordic 38 trips / 82 days / 11,130.25, Midwest 45 / 109 / 9,294.93, Shenzhen 41 / 99 / 3,049.07, Pacific 35 / 80 / 2,980.15. The read writes itself: Nordic earns 11,130.25 — 32% of the platform book — on fewer days than Midwest, because its lines lock rates around 135.7 per day against Midwest's 85.3; concentration is a rate-mix fact, not a volume fact. The distractors each break differently: AVG in the fold prints per-line averages, COUNT prints row counts as money, 40 drops the gate to a two-fleet world, ASC flips the ledger so the review opens on the smallest earner while the risk sits at the bottom. Chain, fold, gate, order — the host ledger reproduces itself.",
    },
    {
      id: "cs-getaround-4",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The day-rate band census",
      brief:
        "Getaround-flavored brief on the storefront db: the pricing pod re-cuts the day-rate band census every month — trip lines banded by their LISTING's day rate, with line counts, booked days, average locked rates and value per band — because instant access makes the whole shelf visible to every guest at once. Probed facts: list rates run 14.99 to 199.99, and the bands read budget (under 50) 133 lines / 268 booked days / 31.01 average locked rate / 8,227.77, standard (50 to 149.99) 107 lines / 207 days / 107.19 / 22,023.49, premium (150-plus) 11 lines / 23 days / 200.00 / 4,582.02. The budget band turns 53.8% of the platform's booked days and earns 23.6% of the value; a 200-plus flagship arm would print nothing — the shelf has no flagship tier, and the empty band is the finding.",
      ask: "Return each day-rate band with its line count, booked days, average locked rate to 2 decimals, and value in dollars to 2 decimals, cheapest band first.",
      template:
        "SELECT CASE WHEN p.price < {1} THEN 'budget'\n            WHEN p.price < 150 THEN 'standard'\n            ELSE 'premium' END AS band,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS booked_days,\n       ROUND(AVG(oi.unit_price), 2) AS avg_rate,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS value\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY band\nORDER BY avg_rate {2};",
      slots: [
        {
          answer: "50",
          kind: "number",
          noVerify: true,
          label: "the budget ceiling",
          why: "The band edge is the rate card's first published cut: list rates under 50 are the budget shelf — 133 lines turning 268 booked days. Moving the edge to 500 would swallow the whole fleet into one band, and the standard/premium gradient the pricing pod argues about would vanish.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the cheapest-band-first direction",
          why: "The census reads up the rate card: budget 31.01, standard 107.19, premium 200.00 — so the demand story (cheap cars carry the days) sits on top of the money story (dear cars carry the value). DESC inverts the narrative mid-sentence and the deck reads backwards.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Band value prints to 2 decimals — 22,023.49 is the cell the pricing memo quotes. ROUND(…, 0) prints 22,023 and every band value drifts by up to half a dollar against the ledger foot of 34,833.28.",
        },
      ],
      distractors: ["AVG", "SUM", "DESC", "'premium'", "0"],
      walkthrough:
        "One join, one CASE, three bands, one honest empty arm. The join attaches each of the 251 trip lines to its listing's list rate — no fan-out, one listing per line — and the CASE bands them: under 50 is budget, 50 to 149.99 standard, 150-plus premium, with GROUP BY band folding each band's lines. The output reads up the card: budget 133 lines / 268 days / 31.01 / 8,227.77, standard 107 / 207 / 107.19 / 22,023.49, premium 11 / 23 / 200.00 / 4,582.02 — 251 lines, 498 days, 34,833.28, footed by construction. The read: budget cars turn 53.8% of the booked days and earn 23.6% of the value, while 11 premium lines turn 4.6% of the days and 13.2% of the money — instant access puts the whole gradient in front of every guest, so band mix IS demand mix. The empty 200-plus arm never prints because no listing prices there; padding it with a zero row would imply supply that does not exist. The distractors each break differently: AVG and SUM in the rate slots are grammar errors — AVG needs parentheses and SUM is already the fold — DESC tells the story bottom-up, and 'premium' — a string compared against a number — never fires, silently re-banding 240 lines into standard, while precision 0 rounds 22,023.49 to 22,023 and the bands stop footing to the ledger. Edges, order, arms — the census reproduces itself.",
    },
    {
      id: "cs-getaround-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass fate census",
      brief:
        "Getaround-flavored brief on the storefront db: the ops board's fate census gets refreshed with ONE query — total booked, the four stage counts, and the instant-unlock share — because four sequential queries are four ways to drift while the marketplace is calling for its board. Probed facts: 103 trips booked; 52 completed (delivered), 30 on-trip (shipped), 14 unlock-pending (pending), 7 no-show-or-cancelled (cancelled) — the four stages foot to 103 by construction — and 82 trips carry the app-unlock stamp, a 79.6% instant-unlock share over the whole book. The reconciliation identity (52 + 30 + 14 + 7 = 103) is the correctness argument: no trip is counted twice, none is missing, and the 14 pending rows stay in the denominator on purpose.",
      ask: "Return one row: booked trips, completed, on-trip, unlock-pending, no-shows, and the instant-unlock share to 1 decimal — all from a single scan.",
      template:
        "SELECT COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS on_trip,\n       COUNT(*) FILTER (WHERE status = 'pending') AS unlock_pending,\n       COUNT(*) FILTER (WHERE status = {2}) AS no_shows,\n       ROUND(100.0 * COUNT({3}) / COUNT(*), 1) AS unlock_share\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "Completed is 'delivered' — 52 trips whose cycle closed. 'shipped' here would mirror the on-trip column (30) and the funnel reads a success rate of 29.1% instead of 50.5%; 'completed' is not a status literal at all and prints a silent zero in the board's headline column.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show arm",
          why: "No-show-or-cancelled is 'cancelled' — 7 trips, the trust column that prices the no-show fee. Flagging 'pending' would indict the 14 unlock-pending trips — demand that simply has not traveled yet — and the incident count doubles.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the unlock stamp counter",
          why: "COUNT(shipped_at) counts non-NULL stamps only — 82 of 103, the 79.6% share. COUNT(created_at) counts every booking (103 → 100.0%) and COUNT('*')-style constants count rows, so the share would read as if every trip opened instantly — the instant-access promise graded against nothing.",
        },
      ],
      distractors: ["'shipped'", "'created_at'", "'AVG'", "100"],
      walkthrough:
        "One scan, six honest numbers. COUNT(*) counts all 103 booked trips; each FILTER (WHERE …) branch counts its stage inside the same pass — delivered 52, shipped 30, pending 14, cancelled 7 — and the four branches partition the rows, so they foot to booked by construction; the share column folds COUNT(shipped_at) — the 82 stamped unlocks — over COUNT(*) with the 100.0 multiplier forcing real division: 79.6. The identity does the auditing: 52 + 30 + 14 + 7 = 103 means no fate is double-counted and none is missing, and the 14 pending rows stay in the denominator on purpose because committed supply is not free supply. The distractors each break differently: 'shipped' mirrors the on-trip count into two columns and the funnel loses its completed stage; 'created_at' flags nothing (no status equals a timestamp) or counts everything (as the share's numerator → 100.0), both falsifying the instant promise from opposite ends; 'AVG' is not a status and errors inside COUNT; bare 100 keeps integer arithmetic and floors the share to 79.0. One query, one scan, every number reconcilable — the census the board re-prints every Monday.",
    },
    {
      id: "cs-getaround-6",
      tier: "hard",
      topic: "j5",
      universe: "month-close",
      title: "The never-settled payout audit",
      brief:
        "Getaround-flavored brief on the storefront db: before a single host gets a payment-chasing email, payout ops refreshes the never-settled audit — statements with zero settlement legs behind them, billed amounts and standard 30-day terms beside each. Probed facts: 28 statements, 27 payment legs — so exactly one more statement than legs exist — and the anti-join returns 6 statements worth 15,217.00: INV-2025-024 at 4,937.00 (open), INV-2025-026 at 3,562.00 (open), INV-2025-027 at 2,794.00 (open), INV-2025-028 at 1,756.00 (status PAID — the claim that lies), INV-2024-021 at 1,295.00 (open) and INV-2024-018 at 873.00 (open). Every statement carries 30-day terms. The status column is a claim; the payment legs are the ledger of record.",
      ask: "Return each statement with zero settlement legs: number, status, billed amount in dollars, and its term in days, biggest bill first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents / {1} AS billed,\n       CAST(JULIANDAY(i.due_on) - JULIANDAY(i.issued_on) AS INTEGER) AS term_days\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY billed {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements store INTEGER cents; /100.0 is the dollar read that prints 4,937.0 instead of 493,700. The .0 matters — bare 100 keeps integer arithmetic and the audit emails hosts about the wrong book by a hundredfold.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 legless ones a NULL payload for the WHERE to catch. INNER JOIN silently deletes exactly the rows this audit exists to find — the 6 never-settled statements vanish and the report reads clean while 15,217.00 sits uncollected.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join test",
          why: "p.id IS NULL is the anti-join: keep the rows where no leg matched. IS 'paid' or IS 0 match nothing and return an empty report — a clean-looking audit that found nothing because it looked for nothing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "Collections works the biggest exposure first: 4,937.00 on top, 873.00 at the bottom. ASC would chase the smallest balance first and the 4,937.00 statement — half the uncovered book — sits unworked while the queue clears pocket change.",
        },
      ],
      distractors: ["10.0", "INNER", "ASC", "'paid'"],
      walkthrough:
        "An anti-join is a claim check. The LEFT JOIN offers every statement its payment legs — 22 match, 6 arrive with NULL payloads — and WHERE p.id IS NULL keeps exactly the legless six: INV-2025-024 (4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00), INV-2024-021 (1,295.00), INV-2024-018 (873.00) — 15,217.00 uncovered, biggest first. The cents discipline runs underneath: amount_cents / 100.0 at the presentation edge, after every integer has survived intact. And the finding the audit exists for sits in plain sight: INV-2025-028's status reads 'paid' while its legs say zero — status is a claim, payment rows are the ledger, and the follow-up is a billing investigation, not an email. The distractors each break differently: /10.0 prints a tenfold book (49,370.0) and the emails go out wrong; INNER JOIN deletes the six rows and the audit reports a clean book while the money sits out; IS 'paid' in the anti-join test matches nothing and returns an empty result — a report that proves nothing; ASC chases the 873.00 first. Join type, NULL test, direction — the audit reproduces itself.",
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
    { slug: "game-play-analysis-iii", why: "Cumulative booked days per listing across its lifetime — the running-sum fold behind every utilization trend line the supply board re-cuts weekly." },
    { slug: "game-play-analysis-v", why: "Share of accounts whose FIRST trip led to a next-day return — day-1 retention for an instant-access product, a first-event fold with a dated follow-up." },
    { slug: "cohort-retention-matrix", why: "Unlock cohorts held against their later-month activity — the retention matrix that tells supply whether a listing's demand decays or compounds." },
    { slug: "dau-wau-stickiness", why: "Daily actives over weekly actives is the stickiness ratio — for instant access it reads as unlock cadence, and the drill is the two-grain active fold." },
    { slug: "funnel-step-conversion", why: "Booking → unlock → completed with a rate per step — the instant-access funnel in one query, each stage a conditional count with its denominator stated." },
    { slug: "repeat-purchase-rate", why: "Guests who book again are the demand engine — the 2-plus-trips fold that prices remarketing spend, drilled exactly as the market census builds it." },
    { slug: "customer-purchasing-behavior-analysis", why: "Guest behavior segments by spend and cadence — the CASE-band grid trust & pricing share, and the drill is segmenting without dropping the NULLs." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Booked-but-never-unlocked accounts are the funnel's silent leak — the anti-join shape that finds them, and on this db the cohort the unlock-support queue works." },
    { slug: "number-of-times-a-driver-was-a-passenger", why: "Hosts who are also guests — the two-sided marketplace identity check, a double-presence fold that flags accounts playing both roles." },
    { slug: "total-traveled-distance", why: "Days-on-road folded per account is the guest-side utilization mirror — the same SUM-the-quantity discipline the fleet side runs, pointed at demand." },
    { slug: "ratings-histogram", why: "Trust bands over fleet ratings are the histogram the 4.5-plus bench reads from — CASE buckets with the empty bands left honestly visible." },
    { slug: "keep-latest-dedupe", why: "Duplicate unlock events collapse to the newest stamp — ROW_NUMBER keep-latest is the dedupe drill for a platform whose events arrive retried." },
    { slug: "second-most-recent-activity", why: "A listing's second-newest trip is the recency signal repositioning acts on — the nth-row-per-group window drill, ties included." },
    { slug: "median-time-to-convert", why: "Median booking-to-unlock lead beside the 2.98-day mean — the robustness drill that shows whether a few fast unlocks are flattering the average." },
    { slug: "week-over-week-churn", why: "WoW lapses per market keep the demand board honest between month closes — the LAG-delta walk at weekly grain, first row NULL by definition." },
    { slug: "chargeback-rate-ranking", why: "Dispute share ranked by fleet is the trust-and-payments leaderboard — a conditional rate with a stated denominator, ranked and defended like any ladder here." },
  ],
};
