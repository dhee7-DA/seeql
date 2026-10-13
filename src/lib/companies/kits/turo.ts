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
    "Preparation strategy: the pools file carries no Turo section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: checkout funnels, two-grain market censuses, tie-heavy guest leaderboards, CASE rate bands and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:fleet earnings ledger} the supply review opens with, the other rebuilds the {rose:trip-fate census} trust & safety reads monthly. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain trip censuses",
      why: "Trips and guests are different grains of the same join: EU runs 45 trips from just 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and naming which is load and which is coverage — is the habit every census here grades.",
      slugs: ["students-and-examinations", "find-followers-count", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Joining guests to trips",
      why: "Guests carry region and join date; trips inherit them through joins, and the join type decides who survives. A trip without a guest is corruption; a guest without trips is dormant demand — on this db the anti-join returns a confident zero, and proving the zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-i"],
    },
    {
      name: "Ranking windows & tie policy",
      why: "Leaderboards here are rank-window reporting with guaranteed ties — the guest ladder runs 24, 17, 14, 13, 5 and then four guests sit tied at 4 trips. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Class banding with CASE",
      why: "Vehicle classes and daily-rate bands are CASE-classified with fixed edges: 8 budget listings averaging 32.06 a day, 8 mid-band at 111.5, and a premium 200-plus band that is empty. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the fleet census, and the empty band is a finding, not padding.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Lead-time math on timestamps",
      why: "The checkout clock — booking to key handover — is julianday arithmetic over text timestamps: 82 stamped checkouts averaging 2.98 days with a 2–4 day spread. The NULL policy ships with the number, because the 21 stamp-less trips have no clock and must not dilute the average.",
      slugs: ["average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days", "rising-temperature"],
    },
    {
      name: "Month spine & LAG walk",
      why: "The 14-month trip spine (2024-01 to 2025-02) is the demand board's home turf: the book opens at 3,731.97, troughs at 1,193.86 in July, and the biggest single-month jump is +1,158.21 into August. LAG drives the walk and the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["hopper-company-queries-i", "biggest-window-between-events", "the-change-in-global-rankings"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — completed under cancelled, this quarter beside last — and EXCEPT answers 'which booked guests never checked out'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["movie-rating", "monthly-transactions-ii", "customers-who-never-order"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets completed, on-trip, scheduled and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "count-the-number-of-experiments"],
    },
    {
      name: "Settlement books & cents discipline",
      why: "Completed is not paid out — the settlement tables (28 invoices, 27 payments, INTEGER cents) are where the trip world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "account-balance", "ar-aging-schedule"],
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
  ],
};
