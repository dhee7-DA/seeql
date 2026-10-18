// Delta Air Lines — Wave-9 (Task 98), travel domain, no tagged pool — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12).
// Full-service network-carrier SQL: the storefront db read airline-honest (the emirates
// house convention) — customers are SkyMiles members (region = market), orders are booked
// itineraries (delivered = flown-and-settled, shipped = airborne with shipped_at as the
// wheels-off stamp, pending = booked-awaiting-departure, cancelled = scrubbed PNRs),
// order_items are fare/ancillary component lines (quantity = units, unit_price = unit
// fare), products are fare products (the Main Cabin → Delta One cabin ladder plus
// ancillary bundles; the db's category codes Audio/Wearables/… label the fare families),
// suppliers are hub concession & catering partners, and the invoices/payments/expenses/
// ledger books are settlement billing in INTEGER cents. Pool provenance:
// company-pools.md carries NO Delta section — all 10 topic slug sets and all 16 problems
// are theme-curated from the pools file's theme menu (sql rows only; no w*/d*/f* rows)
// and say so. Case briefs quote probed figures from scripts/company-facts.md; every case
// slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// NOTE for the wave-9 registry wiring agent: Delta is NOT yet in registry COMPANY_META.
// Header fields authored as id "delta", domainId "travel", name "Delta Air Lines",
// tagline "Premium network yield out of the Atlanta hub", accent text-sky-400 (unused by
// all 17 travel siblings) — wire COMPANY_META to match exactly.

import type { CompanyKit } from "../types";

