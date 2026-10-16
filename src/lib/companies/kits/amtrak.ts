// Amtrak — Wave-9 (Task 98), travel domain. No Amtrak section in company-pools.md
// (0 tagged rows) — all 10 topic slug sets and all 16 problems are theme-curated
// from the pools file's SQL rows (no w*/d*/f* rows); provenance stated here and in
// brief P4. Facts from scripts/company-facts.md (probed 2026-10-12); every case
// figure probe-verified against db/custom.db (readonly copy, deleted after).
// db mapping (operator-side, rail-honest): customers = Guest Rewards riders (region
// = corridor/market: EU = Northeast Corridor, APAC = state-supported corridors,
// US = long-distance overnight network, LATAM = specialty lane), orders = booked
// journeys/reservations (delivered = completed-and-settled 52, shipped = in-progress
// with shipped_at as the departure stamp 30, pending = booked-awaiting-departure 14,
// cancelled = cancelled reservation 7), order_items = reservation component lines
// (fares, upgrades, ancillaries: quantity = units, unit_price = unit fare), products
// = travel classes & passes (Coach/Business/Sleeper/Acela First; db category codes
// stand for fare families), suppliers = host railroads & station concession
// partners, invoices = settlement/host-charge statements, payments = settlement
// legs (card vs wire rails), expenses = corridor opex, ledger_entries = GL.
// Money: orders.total/unit_price REAL dollars; finance tables INTEGER cents
// (/100.0). Scale: 16 riders, 6 partners, 16 classes, 103 journeys, 251 lines,
// 28 statements, 27 legs, 36 opex entries, 80 GL entries.
//
// Wave-3x expansion (Task 103, APPEND-ONLY): brief 4->6, dayInLife 3->4, metrics
// 8->12, topics 10->15, theory 8->24 (amtrak-t9..t24), mcqs 10->30
// (amtrak-mcq-11..30), cases 2->6 (cs-amtrak-3..6; new families t3/s6/j5/t5 —
// distinct from the original j7/x3 and each other), problems 16->32. Every
// pre-existing entry above is byte-identical; all additions are appended.
// Provenance unchanged: no Amtrak section in company-pools.md (0 tagged rows) —
// the 15 new topic slugs and 16 new problem slugs are theme-curated sql rows
// from the pools file (no w*/d*/f* rows). Case figures verbatim from
// scripts/company-facts.md, EXCEPT these probe-derived cells (read-only probes
// against db/custom.db at expansion time, declared here): 42 journeys price
// above the 338.19 platform mean; SUM(o.total) after the orders->order_items
// fan-out reads 103,244.55 (251 lines, 2.96x the journey book); the 3-journey
// riders sit at rank 10 on the Guest Rewards ladder; 5 of the 14 spine months
// carry at least one cancellation; '%m' buckets the spine into 12 merged-year
// rows; zero-leg chase sheet order 4,937.00 / 3,562.00 / 2,794.00 / 1,756.00 /
// 1,295.00 / 873.00 (facts-file dunning cells + anomaly #28, re-probed).

import type { CompanyKit } from "../types";

