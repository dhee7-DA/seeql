// GetYourGuide — Wave-8 (Task 96), travel domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Activities-marketplace SQL: the storefront db read as a booking sandbox — customers are
// travelers (16 cities, one account each), orders are bookings (delivered = completed
// experience, shipped = operated with shipped_at as the travel-date stamp, pending =
// awaiting supplier confirmation, cancelled = cancelled per policy), order_items are the
// participant lines (quantity = participants, unit_price = per-participant price),
// products = bookable activities, suppliers = supply partners carrying review ratings,
// invoices/payments = the settlement books in INTEGER cents. Pool provenance:
// company-pools.md carries NO GetYourGuide section (0 tagged rows), so all 10 topic slug
// sets and all 32 problems are theme-curated from the pools file's theme menu and say so.
// Case briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12);
// every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const getyourguideKit: CompanyKit = {
  id: "getyourguide",
  domainId: "travel",
  name: "GetYourGuide",
  tagline: "Travel activities: supply to booking funnel",
  accent: "text-orange-300",

  brief: [
    "**GetYourGuide** is the Berlin-built activities marketplace — the world's way of booking tours, attraction tickets and experiences, moving a traveler from browsing a city to standing in line with a voucher in one session. Its core product bet is instant confirmation: most inventory confirms at checkout, so the supply graph — which operators list what, in which city, at what rating — is the moat. The kit maps the storefront db onto that world: 16 travelers across 16 cities, **103 bookings worth 34,833.28** (average 338.19), 251 `order_items` participant lines behind them (quantity = participants, unit_price = per-participant price), 6 supply partners carrying 16 bookable activities. The status map is fixed: delivered = {emerald:completed} (52, 50.5%), shipped = operated with the travel-date stamp (30, 29.1%), pending = awaiting supplier confirmation (14), cancelled = {rose:cancelled} (7, 6.8%).",
    "The data org splits into supply, demand and a small settlements pod, and they read the same booking spine at different grains. Supply owns operator onboarding, payout runs and review quality; demand owns the view→checkout→confirmed funnel and the seasonal curve; settlements closes operator payouts against the billing books. The booking's `shipped_at` is the {sky:travel-date stamp} — the day the activity actually operated — carried by **82 of 103 bookings** with a **2.98-day** booking-to-travel lead time (range 2–4); the 14 pending rows have no stamp yet, which is a population definition, not a cleanup job. Money sits one layer down: invoices and payments in INTEGER cents, read as `amount_cents / 100.0`, and concentration is sharp — 63.5% of the book comes from travelers whose lifetime spend crosses 3,000 (71.2% above 2,000).",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU runs 45 bookings from 8 travelers (5.6 each) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a cancelled booking count in your base?'*), then into the operator leaderboard where the payout ladder runs 11,130.25 down to 2,980.15 and the review bench at 4.5-plus holds exactly two partners. Late rounds walk the {violet:14-month demand spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no GetYourGuide section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: funnel conversion, two-grain censuses, tie-heavy traveler ladders, CASE-banded cancellation slices and the cents-safe settlement spine. Do the topics in order, then run the six case studies on the live storefront db: they rebuild the {sky:operator payout census} the supply pod opens Monday with, the {violet:traveler value ladder} the loyalty board reads quarterly, the market cancellation slices, the payout coverage ledger, the demand month walk and the catalog board. This expanded kit is built for spaced practice rather than one sitting: run each case study, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the *which denominator did you use* follow-up tests. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts on the booking funnel wall. Before standup: did overnight checkouts land, did any activity operate without a `shipped_at` stamp, does the one-pass status census reconcile — 52 completed + 30 operated + 14 awaiting confirmation + 7 cancelled = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If booking lead time drifts off the **2.98-day** norm, the supply pod pulls the pending-confirmation queue before the demand read ships.",
    "**11:30 —** Midday is the seasonal deep-dive. Demand wants the month spine re-cut — the **3,731.97** January peak against the **1,193.86** July trough, step deltas named, no folklore — plus market intensity (EU 45-from-8 versus US 19-from-2); supply wants the operator leaderboard with Nordic Gadgets AB's **11,130.25** (32% of supply revenue) beside the 4.5-plus review bench. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward payouts. The settlements anti-join refreshes first — **6 never-collected invoices worth 15,217** — before a single operator reminder goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; the anomaly list gets walked line by line: a void-but-settled invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every payout run does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:payouts ship} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Instant-confirmation share", what: "Bookings confirmed at checkout versus parked awaiting supplier confirmation: the 14 pending rows (13.6% of the book) are the non-instant tail the instant-inventory network exists to shrink. The product promise lives or dies on this conditional count, and its denominator is all bookings placed." },
    { name: "Booking lead time", what: "created_at to the travel-date stamp (julianday delta) over the 82 operated bookings: 2.98-day average, range 2–4. The population ships with the number — pending and cancelled bookings have no cycle yet and must not dilute the average." },
    { name: "Completed-experience share", what: "Delivered ÷ ALL bookings placed: 52 of 103 (50.5%). 'Completed' means the activity ran and reconciled; the denominator — awaiting-confirmation and cancelled included — is the whole interview." },
    { name: "Cancellation share", what: "Cancelled bookings ÷ placements, sliced by market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0 — 7 of 103 overall. Cancellations are the funnel's policy-driven leak, and the market spread is the story the trust pod watches." },
    { name: "Gross booking value", what: "Total value booked: 34,833.28 across 103 bookings, average 338.19 against a 25.47 to 1,088.44 spread. Inventory is perishable — an unsold seat on tomorrow's food tour is gone — so GBV books at checkout and kept-demand splits are read against it." },
    { name: "Traveler concentration", what: "Share of the book from travelers spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). Alice Chen alone books 24 bookings worth 7,262.35 — one lost logo moves a quarter, and it staffs the loyalty pod." },
    { name: "Operator review bench", what: "Supply partners rated 4.5-plus: 2 of 6 — Nordic Gadgets AB (4.6) and Alpine Audio GmbH (4.8) — the premium-shelf gate. Nordic also carries 32% of supply revenue (11,130.25), so quality and dependency point at the same logo." },
    { name: "Payout coverage", what: "Settled versus invoiced: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the settlements pod refreshes before every payout run." },
  ],

  topics: [
    {
      name: "Booking funnel counts",
      why: "Every GetYourGuide demand screen opens with the funnel: bookings placed, travel-dates stamped (operated), experiences completed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an operated booking 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i", "customer-who-visited-but-did-not-transact", "sales-by-day-of-the-week", "game-play-analysis-iv"],
    },
    {
      name: "Two-grain market censuses",
      why: "Bookings and travelers are different grains of the same join, and every market census here reports both: EU runs 45 bookings from 8 travelers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "the-number-of-passengers-in-each-bus-i", "activity-participants", "students-and-examinations"],
    },
    {
      name: "Joining travelers to bookings",
      why: "Travelers carry city and market; bookings inherit them through joins, and the join type decides who survives. A booking without a traveler is corruption; a traveler without a booking is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "second-most-recent-activity"],
    },
    {
      name: "Lead-time & latency math",
      why: "The travel-date stamp makes lead time a first-class metric: booking to operation averages 2.98 days over the 82 stamped bookings, range 2–4. Every latency read is a julianday delta with a stated population — and the 21 unstamped rows are a definition, not a filter accident.",
      slugs: ["average-time-of-process-per-machine", "immediate-food-delivery-ii", "users-that-actively-request-confirmation-messages", "find-peak-calling-hours-for-each-city"],
    },
    {
      name: "Operator leaderboards",
      why: "Supply reviews rank partners by payout value and review rating, where the ladder runs 11,130.25 down to 2,980.15 and the 4.5-plus bench holds exactly two logos. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer operators, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "ltv-cac-payback", "keep-latest-dedupe"],
    },
    {
      name: "Seasonality: month spines & LAG",
      why: "The 14-month demand spine (2024-01 to 2025-02) is the demand call's home turf: prior month beside current, delta rounded, the January peak (3,731.97) and July trough (1,193.86) named from the data, not from a summer-peak assumption. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "year-on-year-growth-rate", "restaurant-growth", "market-analysis-ii", "friday-purchases-i", "null-blank-audit"],
    },
    {
      name: "Cancellation slices with CASE",
      why: "Cancellation policy reads are CASE-classified conditional counts: 7 of 103 bookings cancelled overall, but APAC 8.1% versus US 5.3% — the spread only appears when the ratio is computed with an honest denominator. The arms must be exhaustive and ordered; a hole in the CASE is a hole in the trust report.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories", "returns-rate-by-category"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — operated under completed, this season beside last — and EXCEPT answers 'which travelers never completed an experience'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order", "customers-who-bought-all-products", "find-churn-risk-customers", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, operated, awaiting-confirmation and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "confirmation-rate", "percentage-of-users-attended-a-contest", "trips-and-users", "top-travellers", "last-person-to-fit-in-the-bus", "median-time-to-convert", "queries-quality-and-percentage"],
    },
    {
      name: "Payout & cents discipline",
      why: "Booked is not settled — the settlement tables (28 invoices, 27 payments, INTEGER cents) are where the marketplace meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule", "duplicate-charge-pairs", "prepayment-detection"],
    },
  ],

  theory: [
    {
      id: "getyourguide-t1",
      q: "Your market report joins travelers to bookings. When do you INNER and when do you LEFT — and what silently breaks if you filter a booking column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins bookings to travelers: a booking with no traveler row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from travelers: the travelers with no bookings ARE the answer, arriving with NULL booking columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload traveler row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-booking travelers, and proving that zero is itself the analyst's job: all 16 travelers appear in the booking table somewhere. The GetYourGuide twist: awaiting-confirmation inventory is the 14 pending rows — it must survive traveler-level reads, so it gets filtered in an outer query, never by jamming a status predicate into the join.",
      tag: "joins",
    },
    {
      id: "getyourguide-t2",
      q: "Four travelers tie at 4 bookings on the value ladder, below 24, 17, 14, 13 and 5. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consumes ranks 6 through 9, and the next distinct count (3 bookings) lands on 10, implying four phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which of four peer travelers gets the winback offer first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer travelers (RANK or DENSE_RANK), or an explicitly named tie-breaker like lifetime_value DESC, then id — and writing it in the query comment, because the loyalty board reads the ladder, not the SQL.",
      tag: "windows",
    },
    {
      id: "getyourguide-t3",
      q: "The census shows 103 bookings and 16 travelers; EU shows 45 bookings and 8 travelers. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts booking rows after the join — one row per booking, so a traveler with 24 bookings contributes 24. COUNT(DISTINCT customer_id) folds those rows back to travelers — EU's 45 bookings collapse to 8 logos. Neither is wrong: bookings measure load and demand momentum, travelers measure installed base and city coverage. The ratio — 5.6 bookings per traveler in EU versus 9.5 in the US on this db — is the intensity signal that decides whether demand is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for participant lines and COUNT(*) silently counts participant lines, not bookings — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "getyourguide-t4",
      q: "shipped_at — our travel-date stamp — stays NULL until the activity operates. What is your policy for the lead-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only operated bookings have a lead time, so the report measures booking-to-travel-date for the 82 of 103 bookings that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL bookings returns the operated-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the operated subset; the gap between it and COUNT(*) is exactly the 14 awaiting-confirmation plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the lead time to zero to 'fix' the average — that invents same-day travel for bookings whose supplier has not even confirmed. A report whose WHERE clause is doing definitional work without saying so is exactly what a GetYourGuide reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "getyourguide-t5",
      q: "The demand review wants completed-experience value per market, for markets carrying at least ten bookings. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards operated, awaiting-confirmation and cancelled rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-booking floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. On this db the gate has teeth: LATAM carries 2 bookings and drops out, leaving EU 45, APAC 37 and US 19. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a demand line and an error, and between a threshold applied to bookings versus to dollars. The strong answer places every filter by asking: is this a fact about one booking, or about a market?",
      tag: "pipeline",
    },
    {
      id: "getyourguide-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 bookings always produce a mean (338.19 average booking value here — the US at 383.48 and LATAM at 426.22 are the two markets that clear it). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each booking to ITS market's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "getyourguide-t7",
      q: "The demand review buckets bookings by month on TEXT timestamps. How do you build the spine, cut a season without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the seasonality read becomes fiction. The season window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-10-01' — because BETWEEN '2024-09-01' AND '2024-09-30' silently drops the last night's bookings, and season-end is exactly when late city-break bookings land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. And read the curve from the spine, not folklore: this db peaks in January at 3,731.97 and troughs in July at 1,193.86, with the largest jump +1,158.21 into August — a claim is only as good as the bucket that produced it.",
      tag: "dates",
    },
    {
      id: "getyourguide-t8",
      q: "Finance says an operator invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; in between sits the partial (#25, 4,000 of 6,148 settled). The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the payout run does not ship.",
      tag: "quality",
    },
    {
      id: "getyourguide-t9",
      q: "The board stacks populations — completed this season beside operated — and a reviewer asks why UNION instead of UNION ALL. What is the real difference, and when does each lie?",
      a: "UNION dedups whole rows across branches; UNION ALL stacks everything. The lie runs the other way than people expect: plain UNION silently collapses two branches that emit byte-identical rows — a traveler appearing in both stages prints once and the board loses a row with no error anywhere. The discipline is UNION ALL plus a stated reason duplicates are impossible, usually a branch-label column; plain UNION is only correct when dedup IS the requirement. The same rigor applies to EXCEPT direction: bookings EXCEPT completed is 'booked but never completed', and completed EXCEPT bookings returning anything is a data-quality incident.",
      tag: "sets",
    },
    {
      id: "getyourguide-t10",
      q: "Why does this marketplace store money as INTEGER cents, and what is the read-side discipline that keeps the payout run honest?",
      a: "Floating-point sums drift, and settlement books must reconcile to the cent — 65,612.00 of exact settlements either foots or the payout run does not ship. So invoices and payments carry INTEGER cents, and every dollar read is amount_cents / 100.0. The .0 is not decoration: INTEGER / INTEGER is integer division in SQLite and truncates, so 92,549 cents prints 925 instead of 925.49 — silently shorting every odd-cent operator. Aggregate in cents, convert at the outermost SELECT, round only for display, and the trial balance stays provable: 181,080 debits against 181,080 credits, delta zero.",
      tag: "cents",
    },
    {
      id: "getyourguide-t11",
      q: "Retried checkouts double-count booking intents. Walk me through the dedupe you run before any funnel number ships.",
      a: "Detect first: GROUP BY the intent's natural key — traveler plus activity, the retry signature minutes apart — and HAVING COUNT(*) > 1 to see the damage. Remove with the window dedupe: ROW_NUMBER() OVER (PARTITION BY customer_id, product_id ORDER BY created_at DESC), keep rn = 1. Name both keys out loud: the PARTITION BY defines what an intent IS, the ORDER BY defines what 'latest' means. RANK would tie simultaneous attempts and keep both; a bare ORDER BY with no partition keeps exactly one booking on the whole table. On this db the funnel's 103 bookings are post-dedupe — the raw stream always has more.",
      tag: "windows",
    },
    {
      id: "getyourguide-t12",
      q: "Demand wants each market's booked value beside a running total across markets, biggest first. Which window computes it, and what does the frame do?",
      a: "SUM(SUM(o.total)) OVER (ORDER BY value DESC) — window functions run after GROUP BY, so the inner SUM is each market's folded value and the outer fold accumulates in sort order: EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44, running to 34,833.28. The default frame is RANGE, which includes peers — two markets tied on value would step together in one jump; ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the walk strict. The two-grain read (bookings beside travelers beside value) is what makes the share argument land: EU's 43.3% of the book comes from 8 of 16 travelers.",
      tag: "windows",
    },
    {
      id: "getyourguide-t13",
      q: "Where do CTEs earn their keep in a funnel read, and when do you refuse one?",
      a: "When the population needs a name. Stage the kept-demand filter — status IN ('delivered', 'shipped') — as kept_bookings, then fold to travelers and join city in layers, each step reviewable: the status policy lives in exactly one place, and a definition change edits one line. Refuse a CTE when a single readable SELECT does the job — a CTE around one WHERE is ceremony, not hygiene. The empty case still applies: a CTE that filters everything out hands the next stage zero rows, and the downstream COUNT prints a confident 0, not an error — which is why the population statement ships with the query.",
      tag: "subqueries",
    },
    {
      id: "getyourguide-t14",
      q: "EXISTS, IN, or JOIN — three ways to find travelers with a cancellation. Which do you write, and what does each cost?",
      a: "EXISTS: 'at least one cancelled booking exists for this traveler' short-circuits on the first match and never materializes a list — the cheapest, safest membership test. IN is semantically equivalent on the clean core db but materializes the id list, and its NOT IN twin is the trap: one NULL in a staging list turns every comparison UNKNOWN and the report empties silently. The LEFT JOIN + IS NULL form is the third read — it costs a fold and returns the anti-join explicitly, which is what the trust pod actually wants: the rows, not just the count. State which population survives before choosing the form.",
      tag: "subqueries",
    },
    {
      id: "getyourguide-t15",
      q: "City ops wants a rolling 7-day booked-traveler average per city for staffing. How do you build it without double-counting repeat bookers?",
      a: "Two stages, two grains. First fold bookings to traveler-days: one row per city per day, COUNT(DISTINCT customer_id) as that day's travelers — the distinct fold is what stops Alice Chen's five bookings in a day from reading five travelers. Then the moving average: AVG(daily) OVER (PARTITION BY city ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). The frame is ROWS, not RANGE, so tied days walk strictly row by row. Getting the distinct count wrong after the window — instead of inside the fold — counts a traveler once per week instead of per day, and the staffing plan quietly under-hires the peak cities.",
      tag: "dates",
    },
    {
      id: "getyourguide-t16",
      q: "The coverage board must print zero for activity families with no bookings this quarter. What is the join-and-coalesce policy?",
      a: "LEFT JOIN from the dimension side: families keep their rows even with no bookings, arriving with a NULL payload. COUNT(oi.id) reads 0 naturally on the all-NULL payload; SUM-style folds need COALESCE(SUM(oi.quantity), 0) to print zero instead of NULL. The rule in three words: dimension LEFT, measures COALESCEd, empty buckets visible. INNER JOIN deletes the hole — the map omits the family entirely, and the city team reads the missing row as 'family retired' rather than 'zero booked this quarter'. The zero is information; the policy exists so the board can carry it.",
      tag: "nulls",
    },
    {
      id: "getyourguide-t17",
      q: "FILTER (WHERE …) versus SUM(CASE WHEN …) — same census, different syntax. Which do you ship, and what discipline do both impose?",
      a: "Same cells, different portability. COUNT(*) FILTER (WHERE status = 'delivered') is the readable form on this stack; SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs on any engine — keep it in the comment so the port exists. The discipline both impose matters more than the choice: one scan, one denominator, and cells that must reconcile — 52 + 30 + 14 + 7 = 103 against COUNT(*). Four sequential queries are four chances to drift; the one-pass census exists so every cell shares a WHERE-free denominator and the identity can be checked in the same breath it is computed.",
      tag: "aggregation",
    },
    {
      id: "getyourguide-t18",
      q: "Scalar, correlated, EXISTS — how do you pick between them, and what does each do when the inner fold comes back empty?",
      a: "Scalar returns one value for everyone — the 338.19 platform bar; correlated re-folds per outer row — each booking judged against ITS market's average, LATAM's 426.22 included; EXISTS is a membership test that returns no value. The empty cases differ and the panel fishes for them: an empty scalar subquery returns NULL, and total > NULL is UNKNOWN, so the report silently drops every row; an empty correlated fold NULLs only that market's rows; EXISTS simply returns false. Pick by asking what the bar is — constant, per-group, or presence — then state the empty-case behavior unprompted, because that is the follow-up.",
      tag: "subqueries",
    },
    {
      id: "getyourguide-t19",
      q: "A CASE classification prints 'partial' for invoices that settled exactly. Where is the bug?",
      a: "Arm order. CASE evaluates WHENs top-down and stops at the first hit, so an overlapping or misordered arm — say WHEN SUM(p.amount_cents) >= 0 THEN 'partial' — steals every row before the equality test ever runs. The policy for the coverage ledger: test the degenerate case first (COUNT(p.id) = 0 → 'never collected'), then the exact equality (SUM(p.amount_cents) = billed → 'exact'), then ELSE 'partial' — and make the ELSE explicit rather than letting it fall to NULL. The audit is the reconciliation: 21 exact, 1 partial, 6 never-collected over 28 invoices, and the trial balance delta zero.",
      tag: "quality",
    },
    {
      id: "getyourguide-t20",
      q: "Booking-to-travel lead time on TEXT timestamps — build the clock. What breaks it, two classic ways?",
      a: "julianday(shipped_at) - julianday(created_at) over the 82 stamped bookings: 2.98-day average, 2 to 4 spread. Break one: DATE() subtraction — DATE() returns TEXT, TEXT minus TEXT coerces to 0, and the clock flatlines at zero days. Break two: dropping WHERE shipped_at IS NOT NULL is invisible because AVG skips NULLs — the query still prints 2.98 — but the population renamed itself from 'all bookings' to 'operated bookings' with no error. The house rule: julianday in the math, the stamp filter stated in the query AND the report title, and the 21 unstamped rows named as a definition, never cleaned up.",
      tag: "dates",
    },
    {
      id: "getyourguide-t21",
      q: "Anti-joins three ways — LEFT JOIN IS NULL, NOT EXISTS, NOT IN. Which is house style for 'settlement legs that never matched an invoice', and why?",
      a: "LEFT JOIN + IS NULL for the ledger walk: it returns the unmatched rows WITH their columns, which is what the anomaly list needs — #28's 1,756.00 paid-status invoice with zero legs, named, not just counted. NOT EXISTS is the safest predicate form and states intent cleanly; it is what you write when only the count matters. NOT IN is the trap: one NULL invoice_id in the subquery makes every comparison UNKNOWN and the report empties while looking valid. Whichever form you write, the follow-up is the same: what does the survivor set mean, and did you prove the six-row anti-join is real rather than a join bug?",
      tag: "joins",
    },
    {
      id: "getyourguide-t22",
      q: "The loyalty board wants value quartiles instead of fixed spend tiers. NTILE or percentiles — what changes, and which does the CRM want?",
      a: "NTILE(4) OVER (ORDER BY lifetime_value DESC) makes equal-COUNT tiles: 16 travelers, four per tile, Alice Chen opening tile 1, ties landing by the sort. PERCENT_RANK and CUME_DIST make equal-RANGE cuts, which can strand a whole tile at one value or leave tiles unevenly populated. For a loyalty program the tiles are the product — equal count means each tier holds the same number of travelers, which is exactly what the CRM import expects — so NTILE is the answer, and the boundaries it printed get documented with the query. The two approaches produce different cuts on the same data; shipping one while describing the other is how tier arguments start.",
      tag: "windows",
    },
    {
      id: "getyourguide-t23",
      q: "Cumulative booked value along the travel-date spine jumps two bookings at once. Why, and what is the fix?",
      a: "With ORDER BY shipped_at the default frame is RANGE — rows tied on travel date enter the running SUM together, and at booking grain ties are guaranteed because the 2-to-4-day spread compresses many bookings onto the same stamp. The fix is declaring the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row. The same discipline governs the month walk: SUM(total) - LAG(SUM(total)) OVER (ORDER BY month) prints the first delta as NULL — the baseline, never zero-filled into a flat month. Frame and baseline are the two silent decisions in every cumulative read; the strong candidate says both out loud.",
      tag: "windows",
    },
    {
      id: "getyourguide-t24",
      q: "Every number in this kit ships with a reconciliation identity. What is the habit, and which identities does the panel expect you to know?",
      a: "The identity is the proof that a fold is exhaustive: compute it in the same query as the census and say it before the interviewer asks. The three here: the fate census — 52 completed + 30 operated + 14 awaiting + 7 cancelled = 103 by construction; the coverage split — 21 exact + 1 partial + 6 never-collected = 28 invoices; and the ledger trial balance — 181,080 debits against 181,080 credits, delta zero, which is the payout run's gate. An overlapping CASE arm or a dropped status breaks exactly one of these identities, which is the point: a number with its identity is a reconciliation, without one it is a claim.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "getyourguide-mcq-1",
      prompt: "A booking row's status reads 'delivered'. In this kit's GetYourGuide stage map, what happened?",
      choices: ["Completed — the activity ran and reconciled", "Operated — travel date underway, not reconciled", "Cancelled — dropped per policy", "Awaiting supplier confirmation"],
      answer: 0,
      why: "The stage map is fixed: delivered = completed (52 of 103 bookings, 50.5%). It is the only status where the experience has run AND reconciled.",
      notes: [
        { choice: 1, why: "Operated is 'shipped' — 30 bookings carry the travel-date stamp but are not reconciled. Calling them completed inflates the kept count before settlement closes." },
        { choice: 3, why: "Awaiting-supplier-confirmation is 'pending' — 14 bookings with no travel-date stamp yet. Pending is neither completed nor cancelled; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-2",
      prompt: "Operated share is travel-date-stamped ÷ which population? The db holds 82 stamped, 14 awaiting confirmation and 7 cancelled of 103 booked.",
      choices: ["Operated + cancelled only (82/89 = 92.1%)", "All bookings placed (82/103 = 79.6%)", "Completed bookings only (52/82)", "Distinct travelers (82/16)"],
      answer: 1,
      why: "The house definition: operated ÷ ALL bookings placed — the 14 awaiting confirmation stay in the denominator because 'not yet operated' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the share to 92.1% by deleting the population still in the confirmation queue — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is completion, the travel-date stamp is operation. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-3",
      prompt: "EU carries 45 bookings from 8 travelers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts booking rows (45); COUNT(DISTINCT customer_id) folds repeats back to travelers (8). The gap between them — 5.6 bookings per traveler — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every booking has a traveler. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not travelers — a third grain nobody asked for. The census is bookings AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-4",
      prompt: "A market cancellation map computes 100 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) and prints 6 for EU instead of 6.7. Why?",
      choices: ["The CASE flags are wrong", "Integer division: SUM over COUNT truncates before the 100 multiplier scales it — write 100.0 first", "EU's denominator is 45, not 46", "COUNT(*) should be COUNT(status)"],
      answer: 1,
      why: "SUM of 0/1 flags over COUNT is integer division — the share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; it is the difference between 6.7 and a displayed 6 on the cancellation map.",
      notes: [
        { choice: 0, why: "The CASE is fine — 3 of 45 EU bookings are cancelled. The arithmetic type, not the flag, is what flattened 6.7 to 6." },
        { choice: 2, why: "COUNT(*) IS 45 for EU — the denominator is correct. Changing it to 46 would invent a booking, not fix the truncation." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-5",
      prompt: "Keep only travelers carrying at least 3 bookings (the core-repeat gate). Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 3, before GROUP BY", "GROUP BY traveler HAVING COUNT(*) >= 3", "WHERE bookings >= 3 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A booking-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the gate keeps eleven of sixteen travelers and drops the three 2-booking and two 1-booking travelers.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'bookings' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-6",
      prompt: "The booking ladder runs 24, 17, 14, 13, 5, then FOUR travelers tied at 4. Under RANK, what rank do the two 3-booking travelers carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-booking travelers share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending bookings double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the operated-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 bookings.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-8",
      prompt: "A staging-table list of travelers with no cancellations uses customer_id NOT IN (SELECT customer_id FROM bookings WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["Every traveler really cancelled — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every booking carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-9",
      prompt: "A board stack puts completed bookings under operated bookings in one layout, built with UNION. A reviewer says one traveler's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same traveler, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same traveler, same counts, no market or branch label — collapse into one, and the board loses a traveler with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-10",
      prompt: "A dashboard walks booked value along the travel-date spine: SUM(total) OVER (ORDER BY shipped_at). Two bookings share a travel date, and the cumulative 'jumps two bookings at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on travel date join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at booking grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-11",
      prompt: "The settlements dashboard reads invoices in dollars, but payments.amount_cents is an INTEGER. Which expression prints invoice #28's 175,600 cents as 1756.0 — and stays honest on odd-cent rows?",
      choices: ["amount_cents / 100", "amount_cents / 100.0", "amount_cents * 100", "ROUND(amount_cents / 100)"],
      answer: 1,
      why: "SQLite divides two INTEGERs with integer division, so amount_cents / 100 truncates — 92,549 cents prints 925, not 925.49. Dividing by 100.0 forces REAL arithmetic and preserves every cent; round only at display time.",
      notes: [
        { choice: 0, why: "The truncation is silent: multiples of 100 look correct, which is exactly why the bug survives until an odd-cent settlement lands and the payout run is short." },
        { choice: 3, why: "ROUND cannot recover the cents integer division already threw away — the damage happens inside the parentheses, before ROUND sees anything." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-12",
      prompt: "The kept-demand census counts bookings that converted — status delivered or shipped — beside the total in one scan. Which aggregate computes the converted count?",
      choices: ["COUNT(status = 'delivered') + COUNT(status = 'shipped')", "COUNT(*) FILTER (WHERE status IN ('delivered', 'shipped'))", "SUM(status)", "COUNT(DISTINCT status)"],
      answer: 1,
      why: "FILTER (WHERE …) branches a single COUNT(*) per condition — one scan, one row, the two funnel stages counted side by side: 52 + 30 = 82 of 103. It is the one-pass shape the ops census is built on.",
      notes: [
        { choice: 0, why: "COUNT(expr) counts non-NULL values, and a bare comparison is not the SQLite shape here — the portable twin is SUM(CASE WHEN … THEN 1 ELSE 0 END), not COUNT with a condition." },
        { choice: 2, why: "SUM over a TEXT status column returns 0.0 — it cannot count rows, and the census would print a constant wearing a count's name." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-13",
      prompt: "The demand spine buckets bookings by month over TEXT timestamps like '2024-08-14 19:03:00'. Which expression builds the '2024-08' bucket?",
      choices: ["strftime('%m', created_at)", "SUBSTR(created_at, 1, 7)", "DATE(created_at, 'month')", "MONTH(created_at)"],
      answer: 1,
      why: "The first seven characters are year plus zero-padded month — 14 buckets from 2024-01 to 2025-02 on this db, and Januarys never merge. '%m' alone is month-only; MONTH() is another dialect.",
      notes: [
        { choice: 0, why: "Right function, wrong mask — '%m' is month-only, so January 2024 and January 2025 collapse into one bucket and the seasonality read becomes fiction." },
        { choice: 3, why: "There is no MONTH() in SQLite — the screen runs on this db, and the dialect mismatch is itself the signal." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-14",
      prompt: "COUNT(shipped_at) returns 82 while COUNT(*) returns 103 on bookings. What is the 21-booking gap?",
      choices: ["Data corruption — 21 bookings are missing rows", "The 14 awaiting-confirmation plus 7 cancelled bookings: they carry no travel-date stamp yet", "Duplicate bookings — shipped_at is NULL on checkout retries", "The 21 bookings whose travel date is today"],
      answer: 1,
      why: "shipped_at is the travel-date stamp, written only when the activity operates — 14 pending and 7 cancelled bookings legitimately have none. COUNT(column) skips NULLs by design; the gap is a population definition, not a bug.",
      notes: [
        { choice: 0, why: "Calling a definitional NULL 'corruption' generates fake cleanup tickets — the pending queue is the instant-confirmation product's workload, not dirt." },
        { choice: 3, why: "Nothing about 'today' NULLs a stamp — operated bookings keep their travel date permanently; the unstamped rows are pending and cancelled." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-15",
      prompt: "The operator review board sorts by rating, but two partners can share a rating. Which ORDER BY makes the print deterministic — biggest rating first, then biggest payout value as tie-breaker?",
      choices: ["ORDER BY rating DESC, payout DESC", "ORDER BY payout DESC, rating DESC", "ORDER BY rating, payout DESC", "ORDER BY rating DESC LIMIT 1"],
      answer: 0,
      why: "The first key is the board's headline — rating — and the second only breaks ties: Alpine's 4.8 leads regardless, and two 4.4s would order by payout. Swapping the keys turns it into the supplier-revenue board and the meeting argues about the wrong ladder.",
      notes: [
        { choice: 1, why: "Same rows, reversed priorities — payout-first ranks Nordic's 11,130.25 above Alpine's 4.8, which is a different board with a different argument." },
        { choice: 2, why: "Ascending rating crowns Pacific's 3.9 — direction is part of the metric's meaning, not presentation." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-16",
      prompt: "An analyst computes lead time as DATE(shipped_at) - DATE(created_at) and gets 0 for every row. Why?",
      choices: ["The bookings genuinely operated same-day", "DATE() returns TEXT, and TEXT minus TEXT in SQLite is numeric subtraction of two non-numeric strings — 0", "shipped_at and created_at are identical columns", "SQLite cannot subtract dates without an extension"],
      answer: 1,
      why: "DATE() emits TEXT like '2024-08-14'; the - operator coerces both strings to numbers, fails, and lands on 0. The clock is julianday(shipped_at) - julianday(created_at) — the 2.98-day average over the 82 stamped bookings is built on it.",
      notes: [
        { choice: 0, why: "A zero lead time would be the instant-confirmation dream, not this db — the real spread is 2 to 4 days, and a flat zero is the arithmetic lying, not the ops story." },
        { choice: 2, why: "The columns differ by definition — one opens the booking, one stamps the travel date; identical columns would make the funnel unreadable." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-17",
      prompt: "The month spine's first delta — January 2024, 3,731.97 booked — prints NULL under SUM(total) - LAG(SUM(total)) OVER (ORDER BY month). The dashboard coalesces it to 0. What did that hide?",
      choices: ["Nothing — NULL and 0 mean the same thing in a delta", "That January 2024 is the baseline: no prior month exists to subtract, and 0 reads as 'measured, flat'", "A pipeline bug — the LAG needs a PARTITION BY", "That January had zero bookings"],
      answer: 1,
      why: "The first row's prior value does not exist; LAG returns NULL by definition, and zero-filling invents a measurement. Report the NULL or label the row 'baseline' — a 0 tells the board January was flat, which is a claim the spine never made.",
      notes: [
        { choice: 0, why: "NULL is 'not measured'; 0 is 'measured, no change'. The board reads the second, and trust in the chart dies the first time someone checks the raw table." },
        { choice: 2, why: "PARTITION BY would split the spine into per-group walks — an orthogonal failure, not this one; the first row of any LAG walk is NULL by design." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-18",
      prompt: "Which travelers booked something but never completed an experience? The set-algebra answer is:",
      choices: ["SELECT customer_id FROM orders WHERE status != 'delivered'", "SELECT customer_id FROM orders EXCEPT SELECT customer_id FROM orders WHERE status = 'delivered'", "SELECT customer_id FROM orders INTERSECT SELECT customer_id FROM orders WHERE status = 'delivered'", "SELECT customer_id FROM orders UNION SELECT customer_id FROM orders WHERE status = 'delivered'"],
      answer: 1,
      why: "EXCEPT keeps the left set's rows absent from the right: every booking-carrying traveler minus the completed ones — the exact whitespace read. Choice 0 lists bookings, not travelers: a customer who cancelled once but also completed still appears, which is the wrong population.",
      notes: [
        { choice: 2, why: "INTERSECT is the opposite read — the travelers who DID complete, the complement of what the trust pod asked for." },
        { choice: 3, why: "UNION merges both sets into 'everyone who booked', deduplicating the very distinction the question draws." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-19",
      prompt: "Retried checkouts created duplicate booking intents — same traveler, same activity, minutes apart. The funnel must count keep-latest. Which window does it?",
      choices: ["ROW_NUMBER() OVER (PARTITION BY customer_id, product_id ORDER BY created_at DESC), keep rn = 1", "RANK() OVER (ORDER BY created_at), keep rn = 1", "ROW_NUMBER() OVER (ORDER BY created_at), keep rn = 1", "DENSE_RANK() OVER (PARTITION BY product_id), keep rn = 1"],
      answer: 0,
      why: "The partition is the intent's natural key — traveler × activity — and ordering newest-first makes row 1 the keeper; the rest are the retries the funnel deletes. Without the PARTITION BY the numbering runs across all bookings and every traveler but the very latest vanishes.",
      notes: [
        { choice: 1, why: "RANK ties simultaneous retries together — two attempts in the same second share rank 1 and the 'dedupe' keeps both, which is no dedupe at all." },
        { choice: 2, why: "One global rank keeps exactly one booking on the whole db — 103 becomes 1 and the funnel collapses to a single row." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-20",
      prompt: "The catalog board wants each operator's activities as one readable cell — 'Mechanical Keyboard K1 | 4K Webcam Pro | Smart Watch S'. Which aggregate builds it?",
      choices: ["CONCAT(p.name, ' | ')", "GROUP_CONCAT(p.name, ' | ')", "STRING_AGG(DISTINCT p.name)", "SUM(p.name)"],
      answer: 1,
      why: "GROUP_CONCAT folds the joined listing rows back to one cell per operator with ' | ' as the separator — Nordic's three listings in one read. It is SQLite's workhorse for exactly this board-cell shape.",
      notes: [
        { choice: 0, why: "CONCAT concatenates values on a single row — there is no such aggregate in SQLite, so the fold either fails or silently returns one arbitrary activity per operator." },
        { choice: 2, why: "STRING_AGG is another engine's name; this db speaks GROUP_CONCAT, and its DISTINCT form does not take a separator that way." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-21",
      prompt: "The supply-coverage table must print every activity family — including families with zero bookings this quarter. What keeps the empty rows on the board?",
      choices: ["INNER JOIN products to order_items and filter the zero counts", "LEFT JOIN from the activity side and read the count off the NULL payload", "WHERE COUNT(*) > 0 on the joined rows", "UNION a hand-written zero row for each missing family"],
      answer: 1,
      why: "LEFT JOIN from the dimension keeps unmatched activities with a NULL payload; COUNT(oi.id) reads 0 for them and the board shows the hole instead of silently omitting it. INNER JOIN deletes the empty families — the coverage map lies by omission.",
      notes: [
        { choice: 2, why: "COUNT does not exist at WHERE time, and filtering groups to non-zero is exactly the omission the board forbids — it is the bug wearing a clause." },
        { choice: 3, why: "Hand-unioned zero rows drift from the data the moment a family is added or renamed — the join is the honest generator of empty buckets." },
      ],
      difficulty: "easy",
    },
    {
      id: "getyourguide-mcq-22",
      prompt: "The demand review wants each market's share of the 34,833.28 book beside its own value, in one query. Which expression computes EU's share on EU's row?",
      choices: ["100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER ()", "100.0 * SUM(o.total) / 34833.28", "100.0 * o.total / SUM(o.total)", "SUM(100.0 * o.total / SUM(o.total)) OVER ()"],
      answer: 0,
      why: "Window functions run after GROUP BY, so SUM(SUM(o.total)) OVER () folds the per-market sums into the grand total in the same pass — EU reads 15,089.23 against 34,833.28, a 43.3% share with no second query.",
      notes: [
        { choice: 1, why: "Hard-coding the total works until the db changes; the window recomputes the denominator, so the read survives new bookings and re-cuts." },
        { choice: 2, why: "o.total is a booking-row value — bare inside GROUP BY region it is ambiguous, and the ratio's grain collapses from market to booking without a fold." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-23",
      prompt: "Flag travelers with at least one cancelled booking. EXISTS or IN — and why does the panel prefer one?",
      choices: ["IN — EXISTS cannot test a related table", "EXISTS — it stops at the first matching row and never materializes a list, so no NULL can poison it", "They compile to the same plan and differ only in speed", "Neither — only LEFT JOIN with IS NULL is correct"],
      answer: 1,
      why: "EXISTS asks 'does at least one cancelled booking exist for this traveler' and short-circuits on the first match. IN materializes the id list first — identical on the clean core db, but the NOT IN twin is the NULL trap: one NULL in a staging list empties the whole report silently.",
      notes: [
        { choice: 2, why: "Plans differ by engine and version; the durable difference is the semantics under NULLs, which is exactly what the follow-up probes." },
        { choice: 3, why: "LEFT JOIN + IS NULL is a correct third form — 'neither' overstates it; it just costs a fold and needs the NULL payload read named." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-24",
      prompt: "The loyalty pod wants travelers split into four lifetime-value quartiles — equal-count tiles, biggest spender first. Which window builds the tier?",
      choices: ["NTILE(4) OVER (ORDER BY lifetime_value DESC)", "ROUND(100.0 * RANK() OVER (ORDER BY lifetime_value) / COUNT(*))", "QUARTILE(lifetime_value, 4)", "CASE WHEN lifetime_value > AVG(lifetime_value) THEN 'top' ELSE 'rest' END"],
      answer: 0,
      why: "NTILE(4) divides the ordered population into four equal-count buckets — 16 travelers, four per tile, Alice Chen opening tile 1 — and the tile number IS the tier. SQLite has no QUARTILE, and the rank-percentage variant drifts at ties.",
      notes: [
        { choice: 1, why: "Percentile-of-rank is a different cut: a tie at rank 6 shifts every later traveler's tile, and the CRM imports tiles, not near-tiles." },
        { choice: 3, why: "Above-average flags make two buckets, not four — and the average moves with every booking, so the tier is not stable enough to segment on." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-25",
      prompt: "The summer-season read uses BETWEEN '2024-07-01' AND '2024-09-30' on TEXT timestamps. Which bookings silently vanish?",
      choices: ["Bookings placed on any July day", "Bookings placed on September 30 after midnight — timestamps like '2024-09-30 14:22:00' sort past the cutoff", "Bookings from August only", "None — BETWEEN is inclusive on both ends and matches everything"],
      answer: 1,
      why: "created_at strings carry a time component, so '2024-09-30 14:22:00' > '2024-09-30' and falls outside BETWEEN — the season's last day evaporates. The half-open range — >= '2024-07-01' AND < '2024-10-01' — keeps every September 30 second.",
      notes: [
        { choice: 0, why: "July 1 bookings are the inclusive start — BETWEEN keeps '2024-07-01 00:00:00'; the failure is only at the end boundary." },
        { choice: 3, why: "Inclusive both ends is exactly the trap: the end comparison is string-greater-than, and every same-day timestamp loses." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-26",
      prompt: "Average per-participant price per activity family: SUM(oi.unit_price * oi.quantity) / SUM(oi.quantity) prints a whole number. What is the fix?",
      choices: ["Wrap the whole ratio in ROUND(..., 2)", "Promote one operand: SUM(oi.quantity) * 1.0 — one REAL operand forces real division", "Use AVG(oi.unit_price) instead", "Multiply by 100, round, and divide back"],
      answer: 1,
      why: "Both SUMs are INTEGER aggregates, so the division is integer division and the decimals are gone before any ROUND sees them. One ×1.0 promotes the arithmetic; AVG(unit_price) is a different metric — the unweighted mean of line prices, not the per-participant read.",
      notes: [
        { choice: 0, why: "ROUND happens after the truncation — it can only dress up the wrong number with decimals it never had." },
        { choice: 2, why: "AVG prices every line equally; the weighted read divides by participants — two different averages the supply board argues about." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-27",
      prompt: "The funnel read stages the kept-demand filter (status IN ('delivered', 'shipped')) in a CTE, folds to travelers, then joins city. A reviewer asks why. Answer?",
      choices: ["CTEs run faster than WHERE clauses", "The CTE names the population — 'kept bookings' — so the join reads against a defined set and the status rule is tested in exactly one place", "SQLite requires a CTE for any join after GROUP BY", "The CTE caches the table so later edits cannot change the result"],
      answer: 1,
      why: "A CTE is a named, reviewable population: the status rule lives on one line, the fold and the join build on it, and a policy change edits one place. It is correctness hygiene — not performance, and not a syntax requirement.",
      notes: [
        { choice: 0, why: "The optimizer may inline the CTE entirely — performance was never the argument, and claiming it invites the follow-up you cannot win." },
        { choice: 2, why: "Nothing requires it — the win is that the reviewer reads the definition before the joins, which is how the number survives review." },
      ],
      difficulty: "medium",
    },
    {
      id: "getyourguide-mcq-28",
      prompt: "A board stacks the status census over the market census with UNION. Branch one selects status, bookings; branch two selects region, bookings, share. The query errors immediately. Why?",
      choices: ["UNION branches must return the same number of columns — 2 versus 3 cannot stack", "The branches must read different tables", "UNION needs a shared ORDER BY to compile", "status and region are both TEXT, so UNION refuses the mix"],
      answer: 0,
      why: "UNION stacks rows positionally — same column count, compatible types, per branch. Three columns over two is a compile-time error, which is the loud failure mode; the silent one is UNION deduping byte-identical rows across branches.",
      notes: [
        { choice: 1, why: "Reading the same table twice is fine — the shapes must align, not the sources." },
        { choice: 3, why: "TEXT aligns with TEXT; the contract that broke is the column COUNT, and the engine says so at compile time." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-29",
      prompt: "Flag bookings above THEIR market's average value — not the platform's 338.19 bar. Which form is correct?",
      choices: ["WHERE total > (SELECT AVG(total) FROM orders) — one bar for everyone", "A correlated subquery keyed on the outer market: WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 JOIN customers c2 ON c2.id = o2.customer_id WHERE c2.region = c.region)", "A HAVING clause comparing total to AVG(total)", "A window: total > AVG(total) OVER ()"],
      answer: 1,
      why: "The bar moves per market, so the comparison must re-fold the market's bookings for each outer row — the correlated shape. The scalar form answers 'above platform average' and quietly mislabels LATAM, whose 426.22 market average sits above the platform bar.",
      notes: [
        { choice: 2, why: "HAVING judges groups after folding — a per-booking comparison cannot live there; it needs one row per booking to survive." },
        { choice: 3, why: "AVG(total) OVER () is the platform bar computed as a window — the partition is what is missing; OVER (PARTITION BY region) would fix it." },
      ],
      difficulty: "hard",
    },
    {
      id: "getyourguide-mcq-30",
      prompt: "The ops census computes SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) and three siblings in one pass. What makes the four cells a proof, not just numbers?",
      choices: ["They are computed in four separate queries and compared", "The four cells reconcile against COUNT(*) — 52 + 30 + 14 + 7 = 103 — because ordered, non-overlapping arms put every booking in exactly one bucket", "SUM(CASE) is faster than FILTER", "The CASE arms can overlap as long as the total looks right"],
      answer: 1,
      why: "The census is exhaustive by construction: ordered, non-overlapping arms and a reconciliation identity against COUNT(*) — 52 + 30 + 14 + 7 = 103. An overlapping WHEN steals a row from a later arm and breaks the identity; a hole leaves a booking uncounted and COUNT(*) catches it.",
      notes: [
        { choice: 0, why: "Four queries are four chances to drift — the one-pass form exists precisely so the cells share one scan and one denominator." },
        { choice: 3, why: "Overlapping arms double-count, and 'the total looks right' is exactly the state you can no longer trust once an arm overlaps — the identity is the guard, not the eyeball." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-getyourguide-1",
      tier: "easy",
      topic: "j7",
      universe: "supplier",
      title: "The operator payout census",
      brief:
        "GetYourGuide-flavored brief on the storefront db: the supply pod's Monday payout review opens with the operator census — settled revenue per supply partner, activities listed, and the review rating that gates the premium shelf. Probed facts: Nordic Gadgets AB leads at 11,130.25 from 3 activities at a 4.6 rating (32% of supply revenue); Midwest Hardware Co follows at 9,294.93 from 3 at 4.4; Alpine Audio GmbH is the quality crown at 4.8 (4,765.63 from just 2 activities); the tail reads Shenzhen Electro 3,049.07 and Pacific Textiles 2,980.15 at a 3.9. The review reads biggest payout value first.",
      ask: "Return each supply partner with its distinct activity count, review rating and payout value to 2 decimals, biggest payout value first.",
      template:
        "SELECT s.name AS operator,\n       COUNT({1} p.id) AS activities,\n       s.rating AS rating,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS payout_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = {3}\nGROUP BY s.name\nORDER BY payout_value {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the activity deduplicator",
          why: "COUNT(DISTINCT p.id) folds participant lines back to distinct activities: Nordic reads 3, Alpine 2 — the listings census exactly. SUM(p.id) or a bare 1 inside COUNT will not even parse; the arithmetic lives in the payout column, not the census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the payout precision",
          why: "Payouts move in cents: ROUND(…, 2) prints Nordic's 11,130.25. At 1 decimal the print becomes 11,130.3 and the cents fall off the wire — while the activities cells (2 for Alpine and Andes) are where the 2 also shows up in the result.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the line-to-activity key",
          why: "The participant-line table joins to activities on product_id. Matching oi.product_id = s.id marries line items to supplier id codes instead — a join that still returns rows but folds the wrong grain, and the payout census stops reconciling with the operator revenue table.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-payout-first direction",
          why: "The review reads biggest payout on top: Nordic 11,130.25 down to Pacific 2,980.15. ASC opens the meeting at the tail of the supply bench — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "1", "s.id", "ASC"],
      walkthrough:
        "Three tables, one fold, two grains. The join chain runs partners → their activities → the participant lines booked against them, and GROUP BY partner folds 251 lines into six payout rows. COUNT(DISTINCT p.id) reads listings (Nordic 3, Alpine 2), s.rating rides along unaggregated, and ROUND(SUM(oi.quantity * oi.unit_price), 2) reads the payout: Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15 — the operator revenue table the supply pod quotes, rebuilt. Quantity × unit_price is the per-participant read: dropping quantity would count bookings, not travelers served. The distractors fail honestly: SUM or 1 inside COUNT will not parse; 1 in the ROUND slot prints one decimal and the cents fall off the wire; s.id in the join slot matches lines to supplier id codes — rows return, the fold lies; ASC opens the review on Pacific's 2,980.15. The pairing to narrate: Nordic's 3-activity 11,130.25 book (32% of supply revenue) against Alpine's 2-activity 4,765.63 at a 4.8 rating — revenue concentration and quality live in the same two logos.",
      },
    {
      id: "cs-getyourguide-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The traveler value ladder",
      brief:
        "GetYourGuide-flavored brief on the storefront db: the loyalty board wants the traveler value ladder — bookings, lifetime value and a spend rank — cut to the core-repeat gate of 3+ bookings, with tied travelers sharing a rung under the published RANK policy. Probed facts: Alice Chen leads at 24 bookings and 7,262.35, Emma Wilson follows at 17 and 6,640.56, then Grace Kim at 14 (4,574.23) and Maya Patel at 13 (3,644.56); four travelers sit tied at 4 bookings (Pedro Alvarez 1,686.17 topmost of them), and the two 3-booking travelers — Farid Nasser 1,458.97 and Hiro Tanaka 829.09 — inherit rank 10 after the tie consumes ranks 6 through 9.",
      ask: "Return each traveler with 3+ bookings, their booking count, lifetime value to 2 decimals and RANK over booking count, biggest first.",
      template:
        "SELECT c.name AS traveler,\n       COUNT(*) AS bookings,\n       ROUND(SUM(o.total), 2) AS lifetime_value,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS spend_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY bookings DESC, lifetime_value DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "RANK shares rungs and then skips: the four 4-booking travelers share rank 6 and the two 3-booking travelers land on 10 — the published tie policy. DENSE_RANK prints 7 and erases the gap; ROW_NUMBER splits the tie arbitrarily; SUM() with no argument will not parse.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The ladder descends — the biggest booking count takes rank 1. ASC crowns the two 3-booking travelers and reads the loyalty base upside down; the ORDER BY inside OVER drives the ranking, not the outer sort.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the core-repeat gate",
          why: "The core-repeat gate is 3+ bookings: eleven of sixteen travelers clear it. Raising it to 4 silently deletes the two rank-10 rows — the shared rung this board is arguing about; lowering it to 2 reads three more travelers into the ladder.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "SUM", "ASC", "4"],
      walkthrough:
        "One fold, one window, one gate. The join attaches bookings to travelers, GROUP BY c.id folds 103 bookings into per-traveler rows, HAVING COUNT(*) >= 3 keeps the eleven core-repeat travelers, and RANK() OVER (ORDER BY COUNT(*) DESC) stamps the ladder: Alice Chen 24 bookings at rank 1, Emma Wilson 17 at rank 2, then 14, 13 and 5, the four-way tie at 4 sharing rank 6, and the two 3-booking travelers landing on rank 10 — RANK skips the ranks the tie consumed, which is the published policy. Lifetime value rides along: 7,262.35, 6,640.56, 4,574.23, 3,644.56, and Pedro Alvarez's 1,686.17 atop the tie block. The distractors each break differently: DENSE_RANK hands the 3-booking travelers rank 7 and hides the gap the tie policy exists to show; ROW_NUMBER splits the four-way tie into 6, 7, 8, 9 — an arbitrary pecking order among peer travelers; SUM() takes no argument and the window will not parse; ASC ranks the smallest book first; raising the gate to 4 deletes the two rank-10 rows whose shared rung is the whole argument. The read to narrate: concentration again — ranks 1–4 book 68 of the 103 bookings, so the loyalty spend follows four logos.",
    },
    {
      id: "cs-getyourguide-3",
      tier: "medium",
      topic: "s6",
      universe: "funnel",
      title: "The market cancellation slices",
      brief:
        "GetYourGuide-flavored brief on the storefront db: the trust pod's monthly read slices the cancellation book by source market — 7 of 103 bookings cancelled overall, but the share is the story, and shares are denominators. Probed facts: EU carries 45 bookings with 3 cancelled (6.7%), APAC 37 with 3 (8.1%), US 19 with 1 (5.3%), LATAM 2 with none (0.0) — APAC runs the highest share despite tying EU on raw cancellations, which is why the count column rides beside the rate. The read joins bookings to travelers for the market, folds with a CASE flag per row, and computes the percentage with the 100.0-first discipline so integer division cannot flatten it.",
      ask: "Return each market with its booking count, cancelled count, and cancellation share to 1 decimal, biggest market first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS bookings,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS cancelled,\n       ROUND(100.0 * SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) / {2}(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY bookings {3};",
      slots: [
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancellation flag",
          why: "The CASE arm tests the exact status string 'cancelled' — 3 EU, 3 APAC, 1 US bookings carry it. Flagging 'pending' instead reads the 14 awaiting-confirmation rows into the count and the trust report indicts the confirmation queue, not the cancellation policy.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the denominator counter",
          why: "COUNT(*) counts every booking row folded into the market — the 45, 37, 19, 2 denominators the share divides by. SUM(*) will not even parse: the denominator is a count of rows, and the grammar says so.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-market-first direction",
          why: "The read opens on the load grain: EU 45, APAC 37, US 19, LATAM 2. ASC leads with LATAM's 2 bookings — a correct query answering the board upside down.",
        },
      ],
      distractors: ["'pending'", "SUM", "ASC", "'delivered'"],
      walkthrough:
        "A ratio with its denominator printed beside it. The join attaches each booking to its traveler's market; GROUP BY region folds 103 bookings into four rows; the CASE turns 'cancelled' into a 1 and everything else into a 0, and SUM adds the flags — 3, 3, 1, 0. The share is computed with 100.0 first, so real division runs before the ROUND: EU reads 6.7 and APAC 8.1 instead of the flat 6 the integer version prints — the truncation bug this db's integer column layout invites. The board's argument lives in the two grains: EU and APAC tie on raw cancellations at 3 each, but APAC's smaller base makes it the risk market, which is why cancel_pct exists beside the count. ORDER BY bookings DESC keeps the load grain on top and LATAM's zero prints honestly — 0.0 is a measurement, not a missing row.",
    },
    {
      id: "cs-getyourguide-4",
      tier: "medium",
      topic: "q5",
      universe: "month-close",
      title: "The payout coverage ledger",
      brief:
        "Month-close brief, in-world: before the payout run ships, the settlements pod classifies every operator invoice by coverage — 'exact' (settled in full), 'partial' (money in, short), 'never collected' (no settlement rows at all). Probed on the storefront db: 28 invoices split 21 exact (65,612.00), 6 never-collected (15,217.00) and exactly 1 partial (6,148.00 billed, 4,000.00 settled); the anomalies ride inside the classes — void-but-settled #11 (925.00) and paid-status #28 (1,756.00) with zero legs. Amounts live as INTEGER cents, and the ledger prints dollars through the /100.0 read — the cents discipline the trial balance depends on.",
      ask: "Return one row per coverage class: the class label, invoice count, and billed total in dollars to 2 decimals, biggest billed first.",
      template:
        "SELECT coverage,\n       COUNT(*) AS invoices,\n       ROUND(SUM(billed_cents) / {1}, 2) AS billed\nFROM (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         CASE\n           WHEN {2}(p.id) = 0 THEN 'never collected'\n           WHEN {3}(p.amount_cents) = i.amount_cents THEN 'exact'\n           ELSE 'partial'\n         END AS coverage\n  FROM invoices i\n  {4} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nGROUP BY coverage\nORDER BY billed DESC;",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "Dividing INTEGER cents by 100.0 forces REAL arithmetic — 65,612.00 prints in full. A wrong divisor scales the whole ledger: 1000 reads the book at a tenth, and an INTEGER 100 truncates inside the fold, drifting short on every odd-cent invoice.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the no-legs detector",
          why: "COUNT(p.id) = 0 is the only test that reads a NULL payload as 'no settlement rows' — the 6 never-collected invoices, #28 among them. SUM(p.id) over that payload returns NULL, the equality never fires, and the whole class silently empties.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the settled-cents adder",
          why: "SUM(p.amount_cents) folds each invoice's settlement legs to a total — split settlements pay in two rows and must add up before the equality test can call them 'exact'. COUNT(p.amount_cents) counts legs, not cents, and can never equal the bill.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the invoice-preserving join",
          why: "LEFT JOIN keeps all 28 invoices, handing the 6 with no payments a NULL payload the CASE is built to catch. INNER JOIN deletes those 6 rows before classification — the ledger reports a clean book while 15,217.00 sits uncollected.",
        },
      ],
      distractors: ["1000", "INNER", "AVG"],
      walkthrough:
        "Two folds, one ledger. The derived table works at invoice grain: LEFT JOIN keeps all 28 invoices — the 6 with no settlement legs arrive with a NULL payload that COUNT(p.id) = 0 catches, and SUM(p.amount_cents) folds the split settlements (#1, #5, #12, #19, #22) to their totals so the equality test can call 21 of them 'exact'. The outer fold groups the classes: exact 21 invoices worth 65,612.00, never collected 6 worth 15,217.00, partial exactly 1 — 6,148.00 billed, 4,000.00 settled. The 100.0 division prints dollars without losing cents, which matters because the ledger trial balance must read 181,080 against 181,080 before payouts ship. Swap LEFT for INNER and the six never-collected rows — anomaly #28 among them — vanish before any CASE can classify them; swap SUM for AVG and the equality test compares an average to a bill, and every exact settlement rebrands itself.",
    },
    {
      id: "cs-getyourguide-5",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The demand month walk",
      brief:
        "Growth brief, in-world: the seasonal deck walks booked value along the 14-month spine (2024-01 to 2025-02) with a step delta per month — no folklore, the numbers name the shape. Probed on the storefront db: the spine opens at 3,731.97 in January 2024, falls to the 1,193.86 July trough, rebounds +1,158.21 into August, and closes at 2,390.53 in February 2025 (delta +721.03); the sharpest drop is -1,326.87 into November. The walk is LAG over a month-ordered fold — and the first row has no prior month, so its delta is NULL by definition, labeled baseline on the deck.",
      ask: "Return month, booked value to 2 decimals, and the step delta versus the prior month to 2 decimals, oldest month first.",
      template:
        "SELECT SUBSTR(o.created_at, 1, 7) AS month,\n       ROUND(SUM(o.total), 2) AS booked,\n       ROUND(SUM(o.total) - {1}(SUM(o.total)) OVER (ORDER BY SUBSTR(o.created_at, 1, 7)), {2}) AS delta\nFROM orders o\nGROUP BY month\nORDER BY month {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month lookup",
          why: "LAG(SUM(total)) OVER (ORDER BY month) drags each month's predecessor onto its row, so the subtraction prints the step: -1,326.87 into November, +1,158.21 into August. LEAD fetches the FOLLOWING month and every sign flips — the same 14 numbers telling the opposite story.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the money precision",
          why: "Money moves in cents, so the delta rounds to 2: +721.03 prints exactly and the steps foot against the booked column. At 0 decimals the cents vanish and the walk no longer reconciles with the totals it is built from.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first direction",
          why: "A time walk reads oldest to newest: January 2024's NULL baseline first, February 2025's +721.03 last. DESC opens the deck on the latest month — a correct query aimed at the wrong end of the season.",
        },
      ],
      distractors: ["LEAD", "0", "DESC"],
      walkthrough:
        "The spine, then the steps. SUBSTR(created_at, 1, 7) buckets 103 bookings into 14 months — year plus zero-padded month, so January 2024 and January 2025 stay apart; SUM(total) folds each bucket to booked value, 3,731.97 opening, 1,193.86 at the July trough, 2,390.53 closing. LAG(SUM(total)) OVER (ORDER BY month) puts the prior month on every row and the subtraction prints the step: the -1,326.87 cliff into November and the +1,158.21 rebound into August are the two moments the demand call narrates. The first row's delta is NULL because no prior month exists — the deck labels it baseline rather than zero-filling it into a flat January. LEAD instead of LAG flips every sign, DESC walks time backwards, and rounding the delta to 0 decimals silently breaks its footing with the booked column it subtracts from.",
    },
    {
      id: "cs-getyourguide-6",
      tier: "easy",
      topic: "x1",
      universe: "catalog",
      title: "The activity catalog board",
      brief:
        "Catalog brief, in-world: the supply pod's listing review reads the whole activity shelf on one board — each operator beside its review rating and its activities folded into one readable cell. Probed on the storefront db: 6 operators carry 16 bookable activities; Alpine Audio GmbH tops the rating bench at 4.8 with 2 listings, Nordic Gadgets AB follows at 4.6 with 3 ('Mechanical Keyboard K1 | 4K Webcam Pro | Smart Watch S'), and Pacific Textiles trails at 3.9 with 3. The board's shape is one row per operator, not 16 listing rows — GROUP_CONCAT is the fold that makes it readable.",
      ask: "Return each operator with its review rating, its activity names folded into one ' | '-separated cell, and its distinct activity count, highest rating first.",
      template:
        "SELECT s.name AS operator,\n       s.rating AS rating,\n       {1}(p.name, ' | ') AS listings,\n       {2}(DISTINCT p.id) AS activities\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nGROUP BY s.id\nORDER BY rating {3};",
      slots: [
        {
          answer: "GROUP_CONCAT",
          kind: "keyword",
          label: "the listing fold",
          why: "GROUP_CONCAT(p.name, ' | ') folds each operator's joined listing rows into one board cell — Nordic's three activities read as a shelf, not a row dump. CONCAT is not a SQLite aggregate: the fold fails outright, and the board never prints.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the distinct listing counter",
          why: "COUNT(DISTINCT p.id) prints the census beside the cell — 3 for Nordic, 2 for Alpine and Andes. SUM(DISTINCT p.id) adds id codes and returns a number that changes if a listing is re-registered: an id sum wearing a count's name.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-rating-first direction",
          why: "The review opens at the quality crown: Alpine 4.8, Nordic 4.6, down to Pacific 3.9 — the premium-shelf read. ASC leads with the weakest rating, which is the dunning meeting, not the listing review.",
        },
      ],
      distractors: ["CONCAT", "SUM", "ASC"],
      walkthrough:
        "One row per operator, listings folded, rating on top. The join walks partners to their bookable activities — 16 listing rows — and GROUP BY s.id folds them back to six operators. GROUP_CONCAT(p.name, ' | ') is the readable fold: Nordic's three listings land in one cell, and COUNT(DISTINCT p.id) prints the census beside it — 3 for Nordic, Midwest, Shenzhen and Pacific, 2 for Alpine and Andes. s.rating rides along unaggregated, and ORDER BY rating DESC opens the review at Alpine's 4.8 and closes at Pacific's 3.9. The distractors fail honestly: CONCAT has no aggregate meaning in SQLite so the fold errors out; SUM(DISTINCT p.id) prints an id total that shifts with re-registration; ASC ranks the bench upside down — a correct query aimed at the wrong end of the meeting.",
    },
  ],

  problems: [
    { slug: "confirmation-rate", why: "The instant-confirmation read: share of bookings confirmed at checkout versus parked awaiting supplier confirmation. This is GetYourGuide's flagship product metric, and this problem drills the join + conditional-rate shape it is computed with." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of travelers reaching the operated milestone (travel date stamped) out of all bookers — a distinct-count share with the denominator stated, the funnel's weekly pulse." },
    { slug: "trips-and-users", why: "Cancellations per market against booking totals, with the denominator printed: 7 of 103 cancelled overall, APAC 8.1% versus US 5.3%. The cancellation-share screen, exactly this shape." },
    { slug: "top-travellers", why: "The traveler value ladder by lifetime spend — Alice Chen's 24 bookings worth 7,262.35 on top. The loyalty board's headline table is literally this ranking." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-total capacity gates: capped tours sell out, and the cumulative-bookings-versus-capacity scan is how overbook risk gets caught before the travel date." },
    { slug: "median-time-to-convert", why: "Checkout-to-confirmation latency distributions: means get dragged by slow supplier-confirmation tails, so the funnel clock is a median. This problem drills the percentile emulation." },
    { slug: "keep-latest-dedupe", why: "Retried checkout attempts create duplicate booking intents; funnel counts are computed on keep-latest deduped events. This problem is the dedupe step every GetYourGuide funnel read runs first." },
    { slug: "the-most-recent-three-orders", why: "Each traveler's next three upcoming bookings — the 'your trip ahead' queue that drives reminder emails and the ops staffing plan. Top-N-per-group windows at practice scale." },
    { slug: "game-play-analysis-iv", why: "Share of travelers whose second booking follows the first within the window — early-repeat behavior, the demand flywheel read the growth team watches after every campaign." },
    { slug: "students-and-examinations", why: "Market × activity-family coverage: every traveler market crossed with every booked activity family, zeros included. The supply-coverage cross-tab the city teams read quarterly." },
    { slug: "product-price-at-a-given-date", why: "The price an activity carried AT checkout — as-of pricing when rate plans change mid-season. Windows with date logic resolve what the traveler actually saw." },
    { slug: "queries-quality-and-percentage", why: "Review-quality percentage per supply partner: rating ratios with zero and NULL guards. The operator scorecard divides two folds of the same rows, exactly this shape." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Cross-sell paths: travelers who booked the food tour AND the bike tour but never the pub crawl. Sequencing reads like this feed the recommendation pod." },
    { slug: "rolling-7d-actives", why: "The rolling 7-day booked-traveler pulse: city ops staffs against the rolling window, not calendar weeks. Trailing-window aggregation is the exact drill." },
    { slug: "null-blank-audit", why: "Listing hygiene before any coverage join: a NULL review score or blank city field silently drops a partner from the map. Audit-first is the settlements pod's standing rule." },
    { slug: "trial-balance-check", why: "The payout-run gate: ledger debits 181,080 against credits 181,080, delta zero, before operator payouts ship. Conditional SUM over the ledger, one pass." },
    { slug: "returns-rate-by-category", why: "Cancellation share by activity family — the trust pod's category cut of the 7-of-103 cancellation base. Conditional rates over category folds, exactly this shape." },
    { slug: "the-number-of-passengers-in-each-bus-i", why: "Capped departures fill by booking order: cumulative participants against capacity is the overbook check — food tours and buses fill the same way." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Browse-but-never-book travelers are the checkout funnel's leak — the view-to-booking anti-join the demand pod reviews weekly." },
    { slug: "customers-who-bought-all-products", why: "Travelers covering EVERY activity family are the superusers the loyalty board hunts — coverage-intersection folds, exactly this shape." },
    { slug: "restaurant-growth", why: "City ops staffs against the rolling 7-day booked-traveler average, not calendar weeks. The moving-average-over-a-date-spine drill, GetYourGuide flavor." },
    { slug: "market-analysis-ii", why: "Travelers new in one season who rebooked the next — the year-over-year new-cohort read behind the demand team's growth claims." },
    { slug: "friday-purchases-i", why: "Checkout volume stacks toward the weekend on an activities marketplace — the purchase-day curve is the staffing pulse before the weekend departures." },
    { slug: "sales-by-day-of-the-week", why: "Bookings by weekday, zeros included: the weekly census the city teams cross-read against tour departures and guide shifts." },
    { slug: "second-most-recent-activity", why: "Each traveler's penultimate booking anchors the 'you recently booked' slot — second-most-recent-per-group is the exact window shape." },
    { slug: "activity-participants", why: "Participant lines outnumber bookings 251 to 103 — headcount per activity is the two-grain census (bookings beside participants served) this problem drills." },
    { slug: "find-peak-calling-hours-for-each-city", why: "Peak booking hours per city drive the reminder-email send windows — time-of-day buckets over a join, the exact shape." },
    { slug: "ar-aging-schedule", why: "Operator settlements age into buckets before the payout run: current, 30, 60, 90-plus over net-30 terms. The AR-aging CASE ladder, cents-safe." },
    { slug: "duplicate-charge-pairs", why: "Retried settlement legs create duplicate payouts — spotting paired charge rows is the settlements pod's anomaly walk before any money moves." },
    { slug: "prepayment-detection", why: "Money-in-before-travel is the instant-confirmation promise's cash shadow: detecting payments ahead of the travel-date stamp is this problem's fold." },
    { slug: "find-churn-risk-customers", why: "Travelers with no booking since their last trip's window churn silently — the absence read that feeds the winback queue." },
    { slug: "ltv-cac-payback", why: "Marketing spend against lifetime booking value by traveler — the payback read that decides how hard growth can push a source market." },
  ],
};
