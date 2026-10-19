// Turo — Wave-8 (Task 96), mobility domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Peer-to-peer car sharing: hosts list their own cars, guests book them trip by
// trip, and the platform sits between them on daily rates, delivery fees and
// protection plans. Pool provenance: company-pools.md carries NO Turo section —
// 0 tagged rows — so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu and say so. Case studies run
// on the storefront db (db/custom.db) with probed figures from
// scripts/company-facts.md (probed 2026-10-12), mapped honestly: orders = trips,
// customers = guests, suppliers = fleet-host partners, products = vehicle
// listings (price = daily rate), order_items = daily charge lines (quantity =
// booked days, unit_price = the rate locked per line), shipped_at = the checkout
// stamp (key handover), invoices/payments = the host-payout settlement books
// (INTEGER cents — divide by 100.0). Every case slot is mechanically verified
// against the live db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const turoKit: CompanyKit = {
  id: "turo",
  domainId: "mobility",
  name: "Turo",
  tagline: "Peer-to-peer car sharing, trip by trip",
  accent: "text-pink-300",

  brief: [
    "**Turo** is the peer-to-peer car-sharing marketplace — *hosts list their own cars, guests book them trip by trip* — and every analytics object is the two-sided event between them: a trip priced as a daily rate, checked out with a key handover, and completed or cancelled at term. On this kit's proxy ledger that's 103 trips worth **34,833.28** (average 338.19, spread 25.47 to 1,088.44) across 16 guests, 6 fleet-host partners and 16 vehicle listings, folded from 251 daily charge lines — quantity is booked days, unit_price is the rate each line locked. The fate map is fixed: 52 {emerald:completed} (50.5%), 30 on-trip (29.1%), 14 scheduled (13.6%), 7 {rose:cancelled} (6.8%) — and the habit drilled early is *completed ÷ ALL booked*, never ÷ resolved.",
    "The data org splits into marketplace (demand), {amber:host supply} and a payments pod that owns the settlement books, and all three read the same trip spine at different grains. The checkout funnel is the heartbeat: a trip books at created_at, and shipped_at is stamped the day the guest actually gets the keys — **82 of 103 trips** carry the stamp, averaging **2.98 days** of booking-to-checkout lead with a 2–4 day spread, while the 14 scheduled rows have none yet (a population definition, not a cleanup job). Concentration is the demand-side story: the power guest runs **24 trips and 7,262.35** booked, and 63.5% of the book sits with guests whose lifetime spend crosses 3,000 (71.2% above 2,000). Supply is concentrated too — one fleet-host partner carries 32% of earnings value (11,130.25), and the trust bench at a 4.5-plus host rating is exactly two partners deep.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU runs 45 trips from just 8 guests (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a scheduled trip sit in your base?'*), then into the guest leaderboard where four guests sit tied at 4 trips and rank semantics become a business decision. Late rounds walk the {sky:14-month trip spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL, or open the settlement books where INTEGER cents and a paid-status invoice with zero payout rows behind it (#28, 1,756.00) are waiting. Candidates who state the fate filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Turo section — 0 tagged rows — so the kit curates **thirty-two problems** from the SQL band to this kit's known screen shapes: checkout funnels, two-grain market censuses, tie-heavy guest leaderboards, CASE rate bands and the cents-safe settlement spine — laid out for spaced practice rather than one sitting: a topic a day, revisited until the denominators are reflexes. Then run all six case studies on the live storefront db, each rebuilt with probed figures and audited the way a regulator reply would be: the {emerald:fleet earnings ledger} the supply review opens with, the {rose:trip-fate census} trust & safety reads monthly, the latest-key-handover panel behind the winback calendar, the payout anti-join the payments pod refreshes before a single host email goes out, the above-average trip screen fraud uses for unusually priced trips, and the regional month spine growth walks with LAG deltas. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the checkout funnel refresh. A marketplace analyst opens the trip dashboard before standup: did overnight bookings land, did any guest get a checkout stamp without a host confirmation, does the one-pass fate census reconcile — 52 completed + 30 on-trip + 14 scheduled + 7 cancelled = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If lead time drifts off the **2.98-day** norm — APAC runs fastest at 2.93, LATAM slowest at 3.5 — the handover queue gets pulled before the supply team's weekly read ships.",
    "**11:30 —** Midday is the two-sided read. Growth wants the guest leaderboard with the four-way tie at 4 trips handled honestly — shared rungs, named policy; the supply pod wants the earnings ledger re-cut by vehicle class, top class at **11,744.01** over 97 booked days; a regional lead wants trips per guest beside guest counts (EU 45-from-8 versus US 19-from-2). Utilization gets its own pull: the hardest-worked listing turns 46 booked days on a 60-day calendar while the longest-tail listing sits at 38 of 500. Each ask is a join, a conditional aggregate and one judgment call about fates — and the analyst writes the query twice, *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The payout anti-join refreshes first — **6 never-settled invoices worth 15,217** — before a single host gets a payment-chasing email; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the payout-ops queue; and the anomaly list gets walked line by line: a void-but-settled invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Checkout rate", what: "Trips with a checkout stamp ÷ ALL trips booked: 82 of 103 (79.6%). The top-of-funnel number the demand team reads every Monday — the 14 scheduled rows are 'not yet', never a silent zero." },
    { name: "Booking-to-checkout lead", what: "Booking to key handover (created_at → shipped_at) over checked-out trips only: 2.98-day average, range 2..4. The population definition ships with the number — unstarted trips have no clock and must not dilute it." },
    { name: "Completed-trip rate", what: "Delivered ÷ ALL trips booked: 52 of 103 (50.5%). 'Completed' is a status-filtered conditional count, and the denominator — scheduled and on-trip included — is the whole interview." },
    { name: "Cancellation share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1% worst, EU 6.7%, US 5.3%, LATAM 0. The trust map that drives host-standards reviews and winback calendars." },
    { name: "Trip book (GMV)", what: "Total trip value booked: 34,833.28 across 103 trips, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the rate-architecture story — one 1,088.44 trip outweighs the smallest 42 combined." },
    { name: "Day-lines per trip", what: "Charge lines ÷ trips: 251 lines across 103 trips. Trip length shows up here first — extra days are new charge lines on the same trip, not new trips, so counting lines as trips fans the census." },
    { name: "Guest concentration", what: "Share of the book from guests spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The dependency read that sizes the host-acquisition pod — demand this lopsided is leverage before it is a growth story." },
    { name: "Payout coverage", what: "Tripped versus paid out: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The anti-join payout ops refreshes every close before a single host email goes out." },
  ],

  topics: [
    {
      name: "Checkout-funnel counts",
      why: "Turo's funnel is booking → checkout → completed, and every stage is a conditional count over a status or timestamp. The trap is calling an on-trip checkout 'completed' — 30 versus 52 on this db — and the interviewer's first question is always what the denominator holds.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "game-play-analysis-v"],
    },
    {
      name: "Two-grain trip censuses",
      why: "Trips and guests are different grains of the same join: EU runs 45 trips from just 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and naming which is load and which is coverage — is the habit every census here grades.",
      slugs: ["students-and-examinations", "find-followers-count", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i", "human-traffic-of-stadium", "the-airport-with-the-most-flights", "confirmation-rate", "immediate-food-delivery-ii", "average-selling-price", "queries-quality-and-percentage", "rolling-7d-actives", "dau-wau-stickiness", "week-over-week-churn", "spend-histogram"],
    },
    {
      name: "Joining guests to trips",
      why: "Guests carry region and join date; trips inherit them through joins, and the join type decides who survives. A trip without a guest is corruption; a guest without trips is dormant demand — on this db the anti-join returns a confident zero, and proving the zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-i", "top-travellers", "sellers-with-no-sales", "trips-and-users", "hopper-company-queries-ii", "find-churn-risk-customers"],
    },
    {
      name: "Ranking windows & tie policy",
      why: "Leaderboards here are rank-window reporting with guaranteed ties — the guest ladder runs 24, 17, 14, 13, 5 and then four guests sit tied at 4 trips. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary", "second-most-recent-activity", "the-most-recent-orders-for-each-product", "customers-with-strictly-increasing-purchases", "cohort-retention-matrix", "bikes-last-time-used"],
    },
    {
      name: "Class banding with CASE",
      why: "Vehicle classes and daily-rate bands are CASE-classified with fixed edges: 8 budget listings averaging 32.06 a day, 8 mid-band at 111.5, and a premium 200-plus band that is empty. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the fleet census, and the empty band is a finding, not padding.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "number-of-rich-customers"],
    },
    {
      name: "Lead-time math on timestamps",
      why: "The checkout clock — booking to key handover — is julianday arithmetic over text timestamps: 82 stamped checkouts averaging 2.98 days with a 2–4 day spread. The NULL policy ships with the number, because the 21 stamp-less trips have no clock and must not dilute the average.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "rising-temperature", "sales-by-day-of-the-week", "keep-latest-dedupe", "null-blank-audit"],
    },
    {
      name: "Month spine & LAG walk",
      why: "The 14-month trip spine (2024-01 to 2025-02) is the demand board's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, and the biggest single-month jump is +1,158.21 into August. LAG drives the walk and the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["hopper-company-queries-i", "biggest-window-between-events", "the-change-in-global-rankings", "seasonal-sales-analysis"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — completed under cancelled, this quarter beside last — and EXCEPT answers 'which booked guests never checked out'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["movie-rating", "monthly-transactions-ii", "customers-who-never-order", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets completed, on-trip, scheduled and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "count-the-number-of-experiments", "group-sold-products-by-the-date"],
    },
    {
      name: "Settlement books & cents discipline",
      why: "Completed is not paid out — the settlement tables (28 invoices, 27 payments, INTEGER cents) are where the trip world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "account-balance", "ar-aging-schedule", "duplicate-charge-pairs"],
    },
  ],

  theory: [
    {
      id: "turo-t1",
      q: "Your trip report joins guests to trips. When do you INNER and when do you LEFT — and what silently breaks if you filter a trip column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A value report joins trips to guests: a trip with no guest row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-demand report must be LEFT from guests: the guests with no trips ARE the answer, arriving with NULL trip columns — and on this db that anti-join returns a confident zero, because all 16 guests have booked somewhere. Proving the zero is the analyst's job, not an assumption. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload guest row — the LEFT quietly became an INNER and the dormant cohort vanished. The fix is moving the predicate into ON or an outer query. Two-sided marketplaces make this sharper than most shops: the host side and the guest side are separate survival rules, and one join type for both is wrong for one of them.",
      tag: "joins",
    },
    {
      id: "turo-t2",
      q: "Four guests tie at 4 trips on the demand leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which guest gets the better winback offer. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer guests (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment so the next analyst inherits the decision, not the debate.",
      tag: "windows",
    },
    {
      id: "turo-t3",
      q: "The census shows 103 trips and 16 guests; EU shows 45 trips and 8 guests. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts trip rows after the join — one row per trip, so a guest with 24 trips contributes 24. COUNT(DISTINCT customer_id) folds those rows back to guests — EU's 45 trips collapse to 8. Neither is wrong: trips measure load and booking momentum, guests measure installed base and coverage. The ratio — 5.6 trips per guest in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for the daily charge lines and COUNT(*) silently counts day-lines, not trips — 251 of them. Saying 'one row per what?' for every COUNT in the query is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "turo-t4",
      q: "shipped_at stays NULL until a guest actually checks out. What is your policy for the lead-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only checked-out trips have a lead time, so the report measures booking-to-key-handover for the 82 of 103 trips that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL trips returns the checked-out average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the checked-out subset; the gap between it and COUNT(*) is exactly the 14 scheduled plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead to zero to 'fix' the average — that invents same-day handovers for trips that have not started. A report whose WHERE clause is doing definitional work without saying so is exactly what a Turo reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "turo-t5",
      q: "The growth review wants booked value per region for guests carrying at least fourteen lifetime trips. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards every other fate before any fold, in WHERE; putting it in HAVING is impossible because fates no longer exist once rows are grouped. The fourteen-trip floor is a guest-level fact — HAVING COUNT(*) >= 14 after GROUP BY customer_id; on this db exactly three guests clear it (24, 17 and 14 trips), and putting the floor in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to trips versus to dollars. The strong answer places every filter by asking: is this a fact about one trip, or about a guest?",
      tag: "pipeline",
    },
    {
      id: "turo-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 trips always produce a mean (338.19 here, against a 25.47 to 1,088.44 spread — most of the book sits under it). On filtered staging tables — one region, one fate, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each trip to ITS guest's average) re-runs per outer row and answers a different question at a different cost — for Turo that is the 'is this trip unusually expensive for THIS guest' read, which is a real fraud-and-quality screen. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "turo-t7",
      q: "The demand trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the seasonality story becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when trips land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk itself tells the demand story: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August — and the delta column is where 'which month, exactly' arguments get settled.",
      tag: "dates",
    },
    {
      id: "turo-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent payout. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or host payouts do not ship.",
      tag: "quality",
    },
    {
      id: "turo-t9",
      q: "The ops board wants completed, on-trip, scheduled and cancelled in ONE pass. Walk me through both shapes — FILTER (WHERE …) and SUM(CASE …) — and when you reach for each.",
      a: "FILTER (WHERE …) attaches its own predicate per aggregate, so one scan emits 52, 30, 14 and 7 beside the 103 total — the one-pass census that reconciles by construction, four chances to drift collapsed into zero. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin: same numbers, works on engines without FILTER, and doubles as a value fold when the board wants completed BOOK (SUM(CASE … THEN total ELSE 0 END)) rather than counts. I write FILTER when the audience is internal and the engine is known; I write SUM(CASE) when the query might travel to another dialect. What I never do is four sequential queries — four scans are four snapshots and a reconciliation argument waiting to happen.",
      tag: "aggregation",
    },
    {
      id: "turo-t10",
      q: "Trips join to vehicle listings, listings join to the fleet-host partner. Where does that three-table chain fan out, and how do you keep the partner census honest?",
      a: "The fan-out lives at the charge-line grain: one trip carries several order_items rows, so after trips → listings → partners the same trip appears once per line, and every COUNT(*) counts lines, not trips — 251 against 103. The honest census pins the grain per column: COUNT(DISTINCT o.id) for trips served, SUM(oi.quantity) for booked days — a line-grain fact that is SUPPOSED to fan out — and ROUND(SUM(oi.quantity * oi.unit_price), 2) for earnings, which also lives happily at line grain. The trap is mixing grains in one column without saying so: COUNT(*) wearing a trips name is how a partner audit reads 2.4× busier overnight. One row per what — asked of every column before the query ships.",
      tag: "joins",
    },
    {
      id: "turo-t11",
      q: "Give me each guest's LATEST stamped trip — full row, not just the timestamp. Why is MAX-plus-join the fragile version?",
      a: "The window version stages ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY shipped_at DESC) and keeps rn = 1: one full row per guest, 16 rows on this db, each the newest stamped trip its guest owns — with the tie policy explicit (shipped_at DESC, then id, if two stamps ever collide on the same second). MAX-plus-join finds the latest timestamp per guest but not the row around it, so you join back on trip_id AND the max stamp — a second join condition that silently breaks the day two trips share a stamp. The window keeps the payload attached by construction. That panel is the recency read winback runs: Isabella Rossi's latest is trip #98 stamped 2025-02-25, still on-trip.",
      tag: "windows",
    },
    {
      id: "turo-t12",
      q: "EXISTS or IN for the never-cancelled-guest list — and what does NULL do to the IN version?",
      a: "IN materializes the subquery into a list and compares every outer row against it; x NOT IN (…) is UNKNOWN the moment one NULL enters the list, so the whole result silently empties while looking valid. EXISTS is a per-row probe — the engine checks whether even one matching row exists and stops — so NULLs in the probed columns are just 'no match', never poison. For the winback list I write NOT EXISTS with the correlation spelled out (t.customer_id = g.id AND t.status = 'cancelled'); on the clean core db the two agree, and on the staging tables where NULLs actually live, only one of them still returns rows. The rule: IN for value membership over NULL-free columns, EXISTS for existence over anything a human can leave blank.",
      tag: "subqueries",
    },
    {
      id: "turo-t13",
      q: "When does a query need a CTE rather than an inline derived table? Give me the Turo example you actually hit.",
      a: "Whenever the staged grain gets referenced more than once or needs a name the review can read. The concentration read is the honest example: a CTE folds 103 trips into a per-guest lifetime book, and the outer query filters it against the 3,000 floor AND computes each guest's share of the whole — two references to one fold. Inline, that is a derived table pasted twice or a nest three parentheses deep; as a CTE it reads like the memo — guest_book, then the share column, then the floor. CTEs also carry the definition: the analyst who inherits the query reads the name and knows the population without re-deriving it. The cost is nil at this db's scale; the readability is the point, and review here grades readability as a correctness feature.",
      tag: "ctes",
    },
    {
      id: "turo-t14",
      q: "'Checked out but never completed' — EXCEPT or LEFT JOIN + IS NULL? Same cohort, different machinery. When do you reach for each?",
      a: "EXCEPT reads like the business sentence — checked-out set minus completed set — and dedupes to distinct guests automatically: exactly one guest on this db, Liam O'Brien, checked out with no completed trip. LEFT JOIN + IS NULL does the same job while carrying extra columns along, which is what you want when the deliverable is a LIST with details, not a bare id set. The costs differ: EXCEPT sorts both sets to dedupe; the anti-join probes per row and scales past it on indexed keys. The trap both share: cohort membership is per-whole-entity, so the single-table shortcut (WHERE shipped_at IS NOT NULL AND status <> 'delivered') lies — a guest with one delivered and one on-trip trip qualifies on the on-trip row. Cohort questions are set questions; row filters answer row questions.",
      tag: "set-ops",
    },
    {
      id: "turo-t15",
      q: "Where do you allow COALESCE on the payout board, and where does it lie?",
      a: "Allowed, and required, on empty folds: SUM over an invoice with no payment rows is NULL, so COALESCE(SUM(p.amount_cents), 0) turns the six never-settled invoices (15,217) into real zeros the dunning board can read — the population stays and the arithmetic works. It lies in two places. Lead time: IFNULL(julianday(shipped_at) - julianday(created_at), 0) invents same-day handovers for the 21 stamp-less trips and drags the 2.98-day average toward fiction — the honest version filters to stamped rows and says so in the title. Status: COALESCE on the status column papers over the claim-versus-ledger gap that produced invoice #28 — marked paid, zero settlement rows. COALESCE is for arithmetic on empty sets, never for populations and never for claims.",
      tag: "nulls",
    },
    {
      id: "turo-t16",
      q: "Lead time in fractional days on TEXT timestamps — how does julianday handle time-of-day, and how do you cut a week without losing its last night?",
      a: "julianday converts a stamp like '2024-07-15 10:22:00' to a day number with the time-of-day riding as the fraction, so differences are true elapsed days and AVG over them is meaningful — 2.98 days across the 82 stamped checkouts, spread 2 to 4. The NULL policy ships with the number: 14 scheduled and 7 cancelled trips carry no stamp, have no clock, and are excluded by an explicit WHERE shipped_at IS NOT NULL — not silently by AVG's NULL-skipping. Window cuts are half-open: created_at >= '2024-07-01' AND created_at < '2024-07-08' keeps every booking through 23:59:59 on the 7th, where BETWEEN '…-07-01' AND '…-07-07' drops the last night the moment a time component exists. TEXT timestamps sort chronologically, which is the one free lunch here.",
      tag: "dates",
    },
    {
      id: "turo-t17",
      q: "A guest appears twice in the roster — 'Alice.Chen@MAIL.com' and 'alice.chen@mail.com'. Walk me through the dedupe you write before any census.",
      a: "First measure the damage: GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1 names the collided keys — on this db the roster is clean, and proving that is part of the job. Then the policy: the canonical key is LOWER(TRIM(email)) written INTO the pipeline, not re-derived per query — one definition, everywhere. The census still folds on customer id (the surrogate key stays the truth; the email is only the match key), and the duplicate rows get a merge ticket rather than a DELETE — two ids each carrying trips means a silent id merge fans or drops bookings. What I refuse is deduping at read time in fifteen dashboards: fifteen definitions of 'the same guest' is how the guest count becomes a matter of taste.",
      tag: "quality",
    },
    {
      id: "turo-t18",
      q: "251 day-lines across 103 trips. Why does every total against the charge-line table need a grain check before it ships?",
      a: "Because the line table is the many side twice over: extra days are new lines on the same trip, so joining trips to lines fans 103 out to 251 and every aggregate silently changes population. SUM(oi.quantity * oi.unit_price) is line-grain by design — booked days times the locked rate — and reconciles upward to the 34,833.28 book. But COUNT(*) after that join counts lines (251), AVG(oi.quantity) averages days per LINE and tilts toward multi-day trips, and a 'trips served' column needs COUNT(DISTINCT o.id) to fold back. The check is one question per column — one row per what — and the answer ships beside the number: 251 lines, 103 trips, 2.4 lines per trip. A total that cannot state its grain is a rumor with a decimal point.",
      tag: "aggregation",
    },
    {
      id: "turo-t19",
      q: "The settlement books carry INTEGER cents. What breaks with /100 instead of /100.0, and where has that actually cost money?",
      a: "INTEGER divided by INTEGER is integer division: 15,217 cents / 100 prints 152, not 152.17 — and on per-line reads every odd-cent payout truncates down, which is real money gone one cent at a time and a trial balance that stops reconciling at exactly the odd cents. The house rule is amount_cents / 100.0 — the .0 forces real arithmetic — and ROUND(…, 2) for the print. The ledger's own anomalies make the point: void-but-settled #11 at 925.00 and paid-status-with-no-rows #28 at 1,756.00 both print as whole dollars today, so a /100 read LOOKS fine until a 1,756.25 invoice ships and prints 1,756. The close's defense is mechanical: reconcile the cents column, not the dollars column.",
      tag: "numbers",
    },
    {
      id: "turo-t20",
      q: "Each region's share of the trip book, in one pass beside the regional sums — how?",
      a: "The percent-of-total idiom: ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) — the inner SUM is the group aggregate, the outer SUM over () re-aggregates every group's sum into the grand total and stamps it on each row, so the division is region-over-book inside one scan. On this db the full-book shares read EU 43.3% (15,089.23), APAC 33.3% (11,605.45), US 20.9% (7,286.16), LATAM 2.4% (852.44) — the concentration map in one pass. The 100.0 multiplier sits before the division or every share truncates to zero. The alternative — a separate grand-total query joined back — is two scans and a join you do not need, and it is the same idiom behind the 63.5% concentration read.",
      tag: "windows",
    },
    {
      id: "turo-t21",
      q: "GROUP BY c.id or GROUP BY c.name — does it matter when two guests could share a name?",
      a: "GROUP BY c.id folds on the surrogate key — one row per guest even when two guests share a name. GROUP BY c.name merges them into one row and their books add together: a fictional guest with a doubled book and a lifetime value nobody can act on. On this db all 16 guest names are distinct, so the two fold keys agree today — and the GROUP BY name query is a landmine for the day the roster doubles. The habit: fold on the id, display the name, and let the join carry it — SELECT c.name … GROUP BY o.customer_id. The interviewer's version of the question is 'what happens when the name is not unique', and the honest answer is 'nothing, because I never grouped on it'.",
      tag: "groupby",
    },
    {
      id: "turo-t22",
      q: "City names arrive as 'São Paulo', 'SAO PAULO' and 'sao paulo' from three apps. What is your normalization key for the city census?",
      a: "One canonical form written in the pipeline: TRIM plus UPPER (or LOWER) at ingest, so every reader downstream folds the same key — the census is GROUP BY normalized_city, never raw city. Diacritics are the trap: 'São' and 'SAO' differ beyond case, so if all three spellings must collide, the key needs a transliteration step — a small mapping table beats clever string surgery because it is auditable and reversible. What I refuse is normalizing in fifteen dashboards independently, which is how one team's city count reads 6 and another's 4. The hygiene check rides along: GROUP BY the normalized key HAVING COUNT(DISTINCT raw_spelling) > 1 names every collision the pipeline missed.",
      tag: "strings",
    },
    {
      id: "turo-t23",
      q: "The morning dashboard filters region and status on a trips table heading to millions of rows. What index do you propose, and what does EXPLAIN tell you before and after?",
      a: "A composite index on (region, status) — both predicates are equalities and the column order follows the query, so the engine seeks straight to the delivered slice instead of scanning every trip. Before: EXPLAIN QUERY PLAN prints SCAN (a full table read whose cost grows with every booking). After: SEARCH … USING INDEX — the plan literally changes shape, which is the artifact I bring to the schema review, not a hunch. Two caveats I say out loud: the index costs write amplification on a booking-heavy table, so it earns its keep only when the read runs this often, and the filter must stay sargable — wrapping the indexed column in SUBSTR or CAST disables the seek and puts you back on SCAN.",
      tag: "performance",
    },
    {
      id: "turo-t24",
      q: "The CEO reads '50.5% completion' on the slide. Defend that denominator in one sentence — and name the two wrong ones you refuse.",
      a: "The sentence: completed trips divided by ALL booked trips — 52 of 103 — because the metric's job is to say what share of everything guests booked actually ran to term, and the 14 scheduled and 7 cancelled rows are part of that everything. Wrong denominator one: resolved trips (52 ÷ 95 = 54.7%) — it deletes the open book and reads rosier for no operational reason. Wrong denominator two: checked-out trips (52 ÷ 82 = 63.4%) — that is a completion-of-started rate, a different metric with a real use, but wearing this one's name on this slide. Every rate here ships with its population in the title; a number without its denominator is a rumor with a percent sign.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "turo-mcq-1",
      prompt: "A trip row's status reads 'delivered'. In this kit's Turo fate map, what happened?",
      choices: [
        "Completed — the trip ran to term and counts as kept",
        "On-trip — checked out, running, not yet complete",
        "Cancelled — by guest or host before term",
        "Scheduled — checkout pending, no stamp yet",
      ],
      answer: 0,
      why: "The fate map is fixed: delivered = completed (52 of 103 trips, 50.5%). It is the only status where the trip has actually run to term.",
      notes: [
        { choice: 1, why: "On-trip is 'shipped' — 30 trips with keys handed over but not at term end. Calling them completed inflates the kept rate before a single trip finishes." },
        { choice: 3, why: "Scheduled is 'pending' — 14 trips with no checkout stamp yet. Pending is not churn and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-2",
      prompt: "Checkout rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 checked out, 14 scheduled and 7 cancelled of 103 booked.",
      choices: [
        "Checked-out + cancelled only (82/89 = 92.1%)",
        "All trips booked (82/103 = 79.6%)",
        "Completed trips only (52/82)",
        "Distinct guests (82/16)",
      ],
      answer: 1,
      why: "The house definition: checked out ÷ ALL trips booked — scheduled handovers stay in the denominator because 'not yet checked out' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 scheduled inflates the rate to 92.1% by deleting the population still awaiting handover — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, shipped_at is key handover. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-3",
      prompt: "EU carries 45 trips from 8 guests. Which column pair reports both grains in one row?",
      choices: [
        "COUNT(*) and COUNT(DISTINCT customer_id)",
        "COUNT(*) and COUNT(customer_id)",
        "SUM(total) and COUNT(*)",
        "COUNT(DISTINCT region) and COUNT(*)",
      ],
      answer: 0,
      why: "COUNT(*) counts trip rows (45); COUNT(DISTINCT customer_id) folds repeats back to guests (8). The gap between them — 5.6 trips per guest — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every trip has a guest. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not guests — a third grain nobody asked for. The census is trips AND guests." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: [
        "It rounds the result to a percentage",
        "It promotes the division to real arithmetic before integer truncation",
        "It filters to cancelled trips only",
        "It is cosmetic — moving it after the division changes nothing",
      ],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the trust map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-5",
      prompt: "Keep only guests carrying at least 14 lifetime trips. Where does the threshold live?",
      choices: [
        "WHERE COUNT(*) >= 14, before GROUP BY",
        "GROUP BY customer_id HAVING COUNT(*) >= 14",
        "WHERE trips >= 14 on the raw table",
        "HAVING before GROUP BY, wherever it fits",
      ],
      answer: 1,
      why: "A trip-count floor is a guest-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly three guests clear 14 — the 24, 17 and 14-trip regulars.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'trips' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-6",
      prompt: "The guest ladder runs 24, 17, 14, 13, 5 trips, then FOUR guests tied at 4. Under RANK, what rank do the two 3-trip guests carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-trip guests share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: [
        "AVG silently skipped the 21 NULL-lead rows — same number, 82-row population, unnamed",
        "NULLs were counted as zero days and dragged the average down",
        "SQLite errored on the NULL arithmetic and returned the last good value",
        "The scheduled trips double-counted their booking day",
      ],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the checked-out-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 trips.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-8",
      prompt: "A winback staging list uses guest_id NOT IN (SELECT customer_id FROM trips WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: [
        "The two tables genuinely share no ids — the zero is correct",
        "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties",
        "NOT IN cannot take a subquery; it needs a literal list",
        "The outer query needs DISTINCT before the comparison works",
      ],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the winback list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every trip carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-9",
      prompt: "A board stack puts completed trips beside cancelled trips in one layout, built with UNION. A reviewer says one guest's row vanished. Diagnosis?",
      choices: [
        "UNION ALL is only a performance choice — the results would be identical",
        "The branches forgot the distinguishing column, so two identical rows (same guest, same counts) collapsed — UNION dedups whole rows silently",
        "UNION truncates the stack to the first branch's row count",
        "UNION cannot stack two SELECTs over the same table",
      ],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same guest, same counts, no region or branch label — collapse into one, and the board loses a guest with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-10",
      prompt: "A dashboard walks booked trip value trip by trip: SUM(total) OVER (ORDER BY booked_at). Two trips share a booked_at second, and the cumulative 'jumps two trips at once'. What is happening?",
      choices: [
        "The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk",
        "Rounding accumulated on the tied rows and doubled the step",
        "LAG should be used instead of SUM for running totals",
        "The frame must extend to UNBOUNDED FOLLOWING to absorb ties",
      ],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on booked_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at trip grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-11",
      prompt: "The ops board wants all four fate counts — completed, on-trip, scheduled, cancelled — from ONE scan of the trips table. Which expression reads the completed column?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(status = 'delivered')",
        "COUNT(*) WHERE status = 'delivered'",
        "SUM(status) FILTER (WHERE 'delivered')",
      ],
      answer: 0,
      why: "FILTER (WHERE …) attaches a per-aggregate predicate, so one pass emits 52, 30, 14 and 7 side by side — the census that reconciles to 103 by construction. The other shapes either count everything or don't parse.",
      notes: [
        { choice: 1, why: "COUNT(status = 'delivered') counts non-NULL values of the boolean — and a boolean is 0 or 1, never NULL — so all 103 rows count. The predicate belongs inside FILTER's WHERE, not in the value expression." },
        { choice: 2, why: "There is no per-aggregate WHERE — that clause filters rows before grouping, which would delete the other three fates and make the one-pass census impossible." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-12",
      prompt: "The supply review wants each vehicle class's listing names folded into one readable cell per class. Which aggregate builds it?",
      choices: [
        "GROUP_CONCAT(p.name)",
        "CONCAT(p.name)",
        "SUM(p.name)",
        "GROUP_CONCAT(DISTINCT p.category)",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds a group's values into one comma-separated cell — 16 listings collapse into 7 class rows with a readable roster per class. It is the one aggregate in the pool that returns text, which is why board packets love it.",
      notes: [
        { choice: 1, why: "CONCAT joins its arguments row by row — no group fold — so you get 16 rows of single names, not one cell per class." },
        { choice: 2, why: "SUM is numeric-only and errors on text. The fold you want is concatenation, not addition — and folding the category over itself would just print the class name in every cell." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-13",
      prompt: "Trust & safety wants guests who have CHECKED OUT a trip (stamp present) but have never COMPLETED one. On this db the list is exactly one guest. Which query returns it?",
      choices: [
        "SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL EXCEPT SELECT customer_id FROM orders WHERE status = 'delivered'",
        "… INTERSECT SELECT customer_id FROM orders WHERE status = 'delivered'",
        "… UNION SELECT customer_id FROM orders WHERE status = 'delivered'",
        "SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL AND status <> 'delivered'",
      ],
      answer: 0,
      why: "EXCEPT keeps set-A rows absent from set B — checked-out guests minus completed guests — and on this db the answer is one guest (Liam O'Brien). The set algebra matches the business sentence: A but not B.",
      notes: [
        { choice: 3, why: "The single-table version only checks that THIS row isn't delivered — a guest with one delivered and one on-trip trip has both kinds of rows and slips through on the on-trip row. Set algebra works on whole memberships; row filters don't." },
        { choice: 1, why: "INTERSECT answers the opposite cohort — guests who did both — which is most of the 16 checked-out guests here." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-14",
      prompt: "The payout board LEFT JOINs payments to invoices; the 6 never-settled invoices show a NULL settled-dollars cell. The stakeholder wants 0.00. Which is the honest fix?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0) / 100.0",
        "Filter them out: WHERE settled IS NOT NULL",
        "Update the invoice status to 'settled' so the join matches",
        "CAST(NULL AS REAL) after the join",
      ],
      answer: 0,
      why: "SUM over no payment rows is NULL, so the COALESCE guard turns the empty fold into a real zero before the cents divide — the dunning rows stay visible with a 0.00. Population preserved, arithmetic working.",
      notes: [
        { choice: 1, why: "Deleting the six rows hides exactly the population payout ops exists to chase — 15,217 of exposure vanishes from the board and the close looks clean." },
        { choice: 2, why: "The status column is a claim, not the ledger of record — rewriting statuses to make a join match is precisely how a paid-with-no-payments anomaly like #28 gets born." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-15",
      prompt: "The quarterly memo cuts Q3 2024 — every booking from July 1 through the last night of September. Which WHERE keeps the full quarter?",
      choices: [
        "created_at >= '2024-07-01' AND created_at < '2024-10-01'",
        "created_at BETWEEN '2024-07-01' AND '2024-09-30'",
        "YEAR(created_at) = 2024 AND MONTH(created_at) BETWEEN 7 AND 9",
        "SUBSTR(created_at, 6, 2) IN ('07', '08', '09')",
      ],
      answer: 0,
      why: "Half-open intervals are the house rule: the exclusive upper bound '2024-10-01' swallows every timestamp on Sep 30 including 23:59:59, which BETWEEN '…-09-30' drops the moment a time-of-day rides on the date. On TEXT timestamps the string comparison makes the half-open form exact.",
      notes: [
        { choice: 2, why: "YEAR() and MONTH() are MySQL habits — SQLite has neither, so the query fails outright; the portables are STRFTIME and SUBSTR." },
        { choice: 3, why: "SUBSTR(created_at, 6, 2) does isolate the month digits — but pairs with no year guard, so July 2025 sneaks into a Q3-2024 cut the moment the log crosses a year." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-16",
      prompt: "Checkouts stamp TEXT timestamps like '2024-07-15 10:22:00'. Why is lead time julianday(shipped_at) - julianday(created_at) and not shipped_at - created_at?",
      choices: [
        "julianday converts each stamp to a fractional day number, so the difference is true elapsed days; bare TEXT subtraction does string arithmetic and errors or returns nonsense",
        "julianday rounds to whole days, which is what the report wants",
        "TEXT subtraction works but is slower, so julianday is only a performance choice",
        "julianday ignores the time-of-day component, which cleans the data",
      ],
      answer: 0,
      why: "julianday turns '2024-07-15 10:22:00' into a real number with the time-of-day carried as the fraction, so subtraction yields elapsed days that average correctly — 2.98 across the 82 stamped checkouts. TEXT minus TEXT is not arithmetic; the engine errors or coerces to something meaningless.",
      notes: [
        { choice: 3, why: "Backwards — julianday PRESERVES time-of-day as the fraction; that is the point. Rounding to whole days would flatten the 2–4 day spread into noise." },
        { choice: 2, why: "There is no working TEXT subtraction to speed up. The alternative isn't slower, it's broken." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-17",
      prompt: "A teammate computes 'average trip length' as AVG(oi.quantity) over order_items joined to trips — 251 day-lines across 103 trips. What does the figure actually average?",
      choices: [
        "Day-lines, not trips — a six-day trip contributes six rows, so multi-day trips dominate and the figure is not a per-trip average",
        "Trips — the join is 1:1 so the mean is honest",
        "Revenue — quantity carries the rate",
        "Nothing — the query errors on the join",
      ],
      answer: 0,
      why: "Extra days are new charge lines on the same trip, so the join fans 103 trips out to 251 rows and AVG weights every line equally — the per-trip read needs a GROUP BY trip first, or the line count printed beside it. Grain before average, every time.",
      notes: [
        { choice: 1, why: "251 across 103 is a 2.4× fan-out — the one-to-one assumption is exactly what the line-item table exists to break." },
        { choice: 2, why: "unit_price carries the rate; quantity is booked days. Neither rescues an average taken at the wrong grain." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-18",
      prompt: "Fraud wants trips priced above THEIR GUEST's average trip value. Which shape is correct?",
      choices: [
        "WHERE o.total > (SELECT AVG(t.total) FROM orders t WHERE t.customer_id = o.customer_id)",
        "WHERE o.total > (SELECT AVG(total) FROM orders)",
        "GROUP BY customer_id HAVING o.total > AVG(total)",
        "WHERE o.total > AVG(o.total) OVER ()",
      ],
      answer: 0,
      why: "The comparison is per-guest, so the subquery must be correlated — the inner WHERE re-runs per outer row and returns THAT guest's mean. The uncorrelated version compares every trip to the platform mean (338.19) — a different screen that flags the 42 above-average trips, not per-guest outliers.",
      notes: [
        { choice: 2, why: "HAVING judges groups, not rows — once grouped by guest there is no single o.total to compare, and the engine rejects the reference." },
        { choice: 3, why: "AVG(total) OVER () is the platform mean stamped on every row — the same wrong population as choice 1, wearing window syntax." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-19",
      prompt: "Rank guests by trip count, then keep ranks 1–3. Why does `WHERE utilization_rank <= 3` fail inside the same SELECT that computes the rank?",
      choices: [
        "Window output is computed after WHERE — stage the ranking in a CTE (or derived table) and filter in the outer query",
        "Rank columns need an outer ORDER BY before they can be filtered",
        "WHERE cannot compare numbers to column aliases",
        "It doesn't fail — the filter just runs before the rank and returns everything",
      ],
      answer: 0,
      why: "The logical pipeline evaluates WHERE before the SELECT list, so the window's rank does not exist yet at filter time. The staging move — rank inside a CTE, filter outside — is the standard two-step, and it is why the kit's leaderboard cases carry a WITH.",
      notes: [
        { choice: 3, why: "It fails outright — 'misuse of window function' or an unknown-column error depending on the engine. Never a silent everything." },
        { choice: 2, why: "WHERE happily compares to aliases in engines that allow it — the failure here is ordering, not type. The alias exists only after the SELECT list is evaluated." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-20",
      prompt: "The concentration read: each region's share of the 34,833.28 book, computed in one pass beside the regional sums. Which expression divides each region's booked value by the whole book?",
      choices: [
        "ROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1)",
        "ROUND(100.0 * SUM(o.total) / COUNT(*), 1)",
        "ROUND(100.0 * SUM(o.total) / AVG(SUM(o.total)), 1)",
        "ROUND(100.0 * SUM(o.total) / MAX(SUM(o.total)) OVER (), 1)",
      ],
      answer: 0,
      why: "SUM(SUM(o.total)) OVER () nests the group sum inside a window over all groups — the grand total rides on every row, so the division is region over book. EU reads 43.3%, APAC 33.3%, US 20.9%, LATAM 2.4% in one pass, and the 100.0 sits before the division to force real arithmetic.",
      notes: [
        { choice: 1, why: "Dividing dollars by COUNT(*) divides by trips — a per-trip dollar figure, not a share. EU would print a made-up 349.5 and the board would quote it." },
        { choice: 3, why: "Dividing by the MAX region's total makes the biggest region read 100% and everyone else a fraction OF THE LEADER — a dominance ratio wearing a share's name." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-21",
      prompt: "The winback staging list needs guests with NO cancelled trips. Which shape is NULL-safe by construction?",
      choices: [
        "WHERE NOT EXISTS (SELECT 1 FROM orders t WHERE t.customer_id = g.id AND t.status = 'cancelled')",
        "WHERE g.id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled')",
        "WHERE g.id NOT IN (SELECT COALESCE(customer_id, 0) FROM orders WHERE status = 'cancelled')",
        "LEFT JOIN cancelled trips, then WHERE t.customer_id IS NULL — with the LEFT written as INNER by accident",
      ],
      answer: 0,
      why: "NOT EXISTS is a per-row probe — it never materializes the subquery into a list, so a NULL customer_id anywhere cannot poison the comparison the way NOT IN does, where one NULL makes every row UNKNOWN and the winback list silently empties.",
      notes: [
        { choice: 2, why: "The COALESCE guard does repair NOT IN — but it is a patch you must remember to write on every staging table. EXISTS is correct without ceremony, which is why the house style prefers it for existence tests." },
        { choice: 3, why: "An INNER anti-join is a contradiction — the join deletes the very rows the IS NULL test is looking for, and the list empties while the query compiles clean." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-22",
      prompt: "An intern's first query: SELECT DISTINCT region FROM customers. What comes back, and why is it not a census?",
      choices: [
        "Four rows — the distinct region values, with no counts, no book, no guests attached",
        "Sixteen rows — one per guest",
        "One row — the single most common region",
        "An error — DISTINCT needs an aggregate",
      ],
      answer: 0,
      why: "DISTINCT dedupes the projection: EU, APAC, US, LATAM, one row each, nothing else. It is the vocabulary move before the census — the census adds COUNT(*) and COUNT(DISTINCT customer_id) beside the distinct values.",
      notes: [
        { choice: 1, why: "That is SELECT region without DISTINCT. The dedupe is the entire job here." },
        { choice: 2, why: "The most common region needs GROUP BY region ORDER BY COUNT(*) DESC LIMIT 1 — a fold, not a projection." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-23",
      prompt: "'Top three guests by trips.' The ladder runs 24, 17, 14, 13, 5, then four guests tied at 4. Which cut is defensible when the read ships to the growth board?",
      choices: [
        "RANK() OVER (ORDER BY COUNT(*) DESC) and keep rank <= 3 — ties share a rung, so the boundary is a named policy, not a row count",
        "ORDER BY COUNT(*) DESC LIMIT 3",
        "LIMIT 3 with a code comment saying ties were ignored",
        "FETCH FIRST 3 ROWS WITH TIES",
      ],
      answer: 0,
      why: "Today the third/fourth boundary is clean (14 vs 13), so LIMIT 3 happens to work — but the ladder's tie structure is a guarantee, not an accident, and the day a tie straddles the cut, LIMIT splits it silently. RANK with an explicit threshold is a policy the next analyst inherits; LIMIT is a row count that inherits nothing.",
      notes: [
        { choice: 3, why: "FETCH FIRST … WITH TIES is standard SQL that SQLite never implemented — it errors here. And the four-way tie at 4 sits nowhere near rank 3 today; the policy is about the ladder's shape, not this week's data." },
        { choice: 2, why: "A comment documents the flaw, it doesn't fix it. The board's question is who is top-three, and a tie at the boundary means the question itself needs the rank policy to answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-24",
      prompt: "The settlement books carry INTEGER cents — a payout invoice reads 175600. Which expression prints 1,756.00 dollars?",
      choices: [
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents / 100",
        "ROUND(amount_cents, 2)",
        "amount_cents — the column is already dollars",
      ],
      answer: 0,
      why: "The .0 divisor forces real division — 175600 / 100.0 = 1756.0 — and ROUND(…, 2) fixes the print. INTEGER / INTEGER is integer division, and the missing .0 is how cents quietly vanish on every odd-cent payout.",
      notes: [
        { choice: 2, why: "ROUND(175600, 2) rounds the CENTS value to two decimals — a no-op. The unit conversion has to happen before the rounding." },
        { choice: 3, why: "The column name says cents and the header says dollars — shipping raw cents is how a 1,756.00 print becomes 175,600 on the host's payout screen." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-25",
      prompt: "Trip photos arrive as event rows — checkin, checkout, damage scan — many per trip. The image pipeline wants the LATEST event per trip, full row. Which shape?",
      choices: [
        "ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY captured_at DESC), keep rn = 1",
        "SELECT trip_id, MAX(captured_at) FROM trip_events GROUP BY trip_id",
        "ORDER BY captured_at DESC LIMIT 1",
        "FIRST_VALUE(captured_at) OVER (PARTITION BY trip_id ORDER BY captured_at)",
      ],
      answer: 0,
      why: "ROW_NUMBER numbers events newest-first within each trip, and rn = 1 keeps exactly the latest full row per trip. MAX-plus-GROUP BY returns the latest timestamp but not the row around it — and the pipeline needs the event payload, not just its stamp.",
      notes: [
        { choice: 2, why: "One global row — the newest event in the whole table. The per-trip PARTITION is the entire requirement." },
        { choice: 3, why: "FIRST_VALUE without a frame spec still orders the partition, but it yields a column, not rows — you still need the ROW_NUMBER-and-filter (or QUALIFY, which SQLite lacks) to reduce to one row per trip." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-26",
      prompt: "Fraud screens trips where guest and host sit in the same city. Trips carry guest_id; listings carry host_id — both reference the users table. Which join shape pairs the two roles?",
      choices: [
        "Join users twice under two aliases: JOIN users g ON g.id = t.guest_id JOIN users h ON h.id = l.host_id, then compare g.city = h.city",
        "JOIN users ON users.id = t.guest_id AND users.id = l.host_id",
        "UNION the guests and hosts, then GROUP BY city",
        "CROSS JOIN users and filter DISTINCT",
      ],
      answer: 0,
      why: "One table playing two roles needs two aliases — each join binds one role, and the comparison happens across the pair. A single join cannot bind the same table to both ids at once, and this double-role pattern is the self-join habit every marketplace fraud screen leans on.",
      notes: [
        { choice: 1, why: "One users row cannot equal two different ids — the AND collapses the join to a near-impossible intersection and the screen returns a confident zero." },
        { choice: 2, why: "UNION stacks rows and destroys the pairing — after the fold there is no guest-host edge left to compare cities on." },
      ],
      difficulty: "hard",
    },
    {
      id: "turo-mcq-27",
      prompt: "Demand wants a 3-month rolling average of booked value on the month spine. Which window is correct?",
      choices: [
        "AVG(booked) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "AVG(booked) OVER (ORDER BY month RANGE BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "AVG(booked) OVER () — the full-table average beside each month",
        "AVG(booked) OVER (PARTITION BY month)",
      ],
      answer: 0,
      why: "ROWS counts physical rows — the current month plus the two before it, a true trailing window. RANGE on a TEXT month key compares month STRINGS against arithmetic offsets, which is meaningless here; on this spine ROWS is the honest frame.",
      notes: [
        { choice: 2, why: "That is the overall mean printed on every row — no rolling anything, and every month's 'average' is identical." },
        { choice: 3, why: "PARTITION BY month puts each month in its own partition of one row — every rolling average becomes the month's own value. The partition is the enemy of the rolling read." },
      ],
      difficulty: "medium",
    },
    {
      id: "turo-mcq-28",
      prompt: "Guest emails arrive as 'Alice.Chen@MAIL.com' from one app and 'alice.chen@mail.com' from another. The dedupe key needs one canonical form. Which expression builds it?",
      choices: [
        "LOWER(TRIM(email))",
        "UPPER(email) — and LOWER at read time",
        "INITCAP(email)",
        "REPLACE(email, ' ', '')",
      ],
      answer: 0,
      why: "LOWER normalizes case and TRIM kills the stray spaces that ride in from mobile inputs — together they make both spellings collide into one key, so the census counts guests, not spellings.",
      notes: [
        { choice: 1, why: "UPPER is equally canonical — the failure is promising a second conversion 'at read time', which is how two canonical forms get born. Pick ONE and write it into the pipeline." },
        { choice: 2, why: "INITCAP capitalizes initials and keeps 'Alice.Chen' and 'alice.chen' distinct — the dedupe key must erase differences, not decorate them." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-29",
      prompt: "One row, two numbers: the whole trip book AND the completed-trip book (34,833.28 total; the 52 delivered trips carry 15,571.07 of it). Which SELECT delivers both in a single pass?",
      choices: [
        "SELECT SUM(total) AS booked, SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END) AS completed_book FROM orders",
        "SELECT SUM(total), SUM(total) FROM orders WHERE status = 'delivered'",
        "SELECT SUM(total) AS booked, COUNT(status = 'delivered') AS completed_book FROM orders",
        "Two separate queries — one row per SELECT is impossible",
      ],
      answer: 0,
      why: "The CASE arm routes each row's total into either the completed bucket or a zero, so both SUMs scan the same 103 rows in one pass — booked keeps every fate, completed_book keeps only delivered value.",
      notes: [
        { choice: 1, why: "The WHERE deletes 51 rows before either SUM runs — both columns now read the completed book, and the total is gone." },
        { choice: 2, why: "COUNT of a boolean counts every non-NULL boolean — 103 again. The conditional needs the CASE (or FILTER) to route values, not count them." },
      ],
      difficulty: "easy",
    },
    {
      id: "turo-mcq-30",
      prompt: "The trips table (region denormalized onto it) is heading to millions of rows, and the morning dashboard always filters WHERE region = 'EU' AND status = 'delivered'. Which index serves it best?",
      choices: [
        "A composite index on (region, status) — both equality predicates, left to right",
        "An index on created_at — the dashboard sorts by it",
        "An index on total — the board sums it",
        "No index — below a million rows full scans are always faster",
      ],
      answer: 0,
      why: "Both filters are equality predicates on columns named in every morning query, so a composite (region, status) lets the engine seek straight to the matching slice. EXPLAIN QUERY PLAN tells the story — SEARCH … USING INDEX after, SCAN before — and that artifact is what you bring to the schema review.",
      notes: [
        { choice: 2, why: "An index on an aggregated column does nothing for a filter that never mentions it — the engine still reads every row to find EU delivered trips." },
        { choice: 3, why: "The crossover is workload-dependent, not a row-count law — a dashboard that runs every morning on a growing table is exactly when the composite index starts paying rent." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-turo-1",
      tier: "easy",
      topic: "j7",
      universe: "catalog",
      title: "The fleet earnings ledger",
      brief:
        "Turo-flavored brief on the storefront db: the supply review opens with the fleet earnings ledger — per vehicle class, how many listings carry the class, how many day-units guests booked, and the trip earnings the class produced. Probed facts: the 103-trip book is 34,833.28 folded from 251 daily charge lines (quantity = booked days, unit_price = the rate locked on each line); the class ledger tops at 11,744.01 over 97 booked days across 3 listings, the widest fan-out class turns 121 booked days, and the single-listing tail sits at 863.91 over 27. Rates lock per line — the line's daily-rate snapshot is the ledger of record, not the catalog list price. The review reads biggest earnings first.",
      ask: "Return each vehicle class with its listing count, booked days and trip earnings to 2 decimals, biggest earnings first.",
      template:
        "SELECT p.category AS vehicle_class,\n       COUNT({1} p.id) AS listings,\n       SUM(oi.quantity) AS booked_days,\n       ROUND(SUM(oi.quantity * {2}), 2) AS trip_earnings\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY p.{3}\nORDER BY trip_earnings {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the listing deduplicator",
          why: "COUNT(DISTINCT p.id) folds duplicate charge lines back to listings: the top class reads 3, not 97. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "oi.unit_price",
          kind: "keyword",
          label: "the locked daily rate",
          why: "Earnings are booked days × the rate locked on each charge line. oi.quantity squares the days, and 1 collapses earnings back to raw day counts — only the line's own rate operand multiplies days into dollars.",
        },
        {
          answer: "category",
          kind: "keyword",
          label: "the class fold key",
          why: "The class fold is p.category — 7 class rows. GROUP BY p.id would print 16 single-listing rows and the earnings board loses its shape while every number stays technically true.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-earnings-first direction",
          why: "The review reads biggest earnings on top: 11,744.01 down to 863.91. ASC opens the meeting on the single-listing tail — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "oi.quantity", "1", "ASC"],
      walkthrough:
        "One join, one fold, four columns. The join attaches every charge line to its listing's class — GROUP BY category folds the 251 daily lines into 7 class rows where COUNT(DISTINCT p.id) reads listings (3 / 2 / 2 / 3 / 3 / 2 / 1), SUM(oi.quantity) reads booked days (97 / 53 / 61 / 85 / 121 / 54 / 27), and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads earnings — 11,744.01 at the top class, 863.91 at the single-listing tail, with the earnings column reconciling upward to the 34,833.28 trip book. The rate operand is the line's own unit_price — the snapshot locked at booking, not the catalog list price. The distractors fail honestly: SUM and MAX inside the listing count error out (an aggregate inside an aggregate); oi.quantity squares the booked days and invents earnings; 1 in the rate slot collapses earnings to raw day counts, and 1 in the fold key breaks the p. prefix outright; ASC flips the board so the review opens on the 863.91 tail. The read is two-axis: the top class holds 11,744.01 of the book while the widest fan-out class turns 121 booked days — where the money is, and where the utilization is.",
    },
    {
      id: "cs-turo-2",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The trip-fate census",
      brief:
        "Turo-flavored brief on the storefront db: trust & safety's monthly read is the trip-fate census — per region, how the 103 booked trips ended up (completed, on-trip, scheduled, cancelled) and how long guests wait between booking and key handover. Probed facts: the regional base runs EU 45, APAC 37, US 19, LATAM 2; completions 24/21/5/2; on-trip 12/8/10/0; scheduled 6/5/3/0; cancelled 3/3/1/0. The checkout clock averages 2.98 days platform-wide over the 82 stamped checkouts — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 — and the 21 stamp-less rows (14 scheduled, 7 cancelled) have no clock yet. The census must reconcile to 103 by construction.",
      ask: "Return each region with its trip count, the four fate counts and average booking-to-checkout days to 2 decimals, biggest trip base first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS trips,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS on_trip,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS scheduled,\n       SUM(CASE WHEN o.status = {4} THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), {5}) AS avg_lead_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY trips {6};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed literal",
          why: "Completed trips are status 'delivered' — 52 platform-wide, 24 of them in EU. 'completed' is not a status value in this ledger: it fills the column with zeros and the census quietly reports no completions anywhere.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the on-trip literal",
          why: "On-trip rows are status 'shipped' — 30 platform-wide, 10 of them in the US, the widest on-trip base of any region. 'delivered' here would double the completion column and break the census's additivity.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the scheduled literal",
          why: "Scheduled trips are 'pending' — 14 with no checkout stamp yet. Dropping this arm reads zero scheduled trips and the funnel's top stage disappears from a board that reconciles to 103 by construction.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancelled literal",
          why: "Cancelled trips are 'cancelled' — 7 total, 3 each in EU and APAC. Any other literal zeroes the arm and the trust read loses its denominator story.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the lead-time precision",
          why: "Lead-time reports to 2 decimals — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 against the 2.98 platform average. ROUND(…, 1) prints 2.9 and the regional map stops reconciling with the number trust & safety quotes.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-base-first direction",
          why: "The census reads biggest trip base first: EU 45, APAC 37, US 19, LATAM 2. ASC would open the review on LATAM's 2 trips — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'completed'", "'open'", "1", "ASC", "LEAD"],
      walkthrough:
        "One join, one fold, four CASE arms and a clock beside them. The join attaches every trip to its region and GROUP BY folds the 103 trips into four rows where the arms read the fates — completed 24 / 21 / 5 / 2, on-trip 12 / 8 / 10 / 0, scheduled 6 / 5 / 3 / 0, cancelled 3 / 3 / 1 / 0 — each region's row summing to its trip base (45 / 37 / 19 / 2), reconciling to 103 by construction. The clock column is the honest part: AVG(julianday(shipped_at) - julianday(created_at)) silently ignores the 21 stamp-less rows — 14 scheduled, 7 cancelled have no clock — so the 2.94 / 2.93 / 3.07 / 3.5 regional read is computed over checked-out trips only, against the 2.98 platform average, and the report says so in the title. The distractors each break differently: 'completed' and 'open' are not status values in this ledger and zero out the arms; 1 as the ROUND precision prints 2.9 and the map drifts off the quoted average; LEAD is not a status and errors outright; ASC opens the review on LATAM's 2 trips. LATAM's row is the read-out-loud: 2 trips, both completed, zero on-trip rows — the smallest market with the slowest clock at 3.5 days.",
    },
    {
      id: "cs-turo-3",
      tier: "medium",
      topic: "t6",
      universe: "growth",
      title: "The latest-key-handover panel",
      brief:
        "Turo-flavored brief on the storefront db: growth's winback calendar and the fleet forecast both open with the same panel — per guest, the most recent stamped trip, full row. Probed facts: 82 of the 103 trips carry the checkout stamp, and every one of the 16 guests owns at least one stamped trip, so the panel returns exactly 16 rows. The newest stamp on the book is Isabella Rossi's trip #98 (2025-02-25, still on-trip); Alice Chen's latest is #100 (2025-02-19, delivered); Emma Wilson's is #96 (2025-01-06, on-trip) and Noah Meyer's is #99 (2025-02-11, on-trip). The panel reads alphabetically by guest so account managers can walk it top to bottom.",
      ask: "Return each guest with their latest stamped trip's id, status and booking date — one row per guest, guest order A to Z.",
      template:
        "WITH stamped AS (\n  SELECT c.name AS guest,\n         o.id AS trip,\n         o.status,\n         o.created_at,\n         ROW_NUMBER() OVER (PARTITION BY o.{1} ORDER BY o.shipped_at {2}) AS recency\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  WHERE o.shipped_at IS NOT NULL\n)\nSELECT guest, trip, status, created_at\nFROM stamped\nWHERE recency = {3}\nORDER BY guest;",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the per-guest partition",
          why: "PARTITION BY o.customer_id restarts the recency count per guest — the fold that makes 'latest PER GUEST' literal. o.region would need a region column the trips table doesn't carry, and o.id partitions by trip, making every row its own latest.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the newest-first ordering",
          why: "The latest stamped trip must sort newest-first inside the partition, so ORDER BY o.shipped_at DESC hands row 1 to the most recent stamp. ASC hands row 1 to the guest's OLDEST stamped trip — a recency panel reading backwards.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the keep-the-latest cut",
          why: "recency = 1 keeps exactly the top row of each partition — 16 rows for 16 guests. Window output cannot be filtered in the same SELECT's WHERE (it is computed after), which is why the ranking stages in the CTE and the cut happens outside it.",
        },
      ],
      distractors: ["o.region", "o.id", "ASC", "2"],
      walkthrough:
        "Two stages: rank the stamped trips, then keep each guest's top row. The CTE filters to the 82 stamped trips first — the 14 scheduled and 7 cancelled rows have no stamp, no clock, and no place in a recency panel — then ROW_NUMBER numbers them newest-first within each guest's partition. The outer query keeps recency = 1: exactly 16 rows, one per guest, because every guest on this db has checked out at least once. The panel's status mix is the operational read: most guests' latest trip reads delivered, with a shipped tail (Emma Wilson's #96, Isabella Rossi's #98, Noah Meyer's #99) marking trips still on the road — those guests are mid-trip, not dormant, and the winback calendar must not email them yet. The distractors each break a different wall: o.id as the partition makes every trip its own group and the filter returns all 82 rows; ASC crowns each guest's OLDEST stamped trip; 2 in the cut serves the second-latest trip; o.region errors outright because the trips table never carried region. The staging matters as much as the answer — WHERE recency = 1 cannot live inside the ranking SELECT, because window output is computed after WHERE evaluates.",
    },
    {
      id: "cs-turo-4",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The payout anti-join",
      brief:
        "Turo-flavored brief on the storefront db: before a single host gets a payment-chasing email, the payments pod refreshes the anti-join — invoices with NO settlement rows behind them. Probed facts: 28 invoices, 27 payment rows; exactly 6 invoices have never settled, worth 15,217 combined — #24 open at 4,937.00 (Emma Wilson), #26 open at 3,562.00, #27 open at 2,794.00, #28 marked PAID at 1,756.00 (Hiro Tanaka) with zero payment rows behind it — a status that lies — then #21 open at 1,295.00 and #18 open at 873.00. Both books carry INTEGER cents, so the dollar read is amount_cents / 100.0. The queue reads biggest exposure first.",
      ask: "Return each never-settled invoice with its guest, invoice id, status and owed dollars to 2 decimals, biggest owed first.",
      template:
        "SELECT c.name AS guest,\n       i.id AS invoice,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS owed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {2}\nORDER BY owed {3};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices and hands the 6 with no settlement rows a NULL payment payload — they ARE the answer. INNER deletes exactly those six rows, and the dunning queue reads empty while 15,217 sits uncollected.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the empty-payload test",
          why: "p.id IS NULL is the anti-join predicate: keep only invoices whose LEFT JOIN payload never matched. IS NOT NULL flips the query to the settled side — 22 invoices, 27 payment rows — the mirror-image list, useful elsewhere, useless for dunning.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first direction",
          why: "The queue reads biggest owed on top: 4,937.00 down to 873.00. ASC opens the host-email sweep with the smallest balance and buries the 4,937.00 exposure at the bottom — a correct query aimed at the wrong end of the queue.",
        },
      ],
      distractors: ["INNER", "RIGHT", "NOT NULL", "ASC"],
      walkthrough:
        "An anti-join at invoice grain. The LEFT JOIN keeps every invoice — 22 match payment rows (five of them split across two payments, which is why 28 invoices produce 27 payment rows and why the payload can fan) — and the 6 never-settled arrive with a NULL payload that p.id IS NULL catches. The dollars read is amount_cents / 100.0 because both books carry INTEGER cents; the integer /100 would print 4937 as 49 and the queue would chase wrong balances. The output reconciles to the probed exposure: 4,937.00 + 3,562.00 + 2,794.00 + 1,756.00 + 1,295.00 + 873.00 = 15,217.00, and the anomaly rides mid-queue — #28 is marked PAID with zero settlement rows, which is why payment rows are the ledger of record and the status column is only a claim. The distractors each kill a different promise: INNER deletes the six rows and the queue reads empty; RIGHT JOIN anchors on payments, whose ids are never NULL, so the IS NULL test returns nothing; NOT NULL serves the settled side of the book; ASC buries the biggest exposure. This is the query the payments pod runs before any host email ships — and the one whose row count must read 6 before the close does.",
    },
    {
      id: "cs-turo-5",
      tier: "medium",
      topic: "q2",
      universe: "fraud",
      title: "The above-average trip screen",
      brief:
        "Turo-flavored brief on the storefront db: fraud's weekly spot-check flags unusually priced trips — anything booked above the platform's average trip value — and reads the survivors by market. Probed facts: the platform average is 338.19 (over all 103 trips); 42 trips price above it, split EU 18 (avg 605.50, book 10,899.05), APAC 13 (avg 521.85, book 6,784.10), US 10 (avg 587.36, book 5,873.57), LATAM 1 (avg 752.96 — LATAM's other trip prices below the mean). The screen carries the average's population in its title: computed over ALL booked trips, not the delivered subset.",
      ask: "Return each region with its above-average trip count, average big-trip value to 2 decimals and total big-trip book, biggest average first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS trips,\n       ROUND(AVG(o.total), {1}) AS avg_big_trip,\n       ROUND(SUM(o.total), 2) AS booked\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (SELECT {2}(total) FROM orders)\nGROUP BY c.region\nORDER BY avg_big_trip {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the big-trip precision",
          why: "Big-trip averages print to 2 decimals — LATAM 752.96, EU 605.50, US 587.36, APAC 521.85 — matching every figure fraud quotes from the probed screen. ROUND(…, 1) prints 753.0 and the regional read stops reconciling with the case file.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the benchmark fold",
          why: "The screen prices trips against the platform MEAN — AVG(total) over all 103 rows is 338.19. SUM inside the subquery sets the bar at the whole 34,833.28 book (no trip qualifies), and MAX sets it at the priciest trip (1,088.44), which nothing strictly exceeds — both produce a confident zero.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the priciest-market-first direction",
          why: "The screen reads biggest average first: LATAM's lone 752.96 trip on top, APAC's 521.85 at the bottom. ASC inverts the story and opens the fraud review on the quietest market's smallest average.",
        },
      ],
      distractors: ["SUM", "MAX", "COUNT", "1", "ASC"],
      walkthrough:
        "A scalar subquery as the bar, then a regional fold. The inner query folds all 103 trips into one number — AVG(total) = 338.19, the platform mean — and the outer WHERE keeps the 42 trips that price above it; the scalar contract is 0-or-1 rows, and here the 1 row drives every comparison. GROUP BY region folds the survivors: EU 18 trips averaging 605.50 (book 10,899.05), APAC 13 at 521.85, US 10 at 587.36, LATAM 1 at 752.96 — LATAM's row is the read-out-loud: one qualifying trip out of two booked, the other below the mean. The population caveat ships with the number: the mean is computed over ALL booked trips including cancelled and scheduled, exactly as the screen's title says. The distractors each break differently: SUM sets the bar at 34,833.28 and the screen returns zero rows; MAX sets it at 1,088.44, which nothing strictly beats — zero again; COUNT sets it at 103, also zero; 1 in the precision slot prints 753.0 and the audit drift; ASC reads the market list bottom-up. Two confident zeros in one distractor bank is the lesson — a wrong benchmark rarely errors, it just quietly answers a question nobody asked.",
    },
    {
      id: "cs-turo-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The regional month spine",
      brief:
        "Turo-flavored brief on the storefront db: the growth board walks booked trip value month by month PER REGION — the platform spine (opens 3,731.97 in 2024-01, troughs 1,193.86 in July, jumps +1,158.21 into August) decomposed by market. Probed facts: the regional spine runs 4 regions × 14 months = 56 rows; EU opens at 1,496.70, dips to 1,337.52 in Feb, recovers to 1,523.70 in Mar and hits 1,963.12 by Apr; APAC opens at 575.29 then jumps to 1,479.78 in Feb — a +904.49 step, the biggest single regional move of the opening quarter. Each region's first row carries NULL for prior booked — the baseline, never a zero — and deltas are current minus prior.",
      ask: "Return the regional month spine: region, month, booked value, prior month's booked value and the delta, regions A to Z then months in order.",
      template:
        "WITH spine AS (\n  SELECT c.region AS region,\n         SUBSTR(o.created_at, 1, {1}) AS month,\n         ROUND(SUM(o.total), 2) AS booked\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region, month\n)\nSELECT region,\n       month,\n       booked,\n       {2}(booked) OVER (PARTITION BY {3} ORDER BY month) AS prev_booked,\n       ROUND(booked - LAG(booked) OVER (PARTITION BY region ORDER BY month), 2) AS delta\nFROM spine\nORDER BY region, month;",
      slots: [
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the month-key width",
          why: "SUBSTR(created_at, 1, 7) carves 'YYYY-MM' off the timestamp — 14 ordered buckets per region from 2024-01 to 2025-02. SUBSTR 6 yields '024-01': same count, wrong labels, and every downstream join to a '%Y-%m' spine misses.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(booked) fetches each region's previous month row-locally — APAC's February prev is January's 575.29. LEAD reads forward and re-labels the future as history; SUM piles a running total into the prev column; both are different reports wearing this one's name.",
        },
        {
          answer: "region",
          kind: "keyword",
          label: "the per-market partition",
          why: "PARTITION BY region restarts the walk per market — each region's January reads NULL baseline and its own February delta. PARTITION BY month would hand every region the same month's OTHER regions as 'prior' — a nonsense comparison across markets.",
        },
      ],
      distractors: ["LEAD", "SUM", "month", "6"],
      walkthrough:
        "A staged spine and a partitioned walk. The CTE folds 103 trips into 56 rows — 4 regions × 14 months via the SUBSTR month key — with booked value rounded to the cent; the outer query layers two windows over it, both PARTITIONED BY region so the walk never leaks across markets. LAG(booked) carries each region's prior month into prev_booked, and the delta column is current minus prior over the same partition: APAC's +904.49 February step is the opening quarter's biggest move, and EU's grind 1,496.70 → 1,337.52 → 1,523.70 → 1,963.12 is the steadier climb the board quotes. Every region's first row is NULL by definition — baseline, never a zero, and never coalesced into a flat month. The distractors each break a different axis: LEAD reads the future into the prev column; SUM turns prev into a running total; month as the partition makes each region compare against the same month's other markets; 6 in the SUBSTR shifts every label to '024-01' and orphans the join. The two-step staging is the grammar: window output cannot feed a sibling expression or a WHERE in the same SELECT, so the fold happens in the CTE and the walk happens outside it.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical two-sided screen — cancellation share per city with excluded accounts — maps straight onto Turo's trust read: guest cancellation share per market with the right population excluded from the denominator." },
    { slug: "confirmation-rate", why: "Host confirmation rate with COALESCE NULL guards — an unanswered booking request is 'no answer yet', not zero, and that COALESCE policy is the trust team's daily query." },
    { slug: "immediate-food-delivery-ii", why: "Trips handed over within the promised window versus late checkouts — the preferred-handover share supply ops reports weekly is a conditional rate over a timestamp comparison." },
    { slug: "average-selling-price", why: "Rate × booked days over a time window is utilization-weighted pricing — exactly this join-and-weight shape, and it feeds every host-earnings review." },
    { slug: "queries-quality-and-percentage", why: "Trip ratings against price — rating-per-dollar with a poor-quality share below a threshold is the listing-quality screen the trust pod runs before All-Star reviews." },
    { slug: "hopper-company-queries-ii", why: "Per-host monthly completion shares with a floor gate — the All-Star watchlist is literally this query with Turo nouns: who completed enough trips, and who is drifting." },
    { slug: "keep-latest-dedupe", why: "Trip photos arrive at checkin and checkout; the latest event per trip wins. ROW_NUMBER dedupe over event timestamps is the image pipeline's daily job." },
    { slug: "null-blank-audit", why: "Listing hygiene before any join: NULL city, blank rate, missing region. A dirty join key fans one car into two and the fleet census doubles silently." },
    { slug: "rolling-7d-actives", why: "Rolling 7-day actives is how marketplace demand is measured between weekend spikes — the demand team's pulse query, run every morning on the booking stream." },
    { slug: "dau-wau-stickiness", why: "Guest stickiness — daily actives over weekly actives — separates vacation-rental bursts from commute-grade repeat demand, and it is one ratio with two different folds." },
    { slug: "find-churn-risk-customers", why: "Guests whose last trip is drifting past their usual gap go on the winback list before booking season — the dormant-cohort anti-join growth runs weekly." },
    { slug: "cohort-retention-matrix", why: "Guest cohorts by first-trip month, retained by repeat bookings — the retention matrix the growth board opens with, one row per cohort, one column per month since." },
    { slug: "week-over-week-churn", why: "Week-over-week demand accounting — new, returning, resurrected, gone — is the four-way classification growth runs every Monday on the booking stream." },
    { slug: "duplicate-charge-pairs", why: "Two settlement rows on one trip inside a tight window is either a split protection-plan charge or a duplicate — the self-join the payments pod runs before payouts ship." },
    { slug: "bikes-last-time-used", why: "Last checkout per vehicle — the MAX-per-group shape behind the utilization board's 'days since last trip' column, which flags cars going stale on the calendar." },
    { slug: "spend-histogram", why: "Trip-value histogram bands across the 25.47 to 1,088.44 spread — the price-architecture read that decides where daily-rate guidance should sit." },
    { slug: "user-activity-for-the-past-30-days-i", why: "The 30-day booking window census — Turo's demand team reads actives inside rolling windows between vacation seasons, and the window boundary is the whole query." },
    { slug: "immediate-food-delivery-i", why: "Same-day handovers as a share of the funnel — the preferred-delivery read Turo's checkout team reports weekly, a conditional rate over a timestamp comparison." },
    { slug: "game-play-analysis-v", why: "Did a first-time guest book again within days of the first trip? First-event-then-return logic over timestamps — the onboarding read the host-acquisition pod lives on." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Guests who drove weekday trips AND weekend trips but never booked an airport delivery — conditional segment membership over trip history, the definition screen behind every winback list." },
    { slug: "second-highest-salary", why: "The second-busiest guest without guessing LIMIT offsets — top-N reads where ties and edge ranks matter, exactly the leaderboard follow-up Turo panels ask." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest checkout per listing — the argmax-per-group shape behind the utilization board's 'days since last trip' column, which flags cars going stale on the calendar." },
    { slug: "second-most-recent-activity", why: "The second-latest stamped trip per guest — the keep-latest pattern one notch deeper, and the window drill behind any 'previous trip before this one' comparison." },
    { slug: "top-travellers", why: "Guests ranked by distance travelled maps straight onto booked-days leaderboards — a fold, a rank and the tie policy, the three moves every Turo ladder needs." },
    { slug: "number-of-rich-customers", why: "Guests above a spend bar — the concentration cohort read (4 of 16 guests carry 63.5% of the book here) as a single conditional count." },
    { slug: "sellers-with-no-sales", why: "Fleet-host partners with zero completed trips in a window — the anti-join with a date filter that feeds the quarterly host-standards review." },
    { slug: "sales-by-day-of-the-week", why: "Booking volume pivoted by weekday — the demand curve that drives host pricing guidance and delivery staffing, built with CASE/strftime columns." },
    { slug: "seasonal-sales-analysis", why: "Season-over-season reads on the 14-month trip spine — the year-boundary bucketing that keeps January 2025 from merging with January 2024." },
    { slug: "human-traffic-of-stadium", why: "Three consecutive days above a booking threshold — the demand-surge streak shape Turo ops uses to catch festival weekends before they strand the fleet." },
    { slug: "group-sold-products-by-the-date", why: "Listings booked per day folded into one row with GROUP_CONCAT — the text-fold drill behind the daily handover manifest the delivery team prints each morning." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Guests whose trip values keep rising — a LAG-comparison over per-guest history, and the upsell screen that flags which power guests are still escalating." },
    { slug: "the-airport-with-the-most-flights", why: "The delivery hub carrying the most trips — an argmax over a fold that reads straight onto Turo's airport-delivery map, where one location can anchor a metro's handover queue." },
  ],
};