export const amtrakKit: CompanyKit = {
  id: "amtrak",
  domainId: "travel",
  name: "Amtrak",
  tagline: "America's operator: corridor yield, overnight sleepers, on-time performance",
  accent: "text-zinc-400",

  brief: [
    "**Amtrak** is America's national rail operator — the company that runs **Acela** and Northeast Regional over the Northeast Corridor, threads overnight sleeper routes across the country, and publishes on-time performance its host railroads co-author. The operator reality shapes the data: Amtrak sells reserved seats over tracks it mostly does not own, so every punctuality and yield number is read at the mercy of a host-railroad handoff. This kit maps the storefront db onto that world: the 16 customers rows are {sky:Guest Rewards} riders, the 103 orders are booked journeys worth **34,833.28**, and the 251 order_items rows are reservation component lines — fares, upgrades, ancillaries. The fate map is fixed: delivered = completed-and-settled (52, 50.5%), shipped = in-progress with shipped_at as the departure stamp (30, 29.1%), pending = booked-awaiting-departure (14), cancelled = {rose:cancelled reservations} (7, 6.8%).",
    "The data org splits into {emerald:corridor ops}, revenue management and a small settlement-accounting pod, and all three read the same reservation spine at different grains. A journey books at created_at; shipped_at is stamped when it departs — **82 of 103 journeys** carry the stamp, averaging **2.98 days** of booking lead with a 2–4 day spread, and the 14 awaiting rows have none yet (a population definition, not a cleanup job). Corridor lead times diverge honestly: EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 days over stamped journeys only. Money sits one layer down: settlement statements, legs, opex and the GL in INTEGER cents, so the dollar read is `amount_cents / 100.0` — *the missing .0 is how a reconciliation fires*.",
    "Interview screens are census-then-denominator. A typical loop opens with the **two-grain corridor census** — the NEC reads 45 booked journeys from 8 riders while the US long-distance book reads 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'do cancelled reservations count in your base?'*), then into the rider ladder where four riders sit tied at 4 journeys and rank semantics become a loyalty-policy decision. Late rounds walk the {sky:14-month booking spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Amtrak section, so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes — departure funnels, two-grain corridor censuses, {rose:cancellation shares}, tie-heavy rider ladders, lead-time clocks and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:corridor departure census} corridor ops opens with, the other rebuilds the {amber:opex close stack} the comptroller signs. The bar to clear: *state the population and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
    "Money at this operator sits in the settlement book, and the expansion cases drill it at statement grain. Statements and legs are INTEGER cents — the dollar read is `amount_cents / 100.0` — and the coverage census is honest about its composition: the 21 exact folds IN the void-but-debited statement (#11, 925.00) and folds OUT the paid-status statement with zero legs (#28, 1,756.00), because legs are the ledger and status is a claim. The zero-leg chase list runs **6 statements worth 15,217.00** — 5 open at 13,461.00 (the dunning blocks: 873.00, 1,295.00, 4,937.00, 3,562.00, 2,794.00) plus the one {rose:paid-status lie} — and the rails split 16 card legs worth 37,364.00 against 11 wire legs worth 32,248.00. *Reconciliation at this shop is an identity, not a vibe*: 21 exact + 1 partial + 6 none = 28, or the close does not ship.",
    "How to prep against the expanded kit: six case files now — the original corridor departure census (j7) and opex close stack (x3) are joined by the **14-month booking spine** (t3), the {rose:cancellation map} (s6), the **zero-leg chase list** (j5) and the {sky:Guest Rewards ladder} (t5) — and you run every one against the live storefront db until each census reconciles by construction. Theory runs t1–t24 and MCQs 1–30, both pushed past the original syllabus into window frames, set-op diffs, fan-out arithmetic and sargability instincts. The problems stay **theme-curated** (the pools file still carries no Amtrak section — 0 tagged rows), and the two figures this kit probed beyond the facts file — 42 journeys above the 338.19 mean, 103,244.55 of fan-out-inflated value — are declared in the header comment. *State the population and the denominator first; the SQL is the easy part.*",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the reservation-book refresh. A corridor analyst opens the dashboard before standup: did overnight bookings land, did any in-progress journey get its `shipped_at` stamp without a matching completed leg, does the one-pass fate census reconcile — 52 completed + 30 in-progress + 14 awaiting + 7 cancelled = **103 by construction**? A branch that fails the identity is *the day's first incident*, not a rounding note. If booking lead drifts off the **2.98-day** norm, the advance-purchase queue gets pulled before revenue management's weekly yield read ships.",
    "**11:30 —** Midday is the corridor deep-dive. Revenue management wants the two-grain census re-cut — NEC 45 journeys from 8 riders against the US sleeper book's 19 from 2 — with {rose:cancellation shares} beside it (APAC 8.1%, EU 6.7%, US 5.3%); the loyalty pod wants the rider ladder's {sky:four-way tie} at 4 journeys handled honestly — shared rungs, named policy; a state-corridor partner wants lead time in days, not adjectives. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the yield-review argument*.",
    "**15:30 —** The afternoon tilts toward the close. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before any dunning goes out; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled) and feeds the receivables draft; the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). Then the opex fold: four corridor lines footing to **25,416** — {emerald:tied to the GL}, or the close does not ship. The day ends the way every close does: the trial balance must read **181,080 against 181,080**, delta zero, and tomorrow's departures board inherits queries, not mysteries.",
    "**17:45 —** The yield review is the day's last stand. Revenue management walks the {amber:month spine} — the book opens January at **3,731.97**, troughs at 1,193.86 in July, jumps +1,158.21 into August and drops −1,326.87 into November — and the analyst keeps the walk honest: half-open quarter windows, the first LAG row reported as \"baseline, not zero\", every money cell to 2 decimals. The loyalty pod signs off the {sky:tie policy} for the Guest Rewards ladder — shared rungs at 4 journeys, a named tie-breaker, no silent ROW_NUMBER — and tomorrow's advance-purchase queue is cut from the **2.98-day** lead norm before anyone leaves. The deck ships only after every census reconciles — 103 journeys, 28 statements, 36 opex lines — because *a number that can't be reconstructed is a rumor, not a KPI*.",
  ],

  metrics: [
    { name: "Completed-journey rate", what: "Delivered (completed-and-settled) journeys ÷ ALL journeys booked: 52 of 103 (50.5%). The operator's kept-rate — a status-filtered conditional count whose denominator is the whole interview." },
    { name: "Departure-stamp coverage", what: "Journeys with shipped_at stamped ÷ all booked: 82 of 103 (79.6%). The 14 awaiting rows are 'not yet', never a silent zero — and the 7 cancelled never had a stamp to give." },
    { name: "Booking lead time", what: "created_at → shipped_at over departed journeys only: 2.98-day average, 2–4 spread. The corridor cut — EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 — decides where advance-purchase yield actions land." },
    { name: "Cancellation share", what: "Cancelled reservations ÷ booked, by corridor: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The fate map ops reads weekly; the denominator (all booked) is the metric." },
    { name: "Journey book value", what: "Total booked value: 34,833.28 across 103 journeys, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the class story — one 1,088.44 sleeper booking outweighs the smallest 42 combined." },
    { name: "Rider concentration", what: "Share of the book from riders whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). One lost Guest Rewards logo moves a corridor's quarter." },
    { name: "Component-line depth", what: "Reservation component lines ÷ journeys: 251 across 103 bookings. Upgrades and ancillaries show up here first — a new line item, not a new journey." },
    { name: "Settlement coverage", what: "Statements versus collected legs: 21 exact, 1 partial (4,000 of 6,148 settled), 6 never-collected worth 15,217. The AR anti-join the settlement pod refreshes every close." },
    { name: "Above-mean fare cohort", what: "Journeys priced above the 338.19 platform mean: 42 of 103 (40.8%, probe-verified). The premium-cabin story — sleeper and Acela First fares live above the line — and the cohort re-draws by corridor mean (US 383.48), not just platform mean." },
    { name: "Fan-out exposure", what: "SUM(total) after joining the 251 component lines reads 103,244.55 — 2.96x the 34,833.28 journey book (probe-verified). The fan-out tax: total is a journey-grain measure, and the line join re-counts it once per line, 2.44 on average." },
    { name: "Zero-leg chase share", what: "6 of 28 settlement statements (21.4%) carry no settlement leg at all, worth 15,217.00 — 5 open at 13,461.00 and 1 paid-status lie at 1,756.00. The dunning queue's denominator is the statement book, not the dollar book." },
    { name: "Tie-block width", what: "Four riders tied at 4 journeys behind the 24 / 17 / 14 / 13 / 5 rungs — the ladder's tie block is 4 wide (ranks 6–9, next distinct rung 10). Rank semantics here are loyalty policy, not syntax." },
  ],

  topics: [
    {
      name: "The departure funnel",
      why: "Every Amtrak screen opens with the reservation book: journeys booked, departure-stamped, completed-and-settled, cancelled. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-progress journey 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain corridor censuses",
      why: "Journeys and riders are different grains of the same join, and every corridor census here reports both: the NEC runs 45 booked journeys from 8 riders while the US long-distance book runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining riders to journeys",
      why: "Riders carry corridor and created_at; journeys inherit them through joins, and the join type decides who survives. A journey without a rider is corruption; a rider without journeys is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Class mix & CASE banding",
      why: "Coach, Business, Sleeper, Acela First — the class ladder is CASE-classified at every yield review, with fixed edges the fare page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the load forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "type-of-triangle"],
    },
    {
      name: "Booking lead-time clocks",
      why: "Lead time is julianday arithmetic over a stamp that only departed journeys carry, and the corridor cut (2.94 / 2.93 / 3.07 / 3.5) is an operational planning input, not a vanity metric. Amtrak drills date filtering here too — journeys booked in a window, latest booking per rider — because advance-purchase windows drive the yield curve.",
      slugs: ["average-time-of-process-per-machine", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Rider leaderboards",
      why: "The Guest Rewards ladder ranks riders by journeys and lifetime spend, and ties are guaranteed — four riders sit at 4 journeys each on this db, behind the 24, 17, 14, 13, 5 rungs. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a loyalty policy, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Anti-joins on the settlement book",
      why: "Booked is not settled: the finance tables are where the operator world meets money, and the 6 never-collected statements worth 15,217 ARE an anti-join. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) shows up in most screens as the 'who do we dunning-call first' question — and the mirror anomaly (a void statement WITH a leg) is why the status column never gets trusted alone.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "employees-with-missing-information"],
    },
    {
      name: "One-pass censuses",
      why: "The ops board gets completed, in-progress, awaiting and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cents discipline & coverage",
      why: "Settlement statements and legs carry INTEGER cents, and every dollar read is amount_cents / 100.0 — the house rule interns learn the hard way. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the monthly rollup is where per-month folds with cents-safe arithmetic get practiced.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Windows over the corridor spine",
      why: "Corridor reporting keeps every row while adding context: each rider beside their ladder position, each journey beside the load around it. Window COUNT and gap reads — the biggest spacing between a rider's touches, the running math behind capacity walks — are the shapes Amtrak uses to find the repeat-riding habit and the dormant rider.",
      slugs: ["biggest-window-between-events", "find-the-team-size", "last-person-to-fit-in-the-bus"],
    },
    {
      name: "Window frames & running math",
      why: "The yield deck runs cumulative booked value and rolling reads over the month spine, and the frame decides what 'running' means: the default RANGE frame pulls tied rows into the step together, while an explicit ROWS BETWEEN walks strictly row by row. Amtrak drills the moving-versus-cumulative distinction here — a 3-month rolling read and a season-to-date walk are one frame clause apart, and the wrong frame ships a different trendline under the same title.",
      slugs: ["last-person-to-fit-in-the-elevator", "find-cumulative-salary-of-an-employee", "running-total-for-different-genders"],
    },
    {
      name: "Set ops on the close book",
      why: "The settlement pod diffs SETS, not sums: paid-status claims EXCEPT statements-with-legs is how the paid lie (#28) surfaces, and INTERSECT answers the who-settled read. UNION stacks the close packet's labeled sections, and the discipline is the same — set ops compare whole rows, so the branch shapes must match or the diff lies by omission.",
      slugs: ["movie-rating", "count-salary-categories", "the-airport-with-the-most-flights"],
    },
    {
      name: "Grain discipline & DISTINCT",
      why: "Journeys, riders and component lines are three grains of one reservation spine, and the census you owe decides the fold: COUNT(*) at journey grain, COUNT(DISTINCT customer_id) at rider grain, and the lines grain is where money numbers double. The drills here harden the instinct — DISTINCT is a fold-back to a declared grain, not dedupe decoration.",
      slugs: ["article-views-i", "the-users-that-are-eligible-for-discount", "employees-with-deductions"],
    },
    {
      name: "Text shaping on rider identifiers",
      why: "Guest Rewards extracts arrive dirty — names in odd cases, product labels padded, emails that fail a simple pattern — and every join downstream inherits the mess. The t1 text funcs (UPPER, TRIM, SUBSTR, LENGTH) clean identifiers before any census, and this shop treats that shaping as pipeline hygiene, not cosmetics: a mismatched key is a silent anti-join.",
      slugs: ["fix-names-in-a-table", "fix-product-name-format", "invalid-tweets"],
    },
    {
      name: "Date math in the advance-purchase window",
      why: "Lead time is julianday arithmetic, but the operational reads are windows: riders whose second booking lands within seven days of the first, touches before a golden-hour cutoff, confirmation requests inside a deadline. These are the booking-window screens revenue management runs weekly, and each one is a date-math comparison wearing a funnel costume.",
      slugs: ["users-with-two-purchases-within-seven-days", "find-golden-hour-customers", "users-that-actively-request-confirmation-messages"],
    },
  ],

  theory: [
    {
      id: "amtrak-t1",
      q: "Your corridor report joins riders to journeys. When do you INNER and when do you LEFT — and what silently breaks if you filter a journey column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins journeys to riders: a journey with no rider row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from riders: riders with no journeys would BE the answer, arriving with NULL journey columns — on this db the anti-join returns a confident zero, and proving the zero is part of the job: all 16 Guest Rewards riders appear in the reservation book somewhere. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. The same discipline runs the settlement fold: statements LEFT JOIN legs, keep the NULL side, and the 6 never-collected statements worth 15,217 ARE the AR page — plus the mirror trap, a void statement WITH a leg (#11, 925), which the anti-join will never surface.",
      tag: "joins",
    },
    {
      id: "amtrak-t2",
      q: "Four riders tie at 4 journeys on the Guest Rewards ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the ladder runs 24, 17, 14, 13, 5 journeys — then FOUR riders tied at 4. RANK gives the tie the same rung and then skips: the tie consumes ranks 6 through 9 and the next distinct count (3 journeys) lands on 10, implying four phantom rungs that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits the tie arbitrarily, a silent judgment about whose rider-success pod gets the headcount. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer riders, or an explicitly named tie-breaker like created_at then id — and writing it into the query comment. On a corridor leaderboard ties are the norm, not the edge case.",
      tag: "windows",
    },
    {
      id: "amtrak-t3",
      q: "The census shows 103 booked journeys and 16 riders; the NEC shows 45 journeys and 8 riders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts journey rows after the join — one row per booked journey, so the rider with 24 journeys contributes 24. COUNT(DISTINCT customer_id) folds repeats back to riders — the NEC's 45 journeys collapse to 8 logos. Neither is wrong: journeys measure load and corridor momentum; riders measure installed base and coverage. The ratio — 5.6 journeys per rider on the NEC versus 9.5 in the US long-distance book — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join the 251 reservation component lines for upgrades and ancillaries and COUNT(*) silently counts lines, not journeys. Saying 'one row per what?' for every COUNT is the habit the panel grades — at an operator, load, coverage and component depth are three different numbers wearing one report.",
      tag: "aggregation",
    },
    {
      id: "amtrak-t4",
      q: "shipped_at is NULL until a journey departs. What is your policy for the booking-lead report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only departed journeys carry a stamp, so the report measures booking-to-departure for the 82 of 103 journeys that carry shipped_at — averaging 2.98 days with a 2–4 spread — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL journeys returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 booked-awaiting-departure plus 7 cancelled reservations, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead to zero to 'fix' the average — that invents same-day departures for journeys that have not left. The corridor cut (EU 2.94, APAC 2.93, US 3.07, LATAM 3.5) is computed over stamped journeys only, and the population definition ships with the number — a report whose WHERE clause does definitional work without saying so is exactly what an Amtrak reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "amtrak-t5",
      q: "The corridor review wants completed-journey value per corridor for corridors carrying at least ten booked journeys. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-progress, awaiting and cancelled rows before any fold, so it lives in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-journey floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the floor keeps the NEC (45), the state corridors (37) and the long-distance book (19), and drops LATAM's 2. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a corridor load line and an error, and between a floor applied to journeys versus to dollars. The strong answer places every filter by asking: is this a fact about one reservation, or about a corridor?",
      tag: "pipeline",
    },
    {
      id: "amtrak-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full book that is theoretical: 103 journeys always produce a mean fare (338.19), and the journeys above it are the premium-cabin story. On filtered staging — one corridor, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each journey to ITS corridor's average) re-runs per outer row and answers a different question at a different cost — and at an operator that question is the real one: a 400 fare is unremarkable on the sleeper network and an outlier on a state corridor. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "amtrak-t7",
      q: "The booking trend buckets journeys by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the seasonality story becomes fiction. The window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when advance reservations land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk tells the yield story: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, jumps +1,158.21 into August, then takes the steepest drop, −1,326.87, into November. Date discipline is revenue-management discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "amtrak-t8",
      q: "Finance says a settlement statement is 'paid' but the legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent row and mislabels thousands as units. Coverage must read 21 exact / 1 partial (4,000 of 6,148 settled) / 6 never-collected, the opex fold must tie to the GL's operating_expenses account at 25,416, and the trial balance must land 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "amtrak-t9",
      q: "The deck wants a rolling three-month booked-value line and a season-to-date line over the same month spine. What is the difference in the window clause, and where do people ship the wrong trendline?",
      a: "One frame clause apart. The spine is month-ordered, so season-to-date is the default: SUM(total) OVER (ORDER BY month) — which is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and the last row reads the full book, 34,833.28. The rolling read must say its width out loud: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW keeps exactly three buckets under the sum. The trap is width silence — write ORDER BY month with no frame and you shipped a cumulative line labeled rolling; the January trough (1,193.86) and the August jump (+1,158.21) read as slope in one and as level in the other. RANGE versus ROWS matters when the ORDER BY key can tie: on a month spine the key is unique so they agree, but at journey grain tied created_at values make RANGE drag peers into the step together. The strong answer names the frame for every windowed column on the slide — at an operator, a trendline whose frame is implicit is a trendline nobody can reproduce.",
      tag: "windows",
    },
    {
      id: "amtrak-t10",
      q: "Two branches of the close packet must never both ship the same statement row. UNION, UNION ALL, INTERSECT, EXCEPT — which do you reach for, and what does each silently do?",
      a: "By job. UNION ALL stacks and keeps everything — the close packet's sections are built with it, plus a comment stating why the branches cannot collide (different status filters, disjoint by construction). UNION dedups whole rows silently — it looks safe and it is how a legitimate repeated count disappears from a packet with no error anywhere. INTERSECT answers the overlap read: statements that appear on both the paid-status list and the legs ledger — the trustworthy settled core. EXCEPT is the audit diff: paid-status ids EXCEPT ids-with-legs returns exactly #28, the paid lie with zero legs — a set difference, not a sum, so it catches rows other folds never surface. The discipline: set ops compare full row shapes, so the branches must project identical columns, and any branch that can legitimately emit a duplicate row must run UNION ALL deliberately, never UNION hopefully. At this shop the packet is only as trustworthy as the operator that built it — and the operator is a one-word choice.",
      tag: "setops",
    },
    {
      id: "amtrak-t11",
      q: "The dunning list is 'statements with no settlement legs'. LEFT JOIN + IS NULL, NOT EXISTS, NOT IN — pick one and defend it.",
      a: "LEFT JOIN + IS NULL and NOT EXISTS are both honest; NOT IN is the one that lies. The LEFT JOIN keeps all 28 statements and drops the matched — the 6 survivors worth 15,217.00 ARE the chase list, and the shape teaches the mirror anomaly in the same breath: a void statement WITH a leg (#11, 925.00) never appears there, so the anomaly list is a second query, not a filter tweak. NOT EXISTS reads the same intent — 'no leg exists for this statement' — and short-circuits on first match, which at scale is the difference between one probe per row and a materialized anti-join. NOT IN is disqualified by three-valued logic: one NULL in the subquery turns every comparison UNKNOWN and the dunning list silently empties — a zero-row close packet that reads as good news. The policy I would write down: EXISTS for existence tests by default, LEFT JOIN + IS NULL when the NULL side itself carries columns you need, and NOT IN only over a NULL-guarded constant list.",
      tag: "antijoin",
    },
    {
      id: "amtrak-t12",
      q: "A second row for the same rider lands in the extract. Walk me through what breaks, in order, and the query you run every morning to catch it.",
      a: "In order: the ladder splits one logo into two rungs — the 24-journey rider reads as two smaller riders and the concentration story ('63.5% of the book from 3,000-plus riders') quietly understates; the corridor census over-counts riders (the NEC's 8 become 9) while journey counts stay right, so the intensity ratio bends; the never-booked-rider anti-join starts reporting phantom whitespace; and the settlement fold attaches to whichever duplicate the extract happened to join. The morning gate is cheap: GROUP BY the natural key (email, or name plus corridor) HAVING COUNT(*) > 1 — zero rows or the extract bounces before any deck ships. The deeper discipline is identity policy: surrogate ids make joins stable but do not make entities unique, so dedupe runs on the natural key and the surrogate is assigned after dedup, not before. Every downstream number in this kit — 103 journeys, 16 riders, 251 lines — is only as trustworthy as that gate.",
      tag: "quality",
    },
    {
      id: "amtrak-t13",
      q: "This db is small — 103 journeys. Why would a performance question even matter here, and what is the first thing you check when a corridor report crawls?",
      a: "Because the instinct transfers, and the small db is where you can SEE the plan. First check: did a function wrap a filtered column? WHERE julianday(created_at) >= julianday('2024-01-01') scans every row — the function hides the column from any index — while the half-open range created_at >= '2024-01-01' AND created_at < '2024-04-01' stays sargable and reads three months directly. Second: SELECT * across the 251-line join when the deck needs two columns — width is not free, and the line join is exactly where fan-out already doubles the money. Third: the per-row correlated subquery that re-averages a corridor for every journey on it — fine at 103 rows, a different animal at 103 million, and the CTE that computes the corridor mean once is the same answer at one fold. The honest framing in an interview: I profile before I optimize, I know the difference between a scan proportional to the answer and one that isn't, and I practice the habits at toy scale so they are reflexes at production scale.",
      tag: "performance",
    },
    {
      id: "amtrak-t14",
      q: "Corridor ops quotes a 50.5% completed-journey rate; finance's deck says 57.7%. Both read the same db. What is going on and who is right?",
      a: "Both, over different denominators — and the fight is the lesson. 52 of 103 journeys completed and settled is the all-book read: 50.5%, with the 14 awaiting and 7 cancelled kept in the denominator because the funnel exists to watch them. Finance's 57.7% is 52 of the 90 non-cancelled — 'of journeys that could complete, how many did', a defensible operational read that quietly deletes the cancellations from the story. Neither number is wrong; the undefined one is. The discipline I would impose: every KPI ships with its denominator written in the query comment and the slide footer — status filter, timestamp filter, population — and a version note when the definition changes, because a 7-point jump that is really a WHERE clause is how decks lose rooms. The interviewer's follow-up is always 'what is in the denominator?' — the candidate who answers before being asked is the one who gets the offer.",
      tag: "kpis",
    },
    {
      id: "amtrak-t15",
      q: "GROUP BY region and SUM(total) OVER (PARTITION BY region) — when do you need which, and what does the window version keep that the fold destroys?",
      a: "The fold answers 'how much per corridor'; the window answers 'how much per corridor, and each journey's place in it'. GROUP BY region collapses 103 journeys into 4 rows — right for the corridor board, wrong for anything that still needs the journey grain, because the rows are gone. SUM(total) OVER (PARTITION BY region) stamps every journey row with its corridor's total — the journey keeps its identity, its fare, its status, and gains the context column, so 'this 1,088.44 fare is 15% of the US book's 7,286.16' is one SELECT, not a join back to a folded table. The cost is repetition — the partition total repeats on every row — which is exactly what share-of-partition math wants and what a printout does not. The rule I state out loud: if the deliverable is one row per group, GROUP BY; if the deliverable is every row PLUS its group's truth, PARTITION BY — and the moment you catch yourself joining a fold back to its own rows, you wanted the window.",
      tag: "windows",
    },
    {
      id: "amtrak-t16",
      q: "Where do implicit type conversions bite this schema, and what is your casting discipline?",
      a: "Four places. Cents versus dollars: the finance tables are INTEGER cents, so SUM(amount_cents) is a whole number wearing a dollar costume — the read is /100.0 and the discipline is never mixing the two grains in one column. TEXT comparisons: created_at is ISO text, which sorts correctly as text — but unpadded dates break the sort, so filters use canonical zero-padded literals ('2024-03-01') and half-open ranges. Status literals: status = 1 matches nothing on a TEXT column — no error, just an empty result that looks like clean data; the type-class trap is why every literal gets quoted to match the column's stored class. And ROUND precision: ROUND(x, 2) is display policy, not storage — rounding before the fold (AVG(ROUND(total, 2))) shifts the mean by cents and breaks reconciliation with the probed figures. My rule: cast at the boundary, compare in the column's native class, and let the query comment state which grain — cents or dollars — every money cell is in.",
      tag: "types",
    },
    {
      id: "amtrak-t17",
      q: "An analyst joins journeys to component lines for a per-line cut and reports booked value of 103,244.55. The probed book is 34,833.28. What happened, and how do you stop it happening again?",
      a: "Fan-out. orders.total is a journey-grain measure — 34,833.28 over 103 rows — and joining the 251 component lines multiplies each journey's total by its line count, 2.44 on average, inflating the sum to 103,244.55. Every money number downstream of that join is wrong by roughly 3x, and nothing errors: the query runs, the number looks plausible, the deck ships. The fixes, in preference order: aggregate the many-side first — fold lines to journey grain in a CTE, then join the one-row-per-journey fold, which makes fan-out impossible — or keep the join and aggregate only line-grain measures (SUM(quantity), SUM(quantity * unit_price)), never the header's total. SUM(DISTINCT total) looks like a fix and is not — it collapses journeys that genuinely share a total. The policy I would write: header measures live at header grain, line measures live at line grain, and any query touching both states in a comment which grain each column is in — at this operator that comment is the difference between a corridor yield read and a fiction.",
      tag: "joins",
    },
    {
      id: "amtrak-t18",
      q: "Booking lead averages 2.98 days. Walk me through what that number hides and how you present it honestly.",
      a: "julianday(shipped_at) - julianday(created_at) is a float of days, so 2.98 is a mean over a 2-to-4-day discrete spread — no journey actually departed 2.98 days after booking, and presenting the mean without the spread implies a precision the stamp does not carry. The honest presentation: the mean, the min-max (2..4), and the population — 82 of 103 journeys, stamped only, with the 14 awaiting and 7 cancelled named as excluded, not missing. Then the granularity traps: the stamps carry time-of-day, so day boundaries matter — a 23:40 booking counted against a 00:10 departure is one calendar day but two julianday days, and which one the deck wants must be stated. Corridor cuts compound it: EU 2.94, APAC 2.93, US 3.07, LATAM 3.5 — and the LATAM mean rides on 2 journeys, so I would print n beside every corridor mean before anyone plans a season around it. Float dust (2.9800000000000182) is a display question — ROUND(…, 2) — never a data question.",
      tag: "dates",
    },
    {
      id: "amtrak-t19",
      q: "Your fate census returns 52, 30, 14 and… nothing for cancelled. The db has 7 cancelled rows. Where did they go?",
      a: "Into the ELSE. A census built as CASE WHEN status = 'delivered' THEN 1 WHEN status = 'shipped' THEN 1 WHEN status = 'pending' THEN 1 END — no ELSE — hands every cancelled row NULL, and SUM skips NULLs, so the fourth column reads zero-or-empty while the other three look fine. The census now sums to 96, not 103, and the identity that makes the board trustworthy — all four fates reconcile to the book — is broken without an error anywhere. The discipline: every CASE census ships with an explicit ELSE 0, and the arms are exhaustive by construction, or a fifth ELSE-count column proves exhaustiveness. The second trap is arm order: CASE evaluates WHENs top-down, so an overlapping predicate earlier in the chain silently steals rows the later arm was written for. On this db the fate map is small enough to enumerate — delivered, shipped, pending, cancelled, 52 / 30 / 14 / 7 — so any census that does not foot to 103 is wrong on its face, and I would rather the query prove that than the reviewer discover it.",
      tag: "cases",
    },
    {
      id: "amtrak-t20",
      q: "The loyalty pod wants 'riders who booked in at least three consecutive spine months'. Sketch the query and the traps.",
      a: "Gaps-and-islands over the month spine. Stage one: distinct rider-month pairs — SUBSTR(created_at, 1, 7) per rider, DISTINCT, because two bookings in one month are one month for streak purposes and duplicates would false-break the run. Stage two: LAG(month) OVER (PARTITION BY rider ORDER BY month) and a gap flag — a row breaks the island when the prior month is not exactly one step back, and the step is calendar arithmetic ('2024-02' follows '2024-01'), not string subtraction. Stage three: sum the flag over a rider-partitioned running order to get an island id, GROUP BY rider and island, HAVING COUNT(*) >= 3. The traps: DISTINCT before LAG or repeats break islands; month keys as '%Y-%m' or January 2025 continues January 2024's streak; and the boundary case — a rider whose streak is still open at 2025-02 — is a business read ('is the streak ongoing?'), so the query says so rather than letting the window's edge decide silently. The same shape strings together consecutive service days before a disruption review.",
      tag: "islands",
    },
    {
      id: "amtrak-t21",
      q: "The close packet wants every journey's component lines folded into one cell — class, upgrade, ancillary. How do you fold it, and what goes wrong by default?",
      a: "GROUP_CONCAT is the fold, and its defaults are the traps. Default order is unspecified — the packet reads 'Coach, Sleeper' on one run and 'Sleeper, Coach' on the next — so GROUP_CONCAT(product_label ORDER BY line_id) states the order explicitly; the separator defaults to a bare comma, which matters when the cell feeds a human; and the result is TEXT, so a heavy booking can fold a long cell and the packet layout should wrap, not truncate. The deeper grain point: the fold returns one row per journey beside its lines — the read-only cousin of the fan-out problem, collapsing 251 lines back toward 103 journey rows instead of dragging the journey's total across every line. When the packet needs counts too, the fold and the COUNT live in the same SELECT — GROUP_CONCAT for the audit trail, COUNT(*) for the 2.44-lines-per-journey depth the ops board quotes. And if a line label can be NULL, the fold silently drops it — COALESCE the label before folding, because an empty slot in the packet is a question, not a blank.",
      tag: "strings",
    },
    {
      id: "amtrak-t22",
      q: "The ops board needs completed, in-progress, awaiting and cancelled counts in one query. Four subqueries or one scan — and why does the answer matter beyond speed?",
      a: "One scan, and the reason is consistency before it is speed. FILTER (WHERE status = 'delivered') COUNT(*), FILTER (WHERE status = 'shipped') COUNT(*) — each aggregate carries its own predicate while the scan happens once: 52, 30, 14, 7, from one read of one table at one moment. Four subqueries are four scans — at 103 rows the cost is nothing, but the four reads can straddle a write, and the census can disagree with itself (51 completed in the first scan, 52 in the fourth) in a way nobody can reproduce later. The portable twin is SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), which every engine reads, and the discipline is identical: explicit ELSE 0, exhaustive arms, and the four branches must foot to COUNT(*) — 103 — or the census is broken on its face. At an operator the one-pass census is a contract: the board's four numbers came from one timestamp, one table, one truth, and any two decks quoting the same fates cannot disagree.",
      tag: "census",
    },
    {
      id: "amtrak-t23",
      q: "Corridor share of the booked book — EU is 43.3% of 34,833.28. Build it three ways and say where each one lies.",
      a: "Three shapes, three failure modes. The window: SUM(total) OVER () as the denominator beside every row — it recomputes over whatever the WHERE kept, so filtering to delivered silently changes the denominator from the 34,833.28 all-book to the delivered book, and the slide relabels itself. The scalar subquery: total / (SELECT SUM(total) FROM orders) — the denominator is pinned to the all-book regardless of the outer filter, which is what 'share of the whole book' means, but it is also the version that returns NULL the day the inner fold comes back empty. The CTE: fold the denominator once and CROSS JOIN it back — explicit, testable, and impossible to confuse with a filtered denominator because it is visibly a separate fold. EU's 15,089.23 over the all-book is 43.3%; over the delivered book it is something else, and both are defensible KPIs — the lie is shipping either one without its denominator named. My rule: the window for 'share of what this query kept', the subquery or CTE for 'share of the declared book', and the footer of every slide states which.",
      tag: "shares",
    },
    {
      id: "amtrak-t24",
      q: "Finish this sentence: the query is done when… — and what does a reconciliation-first query look like?",
      a: "…when it proves its own denominator. A reconciliation-first query carries its identity inside the SELECT: the fate census ships a fifth column that sums the four fates and must read 103; the settlement packet ships exact + partial + none = 28; the opex fold ships a TOTAL row that must equal the ledger's operating_expenses balance at 25,416; the trial balance ships debits minus credits = 0. If the identity column is ever not the expected constant, the deck does not ship — the query failed loudly instead of the review failing quietly three weeks later. It is cheaper than it sounds: the same CASE arms you already wrote become the check, and a HAVING SUM(fates) <> 103 arm turns the report into its own alarm. The cultural point in an interview: at a company whose books must balance, 'the query returned rows' is not done — 'the query returned rows AND the identity held' is done, and the analyst who writes invariants instead of hopes is the one the comptroller trusts with the close.",
      tag: "invariants",
    },
  ],

  mcqs: [
    {
      id: "amtrak-mcq-1",
      prompt: "A reservation row's status reads 'delivered'. In this kit's journey-fate map, what happened?",
      choices: ["The journey completed and settled — it counts as kept", "The journey is in progress, departure stamped", "Booked and awaiting departure", "A cancelled reservation"],
      answer: 0,
      why: "The fate map is fixed: delivered = completed-and-settled — 52 of 103 journeys (50.5%). It is the only status where the journey has actually run and the fare has settled.",
      notes: [
        { choice: 1, why: "In-progress is 'shipped' — 30 journeys with a departure stamp that have not completed. Calling them completed inflates the kept rate before a single trip finishes." },
        { choice: 2, why: "Booked-awaiting-departure is 'pending' — 14 journeys with no shipped_at yet. Pending is not kept and not lost; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-2",
      prompt: "Departure-stamp coverage is stamped journeys ÷ which population? The db holds 82 stamped, 14 awaiting, 7 cancelled of 103 booked.",
      choices: ["Stamped + cancelled only (82/89 = 92.1%)", "All journeys booked (82/103 = 79.6%)", "Completed journeys only (52/82)", "Distinct riders (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL journeys booked — the 14 awaiting rows stay in the denominator because 'not yet departed' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting inflates the rate to 92.1% by deleting the population still ahead of departure — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — completed is fate, shipped_at is the departure stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-3",
      prompt: "The NEC carries 45 booked journeys from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts journey rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap between them — 5.6 journeys per rider — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every journey has a rider. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts corridors, not riders — a third grain nobody asked for. The census is journeys AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled reservations only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every corridor reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the cancellation map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-5",
      prompt: "Keep only corridors carrying at least 10 booked journeys. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY corridor HAVING COUNT(*) >= 10", "WHERE journeys >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A journey-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU (45), APAC (37) and US (19), and drops LATAM's 2.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'journeys' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-6",
      prompt: "The rider ladder runs 24, 17, 14, 13, 5 journeys, then FOUR riders tied at 4. Under RANK, what rank do the two 3-journey riders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-journey riders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The ladder's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lead rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting journeys double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 journeys.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-8",
      prompt: "A staging-table exclusion uses rider_id NOT IN (SELECT customer_id FROM journeys WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every journey carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty exclusion reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-9",
      prompt: "A close packet stacks never-settled statements under settled statements in one layout, built with UNION. A reviewer says one statement's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same statement, same amounts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same statement id, same amounts, no branch label — collapse into one, and the close packet loses a statement with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-10",
      prompt: "A dashboard walks booked value journey by journey: SUM(total) OVER (ORDER BY created_at). Two journeys share a booking timestamp, and the cumulative 'jumps two journeys at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so journeys tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at journey grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-11",
      prompt: "On the reservation book (103 journeys), what does COUNT(*) - COUNT(shipped_at) return — and what does the gap name?",
      choices: ["21 — the journeys with no departure stamp: 14 booked-awaiting plus 7 cancelled", "82 — the journeys that departed", "14 — the awaiting journeys only", "7 — the cancelled reservations only"],
      answer: 0,
      why: "COUNT(*) counts all 103 rows; COUNT(shipped_at) counts the 82 stamped ones. The gap is 21 — exactly the 14 booked-awaiting-departure plus the 7 cancelled, the rows with no stamp to give. The difference between the two counts is a population read, free of charge.",
      notes: [
        { choice: 1, why: "82 is COUNT(shipped_at) itself, not the gap. Reading the wrong side of the subtraction is the off-by-a-plate version of this drill." },
        { choice: 2, why: "14 counts only the pending rows — cancelled reservations also lack a stamp. The gap is the union of both, 21." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-12",
      prompt: "A month spine is built with STRFTIME('%m', created_at). What ships?",
      choices: ["12 rows — January 2024 and January 2025 merge into one '01' bucket and the seasonality story becomes fiction", "14 rows — the spine is intact", "103 rows — one per journey", "An error — STRFTIME needs a julianday input"],
      answer: 0,
      why: "'%m' emits the month number only, so the 14 calendar months collapse to 12 buckets — January 2024 (3,731.97 booked) and January 2025 (1,669.50) fold into one row. The year-aware bucket is '%Y-%m', which keeps all 14 months distinct.",
      notes: [
        { choice: 1, why: "14 rows is the '%Y-%m' answer. '%m' silently merges the two Januaries — and their revenues — into one bucket." },
        { choice: 3, why: "STRFTIME takes the ISO text timestamps directly on this db; the failure mode is a wrong shape, not an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-13",
      prompt: "The corridor AOV board reads EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Which corridor leads — and what must the slide carry?",
      choices: ["LATAM — with n printed beside it: a 2-journey mean is a vignette, not a lead", "LATAM — highest AOV, full stop", "US — the honest leader among corridors carrying a real book", "EU — biggest revenue, so biggest AOV"],
      answer: 0,
      why: "LATAM's 426.22 is real but rides on 2 journeys worth 852.44 — the denominator is the story. The slide that survives review prints n beside every mean (45, 37, 19, 2 journeys); US 383.48 is the highest mean among corridors carrying a real book at n = 19.",
      notes: [
        { choice: 1, why: "Crowning LATAM without the n is exactly the small-denominator trap — one more 100-fare booking moves the mean 50 points." },
        { choice: 3, why: "AOV and total revenue are different metrics — EU leads revenue (15,089.23) but its AOV (335.32) is mid-pack." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-14",
      prompt: "Which query shape returns the 6 never-collected settlement statements worth 15,217.00?",
      choices: ["invoices LEFT JOIN payments … WHERE payments.id IS NULL", "invoices INNER JOIN payments", "invoices JOIN payments … WHERE payments.id IS NOT NULL", "SELECT * FROM payments WHERE amount_cents > 15000"],
      answer: 0,
      why: "The anti-join: LEFT JOIN keeps all 28 statements, the IS NULL probe keeps the 6 whose join produced no leg. That is the dunning list — 15,217.00 across 5 open statements and one paid-status lie.",
      notes: [
        { choice: 1, why: "INNER JOIN keeps exactly the matched 22 — it deletes the 6 rows that ARE the answer." },
        { choice: 2, why: "IS NOT NULL is the mirror — it returns the settled book, not the chase list." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-15",
      prompt: "SELECT SUM(amount_cents) FROM expenses WHERE category = 'Ads' prints 457000. The dollar figure the close packet expects is:",
      choices: ["4,570.00 — INTEGER cents divided by 100.0", "45,700.00", "457.00", "4,570,000.00"],
      answer: 0,
      why: "The finance tables store INTEGER cents; 457,000 cents is 4,570.00 dollars — the Ads line the opex stack quotes. The read is amount_cents / 100.0, and the .0 keeps the division real.",
      notes: [
        { choice: 2, why: "457.00 is a /1000 slip — the convention is cents, not millis." },
        { choice: 3, why: "Multiplying instead of dividing — a thousandfold error in the other direction, and the kind that survives a glance because the digits look right." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-16",
      prompt: "Which settlement row is the 'status lies' anomaly — a status that contradicts the legs ledger?",
      choices: ["#11 — status void, but one settlement leg debited 925.00", "#28 — status paid with zero legs", "#25 — status open, 4,000.00 of 6,148.00 settled", "#1 — status paid, two legs footing 4,860.00"],
      answer: 0,
      why: "Void means no money should move; #11 carries a 925.00 leg anyway — the status contradicts the ledger. #28 is the mirror anomaly (paid with NO legs), #25 is the tracked partial, and #1 is a clean two-leg settle.",
      notes: [
        { choice: 1, why: "#28 is an anomaly too — but the opposite polarity: a claim of money with no movement, not movement with no claim." },
        { choice: 2, why: "#25's partial coverage is a tracked exception with its own bucket in the coverage census, not a contradiction." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-17",
      prompt: "SELECT category, SUM(amount_cents) FROM expenses GROUP BY category — how many rows return, and what foots to 25,416?",
      choices: ["4 rows — Rent, Ads, Travel, Tools; the four sums foot to 25,416", "36 rows — one per expense entry", "14 rows — one per Rent entry", "6 rows — one per partner"],
      answer: 0,
      why: "GROUP BY category folds the 36 entries into the 4 opex lines — Rent 16,800, Ads 4,570, Travel 2,521, Tools 1,525 — footing to 25,416, the ledger's operating_expenses debit balance. 36 is the row count before the fold; 14 is just Rent's share of it.",
      notes: [
        { choice: 1, why: "36 is the input grain. GROUP BY exists precisely to leave it — shipping 36 rows IS the missing-fold bug." },
        { choice: 2, why: "14 counts only the Rent entries. The fold returns one row per distinct category, not per entry of the biggest one." },
      ],
      difficulty: "easy",
    },
    {
      id: "amtrak-mcq-18",
      prompt: "An analyst joins orders to order_items for a line-grain cut and reports booked value 103,244.55. The probed book is 34,833.28. What happened?",
      choices: ["Fan-out — total is a journey-grain measure and the 251-line join re-counted each journey's total once per line (2.44 lines per journey on average)", "The db grew between probes", "Rounding accumulated across 251 lines", "order_items carries its own total column that double-counts"],
      answer: 0,
      why: "SUM(o.total) after the join multiplies each journey's total by its line count — 251 rows over 103 journeys is the 2.44 depth, and the sum inflates to 103,244.55. Header measures live at header grain: aggregate the lines' own measures (quantity, quantity × unit_price), or pre-fold lines to journey grain in a CTE before joining.",
      notes: [
        { choice: 2, why: "Rounding moves cents, not 68,000 dollars. The ratio — almost exactly the 2.44 lines-per-journey depth — is the fan-out signature." },
        { choice: 3, why: "order_items carries unit_price and quantity, not a total — and even if it did, SUMming two totals is a grain error, not a schema one." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-19",
      prompt: "SELECT id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments — what returns, and why does it matter?",
      choices: ["#28 only — a paid-status statement with no settlement leg: the status that lies", "Empty — every paid statement has legs", "All 21 paid statements", "#11 — the void statement with a leg"],
      answer: 0,
      why: "EXCEPT is the set diff: paid-status ids minus ids that appear in the legs ledger. 21 paid statements, 20 with legs — the survivor is #28 (1,756.00), the paid lie. The anti-join finds it by status; EXCEPT finds it by set membership, trusting no status column at all.",
      notes: [
        { choice: 1, why: "Empty would mean the books are clean — the point of the diff is that they are not, by exactly one row." },
        { choice: 3, why: "#11 is void, so it never enters the left set — and it HAS a leg, so the right set contains it. EXCEPT keeps left-minus-right; #11 is on neither side of the cut." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-20",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) prints 2.9800000000000182 on the analyst's run; the platform doc says 2.98. The response?",
      choices: ["The float is honest — binary floating point can't represent the mean exactly; ROUND(…, 2) for display, and compare floats with tolerances, never =", "The db is corrupted — re-probe", "CAST the timestamps to INTEGER before subtracting", "The AVG needs DISTINCT"],
      answer: 0,
      why: "julianday returns a float; the mean of 82 float deltas carries binary-representation dust in the 15th digit. The number is correct — 2.98 at reporting precision. ROUND(…, 2) makes the display match the doc; the deeper rule is floats compare with tolerances, never with equality.",
      notes: [
        { choice: 2, why: "Casting to INTEGER days would destroy the 2.98 — the whole-number read is 3, and the lead clock's honesty lives in the decimals." },
        { choice: 3, why: "DISTINCT would collapse the many journeys that share a lead — 2.0, 3.0, 4.0 — and average three values, not 82 journeys." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-21",
      prompt: "GROUP_CONCAT(p.number) folds each statement's settlement legs into one cell for the close packet. Reviewers report the order shuffles between runs. The fix?",
      choices: ["State the order inside the aggregate: GROUP_CONCAT(p.number ORDER BY p.paid_on, p.id)", "Wrap the whole query in ORDER BY — that orders the fold contents", "GROUP_CONCAT is unordered by design — ship it with a caveat", "Use MAX instead — one value can't shuffle"],
      answer: 0,
      why: "GROUP_CONCAT's default order is unspecified — SQLite makes no promise, and plan changes reshuffle the cell. The order lives INSIDE the aggregate: GROUP_CONCAT(x ORDER BY …) pins the sequence, which is what a packet a human reads requires.",
      notes: [
        { choice: 1, why: "The outer ORDER BY orders the result's ROWS, not the characters inside one cell — the shuffle survives it." },
        { choice: 3, why: "MAX returns one leg — the packet needs the audit trail of ALL legs, which is the fold's whole job." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-22",
      prompt: "Two filters for 'bookings since 2024-01-01': WHERE julianday(created_at) >= julianday('2024-01-01') versus WHERE created_at >= '2024-01-01'. Same rows — what differs that matters?",
      choices: ["The wrapped function hides created_at from any index — the bare range stays sargable and scales; the function version scans", "No difference — same rows, same plan", "The julianday version is faster — it precomputes", "The literal version can't handle time-of-day in the stamps"],
      answer: 0,
      why: "Same rows, different plans. Wrapping the column in a function makes the predicate opaque to indexing — every row gets julianday'd. The bare range on ISO text compares lexically, stays sargable, and pairs with the half-open upper bound (AND created_at < '2024-04-01') that doesn't drop the last night. Small db, same instinct — the habit is the point.",
      notes: [
        { choice: 3, why: "ISO text timestamps compare correctly with a date-only literal — '2024-01-01 08:23' >= '2024-01-01' is true. The literal form is the safe one." },
        { choice: 1, why: "Same rows is true — that's the trap. The question is the plan, and the plan is what breaks at scale." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-23",
      prompt: "Share-of-book with WHERE status = 'delivered' and SUM(total) OVER () as the denominator. What does the denominator hold?",
      choices: ["The delivered book only — windows compute after WHERE, so 'share of the book' quietly became 'share of the delivered book'", "The all-book 34,833.28 — windows ignore WHERE", "Zero — the window can't sit over an aggregate", "The delivered journey count, not the delivered value"],
      answer: 0,
      why: "Windows compute AFTER WHERE, so OVER () folds exactly the rows the filter kept — 52 delivered journeys' value, not the 103-journey book. If the KPI is share of the all-book, pin the denominator with a scalar subquery or a separate CTE fold. Both are defensible KPIs; shipping one labeled as the other is the lie.",
      notes: [
        { choice: 1, why: "Windows don't ignore WHERE — they compute after it. That ordering is precisely why the denominator drifts." },
        { choice: 3, why: "OVER () folds the same measure the outer expression sums — SUM(total) here — so the denominator is delivered VALUE. The count would need COUNT(*)." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-24",
      prompt: "The deck needs a strict 3-month rolling booked-value line over the month spine. Which frame?",
      choices: ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "No frame — the default over ORDER BY month", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING"],
      answer: 0,
      why: "Say the width: 2 PRECEDING plus current = exactly three buckets under the sum. The default frame is cumulative (UNBOUNDED PRECEDING) — that's the season-to-date line wearing a rolling label. UNBOUNDED FOLLOWING runs the sum from each month to the END of the spine — a remaining-season line, not a trailing read.",
      notes: [
        { choice: 1, why: "The default is RANGE UNBOUNDED PRECEDING — cumulative, not rolling. January's 3,731.97 and the July trough would read as level, not slope." },
        { choice: 3, why: "That frame sums forward from each month — the opposite of a trailing read, and the 'trend' would lead the data." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-25",
      prompt: "ORDER BY shipped_at on the reservation book — where do the 14 awaiting rows (shipped_at NULL) land in SQLite's default ASC?",
      choices: ["First — NULLs sort before every value", "Last", "They're dropped from the result", "SQLite errors on NULL ordering"],
      answer: 0,
      why: "SQLite sorts NULLs first in ASC (last in DESC). The board opens with the 14 never-departed journeys — which may be exactly what an ops reader wants (the queue), but it must be a CHOICE: state it, or order by a COALESCE flag first. Silent NULL placement is how a departures board becomes an exceptions board.",
      notes: [
        { choice: 1, why: "Last is the DESC behavior — and also what many engineers assume. The assumption is the bug." },
        { choice: 2, why: "Rows are never dropped by ORDER BY — the 14 are in the result, just at the top where nobody expected them." },
      ],
      difficulty: "medium",
    },
    {
      id: "amtrak-mcq-26",
      prompt: "The dunning packet needs TWO labeled rows: the open never-settled cohort (5 / 13,461.00) and the paid-status lie (1 / 1,756.00). Which build produces exactly that — and nothing else?",
      choices: ["The zero-leg anti-join grouped by claim: LEFT JOIN legs, WHERE p.id IS NULL, GROUP BY i.status, ROUND(SUM(amount_cents) / 100.0, 2)", "WHERE status = 'open' over invoices, grouped", "Two scans of payments grouped by method", "UNION of the two expected rows hardcoded as literals"],
      answer: 0,
      why: "The anti-join ignores status by construction — that is WHY the paid lie surfaces beside the open cohort: 6 zero-leg statements, grouped by claim, folding to 5 open / 13,461.00 and 1 paid / 1,756.00. Filtering by status first finds only the rows that admit to being open — the lie never shows up, which is the exact failure the packet exists to catch.",
      notes: [
        { choice: 1, why: "Status-first filtering trusts the claim — #28 claims paid, so the 'open' filter returns 5 rows and the packet ships blind." },
        { choice: 2, why: "Payments grouped by method folds the settled book (card 37,364.00, wire 32,248.00) — real numbers from the wrong grain; the zero-leg statements are absent from payments entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-27",
      prompt: "Per-corridor above-average fares: WHERE total > (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE c2.region = c.region). What does this return that the global-mean version doesn't — and what does it cost?",
      choices: ["Journeys above THEIR corridor's mean — a different cohort (the US mean 383.48 sits above the 338.19 platform mean, so its bar is higher), re-running the fold per outer row", "The same rows cheaper — corridor means are cheaper than the platform mean", "Only corridors above the platform mean", "An error — you can't reference the outer table in a subquery"],
      answer: 0,
      why: "The correlated predicate re-averages per corridor as each outer row is tested: a 360 fare is above the platform mean (338.19) but below the US corridor's 383.48 — the correlated version classifies it honestly per market. The cost is one fold per outer row; the CTE that computes corridor means once and joins back is the same answer at one fold. Semantics first, then cost — that's the order the panel grades.",
      notes: [
        { choice: 2, why: "That's a HAVING question about groups, not a row filter — and it answers 'which corridors are expensive', not 'which journeys price above their market'." },
        { choice: 3, why: "Correlated subqueries exist precisely to reference the outer row — this is the textbook shape, not an error." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-28",
      prompt: "'Riders who booked in at least 3 consecutive spine months' — the FIRST trap in the query is:",
      choices: ["Two bookings in one month are one month — DISTINCT the rider-month pairs before LAG, or duplicates false-break the streak", "LAG needs a recursive CTE", "Consecutive months can't be detected in SQL", "The spine must be filtered to delivered journeys first"],
      answer: 0,
      why: "LAG over rider-month pairs only sees months if the pairs are distinct: a rider booking twice in March shows two March rows, LAG hands March to March, the gap reads zero — and the streak survives a gap elsewhere. DISTINCT before LAG is the move; then the month gap is calendar arithmetic ('2024-02' follows '2024-01'), not string subtraction.",
      notes: [
        { choice: 1, why: "LAG is a window — no recursion needed. The recursion instinct fires on the word 'consecutive' and wastes the question." },
        { choice: 3, why: "Filtering to delivered would delete in-progress and awaiting journeys from a booking-streak read — the streak is about booking, not completion." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-29",
      prompt: "The corridor × fate grid must print all 16 corridor-status cells — including LATAM's zero in-progress/cancelled cells — from one query. The build:",
      choices: ["CROSS JOIN corridors × statuses into a 16-cell frame, LEFT JOIN journeys back, COUNT — the frame guarantees every cell exists", "GROUP BY region, status over orders — the 13 non-empty cells are the grid", "16 UNION-ed scalar counts", "FULL OUTER JOIN of orders to itself on region"],
      answer: 0,
      why: "GROUP BY can only return combos that EXIST — the probed grid shows 13 filled cells because 3 combos (LATAM × shipped/pending/cancelled) have no rows, and the fold drops them silently. The zero-fill needs the frame built independently (4 corridors × 4 fates CROSS JOIN) with the data LEFT JOINed on, so COUNT of the nullable side prints honest zeros. The grid's 16 cells are the deliverable; 13 is a bug wearing a grid's clothes.",
      notes: [
        { choice: 1, why: "13 cells is what the fold returns — the missing three are LATAM's, and 'absent' prints as absent, not zero, exactly where the board needs zeros." },
        { choice: 2, why: "Sixteen hard-coded scalars are sixteen chances to drift — and the next corridor added breaks the packet again. The frame is data, not literals." },
      ],
      difficulty: "hard",
    },
    {
      id: "amtrak-mcq-30",
      prompt: "The board wants, for every rider, their booked value AND their corridor's total beside them — 16 rows, not 4. The shape:",
      choices: ["SUM(o.total) OVER (PARTITION BY c.region) beside each rider's own total — the window keeps every row and stamps the partition fold on each", "GROUP BY c.region — the fold the deck asked for", "LAG over riders ordered by region", "A scalar subquery per rider summing their own journeys"],
      answer: 0,
      why: "PARTITION BY region computes the corridor fold (EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44) and stamps it on every rider row of that corridor — 16 rows, each carrying its corridor's truth. GROUP BY collapses to 4 rows and the riders are gone; the per-rider scalar answers a different question (their own book, not their corridor's).",
      notes: [
        { choice: 1, why: "The fold is right; the grain is wrong — the deck asked for riders BESIDE their corridor, and GROUP BY deleted the riders to produce it." },
        { choice: 2, why: "LAG hands each rider the PREVIOUS rider's value in some order — proximity is not partition membership, and the corridor total is not a neighbor's value." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-amtrak-1",
      tier: "easy",
      topic: "j7",
      universe: "funnel",
      title: "The corridor departure census",
      brief:
        "Corridor ops memo on the storefront db: Monday's corridor review opens with the departure census — booked journeys that have actually departed, distinct riders covered, and the average booking-to-departure lead — and revenue management is explicit that the lead average runs over departed journeys only, with the population stated on the slide. Probed facts: 103 booked journeys worth 34,833.28; 82 carry the departure stamp (shipped_at), averaging 2.98 days of lead with a 2-4 day spread; the corridor split reads EU 36 departed from 8 riders at 2.94 days, APAC 29 from 5 at 2.93, US 15 from 2 at 3.07, LATAM 2 from 1 at 3.5. The review reads biggest journey count first.",
      ask: "Return each corridor with its departed-journey count, distinct rider count and average booking lead to 2 decimals, biggest journey count first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS journeys,\n       COUNT({1} o.customer_id) AS riders,\n       ROUND(AVG(julianday(o.{2}) - julianday(o.created_at)), {3}) AS avg_lead_days\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.shipped_at IS {4} NULL\nGROUP BY c.region\nORDER BY journeys {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the rider deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat journeys back to riders: the NEC reads 8, not 36. SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the departure stamp",
          why: "Lead time is booking to DEPARTURE: julianday(o.shipped_at) - julianday(o.created_at). Using created_at on both sides zeroes every lead — a day minus itself — and the corridor clock reads 0.0 while looking valid.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the lead precision",
          why: "Lead reports to 2 decimals — the NEC's 2.94. ROUND(…, 1) prints 2.9 and the corridor map stops reconciling with the 2.98-day platform average revenue management quotes on the same slide.",
        },
        {
          answer: "NOT",
          kind: "keyword",
          label: "the departure guard",
          why: "shipped_at IS NOT NULL keeps only the 82 departed journeys — the 14 awaiting have no stamp yet and no lead to average. Dropping NOT flips the filter to IS NULL and the census suddenly reads the 21 never-departed rows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads biggest journey count on top: EU 36, APAC 29, US 15, LATAM 2. ASC would open the meeting on LATAM's 2 — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "NULL", "created_at"],
      walkthrough:
        "One join, one fold, four columns at two grains. The join attaches every journey to its rider's corridor — the WHERE keeps only the 82 departed journeys — and GROUP BY region folds them into four rows where COUNT(*) reads departures (EU 36, APAC 29, US 15, LATAM 2), COUNT(DISTINCT o.customer_id) reads rider coverage (8 / 5 / 2 / 1), and ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) reads lead days (2.94 / 2.93 / 3.07 / 3.5) — straight from the probed census, reconciling upward to the 2.98-day platform average over the stated 82-row population. The 14 awaiting and 7 cancelled reservations never enter: no stamp, no departure, no lead. The distractors fail honestly: SUM in the rider slot adds customer ids together and MAX reports the largest id — a census of nothing; created_at in the stamp slot subtracts a day from itself and every corridor reads 0.0; 1 in the precision slot truncates to one decimal so the map drifts off the 2.98 average; dropping NOT flips the filter to IS NULL and the census counts the 21 never-departed rows; ASC opens the review on LATAM's 2. The two-grain pairing is the read: EU's 36-from-8 (4.5 departures per rider) versus the US's 15-from-2 (7.5) says the long-distance book concentrates while the corridor broadens — one query, two business claims.",
    },
    {
      id: "cs-amtrak-2",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The corridor opex close stack",
      brief:
        "Comptroller memo on the storefront db: month-close ships when the corridor opex fold ties to the GL, and the close packet wants the opex stack in one query — per-line spend, entry counts, and a grand-total row that must reconcile to the ledger. Probed facts: 36 opex entries across four lines — Rent (track and facility leases) 14 entries / 16,800, Ads (marketing and Guest Rewards promos) 14 / 4,570, Travel (crew deadhead) 3 / 2,521, Tools (engineering tooling) 5 / 1,525 — footing to 25,416, which is exactly the operating_expenses account's debit balance in the ledger. Figures are the dollar read of the settlement book's INTEGER cents (amount_cents / 100.0). The packet reads biggest spend first with the TOTAL row last.",
      ask: "Return each opex line with spend in dollars and entry count, plus one TOTAL row footing the book, biggest spend first and TOTAL last.",
      template:
        "WITH opex AS (\n  SELECT {1} AS line,\n         SUM({2}) / 100.0 AS spend,\n         COUNT(*) AS entries\n  FROM expenses\n  GROUP BY line\n)\nSELECT line, spend, entries, 0 AS stack_order FROM opex\nUNION ALL\nSELECT {3}, SUM(amount_cents) / 100.0, COUNT(*), 1 FROM expenses\nORDER BY stack_order, spend {4};",
      slots: [
        {
          answer: "category",
          kind: "keyword",
          label: "the opex fold key",
          why: "The packet folds by opex line: GROUP BY category via the line alias — Rent, Ads, Travel, Tools. Folding by spent_on or id re-buckets the book into 37 near-singleton rows and the GL tie evaporates.",
        },
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the cents measure",
          why: "Spend is SUM(amount_cents) / 100.0 — the INTEGER-cents dollar read. Summing id codes instead prices Ads at 2.65; summing the spent_on date strings prices it at 283.38 — both look like money, neither is.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The second arm folds the whole table again under 'TOTAL' (36 entries / 25,416) so UNION ALL appends exactly one grand row. A label the close packet does not recognize — 'GRAND TOTAL' — breaks every downstream reference to the packet.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The packet reads Rent 16,800, Ads 4,570, Travel 2,521, Tools 1,525 with the TOTAL row held last by the stack_order guard. ASC flips the packet to smallest-spend-first — a correct fold presented backwards.",
        },
      ],
      distractors: ["spent_on", "id", "COUNT", "ASC", "line", "'GRAND TOTAL'"],
      walkthrough:
        "Two stages: fold the book, then stack the total. The CTE groups the 36 opex entries by line and folds SUM(amount_cents) / 100.0 — the INTEGER-cents dollar read — beside COUNT(*): Rent 14 entries / 16,800, Ads 14 / 4,570, Travel 3 / 2,521, Tools 5 / 1,525. The second arm folds the whole table again under the 'TOTAL' label (36 / 25,416) and UNION ALL appends it; the stack_order guard column (0 for lines, 1 for the grand row) sinks the total below the fold while spend DESC orders the lines big-to-small. The tie is the whole point: 25,416 equals the ledger's operating_expenses debit balance, and the ledger's trial balance lands 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The distractors fail honestly: spent_on in the fold key re-buckets by spend date into 37 near-singleton rows, and id does the same by entry id; id in the measure sums id codes (Ads reads 2.65) and spent_on sums date strings (Ads reads 283.38) — both fake money; COUNT in the measure errors on nested aggregates; 'GRAND TOTAL' relabels the grand row so the close packet's references miss; ASC flips the packet to smallest-first. One query, one packet, one tie to the GL.",
    },
    {
      id: "cs-amtrak-3",
      tier: "easy",
      topic: "t3",
      universe: "month-close",
      title: "The 14-month booking spine",
      brief:
        "Revenue-management memo on the storefront db: the yield deck opens with the month spine — journeys booked, booked value, and the cancelled reservations that never became departures — bucketed by booking month, oldest first, every money cell to 2 decimals so the walk reconciles with the close packet. Probed facts: the 14-bucket spine runs 2024-01 (8 journeys / 3,731.97 / 1 cancelled) through 2025-02 (7 / 2,390.53 / 0), with the July trough at 1,193.86 and the whole book footing to 34,833.28 across 103 journeys; exactly 5 of the 14 buckets carry at least one cancellation. The spine is a census, not a sample — every booked journey lands in exactly one bucket.",
      ask: "Return the 14-month booking spine — month, journey count, booked value to 2 decimals, cancelled count — oldest bucket first.",
      template:
        "SELECT STRFTIME({1}, o.created_at) AS month,\n       COUNT(*) AS journeys,\n       ROUND(SUM(o.total), {2}) AS booked_value,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nGROUP BY month\nORDER BY month {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the year-aware bucket",
          why: "'%Y-%m' buckets by year-month and keeps all 14 buckets from 2024-01 to 2025-02. '%m' alone merges January 2024 (3,731.97) with January 2025 (1,669.50) into one '01' row — 12 buckets, and the seasonality walk is fiction.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money precision",
          why: "Booked value prints to 2 decimals — 3,731.97, 1,193.86 — the cells the trend table and the close packet share. ROUND(…, 1) prints 3,732.0 and the spine stops reconciling with every other artifact in the packet.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the lost-fare arm",
          why: "The fourth column counts cancelled reservations — 7 across the spine, in the 5 buckets that carry them. Counting 'delivered' instead rebrands the kept book as lost, and the funnel reads upside down while looking like a clean census.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first spine",
          why: "A trend reads left to right, oldest to newest — 2024-01 on top through 2025-02. DESC hands the deck a reversed trendline: the walk opens at the trough and ends at the book's open, and every 'jump into August' call reads backwards.",
        },
      ],
      distractors: ["'%m'", "'%Y'", "'delivered'", "DESC", "1"],
      walkthrough:
        "One table, one bucket, one conditional count — the spine is the first query of every yield review. STRFTIME('%Y-%m', created_at) cuts the 103 journeys into 14 year-month buckets; GROUP BY folds them once; the money column is ROUND(SUM(total), 2) so 2024-01 prints 3,731.97 exactly as the trend table carries it, footing to the 34,833.28 book; the cancelled column reads 1 in 2024-01, 1 in 2024-03, 2 in 2024-07, 2 in 2024-11 and 1 in 2025-01 — 7 cancelled reservations across 5 buckets, zero everywhere else, and the seven cancel cells plus the 96 kept cells foot to 103 by construction. The distractors fail honestly: '%m' merges the two Januaries into one bucket — 12 rows, and 3,731.97 + 1,669.50 become one indistinguishable cell; '%Y' collapses the whole spine to 2 rows and the seasonality read dies; 'delivered' in the fate arm counts the kept book into the cancelled column — 52 spread across the buckets instead of 7; 1 in the precision slot truncates every money cell to one decimal (3,732.0) and the packet stops tying; DESC reverses the spine so the walk opens at 2025-02 and every month-over-month delta reads backwards. The trough is the read: July's 1,193.86 is the low-water mark the advance-purchase queue exists to fill.",
    },
    {
      id: "cs-amtrak-4",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The corridor cancellation map",
      brief:
        "Funnel-review memo on the storefront db: the leak question is per corridor — of every journey booked in a corridor, how many reservations were cancelled — and the map must carry both grains, the counts and the share, because 3 cancellations out of 45 is a different story from 3 out of 19. Probed facts: EU 45 placed / 3 cancelled / 6.7%, APAC 37 / 3 / 8.1%, US 19 / 1 / 5.3%, LATAM 2 / 0 / 0%; the platform books 103 journeys with 7 cancelled (6.8%). The share prints to 1 decimal to match the funnel deck, worst corridor first.",
      ask: "Return each corridor with placed journeys, cancelled count and cancellation share to 1 decimal, worst share first.",
      template:
        "SELECT c.region AS corridor,\n       COUNT(*) AS placed,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,\n       ROUND({1} * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), {2}) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {3}\nORDER BY cancel_pct {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the real-arithmetic multiplier",
          why: "100.0 BEFORE the division promotes real arithmetic; a bare 100 leaves integer division — flags over counts truncate toward zero and every corridor prints 0.0. The .0 is the whole percent.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "The funnel deck carries shares to 1 decimal — 8.1, 6.7, 5.3. ROUND(…, 2) prints 8.11 / 6.67 / 5.26 and the map stops matching every other artifact in the review.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the corridor fold key",
          why: "GROUP BY c.region folds the 103 journeys into the 4 corridors the map owes. GROUP BY o.status re-buckets the book by fate and the corridor story dissolves into four status rows; GROUP BY c.city explodes it to 16 one-rider rows.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-corridor-first order",
          why: "The review reads the leak on top: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0. ASC opens on LATAM — a corridor with 2 bookings and no cancellations is not the win the order implies.",
        },
      ],
      distractors: ["100", "2", "o.status", "ASC", "c.city"],
      walkthrough:
        "One join, one CASE, one share — and the denominator is the whole interview. The join attaches each journey to its rider's corridor; GROUP BY region folds to four rows; COUNT(*) reads placed (45 / 37 / 19 / 2), the conditional count reads cancelled (3 / 3 / 1 / 0), and the share is 100.0 × flags / COUNT(*) rounded to 1 decimal — 8.1, 6.7, 5.3, 0.0, reconciling upward to the platform's 7-of-103 = 6.8%. The 100.0 sits BEFORE the division because the flags-and-count fold is integer arithmetic: a bare 100 truncates every corridor to 0.0, and the map — the review's centerpiece — prints as all-clear. The distractors fail honestly: 100 (no .0) ships that all-clear map; 2 in the precision slot prints 8.11 / 6.67 / 5.26 and breaks parity with the deck; o.status as the fold key re-buckets by fate into four rows — placed becomes 52 / 30 / 14 / 7 and every corridor vanishes; c.city explodes the map to 16 one-rider rows; ASC opens the review on LATAM's 0.0 and buries the APAC leak at the bottom. The two-grain read closes it: APAC's 8.1% on 37 placed is 3 reservations, the same count as EU's 6.7% on 45 — share and load are different claims, and the map owes both.",
    },
    {
      id: "cs-amtrak-5",
      tier: "medium",
      topic: "j5",
      universe: "fraud",
      title: "The zero-leg chase list",
      brief:
        "Settlement-pod memo on the storefront db: dunning goes out only after the anti-join runs, because status is a claim and legs are the ledger. Probed facts: 28 statements; 6 carry zero settlement legs — #18 at 873.00, #21 at 1,295.00, #24 at 4,937.00, #26 at 3,562.00, #27 at 2,794.00 (all open, footing 13,461.00) and #28 at 1,756.00 claiming paid with no leg to show. The call sheet reads biggest chase first, the claimed status printed beside every amount so the paid lie stays visible, and money in dollars to 2 decimals from the INTEGER-cents book.",
      ask: "Return the zero-leg chase sheet — statement id, claimed status, amount in dollars to 2 decimals — biggest chase first.",
      template:
        "SELECT i.id AS statement_id,\n       {1} AS claim,\n       ROUND(i.amount_cents / {2}, 2) AS chase_value\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE {3} IS NULL\nORDER BY chase_value {4};",
      slots: [
        {
          answer: "i.status",
          kind: "keyword",
          label: "the claim column",
          why: "The sheet prints the statement's CLAIMED status beside each amount — that is how #28's 'paid' row stays visible on a call sheet it does not belong on. Hardcoding 'paid' relabels every row and erases the lie; p.method is the rail (card/wire), not a status.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Statements store INTEGER cents; /100.0 prints 4,937.00 and 873.00. /10.0 prints a hundredfold-off sheet at 49,370.00 — and a dunning call quoting ten times the debt is a self-inflicted incident.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the leg-survivor probe",
          why: "WHERE p.id IS NULL keeps exactly the statements whose LEFT JOIN produced no leg — the 6. Probing i.id IS NULL keeps nothing (statement ids are never NULL); p.invoice_id IS NULL happens to match today, but p.id is the row-existence probe that survives schema drift.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-chase-first order",
          why: "The call sheet reads 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00 — biggest debt first, the paid lie fourth. ASC opens the caller on the smallest balance and burns the day before reaching the big chases.",
        },
      ],
      distractors: ["10.0", "i.id", "ASC", "'paid'", "i.customer_id"],
      walkthrough:
        "The anti-join is the pod's whole morning, and the sheet is its artifact. LEFT JOIN keeps all 28 statements; legs attach on p.invoice_id = i.id; WHERE p.id IS NULL keeps the 6 no leg ever touched; the SELECT prints them at statement grain — id, claimed status, amount — with the cents divider /100.0 turning raw cents into 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00. The read the pod ships: five open statements footing 13,461.00, plus #28 — status paid, zero legs, 1,756.00 — the claim the ledger refutes; together they are the probed 15,217.00 chase book, and the other 22 statements (21 exact to the cent, #25 partial at 4,000.00 of 6,148.00) stay off the sheet. The distractors fail honestly: 10.0 scales every amount tenfold — 49,370.00, a dunning call quoting ten times the debt; i.id as the probe keeps nothing, because a statement's own id is never NULL, so the sheet ships empty and the close calls it clean; 'paid' as the join key matches no legs, the anti-join balloons to all 28 statements, and the 'chase list' includes the 21 statements that already settled; i.customer_id joins legs on the wrong key entirely and the sheet empties; ASC opens the calls on 873.00 and ends the day before reaching 4,937.00. Claim versus ledger is the whole audit — the sheet carries both columns because the difference between them IS the finding.",
    },
    {
      id: "cs-amtrak-6",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The Guest Rewards ladder",
      brief:
        "Loyalty-pod memo on the storefront db: the Guest Rewards ladder re-cuts weekly — journeys per rider, ranked biggest book first, with the tie block fully visible so the shared-rung policy can be defended in the review. Probed facts: the ladder runs 24 / 17 / 14 / 13 / 5 journeys, then FOUR riders tied at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez) — shared rung 6 through 9 under the house RANK policy, with the next distinct count (3 journeys) landing on rank 10; the 16-rider book splits EU 8 / APAC 5 / US 2 / LATAM 1. The pod reads the top 10 rows: the five solo rungs and the whole four-way tie.",
      ask: "Return the top 10 of the Guest Rewards ladder — rider, corridor, journey count, ladder rank under the house RANK policy.",
      template:
        "SELECT c.name AS rider,\n       c.region AS corridor,\n       COUNT(*) AS journeys,\n       {1}() OVER (ORDER BY {2} {3}) AS ladder_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nORDER BY journeys DESC, c.name\nLIMIT {4};",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung policy",
          why: "The house policy is RANK: the four riders tied at 4 journeys share rung 6, and the next distinct count lands on rung 10 — gaps included, peers honored. DENSE_RANK prints 7 after the tie and ROW_NUMBER splits the peers arbitrarily; both are different loyalty policies wearing function syntax.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the ladder measure",
          why: "The ladder ranks by journeys booked — the frequency read the loyalty pod owns. SUM(o.total) ranks by spend and reshuffles the rungs below the top (a 3-journey rider with 1,458.97 outranks a 4-journey rider with 737.68 on spend but trails on journeys); c.id ranks by signup id, which is a roster, not a ladder.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The ladder reads 24 down — biggest book on rung 1. ASC crowns the 1-journey riders and buries the 24-journey logo at the bottom of the window: a correct query aimed at the wrong end of the leaderboard.",
        },
        {
          answer: "10",
          kind: "number",
          noVerify: true,
          label: "the tie-block window",
          why: "LIMIT 10 shows the five solo rungs plus the whole four-way tie (ranks 6–9) — the block the review must see to defend the policy. LIMIT 8 cuts the tie in half and the review argues over rows that exist but do not display.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "SUM(o.total)", "ASC", "8"],
      walkthrough:
        "One join, one fold, one window — and the window's ORDER BY is the policy. GROUP BY rider folds 103 journeys into 16 riders; COUNT(*) reads each book (24 / 17 / 14 / 13 / 5, then the four-way tie at 4, with 3, 3, 2, 2, 1, 1 below the cut); RANK() OVER (ORDER BY COUNT(*) DESC) stamps the house policy — shared rungs with gaps — so the tie block reads 6, 6, 6, 6 and the first 3-journey rider lands on rung 10, exactly the walk the loyalty deck publishes. The outer ORDER BY journeys DESC, c.name keeps the display deterministic inside the tie; LIMIT 10 frames the five solo rungs plus the full tie block. The distractors fail honestly: DENSE_RANK renumbers the rung after the tie to 7 — a no-gaps policy the pod never voted for; ROW_NUMBER splits the four peers into 6-7-8-9 by whatever order the engine likes — four arbitrary winners; SUM(o.total) ranks by spend and reshuffles the sub-top (Farid Nasser's 1,458.97 jumps Noah Meyer's 737.68 — a spend ladder, not a frequency ladder); ASC inverts the board so rung 1 is a 1-journey rider; LIMIT 8 slices the tie block at two peers and the review debates a cut it cannot see. The two reads the pod ships from this one query: Alice Chen's 24-journey book is 23.3% of all journeys (24 of 103), and the tie block is where the next-tier policy decision lives.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-class fare revenue: SUM over reservation component lines grouped by travel class is exactly the class-yield fold revenue management opens every corridor review with." },
    { slug: "immediate-food-delivery-ii", why: "Journeys ticketed within a week of departure versus far-ahead bookings — a conditional share over a timestamp comparison, the same shape as the corridor booking-lead read." },
    { slug: "employee-bonus", why: "Riders LEFT JOINed to journey spend: a rider with no journeys is whitespace, a journey with no rider is corruption — choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Completion share per rider with COALESCE — Guest Rewards riders who never completed a journey must still appear, at zero, not vanish from the loyalty report." },
    { slug: "queries-quality-and-percentage", why: "Fare yield with a CASE percentage — the same 100.0-before-division discipline the cancellation map (APAC 8.1%, EU 6.7%) is built on." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-journey rider — finding the account with the most booked journeys is the opening line of the concentration story (63.5% of the book from 3,000-plus riders)." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Corridor HAVING gates: which corridors carry at least ten booked journeys — the group-level floor that separates load lines from noise." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Component lines above the platform-average unit count — a two-stage fold (compute the mean, then filter against it), exactly the ancillary-attach screen." },
    { slug: "game-play-analysis-iv", why: "First departure stamp per rider, then the next touch — first-journey-to-return logic is how the loyalty pod measures the repeat-riding habit." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Class-migration reads: riders who rode Coach AND Business but never Sleeper — conditional aggregation over the class ladder, the upsell cohort." },
    { slug: "sales-by-day-of-the-week", why: "Weekday-versus-weekend departure load pivoted across the week — corridor capacity planning's favorite strftime/CASE drill." },
    { slug: "second-highest-salary", why: "The second-priciest fare product without LIMIT-1-OFFSET-1 — the tie-safe subquery shape the fare ladder (max 199.99 against an 8-deep mid band) demands." },
    { slug: "not-boring-movies", why: "Filtered, ordered departure boards — parity and length filters with ORDER BY, the small drill that keeps public listings honest." },
    { slug: "report-contiguous-dates", why: "Consecutive service days on a corridor spine — gaps-and-islands logic is how ops strings together daily service patterns before a disruption review." },
    { slug: "top-travellers", why: "Lifetime value per rider, joined and ordered — the Guest Rewards leaderboard is this query with a loyalty overlay and a tie policy." },
    { slug: "sales-analysis-iii", why: "Journeys completed inside a window — the date-filtered fold the corridor review ships every week, filtered before the fold and denominator stated." },
    { slug: "duplicate-emails", why: "Guest Rewards identity hygiene: two rider rows sharing an email split one logo into two ladder rungs and bend the 63.5% concentration read. The HAVING COUNT(*) > 1 gate is the extract's morning health check." },
    { slug: "classes-more-than-5-students", why: "The group-level floor before any class-yield read: which fare families carry at least ten component lines. Same HAVING gate, rail paint — a floor on the census, not a filter on the rows." },
    { slug: "game-play-analysis-i", why: "First booking per rider — MIN over the journey spine — is the 'riding since' line on every Guest Rewards profile and the anchor for cohort windows." },
    { slug: "number-of-employees-who-met-the-target", why: "Lead-target census: which corridors hold the 2.98-day booking-lead norm. A threshold met-or-missed read over julianday arithmetic — the conditional count shape the ops board runs weekly." },
    { slug: "average-selling-price", why: "Corridor yield is a weighted fold — fare times quantity over quantity, not an average of averages. This problem is the exact join-fold the corridor yield read re-cuts weekly." },
    { slug: "trips-and-users", why: "Cancellation share with denominator discipline — the hard-tier version of the corridor map's 100.0-before-division drill (APAC 8.1%, EU 6.7%, denominators named)." },
    { slug: "hopper-company-queries-i", why: "The zero-filled month spine: months with no bookings still appear, at zero. The 14-bucket spine (2024-01 to 2025-02) is this problem's exact discipline." },
    { slug: "project-employees-i", why: "Line-grain revenue per fare family — component lines joined to their travel class, folded once. The per-class fare read revenue management opens corridor reviews with." },
    { slug: "the-number-of-employees-which-report-to-each-employee", why: "Two grains in one fold: journeys and distinct riders per corridor — the two-column census (45-and-8 on the NEC) is this problem's shape with corridor paint." },
    { slug: "npv-queries", why: "Statement-to-leg attachment: settlement statements LEFT JOINed to the remittance legs that landed — the coverage read (21 exact / 1 partial / 6 none) starts as this join." },
    { slug: "find-total-time-spent-by-each-employee", why: "Lead-time sums at rider grain: SUM of booking-to-departure days per rider — the aggregate behind the 2.98-day norm and its corridor cuts." },
    { slug: "top-five-artists", why: "Top-N corridors by booked value — ORDER BY the fold, LIMIT the board. The corridor ranking the yield deck ships is this problem with region paint." },
    { slug: "ratings-histogram", why: "Fare-band histogram: journeys bucketed into fare bands with conditional counts — the class-mix census (Coach through Acela First) in zero-fill discipline." },
    { slug: "group-employees-of-the-same-salary", why: "The four-way tie at 4 journeys as tie GROUPS: DENSE_RANK's shared rungs are the ladder's no-gaps twin, and this problem drills exactly that policy choice." },
    { slug: "compute-the-rank-as-a-percentage", why: "The ladder as percentiles — rank against cohort, window COUNT under the hood. The loyalty pod's tier cuts are this shape with Guest Rewards paint." },
    { slug: "maximum-transaction-each-day", why: "Peak booking day per month: argmax over a window with tie handling — the daily load read behind the monthly spine, and a ROW_NUMBER-versus-RANK decision in the wild." },
  ],
};
