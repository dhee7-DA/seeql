// Voi — Wave-10 (Task 100), mobility domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// European e-scooter micromobility: the storefront db read as a city-permit fleet sandbox — customers are
// riders (region = the city's market rollup), orders = rides (delivered = completed 52, shipped = in-ride
// with shipped_at as the ride-start stamp 30, pending = reserved-unlock 14, cancelled = abandoned-unlock 7),
// order_items = ride line records (quantity = minutes on the line, unit_price = the per-minute rate the
// line locked), products = scooter models / ride passes, suppliers = city/permit + charging partners,
// invoices = city billing / corporate mobility statements, payments = payment rails (card = app/wallet,
// wire = city/corporate transfer), expenses = fleet/city opex (depot + charging-hall rent, swap-bay
// tooling, rider ads, field-crew travel), ledger_entries = the GL. Finance tables store INTEGER cents —
// the dollar read is amount_cents / 100.0; orders.total and order_items.unit_price are REAL dollars
// already. Angle kept DISTINCT from lime (completion pings, zombie telemetry, rebalancing, vendor recall):
// Voi = European permit economics (what the permit book costs and when it settles), per-vehicle-per-day
// utilization read at the minutes-and-intensity grain, and charging-swap opex. Pool provenance:
// company-pools.md carries NO Voi section — 0 tagged rows — so all 10 topic slug sets and all 16 problems
// are theme-curated from the pools file's theme menu (sql rows only; no write/schema/finance-band rows)
// and say so. Case briefs quote probed figures from scripts/company-facts.md (including the wave-8+9
// canonical cells); every case slot is mechanically verified against db/custom.db by scripts/case-audit.ts.
// Accent text-fuchsia-300: grepped `accent:` across all 20 mobility siblings (uber..hertz: green-400,
// fuchsia-400, lime-400, purple-400, teal-400, amber-200, emerald-300/200, green-300, red-400/300,
// yellow-400, sky-400, indigo-300, cyan-300, rose-300, pink-300, blue-300, violet-300, teal-300) plus the
// wave-10 mobility kit sixt (holds text-orange-300) — fuchsia-300 is held by no mobility sibling and is
// the closest free coral-adjacent class (Voi's coral fleet livery).

import type { CompanyKit } from "../types";

