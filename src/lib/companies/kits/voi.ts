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
// company-pools.md carries NO Voi section — 0 tagged rows — so all 10 topic slug sets and all 32 problems
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
    "Preparation strategy: the pools file carries no Voi section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: unlock funnels, two-grain market censuses, minutes-times-rate line folds, utilization leaderboards, per-minute CASE bands, and the cents-safe permit spine. This expanded kit is built for spaced practice rather than one sitting: run the **six case studies** on the live storefront db, then re-run each a week later from a blank editor — *the second pass is where recall actually forms*. They cover the asks the permit desks rehearse most: the {amber:swap-ops cost bench} fleet finance reviews every month, the {violet:permit coverage grid} city billing closes with, the per-minute band census the rate card is priced from, the ride-pace month spine behind the tender deck, the swap-ops register stack the close packet ships on, and the {sky:rider ladder board} the growth pod mails free-minute grants from. The bar to clear: *state which population you are measuring — unlocked, started, or completed — before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "funnel-step-conversion", "bikes-last-time-used", "immediate-food-delivery-ii"],
    },
    {
      name: "Two-grain market censuses",
      why: "Rides and riders are different grains of the same join, and every market census here reports both: EU runs 45 rides from 8 riders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is fleet load and which is rider coverage — is the habit being graded. The ratio between them is the utilization-intensity read the tender appendix quotes.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "classes-more-than-5-students", "customer-order-frequency", "cohort-repeat-revenue"],
    },
    {
      name: "Joining riders to rides",
      why: "Riders carry region and created_at; rides inherit them through joins, and the join type decides who survives. A ride without a rider is corruption; a rider without rides is dormant-base whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "employee-bonus", "sales-analysis-i", "count-student-number-in-departments", "customer-who-visited-but-did-not-transact", "dormant-reactivation"],
    },
    {
      name: "Ride-line fan-out: minutes × rate",
      why: "Line-level reporting means attaching model, pass family and per-minute rate to every ride line — the products-to-order_items join where quantity is minutes and unit_price is the locked rate. Voi's follow-up is always the fan-out: join lines in and COUNT(*) silently stops counting rides — 103 rides become 251 lines and 498 minutes, three grains wearing one query.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "queries-quality-and-percentage", "basket-depth-aov"],
    },
    {
      name: "Utilization leaderboards",
      why: "Hardest-working scooter model, heaviest rider, top market by minutes — utilization reporting is leaderboard reporting. Voi drills the rank trio because ties are guaranteed at fleet scale — four riders sit at 4 rides each on this db under a 24/17/14/13/5 ladder — and the LIMIT-1-OFFSET-1 habit breaks exactly on ties.",
      slugs: ["rank-scores", "top-earners", "find-top-performing-driver", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Per-minute rate bands (CASE)",
      why: "The rate card is CASE-shaped: lines lock a per-minute rate and the book splits at the 55 line — 268 minutes under it at a 31.01 average line price, 230 over it at 115.85. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the fleet.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "credit-utilization-bands"],
    },
    {
      name: "Ride-pace month walks & LAG",
      why: "The 14-month ride spine (2024-01 to 2025-02) is the city-review call's home turf: prior month beside current, delta rounded, the 1,193.86 July trough and the +1,158.21 jump into August named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero — and the calendar is verified, not assumed.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "average-time-of-process-per-machine"],
    },
    {
      name: "Permit coverage & set algebra",
      why: "Board packets stack populations — never-settled statements beside fully settled ones, invoiced cities diffed against settled cities with EXCEPT, grand-total rows riding UNION ALL. UNION dedups whole rows silently, which makes it a correctness question, not a style one; the never-settled anti-join (6 statements, 15,217.00) is the query city billing runs first at every close.",
      slugs: ["customers-who-never-order", "movie-rating", "the-airport-with-the-most-flights", "deferred-revenue", "delinquency-buckets", "chargeback-rate-ranking"],
    },
    {
      name: "One-pass ride-status censuses",
      why: "The ops board gets completed, in-ride, reserved and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift while the city review is waiting.",
      slugs: ["active-businesses", "count-salary-categories", "create-a-session-bar-chart"],
    },
    {
      name: "City billing & cents discipline",
      why: "Completed is not settled — the finance tables (28 statements, 27 settlement legs, INTEGER cents) are where the permit world meets money. Every euro read is amount_cents / 100.0, the exact/partial/none coverage split (21 / 1 / 6) is one CASE away, and the 30-day terms clock (28.4-day average settlement) is the civic-credit read.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "monthly-transactions-ii", "monthly-transactions-i", "budget-pacing"],
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
    {
      id: "voi-t9",
      q: "The close packet stacks the settled register (21 statements) over the never-settled register (6) plus one grand-total row. UNION or UNION ALL — and when does the choice become a correctness question?",
      a: "UNION ALL appends every row from both SELECTs, so the packet's identity — 21 settled + 6 never-settled = 27 statements — reconciles by construction. UNION dedups whole rows silently, which sounds harmless until a bug puts one statement into both registers and the dedup hides it: the packet still foots to 27 while a city's permit fee has vanished from one layer. The discipline at Voi is to stack registers with UNION ALL and let the reconciliation identity catch duplicates loudly, because silent dedup is silent data loss in a permit close. The stacked SELECTs must still project the same column shape and order — UNION ALL forgives a swapped column no more than UNION does.",
      tag: "sets",
    },
    {
      id: "voi-t10",
      q: "Cities we invoice this quarter but settled no permit statements — how does EXCEPT express that diff, and what must both sides share?",
      a: "EXCEPT keeps rows from the left SELECT that never appear in the right: invoiced-markets MINUS settled-markets. Both sides must project the same column count with compatible types, or the engine errors before the diff runs — and both sides dedup, so a duplicated market row disappears before the comparison. On this db the invoiced side holds four markets (EU 45 rides, APAC 37, US 19, LATAM 2) and every one of them has settlement traffic, so the diff returns empty — an empty diff is a finding, not a failure: it proves every city we ride in moves money. INTERSECT answers the mirror question (markets present in both), and when duplicates matter the raw UNION ALL stack stays the audit-friendly form precisely because it refuses to dedup.",
      tag: "sets",
    },
    {
      id: "voi-t11",
      q: "The fleet app's 'recent rides' rail keeps the newest ride per rider. Why ROW_NUMBER and not RANK — and what makes the tie-break a policy?",
      a: "ROW_NUMBER assigns 1, 2, 3… inside each PARTITION BY customer_id regardless of ties, so rn = 1 is exactly one ride per rider — the rail's contract. RANK hands tied start stamps the same rank and returns several rank-1 rows, duplicating the rail; COUNT(*) OVER (PARTITION BY …) answers a different question entirely (how many rides the rider has). The tie-break — ORDER BY shipped_at DESC, then id DESC — must be named and deterministic, because two rides stamped the same minute must resolve identically on every run, not by rowid luck. That policy belongs in the query comment: the rider who sees the wrong ride on their receipt does not care which tie the engine happened to win.",
      tag: "windows",
    },
    {
      id: "voi-t12",
      q: "Each month's share of the 34,833.28 ride book, with every month row kept — how does the window grand total do that in one pass?",
      a: "SUM(booked) OVER () computes the grand total across the whole partition without collapsing rows, so each month divides its own value by 34,833.28 and stays a row. The bare SUM(booked) requires GROUP BY and collapses to one row per group — month and share cannot coexist without a window, a CTE cross join, or a hardcoded literal that silently lies the day February posts. Frame semantics are the trap: OVER (ORDER BY month) turns the sum into a running total (RANGE between unbounded preceding and current row) — the cumulative spine the tender appendix quotes, not the grand total. Saying which of the two you want out loud is the interview's whole point, because both are one keyword apart and only one reconciles to the book.",
      tag: "windows",
    },
    {
      id: "voi-t13",
      q: "LAG drives the ride-pace month walk. What is the first row of the LAG, and when do you reach for LEAD instead?",
      a: "LAG(booked) OVER (ORDER BY month) pairs each month with its predecessor; the first row has no predecessor and returns NULL — the baseline, reported as NULL or labelled 'baseline', never coalesced to zero, which would read as a flat month. LEAD reads the other direction and is the natural shape for fill-forward views like next month's planned fleet size per city. Movement columns are current minus prior, rounded at the display edge; on this spine the deepest drop is -1,326.87 into November 2024 and the sharpest jump +1,158.21 into August. A NULL first movement is information — the alternative is inventing a January delta against a month that does not exist.",
      tag: "windows",
    },
    {
      id: "voi-t14",
      q: "Unlock-to-start is measured created_at → shipped_at on TEXT stamps. Why julianday, and what does the 2–4 day range say that the 2.98 mean hides?",
      a: "julianday converts each TEXT stamp to a fractional day number so subtraction is honest arithmetic; plain TEXT minus TEXT coerces both sides to the same leading integer and returns zero for every row. The 2.98-day mean over the 82 stamped rides is the headline, but the 2–4 range is the operational read — nobody unlocks days before riding and nobody waits five, so the rebalancing sweep is planned against a tight window. AVG silently skips the 21 NULL-stamp rows, which is why the population statement (started rides only) ships with the number. Mixing the 14 reserved rows in does not error; it quietly redefines the metric — and the city appendix gets staffed off the wrong population.",
      tag: "dates",
    },
    {
      id: "voi-t15",
      q: "The rebalancing-crew curve buckets ride starts by weekday. What does SQLite's %w hand you, and how does the mix read on this book?",
      a: "STRFTIME('%w', created_at) returns 0 = Sunday through 6 = Saturday as TEXT — Sunday is '0', not '7', and '%d' is day-of-month, not weekday. On this book Monday opens at 20 ride starts with Sunday at 16, while Thursday (9) and Saturday (8) run light — the crew-staffing curve follows that shape. The buckets arrive as strings, so ORDER BY d sorts '0' through '6' — which happens to be weekday order for %w, a coincidence worth a comment because it breaks the moment the format changes. Weekend-versus-weekday splits are one CASE away from this bucket, and both abandoned-heavy months sitting in July and November is a calendar check, not an assumption.",
      tag: "dates",
    },
    {
      id: "voi-t16",
      q: "CASE WHEN evaluates arms in order. How do you keep the per-minute rate bands exhaustive — and what does a reordered arm do to the rate card?",
      a: "First matching WHEN wins, so arms are written narrowest-first with every gap closed by an explicit ELSE. The rate card splits at the 55 line — lines under it carry 268 minutes at a 31.01 average line price, lines at or above it carry 230 minutes at 115.85 — and a line priced exactly 55.00 must band premium, which the >= 55 arm guarantees only while it precedes any standard arm. A hole in the arms sends lines to ELSE (or NULL) and the revenue forecast silently loses a band; a reordered WHEN quietly re-bands the fleet without erroring. Band edges are published constants: state them in the query comment and make the ELSE arm unreachable in tests — the tender deck is only as honest as the arm order.",
      tag: "casing",
    },
    {
      id: "voi-t17",
      q: "SUM(CASE WHEN …) versus FILTER (WHERE …): which is portable, and when does each win?",
      a: "SUM(CASE WHEN condition THEN 1 ELSE 0 END) is the portable census — every engine from the warehouse to the ops tablet reads it, and the ELSE 0 keeps the fold total-safe. FILTER (WHERE …) branches each aggregate over its own population, keeps the scan one-pass and the output one row — 52 completed / 30 in-ride / 14 reserved / 7 abandoned reconciling to 103 by construction — but it is the newer, less universal syntax. At 103 rides either works; the discipline is choosing one per report and saying why, because four sequential queries are four chances to drift while the city review is waiting. The CASE twin also bands values (rate tiers, minute gates), which FILTER cannot do on its own — that is when the portability argument settles it.",
      tag: "casing",
    },
    {
      id: "voi-t18",
      q: "The model feed ships names in mixed case with stray padding. What is the canonicalization sequence before any join, and what breaks without it?",
      a: "TRIM clears the padding, UPPER (or LOWER) collapses the case drift, and the result — not the raw name — becomes the join key: ' voi commuter pass ' and 'Voi Commuter Pass' must land on one canonical string. REPLACE handles embedded defects (double spaces, legacy separators) when TRIM cannot reach them. The sequence lives in a CTE once and every downstream join reuses it, because two teams canonicalizing differently re-split the fleet into phantom models and the utilization leaderboard double-counts. String keys are the cheapest place a report lies: the join returns zero rows and reads as an empty cohort instead of a case mismatch — the analyst who checks the canonical form first finds it in one query.",
      tag: "strings",
    },
    {
      id: "voi-t19",
      q: "When is IN the right existence test, and when does EXISTS beat it?",
      a: "IN materializes the subquery's list and compares every outer row against it — fine when the column is NOT NULL-guarded and the list is small, like model ids in a ride-line existence check. EXISTS short-circuits on the first match and is three-valued-logic safe: it never silently empties the way NOT IN does when one stray NULL enters the list. The semi-join shape (EXISTS with the correlation in WHERE) also reads as intent — 'riders with at least one completed ride' — without needing DISTINCT, and the engine can stop at the first hit. The interview rule: existence tests are EXISTS by default; IN is a deliberate choice you can defend with the column's nullability.",
      tag: "subqueries",
    },
    {
      id: "voi-t20",
      q: "A correlated subquery compares each ride to its rider's own average. What does it answer that the network-average query cannot — and what does it cost?",
      a: "WHERE total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) answers 'is this ride big for THIS rider' — the corporate-account read, where a 900.00 ride bundle is routine for the rider carrying 24 rides and an outlier for a two-ride account. The network-average version (338.19) mixes every population into one threshold and answers a different question. Cost: the inner fold re-runs per outer row — trivial at 103 rides, a real conversation at warehouse scale, where the same shape becomes a window over PARTITION BY customer_id. The strong answer names the population for each comparison and knows which question the tender appendix promised.",
      tag: "subqueries",
    },
    {
      id: "voi-t21",
      q: "City billing pairs near-duplicate ride-line charges: same rider, same cents. How does the self-join avoid pairing a row with itself and avoid double-counting?",
      a: "Join order_items to itself on the business key (customer_id, amount_cents) and add l1.id < l2.id: the strict inequality kills the self-pair and admits each unordered pair exactly once. l1.id <> l2.id admits both (a,b) and (b,a) — the fraud list doubles and the credit fires twice; l1.id = l2.id pairs every row with itself; no id predicate at all pairs everything with everything. Because the pairing is symmetric by construction, one direction IS the dedupe policy, and it belongs in the query comment. This is the screen billing runs before statements go to city counterparties — the same shape later powers 'riders who rode the same model twice' follow-ups.",
      tag: "joins",
    },
    {
      id: "voi-t22",
      q: "When is CROSS JOIN the honest choice rather than a mistake — and what is the classic accident it prevents or causes?",
      a: "CROSS JOIN is the deliberate Cartesian product: 16 rideable models and passes against 6 city/permit partners is 96 scenario rows, and writing CROSS JOIN says the fan-out is intended, not accidental. Its legitimate job is making every partner×model cell exist so later LEFT JOINs can prove which cells are empty — the permit-fee grid needs the zeros to be rows. The classic accident is the implicit cross (comma join with the ON condition drifted into WHERE) that explodes a quick count into millions of rows; the classic repair is turning the cross into an inner equi-join by moving a predicate into ON. At fleet scale the difference between 96 intended rows and an unintended product is the difference between a grid and an outage.",
      tag: "joins",
    },
    {
      id: "voi-t23",
      q: "The coverage CASE splits statements into exact, partial and none. What makes the classification trustworthy when a status column also claims 'paid'?",
      a: "The CASE keys off settlement legs and cents, never the status column: legs = 0 is none (paid pinned at 0.00 via COALESCE), paid = billed is exact, else partial — 21 / 1 / 6 on this book. The status lie (#28 marked paid with zero legs) rides in the none bucket because payment rows are the ledger of record and statuses are claims; the void-but-settled #11 rides in exact the same way, from the mirror side. The identities that ship with the grid: 28 statements, 86,977.00 billed, buckets footing to both. Every anomaly gets a row on the exception list, never a silent correction — the close ships on reconciliation, not vibes.",
      tag: "quality",
    },
    {
      id: "voi-t24",
      q: "The rider ladder groups 103 rides by rider. What would you index — and what does EXPLAIN QUERY PLAN tell you at this scale?",
      a: "A composite index on (customer_id, created_at) lets GROUP BY customer_id walk pre-sorted groups and lets the per-rider latest-ride rail skip its sort entirely. At 103 rows the planner will likely table-scan anyway, and that is correct — reading 103 rows is cheaper than maintaining an index; the interview answer is knowing the crossover, not worshiping indexes. EXPLAIN QUERY PLAN is how you check: 'SCAN orders' versus 'SEARCH orders USING INDEX' names the strategy in one line. The habit matters when the same query shape moves to the warehouse — the index that made the ladder instant is the one whose write-cost nobody budgeted on a table the ride app updates all day.",
      tag: "indexes",
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
    {
      id: "voi-mcq-11",
      prompt: "A dormant-rider report LEFT JOINs riders to rides, then adds WHERE o.status = 'delivered' 'to keep the read clean'. What does the reviewer say?",
      choices: ["The never-riding cohort survives with NULL ride columns", "The WHERE kills the NULL-payload rows — the LEFT quietly became an INNER and the dormant base vanished while the query still runs", "The query errors on comparing NULL status", "The cohort appears with zero-value totals"],
      answer: 1,
      why: "A WHERE predicate on the right table's columns discards every unmatched left row — NULL status is not 'delivered' — so the LEFT silently degrades to an INNER. The fix is moving the predicate into the ON clause or an outer query. The join type is a business decision about who survives; a stray WHERE is how it gets made for you.",
      notes: [
        { choice: 0, why: "That is the promise of the LEFT JOIN — but the WHERE breaks it before delivery. The cohort's survival is exactly what the reviewer is checking." },
        { choice: 2, why: "No error anywhere: NULL = 'delivered' evaluates to UNKNOWN, which is just filtered. Silent deletion is the failure mode, not a crash." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-12",
      prompt: "Prove no rider is dormant: every rider appears in the ride table. Which query shape returns the never-riding cohort — empty on this db, and the emptiness is the proof?",
      choices: ["LEFT JOIN orders o ON o.customer_id = r.id WHERE o.id IS NULL", "WHERE r.id NOT IN (SELECT customer_id FROM orders)", "INNER JOIN orders o ON o.customer_id = r.id HAVING COUNT(o.id) = 0", "CROSS JOIN orders o ON r.id IS NULL"],
      answer: 0,
      why: "The LEFT JOIN + IS NULL anti-join keeps every rider and marks the matched ones for deletion — the survivors are exactly the never-riding, and on this db that is a confident zero. Proving the zero is part of the job: the same shape on a staging table is what catches silent corruption.",
      notes: [
        { choice: 1, why: "NOT IN works on the clean core db, but one stray NULL customer_id makes every comparison UNKNOWN and the report silently empties — the zero you ship is then a bug wearing the proof's clothes." },
        { choice: 2, why: "An INNER JOIN can only return riders WITH rides — the missing rows are deleted before any aggregate sees them. The shape cannot answer its own question." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-13",
      prompt: "Attach model family and per-minute rate to every ride line. Which join, and what does COUNT(*) read after it?",
      choices: ["JOIN products p ON p.id = oi.product_id — and COUNT(*) now reads lines (251), not rides", "JOIN products p ON p.id = oi.product_id — COUNT(*) still reads rides (103)", "JOIN customers c ON c.id = o.customer_id — COUNT(*) reads models (16)", "No join needed — the model family is already on the line"],
      answer: 0,
      why: "The products-to-order_items join is the enrichment: model, pass family and the rate the line locked. But joining the line grain in makes COUNT(*) count 251 lines — the fan-out. Rides need COUNT(DISTINCT order_id) after the join, and minutes are SUM(quantity), a fourth grain.",
      notes: [
        { choice: 1, why: "Joining a child table always fans the count out — 103 rides become 251 lines the moment order_items is joined. COUNT(*) never stays put across a fan-out." },
        { choice: 3, why: "The line carries only product_id, quantity and unit_price — model family lives on the products row. The enrichment join is the whole point of the query." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-14",
      prompt: "The ride-pace trend buckets rides with STRFTIME('%m', created_at). What does the reviewer catch immediately?",
      choices: ["Nothing — zero-padded months sort correctly", "January 2024 and January 2025 merge into one bucket — the 14-month spine collapses to 12 and the trend becomes fiction", "The buckets arrive as numbers and sort out of order", "Rides without dates produce NULL buckets and error the GROUP BY"],
      answer: 1,
      why: "'%m' alone drops the year: 2024-01 and 2025-01 both bucket as '01'. The spine must be STRFTIME('%Y-%m', created_at) — 14 honest buckets from 2024-01 to 2025-02. The tender deck's seasonality story is only as good as its bucket key.",
      notes: [
        { choice: 0, why: "Sorting was never the issue — merging is. A 12-bucket trend quietly averages two Januaries and the July trough moves." },
        { choice: 2, why: "STRFTIME returns TEXT, and '%m' TEXT sorts fine. The defect is information loss, not ordering." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-15",
      prompt: "The ops board wants completed / in-ride / reserved / abandoned counts in ONE scan that reconciles to 103. Which form is the portable twin every engine — warehouse to ops tablet — reads?",
      choices: ["FILTER (WHERE status = 'delivered') branching each aggregate", "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) per branch", "Four sequential COUNT queries pasted side by side", "COUNT(status) with GROUP BY status in a subquery"],
      answer: 1,
      why: "SUM(CASE …) is the portable one-pass census — the ELSE 0 keeps it total-safe and every engine reads it. FILTER (WHERE …) is the newer, less universal twin that branches each aggregate over its own population; four sequential queries are four chances to drift while the city review is waiting.",
      notes: [
        { choice: 0, why: "FILTER is genuinely one-pass and keeps the output one row — it is the discipline pick on SQLite. The catch is portability: it is the newer syntax, and the question asked for the engine-proof twin." },
        { choice: 2, why: "Four separate queries reconcile to 103 only if you check by hand afterward — each is a chance for a drifted filter. One scan, one reconciliation." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-16",
      prompt: "The close packet stacks the 21 settled statements over the 6 never-settled plus one grand-total row. Why UNION ALL and not UNION?",
      choices: ["UNION ALL is faster on 28 rows", "The packet's identity — 21 + 6 = 27, plus the total — reconciles by construction; UNION's silent dedup could hide a statement that leaked into both registers", "UNION cannot stack three SELECTs", "UNION ALL sorts the registers before stacking"],
      answer: 1,
      why: "UNION ALL appends every row, so duplicates surface loudly in the reconciliation instead of vanishing. UNION dedups whole rows silently — in a permit close, silent dedup is silent data loss. Same column shape and order on both sides is still mandatory either way.",
      notes: [
        { choice: 0, why: "Speed is real but not the point — the discipline is auditability. A dedup that hides a cross-register duplicate defeats the packet's whole identity check." },
        { choice: 2, why: "UNION stacks any number of SELECTs. The restriction that matters is column shape, not count." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-17",
      prompt: "The rebalancing-crew curve buckets ride starts by STRFTIME('%w', created_at) and orders by that bucket. Which weekday's row lands first?",
      choices: ["Monday — it is the biggest day at 20 ride starts", "Sunday — %w returns 0 for Sunday as TEXT, so '0' sorts first", "Saturday — '6' is the smallest digit", "The query errors — %w returns numbers and TEXT ordering fails"],
      answer: 1,
      why: "%w is 0 = Sunday through 6 = Saturday, returned as TEXT — so ORDER BY d walks '0' through '6', which happens to be weekday order. Volume never enters it: Monday's 20 ride starts sit second. The Sunday-'0' convention is worth a comment because it breaks the moment the format string changes.",
      notes: [
        { choice: 0, why: "Confusing sort order with volume — the classic. Monday is the busiest day but '1' sorts after '0'. The curve reads Sunday-first regardless." },
        { choice: 2, why: "Saturday is '6' — the LAST bucket, not the first. Reading the digit as a sort key backwards flips the whole curve." },
      ],
      difficulty: "easy",
    },
    {
      id: "voi-mcq-18",
      prompt: "The rate card bands ride lines at the 55 line: WHEN unit_price >= 55 THEN 'premium' ELSE 'standard'. A line locks exactly 55.00. Where does it land — and what decided it?",
      choices: ["Standard — ELSE catches anything not matched", "Premium — the >= 55 arm matches first; 'at or above' is the published policy", "NULL — CASE never matches on equality", "It errors — two arms claim the row"],
      answer: 1,
      why: "CASE evaluates arms in order and first match wins: 55.00 satisfies >= 55, so it bands premium — the published card says 'at or above'. The edges are constants the tender deck quotes — 268 minutes under the line at 31.01 against 230 above it at 115.85 — and a hole or a reordered WHEN silently re-bands the fleet without erroring.",
      notes: [
        { choice: 0, why: "ELSE is the fallback, not the boundary — 55.00 matched the >= arm before ELSE was ever consulted." },
        { choice: 2, why: "CASE returns NULL only when no arm matches and no ELSE exists. Here the >= arm matches explicitly — the boundary is premium by construction." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-19",
      prompt: "The Q1 cut reads WHERE created_at BETWEEN '2024-01-01' AND '2024-03-31' on TEXT datetime stamps. What does the reviewer flag?",
      choices: ["Nothing — BETWEEN is inclusive and the bounds are right", "The format needs T separators for TEXT comparison", "The last night's unlocks — '2024-03-31 18:42:00' sorts after '2024-03-31' — fall outside; the honest cut is >= '2024-01-01' AND < '2024-04-01'", "BETWEEN errors on TEXT columns; use DATE()"],
      answer: 2,
      why: "created_at carries a time component, so '2024-03-31 18:42:00' > '2024-03-31' as strings — the BETWEEN silently drops the quarter's final evening. Half-open intervals [start, next-start) never lose the boundary night. End-of-quarter commuter rides land exactly there, which is why it is a correctness call, not a style one.",
      notes: [
        { choice: 0, why: "Inclusive BETWEEN is true — inclusive of '2024-03-31' the DATE, exclusive of everything stamped on that date WITH a time. The loss is invisible until you count the last night." },
        { choice: 3, why: "TEXT datetimes compare lexicographically just fine — that is the whole trick. The bug is the boundary, not the type." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-20",
      prompt: "The fleet app's 'recent rides' rail uses RANK() OVER (PARTITION BY customer_id ORDER BY shipped_at DESC) = 1. Two riders have two rides sharing a start minute. What ships?",
      choices: ["Nothing — RANK deduplicates ties", "Two rank-1 rows per tied rider — the rail duplicates; ROW_NUMBER with a named tie-break is the rail's actual contract", "The query errors on the tied ordering", "RANK skips rank 2 and the rail loses rows"],
      answer: 1,
      why: "RANK hands tied shipped_at values the same rank — several rank-1 rows, so the rail shows both rides. The rail's promise is exactly one ride per rider, which is ROW_NUMBER's shape, and the tie-break (shipped_at DESC, then id DESC) must be a named, deterministic policy in the query comment.",
      notes: [
        { choice: 0, why: "RANK shares rungs, it never dedups. Same rank means multiple rows — the rail doubles exactly on the collision it should have broken." },
        { choice: 3, why: "Rank skipping is real (1, 1, 3…) but harmless here — rn = 1 rows are what survive, and there are now two of them." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-21",
      prompt: "City billing pairs near-duplicate ride-line charges — same rider, same cents — before statements go out. Which predicate pairs each line exactly once?",
      choices: ["l1.id <> l2.id", "l1.id < l2.id", "l1.id = l2.id", "No id predicate — the business key alone suffices"],
      answer: 1,
      why: "The strict inequality kills the self-pair AND admits each unordered pair once — one direction IS the dedupe policy. <> admits both (a,b) and (b,a) so the fraud list doubles and credits fire twice; = pairs every row with itself; no predicate pairs everything with everything.",
      notes: [
        { choice: 0, why: "The symmetric twin bug: <> keeps both orderings of every pair, so the pairing count doubles and the exception list stops being a list." },
        { choice: 3, why: "Without an id predicate every line pairs with itself first — the 'duplicate' you detect is every row in the table." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-22",
      prompt: "Existence test: riders carrying at least one completed ride. Why does the house style default to EXISTS over IN here?",
      choices: ["EXISTS materializes a smaller intermediate list", "EXISTS short-circuits on the first match and is three-valued-logic safe — it never silently empties the way NOT IN does on a stray NULL", "IN is deprecated in modern SQL", "EXISTS is always faster at 103 rows"],
      answer: 1,
      why: "The semi-join shape reads as intent — 'riders with at least one completed ride' — without needing DISTINCT, stops at the first hit, and never crosses the NULL trap. IN is a deliberate choice you can defend with the column's nullability; on staging tables you usually cannot.",
      notes: [
        { choice: 0, why: "EXISTS actually materializes nothing — that is the point. Short-circuit per outer row is the mechanism, not a smaller list." },
        { choice: 2, why: "IN is not deprecated — it is fine on NULL-guarded columns with small lists. The default is a policy about failure modes, not fashion." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-23",
      prompt: "Each month's share of the 34,833.28 ride book, with every month row kept. Which form computes it in one pass?",
      choices: ["GROUP BY month — the share column cannot coexist with the rows", "SUM(SUM(total)) OVER () as the denominator beside each month's SUM(total)", "AVG(total) OVER (ORDER BY month) as the denominator", "COUNT(*) OVER () divided by month"],
      answer: 1,
      why: "SUM(booked) OVER () computes the grand total across the partition without collapsing rows — each month divides by 34,833.28 and stays a row. The bare GROUP BY collapses to one row per month; OVER (ORDER BY month) would silently turn the denominator into a running total.",
      notes: [
        { choice: 2, why: "ORDER BY in the window changes the frame — that is the cumulative spine, not the grand total. One keyword apart, completely different reconciliation." },
        { choice: 3, why: "COUNT(*) OVER () is 14 — dividing by a row count, not a value. The share of the book needs the book's total, not the spine's length." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-24",
      prompt: "LAG(booked) OVER (ORDER BY month) drives the ride-pace walk. The first row's movement reads NULL. Why not COALESCE it to 0?",
      choices: ["Zero IS the honest baseline for January 2024", "NULL means no predecessor exists — a zero would read as a flat month and the walk's first movement becomes fiction", "COALESCE errors inside window expressions", "NULL breaks the ORDER BY and the walk mis-sorts"],
      answer: 1,
      why: "The first row has no prior month — the NULL is the baseline, and it is information. Coalescing to zero invents a delta against a month that does not exist, and the reviewer reads a flat opening instead of an unmeasured one. Report NULL, or label the row 'baseline'.",
      notes: [
        { choice: 0, why: "A zero delta claims the book was flat into January — a factual claim about a month that is not in the data. The honest value is 'not applicable'." },
        { choice: 2, why: "COALESCE is legal inside windows — the objection is semantic, not syntactic. That is what makes the bug dangerous: it ships." },
      ],
      difficulty: "medium",
    },
    {
      id: "voi-mcq-25",
      prompt: "Utilization bands bucket models by rides-per-scooter-per-day: WHEN rides*1.0/units >= 4 THEN 'hot' WHEN >= 1.5 THEN 'warm' ELSE 'cold'. Why must the hot arm come first?",
      choices: ["CASE arms evaluate in parallel — order is irrelevant", "First matching WHEN wins — a cold-first order bands every model cold and the rebalancing sweep cancels itself", "SQLite evaluates the ELSE arm first", "The bands must be alphabetical to reconcile"],
      answer: 1,
      why: "CASE is sequential: 4.2 satisfies >= 1.5 too, so if the warm arm ran first the hot models would band warm and nothing would ever be hot. Wide arms must follow narrow ones — and the same logic is why a hole in the arms sends models to ELSE and the tender deck silently loses a band.",
      notes: [
        { choice: 2, why: "ELSE is by definition last — it is the fallback when no WHEN matched. The risk is arm order among the WHENs." },
        { choice: 3, why: "Nothing reconciles alphabetically — bands reconcile by the count of models landing in each, which is exactly what arm order controls." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-26",
      prompt: "The permit-fee grid needs every city × model cell to exist — 6 partners × 16 rideables = 96 rows — so later LEFT JOINs can prove which cells are empty. Which build is the honest one?",
      choices: ["A comma join with the ON condition drifted into WHERE — same rows, cheaper to write", "An explicit CROSS JOIN — the fan-out is intended, and the keyword says so", "An INNER JOIN on an always-true predicate", "UNION ALL of the partners and the models"],
      answer: 1,
      why: "CROSS JOIN is the deliberate Cartesian product: writing it documents that 96 rows are the design, not an accident. The classic catastrophe it guards against is the implicit cross — a comma join whose real join condition slipped into WHERE — which explodes a quick count into millions of rows at fleet scale.",
      notes: [
        { choice: 0, why: "Same rows today, unfixable tomorrow: the next editor who adds a real condition to that WHERE builds the accidental product. Intent should be a keyword, not a comment." },
        { choice: 2, why: "An INNER JOIN needs an ON to be meaningful — 'always true' is a CROSS JOIN in disguise with the intent hidden. Write the thing you mean." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-27",
      prompt: "Invoiced-markets EXCEPT settled-markets returns EMPTY on this db. The analyst calls it a failure. What is the correct read?",
      choices: ["Correct — an EXCEPT should always return rows", "The empty diff is the finding: all four invoiced markets (EU 45, APAC 37, US 19, LATAM 2) also have settlement traffic, and the diff just proved it", "Empty means the SQL errored silently", "Empty means the markets deduped away on both sides"],
      answer: 1,
      why: "EXCEPT keeps left rows that never appear on the right — an empty result says every city we ride in moves money, which is exactly what the treasury check wanted to confirm. An empty diff is a finding, not a failure; INTERSECT answers the mirror question.",
      notes: [
        { choice: 2, why: "A failing EXCEPT errors loudly — both sides' column shapes must match or the engine refuses. Empty-and-valid is a semantic result." },
        { choice: 3, why: "EXCEPT dedups each side before comparing, but here each market appears once anyway. The emptiness is set semantics: nothing is left-only." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-28",
      prompt: "WHERE total > (SELECT AVG(total) FROM orders WHERE status = 'cancelled') runs on a staging copy, returns zero rows, and looks valid. What do you check first?",
      choices: ["ROUND precision on the average", "Whether the inner fold is empty — a scalar subquery on zero rows returns NULL, total > NULL is UNKNOWN, and the whole report evaporates", "Whether AVG needs an index on total", "Whether the comparison needs HAVING instead of WHERE"],
      answer: 1,
      why: "Abandoned rides are only 7 rows, and a thinner staging slice can hold none — the scalar subquery is contractually 0-or-1 rows, and the 0 case returns NULL, not an error. The comparison goes UNKNOWN for every row and the report ships empty. State the inner fold's population and its empty-case behavior unprompted.",
      notes: [
        { choice: 0, why: "Rounding happens after a value exists. The bug here is that no value exists at all — NULL, not a badly rounded number." },
        { choice: 3, why: "HAVING judges groups; this is a row-level comparison. No clause placement rescues an UNKNOWN comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-29",
      prompt: "The corporate-account read: which rides sit above THEIR rider's own average spend, not the network's 338.19? Which shape answers it — and at what cost?",
      choices: ["A window AVG() OVER (PARTITION BY customer_id) — or the correlated cousin that re-runs the inner fold per outer row", "One scalar subquery of the network average beside a WHERE", "GROUP BY customer_id HAVING total > AVG(total)", "A CROSS JOIN to a per-rider averages table"],
      answer: 0,
      why: "The comparison population is per-rider, so the threshold must be too: AVG(total) OVER (PARTITION BY customer_id) keeps every row and compares in place; the correlated subquery answers the same thing by re-running per outer row — trivial at 103 rides, a real conversation at warehouse scale. A 900.00 bundle is routine for the 24-ride rider and an outlier for a two-ride account.",
      notes: [
        { choice: 1, why: "That answers 'above the network average' — a different slide. Mixing populations into one threshold is exactly the misread the panel fishes for." },
        { choice: 2, why: "Inside HAVING, total is not a per-row column anymore — groups have formed, and the row-level comparison is gone. Pipeline-order error." },
      ],
      difficulty: "hard",
    },
    {
      id: "voi-mcq-30",
      prompt: "The rider ladder groups 103 rides by rider and sorts by recency. What do you index — and what will EXPLAIN QUERY PLAN likely say at this scale?",
      choices: ["An index on (total) — and the plan will read 'SEARCH orders USING INDEX'", "A composite (customer_id, created_at) — though at 103 rows the planner may still SCAN, and that is correct", "No index can ever help a GROUP BY", "An index on status — 'SEARCH orders USING INDEX status'"],
      answer: 1,
      why: "The composite index lets GROUP BY customer_id walk pre-sorted groups and lets the per-rider latest-ride rail skip its sort. At 103 rows the planner will likely table-scan anyway — reading 103 rows is cheaper than maintaining an index on a table the ride app updates all day. Knowing the crossover, not worshiping indexes, is the answer.",
      notes: [
        { choice: 0, why: "total never appears in a GROUP BY or sort here — an index on it serves nothing this query does, and the plan will still read SCAN." },
        { choice: 3, why: "status is a low-cardinality filter — an index on it rarely pays, and the ladder's fold and sort keys are customer_id and created_at." },
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
    {
      id: "cs-voi-3",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The per-minute band census",
      brief:
        "Voi-flavored brief on the storefront db: the city-permit pod opens the rate review with the published band census — every ride line CASE-banded at the 55.00 line the rate card publishes, standard below it and premium at or above it. Probed facts: the 251 ride lines lock rates from a 14.99 floor to a 199.99 ceiling, splitting 133 lines / 268 minutes / 31.01 average line price for standard against 118 lines / 230 minutes / 115.85 for premium — where the minutes are is not where the money is. No line locks exactly 55.00, so the boundary arm is proven by construction. The census reads the busier-by-minutes band first.",
      ask: "Return each rate band — standard or premium — with its line count, total minutes and average line rate to 2 decimals, biggest minutes first.",
      template:
        "SELECT CASE WHEN unit_price {1} 55.00 THEN 'premium' ELSE 'standard' END AS band,\n       COUNT(*) AS lines,\n       SUM(quantity) AS minutes,\n       ROUND(AVG(unit_price), {2}) AS avg_line_rate\nFROM order_items\nGROUP BY band\nORDER BY minutes {3};",
      slots: [
        {
          answer: ">=",
          kind: "keyword",
          label: "the boundary arm",
          why: ">= 55.00 puts the boundary line in premium by policy — first matching WHEN wins, and 'at or above' is the published rate card. A bare > would drop any future 55.00 line into standard silently, and < or = re-bands the whole book without erroring.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Rates report to 2 decimals — 31.01 is the standard band's average line price, and ROUND(…, 1) prints 31.0 while 0 prints 31: the fold stops footing to the rate card the tender appendix quotes. Precision lives at the display edge, one place, consistently.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-minutes-first direction",
          why: "The review reads standard on top — 268 minutes against 230 — because the band story is WHERE the minutes ride, and the money column beside it (115.85 against 31.01) is the punchline. ASC opens the meeting on the premium band and buries the utilization read the slide is about.",
        },
      ],
      distractors: ["<", "=", "ASC", "1", "0"],
      walkthrough:
        "One table, one CASE, the published rate card as a query. The CASE bands every ride line at the 55.00 line — >= 55 is premium by arm-order policy, everything else standard — and the fold reads each band's census: 133 lines turning 268 minutes at a 31.01 average line rate for standard, 118 lines turning 230 minutes at 115.85 for premium. The boundary is proven, not assumed: no line locks exactly 55.00, so the >= arm's edge case never fires on this db — but the policy still lives in the query, because the day a 55.00 line locks on the rate card it must band premium without a rewrite. The ROUND edge keeps 31.01 honest to the cent. The punchline survives the fold: standard carries the minutes, premium carries the money — 230 minutes at 115.85 outweigh 268 at 31.01. The distractors fail honestly: < and = re-band the book (an = arm would band all 251 lines standard, since nothing locks exactly 55.00); 1 or 0 in the precision slot eats the cents off 31.01; ASC flips the read onto the premium band and the minutes-versus-money story runs backwards.",
    },
    {
      id: "cs-voi-4",
      tier: "medium",
      topic: "t4",
      universe: "month-close",
      title: "The ride-pace month spine",
      brief:
        "Voi-flavored brief on the storefront db: the city-review deck opens on the ride spine — every month of the 14-month book (2024-01 to 2025-02) bucketed by its start stamp, rides counted and booked value summed. Probed facts: the spine folds 103 rides and 34,833.28; the gate at 8 or more rides keeps exactly six months — 2024-01 (8 / 3,731.97), 2024-02 (9 / 3,609.64), 2024-03 (8 / 2,617.08), 2024-05 (8 / 2,910.31), 2024-07 (8 / 1,193.86), 2024-09 (9 / 3,116.04) — the two 9-ride peaks opening and the 1,193.86 July trough riding inside the kept set. The spine reads chronologically, oldest first.",
      ask: "Return each month carrying 8 or more rides with its ride count and booked value to 2 decimals, chronological order.",
      template:
        "WITH spine AS (\n  SELECT STRFTIME('{1}', created_at) AS month,\n         COUNT(*) AS rides,\n         ROUND(SUM(total), 2) AS booked\n  FROM orders\n  GROUP BY month\n)\nSELECT month, rides, booked\nFROM spine\nWHERE rides >= {2}\nORDER BY month {3};",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the spine bucket key",
          why: "Year plus zero-padded month is the bucket key that keeps 2024-01 and 2025-01 apart — '%m' alone merges them and the 14-month spine collapses to 12, while '%Y' collapses it to 2. The tender appendix's seasonality story is only as honest as its bucket string.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the busy-month gate",
          why: "The gate at 8 keeps exactly six months, the two 9-ride peaks (Jan and Sep 2024) riding with four 8s — and the July trough (1,193.86) stays visible inside the kept set, which is the point. A gate of 7 floods the read to eleven months and the peaks stop being peaks.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month spine reads oldest first — 2024-01 on top, each row's context the row above it. DESC presents the newest month first and the deck's seasonality story (build to the January peak, trough in July) runs backwards while every number stays technically correct.",
        },
      ],
      distractors: ["%m", "%Y", "6", "7", "DESC"],
      walkthrough:
        "Stage the spine, then filter it. The CTE buckets 103 rides by STRFTIME('%Y-%m', created_at) — 14 honest months from 2024-01 to 2025-02 — folding COUNT(*) into rides and SUM(total) into booked value; the outer query gates at 8 rides and keeps the six busy months, oldest first: 3,731.97, 3,609.64, 2,617.08, 2,910.31, 1,193.86, 3,116.04. The gate is doing narrative work: 8-or-more is 'peak season' by this deck's definition, and the kept set deliberately contains the July trough so nobody mistakes a busy-by-count month for a busy-by-money month — July turns 8 rides for just 1,193.86. The two-stage shape matters: filtering the folded grain must happen after the fold, which the CTE makes structural instead of a HAVING-vs-WHERE trap. The distractors fail honestly: '%m' merges the two Januaries and the spine becomes 12 buckets of fiction; '%Y' collapses to a 2-row spine; 6 and 7 move the gate and redefine peak season mid-deck; DESC tells the story newest-first and the trough reads like a recovery.",
    },
    {
      id: "cs-voi-5",
      tier: "medium",
      topic: "x3",
      universe: "expense",
      title: "The swap-ops register stack",
      brief:
        "Voi-flavored brief on the storefront db: fleet finance's close packet stacks registers — the fixed-cost register (depot and charging-hall Rent plus rider Ads) over the variable register (swap-bay Tools and field-crew Travel), then one labelled grand-total row, all in one query. Probed facts: the opex book holds 36 filings worth 25,416.00 — fixed runs 28 filings / 21,370.00 (Rent 16,800.00 + Ads 4,570.00), variable runs 8 / 4,046.00 (Tools 1,525.00 + Travel 2,521.00), and the TOTAL row carries the whole ledger. The packet reads biggest spend first, TOTAL riding on top.",
      ask: "Stack the fixed register, the variable register and a labelled TOTAL row — filing count and euro spend to 2 decimals each — biggest spend first.",
      template:
        "SELECT 'fixed' AS register, COUNT(*) AS filings, ROUND(SUM(amount_cents) / 100.0, 2) AS spend\nFROM expenses\nWHERE category {1} ('Rent', 'Ads')\nUNION ALL\nSELECT 'variable', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nWHERE category NOT IN ('Rent', 'Ads')\nUNION ALL\nSELECT '{2}', COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY spend {3};",
      slots: [
        {
          answer: "IN",
          kind: "keyword",
          label: "the fixed-cost filter",
          why: "IN ('Rent','Ads') keeps exactly the two fixed categories — 28 of the 36 filings, the depot-and-ads base the charging-hall lease renewal argues about. NOT IN would flip the register to Tools and Travel, the variable spend the stakeholder explicitly excluded from this memo.",
        },
        {
          answer: "TOTAL",
          kind: "keyword",
          label: "the grand-total row label",
          why: "The third branch scans the unfiltered ledger and must be labelled TOTAL — 36 filings, 25,416.00, the whole opex book. Any other label and the packet's reconciliation line (fixed + variable = TOTAL) stops reading as an identity, which is the only reason the stack is audit-friendly.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-spend-first direction",
          why: "The packet reads TOTAL 25,416.00 on top, then fixed 21,370.00, then variable 4,046.00 — biggest exposure first at every grain. ASC floats the variable register to the top of the close and buries the fixed base the lease renewal exists to ratify.",
        },
      ],
      distractors: ["NOT IN", "GRAND", "ASC", "LIKE", "MAX"],
      walkthrough:
        "Two branches and a total, stacked in one query. The fixed branch filters to Rent and Ads with IN and folds 28 filings into one register row — 21,370.00, the depot-and-ads base; the variable branch catches the rest with NOT IN — Tools 1,525.00 and Travel 2,521.00 folding to 8 filings / 4,046.00; the TOTAL branch re-scans the unfiltered expenses table for 36 filings / 25,416.00, so the packet shows the registers against the whole book (fixed = 84.1% of spend) without a second query. UNION ALL is the stacker — no dedupe, and the identity fixed + variable = TOTAL reconciles by construction; the cents rule holds in every branch, which is why 21,370.00 prints with its cents and ties to the GL operating_expenses fold. The distractors fail honestly: NOT IN serves the variable spend instead of the fixed base and the identity stops footing; 'GRAND' relabels the reconciliation row; LIKE and MAX in the filter slot are type errors the engine rejects; ASC inverts the packet and opens the close on the smallest register.",
    },
    {
      id: "cs-voi-6",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The rider ladder board",
      brief:
        "Voi-flavored brief on the storefront db: the growth pod rebuilds the rider ladder — every rider carrying 4 or more rides, ranked by ride count with ties sharing rungs, because the free-minute grant honors peer cohorts. Probed facts: the gate keeps 9 of 16 riders — the ladder runs 24 (EU), 17 (US), 14 (APAC), 13 (APAC), 5 (EU), then the four-way tie at 4 rides (riders 16, 14, 11, 9 — three EU, one APAC) all sharing rank 6. RANK semantics are the published policy: shared rungs, gaps after ties, and no arbitrary split of riders with identical records. The board reads the ladder top-down.",
      ask: "Return each rider carrying 4 or more rides with their market, ride count and ladder rank, ties sharing rungs, best rank first.",
      template:
        "SELECT c.id AS rider_id,\n       c.region AS market,\n       COUNT(o.id) AS rides,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder_rank\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY ladder_rank, rides DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung function",
          why: "RANK gives the four-way tie at 4 rides the same rank (6) and would skip to 10 afterward — shared rungs, published gaps, the growth pod's named policy. ROW_NUMBER splits the tie arbitrarily and hands the free-minute grant to whichever rider the engine happened to read first; SUM piles a running total into the rank column.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the best-count-first direction",
          why: "Rank 1 must be the 24-ride rider, so the window sorts the count descending. ASC crowns the four 4-ride riders rank 1 and pushes the top of the ladder to rank 6 — a correct query answering the opposite question, and the grant mail-merge would believe it.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the ladder gate",
          why: "The gate at 4 keeps 9 riders and puts the four-way tie on the board — ties visible is the reason the pod runs RANK at all. A gate of 5 amputates the tie block and the shared-rung semantics never fire; 3 floods the board to 11 riders and dilutes the cohort the grant targets.",
        },
      ],
      distractors: ["ROW_NUMBER", "SUM", "ASC", "3", "5"],
      walkthrough:
        "Fold rides per rider, then rank the fold. The join attaches rides to riders, GROUP BY c.id folds to one row per rider, HAVING COUNT(*) >= 4 keeps the nine-ride cohort, and RANK() OVER (ORDER BY COUNT(*) DESC) stamps the ladder: 24, 17, 14, 13, 5, then 6, 6, 6, 6 — the four riders at 4 rides sharing rank 6 because identical records must read identical rungs. The board reads 1 through 6 top-down, EU holding four of the nine rungs — the intensity signal the tender appendix quotes beside it. This is policy encoded as a window function: the growth pod publishes shared rungs with gaps (rank 7 does not exist this quarter), and the gate is chosen to keep the tie visible — a threshold that amputates the tie would hide the very semantics being graded. The distractors fail honestly: ROW_NUMBER splits the four-way tie 6-7-8-9 and arbitrarily picks a grant winner; SUM turns the rank column into a running total (24, 41, 55…); ASC crowns the 4-ride cohort; 3 and 5 move the gate and change which cohort the grant mails to.",
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
    { slug: "bikes-last-time-used", why: "Last-known ride per scooter in the fleet — the rebalancing sweep's feed, decided by a MAX-over-group with NULL handling for units that never moved." },
    { slug: "immediate-food-delivery-ii", why: "Rides started within the promised unlock window versus late ones — the promptness share is a conditional rate over a timestamp comparison, the started-versus-booked drill." },
    { slug: "classes-more-than-5-students", why: "GROUP BY with a HAVING count floor — which models and passes the network actually books, gated by activity, not by rate." },
    { slug: "customer-order-frequency", why: "Riders clearing a repeat-frequency threshold in a window — the ladder's gate logic, where the floor decides who earns the free-minute grant." },
    { slug: "cohort-repeat-revenue", why: "Repeat-ride revenue by cohort — the retention money read the tender appendix quotes to prove riders come back, not just unlock once." },
    { slug: "count-student-number-in-departments", why: "LEFT JOIN counts that must show zeros for empty groups — cities with scooters deployed but no rides this month, whitespace made visible instead of deleted." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Reserved-but-never-started via anti-join — the abandoned-unlock and dormant-reservation cohort, the population the unlock funnel exists to watch." },
    { slug: "dormant-reactivation", why: "Riders whose latest ride falls behind a recency line — the win-back list, built on a per-group MAX date and a half-open comparison." },
    { slug: "basket-depth-aov", why: "Ride-bundle depth and average order value — how many lines a corporate ride bundle carries, the fan-out read at the money grain." },
    { slug: "compute-the-rank-as-a-percentage", why: "Rank expressed as a percentile of the ladder — where a rider sits on the utilization board as a share, the growth pod's cohort-cutting question." },
    { slug: "credit-utilization-bands", why: "Ratio computed then CASE-banded — rides-per-scooter-per-day utilization bands, the rebalancing trigger read, where arm order decides which models go hot." },
    { slug: "deferred-revenue", why: "Money billed but not yet earned — prepaid ride bundles sitting in the GL before the scooter moves, the accrual discipline behind the 34,833.28 book." },
    { slug: "delinquency-buckets", why: "Unsettled statements bucketed by age — the permit dunning ladder, where the cents-safe anti-join feeds an aging CASE the close ships on." },
    { slug: "chargeback-rate-ranking", why: "Dispute rates ranked by counterparty — which cities contest their permit statements, the civic-credit read before a renegotiation starts." },
    { slug: "monthly-transactions-i", why: "Categorize statements by activity inside a month with cents-safe folds — the settlement-rail read: which cities moved money, one CASE at a time." },
    { slug: "budget-pacing", why: "Spend pacing against a plan — the swap-ops opex read against the depot-and-charging budget, where pacing drift is the lease-renegotiation early warning." },
  ],
};
