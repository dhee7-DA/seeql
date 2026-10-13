// Hilton — kit 13 of the Travel & Hospitality domain (Batch L, wave 7).
// Property-portfolio angle: stay nights, Honors tiering, ADR/RevPAR-style
// reads over a managed portfolio. Pool provenance: Hilton has NO registry
// tags in this app's pools — 0 tagged LC — theme-curated: every topic and
// problem slug comes from scripts/company-pools.md's theme menu, mirroring
// the workflows Hilton screens are known to probe (per-guest lifetime folds,
// tier CASE rolls, occupancy windows, operator audits, settlement coverage).
// Case studies run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as orders=stays/bookings,
// order_items=room-nights (folio lines), products=room classes,
// customers=Honors guests, suppliers=property operators (ownership groups),
// shipped_at=stay checkout, region=market.

import type { CompanyKit } from "../types";

export const hiltonKit: CompanyKit = {
  id: "hilton",
  domainId: "travel",
  name: "Hilton",
  tagline: "Hotels worldwide: properties, stays, Honors loyalty",
  accent: "text-blue-200",

  brief: [
    "**Hilton** reads its business stay by stay: a portfolio of properties, folios of room-nights, and an {sky:Honors} ledger that decides who gets the upgrade. In this app's training db the mapping is honest: `orders` are stays (a booked reservation that was priced), order_items are the room-nights on the folio, products are room classes, and shipped_at is stay checkout. Probed scale: **103 stays worth 34833.28** carrying 251 room-nights across 16 room classes and 6 property operators — about 2.4 nights per stay, which is the length-of-stay story in one ratio.",
    "The data org is portfolio-shaped. The loyalty team owns the Honors ladder — per-guest lifetime value folded first, tiered second: **4 Diamond** guests (3000+) hold 22121.7, which is **63.5%** of network stay value. The revenue team owns the ADR-style reads: 338.19 average per stay network, 383.48 in the richest market on only 19 stays. The settlement desk moves owner money as integer cents across 28 invoices and 27 payments — *every dollar read divides by 100.0, and the anomalies are named, not averaged away*.",
    "The SQL screens are live-db and grain-ruthless. You will be asked for a stay-night read — nights, value and distinct stays per room class — and the trap is the fan-out: 251 room-nights fold through the join until `COUNT(*)` counts nights and calls them stays. You will be asked for a tier ladder and the trap is definition: tier the raw stay rows and you tier folio lines, not guests. Anti-join drills return **zero rows** here (every room class and every guest has transacted), and the rate ceiling sits at **199.99**, so premium-band filters come back empty by construction.",
    "Prep the way the screens run: CTE stage-then-bucket folds until a tier ladder is two named steps; CASE rolls until occupancy and tier states are one pass; window ranks for the operator boards; julianday for the **2.98-day** average booking-to-checkout lead; month buckets via `strftime('%Y-%m', …)` across 2024-01 to 2025-02. Then rehearse the two sentences the interviewer grades: *a night is a line, a stay is a folio — and occupancy, nights-per-stay and ADR are three different folds over the same rows*.",
  ],

  dayInLife: [
    "**08:05 —** Portfolio board first: the overnight stay census — 103 booked, **82** checked-out or in-house, 14 {amber:in-window}, 7 {rose:cancelled} — with the nights-pace curve beside it (9-stay peaks in 2024-02 and 2024-09). *The occupancy share prints next to its denominator or revenue management sends it back.* The settlement queue opens with one flag: a {rose:void} bill that carries a 925 payment.",
    "**11:30 —** Deep work: the Honors tier ladder. Stage per-guest lifetime value in a CTE, then CASE-bucket — Diamond 4 guests holding **22121.7** (63.5% of stay value), Member 11 holding 10043.65, Gold exactly 1 holding 2667.93. *Tier count is not value: the biggest tier by heads is the middle one by money, and the deck says so out loud.*",
    "**16:45 —** Stakeholder moment: the RevPAR-style market read for the owner call — the richest market books 383.48 per stay on 19 stays against the busiest market's 335.32 on 45; *small-N markets get flagged, not hidden*. The EOD note ships with definitions attached — occupancy on the 82, tier on lifetime value, nights-per-stay on folio lines — and the 4000-paid-of-6148 bill goes to the settlement desk with its denominator.",
  ],

  metrics: [
    { name: "Nights per stay", what: "Room-nights over stays — 251 over 103, about 2.4. The length-of-stay proxy every pricing decision leans on; a folio line is a night, not a reservation." },
    { name: "Occupied-or-in-house share", what: "Stays with a checkout timestamp (complete or underway) over all stays — 82 of 103, 79.6%. The state-free read that keeps in-window and cancelled in the denominator where they belong." },
    { name: "Honors concentration", what: "Share of stay value from guests above a lifetime threshold — 63.5% from the four 3000-plus guests (22121.7 of 34833.28). The tier ladder's headline; loyalty economics in one number." },
    { name: "ADR-style read", what: "Average stay value — 338.19 network, 383.48 in the richest market (19 stays), 335.32 in the busiest (45 stays). Rate mix shifts show up here before they reach rate-code reviews." },
    { name: "Booking-to-checkout lead", what: "julianday(checkout) minus julianday(booking) on the 82 completed-or-underway stays — 2.98 days average, range 2 to 4. The window an upgrade offer actually has." },
    { name: "Operator bench", what: "Property operators above the 4.5 rating line — 2 of 6 (4.6 and 4.8). Portfolio expansion starts from this bench, not from the full operator list." },
    { name: "Settlement coverage", what: "Invoices classified exact, partial or none against their payments — 21 exact, 1 partial (4000 of 6148), 6 with no settlement at all (15217 cents). Owner relations reads this before the tie-out." },
    { name: "Nights pace by month", what: "Stays and value per 'YYYY-MM' bucket — 14 buckets from 2024-01 (8 stays, 3731.97) with 9-stay peaks in 2024-02 and 2024-09. Seasonality next to the cancellation haircut." },
  ],

  topics: [
    {
      name: "Honors tier CASE rolls",
      why: "The ladder is a CASE roll over folded lifetime value: Diamond at 3000+, Gold at 2000+, Member below — heads, value and share per tier. Conditional-bonus and tier-classification drills are the exact shapes; the graded part is folding at guest grain before tiering.",
      slugs: ["calculate-special-bonus", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "Stay-night folds",
      why: "Every portfolio read folds folio lines to stay grain: nights, value and DISTINCT stays per room class — 251 lines over 103 stays, and the fold that survives is the one that deduplicates. Per-class demand folds are the daily bread.",
      slugs: ["product-sales-analysis-ii", "basket-depth-aov", "product-sales-analysis-iii"],
    },
    {
      name: "ADR & RevPAR-style reads",
      why: "Rate reads are value over the right denominator — stay value over stays, weighted by units where the review says so. Weighted-average and quality-ratio drills with denominators printed beside them are exactly what revenue management asks for.",
      slugs: ["average-selling-price", "queries-quality-and-percentage", "top-travellers"],
    },
    {
      name: "Property-operator audits",
      why: "Operators are audited on coverage and balance: listings held, value moved, gaps between booked and stocked. Join-aggregate audits and imbalance folds are the owner-review toolkit.",
      slugs: ["warehouse-manager", "find-stores-with-inventory-imbalance", "sellers-with-no-sales"],
    },
    {
      name: "Occupancy boards & windows",
      why: "Guest boards, recent-stay trackers and operator ladders are window ranks over folded aggregates — with ties that share rungs honestly and recency defined deterministically. The 16-guest portfolio makes every tie visible.",
      slugs: ["rank-scores", "find-the-team-size", "the-most-recent-three-orders"],
    },
    {
      name: "Nights pace by month",
      why: "Pace reads in month buckets — stays, value and cancellations per 'YYYY-MM' key across 2024-01 to 2025-02, peaks of 9 and troughs of 6. Date-bucket folds that keep the whole window in the denominator are the pace-pack staples.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "friday-purchase-iii"],
    },
    {
      name: "Settlement coverage ledgers",
      why: "Owner bills are settlement reads: every invoice LEFT JOIN its payments, coverage classified exact, partial or none — 21 exact, 1 partial at 4000 of 6148, 6 with nothing. LEFT JOIN folds with NULL arms are the drill, cents over 100.0 the discipline.",
      slugs: ["bank-account-summary", "bank-account-summary-ii", "combine-two-tables"],
    },
    {
      name: "Market mix & shares",
      why: "Market shares and completion rates are ratios over stated denominators — the 100.0 sits before the slash or the number is wrong. Share drills train the exact habit the owner deck grades.",
      slugs: ["percentage-of-users-attended-a-contest", "card-launch-success", "portfolio-weights"],
    },
    {
      name: "Stay clocks & lead time",
      why: "Booking-to-checkout is julianday math over completed-or-underway stays only — 2.98 days average, range 2 to 4 — and the 21 open folios must NULL out, not fabricate. Process-latency and day-offset drills are the clock's toolkit.",
      slugs: ["average-time-of-process-per-machine", "rising-temperature", "find-golden-hour-customers"],
    },
    {
      name: "Whale ladders & tiles",
      why: "Loyalty targets whales: spend-tier ladders over lifetime value, spend histograms, NTILE tiles. The 63.5% concentration line is computed exactly this way — folded per guest, then bucketed — and the drills are that fold.",
      slugs: ["rfm-segmentation", "spend-histogram", "customer-purchasing-behavior-analysis"],
    },
  ],

  theory: [
    {
      id: "hilton-t1",
      q: "Your stay-read joins stays to their room-nights and the stay count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 stays carry 251 room-nights, so joining to folio lines multiplies stay rows and COUNT(*) counts nights, not stays. The fix is grain honesty — either fold nights to stay level in a CTE and join up, or keep the fan-out and fold with COUNT(DISTINCT oi.order_id). I say the three counts out loud on any portfolio read: room-nights (251), stays (103), Honors guests (16 on this db) — and the one the slide claims must match the fold actually written. An occupancy number built on the wrong grain isn't slightly off; it's a different metric wearing the right name.",
      tag: "joins",
    },
    {
      id: "hilton-t2",
      q: "The operator board ranks by room classes and several operators tie. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it: ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives tied operators the same rung and skips consumed slots, which is honest about how many operators sit above. DENSE_RANK numbers rungs consecutively and hides the depth of the tie. On an operator board I ship RANK with a deterministic tiebreaker (operator id), and if the tie itself matters — operators holding the same shelf of room classes — I surface the tie as a column, because 'tied' is a fact the portfolio team will act on, not noise to hide behind an arbitrary integer.",
      tag: "windows",
    },
    {
      id: "hilton-t3",
      q: "Write the stay-state census in one query: booked, checked-out, in-house, in-window, cancelled, share. Where do candidates go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE status = 'delivered') AS checked_out, COUNT(*) FILTER (WHERE status = 'shipped') AS in_house, COUNT(*) FILTER (WHERE status = 'pending') AS in_window, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled — 103, 52, 30, 14, 7 on this db — and ROUND(100.0 * (checked_out + in_house) / COUNT(*), 1) prints 79.6. The classic failure is a WHERE clause: filtering cancelled out 'to clean up' shrinks the base to 96 and prints a share the portfolio never earned; the second is integer division, where 100 * 82/103 truncates because the 100.0 entered after the slash. Every stay sits in exactly one conditional bucket and all of them stay in the denominator.",
      tag: "aggregation",
    },
    {
      id: "hilton-t4",
      q: "checkout (shipped_at) is NULL on 21 stays. What does that NULL mean here, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: the stay hasn't checked out — 14 in the booking window and 7 cancelled, 21 total. Treating it as dirty data is the cardinal error: filling it with today's date fabricates departures, excluding those rows from a market read shrinks the denominator and flatters every share. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the occupied numerator, shipped_at IS NULL splits the open-folio arm into in-window versus cancelled by joining on status, and julianday lead math over NULL rows NULLs them — correct, because a stay that never happened has no lead. NULL here is information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "hilton-t5",
      q: "Where do WHERE and HAVING each belong in the Honors tier ladder, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: market slices, date windows, 'stays created this quarter'. HAVING filters groups after the fold: tiers above a value floor, guests with at least two stays. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE SUM(spend) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On the tier ladder the difference is visible: filtering out one 4000-dollar stay in WHERE demotes a Diamond guest to Gold and the loyalty deck misaddresses its best customer; the same gate in HAVING would just drop a tier row and leave the fold intact.",
      tag: "pipeline",
    },
    {
      id: "hilton-t6",
      q: "Revenue management wants markets whose average stay value beats the network ADR. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING the market's AVG(total) > (SELECT AVG(total) FROM orders) — is the compact benchmark read: the network ADR is 338.19, so the 383.48 market clears it and the 335.32 market doesn't. A windowed fold, AVG over the global partition, keeps every market in the result with its premium visible, which is what the deck wants. A CTE earns its place when 'stay value' needs a definition — incidentals netted, cancelled stays excluded — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the markets must fold on the same grain, or the comparison is room-nights against stays.",
      tag: "subqueries",
    },
    {
      id: "hilton-t7",
      q: "Two date reads every week: nights pace by month and the booking-to-checkout lead by market. What machinery does each need?",
      a: "Pace is bucketing: strftime('%Y-%m', created_at) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 stays, 3731.97) through 2025-02 (7, 2390.53), with 9-stay peaks in 2024-02 and 2024-09. The lead is instant math: julianday(shipped_at) - julianday(created_at) on the 82 stays with a checkout, averaged to 2.98 days with the 2-to-4 range quoted, because the upgrade-offer window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per stay; julianday over NULL checkouts NULLs those rows, which is the definition and not a bug; and the round happens once at the edge so the deck, the query and the audit all print the same number.",
      tag: "dates",
    },
    {
      id: "hilton-t8",
      q: "Finance found a void invoice carrying a payment, and one bill sits 4000-paid of 6148. How do you keep settlement anomalies from poisoning the owner read?",
      a: "Cross-examine states against evidence, and keep the cents discipline. Conditional counts that pair invoice status with payment rows surface the void-but-paid bill (925 on this db) and the paid-with-no-payments case (1756) before the tie-out; a coverage CASE — exact, partial when SUM(payments) < amount, none when no payment rows exist — classifies the 4000-of-6148 bill honestly instead of letting one payment row read as settled. And every dollar figure divides by 100.0, because invoices, payments, expenses and ledger rows are INTEGER cents. The habit being graded: row counts are claims, keys and evidence are truth, and an owner read shipped from a reconciled base is the only one worth defending.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "hilton-mcq-1",
      prompt: "Operator board census. Which fragment counts distinct STAYS per property operator — 45 for the widest operator?",
      choices: [
        "COUNT(oi.order_id)",
        "COUNT(DISTINCT oi.order_id)",
        "SUM(oi.order_id)",
        "COUNT(*)",
      ],
      answer: 1,
      why: "The join fans each stay to one row per room-night — 103 stays become 251 rows. COUNT(DISTINCT oi.order_id) folds back through the fan-out to distinct stays: 45 for the widest operator against its folio value.",
      notes: [
        { choice: 0, why: "COUNT(oi.order_id) counts room-night LINES per operator — the fan-out number, not stays. The board would read portfolio reach as night volume." },
        { choice: 3, why: "COUNT(*) is the same fan-out count with a different name. On the joined grain it cannot see stays at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "hilton-mcq-2",
      prompt: "The Honors ladder tiers lifetime stay value: Diamond at 3000+. How many of the 16 guests land in Diamond?",
      choices: [
        "4 — the 7262.35, 6640.56, 4574.23 and 3644.56 guests",
        "7 — everyone above 2000",
        "11 — everyone below the Gold line",
        "1 — only the top guest",
      ],
      answer: 0,
      why: "Exactly four guests clear 3000 lifetime (7262.35, 6640.56, 4574.23, 3644.56) — 4 Diamond guests holding 22121.7, which is 63.5% of network stay value. The 2667.93 guest sits in Gold, the other 11 in Member.",
      notes: [
        { choice: 1, why: "That's the 2000-plus count plus the 3000-plus — it double-counts the Diamond arm. CASE arms are evaluated in order and are mutually exclusive." },
        { choice: 2, why: "11 is the Member tier — the biggest tier by heads and the middle one by money. Counting heads is not counting value." },
      ],
      difficulty: "easy",
    },
    {
      id: "hilton-mcq-3",
      prompt: "The open-exposure report reads invoices without payments totaling 15217. The dollar figure the owner deck prints is:",
      choices: [
        "15217.00 — the ledger stores dollars",
        "152.17 — invoice money is INTEGER cents, divide by 100.0",
        "1521.70 — divide by 10",
        "1.5217 — divide by 10000",
      ],
      answer: 1,
      why: "Invoices, payments, expenses and ledger rows are INTEGER cents on this db — 15217 cents is 152.17 dollars after 15217 / 100.0. Orders.total and unit_price are the only dollar-valued columns.",
      notes: [
        { choice: 0, why: "That's the classic hundred-fold overstatement — printing cents as dollars. Every settlement slide sourced from invoices/payments needs the /100.0." },
        { choice: 2, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "easy",
    },
    {
      id: "hilton-mcq-4",
      prompt: "Honors concentration = Diamond value over network value. Which expression prints 63.5 without integer truncation?",
      choices: [
        "100 * 22121.7 / 34833.28 with both operands INTEGER",
        "100.0 * SUM(diamond_value) / (SELECT SUM(total) FROM orders)",
        "CAST(SUM(diamond_value) / SUM(total) AS REAL) * 100",
        "diamond_value / 34833.28 (multiply in the deck)",
      ],
      answer: 1,
      why: "The 100.0 promotes the fold to real arithmetic BEFORE the division — 22121.7 over 34833.28 prints 63.5. Integer division happens first in every other option and truncates at the slash.",
      notes: [
        { choice: 0, why: "If the operands land as integers the division floors to 0 before the 100 multiplies. The .0 must enter before the slash, not after." },
        { choice: 2, why: "The cast happens after the integer division has already floored. Real-promotion must precede the slash — the cast decorates a truncated number." },
      ],
      difficulty: "medium",
    },
    {
      id: "hilton-mcq-5",
      prompt: "'Occupied or in-house' = the stay has a checkout path. Which predicate returns exactly the 82 stays?",
      choices: [
        "WHERE status <> 'cancelled' — 96 stays",
        "WHERE shipped_at IS NOT NULL — 82 stays",
        "WHERE shipped_at IS NULL — 21 stays",
        "WHERE status = 'delivered' — 52 stays",
      ],
      answer: 1,
      why: "shipped_at (checkout) is populated on 52 checked-out plus 30 in-house stays = 82. Status <> 'cancelled' keeps the 14 in-window stays too, and status = 'delivered' alone drops the 30 in-house.",
      notes: [
        { choice: 0, why: "Not-cancelled includes the 14 in-window bookings — demand that hasn't checked in. Occupancy would read 96 and flatter the portfolio." },
        { choice: 2, why: "That's the open-folio arm: 14 in-window plus 7 cancelled. It's the complement of the occupied set, not the set itself." },
      ],
      difficulty: "medium",
    },
    {
      id: "hilton-mcq-6",
      prompt: "Nights pace by month for the revenue pack. The GROUP BY key is:",
      choices: [
        "created_at (raw timestamp)",
        "strftime('%Y-%m', created_at)",
        "shipped_at bucketed in the deck",
        "strftime('%d', created_at)",
      ],
      answer: 1,
      why: "strftime('%Y-%m', created_at) builds the '2024-01' key — 14 buckets from 2024-01 (8 stays, 3731.97) to 2025-02 — that sorts correctly as text and folds the whole window. Pace is booked on the booking date, not the checkout date.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per stay — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 2, why: "Bucketing on checkout moves each stay into its departure month — a different metric that smears booking pace across the stay-lead window." },
      ],
      difficulty: "medium",
    },
    {
      id: "hilton-mcq-7",
      prompt: "The expansion bench = operators rated 4.5 and above. How many of the 6 property operators qualify?",
      choices: [
        "2 — the 4.6 and the 4.8",
        "4 — everyone at 4.4 and above",
        "0 — no operator clears 4.5",
        "6 — the whole bench, rounded",
      ],
      answer: 0,
      why: "The 4.5 gate keeps exactly two operators (4.6 and 4.8). Rounding 4.4 up to 4.5 to widen the bench is a definition change — the gate is the gate, and the deck prints the threshold beside the count.",
      notes: [
        { choice: 1, why: "4.4 is below the gate. 'Close enough' silently redefines the bench and the expansion shortlist fills with operators the policy excludes." },
        { choice: 3, why: "An unfiltered bench defeats the point of the gate. The threshold exists to rank the portfolio, not to describe it." },
      ],
      difficulty: "medium",
    },
    {
      id: "hilton-mcq-8",
      prompt: "Settlement coverage: one bill reads 6148 with a single payment row of 4000. How does the coverage CASE classify it?",
      choices: [
        "exact — a payment row exists",
        "partial — SUM(payments) is 4000, less than the 6148 bill",
        "none — one row means one attempt, not settled",
        "void — the bill didn't clear",
      ],
      answer: 1,
      why: "Coverage is classified on AMOUNT, not row count: SUM(payments) = 4000 against a 6148 bill is partial — 2148 still owed. The exact arm requires SUM(payments) = amount, the none arm requires zero payment rows.",
      notes: [
        { choice: 0, why: "Counting payment ROWS instead of their SUM calls this settled and hides 2148 of exposure. The 5 split-payment invoices on this db exist precisely to catch that habit." },
        { choice: 2, why: "The none arm is for invoices with no payment rows at all — 6 of them here. A partial payment is evidence of settlement, just not enough of it." },
      ],
      difficulty: "hard",
    },
    {
      id: "hilton-mcq-9",
      prompt: "The stay-lead metric: julianday(checkout) - julianday(booking) over all 103 stays. The 21 NULL checkouts do what?",
      choices: [
        "Count as 0-day stays — include them",
        "NULL their rows — the average runs over the 82 real leads (2.98 days), which is correct",
        "Crash the query — filter them out first",
        "Default to today's date via SQLite",
      ],
      answer: 1,
      why: "julianday(NULL) is NULL, the difference is NULL, and AVG ignores NULLs — the average lands on the 82 stays that actually have a lead: 2.98 days, range 2 to 4. A stay that never checked out has no lead; fabricating one would flatter the number.",
      notes: [
        { choice: 0, why: "Coalescing NULL leads to 0 invents same-day turnarounds for 14 in-window and 7 cancelled stays — the average collapses and the offer window reads far shorter than it is." },
        { choice: 2, why: "No crash — NULLs flow through arithmetic silently. The trap is believing you must intervene; the NULL-blind aggregate already did the right thing." },
      ],
      difficulty: "hard",
    },
    {
      id: "hilton-mcq-10",
      prompt: "The 63.5% concentration line. Which fold computes it honestly?",
      choices: [
        "SUM(total) over all stays, then compare per-night lines",
        "Fold lifetime value per guest in a CTE, tier at 3000, then divide the tier's value by 34833.28",
        "Take the top stay's value (1088.44) and divide by 103",
        "COUNT guests above 3000 and divide by 251",
      ],
      answer: 1,
      why: "Concentration is a two-stage fold: SUM(total) per guest first (guest grain), tier the folded guests second, then tier value over network value — 22121.7 over 34833.28 = 63.5%. Tiering raw stay rows would tier folio lines and call them guests.",
      notes: [
        { choice: 0, why: "A network-level sum has no tiers to compare — the fold collapses before the ladder exists. The tiering has to happen at guest grain." },
        { choice: 3, why: "Guests over room-nights mixes grains — 251 is a night count, not a guest count. Every share names its denominator out loud." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-hilton-1",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The Honors tier ladder",
      brief:
        "Hilton-flavored brief on the storefront db (orders = stays, customers = Honors guests, shipped_at = checkout): the loyalty review asks for the Honors tier ladder — per guest, lifetime stay value folded first, then tiered: Diamond at 3000+ lifetime, Gold at 2000+, Member below — with guests, lifetime value and share of network demand per tier, richest tier first. Probed on the db: 16 guests carry 34833.28 of stay value; 4 Diamond guests hold 22121.7 (63.5%), the 11 Member guests hold 10043.65 (28.8%), and a single Gold guest holds 2667.93 (7.7%). The ladder must fold stay value at guest grain in a CTE first — tiering raw stay rows would tier folio lines and call them guests.",
      ask: "Return per Honors tier: guests, lifetime stay value (2dp) and share of network demand (1dp) — richest tier first.",
      template:
        "WITH guest_totals AS (\n  SELECT o.customer_id AS guest_id,\n         COUNT(*) AS stays,\n         SUM(o.total) AS spend\n  FROM orders o\n  GROUP BY {1}\n)\nSELECT CASE WHEN g.{3} >= {2} THEN 'Diamond'\n            WHEN g.spend >= 2000 THEN 'Gold'\n            ELSE 'Member' END AS tier,\n       COUNT(*) AS guests,\n       ROUND(SUM(g.spend), 2) AS lifetime_value,\n       ROUND(100.0 * SUM(g.spend) / (SELECT SUM(total) FROM orders), 1) AS share_pct\nFROM guest_totals g\nGROUP BY tier\nORDER BY lifetime_value {4};",
      slots: [
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the guest grain",
          why: "Lifetime value is per-guest: GROUP BY o.customer_id folds 103 stays into 16 guest rows before any tiering. GROUP BY o.id would fold per stay — every stay becomes its own 'guest' and the ladder tiers folio lines.",
        },
        {
          answer: "3000",
          kind: "number",
          label: "the Diamond threshold",
          noVerify: true,
          why: "The memo defines Diamond at 3000+ lifetime — the arm that catches the 7262.35, 6640.56, 4574.23 and 3644.56 guests. At 2000 the top arm swallows Gold and the ladder loses its middle rung.",
        },
        {
          answer: "spend",
          kind: "keyword",
          label: "the tiering key",
          why: "Tiers are cut on lifetime VALUE: g.spend. Tiering on g.stays would rank guests by nights-booked-in-window — 24 stays would still miss the 3000 line and every guest would land in Member.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the richest-first order",
          why: "The ladder reads value top-down: Diamond 22121.7, then Member 10043.65, then Gold 2667.93. Member outranking Gold is the point — tier count is not value, and ASC would hide it.",
        },
      ],
      distractors: ["o.id", "stays", "2000", "ASC"],
      walkthrough:
        "A two-stage fold where stage one defines the metric. The CTE folds 103 stays to guest grain — SUM(o.total) is lifetime value, COUNT(*) is stays, GROUP BY o.customer_id is the definition — and the outer query CASE-buckets the folded guests: Diamond at 3000+ catches 4 guests holding 22121.7 (63.5% of the 34833.28 network), Member catches 11 holding 10043.65 (28.8%), Gold exactly 1 holding 2667.93 (7.7%). Member outranking Gold on value is the honest surprise the deck prints: heads and money are different folds. The share divides by a scalar subquery at network grain so the denominators match. The distractors each rewrite the ladder: o.id re-grains the CTE to stays and every guest becomes Member, stays re-keys the CASE onto night counts and flattens everyone to Member, 2000 swallows Gold into Diamond (5 guests, 24789.63), and ASC reads the ladder upside down. Fold first, tier second, in that order.",
    },
    {
      id: "cs-hilton-2",
      tier: "easy",
      topic: "t4",
      universe: "month-close",
      title: "The nights pace board",
      brief:
        "Hilton-flavored brief on the storefront db (orders = stays, shipped_at = checkout): the month-close pack opens with the nights pace board — stays, stay value and cancellations bucketed by booking month across the 2024-01 to 2025-02 window — so revenue management sees seasonality next to the haircut. Probed on the db: the window holds 14 month buckets; 2024-02 and 2024-09 peak at 9 stays, the troughs sit at 6 (2024-06, 2024-11, 2025-01), and the two double-cancellation months are 2024-07 and 2024-11. Buckets key off `strftime('%Y-%m', created_at)` — bucketing the raw timestamp would print one row per stay and no board at all.",
      ask: "Return per booking month: stays, stay value (2dp) and cancelled stays — calendar order.",
      template:
        "SELECT strftime('{1}', o.created_at) AS month,\n       COUNT(*) AS stays,\n       ROUND(SUM(o.total), {2}) AS value,\n       SUM(CASE WHEN o.status = '{3}' THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nGROUP BY {4}\nORDER BY month {5};",
      slots: [
        {
          answer: "%Y-%m",
          kind: "keyword",
          label: "the bucket key",
          why: "strftime('%Y-%m', created_at) builds the '2024-01' month key — 14 buckets that sort correctly as text. %Y alone collapses the window to two rows and the seasonality story disappears.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Stay value prints to 2dp — 3731.97, 3609.64, 2617.08 — matching every money cell in the close pack. ROUND to 0 publishes 3732 and 3610, numbers no other slide carries.",
        },
        {
          answer: "cancelled",
          kind: "keyword",
          label: "the cancelled arm",
          why: "The pace board carries the haircut beside the demand: status 'cancelled' folds to 1, 2, 1 and 2 in its months — 7 network-wide. The 'shipped' arm would print in-house stays and call them losses.",
        },
        {
          answer: "month",
          kind: "keyword",
          label: "the fold key",
          why: "GROUP BY month folds 103 stays into the 14 buckets. GROUP BY o.created_at gives one group per stay — 103 rows of one and no board at all.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar order",
          why: "The close reads calendar-wise: 2024-01 first, 2025-02 last. DESC would open the pack on the newest month and read the season curve backwards.",
        },
      ],
      distractors: ["%Y", "o.created_at", "shipped", "DESC", "0"],
      walkthrough:
        "A bucket-fold where the key IS the board. strftime('%Y-%m', created_at) turns 103 stay rows into 14 'YYYY-MM' keys; COUNT(*) reads stays per bucket (peaks of 9 in 2024-02 and 2024-09, troughs of 6 in 2024-06, 2024-11 and 2025-01); ROUND(SUM(o.total), 2) reads stay value (2024-01 prints 3731.97); and the conditional SUM claims the cancelled haircut — 1, 2, 1 and 2 in its months, 7 network-wide — without a WHERE that would shrink the base. The board reads calendar-ascending so the season curve runs forward. The distractors each break a bucket: %Y collapses 14 months into two calendar years, o.created_at re-grains to one row per stay, 'shipped' re-points the cancellation arm at in-house stays, 0 rounds the money to whole units no slide shows, and DESC reads the year backwards. Bucket on the booking date, fold the whole window, keep the haircut in sight.",
    },
  ],

  problems: [
    { slug: "customer-purchasing-behavior-analysis", why: "Spend-tier ladders over lifetime value — the Honors tier ladder in textbook form: folded per guest, then bucketed." },
    { slug: "rfm-segmentation", why: "NTILE tier tiles over recency, frequency and value — the loyalty segmentation the upgrade offers ride on." },
    { slug: "spend-histogram", why: "Spend histograms across guest bases — the distribution behind the 63.5% concentration line, bucketed honestly." },
    { slug: "product-sales-analysis-ii", why: "Per-room-class demand folds from folio lines — the occupancy census at the right grain: classes, not lines, not stays." },
    { slug: "basket-depth-aov", why: "Depth and average value per basket — nights-per-stay and value-per-stay in one drill, folded without the fan-out." },
    { slug: "average-selling-price", why: "Weighted average price over units and periods — the ADR-style read revenue management defends in every rate review." },
    { slug: "top-travellers", why: "Guest boards from stay sums — the whale list the loyalty desk targets, folded without inflating nights into stays." },
    { slug: "rank-scores", why: "Tie-honest ranking — the operator board where shelf sizes tie: RANK with the skip, stated out loud." },
    { slug: "find-the-team-size", why: "COUNT OVER partitioned groups — the per-operator stay count attached to every row without collapsing the portfolio." },
    { slug: "bank-account-summary", why: "Per-account in/out folds — the settlement coverage ledger: money in, money out, net per bill, cents over 100.0." },
    { slug: "combine-two-tables", why: "LEFT JOIN with NULL fallback arms — the owner read: guests and bills whose counterparty rows never filled in." },
    { slug: "percentage-of-users-attended-a-contest", why: "Distinct-participation shares — the occupancy-share pattern in another costume: DISTINCT guests over stated bases, real division throughout." },
    { slug: "average-time-of-process-per-machine", why: "Per-lane latency pairs — the booking-to-checkout clock at market grain: 2.98 days network, per-market splits beside it." },
    { slug: "warehouse-manager", why: "Join-aggregate balance reads — the operator audit: listings held against value moved, gaps flagged per owner group." },
    { slug: "find-stores-with-inventory-imbalance", why: "Portfolio imbalance folds — the room-class mix audit: which operators over-index on one class of the 16." },
    { slug: "monthly-transactions-i", why: "Month-bucket demand folds — the nights pace census: stays and value per 'YYYY-MM' key across the 14-bucket window." },
  ],
};
