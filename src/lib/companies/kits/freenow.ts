// FREE NOW — kit 10 of the Ride-hailing & Mobility domain (Batch L, 92-c-mobility).
// Europe's multi-mobility taxi super-app: taxi, private-hire, e-scooters,
// e-mopeds and more stacked in one app, city-by-city licensed. Pool
// provenance: 0 tagged LC — theme-curated. Every problem and topic slug is
// drawn from the Theme menu in scripts/company-pools.md (sql rows), picked to
// mirror FREE NOW's known screen themes: multi-vertical revenue folds,
// city/market censuses, driver-supply anti-joins, weekend-surge date math,
// leaderboard tie policy, capacity reads, INTEGER-cent billing.
// Case studies run on the storefront db (db/custom.db) with probed figures
// from scripts/company-facts.md (probed 2026-10-12), mapped honestly:
// orders = rides, shipped_at = ride-completion ping, customers = riders,
// products = mobility services, category = service family (the vertical
// axis), order_items = fare lines, suppliers = fleet partners,
// invoices/payments = the monthly market billing books (INTEGER cents —
// divide by 100.0). Every case slot is mechanically verified against the
// live db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const freenowKit: CompanyKit = {
  id: "freenow",
  domainId: "mobility",
  name: "FREE NOW",
  tagline: "Europe's multi-mobility taxi super-app",
  accent: "text-yellow-400",

  brief: [
    "FREE NOW is Europe's multi-mobility super-app — the taxi-first platform (born of the BMW–Daimler JV) that stacked private-hire, e-scooters, e-mopeds and more into one app and licenses its way city by city. The operating reality is a {amber:mix problem}: the same rider base books different vehicle classes with different economics, so every count needs its vertical named before it means anything. On this kit's proxy ledger that's 103 rides worth **34,833.28** (average 338.19) across 16 riders and 251 fare lines, split across seven service families. The status map is the ride lifecycle: 52 {emerald:completed} with a completion ping (50.5%), 30 driver-en-route (29.1%), 14 awaiting match (13.6%), 7 {rose:cancelled} (6.8%) — and the drilled habit is *completed ÷ ALL booked*, never ÷ resolved.",
    "Two reads define the analyst job here. The {amber:mix read}: the busiest family by billable units is NOT the revenue leader — one family moves 121 units for 3,294.29 while another moves 97 for **11,744.01** — so volume and value land on different verticals and the census must carry both columns. The {sky:market read}: Europe is the core — EU carries 45 rides from 8 riders and 15,089.23 billed — while the other regions read like pilot books (APAC 37 rides from 5, US 19 from 2, LATAM just 2 from 1), each with its own average ticket (US 383.48, LATAM 426.22, EU 335.32, APAC 313.66). Completion lag on the proxy clock averages **2.98 days** over the 82 pinged rides, fastest in APAC at 2.93 — the supply-side clock that decides whether a city's fleet keeps its promises.",
    "Interviews are mix-first, grain-obsessed, cents-precise. A screen opens with a warm-up join (attach fare lines to their service family), escalates into a conditional aggregation with a status rule (completion share by market, cancelled share by month), then lands on either a supply read (which families or markets have no completed rides at all — and the confidence to print a verified zero) or a billing read (28 `invoices` against 27 `payments`, INTEGER cents, 6 unsettled worth 15,217.00, one of which *claims paid with zero settlement rows*). Follow-ups are spoken aloud: *'is that per ride or per rider?'*, *'does the weekend filter use %w or a date BETWEEN?'*, *'what does an unmatched settlement row mean for the city P&L?'*",
    "Preparation strategy: FREE NOW has **0 tagged LC** rows in this app's pool, so the kit is **theme-curated** — all 30 topic slugs and 16 problems are hand-picked from the theme menu to mirror super-app screens: vertical folds, market censuses, supply anti-joins, weekend date math, capacity pairing, tie-proofed leaderboards. Then run both case studies on the live db: one rebuilds the {amber:vertical revenue census} the city GM deck opens with, the other rebuilds the {emerald:rider activity leaderboard} with its tie policy made explicit. The bar to clear: name the vertical, state the denominator, and respect the cents rule before you compute anything.",
  ],

  dayInLife: [
    "**08:30 —** The day opens on the multi-vertical health board: overnight rides versus completion pings (82 of 103), completion share by market, and the fare-line fan-out check — 251 lines under 103 rides means the join to fare lines multiplies rows by 2.4, and *every analyst here has watched someone quote a 'rider count' that was actually a line count*. First query is a reconciliation: do completed-ride counts tie to what the billing run invoiced overnight, did any market's {rose:cancelled} share drift off band (APAC 8.1% is the one to watch), are the 14 awaiting-match rides aging inside their window?",
    "**11:00 —** Midday is the vertical-mix deep-dive for the city GM. The ask arrives as a slide title: 'where does the revenue actually sit?' — which is a GROUP BY service family with units AND dollars side by side, because the busiest family (121 billable units) bills just 3,294.29 while the value leader moves 97 units for **11,744.01**. A supply partner wants the mirror image: families with completed rides versus families with none — the anti-join that must print a *verified zero* before the meeting, not a shrug. Each deliverable gets written twice: once to answer, once with the vertical and the denominator named, because *a mix number without its vertical is a rumor with decimals*.",
    "**15:00 —** The afternoon runs stakeholder cycles. The market review walks the two-grain census — EU 45 rides from 8 riders versus the US pilot's 19 from 2, intensity 5.6 versus 9.5 — then the weekend-surge read: STRFTIME('%w') classifies ride days into weekend versus weekday, because *a date BETWEEN that trusts the calendar string loses the boundary night*. The billing desk closes the loop: 28 `invoices`, INTEGER cents, coverage census 21 exact / 6 never-settled / 1 partial (4,000.00 of 6,148.00), with #28 — the 1,756.00 bill {rose:claiming paid with zero settlement rows} — routed to the anomaly queue before reminders go out.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The mix census ships with both columns and its gate stated (the 4,000 bar that separates the podium from the middle of the board); the leaderboard ships with its tie policy named — four riders share rank 6 at 4 rides, and *who shares a rung is a business decision, not a function default*; the AR list carries owners. The rhythm to internalize: FREE NOW SQL exists to keep a dozen verticals honest in one query — *the mix is the business, and the grain is the job*.",
  ],

  metrics: [
    { name: "Completed-ride rate", what: "Rides with a completion ping ÷ ALL booked rides: 52 of 103 (50.5%). The denominator is the interview — 52 of 59 resolved is a different metric with a different name." },
    { name: "Vertical revenue mix", what: "Billed revenue per service family — 11,744.01 on top, 863.91 at the bottom. The census carries units AND dollars because the busiest family is not the value leader." },
    { name: "Market census", what: "Rides AND distinct riders per market: EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Europe is the core; the rest are pilot books." },
    { name: "Market average ticket", what: "Billed revenue ÷ rides per market: US 383.48, LATAM 426.22, EU 335.32, APAC 313.66. Small pilots with fat tickets versus the core's steady grind." },
    { name: "Cancelled-ride share", what: "Cancelled ÷ booked: 7 of 103 (6.8%). By market: APAC 8.1% worst, EU 6.7%, US 5.3%, LATAM 0. A conditional count with the denominator kept whole." },
    { name: "Fare-line fan-out", what: "251 fare lines under 103 rides — 2.4 lines per ride. The fan-out factor that silently multiplies every careless join; the grain habit starts here." },
    { name: "Completion latency", what: "Ride-creation to completion ping on the 82 pinged rides: 2.98-day average, range 2..4, APAC fastest at 2.93. The supply-side promise clock." },
    { name: "Unsettled market AR", what: "Invoices with no payment rows: 6 worth 15,217.00 — one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the city billing desk runs monthly." },
  ],

  topics: [
    {
      name: "Multi-vertical revenue folds",
      why: "One app, seven service families — every revenue question here is a fold over fare lines joined to their family, with quantity and price multiplied honestly. FREE NOW probes whether you can carry units AND dollars in one census without letting either column become a count of the other.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "top-earners"],
    },
    {
      name: "City & market censuses",
      why: "City-by-city licensing means the market census is the operating map: rides AND riders per market, load versus audience. COUNT(*) counts ride rows, COUNT(DISTINCT customer_id) counts people — EU's 45 rides collapse to 8 riders and the intensity gap is the story the launch review opens with.",
      slugs: ["daily-leads-and-partners", "find-cities-in-each-state", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Ride-state conditional counting",
      why: "Completed, en-route, awaiting match, cancelled — every rate is a conditional count over a status flag, and the first question out loud is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL booked rides survives scrutiny; filtering first is denominator drift.",
      slugs: ["immediate-food-delivery-ii", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Supply-side anti-joins",
      why: "Driver supply is the two-sided constraint: families or markets with no completed rides, services with zero demand. The LEFT JOIN + IS NULL shape (and its NOT EXISTS twin) is the screen's signature — including the confidence to print a verified zero when the anti-join comes back empty.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "find-churn-risk-customers"],
    },
    {
      name: "Ranking ladders & shared rungs",
      why: "Rank riders or families and a four-way tie at 4 rides is waiting — this ledger ties at 4, 3 and 2. FREE NOW drills the rank trio because 'do tied riders share a rung?' is a policy decision the GM will defend, and LIMIT-OFFSET habits break silently on ties.",
      slugs: ["rank-scores", "group-employees-of-the-same-salary", "department-top-three-salaries"],
    },
    {
      name: "Rates & honest denominators",
      why: "Completion shares, cancellation percentages, per-rider intensity — super-app ratios punish integer division and careless filters. The house habit: 100.0 before the division, the denominator's population decided BEFORE the ratio, rounding only at the very end.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "card-launch-success"],
    },
    {
      name: "Weekend-surge date math",
      why: "Surge planning lives on the calendar: weekend rides versus weekday, month buckets on the 2024-01..2025-02 spine, latest ride before a cutoff. STRFTIME('%w') classifies ride days; '%Y-%m' builds the trend; half-open intervals keep the boundary night from vanishing.",
      slugs: ["monthly-transactions-i", "tasks-count-in-the-weekend", "the-latest-login-in-2020"],
    },
    {
      name: "NULL-safe supply reads",
      why: "A ride awaiting match has no completion ping; a service with no bookings has no lines. FREE NOW screens check whether you treat NULL as a state to report, coalesce for display, or exclude with a stated reason — deliberately, because a supply read that silently shrank its population is a number wearing the wrong name.",
      slugs: ["employee-bonus", "books-with-null-ratings", "combine-two-tables"],
    },
    {
      name: "Capacity & pairing reads",
      why: "Multi-mobility ops is capacity math: seats available versus riders waiting, vehicles that can be paired, pools that fit. Self-joins and running-capacity windows are the screen's physical layer — the query shapes behind 'can this fleet serve this city tonight?'",
      slugs: ["consecutive-available-seats", "last-person-to-fit-in-the-bus", "the-number-of-passengers-in-each-bus-i"],
    },
    {
      name: "Argmax & latest-per-group",
      why: "Every ops review closes with a per-group argmax: each market's priciest ride, each rider's most recent booking, each family's top service. FREE NOW drills the argmax shapes because bare-MAX join-backs double rows on ties — and ties are everywhere on a super-app ledger.",
      slugs: ["most-frequently-ordered-product-per-customer", "the-most-recent-orders-for-each-product", "uber-first-transaction"],
    },
  ],

  theory: [
    {
      id: "fn-t1",
      q: "Fare lines join to their service family — and every service in the catalog has at least one line on it. Does that make INNER JOIN the safe default, and what's the trap that turns a correct-looking join into a silent lie?",
      a: "The zero-row anti-join is a finding to verify, not a license: 'no dead services today' says nothing about tomorrow's catalog upload. The survival rule comes from the question, not the data: a revenue census joins fare lines to families (INNER honest, with the count reconciled to the raw table); a catalog-health read must keep families with no lines — the unmatched rows ARE the finding, arriving NULL-filled. The trap that makes correct-looking joins lie is filter placement: services LEFT JOIN fare lines WHERE revenue > 0 silently discards every zero-line service — the WHERE predicate on the right table converts the LEFT JOIN to an INNER, and the catalog report loses exactly the rows it existed to find. The predicate moves into ON, or the emptiness gets counted deliberately. State the survival rule first; prove the zero as a step.",
      tag: "joins",
    },
    {
      id: "fn-t2",
      q: "The vertical census carries billable units AND billed dollars per family. Why do the two columns disagree so hard — 121 units on one family, 11,744.01 on another — and what does each column mean to the GM?",
      a: "They disagree because they measure different things at the same grain: units is SUM(quantity) — how many ride-units the family moved — while dollars is SUM(quantity * unit_price) — what those units billed. The volume leader moves 121 units for 3,294.29 (cheap, high-frequency rides); the value leader moves 97 units for 11,744.01 (pricier per unit). Neither is 'the' metric: units measures fleet load and utilization pressure, dollars measures the take, and the ratio between them — revenue per unit — is the pricing story the GM actually manages. The trap that catches candidates is a third count: COUNT(*) after the join counts fare LINES (251 across the book), not units and not rides. Saying 'one row per what?' for every aggregate in the query is the habit super-app analytics is built on.",
      tag: "aggregation",
    },
    {
      id: "fn-t3",
      q: "Completion rate is 52 of 103. Where does the status filter live, and what does the number become if a teammate filters completed rides first and divides after?",
      a: "The status rule is a ROW-level fact used as the numerator, so it lives inside a conditional aggregate: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) over ALL booked rides, divided by COUNT(*) from the same fold — 52 of 103, 50.5%. Filter completed rides in WHERE first and the denominator shrinks to the numerator's population: the 'rate' reads 100% in every market, a real number wearing a wrong name. That's denominator drift, and the super-app version is nastier because each vertical drifts separately — a mix read built on filtered denominators makes the busiest vertical look flawless while the small pilot looks the same. The sibling trap is HAVING: it judges group-level aggregates after the fold, when cancelled rides are already inside every group's total. State the pipeline order and place every filter by asking: fact about one row, or about a group?",
      tag: "aggregation",
    },
    {
      id: "fn-t4",
      q: "Rank riders by rides and four of them tie at 4, with a pair tied at 3 below. Which rank function ships to the GM board, and what does each of the three actually print?",
      a: "The three functions print three different business policies. RANK shares the rung and skips: the tie at 4 reads 6, 6, 6, 6 and the next distinct count lands at 10 — implying four phantom riders between the tie and the tail. DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the pair at 3 reads 7, 7 — the compact ladder a GM board wants. ROW_NUMBER splits ties arbitrarily — 7, 8, 9, 10 — a silent judgment call about which rider the ops team calls first, decided by scan order. On this ledger ties are the norm, not the edge case, so the policy ships WITH the query: shared rungs for peer riders, or a named deterministic tie-breaker (rider name, id) written into the ORDER BY. The wrong answer is picking a function; the right answer is picking a policy and labeling it.",
      tag: "windows",
    },
    {
      id: "fn-t5",
      q: "The surge team wants weekend rides versus weekday rides. How do you classify ride days in SQL, and where do the date traps live?",
      a: "Three tools, three traps. Classification: STRFTIME('%w', created_at) returns the weekday digit — '0' Sunday through '6' Saturday — so weekend is the IN ('0','6') set, a CASE arm or a GROUP BY on the digit; the trap is assuming Monday is '1' in every dialect's first-argument convention. Bucketing: the trend spine is STRFTIME('%Y-%m', created_at) — '%m' alone folds January 2024 into January 2025 and the surge curve becomes fiction. Filtering: half-open windows — created_at >= '2025-01-01' AND created_at < '2025-02-01' — because BETWEEN on date strings drops the boundary night, and month-boundary nights are exactly when late-night weekend surge lands. On this ledger the span runs 2024-01 to 2025-02, so a month-only format merges two years of Fridays into one bucket and the weekend read quietly doubles. The strong answer names the format, the weekday convention and the interval rule before computing anything.",
      tag: "dates",
    },
    {
      id: "fn-t6",
      q: "A ride is sitting 'awaiting match' with no completion ping. What is your NULL policy for the latency read, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only completed rides have a latency, so the read measures the 82 pinged rides of 103 and says so — the 14 awaiting and 7 cancelled have no lag, not zero lag. Then mechanics: AVG ignores NULLs, so AVG(lag) over ALL rides returns the pinged-only average (2.98 days on this ledger) with a silently shrunken population — a real number wearing the wrong name. COUNT(completion_ping) counts the pinged subset; the gap between it and COUNT(*) IS the outstanding count — on a super-app that gap splits by vertical, and 'which vertical is aging its matches' is the operational question. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that publishes instant pickup for rides nobody has matched. The gate lives in WHERE (ping IS NOT NULL) with the population named in the header; a supply read whose WHERE clause is doing definitional work silently is exactly what review hunts for.",
      tag: "nulls",
    },
    {
      id: "fn-t7",
      q: "Which markets beat the platform's average ride value — and what does that scalar subquery do when the city-staging filter matches nothing?",
      a: "The shape is HAVING AVG(total) > (SELECT AVG(total) FROM rides): an uncorrelated scalar in the outer comparison. Contractually the subquery returns 0-or-1 rows, 1 column; on the full table it's a constant — 338.19 across 103 rides — and the read is honest: the US pilot (383.48) and LATAM (426.22) clear it, the EU core (335.32) and APAC (313.66) don't. The staging trap: cut the inner query to one city with zero rides and the scalar returns NULL, AVG > NULL is UNKNOWN, and the screen passes nothing while looking valid — an empty slide, not an error. The correlated cousin (compare each market to ITS city's average) re-runs per outer row and answers a different question at a different cost. The strong answer states the inner fold's population and its empty-case behavior unprompted — that's the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "fn-t8",
      q: "The city billing desk says an invoice marked paid has no payment rows behind it. Walk me through the reconciliation query you write first — and the cents rule you never break writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this book that returns 6 bills worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the mirror check: a void bill WITH a payment row (this book has one, #11 at 925.00) never appears in that anti-join — both error modes live on the row-level anomaly list, not in vibes. The cents rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 6,644.30 print into 6,644 and eats cents on every odd-cent bill, quietly, at city scale. Reconciliation culture: counts and sums must agree between the ride ledger and the billing run, and when they do not, the query that shows WHICH rows disagree is the deliverable — the city P&L reads it before the reminder cycle fires.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "fn-mcq-1",
      prompt: "Family A moves 121 billable units for 3,294.29; Family B moves 97 units for 11,744.01. Which expression crowns the REVENUE leader?",
      choices: ["COUNT(*) per family", "SUM(quantity) per family", "SUM(quantity * unit_price) per family", "COUNT(DISTINCT product_id) per family"],
      answer: 2,
      why: "Revenue is units priced: SUM(quantity * unit_price). Family B wins at 11,744.01 despite fewer units — volume and value live on different verticals, and the census carries both columns precisely so this doesn't collapse.",
      notes: [
        { choice: 1, why: "SUM(quantity) crowns Family A — that's the VOLUME leader, a different board. Quoting it as revenue is the classic mix-census mistake." },
        { choice: 0, why: "COUNT(*) after the join counts fare LINES, not units and not money — a third grain nobody asked for." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-2",
      prompt: "Completion rate: the ledger holds 52 completed rides, 14 awaiting match, 7 cancelled, 30 en-route. Which denominator does the house definition use?",
      choices: ["Completed + cancelled only (52/59)", "All rides entered (52/103)", "En-route rides only", "Distinct riders (52/16)"],
      answer: 1,
      why: "The house definition: completed ÷ ALL booked rides — 50.5%. Awaiting-match rides sit in the denominator because they're booked demand; every alternative denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-rides completion rate — 88.1%, a legitimate separate metric. Calling it 'the completion rate' inflates 50.5% by silently deleting in-flight and awaiting demand." },
        { choice: 3, why: "52/16 is completed rides per rider — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-3",
      prompt: "EU carries 45 rides from 8 riders. Which pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and SUM(total)", "COUNT(customer_id) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts ride rows (45); COUNT(DISTINCT customer_id) folds repeats back to people (8). The gap — 5.6 rides per rider — is the intensity read the market review runs on.",
      notes: [
        { choice: 2, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ride has a rider. Without DISTINCT both columns read 45 and the census loses its second grain." },
        { choice: 1, why: "SUM(total) is the revenue column — useful, but it's not a rider census. The ask is load AND audience." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-4",
      prompt: "The GM deck wants only families billing more than 4,000. Where does the gate live?",
      choices: ["WHERE SUM(oi.quantity * oi.unit_price) > 4000, before GROUP BY", "GROUP BY family HAVING SUM(oi.quantity * oi.unit_price) > 4000", "WHERE revenue > 4000 on the raw fare lines", "HAVING revenue > 4000, before GROUP BY"],
      answer: 1,
      why: "A revenue floor judges a fold that only exists after grouping, so HAVING follows GROUP BY. On this ledger the gate keeps four families — 11,744.01, 6,929.12, 5,198.41, 4,818.61 — and drops three below the bar.",
      notes: [
        { choice: 0, why: "SUM does not exist at WHERE time — no groups have formed. The engine rejects it, which is the pipeline-order lesson wearing an error message." },
        { choice: 2, why: "There is no 'revenue' column on the fare line — it's computed at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-5",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued rides", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every market's cancellation share truncates toward 0 and the map reads flat. The 100.0 forces real division first; on this ledger it's the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.068 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-6",
      prompt: "Count weekend rides — Saturday and Sunday. Which predicate is both correct and boundary-safe?",
      choices: ["STRFTIME('%w', created_at) IN ('0', '6')", "created_at BETWEEN '2024-06-01' AND '2024-06-02'", "DAYNAME(created_at) = 'Saturday'", "STRFTIME('%m', created_at) IN ('06', '07')"],
      answer: 0,
      why: "STRFTIME('%w', …) returns the weekday digit — '0' Sunday, '6' Saturday — so IN ('0','6') classifies EVERY ride by its own day. It needs no calendar assumptions and no interval math to get right.",
      notes: [
        { choice: 1, why: "A hardcoded BETWEEN classifies only the two dates you typed — every other weekend in the ledger silently vanishes. And BETWEEN on datetimes drops the boundary night's tail." },
        { choice: 3, why: "'%m' extracts the MONTH, not the weekday — that predicate counts summer rides, not weekend rides." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-7",
      prompt: "Four riders tie at 4 rides; the next distinct count is 3. DENSE_RANK assigns the 3-ride riders rank…",
      choices: ["6", "7", "10", "11"],
      answer: 1,
      why: "DENSE_RANK gives the four-way tie rank 6 and the next distinct count rank 7 — shared rungs, no gaps. RANK would say 10 (6,6,6,6 then a jump); ROW_NUMBER would number them 7-10 arbitrarily.",
      notes: [
        { choice: 2, why: "That's RANK's answer: the tie consumes ranks 6-9, so the next lands at 10 — implying four phantom riders that don't exist. DENSE_RANK keeps the ladder compact." },
        { choice: 3, why: "No scheme starts the next rung at 11. The honest choices are 7 (dense) or 10 (ranked), and the policy gets named on the board." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-8",
      prompt: "The catalog-health read is services LEFT JOIN fare lines. A teammate adds WHERE revenue > 0 'to clean it up'. What happens?",
      choices: ["Nothing — the report just gets faster", "Every zero-line service silently disappears — the WHERE converts the LEFT JOIN to an INNER", "The report doubles — NULL rows multiply", "An error — you cannot filter a joined column"],
      answer: 1,
      why: "The unmatched services carry NULL revenue, NULL > 0 is UNKNOWN, and WHERE discards them — the LEFT-ness survives only in the ON clause. The zero-line services the read existed to find are gone, and the query still looks correct.",
      notes: [
        { choice: 0, why: "It's not cleanup, it's deletion: the predicate moves the filter to a clause where NULL payloads cannot survive. The population changed and nobody re-ran the anti-join count." },
        { choice: 2, why: "NULL rows don't multiply — they vanish. Fan-out is the opposite failure mode, and it comes from one-to-many joins, not WHERE clauses." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-9",
      prompt: "HAVING AVG(total) > (SELECT AVG(total) FROM rides WHERE city = 'Málaga') runs against staging where Málaga hasn't launched — zero rides. What does the screen return?",
      choices: ["An error — scalar subqueries must return a row", "Zero rows silently — the comparison passes nothing", "Every row — NULL comparisons default to true", "Only NULL-total rides"],
      answer: 1,
      why: "The empty inner fold yields NULL, AVG(total) > NULL is UNKNOWN, and HAVING passes nothing — a valid query that ships an empty slide. Pre-launch city staging makes this routine, which is why the inner fold's population is stated out loud.",
      notes: [
        { choice: 0, why: "SQLite tolerates the empty case as NULL rather than erroring — worse than a crash, because the deck LOOKS finished. The portable habit is checking the inner fold's row count." },
        { choice: 2, why: "No comparison against NULL defaults to true — UNKNOWN is discarded in both directions. Nothing 'passes' a NULL comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-10",
      prompt: "A banding CASE runs WHEN price >= 200 THEN 'premium' WHEN price >= 50 THEN 'mid' ELSE 'budget'. The catalog's priciest service is 199.99. What does the premium band report?",
      choices: ["An error — the boundary is invalid", "Zero rows — the band exists but is empty at these prices", "One row — the 199.99 service rounds into it", "All 16 services — ELSE is unreachable"],
      answer: 1,
      why: "199.99 < 200 fails the first arm, lands in 'mid' (>= 50), and the premium band prints as a legitimate ZERO — an empty band is a finding (no premium tier priced yet), not a bug. The max price on this catalog is 199.99, so nothing ever reaches the arm.",
      notes: [
        { choice: 2, why: "Nothing rounds in SQL comparisons — 199.99 is 199.99, not 200. The boundary is exact, and 'almost premium' is still mid." },
        { choice: 3, why: "ELSE is only unreachable when an earlier arm catches everything — here the arms are exhaustive but the FIRST one simply never fires at this price range." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-fn-1",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The vertical revenue census",
      brief:
        "FREE NOW-flavored brief on the storefront db: the city GM deck opens with the vertical census — billable units AND billed dollars per service family — gated at 4,000 so the board shows the families that matter. Probed facts: 251 fare lines fold to seven families; the revenue ladder reads 11,744.01 across 97 units, 6,929.12 across 53, 5,198.41 across 61, then 4,818.61 — and below the gate, 3,294.29, 1,984.93, 863.91. The mix story is the point: the busiest family by units is NOT the value leader. The census reads revenue-first, biggest family on top, top three only — and the gate must judge the FOLD (a family's total), not the raw lines.",
      ask: "Return the top three service families by billed revenue: family name, billable units and revenue, anything under 4,000 dropped.",
      template:
        "SELECT p.category AS vertical,\n       {1}(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\nFROM order_items oi\nJOIN {2} p ON p.id = oi.product_id\nGROUP BY p.category\n{3} SUM(oi.quantity * oi.unit_price) > 4000\nORDER BY revenue {4}\nLIMIT {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the unit counter",
          why: "SUM(oi.quantity) folds the fare lines' quantities into billable units — 97 for the top family. COUNT would count LINES (51, not 97) and quietly redefine the volume column.",
        },
        {
          answer: "products",
          kind: "keyword",
          label: "the service-family table",
          why: "Fare lines carry product_id; the family axis lives on products — JOIN products p ON p.id = oi.product_id. Joining customers instead compiles but has no category column, and the census dies on a missing column, not a wrong number.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the post-fold revenue gate",
          why: "The 4,000 bar judges a family's folded revenue, which exists only after GROUP BY — so HAVING. WHERE runs before any fold and rejects an aggregate outright, which is the pipeline-order lesson wearing an error message.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-family-first direction",
          why: "The board opens with the value leader — 11,744.01. ASC would open on the smallest family that cleared the gate and the GM reads the deck upside down.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the podium cut",
          noVerify: true,
          why: "The ask is the podium: three rows. Widening to 5 would pull in the 4,818.61 family that cleared the gate but missed the podium — a different board than the one the GM asked for.",
        },
      ],
      distractors: ["COUNT", "AVG", "customers", "WHERE", "ASC", "5"],
      walkthrough:
        "A fold, a gate, a podium — and a mix story underneath. The join attaches each of 251 fare lines to its service family; GROUP BY p.category folds them to seven rows. Inside each bucket the query counts twice: SUM(oi.quantity) folds billable units (97, 53, 61 for the podium) while ROUND(SUM(oi.quantity * oi.unit_price), 2) prices them — 11,744.01, 6,929.12, 5,198.41. HAVING keeps the four families clearing 4,000 and LIMIT 3 cuts to the podium; the fourth (4,818.61) cleared the gate but missed the cut — both clauses exist because the GM asked for top three, gated. The distractors each break differently: COUNT in the unit slot redefines volume as line count (97 becomes 51) and the mix story corrupts; AVG prints per-line means nobody asked for; customers compiles but the category column doesn't exist there; WHERE dies on the aggregate-before-fold rule; ASC inverts the podium; 5 widens past the ask. The deeper read: units leader (121 units, 3,294.29) and revenue leader (97 units, 11,744.01) are DIFFERENT families — the census carries both columns so the board can't flatten the mix into one number.",
    },
    {
      id: "cs-fn-2",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The rider activity leaderboard",
      brief:
        "FREE NOW-flavored brief on the storefront db: growth wants the rider activity leaderboard for the engagement review — rides per rider, ranked, with ties sharing a rung because *who counts as a peer is a business decision the GM defends*. Probed facts: 16 riders, ladder 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), 5 (Chloe Dubois) — then a FOUR-way tie at 4 rides (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez) and a pair at 3 (Farid Nasser, Hiro Tanaka). The board must be dense-ranked (no phantom gaps after ties), read best-first, and cut at eleven so BOTH tie blocks appear complete — a board that slices mid-tie misrepresents the peer group it's showing.",
      ask: "Rank riders by completed rides: name, ride count and a dense rank where ties share a rung, best first, top eleven.",
      template:
        "SELECT c.name AS rider,\n       COUNT(*) AS rides,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS activity_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.name\nORDER BY activity_rank, rider\nLIMIT {3};",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the tie-sharing rank",
          why: "DENSE_RANK lets the four 4-ride riders share rank 6 and hands the 3-ride pair rank 7 — no gaps, no phantom riders. ROW_NUMBER would split the tie arbitrarily; RANK would leave a gap that implies four riders who don't exist.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-first direction",
          why: "The ladder reads activity-first: 24, 17, 14, 13, 5 descending. ASC would open the engagement review with the quietest riders and rank the champions last — a correct query answering the opposite ask.",
        },
        {
          answer: "11",
          kind: "number",
          label: "the full-tie-block cut",
          noVerify: true,
          why: "Eleven rows show ranks 1-7 with both tie blocks complete: five singles, the four-way tie at 6, the pair at 7. Cutting at 5 would hide the tie entirely; cutting mid-block misrepresents who the board says is a peer.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "SUM(o.total)", "5"],
      walkthrough:
        "A fold, a window, and a tie policy made visible. The join attaches rides to riders; GROUP BY c.name folds 103 rides to 16 rows; the window ranks the folded counts — DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) reads 1 (Alice Chen, 24), 2 (Emma Wilson, 17), 3 (Grace Kim, 14), 4 (Maya Patel, 13), 5 (Chloe Dubois, 5), then 6, 6, 6, 6 across the four 4-ride riders and 7, 7 across the 3-ride pair. The secondary ORDER BY rider makes the tie order deterministic (alphabetical, stated in the header), and LIMIT 11 shows exactly ranks 1-7 with both tie blocks complete. The distractors each break a different way: RANK prints 10, 10 on the final pair — a gap implying four phantom riders between the tie and the tail; ROW_NUMBER prints 7-10 across the four-way tie, erasing the peer group the GM explicitly asked to see; ASC inverts the ladder; SUM(o.total) in the window would rank by SPEND (a different board where Pedro Alvarez outranks the tie by money); 5 slices the board at rank 5 and hides the tie behavior the whole case exists to teach. The deeper lesson: the rank trio is a business decision — who shares a rung, what the next rung is called, and where the cut falls relative to a tie block.",
    },
  ],

  problems: [
    { slug: "trips-and-users", why: "The canonical two-sided screen: ride status rates with excluded accounts handled in the join — the super-app version of completion-share-by-market." },
    { slug: "product-sales-analysis-ii", why: "Per-service totals from fare lines — the vertical revenue fold this kit's first case rebuilds at family grain." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across riders with the 100.0-before-division fix — the market-penetration percentage the launch review quotes." },
    { slug: "confirmation-rate", why: "Driver-confirmation style rates with NULL-safe division — unmatched riders count as zero and the share still rounds honestly." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before every leaderboard, said out loud with the shared-rung policy." },
    { slug: "group-employees-of-the-same-salary", why: "DENSE_RANK tier buckets — riders grouped into activity tiers where ties must share a tier, the ladder this kit's second case rebuilds." },
    { slug: "tasks-count-in-the-weekend", why: "Weekday-digit classification with STRFTIME('%w') — the weekend-surge read the surge team runs every Thursday." },
    { slug: "monthly-transactions-i", why: "Month-bucket totals with a status split — the 2024-01..2025-02 spine every trend read here hangs on." },
    { slug: "sellers-with-no-sales", why: "Supply-side anti-join: services whose lines never moved — the catalog-health read that must print a verified zero, not a shrug." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself: LEFT JOIN + IS NULL as a survival rule — drilled until the WHERE-downgrade trap is reflex." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-capacity window: riders boarding until the vehicle fills — the pooling/capacity shape behind every multi-mobility supply question." },
    { slug: "consecutive-available-seats", why: "Self-join on contiguous availability — which vehicles are free in adjacent slots, the pairing read dispatch runs nightly." },
    { slug: "average-selling-price", why: "Per-period weighted pricing — revenue per unit where the weighting choice changes the answer, a favorite FREE NOW follow-up." },
    { slug: "uber-first-transaction", why: "First-ride cohort via window — riders' first booking by vertical: the acquisition story growth tells per city." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER dedupe to the latest row — ride states update in place, and the latest-status read is the dedupe idiom this ledger lives by." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one query with the 100.0-before-division fix — the honest-denominator drill FREE NOW's ratio questions orbit." },
  ],
};
