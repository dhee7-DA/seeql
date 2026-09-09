// Batch B7a — lesson l7 (Aggregates): SUM / AVG / MIN / MAX / COUNT over a
// column, ROUND for money, WHERE as supporting cast. One row out, no GROUP BY.
// All figures audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB7a: CaseStudy[] = [
  {
    id: "cs-137",
    tier: "medium",
    topic: "l7",
    universe: "supplier",
    title: "Nordic Gadgets' shelf footprint",
    brief:
      "From: Supply-chain lead. Re: quarterly supplier review.\n\nNordic Gadgets AB is our EU anchor and their capacity conversation is next week — I want to open with hard numbers instead of vibes. Tell me how many units of their gear we are holding across the warehouse, and how deep the single deepest pile runs. If that deepest pile is small, the replenishment story changes completely.",
    ask: "Total units on hand across Nordic Gadgets products and the stock count of the single deepest SKU pile.",
    template: `SELECT {1}(stock) AS units_on_hand,
       {2}(stock) AS deepest_pile
FROM products
{3} supplier_id = {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the total-units aggregate",
        why: "Units on hand across SKUs is an addition problem, so SUM(stock) stacks every pile into one number. COUNT would tell you how many SKUs, not how many units; AVG would flatten it to a mean.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the deepest-pile aggregate",
        why: "The deepest single pile is an extreme, so MAX(stock). SUM would add all the piles together and overstate one shelf; MIN would find the thinnest pile, the opposite ask.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The filter applies to each product row before any math happens, so WHERE is the gate. HAVING only makes sense after a GROUP BY, and this one-row snapshot does no grouping.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the supplier id",
        why: "Nordic Gadgets AB is supplier 1 in the reference sheet, so the filter reads supplier_id = 1. The name itself would be read as a column name and the query would fail.",
        noVerify: true,
      },
    ],
    distractors: ["AVG", "MIN", "COUNT", "HAVING", "2"],
    walkthrough:
      "Two different questions share one row here: a total and an extreme. Units on hand is SUM — every pile added together — while the deepest pile is MAX, the single largest stock value, and mixing those two up is the classic aggregate error. The WHERE clause narrows the 16-product catalog down to Nordic Gadgets' three SKUs before any math runs, keyed on supplier_id 1 from the reference sheet. The numbers that land: 230 units on hand, with the deepest pile at 120 — a concentrated shelf, which is exactly the kind of fact that sharpens a capacity conversation. Note what this query cannot tell you: which SKU is the deep one. Aggregates collapse rows into numbers; for names you would pull the rows themselves.",
  },
  {
    id: "cs-138",
    tier: "easy",
    topic: "l7",
    universe: "expense",
    title: "The spend report's two headline cells",
    brief:
      "From: Ops finance, spend owner. Re: annual spend report.\n\nThe report template opens with two cells: how many orders we placed and what they cost in total. I need them straight from the ledger as booked — every status counts, because even cancelled orders consumed processing time. Give me the pair and I will drop them into the deck untouched.",
    ask: "One row with the total number of orders and the total spend across them, spend rounded to 2 decimals.",
    template: `SELECT {1}(*) AS order_count,
       ROUND({2}(total), 2) AS total_spend
FROM {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row-count aggregate",
        why: "How many orders exist is a headcount of rows, so COUNT(*). SUM(*) does not even parse — SUM needs a numeric column to add, while COUNT is happy counting rows.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the spend aggregate",
        why: "Total cost is every order total added together — SUM(total). COUNT would just answer the first cell again, and MAX would only surface the single biggest ticket.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order values live in orders.total. order_items carries per-line prices with no total column, and customers is people, not transactions.",
      },
    ],
    distractors: ["AVG", "MAX", "MIN", "order_items", "customers"],
    walkthrough:
      "Spend reports live and die on the opening pair: volume and value. Volume is COUNT(*) — a row count, and the star just means count every row without looking inside. Value is SUM(total), and I wrap it in ROUND(...,2) so the cell prints as money rather than a float with trailing dust. No filter at all: the brief said every status counts, so the aggregates sweep all 103 orders and land on 34,833.28. One habit worth copying: because both aggregates run over the same unfiltered table in a single pass, the two cells can never disagree about what is included — compute headline pairs together and you will never reconcile two slightly different definitions at review time.",
  },
  {
    id: "cs-139",
    tier: "medium",
    topic: "l7",
    universe: "catalog",
    title: "The price band of the catalog",
    brief:
      "From: Catalog content manager. Re: storefront refresh.\n\nThe design team wants a price band for the refresh deck: the cheapest thing we sell, the most expensive, and how many SKUs sit in between. Not a list — just the three boundary numbers so they can size the price-ladder graphic. Pull them off the current catalog exactly as priced today.",
    ask: "One row with the SKU count, the lowest price and the highest price in the catalog.",
    template: `SELECT {1}(*) AS sku_count,
       {2}(price) AS floor_price,
       {3}(price) AS ceiling_price
FROM {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the SKU-count aggregate",
        why: "Counting products is COUNT(*). SUM(price) would add every price into one meaningless number — catalog size is a headcount, not a sum.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor-price aggregate",
        why: "The cheapest SKU is the smallest price value — MIN. MAX answers the opposite end of the ladder, and AVG would blur both ends into a mean nobody asked for.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling-price aggregate",
        why: "The most expensive SKU is the largest price — MAX. MIN would hand back the floor again and leave both columns reading the same value.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Prices live on the product rows themselves, so products is the table. order_items has no price column, and suppliers is a different ledger entirely.",
      },
    ],
    distractors: ["SUM", "AVG", "order_items", "suppliers", "orders"],
    walkthrough:
      "Boundary questions are MIN and MAX territory: the floor and the ceiling of the price column, plus a COUNT for how many rows define the band. All three run over products with no filter — the deck wants the catalog as it is, warts and all. The numbers: 16 SKUs, a floor at 14.99 (the HDMI cable) and a ceiling at 199.99 (the Smart Watch). Worth noticing the shape: three aggregates, one result row, zero grouping — aggregates do not need GROUP BY to work; by default they collapse the whole table into a single row. The refresh deck gets its ladder: a 14.99 entry point, a 199.99 flagship, and fourteen SKUs priced somewhere in between.",
  },
  {
    id: "cs-140",
    tier: "easy",
    topic: "l7",
    universe: "month-close",
    title: "January's booked revenue",
    brief:
      "From: Financial Controller. Re: year-end audit prep.\n\nThe auditors want the opening month isolated: what did we book in January 2024, the first month our ledger exists? One number, rounded properly, that ties to the period they will sample from. I do not want the order list — just the figure for the working paper.",
    ask: "Total revenue booked across orders created in January 2024, rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), {2}) AS jan_revenue
FROM orders
WHERE strftime('%Y-%m', created_at) = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Revenue for a period is every qualifying total added together — SUM. COUNT would count the orders, and MAX would surface only the single biggest one.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding precision",
        why: "Money to the cent means ROUND(x, 2) — the 2 is a decimal count, not digits. A 1 there would round to dimes and print 3732.0 on an audit working paper.",
        noVerify: true,
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the month literal",
        why: "strftime's %Y-%m returns text like 2024-01, so the comparison needs a quoted string. Unquoted, SQL reads 2024-01 as arithmetic and matches nothing.",
      },
    ],
    distractors: ["COUNT", "MAX", "1", "'2024-02'"],
    walkthrough:
      "Period totals are the bread and butter of a close: filter the rows to the period, then add the money column. The filter here is the tidy one — strftime('%Y-%m', created_at) slices each timestamp down to a YYYY-MM text key, and comparing it to the quoted '2024-01' keeps every January order regardless of the day. The number that lands is 3,731.97 across 8 orders — that is the cell the auditors will tie their sample to. ROUND wraps the SUM with a 2 so the working paper shows cents, not float dust. One caveat to say out loud: this is booked value across all statuses, January includes whatever was later cancelled, and the tie-out is to the ledger as written, not to shipped reality.",
  },
  {
    id: "cs-141",
    tier: "easy",
    topic: "l7",
    universe: "growth",
    title: "Closed deals, average ticket",
    brief:
      "From: Chief of Staff. Re: board narrative.\n\nThe deck claims steady demand; I need the receipts. Show me how many orders have actually completed end-to-end and what the average completed order is worth — delivered only, because pending and shipped are promises, not proof. Two numbers for the traction slide, nothing speculative.",
    ask: "Count of delivered orders and their average order value, the average rounded to 2 decimals.",
    template: `SELECT {1}(*) AS closed_orders,
       ROUND({2}(total), 2) AS avg_deal
FROM orders
WHERE status = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the volume aggregate",
        why: "How many delivered orders exist is COUNT(*). SUM(total) would answer in money, not volume — the wrong unit for a traction slide about adoption.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean-ticket aggregate",
        why: "Average order value is AVG(total) — the mean of the totals. SUM would report the whole pool instead of the typical deal, inflating the slide by a factor of 52.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status literal",
        why: "Only completed orders count as proof, and status values are text: 'delivered' with quotes. Bare delivered reads as a column name and the query errors out.",
      },
    ],
    distractors: ["SUM", "MAX", "'pending'", "'shipped'"],
    walkthrough:
      "For a traction claim I want completed business only, so both aggregates run behind status = 'delivered'. Volume first: COUNT(*) says 52 orders have actually completed end-to-end. The value side is the judgment call — a board slide wants the typical ticket, so AVG(total) wrapped in ROUND(...,2) lands on 299.44. Had I summed instead, I would be showing the whole 15,571.07 pool as if it were a per-order figure, a 52-times inflation someone would catch mid-meeting. Worth knowing for Q&A: the pending book averages 436.64, so the 'average deal' moves depending on which statuses you count — the delivered-only number is the defensible one, because those orders are finished facts rather than promises.",
  },
  {
    id: "cs-142",
    tier: "medium",
    topic: "l7",
    universe: "refund-audit",
    title: "The cancellation ledger",
    brief:
      "From: Refunds team, internal ticket #4533.\n\nFinance wants our cancellation exposure sized before the goodwill budget is set. Three figures, one row: how many orders we have cancelled, the total value they carried, and the single worst one — that worst case decides whether we escalate to case-by-case review or batch-process the lot.",
    ask: "Count of cancelled orders, their total value, and the largest single cancelled order, money rounded to 2 decimals.",
    template: `SELECT {1}(*) AS refund_cases,
       ROUND({2}(total), 2) AS exposure,
       ROUND({3}(total), {5}) AS worst_case
FROM orders
WHERE status = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the case-count aggregate",
        why: "The number of cancelled orders is COUNT(*). SUM(total) would answer in currency, not cases — the staffing line needs the headcount first.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregate",
        why: "Total cancelled value is SUM(total) across the filtered rows. COUNT would repeat the case count, and MAX would only show the worst single loss, not the pool.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the worst-case aggregate",
        why: "The largest single cancellation is MAX(total) — an extreme, not a sum. MIN would find the pettiest cancellation, which is useless for an escalation decision.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The ledger marks these rows status = 'cancelled', quotes included, because it is a text value. Unquoted, the query fails on a column that does not exist.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding precision",
        why: "ROUND(x, 2) keeps the worst-case figure at cents for the budget sheet; the 2 is the decimal count. Dropping to 1 would print 398.0 and lose the pennies.",
        noVerify: true,
      },
    ],
    distractors: ["AVG", "MIN", "'pending'", "'delivered'", "1"],
    walkthrough:
      "Exposure sizing wants three different shapes of answer from one filtered set: how many (COUNT), how much in total (SUM), and how bad at the extreme (MAX). All three agree on the filter — status = 'cancelled' — so they run as one query and cannot drift apart. The row that comes back: 7 cases, 1,152.49 of exposure, worst single loss 397.99. Two footnotes for the ticket: the biggest cancellation sits far above the 164.64 average, so this pool is lopsided rather than uniform; and the smallest order in the whole ledger, 25.47, is itself a cancellation — small tickets cancel too, which is exactly why we batch-process instead of chasing each one.",
  },
  {
    id: "cs-143",
    tier: "medium",
    topic: "l7",
    universe: "pricing",
    title: "How deep is a basket",
    brief:
      "From: Head of Product. Re: bundle sizing.\n\nBefore we commit to 2-packs and 3-packs I want to know what customers already do unprompted. Across every order line we have taken, what is the typical quantity per line, and the most anyone has ordered of a single SKU in one go? If the natural behavior is already 2, the bundles write themselves.",
    ask: "Across all order lines: the line count, the average quantity per line, and the largest single-line quantity.",
    template: `SELECT {1}(*) AS order_lines,
       ROUND({2}(quantity), 2) AS avg_units,
       {3}(quantity) AS biggest_line
FROM {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line-count aggregate",
        why: "How many order lines exist is COUNT(*). SUM(quantity) would add up units, not lines — the sample size and the measurement are different things.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean-quantity aggregate",
        why: "The typical quantity per line is AVG(quantity). SUM would report 498 total units as if it were a per-line habit — off by two orders of magnitude.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The most units anyone took of one SKU in a single line is MAX(quantity) — an extreme. MIN would find the smallest line, which is 1 and tells us nothing new.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the line-level table",
        why: "Quantities are recorded per order line, and order_items is the line-level table. orders carries whole-basket totals and products carries shelf stock, not purchases.",
      },
    ],
    distractors: ["SUM", "MIN", "products", "orders"],
    walkthrough:
      "Bundle design starts from observed behavior, and observed behavior lives at the line level: order_items, one row per SKU per order. Three aggregates answer it — COUNT(*) for the sample size, AVG(quantity) for the habit, MAX(quantity) for the ceiling. The numbers: 251 lines, an average of 1.98 units per line, and a ceiling of 3 — nobody has ever ordered more than three of anything in a single line. That is a clean read for the 2-pack decision: a mean sitting just under 2 with a hard ceiling at 3 says single units dominate but doubles are already normal. I would round nothing here except the average — COUNT and MAX are integers by nature.",
  },
  {
    id: "cs-144",
    tier: "easy",
    topic: "l7",
    universe: "fraud",
    title: "Orders over the review line",
    brief:
      "From: Risk team. Re: sweep calibration.\n\nPolicy review: our manual-review line has drifted over the years and I want to see what a 900 line actually catches. Size it for me — how many orders on file clear 900, and what is the combined value sitting above the line? That tells us whether the sweep stays a quick eyeball or needs a rota.",
    ask: "Count of orders with a total above 900 and their combined value, rounded to 2 decimals.",
    template: `SELECT {1}(*) AS flagged_orders,
       ROUND({2}(total), 2) AS exposure
FROM orders
WHERE total > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the caseload aggregate",
        why: "How many orders clear the line is COUNT(*). SUM(total) would answer in money — the rota cares about how many tickets need eyes, not how many euros they carry.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregate",
        why: "Combined value above the line is SUM(total) over the filtered rows. COUNT would just repeat the caseload, and MAX would show only the biggest single ticket.",
      },
      {
        answer: "900",
        kind: "number",
        label: "the review threshold",
        why: "The proposed line is 900 and the comparison is strictly greater-than — an order at exactly 900.00 would slip under the sweep untouched.",
        noVerify: true,
      },
    ],
    distractors: ["AVG", "MAX", "500", "1000"],
    walkthrough:
      "Threshold sizing is a filter plus two aggregates: keep the rows above the line, then count them and add their value. With the line at 900, exactly 2 orders on file clear it — the 1,088.44 ticket and the 945.21 one — for 2,033.65 of combined exposure. Both are still pending, which is precisely why the sweep exists: large, undelivered, and human-reviewable. Watch the comparison as you read it: total > 900, strictly greater, so a hypothetical 900.00 order would miss the sweep. Nudge the line to 500 and the caseload explodes to 25 orders; push it to 1,000 and you are down to a single ticket. The threshold is doing the policy work, which is why it deserves its own slot.",
  },
  {
    id: "cs-145",
    tier: "easy",
    topic: "l7",
    universe: "inventory",
    title: "Thin shelves before the count",
    brief:
      "From: Warehouse ops manager. Re: Friday's physical count.\n\nBefore the count team walks the floor I want the thin shelves flagged: every SKU we hold fewer than 50 units of. How many such SKUs are there, and how many units do they hold between them? If it is a handful, we count those first and reconcile before lunch.",
    ask: "Count of products with stock below 50 and the total units those products still hold.",
    template: `SELECT {1}(*) AS low_skus,
       {2}(stock) AS units_left
FROM products
WHERE stock < {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the SKU-count aggregate",
        why: "Flagging how many SKUs are thin is COUNT(*). SUM(stock) would answer in units — that is the second column's job, not the first's.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the units aggregate",
        why: "Units held across the thin SKUs is SUM(stock) over the filtered rows. COUNT would echo the SKU count, and MAX would show only the fullest thin shelf.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the thin-stock bar",
        why: "The count sheet defines thin as below 50 — strictly less than, so a SKU sitting at exactly 50 units is not flagged for the early pass.",
        noVerify: true,
      },
    ],
    distractors: ["MAX", "AVG", "40", "100"],
    walkthrough:
      "Pre-count triage is one filter, two aggregates. The filter keeps only products with stock below 50 — that catches the studio mic at 45 and the smart watch at 40, and nothing else. COUNT(*) sizes the list: 2 SKUs. SUM(stock) totals what they hold: 85 units. Both aggregates see the same filtered rows, so the pair always reconciles. One trap this query quietly teaches: drop the bar to 20 and the filtered set is empty — SUM would come back NULL, not zero, while COUNT would show 0. A blank cell and a zero mean different things to a warehouse system, and knowing which is which saves a very confused Friday afternoon.",
  },
  {
    id: "cs-146",
    tier: "easy",
    topic: "l7",
    universe: "funnel",
    title: "Live accounts on the board",
    brief:
      "From: Growth marketing lead. Re: funnel top review.\n\nI am sanity-checking the top of the funnel before the campaign postmortem: of the customer accounts on the books, how many are actually live? The flag is what support actually enforces, so count the live accounts and add up the flag over those rows — if the two numbers agree, the data is clean enough to build a funnel on.",
    ask: "One row with the count of live accounts and the sum of the active flag across those same rows.",
    template: `SELECT {1}(*) AS accounts,
       {2}(active) AS live_accounts
FROM customers
WHERE active = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the account-count aggregate",
        why: "Counting live accounts is COUNT(*). SUM(active) would add the flags themselves — which happens to be the second column's job here, not the first's.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the flag-sum aggregate",
        why: "Adding a 0/1 flag with SUM counts the ones — a trick worth owning. AVG would return 1 here, because every surviving row is active, and read like a share instead of a count.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the active value",
        why: "The flag stores 1 for live and 0 for dormant; filtering active = 1 keeps only the live rows. No quotes — it is a number, not text.",
        noVerify: true,
      },
    ],
    distractors: ["AVG", "MAX", "0", "region"],
    walkthrough:
      "This is a data-quality trick as much as a funnel number. The filter keeps only rows where the flag is on; then COUNT(*) counts those rows and SUM(active) adds the flags themselves — and because every surviving row carries a 1, summing the flag counts the ones. Both columns land on 14, and the agreement is the point: the flag column holds exactly what the row filter kept, so there are no NULLs or odd values hiding in it. The two accounts that fail the filter are the dormant pair — Dmitri and Keiko — which is why the unfiltered headcount is 16. When two different aggregates agree like this, you have audited the column for free.",
  },
  {
    id: "cs-147",
    tier: "easy",
    topic: "l7",
    universe: "supplier",
    title: "Grading the supplier bench",
    brief:
      "From: Supply-chain lead. Re: annual partner scorecard.\n\nBefore I rank anyone I want the bench measured as a whole: how many suppliers we run with, the average scorecard rating across them, and the floor — the rating of the weakest partner we currently tolerate. Those three numbers frame every conversation I am about to have next month.",
    ask: "Supplier count, their average rating rounded to 2 decimals, and the lowest rating on the bench.",
    template: `SELECT {1}(*) AS partners,
       ROUND({2}(rating), 2) AS avg_rating,
       {3}(rating) AS weakest_link
FROM suppliers;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench-size aggregate",
        why: "How many suppliers we run with is COUNT(*). SUM(rating) would add scores into an arbitrary number that no scorecard on earth uses.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean-rating aggregate",
        why: "The bench's typical rating is AVG(rating), the mean. MIN would collapse the whole bench to its weakest member — that is the third column's job, not the second's.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor-rating aggregate",
        why: "The weakest partner is MIN(rating) — the extreme low end. MAX would flatter the bench by reporting its star performer instead of its floor.",
      },
    ],
    distractors: ["SUM", "MAX", "price", "products"],
    walkthrough:
      "A scorecard needs shape before it needs rankings: size, center, floor. COUNT(*) says we run 6 suppliers; AVG(rating) says the bench averages 4.3 once rounded; MIN(rating) says the floor is 3.9 — Pacific Textiles, and yes, that gap is the conversation I am preparing for. All three run over the whole suppliers table with no filter, because a scorecard that pre-filters is a scorecard that flatters. Notice where the ROUND sits: only on the average. Ratings are stored to one decimal, so MIN needs no help, but a mean of six one-decimal scores produces trailing dust that looks sloppy in a printed table.",
  },
  {
    id: "cs-148",
    tier: "easy",
    topic: "l7",
    universe: "expense",
    title: "The petty-spend pool",
    brief:
      "From: Ops finance, spend owner. Re: card program review.\n\nWe are pricing a company-card program and the case rests on the long tail: the orders too small to be interesting individually. What is the average size of an order under 100, and how many of them are there? Small orders are where card friction actually bites.",
    ask: "Count of orders with a total under 100 and their average value, the average rounded to 2 decimals.",
    template: `SELECT {1}(*) AS small_orders,
       ROUND({2}(total), 2) AS avg_small
FROM orders
WHERE total < {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tail-count aggregate",
        why: "How many small orders exist is COUNT(*). AVG(total) in that spot would return money, not a headcount — the wrong unit for the first cell.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean-spend aggregate",
        why: "The typical small order is AVG(total) — a mean. SUM would report the whole tail as one number, and MAX would show the biggest small order, not the typical one.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the small-order bar",
        why: "The card case defines small as under 100 — strictly less than. An order at exactly 100.00 sits outside the tail by definition.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "MAX", "50", "300"],
    walkthrough:
      "The long tail needs its own arithmetic, because averages over the whole book hide it: filter first, then measure. With the bar at under 100, COUNT(*) finds 15 small orders and AVG(total) lands on 57.91 — that is the pool a card program is really competing for, orders the finance team never thinks about. Both aggregates run over the same filtered rows, so the two cells cannot disagree about what small means. Two judgment calls worth defending: 100 is a strict less-than, so the order at exactly 100.00 stays out; and had I summed instead of averaged, I would have reported the tail's whole 868.66 pool as one scary number — the mean of 57.91 is the honest per-order story here.",
  },
  {
    id: "cs-149",
    tier: "medium",
    topic: "l7",
    universe: "catalog",
    title: "What the warehouse holds",
    brief:
      "From: Catalog content manager. Re: stocktake prep.\n\nThe stocktake sheet needs a two-cell header: total units physically represented in the system, and the list-price value of the catalog as priced today. Two different sums over two different columns — units from stock, money from price. If those cells look sane, the stocktake starts on solid ground.",
    ask: "One row with total units on hand (stock summed) and the catalog's total list value (price summed), value rounded to 2 decimals.",
    template: `SELECT SUM({1}) AS units_on_hand,
       ROUND(SUM({2}), {3}) AS shelf_value
FROM {4};`,
    slots: [
      {
        answer: "stock",
        kind: "keyword",
        label: "the units column",
        why: "Units on hand means adding the stock column. SUM(price) would add money and report 1,148.43 as units — a category error the header would print proudly.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the value column",
        why: "List value means adding the price column. SUM(stock) would answer in units — the exact number the first cell already has, doing the wrong job twice.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding precision",
        why: "Money gets ROUND(x, 2) so the value cell prints cents cleanly. Units stay unrounded — you cannot hold 2.5 of a physical unit.",
        noVerify: true,
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Both stock and price live on product rows, so products is the one table. order_items records purchase lines and has neither column.",
      },
    ],
    distractors: ["quantity", "unit_price", "category", "order_items"],
    walkthrough:
      "Same aggregate, two columns — that is the whole lesson in this query. SUM(stock) answers how many units we hold: 2,845. SUM(price) answers what the catalog lists at: 1,148.43. Swap the columns and each cell still executes, which is what makes this a genuinely dangerous mistake rather than a syntax error — the numbers are plausible, just attached to the wrong meaning. The ROUND with a 2 belongs on the money column only; stock is counted in whole units and needs no decimal help. When a header pairs two sums, I label each with what it sums, not just that it sums — future readers will thank you.",
  },
  {
    id: "cs-150",
    tier: "easy",
    topic: "l7",
    universe: "month-close",
    title: "The band our tickets travel in",
    brief:
      "From: Financial Controller. Re: close deck footnote.\n\nSlide 3 needs the spread, not the sum: the smallest order we have ever booked and the largest, side by side. It frames every average on the deck — an average means something different when the band runs 25 to 1,088 than when it is tight. No filters; the band is the band.",
    ask: "The smallest order total on file and the largest, both rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS smallest,
       ROUND({2}(total), 2) AS biggest
FROM {3};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "The smallest order ever booked is MIN(total). MAX would return the ceiling in the floor's slot and quietly flip the footnote's meaning.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The largest single order is MAX(total) — the opposite extreme. AVG would report the midpoint of the band and blur both ends into one unremarkable number.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order totals live in orders.total. order_items has no total column (only per-line prices), and products is the catalog, not the transaction ledger.",
      },
    ],
    distractors: ["SUM", "AVG", "COUNT", "order_items", "customers"],
    walkthrough:
      "A band is two extremes in one row: MIN for the floor, MAX for the ceiling, and no filter, because the footnote describes the whole ledger. The pair that lands: 25.47 at the bottom — a cancelled order, as it happens — and 1,088.44 at the top, which is still pending; our biggest ticket has not even shipped yet. Both are wrapped in ROUND(...,2) because stored totals can carry more decimals than a slide should. What this row really buys the deck: the 338.19 average sits inside a band that spans a factor of forty, so nobody in the room mistakes the typical order for the whole story.",
  },
  {
    id: "cs-151",
    tier: "easy",
    topic: "l7",
    universe: "growth",
    title: "Pipeline waiting on the board",
    brief:
      "From: Chief of Staff. Re: forward-looking slide.\n\nThe deck cannot be all history — the board will ask what is in flight. Count the orders still sitting in pending and total what they are worth. That is the pipeline slide: volume of open commitments and the money attached, nothing delivered, nothing speculative.",
    ask: "Count of pending orders and the total value they carry, rounded to 2 decimals.",
    template: `SELECT {1}(*) AS open_deals,
       ROUND({2}(total), 2) AS pipeline_value
FROM orders
WHERE status = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the deal-count aggregate",
        why: "How many orders are open is COUNT(*). SUM(total) would answer in money — the slide needs both numbers, each in its own column.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pipeline aggregate",
        why: "Value in flight is SUM(total) over the pending rows. COUNT would echo the deal count, and AVG would shrink the pipeline to its mean deal size.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status literal",
        why: "Open means status = 'pending', quoted — it is a text value in the ledger. 'delivered' or 'shipped' would quietly count finished business as pipeline.",
      },
    ],
    distractors: ["AVG", "MAX", "'delivered'", "'cancelled'", "'shipped'"],
    walkthrough:
      "Forward-looking numbers need the strictest filter on the board: only 'pending' rows count as pipeline, because shipped is nearly done and delivered is done. COUNT(*) sizes the book at 14 open deals; SUM(total) values it at 6,113. Two credibility notes for the slide: the biggest open deal is the 1,088.44 ticket, so the pipeline is top-heavy and one late cancellation would dent it visibly; and the average pending deal runs 436.64 against a delivered average of 299.44, which is either great news or a sign that big orders get stuck. The deck gets the raw pair and lets the board draw that line themselves.",
  },
];
