// Emirates — Wave-8 (Task 96), travel domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Long-haul hub SQL: the storefront db read as a Dubai-hub sandbox — customers are Skywards
// members, orders are booked itineraries (PNRs) (delivered = flown & completed, shipped =
// airborne with shipped_at as the flight-flown stamp, pending = in the booking window,
// cancelled = scrubbed), order_items are the ancillary lines a PNR carries (quantity = units,
// unit_price = per-unit price), products are SKU families, suppliers are hub concession &
// catering partners, region = market. Load-state censuses with printed denominators, two-grain
// market reads, tie-heavy Skywards frequency boards, the 14-month booking spine, and the
// settlement tables (INTEGER cents) that sit under "flown". Pool provenance: company-pools.md
// carries NO Emirates section — 0 tagged rows — so all 10 topic slug sets and all 32 problems
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
    "Preparation: the pools file carries **no Emirates section** — 0 tagged LC problems — so all thirty-two problems and every topic slug here are **theme-curated** to the screens this kit describes: one-pass load censuses, two-grain market reads, tie-heavy loyalty boards, CASE cabin banding and the cents-safe settlement spine — built for spaced practice across weeks, not one sitting. Work the topics in order, then run all six case files on the live storefront db: the {violet:concession bench audit} hub finance signs off quarterly, the {violet:Skywards frequency board} the loyalty team ships at every tier review, and the four travel-desk files beside them — the {violet:load census by market} ops standup opens with, the {violet:yield gate} commercial prices against, the {violet:month-spine LAG walk} the demand call argues from, and the {violet:dunning queue} settlement runs each close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "recyclable-and-low-fat-products", "flight-occupancy-and-waitlist-analysis", "customers-who-never-order", "immediate-food-delivery-ii"],
    },
    {
      name: "Hub joins: members to PNRs",
      why: "PNRs inherit their market and member through joins, and the join type decides who survives. A PNR without a member is corruption; a member without a PNR is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job. The WHERE-after-LEFT-JOIN trap kills the NULL-payload rows silently.",
      slugs: ["combine-two-tables", "employee-bonus", "replace-employee-id-with-unique-identifier", "average-time-of-process-per-machine"],
    },
    {
      name: "Two-grain market censuses",
      why: "Markets report at two grains at once: EU books 45 PNRs from 8 members while the US books 19 from 2 — load and coverage in one row. COUNT(*) beside COUNT(DISTINCT customer_id) is the habit, and the 251 ancillary lines are the fan-out trap that makes COUNT(*) count SKUs and call them members.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "customer-order-frequency", "find-churn-risk-customers"],
    },
    {
      name: "Yield & basket folds",
      why: "Yield is value per unit of demand: per-PNR totals, per-market averages, per-family attach. Every one of those is a join plus an aggregate where the fold's grain is the whole question — average-selling-price's join-through-facts shape is precisely how Emirates screens probe whether you can carry revenue through a chain without counting lines twice.",
      slugs: ["average-selling-price", "sales-person", "students-and-examinations", "trips-and-users", "fix-names-in-a-table"],
    },
    {
      name: "Skywards frequency boards",
      why: "The loyalty ladder is rank-window reporting where ties are guaranteed — four members sit at 4 bookings each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, and that is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "customer-placing-the-largest-number-of-orders"],
    },
    {
      name: "Cabin banding with CASE",
      why: "Cabin mix — First, Business, Economy — is CASE-classified per market with fixed edges the commercial team publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the cabin forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "type-of-triangle", "calculate-special-bonus", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Month spine & LAG walks",
      why: "The 14-month booking spine (2024-01 to 2025-02, 6–9 PNRs every month) is the demand call's home turf: prior month beside current, trough (1,193.86 in July 2024) and jump named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "monthly-transactions-i", "orders-with-maximum-quantity-above-average", "sales-by-day-of-the-week"],
    },
    {
      name: "Premium tier gates",
      why: "Screens escalate into staging: fold per-member totals, then judge each PNR against a computed network mean (338.19 here). Scalar, correlated and derived subquery shapes each carry an empty-inner-query answer you are expected to give unprompted — the premium gate is exactly where that bug ships.",
      slugs: ["second-highest-salary", "managers-with-at-least-5-direct-reports", "find-expensive-cities", "group-employees-of-the-same-salary"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, airborne, pending and scrubbed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift off the identity.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "top-travellers", "last-person-to-fit-in-the-bus"],
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
    {
      id: "emirates-t9",
      q: "Walk me through staging the market intensity read as a CTE — member folds first, market folds second. Why two named steps?",
      a: "Stage one folds per member: bookings and value per customer_id — 103 PNRs collapsing to 16 folded flyers, the whale ladder's raw material. Stage two folds per market: COUNT(*) and COUNT(DISTINCT customer_id) over the staged rows print EU's 45-from-8 and the US's 19-from-2, and the intensity ratio (5.6 versus 9.5) divides two folds whose grains are now explicit. Two named steps survive review because each answers one question — 'who are our heavy flyers' then 'how concentrated is each market' — while a nested one-liner hides the fold boundary where the 251-line fan-out lives. When yield asks for the same base with a status filter, the CTE takes the WHERE once and both reads inherit it.",
      tag: "subqueries",
    },
    {
      id: "emirates-t10",
      q: "The ancillary read joins PNRs to their lines and suddenly COUNT(*) reads 251. What grain is that, and how do you keep the census honest?",
      a: "251 is order_items grain — one row per ancillary line, not per PNR. The moment lines join the market census, COUNT(*) counts extras and calls them bookings; COUNT(DISTINCT o.customer_id) still folds back to members, but COUNT(DISTINCT o.id) is the only fold that recovers PNR grain. The house habit is three counts out loud on any joined read: lines (251), PNRs (103), members (16) — and the slide claims the one the fold actually wrote. Ancillary revenue is the legitimate line-grain fold — SUM(unit_price × quantity) — which is exactly why it must ride beside the PNR census under a different name, never inside the same column.",
      tag: "aggregation",
    },
    {
      id: "emirates-t11",
      q: "LAG and LEAD on the month spine — what do the edge rows mean and what does the delta column actually measure?",
      a: "LAG(value) OVER (ORDER BY month_key) returns each month's predecessor; on the 14-bucket spine the first row's LAG is NULL by definition — 2024-01 has no prior month, and that NULL is the baseline, not a missing value to coalesce to zero. LEAD looks forward and puts its NULL at the END of the spine — the last month has no successor. The delta column, value minus LAG(value), is therefore NULL on the first row and measures month-over-month movement everywhere else: 2024-03's 2617.08 against 2024-02's 3609.64 is a −992.56 month the yield call will ask about. The two-edge rule — LAG nulls the head, LEAD nulls the tail — is the part candidates garble; say it before you write either function.",
      tag: "windows",
    },
    {
      id: "emirates-t12",
      q: "NTILE tiles versus CASE bands for the Skywards ladder — when is each the right cut?",
      a: "NTILE(4) deals the ordered 16 members into four even tiles of 4 heads — the pacing cut that fills each quarterly outreach batch evenly, and the top tile lands cleanly on 24, 17, 14 and 13 bookings. CASE bands at published lines are the tier policy cut: Blue, Silver, Gold, Platinum at fixed thresholds, where head counts per band are whatever the base says — uneven by design. The failure is naming them the same thing: 'top quartile' and 'Gold' are different populations the moment the base skews, and on a tie-heavy base — four members at 4 bookings — the tile boundary can split a tied peer group that the RANK policy deliberately keeps together. Tiles for pacing, bands for benefits, and both labeled for what they count.",
      tag: "windows",
    },
    {
      id: "emirates-t13",
      q: "Where does GROUP_CONCAT belong on the ops board, and where does it bite?",
      a: "GROUP_CONCAT(DISTINCT status) folds each market's or month's states into one cell — 'cancelled,delivered,pending,shipped' beside the counts — the at-a-glance mix the board prints before anyone drills in. Two honest limits: SQLite guarantees no order inside the concatenation (wrap a subquery with ORDER BY if the deck needs it sorted), and the cell is display, not data — you cannot aggregate back over a folded string, so it rides beside the COUNT arms, never instead of them. The bite is the fan-out: run it over the order_items join without DISTINCT and every ancillary line repeats its status, turning the mix into a line-count artifact. One cell, one grain, labeled — same discipline as every fold in this kit.",
      tag: "aggregation",
    },
    {
      id: "emirates-t14",
      q: "Which members flew in BOTH 2024-01 and 2024-02? Compare EXISTS, IN and INTERSECT for the double-membership test.",
      a: "Three honest shapes, one trap. Two EXISTS probes ANDed per member test presence month by month and read as the intent. INTERSECT of the two months' member sets is the set-algebra twin — each side folds to distinct members, and the intersection is exactly both-months. The trap is WHERE month IN ('2024-01','2024-02') after grouping: that answers 'flew in EITHER month' — a member with one January PNR and no February qualifies wrongly — and the fix, HAVING COUNT(DISTINCT month) = 2, only works if the WHERE already narrowed to the two months. The cousin trap is NOT IN over a nullable column: one NULL member_id in the subquery silently empties the whole result. State which membership you mean; the panel grades the distinction.",
      tag: "subqueries",
    },
    {
      id: "emirates-t15",
      q: "The loyalty export arrives with '  fatima al zaabi ' style names and mixed-case emails. What's the hygiene pass before any join?",
      a: "Three moves, once, upstream: TRIM the padding, fold case with UPPER (SQLite has no INITCAP — UPPER plus SUBSTR-and-concatenate if true title case is required), and split domains with SUBSTR(email, INSTR(email, '@') + 1) when the partner report slices by domain. Then join on the immutable key — member id — never the name. Skipped, the debt compounds silently: 'Fatima Al Zaabi' and 'fatima al zaabi' stop matching and one Skywards member splits into two accounts, her 24-booking frequency split across rungs that no longer touch. The graded point is placement: clean in a CTE or at load time, then join on the key — never TRIM inside the join condition, where every row pays and no test can see it.",
      tag: "strings",
    },
    {
      id: "emirates-t16",
      q: "Cut the booking spine to Q1 without losing the last night of March. How do you write the window?",
      a: "Half-open: created_at >= '2024-01-01' AND created_at < '2024-04-01'. BETWEEN is closed on both ends, so BETWEEN '2024-01-01' AND '2024-03-31' survives on this date-only db — but the habit breaks the day timestamps gain times, when March 31 14:00 falls outside a closed '2024-03-31' bound and quarter-end bookings vanish exactly when peak-season PNRs land. Inside the cut, strftime('%Y-%m', created_at) builds the month keys — '2024-01' through '2024-03' sort correctly as text. Say the boundary policy once and every window in the kit inherits it; that sentence is the difference between a pace read and a silently truncated one.",
      tag: "dates",
    },
    {
      id: "emirates-t17",
      q: "Per-market booking-to-departure leads read 3.5, 3.07, 2.94, 2.93. What filter states the population, and why does it belong in WHERE?",
      a: "WHERE shipped_at IS NOT NULL — the definitional filter: only flown PNRs have a lead, so the report measures the 82 of 103 that carry the stamp and says so in the title. It's a row fact, so it lives in WHERE before the fold; HAVING can't see it because statuses and stamps stop existing once rows group. julianday would NULL the unflown rows out of the AVG arithmetically — but an unstated population is a report waiting to be misread, and the reviewer grades the sentence 'flown PNRs only' as much as the number. Per market the fold prints LATAM 3.5 (on 2 flown — flag it), US 3.07, EU 2.94, APAC 2.93: the upgrade-offer window, sized in days, with small-N disclosed.",
      tag: "nulls",
    },
    {
      id: "emirates-t18",
      q: "The yield read needs completed PNRs only, for markets carrying twenty or more bookings. Place every clause.",
      a: "Two filters, two clauses. Status = 'delivered' is a row fact — WHERE, before the fold, discarding airborne, pending and scrubbed rows. The twenty-booking floor is a group fact — HAVING COUNT(*) >= 20 after GROUP BY region: EU (45) and APAC (37) clear it, the US at 19 drops and LATAM never stood a chance — and dropping the US drops the fattest booker at 383.48, so the floor is a business decision, not a technicality. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the argument: WHERE COUNT fails because groups don't exist, and pushing the status into HAVING is impossible because statuses no longer exist. The strong answer places each filter by asking: is this a fact about one PNR, or about a market?",
      tag: "pipeline",
    },
    {
      id: "emirates-t19",
      q: "The ops board stacks the flown census and the scrubbed census in one layout. UNION or UNION ALL — and what's the vanishing-row failure?",
      a: "UNION dedups whole rows across branches: two branches that emit byte-identical rows — same market, same counts, no branch label — collapse into one with no error anywhere, and a market vanishes from the board. UNION ALL keeps everything and is the safe default whenever a legitimate repeat can exist; the discipline is a comment stating WHY duplicates are impossible, because the comment is the correctness argument. If the branches must dedup (a union of overlapping state lists, say), then UNION is the tool — but prove disjointness by construction, not by hope. The panel grades set operations as a set-semantics decision, not a layout trick: the branch label column is how you make the stack auditable.",
      tag: "setops",
    },
    {
      id: "emirates-t20",
      q: "Status says 'paid' but the payments table has no rows for the invoice. Which is the ledger of record, and what do you query first?",
      a: "Payment rows are the ledger of record; the status column is a claim. Query one: the anti-join — invoices LEFT JOIN payments keeping NULL payment ids — which returns the 6 never-collected invoices worth 15,217 cents, including #28 at 1,756.00 marked 'paid' with zero settlement rows. Query two is the mirror: a void invoice WITH payment rows (#11 at 925.00 on this db) never appears in that anti-join, so the anomaly list needs both directions. Then classify coverage — exact when SUM(payments) = amount_cents (21 invoices), partial when less (one, at 4,000 of 6,148), none when no rows (6) — and the money rule rides over all of it: INTEGER cents, /100.0 once at the edge. Row counts are claims; keys and evidence are truth.",
      tag: "quality",
    },
    {
      id: "emirates-t21",
      q: "Cents discipline: where exactly does /100.0 happen, and why only once?",
      a: "At the presentation edge — the outermost SELECT that feeds the deck, never inside staging CTEs. Invoices, payments, expenses and ledger rows are INTEGER cents; 15217 cents is 152.17 dollars after one division by 100.0. Divide per-CTE and every intermediate layer re-rounds or re-scales, which is how a clean tie-out drifts into a phantom break — the ledger reads 181,080 against 181,080 only when every layer carried raw cents. The same rule governs ROUND: round once, at print time, so the query, the deck and the audit all quote the same digits. Candidates who divide 'wherever it reads naturally' produce numbers that are each almost right and jointly irreconcilable — which is worse than one honest error.",
      tag: "quality",
    },
    {
      id: "emirates-t22",
      q: "The morning load census filters status and sorts by month. What index do you propose, and what would you measure?",
      a: "A composite on orders(status, created_at): the status equality arm leads, the created_at tail keeps the month-bucket sort from a second pass, and the census's FILTER arms all probe status. The honest framing: at 103 rows this is vocabulary — the claim matters because production booking tables are millions of rows and this census runs before standup. What I'd measure is EXPLAIN QUERY PLAN before and after — 'SCAN orders' becoming 'SEARCH orders USING INDEX' — plus the write tax, because every index bills the PNR-creation insert path. Proposing an index is claiming a trade; measuring it is what makes the claim engineering instead of decoration.",
      tag: "indexes",
    },
    {
      id: "emirates-t23",
      q: "AVG(total) versus SUM(total)/COUNT(*) — when do they diverge on this db?",
      a: "Over the same unjoined rows they're identical — both fold the 103 PNRs to 338.19, and both skip NULL totals identically. They diverge when the denominator changes meaning: run either over the order_items join and SUM(total) repeats booking value per ancillary line while COUNT(*) counts 251 lines — the quotient answers a question nobody asked. The third divergence is deliberate: SUM(total)/COUNT(DISTINCT customer_id) is value per member (2177.08) against value per PNR (338.19) — both honest, both different, and the intensity read depends on choosing knowingly. The graded rule: a fraction is only as honest as the grain of each half, and AVG is the fold that keeps numerator and denominator paired.",
      tag: "aggregation",
    },
    {
      id: "emirates-t24",
      q: "What are the two sentences every Emirates screen is grading you on?",
      a: "First: state the definition and the denominator before you compute anything — flown over booked (82 of 103), bookings over members (45 from 8), value over PNRs (338.19) — because a percentage without its base is a claim, not a metric. Second: make every census reconcile to 103 by construction — 52 delivered + 30 airborne + 14 pending + 7 scrubbed — so a branch that misses the identity is an incident, not a rounding note. Everything else, the RANK policies and the cents discipline and the LAG walks, is machinery in service of those two sentences. Candidates who compute fast but skip them read as dangerous at 30,000 feet, not senior.",
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
    {
      id: "emirates-mcq-11",
      prompt: "The month spine's LAG column shows NULL for 2024-01. A colleague coalesces it to 0 to 'complete the chart'. Why does the desk reject that?",
      choices: [
        "NULL means negative growth and 0 reads better",
        "NULL is the definition — there is no prior month; 0 would read as a flat, zero-value January",
        "COALESCE breaks window functions",
        "The spine should start at 2024-02",
      ],
      answer: 1,
      why: "The first row of a LAG walk has no prior month by construction — the NULL IS the baseline row. Coalescing to 0 invents a 3731.97-point drop into January and a flat month that never existed; label it 'baseline' instead.",
      notes: [
        { choice: 0, why: "Negative-growth cosmetics are exactly how fabricated deltas ship — the chart lies politely." },
        { choice: 2, why: "COALESCE composes fine with windows; the failure is semantic, not mechanical." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-12",
      prompt: "Which market holds the longest booking-to-departure lead, and what is the honest read?",
      choices: [
        "LATAM — 3.5 days on only 2 flown PNRs; small-N flagged, not hidden",
        "EU — biggest market, longest lead",
        "APAC — 2.93 days on the busiest book",
        "US — 3.07 days because it books fat",
      ],
      answer: 0,
      why: "LATAM prints the longest lead at 3.5 days — on 2 flown PNRs. The figure is real but the base is anecdotal, so the market read carries a small-N flag beside it; EU's 2.94 and APAC's 2.93 sit on 45 and 37 PNRs.",
      notes: [
        { choice: 1, why: "Volume is not latency — EU is the biggest book, not the longest window." },
        { choice: 3, why: "US runs 3.07 on 19 PNRs — second place; its intensity (9.5 bookings per member) is the part that actually matters." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-13",
      prompt: "Ancillary revenue per SKU family is SUM(unit_price × quantity) over order_items. A candidate writes SUM(unit_price) after joining products. What went wrong?",
      choices: [
        "Nothing — unit_price is the line value",
        "It ignores quantity — a 3-unit line counts once, so the fold reads low on every multi-unit line",
        "It double-counts through the products join",
        "SUM needs a GROUP BY to execute",
      ],
      answer: 1,
      why: "Line value is unit_price × quantity; SUM(unit_price) prices a 3-unit line at one unit, so every multi-unit line undercounts. The products join is fine — the fold is missing a factor.",
      notes: [
        { choice: 0, why: "unit_price is per-unit; the line carries quantity beside it — the product IS the fold." },
        { choice: 2, why: "The products join keys on product_id and adds no extra rows per line — the error is arithmetic, not fan-out." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-14",
      prompt: "Cabin banding by booking value: WHEN total >= 500 THEN 'first' WHEN total >= 150 THEN 'business' ELSE 'economy'. What does the ELSE arm guarantee?",
      choices: [
        "Premium bookings land in economy",
        "Every row gets exactly one band — no NULLs, no holes in the cabin forecast",
        "The CASE returns NULL for economy rows",
        "Only delivered PNRs get banded",
      ],
      answer: 1,
      why: "The ELSE arm makes the CASE exhaustive: each of the 103 PNRs lands in exactly one band, so band counts reconcile to 103 by construction — the property every cabin forecast needs. Reorder or drop the ELSE and the arms stop covering the base.",
      notes: [
        { choice: 0, why: "Not with those edges — 500-plus hits 'first' first; first-match-wins protects the banding." },
        { choice: 2, why: "ELSE supplies the value; without it the miss-arm is NULL and the counts silently shrink." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-15",
      prompt: "The ops board labels a PNR 'pending'. What does the desk say out loud?",
      choices: [
        "Flown and archived",
        "Airborne mid-cycle",
        "Inside the booking window — not yet flown, still in the load denominator",
        "Scrubbed and re-released",
      ],
      answer: 2,
      why: "Pending is 'not yet': 14 PNRs inside the booking window with no flight stamp. They stay in the load denominator — dropping them inflates load from 79.6% toward a number the network never earned.",
      notes: [
        { choice: 0, why: "Flown-and-archived is 'delivered' — 52 PNRs at cycle end." },
        { choice: 1, why: "Airborne is 'shipped' — 30 PNRs with the stamp on and the cycle open." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-16",
      prompt: "One cell per member with the SKU families their PNRs carry. The fragment is:",
      choices: [
        "GROUP_CONCAT(DISTINCT p.name) over the join folded per member",
        "CONCAT(p.name) GROUP BY member",
        "SUM(p.name) per member",
        "GROUP BY p.name, member",
      ],
      answer: 0,
      why: "GROUP_CONCAT(DISTINCT p.name) folds each member's distinct SKU families into one comma cell after the join — the attach snapshot the premium team reads beside the counts. Bare CONCAT isn't an aggregate in SQLite, and SUM of names is type nonsense.",
      notes: [
        { choice: 1, why: "CONCAT is a scalar string function here, not an aggregate — the fold needs GROUP_CONCAT." },
        { choice: 3, why: "That's a two-column GROUP BY — 16 × families rows, the fan-out the cell exists to avoid." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-17",
      prompt: "Tile the 16 Skywards members into quartiles by booked PNRs. Which fragment, and what does the top tile hold?",
      choices: [
        "NTILE(4) OVER (ORDER BY pnrs DESC) — 4 heads per tile, the top one being 24, 17, 14 and 13 bookings",
        "CASE WHEN pnrs >= 10 THEN 1 … ELSE 4 END",
        "MOD(rank, 4) after RANK",
        "QUARTILE(pnrs) — a built-in fourth",
      ],
      answer: 0,
      why: "NTILE(4) deals the ordered 16 members into four even tiles of 4 — the top tile carries the 24, 17, 14 and 13-booking whales, the board's clean rungs before the four-way tie at 4. Fixed-value CASE bands are tier policy, not even tiles, and the two cuts must not share a name.",
      notes: [
        { choice: 1, why: "That's the tier ladder at published lines — a different cut the deck shows beside the tiles." },
        { choice: 3, why: "No QUARTILE aggregate exists in SQLite — the window NTILE is the tool." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-18",
      prompt: "Which members flew in BOTH 2024-01 and 2024-02? The honest shape is:",
      choices: [
        "Two EXISTS probes ANDed per member — or an INTERSECT of the two monthly member sets",
        "WHERE month IN ('2024-01','2024-02') after grouping",
        "JOIN the month to itself on member",
        "WHERE COUNT(DISTINCT month) = 2 in WHERE",
      ],
      answer: 0,
      why: "Presence-in-both is a double-membership test: two EXISTS probes ANDed, or INTERSECT of the two months' member sets. IN after grouping answers 'flew in either', and the WHERE-level COUNT never exists before groups form.",
      notes: [
        { choice: 1, why: "IN matches members with a booking in EITHER month — a January-only flyer with no February still qualifies, wrongly." },
        { choice: 2, why: "A self-join on member is the brute-force cousin — EXISTS or INTERSECT states the intent." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-19",
      prompt: "Pace for Q1 only: which WHERE keeps every January-through-March booking?",
      choices: [
        "created_at BETWEEN '2024-01-01' AND '2024-03-31'",
        "created_at >= '2024-01-01' AND created_at < '2024-04-01'",
        "YEAR(created_at) = 2024 AND MONTH(created_at) <= 3",
        "strftime('%q', created_at) = '1'",
      ],
      answer: 1,
      why: "Half-open intervals: >= the quarter start, < the next quarter start — nothing on the boundary can fall out. On this date-only db the BETWEEN form happens to survive, but the half-open habit is what survives the day timestamps gain times.",
      notes: [
        { choice: 0, why: "BETWEEN is closed on both ends — safe on date-only text today, a silently-dropped-boundary-booking the day times land." },
        { choice: 2, why: "YEAR()/MONTH() are not SQLite — strftime('%Y') and '%m' are, and the compound gets unreadable." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-20",
      prompt: "How many markets does the hub book into, folded how?",
      choices: [
        "4 — COUNT(DISTINCT region) on the joined fold",
        "3 — COUNT(region) collapses naturally",
        "103 — every PNR is its own market",
        "16 — one per member",
      ],
      answer: 0,
      why: "EU, APAC, US, LATAM — four markets, and COUNT(DISTINCT c.region) prints it once the PNRs are joined to members, because region rides on the customers table.",
      notes: [
        { choice: 1, why: "COUNT(region) counts PNR rows — 103 — DISTINCT is never implied." },
        { choice: 3, why: "16 is members, not markets — a different census." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-21",
      prompt: "The tier review prices the repeat base only — two or more booked PNRs. How many members survive the floor?",
      choices: [
        "14 — the two single-booking flyers drop",
        "16 — everyone has a PNR",
        "12 — the four-way tie drops too",
        "11 — only members above the 3-booking line",
      ],
      answer: 0,
      why: "Fold PNRs per member, then HAVING COUNT(*) >= 2: 14 members survive and the two origin-only single-booking flyers drop — the base the tier calculator prices this cycle.",
      notes: [
        { choice: 1, why: "Everyone has a PNR, but the floor is 2 — the census exists to split base from repeat." },
        { choice: 2, why: "The four-way tie at 4 bookings is a rank-policy story, not a floor story — they clear 2 comfortably." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-22",
      prompt: "Two PNRs tie at 576.54 and the report claims a stable 'next booking'. What makes the order deterministic?",
      choices: [
        "ORDER BY total — ties resolve themselves",
        "ORDER BY total, created_at, id — a named tiebreaker chain",
        "LIMIT 1 — limits force determinism",
        "Rounding totals to two decimals first",
      ],
      answer: 1,
      why: "ORDER BY total leaves tied rows in engine-dependent order — the 'next booking' can change between runs. A named chain (total, created_at, id) makes the pick reproducible, which is the only thing a reviewer accepts.",
      notes: [
        { choice: 0, why: "Ties don't self-resolve — the engine's order is an implementation detail you're not allowed to depend on." },
        { choice: 2, why: "LIMIT narrows the result; it says nothing about which tied row survives." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-23",
      prompt: "The settlement slide prints 152.17; the invoice row says amount_cents = 15217. The fragment that produced the slide:",
      choices: [
        "amount_cents / 100",
        "amount_cents / 100.0",
        "ROUND(amount_cents * 0.01, 0)",
        "CAST(amount_cents AS TEXT) || ' dollars'",
      ],
      answer: 1,
      why: "Invoice money is INTEGER cents; /100.0 promotes to real arithmetic and 15217 reads 152.17. /100 is integer division — it floors to 152 — and rounding to zero decimals throws the cents the tie-out needs.",
      notes: [
        { choice: 0, why: "Integer over integer floors in SQLite — 152 prints, and every odd-cent invoice drifts." },
        { choice: 3, why: "Casting to text decorates the number without dividing — the unit error survives." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-24",
      prompt: "The booked-so-far curve: COUNT(*) OVER (ORDER BY created_at) walks PNR by PNR. What does it produce?",
      choices: [
        "Per-row running total of PNRs booked so far — with tied dates entering together under the default RANGE frame",
        "The grand total on every row",
        "A count of DISTINCT dates",
        "A syntax error — COUNT can't take OVER",
      ],
      answer: 0,
      why: "COUNT(*) OVER (ORDER BY created_at) counts everything up to each row in date order — the running booked curve. The default frame is RANGE, so same-day peers enter together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict walk.",
      notes: [
        { choice: 1, why: "That's the UNBOUNDED frame — every row would print 103; the ordered default frame is what makes it a walk." },
        { choice: 3, why: "OVER() works on any aggregate — COUNT included; refusing that costs the whole window family." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-25",
      prompt: "Restock list: SKU families holding fewer than 20 units. The fragment:",
      choices: [
        "WHERE stock < 20",
        "HAVING stock < 20 GROUP BY product",
        "WHERE COUNT(stock) < 20",
        "LIMIT 20 after ORDER BY stock",
      ],
      answer: 0,
      why: "Stock is a stored column — a row filter, no fold. The hub's restock list is the simplest screen in the kit, and wrapping it in aggregates re-grains the shelf for nothing.",
      notes: [
        { choice: 1, why: "HAVING judges folds; stock isn't folded and the GROUP BY adds nothing." },
        { choice: 3, why: "That's the 20 lowest regardless of the line — a ranking, not the census." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-26",
      prompt: "Partner flow joins suppliers → products → order_items. Why does COUNT(*) read 251 while COUNT(DISTINCT p.id) reads 16?",
      choices: [
        "251 counts ancillary lines through the join; 16 counts distinct SKU families — two grains, both true",
        "One of them is wrong; both should read 251",
        "DISTINCT caps at 100 rows",
        "COUNT(*) ignores the join",
      ],
      answer: 0,
      why: "The chain fans each ancillary line through its SKU: COUNT(*) counts lines (251), COUNT(DISTINCT p.id) folds back to the 16 SKU families that carry them. Both are honest at their own grain — the audit says which one it asked for.",
      notes: [
        { choice: 1, why: "Neither is wrong — mixing them in one column is the error the bench audit exists to catch." },
        { choice: 2, why: "DISTINCT has no cap; 16 is the honest family count." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-27",
      prompt: "The booking spine spans 2024-01 to 2025-02. How many month buckets does strftime('%Y-%m') fold it into, and why that key?",
      choices: [
        "14 — year plus zero-padded month sorts correctly as text",
        "2 — one per year",
        "103 — one per booking",
        "12 — one per month name, years merged",
      ],
      answer: 0,
      why: "14 buckets, 2024-01 through 2025-02: the '%Y-%m' key is year plus zero-padded month, so text ordering IS chronological ordering and January 2024 never merges with January 2025.",
      notes: [
        { choice: 1, why: "That's '%Y' alone — the spine collapses to two rows and the demand curve vanishes." },
        { choice: 2, why: "Raw timestamps group per booking — pace needs the derived key." },
      ],
      difficulty: "easy",
    },
    {
      id: "emirates-mcq-28",
      prompt: "Split the member file by email domain: which fragment extracts the domain after the @?",
      choices: [
        "SUBSTR(email, INSTR(email, '@') + 1)",
        "LEFT(email, '@')",
        "SPLIT(email, '@')[2]",
        "TRIM(email, '@')",
      ],
      answer: 0,
      why: "INSTR finds the @ position and SUBSTR keeps everything after it — the SQLite idiom for domain splits. LEFT takes a count, not a delimiter; SPLIT doesn't exist; TRIM only strips edge characters.",
      notes: [
        { choice: 1, why: "LEFT(email, n) takes the first n characters — there is no delimiter form in SQLite." },
        { choice: 3, why: "TRIM strips only leading/trailing @ characters themselves — the domain survives untouched, which is not the split." },
      ],
      difficulty: "hard",
    },
    {
      id: "emirates-mcq-29",
      prompt: "Market intensity = bookings ÷ members. Where can NULLIF save the read?",
      choices: [
        "bookings / NULLIF(members, 0) — a zero-member market returns NULL instead of a fabricated ratio",
        "NULLIF rounds the ratio",
        "NULLIF is for strings only",
        "Nowhere — division by zero is fine in SQLite",
      ],
      answer: 0,
      why: "SQLite returns NULL for divide-by-zero rather than erroring, so the guard is about honest blanks: NULLIF(members, 0) makes an impossible denominator print NULL — 'no base' — instead of a fabricated number. On this db every market has members; the guard is for staging tables where they don't.",
      notes: [
        { choice: 1, why: "NULLIF compares and NULLs — no rounding involved." },
        { choice: 3, why: "It doesn't error, which is the problem: silent NULLs read as data unless you planned them." },
      ],
      difficulty: "medium",
    },
    {
      id: "emirates-mcq-30",
      prompt: "Every morning the load census filters status and sorts by the month key. Which index claim is honest?",
      choices: [
        "An index on orders(status, created_at) serves the census arms' filter and keeps the month sort cheap",
        "Indexes make aggregates unnecessary",
        "One index per table is the SQLite maximum",
        "customers.region needs no index because regions are short strings",
      ],
      answer: 0,
      why: "The census's WHERE and FILTER arms probe status and sort on the month key — a composite on (status, created_at) serves both. Indexes don't remove the fold; they decide how many rows the fold reads, which is the whole conversation at production scale.",
      notes: [
        { choice: 1, why: "Indexes speed access; the census logic stays exactly as written." },
        { choice: 2, why: "No such cap — a table carries many indexes, each paid for on writes." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-emirates-3",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The load census by market",
      brief:
        "Emirates-flavored brief on the storefront db (orders = PNRs, status = load state, region = market): network ops' standup opens with the load census per market — PNRs booked, flown-and-completed, airborne, scrubbed and booking value, all folded in ONE pass so every market reconciles to the network on sight. Probed on the db: EU books 45 PNRs (24 completed, 12 airborne, 3 scrubbed, 15089.23), APAC 37 (21, 8, 3, 11605.45), the US 19 (5, 10, 1, 7286.16 — the airborne-heavy market), LATAM 2 (2 flown, nothing else, 852.44). The fold must be conditional — FILTER (WHERE …) arms inside one scan — because a WHERE that drops scrubbed PNRs first shrinks the denominator and the 52 + 30 + 14 + 7 = 103 identity stops reconciling.",
      ask: "Return per market: market, PNRs, completed, airborne, scrubbed, value (2dp) — busiest market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS pnrs,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS airborne,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS scrubbed,\n       ROUND({3}(o.total), 2) AS pnr_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {4}\nORDER BY pnrs DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed arm",
          why: "The completed arm tests the flown-and-finished state: 'delivered' reads EU's 24 and the US's 5. Flagging 'shipped' duplicates the airborne column beside it and completed reads as airborne everywhere — 30 network PNRs misfiled.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the scrubbed arm",
          why: "'Cancelled' is the scrub state — the arm reads 3, 3, 1, 0 and the scrub haircut per market falls out of the same scan. 'Pending' flags the booking window instead and the haircut disappears from the board exactly where the forecast needs it.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the value fold",
          why: "ROUND(SUM(o.total), 2) is booking value — 15089.23 for EU. AVG prints the yield line where monthly value was promised, COUNT counts PNRs into a money column, and MAX collapses each market to its single priciest itinerary.",
        },
        {
          answer: "c.region",
          kind: "keyword",
          label: "the market fold",
          why: "GROUP BY c.region folds 103 PNRs into 4 market rows — region rides on customers, so the fold needs the join's column. GROUP BY o.id re-grains per PNR (103 rows) and the standup loses its market cut entirely.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "AVG", "MAX", "o.region"],
      walkthrough:
        "One scan, five folds, the identity intact per market. The join carries region onto every PNR — the one join this census needs — and GROUP BY c.region folds 103 rows into the 4-market cut. Inside the same scan, FILTER (WHERE …) arms read the load states side by side: 'delivered' counts flown-and-completed (EU 24, APAC 21, US 5, LATAM 2), the fixed 'shipped' arm counts airborne (12, 8, 10, 0 — the US is the airborne-heavy market), and the scrubbed arm flags 'cancelled' (3, 3, 1, 0) so the haircut prints beside the demand it haircuts. No state is filtered out anywhere, which is why every market's arms still sum with pending to the PNR column and the network reconciles to 103 by construction. ROUND(SUM(o.total), 2) carries booking value: 15089.23, 11605.45, 7286.16, 852.44. ORDER BY pnrs DESC leads with the busiest book. The distractors each bend the census: 'shipped' duplicates the airborne arm, 'pending' flags the booking window as scrubbed, AVG and MAX turn value into a yield or a single itinerary, and o.region doesn't exist — orders carry no market until the join supplies it. One pass, every state, denominators whole.",
    },
    {
      id: "cs-emirates-4",
      tier: "medium",
      topic: "q6",
      universe: "pricing",
      title: "The yield gate",
      brief:
        "Emirates-flavored brief on the storefront db (orders = PNRs, region = market): the yield review wants markets whose AVERAGE booking value clears the NETWORK mean — above the line commercial prices against, below the line they don't quote. Probed on the db: the network mean sits at 338.19, and the fold clears it in exactly two markets — LATAM at 426.22 (on 2 PNRs, the anecdote row) and the US at 383.48 (the fattest booker, 19 PNRs). EU's 335.32 and APAC's 313.66 miss the line despite carrying 82 of the 103 PNRs — volume is not yield. The read stages per-market folds in a CTE, then judges the folded yields against the network fold, and prints the yield line to two decimals so it reconciles with the rate card.",
      ask: "Return markets above the network yield line: market, PNRs, yield (2dp) — highest yield first.",
      template:
        "WITH market_yield AS (\n  SELECT c.region AS market,\n         COUNT(*) AS pnrs,\n         {1}(o.total) AS yld\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT market,\n       pnrs,\n       ROUND(yld, {2}) AS yield_line\nFROM market_yield\nWHERE yld > (SELECT AVG(total) FROM orders)\nORDER BY yield_line {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the per-market yield fold",
          why: "Yield is value per PNR: AVG(o.total) folds each market to its mean — 426.22, 383.48, 335.32, 313.66. SUM prints market totals into a yield column, MAX collapses each market to its priciest itinerary, and COUNT counts PNRs where rates were promised.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the yield precision",
          why: "The yield line prints to 2 decimals — 426.22 and 383.48 — so it reconciles with the 338.19 network line and the rate card beside it. ROUND to 1 prints 426.2 and 383.5, and the deck stops tying out to the audit's figures.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-yield-first order",
          why: "The review reads the gate-clearing markets richest first: LATAM 426.22, then US 383.48. ASC opens on the smallest clearing yield and buries the anecdote row the commercial team will ask about first.",
        },
      ],
      distractors: ["SUM", "MAX", "1", "ASC"],
      walkthrough:
        "Two stages, one gate, the denominator stated twice. The CTE folds per market: COUNT(*) for PNRs, AVG(o.total) for the yield line — EU 45 at 335.32, APAC 37 at 313.66, US 19 at 383.48, LATAM 2 at 426.22 — four folded rows whose grain is explicit, which is the whole reason the gate can be trusted. The outer query judges each folded yield against the network fold — WHERE yld > (SELECT AVG(total) FROM orders), the 338.19 mean — and exactly two markets clear: LATAM's anecdote-shaped 426.22 and the US's fat 383.48, while EU and APAC miss despite carrying 82 of 103 PNRs. Volume is not yield; that sentence is the deliverable. ROUND(yld, 2) prints the line to the same precision as the rate card. ORDER BY yield_line DESC reads richest first. The distractors each break the fold: SUM turns the yield column into market totals (both still clear, at wrong magnitudes), MAX collapses every market to one itinerary, precision 1 breaks the tie-out, and ASC flips the read. Stage the fold, state the gate, print the survivors — the yield gate in three moves.",
    },
    {
      id: "cs-emirates-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The month-spine LAG walk",
      brief:
        "Emirates-flavored brief on the storefront db (orders = PNRs): the demand call walks the 14-month booking spine month by month — PNRs booked, value, and each month's prior value beside it — so the movement argument is on the slide, not reconstructed in the room. Probed on the db: the spine runs 2024-01 (8 PNRs, 3731.97) to 2025-02 (7 PNRs, 2390.53), with 6–9 PNRs every month, the value trough at 2024-07 (1193.86) and the first month's prior column NULL by definition — the baseline row. The walk is a two-stage query: stage the spine in a CTE, then LAG over it in calendar order. The first row's NULL is the baseline, never a zero.",
      ask: "Return the month spine: month key, PNRs, value (2dp), prior month's value (2dp) — calendar order, earliest first.",
      template:
        "WITH spine AS (\n  SELECT {1} AS month_key,\n         COUNT(*) AS pnrs,\n         SUM(total) AS value\n  FROM orders\n  GROUP BY month_key\n)\nSELECT month_key,\n       pnrs,\n       ROUND(value, 2) AS value,\n       ROUND({2}(value) OVER ({3} month_key), 2) AS prior_value\nFROM spine\nORDER BY month_key {4};",
      slots: [
        {
          answer: "strftime('%Y-%m', created_at)",
          kind: "keyword",
          label: "the month key",
          why: "The spine needs a derived bucket: strftime('%Y-%m', created_at) builds '2024-01' keys that sort correctly as text — 14 buckets. GROUP BY the raw created_at gives one row per PNR, and '%Y' alone collapses the spine to two rows.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month function",
          why: "LAG(value) fetches each month's predecessor — 2024-02's prior reads 3731.97, 2024-01's reads NULL (the baseline). LEAD looks forward and puts the NULL at the END of the spine; SUM turns the column into a running total; ROW_NUMBER isn't a value at all.",
        },
        {
          answer: "ORDER BY",
          kind: "keyword",
          label: "the calendar window",
          why: "LAG needs a walking order: OVER (ORDER BY month_key) walks the spine forward so 'prior' means the previous month. PARTITION BY month_key gives every month its own one-row partition — every prior_value NULLs out and the walk dies.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the forward walk",
          why: "The spine reads forward — 2024-01 through 2025-02, oldest first, so each row's prior sits directly above it. DESC walks backwards in time and 'prior value' points the wrong way down the slide.",
        },
      ],
      distractors: ["created_at", "strftime('%Y', created_at)", "LEAD", "SUM", "PARTITION BY"],
      walkthrough:
        "Stage the spine, then walk it. The CTE folds the demand curve: strftime('%Y-%m', created_at) builds the month key, COUNT(*) and SUM(total) fold per bucket — 14 rows from 2024-01 (8 PNRs, 3731.97) to 2025-02 (7 PNRs, 2390.53), 6–9 PNRs every month, the 1193.86 trough sitting in 2024-07. The outer SELECT walks the folded spine with LAG(value) OVER (ORDER BY month_key): each month's predecessor rides beside it — 2024-02's prior is 3731.97, 2024-03's is 3609.64 — and 2024-01's prior is NULL BY DEFINITION, the baseline row a coalesce-to-zero would corrupt into a fabricated 3731.97-point drop. ORDER BY month_key ASC keeps the walk forward. The distractors each kill the walk differently: the raw created_at re-grains the spine to one row per PNR, '%Y' collapses it to two, LEAD walks the NULL to the tail and hands every month its SUCCESSOR, SUM turns prior_value into a running total, PARTITION BY month_key gives each month its own partition so every prior NULLs out, and DESC points the walk backwards. Two stages, one NULL that means something, deltas on the slide.",
    },
    {
      id: "cs-emirates-6",
      tier: "easy",
      topic: "j4",
      universe: "month-close",
      title: "The dunning queue",
      brief:
        "Emirates-flavored brief on the storefront db (invoices and payments are the partner settlement tables, INTEGER cents): settlement opens the dunning run with the never-collected queue — partner invoices with NO payment rows — before a single reminder leaves the desk. Probed on the db: 6 of the 28 invoices have zero payment rows, worth 15,217 cents all told — INV-2025-024 at 493,700 cents (4,937.00 dollars), INV-2025-026 at 356,200, INV-2025-027 at 279,400, INV-2025-028 at 175,600 (the one marked 'paid' with no evidence — a status that lies), and two more below. The LEFT JOIN keeps every invoice and lets the payments side NULL out; the anti-join predicate keeps only the NULL-evidence rows, and every dollar read divides the cents by 100.0 exactly once.",
      ask: "Return the never-collected queue: invoice number, status, cents, dollars (2dp) — biggest exposure first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents,\n       ROUND(i.amount_cents / {1}, 2) AS dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {2}\nORDER BY dollars {3};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Invoice money is INTEGER cents: /100.0 promotes to real arithmetic and 493,700 cents reads 4,937.00. A plain /100 is integer division — 493,700 would print 4937 anyway, but 87,300 reads 873 with the cents amputated, and the slide stops reconciling to the ledger.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-evidence predicate",
          why: "The dunning queue keeps invoices whose LEFT JOIN produced no payment row — p.id IS NULL. IS NOT NULL answers the opposite question (the 22 collected invoices) and ships the reminders to partners who already paid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure-first order",
          why: "Dunning works biggest exposure first: INV-2025-024 at 4,937.00 dollars opens the run. ASC opens on the 873.00 tail and the desk chases small change while the big bill ages another cycle.",
        },
      ],
      distractors: ["10", "10000", "NOT NULL", "ASC"],
      walkthrough:
        "One LEFT JOIN, one NULL predicate, one honest queue. The join keeps every invoice and attaches whatever payment rows exist — partners with evidence get rows, partners without NULL out. The WHERE keeps only the NULL-evidence side: p.id IS NULL is the never-collected anti-join, and it returns exactly 6 of the 28 invoices — INV-2025-024 at 493,700 cents, INV-2025-026 at 356,200, INV-2025-027 at 279,400, INV-2025-028 at 175,600 (marked 'paid' with zero settlement rows — the status column is a claim, the payment rows are the ledger of record), INV-2024-021 at 129,500 and INV-2024-018 at 87,300. The money rule rides at the edge: ROUND(i.amount_cents / 100.0, 2) prints 4,937.00 and 873.00 — dollars once, cents preserved. ORDER BY dollars DESC leads the run with the biggest exposure. The distractors each redirect the run: /10 inflates every print tenfold, /10000 divides by ten too many, IS NOT NULL flips the queue to the 22 collected invoices and reminders go to partners who already paid, and ASC opens the run on the tail. Keep every invoice, keep the NULL rows, divide once — the dunning queue in three moves.",
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
    { slug: "immediate-food-delivery-i", why: "Share of PNRs meeting the promised window — the on-time census the departures board prints with its denominator, one conditional rate at a time." },
    { slug: "recyclable-and-low-fat-products", why: "A two-flag row filter — the eligibility screen in miniature: stock the hub list with rows that pass both flags, no fold required." },
    { slug: "combine-two-tables", why: "Members LEFT JOINed to their PNRs with NULL payloads preserved — the join whose missing side IS the answer, drilled at practice scale." },
    { slug: "employee-bonus", why: "LEFT JOIN with a NULL-conditional column — the stamp-report shape: members with and without their flight-flown stamp in one pass." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain monthly census — PNRs and distinct members per month, the exact pair the market pacing pack folds." },
    { slug: "daily-leads-and-partners", why: "Per-day two-grain counts — the daily departures board: PNRs and members touched, day by day across the spine." },
    { slug: "average-selling-price", why: "Revenue carried through a join and divided at the right grain — the yield-line read, 338.19 network, defended against fan-out." },
    { slug: "sales-person", why: "Revenue credited to the right account without inflating rows — the concession-book read hub finance signs each quarter." },
    { slug: "rank-scores", why: "Shared-rung ranking with announced gaps — the Skywards frequency board's published RANK semantics in drill form." },
    { slug: "top-earners", why: "Top-N per group without collapsing the group — the top-three bookers per market the commercial pack carries." },
    { slug: "weather-type-in-each-country", why: "CASE classification rolled per market — the load-state roll (flown, pending, scrubbed) as a reusable one-pass shape." },
    { slug: "calculate-special-bonus", why: "A conditional flag per row — the upgrade-offer arm and scrub flags in miniature: THEN the credit, ELSE zero." },
    { slug: "biggest-window-between-events", why: "Gap analysis across ordered events — the longest gap between a member's bookings, the dormancy read on the 14-month spine." },
    { slug: "second-highest-salary", why: "The runner-up fold with the empty-set caveat — second-richest market on the yield card, and what NULL means when only one qualifies." },
    { slug: "active-businesses", why: "One-pass conditional counting — the load census drill: flown, pending, scrubbed and their sum reconciling to 103 in a single scan." },
    { slug: "monthly-transactions-ii", why: "Cancelled share by month with the base kept whole — the scrub-haircut column of the spine pack, 100.0 placed before the division." },
  ],
};
