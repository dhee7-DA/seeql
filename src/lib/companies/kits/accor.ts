// Accor — Wave-9 (Task 98-accor), travel domain, 0 tagged LC — theme-curated;
// facts from scripts/company-facts.md. Brand-portfolio angle: Europe's largest
// hotel group, Paris HQ, 45+ brands from Ibis (economy) through Novotel/Mercure
// (midscale) to Sofitel/Pullman/Raffles (luxury) — and almost none of it owned:
// the asset-light franchise/management model whose fee streams bill property
// owners, with ALL-Accor loyalty as the demand spine. Accor has NO registry tags
// in this app's pools — 0 tagged LC — theme-curated: every topic and problem
// slug comes from scripts/company-pools.md's theme menu, mirroring the workflows
// Accor screens are known to probe (folio-line folds, tier CASE rolls, market
// censuses, settlement coverage, one-pass status censuses). Case studies run on
// the storefront db with probed figures from scripts/company-facts.md — mapped
// honestly as orders=stays/booked reservations, order_items=folio lines
// (quantity = units, unit_price = unit rate), products=brand-tier room products,
// customers=ALL-Accor members (region = market), suppliers=property owners and
// franchise partners (the asset-light counterparties), invoices=owner/franchisee
// fee-billing statements, payments=payment rails, expenses=network opex,
// ledger_entries=GL; shipped_at=check-in stamp; money tables INTEGER cents.

import type { CompanyKit } from "../types";

