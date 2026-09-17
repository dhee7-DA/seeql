// Case wave w5 — Module 5 frames & running totals (lesson 32), cs-1353…cs-1388.
// 36 cases: 12 easy / 12 medium / 12 hard, all topic "w5" (default-frame law,
// ROWS/RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, running SUM/AVG/COUNT,
// moving windows, RANGE-vs-ROWS on ties, FIRST_VALUE/LAST_VALUE frame
// degeneration, share-of-total paint, unwind and before-frames).
// Every figure traces to committed probe receipts:
// scripts/m5-facts-w5.out + m5-facts-w5b.out (this wave's own probes),
// scripts/m5-facts-r4.out / r6.out (staged months, leaderboard, shares), and the
// engine-verified header of src/lib/curriculum/drills/m5/window-frames.ts.
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW5: CaseStudy[] = [
  {
    id: "cs-1353",
    tier: "easy",
    topic: "w5",
    universe: "month-close",
    title: "The last rung is the whole store",
    brief:
      "From: Controller. Re: the close checklist.\n\nThe close checklist's final line reconciles the running revenue walk against the plain storewide SUM: the walk's last rung must land on the lifetime figure or the deck doesn't ship. The draft query lost its accumulator, its landing id and its assert figure in a refactor. Rebuild it so the walk ends on order 103 with the lifetime total.",
    ask: "One query: the running total's final rung at order 103, asserted against the lifetime figure.",
    template:
      "WITH walk AS (SELECT id, total, ROUND({1}(total) OVER (ORDER BY id), 2) AS running FROM orders)\nSELECT id, total, running FROM walk WHERE id = {2} AND running = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the accumulator",
        why: "SUM(total) OVER (ORDER BY id) accumulates as it walks — probed rungs: 576.54, 993.35, 1760.99 … 34509.12 at id 102, 34833.28 at id 103. AVG would freeze the last rung at 338.19 (the mean), and the reconciliation would never land." },
      { answer: "103", kind: "number", label: "the landing id",
        why: "Order 103 is the walk's final row — probed: id 102 carries 34509.12, so only id 103 completes the staircase. Pin 102 and the assert reads the second-to-last rung, one ticket short of the close." },
      { answer: "34833.28", kind: "number", label: "the lifetime figure",
        why: "Probed: the last rung equals the plain SUM — 34833.28, the store's lifetime revenue across 103 orders. The assert is the reconciliation: walk and aggregate must agree to the cent." },
    ],
    distractors: ["AVG", "102", "34509.12"],
    walkthrough:
      "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING AND CURRENT ROW — everything from the first row to now — which is exactly why the bare spelling SUM(total) OVER (ORDER BY id) IS the running total. The CTE walks all 103 rows (576.54, 993.35, 1760.99 …), and the outer WHERE lands on id 103 and asserts the figure: 34833.28, the same number plain SUM(total) returns. That equality is the close checklist's whole point — the walk preserves every intermediate step while ending on the truth. Land on 102 instead and you assert 34509.12, one 324.16 ticket short; swap the accumulator for AVG and the 'rung' collapses to the 338.19 mean, a number no reconciliation should ever print.",
  },
  {
    id: "cs-1354",
    tier: "easy",
    topic: "w5",
    universe: "refund-audit",
    title: "Three tickets and the whole pot",
    brief:
      "From: Support lead. Re: the morning queue.\n\nFinance reviews the three biggest pending tickets each morning, and the queue header must carry the whole pending picture: how many tickets are open and what they add up to — painted by windows that never collapse the rows. The draft lost its status filter, its direction and its row cap. Rebuild the queue.",
    ask: "One query: the three largest pending orders, each row stamped with the pending crowd size and pot.",
    template:
      "SELECT id, total, COUNT(*) OVER () AS crowd, ROUND(SUM(total) OVER (), 2) AS pot\nFROM orders\nWHERE status = {1}\nORDER BY total {2}\nLIMIT {3};",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the status filter",
        why: "The WHERE trims the crowd to the 14 pending rows before the windows paint it. Probed: crowd 14, pot 6113. Filter 'shipped' instead and the paint reads the 30-row warehouse pile — probed, its top three are 845.92, 826.03, 785.79, a different queue entirely." },
      { answer: "DESC", kind: "keyword", label: "the exposure direction",
        why: "Biggest tickets first sorts the queue descending — probed top: order 74 at 1088.44, order 43 at 945.21, order 5 at 725.34. ASC would open the morning review with order 12 at 148.28, the smallest exposure on the books." },
      { answer: "3", kind: "number", noVerify: true, label: "the queue depth",
        why: "LIMIT 3 keeps the three tickets finance actually reviews. Probed third place: order 5 at 725.34 — cutting to 2 drops a ticket the memo promised, and widening past 3 starts reviewing work nobody asked for." },
    ],
    distractors: ["'shipped'", "ASC", "2"],
    walkthrough:
      "Windows never collapse rows: WHERE first trims 103 orders to the 14 pending ones, then COUNT(*) OVER () stamps every surviving row with the crowd size 14 and SUM(total) OVER () with the pot 6113 — a constant paint, the whole picture riding on each row. ORDER BY total DESC presents the exposure league (1088.44, 945.21, 725.34) and LIMIT 3 trims it to the reviewed trio. Filter 'shipped' and the same query describes the warehouse queue — 30 rows led by 845.92 — because the paint always describes whatever the WHERE kept. Sort ascending and the 'review' opens with the 148.28 small fry; either way the query runs, but the memo it answers changes.",
  },
  {
    id: "cs-1355",
    tier: "medium",
    topic: "w5",
    universe: "funnel",
    title: "The first three orders' slice",
    brief:
      "From: Lifecycle marketing. Re: the launch cohort note.\n\nThe launch story opens on the store's first three orders and how much of lifetime revenue each one carried. Share-of-total needs the whole-order denominator, so the share must be staged before any id filter — filter first and the denominator collapses to the filtered rows. Rebuild the staged version and rank the three slices.",
    ask: "One query: orders 1–3 ranked by their share of lifetime revenue, staged so the denominator stays whole-store.",
    template:
      "WITH s AS (SELECT id, total, ROUND({1} * total / {2}, 2) AS share FROM orders)\nSELECT id, total, share FROM s WHERE id <= {3} ORDER BY share DESC;",
    slots: [
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Shares read as percents, so the ratio is scaled by 100.0 before rounding — probed: order 1 lands at 1.66, order 2 at 1.2, order 3 at 2.2. Scale by 10 and the same query prints 0.17-style decimals nobody on the funnel team quotes." },
      { answer: "SUM(total) OVER ()", kind: "keyword", label: "the whole-store denominator",
        why: "SUM(total) OVER () paints 34833.28 — the full 103-order pot — onto every row, so each share is measured against lifetime revenue. MAX(total) OVER () would divide by 1088.44 and print 70.53-style slices; COUNT(total) OVER () divides by the row count 103 and prints 559.75 — a share of nothing." },
      { answer: "3", kind: "number", noVerify: true, label: "the cohort cutoff",
        why: "id <= 3 keeps the store's first three tickets — probed shares 2.2, 1.66, 1.2 for orders 3, 1, 2. It sits outside the CTE on purpose: filtering inside the staged SELECT would shrink the OVER () pot to those rows and every share would read 100-scale nonsense." },
    ],
    distractors: ["MAX(total) OVER ()", "COUNT(total) OVER ()", "5"],
    walkthrough:
      "Share-of-total is a two-stage build: stage the window over ALL rows, filter afterwards. SUM(total) OVER () walks the 103-row pot of 34833.28 onto every row, ROUND(100.0 * total / pot, 2) renders each slice, and only then does id <= 3 trim to the launch cohort — order 3's 767.64 leads at 2.2, order 1's 576.54 carries 1.66, order 2's 416.81 carries 1.2. Move the id filter inside the staged SELECT and the OVER () pot collapses to three rows: every share reads a self-referential 100. Swap the denominator for COUNT(total) OVER () and you divide money by a headcount — 559.75 is a row count wearing a percent sign. The staging isn't style; it's what keeps the denominator honest.",
  },
  {
    id: "cs-1356",
    tier: "easy",
    topic: "w5",
    universe: "expense",
    title: "The August spike, painted",
    brief:
      "From: Finance partner. Re: the spend report's callout.\n\nThe spend report calls out the one month that broke four figures in hundreds, and each callout row must carry the annual pot next to the spike so the reader sees both at once. Stage the month buckets, paint the grand total, pin the spike. The draft lost its date column, its painter and its pin.",
    ask: "One query: the 2024-08 expense spike with the annual expense grand total painted alongside.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', {1}) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo),\np AS (SELECT mo, spend, {2}(spend) OVER () AS grand FROM m)\nSELECT mo, spend, ROUND(grand, 2) AS grand FROM p WHERE spend = {3};",
    slots: [
      { answer: "spent_on", kind: "keyword", label: "the expense date column",
        why: "Expenses are dated by spent_on — the strftime slicer buckets its 36 rows into 14 months. created_at doesn't exist on expenses (the engine refuses the query); amount_cents would feed a raw number to strftime and collapse every row into one NULL-dated bucket." },
      { answer: "SUM", kind: "keyword", label: "the pot painter",
        why: "SUM(spend) OVER () paints the annual pot — probed 25416 — onto all 14 month rows without collapsing them. MAX(spend) OVER () would paint the spike itself, 3210, so the callout would compare August to August." },
      { answer: "3210", kind: "number", label: "the spike pin",
        why: "Probed: 2024-08 is the spike month at 3210 — every other month sits between 1440 and 1974. Pin 1719 and the assert grabs 2024-01, a month with no story attached." },
    ],
    distractors: ["created_at", "amount_cents", "MAX", "1719"],
    walkthrough:
      "The paint pattern: stage the buckets first (strftime('%Y-%m', spent_on) folds 36 expense rows into 14 months, sums 1719/1440/1917/1749/1480 …), then a second pass paints SUM(spend) OVER () — 25416, the annual pot — onto every bucket row without collapsing them. The pin spend = 3210 isolates August, the one month that broke the pattern, and the callout row reads both truths at once: spike 3210, pot 25416. Grab the painter MAX and the 'pot' becomes 3210 — August compared to itself, a callout that explains nothing. And the date column matters as much as the painter: expenses carry spent_on, not created_at, and feeding amount_cents to a date slicer melts all 36 rows into one bucket.",
  },
  {
    id: "cs-1357",
    tier: "easy",
    topic: "w5",
    universe: "catalog",
    title: "The Yoga Mat's slice of shelf value",
    brief:
      "From: Catalog lead. Re: the shelf-value census.\n\nThe category review wants each product's slice of total shelf value — price measured against the whole 16-product pot — and the Fitness row in particular. The draft filtered the product first and every share came back 100. Stage the share over the full catalog, then pin the mat.",
    ask: "One query: product 16's share of total catalog price, staged so the denominator covers all sixteen products.",
    template:
      "WITH p AS (SELECT id, name, price, ROUND({1} * price / {2}, 2) AS share FROM products)\nSELECT id, name, share FROM p WHERE id = {3} AND share = {4};",
    slots: [
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Shelf shares are quoted in percent — probed: the Yoga Mat's 32 lands at 2.79 of the 1148.43 pot, the Mechanical Keyboard's 89.99 at 7.84. Drop the scale to 10.0 and the census prints fractions the deck can't use." },
      { answer: "SUM(price) OVER ()", kind: "keyword", label: "the whole-catalog denominator",
        why: "SUM(price) OVER () paints 1148.43 — all sixteen prices — onto every row. MAX(price) OVER () divides by the single priciest tag 199.99 and reads the mat at 16: a share of the leader, not of the shelf." },
      { answer: "16", kind: "number", label: "the product pin",
        why: "id 16 is the Yoga Mat Eco 6mm at 32 — probed share 2.79. Pin 1 and the assert grabs the Mechanical Keyboard instead, whose 7.84 is the catalog's biggest slice." },
      { answer: "2.79", kind: "number", label: "the asserted share",
        why: "Probed: 100 × 32 / 1148.43 = 2.79 — the mat's slice of shelf value. The assert double-checks the staged arithmetic; 7.84 would be the keyboard's figure wearing the mat's row." },
    ],
    distractors: ["MAX(price) OVER ()", "10.0", "1", "7.84"],
    walkthrough:
      "Same staging law as every share-of-total: the window computes over the whole catalog first, the filter comes after. SUM(price) OVER () paints 1148.43 on all sixteen rows; ROUND(100.0 * price / pot, 2) renders each slice; the outer pin grabs id 16 and asserts 2.79. The draft's bug — filtering id = 16 inside the staged SELECT — is the classic WHERE-collapse: the pot shrinks to one row and the share reads 100, a number that means 'compared to itself'. Divide by MAX(price) OVER () instead and the census re-bases on the 199.99 leader, reading the mat at 16 — a different question (share of the champion) that no shelf review asked.",
  },
  {
    id: "cs-1358",
    tier: "easy",
    topic: "w5",
    universe: "inventory",
    title: "The stock walk's final rung",
    brief:
      "From: Ops manager. Re: the depth reconciliation.\n\nThe count sheet walks product stock in id order and asserts the final rung against the warehouse total — if the walk's last step and the plain SUM disagree, the shelf data is broken. The draft lost its accumulator, its landing row and its assert figure. Rebuild the walk.",
    ask: "One query: the running stock total's final rung at product 16, asserted against the warehouse total.",
    template:
      "WITH w AS (SELECT id, name, stock, {1}(stock) OVER (ORDER BY id) AS running FROM products)\nSELECT id, name, stock, running FROM w WHERE id = {2} AND running = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the accumulator",
        why: "SUM(stock) OVER (ORDER BY id) accumulates depth as it walks — probed: 120, 420, 505 … landing 2845 at id 16. MAX(stock) OVER () tracks the biggest shelf seen so far and ends at 500 (HDMI's 500-unit shelf), not the total." },
      { answer: "16", kind: "number", label: "the landing row",
        why: "Product 16 is the walk's last row — probed: id 3 carries 505, so only id 16 completes the walk. Pin 3 and the assert reads the third shelf instead of the reconciliation rung." },
      { answer: "2845", kind: "number", label: "the warehouse total",
        why: "Probed: the final rung equals the plain SUM — 2845 units across 16 products. The assert is the reconciliation: walk and aggregate must agree or the count sheet is wrong." },
    ],
    distractors: ["MAX", "3", "505"],
    walkthrough:
      "The running total pattern on a different column: SUM(stock) OVER (ORDER BY id) walks the sixteen shelves — 120, 420, 505 … — and the default frame (RANGE UNBOUNDED PRECEDING AND CURRENT ROW) guarantees each rung carries everything up to now. The last rung, id 16, lands on 2845: the same number plain SUM(stock) prints. That's the reconciliation the count sheet asserts. Swap the accumulator for MAX and the walk tracks the deepest single shelf instead — it ends at 500, HDMI's stock, which is a leader-board answer wearing a totals costume. Land on id 3 and you assert 505, a third of the warehouse — true as a rung, false as a reconciliation.",
  },
  {
    id: "cs-1359",
    tier: "easy",
    topic: "w5",
    universe: "supplier",
    title: "Sixteen SKUs on six shelves",
    brief:
      "From: Procurement lead. Re: the supplier roster.\n\nThe supplier roster folds sixteen products into their six suppliers and must count what each carries — while a window paints the total SKU count on every row so the reader sees each share of the catalog without a second query. The draft lost both counters and its row cap. Rebuild the roster.",
    ask: "One query: each supplier's SKU count with the sixteen-item catalog total painted on every row, first supplier shown.",
    template:
      "SELECT s.name, s.rating, {1}(*) AS n, {2}(COUNT(*)) OVER () AS items\nFROM products p JOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id\nORDER BY s.id\nLIMIT {3};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the per-supplier counter",
        why: "COUNT(*) inside the GROUP BY counts each supplier's products — probed counts 3/3/3/3/2/2 across the six suppliers. MAX(*) cannot count rows; the engine refuses it outright." },
      { answer: "SUM", kind: "keyword", label: "the catalog painter",
        why: "SUM(COUNT(*)) OVER () is the window-over-aggregate paint: it sums the six per-supplier counts and stamps 16 — the whole catalog — on every row. COUNT(COUNT(*)) OVER () would paint 6, the supplier count, mislabeled as items." },
      { answer: "1", kind: "number", noVerify: true, label: "the roster head",
        why: "LIMIT 1 shows the roster's first supplier — probed: Nordic Gadgets AB, rating 4.6, carrying 3 of the 16 SKUs. It's a presentation cap; the paint figure 16 is what the audit verifies." },
    ],
    distractors: ["MAX", "AVG", "2"],
    walkthrough:
      "Windows ride on top of aggregates: GROUP BY s.id folds the 16 products into six suppliers (Nordic 3, Shenzhen 3, Pacific 3, Midwest 3, Alpine 2, Andes 2), and then SUM(COUNT(*)) OVER () — a window over the folded counts — paints 16 on every row. The pattern reads naturally left to right: 'this supplier's 3 items out of the catalog's 16'. Swap the painter for COUNT(COUNT(*)) and the stamp becomes 6 — how many suppliers there are, not how many items they carry; the sentence silently lies. And the inner counter must be a counter: MAX(*) or AVG(*) can't fold rows, and the engine rejects both before the query even runs.",
  },
  {
    id: "cs-1360",
    tier: "medium",
    topic: "w5",
    universe: "inventory",
    title: "The deep shelf's weight",
    brief:
      "From: Ops manager. Re: the depth census.\n\nThe depth census asks how much of the warehouse's 2845 units sits on each shelf, and the buying team wants the HDMI row — the deepest shelf — with its weight of the whole. Stage the share across all sixteen products, then pin the cable. The draft's filter-first draft read 100 everywhere.",
    ask: "One query: product 9's share of total warehouse stock, staged over the full catalog before filtering.",
    template:
      "WITH p AS (SELECT id, name, stock, ROUND({1} * stock / {2}, 2) AS share FROM products)\nSELECT id, name, share FROM p WHERE id = {3} AND share = {4};",
    slots: [
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Depth weights are percents — probed: HDMI's 500 units land at 17.57 of the 2845-unit pot, the keyboard's 120 at 4.22. Scale by 10.0 and the census prints 1.76-style decimals nobody stocks by." },
      { answer: "SUM(stock) OVER ()", kind: "keyword", label: "the warehouse denominator",
        why: "SUM(stock) OVER () paints 2845 — every shelf's stock — onto all sixteen rows. MAX(stock) OVER () divides by the deepest single shelf (500) and reads HDMI at 100: compared to itself, not to the warehouse." },
      { answer: "9", kind: "number", label: "the product pin",
        why: "id 9 is HDMI 2.1 Cable 2m, the 500-unit deep shelf — probed share 17.57. Pin 16 and the assert grabs the Yoga Mat instead, whose 7.73 is less than half the cable's weight." },
      { answer: "17.57", kind: "number", label: "the asserted weight",
        why: "Probed: 100 × 500 / 2845 = 17.57 — the cable's slice of the warehouse. The assert re-checks the staged arithmetic; 7.73 belongs to the mat's row, not the cable's." },
    ],
    distractors: ["MAX(stock) OVER ()", "10.0", "16", "7.73"],
    walkthrough:
      "The staged share again, on stock: SUM(stock) OVER () paints the 2845-unit warehouse onto every row, the SELECT renders each shelf's weight, and the outer WHERE pins id 9 and asserts 17.57 — the single heaviest shelf, nearly a fifth of the building. The draft's filter-first bug collapses the denominator to the filtered row and reads 100, which is the census's failure mode, not its answer. Dividing by MAX(stock) OVER () re-bases on the deepest shelf itself and prints 100 for HDMI — the same wrong shape as the collapse. Staging order is the whole lesson: the window must see all sixteen shelves before any pin narrows the view.",
  },
  {
    id: "cs-1361",
    tier: "medium",
    topic: "w5",
    universe: "funnel",
    title: "The roster staircase's top step",
    brief:
      "From: Growth analyst. Re: the seeding story.\n\nThe board slide shows when the client roster finished seeding: bucket the sixteen signups by month, accumulate the staircase, and pin the step where the count first reaches the full roster. The draft lost its accumulator, its step order and its target. Rebuild the staircase.",
    ask: "One query: the signup month where the cumulative roster first reaches all sixteen customers.",
    template:
      "WITH s AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM customers GROUP BY mon),\nc AS (SELECT mon, n, {1}(n) OVER (ORDER BY {2}) AS cum FROM s)\nSELECT mon, n, cum FROM c WHERE cum = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the accumulator",
        why: "SUM(n) OVER (ORDER BY mon) builds the staircase — probed: 2, 4, 6, 8, 10, 12, 14, 15, 16. MAX(n) OVER () paints the best month (2) on every step and the count never reaches 16; the pin would find nothing." },
      { answer: "mon", kind: "keyword", label: "the step order",
        why: "The staircase climbs chronologically, so the window sorts by mon. ORDER BY n instead deals the steps by size — probed, the cum = 16 assert then smears across seven tied rows instead of landing on one month, and the slide loses its date." },
      { answer: "16", kind: "number", label: "the full-roster pin",
        why: "The roster is 16 customers — probed: the staircase reaches 16 exactly at 2024-07, whose single signup completes the seeding. Pin 15 and the assert grabs 2024-06, one signup short of the story." },
    ],
    distractors: ["MAX", "n", "15"],
    walkthrough:
      "Running totals answer 'when did we finish': bucket the sixteen signups into nine monthly steps (2/2/2/2/2/2/2/1/1), then SUM(n) OVER (ORDER BY mon) accumulates — 2, 4, 6 … 15, 16 — and the pin cum = 16 lands on 2024-07, the month the roster completed. The step order is the story: sort the window by n instead of mon and the accumulation re-runs over equal-sized crowds, painting 16 across seven rows at once; a slide needs one date, not seven. MAX as the accumulator paints the best month everywhere (2 on every step) — a staircase that never climbs. And 15 is the 2024-06 step: true, but it's the 'almost finished' slide.",
  },
  {
    id: "cs-1362",
    tier: "easy",
    topic: "w5",
    universe: "fraud",
    title: "The audit trail's walk counter",
    brief:
      "From: Internal audit. Re: the trail census.\n\nThe trail census walks every order in id order and stamps each with how many trail rows have been read so far — the final stamp must equal the row count or rows went missing under audit. The draft lost its counter, its direction and its cap. Rebuild the walk.",
    ask: "One query: the running count of orders walked in id order, ending on the trail's last row.",
    template:
      "SELECT id, total, {1}(*) OVER (ORDER BY id) AS walked\nFROM orders\nORDER BY id {2}\nLIMIT {3};",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the walk counter",
        why: "COUNT(*) OVER (ORDER BY id) stamps 1, 2, 3 … as it walks — probed: 102 at id 102, 103 at id 103. SUM(*) can't count rows; the engine refuses it before the audit even starts." },
      { answer: "DESC", kind: "keyword", label: "the walk direction",
        why: "The census reads newest-first, so the presentation sorts id descending — the last displayed row is id 103 carrying walked = 103, the reconciliation. ASC would present the walk from its first stamp, order 1 at 1, and the census would end mid-trail." },
      { answer: "1", kind: "number", noVerify: true, label: "the final-row cap",
        why: "LIMIT 1 keeps the walk's final stamp — the row the audit reconciles against the 103-row trail. It's a presentation cap; the counter figure itself is what the numbers must prove." },
    ],
    distractors: ["SUM", "ASC", "2"],
    walkthrough:
      "Running COUNT is the walk counter: COUNT(*) OVER (ORDER BY id) stamps every row with how many rows the walk has seen — 1, 2, 3 … 102, 103 — and the final stamp equals COUNT(*) over the whole table, the same reconciliation as the running total but for rows instead of money. Presented descending, the census's bottom line is id 103 stamped 103: trail complete, nothing missing. Swap the counter for SUM(*) and the engine refuses — counting rows is COUNT's job and the audit tooling should fail loudly rather than miscount. Walk ascending to the top of the report and the census ends on stamp 1, order 1 — a trail that starts over every morning.",
  },
  {
    id: "cs-1363",
    tier: "easy",
    topic: "w5",
    universe: "refund-audit",
    title: "The cancelled king's share",
    brief:
      "From: Refund desk. Re: the exposure note.\n\nThe refund note names the single biggest cancelled ticket and what slice of the cancelled book it represents — shares measured inside the cancelled crowd only, re-based on their own pot. Stage the shares over the seven cancelled rows, then pin the king. The draft lost its scale, its crowd and its pin.",
    ask: "One query: the largest cancelled order with its share of the cancelled-book total, staged over cancelled rows only.",
    template:
      "WITH c AS (SELECT id, total, ROUND({1} * total / SUM(total) OVER (), 1) AS share\nFROM orders WHERE status = {2})\nSELECT id, ROUND(total, 2) AS total, share FROM c WHERE share = {3};",
    slots: [
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Exposure shares read as percents — probed cancelled book: 397.99 → 34.5, 206.19 → 17.9, 152.52 → 13.2. Scale by 10.0 and every share prints a decimal-fraction the refund note can't quote." },
      { answer: "'cancelled'", kind: "keyword", label: "the crowd filter",
        why: "The share re-bases on the cancelled pot — SUM(total) OVER () over the 7 filtered rows. Swap to 'pending' and the same query re-bases on the 14-ticket pending pile, where probed no row lands on 34.5: the assert finds nothing." },
      { answer: "34.5", kind: "number", label: "the king's share",
        why: "Probed: order 83 at 397.99 carries 34.5% of the cancelled book — over a third of every refunded dollar. Pin 17.9 and the assert grabs order 95 at 206.19, the silver medal." },
    ],
    distractors: ["10.0", "'pending'", "17.9"],
    walkthrough:
      "Share-of-total inside a filtered crowd: WHERE status = 'cancelled' first trims the 103 orders to the 7-row book, then SUM(total) OVER () paints that book's own pot onto every row, so each share is measured against refunded money only. The king is order 83 — 397.99, a 34.5 slice — with order 95 at 17.9 the runner-up. The filter runs before the window on purpose: this crowd's pot is supposed to be the cancelled book, and moving the filter outside the CTE would re-base every share on lifetime revenue instead, a different audit. Re-base on 'pending' and the same query hunts a share that probed simply doesn't exist there — the assert returns nothing, which is the safest kind of failure.",
  },
  {
    id: "cs-1364",
    tier: "easy",
    topic: "w5",
    universe: "growth",
    title: "One hundred three on every row",
    brief:
      "From: Growth lead. Re: the regional mix slide.\n\nThe mix slide folds 103 orders into four region buckets and paints the total order count on every row, so each bar can caption itself 'x of 103 orders' without a footer query. The draft lost its painter, its fold key and its row cap. Rebuild the slide's query.",
    ask: "One query: the biggest region bucket with the 103-order total painted onto the row.",
    template:
      "SELECT c.region, COUNT(*) AS n, {1}(COUNT(*)) OVER () AS all_orders\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nORDER BY n DESC\nLIMIT {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the total painter",
        why: "SUM(COUNT(*)) OVER () sums the four bucket counts and paints 103 on every row — probed buckets EU 45 / APAC 37 / US 19 / LATAM 2. COUNT(COUNT(*)) OVER () paints 4, the bucket count, mislabeled as orders." },
      { answer: "c.region", kind: "keyword", label: "the fold key",
        why: "GROUP BY c.region builds the four regional buckets the slide promises. Fold by c.id instead and the 'regions' become sixteen customers — probed, the top row reads 24 orders for one account with the same 103 stamp: a customer league, not a mix slide." },
      { answer: "1", kind: "number", noVerify: true, label: "the headline cap",
        why: "LIMIT 1 keeps the slide's headline bar — probed: EU at 45 orders, the biggest bucket. It's a presentation cap; the painted 103 is the figure the caption audit checks." },
    ],
    distractors: ["COUNT", "c.id", "4"],
    walkthrough:
      "The window-over-aggregate paint, region edition: GROUP BY c.region folds the 103 orders into four buckets — EU 45, APAC 37, US 19, LATAM 2 — and SUM(COUNT(*)) OVER () stamps 103 on every row, the caption number that lets each bar say '45 of 103 orders'. Paint with COUNT(COUNT(*)) and the stamp becomes 4 — how many buckets, not how many orders; the slide's caption is now wrong on every bar. Fold by customer instead of region and the same query builds a spend league wearing a mix slide's clothes: sixteen rows, headed by a 24-order account. The AVG paint would read 25.75 on every row — the even-split mirage no real region matches.",
  },
  {
    id: "cs-1365",
    tier: "easy",
    topic: "w5",
    universe: "month-close",
    title: "February's rung on the staircase",
    brief:
      "From: Controller. Re: the close deck's staircase.\n\nThe close deck builds the monthly revenue staircase and asserts February's rung — the month's own spend plus everything before it. The draft lost its accumulator, its step and its assert figure in the template refactor. Rebuild the staircase and pin February.",
    ask: "One query: the running monthly revenue at 2024-02, asserted against the close deck's figure.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon),\nr AS (SELECT mon, rev, {1}(rev) OVER (ORDER BY mon) AS running FROM m)\nSELECT mon, rev, ROUND(running, 2) AS running FROM r WHERE mon = {2} AND ROUND(running, 2) = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the staircase accumulator",
        why: "SUM(rev) OVER (ORDER BY mon) accumulates month by month — probed: 3731.97, 7341.61, 9958.69. MAX(rev) OVER () paints the best-so-far month and February's rung reads 3731.97 (January's figure, still the max) — a staircase that never climbs." },
      { answer: "'2024-02'", kind: "keyword", label: "the pinned step",
        why: "The deck asserts February's rung. Pin '2024-03' and the same query returns March's 9958.69 — a real rung, but the close memo quotes the February number." },
      { answer: "7341.61", kind: "number", label: "the asserted rung",
        why: "Probed: February's rung is 3731.97 + 3609.64 = 7341.61. The assert catches any refactor that silently drops a month — 9958.69 would be March wearing February's label." },
    ],
    distractors: ["MAX", "'2024-03'", "9958.69"],
    walkthrough:
      "The dashboard staircase: bucket orders by month (2024-01 3731.97, 2024-02 3609.64, 2024-03 2617.08 …), then SUM(rev) OVER (ORDER BY mon) accumulates — 3731.97, 7341.61, 9958.69 — because the default frame carries everything from the first bucket to the current one. Pin mon = '2024-02' and assert 7341.61: the rung is January plus February, exactly what the close memo quotes. The accumulator must accumulate — MAX(rev) OVER () runs without error but paints the best month so far, so February's 'rung' reads 3731.97 (January still leads) and the staircase is flat. And the pin is the assertion: point it at '2024-03' and the query returns a true rung for the wrong month, 9958.69.",
  },
  {
    id: "cs-1366",
    tier: "medium",
    topic: "w5",
    universe: "month-close",
    title: "The three-month smoothing",
    brief:
      "From: Controller. Re: the trend line under the bars.\n\nUnder the close deck's monthly bars sits a 3-month moving average, and the review asserts March's smoothed value. Moving windows shrink the frame to a sliding band — the draft lost its band edges, its month pin and its figure. Rebuild the smoothing.",
    ask: "One query: the 3-month moving average of monthly order counts at 2024-03, asserted against the deck's figure.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon),\nw AS (SELECT mon, n, ROUND(AVG(n) OVER (ORDER BY mon {1}), 2) AS ma3 FROM m)\nSELECT mon, n, ma3 FROM w WHERE mon = {2} AND ma3 = {3};",
    slots: [
      { answer: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", kind: "keyword", label: "the three-month band",
        why: "The band takes this month plus the two before it — probed at 2024-03: (8+9+8)/3 = 8.33. A 1-PRECEDING band averages only two months and reads 8.5; a forward band (CURRENT ROW AND 2 FOLLOWING) averages March–May and reads 7.67. Neither is the deck's smoothing." },
      { answer: "'2024-03'", kind: "keyword", label: "the pinned month",
        why: "The review asserts March's smoothed value. Pin '2024-04' and the same frame reads 8.0 there — probed line: 8.0, 8.5, 8.33, 8.0, 7.67 — a real point on the wrong step." },
      { answer: "8.33", kind: "number", label: "the smoothed figure",
        why: "Probed: March's 3-month band averages 8, 9, 8 → 8.33. The assert pins the trend line; 8.5 is the two-month band's answer wearing the smoothing's label." },
    ],
    distractors: ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING", "'2024-04'", "8.5"],
    walkthrough:
      "Moving windows shrink the frame to a sliding band: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW makes every row average itself plus the two months behind it — the probed line reads 8.0 (January, clipped to one month), 8.5, 8.33, 8.0, 7.67. At March the band is January+February+March = (8+9+8)/3 = 8.33, the deck's smoothing point. The edges are honest but different: January's 'average' covers one month because the frame clips at the data boundary. Narrow the band to 1 PRECEDING and March reads 8.5 — a two-month average, not the smoothing the deck plotted; point the band forward (CURRENT ROW AND 2 FOLLOWING) and March smooths March–May into 7.67, a trend line that leaks the future into the past.",
  },
  {
    id: "cs-1367",
    tier: "medium",
    topic: "w5",
    universe: "fraud",
    title: "The exposure league's biggest slice",
    brief:
      "From: Fraud desk. Re: the watchlist memo.\n\nThe watchlist ranks accounts by exposure — cancelled plus pending money — and names the biggest slice of the total risk pot. Stage each account's exposure, paint the pot, then pin the leader's share. The draft lost its crowd, its painter and its pin.",
    ask: "One query: the account holding the biggest share of cancelled-plus-pending exposure, with its pot share asserted.",
    template:
      "WITH x AS (SELECT c.name, ROUND(SUM(o.total),2) AS exposure\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status IN ({1}) GROUP BY c.id),\ns AS (SELECT name, exposure, ROUND(100.0 * exposure / {2}, 1) AS pct FROM x)\nSELECT name, exposure, pct FROM s WHERE pct = {3};",
    slots: [
      { answer: "'cancelled', 'pending'", kind: "keyword", label: "the exposure crowd",
        why: "Exposure is cancelled plus pending money — probed: the two statuses hold 7 and 14 orders, 1152.49 and 6113. Stage on 'pending' alone and the pot re-bases to 6113, where probed no account lands on the pinned share." },
      { answer: "SUM(exposure) OVER ()", kind: "keyword", label: "the risk pot",
        why: "SUM(exposure) OVER () paints 7265.49 — the whole risk pot — onto every staged account. MAX(exposure) OVER () divides by the leader's own 1615.29 and reads 100: everyone compared to the leader, not to the pot." },
      { answer: "22.2", kind: "number", label: "the leader's share",
        why: "Probed: Emma Wilson leads at 1615.29 = 22.2% of the risk pot, ahead of Chloe 18.0 and Alice 17.7. Pin 17.7 and the assert grabs Alice — the third name on the watchlist." },
    ],
    distractors: ["'pending'", "MAX(exposure) OVER ()", "17.7"],
    walkthrough:
      "Two staging passes: fold orders to per-account exposure (only statuses 'cancelled' and 'pending' — 7 tickets worth 1152.49 plus 14 worth 6113), then paint SUM(exposure) OVER () — the 7265.49 pot — and render each account's slice. The pin lands on Emma Wilson: 1615.29 exposed, 22.2% of the pot, ahead of Chloe's 18.0 and Alice's 17.7. Trim the crowd to 'pending' alone and the pot re-bases to 6113 — probed, the pinned share then matches nobody, because Emma's pending-only 1471.43 is 100% of nothing but itself. Divide by MAX(exposure) OVER () and every account is measured against the leader instead of the pot — a leaderboard ratio, not a risk share, and the watchlist memo would quote it all the same.",
  },
  {
    id: "cs-1368",
    tier: "medium",
    topic: "w5",
    universe: "growth",
    title: "Alice's fifth of the store",
    brief:
      "From: Growth lead. Re: the concentration slide.\n\nThe concentration slide asserts the top account's slice of lifetime revenue — one number the board quotes every quarter. Fold orders to per-customer spend, paint the lifetime pot with a window over the aggregate, pin the leader's share. The draft lost its painter, its fold key and its pin.",
    ask: "One query: the top customer's share of lifetime revenue, with the pot painted by a window over the aggregate.",
    template:
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,\nROUND(100.0 * SUM(o.total) / {1}, 2) AS pct\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY {2})\nSELECT name, spend, pct FROM s WHERE pct = {3} ORDER BY spend DESC;",
    slots: [
      { answer: "SUM(SUM(o.total)) OVER ()", kind: "keyword", label: "the lifetime pot",
        why: "The window-over-aggregate paints 34833.28 — the summed customer spends — onto every folded row. MAX(SUM(o.total)) OVER () divides by Alice's own 7262.35 and reads 100: the leader compared to herself." },
      { answer: "c.id", kind: "keyword", label: "the fold key",
        why: "The slide is per customer, so the fold is GROUP BY c.id. Fold by c.region and the league becomes four region pots — probed shape, no region lands on the pinned share — a mix slide wearing the concentration slide's pin." },
      { answer: "20.85", kind: "number", label: "the asserted share",
        why: "Probed: Alice Chen's 7262.35 is 20.85% of lifetime revenue — a fifth of the store in one account. Emma follows at 19.06; pin that and the assert crowns the wrong account." },
    ],
    distractors: ["MAX(SUM(o.total)) OVER ()", "c.region", "19.06"],
    walkthrough:
      "Windows can ride on aggregates: GROUP BY c.id folds 103 orders into 16 customer spends, and SUM(SUM(o.total)) OVER () — a window over the folded rows — paints 34833.28 on every one of them. The share column divides each spend by that pot: Alice 7262.35 → 20.85, Emma 6640.56 → 19.06, Grace 4574.23 → 13.13. The pin asserts the headline: a fifth of the store sits in one account. Re-fold by region and the same query builds a four-row mix table where the 20.85 pin matches nothing — the assert going empty is the tell that the fold key changed. And MAX(SUM(o.total)) OVER () as the 'pot' divides Alice by Alice: 100 every time, the concentration slide's classic self-comparison bug.",
  },
  {
    id: "cs-1369",
    tier: "hard",
    topic: "w5",
    universe: "fraud",
    title: "The dust on rung two",
    brief:
      "From: Internal audit. Re: the float-dust finding.\n\nAudit flagged the running revenue walk: rung two prints 993.35 in every report but the engine holds a longer, uglier number — binary float dust from the accumulation itself. Rebuild the raw walk (no display rounding at the rung), land on order 2, and assert the exact stored value so the finding quotes the engine, not the report.",
    ask: "One query: the raw running total at order 2, asserted against the exact engine-stored figure.",
    template:
      "WITH r AS (SELECT id, total, {1}(total) OVER (ORDER BY id) AS run FROM orders)\nSELECT id, total, run FROM r WHERE id = {2} AND run = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the raw accumulator",
        why: "The finding quotes the raw walk, so the rung must be SUM with no ROUND — probed: 576.54, then 993.3499999999999, then 1760.99. AVG(total) OVER () would land order 2 at 496.67, the running mean — a different animal entirely." },
      { answer: "2", kind: "number", label: "the flagged rung",
        why: "Order 2 is where the dust appears — probed: 576.54 + 416.81 stores as 993.3499999999999. Pin 3 and the assert reads rung three's 1760.99, which prints clean and hides the finding." },
      { answer: "993.3499999999999", kind: "number", label: "the engine-stored value",
        why: "Probed verbatim from the engine: the raw accumulation stores 993.3499999999999 — the float dust every report rounds to 993.35. Asserting the display figure would make the query contradict the engine it audits." },
    ],
    distractors: ["AVG", "3", "1760.99"],
    walkthrough:
      "The walk in raw floats: SUM(total) OVER (ORDER BY id) accumulates 576.54, then 576.54 + 416.81 — which the engine stores as 993.3499999999999, the binary-float dust that every report's ROUND(…, 2) quietly renders as 993.35. Rung three reads 1760.99, and the walk eventually lands on 34833.28, but the audit's finding lives on rung two, so the assert pins id = 2 and the exact stored value. AVG(total) OVER () runs cleanly and lands order 2 at 496.67 — the running mean, a legitimate window that has nothing to do with the finding. The lesson for the finding memo: quote the engine's value verbatim, because the gap between 993.35 and 993.3499999999999 is the whole story.",
  },
  {
    id: "cs-1370",
    tier: "medium",
    topic: "w5",
    universe: "supplier",
    title: "The deepest stock pile",
    brief:
      "From: Procurement lead. Re: the supplier depth table.\n\nThe depth table folds the sixteen products into their six suppliers and asserts the biggest stock pile with the warehouse total painted beside it. The draft lost both its painters and its pins during the review-cycle refactor. Rebuild the table's assert row.",
    ask: "One query: the supplier holding the largest stock pile, with the warehouse total painted onto the row.",
    template:
      "WITH piles AS (SELECT supplier_id, SUM(stock) AS stock_sum, {1}({2}) OVER () AS all_stock\nFROM products GROUP BY supplier_id)\nSELECT supplier_id, stock_sum, all_stock FROM piles WHERE stock_sum = {3} AND all_stock = {4};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the warehouse painter",
        why: "SUM(SUM(stock)) OVER () sums the six folded piles and paints 2845 on every row. MAX(SUM(stock)) OVER () paints the biggest pile itself — 850 — so the row would compare the pile to itself; COUNT would paint 6, the supplier count." },
      { answer: "SUM(stock)", kind: "keyword", label: "the folded pile",
        why: "The window rides on the aggregate, so the painted expression is SUM of the per-supplier SUM(stock) — probed piles 850/695/460/305/305/230. SUM(COUNT(*)) OVER () would paint 16, the SKU count, wearing a units label." },
      { answer: "850", kind: "number", label: "the biggest pile",
        why: "Probed: supplier 2 holds 850 units — the deepest pile, ahead of 695. Pin 695 and the assert grabs the runner-up supplier instead of the depth leader." },
      { answer: "2845", kind: "number", label: "the painted warehouse total",
        why: "Probed: the six piles sum to 2845, painted onto every row by the window. The assert proves the paint — 4170 would mean someone summed a constant instead of the piles." },
    ],
    distractors: ["COUNT", "MAX", "COUNT(*)", "695"],
    walkthrough:
      "Window-over-aggregate with a constant instead: GROUP BY supplier_id folds 16 products into six piles — 850, 695, 460, 305, 305, 230 — and SUM(SUM(stock)) OVER () paints their total, 2845, onto every folded row. The assert pins the leader: supplier 2's 850 units, with the warehouse figure riding the same row for the caption. The painters are where drafts go wrong: MAX(SUM(stock)) OVER () paints 850 (the leader comparing itself to itself), COUNT(COUNT(*)) would paint 6 suppliers, and SUM(COUNT(*)) would paint 16 SKUs — three plausible-looking stamps, only one of which is units of stock. Pin the runner-up's 695 and the table asserts the wrong pile; the audit row exists to catch exactly that.",
  },
  {
    id: "cs-1371",
    tier: "medium",
    topic: "w5",
    universe: "catalog",
    title: "Audio's share of shelf value",
    brief:
      "From: Merchandising lead. Re: the category mix table.\n\nThe mix table folds the catalog's shelf value into its seven categories and asserts the leader's slice — Audio, if the numbers hold. Stage the category pots, paint the shelf total with a window over the aggregate, pin the leader's share. The draft lost its painter and its pin.",
    ask: "One query: the category holding the biggest share of total shelf value, with its share asserted.",
    template:
      "WITH c AS (SELECT category, ROUND(SUM(price), 2) AS cat_price,\nROUND({3} * SUM(price) / {1}, 1) AS pct FROM products GROUP BY category)\nSELECT category, cat_price, pct FROM c WHERE pct = {2};",
    slots: [
      { answer: "SUM(SUM(price)) OVER ()", kind: "keyword", label: "the shelf-value pot",
        why: "The window-over-aggregate paints 1148.43 — all sixteen prices — onto every category row. MAX(SUM(price)) OVER () divides by Audio's own 328.98 and reads 100: the leader compared to herself." },
      { answer: "28.6", kind: "number", label: "the leader's share",
        why: "Probed: Audio leads at 328.98 = 28.6% of shelf value, ahead of Wearables 24.3 and Electronics 15.1. Pin 24.3 and the assert crowns Wearables — the runner-up's figure." },
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Category shares are quoted in percent — probed ladder 28.6 / 24.3 / 15.1 / 14.7 / 7.3 / 7.2 / 2.8. Scale by 10.0 and the table prints 2.9-style fractions the merchandising deck can't use." },
    ],
    distractors: ["MAX(SUM(price)) OVER ()", "24.3", "10.0"],
    walkthrough:
      "Category mix with a window over the aggregate: GROUP BY category folds sixteen prices into seven pots — Audio 328.98, Wearables 278.99, Electronics 173.49, Video 168.99, Apparel 83.5, Accessories 82.48, Fitness 32 — and SUM(SUM(price)) OVER () paints the 1148.43 shelf total on every row. Each share divides its pot by the paint: Audio 28.6 leads, Wearables 24.3 follows. The pin asserts the merchandising headline. Re-base on MAX(SUM(price)) OVER () and every category is measured against Audio itself — the leader reads 100 and the mix table becomes a ratio-to-leader chart nobody asked for. The scale chip matters too: these are percents, and the probed ladder is what the deck quotes.",
  },
  {
    id: "cs-1372",
    tier: "easy",
    topic: "w5",
    universe: "catalog",
    title: "The anchor under a DESC walk",
    brief:
      "From: Catalog lead. Re: the shelf-walk anchor.\n\nThe shelf walk reads products in id DESC order — newest first — and every row must carry the walk's anchor: the FIRST_VALUE the descending walk opens on. The draft lost its direction, its pin row and its assert figure. Rebuild it so the anchor is asserted on the last catalog row.",
    ask: "One query: the anchor value a descending id walk opens on, asserted at product 16.",
    template:
      "WITH f AS (SELECT id, name, price, FIRST_VALUE(price) OVER (ORDER BY id {1}) AS anchor FROM products)\nSELECT id, name, ROUND(price, 2) AS price, ROUND(anchor, 2) AS anchor FROM f WHERE id = {2} AND anchor = {3};",
    slots: [
      { answer: "DESC", kind: "keyword", label: "the walk direction",
        why: "The walk opens on the biggest id, so FIRST_VALUE anchors on id 16 — probed: every row's anchor reads 32 under DESC. ASC would anchor on the catalog's first product instead, painting 89.99 everywhere and failing the assert." },
      { answer: "16", kind: "number", label: "the pinned row",
        why: "Product 16 is the walk's opening row under DESC — probed: its anchor equals its own price, 32. Pin 1 and the assert still passes under DESC (the anchor is 32 everywhere), but the row is the keyboard's, not the mat's." },
      { answer: "32", kind: "number", label: "the anchor figure",
        why: "Probed: FIRST_VALUE(price) OVER (ORDER BY id DESC) = 32 on every row — the Yoga Mat's price opens the walk. 89.99 is the ASC anchor, the keyboard's figure." },
    ],
    distractors: ["ASC", "1", "89.99"],
    walkthrough:
      "FIRST_VALUE reads the frame's first row, so the anchor is whichever row the window's ORDER BY puts first. Under ORDER BY id DESC the walk opens on id 16 — the Yoga Mat at 32 — and every row's anchor reads 32, probed at both id 1 and id 16. At the pinned row the anchor equals the row's own price, because under DESC that row IS the frame's start. Flip to ASC and the anchor becomes 89.99 everywhere — the Mechanical Keyboard opens an ascending walk — which is the same function producing a different fact purely from direction. That's the frame law under FIRST_VALUE: the 'first' row is whatever the ORDER BY says it is, and the assert exists to catch the flip.",
  },
  {
    id: "cs-1373",
    tier: "hard",
    topic: "w5",
    universe: "inventory",
    title: "The unwind shelf",
    brief:
      "From: Ops manager. Re: the pick-path tail.\n\nThe pick-path report runs the stock walk backwards: each shelf needs what REMAINS from it to the end of the catalog — a frame that starts at the current row and runs to the last. The draft lost its start bound and its pins. Rebuild the unwind so the final shelf asserts what it alone holds.",
    ask: "One query: the remaining-stock frame's value at product 16, where the last shelf sees only itself.",
    template:
      "WITH r AS (SELECT id, name, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN {1} AND UNBOUNDED FOLLOWING) AS remaining FROM products)\nSELECT id, name, stock, remaining FROM r WHERE id = {2} AND remaining = {3};",
    slots: [
      { answer: "CURRENT ROW", kind: "keyword", label: "the frame's start bound",
        why: "The unwind starts at the current shelf and runs to the end — probed line: 2845, 2725, 2425 … landing 220 at id 16. Start 1 PRECEDING instead and the last shelf's frame drags its neighbour in, reading 330; start UNBOUNDED PRECEDING and every row paints the full 2845." },
      { answer: "16", kind: "number", label: "the final shelf pin",
        why: "Product 16 is the walk's last row — probed: its unwind frame holds only itself, so remaining equals its own 220. Pin 1 and the assert reads 2845, the whole warehouse, on the first shelf." },
      { answer: "220", kind: "number", label: "the asserted remainder",
        why: "Probed: at id 16 the frame CURRENT ROW AND UNBOUNDED FOLLOWING covers one row — the Yoga Mat's 220 units. 2845 would be the running (forward) frame's answer at the same row; the unwind is its mirror." },
    ],
    distractors: ["UNBOUNDED PRECEDING", "1 PRECEDING", "1", "2845"],
    walkthrough:
      "Frames can face backwards: ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING makes SUM(stock) read what remains from this shelf to the catalog's end — the probed unwind line runs 2845, 2725, 2425 … down to 220 at the last shelf, the exact mirror of the running total. At id 16 the frame covers a single row, so the last shelf's remaining equals its own stock, 220 — the pick-path fact that the last bin needs nothing after it. Start the frame 1 PRECEDING and the final shelf drags the jersey's 110 units in, reading 330; start UNBOUNDED PRECEDING and the 'unwind' degenerates to the full 2845 on every row, which is the running total in disguise. The forward walk at id 16 also reads 2845 — the two frames only agree when the frame covers everything.",
  },
  {
    id: "cs-1374",
    tier: "medium",
    topic: "w5",
    universe: "expense",
    title: "The opex staircase's May rung",
    brief:
      "From: Finance partner. Re: the burn review.\n\nThe burn review walks monthly operating expenses in calendar order and asserts May's rung — the spend so far — against the ledger's staged figure. The draft lost its accumulator, its step order and its pin. Rebuild the staircase from the staged month buckets.",
    ask: "One query: the running operating-expense total at 2024-05, asserted against the staged figure.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo),\nr AS (SELECT mo, spend, {1}(spend) OVER (ORDER BY {2}) AS running FROM m)\nSELECT mo, spend, running FROM r WHERE running = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the burn accumulator",
        why: "SUM(spend) OVER (ORDER BY mo) accumulates the staged months — probed rungs 1719, 3159, 5076, 6825, 8305. MAX(spend) OVER () paints the biggest month so far and May's 'rung' reads 1917 — a ceiling, not a cumulative." },
      { answer: "mo", kind: "keyword", label: "the calendar step order",
        why: "A burn staircase climbs in calendar order, so the window sorts by the month bucket mo. ORDER BY spend instead climbs by size — the walk re-orders itself and the pinned rung lands on a different month's figure." },
      { answer: "8305", kind: "number", label: "the May rung",
        why: "Probed: 1719 + 1440 + 1917 + 1749 + 1480 = 8305 — May's cumulative burn. Pin 5076 and the assert reads March's rung, two months early." },
    ],
    distractors: ["MAX", "spend", "5076"],
    walkthrough:
      "The expense staircase mirrors the revenue one: stage 36 expense rows into month buckets (1719, 1440, 1917, 1749, 1480 …), then SUM(spend) OVER (ORDER BY mo) accumulates — 1719, 3159, 5076, 6825, 8305 — and the pin asserts May's rung, 8305, the burn-to-date the review quotes. The step order is the calendar: sort the window by spend instead and the accumulation re-runs over a size-sorted crowd, landing the pinned figure on some other month's row. MAX as the accumulator paints the biggest month so far — May's 'rung' would read 1917, March's spike wearing May's date. The walk's final rung reaches the expense grand total 25416, the same reconciliation the revenue walk makes with 34833.28.",
  },
  {
    id: "cs-1375",
    tier: "medium",
    topic: "w5",
    universe: "growth",
    title: "The region pie's EU wedge",
    brief:
      "From: Growth lead. Re: the order-mix table.\n\nThe mix table folds 103 orders into four region buckets and asserts the biggest wedge's share — counted in orders, not dollars. Stage the bucket counts, paint the total with a window over the aggregate, pin the wedge. The draft lost its painter and its pin.",
    ask: "One query: the region holding the biggest share of orders, with its percentage asserted.",
    template:
      "WITH r AS (SELECT c.region AS region, COUNT(*) AS n,\nROUND({3} * COUNT(*) / {1}, 1) AS pct\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region)\nSELECT region, n, pct FROM r WHERE pct = {2} ORDER BY n DESC;",
    slots: [
      { answer: "SUM(COUNT(*)) OVER ()", kind: "keyword", label: "the order pot",
        why: "The window-over-aggregate paints 103 — all four bucket counts summed — onto every row. MAX(COUNT(*)) OVER () divides by the EU bucket's own 45 and reads 100: the wedge compared to itself." },
      { answer: "43.7", kind: "number", label: "the EU wedge's share",
        why: "Probed: EU holds 45 of 103 orders = 43.7%, ahead of APAC 35.9, US 18.4, LATAM 1.9. Pin 35.9 and the assert crowns APAC — the runner-up wedge." },
      { answer: "100.0", kind: "keyword", label: "the percent scale",
        why: "Mix shares are quoted in percent — probed ladder 43.7 / 35.9 / 18.4 / 1.9. Scale by 10.0 and the table prints 4.4-style fractions the deck can't caption." },
    ],
    distractors: ["MAX(COUNT(*)) OVER ()", "SUM(*)", "35.9"],
    walkthrough:
      "The mix table counts orders, not money: GROUP BY c.region folds the 103 orders into four buckets — EU 45, APAC 37, US 19, LATAM 2 — and SUM(COUNT(*)) OVER () paints 103 on every row, so each wedge divides by the whole pie. EU's wedge reads 43.7, the assert the memo pins. The paint must sum the bucket counts: MAX(COUNT(*)) OVER () re-bases on EU itself and reads 100, and SUM(*) isn't a legal call — the engine refuses it rather than guess. Note what the fold counts: 45 EU orders come from only 8 EU customers — the same query folded on customers would tell a different story. Pin 35.9 and the table crowns APAC; the wedge order is the whole slide.",
  },
  {
    id: "cs-1376",
    tier: "medium",
    topic: "w5",
    universe: "refund-audit",
    title: "The delivered staircase's fourth rung",
    brief:
      "From: Refund desk. Re: the delivered-money walk.\n\nThe desk's exposure walk runs over delivered orders ONLY — the crowd filtered before the window — and asserts the fourth rung of that staircase. The draft lost its accumulator, its crowd and its pin. Rebuild the walk so the filter feeds the frame.",
    ask: "One query: the running total over delivered orders at their fourth walked row, asserted.",
    template:
      "WITH d AS (SELECT id, total, ROUND({1}(total) OVER (ORDER BY id), 2) AS run\nFROM orders WHERE status = {2})\nSELECT id, total, run FROM d WHERE run = {3};",
    slots: [
      { answer: "SUM", kind: "keyword", label: "the delivered accumulator",
        why: "SUM(total) OVER (ORDER BY id) accumulates the delivered crowd — probed rungs 416.81, 1169.77, 1345.45, 1977.74. AVG(total) OVER () paints the running mean, and probed no mean ever equals the pinned figure — the assert would come back empty." },
      { answer: "'delivered'", kind: "keyword", label: "the crowd filter",
        why: "The walk measures delivered money only, so WHERE trims the 103 orders to the 52 delivered rows before the window runs. Swap to 'shipped' and the staircase re-stages over 30 different rows — probed, the pinned rung value never occurs there." },
      { answer: "1977.74", kind: "number", label: "the fourth rung",
        why: "Probed: the delivered walk's fourth step is order 13's 632.29 on top of 1345.45 — rung 1977.74. Pin 1169.77 and the assert reads the second rung instead." },
    ],
    distractors: ["AVG", "'shipped'", "1169.77"],
    walkthrough:
      "Filter-then-window is the honest order here: WHERE status = 'delivered' trims the trail to its 52 delivered rows, and only then does SUM(total) OVER (ORDER BY id) accumulate — 416.81, 1169.77, 1345.45, 1977.74 — so the staircase measures delivered money exclusively. The pin asserts the fourth rung: order 13's 632.29 lands the walk at 1977.74. Re-stage on 'shipped' and the same query walks 30 different tickets — probed, 1977.74 never occurs on that staircase, so the assert fails loudly instead of lying quietly. And the accumulator matters: AVG(total) OVER () produces a real running mean, but probed no mean equals the pinned rung — a smooth line where a cumulative was promised.",
  },
  {
    id: "cs-1377",
    tier: "hard",
    topic: "w5",
    universe: "refund-audit",
    title: "The tie-day the frames split on",
    brief:
      "From: Refund desk. Re: the day-boundary dispute.\n\nTwo orders share one created_at day, and the desk's day-based running total disagrees with itself depending on the frame: RANGE folds tied peers into one step, ROWS counts physical rows. Rebuild the walk over created_at with the folding frame, land on the tie-day's first order, and assert the figure both tickets will show once the day completes.",
    ask: "One query: the RANGE running total by created_at at order 5, asserted against the fold-the-ties figure.",
    template:
      "WITH w AS (SELECT id, total, SUM(total) OVER (ORDER BY created_at {1} BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS run FROM orders)\nSELECT id, ROUND(total, 2) AS total, ROUND(run, 2) AS run FROM w WHERE id = {2} AND ROUND(run, 2) = {3};",
    slots: [
      { answer: "RANGE", kind: "keyword", label: "the value-based frame",
        why: "RANGE folds tied peers: order 5's frame includes the whole 2024-01-02 day — probed 752.96 + 877.86 = 1630.82. ROWS stops at the physical row and reads 1478.30 there; the two frames disagree exactly on tie days." },
      { answer: "5", kind: "number", label: "the tie-day's first order",
        why: "Order 5 (725.34) is the first physical row of the shared day — the only row where the frames split. Pin 7 and the assert reads order 7, whose 152.52 completes the day and where both frames already agree." },
      { answer: "1630.82", kind: "number", label: "the folded rung",
        why: "Probed: with RANGE, order 5's rung is 1630.82 — everything through the end of its tie day. 1478.30 is the ROWS figure: the same walk refusing to fold the ties." },
    ],
    distractors: ["ROWS", "7", "1478.30"],
    walkthrough:
      "Orders 5 and 7 share created_at 2024-01-02 (the day holds 725.34 + 152.52 = 877.86), and that tie is where RANGE and ROWS diverge. RANGE compares VALUES: order 5's frame runs through every peer of its own key, so it swallows the whole day — 752.96 + 877.86 = 1630.82. ROWS counts PHYSICAL rows: order 5's frame stops after itself, reading 1478.30. Order 7 shows 1630.82 under both, because by its row the day is complete either way — which is why the split lives on the tie-day's first order. Assert 1630.82 at id 5 and the query has committed to the folding interpretation; swap the frame to ROWS and the same walk prints 1478.30 there, a defensible-but-different accounting of the same day.",
  },
  {
    id: "cs-1378",
    tier: "hard",
    topic: "w5",
    universe: "fraud",
    title: "The LAST_VALUE that forgot its job",
    brief:
      "From: Internal audit. Re: the walk's final-value column.\n\nThe audit's walk report carries a 'final value' column, but the draft's LAST_VALUE returned each row's own total — the default frame ends at the current row, so 'last' means 'this one'. Rebuild with the full frame so LAST_VALUE sees the whole partition, land on row 1, and assert the trail's true final ticket.",
    ask: "One query: LAST_VALUE over the full frame at order 1, asserted against the walk's final ticket value.",
    template:
      "WITH d AS (SELECT id, total, LAST_VALUE(total) OVER (ORDER BY id {1}) AS lv FROM orders)\nSELECT id, ROUND(total, 2) AS total, ROUND(lv, 2) AS lv FROM d WHERE id = {2} AND ROUND(lv, 2) = {3};",
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", label: "the full-frame repair",
        why: "The default frame ends at CURRENT ROW, so LAST_VALUE degenerates to the row's own total — probed: 576.54 at id 1. The full frame lets LAST_VALUE see the whole partition and read 324.16, the trail's final ticket, on every row." },
      { answer: "1", kind: "number", label: "the degeneration's row",
        why: "Row 1 is where the default frame's bug shows — probed: its own total 576.54 posing as the 'final value'. Pin 103 and both frames agree there (the last row is its own last value), hiding the bug." },
      { answer: "324.16", kind: "number", label: "the true final ticket",
        why: "Probed: order 103's 324.16 is the walk's last value — the full frame paints it onto every row. 576.54 is the degenerate default-frame answer at row 1: the row comparing itself to itself." },
    ],
    distractors: ["ROWS UNBOUNDED PRECEDING", "103", "576.54"],
    walkthrough:
      "LAST_VALUE's trap is the default frame: with ORDER BY and no explicit frame, the window ends at CURRENT ROW, so 'the last value so far' is just the current row's own total — probed, id 1's 'final value' reads 576.54, itself. The repair is the full frame, ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, which lets LAST_VALUE see the entire partition: 324.16 on every row, order 103's ticket, the walk's genuine final value. The shorthand ROWS UNBOUNDED PRECEDING compiles to the same default ending and reproduces the bug — probed, id 1 still reads 576.54 under it. Pin row 103 and the audit misses the whole finding, because at the partition's last row both frames agree; the degeneration only shows on the rows before the end.",
  },
  {
    id: "cs-1379",
    tier: "hard",
    topic: "w5",
    universe: "month-close",
    title: "The explicit spelling of the default",
    brief:
      "From: Controller. Re: the documented staircase.\n\nThe close playbook now requires frames spelled out in full — no silent defaults — so the revenue staircase must say RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW where it used to say nothing. Rebuild the staircase with the explicit frame, land on March, and assert the rung the bare spelling always produced.",
    ask: "One query: the monthly revenue staircase with an explicit RANGE frame, pinned at 2024-03's rung.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY mon),\nr AS (SELECT mon, rev, SUM(rev) OVER (ORDER BY mon {1}) AS running FROM m)\nSELECT mon, rev, ROUND(running, 2) AS running FROM r WHERE mon = {2} AND ROUND(running, 2) = {3};",
    slots: [
      { answer: "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", label: "the explicit default frame",
        why: "This is what the bare spelling meant all along — probed identical on all 14 month rows. The full-frame spelling (UNBOUNDED FOLLOWING at the end) instead paints 34833.28 on every row, and the unwind spelling reads the burn-down — neither is the staircase." },
      { answer: "'2024-03'", kind: "keyword", label: "the pinned month",
        why: "The playbook asserts March's rung. Pin '2024-02' and the same query returns 7341.61 — February's figure, one month early for the documented check." },
      { answer: "9958.69", kind: "number", label: "the March rung",
        why: "Probed: 3731.97 + 3609.64 + 2617.08 = 9958.69 — the staircase's third step, identical under the explicit frame and the bare default. Pin 7341.61 and the assert pins February wearing March's label." },
    ],
    distractors: ["RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "'2024-02'", "7341.61"],
    walkthrough:
      "The default frame with ORDER BY IS RANGE UNBOUNDED PRECEDING AND CURRENT ROW — probed byte-identical to the explicit spelling on all 14 month rows — so this case documents what the engine was already doing: March's rung stays 3731.97 + 3609.64 + 2617.08 = 9958.69. The spelling matters the moment someone 'fixes' the frame: UNBOUNDED FOLLOWING at the end turns the staircase into a constant 34833.28 paint (the full-frame grand total on every row), and a forward frame turns it into the burn-down. Month buckets never tie, so ROWS would agree with RANGE here — the frames only split on ties, which is the tie-day case's lesson. The pin is the regression test: 9958.69 proves the documentation didn't change the number.",
  },
  {
    id: "cs-1380",
    tier: "hard",
    topic: "w5",
    universe: "pricing",
    title: "The three-ticket moving band",
    brief:
      "From: Pricing lead. Re: the smoothed ticket line.\n\nThe pricing review smooths ticket sizes with a centered three-row band — the row before, the row, the row after — and asserts the smoothed value at order 3. The draft lost both band edges and its pins. Rebuild the band and pin the assertion.",
    ask: "One query: the 1-PRECEDING/1-FOLLOWING moving average at order 3, asserted against the review's figure.",
    template:
      "WITH w AS (SELECT id, total, ROUND(AVG(total) OVER (ORDER BY id ROWS BETWEEN {1} AND {2}), 2) AS band FROM orders)\nSELECT id, total, band FROM w WHERE id = {3} AND band = {4};",
    slots: [
      { answer: "1 PRECEDING", kind: "keyword", label: "the band's back edge",
        why: "The centered band starts one row back — probed at order 3: the frame covers orders 2–4. Start at CURRENT ROW and the band drops order 2, reading 463.06; the smoothing loses its centered shape." },
      { answer: "1 FOLLOWING", kind: "keyword", label: "the band's front edge",
        why: "The band ends one row ahead — order 3's frame is 416.81, 767.64, 158.48 → 447.64. End at CURRENT ROW and the same row reads 592.23, a backward-only band mislabeled as centered." },
      { answer: "3", kind: "number", label: "the pinned row",
        why: "Order 3 is where the review asserts the band — probed line: 496.67, 587.0, 447.64, 550.49. Pin 2 and the assert reads 587.0, the second step's figure." },
      { answer: "447.64", kind: "number", label: "the smoothed figure",
        why: "Probed: (416.81 + 767.64 + 158.48) / 3 = 447.64 at order 3. The assert pins the centered band; 592.23 is the backward-only band's answer at the same row." },
    ],
    distractors: ["CURRENT ROW", "UNBOUNDED FOLLOWING", "2", "592.23"],
    walkthrough:
      "The centered band is two bounds: ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING makes every row average itself plus one neighbour on each side — probed line 496.67, 587.0, 447.64, 550.49. At order 3 the frame holds 416.81 + 767.64 + 158.48 = 447.64 per row, the review's assertion. The edges decide the shape: drop the back edge (CURRENT ROW start) and order 3 reads 463.06; drop the front edge (CURRENT ROW end) and it reads 592.23 — both real averages, neither the centered one. Frames clip at the boundary, so order 1's band covers only two rows: honest, but different. And the start bound can't be UNBOUNDED FOLLOWING — the engine refuses the spec outright rather than average a frame that faces the wrong way.",
  },
  {
    id: "cs-1381",
    tier: "easy",
    topic: "w5",
    universe: "month-close",
    title: "The pending crowd's constant",
    brief:
      "From: Controller. Re: the accrual check.\n\nThe close's accrual check paints the pending crowd's size and pot onto every pending row — constants the reviewer can eyeball against the manual count without a footer. The draft lost its status filter, its crowd pin and its cap. Rebuild the check.",
    ask: "One query: pending orders each stamped with the pending crowd size, pinned to the manual count.",
    template:
      "WITH w AS (SELECT id, status, COUNT(*) OVER () AS seen, SUM(total) OVER () AS pot\nFROM orders WHERE status = {1})\nSELECT id, status, seen, ROUND(pot, 2) AS pot FROM w WHERE seen = {2} ORDER BY id LIMIT {3};",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the status filter",
        why: "The paint must describe the pending crowd, so WHERE trims to those rows first — probed: 14 rows, pot 6113. Filter 'cancelled' and the same query paints the 7-ticket refund book; the pin then matches nothing." },
      { answer: "14", kind: "number", label: "the crowd pin",
        why: "Probed: COUNT(*) OVER () paints 14 on all 14 pending rows — the manual count the reviewer checks against. Pin 7 and the assert hunts the cancelled crowd's size inside the pending pile." },
      { answer: "3", kind: "number", noVerify: true, label: "the eyeball cap",
        why: "LIMIT 3 keeps the check to a screen of rows — the paint is constant, so three rows carry the same evidence as fourteen. It's a presentation cap; the 14 and 6113 figures are what the audit verifies." },
    ],
    distractors: ["'cancelled'", "7", "2"],
    walkthrough:
      "COUNT(*) OVER () with no ORDER BY paints the whole current crowd on every row — no walking, one constant. WHERE first trims to the 14 pending rows, so the paint reads 14 everywhere with the pot 6113 beside it, and the reviewer checks those constants against the manual accrual count. The filter decides what the paint means: status 'cancelled' and the same query paints 7 (the refund book) — the assert for 14 then returns nothing, which is the check failing safely. The cap is pure presentation; every pending row carries identical evidence, so LIMIT 3 shows the same fact fourteen rows would. This is the no-ORDER-BY window's whole personality: it aggregates without collapsing, a GROUP BY that keeps its rows.",
  },
  {
    id: "cs-1382",
    tier: "hard",
    topic: "w5",
    universe: "growth",
    title: "The board's share-and-rank assert",
    brief:
      "From: Growth lead. Re: the board assert.\n\nThe board's concentration slide asserts two facts about its champion at once: the lifetime-revenue share and the rank. Stage the shares, rank the spends on top of the staged table, and pin both figures on one row. The draft lost its ranker, its direction and both pins.",
    ask: "One query: the customer holding the asserted revenue share AND rank 1, in one assert row.",
    template:
      "WITH s AS (SELECT c.name, ROUND(SUM(o.total), 2) AS spend,\nROUND(100.0 * SUM(o.total) / SUM(SUM(o.total)) OVER (), 2) AS pct\nFROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.id),\nt AS (SELECT name, spend, pct, {1}() OVER (ORDER BY spend {2}) AS rk FROM s)\nSELECT name, spend, pct, rk FROM t WHERE pct = {3} AND rk = {4};",
    slots: [
      { answer: "RANK", kind: "keyword", label: "the ranker",
        why: "RANK() OVER (ORDER BY spend …) numbers the staged league — probed 1..16 with no ties. NTILE() and LAG() can't rank: the engine refuses both for missing arguments before the board ever sees a number." },
      { answer: "DESC", kind: "keyword", label: "the league direction",
        why: "Rank 1 must be the biggest spender, so the window sorts descending — probed champion Alice Chen 7262.35. ASC would hand rank 1 to Olivia Brown's 444.80 and the assert's share would never meet its rank." },
      { answer: "20.85", kind: "number", label: "the asserted share",
        why: "Probed: Alice's 7262.35 is 20.85% of lifetime revenue — the concentration figure the board quotes. Pin 19.06 and the assert demands Emma's share sit at rank 1, which it doesn't." },
      { answer: "1", kind: "number", label: "the asserted rank",
        why: "The assert demands the champion: share 20.85 AND rank 1 on one row — probed, exactly Alice's. Pin 2 and no row can satisfy both pins; the assert returns empty." },
    ],
    distractors: ["NTILE", "LAG", "ASC", "2"],
    walkthrough:
      "Two windows, two stages: the CTE paints each customer's share of the 34833.28 pot (Alice 20.85, Emma 19.06, Grace 13.13 …), then RANK() OVER (ORDER BY spend DESC) numbers that staged league 1..16 — spends never tie, so RANK walks clean. The assert demands both facts on one row: pct = 20.85 AND rk = 1, which probed only Alice satisfies. Flip the direction and rank 1 becomes Olivia's 444.80 — the assert then demands a 20.85 share from the smallest spender and returns nothing, the safest possible failure. NTILE and LAG aren't rankers: NTILE() needs its bucket count, LAG() needs its offset, and the engine rejects both bare calls — a rank column that never existed can't lie on a board slide.",
  },
  {
    id: "cs-1383",
    tier: "hard",
    topic: "w5",
    universe: "funnel",
    title: "Alice's private staircase",
    brief:
      "From: Lifecycle marketing. Re: the account timeline.\n\nThe VIP timeline walks one account's orders in id order — a partitioned staircase that starts fresh for her, not the store's 103-row walk. The draft lost its partition keyword, its account pin and its final rung. Rebuild the private staircase and pin the rung where her walk completes.",
    ask: "One query: the partitioned running total for customer 1, pinned at the rung where her spend completes.",
    template:
      "WITH a AS (SELECT customer_id, id, total, SUM(total) OVER ({1} BY customer_id ORDER BY id) AS run FROM orders WHERE customer_id = {2})\nSELECT customer_id, id, ROUND(total, 2) AS total, ROUND(run, 2) AS run FROM a WHERE ROUND(run, 2) = {3};",
    slots: [
      { answer: "PARTITION", kind: "keyword", label: "the partition keyword",
        why: "PARTITION BY customer_id gives account 1 its own staircase — probed rungs 767.64, 920.16, 1552.45 … 7262.35. Drop to a second ORDER BY and the engine refuses the OVER clause outright; the store walk would bleed every other customer in." },
      { answer: "1", kind: "number", label: "the account pin",
        why: "Customer 1 is Alice Chen, the store's top account — probed: her staircase ends at 7262.35 on order 101. Pin 2 and the assert walks Bruno Silva's two orders instead, topping out at 852.44." },
      { answer: "7262.35", kind: "number", label: "the completing rung",
        why: "Probed: Alice's final rung is 7262.35 — her whole 24-order spend, reached at order 101's 142.25. Pin 6640.56 and the assert hunts Emma's ceiling inside Alice's walk, where it never occurs." },
    ],
    distractors: ["ORDER", "2", "6640.56"],
    walkthrough:
      "PARTITION BY restarts the walk per account: customer 1's partition holds 24 orders, and SUM(total) OVER (PARTITION BY customer_id ORDER BY id) climbs her private staircase — 767.64, 920.16, 1552.45 … 7120.10 — until order 101's 142.25 completes it at 7262.35, her lifetime figure and the store's largest account pot. Without the partition keyword the clause can't even parse (a second ORDER BY inside OVER is a syntax error), which is the engine refusing to guess. Pin account 2 and the same query walks Bruno's two-ticket staircase to 852.44 — a real walk, the wrong account. And the final rung's assert is the reconciliation: her 7262.35 equals the plain SUM over her 24 rows, the mean being a flat 302.60 by comparison.",
  },
  {
    id: "cs-1384",
    tier: "hard",
    topic: "w5",
    universe: "supplier",
    title: "LATAM's two-rung ladder",
    brief:
      "From: Procurement lead. Re: the regional ladder.\n\nThe regional ladder walks each region's orders separately — a partitioned staircase per region — and asserts LATAM's completing rung on its smallest region. The draft lost its partition keyword, its region pin and its rung figure. Rebuild the ladder and pin the little region's top step.",
    ask: "One query: the region-partitioned running total at LATAM's last order, asserted against its completing rung.",
    template:
      "WITH w AS (SELECT o.id, c.region, o.total, SUM(o.total) OVER ({1} BY c.region ORDER BY o.id) AS run\nFROM orders o JOIN customers c ON c.id = o.customer_id)\nSELECT id, region, ROUND(total, 2) AS total, ROUND(run, 2) AS run FROM w WHERE region = {2} AND ROUND(run, 2) = {3};",
    slots: [
      { answer: "PARTITION", kind: "keyword", label: "the partition keyword",
        why: "PARTITION BY c.region gives each region its own walk — probed: LATAM's ladder has exactly two rungs, 752.96 then 852.44. A second ORDER BY can't replace it; the engine rejects the clause before any region is walked." },
      { answer: "'LATAM'", kind: "keyword", label: "the region pin",
        why: "LATAM is the audit's target — probed, its two rungs are the smallest ladder in the store. Pin 'US' and the assert hunts 852.44 across 19 US rungs; probed, the value never occurs there." },
      { answer: "852.44", kind: "number", label: "the completing rung",
        why: "Probed: order 23's 99.48 lifts LATAM's walk from 752.96 to 852.44 — the region's entire book, spent by one customer. Pin 752.96 and the assert reads the ladder's first rung instead." },
    ],
    distractors: ["ORDER", "'US'", "752.96"],
    walkthrough:
      "PARTITION BY c.region builds four private staircases — EU's 45 rungs ending 15089.23, APAC's 37 ending 11605.45, US's 19 ending 7286.16, LATAM's two ending 852.44 — each restarting from zero. LATAM is the teaching ladder: Bruno Silva's two orders, 752.96 then 99.48, walk to the region's whole book on rung two. The pin asserts the completing rung; point the same assert at 'US' and probed no US rung ever reads 852.44 — the value is unique to LATAM's little ladder. Swap the partition keyword for a second ORDER BY and the clause is a syntax error before a single rung computes. The reconciliation note: 852.44 is both the region's final rung and the plain SUM over its two rows — partition and whole agree because the partition IS the whole here.",
  },
  {
    id: "cs-1385",
    tier: "medium",
    topic: "w5",
    universe: "month-close",
    title: "The two-month rolling pair",
    brief:
      "From: Controller. Re: the pacing check.\n\nThe pacing check smooths order volume with a two-month rolling pair — this month plus the one before — and asserts June's pair. Moving windows take the band; the draft lost its band depth, its month pin and its figure. Rebuild the rolling pair.",
    ask: "One query: the two-month rolling order count at 2024-06, asserted against the pacing memo's figure.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon),\nw AS (SELECT mon, n, SUM(n) OVER (ORDER BY mon ROWS BETWEEN {1} AND CURRENT ROW) AS roll FROM m)\nSELECT mon, n, roll FROM w WHERE mon = {2} AND roll = {3};",
    slots: [
      { answer: "1 PRECEDING", kind: "keyword", label: "the rolling depth",
        why: "The pair is this month plus one back — probed at 2024-06: 8 + 6 = 14. Deepen to 2 PRECEDING and June's frame covers April–June, reading 21; widen to UNBOUNDED and it becomes the running count, 46." },
      { answer: "'2024-06'", kind: "keyword", label: "the pinned month",
        why: "The memo asserts June's pair. Pin '2024-07' and the same frame reads 14 there too (July's 8 rolls with June's 6) — probed, a real row but the wrong month's pin." },
      { answer: "14", kind: "number", label: "the asserted pair",
        why: "Probed: June's two-month pair is 8 + 6 = 14 — the rolling line's dip that the pacing memo flags. 21 is the three-month frame's June answer; 46 is the running count's." },
    ],
    distractors: ["2 PRECEDING", "UNBOUNDED PRECEDING", "'2024-07'", "21"],
    walkthrough:
      "A rolling pair is a frame one row deep: ROWS BETWEEN 1 PRECEDING AND CURRENT ROW makes every month sum itself plus its predecessor — probed line 8, 17, 17, 15, 15, 14 … — and the pin asserts June's pair, 8 + 6 = 14, the soft patch the pacing memo circles. The band depth is the definition: 2 PRECEDING turns June's frame into April–June and reads 21; UNBOUNDED PRECEDING dissolves the rolling pair into the running count, 46 by June. The pin has a twin: July's pair also reads 14 (July's 8 rolling with June's 6), so the memo's month matters as much as the figure. And January's pair covers one month — the frame clips at the boundary, so the line starts honest but different.",
  },
  {
    id: "cs-1386",
    tier: "hard",
    topic: "w5",
    universe: "expense",
    title: "The burn-down from the top",
    brief:
      "From: Finance partner. Re: the remaining-burn column.\n\nThe spend review wants the staircase inverted: each month needs what remains AFTER it — a frame from the current row to the last. The draft lost both frame bounds and its pins. Rebuild the burn-down and pin February's remaining figure.",
    ask: "One query: the remaining-to-spend frame's value at 2024-02, asserted against the review's figure.",
    template:
      "WITH m AS (SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents)/100.0 AS spend FROM expenses GROUP BY mo),\nw AS (SELECT mo, spend, ROUND(SUM(spend) OVER (ORDER BY mo ROWS BETWEEN {1} AND {2}), 2) AS remaining FROM m)\nSELECT mo, spend, remaining FROM w WHERE mo = {3} AND remaining = {4};",
    slots: [
      { answer: "CURRENT ROW", kind: "keyword", label: "the frame's start bound",
        why: "The burn-down starts at the current month — probed line 25416, 23697, 22257, 20340, 18591 … Start UNBOUNDED PRECEDING instead and the frame swallows the whole year, painting 25416 on every row." },
      { answer: "UNBOUNDED FOLLOWING", kind: "keyword", label: "the frame's end bound",
        why: "The frame must run to the last month — probed: February's remaining is 23697, everything after January. End at 1 FOLLOWING and February's frame covers only February–March, reading 3357 — a two-month window wearing the burn-down's name." },
      { answer: "'2024-02'", kind: "keyword", label: "the pinned month",
        why: "The review asserts February's remaining. Pin '2024-01' and the same frame reads 25416 — the whole year still ahead of January, a different row of the burn-down." },
      { answer: "23697", kind: "number", label: "the asserted remainder",
        why: "Probed: 25416 − 1719 (January) = 23697 remains after January — February's burn-down figure. 22257 is March's row; 25416 is the full-year paint." },
    ],
    distractors: ["UNBOUNDED PRECEDING", "1 FOLLOWING", "'2024-01'", "22257"],
    walkthrough:
      "The burn-down is the staircase's mirror: ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING makes SUM(spend) read everything from now to the end — probed line 25416, 23697, 22257, 20340, 18591 … 1650, where the final month's frame covers only itself. February's row asserts 23697: the year's 25416 minus January's 1719. Both bounds matter — start UNBOUNDED PRECEDING and the 'burn-down' paints the full 25416 on every row (the year-total paint), while ending at 1 FOLLOWING shrinks February's frame to February+March's 3357, a rolling pair in burn-down clothing. Pin January and the assert reads the whole year; pin March's 22257 on February's row and the columns disagree by one month of spend — exactly the mismatch the review exists to catch.",
  },
  {
    id: "cs-1387",
    tier: "hard",
    topic: "w5",
    universe: "supplier",
    title: "The walked count that says twenty-four",
    brief:
      "From: Procurement lead. Re: the per-account counter.\n\nThe audit tooling walks orders partitioned by account and stamps each with how many of THAT account's orders have been read — the stamp must restart per account, not run storewide. The draft lost its ordering clause, its row pin and its assert. Rebuild the counter and pin Alice's final stamp.",
    ask: "One query: the account-partitioned running count at order 101, asserted against the account's order count.",
    template:
      "WITH w AS (SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id {1} id) AS walked FROM orders)\nSELECT id, customer_id, walked FROM w WHERE id = {2} AND walked = {3};",
    slots: [
      { answer: "ORDER BY", kind: "keyword", label: "the walk's ordering clause",
        why: "The counter only walks if the window knows the row order — ORDER BY id inside OVER makes the count accumulate 1, 2, 3 … per account. Bare 'ORDER' can't glue the clause together; the engine refuses the malformed OVER before any row is stamped." },
      { answer: "101", kind: "number", label: "the pinned row",
        why: "Order 101 is Alice's last — probed: her partition's stamps run 1..24 and id 101 carries 24. Pin 100 and the assert reads 23, the stamp one ticket before her walk completes." },
      { answer: "24", kind: "number", label: "the account's final stamp",
        why: "Probed: customer 1 holds 24 orders, so the partitioned counter's final stamp is 24 — the per-account reconciliation. A storewide walk would stamp that row 101; the partition is what makes it 24." },
    ],
    distractors: ["ORDER", "100", "23"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY customer_id ORDER BY id) is two windows in one: the partition restarts the count per account, the ORDER BY makes it accumulate — customer 1's stamps run 1 through 24, ending on order 101, her last ticket. The assert pins that final stamp: 24, which equals the plain count of her rows — the per-account reconciliation the tooling exists to make. The same row under a storewide walk would stamp 101, which is precisely the bug the partition prevents. Pin id 100 and the assert reads 23 — one ticket short, the tell that the walk didn't complete. And the clause must be whole: a bare ORDER inside OVER leaves the parser with nothing to order by, and the engine refuses rather than stamp rows in a mystery sequence.",
  },
  {
    id: "cs-1388",
    tier: "hard",
    topic: "w5",
    universe: "catalog",
    title: "The rung before the first",
    brief:
      "From: Catalog lead. Re: the carry-over column.\n\nThe shelf report adds a 'prior stock' column — everything BEFORE the current shelf, carried over from the walk so far. The frame ends one row short of the current row, and the first shelf has no prior at all: the engine must show that honestly. Rebuild the before-frame and pin the third shelf's carry-over.",
    ask: "One query: the before-frame running total at product 3, asserted against the carry-over figure.",
    template:
      "WITH w AS (SELECT id, name, stock, SUM(stock) OVER (ORDER BY id ROWS BETWEEN UNBOUNDED PRECEDING AND {1}) AS prior FROM products)\nSELECT id, name, stock, prior FROM w WHERE id = {2} AND prior = {3};",
    slots: [
      { answer: "1 PRECEDING", kind: "keyword", label: "the frame's end bound",
        why: "The carry-over stops before the current shelf — probed at id 3: the frame covers shelves 1–2 and reads 420. End at 0 PRECEDING (the current row) and the same row reads 505; deepen to 2 PRECEDING and it reads 120, one shelf too few." },
      { answer: "3", kind: "number", label: "the pinned shelf",
        why: "Product 3 is the assert row — probed: its prior is 120 + 300 = 420, two shelves of carry-over. Pin 2 and the assert reads 120, the first shelf's carry-over instead." },
      { answer: "420", kind: "number", label: "the carry-over figure",
        why: "Probed: shelves 1–2 hold 120 + 300 = 420, the stock that precedes product 3. 505 is the including-current frame's figure at the same row — the carry-over column must exclude the shelf itself." },
    ],
    distractors: ["2 PRECEDING", "0 PRECEDING", "2", "505"],
    walkthrough:
      "The before-frame ends one row short: ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING makes SUM(stock) carry everything BEFORE the current shelf — probed 120 on shelf 2, 420 on shelf 3, 2625 on shelf 16 — and row 1's prior is NULL, because the empty frame has nothing to sum. That NULL is the honest answer, not a zero pretending history existed. Pin shelf 3 and assert 420: the two shelves ahead of it. The end bound is the definition — 0 PRECEDING dissolves the carry-over into the ordinary running total (505 at shelf 3, the shelf's own 85 included), and 2 PRECEDING drops shelf 2's 300 from history. Carry-over columns that quietly include the current row are the classic off-by-one this frame exists to prevent.",
  },
];
