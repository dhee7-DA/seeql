// Case wave w4 — Module 5 LAG & LEAD (lesson 32), cs-1317…cs-1352.
// 36 cases: 12 easy / 12 medium / 12 hard, all topic "w4" (LAG/LEAD offsets,
// LAG(col, n, default), MoM deltas, gap analysis between consecutive rows,
// prev/next comparisons, NULL on the first/last row). Every figure traces to
// committed probe receipts: scripts/m5-facts-r4.out (month counts+spends,
// MoM deltas, per-customer chains, gap censuses), this wave's own probe
// scripts/m5-facts-w4.out (re-runnable: bun scripts/m5-facts-w4.ts), and the
// engine-verified header of src/lib/curriculum/drills/m5/window-offsets.ts.
// Each case is mechanically audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesW4: CaseStudy[] = [
  // ============================== EASY ==============================
  {
    id: "cs-1317",
    tier: "easy",
    topic: "w4",
    universe: "growth",
    title: "The signup walk",
    brief:
      "From: Growth lead. Re: the onboarding deck.\n\nThe deck opens with the signup roll: each account with the account that joined right after it, so the founders can narrate the intake order. The intern's draft lost its direction chip during a refactor — the walk now points the wrong way. Rebuild it so column four shows each customer's successor in signup order.",
    ask: "One query: each of the first five customers with the name of the customer who signed up next.",
    template:
      "SELECT id, name, created_at,\n       {1}({2}) OVER (ORDER BY id) AS next_signup\nFROM customers\nORDER BY id\nLIMIT {3};",
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the forward reader",
        why: "The walk must point at the NEXT signup, so the reader is LEAD. Probed walk: Alice Chen → Bruno Silva → Chloe Dubois → Dmitri Volkov → Emma Wilson. LAG would point backward — Alice's row would show NULL instead of Bruno Silva." },
      { answer: "name", kind: "keyword", label: "the column the walk reads",
        why: "The deliverable names successors, so the window reads the name column. Probed alternative walks: LEAD(region) would show EU→LATAM→EU blocks and LEAD(email) would show addresses — neither is the narration the deck quotes." },
      { answer: "5", kind: "number", noVerify: true, label: "the roll's length",
        why: "The deck's opener is the first five accounts, so LIMIT 5. Probed: ids 1–5 with successors Bruno Silva, Chloe Dubois, Dmitri Volkov, Emma Wilson, Farid Nasser — the full table walk runs 16 rows (16 customers, Pedro Alvarez ends it with NULL)." },
    ],
    distractors: ["LAG", "region", "email", "8"],
    walkthrough:
      "LEAD(name) OVER (ORDER BY id) walks the customer table in signup order and lays each row's successor beside it — probed, Alice Chen's row shows Bruno Silva, Bruno's shows Chloe Dubois, and the last account, Pedro Alvarez, gets NULL because nothing follows him. LAG is the mirror mistake: Alice's row would go blank (NULL) and every name would shift one slot the wrong way. Reading region or email instead of name keeps the same rows but fills the walk with groups and addresses — plausible columns, wrong memo. LIMIT 5 trims the 16-account table to the deck's opening five; LIMIT 8 would drag Grace Kim's cohort onto the slide. One window call, one direction, one column — that's the whole walk.",
  },
  {
    id: "cs-1318",
    tier: "easy",
    topic: "w4",
    universe: "pricing",
    title: "The price ladder's first rungs",
    brief:
      "From: Pricing analyst. Re: the entry-level price review.\n\nWe're repricing the cheap end and need the ladder: each product with the next price up beside it, so the gaps between rungs are visible. The draft's window lost its offset and its ORDER BY key in a refactor and now climbs some arbitrary column. Rebuild it so the ladder climbs by price, one rung at a time, and shows only the three cheapest rungs.",
    ask: "One query: the three cheapest products, each with the next price up the ladder.",
    template:
      "SELECT id, name, price,\n       LEAD(price, {1}) OVER (ORDER BY {2}) AS next_price\nFROM products\nORDER BY price\nLIMIT {3};",
    slots: [
      { answer: "1", kind: "number", noVerify: true, label: "the one-rung offset",
        why: "Next price up is one row forward: LEAD(price, 1). Probed: offset 0 would echo each product's own price into the next-price column (HDMI 14.99 'next to' 14.99) and offset 2 would skip a rung — HDMI would show 24.99 instead of 18.5." },
      { answer: "price", kind: "keyword", label: "the ladder's climb key",
        why: "A price ladder climbs by price — that's what puts 14.99, 18.5, 24.99 in order and hands each rung the next rung's figure. Probed: HDMI 14.99 → 18.5, Socks 18.5 → 24.99, Desk Mat 24.99 → 32. Ordering by supplier_id or category would climb some other ladder entirely." },
      { answer: "3", kind: "number", noVerify: true, label: "the rung count",
        why: "The review covers the entry level only, so LIMIT 3 keeps exactly the three cheapest rungs. Probed bottom three: HDMI 2.1 Cable 14.99, Running Socks 18.5, Desk Mat Extended 24.99 — the full ladder holds 16 products." },
    ],
    distractors: ["supplier_id", "category", "0", "2", "16"],
    walkthrough:
      "LEAD(price, 1) OVER (ORDER BY price) sorts the 16 products cheap-to-dear and stamps each row with the next price up — probed, the ladder runs 14.99 → 18.5 → 24.99 → 32 → 34.5 → 39.99 and on up to Smart Watch S 199.99. Climb by supplier_id instead and HDMI's next_price becomes 42.5 (Laptop Stand, its id-neighbor's supplier shelf) instead of 18.5; climb by category and the Accessories block scrambles the rungs. The offset is part of the window's contract: 0 doesn't move, so the next-price column echoes the row's own price, and 2 skips a rung so HDMI pairs with 24.99. Either way the query runs and prints confident nonsense. LIMIT 3 keeps the entry-level trio the memo names; LIMIT 16 would hand back every rung of the ladder, and LIMIT 5 drags Yoga Mat 32 into a review that was scoped to three.",
  },
  {
    id: "cs-1319",
    tier: "easy",
    topic: "w4",
    universe: "month-close",
    title: "The first three deltas",
    brief:
      "From: Controller. Re: the close deck's trend line.\n\nThe close deck leads with month-over-month revenue change, and the first quarter is what the audit committee quotes. The draft's LAG lost its target column and its offset during a refactor and the LIMIT drifted. Rebuild it so the delta column is spend minus the previous month's spend, showing just the first three months.",
    ask: "One query: the first three month buckets with MoM revenue delta (first month blank).",
    template:
      "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend\n  FROM orders GROUP BY mon\n)\nSELECT mon, spend,\n       ROUND(spend - LAG({3}, {1}) OVER (ORDER BY mon), 2) AS delta\nFROM monthly\nORDER BY mon\nLIMIT {2};",
    slots: [
      { answer: "1", kind: "number", noVerify: true, label: "the LAG offset",
        why: "Month-over-month means exactly one row back: LAG(spend, 1). Probed deltas: 2024-01 NULL, 2024-02 −122.33, 2024-03 −992.56. Offset 2 would compare each month to two months ago — 2024-02's delta goes blank and 2024-03 shows −122.33." },
      { answer: "3", kind: "number", noVerify: true, label: "the quarter cutoff",
        why: "The committee quotes the first quarter, so LIMIT 3 keeps 2024-01…2024-03. Probed spends: 3731.97, 3609.64, 2617.08 — the full staged line holds 14 buckets through 2025-02." },
      { answer: "spend", kind: "keyword", label: "the column LAG reads",
        why: "The delta reads the staged spend: LAG(spend, 1) — probed, 3609.64 − 3731.97 = −122.33 for 2024-02. LAG(mon) would subtract the month label, text coerced to 2024, and print garbage; total doesn't exist in the staged CTE at all ('no such column')." },
    ],
    distractors: ["2", "-1", "5", "mon", "total"],
    walkthrough:
      "Stage the month buckets first — 14 of them, from 2024-01's 3731.97 to 2025-02's 2390.53 — then let LAG(spend, 1) reach one row back so each month's delta is spend minus the previous spend. Probed first quarter: 2024-01 has no predecessor, so its delta is NULL (not zero — there was no comparison to make); 2024-02 drops 122.33 against January; 2024-03 drops another 992.56. Offset 2 silently re-points the comparison at two months back, blanking February and mislabeling March; offset −1 doesn't error at all — SQLite quietly makes the negative LAG read forward, so January would 'drop' 122.33 against a month that hadn't happened. And the reader's target matters: LAG(mon) subtracts the month label (coerced to 2024) and LAG(total) dies because the staged CTE only carries mon and spend. LIMIT 3 scopes the deck to the quarter the committee quotes.",
  },
  {
    id: "cs-1320",
    tier: "easy",
    topic: "w4",
    universe: "fraud",
    title: "The pending wall's shadow totals",
    brief:
      "From: Fraud spot-check lead. Re: the pending queue.\n\nFourteen orders are still pending and before we chase them I want each one lined up with the pending order logged just before it — matching neighbors is how we spot cloned entries. The draft's window sort got swapped during review. Rebuild it so the queue runs in id order with each pending order's previous pending total beside it.",
    ask: "One query: the first five pending orders with the previous pending order's total.",
    template:
      "SELECT id, customer_id, total,\n       LAG(total) OVER (ORDER BY {1}) AS prev_total\nFROM orders\nWHERE status = {2}\nORDER BY id\nLIMIT {3};",
    slots: [
      { answer: "id", kind: "keyword", label: "the queue's walk key",
        why: "The queue is logged in id order, so the window walks ids — probed: order 1 gets NULL, order 5 gets 576.54, order 12 gets 725.34. ORDER BY customer_id would reshuffle the wall to customer blocks and hand order 1 a bogus 306.92 predecessor." },
      { answer: "'pending'", kind: "keyword", label: "the status filter",
        why: "The spot-check is the pending queue only — filter-first, then the window: the wall counts 14 pending rows. Probed head: ids 1, 5, 12, 19, 25 with totals 576.54, 725.34, 148.28, 317.49, 364.71. 'shipped' would build a 30-row wall from a different status." },
      { answer: "5", kind: "number", noVerify: true, label: "the chase list length",
        why: "The chase list starts with the first five pending entries, so LIMIT 5. Probed: the five oldest pending ids with their shadow totals — the full queue holds 14 orders." },
    ],
    distractors: ["customer_id", "total", "created_at"],
    walkthrough:
      "Filter to pending first — 14 of the 103 orders — then LAG(total) OVER (ORDER BY id) walks that surviving queue in log order and lays each order's previous pending total beside it. Probed head: order 1 opens the wall with NULL, order 5 shadows 576.54, order 12 shadows 725.34. Walk the window by customer_id and the neighbors become customer blocks — order 1 would 'follow' order 47's 306.92, a cloned-entry signal that doesn't exist; walk by total and the wall becomes a value sort, pairing big and small tickets arbitrarily; walk by created_at and ids 5 (2024-01-02) and 1 (2024-01-05) swap places, reordering the chase list. The status literal pins the 14-row queue — 'shipped' would audit a wall nobody asked for. LIMIT 5 keeps the chase list at its first five entries.",
  },
  {
    id: "cs-1321",
    tier: "easy",
    topic: "w4",
    universe: "inventory",
    title: "The restock ladder",
    brief:
      "From: Inventory controller. Re: the replenishment sweep.\n\nFor the replenishment sweep I want the thinnest shelf positions lined up thinnest-first, each with the next-larger stock level beside it — that gap is what we top up to. The draft's window lost its offset and its sort is unstable. Rebuild it so the ladder climbs by stock, one rung at a time, and shows the five thinnest products.",
    ask: "One query: the five lowest stock counts, each with the next stock level up.",
    template:
      "SELECT id, name, stock,\n       LEAD(stock, {3}) OVER (ORDER BY {1}) AS next_stock\nFROM products\nORDER BY stock\nLIMIT {2};",
    slots: [
      { answer: "stock", kind: "keyword", label: "the ladder's climb key",
        why: "Thinnest-first means the window climbs by stock — probed ladder: Smart Watch S 40 → 45, Studio Desktop Mic 45 → 60, Noise-Canceling Headset 60 → 70. Ordering by id would hand Smart Watch a bogus 400 (HDMI's stock) as its next step." },
      { answer: "5", kind: "number", noVerify: true, label: "the sweep's depth",
        why: "The sweep tops up the five thinnest shelves, so LIMIT 5. Probed bottom five stocks: 40, 45, 60, 70, 85 with next steps 45, 60, 70, 85, 95 — the full ladder spans 16 products up to HDMI's 500." },
      { answer: "1", kind: "number", noVerify: true, label: "the one-rung offset",
        why: "Next level up is one row forward: LEAD(stock, 1). Probed: offset 0 would echo each product's own stock (Smart Watch 40 'next to' 40) and offset 2 would skip a rung — Smart Watch would show 60 instead of 45." },
    ],
    distractors: ["category", "price", "12", "0", "2"],
    walkthrough:
      "LEAD(stock, 1) OVER (ORDER BY stock) sorts the shelf thinnest-first and shows each product the next rung up — probed, Smart Watch S sits at 40 with 45 next, the Mic at 45 with 60 next, and the ladder runs 40, 45, 60, 70, 85, 95, 110, 120, 150, 180, 210, 220, 260, 300, 400, 500 across the 16 products. Climb by id and the pairs become nonsense — Smart Watch's next step would read 400 (HDMI's pallet), a phantom top-up nearly half the store's stock; climb by price or category and the rungs reshuffle again. The offset is part of the read: 0 echoes the row's own stock into the next-step column and 2 skips a rung, pairing Smart Watch with the Headset's 60. LIMIT 5 scopes the sweep to the five thinnest shelves the memo names; LIMIT 12 would drag half the catalog into a replenishment pass nobody budgeted.",
  },
  {
    id: "cs-1322",
    tier: "easy",
    topic: "w4",
    universe: "supplier",
    title: "The rating neighbors",
    brief:
      "From: Procurement lead. Re: the supplier scorecard.\n\nFor the scorecard we want every supplier's rating flanked by the rating just below and just above — that shows who a supplier is stacked against. The draft lost the backward window's offset, its forward reader and the ladder's sort key in a refactor. Rebuild it: below reads one row back, above reads one row forward, both over the rating order.",
    ask: "One query: all six suppliers with the rating below and the rating above each of them.",
    template:
      "SELECT id, name, rating,\n       LAG(rating, {1}) OVER (ORDER BY {3}) AS below,\n       {2}(rating) OVER (ORDER BY rating) AS above\nFROM suppliers\nORDER BY rating;",
    slots: [
      { answer: "1", kind: "number", noVerify: true, label: "the backward offset",
        why: "'Just below' is one row back: LAG(rating, 1). Probed ladder: 3.9, 4.0, 4.1, 4.4, 4.6, 4.8 — offset 2 would leave the two lowest rows with blank belows and pair Pacific 3.9 against Shenzhen 4.1 instead of Andes 4.0." },
      { answer: "LEAD", kind: "keyword", label: "the forward reader",
        why: "'Just above' is the next row up, so the second window is LEAD(rating). Probed: Pacific Textiles 3.9 has 4.0 above and NULL below; Alpine Audio GmbH 4.8 tops the table with NULL above. LAG in that slot would duplicate the below column; FIRST_VALUE would pin 3.9 on every row." },
      { answer: "rating", kind: "keyword", label: "the shared climb key",
        why: "Both windows ride one ladder: ORDER BY rating puts 3.9 → 4.8 in rung order — probed, that's what flanks Shenzhen 4.1 with 4.0 below and 4.4 above. Sorting the below-window by name or id would climb a different ladder and mislabel every neighbor." },
    ],
    distractors: ["LAG", "FIRST_VALUE", "name", "id"],
    walkthrough:
      "Two windows ride one ORDER BY: LAG(rating, 1) reaches one row down the 3.9 → 4.8 ladder for the below column, LEAD(rating) reaches one row up for above. Probed: Pacific Textiles 3.9 opens the table (below NULL, above 4.0), Shenzhen Electro 4.1 sits flanked by 4.0 and 4.4, and Alpine Audio GmbH 4.8 closes it (below 4.6, above NULL) — the two edge rows are the honest blanks. Offset 2 re-points the reach two rows down, blanking the ladder's first two belows; offset 0 doesn't move at all — LAG(rating, 0) echoes each supplier's own rating into the below column. Swap LEAD for LAG and the above column becomes a copy of below; FIRST_VALUE is the sneakier chip: it runs without error but pins the table's floor, 3.9, on every single row. And the climb key is shared plumbing — sort the backward window by name or id and the below column pairs suppliers that aren't neighbors at all.",
  },
  {
    id: "cs-1324",
    tier: "easy",
    topic: "w4",
    universe: "growth",
    title: "The zero-filled signup wave",
    brief:
      "From: Growth lead. Re: the cohort pipeline chart.\n\nThe pipeline chart plots each signup month with the NEXT month's intake beside it, and the chart library chokes on NULLs — the last month must plot as 0, not blank. The draft lost both the offset and the default. Rebuild it: bucket customers by signup month, then read next month's count with 0 past the edge.",
    ask: "One query: every signup month with next month's intake, 0 on the final month.",
    template:
      "WITH signups AS (\n  SELECT strftime({1}, created_at) AS mon, COUNT(*) AS joined\n  FROM customers GROUP BY mon\n)\nSELECT mon, joined,\n       LEAD(joined, {2}, {3}) OVER (ORDER BY mon) AS next_wave\nFROM signups\nORDER BY mon;",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the month format",
        why: "Cohorts are months, so the bucket key is strftime('%Y-%m', created_at) — probed 9 buckets from 2023-11 to 2024-07. '%m' alone would relabel every bucket '01'…'07' and wreck the chart's x-axis; '%Y' would collapse to 2 bars." },
      { answer: "1", kind: "number", noVerify: true, label: "the forward offset",
        why: "Next month's intake is one row forward: LEAD(joined, 1, …). Probed: 2024-05 (2 joined) reads 1, 2024-06 reads 1, 2024-07 reads 0. Offset 2 would skip a month — 2024-06 would read 0 instead of 1." },
      { answer: "0", kind: "number", label: "the past-the-edge default",
        why: "The chart needs a number, not NULL: the third argument supplies 0 past the last row. Probed final row: 2024-07 shows 0 — without the default it would be NULL and the chart would choke. Default 9 would plot a phantom intake of 9." },
    ],
    distractors: ["'%m'", "'%Y'", "2", "9"],
    walkthrough:
      "Stage the signup cohorts — 9 month buckets from 2023-11 (2 accounts) through 2024-07 (1 account), the whole 16-customer intake — then LEAD(joined, 1, 0) reads one bucket forward with an explicit default so the edge plots as a number. Probed tail: 2024-05 shows 1 next, 2024-06 shows 1 next, and 2024-07, the last bucket, shows 0 — the NULL the chart library can't draw, replaced by an honest zero. '%m' instead of '%Y-%m' relabels every bucket to bare month numbers and re-fuses the axis; '%Y' flattens nine cohorts into two bars. Offset 2 compares each month to the month after next — June's pipeline would read 0, a fake churn signal. And the default matters only at the edge: default 9 would plot a 9-account intake in July that never happened.",
  },
  {
    id: "cs-1326",
    tier: "easy",
    topic: "w4",
    universe: "pricing",
    title: "The cheap shelf's cheaper neighbor",
    brief:
      "From: Pricing analyst. Re: the entry-shelf audit.\n\nFor the entry-shelf audit I need every product at or under 34.50 lined up cheap-first with the price just below it — that's the floor each item could drop to. The draft lost its window offset, its sort and its filter value. Rebuild it: over the price ladder, one rung down, show each cheap product's cheaper neighbor.",
    ask: "One query: products priced ≤ 34.50 with the next-lower price on the ladder.",
    template:
      "SELECT id, name, price,\n       LAG(price, {3}) OVER (ORDER BY {1}, id) AS cheaper\nFROM products\nWHERE price <= {2}\nORDER BY price, id;",
    slots: [
      { answer: "price", kind: "keyword", label: "the ladder's climb key",
        why: "The cheaper neighbor lives one rung down the PRICE ladder — probed: HDMI 14.99 has NULL below it, Socks 18.5 shows 14.99, Mouse 34.5 shows 32. Order by name and HDMI's 'cheaper' would read 260 (Desk Mat's stock-row neighbor), a figure that isn't a price at all." },
      { answer: "34.5", kind: "number", label: "the entry-shelf ceiling",
        why: "The audit scope is the entry shelf: price <= 34.5. Probed census: exactly 5 products — 14.99, 18.5, 24.99, 32, 34.5 (HDMI, Socks, Desk Mat, Yoga Mat, Wireless Mouse). A 32 ceiling would drop the Mouse; 39.99 would drag Ring Light in." },
      { answer: "1", kind: "number", noVerify: true, label: "the one-rung offset",
        why: "The cheaper neighbor is one rung down: LAG(price, 1). Probed: offset 0 echoes each product's own price into the cheaper column (Desk Mat 24.99 'cheaper than' itself) and offset 2 skips a rung — Desk Mat would show 14.99, two steps down." },
    ],
    distractors: ["name", "32", "39.99", "0", "2"],
    walkthrough:
      "LAG(price, 1) OVER (ORDER BY price, id) walks the ladder cheap-first so each row's cheaper column is the rung just below — probed on the entry shelf: HDMI 2.1 Cable opens at 14.99 with NULL (nothing cheaper exists), Socks 18.5 shows 14.99, Desk Mat 24.99 shows 18.5, Yoga Mat 32 shows 24.99, Wireless Mouse 34.5 shows 32. The filter is the scope: price <= 34.5 keeps exactly five products; tighten to 32 and the Mouse — the audit's most expensive entry item — vanishes from its own report; loosen to 39.99 and Ring Light sneaks into a shelf it doesn't belong to. The offset is part of the read: 0 echoes the row's own price and 2 skips a rung, so the 'floor' column stops being floors. Sort the window by name and HDMI's 'cheaper' reads 260 — a stock count wearing a price label. Direction, scope, offset: all three probed, all three load-bearing.",
  },
  {
    id: "cs-1331",
    tier: "easy",
    topic: "w4",
    universe: "pricing",
    title: "The premium shelf's next rung",
    brief:
      "From: Pricing analyst. Re: the premium ladder.\n\nFor the premium review I want every product at 42.50 or above on one ladder, cheap-to-dear, each with the next price up — that next rung is what the raise has to clear. The draft lost its floor value and its window call in a refactor. Rebuild it: the whole premium shelf, no cutoff.",
    ask: "One query: products priced ≥ 42.50 with the next price up the ladder.",
    template:
      "SELECT id, name, price,\n       {2}(price) OVER (ORDER BY {3}, id) AS next_price\nFROM products\nWHERE price >= {1}\nORDER BY price, id;",
    slots: [
      { answer: "42.5", kind: "number", label: "the premium floor",
        why: "The review floor is 42.50: probed census, exactly 10 products sit at or above it, opening with Laptop Stand 42.5 and closing with Smart Watch S 199.99. A 39.99 floor would drag Ring Light onto a premium shelf it doesn't belong to; 49 would evict the Laptop Stand from its own review." },
      { answer: "LEAD", kind: "keyword", label: "the forward reader",
        why: "Next price UP is one row forward on a cheap-to-dear ladder: LEAD(price). Probed: Laptop Stand 42.5 shows 49, Hub 49 shows 59.99, and the top rung Smart Watch 199.99 shows NULL — nothing above it. LAG would read DOWN the ladder." },
      { answer: "price", kind: "keyword", label: "the ladder's climb key",
        why: "The ladder climbs by price: ORDER BY price, id — probed, that's what puts 42.5 → 49 → 59.99 in rung order. Climbing by name or stock would hand each product a 'next price' that is just some other row's price." },
    ],
    distractors: ["LAG", "name", "stock", "49", "39.99"],
    walkthrough:
      "One filter, one window: price >= 42.5 keeps exactly ten products and LEAD(price) OVER (ORDER BY price, id) stamps each with the next rung up. Probed ladder: 42.5 → 49 → 59.99 → 65 → 79 → 89.99 → 119 → 129 → 149.99 → 199.99, with the Smart Watch's next_price NULL because nothing sits above the ceiling rung. LAG is the mirror mistake — it reads the rung BELOW, so the Laptop Stand would show NULL and every 'next price' would be a step down. The floor is the scope: 39.99 sneaks Ring Light 39.99 in (eleven rows), 49 cuts the review's opening rung. And the climb key is load-bearing — order the window by name or stock and the next-price column fills with prices that aren't next to anything.",
  },
  {
    id: "cs-1341",
    tier: "easy",
    topic: "w4",
    universe: "growth",
    title: "The zero-filled month line",
    brief:
      "From: Growth lead. Re: the board deck's trend opener.\n\nThe board deck's trend line needs January's predecessor cell to read 0 — not NULL — because the deck tool drops blank cells and the line would start in February. The draft lost all three window arguments in a refactor. Rebuild it: month buckets with spend, and a LAG that defaults to 0 on the first row, first 3 months only.",
    ask: "One query: the first three months with spend and previous-month spend, 0 on the first row.",
    template:
      "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend\n  FROM orders GROUP BY mon\n)\nSELECT mon, spend, {1}(spend, {2}, {3}) OVER (ORDER BY mon) AS prev_spend\nFROM monthly\nORDER BY mon\nLIMIT 3;",
    slots: [
      { answer: "LAG", kind: "keyword", label: "the backward reader",
        why: "Previous-month spend is one row back, so the reader is LAG. Probed line: 2024-01 shows 0, 2024-02 shows 3731.97, 2024-03 shows 3609.64. LEAD would point forward — January's cell would read 3609.64, February's 2617.08, a trend line running toward the past." },
      { answer: "1", kind: "number", noVerify: true, label: "the backward offset",
        why: "One month back: LAG(spend, 1, 0). Probed: offset 2 would blank BOTH January and February (two rows short of history) and March would show 3731.97 — the wrong month's spend in the comparison cell." },
      { answer: "0", kind: "number", label: "the first-row default",
        why: "The deck needs a number at the edge: the third argument fills the first row with 0. Probed: 2024-01's prev_spend is 0 — no default means NULL, and the deck tool drops the line's first point. Default −1 would plot a negative history month." },
    ],
    distractors: ["LEAD", "2", "-1"],
    walkthrough:
      "LAG takes three arguments and the draft lost all of them: LAG(spend, 1, 0) reads one bucket back and fills the missing edge with 0. Probed: 2024-01 3731.97 with prev 0, 2024-02 3609.64 with prev 3731.97, 2024-03 2617.08 with prev 3609.64 — the delta column the board computes from these is −122.33, the honest first move. LEAD points the reader forward and the comparison cell fills with FUTURE months — a trend chart that runs backward in time. Offset 2 reaches two rows back, which past the edge means TWO blank cells that the default can't both fix (only the first-row default applies, so February would read 0 and March would borrow January's 3731.97). And the default is the whole point of the memo: NULL is honest but undrawable, −1 would invent a negative January, 0 says 'no prior month' in a number the tool can plot.",
  },
  {
    id: "cs-1342",
    tier: "easy",
    topic: "w4",
    universe: "catalog",
    title: "The neighbor reader",
    brief:
      "From: Warehouse ops. Re: the pick-sequence sanity check.\n\nWe sanity-check the pick sequence by listing each order with the NEXT order's total beside it — but the draft uses LAG and someone heard negative offsets 'just work'. Prove the pattern: keep LAG with a negative offset so it reads forward, on the first four orders only.",
    ask: "One query: orders 1–4 with each NEXT order's total, read via a negative LAG offset.",
    template:
      "SELECT id, total,\n       {1}(total, {2}) OVER (ORDER BY id) AS neighbor\nFROM orders\nORDER BY id\nLIMIT {3};",
    slots: [
      { answer: "LAG", kind: "keyword", label: "the reader with a twist",
        why: "The memo's pattern is LAG with a negative offset — SQLite silently reads forward. Probed: order 1 shows 416.81 (order 2's total), order 2 shows 767.64. LEAD(total, −1) is the mirror (reads backward: order 1 would show NULL) — right numbers, wrong mechanism." },
      { answer: "-1", kind: "number", noVerify: true, label: "the negative offset",
        why: "Negative offsets flip the direction: LAG(total, −1) ≡ LEAD(total). Probed head: 576.54 → 416.81, 416.81 → 767.64, 767.64 → 158.48, 158.48 → 725.34 — no error, no warning. Offset 1 would read backward (order 1 blank) and −2 would skip a row." },
      { answer: "4", kind: "number", label: "the sanity-check length",
        why: "The check samples the first four orders, so LIMIT 4. Probed: ids 1–4 with neighbor totals 416.81, 767.64, 158.48, 725.34 — the full walk spans 103 orders." },
    ],
    distractors: ["LEAD", "1", "-2"],
    walkthrough:
      "SQLite's dirty little secret: LAG(total, −1) doesn't error — the negative offset silently reads FORWARD, so the column behaves exactly like LEAD(total). Probed: order 1's neighbor is 416.81, order 2's is 767.64, order 3's is 158.48, order 4's is 725.34. That's the pattern the memo pins: LAG plus −1. Write LEAD(total, −1) and you get the mirror — it reads backward, so order 1's cell is NULL and the sanity check starts with a hole. Offset 1 (positive) is plain LAG: order 1 blank, order 2 showing 576.54 — the previous order, not the next. Offset −2 skips a row entirely, pairing each order with the one two picks ahead. And LIMIT 4 keeps the check to the sample the memo asked for — the full table walk is 103 rows and nobody reads that before lunch.",
  },
  {
    id: "cs-1352",
    tier: "easy",
    topic: "w4",
    universe: "fraud",
    title: "The whale ladder's bigger neighbor",
    brief:
      "From: Fraud spot-check lead. Re: the big-ticket ladder.\n\nWe review the biggest tickets with the next-bigger ticket beside them — on a descending ladder that's what LAG hands you for free. The draft lost its reader, offset, and cutoff in a refactor. Rebuild it: orders sorted total-descending, each row showing the previous row's (i.e. next-bigger) total, top six.",
    ask: "One query: the six biggest orders, each with the next-bigger order's total.",
    template:
      "SELECT id, customer_id, total,\n       {1}(total, {2}) OVER (ORDER BY total DESC, id) AS bigger_total\nFROM orders\nORDER BY total DESC, id\nLIMIT {3};",
    slots: [
      { answer: "LAG", kind: "keyword", label: "the backward reader on a DESC ladder",
        why: "On a total-DESC ladder the previous row is the BIGGER ticket, so LAG is the reader. Probed: order 74 (1088.44) shows NULL, order 43 (945.21) shows 1088.44, order 39 shows 945.21. LEAD would show the next-SMALLER ticket — a ladder of shadows." },
      { answer: "1", kind: "number", noVerify: true, label: "the one-row offset",
        why: "Next-bigger is one row up the ladder: LAG(total, 1). Probed: offset 2 would blank the top two rows and pair order 39 with 1088.44 — skipping 945.21, the very ticket the review needs adjacent." },
      { answer: "6", kind: "number", label: "the review cutoff",
        why: "The review covers six tickets, so LIMIT 6. Probed ladder head: 1088.44, 945.21, 845.92, 826.03, 785.79, 767.64 — six rows, first with a NULL bigger-neighbor (nothing above the whale)." },
    ],
    distractors: ["LEAD", "2", "0", "3"],
    walkthrough:
      "Sort by total DESC (id tiebreak) and the 'previous row' IS the next-bigger ticket — LAG(total, 1) reads it for free. Probed: order 74's 1088.44 tops the ladder with NULL above it, order 43's 945.21 shows 1088.44, order 39's 845.92 shows 945.21, and the six-row cut ends at order 3's 767.64. LEAD on this ladder points DOWN — each big ticket would be flanked by a smaller one, the opposite of the review's pairing. Offset 2 skips a rung, so the ladder would claim 845.92's neighbor is 1088.44 and quietly drop 945.21 from every comparison. Offset 0 doesn't move: the bigger-neighbor column would echo each row's own total. LIMIT 6 is the review's scope — LIMIT 3 would cut the ladder before the 826.03 ticket the memo names.",
  },
  // ============================== MEDIUM ==============================
  {
    id: "cs-1325",
    tier: "medium",
    topic: "w4",
    universe: "refund-audit",
    title: "The cancellation cadence",
    brief:
      "From: Refund audit lead. Re: the cancellation timeline.\n\nWe reconcile cancellations by walking the seven cancelled orders in date order — each one needs the date of the next cancellation beside it, so we can see the cadence the fraud team asks about. The draft lost its window function and its offset in a merge. Rebuild it: over created_at order (id tiebreak), show each cancellation's successor date.",
    ask: "One query: the seven cancelled orders, each with the next cancellation's date.",
    template:
      "SELECT id, created_at, total,\n       {1}({2}, {3}) OVER (ORDER BY created_at, id) AS next_cancel\nFROM orders\nWHERE status = 'cancelled'\nORDER BY created_at, id;",
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the forward reader",
        why: "Each row needs its SUCCESSOR's date, so the reader is LEAD. Probed: order 7 (2024-01-02) reads 2024-03-18, and the last cancellation, order 95 (2025-01-05), reads NULL. LAG would point the timeline backward — order 7 would show NULL and every date would shift one slot up." },
      { answer: "created_at", kind: "keyword", label: "the column the walk reads",
        why: "The cadence is a date timeline, so LEAD reads created_at. Probed successor chain: 2024-01-02 → 2024-03-18 → 2024-07-02 → 2024-07-25 → 2024-11-04 → 2024-11-24 → 2025-01-05 → NULL. LEAD(total) would show dollar amounts where dates belong." },
      { answer: "1", kind: "number", noVerify: true, label: "the forward offset",
        why: "Next cancellation is one row forward: LEAD(created_at, 1). Probed: offset 2 would jump the chain — order 7 would read 2024-07-25 (two cancellations ahead) instead of 2024-03-18." },
    ],
    distractors: ["LAG", "total", "2", "id"],
    walkthrough:
      "Filter to the seven cancelled orders, then walk them by created_at (id as tiebreak) with LEAD(created_at, 1) laying each cancellation's successor beside it. Probed chain: 2024-01-02 → 2024-03-18 → 2024-07-02 → 2024-07-25 → 2024-11-04 → 2024-11-24 → 2025-01-05, with the final row's successor NULL — nothing follows the last cancellation. LAG flips the walk: order 7's slot goes blank and every other row shows the PREVIOUS cancellation, a timeline that runs backward. Reading total instead of created_at fills the timeline with dollar figures; the offset matters too — 2 skips a cancellation per row, so order 7 would claim the fraud team's cadence is four months when it's ten weeks. Walking the window by id instead of created_at scrambles the pair at the November tie: id-order puts 82 before 83, so 2024-11-04 would follow 2024-11-24 in the chain — dates that run backward on the page.",
  },
  {
    id: "cs-1327",
    tier: "medium",
    topic: "w4",
    universe: "inventory",
    title: "Headroom to the next stock step",
    brief:
      "From: Inventory controller. Re: the mid-shelf top-up plan.\n\nFor the mid-shelf plan I want each product's stock minus the stock level just below it — that headroom is how much we'd add to reach the next band. The draft lost its subtraction operand and both band edges in a refactor. Rebuild it: stocks from 60 through 150, headroom against the next-lower rung.",
    ask: "One query: products with stock 60–150, each with headroom to the next-lower stock level.",
    template:
      "SELECT id, name, stock,\n       LEAD(stock) OVER (ORDER BY stock, id) - {1} AS headroom\nFROM products\nWHERE stock <= {2} AND stock >= {3}\nORDER BY stock, id;",
    slots: [
      { answer: "stock", kind: "keyword", label: "the subtraction operand",
        why: "Headroom is next-rung stock minus THIS row's stock, so the operand is stock itself — probed: Headset 60 → 10, Webcam 70 → 15, Keyboard 120 → 30. Subtracting price would mix units (70 − 149.99 is a negative nonsense) and subtracting id would mix row numbers with pallets." },
      { answer: "150", kind: "number", label: "the band's top edge",
        why: "The mid-shelf band tops out at 150 — probed: the band holds 7 products, 60 through 150, with Ring Light 14\" the top rung showing NULL headroom (nothing above it in the band). A 120 ceiling would cut Ring Light from its own plan." },
      { answer: "60", kind: "number", label: "the band's bottom edge",
        why: "The band floors at 60 — probed: Noise-Canceling Headset 60 opens the band with headroom 10 (next rung 70). A 40 floor would drag Smart Watch S (40) and Studio Mic (45) into a plan scoped above them." },
    ],
    distractors: ["id", "price", "120", "40"],
    walkthrough:
      "The ladder is the stock column — 40, 45, 60, 70, 85, 95, 110, 120, 150, 180, 210, 220, 260, 300, 400, 500 across the 16 products — and LEAD(stock) − stock measures the jump to the next rung. Clipped to the 60–150 band, probed headroom: Headset 60 → 10, Webcam 70 → 15, Hub 85 → 10, Fitness Band 95 → 15, Jersey 110 → 10, Keyboard 120 → 30, Ring Light 150 → NULL (the band's ceiling has no next rung inside the filter). Subtract price instead of stock and the units break — the Headset's headroom reads −89.99; subtract id and row numbers masquerade as pallets. The band edges are the scope: 120 cuts the top rung, 40 floods the plan with the two thin shelves below 60 (Smart Watch 40, Mic 45 — probed, nine rows). Three chips, one probed ladder, no invented numbers.",
  },
  {
    id: "cs-1328",
    tier: "medium",
    topic: "w4",
    universe: "month-close",
    title: "The order-count deltas",
    brief:
      "From: Controller. Re: the volume line on the close deck.\n\nNext to the revenue trend the deck plots monthly ORDER COUNTS with the change against the prior month — volume tells us whether revenue moves are traffic or ticket size. The draft lost its format string and its counter in a refactor. Rebuild it: month buckets, COUNT for volume, delta via LAG, first 14 rows.",
    ask: "One query: the 14 month buckets with order counts and the change vs the previous month.",
    template:
      "WITH m AS (\n  SELECT strftime({1}, created_at) AS mon, {2} AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n, n - LAG(n) OVER (ORDER BY mon) AS dn\nFROM m\nORDER BY mon\nLIMIT {3};",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the bucket format",
        why: "Months, not fused calendars: '%Y-%m' yields the 14 true buckets. Probed alternative: '%m' alone fuses to 12 buckets with January holding 14 orders (8 from 2024 + 6 from 2025) — a bucket that never existed; '%Y' would collapse to 2 rows (90 vs 13)." },
      { answer: "COUNT(*)", kind: "keyword", label: "the volume counter",
        why: "Volume is row count: COUNT(*). Probed line: 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7. SUM(total) would plot revenue where volumes belong (3731.97 instead of 8) — the delta column would then be dollar swings, not order moves." },
      { answer: "14", kind: "number", noVerify: true, label: "the full line cutoff",
        why: "The deck plots the whole staged line, 14 buckets — LIMIT 14 keeps every one. Probed deltas: 2024-01 NULL, then +1, −1, −1, +1, −2, +2, −1, +2, −2, −1, +1, −1, +1; zero rows are lost at 14 because the staged CTE holds exactly 14 buckets." },
    ],
    distractors: ["SUM(total)", "COUNT", "'%m'", "7"],
    walkthrough:
      "Stage the buckets with strftime('%Y-%m', created_at) and COUNT(*), then n − LAG(n) OVER (ORDER BY mon) is the volume delta. Probed line: 2024-01 opens 8 with a NULL delta (no prior bucket), 2024-02 +1 to 9, 2024-06 −2 to 6, 2024-09 +2 to 9, 2024-10 −2 to 7, closing 2025-02 at 7 (+1). The format string is the trap worth fearing: '%m' alone fuses 2024 and 2025 into 12 calendar-month buckets — January would read 14 orders (8+6), a month with no fixed cost of truth behind it; '%Y' erases the seasonality entirely (90 vs 13). COUNT bare dies with 'wrong number of arguments'; SUM(total) silently turns the volume line into a revenue line — 3731.97 where 8 belongs. LIMIT 14 is the whole line; LIMIT 7 would cut the story off before June's dip.",
  },
  {
    id: "cs-1329",
    tier: "medium",
    topic: "w4",
    universe: "month-close",
    title: "The eight down months",
    brief:
      "From: Controller. Re: the revenue bridge.\n\nThe close deck's revenue bridge isolates every month that gave back ground — the down months and how far each fell. The draft's bridge logic was lost in a refactor. Rebuild it: stage the month buckets, read the prior month with LAG, and keep only the months where spend fell.",
    ask: "One query: the months whose MoM revenue delta is negative, with spend, prior spend, and delta.",
    template:
      "WITH monthly AS (\n  SELECT strftime({1}, created_at) AS mon, ROUND(SUM(total), 2) AS spend\n  FROM orders GROUP BY mon\n), swung AS (\n  SELECT mon, spend, {2} OVER (ORDER BY mon) AS prev_spend FROM monthly\n), deltas AS (\n  SELECT mon, spend, prev_spend, spend - {3} AS delta FROM swung\n)\nSELECT mon, spend, prev_spend, ROUND(delta, 2) AS delta\nFROM deltas WHERE delta < {4} ORDER BY mon;",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the bucket format",
        why: "True months only: '%Y-%m' yields the 14 buckets from 2024-01 to 2025-02. Probed trap: '%m' alone fuses the years into 12 buckets with a 14-order January (8 from 2024 + 6 from 2025) that never existed; '%Y' collapses everything to 90 vs 13." },
      { answer: "LAG(spend)", kind: "keyword", label: "the backward reader",
        why: "The bridge needs the PRIOR month beside each row: LAG(spend) OVER (ORDER BY mon). Probed pairs: 2024-02 shows 3731.97, 2024-03 shows 3609.64. LEAD(spend) points forward — the bridge would compare March against April." },
      { answer: "prev_spend", kind: "keyword", label: "the delta's minuend partner",
        why: "Delta is this month minus the staged prior month: spend − prev_spend. Probed: 3609.64 − 3731.97 = −122.33 for 2024-02. Subtracting mon instead coerces the '2024-02' label to 2024 and prints garbage deltas." },
      { answer: "0", kind: "number", noVerify: true, label: "the down-month threshold",
        why: "Down means the delta is negative: delta < 0. Probed: exactly 8 of the 13 comparable months qualify — 2024-02 −122.33, 03 −992.56, 04 −148.17, 06 −862.88, 07 −853.57, 10 −140.37, 11 −1326.87, 2025-01 −431.97; the first month's NULL comparison never qualifies." },
    ],
    distractors: ["LEAD(spend)", "spend", "'%m'", "'%Y'", "-150", "500"],
    walkthrough:
      "Three-stage build: bucket (14 true months via '%Y-%m'), swing (LAG(spend) lays the prior month beside each row), then filter. Probed bridge: 2024-01 drops out on its own — its prev_spend is NULL and NULL comparisons never qualify — then 2024-02 −122.33, 2024-03 −992.56, 2024-04 −148.17, 2024-06 −862.88, 2024-07 −853.57, 2024-10 −140.37, 2024-11 −1326.87 (the year's biggest give-back), 2025-01 −431.97: eight down months. LEAD flips the reader so the bridge compares against NEXT month and flags a different eight; '%m' fuses the years into calendar months whose deltas are fiction; '%Y' leaves one 2025-vs-2024 comparison of −26713.22 (4060.03 against 30773.25). Subtract the month label instead of prev_spend and the engine coerces '2024-02' to 2024 — deltas that look computed and mean nothing.",
  },
  {
    id: "cs-1330",
    tier: "medium",
    topic: "w4",
    universe: "refund-audit",
    title: "The refund ladder's five rungs",
    brief:
      "From: Refund audit lead. Re: the monthly refund line.\n\nThe audit pack tracks cancelled order value by month with the change against the prior refund month — cancellations are sparse, so the 'previous' column is the previous refund month, not the previous calendar month. The draft lost its status literal, its window call, its format and its rounding. Rebuild it.",
    ask: "One query: cancelled value by month with the prior refund month's value and the delta.",
    template:
      "WITH refunded AS (\n  SELECT strftime({3}, created_at) AS mon, ROUND(SUM(total), 2) AS refunded\n  FROM orders WHERE status = {1} GROUP BY mon\n), swung AS (\n  SELECT mon, refunded, {2} OVER (ORDER BY mon) AS prev_refunded FROM refunded\n)\nSELECT mon, refunded, prev_refunded, ROUND(refunded - prev_refunded, {4}) AS delta\nFROM swung ORDER BY mon;",
    slots: [
      { answer: "'cancelled'", kind: "keyword", label: "the refund status",
        why: "Refund value = cancelled orders: status = 'cancelled' stages 7 orders into 5 month buckets. Probed: 'pending' would stage 14 orders across different months and 'shipped' 30 — neither is the refund line." },
      { answer: "LAG(refunded)", kind: "keyword", label: "the prior-month reader",
        why: "Each bucket needs the previous refund bucket: LAG(refunded) OVER (ORDER BY mon). Probed: 2024-03 shows 152.52 beside it, 2025-01 shows 541.85. LEAD would read the NEXT refund month and flip every delta's sign." },
      { answer: "'%Y-%m'", kind: "keyword", label: "the month format",
        why: "True months: '%Y-%m' keeps 2024-01 (152.52) and 2025-01 (206.19) apart. Probed trap: '%m' alone fuses them into one 358.71 January; '%Y' collapses the ladder to 946.3 vs 206.19." },
      { answer: "2", kind: "number", noVerify: true, label: "the delta rounding",
        why: "Money rounds to cents: ROUND(…, 2) prints −16.41. Probed raw: 136.11 − 152.52 = −16.409999999999997 — float dust only ROUND sweeps; at 0 digits the pack would read −16." },
    ],
    distractors: ["'pending'", "LEAD(refunded)", "'%m'", "0", "1"],
    walkthrough:
      "Sparse series, same skeleton: filter to the 7 cancelled orders first, stage 5 refund buckets (2024-01 152.52, 2024-03 136.11, 2024-07 115.82, 2024-11 541.85, 2025-01 206.19), then LAG(refunded) lays each prior refund month beside its row — probed deltas: 2024-01 NULL (nothing before it), −16.41, −20.29, +426.03 (November's spike), −335.66. The status literal is the whole series: 'pending' or 'shipped' would audit a queue nobody asked about. LEAD points the reader forward, printing next month's value in the prior-month column — every delta flips. And '%m' is the fuse: January 2024 and January 2025 merge into a single 358.71 bucket, so the ladder's first rung is a month that never existed. ROUND at 2 digits is what keeps −16.409999999999997 off the page.",
  },
  {
    id: "cs-1333",
    tier: "medium",
    topic: "w4",
    universe: "growth",
    title: "Alice's order gaps",
    brief:
      "From: Growth lead. Re: the cadence check on our champion.\n\nAlice Chen is the account the board quotes, and the question is cadence: how many days pass between her consecutive orders. The draft's gap math lost its customer pin and its reader in a refactor. Rebuild it: her 24 orders in date order, each with the whole-day gap to the order before it.",
    ask: "One query: Alice's orders (customer 1) in date order with the day gap to her previous order.",
    template:
      "SELECT id, customer_id, created_at, total,\n       CAST(julianday(created_at) - julianday({3} OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d\nFROM orders\nWHERE {1} = {2}\nORDER BY created_at, id;",
    slots: [
      { answer: "customer_id", kind: "keyword", label: "the chain's grouping column",
        why: "The cadence runs along one customer's own timeline, so the filter keys on customer_id. Probed: WHERE id = 1 would return order 1 alone (576.54) and WHERE total = 1 nothing at all — neither is Alice's chain." },
      { answer: "1", kind: "number", label: "Alice's customer id",
        why: "Alice Chen is customer 1 — probed, 24 orders from 2024-01-02 to 2025-02-19, the deepest chain in the table. Customer 2 (Bruno) has 2 orders and customer 16 (Pedro) 4 — pins that would gut the cadence check." },
      { answer: "LAG(created_at)", kind: "keyword", label: "the previous-order reader",
        why: "The gap reaches one row back: julianday(created_at) − julianday(LAG(created_at) OVER (…)). Probed first gaps: NULL (no prior order), then 20, 29, 5, 9, 13 days. LEAD(created_at) measures the NEXT order instead and every gap goes negative." },
    ],
    distractors: ["id", "supplier_id", "total", "LEAD(created_at)", "created_at", "shipped_at"],
    walkthrough:
      "Filter to the champion first — customer_id = 1 keeps Alice's 24 orders — then walk them by created_at (id tiebreak) with LAG(created_at) feeding the day math: julianday(today) − julianday(previous). Probed cadence: the chain opens NULL (nothing before her first order), then 20, 29, 5, 9, 13 — her longest silence is 51 days before the November 11 order, her tightest a single day between the September 6 and September 7 orders. CAST to INTEGER is what prints whole days: the raw julianday difference carries a .5 fraction on date-only timestamps. LEAD flips the reader — gaps measure her NEXT order and come out negative. Pin the wrong customer (2, 16) and the cadence collapses to a two-row chain; filter by id = 1 and you get one order, not one customer.",
  },
  {
    id: "cs-1336",
    tier: "medium",
    topic: "w4",
    universe: "inventory",
    title: "The stock step-downs",
    brief:
      "From: Inventory controller. Re: the pallet-band report.\n\nThe band report shows each product's stock minus the stock level just below it on the ladder — a step of 30 or more pallets is a real band edge worth staffing. The draft lost its reader, its threshold and its sort direction in a refactor. Rebuild it: the step-down column via LAG, biggest piles first, keep the steps of 30+.",
    ask: "One query: products whose stock step-down (vs the next-lower rung) is at least 30, biggest first.",
    template:
      "WITH banded AS (\n  SELECT id, name, stock,\n         stock - {2} OVER (ORDER BY stock, id) AS step_down\n  FROM products\n)\nSELECT id, name, stock, step_down\nFROM banded\nWHERE step_down >= {1}\nORDER BY stock {3}, id;",
    slots: [
      { answer: "30", kind: "number", label: "the band-edge threshold",
        why: "A real band edge is a 30-pallet step: step_down >= 30. Probed: exactly 7 rows qualify — HDMI 500 (step 100), Socks 400 (100), Mouse 300 (40), Desk Mat 260 (40), then the three 30-steps at 210, 180, 150. A 40 floor would drop the three 30-steps from their own report; 50 would keep only the two 100-steps." },
      { answer: "LAG(stock)", kind: "keyword", label: "the rung-below reader",
        why: "Step-down reads the rung BELOW: stock − LAG(stock) OVER (ORDER BY stock, id). Probed: 500 − 400 = 100, 400 − 300 = 100. LEAD(stock) reads UP the ladder and every step goes negative." },
      { answer: "DESC", kind: "keyword", label: "the biggest-first direction",
        why: "Biggest piles first: ORDER BY stock DESC — probed head: HDMI 500, Socks 400, Mouse 300. ASC would open the report at Ring Light 150, the smallest qualifying pile first." },
    ],
    distractors: ["40", "31", "50", "LEAD(stock)", "ASC", "stock"],
    walkthrough:
      "The stock ladder runs 40, 45, 60, 70, 85, 95, 110, 120, 150, 180, 210, 220, 260, 300, 400, 500 across the 16 products, and stock − LAG(stock) measures each drop from the rung above. Probed qualifying steps: HDMI 500 (100 below Socks' 400), Socks 400 (100), Mouse 300 (40), Desk Mat 260 (40), then the three exact-30 edges — Speaker 210, Laptop Stand 180, Ring Light 150 — seven rows, biggest first via ORDER BY stock DESC. LEAD flips the arithmetic: stock minus the NEXT rung up is zero or negative, and nothing clears a 30-pallet bar. The threshold is the staffing rule: 40 would erase the three 30-steps, 50 would leave just the two 100-pallet drops. Direction matters for the reader: ascending opens on the smallest qualifying pile instead of the warehouse's biggest gap.",
  },
  {
    id: "cs-1338",
    tier: "medium",
    topic: "w4",
    universe: "pricing",
    title: "The price jumps",
    brief:
      "From: Pricing analyst. Re: the ladder-gap audit.\n\nWhere the price ladder jumps by 10.99 or more between rungs, we have pricing headroom — customers can't trade up cheaply. The draft lost its reader, its rounding and its threshold in a refactor. Rebuild it: full-ladder LEAD, the step-up column, keep the jumps of 10.99 and up.",
    ask: "One query: products whose step-up to the next price is at least 10.99, with the step shown.",
    template:
      "WITH steps AS (\n  SELECT id, name, price, LEAD({3}) OVER (ORDER BY price, id) AS next_price\n  FROM products\n)\nSELECT id, name, price, next_price, ROUND(next_price - price, {1}) AS step_up\nFROM steps\nWHERE next_price IS NOT NULL AND next_price - price >= {2}\nORDER BY price, id;",
    slots: [
      { answer: "2", kind: "number", noVerify: true, label: "the step rounding",
        why: "Money rounds to cents: ROUND(…, 2) prints 10.99 and 29.01. Probed raw: 59.99 − 49 = 10.990000000000002 — float dust only ROUND sweeps; at 0 digits the audit would read 11 and 29." },
      { answer: "10.99", kind: "number", label: "the headroom threshold",
        why: "The audit floor is 10.99: probed, exactly 5 rungs clear it — Hub 49 → 59.99 (10.99), Jersey 65 → 79 (14), Keyboard 89.99 → 119 (29.01), Webcam 129 → 149.99 (20.99), Headset 149.99 → 199.99 (50). At 11 the Hub's jump — the threshold's namesake — drops out." },
      { answer: "price", kind: "keyword", label: "the column the ladder reads",
        why: "Steps are price-to-price: LEAD(price) OVER (ORDER BY price, id) — probed, that's what pairs 49 with 59.99. LEAD(stock) would subtract pallets from dollars and the 'steps' stop being money." },
    ],
    distractors: ["stock", "id", "name", "0", "1", "20"],
    walkthrough:
      "Two-stage: stage the full 16-product ladder with LEAD(price), then measure. Probed qualifying jumps: 49 → 59.99 (10.99 — the threshold's namesake, surviving on the raw 10.990000000000002), 65 → 79 (14), 89.99 → 119 (29.01), 129 → 149.99 (20.99), 149.99 → 199.99 (50) — five rows. The Fitness Band 79 → Keyboard 89.99 rung misses the bar — probed, it is not among the five — while the Hub's jump survives its own dust. The IS NOT NULL guard matters: the ceiling rung (Smart Watch 199.99) has no next price, and NULL arithmetic would silently drop it anyway. Round at 2 digits or the audit prints dust; at 0 it prints 11 where the memo quotes 10.99. Read stock instead of price and the 'steps' subtract pallets from dollars — a report with no units.",
  },
  {
    id: "cs-1343",
    tier: "medium",
    topic: "w4",
    universe: "growth",
    title: "Alice's long silences",
    brief:
      "From: Growth lead. Re: the churn watchlist.\n\nAlice is our reference account, and ops flags any gap of 20+ days between her consecutive orders — that's the silence threshold we'd apply to the whole base. The draft lost its reader, its threshold and its customer pin in a refactor. Rebuild it: her chain in date order, whole-day gaps, keep the 20-day-plus silences.",
    ask: "One query: Alice's orders whose gap to her previous order is at least 20 days.",
    template:
      "WITH walked AS (\n  SELECT id, created_at, total,\n         CAST(julianday(created_at) - julianday({2} OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d\n  FROM orders WHERE customer_id = {3}\n)\nSELECT id, created_at, total, gap_d\nFROM walked\nWHERE gap_d >= {1}\nORDER BY created_at, id;",
    slots: [
      { answer: "20", kind: "number", label: "the watchlist floor",
        why: "The watchlist floor is 20 days: gap_d >= 20. Probed: exactly 10 of Alice's 24 orders qualify — gaps 20, 29, 25, 36, 34, 22, 51, 21, 20, 21 — led by the 51-day silence before her November 11 order. A 21 floor would hide both 20-day silences." },
      { answer: "LAG(created_at)", kind: "keyword", label: "the previous-order reader",
        why: "The silence reads one row back: julianday(created_at) − julianday(LAG(created_at) OVER (…)). Probed: that's the 20, 29, 5, 9… cadence underneath. LEAD(created_at) reads forward — every silence goes negative and the watchlist empties." },
      { answer: "1", kind: "number", noVerify: true, label: "Alice's customer id",
        why: "The chain is Alice's: customer_id = 1, her 24 orders. Probed: customer 2 would audit Bruno's 2-order chain and customer 16 Pedro's 4 — the watchlist expects a year of history." },
    ],
    distractors: ["LEAD(created_at)", "created_at", "shipped_at", "2", "3", "16"],
    walkthrough:
      "Pin Alice (customer_id = 1, 24 orders), walk her chain by created_at with the id tiebreak, and feed the day math from LAG(created_at): julianday(this order) − julianday(previous order), CAST to whole days. Probed watchlist: exactly 10 silences clear 20 days — 20, 29, 25, 36, 34, 22, 51, 21, 20, 21 — the 51-day quiet before her November 11 order the longest, her September 6 → 7 turnaround a single day below the bar. LEAD flips the reader: her next order is always later, so every gap goes negative and nothing qualifies — an empty watchlist that looks like perfect engagement. Pin Bruno (2) or Pedro (16) and the check audits a two-order or four-order chain, not a year of behavior. The threshold is the policy: 21 would silently hide the two 20-day silences the memo exists to catch.",
  },
  {
    id: "cs-1346",
    tier: "medium",
    topic: "w4",
    universe: "growth",
    title: "The signup cadence",
    brief:
      "From: Growth lead. Re: the intake rhythm slide.\n\nThe deck's intake slide shows how many days separated each signup from the one before it — the rhythm we staff support around. The draft lost its edge filter, its day-typing and its reader in a refactor. Rebuild it: the 16-account walk in signup order, whole-day gaps, first row's blank dropped.",
    ask: "One query: customers in signup order with the whole-day gap to the previous signup, first blank dropped.",
    template:
      "WITH s AS (\n  SELECT id, name, created_at,\n         julianday(created_at) - julianday({3} OVER (ORDER BY created_at, id)) AS gap\n  FROM customers\n)\nSELECT id, name, created_at, CAST(gap AS {2}) AS gap_days\nFROM s\nWHERE gap {1}\nORDER BY created_at, id;",
    slots: [
      { answer: "IS NOT NULL", kind: "keyword", label: "the edge filter",
        why: "The first signup has no predecessor: WHERE gap IS NOT NULL drops it, keeping 15 measured gaps. Probed flip: IS NULL would return only Alice's 2023-11-02 row — the blank the slide skips." },
      { answer: "INTEGER", kind: "keyword", label: "the whole-day cast",
        why: "Whole days: CAST(gap AS INTEGER) prints 15, 18, 14… Probed raw: the julianday difference on date-only stamps carries a .5 fraction, and CAST(… AS TEXT) would print '15.0' — text where the slide wants numbers." },
      { answer: "LAG(created_at)", kind: "keyword", label: "the previous-signup reader",
        why: "The rhythm reads the previous signup: LAG(created_at) OVER (ORDER BY created_at, id). Probed: Bruno's 15 days after Alice, Chloe's 18 after Bruno. LEAD(created_at) reads forward and every gap goes negative." },
    ],
    distractors: ["IS NULL", "= 0", "TEXT", "BLOB", "LEAD(created_at)", "MIN(created_at)"],
    walkthrough:
      "Walk the 16 customers in signup order, subtract LAG(created_at) from created_at inside julianday, and CAST the difference to INTEGER. Probed rhythm: Alice 2023-11-02 opens (gap NULL, dropped by the filter), then Bruno 15 days later, Chloe 18, Dmitri 14, Emma 20, Farid 14 — through Pedro's 22-day close. The gaps run 11 to 22 days: intake never stalled past three weeks. The CAST is the typing step — raw julianday differences are .5-fractioned floats and CAST AS TEXT would print '15.0' strings. MIN(created_at) in the reader's seat would measure everyone against Alice instead of their actual predecessor, a growing staircase rather than a rhythm; LEAD flips every gap negative. Fifteen rows, one per measured gap — the edge row is the only one that walks.",
  },
  {
    id: "cs-1348",
    tier: "medium",
    topic: "w4",
    universe: "funnel",
    title: "The two-order dips",
    brief:
      "From: Marketing ops. Re: the volume watchlist.\n\nThe watchlist flags every month where order volume fell by exactly two against the prior month — that's our 'campaign went dark' signal. The draft lost its format string and its flag value in a refactor. Rebuild it: month buckets, count deltas via LAG, keep only the −2 months.",
    ask: "One query: months where the order-count delta is exactly −2, with counts.",
    template:
      "WITH monthly AS (\n  SELECT strftime({1}, created_at) AS mon, COUNT(*) AS orders\n  FROM orders GROUP BY mon\n), d AS (\n  SELECT mon, orders, orders - LAG(orders) OVER (ORDER BY mon) AS d_orders\n  FROM monthly\n)\nSELECT mon, orders, d_orders\nFROM d\nWHERE d_orders = {2}\nORDER BY mon\nLIMIT {3};",
    slots: [
      { answer: "'%Y-%m'", kind: "keyword", label: "the bucket format",
        why: "Real months only: '%Y-%m' gives the 14 true buckets. Probed trap: '%m' alone fuses years into 12 buckets — January would carry 14 orders (8+6) and the delta ladder would be fiction; '%Y' would reduce the whole history to 90 vs 13." },
      { answer: "-2", kind: "number", label: "the watchlist flag",
        why: "The signal is a two-order drop: d_orders = −2. Probed hits: 2024-06 (8 → 6) and 2024-10 (9 → 7) — exactly two months qualify; −1 would flag five months and drown the watchlist." },
      { answer: "2", kind: "number", noVerify: true, label: "the watchlist cap",
        why: "The watchlist expects two flags, so LIMIT 2. Probed: 2024-06 and 2024-10 are the only −2 months in the staged 14-bucket line — LIMIT 1 would hide October's dip from the ops channel." },
    ],
    distractors: ["'%m'", "'%Y'", "1"],
    walkthrough:
      "Stage the true month buckets (14 of them, counts 8, 9, 8, 7, 8, 6, 8, 7, 9, 7, 6, 7, 6, 7), take orders − LAG(orders) as the delta, then filter to exactly −2. Probed: 2024-06 (8 → 6) and 2024-10 (9 → 7) are the only hits — the two-order signal the ops channel pages on. The '%m' chip is the classic fuse: bare month numbers merge 2024-01's 8 with 2025-01's 6 into a 14-order January, and the delta ladder re-derives from fused fiction. '%Y' would compare 2025's 13 to 2024's 90 — a −77 that no watchlist asked for. Flag −1 instead of −2 and five months qualify (2024-03, 04, 08, 11, 2025-01), burying the real signal; flag +1 or +2 and you're watching growth months. LIMIT 2 matches the expected flag count — one row short hides October.",
  },
  {
    id: "cs-1350",
    tier: "medium",
    topic: "w4",
    universe: "month-close",
    title: "The invoice walk's shadow amounts",
    brief:
      "From: Finance ops. Re: the billing ladder for our top account.\n\nAlice's five invoices need walking in issue order with each previous invoice's amount beside it — the shadow column the dunning letter quotes. The draft lost its customer pin, its reader column and its cents-to-dollars divisor in a refactor. Rebuild it.",
    ask: "One query: Alice's invoices in issue order with the previous invoice's amount in dollars.",
    template:
      "SELECT i.customer_id, c.name, i.number, i.amount_cents / 100.0 AS amt,\n       LAG({2}) OVER (ORDER BY i.issued_on) / {3} AS prev_amt\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nWHERE i.customer_id = {1}\nORDER BY i.issued_on;",
    slots: [
      { answer: "1", kind: "number", label: "Alice's customer id",
        why: "The walk is customer 1's: Alice Chen, probed 5 invoices from INV-2024-001 (4860.00) to INV-2025-025 (6148.00). Customer 3 (Chloe) or 16 (Pedro) would walk a different account's billing ladder." },
      { answer: "i.amount_cents", kind: "keyword", label: "the column the walk reads",
        why: "The shadow column carries the previous invoice's AMOUNT: LAG(i.amount_cents). Probed walk: NULL, then 4860, 5284, 4723, 5614 beside rows two through five. LAG(i.number) would divide an invoice number by 100 and print zeros." },
      { answer: "100.0", kind: "number", noVerify: true, label: "the cents-to-dollars divisor",
        why: "Cents to dollars divides by 100.0. Probed traps: 10 would print 48600 — dollars times a thousand; 1000 would print 4.86. The divisor keeps the dunning letter in dollars." },
    ],
    distractors: ["0", "10", "1000", "16", "i.number", "i.due_on"],
    walkthrough:
      "Join invoices to customers, pin Alice (customer 1 → five invoices), and walk them by issued_on with LAG(i.amount_cents) laying the previous amount beside each row. Probed walk: 4860.00 opens with NULL (no invoice before it), then 4860 under INV-2024-005, then 5284, 4723, and 5614 closing on INV-2025-025's 6148.00. The divisor is where the money dies: 10 scales the shadow to 48600, 1000 shrinks it to 4.86 — both run without error, both lie. Read the wrong column and the shadow prints invoice numbers over 100 (zeros) or due dates over 100 (2024-ish junk). One filter, one window, one divisor — and the dunning letter quotes real dollars.",
  },
  // ============================== HARD ==============================
  {
    id: "cs-1323",
    tier: "hard",
    topic: "w4",
    universe: "expense",
    title: "The opex delta, month by month",
    brief:
      "From: Finance ops. Re: the burn review.\n\nThe burn review needs operating expenses bucketed by month with each month's change against the month before, and the first four months set the tone for the year. The draft lost its date column and its LAG target in a refactor. Rebuild it: bucket expenses by spent_on month, and take each delta off the previous month's bucket.",
    ask: "One query: the first four expense months with MoM opex delta (first month blank).",
    template:
      "WITH monthly AS (\n  SELECT strftime('%Y-%m', {1}) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend\n  FROM expenses GROUP BY mon\n)\nSELECT mon, spend,\n       ROUND(spend - LAG({2}) OVER (ORDER BY mon), 2) AS delta\nFROM monthly\nORDER BY mon\nLIMIT {3};",
    slots: [
      { answer: "spent_on", kind: "keyword", label: "the bucket's date column",
        why: "Expenses are dated by spent_on — that's the column the buckets come from. Probed first four buckets: 2024-01 1719, 2024-02 1440, 2024-03 1917, 2024-04 1749. strftime('%Y-%m', created_at) dies outright: expenses has no created_at column ('no such column')." },
      { answer: "spend", kind: "keyword", label: "the column LAG reads",
        why: "The delta is this month's bucket minus the previous bucket, so LAG reads the staged spend — probed deltas: NULL, −279, 477, −168. LAG(mon) would subtract a month label from a dollar figure (text coerces to 0) and print garbage deltas." },
      { answer: "4", kind: "number", noVerify: true, label: "the review cutoff",
        why: "The review quotes the first four months, so LIMIT 4. Probed: 1719 (blank delta), 1440 (−279), 1917 (+477), 1749 (−168) — the full staged line runs 14 buckets from 2024-01 to 2025-02." },
    ],
    distractors: ["created_at", "3", "14"],
    walkthrough:
      "Two-stage build: stage the buckets (strftime on spent_on, cents divided to dollars), then let LAG(spend) reach one bucket back for the delta. Probed open: January 1719 with a blank delta — no prior month exists — then February 1440 (−279), March 1917 (+477), April 1749 (−168). Point the strftime at created_at and the query doesn't even run: the expenses table has no such column, the same trap as bucketing orders by their columns. LAG the wrong column — the month label instead of the spend — and the engine coerces text to 0, printing deltas that look computed and mean nothing. LIMIT 4 scopes the exhibit to the months the review quotes; LIMIT 3 would drop April's −168, the first sign the burn re-tightened after March's spike.",
  },
  {
    id: "cs-1332",
    tier: "hard",
    topic: "w4",
    universe: "fraud",
    title: "The same-day twins",
    brief:
      "From: Fraud spot-check lead. Re: the burst detector.\n\nCloned entries get logged minutes apart, so at day resolution they share a created_at. I want every order logged on the same day as the order just before it — the burst pairs. The draft's day-math was lost in a refactor. Rebuild it: julianday day math over the created_at order, keep the zero-gap rows.",
    ask: "One query: every order whose gap to the previous order's day is zero, with the gap shown.",
    template:
      "WITH g AS (\n  SELECT id, customer_id, created_at, total,\n         julianday(created_at) - julianday({2} OVER (ORDER BY created_at, {3})) AS gap\n  FROM orders\n)\nSELECT id, customer_id, created_at, total, gap\nFROM g\nWHERE gap = {1}\nORDER BY created_at, id;",
    slots: [
      { answer: "0", kind: "number", label: "the same-day gap",
        why: "Same day means the day difference is exactly 0 — and the gap column carries it, so the 0 is verified in the result's own cells. Probed: 19 orders qualify, opening with order 8 (2024-01-02, right behind order 7) and closing with order 102 (2025-02-12, beside order 101)." },
      { answer: "LAG(created_at)", kind: "keyword", label: "the previous-day reader",
        why: "The gap reads the PREVIOUS order's day: LAG(created_at) OVER (ORDER BY created_at, id). Probed: julianday(created_at) − julianday(LAG(created_at)) = 0 on burst rows. LEAD(created_at) measures the NEXT day instead — the 2024-05-12 trio would flag orders 35 and 39 but lose 40." },
      { answer: "id", kind: "keyword", label: "the tie-breaker",
        why: "Seventeen created_at dates carry 2–3 orders — probed, 2024-05-12 alone holds orders 35, 39 and 40. The id tiebreak fixes which one is 'previous' inside a tie; without it the burst pairs on triple-booked days are nondeterministic." },
    ],
    distractors: ["LEAD(created_at)", "shipped_at", "total", "customer_id"],
    walkthrough:
      "Burst detection is day math: julianday(this order's created_at) minus julianday(LAG(created_at)) over the created_at,id order, and zero means same-day. Probed: 19 burst rows — the 2024-01-02 pair (orders 7, 8), the 2024-05-12 trio's tail (39, 40 behind 35), the 2024-10-13 pair (76, 77), closing with 102 beside 101 on 2025-02-12. Seventeen created_at dates carry multiple orders, which is why the id tiebreak is load-bearing: on 2024-05-12 the trio 35, 39, 40 needs a deterministic 'previous' or the pairs shuffle run to run. LEAD(created_at) measures the NEXT order instead — the trio would flag 35 and 39 and lose 40, and every pair would swap partners. And the gap column verifies itself: the 0 the WHERE asks for is sitting in the result.",
  },
  {
    id: "cs-1334",
    tier: "hard",
    topic: "w4",
    universe: "supplier",
    title: "The supplier-internal ladders",
    brief:
      "From: Procurement lead. Re: the per-supplier price maps.\n\nCategory maps tell us where a product sits in its shelf; what we need now is where each product sits against its own supplier's catalog — the rung below inside the same house. The draft's partition and its join were lost in a refactor. Rebuild it: one price ladder per supplier, keep only the rungs that have a cheaper sibling.",
    ask: "One query: each product with the price of the cheaper product from the same supplier.",
    template:
      "WITH ladder AS (\n  SELECT p.id, p.name, s.name AS supplier, p.price,\n         LAG(p.price) OVER (PARTITION BY {1} ORDER BY {2}) AS cheaper_in_supplier\n  FROM products p JOIN suppliers s ON {4}\n)\nSELECT supplier, name, price, cheaper_in_supplier\nFROM ladder\nWHERE cheaper_in_supplier {3}\nORDER BY supplier, price;",
    slots: [
      { answer: "s.id", kind: "keyword", label: "the partition key",
        why: "One ladder per supplier: PARTITION BY s.id restarts the walk inside each house. Probed: 10 of the 16 products have a cheaper supplier-sibling — Midwest's Headset 149.99 shows 42.5 below it. Partitioning by p.price would give every product its own partition and empty the report." },
      { answer: "p.price", kind: "keyword", label: "the ladder's climb key",
        why: "Within a supplier the ladder climbs by price: ORDER BY p.price — probed, Shenzhen's rungs pair Mouse 34.5 below Ring Light 39.99. Climbing by p.id or p.name scrambles the rungs and mislabels every 'cheaper' figure." },
      { answer: "IS NOT NULL", kind: "keyword", label: "the has-a-sibling filter",
        why: "Only rungs with a cheaper sibling belong: cheaper_in_supplier IS NOT NULL keeps 10 rows. Probed flip: IS NULL would return the 6 cheapest-per-supplier rungs instead — a different report entirely." },
      { answer: "s.id = p.supplier_id", kind: "keyword", label: "the join's match condition",
        why: "Products attach to their supplier via s.id = p.supplier_id. Probed trap: p.id = s.id is an id collision — it pairs six accidental rows and drops the other products, a catalog that quietly lost half its shelves." },
    ],
    distractors: ["p.category", "p.id", "p.stock", "IS NULL", "= 0", "p.id = s.id"],
    walkthrough:
      "The join attaches each product to its house, then the window restarts per supplier: PARTITION BY s.id, ORDER BY p.price, LAG(p.price) reads the rung below inside the same house. Probed: 10 rungs have a cheaper sibling — Nordic's Smart Watch 199.99 shows 129 below it, Midwest's Headset 149.99 shows 42.5 — and the six floor rungs, one per supplier, come back NULL, dropped by IS NOT NULL. Partition by price instead and every product is its own partition: all NULLs, empty map. The join condition is the quiet hero: p.id = s.id matches rows that merely share a number — six accidental pairs, eight products gone — while s.id = p.supplier_id builds the real relationship. And flipping the filter to IS NULL hands you the six floors, not the ten rungs with siblings.",
  },
  {
    id: "cs-1335",
    tier: "hard",
    topic: "w4",
    universe: "expense",
    title: "The two opex jumps",
    brief:
      "From: Finance ops. Re: the burn bridge.\n\nThe burn bridge flags every month where operating expenses jumped by more than 400 dollars against the prior month — that's the threshold the partners sign off on. The draft lost its date column, its reader and its threshold in a refactor. Rebuild it: expense buckets by month, MoM delta via LAG, keep only the jumps.",
    ask: "One query: expense months whose MoM delta exceeds 400 dollars, with the delta.",
    template:
      "WITH monthly AS (\n  SELECT strftime('%Y-%m', {2}) AS mon, ROUND(SUM(amount_cents) / 100.0, 2) AS spend\n  FROM expenses GROUP BY mon\n), swung AS (\n  SELECT mon, spend, ROUND(spend - {3} OVER (ORDER BY mon), 2) AS delta FROM monthly\n)\nSELECT mon, spend, delta FROM swung WHERE delta > {1} ORDER BY mon;",
    slots: [
      { answer: "400", kind: "number", noVerify: true, label: "the partners' jump threshold",
        why: "The sign-off threshold is 400: delta > 400. Probed: exactly two months clear it — 2024-03 at +477 and 2024-08 at +1416 (the August spike). A 500 floor would keep only August; demanding more than 1416 would flag nothing at all." },
      { answer: "spent_on", kind: "keyword", label: "the expense date column",
        why: "Expenses are dated by spent_on. Probed: strftime('%Y-%m', created_at) dies outright — expenses has no created_at column ('no such column'); bucketing by vendor would jam every bill into one NULL bucket." },
      { answer: "LAG(spend)", kind: "keyword", label: "the prior-month reader",
        why: "The delta reads one bucket back: spend − LAG(spend) OVER (ORDER BY mon). Probed: 1917 − 1440 = 477 for 2024-03. LEAD(spend) would compare against the NEXT month and flag a different pair." },
    ],
    distractors: ["477", "1416", "500", "created_at", "vendor", "LEAD(spend)"],
    walkthrough:
      "Same MoM skeleton as revenue, on the expense table: bucket by spent_on month (probed open: 1719, 1440, 1917, 1749), swing with LAG(spend), then the partners' rule: delta > 400. Probed: exactly two months qualify — 2024-03's +477 and 2024-08's +1416, the August spike every close deck quotes. The threshold is sharp by design: 500 would hide March's 477, and anything above 1416 flags nothing. The date column is the trap — expenses has no created_at, so the draft's strftime dies with 'no such column' before it prints a row. And LEAD turns the bridge around: comparing each month to the one AFTER it flags the wrong pair entirely.",
  },
  {
    id: "cs-1337",
    tier: "hard",
    topic: "w4",
    universe: "supplier",
    title: "The two-rung regions",
    brief:
      "From: Procurement lead. Re: the regional depth check.\n\nRegions where suppliers stack two deep give us a real comparison — a supplier with a neighbor just above them. I need the regions where the regional ladder leaves exactly one supplier with a rating just above it. The draft lost its partition key, its reader and its bar in a refactor. Rebuild it: partition suppliers by region, read the rating just above with LEAD, keep the regions where exactly one row has that neighbor.",
    ask: "One query: regions where exactly one supplier has a rating just above it (region-partitioned).",
    template:
      "WITH laddered AS (\n  SELECT id, name, region, rating,\n         {3} OVER (PARTITION BY {1} ORDER BY rating, id) AS above\n  FROM suppliers\n)\nSELECT region, COUNT(*) AS n, COUNT(above) AS with_above\nFROM laddered\nGROUP BY region\nHAVING with_above = {2}\nORDER BY region;",
    slots: [
      { answer: "region", kind: "keyword", label: "the partition key",
        why: "'Above' means above INSIDE the region: PARTITION BY region. Probed: APAC runs Pacific 3.9 → Shenzhen 4.1 and EU runs Nordic 4.6 → Alpine 4.8, while US and LATAM are one-supplier regions. A constant partition dissolves the regions into one six-supplier ladder and flags the wrong set." },
      { answer: "1", kind: "number", label: "the one-neighbor bar",
        why: "The check is 'exactly one supplier has a neighbor above': HAVING with_above = 1. Probed counts: APAC 1, EU 1, US 0, LATAM 0 — so 1 keeps the two two-rung regions, 2 keeps only APAC, and 0 keeps the one-supplier regions." },
      { answer: "LEAD(rating)", kind: "keyword", label: "the above-neighbor reader",
        why: "The neighbor just above is one row forward: LEAD(rating) OVER (PARTITION BY region ORDER BY rating, id). Probed: Shenzhen 4.1 reads Pacific's 3.9 below it and NULL above — wait, no: 4.1 is APAC's top, so its above is NULL; Pacific's above is 4.1. COUNT(above) counts the non-NULL neighbors." },
    ],
    distractors: ["name", "rating", "id", "2", "0", "FIRST_VALUE(rating)"],
    walkthrough:
      "Partition the six suppliers by region and the ladders decompose: APAC runs Pacific 3.9 → Shenzhen 4.1, EU runs Nordic 4.6 → Alpine 4.8, while US (Midwest) and LATAM (Andes) are one-supplier regions with no rungs at all. LEAD(rating) lays each supplier's above-neighbor beside it: probed, COUNT(above) counts the non-NULL neighbors per region — APAC 1, EU 1, US 0, LATAM 0 — and HAVING with_above = 1 keeps the two two-rung regions. FIRST_VALUE would paint the region floor on every row — never NULL — so the count would equal the region size and US/LATAM would sneak in. A constant partition dissolves the regions into one six-supplier ladder and flags the wrong set; the whole point is that 'above' means above INSIDE the region.",
  },
  {
    id: "cs-1339",
    tier: "hard",
    topic: "w4",
    universe: "funnel",
    title: "The months that beat last month",
    brief:
      "From: Marketing ops. Re: the growth-month shortlist.\n\nFor the growth story I need the months that matched or beat the month before them, expressed as a percentage of the prior month's spend — 100 means flat, 197 means we nearly doubled. The draft lost its reader, its rounding and its bar in a refactor. Rebuild it: pct-of-prior via LAG, keep 100 and up, best first.",
    ask: "One query: months at or above 100% of the prior month's spend, with the percentage.",
    template:
      "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS spend\n  FROM orders GROUP BY mon\n), ratioed AS (\n  SELECT mon, spend, ROUND(100.0 * spend / {3} OVER (ORDER BY mon), {1}) AS pct_of_prev\n  FROM monthly\n)\nSELECT mon, spend, pct_of_prev\nFROM ratioed\nWHERE pct_of_prev >= {2}\nORDER BY pct_of_prev DESC;",
    slots: [
      { answer: "1", kind: "number", noVerify: true, label: "the percentage rounding",
        why: "Percentages read to a tenth: ROUND(…, 1) prints the probed line 197, 143.2, 132.5, 127.5, 117.9. Round at 0 and 143.2 flattens to 143 — the tenths the deck quotes vanish." },
      { answer: "100", kind: "number", noVerify: true, label: "the matched-or-beat bar",
        why: "The bar is 100 — matched or beat: pct_of_prev >= 100. Probed: exactly 5 of the 13 comparable months clear it, led by 2024-08 at 197 (the +97% jump) and closing with 2024-05 at 117.9. At 130 the shortlist loses 2024-05 and 2024-12 (127.5)." },
      { answer: "LAG(spend)", kind: "keyword", label: "the prior-month reader",
        why: "The ratio reads the prior month: 100.0 × spend / LAG(spend) OVER (ORDER BY mon). Probed: 2024-08's 2352.07 against July's 1193.86 → 197. LEAD(spend) would divide by the NEXT month and shortlist the wrong set." },
    ],
    distractors: ["LEAD(spend)", "spend", "mon", "0", "2", "130"],
    walkthrough:
      "The growth lens is a ratio, not a delta: stage the 14 month buckets, then 100.0 × spend / LAG(spend) turns each month into a percentage of its predecessor. Probed shortlist, best first: 2024-08 at 197 (July's 1193.86 nearly doubled), 2025-02 at 143.2, 2024-09 at 132.5, 2024-12 at 127.5, 2024-05 at 117.9 — five months at or above the 100 bar; 2024-01 never qualifies because its LAG is NULL and NULL arithmetic filters out. LEAD flips the denominator to the future and the shortlist reshuffles; rounding at 0 digits keeps the story but sheds the tenths the deck quotes; and the ORDER BY pct_of_prev DESC is what makes it a shortlist rather than a chronology — best month on top.",
  },
  {
    id: "cs-1340",
    tier: "hard",
    topic: "w4",
    universe: "refund-audit",
    title: "The cancellation wait ladder",
    brief:
      "From: Refund audit lead. Re: the cancellation cadence metric.\n\nThe fraud team wants the cancellation cadence in whole days — how long between one cancellation and the next. The draft lost its status literal, its reader and its day column in a refactor. Rebuild it: the seven cancellations in date order, each with the whole-day wait since the previous one.",
    ask: "One query: the cancelled orders in date order with the whole-day gap to the previous cancellation.",
    template:
      "WITH c AS (\n  SELECT id, created_at,\n         CAST(julianday({3}) - julianday({2} OVER (ORDER BY created_at, id)) AS INTEGER) AS gap_d\n  FROM orders WHERE status = {1}\n)\nSELECT id, created_at, gap_d FROM c ORDER BY created_at, id;",
    slots: [
      { answer: "'cancelled'", kind: "keyword", label: "the cancellation filter",
        why: "The cadence is the cancelled chain: status = 'cancelled' stages exactly 7 orders. Probed: 'pending' would measure 14 unrelated waits and 'delivered' 52 — neither is the cancellation timeline." },
      { answer: "LAG(created_at)", kind: "keyword", label: "the previous-cancellation reader",
        why: "The wait reads one row back: LAG(created_at) OVER (ORDER BY created_at, id). Probed chain: order 7 opens NULL, then 76 days to the next cancellation, 106, 23, 102, 20, 42. LEAD(created_at) measures forward and every wait goes negative." },
      { answer: "created_at", kind: "keyword", label: "the day the math measures",
        why: "Both sides of the subtraction read created_at — the current day minus the previous day. Probed: that's what turns the 2024-03-18 → 2024-07-02 pair into 106 whole days. julianday(shipped_at) would mix clocks — cancellations mostly aren't shipped." },
    ],
    distractors: ["'pending'", "'delivered'", "LEAD(created_at)", "shipped_at", "id", "total"],
    walkthrough:
      "Filter to the seven cancellations, walk them by created_at with the id tiebreak, and let julianday do the day math: current minus LAG(previous). Probed cadence: 2024-01-02 opens with NULL (nothing before it), then 76 days of quiet to 2024-03-18, 106 to 2024-07-02, 23 to 2024-07-25, 102 to 2024-11-04, 20 to 2024-11-24, and 42 into 2025-01-05 — CAST to INTEGER prints whole days instead of the raw .5-fractioned floats. LEAD flips the walk negative; 'pending' or 'delivered' would time the wrong queue entirely; and feeding julianday the id column measures row numbers, not days.",
  },
  {
    id: "cs-1344",
    tier: "hard",
    topic: "w4",
    universe: "funnel",
    title: "The pending wait line",
    brief:
      "From: Marketing ops. Re: the waitlist watch.\n\nThe pending queue doubles as our waitlist: each pending order needs the wait, in whole days, since the previous pending order went in — the gap tells us whether interest is clustering. The draft lost its status literal, its reader and its join key in a refactor. Rebuild it.",
    ask: "One query: pending orders in date order with names, and the whole-day wait since the previous pending order.",
    template:
      "SELECT c.name, o.id, o.created_at, o.total,\n       CAST(julianday(o.created_at) - julianday(LAG({2}) OVER (ORDER BY o.created_at, o.id)) AS INTEGER) AS wait_d\nFROM orders o JOIN customers c ON c.id = {3}\nWHERE o.status = {1}\nORDER BY o.created_at, o.id;",
    slots: [
      { answer: "'pending'", kind: "keyword", label: "the waitlist status",
        why: "The waitlist is the pending queue: status = 'pending' stages 14 orders. Probed head: Emma's 725.34 opens with NULL, Pedro's 576.54 waits 3 days, Maya's 148.28 waits 33. 'shipped' would time 30 fulfilled orders instead." },
      { answer: "o.created_at", kind: "keyword", label: "the column the wait reads",
        why: "The wait reads the previous pending order's day: LAG(o.created_at) OVER (ORDER BY o.created_at, o.id). Probed: that's the 3, 33, 27, 20… line. Bare created_at is ambiguous in this join — both orders and customers carry the column — and o.shipped_at would time ships, not sign-ups." },
      { answer: "o.customer_id", kind: "keyword", label: "the join's match side",
        why: "Orders attach to waitlisted accounts via c.id = o.customer_id. Probed trap: c.id = o.id is an id-collision join — it pairs orders and customers that merely share a number, and the 14-order queue dissolves." },
    ],
    distractors: ["'shipped'", "'cancelled'", "o.shipped_at", "o.id", "created_at", "c.id"],
    walkthrough:
      "Join orders to customers so the waitlist shows names, filter to the 14 pending rows, then LAG(o.created_at) over the date order feeds the day math. Probed line: Emma Wilson's 725.34 opens the queue (NULL — nothing before it), Pedro Alvarez waits 3 days, Maya Patel 33, Alice Chen 27, Chloe Dubois 20; the tightest cluster sits on 2024-10-04 where Farid's 1088.44 and Grace's 273.64 land the same day — waits 90 and 0. CAST to INTEGER keeps whole days. The reader must be o.created_at — bare created_at is ambiguous once customers joins in (both tables carry it), and shipped_at times a different event. And the join key is the relationship: c.id = o.customer_id; c.id = o.id pairs rows that merely share a number and the queue dissolves.",
  },
  {
    id: "cs-1345",
    tier: "hard",
    topic: "w4",
    universe: "expense",
    title: "The rent calendar's gaps",
    brief:
      "From: Finance ops. Re: the rent ledger check.\n\nRent bills land monthly and the ledger check wants the day gap between consecutive bills — 30 or 31 days, every time, or the schedule slipped. The draft lost its partition, its category literal and its edge filter in a refactor. Rebuild it: one rent timeline, whole-day gaps, drop the first bill's blank.",
    ask: "One query: the Rent expense bills in date order with the whole-day gap to the previous bill.",
    template:
      "WITH rent AS (\n  SELECT id, category, spent_on, amount_cents / 100.0 AS amt,\n         CAST(julianday(spent_on) - julianday(LAG(spent_on) OVER (PARTITION BY {1} ORDER BY spent_on)) AS INTEGER) AS gap_d\n  FROM expenses\n)\nSELECT id, spent_on, amt, gap_d\nFROM rent\nWHERE category = {2} AND gap_d {3}\nORDER BY spent_on;",
    slots: [
      { answer: "category", kind: "keyword", label: "the partition key",
        why: "The timeline restarts per category: PARTITION BY category keeps each expense type on its own calendar. Probed: the Rent partition runs 2024-01-01 → 2025-02-01 with gaps 31, 29, 31, 30… Partitioning by spent_on or id would give every bill its own partition and empty the report." },
      { answer: "'Rent'", kind: "keyword", label: "the category literal",
        why: "The check is Rent only: category = 'Rent' stages the 14 monthly bills at 1200.00 each. Probed: 'Ads' would audit a different vendor's irregular bills and 'Travel' the three Skyline trips." },
      { answer: "IS NOT NULL", kind: "keyword", label: "the edge filter",
        why: "The first bill has no predecessor: gap_d IS NOT NULL drops it, keeping the 13 real gaps. Probed flip: IS NULL would return that lone 2024-01-01 row — the blank the check exists to skip." },
    ],
    distractors: ["spent_on", "id", "memo", "'Ads'", "'Travel'", "IS NULL"],
    walkthrough:
      "Partition expenses by category so each type keeps its own calendar, filter to Rent — 14 bills of 1200.00, one per month from 2024-01-01 to 2025-02-01 — and measure: julianday(this bill) − julianday(LAG(previous bill)), CAST to whole days. Probed gaps: 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31, 31 — the leap-year February's 29 sitting in the middle of the 30/31 rhythm. The first bill's gap is NULL (no prior bill), which IS NOT NULL drops — the filter is the difference between 13 checks and 13 checks plus a blank. Partition by spent_on or id and every bill becomes its own partition: all gaps NULL, empty report. And the category literal is the scope: 'Ads' bills land on no schedule at all.",
  },
  {
    id: "cs-1347",
    tier: "hard",
    topic: "w4",
    universe: "catalog",
    title: "The shelf ceilings via the empty rung",
    brief:
      "From: Warehouse ops. Re: the shelf-ceiling board.\n\nFor the shelf audit I need each category's priciest product — found the window way: on a per-category price ladder, the ceiling rung is the one whose NEXT rung is empty. The draft lost its partition, its edge literal and its reader in a refactor. Rebuild it: LEAD over category partitions, keep the rows with no neighbor.",
    ask: "One query: the priciest product in each category, found via the empty LEAD rung.",
    template:
      "WITH ranked AS (\n  SELECT id, name, category, price,\n         {3} OVER (PARTITION BY {1} ORDER BY price) AS neighbor_price\n  FROM products\n)\nSELECT category, name, price\nFROM ranked\nWHERE neighbor_price IS {2}\nORDER BY category, price;",
    slots: [
      { answer: "category", kind: "keyword", label: "the partition key",
        why: "One ladder per shelf: PARTITION BY category restarts the price walk in each of the 7 categories. Probed: Accessories' ladder ends at Laptop Stand 42.5 (HDMI 14.99 and Desk Mat 24.99 sit below). Partitioning by supplier_id would answer a supplier question — six houses, not seven shelves." },
      { answer: "NULL", kind: "keyword", label: "the empty-rung edge",
        why: "The ceiling rung is the one with no next rung: neighbor_price IS NULL. Probed: exactly 7 rows — one per category. IS NOT NULL would return the other 9 products, every product that HAS a pricier shelf-mate." },
      { answer: "LEAD(price)", kind: "keyword", label: "the upward reader",
        why: "The reader points UP the ladder: LEAD(price) OVER (PARTITION BY category ORDER BY price). Probed: that leaves NULL only on each category's top rung. LAG(price) would flag the FLOORS instead — HDMI 14.99's crowd, a different board." },
    ],
    distractors: ["supplier_id", "price", "name", "NOT NULL", "LAG(price)", "FIRST_VALUE(price)"],
    walkthrough:
      "Partition the 16 products by category, climb each shelf by price with LEAD(price), and the ceiling rung announces itself: its neighbor is NULL. Probed board: Accessories → Laptop Stand 42.5, Apparel → Cycling Jersey 65, Audio → Noise-Canceling Headset 149.99, Electronics → Mechanical Keyboard 89.99, Fitness → Yoga Mat 32, Video → 4K Webcam 129, Wearables → Smart Watch 199.99 — seven shelves, seven ceilings. LAG flips the lens to the floors (HDMI 14.99 and friends); FIRST_VALUE pins the category floor on every row so nothing is NULL and the board empties; and partitioning by supplier_id or price answers a question nobody asked — per-price partitions make all 16 rungs 'ceilings'.",
  },
  {
    id: "cs-1349",
    tier: "hard",
    topic: "w4",
    universe: "fraud",
    title: "The five-hundred-dollar swings",
    brief:
      "From: Fraud spot-check lead. Re: the account-swing review.\n\nAccounts whose spend jumps 500 dollars or more between consecutive orders get a look — that's the swing threshold. The draft lost its partition, its operand, its threshold and its walk key in a refactor. Rebuild it: per-customer chains in id order, swing = this total minus the previous, keep the 500+ moves.",
    ask: "One query: orders whose total is at least 500 above the customer's previous order total.",
    template:
      "WITH walked AS (\n  SELECT id, customer_id, total,\n         {2} - LAG(total) OVER (PARTITION BY {1} ORDER BY {4}) AS swing\n  FROM orders\n)\nSELECT customer_id, id, total, ROUND(swing, 2) AS swing\nFROM walked\nWHERE swing >= {3}\nORDER BY customer_id, id;",
    slots: [
      { answer: "customer_id", kind: "keyword", label: "the partition key",
        why: "Swings live inside one account's chain: PARTITION BY customer_id restarts the walk per customer. Probed: 6 orders clear the bar — Alice's 89 (+568.25), Chloe's 43 (+824.09), Emma's 57 (+746.40), Pedro's 74 (+1043.96), Grace's 15 (+779.36), Keiko's 71 (+582.34). A constant partition would measure storewide jumps instead." },
      { answer: "total", kind: "keyword", label: "the swing's operand",
        why: "The swing is money minus money: total − LAG(total). Probed: 684.53 − 116.28 = 568.25 for order 89. Subtracting created_at would coerce the date to 2024 and print fake swings." },
      { answer: "500", kind: "number", noVerify: true, label: "the swing threshold",
        why: "The review bar is 500: swing >= 500. Probed: at 600 the list loses Keiko's 582.34 and Alice's 568.25; at 700 only the 824.09, 1043.96 and 779.36 swings survive." },
      { answer: "id", kind: "keyword", label: "the chain's walk key",
        why: "Chains walk in id order: ORDER BY id inside the partition. Probed: Alice's id order (7, 3, 14…) disagrees with her date order, so the walk key changes every swing in her chain." },
    ],
    distractors: ["status", "created_at"],
    walkthrough:
      "Partition the 103 orders by customer, walk each chain by id, and the swing column is total minus the account's previous total. Probed clears of the 500 bar: Alice's order 89 (+568.25), Chloe's 43 (+824.09), Emma's 57 (+746.40), Pedro's 74 (+1043.96), Grace's 15 (+779.36), Keiko's 71 (+582.34) — six moves, printed cent-exact by ROUND(…, 2). The partition is the whole trick: dissolve it with a constant and the swings measure the storewide ladder instead of account behavior; partition by created_at and every chain is one row long — all swings NULL, empty review. The operand is total: subtract the created_at text and SQLite coerces '2024-05-12' to 2024, printing swings that look computed and mean nothing. And the walk key matters where id and date disagree — Alice's chain runs 7, 3, 14 by id but ascending by date, so ORDER BY created_at re-pairs her orders and rewrites every swing.",
  },
  {
    id: "cs-1351",
    tier: "hard",
    topic: "w4",
    universe: "supplier",
    title: "The regional champions' empty rungs",
    brief:
      "From: Procurement lead. Re: the regional champion board.\n\nFour regions, and each needs its highest-rated supplier crowned — found the window way: on a region-partitioned rating ladder, the champion is the rung with nothing above it. The draft lost its edge literal, its partition and its output column in a refactor. Rebuild it.",
    ask: "One query: each region's highest-rated supplier, found via the empty LEAD rung.",
    template:
      "WITH laddered AS (\n  SELECT s.id, s.name, s.region, s.rating,\n         LEAD(s.rating) OVER (PARTITION BY {2} ORDER BY rating, s.id) AS above\n  FROM suppliers s\n)\nSELECT region, name, {3}\nFROM laddered\nWHERE above IS {1}\nORDER BY region, rating;",
    slots: [
      { answer: "NULL", kind: "keyword", label: "the empty-rung edge",
        why: "The champion is the rung with no neighbor above: above IS NULL. Probed: exactly 4 rows — Shenzhen 4.1 for APAC, Alpine 4.8 for EU, Andes 4.0 for LATAM, Midwest 4.4 for US. IS NOT NULL would return the two runners-up instead." },
      { answer: "region", kind: "keyword", label: "the partition key",
        why: "Ladders restart per region: PARTITION BY region. Probed: APAC runs Pacific 3.9 → Shenzhen 4.1, so Shenzhen's above is NULL. Partitioning by name or id gives every supplier its own ladder — six champions, one per supplier." },
      { answer: "rating", kind: "keyword", label: "the board's output column",
        why: "The board prints the champion's rating: SELECT region, name, rating. Probed: 4.1, 4.8, 4.0, 4.4 — the figures the scorecard quotes. Selecting above instead would print four NULLs." },
    ],
    distractors: ["NOT NULL", "name", "id", "above"],
    walkthrough:
      "Partition the six suppliers by region, climb each region by rating with LEAD, and the champion is whichever rung has nothing above it — above IS NULL. Probed board: APAC crowns Shenzhen Electro 4.1 (Pacific's 3.9 sits below), EU crowns Alpine Audio 4.8 over Nordic's 4.6, LATAM crowns Andes 4.0, US crowns Midwest 4.4 — four regions, four champions. IS NOT NULL flips the board to the runners-up (Pacific, Nordic); partitioning by name or id dissolves the regions entirely, six ladders of one rung each, six 'champions'; and printing above instead of rating hands the deck a column of NULLs. One partition key, one direction, one output column — the board is the NULL edges made visible.",
  },
];
