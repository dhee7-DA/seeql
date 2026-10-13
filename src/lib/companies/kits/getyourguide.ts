// GetYourGuide — Wave-8 (Task 96), travel domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Activities-marketplace SQL: the storefront db read as a booking sandbox — customers are
// travelers (16 cities, one account each), orders are bookings (delivered = completed
// experience, shipped = operated with shipped_at as the travel-date stamp, pending =
// awaiting supplier confirmation, cancelled = cancelled per policy), order_items are the
// participant lines (quantity = participants, unit_price = per-participant price),
// products = bookable activities, suppliers = supply partners carrying review ratings,
// invoices/payments = the settlement books in INTEGER cents. Pool provenance:
// company-pools.md carries NO GetYourGuide section (0 tagged rows), so all 10 topic slug
// sets and all 16 problems are theme-curated from the pools file's theme menu and say so.
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
    "Preparation strategy: the pools file carries no GetYourGuide section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: funnel conversion, two-grain censuses, tie-heavy traveler ladders, CASE-banded cancellation slices and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {sky:operator payout census} the supply pod opens Monday with, the other rebuilds the {violet:traveler value ladder} the loyalty board reads quarterly. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i"],
    },
    {
      name: "Two-grain market censuses",
      why: "Bookings and travelers are different grains of the same join, and every market census here reports both: EU runs 45 bookings from 8 travelers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining travelers to bookings",
      why: "Travelers carry city and market; bookings inherit them through joins, and the join type decides who survives. A booking without a traveler is corruption; a traveler without a booking is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Lead-time & latency math",
      why: "The travel-date stamp makes lead time a first-class metric: booking to operation averages 2.98 days over the 82 stamped bookings, range 2–4. Every latency read is a julianday delta with a stated population — and the 21 unstamped rows are a definition, not a filter accident.",
      slugs: ["average-time-of-process-per-machine", "immediate-food-delivery-ii", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Operator leaderboards",
      why: "Supply reviews rank partners by payout value and review rating, where the ladder runs 11,130.25 down to 2,980.15 and the 4.5-plus bench holds exactly two logos. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer operators, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Seasonality: month spines & LAG",
      why: "The 14-month demand spine (2024-01 to 2025-02) is the demand call's home turf: prior month beside current, delta rounded, the January peak (3,731.97) and July trough (1,193.86) named from the data, not from a summer-peak assumption. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["monthly-transactions-i", "hopper-company-queries-i", "year-on-year-growth-rate"],
    },
    {
      name: "Cancellation slices with CASE",
      why: "Cancellation policy reads are CASE-classified conditional counts: 7 of 103 bookings cancelled overall, but APAC 8.1% versus US 5.3% — the spread only appears when the ratio is computed with an honest denominator. The arms must be exhaustive and ordered; a hole in the CASE is a hole in the trust report.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "count-salary-categories"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — operated under completed, this season beside last — and EXCEPT answers 'which travelers never completed an experience'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, operated, awaiting-confirmation and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Payout & cents discipline",
      why: "Booked is not settled — the settlement tables (28 invoices, 27 payments, INTEGER cents) are where the marketplace meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
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
  ],
};