export const accorKit: CompanyKit = {
  id: "accor",
  domainId: "travel",
  name: "Accor",
  tagline: "The brand-portfolio ladder, Ibis to Sofitel",
  accent: "text-cyan-300",

  brief: [
    "**Accor** is Europe's largest hotel group — a Paris-headquartered portfolio of 45-plus brands that runs the ladder from Ibis at the economy base through Novotel and Mercure at midscale to Sofitel, Pullman and Raffles at the top. The strategic fact that shapes every analyst's day: Accor owns almost none of it. The model is asset-light — franchise and management contracts — so the revenue story is fees billed to property owners, and every folio line a guest generates feeds a base fee, an incentive fee and a marketing-fund contribution. This kit maps the storefront db onto that world: the 16 customers rows are ALL-Accor members, the 103 orders are stays worth **34,833.28**, and the 251 order_items rows are folio lines — quantity = units, unit_price = unit rate. The status map is fixed: delivered = {emerald:completed} (52, 50.5%), shipped = {sky:in-house} with shipped_at as the check-in stamp (30, 29.1%), pending = awaiting arrival (14), cancelled = {rose:cancelled} (7, 6.8%).",
    "The data org reads the portfolio the way the P&L is structured. The brand teams read demand at tier grain — **338.19** per stay network-wide, 383.48 in the richest market on only 19 stays, 335.32 in the busiest on 45. The loyalty desk owns the {sky:ALL-Accor} read: fold per-member lifetime value first, tier second — the four 3,000-plus members (7,262.35, 6,640.56, 4,574.23, 3,644.56) hold **63.5%** of stay value, and the 2,000-plus crowd reaches only 71.2%, so one mid-band member owns the gap. The fee desk moves owner money across 28 invoices and 27 payments in {rose:INTEGER cents} — every dollar read is `amount_cents / 100.0` — and the settlement split is memorized: 21 exact, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217, with the two named anomalies (a void bill carrying a 925 settlement, a paid-status bill with zero settlement rows) walked line by line, never averaged away.",
    "Interview screens are census-then-denominator, hotel-flavored. A loop opens with a **two-grain market census** — EU runs 45 stays from 8 members (intensity 5.6) while the US runs 19 from 2 (9.5) — then hits the folio fan-out, where `COUNT(*)` after the join counts 251 folio lines and calls them stays; then escalates into a tier ladder and the rank-semantics argument (the member ladder runs 24, 17, 14, 13, 5 with a four-way tie at 4). The traps are stated out loud here: every member and every room product has transacted, so anti-join drills return a **confident zero**, and the rate ceiling sits at **199.99**, so any premium-band filter comes back empty *by construction* — proving the zero is the job, not a bug.",
    "Preparation strategy: the pools file carries no Accor section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: stay-status funnels, two-grain censuses, folio-line folds, tier CASE rolls, fee-book coverage and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:network opex roll-up} the fee desk foots at every close, the other rebuilds the {violet:brand-tier ladder board} portfolio reviews open with. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every tier fold reconcile to the market books it claims to summarize.",
    "**The deeper operational read**: the arrival corridor and the settlement clock are the two loops the desk re-runs daily. Latency is regional — stamped stays average **2.94 days** in the EU (36 stays) and 2.93 in APAC (29), but the US book of 15 runs 3.07 and LATAM's 2 print 3.5 — small-N, headline-eligible, which is why the corridor board prints counts beside averages. Owner money runs the mirror: terms are a uniform 30 days on all 28 bills (issue-to-due reads 30/30/30, so aging math is a `date(issued_on, '+30 days')` walk), the paid book settles in **28.4 days** on average (13 fastest, 84 slowest), and 5 bills — 1, 5, 12, 19, 22 — settle on two payment legs, so folds run per statement, never per leg. The dunning queue under the 6-bill headline splits as 873.00, 1,295.00, 4,937.00, 3,562.00 and 2,794.00 — *no dunning letter quotes an average where a bill should be*.",
    "Prep extension for the deeper screens: the census-then-denominator loop is table stakes here — the follow-up rounds drill **window frames**, set-operation drift and three-valued logic until they are reflexes, because the panels escalate past the standard boards fast. Run every read twice against the live storefront db: once with the fold you would ship, once as a `COUNT(*)` audit that proves the grain you claim (103 stays, 251 folio lines, 16 members — never a number you cannot re-derive). Then take the four new case families in order — the one-pass {amber:FILTER census}, the {violet:LAG pace walk}, the staged concentration board, the never-remitted anti-join — and hold every fold to the close bar: *a board ships only when its pieces reconcile to the canonical figures, 63.5 and 71.2 included, by construction*.",
  ],

  dayInLife: [
    "**08:15 —** The day opens with the portfolio census. A brand-performance analyst refreshes the stay board before the operations standup: 52 completed, 30 in-house, 14 awaiting arrival, 7 cancelled — **103 by construction**, or the board ships with an incident attached. The check-in watch runs next: **82 stamped stays** averaging **2.98 days** booking-to-check-in, and any drift off the 2-to-4 band pulls the arrival queue before the midscale read goes out. The monthly pace curve sits beside it — the 3,731.97 January open against the 1,193.86 July trough — because *the pace story is the staffing story*, and a trough that surprises a Novotel GM is a forecast failure, not a market surprise.",
    "**11:30 —** Midday is ladder work. The loyalty desk wants the ALL-Accor board re-cut — the four 3,000-plus members and their **63.5%** share versus the 71.2% that 2,000-plus reaches, with the mid-band member who owns the difference named; the midscale network team wants intensity beside coverage (EU 45 stays from 8 members against the US's 19 from 2) for the franchise-development call; brand marketing wants the attach read — **54 of 103 stays** carry an Accessories-family folio line, and attach breadth is the upsell argument. Each ask is a fold-then-bucket: *tier the member, never the stay* — tiering raw stay rows silently re-weights the ladder toward the heaviest bookers. The analyst writes every query twice — *once to answer, once with the definition spelled out so the number survives the owner call*.",
    "**15:30 —** The afternoon belongs to owner money. The AR anti-join refreshes first — **6 never-settled fee bills worth 15,217** — before a single dunning letter goes out; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 — a partial that no SUM may call settled) and feeds the cash-flow draft. Then the anomaly walk, line by line: bill #11 sits {rose:void} yet carries a 925 settlement, and bill #28 claims paid with zero settlement rows — the two mirrors that prove payment rows, not status labels, are the ledger of record. The close ends on the tie-out: the GL must read **181,080 against 181,080**, delta zero, with the network opex roll-up footed at 25,416 — {emerald:the close ships} or tomorrow starts with an owner conference call.",
    "**17:40 —** EOD is the handoff hour. The pace board goes to revenue management with the walk attached — the **3,731.97** January open and the **1,193.86** July trough circled, November's 1,648.8 flagged as the slide tomorrow's deck will argue about — and the corridor read gets its last look: EU 2.94, APAC 2.93, US 3.07, LATAM 3.5, with the small-N caveat written into the file, not the footnote. The rails close the loop: 16 card legs worth 37,364 against 11 wire legs at 32,248, with the two-leg bills split out so tomorrow's fold starts clean. *The last query of the day is the audit copy of the first one* — same board, different author — and when the two agree, the numbers ship.",
  ],

  metrics: [
    { name: "On-property share", what: "Stays with a check-in stamp (completed or in-house) over all booked reservations — 82 of 103, 79.6%. The state-free read that keeps awaiting-arrival and cancelled rows in the denominator where they belong." },
    { name: "Booking-to-check-in lead", what: "julianday(check-in) minus julianday(booking) on the 82 stamped stays — 2.98 days average, range 2 to 4. The window an upgrade offer or a pre-arrival upsell actually has." },
    { name: "Stay completion rate", what: "Completed stays over all booked: 52 of 103 (50.5%). 'Completed' is a status-filtered conditional count, and whether in-house stays belong in the numerator is the definitional argument the interviewer grades." },
    { name: "Cancellation share", what: "Cancelled reservations over booked — 7 of 103 (6.8%) network, sliced by market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The map that drives the overbooking policy and the re-marketing calendar." },
    { name: "ADR-style stay value", what: "Average stay value — 338.19 network, 383.48 in the richest market (19 stays), 335.32 in the busiest (45). Rate-mix shifts show up here before any rate-card review; small-N markets get flagged, not hidden." },
    { name: "ALL-Accor concentration", what: "Share of stay value from members above a lifetime threshold — 63.5% from the 3,000-plus tier (71.2% above 2,000). The number that sizes the loyalty desk and prices the partnership deals." },
    { name: "Owner-partner bench", what: "Owners and franchise partners above the 4.5 satisfaction line — 2 of 6 (4.6 and 4.8), already carrying 45.7% of folio value between them. Portfolio expansion starts from this bench, not the full list." },
    { name: "Fee-book settlement coverage", what: "Owner bills classified exact, partial or none against their settlement rows — 21 exact, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The AR anti-join the fee desk refreshes every close." },
    { name: "Market stay intensity", what: "Stays per distinct member per market — EU 45 stays from 8 members (5.6) against the US's 19 from 2 (9.5). Concentrated demand from few loyalty identities is fragile: one lapsed member moves half a US market, so intensity prices the expansion call." },
    { name: "Ancillary attach breadth", what: "Share of stays carrying an Accessories-family folio line — 54 of 103 stays. Attach breadth is the upsell argument brand marketing takes to the midscale network, and the folio fan-out that corrupts it lives one join away." },
    { name: "Payment-rail mix", what: "Owner remittances split card 16 legs / 37,364 against wire 11 legs / 32,248. The split matters because 5 bills settle on both rails — a per-leg fold double-counts them, and the rails reconcile to the 69,612 cash credit only per statement." },
    { name: "Settlement clock", what: "Days from fee-bill issue to first settlement on the paid book — 28.4 average, 13 fastest, 84 slowest, against uniform 30-day terms. Anything past the terms line feeds the dunning queue; the clock is the AR heartbeat." },
  ],

  topics: [
    {
      name: "Stay-status funnels",
      why: "Every Accor screen opens with the reservation lifecycle: booked, checked-in (shipped_at stamped), completed, cancelled. Each stage is a conditional count over a status or timestamp, and the first question out loud is what the denominator holds. The trap is calling an in-house stay 'completed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Stays and members are different grains of the same join, and every market census here reports both: EU runs 45 stays from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is demand and which is installed base — is the habit being graded.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers"],
    },
    {
      name: "Folio-line folds",
      why: "Every portfolio read folds folio lines to stay grain: value, units and DISTINCT stays per brand-tier product — 251 lines over 103 stays, and the fold that survives is the one that deduplicates. Line-grain counts silently multiply per-stay demand and are the classic fan-out trap in hotel reporting.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Member enrichment joins",
      why: "Members carry market and join date; stays inherit them through joins, and the join type decides who survives. A stay without a member is corruption; a member without stays is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "top-travellers"],
    },
    {
      name: "ALL-Accor tier ladder with CASE",
      why: "Member tiers are CASE-classified over folded lifetime spend — the four 3,000-plus members hold 63.5% of stay value, the 2,000-plus band only 71.2%. The graded move is folding at member grain BEFORE tiering: tier raw stay rows and you tier folio lines, not people.",
      slugs: ["calculate-special-bonus", "loan-types", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Loyalty leaderboards & rank ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the member ladder runs 24, 17, 14, 13, 5 and then four members sit tied at 4 stays. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer members, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Fee-book & cents discipline",
      why: "Completed is not settled — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the portfolio meets owner money. Every dollar read is amount_cents / 100.0, the rails split card (16 legs, 37,364) from wire (11 legs, 32,248), and uniform 30-day terms make aging math a date walk.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Settlement coverage anti-joins",
      why: "The fee desk's daily read is bills without settlements: 6 invoices worth 15,217, plus the mirrors — a void bill WITH a settlement row and a paid-status bill with none. LEFT JOIN + IS NULL (and the NOT EXISTS twin) is the shape, and the coverage split 21 / 1 / 6 is its report.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Calendar spines & booking windows",
      why: "The 14-month stay spine (2024-01 to 2025-02) is the pace board's home turf: month buckets via SUBSTR(created_at,1,7), the 3,731.97 January open, the 1,193.86 July trough with 2 of the 7 cancellations, and half-open date windows that don't drop the last night of a season.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, in-house, awaiting and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift out of reconciliation.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Window frames & running totals",
      why: "Running totals power the pace board, the cumulative-value walk and the concentration curve — and the default frame is the trap: with ORDER BY, RANGE includes peers, so rows tied on the sort key enter the running sum together. Hotel data ties constantly at check-in stamps, so the discipline is writing ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the walk must be strictly row-by-row.",
      slugs: ["game-play-analysis-iii", "budget-pacing", "last-person-to-fit-in-the-elevator"],
    },
    {
      name: "Set-operation stacks",
      why: "Close packets and census stacks live on UNION ALL — completed folio value stacked under cancelled, category folds stacked under a TOTAL footer. The graded edge is UNION's silent whole-row dedup, and the INTERSECT/EXCEPT twins that answer 'which members appear in both books / one but not the other' without an anti-join.",
      slugs: ["team-scores-in-football-tournament", "count-salary-categories", "movie-rating"],
    },
    {
      name: "Argmax & per-group tops",
      why: "Latest stay per member, peak folio night per property, top rate band per market — every per-group-top read is an argmax, and the naive GROUP BY + MAX collapses the row identity. ROW_NUMBER over a partition picks the row and needs a stated tie-breaker, because arrival seconds collide in hotel data.",
      slugs: ["highest-grade-for-each-student", "the-most-recent-orders-for-each-product", "product-sales-analysis-iv"],
    },
    {
      name: "NULL policy & three-valued logic",
      why: "NULL is a policy decision before it is a value: which fallbacks display as zero, which stay UNKNOWN, and which comparisons silently poison a filter. The classic is NOT IN over a subquery that carries one NULL — every row turns UNKNOWN and the report empties while looking valid — and the EXISTS/COALESCE toolkit is the way back.",
      slugs: ["employee-bonus", "employees-with-missing-information", "tree-node"],
    },
    {
      name: "Growth walks & prior-period deltas",
      why: "Every trend read here is LAG: month-over-month pace, week-over-week arrivals, member-over-member ladder deltas. The graded moves are the NULL first row (baseline, never zero), the ORDER BY inside the window, and what happens when the bucket expression changes under your feet.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "consecutive-transactions-with-increasing-amounts"],
    },
  ],

  theory: [
    {
      id: "accor-t1",
      q: "Your portfolio report joins members to stays, then folio lines for ancillary value. Walk me through where that join chain can silently change grain — and when you would INNER versus LEFT.",
      a: "Grain changes at every hop, so I name the grain out loud before writing SQL. Members to stays is one row per stay — 103 rows on this db. Stays to folio lines fans out to 251, and the moment that join lands, COUNT(*) counts folio lines and calls them stays; SUM of the stay total double-counts unless I fold to stay grain first with a DISTINCT or a pre-aggregated CTE. The business read decides the join type: a stay report INNER-joins members because a stay with no member is corruption — worth a data-quality flag, not a silent inner. A whitespace report must LEFT-join from members, because members with no stays ARE the answer — they arrive with NULL stay columns. The classic break: filtering status = 'completed' in WHERE after the LEFT JOIN kills every NULL-payload member row and the LEFT quietly became an INNER — the predicate moves into ON or an outer query. On this db the never-stayed anti-join returns a confident zero (all 16 members have transacted), and proving that zero is the analyst's job, not an accident to shrug at.",
      tag: "joins",
    },
    {
      id: "accor-t2",
      q: "The ALL-Accor board wants the top members by stays, and the ladder runs 24, 17, 14, 13, 5 with four members tied at 4. RANK, DENSE_RANK or ROW_NUMBER — who decides, and what does each print?",
      a: "The rank trio is a loyalty policy, not a syntax pick, and the interviewer wants me to say that out loud. RANK gives tied counts the same rung and then skips: the four-way tie at 4 consumes ranks 6 through 9, so the two members at 3 stays both print rank 10 — implying five phantom rungs that do not exist. DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits the tie arbitrarily — a silent judgment call about which member's stay gets the milestone credit, which is exactly the kind of decision that should be made by a stated tie-breaker like created_at, then id, not by the engine's mood. For an ALL-Accor board I would default to RANK (shared credit, honest gaps) or DENSE_RANK when the deck counts tiers rather than positions, and write the chosen policy in the query comment. The wrong answer is picking a function; the right answer is picking a policy and naming it on the slide.",
      tag: "windows",
    },
    {
      id: "accor-t3",
      q: "The census says EU ran 45 stays from 8 members worth 15,089.23, and the US 19 stays from 2 members. Why do analysts report both counts, and what does the ratio tell the franchise-development team?",
      a: "They count different things and the difference IS the signal. COUNT(*) after the join counts stay rows — one row per reservation — so a member with 24 stays contributes 24; COUNT(DISTINCT customer_id) folds repeats back to members, so EU's 45 stays collapse to 8 logos. Stays measure demand and folio momentum; members measure installed base and market coverage. The ratio — EU at 45-from-8 (5.6 stays per member) versus the US at 19-from-2 (9.5) — is intensity, and it reads completely differently to franchise development: the US market is concentrated demand from very few loyalty identities, which is fragile (one lapsed member moves half a market) while EU demand is broad. The trap that catches candidates is a third grain: join folio lines for ancillary value and COUNT(*) silently counts 251 lines, not 103 stays. Saying 'one row per what?' for every COUNT is the habit the panel grades, and quoting both grains beside the ratio is what the deck expects.",
      tag: "aggregation",
    },
    {
      id: "accor-t4",
      q: "shipped_at is NULL until a guest actually checks in. What is your policy for the booking-to-check-in lead report, and how do the NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped stays have a lead time, so the report measures booking-to-check-in for the 82 of 103 stays that carry the stamp — averaging 2.98 days, range 2 to 4 — and says the population in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL stays returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset, and the gap between it and COUNT(*) is exactly the 14 awaiting-arrival plus 7 cancelled rows — a feature, not a bug, because those rows have no check-in yet or ever. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average: that invents same-day check-ins for guests who have not arrived, flatters the pre-arrival upsell window, and rots the staffing curve the front office staffs against. A report whose WHERE clause does definitional work without saying so is exactly what an Accor reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "accor-t5",
      q: "The board wants completed-stay value per market for markets carrying at least ten stays. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses, and the pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the reason. The status rule is a row-level fact: status = 'completed' discards in-house, awaiting and cancelled rows before any fold, so it lives in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-stay floor is a group-level fact: HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The strong answer places every filter by asking: is this a fact about one stay, or about a market? On this db the floor bites — only EU (45) and APAC (37) and US (19) clear ten; LATAM's 2 stays drop out, and a small-N market disappearing from a rate table is exactly the kind of silent exclusion the deck must flag, not bury. If the ask were 'value per stay', the denominator question comes next: completed-only value over completed-only stays, never over the full 103.",
      tag: "pipeline",
    },
    {
      id: "accor-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery contractually allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison — on this db the platform mean stay is 338.19 against a 25.47 to 1,088.44 spread, so the above-average filter keeps the heavy folio end of the book. Zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. That is theoretical on the full table (103 stays always produce a mean) but ships regularly on filtered staging tables: one market, one status, one month — exactly the slices an Accor analyst cuts all day. The correlated cousin (compare each stay to ITS member's average) re-runs per outer row and answers a different question — 'is this stay heavy for THIS member?' — at a different cost, and the follow-up is usually 'now rank members by how many of their own stays clear their own mean', which is where the scalar shape stops scaling and a CTE fold takes over. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the question behind the question.",
      tag: "subqueries",
    },
    {
      id: "accor-t7",
      q: "The pace board buckets stays by booking month on TEXT timestamps and walks the trend month over month. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the pace curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when group arrivals land. The walk: LAG(revenue) OVER (ORDER BY month) fetches the prior bucket so each delta is row-local — the book opens at 3,731.97, troughs at 1,193.86 in July (which also carries 2 of the 7 cancellations), and the first row's delta is NULL by definition: there is no prior month, so report NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. For check-in lead math the same discipline applies in julianday days rather than month strings. Date discipline is pace discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "accor-t8",
      q: "Finance says an owner fee bill is 'paid' but the settlements table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both must reconcile to the row-level anomaly list, not to vibes. The full coverage split is the report: 21 exact (65,612 billed, 65,612 settled), 1 partial (4,000 of 6,148 — no SUM may call it settled), 6 none. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 quietly eats cents on every odd-cent settlement. And the close does not ship until the GL tie-out lands at 181,080 debits against 181,080 credits, delta zero — the same discipline the card-versus-wire rails split (16 legs, 37,364 versus 11 legs, 32,248) has to reconcile into.",
      tag: "quality",
    },
    {
      id: "accor-t9",
      q: "Your running-value walk uses SUM(folio_value) OVER (ORDER BY check_in_at) and an intern says 'it jumps two stays at once' when two check-ins share a second. Explain the default frame and give the two fixes.",
      a: "The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE is peer-inclusive: rows tied on the ORDER BY key are one peer group, so both stays enter the cumulative in the same step and the walk 'jumps'. Fix one is semantics: write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which walks strictly one row at a time and splits the tie by whatever deterministic order the ORDER BY carries — so add a tie-breaker (created_at, then id) or the split is arbitrary. Fix two is policy: keep RANGE and accept that simultaneous arrivals batch — legitimate if the board reports 'value arrived this instant' rather than 'value per reservation'. What is never acceptable is shipping the default and calling the jump a rounding artifact. On a month spine ties are rare; at check-in-stamp grain they are guaranteed, and this db's 82 stamped stays include shared arrival days by construction. Name the frame out loud in every review — the default is a decision you did not make.",
      tag: "frames",
    },
    {
      id: "accor-t10",
      q: "Beyond stacking with UNION ALL — where do INTERSECT and EXCEPT actually earn their keep on this desk, and what breaks when someone substitutes an anti-join?",
      a: "INTERSECT and EXCEPT are whole-row set comparisons — both sides must have identical column shapes — and that constraint is the feature: 'members in both the booked and the checked-in books' is INTERSECT of two folds; 'booked but never checked in' is EXCEPT. The workflow where they beat the anti-join is drift checks between two runs — stage versus prod, today's board versus yesterday's — where the question is exactly 'which rows differ', and EXCEPT (old) stacked under EXCEPT (new) prints the two-sided delta in one packet. Anti-joins answer existence on one side; EXCEPT answers content on both. The breaks: NULL handling — EXCEPT treats NULLs as equal (set semantics) while a NOT EXISTS predicate never matches NULL, so the two disagree on NULL-bearing rows and the disagreement is the bug; dedup — both set ops implicitly deduplicate, so a fan-out fold upstream hides behind them and the fold must happen at the right grain first; ordering — set ops discard inner ORDER BY, so sort once at the end or not at all. My rule: anti-join for 'who is missing', EXCEPT for 'what changed', INTERSECT for 'who is in both' — three questions that look identical in a deck and answer differently in review.",
      tag: "setops",
    },
    {
      id: "accor-t11",
      q: "After the LEFT JOIN, some rows carry NULL in every payload column — the member market, the stay status, all of it. How do NULLs behave in GROUP BY, DISTINCT, ORDER BY and UNIQUE — the set semantics rather than the comparison semantics?",
      a: "Set semantics, not comparison semantics — the asymmetry is the whole answer. GROUP BY and DISTINCT treat NULLs as one value: every NULL-market row folds into a single bucket, which is why a LEFT JOIN census prints one mysterious NULL row instead of one per broken join — that row is a data-quality flag, name it 'unknown' in the report, never delete it. ORDER BY sorts NULLs first in SQLite ascending (last in descending) — engine-specific, so a board that leans on NULL placement is a board that breaks on portability; state the ORDER BY and never rely on the default. UNIQUE and primary keys allow multiple NULLs — a nullable natural key enforces nothing, which is why email-as-key needs a NOT NULL. Aggregates ignore NULLs (COUNT(col) beside COUNT(*)), while window functions see them: LAG hands you a NULL on the first row by definition, not by failure. The habit being graded: after every outer join, ask 'what grain do the NULL rows form?' — they are one bucket in every fold, and 'unknown' is the only label that is not a lie. The panellist is probing whether you meet NULL as a third state or as a mistake; the strong answer treats it as a state with its own set algebra.",
      tag: "nulls",
    },
    {
      id: "accor-t12",
      q: "'Rewrite the correlated subquery as a CTE' — when is that the right call on this db and when is it cargo-cult?",
      a: "The correlated shape (compare each stay to its own member's average) re-runs the inner fold once per outer row — 103 executions here is fine; the same shape over a per-market fold inside a 14-month trend is months-times-markets-times-rows and the review clock pays for it. The CTE rewrite stages the fold once — member averages materialize in one pass — then the outer query joins or windows against it, and the plan goes from repeated scans to two passes. That is the right call when the correlated inner fold is an aggregate over a large set. It is cargo-cult when the inner query is a scalar over an indexed key — the engine rewrites it anyway, and 'always CTE' just costs readability. The honest answer names the decision rule: correlation over an aggregate is the smell; correlation over a key lookup is fine. And the follow-up that separates seniors: the rewrite changes empty-case behavior — a member with no stays drops out of a LEFT-joined correlated report unless the join type is restated, so the CTE version must preserve the whitespace semantics, not just the numbers. Rewrites are refactors: same question, same empty cases, cheaper plan — or they are not done.",
      tag: "subqueries",
    },
    {
      id: "accor-t13",
      q: "Uniform 30-day terms on every owner bill. Write the aging read — due date, days past due, the bucket — and tell me where date arithmetic usually breaks.",
      a: "Three expressions, each with a trap. Due date: date(issued_on, '+30 days') — and on this db it reconciles to the stored due_on on all 28 bills, which is the sanity check that makes the modifier trustworthy. Days past due: julianday(reference) - julianday(due_on) — julianday, not TEXT subtraction, because '2024-03-06' - '2024-02-05' is NULL nonsense in SQLite; and the reference date is stated (max paid_on is the canonical choice), not the wall clock, or two runs of the same board disagree. The bucket: CASE WHEN days_past <= 0 THEN 'current' WHEN days_past <= 30 THEN '1-30' ELSE '31+' END — and the classic typo is '+30 day' singular, which errors or silently parses wrong. The breaks I hunt: string comparison across a date boundary works for ISO text until one side carries a time component and the equality dies; BETWEEN loses the last night, so aging windows are half-open; and a '+1 month' modifier walks calendar months correctly but '+30 days' is not a month — the terms here are days and stay days. Print the reference date in the title and the aging board survives review; anything else is a number with an unstated definition.",
      tag: "dates",
    },
    {
      id: "accor-t14",
      q: "SELECT SUM(amount_cents)/COUNT(*) from payments prints 2578 instead of 2,578.22. What happened, and what is your typing discipline for money reads?",
      a: "Integer division: SQLite's / on two integers truncates toward zero before anyone sees a decimal — 2578.22 dies at the operator, and the number that ships is a lie with plausible digits. The discipline: one operand forces real arithmetic first — amount_cents / 100.0 for the dollars read, 1.0 * SUM(x) / COUNT(*) for ratios — and the 100.0 multiplier sits BEFORE the division, because (SUM/COUNT)*100 truncates 0.068 to 0 and then scales the damage. Second trap: AVG over an integer column already returns a float in SQLite, so AVG(amount_cents) is safe while SUM/COUNT is not — knowing which aggregates promote is the difference between a fix and a shuffle. Third: keep the cents column integer all the way to the display fold — SUM(amount_cents)/100.0 in one expression, ROUND(..., 2) for presentation — because float-rounding at every hop accumulates drift the GL tie-out (181,080 against 181,080, delta zero) eventually catches. Money reads are typed reads: state the storage type, state the promotion point, and the truncation class of bugs disappears from the estate.",
      tag: "types",
    },
    {
      id: "accor-t15",
      q: "The tier board prints each tier's share of its market book. Where does PARTITION BY earn its keep, and what does the wrong partition key do to the read?",
      a: "PARTITION BY is the denominator, typed. SUM(folio_value) OVER (PARTITION BY market) re-aggregates per market inside the row stream, so each tier's share divides by its own market's book — EU's 12,032.44 midscale over its 15,089.23 book is 79.7, the midscale-dominance story. Drop the PARTITION BY and the denominator becomes the whole 34,833.28 network: every share shrinks and the board reads like every market is tiny. Partition by tier instead and the denominator is the tier across all markets — shares no market owns and no review can use. The discipline is stating 'share of what?' in the column name: share_of_market, never bare share. The cousin move is the cumulative share on the ORDER BY frame — same syntax, running denominator — which is exactly why the two get confused one keyword apart. My review rule: every OVER clause gets read aloud as 'over which rows does the denominator run', and if the sentence does not match the deck's claim, the query is wrong before it runs. A share without a named denominator is not a KPI; it is a decoration.",
      tag: "windows",
    },
    {
      id: "accor-t16",
      q: "One scan for booked, cancelled, awaiting and stamped per market. Compare FILTER (WHERE …) with SUM(CASE …), and say when four separate queries are actually better.",
      a: "FILTER (WHERE status = 'cancelled') is the intent-revealing form: one branch per aggregate, no ELSE to forget, NULL-safe by construction — COUNT(*) FILTER (WHERE false) is 0, not NULL. SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) is the portable twin that runs anywhere, and its failure mode is forgetting the ELSE: without it the non-matching rows sum to NULL and the census prints holes. Both are one pass over the same rows and reconcile by construction — 52 + 30 + 14 + 7 = 103 is the check the board ships with. When are four queries better? When the four counts age differently: a scheduled job per stage with its own owner and its own failure alert beats one blessed query nobody owns — the one-pass shape is for reports, not pipelines. The graded instinct is reconciliation: whichever form, the branches must sum to the COUNT(*) of the same WHERE — if they do not, one branch's predicate drifted, and drift is a silent re-definition of the funnel. Say 'reconciles to 103 by construction' in the interview and the panel stops worrying about syntax and starts worrying about your definitions, which is the right place for the worry.",
      tag: "census",
    },
    {
      id: "accor-t17",
      q: "The front office wants a one-line folio digest per stay: line items folded into a readable cell. How do you build it, and what are the edge behaviors?",
      a: "GROUP_CONCAT(product, ', ') folded at stay grain after the join — with ORDER BY inside the aggregate, because the default order is arbitrary and a digest that reshuffles between runs is a support ticket. The edges: length is unbounded, so a 20-line folio makes a cell nobody reads — cap it with a count column beside it (this db averages 2.44 lines per stay, so a 251-line fold is safe, but the habit generalizes); NULLs are skipped silently, so an empty fold prints as empty string, not NULL — wrap with NULLIF('', …) if the downstream distinguishes; and the separator is a literal, so folding product names that contain commas with a comma separator is a parse bomb downstream — pick a separator that cannot appear in the data. The real question the panel is asking: why fold to a string at all? Because the consumer is a human reading a ticket, not a system — the moment a downstream query needs the lines again, the fold was the wrong shape and child rows or a JSON aggregate are the honest answer. A digest is a presentation decision; treat it like one and defend the separator, the order and the cap in the query comment.",
      tag: "folds",
    },
    {
      id: "accor-t18",
      q: "Find stays that share a check-in day — same-market guest pairs for the concierge desk. How does the self-join go, and how do you keep the pairs honest?",
      a: "Orders a JOIN orders b on the pair condition — julianday(a.shipped_at) = julianday(b.shipped_at) AND a.customer_id < b.customer_id — and every clause earns its keep. The inequality is the dedup: without it every pair prints twice (a-b and b-a) and same-member rows pair with themselves; < instead of <> kills the self-pairs and keeps one canonical ordering. State the pairing rule in the query comment, because six months from now 'a.id < b.id' reads like a typo, not a policy. Then the market condition: the two customers join customers twice, aliased, or the pair condition drifts to global — a concierge list that pairs Paris with Osaka is worse than no list. The edge that surprises: shared arrival days cluster, and the pair list grows quadratically with cluster size — this db's 82 stamped stays over a 14-month window guarantee collisions, so the desk gets a count-per-day board first and the pair drill-down on demand. Self-joins are the one join family where the join condition IS the business rule; write the rule, then write the SQL, in that order, and the panel can see the policy in the predicate.",
      tag: "selfjoin",
    },
    {
      id: "accor-t19",
      q: "The pace board buckets by SUBSTR(created_at, 1, 7). A colleague says wrap the column in an index. What is your actual performance read?",
      a: "Function-wrapped predicates do not use a plain index — SUBSTR(created_at, 1, 7) = '2024-01' forces a scan of every row because the index is on created_at, not on its substring. The sargable rewrite is a range: created_at >= '2024-01-01' AND created_at < '2024-02-01' — same bucket, index-eligible. For the GROUP BY bucket itself the scan is unavoidable at this scale and that is fine: 103 rows is a rounding error, and the honest performance instinct is knowing when the scan costs nothing. The discipline I screen for: state the scale before optimizing — a 16-member, 103-stay db needs correctness, not indexes; write the shape that would scale anyway — range predicates instead of wrapped columns, EXISTS instead of NOT IN over unguarded columns, folds staged once in a CTE instead of correlated re-computation; and measure with EXPLAIN QUERY PLAN, not vibes — 'SCAN orders' on this db is the right plan, and someone who adds an index 'to help' has just added write cost to a read-mostly reporting table. Performance instinct at small scale is mostly a correctness instinct: write the shape that would scale, then let 103 rows be fast by being right.",
      tag: "performance",
    },
    {
      id: "accor-t20",
      q: "The coverage board LEFT-joins settlements and shows 0.00 for never-settled bills. When is COALESCE the right move and when does it lie?",
      a: "COALESCE in the display layer is honest when zero is the true semantic: a never-settled bill has zero settled dollars, so COALESCE(SUM(p.amount_cents), 0) / 100.0 prints 0.00 and the dunning queue reads cleanly. It lies when the NULL means 'no event yet' and zero means 'event completed at value zero' — the awaiting-arrival stay has no check-in latency, not a zero-day one, and IFNULL-ing the latency to 0 invents same-day arrivals that flatter the pre-arrival upsell window and rot the staffing curve. The policy I state in interviews: preserve NULL through the computation, translate at the presentation boundary, and make the translation a stated rule ('NULL settled = 0.00 on the AR board, because the bill is real and the money is not there yet'). The second lie is aggregation drift: COALESCE before the SUM changes the population (NULL rows excluded versus zero rows included), while COALESCE after the fold changes only the display — same query, different truth. On this db the mirrors prove it: the void bill WITH a 925 settlement and the paid bill with zero rows are both cases where a blanket COALESCE would have averaged the anomaly away instead of flagging it. Translate at the edge; never mid-flight.",
      tag: "coalesce",
    },
    {
      id: "accor-t21",
      q: "Latest stay per member, peak folio night per property — the per-group-top family. Why is GROUP BY + MAX not the answer, and how do you pick the row?",
      a: "GROUP BY member + MAX(created_at) returns the right timestamp and throws away the row: the moment you also want total, status or market, they are bare columns next to an aggregate and SQLite hands you an arbitrary row's values — a query that works until it doesn't. The argmax shapes: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1 in a CTE or derived table, then filter rn = 1 — deterministic once the ORDER BY carries a tie-breaker (created_at DESC, then id DESC), which is a policy statement the deck can quote: 'the latest stay; ties broken by the later booking id'. The RANK cousin answers a different question — all rows tied at the top — and for peak folio nights where two nights share the maximum, RANK is the honest pick while ROW_NUMBER silently drops a legitimate peak. The third shape, the correlated scalar (WHERE total = (SELECT MAX…)), is correct but re-runs per group — the perf smell from the subquery discussion. My default: ROW_NUMBER with a stated tie-breaker for 'pick one', RANK for 'pick all tied'. The interviewer's follow-up 'what if two are tied?' is exactly the question the tie-breaker already answered — that is how you know the policy was the answer, not the syntax.",
      tag: "argmax",
    },
    {
      id: "accor-t22",
      q: "The pace board must print all 14 months even if a month books zero stays. Why does GROUP BY fail at that, and how does WITH RECURSIVE fix it?",
      a: "GROUP BY can only bucket months that exist in the data — a zero-booking month contributes no rows, drops out of the spine, and the trend line silently skips it: a chart that reads as continuous is missing a rung. The fix stages the axis independently: WITH RECURSIVE months(m) AS (SELECT '2024-01' UNION ALL SELECT strftime('%Y-%m', date(m, '+1 month')) FROM months WHERE m < '2025-02') builds the 14-bucket spine from the data's own bounds, then a LEFT JOIN carries the booked fold onto it — a zero month survives as NULL and COALESCEs to 0.00 at the display boundary, so the axis is dense by construction. The traps: the base case and the WHERE guard are the termination argument — forget either and the recursion runs to SQLite's limit and errors; each step must re-format, because date(m, '+1 month') returns full dates while the spine carries 'YYYY-MM', and the naive string-append shortcut breaks at December; and the anchor grain must match the guard ('2024-01', not '2024-01-01'). The general principle the panel wants: an axis is a data model of its own, and deriving it from the facts table means empty periods edit your chart. Dense spines are why 'no bookings in that month' can be said with confidence instead of being a gap nobody noticed.",
      tag: "recursion",
    },
    {
      id: "accor-t23",
      q: "Two books: booked stays by month from orders, checked-in stays by month from the stamped subset. How do you read both drifts — and the months that exist in only one book — in one query?",
      a: "FULL OUTER JOIN of the two monthly folds on month, then three labeled arms of the read: matched months (both sides non-NULL) get the delta; months only in the booked fold are bookings-with-no-check-ins — a business event, kept, COALESCE(a.month, b.month) as the key because after a full outer the key itself is NULL on the unmatched sides; months only in the stamped fold would be check-ins without bookings — corruption on this db, and the board flags it rather than printing it. The two arms are not symmetric: one is a demand story, the other is a data-quality incident, and the query must label which is which or the close packet merges them into noise. SQLite lacks native FULL OUTER JOIN, so the shape is a LEFT JOIN arm UNION ALL a right-side anti-join arm — or two LEFT JOINs from a recursive month spine, which is why the axis work and the reconciliation work compose. The cousin is the two-way anti-join — each side minus the intersection — same information, two queries, no reconciliation guarantee in one result. One query, three arms, every month printed: that is a reconciliation, not a report, and it is the shape the fee desk's two-sided walks (billed versus settled) reuse verbatim.",
      tag: "reconciliation",
    },
    {
      id: "accor-t24",
      q: "Before a board ships, what duplicate and integrity checks do you run, and which can SQL prove rather than assert?",
      a: "Four gates, all provable in-query. Uniqueness: GROUP BY the natural key HAVING COUNT(*) > 1 — id columns are primary keys, but the natural keys (email per member, number per bill) are the ones that rot, and the check is one query. Grain: the census reconciles by construction — status counts sum to 103, tier shares sum to 100 per market — and a board that cannot state its reconciliation is not a board, it is a screenshot. Referential: anti-joins against the dimension tables — every stay carries a member and every folio line a product, both provable as zero-row checks, and the honest result '0 orphans' ships in the QA note rather than being assumed. Range: rates inside the published band — 14.99 to 199.99 on this catalog, so a 200-plus rate is either the premium arm existing or a decimal-point bug, and the query that proves which is the one that saves the close. What SQL cannot prove is the semantic layer — whether 'completed' should include in-house is a definition, not a constraint. So the gate is two-part: the engine proves the arithmetic, and the analyst writes the definitions in the header so the next reader can re-prove them. Quality that ships is quality that re-proves itself.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "accor-mcq-1",
      prompt: "A reservation row's status reads 'shipped'. In this kit's Accor stay map, what happened?",
      choices: ["The stay is in-house — checked in, not yet completed", "The stay is completed — guest checked out", "The reservation is cancelled before arrival", "The reservation is booked and awaiting arrival"],
      answer: 0,
      why: "The stay map is fixed: shipped = in-house with shipped_at as the check-in stamp (30 of 103 stays). Only 'delivered' means the stay completed (52), and the two are different funnel stages with different numerators.",
      notes: [
        { choice: 1, why: "Completed is 'delivered' — 52 stays. Calling the 30 in-house stays completed inflates the completion rate before a single guest checks out." },
        { choice: 3, why: "Awaiting arrival is 'pending' — 14 rows with no check-in stamp at all. Pending has no lead time to average and no folio to settle yet." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-2",
      prompt: "On-property share is stamped stays over which population? The db holds 82 stamped, 14 awaiting arrival and 7 cancelled of 103 booked.",
      choices: ["Stamped + cancelled only (82/89 = 92.1%)", "All booked reservations (82/103 = 79.6%)", "Completed stays only (52/82)", "Distinct members (82/16)"],
      answer: 1,
      why: "The house definition: stamped over ALL booked — the 14 awaiting arrival stay in the denominator because 'not yet arrived' is exactly what the metric watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting inflates the share to 92.1% by deleting the population the arrival queue exists to manage." },
        { choice: 2, why: "52/82 mixes two funnel stages into one ratio — completed is checkout, stamped is check-in. Different stages, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-3",
      prompt: "EU ran 45 stays from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts stay rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap — 5.6 stays per member — is the intensity read the franchise call needs.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every stay has a member. Without DISTINCT both columns read 45 and the coverage story vanishes." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not members — a third grain nobody asked for. The census is stays AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled reservations only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the cancellation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-5",
      prompt: "Keep only markets carrying at least 10 stays. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE stays >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A stay-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and US (19) clear the bar; LATAM's 2 stays drop out.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'stays' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-6",
      prompt: "The member ladder runs 24, 17, 14, 13, 5 stays, then FOUR members tied at 4. Under RANK, what rank do the two 3-stay members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1 through 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-stay members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting-arrival stays double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 stays.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-8",
      prompt: "A staging-table no-show list uses member_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every stay carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-9",
      prompt: "A close packet stacks completed-stay folio value under cancelled-stay folio value in one layout, built with UNION. A reviewer says one member's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same member, same value) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same member, same value, no market or branch label — collapse into one, and the close packet loses a member with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated value exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-10",
      prompt: "A dashboard walks folio value stay by stay: SUM(folio_value) OVER (ORDER BY check_in_at). Two stays share a check-in second, and the cumulative 'jumps two stays at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on check_in_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at check-in grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-11",
      prompt: "How many of the 103 booked stays carry a check-in stamp (shipped_at)?",
      choices: ["82 — 52 completed plus 30 in-house", "52 — completed stays only", "103 — every stay is stamped at booking", "89 — stamped plus cancelled"],
      answer: 0,
      why: "A check-in stamp is a completed or in-house stay: 52 + 30 = 82, the on-property base for the 79.6% share. Awaiting arrival (14) and cancelled (7) carry no stamp — cancelled never will.",
      notes: [
        { choice: 1, why: "52 is the completed count — dropping the 30 in-house guests understates occupancy by the entire in-house book." },
        { choice: 2, why: "created_at is the booking stamp, not the check-in. Treating bookings as arrivals collapses the lead-time window to zero." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-12",
      prompt: "Bill #25 reads amount_cents = 614800 and its settlement rows sum to 400000 cents. What does the fee desk print?",
      choices: ["6,148.00 billed, 4,000.00 settled — a partial", "6,148,000 billed — cents were already dollars", "614.80 billed — divide by 1000", "6,148,000 billed — multiply by 100"],
      answer: 0,
      why: "Money tables store INTEGER cents; the dollar read divides by 100.0 once. 614800 cents = 6,148.00, and the partial 4,000.00 of 6,148.00 is the one bill no SUM may call settled.",
      notes: [
        { choice: 1, why: "Multiplying re-invents the unit — cents are the storage, dollars are the read, and the /100.0 fold is the only bridge." },
        { choice: 2, why: "Dividing by 1000 invents a third unit. The convention is cents-to-dollars, one division, stated in the query comment." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-13",
      prompt: "A deck claims 3 room products sit in the premium band (200-plus). What does the catalog actually hold?",
      choices: ["Zero — the ladder tops out at 199.99", "3 — Smart Watch S and two more", "8 — one per category", "The db errors — the band is undefined"],
      answer: 0,
      why: "MAX(price) is 199.99, so the premium arm returns zero rows by construction. Proving the empty band is the job: the CASE prints premium nowhere and the board says so out loud.",
      notes: [
        { choice: 1, why: "199.99 is one cent under the line — proximity is not membership. A >= 200 filter cannot catch it." },
        { choice: 2, why: "Eight per arm is the budget/mid split (8 below 50, 8 between 50 and 200) — a band structure, not a premium arm." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-14",
      prompt: "The US market ran 19 stays from 2 members. What does the intensity ratio warn franchise development about?",
      choices: ["Demand concentrated in very few identities — one lapse moves half a market", "The US underperforms on volume — 19 is the smallest book", "Two members is the target — expansion failed", "Intensity cannot be computed below 3 members"],
      answer: 0,
      why: "19 stays from 2 members is 9.5 stays per member versus the EU's 45-from-8 (5.6). Concentration is fragility: the ratio is a risk read, not a volume read.",
      notes: [
        { choice: 1, why: "LATAM's 2 stays is the smallest book. US volume sits mid-table; the signal is the denominator, not the numerator." },
        { choice: 2, why: "Nothing in the data sets a member target — the read is concentration risk on the existing base." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-15",
      prompt: "The GL tie-out prints total_debits 181080 and total_credits 181080. What ships?",
      choices: ["The close — delta zero is the gate", "An incident — debits must exceed credits", "A restatement — 181,080 cents is 1,810.80, too small", "Nothing — the ledger needs a manual SUM first"],
      answer: 0,
      why: "Delta zero is the close gate: 181,080 against 181,080 reconciles the ledger by construction. The cents convention means the dollar read is 181,080.00 — the tie-out compares stored cents to stored cents; the dollars are the fold.",
      notes: [
        { choice: 1, why: "Balanced books are the goal — a debit excess would be the incident, not the reverse." },
        { choice: 2, why: "The /100.0 fold is a display step; converting mid-check corrupts the comparison the gate is built on." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-16",
      prompt: "After joining folio lines to stays, COUNT(*) prints 251. What is the honest relabel?",
      choices: ["251 folio lines — the stay count needs COUNT(DISTINCT order_id)", "251 stays — the join preserves grain", "251 stays — 251 minus duplicates", "251 members — the join counts people"],
      answer: 0,
      why: "The stay-to-folio join fans 103 stays out to 251 lines; COUNT(*) counts lines. COUNT(DISTINCT order_id) folds back to stays — saying which grain a count measures is the habit the panel grades.",
      notes: [
        { choice: 1, why: "Joins never preserve grain across a fan-out — one stay with three folio lines contributes three rows." },
        { choice: 2, why: "There are no duplicates to subtract — every line is legitimate. The number is correct and mislabeled." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-17",
      prompt: "How do owner remittances split across payment rails?",
      choices: ["16 card legs worth 37,364; 11 wire legs worth 32,248", "16 wires worth 37,364; 11 cards worth 32,248", "27 card legs; 0 wires", "16 card legs; 12 wire legs"],
      answer: 0,
      why: "The rail split is card 16 legs / 37,364 and wire 11 legs / 32,248 — 27 legs total. Five bills settle on both rails, which is why folds run per statement, not per leg.",
      notes: [
        { choice: 1, why: "The values swap — a plausible mix-up that changes the cash-forecast rails entirely." },
        { choice: 3, why: "27 legs split 16/11, not 16/12 — the totals tie to 69,612 only on the true split." },
      ],
      difficulty: "easy",
    },
    {
      id: "accor-mcq-18",
      prompt: "STRFTIME('%m', created_at) buckets the pace board. How many buckets print, and what broke?",
      choices: ["12 — '%m' dropped the year, merging Jan-2024 with Jan-2025", "14 — '%m' is equivalent to '%Y-%m'", "2 — the format collapsed to years", "0 — the pattern is invalid"],
      answer: 0,
      why: "'%m' prints month only, so all Januaries merge: 12 buckets instead of the 14-month spine. The fix is '%Y-%m' (or SUBSTR(created_at, 1, 7)) — year first, zero-padded month.",
      notes: [
        { choice: 1, why: "14 buckets requires the year — '%m' cannot produce it. The merged Januaries are the tell." },
        { choice: 2, why: "Two buckets is SUBSTR(created_at, 1, 4) — a different classic bug, year-grain buckets." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-19",
      prompt: "Terms are uniform 30 days and due_on reconciles to date(issued_on, '+30 days') on all 28 bills. Which aging read is right?",
      choices: ["julianday(ref) - julianday(due_on), ref = max paid_on, stated in the title", "due_on - issued_on, then subtract from today", "julianday(due_on) as an integer day count from 2024-01-01", "WHERE julianday(due_on) > julianday(created_at)"],
      answer: 0,
      why: "Aging is a two-date julianday delta against a stated reference — max paid_on is the canonical choice, so two runs agree. due_on - issued_on checks terms, not aging; julianday(due_on) alone has no baseline.",
      notes: [
        { choice: 1, why: "That expression verifies the 30-day terms (always true here) — it computes nothing about how far past due a bill sits." },
        { choice: 2, why: "A day count from a fixed epoch is a timestamp, not an age — the bucket boundaries never line up with the terms." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-20",
      prompt: "Booked-but-never-stamped stays by month, written as EXCEPT. Which shape is honest?",
      choices: ["booked-months EXCEPT stamped-months, both folded to one column, the implicit dedup acknowledged", "stamped-months EXCEPT booked-months — direction does not matter", "UNION of the two folds, then filter month IS NULL", "INTERSECT minus UNION"],
      answer: 0,
      why: "EXCEPT keeps left-minus-right: booked months that never appear in the stamped fold. Both folds must share the column shape, and the implicit dedup is harmless at month grain — the direction IS the semantics.",
      notes: [
        { choice: 1, why: "Reversed EXCEPT returns stamped months with no bookings — corruption on this db, and empty by construction. Direction is the whole query." },
        { choice: 2, why: "UNION cannot express difference; filtering NULL on a UNION key filters nothing — both sides carry months." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-21",
      prompt: "GROUP_CONCAT(product) in the folio digest reshuffles between runs. Why?",
      choices: ["No ORDER BY inside the aggregate — the default order is arbitrary", "The join reorders rows randomly at execution", "GROUP_CONCAT deduplicates, so content changes", "The separator defaulted to a random character"],
      answer: 0,
      why: "Without GROUP_CONCAT(product ORDER BY ...), SQLite concatenates in whatever order rows arrive — stable in practice, never promised. The digest fix is an explicit ORDER BY inside the aggregate plus a count column beside it.",
      notes: [
        { choice: 1, why: "Joins are deterministic for a given plan; the reshuffle is an unguaranteed aggregate order, not randomness in the join." },
        { choice: 2, why: "GROUP_CONCAT never deduplicates — every line folds, including repeats." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-22",
      prompt: "AVG(o.total) after joining stays to folio lines prints 411.33 instead of 338.19. Diagnosis?",
      choices: ["The fan-out re-weights by line count — fold to stay grain, or name the line-weighted read honestly", "AVG ignores NULLs — add a WHERE clause", "The join should be LEFT JOIN", "Rounding — 411.33 versus 338.19 is a display artifact"],
      answer: 0,
      why: "Stays with more folio lines contribute more rows after the fan-out, so AVG(o.total) over the join weights by lines, not stays: 251 rows over a 103-stay book. The fix folds to stay grain first — or the line-weighted read is named as such and owned.",
      notes: [
        { choice: 1, why: "NULLs are not in play — o.total is never NULL. The distortion is multiplicity, not absence." },
        { choice: 3, why: "A 73-point gap is not display — it is a different population wearing the same name." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-23",
      prompt: "The coverage board prints COALESCE(settled, 0) and the reviewer says the partial bill now looks paid. What happened?",
      choices: ["COALESCE moved 'no settlement' to zero — a partial 4,000.00 needs its own label, not a zero-fold", "COALESCE rounded the partial up", "The reviewer is wrong — zero and partial are the same state", "COALESCE must wrap the bill amount, not the settlement"],
      answer: 0,
      why: "COALESCE(settled, 0) is honest for never-settled (zero money moved) but erases the partial distinction: 4,000.00 of 6,148.00 is 'in-flight', not 'settled'. Coverage needs the three-way CASE — exact / partial / none — not a two-state zero-fold.",
      notes: [
        { choice: 1, why: "Nothing rounds — the label space collapsed. The value printed fine; the state did not." },
        { choice: 3, why: "Wrapping the bill amount is the other column — the defect is collapsing three settlement states into two." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-24",
      prompt: "Tier share of market book: SUM(folio_value) OVER (PARTITION BY market). The intern typed PARTITION BY tier. What prints?",
      choices: ["Each tier's share of the NETWORK book re-split inside the tier — shares no market owns", "The same numbers — partition choice is cosmetic", "NULLs — tier cannot partition", "Shares of the member book"],
      answer: 0,
      why: "The partition key is the denominator: PARTITION BY tier re-denominates across markets, so EU's midscale share divides by all midscale value everywhere. Same syntax, different denominator, unusable board — the partition is typed before it is written.",
      notes: [
        { choice: 1, why: "Partition choice changes every row — the numbers differ per market and per tier." },
        { choice: 2, why: "Partitioning is legal on any column — the failure is semantic, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-25",
      prompt: "Latest stay per member via ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1. Two members' stays tie on created_at. What is the sound answer?",
      choices: ["Add a deterministic tie-breaker (id DESC) and state it — the pick is a policy", "It errors — ROW_NUMBER forbids ties", "Both rows return — ROW_NUMBER keeps ties", "Switch to MAX — it resolves ties"],
      answer: 0,
      why: "ROW_NUMBER always numbers 1..n; with a tie the assignment is arbitrary unless the ORDER BY carries a tie-breaker. (created_at DESC, id DESC) makes the pick reproducible and quotable — 'latest stay; ties to the later booking id'.",
      notes: [
        { choice: 1, why: "No error — that is the danger. Arbitrary picks look deterministic until the plan changes." },
        { choice: 2, why: "Both rows surviving is RANK's behavior, not ROW_NUMBER's." },
      ],
      difficulty: "medium",
    },
    {
      id: "accor-mcq-26",
      prompt: "Why build the 14-month pace spine with WITH RECURSIVE instead of GROUP BY month?",
      choices: ["GROUP BY can only print months with rows — a zero-booking month would silently vanish from the trend", "Recursive CTEs are faster on 103 rows", "GROUP BY cannot sort months", "Recursion is required to parse month strings"],
      answer: 0,
      why: "The axis must be dense by construction: RECURSIVE months walks '2024-01' to '2025-02' from the data's own bounds, and the LEFT JOIN keeps a zero month as 0.00 instead of a missing rung. GROUP BY derives the axis from the facts — empty periods edit the chart.",
      notes: [
        { choice: 1, why: "At this scale both plans are instant — the recursion buys completeness, not speed." },
        { choice: 2, why: "ORDER BY sorts any bucket expression; sorting was never the failure mode." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-27",
      prompt: "A booked-months fold FULL OUTER JOINs a stamped-months fold, and one row has b.month NULL. What is that row?",
      choices: ["A month with bookings but zero check-ins — a business event, labeled, not dropped", "A data-quality incident — drop it", "A month that exists in neither book", "Impossible — the folds always match"],
      answer: 0,
      why: "After a FULL OUTER JOIN, one-sided rows are the read: booked-with-no-arrivals is a demand month the stamp fold never met — real, kept, COALESCE'd key and labeled 'no check-ins'. The reverse arm (stamp without booking) would be corruption, and the query labels the arms differently on purpose.",
      notes: [
        { choice: 1, why: "Dropping unmatched rows is the INNER JOIN — the exact behavior a reconciliation exists to prevent." },
        { choice: 2, why: "A month in neither book cannot appear — the row came from one side by definition." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-28",
      prompt: "Occupancy islands: flag runs of consecutive booked days (gaps-and-islands). What is the standard trick?",
      choices: ["ROW_NUMBER() over all days minus ROW_NUMBER() per member (or a day index) — the difference is constant inside a run", "GROUP BY day and count — counts reveal islands", "LAG over 30 days and filter NULLs", "A CROSS JOIN of the day table to itself"],
      answer: 0,
      why: "row_number() over the whole sequence minus row_number() over the partition is invariant inside a contiguous run — grouping on that difference collapses each run to one row. It is the gaps-and-islands idiom, and it survives on text dates via julianday.",
      notes: [
        { choice: 1, why: "Counts per day measure volume, not contiguity — a run of 3 and three scattered days print identically." },
        { choice: 2, why: "LAG finds gaps one step wide; islands of arbitrary length need the arithmetic difference, not a one-step comparison." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-29",
      prompt: "After the folio-line join: 100.0 * SUM(CASE WHEN status='cancelled' THEN o.total ELSE 0 END) / COUNT(DISTINCT o.id) — versus the same over COUNT(*). What changed?",
      choices: ["The denominator folds back to stays — the rate reads per booked stay, not per folio line", "Nothing — both count the same rows", "Only the numerator changed", "COUNT(DISTINCT) makes the query invalid after a join"],
      answer: 0,
      why: "After the fan-out, COUNT(*) counts 251 lines while COUNT(DISTINCT o.id) counts 103 stays — the same numerator over a different denominator is a different metric. Both are legitimate; the board must say which one it prints.",
      notes: [
        { choice: 1, why: "251 versus 103 — the rates differ by the fan-out factor wherever multi-line stays exist." },
        { choice: 3, why: "COUNT(DISTINCT) after a join is exactly how grain survives — it is the standard fold, not an error." },
      ],
      difficulty: "hard",
    },
    {
      id: "accor-mcq-30",
      prompt: "The concentration board must print the 63.5% tier share in one pass. Which shape returns it without a second query?",
      choices: ["Fold lifetime per member in a CTE, then conditional SUM over the CASE threshold against the window total", "Filter the raw stays to 3,000-plus and divide by COUNT(*)", "Two queries — one fold, one share — is the only way", "AVG(total) over members above 3,000"],
      answer: 0,
      why: "The share needs two grains at once: the 3,000-plus cohort's 22,121.70 over the whole 34,833.28 book. A CTE folds lifetime per member; SUM(CASE WHEN lifetime >= 3000 THEN lifetime END) over SUM(lifetime) OVER () prints 63.5 in one pass — tier the member, never the stay.",
      notes: [
        { choice: 1, why: "Filtering first destroys the denominator — the share of a filtered book is 100 by construction." },
        { choice: 2, why: "Two queries cannot reconcile to each other on a moving db — one pass is the auditability argument, not a convenience." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-accor-1",
      tier: "easy",
      topic: "x3",
      universe: "expense",
      title: "The network opex roll-up",
      brief:
        "Accor-flavored brief on the storefront db: the fee desk closes each month by footing the network opex book — the cost side of an asset-light group whose franchise sales, brand-marketing funds and support systems are the overhead the fee streams must cover. Probed facts: 36 expense lines fold to four categories — Rent 14 lines / 16800, Ads 14 / 4570, Tools 5 / 1525, Travel 3 / 2521 — all integer cents, so every dollar read divides by 100.0, and the roll-up must foot to the operating_expenses ledger line at 25416. The desk folds only categories carrying at least three booked lines (Travel sits exactly at that floor) and wants the smallest fold first with the TOTAL footer last.",
      ask: "Return each expense category with its line count and dollar spend, plus a TOTAL footer row, ordered smallest spend first.",
      template:
        "SELECT category AS line,\n       COUNT(*) AS entries,\n       ROUND(SUM({1}) / 100.0, 2) AS spend_dollars\nFROM expenses\nGROUP BY line\nHAVING COUNT(*) >= {2}\nUNION ALL\nSELECT {3} AS line,\n       COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM expenses\nORDER BY spend_dollars {4};",
      slots: [
        {
          answer: "amount_cents",
          kind: "keyword",
          label: "the cents fold",
          why: "SUM(amount_cents) folds the raw integer-cent column, then /100.0 reads dollars: Rent 16800, Ads 4570. SUM(100.0) folds a constant and prints the line counts (14, 14, 3, 5) as spend — the classic divider-misplacement that makes a cost book read like a tally.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the fold floor",
          why: "The floor keeps categories with at least three booked lines — all four survive, with Travel binding at exactly 3. Raising it to 5 drops Travel; 14 drops Tools and Travel; 36 empties the category side and leaves only the TOTAL row.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the footer label",
          why: "The grand row is labelled 'TOTAL' — 36 lines, 25416 — so the footing is visible beside the four folds. Any other label prints the same numbers under a name the GL tie-out will not recognize.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the footer-last direction",
          why: "Ascending spend puts Tools 1525, Travel 2521, Ads 4570, Rent 16800 in order and lands TOTAL (25416) last — the footer sorts last only because the whole exceeds every part. DESC makes the 25416 footer leap to the headline row.",
        },
      ],
      distractors: ["100.0", "5", "14", "36", "DESC"],
      walkthrough:
        "Two folds, one stack, one footing. The first branch groups 36 expense lines by category and folds the integer-cent column — SUM(amount_cents) / 100.0 prints dollars: Rent 14 lines / 16800, Ads 14 / 4570, Travel 3 / 2521, Tools 5 / 1525 — with a HAVING floor at three lines that keeps all four categories, Travel binding at exactly 3. The second branch aggregates the whole table into the footer: 'TOTAL', 36 lines, 25416 — which must equal the operating_expenses ledger line at 25416 or the roll-up does not ship. The ORDER BY is the quiet lesson: ascending spend places the footer last only because the total exceeds every part — flip to DESC and the 25416 footer becomes the headline row, the classic grand-total-stack failure. The distractors each break differently: 100.0 inside the SUM turns the spend book into a line tally (14, 14, 3, 5); a floor of 5 drops Travel, 14 drops Tools and Travel, 36 empties the fold; a wrong footer label breaks the GL tie-out; DESC inverts the read. Thirty-six lines, four folds, one total — reconciled by construction.",
    },
    {
      id: "cs-accor-2",
      tier: "medium",
      topic: "t6",
      universe: "pricing",
      title: "The brand-tier ladder board",
      brief:
        "Accor-flavored brief on the storefront db: portfolio reviews open with the brand-tier ladder — how much folio value sits in the economy arm versus the midscale arm market by market, the Ibis-versus-Novotel/Mercure story in one board. Probed facts: the 16 room products split 8 economy (below 50, averaging 32.06) and 8 midscale (50-200, averaging 111.5); the ladder tops out at 199.99, so the premium arm never fires on this catalog. The 103 stays carry 251 folio lines worth 34,833.28, and the market books to reconcile against are EU 15089.23, APAC 11605.45, US 7286.16, LATAM 852.44. Share of each market's book rounds to 1 decimal.",
      ask: "Return each market and brand tier with folio value and the tier's share of that market's book to 1 decimal, biggest tier first.",
      template:
        "WITH tier_folio AS (\n  SELECT c.region AS market,\n         CASE WHEN p.price < {1} THEN 'economy'\n              WHEN p.price < 200 THEN {2}\n              ELSE 'premium' END AS tier,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS folio_value\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  JOIN orders o ON o.id = oi.order_id\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY market, tier\n)\nSELECT market,\n       tier,\n       folio_value,\n       ROUND({3} * folio_value / SUM(folio_value) OVER (PARTITION BY {4}), 1) AS tier_share\nFROM tier_folio\nORDER BY market, folio_value {5};",
      slots: [
        {
          answer: "50",
          kind: "number",
          label: "the economy ceiling",
          why: "The ladder's first edge is 50 — the facts-file budget band holds 8 products averaging 32.06 below it. Moving the edge to 200 collapses every product into economy; to 1 empties it entirely; the ladder must match the published band edges exactly.",
          noVerify: true,
        },
        {
          answer: "'midscale'",
          kind: "keyword",
          label: "the middle-arm label",
          why: "The 50-to-200 arm is 'midscale' — the Novotel/Mercure story the board reads. Labelling it 'economy' merges the two arms into one row per market and the ladder loses its middle; 'premium' mislabels the arm the catalog cannot even fill.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the share multiplier",
          why: "100.0 before the division prints shares as percentages (74.2, 79.7). A bare 1 prints fractions (0.742) that read like cents; 10 or 200 prints invented scales. The multiplier must sit before the fold, not after it.",
          noVerify: true,
        },
        {
          answer: "market",
          kind: "keyword",
          label: "the partition key",
          why: "PARTITION BY market makes each tier's share sum to 100 within its market — the denominator the deck quotes. Partitioning by tier re-denominates across markets and prints shares no market owns; 'region' errors because the CTE aliased it to market.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-tier-first order",
          why: "The board reads the dominant arm first in every market. ASC opens each market on its smallest tier and buries the midscale story the review exists to discuss.",
        },
      ],
      distractors: ["tier", "region", "1", "200", "ASC", "'economy'"],
      walkthrough:
        "Stage the fold, then share it. The CTE joins folio lines to products, stays and members, CASE-bins every room product — below 50 economy, 50 to 200 midscale, 200-plus premium — and folds value at market-by-tier grain. Eight rows come back, and the premium arm is not among them: the ladder tops out at 199.99, so premium prints nothing, honestly. The midscale arm dominates everywhere: EU 12032.44 (79.7% of its 15089.23 book), APAC 8611.42 (74.2 of 11605.45), US 5335.4 (73.2 of 7286.16), LATAM 626.25 (73.5 of 852.44) — roughly three folio dollars in four, with economy holding the rest (EU 3056.79 / 20.3, APAC 2994.03 / 25.8, US 1950.76 / 26.8, LATAM 226.19 / 26.5). Each market's tiers foot exactly to its facts-file book — 15089.23, 11605.45, 7286.16, 852.44 — that reconciliation is the walkthrough's punchline. The window adds SUM(folio_value) OVER (PARTITION BY market) so shares are per-market, and 100.0 before the division keeps them percentages. The distractors break honestly: tier partitions re-denominate across markets; region errors on the aliased column; 1 prints fractions; 200 collapses the ladder; ASC buries the dominant arm; 'economy' merges the arms and loses the middle. Fold at the right grain, bin at the published edges, partition at the market — the ladder reads itself.",
    },
    {
      id: "cs-accor-3",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass cancellation census",
      brief:
        "Accor-flavored brief on the storefront db: the ops standup opens on the cancellation map — one scan, no follow-ups — booked, cancelled and awaiting per market with the share folded in the same pass. Probed facts: 103 booked stays, 7 cancelled (6.8% network), 14 awaiting arrival; by market the share prints APAC 8.1 (3 of 37), EU 6.7 (3 of 45), US 5.3 (1 of 19) and LATAM 0.0 (0 of 2). The desk wants worst market first, and both status counts must reconcile into the booked column by construction.",
      ask: "Return per market: booked, cancelled and awaiting counts plus the cancellation share to 1 decimal, worst share first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE {1}) AS cancelled,\n       COUNT(*) FILTER (WHERE {2}) AS awaiting,\n       ROUND({3} * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), 1) AS cancel_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY market\nORDER BY cancel_pct {4};",
      slots: [
        {
          answer: "o.status = 'cancelled'",
          kind: "keyword",
          label: "the cancelled flag",
          why: "FILTER (WHERE o.status = 'cancelled') counts the 7 cancelled rows, sliced by market: 3 / 3 / 1 / 0. A different flag here moves the census to another status and the share stops being a cancellation share — the predicate is the metric's definition.",
        },
        {
          answer: "o.status = 'pending'",
          kind: "keyword",
          label: "the awaiting flag",
          why: "The awaiting column counts 'pending' — 14 rows split 5 / 6 / 3 / 0 (APAC, EU, US, LATAM). It must reconcile inside the booked column alongside cancelled and stamped: that is what makes this a census and not a grab-bag of counts.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the percent multiplier",
          why: "100.0 before the division keeps the share real: 8.1, 6.7, 5.3, 0.0. A bare multiplier placed after the division truncates first and every market prints flat; 10.0 shrinks every share by ten. The multiplier's position is the arithmetic-type lesson.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "worst-share-first order",
          why: "The standup reads the worst market first: APAC 8.1, then EU 6.7, US 5.3, LATAM 0.0. ASC buries the argument at the bottom of the board — order is part of the definition of worst-first.",
        },
      ],
      distractors: ["o.status = 'delivered'", "o.status = 'shipped'", "shipped_at IS NULL", "10.0", "1", "ASC"],
      walkthrough:
        "One scan, four columns, zero follow-ups. The two FILTER (WHERE …) branches count cancelled (3 / 3 / 1 / 0) and awaiting (5 / 6 / 3 / 0 — APAC, EU, US, LATAM) beside COUNT(*) as booked (37 / 45 / 19 / 2), and the share multiplies by 100.0 before the division so the fold is real arithmetic: APAC 8.1, EU 6.7, US 5.3, LATAM 0.0 — the facts-file map verbatim, reconciling to 7 cancelled of 103 by construction. ORDER BY cancel_pct DESC puts the argument first. The distractors break honestly: 'delivered' turns the cancelled column into the completion census (24 / 21 / 5 / 2) and 'shipped' into the in-house census (12 / 8 / 10 / 0); 'shipped_at IS NULL' counts unstamped rows (9 / 8 / 4 / 0) — cancelled plus awaiting, a subtly different population; 10.0 rescales every share to a tenth; a bare 1 makes every FILTER count all rows; ASC reads bottom-up. Four predicates, one pass, and the share is a definition, not a decoration.",
    },
    {
      id: "cs-accor-4",
      tier: "medium",
      topic: "t7",
      universe: "growth",
      title: "The pace walk and the crash band",
      brief:
        "Accor-flavored brief on the storefront db: revenue management wants the monthly pace walk — each month's folio value beside the prior month's, deltas folded, and every month whose drop reached the July line flagged for the board. Probed facts: the 14-month spine runs 2024-01 (3,731.97) to 2025-02 (2,390.53) with the 1,193.86 July trough; the deepest drop is November's 2,975.67 to 1,648.80. The crash band is 'delta at or below -853.57 — the July depth'.",
      ask: "Return the crash-band months: month, revenue, prior-month revenue and delta, deepest drop first.",
      template:
        "WITH pace AS (\n  SELECT {1} AS month,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY month\n), walked AS (\n  SELECT month,\n         revenue,\n         LAG(revenue) OVER (ORDER BY month) AS prior_month,\n         ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS delta\n  FROM pace\n)\nSELECT month, revenue, prior_month, delta\nFROM walked\nWHERE delta <= {2}\nORDER BY delta {3};",
      slots: [
        {
          answer: "SUBSTR(created_at, 1, 7)",
          kind: "keyword",
          label: "the month-bucket expression",
          why: "SUBSTR(created_at, 1, 7) is the spine: 'YYYY-MM', 14 buckets, 2024-01 through 2025-02. SUBSTR(..., 1, 4) collapses to two year-buckets and the walk loses its meaning; a scalar like 0 makes one bucket and every delta NULL.",
        },
        {
          answer: "-853.57",
          kind: "number",
          label: "the July crash line",
          why: "The band is 'at or below the July depth' — delta <= -853.57 keeps four months: Nov -1326.87, Mar -992.56, Jun -862.88, Jul -853.57. Loosen to 0 or 800 and the board floods with every losing month; the line is inclusive, so July's own delta stays on the board.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "deepest-drop-first order",
          why: "The board reads the deepest drop first: -1326.87, -992.56, -862.88, -853.57. DESC inverts it and the shallowest crash leads — the wrong story for a recovery review.",
        },
      ],
      distractors: ["SUBSTR(created_at, 1, 4)", "revenue", "0", "DESC"],
      walkthrough:
        "Stage the fold, then walk it. The pace CTE buckets stays with SUBSTR(created_at, 1, 7) and folds ROUND(SUM(total), 2) per month — the canonical 14-month trend, 3,731.97 opening to 2,390.53. The walked layer applies LAG(revenue) OVER (ORDER BY month) so each delta is row-local: February -122.33, then the staircase down — March -992.56, June -862.88, July -853.57 (the 2,047.43-to-1,193.86 trough), November the deepest at -1326.87 (2,975.67 to 1,648.80). WHERE delta <= -853.57 keeps those four crash months and ASC orders them deepest first. The first row's delta is NULL by definition — no prior month — and NULL fails the comparison, so January never ghosts onto a crash board. The distractors: a year-grain bucket (SUBSTR 1,4) merges twelve months into 2024 and the walk collapses to one delta; 'revenue' as the threshold compares each delta to its own revenue and floods the board; 0 keeps every losing month instead of the crash band; DESC puts the shallowest drop first. LAG is the walk; the band is the policy.",
    },
    {
      id: "cs-accor-5",
      tier: "hard",
      topic: "t8",
      universe: "growth",
      title: "The ALL-Accor concentration walk",
      brief:
        "Accor-flavored brief on the storefront db: the loyalty board walks members biggest-book-first and folds a running share of the network book, then reads the 3,000-plus platinum band. Probed facts: 16 members, 34,833.28 lifetime; the ladder runs 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56, and the four 3,000-plus members hold 63.5% of stay value (the 2,000-plus band reaches 71.2%). The board wants each member's own share and the running share beside it, platinum band only, biggest first.",
      ask: "Return the platinum band: member, lifetime value, own share of the book and running share to 1 decimal, biggest book first.",
      template:
        "WITH member_value AS (\n  SELECT c.id AS member,\n         ROUND(SUM(o.total), 2) AS lifetime\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n), ranked AS (\n  SELECT member,\n         lifetime,\n         ROUND({1} * lifetime / SUM(lifetime) OVER (), 1) AS share_pct,\n         ROUND(100.0 * SUM(lifetime) OVER (ORDER BY lifetime {2} ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) / SUM(lifetime) OVER (), 1) AS cum_share_pct\n  FROM member_value\n)\nSELECT member, lifetime, share_pct, cum_share_pct\nFROM ranked\nWHERE lifetime >= {3}\nORDER BY {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share multiplier",
          why: "100.0 before the division prints shares as percentages: 20.8, 19.1, 13.1, 10.5 per member. A bare 1 prints fractions that read like cents; 10 or 1000 invents scales — the multiplier sits before the fold, same as every rate on this desk.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the accumulation direction",
          why: "The frame must run lifetime DESC so the running sum accrues biggest-book-first: 20.8, 39.9, 53.0, 63.5 — landing exactly on the facts-file 63.5 at the platinum boundary. ASC accrues smallest-first and the curve lands nowhere the deck can quote.",
        },
        {
          answer: "3000",
          kind: "number",
          noVerify: true,
          label: "the platinum band floor",
          why: "The band is lifetime >= 3000 — four members, the 7,262.35-to-3,644.56 ladder. 2000 adds the fifth member (2,667.93) and the board reads 71.2 instead of 63.5; 1000 floods to eight members. The floor is the tier definition, not a filter of convenience.",
        },
        {
          answer: "lifetime DESC",
          kind: "keyword",
          label: "the final read order",
          why: "The final ORDER BY is lifetime DESC — column and direction together: the loyalty board opens on the heaviest book, 7,262.35 down to 3,644.56. A bare direction or a wrong column buries the concentration story the review exists to have.",
        },
      ],
      distractors: ["ASC", "revenue DESC", "1000", "300", "2000"],
      walkthrough:
        "Two stages, one window, one band. The member_value CTE folds lifetime value at member grain — ROUND(SUM(o.total), 2) per customer — because tiering raw stay rows would tier folio lines, not people. The ranked layer gives each member a share of the whole book (100.0 * lifetime / SUM(lifetime) OVER ()): 20.8, 19.1, 13.1, 10.5 for the platinum four — and a running share from the frame SUM(lifetime) OVER (ORDER BY lifetime DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW): 20.8, 39.9, 53.0, 63.5. That last cell is the punchline — the walk lands on the facts-file 63.5 exactly at the platinum boundary, and the fifth member (2,667.93, the 2,000-plus band) pushes it to 71.2, the second canonical figure. WHERE lifetime >= 3000 keeps the platinum band; ORDER BY lifetime DESC opens on the heaviest book. The distractors: ASC in the frame accrues smallest-first and the curve never touches 63.5; 1000 or 300 as the floor floods the band to eight or sixteen members; 2000 re-reads the board as the 71.2 band — a different tier with a different story. Fold per member, walk biggest-first, read the boundary — the concentration curve is a policy, not a picture.",
    },
    {
      id: "cs-accor-6",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-remitted split",
      brief:
        "Accor-flavored brief on the storefront db: the fee desk closes on the never-remitted board — bills with no settlement rows at all, split by status, because a paid-status bill with zero payments is a different incident than an open bill. Probed facts: 6 bills worth 15,217.00 carry no settlement rows; the status split is open 5 / 13,461.00 and paid 1 / 1,756.00 (bill #28, the paid lie). The void bill #11 (925.00 settled) is excluded by construction — it HAS a settlement row. Money is integer cents.",
      ask: "Return the never-remitted split by bill status: bills, billed dollars, biggest cohort first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS bills,\n       ROUND(SUM(i.amount_cents) / {1}, 2) AS billed\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = {2}\nWHERE {3}\nGROUP BY i.status\nORDER BY billed {4};",
      slots: [
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents fold",
          why: "amount_cents is integer cents, so the dollar read is SUM / 100.0: 13,461.00 and 1,756.00. A bare /100 happens to reproduce the same digits on this whole-multiple book — exactly the silent fold the close forbids; the /100.0 read is the convention.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement key",
          why: "Payments link to statements by invoice_id, so the join key is i.id. Joining on i.status (text against integer ids) matches nothing and the anti-join returns every bill — a 28-row 'never-remitted' board that dunning-mails the whole estate.",
        },
        {
          answer: "p.id IS NULL",
          kind: "keyword",
          label: "the never-remitted keep",
          why: "LEFT JOIN + IS NULL keeps only bills with no settlement row: 6 bills, 15,217.00. IS NOT NULL flips the read to the settled side — and the join fans to 27 rows over 22 bills because five bills carry two legs, which is why a settled-side census needs COUNT(DISTINCT i.id). The keep clause is the entire anti-join.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-cohort-first order",
          why: "The close reads the open cohort first: 5 bills / 13,461.00, then the paid lie 1 / 1,756.00. ASC would lead with the single-bill incident and bury the cash story.",
        },
      ],
      distractors: ["1000.0", "i.status", "p.id IS NOT NULL", "ASC"],
      walkthrough:
        "The anti-join, split by status, footed in dollars. LEFT JOIN payments ON p.invoice_id = i.id keeps every bill and its settlement legs; WHERE p.id IS NULL keeps the 6 bills with none — 5 open (13,461.00) plus the 1 paid-status lie (1,756.00, bill #28) — and GROUP BY i.status turns the coverage headline into the split the close acts on. The fold is SUM(amount_cents) / 100.0: the cents-to-dollars bridge, and on this book a bare /100 would print identical digits — the reason the convention names the .0. Void bill #11 (925.00 settled) never appears: it HAS a settlement row, so the anti-join correctly excludes the one anomaly that is not a remittance failure — the mirrors live in the coverage census, not here. ORDER BY billed DESC opens on the open cohort. The distractors: 1000.0 shrinks every cohort a thousandfold; i.status as the join key matches text against ids and the board explodes to all 28 bills; IS NOT NULL flips to the settled side and fans to 27 rows over 22 bills; ASC buries the cash story. Six bills, two incidents, one split — reconciled to the 15,217.00 headline by construction.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Pre-arrival promises kept: what share of reservations hit the promised window? Accor asks the same shape for arrival-promise performance — a conditional rate where the denominator is stated, not assumed." },
    { slug: "product-price-at-a-given-date", why: "The rate on the booking date: hotel pricing lives as-of moments, and this problem drills the latest-rate-before-a-date fold that revenue management runs against every rate card." },
    { slug: "maximum-transaction-each-day", why: "Peak folio night per day — the house-level read that drives staffing. Ties on the peak are the argument, and window-or-join argmax shapes are exactly how the board resolves them." },
    { slug: "group-sold-products-by-the-date", why: "Folio lines folded per stay into one readable cell — the daily folio digest the front office prints. GROUP_CONCAT with ordering is the exact fold." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The multi-stay member: who books again and again? With the top member at 24 of 103 stays, repeat-identification is the loyalty desk's first query of the week." },
    { slug: "sales-analysis-ii", why: "Members who booked but never completed — the anti-join behind the abandoned-reservation list. On this db the never-transacted anti-join is zero, so the status-filtered version is the honest variant to drill." },
    { slug: "count-student-number-in-departments", why: "Stays per brand-family including families with zero — the LEFT JOIN that keeps empty arms visible, because a brand with no demand is a portfolio decision, not a missing row." },
    { slug: "bank-account-summary", why: "Per-member folio summary with credits and debits folded side by side — the ALL-Accor statement read, and a cents-discipline drill in one query." },
    { slug: "queries-quality-and-percentage", why: "Rate quality below a threshold with its share of the base — the ADR-outlier screen revenue management runs before a rate-card review, ratio and denominator in one row." },
    { slug: "user-activity-for-the-past-30-days-i", why: "Demand inside a stated window: the 30-day booking pace read that tells a GM whether the trough is real or a calendar artifact. Window edges are the graded part." },
    { slug: "game-play-analysis-iv", why: "First stay soon after joining — the ALL-Accor onboarding read. Did the new member check in within a day of enrolment? A first-event join with a stated denominator." },
    { slug: "last-person-to-fit-in-the-bus", why: "Overbooking economics: capacity walks where the next reservation either fits or walks. The same running-total discipline underlies Accor's inventory-release policy." },
    { slug: "find-the-team-size", why: "Counts beside every row via a window partition — folio lines per stay attached to each line, the two-grain trick that makes per-stay context readable without a second query." },
    { slug: "fix-product-name-format", why: "Brand-tier catalog hygiene before any join: names arriving broken split one room product into two and silently split its folio history. Trim-and-title-case is the pre-flight check." },
    { slug: "confirmation-rate", why: "Contactability as a rate with COALESCE over LEFT-joined nulls — the reservation-confirmation read where the zero-response population must stay in the denominator." },
    { slug: "second-highest-salary", why: "The second rung of the rate ladder — second-highest rate point per market, where LIMIT-1 habits break on ties and duplicates. Rate-ladder questions always end here." },
    { slug: "hopper-company-queries-ii", why: "Cancellation rate per month against the booked base — the same rate the ops board slices by market (APAC 8.1, EU 6.7, US 5.3). A rate with a stated denominator and a window filter, exactly the arrival-risk read." },
    { slug: "trips-and-users", why: "Cancellation-rate joins where some accounts are excluded — the market cancellation table with a stated exclusion policy, the shape the ops review argues over before overbooking policy moves." },
    { slug: "sales-by-day-of-the-week", why: "Check-ins by weekday — the arrival-day mix that drives front-office staffing. A CASE pivot over the check-in stamp, one column per day, empty where a market never arrives that day." },
    { slug: "users-with-two-purchases-within-seven-days", why: "Two stays within seven days — the rapid-rebook read that flags a stay cut short or a market hop. Date-math with a stated window and a member-grain fold." },
    { slug: "find-golden-hour-customers", why: "The golden window between booking and check-in — the same corridor the 2.98-day lead read walks, drilled per member instead of network-wide." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Members who booked economy AND midscale but never premium — the brand-ladder cross-sell census. Conditional aggregation over tier flags at member grain: the ALL-Accor upgrade argument in one query." },
    { slug: "transactions-per-visit-histogram", why: "Bookings-per-member histogram with zero-fill — the census shape that keeps one-stay members visible and proves the 16-member base instead of averaging it away." },
    { slug: "spend-histogram", why: "Stay-value bands over the 25.47-to-1,088.44 spread — the ADR-band board revenue management reads before a rate-card review. Bucket edges are policy, and the histogram is the argument." },
    { slug: "report-contiguous-dates", why: "Contiguous booked-date runs — occupancy islands. The gaps-and-islands fold that turns a reservation log into sellout streaks a GM can staff against." },
    { slug: "human-traffic-of-stadium", why: "Three-plus consecutive booked days — the sellout-run detector. Islands logic over the stay spine, the same shape that finds a conference block in a month of bookings." },
    { slug: "median-employee-salary", why: "Median stay value beside the 338.19 mean — the distribution read that survives the one 1,088.44 outlier. Window-counting both sides of the middle is the drill." },
    { slug: "number-of-calls-between-two-persons", why: "Same-day arrival pairs — the self-join that finds two guests checking in together. Canonical ordering (a < b) keeps every pair honest and printed once." },
    { slug: "most-common-course-pairs", why: "Brand pairs booked by the same member — the cross-brand census behind the ladder story. A self-join pair-key fold at member grain, deduplicated by the same rule." },
    { slug: "consecutive-available-seats", why: "Consecutive free rooms — the inventory-release read. A self-join over the room ladder where the gap condition is the business rule." },
    { slug: "find-zombie-sessions", why: "In-house stays that never completed — the session that never closed. Window-driven staleness over the check-in stamp, the same watch the arrival queue runs." },
    { slug: "uber-first-transaction", why: "First stay per member inside the enrolment window — the ALL-Accor onboarding read. Did the new member arrive soon after joining, and what did the first folio carry?" },
  ],
};
