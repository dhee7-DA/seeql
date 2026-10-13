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
// 3x expansion (Task 94-freenow, append-only): brief 4->6, dayInLife 4->5,
// metrics 8->12, topics 10->15, theory 8->24 (fn-t9..t24), mcqs 10->30
// (fn-mcq-11..30, 3/4/3 easy/medium/hard per fresh ten), cases 2->6
// (cs-fn-3..6 on j5/s7/x3/q6 — four topic families all new to the kit,
// number slots verified against db/custom.db), problems 16->32. All new
// slugs remain theme-curated sql rows from the Theme menu in
// scripts/company-pools.md.

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
    "The money side runs on a {amber:billing book} the ride ledger must reconcile against: 28 `invoices` worth **86,977.00**, settled by 27 payment legs across 22 distinct bills — five bills pay in two splits — on two rails: card moves 16 legs / 37,364.00 (53.7% of settled value), wire 11 / 32,248.00. The coverage census is what the close quotes verbatim: 21 bills exact (65,612.00), 6 with no settlement rows at all (15,217.00), 1 partial (invoice #25, 4,000.00 of 6,148.00) — and settlement averages **28.4 days** (fastest 13, slowest 84) against flat 30-day terms. Partners and costs frame the economics: two fleet partners carry the book (Nordic Gadgets AB 32%, Midwest Hardware Co 26.7% — 58.6 between them), while the ops cost stack is 36 lines / 25,416.00 with {rose:Rent} at 14 lines / 16,800.00 (66.1% of it). *Every one of those numbers has a denominator, and the interviewer wants it named.*",
    "Preparation roadmap, four passes. Pass one is the grain ladder: rebuild the mix census (units AND dollars per family) and the market census (45 rides from 8 EU riders) until quoting the grain is reflex. Pass two is the status layer: conditional counts over {emerald:completed} and {rose:cancelled} with denominators fixed before ratios, then the CASE pivot per market. Pass three is the billing book: anti-joins for the 6 unsettled bills, the cents rule (`amount_cents / 100.0`), coverage classes, and the #28 claim-paid-no-rows anomaly. Pass four is windows and pace: DENSE_RANK leaderboards with a named tie policy, LAG walks over the **14-month spine**, then rebuild all six case studies from the chip bank under time. *The bar is constant across passes: name the vertical, state the denominator, respect the cents.*",
  ],

  dayInLife: [
    "**08:30 —** The day opens on the multi-vertical health board: overnight rides versus completion pings (82 of 103), completion share by market, and the fare-line fan-out check — 251 lines under 103 rides means the join to fare lines multiplies rows by 2.4, and *every analyst here has watched someone quote a 'rider count' that was actually a line count*. First query is a reconciliation: do completed-ride counts tie to what the billing run invoiced overnight, did any market's {rose:cancelled} share drift off band (APAC 8.1% is the one to watch), are the 14 awaiting-match rides aging inside their window?",
    "**11:00 —** Midday is the vertical-mix deep-dive for the city GM. The ask arrives as a slide title: 'where does the revenue actually sit?' — which is a GROUP BY service family with units AND dollars side by side, because the busiest family (121 billable units) bills just 3,294.29 while the value leader moves 97 units for **11,744.01**. A supply partner wants the mirror image: families with completed rides versus families with none — the anti-join that must print a *verified zero* before the meeting, not a shrug. Each deliverable gets written twice: once to answer, once with the vertical and the denominator named, because *a mix number without its vertical is a rumor with decimals*.",
    "**15:00 —** The afternoon runs stakeholder cycles. The market review walks the two-grain census — EU 45 rides from 8 riders versus the US pilot's 19 from 2, intensity 5.6 versus 9.5 — then the weekend-surge read: STRFTIME('%w') classifies ride days into weekend versus weekday, because *a date BETWEEN that trusts the calendar string loses the boundary night*. The billing desk closes the loop: 28 `invoices`, INTEGER cents, coverage census 21 exact / 6 never-settled / 1 partial (4,000.00 of 6,148.00), with #28 — the 1,756.00 bill {rose:claiming paid with zero settlement rows} — routed to the anomaly queue before reminders go out.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The mix census ships with both columns and its gate stated (the 4,000 bar that separates the podium from the middle of the board); the leaderboard ships with its tie policy named — four riders share rank 6 at 4 rides, and *who shares a rung is a business decision, not a function default*; the AR list carries owners. The rhythm to internalize: FREE NOW SQL exists to keep a dozen verticals honest in one query — *the mix is the business, and the grain is the job*.",
    "**21:40 —** The late shift is the {sky:surge watch} and the close-out send. Weekend classification runs once more — STRFTIME('%w') over today's rides, because the boundary night is exactly when late-night demand spikes — and the chase list goes out to market owners: the 6 unsettled bills worth **15,217.00**, Emma Wilson's 4,937.00 at the top, with #28's 1,756.00 claim-paid-no-rows row routed to the anomaly queue rather than the reminder cycle. Last pass is tomorrow's defense: the ledger's trial balance ties at 181,080 = 181,080, and *a day that ends unreconciled is a day that starts with someone else's numbers*.",
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
    { name: "Settlement rail mix", what: "27 settlement legs on two rails: card 16 legs / 37,364.00 (53.7% of settled value), wire 11 / 32,248.00. The rail census the billing desk opens with before any reminder cycle fires." },
    { name: "Billing coverage census", what: "Every invoice classed by what actually settled: exact 21 / 65,612.00, no payment rows 6 / 15,217.00, partial 1 / 6,148.00 — #25 settled 4,000.00 of 6,148.00. The close quotes it verbatim." },
    { name: "Settlement speed", what: "Days from bill issue to first payment on the 20 settled invoices: 28.4-day average, fastest 13, slowest 84 — against flat 30-day terms. The slow tail becomes the chase list." },
    { name: "Ops cost stack", what: "36 expense lines / 25,416.00: Rent 14 lines / 16,800.00 (66.1%), Ads 14 / 4,570.00, Travel 3 / 2,521.00, Tools 5 / 1,525.00. City-hub rent is the fixed floor every ride margin climbs." },
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
    {
      name: "Settlement rails & billing books",
      why: "Multi-mobility billing settles on rails and in books: card legs beside wire legs, invoice folds beside payment folds, INTEGER cents everywhere. FREE NOW screens the rail census and the coverage classes because a city P&L that cannot reconcile its own settlement legs is a P&L nobody signs.",
      slugs: ["bank-account-summary-ii", "duplicate-charge-pairs", "gl-reconciliation"],
    },
    {
      name: "Cost stacks & opex folds",
      why: "City hubs burn rent before the first ride books — 36 expense lines fold to a four-category stack with 16,800.00 of Rent on top, and every margin read starts from it. UNION ALL TOTAL stacks, bucket censuses and budget-pacing shapes are the screens here, with the banner row kept honest.",
      slugs: ["count-salary-categories", "budget-pacing", "trial-balance-check"],
    },
    {
      name: "Pace walks & period-over-period",
      why: "Ops reads the ride spine as a walk: 8, 9, 8, 7 — each month's step against the last, swings of ±2 flagged as the loud months. LAG/LEAD walks and growth-accounting transitions are how the team separates a launch wobble from a trend break.",
      slugs: ["year-on-year-growth-rate", "biggest-window-between-events", "growth-accounting"],
    },
    {
      name: "Status pivots & board shapes",
      why: "The market health board is a pivot: completed, awaiting and cancelled per market in one row, percentages beside counts. Reformatting folds into columns — by weekday, by status, by weather-style CASE arms — is the board-builder's toolkit, and every arm needs its denominator named.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "weather-type-in-each-country"],
    },
    {
      name: "Partner dependency & concentration",
      why: "Two fleet partners carry 58.6% of the book — Nordic Gadgets AB at 32%, Midwest Hardware Co at 26.7% — so concentration is a supply risk, not a trivia stat. Share-of-total folds and partition windows (HHI thinking) turn the partner roster into a dependency board the city GM can act on.",
      slugs: ["portfolio-concentration-hhi", "top-travellers", "find-the-team-size"],
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
    {
      id: "fn-t9",
      q: "The running settlement walk — SUM(p.amount_cents) OVER (ORDER BY paid_on) — has several legs landing on the same paid_on day. What frame is the engine using by default, and how does that change the walk?",
      a: "With ORDER BY present the default frame is RANGE, and RANGE makes peer rows — legs sharing the same paid_on — share the frame: each same-day leg's running total jumps by the WHOLE day's amount, so every one of those legs overstates its own step. On this book 27 legs pay 22 bills and split bills settle their legs together, so same-day peers are routine, not edge cases. ROWS UNBOUNDED PRECEDING counts physical rows and keeps the walk strictly incremental — one leg per step. Neither is wrong; they answer different questions: RANGE gives the cumulative total through each day, ROWS gives a per-leg walk. The habit is to name the frame out loud on every running total, because the default silently chose the business meaning for you.",
      tag: "windows",
    },
    {
      id: "fn-t10",
      q: "The rail stack UNION ALLs two rail folds with a TOTAL banner. Why UNION ALL and not UNION, and what are the contracts of EXCEPT and INTERSECT that the billing desk relies on?",
      a: "UNION ALL keeps every row; UNION dedupes whole rows. Today the three stack rows differ — card 16 legs / 37,364.00, wire 11 / 32,248.00, TOTAL 27 / 69,612.00 — so UNION happens to print the same board, but that's luck, not design: the day two rails tie on every column, UNION silently eats a row and the stack no longer cross-foots. EXCEPT is directional — the LEFT side's unmatched rows survive — so billed-ids EXCEPT settled-ids surfaces the chase list while the reverse is empty; INTERSECT demands symmetric shapes (same column count, comparable types) and treats NULLs as equal. Set ops are contracts about ROW SETS, not a display trick: state which side survives and what a duplicate means before writing the second SELECT.",
      tag: "setops",
    },
    {
      id: "fn-t11",
      q: "The coverage census folds payments to one row per bill, then re-folds into classes. Why is that a CTE/derived-table job and not a correlated scalar in SELECT?",
      a: "Because the census needs fold-then-REFOLD, and a scalar can only annotate. (SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id) answers 'each bill's paid amount' but re-runs per outer row and puts the aggregate in the projection — where it cannot be grouped again, so the class fold (exact / partial / no-payment) has nowhere to happen. The derived-table shape materializes the per-bill fold once: GROUP BY i.id produces one honest row per bill, and the outer GROUP BY cov is then a plain fold over real columns. Rule of thumb worth saying at the board: scalars annotate rows, derived tables build grains — and any query that wants to aggregate an aggregate is telling you it needed the derived table.",
      tag: "subqueries",
    },
    {
      id: "fn-t12",
      q: "The chase list as i.id NOT IN (SELECT invoice_id FROM payments) works today. What breaks the day one payment leg carries a NULL invoice_id, and which shapes are immune?",
      a: "The whole chase list evaporates. x NOT IN (a, b, NULL) can never be TRUE — the comparison is UNKNOWN for every outer row — so the six unpaid bills, 15,217.00 of AR, silently vanish from the close with no error, which is strictly worse than a crash. The immune shapes are NOT EXISTS (a join probe, not a membership test) and LEFT JOIN + IS NULL, which is why this desk writes anti-joins as joins by default. If NOT IN is ever required, guard the subquery with WHERE invoice_id IS NOT NULL and comment why. The interview question underneath is really 'what does your anti-join do when the child table lies?' — and the honest answer is printed in the WHERE clause, not asserted in the review.",
      tag: "nulls",
    },
    {
      id: "fn-t13",
      q: "Walk me through the staged close: how do you get from raw payment legs to the coverage census — 21 exact, 6 never-settled, 1 partial — in one query you can defend?",
      a: "Three stages, one responsibility each. Stage one (per_bill) folds payments to one row per invoice and classifies it: COUNT(p.id) = 0 means no payment, SUM(p.amount_cents) >= i.amount_cents means exact, else partial. Stage two (classes) projects just the class and the amount — nothing else. Stage three folds to the census: 21 exact / 65,612.00, 6 no-payment / 15,217.00, 1 partial / 6,148.00. The staging layer is also where a pipeline-order trap dies: GROUP BY cov directly on the fold is rejected — you cannot group by an aggregate-containing alias — but push the fold into a CTE and cov becomes a real column the next fold can group on. One fold per stage, one name per fact; the query then explains itself at review instead of being defended.",
      tag: "pipeline",
    },
    {
      id: "fn-t14",
      q: "Five bills on this book pay in two legs. How do you show a split bill's payment methods on one row, and what does GROUP_CONCAT make you promise?",
      a: "GROUP_CONCAT(p.method) folds each bill's legs to one string — the split bills (1, 5, 12, 19, 22) read 'card,card' or 'card,wire' — but three promises come with it. The separator: the default glue is a bare comma with no space, so 'card,wire' is what prints unless you name a separator explicitly. The order: row order inside the fold is not guaranteed unless you ask for it (recent SQLite allows ORDER BY inside the aggregate), so a 'first leg, second leg' reading needs the ORDER BY in writing. The grain: the string destroyed the rows — 'card,card' is a display fact, not a countable set, so anything downstream that needs counts must re-aggregate from the base rows, never parse the string. GROUP_CONCAT ships where a human reads a manifest; it never becomes an input to arithmetic.",
      tag: "aggregation",
    },
    {
      id: "fn-t15",
      q: "27 settlement legs cover 22 bills. Which single character turns 'payments per bill' from a 27%-wrong number into the right one, and where does ROUND sit?",
      a: "The .0 — and it is not cosmetic. COUNT(*) / COUNT(DISTINCT invoice_id) is integer over integer: SQLite truncates at the division, printing 1 when the truth is 1.2273. Writing 1.0 * COUNT(*) / COUNT(DISTINCT invoice_id) — or dividing the cents book by 100.0 instead of 100 — promotes to real arithmetic BEFORE any truncation, and only then does ROUND(x, 2) have something honest to round. The sneakier variant is money: amount_cents / 100 silently drops every odd cent, and this book has odd-cent legs, so the loss is real at city scale. ROUND is presentation and sits after the honest division, never instead of it. The house rule: every money column is SUM(cents) / 100.0, every rate is 100.0 * num / den — stated in the header so a reviewer checks the arithmetic without re-deriving it.",
      tag: "quality",
    },
    {
      id: "fn-t16",
      q: "COALESCE and NULLIF both 'handle NULLs'. What are their actual contracts, and which one does the latency read and the coverage read need?",
      a: "They are opposite contracts. COALESCE is DISPLAY: a rider with no completion ping shows '—' (or 0 if the board's convention says so) while the underlying latency stays NULL — the 14 awaiting-match rides are missing data, not instant pickups. NULLIF is LOGIC: NULLIF(x, 0) turns a poison zero into NULL so downstream division survives — coverage pct as 100.0 * SUM(p.amount_cents) / NULLIF(i.amount_cents, 0) refuses to divide by a zero-amount bill instead of erroring or printing infinity. The failure mode is using COALESCE to fix logic: IFNULL the ride lag to 0 and the average latency now averages 14 fabricated zeros into the 82-pinged population — a real number wearing a lie. Display coalesces, logic NULLIFs, and neither is allowed to silently rewrite the population the metric claims to describe.",
      tag: "nulls",
    },
    {
      id: "fn-t17",
      q: "The ops trend needs every month from 2024-01 to 2025-02, including quiet ones. Why does a plain GROUP BY lie, and how do you build the spine?",
      a: "A plain GROUP BY over rides only returns months that HAD rides — a zero-booking month vanishes and the trend line silently compresses, which reads as growth on exactly the months the ops team most needs to see. The durable shape: generate the month list first (fourteen buckets, 2024-01 through 2025-02), then LEFT JOIN the ride folds onto it so empty months print 0 — a verified zero the board can trust. The format trap rides along: '%Y' folds the whole span into two buckets, '%m' alone folds two Januaries into one — only '%Y-%m' keeps year and month. Zero-fill is honesty infrastructure: 'no rides in March' and 'March missing from the query' look identical on a chart, and only one of them is true. Build the spine, state the bucket format, and let the zeros testify.",
      tag: "dates",
    },
    {
      id: "fn-t18",
      q: "State the SELECT pipeline order — and the two consequences it has for HAVING completed >= 5 and for filtering on ROW_NUMBER().",
      a: "FROM joins, WHERE filters rows, GROUP BY folds, HAVING judges groups, window functions evaluate after the fold, SELECT projects, ORDER BY sorts. Two consequences get tested constantly. First, HAVING completed >= 5 is legal because the alias names a folded aggregate — groups exist by then — while the same predicate in WHERE dies, because no group has formed when WHERE runs. Second, window functions can never live in WHERE: ROW_NUMBER() <= 5 is invalid because windows evaluate after row filtering, and the fix is structural — wrap the windowed SELECT in a CTE and filter on its output (the classic top-N-per-group). When a query 'can't see' a column you just computed, the answer is almost always one staging layer earlier, not a cleverer inline expression.",
      tag: "pipeline",
    },
    {
      id: "fn-t19",
      q: "On the payments table: 27 rows, 22 distinct invoice_ids, five bills paying twice. What do COUNT(*), COUNT(invoice_id) and COUNT(DISTINCT invoice_id) each mean — and which ships as 'bills settled'?",
      a: "Three personalities of COUNT, three grains. COUNT(*) counts legs: 27 payment legs. COUNT(invoice_id) counts legs with a known bill: also 27 today — nothing orphaned, and that equality is itself a finding worth stating. COUNT(DISTINCT invoice_id) folds the five split bills (1, 5, 12, 19, 22) from two legs back to one bill each: 22 bills settled. Quoting '27 bills settled' when 22 bills paid via 27 legs is the kind of error that survives one review and dies in an audit reconciliation. The habit: for every COUNT in a billing query, ask out loud 'counting what grain?' — rows, non-null FKs, or distinct parents — and let the column name carry the answer: legs versus bills_touched, never a bare count.",
      tag: "aggregation",
    },
    {
      id: "fn-t20",
      q: "The pace walk over the fourteen-month spine: what does 2025-02's LEAD(monthly_orders) return, and what are you allowed to do with it?",
      a: "NULL — the walk ran off the edge of the data, because no 2025-03 exists yet. That NULL is information, not a defect: printing it as 0 would fabricate a collapse in the last bucket, and COALESCE-ing it to the current value would fabricate a plateau. The mirror case guards the walk's opening: 2024-01's LAG is NULL by construction — there is no step INTO the first month, and any 'month-over-month change' report showing a 0 there has substituted a value for an absence. The discipline: edge NULLs ship in the report as NULL with a one-line footnote — 'NULL = no adjacent period, not no activity' — and every consumer of the walk is told the first and last cells are censored. A trend that hides its boundaries is a trend someone will misquote.",
      tag: "windows",
    },
    {
      id: "fn-t21",
      q: "DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) — why is a window allowed to order by an aggregate, where does the window run in the pipeline, and why is LIMIT the wrong tool when a tie straddles the cut?",
      a: "Because the window runs after the fold: pipeline order is FROM → WHERE → GROUP BY → HAVING → window → SELECT → ORDER BY, so by window time the folded counts exist and ORDER BY COUNT(*) is just ordering real values — the same reason the window itself can never appear in WHERE. The composed shape is rank-then-filter-in-a-CTE: fold rides per rider, rank the folds, then take rank <= 7 to show the board through the 3-ride tie pair. LIMIT is the wrong tool the moment a tie straddles the cut: LIMIT 7 on this ledger slices the four-way tie at rank 6 and ships a board showing half a peer group, while a rank predicate keeps the block whole. Windows after folds, filters after windows, and never LIMIT where a rank predicate is meant.",
      tag: "windows",
    },
    {
      id: "fn-t22",
      q: "The billing books reconcile because of key discipline, not luck. Which keys carry the reconciliation, and what do an orphan leg and a re-run import each threaten?",
      a: "Payment legs attach to bills by invoice_id; bills attach to riders by customer_id — and every reconciliation query in this kit works only because those FKs are total: 27 legs, all attached; 28 bills, all with a rider. The threats are two different lies from one dirty row. An orphan leg (invoice_id NULL or dangling) silently vanishes from INNER-fold queries — the settled total shrinks with no error — and simultaneously poisons NOT IN anti-joins into returning nothing, which is why the anomaly census runs row-level checks (void-but-paid #11 at 925.00, paid-no-legs #28 at 1,756.00) instead of trusting the status column. Idempotency rides the same keys: a settlement re-import must match on the leg's identity, not on money amounts, or a retry double-counts the book. Name the join key and its failure mode in every review.",
      tag: "quality",
    },
    {
      id: "fn-t23",
      q: "What makes a query 'self-auditing', and which two numbers on this book cross-foot inside the queries that report them?",
      a: "A self-auditing query carries its own proof: the deliverable and the assertion are the same rows. The rail stack does it in one query — legs 27 = 16 + 11 and settled 69,612.00 = 37,364.00 + 32,248.00, so the TOTAL banner is simultaneously the headline and the reconciliation; if the banner ever disagrees with the rails above it, the query's own output exposes the break. Ledger scale does it with the trial balance: 181,080 = 181,080, delta 0 — the query that says the books tie, printed beside every deck. The practice generalizes: every multi-branch report gets a reconcile line (the ALL-side of a UNION ALL stack, or a paired check query), every census states its population (28 bills, 103 rides), and any number a stakeholder can misquote gets its denominator printed beside it. Reviews stop being arguments when the query testifies.",
      tag: "quality",
    },
    {
      id: "fn-t24",
      q: "Same query, city-scale data: which three costs grow with the data, and what are your defaults before you ever reach for an EXPLAIN?",
      a: "Fan-out, per-row subqueries, and non-sargable filters. Fan-out: joining fare lines before folding multiplies rows (251 lines over 103 rides) — fold to the grain you need before distincting, because COUNT(DISTINCT) over a fanned join is the expensive version of a fold you already had. Per-row subqueries: the correlated scalar re-runs per outer row — invisible on a 28-bill book, the whole query at 28,000. Non-sargable: STRFTIME('%Y-%m', created_at) = '2024-06' wraps the indexed column in a function and forfeits the index, while created_at >= '2024-06-01' AND created_at < '2024-07-01' can use it. Defaults: fold early, filter late but indexably, measure before optimizing — and be able to say WHY a plan is bad, not just that the query feels slow.",
      tag: "performance",
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
    {
      id: "fn-mcq-11",
      prompt: "The billing census runs SELECT COUNT(*), COUNT(p.invoice_id) FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id. What prints on this book (28 bills, 27 legs, 5 split bills, 6 unpaid)?",
      choices: ["28 and 27", "33 and 27", "33 and 33", "28 and 28"],
      answer: 1,
      why: "The LEFT JOIN fans out: 27 attached legs plus 6 NULL-leg rows for the unpaid bills = 33 rows, so COUNT(*) is 33 — a row count of the JOIN, not of bills. COUNT(p.invoice_id) drops the 6 NULL rows and prints 27 legs. Neither number is 'bills' — that's COUNT(DISTINCT i.id) = 28.",
      notes: [
        { choice: 0, why: "28 and 27 would be true of a one-row-per-bill join. With 5 bills paying two legs, the join result is 27 + 6 = 33 rows — the fan-out struck before any count ran." },
        { choice: 2, why: "COUNT(p.invoice_id) skips NULLs by contract — that's the one count that ISN'T inflated by the unpaid rows. 33/33 would need the unpaid rows to carry fake legs." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-12",
      prompt: "22 bills settled 27 payment legs. Which expression counts BILLS, not legs?",
      choices: ["COUNT(*) FROM payments", "COUNT(invoice_id) FROM payments", "COUNT(DISTINCT invoice_id) FROM payments", "SUM(invoice_id) FROM payments"],
      answer: 2,
      why: "The five split bills (1, 5, 12, 19, 22) each pay two legs; DISTINCT folds each bill's legs back to one bill — 22. COUNT(*) and COUNT(invoice_id) both count legs (27); SUM(invoice_id) adds ids together (378) — a pseudo-number with the right vibe and no meaning.",
      notes: [
        { choice: 1, why: "COUNT(invoice_id) counts non-NULL FKs — every leg has one, so it's 27 again. Without DISTINCT the split bills double-count exactly the way the fan-out wants." },
        { choice: 3, why: "SUM over an id column is the classic pseudo-aggregate: 378 looks like a total and reconciles with nothing. Ids are labels, not quantities." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-13",
      prompt: "GROUP_CONCAT(p.method) over a split bill's two legs prints what, exactly?",
      choices: ["card wire", "card, wire", "card,wire", "card|card"],
      answer: 2,
      why: "The default separator is a bare comma with NO space — 'card,wire'. If the board needs 'card, wire', you name the separator explicitly; and row order inside the fold isn't guaranteed unless you ask for it.",
      notes: [
        { choice: 1, why: "That's the humanized version you WISH printed. The default glue is ',' with no space — polite output is an explicit GROUP_CONCAT(..., ', ') decision, not a default." },
        { choice: 3, why: "The pipe is nobody's default. More importantly the doubled 'card' is the real content here: a split bill's legs fold to a string that still shows both legs — if the count matters, re-aggregate, don't parse." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-14",
      prompt: "The chase list runs WHERE i.id NOT IN (SELECT invoice_id FROM payments). A settlement import lands one leg with invoice_id NULL. What does the chase list return now?",
      choices: ["The 6 unpaid bills — NULL is ignored in set membership", "Zero rows — NOT IN against a set containing NULL is never TRUE", "An error — NULL in a subquery is illegal", "Only the unpaid bills above 1,000.00"],
      answer: 1,
      why: "x NOT IN (…, NULL) is UNKNOWN for every outer row, so nothing passes — the six unpaid bills, 15,217.00 of AR, silently vanish from the close. NOT EXISTS and LEFT JOIN + IS NULL are immune; that's why this desk writes anti-joins as joins.",
      notes: [
        { choice: 0, why: "That's how people WISH membership worked. SQL three-valued logic makes the NULL comparison UNKNOWN, and UNKNOWN never satisfies WHERE — the empty result looks like 'no unpaid bills', the most dangerous kind of clean." },
        { choice: 3, why: "There's no threshold in the predicate — the failure is total, not partial. Any filter that 'saves' part of the list would have to be a second condition nobody wrote." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-15",
      prompt: "SUM(p.amount_cents) OVER (ORDER BY paid_on): two legs share the same paid_on. What differs between the default frame and ROWS UNBOUNDED PRECEDING?",
      choices: ["Nothing — the frames are identical once ORDER BY is present", "RANGE includes both peer legs in each running total; ROWS steps one physical row at a time", "ROWS double-counts the peers; RANGE is the safe one", "RANGE raises an error on tied order keys"],
      answer: 1,
      why: "With ORDER BY, the default frame is RANGE: tied legs share the frame, so each same-day leg's running total jumps by the whole day's amount. ROWS UNBOUNDED PRECEDING counts physical rows and keeps the walk strictly incremental — one leg per step.",
      notes: [
        { choice: 2, why: "It's backwards: RANGE is the peer-inclusive default, so the DEFAULT is what overstates same-day steps when you wanted a per-leg walk. The 'safe' frame must be written, not assumed." },
        { choice: 3, why: "Ties are exactly what RANGE exists to handle — it includes them, deliberately. The error mode is human: someone reading a per-leg walk off a peer-inclusive total." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-16",
      prompt: "Which set-operation direction surfaces the chase list — bills with no settlement legs — and what does the reverse print?",
      choices: ["settled_ids EXCEPT billed_ids", "billed_ids EXCEPT settled_ids", "Both — EXCEPT is symmetric", "Neither — EXCEPT drops NULL rows"],
      answer: 1,
      why: "EXCEPT keeps the LEFT side's unmatched rows: billed-minus-settled is the six unpaid bills. The reverse — settled-minus-billed — is empty today because every leg attaches to a bill, and 'empty' is the healthy reconciliation reading.",
      notes: [
        { choice: 0, why: "That direction answers 'payment legs with no bill' — an orphan-leg detector, not a chase list. Direction IS the business question; flip it and you audit the wrong table." },
        { choice: 2, why: "EXCEPT is deliberately asymmetric — the left side survives. Symmetry belongs to INTERSECT, and confusing the two is how a chase list gets replaced by an empty audit." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-17",
      prompt: "Finding duplicate-charge pairs within one bill's legs: which join guard prints each unordered pair exactly once?",
      choices: ["ON a.invoice_id = b.invoice_id", "ON a.invoice_id = b.invoice_id AND a.id < b.id", "ON a.invoice_id = b.invoice_id AND a.id <> b.id", "DISTINCT after the equality join"],
      answer: 1,
      why: "The strict inequality keeps each pair once, in one direction, and never pairs a row with itself. <> still prints both orders (A,B) and (B,A); the bare equality join also pairs every leg with itself.",
      notes: [
        { choice: 2, why: "Close — <> kills the self-pair but keeps both mirror images: every duplicate prints twice and the 'pair count' doubles. The directional < is the canonical pair idiom." },
        { choice: 3, why: "DISTINCT can't help: (A,B) and (B,A) are different rows, so both survive the dedupe. Fix the join predicate, not the projection." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-18",
      prompt: "APAC cancelled 3 of 37 rides; the board wants 8.1. Which expression prints it?",
      choices: ["ROUND(SUM(cancelled)/COUNT(*)) * 100", "ROUND(100.0 * SUM(cancelled)/COUNT(*), 1)", "100.0 * SUM(cancelled)/ROUND(COUNT(*), 1)", "ROUND(COUNT(*), 1) / SUM(cancelled)"],
      answer: 1,
      why: "Promote to real (100.0 up front), divide by the raw denominator, THEN round to one decimal: 8.1. Rounding the denominator first changes the divisor (37.0 — harmless here, poison elsewhere), and integer-first division truncates to 0 before any multiplication can save it.",
      notes: [
        { choice: 0, why: "SUM/COUNT is integer division — 3/37 truncates to 0, times 100 is 0. The percentage board prints a flat zero across every market and nobody notices for a quarter." },
        { choice: 3, why: "That's 37 / 3 = 12.3 — the denominator over the numerator, rounded. Inverting a rate doesn't un-invert it with rounding." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-19",
      prompt: "27 legs settle 22 bills. Which expression prints payments-per-bill as 1.23?",
      choices: ["COUNT(*) / COUNT(DISTINCT invoice_id)", "1.0 * COUNT(*) / COUNT(DISTINCT invoice_id)", "ROUND(COUNT(*) / COUNT(DISTINCT invoice_id), 2)", "CAST(COUNT(*) AS INTEGER) / 22"],
      answer: 1,
      why: "The 1.0 promotes the division to real arithmetic BEFORE truncation: 27/22 = 1.2273, displayed 1.23. The bare integer division prints 1, and ROUND can't help — the damage happens at the division, two steps before ROUND runs.",
      notes: [
        { choice: 2, why: "ROUND of an already-truncated integer is 1.00 — two honest-looking decimals around a lie. Promotion must precede the division, not follow it." },
        { choice: 3, why: "Casting to INTEGER is the opposite of the fix — it guarantees the truncation. The cast that helps is REAL, and it must sit before the slash." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-20",
      prompt: "Top rider per market: WHERE ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(o.total) DESC) = 1 — what happens?",
      choices: ["It runs — window functions are fine in WHERE", "An error — windows evaluate after WHERE; wrap the windowed SELECT in a CTE and filter outside", "Every rider passes", "Only NULL-spend riders pass"],
      answer: 1,
      why: "Pipeline order is the law: windows run after row filtering, so the window function doesn't exist at WHERE time — the engine rejects it. The fix is structural: compute the window in a CTE, then filter rn = 1 in the outer query.",
      notes: [
        { choice: 0, why: "Some engines tolerate a few sins; window-in-WHERE isn't one of them. The habit to drill is the CTE wrap — it's also what makes the intent readable at review." },
        { choice: 2, why: "That's the silent-failure fantasy: if this compiled, the row predicate against a window value would still be wrong. It doesn't compile — the error is the lesson." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-21",
      prompt: "The trend spine buckets rides by month across 2024-01..2025-02. Which bucket format survives the whole span?",
      choices: ["STRFTIME('%Y', created_at)", "STRFTIME('%m', created_at)", "STRFTIME('%Y-%m', created_at)", "SUBSTR(created_at, 6)"],
      answer: 2,
      why: "'%Y-%m' keeps year AND month: fourteen distinct buckets. '%Y' folds the span to two; '%m' folds to twelve and merges two Januaries; SUBSTR from position 6 returns just the month part — the same trap as '%m' wearing a different hat.",
      notes: [
        { choice: 1, why: "'%m' is the sneaky one: twelve buckets looks plausible until 2024-01 and 2025-01 merge and the trend quietly doubles some Januaries. Month-only formats are year-blind." },
        { choice: 3, why: "SUBSTR(created_at, 6) extracts '-01'-style month tails from a 'YYYY-MM-DD' string — again year-blind, and it only works if the storage format never changes. '%Y-%m' states the grain in the query." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-22",
      prompt: "The pace walk runs LEAD(orders) OVER (ORDER BY month) across the fourteen-month spine. What does 2025-02's LEAD print?",
      choices: ["0 — no change yet", "NULL — no 2025-03 exists; the edge is data", "The 2024-02 value — LEAD wraps around", "An error at the boundary"],
      answer: 1,
      why: "LEAD runs off the end of the data and returns NULL — an absence, not a zero. Printing 0 fabricates a collapse in the last bucket; the walk's opening LAG is the mirror case, NULL by construction because no step exists INTO the first month.",
      notes: [
        { choice: 0, why: "COALESCE-ing the edge to 0 is the fabrication to refuse: 'rides collapsed in March' and 'March hasn't happened' must not look identical on a board." },
        { choice: 2, why: "Windows don't wrap. A walk that cycles back to 2024 would invent demand from old months — the edge NULL is the query telling you where the data ends." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-23",
      prompt: "Coverage pct per bill: which divisor refuses to divide by a zero-amount bill?",
      choices: ["100.0 * SUM(p.amount_cents) / i.amount_cents", "100.0 * SUM(p.amount_cents) / NULLIF(i.amount_cents, 0)", "100.0 * SUM(p.amount_cents) / COALESCE(i.amount_cents, 100)", "IFNULL(100.0 * SUM(p.amount_cents) / i.amount_cents, 0)"],
      answer: 1,
      why: "NULLIF turns the poison zero into NULL, and division by NULL is NULL — the bill drops out of the percentage gracefully instead of erroring or printing infinity. COALESCE is the display tool; NULLIF is the logic guard.",
      notes: [
        { choice: 2, why: "COALESCE here substitutes a FAKE divisor (100) when the amount is NULL — it rewrites the population instead of protecting the division. Display coalesces; logic NULLIFs." },
        { choice: 3, why: "IFNULL around the quotient only catches the NULL the NULLIF would have made — without NULLIF inside, division by a literal zero bill errors first. The guard belongs at the divisor." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-24",
      prompt: "Growth wants the top 5 riders by lifetime spend. Today the 5th sits alone (Chloe Dubois, 2,667.93; next is 1,686.17). What is the discipline for the day a tie STRADDLES the cut?",
      choices: ["LIMIT 5 is always fine — ties resolve themselves", "LIMIT picks by scan order silently — use DENSE_RANK and filter on the rank, stating the tie policy", "Add a random tiebreaker to the ORDER BY", "Raise the LIMIT until the tie resolves"],
      answer: 1,
      why: "LIMIT 5 with a tie at the boundary keeps an arbitrary subset — the dropped rider is a peer who lost to scan order. Rank-then-filter keeps the whole tie block (or breaks ties on a NAMED deterministic key), and the board's footnote says which policy shipped.",
      notes: [
        { choice: 2, why: "A random tiebreaker IS a decision — just an unauditable one. 'Who counts as a peer' is a business call the GM defends, so the rule must be deterministic and written down." },
        { choice: 3, why: "Widening the LIMIT hides the problem one row at a time and still cuts mid-tie whenever the tie is wider than the slack. The rank predicate is the only cut that respects tie blocks by construction." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-25",
      prompt: "Which bills are BOTH billed and settled? What does INTERSECT require, and what does it return here?",
      choices: ["Same row count on both sides; returns 22", "Same column count with comparable types, NULLs equal; billed-ids INTERSECT payment invoice_ids returns the 22 bills with legs", "An ORDER BY on both sides; returns 28", "A UNION ALL underneath; returns 27"],
      answer: 1,
      why: "Set ops demand symmetric shapes — same column count, comparable types — and treat NULLs as equal when matching. The intersection of the 28 billed ids with the ids behind 27 payment legs is the 22 bills that actually have legs.",
      notes: [
        { choice: 0, why: "Row counts don't need to match — 28 bills intersect 27 legs fine. The requirement is per-column shape, not per-side volume." },
        { choice: 2, why: "ORDER BY is a presentation concern for the final result, not a validity requirement of the operands. 28 would be ALL bills — that's the billed side alone, not an intersection." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-26",
      prompt: "The rail stack — card 16 legs, wire 11, TOTAL banner 27 — must open with the banner on top. Which ORDER BY, and what does its absence cost?",
      choices: ["legs ASC", "legs DESC", "rail ASC", "No ORDER BY — UNION ALL preserves insertion order"],
      answer: 1,
      why: "legs DESC reads 27, 16, 11 — banner first, biggest rail under it. And UNION ALL guarantees NO order: without an explicit ORDER BY the row order is whatever the plan produced, and the banner can drift below the rails on any plan change.",
      notes: [
        { choice: 0, why: "ASC opens on wire (11) and buries the banner last — the board reads smallest-first and the TOTAL reads as an afterthought instead of a reconciliation." },
        { choice: 3, why: "That's the dangerous one: 'insertion order' is not a contract set ops offer. The banner's position must be ordered into existence, every time, explicitly." },
      ],
      difficulty: "easy",
    },
    {
      id: "fn-mcq-27",
      prompt: "SUM(spend) OVER (ORDER BY spend) runs ascending by default. What does the LARGEST spender's row show in that running column?",
      choices: ["Its own spend only", "The whole book — 34,833.28", "The smallest spender's spend", "NULL — the frame is empty at the top"],
      answer: 1,
      why: "Ascending running order accumulates from the smallest up, so the last row (largest spender) carries the full book: 34,833.28. Direction decides meaning — the same window ordered DESC gives each rider the spend from them downward, a 'share of the big end' read instead.",
      notes: [
        { choice: 0, why: "That's what the row's own spend column shows; the running column at the top of an ASC walk has absorbed every row beneath it — the whole frame." },
        { choice: 2, why: "The smallest spender's row shows just its own spend (nothing accumulated yet) — the mirror of the top row. The pair together is the sanity check that the walk is ASC." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-28",
      prompt: "(SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id) sits in SELECT. What is the real objection at review?",
      choices: ["It's illegal in the projection", "It re-runs per outer row and can't be re-aggregated — fold once in a derived table when a second grain is needed", "It returns multiple rows per bill", "It ignores NULL amounts"],
      answer: 1,
      why: "Correlated scalars are legal but per-row: fine on a 28-bill book, the whole query at 28,000 — and the paid amount it produces can't be grouped again, so the class fold has nowhere to happen. The derived-table fold does the work once and stays groupable.",
      notes: [
        { choice: 2, why: "A well-formed scalar subquery returns 0-or-1 rows by contract — multi-row returns are the error case, not the common one. The objection is cost and grain, not cardinality accidents." },
        { choice: 3, why: "SUM ignores NULLs either way — same as the derived fold. The review point is that per-row re-execution and un-groupable projections don't scale to the next grain." },
      ],
      difficulty: "medium",
    },
    {
      id: "fn-mcq-29",
      prompt: "How do UNION, EXCEPT and INTERSECT treat NULLs when matching rows?",
      choices: ["NULLs never match — NULL rows survive EXCEPT from both sides", "NULLs compare equal for set ops — a NULL row on the right removes the NULL row on the left in EXCEPT", "Set ops error on NULLs", "It depends on the ORDER BY"],
      answer: 1,
      why: "Set-operation distinctness treats NULLs as equal — unlike WHERE comparisons, where NULL = NULL is UNKNOWN. That's why EXCEPT dedupes NULL rows the way it dedupes 5s, and why a NULL-heavy anti-join via EXCEPT behaves differently from a NOT IN chain.",
      notes: [
        { choice: 0, why: "That's WHERE-logic leaking into set-op reasoning. Set ops use IS-NOT-DISTINCT semantics for matching — NULLs are first-class equals in row comparison, a deliberate and useful divergence." },
        { choice: 2, why: "No error — NULL handling in set ops is well-defined and stable. The surprise is conceptual, and the fix is knowing the rule, not avoiding NULLs." },
      ],
      difficulty: "hard",
    },
    {
      id: "fn-mcq-30",
      prompt: "Four-week rolling surge: COUNT(*) OVER (ORDER BY ride_day ROWS BETWEEN 27 PRECEDING AND CURRENT ROW). What does the explicit frame buy over a bare OVER (ORDER BY ride_day)?",
      choices: ["Nothing — same window", "A bounded trailing 28-day window; the default RANGE frame grows unbounded to the partition start", "It deduplicates the days", "It sorts the final output"],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING — running totals from the beginning of time. ROWS BETWEEN 27 PRECEDING AND CURRENT ROW caps the accumulation at 28 physical rows, turning an all-time cumulative into a true rolling read.",
      notes: [
        { choice: 2, why: "Frames accumulate rows; they never dedupe them. If ride_day repeats, ROWS counts both rows — and whether that's right depends on the grain you named, not the frame." },
        { choice: 3, why: "ORDER BY inside OVER orders the window's evaluation, not the result set — the final ORDER BY is still yours to write. The frame's job is how many rows accumulate, not how they print." },
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
    {
      id: "cs-fn-3",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The unsettled bills chase list",
      brief:
        "Month-close collections memo on the storefront db: the billing book holds 28 invoices worth 86,977.00; the coverage census says 21 bills settled exact (65,612.00), 1 partial (#25, 4,000.00 of 6,148.00), and 6 bills have NO settlement rows at all — 15,217.00 of AR the reminder cycle needs today. Probed chase list, biggest first: #24 Emma Wilson 4,937.00, #26 Liam O'Brien 3,562.00, #27 Isabella Rossi 2,794.00, #28 Hiro Tanaka 1,756.00 (status claims 'paid' with zero legs — route to anomalies, not reminders), #21 Chloe Dubois 1,295.00, #18 Pedro Alvarez 873.00. Status is a claim; payment legs are the ledger of record.",
      ask: "Return the six unsettled bills: bill id, rider name, the status claim, and billed dollars — biggest bill first.",
      template:
        "SELECT i.id AS bill,\n       c.name AS rider,\n       i.status AS claim,\n       ROUND(i.amount_cents / {1}, 2) AS billed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\n{2} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {3}\nORDER BY billed {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Invoices carry INTEGER cents — billed is amount_cents / 100.0. The missing .0 truncates every odd-cent bill to a whole dollar and the chase list under-quotes AR quietly.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "The chase list exists to keep bills with NO legs — LEFT JOIN preserves them and lets the IS NULL test find them. INNER JOIN deletes exactly the rows the collections run exists to print.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the unmatched test",
          why: "p.id IS NULL keeps only bills whose LEFT JOIN payload never matched — the anti-join grammar. IS NOT NULL flips the read to the settlement ledger: 27 leg rows, not 6 bills.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "Collections work top-down: 4,937.00 first. ASC opens on Pedro Alvarez's 873.00 — the smallest exposure on top of a chase list is a prioritization lie.",
        },
      ],
      distractors: ["1000", "INNER", "NOT NULL", "ASC"],
      walkthrough:
        "The anti-join as a deliverable. invoices LEFT JOIN payments ON p.invoice_id = i.id keeps all 28 bills and attaches their legs; the IS NULL test keeps the 6 with no legs at all — #24 Emma Wilson 4,937.00 (US), #26 Liam O'Brien 3,562.00 and #27 Isabella Rossi 2,794.00 and #21 Chloe Dubois 1,295.00 and #18 Pedro Alvarez 873.00 (EU), #28 Hiro Tanaka 1,756.00 (APAC) — 15,217.00 total. The cents rule: amount_cents / 100.0 keeps odd cents; / 1000 would print 49.37 on the top bill and torch the list. Each distractor is a different disaster: INNER JOIN returns ZERO rows — every surviving bill has a payment, so the join kills its own population; IS NOT NULL returns the 27 settlement LEGS — the join's fan-out means that's a payments ledger, not a bills list (22 bills, five paying twice); ASC opens on 873.00 and inverts the collection priority. Note #28's claim column reads 'paid' with zero legs behind it: the status is a claim, the legs are the ledger — that row routes to the anomaly queue, not the reminder cycle.",
    },
    {
      id: "cs-fn-4",
      tier: "medium",
      topic: "s7",
      universe: "funnel",
      title: "The market status board",
      brief:
        "The weekly ops board is a CASE pivot: per market, one row carrying completed, en-route, awaiting-match and cancelled ride counts — the status map the funnel review reads left to right. Probed matrix: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 (completed/en-route/awaiting/cancelled over 103 rides). The board gates on completion: markets below 5 completed rides don't get a row — the pilot books (LATAM's 2) report separately so the core board stays readable. Watch APAC: 3 of 37 cancelled is an 8.1% share, the worst on the board, and US completes just 5 of 19 while 10 sit en-route.",
      ask: "Return the gated status board: market, completed, en_route, awaiting, cancelled — markets with at least 5 completed rides, best completion first.",
      template:
        "SELECT c.region AS market,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS en_route,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS awaiting,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nJOIN customers c ON c.id = o.{2}\nGROUP BY c.region\nHAVING completed >= {3}\nORDER BY completed {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-status arm",
          why: "Completion is the 'delivered' status on this ledger — 52 rides. Pointing the arm at 'cancelled' makes the completed column count the 7 cancellations and the gate reads a board of failures.",
        },
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the market-attach key",
          why: "Rides attach to markets through the rider: c.id = o.customer_id. Joining on o.id pairs each ride to whoever shares its row number — counts collapse from 45/37/19/2 to 8/5/2/1 because only rides 1..16 find a rider.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the completion floor",
          why: "The gate judges the FOLDED completed count: EU 24, APAC 21, US 5 stay; LATAM's 2 drops to the pilot report. The floor value 5 is also the cell it protects — US completes exactly 5.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-completion-first direction",
          why: "The board reads the strongest market first: EU 24, APAC 21, US 5. ASC would open the funnel review on the weakest row and read the story backwards.",
        },
      ],
      distractors: ["'cancelled'", "id", "6", "2", "ASC"],
      walkthrough:
        "Conditional aggregation with the gate judged on the fold. The join attaches each ride to its market via the rider; GROUP BY c.region makes four market buckets; the four CASE arms count statuses inside each bucket without ever shrinking the denominator — EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0, cross-footing to 52/30/14/7 over 103 rides. HAVING completed >= 5 judges the folded column (legal because HAVING runs after GROUP BY) and keeps EU, APAC and US; LATAM's 2 rides go to the pilot report instead of polluting the core board. Distractors, each a different wreck: the 'cancelled' arm makes the completed column read 3, 3, 1, 0 — the gate then passes NOTHING and the board ships empty; o.id as the join key pairs rides to whoever shares their row number, collapsing counts to 8/5/2/1 (the riders who happen to share ids with rides); floor 6 drops US — whose completed count IS 5, the exact boundary cell; floor 2 re-admits LATAM; ASC inverts the read. The story under the numbers: US completes 5 of 19 while 10 sit en-route, and APAC's 3 cancellations are an 8.1% share — the two cells the funnel review will interrogate first.",
    },
    {
      id: "cs-fn-5",
      tier: "medium",
      topic: "x3",
      universe: "refund-audit",
      title: "The settlement rail stack",
      brief:
        "The refund-audit board opens with the settlement rails, and the stack must cross-foot in one query: card legs beside wire legs, then a TOTAL banner that reconciles them — legs 27 = 16 + 11 and settled 69,612.00 = 37,364.00 + 32,248.00. Probed folds: card 16 legs / 37,364.00 (53.7% of settled value), wire 11 / 32,248.00. The banner leads the board — the reconciliation is the headline, not a footnote — and the audit checks that the banner's arithmetic is DERIVED (a fold over payments), never retyped. Payment legs carry INTEGER cents; five bills pay in two legs, so legs overstate bills (27 vs 22) and the audit reads legs.",
      ask: "Return the rail stack: rail, settlement legs and settled dollars for card and wire, then a TOTAL banner row — banner on top.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS legs,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled\nFROM payments p\nGROUP BY p.method\nUNION ALL\nSELECT {1},\n       {2},\n       ROUND(SUM(amount_cents) / {3}, 2) AS settled\nFROM payments\nORDER BY legs {4};",
      slots: [
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the banner label",
          why: "The banner row is a literal label over the whole fold — 'TOTAL'. Any other label prints a fourth rail that isn't one, and the board's reconciliation line stops being findable.",
        },
        {
          answer: "COUNT(*)",
          kind: "keyword",
          label: "the banner's leg counter",
          why: "The banner counts legs exactly as the rails do — 27 = 16 + 11. SUM(id) returns 378: ids are labels, and summing them produces a number with the right shape and zero meaning.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the banner's cents divisor",
          noVerify: true,
          why: "Same cents rule as the rails: SUM(amount_cents) / 100.0. A divisor of 1000 prints the banner at 6,961.00 while the rails still read thousands — the stack visibly stops cross-footing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the banner-first direction",
          why: "legs DESC reads 27, 16, 11 — TOTAL on top, biggest rail under it. ASC buries the banner last and the reconciliation reads as an afterthought.",
        },
      ],
      distractors: ["'RAILS'", "SUM(id)", "1000", "ASC"],
      walkthrough:
        "A self-auditing stack: the deliverable and the proof in one query. The first SELECT folds payments by method — card 16 legs / 37,364.00, wire 11 / 32,248.00 — and the UNION ALL branch folds the whole table again under the literal 'TOTAL': COUNT(*) gives 27 legs, SUM(amount_cents) / 100.0 gives 69,612.00, and the arithmetic is derived, never retyped: 27 = 16 + 11 and 69,612.00 = 37,364.00 + 32,248.00. ORDER BY legs DESC puts the banner first because 27 outranks both rails. Distractors: 'RAILS' as the banner label prints a fourth rail that isn't one and the reconciliation line vanishes from the board; SUM(id) in the banner counts 378 — id-summing is the pseudo-aggregate that survives eyeballing and dies in reconciliation; 1000 in the divisor prints the banner at 6,961.00 against rails reading 37,364.00 and 32,248.00 — the stack stops cross-footing in the most visible way possible; ASC demotes the banner to last. Why UNION ALL and not UNION: dedupe would print the same three rows today only by luck — the day two rails tie on every column, UNION silently eats one and the stack no longer proves itself.",
    },
    {
      id: "cs-fn-6",
      tier: "hard",
      topic: "q6",
      universe: "fraud",
      title: "The coverage-class census",
      brief:
        "The fraud spot-check needs every bill classed by what actually settled — and the classes must come from LEGS, not the status claim. Probed census: 21 bills exact (65,612.00), 6 bills with no payment rows (15,217.00), 1 bill partial — #25, 4,000.00 of 6,148.00. The classification is per bill: COUNT(p.id) = 0 means no payment; SUM(p.amount_cents) >= i.amount_cents means exact; else partial. Two anomalies hide in the classes: #28 (1,756.00) sits in 'no payment' while its status claims paid, and #11 (925.00, void) carries a payment row that keeps it out of the no-payment class entirely. The census folds bills to classes, then classes to counts — two folds, staged.",
      ask: "Return the coverage census: class, bill count and billed dollars — biggest class first.",
      template:
        "WITH per_bill AS (\n  SELECT CASE WHEN {1} THEN 'no payment'\n              WHEN SUM(p.amount_cents) >= i.amount_cents THEN 'exact'\n              ELSE 'partial' END AS cov,\n         i.amount_cents\n  FROM invoices i\n  {2} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n),\nclasses AS (\n  SELECT cov, amount_cents FROM per_bill\n)\nSELECT cov, COUNT(*) AS bills, ROUND(SUM(amount_cents) / {3}, 2) AS billed\nFROM classes\nGROUP BY cov\nORDER BY bills {4};",
      slots: [
        {
          answer: "COUNT(p.id) = 0",
          kind: "keyword",
          label: "the no-legs arm",
          why: "Inside the per-bill fold, zero attached legs is the no-payment test — p.id IS NOT NULL would call every PAID bill unpaid (22 'no payment' rows) and invert the census.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "Bills with no legs must survive to be classed — LEFT JOIN keeps them and hands the fold NULL payloads it can count. INNER JOIN deletes the no-payment class before it exists: the census would read 21 exact / 1 partial and the 15,217.00 hole disappears from the audit.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the census cents divisor",
          noVerify: true,
          why: "Billed dollars are INTEGER cents over 100.0 — / 1000 prints the census at 6,561 / 1,521 / 614 and the class sums stop reconciling with the 86,977.00 book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-class-first direction",
          why: "The audit reads 21 exact, then 6 no-payment, then 1 partial — population order. ASC opens on the single partial row and buries both the healthy majority and the hole.",
        },
      ],
      distractors: ["p.id IS NOT NULL", "INNER", "1000", "ASC"],
      walkthrough:
        "Two folds, staged — and the staging is load-bearing. Stage one (per_bill) folds payments onto each bill: LEFT JOIN keeps all 28 bills, GROUP BY i.id gives one row per bill, and the CASE classifies from the legs — COUNT(p.id) = 0 is no payment, SUM(p.amount_cents) >= i.amount_cents is exact, else partial. Stage two (classes) projects just the class and amount so the outer fold is a plain GROUP BY over real columns — grouping directly by the aggregate alias is rejected, and this middle layer is what makes the refold legal. The census: 21 exact / 65,612.00, 6 no payment / 15,217.00, 1 partial / 6,148.00, biggest class first. Distractors: p.id IS NOT NULL in the first arm re-labels every PAID bill as no-payment — 22 and 6, the census inverted; INNER JOIN deletes the six leg-less bills before classification, so the no-payment class never exists and the 15,217.00 hole vanishes from an audit that existed to find it; 1000 in the divisor reprices every class by a factor of ten; ASC buries the majority class. The anomalies the board quotes: #28 claims paid with zero legs (status is a claim), and void #11 at 925.00 carries a leg that keeps it out of no-payment — both live on the row-level anomaly list, and the census is how the fraud check finds which rows to pull.",
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
    { slug: "product-sales-analysis-iii", why: "The vertical fold's harder sibling: per-service revenue with the product's first-sale year attached — the mix census with a cohort axis growth asks for." },
    { slug: "sales-analysis-iii", why: "Services with no sales inside a window — the time-boxed supply anti-join: a family that moved nothing this season is a finding, not a blank row." },
    { slug: "list-the-products-ordered-in-a-period", why: "A monthly board gated on units moved in the period — the gate-judged fold the city GM deck ships every Monday." },
    { slug: "customer-order-frequency", why: "Riders bucketed by monthly activity — the frequency ladder behind the 63.5% concentration read and every retention conversation." },
    { slug: "number-of-employees-who-met-the-target", why: "Who cleared the bar in a period — the incentive-census shape behind driver and rider target reads on a multi-vertical fleet." },
    { slug: "classes-more-than-5-students", why: "Groups clearing a count floor via HAVING — the same gate the market status board uses to keep pilot books off the core board." },
    { slug: "duplicate-emails", why: "Duplicate identities in the signup fold — the rider-registry hygiene check that keeps the 16-rider census honest city by city." },
    { slug: "article-views-ii", why: "Same actor, same object, same day — the repeat-action pattern behind the same-rider-same-day booking review the fraud desk runs." },
    { slug: "average-time-of-process-per-machine", why: "Per-vehicle processing latency — the fleet-level sibling of the 2.98-day completion clock, one row per asset." },
    { slug: "monthly-transactions-ii", why: "Market spend by month with the declined overlay — the spine-and-status shape behind the 2024-01..2025-02 walk with cancellations beside it." },
    { slug: "human-traffic-of-stadium", why: "Consecutive busy slots — the streak read dispatch uses to find the nights a city's fleet actually saturated." },
    { slug: "consecutive-numbers", why: "Streaks in ordered logs — consecutive completed-ride runs per driver, the reliability story told without averaging it away." },
    { slug: "ads-performance", why: "Click-through with the rounding discipline — the acquisition-funnel share where 100.0 placement and ROUND timing are the whole grade." },
    { slug: "total-sales-amount-by-year", why: "Annualized spend ladders per rider — the cohort fold growth tells next to the 14-month monthly spine." },
    { slug: "game-play-analysis-iv", why: "First-event-then-next-day retention — the first-ride-to-second-ride shape that decides whether a city launch stuck." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Rolling-window actives with counts by day — the moving 30-day rider read the ops team prefers to any calendar month." },
  ],
};
