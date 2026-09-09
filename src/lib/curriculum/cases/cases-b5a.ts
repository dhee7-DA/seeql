// Case batch B5a — topic l5 (ORDER BY & LIMIT), ids cs-092…cs-105.
// Authored against scripts/facts/l5.json figures; audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB5a: CaseStudy[] = [
  {
    id: "cs-092",
    tier: "hard",
    topic: "l5",
    universe: "pricing",
    title: "Five price anchors for the reset board",
    brief:
      "From: Head of Product. Re: autumn pricing reset.\n\nThe reset board opens with the premium end of the catalog — retail wants five anchor products to hang the story on, and the deck layout has exactly five slots for them. Pull the priciest items we sell, most expensive first, so design can drop them straight onto slide one without reshuffling.",
    ask: "Name and price of the 5 most expensive products, priciest first.",
    template: `SELECT name, price
FROM products
{1} BY {2} {3}
{4} {5};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Ranking the catalog by price is sorting, so ORDER BY. GROUP BY would collapse products into price buckets — you'd lose the names the slide needs.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the sort key",
        why: "The anchors are picked by price, so price is the sort key. Sorting by stock or name would rank the wrong dimension entirely and reshuffle the five.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Priciest first is descending. ASC would surface the HDMI cable at 14.99 — the bargain bin, not the premium story.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT trims the sorted list to its first rows. OFFSET alone is a syntax error here, and TOP is a different dialect's keyword — SQLite wants LIMIT.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the cap size",
        why: "The deck holds exactly five anchor slots, so the cap is 5 — 3 would leave the board short, 10 would overflow the slide.",
        noVerify: true,
      },
    ],
    distractors: ["GROUP", "ASC", "OFFSET", "stock", "3", "10"],
    walkthrough:
      "The brief decomposes cleanly: rank by price, descending, then cut at five. ORDER BY price DESC does the ranking; LIMIT 5 does the cutting, and because the cut applies after the sort, the five that survive are genuinely the most expensive. What lands: Smart Watch S at 199.99, Noise-Canceling Headset at 149.99, 4K Webcam Pro at 129, Studio Desktop Mic at 119, Mechanical Keyboard K1 at 89.99. The direction is the whole ballgame — ASC would have opened the slide with the 14.99 HDMI cable and told exactly the wrong story. Cut is unambiguous too: the next product down (Fitness Band X2 at 79) sits a clean step below the fifth anchor, so the boundary isn't a coin flip.",
  },
  {
    id: "cs-093",
    tier: "medium",
    topic: "l5",
    universe: "fraud",
    title: "Newest tickets on the fraud queue",
    brief:
      "From: Risk team, spot-check rotation.\n\nCard-testing waves show up as fresh activity, so the sweep works newest-first: whatever came in most recently gets eyes before it ages. The queue holds three tickets per rotation — that's the agreed slice, no more. Pull the latest orders with their status so reviewers can see what state each one is in.",
    ask: "Id, status and created date of the 3 most recent orders, newest first.",
    template: `SELECT id, status, created_at
FROM orders
{1} BY {2} {3}
LIMIT {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Recency ranking means sorting the table by date, so ORDER BY. GROUP BY would smash rows together and return one bucket, not three tickets.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the recency key",
        why: "Newest is a property of created_at, the order's timestamp. Sorting by total would return the biggest orders — a different sweep entirely.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the direction",
        why: "Newest first is descending: dates run backwards. ASC would hand the reviewers the oldest orders on file — stale, already-audited rows.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the queue size",
        why: "The rotation clears three tickets per cycle, so the cap is 3. A cap of 5 floods the queue and breaks the staffing plan.",
        noVerify: true,
      },
    ],
    distractors: ["GROUP", "ASC", "total", "OFFSET", "TOP", "5"],
    walkthrough:
      "Recency is a sort, not a filter — nothing gets excluded, the rows just get ranked. ORDER BY created_at DESC puts the freshest timestamps on top, and LIMIT 3 takes the slice the rotation can actually clear. The queue: order 97, pending, created 2025-02-27; order 98, shipped, 2025-02-25; order 100, delivered, 2025-02-19. The tempting mistake is DESC's mirror — ASC — which would surface order 6 from 2024-01-01, a year-stale row the team closed ages ago. Worth flagging in the handoff: only the newest ticket is still pending; the other two already moved through fulfillment, so the live risk is concentrated at the top of the list.",
  },
  {
    id: "cs-094",
    tier: "medium",
    topic: "l5",
    universe: "inventory",
    title: "The restock queue, thinnest first",
    brief:
      "From: Warehouse ops manager. Re: Friday replenishment run.\n\nPurchase orders go out Friday morning and the rule is simple: the shelves closest to empty get bought first. Give me the five products carrying the least stock on hand, thinnest shelf at the top, so purchasing can work down the list without re-sorting anything themselves.",
    ask: "Name and stock for the 5 products with the lowest stock, thinnest first.",
    template: `SELECT name, stock
FROM products
{1} BY stock {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "A shortage queue is a ranking of rows, so ORDER BY. WHERE would only keep rows under a threshold — it can't rank or cap anything.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the direction",
        why: "Thinnest first is ascending — the rare case where the default direction is exactly right. DESC would lead with the fullest shelf, 500 units of HDMI cable, the opposite of the ask.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "Friday's run covers five shelves, so the list is cut to five rows with LIMIT. Without a cap you'd buy for all sixteen products.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the run size",
        why: "Purchasing works five replenishment lines per run — the cap is 5. Trimming to 3 would skip shelves that run dry over the weekend.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "OFFSET", "TOP", "3"],
    walkthrough:
      "This one flips the usual instinct: ascending is correct, because the shortage queue wants the smallest numbers on top. ORDER BY stock ASC ranks all sixteen shelves thinnest-first and LIMIT 5 keeps Friday's workload. The queue: Smart Watch S at 40, Studio Desktop Mic at 45, Noise-Canceling Headset at 60, 4K Webcam Pro at 70, USB-C Hub 7-in-1 at 85. Notice what the shape is telling us — the whole bottom five is premium electronics, the high-price gear we deliberately stock shallow. That's policy, not panic: nothing here is unplanned, but the watch at 40 units is the one to watch if the promo calendar moves.",
  },
  {
    id: "cs-095",
    tier: "hard",
    topic: "l5",
    universe: "funnel",
    title: "A/B split group one, A to Z",
    brief:
      "From: Growth marketing lead. Re: subject-line test, wave 3.\n\nWe need a deterministic control group for the subject-line test — no judgment calls, no cherry-picking. House convention: the control is the first three customers alphabetically, and every wave document states that rule so anyone can reproduce the split a year later. Names and signup dates, please.",
    ask: "Name and signup date of the first 3 customers alphabetically, A to Z.",
    template: `SELECT name, created_at
FROM customers
{1} BY {2} {3}
{4} {5};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Alphabetical order is a sort of the name column, so ORDER BY name. There's no filter here — every customer is a candidate for the draw.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the sort key",
        why: "The rule is alphabetical, so name is the key. Sorting by city or region would produce a different, non-reproducible group and break the audit trail.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the direction",
        why: "A-to-Z is ascending. DESC would start the group at Pedro Alvarez — the Z end — and hand the test the wrong panel entirely.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the group cap",
        why: "The control panel is exactly three people, so LIMIT 3 ends the list. Without it you'd ship the test to all sixteen customers.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the panel size",
        why: "Wave 3's panel is three customers — the doc fixes the size. Five would double the control and muddy the read.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "city", "region", "OFFSET", "5"],
    walkthrough:
      "The whole point of this query is that nobody had to make a choice: alphabetical order is the rule, so the group is the same every time someone runs it. ORDER BY name ASC ranks the roster A-to-Z and LIMIT 3 takes the head of the line. The panel: Alice Chen, signed up 2023-11-02; Bruno Silva, 2023-11-17; Chloe Dubois, 2023-12-05. ASC is technically the default direction, but the wave doc spells it out anyway — explicit beats implicit when a test has to survive an audit. One caution for the writeup: an alphabetical draw is reproducible, not random, so it's fine for a subject-line test but would be a bad way to sample for anything statistical.",
  },
  {
    id: "cs-096",
    tier: "hard",
    topic: "l5",
    universe: "supplier",
    title: "Two APAC seats at the QBR",
    brief:
      "From: Supply-chain lead. Re: QBR attendee list.\n\nThe quarterly business review has two seats for APAC partners and I want the region's best-rated suppliers in them, strongest scorecard rating first. Ratings are from the last review cycle, unchanged. Send name and rating so procurement can fire off the invites this afternoon.",
    ask: "Name and rating of the 2 highest-rated suppliers in the APAC region, best first.",
    template: `SELECT name, rating
FROM suppliers
{1} region = {2}
ORDER BY rating {3}
{4} {5};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the region filter",
        why: "The seats are APAC-only, so rows are filtered before sorting — that's WHERE's job. HAVING needs a GROUP BY in front of it and errors out here.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "APAC is a text value, so it wears quotes: region = 'APAC'. Bare APAC would be read as a column name and the query would blow up.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the rating direction",
        why: "Best-rated first means the highest rating leads — DESC. ASC would rank the weakest partner to the top of the invite list.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the seat cap",
        why: "Two seats, so LIMIT 2. OFFSET would skip rows instead of capping them, and the syntax is wrong without a LIMIT in front anyway.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the seat count",
        why: "The review has exactly two APAC seats — the cap is 2. One seat would snub a rated partner; three would overbook the room.",
        noVerify: true,
      },
    ],
    distractors: ["'EU'", "ASC", "HAVING", "OFFSET", "1"],
    walkthrough:
      "Two clauses carry this: the region gate and the ranking. WHERE region = 'APAC' runs first and cuts the supplier table down to the two APAC partners — this is the clause that matters, because without it Alpine Audio GmbH's 4.8 rating (an EU supplier) would top the list and the seats would go to the wrong hemisphere. Then ORDER BY rating DESC puts the stronger partner first, and LIMIT 2 matches the room. The invites: Shenzhen Electro at 4.1, Pacific Textiles at 3.9. One observation for the debrief: the APAC bench tops out at 4.1 while EU has two partners above 4.4 — thin depth in that region is worth a line in the QBR deck itself.",
  },
  {
    id: "cs-097",
    tier: "hard",
    topic: "l5",
    universe: "expense",
    title: "Line items for the spend review",
    brief:
      "From: Ops finance, spend owner. Re: monthly spend review.\n\nBefore I sign off the month I eyeball the fattest individual line items — anything with a unit cost of 100 or more, biggest first, and five lines is what fits on the review sheet. These are the lines where a pricing slip or a duplicate entry actually moves the number. Order reference, quantity and unit price, please.",
    ask: "Order, quantity and unit price of the 5 line items with unit price 100 or more, biggest first.",
    template: `SELECT order_id, quantity, unit_price
FROM order_items
{1} unit_price >= {2}
ORDER BY unit_price {3}
{4} {5};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the threshold filter",
        why: "The 100 cutoff removes rows before any ranking — row-level filtering is WHERE. HAVING would need a GROUP BY first and fails here.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the unit-price floor",
        why: "'100 or more' is >= 100 — inclusive, so a line at exactly 100.00 stays in. The floor only exists to shed the cheap tail before ranking.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the cost direction",
        why: "Fattest line first is descending. ASC would open the sheet with the cheapest qualifying line — the review reads bottom-up and misses the point.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the sheet cap",
        why: "The review sheet fits five lines, so LIMIT 5. Without a cap every qualifying line item would spill onto the page.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the line count",
        why: "Five lines per sheet is the format — the cap is 5. Ten would need a second sheet and defeat the one-glance purpose.",
        noVerify: true,
      },
    ],
    distractors: ["HAVING", "ASC", "OFFSET", "250"],
    walkthrough:
      "This is a filter feeding a ranking: WHERE unit_price >= 100 sheds the long cheap tail of the 251 line items, ORDER BY unit_price DESC ranks what survives fattest-first, and LIMIT 5 fits the sheet. The five lines: order 99, quantity 1, at 209.68; order 89, quantity 2, at 205.81; order 39, quantity 2, at 205.31; order 33, quantity 2, at 204.19; order 91, quantity 1, at 200.07. Every one of them is the Smart Watch S — the flagship sits on every big ticket this month. The cluster is tight, 200.07 to 209.68, which reads as consistent pricing rather than a slip, so the sheet signs off. ASC is the trap here: it would have led with a line just over the 100 floor — technically qualifying, analytically useless.",
  },
  {
    id: "cs-098",
    tier: "hard",
    topic: "l5",
    universe: "catalog",
    title: "Shelf reset plan, first six rows",
    brief:
      "From: Catalog content manager. Re: printed catalog reset.\n\nThe printed catalog rebuilds this month and the layout rule is fixed: categories run alphabetically, and inside a category the priciest item leads the shelf. I need the first six rows of that ordering to brief the layout team — they'll decide how the opener spread looks, so the sequence has to be exact.",
    ask: "Name, category and price of the first 6 rows when categories run A to Z and price runs high to low inside each category.",
    template: `SELECT name, category, price
FROM products
{1} BY {2} {3}, price {4}
{5} {6};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "A two-key layout order is a sort, so ORDER BY with a comma-separated key list. GROUP BY would output one row per category and lose the products.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the primary key",
        why: "Categories alphabetically is the layout's spine, so category sorts first. stock or name as the primary key would scramble shelves together.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the category direction",
        why: "A-to-Z is ascending. DESC would open the catalog at Wearables instead of Accessories and reverse every section.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the price direction",
        why: "Priciest leads each shelf, so the second key price runs descending. ASC would let the 14.99 HDMI cable open the Accessories section — the layout rule broken on row one.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the spread cap",
        why: "The brief wants the opener spread only — six rows — so LIMIT 6 ends the plan there. The rest of the catalog is a later workstream.",
      },
      {
        answer: "6",
        kind: "number",
        label: "the row count",
        why: "Six rows brief the opener spread — the cap is 6. Four leaves the spread half-empty against the layout mock.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "stock", "name", "OFFSET", "4"],
    walkthrough:
      "Multi-key sorting is the skill here: ORDER BY category ASC, price DESC ranks by the first key, and only when two rows share it does the second key break the tie. Categories are the spine, price is the within-shelf ordering — flip that second direction and the whole layout collapses, because the Accessories section would open with the 14.99 cable instead of the 42.5 stand. The six rows: Laptop Stand Aluminum at 42.5 (Accessories), Desk Mat Extended at 24.99, HDMI 2.1 Cable 2m at 14.99, Cycling Jersey Pro at 65 (Apparel), Running Socks 3-pack at 18.5, Noise-Canceling Headset at 149.99 (Audio). LIMIT 6 stops the plan exactly where the spread ends. Analyst note: with two keys you read the result left to right — shelves in order, each shelf dressed best-first.",
  },
  {
    id: "cs-099",
    tier: "hard",
    topic: "l5",
    universe: "month-close",
    title: "Five invoices for the close binder",
    brief:
      "From: Financial Controller. Re: January close binder.\n\nThe close binder opens with the delivered revenue we can point to — the five largest completed orders, biggest first. Only delivered counts for the binder; pending is not revenue yet, however big it looks. Order id and total to two decimals, and keep it to five — that's what the summary page holds.",
    ask: "Id and total of the 5 largest delivered orders, biggest first, totals to 2 decimals.",
    template: `SELECT id, ROUND(total, 2) AS total
FROM orders
{1} status = {2}
ORDER BY total {3}
{4} {5};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the status filter",
        why: "Only delivered orders are revenue, so the status filter runs before sorting — WHERE. HAVING has no group to filter and errors without GROUP BY.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status value",
        why: "delivered is a text value in the data, so the literal needs quotes. The pending 1,088.44 order must stay out — pending is not revenue.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the value direction",
        why: "Largest first is descending. ASC would open the binder with the five smallest delivered invoices — technically revenue, useless as a headline.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the page cap",
        why: "The summary page holds five lines, so LIMIT 5. Without the cap the binder page would list every delivered order in the period.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the invoice count",
        why: "Five invoices fit the summary page — the cap is 5. Three would understate the binder's opening spread.",
        noVerify: true,
      },
    ],
    distractors: ["'pending'", "'shipped'", "ASC", "OFFSET", "3"],
    walkthrough:
      "The controller's rule — delivered only — is a row filter, so WHERE status = 'delivered' runs first; then the survivors are ranked by total, descending, and cut to the page's five lines. The binder opens with: order 6 at 752.96, order 14 at 705.23, order 71 at 668.45, order 67 at 659.7, order 13 at 632.29. The filter is what gives the number its meaning: the single biggest order in the system (1,088.44) is still pending and correctly absent — the binder claims revenue, not pipeline. One curiosity worth a footnote: order 6 is both the largest delivered invoice and the oldest order on file, created 2024-01-01. A tidy anchor for page one of the close.",
  },
  {
    id: "cs-100",
    tier: "hard",
    topic: "l5",
    universe: "growth",
    title: "Founding cohort for the anniversary",
    brief:
      "From: Chief of Staff. Re: fifth-anniversary campaign.\n\nThe anniversary campaign leads with our longest-standing members — the accounts that joined in the platform's first weeks. Three of them get a handwritten note, and the pick must be strictly by join date, earliest first, so nobody can argue favoritism. Names, cities and join dates for the calligraphy team.",
    ask: "Name, city and join date of the 3 earliest-joined customers, oldest account first.",
    template: `SELECT name, city, created_at
FROM customers
{1} BY {2} {3}
{4} {5};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Seniority is a ranking of join dates, so ORDER BY. DISTINCT would deduplicate names — the roster has none to remove and the ranking still wouldn't exist.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the seniority key",
        why: "Join date lives in created_at. Sorting by city would pick customers by geography — deterministic, but with nothing to do with seniority.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the date direction",
        why: "Earliest first is ascending — oldest dates on top. DESC would hand the notes to the newest signups, the exact opposite of founding members.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the note cap",
        why: "Three handwritten notes is the campaign budget, so LIMIT 3. Unbounded, the list runs to every customer ever joined.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the cohort size",
        why: "The calligraphy team preps three notes — the cap is 3. Five would double the spend without a sign-off.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "city", "region", "OFFSET", "5"],
    walkthrough:
      "Seniority is just a date sort worn as a business rule: ORDER BY created_at ASC puts the earliest join dates on top, LIMIT 3 takes the note list. The founding cohort: Alice Chen, Berlin, joined 2023-11-02; Bruno Silva, São Paulo, 2023-11-17; Chloe Dubois, Lyon, 2023-12-05. Direction is the entire decision here — DESC would hand the notes to Pedro Alvarez, who joined last, and the 'founding' story would collapse on the first reply. The cut is unambiguous because the join dates are all distinct, so there's no tie to argue about. Pattern worth mentioning to the Chief of Staff: the whole founding cohort sits in the EU region — the launch clearly caught on there first.",
  },
  {
    id: "cs-101",
    tier: "medium",
    topic: "l5",
    universe: "refund-audit",
    title: "Three cancellations worth goodwill",
    brief:
      "From: refunds@ internal ticket #4517.\n\nQuarter-end goodwill round. Policy: we manually assess the biggest cancelled orders first because they hurt revenue most, and the reviewer can clear three assessments per cycle — that's the agreed cap. Send the order ids with their totals so the assessment queue can be built.",
    ask: "Id and total of the 3 highest-value cancelled orders, biggest first.",
    template: `SELECT id, ROUND(total, 2) AS total
FROM orders
WHERE status = {1}
ORDER BY total {2}
{3} {4};`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The audit targets cancelled orders, and the value needs quotes: status = 'cancelled'. Bare cancelled would be parsed as a column and fail.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the value direction",
        why: "Biggest hurt first is descending. ASC would queue the tiniest cancellations — noise a junior can clear, not the revenue events this round is for.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the assessment cap",
        why: "The reviewer clears three per cycle, so LIMIT 3. OFFSET would skip rows instead of capping them and can't stand alone here.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the cycle cap",
        why: "Three assessments per cycle is policy — the cap is 3. Five would exceed the reviewer's signed-off workload.",
        noVerify: true,
      },
    ],
    distractors: ["'pending'", "'delivered'", "ASC", "OFFSET", "5"],
    walkthrough:
      "The queue is built in three moves: keep only cancelled rows, rank them by total descending, cut to the reviewer's three. The assessments: order 83 at 397.99, order 95 at 206.19, order 7 at 152.52. Quotes on 'cancelled' are not decoration — the bare word would be read as a column name and the query would die before any ranking happened. ASC is the classic reflex mistake here: it would open the round with the smallest cancellation on file, which is exactly the wrong end for a revenue-hurt review. Context for the sign-off: even the largest cancellation, 397.99, is well under the biggest live orders — cancellations here are small but frequent enough that the biggest-first policy is what keeps the round focused.",
  },
  {
    id: "cs-102",
    tier: "medium",
    topic: "l5",
    universe: "pricing",
    title: "The entry-level price ladder",
    brief:
      "From: Head of Product. Re: entry-tier landing page.\n\nThe new landing page leads with the cheapest three products to pull price-sensitive visitors in, cheapest first so the ladder reads naturally top to bottom. Nothing fancy — product name and price — but the order matters: the top slot is the first thing that segment sees.",
    ask: "Name and price of the 3 cheapest products, cheapest first.",
    template: `SELECT name, price
FROM products
ORDER BY price {1}
{2} {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the direction",
        why: "Cheapest first is ascending — the default direction, written out anyway so the intent is visible. DESC would put the 199.99 flagship on the entry-tier page.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the ladder cap",
        why: "The page shows three rungs, so LIMIT 3 trims the sorted list. OFFSET would skip the cheapest rows — showing rungs four to six instead of one to three.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the rung count",
        why: "Three rungs on the ladder — the cap is 3. Five would crowd the fold and push the ladder below it.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "OFFSET", "TOP", "5"],
    walkthrough:
      "The instinct to reach for DESC is expensive here: most ranking asks in this job are biggest-first, but this one is deliberately upside down. ORDER BY price ASC ranks all sixteen products cheapest-first and LIMIT 3 keeps the three rungs. The ladder: HDMI 2.1 Cable 2m at 14.99, Running Socks 3-pack at 18.5, Desk Mat Extended at 24.99. ASC is SQLite's default direction, so the query would work without it — but spelling the direction out costs nothing and documents the intent for whoever edits the landing page next. The spacing is friendly too: the next rung down the list, Yoga Mat at 32, is a clean step away, so the three-rung cut isn't leaning on a rounding coincidence.",
  },
  {
    id: "cs-103",
    tier: "medium",
    topic: "l5",
    universe: "fraud",
    title: "Card-testing probe: smallest tickets",
    brief:
      "From: Risk team, spot-check rotation.\n\nCard-testing fraud shows up as a burst of tiny authorizations — the opposite end of the sweep from the big-ticket review. This cycle we chase the floor: the four smallest orders on file, smallest first, to see whether the pattern is bot-shaped or just customers buying cables. Ids, totals and statuses for the workbench.",
    ask: "Id, total and status of the 4 smallest orders, smallest first.",
    template: `SELECT id, ROUND(total, 2) AS total, status
FROM orders
{1} BY total {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Finding the floor of a table is ranking it, so ORDER BY. GROUP BY would produce one row per total value and destroy the per-order view.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the direction",
        why: "Smallest first is ascending — the default direction doing exactly what the ask wants. DESC would return the 1,088.44 flagship order, which belongs to the big-ticket sweep.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the sample cap",
        why: "The workbench takes four rows, so LIMIT 4. Without a cap you'd re-rank the whole order book for no reason.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the sample size",
        why: "Four tickets is the floor-sample size for this cycle — the cap is 4. Six would pull in mid-range orders that dilute the signal.",
        noVerify: true,
      },
    ],
    distractors: ["DESC", "OFFSET", "TOP", "6"],
    walkthrough:
      "Floor-hunting is the same machinery as top-N, just pointed the other way: ORDER BY total ASC ranks the book cheapest-first and LIMIT 4 takes the head. The floor: order 51 at 25.47, cancelled; order 72 at 30.24, delivered; order 49 at 32.01, shipped; order 53 at 39.39, shipped. Read against the card-testing hypothesis, the sample is reassuring — only the very smallest ticket is a cancellation, and the next three are ordinary completed orders, which looks like cheap baskets rather than a bot burst. DESC is the reflex to guard against: it would surface the biggest order, 1,088.44, and that ticket already has its own sweep. Same query, flipped direction, entirely different investigation.",
  },
  {
    id: "cs-104",
    tier: "hard",
    topic: "l5",
    universe: "inventory",
    title: "Where the pallets pile up",
    brief:
      "From: Warehouse ops manager. Re: floor-space reallocation.\n\nAisle C is being re-slotted and I need to know where the deepest stock actually sits — the three products holding the most units, fullest shelf first. Those are the pallets worth moving to the new overflow racks before we touch anything else on the floor.",
    ask: "Name and stock of the 3 products with the most units in stock, fullest first.",
    template: `SELECT name, stock
FROM products
{1} BY {2} {3}
{4} {5};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Depth ranking is a sort of the stock column, so ORDER BY. A WHERE like stock > 0 would exclude nothing here — every shelf has units — and still rank nothing.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the depth key",
        why: "Units on the shelf live in stock. Sorting by price would rank the expensive shelves, not the deep ones — a different aisle entirely.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the depth direction",
        why: "Fullest first is descending. ASC would hand over the Smart Watch shelf at 40 units — that's the restock queue's problem, not this one.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the move cap",
        why: "The overflow racks take three products' worth of pallets, so LIMIT 3. Without it the plan covers all sixteen shelves.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the shelf count",
        why: "Three shelves move in this phase — the cap is 3. Five would pull in shelves that fit where they are.",
        noVerify: true,
      },
    ],
    distractors: ["ASC", "price", "OFFSET", "TOP", "5"],
    walkthrough:
      "Same ranking machinery as the restock queue, flipped: ORDER BY stock DESC puts the deepest shelves on top, LIMIT 3 scopes the move. The pallets: HDMI 2.1 Cable 2m at 500 units, Running Socks 3-pack at 400, Wireless Mouse M3 at 300. The business reading is the point: all three deep-stock products are cheap, small-box items — together they're 1,200 units that can move to overflow racks and hand aisle C back to the bulky gear. The tempting wrong turn is sorting by price: that ranks the premium shelves, which are deliberately shallow and mostly already on Friday's restock list. Direction discipline matters too — ASC here would nominate the thinnest shelf for a move nobody asked for.",
  },
  {
    id: "cs-105",
    tier: "medium",
    topic: "l5",
    universe: "funnel",
    title: "Page two of the storefront grid",
    brief:
      "From: Growth marketing lead. Re: badge test on the grid.\n\nThe discount-badge test moves to the second page of the storefront grid, so I need exactly what shoppers see there: products six through ten in the default browsing order, which is price high to low, five products per page. Names and prices for the test ticket, please — the window must be exact.",
    ask: "Name and price of products ranked 6th to 10th by price, high to low — page two, five per page.",
    template: `SELECT name, price
FROM products
{1} BY price {2}
LIMIT 5 {3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "The grid's browsing order is a ranking by price, so ORDER BY. Without the sort, OFFSET would skip rows in arbitrary table order and the page contents would be luck.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the browsing direction",
        why: "The grid runs price high to low, so DESC. ASC would redefine 'page two' as the bargain shelf — different products, broken test.",
      },
      {
        answer: "OFFSET",
        kind: "keyword",
        label: "the page skip",
        why: "OFFSET 5 skips the first page's five rows so LIMIT 5 can capture rows six to ten. It's the complement of LIMIT: skip, then take.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the skip size",
        why: "Page one holds five products, so the skip is 5. OFFSET 0 would replay page one; OFFSET 10 would jump to page three and the test would badge the wrong shelf.",
        noVerify: true,
      },
    ],
    distractors: ["ASC", "LIMIT", "TOP", "0", "10"],
    walkthrough:
      "Paging is a two-step trick: sort into browsing order, then skip what earlier pages already showed. ORDER BY price DESC is the grid's canonical order; OFFSET 5 discards page one's five rows; the hardcoded LIMIT 5 then captures exactly rows six to ten. Page two, as shoppers see it: Fitness Band X2 at 79, Cycling Jersey Pro at 65, Bluetooth Speaker Mini at 59.99, USB-C Hub 7-in-1 at 49, Laptop Stand Aluminum at 42.5. The skip size is the fragile bit — OFFSET 0 silently replays page one (the 199.99 flagship again), and OFFSET 10 lands on page three; either way the badge test measures the wrong shelf. Worth noting in the ticket: page two is solidly mid-range territory, 42.5 to 79, which is exactly where discount sensitivity should be sharpest.",
  },
];
