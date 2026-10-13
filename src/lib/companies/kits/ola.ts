// Ola — kit 3 of the Ride-hailing & Mobility domain (Batch C).
// India mobility: night-shift ride windows, metro vs tier-2/3 city growth,
// cab-category supply, and Ola for Business corporate travel. No registry
// tags — the pool is theme-curated: every problem mirrors a workflow Ola's
// city pods are known to probe (scripts/company-pools.md theme menu).
// Case studies run on the storefront db — mapped honestly as orders=trip
// bookings, customers=riders, suppliers=fleet/vehicle partners,
// shipped_at=trip-completion stamp, invoices=Ola-for-Business corporate
// statements — with probed figures (scripts/company-facts.md).

import type { CompanyKit } from "../types";

export const olaKit: CompanyKit = {
  id: "ola",
  domainId: "mobility",
  name: "Ola",
  tagline: "Mobility across India's cities",
  accent: "text-lime-400",

  brief: [
    "Ola is India's homegrown ride-hailing giant — the operator that put millions of Indians into booked cabs, autos and bikes across metro cities and, increasingly, tier-2 and tier-3 India. The business reality is a three-sided squeeze: riders want a car in minutes, driver-partners want utilized hours, and city regulators want auditable numbers. Demand is spiky by construction — airport runs peak at odd hours, night shifts carry a disproportionate share of trips in some cities, and monsoon evenings can double demand in minutes. Bookings and completed trips are different numbers here: every ops review opens with the gap between what was booked and what actually moved. On this kit's storefront db that maps directly: **103 bookings**, of which {emerald:52 completed}, {sky:30 underway}, {amber:14 still awaiting a driver match}, {rose:7 cancelled}.",
    "The data org runs as **city pods on top of a central platform**. A Bangalore or Delhi-NCR analyst owns the supply-demand heatmap for their city; central teams own the pricing catalog (**Mini, Micro, Prime, Bike, Auto** — each with its own fare logic), the driver-incentive ledger, and **Ola for Business**, the corporate travel desk whose accounts are billed monthly and chased by collections. The finance tables carry one house rule every analyst learns fast: money is stored as INTEGER cents, so the rupee read is `amount_cents / 100.0` — and the missing .0 is how a settlement silently truncates. Dashboards refresh through the night because the night shift IS the market: a booking at **2am** that sits unmatched for ten minutes is a rider lost to the street.",
    "Interview style is operations-fluent and **denominator-first**. A typical screen walks from a warm-up join (attach riders to their bookings) into a conditional aggregate ({sky:completion share} per city or category), then escalates into either a ranking window (top categories per city tier) or a rate question where the denominator is the entire test. Follow-ups are definition probes said out loud: 'cancelled bookings in your denominator?', 'is that share per booking or per rider?', 'what happens at 2am when the driver match never lands?'. Candidates who narrate the grain and the filter placement before writing SQL consistently outperform — the interviewer is grading the habit, not the answer.",
    "Preparation strategy: Ola has no tagged pool in this app's registry, so the kit curates **sixteen problems** from the SQL band that mirror its known screen themes — two-grain demand censuses, completion-share ratios, night-window date logic, corporate AR anti-joins, and cents-safe money folds. Do the topics in order, then run both case studies on the live storefront database: one rebuilds the **Ola for Business** collections sweep ({rose:unpaid} corporate statements), the other rebuilds the month-over-month demand calendar ops reads every Monday.",
  ],

  dayInLife: [
    "**07:00 —** The day starts where the night ended. A city-pod analyst opens the overnight dashboard before the morning standup: did last night's bookings land in the warehouse, how many sat {orange:unmatched} past the ten-minute mark, where did the {sky:completion rate} sag — airport zone, night window, or the whole city? The first query of the day is almost always a reconciliation: bookings versus matches versus completions, row counts against the 7-day band. On this db that's the **103 / 52 / 30 / 14 / 7** status fold — and the analyst who can write the diff query that names WHICH bookings leaked between two statuses is the one the pod waits on.",
    "**11:00 —** Midday is definition work. The category lead wants {sky:completion share} per cab class with {rose:cancelled} bookings kept in the denominator; the incentive team wants driver-partner payout accruals folded from integer cents without losing a paisa; the corporate desk wants the **Ola for Business** aging list — statements issued, statements settled, statements gone quiet. Each ask is a join, a conditional aggregate and one judgment call about filter placement, and the strong analyst writes the query twice: once to answer, once with the definition printed in the column name so the number survives the argument.",
    "**15:30 —** The afternoon belongs to stakeholders. The weekly business review is a definition audit as much as a numbers meeting — every headline ({sky:completion share}, night-window demand, tier-2 growth) ships with its SQL attached, because a number without its query is a rumor. Regulator-facing reads get the strictest treatment: the completion share a state transport authority sees must reconcile, **to the row**, with the internal dashboard.",
    "**21:00 —** The last hour is handoff to the night shift: freshness status per feed, the fires closed, and tomorrow morning's two numbers written down so the next analyst inherits queries, not mysteries. The note leads with the status fold — {emerald:completed}, {sky:underway}, {orange:unmatched}, {rose:cancelled} — because in a market where the night shift IS the demand curve, the handoff is where the numbers stay honest.",
  ],

  metrics: [
    { name: "Completion rate", what: "Completed trips ÷ placed bookings. The headline ops number — 52 of 103 on the sample db — and every read of it is a conditional-count ratio with the denominator question built in." },
    { name: "Cancellation share", what: "Cancelled bookings ÷ placed bookings, sliced by city, hour and cab category. Rider second thoughts and unmatched demand look identical until you split the denominator correctly." },
    { name: "Unmatched-demand share", what: "Bookings awaiting a driver ÷ all bookings. The supply-health read: 14 of 103 on the sample db sit in 'pending', and each one is a rider watching the map." },
    { name: "Night-window demand share", what: "Bookings created in the late-night hours ÷ daily bookings. Ola's night-shift economics live on this number, and computing it is STRFTIME hour-bucketing with a half-open window." },
    { name: "City-tier growth mix", what: "Booking share split metro / tier-2 / tier-3. The expansion story investors ask about — in interview form, a GROUP BY over a CASE-classified axis." },
    { name: "Average fare", what: "Fare ÷ completed trips — 338.19 on the sample db, computed over the 103 placed bookings only if you say so. The grain of the denominator is the whole question." },
    { name: "Corporate AR aging", what: "Ola-for-Business statements issued but unpaid, value and count. The sample db shows 6 unpaid statements worth 15217 — the collections sweep this kit's first case study rebuilds." },
    { name: "Driver-incentive burn", what: "Incentive payouts ÷ fares, per city and week. A cents-fold ratio where integer division truncates incentive costs into fiction — the finance table's favorite trap." },
  ],

  topics: [
    {
      name: "Booking-census aggregation",
      why: "Every Ola read starts by folding the bookings table: per day, per city, per cab category. The screens test whether you can fold 103 bookings into honest per-group totals without letting cancelled demand pollute a 'completed trips' column, and whether you can print two grains — bookings and riders — in one pass.",
      slugs: ["unique-orders-and-customers-per-month", "product-sales-analysis-ii", "classes-more-than-5-students"],
    },
    {
      name: "Two-grain demand reads",
      why: "'Bookings AND riders per city' is the opening read of every Ola pod review — network load versus audience size. COUNT(*) counts booking rows; COUNT(DISTINCT rider_id) counts people, and the gap between them is ride intensity per rider. Confusing the two grains is the single most common junior bug here.",
      slugs: ["students-and-examinations", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Completion shares & conditional counts",
      why: "A booking can complete, stay underway, wait unmatched, or cancel — and every headline Ola reports is one slice ÷ the right denominator. SUM(CASE WHEN …) and COUNT FILTER (WHERE …) are the daily muscles, and the interviewer always asks what your denominator includes.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Attaching riders to the trip store",
      why: "Bookings alone answer 'what happened'; the pod's questions are about WHO — joins that attach rider attributes, cities and account types to every booking. The trap is the silent LEFT-JOIN downgrade: filter the right table in WHERE and your unmatched-rider analysis quietly becomes an inner join.",
      slugs: ["combine-two-tables", "replace-employee-id-with-unique-identifier", "employee-bonus"],
    },
    {
      name: "Anti-joins for collections & dormant supply",
      why: "Corporate statements with no settlement, fleet partners whose categories never moved, riders who registered and never booked — the 'find what's missing' reads are anti-joins. On collections the unmatched rows ARE the money: 6 unpaid statements worth 15217 on this db.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers"],
    },
    {
      name: "City & category leaderboards",
      why: "Top cab categories per city tier, busiest booking hours, rank by fare volume — Ola reporting is leaderboard reporting, and ties are constant when categories share price points. The rank trio (ROW_NUMBER / RANK / DENSE_RANK) plus a deterministic tie-break is drilled until it's reflex.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders"],
    },
    {
      name: "Night windows & date logic",
      why: "The night shift is a real operating window, so screens probe time slicing: bookings between 22:00 and 05:00, the latest booking before a cutoff, activity in the 30 days after a rider's first trip. Half-open intervals and STRFTIME buckets are the vocabulary; BETWEEN on timestamps losing the last night is the classic bug.",
      slugs: ["the-latest-login-in-2020", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Month-over-month momentum",
      why: "The demand calendar ops reads every Monday is a month spine with last month folded alongside: 8 bookings in 2024-01, 9 in 2024-02, 8 in 2024-03 — the delta is the story. LAG over a grouped fold is exactly that shape, and the NULL first row is the edge case they probe.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "year-on-year-growth-rate"],
    },
    {
      name: "Money math on integer cents",
      why: "Ola-for-Business statements, settlements and the incentive ledger keep money in integer cents — every rupee read is amount_cents / 100.0, and every ratio sits one misplaced integer away from truncation. Reconciliation reads (unpaid sweeps, per-account folds, trial-balance eyes) are this kit's finance round.",
      slugs: ["trial-balance-check", "bank-account-summary-ii", "total-traveled-distance"],
    },
    {
      name: "Rider manifest text hygiene",
      why: "Rider name feeds and corporate address books arrive messy: ALL-CAPS manifests, mixed-case emails, free-text remarks. Screens warm up with string reshaping — case normalization, SUBSTR extraction, LIKE validation — because a join on a dirty rider key is a silent fan-out nobody catches until the census doubles.",
      slugs: ["fix-names-in-a-table", "find-all-unique-email-domains", "invalid-tweets"],
    },
  ],

  theory: [
    {
      id: "ola-t1",
      q: "The pod review wants bookings AND distinct riders per city side by side. Why do the two counts disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts rows after the fold — one row per booking, so a commuter with six airport runs contributes six. COUNT(DISTINCT customer_id) folds those six rows back to one rider. Neither is wrong: bookings measure load on the driver-supply network, riders measure audience size, and the ratio between them — trips per rider — is the intensity signal the growth pod actually manages. The trap that catches candidates is a third count: after joining bookings to fare lines, COUNT(*) silently counts line items instead of bookings. Saying 'one row per what?' out loud for every COUNT in the query is the habit the interviewer is listening for — on a night-shift heatmap, that habit is the difference between a demand story and a supply story.",
      tag: "aggregation",
    },
    {
      id: "ola-t2",
      q: "INNER JOIN or LEFT JOIN when attaching riders to bookings — how do you decide, and what silently breaks if you filter status in WHERE afterwards?",
      a: "Decide from the survival rule the question implies. A completed-trips report joins bookings to riders where every booking has a rider row, so INNER is honest — and worth a data-quality flag if it ever drops rows. A 'riders who registered but never booked' report must be LEFT from riders — the unmatched riders ARE the answer, arriving with NULL booking columns. The Ola-specific failure is filtering the right table's column in WHERE afterwards: WHERE b.status = 'completed' discards the NULL-payload rows and silently converts the LEFT JOIN into an INNER — your dormant-rider list is empty and the query still runs clean. The fix is moving the predicate into ON, or accepting inner-join semantics deliberately and saying so. Join type is a decision about who survives the query, not a habit.",
      tag: "joins",
    },
    {
      id: "ola-t3",
      q: "How do you isolate the night shift — bookings between 10pm and 5am — in SQL, and where does the obvious approach break?",
      a: "Three tools, stated with their caveats. Hour extraction: STRFTIME('%H', created_at) gives the hour as text — CAST it to integer and the window becomes created_at hour >= 22 OR < 5, an OR across midnight because the window WRAPS. The naive BETWEEN 22 AND 5 returns nothing — BETWEEN assumes low-before-high. Month buckets: STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) — identical on fixed-width ISO text, and the SUBSTR shortcut breaks the day someone writes '2024-2-7'. Diffs: JULIANDAY(completion) - JULIANDAY(created_at), rounded once at the end — this db's 2.98-day booking-to-completion average is exactly that shape, which is an outstation-rental story, not a city-ride one. And every window fold states its population first: the night-share denominator is ALL bookings, not the completed ones.",
      tag: "dates",
    },
    {
      id: "ola-t4",
      q: "shipped_at is NULL until the trip completes. In a completion-latency read, what is your NULL policy — and what does each COUNT flavor do with those rows?",
      a: "Three behaviors, then a policy. Filters: NULL fails both x = value and x != value — the comparison is UNKNOWN — so WHERE completion < deadline silently drops unfinished trips, which is sometimes the definition and sometimes a leak. Aggregates: COUNT(*) keeps every row (103 bookings); COUNT(completion_stamp) counts non-NULLs only (82) — the 21-row gap IS the uncompleted picture, and reporting one number without the other hides either demand or backlog. AVG ignores NULLs, which is why avg latency over all rows and over completed rows differ. The policy: define the population before the query — 'latency of completed trips; pending and cancelled are out of scope by definition' — and print that sentence in the dashboard subtitle. A WHERE clause doing definitional work silently is exactly what Ola's reviewers hunt for.",
      tag: "nulls",
    },
    {
      id: "ola-t5",
      q: "Rank cab categories per city by fare volume when two categories can tie. What breaks with ORDER BY + LIMIT, and what is the complete fix?",
      a: "A tie at the cut boundary: two categories share the third-place fare total and ORDER BY total DESC LIMIT 3 keeps both or drops one arbitrarily, depending on the engine's sort behavior — either way the leaderboard is a coin flip. The complete fix is an explicit window with a deterministic tie-break: DENSE_RANK() OVER (PARTITION BY city ORDER BY SUM(fare) DESC, category ASC) and keep rank <= 3 — DENSE_RANK because the business wants 'top three fare tiers', and ties share a rung without leaving a gap that implies a missing category. The id-or-name ASC is the part interviewers wait for: it makes the choice deterministic instead of engine-arbitrary. If the ask is 'exactly three rows per city', switch to ROW_NUMBER and own the arbitrary pick out loud. At Ola this matters because category fare totals tie constantly — and a regulator-facing leaderboard must never be arbitrary.",
      tag: "windows",
    },
    {
      id: "ola-t6",
      q: "Where does a scalar subquery earn its place in a fare read, and what happens when the inner query returns zero rows?",
      a: "A scalar subquery is contractually 0-or-1 row, 1 column — the clean way to compare each booking against a platform-level benchmark: WHERE fare > (SELECT AVG(total) FROM bookings) computes the benchmark once and answers 'above the platform average fare' (338.19 on this db). Zero rows: it yields NULL — not an error — and every comparison against NULL is UNKNOWN, so an above-average report returns zero rows with no complaint. That's theoretical on the full table (103 bookings always average) but ships regularly on filtered staging tables — one city, one night window — where the inner fold can legitimately be empty. The correlated cousin re-runs per outer row and answers 'above MY rider's own average' — a different question with a different cost profile. Saying which population the inner fold covers, and what happens when it's empty, is exactly what the follow-up is fishing for.",
      tag: "subqueries",
    },
    {
      id: "ola-t7",
      q: "Your completion-share query has a WHERE on status and a HAVING on share — walk me through which clause runs first and why the order matters.",
      a: "Logical evaluation runs FROM, WHERE, GROUP BY, HAVING, SELECT — where aliases are born — then ORDER BY. WHERE filters rows before folding: status = 'completed' discards cancelled and pending bookings before any aggregate touches them, which is fine for a completed-fare total and fatal for a completion SHARE, because the denominator just shrank to the numerator's population — denominator drift, the metric killer. HAVING filters groups after folding: 'cities whose completion share fell below 60%' is a group-level judgment and belongs there. The alias trap rides on the same order: SQLite resolves SELECT aliases in GROUP BY, HAVING and ORDER BY but never in WHERE, so the portable habit is the underlying expression everywhere except ORDER BY. When a filter's home is ambiguous, say the grain first — 'bookings above 500' is WHERE, 'cities with bookings above 500' is HAVING — and the clause chooses itself.",
      tag: "pipeline",
    },
    {
      id: "ola-t8",
      q: "The corporate desk says two statements were settled twice and one shows paid with no settlement at all. How do you find each, and what's the policy?",
      a: "Split-settlement detection: GROUP BY statement_id HAVING COUNT(*) > 1 — the cheapest duplicate census in SQL, and on this db it's five statements paid across two settlement rows. The paid-with-no-settlement case is the anti-join twin: statements LEFT JOIN settlements WHERE settlement.id IS NULL — six unpaid statements on this db, worth 15217, EXCEPT one of them carries a 'paid' status, which is precisely why the reconciliation exists: status and money disagree, and only folding both sides exposes it. Collapse is a DECISION, not a default: ROW_NUMBER() OVER (PARTITION BY statement_id ORDER BY paid_on DESC, id DESC) = 1 makes 'latest' deterministic, but folding two genuine part-payments into one hides a shortfall — so the honest version classifies coverage first (exact, partial, none) and only then dedupes the display layer. The graded habit: detect duplicates with an aggregate, dedupe with a window, and be able to say which rows your dedupe discarded and why finance agreed to lose them.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "ola-mcq-1",
      prompt: "bookings has 103 rows; 52 are completed ('delivered'). Which expression computes the completion percentage correctly?",
      choices: [
        "SUM(status = 'delivered') * 100 / COUNT(*)",
        "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(status) / COUNT(*)",
        "COUNT(status = 'delivered') * 100.0 / 103",
      ],
      answer: 1,
      why: "The conditional sum counts completions at the same fold as COUNT(*) counts placements, and 100.0 forces real division before truncation. Both guards — same-grain denominator, float promotion — in one expression.",
      notes: [
        { choice: 0, why: "SQLite accepts status = 'delivered' as a 0/1 expression, but INTEGER 100 forces integer division first: any share under 1% truncates toward 0 before multiplying." },
        { choice: 2, why: "COUNT(status) counts non-NULL statuses — essentially every booking, not the completed ones. This reports ~100% for almost any input." },
      ],
      difficulty: "easy",
    },
    {
      id: "ola-mcq-2",
      prompt: "A city cluster shows 45 bookings from 8 riders. What does `COUNT(DISTINCT customer_id)` capture that `COUNT(*)` does not?",
      choices: [
        "The cluster's fare revenue",
        "The number of unique riders — repeat bookings folded back to people",
        "The average bookings per rider",
        "Both return 45; DISTINCT changes nothing on joins",
      ],
      answer: 1,
      why: "COUNT(*) counts booking rows (45); COUNT(DISTINCT customer_id) counts people (8). The gap between them — bookings per rider — is the demand-intensity signal the two-grain census exists to expose.",
      notes: [
        { choice: 2, why: "That ratio is 45.0/8 — a different expression entirely. DISTINCT counts riders; it never divides." },
        { choice: 3, why: "DISTINCT changes everything after a fan-out: six bookings from one rider contribute 6 to COUNT(*) and 1 to COUNT(DISTINCT …)." },
      ],
      difficulty: "easy",
    },
    {
      id: "ola-mcq-3",
      prompt: "Which WHERE clause captures every night-shift booking — created between 22:00 and 05:00 inclusive — on a TEXT timestamp column?",
      choices: [
        "WHERE CAST(STRFTIME('%H', created_at) AS INTEGER) BETWEEN 22 AND 5",
        "WHERE CAST(STRFTIME('%H', created_at) AS INTEGER) >= 22 OR CAST(STRFTIME('%H', created_at) AS INTEGER) < 5",
        "WHERE STRFTIME('%H', created_at) >= '22' AND STRFTIME('%H', created_at) <= '05'",
        "WHERE created_at BETWEEN '22:00' AND '05:00'",
      ],
      answer: 1,
      why: "The night window wraps midnight, so it is an OR across two hour ranges. BETWEEN 22 AND 5 assumes low-before-high and returns nothing; the AND form can never be true because an hour is never both >= 22 and <= 5.",
      notes: [
        { choice: 0, why: "BETWEEN needs its low bound first. 22 AND 5 is an empty range — the classic midnight-wrap bug that silently reports a zero-booking night shift." },
        { choice: 2, why: "The two conditions are contradictory under AND. The shift would read as permanently empty — plausible-looking SQL, dead wrong number." },
      ],
      difficulty: "medium",
    },
    {
      id: "ola-mcq-4",
      prompt: "`SELECT r.name FROM riders r LEFT JOIN bookings b ON b.rider_id = r.id WHERE b.status = 'completed'` — what silently happened?",
      choices: [
        "Nothing — LEFT JOIN keeps every rider",
        "The WHERE turned it into an INNER JOIN for every rider who never completed a trip",
        "It now returns only riders with cancelled bookings",
        "Each rider appears once per completed booking — duplication is the bug",
      ],
      answer: 1,
      why: "Filtering the right table's column in WHERE kills the NULL-payload rows (NULL = 'completed' is UNKNOWN → discarded), collapsing the LEFT JOIN to an INNER. The registered-but-never-completed riders vanish — and the query still looks correct.",
      notes: [
        { choice: 0, why: "Unmatched riders carry b.status = NULL, which fails any equality test. The LEFT-ness survives only in the ON clause, never in WHERE." },
        { choice: 3, why: "Fan-out duplication is real for multi-trip riders — but it's a separate effect. The silent downgrade removes rows; it doesn't duplicate them." },
      ],
      difficulty: "medium",
    },
    {
      id: "ola-mcq-5",
      prompt: "statements.amount_cents is an INTEGER holding 925 (cents). Which expression reads the rupee value correctly?",
      choices: [
        "amount_cents / 100",
        "amount_cents / 100.0",
        "ROUND(amount_cents)",
        "CAST(amount_cents AS TEXT) || ' rupees'",
      ],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before the division: 925 → 9.25. Integer / 100 truncates — 925 cents reads as 9 — and every odd-cent row leaks half a rupee, which is exactly how a reconciliation quietly stops balancing.",
      notes: [
        { choice: 0, why: "INTEGER / INTEGER is integer division in SQLite. 925/100 = 9, not 9.25 — the missing 0.25 appears on every row whose cents aren't a multiple of 100." },
        { choice: 2, why: "ROUND of an integer returns the integer — it never divides. This prints 925 as if it were rupees." },
      ],
      difficulty: "medium",
    },
    {
      id: "ola-mcq-6",
      prompt: "A month-spine query folds bookings with GROUP BY month and adds LAG(COUNT(*)) OVER (ORDER BY month). What does the first row's prev-month column contain?",
      choices: [
        "0 — LAG defaults to zero",
        "The first month's own count — LAG wraps around",
        "NULL — there is no row before the first",
        "A syntax error — LAG cannot take COUNT(*)",
      ],
      answer: 2,
      why: "LAG looks one row back in the window's ordering; at the first row there is nothing behind it, so it yields NULL. Folding 2024-01 (8 bookings) first means the opening row carries NULL, not 0 — and COALESCE-ing it to 0 is a display decision, not a default.",
      notes: [
        { choice: 0, why: "LAG's third argument is the default — omitted means NULL, not 0. A coalesced 0 makes the first MoM delta look like real growth from nothing." },
        { choice: 3, why: "LAG over an aggregate is legal in SQLite precisely because windows evaluate after GROUP BY — the fold happens first, the window walks the folded rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "ola-mcq-7",
      prompt: "The pod wants cities whose COMPLETED bookings exceed 40, from a table where status varies. Which clause holds the filter — and why?",
      choices: [
        "WHERE completed_bookings > 40 — row filter, runs first",
        "HAVING SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) > 40 — group filter, runs after the fold",
        "LIMIT 40 — cap the output rows",
        "Either works — SQLite resolves both identically",
      ],
      answer: 1,
      why: "Completed-per-city is a group-level fact that only exists after GROUP BY folds the conditional sum, and group-level predicates live in HAVING. A SELECT alias cannot be referenced in WHERE — aliases are born in SELECT, which runs after WHERE.",
      notes: [
        { choice: 0, why: "WHERE cannot see aggregates or SELECT aliases at all — the query errors, or worse, the writer pre-filters rows and silently changes the denominator." },
        { choice: 2, why: "LIMIT caps OUTPUT rows after sorting — it never filters by value, and 40 completed bookings is a threshold, not a row count." },
      ],
      difficulty: "hard",
    },
    {
      id: "ola-mcq-8",
      prompt: "Two cab categories tie at the same fare total for 3rd place; the next is lower. The pod wants 'top three fare tiers'. Which rank function keeps both ties and no gap?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY fares DESC)",
        "RANK() OVER (ORDER BY fares DESC)",
        "DENSE_RANK() OVER (ORDER BY fares DESC)",
        "ORDER BY fares DESC LIMIT 3",
      ],
      answer: 2,
      why: "DENSE_RANK gives both tied categories rank 3 and the next distinct total rank 4 — ties share a rung, no gap, exactly 'top three tiers'. RANK would jump the next row to 5, implying a phantom fourth tier that doesn't exist.",
      notes: [
        { choice: 0, why: "ROW_NUMBER splits the tie arbitrarily — one category silently disappears from a leaderboard a regulator may read. Deterministic only if you add a tie-break and own the pick." },
        { choice: 3, why: "LIMIT 3 keeps two of the three tied rows at best — an arbitrary cut that changes with the engine's sort, not with the business rule." },
      ],
      difficulty: "hard",
    },
    {
      id: "ola-mcq-9",
      prompt: "Which query finds corporate statements with NO settlement row at all — reliably, even if some statement IDs are NULL in odd feeds?",
      choices: [
        "SELECT … FROM statements s WHERE s.id NOT IN (SELECT invoice_id FROM settlements)",
        "SELECT … FROM statements s LEFT JOIN settlements p ON p.invoice_id = s.id WHERE p.id IS NULL",
        "SELECT … FROM statements s INNER JOIN settlements p ON p.invoice_id = s.id WHERE p.amount IS NULL",
        "SELECT … FROM statements s WHERE EXISTS (SELECT 1 FROM settlements)",
      ],
      answer: 1,
      why: "The LEFT JOIN + IS NULL anti-join is NULL-proof: an unmatched statement survives with NULL payload columns, and the IS NULL arm keeps exactly the unsettled ones — 6 statements worth 15217 on this db.",
      notes: [
        { choice: 0, why: "NOT IN with even one NULL in the subquery makes the whole predicate UNKNOWN — the query returns zero rows silently. The classic anti-join landmine." },
        { choice: 3, why: "A bare EXISTS is uncorrelated — it asks 'do settlements exist at all', so every statement passes or none does." },
      ],
      difficulty: "hard",
    },
    {
      id: "ola-mcq-10",
      prompt: "bookings carries a completion stamp that is NULL until the trip completes. Which pair of counts is the pod's daily 103-versus-82 read?",
      choices: [
        "COUNT(DISTINCT id) versus COUNT(*)",
        "COUNT(*) versus COUNT(completion_stamp)",
        "COUNT(completion_stamp) versus COUNT(status)",
        "SUM(id) versus COUNT(*)",
      ],
      answer: 1,
      why: "COUNT(*) counts every booking row (103); COUNT(completion_stamp) counts non-NULL stamps only (82). The 21-row gap IS the not-yet-completed picture — demand in flight versus demand finished.",
      notes: [
        { choice: 0, why: "COUNT(DISTINCT id) equals COUNT(*) here — ids are unique. Neither expression sees the NULL stamp at all." },
        { choice: 2, why: "COUNT(status) skips only NULL statuses; status is NOT NULL, so it equals COUNT(*) = 103. The comparison measures nothing." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-ola-1",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The corporate AR sweep",
      brief:
        "Ola-flavored brief on the storefront db: the Ola-for-Business desk bills corporate travel accounts monthly, and the month-close pack must open with the collections sweep — statements issued with NO settlement row at all, count and value, one row, no commentary. The finance lead is explicit: 'status columns lie sometimes; I want the money side.' Probed facts: 6 of the 28 statements carry no settlement, worth 15217 (the fold reads integer cents and prints dollars) — and one of them even wears a 'paid' status, which is exactly why the sweep joins settlements instead of trusting the label.",
      ask: "Return one row: the count of corporate statements with no settlement and their total value in dollars.",
      template:
        "SELECT {1}(*) AS unpaid_invoices,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS unpaid_dollars\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.{3} IS NULL;",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the statement counter",
          why: "COUNT(*) counts the surviving unmatched statement rows — 6. SUM(*) doesn't exist, and MAX(*) would report one statement, not the size of the collections book.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-the-debt join",
          why: "LEFT keeps every statement and hands NULL payload columns to the unsettled ones — the unpaid rows ARE the answer. INNER would keep only statements that HAVE settlements and the sweep would count 0.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the unmatched arm",
          why: "p.id IS NULL is the anti-join test: when no settlement matches, every settlement column arrives NULL. Pointing the test at the LEFT side — i.id IS NULL — reads 0 rows forever, because statement ids are never NULL.",
        },
      ],
      distractors: ["SUM", "INNER", "i.id", "customer_id"],
      walkthrough:
        "An anti-join where the unmatched rows are the money. LEFT JOIN statements to settlements keeps all 28 statements; the six with no matching settlement row carry NULL settlement columns, and WHERE p.id IS NULL keeps exactly those. COUNT(*) prints 6 and SUM(amount_cents)/100.0 prints 15217 — cents divided to dollars, the house rule that keeps odd-cent rows honest. The sweep deliberately folds the settlement side rather than the status column, because one of the six unpaid statements wears a 'paid' label — status and money disagree, and only the join exposes it. INNER JOIN in the join slot keeps only matched statements and the sweep collapses to zero; SUM in the counter slot errors; and moving the IS NULL test to the left table (i.id) reads 0 rows forever because statement ids are never NULL — three plausible-looking queries, one that actually collects.",
    },
    {
      id: "cs-ola-2",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The demand calendar, month over month",
      brief:
        "Ola-flavored brief on the storefront db: Monday standup opens with the demand calendar — the month spine with last month folded alongside, because the delta IS the story ops manages. Probed facts: the trend runs 2024-01 at 8 bookings, 2024-02 at 9, 2024-03 at 8 — a plateau with a one-booking blip, exactly the shape that starts a 'what happened in February' thread. The fold covers ALL placed bookings; cancellations stay inside by definition, because the calendar measures demand placed, not demand kept. The deliverable is the opening three months with each month's previous-month count beside it.",
      ask: "Return the first three months with booking counts and the previous month's bookings beside each.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       COUNT(*) AS bookings,\n       {1}(COUNT(*)) OVER (ORDER BY STRFTIME('%Y-%m', o.created_at) {2}) AS prev_bookings\nFROM orders o\nGROUP BY month\nORDER BY month\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back window",
          why: "LAG walks the folded months and picks up the previous row's count — 2024-02's prev is 8. LEAD would look forward and the 'momentum' column would describe next month instead of last.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar direction",
          why: "The spine runs oldest first, so the look-back is over ascending months. DESC would silently flip the window — each month's 'previous' becomes the NEXT calendar month, and every delta lies.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the opening-quarter cut",
          noVerify: true,
          why: "The standup reads the opening quarter: 2024-01 through 2024-03. LIMIT 3 keeps exactly the three rows; a bigger cut buries the blip in a longer table nobody argues about.",
        },
      ],
      distractors: ["LEAD", "DESC", "5"],
      walkthrough:
        "A window over a fold — two stages, one query. GROUP BY month folds 103 bookings into a 14-month spine (8, 9, 8 to open), and LAG(COUNT(*)) walks the folded rows, stamping each month with its predecessor: 2024-01 carries NULL because nothing precedes it, 2024-02 carries 8, 2024-03 carries 9. The NULL is information, not a bug — there was no previous month in the window, and coalescing it to 0 would fabricate growth from nothing. The window's ORDER BY repeats the STRFTIME expression because window ordering can't see the SELECT alias; direction ASC matches the calendar so 'previous' means 'earlier'. LEAD in the window slot turns the momentum column into next month's count; DESC in the direction slot flips every look-back to a look-forward; LIMIT 5 dilutes the opening-quarter ask. The Monday habit: print the delta — 2024-02's +1 and 2024-03's −1 — and let the fold, not the commentary, carry the story.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-i", why: "Fare lines per booking — the join-back read that turns a trip id into what was actually charged, the warm-up of most Ola screens." },
    { slug: "unique-orders-and-customers-per-month", why: "The city-month two-grain census — bookings and riders folded side by side, the exact muscle of every pod review opener." },
    { slug: "customers-who-never-order", why: "Registered riders with zero bookings — the dormant-demand anti-join the growth pod runs before any re-engagement push." },
    { slug: "sellers-with-no-sales", why: "Fleet partners whose categories never moved — the supply-side anti-join that flags dead capacity in a city's fleet bench." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Riders who opened the app but never booked — event-without-outcome reads that quantify the leak between demand and dispatch." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every city or category leaderboard, said out loud with the 1,1,3 pattern." },
    { slug: "department-top-three-salaries", why: "Top-3 categories per city via DENSE_RANK with join-backs and NULL groups — the hard screen closer in leaderboard clothing." },
    { slug: "immediate-food-delivery-ii", why: "The completion-share rate: a conditional count ratio where the denominator is the whole test — Ola's completion question in textbook form." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a cancelled count alongside — status-aware aggregation on the demand calendar ops reads every Monday." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill Ola's ratio questions orbit." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — driver-match confirmation rates, NULL policy and rounding in one deliverable." },
    { slug: "average-selling-price", why: "Period-weighted pricing from line items — fare-per-trip ratios where the weighting choice changes the answer, a favorite Ola follow-up." },
    { slug: "trial-balance-check", why: "Debits-equal-credits in one conditional SUM — the ledger reflex the incentive and settlement tables reward before any payout ships." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the Ola Money wallet statement read: money in, money out, net per rider, cents handled honestly." },
    { slug: "fix-names-in-a-table", why: "Rider-manifest normalization — ALL-CAPS name feeds fold to proper case before any per-person dedupe or corporate reconciliation can work." },
    { slug: "the-most-recent-three-orders", why: "Per-rider latest-3 via window — the app's 'recent trips' rail: ROW_NUMBER with a PARTITION and a deterministic tie-break." },
  ],
};
