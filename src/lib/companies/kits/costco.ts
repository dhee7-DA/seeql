// Costco — kit 15 of the E-commerce & Marketplace domain (Batch M, wave 8).
// Wave-8 (Task 96), ecom domain, ~1 tagged LC row (fifo-inventory-cogs,
// tagged Walmart + Costco in the theme menu) — theme-curated; facts from
// scripts/company-facts.md. The kit leans warehouse-club economics: membership
// fee base, pallet turnover, Kirkland-style private label, bulk basket sizes,
// executive-tier 2% reward, gas-station attach, sample-driven conversion.
// Db mapping (honest): customers=members, orders=purchase baskets,
// order_items=case lines, products=SKUs (pallet/case goods),
// suppliers=brand vendors, invoices=business-member statements (INTEGER
// cents), payments=settlement rails, shipped_at=big-and-bulky fulfillment
// scan, regions=market clusters. Case studies run on the storefront db with
// probed figures from scripts/company-facts.md.

import type { CompanyKit } from "../types";

export const costcoKit: CompanyKit = {
  id: "costco",
  domainId: "ecom",
  name: "Costco",
  tagline: "Warehouse-club membership economics, pallet by pallet",
  accent: "text-red-300",

  brief: [
    "**Costco** is the membership warehouse club that turned bulk into a business model: members pay the {amber:annual fee} for the right to buy pallet-priced goods in case lots, and the fee base — not per-item markup — is where the margin lives. On this kit's proxy db the census reads 16 members placing 103 baskets that fan into **251 case lines**, worth 34833.28 at an average of **338.19** a basket — and the ticket floor of 25.47 says even the smallest run is never a one-item trip. *Nobody crosses the warehouse threshold for one item; the case pack decides the basket.*",
    "The data org maps onto the floor plan — a register feed, a fulfillment scan, a billing ledger. The funnel reads **52 delivered, 30 shipped, 14 pending, 7 cancelled** on `orders`, and the big-and-bulky clock averages **2.98 days** over the 82 baskets carrying `shipped_at` — *pending has no clock yet; it is not late*. Business-member statements settle on two rails (card and wire), and the coverage census reads 21 exact, 1 partial, 6 never-settled — the reconciliation the month-close actually ships.",
    "Screens are grain-first. A warm-up folds case lines back to baskets (251 to 103 — say DISTINCT out loud); the escalation is either a **vendor-bench fold** (revenue through `products` to `suppliers`, gated in HAVING) or a **one-pass census** where the population rule is stated before the CASE arms. Follow-ups are spoken: *'per basket or per case line?'*, 'does a cancelled basket age into your pending pile?', 'which member count does the 2% executive reward quote?'",
    "Prep starts with the pool's honesty: Costco carries exactly **one tagged problem** in this app's SQL band (`fifo-inventory-cogs` — Walmart and Costco share the tag), so the kit is theme-curated from the theme menu around warehouse workflows: pallet cover, bulk-basket depth, statement-vs-rail reconciliation, member ladders. Money drills are cents drills — statements and rails are INTEGER cents, divided once by `100.0` at the display edge. The two case studies run on the live db: one rebuilds the **vendor bench** the merchandising lead reads at the pallet review, the other the **member ladder** the CRM cuts for the executive-tier mail-merge.",
  ],

  dayInLife: [
    "**07:45 —** The day opens on the club board, and the first query is the census tie: does the status fold still read **52 delivered, 30 shipped, 14 pending, 7 cancelled** — and does the clock tile hold at **2.98 days** over the 82 scanned baskets? The analyst's eye goes to the cover columns next: three SKUs sit at **14, 15 and 17 units remaining** (the headset, the desktop mic, the smart watch), and each one is a pallet-quantity reorder flag before the weekend rush. *A pending basket is 'not yet', not 'late' — the population note rides in the tile subtitle or the ops forecast inherits a backlog it cannot name.*",
    "**11:20 —** Mid-morning is the pallet review. The merchandising lead wants the vendor bench refolded — scanned revenue down the case-line chain to `suppliers`, gated at the 4000 floor — and the fold reads **Nordic Gadgets AB at 11130.25 (32%)**, **Midwest Hardware Co at 9294.93 (26.7%)** and **Alpine Audio GmbH at 4765.63 (13.7%)**: a three-vendor bench that carries the book while three vendors under 3613.25 wait on the next buy. Then the billing contradiction lands: a statement the ledger marks paid has zero rails against it (1756), while a partial rail (4000.00 of 6148.00) keeps another statement out of the never-settled stack. *The ledger's status is an opinion; the rail is a fact — file the difference as a ticket, not a rounding error.*",
    "**16:00 —** The afternoon tilts to the CRM cycle. The membership lead needs the frequency ladder for the executive-tier review: DENSE_RANK over baskets per member, and the tie discipline matters because **four members sit on exactly 4 baskets** — the rung ships whole (a nine-row cut) or the mail-merge slices a tie and a member files a complaint. The close is the ship-with-query ritual: the ladder leaves with its SQL attached, rails folded as `amount_cents / 100.0`, the five split-settlement statements flagged for finance, and the {emerald:2% reward} accrual quoted per member — never per basket. *In a membership business the next analyst inherits your denominators; write them down or the renewal forecast writes its own.*",
  ],

  metrics: [
    { name: "Renewal-eligible repeat rate", what: "Members with 2+ baskets over all members — 14 of 16 here, top member at 24. The fee-base KPI the membership org is paid on, and a grouped census at the member grain in interview form." },
    { name: "Average basket", what: "Revenue per purchase basket — 338.19 across 103 baskets (34833.28 total). The bulk check: if this number slides toward a convenience-store ticket, the case-pack story is leaking." },
    { name: "Basket depth", what: "Case lines per basket — 251 lines folded back to 103 baskets. The attach read beside it: Accessories touched 54 baskets, Audio 46 — depth by basket-touch, never by raw line count." },
    { name: "Kept-basket share", what: "Non-cancelled baskets over placed — 7 of 103 cancel (6.8%). The denominator rule (cancelled stays in the placed base) is the whole test, and the replenishment forecast runs off the kept fold." },
    { name: "Fulfillment clock", what: "Days from basket to `shipped_at` on the 82 scanned baskets — 2.98 average, 2-to-4 range. Population stated first: the 21 unscanned baskets (14 pending + 7 cancelled) have no latency YET." },
    { name: "Executive concentration", what: "Share of demand from members over 3000 lifetime dollars — 63.5% (71.2% over the 2000 line). The tier-floor read that aims the 2% reward review and every renewal nudge." },
    { name: "Vendor share", what: "Scanned revenue per brand vendor — the top vendor holds 32%, the second 26.7%, and the trusted bench (rating 4.5 and up) holds exactly 2 vendors. Every pallet buy starts from this fold." },
    { name: "Statement coverage", what: "Business-member statements by rail coverage — 21 exact, 1 partial (4000.00 of 6148.00), 6 none (15217.00). The classes finance closes on, and the census every billing screen eventually becomes." },
  ],

  topics: [
    {
      name: "The renewal base: repeat reads at the member grain",
      why: "Costco's P&L stands on the membership fee, so the screens drill repeat mechanics at the member grain: baskets per member, members with 2+ baskets, frequency ladders. The drill is grouped counting with a stated population — 14 of 16 members place 2+ baskets, and a median-of-baskets answer flunks that population question every time.",
      slugs: ["repeat-purchase-rate", "customer-order-frequency", "find-loyal-customers"],
    },
    {
      name: "Bulk-basket depth and AOV",
      why: "Warehouse baskets run fat, and the screens test whether you can fold the case-line grain back honestly: 251 lines over 103 baskets, average ticket 338.19. Basket depth and AOV are the pallet-turnover story, and both break on fan-out unless a DISTINCT rejoins the fold before the ratio prints.",
      slugs: ["basket-depth-aov", "top-earners", "number-of-rich-customers"],
    },
    {
      name: "Tier banding with CASE",
      why: "Gold Star, Executive, Business — membership tiers are CASE arms, and the db drills the shape: spend bands classified in one pass, member categories assigned per row. The graded skill is arm order — a truthy 2000 arm placed before the specific 3000 arm silently re-buckets the book, and the tier counts move without an error.",
      slugs: ["the-category-of-each-member-in-the-store", "count-salary-categories", "loan-types"],
    },
    {
      name: "The never-settled anti-join",
      why: "'Statements that never moved a rail' and 'members whose ladder ended' are LEFT JOIN + IS NULL screens, and the db's honest empties are part of the test — every vendor here has moved, so the vendor anti-join returns an empty set and saying so IS the answer. The drills force the shape: INNER silently deletes exactly the population you hunt.",
      slugs: ["sellers-with-no-sales", "customers-who-never-order", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Business-member billing and the rails",
      why: "Business members settle statements on card and wire rails — 16 card movements worth 37364 against 11 wires at 32248 — and the screens drill the settlement stack: per-statement folds, monthly transaction censuses with cancelled arms, ledger-to-rails reconciliation. The house rule is cents discipline: amount_cents / 100.0, divided once, at the display edge.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "gl-reconciliation"],
    },
    {
      name: "Reorder-cycle month buckets",
      why: "The renewal curve is a calendar read: STRFTIME month keys over 103 baskets across 14 buckets, distinct baskets AND distinct members per month, the cancelled arm carried beside the count. The trap is bucket-key drift — '%m' alone merges January-2024 with January-2025 and the curve lies by collision.",
      slugs: ["monthly-transactions-i", "unique-orders-and-customers-per-month", "friday-purchase-iii"],
    },
    {
      name: "The fulfillment clock",
      why: "Big-and-bulky baskets carry `shipped_at`, and the clock averages 2.98 days over the 82 baskets that have one — 2-to-4 range, whole days. Every clock screen asks which population the average covers: pending baskets have no latency YET, and stating that before the query runs is part of the answer.",
      slugs: ["find-golden-hour-customers", "average-time-of-process-per-machine", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Pallet cover and cost layers",
      why: "The warehouse IS the store, so inventory reads lead: stock minus scanned units per SKU, weeks-of-supply cover, and cost layers consumed FIFO off the pallet — this kit's one Costco-tagged problem in the pools. The thin-stock trio (remaining 14, 15, 17) is the reorder screen the floor team reads hourly.",
      slugs: ["weeks-of-supply", "find-stores-with-inventory-imbalance", "fifo-inventory-cogs"],
    },
    {
      name: "The executive ladder and concentration",
      why: "Spenders over 3000 lifetime dollars carry 63.5% of the book, so tiering is a windows question: DENSE_RANK ladders with ties handled, spend histograms with empty bands visible, RFM tiles on the member base. The follow-up is always the denominator — 63.5% of the 34833.28 book, over WHICH population of members.",
      slugs: ["rank-scores", "spend-histogram", "rfm-segmentation"],
    },
    {
      name: "One-pass censuses at the register",
      why: "The club census is one scan, many arms — delivered, shipped, pending, cancelled in a single fold — and the screens drill conditional aggregation: FILTER (WHERE ...) arms, interval buckets that keep zero rows visible, conditional COUNT DISTINCT. Three passes over 103 baskets is three chances for three WHERE clauses to disagree.",
      slugs: ["count-the-number-of-experiments", "snaps-analysis", "calculate-orders-within-each-interval"],
    },
  ],

  theory: [
    {
      id: "costco-t1",
      q: "Scanned revenue lives on order_items, vendors on suppliers, and the chain between them runs through products. Walk me through the fold that lands revenue on the vendor — and when an INNER join is the wrong call.",
      a: "Two hops, keyed in the direction the foreign keys point: order_items.product_id to products.id, then products.supplier_id to suppliers.id — the chain fans 251 case lines through 16 SKUs onto 6 vendors, and GROUP BY the vendor folds them back to one row each. INNER is the right default for the revenue fold — every scanned line here resolves to a SKU and every SKU to a vendor, so nothing is lost. But flip the question to 'show me each vendor and what it moved' and INNER is the wrong call: a vendor with zero scans would vanish from the census instead of showing revenue 0, and the honest form is suppliers LEFT JOIN the chain with COALESCE(SUM(...), 0) — on this book the answer is that all six vendors moved, and the analyst says so out loud. The other trap is fan-out: basket-touch counts need COUNT(DISTINCT oi.order_id), because the line-level join fans each basket across its case lines — counting raw rows reports the line grain (251) wearing the basket grain's (103) name.",
      tag: "joins",
    },
    {
      id: "costco-t2",
      q: "Rank members by baskets placed for the executive-tier review. Where do RANK, DENSE_RANK and ROW_NUMBER disagree — and which one ships to the mail-merge?",
      a: "They disagree exactly where the metric ties, and a 16-member book ties constantly: the frequency census reads 24, 17, 14, 13, 5, then FOUR members on exactly 4 baskets. RANK gives the tie rung 6 and skips to 10 for the next member — implying members that do not exist; DENSE_RANK shares rung 6 and keeps the next at 7 — compact, and the only form where 'tier 7' means the same thing on Monday and Thursday; ROW_NUMBER splits ties arbitrarily unless you add a deterministic tiebreak, which makes it a dedupe tool, not a ladder tool. The mail-merge ships DENSE_RANK with the tiebreak beside it (spend DESC inside the tie), and the cut respects the block: ranks 1 through 6 occupy exactly nine rows, so LIMIT 9 ships the tie whole — cutting at 8 slices a member out of a tie they belong to, and a sliced tie in a membership business is a member-services ticket, not a rounding error.",
      tag: "windows",
    },
    {
      id: "costco-t3",
      q: "Case lines fan out — 251 lines over 103 baskets. Narrate what COUNT(*), COUNT(col) and COUNT(DISTINCT ...) each measure after the join, and which one the attach-rate read needs.",
      a: "Three counts, three grains. COUNT(*) after the fan-out counts joined rows — the case-line grain, 251. COUNT(p.id) on a LEFT JOIN counts matched lines and skips the NULL-padded rows, which is how an unmatched-SKU screen stays visible. COUNT(DISTINCT oi.order_id) folds back to the basket grain — 103 — and it is the only honest denominator for attach reads: Accessories touched 54 distinct baskets, not 121 units and not the category's line count, and the share is 100.0 * 54 / 103 — real arithmetic, 52.4. The failure mode I watch for is grain laundering: 'lines per basket' computed by averaging a per-line count, or a basket share computed over the 251-row join — both look plausible and both quote a denominator the query never produced. Name the grain out loud before the COUNT; in a bulk business the line grain runs 2.44 times the basket grain, and every ratio picks a side.",
      tag: "aggregation",
    },
    {
      id: "costco-t4",
      q: "A statement's coverage class decides whether the dunning engine fires. What is your NULL policy for rail coverage, and how do you present a paid-status statement with zero rails?",
      a: "Coverage is defined by the rails, not the status column. The census is a LEFT JOIN from statements to settlement rails with a classified fold: exact when rails sum to the bill — 21 statements; partial when money moved but short — 1 statement, a 4000.00 rail against a 6148.00 bill; none when no rail exists — 6 statements worth 15217.00. The 'paid'-status statement with zero rails (1756) lands in 'none', and that row IS the story: the ledger says settled, the rails say nothing moved, and the reconciliation ticket writes itself. Three NULL behaviors ride along: comparisons (rail >= bill is UNKNOWN when the rail is NULL, so the ELSE arm must catch it), aggregates (COUNT(col) skips NULLs, COUNT(*) keeps the statement row), and COALESCE placement — at the display edge, once. Folding NULL paid to 0 for the 'none' class is honest; folding it to the billed amount and calling it covered is how a 1756 hole reaches the renewal board.",
      tag: "nulls",
    },
    {
      id: "costco-t5",
      q: "The vendor bench keeps vendors whose folded revenue crosses 4000. Where does that predicate live, and what breaks if you move it?",
      a: "In HAVING — the floor gates a group after the fold, and WHERE cannot even see it: WHERE runs before GROUP BY, so an aggregate there is a hard error (misuse of aggregate), and the naive workaround — filtering the raw lines — changes the answer, because no single case line is worth 4000. The evaluation order I recite: FROM builds the fan-out, WHERE shrinks rows, GROUP BY folds, HAVING gates groups, SELECT projects, ORDER BY sorts. Two follow-ups worth volunteering: first, in an outer join ON runs before WHERE, so a post-join WHERE on the right table's column silently converts the LEFT JOIN to INNER — the way an anti-join for never-settled statements collapses to empty; second, SQLite resolves the revenue alias inside HAVING, which is convenient, but I write the full SUM expression when the query will be ported. The bench itself proves the stakes: the floor at 4000 keeps exactly three vendors — 4765.63 clears it, 3613.25 does not — one line of predicate deciding which pallets get bought.",
      tag: "pipeline",
    },
    {
      id: "costco-t6",
      q: "You need each member's lifetime spend beside every basket row for the tier flag. Correlated scalar subquery or staged CTE — how do you choose, and what does each cost?",
      a: "The correlated shape — (SELECT SUM(total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — reads cleanly and returns one scalar per outer row, but it re-executes per row: 103 baskets is free, a multi-million-basket warehouse feed is a million rescans. The staged shape — a CTE folding spend per member, joined back — scans once, is reusable, and generalizes the moment the tier flag needs the folded value BESIDE the row: a CASE on lifetime spend, the 63.5%-concentration tier at the 3000 line. My rule: correlated for point lookups keyed tightly to the outer row, CTE for anything reused or banded, and a contract either way — the scalar must return exactly one row, so the inner query keys on the member itself, or a tie breaks the query. The follow-up I volunteer: the concentration read (members over 3000 carrying 63.5% of the 34833.28 book) is a staged fold with a HAVING gate, not 16 correlated subqueries — one scan, one fold, one number the membership board can quote.",
      tag: "subqueries",
    },
    {
      id: "costco-t7",
      q: "Baskets carry TEXT timestamps. How do you bucket them by membership month, window the renewal curve, and where does each approach break?",
      a: "Buckets: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — both yield '2024-01' across the 14 buckets from 2024-01 to 2025-02, and the SUBSTR shortcut works only while the format stays fixed-width ISO. The standing trap is '%m' alone: January-2024 merges with January-2025 and the renewal curve lies by collision. Windows: half-open predicates — created_at >= '2024-01-01' AND created_at < '2024-02-01' — never BETWEEN on the last day, which drops January-31 timestamps ('2024-01-31 08:00' sorts after '2024-01-31'). Gaps: LAG over the per-member ordered stream for days-between-baskets, staged in a CTE; the first basket has no prior and LAG's NULL is data, not a bug. And the population rule every date fold here needs: shipped_at is NULL for 21 of the 103 baskets — pending and cancelled have no clock yet — so any latency average states its 82-basket denominator before the deck prints it.",
      tag: "dates",
    },
    {
      id: "costco-t8",
      q: "Statements and rails store INTEGER cents, and the close must reconcile ledger status against money that actually moved. What is your discipline?",
      a: "Two laws and one ritual. Units: every dollar read is amount_cents / 100.0 — the .0 promotes to real arithmetic before the division, because integer over integer truncates (15217 cents prints 152, not 152.17); divide once, at the display edge, after the fold. Classification: coverage folds per statement — GROUP BY the statement, sum the rails, CASE the sum against the bill — 21 exact, 1 partial, 6 none; and the anomaly classes are hunted by name: void-but-paid (925 moved against a voided statement), paid-with-no-rails (1756 — status opinion, zero movements), split settlements (five statements paying in two rails, folded BEFORE classifying so the partial check sees the whole). The ritual is the reconciliation itself: the open-status ledger names 19609 while the never-settled rails name 15217.00 — the two disagree by exactly the statements that cross sides, and printing both numbers side by side is what the close ships. A reconciliation that prints one number is hiding the other.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "costco-mcq-1",
      prompt: "The weekly register read wants delivered, shipped, pending and cancelled counted in ONE pass over the 103 baskets. Which shape does it?",
      choices: [
        "GROUP BY status over orders",
        "Four correlated subqueries, one per status",
        "A self-join of orders to orders",
        "SELECT DISTINCT status FROM orders",
      ],
      answer: 0,
      why: "GROUP BY status folds all 103 rows into one census — 52 delivered, 30 shipped, 14 pending, 7 cancelled — in a single scan; every arm shares the population, so the arms cannot disagree.",
      notes: [
        { choice: 1, why: "Four subqueries can each carry a different WHERE and drift apart silently — the classic four-pass census bug the one-pass shape exists to kill." },
        { choice: 3, why: "DISTINCT lists the status labels without counts — a census needs the tally, not the vocabulary." },
      ],
      difficulty: "easy",
    },
    {
      id: "costco-mcq-2",
      prompt: "A business-member statement reads 15217 in invoices.amount_cents (INTEGER cents). Which expression prints the dollar figure?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 100",
        "ROUND(amount_cents, 2)",
      ],
      answer: 1,
      why: "15217 / 100.0 promotes to real arithmetic and prints 152.17; rounding once at the display edge keeps the fold exact. Statements and rails both store INTEGER cents on this db.",
      notes: [
        { choice: 0, why: "Integer over integer truncates — 15217/100 prints 152 and silently drops the cents. The .0 is the fix, not a style choice." },
        { choice: 2, why: "Multiplying turns cents into 1521700 — units inverted. Dollars are smaller than cents, never larger." },
      ],
      difficulty: "easy",
    },
    {
      id: "costco-mcq-3",
      prompt: "82 of the 103 baskets carry a fulfillment scan. How many sit outside the clock, and what are they?",
      choices: [
        "21 — 14 pending plus 7 cancelled, no scan yet",
        "21 — all delivered late",
        "7 — the cancelled only",
        "82 — the scanned ones",
      ],
      answer: 0,
      why: "103 minus 82 scanned = 21 baskets without a clock: 14 pending plus 7 cancelled. Pending is 'not yet', cancelled is 'never' — neither is 'late'.",
      notes: [
        { choice: 1, why: "Latency math can only run on the 82 with a scan — the 21 have no clock to be late on, which is why the census gives them their own bucket." },
        { choice: 2, why: "Cancelled is only 7; pending's 14 also lack scans, and dropping them hides tomorrow's missed-delivery pile." },
      ],
      difficulty: "easy",
    },
    {
      id: "costco-mcq-4",
      prompt: "The vendor bench keeps vendors whose SUM(unit_price * quantity) crosses the 4000 floor. Where does the predicate live?",
      choices: [
        "WHERE SUM(oi.unit_price * oi.quantity) >= 4000",
        "HAVING SUM(oi.unit_price * oi.quantity) >= 4000",
        "ON p.supplier_id = s.id AND SUM(oi.unit_price * oi.quantity) >= 4000",
        "ORDER BY SUM(oi.unit_price * oi.quantity) >= 4000",
      ],
      answer: 1,
      why: "The floor gates groups after the fold — HAVING. WHERE runs before GROUP BY and cannot see aggregates at all.",
      notes: [
        { choice: 0, why: "SQLite errors: misuse of aggregate in WHERE. And the raw-line workaround (unit_price >= 4000) keeps no line at all — the fold's input would be empty." },
        { choice: 2, why: "The ON clause pairs rows during the join, before any fold exists — aggregates are illegal there and the semantics would be per-row, not per-vendor." },
      ],
      difficulty: "medium",
    },
    {
      id: "costco-mcq-5",
      prompt: "Frequency ranks run 1-5 as singletons (24, 17, 14, 13, 5 baskets), then four members tie on 4. Under DENSE_RANK, what rung does the first 3-basket member get?",
      choices: ["7", "10", "6", "9"],
      answer: 0,
      why: "The tie shares rung 6 and DENSE_RANK keeps the sequence compact — the next distinct value lands on rung 7.",
      notes: [
        { choice: 1, why: "10 is RANK's answer — it skips the three rungs the tie consumed, implying members that do not exist." },
        { choice: 2, why: "6 would put the 3-basket member INSIDE the tie — DENSE_RANK only shares a rung for equal values." },
      ],
      difficulty: "medium",
    },
    {
      id: "costco-mcq-6",
      prompt: "Which query returns business-member statements that never moved a settlement rail?",
      choices: [
        "invoices INNER JOIN payments WHERE p.id IS NOT NULL",
        "invoices LEFT JOIN payments WHERE p.id IS NULL",
        "invoices CROSS JOIN payments GROUP BY invoice_id",
        "WHERE invoices.status = 'open'",
      ],
      answer: 1,
      why: "LEFT JOIN keeps all 28 statements and NULL-pads the 6 without rails; p.id IS NULL keeps exactly those — the anti-join signature, and the stack is worth 15217.00.",
      notes: [
        { choice: 0, why: "INNER + IS NOT NULL is the opposite screen — the 22 statements that DID move; the never-settled stack ships empty and looks like a clean close." },
        { choice: 3, why: "Status is the ledger's opinion: the stack includes a 'paid'-status statement with zero rails (1756), and the partial rail (4000.00 of 6148.00) keeps an open statement OUT. Status answers a different question." },
      ],
      difficulty: "medium",
    },
    {
      id: "costco-mcq-7",
      prompt: "Bucket the 103 baskets by membership month on TEXT timestamps. Which predicate safely isolates January 2024?",
      choices: [
        "created_at BETWEEN '2024-01-01' AND '2024-01-31'",
        "created_at >= '2024-01-01' AND created_at < '2024-02-01'",
        "STRFTIME('%m', created_at) = '01'",
        "SUBSTR(created_at, 1, 7) = '2024-1'",
      ],
      answer: 1,
      why: "Half-open ranges include every January-31 timestamp ('2024-01-31 08:00' sorts after '2024-01-31', so BETWEEN drops them) and stop cleanly at February 1.",
      notes: [
        { choice: 0, why: "BETWEEN on the last day silently loses every intraday January-31 basket — the month's tail vanishes from the renewal curve." },
        { choice: 2, why: "'%m' without the year merges January-2024 with January-2025 — the curve lies by collision." },
      ],
      difficulty: "medium",
    },
    {
      id: "costco-mcq-8",
      prompt: "The renewal deck wants cumulative demand per month; a teammate swaps SUM for AVG over the same OVER (ORDER BY month) and the numbers drift. Why?",
      choices: [
        "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING to CURRENT ROW — a running frame",
        "AVG is not allowed over windows",
        "The month bucket key collides across years",
        "NULLs in total poison the average",
      ],
      answer: 0,
      why: "With ORDER BY, the default frame is running — SUM gives the cumulative curve you asked for; AVG gives the cumulative average, which drifts toward the whole-book mean and is never the flat monthly mean.",
      notes: [
        { choice: 1, why: "AVG is legal over windows — it is just averaging the RUNNING frame's rows, not the whole partition." },
        { choice: 2, why: "A '%Y-%m' bucket key does not collide; '%m' alone would — a different bug with a different symptom." },
      ],
      difficulty: "hard",
    },
    {
      id: "costco-mcq-9",
      prompt: "Attach share: baskets touching Accessories over all baskets. The line join fans 103 baskets into 251 case lines. Which fold reports the basket side honestly?",
      choices: [
        "COUNT(oi.id) over COUNT(*) on the joined rows",
        "COUNT(DISTINCT oi.order_id) over the 103-basket base",
        "COUNT(p.id) over SUM(oi.quantity)",
        "SUM(oi.quantity) over COUNT(*)",
      ],
      answer: 1,
      why: "The fan-out multiplies rows, so only COUNT(DISTINCT oi.order_id) folds back to baskets — Accessories touched 54 distinct baskets, and the share is 100.0 * 54 / 103 (real arithmetic).",
      notes: [
        { choice: 0, why: "COUNT(oi.id) counts case lines — the 251 grain wearing the basket grain's name; the share deflates with every extra line." },
        { choice: 2, why: "SUM(oi.quantity) is a unit count (121 for Accessories), not a basket count — units and baskets are different denominators." },
      ],
      difficulty: "hard",
    },
    {
      id: "costco-mcq-10",
      prompt: "The tier census lists WHEN lifetime_spend >= 2000 THEN 'executive_watch' BEFORE WHEN lifetime_spend >= 3000 THEN 'executive'. What ships?",
      choices: [
        "3000-plus members land in executive_watch — the truthy arm eats them",
        "Both arms run and the higher tier wins",
        "The query errors on overlapping ranges",
        "2000-to-2999 members land in executive",
      ],
      answer: 0,
      why: "CASE arms evaluate in order and stop at the first true one — a 7000-dollar member matches >= 2000 first and never reaches the executive arm; the specific arm must come first.",
      notes: [
        { choice: 1, why: "CASE has no 'best match' semantics — first true arm wins, full stop." },
        { choice: 2, why: "Overlaps are legal and silent — that is exactly why arm ORDER is the test; nothing errors, the book just re-buckets." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-costco-1",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The vendor bench behind the pallet wall",
      brief:
        "Costco-flavored case on the storefront db (order_items = case lines, products = SKUs, suppliers = brand vendors behind the pallets): the merchandising lead opens the pallet review with the concentration fact — the top vendor carries 11130.25 of scanned revenue (32% of the book) and the second 9294.93 (26.7%). 'Vendor concentration is the private-label story: pull me the core bench — every vendor whose scanned revenue crosses the 4000 floor, revenue to 2 decimals, biggest first.' Probed facts: the bench holds exactly three vendors — Nordic Gadgets AB 11130.25, Midwest Hardware Co 9294.93, Alpine Audio GmbH 4765.63 — while Andes Naturals SA (3613.25), Shenzhen Electro (3049.07) and Pacific Textiles (2980.15) sit under the line.",
      ask: "Return the core vendor bench: vendor name and scanned revenue to 2 decimals, biggest first, for vendors at or above the 4000 floor.",
      template:
        "SELECT s.name,\n       ROUND(SUM({1}), 2) AS revenue,\n       COUNT(DISTINCT oi.order_id) AS baskets_touched\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = {2}\nGROUP BY s.name\nHAVING revenue >= {3}\nORDER BY revenue {4};",
      slots: [
        {
          answer: "oi.unit_price * oi.quantity",
          kind: "keyword",
          label: "the case-line revenue fold",
          why: "Revenue folds line by line: unit_price times quantity per case line, summed, rounded once. SUM(oi.unit_price) alone prices one unit per line and understates every multi-quantity case; SUM(oi.quantity) returns unit counts wearing dollar formatting.",
        },
        {
          answer: "p.supplier_id",
          kind: "keyword",
          label: "the vendor key on the chain",
          why: "The chain is order_items → products → suppliers, so the vendor key is p.supplier_id. s.supplier_id does not exist (suppliers key on id), and s.id = oi.product_id would attribute every case line to whichever vendor happens to share the SKU's id — silently wrong, visibly plausible.",
        },
        {
          answer: "4000",
          kind: "number",
          label: "the bench floor",
          noVerify: true,
          why: "The floor is the stakeholder's line, not a figure the query prints: 4000 keeps exactly the three-vendor bench — 4765.63 clears it, 3613.25 does not. A 3000 floor reads five rows and the meeting debates two vendors that never cleared the buy.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-vendor-first direction",
          why: "The pallet review leads with the heaviest pallet: DESC puts Nordic 11130.25 on top. ASC opens the deck on the smallest bench vendor and the concentration story reads backwards.",
        },
      ],
      distractors: ["oi.unit_price", "oi.quantity", "s.supplier_id", "3000", "11130.25", "ASC"],
      walkthrough:
        "A vendor bench is a two-hop fold with one gate. The chain order_items → products → suppliers fans 251 case lines into six vendors; the fold SUM(unit_price * quantity) reproduces the probed shares — Nordic 11130.25 (32%), Midwest 9294.93 (26.7%), Alpine 4765.63 (13.7%) — and HAVING revenue >= 4000 keeps exactly those three, because the next vendor (Andes, 3613.25) sits under the line. ORDER BY revenue DESC leads with the top pallet, and COUNT(DISTINCT oi.order_id) rides beside the fold so the basket-touch count stays at the basket grain. The distractors encode the fold's classic failures: SUM(oi.unit_price) prices one unit per line and understates every multi-quantity case; SUM(oi.quantity) returns unit counts, not dollars; s.supplier_id is no such column; a 3000 floor invites two under-line vendors into the bench; 11130.25 as the floor collapses the bench to one vendor and the concentration story evaporates; ASC reads the deck backwards. Fold, key, floor, order — four decisions, one bench on the hook.",
    },
    {
      id: "cs-costco-2",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "The executive-tier frequency ladder",
      brief:
        "Costco-flavored case on the storefront db (customers = members, orders = purchase baskets): the CRM lead is cutting the frequency ladder for the executive-tier review — 'rank members by baskets placed, spend beside each rung, and cut the file at nine rows so the tie rung ships whole; a mail-merge that slices a tie is a member-services ticket.' Probed facts: the top of the ladder is singletons — Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5 — then FOUR members tie on exactly 4 baskets (Pedro Alvarez, Keiko Sato, Isabella Rossi, Noah Meyer). Ties share a rank and the next rung must stay compact, so DENSE_RANK, not RANK; the tie block breaks by lifetime spend (1686.17, 1098.6, 985.65, 737.68) so the file is stable between runs.",
      ask: "Return the nine-row ladder: member, baskets, lifetime spend to 2 decimals, and DENSE_RANK by baskets, biggest first, ties broken by spend.",
      template:
        "SELECT c.name,\n       COUNT(o.id) AS baskets,\n       ROUND(SUM(o.total), 2) AS lifetime_spend,\n       DENSE_RANK() OVER (ORDER BY COUNT(o.id) {1}) AS freq_rank\nFROM customers c\nJOIN orders o ON c.id = {2}\nGROUP BY c.name\nORDER BY {3}, lifetime_spend DESC\nLIMIT {4};",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the ladder's direction",
          why: "Rank 1 must be the heaviest buyer — Alice at 24 baskets. ASC hands rung 1 to the two one-basket members and the executive review opens on the bottom of the book wearing the top rung.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the member key on the join",
          why: "orders carries the member's id, so the join is c.id = o.customer_id. c.id = c.id matches every row to every member (103 × 16 cross join — every rung then reads the whole book), and c.id = o.id pairs each member to the single order sharing its id: 16 phantom one-basket members.",
        },
        {
          answer: "freq_rank",
          kind: "keyword",
          label: "the lead sort on the file",
          why: "The file reads rank-first, spend-second as the tiebreak. Sorting by baskets lands ASC by default and flips the ladder; sorting by c.id ships member-id order that no review asked for and hides the frequency story entirely.",
        },
        {
          answer: "9",
          kind: "number",
          label: "the tie-safe cut",
          noVerify: true,
          why: "Ranks 1-6 occupy exactly nine rows (five singletons plus the four-member tie at rank 6), so LIMIT 9 ships the tie rung whole. 8 slices a member out of a tie they belong to; 5 drops the rung and the CRM never sees the four 4-basket members at all.",
        },
      ],
      distractors: ["ASC", "c.id", "baskets", "SUM(o.total)", "5", "10"],
      walkthrough:
        "A ladder is a window over a fold, and the tie policy IS the deliverable. GROUP BY c.name folds 103 baskets to 16 members; COUNT(o.id) reproduces the probed frequency census — 24, 17, 14, 13, 5, then four members on 4; DENSE_RANK() OVER (ORDER BY COUNT DESC) shares rung 6 across the tie and keeps the next rung at 7, which is why the file ships DENSE_RANK (RANK would jump the next member to 10 — a rung that implies missing members that do not exist). The cut at LIMIT 9 is deliberate: ranks 1 through 6 occupy exactly nine rows, so the tie block ships whole, ordered inside by lifetime spend (1686.17, 1098.6, 985.65, 737.68). The distractors encode the ladder's classic failures: ASC inverts the ladder onto its one-basket members; c.id in the ON clause cross-joins 103 orders to 16 members — every rung then reads the whole 34833.28 book; SUM(o.total) as the lead sort reorders the file by spend and the frequency story disappears; LIMIT 5 drops the tie rung, LIMIT 10 drags the rank-7 pair halfway in. Fold, rank, sort, cut — four decisions, one ladder the mail-merge can trust.",
    },
  ],

  problems: [
    { slug: "fifo-inventory-cogs", why: "The kit's one Costco-tagged problem in the pools — cost layers consumed FIFO across pallet receipts, the inventory-accounting read behind every warehouse margin review. Tagged fill." },
    { slug: "basket-depth-aov", why: "Bulk-basket metrics: lines and dollars per basket, the depth read that separates a gas-station top-up from a true warehouse run. Curated fill." },
    { slug: "repeat-purchase-rate", why: "The renewal proxy: members with 2+ baskets over all members — 14 of 16 here — the fee-base census the membership team lives on. Curated fill." },
    { slug: "the-category-of-each-member-in-the-store", why: "Membership tiering in CASE: Gold Star, Executive, Business arms ordered so the specific arm wins — the literal member-category query, in store clothing. Curated fill." },
    { slug: "weeks-of-supply", why: "Pallet cover: stock over weekly velocity, the weeks-of-supply read that fires depot reorders before the shelf gaps show — the thin-stock trio (14, 15, 17 remaining) is this query's output. Curated fill." },
    { slug: "find-stores-with-inventory-imbalance", why: "Depot imbalance: one club overstocked while its pair starves — the transfer screen behind pallet rebalancing across warehouses. Curated fill." },
    { slug: "sellers-with-no-sales", why: "Vendors with no scanned movement — on this book the honest answer is an empty set (all 6 vendors moved), and saying so IS the answer. Curated fill." },
    { slug: "bank-account-summary-ii", why: "Rails per account: settlements folded per statement with movements in one row — the close's per-statement read before the coverage classes attach. Curated fill." },
    { slug: "gl-reconciliation", why: "Statement-vs-rails reconciliation: ledger status is an opinion, the rail is a fact — the exact close the billing team ships, with the paid-no-rails 1756 as the catch. Curated fill." },
    { slug: "ar-aging-schedule", why: "Open-statement aging: 6 open statements worth 19609 in cents bucketed by age — the AR view behind the business-member dunning cycle. Curated fill." },
    { slug: "rank-scores", why: "The ladder shape: rank with ties shared and gaps skipped — the member-frequency ladder before DENSE_RANK's compact rungs are argued for. Curated fill." },
    { slug: "spend-histogram", why: "Basket-value bands: 25.47 to 1088.44 bucketed into a histogram with empty arms visible — the bulk-depth picture in one fold. Curated fill." },
    { slug: "monthly-transactions-i", why: "Month buckets with the cancelled arm beside the count — 14 buckets from 2024-01 to 2025-02, '%Y-%m' keys done right. Curated fill." },
    { slug: "unique-orders-and-customers-per-month", why: "Two grains per month: distinct baskets AND distinct members — the renewal curve needs both, and they are not the same number. Curated fill." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share with the .0 guard: member-penetration rates computed in real arithmetic — the integer-division-proof shape behind every attach read. Curated fill." },
    { slug: "group-sold-products-by-the-date", why: "Pallet manifest per day: GROUP_CONCAT folding a day's SKUs into one comma-joined cell — the receiving-desk read, one string per dock door. Curated fill." },
  ],
};
