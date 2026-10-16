// Radisson — Wave-10 (Task 100-radisson), travel domain, 0 tagged LC — theme-curated;
// facts from scripts/company-facts.md. Brand-ladder + loyalty-occupancy angle: the
// Park Plaza → Radisson Blu → Radisson Collection ladder read as rate-point economics
// (volume step vs upper ladder vs the honestly-empty premium tip) and the Radisson
// Rewards ladder read at stay-count grain (elite 5+ stays vs core 2-4 vs single) —
// deliberately distinct from hilton (property portfolio/Honors, operator audits),
// hyatt (flag families, group-vs-transient, no-show policy) and accor (asset-light
// Ibis-to-Sofitel fee book). Radisson has NO registry tags in this app's pools —
// 0 tagged LC — theme-curated: every topic and problem slug comes from
// scripts/company-pools.md's theme menu (sql rows only, no w*/d*/f* rows), mirroring
// the workflows Radisson screens are known to probe (stay-state funnels, two-grain
// market censuses, folio-line folds, rate-ladder CASE bands, Rewards ladders,
// settlement coverage). Case studies run on the storefront db with probed figures
// from scripts/company-facts.md — mapped honestly as orders=stays/booked
// reservations, order_items=folio lines (quantity = room-nights, unit_price = posted
// rate), products=room types/brands, customers=Rewards guests (region = market),
// suppliers=owner/franchise partners (the asset-light counterparties),
// invoices=folio billing statements, payments=payment rails (card vs wire),
// expenses=property opex, ledger_entries=GL; shipped_at=check-in stamp; finance
// tables store INTEGER cents (dollar read = amount_cents / 100.0); orders.total and
// order_items.unit_price are REAL dollars. Case figures probe-verified 2026-10-16
// against a readonly copy of db/custom.db; every case slot mechanically audited by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const radissonKit: CompanyKit = {
  id: "radisson",
  domainId: "travel",
  name: "Radisson",
  tagline: "The Blu ladder and the Rewards book",
  accent: "text-amber-300",

  brief: [
    "**Radisson** is the international hotel group that runs a two-speed ladder under one Rewards roof — the **Park Plaza → Radisson Blu → Radisson Collection** ladder, with Park Plaza as the volume step, Blu as the upper-upscale core that carries the network and Collection as the premium tip — wrapped in an asset-light franchise and management model where owner partners hold the keys and Radisson holds the brand, the rate card and the loyalty book. This kit maps the storefront db onto that world: the 16 customers rows are Rewards guests, the 103 orders are stays worth **34,833.28**, and the 251 order_items rows are folio lines — quantity = room-nights, unit_price = posted rate. The status map is fixed: delivered = {emerald:checked-out} (52, 50.5%), shipped = {sky:in-house} with shipped_at as the check-in stamp (30, 29.1%), pending = awaiting arrival (14), cancelled (7, 6.8%).",
    "The data org reads the ladder the way the P&L is cut. Revenue management owns the rate card: **338.19** per stay network-wide, 383.48 in the richest market on only 19 stays, 335.32 in the busiest on 45 — and the rate-point fold splits the folio cleanly: 268 room-nights post below the 55 line at a 31.01 average, 230 post above at 115.85, and the premium tip is empty at the **199.99** ceiling — the Collection arm is a definition, not a row. The loyalty desk owns the {sky:Radisson Rewards} read at stay-count grain: the five guests with 5-plus stays hold **24,789.63 — 71.2% of the book** — while the 3,000-plus spend tier reaches only 63.5%, so ladder depth, not rate, is what the concentration story runs on. Owner money moves separately: 28 folio statements and 27 payments in INTEGER cents, where every dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator, hotel-flavored. A loop opens with a **two-grain market census** — EU runs 45 stays from 8 guests (intensity 5.6) while the US runs 19 from 2 (9.5) — then hits the folio fan-out, where `COUNT(*)` after the join counts 251 folio lines and calls them stays. It escalates into the Rewards ladder and the rank-semantics argument (the guest ladder runs **24, 17, 14, 13, 5** with a four-way tie at 4), and into a rate question where the denominator is the whole test. The traps are stated out loud here: every guest and every room product has transacted, so anti-join drills return a **confident zero**, and the rate ceiling sits at 199.99, so any premium-band filter comes back empty *by construction* — proving the zero is the job, not a bug.",
    "Preparation strategy: the pools file carries no Radisson section — 0 tagged rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: stay-state funnels, two-grain censuses, folio-line folds, rate-ladder CASE bands, Rewards ladders and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the **rate-ladder census** revenue management prices the ladder with, the other rebuilds the **Rewards loyalty ladder** the loyalty desk boards quarterly. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every band fold reconcile to the 34,833.28 book it claims to summarize.",
  ],

  dayInLife: [
    "**08:15 —** The day opens with the occupancy board. A revenue analyst refreshes the stay census before the operations standup: 52 checked-out, 30 in-house, 14 awaiting arrival, 7 cancelled — **103 by construction**, or the board ships with an incident attached. The check-in watch runs next: **82 stamped stays** averaging **2.98 days** booking-to-check-in, and any drift off the 2-to-4 band pulls the arrival queue before the pace curve goes out. The per-market occupancy column prints beside its denominators — EU 36 of 45 stamped, APAC 29 of 37, US 15 of 19, LATAM 2 of 2 — because *an occupancy share without its denominator is a rumor, not a rate*.",
    "**11:30 —** Midday is ladder work. The loyalty desk wants the {sky:Radisson Rewards} board re-cut at stay-count grain — the five 5-plus-stay guests and their **71.2%** of folio value, with the four-way tie at 4 stays handled by a named rank policy; revenue management wants the rate-ladder mix refreshed — **268 room-nights at a 31.01 average posted rate** below the 55 line against 230 at 115.85 above it, the premium tip reported as honestly empty; and the franchise desk wants intensity beside coverage (EU 45 stays from 8 guests against the US's 19 from 2) for the owner call. Each ask is a fold-then-band: *tier the guest, never the stay* — banding raw stay rows silently re-weights the ladder toward the heaviest folios.",
    "**15:30 —** The afternoon belongs to owner money. The AR anti-join refreshes first — **6 never-settled fee statements worth 15,217** — before a single dunning letter goes out; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 — a partial that no SUM may call settled) and feeds the cash-flow draft. Then the anomaly walk, line by line: statement #11 sits {rose:void} yet carries a 925 settlement, and #28 claims paid with zero settlement rows — the two mirrors that prove payment rows, not status labels, are the ledger of record. The close ends on the tie-out: the GL must read **181,080 against 181,080**, delta zero, with the property opex roll-up footed at 25,416 — {emerald:the close ships} or tomorrow starts with an owner conference call.",
  ],

  metrics: [
    { name: "Occupancy share", what: "Stays with a check-in stamp (checked-out or in-house) over all booked — 82 of 103, 79.6%. Per market: LATAM 2 of 2, EU 36 of 45, US 15 of 19, APAC 29 of 37. The state-free read that keeps awaiting-arrival and cancelled rows in the denominator where they belong." },
    { name: "Booking-to-check-in lead", what: "julianday(check-in) minus julianday(booking) on the 82 stamped stays — 2.98 days average, range 2 to 4. The window a pre-arrival upsell or a Rewards upgrade offer actually has." },
    { name: "ADR-style stay value", what: "Average stay value — 338.19 network, 383.48 in the richest market (19 stays), 335.32 in the busiest (45), 426.22 in LATAM on only 2. Rate-mix shifts show up here before any rate-card review; small-N markets get flagged, not hidden." },
    { name: "Rewards concentration", what: "Share of folio value from guests with 5-plus stays — the five-member elite ladder holds 24,789.63, which is 71.2% of the 34,833.28 book. The 3,000-plus spend tier reaches only 63.5% — ladder depth, not rate, drives the concentration." },
    { name: "Room-nights per stay", what: "498 room-nights across 251 folio lines over 103 stays — 2.44 lines and about 4.8 nights per stay. A folio line is a night, not a reservation; every census states which grain it counts." },
    { name: "Rate-ladder mix", what: "268 room-nights post below the 55 rate line at a 31.01 average; 230 post above at 115.85. The volume step carries more nights at under a third of the rate — and the premium tip (200-plus) is empty at the 199.99 ceiling." },
    { name: "Cancellation share", what: "Cancelled reservations over booked — 7 of 103 (6.8%) network, sliced by market: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The haircut every pace forecast carries explicitly; hidden cancellations flatter occupancy and rot the forecast." },
    { name: "Folio settlement coverage", what: "Owner statements classified exact, partial or none against their settlement rows — 21 exact, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. Rails split card (16 legs, 37,364) from wire (11, 32,248); the fee desk refreshes this every close." },
  ],

  topics: [
    {
      name: "Stay-state funnels",
      why: "Every Radisson screen opens with the reservation lifecycle: booked, checked-in (shipped_at stamped), checked-out, cancelled. Each stage is a conditional count over a status or timestamp, and the first question out loud is what the denominator holds. The trap is calling an in-house stay 'checked-out' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Stays and guests are different grains of the same join, and every market census here reports both: EU runs 45 stays from 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is demand and which is installed base — is the habit being graded. The intensity ratio between them is the franchise-development read.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers"],
    },
    {
      name: "Folio-line folds",
      why: "Every portfolio read folds folio lines to stay grain: room-nights, value and DISTINCT stays per room product — 251 lines over 103 stays, 498 room-nights, and the fold that survives is the one that deduplicates. Line-grain counts silently multiply per-stay demand and are the classic fan-out trap in hotel reporting.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Guest enrichment joins",
      why: "Guests carry market and join date; stays inherit them through joins, and the join type decides who survives. A stay without a guest is corruption; a guest without stays is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus"],
    },
    {
      name: "Rate-ladder CASE bands",
      why: "The Park Plaza → Blu → Collection ladder is a CASE classification over posted rate — 268 room-nights below the 55 line, 230 above, premium tip empty at 199.99. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the rate card, and a reordered WHEN quietly re-bands the book.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "Rewards ladders & rank ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the guest ladder runs 24, 17, 14, 13, 5 and then four guests sit tied at 4 stays. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a loyalty policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Pace & calendar spines",
      why: "The 14-month stay spine (2024-01 to 2025-02) is the pace board's home turf: month buckets via SUBSTR(created_at,1,7), the 3,731.97 January open, the 1,193.86 July trough carrying 2 of the 7 cancellations, and half-open date windows that don't drop the last night of a season.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020"],
    },
    {
      name: "Folio billing & cents discipline",
      why: "Checked-out is not settled — the finance tables (28 statements, 27 payments, INTEGER cents) are where the portfolio meets owner money. Every dollar read is amount_cents / 100.0, uniform 30-day terms make aging a date walk, and the settlement clock reads 28.4 days average over the 20 paid statements that carry legs.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Settlement coverage anti-joins",
      why: "The fee desk's daily read is statements without settlements: 6 worth 15,217, plus the mirrors — a void statement WITH a settlement row and a paid-status statement with none. LEFT JOIN + IS NULL (and the NOT EXISTS twin) is the shape, and the coverage split 21 / 1 / 6 is its report.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "One-pass occupancy censuses",
      why: "The ops board gets checked-out, in-house, awaiting and cancelled in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift out of reconciliation.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
  ],

  theory: [
    {
      id: "radisson-t1",
      q: "Your portfolio report joins guests to stays, then folio lines for room-night detail. Walk me through where that join chain can silently change grain — and when you would INNER versus LEFT.",
      a: "Grain changes at every hop, so I name the grain out loud before writing SQL. Guests to stays is one row per stay — 103 rows on this db. Stays to folio lines fans out to 251, and the moment that join lands, COUNT(*) counts folio lines and calls them stays; SUM of the stay total double-counts unless I fold to stay grain first with a DISTINCT or a pre-aggregated CTE. The business read decides the join type: a stay report INNER-joins guests because a stay with no guest is corruption — worth a data-quality flag, not a silent inner. A whitespace report must LEFT-join from guests, because guests with no stays ARE the answer — they arrive with NULL stay columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload guest row and the LEFT quietly became an INNER — the predicate moves into ON or an outer query. On this db the never-stayed anti-join returns a confident zero (all 16 guests have transacted), and proving that zero is the analyst's job, not an accident to shrug at.",
      tag: "joins",
    },
    {
      id: "radisson-t2",
      q: "The Rewards board ranks guests by stays, and the ladder runs 24, 17, 14, 13, 5 with four guests tied at 4. RANK, DENSE_RANK or ROW_NUMBER — who decides, and what does each print?",
      a: "The rank trio is a loyalty policy, not a syntax pick, and the interviewer wants me to say that out loud. RANK gives tied counts the same rung and then skips: the four-way tie at 4 consumes ranks 6 through 9, so the two guests at 3 stays both print rank 10 — implying five phantom rungs that do not exist. DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits the tie arbitrarily — a silent judgment call about which guest's stay gets the elite-night credit, which is exactly the kind of decision that should be made by a stated tie-breaker like created_at, then id, not by the engine's mood. For a Radisson Rewards board I would default to RANK (shared credit, honest gaps) or DENSE_RANK when the deck counts tier membership rather than positions, and write the chosen policy in the query comment. The wrong answer is picking a function; the right answer is picking a policy and naming it on the slide.",
      tag: "windows",
    },
    {
      id: "radisson-t3",
      q: "The census says EU ran 45 stays from 8 guests worth 15,089.23, and the US ran 19 stays from 2 guests. Why do analysts report both counts, and what does the ratio tell the franchise team?",
      a: "They disagree because they count at different grains. COUNT(*) counts stay rows after the join — one row per stay, so a guest with 24 stays contributes 24. COUNT(DISTINCT customer_id) folds those rows back to guests — EU's 45 stays collapse to 8 guests. Neither is wrong: stays measure load and room-night momentum, guests measure installed base and coverage. The ratio — 5.6 stays per guest in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening across the Rewards book or concentrating in a handful of heavy folios. The trap that catches candidates is a third grain: join order_items for folio detail and COUNT(*) silently counts folio lines — 251 of them, or 498 room-nights if you sum quantity. Saying 'one row per what?' for every COUNT is the habit the panel grades, and the occupancy read adds a fourth: only the 82 stamped stays can be occupied at all.",
      tag: "aggregation",
    },
    {
      id: "radisson-t4",
      q: "shipped_at is NULL until a guest actually checks in. What is your policy for the occupancy and lead-time reports, and how do NULLs behave in the aggregates they use?",
      a: "Policy first: only checked-in stays — the 52 checked-out plus 30 in-house — have a check-in stamp, so occupancy counts the 82 of 103 booked stays that carry shipped_at and says so in the title; the 14 awaiting arrival have no stamp yet and no latency to average. Then mechanics: AVG ignores NULLs, so AVG over ALL stays returns the stamped-only average — 2.98 days, range 2 to 4 — over a silently shrunken population, a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 cancelled rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day check-ins for guests who have not arrived. And the cancelled rows are data, not noise: they stay visible in the census because hidden cancellations flatter occupancy and rot the pace forecast. A report whose WHERE clause does definitional work without saying so is what a Radisson reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "radisson-t5",
      q: "Revenue management wants folio lines posting below the 55 rate line, but only room-product families carrying at least ten nights. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The 55 rate line is a row-level fact — unit_price < 55 discards upper-ladder lines before any fold, in WHERE; putting it in HAVING is impossible because unit_price no longer exists once rows are grouped. The ten-night floor is a group-level fact — HAVING SUM(quantity) >= 10 after GROUP BY; putting it in WHERE errors because SUM does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a rate-card line and an error, and between a threshold applied to posted rates versus to room-nights. The strong answer places every filter by asking: is this a fact about one folio line, or about a folded group? On this db the two rules interact: the volume step carries 268 room-nights at a 31.01 average, so a HAVING floor on nights keeps it while a WHERE floor on rate defines it — mix the clauses and the ladder reports a different book.",
      tag: "pipeline",
    },
    {
      id: "radisson-t6",
      q: "The Rewards board computes each band's share of folio value with a scalar subquery over the staged bands. What is that subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison — here the whole-book SUM(folio_value) every band divides by; zero rows return NULL — not an error — and value / NULL is UNKNOWN, so the entire share column silently turns NULL while the query keeps printing rows and looking valid. On the full table that is theoretical: 103 stays always produce a book total (34,833.28, and the elite band's cut reads 71.2). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and a share column is exactly where it hides, because a NULL share looks like a formatting problem, not a broken denominator. The correlated cousin (compare each guest to ITS market's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted — the elite ladder only means something next to the book it is 71.2% of.",
      tag: "subqueries",
    },
    {
      id: "radisson-t7",
      q: "The pace report buckets stays by month on TEXT timestamps, and the lead-time column walks booking to check-in. How do you build the spine, cut a season without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the pace curve becomes fiction. The season window: half-open intervals — created_at >= '2024-06-01' AND created_at < '2024-09-01' — because BETWEEN '2024-08-31' silently drops the last night's bookings, and season-end is exactly when group folios land. The lead: julianday(shipped_at) - julianday(created_at) over the 82 stamped stays only, averaging 2.98 days — unstamped rows have no latency and must NULL out, not fabricate. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this book the curve opens at 3,731.97 in January and troughs at 1,193.86 in July with 2 of the 7 cancellations — the pace story and the cancellation haircut belong on the same slide.",
      tag: "dates",
    },
    {
      id: "radisson-t8",
      q: "Finance says an owner statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked paid with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage split must read 21 exact / 1 partial (4,000 of 6,148 — a partial no SUM may call settled) / 6 never-settled, and the five split-settlement statements fold per statement before any join or they double-count. The money rule: statements and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. The close's assertion: the GL trial balance lands at 181,080 debits against 181,080 credits, delta zero — or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "radisson-mcq-1",
      prompt: "A stay row's status reads 'shipped'. In this kit's Radisson stage map, what happened?",
      choices: ["In-house — the guest checked in and has not checked out yet", "Checked-out — the stay completed and the folio is final", "Cancelled — the reservation was released", "Awaiting arrival — the guest has not checked in"],
      answer: 0,
      why: "The stage map is fixed: shipped = in-house with shipped_at as the check-in stamp (30 of 103 stays, 29.1%). It is the only status where the guest is on property right now.",
      notes: [
        { choice: 1, why: "Checked-out is 'delivered' — 52 stays at term end. Calling the 30 in-house stays checked-out inflates the completion count before a single folio closes." },
        { choice: 3, why: "Awaiting arrival is 'pending' — 14 stays with no check-in stamp yet. Pending is not cancelled and not occupied; it is 'not yet', and it stays in the occupancy denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-2",
      prompt: "Occupancy share is stamped stays ÷ which population? The db holds 82 stamped, 14 awaiting and 7 cancelled of 103 booked.",
      choices: ["Stamped + cancelled only (82/89 = 92.1%)", "All booked reservations (82/103 = 79.6%)", "Checked-out stays only (52/82)", "Distinct guests (82/16)"],
      answer: 1,
      why: "The house definition: stamped ÷ ALL booked — awaiting-arrival stays stay in the denominator because 'not yet arrived' is exactly what the occupancy funnel watches. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 awaiting inflates the rate to 92.1% by deleting the population still in the booking window — the rows the arrival queue exists to work." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — checked-out is completion, stamped is occupancy. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-3",
      prompt: "You join stays to their folio lines and COUNT(*) prints 251. What did you count?",
      choices: ["Folio lines — room-nights at line grain", "Stays — 103 reservations booked", "Room-nights — 498 across all folios", "Guests — 16 Rewards members"],
      answer: 0,
      why: "The join fanned out to line grain: 103 stays carry 251 folio lines, and COUNT(*) after the join counts lines, not stays. Sum the quantity column and you get the 498 room-nights.",
      notes: [
        { choice: 1, why: "103 is the stay count BEFORE the join. After joining folio lines, COUNT(*) reads line grain — reporting 251 as 'stays' overstates demand 2.4x." },
        { choice: 2, why: "498 needs SUM(quantity), not COUNT(*) — quantity is the room-nights per line. COUNT only ever counts rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled stays only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the cancellation share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the cancellation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-5",
      prompt: "Keep only Rewards guests carrying at least 5 stays — the elite ladder edge. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 5, before GROUP BY", "GROUP BY guest HAVING COUNT(*) >= 5", "WHERE stays >= 5 on the raw orders table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A stay-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db exactly five guests clear the 5-stay edge — the 24, 17, 14, 13 and 5-stay ladder — holding 71.2% of folio value.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'stays' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-6",
      prompt: "The guest ladder runs 24, 17, 14, 13, 5 stays, then FOUR guests tie at 4. Under RANK, what rank do the two 3-stay guests carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-stay guests share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The Rewards board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-7",
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
      id: "radisson-mcq-8",
      prompt: "A staging-table dunning list uses statement_id NOT IN (SELECT invoice_id FROM payments WHERE amount_cents > 0) and returns ZERO rows. First suspicion?",
      choices: ["Every statement genuinely has a settlement — the zero is correct", "One NULL invoice_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the dunning list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every settlement carries an invoice_id. But staging extracts are exactly where NULLs sneak in, and an empty dunning list is the most expensive kind of silent failure." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-9",
      prompt: "A dashboard walks folio value stay by stay: SUM(total) OVER (ORDER BY created_at). Two stays share a created_at second, and the cumulative 'jumps two stays at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at stay grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-10",
      prompt: "A Rewards banding reads CASE WHEN stays >= 2 THEN 'core' WHEN stays >= 5 THEN 'elite' ELSE 'single' END. What lands in 'core'?",
      choices: ["Only the 2-to-4-stay guests — 9 of 16", "Everyone with 2 or more stays — the five elite guests (5-plus stays) are unreachable", "Only the 5-plus-stay guests — the elite arm captures the core", "Nothing — the CASE is a syntax error"],
      answer: 1,
      why: "CASE arms fire top-down: the >= 2 arm catches every repeat guest before the >= 5 arm is ever tested, so the five elite-ladder guests (24, 17, 14, 13 and 5 stays — 71.2% of the book) mis-band as core. Ordered arms are a correctness rule, not a style preference.",
      notes: [
        { choice: 0, why: "That is what the correctly ordered CASE returns. With the arms reversed, the 2-4 band and the elite band merge into one 14-guest 'core' — the ladder the loyalty desk boards from no longer exists." },
        { choice: 3, why: "The query is perfectly legal — silent mis-banding is the failure mode, not a crash. The board still renders, one tier wrong." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-radisson-1",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The rate-ladder census",
      brief:
        "Radisson-flavored brief on the storefront db: revenue management's rate-card review opens with the two-step ladder — every folio line classified by its posted rate, below the 55 line (the volume step, the Park Plaza-style room-night engine) versus at-or-above it (the upper ladder, the Blu/Collection-style rate book). Probed facts: 251 folio lines carry 498 room-nights across the 34,833.28 book; the volume step folds to 268 room-nights at a 31.01 average posted rate; the upper ladder folds to 230 room-nights at 115.85; the premium tip (200-plus) is empty at the 199.99 ceiling. The review reads the biggest room-night arm first.",
      ask: "Return each rate band with its room-nights and average posted rate to 2 decimals, biggest room-night count first.",
      template:
        "SELECT CASE WHEN unit_price < {1} THEN {2} ELSE 'upper_ladder' END AS rate_band,\n       SUM(quantity) AS room_nights,\n       ROUND(AVG(unit_price), {3}) AS avg_rate\nFROM order_items\nGROUP BY rate_band\nORDER BY room_nights {4};",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the rate line",
          why: "The published rate line is 55: 268 room-nights post below it at a 31.01 average, 230 above at 115.85. It is a threshold constant that never appears as a result cell, so the value check is waived — but move it and the ladder splits somewhere else entirely.",
        },
        {
          answer: "'volume_step'",
          kind: "keyword",
          label: "the volume-arm label",
          why: "The volume step is the sub-55 arm — the Park Plaza-style room-night engine carrying 268 nights at 31.01. Any other label renames the arm and the rate-card review reads a ladder with a tier that does not exist.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Posted rates report to 2 decimals — 31.01 and 115.85, matching the rate card's cents precision. ROUND to 1 prints 31.0 and the volume arm stops reconciling with the folio value the finance deck foots.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "nights-first direction",
          why: "The review reads the biggest room-night arm on top: the volume step's 268 over the upper ladder's 230. ASC would open the meeting on the 230-night arm — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'blu_core'", "1", "ASC", "MAX"],
      walkthrough:
        "One scan, one CASE fold, two arms. The CASE splits every folio line at the 55 posted-rate line, GROUP BY folds the two arms, and the board reads: volume_step 268 room-nights at a 31.01 average posted rate, upper_ladder 230 at 115.85 — the probed rate-ladder cells, footed against the 498 room-nights and 34,833.28 book. The premium tip is reported as honestly empty: nothing posts at 200-plus under the 199.99 ceiling, so the Collection arm is a definition, not a row. The distractors fail honestly: 'blu_core' renames the volume arm and the review debates a tier nobody published; 1 moves the rate line below the cheapest folio line, the volume arm empties and the ladder collapses to one blended 498-night row at a blended rate; 1 in the precision slot truncates 31.01 to 31.0 and the arm drifts off the cents-precision rate card; ASC flips the board so the 230-night upper ladder opens the meeting; MAX breaks the query outright. The read is the mix: the volume step carries more nights at under a third of the upper ladder's rate — that ratio, not the headline ADR, is what the ladder is priced to manage.",
    },
    {
      id: "cs-radisson-2",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The Rewards loyalty ladder",
      brief:
        "Radisson-flavored brief on the storefront db: the loyalty desk boards the Rewards ladder at stay-count grain, not spend grain — fold each guest's stays first, then band: elite ladder at 5-plus stays, core Rewards at 2-to-4, single stay below. Probed facts: 16 guests fold from 103 stays worth 34,833.28; the elite ladder is exactly five guests (the 24, 17, 14, 13 and 5-stay ladder) holding 24,789.63 — a 71.2 share of the book; core Rewards is 9 guests holding 8,893.46 (25.5); single stay is 2 guests holding 1,150.19 (3.3). Each band's share is its cut of the whole book. Read the biggest folio first.",
      ask: "Return each Rewards band with its guest count, folio value to 2 decimals and its share of the whole book to 1 decimal, biggest folio value first.",
      template:
        "WITH guest_book AS (\n  SELECT customer_id,\n         COUNT(*) AS stays,\n         SUM(total) AS folio_value\n  FROM orders\n  GROUP BY customer_id\n),\nbanded AS (\n  SELECT CASE WHEN stays >= {1} THEN 'elite_ladder'\n              WHEN stays >= {2} THEN {3}\n              ELSE 'single_stay' END AS rewards_band,\n         folio_value\n  FROM guest_book\n)\nSELECT rewards_band,\n       COUNT(*) AS guests,\n       ROUND(SUM(folio_value), 2) AS folio_value,\n       ROUND(100.0 * SUM(folio_value) / (SELECT SUM(folio_value) FROM banded), 1) AS book_share\nFROM banded\nGROUP BY rewards_band\nORDER BY folio_value {4};",
      slots: [
        {
          answer: "5",
          kind: "number",
          label: "the elite edge",
          why: "The elite ladder starts at 5 stays — exactly the five guests on the 24, 17, 14, 13, 5 ladder, and their band row prints guests = 5. Move the edge to 1 and all 16 guests land elite; to 6 and the 5-stay guest falls out of the tier the desk boards from.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the repeat edge",
          why: "Core Rewards starts at the second stay — the loyalty line between one-time and repeat. The single_stay band it leaves behind prints guests = 2, and 9 guests hold the 2-to-4 middle carrying 8,893.46.",
        },
        {
          answer: "'core_rewards'",
          kind: "keyword",
          label: "the mid-band label",
          why: "The 2-to-4-stay band is the core Rewards middle — 9 guests, 8,893.46, a 25.5 book share. Any other label renames the band the loyalty desk boards from, and the ladder stops matching the published program.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-book-first direction",
          why: "The board reads the biggest folio on top: elite 24,789.63, core 8,893.46, single 1,150.19. ASC would open the meeting on the two single-stay guests — the smallest row of the smallest band.",
        },
      ],
      distractors: ["ASC", "'elite_ladder'", "1", "folio_value"],
      walkthrough:
        "Two stages, then a share. The guest_book CTE folds 103 stays to 16 guests at guest grain — because tiering raw stay rows tiers folio lines, not people — and the banded CTE lays down the Rewards ladder: 5-plus stays is elite, 2-to-4 is core, single stay below. The outer fold prints elite_ladder 5 guests / 24,789.63 / 71.2, core_rewards 9 / 8,893.46 / 25.5, single_stay 2 / 1,150.19 / 3.3 — each band's share divided by the whole-book scalar subquery, footed to the 34,833.28 book. The loyalty punchline is structural: the 5-plus-stay band and the 2,000-plus spend band select the SAME five guests, so ladder depth and spend concentration are one story told at two grains. The distractors fail honestly: 1 at the elite edge bands all 16 guests elite and the ladder collapses to one 100-share row; 1 at the repeat edge empties single_stay into core; 'elite_ladder' in the mid-band slot makes the core arm unreachable — every repeat guest labels elite and the tier the desk boards from vanishes; folio_value in an edge slot compares stay counts against dollar folios (stays top out at 24, folios start at 444.80, so the comparison can never fire) and in the label slot renames bands to dollar figures; ASC flips the board onto the 2-guest single band. Two named edges, ordered arms, one honest denominator — that is the whole board.",
    },
  ],

  problems: [
    { slug: "immediate-food-delivery-ii", why: "Stays that checked in on the promised day versus late ones — the pre-arrival SLA read is a conditional rate over a timestamp comparison, the same shape as Radisson's arrival-promise tracking." },
    { slug: "product-sales-analysis-i", why: "Folio lines beside their room products: rate, nights and product id at line grain — the first join every folio read makes before any fold to stay grain." },
    { slug: "sales-person", why: "Which owner partners actually carry folio activity versus the bench that sits empty — the LEFT JOIN survival audit the franchise desk runs before every owner call." },
    { slug: "confirmation-rate", why: "The share of reservations that confirm by market — a per-key conditional ratio with the denominator spelled out, exactly the occupancy-rate discipline." },
    { slug: "game-play-analysis-iv", why: "The first-day check-in share of newly booked reservations — day-one conversion is how the arrival funnel measures whether a booked guest actually shows up." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Thresholded group folds: which guests or owner partners carry at least N records. Radisson reframes it as 'which owner partners carry at least five active folios'." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Folio lines whose room-nights beat the platform-average stay — a two-stage fold (compute the mean, then filter against it) mirroring the long-stay screen." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Sequence logic over folio lines: guests who took the room block but not the F&B attach — the cross-sell gap analysis the upsell calendar is built from." },
    { slug: "second-highest-salary", why: "Second-position reads on the Rewards ladder — the runner-up folio, not the MAX. Radisson boards ask for the tier below the top without LIMIT-1 fragility." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heaviest booker read: which guest carries the most stays — the 24-stay anchor of the Rewards ladder, computed with a tie-safe argmax." },
    { slug: "fix-names-in-a-table", why: "Guest-name hygiene before any join: owner-partner and guest exports arrive case-broken, and 'Park Plaza' versus 'park plaza' silently splits one partner into two." },
    { slug: "total-traveled-distance", why: "Per-guest folded totals with reporting gaps folded honestly — SUM over the stays each guest actually generated, the folio-value rollup's practice shape." },
    { slug: "triangle-judgement", why: "One-pass classification with CASE: rate bands, stay states and Rewards tiers are all row-level CASE calls that must partition the base without holes." },
    { slug: "team-scores-in-football-tournament", why: "Stacked home-and-away folds — the group-vs-transient mix read, where a market's booked folio splits by segment across two populations in one query." },
    { slug: "students-and-examinations", why: "Attendance-style cross-folds: which guests touched which room-product families in a window — the F&B and ancillary attach matrix at market grain." },
    { slug: "top-travellers", why: "The Rewards ladder itself: guests ranked by folio value with NULLs and ties handled honestly — the leaderboard the loyalty desk publishes every quarter." },
  ],
};