export const voiKit: CompanyKit = {
  id: "voi",
  domainId: "mobility",
  name: "Voi",
  tagline: "European e-scooter cities: permits, utilization, charging swaps",
  accent: "text-fuchsia-300",

  brief: [
    "**Voi** is the European e-scooter operator that runs shared fleets across dozens of cities on tendered, metered, revocable permits — short rides priced by the minute, scooters swapped and charged nightly by field crews, and a city counterparty that can re-tender the whole market. The unit economy is rides per vehicle per day set against two costs: the permit fee and the nightly charging swap. This kit maps the storefront db onto that world: the 16 customers rows are riders (region = market rollup), the 103 orders are rides worth **34,833.28** (average **338.19** against a 25.47 to 1,088.44 spread), and the 251 order_items rows are ride lines — quantity = minutes on the line, unit_price = the per-minute rate the line locked — **498 minutes** across the book. The status map is fixed: delivered = {emerald:completed} (52, 50.5%), shipped = {sky:in-ride} with shipped_at as the ride-start stamp (30, 29.1%), pending = reserved-unlock (14), cancelled = {rose:abandoned-unlock} (7, 6.8%).",
    "The data org splits into city-permit pods (tenders, fee schedules, renewals), fleet ops (charging swaps, rebalancing, field-crew routing) and a small finance pod that reads city billing and corporate mobility statements. A ride books at created_at, and `shipped_at` is stamped the moment the scooter actually moves — **82 of 103 rides** carry the stamp, averaging **2.98 days** of unlock-to-start lag with a **2–4 day** spread, while the 14 reserved rows have none yet (a population definition, not a cleanup job). Money sits one layer down: statements and settlement rails in INTEGER cents, where the euro read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of ride value comes from riders whose lifetime spend crosses 3,000 (71.2% above 2,000) — and the book skews European: the EU market runs 45 rides / 15,089.23, the largest regional book on the ledger.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU runs 45 rides from just 8 riders (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do the 21 rides that never started sit in your base?'*), then into the rate-card bands at the 55 line: lines locking a rate under it carry **268 minutes @ 31.01** average line price, lines at or above it carry **230 @ 115.85** — where the minutes are is not where the money is. Late rounds walk the {sky:14-month ride spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or open the permit coverage split — **21 exact / 1 partial / 6 never-settled** — where settlement legs, not statuses, are the ledger of record.",
    "Preparation strategy: the pools file carries no Voi section — zero tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: unlock funnels, two-grain market censuses, minutes-times-rate line folds, utilization leaderboards, per-minute CASE bands, and the cents-safe permit spine. Do the topics in order, then run **both case studies** on the live storefront db: one rebuilds the {amber:swap-ops cost bench} fleet finance reviews every month, the other rebuilds the {violet:permit coverage grid} city billing closes with. The bar to clear: *state which population you are measuring — unlocked, started, or completed — before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day opens on the city board: overnight unlocks versus rides that actually moved, the {rose:abandoned-unlock} heatmap, and the permit ledger's overnight settlements. First query is the one-pass status census — 52 completed + 30 in-ride + 14 reserved + 7 abandoned = **103 by construction** — and a branch that fails that identity is *the day's first incident*, not a rounding note. Next the start-stamp check: if unlock-to-start drifts off the **2.98-day** norm — APAC runs fastest at 2.93, LATAM slowest at 3.5 — the rebalancing sweep gets re-cut before the city's morning commute, *because a scooter that never starts is a scooter the permit is paying for anyway*.",
    "**11:30 —** Midday is the utilization read. Fleet ops wants the rate-card bands re-cut — 268 minutes riding under the 55 line at a 31.01 average line price against 230 minutes above it at 115.85, and **498 minutes** total across 251 ride lines; the city-permit pod wants rides-per-rider intensity beside rider counts (EU 5.6 versus US 9.5) for the quarterly tender appendix; the swap crew wants the depot cost check — {rose:Rent 16,800} of the 25,416 opex book, tools 1,525 — before the charging-hall lease renews. Each ask is a join, a conditional aggregate and one judgment call about grains: rides, riders, lines, minutes — *four grains, and quoting one under another's name is how a fleet looks busier than it is*. The analyst writes the query twice — once to answer, once with the definition spelled out so the number survives the tender argument.",
    "**15:30 —** The afternoon tilts toward permit money. The settlement anti-join refreshes first — **6 never-settled statements worth 15,217.00** — before city billing sends a single fee reminder; the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs behind it (#28, 1,756.00). The rails read closes it — card 16 legs / 37,364.00 against wire 11 / 32,248.00, app riders versus city transfers. The day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Rides started", what: "Rides with a start stamp ÷ ALL rides booked: 82 of 103 (79.6%). The top-of-funnel number city ops reads every Monday — the 14 reserved-unlock rows are 'not yet', never a silent zero." },
    { name: "Unlock-to-start lag", what: "created_at → shipped_at over started rides only: 2.98-day average, range 2–4; by market EU 2.94, APAC 2.93, US 3.07, LATAM 3.5. The population statement — started rides only — IS the metric." },
    { name: "Completed-ride share", what: "Delivered ÷ ALL rides booked: 52 of 103 (50.5%), with 30 more in-ride (29.1%). 'Completed' is a status-filtered conditional count, and the denominator — reserved and abandoned included — is the whole interview." },
    { name: "Abandoned-unlock share", what: "Cancelled ÷ booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The rider-behavior number that prices unlock deposits and sizes the rebalancing queue." },
    { name: "Ride book value", what: "34,833.28 across 103 rides, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the pass-mix story — one 1,088.44 corporate ride bundle outweighs the smallest 42 combined." },
    { name: "Ride-minute fan-out", what: "Ride lines per ride: 251 order_items across 103 rides (2.44), folding to 498 minutes book-wide with no line longer than 3. The join-fan-out health check: any ride-grain SUM that joins lines without re-folding reports inflated totals, and this ratio is where the inflation shows first." },
    { name: "Permit outstanding", what: "City/corporate statements invoiced but unsettled: 6 holding 15,217.00, against a coverage census of 21 exact / 1 partial (4,000 of 6,148) / 6 none. Settlement runs 28.4 days on average against fixed 30-day terms (fastest 13, slowest 84) — drifting past terms is how a permit renegotiation starts." },
    { name: "Swap-ops cost load", what: "Fleet/city opex folded by category: depot and charging-hall Rent 14 filings / 16,800.00 leads, Ads 14 / 4,570.00, swap-bay Tools 5 / 1,525.00, field-crew Travel 3 / 2,521.00 — 25,416.00 tying to the GL operating_expenses fold. The margin story starts with parking and charging, not scooters." },
  ],

  topics: [
    {
      name: "Unlock-to-completion counts",
      why: "Every Voi screen opens with the ride funnel: rides booked, started (shipped_at stamped), completed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-ride scooter 'completed' — 30 versus 52 on this db — and the follow-up is always the 21 rides that never started at all.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "funnel-step-conversion"],
    },
    {
      name: "Two-grain market censuses",
      why: "Rides and riders are different grains of the same join, and every market census here reports both: EU runs 45 rides from 8 riders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is fleet load and which is rider coverage — is the habit being graded. The ratio between them is the utilization-intensity read the tender appendix quotes.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining riders to rides",
      why: "Riders carry region and created_at; rides inherit them through joins, and the join type decides who survives. A ride without a rider is corruption; a rider without rides is dormant-base whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-i"],
    },
    {
      name: "Ride-line fan-out: minutes × rate",
      why: "Line-level reporting means attaching model, pass family and per-minute rate to every ride line — the products-to-order_items join where quantity is minutes and unit_price is the locked rate. Voi's follow-up is always the fan-out: join lines in and COUNT(*) silently stops counting rides — 103 rides become 251 lines and 498 minutes, three grains wearing one query.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "queries-quality-and-percentage"],
    },
    {
      name: "Utilization leaderboards",
      why: "Hardest-working scooter model, heaviest rider, top market by minutes — utilization reporting is leaderboard reporting. Voi drills the rank trio because ties are guaranteed at fleet scale — four riders sit at 4 rides each on this db under a 24/17/14/13/5 ladder — and the LIMIT-1-OFFSET-1 habit breaks exactly on ties.",
      slugs: ["rank-scores", "top-earners", "find-top-performing-driver"],
    },
    {
      name: "Per-minute rate bands (CASE)",
      why: "The rate card is CASE-shaped: lines lock a per-minute rate and the book splits at the 55 line — 268 minutes under it at a 31.01 average line price, 230 over it at 115.85. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Ride-pace month walks & LAG",
      why: "The 14-month ride spine (2024-01 to 2025-02) is the city-review call's home turf: prior month beside current, delta rounded, the 1,193.86 July trough and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero — and the calendar is verified, not assumed.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Permit coverage & set algebra",
      why: "Board packets stack populations — never-settled statements beside fully settled ones, invoiced cities diffed against settled cities with EXCEPT, grand-total rows riding UNION ALL. UNION dedups whole rows silently, which makes it a correctness question, not a style one; the never-settled anti-join (6 statements, 15,217.00) is the query city billing runs first at every close.",
      slugs: ["customers-who-never-order", "movie-rating", "the-airport-with-the-most-flights"],
    },
    {
      name: "One-pass ride-status censuses",
      why: "The ops board gets completed, in-ride, reserved and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the city review is waiting.",
      slugs: ["active-businesses", "count-salary-categories", "create-a-session-bar-chart"],
    },
    {
      name: "City billing & cents discipline",
      why: "Completed is not settled — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the permit world meets money. Every euro read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the 30-day terms clock (28.4-day average settlement) is the civic-credit read.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "monthly-transactions-ii"],
    },
  ],

  theory: [
    {
      id: "voi-t1",
      q: "Your market report joins riders to rides. When do you INNER and when do you LEFT — and what silently breaks if you filter a ride column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A ride-value report joins rides to riders: a ride with no rider row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-rider report must be LEFT from riders: the riders with no rides ARE the answer, arriving with NULL ride columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload rider row — the LEFT quietly became an INNER and the dormant base vanished while the query still reads fine. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-riding riders — all 16 riders appear in the ride table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table ships an empty cohort that looks like a victory. The permit twist: city billing statements join through the same riders, and a statement whose rider is missing is not whitespace, it is a billing incident with a city on it.",
      tag: "joins",
    },
    {
      id: "voi-t2",
      q: "Four riders tie at 4 rides on the utilization leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which rider gets the loyalty credit first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer riders (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. At Voi this is not academic: the leaderboard decides which rider cohort gets the free-minute grant, and two riders with identical records must never read different rungs because the query guessed.",
      tag: "windows",
    },
    {
      id: "voi-t3",
      q: "The census shows 103 rides and 16 riders; EU shows 45 rides and 8 riders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts ride rows after the join — one row per ride, so a rider with 24 rides contributes 24. COUNT(DISTINCT customer_id) folds those rows back to riders — EU's 45 rides collapse to 8 riders. Neither is wrong: rides measure fleet load and permit-metered activity, riders measure installed base and coverage. The ratio — 5.6 rides per rider in EU versus 9.5 in the US on this db — is the intensity signal that decides where the fleet grows next and what the tender appendix claims. The trap that catches candidates is a third grain: join order_items for ride lines and COUNT(*) silently counts lines, not rides — 251 of them — and SUM(quantity) is a fourth grain, the 498 ride-minutes the fleet actually turned. Saying 'one row per what?' for every COUNT is the habit the panel grades, because the utilization story changes with each grain and only one of them is the number the slide promised.",
      tag: "aggregation",
    },
    {
      id: "voi-t4",
      q: "shipped_at is NULL until the scooter actually moves. What is your policy for the unlock-to-start report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only started rides have a lag, so the report measures unlock-to-start for the 82 of 103 rides that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL rides returns the started-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the started subset; the gap between it and COUNT(*) is exactly the 14 reserved plus 7 abandoned rides, which is a feature, not a bug — that gap IS the in-flight picture the rebalancing queue works from. What is never acceptable is IFNULL-ing the lag to zero to 'fix' the average — that invents same-day starts for scooters that never moved, and the fleet plan gets staffed off a fiction. A report whose WHERE clause is doing definitional work without saying so is exactly what a Voi reviewer hunts for, because the same NULL ambiguity feeds three different KPIs: rides started, rides completed, and rides that never left the rack.",
      tag: "nulls",
    },
    {
      id: "voi-t5",
      q: "The fleet-finance review wants cost categories carrying at least five filings. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-ride, reserved and abandoned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The five-filing floor is a group-level fact — HAVING COUNT(*) >= 5 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between the recurring-cost bench and an error, and between a threshold applied to filings versus to euros. On this db the floor keeps exactly the recurring lines — Rent 14 filings, Ads 14, swap-bay Tools 5 — while field-crew Travel sits at 3 filings and drops off the bench, which is precisely the one-off-versus-recurring distinction finance wanted the query to make. The strong answer places every filter by asking: is this a fact about one filing, or about a category?",
      tag: "pipeline",
    },
    {
      id: "voi-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 rides always produce a mean (338.19 on this book). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides: cut the spine to a thin month and the whole report evaporates. The correlated cousin (compare each ride to ITS rider's own average) re-runs per outer row and answers a different question at a different cost — 'is this ride big for THIS rider' rather than for the network — which is the corporate-account question, not the fleet-mix one. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "voi-t7",
      q: "The ride trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's unlocks, and end-of-quarter commuter rides land exactly there. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The calendar gets verified, not assumed: this book opens at 3,731.97, troughs at 1,193.86 in July 2024, and both abandoned-heavy months (2 each) sit in July and November — a European seasonality story you check against the data before you put it in the tender deck, not one you import from intuition.",
      tag: "dates",
    },
    {
      id: "voi-t8",
      q: "City billing says a statement is 'paid' but the settlement rails have no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN settlement legs, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; a partial (#25, 4,000.00 of 6,148.00) needs the coverage CASE, not a binary paid flag. The money rule: statements and settlements carry INTEGER cents, so every euro read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent statement in the permit book. Reconciliation culture here: the coverage split must read 21 exact / 1 partial / 6 never-settled, and the GL trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "voi-mcq-1",
      prompt: "A ride row's status reads 'shipped'. In this kit's Voi stage map, what happened?",
      choices: ["Completed — the ride ended cleanly", "In-ride — the scooter is moving, start-stamped, not yet completed", "Abandoned — the rider gave up", "Reserved — unlocked but never started"],
      answer: 1,
      why: "The stage map is fixed: shipped = in-ride with shipped_at as the ride-start stamp (30 of 103 rides, 29.1%). It is the only status where the scooter is earning minutes right now.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 rides. Calling in-ride rows completed inflates the completed share before a single scooter parks." },
        { choice: 2, why: "Abandoned is 'cancelled' — 7 rides that never really started. 'Shipped' rows carry a start stamp; abandoned rows never got one." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-2",
      prompt: "Rides-started rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 started, 14 reserved and 7 abandoned of 103 booked.",
      choices: ["Started + abandoned only (82/89 = 92.1%)", "All rides booked (82/103 = 79.6%)", "Completed rides only (52/82)", "Distinct riders (82/16)"],
      answer: 1,
      why: "The house definition: started ÷ ALL rides booked — reserved rows stay in the denominator because 'not yet started' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 reserved inflates the rate to 92.1% by deleting the population still sitting on the rack — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is completion, shipped_at is the start stamp. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-3",
      prompt: "EU carries 45 rides from 8 riders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts ride rows (45); COUNT(DISTINCT customer_id) folds repeats back to riders (8). The gap between them — 5.6 rides per rider — is the utilization-intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every ride has a rider. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not riders — a third grain nobody asked for. The census is rides AND riders." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned rides only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandoned share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between APAC's 8.1 and a displayed 8 — or a 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.081 to 0 first, then scales — the abandoned map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-5",
      prompt: "The cost bench keeps only categories with at least 5 filings. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY category HAVING COUNT(*) >= 5", "WHERE filings >= 5 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A filing-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps Rent (14), Ads (14) and swap-bay Tools (5) — field-crew Travel at 3 filings drops off the bench.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'filings' column on the raw expenses table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-6",
      prompt: "The rider ladder runs 24, 17, 14, 13, 5 rides, then FOUR riders tied at 4. Under RANK, what rank do the two 3-ride riders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-ride riders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The loyalty desk's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-lag rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The reserved rides double-counted their unlock day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the started-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 rides.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-8",
      prompt: "order_items fans 103 rides into 251 lines (498 minutes). On orders ⋈ order_items, which pair counts RIDES?",
      choices: ["COUNT(*) and COUNT(DISTINCT order_id)", "COUNT(*) and SUM(quantity)", "COUNT(DISTINCT product_id) and COUNT(*)", "SUM(quantity) and COUNT(DISTINCT product_id)"],
      answer: 0,
      why: "After the fan-out, only COUNT(DISTINCT order_id) folds lines back to rides — COUNT(*) counts 251 rows. SUM(quantity) counts minutes (498), a third grain entirely.",
      notes: [
        { choice: 1, why: "SUM(quantity) is the minutes number, not the ride count — the fan-out trap: after joining order_items, COUNT(*) stops counting rides too." },
        { choice: 2, why: "COUNT(DISTINCT product_id) counts distinct scooter models or passes touched — catalog coverage, not ride volume. Both columns answer questions nobody asked." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-9",
      prompt: "A staging-table abandoned-ride list uses rider_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every ride carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-10",
      prompt: "A city billing statement row holds 175600 cents (the #28 statement, 1,756.00 euros). Which expression prints its euro value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic: 1,756.00 euros. The .0 is the whole fix — 175600 / 100 in integer math truncates, silently eating cents on every odd-cent statement in the permit book.",
      notes: [
        { choice: 0, why: "Integer ÷ integer in SQLite is integer division: 175600/100 = 1756. On whole-euro amounts the leak hides; the first odd-cent statement exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying turns cents into 17,560,000 — units inverted. Sanity-check the magnitude: euros are smaller than cents." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-voi-1",
      tier: "easy",
      topic: "l8",
      universe: "expense",
      title: "The swap-ops cost bench",
      brief:
        "Voi-flavored brief on the storefront db: fleet finance opens the monthly review with the recurring-cost bench — per cost category, how many filings it carries and what it costs in euros, gated at 5 or more filings so only the recurring lines make the bench. Probed facts: the opex book holds 36 entries — Rent 14 filings / 16,800.00 (depot and charging-hall leases), Ads 14 / 4,570.00 (rider acquisition), Tools 5 / 1,525.00 (swap-bay tooling); field-crew Travel sits at 3 filings / 2,521.00 and misses the gate by one filing. Every category's count and spend reconcile to the probed expense table; the review reads biggest spend first.",
      ask: "Return each cost category carrying 5 or more filings with its filing count and euro spend to 2 decimals, biggest spend first.",
      template:
        "SELECT category,\n       {1}(*) AS filings,\n       ROUND(SUM(amount_cents) / {2}, 2) AS spend\nFROM expenses\nGROUP BY category\n{3} COUNT(*) >= {4}\nORDER BY spend {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the filing counter",
          why: "COUNT(*) folds rows per category — Rent's 14 filings vs Tools' 5 is the bench's shape. SUM(*) does not exist in SQL, and any other fold prices or minimizes instead of counting: three different grains wearing one column name.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "The expense book stores INTEGER cents, so the euro read is amount_cents / 100.0 — the .0 promotes real division before any truncation and keeps 1,525.00 printing with its cents. Fleet finance reconciles this bench to the GL operating_expenses fold; the rule is non-negotiable.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the group-level gate",
          why: "COUNT(*) only exists after GROUP BY folds the 36 filings, so the 5-filing floor must be judged in HAVING. WHERE runs before groups form, and an aggregate there is an error — the engine's rejection IS the pipeline-order lesson.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the recurring gate",
          why: "The bench is categories with 5 or more filings — it keeps exactly three, and swap-bay Tools lands on the line with precisely 5. A gate of 3 floods the bench with field-crew Travel (3 filings), the one-off line finance explicitly wants off the recurring read.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The review reads biggest spend on top: Rent 16,800.00, Ads 4,570.00, Tools 1,525.00. ASC would open the meeting on the smallest line and bury the charging-hall lease — a correct query aimed at the wrong end of the page.",
        },
      ],
      distractors: ["SUM", "MAX", "1000", "WHERE", "3", "ASC"],
      walkthrough:
        "One table, one fold, one gate. GROUP BY category folds the 36 expense filings into four candidates, COUNT(*) reads each category's depth, ROUND(SUM(amount_cents) / 100.0, 2) reads euro spend, and HAVING COUNT(*) >= 5 keeps the recurring bench: Rent 14 filings / 16,800.00, Ads 14 / 4,570.00, Tools 5 / 1,525.00 — 22,895.00 of the 25,416.00 opex book, with field-crew Travel (3 filings / 2,521.00) correctly off the bench as a one-off line. The cents rule holds: the /100.0 divider is why 16,800.00 prints with its cents and ties to the GL operating_expenses debit fold. The distractors fail honestly: SUM and MAX in the counter slot are aggregate-with-* syntax errors; 1000 in the cents divider rescales every euro read and the bench stops footing to the GL; WHERE before the fold errors on the aggregate; 3 as the gate floods the bench with Travel and defeats the recurring-only definition; ASC turns the review upside-down and opens on the smallest line. The read is the gate itself: recurring cost is a count decision, not a spend decision — and the 5-filing line is where one-off field spend falls off the ledger.",
    },
    {
      id: "cs-voi-2",
      tier: "medium",
      topic: "s7",
      universe: "month-close",
      title: "The permit coverage grid",
      brief:
        "Voi-flavored brief on the storefront db: month-end permit close, and city billing wants the coverage grid — every statement classified by its settlement legs, not its status column. Probed facts: 28 statements fold to exact 21 / 65,612.00 billed and settled (including the void-but-settled #11 at 925.00, whose single leg covers it in full), none 6 / 15,217.00 / 0.00 settled — five open statements (873.00, 1,295.00, 2,794.00, 3,562.00, 4,937.00) plus the paid-status lie #28 at 1,756.00 — and partial 1 / 6,148.00 / 4,000.00 (#25). The grid reads biggest bucket first, and settlement legs are the ledger of record: statuses are claims.",
      ask: "Return each coverage bucket — none, exact or partial — with its statement count, billed and settled euro totals to 2 decimals, biggest bucket first.",
      template:
        "WITH per_statement AS (\n  SELECT i.id,\n         i.amount_cents AS billed_cents,\n         {1}(p.id) AS legs,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  {2} JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n)\nSELECT CASE WHEN legs = {3} THEN 'none'\n            WHEN paid_cents = billed_cents THEN 'exact'\n            ELSE 'partial' END AS coverage,\n       COUNT(*) AS statements,\n       ROUND(SUM(billed_cents) / 100.0, 2) AS billed,\n       ROUND(SUM(paid_cents) / {4}, 2) AS settled\nFROM per_statement\nGROUP BY coverage\nORDER BY statements {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the leg counter",
          why: "COUNT(p.id) counts settlement legs per statement — 0, 1 or 2 — and the whole classification hangs on that count. SUM(p.id) adds leg ids together (a number that means nothing), and MAX(p.id) returns NULL for zero-leg statements, silently re-bucketing the entire none bucket as partial.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-keeping join",
          why: "LEFT JOIN keeps every statement row even when no settlement leg matches — the zero-leg population IS the none bucket. INNER JOIN deletes exactly those rows and the grid reports a clean book while 15,217.00 of permit fees sit unsettled.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the zero-leg arm",
          why: "legs = 0 is the never-settled arm — six statements land there, and their settled total reads a flat 0.00, the cell that proves the bucket is empty of money. A gate of 1 swings the arm to the seventeen 1-leg statements and the grid mis-classifies the whole book.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Statements and settlement legs store INTEGER cents, so both euro reads are / 100.0 — the .0 promotes real division before truncation and keeps 65,612.00 printing with its cents. City billing reconciles this grid to the ledger; the rule is non-negotiable.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bucket-first direction",
          why: "The close reads biggest bucket on top: exact 21, none 6, partial 1. ASC would open the review on the single partial statement and bury the 21-statement settled book — a correct grid aimed at the wrong end of the meeting.",
        },
      ],
      distractors: ["SUM", "MAX", "INNER", "CROSS", "1", "1000"],
      walkthrough:
        "Two stages: fold legs per statement, then classify and pivot. The CTE LEFT JOINs every statement to its settlement legs — COUNT(p.id) reads legs (0, 1 or 2), COALESCE(SUM(p.amount_cents), 0) reads paid cents with the zero-leg statements pinned at 0 — and the outer CASE classifies: legs = 0 is none, paid = billed is exact, else partial. The grid reads exact 21 / 65,612.00 / 65,612.00, none 6 / 15,217.00 / 0.00, partial 1 / 6,148.00 / 4,000.00 — footing to 28 statements and 86,977.00 billed, the whole permit book. The classification is leg-honest by construction: void-but-settled #11 (925.00) rides in the exact bucket because its leg covers it, and paid-status #28 (1,756.00) lands in none because zero legs exist — statuses are claims, legs are the ledger. The distractors each break differently: SUM or MAX in the leg counter re-derives legs as meaningless sums or NULLs and re-buckets the book; INNER (or CROSS, which SQLite folds to inner semantics) deletes the zero-leg rows and the none bucket vanishes while 15,217.00 sits unpaid; 1 as the zero-leg gate re-aims the arm at the 1-leg statements; 1000 in the cents divider rescales every euro cell; ASC buries the settled book under the one partial. The close ships on legs, not statuses — delta zero or it does not ship.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Share of riders hitting a milestone out of all booked — the completed-share shape whose denominator (unlocked, started, completed) Voi interviewers ask about out loud before the SQL runs." },
    { slug: "confirmation-rate", why: "LEFT JOIN with NULLs folding to zero inside a rounded rate — the unlock-confirmation read where an unconfirmed unlock is data, not noise, and the rounding lands only at the display edge." },
    { slug: "trips-and-users", why: "Cancellation shares by market with restricted populations excluded — the abandoned-unlock map's mobility classic, where stating the exclusion is the entire exercise." },
    { slug: "average-selling-price", why: "Period-weighted rates over a join — the per-minute-rate read where weighting by minutes versus by lines changes the answer, the favorite Voi follow-up on any rate question." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The volume-argmax read: which rider holds the most rides — the top of the ladder at 24 on this db, decided on a grouped count with ties owned, not hidden." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Each rider's most-used scooter model or pass — the per-rider argmax that drives the free-minute grants and next quarter's fleet-mix order." },
    { slug: "rolling-7d-actives", why: "Trailing-window distinct riders per market — weekly active riders, the frame-discipline muscle behind the city board's trend panels." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU ratios in one fold — rider stickiness per city, the growth read the tender appendix quotes to prove the fleet is used, not parked." },
    { slug: "server-utilization-time", why: "Minutes-in-use versus idle span — the utilization fold in its purest form: rides per vehicle per day starts here, with the started-versus-booked population stated." },
    { slug: "calculate-parking-fees-and-duration", why: "Duration folded into CEIL-billed blocks — per-minute fare math with boundary rules, exactly how a ride line's minutes and rate turn into a billed amount." },
    { slug: "bank-account-summary", why: "LEFT JOIN with a NULL arm folded into deposits and withdrawals — statements without settlement legs handled honestly, the shape behind the permit dunning draft." },
    { slug: "gl-reconciliation", why: "Debits against credits with a delta column — the permit-close reflex this kit's GL demands: 181,080 against 181,080, delta zero or the close does not ship." },
    { slug: "keep-latest-dedupe", why: "ROW_NUMBER keep-latest with a deterministic tie-break — swap-log telemetry double-fires on retries, and the dedupe rule must be a named policy, not an accident." },
    { slug: "duplicate-charge-pairs", why: "Self-join over near-identical charge rows — the double-billed ride-line screen city billing runs before a statement goes to a city counterparty." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Riders who rode commuter passes and day passes but never the monthly bundle — conditional aggregation over pass-mix behavior that drives the upsell list." },
    { slug: "list-the-products-ordered-in-a-period", why: "Models active in a launch window with a volume floor — half-open date logic plus HAVING, the seasonal-fleet query shape behind every city launch review." },
  ],
};