export const deltaKit: CompanyKit = {
  id: "delta",
  domainId: "travel",
  name: "Delta Air Lines",
  tagline: "Premium network yield out of the Atlanta hub",
  accent: "text-sky-400",

  brief: [
    "**Delta Air Lines** is the premium US global carrier — the full-service network airline that runs hub-and-spoke out of ATL, DTW, MSP and SEA, sells a cabin ladder from Main Cabin through Comfort+ and First up to Delta One, and owns one of the most-valuable loyalty programs in travel in SkyMiles. Where the low-cost siblings optimize a single fare, Delta's economics are a mix story: which cabin, which market, which ancillary bundle, flown or scrubbed. This kit maps the storefront db onto that world: the 16 customers rows are SkyMiles members, the 103 orders are booked itineraries worth **34,833.28**, and the 251 order_items rows are fare and ancillary component lines — quantity = units, unit_price = unit fare. The status map is fixed: delivered = {emerald:flown-and-settled} (52, 50.5%), shipped = airborne with `shipped_at` as the wheels-off stamp (30, 29.1%), pending = booked-awaiting-departure (14), cancelled = {rose:scrubbed PNRs} (7, 6.8%).",
    "The data org splits into network revenue management, ops analytics, the SkyMiles/loyalty pod and a settlement-finance group, and they read the same spine at different grains. The fate census is the heartbeat: an itinerary books at created_at and `shipped_at` is stamped at wheels-off — **82 of 103 itineraries** carry the stamp, moving from booking to departure in a **2.98-day** average with a 2–4-day spread, a booking curve so tight the ops floor treats it as plan, not delay. Money sits one layer down: settlement billing in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the fare book sits with members whose lifetime spend crosses 3,000 (71.2% above 2,000) — a handful of premium flyers carry the network.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU runs 45 itineraries from 8 members (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'do scrubbed PNRs count in your base?'*), then into the SkyMiles frequency ladder where four members sit tied at 4 itineraries and rank semantics become a loyalty-policy decision. Late rounds walk the {sky:14-month booking spine} (2024-01 to 2025-02) or pivot fare-family mix by market and probe which arm owns the ELSE. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Delta section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fate censuses, two-grain market reads, tie-heavy loyalty ladders, fare-family pivots and the cents-safe settlement spine. Do the topics in order — they are built for spaced practice rather than one sitting — then run the six case studies on the live storefront db: the {emerald:market fate census} network ops opens Monday with and the {sky:fare-family mix board} revenue management reads at every yield review, plus the SkyMiles value ladder, the settlement coverage split, the booking-spine walk and the cabin-coverage screen for the later rounds. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the departure bank. An ops analyst opens the hub dashboard before the morning standup: did the overnight bank at ATL file, did any itinerary get its `shipped_at` wheels-off stamp without a fleet assignment, does the one-pass fate census reconcile — 52 flown-and-settled + 30 airborne + 14 awaiting departure + 7 scrubbed = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the booking-to-wheels-off window drifts off the **2.98-day** norm, the advance-purchase queue gets pulled before revenue management's yield read ships.",
    "**11:30 —** Midday is the mix read. Revenue management wants the fare-family pivot by market — which families carry which share of each market's book; the SkyMiles pod wants the frequency ladder with the four-way tie at 4 itineraries handled honestly — shared rungs, named policy; a regional VP wants itineraries per member beside member counts (EU 45-from-8 versus US 19-from-2) and the yield spread called out: US **383.48** average fare against APAC's 313.66. Each ask is a join, a conditional aggregate and one judgment call about fates. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the yield-review argument*.",
    "**15:30 —** The afternoon tilts toward settlement money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217** — before finance sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Booked fare book", what: "Total booked itinerary value: 34,833.28 across 103 itineraries, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the cabin-ladder story — one 1,088.44 itinerary outweighs the smallest 42 combined." },
    { name: "Flown-and-settled share", what: "Delivered ÷ ALL itineraries booked: 52 of 103 (50.5%). 'Flown' is a status-filtered conditional count, and the denominator — awaiting-departure and scrubbed included — is the whole interview." },
    { name: "Airborne share", what: "Itineraries with the wheels-off stamp (shipped) ÷ booked: 30 of 103 (29.1%). Airborne is not flown-and-settled — calling the 30 'flown' inflates the completion read before the trip settles." },
    { name: "Scrub rate", what: "Scrubbed PNRs ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The cancellation map that drives re-accommodation and winback calendars." },
    { name: "Booking-to-wheels-off window", what: "Booking to departure (created_at → shipped_at) over stamped itineraries only: 82 of 103, 2.98-day average, range 2–4. The population definition ships with the number — unstamped rows have no window yet." },
    { name: "SkyMiles concentration", what: "Share of the fare book from members spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the premium services pod and sizes the SkyMiles engagement calendar." },
    { name: "Market yield spread", what: "Average booked fare by market: US 383.48 and LATAM 426.22 against APAC 313.66 and EU 335.32. Premium mix, not volume — LATAM's 426.22 rides a 2-itinerary base, and saying so is the analyst's job." },
    { name: "Settlement coverage", what: "Booked versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the settlement group refreshes every close." },
  ],

  topics: [
    {
      name: "Itinerary-fate counts",
      why: "Every Delta ops screen opens with the fate census: itineraries booked, flown-and-settled, airborne with wheels-off stamped, scrubbed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an airborne itinerary 'flown' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest", "flight-occupancy-and-waitlist-analysis", "rolling-7d-actives"],
    },
    {
      name: "Two-grain market censuses",
      why: "Itineraries and members are different grains of the same join, and every census here reports both: EU runs 45 itineraries from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "the-airport-with-the-most-flights"],
    },
    {
      name: "Joining members to itineraries",
      why: "Members carry market and enrollment; itineraries inherit them through joins, and the join type decides who survives. An itinerary without a member is corruption; a member without itineraries is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier", "trips-and-users"],
    },
    {
      name: "SkyMiles frequency ladders",
      why: "Loyalty tiering is rank-window reporting where ties are guaranteed — four members sit at 4 itineraries each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer flyers, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "top-travellers", "customer-order-frequency", "cohort-repeat-revenue"],
    },
    {
      name: "Fare-band CASE ladders",
      why: "Cabin bands are CASE-classified — the db's fare products top out at a 199.99 flagship and the premium band above 200 is empty, which is exactly the honest-boundary question Delta asks. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the yield forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "calculate-product-final-price"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month booking spine (2024-01 to 2025-02) is the network review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine", "sessionize-events", "consecutive-available-seats", "calculate-orders-within-each-interval"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets flown-and-settled, airborne, awaiting and scrubbed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the departure bank moves.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "find-peak-calling-hours-for-each-city"],
    },
    {
      name: "Fare-family mix pivots",
      why: "Revenue management reads booked value per market split across fare-product families — a CASE pivot with one arm per family and a total column that must foot to the market book. Wide pivots die on missing ELSE arms and swapped family literals, so the drill is arm discipline, not syntax.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "primary-department-for-each-employee", "the-most-recent-orders-for-each-product"],
    },
    {
      name: "Anti-joins & never-flown reads",
      why: "Loyalty hygiene is a real workflow: members who never flew, statements with no settlement leg, fare products that never left the shelf. The LEFT JOIN + IS NULL shape (and NOT EXISTS twin) shows up in most screens as the 'find the dead cohort' question — with the honest caveat that never-booked members return a confident zero on this db.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Flown is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the network world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning list.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule", "bank-account-summary", "chargeback-rate-ranking"],
    },
  ],

  theory: [
    {
      id: "delta-t1",
      q: "Your market report joins itineraries to SkyMiles members. When do you INNER and when do you LEFT — and what silently breaks if you filter an itinerary column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins itineraries to members: an itinerary with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from members: the members with no itineraries ARE the answer, arriving with NULL itinerary columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-booked members, and proving that zero is itself the analyst's job: all 16 SkyMiles members appear in the itinerary table somewhere. Then watch the third grain: join order_items for fare-component lines and COUNT(*) silently counts component lines — 251 of them — not itineraries. Saying 'one row per what?' for every join and every COUNT is the habit the panel grades.",
      tag: "joins",
    },
    {
      id: "delta-t2",
      q: "Four SkyMiles members tie at 4 itineraries each on the frequency ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (2) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose member gets the upgrade lane. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer flyers (RANK or DENSE_RANK), or an explicitly named tie-breaker like lifetime spend DESC, then id — and writing it in the query comment. SkyMiles tiering is a published benefits contract: a ladder whose rungs depend on an unnamed ROW_ORDER is a support ticket waiting to happen.",
      tag: "windows",
    },
    {
      id: "delta-t3",
      q: "The census shows 103 itineraries and 16 members; EU shows 45 itineraries and 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts itinerary rows after the join — one row per itinerary, so a member with 24 bookings contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 itineraries collapse to 8 flyers. Neither is wrong: itineraries measure load and booking momentum, members measure installed base and reach. The ratio — 5.6 itineraries per member in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for fare-component lines and COUNT(*) silently counts lines, not itineraries — 251 of them. On an airline the same discipline applies to ancillaries: an ancillary attach-rate whose numerator counts component lines and whose denominator counts itineraries is two grains wearing one number. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "delta-t4",
      q: "shipped_at is NULL until wheels-off. What is your policy for the booking-to-departure report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped itineraries have a window, so the report measures booking-to-wheels-off for the 82 of 103 itineraries that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL itineraries returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting-departure plus 7 scrubbed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the window to zero to 'fix' the average — that invents same-day departures for trips that have not left the gate. And the fate filter interacts: scrubbed PNRs never get a stamp, so any 'average days to departure' that quietly includes them is averaging over a cohort that cannot fly. A report whose WHERE clause is doing definitional work without saying so is exactly what an ops reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "delta-t5",
      q: "The yield review wants booked fare per market for markets carrying at least ten itineraries. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The fate rule is a row-level fact — status = 'delivered' discards airborne, awaiting and scrubbed rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-itinerary floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a yield line and an error, and between a threshold applied to itineraries versus to dollars. The subtle Delta version: a scrub-rate filter is a ratio, so the status counts must both survive the fold and the share is computed after GROUP BY — filtering 'cancelled' out in WHERE first makes the scrub share divide by a base that can no longer see the scrubs. The strong answer places every filter by asking: is this a fact about one itinerary, or about a market?",
      tag: "pipeline",
    },
    {
      id: "delta-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 itineraries always produce a mean (338.19 on this db — the premium markets clear it: US at 383.48 and LATAM at 426.22, while EU at 335.32 and APAC at 313.66 sit below). On filtered staging tables — one cabin, one fate, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each itinerary to ITS member's average) re-runs per outer row and answers a different question at a different cost — the SkyMiles pod uses it for against-own-history reads. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "delta-t7",
      q: "The booking trend buckets itineraries by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when advance-purchase bookings land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's story on this db: the book opens at 3,731.97, troughs at 1,193.86 in July 2024, then jumps +1,158.21 into August. Date discipline is network discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "delta-t8",
      q: "Finance says a settlement statement is 'paid' but the payments table has no legs for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN payment legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. Between them sit the honest splits: 21 exact-covered statements (65,612 against 65,612), one partial (4,000 of 6,148 — statement #25, still open), and five split-settlement statements that pay in two legs. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent leg. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "delta-t9",
      q: "The fare-band CASE keeps growing — Main Cabin, Comfort+, First, Delta One, plus ancillary bundle arms. What are your rules for arm order, exhaustiveness, and who owns the ELSE?",
      a: "Arms are an ordered decision tree: specific-first, broad-last, because CASE stops at the first match and a broad arm placed early silently re-bands everything below it — the 1,088.44 Delta One itinerary landing in Main Cabin is how a yield review loses its premium story without an error. Exhaustiveness is proven by reconciliation, not by inspection: the band fold must foot to the 34,833.28 book, and a missing band shows up as a hole exactly the size of what nobody classified. The ELSE belongs to a named owner: I write ELSE 'unmapped' as a quarantine arm that pages the analyst, rather than a silent catch-all that launders dirty rows into the biggest band. On this db the honest boundary is the 199.99 ceiling — the premium-plus arm is empty by construction, and reporting that empty arm is part of the contract.",
      tag: "case",
    },
    {
      id: "delta-t10",
      q: "orders to order_items is 103 to 251. Where do you fold, where do you join, and how do you stop the fan-out from leaking into a member census?",
      a: "I fold line grain to order grain first — a CTE that groups order_items by order_id into booked value — and join downstream of that fold, so every query after it runs at itinerary grain. Joins placed before the fold fan 103 into 251 and COUNT(*) starts counting component lines while wearing an itinerary label; SUM of the order total double-counts the same way. The diagnostic habit: before trusting any aggregate, run COUNT(*), COUNT(DISTINCT o.id) and COUNT(DISTINCT o.customer_id) on the joined set — when the first two disagree, the fan-out is live and the census is lying. The SkyMiles pod sees the same failure as an attach-rate question: lines per itinerary is a legitimate ratio, but only when both sides say line grain and itinerary grain out loud. One row per what, stated before the join, is the whole defense.",
      tag: "joins",
    },
    {
      id: "delta-t11",
      q: "Walk me through building the two-grain market census — itineraries AND members per market — with a CTE. Where does each COUNT live, and why stage it at all?",
      a: "The CTE folds once at the grain the business argues about: SELECT customer_id, COUNT(*) AS itineraries, SUM(total) AS booked FROM orders GROUP BY customer_id — one row per member, the fold reused by every report this week. The outer query joins members and aggregates twice at market grain: COUNT(*) reads the itinerary load (EU 45), COUNT(DISTINCT customer_id) reads the member coverage (EU 8), and the intensity ratio between them is the growth read. Staging earns its keep three ways: the definition is written exactly once, the fold is testable in isolation against the 103-reconciliation, and the outer query stays readable enough that the two COUNTs sit side by side where the grain contrast is visible. The failure I am staging against is the single-pass version where someone COUNTs after joining order_items and the census quietly becomes a line count.",
      tag: "ctes",
    },
    {
      id: "delta-t12",
      q: "An ancillary attach rate ships at 2.4 attach lines per itinerary and nobody trusts it. Walk the grain diagnosis.",
      a: "2.4 is not wrong, it is unnamed: 251 component lines over 103 itineraries, a lines-per-itinerary ratio wearing an attach-rate badge. Attach rate as the business means it is a per-itinerary boolean — did this itinerary carry any ancillary line — which is COUNT(DISTINCT o.id) FILTER (WHERE an ancillary arm fired) over COUNT(DISTINCT o.id), an EXISTS-shaped numerator, not a line sum. The two numbers answer different questions and both are publishable, but only with their grains in the title. The tell that a rate is grain-broken is when it can exceed its own denominator's universe — 2.4 attach 'lines' per itinerary was never a rate at all. My rule on this kit's data: numerator grain and denominator grain get named in the same sentence, or the number does not ship.",
      tag: "grain",
    },
    {
      id: "delta-t13",
      q: "Why are half-open windows the house rule for season cuts on TEXT timestamps, and where does BETWEEN actually break?",
      a: "TEXT timestamps compare lexicographically, so created_at >= '2024-01-01' AND created_at < '2024-04-01' is a mathematically clean interval — every instant of the quarter, nothing from April, no edge case argued. BETWEEN '2024-01-01' AND '2024-03-31' includes the instant '2024-03-31' but not '2024-03-31T14:22:05', because the string '2024-03-31' sorts before any timestamped moment of that day — the last night's advance-purchase bookings vanish silently, and quarter-end is exactly when they land. The half-open form also composes: adjacent quarters tile the year with no overlap and no gap, so two teams cutting the same year independently reconcile by construction. On the 14-month spine (2024-01 through 2025-02) every window I ship is [start, next-start), and the cut is stated in the report title.",
      tag: "dates",
    },
    {
      id: "delta-t14",
      q: "The yield review wants the booking spine narrated. Walk the 14 months.",
      a: "The spine is STRFTIME('%Y-%m', created_at) folded over booked value: it opens at 3,731.97 in January 2024, drifts down through spring, and troughs at 1,193.86 in July — the summer hole the network plan already prices in. August answers with a +1,158.21 jump to 2,352.07, the sharpest recovery on the spine, and September holds the rebuild at 3,116.04. The sharpest drop is into November, −1,326.87 off October's 2,975.67, and the book closes the window at 2,390.53 in February 2025. Mechanics that make the narration honest: LAG gives the prior month with the first row NULL by definition — baseline, never zero — and the delta column is computed as booked minus LAG(booked) inside the same window so the walk and its movements cannot disagree. The trough and the jump are the two rows the review remembers; the LAG discipline is why they can trust the rest.",
      tag: "dates",
    },
    {
      id: "delta-t15",
      q: "When does a running total need PARTITION BY, and when must it not have one?",
      a: "The business question decides the fence. A network booked-value walk — cumulative across every itinerary in booking order — must NOT carry a partition, because the story is the whole book compounding. A per-market walk — each region's book building inside the region — needs PARTITION BY region, or EU's rows carry the cumulative of every market booked before them and the last row of each partition stops being that market's book. The silent partner is the frame: with ORDER BY the default frame is RANGE, so rows tied on the ordering key enter the walk together, and at itinerary grain ties on created_at are guaranteed — I write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the walk must be strictly row-by-row. My test before shipping: the last row of each partition must equal the number a plain GROUP BY produces, and the unpartitioned walk's last row must equal 34,833.28.",
      tag: "windows",
    },
    {
      id: "delta-t16",
      q: "The published SkyMiles ladder must survive an audit rerun. How do you make ranking deterministic?",
      a: "Three commitments. First, a named tie-break inside the window: ORDER BY itineraries DESC, lifetime_value DESC, id — a business key first, then id as the final anchor, so two members tied at 4 itineraries always split the same way and the ladder reruns byte-identical. Second, the rank function is a stated policy, not a syntax pick: RANK shares rungs and skips (the four-way tie at 4 consumes ranks 6 through 9, the next distinct count lands on 10), DENSE_RANK shares without gaps, ROW_NUMBER splits ties by whatever the tie-break says — and the choice goes in the query comment because tiering is a published benefits contract. Third, the output proves itself: the rung count and the gap pattern are asserted against the known ladder — 24, 17, 14, 13, 5, then the tie block — before the slide ships. A leaderboard that cannot reproduce itself is not a leaderboard; it is a screenshot.",
      tag: "windows",
    },
    {
      id: "delta-t17",
      q: "Compare each itinerary to its MEMBER's own average fare. Write the shape and say what it costs.",
      a: "Two honest builds. The correlated subquery — WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-runs the member fold once per outer row: conceptually simple, correct on any filter, and O(rows × members-fold) unless the planner caches it, which is why it shows up in slow-query reviews. The window build — AVG(total) OVER (PARTITION BY customer_id) beside each row — folds each member once in a single pass and reads faster at this scale, but it cannot filter directly; you wrap it in an outer query to keep WHERE total > member_avg, because window functions run after WHERE. Semantics differ at the edges: the window build includes the row itself in its own average, the correlated build can exclude it with an id predicate — the interviewer wants that distinction named. On this db the question finds the premium flyers fast: against their own 24-itinerary history, Alice Chen's priciest legs stand out in a way the network mean at 338.19 never shows.",
      tag: "subqueries",
    },
    {
      id: "delta-t18",
      q: "Family coverage: members who flew an Audio line and a Wearables line but never Video. Why is NOT EXISTS the right negative test?",
      a: "The positive arms are reachability probes — EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Audio') — one per family, ANDed. The negative arm is where the design decision lives: NOT IN (SELECT … category = 'Video') returns the whole report as empty the moment the subquery's column carries a single NULL, because x NOT IN (…) is UNKNOWN under three-valued logic; NOT EXISTS asks 'does even one row exist' and NULL rows simply do not qualify, which is the semantics the business means. On this db the screen answers: 3 members — 2 in EU, 1 in APAC — flew Audio and Wearables but never Video, the upsell shortlist for the Video family. The same shape powers the never-flown and never-collected reads; learning it once covers every 'find the cohort that did NOT' question this kit asks.",
      tag: "subqueries",
    },
    {
      id: "delta-t19",
      q: "Category literals: 'Audio' versus 'audio'. What is your hygiene for CASE arms and joins on TEXT?",
      a: "SQLite string comparison is case-sensitive by default, so 'audio' = 'Audio' is false — a lowercase literal in a CASE arm does not error, it silently reclassifies every line into ELSE, and the mix board's headline column reads zero. My hygiene: literals are copied from the source table (SELECT DISTINCT category) into the query, never typed from memory; arms are validated by reconciliation — the pivoted columns must foot to the family totals, Audio 11,744.01 and Wearables 6,929.12 on this book; and ad-hoc case-insensitivity, if a vendor feed demands it, is an explicit COLLATE NOCASE at the join, written down as a data-contract exception rather than scattered LOWER() calls. GROUP_CONCAT gets the same discipline: the folded string's casing and separator are staged deliberately, because a bundle manifest that prints differently on every run is not a manifest. Text discipline is not cosmetics — it is what keeps a pivot from being a different report every Monday.",
      tag: "strings",
    },
    {
      id: "delta-t20",
      q: "FILTER (WHERE …) versus SUM(CASE WHEN …): how do you choose, and what drifts when a board mixes them?",
      a: "Both compute conditional counts over one scan — 52 flown-and-settled, 30 airborne, 14 awaiting, 7 scrubbed either way, reconciling to 103 by construction. FILTER wins on readability when the arms are pure predicates: the census reads as four labeled aggregates instead of four nested CASEs, and the reconciliation identity sits visibly in one SELECT. SUM(CASE …) is the portable twin — same semantics on every engine, and the only choice when the branch needs to transform a value (SUM(CASE WHEN family = 'Audio' THEN line_value ELSE 0 END)) rather than count rows. The drift to police is mixing idioms across one board: two analysts, two spellings, one arm quietly counting pending into flown because the CASE arm's ELSE defaulted differently. My rule: one census, one idiom, and the four arms must sum to the 103 anchor before the board renders.",
      tag: "aggregation",
    },
    {
      id: "delta-t21",
      q: "Build market share of the booked book. Where do the two aggregation levels live, and how do the shares prove themselves?",
      a: "Two levels, stacked — never one GROUP BY. The numerator folds per market: SELECT c.region, SUM(o.total) FROM orders o JOIN customers c … GROUP BY c.region — EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. The denominator folds the whole table once: either a scalar subquery (SELECT SUM(total) FROM orders) beside every row, or the window form SUM(SUM(o.total)) OVER () computed over the folded rows. Divide and round to one decimal: EU 43.3, APAC 33.3, US 20.9, LATAM 2.4 — and the proof is that the shares foot to 100.0 within rounding, because both levels read the same 103-row book. The failure mode is trying to get both levels from a single GROUP BY, which either errors or returns the per-group share of itself; the second failure is joining orders a second time to build the denominator, which fans rows out and quietly reweights every share.",
      tag: "aggregation",
    },
    {
      id: "delta-t22",
      q: "In SQLite you can write HAVING total_booked > 10000 on a SELECT alias. What is actually happening, and why should you still know the standard pipeline order?",
      a: "SQLite resolves SELECT aliases inside HAVING as an extension, so the alias works — but the logical pipeline it extends is fixed: FROM builds rows, WHERE filters them, GROUP BY folds, HAVING filters the folded groups, SELECT names the outputs, ORDER BY sorts. Knowing the order is what lets you reason about what exists at each stage: statuses exist at WHERE (a fate filter lives there), itinerary counts do not exist until GROUP BY (a 10-itinerary floor lives in HAVING), and window functions run after both, which is why a rank filter needs an outer query. The portability argument settles team debates: the alias-in-HAVING shortcut breaks the day the query moves to a stricter engine, so I write HAVING SUM(o.total) > 10000 — the fold spelled out — even where the alias would work. The habit that gets graded: place every filter by asking whether it is a fact about one itinerary or about a folded group, and let the clause follow the answer.",
      tag: "pipeline",
    },
    {
      id: "delta-t23",
      q: "Your fate census sums to 102, not 103. Walk the reconciliation drill.",
      a: "The identity comes first: flown-and-settled + airborne + awaiting + scrubbed must equal COUNT(*) on orders — 52 + 30 + 14 + 7 = 103 — so a 102 means one row fell outside the arm set. Drill one: SELECT status, COUNT(*) and read the raw fold — a status literal outside the four expected values (a 'voided', a 'refund_pending') or a NULL status drops out of every arm and out of nothing else. Drill two: check for double-counting — the census scan joined something (order_items) and the fan-out added a row somewhere, which the COUNT(*) vs COUNT(DISTINCT id) diagnostic exposes. Drill three: prove the fix is definitional, not cosmetic — the arm set is extended or the quarantine row is flagged, and the identity is re-asserted before anything downstream ships. The same discipline closes the money side: settlement coverage must read 21 exact / 1 partial / 6 never-collected over 28 statements, and the ledger trial balance must land 181,080 against 181,080 — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "delta-t24",
      q: "How do NULLs sort in ORDER BY, and where does that bite an airline board?",
      a: "SQLite sorts NULLs first ascending and last descending — they are smaller than everything. On this db the bite lands wherever shipped_at is NULL: the 14 awaiting-departure and 7 scrubbed itineraries jump the queue in any ASC-ordered departure list, so a 'next departures' board led by NULL stamps is really showing the never-departed, and the fix is an explicit flag — ORDER BY (shipped_at IS NULL), shipped_at — or the NULLS-style CASE key, stated in the report. Min/max ladders inherit the same hazard: MIN(shipped_at) ignores NULLs (fine), but ORDER BY shipped_at ASC LIMIT 1 hands the 'earliest departure' crown to a row that never departed. Dedup and comparisons are the third bite: NULL never equals NULL, so DISTINCT keeps 'duplicate' NULL rows and joins on a NULL key match nothing — which is a feature when the key is genuinely missing and a trap when it was coalesced upstream. The policy in one line: NULLs are 'not yet', they sort and aggregate as 'not yet', and every report that touches the stamp says so.",
      tag: "nulls",
    },
  ],

  mcqs: [
    {
      id: "delta-mcq-1",
      prompt: "An itinerary row's status reads 'shipped'. In this kit's Delta fate map, what happened?",
      choices: ["Flown-and-settled — the trip completed", "Airborne — wheels-off stamped, not yet settled", "Scrubbed — PNR cancelled", "Booked-awaiting-departure — no stamp yet"],
      answer: 1,
      why: "The fate map is fixed: shipped = airborne with shipped_at as the wheels-off stamp (30 of 103 itineraries, 29.1%). The trip has departed but has not settled to delivered.",
      notes: [
        { choice: 0, why: "Flown-and-settled is 'delivered' — 52 itineraries. Calling the 30 airborne rows 'flown' inflates the completion share before any trip settles." },
        { choice: 2, why: "Scrubbed is 'cancelled' — 7 PNRs that never get a wheels-off stamp at all. Different fate, different calendar." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-2",
      prompt: "Flown-and-settled share is delivered ÷ which population? The db holds 52 delivered, 30 airborne, 14 awaiting and 7 scrubbed of 103 booked.",
      choices: ["Delivered + airborne only (52/82 = 63.4%)", "All itineraries booked (52/103 = 50.5%)", "Airborne itineraries only (52/30)", "Distinct members (52/16)"],
      answer: 1,
      why: "The house definition: flown-and-settled ÷ ALL itineraries booked — awaiting-departure and scrubbed PNRs stay in the denominator because 'booked but not flown' is exactly what the metric measures. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting and 7 scrubbed inflates the rate to 63.4% by deleting the rows the fate census exists to watch." },
        { choice: 2, why: "52/30 mixes two funnel steps into one rate — delivered is completion, shipped is wheels-off. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-3",
      prompt: "EU carries 45 itineraries from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts itinerary rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 itineraries per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every itinerary has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is itineraries AND flyers." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to scrubbed itineraries only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the scrub share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the scrub map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-5",
      prompt: "Keep only members carrying at least 13 itineraries. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 13, before GROUP BY", "GROUP BY member HAVING COUNT(*) >= 13", "WHERE itineraries >= 13 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "An itinerary-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the heavy flyers — 24, 17, 14 and 13 itineraries — clear a 13-itinerary bar per member.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'itineraries' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-6",
      prompt: "The SkyMiles ladder runs 24, 17, 14, 13, 5 itineraries, then FOUR members tied at 4. Under RANK, what rank do the two 3-itinerary members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-itinerary members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The loyalty board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-window rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting itineraries double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 itineraries.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-8",
      prompt: "A staging-table scrub list uses member_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every itinerary carries a member id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-9",
      prompt: "A board stack puts airborne itineraries under scrubbed itineraries in one layout, built with UNION. A reviewer says one member's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same member, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same member, same counts, no market or branch label — collapse into one, and the board loses a member with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-10",
      prompt: "A dashboard walks booked fare value itinerary by itinerary: SUM(total) OVER (ORDER BY created_at). Two itineraries share a booking second, and the cumulative 'jumps two itineraries at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at itinerary grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-11",
      prompt: "The ops board wants flown-and-settled, airborne, awaiting and scrubbed counts in ONE scan over orders. Which SELECT does it in one pass?",
      choices: [
        "Four separate queries run back to back and pasted into one table",
        "One SELECT with COUNT(*) FILTER (WHERE status = 'delivered'), … FILTER (WHERE status = 'shipped'), … FILTER (WHERE status = 'pending'), … FILTER (WHERE status = 'cancelled')",
        "GROUP BY status with a LIMIT 4",
        "SUM(total) GROUP BY status",
      ],
      answer: 1,
      why: "FILTER (WHERE …) branches one aggregate per fate in a single scan — 52, 30, 14, 7 on this db, reconciling to 103 by construction. Four sequential queries are four chances to drift while the departure bank moves.",
      notes: [
        { choice: 2, why: "GROUP BY status works but returns rows the board must re-pivot in the chart layer — the column layout wants arms, not a second reshaping step that can reorder or drop a fate." },
        { choice: 3, why: "SUM(total) is a money fold, not a census — it answers 'what is booked per fate', which is a different slide than 'how many itineraries per fate'." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-12",
      prompt: "GROUP BY status over the orders table prints one row per fate. How many rows, and what must they sum to?",
      choices: ["3 rows — delivered, shipped, everything else", "4 rows — 52 + 30 + 14 + 7, reconciling to 103", "16 rows — one per SkyMiles member", "14 rows — one per booking month"],
      answer: 1,
      why: "The db carries exactly four fates: 52 flown-and-settled, 30 airborne, 14 awaiting departure, 7 scrubbed. The reconciliation identity — the rows must sum to 103 by construction — is the check that makes the census trustworthy before any rate is computed on top of it.",
      notes: [
        { choice: 0, why: "Collapsing pending into 'everything else' hides the 14 awaiting-departure itineraries — the population the arrival queue works — and the census stops reconciling to 103." },
        { choice: 2, why: "16 is the member count, a different grain entirely. GROUP BY status folds rows; GROUP BY customer_id would fold members." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-13",
      prompt: "The booking spine buckets orders with STRFTIME('%Y-%m', created_at). How many buckets does the 2024-01 → 2025-02 book produce, and what does '%m' alone cost you?",
      choices: [
        "14 buckets; '%m' merges January 2024 with January 2025 into 12 buckets of fiction",
        "12 buckets; '%Y-%m' adds 2 phantom months",
        "14 buckets; '%m' returns NULL for the 2025 rows",
        "103 buckets — one per itinerary",
      ],
      answer: 0,
      why: "Year plus zero-padded month gives the 14 distinct months on the book. '%m' alone strips the year, so two different Januaries fold into one bucket — the trend line flattens a year-on-year comparison into nonsense while looking perfectly formed.",
      notes: [
        { choice: 1, why: "No phantom months exist — the spine has exactly the months with bookings. The real trap is the merge, not an invention." },
        { choice: 3, why: "103 is the itinerary count — a different grain. The spine is a monthly fold over those 103 rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-14",
      prompt: "The never-flown read — members LEFT JOIN orders WHERE o.id IS NULL — returns ZERO rows. What is the honest write-up?",
      choices: [
        "The query is broken — every airline has dormant members",
        "A confident zero: all 16 SkyMiles members appear in the itinerary table, and proving that zero is part of the deliverable",
        "Zero rows means the join key is wrong",
        "Zero rows means NULLs were filtered out — add COALESCE and rerun",
      ],
      answer: 1,
      why: "On this db every member has transacted, so the anti-join legitimately empties. The analyst's job is to say WHY the zero is trustworthy — the join key is right, the population is all 16 members — not to shrug at an empty result or 'fix' it into rows.",
      notes: [
        { choice: 0, why: "Assuming the zero must be wrong is the failure mode in reverse. Zero is a finding when the population is provably complete." },
        { choice: 3, why: "COALESCE manufactures rows that do not exist. The whitespace question is answered by the data, not by a default value." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-15",
      prompt: "A merchandising screen filters fare products WHERE price > 200 to find the premium band and returns nothing. Diagnosis?",
      choices: [
        "The catalog is broken and needs a re-import",
        "An honest empty: fare products top out at the 199.99 flagship, so the 200-plus band is empty by construction — report the boundary, do not chase the zero",
        "price is TEXT and needs a CAST",
        "The filter needs LOWER() to match the category",
      ],
      answer: 1,
      why: "The catalog's ceiling is 199.99, so any premium-band filter above it comes back empty by construction. Proving the zero — max(price) = 199.99, filter placed correctly — is the deliverable; inventing rows or lowering the band silently would misstate the ladder.",
      notes: [
        { choice: 2, why: "Numeric comparisons on a REAL price column are type-safe here. Reaching for CAST before checking the data is troubleshooting theater." },
        { choice: 3, why: "LOWER() matters for TEXT matching, not a numeric threshold. The result is empty because no row qualifies, not because nothing matched." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-16",
      prompt: "orders JOIN order_items, then COUNT(*) prints 251. The itinerary census wants 103. What happened, and what is the fix?",
      choices: [
        "251 is correct — the network really booked 251 itineraries",
        "The join fanned out to component-line grain; fold to order grain (COUNT(DISTINCT o.id) or a pre-aggregated CTE) before counting itineraries",
        "Add DISTINCT to every column in the SELECT",
        "Filter WHERE quantity > 1 to remove the duplicates",
      ],
      answer: 1,
      why: "103 itineraries carry 251 fare/ancillary component lines, and COUNT(*) after the join counts lines, not itineraries. The fix is grain discipline: COUNT(DISTINCT o.id) diagnoses the fan-out, and folding line grain to order grain first keeps every downstream count honest.",
      notes: [
        { choice: 0, why: "251 is real — as a line count. Reporting it as itinerary count overstates the book 2.4× and every rate built on it inherits the error." },
        { choice: 3, why: "quantity > 1 is not a duplicate flag — it is a party-size/unit count filter that deletes legitimate single-unit lines. Grain is fixed by folding, not by filtering." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-17",
      prompt: "Cut the Q1-2024 booking window. Which predicate keeps the last night of March?",
      choices: [
        "BETWEEN '2024-01-01' AND '2024-03-31'",
        "created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "created_at <= '2024-03-31'",
        "STRFTIME('%m', created_at) <= '03'",
      ],
      answer: 1,
      why: "created_at is a TEXT timestamp with a time component, so BETWEEN '…03-31' silently drops everything after midnight on the 31st — and quarter-end is exactly when advance-purchase bookings land. The half-open interval [Jan 1, Apr 1) keeps the whole last night and composes cleanly.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends but '2024-03-31' < '2024-03-31T14:22:00' as strings — the day's bookings after midnight vanish without an error." },
        { choice: 3, why: "Month-only matching merges January 2024 with January 2025. The quarter is a year-scoped window, not a month filter." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-18",
      prompt: "The month walk adds LAG(booked) OVER (ORDER BY month). The 2024-01 row's delta prints NULL. What is the policy?",
      choices: [
        "COALESCE it to 0 so the chart has no holes",
        "Report NULL as baseline — the first month has no prior month, and a zero would read as a flat month",
        "Drop the first row from the report",
        "Substitute the 14-month average",
      ],
      answer: 1,
      why: "LAG on the first row of an ordered spine is NULL by definition — there is no prior month. The NULL IS the baseline; coalescing it to zero invents a flat month and any chart that 'fills' it is drawing a number that was never measured.",
      notes: [
        { choice: 0, why: "Zero means 'no change', which is a claim about February the data does not make. Baseline NULL and fabricated zero tell different stories." },
        { choice: 2, why: "Dropping the row hides the opening book — 3,731.97 in January 2024 — which anchors the whole trend narrative." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-19",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders) with the system mean at 338.19. Which markets' averages clear it?",
      choices: [
        "EU (335.32) and APAC (313.66)",
        "US (383.48) and LATAM (426.22)",
        "All four — every market is above its own mean",
        "None — the mean is always the max",
      ],
      answer: 1,
      why: "The scalar subquery computes the network mean 338.19; only US 383.48 and LATAM 426.22 clear it — and LATAM's premium read rides a 2-itinerary base, which the analyst says out loud. EU and APAC sit below the mean despite carrying 82 of the 103 itineraries.",
      notes: [
        { choice: 0, why: "EU and APAC are the volume engines but the value laggards on this read — volume and yield are different stories, which is precisely why the filter exists." },
        { choice: 2, why: "That confuses the per-market mean with each market compared to itself. The subquery is the NETWORK mean — one number every row is measured against." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-20",
      prompt: "A fare-band CASE arms the Delta One test (total >= 1000) but a junior reorders arms so the broad Main Cabin arm (total >= 100) fires first. What breaks?",
      choices: [
        "Nothing — CASE arms are order-independent",
        "Broad-arm-first swallows the specific arms: every itinerary re-bands into the broadest matching arm and the premium ladder collapses",
        "SQLite rejects unordered CASE arms",
        "Only NULL totals mis-band",
      ],
      answer: 1,
      why: "CASE arms fire top-down and stop at the first match, so arm order is semantics, not style. With the broad arm first, the 1,088.44 Delta One itinerary bands as Main Cabin and every premium rung vanishes — a legal query producing a wrong ladder with no error anywhere.",
      notes: [
        { choice: 0, why: "Order-independence is exactly the misconception. The arms are an ordered decision tree; reordering re-bands the base." },
        { choice: 3, why: "NULLs are a separate hazard (NULL >= anything is UNKNOWN, so they fall through to ELSE). Here the damage is to non-NULL premium rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-21",
      prompt: "The SkyMiles pod asks: how many MEMBERS flew itineraries in EU, where the census shows 45 itineraries? Which expression answers the member question?",
      choices: ["COUNT(*)", "COUNT(DISTINCT o.customer_id)", "SUM(total)", "COUNT(c.region)"],
      answer: 1,
      why: "EU's 45 itineraries fold to 8 distinct members — COUNT(DISTINCT customer_id) is the coverage grain. COUNT(*) repeats the load number; the intensity ratio between the two (5.6 itineraries per member) is the read the pod actually wants.",
      notes: [
        { choice: 0, why: "COUNT(*) answers 'how many itineraries', which the pod already has. Same rows, different grain, wrong answer." },
        { choice: 2, why: "SUM(total) is booked fare value — the third grain on the same join. Money is not people." },
      ],
      difficulty: "easy",
    },
    {
      id: "delta-mcq-22",
      prompt: "COUNT(shipped_at) reads 82 while COUNT(*) reads 103. What is the 21-row gap?",
      choices: [
        "Data loss — 21 rows were deleted upstream",
        "The 14 awaiting-departure plus 7 scrubbed itineraries carry no wheels-off stamp — the gap is the census working",
        "Duplicate rows inflating COUNT(*)",
        "Timezone drift between the two counts",
      ],
      answer: 1,
      why: "COUNT(column) skips NULLs and COUNT(*) does not, so the difference is exactly the itineraries with no stamp: 14 pending plus 7 scrubbed. The gap is not corruption — it is the awaiting-and-scrubbed population the fate census tracks, arriving as arithmetic.",
      notes: [
        { choice: 0, why: "Assuming deletion first is how ops floors manufacture incidents. The NULL semantics explain the gap exactly: 14 + 7 = 21." },
        { choice: 2, why: "Duplicates would inflate both counts equally. The split between COUNT(*) and COUNT(column) is about NULLs, not duplicates." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-23",
      prompt: "A booked-value walk must restart at each market: SUM(total) OVER (PARTITION BY region ORDER BY created_at) versus dropping the PARTITION. What changes?",
      choices: [
        "Nothing — ORDER BY implies PARTITION",
        "The partition resets the running sum at each market boundary; without it, every market's row carries the network-wide cumulative",
        "PARTITION BY sorts the output rows",
        "PARTITION BY dedups the rows inside each market",
      ],
      answer: 1,
      why: "PARTITION BY splits the window: each market's walk starts fresh at its first itinerary, and the last row of each partition is that market's book. Without the partition the running sum runs across the whole ordered table — a network cumulative wearing per-market labels.",
      notes: [
        { choice: 0, why: "ORDER BY only sequences the window; PARTITION BY is what fences it. The two are independent knobs." },
        { choice: 2, why: "Sorting is ORDER BY's job in the outer query. PARTITION affects computation groups, not presentation order." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-24",
      prompt: "Family-coverage screen: members who flew an Audio fare line AND a Wearables line. Why is EXISTS the right shape rather than customer_id IN (…) twice?",
      choices: [
        "EXISTS is always faster than IN",
        "The membership test runs against a three-table join per member, and a NULL anywhere in the tested column set silently breaks NOT IN — EXISTS is the NULL-safe semi-join that also reads as the business rule",
        "IN cannot reference the products table",
        "EXISTS returns the matching fare lines",
      ],
      answer: 1,
      why: "Each EXISTS is a per-member reachability probe through orders → order_items → products, and the positive arms AND together cleanly. The negative arm (never Video) is where IN falls apart: NOT IN over a column that can carry NULLs empties the whole report on three-valued logic, while NOT EXISTS just asks the question.",
      notes: [
        { choice: 0, why: "Performance is planner-dependent and beside the point — the argument is correctness under NULLs and readability of the coverage rule." },
        { choice: 3, why: "EXISTS is a boolean test, not a row source. It answers 'did this member reach the family', which is exactly the coverage question." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-25",
      prompt: "Ancillary bundles folded per departure date with GROUP_CONCAT(product_name). What does GROUP_CONCAT NOT guarantee?",
      choices: [
        "It returns NULL when the group has no rows",
        "Element order and total length are not guaranteed — the separator argument and an ORDER BY in a staging subquery are the controllable parts",
        "It deduplicates automatically",
        "It caps output at 10 items",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds a group into one string but the order of elements follows the rows the planner happens to visit — unless you stage the fold over an ordered subquery and pass an explicit separator. For a load-planning bundle list, an unordered string is a different manifest on every run.",
      notes: [
        { choice: 0, why: "That part it does guarantee — no input rows, NULL output, which is why the fold needs an COALESCE only if the slide demands a visible empty." },
        { choice: 2, why: "Dedup needs DISTINCT inside the call — GROUP_CONCAT(DISTINCT name). Without it, repeated lines repeat in the manifest." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-26",
      prompt: "Market share of the booked book: each market's SUM(total) over the 34,833.28 grand total. What are the two honest builds?",
      choices: [
        "One GROUP BY with a self-JOIN back to orders",
        "A scalar-subquery denominator or a window SUM(total) OVER () — two aggregation levels that must never be folded into one GROUP BY",
        "AVG of the per-market sums",
        "MAX(total) per market divided by COUNT(*)",
      ],
      answer: 1,
      why: "The numerator folds per market; the denominator folds the whole table — two different aggregation levels. Either stage the market fold and divide by the scalar grand total, or carry the grand total as a window SUM OVER () beside the market sum. What breaks is trying to get both from a single GROUP BY.",
      notes: [
        { choice: 0, why: "A self-join multiplies rows before the fold — the fan-out returns and every share drifts. The levels are stacked, not joined." },
        { choice: 2, why: "AVG of market sums weights every market equally regardless of size — LATAM's 2 itineraries would count as much as EU's 45." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-27",
      prompt: "The published frequency ladder must survive an audit rerun with two members tied at 4 itineraries. How do you write the window's ORDER BY?",
      choices: [
        "OVER (ORDER BY itineraries) — ties resolve themselves",
        "OVER (ORDER BY itineraries DESC, lifetime_value DESC, id) — a named, reproducible tie-break, written into the query comment",
        "Any order is fine — ROW_NUMBER is deterministic",
        "ORDER BY cannot live inside OVER",
      ],
      answer: 1,
      why: "A ladder whose rungs depend on the engine's visit order is not reproducible: rerun it and the tie splits differently. The fix is a named, deterministic tie-break — a business key, then id as the final anchor — and publishing it in the comment, because SkyMiles tiering is a benefits contract.",
      notes: [
        { choice: 0, why: "Ties do not 'resolve themselves' — they resolve arbitrarily, which is worse. The four-way tie at 4 itineraries on this db is the standing example." },
        { choice: 2, why: "ROW_NUMBER is deterministic only given a total order. Without a tie-break it is deterministic the way a coin flip repeated identically is." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-28",
      prompt: "Re-accommodation screen: pairs of one member's itineraries booked within 2 days of each other. What is the shape?",
      choices: [
        "GROUP BY customer_id with a HAVING on the count",
        "Self-join orders o1 × o2 ON o1.customer_id = o2.customer_id with julianday(o2.created_at) - julianday(o1.created_at) BETWEEN 0 AND 2 and o1.id < o2.id to kill mirror pairs",
        "LAG over the member column only",
        "UNION of each member's rows with themselves",
      ],
      answer: 1,
      why: "Pair-in-population is a self-join: match each itinerary to its member-mates, bound the gap with julianday arithmetic, and the o1.id < o2.id predicate keeps each pair once instead of twice. COUNT without that guard reports every pair mirrored — and the re-accommodation list double-counts.",
      notes: [
        { choice: 0, why: "A HAVING count finds members with multiple bookings, not the PAIRS — the ops floor needs the two itinerary ids to work the list." },
        { choice: 2, why: "LAG needs a deterministic per-member ordering and answers 'previous row', which misses pairs that are not adjacent after any single sort." },
      ],
      difficulty: "hard",
    },
    {
      id: "delta-mcq-29",
      prompt: "Settlement math: SUM(amount_cents) / 100 versus SUM(amount_cents) / 100.0 on the invoices table. What is the difference?",
      choices: [
        "None — SQLite auto-promotes both to real division",
        "INTEGER division truncates: /100 eats every odd-cent remainder, while /100.0 forces real division — the cents never survive the first form",
        "/100 rounds half up, /100.0 rounds half down",
        "/100.0 is only for display",
      ],
      answer: 1,
      why: "amount_cents is INTEGER, so /100 is integer division — 175600 / 100 is fine but any odd-cent sum silently loses its remainder. The /100.0 (or an explicit CAST) promotes to real arithmetic before the division, which is why every dollar read in the settlement book is amount_cents / 100.0.",
      notes: [
        { choice: 0, why: "Auto-promotion is exactly what does NOT happen for INTEGER / INTEGER. The bug ships silently because whole-dollar totals look right either way." },
        { choice: 2, why: "Integer division does not round at all — it truncates toward zero. Rounding semantics only enter once the arithmetic is real." },
      ],
      difficulty: "medium",
    },
    {
      id: "delta-mcq-30",
      prompt: "Paging the ladder with LIMIT 5 OFFSET 5 to show 'ranks 6 through 10'. What is the trap on a tied ladder?",
      choices: [
        "OFFSET is 1-based and off by one",
        "A tie block straddling the page boundary splits peers across pages — the honest pager gates on the rank window computed by a named tie-break, not on raw row offsets",
        "OFFSET requires ORDER BY id",
        "LIMIT drops NULL rows first",
      ],
      answer: 1,
      why: "Row-offset paging knows nothing about ties: the four-way tie at 4 itineraries can split two peers onto each page, and both pages claim 'ranks 6–10'. The defensible build computes RANK first and filters WHERE value_rank BETWEEN 6 AND 10, so a shared rung never tears.",
      notes: [
        { choice: 0, why: "OFFSET is 0-based in SQL. But even with the arithmetic right, offsets paginate ROWS, and ranks are a property of TIES — different currencies." },
        { choice: 2, why: "Forcing ORDER BY id makes paging deterministic but still splits the tie block — determinism is not the same as honoring the shared rung." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-delta-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The market fate census",
      brief:
        "Delta-flavored brief on the storefront db: Monday's hub performance review opens with the market fate census — itineraries booked, flown-and-settled, airborne with wheels-off stamped, and scrubbed PNRs — plus average booked fare per market, and network ops is explicit that the fare average is computed over ALL fates (booked value, not flown value), with the population stated on the slide. Probed facts: 103 itineraries worth 34,833.28; the fate grid reads EU 24 flown / 12 airborne / 3 scrubbed of 45 booked, APAC 21 / 8 / 3 of 37, US 5 / 10 / 1 of 19, LATAM 2 / 0 / 0 of 2; market fare yield reads EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The review reads biggest book first.",
      ask: "Return each market with booked, flown-and-settled, airborne and scrubbed itinerary counts plus average booked fare to 2 decimals, biggest book first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS flown_settled,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS airborne,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS scrubbed,\n       ROUND(AVG(o.total), {4}) AS avg_fare\nFROM orders o\nJOIN customers c ON c.id = {5}\nGROUP BY c.region\nORDER BY booked DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the flown-and-settled literal",
          why: "Flown-and-settled itineraries are status 'delivered' — EU 24, APAC 21, US 5, LATAM 2. 'pending' would count the booked-awaiting-departure rows (6/5/3/0) into the flown column and the review reads a network that finished trips it never boarded.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the airborne literal",
          why: "Airborne itineraries are status 'shipped' — wheels-off stamped, 12 in EU and 10 in the US. 'pending' here reads the 14 never-departed rows as airborne, which is precisely the confusion the fate census exists to kill.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the scrubbed literal",
          why: "Scrubbed PNRs are status 'cancelled' — 3, 3, 1, 0 across the markets, the denominator of every honest scrub-rate. 'pending' empties the scrub column to zero everywhere and LATAM's clean sheet stops being an honest zero.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the fare precision",
          why: "Fare yield reports to 2 decimals — EU 335.32, APAC 313.66. ROUND(…, 1) prints 335.3 and the market map stops reconciling with the 338.19 system average the yield review quotes on the same slide.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the member join key",
          why: "c.id = o.customer_id attaches each itinerary to its member's market. c.id = c.id matches every itinerary to all 16 members — a 103 × 16 fanout that multiplies every market's count by its member count and invents census rows from nothing.",
        },
      ],
      distractors: ["'pending'", "ASC", "1", "MAX", "c.id"],
      walkthrough:
        "One scan, four FILTER arms, one fold. The join attaches every itinerary to its member's market and GROUP BY market folds 103 rows into four census rows: booked 45/37/19/2, flown-and-settled 24/21/5/2, airborne 12/8/10/0, scrubbed 3/3/1/0, and ROUND(AVG(o.total), 2) reads yield 335.32/313.66/383.48/426.22 — all straight from the probed grid, and the fate arms reconcile upward: 52 + 30 + 14 + 7 = 103 by construction. The yield story is the mix story: US 383.48 and LATAM 426.22 sit above the 338.19 system mean while APAC's 313.66 drags — and LATAM's premium-looking fare rides a 2-itinerary base, which the analyst says out loud. The distractors fail honestly: 'pending' in any fate arm counts the 14 never-departed rows as flown, airborne or scrubbed; 1 in the precision slot truncates the yield map to one decimal so it drifts off the 2.98-day and 338.19 anchors on the same slide; ASC is a keyword where a status literal belongs and errors, MAX is an aggregate misuse, and c.id in the join key fans out 103 × 16 so every market's census inflates by its member count. One pass, one denominator, four fates that must sum to the book.",
    },
    {
      id: "cs-delta-2",
      tier: "medium",
      topic: "s7",
      universe: "pricing",
      title: "The fare-family mix board",
      brief:
        "Delta-flavored brief on the storefront db: revenue management's yield review opens with the fare-family mix board — booked fare value per market split across the three biggest fare-product families on the book (the db's fare-family codes: Audio, Wearables, Video), beside each market's total booked fare. The definition is stated on the slide: booked value across ALL fates — scrubbed PNRs stay in, this is the 34,833.28 booked book, not flown value. Probed facts: the mix concentrates — APAC-Audio 5,162.40 is the single biggest market-family cell, EU-Audio 5,102.40 and EU-Wearables 3,886.30 follow; the Audio family carries 11,744.01 of the book, and market books read EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. The board reads biggest market book first.",
      ask: "Return each market with booked fare for the Audio, Wearables and Video fare families plus its total booked fare, to 2 decimals, biggest book first.",
      template:
        "WITH lines AS (\n  SELECT o.customer_id AS member_id,\n         p.category AS fare_family,\n         {1} AS line_value\n  FROM order_items oi\n  JOIN products p ON p.id = {2}\n  JOIN orders o ON o.id = oi.order_id\n)\nSELECT c.region AS market,\n       ROUND(SUM(CASE WHEN fare_family = {3} THEN line_value ELSE 0 END), 2) AS audio_rev,\n       ROUND(SUM(CASE WHEN fare_family = {4} THEN line_value ELSE 0 END), 2) AS wearables_rev,\n       ROUND(SUM(CASE WHEN fare_family = {5} THEN line_value ELSE 0 END), 2) AS video_rev,\n       ROUND(SUM(line_value), 2) AS total_rev\nFROM lines l\nJOIN customers c ON c.id = l.member_id\nGROUP BY c.region\nORDER BY total_rev DESC;",
      slots: [
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the line-value fold",
          why: "Booked fare value = units × unit fare per component line. oi.unit_price alone sums fares without their units, oi.quantity alone sums seats, and COUNT(oi.quantity) is an aggregate inside a fold — misuse. The mix board is a money board, and this expression is the money.",
        },
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the catalog join key",
          why: "p.id = oi.product_id attaches each component line to its fare product's family. p.id = p.id matches every line to all 16 fare products — a 251 × 16 fanout where every line lands in every family arm and the mix columns read multiplied fiction.",
        },
        {
          answer: "'Audio'",
          kind: "keyword",
          label: "the biggest family literal",
          why: "Audio is the largest fare family on the book — 11,744.01 overall, with APAC 5,162.40 and EU 5,102.40 as its biggest cells. 'Electronics' swaps in a smaller family (APAC 1,410.04) and the board's headline column quietly becomes a niche read.",
        },
        {
          answer: "'Wearables'",
          kind: "keyword",
          label: "the premium family literal",
          why: "Wearables is the premium-heavy family — EU 3,886.30, US 1,767.54, APAC 1,275.28 — riding the catalog's 199.99 flagship fare product. 'Fitness' swaps in a one-listing family and the premium column the yield review watches collapses.",
        },
        {
          answer: "'Video'",
          kind: "keyword",
          label: "the US-leading family literal",
          why: "Video is the US market's biggest family at 1,885.98 — the column that shows the US book is mix-led, not volume-led. 'Electronics' would put EU's 1,855.02 in that cell and the market story reads backwards.",
        },
      ],
      distractors: ["'Electronics'", "'Fitness'", "oi.unit_price", "oi.quantity", "p.id", "COUNT(oi.quantity)"],
      walkthrough:
        "Two stages: stage the component lines once, then pivot once. The CTE folds 251 fare-component lines into member, fare-family and line value (quantity × unit fare) — the catalog join key decides which family each line belongs to — and the outer SELECT pivots with one CASE arm per family plus a total column. The board reads: EU 5,102.40 Audio / 3,886.30 Wearables / 2,260.79 Video of a 15,089.23 book; APAC 5,162.40 / 1,275.28 / 1,051.64 of 11,605.45 — APAC-Audio is the biggest single cell on the board; US 1,121.70 / 1,767.54 / 1,885.98 of 7,286.16 — the US is the one market led by Video and Wearables, not Audio; LATAM 357.51 / 0 / 0 of 852.44. Every market's three arms plus the unshown families foot to its probed book, and the Audio column sums to the 11,744.01 family crown. The distractors each break differently: 'Electronics' or 'Fitness' in a family literal swaps a niche family into a headline column; oi.unit_price drops the units so every column reads fare list prices instead of booked value; oi.quantity flips the board to seat counts; p.id in the catalog join fans 251 lines out across all 16 products so every arm multiplies; COUNT(oi.quantity) nests an aggregate inside the fold and errors. One definition holds the slide together: booked value, all fates, cents-safe to two decimals.",
    },
    {
      id: "cs-delta-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The SkyMiles value ladder",
      brief:
        "Delta-flavored brief on the storefront db: the SkyMiles pod boards the value ladder quarterly — each member folded to itinerary count and booked fare value, ranked by booked value, top five published. The policy is stated on the slide: RANK semantics with a named tie-break (booked value DESC, then member id), and the ladder is folded from ALL fates — scrubbed PNRs stay in the member's book, this is the 34,833.28 booked book. Probed facts: Alice Chen (EU) leads at 24 itineraries worth 7,262.35, Emma Wilson (US) follows at 17 for 6,640.56, then Grace Kim (APAC) 14 / 4,574.23, Maya Patel (APAC) 13 / 3,644.56 and Chloe Dubois (EU) 5 / 2,667.93 closing the published five. The pod reads biggest book first.",
      ask: "Return the top five members by booked fare value with market, itinerary count, booked value to 2 decimals and their value rank, biggest book first.",
      template:
        "WITH per_member AS (\n  SELECT customer_id,\n         COUNT(*) AS itineraries,\n         ROUND(SUM(total), {1}) AS booked\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name AS member,\n       c.region AS market,\n       pm.itineraries,\n       pm.booked,\n       RANK() OVER (ORDER BY pm.booked {2}) AS value_rank\nFROM per_member pm\nJOIN customers c ON c.id = pm.customer_id\nORDER BY value_rank\nLIMIT {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Booked value reports to 2 decimals — 7,262.35 and 6,640.56, matching the fare book's cents precision. ROUND to 1 prints 7,262.4 and the ladder stops reconciling with the 34,833.28 book the pod foots on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-book-first direction",
          why: "The pod reads the ladder top-down: Alice Chen's 7,262.35 on the first rung. ASC would publish the bottom of the ladder — the 444.80 single-itinerary members — as the headline and the premium-engagement calendar is built on the wrong five names.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the published depth",
          why: "The ladder publishes five rungs — rank cells 1 through 5, closing at Chloe Dubois's 2,667.93. LIMIT 3 cuts Maya Patel and Chloe Dubois off a board whose policy says five; LIMIT 10 leaks the 1,686.17 tail the pod works through a different channel.",
        },
      ],
      distractors: ["ASC", "1", "SUM(total)", "WHERE"],
      walkthrough:
        "Fold to member grain first, rank second, cut third. The per_member CTE folds 103 itineraries to 16 members — COUNT(*) for itinerary count, ROUND(SUM(total), 2) for booked value, all fates in — and the window lays rungs over the fold: RANK() OVER (ORDER BY booked DESC) prints 1 Alice Chen 7,262.35, 2 Emma Wilson 6,640.56, 3 Grace Kim 4,574.23, 4 Maya Patel 3,644.56, 5 Chloe Dubois 2,667.93, and LIMIT 5 publishes exactly the five the pod boards. The read under the numbers: the top two rungs alone carry 13,902.91 — 39.9% of the book from two members, the concentration story at grain level, and the itinerary counts (24, 17, 14, 13, 5) reconcile to the frequency ladder the ops floor already publishes. The distractors fail honestly: ASC flips the ladder onto its tail; 1 in the precision slot rounds every rung to a dollar and the fold drifts off the cents-precise book; SUM(total) in the precision slot nests an aggregate misuse that errors, and in the direction slot is a syntax break; WHERE in a value slot breaks the query outright. Fold, rank, name the policy, publish five — that is the whole ladder.",
    },
    {
      id: "cs-delta-4",
      tier: "medium",
      topic: "q6",
      universe: "month-close",
      title: "The settlement coverage split",
      brief:
        "Delta-flavored brief on the storefront db: month-close opens with the settlement coverage split — every fare statement classified against its payment legs as exact, partial, or never-collected, with the per-group average statement size beside the counts. Payment legs are the ledger of record; a statement's status label is a claim. Probed facts: 28 statements fold to 21 exact-covered (65,612 billed against 65,612 settled), 6 never-collected worth 15,217 with no legs at all, and 1 partial — statement #25, 4,000 of 6,148 settled, still open. Averages per group read 3,124.38 exact, 2,536.17 never-collected, 6,148.00 partial. The close reads biggest group first.",
      ask: "Return each coverage class with its statement count and average billed amount to 2 decimals, biggest group first.",
      template:
        "WITH leg_sums AS (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         SUM(p.amount_cents) AS settled_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = {1}\n  GROUP BY i.id\n)\nSELECT CASE WHEN settled_cents IS NULL THEN {2}\n            WHEN settled_cents >= billed_cents THEN {3}\n            ELSE {4} END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(AVG(billed_cents) / 100.0, {5}) AS avg_billed\nFROM leg_sums\nGROUP BY coverage\nORDER BY statements DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "Legs attach to their statement through p.invoice_id = i.id. i.customer_id matches legs to whichever statement shares a customer — a fan-out that misfiles legs across statements and the 21/6/1 coverage split stops being a reconciliation.",
        },
        {
          answer: "'never_collected'",
          kind: "keyword",
          label: "the no-legs label",
          why: "A LEFT JOIN leaves settled_cents NULL for the 6 statements with zero legs — 15,217 never collected. The 'exact' label here would file unpaid statements as fully settled and the dunning list — the close's only collection lever — ships empty.",
        },
        {
          answer: "'exact'",
          kind: "keyword",
          label: "the fully-settled label",
          why: "settled >= billed is the exact arm — 21 statements whose legs foot to their bill. 'partial' here demotes every clean statement and the 65,612 exact reconciliation reads as an all-open book.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the still-open label",
          why: "The ELSE arm catches the one statement whose legs pay less than billed — #25 at 4,000 of 6,148. 'never_collected' in this slot misfiles a genuinely settled-against statement as having no legs, and the partial that finance is working disappears from every list.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the dollar precision",
          why: "Statement averages report to 2 decimals — 3,124.38 and 2,536.17 — because the cents-divide (amount_cents / 100.0) preserves them. ROUND to 1 prints 3,124.4 and the average drifts off the cents-precise statement book.",
        },
      ],
      distractors: ["'paid'", "i.customer_id", "1", "COUNT(*)"],
      walkthrough:
        "Stage the fold, then classify, then size the groups. The leg_sums CTE folds payment legs per statement — LEFT JOIN so the no-leg statements survive with NULL settled_cents — and the outer SELECT lays the three arms: NULL is never_collected, settled >= billed is exact, the remainder is partial. The split reads exactly as probed: exact 21 statements averaging 3,124.38 billed, never_collected 6 averaging 2,536.17 (the 15,217 dunning list), partial 1 at 6,148.00 — statement #25, the close's one open item. The averages carry the money rule: billed_cents is INTEGER, so the divide is /100.0 and the ROUND lands at 2 — the cents-safe read. The distractors fail honestly: 'paid' in a label slot renames a class the close's consumers already subscribe to, and in the join key it matches no legs, collapsing all 28 statements into one never_collected row; i.customer_id misfiles legs across same-customer statements and the split fiction; 1 truncates every average to a dollar; COUNT(*) in a label slot returns numbers where names belong or errors outright. One fold, three arms, legs as the ledger of record — the split the close opens with.",
    },
    {
      id: "cs-delta-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The booking-spine walk",
      brief:
        "Delta-flavored brief on the storefront db: the yield review's trend page walks the 14-month booking spine — booked fare value per month bucket, the prior month beside it, and the movement between them. Bucketing is STRFTIME('%Y-%m', created_at) so January 2024 never merges with January 2025. Probed facts: the book opens at 3,731.97 (2024-01) and troughs at 1,193.86 in July 2024, a −853.57 slide into the hole; August answers +1,158.21 to 2,352.07 — the sharpest recovery on the spine; the sharpest drop is −1,326.87 into November (2,975.67 to 1,648.80); the window closes at 2,390.53 in 2025-02. The walk is folded from ALL fates — this is the booked book, not flown value. The review reads the spine in calendar order.",
      ask: "Return each month with booked value to 2 decimals, the prior month's value, and the month-over-month delta to 2 decimals, in calendar order.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME({1}, created_at) AS month,\n         ROUND(SUM(total), {2}) AS booked\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       booked,\n       LAG(booked) OVER (ORDER BY month) AS prior_month,\n       ROUND(booked - LAG(booked) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month\nLIMIT {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the year-month bucket",
          why: "Year plus zero-padded month builds the 14-bucket spine from 2024-01 to 2025-02. '%m' alone strips the year and folds the two Januaries into one bucket — the walk's baseline and its year-on-year comparison collapse into fiction with no error raised.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the booked-value precision",
          why: "Booked value reports to 2 decimals — the 3,731.97 open and the 1,193.86 trough are cents-precise folds of the fare book. ROUND to 1 prints 3,732.0 and the spine stops reconciling with the 34,833.28 book the review foots.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the full-spine depth",
          why: "The trend page walks the WHOLE spine — all 14 buckets from the 3,731.97 open to the 2,390.53 close. LIMIT 7 would half the walk and hide the July trough or the November drop depending on which half survived — a trend told from an arbitrary slice.",
        },
      ],
      distractors: ["'%m'", "'%Y-%M'", "1", "0"],
      walkthrough:
        "Bucket once, walk once. The monthly CTE folds 103 itineraries into 14 month buckets at booked-value grain — STRFTIME('%Y-%m') so the year rides inside the key — and the outer SELECT walks the spine: LAG(booked) lays the prior month beside each row and the delta is computed inside the same window, so the walk and its movements cannot disagree. The narrative the review reads: open 3,731.97, February −122.33, the slow spring drift, July's 1,193.86 trough after a −853.57 slide, the +1,158.21 August recovery to 2,352.07, September holding the rebuild at 3,116.04, the −1,326.87 November drop — the sharpest move on the spine — and the close at 2,390.53 in 2025-02. The first row's prior and delta are NULL by definition — baseline, never zero. The distractors fail honestly: '%Y-%M' formats minutes instead of months and every bucket collapses; '%m' merges the two Januaries and the spine shrinks to 12 buckets; 1 in a precision slot flattens the fold to one decimal (and breaks the bucket slot outright); 0 in the depth slot truncates the walk to nothing and in the precision slot rounds every bucket to a whole dollar. Fourteen buckets, one window, NULL baseline — the walk the yield review opens with.",
    },
    {
      id: "cs-delta-6",
      tier: "hard",
      topic: "q3",
      universe: "catalog",
      title: "The cabin-coverage screen",
      brief:
        "Delta-flavored brief on the storefront db: the SkyMiles engagement pod screens cabin coverage — members who have flown the Audio fare family AND the Wearables family but never the Video family, folded per market. The three probes run through orders → order_items → products per member; a member counts for a market only where the market fold lives, and the screen is NULL-safe by construction (EXISTS, not NOT IN). Probed facts: exactly 3 members clear the screen — 2 in EU and 1 in APAC; US and LATAM return a confident zero because every US and LATAM member who touched Audio and Wearables has also flown Video (or never touched the pair at all). The pod reads biggest coverage first.",
      ask: "Return each market with the count of members who flew Audio and Wearables but never Video, biggest coverage first.",
      template:
        "SELECT c.region AS market,\n       COUNT(DISTINCT c.id) AS members\nFROM customers c\nWHERE EXISTS (\n        SELECT 1 FROM orders o\n        JOIN order_items oi ON oi.order_id = o.id\n        JOIN products p ON p.id = oi.product_id\n        WHERE o.customer_id = c.id AND p.category = {1})\n  AND EXISTS (\n        SELECT 1 FROM orders o\n        JOIN order_items oi ON oi.order_id = o.id\n        JOIN products p ON p.id = oi.product_id\n        WHERE o.customer_id = c.id AND p.category = {2})\n  AND NOT EXISTS (\n        SELECT 1 FROM orders o\n        JOIN order_items oi ON oi.order_id = o.id\n        JOIN products p ON p.id = oi.product_id\n        WHERE o.customer_id = c.id AND p.category = {3})\nGROUP BY c.region\nORDER BY members {4};",
      slots: [
        {
          answer: "'Audio'",
          kind: "keyword",
          label: "the first-family literal",
          why: "Audio is the book's biggest family (11,744.01) and the screen's first positive probe. 'Electronics' swaps in a 4,818.61 family and the membership set changes under the analyst — different members clear the screen and the upsell shortlist is built for nobody.",
        },
        {
          answer: "'Wearables'",
          kind: "keyword",
          label: "the second-family literal",
          why: "Wearables is the premium-heavy second probe — the 199.99 flagship family. 'Fitness' is the one-listing family (863.91 of book) and the AND of the two probes shrinks to members nobody on the pod is targeting.",
        },
        {
          answer: "'Video'",
          kind: "keyword",
          label: "the exclusion literal",
          why: "NOT EXISTS Video is the negative arm — the family the member has NOT flown, which is what makes them an upsell target. Flipping the probe to a positive or swapping the literal changes who the 'never' catches: Video-excluded is 3 members; Electronics-excluded is a different shortlist entirely.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-coverage-first direction",
          why: "The pod works the shortlist biggest-first: EU's 2 members over APAC's 1. ASC opens the meeting on the single APAC member — a correct query aimed at the wrong end of the list.",
        },
      ],
      distractors: ["'Electronics'", "'Fitness'", "IN", "ASC"],
      walkthrough:
        "Three probes per member, folded per market. Each EXISTS is a per-member reachability test through the fare-line chain, ANDed positive-positive, then the NOT EXISTS negative arm — the NULL-safe shape, because a NOT IN over the category column would empty the whole report the moment one NULL lands. The screen answers exactly as probed: EU 2 members, APAC 1, US and LATAM absent — a confident zero, since their Audio-and-Wearables flyers have all already flown Video. The fold is COUNT(DISTINCT c.id) so a member with ten Audio lines still counts once, and GROUP BY region keeps the market grain the pod works from. The distractors fail honestly: 'Electronics' or 'Fitness' in any probe slot swaps a niche family into the coverage rule and the shortlist changes silently; IN in the direction slot is a syntax break; ASC reorders the two rows and the pod works the smallest market first. Three probes, one negative arm, DISTINCT at member grain — the coverage screen the engagement pod re-runs every campaign.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Itineraries that depart within the promised window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the same shape as Delta's departure-window read." },
    { slug: "product-sales-analysis-ii", why: "Fare-component revenue per itinerary — folding ancillary and fare lines into booked value is the exact mix math the yield review runs every week." },
    { slug: "sales-analysis-i", why: "Each member's single biggest itinerary: argmax-per-flyer reads surface the premium bookings that anchor the 63.5% concentration story." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Members who flew two fare families but never the third — conditional aggregation across families is how cabin-mix coverage and upsell gaps are actually mapped." },
    { slug: "confirmation-rate", why: "SkyMiles profile hygiene: the share of members whose contact record confirms — a NULL-safe rate over a joined table, the loyalty pod's weekly completeness read." },
    { slug: "second-highest-salary", why: "Second-priciest fare product per family — and the LIMIT-1-OFFSET-1 habit breaks exactly where fare products tie, which is why Delta drills rank windows instead." },
    { slug: "classes-more-than-5-students", why: "Fare families carrying 5+ listings in the catalog — a HAVING-gate census that mirrors how merchandising prunes thin ancillary families." },
    { slug: "game-play-analysis-iv", why: "Members whose FIRST itinerary after enrollment came back — first-flight-after-join is the SkyMiles activation metric, and it is a subquery-plus-join shape." },
    { slug: "find-the-team-size", why: "Party size per itinerary via COUNT OVER — traveling-party distribution is the ancillary-attach denominator, and the window keeps every booking row in place." },
    { slug: "average-selling-price", why: "Average booked fare per family under status windows — the yield mix read with the fate filter placed correctly, per market and per family." },
    { slug: "budget-pacing", why: "Ancillary spend pacing against budget across the booking window — a running-sum check the co-op marketing desk runs on campaign weeks." },
    { slug: "not-boring-movies", why: "Filter-and-order reads over itineraries by fare — the warm-up shape every Delta screen opens with before the denominator questions start." },
    { slug: "duplicate-emails", why: "Duplicate SkyMiles contact emails — one member, two records, split mileage. Catalog hygiene queries decide which record earns the flight." },
    { slug: "group-sold-products-by-the-date", why: "Ancillary bundles folded per departure date with GROUP_CONCAT — the load-planning view of what actually sold onto each departure bank." },
    { slug: "last-person-to-fit-in-the-elevator", why: "Running-sum capacity gates — boarding load against a cap is the same cumulative logic the cabin floor uses for weight-and-balance reads." },
    { slug: "market-analysis-i", why: "Members whose first itinerary landed in the premium cabins — acquisition-mix reads are subquery shapes, and the premium-first cohort drives the concentration number." },
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Seats filled versus waitlisted per departure — the load-versus-overflow read that maps directly onto Delta's fate census and re-accommodation queue." },
    { slug: "rolling-7d-actives", why: "The rolling booking bank: itineraries touched in any 7-day window, the smoothed load curve ops reads instead of the noisy daily count." },
    { slug: "the-airport-with-the-most-flights", why: "Hub load ranking by departure volume — the two-grain census (flights versus airports) that mirrors itineraries-versus-members reads out of ATL and DTW." },
    { slug: "trips-and-users", why: "Itineraries joined to members with filters on both sides and a rated subset — the join-then-conditional-aggregate shape Delta screens open with." },
    { slug: "top-travellers", why: "Members ranked by total travelled distance — the leaderboard shape behind the SkyMiles ladder, with NULL nomenclature and ties handled honestly." },
    { slug: "customer-order-frequency", why: "Booking frequency per member inside a window — the intensity read that decides whether growth is broadening the member base or deepening the top of the ladder." },
    { slug: "cohort-repeat-revenue", why: "Booked value by enrollment cohort and repeat flag — the retention-and-spend fold the SkyMiles pod uses to defend the engagement calendar." },
    { slug: "calculate-product-final-price", why: "Fare product price after adjustments layer on — CASE-ordered pricing math, the same arm discipline the cabin ladder and ancillary bundles demand." },
    { slug: "sessionize-events", why: "Booking bursts split into sessions by inactivity gaps — how the demand team separates a member's one shopping trip from three separate bookings." },
    { slug: "consecutive-available-seats", why: "Consecutive-seat runs in a cabin map — gap-and-islands over seat rows, the boarding and seatmap variant of the re-accommodation problem." },
    { slug: "find-peak-calling-hours-for-each-city", why: "Peak-hour histograms per market — the load-profile read the reservation centers and the departure banks share, bucketed and ranked in one pass." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest booking per fare product — per-group argmax over the fare ladder, the freshness check the mix board runs before publishing a family read." },
    { slug: "ar-aging-schedule", why: "Statements aged into buckets by days outstanding — the dunning spine Delta's settlement group runs every close over the 28-statement book." },
    { slug: "bank-account-summary", why: "Per-account rolled debits, credits and balances — the folded statement view that precedes any exact/partial/never-collected coverage split." },
    { slug: "chargeback-rate-ranking", why: "Dispute rate per counterparty ranked with the denominator stated — settlement-side conditional rates, where a small base can top the board and must say so." },
    { slug: "calculate-orders-within-each-interval", why: "Bookings counted inside interval buckets — the advance-purchase window read, where the bucket edges (half-open, always) decide which itinerary counts as on-time." },
  ],
};
