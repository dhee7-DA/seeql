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
    "Preparation strategy: the pools file carries no Delta section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fate censuses, two-grain market reads, tie-heavy loyalty ladders, fare-family pivots and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:market fate census} network ops opens Monday with, the other rebuilds the {sky:fare-family mix board} revenue management reads at every yield review. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["immediate-food-delivery-i", "trial-to-paid-funnel", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Itineraries and members are different grains of the same join, and every census here reports both: EU runs 45 itineraries from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Joining members to itineraries",
      why: "Members carry market and enrollment; itineraries inherit them through joins, and the join type decides who survives. An itinerary without a member is corruption; a member without itineraries is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "SkyMiles frequency ladders",
      why: "Loyalty tiering is rank-window reporting where ties are guaranteed — four members sit at 4 itineraries each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer flyers, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Fare-band CASE ladders",
      why: "Cabin bands are CASE-classified — the db's fare products top out at a 199.99 flagship and the premium band above 200 is empty, which is exactly the honest-boundary question Delta asks. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the yield forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month booking spine (2024-01 to 2025-02) is the network review's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets flown-and-settled, airborne, awaiting and scrubbed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the departure bank moves.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Fare-family mix pivots",
      why: "Revenue management reads booked value per market split across fare-product families — a CASE pivot with one arm per family and a total column that must foot to the market book. Wide pivots die on missing ELSE arms and swapped family literals, so the drill is arm discipline, not syntax.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "primary-department-for-each-employee"],
    },
    {
      name: "Anti-joins & never-flown reads",
      why: "Loyalty hygiene is a real workflow: members who never flew, statements with no settlement leg, fare products that never left the shelf. The LEFT JOIN + IS NULL shape (and NOT EXISTS twin) shows up in most screens as the 'find the dead cohort' question — with the honest caveat that never-booked members return a confident zero on this db.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "find-churn-risk-customers"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Flown is not collected — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the network world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the dunning list.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
