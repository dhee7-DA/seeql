// Zara — Wave-11 (Task 102), ecom domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Fast-fashion SPEED SQL (distinct from asos's returns economy and shein's micro-batch promos): the
// storefront db read as a Zara trading sandbox — customers are market shoppers (region = market
// bucket), orders are drop batches with created_at as the drop clock (the batch cut) and shipped_at
// as the sell-through stamp (the day the batch moved — floor-bound or sold through; 82 of 103
// stamped, 2.98-day average, 2-4 spread: the fastest latency story in the db, told as the
// replenishment leg of the two-week design-to-shelf cycle). Status map: delivered = sold through
// (52, 50.5%), shipped = in-transit on the leg (30, 29.1%), pending = in-season, window open
// (14, 13.6%), cancelled = markdown-cleared (7, 6.8%). order_items are SKU-size lines (251 lines /
// 103 drops = 2.44, max 3 units on a line, 498 units total), products are garment SKUs (price =
// ticket; the ladder tops out at 199.99 — the >= 200 premium band is empty), suppliers are garment
// marketplaces, invoices are marketplace settlement statements, payments are settlement rails
// (card 16 legs/37,364.00 vs wire 11/32,248.00), expenses are platform opex, ledger_entries are the
// GL. Finance tables store INTEGER cents — the dollar read is amount_cents / 100.0; orders.total
// and order_items.unit_price are REAL dollars.
// Pool provenance: company-pools.md carries NO Zara section (0 tagged rows) — all 10 topic slug
// sets and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* topics)
// and say so in brief P4. Facts: scripts/company-facts.md (probed 2026-10-12, wave-8+9 canonical
// dumps 2026-10-16) plus this agent's read-only bun -e probes of db/custom.db — markdown-ladder
// cells (92.4/91.8/90/88/87.7, near-misses 81.9/80.9/80/80), latency fold 27/30/25, fanned billed
// book 96,700.00 vs true 86,977.00, line-weighted clock 3.03 over 203 stamped lines, HDMI 19
// lines/38 units. Every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: zara is NOT yet in registry COMPANY_META — wire
// id "zara", domainId "ecom", name "Zara", tagline "Design-to-shelf in two weeks: drop clocks,
// sell-through speed, markdown windows", accent "text-stone-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const zaraKit: CompanyKit = {
  id: "zara",
  domainId: "ecom",
  name: "Zara",
  tagline: "Design-to-shelf in two weeks: drop clocks, sell-through speed, markdown windows",
  accent: "text-stone-400",

  brief: [
    "**Zara** is the fast-fashion machine that compressed the industry's six-month design-to-shelf calendar into two weeks — trend read on Monday, pattern cut midweek, on the floor inside a fortnight, with twice-weekly drops keeping every rail fresh. The economics are speed economics: a garment that sells through at full ticket inside its window never meets a markdown, and every day of dwell time burns margin. This kit maps the storefront db onto that world: the 16 customers rows are market shoppers, **103 drop batches worth 34,833.28**, and the 251 order_items rows are SKU-size lines — quantity = units in the size run, unit_price = the ticket. The fate map is fixed: delivered = {emerald:sold through} (52, 50.5%), shipped = {sky:in-transit on the leg} (30, 29.1%), pending = in-season with the window open (14, 13.6%), cancelled = {rose:markdown-cleared} (7, 6.8%).",
    "The data org reads one clock above everything else: a batch is cut at created_at — the drop clock — and shipped_at stamps the day it moved, floor-bound or sold through. **82 of 103 batches** carry the stamp, averaging **2.98 days** cut-to-move with a 2–4 spread (the probe folds it as 27 batches on day 2, 30 on day 3, 25 on day 4) — the fastest latency story in this db, and the replenishment leg that makes the two-week promise real. The market speed map reads APAC 2.93 from 29 stamps, EU 2.94 from 36, US 3.07 from 15, LATAM 3.5 from 2. The 14 in-season batches have no stamp — *a population definition, not a cleanup job*. Ticket ladders live on products (budget 8 SKUs at 32.06, mid 8 at 111.50, nothing at or above 200 — the ceiling is 199.99); money sits one layer down in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-speed with a markdown eye. A typical loop opens with the **drop fate census** — 52 sold, 30 in-transit, 14 in-season, 7 markdown-cleared, reconciling to 103 by construction — then a two-grain market read (EU runs 45 batches from 8 markets at 5.6 per market while the US runs 19 from 2 at 9.5), then the sell-through ladder where four markets sit tied at 4 batches and rank semantics become a policy call. The {orange:markdown round} folds stock cover — `p.stock - SUM(oi.quantity)` against the ticket, gate at 85% unsold — and the panel asks which five SKUs open the window. Late rounds walk settlements in cents — 21 exact (65,612.00), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00 — and probe the two liars: #11 void-but-settled at 925.00, #28 paid with zero legs at 1,756.00.",
    "Preparation strategy: the pools file carries no Zara section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's screen shapes: one-pass fate censuses, drop clocks with stated populations, two-grain market reads, CASE ticket ladders, markdown gates, month-spine cadence walks and cents-safe settlement folds. Do the topics in order, then run all six case studies on the live storefront db: the {violet:one-pass fate census} the drop board opens with, the {orange:markdown-window list} the trading floor debates each week, and four more that rehearse the market speed ladder, the drop-clock speed grid, the full-ticket all-stars and the drop-count spine. The kit is built for spaced practice rather than one sitting — re-run each case a week later from a blank editor and the walkthroughs become the recall test. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The drop-board refresh comes first. The analyst checks whether overnight sell-through stamps landed, then runs the fate census before anything else: 52 sold, 30 in-transit, 14 in-season, 7 markdown-cleared — **103 by construction**, and a branch that fails the identity is *the day's first incident*, not a rounding note. Then the clock: does the **2.98-day** average hold, or has a market drifted — the US already runs 3.07 against APAC's 2.93? A junior's number reading 3.03 gets caught here: the line-weighted average, re-weighted by joining SKU-size lines into the fold — {rose:the grain bug of the week}.",
    "**11:30 —** Midday is the {orange:markdown triage}. The window list re-cuts: the 85%-unsold gate keeps **five SKUs** — HDMI 2.1 Cable 2m at 92.4, Running Socks 3-pack at 91.8, Bluetooth Speaker Mini at 90, Wireless Mouse M3 at 88, Yoga Mat Eco 6mm at 87.7 — with desk mat 81.9 and cycling jersey 80.9 on the watch line. The buyer wants the chase list beside it: Pacific Textiles sits at a **3.9 rating** with 8.6% of sell-through value, the slow lane of the marketplace bench. Each ask is a fold, a gate and one judgment call about grain — *the analyst writes the query twice, once to answer and once with the population spelled out*.",
    "**15:30 —** The afternoon tilts toward money. The settlement anti-join refreshes first — **6 never-settled statements worth 15,217.00** — before the marketplace desk sends a single chaser; the coverage split reads **21 exact, 1 partial** (4,000.00 of 6,148.00) against the two liars walked line by line: #11 void-but-settled at 925.00, #28 paid with zero legs at 1,756.00. The rails get their look too — card legs (16, 37,364.00) against wire legs (11, 32,248.00) — and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Sell-through rate", what: "Sold-through share of the drop book: 52 of 103 batches, 50.5%. The headline the trading call opens with — a batch that sells through never meets a markdown, and every point of this rate is margin kept." },
    { name: "Drop clock", what: "Cut-to-move latency over stamped batches only: 82 of 103 (79.6%), 2.98-day average, 2–4 spread — the probe's fold reads 27 batches on day 2, 30 on day 3, 25 on day 4. The fastest latency story in the db, told as the replenishment leg of the two-week cycle." },
    { name: "Speed map by market", what: "Stamped batches and average days per market: APAC 29 at 2.93, EU 36 at 2.94, US 15 at 3.07, LATAM 2 at 3.5. The drift map that decides where the replenishment queue gets pulled before the trading call." },
    { name: "Drop fate census", what: "52 sold, 30 in-transit, 14 in-season, 7 markdown-cleared — 103 by construction. Every fate is a conditional count over a status, and the reconciliation identity is the board's correctness argument." },
    { name: "Markdown-clearing share", what: "Cancelled share of booked batches by market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The markdown door's traffic map — sliced by the same region rollup every other metric uses." },
    { name: "Markdown-window gate", what: "SKUs holding 85%+ of stock unsold: 5 of 16 (92.4 down to 87.7), with near-misses at 81.9, 80.9 and two at exactly 80.0. The weekly markdown list the trading floor debates, gate and precision included." },
    { name: "Lines per drop", what: "251 SKU-size lines across 103 batches (2.44 per batch, max 3 units on a line, 498 units total). Size runs show up here first — a deepened run is new lines, not new batches." },
    { name: "Marketplace concentration", what: "Sell-through value by garment marketplace: Nordic Gadgets AB 32.0%, Midwest Hardware Co 26.7%, Alpine Audio GmbH 13.7% — and Pacific Textiles at 8.6% on a 3.9 rating, the slow lane the chase list watches." },
  ],

  topics: [
    {
      name: "One-pass fate censuses",
      why: "The drop board reads sold, in-transit, in-season and markdown-cleared in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "sales-by-day-of-the-week"],
    },
    {
      name: "Drop-to-floor clocks",
      why: "Every Zara screen opens with the clock: batch cut at created_at, moved by shipped_at, delta averaged over stamped rows only. The population is the whole grade — 82 stamped of 103 booked (79.6%), 2.98-day average with a 2–4 spread — and the 14 in-season batches are excluded by definition, not by cleanup. julianday arithmetic with a stated denominator is the shape being tested.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "median-time-to-convert", "customers-with-maximum-number-of-transactions-on-consecutive-days"],
    },
    {
      name: "Two-grain market censuses",
      why: "Batches and markets are different grains of the same join: EU runs 45 batches from 8 markets (5.6 per market) while the US runs 19 from 2 (9.5). COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio decides whether a market is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "find-bursty-behavior", "rolling-7d-actives", "sales-analysis-iii", "percentage-of-users-attended-a-contest", "immediate-food-delivery-i", "capital-gain-loss", "game-play-analysis-i", "combine-two-tables", "confirmation-rate", "group-sold-products-by-the-date"],
    },
    {
      name: "Ticket ladders with CASE",
      why: "Zara's price architecture is a ladder, not a continuum: the ticket fold splits 16 SKUs into 8 budget at 32.06 and 8 mid at 111.50, and the >= 200 premium arm is honestly empty — the ladder tops out at 199.99. Arms must be exhaustive and ordered: a hole in the CASE is a hole in the ladder, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories", "usage-tier-percentiles", "spend-histogram", "number-of-employees-who-met-the-target"],
    },
    {
      name: "Markdown gates & HAVING floors",
      why: "The markdown list is a group-level gate: fold stock cover per SKU, then judge the fold — WHERE cannot see aggregates and HAVING cannot see pre-fold rows. The same shape drives every threshold question here: which markets carry at least N batches, which SKUs clear the sell-through bar. The panel wants the clause chosen by asking: is this a fact about one row, or about one fold?",
      slugs: ["classes-more-than-5-students", "customer-order-frequency", "find-customers-with-positive-revenue-this-year", "the-number-of-users-that-are-eligible-for-discount", "calculate-product-final-price"],
    },
    {
      name: "Stock-cover folds",
      why: "Markdown risk is stock minus sold at SKU grain: the join to order_items fans every batch into SKU-size lines, so SUM(quantity) is the only honest fold — COUNT reads lines (19 on the HDMI cable, not 38 units) and AVG reads line depth (2.0). Every SKU on this db has sold at least once, so the inner join keeps all 16 rows — a fact worth proving, not assuming.",
      slugs: ["find-stores-with-inventory-imbalance", "product-sales-analysis-ii", "sales-analysis-i"],
    },
    {
      name: "Drop cadence calendars",
      why: "The 14-month drop spine (2024-01 to 2025-02) is the cadence call's home turf: 6 to 9 batches a month, trough months named, markdown-clearing windows defended in the same breath — July and November each carry 2 of the 7 cleared batches. STRFTIME builds the spine and LAG walks it; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i", "year-on-year-growth-rate", "friday-purchases-i", "seasonal-sales-analysis", "same-day-sale", "product-price-at-a-given-date"],
    },
    {
      name: "Sell-through leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the batch ladder runs 24, 17, 14, 13, 5 and then FOUR markets sit tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer markets, not syntax. The panel asks you to pick one and defend it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "premier-league-table-ranking", "customer-placing-the-largest-number-of-orders", "customers-with-strictly-increasing-purchases", "the-most-recent-orders-for-each-product", "top-travellers"],
    },
    {
      name: "Settlement set algebra",
      why: "Board packets stack populations — in-transit under markdown-cleared, this month beside last — and EXCEPT answers 'which sold batches never stamped a settlement'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The settlement anti-join (6 never-settled statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "movie-rating", "customers-who-bought-all-products", "find-churn-risk-customers"],
    },
    {
      name: "Cents-safe settlement reads",
      why: "Sold is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the floor meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve the marketplace, wire legs (11, 32,248.00) settle the wholesale book.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "number-of-rich-customers", "ar-aging-schedule", "portfolio-concentration-hhi"],
    },
  ],

  theory: [
    {
      id: "zara-t1",
      q: "Your sell-through report joins drop batches to their market rows, and settlements to their payment legs. When do you INNER and when do you LEFT — and what silently breaks if you filter a settlement column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. Batches join markets: a batch with no market row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join; on this db the never-ordered anti-join returns a confident zero, which is exactly how you prove the inner join loses nothing. Settlements join legs the other way: the 6 never-settled statements worth 15,217.00 ARE the answer, arriving with NULL leg columns, so the read must be LEFT from statements. The classic break: filtering a leg column in WHERE after the LEFT kills every NULL-payload statement row — the LEFT quietly became an INNER, and worse, the paid-status statement with zero legs (#28, 1,756.00) vanishes from the very list it heads. The fix is moving the predicate into ON or an outer query. A Zara reviewer reads the AR list top-down expecting #28 first; an accidentally-inner join hands them a clean ledger that lies by omission — the analyst's job is to prove the zero, the six, and the one, every close.",
      tag: "joins",
    },
    {
      id: "zara-t2",
      q: "The sell-through ladder runs 24, 17, 14, 13, 5 batches, then FOUR markets tie at 4, then two at 3. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and then skips — on this db the four-way tie consumes ranks 6 through 9 and the two 3-batch markets land on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose market gets the buy team's attention first. There is a second layer Zara candidates get asked: the same tie problem shows up inside a running batch walk — SUM OVER (ORDER BY created_at) uses a default RANGE frame, so batches sharing a cut date enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer markets, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment so the leaderboard survives review.",
      tag: "windows",
    },
    {
      id: "zara-t3",
      q: "The board shows 103 drop batches, 251 SKU-size lines and 498 units. Why do the three counts disagree, and what does each one mean to the business?",
      a: "They disagree because they count at three grains of the same objects. 103 is batches — orders rows, one per drop cut. 251 is lines — order_items rows, 2.44 per batch on this db. 498 is units — SUM(quantity) over those lines, max 3 on a line. Join batches to lines and COUNT(*) silently counts lines, not batches: 251 wearing the name 'batches' is the most common grain bug in this building, and the fate census that reconciles to 103 stops reconciling the moment the join fans out. The same discipline scales up: EU runs 45 batches from 8 markets — 5.6 per market — while the US runs 19 from 2, 9.5 per market; load, coverage and intensity are three different columns and the panel wants you to name which is which. Saying 'one row per what?' before every COUNT is the habit being graded, because every Zara dashboard is a grain decision first and a query second.",
      tag: "aggregation",
    },
    {
      id: "zara-t4",
      q: "shipped_at is NULL until a drop batch moves. What is your policy for the speed report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped batches have a clock, so the report measures cut-to-move for the 82 of 103 batches that carry the stamp — 2.98-day average, 2–4 spread, 27/30/25 across the day-2/3/4 fold — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL batches returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 21 unstamped rows — 14 in-season batches plus 7 markdown-cleared — which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day moves for in-season batches that have not moved, and it poisons the 2.98 baseline every market drift alert keys off. A report whose WHERE clause is doing definitional work without saying so is exactly what a Zara reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "zara-t5",
      q: "The markdown list keeps SKUs whose unsold share crosses 85%. Where does each filter live in the query, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The 85% gate is a fold-level fact — it judges SUM(quantity) per SKU, so it lives after GROUP BY: HAVING, or a verdict CASE evaluated post-fold with the ORDER BY doing the gate's presentation. WHERE COUNT errors because aggregates do not exist before groups form; HAVING on a raw column errors because the column is gone after the fold. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a markdown list and an error. One more placement rule Zara screens love: the percentage — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the markdown-clearing share truncates toward zero; on this db it is the difference between APAC's 8.1% and a printed 0.",
      tag: "pipeline",
    },
    {
      id: "zara-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 batches always produce the 338.19 mean, and the market cut is concrete — US 383.48 and LATAM 426.22 clear it, EU 335.32 and APAC 313.66 do not. On filtered staging tables — one month, one status, one market — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each batch to ITS market's average) re-runs per outer row and answers a different question at a different cost, and it inherits the same empty-inner behavior when a market's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole markdown list empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "zara-t7",
      q: "The cadence report buckets drop batches by month on TEXT dates. How do you build the spine, and how do you defend the markdown windows it shows?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the cadence trend becomes fiction. The window: the defensible habit is half-open — created_at >= '2024-07-01' AND created_at < '2024-08-01' — and here is the honest nuance: this db stores date-only strings, so BETWEEN '2024-07-01' AND '2024-07-31' happens to hold every July batch today, but one timestamped reload makes the inclusive upper bound lose that month's last day; say the policy, not just the current luck. The LAG: on a month-ordered spine the first row's prior value is NULL — the baseline, never a zero. The story the spine defends: 6 to 9 batches a month, twice-weekly drops at monthly grain, and the markdown-clearing windows concentrating in July and November — 2 of the 7 cleared batches each — which is the pattern the markdown calendar is built on.",
      tag: "dates",
    },
    {
      id: "zara-t8",
      q: "The marketplace says a settlement statement is 'paid' but the legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settled leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00, statement #25), 6 none. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "zara-t9",
      q: "The running batch walk uses SUM(COUNT(*)) OVER (ORDER BY created_at). Why does the default frame matter on a book with same-day drops, and when do you pin ROWS?",
      a: "The default frame is RANGE, which is peer-based: every batch sharing the same created_at value enters the cumulative together. That is usually what a trading walk wants — same-cut batches are one drop — but the moment you switch the ORDER BY to a non-unique key without thinking (month, status), the frame silently widens to absorb peers and the running total jumps. Pin ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when you mean physical rows, one at a time. And at the series start the running sum is just the first row — the frame clips at the edge, never NULL-pads. Say the frame out loud in review: 'RANGE by drop clock, or ROWS if we walk row by row' is the whole answer.",
      tag: "windows",
    },
    {
      id: "zara-t10",
      q: "You need one packet holding the sold-through batches and the in-transit batches, stacked for the trading call. UNION or UNION ALL — and what silently breaks with the wrong one?",
      a: "UNION ALL, and the reason is arithmetic: the packet must foot to 52 + 30 = 82, and UNION deduplicates whole rows silently. If a market's sold-through count happens to equal its in-transit count — EU 45 and APAC 37 make coincidence plausible on any per-market cut — one of the two identical rows vanishes and the packet under-reports with no error. UNION ALL keeps every row and lets the counts speak. The discipline: stacked fate packets are distinct populations by construction, so they never need dedupe; reach for plain UNION only when collapsing duplicates IS the requirement, and write that in the query comment so the next analyst knows the dedupe was deliberate.",
      tag: "setops",
    },
    {
      id: "zara-t11",
      q: "EXCEPT answers 'markets that sold through but never cleared via markdown' on this db. How does EXCEPT behave, and what must be true of both sides before you trust the result?",
      a: "EXCEPT returns rows in the left set that do not appear in the right set — and it deduplicates, so 'four markets minus the three that ever cleared' is only trustworthy if each side is already one row per market. Two preconditions: the same bucket convention on both sides (region from the same join path, or the set algebra compares different keys), and NULL handling proven — EXCEPT treats NULLs as equal, which is what you want for market keys but a trap for nullable payloads. On this db the readout returns LATAM — the full-ticket-only market, 2 batches, no cancellations. That single-row answer is the markdown door's traffic map in set-algebra form: one query, no CASE, and the correctness argument is the dedupe discipline.",
      tag: "setops",
    },
    {
      id: "zara-t12",
      q: "'Flag every batch priced above its market's average ticket.' Walk me through the three shapes — derived table, correlated subquery, window — and which you'd ship.",
      a: "The derived table: a CTE computing AVG(total) GROUP BY region, joined back on region — one pass to build market means, one join to compare. The correlated subquery: (SELECT AVG(total) FROM orders o2 JOIN customers c2 … WHERE c2.region = c1.region) — re-evaluated per row, readable, and at 103 batches costless. The window: AVG(o.total) OVER (PARTITION BY c.region) — each market's mean computed once in the same scan, no join. All three flag the same rows: the US 383.48 and LATAM 426.22 markets clear the 338.19 platform mean, EU 335.32 and APAC 313.66 do not. The shipping answer is the window at scale and the derived table when the means get reused; the correlated form survives on a book this size, and saying WHY — 103 rows, not 103 million — is the part interviewers remember.",
      tag: "subqueries",
    },
    {
      id: "zara-t13",
      q: "The fate census claims 52 + 30 + 14 + 7 = 103 'by construction'. What does that identity actually guarantee — and what would falsify it?",
      a: "The identity holds because the four FILTER (WHERE status = …) branches partition on one column whose values are mutually exclusive — every batch lands in exactly one branch, so the branches must sum to COUNT(*). That guarantee is about the QUERY, not the data: it would still hold if a fifth status value appeared and silently fell outside all four branches, making the total 103 but the census incomplete. The falsification test is cheap and worth running each Monday before the trading call: SELECT DISTINCT status FROM orders and confirm the value set is exactly the four the census names. 'By construction' means the arithmetic cannot drift — it does not mean the taxonomy cannot. A census that reconciles while a fifth fate walks in the door is the most expensive kind of correct.",
      tag: "aggregation",
    },
    {
      id: "zara-t14",
      q: "NOT EXISTS or LEFT JOIN … IS NULL for the never-settled statements list — does it matter which, and what changes between them?",
      a: "Both are anti-joins and both return the same 6 statements worth 15,217.00 on this db. The differences are mechanical: NOT EXISTS stops at the first match per row and never needs the payload, while the LEFT JOIN form carries the NULL-payload rows through and is the shape to use when the report also wants the owed-cents column beside each chaser row. NOT IN is the twin to refuse: one NULL in the subquery's list poisons every comparison and the chaser list empties silently — the run reports success with nothing chased. In an interview, name the semantics first (which rows must survive — statements with no legs, liar #28 at the top), then the shape (LEFT JOIN + IS NULL for visibility, NOT EXISTS for intent), then the refusal (never NOT IN over a nullable column). That ordering is what a complete answer sounds like.",
      tag: "joins",
    },
    {
      id: "zara-t15",
      q: "The drop clock reads 2.98 days and folds to 27/30/25 batches on days 2/3/4. Walk me through every decision hiding in those numbers — population, arithmetic, bucketing.",
      a: "Population first: only the 82 of 103 batches carrying a shipped_at stamp have a clock — the 14 in-season and 7 markdown-cleared batches are excluded by definition, and the report title says 'stamped batches only'. Arithmetic second: JULIANDAY(shipped_at) − JULIANDAY(created_at) on the ISO text stamps — plain text subtraction coerces to 0 and flatlines the clock. Bucketing third: CAST of the fractional delta to INT truncates into whole-day buckets — 2, 3, 4 on this book, folding as 27/30/25; the truncated bucket and the 2.98 mean are different summaries of the same 82 rows, and both ship with their population stated. Rounding last: average the raw fractional deltas across all 82, then round ONCE for display. State all four decisions unprompted and the clock is defensible; skip the population and it is not.",
      tag: "dates",
    },
    {
      id: "zara-t16",
      q: "A marketplace feed just landed with 'studio desktop mic' beside 'Studio Desktop Mic'. What is your string-hygiene playbook for the SKU master?",
      a: "Detect first: GROUP BY the name and look for near-duplicates — LOWER(name) HAVING COUNT(*) > 1 is the probe, and on a 16-SKU ladder a split shows up as a phantom 17th SKU. Fix at the boundary, not in every query: normalize on ingest (TRIM for padding, UPPER or INITCAP for casing) so 'studio desktop mic' resolves to one SKU before it joins anything. Key on ids where joins allow — name is a display column, not a join key — because id-based joins survive a casing slip that name-based joins do not. And log the fix: the reload that silently created a second SKU also silently split a sell-through ladder row, and the audit trail is what lets the trading floor trust the next ladder. The habit being graded: text is data with a hygiene policy, not a given.",
      tag: "casing",
    },
    {
      id: "zara-t17",
      q: "NTILE(4) over the 16-market ladder versus the CASE split at the 50.00 ticket boundary — both produce four-ish tiers. When is each the right tool?",
      a: "NTILE is a row-count decision: 16 markets into 4 tiles is 4 per tile no matter where the batch counts gap — 24/17/14/13 head tile 1, the two 1-batch markets close tile 4, and the boundaries land wherever the row order puts them. The CASE split is a value decision: 50.00 is a policy boundary the buying team chose, and it happens to split the ladder 8-and-8 — but if three budget SKUs jumped to 60, the CASE still splits at 50 while NTILE still yields 4-and-4. Use NTILE when the question is 'spread the population into equal buckets' (quartile reporting, A/B splits); use CASE when the question is 'who crosses this policy line' (ticket ladders, gate lists). The interview trap is answering a value question with a row-count function — the tiers come out and the policy quietly disappears.",
      tag: "windows",
    },
    {
      id: "zara-t18",
      q: "The batch ladder runs 24, 17, 14, 13, 5, then FOUR markets tie at 4, then two at 3. How do you write the leaderboard, and what does the tie policy do to the output?",
      a: "The shape: RANK() OVER (ORDER BY COUNT(*) DESC) over the market fold, and the policy question is what the four-way tie means. RANK shares the rung — 6, 6, 6, 6 — and skips to 10 for the two 3-batch markets, implying six phantom positions; DENSE_RANK shares without gaps — the next distinct count lands on 7; ROW_NUMBER splits the tie arbitrarily, a silent judgment call about whose market gets the buy team's attention first. The defensible default on a book where ties are structural: shared rungs for peer markets, plus a named deterministic tie-breaker (created_at, then id) for display order, written into the query comment. The wrong answer is picking a function; the right answer is picking a policy and owning it.",
      tag: "windows",
    },
    {
      id: "zara-t19",
      q: "The drop-clock report runs slow. Walk me through how you'd read EXPLAIN QUERY PLAN and what you'd look for first.",
      a: "Run EXPLAIN QUERY PLAN on the exact statement and read the scan lines top-down: 'SCAN orders' means a full table read — acceptable at 103 rows, fatal at warehouse scale. The first suspect is sargability: any predicate that wraps the indexed column in a function — STRFTIME('%Y-%m', created_at) = '2024-07', julianday(created_at) BETWEEN … — hides the column from the index and forces the scan. The fix is the bare-column half-open range: created_at >= '2024-07-01' AND created_at < '2024-08-01' seeks the index and is boundary-correct besides. Second suspect is the join order — the driving table should be the filtered one, with join keys indexed on both sides. Then measure again: the plan before and after IS the evidence, and on a book this small the honest answer includes 'at 103 rows this is premature — the habit matters at scale'.",
      tag: "indexes",
    },
    {
      id: "zara-t20",
      q: "The speed board ships ORDER BY avg_days ASC LIMIT 5, and two markets sit at 2.93 against 2.94. What is your tie policy for every leaderboard this kit produces?",
      a: "Policy first, then SQL. If ties must be broken: add a deterministic tie-breaker that does not depend on plan order — avg_days ASC, region ASC, id ASC — so two analysts, two runs, two environments all print the same five markets. If ties must be honored: replace LIMIT with a rank window (RANK() <= 5) so every tied row ships and the board shows the peer set. What is never acceptable is bare LIMIT over a tied boundary: the engine keeps one arbitrary row, the leaderboard is non-deterministic between runs, and the two analysts comparing notes ship two different 'top 5'. The comment above the query names the choice — 'tie-break: region then id, deliberate' — because an undocumented ORDER BY is an undocumented policy, and undocumented policies are how trading floors lose trust in numbers.",
      tag: "windows",
    },
    {
      id: "zara-t21",
      q: "COALESCE keeps appearing in this kit — the settlement guard, the chaser display, the share promoter. What is the general placement rule?",
      a: "COALESCE is a decision about what an honest print looks like, and its placement decides whether it changes meaning. Display placement — COALESCE(SUM(l.amount_cents), 0) in the SELECT of the chaser list — turns 'no settlement yet' into a readable 0.00 without touching the classification. Arithmetic placement is where it lies: comparing COALESCE(SUM(...), 0) = billed inside the coverage CASE folds the 6 no-leg statements into a settled bucket and the 21/1/6 census stops footing. And the promoter is a different tool wearing a similar coat: 100.0 * sold / batches is about forcing real division before integer truncation — a type decision, not a NULL decision. The rule: COALESCE at the outermost display layer, never inside a predicate that classifies, and never as a substitute for deciding what 'not yet' means to the business.",
      tag: "nulls",
    },
    {
      id: "zara-t22",
      q: "Defense round: the per-market average tickets are EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Why is the platform's average ticket 338.19 and not their average, 364.67?",
      a: "Because the mean must be taken over the batch population, once. The four market means are each legitimate at their own grain — EU's 335.32 rests on 45 batches, LATAM's 426.22 on 2 — but averaging the four means gives every market one vote, so LATAM's small-n average moves the headline by 26 points. The batch-grain mean sums all ticket dollars (34,833.28) over all batches (103): 338.19. When a stakeholder wants the market story, print the means with their n beside them — 335.32 (45), 313.66 (37), 383.48 (19), 426.22 (2) — and let the reader see the weighting. The general rule the panel wants: every average ships with its denominator, and averages-of-averages are guilty until proven weighted.",
      tag: "aggregation",
    },
    {
      id: "zara-t23",
      q: "Before the close ships, what four proofs do you run — and what does each catch?",
      a: "One: the fate census identity — 52 sold-through + 30 in-transit + 14 in-season + 7 markdown-cleared = 103 — catches a fifth status value or a filter that silently dropped rows. Two: the ledger trial balance — 181,080 debits against 181,080 credits, delta zero — catches a one-sided entry or a join that duplicated or lost leg rows. Three: the settlement coverage census — 21 exact, 1 partial, 6 never-settled, footing to 28 — catches the two liars drifting: void-but-settled #11 folding out or paid-status #28 folding in. Four: the rails count — card 16 legs against wire 11 — catches a settlement routed to the wrong rail, which distorts every marketplace read downstream. Each proof is one query, each has a known-good value, and the close ships only when all four print green — the ritual is the argument that the numbers survived the journey from db to board.",
      tag: "quality",
    },
    {
      id: "zara-t24",
      q: "'Do in-season batches count in your sell-through base?' — the denominator question. How do you answer it so the panel stops asking?",
      a: "By deciding the denominator from the question's verb, out loud. 'Sell-through rate' counts the 52 sold-through over the full 103 booked — in-season batches stay in the base because they are still eligible to convert; that is the 50.5% the trading call opens with. 'Drop clock' runs over the 82 stamped only — in-season batches drop out because they have no clock yet, not because they failed. 'Markdown-clearing share' puts the 7 cleared over 103 — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0.0 — the numerator's siblings stay in the denominator unless the definition says otherwise. The unforgivable move is changing the base silently between slides: 52/103 (50.5%) and 52/82 (63.4%) are both real numbers and only one matches the stated question. Write the denominator into the report title or the query comment, and the follow-up stops being a trap and becomes a formality.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "zara-mcq-1",
      prompt: "A drop batch's status reads 'cancelled'. In this kit's Zara fate map, what happened?",
      choices: [
        "Markdown-cleared — the batch exited via markdown instead of selling through",
        "Abandoned pre-dispatch — the shopper never completed checkout",
        "In-transit — the batch is on the replenishment leg",
        "In-season — the sell-through window is still open",
      ],
      answer: 0,
      why: "The fate map is fixed: cancelled = markdown-cleared (7 of 103 batches, 6.8%). It sold wrong, not never — it leaves the sell-through book through the markdown door.",
      notes: [
        { choice: 1, why: "Abandoned-pre-dispatch is a different kit's read of the same column — the ASOS map, not this one. Here cancelled batches already moved; they cleared at markdown." },
        { choice: 3, why: "In-season is 'pending' — 14 batches with the window open and no stamp yet. Pending is 'not yet', not 'cleared'." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-2",
      prompt: "The 2.98-day drop clock averages created_at to shipped_at. Over which population does it run?",
      choices: [
        "All 103 drop batches — in-season rows count as 0 days",
        "The 82 stamped batches — 52 sold plus 30 in-transit",
        "The 52 sold batches only",
        "The 16 market rows, averaged per market",
      ],
      answer: 1,
      why: "Only stamped batches have a clock: 82 of 103 — 79.6% of the book. The 14 in-season batches have no stamp and no cycle yet — excluded by definition, and the report title says so.",
      notes: [
        { choice: 0, why: "AVG ignores NULLs, so in-season rows never count as 0 — the unfiltered average still prints 2.98 over a silently shrunken base. The bug is the unnamed population, not a zero-fill." },
        { choice: 2, why: "Sold-only (52) is the completed subset. The clock exists to watch movement, and in-transit batches moved — dropping them describes less, not better." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-3",
      prompt: "A dashboard folds order_items joined to orders and prints COUNT(*) per month. What does one row count?",
      choices: [
        "Drop batches — the join dedupes back to orders",
        "SKU-size lines — 251 across the book, 2.44 per batch",
        "Units — 498 across the book",
        "Distinct SKUs — 16 on the ladder",
      ],
      answer: 1,
      why: "COUNT(*) after the join counts rows at line grain: 251 SKU-size lines. The batch count (103) and the unit count (498, SUM of quantity) are different folds of the same join.",
      notes: [
        { choice: 0, why: "Nothing dedupes — the join fans each batch into its lines. A batch with 3 lines contributes 3, and the fate census quietly stops reconciling to 103." },
        { choice: 2, why: "Units need SUM(oi.quantity), not COUNT(*) — one row per line regardless of the size run's depth (max 3 units on a line)." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-4",
      prompt: "The markdown-clearing share query — 100 * SUM(status = 'cancelled') / COUNT(*) grouped by market — prints 0 for every market. Why?",
      choices: [
        "No batch was ever cancelled in most markets",
        "The 100 must sit before the division — SUM of 0/1 flags over COUNT is integer division and truncates toward zero",
        "status is NULL on cancelled batches, so SUM returns 0",
        "COUNT(*) counts NULLs and dilutes the share to 0",
      ],
      answer: 1,
      why: "Without the .0, the division is integer arithmetic: 3/45 truncates to 0 before the 100 lands. The fix is 100.0 first — on this db the difference between APAC's 8.1% and a printed 0.",
      notes: [
        { choice: 0, why: "Cancellation is real where it shows — APAC 3, EU 3, US 1, LATAM 0 of 7 total. The zero is arithmetic, not data." },
        { choice: 2, why: "Statuses are never NULL on this book — 103 rows, four clean values. The truncation happens with perfectly clean inputs." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-5",
      prompt: "Keep only SKUs whose unsold share is 85% or more. Where does the gate live?",
      choices: [
        "WHERE unsold_pct >= 85, before the fold",
        "After GROUP BY: HAVING, or the verdict CASE judged post-fold",
        "WHERE p.stock - oi.quantity >= 85 on the raw joined rows",
        "HAVING before GROUP BY, wherever it fits",
      ],
      answer: 1,
      why: "Unsold share is a fold-level fact — it exists only after SUM(quantity) forms per-SKU groups. The gate judges folds: HAVING, or the verdict CASE evaluated after the fold and ordered worst-first.",
      notes: [
        { choice: 0, why: "unsold_pct does not exist at WHERE time — no fold, no alias. The engine rejects it, and that rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "p.stock - oi.quantity is one line's arithmetic, not the SKU's — the gate would judge line fragments of stock cover, not the SKU's share." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-6",
      prompt: "A settlement statement reads amount_cents = 92500. What is the dollar read, and whose statement is it?",
      choices: [
        "9,250.00 — the partially settled statement #25",
        "925.00 — the void-but-settled statement #11",
        "92,500.00 — the raw ledger value",
        "9.25 — a mis-scaled rebate line",
      ],
      answer: 1,
      why: "Finance tables store INTEGER cents: 92500 / 100.0 = 925.00 — statement #11, the void that nonetheless settled one leg. It is the mirror anomaly: status lies, legs do not.",
      notes: [
        { choice: 0, why: "#25 reads 6,148.00 (614,800 cents) with 4,000.00 settled — a different row and a different story: partial, not void." },
        { choice: 2, why: "Printing raw cents reads a hundredfold-heavy book — the /100.0 read is the only dollar the close recognizes." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-7",
      prompt: "The exact-coverage bucket reads 21 statements settling to the cent (65,612.00 both sides). The anomaly list shows #11 (void, one settled leg, 925.00) and #28 (paid, zero legs, 1,756.00). Which statement about the census is TRUE?",
      choices: [
        "#11 folds IN by construction — its leg matches its billed cents; #28 folds OUT — no legs to settle with",
        "Both fold out — status is the ledger of record",
        "#28 folds in — paid status guarantees settlement legs",
        "Neither affects the count — the census reads statuses only",
      ],
      answer: 0,
      why: "Coverage classifies by legs, not claims: #11's single leg sums to its billed cents, so it is exact; #28 has no legs, so it is 'no payment' despite the paid status. The liars' effects are exactly one in, one out.",
      notes: [
        { choice: 1, why: "Status-as-ledger is the bug the census exists to catch — #11's void status would hide 925.00 of settled money and #28's paid status would vouch for money that never moved." },
        { choice: 2, why: "Paid-with-zero-legs is precisely the liar: #28 is the anti-join's headline row. A status never settles anything." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-8",
      prompt: "The sell-through ladder runs 24, 17, 14, 13, 5 batches, then FOUR markets tie at 4, then two at 3. Under DENSE_RANK, what rank do the 3-batch markets carry?",
      choices: ["7", "10", "9", "6"],
      answer: 0,
      why: "DENSE_RANK shares rungs without gaps: ranks 1–5 are distinct, the four-way tie reads 6, and the next distinct count lands on 7. Both 3-batch markets share rank 7.",
      notes: [
        { choice: 1, why: "10 is the RANK answer — gaps follow the tie block (ranks 6–9 consumed). The board's published policy here is DENSE_RANK." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies under RANK semantics — not the next rung handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-9",
      prompt: "A junior totals the billed book with SUM(i.amount_cents) over invoices JOIN payments and prints 96,700.00. The true billed book is 86,977.00. Diagnosis?",
      choices: [
        "The join fans the five two-leg statements (1, 5, 12, 19, 22 — 24,940.00 counted twice) AND the inner join drops the six never-settled statements (15,217.00) — inflation and loss at once",
        "The cents divider is missing — everything reads a hundredfold heavy",
        "Void statement #11 double-counted its 925.00",
        "The ledger's 181,080 trial balance leaked into the join",
      ],
      answer: 0,
      why: "Two bugs in one join: each 2-leg statement's billed cents repeat per leg (+24,940.00), and the INNER JOIN silently loses the 6 statements with no legs (−15,217.00). 86,977 + 24,940 − 15,217 = 96,700.00. Fold legs per statement, keep statement grain, and LEFT JOIN for the AR read.",
      notes: [
        { choice: 1, why: "The divider is present in the /100.0 read — the error is 9,723.00 of net drift, not a hundredfold skew. A missing divider would print 8,697,700." },
        { choice: 2, why: "#11's single leg matches its billed cents exactly — one row, one count. The fan-out lives on the TWO-leg statements." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-10",
      prompt: "The drop-clock report joins batches to their SKU-size lines for line detail, and the average drifts: 2.98 becomes 3.03 over 203 rows. What happened?",
      choices: [
        "The average became line-weighted — each batch's latency repeats per line, so line-heavy batches overweight the mean; the clock is a per-batch mean over 82 stamped batches",
        "The 21 unstamped batches entered as 0-day rows and dragged the mean up",
        "shipped_at NULLs were cast to 0 and inflated the delta",
        "The join dropped 48 rows and the smaller base inflated the average",
      ],
      answer: 0,
      why: "Latency is a batch-grain property; repeating it across a batch's lines re-weights the mean by line count — 2.98 at batch grain (82 batches) reads 3.03 line-weighted (203 stamped lines). Fold the clock at batch grain first, then join lines for detail.",
      notes: [
        { choice: 1, why: "Unstamped batches cannot enter — shipped_at IS NOT NULL filters them, and AVG skips NULL deltas anyway. The drift is re-weighting, not zero-fill." },
        { choice: 3, why: "The join does drop the 48 lines of unstamped batches (251 to 203) — but those rows carry NULL deltas and never entered the average. The base was 82 batches before and after." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-11",
      prompt: "The one-pass fate census counts all four drop fates in one scan. Which line prints the sold-through count?",
      choices: [
        "COUNT(*) FILTER (WHERE status = 'delivered')",
        "COUNT(status = 'delivered')",
        "COUNT(*) WHERE status = 'delivered'",
        "SUM(DISTINCT status = 'delivered')",
      ],
      answer: 0,
      why: "FILTER (WHERE …) is the one-pass branch: it counts the 52 sold-through batches inside the same scan that prints 30 in-transit, 14 in-season and 7 markdown-cleared. The branches reconcile to 103 by construction — that identity is the census's correctness argument on the trading call.",
      notes: [
        { choice: 1, why: "COUNT(expr) counts non-NULLs — the 0/1 comparison is never NULL, so it prints 103." },
        { choice: 3, why: "DISTINCT over 0/1 flags folds to at most two values, then SUM returns 1 — a nonsense census column that parses cleanly." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-12",
      prompt: "A junior ships the speed board as `SELECT region, AVG(...) FROM ... LIMIT 5` — no ORDER BY. What lands on the trading call?",
      choices: [
        "The five fastest markets — the engine infers the intended order from the aggregation",
        "An arbitrary five rows — without ORDER BY the plan picks row order, and it can differ between runs and environments",
        "An error — LIMIT requires ORDER BY",
        "All markets, truncated to five by the display layer",
      ],
      answer: 1,
      why: "LIMIT is a row cap, not a ranking: with no ORDER BY the engine hands back whatever order the plan produces, so the 'top 5' is five arbitrary markets. The fix is ORDER BY avg_days ASC, LIMIT 5 — plus a deterministic tie-breaker (region ASC) because the speed map has near-ties (2.93 against 2.94).",
      notes: [
        { choice: 1, why: "Nothing dedupes or orders implicitly — a dashboard that looks stable today is one plan change away from reshuffling." },
        { choice: 2, why: "LIMIT without ORDER BY parses fine and runs — the bug ships silently, which is exactly what makes it dangerous." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-13",
      prompt: "The cadence report buckets drop batches with STRFTIME('%m', created_at). What does the spine look like?",
      choices: [
        "14 month buckets from 2024-01 to 2025-02 — correct as always",
        "12 buckets — January 2024 and January 2025 merge into one key, and the year-over-year story becomes fiction",
        "One bucket per week — '%m' means month-day",
        "NULL for every row — '%m' is not a valid format specifier",
      ],
      answer: 1,
      why: "'%m' emits the month number alone: '2024-01' and '2025-01' both collapse to '01'. The spine needs '%Y-%m' (or SUBSTR(created_at, 1, 7)) to keep the 14 buckets distinct — and on a book whose drops run 6 to 9 a month, merging two Januaries quietly halves the cadence noise and doubles the counts.",
      notes: [
        { choice: 0, why: "The merged spine still looks plausible — 12 buckets, reasonable counts — which is why this bug survives review more often than it should." },
        { choice: 2, why: "'%m' is month; '%d' is day. Format strings are a contract — read them character by character." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-14",
      prompt: "A market readout joins batches to their market rows and prints each region 19-plus times. What folds it back to the four markets?",
      choices: [
        "GROUP BY region is mandatory after any join",
        "DISTINCT in the projection — the duplicates are batch-grain rows, not data errors",
        "LIMIT 4 — cap the output to the four known markets",
        "WHERE region IS NOT NULL — the duplicates are NULL-region ghosts",
      ],
      answer: 1,
      why: "The join fans each market into its batches — EU repeats once per drop. DISTINCT folds the projection back to the four market buckets; GROUP BY belongs when you aggregate, LIMIT truncates arbitrarily, and every batch carries a region (the never-ordered anti-join is empty on this db).",
      notes: [
        { choice: 0, why: "Joins are legal without GROUP BY — the output is simply at batch grain. The engine is not waiting for permission." },
        { choice: 2, why: "LIMIT 4 keeps an arbitrary four rows — likely four EU batches. Only DISTINCT folds to markets." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-15",
      prompt: "The drop clock folds to day buckets: 27 batches on day 2, 30 on day 3, 25 on day 4. Which expression produces the integer day for each stamped batch?",
      choices: [
        "o.shipped_at - o.created_at",
        "CAST(julianday(o.shipped_at) - julianday(o.created_at) AS INT)",
        "SUBSTR(o.shipped_at, 9, 2) - SUBSTR(o.created_at, 9, 2)",
        "julianday(o.shipped_at) % julianday(o.created_at)",
      ],
      answer: 1,
      why: "julianday converts each ISO text stamp to a fractional day count; the difference is fractional days, and CAST AS INT truncates to the whole-day bucket — 2, 3, or 4 on this book. Plain text subtraction coerces to 0; day-of-month subtraction breaks the moment a batch crosses a month boundary (Jan 2 minus Jan 31 is negative, not 2).",
      notes: [
        { choice: 0, why: "'2024-01-05' - '2024-01-03' coerces to 0 − 0 = 0 — every batch lands in a phantom day-0 bucket." },
        { choice: 2, why: "Month-crossing batches read negative or absurd — the clock's 2–4 spread would fill with artifacts." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-16",
      prompt: "LAG(COUNT(*)) OVER (ORDER BY month) on the 14-month drop spine — what does the first row's delta column print, and what does it mean?",
      choices: [
        "0 — no change from a zero baseline",
        "NULL — no prior month exists; the baseline is 'undefined', never zero",
        "The first month's own count — LAG wraps to the current row",
        "An error — LAG cannot open a window series",
      ],
      answer: 1,
      why: "LAG looks one row back and finds nothing, so the first delta is NULL — and that NULL is information: the spine has no prior to differ against. COALESCE-ing it to 0 invents a fake flat opening and invites a 'cadence collapsed in January' headline nobody can defend.",
      notes: [
        { choice: 0, why: "A 0 delta claims the prior month's count was equal — it claims a fact about a month that is not in the data." },
        { choice: 2, why: "LAG never wraps; that is LAG's honesty. The first row is the baseline the rest of the walk is measured from." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-17",
      prompt: "The slide prints the sell-through share: 52 sold-through of 103 batches. Which expression prints 50.5?",
      choices: [
        "ROUND(52 / 103 * 100, 1)",
        "ROUND(100.0 * 52 / 103, 1)",
        "ROUND(CAST(52 AS TEXT) / 103, 1)",
        "52 / 103 * 100.0",
      ],
      answer: 1,
      why: "The 100.0 must sit BEFORE the division: it promotes the arithmetic to real numbers, so 52/103 reads 0.505 and scales to 50.5. Choice 0 divides two integers first — 0 — and prints 0.0; choice 3 truncates after the integer division for the same reason. Order of operations is the whole question.",
      notes: [
        { choice: 0, why: "52 / 103 is integer division in SQLite: 0. The 100 and the ROUND happen after the damage." },
        { choice: 3, why: "Same trap from the other end — the division truncates before the 100.0 lands." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-18",
      prompt: "The morning board prints one cell per drop day listing the day's SKUs. The list reads 'Yoga Mat Eco 6mm,Desk Mat Extended' — no space. Fix?",
      choices: [
        "Wrap the result in TRIM to insert the missing space",
        "Pass the two-character separator explicitly: GROUP_CONCAT(p.name, ', ')",
        "GROUP_CONCAT cannot take a separator; stitch with || per row",
        "It is cosmetic — the floor scanner ignores whitespace",
      ],
      answer: 1,
      why: "Bare GROUP_CONCAT defaults to ',' with no space. The explicit ', ' separator is the one-argument fix — the fold stays one scan, and the cell reads the way the floor reads it. TRIM strips edges, not middles, and per-row || reintroduces the ordering problem the aggregate solves.",
      notes: [
        { choice: 0, why: "TRIM removes leading/trailing spaces — there is nothing to strip; the space must be inserted BETWEEN values by the separator." },
        { choice: 2, why: "GROUP_CONCAT's second argument IS the separator — that is its contract." },
      ],
      difficulty: "easy",
    },
    {
      id: "zara-mcq-19",
      prompt: "The buy team asks for markets whose sell-through rank is 2 or better. A colleague writes `WHERE RANK() OVER (ORDER BY COUNT(*) DESC) <= 2`. What happens?",
      choices: [
        "It works — window functions are allowed in WHERE",
        "It errors — windows evaluate after WHERE, so the rank must be computed in a subquery or CTE and filtered outside",
        "It works but returns exactly 2 rows regardless of ties",
        "It silently returns every market",
      ],
      answer: 1,
      why: "The pipeline evaluates WHERE before the window layer exists, so a window call in WHERE is rejected. The escalation shape: fold batches per market with the RANK computed in a CTE, then keep rank <= 2 outside — and note the rank is 2-or-better, so the EU/APAC pair ships as two rows, not an arbitrary cut.",
      notes: [
        { choice: 2, why: "RANK could hand two markets one shared rung — but the query never reaches that question; it errors at parse-planning." },
        { choice: 3, why: "Nothing runs. The rejection is the pipeline-order lesson itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-20",
      prompt: "A 3-month rolling drop count — `COUNT(*) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` — runs down the spine. What prints on the first two months?",
      choices: [
        "NULL for both — the frame has no preceding rows yet",
        "The count of whatever months exist — 1 month on the first row, 2 on the second; the frame clips at the edge",
        "The full-spine count until three months accumulate",
        "A runtime error — the frame is malformed",
      ],
      answer: 1,
      why: "ROWS frames clip at the partition boundary: row 1 counts itself alone, row 2 counts two months, and the 3-wide rolling count only exists from month 3. Analysts who assume full-width frames misread the opening of the spine — the first row's 'rolling count' is just that month's own total.",
      notes: [
        { choice: 0, why: "Frames never pad with NULL — they shrink. The clip is honest arithmetic, not missing data." },
        { choice: 2, why: "A frame defaulting to the whole partition is the no-frame window, not a 3-row ROWS frame." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-21",
      prompt: "NTILE(4) over the 16-market drop ladder ordered by batches descending — how do the tiers come out?",
      choices: [
        "Four tiers of 4 markets each — row-count buckets, regardless of where the batch counts gap",
        "Four tiers sized by batch range — the 24-batch market alone on tier 1",
        "One market per tier — NTILE splits by value density",
        "Four tiers of 4; the 24-batch market lands in tier 4 because tiers run bottom-up",
      ],
      answer: 0,
      why: "NTILE distributes ROWS evenly: 16 markets over 4 tiles is 4 per tile no matter how the counts gap — 24/17/14/13 head tile 1, the two 1-batch markets close tile 4. Tier boundaries land where the row order puts them; if the buy team wants tiers at value thresholds (4-plus batches), that is a CASE decision, not NTILE.",
      notes: [
        { choice: 1, why: "Tiles are row-count buckets; NTILE never reads the values it tiles." },
        { choice: 3, why: "With ORDER BY batches DESC the first tile takes the first rows — the busiest markets." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-22",
      prompt: "`SELECT region FROM orders-based sold-through census EXCEPT SELECT region FROM batches WHERE status = 'cancelled'` — cancellations touch APAC 3, EU 3, US 1, LATAM 0. What ships?",
      choices: [
        "All four markets — EXCEPT never removes rows that appear once",
        "LATAM only — the one market whose batches never cleared via markdown",
        "APAC, EU and US — the markets with cancellations",
        "Empty — EXCEPT requires both sides to have identical counts",
      ],
      answer: 1,
      why: "EXCEPT keeps the left set minus any row also in the right set: four markets minus the three that ever cleared via markdown leaves LATAM — the full-ticket-only market. It is the set-algebra readout for 'where did the markdown door never open', and it dedupes silently, so both sides must already be one row per market.",
      notes: [
        { choice: 2, why: "That is the right side alone — EXCEPT answers 'left minus right', not 'right'." },
        { choice: 0, why: "EXCEPT removes every left row with a right-side match, even one. The three cancellation-touched markets are gone." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-23",
      prompt: "The ticket ladder is armed as: `CASE WHEN price >= 50 THEN 'mid' WHEN price >= 200 THEN 'premium' ELSE 'budget' END`. What is wrong on this range?",
      choices: [
        "Nothing — no SKU reaches 200, so the premium arm never matters",
        "The premium arm is dead code: WHEN arms fire in order, so >= 50 catches every ticket at 50-and-up first — the ladder tops at 199.99 today, but the first 200-plus SKU silently bands as mid",
        "SQLite reorders WHEN arms by selectivity, so it self-corrects",
        "The ELSE arm now catches everything under 200 only",
      ],
      answer: 1,
      why: "CASE is first-match-wins and the arms must run broad-to-narrow. On today's 16 SKUs the reorder changes nothing — 199.99 is the ceiling — but it is a policy bug waiting for the first premium SKU, which will land in mid with no error to flag it. Arms run narrow-first: >= 200, then >= 50, then the ELSE.",
      notes: [
        { choice: 0, why: "The empty premium band is honest on today's ladder — but arm order decides what happens the day the range adds one. That is exactly when the bug ships invisibly." },
        { choice: 2, why: "Engines evaluate WHEN arms in written order — selectivity reordering is a myth." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-24",
      prompt: "The speed report filters with `WHERE STRFTIME('%Y-%m', created_at) = '2024-07'`. The platform team rewrites it as a half-open range on the raw column. Why?",
      choices: [
        "STRFTIME cannot be used in WHERE",
        "Sargability: wrapping the column in a function hides it from any index and forces a scan; created_at >= '2024-07-01' AND created_at < '2024-08-01' stays index-usable and cannot leak into August",
        "The function form loses the last night of July",
        "They are equivalent — the team just prefers readability",
      ],
      answer: 1,
      why: "A predicate on the bare column is sargable — the engine can seek the index range; a function-wrapped column must be evaluated row by row. The half-open upper bound is also the boundary-correct form: BETWEEN on '2024-07-31' drops a timestamped July 31 drop the function form would keep — and at drop cadence, the last night carries volume.",
      notes: [
        { choice: 0, why: "It parses and runs fine — the cost, not the grammar, is the argument." },
        { choice: 2, why: "The function form is boundary-correct on this db's date-only text; the risk sits in the BETWEEN variant, not STRFTIME." },
      ],
      difficulty: "medium",
    },
    {
      id: "zara-mcq-25",
      prompt: "A stakeholder averages the four per-market average tickets — EU 335.32, APAC 313.66, US 383.48, LATAM 426.22 — and reports 364.67. The board's ticket average is 338.19. Which number survives the trading call?",
      choices: [
        "364.67 — per-market averages are the honest cut of a market business",
        "338.19 — the batch-grain mean over 103 batches; 364.67 weights LATAM's 2 batches as heavily as EU's 45",
        "Both — they answer different questions, so either can headline the deck",
        "Neither — the average ticket is undefined on a book this small",
      ],
      answer: 1,
      why: "Averaging averages reweights the population: LATAM's 426.22 rests on 2 batches yet counts as one full vote. The batch-grain mean over all 103 batches is 338.19 — the number every other metric (ticket ladders, market intensity) divides from. If the market cut is wanted, print n beside each mean.",
      notes: [
        { choice: 0, why: "Per-market means are legitimate market views — but their unweighted average is not the platform's average ticket, and 364.67 reconciles to nothing downstream." },
        { choice: 2, why: "They are different numbers wearing one name — the deck that quotes both without grain labels fails the first 'how do you know' follow-up." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-26",
      prompt: "'Flag every batch priced above its own market's average ticket.' Correlated subquery on the market mean, or AVG(total) OVER (PARTITION BY region)? What differs?",
      choices: [
        "Results differ — the window computes market means over a different population",
        "Same rows, different cost: the correlated form re-runs per batch, the window computes each market's mean once — at 103 batches either works, at scale the window wins",
        "The window form errors — PARTITION BY cannot reference the outer query",
        "The correlated form errors — subqueries cannot reference aggregates",
      ],
      answer: 1,
      why: "Both compare each batch to its market mean; they differ in evaluation. The correlated subquery re-runs once per outer row; the window computes each partition's average once per scan. On 103 batches the cost is invisible — the interviewer is probing whether you know which shape scales to a season of batches.",
      notes: [
        { choice: 0, why: "Same partition logic, same population, same rows. The follow-up is always 'then why reach for the window?' — cost at scale." },
        { choice: 2, why: "PARTITION BY needs no outer reference — it partitions the same query's rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-27",
      prompt: "The markdown gate moves from 85% unsold to 80%. The gate list over 85 holds five SKUs (92.4, 91.8, 90, 88, 87.7), with desk mat 81.9, cycling jersey 80.9, and ring light and laptop stand at exactly 80.0. How many SKUs open the window at 80?",
      choices: [
        "7 — the five plus desk mat and cycling jersey",
        "9 — the seven near-misses plus the two SKUs sitting exactly on the gate",
        "5 — a lower gate cannot add SKUs",
        "6 — only the strictly-greater SKUs qualify at 80",
      ],
      answer: 1,
      why: "The gate is >= : at 80, both 80.0 SKUs (ring light 14\", laptop stand) qualify — 5 + 2 near-misses + 2 on-the-line = 9. The two SKUs at exactly the boundary are the reason the gate's arithmetic must match the slide's wording: '> 80' would drop them, and the debate list changes shape with one character.",
      notes: [
        { choice: 0, why: "That is the gate at 82 — it forgets the pair sitting exactly at 80.0. Boundary values are the whole test here." },
        { choice: 2, why: "A lower gate can only widen the list — the five over 85 stay in regardless." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-28",
      prompt: "Two fate packets are stacked with UNION instead of UNION ALL: the sold-through report (52 batches) and the in-transit report (30). A market's row happens to be identical in both branches — and one row vanishes. Why?",
      choices: [
        "UNION ALL has a row cap UNION does not",
        "UNION deduplicates whole rows silently — a market whose sold-through and in-transit counts coincide folds to one row, and the packet under-reports without error",
        "UNION sorts the stack and drops the last row",
        "The two reports have different column counts",
      ],
      answer: 1,
      why: "UNION is UNION ALL plus a whole-row dedupe. When the two branches produce an identical row — same market, same count — one copy disappears and the packet stops footing to 103. Stack distinct populations with UNION ALL; reserve plain UNION for when dedupe IS the requirement, and say so in the query comment.",
      notes: [
        { choice: 2, why: "Sorting is not deletion — the lost row is the dedupe, not an ORDER BY side effect." },
        { choice: 3, why: "Same SELECT list, same columns — the stacks align. The vanishing is semantic, not structural." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-29",
      prompt: "The never-settled chaser list runs `FROM statements s JOIN legs l ON l.statement_id = s.id WHERE l.id IS NULL`. What does the marketplace desk receive?",
      choices: [
        "The 6 never-settled statements worth 15,217.00 — the list as briefed",
        "An empty list — the INNER JOIN deletes every legless statement before the WHERE can keep it, including the paid-status liar #28 that heads the queue",
        "All 28 statements — the WHERE is redundant",
        "The 22 settled statements — the complement of the queue",
      ],
      answer: 1,
      why: "IS NULL as an anti-join predicate only works after a LEFT JOIN, which preserves the legless statements as NULL-payload rows. An INNER JOIN discards them first — the list arrives empty, the chaser run 'succeeds', and 15,217.00 of marketplace money goes unchased. The join type IS the business statement.",
      notes: [
        { choice: 3, why: "The settled complement is what IS NOT NULL would return after a LEFT JOIN — a different report wearing the chaser list's name." },
        { choice: 2, why: "INNER JOIN keeps only matched pairs — the 22 with legs. The WHERE then removes everything, because no kept row has a NULL leg id." },
      ],
      difficulty: "hard",
    },
    {
      id: "zara-mcq-30",
      prompt: "The complete-the-look census self-joins order_items to find which garment families share batches. Why the strict `a.product_id < b.product_id` in the join?",
      choices: [
        "It speeds the join by halving the comparisons",
        "It keeps each unordered pair exactly once — without it, (Accessories, Audio) and (Audio, Accessories) both survive and the census doubles",
        "It excludes same-family pairs from the census",
        "It is arbitrary — > produces identical counts",
      ],
      answer: 1,
      why: "Without an inequality every pair matches in both orientations and counts twice; the strict < names one canonical direction per unordered pair. On this db it is the difference between 27 raw family pairings and a mirrored, doubled census — and > produces the mirror image, same totals, reversed labels.",
      notes: [
        { choice: 2, why: "Same-family diagonals still qualify — 6 of the 27 pairings are diagonals. The inequality orders product ids; it is not a family filter." },
        { choice: 3, why: "> flips the orientation — Accessories×Audio on top instead of Audio×Accessories. Foots the same, reads differently, confuses everyone." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-zara-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The drop fate census",
      brief:
        "Zara drop-board memo on the storefront db: Monday's trading call opens with the fate census — where every drop batch stands, in one scan, with the sell-through share on the slide. Probed facts: 103 drop batches worth 34,833.28; the fate map reads 52 sold through (50.5%), 30 in-transit on the leg, 14 in-season with the window open, 7 markdown-cleared — reconciling to 103 by construction. The board reads the four branches beside each other and the sold share to one decimal.",
      ask: "Return one row: total drop batches, the four fate counts, and the sold share in percent to 1 decimal.",
      template:
        "SELECT COUNT(*) AS drop_batches,\n       COUNT(*) FILTER (WHERE status = 'delivered') AS sold,\n       COUNT(*) FILTER (WHERE status = 'shipped') AS in_transit,\n       COUNT(*) FILTER (WHERE status = 'pending') AS in_season,\n       COUNT(*) {1} status = {2}) AS markdown_cleared,\n       ROUND({3} * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), {4}) AS sold_share\nFROM orders;",
      slots: [
        {
          answer: "FILTER (WHERE",
          kind: "keyword",
          label: "the one-pass branch",
          why: "FILTER (WHERE …) counts a branch inside the same scan — the census reads four fates beside each other with one table touch. Bare WHERE is a clause keyword, not a branch, and CASE WHEN cannot parse in that position; four sequential queries are four ways to drift.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the markdown-cleared arm",
          why: "The fourth fate is status = 'cancelled' — 7 batches cleared via markdown. 'shipped' would report the 30 in-transit batches and 'pending' the 14 in-season ones: both real counts wearing the wrong name, and the census would reconcile to nothing.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percentage promoter",
          why: "100.0 * COUNT(...) / COUNT(*) forces real division before the fold — the sold share prints 50.5. A bare 100 keeps integer arithmetic: 52/103 truncates to 50 and the markdown-cleared share to 6, and every fate on the slide loses its decimal.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "The board reads shares to one decimal — 50.5, matching the probed fate map. Precision 0 prints 50 and 2 prints 50.49; either way the slide stops matching every other deck in the building.",
        },
      ],
      distractors: ["WHERE", "CASE WHEN", "'shipped'", "'pending'", "100"],
      walkthrough:
        "One table, one scan, six columns. COUNT(*) reads the book (103), the four FILTER branches read the fates beside each other — 52 sold, 30 in-transit, 14 in-season, 7 markdown-cleared — and the branches reconcile to the total by construction: 52 + 30 + 14 + 7 = 103. The share column promotes with 100.0 before dividing: 100.0 * 52 / 103 = 50.5, the probed sell-through rate. The distractors each break differently: WHERE in the branch slot is a syntax error (it is a clause keyword, not a branch); CASE WHEN there cannot parse either; 'shipped' in the arm slot reports the 30 in-transit batches as markdown-cleared; 'pending' reports the 14 in-season ones; a bare 100 truncates every share — 50.4854 becomes 50 and the slide stops matching the fate map. The census rule holds: four branches, one scan, and the identity 52 + 30 + 14 + 7 = 103 is the correctness argument the trading call opens with.",
    },
    {
      id: "cs-zara-2",
      tier: "medium",
      topic: "j7",
      universe: "inventory",
      title: "The markdown-window list",
      brief:
        "Zara trading-floor memo on the storefront db: the weekly markdown debate needs the window list — which SKUs missed the sell-through window and open the markdown gate at 85% of stock unsold. Probed facts: 16 SKUs, every one sold at least once (the never-ordered anti-join is empty, so the join keeps all 16); stock versus sold runs from the Noise-Canceling Headset (60 in, 46 out — 23.3% unsold, the floor's fastest) to the HDMI 2.1 Cable 2m (500 in, 38 out). The probe reads five SKUs over the gate, worst at 92.4% unsold.",
      ask: "Return every SKU with its stock, units sold, unsold share to 1 decimal and verdict, worst share first.",
      template:
        "SELECT p.name AS sku,\n       p.category,\n       p.stock,\n       {1}(oi.quantity) AS units_sold,\n       ROUND(100.0 * (p.stock - SUM(oi.quantity)) / p.stock, {2}) AS unsold_pct,\n       CASE WHEN 100.0 * (p.stock - SUM(oi.quantity)) / p.stock >= {3} THEN 'markdown window' ELSE 'selling through' END AS verdict\nFROM products p\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY p.id, p.name, p.category, p.stock\nORDER BY unsold_pct {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the sold fold",
          why: "SUM(oi.quantity) totals units across the batch's SKU-size lines — 38 on the HDMI cable. COUNT reads lines (19) and AVG reads line depth (2.0): different numbers wearing one column name, and the unsold share inherits whichever lie lands here.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the share precision",
          why: "Shares print to one decimal — 92.4 on the HDMI cable, 87.7 on the yoga mat, matching the probe's ladder. Precision 0 flattens 91.75 to 92 and 2 prints 91.75; the slide's ladder and the gate's arithmetic must agree on which SKUs they call.",
        },
        {
          answer: "85",
          kind: "number",
          noVerify: true,
          label: "the markdown gate",
          why: "85% unsold is the trading floor's window rule — the probe reads exactly five SKUs over it: 92.4, 91.8, 90, 88, 87.7, with desk mat 81.9 and cycling jersey 80.9 as the watch-list near-misses. Move the gate to 80 and the two 80.0 SKUs sweep in; the list changes shape.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "The markdown debate opens on the worst share: HDMI 92.4 down to the headset 23.3. ASC would open the meeting on the fastest seller — a correct query aimed at the wrong end of the ladder.",
        },
      ],
      distractors: ["COUNT", "AVG", "MAX", "ASC", "100"],
      walkthrough:
        "One join, one fold, one gate. The join keeps all 16 SKUs (the never-ordered anti-join is empty on this db), GROUP BY folds each SKU's lines, and the share is 100.0 * (stock - sold) / stock at one decimal: HDMI 2.1 Cable 2m 92.4, Running Socks 3-pack 91.8, Bluetooth Speaker Mini 90, Wireless Mouse M3 88, Yoga Mat Eco 6mm 87.7 — five SKUs over the 85 gate, verdict 'markdown window'; desk mat 81.9 and cycling jersey 80.9 miss, and the two 80.0s (ring light, laptop stand) sit exactly on the watch line. Ordered worst-first, the floor reads its five decisions on top. The distractors each break differently: COUNT folds lines into 'units' (19 on the HDMI cable), AVG folds line depth (2.0), MAX folds the biggest single line — each drags the share somewhere false; a bare 100 keeps integer arithmetic and 91.75 truncates to 91; ASC opens the debate on the Noise-Canceling Headset (23.3), the one SKU that needs no markdown. The grain rule holds: stock is per-SKU, sold is per-line, and the share only exists after the fold.",
    },
    {
      id: "cs-zara-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The market speed ladder",
      brief:
        "Zara trading-floor memo on the storefront db: the buy team ranks markets by drop batches to decide where attention goes on Monday — and ties are a policy call, not a rounding note. Probed facts: 16 markets; the ladder runs 24 (Alice Chen), 17 (Emma Wilson), 14 (Grace Kim), 13 (Maya Patel), 5 (Chloe Dubois), then FOUR markets tied at 4 (Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez), then two at 3 (Hiro Tanaka, Farid Nasser). The attention floor is fixed at 4 batches: nine markets qualify, RANK prints 1, 2, 3, 4, 5, 6, 6, 6, 6 — the tie block shares rung 6, and the next rung would be 10, not 7.",
      ask: "Return market, drop batches, and a rank that honors ties for every market with at least 4 batches, busiest first, ties broken alphabetically for display.",
      template:
        "SELECT c.name AS market,\n       COUNT(*) AS drop_batches,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS speed_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY speed_rank, market;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie-sharing ranker",
          why: "RANK gives tied markets the same rung and skips after — the four-way tie reads 6, 6, 6, 6. ROW_NUMBER splits the four markets arbitrarily (a silent judgment call about whose market gets attention first), and MAX() OVER would stamp every row with the book's biggest count. DENSE_RANK happens to agree on THIS board only because the tie block is the last qualifying group — drop the floor to 3 and DENSE_RANK reads 7, 7 where RANK reads 10, 10.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The buy team reads the ladder top-down: 24, 17, 14. ASC would open the meeting on the two 4-batch tie markets — a correct query aimed at the wrong end of the board.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the attention floor",
          why: "The floor is the policy: at 4 exactly nine markets qualify and the four-way tie rides the boundary — the tie is IN the output, not cut by it. 5 silently drops the entire tie block (a board of 5), and 3 floods it to 11 rows.",
        },
      ],
      distractors: ["ROW_NUMBER", "MAX", "ASC", "5"],
      walkthrough:
        "A leaderboard with a policy floor and a structural four-way tie. The join attaches each of the 103 batches to its market, GROUP BY c.id folds them into 16 batch counts, and HAVING COUNT(*) >= 4 applies the attention floor — nine markets survive, with the tie block of four riding the boundary at exactly 4. RANK() OVER (ORDER BY COUNT DESC) numbers them busiest-first: five unique rungs, then 6, 6, 6, 6 — the board shows peer markets as peers, which is the trading-floor convention; the two functions diverge only below the tie, which is why the floor sits exactly there. The distractors each break differently: ROW_NUMBER splits the four-way tie arbitrarily — two analysts run it twice and disagree on which market is 'first'; MAX() OVER stamps every row with the book's biggest count; ASC opens the meeting at the floor; 5 drops the entire tie block and the board shrinks to 5 rows with no error to flag it. The floor number is a definition, not a discovery: it ships with the query, and the tie it keeps is the board's honesty.",
    },
    {
      id: "cs-zara-4",
      tier: "medium",
      topic: "s7",
      universe: "month-close",
      title: "The drop-clock speed grid",
      brief:
        "Month-close brief, in-world: the replenishment leg of the two-week promise gets its monthly audit — stamped batches per market, folded by the day the batch moved after its cut. Probed on the storefront db: 82 of 103 batches carry the stamp (27 on day 2, 30 on day 3, 25 on day 4), and the per-market grid reads EU 36 stamps (12/14/10), APAC 29 (11/9/9), US 15 (4/6/5), LATAM 2 (0/1/1). The 14 in-season batches have no stamp — excluded by definition, not by cleanup — and the day columns must foot to the stamped total per market.",
      ask: "Return per market: stamped batches and the day-2/day-3/day-4 counts, busiest market first.",
      template:
        "SELECT c.region AS market,\n       {1}(o.shipped_at) AS stamped,\n       SUM(CASE WHEN CAST({2}(o.shipped_at) - julianday(o.created_at) AS INT) = {3} THEN 1 ELSE 0 END) AS day_2,\n       SUM(CASE WHEN CAST(julianday(o.shipped_at) - julianday(o.created_at) AS INT) = 3 THEN 1 ELSE 0 END) AS day_3,\n       SUM(CASE WHEN CAST(julianday(o.shipped_at) - julianday(o.created_at) AS INT) = 4 THEN 1 ELSE 0 END) AS day_4\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY stamped {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the stamped counter",
          why: "COUNT(o.shipped_at) counts non-NULL stamps — 36, 29, 15, 2, the per-market population the grid audits. COUNT(*) would count booked batches (45/37/19/2) and fold the 14 in-season rows into a clock they do not have; SUM over text stamps coerces to 0.",
        },
        {
          answer: "JULIANDAY",
          kind: "keyword",
          label: "the clock converter",
          why: "julianday turns the ISO text stamps into fractional days so the difference is a day count. DATE() - DATE() is string-minus-string — SQLite coerces both to 0 and every batch lands in a phantom day-0 bucket with a plausible-looking print.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the day-2 boundary",
          why: "The day fold is the report's spine: 27 batches on day 2 across the book. Move the boundary to 3 and the day_2 column silently reports the day-3 batches (14/9/6/1) — every market's grid still foots to its stamped total, so the error hides unless you know the 27/30/25 fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The audit opens where the volume is: EU 36 stamps, APAC 29. ASC would open on LATAM's 2 stamps — a market whose grid is one 0 and two 1s, the wrong end for a queue decision.",
        },
      ],
      distractors: ["SUM", "DATE", "ASC", "3"],
      walkthrough:
        "A CASE pivot with a population rule. The join attaches each batch to its market, COUNT(o.shipped_at) counts the stamps — 36, 29, 15, 2 — and the three CASE arms fold each market's stamped batches into whole-day buckets: julianday deltas truncate to 2, 3 or 4, and the grid reads EU 12/14/10, APAC 11/9/9, US 4/6/5, LATAM 0/1/1. Every row foots: 12+14+10 = 36 stamped, and the book-level columns sum to 27/30/25 = 82 — the reconciliation identity the audit is built on. The 14 in-season batches never enter: COUNT(o.shipped_at) skips their NULL stamps by definition, which is the population rule stated in the title. The distractors each break differently: COUNT(*) inflates every market to its booked total; DATE() collapses the clock to zeros; 3 re-points the day_2 column at the day-3 fold while every foot still balances; ASC opens the audit on LATAM's two stamps. The grid rule holds: one scan, one population, and the day fold must reconcile to the stamps or the close does not ship.",
    },
    {
      id: "cs-zara-5",
      tier: "medium",
      topic: "j5",
      universe: "inventory",
      title: "The full-ticket all-stars",
      brief:
        "Zara trading-floor memo on the storefront db: markdown discipline is measured by the SKUs that never needed it — the all-stars are garments whose every unit sold at full ticket, never touching a cancelled batch. Probed on the storefront db: the anti-join over 16 SKUs returns 7 — Smart Watch S (23 units, 4,582.02), 4K Webcam Pro (31, 3,989.97), Fitness Band X2 (30, 2,347.10), Bluetooth Speaker Mini (21, 1,266.15), Wireless Mouse M3 (36, 1,239.85), Ring Light 14\" (30, 1,208.44), Running Socks 3-pack (33, 600.78) — 204 units and 15,234.31 of full-ticket revenue. Every SKU on this range sold at least once, so the fold keeps all 16 candidates before the gate.",
      ask: "Return every SKU that never appeared in a cancelled batch: name, category, units sold, full-ticket revenue, and its cancelled-batch count, biggest revenue first.",
      template:
        "SELECT p.name AS sku,\n       p.category,\n       {1}(oi.quantity) AS units_sold,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS full_ticket_revenue,\n       COUNT(o.id) AS cancel_hits\nFROM products p\nLEFT JOIN order_items oi ON oi.product_id = p.id\nLEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'cancelled'\nGROUP BY p.id, p.name, p.category\n{2} COUNT(o.id) = {3}\nORDER BY full_ticket_revenue {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the unit fold",
          why: "SUM(oi.quantity) totals units across the SKU's size-run lines — 23 on the Watch, 36 on the Mouse. COUNT would count lines instead: the same join, a different grain, and the revenue arithmetic (line price × units) would no longer match the units column.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the post-fold gate",
          why: "COUNT(o.id) exists only after GROUP BY folds each SKU's lines — the gate must live in HAVING. WHERE COUNT errors outright (no aggregates before groups form), which is the pipeline-order lesson wearing a gate's name.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the never-marked-down gate",
          why: "COUNT(o.id) = 0 is the anti-join verdict: no line of this SKU ever rode a cancelled batch. 1 would drop all seven all-stars — every one of them has zero cancel hits — and the list would arrive empty while parsing clean.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-revenue direction",
          why: "The floor reads the all-stars top-down: Watch 4,582.02, Webcam 3,989.97, Fitness Band 2,347.10. ASC would open on Running Socks 600.78 — the smallest full-ticket story on the list.",
        },
      ],
      distractors: ["COUNT", "WHERE", "1", "ASC"],
      walkthrough:
        "An anti-join measured in money kept. The LEFT JOIN chain fans each SKU into its lines, then tries each line's batch against the cancelled set — the second LEFT JOIN matches only cancelled batches, so COUNT(o.id) counts markdown hits per SKU and SUM(oi.quantity) still folds every line's units. HAVING COUNT(o.id) = 0 keeps the seven SKUs the markdown door never touched: 204 units, 15,234.31 of full-ticket revenue, ordered Watch-first. The distractors each break differently: COUNT as the unit fold prints line counts wearing units' names; WHERE before GROUP BY errors because the gate judges a fold; 1 as the gate empties the list — all seven all-stars have zero hits, which is the point; ASC opens on the smallest story. The readout's honesty sits in the two folds living in one pass: units_sold proves the SKUs sold, cancel_hits proves they never cleared — and 15,234.31 of the 34,833.28 book says markdown discipline has a number.",
    },
    {
      id: "cs-zara-6",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The drop-count spine",
      brief:
        "Zara cadence-call memo on the storefront db: twice-weekly drops promised at monthly grain means a steady 6-to-9 batches a month — the cadence call walks the 14-month spine (2024-01 to 2025-02) and reads the month-over-month walk. Probed facts: the drop counts read 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7 — 103 batches total. Peaks of 9 sit in Feb 2024 and Sep 2024, troughs of 6 in Jun 2024, Nov 2024 and Jan 2025; LAG hands each month its predecessor's count and the deltas read +1, -1, -1, +1, -2, +2, -1, +2, -2, -1, +1, -1, +1 — never worse than -2, never better than +2. The first delta is NULL — the baseline, never a zero.",
      ask: "Return month, drop count, and the month-over-month delta, oldest first.",
      template:
        "SELECT STRFTIME('%Y-%m', o.created_at) AS month,\n       {1}(*) AS drop_batches,\n       {2}(COUNT(*)) OVER (ORDER BY STRFTIME('%Y-%m', o.created_at)) AS delta\nFROM orders o\nGROUP BY month\nORDER BY month {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the drop counter",
          why: "COUNT(*) counts the batches folded into each month — 8, 9, 8 … the cadence promise's unit. SUM(*) cannot parse, and any other fold answers a different question wearing the drop_batches name.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month handoff",
          why: "LAG(COUNT(*)) OVER (ORDER BY month) hands each month its predecessor's count, so the delta column reads the month-over-month walk: +1, -1, -1 … never beyond ±2. LEAD looks forward — the deltas negate and the January trough reads as a rebound; the spine's shape inverts silently.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the oldest-first direction",
          why: "The cadence walk runs oldest-first: 2024-01 opens the spine with its NULL baseline. DESC reverses the walk — the close reads first and every delta's meaning flips on the slide.",
        },
      ],
      distractors: ["SUM", "LEAD", "DESC"],
      walkthrough:
        "A spine walk in drops, the cadence promise's home grain. STRFTIME('%Y-%m', created_at) builds the 14-month spine, COUNT(*) folds each month to its batch count — 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7, footing to 103 — and LAG(COUNT(*)) OVER (ORDER BY month) hands each month its predecessor's value: the deltas read +1, -1, -1, +1, -2, +2, -1, +2, -2, -1, +1, -1, +1. The walk IS the audit: a twice-weekly promise at monthly grain holds if the deltas never blow past a couple of batches, and they never do — peaks 9, troughs 6, worst swing -2. The first row's delta is NULL: no prior month exists, and that NULL is the baseline — COALESCE-ing it to 0 invents a flat opening no stakeholder should see. The distractors each break differently: '%m' merges the two Januaries and the spine loses a year; LEAD flips every delta's sign and the trough reads as a rebound; SUM cannot fold COUNT(*) into a count; DESC reverses the spine so the walk runs backwards. State the population, keep the NULL baseline, and the cadence call survives its first 'how do you know'.",
    },
  ],

  problems: [
    { slug: "sales-analysis-iii", why: "Drops inside a dated window are the trading week's first filter — the half-open predicate over created_at is how a drop window is cut. This problem drills the date-filter shape the cadence reports reuse." },
    { slug: "percentage-of-users-attended-a-contest", why: "Sell-through share is a conditional ratio with a stated denominator — 52 of 103 batches, 50.5%. This problem drills exactly that division discipline." },
    { slug: "immediate-food-delivery-i", why: "Share of batches that moved on the stamp versus still waiting is a conditional rate over a status comparison — the on-window read is this problem's shape at db scale." },
    { slug: "number-of-employees-who-met-the-target", why: "Which markets cleared the speed bar is a conditional count against a threshold — the weekly pulse the trading call opens with." },
    { slug: "capital-gain-loss", why: "Full-ticket take versus markdown-cleared take nets into the movement number the floor debates. This problem drills ordered buy/clear folds — the same add-and-clear algebra the fate book uses." },
    { slug: "game-play-analysis-i", why: "First drop per market anchors every cadence cohort — MIN over the drop clock is the shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-batch market is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "combine-two-tables", why: "Markets LEFT JOINed to batches is the whitespace read; batches LEFT JOINed to settlement legs is the AR read. Choosing the join type is the business statement." },
    { slug: "confirmation-rate", why: "Settlement outcomes arrive with gaps — COALESCE turns missing leg data into an explicit coverage rate instead of a silent NULL. The drill the coverage census needs." },
    { slug: "find-churn-risk-customers", why: "Stale floors are an anti-join over dormancy — SKUs with no recent movement against a dated cutoff. The same shape drives the markdown calendar." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Accelerating drop cadence per market — strictly rising batch counts — is the demand signal the buy team watches. This problem drills the ordered-comparison islands shape." },
    { slug: "same-day-sale", why: "A batch stamped the day it was cut is the speed dream; detecting same-day pairs is this problem's exact first-occurrence shape." },
    { slug: "product-price-at-a-given-date", why: "Ticket at drop date versus ticket today is a window-over-dated-rows read — the price-ladder audit is this problem's shape." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest drop per SKU is the freshness read the floor boards run every morning — argmax with a window, exactly this problem." },
    { slug: "group-sold-products-by-the-date", why: "Drop-day folds into a single cell — GROUP_CONCAT over the day's SKUs — is how the morning board prints a day's window." },
    { slug: "top-travellers", why: "Markets ranked by sell-through value with ties handled honestly — the leaderboard fold the trading call ends with." },
    { slug: "year-on-year-growth-rate", why: "Drop-book 2024 against 2025's two months with the partial-year caveat stated — the YoY ratio on the 14-month spine, the cadence call's escalation read." },
    { slug: "rolling-7d-actives", why: "Markets active in a rolling 7-day window — drop cadence at window grain, the density read the replenishment queue watches between drops." },
    { slug: "premier-league-table-ranking", why: "A sell-through table with rank, ties and gaps — the four-way tie at 4 batches makes RANK-versus-DENSE_RANK a published policy, exactly this problem's board." },
    { slug: "seasonal-sales-analysis", why: "Season cuts on the 14-month spine — which drop months carry the book, the calendar drill behind the trough-and-rebound story." },
    { slug: "friday-purchases-i", why: "Purchases on a named weekday — twice-weekly drops make the day-of-week census a cadence check, not trivia; the promise's home probe." },
    { slug: "sales-by-day-of-the-week", why: "Units by weekday in one pass — the drop-calendar pivot the trading call prints to check the twice-weekly promise holds at unit grain." },
    { slug: "median-time-to-convert", why: "Median cut-to-move beside the 2.98-day mean — the clock's robustness read; a skewing tail shows up here before it shows in the average." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Back-to-back drop days per market — the bursty-cadence read that flags a market buying in bursts instead of across the window." },
    { slug: "portfolio-concentration-hhi", why: "Concentration of sell-through value across marketplaces — Nordic 32.0%, Midwest 26.7% folded into one HHI number; the supplier-risk read in a single figure." },
    { slug: "ar-aging-schedule", why: "Statements bucketed by days outstanding against 30-day terms — the 13-to-84-day settlement spread as the aging ladder the marketplace desk ships." },
    { slug: "calculate-product-final-price", why: "Final ticket after markdown arithmetic — the cents-safe read that turns the 85%-unsold gate list into priced decisions." },
    { slug: "the-number-of-users-that-are-eligible-for-discount", why: "Eligibility gates as conditional counts — who clears the markdown bar is this problem's filter discipline at SKU grain." },
    { slug: "find-bursty-behavior", why: "Bursty purchase patterns per market — cadence variance against the twice-weekly promise, the funnel read with a variance twist." },
    { slug: "usage-tier-percentiles", why: "Ticket percentiles across 103 batches — where the 338.19 mean sits in the distribution, the NTILE/PERCENT_RANK drill behind tier pricing." },
    { slug: "spend-histogram", why: "Batches banded by ticket size — the histogram with the empty premium arm printed honestly, the band census in distribution clothing." },
    { slug: "customers-who-bought-all-products", why: "Relational division — markets that bought from every family; the complete-the-look cluster read the range board pairs with the pairing census." },
  ],
};
