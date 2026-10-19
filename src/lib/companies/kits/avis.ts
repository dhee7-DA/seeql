// Avis — Wave-11 (Task 102), mobility domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Airport-counter car rental SQL on a reservation-funnel + fleet-partner-concentration angle (distinct from
// hertz's counter-to-return fleet-rotation framing): the storefront db read as a reservation-to-pickup
// sandbox — customers are renters (region = pickup market), orders are rental agreements (created_at =
// reservation, shipped_at = the vehicle-out stamp, the 82-stamped/2.98-day booking-ahead clock; delivered =
// returned-and-settled 52, shipped = on-rent 30, pending = reserved-awaiting-pickup 14, cancelled = no-show 7),
// order_items are agreement lines (quantity = rental days, unit_price = the locked day rate), products =
// bookable vehicle classes (category = fleet family, stock = rotation pool), suppliers = fleet/leasing
// partners, invoices/payments = rental statements + card rails (card 16 legs 37,364.00 vs wire 11 legs
// 32,248.00), expenses = depot opex, ledger_entries = the GL (INTEGER cents — the dollar read is
// amount_cents / 100.0). Pool provenance: company-pools.md carries NO Avis section (0 tagged rows) — all
// 10 topic slug sets and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows)
// and say so in brief P4. Facts source: scripts/company-facts.md (incl. the wave-8+9 canonicalized cells),
// plus one read-only probe of db/custom.db this session that verified both cases' slot cells and derived the
// per-partner rental-day cells quoted in cs-avis-2/dayInLife (Midwest 109 / Shenzhen 99 / Nordic 82 /
// Pacific 80 / Alpine 77 / Andes 51). Every case slot is mechanically verified by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: avis is NOT yet in registry COMPANY_META — wire id "avis",
// domainId "mobility", name "Avis",
// tagline "We Try Harder SQL: the reservation funnel, no-show leak and fleet-partner book",
// accent "text-orange-400" to match this header exactly.
// Wave-3x expansion (Task 103): APPEND-ONLY below the wave-11 entries — brief 4→6, dayInLife 3→4,
// metrics 8→12, topics 10→15, theory 8→24 (avis-t9..t24), mcqs 10→30 (avis-mcq-11..30), cases 2→6
// (cs-avis-3..6), problems 16→32. Pool provenance unchanged: 0 tagged rows, every new topic/problem
// slug theme-curated from company-pools.md sql rows (no w*/d*/f*). New case slot cells + every
// distractor consequence probed read-only vs db/custom.db this session (trusted bench 139.66/72;
// July 2024 = 8 agreements / 2 no-shows / 1,193.86; intensity 9.5/7.4/5.6 at a 10-agreement floor;
// four-way 4-agreement tie pinned at rung 6 under RANK). Every case mechanically verified by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const avisKit: CompanyKit = {
  id: "avis",
  domainId: "mobility",
  name: "Avis",
  tagline: "We Try Harder SQL: the reservation funnel, no-show leak and fleet-partner book",
  accent: "text-orange-400",

  brief: [
    "**Avis** is the airport-counter network that turned being number two into a strategy — *'We Try Harder'* is a service contract the data org runs like an SLA. The business is a reservation-to-pickup funnel wearing a fleet: every agreement is booked before it earns, the gap between booking and {orange:vehicle-out} is dead latency, and the bookings that never show are fleet hours nobody can bill. This kit maps the storefront db onto that world: the 16 customers rows are renters (region = pickup market), the 103 orders are rental agreements worth **34,833.28**, and the 251 order_items rows are agreement lines — quantity = rental days, unit_price = the daily rate each line locked. The 16 products are bookable vehicle classes supplied by 6 fleet/leasing partners. The status map is fixed: delivered = returned-and-settled (52, 50.5%), shipped = on-rent (30, 29.1%), pending = reserved (14, 13.6%), cancelled = {rose:no-show} (7, 6.8%).",
    "The data org splits into reservation ops (the funnel desk), fleet revenue management (the day-rate and utilization seat) and a small settlement pod, and they read the same agreement spine at different grains. The heartbeat is the reservation clock: an agreement books at created_at and `shipped_at` stamps the day the renter drives out — **82 of 103 agreements** carry the stamp, averaging **2.98 days** booking-ahead with a 2–4 day spread, while the 14 reserved rows have none yet (a population definition, not a cleanup job). The leak is the second story: 7 agreements die as no-shows and the share is not flat — *APAC runs 8.1% against the US's 5.3%* — which is why the reminder-cadence budget is a per-market decision. Money sits one layer down: rental statements and card legs in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are funnel-then-denominator with a concentration accent. A typical loop opens with a **two-grain market census** — EU runs 45 agreements from just 8 renters (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'does a no-show count in your pickup rate?'*), then into the partner ledger where the 3-table chain ends in fleet-partner concentration: Nordic Gadgets AB turns 32% of the book and Midwest Hardware Co 26.7% — a two-partner majority. Late rounds walk the {sky:14-month agreement spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or run the one-pass fate census where the {violet:FILTER branches} must reconcile to 103 by construction. Candidates who state the stamp filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Avis section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: reservation funnels, no-show censuses, partner-ledger chains, tie-heavy concentration ladders and the cents-safe statement spine. Do the topics in order, then run all six case studies on the live storefront db: one rebuilds the {rose:no-show census} the counter standup opens with, the other rebuilds the {amber:fleet-partner ledger} revenue management re-cuts monthly, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting... The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
    "The settlement pod runs the money half of the counter and reads the same funnel through INTEGER cents: 28 rental statements against 27 payment legs, where the dollar read is always `amount_cents / 100.0`. The rails split cleanly — {sky:card legs} (16 legs, 37,364.00) serve the counter's walk-up traffic while {violet:wire legs} (11 legs, 32,248.00) serve corporate accounts — and **5 statements settle on both rails**, which is why rail attribution is a per-leg join, never a per-statement guess. Coverage is the pod's scoreboard: 21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — net-30 terms against a 28.4-day average settlement clock, fastest 13, slowest 84. The anomalies are named, not averaged: a void statement that still debited (#11, 925.00) and a paid-status statement with zero legs behind it (#28, 1,756.00) — *the status column is a claim; the payment rows are the ledger*.",
    "The expansion screens drill the same funnel-then-denominator habit deeper, so prep that way: rebuild the **14-month spine** first (2024-01 to 2025-02, trough 1,193.86 in July against the 3,731.97 open), then the {amber:renter-intensity census} (US 9.5 agreements per renter against EU's 5.6 — intensity is inverse to renter count), then the four-way tie on the renter ladder — four renters at 4 agreements each, where RANK, DENSE_RANK and ROW_NUMBER disagree about who shares a rung. The four new case files cover exactly those: a trusted-bench vet (Nordic 4.6 and Alpine 4.8 are the only ratings at 4.5-plus), the July trough read, the intensity census and the shared-rung ladder. *State the denominator, the stamp filter and the grain before you write the SELECT* — and the cents rule never sleeps: `amount_cents / 100.0`, or the odd-cent rows eat you.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the funnel refresh. A reservation-ops analyst opens the pickup dashboard before the counters staff up: did overnight reservations land, does any agreement show a vehicle-out stamp while status still reads pending, does the one-pass fate census reconcile — 52 returned-and-settled + 30 on-rent + 14 reserved + 7 no-show = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If booking-ahead drifts off the **2.98-day** norm — LATAM runs slowest at 3.5 days, APAC fastest at 2.93 — the ready-line queue gets re-cut before revenue management's morning read ships.",
    "**11:30 —** Midday is the concentration read. Revenue management wants the partner ledger re-cut — Nordic at 32% of the book, Midwest at 26.7%, {amber:two partners over the half} — beside the trusted-bench check (Alpine 4.8 and Nordic 4.6 are the only partner ratings at 4.5-plus) and the utilization cell the probe keeps confirming: Midwest's ledger turns 109 rental days against Andes' 51. Loyalty wants the renter ladder handled honestly — four renters tie at 4 agreements each, so *shared rungs, named policy* — and a regional lead wants agreements per renter beside renter counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the revenue-review argument*.",
    "**15:40 —** The afternoon tilts toward settlement money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217.00** — before billing sends a single fuel-and-fees statement; the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00 settled) against net-30 terms and a 28.4-day average settlement; and the anomaly list gets walked line by line: a void-but-charged statement (#11, 925.00) and a paid-status statement with zero settlement legs behind it (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
    "**19:20 —** The EOD writeup closes the loop before the notebook shuts. Tomorrow's revenue-review pack gets drafted tonight: the **month spine with LAG deltas** (open 3,731.97, trough 1,193.86, the two double-cancellation months named out loud), the intensity census with its floor stated (EU 45-from-8 beside US 19-from-2), and the ladder print where four renters share rung 6 — *shared rungs, named policy, again*. The settlement pod's open items get one line each: 6 never-collected statements worth 15,217.00, the partial #25 at 4,000.00 of 6,148.00, and the paid-status lie #28 flagged for billing's morning call. The last pass is the integrity sweep — trial balance 181,080 against 181,080, delta zero, fate census still 103 by construction — and then {emerald:the close ships clean} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Pickup rate", what: "Agreements with a vehicle-out stamp ÷ ALL agreements booked: 82 of 103 (79.6%). The top-of-funnel number reservation ops reads every Monday — the 14 reserved rows are 'not yet', never a silent zero." },
    { name: "Booking-ahead window", what: "created_at to counter drive-out (created_at → shipped_at) over stamped agreements only: 2.98-day average, range 2–4. The population definition ships with the number — reserved agreements have no clock and must not dilute it." },
    { name: "No-show share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by pickup market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The number that prices the no-show fee and sizes the reminder cadence per market." },
    { name: "Rental-day throughput", what: "498 rental days turned across 251 agreement lines (2.44 lines per agreement, max 3 days on a line). The utilization read: lines count bookings, summed quantity counts days the fleet actually earned." },
    { name: "Agreement book", what: "Total booked value: 34,833.28 across 103 agreements, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the fleet-tiering story — one 1,088.44 agreement outweighs the smallest 42 combined." },
    { name: "Partner concentration", what: "Share of the book by fleet/leasing partner: Nordic Gadgets AB 32%, Midwest Hardware Co 26.7% — a two-partner majority across the six-partner bench. One partner renegotiation moves a quarter." },
    { name: "Renter concentration", what: "Share of the book from renters spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The top renter runs 24 agreements and 7,262.35 — the Preferred cohort that staffs the loyalty desk." },
    { name: "Counter collections", what: "Billed versus settled: 21 exact settlements (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-collected worth 15,217.00 — against net-30 terms and a 28.4-day average settlement, fastest 13, slowest 84." },
    { name: "Settlement velocity", what: "Days from statement issue to first settlement leg on the paid book: 28.4 average, fastest 13, slowest 84, against net-30 terms. The AR desk's pulse — a drift past net-30 is a dunning-cadence problem, not a customer mood." },
    { name: "Payment rail mix", what: "Card legs (16 rows, 37,364.00) versus wire legs (11 rows, 32,248.00) — counter walk-up traffic versus corporate billing. Five statements settle on both rails, so rail attribution is a per-leg join, never a per-statement guess." },
    { name: "Reserved backlog", what: "14 agreements (13.6%) sit pending with no vehicle-out stamp — the ready line's live inventory. A population, not a cleanup queue: the booking-ahead clock has not started for any of them and must not dilute the 2.98-day average." },
    { name: "Ledger trial balance", what: "Debits 181,080 against credits 181,080 — delta zero before the close ships. Cash nets to 44,196; when this check breaks, every counter number above it is provisional." },
  ],

  topics: [
    {
      name: "The reservation-to-pickup funnel",
      why: "Every Avis screen opens with the funnel: agreements booked, vehicle-out stamped (shipped_at), returned-and-settled — each stage a conditional count over a status or timestamp. The trap is calling an on-rent agreement 'returned' — 30 versus 52 on this db — and the second trap is the denominator: reserved rows stay in a pickup-rate base and drop out of a booking-ahead base, and the panel wants you to say which before writing SQL.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "immediate-food-delivery-ii", "funnel-step-conversion", "average-time-of-process-per-machine", "analyze-subscription-conversion"],
    },
    {
      name: "Two-grain counter censuses",
      why: "Agreements and renters are different grains of the same join, and every market census here reports both: EU runs 45 agreements from 8 renters while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is counter load and which is renter coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides where the ready line grows.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "find-golden-hour-customers"],
    },
    {
      name: "Whitespace & no-show anti-joins",
      why: "The no-show follow-up list is an anti-join — reservations left-joined to their vehicle-out stamps, keeping the NULL side — and so is every never-rented cohort read. Join type decides who survives: an agreement without a renter is corruption; a renter without agreements is whitespace. On this db the renter anti-join returns a confident zero, and proving that zero is part of the job — on staging tables it would be the answer.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier", "books-with-null-ratings"],
    },
    {
      name: "Partner-ledger chains",
      why: "Fleet-partner reporting is a 3-table chain — agreement lines to the vehicle class each booked, the class to the partner that fleets it — and Avis's concentration story lives at the end of it: Nordic turns 32% of the 34,833.28 book, Midwest 26.7%. The follow-up is always the fan-out: join lines in and COUNT(*) silently stops counting agreements — it counts lines, 251 of them, and sums rental days you never asked for.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "sales-analysis-i", "classes-more-than-5-students", "students-and-examinations"],
    },
    {
      name: "Concentration leaderboards",
      why: "Top-partner-per-region, hardest-worked class, Preferred-tier renters — concentration reporting is leaderboard reporting, and ties are guaranteed at counter scale: four renters sit at 4 agreements each on this db. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer renters, not syntax — and the LIMIT-1-OFFSET-1 habit breaks on exactly these ties.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "number-of-employees-who-met-the-target", "customer-placing-the-largest-number-of-orders", "top-travellers"],
    },
    {
      name: "Day-rate bands with CASE",
      why: "Vehicle classes are CASE-banded — the rate card runs a 14.99 shuttle class to a 199.99 flagship, split 8 mid classes averaging 111.50 against 8 at 32.06 — with fixed edges the pricing desk publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "find-churn-risk-customers", "net-revenue-retention", "maximum-transaction-each-day"],
    },
    {
      name: "Booking-ahead month walks & LAG",
      why: "The 14-month agreement spine (2024-01 to 2025-02) is the revenue-management call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) named against the 3,731.97 open. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. The no-show story rides the same spine: July and November carry 2 cancellations each, and the walk is how that pattern gets defended.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "growth-accounting", "hopper-company-queries-ii"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled beside never-settled, this quarter beside last — and EXCEPT answers 'which billed agreements never settled'. UNION dedups whole rows silently, which makes it a correctness question, not a style one: a partner row that vanishes from a stack is a lost renegotiation lever. The settlement anti-join (6 never-collected statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board gets returned, on-rent, reserved and no-show in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the counter is calling. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "capital-gain-loss", "find-users-with-high-token-usage", "recyclable-and-low-fat-products"],
    },
    {
      name: "Billing & cents discipline",
      why: "Returned is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the counter world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) serve the counter, wire legs (11, 32,248.00) serve corporate billing — and 5 statements settle on both.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "monthly-transactions-ii"],
    },
    {
      name: "Window frames & running totals",
      why: "The pickup dashboard runs cumulative reads — bookings-to-date, booked value rolling — and the frame decides whether tied timestamps walk together or step apart. SQLite's default frame with ORDER BY is RANGE, so two agreements sharing a booking second jump the running total in one step; naming ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW out loud is the discipline. Frames also restart at every PARTITION BY, which is how a per-market running total stays a per-market total.",
      slugs: ["last-person-to-fit-in-the-bus", "find-cumulative-salary-of-an-employee", "game-play-analysis-iii", "list-the-products-ordered-in-a-period", "users-with-two-purchases-within-seven-days", "calculate-orders-within-each-interval"],
    },
    {
      name: "Self-joins & pairing logic",
      why: "Counter ops pairs the table with itself: two bookings from the same market inside 48 hours, consecutive stamps on one vehicle class, renters sharing a pickup window. A self-join without an ordering guard (a.id < b.id) reports every pair twice plus the degenerate self-pair, and the ops board doubles its incident count. Half the skill is deciding what a pair IS before writing the ON clause.",
      slugs: ["consecutive-available-seats", "tree-node", "symmetric-pairs", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "Nested gates & semi-joins",
      why: "Below-the-line reads go nested: renters whose lifetime spend crosses the Preferred bar, markets whose no-show count beats the fleet-wide mean, classes priced above the rate-card median. EXISTS answers 'at least one' and stops at the first match; IN materializes a list and inherits the NULL-poisoning trap; a scalar subquery in SELECT re-runs per row. Picking the shape is the answer — the SQL is transcription.",
      slugs: ["game-play-analysis-iv", "market-analysis-i", "investments-in-2016", "confirmation-rate", "trips-and-users", "returns-rate-by-category", "actors-and-directors-who-cooperated-at-least-three-times"],
    },
    {
      name: "Grand-total stacks & labelled tails",
      why: "Board packets stack populations in one result set — reserved beside stamped beside no-show, card rails beside wire — and append a grand row so the deck foots visibly. UNION ALL plus a literal label is the shape; UNION's silent dedup has no place in a stack where a repeated count is legitimate. The reconciliation habit: the TOTAL row must equal the sums above it, or the stack is lying.",
      slugs: ["league-statistics", "tournament-winners", "count-apples-and-oranges"],
    },
    {
      name: "Text discipline & readable counters",
      why: "Counter exports are read by humans at 06:00 — renter names title-cased for the loyalty mail-merge, class lists folded into one cell per partner, month keys as zero-padded text. GROUP_CONCAT folds rows into a string whose member order is not guaranteed on this build, and format drift is a data-quality bug the panel expects you to catch before the export does.",
      slugs: ["group-sold-products-by-the-date", "fix-names-in-a-table", "invalid-tweets", "queries-quality-and-percentage", "find-cities-in-each-state", "find-the-team-size", "bikes-last-time-used"],
    },
  ],

  theory: [
    {
      id: "avis-t1",
      q: "Your reservation report joins renters to agreements. When do you INNER and when do you LEFT — and what silently breaks if you filter a status in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins agreements to renters: an agreement with no renter row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from renters: the renters with no agreements ARE the answer, arriving with NULL agreement columns. The classic break: filtering status = 'cancelled' in WHERE after the LEFT JOIN kills every NULL-payload renter row — the LEFT quietly became an INNER and the cohort you were hunting vanished. The fix is moving the predicate into ON or an outer query. On this db the renter anti-join returns a confident zero never-renting renters — all 16 renters appear in the agreement table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table ships an empty no-show follow-up list that looks like a victory. A funnel desk that trusts unverified zeros stops sending reminder emails exactly when it matters.",
      tag: "joins",
    },
    {
      id: "avis-t2",
      q: "Revenue management wants each fleet partner's share of the book in the same query that ranks them. How do you build it — and what does the window total when the query carries a WHERE?",
      a: "The share engine is a window total: SUM(line_book) OVER () beside each partner's SUM, then 100.0 * partner / total in one pass — no self-join, no second scan. The rule candidates miss: windows evaluate AFTER WHERE, so the OVER () denominator is the survivors of the filter, not the table. Add WHERE s.rating >= 4.5 for the trusted bench and the shares re-base onto the bench's book only — a different metric wearing the same column name, so the filter has to ship in the title. The ranking layer is RANK over partner book — no ties on this six-partner ledger, but write the tie-breaker (book, then name) anyway, because the day Andes ties Pacific the query must already have a policy. PARTITION BY region is the one-word upgrade when the concentration read goes per-market: same window, new denominator, and the two-partner-majority story (Nordic 32%, Midwest 26.7%) re-tests differently inside every region.",
      tag: "windows",
    },
    {
      id: "avis-t3",
      q: "The census says 103 agreements, 251 lines and 498 rental days. Same business, three numbers — why, and which one does each stakeholder actually want?",
      a: "They are three grains of one spine, and mixing them is the counter's most common reporting bug. 103 is agreements — COUNT(*) on orders, the counter-load number the funnel and pickup rate hang on. 251 is agreement lines — join order_items in and COUNT(*) silently counts lines, 2.44 per agreement on this db, which is the booked-structure number pricing and rate-band work needs. 498 is rental days — SUM(quantity), the utilization number fleet ops manages, capped at 3 days per line by the seed data's longest single booking. Each stakeholder wants exactly one: a regional lead reads agreements, revenue management reads line structure, fleet ops reads days. Saying 'one row per what?' for every COUNT is the habit the panel grades, because every downstream rate — pickup share, no-show share, days-per-agreement — changes meaning the moment the join fans the grain out. State the grain in the column alias and the argument stays short.",
      tag: "aggregation",
    },
    {
      id: "avis-t4",
      q: "shipped_at is NULL until the renter drives out. What is your policy for the booking-ahead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped agreements have a lead time, so the report measures booking-to-vehicle-out for the 82 of 103 agreements that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL agreements returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 reserved plus 7 no-show rows, which is a feature, not a bug — that gap IS the funnel's live inventory. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day drive-outs for reservations that have not started, poisons the 2.98 baseline the ready line is planned off, and hides the 14-row reserved cohort the funnel exists to watch. A report whose WHERE clause is doing definitional work without saying so is exactly what an Avis reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "avis-t5",
      q: "The funnel review wants no-show share per market, for markets carrying at least twenty bookings. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' classifies one agreement, in WHERE (or better, inside a FILTER or SUM(CASE) branch so the other fates survive the same scan); putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The twenty-booking floor is a group-level fact — HAVING COUNT(*) >= 20 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor keeps exactly two markets — EU at 45 and APAC at 37 — and drops US (19) and LATAM (2), which is the concentration call the reminder-budget conversation turns on. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a market shortlist and an error. And the share itself, 100.0 * SUM(flags) / COUNT(*), puts the 100.0 BEFORE the division: flags-over-count is integer division and the no-show map truncates 6.8% toward a displayed 0.",
      tag: "pipeline",
    },
    {
      id: "avis-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 agreements always produce a mean (338.19 on this book). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: cut the spine to a thin month and the big-ticket list evaporates. The correlated cousin (compare each agreement to ITS renter's own average) re-runs per outer row and answers a different question — 'is this agreement big for THIS renter' rather than for the counter — at a different cost, and it inherits the same empty-inner behavior when a renter's slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole report empties. State the inner fold's population and its empty-case behavior unprompted; that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "avis-t7",
      q: "The reservation trend buckets agreements by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the booking trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and holiday-week drive-outs land exactly there. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The calendar has a shape worth defending too: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, and both cancellation-heavy months (2 no-shows each) sit in July and November — date discipline is how that seasonality story stays honest when someone wants to 'smooth it out'.",
      tag: "dates",
    },
    {
      id: "avis-t8",
      q: "Billing says a rental statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; a partial (#25, 4,000.00 of 6,148.00) needs the coverage CASE, not a binary paid flag. The coverage census must read 21 exact (65,612.00 both sides), 1 partial, 6 none — and it foots only because classification happens at statement grain before any rollup. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Rails close the read: card legs (16, 37,364.00) versus wire (11, 32,248.00), and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "avis-t9",
      q: "The board wants booked value to date beside each month, and a reviewer complains the cumulative 'jumps' when two agreements share a booking second. Walk me through the frame semantics — and what changes when the walk is re-cut per market with PARTITION BY.",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes peers — every agreement tied on created_at enters the running sum in one step, which is the jump the reviewer saw. The fix is naming the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row, and a 3-month rolling read is ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, whose edges degrade honestly at the spine's start. PARTITION BY is the other half of the semantics: the frame — and the running total — restart at every partition boundary, so a per-market walk sums that market's rows from its own first month, not the fleet's. Two instincts to say out loud: the window only sees rows that survived WHERE, and the ORDER BY inside OVER is the walk's definition — change it and you have silently authored a different metric. On the Avis spine that means month buckets ('%Y-%m') for the board, and agreement grain only when the tie policy has been stated first.",
      tag: "frames",
    },
    {
      id: "avis-t10",
      q: "Billing wants the list of statements billed this quarter that never collected, and a teammate proposes NOT IN. What do you reach for instead, and what does each shape promise?",
      a: "Three shapes, three contracts. EXCEPT subtracts the right side's values from the left's — clean when both sides project the same columns, but it dedups silently, so a repeated key collapses and the row count stops meaning rows. NOT IN is the trap: one NULL in the subquery list poisons every comparison and the whole report empties while looking valid. NOT EXISTS is the shape I ship — a correlated half-join that stops at the first match, immune to the NULL list, honest about row counts. On this book the never-collected list is 6 statements worth 15,217.00, and I can arrive at it any of the three ways; the deliverable includes saying which semantics the number inherits, because the EXCEPT form and the NOT EXISTS form can disagree by a duplicate and nobody notices until the close. Column alignment is the mechanical gate: EXCEPT pairs columns by position, so one swapped column turns the anti-join into noise. Anti-joins are the settlement pod's daily bread — the shape choice is the review artifact.",
      tag: "setops",
    },
    {
      id: "avis-t11",
      q: "The close packet stacks reserved, stamped and no-show agreements into one result set and appends a grand-total row. How do you build it so nobody doubts the footing?",
      a: "UNION ALL branches with aligned columns — same count, same order, compatible types — plus a literal source label per branch so every row announces which fate it came from, and a TOTAL-labelled grand row so the deck foots visibly. Plain UNION is disqualified here on semantics, not style: it dedups whole rows, and in a stack a repeated count across branches is legitimate data, not noise — one collapsed row and the packet undercounts silently. Two disciplines make the stack trustworthy: the branches must be reconcilable (52 returned + 30 on-rent + 14 reserved + 7 no-show = 103 by construction), and ORDER BY applies to the stacked result, not to branches — sort by a sort-key column you control, never by the label text. The card-versus-wire rail stack is the same shape at money grain: 16 card legs and 11 wire legs, five statements legitimately appearing on both rails, and the TOTAL row the reviewer recomputes before reading anything else. If a reviewer can recompute the total from the labels above it, the stack is done; if they can't, the stack is a guess wearing a grid.",
      tag: "stacks",
    },
    {
      id: "avis-t12",
      q: "Marketing wants two lists: renters with at least one no-show, for a win-back call, and renters with none. One query shape or two — and which keyword keeps the row counts honest?",
      a: "One shape, two polarities: EXISTS for the has-no-show list, NOT EXISTS for the clean book — both correlated on the renter key. The property being graded is row-count safety: a semi-join returns each renter exactly once no matter how many cancelled agreements match, where a plain JOIN fans the outer row once per match and every COUNT drifts. IN would work for the positive list but inherits the NOT IN NULL-poisoning trap on the negative one — one NULL renter key in a staging table and the clean-book list empties while looking valid. On the clean core db every renter appears in the agreement table somewhere, so the anti side's job is proving a confident structure rather than finding rows; on staging extracts the same query is the win-back list's guardrail. Say the survival rule out loud — who must survive, and what NULL means for them — and the panel stops worrying about the rest of the query. The win-back list and its complement should union back to all 16 renters; that identity is the check the campaign brief actually cares about.",
      tag: "exists",
    },
    {
      id: "avis-t13",
      q: "You stage the funnel in a WITH before ranking markets. When does the CTE earn its keep — and what does SQLite actually do with it at execution time?",
      a: "The CTE earns its keep as a named grain: stage agreements-per-market once, name it, rank it, and every reader can point at the row where the fan-out did or didn't happen. That readability is a correctness tool — most funnel bugs I've shipped were grain bugs, and a named stage makes the grain arguable in review. Mechanically, SQLite does not promise materialization: a plain WITH is typically inlined into the outer query, referenced twice it may compute twice unless you say MATERIALIZED — so a CTE is not a cache and never a performance plan. The instinct I apply: one scan with conditional folds (FILTER or SUM(CASE)) beats two CTE scans glued by a join, unless the stage is genuinely reused or the nesting is too deep to review. On the Avis funnel the fold wins — the fate census is one pass over orders, not a pipeline of stages — and the CTE appears when a window needs its input grain staged first, as in any ranked-ladder read where the rank must compute over the full census before the filter is applied. Name stages for humans, not for the planner; the planner flattens them anyway.",
      tag: "ctes",
    },
    {
      id: "avis-t14",
      q: "A share report divides by a slice that can be zero on thin staging cuts, and a teammate wraps half the columns in COALESCE 'to be safe'. Where is COALESCE right, where is it a lie — and what does NULLIF do here?",
      a: "COALESCE is right in the display layer: a NULL share prints as a dash or 'n/a' because the cell is presentational and the NULL is honest. It is a lie on measurement columns and inside aggregates: IFNULL-ing a latency or a share to 0 converts 'no measurement' into 'a measurement of zero', and the deck will quote that zero forever — a thin staging cut with no stamped pickups has no pickup rate, not a 0% rate. NULLIF is the division guard: NULLIF(denominator, 0) turns a zero denominator into NULL, the division yields NULL, and the row reads as unmeasured — the truthful state of a slice with nothing in it. SQLite happens to return NULL for division by zero anyway, but the guard states intent and travels to engines where it errors. The policy sentence the panel wants: aggregates ignore NULLs by design, so NULLs flowing INTO a fold are fine, NULLs manufactured by COALESCE before a fold are not, and every IFNULL ships with a comment saying which kind of NULL it is destroying. 'Safe' blanket coalescing is how a funnel quietly starts reporting fake zeros at exactly the markets the funnel exists to watch.",
      tag: "coalesce",
    },
    {
      id: "avis-t15",
      q: "Booking-ahead is julianday(shipped_at) - julianday(created_at). What type comes back, where does rounding bite, and when are integer days a safe simplification?",
      a: "julianday returns REAL days — fractional, since noon is x.5 — so the delta is REAL and the fleet's 2.98-day average over 82 stamped agreements is a real average, not a rounded display. Rounding bites in two places: CAST(delta AS INTEGER) truncates toward zero (2.98 prints as 2; a 2.5-day late drive-out floors to 2), and ROUND applied at the wrong layer rounds an average you already truncated. The deck rule: keep REAL inside the math, ROUND(delta, 1) only at the display edge. Integer days are safe exactly when the data's granularity is coarser than the fraction — on this book latencies run 2 to 4 whole days, so the truncation damage is mild; on a fleet with hourly drive-outs it systematically understates every late pickup. The second date instinct is bucket discipline: STRFTIME('%w', created_at) gives weekday for the weekend staffing curve, '%Y-%m' gives the spine, and both return TEXT — quote the literal or the comparison matches nothing, which is the quoted-versus-unquoted bug that empties month filters silently. Dates are the one column family where display formatting and storage format disagree daily; treat every conversion as a definitional act.",
      tag: "julianday",
    },
    {
      id: "avis-t16",
      q: "SELECT customer_id, MAX(total) FROM orders GROUP BY region — this runs without error on the SQLite build we ship. What comes back, and why is it the most dangerous legal query in the kit?",
      a: "SQLite's laxity: bare columns — non-aggregated columns alongside an aggregate — are filled from an arbitrary row of the group, and the docs promise nothing about which one. So MAX(total) pairs with SOME renter id in that region, not necessarily the renter of the maximum — the query looks like an argmax and isn't. Strict engines reject the shape outright, which is the honest behavior. The legitimate forms: a window argmax (ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC), filter to 1) or a join-back on the group max — both state their tie policy. Why it's dangerous here specifically: the flagship agreement is 1,088.44 on a book averaging 338.19, and 'who booked the flagship' is exactly the story an exec asks for — a bare-column accident can print a different renter with total confidence, and the wrong renter gets a loyalty call they didn't earn. If I inherit this pattern in a dashboard, I rewrite it before I extend it; luck is not a tie policy. The general rule I state in review: every non-aggregated column in an aggregate query must be either the GROUP BY key or inside an aggregate — no engine's leniency changes that contract.",
      tag: "groupby",
    },
    {
      id: "avis-t17",
      q: "The ops board wants returned, on-rent, reserved and no-show counts in ONE scan. FILTER (WHERE …) versus SUM(CASE …) — which do you ship, and what do you promise about reconciliation?",
      a: "Both compute the same plan in SQLite; I choose by audience and portability. FILTER (WHERE status = 'delivered') is SQL:2004 syntax — SQLite 3.30-plus and Postgres speak it, MySQL does not — and it reads like the census it is. SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin, verbose but universal; the two agree exactly when the CASE carries an explicit ELSE 0, and I write the ELSE every time, because an omitted ELSE leaks NULLs that SUM happens to skip here but that break every non-SUM fold elsewhere. The promise that matters is the reconciliation identity: the branches must sum to COUNT(*) — 52 returned plus 30 on-rent plus 14 reserved plus 7 no-show equals 103 by construction — and that identity ships beside the query, because it is what catches a silently widened status set (a fifth status appearing next quarter fails the sum loudly). Four sequential queries are four chances to drift while the counter is calling; one scan with a stated identity is the ship. Portability note for the panel: when I port the census to MySQL, I swap FILTER for SUM(CASE) and nothing else changes — the semantics live in the branches, not the syntax.",
      tag: "census",
    },
    {
      id: "avis-t18",
      q: "Four renters sit at 4 agreements each on the loyalty ladder. What do RANK, DENSE_RANK and ROW_NUMBER print — for the tie and for the renter below it — and which does the desk ship?",
      a: "Ordered by agreements descending with five renters above the tie (24, 17, 14, 13, 5 agreements): RANK prints 6, 6, 6, 6 for the tied four and 10 for the next renter down — shared rung, gap equal to the tie size. DENSE_RANK prints 6, 6, 6, 6 then 7 — shared rung, no gap. ROW_NUMBER prints 6, 7, 8, 9 — four distinct rungs manufactured inside a tie, an ordering that does not exist in the data. The desk ships RANK: peers share a rung and the gap says how many peers occupied it, which is the honest picture for a loyalty tier. The choice matters below the tie precisely because downstream reads consume rung numbers — 'top 10 renters' under RANK can include twelve people, under ROW_NUMBER exactly ten with an arbitrary cut inside the tie; and the LIMIT-1-OFFSET-1 habit that replaces a window with pagination breaks at exactly this tie. One subtlety worth volunteering: on a cohort filtered down to just the tie, RANK and DENSE_RANK agree (both print 6) — the functions part ways in the gap structure BELOW the tie, which is why the ladder, not the cohort, is the review surface. If the tier policy ever changes to 'no shared rungs', that's a business decision to write down, not a function swap to make quietly.",
      tag: "ranking",
    },
    {
      id: "avis-t19",
      q: "The cadence read wants each renter's gap to their NEXT stamped pickup. LAG or LEAD — what do the first and last rows print, and how do you keep per-renter walks from leaking across renters?",
      a: "LEAD(created_at) OVER (PARTITION BY customer_id ORDER BY created_at) minus the current stamp is the gap-to-next — LEAD because the ask points forward; LAG answers gap-from-previous and puts the NULL at the other end of each partition. The boundary rows print NULL by definition: a renter's last stamped agreement has no next, and that NULL is the walk's edge, never a zero — coalescing it to 0 invents same-day repeat rentals that never happened. The PARTITION BY is the fence: without it the walk runs the whole ordered table, and every renter's final gap reaches into the next renter's first booking — strangers' bookings leaking into a cadence metric, silently, at every partition boundary the fence would have created. Wrap the delta in JULIANDAY for day counts and ROUND at the display edge only. The review question I expect — 'what does the first row of each partition print?' — has one right answer here: NULL, labeled boundary, with the fence named in the metric title. A cross-renter gap of 200 days is not an anomaly to investigate; it is a missing PARTITION BY to fix.",
      tag: "leadlag",
    },
    {
      id: "avis-t20",
      q: "Counter ops wants pairs of bookings from the same market picked up within 48 hours of each other. How do you build the pair list so each pair appears exactly once?",
      a: "A self-join with three guards. FROM orders o1 JOIN orders o2 ON o1.region = o2.region — the same table aliased twice, now it is two independent bookings. The ordering guard o1.id < o2.id: without it every pair prints twice (A,B and B,A) and every row pairs with itself; the half-open comparison keeps one orientation and kills the degenerate self-pair in one predicate. The range guard JULIANDAY(o2.shipped_at) - JULIANDAY(o1.shipped_at) BETWEEN 0 AND 2 — a non-equi join at heart, 'within 48 hours' as a fence rather than a post-filter, stamped rows only since unstamped bookings have no pickup to compare. Projection discipline finishes it: both ids, both markets, the hour delta — a pair report that cannot say which booking is which is decoration. At 103 agreements the cross product is small; on a live counter feed the same shape needs a date fence first, because 100k rows squared is how dashboards die — the pattern scales, the naive scan does not. And the count I report is pairs, not rows: one number, one orientation, one policy stated in the title.",
      tag: "selfjoin",
    },
    {
      id: "avis-t21",
      q: "The rate card bands classes at fixed edges — budget under 50, mid 50 to 200, premium 200-plus. Walk me through the CASE that bands the fleet, and the two ways it quietly lies.",
      a: "The shape: CASE WHEN price >= 200 THEN 'premium' WHEN price >= 50 THEN 'mid' ELSE 'budget' END — arms evaluated top-down, first match wins, and the order IS the logic: swap the first two arms and every mid class re-bands as premium silently, because 199.99 satisfies >= 50 too. Lie one is the shadowed arm: an overlapping WHEN above another never runs, and the deck keeps footing while the fleet has quietly re-banded — so arms must be mutually exclusive by construction, edges published once and tested. Lie two is the missing ELSE: drop it and a class matching nothing bands NULL, which GROUP BY reports as its own row or drops from a filtered count — the band census stops reconciling to 16 classes. The premium band on this fleet is the teaching case: nothing prices at 200-plus (the card tops at 199.99), so the honest output is a zero-count premium branch, not a row that vanished. Every banding query ships with the identity check — bands sum to COUNT(*) — because a CASE is an exhaustive claim about the data, and the claim is testable. Say the edges out loud before writing the arms; the panel is listening for the order-before-syntax point.",
      tag: "case",
    },
    {
      id: "avis-t22",
      q: "A partner one-pager wants each fleet partner's vehicle classes folded into one cell beside its book — partner name, then a comma-separated class list. What aggregate do you reach for, and what are its sharp edges?",
      a: "GROUP_CONCAT(p.name, ', ') grouped by the partner — one pass, one string cell per partner, no string-building loop in application code. The sharp edges are three. Member order is not guaranteed on this build: the aggregate concatenates in whatever order rows visit it, and pre-3.44 SQLite offers no ORDER BY inside the aggregate — deterministic output needs an ordered subquery feed or the newer syntax, and the alphabetical order you saw once was coincidence, not contract. The separator argument is optional and defaults to a bare comma — usually not what a one-pager wants. And the grain warning: a folded string is a display artifact — you cannot filter or join on 'contains class X' without string surgery that belongs in the application layer, so GROUP_CONCAT ships LAST, after the counts and sums that are the real report. If the fold is feeding a downstream join, stop: that is the query telling you it wanted rows, not a sentence. On the partner ledger the fold decorates a row that already carries classes-fleeted, line count and book value — the string cell is the garnish, never the meal.",
      tag: "concat",
    },
    {
      id: "avis-t23",
      q: "The month filter runs as WHERE SUBSTR(created_at, 1, 7) = '2024-07' in staging and as a range predicate in production. Why do both print the same number and only one scales?",
      a: "Both are logically identical — SUBSTR(created_at, 1, 7) = '2024-07' selects exactly the rows with created_at in [2024-07-01, 2024-08-01) — and on 103 rows both are instant. They differ at the planner: SUBSTR wraps the column in a function, so an index on created_at is unusable — the engine cannot know which transformed values match without computing every row, a full scan forever. The range form — created_at >= '2024-07-01' AND created_at < '2024-08-01' — filters the bare column and walks the index; same cells, different plan, and the gap opens precisely when the table gets big. That is the sargability instinct: filter the column, not a function of the column. Sibling habits in the same family: COUNT(*) materialized to test existence where EXISTS stops at the first match, SELECT * dragged over the wire when three columns feed the chart, ORDER BY on an unindexed text key that sorts in a temp b-tree. I quote the staging query in review and ship the range form — and I say why in one sentence, so the next reader does not 'simplify' it back into a scan. Performance reviews at counter scale are plan reviews; the number was never the risk.",
      tag: "performance",
    },
    {
      id: "avis-t24",
      q: "Two teams report 'pickup rate' for the same month: one says 79.6%, the other 63.4%. Both queries are correct. What happened, and what is your governance fix?",
      a: "Two denominators wearing one name. 79.6% is stamped agreements over ALL agreements booked — 82 of 103, the funnel's top-of-house read. 63.4% is returned-and-settled over stamped — 52 of 82, a return rate that answers 'of the cars that went out, how many came back settled'. Both are defensible metrics; sharing a name is the bug, because every downstream consumer — target, alert, exec slide — silently attaches to whichever definition its author had. The governance fix is naming and ownership: the metric title carries its denominator ('pickup rate — stamped ÷ booked'), one dashboard owns one definition per name, and any deck that merges two teams' numbers recomputes both from COUNT(*) upstream before presenting a comparison. The panel version of this question is a trap — they want you to ask 'rate of WHAT over WHAT' before agreeing with either number. An analyst who states the denominator before the SQL is the analyst whose numbers survive the revenue-review argument; that habit, more than any function, is what the screens grade. When the two teams' rates must both appear, they get different names, different colors and one shared footnote — never a tie-breaker meeting.",
      tag: "denominators",
    },
  ],

  mcqs: [
    {
      id: "avis-mcq-1",
      prompt: "An agreement row's status reads 'shipped'. In this kit's Avis stage map, what happened?",
      choices: ["Returned-and-settled — the rental closed", "On-rent — the vehicle-out stamp shipped_at has landed", "No-show — the booking lapsed", "Reserved — awaiting counter pickup"],
      answer: 1,
      why: "The stage map is fixed: shipped = on-rent (30 of 103 agreements, 29.1%) with shipped_at as the vehicle-out stamp. It is the only status where the car is actually earning its day rate.",
      notes: [
        { choice: 0, why: "Returned-and-settled is 'delivered' — 52 agreements. Calling on-rent rows settled inflates the returned base before a single car comes back." },
        { choice: 2, why: "No-show is 'cancelled' — 7 agreements. A no-show never got a vehicle-out stamp; 'shipped' rows are literally on the road." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-2",
      prompt: "Pickup rate is stamped agreements ÷ which population? The db holds 82 stamped, 14 reserved and 7 no-show of 103 booked.",
      choices: ["Stamped + no-show only (82/89 = 92.1%)", "All agreements booked (82/103 = 79.6%)", "Returned agreements only (52/82)", "Distinct renters (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL agreements booked — reserved rows stay in the denominator because 'not yet picked up' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 reserved inflates the rate to 92.1% by deleting the population still inside the booking window — the rows the funnel exists to convert." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is return-and-settle, shipped_at is vehicle-out. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-3",
      prompt: "EU carries 45 rental agreements from 8 renters. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts agreement rows (45); COUNT(DISTINCT customer_id) folds repeats back to renters (8). The gap between them — 5.6 agreements per renter — is the counter-intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every agreement carries a renter. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not renters — a third grain nobody asked for. The census is agreements AND renters." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to no-show agreements only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the no-show share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the no-show map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-5",
      prompt: "Keep only markets carrying at least 10 stamped pickups. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE stamped >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A stamped-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly three markets clear a 10-stamp bar — EU 36, APAC 29, US 15 — and LATAM's 2 does not.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'stamped' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-6",
      prompt: "A partner-share query computes SUM(oi.quantity * oi.unit_price) OVER () as its denominator, after WHERE s.rating >= 4.5. What does the window total?",
      choices: ["Every line on the table — windows ignore WHERE", "Only the rows that survived the WHERE — filters run before windows, so it totals the trusted bench", "Only the current partner's lines", "It errors — a window cannot sit in a denominator expression"],
      answer: 1,
      why: "Pipeline order: WHERE folds rows out before windows evaluate, so the OVER () frame spans the filtered set — the shares read against the trusted bench's book, not the whole 34,833.28. The filter has to ship in the metric's name, or the share lies by denominator.",
      notes: [
        { choice: 0, why: "Windows evaluate after WHERE — that is exactly why the denominator shrank. A whole-table total needs its own unfiltered pass, not this frame." },
        { choice: 2, why: "OVER () with no PARTITION BY spans the entire filtered set, not the current row's partner. Per-partner totals are what you already have in the numerator." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the stamp filter still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 unstamped rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The reserved agreements double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 agreements.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-8",
      prompt: "A no-show triage list uses renter_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the triage list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every agreement carries a renter id. But staging tables are exactly where NULLs sneak in, and triage lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-9",
      prompt: "A board stack puts the partner ledger beside the renter ladder in one layout, built with UNION. A reviewer says one partner's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "Two branches emitted byte-identical rows (same values, no source label), and UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit identical value tuples — same counts, no source column — collapse into one, and the board loses a partner with no error anywhere. The discipline: UNION ALL plus a source label, and a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-10",
      prompt: "A dashboard walks booked value agreement by agreement: SUM(total) OVER (ORDER BY created_at). Two agreements share a created_at second, and the cumulative 'jumps two agreements at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at agreement grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-11",
      prompt: "A month filter reads WHERE STRFTIME('%Y-%m', created_at) = 2024-07 — no quotes. It returns zero rows on a spine that definitely carries July 2024 bookings (8 agreements, 1,193.86 booked). Why?",
      choices: ["STRFTIME needs %y, not %Y, for year matching", "2024-07 unquoted is the arithmetic expression 2017, and the text month key never equals it — quoted-versus-unquoted kills the match", "STRFTIME returns a date type that needs DATE() around it", "The table stores months with a day component, so equality fails"],
      answer: 1,
      why: "STRFTIME returns TEXT — '2024-07'. The unquoted 2024-07 evaluates to 2024 minus 7 = 2017, and comparing the text key to a number coerces and never matches. The fix is the quoted literal '= 2024-07'; without it the trough month vanishes from the walk.",
      notes: [
        { choice: 0, why: "%Y is correct for the 4-digit year. The failure is the literal's type, not the format token — quoting fixes it with the format unchanged." },
        { choice: 3, why: "The month key IS 'YYYY-MM' text with no day component — the format is fine. The bug is comparing text to an integer expression." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-12",
      prompt: "A fuel-and-fees leg stores amount_cents = 175644 (a 1,756.44 charge). Which SELECT prints the dollar figure with cents intact?",
      choices: ["SELECT amount_cents / 100", "SELECT amount_cents / 100.0", "SELECT ROUND(amount_cents)", "SELECT amount_cents * 100"],
      answer: 1,
      why: "INTEGER / INTEGER is integer division — /100 truncates odd cents (175644 → 1756). Dividing by 100.0 promotes to real arithmetic: 1756.44. The finance tables are INTEGER cents; the /100.0 read is house law, and the missing .0 is how odd-cent rows quietly lose cents.",
      notes: [
        { choice: 0, why: "/100 is integer division — it silently eats the 44 cents. On whole-dollar sums it reproduces the dollar digits, which is exactly why the bug survives review." },
        { choice: 2, why: "ROUND(amount_cents) rounds the CENTS value to a whole number of cents — 175644 stays 175644. The dollars never appear." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-13",
      prompt: "Per-statement coverage runs SELECT i.id, COUNT(p.id) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id. Six statements print 0. Who are they?",
      choices: ["Corrupt rows to delete before the close", "The 6 never-collected statements worth 15,217.00 — the anti-join answer arriving as zeros", "Statements settled by wire only", "The void statement's settlement legs"],
      answer: 1,
      why: "A LEFT JOIN keeps statements without legs as one NULL-payload row, and COUNT(p.id) counts non-NULL leg ids — 0 for statements with no settlement at all. On this book that is the dunning list: 6 statements, 15,217.00, including the paid-status lie #28 (1,756.00).",
      notes: [
        { choice: 0, why: "They are healthy statements awaiting settlement — open AR the dunning cadence exists for, not corruption. Deleting them deletes the receivable." },
        { choice: 2, why: "Rail mix is a payments-side cut (card vs wire). A zero here means no legs at all — any rail — which is a coverage fact, not a rail fact." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-14",
      prompt: "The close packet runs SELECT id FROM invoices EXCEPT SELECT invoice_id FROM payments. What does the result contain?",
      choices: ["All 28 invoice ids — EXCEPT only removes exact duplicate rows", "The billed ids that never appear as settlement legs — 6 statements worth 15,217.00", "Only invoices settled exactly — the paid book", "Nothing — EXCEPT requires the same column names on both sides"],
      answer: 1,
      why: "EXCEPT subtracts the right side's VALUES from the left's, pairing columns by position (names never matter; count must match). Invoice ids with no settlement leg survive: ids 18, 21, 24, 26, 27 and 28 — the 6-statement, 15,217.00 never-collected list.",
      notes: [
        { choice: 0, why: "EXCEPT is set difference, not dedup — a billed id with ANY leg on the right disappears from the result." },
        { choice: 3, why: "Column names are irrelevant to set ops; column COUNT is the contract. One column on each side here is perfectly aligned." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-15",
      prompt: "SELECT customer_id, MAX(total) FROM orders GROUP BY region runs without error on this SQLite build and prints a renter id. What is that id?",
      choices: ["The renter who placed the biggest agreement in that region", "An arbitrary renter from the group — SQLite fills bare columns from an unspecified row, not necessarily the MAX row", "The renter with the most agreements", "Always NULL, because strict engines reject the shape"],
      answer: 1,
      why: "SQLite permits non-aggregated bare columns and fills them from an arbitrary group row — MAX(total) beside customer_id is NOT an argmax. The honest shapes are a window argmax or a join-back on the group max. On this book the flagship is 1,088.44 — 'who booked it' deserves a stated tie policy, not engine luck.",
      notes: [
        { choice: 0, why: "That is the MySQL folk belief too — the docs promise nothing. Groups with many renters make the wrong pick likely, and the wrong renter gets the loyalty call." },
        { choice: 2, why: "Most agreements is a COUNT question — a different fold entirely, and pairing it with MAX(total) inherits the same bare-column danger." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-16",
      prompt: "The board packet stacks counter legs and corporate legs in one column set with a 'TOTAL' row appended. Which discipline keeps the stack trustworthy?",
      choices: ["UNION, so the two rails dedup their shared statements", "UNION ALL with a rail label per branch and a separately-computed TOTAL row that must equal the stacked sums", "ORDER BY method before the UNION so the stack arrives sorted", "A single GROUP BY with ROLLUP — UNION ALL cannot add a total row"],
      answer: 1,
      why: "UNION ALL keeps every leg; the label proves which rail a row came from; the TOTAL row is the reconciliation artifact — 5 statements settle on both rails (card 16 legs 37,364.00, wire 11 legs 32,248.00), and a shared statement is legitimate data appearing twice. UNION would silently dedup byte-identical rows and undercount the deck.",
      notes: [
        { choice: 0, why: "Dedup is the bug: card-plus-wire statements are exactly the rows a rail stack must keep twice. UNION deletes them with no error anywhere." },
        { choice: 3, why: "ROLLUP totals within one GROUP BY shape — it cannot stack two differently-shaped branches. UNION ALL is the stack primitive; the label is the receipt." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-17",
      prompt: "A rolling read needs each month beside the prior two months' booked value: SUM(booked) OVER (ORDER BY month …). Which frame completes it?",
      choices: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "RANGE BETWEEN 2 PRECEDING AND 2 FOLLOWING", "PARTITION BY month ORDER BY month"],
      answer: 1,
      why: "The 3-row rolling window is ROWS BETWEEN 2 PRECEDING AND CURRENT ROW — edges degrade honestly (January's window is just January). The unbounded frame is the cumulative total, a different read; RANGE offsets compare ORDER BY VALUES, and '2 PRECEDING' on a text month key has no meaning SQLite will honor.",
      notes: [
        { choice: 0, why: "That is the year-to-date walk — every month carries the whole spine, not a 3-month roll. Correct syntax, wrong report." },
        { choice: 3, why: "Partitioning BY month puts each month alone in its own window — every rolling value collapses to the month itself. The fence belongs around the walk, not inside it." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-18",
      prompt: "For the cadence read, an analyst writes julianday(LEAD(created_at) OVER (ORDER BY created_at)) - julianday(created_at) — no PARTITION BY. What silently goes wrong?",
      choices: ["Nothing — booking gaps are global by design", "The walk runs across renters: each renter's last booking 'gaps' into the next renter's first; PARTITION BY customer_id fences the walk per renter", "LEAD requires a literal offset argument to work", "julianday of a LEAD result is always NULL"],
      answer: 1,
      why: "Windows walk the whole ordered set when no partition exists — cross-renter gaps leak in at every renter boundary and the cadence metric inherits strangers' bookings. PARTITION BY customer_id restarts the walk per renter; each renter's final LEAD is NULL by definition, the honest edge of the walk.",
      notes: [
        { choice: 0, why: "Global gap analysis is a real report — but the ask was per-renter cadence. The missing fence is the bug, not the syntax." },
        { choice: 2, why: "LEAD's offset defaults to 1 — the argument is optional. What's missing is the partition, which no argument can replace." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-19",
      prompt: "HAVING book_share_pct > 25 errors on a query that computes book_share_pct as a window expression (Nordic 32%, Midwest 26.7%) in SELECT. Why, and what is the fix?",
      choices: ["Window results cannot exceed 100, so the comparison is invalid", "Windows evaluate after WHERE and HAVING, so the alias does not exist yet — wrap the query in a derived table or CTE and filter outside", "Move the window expression into the HAVING clause", "HAVING only accepts aggregate functions like COUNT"],
      answer: 1,
      why: "Pipeline order: WHERE and HAVING run before the SELECT list exists, and window expressions are SELECT-phase artifacts — the share column is not there yet when HAVING executes. The fix is staging: compute shares in a derived table or CTE, then filter the staged result. Same number, correct phase.",
      notes: [
        { choice: 2, why: "Windows are forbidden in WHERE and HAVING by the same phase rule — moving the expression moves the error, not the value." },
        { choice: 3, why: "HAVING accepts any expression over grouped rows — aggregates included. The failure here is phase, not expression class." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-20",
      prompt: "Four renters tie at 4 agreements on a ladder ranked by agreements DESC (24, 17, 14, 13, 5 above them). What does DENSE_RANK print for the tie and for the next renter down at 3 agreements?",
      choices: ["6, 6, 6, 6 then 7", "6, 6, 6, 6 then 10", "6, 7, 8, 9 then 10", "1, 1, 1, 1 then 2"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: five distinct agreement counts sit above (24, 17, 14, 13, 5), so the tie lands on rung 6 and the next distinct value continues at 7. RANK would print 6-then-10 (gap = tie size); ROW_NUMBER would split the tie 6, 7, 8, 9.",
      notes: [
        { choice: 1, why: "Then-10 is RANK's print — the gap equals the number of tied renters. DENSE_RANK's defining property is no gaps." },
        { choice: 2, why: "6, 7, 8, 9 is ROW_NUMBER — it manufactures four distinct rungs inside a tie, inventing peer distinctions the data does not contain." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-21",
      prompt: "A share expression divides by a SUM that can be zero on thin staging cuts. Which guard prints NULL — 'unmeasured' — instead of a fake 0% share, and why is that the honest output?",
      choices: ["COALESCE(numerator, 0) around the numerator", "NULLIF(denominator, 0) — a zero denominator becomes NULL and the share reads NULL", "CAST(denominator AS REAL) before the division", "Move the division into the HAVING clause"],
      answer: 1,
      why: "A zero denominator means no measurement, not a 0% share — a staging cut with no stamped pickups has no pickup rate. NULLIF(denominator, 0) turns the divide into NULL explicitly: SQLite already returns NULL for x/0, but the guard states intent and travels to engines where it errors.",
      notes: [
        { choice: 0, why: "COALESCE on the numerator fakes a 0 share for empty slices — the deck will quote that zero forever. 'No data' and 'zero' are different facts." },
        { choice: 2, why: "REAL promotion fixes integer truncation, not division semantics. A zero denominator is still a zero denominator." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-22",
      prompt: "The rate-card CASE reads: WHEN price >= 200 THEN 'premium', WHEN price >= 50 THEN 'mid', ELSE 'budget'. The fleet tops out at 199.99. What prints for the 199.99 flagship class?",
      choices: ["premium — 199.99 rounds up to the band edge", "mid — the first arm fails at 199.99 < 200 and the second arm catches it", "budget — no arm matches so ELSE fires", "NULL — no arm matches"],
      answer: 1,
      why: "CASE never rounds: 199.99 fails the 200 arm and lands in the >= 50 arm — mid. The premium band exists in the rate card and stays EMPTY on this fleet; the honest deck shows a zero-count premium branch, not a missing row.",
      notes: [
        { choice: 0, why: "First-match-wins with no rounding anywhere — 199.99 < 200 is final. The premium arm stays empty until the rate card actually ships a 200-plus class." },
        { choice: 3, why: "ELSE fires only when NO arm matches; the mid arm matches at 50. NULL would mean a missing ELSE AND a class under 50 — a different bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-23",
      prompt: "A partner one-pager folds class names with GROUP_CONCAT(p.name, ', '). A reviewer demands the same alphabetical order every run. What is true?",
      choices: ["GROUP_CONCAT sorts alphabetically by default", "Member order is not guaranteed on this SQLite build — deterministic output needs an ordered subquery feed (or a 3.44+ ORDER BY inside the aggregate)", "GROUP_CONCAT cannot take a separator argument", "Order is guaranteed because GROUP BY sorts the groups"],
      answer: 1,
      why: "GROUP_CONCAT concatenates in whatever order rows visit the aggregate — visit order is unspecified, and pre-3.44 SQLite has no ORDER BY inside aggregates. Deterministic folding requires feeding it ordered (a subquery with ORDER BY) or the newer aggregate ORDER BY; 'alphabetical once' was coincidence, not contract.",
      notes: [
        { choice: 0, why: "No default sort exists. The one-pager that reads fine today can print a different order after an engine upgrade or a plan change." },
        { choice: 3, why: "GROUP BY sorts nothing on your behalf — group order and member order are both unguaranteed. Only an explicit ORDER BY (outside or inside the aggregate) is a contract." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-24",
      prompt: "A readiness grid CROSS JOINs 6 fleet partners to 16 vehicle classes before any filter. Row count?",
      choices: ["22", "96", "16", "6"],
      answer: 1,
      why: "CROSS JOIN is the deliberate Cartesian: 6 × 16 = 96 pairings, and the pipeline picks its holes from there. The same product appears innocently when an ON clause never constrains — a missing join condition IS a cross join wearing a JOIN keyword.",
      notes: [
        { choice: 0, why: "22 = 16 + 6 — addition is the UNION ALL story, not the pairing story. Pairing multiplies." },
        { choice: 2, why: "16 keeps only the class side — the partner axis vanished, which is a LEFT JOIN shape, not a grid." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-25",
      prompt: "julianday(shipped_at) - julianday(created_at) averages 2.98 over the 82 stamped agreements. A teammate CASTs each delta to INTEGER 'for clean days'. What happens?",
      choices: ["Nothing — the deltas are already whole days", "Each delta truncates (2.98 → 2; a 2.5-day fractional lateness floors to 2) — the average drifts low and the honest 2–4 range reads 2–3", "The average rounds to 3", "CAST on julianday output errors — it is already an integer"],
      answer: 1,
      why: "julianday returns REAL days; CAST AS INTEGER truncates toward zero. On this book the range is 2–4 so the damage is mild but real; with fractional-day latencies the floor systematically understates every late pickup. Keep REAL in the math, ROUND at the display edge.",
      notes: [
        { choice: 0, why: "julianday carries fractional days (noon = x.5) — the printed 2.98 average is itself the proof the deltas are REAL." },
        { choice: 2, why: "Rounding the FINAL average is a display choice; CASTing each delta changes the measured quantity before averaging — a different metric wearing the same name." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-26",
      prompt: "The fate census uses COUNT(*) FILTER (WHERE status = 'cancelled'). A teammate ports it to MySQL and it fails. Why, and what is the portable twin?",
      choices: ["MySQL caps FILTER at 8 branches; use fewer", "FILTER (WHERE …) is SQLite 3.30+/Postgres syntax; SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) is the portable twin with identical results", "MySQL spells it FILTER(WHERE) without the space", "The twin is COUNT(DISTINCT status)"],
      answer: 1,
      why: "FILTER is a syntax feature, not a semantic one — SUM(CASE) computes the same branch anywhere, and the two agree when the CASE carries an explicit ELSE 0. Port between them freely; keep the reconciliation identity (branches sum to COUNT(*)) in both.",
      notes: [
        { choice: 0, why: "There is no branch cap — the failure is the keyword itself, unsupported by the engine." },
        { choice: 3, why: "COUNT(DISTINCT status) counts distinct VALUES (at most 4 here), not per-fate rows — it cannot produce a fate census no matter how it's grouped." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-27",
      prompt: "The deck's query ends ORDER BY no_show_pct DESC, where no_show_pct is a column alias defined in the SELECT list. Is that legal, and where would it break?",
      choices: ["Illegal everywhere — aliases are never visible to ORDER BY", "Legal: ORDER BY resolves SELECT aliases; the fragile cousin is reusing the alias inside WHERE, which runs before the SELECT list exists", "Legal only with the ordinal 5 instead of the name", "Legal only if the alias is quoted"],
      answer: 1,
      why: "ORDER BY is the one late pipeline stage that sees SELECT aliases; WHERE runs before the SELECT list exists and cannot. On the no-show map the alias keeps the deck readable — but ORDER BY 5 (ordinal) survives column reshuffles silently wrong, so name the alias.",
      notes: [
        { choice: 2, why: "Ordinals work but break silently when column order changes — the named alias is the durable form." },
        { choice: 0, why: "The asymmetry IS the pipeline: HAVING cannot see plain aliases either (pre-SELECT phase); ORDER BY can. That is the lesson, not an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "avis-mcq-28",
      prompt: "A per-agreement read adds (SELECT COUNT(*) FROM orders o2 WHERE o2.customer_id = o.customer_id) AS renter_bookings to the agreement list. What is true about this shape?",
      choices: ["It runs once and joins by broadcast", "It re-runs per outer row (correlated) — fine at 103 agreements, a lurking N+1 at counter scale; and an empty inner slice prints 0, never NULL", "It is illegal — subqueries cannot appear in the SELECT list", "It returns the fleet-wide agreement count for every row"],
      answer: 1,
      why: "A correlated scalar re-executes for each outer row — 103 executions here, 103,000 on a live counter feed, at which point the fold moves to a grouped derived table joined back. The empty-slice case prints 0 (COUNT never NULLs), which is why this shape is safe where a scalar AVG would print NULL.",
      notes: [
        { choice: 0, why: "SQLite may decorrelate in its plan, but the SEMANTICS are per-row — and the cost story is exactly what the panel is grading." },
        { choice: 2, why: "SELECT-list subqueries are standard SQL — one row, one column is the only contract, and COUNT satisfies it." },
      ],
      difficulty: "hard",
    },
    {
      id: "avis-mcq-29",
      prompt: "A same-market pairing joins orders o1 to orders o2 on region equality. The pair count is roughly double the analyst's expectation and includes bookings paired with themselves. Why?",
      choices: ["The join needs DISTINCT on region", "Without o1.id < o2.id, every pair prints twice (A,B and B,A) and each row self-pairs; the half-open guard keeps one orientation and kills self-pairs", "Self-joins require staging the table in a CTE first", "Window functions must be removed before self-joining"],
      answer: 1,
      why: "Symmetric equality joins double-count and self-count by construction; o1.id < o2.id keeps exactly one orientation and excludes the degenerate self-pair in one predicate. The 48-hour read adds the range fence BETWEEN 0 AND 2 on the julianday delta so 'within 48 hours' is a join condition, not a post-filter.",
      notes: [
        { choice: 0, why: "DISTINCT on the SELECT list dedups (A,B) against (B,A) only if the projection is orientation-blind — the guard is cheaper, correct in every projection, and intent-revealing." },
        { choice: 2, why: "Aliases suffice — a CTE is a readability choice, not a correctness one. The bug is the missing ordering predicate." },
      ],
      difficulty: "medium",
    },
    {
      id: "avis-mcq-30",
      prompt: "A market census joins renters to agreements to agreement lines and reports 251 'agreements'. The funnel deck says 103. What happened and what is the minimal fix?",
      choices: ["The lines table has duplicate rows; dedup with UNION", "The line join fanned the grain — COUNT(*) counts lines (251, averaging 2.44 per agreement), and COUNT(DISTINCT o.id) restores the agreement count without changing the join", "The funnel deck is wrong — lines are the true grain", "GROUP BY region must become GROUP BY region, o.id to fix the count"],
      answer: 1,
      why: "Each agreement averages 2.44 lines, so joining lines multiplies rows 103 → 251 and every COUNT inherits it. COUNT(DISTINCT o.id) collapses back to agreements — the stated-grain fix. The habit the panel grades: say the grain per column (agreements, renters, lines, days) and the fan-out argument stays one sentence.",
      notes: [
        { choice: 0, why: "No duplicates exist — 251 is the honest line count of 103 agreements at the wrong grain. UNION would 'fix' the number by deleting real rows." },
        { choice: 3, why: "Grouping by o.id reports one row per agreement — a different output shape, not the market census. The fix is counting distinctly at the original grain." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-avis-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The no-show census",
      brief:
        "Avis-flavored brief on the storefront db: Monday's counter standup opens with the reservation-fate census — how many agreements booked, how many renters actually drove out, and where the no-show leak is worst, per market. Probed facts: 103 agreements booked; 82 carry the vehicle-out stamp (52 returned-and-settled + 30 on-rent), 14 still reserved, 7 no-shows (6.8% of the book). By market the no-show share reads APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 — and picked-up counts run EU 36, APAC 29, US 15, LATAM 2. The standup reads the worst market first.",
      ask: "Return each market with bookings, no-show count, picked-up count and no-show share to 1 decimal, worst market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS no_shows,\n       COUNT(*) FILTER (WHERE o.shipped_at IS NOT NULL) AS picked_up,\n       ROUND(100.0 * {2}(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {3}) AS no_show_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY no_show_pct {4};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show status literal",
          why: "cancelled IS the no-show leg of the Avis map — 7 agreements. 'pending' would count the 14 reserved (not-yet, not no-show) and 'shipped' counts cars already on the road — three different populations behind one column name.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the flag fold",
          why: "SUM over the 0/1 CASE flags totals the no-shows per market. COUNT counts every flag including the zeros and the share reads 100.0 everywhere; AVG divides the flags by themselves before the /COUNT(*) and collapses the ratio twice.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Counter decks print one decimal: APAC 8.1, EU 6.7, US 5.3. ROUND(…, 2) prints 8.11 and the deck stops footing with the published census; 0 truncates the whole share map to integers and buries the APAC-versus-EU gap the budget hinges on.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-market-first direction",
          why: "The standup reads the leakiest market on top: APAC 8.1, EU 6.7, US 5.3, LATAM 0. ASC opens the meeting on LATAM's two clean bookings — a correct query aimed at the wrong end of the funnel.",
        },
      ],
      distractors: ["'shipped'", "'delivered'", "COUNT", "AVG", "ASC", "2"],
      walkthrough:
        "One join, one fold, four columns at market grain. The join attaches every agreement to its renter's market, GROUP BY folds to four rows, and the FILTER branches count in one pass: booked APAC 37, EU 45, US 19, LATAM 2; no-shows 3, 3, 1, 0; picked-up 29, 36, 15, 2; shares 8.1, 6.7, 5.3, 0.0 — reconciling upward to the house line, 7 no-shows of 103 booked (6.8%), with the picked-up columns footing to the 82-stamp story. The distractors fail honestly: 'shipped' counts cars already on the road (8, 12, 10, 0) and rebrands the funnel; COUNT in the flag fold counts zeros too and every market reads 100.0; AVG folds the ratio twice and the shares collapse to fractions of a percent; 2 in the precision slot prints 8.11 and the deck stops matching the published census; ASC opens the standup on LATAM's two clean rows instead of APAC's leak. The read: APAC leaks worst (8.1%) on mid-size bookings while the US leaks least (5.3%) — the reminder-cadence budget follows the share, not the count.",
    },
    {
      id: "cs-avis-2",
      tier: "medium",
      topic: "j3",
      universe: "supplier",
      title: "The fleet-partner ledger",
      brief:
        "Avis-flavored brief on the storefront db: fleet revenue management re-cuts the partner ledger every month — which of the 6 fleet/leasing partners turns the book, how many vehicle classes each fleets, and how concentrated the counter's supply really is. Probed facts: the 34,833.28 agreement book flows through 6 partners; Nordic Gadgets AB leads at 11,130.25 (32% of the book, 3 classes, 43 agreement lines) and Midwest Hardware Co follows at 9,294.93 (26.7%, 3 classes, 56 lines) — a two-partner majority. Every dollar rides through the agreement lines: quantity = rental days, unit_price = the locked day rate.",
      ask: "Return the top 3 partners by booked value with fleet size, line count, rental days, book value to 2 decimals and share of the total book.",
      template:
        "SELECT s.name AS partner,\n       COUNT(DISTINCT p.id) AS classes_fleeted,\n       COUNT(oi.id) AS line_items,\n       SUM(oi.quantity) AS rental_days,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS partner_book,\n       ROUND(100.0 * SUM(oi.quantity * oi.unit_price) / {4}, 1) AS book_share_pct\nFROM order_items oi\nJOIN products p ON p.id = {1}\nJOIN suppliers s ON {2} = p.supplier_id\nGROUP BY s.name\nORDER BY partner_book {5}\nLIMIT {6};",
      slots: [
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the line-to-class join column",
          why: "Each agreement line carries the product_id of the vehicle class it booked; p.id = oi.product_id is the chain's first link. oi.id would match line serials against class ids; p.supplier_id would match class ids against supplier keys and scramble the fleet.",
        },
        {
          answer: "s.id",
          kind: "keyword",
          label: "the class-to-partner join column",
          why: "The second link attaches each class to the partner that fleets it: s.id = p.supplier_id. Joining on oi.product_id here pairs line keys against supplier keys and the ledger empties; p.id would compare a class to its own supplier id and self-match a scattered subset.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the book precision",
          why: "Partner books are money and print to cents: Nordic 11,130.25, Midwest 9,294.93. One decimal reads 11,130.3 and the ledger stops footing against the 34,833.28 book line the close publishes.",
        },
        {
          answer: "34833.28",
          kind: "number",
          noVerify: true,
          label: "the book denominator",
          why: "The share column divides each partner's book by the whole agreement book — 34,833.28, the probed total. The cents-mindset slip (dividing by 3,483,328) prints shares a hundredfold too small; a literal denominator is fine for a one-off read, but ship it as SUM(...) OVER () when it joins a dashboard.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The concentration read wants the top of the ledger on top: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63. ASC buries the story under Pacific Textiles' 2,980.15 and the board reads the tail first.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the top-3 bench cut",
          why: "The monthly read ships the top 3 of 6 partners; the LIMIT is a presentation constant, not a fact about the fleet. LIMIT 1 collapses the bench to Nordic alone and the two-partner-majority story disappears.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "ASC", "0", "1"],
      walkthrough:
        "Three tables, one chain: agreement lines join to the vehicle class each booked (p.id = oi.product_id), the class joins to the partner that fleets it (s.id = p.supplier_id), and GROUP BY s.name folds to six partner rows ordered by book. The top-3 cut ships: Nordic 3 classes, 43 lines, 82 rental days, 11,130.25 at 32%; Midwest 3 / 56 / 109 at 9,294.93 and 26.7%; Alpine 2 / 40 / 77 at 4,765.63 and 13.7%. The headline is concentration: Nordic plus Midwest carry 20,425.18 of the 34,833.28 book. The distractors each break differently: COUNT and AVG in a join slot error outright; 0 or 1 in a join slot matches one id against every class and the ledger empties or shrinks to a single partner; 1 in the book slot prints 11,130.3 and stops footing; 0 divides by zero and the share column goes NULL; ASC flips the ledger tail-first. The probed utilization cross-check: Midwest's ledger turns 109 rental days against Andes' 51 — turnover and concentration tell different stories, and the board wants both before the fleet replan.",
    },
    {
      id: "cs-avis-3",
      tier: "easy",
      topic: "t4",
      universe: "month-close",
      title: "The July no-show statement",
      brief:
        "Avis-flavored brief on the storefront db: month-end close asks the reservation desk to pin the trough month on the 14-month agreement spine and print its fate line. Probed facts: July 2024 carries 8 agreements — 2 of them no-shows, tied-worst on the spine (November matches the count on 6 bookings) — and 1,193.86 booked value, the lowest month against the 3,731.97 January open. The close packet wants the month bucketed as zero-padded TEXT, no-shows folded in one pass, and money to cents.",
      ask: "Return the 2024-07 fate line: month key, agreements, no-show count and booked value to 2 decimals.",
      template:
        "SELECT {1}('%Y-%m', o.created_at) AS month,\n       COUNT(*) AS agreements,\n       {2}(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS no_shows,\n       ROUND(SUM(o.total), 2) AS booked_value\nFROM orders o\nGROUP BY month\nHAVING month = {4};",
      slots: [
        {
          answer: "STRFTIME",
          kind: "keyword",
          label: "the month-bucket function",
          why: "STRFTIME('%Y-%m', created_at) cuts the zero-padded month key the close packet prints. SUBSTR here mis-binds its arguments (the format string lands first), and JULIANDAY turns the key into a float day count — the bucket dissolves into one garbled row.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the no-show flag fold",
          why: "SUM totals the 0/1 CASE flags — July reads 2. COUNT counts every row including the zeros and prints 8; AVG folds the flags into a 0.25 share that belongs in a rate column, not a count.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the no-show status literal",
          why: "cancelled is the no-show leg of the Avis map — 2 in July. 'pending' counts the 1 reserved agreement and 'shipped' the 3 on-rent cars: adjacent fates, different populations, wrong leak.",
        },
        {
          answer: "'2024-07'",
          kind: "keyword",
          label: "the month-key literal",
          why: "The bucket is TEXT: STRFTIME returns '2024-07', so the literal must be quoted and zero-padded. Unquoted 2024-07 evaluates to the number 2017 and matches nothing; '2024-7' fails the zero-pad and silently ships an empty packet.",
        },
      ],
      distractors: ["SUBSTR", "JULIANDAY", "'pending'", "'shipped'", "COUNT", "2024-07"],
      walkthrough:
        "One table, one bucket, one row. STRFTIME cuts '2024-07' out of created_at, GROUP BY month folds the 103-agreement spine into 14 keys, and the HAVING pins the packet to July: 8 agreements, SUM over the CASE flags reads 2 no-shows, and the booked value lands on 1,193.86 — the trough against January's 3,731.97 open. The distractors fail honestly: SUBSTR and JULIANDAY in the function slot garble the key into an empty-string bucket or a NULL-titled grand row; 'pending' and 'shipped' recount July as 1 or 3 — adjacent fates, not the leak; COUNT counts the whole group and prints 8; and the unquoted 2024-07 casts to the number 2017, matches no text key, and returns an empty packet. The close reads the trough with its leak attached: 2 of 8, tied-worst on the spine with November's 2-of-6.",
    },
    {
      id: "cs-avis-4",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The renter activity ladder",
      brief:
        "Avis-flavored brief on the storefront db: the loyalty desk ranks renters by agreements booked and reads the tie structure before it mails tiers. Probed facts: the ladder runs 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), 5 (Chloe Dubois) — then four renters sit at 4 agreements each (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez). RANK pins all four to one rung and skips the next; ROW_NUMBER would split them 6-7-8-9 by an arbitrary tiebreak — a tiering policy disguised as syntax.",
      ask: "Return renters with at least 4 agreements, RANKed by agreements busiest-first, ties sharing a rung.",
      template:
        "SELECT c.name AS renter,\n       COUNT(*) AS agreements,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS activity_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY activity_rank, renter;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "Four renters sit at 4 agreements and the loyalty desk wants them on ONE rung: RANK pins all four to 6 and leaves 10 for whoever clears the bar next. ROW_NUMBER splits them 6-7-8-9 by an arbitrary tiebreak; SUM over the window turns the ladder into a running total.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The ladder reads top-down from Alice Chen's 24. ASC hands the loyalty desk the one-agreement renters first and the tier mail goes out inverted — a correct query aimed at the wrong end of the book.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the ladder floor",
          why: "The floor cuts at 4 to keep the tie block in view: 24, 17, 14, 13, 5, then the four 4s — 9 rows. A floor of 5 shows only the crown block and the four-way tie never renders; 3 drags in the two 3-agreement renters below the policy read.",
        },
      ],
      distractors: ["ROW_NUMBER", "SUM", "LAG", "5", "3"],
      walkthrough:
        "Group to renters, keep the >=4 floor, rank inside the window. The window's ORDER BY COUNT(*) DESC pins Alice Chen 24 to rung 1, Emma Wilson 17 to 2, Grace Kim 14 to 3, Maya Patel 13 to 4, Chloe Dubois 5 to 5 — then the tie block: Isabella Rossi, Keiko Sato, Noah Meyer and Pedro Alvarez all share rung 6 on 4 agreements, and the next rung would be 10. The distractors each break the read: ROW_NUMBER splits the block 6-7-8-9 and the tier mail invents a hierarchy the book doesn't have; SUM in the window slot prints running totals (24, 41, 55, 68...) instead of rungs; LAG in the rank slot errors outright; a floor of 5 hides the tie entirely and 3 pads the table with the two 3-agreement renters below the bar. RANK is the honest read: four peers, one rung, one policy conversation about who shares Preferred.",
    },
    {
      id: "cs-avis-5",
      tier: "medium",
      topic: "q2",
      universe: "pricing",
      title: "The above-the-mean day-rate ledger",
      brief:
        "Avis-flavored brief on the storefront db: the pricing desk audits which markets actually book above the fleet mean — 338.19 per agreement on this book — before it touches the rate card. Probed facts: the mean splits the book unevenly — EU banks 18 above-mean agreements worth 10,899.05, APAC 13 worth 6,784.10, US 10 worth 5,873.57, LATAM just 1 worth 752.96 (its second booking sits at 99.48). The ceiling matters too: the priciest single agreement books at 1,088.44.",
      ask: "Return per market the count and total booked value of agreements priced above the fleet-wide mean, biggest value first.",
      template:
        "SELECT c.region AS market,\n       {1}(*) AS premium_agreements,\n       {2}(o.total) AS premium_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (SELECT {3}(total) FROM orders)\nGROUP BY c.region\nORDER BY premium_value {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the market row count",
          why: "The desk wants how many above-mean agreements each market books — COUNT(*). SUM(*) is a syntax error and an argmax chip here reads as a broken fold, not a census.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the premium value fold",
          why: "SUM(o.total) banks the above-mean dollars per market: EU 10,899.05. AVG would report a per-market rate instead of a bank, MAX the single biggest agreement, and COUNT(o.total) duplicates the count column — dollars vanish from the ledger.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the fleet-mean subquery",
          why: "The scalar subquery computes the fleet mean 338.19 once and guards the WHERE. SUM(total) sets the bar at the whole 34,833.28 book and empties the ledger; MAX sets it at 1,088.44 and empties it again; MIN at 25.47 floods it.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bank-first direction",
          why: "The read leads with EU's 10,899.05 bank. ASC opens the ledger on LATAM's single 752.96 agreement and the pricing meeting starts at the tail.",
        },
      ],
      distractors: ["MAX", "MIN", "ASC", "RANK", "COUNT(DISTINCT o.id)"],
      walkthrough:
        "A scalar subquery sets the bar, the outer fold banks the premium. (SELECT AVG(total) FROM orders) evaluates once to 338.19; the WHERE keeps the 42 above-mean agreements, the join attaches markets, and GROUP BY folds: EU 18 for 10,899.05, APAC 13 for 6,784.10, US 10 for 5,873.57, LATAM 1 for 752.96 — four markets out, banks reconciling inside the 34,833.28 book. The distractors each break the read: MAX in the subquery bars the ledger at 1,088.44 and returns nothing, because no agreement beats the maximum; MIN bars it at 25.47 and floods it; AVG in the value slot reports a per-market rate instead of a bank; RANK outside a window errors; COUNT(DISTINCT o.id) in the value slot duplicates the count column and the ledger loses its dollars; ASC flips the tail first. The pricing read: concentration is real — EU and APAC bank 17,683.15 of the above-mean value, and LATAM's book barely clears the line.",
    },
    {
      id: "cs-avis-6",
      tier: "medium",
      topic: "t3",
      universe: "funnel",
      title: "The booking-ahead clock",
      brief:
        "Avis-flavored brief on the storefront db: counter staffing follows the booking-ahead clock — how many days between reservation and vehicle-out, market by market. Probed facts: 82 of 103 agreements carry the vehicle-out stamp (36 EU, 29 APAC, 15 US, 2 LATAM), averaging 2.98 days ahead with a 2-4 day spread. By market the clock reads LATAM 3.5, US 3.07, EU 2.94, APAC 2.93 — and the 21 unstamped rows (14 reserved, 7 no-shows) carry no stamp at all, so the WHERE is a population definition, not a cleanup.",
      ask: "Return per market the stamped-pickup count and average booking-ahead days to 2 decimals, longest clock first.",
      template:
        "SELECT c.region AS market,\n       {1}(*) AS stamped_pickups,\n       ROUND({2}(julianday(o.shipped_at) - julianday(o.created_at)), {3}) AS avg_book_ahead_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.{4} IS NOT NULL\nGROUP BY c.region\nORDER BY avg_book_ahead_days {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the stamped-pickup count",
          why: "COUNT(*) counts stamped agreements per market: 36, 29, 15, 2 — footing to the 82-stamp census. SUM(*) is a syntax error, and an average here is a rate, not a count.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the latency fold",
          why: "AVG over the julianday delta averages the booking-ahead clock: 2.94 in EU. SUM prints total days (~105.8 in EU), MAX and MIN collapse the market to its single 4-day or 2-day extreme, COUNT prints the row count again.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the clock precision",
          why: "Latency prints to 2 decimals: 3.07 versus 2.94 is the US-versus-EU gap the staffing curve keys on. One decimal rounds the map into a 3.5/3.1/2.9/2.9 blur and the ready-line decision loses its ordering.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the vehicle-out stamp",
          why: "shipped_at is the vehicle-out stamp — 82 agreements carry it. Filtering on created_at or total passes all 103 rows and the 21 unstamped flow in, inflating counts to 45/37/19/2 while their NULL deltas silently drop out of the average.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the longest-clock-first direction",
          why: "The staffing read leads with the longest clock: LATAM 3.5 on two stamped pickups. ASC hands the meeting APAC's 2.93 — the fastest market — as if it were the risk.",
        },
      ],
      distractors: ["SUM", "MAX", "MIN", "SUBSTR", "1", "0"],
      walkthrough:
        "Stamp filter first, then the clock. WHERE shipped_at IS NOT NULL keeps the 82 stamped agreements (36 EU, 29 APAC, 15 US, 2 LATAM); julianday(shipped_at) - julianday(created_at) is the booking-ahead delta; AVG folds it per market to LATAM 3.5, US 3.07, EU 2.94, APAC 2.93 — inside the house line of 2.98 and the 2-4 day spread. The distractors each break the read: SUM prints total days per market instead of an average, MAX and MIN collapse each market to its 4-day or 2-day extreme, a 1- or 0-decimal ROUND blurs US 3.07 into 3.1 or 3.0 and dissolves the ordering, SUBSTR in the fold errors outright, and filtering on created_at or total lets the 21 unstamped rows flow in — counts jump to 45/37/19/2 while their NULL deltas silently skip the average. The read: LATAM's two pickups book furthest ahead, APAC books fastest — staffing follows the clock, not the count.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Share of pickups stamped inside the promised window versus late — the pickup-SLA read is a conditional rate over a timestamp comparison, exactly this shape at Avis scale." },
    { slug: "funnel-step-conversion", why: "Reservation → vehicle-out → return is a three-step funnel with drop-offs at every gate; this problem drills the stage-rate fold the Monday counter census re-cuts." },
    { slug: "queries-quality-and-percentage", why: "No-show shares print beside the counts that earned them — a ratio with a stated denominator. Same division-discipline drill, Avis flavor." },
    { slug: "classes-more-than-5-students", why: "The HAVING floor is everywhere in counter reporting — which markets carry at least N stamped pickups, which partners fleet at least N classes. This problem drills the group-level gate." },
    { slug: "number-of-employees-who-met-the-target", why: "Markets hitting the pickup-rate target is a conditional count against a bar — the funnel review's weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "list-the-products-ordered-in-a-period", why: "Month-scoped class censuses feed the fleet replan — which vehicle classes moved inside the booking window. This problem is that date-filtered fold." },
    { slug: "capital-gain-loss", why: "Fleet adds minus drops net to the movement number the board reads. This problem drills ordered buy/sell folds — the same algebra fleet movements use." },
    { slug: "game-play-analysis-i", why: "First pickup per renter anchors every cohort Avis builds — MIN-over-window is the shape, and the 14 reserved agreements have no anchor yet." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-agreement renter is the counter's crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "find-users-with-high-token-usage", why: "Utilization outliers flag partners whose classes get hammered — the rebalancing-signal query is a threshold fold over per-partner lines, this problem's exact shape." },
    { slug: "find-golden-hour-customers", why: "Golden pickup windows drive the ready-line staffing curve — renters whose drive-outs cluster in the morning peak are this problem's shape at db scale." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Repeat rentals inside a week are the frequency signal the loyalty desk watches — a self-join over stamped pairs, exactly this problem's shape." },
    { slug: "confirmation-rate", why: "Pickup confirmations arrive with gaps — COALESCE turns missing stamps into an explicit rate instead of a silent NULL. This drills the funnel-denominator discipline." },
    { slug: "find-churn-risk-customers", why: "Renter dormancy is an anti-join over the last stamped pickup — the same shape that drives the winback calendar and the reminder cadence." },
    { slug: "net-revenue-retention", why: "The board manages the book cohort-to-cohort — revenue walks with expansion and no-show leakage netted. This problem is that walk at practice scale." },
    { slug: "growth-accounting", why: "New, retained, resurrected, lapsed — the renter-accounting identity that reconciles 16 renters period over period. LAG status classification, exactly this problem." },
    { slug: "average-time-of-process-per-machine", why: "Average booking-ahead days per market is julianday(shipped_at) - julianday(created_at) folded with AVG per group — the rental-day latency read the staffing curve keys on, this problem's exact shape at db scale." },
    { slug: "calculate-orders-within-each-interval", why: "The booking-ahead clock buckets into 2-, 3- and 4-day arms on this db — exhaustive CASE interval buckets are the shape the ready-line staffing deck prints, with a hole in the arms a hole in the plan." },
    { slug: "trips-and-users", why: "The rideshare classic is Avis's no-show economics verbatim: cancellation share by market with excluded accounts, denominators stated before the division. Same funnel, same trap, one industry over." },
    { slug: "hopper-company-queries-ii", why: "Markets whose no-shows land in two or more months is this problem's group-level gate — the reminder-cadence trigger the funnel desk ships monthly, and November plus July are exactly that shape here." },
    { slug: "returns-rate-by-category", why: "No-show rate by vehicle class — a LEFT JOIN rate over class grain, the fleet-side twin of the market census: does the leak follow the class, the market, or both?" },
    { slug: "books-with-null-ratings", why: "COUNT(stamp) versus COUNT(*) is the funnel's two-truths drill: 82 stamped of 103 booked, and the unstamped 21 are NULLs, not zeros. This problem drills the fold pair that keeps the census honest." },
    { slug: "recyclable-and-low-fat-products", why: "Two-flag filtering — stamped AND returned-and-settled — is this problem's shape; the pickup-quality census is a pair of booleans per agreement, and both must be named." },
    { slug: "analyze-subscription-conversion", why: "Reserved-to-stamped conversion is a LEFT JOIN with a NULL arm — 82 stamped against the 96 that survived the no-show gate. The step-rate read, NULL arm explicit, at db scale." },
    { slug: "students-and-examinations", why: "Market × fleet-family coverage grids must zero-fill the absent combos, not just print the booked cells — this problem drills the full-grid census the fleet replan reads." },
    { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "Renter-class repeat pairs at a 3-booking floor — the loyalty-pairing read that flags which renters keep re-booking the same class and which pairs the rebalancing plan should break up." },
    { slug: "find-cities-in-each-state", why: "GROUP_CONCAT folds each partner's class roster into one cell — the partner-book appendix the renegotiation deck prints, with member order flagged as unguaranteed on this build." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Partners fleeting at least N classes is a HAVING gate over a joined count — the concentration bar the supplier audit applies before a partner makes the board page." },
    { slug: "top-travellers", why: "Rental-day leaders: SUM(quantity) per renter is this problem's ladder, and the agreement lines already carry days in quantity — the distance column wearing a rental uniform." },
    { slug: "maximum-transaction-each-day", why: "Peak agreement per day feeds the counter's high-water reporting — an argmax over booked value with the tie question left explicit, exactly the discipline the month-close packet needs." },
    { slug: "find-the-team-size", why: "Market load attached to every renter row — COUNT(*) OVER (PARTITION BY region) — is the two-grain census habit made into a window drill: every renter carries their market's 45, 37, 19 or 2." },
    { slug: "bikes-last-time-used", why: "Last vehicle-out stamp per class is fleet-rotation freshness — a MAX-per-group read that flags classes going stale on the ready line before the weekend surge finds out the hard way." },
  ],
};
