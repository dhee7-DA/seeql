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
    "Preparation strategy: the pools file carries no Zara section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's screen shapes: one-pass fate censuses, drop clocks with stated populations, two-grain market reads, CASE ticket ladders, markdown gates, month-spine cadence walks and cents-safe settlement folds. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:one-pass fate census} the drop board opens with, the other rebuilds the {orange:markdown-window list} the trading floor debates each week. The bar to clear: *state the stamp filter and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
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
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Drop-to-floor clocks",
      why: "Every Zara screen opens with the clock: batch cut at created_at, moved by shipped_at, delta averaged over stamped rows only. The population is the whole grade — 82 stamped of 103 booked (79.6%), 2.98-day average with a 2–4 spread — and the 14 in-season batches are excluded by definition, not by cleanup. julianday arithmetic with a stated denominator is the shape being tested.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Two-grain market censuses",
      why: "Batches and markets are different grains of the same join: EU runs 45 batches from 8 markets (5.6 per market) while the US runs 19 from 2 (9.5). COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio decides whether a market is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Ticket ladders with CASE",
      why: "Zara's price architecture is a ladder, not a continuum: the ticket fold splits 16 SKUs into 8 budget at 32.06 and 8 mid at 111.50, and the >= 200 premium arm is honestly empty — the ladder tops out at 199.99. Arms must be exhaustive and ordered: a hole in the CASE is a hole in the ladder, and a reordered WHEN quietly re-bands the base.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "Markdown gates & HAVING floors",
      why: "The markdown list is a group-level gate: fold stock cover per SKU, then judge the fold — WHERE cannot see aggregates and HAVING cannot see pre-fold rows. The same shape drives every threshold question here: which markets carry at least N batches, which SKUs clear the sell-through bar. The panel wants the clause chosen by asking: is this a fact about one row, or about one fold?",
      slugs: ["classes-more-than-5-students", "customer-order-frequency", "find-customers-with-positive-revenue-this-year"],
    },
    {
      name: "Stock-cover folds",
      why: "Markdown risk is stock minus sold at SKU grain: the join to order_items fans every batch into SKU-size lines, so SUM(quantity) is the only honest fold — COUNT reads lines (19 on the HDMI cable, not 38 units) and AVG reads line depth (2.0). Every SKU on this db has sold at least once, so the inner join keeps all 16 rows — a fact worth proving, not assuming.",
      slugs: ["find-stores-with-inventory-imbalance", "product-sales-analysis-ii", "sales-analysis-i"],
    },
    {
      name: "Drop cadence calendars",
      why: "The 14-month drop spine (2024-01 to 2025-02) is the cadence call's home turf: 6 to 9 batches a month, trough months named, markdown-clearing windows defended in the same breath — July and November each carry 2 of the 7 cleared batches. STRFTIME builds the spine and LAG walks it; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Sell-through leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the batch ladder runs 24, 17, 14, 13, 5 and then FOUR markets sit tied at 4. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer markets, not syntax. The panel asks you to pick one and defend it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Settlement set algebra",
      why: "Board packets stack populations — in-transit under markdown-cleared, this month beside last — and EXCEPT answers 'which sold batches never stamped a settlement'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The settlement anti-join (6 never-settled statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["team-scores-in-football-tournament", "monthly-transactions-ii", "movie-rating"],
    },
    {
      name: "Cents-safe settlement reads",
      why: "Sold is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the floor meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: card legs (16, 37,364.00) self-serve the marketplace, wire legs (11, 32,248.00) settle the wholesale book.",
      slugs: ["bank-account-summary-ii", "products-worth-over-invoices", "number-of-rich-customers"],
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
  ],
};
