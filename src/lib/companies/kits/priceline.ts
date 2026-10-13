// Priceline — wave-6 kit 9 of the Travel & Hospitality domain.
// Bundling angle: package attach rates, express-deal inventory, refundables.
// Pool provenance: Priceline has NO registry tags in this app's pools — 0
// tagged LC problems — so every topic and problem slug is theme-curated from
// scripts/company-pools.md's theme menu, mirroring the workflows Priceline
// screens are known to probe (attach folds, bundle-depth ladders, price reads,
// funnel conversion, anti-joins on zero attach). Case studies run on the
// storefront db with probed figures from scripts/company-facts.md — mapped
// honestly as orders=bookings (packages and standalone), products=bookable
// inventory units, order_items=package components, customers=bookers,
// suppliers=supply partners, shipped_at=travel completed (check-in/arrival).

import type { CompanyKit } from "../types";

export const pricelineKit: CompanyKit = {
  id: "priceline",
  domainId: "travel",
  name: "Priceline",
  tagline: "Express deals and hotel/flight bundles",
  accent: "text-sky-500",

  brief: [
    "**Priceline** is the bundling engine of Booking Holdings — the brand that turned *Name Your Own Price* into today's **Express Deals** opaque inventory and hotel-plus-flight packages, where the margin is made by attaching a second and third component to a booking that started as one. In this app's training db the mapping is honest: `orders` are bookings (a package or a standalone unit that was priced and reserved), order_items are the package components, products are bookable inventory units, and shipped_at is travel completed. Probed scale: **103 bookings worth 34833.28** carrying 251 components across 16 bookable units and 6 supply partners — about 2.4 components per booking, which is the attach story in one ratio.",
    "The data org is packaging-shaped. The attach team lives on the component fold: the widest family rides on **54 of 103** bookings while the richest family books **11744.01** of value on 46 — widest attach and fattest value are different families, and every deck says so. The trip-state funnel reads 52 {emerald:completed} travels, 30 in-trip, 14 {amber:pending} in the booking window and 7 {rose:cancelled} — 6.8% of demand that never traveled. Finance owns the settlement stack, where partner money moves as integer cents across 28 invoices and 27 payments.",
    "The SQL screens are live-db and attach-ruthless. You will be asked for a bundle read — units, value and distinct bookings per family — and the trap is grain: 251 components fold through the join until COUNT(*) counts components and calls them bookings. You will be asked for a bundle-depth ladder — single-family versus two-family versus three-plus — and the trap is the fold that defines depth. Anti-join drills return **zero rows** here (every unit and every booker has transacted), and the component price ceiling sits at **199.99**, so premium-band filters come back empty by construction.",
    "Prep the way the screens run: conditional folds and `COUNT(DISTINCT …)` until a bundle census is one query with the denominator printed; joins plus aggregates until per-booking and per-family reads survive the fan-out; window ranks for the deal boards; julianday for the **2.98-day** average booking-to-travel lead; month buckets via `SUBSTR(created_at, 1, 7)` across 2024-01 to 2025-02. Then rehearse the two sentences the interviewer grades: *a component is a line, a booking is a PNR — and depth, attach and value are three different folds over the same rows*.",
  ],

  dayInLife: [
    "**07:30 —** Attach board first: the overnight census — 103 bookings, 251 components, completed 52, in-trip 30, 14 {amber:pending} in the window, 7 {rose:cancelled} — and the widest-attach family beside it, 54 bookings carrying 121 units. *The attach share prints next to its denominator or the packaging lead sends it back.* The Express Deal pace roll runs before standup.",
    "**11:15 —** Deep work: the bundle-depth ladder. Fold components to booking grain — `COUNT(DISTINCT family)` per booking — and the buckets land at 40 multi-family bookings worth 20537.11, 34 two-family worth 10928.62, 29 single-family worth 3367.55. The instinct being trained: depth is a definition, so the fold is written down before the buckets are counted.",
    "**14:30 —** Partner review: the settlement stack in cents — card 16 payments worth 37364 against wire 11 worth 32248 — with the {rose:void}-but-paid batch (925) flagged before the tie-out, and one refundable settlement sitting 4000-paid of a 6148 bill. Revenue management wants the cancellation haircut on the forecast slide: 6.8% of bookings never travel.",
    "**17:45 —** EOD writeup: the attach note ships with definitions attached — attach as distinct bookings per family, depth as distinct families per booking, lead time as julianday on completed travel only (**2.98** days) — and the data-quality queue takes the double-logged partner feed rows for a `ROW_NUMBER` dedupe. The note goes out; the denominators ride along.",
  ],

  metrics: [
    { name: "Bundle attach rate", what: "Bookings carrying 2+ component families over all bookings — 74 of 103 on the db. The packaging team's heartbeat; a booking that never attaches is standalone inventory sold at zero synergy." },
    { name: "Value per basket", what: "Family component value over DISTINCT bookings touching it — 255.3 for audio against 61.01 for the widest-attach family. Tells packaging which families ride on few, fat baskets." },
    { name: "Express-deal in-trip share", what: "Bookings with travel underway or complete over all bookings — 82 of 103, 79.6%. The state-free read that keeps pending and cancelled in the denominator where they belong." },
    { name: "Components per booking", what: "Line items over bookings — 251 over 103, about 2.4. The raw attach proxy: how many components the average reservation carries beyond the first." },
    { name: "Cancellation share", what: "Cancelled bookings over all bookings — 6.8% network, 8.1% in the APAC-like market. Every attach forecast carries this haircut before components are re-released." },
    { name: "Booking-to-travel lead", what: "julianday(travel) minus julianday(booking) on the 82 completed-or-underway bookings — 2.98 days average, range 2 to 4. The window a cross-sell nudge actually has." },
    { name: "Booker concentration", what: "Share of booking value from bookers above a lifetime threshold — 63.5% at the 3000 line. Even a deals brand has whales, and packaging knows their bundles." },
    { name: "Average booking value", what: "Mean booking total — 338.19 network, 383.48 in the richest market, 313.66 in the busiest one. Bundle mix shifts show up here before they reach the margin calls." },
  ],

  topics: [
    {
      name: "Bundle attach folds",
      why: "Every attach read is a join-plus-aggregate fold at family grain: units, value and DISTINCT bookings per family, one pass. The drills are per-family demand folds; the graded part is stating whether a number counts components, units or bookings.",
      slugs: ["product-sales-analysis-ii", "sales-analysis-i", "product-sales-analysis-iii"],
    },
    {
      name: "Bundle-depth definition folds",
      why: "A package is a booking whose components span families — depth is COUNT(DISTINCT family) per booking, then bucketed. Co-occurrence and per-booking distinct folds are the exact drills, and basket-depth is the KPI they feed.",
      slugs: ["basket-depth-aov", "customers-who-bought-a-and-b-not-c", "find-product-recommendation-pairs"],
    },
    {
      name: "Express-deal price reads",
      why: "Opaque inventory lives on price state: the going rate at a given date, average selling price per unit, best-rule final price after deal discounts. Argmax-over-time and price folds are the daily bread of the deals desk.",
      slugs: ["product-price-at-a-given-date", "average-selling-price", "calculate-product-final-price"],
    },
    {
      name: "Attach-share ratio math",
      why: "Attach shares, completion percentages and per-market rates are ratios over stated denominators — the 100.0 must sit before the slash. Each drill is a fold over a base the reviewer will ask you to print beside it.",
      slugs: ["queries-quality-and-percentage", "percentage-of-users-attended-a-contest", "card-launch-success"],
    },
    {
      name: "Zero-attach anti-joins",
      why: "A supply family no booking ever attaches, a partner with no sold inventory — the anti-join is the packaging leak detector. On this db every unit and booker has transacted, so the drill includes recognizing when zero is the true answer.",
      slugs: ["sellers-with-no-sales", "customer-who-visited-but-did-not-transact", "find-churn-risk-customers"],
    },
    {
      name: "Refundable coverage ledgers",
      why: "Refundable components and partner bills are settlement reads: every invoice LEFT JOIN its payments, coverage classified exact, partial or none. LEFT JOIN folds with NULL arms are the drill — 6 books here carry no settlement at all.",
      slugs: ["bank-account-summary", "combine-two-tables", "employee-bonus"],
    },
    {
      name: "Deal-funnel conversion",
      why: "The deals funnel is searched, compared, booked — conversion at each step, and the histogram of books per visit. Funnel pivots and A/B lift reads are the exact shapes, denominators stated per stage.",
      slugs: ["funnel-step-conversion", "ab-test-conversion-lift", "transactions-per-visit-histogram"],
    },
    {
      name: "Package pace by month",
      why: "Booking pace is read in month buckets — bookings, cancellations and value per 'YYYY-MM' key across 2024-01 to 2025-02. Date-filter folds that keep the whole window in the denominator are the pace-pack staples.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Deal boards & ranking",
      why: "Express Deal boards, top-booker lists and recent-package trackers are window ranks over folded aggregates — with ties that must share rungs honestly and recency defined deterministically.",
      slugs: ["rank-scores", "top-earners", "the-most-recent-three-orders"],
    },
    {
      name: "Booker spend ladders",
      why: "Packaging targets whales: spend-tier ladders over lifetime value, spend histograms, RFM tiles. The 63.5% concentration line is computed exactly this way — folded per booker, then bucketed.",
      slugs: ["customer-purchasing-behavior-analysis", "spend-histogram", "rfm-segmentation"],
    },
  ],

  theory: [
    {
      id: "priceline-t1",
      q: "Your attach query joins bookings to their package components and the booking count explodes. What happened and what's the fix?",
      a: "The join fanned out: 103 bookings carry 251 components, so joining to components multiplies booking rows and COUNT(*) counts SKUs, not bookings. The fix is grain honesty — either fold components to booking level in a CTE and join up, or keep the fan-out and fold with COUNT(DISTINCT oi.order_id). I say the three counts out loud on any attach read: components (251), bookings (103), bookers (16 on this db) — and the one the slide claims must match the fold actually written. An attach number built on the wrong grain isn't slightly off; it's a different metric wearing the right name.",
      tag: "joins",
    },
    {
      id: "priceline-t2",
      q: "The Express Deal board ranks partners by booking count and two partners tie. How do you make the tie a decision instead of an accident?",
      a: "Pick the window function by its tie policy and state it: ROW_NUMBER breaks ties arbitrarily — the board looks precise and is actually ordered by rowid. RANK gives tied partners the same rung and skips consumed slots (2, 2, then 4), which is honest about how many partners sit above. DENSE_RANK numbers rungs consecutively and hides the depth of the tie. On a partner board I ship RANK with a deterministic tiebreaker (partner id), and if the tie itself matters — two partners at the same attach — I surface the tie as a column, because 'tied' is a fact the deals desk will act on, not noise to hide behind an arbitrary integer.",
      tag: "windows",
    },
    {
      id: "priceline-t3",
      q: "Write the trip-state census in one query: booked, travel complete or underway, cancelled, share. Where do candidates go wrong?",
      a: "One pass with conditional folds: COUNT(*) AS booked, COUNT(*) FILTER (WHERE shipped_at IS NOT NULL) AS traveled, COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled, and ROUND(100.0 * traveled / COUNT(*), 1) — 103, 82, 7, 79.6 on this db. The classic failure is a WHERE clause: filtering cancelled out 'to keep it clean' shrinks the base to 96 and prints a share the funnel never earned; the second is integer division, where 100 * 82/103 truncates because the 100.0 entered after the slash. Every booking sits in exactly one conditional bucket and all of them stay in the denominator — that is the whole definition, and the census prints the base beside the share so nobody asks.",
      tag: "aggregation",
    },
    {
      id: "priceline-t4",
      q: "shipped_at is NULL on 21 bookings. What does that NULL mean here, and how should queries treat it?",
      a: "On this mapping the NULL is a business state: travel hasn't completed — 14 bookings pending in the booking window and 7 cancelled, 21 total. Treating it as dirty data is the cardinal error: filling it with today's date fabricates completions, excluding those rows from an attach read shrinks the denominator and flatters every share. The honest tools are state-based: COUNT(shipped_at) rides the NULL-blindness for the traveled numerator, shipped_at IS NULL splits the not-traveled arm into pending versus cancelled by joining on status, and julianday lead math over NULL rows NULLs them — correct, because a booking that never traveled has no lead. NULL here is information; the queries should read it, not repair it.",
      tag: "nulls",
    },
    {
      id: "priceline-t5",
      q: "Where do WHERE and HAVING each belong in a per-family attach query, and why does mixing them up matter?",
      a: "WHERE filters rows before the fold: market slices, date windows, 'bookings created this month'. HAVING filters groups after the fold: families attaching on at least 10 bookings, partners whose value clears a floor. The pipeline order is FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, and the two are not interchangeable — WHERE COUNT(*) fails because the fold doesn't exist yet, and pushing a row filter into HAVING folds data you then throw away. On an attach board the difference is visible: gate the thin families in HAVING so a two-booking family can't top the board on sample size, and keep the market slice in WHERE so the fold only ever saw the rows that mattered.",
      tag: "pipeline",
    },
    {
      id: "priceline-t6",
      q: "Packaging wants families whose value per basket beats the network average basket. Subquery, window, or CTE?",
      a: "All three are honest; the definition's weight picks one. A scalar subquery — HAVING the family's per-basket fold > (SELECT the same fold over all rows) — is the compact benchmark read. A windowed fold, AVG(SUM(value)) OVER (), keeps every family in the result with its premium visible, which is what the deck wants. A CTE earns its place when 'basket value' needs a definition — fare-type components excluded, refundables netted — because a named two-stage fold survives review and a nested one-liner doesn't. What's not negotiable: the benchmark and the families must fold on the same grain, or the comparison is components against bookings.",
      tag: "subqueries",
    },
    {
      id: "priceline-t7",
      q: "Two date reads every week: booking pace by month and booking-to-travel lead by market. What machinery does each need?",
      a: "Pace is bucketing: SUBSTR(created_at, 1, 7) makes a '2024-01' month key that GROUP BY folds and sorts correctly — the 14-bucket trend from 2024-01 (8 bookings, 3731.97) through 2025-02. Lead time is instant math: julianday(shipped_at) - julianday(created_at) on the 82 traveled bookings, averaged to 2.98 days with the 2-to-4 range quoted, because the cross-sell window is sized in days. The traps I name out loud: bucketing the raw timestamp gives one row per booking; julianday over NULL completions NULLs those rows, which is the definition and not a bug; and the round happens once at the edge so the deck, the query and the audit all print the same number.",
      tag: "dates",
    },
    {
      id: "priceline-t8",
      q: "One partner feed double-logs components, and finance just found a void invoice carrying a payment. How do you keep both from poisoning attach reads?",
      a: "Dedupe on a natural key, reconcile states against evidence. For the feed: ROW_NUMBER() OVER (PARTITION BY booking, component, event_time ORDER BY ingested_at DESC, id DESC) and keep rn = 1 — with the tiebreak stated, because 'latest' needs a deterministic definition when timestamps tie. For finance: conditional counts that cross-examine status against payment rows surface the void-but-paid invoice (925 on this db) and the paid-with-no-payments case (1756) before the tie-out, and the cents discipline — integer cents over 100.0 — keeps the money honest. The habit being graded: row counts are claims, keys and evidence are truth, and an attach number shipped from a deduped, reconciled base is the only one worth defending.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "priceline-mcq-1",
      prompt: "Bundle attach census. Which fragment counts UNITS per component family — 121 in the widest-attach family?",
      choices: [
        "COUNT(oi.quantity)",
        "SUM(oi.quantity)",
        "MAX(oi.quantity)",
        "COUNT(DISTINCT oi.quantity)",
      ],
      answer: 1,
      why: "SUM(quantity) is the unit census per family — 121, 97, 85 … the attach board's numerator. COUNT counts component LINES, MAX prints the single biggest line, and DISTINCT quantity collapses to the number of distinct quantities.",
      notes: [
        { choice: 0, why: "COUNT(oi.quantity) counts component lines, not units — 251 lines across the network, not 498 units. The attach board would understate every family." },
        { choice: 2, why: "MAX prints the largest single line's quantity — a per-line maximum, not a family census. One booking's fat component would stand in for the whole family." },
      ],
      difficulty: "easy",
    },
    {
      id: "priceline-mcq-2",
      prompt: "Attach share = bookings carrying a family over ALL bookings. Which expression prints the share without integer truncation?",
      choices: [
        "100 * attach / 103",
        "100.0 * attach / COUNT(*)",
        "CAST(attach / 103 AS REAL) * 100",
        "attach / 103.0 (multiply in the deck)",
      ],
      answer: 1,
      why: "The 100.0 promotes the fold to real arithmetic BEFORE the division. Integer division happens first in every other option and truncates at the slash.",
      notes: [
        { choice: 0, why: "attach/103 in integer arithmetic floors to 0 for most families; times 100 stays 0. The .0 must enter before the slash, not after." },
        { choice: 2, why: "The cast happens after the integer division has already floored. Real-promotion must precede the slash — the cast decorates a truncated number." },
      ],
      difficulty: "easy",
    },
    {
      id: "priceline-mcq-3",
      prompt: "Booking pace by month for the packaging pack. The GROUP BY key is:",
      choices: [
        "created_at (raw timestamp)",
        "strftime('%Y', created_at)",
        "SUBSTR(created_at, 1, 7)",
        "DATE(created_at) reformatted in the deck",
      ],
      answer: 2,
      why: "SUBSTR(created_at, 1, 7) builds the '2024-01' year-month key — 14 buckets from 2024-01 (8 bookings, 3731.97) to 2025-02 — that sorts correctly as text and folds the whole window.",
      notes: [
        { choice: 0, why: "The raw timestamp gives one group per booking — 103 rows of one. Pace needs a derived bucket key, not the raw instant." },
        { choice: 1, why: "%Y collapses the window to two rows: 2024 and 2025. The seasonality story — and the YoY comparison — needs the month in the key." },
      ],
      difficulty: "easy",
    },
    {
      id: "priceline-mcq-4",
      prompt: "Value per basket by component family: family value divided by bookings carrying it. The denominator is:",
      choices: [
        "COUNT(*) after joining order_items to products",
        "COUNT(DISTINCT oi.order_id)",
        "SUM(oi.quantity)",
        "COUNT(DISTINCT p.id)",
      ],
      answer: 1,
      why: "A basket is a booking, and the join fans each booking to one row per component — 103 bookings become 251 rows. COUNT(DISTINCT oi.order_id) folds back to distinct baskets: 46 for the audio family against 11744.01 of value.",
      notes: [
        { choice: 0, why: "COUNT(*) counts COMPONENTS — 251 across the network — and calls them bookings. Per-basket value drops about 2.4x and the attach story quietly inverts." },
        { choice: 2, why: "SUM(quantity) is the unit census (121 in the widest family) — units over baskets is units-per-booking, a different metric than value-per-basket." },
      ],
      difficulty: "medium",
    },
    {
      id: "priceline-mcq-5",
      prompt: "The bundle-depth ladder needs each booking's family count. The right per-booking fold is:",
      choices: [
        "COUNT(oi.quantity) grouped by booking",
        "COUNT(DISTINCT p.category) per booking",
        "SUM(p.category) per booking",
        "COUNT(DISTINCT oi.order_id) per booking",
      ],
      answer: 1,
      why: "Depth is how many FAMILIES a booking spans, so the fold is COUNT(DISTINCT p.category) grouped by the booking — 40 bookings span 3+, 34 span exactly two, 29 stay single-family on this db.",
      notes: [
        { choice: 0, why: "That counts component LINES per booking — the 2.4 components-per-booking metric, not family depth. A one-family booking with five lines would read as depth five." },
        { choice: 3, why: "Every booking is exactly one order_id — that fold returns 1 for everyone. Depth needs the family key, not the booking key." },
      ],
      difficulty: "medium",
    },
    {
      id: "priceline-mcq-6",
      prompt: "The partner board ranks by bookings. Two partners tie in third (two sit above). What does RANK() print for the pair and the next partner?",
      choices: [
        "3, 4 then 5 — no shared rungs",
        "3, 3 then 4 — consecutive rungs, no skip",
        "3, 3 then 5 — ties share, next skips by tie size",
        "5, 5 then 6 — ties take the last slot",
      ],
      answer: 2,
      why: "RANK ties share the rung and the next partner's rank jumps past the whole tie block: 3, 3, then 3 + 2 = 5. ROW_NUMBER would print 3, 4 arbitrarily; DENSE_RANK would print 3, 3, then 4 with no skip.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER — arbitrary distinct ranks inside the tie. The board would show one partner 'ahead' for no reason at all." },
        { choice: 1, why: "That's DENSE_RANK — consecutive rungs that hide how deep the tie was. Defensible convention; not what RANK does." },
      ],
      difficulty: "medium",
    },
    {
      id: "priceline-mcq-7",
      prompt: "Refundables audit: which query shape finds settlement bills with NO payment received — the 6 open exposure on this db?",
      choices: [
        "INNER JOIN invoices to payments and filter status",
        "invoices LEFT JOIN payments … WHERE payment.id IS NULL",
        "COUNT(*) from payments grouped by invoice",
        "WHERE invoice.amount > 0",
      ],
      answer: 1,
      why: "The anti-join shape: LEFT JOIN keeps every bill, and IS NULL on the payment key keeps only the unmatched — 6 books totaling 15217 cents of exposure. INNER JOIN hides the exact rows you're hunting.",
      notes: [
        { choice: 0, why: "An INNER JOIN to payments can only return bills that HAVE payments — the unpaid 6 vanish from the result before any filter runs." },
        { choice: 2, why: "Counting payments per invoice describes the paid side only; bills with zero payment rows don't appear in a GROUP BY over payments at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "priceline-mcq-8",
      prompt: "'Bookings still in play' = reserved, not yet traveled, not cancelled. Which predicate returns exactly the 14 pending bookings?",
      choices: [
        "WHERE shipped_at IS NULL — 21 bookings",
        "WHERE status <> 'cancelled' — 96 bookings",
        "WHERE shipped_at IS NULL AND status <> 'cancelled' — 14 bookings",
        "WHERE status = 'pending' OR shipped_at IS NULL — 35 bookings",
      ],
      answer: 2,
      why: "The 21 not-traveled bookings (shipped_at IS NULL) split into 14 pending and 7 cancelled. In-play keeps only the pending arm: both conditions, because each alone over-counts by 7 or by 82.",
      notes: [
        { choice: 0, why: "shipped_at IS NULL includes the 7 cancelled bookings — demand that will never travel. Claiming it's 'in play' inflates the re-release pool." },
        { choice: 1, why: "status <> 'cancelled' keeps all 82 traveled bookings too. 'Not cancelled' is not 'still pending' — the traveled arm must be excluded as well." },
      ],
      difficulty: "hard",
    },
    {
      id: "priceline-mcq-9",
      prompt: "The booker board joins bookings to components and ranks by COUNT(*). The top booker shows 30 'bookings' but has 3. What happened?",
      choices: [
        "The booker really bundles 10x more than anyone — ship it",
        "The join fanned out: COUNT(*) counts components, so rank by COUNT(DISTINCT o.id) or fold components per booking first",
        "COUNT(*) auto-deduplicates joined rows",
        "The rank should be SUM(o.id) instead",
      ],
      answer: 1,
      why: "On the fanned-out grain, COUNT(*) is the booker's COMPONENT count — 30 SKUs across 3 bookings — not bookings. The board must fold at booking grain (COUNT(DISTINCT o.id)) or stage components-per-booking in a CTE before ranking.",
      notes: [
        { choice: 0, why: "That's how a component whale gets reported as a frequency whale — two different bookers. The packaging campaign that targets 'frequent bookers' would mail an attach outlier." },
        { choice: 3, why: "SUM over an id column adds id VALUES — a number that grows with id assignment. Aggregating an id is always a smell, never a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "priceline-mcq-10",
      prompt: "The settlement ledger stores the void-but-paid bill as 925. The dollar figure the exec deck prints is:",
      choices: [
        "925.00 — the ledger stores dollars",
        "9.25 — ledger money is INTEGER cents, divide by 100.0",
        "92.50 — divide by 10",
        "0.925 — divide by 1000",
      ],
      answer: 1,
      why: "Invoices, payments, expenses and ledger rows are INTEGER cents on this db — 925 cents is 9.25 dollars after 925 / 100.0. Orders.total and unit_price are the only dollar-valued columns.",
      notes: [
        { choice: 0, why: "That's the classic nine-hundred-fold overstatement — printing cents as dollars. Every settlement slide sourced from invoices/payments needs the /100.0." },
        { choice: 2, why: "Dividing by 10 has no basis in the schema — the unit is cents, so the divisor is 100.0, and the ROUND happens once at the edge." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-pcln-1",
      tier: "medium",
      topic: "j7",
      universe: "catalog",
      title: "The package attach board",
      brief:
        "Priceline-flavored brief on the storefront db (orders = bookings, order_items = package components, products = component families): the packaging review opens with the attach census — per component family, units sold, distinct bookings carrying it, and component value — widest attach first, because packaging targets the families that ride on the most bookings and prices the ones that ride on the fattest. Probed facts: 251 components across 103 bookings worth 34833.28. The attach board runs Accessories 121 units over 54 bookings worth 3294.29, Audio 97 over 46 worth 11744.01, Electronics 85 over 40, Video 61 over 30, Wearables 53 over 23, Apparel 54 over 22, Fitness 27 over 13 — widest attach and richest value are different families, and the board shows both.",
      ask: "Return per component family: units, component value (2dp), distinct bookings carrying it — biggest attach first.",
      template:
        "SELECT p.category,\n       {1}(oi.quantity) AS units,\n       COUNT(DISTINCT oi.order_id) AS baskets,\n       ROUND(SUM(oi.quantity * oi.unit_price), {2}) AS line_value\nFROM order_items oi\nJOIN products p ON p.id = oi.{3}\nGROUP BY {4}\nORDER BY baskets {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the unit fold",
          why: "SUM(oi.quantity) is the attach census — 121 units in the widest family. COUNT(oi.quantity) counts component LINES (251 network-wide, not 498 units) and MAX(quantity) prints one booking's biggest line as a family census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Component value prints to 2dp — 3294.29, 11744.01 — the shape every money cell in the pack carries. ROUND to 0 publishes 3294 and 11744, numbers no other slide shows.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the family key",
          why: "Components attach to families through the product key: p.id = oi.product_id. Joining on order_id would bolt families onto booking ids — the audio family's value becomes 1361.35 of pure noise.",
        },
        {
          answer: "p.category",
          kind: "keyword",
          label: "the family grain",
          why: "The attach board folds at family grain: GROUP BY p.category gives seven rows. GROUP BY p.id gives 16 — a per-unit board that fragments the attach story the memo asked for.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the widest-attach order",
          why: "Packaging reads the attach end first: 54, 46, 40 … down to 13 bookings. ASC would lead with Fitness — the thinnest attach — and frame the meeting backwards.",
        },
      ],
      distractors: ["MAX", "COUNT", "0", "order_id", "p.id", "ASC"],
      walkthrough:
        "An attach fold where the grain is the whole game. Components join to families on the product key; GROUP BY p.category folds 251 lines into seven families; and three counters read three truths off the same rows — SUM(quantity) is units (121 in the widest family), ROUND(SUM(quantity * unit_price), 2) is component value (11744.01 in the audio family), and COUNT(DISTINCT oi.order_id) is attach, folded back through the fan-out to distinct bookings (54). The board reads widest-attach first: 54, 46, 40, 30, 23, 22, 13 — with value sitting beside it so nobody equates busiest with richest. The distractors all move a number: MAX invents a biggest-line census, COUNT reports lines as units, the wrong join key re-parents every family, GROUP BY p.id fragments seven families into sixteen units, ROUND to 0 prints whole units of money, and ASC leads the meeting with the thinnest attach. State the grain per column; the fan-out forgives nothing.",
    },
    {
      id: "cs-pcln-2",
      tier: "hard",
      topic: "q5",
      universe: "funnel",
      title: "The bundle-depth ladder",
      brief:
        "Priceline-flavored brief on the storefront db (orders = bookings, order_items = package components, products = component families): the packaging memo defines a package as a booking whose components span 2+ families, and asks for the depth ladder — single-family, two-family, three-or-more — bookings and value per rung, fattest rung first. Probed on the db: of 103 bookings worth 34833.28, 40 span 3+ families and carry 20537.11, 34 span exactly two and carry 10928.62, and 29 stay single-family carrying 3367.55 — bundles are roughly 72% of bookings and 90% of value. The ladder must fold depth at booking grain first, then bucket — a ladder computed from raw component rows would count lines and call it depth.",
      ask: "Return per depth bucket: bookings and component value (2dp) — fattest bucket first.",
      template:
        "SELECT CASE WHEN b.families >= {3} THEN 'multi-family bundle'\n            WHEN b.families = 2 THEN 'two-family bundle'\n            ELSE 'single-family' END AS bundle,\n       COUNT(*) AS bookings,\n       ROUND(SUM(b.value), {4}) AS value\nFROM (SELECT o.id,\n             COUNT({1} p.category) AS families,\n             SUM(oi.quantity * oi.unit_price) AS value\n      FROM orders o\n      JOIN order_items oi ON oi.order_id = o.id\n      JOIN products p ON p.id = oi.{2}\n      GROUP BY o.id) b\nGROUP BY bundle\nORDER BY value {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the depth fold",
          why: "Depth counts DISTINCT families per booking — COUNT(DISTINCT p.category). Without DISTINCT the fold counts component LINES (2.4 per booking on average) and a one-family booking with five lines reads as depth five.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the family key",
          why: "Components reach families through p.id = oi.product_id. Joining on order_id would pair product ids with booking ids — the inner fold collapses to 16 single-family rows and the ladder misreads the whole network.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the multi threshold",
          noVerify: true,
          why: "The memo defines multi as 3+ families — WHEN b.families >= 3. At 2 the top rung swallows the two-family rung and the ladder loses the middle step packaging prices against.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          noVerify: true,
          why: "Rung value prints to 2dp — 20537.11, 10928.62, 3367.55 — matching every money cell in the pack. ROUND to 1 publishes 20537.1, a number no other slide carries.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the fattest-first order",
          why: "The memo reads value top-down: 20537.11, 10928.62, 3367.55. ASC would lead with single-family — the smallest rung — and tell the packaging story upside down.",
        },
      ],
      distractors: ["ALL", "order_id", "1", "0", "ASC"],
      walkthrough:
        "A two-stage fold where stage one defines the metric. The derived table folds 251 components to booking grain: SUM(quantity * unit_price) is booking value, COUNT(DISTINCT p.category) is family depth — DISTINCT is the whole definition, because lines-per-booking averages 2.4 and would smear depth across component count. GROUP BY o.id lands one row per booking; the outer query CASE-buckets depth into 3+, two and single — 40 bookings worth 20537.11, 34 worth 10928.62, 29 worth 3367.55 — and orders fattest-first. The distractors each rewrite a rung: ALL (or any non-DISTINCT fold) recounts lines as families and repopulates the ladder, the wrong join key collapses it to 16 phantom single-family rows, a threshold of 1 swallows every booking into multi, ROUND to 0 prints whole units of money, and ASC reads the ladder from its smallest rung. Define depth once, at booking grain, in writing — then bucket.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-family demand folds from component lines — the attach census at the right grain: families, not lines, not bookings." },
    { slug: "sales-analysis-i", why: "Per-buyer totals from line items — the per-booker value read packaging targets whales with, folded without the fan-out." },
    { slug: "product-sales-analysis-iii", why: "First-purchase timing per unit — the Express Deal launch read: which inventory families a booker touches first." },
    { slug: "basket-depth-aov", why: "Depth and average value per basket — the bundle-depth ladder in textbook form: lines per basket against value per basket." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-family co-occurrence with an exclusion arm — the pure-package read: bookers who attach two families but never the third." },
    { slug: "find-product-recommendation-pairs", why: "Family pairs folded from shared bookings — the cross-sell matrix: which two families ride together on the same reservation." },
    { slug: "product-price-at-a-given-date", why: "Going rate as of a date with fallbacks — the Express Deal price state: the rate in force when the booker compared." },
    { slug: "average-selling-price", why: "Weighted average price over units and periods — the realized-deal rate per family, units-weighted the way revenue management reads it." },
    { slug: "calculate-product-final-price", why: "Best-rule discount application — the opaque-deal markup math: list rate, discount rule, final price in one fold." },
    { slug: "queries-quality-and-percentage", why: "Per-entity quality ratios — the attach-share and completion-share shape: a ratio per family with the denominator folded honestly beside it." },
    { slug: "percentage-of-users-attended-a-contest", why: "Distinct-participation shares — the attach-share pattern in another costume: DISTINCT bookers over stated bases, real division throughout." },
    { slug: "card-launch-success", why: "Rollout success rates per cohort — the new-family launch read: attach rate before versus after the deal goes opaque." },
    { slug: "sellers-with-no-sales", why: "Partners with no moved inventory — the supply-leak anti-join; on this db it returns zero, and knowing that is the drill." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Bookers who compared but never booked — the abandoned-basket read behind re-marketing, anti-join shaped." },
    { slug: "find-churn-risk-customers", why: "Lapsed high-value bookers — the whale winback list: lifetime value folded first, recency gate second." },
    { slug: "bank-account-summary", why: "Per-account deposit and withdrawal folds — the refundable-settlement ledger: money in, money out, net per book." },
  ],
};
