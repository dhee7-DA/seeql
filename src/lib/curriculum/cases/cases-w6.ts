// Case wave w6 — Module 5 window pipelines (lesson 31), cs-1389…cs-1424.
// 36 cases: 12 easy / 12 medium / 12 hard, all topic "w6" (windows layered over
// GROUP BY aggregates, SUM(SUM(x)) OVER () grand-total paint, filtering window
// output via CTE/subquery + outer WHERE because windows can't live in WHERE,
// rank-then-filter pipelines, windows over JOINs, mean-paint filters,
// concentration cuts).
// Every figure traces to committed probe receipts:
// scripts/m5-facts-w6.out + m5-facts-w6b.out (this wave's own probes),
// scripts/m5-facts-r4.out / r6.out (staged months, leaderboard, shares, pots),
// and the engine-verified headers of src/lib/curriculum/drills/m5/
// window-judgment.ts + toolkit-capstone.ts.
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW6: CaseStudy[] = [
  {
    id: "cs-1389",
    tier: "easy",
    topic: "w6",
    universe: "month-close",
    title: "The status pots, ranked",
    brief:
      "From: Controller. Re: the close binder's status page.\n\nThe close binder opens with the four order-status pots — how much money sits delivered, shipped, pending, cancelled — each stamped with its rank. Stage the pots first, then let a window rank them without collapsing them, and pin the delivered row. The draft lost its aggregator, its direction and its pin.",
    ask: "One query: the delivered pot with its rank in the status league, staged before ranking.",
    template:
      "WITH s AS (SELECT status, ROUND({1}(total), 2) AS pot FROM orders GROUP BY status),\nr AS (SELECT status, pot, RANK() OVER (ORDER BY pot {2}) AS rk FROM s)\nSELECT status, pot, rk FROM r WHERE pot = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the pot aggregator",
        why: "The stage folds each status's rows into a money pot: SUM(total) — probed pots 15571.07 / 11996.72 / 6113 / 1152.49. COUNT(total) would fold to the row counts 52/30/14/7, dressing headcounts up as dollars." },
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "The binder ranks biggest pot first, so the window sorts DESC — delivered lands at rk 1. ASC would invert the league and hand rank 1 to cancelled's 1152.49, the exact opposite of the story." },
      { answer: "15571.07", kind: "number", label: "the delivered pot pin",
        why: "Probed: delivered holds 15571.07 — the biggest of the four pots, just under half the store's 34833.28 lifetime figure. Pin 11996.72 and the assert grabs shipped's pot instead." },
    ],
    distractors: ["COUNT", "ASC", "11996.72"],
    walkthrough:
      "The pipeline reads in three layers: the first CTE folds 103 orders into four status pots with GROUP BY (delivered 15571.07, shipped 11996.72, pending 6113, cancelled 1152.49), the second stamps RANK() OVER (ORDER BY pot DESC) on the whole league — a window layered over a GROUP BY, legal exactly because the window runs after the fold — and the outer pin keeps the binder's headline row: delivered, 15571.07, rank 1. The rank lives one CTE ahead of the pin on purpose: a WHERE filters rows before a window computed beside it runs, so pinning at the same level would hand every survivor rank 1. Swap the aggregator for COUNT and the 'pots' become 52/30/14/7 — headcounts wearing dollar labels, and the pin matches nothing. Flip to ASC and rank 1 lands on cancelled, the league read upside down. Stage, rank, pin: that order is the whole shape.",
  },
  {
    id: "cs-1390",
    tier: "easy",
    topic: "w6",
    universe: "funnel",
    title: "The two thin signup waves",
    brief:
      "From: Lifecycle marketing. Re: the acquisition calendar.\n\nThe acquisition calendar folds the sixteen signups into monthly waves and must show each wave's share of the book — with the two thin waves (one signup each) pinned for the 'we stalled in summer' callout. The draft filtered the share at the same level it computed it, which the engine refuses. Stage the share, then pin it.",
    ask: "One query: the signup waves carrying a single customer, with each wave's share of the book staged first.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, {1}(*) AS n FROM customers GROUP BY mon),\np AS (SELECT mon, n, COUNT(*) OVER () AS waves, ROUND(100.0 * n / {2}, 2) AS share FROM m)\nSELECT mon, n, waves, share FROM p WHERE share = {3};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the wave counter",
        why: "Each wave is a headcount: COUNT(*) folds the 16 signups into 9 monthly waves. SUM(*) is not a legal fold — the engine refuses it before anything runs." },
      { answer: "SUM(n) OVER ()", kind: "keyword", label: "the whole-book painter",
        why: "SUM(n) OVER () paints 16 — every signup — onto all nine wave rows, so each share divides by the whole book. COUNT(n) OVER () would paint 9, the wave count, and read 22.22/11.11 — shares of the calendar instead of the book." },
      { answer: "6.25", kind: "number", label: "the thin-wave share pin",
        why: "Probed: the two one-signup waves (2024-06, 2024-07) each carry 1/16 = 6.25 of the book; the seven two-signup waves read 12.5. Pin 12.5 and the assert grabs the crowded months instead of the stall." },
    ],
    distractors: ["SUM", "COUNT(n) OVER ()", "12.5"],
    walkthrough:
      "Windows can't be filtered where they're computed — WHERE runs first — so the share is staged in a second CTE and pinned outside it. The stage folds 16 signups into 9 waves (seven waves of 2, two of 1), SUM(n) OVER () paints the whole book — 16 — onto every row, and the share divides each wave by it: 12.5 for the crowded months, 6.25 for the thin pair the calendar pins. COUNT(*) OVER () rides along as the wave count, 9, so the reader sees both denominators at once. Divide by COUNT(n) OVER () instead and every share silently re-bases on the calendar — 22.22 and 11.11, shares of months rather than of customers. The pin catches the difference: 6.25 only survives when the painter is the book.",
  },
  {
    id: "cs-1391",
    tier: "easy",
    topic: "w6",
    universe: "pricing",
    title: "The mean-price club",
    brief:
      "From: Pricing lead. Re: the premium-shelf memo.\n\nThe premium memo defines its club as 'priced above the catalog's own average' — a line that has to be painted by a window before it can be filtered. Pin the club's most expensive member with the average printed beside it. The draft tried to put the average straight into WHERE, which the engine refuses.",
    ask: "One query: the priciest product above the catalog-wide average price, with that average staged alongside.",
    template:
      "WITH s AS (SELECT name, price, ROUND({1}(price) OVER (), 2) AS mean FROM products)\nSELECT name, price, mean FROM s WHERE price > mean AND price = {2} AND mean = {3};",
    slots: [
      { answer: "AVG", kind: "keyword", label: "the mean painter",
        why: "AVG(price) OVER () paints 71.78 — the sixteen-product average — onto every row, so 'above the average' becomes an ordinary WHERE on a staged column. MAX(price) OVER () would paint 199.99, the leader itself, and no product beats it — the club goes empty." },
      { answer: "199.99", kind: "number", label: "the club leader's price",
        why: "Probed: Smart Watch S tops the six-member club at 199.99, ahead of the Headset's 149.99. The pin grabs the memo's headline row; 149.99 would pin the runner-up instead." },
      { answer: "71.78", kind: "number", label: "the staged average",
        why: "Probed: the catalog's mean price is 71.78 — the line the club is defined against, printed on the row so the memo shows member and threshold together. 8708.32 is a region mean wearing a price label." },
    ],
    distractors: ["MAX", "SUM", "149.99"],
    walkthrough:
      "The mean is a window output, and window outputs can't be filtered at their own level — so the query paints first and filters second. AVG(price) OVER () stamps 71.78 on all sixteen rows inside the CTE; the outer WHERE then reads it like any column: price > mean keeps the six-member club (199.99 down to 79), and the pins grab the leader with its threshold printed beside it. Paint the 'average' with MAX instead and the bar becomes 199.99 — the leader can't clear its own height, so the club is empty and the memo has nothing to quote. SUM(price) OVER () paints the 1148.43 shelf total, a denominator wearing a threshold's clothes. This staged shape is the standard spelling for every 'above average' report.",
  },
  {
    id: "cs-1392",
    tier: "easy",
    topic: "w6",
    universe: "expense",
    title: "The bill-count league's tail",
    brief:
      "From: Finance partner. Re: the vendor-bill census.\n\nThe vendor census folds the expense book into categories by bill count and ranks them — and the partner only wants the tail row, the category billed least often. Stage the counts, rank them with a window, pin the tail. The draft's rank kept collapsing to one row.",
    ask: "One query: the least-billed expense category with its rank in the bill-count league.",
    template:
      "WITH s AS (SELECT category, {1}(*) AS n FROM expenses GROUP BY category),\nr AS (SELECT category, n, RANK() OVER (ORDER BY n {2}) AS rk FROM s)\nSELECT category, n, rk FROM r WHERE n = {3};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the bill counter",
        why: "The census counts bills, not cents: COUNT(*) folds the 36 expense rows into per-category counts — probed 14/14/5/3. SUM(*) is refused by the engine; the fold must be a counter." },
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "The league reads most-billed first, so DESC puts the 14-bill wall at rk 1 and the tail at rk 4. ASC would flip the league and make the tail read like the leader." },
      { answer: "3", kind: "number", label: "the tail count pin",
        why: "Probed: Travel is billed 3 times — the league's tail, behind Ads and Rent's tied 14s and Tools' 5. Pin 14 and the assert grabs both billing leaders instead of the tail." },
    ],
    distractors: ["SUM", "ASC", "14"],
    walkthrough:
      "Stage, rank, pin — one CTE apart each: the first stage folds 36 bills into four category counts (Ads 14, Rent 14, Tools 5, Travel 3), the second stamps RANK() OVER (ORDER BY n DESC) across the whole league — the two 14s share rk 1 and push Tools to 3, Travel to 4 — and the outer pin keeps the tail row the partner asked for. The rank lives one layer ahead of the filter deliberately: a WHERE runs before a window computed beside it, so pinning at the same level would re-rank the survivors and hand the tail a fake rk 1. SUM as the folder dies at the engine's door, and ASC quietly redefines 'tail' as 'head' — the same four rows, an opposite story, Travel reading rk 1. When a league has ties at the top, the tail pin is the honest way to show the bottom without pretending it's rank 3.",
  },
  {
    id: "cs-1393",
    tier: "easy",
    topic: "w6",
    universe: "catalog",
    title: "The three-deep shelf tier",
    brief:
      "From: Catalog lead. Re: the SKU census.\n\nThe census folds the catalog into its seven categories, counts SKUs per shelf, and ranks the shelves — and the audit wants the middle tier: every category carrying exactly two SKUs, asserted at its rank. Stage count and ranks together, then pin the tier. The draft grouped by the rank itself and died.",
    ask: "One query: every category holding two SKUs, asserted at its league rank.",
    template:
      "WITH s AS (SELECT category, {1} AS n, RANK() OVER (ORDER BY COUNT(*) DESC) AS rk,\nDENSE_RANK() OVER (ORDER BY COUNT(*) DESC) AS drk FROM products GROUP BY category)\nSELECT category, n, rk, drk FROM s WHERE n = {2} AND rk = {3};",
    slots: [
      { answer: "COUNT(*)", kind: "keyword", label: "the SKU counter",
        why: "The census counts SKUs per shelf: COUNT(*) — probed 3/3/3/2/2/2/1 across the seven categories. MAX(id) would make 'n' the biggest product id on the shelf, a number that ranks nothing." },
      { answer: "2", kind: "number", label: "the middle-tier count",
        why: "Probed: three categories — Apparel, Video, Wearables — carry exactly 2 SKUs, the census's middle tier between the three 3-SKU shelves and Fitness's 1. Pin 3 and the assert grabs the top tier instead." },
      { answer: "4", kind: "number", label: "the asserted rank",
        why: "Probed: the 2-SKU tier sits at RANK 4 — the three 3-SKU shelves occupy positions 1–3. The assert proves the gap arithmetic; rk 1 would mean the tier tied with the leaders, which it didn't." },
    ],
    distractors: ["MAX(id)", "SUM(*)", "3"],
    walkthrough:
      "Windows ride on aggregates inside the same SELECT: GROUP BY category folds 16 products into seven shelves, and RANK() OVER (ORDER BY COUNT(*) DESC) plus DENSE_RANK() OVER (ORDER BY COUNT(*) DESC) stamp both readings of the league onto the folded rows — no second query needed. The 2-SKU tier lands at RANK 4 (three shelves ahead of it) but DENSE_RANK 2 (the second distinct count) — the dense column is printed right beside it so the census shows the gap and the tier at once. The pin asserts both facts: n = 2 and rk = 4. Group by the rank alias instead and the engine answers 'aggregate functions are not allowed in the GROUP BY clause' — verbatim — which is why the fold happens on category and the rank stays a window.",
  },
  {
    id: "cs-1394",
    tier: "easy",
    topic: "w6",
    universe: "growth",
    title: "The spend league's midpoint",
    brief:
      "From: Growth analyst. Re: the leaderboard's middle band.\n\nThe board deck's leaderboard spotlights the middle band this quarter — rank 8, the customer exactly halfway down the sixteen-row spend league. Stage the league with a window over the grouped spend, then pin the midpoint. The draft lost its direction, its rank pin and its money rounding.",
    ask: "One query: the rank-8 customer on the lifetime-spend leaderboard, money at two decimals.",
    template:
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), {3}) AS spend,\nRANK() OVER (ORDER BY SUM(o.total) {1}) AS rk\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)\nSELECT name, spend, rk FROM s WHERE rk = {2};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "A spend leaderboard reads biggest first, so DESC puts Alice's 7262.35 at rk 1 and the midpoint at rk 8. ASC would run the league upside down and hand rank 8 to Isabella's 985.65 — a different customer wearing the same rank number." },
      { answer: "8", kind: "number", label: "the midpoint rank",
        why: "Probed: rk 8 is Keiko Sato at 1098.6 — the exact middle of the sixteen distinct spends, with Isabella 985.65 behind her and Bruno 852.44 behind him. Pin 9 and the spotlight lands one row low." },
      { answer: "2", kind: "number", noVerify: true, label: "the money rounding",
        why: "Ledger money reads at two decimals — probed, ROUND(SUM, 2) prints 1098.6 and 7262.35 at the top. The rounding digit never appears in the result cells, but ROUND at 0 would flatten the league to whole dollars and 1099 would misquote the deck." },
    ],
    distractors: ["ASC", "0", "ROW_NUMBER"],
    walkthrough:
      "The leaderboard is a window over a GROUP BY: fold 103 orders into sixteen customer spends with GROUP BY c.id, then RANK() OVER (ORDER BY SUM(o.total) DESC) stamps each spend with its league position — sixteen distinct totals, so rank and row correspond one-to-one. The pin keeps rk 8: Keiko Sato, 1098.6, the midpoint the deck spotlights, with the probed neighbours Isabella 985.65 at 9 and Bruno 852.44 at 10. Run the league ASC and rank 8 becomes Isabella — the query still executes, but the spotlight now points at a customer the deck never meant. And the rounding slot matters at the margins: zero decimals would print 1099, a figure that matches no receipt in the ledger.",
  },
  {
    id: "cs-1395",
    tier: "easy",
    topic: "w6",
    universe: "inventory",
    title: "The shelf under the average",
    brief:
      "From: Ops manager. Re: the depth census callout.\n\nThe depth census flags shelves running below the warehouse-wide average — and the callout wants the deepest of those thin shelves, average printed beside it. Paint the average with a window, stage it, then pin the row. The draft filtered the average at its own level and the engine refused the query.",
    ask: "One query: the deepest shelf below the warehouse-average stock, with that average staged beside it.",
    template:
      "WITH s AS (SELECT name, stock, ROUND({1}(stock) OVER (), 1) AS avg_stock FROM products)\nSELECT name, stock, avg_stock FROM s WHERE stock < avg_stock AND stock = {2} AND avg_stock = {3};",
    slots: [
      { answer: "AVG", kind: "keyword", label: "the average painter",
        why: "AVG(stock) OVER () paints 177.8 — the sixteen-shelf average — onto every row, turning 'below average' into an ordinary staged filter. COUNT(stock) OVER () would paint 16, the shelf count, and nothing stocks fewer than 16 units except nothing at all — the callout goes empty." },
      { answer: "150", kind: "number", label: "the deepest thin shelf",
        why: "Probed: nine shelves sit below 177.8, and the deepest of them is the Ring Light at 150 — ahead of the Keyboard's 120. Pin 120 and the callout flags the runner-up thin shelf." },
      { answer: "177.8", kind: "number", label: "the staged average",
        why: "Probed: the warehouse average is 177.8 units — the line nine shelves fall under. The assert proves the paint; 2845 is the warehouse total, a different figure entirely." },
    ],
    distractors: ["COUNT", "120", "500"],
    walkthrough:
      "Same staging law as every mean-paint report: AVG(stock) OVER () computes across all sixteen shelves inside the CTE — 177.8 — and the outer WHERE reads it as an ordinary column: stock < avg_stock keeps the nine thin shelves (40 up to 150), and the pins grab the deepest of them with the threshold printed beside it. The pipeline exists because WHERE runs before any window: filter at the same level and the engine refuses the query outright. COUNT as the painter paints 16 — a headcount, not a depth line — and the callout empties. Pin HDMI's 500 and the assert grabs a shelf that isn't even in the club: 500 clears the average by more than double. Paint, stage, filter, pin — in that order, every time.",
  },
  {
    id: "cs-1396",
    tier: "easy",
    topic: "w6",
    universe: "supplier",
    title: "The rating gap's zero rung",
    brief:
      "From: Procurement lead. Re: the rating spread card.\n\nThe supplier card shows each partner's gap to the top rating and their lift off the floor, and the audit pins the rung where both readings meet the extremes: the league leader. Paint the ceiling and floor with windows, stage both derived columns, pin the zero-gap rung. The draft filtered the gap in the same SELECT that computed it.",
    ask: "One query: the top-rated supplier, with its gap to the ceiling and lift off the floor asserted.",
    template:
      "WITH s AS (SELECT name, rating, MAX(rating) OVER () AS top_r, MIN(rating) OVER () AS floor_r,\nRANK() OVER (ORDER BY rating {1}) AS rk FROM suppliers),\ng AS (SELECT name, rating, rk, ROUND(top_r - rating, 1) AS gap, ROUND(rating - floor_r, 1) AS lift FROM s)\nSELECT name, rating, rk, gap, lift FROM g WHERE gap = {2} AND lift = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "The card ranks best rating first, so DESC gives the leader rk 1. ASC would invert the league and pin Pacific's 3.9 at rk 1 — the floor wearing the ceiling's crown." },
      { answer: "0", kind: "number", label: "the asserted gap",
        why: "Probed gaps: 0, 0.2, 0.4, 0.7, 0.8, 0.9 — the leader's gap to its own ceiling is exactly 0, and it's the only zero in the league. The pin is the definition of 'top-rated' made mechanical." },
      { answer: "0.9", kind: "number", label: "the asserted lift",
        why: "Probed: Alpine Audio GmbH sits 0.9 above the 3.9 floor — the full spread of the league in one row, gap 0 and lift 0.9 at once. Pin 0.2 and the assert grabs Nordic's rung instead." },
    ],
    distractors: ["ASC", "0.2", "0.4"],
    walkthrough:
      "Two constant paints, one derived stage: MAX(rating) OVER () stamps the 4.8 ceiling and MIN(rating) OVER () the 3.9 floor on all six suppliers, and the middle CTE turns them into per-row readings — gap = ceiling − rating, lift = rating − floor. The pins then assert the leader algebraically: gap 0 and lift 0.9 can only both hold at the top rung, Alpine Audio GmbH, rk 1 under DESC. The probed gap ladder (0, 0.2, 0.4, 0.7, 0.8, 0.9) is exactly the spread the card prints. Flip the league to ASC and the same row reads rk 6 — the numbers survive, the story inverts. Note the shape: the derived columns live in their own CTE because a WHERE can't reference what its own SELECT computes.",
  },
  {
    id: "cs-1397",
    tier: "easy",
    topic: "w6",
    universe: "refund-audit",
    title: "The pending money podium",
    brief:
      "From: Refund desk lead. Re: the collection calls.\n\nThe collection queue folds the pending orders into per-customer exposure and ranks it — the desk works top-down. Pin the customer holding 1088.44 in limbo, with their pending order count printed beside them. The draft ranked before folding and got one row per order.",
    ask: "One query: the customer whose pending money ranks third, with their pending order count asserted.",
    template:
      "WITH p AS (SELECT customer_id, ROUND(SUM(total), 2) AS pend, COUNT(*) AS n\nFROM orders WHERE status = 'pending' GROUP BY customer_id),\nq AS (SELECT c.name, p.pend, p.n, RANK() OVER (ORDER BY p.pend {1}) AS rk\nFROM p JOIN customers c ON c.id = p.customer_id)\nSELECT name, pend, n, rk FROM q WHERE pend = {2} AND n = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the queue direction",
        why: "Collections work biggest exposure first, so DESC puts Emma's 1471.43 at rk 1. ASC would queue Keiko's 149 first — the desk calling the smallest balance in the book." },
      { answer: "1088.44", kind: "number", label: "the pinned exposure",
        why: "Probed: Farid Nasser holds exactly one pending order — the 1088.44 whale — third on the money ladder behind Emma 1471.43 and Chloe 1309.92. Pin 1471.43 and the assert grabs the queue's head instead." },
      { answer: "1", kind: "number", label: "the pending order count",
        why: "Probed: Farid's whole exposure is a single ticket — n = 1 — while Emma's 1471.43 spreads over 3 orders. The count printed beside the money is what tells the desk whether the call chases one parcel or three." },
    ],
    distractors: ["ASC", "1471.43", "3"],
    walkthrough:
      "Fold first, rank second, pin last: the CTE filters to the 14 pending orders and folds them into eight customers with their money and ticket counts (Emma 1471.43 over 3, Chloe 1309.92 over 2, Farid 1088.44 over 1 …), the ranking layer stamps RANK() OVER (ORDER BY pend DESC) across all eight rows, and only then does the outer pin filter. The rank lives one layer ahead of the pin because a WHERE can't see a window computed beside it — pinning at the same level would re-rank the survivors and hand the whale a fake rk 1. The pin asserts the third rung with its ticket count — 1088.44 at n = 1 — which is the row the desk actually dials: one whale, one call. Pin the head's money instead and the n = 1 assert empties the row, because Emma's 1471.43 rides three tickets. And the filter lives inside the stage on purpose: the fold only ever sees pending rows, so the league is pending money, not lifetime spend wearing a refunds hat.",
  },
  {
    id: "cs-1398",
    tier: "easy",
    topic: "w6",
    universe: "fraud",
    title: "The second whale's rung",
    brief:
      "From: Fraud desk. Re: the whale ladder.\n\nThe whale ladder numbers every order by size, biggest first, and the desk's case file cites the rung an order sits on. Order 43 is the ladder's second whale — pin its row with the rung printed beside it. The draft numbered the ladder ascending and cited rung 102.",
    ask: "One query: order 43's total with its rung on the descending size ladder.",
    template:
      "WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total {1}) AS rn FROM orders)\nSELECT id, total, status, rn FROM s WHERE id = {2} AND total = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "Whales are counted from the top, so the ladder sorts total DESC and order 43 lands on rung 2. ASC would number from the smallest ticket and put the same order at rung 102 — the case file citing a rung that means the opposite." },
      { answer: "43", kind: "number", label: "the pinned order",
        why: "Probed: order 43 holds 945.21 — Chloe Dubois's ticket, the ladder's second whale behind order 74's 1088.44. Pin 74 and the assert grabs the top of the ladder instead of the case file's row." },
      { answer: "945.21", kind: "number", label: "the asserted total",
        why: "Probed: 945.21 is order 43's exact total — second only to 1088.44 on the whole ladder, ahead of 845.92 and 826.03. The assert ties the row to the figure the case file quotes." },
    ],
    distractors: ["ASC", "74", "785.79"],
    walkthrough:
      "ROW_NUMBER() OVER (ORDER BY total DESC) numbers all 103 orders from the whale down — rung 1 is 1088.44, rung 2 is order 43's 945.21, and the probed ladder continues 845.92, 826.03, 785.79. The pin asserts both halves of the case-file citation: the id and the total, with the rung printed beside them so the file reads 'order 43, 945.21, rung 2' and anyone can re-run the check. Number the ladder ASC and the same order wears rung 102 — every number on the page flips to its mirror while the data stays put, which is exactly the kind of silent contradiction an audit exists to catch. The window never collapses anything: 103 rows in, 103 rows out, each wearing its rung.",
  },
  {
    id: "cs-1399",
    tier: "easy",
    topic: "w6",
    universe: "supplier",
    title: "The value league's floor",
    brief:
      "From: Procurement lead. Re: the shelf-value league.\n\nThe shelf-value league folds the catalog through its suppliers — each supplier's total product value, ranked — and the negotiation brief pins the floor rung: the supplier carrying the least value. Stage the league over the join, rank it, pin the floor. The draft ranked before folding and ranked garbage.",
    ask: "One query: the supplier holding the smallest shelf value, with its rank in the value league.",
    template:
      "WITH v AS (SELECT sup.name, ROUND(SUM(p.price), 2) AS value,\nRANK() OVER (ORDER BY SUM(p.price) {1}) AS rk\nFROM suppliers sup JOIN products p ON p.supplier_id = sup.id GROUP BY sup.id)\nSELECT name, value, rk FROM v WHERE value = {2} AND rk = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Value leagues read richest first, so DESC gives Nordic's 418.98 rk 1 and the floor lands at rk 6. ASC would crown the floor as if it were the leader — the brief would quote the weakest supplier as the benchmark." },
      { answer: "92.99", kind: "number", label: "the floor value",
        why: "Probed: Shenzhen Electro carries 92.99 in shelf value — the league floor, behind Pacific's 128.99 and Nordic's 418.98 at the top. Pin 418.98 and the assert grabs the leader instead of the floor." },
      { answer: "6", kind: "number", label: "the asserted rank",
        why: "Probed: six suppliers, all distinct values, so the floor is exactly rk 6 — the assert proves the pin grabbed the bottom and not a tie. rk 1 would mean the floor tied the leader, which it can't." },
    ],
    distractors: ["ASC", "418.98", "1"],
    walkthrough:
      "A window over a join: the stage joins suppliers to products, folds to six suppliers with GROUP BY sup.id, and ranks the folded values in the same breath — RANK() OVER (ORDER BY SUM(p.price) DESC) — because windows run after the fold. The probed league is Nordic 418.98, Midwest 224.49, Alpine 143.99, Andes 138.99, Pacific 128.99, Shenzhen 92.99: six distinct rungs, so the floor is unambiguously rk 6. The brief pins it with both the value and the rank asserted — negotiation language for 'this is the baseline, not the benchmark'. Run the league ASC and the floor prints rk 1, a one-word flip that would put the weakest shelf at the top of every slide.",
  },
  {
    id: "cs-1400",
    tier: "easy",
    topic: "w6",
    universe: "month-close",
    title: "The invoice ladder's basement",
    brief:
      "From: Controller. Re: the billing ladder.\n\nThe billing ladder numbers all 28 invoices by amount, biggest first, and the close checklist walks down to the basement row — the smallest invoice — to confirm the ladder reaches the floor. Stage the ladder with a window, pin rung 28. The draft numbered from the floor up and pinned the ceiling.",
    ask: "One query: the smallest invoice with its rung on the descending amount ladder.",
    template:
      "WITH l AS (SELECT id, number, status, ROUND(amount_cents / 100.0, 2) AS amt,\nROW_NUMBER() OVER (ORDER BY amount_cents {1}) AS rn FROM invoices)\nSELECT id, number, status, amt, rn FROM l WHERE rn = {2} AND amt = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "The ladder descends from the 6148 ceiling, so rung 28 is the floor. ASC would number from the smallest up and put 6148 at rung 28 — the checklist would certify the ceiling as the basement." },
      { answer: "28", kind: "number", label: "the basement rung",
        why: "Probed: 28 invoices, so the ladder's last rung is 28 — INV-2024-018 at 873, the only open invoice from October still unpaid. Pin 1 and the assert certifies the 6148 ceiling instead." },
      { answer: "873", kind: "number", label: "the floor amount",
        why: "Probed: 873 is the smallest invoice on the books — below the void 925 at rung 27 and the 1295 at rung 26. The assert ties the rung to the exact figure the close checklist quotes." },
    ],
    distractors: ["ASC", "1", "6148"],
    walkthrough:
      "The ladder is one window over one table: ROW_NUMBER() OVER (ORDER BY amount_cents DESC) numbers all 28 invoices from 6148 down to 873, and the pin walks to the basement — rung 28, INV-2024-018, the open 873 the checklist chases. The probed tail reads 1295 (rung 26), the void 925 (rung 27), then the floor — three rungs that tell the whole receivables story in order. Number the ladder ASC and every rung flips to its mirror: the ceiling wears 28, the floor wears 1, and the checklist certifies exactly the wrong invoice. ROW_NUMBER is the right dealer here because amounts never tie on this ladder — every rung holds exactly one invoice.",
  },
  {
    id: "cs-1401",
    tier: "medium",
    topic: "w6",
    universe: "growth",
    title: "Above their own average",
    brief:
      "From: Growth lead. Re: the concentration memo.\n\nThe concentration memo flags customers whose lifetime spend beats the customer-wide average — the average itself painted by a window over the grouped spend. Pin the poorest customer who still clears the bar, with the bar printed beside them. The draft put the window straight in WHERE and the engine refused it verbatim.",
    ask: "One query: the lowest spender above the customer-wide mean, with that mean asserted.",
    template:
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,\nROUND({1}(SUM(o.total)) OVER (), 2) AS mean\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)\nSELECT name, spend, mean FROM s WHERE spend > mean AND spend = {2} AND mean = {3};",
    slots: [
      { answer: "AVG", kind: "keyword", label: "the mean painter",
        why: "AVG(SUM(o.total)) OVER () is the window-over-aggregate mean: it averages the sixteen folded spends and paints 2177.08 on every row. MAX(SUM(o.total)) OVER () would paint 7262.35 — Alice's own spend — and nobody beats the leader, so the flag list empties." },
      { answer: "2667.93", kind: "number", label: "the lowest above-mean spend",
        why: "Probed: five of the sixteen spenders clear 2177.08, and the poorest of them is Chloe at 2667.93 — the memo's floor case. Pin 1686.17 and the assert grabs Pedro, the biggest spender who still falls short of the bar." },
      { answer: "2177.08", kind: "number", label: "the asserted mean",
        why: "Probed: the sixteen spends average 2177.08 — the bar the memo quotes. 8708.32 is the region-level mean, a different denominator printed on the wrong memo." },
    ],
    distractors: ["MAX", "1686.17", "8708.32"],
    walkthrough:
      "Windows layer over aggregates here twice over: GROUP BY c.id folds 103 orders into sixteen spends, and AVG(SUM(o.total)) OVER () averages those folded spends — 2177.08 — painting the bar onto every row. Only then does the outer WHERE compare against it, because a window can't be filtered where it's computed; try it same-level and the engine says 'misuse of window function AVG()' shape-for-shape. The probed cut: five spenders clear the bar, from Chloe's 2667.93 up to Alice's 7262.35, while Pedro's 1686.17 is the biggest figure that misses. Pinning Pedro's number proves the assert works both ways — below the bar, the row vanishes. The mean printed beside the member is what makes the memo auditable: bar and case on one line.",
  },
  {
    id: "cs-1402",
    tier: "medium",
    topic: "w6",
    universe: "fraud",
    title: "The champions' global league",
    brief:
      "From: Fraud desk. Re: the per-status leaderboard.\n\nThe desk's review takes each status's biggest order — the pending champion, the shipped champion, and so on — then ranks those four champions against each other globally. Two windows, two layers: ROW_NUMBER picks the champions inside the stage, RANK orders them outside. Pin the global rung-1 champion. The draft ran one window and got 103 rows.",
    ask: "One query: the biggest single order among the four per-status champions, with its global rank.",
    template:
      "WITH c AS (SELECT status, id, total, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) AS rn FROM orders),\ng AS (SELECT status, id, total, RANK() OVER (ORDER BY total {1}) AS rk FROM c WHERE rn = {2})\nSELECT status, id, total, rk FROM g WHERE total = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the global league direction",
        why: "Champions are ranked biggest first, so DESC crowns the largest champion. ASC would rank the four champions from the smallest up and hand rung 1 to cancelled's 397.99 — the weakest ticket wearing the gold." },
      { answer: "1", kind: "number", label: "the champion filter",
        why: "rn = 1 keeps exactly one order per status — the four champions (pending 1088.44, shipped 845.92, delivered 752.96, cancelled 397.99, probed). Pin 2 and the stage keeps every status's runner-up instead." },
      { answer: "1088.44", kind: "number", label: "the champion total",
        why: "Probed: the pending champion is order 74 at 1088.44 — the store's biggest ticket anywhere, so it tops the champions' league at global rk 1. 845.92 is the shipped champion, a different rung." },
    ],
    distractors: ["ASC", "845.92", "39"],
    walkthrough:
      "Two windows, two jobs, one pipeline: inside the stage, ROW_NUMBER() OVER (PARTITION BY status ORDER BY total DESC, id) deals each status's rows and rn = 1 keeps the four champions — pending's 1088.44, shipped's 845.92, delivered's 752.96, cancelled's 397.99. One layer up, RANK() OVER (ORDER BY total DESC) ranks those survivors globally — staged before the total pin, because a WHERE beside the window would re-rank the filtered survivor to a fake rk 1 — and the probed league is exactly the champion ladder: 1088.44 at rk 1 down to 397.99 at rk 4. The pin asserts the head of that league with the status printed beside it — the review's headline is that the store's biggest ticket is stuck in pending. Filter rn inside the stage's own SELECT and the engine refuses it ('misuse of aliased window function rn'); the two-layer shape isn't style, it's the law.",
  },
  {
    id: "cs-1403",
    tier: "medium",
    topic: "w6",
    universe: "month-close",
    title: "The pot that rides every row",
    brief:
      "From: Controller. Re: the status page's grand-total line.\n\nThe close binder's status page must print the lifetime storewide total — 34833.28 — beside every status pot, so each row shows its slice of the same whole. That's the window-over-aggregate grand paint: SUM of the folded pots, stamped on all four rows. Pin the pending row with the paint asserted. The draft used the raw pot and the paint read 6113.",
    ask: "One query: the pending pot with the storewide grand total painted onto its row.",
    template:
      "WITH s AS (SELECT status, ROUND(SUM(total), 2) AS pot, {1}(SUM(total)) OVER () AS grand\nFROM orders GROUP BY status)\nSELECT status, pot, ROUND(grand, 2) AS grand FROM s WHERE pot = {2} AND grand = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the grand painter",
        why: "SUM(SUM(total)) OVER () sums the four folded pots and paints 34833.28 — the lifetime store — onto every row. MAX(SUM(total)) OVER () would paint 15571.07, delivered's own pot, so each row would be measured against the leader instead of the whole." },
      { answer: "6113", kind: "number", label: "the pending pot pin",
        why: "Probed: pending holds 6113 across 14 orders — the row the status page highlights, with cancelled's 1152.49 as the floor. Pin 1152.49 and the assert grabs the cancelled row instead." },
      { answer: "34833.28", kind: "number", label: "the painted grand total",
        why: "Probed: the four pots sum to 34833.28 — the same lifetime figure the revenue walk lands on — and the window paints it identically on all four rows. The assert proves the paint didn't collapse to one pot." },
    ],
    distractors: ["COUNT", "MAX", "1152.49"],
    walkthrough:
      "The grand paint is the canonical window-over-aggregate: GROUP BY status folds 103 orders into four pots (15571.07, 11996.72, 6113, 1152.49), and SUM(SUM(total)) OVER () — a window over the folded rows — adds them up again and stamps 34833.28 on every one. The page can then show each pot beside the whole it belongs to; the pin asserts pending's 6113 with the paint riding the same row. MAX as the painter stamps the biggest pot instead — every status would be 'measured' against delivered's 15571.07, a leaderboard wearing a total's costume. COUNT would paint 4, the number of pots. And the painted figure reconciles with the plain storewide SUM to the cent: if it didn't, the fold would be leaking rows.",
  },
  {
    id: "cs-1404",
    tier: "medium",
    topic: "w6",
    universe: "refund-audit",
    title: "Re-based on the exposure king",
    brief:
      "From: Refund desk lead. Re: the exposure memo's re-base.\n\nThe desk's memo re-bases every at-risk customer against the biggest exposure — 'share of the worst case' — so the king reads 100 and everyone else reads against them. That's a MAX pot over the grouped exposure, staged before the pin. Pin Chloe's re-based row. The draft divided by the SUM and the memo's percentages halved.",
    ask: "One query: the exposure customer reading 81.1 when re-based on the worst case.",
    template:
      "WITH x AS (SELECT c.name, ROUND(SUM(o.total), 2) AS exposure, {1}(SUM(o.total)) OVER () AS top\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ('cancelled', 'pending') GROUP BY c.id),\nr AS (SELECT name, exposure, ROUND(100.0 * exposure / top, 1) AS rebased FROM x)\nSELECT name, exposure, rebased FROM r WHERE rebased = {2} AND exposure = {3};",
    slots: [
      { answer: "MAX", kind: "keyword", label: "the worst-case painter",
        why: "MAX(SUM(o.total)) OVER () paints 1615.29 — Emma's exposure, the worst case — onto every folded row, so each share reads against the king. SUM(SUM(o.total)) OVER () would paint 7265.49, the whole at-risk pot, and every re-based figure would drop to share-of-pot instead." },
      { answer: "81.1", kind: "number", label: "the asserted rebase",
        why: "Probed: Chloe's 1309.92 re-based on 1615.29 reads 81.1 — second to the king's own 100, ahead of Alice's 79.5. The pin is the memo's line for '82% of the worst case'." },
      { answer: "1309.92", kind: "number", label: "the pinned exposure",
        why: "Probed: 1309.92 is Chloe's at-risk money across cancelled and pending orders — the raw figure the rebase divides. 1615.29 would pin Emma, whose row reads 100 by definition." },
    ],
    distractors: ["SUM", "100", "1615.29"],
    walkthrough:
      "Two painters, two different memos: SUM(SUM(o.total)) OVER () builds share-of-pot (Emma 22.2, Chloe 18.0 …), while MAX(SUM(o.total)) OVER () builds share-of-worst-case — every customer measured against Emma's 1615.29, the probed king. The desk's re-base wants the second: the king reads 100, Chloe reads 81.1, Alice 79.5, and the pin asserts the 81.1 line with the raw 1309.92 printed beside it so the memo shows both the ratio and the money. The stage keeps the window over the filtered, folded rows — cancelled plus pending only — so the pot is the at-risk crowd, not the whole store. Divide by the SUM painter and the same rows print 22.2/18.0/17.7: a legitimate report answering a different question, which is exactly how re-bases go quietly wrong.",
  },
  {
    id: "cs-1405",
    tier: "medium",
    topic: "w6",
    universe: "supplier",
    title: "The double crown audit",
    brief:
      "From: Procurement lead. Re: the divergence audit.\n\nThe audit hunts suppliers who top one league and sink in the other: rank every supplier by stock pile and by shelf value in the same query — two windows over one fold — and pin the supplier holding both crowns under the audit's directions. The draft ranked both leagues descending and missed the flip.",
    ask: "One query: the supplier that leads the stock league and the cheapest-first value league at once.",
    template:
      "WITH s AS (SELECT sup.name, SUM(p.stock) AS stock_sum, ROUND(SUM(p.price), 2) AS value,\nRANK() OVER (ORDER BY SUM(p.stock) {1}) AS stock_rk,\nRANK() OVER (ORDER BY SUM(p.price) {2}) AS value_rk\nFROM suppliers sup JOIN products p ON p.supplier_id = sup.id GROUP BY sup.id)\nSELECT name, stock_sum, value, stock_rk, value_rk FROM s WHERE stock_sum = {3} AND value_rk = 1;",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the stock league direction",
        why: "The depth league reads deepest first, so DESC makes the 850-unit pile stock_rk 1. ASC would run it floor-first and the same pile would read stock_rk 6 — the audit's headline row would vanish." },
      { answer: "ASC", kind: "keyword", label: "the value league direction",
        why: "The audit's second crown is 'cheapest shelf first', so the value league runs ASC and Shenzhen's 92.99 takes value_rk 1. DESC would rank it 6 — the divergence disappears and the audit finds nothing." },
      { answer: "850", kind: "number", label: "the double-crown pile",
        why: "Probed: Shenzhen Electro holds the deepest pile, 850 units, worth only 92.99 — stock_rk 1 and value_rk 1 under the audit's directions at once. Pin 230 and the assert grabs Nordic, the exact inverse (deepest value, thinnest pile)." },
    ],
    distractors: ["6", "230", "460"],
    walkthrough:
      "Two windows over one fold, and the directions are the audit: RANK() OVER (ORDER BY SUM(p.stock) DESC) crowns the deepest pile, RANK() OVER (ORDER BY SUM(p.price) ASC) crowns the cheapest shelf — and the probed winner of both is Shenzhen Electro, 850 units worth 92.99, a supplier shipping volume at pocket-money prices. The probed league table makes the divergence stark: Shenzhen is stock_rk 1 / value_rk 6 in the ordinary descending read, which is the same fact seen from the other end. The pin asserts the 850 pile with the value crown hardcoded at 1, so any direction flip empties the row. Nordic is the mirror image — 418.98 of value on a 230-unit pile — and the audit brief quotes both ends of the divergence.",
  },
  {
    id: "cs-1406",
    tier: "medium",
    topic: "w6",
    universe: "expense",
    title: "The burn-to-earn ratio board",
    brief:
      "From: Finance partner. Re: the burn board.\n\nThe burn board joins two staged month tables — revenue from orders, opex from expenses — and ranks the ratio opex/revenue, worst first. It's a window over a JOIN of two CTEs, and the pin grabs July. The draft sliced the expense dates with the orders' timestamp column and the join came back empty.",
    ask: "One query: the month where operating expenses ran furthest above revenue, with its ratio ranked.",
    template:
      "WITH r AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon),\ne AS (SELECT strftime('%Y-%m', {1}) AS mon, SUM(amount_cents) / 100.0 AS opex FROM expenses GROUP BY mon),\nj AS (SELECT r.mon, ROUND(100.0 * e.opex / r.rev, 1) AS ratio, RANK() OVER (ORDER BY e.opex / r.rev {2}) AS rk\nFROM r JOIN e ON e.mon = r.mon)\nSELECT mon, ratio, rk FROM j WHERE mon = {3};",
    slots: [
      { answer: "spent_on", kind: "keyword", label: "the expense date column",
        why: "Expenses are dated by spent_on — the slicer that fills the opex side of the join. created_at doesn't exist on expenses: the engine refuses the query outright, which is the draft's exact failure." },
      { answer: "DESC", kind: "keyword", label: "the burn ranking direction",
        why: "Worst burn first means the highest ratio takes rk 1, so DESC — probed, 2024-07 leads at 150.3 (opex 1794 against revenue 1193.86). ASC would rank thrift: February's 39.9 takes rk 1 and July sinks to rung 14." },
      { answer: "'2024-07'", kind: "keyword", label: "the pinned month",
        why: "Probed: 2024-07 is the burn board's headline — ratio 150.3, the only month where opex ran half again above revenue. '2024-08' pins the runner-up at 136.5 instead." },
    ],
    distractors: ["ASC", "created_at", "'2024-08'"],
    walkthrough:
      "A window over a join of two staged tables: r folds orders into 14 revenue months, e folds expenses into 14 opex months on its own date column, the join stitches them mon-to-mon, and the stitched board is ranked in its own CTE — RANK() OVER (ORDER BY e.opex / r.rev DESC) runs across all fourteen joined months before the month pin filters, because a WHERE beside the window would re-rank the lone survivor to a fake rk 1. The probed board: 2024-07 at 150.3, 2024-08 at 136.5, 2024-11 at 119.7, 2025-01 at 117.3, with February's 39.9 the thriftiest month in the book. The pin asserts the headline row with its ratio printed beside it. Slice expenses with created_at and the stage dies before the join — there is no such column on expenses — which is the pipeline's most common failure and the reason the date column gets a slot of its own.",
  },
  {
    id: "cs-1407",
    tier: "medium",
    topic: "w6",
    universe: "funnel",
    title: "The cohort revenue league",
    brief:
      "From: Growth analyst. Re: the cohort slide.\n\nThe cohort slide folds every customer into the month of their first order, sums each cohort's revenue, and ranks the leagues — with each league's share of lifetime revenue painted beside it. Two folds deep, then the window layer. Pin the biggest cohort. The draft folded on MAX(created_at) and built last-purchase clubs instead.",
    ask: "One query: the first-order cohort holding the biggest revenue share, ranked with its share asserted.",
    template:
      "WITH f AS (SELECT customer_id, strftime('%Y-%m', MIN(created_at)) AS cohort, SUM(total) AS spend FROM orders GROUP BY customer_id),\nc AS (SELECT cohort, COUNT(*) AS members, ROUND(SUM(spend), 2) AS rev FROM f GROUP BY cohort)\nSELECT cohort, members, rev, share, rk FROM (SELECT cohort, members, rev,\nROUND(100.0 * rev / {1}, 1) AS share, RANK() OVER (ORDER BY rev {2}) AS rk FROM c) WHERE rk = {3};",
    slots: [
      { answer: "SUM(rev) OVER ()", kind: "keyword", label: "the lifetime revenue pot",
        why: "SUM(rev) OVER () paints the seven cohorts' combined 34833.28 onto every league row, so each share divides by lifetime revenue. MAX(rev) OVER () would re-base everything on the leader's 20086.08 and read the top cohort at 100 — share-of-champion, not share-of-store." },
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Biggest cohort first, so DESC crowns 2024-01 at rk 1. ASC would run the league from the smallest and crown the 2025-01 singleton's 444.8 — the slide's headline would be its weakest cohort." },
      { answer: "1", kind: "number", label: "the pinned league rank",
        why: "Probed: the 2024-01 cohort — five members — holds 20086.08, a 57.7 share, clear of 2024-02's 5672.83 at rk 2. Pin 2 and the slide leads with the runner-up cohort." },
    ],
    distractors: ["MAX(rev) OVER ()", "ASC", "2"],
    walkthrough:
      "Two folds, then the window: f buckets each customer's orders by their first-order month (MIN(created_at) — the cohort key), c folds those buckets into seven leagues with member counts and revenue, and the outer layer paints SUM(rev) OVER () — 34833.28, reconciling to the lifetime figure to the cent — before ranking. The probed league: 2024-01's five customers hold 20086.08 (57.7), 2024-02's pair holds 5672.83 (16.3), down to 2025-01's lone 444.8 (1.3). The pin asserts the headline cohort with members, money and share printed together. Re-base on MAX(rev) OVER () instead and the slide silently becomes 'share of the champion' — the top cohort reads 100 and the runner-up 28.2 — a true-looking slide about the wrong denominator.",
  },
  {
    id: "cs-1408",
    tier: "medium",
    topic: "w6",
    universe: "pricing",
    title: "The top-eight boundary row",
    brief:
      "From: Merchandising lead. Re: the premium-shelf cut.\n\nThe shelf cut numbers every product by price, biggest first, and draws the premium boundary at rung 8 — then prints each rung's share of the total shelf pot so the boundary row shows what the cut leaves out. Stage the ladder and the share, pin the boundary. The draft cut at 8 inside the stage and the pot collapsed.",
    ask: "One query: rung 8 on the descending price ladder with its share of the shelf pot asserted.",
    template:
      "WITH s AS (SELECT name, price, ROW_NUMBER() OVER (ORDER BY price {1}) AS rn,\nROUND(100.0 * price / SUM(price) OVER (), 1) AS share FROM products)\nSELECT name, price, rn, share FROM s WHERE rn = {2} AND share = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "The premium cut counts down from the 199.99 ceiling, so rung 8 is the boundary of the expensive end. ASC would number from the 14.99 floor and rung 8 would be a 34.50 mid-shelf item — the boundary would sit in the bargain bin." },
      { answer: "8", kind: "number", label: "the boundary rung",
        why: "Probed: rung 8 is the Bluetooth Speaker Mini at 59.99 — the last product inside the premium eight, with the probed ladder running 199.99, 149.99, 129 … down to it. Pin 1 and the assert grabs the ceiling instead of the boundary." },
      { answer: "5.2", kind: "number", label: "the boundary share",
        why: "Probed: 59.99 is 5.2 of the 1148.43 shelf pot — the figure the cut prints on the boundary row. 17.4 is the ceiling's own share, two rows of the ladder away." },
    ],
    distractors: ["ASC", "1", "17.4"],
    walkthrough:
      "One stage, two window outputs: ROW_NUMBER() OVER (ORDER BY price DESC) numbers the ladder, and SUM(price) OVER () paints the 1148.43 pot so every rung carries its share of the shelf — 17.4 at the ceiling, 5.2 at the boundary, 1.3 at the floor. The cut lives in the outer WHERE, not the stage: filtering inside would shrink the pot to the kept rows and every share would read a self-referential 100 (the exact collapse this wave's probes document). The pin asserts rung 8 with its share — the boundary row the merchandising deck quotes as 'everything below this is the long tail'. Flip the ladder and rung 8 becomes a 34.50 accessory; the cut is now a floor, not a ceiling, and the premium eight are nowhere in the output.",
  },
  {
    id: "cs-1409",
    tier: "medium",
    topic: "w6",
    universe: "inventory",
    title: "The thin-shelf cut, staged",
    brief:
      "From: Ops manager. Re: the restock triage.\n\nThe triage numbers the shelves thinnest-first and cuts the top three for immediate restock — but only those still under a hard 100-unit ceiling, so a deep shelf can never sneak into the cut. Stage the ladder, apply both filters outside it. The draft put the row-number filter in the stage's WHERE and the engine refused it.",
    ask: "One query: the three thinnest shelves under 100 units, staged and cut outside the window.",
    template:
      "WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock {1}) AS rn FROM products)\nSELECT name, stock, rn FROM s WHERE rn <= {2} AND stock < {3};",
    slots: [
      { answer: "ASC", kind: "keyword", label: "the triage direction",
        why: "Restock triage counts up from the thinnest shelf, so ASC puts the 40-unit Smart Watch at rn 1. DESC would number from HDMI's 500 and the 'top three' would be the deepest shelves in the building." },
      { answer: "3", kind: "number", label: "the cut size",
        why: "Probed: the ASC ladder opens 40, 45, 60 (Smart Watch, Desktop Mic, Headset) — the three shelves the triage keeps. A cut of 1 would leave only the Smart Watch on the sheet." },
      { answer: "100", kind: "number", noVerify: true, label: "the hard ceiling",
        why: "The 100-unit ceiling is the triage's guard rail — probed, all three cut shelves (40/45/60) sit under it, and it excludes nothing here only because the ladder already starts thin. It's a threshold literal, never printed in the result cells." },
    ],
    distractors: ["DESC", "1", "50"],
    walkthrough:
      "A rank-then-filter pipeline with a second guard: the stage numbers all sixteen shelves thinnest-first (40, 45, 60, 70, 85, 95 …), and the outer WHERE applies both cuts — rn <= 3 takes the top three rungs, stock < 100 is the hard ceiling that would keep a deep shelf out of the restock queue even if it ranked high. The filters must live outside the stage because a window can't be filtered at its own level; the engine refuses the same-level spelling verbatim. Tighten the ceiling to 50 and the cut sheds the Headset's 60, leaving two shelves — the guard rail doing real work on a different day's data. Widen the cut to 50 and the sheet keeps every thin shelf in the building. Two filters, one ladder, zero window-in-WHERE.",
  },
  {
    id: "cs-1410",
    tier: "medium",
    topic: "w6",
    universe: "catalog",
    title: "The seven shelf champions",
    brief:
      "From: Merchandising lead. Re: the category champions wall.\n\nThe champions wall shows the priciest product in each of the seven categories — one ROW_NUMBER partitioned by category inside the stage, rn = 1 outside it. Pin the Audio champion with its price asserted. The draft partitioned by name and built a wall of sixteen 'champions'.",
    ask: "One query: each category's priciest product, pinned to the Audio shelf's champion.",
    template:
      "WITH s AS (SELECT category, name, price, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price {1}) AS rn FROM products)\nSELECT category, name, price, rn FROM s WHERE rn = {2} AND price = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the champion direction",
        why: "Champions are the priciest per shelf, so the partition's ladder runs price DESC and the Headset's 149.99 takes Audio's rn 1. ASC would crown each shelf's cheapest product and hand Audio's crown to the 59.99 speaker." },
      { answer: "1", kind: "number", label: "the champion filter",
        why: "rn = 1 keeps exactly one row per category — seven champions from sixteen products, probed. Pin 2 and the wall displays every shelf's runner-up instead, seven different products with the same claim to the wall." },
      { answer: "149.99", kind: "number", label: "the Audio champion's price",
        why: "Probed: the Noise-Canceling Headset tops the Audio shelf at 149.99, ahead of the 119 mic and 59.99 speaker. 199.99 is Wearables' champion — a different shelf's crown." },
    ],
    distractors: ["ASC", "2", "199.99"],
    walkthrough:
      "PARTITION BY is GROUP BY's segmentation without the collapsing: the stage keeps all sixteen products, but ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) deals each shelf its own ladder, and rn = 1 outside the window keeps one champion per shelf — Audio's Headset 149.99, Wearables' Smart Watch 199.99, and five more, probed from the catalog. The pin grabs the Audio row with its price asserted so the wall's caption can quote it. Partition by name instead and every product becomes its own league of one — sixteen 'champions', the wall's whole premise dissolved. And the direction flip is silent: ASC runs legally, crowns the cheapest shelf member, and only the price pin betrays that the wall is now an economy display.",
  },
  {
    id: "cs-1411",
    tier: "medium",
    topic: "w6",
    universe: "fraud",
    title: "The five-biggest cut",
    brief:
      "From: Fraud desk. Re: the manual-review cut.\n\nThe desk's manual-review queue takes the five biggest orders on the size ladder — and the case file asserts order 57 sits on the cut's last rung. Stage the ladder, then pin that rung and its total outside the window. The analyst's draft cut inside the stage and the engine refused the query.",
    ask: "One query: the fifth-biggest order with its rung on the size ladder asserted.",
    template:
      "WITH s AS (SELECT id, total, status, ROW_NUMBER() OVER (ORDER BY total {1}) AS rn FROM orders)\nSELECT id, total, status, rn FROM s WHERE rn = {2} AND total = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the ladder direction",
        why: "The review queue counts down from the 1088.44 whale, so rung 5 is the cut's boundary. ASC would count up from the 25.47 floor and the 'five biggest' would be the five smallest tickets in the store." },
      { answer: "5", kind: "number", label: "the boundary rung",
        why: "Probed ladder: 1088.44, 945.21, 845.92, 826.03, 785.79 — the five orders the desk reviews by hand, with 785.79 on rung 5. Pin 4 and the double assert empties: rung 4 carries 826.03, not the boundary total." },
      { answer: "785.79", kind: "number", label: "the boundary total",
        why: "Probed: order 57 (Emma Wilson's, shipped) holds 785.79 — the fifth rung, the cut's last seat. 767.64 misses the cut: it's Alice's best order, and it would empty the assert." },
    ],
    distractors: ["ASC", "4", "767.64"],
    walkthrough:
      "The classic rank-then-pin pipeline: the stage numbers all 103 orders by size DESC, and the outer WHERE pins the cut's last seat — rn = 5, the boundary of the probed whale ladder (1088.44, 945.21, 845.92, 826.03, 785.79) — with the boundary total asserted beside it so the case file cites a figure the query can reproduce. The instructive near-miss is 767.64: a big number, but Alice's best order — and it misses the global cut, which is precisely the difference between 'big for this customer' and 'big for the store' that the manual-review queue exists to enforce; pinned as the total it empties the assert. Tighten the pin to rung 4 and the assert empties too, because rung 4 carries 826.03 — the desk knows the file changed.",
  },
  {
    id: "cs-1412",
    tier: "medium",
    topic: "w6",
    universe: "month-close",
    title: "The payment mix, painted",
    brief:
      "From: Controller. Re: the treasury mix line.\n\nThe treasury line folds payments by method and prints each method's share of settled money, painted by a window over the fold. Pin the card row with its share asserted. The draft aggregated with COUNT and printed headcounts as money.",
    ask: "One query: the card method's share of settled payment money, with its count and total printed.",
    template:
      "WITH m AS (SELECT method, COUNT(*) AS n, {1}(amount_cents) AS cents FROM payments GROUP BY method),\np AS (SELECT method, n, ROUND(cents / 100.0, 2) AS paid,\nROUND({2} * cents / SUM(cents) OVER (), 1) AS pct FROM m)\nSELECT method, n, paid, pct FROM p WHERE pct = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the money aggregator",
        why: "Settled money is a sum: SUM(amount_cents) folds the card money to 37364 once the stage divides by 100 (wire reads 32248) — probed. COUNT(amount_cents) would fold to 16 and 11, headcounts that print as 0.16 and 0.11 dollars once divided by 100." },
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Shares are quoted in percent, so the ratio scales by 100.0 — probed, card reads 53.7 against wire's 46.3. Scale by 10.0 and the treasury line prints 5.4, a fraction nobody reconciles against." },
      { answer: "53.7", kind: "number", label: "the card share pin",
        why: "Probed: card carries 37364 of the 69612 settled — 53.7 — ahead of wire's 46.3. The pin asserts the majority method the treasury line headlines." },
    ],
    distractors: ["COUNT", "10.0", "46.3"],
    walkthrough:
      "The window rides the fold twice, staged one layer apart: GROUP BY method folds 27 payments into two rows and SUM(amount_cents) does the money fold in the stage, then the second CTE paints SUM(cents) OVER () — the 69612 combined pot — so each method's share divides by the whole: card 53.7, wire 46.3, probed to the decimal. The pin asserts the card row with its headcount and dollar total printed beside the share, so the treasury line shows all three readings at once. COUNT as the folder is the classic corruption: the shares re-compute over headcounts (59.3/40.7, since 16 of 27 payments are card) and the money column prints 0.16 — correct arithmetic answering a question nobody asked. The scale slot is the last guard: percents or fractions, and the pin knows which.",
  },
  {
    id: "cs-1413",
    tier: "hard",
    topic: "w6",
    universe: "growth",
    title: "Behind the spend crown",
    brief:
      "From: Growth lead. Re: the chase list.\n\nThe chase list measures every customer by the gap to the crown — the leader's spend painted onto every row by a window over the fold, each row showing what it trails by. Pin the runner-up's row: the customer with exactly 621.79 to make up. The draft painted the lifetime total instead of the crown and every gap exploded.",
    ask: "One query: the customer trailing the spend leader by exactly 621.79, with the crown painted on their row.",
    template:
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,\nROUND({1}(SUM(o.total)) OVER (), 2) AS top\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id),\ng AS (SELECT name, spend, ROUND(top - spend, 2) AS behind FROM s)\nSELECT name, spend, behind FROM g WHERE behind = {2} AND spend = {3};",
    slots: [
      { answer: "MAX", kind: "keyword", label: "the crown painter",
        why: "MAX(SUM(o.total)) OVER () paints 7262.35 — Alice's league-topping spend — onto every row, so each gap reads against the crown. SUM(SUM(o.total)) OVER () would paint 34833.28 and every 'gap' would be the whole store minus one customer — figures nobody chases." },
      { answer: "621.79", kind: "number", label: "the asserted gap",
        why: "Probed: Emma Wilson's 6640.56 trails the crown by exactly 621.79 — the chase list's headline, with Grace's 2688.12 the next name down. Pin 0 and the assert grabs the crown herself, whose gap is zero by definition." },
      { answer: "6640.56", kind: "number", label: "the runner-up's spend",
        why: "Probed: 6640.56 is Emma's lifetime figure — second on the sixteen-row league, the row the chase list pins. 7262.35 is the crown's own figure; pinned together the asserts contradict and the row empties." },
    ],
    distractors: ["SUM", "0", "7262.35"],
    walkthrough:
      "The crown is a constant paint: MAX(SUM(o.total)) OVER () folds the league first (sixteen spends via GROUP BY c.id), finds Alice's 7262.35, and stamps it on every row; the derived stage subtracts to get each customer's deficit — probed ladder 0, 621.79, 2688.12, 3617.79, 4594.42 down the board. The pin asserts the runner-up with both her spend and her gap, because the chase list quotes the pair ('6640.56, 621.79 back'). Paint the whole-store total instead and the 'gaps' become 34833.28 minus each spend — numbers with no chase in them, the arithmetic of a different report. The zero-gap rung is the crown's own row, and the double assert is what keeps the pin off it: spend 6640.56 and gap 0 cannot both hold.",
  },
  {
    id: "cs-1414",
    tier: "hard",
    topic: "w6",
    universe: "expense",
    title: "The leanest burn month",
    brief:
      "From: Finance partner. Re: the thrift spotlight.\n\nThe thrift spotlight ranks the fourteen expense months by spend ascending — leanest first — and prints each month's share of the annual 25416 pot beside it, painted by a window over the staged buckets. Pin the leanest month. The draft ranked descending and spotlighted the August spike instead.",
    ask: "One query: the leanest expense month with its share of the annual burn pot asserted.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),\nr AS (SELECT mo, spend, ROUND(100.0 * spend / {1}, 1) AS pct,\nRANK() OVER (ORDER BY spend {2}) AS rk FROM m)\nSELECT mo, spend, pct, rk FROM r WHERE rk = {3};",
    slots: [
      { answer: "SUM(spend) OVER ()", kind: "keyword", label: "the annual burn pot",
        why: "SUM(spend) OVER () paints the fourteen buckets' 25416 — the annual burn — onto every row, so each share divides by the whole year. MAX(spend) OVER () would paint 3210 and the leanest month would read 44.9 — a share of the spike, not of the year." },
      { answer: "ASC", kind: "keyword", label: "the thrift direction",
        why: "Leanest first means the window sorts spend ASC and February takes rk 1. DESC would rank big spend first and crown 2024-08's 3210 spike — the thrift spotlight leading with the worst month." },
      { answer: "1", kind: "number", label: "the leanest rank pin",
        why: "Probed: 2024-02 is the leanest bucket at 1440 — below March's 1917 and every other month — so rk 1 under ASC is uniquely February's. The share beside it reads 5.7 of the annual pot." },
    ],
    distractors: ["MAX(spend) OVER ()", "DESC", "3210"],
    walkthrough:
      "Stage, paint, rank, pin — four layers in four lines: the buckets fold 36 expense rows into fourteen months (slice on spent_on, the expense date column), SUM(spend) OVER () paints the 25416 annual pot, RANK() OVER (ORDER BY spend ASC) deals the thrift positions, and the pin keeps rk 1: February 2024, 1440, a probed 5.7 of the year. The share is computed inside the stage from the painted pot, so filtering rk outside never touches the denominator — the staging law this wave keeps teaching. DESC re-runs the same query as an indulgence report: rk 1 becomes the 3210 August spike at 12.6. And MAX as the pot re-bases every share on the biggest month — a thrift metric that measures months against the worst one, which is exactly backwards.",
  },
  {
    id: "cs-1415",
    tier: "hard",
    topic: "w6",
    universe: "supplier",
    title: "The pile cut at rank four",
    brief:
      "From: Procurement lead. Re: the depth league's tie.\n\nThe depth league ranks suppliers by stock pile, and the audit's cut is rank 4 — which this quarter is a genuine tie: two suppliers hold exactly 305 units and share the rung. Stage the league over the join, rank it, pin the tie. The draft used ROW_NUMBER and the audit lost one of the two tied rows.",
    ask: "One query: every supplier sitting at rank 4 in the descending stock-pile league, pile asserted.",
    template:
      "WITH p AS (SELECT sup.name, SUM(p.stock) AS pile,\nRANK() OVER (ORDER BY SUM(p.stock) {1}) AS rk\nFROM products p JOIN suppliers sup ON sup.id = p.supplier_id GROUP BY sup.id)\nSELECT name, pile, rk FROM p WHERE rk = {2} AND pile = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the depth league direction",
        why: "Depth reads deepest first, so DESC puts 850 at rk 1 and the 305 pair at the shared rk 4. ASC would number from Nordic's 230 and hand rk 4 to Midwest's 460 — a different supplier wearing the audit's rung." },
      { answer: "4", kind: "number", label: "the audited rung",
        why: "Probed: rank 4 is held twice — Alpine and Andes both fold to 305 units, behind 850/695/460 and ahead of Nordic's 230. Pin 1 and the assert grabs Shenzhen's pile instead of the tie." },
      { answer: "305", kind: "number", label: "the tied pile",
        why: "Probed: 305 is the exact figure both tied suppliers carry — the pin's equality is what lets both rows through, since the filter runs on the pile and not on a fabricated tiebreak. 460 would pin Midwest alone, one rung above the tie." },
    ],
    distractors: ["ASC", "1", "460"],
    walkthrough:
      "The tie is the lesson: RANK() OVER (ORDER BY SUM(p.stock) DESC) deals positions by value, so Alpine's 305 and Andes's 305 both land on rk 4 and the next rung skips to 6 — the gap arithmetic of a genuine tie, probed across the six-supplier league (850, 695, 460, 305, 305, 230). The pin filters on the pile itself, 305, so both tied rows survive the cut and the audit sees the whole rung. ROW_NUMBER as the dealer would break the tie arbitrarily — one 305 survives, one vanishes, and the audit silently undercounts its own cut. Flip to ASC and rk 4 belongs to Midwest's 460, a single unambiguous row: the direction slot is what decides whether rung 4 is a tie at all.",
  },
  {
    id: "cs-1416",
    tier: "hard",
    topic: "w6",
    universe: "refund-audit",
    title: "The pending top-three, combined",
    brief:
      "From: Refund desk lead. Re: the concentration callout.\n\nThe desk's callout asserts how much of the pending pot the three biggest debtors hold combined — a cut summed over staged per-customer shares, with the whole-pot painter riding the fold. Pin the combined figure for the rn <= 3 cut. The draft computed the shares after filtering and read 100.",
    ask: "One query: the share of the pending pot held by the three biggest pending debtors, combined.",
    template:
      "WITH x AS (SELECT c.name, ROUND(SUM(o.total), 2) AS exposure,\nROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) AS rn, {1} AS pot\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'pending' GROUP BY c.id)\nSELECT ROUND(SUM({2} * exposure / pot), 1) AS combined FROM x WHERE rn <= {3};",
    slots: [
      { answer: "SUM(SUM(o.total)) OVER ()", kind: "keyword", label: "the whole-pot painter",
        why: "SUM(SUM(o.total)) OVER () paints the eight customers' combined 6113 onto every folded row, so each share divides by the whole pending book. MAX(SUM(o.total)) OVER () would paint 1471.43 and the three shares would re-base on Emma — combined 263, not a share of anything." },
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "The callout quotes percents, so each share scales by 100.0 before the outer SUM folds them — probed combined 63.3. Scale by 10.0 and the callout prints 6.3, off by a factor the desk would catch at a glance." },
      { answer: "3", kind: "number", noVerify: true, label: "the cut size",
        why: "The cut is rn <= 3 over the staged ladder — Emma 1471.43, Chloe 1309.92, Farid 1088.44, probed. The cap constant never prints in the aggregated result cells, but the pin defines which cut the callout asserts." },
    ],
    distractors: ["MAX(SUM(o.total)) OVER ()", "10.0", "2"],
    walkthrough:
      "The pipeline stacks this wave's two laws: the window can't be filtered at its own level, and the pot must be painted before any cut. The stage folds the 14 pending orders into eight debtors with their money, numbers them by exposure, and paints SUM(SUM(o.total)) OVER () — 6113, the whole pending book — onto every row. The outer query then takes rn <= 3, converts each debtor's share to percent, and folds the shares into one figure: probed 63.3 (45.5 for the top two, 85.6 for five). The callout's headline writes itself — three customers hold nearly two-thirds of the pending pot. Re-base on MAX instead and the same three rows 'sum' to 263, a number over 100 that no honest share can reach — the tell that the denominator changed.",
  },
  {
    id: "cs-1417",
    tier: "hard",
    topic: "w6",
    universe: "catalog",
    title: "The cellar's combined weight",
    brief:
      "From: Merchandising lead. Re: the long-tail memo.\n\nThe long-tail memo asserts how much shelf value the bottom two categories hold combined — shares computed per category against the whole pot in the stage, then summed outside the cut. Pin the combined figure. The draft filtered the categories first and the shares read 100 across the board.",
    ask: "One query: the combined share of shelf value held by the two least valuable categories.",
    template:
      "WITH c AS (SELECT category, ROUND(SUM(price), 2) AS value,\nROW_NUMBER() OVER (ORDER BY SUM(price) {2}) AS rn,\nROUND(100.0 * SUM(price) / {1}, 1) AS pct FROM products GROUP BY category)\nSELECT ROUND(SUM(pct), 1) AS combined FROM c WHERE rn >= {3};",
    slots: [
      { answer: "SUM(SUM(price)) OVER ()", kind: "keyword", label: "the whole-shelf pot",
        why: "SUM(SUM(price)) OVER () paints the seven categories' combined 1148.43 onto every folded row, so each category's share divides by the whole shelf. MAX(SUM(price)) OVER () would paint Audio's 328.98 and the shares would re-base on the leader — the tail would read 34.8 instead of 10." },
      { answer: "DESC", kind: "keyword", label: "the value ladder direction",
        why: "The ladder counts down from Audio's 328.98 so the cellar sits at high rn — rn >= 6 grabs the bottom two. ASC would number from the cellar up and 'rn >= 6' would grab the top two, a 52.9 combined read for the wrong end." },
      { answer: "6", kind: "number", noVerify: true, label: "the cellar cut",
        why: "The cut is rn >= 6 over the seven-row ladder — probed cellar: Accessories 82.48 and Fitness 32. The cap constant never prints in the aggregated single-row result, but it defines which end of the ladder the memo calls the tail." },
    ],
    distractors: ["MAX(SUM(price)) OVER ()", "ASC", "7"],
    walkthrough:
      "The long-tail arithmetic is staged, not improvised: the fold computes each category's shelf value and its share of the 1148.43 pot (Audio 28.6, Wearables 24.3, … Fitness 2.8, all probed), the ladder numbers the categories from the top, and only the outer query applies the cut — rn >= 6 — and folds the kept shares into one figure: probed 10.0 (7.2 + 2.8). The draft's failure mode is documented in this wave's probes: filter the categories before the share is computed and the pot collapses to the survivors, every share reads 100, and the 'tail' claims the whole shelf. Tighten the cut to rn >= 7 and the combined read drops to Fitness's lone 2.8. The direction slot is the quiet one: ASC turns 'the cellar' into 'the podium' without changing a single word of the memo.",
  },
  {
    id: "cs-1418",
    tier: "hard",
    topic: "w6",
    universe: "inventory",
    title: "The deep three's weight",
    brief:
      "From: Ops manager. Re: the depth concentration check.\n\nThe concentration check takes the three deepest shelves and asserts each one's share of the 2845-unit warehouse, painted by a window over the raw rows with the ladder staged beside it. Pin the third-deepest shelf with its share. The draft painted the biggest shelf instead of the total and the shares read 100, 80, 60.",
    ask: "One query: the third-deepest shelf with its share of total warehouse stock asserted.",
    template:
      "WITH s AS (SELECT name, stock, ROW_NUMBER() OVER (ORDER BY stock {2}) AS rn,\nROUND(100.0 * stock / {1}, 1) AS pct FROM products)\nSELECT name, stock, rn, pct FROM s WHERE rn <= {3} AND pct = {4};",
    slots: [
      { answer: "SUM(stock) OVER ()", kind: "keyword", label: "the warehouse painter",
        why: "SUM(stock) OVER () paints 2845 — all sixteen shelves — onto every row, so each share divides by the whole warehouse. MAX(stock) OVER () would paint 500, HDMI's own shelf, and the top three would read 100/80/60 — shares of the leader, not of the building." },
      { answer: "DESC", kind: "keyword", label: "the depth ladder direction",
        why: "Depth counts down from the deepest shelf, so DESC puts HDMI's 500 at rn 1. ASC would count up from the 40-unit Smart Watch and 'the deep three' would be the three thinnest shelves in the building." },
      { answer: "3", kind: "number", label: "the checked rung",
        why: "Probed: the deep three are 500, 400, 300 (HDMI, Running Socks, Wireless Mouse) — rung 3 is the Mouse's 300. Pin 1 and the assert grabs HDMI instead of the rung the check cites." },
      { answer: "10.5", kind: "number", label: "the asserted share",
        why: "Probed: 300 units is 10.5 of the 2845-unit warehouse — the third shelf's weight, behind 17.6 and 14.1. The assert ties the rung to the figure the concentration check quotes." },
    ],
    distractors: ["MAX(stock) OVER ()", "ASC", "2"],
    walkthrough:
      "One stage, two windows, one cut: ROW_NUMBER() OVER (ORDER BY stock DESC) numbers the depth ladder (500, 400, 300 at the top, probed), SUM(stock) OVER () paints the 2845-unit warehouse onto every row, and the share column divides the two. The outer WHERE draws the check's window — rn <= 3 — and the pin asserts rung 3's 10.5, the third-deepest shelf carrying a tenth of the building. Re-base on MAX(stock) OVER () and the deep three read 100/80/60: the arithmetic of 'share of the leader', which flatters exactly the shelf that needs no flattering. Flip the ladder and the 'deep three' become 40/45/60 — the restock queue wearing the concentration check's name. Paint, ladder, cut, pin: four layers, each doing one job.",
  },
  {
    id: "cs-1419",
    tier: "hard",
    topic: "w6",
    universe: "month-close",
    title: "The share that wouldn't filter",
    brief:
      "From: Controller. Re: the status mix page.\n\nThe status mix page prints each pot's share of the lifetime 34833.28 — computed in the stage, filtered outside it. The controller pinned the pending row at its share, and wants the paint asserted beside it. The draft's first attempt put the window share straight into WHERE and the engine answered 'misuse of window function SUM()'.",
    ask: "One query: the pending pot with its share of the storewide total, staged then pinned.",
    template:
      "WITH s AS (SELECT status, ROUND(SUM(total), 2) AS pot,\nROUND(100.0 * SUM(total) / {1}, 1) AS pct FROM orders GROUP BY status)\nSELECT status, pot, pct FROM s WHERE pct = {2} AND pot = {3};",
    slots: [
      { answer: "SUM(SUM(total)) OVER ()", kind: "keyword", label: "the storewide paint",
        why: "SUM(SUM(total)) OVER () paints 34833.28 — the four pots' total — onto every folded row, so each share divides by the lifetime store. MAX(SUM(total)) OVER () would paint 15571.07 and pending would read 39.3 — a share of the biggest pot, not of the store." },
      { answer: "17.5", kind: "number", label: "the asserted share",
        why: "Probed: pending's 6113 is 17.5 of the 34833.28 store — the mix page's pending line, behind delivered's 44.7 and shipped's 34.4. Pin 44.7 and the assert grabs the delivered row instead." },
      { answer: "6113", kind: "number", label: "the pending pot pin",
        why: "Probed: 6113 is the pending pot across 14 orders — the raw money beside the share, so the page shows both readings. 15571.07 is delivered's pot; pinned together the two asserts point at different rows and the page contradicts itself." },
    ],
    distractors: ["MAX(SUM(total)) OVER ()", "44.7", "15571.07"],
    walkthrough:
      "The page's whole architecture is the staging law: the share is computed in the stage — pot over painted grand, probed 44.7 / 34.4 / 17.5 / 3.3 — because a window can't be filtered where it's computed; the same-level attempt dies with the engine's verbatim 'misuse of window function SUM()'. The outer WHERE then pins pending by both of its printed readings, share and pot: 17.5 and 6113 must agree or the row is wrong. Re-base the paint on MAX and pending's share becomes 39.3 — the ratio to delivered wearing the storewide label — and the double assert empties the row, which is the audit working. This wave's probes also document the failure mode the page avoids by staging: cut the rows before painting and the pot shrinks to the survivors, every share reading a self-referential 100.",
  },
  {
    id: "cs-1420",
    tier: "hard",
    topic: "w6",
    universe: "refund-audit",
    title: "The exposure cut, two stages deep",
    brief:
      "From: Refund desk lead. Re: the at-risk shortlist.\n\nThe shortlist takes the five biggest at-risk customers — cancelled plus pending money folded per customer, numbered by a window, cut outside it — and prints each one's share of the at-risk pot beside their name. Pin the top three's rows. The draft cut inside the stage and the pot collapsed.",
    ask: "One query: the three biggest at-risk customers with their share of the at-risk pot printed.",
    template:
      "WITH x AS (SELECT c.name, ROUND(SUM(o.total), 2) AS exposure,\nROW_NUMBER() OVER (ORDER BY SUM(o.total) {1}) AS rn, SUM(SUM(o.total)) OVER () AS pot\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ('cancelled', 'pending') GROUP BY c.id)\nSELECT name, exposure, rn, ROUND({2} * exposure / pot, 1) AS pct FROM x WHERE rn <= {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the risk ladder direction",
        why: "Risk reads biggest first, so DESC puts Emma's 1615.29 at rn 1. ASC would number from the smallest exposure and the 'top three' would be the three safest customers on the books." },
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Shares are percents, so each exposure divides by the painted 7265.49 pot and scales by 100.0 — probed rows 22.2, 18.0, 17.7. Scale by 10.0 and the shortlist prints 2.2, off by the factor the desk reconciles against." },
      { answer: "3", kind: "number", label: "the shortlist cut",
        why: "Probed: rn <= 3 keeps Emma 1615.29, Chloe 1309.92, Alice 1283.65 — the rows the desk calls first, a combined 57.9 of the pot. A cut of 1 would leave only the king's row." },
    ],
    distractors: ["ASC", "10.0", "1"],
    walkthrough:
      "The pot is painted before the cut, always: the stage folds cancelled-plus-pending orders into eight at-risk customers, numbers them by exposure, and paints SUM(SUM(o.total)) OVER () — 7265.49, the whole at-risk book — onto every row. The outer WHERE then draws rn <= 3 and the share column renders each kept row against the full pot: probed 22.2, 18.0, 17.7 (63.3-style arithmetic would be the pending-only book, a different memo). Filter inside the stage and the pot collapses to the kept rows — this wave's documented 100-everywhere failure — so the two-layer shape is what keeps the denominator honest. Widen the cut to five and the shortlist's combined read climbs to 80.8; the desk's coverage number is the cut size, made mechanical.",
  },
  {
    id: "cs-1421",
    tier: "hard",
    topic: "w6",
    universe: "expense",
    title: "The layered walk assert",
    brief:
      "From: Finance partner. Re: the burn walk's close assert.\n\nThe close assert layers two windows over the staged expense months: the running burn walk, and a rank that says which month is the year's biggest burner. The assert pins rank 1 and demands the walk's rung there — the burn-to-date at the spike month. Slice on the expense date column. The draft ranked ascending and asserted February's rung.",
    ask: "One query: the running burn total at the year's biggest expense month, asserted at rank 1.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', {1}) AS mo, SUM(amount_cents) / 100.0 AS spend FROM expenses GROUP BY mo),\nr AS (SELECT mo, spend, SUM(spend) OVER (ORDER BY mo) AS run,\nRANK() OVER (ORDER BY spend {2}) AS rk FROM m)\nSELECT mo, spend, ROUND(run, 2) AS run, rk FROM r WHERE rk = {3} AND run = {4};",
    slots: [
      { answer: "spent_on", kind: "keyword", label: "the expense date column",
        why: "Expenses are dated by spent_on — the slicer the buckets and the walk both depend on. created_at doesn't exist on expenses, and the engine refuses the query before the walk ever runs." },
      { answer: "DESC", kind: "keyword", label: "the burner ranking direction",
        why: "The assert wants the year's biggest burner, so the rank sorts spend DESC and 2024-08's 3210 takes rk 1. ASC would crown February's 1440 — the thrift spotlight's answer wearing the burn assert's pin." },
      { answer: "1", kind: "number", label: "the burner rank pin",
        why: "Probed: 2024-08 is the year's biggest bucket at 3210, uniquely rk 1 under DESC — ahead of November's 1974 at rk 2. Pin 2 and the assert reads November's rung." },
      { answer: "14819", kind: "number", label: "the asserted burn-to-date",
        why: "Probed: the walk's rung at 2024-08 reads 14819 — everything burned through August, from 1719 in January onward. 25416 is the final rung in February 2025; pinning it against rk 1 empties the assert." },
    ],
    distractors: ["created_at", "ASC", "2", "25416"],
    walkthrough:
      "Two windows, one stage, layered on the fold: the buckets slice 36 expense rows into fourteen months on spent_on, then r computes the calendar walk — SUM(spend) OVER (ORDER BY mo), the probed staircase 1719, 3159, 5076 … — and the burner rank RANK() OVER (ORDER BY spend DESC) in the same breath. The assert pins rk 1 and demands the walk's rung there: 2024-08, spend 3210, run 14819 — burn-to-date at the spike, the figure the close checklist reconciles against. Rank ASC and the same pipeline hands rk 1 to February, whose rung is 3159; the assert's rung pin catches the flip because 14819 only exists at the spike's row. Two windows over one fold, two different facts, one row where they meet — that's the assert.",
  },
  {
    id: "cs-1422",
    tier: "hard",
    topic: "w6",
    universe: "growth",
    title: "The share cut at rank three",
    brief:
      "From: Growth lead. Re: the podium slide.\n\nThe podium slide takes the top three spenders and prints each one's share of lifetime revenue beside their rank — share painted over the fold, rank layered next to it, cut outside both. Pin the third podium row. The draft cut inside the stage and the paint shrank with it.",
    ask: "One query: the rank-3 spender with their share of lifetime revenue asserted.",
    template:
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,\nROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 1) AS pct,\nRANK() OVER (ORDER BY SUM(o.total) {1}) AS rk\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id)\nSELECT name, spend, pct, rk FROM s WHERE rk = {2} AND pct = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the podium direction",
        why: "Podiums count down from the top, so DESC gives Alice's 7262.35 rk 1. ASC would run the league from Olivia's 444.8 and 'the top three' would be the three smallest accounts in the book." },
      { answer: "3", kind: "number", label: "the pinned podium rung",
        why: "Probed podium: Alice 20.8, Emma 19.1, Grace 13.1 — the pin lands on Grace's bronze rung. Pin 1 and the double assert empties: rk 1 is Alice's row, whose share reads 20.8, not 13.1." },
      { answer: "13.1", kind: "number", label: "the asserted share",
        why: "Probed: Grace Kim's 4574.23 is 13.1 of the 34833.28 lifetime pot — the bronze row the slide captions. 20.8 is Alice's share; pinned beside rk 3 it empties the assert, because 20.8 lives on the gold row." },
    ],
    distractors: ["ASC", "1", "20.8"],
    walkthrough:
      "One fold, two windows, one pin: GROUP BY c.id builds the sixteen spends, SUM(SUM(o.total)) OVER () paints the 34833.28 lifetime pot so every share divides by the whole store, RANK() OVER (ORDER BY SUM(o.total) DESC) deals the podium positions, and the outer WHERE pins rk = 3 — Grace's bronze row, its 13.1 share asserted beside the probed podium 20.8, 19.1, 13.1. The pin reads the staged rank like an ordinary column because the rank is computed before the filter — cut beside the window and the survivor would re-rank itself to 1. The staging order is also what guards the share: filter inside the stage and the painted pot shrinks to the survivors, every share reading 100 — the collapse this wave's probes document on the same store. And the direction flip is silent but total: ASC's 'podium' is the bottom of the league wearing gold.",
  },
  {
    id: "cs-1423",
    tier: "hard",
    topic: "w6",
    universe: "fraud",
    title: "The champion's global cut",
    brief:
      "From: Fraud desk. Re: the two-ladder case note.\n\nThe case note runs two ladders: each customer's own biggest order (ROW_NUMBER partitioned by customer), then those sixteen champions ranked globally by RANK. The note pins Alice Chen's champion — and asserts its global rung, because her best misses the store's top cut. The draft partitioned by id and every order became a 'champion'.",
    ask: "One query: Alice's biggest order with its rung on the global champions' ladder asserted.",
    template:
      "WITH best AS (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY total DESC, id) AS rn FROM orders),\ng AS (SELECT customer_id, id, total, RANK() OVER (ORDER BY total {2}) AS rk FROM best WHERE rn = 1)\nSELECT c.name, g.id, g.total, g.rk FROM g JOIN customers c ON c.id = g.customer_id WHERE g.total = {3} AND g.rk = {4};",
    slots: [
      { answer: "customer_id", kind: "keyword", label: "the partition key",
        why: "Champions are per-customer, so the stage partitions by customer_id — sixteen leagues, one rn 1 each. Partition by id and every order becomes its own league of one: all 103 rows survive the cut and the global ladder counts raw orders, not champions." },
      { answer: "DESC", kind: "keyword", label: "the global ladder direction",
        why: "The champions' ladder counts down from the 1088.44 whale, so DESC gives Alice's champion rk 5. ASC would rank the champions smallest-first and hand her rung 12 — the note's cut citation inverted." },
      { answer: "767.64", kind: "number", label: "the champion total",
        why: "Probed: Alice's best is order 3 at 767.64 — rk 5 on the champions' ladder, behind 1088.44, 945.21, 845.92 and 826.03, and short of the store's 785.79 top-five cut. 785.79 is Emma's second-biggest, never a champion." },
      { answer: "5", kind: "number", label: "the pinned global rung",
        why: "Probed: Alice's champion sits at global rk 5 — behind Farid 1088.44, Chloe 945.21, Emma 845.92 and Grace 826.03, the four champions above her, one clear of Bruno's 752.96 at rk 6. Pin 4 and the assert grabs Grace's rung instead." },
    ],
    distractors: ["status", "id", "ASC"],
    walkthrough:
      "Two ladders, two windows, one case note: the stage partitions all 103 orders by customer and deals each customer's ladder, rn = 1 keeps the sixteen champions, and the ranked layer stamps RANK() OVER (ORDER BY total DESC) across all of them before the pin filters — the probed league runs 1088.44 (Farid) down to 397.99 (Keiko), with Alice's 767.64 at rk 5. The note's point is the cut: the raw order ladder's top five ends at 785.79 — a figure that is nobody's champion, just Emma's second-biggest — so Alice's best misses the store's top-five cut even though it's her own ceiling. Partition by id instead and every order is a league of one: the 'champions' ladder becomes the raw 103-order ladder and 767.64 reads position 6, one off the pinned 5, so the assert empties — a one-rung drift that changes the note's conclusion. Partition by status and her row vanishes entirely; 767.64 is nobody's status champion.",
  },
  {
    id: "cs-1424",
    tier: "hard",
    topic: "w6",
    universe: "supplier",
    title: "The depth share's crown row",
    brief:
      "From: Ops manager. Re: the warehouse concentration audit.\n\nThe audit folds the catalog through its suppliers, paints each pile's share of the 2845-unit warehouse, and ranks the piles deepest-first — then pins the crown row with both readings asserted. The draft painted the biggest pile as the denominator and the crown read 100 compared to itself.",
    ask: "One query: the deepest stock pile with its share of the warehouse asserted at rank 1.",
    template:
      "WITH p AS (SELECT sup.name, SUM(p.stock) AS pile,\nROUND(100.0 * SUM(stock) / {1}, 1) AS pct,\nRANK() OVER (ORDER BY SUM(stock) {2}) AS rk\nFROM products p JOIN suppliers sup ON sup.id = p.supplier_id GROUP BY sup.id)\nSELECT name, pile, pct, rk FROM p WHERE rk = {3} AND pct = {4};",
    slots: [
      { answer: "SUM(SUM(stock)) OVER ()", kind: "keyword", label: "the warehouse denominator",
        why: "SUM(SUM(stock)) OVER () paints 2845 — the six folded piles — onto every row, so the crown's share reads against the whole warehouse. MAX(SUM(stock)) OVER () would paint 850, the crown's own pile, and read 100: the leader compared to itself." },
      { answer: "DESC", kind: "keyword", label: "the depth league direction",
        why: "Depth reads deepest first, so DESC crowns the 850-unit pile at rk 1. ASC would crown Nordic's 230 — the thinnest pile wearing the depth audit's crown." },
      { answer: "1", kind: "number", label: "the crown rung",
        why: "Probed: Shenzhen Electro's 850 leads the six-pile league — ahead of Pacific's 695 and Midwest's 460 — so rk 1 is uniquely the crown. Pin 2 and the assert grabs the runner-up pile." },
      { answer: "29.9", kind: "number", label: "the asserted warehouse share",
        why: "Probed: 850 units is 29.9 of the 2845-unit warehouse — nearly a third of the building on one supplier's shelves. 24.4 is Pacific's share, one rung down." },
    ],
    distractors: ["MAX(SUM(stock)) OVER ()", "ASC", "2", "24.4"],
    walkthrough:
      "The concentration audit is the grand paint applied to piles: GROUP BY supplier folds sixteen products into six piles, SUM(SUM(stock)) OVER () paints the 2845-unit warehouse onto every folded row, the share column divides, and RANK() OVER (ORDER BY SUM(stock) DESC) deals the depth league — crown at rk 1 with both readings asserted: 850 units, 29.9 of the building. The probed ladder behind it runs 24.4, 16.2, 10.7, 10.7, 8.1 — six shares that sum to 100, the paint's own reconciliation. Re-base on MAX and the crown reads 100 'of the warehouse' — the self-comparison bug this wave's probes document, flattering the audited party by exactly the denominator's worth. ASC crowns the thinnest pile; the audit's headline inverts while every number stays legal.",
  },
];
