// Emirates — Wave-8 (Task 96), travel domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Long-haul hub SQL: the storefront db read as a Dubai-hub sandbox — customers are Skywards
// members, orders are booked itineraries (PNRs) (delivered = flown & completed, shipped =
// airborne with shipped_at as the flight-flown stamp, pending = in the booking window,
// cancelled = scrubbed), order_items are the ancillary lines a PNR carries (quantity = units,
// unit_price = per-unit price), products are SKU families, suppliers are hub concession &
// catering partners, region = market. Load-state censuses with printed denominators, two-grain
// market reads, tie-heavy Skywards frequency boards, the 14-month booking spine, and the
// settlement tables (INTEGER cents) that sit under "flown". Pool provenance: company-pools.md
// carries NO Emirates section — 0 tagged rows — so all 10 topic slug sets and all 16 problems
// are theme-curated from the pools file's theme menu and say so. Case briefs quote probed
// figures from scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const emiratesKit: CompanyKit = {
  id: "emirates",
  domainId: "travel",
  name: "Emirates",
  tagline: "Long-haul economics out of the Dubai hub",
  accent: "text-red-400",

  brief: [
    "**Emirates** is the long-haul carrier that made **Dubai** the world's connecting airport — a hub-and-spoke network flown on A380s and 777s where most passengers never began their journey in Dubai at all; they connect Europe to Asia-Pacific through Terminal 3. The commercial engine is premium-cabin mix — First suites, Business, Economy — the {sky:Skywards} ladder of Blue, Silver, Gold and Platinum, and Dubai Stopover packages that turn a connection into a stay. In this app's training db the mapping is honest: customers rows are Skywards members, `orders` are booked itineraries (PNRs) worth **34,833.28** across 103 bookings, order_items are the ancillary lines a PNR carries, products are SKU families, shipped_at is the flight flown, and region is the market.",
    "The data org splits the way the airline does: network and yield own load, commercial owns markets, Skywards owns the member ladder, and a settlement pod owns partner money. Load is the heartbeat: **82 of 103** PNRs have flown (52 {emerald:completed} plus 30 {sky:airborne}), 14 sit pending inside the booking window, and 7 are {rose:scrubbed} — demand that never boarded and the haircut every load forecast carries. The booking-to-departure lead averages **2.98 days** over those 82 (range 2 to 4), by market: LATAM 3.5, US 3.07, EU 2.94, APAC 2.93. Money sits one layer down — partner settlement moves as INTEGER cents across 28 invoices and 27 payments, where the dollar read is amount_cents / 100.0 — and one of the 16 members is based in Dubai itself, an origin flyer in the hub's own market.",
    "Interview screens are census-then-denominator, same as the network. A loop opens with a **load-state census** — completed, airborne, pending, scrubbed, share — folded in one pass with the denominator printed, then escalates: a two-grain market read (EU runs 45 PNRs from 8 members, intensity 5.6; the US runs 19 from 2, intensity 9.5 — *connecting markets book often, the US books fat*), then the Skywards frequency board where four members sit tied at 4 bookings and rank semantics become a policy decision. Yield questions carry a trap by construction: the price ceiling on this db is **199.99**, so a premium-band filter over price returns zero rows — *premium is a cabin, not a price band here* — and concentration is the quiet headline: members above the 3,000 lifetime line hold **63.5%** of booking value.",
    "Preparation: the pools file carries **no Emirates section** — 0 tagged LC problems — so all sixteen problems and every topic slug here are **theme-curated** to the screens this kit describes: one-pass load censuses, two-grain market reads, tie-heavy loyalty boards, CASE cabin banding and the cents-safe settlement spine. Work the topics in order, then run both case files on the live storefront db: one rebuilds the {violet:concession bench audit} hub finance signs off quarterly, the other rebuilds the {violet:Skywards frequency board} the loyalty team ships at every tier review. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** Load first. The overnight census refreshes before standup: did bookings land, did any PNR get its flight stamp without a cabin assignment, does the one-pass status fold reconcile — 52 completed + 30 airborne + 14 pending + 7 scrubbed = **103 by construction**? A branch that misses that identity is *the day's first incident*, not a rounding note. If the booking-to-departure lead drifts off **2.98 days**, the upgrade-window offer commercial runs beside the market call gets re-cut before it ships.",
    "**11:30 —** The market cut. Commercial wants the two-grain census — EU's 45 PNRs from 8 members beside the US's 19 from 2 — with the intensity line argued honestly; {sky:Skywards} wants the frequency board with the four-way tie at 4 handled under the published RANK policy, shared rungs and gaps announced; yield wants average booking value beside value share (the US's **383.48** against APAC's 313.66 on the busiest book). Each ask is a join, a conditional aggregate and one denominator sentence. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the yield-review argument*.",
    "**15:30 —** Settlement closes the day. The AR anti-join refreshes first — **6 partner invoices worth 15,217 cents** with no payment rows — before a single reminder leaves the desk; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly list gets walked line by line: a void book that moved anyway (#11, 925.00) and a paid-status book with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Load factor", what: "PNRs flown over PNRs booked — 82 of 103 on the db, 79.6%. The network's heartbeat: every read that filters scrubbed PNRs out of the base first is a load factor that lies." },
    { name: "Ancillary lines per PNR", what: "Order lines over bookings — 251 over 103, about 2.4. The attach-rate proxy: how many extras the average itinerary carries beyond the fare, the lever premium economics actually pull." },
    { name: "Yield line (avg booking value)", what: "Mean PNR total — 338.19 network, 383.48 in the richest market (US), 313.66 on the busiest (APAC), 426.22 in LATAM on just 2 PNRs. Fare-mix shifts show up here before they reach the yield call." },
    { name: "Market value mix", what: "Each market's slice of the 34,833.28 booking base — EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. Reads the network's center of gravity before any per-market yield claim is made." },
    { name: "Scrub haircut", what: "Cancelled PNRs over booked PNRs — 6.8% network, 8.1% APAC, 6.7% EU, 5.3% US. The share of demand that never boards; forecasts carry this haircut before seats are re-released." },
    { name: "Booking-to-departure lead", what: "julianday(flight) minus julianday(booking) on flown PNRs — 2.98 days average over 82, range 2 to 4. The upsell and upgrade window, and it moves by market: LATAM 3.5, US 3.07, EU 2.94, APAC 2.93." },
    { name: "Skywards concentration", what: "Share of booking value from members above a lifetime threshold — 63.5% at the 3,000 line, 71.2% at 2,000. Tier benefits, upgrade inventory and retention calls are built on this whale curve." },
    { name: "Settlement coverage", what: "Flown is not collected: 21 partner invoices settled exact (65,612 of 65,612), 1 partial (4,000 of 6,148), 6 with no payment rows at all worth 15,217. Money is INTEGER cents; a skipped /100.0 turns a clean tie-out into a phantom break." },
  ],

  topics: [
    {
      name: "Load-state conditional counts",
      why: "Every load read at Emirates is a conditional census — booked, flown, pending, scrubbed, share — folded over status in one pass, 82 of 103 flown. The graded part is the denominator: a WHERE that drops scrubbed rows before the fold prints a load factor the network never earned. FILTER (WHERE …) and SUM(CASE …) are the exact drills.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "recyclable-and-low-fat-products"],
    },
    {
      name: "Hub joins: members to PNRs",
      why: "PNRs inherit their market and member through joins, and the join type decides who survives. A PNR without a member is corruption; a member without a PNR is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job. The WHERE-after-LEFT-JOIN trap kills the NULL-payload rows silently.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets report at two grains at once: EU books 45 PNRs from 8 members while the US books 19 from 2 — load and coverage in one row. COUNT(*) beside COUNT(DISTINCT customer_id) is the habit, and the 251 ancillary lines are the fan-out trap that makes COUNT(*) count SKUs and call them members.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Yield & basket folds",
      why: "Yield is value per unit of demand: per-PNR totals, per-market averages, per-family attach. Every one of those is a join plus an aggregate where the fold's grain is the whole question — average-selling-price's join-through-facts shape is precisely how Emirates screens probe whether you can carry revenue through a chain without counting lines twice.",
      slugs: ["average-selling-price", "sales-person", "students-and-examinations"],
    },
    {
      name: "Skywards frequency boards",
      why: "The loyalty ladder is rank-window reporting where ties are guaranteed — four members sit at 4 bookings each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, and that is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Cabin banding with CASE",
      why: "Cabin mix — First, Business, Economy — is CASE-classified per market with fixed edges the commercial team publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the cabin forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "type-of-triangle", "calculate-special-bonus"],
    },
    {
      name: "Month spine & LAG walks",
      why: "The 14-month booking spine (2024-01 to 2025-02, 6–9 PNRs every month) is the demand call's home turf: prior month beside current, trough (1,193.86 in July 2024) and jump named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "monthly-transactions-i"],
    },
    {
      name: "Premium tier gates",
      why: "Screens escalate into staging: fold per-member totals, then judge each PNR against a computed network mean (338.19 here). Scalar, correlated and derived subquery shapes each carry an empty-inner-query answer you are expected to give unprompted — the premium gate is exactly where that bug ships.",
      slugs: ["second-highest-salary", "managers-with-at-least-5-direct-reports", "find-expensive-cities"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, airborne, pending and scrubbed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift off the identity.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Settlement & cents discipline",
      why: "Flown is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the hub world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away from the anti-join that starts the dunning calendar.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "emirates-t1",
      q: "Your market report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a PNR column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins PNRs to members: a PNR with no member row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from members: the members with no bookings ARE the answer, arriving with NULL PNR columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-booked members, and proving that zero is itself the analyst's job: all 16 Skywards members appear in the booking table somewhere — at Dubai's hub, whitespace in the member base is a loyalty problem, not a query artifact.",
      tag: "joins",
    },
    {
      id: "emirates-t2",
      q: "Four Skywards members tie at 4 bookings on the frequency board. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose tier review comes first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer members (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment, because a Skywards board that splits peers silently will be argued about in the review it was built for.",
      tag: "windows",
    },
    {
      id: "emirates-t3",
      q: "The census shows EU booked 45 PNRs from 8 members; the US booked 19 from 2. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts PNR rows after the join — one row per booking, so a member with 24 bookings contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 bookings collapse to 8 flyers. Neither is wrong: PNRs measure load and demand, members measure installed base and coverage. The ratio — 5.6 bookings per member in EU versus 9.5 in the US on this db — is the intensity signal that decides whether a market is broadening or concentrating; it is the connecting-versus-origin story in two numbers. The trap that catches candidates is a third grain: join order_items for ancillary lines and COUNT(*) silently counts lines, not PNRs — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "emirates-t4",
      q: "shipped_at is NULL until the flight is flown. What is your policy for the booking-to-departure report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only flown PNRs have a lead time, so the report measures booking-to-departure for the 82 of 103 PNRs that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL PNRs returns the flown-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the flown subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 scrubbed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day departures for PNRs still inside the booking window. A report whose WHERE clause is doing definitional work without saying so is exactly what an Emirates reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "emirates-t5",
      q: "The yield review wants completed-PNR value per market, but only for markets carrying at least twenty bookings. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards airborne, pending and scrubbed rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The twenty-booking floor is a group-level fact — HAVING COUNT(*) >= 20 after GROUP BY; on this db EU (45) and APAC (37) clear it while the US (19) and LATAM (2) drop out, and the US is the market that books fat at 383.48 — so the floor is a business decision, not a technicality. Putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a yield line and an error. The strong answer places every filter by asking: is this a fact about one PNR, or about a market?",
      tag: "pipeline",
    },
    {
      id: "emirates-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 PNRs always produce a mean (338.19 on this db — the yield line revenue management quotes). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the premium-gate filter is exactly how it hides. The correlated cousin (compare each PNR to ITS market's average) re-runs per outer row and answers a different question at a different cost — the US at 383.48 and APAC at 313.66 would clear different gates under it. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "emirates-t7",
      q: "The booking trend buckets PNRs by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the demand curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when peak-season PNRs land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On a spine this flat — 6 to 9 PNRs every month, trough 1,193.86 in July — the deltas ARE the story, so the edge row and the window edge are where demand reports go wrong.",
      tag: "dates",
    },
    {
      id: "emirates-t8",
      q: "Finance says a settlement invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "emirates-mcq-1",
      prompt: "A PNR row's status reads 'shipped'. In this kit's Emirates stage map, what happened?",
      choices: ["Flown and completed — counts in the flown numerator only at arrival", "Airborne — the flight is flown but not yet completed", "Scrubbed — cancelled and never boarded", "Still inside the booking window"],
      answer: 1,
      why: "The stage map is fixed: shipped = airborne (30 of 103 PNRs, 29.1%) — the flight stamp is on, the cycle is not complete. Delivered (52, 50.5%) is the completed state.",
      notes: [
        { choice: 0, why: "Flown-and-completed is 'delivered' — 52 PNRs. Calling airborne PNRs completed inflates the flown numerator with rows that are still mid-cycle." },
        { choice: 3, why: "Booking-window PNRs are 'pending' — 14 rows with no shipped_at yet. Pending is not airborne and not scrubbed; it is 'not yet', and it stays in the load denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-2",
      prompt: "Load factor is PNRs flown ÷ which population? The db holds 82 flown, 14 pending and 7 scrubbed of 103 booked.",
      choices: ["Flown + scrubbed only (82/89 = 92.1%)", "All PNRs booked (82/103 = 79.6%)", "Delivered PNRs only (52/82)", "Distinct members (82/16)"],
      answer: 1,
      why: "The house definition: flown ÷ ALL PNRs booked — pending bookings stay in the denominator because 'not yet flown' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still inside the booking window — the rows the load report exists to track." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is cycle completion, flown is the stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-3",
      prompt: "EU carries 45 PNRs from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts PNR rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 bookings per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every PNR has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is PNRs AND flyers." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-4",
      prompt: "APAC booked 37 PNRs, 3 scrubbed. 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to scrubbed PNRs only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the scrub share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the scrub map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-5",
      prompt: "Keep only markets carrying at least 20 booked PNRs. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 20, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 20", "WHERE bookings >= 20 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A booking-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45) and APAC (37) clear the bar; the US (19) and LATAM (2) drop — and dropping the US drops the fattest booker at 383.48, so say it out loud.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'bookings' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-6",
      prompt: "A candidate writes WHERE price >= 200 to find premium-cabin ancillaries on the products table. What does the query return, and what is the real fix?",
      choices: ["The premium SKU list — 3 products above the line", "Zero rows — the db's price ceiling is 199.99; premium must be modeled as a cabin dimension, not a price band", "A syntax error — 200 must be quoted", "One row — the single most expensive product"],
      answer: 1,
      why: "The price ceiling on this db is 199.99, so the premium band is empty by construction. Premium-cabin reads (First, Business) must be built on a cabin dimension or a fare-class rule — not on a price threshold that excludes every row on the db.",
      notes: [
        { choice: 0, why: "Nothing sits at or above 200 — the 'premium list' is a silent empty set that renders as a flat chart, exactly the zero the reviewer was meant to catch." },
        { choice: 3, why: "Not even one: the priciest SKU is 199.99, strictly under the line. A confident empty result still needs the definition corrected." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-7",
      prompt: "The frequency ladder runs 24, 17, 14, 13, 5, then FOUR members tied at 4. Under the board's published RANK policy, what rank do the two 3-booking members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-booking members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-8",
      prompt: "A staging-feed sweep uses member_id NOT IN (SELECT customer_id FROM bookings WHERE cycle = 'scrubbed') and returns ZERO rows. First suspicion?",
      choices: ["The two feeds genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the sweep empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every booking carries a customer_id. But staging feeds are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-9",
      prompt: "A board stack puts flown PNRs and scrubbed PNRs in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no branch label — collapse into one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-10",
      prompt: "A dashboard walks booking value PNR by PNR: SUM(total) OVER (ORDER BY created_at). Two PNRs share a created_at second, and the cumulative 'jumps two bookings at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at PNR grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-emirates-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The concession bench audit",
      brief:
        "Emirates-flavored brief on the storefront db: hub commercial finance opens the quarterly concession review with the trusted bench — partners rated 4.5 and up — before the wider book is read. Probed facts: the six partners carry an ancillary book where Nordic Gadgets AB runs rating 4.6, 3 listings and 11,130.25 of flow (32% of partner value), and Alpine Audio GmbH runs 4.8, 2 listings and 4,765.63. Revenue is defined as SUM(unit_price × quantity) over the lines flowed through each partner's SKUs; listings means distinct SKUs, not line rows — the bench pair's 3 and 2 listings ride on 43 and 40 lines. The review reads the biggest book first.",
      ask: "Return each trusted-bench partner with its rating, distinct SKU listings and ancillary revenue to 2 decimals, biggest revenue first.",
      template:
        "SELECT s.name AS partner,\n       s.rating,\n       COUNT({1} p.id) AS listings,\n       ROUND(SUM(ii.unit_price * ii.quantity), {2}) AS revenue\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items ii ON ii.product_id = p.id\nWHERE s.rating >= {3}\nGROUP BY s.id, s.name\nORDER BY revenue {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the SKU deduplicator",
          why: "COUNT(DISTINCT p.id) folds the partner's order lines back to distinct SKUs: Nordic reads 3, Alpine 2 — the catalog counts the review expects. COUNT(p.id) counts lines (43 and 40) and calls them listings; SUM(DISTINCT …) adds id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the revenue precision",
          why: "Revenue prints to 2 decimals — 11130.25 and 4765.63. ROUND(…, 1) prints 11130.3 and the bench stops reconciling with the 34,833.28 booking base the deck quotes on the facing slide.",
        },
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the trusted-bench floor",
          why: "The audit reads the trusted bench first: Nordic at 4.6 and Alpine at 4.8 clear it. A 4.0 floor drags in five of the six partners — Midwest 4.4, Shenzhen 4.1, Andes 4.0 — the exact roster the review excluded.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review opens on the biggest concession book: Nordic 11,130.25 on top, Alpine 4,765.63 under it. ASC would open the meeting on the smallest partner — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC", "NULL"],
      walkthrough:
        "One chain, one fold, four columns at two grains. The joins walk suppliers to products to order_items — every ancillary line through the SKU its partner operates — and the rating gate keeps the trusted bench: Nordic at 4.6 and Alpine at 4.8, dropping Midwest 4.4, Shenzhen 4.1, Andes 4.0 and Pacific 3.9. GROUP BY folds each partner into one row where COUNT(DISTINCT p.id) reads listings (3 and 2 — riding on 43 and 40 lines, which is why the DISTINCT matters) and ROUND(SUM(unit_price * quantity), 2) reads flow: Nordic 11,130.25 — 32% of the whole partner book per the probed share table — and Alpine 4,765.63, biggest first. The distractors fail honestly: SUM in the listings slot adds SKU id codes together and MAX reports the largest id — a census of nothing; 1 in the precision slot truncates to 11130.3 and breaks the tie-out to the 34,833.28 booking base; dropping the floor to 4.0 drags five partners into a two-partner review; ASC opens the meeting on the smallest book; and NULL in the gate turns the comparison UNKNOWN and the bench empty. The audit's two sentences: listings are distinct SKUs, flow is cents-summed over lines — say both before you write either.",
    },
    {
      id: "cs-emirates-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The Skywards frequency board",
      brief:
        "Emirates-flavored brief on the storefront db: the Skywards tier review ranks members by booked PNRs across the 2024-01 to 2025-02 window and prices the repeat base only — two or more bookings — because the two single-booking members are origin-only flyers the tier calculator excludes this cycle. Probed facts: the booking ladder opens 24, 17, 14, 13, then 5, then FOUR members tied at 4 bookings, then 3 and 3, then 2, 2, 2 — and two members sit on a single booking each. The board's published policy is RANK semantics: ties share a rung and the gaps announce themselves.",
      ask: "Return each repeat member with booked PNR count and RANK over the 2-plus-booking base, biggest count first.",
      template:
        "WITH booked AS (\n  SELECT o.customer_id,\n         c.name AS member,\n         COUNT(*) AS pnrs\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY o.customer_id, c.name\n  HAVING COUNT(*) >= {1}\n)\nSELECT member,\n       pnrs,\n       {2}() OVER (ORDER BY pnrs {3}) AS tier_rank\nFROM booked\nORDER BY pnrs DESC, tier_rank;",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the repeat-base floor",
          why: "The tier review prices the repeat base — two or more bookings in the window — keeping 14 members and dropping the two origin-only single-booking flyers. A floor of 1 drags them back in; a floor of 3 silently deletes the three 2-booking members from the census the board publishes.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung policy",
          why: "The board's published policy is RANK semantics: the four-way tie at 4 shares rank 6 and the next distinct count (3) lands on rank 10 — the gap announces that positions 7 through 9 do not exist. DENSE_RANK reads 6, 6, 6, 6 then 7 and hides the gap; ROW_NUMBER splits peers arbitrarily — a silent call about whose tier review runs first.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The board reads heavy bookers on top — the 24-booking whale opens the review. ASC inverts the ladder and opens on the two 2-booking members the floor just let in, a correct query aimed at the wrong end of the room.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "3", "1"],
      walkthrough:
        "Two stages: fold the base, then rank it. The CTE joins PNRs to members and folds per member — 103 bookings collapsing to a 16-row ladder — then HAVING keeps the repeat base of 14: 24, 17, 14, 13, 5, four members at 4, two at 3, three at 2. The outer SELECT stamps each row with RANK() OVER (ORDER BY pnrs DESC): rungs 1 through 5 are clean, the four-way tie at 4 shares rank 6, the 3-booking pair lands on 10, the 2-booking trio on 12 — gaps included, exactly as the published policy says. The floor's consequence is visible in the cells: the 2-booking rung is IN the census (three members), the two 1-booking flyers are OUT. The distractors each break differently: DENSE_RANK renumbers the board to 6, 6, 6, 6, 7, 7, 8, 8, 8 and hides the phantom rungs; ROW_NUMBER splits the peers arbitrarily; a floor of 3 deletes the 2-booking trio and a floor of 1 reads the origin-only singles back in; ASC flips the board to open on its smallest base. The loyalty desk's rule holds: a frequency board is RANK over a stated floor, with the tie policy on the slide — not argued in the room.",
    },
  ],

  problems: [
    { slug: "flight-occupancy-and-waitlist-analysis", why: "Load state plus waitlist is Emirates' pending-window read — booked, flown, and the PNRs still inside the booking window waiting for a seat. This problem drills the exact conditional census shape the load report runs every morning." },
    { slug: "trips-and-users", why: "Cancellation rate per market with explicit exclusions is the scrub-haircut read: 6.8% network, 8.1% in the busiest market, denominators printed. Same shape, same trap — the base you keep decides the number you print." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The top-booker argmax — which member holds the 24-booking whale — is the Skywards headline read. Argmax over a fold, with ties and the 'who is our heaviest flyer' framing the tier review opens on." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Favorite SKU family per member is the ancillary-attach read: what each flyer actually carries beyond the fare. Per-member argmax over the 251-line fan-out is exactly the grain discipline Emirates screens probe." },
    { slug: "top-travellers", why: "Lifetime value per member, ranked, is the miles-ledger analog: Skywards earn is a running balance over travel history. This problem is that ledger at practice scale — fold, rank, tie policy." },
    { slug: "group-employees-of-the-same-salary", why: "Shared-rung ladders where peers hold one band are how Silver, Gold and Platinum tier groups are actually published — DENSE_RANK with named groups, the exact mechanics of a loyalty band table." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Lines whose quantity beats the network mean is the premium-attach gate: two-stage fold — compute the mean, then filter against it. The same shape as 'which PNRs clear the 338.19 yield line'." },
    { slug: "customers-who-never-order", why: "The never-booked-member anti-join: on this db it returns a confident zero — all 16 members have moved — and proving that zero is the job. The drill exists because the honest empty set is a finding, not a failure." },
    { slug: "fix-names-in-a-table", why: "Member-name hygiene before any join: exports arrive title-case-broken, and 'acme corp' versus 'Acme Corp' silently splits one flyer into two Skywards accounts." },
    { slug: "average-time-of-process-per-machine", why: "Average cycle time per gauge is the booking-to-departure lead at practice scale: AVG over completed cycles only — 2.98 days over the 82 flown, with the 21 unflown rows excluded by definition, not by accident." },
    { slug: "last-person-to-fit-in-the-bus", why: "Capacity-greedy admission under a running-sum cap is A380 seat inventory: fill the cabin until the next booking breaks the limit. Running totals with a hard ceiling — the upgrade-window problem in miniature." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders that met the promised window is the on-time census: a conditional rate with the denominator stated — exactly how the departures team reports 'provisioned inside the promised departure window'." },
    { slug: "sales-by-day-of-the-week", why: "Weekday-mix pivots are the schedule read: departures cluster, and the day-of-week grid the schedule team prices is a CASE pivot over booking timestamps — one row per weekday, no holes." },
    { slug: "product-price-at-a-given-date", why: "Price as of a moment, without fan-out, is the fare-history read: what did this SKU cost when the PNR booked. As-of joins over price rows are how yield reconstructs the fare the flyer actually paid." },
    { slug: "customer-order-frequency", why: "Members booking in consecutive periods are the frequency gate the tier review prices: HAVING over a month-fold finds the cadence flyers the upgrade offers chase." },
    { slug: "find-churn-risk-customers", why: "Booked once, gone quiet — the dormant-flyer anti-join is the winback list before miles expire. Anti-joins over activity recency are how the loyalty team finds lapse risk before the member does." },
  ],
};
