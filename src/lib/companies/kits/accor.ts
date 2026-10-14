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
  ],

  dayInLife: [
    "**08:15 —** The day opens with the portfolio census. A brand-performance analyst refreshes the stay board before the operations standup: 52 completed, 30 in-house, 14 awaiting arrival, 7 cancelled — **103 by construction**, or the board ships with an incident attached. The check-in watch runs next: **82 stamped stays** averaging **2.98 days** booking-to-check-in, and any drift off the 2-to-4 band pulls the arrival queue before the midscale read goes out. The monthly pace curve sits beside it — the 3,731.97 January open against the 1,193.86 July trough — because *the pace story is the staffing story*, and a trough that surprises a Novotel GM is a forecast failure, not a market surprise.",
    "**11:30 —** Midday is ladder work. The loyalty desk wants the ALL-Accor board re-cut — the four 3,000-plus members and their **63.5%** share versus the 71.2% that 2,000-plus reaches, with the mid-band member who owns the difference named; the midscale network team wants intensity beside coverage (EU 45 stays from 8 members against the US's 19 from 2) for the franchise-development call; brand marketing wants the attach read — **54 of 103 stays** carry an Accessories-family folio line, and attach breadth is the upsell argument. Each ask is a fold-then-bucket: *tier the member, never the stay* — tiering raw stay rows silently re-weights the ladder toward the heaviest bookers. The analyst writes every query twice — *once to answer, once with the definition spelled out so the number survives the owner call*.",
    "**15:30 —** The afternoon belongs to owner money. The AR anti-join refreshes first — **6 never-settled fee bills worth 15,217** — before a single dunning letter goes out; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 — a partial that no SUM may call settled) and feeds the cash-flow draft. Then the anomaly walk, line by line: bill #11 sits {rose:void} yet carries a 925 settlement, and bill #28 claims paid with zero settlement rows — the two mirrors that prove payment rows, not status labels, are the ledger of record. The close ends on the tie-out: the GL must read **181,080 against 181,080**, delta zero, with the network opex roll-up footed at 25,416 — {emerald:the close ships} or tomorrow starts with an owner conference call.",
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
  ],
};
