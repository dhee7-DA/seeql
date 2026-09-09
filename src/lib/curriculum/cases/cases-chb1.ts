// Case batch HB1 — hard wave B1, ids cs-280…cs-290 (deck expansion 200→300).
// Full-assembly scenarios: stacked WHERE gates, GROUP BY + HAVING with real
// kept/dropped splits, multi-key sorts, empty-set semantics, and a board-level
// capstone. Every figure probed live against the seed db; audited by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesCHb1: CaseStudy[] = [
  {
    id: "cs-280",
    tier: "hard",
    topic: "l3",
    universe: "catalog",
    title: "Two aisles, three restock candidates",
    brief:
      "From: Warehouse floor lead. Re: Friday restock walk.\n\nI get one picker for Friday and I want them on the two accessories-and-apparel aisles only. The shortlist rule: shelves carrying between 100 and 450 units — deep enough to be worth a top-up run, shallow enough that a top-up actually moves the needle — and the sock multipacks are out entirely, they're on the vendor program. Deepest stock first, top three candidates.",
    ask: "Name, category and stock of the three deepest-stock Accessories or Apparel products holding between 100 and 450 units, excluding anything with 'Socks' in the name, deepest first.",
    template: `SELECT name, category, stock
FROM {1}
WHERE category {2} ('Accessories', 'Apparel')
  AND stock {3} 100 AND 450
  AND name {4} LIKE '%Socks%'
ORDER BY stock {5}
LIMIT {6};`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Shelf names, categories and stock counts live in products. orders and order_items hold transactions with no stock column, so the walk sheet can't be built from them.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the aisle membership test",
        why: "Two allowed aisles is one membership test: category IN ('Accessories', 'Apparel'). Chaining two equalities with OR would work but reads worse; = against a two-value list is a row-value error.",
      },
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the stock band",
        why: "A band with two bounds is BETWEEN 100 AND 450 — bounds included. A bare > 100 would drag the 500-unit HDMI wall onto a shortlist that exists because those shelves need product.",
      },
      {
        answer: "NOT",
        kind: "keyword",
        label: "the vendor exclusion",
        why: "The sock multipacks are excluded by name, so the predicate is NOT LIKE '%Socks%'. Bare LIKE '%Socks%' would keep only the socks — the exact inverse of the rule.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Deepest first means descending stock. ASC would rank the thin shelves first and hand the picker the wrong three candidates.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the shortlist cut",
        why: "One picker, one morning: the walk list is capped at three candidates, so LIMIT 3 trims the sorted rows.",
        noVerify: true,
      },
    ],
    distractors: ["OR", "=", "<", "ASC", "OFFSET"],
    walkthrough:
      "Staged, the filter reads like a screening funnel. Stage one, the aisles: category IN ('Accessories', 'Apparel') keeps 5 of the 16 shelves — HDMI 500, Laptop Stand 180, Desk Mat 260, Running Socks 400, Cycling Jersey 110. Stage two, the band: stock BETWEEN 100 AND 450 drops the HDMI cable wall at 500 — that shelf is deep, not needy. Stage three, the vendor rule: NOT LIKE '%Socks%' removes the 400-unit sock multipack, which the band alone would have kept. Three rows survive, and ORDER BY stock DESC ranks them for the walk: Desk Mat Extended at 260, Laptop Stand Aluminum at 180, Cycling Jersey Pro at 110. The OR chip is the quiet killer — 'stock OR 100 AND 450' parses in SQLite as effectively always-true, so the HDMI wall sneaks back onto a shortlist built around needing product. Each condition earns its place: drop the band and the wall returns, drop the name rule and the socks do.",
  },
  {
    id: "cs-281",
    tier: "hard",
    topic: "l8",
    universe: "month-close",
    title: "Shipped revenue months that clear the bar",
    brief:
      "From: Financial Controller. Re: close binder, revenue quality tab.\n\nThe binder's revenue-quality tab needs months where dispatched business actually carried weight — not bookings, not pipeline: shipped orders only. Slice the shipped order book into calendar months, count the orders and sum the revenue per month, and keep only the months whose shipped revenue reached 1500. Rank them heaviest first so the tab opens on the strongest month.",
    ask: "Per calendar month, the shipped-order count and shipped revenue (2 decimals), keeping only months with shipped revenue of at least 1500, heaviest month first.",
    template: `SELECT strftime('%Y-%m', created_at) AS month,
       {1}(*) AS orders,
       ROUND({2}(total), 2) AS revenue
FROM orders
WHERE status = {3}
GROUP BY month
{4} SUM(total) >= {5}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the order counter",
        why: "The tab wants a per-month order tally beside the money, so COUNT(*) counts rows in each month bucket. SUM or AVG on '*' is a syntax error, not a count.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Month revenue is every shipped total added together — SUM(total). AVG would print a per-order mean where a month total belongs and every downstream tie-out breaks.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the stage filter",
        why: "The brief pins the slice to dispatched business: status = 'shipped', quotes included — the bare word reads as a column name and kills the query. 'pending' would answer a different memo entirely.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket gate",
        why: "The 1500 bar judges a per-month SUM, which only exists after grouping. WHERE runs before buckets exist and rejects aggregates outright — gating groups is exactly what HAVING is for.",
      },
      {
        answer: "1500",
        kind: "number",
        label: "the revenue bar",
        why: "The binder sets the month bar at 1500 in shipped revenue; months below it fall to the commentary section.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "AVG", "'pending'", "WHERE", "1000", "2000"],
    walkthrough:
      "This is the full pre-filter stack: WHERE screens rows, GROUP BY builds buckets, HAVING gates the buckets, ORDER BY ranks the survivors. WHERE status = 'shipped' keeps the 30 dispatched orders and — this is the point of the pre-filter — the gate below judges only shipped money. The month buckets hold 12 groups; HAVING SUM(total) >= 1500 drops nine of them. Three survive, ranked heaviest first: 2024-05 at 1953.82 on 4 orders, 2024-02 at 1663.06 on 4, and 2024-04 at 1599.92 on 4. The near-miss belongs in the commentary: 2024-08 shipped 1189.51 — a real month, just under the wire. Watch the two number decoys: at 1000 the tab fills with six months and the bar means nothing; at 2000 the tab empties entirely — no month ships 2000, and a blank tab in a close binder reads as a missing feed, not a quiet month. And note the gate sits on SUM, not the count: a four-order month at 700 fails this test, exactly as the brief intends.",
  },
  {
    id: "cs-282",
    tier: "hard",
    topic: "l7",
    universe: "refund-audit",
    title: "The refund ledger in four numbers",
    brief:
      "From: refunds@ internal ticket #4601.\n\nQuarter-end filing needs the cancellation book summarized in one row — the reviewer headcount question, the money question and the outlier question answered by a single query so nobody can quote mismatched cells. Four figures: how many cancelled orders, their combined value, the average refund, and the single largest cancellation. All statuses are already final; just the cancelled book.",
    ask: "One row: the count of cancelled orders, their total value, the average refund and the biggest single cancellation — money columns rounded to 2 decimals.",
    template: `SELECT {1}(*) AS tickets,
       ROUND({2}(total), 2) AS refund_value,
       ROUND({3}(total), 2) AS avg_refund,
       ROUND({4}(total), 2) AS biggest
FROM {5}
WHERE status = 'cancelled';`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue counter",
        why: "Tickets is a headcount of rows: COUNT(*). SUM would try to add the '*' and error; the other aggregates would put money where a number of refunds belongs.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "Combined refund value is every cancelled total added: SUM(total). MIN would file 25.47 — the smallest ticket — as the quarter's refund value.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "Average refund spreads the value across the tickets: AVG(total). Repeating SUM here would print 1152.49 as an 'average' and the staffing model would triple itself.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the outlier aggregate",
        why: "The biggest single cancellation is the ceiling of the column: MAX(total). MIN reports the floor — the 25.47 ticket — which is the least interesting refund on file.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Cancellation status and ticket value live on orders. order_items has neither a status nor a total column, so the WHERE clause fails before a row is read.",
      },
    ],
    distractors: ["MIN", "order_items", "customers", "HAVING", "WHERE"],
    walkthrough:
      "One pass, four cells, zero grouping — this is aggregates over a filtered slice, all sharing the same WHERE so the cells can never disagree. WHERE status = 'cancelled' screens the 103 orders down to 7, and the four aggregates each answer one filing question over those same rows: COUNT(*) sizes the queue at 7 tickets, SUM(total) totals the exposure at 1152.49, AVG(total) divides it out to 164.64 per refund, and MAX(total) flags the outlier at 397.99. The sanity check a reviewer actually runs: average times count should land near the total — 164.64 × 7 ≈ 1152.5, and it does, because all four cells saw identical rows. The MIN chip is the sneaky one: it executes everywhere and always returns 25.47, a perfectly plausible-looking number that is the wrong answer to three of the four questions — which is exactly why the filing asks for all four in one audited query.",
  },
  {
    id: "cs-283",
    tier: "hard",
    topic: "l5",
    universe: "pricing",
    title: "Ranking the sound-and-video shelf",
    brief:
      "From: Head of Product. Re: premium positioning one-pager.\n\nThe one-pager leads with a ranked ladder, not a list: across the Audio and Video shelves, I want the products priced above 50 shown most expensive first, capped at the top three so the page keeps its shape. If something good falls just below the cut, tell me — rank pressure is information too.",
    ask: "Name and price of the three most expensive Audio or Video products priced above 50, most expensive first.",
    template: `SELECT name, price
FROM {1}
WHERE category {2} ('Audio', 'Video')
  AND price > {3}
ORDER BY price {4}
LIMIT {5};`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "List prices live on products. orders books transactions and has no category or price column, so the ladder can't be built there.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the two-shelf test",
        why: "Two allowed shelves is one membership test: category IN ('Audio', 'Video'). NOT IN would return the complement — keyboards, socks, mats — the exact shelves the brief excluded.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the price floor",
        why: "The brief's floor is 'above 50', so the comparison is strict: price > 50. A product priced exactly 50.00 would sit outside the ladder.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Most expensive first is descending. ASC would build the ladder upside down and anchor the one-pager on the 59.99 speaker.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the page cap",
        why: "The page holds three rungs, so LIMIT 3 trims the ranked rows after the sort — LIMIT applies last, which is why the cut is a rank cut, not a price cut.",
        noVerify: true,
      },
    ],
    distractors: ["ASC", "120", "MAX", "SUM", "orders", "NOT IN"],
    walkthrough:
      "A ranked top-N is a pipeline, and the order of the stages is the whole lesson: WHERE screens, then ORDER BY ranks, then LIMIT cuts. The screen keeps five of the sixteen products — both shelves, priced above 50: the headset at 149.99, the webcam at 129, the desktop mic at 119, the speaker at 59.99; the ring light at 39.99 never enters. ORDER BY price DESC lines them up, and LIMIT 3 takes the first three rungs: Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119. The rank-pressure callout the brief asked for: the Bluetooth Speaker Mini misses the page at rank four — it cleared the 50 floor easily, it just lost the cap. That's why the threshold chip matters more than it looks: at 120 the mic drops off and the speaker is suddenly on the page — a one-decimal policy change reshuffles the story. And LIMIT cutting after the sort is what makes rung three genuinely the third most expensive, not any three rows.",
  },
  {
    id: "cs-284",
    tier: "hard",
    topic: "l5",
    universe: "inventory",
    title: "Thin-stock walk order",
    brief:
      "From: Inventory control. Re: Monday cycle-count route.\n\nThe counter gets one sheet and walks the floor aisle by aisle. Route rule: everything stocked under 120 units makes the sheet — the keyboard bin at exactly 120 stays off it, that's next cycle — listed aisle by aisle, and within an aisle deepest stock first so the fuller bins get counted while attention is fresh. Cap the printed sheet at five lines; the rest stays in the system notes.",
    ask: "Name, category and stock of products with stock below 120, ordered by category A-to-Z then deepest stock first, capped at 5 rows.",
    template: `SELECT name, category, stock
FROM {1}
WHERE stock < {2}
ORDER BY {3}, stock {4}
LIMIT {5};`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "the shelf table",
        why: "Bin depth is products.stock. order_items records quantities sold per line — it has no stock column, so the route sheet can't come from it.",
      },
      {
        answer: "120",
        kind: "number",
        label: "the thin-stock line",
        why: "Under 120 is strict: stock < 120. The keyboard bin sits exactly on 120 and stays off the sheet — that's the edge the count crew was told about.",
        noVerify: true,
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the aisle key",
        why: "The first sort key is the walk order: category groups the sheet so the counter finishes an aisle before moving on. Sorting by name shuffles the route; sorting by supplier_id walks it by vendor, which matches no floor layout.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the within-aisle direction",
        why: "Within each aisle, deepest first is stock DESC. ASC would start every aisle on its emptiest bin — the exact bins that need a re-order conversation, not a count.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the sheet cap",
        why: "The printed sheet holds five lines, so LIMIT 5 trims the sorted route after both sort keys have been applied.",
        noVerify: true,
      },
    ],
    distractors: ["order_items", "name", "supplier_id", "ASC", "100"],
    walkthrough:
      "Two sort keys, one cut — the multi-key sort is what turns a list into a route. WHERE stock < 120 screens 16 shelves down to 7 (the keyboard at exactly 120 misses the cut, which is the strict-vs-inclusive edge made physical). Then ORDER BY category, stock DESC does two jobs at once: category ASC clusters the sheet by aisle — Apparel, then Audio, then Electronics, then Video — and inside each aisle stock DESC puts the deeper bin first. The route prints as: Cycling Jersey Pro 110 (Apparel), Noise-Canceling Headset 60 and Studio Desktop Mic 45 (Audio), USB-C Hub 85 (Electronics), 4K Webcam 70 (Video). LIMIT 5 stops the print there; the Fitness Band at 95 and Smart Watch at 40 stay in system notes, both Wearables — one aisle, skipped whole, which is exactly how a cap should behave on a routed sheet. The 'name' decoy executes cleanly and produces a 4K-Webcam-first scramble that visits the video aisle twice — sorted, and useless as a route.",
  },
  {
    id: "cs-285",
    tier: "hard",
    topic: "l8",
    universe: "funnel",
    title: "Stages with a broad buyer base",
    brief:
      "From: Growth marketing lead. Re: funnel health slide.\n\nVolume per stage flatters us — one account can pad a stage with repeat orders. For the health slide I want breadth instead: per fulfillment stage, how many distinct accounts have ever reached it, next to raw order volume. Keep only the stages where at least 5 different accounts have transacted, widest base first. The narrow stages go in the risk paragraph, not the chart.",
    ask: "Per order status, the number of distinct customer accounts and the total order count, keeping only stages with 5 or more distinct buyers, widest base first.",
    template: `SELECT status,
       {1}(DISTINCT {2}) AS buyers,
       COUNT(*) AS orders
FROM orders
{3} BY status
{4} COUNT(DISTINCT customer_id) >= {5}
ORDER BY buyers {6};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "Distinct accounts is COUNT(DISTINCT customer_id) — dedupe inside the count. Bare SUM(DISTINCT ...) would add account numbers together and print a sum with no meaning.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the deduped column",
        why: "Accounts are customer_id. COUNT(DISTINCT total) would dedupe order amounts — every total is unique, so it just counts orders again and the breadth story silently dies.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the stage buckets",
        why: "Per-stage numbers need GROUP BY status — it folds 103 orders into four stage buckets so both counters compute per stage.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the breadth gate",
        why: "The five-account bar judges a per-bucket COUNT(DISTINCT ...), which doesn't exist until after grouping. WHERE can't see aggregates — HAVING is the clause that gates buckets.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the breadth bar",
        why: "The slide keeps stages reached by at least 5 distinct accounts; narrower stages are noise on a breadth chart.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Widest base first is descending on the buyer count. ASC would open the chart on the thinnest stage — the one the brief sends to the risk paragraph.",
      },
    ],
    distractors: ["SUM", "total", "status", "WHERE", "3", "ASC"],
    walkthrough:
      "Breadth versus volume is one query wearing two counters. GROUP BY status builds four buckets; inside each, COUNT(DISTINCT customer_id) counts accounts once no matter how many orders they placed, while COUNT(*) keeps the raw volume for contrast. The gate then judges breadth, not volume: HAVING COUNT(DISTINCT customer_id) >= 5 drops the cancelled stage, whose 7 orders came from just 4 accounts. Three stages make the chart, widest first: delivered with 15 distinct buyers behind 52 orders, shipped with 10 buyers behind 30 orders, pending with 8 buyers behind 14. Read the ratio and the funnel's shape appears — delivered's 15-in-52 is a broad, healthy base; pending's 8-in-14 is twice as concentrated, which is what the risk paragraph is for. The 'total' decoy is the dangerous one: COUNT(DISTINCT total) runs clean and prints 52, 30, 14 — the volume column wearing a breadth costume, because no two order totals repeat. And at bar 3, cancelled sneaks back onto a chart the brief explicitly banished.",
  },
  {
    id: "cs-286",
    tier: "hard",
    topic: "l8",
    universe: "supplier",
    title: "Partners pricing below the floor",
    brief:
      "From: Supply-chain lead. Re: Q4 cost review.\n\nBefore we open the Q4 cost conversations I need the exposure list: which partners put their cheapest SKU under 30 — those are the relationships where a price hike lands on our entry-level shelf first. Per partner, show the cheapest SKU price and how many SKUs they carry with us, keep only the partners whose floor is genuinely below 30, cheapest floor first. If a partner misses the cut by a dollar or two, I want their name in the notes.",
    ask: "Per supplier, the cheapest product price and SKU count, keeping only suppliers whose floor price is under 30, cheapest floor first.",
    template: `SELECT supplier_id,
       {1}(price) AS floor_price,
       {2}(*) AS skus
FROM products
{3} BY supplier_id
{4} MIN(price) < {5}
ORDER BY floor_price;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "Cheapest SKU is the column's minimum: MIN(price). MAX would flatter every partner with their flagship price and the exposure list would be fiction.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the range counter",
        why: "SKUs carried is a row count per partner: COUNT(*). SUM(*) is a syntax error, and SUM(price) would answer with money where a catalogue depth belongs.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the partner buckets",
        why: "Per-partner figures need GROUP BY supplier_id — 16 products fold into six partner buckets so floor and depth compute per relationship.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the floor gate",
        why: "The under-30 rule tests a per-partner MIN, which only exists after grouping. WHERE filters rows pre-bucket and rejects aggregates — the gate must be HAVING.",
      },
      {
        answer: "30",
        kind: "number",
        label: "the floor line",
        why: "The review targets floors genuinely below 30 — strictly under, so a partner bottoming out at exactly 30.00 stays off the exposure list.",
        noVerify: true,
      },
    ],
    distractors: ["MAX", "SUM", "WHERE", "ORDER", "60", "10"],
    walkthrough:
      "Exposure per partner is a bucket-and-gate: GROUP BY supplier_id builds six buckets, MIN(price) reads each partner's floor, COUNT(*) notes how deep the relationship runs, and HAVING keeps the buckets whose floor is genuinely under 30. Three partners make the list, cheapest exposure first: supplier 3 at 14.99 across 3 SKUs, supplier 2 at 18.5 across 3, supplier 5 at 24.99 across 2. The near-miss the brief asked for: supplier 4 bottoms out at 32 — two dollars above the line, and the 60 decoy would have dragged them onto a list their pricing doesn't earn (at 60, five of six partners 'qualify', which is a list of everyone). Supplier 1 at 89.99 and supplier 6 at 59.99 aren't cost-review conversations at all. Note the gate lives on the aggregate, in HAVING — swap in WHERE and the query dies with a misuse-of-aggregate error before a bucket forms. And MAX as the floor chip is the quiet poison: it still runs, prints every partner's flagship price as their 'floor', and the review opens by insulting the healthiest relationship on the roster.",
  },
  {
    id: "cs-287",
    tier: "hard",
    topic: "l7",
    universe: "expense",
    title: "The three heaviest spend months",
    brief:
      "From: Ops finance. Re: spend-control pack.\n\nThe spend-control pack opens on the three heaviest months in the expense ledger, so the committee sees the spikes before the line items. The ledger books cents, and the committee reads currency — so bucket every expense line by the month it was booked, add the cents up, convert to currency units in the same breath, and rank the months heaviest first, capped at three. Everything else belongs in the appendix.",
    ask: "Per calendar month of the expense ledger, total spend converted from cents to currency (2 decimals), ranked heaviest first, top 3 months only.",
    template: `SELECT strftime({1}, spent_on) AS month,
       ROUND({2}(amount_cents) / 100.0, 2) AS spend
FROM {3}
GROUP BY month
ORDER BY spend {4}
LIMIT {5};`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "The bucket is the booking month: strftime('%Y-%m', spent_on) renders each date as a Year-Month label. '%Y' alone collapses 14 months into 2 years and the spike story evaporates.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the spend aggregate",
        why: "A month's spend is every line's cents added: SUM(amount_cents). COUNT would print 0.03 — three lines divided by a hundred — as if that were money.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the ledger table",
        why: "Company spend lives in expenses with its amount_cents and spent_on columns. orders has neither — pointing the read there fails before any bucket forms.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Heaviest first is descending on the converted spend. ASC would open the pack on a quiet month and the committee fixes the wrong problem.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the pack cap",
        why: "The pack opens on three months, so LIMIT 3 trims the ranked buckets — the cut applies after the sort, so it keeps the genuinely heaviest three.",
        noVerify: true,
      },
    ],
    distractors: ["'%Y'", "COUNT", "MIN", "orders", "ASC", "10"],
    walkthrough:
      "Two conversions happen in one line, and both are the lesson. First the bucket: spent_on is a date stamp, so strftime('%Y-%m', spent_on) slices every line into a Year-Month label and GROUP BY month folds 36 lines into 14 buckets. Second the unit: the ledger stores cents, so SUM(amount_cents) / 100.0 — the .0 forcing decimal division — converts in the same expression, wrapped in ROUND(..., 2) so the pack prints clean currency. Ranked heaviest first and capped at three: 2024-08 at 3210, 2024-11 at 1974, 2025-01 at 1959 — August is the spike the committee will ask about, nearly two grand clear of the runner-up. The '%Y' decoy doesn't error, which is what makes it nasty: it re-buckets everything into two years (21807 and 3609) and the 'top three months' becomes a two-row table of years. The COUNT decoy is worse — it runs, prints 0.03 per month, and a careless paste puts three-hundredths of a currency unit into a spend-control pack. Unit discipline and bucket discipline, one query each.",
  },
  {
    id: "cs-288",
    tier: "hard",
    topic: "l7",
    universe: "growth",
    title: "The stretch-pipeline slide",
    brief:
      "From: Chief of Staff. Re: board deck, stretch-pipeline slide.\n\nThe board deck has a stretch-pipeline slide built on a what-if: account 12 was pitched a 900-plus expansion, and the slide must show today's reality — how many of their orders clear 900, and what that slice of pipeline is worth. Run the two cells exactly as engineered and paste what the engine prints, verbatim. If a cell looks 'wrong' to your eye, it goes in anyway — the deck quotes the engine, not our intuition about what an empty answer should look like.",
    ask: "Two cells: the count of account 12's orders above 900, and the summed total of those orders (unrounded, exactly as the engine prints it).",
    template: `SELECT {1}(*) AS flagged,
       {2}(total) AS exposure
FROM {3}
WHERE customer_id = {4}
  AND total > {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the deal counter",
        why: "How many orders clear the line is a row count: COUNT(*). SUM can't take '*' — and in a two-cell slide, an error in one cell blanks the whole slide.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregate",
        why: "Pipeline worth is the totals added: SUM(total). COUNT(total) would print 0 — a count, not a value — and the slide would claim the expansion is worth nothing.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the transactions table",
        why: "Per-account order totals live on orders. customers has no total column at all, so the WHERE clause errors before a row is screened.",
      },
      {
        answer: "12",
        kind: "number",
        label: "the pitched account",
        why: "The what-if is pinned to account 12 — the account that was pitched, not whoever happens to hold the biggest ticket.",
        noVerify: true,
      },
      {
        answer: "900",
        kind: "number",
        label: "the expansion line",
        why: "The pitched expansion starts above 900, so the comparison is strict: total > 900. Orders at exactly 900.00 wouldn't be part of the story.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "customers", "6", "LIMIT", "HAVING"],
    walkthrough:
      "Run the staging honestly and the slide writes itself. WHERE customer_id = 12 screens all 103 orders down to one — account 12 placed a single order, a shipped ticket at 705.39 — and the second predicate, total > 900, removes it. The set feeding the aggregates is empty, and that's where the teach lives: COUNT(*) counts rows and prints 0, but SUM(total) has nothing to add and returns NULL — not zero, NULL — because 'the sum of nothing' and 'zero' are different answers. The slide therefore reads: flagged 0, exposure NULL. Quote it verbatim; a hand-typed 0 in the exposure cell would tell the board the account's big deals sum to nothing, when the truth is the account has no qualifying deals at all. The '6' decoy shows why the account pin matters: account 6 does have a 900-plus order (1088.44), so swapping the account fills the slide with someone else's whale. Empty-set discipline: COUNT goes to zero, SUM goes to NULL, and the difference is the message.",
  },
  {
    id: "cs-289",
    tier: "hard",
    topic: "l4",
    universe: "fraud",
    title: "Value outside the chain of custody",
    brief:
      "From: Risk team, spot-check rotation.\n\nOur custody rule is simple: the moment an order leaves the building, the warehouse stamps shipped_at. Orders without that stamp have value that no dispatch record explains — that's where the spot-check starts. For each fulfillment stage, I want two counts side by side: every order in the stage, and every order in the stage that actually carries a dispatch stamp. Rank by volume so the biggest stages lead.",
    ask: "Per order status, the total order count and the count of orders with a dispatch stamp (COUNT of shipped_at), ranked by order count descending.",
    template: `SELECT status,
       {1}(*) AS n,
       COUNT({2}) AS stamped
FROM {3}
{4} BY status
ORDER BY n {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "Every order in the stage is COUNT(*) — rows, no argument nuance. SUM or MAX can't take '*' and error out before the audit starts.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the stamped column",
        why: "The stamp counter is COUNT(shipped_at): it skips NULLs, so it counts only real dispatch stamps. COUNT(total) would count money and print the stage's full volume as its 'stamped' figure — the fraud signal erased.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ledger table",
        why: "Status and the dispatch stamp both live on orders. There is no shipments table to point at — the custody gap is measured in the order ledger itself.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the stage buckets",
        why: "Side-by-side counts per stage need GROUP BY status — 103 orders fold into four buckets so both counters compute per stage.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Biggest stages lead: ORDER BY n DESC. ASC would open the review on the smallest bucket and bury the 52-order stage at the bottom.",
      },
    ],
    distractors: ["SUM", "MAX", "total", "status", "WHERE", "ASC"],
    walkthrough:
      "The data-quality trick that powers this audit: COUNT(*) and COUNT(column) disagree exactly where the column is NULL. GROUP BY status builds four stage buckets; COUNT(*) counts every order in the bucket, COUNT(shipped_at) counts only orders where the stamp exists, and the gap between the two columns is the custody gap. Ranked by volume: delivered 52 of 52 stamped, shipped 30 of 30 — the clean chain, 82 orders accounted for. Then the finding: pending 14 orders, 0 stamps; cancelled 7 orders, 0 stamps. Twenty-one orders — a fifth of the book — carry no dispatch record, which reconciles exactly with the 21 NULL shipped_at values on file: the stamp is only ever applied when a parcel leaves, so pending and cancelled are structurally unstamped rather than suspicious. That distinction is the spot-check's first conclusion: the gap is a process state, not (yet) theft. The 'total' decoy is the one that would have buried it — COUNT(total) counts money values, money is never NULL, and both columns would have agreed everywhere, printing a clean bill of health over a live question.",
  },
  {
    id: "cs-290",
    tier: "hard",
    topic: "cap",
    universe: "catalog",
    title: "Premium depth on the board's page",
    brief:
      "From: Chief of Staff. Re: board pre-read, catalog page.\n\nThe catalog page of the pre-read needs one disciplined table: per category, the SKU count, the average list price to 2 decimals, and total units on hand. Then the editorial rule, which is two gates at once — keep only categories whose average price is genuinely above 50 (the premium story) AND whose total stock is under 520 units (the scarcity story). Rank what survives by average price, richest first. The dropped categories get a footnote, not a row.",
    ask: "Per category: SKU count, average price (2 decimals) and total stock units — keeping only categories with average price above 50 and total stock below 520, ranked by average price descending.",
    template: `SELECT category,
       {1}(*) AS skus,
       ROUND({2}(price), 2) AS avg_price,
       {3}(stock) AS units
FROM products
{4} BY category
{5} AVG(price) > 50 AND SUM(stock) < 520
ORDER BY avg_price {6};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the depth counter",
        why: "SKUs per category is a row count: COUNT(*). SUM can't take '*' — and the table needs the count column before the money column.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the premium metric",
        why: "Average list price is AVG(price) inside the rounding — the exact quantity the first gate tests. MAX would quote flagship prices as averages and flatter every shelf past the gate.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the depth total",
        why: "Units on hand adds stock across the shelf: SUM(stock). AVG(stock) would print a per-bin mean where a carrying total belongs, and the scarcity gate would judge the wrong number.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the shelf buckets",
        why: "One row per category needs GROUP BY category — 16 products fold into 7 shelves so all three aggregates compute per shelf.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the double gate",
        why: "Both editorial rules judge per-shelf aggregates — an average and a sum — which don't exist until after grouping. WHERE rejects aggregates outright; the compound gate belongs in HAVING, joined with AND so a shelf must clear both.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Richest first is descending on average price. ASC would open the board's page on the cheapest surviving shelf and read as a discount story.",
      },
    ],
    distractors: ["MAX", "MIN", "WHERE", "ORDER", "ASC"],
    walkthrough:
      "This is the capstone shape: three aggregates, one bucket key, a compound gate, a ranked page. GROUP BY category folds 16 products into 7 shelves; COUNT(*), AVG(price) and SUM(stock) each answer one column of the board's table over the same buckets. The gate is where the case earns its keep: HAVING AVG(price) > 50 AND SUM(stock) < 520 is two tests on bucket-level numbers, and AND means a shelf must clear both — premium AND scarce. Four shelves survive, ranked richest first: Wearables at 139.50 (135 units, genuinely scarce), Audio at 109.66 (315), Video at 84.50 (220), Electronics at 57.83 (505 — premium enough, but barely under the stock ceiling). The footnote list is just as instructive: Accessories fails both gates at once (27.49 average, 940 units — cheap and deep), Apparel averages 41.75 and misses premium by eight units of price, Fitness misses on both at 32 and 220. Watch the gate placement: both tests cite aggregates, so either one moved to WHERE kills the query — and ORDER ahead of HAVING is a syntax error, because the gate must trim buckets before the page is ranked.",
  },
];
