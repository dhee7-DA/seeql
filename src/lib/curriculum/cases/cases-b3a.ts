// Case batch B3a — lesson 3 (WHERE filters), cs-042…cs-055.
// Row-filter scenarios: comparisons, AND/OR, IN, LIKE, BETWEEN, month windows,
// negation. Figures sourced from scripts/facts/l3.json plus probed counts on
// the seed db; every case is mechanically audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB3a: CaseStudy[] = [
  {
    id: "cs-042",
    topic: "l3",
    universe: "inventory",
    title: "Shelves running thin",
    brief:
      "From: Warehouse ops manager. Re: Friday cycle count.\n\nBefore the count I walk the floor for anything running low, so pickers don't hit an empty bin mid-week. Pull the catalog lines whose on-hand figure has slipped under 60 units — product name and the number itself, so I can hit those bins first thing.",
    ask: "List each product whose stock is below 60 units, showing its name and current stock.",
    template: `{1} name, stock
{2} products
{3} stock {4} {5};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The memo wants two fields per product, so the statement opens with SELECT naming them. COUNT would collapse the walk list into a single number and lose the names.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Stock is an attribute of the catalog, so the rows come FROM products. orders would hand you transaction rows with no on-hand figure at all.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Keeping only the products under the cutoff is row-level narrowing, which is exactly WHERE's job. Without it you'd walk all 16 bins, most of them comfortably full.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the comparison operator",
        why: "'Slipped under 60' is strictly below: < keeps the 45 and 40 units bins. The tempting <= would drag the headset bin sitting at exactly 60 onto a list it doesn't belong on.",
      },
      {
        answer: "60",
        kind: "number",
        label: "the low-stock cutoff",
        why: "The memo sets the walk threshold at 60 units — anything under that figure makes the list, exactly as briefed. 45 would quietly drop the mic bin; 70 would add the headset.",
        noVerify: true,
      },
    ],
    distractors: [">", ">=", "<=", "45", "70"],
    walkthrough:
      "The ask is a short walk list: which bins are running low. That's a projection of two fields narrowed by one numeric condition. I read 'slipped under 60' as a strict comparison — a bin at exactly 60 still has a week of cover, so it stays off the list — which makes the operator < against the cutoff of 60. Run it and two products come back: Studio Desktop Mic at 45 units and Smart Watch S at 40. Worth noting for the count sheet: the Noise-Canceling Headset sits at exactly 60 and is deliberately excluded; if ops ever wants it included, the fix is <=, not a new threshold.",
  },
  {
    id: "cs-043",
    topic: "l3",
    universe: "funnel",
    title: "Two regions for the Q3 push",
    brief:
      "From: Growth marketing lead. Re: Q3 re-engagement flight.\n\nThe localized welcome-back creative is cleared for the Americas teams only so far, so the first flight goes to our US and LATAM customers. Pull those customer records — name, city and region — so CRM can load the audience without touching the other regions.",
    ask: "List customers in the US or LATAM regions with their name, city and region.",
    template: `SELECT name, city, region
FROM customers
{1} region = {2} {3} region = {4};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The audience is a subset of customer records, so the two region tests sit in WHERE. Putting them anywhere else either breaks the statement or returns the whole book of 16 customers.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the first region code",
        why: "US is a stored region code, so it wears quotes: region = 'US'. Bare US would be read as a column name and the statement would fail. It's also the bigger of the two audiences.",
      },
      {
        answer: "OR",
        kind: "keyword",
        label: "the combining keyword",
        why: "A customer is in one region, so qualifying for the flight means matching the first test OR the second. AND would demand both codes at once and return nothing — no row can be two regions.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the second region code",
        why: "LATAM is the second cleared region, quoted like any text value. Swapping in 'APAC' or 'EU' silently builds the wrong audience — those regions are still waiting on localized creative.",
      },
    ],
    distractors: ["AND", "'EU'", "'APAC'", "'LATAM'"],
    walkthrough:
      "Two cleared regions, one audience — the natural instinct is to write the region test twice and join the halves. The join word is the whole lesson: OR, because a customer lives in exactly one region and qualifies if either test passes. AND looks symmetric but asks each row to be US and LATAM simultaneously, which no customer can be — zero rows. Run it and the flight is small and deliberate: Bruno Silva in São Paulo for LATAM, then Emma Wilson in Austin and Jamal Wright in Chicago for the US — three records in all. Sanity check against the region mix: EU alone is 8 and APAC 5, so this is a genuinely narrow first flight, not a book-wide blast.",
  },
  {
    id: "cs-044",
    topic: "l3",
    universe: "supplier",
    title: "Rate-card review: the 4.5 bar",
    brief:
      "From: Supply-chain lead. Re: annual rate-card review.\n\nVendors rated 4.5 or better get the early renewal conversation and first call on next year's volumes; everyone else goes on the improvement track. Procurement needs the names with their current scores so nobody lands on the wrong track — and the bar is exact, so no rounding.",
    ask: "List every supplier whose rating is 4.5 or higher, with name and rating.",
    template: `SELECT name, rating
FROM suppliers
{1} rating {2} {3};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Splitting six vendors into two tracks is row-level narrowing, so the score test lives in WHERE. Drop it and the review sheet lists every supplier, improvement track included.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the comparison operator",
        why: "'4.5 or better' is an inclusive bar: >= keeps anyone sitting exactly on the line. The tempting > quietly rewrites the policy — a vendor at 4.5 exactly would miss early renewal over nothing.",
      },
      {
        answer: "4.5",
        kind: "number",
        label: "the rating bar",
        why: "The brief fixes the bar at 4.5 — the policy number, not the best score on file. Using 4.8 (the top rating today) would shrink the list to one vendor and misrun the whole review.",
        noVerify: true,
      },
    ],
    distractors: ["<", "=", "4.8", "4.4"],
    walkthrough:
      "This is a threshold read straight off the policy: which vendors clear 4.5. The subtlety is the word 'or' — the bar is inclusive, so >= is the honest operator and a vendor sitting exactly on 4.5 would make the list. Run it and two suppliers clear: Nordic Gadgets AB at 4.6 and Alpine Audio GmbH at 4.8. The near-miss matters as much as the list: Midwest Hardware Co lands at 4.4 and misses early renewal by a tenth — exactly the kind of boundary someone will argue about, so the score, 4.4, goes on the improvement track sheet verbatim. Two tracks, six vendors, no rounding.",
  },
  {
    id: "cs-045",
    topic: "l3",
    universe: "expense",
    title: "The mid-band card pile",
    brief:
      "From: Ops finance spend owner. Re: card reconciliation.\n\nMid-band orders — totals from 100 up to 200 — are where our virtual-card receipts and the ledger disagree most often. Before I escalate to the bank I want the size of the pile, not the paperwork: one number I can put in the escalation email.",
    ask: "Count the orders whose total falls between 100 and 200, bounds included.",
    template: `SELECT COUNT(*)
FROM orders
{1} total {2} {3} AND {4};`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The band test applies to each order's total before any counting, so it sits in WHERE. Leave it out and the count explodes to all 103 orders — every status, every size.",
      },
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the range operator",
        why: "A lower and upper bound on the same field is one range test: BETWEEN ... AND. The tempting IN is for picking values from a list, not for a span — IN 100 AND 200 is a syntax error.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the lower bound",
        why: "The band opens at 100 — BETWEEN is inclusive, so an order of exactly 100.00 would count. Raising it to 150 silently drops the lower half of the band and understates the pile.",
        noVerify: true,
      },
      {
        answer: "200",
        kind: "number",
        label: "the upper bound",
        why: "The band closes at 200, inclusive by BETWEEN's rules. Stretching it to 250 pulls in a higher band the bank reconciliation never covered and overstates the case.",
        noVerify: true,
      },
    ],
    distractors: ["NOT BETWEEN", "IN", "150", "250"],
    walkthrough:
      "The deliverable is a headcount, so COUNT(*) wraps the whole thing and the range test runs first in WHERE. BETWEEN is the span operator — total BETWEEN 100 AND 200 is shorthand for 'at least 100 and at most 200', bounds included, and the AND in the middle is part of the operator, not a second condition. Run it and the pile holds 23 orders. Two facts worth putting in the escalation email: no order sits exactly on either bound (nothing at 100.00 or 200.00), so inclusive-vs-exclusive changes nothing today; and the band splits 15 below the midpoint versus 8 above. NOT BETWEEN would hand you the other 80 orders — the exact complement, and the wrong pile.",
  },
  {
    id: "cs-046",
    topic: "l3",
    universe: "catalog",
    title: "Two shelves for the hero-banner shoot",
    brief:
      "From: Catalog content manager. Re: Tuesday hero-banner shoot.\n\nPhotography wants every Electronics and Accessories SKU in the studio — hubs, cables, stands, the lot. Pull those two shelves with each product's name and category so the prop list matches the catalog exactly. Nothing else ships to the studio.",
    ask: "List the name and category of every product in the Electronics or Accessories category.",
    template: `SELECT name, category
FROM products
{1} category {2} ({3}, {4});`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only two of seven shelves make the shoot, so the category test narrows rows in WHERE. Without it the prop list balloons to all 16 products, apparel and fitness mats included.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the list operator",
        why: "Matching one field against two allowed values is IN — shorthand for the two equality tests ORed together. The tempting = can only hold one value; a parenthesized pair breaks it.",
      },
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the first category",
        why: "Electronics is a stored category name, quotes and all — three products live there. Misspell it or drop the quotes and the shelf silently disappears from the prop list.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the second category",
        why: "Accessories is the second cleared shelf, another three products. Swapping in 'Audio' looks harmless — it's also a real shelf — but it books the wrong gear and leaves the cables at home.",
      },
    ],
    distractors: ["NOT IN", "=", "'Audio'", "'Wearables'"],
    walkthrough:
      "Two shelves, one list — the classic shape for IN. WHERE category IN ('Electronics', 'Accessories') reads as 'the category is one of these two', which is precisely the brief; writing it as two equality tests with OR would work but gets noisy as the list grows. Run it and six products come back in catalog order: the three Electronics SKUs — Mechanical Keyboard K1, Wireless Mouse M3, USB-C Hub 7-in-1 — then the three Accessories: HDMI 2.1 Cable 2m, Laptop Stand Aluminum, Desk Mat Extended. The tempting NOT IN is the exact complement: ten products from every shelf photography didn't ask for. And 'Audio' is the sneaky one — a real category, but nobody booked speakers for Tuesday.",
  },
  {
    id: "cs-047",
    topic: "l3",
    universe: "month-close",
    title: "September's booking count",
    brief:
      "From: Financial Controller. Re: September close prep.\n\nBefore I tie the September bank statement to the ledger I want the booking count for the month — orders created in September 2024, any status, since cancels get reconciled separately. One number for the workpaper, nothing else.",
    ask: "Count the orders created in September 2024, any status.",
    template: `SELECT {1}(*)
FROM orders
{2} strftime('%Y-%m', created_at) = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The workpaper wants one number: how many orders. COUNT(*) tallies the surviving rows. SUM would try to add the '*' and fail — there's nothing to sum in a headcount.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only September's rows belong in the tally, so the date test narrows rows in WHERE before COUNT runs. Every other month would pollute the workpaper figure.",
      },
      {
        answer: "'2024-09'",
        kind: "keyword",
        label: "the month stamp",
        why: "strftime('%Y-%m', ...) produces a text stamp like '2024-09', so the comparison value wears quotes and zero-padding. '2024-9' or an unquoted 2024-09 matches nothing — the string must match exactly.",
      },
    ],
    distractors: ["SUM", "LIKE", "'2024-10'", "'2025-01'"],
    walkthrough:
      "One number for the workpaper: orders created in September 2024, all statuses. The created_at field carries a full timestamp, so I carve out the month with strftime('%Y-%m', created_at) — that yields a text stamp — and compare it to the quoted literal '2024-09'. Both sides are text, so the match is exact: zero-padding matters, and '2024-9' would silently return nothing. Run it and September books 9 orders. Context for the workpaper: that's one of the busier months on file — October drops to 7 and January 2025 to 6 — and the figure deliberately includes cancels, since those reconcile on the separately tracked side of the ledger.",
  },
  {
    id: "cs-048",
    topic: "l3",
    universe: "growth",
    title: "Personalization smoke test",
    brief:
      "From: Chief of Staff. Re: lifecycle email smoke test.\n\nThe new lifecycle template renders differently when the letters 'son' appear anywhere inside a customer's name, so before the full send I need exactly those records to eyeball. Names and their cities, please — this is a render check, not a mailing list.",
    ask: "List the customers whose name contains the letters \"son\" anywhere in it, with their city.",
    template: `{1} name, city
FROM customers
{2} name {3} {4};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The deliverable is two fields per matching customer, so SELECT names them up front. Aggregating here would destroy the very rows QA needs to eyeball.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only names containing the fragment qualify, so the pattern test narrows rows in WHERE. Skip it and QA reviews all 16 customers for a branch most of them never trigger.",
      },
      {
        answer: "LIKE",
        kind: "keyword",
        label: "the pattern operator",
        why: "'Contains these letters anywhere' is a pattern match, so LIKE. The tempting = compares the whole name — no customer is literally named '%son%', so equality finds nobody.",
      },
      {
        answer: "'%son%'",
        kind: "keyword",
        label: "the name pattern",
        why: "The % wildcards on both sides are what make the fragment match anywhere in the name. Trim either one and the meaning shifts to starts-with or ends-with, which is a different test.",
      },
    ],
    distractors: ["FROM", "= '%son%'", "'son%'", "'%an%'"],
    walkthrough:
      "The brief says the letters can appear anywhere in the name — that's the whole specification, and it maps to LIKE with a wildcard on each side: name LIKE '%son%'. The percent signs do the work; without the leading one you'd only catch names beginning with 'son', without the trailing one only names ending in it. Run it and exactly one customer triggers the branch: Emma Wilson in Austin — the fragment sits inside the surname, which is precisely the mid-string case QA is worried about. Note the near-misses: '%an%' would hand you Hiro Tanaka instead, and equality with the raw pattern finds nobody, because no name is literally percent-s-o-n-percent.",
  },
  {
    id: "cs-049",
    topic: "l3",
    universe: "refund-audit",
    title: "Open-lane orders for the reserve",
    brief:
      "From: refunds@ internal ticket #4487.\n\nQuarterly reserve review. Money can still move on any order that hasn't finished its lifecycle — cancellations to refund, pendings to capture or release, shipments to return. Delivered is the only lane we treat as closed. One number for the reserve model, please.",
    ask: "Count every order whose status is anything other than delivered.",
    template: `SELECT {1}(*)
FROM orders
{2} status {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The reserve model takes a headcount, so COUNT(*) tallies the surviving rows. AVG or SUM make no sense against a status column of text.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The closed lane must drop out before the tally, so the status test sits in WHERE. Without it the count covers all 103 orders including the 52 that are done.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the exclusion operator",
        why: "'Anything other than delivered' is negation: != keeps every status except the named one. The tempting = does the opposite — it counts the closed lane alone and flips the whole figure.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the excluded status",
        why: "Delivered is the one closed lane, quoted as a text value. Excluding 'cancelled' instead would strand seven refundable orders outside the reserve — the costliest possible swap.",
      },
    ],
    distractors: ["=", "'cancelled'", "'pending'", "NOT"],
    walkthrough:
      "The reserve model needs everything that can still move, and 'everything except delivered' is a negation: status != 'delivered'. It's tempting to reach for = because equality feels safer, but = 'delivered' counts the one lane that's closed — the exact complement of the ask. Run it and 51 orders sit in open lanes: 14 pending, 30 shipped and 7 cancelled. That 51 is the number feeding the reserve model this quarter. Worth flagging beside it: the pending bucket is where money is genuinely undecided, so if finance wants a tighter reserve later, that's the slice to break out first.",
  },
  {
    id: "cs-050",
    topic: "l3",
    universe: "pricing",
    title: "Above the 100 mark",
    brief:
      "From: Head of Product. Re: premium positioning deck.\n\nFor the premium story I want the SKUs that already command a price above 100 — those carry the narrative. List them with their current price so I can annotate the deck straight from your output. The bar is the number itself; don't round it and don't stretch it.",
    ask: "List each product priced above 100 with its name and price.",
    template: `{1} name, price
FROM products
{2} price > {3};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The deck needs two fields per SKU — name and price — so the statement opens with SELECT projecting exactly those. A count would tell the deck how many but show none of them.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only the premium SKUs belong in the deck, so the price test narrows rows in WHERE. Unfiltered, the slide would include the 14.99 cable — the opposite of premium.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium bar",
        why: "The brief fixes the bar at 100 — a round policy number, not a read off today's prices. Nudging it to 150 would leave the deck with a single SKU and no story.",
        noVerify: true,
      },
    ],
    distractors: ["FROM", "<", "150", "120"],
    walkthrough:
      "One test carries this deck slide: which SKUs already price above 100. 'Above' is strict, so the operator is > against the bar of 100 — a product at exactly 100.00 would miss the cut, which is the definition to keep if anyone asks why a borderline SKU isn't on the slide. Run it and four products clear: Noise-Canceling Headset at 149.99, Studio Desktop Mic at 119, 4K Webcam Pro at 129 and Smart Watch S at 199.99, the anchor. The tempting distractors are quiet rewrites of the bar: 150 shrinks the story to one hero product, 120 drops the mic, and flipping to < lists the twelve budget SKUs — the shelf the deck explicitly isn't about.",
  },
  {
    id: "cs-051",
    topic: "l3",
    universe: "fraud",
    title: "Pending tickets over 500",
    brief:
      "From: Risk team, spot-check rotation.\n\nLarge orders still sitting in pending are our highest-exposure tickets — money reserved, nothing shipped, card not settled. Pull the order id and total for every pending order above 500 so reviewers can open the full records. Keep it to pending only; shipped tickets go to a different queue.",
    ask: "List the id and total of every pending order with a total above 500.",
    template: `{1} id, total
FROM orders
{2} status = {3} {4} total > {5};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "Reviewers need the handle and the amount — id and total — so SELECT projects exactly those two fields. A bare count would send them hunting through the table by hand.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Both tests — status and size — narrow individual rows, so they live in WHERE ahead of any output. All 103 orders would otherwise flood a queue meant for a sitting's worth of work.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status value",
        why: "Pending is a text value, so it wears quotes: status = 'pending'. The tempting 'shipped' is a real status too — and precisely the queue this list must NOT feed.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the combining keyword",
        why: "A ticket qualifies only if it is pending AND above 500 — both tests must pass for the same row. OR would union every pending order with every large one and drown the queue.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the exposure threshold",
        why: "The rotation defines high exposure as above 500 — strictly greater, so an order at exactly 500.00 would wait for the next cycle. Dropping to 300 widens the net well past policy.",
        noVerify: true,
      },
    ],
    distractors: ["OR", "'shipped'", "'delivered'", "300", "800"],
    walkthrough:
      "Two conditions, one queue: status must be pending and the total must clear 500, so both tests sit in WHERE joined by AND — an order has to satisfy both at once. 'Pending' is a text value and wears quotes; the size test uses strict >, so exactly 500.00 would not qualify. Run it and five tickets make the sitting: order 1 at 576.54, order 5 at 725.34, order 43 at 945.21, order 74 at 1,088.44 and order 97 at 585.79. Two notes for the reviewer: order 74 is the largest ticket on file, and it's still unsettled — worth opening first. Loosen the threshold to 300 and the queue jumps to eight tickets; tighten to 800 and three of today's five vanish.",
  },
  {
    id: "cs-052",
    topic: "l3",
    universe: "inventory",
    title: "Bulk bins above the line",
    brief:
      "From: Warehouse ops manager. Re: overflow bin assignment.\n\nAnything stocked above 250 units needs an overflow bin before peak season — our standard bins top out around that figure. For the facilities ticket I just need the size of the sweep: how many SKUs are we re-binning? The bin crew collects names later.",
    ask: "Count the products whose stock is above 250 units.",
    template: `SELECT {1}(*)
FROM products
{2} stock {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The facilities ticket wants the size of the sweep, so COUNT(*) turns the filtered rows into one number. SUM(stock) would add unit counts together and answer a question nobody asked.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only SKUs over the bin capacity belong in the tally, so the stock test narrows rows in WHERE first. Without it the count covers all sixteen products regardless of bin fit.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the comparison operator",
        why: "'Above 250' is strict: > keeps only bins past the line. The tempting <= inverts the sweep — it would count the comfortably-stowed twelve and miss every overflow case.",
      },
      {
        answer: "250",
        kind: "number",
        label: "the bin-capacity line",
        why: "The memo pegs standard bin capacity at 250 units — the physical limit, not a read off the biggest stock figure. Walking it up to 260 hides the desk-mat bin that barely breaches.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "<", "260", "200"],
    walkthrough:
      "A headcount for facilities, so COUNT(*) it is, with the stock test running first in WHERE. 'Above 250' reads as strict greater-than: a bin holding exactly 250 still fits standard racking, so it stays off the sweep — only bins past the line qualify. Run it and four SKUs need overflow assignment: Wireless Mouse M3 at 300, HDMI 2.1 Cable 2m at 500, Running Socks 3-pack at 400 and Desk Mat Extended at 260. The desk mat is the boundary case worth a second look — it clears the line by ten units, and nudging the threshold to 260 would quietly drop it from the ticket.",
  },
  {
    id: "cs-053",
    topic: "l3",
    universe: "funnel",
    title: "Audience the agency inherits",
    brief:
      "From: Growth marketing lead. Re: agency handoff sheet.\n\nThe new agency takes over EU and APAC acquisition only — the Americas stays in-house. For the handoff sheet I need the audience size they're inheriting: how many customer records sit in those two regions combined? One figure for the contract annex.",
    ask: "Count the customers in the EU or APAC regions combined.",
    template: `SELECT COUNT(*)
FROM customers
{1} region {2} ({3}, {4});`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only the two handed-over regions belong in the tally, so the region test narrows rows in WHERE before the count. Unfiltered, the annex would claim all 16 customers.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the list operator",
        why: "Two acceptable region codes is a set test: IN matches either value. The tempting = can compare against only one code and breaks when handed a parenthesized pair.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the first region code",
        why: "EU is the bigger share of the handoff — eight customers — and needs its quotes as a text code. 'US' in this position quietly shifts Americas customers into the agency's contract.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the second region code",
        why: "APAC is the second region changing hands, five customers. 'LATAM' here would misroute the one LATAM customer to the agency while leaving APAC on the in-house books.",
      },
    ],
    distractors: ["NOT IN", "=", "'US'", "'LATAM'"],
    walkthrough:
      "One figure for the annex: how many customers change hands. The set of acceptable regions is written as a list — region IN ('EU', 'APAC') — which is the tidy shorthand for the two equality tests ORed together, and it scales if a third region ever moves. Run it and the agency inherits 13 of the 16 customers: 8 in EU plus 5 in APAC. The complement is the part worth reading aloud in the handoff: NOT IN keeps the 3 Americas customers in-house — Emma Wilson and Jamal Wright in the US, Bruno Silva in LATAM — and that's the boundary the contract annex should name explicitly.",
  },
  {
    id: "cs-054",
    topic: "l3",
    universe: "supplier",
    title: "The renegotiation shortlist",
    brief:
      "From: Supply-chain lead. Re: inbound freight RFP.\n\nVendors we've rated under 4.0 go into the renegotiation bundle — they're the ones re-pricing terms, and logistics wants their names and regions on one page. The scores themselves stay in the scorecard, so keep the output to name and region.",
    ask: "List the name and region of every supplier rated below 4.0.",
    template: `{1} name, region
FROM suppliers
{2} rating {3} {4};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The one-pager wants name and region only, so SELECT projects exactly those two fields — the scores stay in the scorecard, as briefed.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only vendors under the line join the bundle, so the rating test narrows rows in WHERE. All six suppliers on the page would put compliant vendors into renegotiation too.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the comparison operator",
        why: "'Under 4.0' is strictly below: < excludes the line itself. The tempting <= rewrites the brief and pulls the vendor sitting exactly on 4.0 into a renegotiation it earned its way out of.",
      },
      {
        answer: "4.0",
        kind: "number",
        label: "the renegotiation line",
        why: "The brief draws the line at 4.0 — the policy boundary, not the lowest score on file. Moving it to 4.1 widens the bundle to two vendors and re-opens terms someone just cleared.",
        noVerify: true,
      },
    ],
    distractors: ["<=", ">", "4.1", "3.9"],
    walkthrough:
      "The bundle is defined by exclusion from good standing: rating under 4.0, strictly. The operator choice is the whole case — < keeps only scores below the line, while <= would drag the vendor sitting exactly on 4.0 into renegotiation despite clearing the bar. Run it and the shortlist is a single name: Pacific Textiles in APAC at 3.9. That's the honest answer even though it's short — Andes Naturals sits exactly on the line at 4.0 and stays out, and Shenzhen Electro at 4.1 is a whisker above. If the bundle ever feels too thin, the fix is a policy conversation about the line, not quietly moving the threshold to 4.1.",
  },
  {
    id: "cs-055",
    topic: "l3",
    universe: "expense",
    title: "Volume lines for renegotiation",
    brief:
      "From: Ops finance spend owner. Re: Q3 volume-pricing renegotiation.\n\nLine items where we bought three or more units of the same SKU are the leverage points — suppliers discount at volume, and I want to know how many such lines we actually run before I book the supplier meetings. A count of line items, not a list.",
    ask: "Count the order line items with a quantity of 3 or more.",
    template: `SELECT {1}(*)
FROM {2}
{3} quantity {4} {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is how many lines, so COUNT(*) tallies them into one figure. SUM(quantity) would add up units purchased and answer a different question entirely.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the source table",
        why: "Quantity-per-line lives on order_items — the orders table carries one total per purchase and products carries no purchase quantity at all. Wrong table, immediate failure.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Only lines at or above the volume mark belong in the tally, so the quantity test narrows rows in WHERE before COUNT runs over the surviving 251-line table.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the comparison operator",
        why: "'Three or more' is inclusive: >= keeps lines at exactly 3. The tempting > is the boundary trap here — with quantities on file topping out at 3, it would empty the count to zero.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the volume mark",
        why: "The brief sets volume at three units — the supplier's discount trigger, not a number read off the data. Demanding 5 would find no lines at all and cancel the meetings.",
        noVerify: true,
      },
    ],
    distractors: ["orders", "products", ">", "5", "2"],
    walkthrough:
      "A headcount of volume lines, so COUNT(*) over order_items — the only table that carries a per-line quantity. The brief says 'three or more', which is the inclusive >= against 3, and the boundary is not academic: quantities on file run 1 to 3, so exactly-3 lines are the entire volume story. Run it and 89 of the 251 line items clear the bar — that's the leverage count for the Q3 meetings. The instructive failure sits one operator away: strict > would return zero lines, because nothing on file exceeds 3 units, and the meetings would be cancelled over a typo. Lower the mark to 2 and the count balloons to 158, diluting the volume argument.",
  },
];
