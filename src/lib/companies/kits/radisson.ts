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
    "Preparation strategy: the pools file carries no Radisson section — 0 tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: stay-state funnels, two-grain censuses, folio-line folds, rate-ladder CASE bands, Rewards ladders and the cents-safe settlement spine. Do the topics in order — they are built for spaced practice rather than one sitting — then run the six case studies on the live storefront db: the **rate-ladder census** revenue management prices the ladder with and the **Rewards loyalty ladder** the loyalty desk boards quarterly, plus the Rewards value ladder, the payment-rail settlement split, the pace-and-cancellation spine and the family fold board for the later rounds. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction, and every band fold reconcile to the 34,833.28 book it claims to summarize.",
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
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "consecutive-available-seats", "consecutive-available-seats-ii"],
    },
    {
      name: "Two-grain market censuses",
      why: "Stays and guests are different grains of the same join, and every market census here reports both: EU runs 45 stays from 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying which column is demand and which is installed base — is the habit being graded. The intensity ratio between them is the franchise-development read.",
      slugs: ["daily-leads-and-partners", "unique-orders-and-customers-per-month", "number-of-rich-customers", "immediate-food-delivery-ii", "confirmation-rate", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Folio-line folds",
      why: "Every portfolio read folds folio lines to stay grain: room-nights, value and DISTINCT stays per room product — 251 lines over 103 stays, 498 room-nights, and the fold that survives is the one that deduplicates. Line-grain counts silently multiply per-stay demand and are the classic fan-out trap in hotel reporting.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer", "average-selling-price", "basket-depth-aov", "transactions-per-visit-histogram", "managers-with-at-least-5-direct-reports", "fix-names-in-a-table"],
    },
    {
      name: "Guest enrichment joins",
      why: "Guests carry market and join date; stays inherit them through joins, and the join type decides who survives. A stay without a guest is corruption; a guest without stays is whitespace — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employee-bonus", "product-sales-analysis-i", "sales-person", "game-play-analysis-iv", "total-traveled-distance", "students-and-examinations"],
    },
    {
      name: "Rate-ladder CASE bands",
      why: "The Park Plaza → Blu → Collection ladder is a CASE classification over posted rate — 268 room-nights below the 55 line, 230 above, premium tip empty at 199.99. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the rate card, and a reordered WHEN quietly re-bands the book.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "count-salary-categories", "spend-histogram", "triangle-judgement", "team-scores-in-football-tournament"],
    },
    {
      name: "Rewards ladders & rank ties",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — the guest ladder runs 24, 17, 14, 13, 5 and then four guests sit tied at 4 stays. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a loyalty policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "repeat-purchase-rate", "rfm-segmentation", "customers-with-strictly-increasing-purchases", "second-highest-salary", "customer-placing-the-largest-number-of-orders", "top-travellers"],
    },
    {
      name: "Pace & calendar spines",
      why: "The 14-month stay spine (2024-01 to 2025-02) is the pace board's home turf: month buckets via SUBSTR(created_at,1,7), the 3,731.97 January open, the 1,193.86 July trough carrying 2 of the 7 cancellations, and half-open date windows that don't drop the last night of a season.",
      slugs: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "calculate-orders-within-each-interval", "cohort-retention-matrix"],
    },
    {
      name: "Folio billing & cents discipline",
      why: "Checked-out is not settled — the finance tables (28 statements, 27 payments, INTEGER cents) are where the portfolio meets owner money. Every dollar read is amount_cents / 100.0, uniform 30-day terms make aging a date walk, and the settlement clock reads 28.4 days average over the 20 paid statements that carry legs.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule", "prepayment-detection", "generate-the-invoice"],
    },
    {
      name: "Settlement coverage anti-joins",
      why: "The fee desk's daily read is statements without settlements: 6 worth 15,217, plus the mirrors — a void statement WITH a settlement row and a paid-status statement with none. LEFT JOIN + IS NULL (and the NOT EXISTS twin) is the shape, and the coverage split 21 / 1 / 6 is its report.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "dormant-reactivation", "winback-recovery", "customers-who-bought-a-and-b-not-c"],
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
    {
      id: "radisson-t9",
      q: "The rate-ladder CASE keeps growing — volume step, upper ladder, a Collection arm the rate card promises, seasonal promo bands. What are your rules for arm order, exhaustiveness, and who owns the ELSE?",
      a: "Arms are an ordered decision tree: specific-first, broad-last, because CASE stops at the first match and a broad arm placed early silently re-bands everything below it — a promo band before the upper-ladder arm swallows the 115.85 average folio lines and the ladder reports a book nobody priced. Exhaustiveness is proven by reconciliation, not inspection: the band fold must foot to the 498 room-nights and the 34,833.28 book, and a missing band shows up as a hole exactly the size of what nobody classified. The ELSE belongs to a named owner: I write ELSE 'unmapped' as a quarantine arm that pages the rate desk, rather than a silent catch-all that launders dirty rows into the biggest band. And the honest boundary ships with the ladder: the premium tip (200-plus) is empty at the 199.99 ceiling — the Collection arm is a definition, not a row, and saying so is part of the report.",
      tag: "case",
    },
    {
      id: "radisson-t10",
      q: "Stays to folio lines is 103 to 251, and SUM(quantity) says 498 room-nights. Where do you fold, where do you join, and how do you keep the census at stay grain?",
      a: "I fold line grain to stay grain first — a CTE that groups order_items by order_id into room-nights (SUM(quantity)) and folio value — and join downstream of that fold, so every query after it runs at reservation grain. Joins placed before the fold fan 103 into 251 and COUNT(*) starts counting folio lines while wearing a stay label; SUM of the stay total double-counts the same way. The diagnostic habit: before trusting any aggregate, run COUNT(*), COUNT(DISTINCT o.id) and SUM(oi.quantity) on the joined set — the three grains (lines, stays, nights) must each reconcile to 251, 103 and 498. The business sees the same failure as an occupancy question: a '45-stay market' that is really 45 folio lines overstates demand 2.4×, and the pace curve inherits the error. One row per what, stated before the join, is the whole defense.",
      tag: "joins",
    },
    {
      id: "radisson-t11",
      q: "Walk me through building the Rewards ladder with CTEs — the guest fold, the banding, the share. Where does each stage live and why stage it at all?",
      a: "Three stages, one definition each. The guest_book CTE folds 103 stays to 16 guests — COUNT(*) AS stays, SUM(total) AS folio_value — because tiering raw stay rows tiers folio lines, not people. The banded CTE lays the Rewards ladder over the fold: 5-plus stays elite, 2-to-4 core, single below — ordered arms, named bands, the desk's published policy in code. The outer SELECT folds per band and divides by the whole book with a scalar subquery, printing elite 5 guests / 24,789.63 / 71.2, core 9 / 8,893.46 / 25.5, single 2 / 1,150.19 / 3.3. Staging earns its keep three ways: the guest fold is testable against the 34,833.28 anchor in isolation, the band edges are visible and reviewable instead of buried in a nested query, and the share's denominator is written exactly once so nobody 'fixes' it per band. The failure I stage against is the single-pass version that bands rows — the ladder that quietly becomes a folio-line census.",
      tag: "ctes",
    },
    {
      id: "radisson-t12",
      q: "A '2.44 folio lines per stay' figure shipped last quarter and nobody trusts it. Walk the grain diagnosis.",
      a: "2.44 is not wrong, it is unnamed: 251 folio lines over 103 stays, a lines-per-stay ratio wearing a metric badge. The business questions behind it each have their own grain — occupancy is stays over booked (82 of 103 stamped), nights per stay is SUM(quantity) over stays (498 over 103, about 4.8), attach rate is per-stay boolean (did this reservation carry any non-room line) — and none of them is 2.44. The tell that a figure is grain-broken is that it can exceed its own denominator's universe while everyone still calls it a rate. My rule on this kit's data: numerator grain and denominator grain get named in the same sentence — room-nights over stays, guests over markets, lines over nights — or the number does not ship. The 2.44 becomes useful the moment it is titled honestly: lines per stay is the folio-complexity read the front-desk staffing model actually wants.",
      tag: "grain",
    },
    {
      id: "radisson-t13",
      q: "Why are half-open windows the house rule for season cuts on TEXT timestamps, and where does BETWEEN actually break a pace report?",
      a: "TEXT timestamps compare lexicographically, so created_at >= '2024-06-01' AND created_at < '2024-09-01' is a mathematically clean interval — every instant of the season, nothing from September, no edge case argued. BETWEEN '2024-06-01' AND '2024-08-31' includes the instant '2024-08-31' but not '2024-08-31T18:40:00', because the string '2024-08-31' sorts before any timestamped moment of that day — the season's last night vanishes silently, and season-end is exactly when group folios land. The half-open form also composes: adjacent seasons tile the year with no overlap and no gap, so the summer cut and the autumn cut reconcile against the same 103-stay book by construction. On the 14-month pace spine (2024-01 through 2025-02) every window I ship is [start, next-start), and the cut is stated in the report title — because a pace number without its window is a rumor.",
      tag: "dates",
    },
    {
      id: "radisson-t14",
      q: "The pace board wants the stay spine narrated. Walk the 14 months and name what the LAG discipline protects.",
      a: "The spine is SUBSTR(created_at, 1, 7) folded over stay count and folio value: it opens at 3,731.97 in January 2024, wobbles between 6 and 9 stays a month, and troughs in value at 1,193.86 in July — a month carrying 2 of the book's 7 cancellations, which is exactly the haircut the pace forecast has to show rather than hide. November is the second cancellation-heavy month (2 of 6 stays), and the window closes at 2,390.53 in February 2025. What the LAG discipline protects: the first row's prior value and delta are NULL by definition — baseline, never zero — so the curve never pretends January moved 'zero from nothing', and every month-over-movement on the board is computed inside the same window as the levels, so the walk and its deltas cannot disagree. The cancellation columns ride beside the pace columns on purpose: hidden cancellations flatter occupancy and rot the forecast, so they stay visible on the same slide.",
      tag: "dates",
    },
    {
      id: "radisson-t15",
      q: "When does a running total need PARTITION BY, and when must it not have one?",
      a: "The business question decides the fence. A portfolio folio walk — cumulative across every stay in booking order — must NOT carry a partition, because the story is the whole book compounding toward 34,833.28. A per-market walk — each region's book building inside the region — needs PARTITION BY region, or EU's rows carry the cumulative of every market booked before them and the last row of each partition stops being that market's book. The silent partner is the frame: with ORDER BY the default frame is RANGE, so rows tied on the ordering key enter the walk together, and at stay grain ties on created_at are guaranteed — I write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW when the walk must be strictly row-by-row. My test before shipping: the last row of each partition must equal the number a plain GROUP BY produces, and the unpartitioned walk's last row must equal the whole book.",
      tag: "windows",
    },
    {
      id: "radisson-t16",
      q: "The published Rewards ladder must survive an audit rerun. How do you make ranking deterministic?",
      a: "Three commitments. First, a named tie-break inside the window: ORDER BY stays DESC, folio_value DESC, id — a business key first, then id as the final anchor, so the four guests tied at 4 stays always split the same way and the ladder reruns byte-identical. Second, the rank function is a stated policy, not a syntax pick: RANK shares rungs and skips (the four-way tie at 4 consumes ranks 6 through 9, the two 3-stay guests land on rank 10), DENSE_RANK shares without gaps, ROW_NUMBER splits ties by whatever the tie-break says — and the choice goes in the query comment because the Rewards ladder is a published benefits contract. Third, the output proves itself: the rung pattern is asserted against the known ladder — 24, 17, 14, 13, 5, then the tie block — before the board ships. A leaderboard that cannot reproduce itself is not a leaderboard; it is a screenshot.",
      tag: "windows",
    },
    {
      id: "radisson-t17",
      q: "Compare each stay to its GUEST's own average folio value. Write the shape and say what it costs.",
      a: "Two honest builds. The correlated subquery — WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-runs the guest fold once per outer row: conceptually simple, correct on any filter, and O(rows × guest-folds) unless the planner caches it, which is why it shows up in slow-query reviews. The window build — AVG(total) OVER (PARTITION BY customer_id) beside each row — folds each guest once in a single pass but cannot filter directly; you wrap it in an outer query, because window functions run after WHERE. Semantics differ at the edges: the window build includes the row itself in its own average, the correlated build can exclude it with an id predicate — and the interviewer wants that distinction named, because 'above their own usual rate' is a pre-arrival upsell trigger with a real revenue hook. On this db the question finds the anchor guests fast: against a 24-stay history, Alice Chen's priciest stays stand out in a way the 338.19 network average never shows.",
      tag: "subqueries",
    },
    {
      id: "radisson-t18",
      q: "Attach coverage: guests who booked the room family and the F&B-adjacent family but never the premium family. Why is NOT EXISTS the right negative test?",
      a: "The positive arms are reachability probes — EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.customer_id = c.id AND p.category = 'Audio') — one per family, ANDed. The negative arm is where the design decision lives: NOT IN (SELECT … category = 'Fitness') returns the whole report as empty the moment the subquery's column carries a single NULL, because x NOT IN (…) is UNKNOWN under three-valued logic; NOT EXISTS asks 'does even one row exist' and NULL rows simply do not qualify, which is the semantics the upsell calendar means. The same shape powers the never-stayed and never-settled reads — and on this db those return a confident zero, because every guest has transacted, which is precisely why the kit drills proving zeros instead of chasing them. Learning the EXISTS family once covers every 'find the cohort that did NOT' question a Radisson screen asks.",
      tag: "subqueries",
    },
    {
      id: "radisson-t19",
      q: "Brand and family literals: 'Park Plaza' versus 'park plaza', 'Audio' versus 'audio'. What is your hygiene for CASE arms and joins on TEXT?",
      a: "SQLite string comparison is case-sensitive by default, so 'audio' = 'Audio' is false — a lowercase literal in a CASE arm does not error, it silently reclassifies every line into ELSE, and the family board's headline column reads zero. My hygiene: literals are copied from the source table (SELECT DISTINCT category, SELECT DISTINCT name) into the query, never typed from memory; owner-partner and guest exports get a name-hygiene pass before any join, because 'Park Plaza' versus 'park plaza' silently splits one partner into two and the owner call double-counts; and ad-hoc case-insensitivity, if a vendor feed demands it, is an explicit COLLATE NOCASE at the join, written down as a data-contract exception rather than scattered LOWER() calls. GROUP_CONCAT gets the same discipline — the folded room-type manifest's casing and separator are staged deliberately. Text discipline is not cosmetics; it is what keeps a folio board from being a different report every Monday.",
      tag: "strings",
    },
    {
      id: "radisson-t20",
      q: "FILTER (WHERE …) versus SUM(CASE WHEN …): how do you choose for the occupancy board, and what drifts when it mixes them?",
      a: "Both compute conditional counts over one scan — 52 checked-out, 30 in-house, 14 awaiting, 7 cancelled either way, reconciling to 103 by construction. FILTER wins on readability when the arms are pure predicates: the occupancy census reads as four labeled aggregates instead of four nested CASEs, and the reconciliation identity sits visibly in one SELECT. SUM(CASE …) is the portable twin — same semantics on every engine, and the only choice when the branch transforms a value (SUM(CASE WHEN family = 'Audio' THEN room_nights ELSE 0 END)) rather than counting rows. The drift to police is mixing idioms across one board: two analysts, two spellings, one arm quietly counting pending into checked-out because the CASE arm's ELSE defaulted differently. My rule: one census, one idiom, and the four arms must sum to the 103 anchor before the board renders.",
      tag: "aggregation",
    },
    {
      id: "radisson-t21",
      q: "Build each Rewards band's share of the folio book. Where do the two aggregation levels live, and how do the shares prove themselves?",
      a: "Two levels, stacked — never one GROUP BY. The numerator folds per band at guest grain: the banded CTE's folio_value summed under GROUP BY rewards_band — elite 24,789.63, core 8,893.46, single 1,150.19. The denominator folds the whole book once: either a scalar subquery (SELECT SUM(folio_value) FROM banded) beside every band row, or the window form SUM(SUM(folio_value)) OVER () computed over the folded rows. Divide and round to one decimal: 71.2, 25.5, 3.3 — and the proof is that the shares foot to 100.0 within rounding, because both levels read the same 103-stay, 34,833.28 book. The failure modes are structural: collapsing both levels into one GROUP BY either errors or returns each band's share of itself, and building the denominator by joining orders a second time fans the guest grain out and quietly reweights every share toward the heavy folios.",
      tag: "aggregation",
    },
    {
      id: "radisson-t22",
      q: "In SQLite you can write HAVING band_folio > 10000 on a SELECT alias. What is actually happening, and why should you still know the standard pipeline order?",
      a: "SQLite resolves SELECT aliases inside HAVING as an extension, so the alias works — but the logical pipeline it extends is fixed: FROM builds rows, WHERE filters them, GROUP BY folds, HAVING filters the folded groups, SELECT names the outputs, ORDER BY sorts. Knowing the order is what lets you reason about what exists at each stage: a rate-line filter (unit_price < 55) is a row-level fact and lives in WHERE, a nights floor (SUM(quantity) >= 10) is a group-level fact and lives in HAVING, and window functions run after both, which is why a rank filter needs an outer query. The portability argument settles team debates: the alias-in-HAVING shortcut breaks the day the query moves to a stricter engine, so I write HAVING SUM(folio_value) > 10000 — the fold spelled out — even where the alias would work. The habit that gets graded: place every filter by asking whether it is a fact about one folio line or about a folded group, and let the clause follow the answer.",
      tag: "pipeline",
    },
    {
      id: "radisson-t23",
      q: "Your occupancy census sums to 102, not 103. Walk the reconciliation drill.",
      a: "The identity comes first: checked-out + in-house + awaiting + cancelled must equal COUNT(*) on orders — 52 + 30 + 14 + 7 = 103 — so a 102 means one row fell outside the arm set. Drill one: SELECT status, COUNT(*) and read the raw fold — a status literal outside the four expected values or a NULL status drops out of every arm and out of nothing else. Drill two: check for double-counting — the census scan joined folio lines and the fan-out added a row somewhere, which the COUNT(*) versus COUNT(DISTINCT id) diagnostic exposes. Drill three: prove the fix is definitional, not cosmetic — the arm set is extended or the quarantine row is flagged, and the identity is re-asserted before anything downstream ships. The same discipline closes the owner-money side: settlement coverage must read 21 exact / 1 partial / 6 never-settled over 28 statements, the GL trial balance must land 181,080 against 181,080, and the opex roll-up must foot at 25,416 — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "radisson-t24",
      q: "How do NULLs sort in ORDER BY, and where does that bite a hotel board?",
      a: "SQLite sorts NULLs first ascending and last descending — they are smaller than everything. On this db the bite lands wherever shipped_at is NULL: the 14 awaiting-arrival and 7 cancelled reservations jump the queue in any ASC-ordered arrivals list, so a 'tonight's arrivals' board led by NULL stamps is really showing the never-arrived, and the fix is an explicit flag — ORDER BY (shipped_at IS NULL), shipped_at — stated in the report. Min/max ladders inherit the same hazard: MIN(shipped_at) ignores NULLs (fine), but ORDER BY shipped_at ASC LIMIT 1 hands the 'earliest check-in' crown to a reservation that never checked in. Dedup and comparisons are the third bite: NULL never equals NULL, so DISTINCT keeps 'duplicate' NULL rows and joins on a NULL key match nothing — a feature when the key is genuinely missing and a trap when it was coalesced upstream. The policy in one line: NULLs are 'not yet', they sort and aggregate as 'not yet', and every board that touches the check-in stamp says so.",
      tag: "nulls",
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
    {
      id: "radisson-mcq-11",
      prompt: "The occupancy board wants checked-out, in-house, awaiting and cancelled counts in ONE scan over orders. Which SELECT does it in one pass?",
      choices: [
        "Four separate queries run back to back and pasted into one table",
        "One SELECT with COUNT(*) FILTER (WHERE status = 'delivered'), … FILTER (WHERE status = 'shipped'), … FILTER (WHERE status = 'pending'), … FILTER (WHERE status = 'cancelled')",
        "GROUP BY status with a LIMIT 4",
        "SUM(total) GROUP BY status",
      ],
      answer: 1,
      why: "FILTER (WHERE …) branches one aggregate per stay state in a single scan — 52 checked-out, 30 in-house, 14 awaiting, 7 cancelled on this db, reconciling to 103 by construction. Four sequential queries are four ways to drift out of reconciliation before the standup.",
      notes: [
        { choice: 2, why: "GROUP BY status returns rows the board must re-pivot in the chart layer — a second reshaping step that can reorder or drop a state while the arrival queue moves." },
        { choice: 3, why: "SUM(total) folds folio value, not reservations — a money board wearing a census title. The occupancy board counts stays." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-12",
      prompt: "GROUP BY status over the orders table prints one row per stay state. How many rows, and what must they sum to?",
      choices: ["3 rows — checked-out, in-house, everything else", "4 rows — 52 + 30 + 14 + 7, reconciling to 103", "16 rows — one per Rewards guest", "14 rows — one per booking month"],
      answer: 1,
      why: "The db carries exactly four states: 52 checked-out, 30 in-house, 14 awaiting arrival, 7 cancelled. The reconciliation identity — the rows must sum to 103 by construction — is what makes the occupancy board trustworthy before any share sits on top of it.",
      notes: [
        { choice: 0, why: "Collapsing pending into 'everything else' hides the 14 awaiting-arrival reservations — the population the pre-arrival upsell calendar works — and the board stops reconciling." },
        { choice: 2, why: "16 is the guest count, a different grain. GROUP BY status folds reservation rows; GROUP BY customer_id folds guests." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-13",
      prompt: "The pace spine buckets stays with SUBSTR(created_at, 1, 7). How many buckets does the 2024-01 → 2025-02 book produce, and what does SUBSTR(created_at, 6, 2) alone cost you?",
      choices: [
        "14 buckets; the month-only cut merges January 2024 with January 2025 into 12 buckets of fiction",
        "12 buckets; the 7-char cut adds 2 phantom months",
        "14 buckets; the month-only cut returns NULL for 2025 rows",
        "103 buckets — one per stay",
      ],
      answer: 0,
      why: "Year plus zero-padded month (the 7-character cut) gives the 14 distinct months on the book. The month-only cut strips the year, so two different Januaries fold into one bucket — the pace curve flattens a year-on-year read into nonsense while rendering perfectly.",
      notes: [
        { choice: 1, why: "No phantom months exist — the spine has exactly the months with bookings. The real damage is the merge, not an invention." },
        { choice: 3, why: "103 is the stay count — a different grain. The pace spine is a monthly fold over those 103 rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-14",
      prompt: "The never-stayed read — guests LEFT JOIN orders WHERE o.id IS NULL — returns ZERO rows. What is the honest write-up?",
      choices: [
        "The query is broken — every hotel group has members who never stayed",
        "A confident zero: all 16 Rewards guests appear in the reservations table, and proving that zero is part of the deliverable",
        "Zero rows means the join key is wrong",
        "Zero rows means NULLs were filtered out — add COALESCE and rerun",
      ],
      answer: 1,
      why: "On this db every guest has transacted, so the anti-join legitimately empties — the kit's stated trap. The analyst's job is to certify WHY the zero is trustworthy (right key, full 16-guest population) rather than shrug at it or 'fix' it into rows.",
      notes: [
        { choice: 0, why: "Assuming the zero must be wrong is the failure mode in reverse. A zero is a finding when the population is provably complete." },
        { choice: 3, why: "COALESCE manufactures guests who do not exist. The whitespace question is answered by the data, not by a default value." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-15",
      prompt: "Revenue management filters folio lines WHERE unit_price > 200 to isolate the Collection arm and returns nothing. Diagnosis?",
      choices: [
        "The folio feed is broken",
        "An honest empty: posted rates top out at the 199.99 ceiling, so the 200-plus band is empty by construction — report the boundary, do not chase the zero",
        "unit_price is TEXT and needs a CAST",
        "The filter needs LOWER() on the product name",
      ],
      answer: 1,
      why: "The rate card's ceiling is 199.99, so any Collection-band filter above it comes back empty by construction — the kit's stated second trap. Proving the zero (max rate = 199.99, filter placed correctly) IS the deliverable; quietly lowering the band would misstate the ladder.",
      notes: [
        { choice: 2, why: "Numeric comparisons on a REAL rate column are type-safe. Reaching for CAST before checking the data is troubleshooting theater." },
        { choice: 3, why: "LOWER() matters for TEXT matching, not a numeric threshold. The band is empty because no row qualifies, not because nothing matched." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-16",
      prompt: "orders JOIN order_items: COUNT(*) prints 251 and SUM(quantity) prints 498. What is each number, and which one is 'room-nights'?",
      choices: [
        "251 stays and 498 guests — room-nights is 498",
        "251 folio lines and 498 room-nights — room-nights is SUM(quantity), because quantity is the night count per line",
        "Both are room-nights; the join doubled the book",
        "251 room-nights and 498 folio lines",
      ],
      answer: 1,
      why: "103 stays carry 251 folio lines (COUNT(*) after the join counts lines), and each line's quantity is its room-nights — 498 across the book, about 4.8 nights per stay. COUNT only ever counts rows; the night count is a SUM of quantity, and confusing the two grains is the classic folio fan-out.",
      notes: [
        { choice: 0, why: "498 guests would be wild — there are 16. The second number is a SUM of units (nights), not a population count." },
        { choice: 2, why: "Nothing doubled. 251 and 498 are two legitimate grains — lines and nights — that only look redundant until you try to reconcile them to 103 stays." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-17",
      prompt: "Cut the summer-season booking window (June through August 2024). Which predicate keeps the last night of August?",
      choices: [
        "BETWEEN '2024-06-01' AND '2024-08-31'",
        "created_at >= '2024-06-01' AND created_at < '2024-09-01'",
        "created_at <= '2024-08-31'",
        "SUBSTR(created_at, 6, 2) BETWEEN '06' AND '08'",
      ],
      answer: 1,
      why: "created_at is a TEXT timestamp with a time component, so BETWEEN '…08-31' silently drops everything after midnight on the 31st — and season-end is exactly when group folios land. The half-open interval [Jun 1, Sep 1) keeps the whole last night and tiles the year with adjacent seasons.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends, but '2024-08-31' < '2024-08-31T18:40:00' as strings — the day's bookings after midnight vanish without an error." },
        { choice: 3, why: "Month-only matching pulls June, July and August of BOTH years. A season is a year-scoped window, not a month filter." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-18",
      prompt: "The pace walk adds LAG(booked) OVER (ORDER BY month). The 2024-01 row's delta prints NULL. What is the policy?",
      choices: [
        "COALESCE it to 0 so the pace curve has no holes",
        "Report NULL as baseline — the first month has no prior month, and a zero would read as a flat month",
        "Drop the first row from the curve",
        "Substitute the 14-month average",
      ],
      answer: 1,
      why: "LAG on the first row of an ordered spine is NULL by definition — there is no prior month. The NULL IS the baseline; coalescing it to zero invents a flat month, and any chart that 'fills' it draws a number that was never measured. The January open (3,731.97) anchors the whole curve — keep the row.",
      notes: [
        { choice: 0, why: "Zero means 'no change versus December', which is a claim about a month that has no predecessor in the window. Baseline NULL and fabricated zero tell different stories." },
        { choice: 2, why: "Dropping the row hides the pace curve's opening level, and every subsequent LAG still computes fine — there is no reason to lose the anchor." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-19",
      prompt: "The ADR-style read shows LATAM at 426.22 against the 338.19 network average. What must the analyst say before revenue management acts on it?",
      choices: [
        "Nothing — 426.22 is the headline and LATAM should be expanded",
        "LATAM's rate rides a 2-stay base — a small-N market gets flagged beside its denominator, not quoted as a trend",
        "The number needs a ROUND to 1 decimal first",
        "LATAM should be excluded from the report entirely",
      ],
      answer: 1,
      why: "Average stay value is a rate, and a rate over 2 stays (852.44 total) is not a market story — it is two folios. The discipline this kit drills: publish the denominator beside every rate, flag small-N cells, and let the US's 383.48 on 19 stays and EU's 335.32 on 45 carry the trend claims.",
      notes: [
        { choice: 0, why: "Acting on a 2-observation average is how a rate card gets repriced by noise. The premium-looking number is real but has no trend weight." },
        { choice: 2, why: "Rounding is presentation. The problem is the sample size, which no decimal place can fix." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-20",
      prompt: "A junior bands the Rewards ladder by running the tier CASE over raw stay rows instead of folding guests first. What ships wrong?",
      choices: [
        "Nothing — banding rows and banding guests produce the same board",
        "Banding stay rows tiers folio lines, not people: the heavy folios contribute more rows, the bands re-weight toward them, and the guest counts the loyalty desk boards from no longer exist",
        "SQLite errors when CASE runs before GROUP BY",
        "Only NULL rows mis-band",
      ],
      answer: 1,
      why: "Tier the guest, never the stay: the fold to guest grain (16 guests from 103 stays) must happen before the CASE arms fire, or a 24-stay guest's folio contributes 24 votes to its band. The board renders, the arms look exhaustive, and the ladder is quietly a folio-line census.",
      notes: [
        { choice: 0, why: "They agree only when every guest has identical stay counts — never true here. Row-weighting IS the bug, and it is silent." },
        { choice: 3, why: "NULL handling is a separate hazard. This failure is structural: the unit of banding is wrong, not the edge cases." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-21",
      prompt: "The franchise desk asks: how many GUESTS stayed in EU, where the census shows 45 stays? Which expression answers the guest question?",
      choices: ["COUNT(*)", "COUNT(DISTINCT o.customer_id)", "SUM(total)", "COUNT(c.region)"],
      answer: 1,
      why: "EU's 45 stays fold to 8 distinct guests — COUNT(DISTINCT customer_id) is the coverage grain. COUNT(*) repeats the demand number; the intensity ratio between the two (5.6 stays per guest in EU versus 9.5 in the US) is the franchise-development read.",
      notes: [
        { choice: 0, why: "COUNT(*) answers 'how many stays', which the desk already has. Same rows, different grain, wrong answer." },
        { choice: 2, why: "SUM(total) is folio value — the third grain on the same join. Money is not people." },
      ],
      difficulty: "easy",
    },
    {
      id: "radisson-mcq-22",
      prompt: "COUNT(shipped_at) reads 82 while COUNT(*) reads 103. What is the 21-row gap?",
      choices: [
        "Data loss — 21 rows were deleted upstream",
        "The 14 awaiting-arrival plus 7 cancelled reservations carry no check-in stamp — the gap is the occupancy funnel working",
        "Duplicate rows inflating COUNT(*)",
        "Timezone drift between the two counts",
      ],
      answer: 1,
      why: "COUNT(column) skips NULLs and COUNT(*) does not, so the difference is exactly the reservations with no stamp: 14 pending plus 7 cancelled. The gap is not corruption — it is the not-yet-arrived and released population the occupancy funnel tracks, arriving as arithmetic.",
      notes: [
        { choice: 0, why: "Assuming deletion first is how revenue floors manufacture incidents. The NULL semantics explain the gap exactly: 14 + 7 = 21." },
        { choice: 2, why: "Duplicates would inflate both counts equally. The COUNT(*) versus COUNT(column) split is about NULLs, not duplicates." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-23",
      prompt: "A folio-value walk must restart at each market: SUM(total) OVER (PARTITION BY region ORDER BY created_at) versus dropping the PARTITION. What changes?",
      choices: [
        "Nothing — ORDER BY implies PARTITION",
        "The partition resets the running sum at each market boundary; without it, every market's row carries the network-wide cumulative",
        "PARTITION BY sorts the output rows",
        "PARTITION BY dedups the rows inside each market",
      ],
      answer: 1,
      why: "PARTITION BY fences the window: each market's walk starts fresh at its first stay, and the last row of each partition is that market's book. Without the partition the running sum runs across the whole ordered table — a network cumulative wearing per-market labels, and no market's last row equals its own book.",
      notes: [
        { choice: 0, why: "ORDER BY only sequences the window; PARTITION BY is what fences it. Two independent knobs, one commonly fused in candidates' heads." },
        { choice: 2, why: "Sorting is the outer ORDER BY's job. PARTITION affects computation groups, not presentation order." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-24",
      prompt: "Attach screen: guests who booked the room block AND an F&B-adjacent family but never the premium-tier family. Why is EXISTS the right shape rather than customer_id IN (…) twice?",
      choices: [
        "EXISTS is always faster than IN",
        "The membership test runs against a three-table join per guest, and a NULL anywhere in the tested column set silently breaks NOT IN — EXISTS is the NULL-safe semi-join that reads as the business rule",
        "IN cannot reference the products table",
        "EXISTS returns the matching folio lines",
      ],
      answer: 1,
      why: "Each EXISTS is a per-guest reachability probe through orders → order_items → products, ANDed for the positive arms. The negative arm (never the premium family) is where IN falls apart: NOT IN over a column that can carry NULLs empties the whole report on three-valued logic, while NOT EXISTS simply asks the question the upsell calendar means.",
      notes: [
        { choice: 0, why: "Performance is planner-dependent and beside the point — the argument is correctness under NULLs and the readability of the attach rule." },
        { choice: 3, why: "EXISTS is a boolean test, not a row source. It answers 'did this guest reach the family', which is exactly the attach question." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-25",
      prompt: "Room types sold per check-in date folded with GROUP_CONCAT(product_name). What does GROUP_CONCAT NOT guarantee?",
      choices: [
        "It returns NULL when the group has no rows",
        "Element order and total length are not guaranteed — the separator argument and an ORDER BY in a staging subquery are the controllable parts",
        "It deduplicates automatically",
        "It caps output at 10 items",
      ],
      answer: 1,
      why: "GROUP_CONCAT folds a group into one string but the element order follows the rows the planner happens to visit — unless the fold is staged over an ordered subquery with an explicit separator. For a room-type manifest per arrival date, an unordered string is a different inventory list on every run.",
      notes: [
        { choice: 0, why: "That part it does guarantee — no input rows, NULL output — which is exactly why the empty-date cell needs a deliberate COALESCE only if the slide demands a visible blank." },
        { choice: 2, why: "Dedup needs DISTINCT inside the call — GROUP_CONCAT(DISTINCT name). Without it, repeated nights repeat the room type in the manifest." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-26",
      prompt: "The elite band's 24,789.63 folio is quoted as '71.2% of the book'. What are the two honest builds for that share?",
      choices: [
        "One GROUP BY with a self-JOIN back to orders",
        "A scalar-subquery denominator or a window SUM(total) OVER () — the band fold and the whole-book fold are two aggregation levels that must never collapse into one GROUP BY",
        "AVG of the band folios",
        "MAX(folio) per band divided by COUNT(*)",
      ],
      answer: 1,
      why: "The numerator folds per band (the banded CTE at guest grain); the denominator folds the whole 34,833.28 book once — either a scalar subquery beside every band row or the window form computed over the folded rows. Shares must foot to 100.0 within rounding because both levels read the same 103-stay book.",
      notes: [
        { choice: 0, why: "A self-join multiplies rows before the fold — the guest grain fan-out returns and every share drifts. The levels are stacked, not joined." },
        { choice: 2, why: "AVG of band folios weights every band equally — the two-guest single band would count as much as the five-guest elite band. Shares divide by the whole book, not by band count." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-27",
      prompt: "The published Rewards ladder must survive an audit rerun with four guests tied at 4 stays. How do you write the window's ORDER BY?",
      choices: [
        "OVER (ORDER BY stays) — ties resolve themselves",
        "OVER (ORDER BY stays DESC, folio_value DESC, id) — a named, reproducible tie-break, written into the query comment",
        "Any order is fine — ROW_NUMBER is deterministic",
        "ORDER BY cannot live inside OVER",
      ],
      answer: 1,
      why: "A ladder whose rungs depend on the engine's visit order is not reproducible: rerun it and the tie splits differently. The fix is a named, deterministic tie-break — a business key, then id as the final anchor — and publishing it in the comment, because the Rewards ladder is a published benefits contract.",
      notes: [
        { choice: 0, why: "Ties do not 'resolve themselves' — they resolve arbitrarily, which is worse. The four-way tie at 4 stays on this db is the standing example." },
        { choice: 2, why: "ROW_NUMBER is deterministic only given a total order. Without a tie-break it is deterministic the way a rerun coin flip is." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-28",
      prompt: "Owner-services screen: pairs of one guest's stays booked within 14 days of each other (a split booking). What is the shape?",
      choices: [
        "GROUP BY customer_id with a HAVING on the count",
        "Self-join orders o1 × o2 ON o1.customer_id = o2.customer_id with julianday(o2.created_at) - julianday(o1.created_at) BETWEEN 0 AND 14 and o1.id < o2.id to kill mirror pairs",
        "LAG over the guest column only",
        "UNION of each guest's rows with themselves",
      ],
      answer: 1,
      why: "Pair-in-population is a self-join: match each stay to its guest-mates, bound the gap with julianday arithmetic, and the o1.id < o2.id predicate keeps each pair once instead of twice. Without that guard the split-booking list reports every pair mirrored — and the front desk calls guests twice about one booking.",
      notes: [
        { choice: 0, why: "A HAVING count finds guests with multiple bookings, not the PAIRS — owner services needs the two reservation ids to merge the folios." },
        { choice: 2, why: "LAG needs a deterministic per-guest ordering and answers 'previous row', which misses pairs that are not adjacent after any single sort." },
      ],
      difficulty: "hard",
    },
    {
      id: "radisson-mcq-29",
      prompt: "Owner money: SUM(amount_cents) / 100 versus SUM(amount_cents) / 100.0 on the statements table. What is the difference?",
      choices: [
        "None — SQLite auto-promotes both to real division",
        "INTEGER division truncates: /100 eats every odd-cent remainder, while /100.0 forces real division — the cents never survive the first form",
        "/100 rounds half up, /100.0 rounds half down",
        "/100.0 is only for display",
      ],
      answer: 1,
      why: "amount_cents is INTEGER, so /100 is integer division — whole-dollar statements survive but any odd-cent sum silently loses its remainder. The /100.0 (or an explicit CAST) promotes to real arithmetic before the divide, which is why every dollar read in the owner book is amount_cents / 100.0.",
      notes: [
        { choice: 0, why: "Auto-promotion is exactly what does NOT happen for INTEGER / INTEGER. The bug ships silently because whole-dollar statements look right either way." },
        { choice: 2, why: "Integer division does not round at all — it truncates toward zero. Rounding semantics only enter once the arithmetic is real." },
      ],
      difficulty: "medium",
    },
    {
      id: "radisson-mcq-30",
      prompt: "Paging the Rewards ladder with LIMIT 5 OFFSET 5 to show 'ranks 6 through 10'. What is the trap on a tied ladder?",
      choices: [
        "OFFSET is 1-based and off by one",
        "A tie block straddling the page boundary splits peers across pages — the honest pager gates on the rank window computed by a named tie-break, not on raw row offsets",
        "OFFSET requires ORDER BY id",
        "LIMIT drops NULL rows first",
      ],
      answer: 1,
      why: "Row-offset paging knows nothing about ties: the four-way tie at 4 stays can split two peers onto each page, and both pages claim 'ranks 6–10'. The defensible build computes RANK first and filters WHERE value_rank BETWEEN 6 AND 10, so a shared rung never tears across a page break.",
      notes: [
        { choice: 0, why: "OFFSET is 0-based in SQL. But even with the arithmetic right, offsets paginate ROWS, and ranks are a property of TIES — different currencies." },
        { choice: 2, why: "Forcing ORDER BY id makes paging deterministic but still splits the tie block — determinism is not the same as honoring the shared rung." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-radisson-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The Rewards value ladder",
      brief:
        "Radisson-flavored brief on the storefront db: the loyalty desk boards the Rewards VALUE ladder quarterly — each guest folded to stay count and folio value, ranked by folio value, top five published. The policy is stated on the slide: RANK semantics with a named tie-break (folio value DESC, then guest id), and the ladder folds from ALL stay states — cancelled reservations stay in the guest's book, this is the 34,833.28 booked book. Probed facts: Alice Chen (EU) leads at 24 stays worth 7,262.35, Emma Wilson (US) follows at 17 for 6,640.56, then Grace Kim (APAC) 14 / 4,574.23, Maya Patel (APAC) 13 / 3,644.56 and Chloe Dubois (EU) 5 / 2,667.93 closing the published five. The desk reads biggest folio first.",
      ask: "Return the top five guests by folio value with market, stay count, folio value to 2 decimals and their value rank, biggest folio first.",
      template:
        "WITH per_guest AS (\n  SELECT customer_id,\n         COUNT(*) AS stays,\n         ROUND(SUM(total), {1}) AS folio_value\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name AS guest,\n       c.region AS market,\n       pg.stays,\n       pg.folio_value,\n       RANK() OVER (ORDER BY pg.folio_value {2}) AS value_rank\nFROM per_guest pg\nJOIN customers c ON c.id = pg.customer_id\nORDER BY value_rank\nLIMIT {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the cents precision",
          why: "Folio value reports to 2 decimals — 7,262.35 and 6,640.56, matching the book's cents precision. ROUND to 1 prints 7,262.4 and the ladder stops reconciling with the 34,833.28 book the desk foots on the same slide.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-folio-first direction",
          why: "The desk reads the ladder top-down: Alice Chen's 7,262.35 on the first rung. ASC would publish the bottom of the ladder — the 444.80 single-stay guests — as the headline and the elite-engagement calendar is built on the wrong five names.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the published depth",
          why: "The ladder publishes five rungs — rank cells 1 through 5, closing at Chloe Dubois's 2,667.93. LIMIT 3 cuts Maya Patel and Chloe Dubois off a board whose policy says five; LIMIT 10 leaks the 1,686.17 tail the desk works through a different channel.",
        },
      ],
      distractors: ["ASC", "1", "AVG", "WHERE"],
      walkthrough:
        "Fold to guest grain first, rank second, cut third. The per_guest CTE folds 103 stays to 16 guests — COUNT(*) for stay count, ROUND(SUM(total), 2) for folio value, all states in — and the window lays rungs over the fold: RANK() OVER (ORDER BY folio_value DESC) prints 1 Alice Chen 7,262.35, 2 Emma Wilson 6,640.56, 3 Grace Kim 4,574.23, 4 Maya Patel 3,644.56, 5 Chloe Dubois 2,667.93, and LIMIT 5 publishes exactly the five the desk boards. The read under the numbers: the top two rungs alone carry 13,902.91 — 39.9% of the book from two guests, the concentration story at grain level, and the stay counts (24, 17, 14, 13, 5) reconcile to the stay-count ladder the loyalty board already publishes. The distractors fail honestly: ASC flips the ladder onto its tail; 1 in the precision slot rounds every rung to a dollar and the fold drifts off the cents-precise book; AVG in a value slot is aggregate misuse where a scalar belongs and errors everywhere it lands; WHERE in a value slot breaks the query outright. Fold, rank, name the policy, publish five — that is the whole ladder.",
    },
    {
      id: "cs-radisson-4",
      tier: "medium",
      topic: "j7",
      universe: "month-close",
      title: "The payment-rail split",
      brief:
        "Radisson-flavored brief on the storefront db: the asset-light fee desk's close opens with the payment-rail split — every settlement leg classified by rail (card versus wire), with statement coverage, total settled and average leg size per rail. Payment rows are the ledger of record; a statement's status label is a claim. Probed facts: the card rail carries 16 legs against 16 statements worth 37,364.00, averaging 2,335.25 a leg; the wire rail carries 11 legs against 11 statements worth 32,248.00, averaging 2,931.64 a leg — wires settle fewer, larger owner payments while cards absorb the high-frequency fee book. The desk reads biggest settled total first.",
      ask: "Return each rail with its leg count, distinct statements settled, total settled to 2 decimals and average leg size to 2 decimals, biggest settled total first.",
      template:
        "SELECT p.method AS rail,\n       COUNT(*) AS legs,\n       COUNT(DISTINCT p.invoice_id) AS statements,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled_total,\n       ROUND(AVG(p.amount_cents) / 100.0, {1}) AS avg_leg\nFROM payments p\nJOIN invoices i ON i.id = {2}\nGROUP BY p.method\nORDER BY settled_total {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the leg-precision slot",
          why: "Average leg size reports to 2 decimals — 2,335.25 and 2,931.64 — because the cents-divide (amount_cents / 100.0) preserves them. ROUND to 1 prints 2,335.2 and the rail economics drift off the cents-precise statement book.",
        },
        {
          answer: "i.id",
          kind: "keyword",
          label: "the statement join key",
          why: "Legs attach to their statement through i.id = p.invoice_id. i.customer_id matches every leg to every same-customer statement — a 27 × 28-style fan-out that inflates legs, statements and totals into rail fiction.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-total-first direction",
          why: "The desk reads the bigger rail on top: card's 37,364.00 over wire's 32,248.00. ASC opens the meeting on the wire rail — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'cash'", "i.customer_id", "1", "ASC"],
      walkthrough:
        "Join, fold per rail, size the legs. The payments-to-invoices join attaches each settlement leg to its statement, GROUP BY method folds the two rails, and the board reads exactly as probed: card 16 legs / 16 statements / 37,364.00 / 2,335.25 per leg, wire 11 / 11 / 32,248.00 / 2,931.64 — one leg per statement on both rails here, which is itself a finding: the five split-settlement statements that pay in two legs live inside the 28-statement book but this read counts the legs where they fall. The money rule rides in both money columns: INTEGER cents divided by 100.0, rounded to 2. The economics story: card carries more legs of smaller average size (the high-frequency fee book), wire fewer legs at a 25% higher average (the lumpy owner settlements) — rail mix, not rail health. The distractors fail honestly: 'cash' invents a rail that matches nothing (empty result from the join key, error from the numeric slots); i.customer_id fans every leg across same-customer statements and the totals multiply; 1 truncates the leg averages to a dollar; ASC flips the board onto the wire rail. One join, one fold per rail, cents-safe — the split the fee desk opens the close with.",
    },
    {
      id: "cs-radisson-5",
      tier: "medium",
      topic: "t4",
      universe: "funnel",
      title: "The pace & cancellation spine",
      brief:
        "Radisson-flavored brief on the storefront db: the ops standup opens on the booking pace spine — reservations per month bucket beside the cancellations and the stamped (check-in-eligible) count, the first five months of the 14-month window published. Bucketing is STRFTIME('%Y-%m', created_at) so January 2024 never merges with January 2025. Probed facts: 2024-01 books 8 stays with 1 cancellation and 5 stamped; 2024-02 books 9 with 0 cancellations and 8 stamped; 2024-03 books 8 with 1 and 5; 2024-04 books 7 with 0 and 7; 2024-05 books 8 with 0 and 8 — the stamped column is the occupancy denominator that keeps awaiting and cancelled rows in the funnel. The board reads the spine in calendar order.",
      ask: "Return each of the first five months with stay count, cancellation count and stamped (check-in-eligible) count, in calendar order.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS stays,\n       SUM(CASE WHEN status = {2} THEN 1 ELSE 0 END) AS cancellations,\n       SUM(CASE WHEN shipped_at IS NOT NULL THEN 1 ELSE 0 END) AS stamped\nFROM orders\nGROUP BY month\nORDER BY month\nLIMIT {3};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the year-month bucket",
          why: "Year plus zero-padded month builds the 14-bucket spine's key — 2024-01 through 2025-02, the two Januaries kept apart. '%m' alone strips the year and folds both Januaries into one bucket; a bare '%Y' collapses the whole spine to 2 year buckets.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the cancellation literal",
          why: "Cancelled reservations are status 'cancelled' — 7 across the book, 2 of them in the published window. 'shipped' in this arm counts the 30 in-house stays as cancellations and the pace board reports a hotel releasing every guest on property.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the published window",
          why: "The standup publishes the first five months — and the number 5 rides in the cells as the January and March stamped counts. LIMIT 3 would half the window and hide April's clean 7-of-7 stamp month; a wider cut leaks months the standup has not cleared.",
        },
      ],
      distractors: ["'%m'", "'shipped'", "10", "DESC"],
      walkthrough:
        "Bucket once, fold three columns, publish the window. STRFTIME('%Y-%m', created_at) builds the month key — year inside the format string, so the two Januaries never merge — and the single scan folds three grains: COUNT(*) for stays, the CASE arm for cancellations, the IS NOT NULL arm for stamped. The published window reads exactly as probed: 2024-01 8 / 1 / 5, 2024-02 9 / 0 / 8, 2024-03 8 / 1 / 5, 2024-04 7 / 0 / 7, 2024-05 8 / 0 / 8 — and the reconciliation holds by construction: stays minus cancellations minus not-yet-stamped pending equals stamped per month. The read the standup takes: February and May stamped 8 of 9 and 8 of 8 — clean arrival months; the 5-stamp months carry awaiting reservations still inside the booking window, which is the funnel working, not a problem. The distractors fail honestly: '%m' strips the year and merges the two Januaries into one bucket; 'shipped' in the cancellation arm counts the 30 in-house stays as released bookings; 10 widens the published window past what the standup cleared; DESC in any slot is either a type error or reverses the calendar the board reads. Five months, three grains, one scan — the spine the occupancy board opens with.",
    },
    {
      id: "cs-radisson-6",
      tier: "hard",
      topic: "x1",
      universe: "catalog",
      title: "The family fold board",
      brief:
        "Radisson-flavored brief on the storefront db: the brand team's catalog review opens with the family fold board — every room-product family folded to listings, folio lines, room-nights and folio value, with the actual listing names concatenated onto the row so the owners see what carries the family. Probed facts: the Audio family leads at 3 listings / 51 lines / 97 room-nights / 11,744.01; Wearables follows at 2 / 25 / 53 / 6,929.12; Video third at 2 / 32 / 61 / 5,198.41 — and the published board shows the top three families with their name manifests. The review reads biggest folio value first.",
      ask: "Return the top three families with listing count, folio lines, room-nights, folio value to 2 decimals and their concatenated listing names, biggest folio value first.",
      template:
        "SELECT p.category AS family,\n       COUNT(DISTINCT p.id) AS listings,\n       COUNT(oi.id) AS folio_lines,\n       SUM(oi.quantity) AS room_nights,\n       ROUND(SUM(oi.quantity * oi.unit_price), {1}) AS folio_value,\n       GROUP_CONCAT(DISTINCT p.name) AS listings_on_the_board\nFROM products p\nLEFT JOIN order_items oi ON oi.product_id = {2}\nGROUP BY p.category\nORDER BY folio_value {3}\nLIMIT {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the folio precision",
          why: "Folio value reports to 2 decimals — 11,744.01 and 6,929.12, matching the book's cents precision. ROUND to 1 prints 11,744.0 and the family fold stops reconciling with the 34,833.28 book the owners foot.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the catalog join key",
          why: "Lines attach to their product through p.id = oi.product_id. oi.id joins products to whatever line shares its row number — a nonsense match that misfiles lines across families; p.category compares ids to text and matches nothing, emptying every fold column.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-folio-first direction",
          why: "The review reads the family crown first: Audio's 11,744.01 on top. ASC would publish Fitness (863.91), Apparel (1,984.93) and Accessories (3,294.29) as the board — the tail presented as the head.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the published depth",
          why: "The board publishes three families — and the number 3 rides in the cells as the listing count of the Audio, Electronics and Accessories families. LIMIT 1 shows only the Audio crown; a wider cut leaks the one-listing Fitness family the deck explicitly benches.",
        },
      ],
      distractors: ["p.category", "1", "ASC", "AVG"],
      walkthrough:
        "Fold the catalog once, manifest the names, publish the top three. The LEFT JOIN keeps every family even where lines are thin, the fold counts four grains per family — DISTINCT listings, line count, SUM(quantity) room-nights, value at cents precision — and GROUP_CONCAT(DISTINCT p.name) lays the manifest on the row. The board reads exactly as probed: Audio 3 listings / 51 lines / 97 nights / 11,744.01 (Noise-Canceling Headset, Studio Desktop Mic, Bluetooth Speaker Mini), Wearables 2 / 25 / 53 / 6,929.12 (Fitness Band X2, Smart Watch S), Video 2 / 32 / 61 / 5,198.41 (4K Webcam Pro, Ring Light 14\"). The reconciliation story: the three published families carry 23,871.54 of the 34,833.28 book — 68.5% on 7 of 16 listings — and the nightly economics contrast (Audio 121.07 a night against Wearables 130.74) is the mix argument the brand team takes to the owners. The distractors fail honestly: p.category in the join key compares ids to text and matches nothing, so every fold column reads NULL; 1 truncates the cents off the folio values and collapses the depth to one row; ASC flips the board onto the benched tail; AVG in a numeric slot is aggregate misuse where a scalar belongs and errors outright. One join, one fold, four grains, one manifest — the board the catalog review opens with.",
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
    { slug: "consecutive-available-seats", why: "Consecutive room runs in an availability map — gap-and-islands over room numbers, the group-blocking question the sales office asks before quoting a block." },
    { slug: "consecutive-available-seats-ii", why: "The longer variant: runs of a given length or more — how the group desk sizes whether a 5-room block fits one floor, one query." },
    { slug: "calculate-orders-within-each-interval", why: "Bookings counted inside interval buckets — the pace read whose half-open bucket edges decide which reservation counts as in-window." },
    { slug: "repeat-purchase-rate", why: "The repeat-stay share of the Rewards book — the return-guest rate that decides whether growth is broadening the base or deepening the ladder." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary bands at guest grain — the segmentation pass that feeds the elite/core/single bands the loyalty desk actually boards from." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Guests whose folio value climbs stay over stay — the escalator cohort the pre-arrival upsell calendar is built on." },
    { slug: "cohort-retention-matrix", why: "Enrollment cohort by return-month matrix — the retention grid that shows whether 2024 signups are becoming 2025 stays." },
    { slug: "dormant-reactivation", why: "Lapsed guests who qualified but stopped booking — the winback census, stated with its population so a confident zero reads as a finding." },
    { slug: "winback-recovery", why: "Which lapsed guests came back after an offer — the anti-join's sequel, recovery measured against the same denominator the lapse was measured with." },
    { slug: "average-selling-price", why: "Average posted rate per room family under status windows — the ADR-style fold with the denominator spelled out per family." },
    { slug: "basket-depth-aov", why: "Folio lines and value per stay — the depth-versus-average read that separates a long stay from a high-attached one." },
    { slug: "ar-aging-schedule", why: "Owner statements aged into buckets by days outstanding — the dunning spine the fee desk runs every close over the 28-statement book." },
    { slug: "spend-histogram", why: "Folio lines banded by posted rate — the histogram view of the 55-line ladder, where band edges and arm order are the whole exercise." },
    { slug: "transactions-per-visit-histogram", why: "Folio lines per stay bucketed — the 2.44 lines-per-stay figure rebuilt honestly, distribution instead of a single masked average." },
    { slug: "prepayment-detection", why: "Deposits spotted against folio value before arrival — the prepayment read that separates cash-on-hand from wishful occupancy." },
    { slug: "generate-the-invoice", why: "Statement lines rolled up per stay or per owner — the folio-to-invoice fold that feeds the 28-statement settlement book every close." },
  ],
};
