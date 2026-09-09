// Case batch B7b — l7 (Aggregates), cs-152…cs-165.
// Authored against scripts/facts/l7.json and audited by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB7b: CaseStudy[] = [
  {
    id: "cs-152",
    tier: "medium",
    topic: "l7",
    universe: "refund-audit",
    title: "The cancellation backlog in one row",
    brief:
      "From: refunds@ internal ticket #4517.\n\nQuarter-end goodwill review. Finance wants the cancellation exposure framed at a glance: how many orders we walked back, the total value they carried, and the largest single one we ate. If the pile is small we clear it manually; if it's chunky we escalate to the goodwill vendor fund instead.",
    ask: "Count the cancelled orders, their combined value, and the largest single cancellation, all in one row.",
    template: `SELECT {1}(*) AS tickets,
       ROUND({2}(total), 2) AS lost_value,
       ROUND({3}(total), 2) AS worst_case
FROM orders
{4} status = 'cancelled';`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the headcount aggregate",
        why: "A queue size is rows counted, so COUNT(*). SUM would try to add up the '*' and fail outright, and MAX would hand back one extreme order's value instead of how many there are.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "Combined value means every cancelled total added together — SUM. COUNT would answer 'how many' (7) and AVG would water the pile down to its mean.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the worst-case aggregate",
        why: "Largest single loss is the extreme, so MAX lifts the biggest total out of the set. SUM would stack all seven cancellations on top of each other and overstate the single worst hit.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "The status screen applies to each order row before any totalling, so WHERE is the gate. HAVING only works after a GROUP BY, and this one-row answer has no groups.",
      },
    ],
    distractors: ["AVG", "MIN", "HAVING", "order_items"],
    walkthrough:
      "The refund lead asked for three numbers about one queue, so all three aggregates ride in a single SELECT over the same filtered rows: COUNT(*) sizes the queue, SUM(total) prices it, MAX(total) flags the worst single hit. The filter runs first — status = 'cancelled' trims the 103 orders down to 7 — and then the aggregates collapse those 7 rows into one line: 7 tickets, 1,152.49 lost, worst case 397.99. Worth noticing the division of labour: SUM answers 'how much altogether', MAX answers 'how bad is the single worst', and swapping either one silently misanswers the memo. Scale call: seven cancellations and about 1.1k of value is manual-clear territory — no temp reviewer needed this quarter.",
  },
  {
    id: "cs-153",
    tier: "medium",
    topic: "l7",
    universe: "pricing",
    title: "The catalog's price floor and ceiling",
    brief:
      "From: Head of Product. Re: pricing review kickoff.\n\nBefore we touch a single price tag I want the shape of the catalog as it stands: the cheapest thing we sell, the most expensive, and how many products we're actually talking about. It anchors every increase we propose — a low floor means entry bundles write themselves, a high ceiling means there's headroom for a premium line.",
    ask: "One row with the lowest price in the catalog, the highest price, and the number of products.",
    template: `SELECT {1}(price) AS floor_price,
       {2}(price) AS ceiling_price,
       {3}(*) AS skus
FROM {4};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "Cheapest item on the shelf is the minimum — MIN scans the price column and returns the smallest. MAX would return the ceiling instead, and SUM would stack every price into one meaningless pile.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "Most expensive means the extreme top of the column — MAX. MIN is its mirror and would report the bargain bin, while AVG would smooth everything to the middle, which is neither floor nor ceiling.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the inventory headcount",
        why: "How many products exist is a row count — COUNT(*). SUM(price) would add the tags together and print a number nobody asked for, and the column aggregates would each return a price, not a quantity.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "List prices live in products.price. suppliers has no price column at all and orders carries transaction totals, not catalog tags — either would fail the query outright.",
      },
    ],
    distractors: ["AVG", "SUM", "suppliers", "orders"],
    walkthrough:
      "This one is pure extremes plus a headcount: MIN walks the price column to its bottom, MAX to its top, COUNT(*) counts the rows — no filter, because the review wants the whole catalog as-is. The numbers: floor 14.99 (the HDMI cable), ceiling 199.99 (the smart watch), across 16 products. Two habits worth copying: compute both extremes in one pass so they can never disagree about scope, and leave the money unrounded here — MIN and MAX of stored prices are real tags, not computed means, so ROUND would be pure decoration. If the ceiling holds at 199.99, a premium line has headroom above 200.",
  },
  {
    id: "cs-154",
    tier: "easy",
    topic: "l7",
    universe: "fraud",
    title: "Exposure above a line never crossed",
    brief:
      "From: Risk team, spot-check rotation.\n\nOur payment processor flags any single order that would ever clear the 99,999 stress line — a guardrail set so high it has never once been breached. For the audit trail we still have to print the money that sits above it every month. The expected outcome is an empty-looking figure; if it ever shows real value, we escalate the same day.",
    ask: "Total value of orders above the 99999 stress line, reported even when no order qualifies.",
    template: `SELECT {1}(total) AS ghost_exposure
FROM orders
WHERE total {2} {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregate",
        why: "Exposure means value added across qualifying orders — SUM. COUNT would report how many orders crossed the line, not how much money they carry.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the direction of the test",
        why: "Above the line means strictly greater: total > 99999. Flipping to < would sweep in every order on file and report the entire book as exposure.",
      },
      {
        answer: "99999",
        kind: "number",
        label: "the stress line",
        why: "The processor's guardrail is 99,999 — the literal straight from the policy doc. No order in the book comes anywhere near it, which is exactly the point of the check.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "<", "HAVING", "500"],
    walkthrough:
      "This memo looks trivial and teaches the sharpest lesson in aggregates: over an empty set, SUM returns NULL, not zero. The filter total > 99999 matches nothing — the biggest order ever booked is 1,088.44 — so the query still returns one row, but the cell holds NULL: the exposure 'shows nothing at all', exactly as the memo predicts. The contrast to burn in: run COUNT over the same empty filter and you get a tidy 0, because counting nothing is a number, while summing nothing has no value to add. And note the flip risk — writing < instead of > would report the whole 34,833.28 book as exposure and page the risk team for nothing.",
  },
  {
    id: "cs-155",
    tier: "hard",
    topic: "l7",
    universe: "inventory",
    title: "Units on the shelf, counted once",
    brief:
      "From: Warehouse ops manager. Re: cycle-count prep.\n\nBefore the counters hit the floor I want the depth picture for the whole catalog in one breath: total units on hand, the average depth a product sits at, the deepest bin we'd be counting, the thinnest, and how many bins there are. It tells me how many bodies to roster and whether any single shelf will eat a whole afternoon.",
    ask: "One row with total units in stock, average depth to 1 decimal, deepest and thinnest stock, and the SKU count.",
    template: `SELECT {1}(stock) AS units_on_hand,
       ROUND({2}(stock), 1) AS mean_depth,
       {3}(stock) AS deepest_bin,
       {4}(stock) AS thinnest_bin,
       {5}(*) AS skus_counted
FROM {6};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the units aggregate",
        why: "Total units means every stock figure added together — SUM. COUNT would report 16 products, not the 2,845 units sitting inside them.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the depth aggregate",
        why: "Average depth is the mean of the stock column — AVG, wrapped in ROUND(...,1) so the roster sheet shows one clean decimal. SUM would print the whole pile as if a single product held it.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the deepest-bin aggregate",
        why: "Deepest bin is the largest stock figure — MAX. MIN is the mirror and would surface the thinnest shelf instead, sending the counters to the wrong aisle.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the thinnest-bin aggregate",
        why: "Thinnest stock is the smallest figure — MIN. Swapping in MAX answers the previous column and leaves the thin spot undiscovered until a pick fails.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bin headcount",
        why: "How many bins get counted is a row count — COUNT(*). The other aggregates each collapse the column into a value; only COUNT tells you how many rows there were.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Shelf depth lives in products.stock. order_items holds per-line quantities from sold orders — history, not what's on the shelf today — and customers has no stock at all.",
      },
    ],
    distractors: ["order_items", "quantity", "unit_price", "customers"],
    walkthrough:
      "One pass, five numbers: SUM(stock) piles up 2,845 units, AVG(stock) says the mean bin depth is 177.8, MAX and MIN bracket the range at 500 down to 40, and COUNT(*) confirms 16 SKUs. The bracketing is the useful part — the 500-unit deepest bin is the HDMI cable wall and the 40-unit thinnest is the smart watch — so one counter can take the cable aisle while the watch bin takes two minutes. Rounding the mean to one decimal is a roster-sheet courtesy, not a math step; the extremes stay raw because they're real stored figures. Bodies to roster: call it three for the floor, with the cable wall as the long pole.",
  },
  {
    id: "cs-156",
    tier: "medium",
    topic: "l7",
    universe: "funnel",
    title: "The bottom of the funnel, priced",
    brief:
      "From: Growth marketing lead. Re: funnel board review.\n\nThe board slide needs the bottom of the funnel in one row: orders that actually completed the journey and got delivered. I want how many made it, the revenue they realized, and the average basket behind that number — it's the proof point sitting under every top-of-funnel claim we make upstairs.",
    ask: "Count of delivered orders with their combined revenue and average order value, money rounded to 2 decimals.",
    template: `SELECT {1}(*) AS won_orders,
       ROUND({2}(total), 2) AS realized_revenue,
       ROUND({3}(total), 2) AS mean_basket
FROM orders
{4} status = {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the conversion headcount",
        why: "How many orders completed the journey is a headcount — COUNT(*). SUM(*) isn't a thing at all, and the value aggregates would answer money questions, not volume.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Realized revenue is every delivered total added together — SUM. AVG would divide by 52 and report the basket size instead of the money the funnel produced.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the basket aggregate",
        why: "Average basket is the mean of the delivered totals — AVG. SUM would inflate the cell to the full 15,571.07 and the board would read it as the typical order.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "The status screen applies to each order row before totalling, so WHERE is the gate. HAVING needs a GROUP BY first, and this one-row answer has no groups to filter.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status value",
        why: "The funnel bottom is orders that arrived — and the literal needs its quotes: 'delivered'. Bare delivered reads as a column name and kills the query; 'pending' would count orders still in the pipe.",
      },
    ],
    distractors: ["MAX", "MIN", "'pending'", "'cancelled'", "HAVING"],
    walkthrough:
      "Three aggregates, one filter, zero groups: the status screen keeps only delivered orders — 52 of the 103 — and then COUNT sizes them, SUM prices them at 15,571.07, and AVG divides for a 299.44 mean basket. Reading them side by side is the habit: 15,571.07 over 52 lands right on 299.44, so the cells can't silently disagree about scope. The quotes around 'delivered' matter more than they look — unquoted, SQL hunts for a column of that name and the whole board slide waits on an error. Cross-check for the deck: pending orders average 436.64, so the baskets we haven't closed yet are running bigger than the ones we have.",
  },
  {
    id: "cs-157",
    tier: "easy",
    topic: "l7",
    universe: "supplier",
    title: "Supplier scorecard extremes",
    brief:
      "From: Supply-chain lead. Re: annual supplier scorecard.\n\nThe scorecard opens with the spread of our delivery partners' ratings: the best score we're working with, the worst, and the average across the panel. The spread decides the year's posture — consolidate volume with the top performers, or spend the cycle coaching the tail instead.",
    ask: "One row with the highest supplier rating, the lowest, and the panel average, each to 1 decimal.",
    template: `SELECT ROUND({1}(rating), 1) AS best_score,
       ROUND({2}(rating), 1) AS worst_score,
       ROUND({3}(rating), 1) AS mean_score
FROM suppliers;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the best-score aggregate",
        why: "Best score on the panel is the maximum — MAX walks the rating column to its top. MIN would report the problem supplier instead of the star.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the worst-score aggregate",
        why: "Worst score is the minimum — MIN. MAX answers the previous column, and SUM would add six ratings into a number no scorecard has ever used.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the panel aggregate",
        why: "Panel average is the mean of all six ratings — AVG. MAX or MIN would quote one supplier's score and call it the panel's, flattering or slandering everyone at once.",
      },
    ],
    distractors: ["SUM", "COUNT", "region", "name"],
    walkthrough:
      "Three reads of the same six-row column: MAX finds the star at 4.8, MIN finds the tail at 3.9, AVG settles the panel at 4.3. The one-decimal rounding is a scorecard convention — ratings are recorded to one decimal anyway, so ROUND is cosmetic here — but it keeps the three cells typographically identical. What the spread says: 4.8 down to 3.9 is just under a full point of daylight between best and worst, and the mean sitting at 4.3 means the panel is genuinely mid-weight, not propped up by one star. Posture call: shift volume toward the 4.8 partner, and the 3.9 gets a growth plan or an exit interview.",
  },
  {
    id: "cs-158",
    tier: "easy",
    topic: "l7",
    universe: "expense",
    title: "What the big tickets cost us",
    brief:
      "From: Ops finance, spend review.\n\nProcurement asks the same question every half-year: how much of the order book sits in the big-ticket band — anything above 500 per order. It's the slice we renegotiate first, because a handful of large tickets usually hides most of the money. Print the combined value of that band for the current book.",
    ask: "Combined order value for every order above the 500 big-ticket line, rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS big_spend
FROM orders
{2} total > {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the band-value aggregate",
        why: "Combined value is the total column added across qualifying orders — SUM. AVG would report the typical big ticket rather than what the band costs altogether.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "The 500 line screens individual order rows before any totalling, so WHERE is the gate. HAVING only applies after grouping, which a single-row answer never does.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the big-ticket line",
        why: "The spend band starts strictly above 500 — an order priced exactly 500.00 sits on the line, not in the band. The literal comes straight from the procurement memo.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "AVG", "<", "100", "5000"],
    walkthrough:
      "One filter, one aggregate: the 500 line keeps only the heavy orders, and SUM(total) prices the band at 17,379.43 — just shy of half the 34,833.28 book, which is exactly the leverage the memo predicted. The strictness of the line is worth a beat: > 500 means a 500.00 order stays out, and dropping the line to 100 balloons the band to 33,964.62 and buries the negotiation targets. Placement habit: the band is defined in WHERE, before the aggregate ever runs — the sum only ever sees the rows that survived the screen. The renegotiation shortlist writes itself from here: sort the band, start at the top.",
  },
  {
    id: "cs-159",
    tier: "medium",
    topic: "l7",
    universe: "catalog",
    title: "The affordable shelf, sized",
    brief:
      "From: Catalog content manager. Re: entry-level page build.\n\nWe're launching an 'under 50' landing page and I need its shape before writing copy: how many products actually qualify, and what the average tag looks like once they're gathered onto one shelf. If the shelf is thin we widen the brief; if the average sits low enough, we lead with bundles.",
    ask: "Count of products priced under 50 and their average price to 2 decimals, in one row.",
    template: `SELECT {1}(*) AS budget_skus,
       ROUND({2}(price), 2) AS mean_tag
FROM products
{3} price < {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf headcount",
        why: "How many products qualify is a row count — COUNT(*). AVG would report a price where the memo asks for a quantity of SKUs.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the tag aggregate",
        why: "Average tag of the qualifying shelf is the mean of their prices — AVG inside ROUND for clean cents. SUM would add the tags into one number that describes nothing a shopper cares about.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "The under-50 rule screens each product row before the aggregates run, so WHERE is the gate. HAVING is for filtering groups, and this query has no groups.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the shelf ceiling",
        why: "The page is strictly 'under 50' — a product priced exactly 50.00 misses the shelf. The literal is the brief's own line, spelled 50 not 50.00.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "MAX", "MIN", "HAVING", "100", "20"],
    walkthrough:
      "The filter runs first — price < 50 keeps 8 of the 16 products — then COUNT sizes the shelf and AVG prices it: 32.06 on average, well under the page's own ceiling because the cheap end clusters hard, with the 14.99 cable dragging the mean down. Worth noticing what the pair answers together: 8 SKUs is a real page, and a 32.06 average means the 'under 50' copy can honestly promise most items sit well below the line. Swap either aggregate and the memo misreads: SUM of the shelf prints 256.47 — the shelf's combined price, a number with no buyer meaning. If marketing wants a thinner page, the 20 line cuts the shelf to 2 — too thin to bother.",
  },
  {
    id: "cs-160",
    tier: "easy",
    topic: "l7",
    universe: "month-close",
    title: "The January signature number",
    brief:
      "From: Financial Controller. Re: January close sign-off.\n\nI sign the January number this week and I want it built the boring way: every order booked in the calendar month, statuses included, added up once. No netting, no hand-built lists — one figure I can trace straight back to the ledger if anyone upstairs asks.",
    ask: "Total revenue booked in January 2024 across all orders, rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS jan_close
FROM orders
{2} strftime('%Y-%m', created_at) = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the close aggregate",
        why: "The signed number is every January total added together — SUM. MAX would report the single biggest order and call it the month; COUNT would report how many orders, not what they were worth.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "The month screen applies to each order row before the total is taken, so WHERE gates the rows. HAVING needs a GROUP BY first — a single signed figure has no groups.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the month literal",
        why: "The ledger stores full timestamps, so the month is matched as the text '2024-01' — quotes required. '2024-02' would execute perfectly and silently sign off February instead.",
      },
    ],
    distractors: ["AVG", "COUNT", "MAX", "HAVING", "'2024-02'"],
    walkthrough:
      "The pattern to internalize is month-matching on a timestamp: strftime('%Y-%m', created_at) slices each order's stamp down to its '2024-01' prefix, and WHERE keeps only January's rows. SUM then adds the surviving totals once: 3,731.97 signed. Round only at the end — the raw sum of cent-precise totals is already cent-precise, so ROUND is presentation, not correction. Two habits I'd stamp on this query: the filter lives in WHERE (rows are screened before the aggregate ever runs), and the month literal wears quotes because it's a text match, not a number — '2024-02' would run clean and sign the wrong month, 3,609.64, without raising an eyebrow.",
  },
  {
    id: "cs-161",
    tier: "medium",
    topic: "l7",
    universe: "growth",
    title: "The board deck's one-line business",
    brief:
      "From: Chief of Staff. Re: board deck, opening line.\n\nThe deck's first sentence needs the whole business in three figures: how many orders we've taken, the revenue they add up to, and the largest single ticket among them. Nothing derived, nothing sliced — the raw scale of the book as the board walks into the room.",
    ask: "One row with the order count, total revenue rounded to 2 decimals, and the largest single order value.",
    template: `SELECT {1}(*) AS orders_booked,
       ROUND({2}(total), 2) AS revenue,
       ROUND({3}(total), 2) AS biggest
FROM {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the volume aggregate",
        why: "How many orders we've taken is a row count — COUNT(*). SUM would collapse the whole question into a money figure and leave the volume unanswered.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Revenue is every order total added together — SUM. COUNT would print 103 where the board expects money, and AVG would shrink it to the average order.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the extreme aggregate",
        why: "Largest single ticket is the extreme of the total column — MAX. SUM would stack all 103 orders into one number and claim it was a single order.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order-level figures live in orders.total. products holds catalog prices and customers holds people — neither has a total column, so both would fail the query.",
      },
    ],
    distractors: ["AVG", "MIN", "customers", "products"],
    walkthrough:
      "Three aggregates over one unfiltered table: COUNT(*) says 103 orders, SUM(total) prices the book at 34,833.28, MAX(total) flags the 1,088.44 ticket. No filter — the ask is the whole book, statuses and all, and any WHERE here would quietly shrink the headline without telling us. The trio works because each answers a different question — volume, value, extreme — and none can stand in for another: swap SUM for COUNT and the deck leads with '103' as revenue. One caveat for the room: the biggest ticket is still pending, so 1,088.44 of that 34,833.28 hasn't actually been delivered yet.",
  },
  {
    id: "cs-162",
    tier: "medium",
    topic: "l7",
    universe: "refund-audit",
    title: "What a walk-away costs on average",
    brief:
      "From: refunds@ internal ticket #4608.\n\nSupport asked what a typical cancellation costs us so the goodwill budget can be sized per case, and what the worst single walk-away on the books looks like. Both numbers in one line please — the mean for the per-case budget, the extreme for the escalation policy.",
    ask: "Average value of cancelled orders and the largest single cancelled order, both to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS mean_refund,
       ROUND({2}(total), 2) AS worst_case
FROM orders
{3} status = {4};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "A typical cancellation is the mean of the cancelled totals — AVG. SUM would report the whole queue's value and wreck the per-case budget line.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the worst-case aggregate",
        why: "The worst single walk-away is the largest cancelled total — MAX. AVG would smooth the 397.99 hit down to the mean and hide the escalation trigger entirely.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "The status screen applies per order row before the aggregates run, so WHERE. HAVING filters groups, and this query produces exactly one groupless row.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "Refundable orders are the cancelled ones — the literal needs quotes: 'cancelled'. 'delivered' would budget goodwill against orders that arrived perfectly fine.",
      },
    ],
    distractors: ["SUM", "MIN", "'pending'", "'delivered'", "HAVING"],
    walkthrough:
      "Two aggregates, one filter, and a deliberate pairing: AVG(total) over the cancelled rows gives 164.64 — the per-case goodwill number — while MAX(total) on the same rows flags 397.99 as the worst single walk-away. The filter does the heavy lifting: status = 'cancelled' cuts the 103 orders down to 7 before either aggregate runs, so both cells describe exactly the same queue and can't drift apart. Watch the decoy logic: SUM would print the queue's whole 1,152.49, which is a different memo, and 'pending' would average orders that haven't failed at all. Budget note: seven cases at roughly 165 each reproduces the queue's value — the mean reconciles.",
  },
  {
    id: "cs-163",
    tier: "easy",
    topic: "l7",
    universe: "pricing",
    title: "Sizing the premium shelf",
    brief:
      "From: Head of Product. Re: premium tier proposal.\n\nWe're floating a premium tier and first I want to know how much premium already exists: how many products already carry a three-digit price tag of 100 or more, and what the most expensive of them commands. If that shelf is crowded the tier is a rebrand; if it's thin, it's new ground.",
    ask: "Count of products priced at 100 or above, plus the highest price among them, in one row.",
    template: `SELECT {1}(*) AS premium_skus,
       ROUND({2}(price), 2) AS priciest
FROM products
WHERE price >= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf headcount",
        why: "How many products clear the bar is a row count — COUNT(*). MAX would report a price where the memo asks for a quantity, and SUM of prices describes nothing.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "What the most expensive premium SKU commands is the top of the qualifying prices — MAX. COUNT would answer the previous cell, and MIN would report the tier's entry point instead of its ceiling.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium bar",
        why: "Three-digit pricing starts at 100 inclusive — a product tagged exactly 100.00 is in the tier. The literal is the proposal's own definition.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "MIN", "AVG", "50", "150"],
    walkthrough:
      "The bar is inclusive — price >= 100 keeps products tagged at exactly 100.00 — and it keeps 4 of the 16: the headset, the desktop mic, the webcam and the smart watch. COUNT sizes that shelf at 4, MAX reports its ceiling at 199.99. The two cells answer different halves of the proposal: 4 SKUs says the premium shelf is thin — this is new ground, not a rebrand — while 199.99 says the ceiling already flirts with the tier's floor. Placement note: the bar lives in WHERE, so the aggregates only ever see qualifying products; move the line to 150 and the shelf collapses to a single SKU. The shelf's combined tags run 597.98 — but that's a different memo.",
  },
  {
    id: "cs-164",
    tier: "easy",
    topic: "l7",
    universe: "fraud",
    title: "The ticket range on file",
    brief:
      "From: Risk team, spot-check rotation.\n\nQuarterly filing: the smallest and largest single orders ever booked, in one line, so the review cap can be re-justified. If the biggest ticket on file sits under our manual-review threshold the policy holds; the smallest just shows how low the floor really goes.",
    ask: "The smallest order total and the largest order total on file, both to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS smallest_ticket,
       ROUND({2}(total), 2) AS biggest_ticket
FROM {3};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "Smallest ticket ever booked is the floor of the total column — MIN. MAX answers the other cell, and AVG would blur both extremes into the typical order.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "Biggest ticket on file is the ceiling of the total column — MAX. SUM would add every order together and print a number no single ticket ever reached.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Ticket values live in orders.total. products lists catalog tags and customers lists people — neither carries order totals, so both would error out.",
      },
    ],
    distractors: ["AVG", "SUM", "COUNT", "customers", "products"],
    walkthrough:
      "Two extremes, one pass: MIN(total) digs out the 25.47 floor — order 51, a cancelled one, which is its own small comfort — and MAX(total) caps the book at 1,088.44. Both ride in the same SELECT so the range is guaranteed to describe the same 103-order universe. The filing takeaway: the biggest ticket on file sits well under any manual-review threshold we'd plausibly set, so the cap holds for another quarter. Classic decoy to dodge: SUM prints 34,833.28 — real money, but it's the whole book rather than a ticket, and treating it as one would wildly overstate the risk.",
  },
  {
    id: "cs-165",
    tier: "easy",
    topic: "l7",
    universe: "inventory",
    title: "Pick lines at the cap, verified",
    brief:
      "From: Warehouse ops manager. Re: pick-line spot audit.\n\nSystem policy says no single pick line should ever move more than 3 units, so the audit pulls every line that maxes out at exactly that and counts them, with the cap restated as its own column so the exported sheet self-checks. If the count looks sane we keep the cap; a wall of maxed-out lines means the cap is doing all the constraining.",
    ask: "Count of pick lines that move exactly 3 units, plus the largest line quantity among them, in one row.",
    template: `SELECT {1}(*) AS maxed_lines,
       {2}(quantity) AS biggest_pick
FROM order_items
WHERE quantity = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line headcount",
        why: "How many lines hit the cap is a row count — COUNT(*). SUM would add the capped quantities together and report units moved, not lines logged.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the self-check aggregate",
        why: "The cap restated as a check column is the largest quantity among the filtered lines — MAX. COUNT would print the line count again and the self-check would say nothing.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the pick cap",
        why: "The audit targets lines at exactly the 3-unit cap — equality, not a range. The figure is the cap itself, and it reappears in the result as the self-check column.",
      },
    ],
    distractors: ["SUM", "1", "2", "4", "0"],
    walkthrough:
      "Equality is the whole trick here: quantity = 3 keeps only the lines that max out the cap, and the probe returns 89 such lines, with MAX(quantity) restating the 3 so the exported sheet can assert its own filter. Context for the audit: order_items holds 251 pick lines moving 498 units, an average of 1.98 per line — and 89 of those lines already sit at the cap, over a third, which reads as the cap doing real constraining work rather than sitting idle. Had we used SUM instead of COUNT the cell would report the 267 units those lines moved, not how many lines there are — a quietly different audit. If the question ever becomes 'lines at 2 or more', the predicate turns into a range.",
  },
];
