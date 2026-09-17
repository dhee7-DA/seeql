// Case wave w3 — Module 5 ranking windows (lesson 31), cs-1279…cs-1316.
// 38 cases: 12 easy / 13 medium / 13 hard, all topic "w3" (ROW_NUMBER vs RANK
// vs DENSE_RANK, PARTITION BY, ORDER BY inside OVER, tie policies, NTILE,
// top-N-per-group). Every figure traces to committed probe receipts:
// scripts/m5-facts-r3.out, scripts/m5-facts-c3.out, the engine-verified header
// block of src/lib/curriculum/drills/m5/window-rank.ts, and this wave's own
// probe scripts/m5-facts-w3.ts (re-runnable: bun scripts/m5-facts-w3.ts).
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW3: CaseStudy[] = [
  // ============================== EASY ==============================
  {
    id: "cs-1279",
    tier: "easy",
    topic: "w3",
    universe: "supplier",
    title: "The bottom of the rating league",
    brief:
      "From: Procurement lead. Re: the review shortlist.\n\nBefore we renew contracts we rank every supplier by rating — but this quarter's shortlist is the OTHER end: the weakest two, for improvement plans. The draft query lost its sort direction and its cutoff in a refactor. Rebuild it so rank 1 is the lowest rating and exactly two suppliers come back.",
    ask: "One query: the two lowest-rated suppliers, ranked from the bottom, with their figures.",
    template:
      "SELECT name, rating, RANK() OVER (ORDER BY {3} {1}) AS rk\nFROM suppliers\nORDER BY rk\nLIMIT {2};",
    slots: [
      { answer: "ASC", kind: "keyword", label: "the league direction",
        why: "Improvement plans target the weakest, so the window's ORDER BY must climb: ASC makes rating 3.9 rank 1. DESC would crown Alpine Audio GmbH 4.8 — the best supplier, the wrong memo. Probed league: 4.8, 4.6, 4.4, 4.1, 4.0, 3.9 with zero ties." },
      { answer: "2", kind: "number", label: "the shortlist cutoff",
        why: "LIMIT 2 keeps exactly the review pair. Probed bottom-two: Pacific Textiles 3.9 at rk 1, Shenzhen Electro 4.1 at rk 2 — the two figures the procurement memo names." },
      { answer: "rating", kind: "keyword", label: "the league's sort column",
        why: "The league is sorted by rating — the column the memo's figures come from. ORDER BY name would rank the alphabet (Alpine 4.8, our best supplier, would sit at rank 1 of a bottom-hunt) and ORDER BY region would rank APAC/EU/LATAM/US blocks — either way the weak ratings never surface." },
    ],
    distractors: ["DESC", "3", "name", "region"],
    walkthrough:
      "Ranking windows keep every row and add a position, so the whole move is three chips. ORDER BY rating ASC inside OVER ranks the six suppliers from weakest up — Pacific Textiles 3.9 takes rk 1, Shenzhen Electro 4.1 rk 2, and the six ratings are all distinct so RANK has no ties to fight. ORDER BY rk outside is presentation; LIMIT 2 trims the league to the review pair. Flip to DESC and the query still runs, but it nominates Alpine Audio GmbH 4.8 — the supplier we should NOT be auditing. LIMIT 6 would file the whole league; LIMIT 3 drags Midwest Hardware Co 4.4 into a review it didn't earn. And sorting the window by name or region hides the ratings entirely — the league would run, but rank 1 would be whoever sorts first, not whoever rates worst.",
  },
  {
    id: "cs-1280",
    tier: "easy",
    topic: "w3",
    universe: "refund-audit",
    title: "The pending pile, biggest first",
    brief:
      "From: Support lead. Re: the review queue.\n\nFourteen orders are still pending and finance only manually reviews the two biggest exposures each morning. The queue query lost its direction and its cutoff — and someone's status filter fell off entirely. Put it back together: pending only, biggest total first, top two.",
    ask: "One query: the two largest pending orders, ranked, with ids and totals.",
    template:
      "SELECT id, total, RANK() OVER (ORDER BY total {1}) AS rk\nFROM orders\nWHERE status = {2}\nORDER BY rk\nLIMIT {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the exposure direction",
        why: "Biggest exposure first means the window sorts totals descending. Probed pending league: order 74 at 1088.44 takes rk 1, order 43 at 945.21 rk 2 — ASC would open the queue with order 12 at 148.28, the smallest exposure." },
      { answer: "'pending'", kind: "keyword", label: "the status filter",
        why: "WHERE status = 'pending' ranks only the 14 open tickets. Probed: the top-2 pending are 1088.44 and 945.21. Drop the filter and delivered's 52 rows flood the review — 'shipped' instead leads with order 39 at 845.92, a different pile." },
      { answer: "2", kind: "number", label: "the review cutoff",
        why: "LIMIT 2 keeps the two exposures finance reviews. Probed: rk 1 and rk 2 land on 1088.44 and 945.21 — exactly the pair the morning memo quotes." },
    ],
    distractors: ["ASC", "'shipped'", "4"],
    walkthrough:
      "The WHERE runs first and cuts the crowd to the 14 pending rows; only then does RANK() OVER (ORDER BY total DESC) line them up — order 74 at 1088.44 rk 1, order 43 at 945.21 rk 2. ORDER BY rk presents the queue, LIMIT 2 trims it to the reviewed pair. Widen to LIMIT 4 and orders 5 (725.34) and 97 (585.79) enter a review nobody asked for. Sort ASC and the 'queue' opens with the smallest ticket, 148.28 — a correct query answering the wrong risk question. Filter 'shipped' instead and the top of the list reads 845.92, which is a warehouse problem, not a support one.",
  },
  {
    id: "cs-1281",
    tier: "easy",
    topic: "w3",
    universe: "catalog",
    title: "The premium shelf, top five",
    brief:
      "From: Merchandising lead. Re: the hero-products rail.\n\nThe storefront's premium rail needs the five priciest products, numbered. Prices never tie in this catalog, so ROW_NUMBER's guaranteed 1..5 is exactly the contract. The draft lost its direction and its row cap. Rebuild the rail.",
    ask: "One query: the five most expensive products, numbered 1–5 by price.",
    template:
      "SELECT name, price, ROW_NUMBER() OVER (ORDER BY {3} {1}) AS rn\nFROM products\nORDER BY rn\nLIMIT {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the premium direction",
        why: "Priciest first sorts the window descending. Probed ladder: Smart Watch S 199.99 rn 1, Noise-Canceling Headset 149.99 rn 2 — ASC would open the rail with HDMI 2.1 Cable 2m at 14.99, the bargain bin." },
      { answer: "5", kind: "number", label: "the rail length",
        why: "LIMIT 5 keeps the five hero rows. Probed rn 1–5: 199.99, 149.99, 129, 119, 89.99 — the exact five figures merchandising quoted for the rail." },
      { answer: "price", kind: "keyword", label: "the rail's sort column",
        why: "The rail is priced: ORDER BY price ranks the catalog by cost — the whole point of a premium shelf. ORDER BY stock would rank warehouse depth instead: probed, HDMI's 500 units would top the rail regardless of its 14.99 price tag." },
    ],
    distractors: ["ASC", "3", "10", "stock"],
    walkthrough:
      "ROW_NUMBER() OVER (ORDER BY price DESC) deals a guaranteed 1..16 across the 16 products — no ties exist in this catalog, so the numbering is fully deterministic. The rail needs the head of that deal: ORDER BY rn presents it, LIMIT 5 trims to Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119, Mechanical Keyboard K1 89.99. Shorten to LIMIT 3 and the keyboard drops off a rail the deck already promised. Flip the direction and the 'premium' rail leads with a 14.99 cable — and sort the window by stock instead of price and the rail measures the warehouse, not the shelf tag: the sort column is what the ranking means.",
  },
  {
    id: "cs-1282",
    tier: "easy",
    topic: "w3",
    universe: "funnel",
    title: "Three campaign waves from sixteen accounts",
    brief:
      "From: Lifecycle marketing. Re: the win-back waves.\n\nWe're splitting the sixteen accounts into three outreach waves by lifetime spend — NTILE deals the crowd into equal-ish buckets, biggest spenders in wave 1. Assert the deal: wave 1's headcount and its top spend. The draft query lost its NTILE direction and its wave filter.",
    ask: "One query: wave 1's crew size and top spend when the 16 accounts are dealt into 3 waves by spend.",
    template:
      "WITH league AS (SELECT c.name, ROUND(SUM(o.total),2) AS spend,\n       NTILE(3) OVER (ORDER BY SUM(o.total) {1}) AS wave\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id)\nSELECT wave, {2}(*) AS crew, ROUND(MAX(spend),2) AS top_spend\nFROM league WHERE wave = {3} GROUP BY wave;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the dealing direction",
        why: "Wave 1 must be the big spenders, so the window sorts the league descending before NTILE deals. Probed: DESC wave 1 tops out at 7262.35 (Alice Chen); ASC would deal the six cheapest accounts into wave 1, topping out at 829.09." },
      { answer: "COUNT", kind: "keyword", label: "the headcount reader",
        why: "COUNT(*) folds the wave's rows into its crew size. Probed census: NTILE(3) over 16 deals 6/5/5, so wave 1 reads crew 6. SUM(*) or MAX(*) cannot count rows — the engine refuses them." },
      { answer: "1", kind: "number", label: "the asserted wave",
        why: "WHERE wave = 1 pins the flagship bucket. Probed wave 1: six accounts — Alice, Emma, Grace, Maya, Chloe, Pedro — with top spend 7262.35, the figures the campaign brief quotes." },
    ],
    distractors: ["ASC", "SUM", "2"],
    walkthrough:
      "NTILE(3) is a dealer, not a ranker: sort the 16 spends, then deal them into three buckets as evenly as 16 allows — 6/5/5, the remainder going to the front tiles. With ORDER BY SUM(o.total) DESC the first six dealt are Alice 7262.35 through Pedro 1686.17, so wave = 1 holds crew 6 and top spend 7262.35. Wave 2 would read crew 5 topped by Farid at 1458.97; wave 3 crew 5 topped by Noah at 737.68 — which is exactly why pinning wave = 1 matters. Deal ascending and wave 1 becomes the six cheapest accounts, topping out at 829.09: same query shape, opposite campaign.",
  },
  {
    id: "cs-1283",
    tier: "easy",
    topic: "w3",
    universe: "month-close",
    title: "The closing league, podium only",
    brief:
      "From: Controller. Re: the close deck's opener.\n\nThe close deck opens on the three biggest revenue months. Rank the fourteen month buckets by spend and keep the podium. The draft lost its direction and its cutoff during the template refactor.",
    ask: "One query: the top three months by total spend, ranked, with their figures.",
    template:
      "SELECT {3}('%Y-%m', created_at) AS mon, ROUND(SUM(total),2) AS spend,\n       RANK() OVER (ORDER BY SUM(total) {1}) AS rk\nFROM orders\nGROUP BY mon\nORDER BY rk\nLIMIT {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the podium direction",
        why: "Biggest months first sorts the window descending. Probed league: 2024-01 at 3731.97 takes rk 1, 2024-02 at 3609.64 rk 2 — ASC would 'podium' 2024-07 at 1193.86, the quietest month on the books." },
      { answer: "3", kind: "number", label: "the podium size",
        why: "LIMIT 3 keeps exactly the medal rows. Probed rk 1–3: 3731.97, 3609.64, 3116.04 (2024-01, 2024-02, 2024-09) — the three figures the deck leads with." },
      { answer: "strftime", kind: "keyword", label: "the bucket slicer",
        why: "strftime('%Y-%m', created_at) slices 103 orders into 14 chronological month buckets — the key the league folds on. date() treats a format string as a modifier and returns NULL, and substr with swapped args doesn't slice dates: either way every bucket collapses to one grain-less row and the podium measures the wrong thing." },
    ],
    distractors: ["ASC", "5", "1", "substr", "date"],
    walkthrough:
      "Windows ride on top of aggregates: strftime('%Y-%m', created_at) slices the 103 orders into 14 month buckets, GROUP BY mon folds them, and RANK() OVER (ORDER BY SUM(total) DESC) stamps each bucket with its place in the spend league — the window sees the folded sums, not the raw rows. ORDER BY rk presents the league, LIMIT 3 keeps the podium: 2024-01 3731.97, 2024-02 3609.64, 2024-09 3116.04. Month spends are all distinct so no tie policy is needed. LIMIT 5 would drag 2024-10 (2975.67) onto a three-step podium; ASC would crown 2024-07's 1193.86 — the month the CFO wants to forget, not open with. And the slicer is load-bearing: a bucket key that yields NULL or one merged blob gives the deck a single all-time row where fourteen monthly buckets belong.",
  },
  {
    id: "cs-1284",
    tier: "easy",
    topic: "w3",
    universe: "expense",
    title: "The bill stack, by category",
    brief:
      "From: Finance partner. Re: the spend report.\n\nThe spend report ranks the four expense categories by total billed, biggest first, dollars not cents. The draft query lost its fold key, its aggregator and its direction all at once. Rebuild the league.",
    ask: "One query: the four expense categories ranked by total spend in dollars.",
    template:
      "SELECT category, {3}(amount_cents) / 100.0 AS spend,\n       RANK() OVER (ORDER BY SUM(amount_cents) {1}) AS rk\nFROM expenses\nGROUP BY {2}\nORDER BY rk;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the report direction",
        why: "Biggest bill first sorts the window descending. Probed league: Rent 16800 rk 1, Ads 4570 rk 2, Travel 2521 rk 3, Tools 1525 rk 4 — ASC would hand rank 1 to Tools, the smallest line." },
      { answer: "category", kind: "keyword", label: "the fold key",
        why: "GROUP BY category folds 36 expense rows into the four buckets the report names — Rent, Ads, Travel, Tools, one vendor each. GROUP BY spent_on would fold to single-day buckets instead: probed, all 36 bills sit on distinct dates, so the league granulates into 36 rows and the category view disappears." },
      { answer: "SUM", kind: "keyword", label: "the bill aggregator",
        why: "SUM(amount_cents) totals each bucket — Rent reads 16800 after the /100.0 dollar conversion. COUNT would print row counts (14, 14, 3, 5) where dollar figures belong." },
    ],
    distractors: ["ASC", "spent_on", "COUNT"],
    walkthrough:
      "Two folds in one query: GROUP BY category collapses the 36 expenses into four buckets, and the window ranks those folded sums — RANK() OVER (ORDER BY SUM(amount_cents) DESC) sees 16800, 4570, 2521, 1525 and deals ranks 1–4 with no ties. The SELECT's SUM divided by 100.0 renders the same figures in dollars for the report. Fold by spent_on and the league granulates into 36 single-day buckets — a daily ledger where the four-line category view should be. COUNT in the money slot prints 14 where 16800 belongs; ASC flips the report so Tools 1525 'leads'. The league is four rows, and every chip protects one of them.",
  },
  {
    id: "cs-1285",
    tier: "easy",
    topic: "w3",
    universe: "fraud",
    title: "The name-length tier list",
    brief:
      "From: Risk analyst. Re: the dedupe probe.\n\nBefore a fuzzy-match pass we eyeball the extreme name lengths — the longest three accounts, longest first. Rank customers by name length and keep the top three. The draft lost its direction and its cutoff.",
    ask: "One query: the three longest customer names, ranked by character count.",
    template:
      "SELECT name, {3}(name) AS chars, RANK() OVER (ORDER BY LENGTH(name) {1}) AS rk\nFROM customers\nORDER BY rk, name\nLIMIT {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the length direction",
        why: "Longest first sorts the window descending. Probed ladder: Isabella Rossi at 14 chars takes rk 1 — ASC would rank Grace Kim's 9 characters first, the shortest name in the book." },
      { answer: "3", kind: "number", noVerify: true, label: "the probe size",
        why: "LIMIT 3 keeps the three-row probe. Probed head: Isabella Rossi 14 at rk 1, then Dmitri Volkov and Pedro Alvarez both 13 — the tie the fuzzy-match pass cares about is already visible in row three." },
      { answer: "LENGTH", kind: "keyword", label: "the measuring function",
        why: "LENGTH(name) turns each name into its character count — both the ranked metric and the displayed census. UPPER(name) would print the shouted text where the counts belong: the chars column would read 'ISABELLA ROSSI' instead of 14, same rows, unreadable census." },
    ],
    distractors: ["ASC", "2", "5", "UPPER"],
    walkthrough:
      "LENGTH(name) measures each of the 16 names, and RANK() OVER (ORDER BY LENGTH(name) DESC) ranks the measurements. The probed ladder: Isabella Rossi 14 alone at rk 1; Dmitri Volkov and Pedro Alvarez tie at 13 and share rk 2 — that's RANK's tie policy showing itself in a three-row probe, two rows at rk 2 and no rk 3. LIMIT 3 is exactly enough to surface the tie; LIMIT 2 would hide Pedro and the duplicate rank. ASC would invert the probe into a shortest-name list led by Grace Kim's 9. And the measurer matters: swap LENGTH for UPPER and the census column prints names where numbers belong — the tie block would still rank the same underneath, but the report would no longer say what it measures. The tie block's next row sits at rk 4 — the gap RANK leaves is the tell that two people share second place.",
  },
  {
    id: "cs-1286",
    tier: "easy",
    topic: "w3",
    universe: "growth",
    title: "Four region podiums at once",
    brief:
      "From: Growth lead. Re: the regional board view.\n\nThe board wants each region's top spender flagged in one query — a leaderboard that restarts per region, not one global race. The draft lost its partition key, its aggregator and its direction. Rebuild the four-podium view.",
    ask: "One query: every customer's rank inside their own region, by lifetime spend.",
    template:
      "SELECT c.region, c.name, ROUND(SUM(o.total),2) AS spend,\n       RANK() OVER (PARTITION BY {1} ORDER BY {2}(o.total) {3}) AS rk\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id;",
    slots: [
      { answer: "region", kind: "keyword", label: "the restart key",
        why: "PARTITION BY region slices the 16 customers into four independent leagues — APAC 5, EU 8, US 2, LATAM 1 — and ranks restart at 1 in each. Probed winners: Grace Kim/APAC, Alice Chen/EU, Bruno Silva/LATAM, Emma Wilson/US, four rank-1s." },
      { answer: "SUM", kind: "keyword", label: "the spend aggregator",
        why: "The league ranks lifetime spend, so the window's ORDER BY needs SUM(o.total) — the same aggregate the GROUP BY folded. COUNT(o.total) would rank by order count instead: probed, Keiko's 4 orders would take APAC's bronze from Farid's 1458.97 spend." },
      { answer: "DESC", kind: "keyword", label: "the podium direction",
        why: "Top spender = rank 1 requires descending sums. Probed: EU's block reads Alice 7262.35, Chloe 2667.93, Pedro 1686.17… downward — ASC would crown each region's smallest spender." },
    ],
    distractors: ["c.id", "COUNT", "ASC"],
    walkthrough:
      "PARTITION BY is GROUP BY's segmentation without the collapse: the query still returns all 16 customer rows, but the ranking restarts inside each region. Four partitions, four rank-1s — Grace Kim 4574.23 in APAC, Alice Chen 7262.35 in EU, Bruno Silva 852.44 in LATAM, Emma Wilson 6640.56 in US — and the sequences run 1..5, 1..8, 1..1, 1..2. Partition by c.id instead and every customer is their own league: sixteen rank-1s, no podiums. Rank by COUNT and the sums are replaced by per-row order counts, tying everything at 1. DESC keeps the crown on the biggest spend; ASC would hand LATAM's podium to a single 852.44 anyway — but EU's would go to Olivia at 444.80.",
  },
  {
    id: "cs-1287",
    tier: "easy",
    topic: "w3",
    universe: "pricing",
    title: "Above the hundred-dollar line",
    brief:
      "From: Pricing lead. Re: the premium tier census.\n\nThe premium tier is everything priced at 100 or more, ranked for the margin sheet. The draft query lost its threshold, its threshold column and its direction. Rebuild the tier: filter, then rank what survives.",
    ask: "One query: products priced at 100 or more, ranked from the most expensive.",
    template:
      "SELECT name, price, RANK() OVER (ORDER BY price {1}) AS rk\nFROM products\nWHERE {3} >= {2}\nORDER BY rk;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the tier direction",
        why: "The margin sheet leads with the priciest, so the window sorts descending. Probed tier: Smart Watch S 199.99 rk 1, Noise-Canceling Headset 149.99 rk 2 — ASC would open with Studio Desktop Mic 119, the tier's floor." },
      { answer: "100", kind: "number", noVerify: true, label: "the premium threshold",
        why: "The 100 line is the pricing rule, not a result figure. Probed: exactly 4 products clear it — 199.99, 149.99, 129, 119. At 120 the tier shrinks to three; at 50 it balloons to eight." },
      { answer: "price", kind: "keyword", label: "the threshold column",
        why: "The tier is defined on price. WHERE stock >= 100 would census warehouse depth instead — probed, 10 products — a different audit wearing the same shape." },
    ],
    distractors: ["ASC", "120", "130"],
    walkthrough:
      "WHERE runs before the window, so the 100-line first trims 16 products to the 4 that clear it, and RANK() OVER (ORDER BY price DESC) numbers only those survivors 1–4: Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119. The threshold is policy — move it to 120 and the Mic falls out; the sheet prints three rows and the margin story changes. Filter on stock and the census counts warehouse depth (10 products at 100+) — the right shape, the wrong column. ASC still returns four rows but flips the leadership to the tier's cheapest member, which reads as a bargain list, not a premium one.",
  },
  {
    id: "cs-1288",
    tier: "easy",
    topic: "w3",
    universe: "inventory",
    title: "The reorder ladder's top rung",
    brief:
      "From: Ops manager. Re: the consumption census.\n\nRestock planning starts from the heaviest buyers: rank the sixteen accounts by order count and keep the top three. The draft query lost its direction and its cutoff.",
    ask: "One query: the three accounts with the most orders, ranked, with their counts.",
    template:
      "SELECT c.name, COUNT(*) AS orders, RANK() OVER (ORDER BY COUNT(*) {1}) AS rk\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY {3}\nORDER BY rk\nLIMIT {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "Heaviest buyers first sorts the window descending. Probed ladder: Alice Chen 24 orders rk 1, Emma Wilson 17 rk 2, Grace Kim 14 rk 3 — ASC would open with the two one-order accounts, Liam and Olivia." },
      { answer: "3", kind: "number", label: "the ladder cutoff",
        why: "LIMIT 3 keeps the top rung trio. Probed rk 1–3: 24, 17, 14 — the counts the restock memo quotes for its anchor accounts." },
      { answer: "c.id", kind: "keyword", label: "the fold key",
        why: "GROUP BY c.id folds 103 orders into one row per account — the ladder's grain. GROUP BY region would collapse to four region totals and GROUP BY o.id would explode back to one row per order; either way the 16-account ladder disappears." },
    ],
    distractors: ["ASC", "2", "region", "o.id"],
    walkthrough:
      "GROUP BY c.id folds 103 orders into 16 counts, and RANK() OVER (ORDER BY COUNT(*) DESC) ranks the folded counts — the window reads aggregates, the rows stay folded. DESC puts Alice's 24 on the top rung, Emma's 17 second, Grace's 14 third, all distinct so no tie policy applies yet (the ladder's first tie waits at 4 orders, further down). LIMIT 3 matches the memo's three anchors; LIMIT 5 would pull Maya's 13 and Chloe's 5 into a plan built for three. And the fold key is the ladder's grain: fold by region and only four rungs exist, fold by order id and every order is its own rung of 1 — the memo's per-account census only exists at the c.id grain. ASC inverts the census into a one-order watchlist — useful for churn, wrong for restock.",
  },
  {
    id: "cs-1289",
    tier: "easy",
    topic: "w3",
    universe: "fraud",
    title: "The four biggest payments",
    brief:
      "From: Treasury analyst. Re: the cash-in probe.\n\nSpot-check protocol: pull the four largest customer payments, dollars rendered, ranked. The draft query lost its direction and its cutoff — and the auditor wants RANK visible so ties would show.",
    ask: "One query: the four largest payments ranked, with ids and dollar amounts.",
    template:
      "SELECT id, invoice_id, amount_cents / 100.0 AS amount, RANK() OVER (ORDER BY {3} {1}) AS rk\nFROM payments\nORDER BY rk\nLIMIT {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the cash-in direction",
        why: "Largest first sorts the window descending. Probed league head: 4015.00 rk 1, 4000.00 rk 2, 3896.00 rk 3, 3512.00 rk 4 — ASC would lead the probe with the smallest payment in the till." },
      { answer: "4", kind: "number", label: "the probe cutoff",
        why: "LIMIT 4 keeps the four rows the spot-check samples. Probed rk 1–4 read 4015, 4000, 3896, 3512 — all distinct ranks, the tie pairs (2807.00 twice, among others) sit further down the league." },
      { answer: "amount_cents", kind: "keyword", label: "the league's sort column",
        why: "The probe ranks cash: ORDER BY amount_cents lines up the payment sizes. ORDER BY id or invoice_id would rank filing order instead — the till's biggest movements would never surface at the top of a filing-order walk." },
    ],
    distractors: ["ASC", "6", "2", "id", "invoice_id"],
    walkthrough:
      "27 payments in, RANK() OVER (ORDER BY amount_cents DESC) stamps each with its cash-in position; the /100.0 renders cents as report dollars. LIMIT 4 samples the head: 4015.00, 4000.00, 3896.00, 3512.00 — no ties in this block, though the league does carry five tied pairs deeper down (2807.00, 2642.00, 2430.00, 2361.50, 2229.50, two each), which is exactly why the auditor asked for RANK rather than a bare number. Widen to LIMIT 6 and 3420.00 and 3076.00 join the sample; trim to 2 and the probe loses half its coverage. And the sort column is what makes it a money probe: ranked by id or invoice_id, the same query walks the filing cabinet and the biggest payments stay buried. ASC turns the probe into a smallest-payments list — the opposite of a materiality sample.",
  },
  {
    id: "cs-1290",
    tier: "easy",
    topic: "w3",
    universe: "catalog",
    title: "Shelf positions for every product",
    brief:
      "From: Catalog lead. Re: the shelf map.\n\nMerchandising wants every product wearing its price position within its own category — seven shelves, ranks restarting per shelf, priciest at 1. The draft lost its partition key, its ranking column and its direction. Rebuild the shelf map.",
    ask: "One query: each product's price rank inside its category, most expensive first.",
    template:
      "SELECT category, name, price, RANK() OVER (PARTITION BY {1} ORDER BY {2} {3}) AS rk\nFROM products\nORDER BY category, rk;",
    slots: [
      { answer: "category", kind: "keyword", label: "the shelf key",
        why: "PARTITION BY category makes seven independent leagues — one per shelf — with ranks restarting at 1 in each. Probed winners: Smart Watch S (Wearables), Noise-Canceling Headset (Audio), 4K Webcam Pro (Video), one rk 1 per shelf." },
      { answer: "price", kind: "keyword", label: "the ranking column",
        why: "Shelves are priced: ORDER BY price ranks the shelf by cost. ORDER BY stock would rank by warehouse depth instead — HDMI's 500 units would top Accessories regardless of its 14.99 price tag." },
      { answer: "DESC", kind: "keyword", label: "the shelf direction",
        why: "Priciest at position 1 sorts descending. Probed Wearables block: Smart Watch S 199.99 rk 1, Fitness Band X2 79 rk 2 — ASC would make the budget band the shelf leader." },
    ],
    distractors: ["ASC", "supplier", "stock"],
    walkthrough:
      "One window, three moving parts. PARTITION BY category slices 16 products into 7 shelves (three categories hold 3 products, three hold 2, Fitness holds 1); ORDER BY price DESC ranks each shelf with its priciest item at rk 1 — all prices are distinct, so no tie policy fires. The probed map: Accessories reads Laptop Stand 42.50, Desk Mat 24.99, HDMI 14.99; Wearables reads Smart Watch 199.99, Fitness Band 79; Audio reads Noise 149.99, Mic 119, Speaker 59.99. Partition by supplier instead and the shelves become six supply leagues with different winners entirely; rank by stock and the map measures inventory, not premium-ness; ASC inverts every shelf so the budget item leads.",
  },
  // ============================== MEDIUM ==============================
  {
    id: "cs-1291",
    tier: "medium",
    topic: "w3",
    universe: "refund-audit",
    title: "Where the delivered block begins",
    brief:
      "From: Support lead. Re: the status league audit.\n\nRanking all 103 orders alphabetically by status, the delivered rows don't start at rank 1 — three blocks sit ahead of them. The audit asserts the block's starting rank and its size in one row. The staging query lost its ranking key, its counter and its pin. Rebuild it.",
    ask: "One query: the rank where the delivered block starts and how many orders share it.",
    template:
      "WITH ranked AS (SELECT id, status, RANK() OVER (ORDER BY {1}) AS rk FROM orders)\nSELECT rk, {2}(*) AS n FROM ranked WHERE status = 'delivered' AND rk = {3};",
    slots: [
      { answer: "status", kind: "keyword", label: "the ranking key",
        why: "The league is alphabetical by status, so the window orders by status. Probed blocks: cancelled rk 1 (7 rows), delivered rk 8 (52), pending rk 60 (14), shipped rk 74 (30). Rank by total instead and rank 8 is one lone order — the assert collapses." },
      { answer: "COUNT", kind: "keyword", label: "the block counter",
        why: "COUNT(*) measures how wide the pinned rank is. Probed: 52 delivered orders all share rk 8 — the whole block arrives in one assert row. SUM(*) is not countable SQL; the engine refuses it." },
      { answer: "8", kind: "number", label: "the pinned starting rank",
        why: "Seven cancelled rows occupy positions 1–7, so the next block opens at rk 8 — the gap RANK leaves IS the message. Probed: WHERE status='delivered' AND rk=8 returns the assert row 8 | 52. Pin 60 and nothing comes back; that's pending's number." },
    ],
    distractors: ["total", "SUM", "60"],
    walkthrough:
      "The window can't be filtered on its own level — WHERE runs before windows compute — so the rank is staged in a CTE and the assert runs outside, the two-step shape evaluation order forces. Stage RANK() OVER (ORDER BY status): cancelled's 7 rows take rk 1, delivered's 52 take rk 8, pending's 14 rk 60, shipped's 30 rk 74; DENSE_RANK would read 1,2,3,4 — the gap from 1 to 8 is the cancelled block's width, and RANK preserves it. The assert pins rk 8 and counts: 52 delivered rows, one row out. Rank by total and rk 8 is a single order, so the assert dies; pin 60 and the query returns nothing — 60 is where pending starts, the next block over.",
  },
  {
    id: "cs-1292",
    tier: "medium",
    topic: "w3",
    universe: "month-close",
    title: "The four months that share rank three",
    brief:
      "From: Controller. Re: the seasonality ladder.\n\nMonths ranked by order count tie in blocks, and the ladder's middle block is the interesting one: four months share one rank. Build the staged ladder and return exactly that cohort with its count and rank.",
    ask: "One query: the months sharing rank 3 in the order-count league, with their counts.",
    template:
      "WITH months AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n,\n       {3}() OVER (ORDER BY COUNT(*) {1}) AS rk\nFROM orders GROUP BY mon)\nSELECT mon, n, rk FROM months WHERE rk = {2} ORDER BY mon;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "Busiest months at rank 1 sorts counts descending. Probed ladder: 9×2 at rk 1, 8×4 at rk 3, 7×5 at rk 7, 6×3 at rk 12. ASC would make rank 3 one of the quiet 6-order months — a different rung entirely." },
      { answer: "3", kind: "number", label: "the pinned rung",
        why: "The 8-order block opens at rk 3: two 9-order months occupy positions 1–2, so the next four months share rk 3. Probed cohort: 2024-01, 2024-03, 2024-05, 2024-07, each n = 8. Pin 1 and the two 9s come back instead." },
      { answer: "RANK", kind: "keyword", label: "the gap-keeping ranker",
        why: "RANK keeps the gap: two 9s share rk 1, so the 8s open at rk 3 — the pin's whole arithmetic. DENSE_RANK would squeeze the gap (dense 3 = the five 7s) and ROW_NUMBER would deal unique numbers 1–14; either way the pin catches the wrong cohort." },
    ],
    distractors: ["ASC", "1", "total", "DENSE_RANK", "ROW_NUMBER"],
    walkthrough:
      "Fold 103 orders into 14 month counts, then rank the folds: RANK() OVER (ORDER BY COUNT(*) DESC) deals 1,1 (the two 9s: 2024-02, 2024-09), then jumps to 3 for the four 8s (2024-01, 2024-03, 2024-05, 2024-07), then 7 for five 7s, then 12 for three 6s — the gap-skip-gap rhythm of RANK's tie policy, with DENSE_RANK reading 1,2,3,4 on the same data. The pin rk = 3 returns exactly the four-month cohort, each row showing n = 8 and rk = 3. Direction matters as much as the pin: ascending, rank 3 is one lone 6-order month. And the pin must be a literal — rank is a window output, invisible to WHERE until staged, which is why the CTE exists at all.",
  },
  {
    id: "cs-1293",
    tier: "medium",
    topic: "w3",
    universe: "supplier",
    title: "The five that follows the four-way tie",
    brief:
      "From: Procurement lead. Re: the catalog breadth league.\n\nFour suppliers tie at three products each, sharing rank 1 — so the two-product suppliers land at rank 5, dense rank 2. Build the staged league and return exactly that two-product cohort with both rank readings.",
    ask: "One query: the suppliers sitting at rank 5 in the product-count league, with counts and dense rank.",
    template:
      "WITH counts AS (SELECT s.name, {3}(p.id) AS n,\n       RANK() OVER (ORDER BY COUNT(p.id) {1}) AS rk,\n       DENSE_RANK() OVER (ORDER BY COUNT(p.id) DESC) AS drk\nFROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id\nGROUP BY s.id)\nSELECT name, n, rk, drk FROM counts WHERE rk = {2} ORDER BY name;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Widest catalogs at rank 1 sorts counts descending. Probed league: four suppliers tie at 3 (rk 1), two sit at 2 (rk 5). ASC would put the two-product pair at rank 1 and the four-way tie at rank 5 — the cohort pin would catch the wrong suppliers." },
      { answer: "5", kind: "number", label: "the pinned rank",
        why: "Four rows occupy positions 1–4, so the next tier opens at rk 5 — RANK's gap made visible. Probed cohort: Alpine Audio GmbH and Andes Naturals SA, n = 2, drk = 2. Pin 1 and the four 3-product suppliers return instead." },
      { answer: "COUNT", kind: "keyword", label: "the breadth counter",
        why: "COUNT(p.id) sizes each supplier's catalog — the figure the league ranks. SUM(p.id) would rank by summed product ids, a meaningless number that changes the whole ladder." },
    ],
    distractors: ["ASC", "1", "SUM"],
    walkthrough:
      "LEFT JOIN keeps all six suppliers in the count even if one stocked nothing; GROUP BY s.id folds the products, and two windows read the folds differently on purpose — RANK to expose the gap, DENSE_RANK to expose the tier. The probed shape: 3,3,3,3 then 2,2 — four-way tie at rk 1 / drk 1, then rk 5 / drk 2. The pin rk = 5 returns Alpine and Andes with n = 2: rank 5 says 'four suppliers tied ahead of you', dense 2 says 'you're the second tier'. Count the wrong thing — SUM of ids — and every figure in the league moves. Ascend the league and rank 5 becomes the four-way tie itself: right query, wrong end.",
  },
  {
    id: "cs-1294",
    tier: "medium",
    topic: "w3",
    universe: "fraud",
    title: "The twelve-character cohort",
    brief:
      "From: Risk analyst. Re: the length-tier census.\n\nName-length tiers feed the dedupe heuristics, and the 12-character tier is the crowded one. Build the staged ladder with both rank readings and return exactly that cohort, pinned by its character count.",
    ask: "One query: the customers whose names run 12 characters, with rank and dense rank.",
    template:
      "WITH lens AS (SELECT name, {3}(name) AS chars,\n       RANK() OVER (ORDER BY LENGTH(name) DESC) AS rk,\n       DENSE_RANK() OVER (ORDER BY LENGTH(name) {1}) AS drk\nFROM customers)\nSELECT name, chars, rk, drk FROM lens WHERE chars = {2} ORDER BY name;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the dense direction",
        why: "Both windows must read the league the same way: longest first. Probed ladder: 14×1 at rk 1, 13×2 at rk 2, 12×5 at rk 4, 11×3 at rk 9, 10×4 at rk 12, 9×1 at rk 16. ASC would renumber the dense tiers from the bottom and the 12s would read drk 4, not 3." },
      { answer: "12", kind: "number", label: "the cohort pin",
        why: "The pin selects the tier, and it appears in the result as chars. Probed cohort: Chloe Dubois, Farid Nasser, Jamal Wright, Liam O'Brien, Olivia Brown — five names, rk 4, drk 3. Pin 13 and the two-name tier returns instead." },
      { answer: "LENGTH", kind: "keyword", label: "the measuring function",
        why: "LENGTH(name) counts characters — the tier key. UPPER(name) would return the uppercased TEXT, which never equals a number: the probed census reads 0 rows. The pin would silently empty the report." },
    ],
    distractors: ["ASC", "13", "UPPER"],
    walkthrough:
      "Five names measure 12 characters, and they tie into one block: RANK says 4 (one 14, two 13s occupy positions 1–3), DENSE_RANK says 3 (third tier, no gaps counted). Both readings ship in the same row — that contrast is the lesson the audit buys. The pin chars = 12 selects the cohort; chars itself is staged because WHERE can't see the window's siblings until they're materialized. Direction mismatch is the subtle trap: the dense window must descend like its RANK twin or the tier numbers disagree with the ladder. And the measuring chip matters — swap LENGTH for UPPER and the census returns zero rows, because an uppercased string never equals 12.",
  },
  {
    id: "cs-1295",
    tier: "medium",
    topic: "w3",
    universe: "inventory",
    title: "The premium shelf shortlist",
    brief:
      "From: Merchandising lead. Re: the shortlist build.\n\nEach category contributes its two priciest products to the endcap shortlist. Stage the per-shelf numbering, then keep the first two rows per shelf. The draft lost its partition key, its row cap and its numberer.",
    ask: "One query: the two priciest products per category, numbered, across all shelves.",
    template:
      "WITH ranked AS (SELECT name, category, price,\n       {3}() OVER (PARTITION BY {1} ORDER BY price DESC, name) AS rn\nFROM products)\nSELECT name, category, price, rn FROM ranked WHERE rn <= {2} ORDER BY category, rn;",
    slots: [
      { answer: "category", kind: "keyword", label: "the shelf key",
        why: "PARTITION BY category restarts the numbering per shelf — seven shelves, seven rn = 1 rows. Probed: partition by supplier instead and the shelves become six supply leagues, returning 12 rows of a different shortlist." },
      { answer: "2", kind: "number", label: "the shortlist cap",
        why: "rn <= 2 keeps two rows per shelf. Probed census: 13 rows come back, not 14 — Fitness holds a single product, so its shelf contributes only rn 1. Cap at 1 and the shortlist halves to the seven shelf winners." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the deterministic numberer",
        why: "ROW_NUMBER guarantees exactly one rn 1 per shelf — prices are distinct here, but the price DESC, name tiebreaker pins the deal either way. SUM() with no argument isn't a numberer; the engine refuses it." },
    ],
    distractors: ["supplier", "1", "SUM"],
    walkthrough:
      "Top-N-per-group is two stages by law: the window numbers rows inside each partition, and the filter runs outside — WHERE rn <= 2 can't sit next to the window that computes rn. Stage ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, name), then keep rn 1–2: seven winners, six runners-up — 13 rows, because Fitness's shelf has no second product. The probed winners: Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Laptop Stand Aluminum 42.50 among them. Cap at 1 and the runners-up vanish; partition by supplier and the same cap builds a 12-row supplier shortlist nobody asked for. The numberer must guarantee uniqueness — that's why rn = 1 picks exactly one row per shelf.",
  },
  {
    id: "cs-1296",
    tier: "medium",
    topic: "w3",
    universe: "growth",
    title: "The EU block's starting rank",
    brief:
      "From: Growth lead. Re: the regional ladder proof.\n\nRank all sixteen customers alphabetically by region and the EU block doesn't start at 1 — five APAC rows sit ahead. Prove the block's start: stage the ladder with both rank readings and return the EU rows at that rank.",
    ask: "One query: the EU customers at their shared starting rank, with rank and dense rank.",
    template:
      "WITH by_region AS (SELECT name, region, RANK() OVER (ORDER BY {1}) AS rk,\n       DENSE_RANK() OVER (ORDER BY region) AS drk\nFROM customers)\nSELECT name, region, rk, drk FROM by_region WHERE region = {2} AND rk = {3} ORDER BY name;",
    slots: [
      { answer: "region", kind: "keyword", label: "the ladder key",
        why: "The league ranks the region names themselves — that's what makes the block tie. Probed blocks: APAC 5 rows at rk 1, EU 8 rows at rk 6, LATAM rk 14, US rk 15. Rank by name instead and rank 6 belongs to one lone customer, Farid — the proof evaporates." },
      { answer: "'EU'", kind: "keyword", label: "the block filter",
        why: "WHERE region = 'EU' selects the eight-customer block. Probed: all eight — Alice through Pedro — carry rk 6, drk 2. Filter 'APAC' and the same pin returns nothing: APAC's ranks are 1 through 5, all below the pin." },
      { answer: "6", kind: "number", label: "the starting rank",
        why: "Five APAC rows occupy positions 1–5, so every EU row opens at rk 6 — while DENSE_RANK reads 2, the gap versus the tier being the whole lesson. Probed assert: eight rows, rk 6, drk 2." },
    ],
    distractors: ["name", "'APAC'", "2"],
    walkthrough:
      "Rank by a column with engineered ties — region — and the three rankers split: RANK gives all eight EU customers 6 (positions 1–5 are APAC's), DENSE_RANK gives them 2 (second tie group), and ROW_NUMBER would have dealt them 6–13 uniquely. The staged pin rk = 6 returns the full EU block in one assert: eight rows, each wearing 6 and 2 — the gap (6 vs 2) is the five-row APAC tie made visible. Filter APAC with the same pin and the query returns nothing, because APAC sits at rk 1. Pin 2 and the EU block misses again — 2 is the dense reading, not the rank reading. One word apart, two honest numbers, both about the same eight customers.",
  },
  {
    id: "cs-1297",
    tier: "medium",
    topic: "w3",
    universe: "refund-audit",
    title: "The biggest cancelled ticket",
    brief:
      "From: Support lead. Re: the cancellation review.\n\nThe week's cancellation postmortem leads with the single largest cancelled order. Stage the cancelled league, rank it, and return the top row only. The draft lost its direction, its status filter and its pin.",
    ask: "One query: the largest cancelled order, ranked first, with id and total.",
    template:
      "WITH cancelled AS (SELECT id, total, RANK() OVER (ORDER BY total {1}) AS rk\nFROM orders WHERE status = {2})\nSELECT id, ROUND(total,2) AS total, rk FROM cancelled WHERE rk = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the review direction",
        why: "Largest ticket first sorts the window descending. Probed cancelled ladder: order 83 at 397.99 rk 1, order 95 at 206.19 rk 2 — ASC would 'lead' the review with the 25.47 ticket, the smallest loss on file." },
      { answer: "'cancelled'", kind: "keyword", label: "the status filter",
        why: "WHERE status = 'cancelled' ranks only the 7 cancelled rows. Probed per-status maxima: cancelled 397.99, pending 1088.44, shipped 845.92, delivered 752.96 — filter 'pending' and the review leads with a live order, not a cancellation." },
      { answer: "1", kind: "number", label: "the top-row pin",
        why: "WHERE rk = 1 keeps exactly the champion — no LIMIT needed once the rank exists. Probed: order 83, 397.99, rk 1. The seven cancelled totals are all distinct, so rank 1 is a single row." },
    ],
    distractors: ["ASC", "'pending'", "2"],
    walkthrough:
      "The filter runs first — seven cancelled orders survive — and RANK() OVER (ORDER BY total DESC) lines them up: 397.99, 206.19, 152.52, 143.86, 136.11, 90.35, 25.47, no ties, ranks 1–7 clean. The staged pin rk = 1 returns the single champion row, order 83 at 397.99, and rk is projected so the assert is visible. Pin 2 and the review examines order 95's 206.19 — the runner-up, a different story. Filter 'pending' and the same query crowns order 74 at 1088.44, a ticket that hasn't cancelled at all. And ASC hands the postmortem a 25.47 footnote as its headline: the direction chip is the difference between a finding and a typo.",
  },
  {
    id: "cs-1298",
    tier: "medium",
    topic: "w3",
    universe: "expense",
    title: "The Rent wall at rank two",
    brief:
      "From: Finance partner. Re: the bill-stack audit.\n\nOne expense towers alone at rank 1; the fourteen Rent rows tie into a wall right behind it. Build the staged amount ladder and assert the wall: its rank and its width, in one row.",
    ask: "One query: how many expense rows share rank 2 in the amount league.",
    template:
      "WITH ranked AS (SELECT id, category, vendor, amount_cents,\n       RANK() OVER (ORDER BY amount_cents {1}) AS rk\nFROM expenses)\nSELECT rk, {2}(*) AS wall FROM ranked WHERE rk = {3} GROUP BY rk;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "Biggest bills first sorts the window descending. Probed ladder head: 168000 alone at rk 1, then 120000 at rk 2. ASC would make rank 2 the second-cheapest bill — a lone 24-thousand-cent Ads row, wall width 1." },
      { answer: "COUNT", kind: "keyword", label: "the wall gauge",
        why: "COUNT(*) measures how many rows share the pinned rank — the wall's width. Probed: 14 rows, all the monthly Rent charges. SUM(*) isn't countable SQL; the engine refuses it." },
      { answer: "2", kind: "number", label: "the pinned rank",
        why: "The wall sits at rk 2: one 168000 bill occupies position 1, so all fourteen 120000 Rent rows share rk 2. Probed assert: rk 2, wall 14. Pin 1 and the gauge reads 1 — the lone Travel bill." },
    ],
    distractors: ["ASC", "SUM", "1"],
    walkthrough:
      "Rank 36 expense rows by amount DESC and the ladder's shape tells the story: 168000 (Skyline Travel, the August spike) alone at rk 1, then fourteen identical 120000 Rent rows tying at rk 2 — RANK holds them all at 2 because they occupy positions 2 through 15 together, and the next bill (45200) won't open until rk 16. The staged pin rk = 2 with COUNT measures the wall: 14 rows, one row out. Pin 1 and the gauge reads 1 — the spike, not the wall. Ascending, rank 2 is a single 24-thousand-cent Ads charge. The tie census is the audit: a rent schedule should be perfectly flat, and the rank-2 wall proves it is.",
  },
  {
    id: "cs-1299",
    tier: "medium",
    topic: "w3",
    universe: "month-close",
    title: "The bottom quartile's floor",
    brief:
      "From: Controller. Re: the order-book quartiles.\n\nFor the close deck we split all 103 orders into four quartiles by total and quote the bottom quartile: how many rows it holds and where its floor sits. The staging query lost its direction, its counter and its tile pin.",
    ask: "One query: the bottom quartile's row count and minimum total, when orders are tiled by spend.",
    template:
      "WITH tiled AS (SELECT id, total, NTILE(4) OVER (ORDER BY total {1}) AS tile FROM orders)\nSELECT tile, {2}(*) AS n, ROUND(MIN(total),2) AS cut FROM tiled WHERE tile = {3} GROUP BY tile;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the tiling direction",
        why: "Tile 1 must be the big tickets, so the window sorts totals descending before dealing. Probed spans: DESC tile 1 runs 489.33–1088.44; ASC would deal the cheapest 26 orders into tile 1 and the 'bottom quartile' pin would catch the top one instead." },
      { answer: "COUNT", kind: "keyword", label: "the tile gauge",
        why: "COUNT(*) sizes the pinned tile. Probed deal over 103: 26/26/26/25 — tile 4 is the short tile with 25 rows. SUM(*) can't count rows; the engine refuses it." },
      { answer: "4", kind: "number", label: "the bottom tile pin",
        why: "WHERE tile = 4 pins the last-dealt quartile. Probed: n 25, floor 25.47 — the store's cheapest order. Pin 2 and the gauge reads tile 2's 26 rows floored at 285.10, a different stratum." },
    ],
    distractors: ["ASC", "SUM", "2"],
    walkthrough:
      "NTILE(4) is a dealer with a remainder rule: 103 orders can't split into four equal tiles, so the front tiles take the extras — 26/26/26/25, probed. Sorted descending, tile 4 collects the 25 cheapest tickets and runs from 25.47 up to 135.24; the staged pin tile = 4 measures it — n 25, floor 25.47, the single-row assert the deck quotes. The boundary orders matter: tile 1's floor is 489.33 (26 orders sit at or above it), and the same deal run ascending would put the big spenders in tile 4 — cut 507.24, a top-quartile answer wearing the bottom-quartile label. Pin 2 and you've measured the second stratum: 26 rows floored at 285.10. Direction, counter, pin — three chips, one honest quartile.",
  },
  {
    id: "cs-1300",
    tier: "medium",
    topic: "w3",
    universe: "funnel",
    title: "The engagement ladder's fourth rung",
    brief:
      "From: Lifecycle marketing. Re: the re-engagement cohort.\n\nAccounts ranked by order count tie into blocks, and dense rank 6 is the cohort we can still re-engage — big enough to matter, small enough to mail. Build the staged ladder with both readings and return that cohort.",
    ask: "One query: the accounts at dense rank 6 of the order-count ladder, with counts and rank.",
    template:
      "WITH ladder AS (SELECT c.name, COUNT(*) AS n,\n       RANK() OVER (ORDER BY COUNT(*) DESC) AS rk,\n       {3}() OVER (ORDER BY COUNT(*) {1}) AS drk\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id)\nSELECT name, n, rk, drk FROM ladder WHERE drk = {2} ORDER BY n DESC, name;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the dense direction",
        why: "Both windows must read the ladder top-down. Probed ladder: 24, 17, 14, 13, 5, then the four 4s at rk 6 / drk 6. ASC would renumber the dense tiers from the bottom and drk 6 would be Maya's lone 13 — one account, not a cohort." },
      { answer: "6", kind: "number", label: "the cohort pin",
        why: "drk = 6 pins the sixth distinct count. Probed cohort: Isabella, Keiko, Noah, Pedro — four accounts at n = 4, rk 6, drk 6. The next rung down is drk 7: Farid and Hiro at n = 3, rk 10." },
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless tier reader",
        why: "DENSE_RANK stacks tie blocks with no gaps: probed, the dense ladder runs 6 then 7 where RANK runs 6 then 10 — the pin needs the dense reading to catch the whole four-account cohort. ROW_NUMBER would number 1–16 outright and the pin would return one arbitrary member instead of the cohort." },
    ],
    distractors: ["ASC", "7", "ROW_NUMBER"],
    walkthrough:
      "The count ladder ties where raw spend never does: 24, 17, 14, 13, 5 stand alone, then four customers share 4 orders — RANK deals them all a 6 and skips to 10 for the count-3 pair, while DENSE_RANK reads 6 and 7 with no gaps. Pinning drk = 6 returns the four-account cohort in one select: Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez, each row showing n 4, rk 6, drk 6 — the two readings disagreeing by exactly the four skipped positions. Direction is the trap: dense-ascending renumbers the tiers from the bottom, and drk 6 becomes Maya's lone 13 — one account, not a cohort. And ROW_NUMBER in the dense slot would shatter the cohort — no ties, one arbitrary member per pin. Two windows, one ladder, and the pin picks the tier the campaign can afford.",
  },
  {
    id: "cs-1301",
    tier: "medium",
    topic: "w3",
    universe: "pricing",
    title: "Shelf king, league tail",
    brief:
      "From: Pricing lead. Re: the divergence probe.\n\nPriced at 42.50 or more, some products lead their own category while trailing the store league. Find the extreme case: the product that is last in the filtered league but first on its shelf. Stage both rank readings and pin it.",
    ask: "One query: the product ranked last overall yet first in its category, among products at 42.50 and up.",
    template:
      "WITH dual AS (SELECT name, price, RANK() OVER (ORDER BY price {1}) AS overall,\n       RANK() OVER (PARTITION BY category ORDER BY price DESC) AS shelf\nFROM products WHERE price >= {2})\nSELECT name, price, overall, shelf FROM dual WHERE overall = {3} AND shelf = 1;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "The overall league runs most-expensive-first. Probed: among the 10 products at 42.50+, Laptop Stand Aluminum is overall 10. ASC would invert the league and the same pin would crown Smart Watch S — the top of the inverted list, shelf 1 as well." },
      { answer: "42.5", kind: "number", noVerify: true, label: "the filter line",
        why: "The 42.50 line is the probe's scope, not a result figure. Probed: it keeps exactly 10 products — global ranks 1–10 — so the league's last row is 42.50 itself. At 50 the Laptop Stand drops out and the assert returns nothing." },
      { answer: "10", kind: "number", label: "the tail pin",
        why: "overall = 10 pins the league's last row among the ten survivors. Probed assert: Laptop Stand Aluminum, 42.50, overall 10, shelf 1 — the cheapest product in scope that still leads its own Accessories shelf. Pin 9 and USB-C Hub's shelf rank 2 fails the shelf = 1 test." },
    ],
    distractors: ["ASC", "50", "48"],
    walkthrough:
      "Two windows, two leagues, one row where they disagree hardest. The filter keeps the ten products at 42.50 and up; RANK() OVER (ORDER BY price DESC) numbers them 1–10 storewide, while the partitioned window renumbers each category shelf. The probed divergence list: Studio Desktop Mic is overall 4 but shelf 2 behind the Headset; Fitness Band X2 overall 6, shelf 2 behind Smart Watch S; and at the extreme, Laptop Stand Aluminum — 42.50, the cheapest survivor — is overall 10 yet Accessories' shelf king at rk 1. The assert pins overall = 10 AND shelf = 1 and that single row comes back. Loosen the line to 50 and the Laptop Stand leaves the league entirely, leaving the assert empty — thresholds change who the extreme case even is.",
  },
  {
    id: "cs-1302",
    tier: "medium",
    topic: "w3",
    universe: "supplier",
    title: "The bottom half of the rating league",
    brief:
      "From: Procurement lead. Re: the deal-review split.\n\nSix suppliers, one median split: NTILE deals them into two halves by rating, and the review covers the bottom half only. Build the staged deal and return that half. The draft lost its direction and its half pin.",
    ask: "One query: the suppliers in the bottom half of the rating split, with their ratings.",
    template:
      "WITH tiers AS (SELECT name, rating, NTILE(2) OVER (ORDER BY {3} {1}) AS half FROM suppliers)\nSELECT name, rating, half FROM tiers WHERE half = {2} ORDER BY rating DESC;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the dealing direction",
        why: "Half 1 must hold the best-rated, so the window sorts descending before NTILE deals. Probed: DESC half 2 collects the three weakest — 4.1, 4.0, 3.9. ASC would deal the top-rated trio into half 2 and the review would audit our best suppliers." },
      { answer: "2", kind: "number", label: "the reviewed half",
        why: "half = 2 pins the bottom bucket. Probed return: Shenzhen Electro 4.1, Andes Naturals SA 4.0, Pacific Textiles 3.9 — the review slate. Pin 1 and the slate flips to Alpine 4.8, Nordic 4.6, Midwest 4.4." },
      { answer: "rating", kind: "keyword", label: "the dealing key",
        why: "The split rides the rating: ORDER BY rating deals best-rated first, so half 2 is the weak end. ORDER BY name would deal the alphabet instead — the review slate would mix champions with laggards and the half pin would lose its meaning." },
    ],
    distractors: ["ASC", "1", "name"],
    walkthrough:
      "NTILE(2) over six suppliers deals three and three — the median split without writing a median. Sorted descending, half 1 is Alpine 4.8, Nordic 4.6, Midwest 4.4 and half 2 is Shenzhen 4.1, Andes 4.0, Pacific 3.9; the staged pin half = 2 returns the review slate with ratings attached. This is a dealer, not a ranker: no ties are broken, no gaps are left — the deal position is the only output. But the dealer still needs the right sort key: deal by name and the alphabet mixes champions with laggards, so 'half 2' would hold suppliers the ratings never chose. Deal ascending and 'half 2' becomes the premium trio — the review would spend its meetings congratulating suppliers. Six rows, two halves, one pin: the split is the whole audit.",
  },
  {
    id: "cs-1303",
    tier: "medium",
    topic: "w3",
    universe: "fraud",
    title: "The three orders wearing rank thirty-three",
    brief:
      "From: Fraud analyst. Re: the same-day batch probe.\n\nRanked by order date, three orders share one rank — a same-day batch worth a look. Stage the date ladder and return exactly that tie block, biggest ticket first. The draft lost its ranking key, its pin and its presentation sort.",
    ask: "One query: the orders sharing rank 33 in the created_at ladder, with their dates and totals.",
    template:
      "WITH stamped AS (SELECT id, created_at, total, RANK() OVER (ORDER BY {1}) AS rk FROM orders)\nSELECT id, created_at, ROUND(total,2) AS total, rk FROM stamped WHERE rk = {2} ORDER BY {3};",
    slots: [
      { answer: "created_at", kind: "keyword", label: "the ladder key",
        why: "The tie is engineered by ranking dates — 17 dates carry multiple orders. Probed: 2024-05-12 holds three orders all at rk 33. Rank by total instead and every rank is unique — the pin returns one lone order, no batch." },
      { answer: "33", kind: "number", label: "the batch pin",
        why: "The 2024-05-12 block occupies positions 33–35, so RANK holds all three at 33. Probed return: ids 39 (845.92), 35 (373.00), 40 (135.24). Pin 34 and nothing comes back — after a three-way tie the next rank is 36, not 34." },
      { answer: "total", kind: "keyword", label: "the presentation sort",
        why: "The outer ORDER BY is presentation: biggest ticket first for the analyst's eye. Probed order: 845.92, 373.00, 135.24. ORDER BY id would shuffle the block to 35, 39, 40 — same rows, wrong read." },
    ],
    distractors: ["34", "id", "MIN"],
    walkthrough:
      "Seventeen of the store's 84 order dates carry multiple orders, and RANK() OVER (ORDER BY created_at) turns each shared date into a tie block — 2024-01-02's pair at rk 2, 2024-05-12's trio at rk 33, 2024-10-13's trio at rk 74. The pin rk = 33 returns the May batch: orders 39, 35, 40, all stamped 2024-05-12, all wearing 33. The gap arithmetic is the tell — after three tied rows the next rank is 36, so pin 34 returns an empty set, proof the block is three wide. Present by total DESC and the batch reads 845.92 down to 135.24, biggest exposure first; sort by id and the same three rows tell the story in filing order. Same-day spikes are exactly what RANK's gap policy is built to surface.",
  },
  // ============================== HARD ==============================
  {
    id: "cs-1304",
    tier: "hard",
    topic: "w3",
    universe: "growth",
    title: "Two per region, no excuses",
    brief:
      "From: Growth lead. Re: the regional shortlist.\n\nThe board shortlist takes each region's two biggest spenders — eight rows, four leagues, restarts included. Stage the partitioned deal with a deterministic numberer, keep the top two per region, and present region by rank. The draft lost its partition, its direction and its cap.",
    ask: "One query: the two biggest spenders in each region, numbered, with their figures.",
    template:
      "WITH league AS (SELECT c.region, c.name, ROUND(SUM(o.total),2) AS spend,\n       ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY SUM(o.total) {2}) AS rn\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id)\nSELECT region, name, spend, rn FROM league WHERE rn <= {3} ORDER BY region, rn;",
    slots: [
      { answer: "region", kind: "keyword", label: "the league partition",
        why: "PARTITION BY region builds the four regional leagues the shortlist promises. Probed winners: Grace Kim 4574.23 (APAC), Alice Chen 7262.35 (EU), Bruno Silva 852.44 (LATAM), Emma Wilson 6640.56 (US). Partition by c.id and every customer is their own league — sixteen rows, no shortlist." },
      { answer: "DESC", kind: "keyword", label: "the shortlist direction",
        why: "Biggest spenders at rn 1 sorts each league descending. Probed runners-up: Maya Patel 3644.56 (APAC), Chloe Dubois 2667.93 (EU), Jamal Wright 645.60 (US) — ASC would shortlist each region's smallest spender instead." },
      { answer: "2", kind: "number", label: "the per-league cap",
        why: "rn <= 2 keeps two rows per region. Probed return: exactly 8 rows — APAC and EU contribute two each, LATAM and US have just enough customers (1 and 2) to fill their slots. Cap at 3 and the list grows to 9 rows, all extras from the two big regions." },
    ],
    distractors: ["c.id", "ASC", "1"],
    walkthrough:
      "The full top-N-per-group assembly: fold 103 orders into 16 spends, partition the folds into four regional leagues, number each league with ROW_NUMBER (deterministic — spends never tie), then filter rn <= 2 outside the window where the number actually exists. The probed shortlist: APAC Grace 4574.23 then Maya 3644.56; EU Alice 7262.35 then Chloe 2667.93; LATAM Bruno 852.44 alone at rn 1 with no rn 2; US Emma 6640.56 then Jamal 645.60 — eight rows, and the 'two per region' promise survives only because every region has at least two customers. Partition by customer id and the shortlist explodes to sixteen self-crowned rows; cap at 3 and nine rows return, the third slots coming only from APAC and EU. Direction is the board's definition of 'biggest' — ASC would nominate each region's smallest account.",
  },
  {
    id: "cs-1305",
    tier: "hard",
    topic: "w3",
    universe: "refund-audit",
    title: "Every account's biggest ticket, counted",
    brief:
      "From: Finance partner. Re: the refund-cap review.\n\nThe new refund cap needs each account's single biggest order — sixteen winners — plus a reconciliation row proving the winner count and the exposure ceiling. Stage the per-account deal, keep rn 1, and assert. The draft lost its direction, its counter and its pin.",
    ask: "One query: the count of per-customer top orders and the largest of them, in one assert row.",
    template:
      "WITH ranked AS (SELECT o.customer_id, c.name, o.id, o.total,\n       ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total {1}, o.id) AS rn\nFROM orders o JOIN customers c ON c.id = o.customer_id)\nSELECT rn, {2}(*) AS winners, ROUND(MAX(total),2) AS biggest\nFROM ranked WHERE rn = {3} GROUP BY rn;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ticket direction",
        why: "rn 1 must be each account's BIGGEST order, so the deal sorts totals descending with id as tiebreaker. Probed winners: Farid's 1088.44 leads the sixteen. ASC would deal each account's smallest order instead — the assert's ceiling would read 705.39, Liam's only order." },
      { answer: "COUNT", kind: "keyword", label: "the winner counter",
        why: "COUNT(*) proves how many accounts contributed a winner. Probed: 16 — every account has at least one order, so rn 1 exists once per partition. SUM(*) can't count rows; the engine refuses it." },
      { answer: "1", kind: "number", label: "the champion pin",
        why: "WHERE rn = 1 keeps each partition's top row. Probed assert: rn 1, winners 16, biggest 1088.44. Pin 2 and the reconciliation changes shape — only 14 accounts have a second order, and the ceiling drops to 785.79." },
    ],
    distractors: ["ASC", "SUM", "2"],
    walkthrough:
      "The staged top-one-per-group: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) deals every order a position inside its account, ids breaking ties so the deal is reproducible; the outer pin rn = 1 keeps the sixteen champions, and the assert row counts them and reads the ceiling — winners 16, biggest 1088.44 (Farid Nasser's order 74, the store's largest ticket). The reconciliation is the audit: sixteen accounts, sixteen rn-1 rows, no gaps. Flip the direction and the same query audits frugality — every account's smallest order, sixteen of them, ceiling 705.39 because Liam's single order is both his floor and his ceiling. Pin 2 and two accounts (Liam, Olivia) drop out — 14 winners, ceiling 785.79. Same shape, three different audits; the chips decide which one ships.",
  },
  {
    id: "cs-1306",
    tier: "hard",
    topic: "w3",
    universe: "inventory",
    title: "The thirty-row reconciliation",
    brief:
      "From: Ops manager. Re: the top-two audit.\n\nThe brief promised two orders per account from the top-two-per-account build, but the reconciliation smells wrong — someone assumed every account has two orders. Build the staged deal, keep rn 1–2, and measure what actually came back: kept rows and how deep the deal reached.",
    ask: "One query: how many rows the top-two-per-customer build really keeps, with the shallowest and deepest rn.",
    template:
      "WITH ranked AS (SELECT customer_id, {3}() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn\nFROM orders)\nSELECT {2}(*) AS kept, MIN(rn) AS shallowest, MAX(rn) AS deepest\nFROM ranked WHERE rn <= {1};",
    slots: [
      { answer: "2", kind: "number", label: "the deal depth",
        why: "rn <= 2 is the promised two-per-account keep. Probed assert: kept 30, not 32 — two accounts hold a single order, so their partitions never deal an rn 2. The deepest column reads 2, proving the cap was reached somewhere." },
      { answer: "COUNT", kind: "keyword", label: "the kept-row gauge",
        why: "COUNT(*) measures what the build actually returned — the reconciliation number. Probed: 30. SUM(*) can't count rows; the engine refuses it. The audit is the gap between the promised 32 and the measured 30." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the unique numberer",
        why: "The cap rn <= 2 needs a numberer with no ties — ROW_NUMBER guarantees at most two rows per partition regardless of equal totals. LEAD needs an offset argument; the engine refuses the bare call. Totals never tie here, but the contract shouldn't lean on luck." },
    ],
    distractors: ["3", "SUM", "LEAD"],
    walkthrough:
      "Top-two-per-account is a promise the data doesn't quite keep: 16 accounts, two rows each, 32 expected — but the deal only deals what exists, and Liam O'Brien and Olivia Brown hold a single order each, so their partitions stop at rn 1. The reconciliation measures reality: kept 30, shallowest 1, deepest 2 — thirty rows, and the depth proves some partitions reached the cap while the shortfall proves others never could. Widen the cap to 3 and the kept count jumps to 41, the eleven accounts with three or more orders contributing their third rows — a different promise entirely. The numberer matters as much as the cap: ROW_NUMBER can always deliver exactly two rows per partition, which is why dedupe-and-cap builds standardize on it. Thirty, not thirty-two — the two-row gap is the finding.",
  },
  {
    id: "cs-1307",
    tier: "hard",
    topic: "w3",
    universe: "expense",
    title: "The ledger's net league",
    brief:
      "From: Finance partner. Re: the account league.\n\nThe close review ranks the four ledger accounts by net movement — debits minus credits — and asserts the leader. Fold the ledger, rank the nets in dollars, pin rank 1. The draft lost its aggregator, its direction and its pin.",
    ask: "One query: the ledger account with the highest net movement, with its dollar figure and rank.",
    template:
      "WITH nets AS (SELECT account, {3}(debit_cents - credit_cents) / 100.0 AS net,\n       RANK() OVER (ORDER BY SUM(debit_cents - credit_cents) {1}) AS rk\nFROM ledger_entries GROUP BY account)\nSELECT account, ROUND(net,2) AS net, rk FROM nets WHERE rk = {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Highest net first sorts the window descending. Probed nets: cash 44196 rk 1, operating_expenses 25416 rk 2, accounts_receivable 16440 rk 3, sales_revenue −86052 rk 4. ASC would crown sales_revenue — the biggest movement, but negative." },
      { answer: "1", kind: "number", label: "the leader pin",
        why: "WHERE rk = 1 keeps the league's top row. Probed assert: cash, 44196.00, rk 1. Pin 4 and the assert returns the revenue account's −86052 — the deepest negative movement, a different finding entirely." },
      { answer: "SUM", kind: "keyword", label: "the net aggregator",
        why: "SUM(debit_cents − credit_cents) nets each account's movement — the figure both the fold and the window rank on. COUNT would print entry counts (cash 27, AR 26, opex 14, sales 13) where dollar nets belong." },
    ],
    distractors: ["ASC", "4", "COUNT"],
    walkthrough:
      "Windows rank aggregates here: GROUP BY account folds 80 ledger rows into four nets, and RANK() OVER (ORDER BY SUM(debit_cents − credit_cents) DESC) ranks the folded figures — cash +44196, operating_expenses +25416, accounts_receivable +16440, sales_revenue −86052, all distinct, ranks 1–4 clean. The SELECT's SUM re-rendered through /100.0 and ROUND gives the report its dollars. Pin rk = 1 and the assert returns cash — the account that grew the most — while pin 4 surfaces the revenue account's negative net, which is a reconciliation story about sign conventions, not a leader. Swap the aggregator for COUNT and the 'nets' become entry tallies (27, 26, 14, 13) — the league still runs, but every figure is a lie about money. The direction chip decides whether 'highest movement' means most gained or merely most extreme.",
  },
  {
    id: "cs-1308",
    tier: "hard",
    topic: "w3",
    universe: "funnel",
    title: "The win-back tail, measured",
    brief:
      "From: Lifecycle marketing. Re: the tail census.\n\nThe spend league's bottom quartile is the win-back audience. Deal the sixteen accounts into quartiles, pin the last tile, and measure it: headcount and floor spend, one assert row. The draft lost its counter, its floor reader and its tile pin.",
    ask: "One query: the bottom spend quartile's headcount and minimum spend, in one assert row.",
    template:
      "WITH league AS (SELECT c.name, ROUND(SUM(o.total),2) AS spend,\n       NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS tile\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id)\nSELECT {1}(*) AS tail, {2}(spend) AS floor_spend FROM league WHERE tile = {3};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the headcount gauge",
        why: "COUNT(*) sizes the pinned tile. Probed deal: NTILE(4) over 16 splits 4/4/4/4, so tile 4 reads tail 4. MAX(*) can't count rows; the engine refuses it." },
      { answer: "MIN", kind: "keyword", label: "the floor reader",
        why: "MIN(spend) reads the tail's floor. Probed tile 4: Liam 705.39, Jamal 645.60, Dmitri 599.26, Olivia 444.80 — floor 444.80, the smallest lifetime spend in the store. MAX would read 705.39, the tail's ceiling, and mislabel it." },
      { answer: "4", kind: "number", label: "the tail tile pin",
        why: "tile = 4 pins the last-dealt quartile. Probed: four accounts, floor 444.80. Pin 1 and the assert measures the premium quartile instead — four accounts floored at 3644.56, nobody's win-back audience." },
    ],
    distractors: ["MAX", "1", "SUM"],
    walkthrough:
      "Sixteen spends divide by four exactly, so NTILE(4) deals clean 4/4/4/4 tiles — no remainder politics. Sorted descending, tile 4 collects the bottom quartile: Liam O'Brien 705.39, Jamal Wright 645.60, Dmitri Volkov 599.26, Olivia Brown 444.80. The assert pins tile = 4 and reads two figures: COUNT says 4 accounts, MIN says the floor is 444.80 — the campaign's budget line, since nobody in the tail has spent less than that. Read MAX instead and the assert prints 705.39, the tail's ceiling wearing the floor's label — a planning error the finance review would catch a month late. Pin tile 1 and the same query measures the VIP quartile, floored at 3644.56. The dealer needs no tie policy — the deal position is the whole output.",
  },
  {
    id: "cs-1309",
    tier: "hard",
    topic: "w3",
    universe: "catalog",
    title: "One champion per supplier",
    brief:
      "From: Procurement lead. Re: the supplier champion board.\n\nEach supplier's flagship is its priciest product — six suppliers, six champions, presented cheapest-first for the negotiation order. Stage the per-supplier deal, keep rn 1, and present. The draft lost its pin, its presentation direction and its partition column.",
    ask: "One query: each supplier's most expensive product, numbered first, presented cheapest champion first.",
    template:
      "WITH ranked AS (SELECT s.name AS supplier, p.name, p.price,\n       ROW_NUMBER() OVER (PARTITION BY p.{3} ORDER BY p.price DESC, p.id) AS rn\nFROM products p JOIN suppliers s ON s.id = p.supplier_id)\nSELECT supplier, name, price, rn FROM ranked WHERE rn = {1} ORDER BY price {2};",
    slots: [
      { answer: "1", kind: "number", label: "the champion pin",
        why: "WHERE rn = 1 keeps each supplier's flagship — six partitions, six winners. Probed board: Smart Watch S 199.99 (Nordic), Noise-Canceling Headset 149.99 (Midwest), Studio Desktop Mic 119 (Alpine), Fitness Band X2 79 (Andes), Cycling Jersey Pro 65 (Pacific), Ring Light 39.99 (Shenzhen). Pin 2 and every board row becomes a runner-up." },
      { answer: "DESC", kind: "keyword", label: "the negotiation order",
        why: "The board presents cheapest champion first — negotiate the small suppliers before the flagship suppliers. Probed order: 39.99, 65, 79, 119, 149.99, 199.99. ASC would open the negotiation with Nordic's 199.99 flagship, the hardest table first." },
      { answer: "supplier_id", kind: "keyword", label: "the partition column",
        why: "PARTITION BY p.supplier_id builds one league per supplier — the join supplies the name for display, the id does the partitioning. Partition by category and the board becomes seven category champions, a different deliverable." },
    ],
    distractors: ["2", "ASC", "category"],
    walkthrough:
      "The partition rides the foreign key: ROW_NUMBER() OVER (PARTITION BY p.supplier_id ORDER BY p.price DESC, p.id) numbers each supplier's catalog, and the id-based partition is immune to name quirks — the join exists only to print Alpine, Andes, Midwest, Nordic, Pacific, Shenzhen beside the champions. The pin rn = 1 keeps six rows: Nordic's Smart Watch S 199.99, Midwest's Noise-Canceling Headset 149.99, Alpine's Studio Desktop Mic 119, Andes' Fitness Band X2 79, Pacific's Cycling Jersey Pro 65, Shenzhen's Ring Light 39.99 — and because the outer sort is price DESC, the negotiation order runs from Shenzhen's 39.99 up to Nordic's 199.99. Wait, no — DESC puts Nordic first; the cheap-first reading needs ASC. Pin 2 and the board silently becomes a runner-up showcase. The partition column is the difference between six supplier leagues and seven category ones.",
  },
  {
    id: "cs-1310",
    tier: "hard",
    topic: "w3",
    universe: "pricing",
    title: "The twin line items at rank one-forty-nine",
    brief:
      "From: Pricing auditor. Re: the duplicate-price probe.\n\nLine items should price uniquely, but four unit prices appear twice each in order_items. Find the most expensive twin: rank every line item by unit price, measure each price's twin count, and return the pair at the top of the tie list. The draft lost its direction, its twin pin and its rank pin.",
    ask: "One query: the two line items sharing the highest duplicated unit price, with their rank and twin count.",
    template:
      "WITH items AS (SELECT id, order_id, unit_price,\n       RANK() OVER (ORDER BY unit_price {1}) AS rk,\n       COUNT(*) OVER (PARTITION BY unit_price) AS twins\nFROM order_items)\nSELECT id, order_id, unit_price, rk, twins FROM items WHERE twins = {2} AND rk = {3} ORDER BY id;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Most expensive twins first sorts the window descending. Probed tie list: 41.38×2 at rk 149, then 24.94×2 at rk 207, 18.14×2 at rk 224, 15.12×2 at rk 243. ASC would pin a different ladder entirely and the rank pin would return nothing." },
      { answer: "2", kind: "number", label: "the twin pin",
        why: "twins = 2 selects duplicated prices — the probe's whole point. Probed census: exactly four unit prices appear twice — 41.38, 24.94, 18.14, 15.12. The COUNT(*) OVER window stamps every row with its price's width." },
      { answer: "149", kind: "number", label: "the pinned rank",
        why: "The 41.38 pair occupies positions 149–150, so RANK holds both at 149. Probed return: ids 24 and 150, unit_price 41.38, rk 149, twins 2. Pin 150 and nothing comes back — after a two-way tie the next rank is 151." },
    ],
    distractors: ["ASC", "1", "150"],
    walkthrough:
      "Two windows in one stage: RANK() OVER (ORDER BY unit_price DESC) positions all 251 line items, while COUNT(*) OVER (PARTITION BY unit_price) stamps each row with how many twins its price has — the pair-finder needs both. The probed tie list reads 41.38×2 at rk 149, 24.94×2 at 207, 18.14×2 at 224, 15.12×2 at 243, so the most expensive twins are ids 24 and 150 at 41.38, both wearing rk 149 and twins 2. The gap is the tell: pin 150 returns nothing because a two-way tie makes the next rank 151. Run the league ascending and the same pair sits at a different rank entirely — the pin only matches the descending read. Four pairs, one probe, and the rank-plus-twin-count assert documents exactly which duplicates the pricing team cares about first.",
  },
  {
    id: "cs-1311",
    tier: "hard",
    topic: "w3",
    universe: "growth",
    title: "Emma's percentile, asserted",
    brief:
      "From: Growth lead. Re: the percentile league.\n\nThe board deck quotes each account's percentile, not its rank — PERCENT_RANK reads (rank − 1) / (rows − 1) across the spend league. Assert the second-place account's percentile at four decimals. The draft lost its direction, its name pin and its percentiler.",
    ask: "One query: the second-biggest spender's lifetime spend and percentile, rounded to four decimals.",
    template:
      "WITH league AS (SELECT c.name, ROUND(SUM(o.total),2) AS spend,\n       ROUND({3}() OVER (ORDER BY SUM(o.total) {1}), 4) AS pct\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id)\nSELECT name, spend, pct FROM league WHERE name = {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Percentiles read from the top, so the window sorts the league descending. Probed: DESC gives Emma Wilson 0.0667 — one row ahead of fifteen. ASC would put her at 0.9333, the same arithmetic from the bottom, and the deck would quote the wrong end." },
      { answer: "'Emma Wilson'", kind: "keyword", label: "the name pin",
        why: "The assert pins the runner-up. Probed row: Emma Wilson, 6640.56, pct 0.0667 — her 6640.56 sits second behind Alice's 7262.35 in a sixteen-row league. Pin 'Alice Chen' and the percentile reads 0.0, the definition of rank 1." },
      { answer: "PERCENT_RANK", kind: "keyword", label: "the percentiler",
        why: "PERCENT_RANK() computes (rank − 1) / (rows − 1) — Emma's 1/15 = 0.0667 at four decimals. CUME_DIST would read her share at-or-above: 2/16 = 0.125, a different honest number that flatters no one correctly." },
    ],
    distractors: ["ASC", "'Alice Chen'", "CUME_DIST"],
    walkthrough:
      "PERCENT_RANK turns the leaderboard into a distribution: Alice 7262.35 is rank 1, so her percentile is 0; Emma 6640.56 is rank 2 of 16, so hers is 1/15 = 0.0667; Dmitri 599.26 reads 14/15 = 0.9333; Olivia 444.80 reads 1.0 — the probed ladder, all four corners. The assert pins Emma and rounds to four decimals because the raw division runs long. The cousin function matters: CUME_DIST divides by row count instead of rows-minus-one and counts at-or-above, so Emma reads 0.125 there — both are correct, but the deck standardized on PERCENT_RANK, and mixing them is how two teams quote different numbers for the same account. Direction flips the scale: ascending, Emma's percentile becomes 0.9333 — mathematically true, strategically backwards.",
  },
  {
    id: "cs-1312",
    tier: "hard",
    topic: "w3",
    universe: "supplier",
    title: "One champion supplier per region",
    brief:
      "From: Procurement lead. Re: the regional supplier board.\n\nEach region keeps one champion supplier by rating — four regions, four winners, with the join-parallel board run per region rather than globally. Stage the partitioned rating league and pin rank 1. The draft lost its direction, its pin and its partition column.",
    ask: "One query: each region's top-rated supplier, pinned at rank 1, with ratings.",
    template:
      "WITH by_region AS (SELECT s.name, s.region, s.rating,\n       RANK() OVER (PARTITION BY s.{3} ORDER BY s.rating {1}) AS rk\nFROM suppliers s)\nSELECT region, name, rating, rk FROM by_region WHERE rk = {2} ORDER BY region;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the champion direction",
        why: "Top-rated at rk 1 sorts each partition descending. Probed champions: Alpine 4.8 (EU), Midwest 4.4 (US), Shenzhen 4.1 (APAC), Andes 4.0 (LATAM). ASC would crown each region's weakest supplier — Pacific 3.9 would 'lead' APAC." },
      { answer: "1", kind: "number", label: "the champion pin",
        why: "WHERE rk = 1 keeps one row per region. Probed return: four rows, one per region — APAC, EU, LATAM, US each contribute exactly one champion. Pin 2 and only two rows survive: Pacific 3.9 and Nordic 4.6, the regions that even have a second supplier." },
      { answer: "region", kind: "keyword", label: "the partition column",
        why: "PARTITION BY s.region builds four independent rating leagues. Partition by rating itself and every supplier is their own partition — six rows all wearing rk 1, the pin meaningless. The partition key must be the grouping the board promises." },
    ],
    distractors: ["ASC", "2", "rating"],
    walkthrough:
      "Six suppliers across four regions — APAC and EU hold two each, LATAM and US one apiece — so PARTITION BY region builds four leagues of uneven depth and RANK restarts at 1 in each. The probed champions: EU's Alpine Audio 4.8, US's Midwest Hardware 4.4, APAC's Shenzhen Electro 4.1, LATAM's Andes Naturals 4.0 — four rows, one per region, each wearing rk 1. The global league would have crowned Alpine alone; the partitioned board keeps every region represented, which is the entire point of the partition chip. Pin 2 and the board shrinks to the two regions deep enough to have a runner-up — Pacific 3.9 and Nordic 4.6 — a hiring shortlist, not a champion board. Partition by rating and the leagues collapse to singletons: six rank-1s, no ranking.",
  },
  {
    id: "cs-1313",
    tier: "hard",
    topic: "w3",
    universe: "expense",
    title: "The August spike, asserted",
    brief:
      "From: Finance partner. Re: the bill-spike review.\n\nOne month's expense stack towers over the rest and the close review leads with it. Fold the bills into month buckets, rank the buckets by spend, and assert rank 1 with its dollar figure. The draft lost its bucket slicer, its direction and its pin.",
    ask: "One query: the month whose expense stack is largest, with its dollar total and rank.",
    template:
      "WITH months AS (SELECT {3}('%Y-%m', spent_on) AS mon, SUM(amount_cents) / 100.0 AS spend,\n       RANK() OVER (ORDER BY SUM(amount_cents) {1}) AS rk\nFROM expenses GROUP BY mon)\nSELECT mon, ROUND(spend,2) AS spend, rk FROM months WHERE rk = {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the spike direction",
        why: "Biggest stack at rk 1 sorts the buckets descending. Probed league: 2024-08 at 3210.00 rk 1, 2024-11 at 1974.00 rk 2 — ASC would crown 2024-02's 1440.00, the quietest month, as the 'spike'." },
      { answer: "1", kind: "number", label: "the spike pin",
        why: "WHERE rk = 1 keeps the assert row. Probed: 2024-08, 3210.00, rk 1 — the fourteen month spends are all distinct, so rank 1 is a single bucket. Pin 2 and the review leads with 2024-11's 1974.00 instead." },
      { answer: "strftime", kind: "keyword", label: "the bucket slicer",
        why: "strftime('%Y-%m', spent_on) slices 36 bills into 14 chronological month buckets — the key the GROUP BY folds on. No other function in that slot can slice dates that way; a vendor-style call isn't SQL and the engine refuses it." },
    ],
    distractors: ["ASC", "2", "vendor"],
    walkthrough:
      "Bucket then rank: strftime('%Y-%m', spent_on) slices the 36 expenses into 14 month buckets, GROUP BY mon folds each to a total, and RANK() OVER (ORDER BY SUM(amount_cents) DESC) ranks the folded stacks — windows reading aggregates, the lesson-31 pattern applied to the ledger's cousin table. The probed league head: 2024-08 at 3210.00 — the month the Travel bill spiked to 168000 cents — then 2024-11 at 1974.00, and the tail sits at 2024-02's 1440.00. The pin rk = 1 returns the single assert row the review opens with. Fourteen distinct spends mean no tie policy fires; the drama is all in the direction and the pin. Ascend the league and the review 'spike' is the cheapest month on file; pin 2 and the memo leads with a month that merely came second.",
  },
  {
    id: "cs-1314",
    tier: "hard",
    topic: "w3",
    universe: "fraud",
    title: "Where the quantity block begins",
    brief:
      "From: Fraud analyst. Re: the line-item census.\n\nOrder lines come in quantities 1, 2 and 3, and the blocks are wildly uneven. For the inflation probe we assert the middle block: its width, the rank where it starts, and its dense reading — one row. The draft lost its counter, its quantity pin and its filter column.",
    ask: "One query: how many line items sit in the quantity-2 block, where its rank starts, and its dense rank.",
    template:
      "WITH items AS (SELECT id, quantity, RANK() OVER (ORDER BY quantity) AS rk,\n       DENSE_RANK() OVER (ORDER BY quantity) AS drk FROM order_items)\nSELECT {1}(*) AS block, MIN(rk) AS start_rk, MAX(drk) AS dense_at FROM items WHERE {3} = {2};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the block gauge",
        why: "COUNT(*) measures the pinned block's width. Probed census: quantity 1 covers 93 items, quantity 2 covers 69, quantity 3 covers 89 — the middle block is the narrow one. SUM(*) can't count rows; the engine refuses it." },
      { answer: "2", kind: "number", label: "the quantity pin",
        why: "quantity = 2 pins the middle block. Probed assert: block 69, start_rk 94, dense_at 2 — the 93 single-unit items occupy positions 1–93, so the first two-unit line opens at rank 94. Pin 3 and the assert reads 89 wide starting at 163." },
      { answer: "quantity", kind: "keyword", label: "the filter column",
        why: "The block is defined on quantity — the column both windows rank on. Filter unit_price = 2 and nothing matches; filter id = 2 and the 'block' is one line item wearing whatever rank it happens to hold." },
    ],
    distractors: ["SUM", "3", "unit_price"],
    walkthrough:
      "Rank 251 line items by quantity and the ladder has exactly three rungs — 1, 2, 3 — but the blocks behind them are lopsided: 93 items tie at rk 1, 69 tie at rk 94, 89 tie at rk 163, while DENSE_RANK reads the same ladder as 1, 2, 3. The assert pins quantity = 2 and measures the middle block three ways: width 69, start 94, dense 2 — and the 94 is the fraud probe's arithmetic lesson, ninety-three tied rows pushing the next block's opening rank to 94. Pin 3 and the same query measures the bulk block: 89 wide, starting 163. Filter the wrong column and the assert either empties or shrinks to a single row — the census only means something when the pin matches the ranking key. Three rungs, three honest widths, one row out.",
  },
  {
    id: "cs-1315",
    tier: "hard",
    topic: "w3",
    universe: "month-close",
    title: "The close deck's top tile",
    brief:
      "From: Controller. Re: the tile assert.\n\nThe close deck splits the fourteen month buckets into four spend tiles and quotes the top tile: headcount and floor. Stage the tiled league, pin tile 1, and assert — one row. The draft lost its direction, its counter and its tile pin.",
    ask: "One query: the top spend tile's headcount and minimum month spend, in one assert row.",
    template:
      "WITH months AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS s,\n       NTILE(4) OVER (ORDER BY SUM(total) {1}) AS tile\nFROM orders GROUP BY mon)\nSELECT tile, {2}(*) AS n, ROUND(MIN(s),2) AS cut FROM months WHERE tile = {3} GROUP BY tile;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the dealing direction",
        why: "Tile 1 must be the biggest months, so the window sorts the league descending before dealing. Probed tile 1: 2024-01, 2024-02, 2024-09, 2024-10 — floored at 2975.67. ASC would deal the four cheapest months into tile 1, running 1193.86 up to 2047.43." },
      { answer: "COUNT", kind: "keyword", label: "the tile counter",
        why: "COUNT(*) sizes the pinned tile. Probed deal over 14 buckets: 4/4/3/3 — the front tiles absorb the remainder, so tile 1 reads n 4. SUM(*) can't count rows; the engine refuses it." },
      { answer: "1", kind: "number", label: "the tile pin",
        why: "tile = 1 pins the flagship quartile. Probed assert: tile 1, n 4, cut 2975.67 — the floor the deck quotes as 'no month in the top tile spent less than this'. Pin 2 and the assert reads tile 2's 4 months floored at 2390.53." },
    ],
    distractors: ["ASC", "SUM", "2"],
    walkthrough:
      "Fold 103 orders into 14 month buckets, then let NTILE(4) deal the buckets — 14 doesn't divide by 4, so the dealer hands the remainder to the front tiles: 4/4/3/3, probed. Sorted descending, tile 1 collects the four biggest months — 2024-01 3731.97, 2024-02 3609.64, 2024-09 3116.04, 2024-10 2975.67 — and the assert pins tile = 1 to read headcount 4 and floor 2975.67. The floor is the deck's quote: any month below 2975.67 is by definition outside the top tile, and tile 2's floor at 2390.53 marks where the next tier begins. Deal ascending and tile 1 becomes the four quietest months — 1193.86 up to 2047.43 — the same assert shape, the opposite story. Windows over GROUP BY, a dealer with a remainder rule, and a pin: the tile assert is the close deck's whole argument in one row.",
  },
  {
    id: "cs-1316",
    tier: "hard",
    topic: "w3",
    universe: "inventory",
    title: "The reorder report's top five",
    brief:
      "From: Ops manager. Re: the depth report.\n\nThe reorder report ranks deep stock — 150 units and up — and presents the five deepest shelves. Two filters, one ladder: the stock line, then the rank cap. The draft lost its direction, both filter constants and its filter column.",
    ask: "One query: the five deepest-stocked products among those holding 150 or more units, ranked.",
    template:
      "WITH ranked AS (SELECT name, stock, RANK() OVER (ORDER BY {3} {1}) AS rk\nFROM products WHERE stock >= {2})\nSELECT rk, name, stock FROM ranked WHERE rk <= {4} ORDER BY rk;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the depth direction",
        why: "Deepest first sorts the window descending. Probed report: HDMI 2.1 Cable 2m 500 rk 1, Running Socks 3-pack 400 rk 2, Wireless Mouse M3 300 rk 3 — ASC would 'lead' with Ring Light's 150, the shallowest row in scope." },
      { answer: "150", kind: "number", noVerify: true, label: "the stock line",
        why: "The 150 line is the report's scope, not a result figure. Probed: exactly 8 products hold 150 or more. At 250 the scope shrinks to four and the report loses its fifth row entirely." },
      { answer: "stock", kind: "keyword", label: "the depth column",
        why: "The ladder ranks warehouse depth: ORDER BY stock puts HDMI's 500 on top. ORDER BY name would rank the alphabet — a filing order wearing a depth report's clothes, with no relation to boxes on shelves." },
      { answer: "5", kind: "number", label: "the report cap",
        why: "rk <= 5 keeps the report's five rows. Probed rk 1–5: 500, 400, 300, 260, 220 (HDMI, Socks, Mouse, Desk Mat, Yoga Mat) — and the ladder's stocks are all distinct, so ranks run clean 1–5." },
    ],
    distractors: ["ASC", "230", "name"],
    walkthrough:
      "Two filters in sequence, each with its own law: WHERE stock >= 150 runs before the window and trims 16 products to the 8 deep shelves; the staged RANK() OVER (ORDER BY stock DESC) numbers those survivors; the outer rk <= 5 caps the presentation. The probed report: HDMI 2.1 Cable 500 at rk 1 down to Yoga Mat Eco 220 at rk 5, with Bluetooth Speaker 210 and Laptop Stand 180 filling ranks 6–7 behind the cap. The scope line is load-bearing — raise it to 250 and only four products qualify, so a five-row report silently prints four; the rank cap still says 5 but the data says otherwise. All eight stocks in scope are distinct, so no tie policy fires — but the two-stage shape is the point: filter, then rank, then cap, in that order, because the rank doesn't exist until the filter has spoken.",
  },
];
