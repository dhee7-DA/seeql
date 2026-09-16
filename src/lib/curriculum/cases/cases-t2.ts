// Case batch T2 — Module 5 (scalar & window toolkit) cases cs-1251…cs-1300, wave 2.
// Topics: t5 RANK & friends (15) / t6 partition windows (15) / t7 LAG & LEAD (10) /
// t8 window capstone (10). First window wave — every t5–t8 case carries OVER()
// (audit-enforced). Figures receipt-verified in scripts/m5-cases-w2{,b}-out.txt.
import type { CaseStudy } from "./types";

export const casesT2: CaseStudy[] = [
  {
    id: "cs-1251",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The spend podium",
    brief:
      "From: Growth lead. Re: the leaderboard build.\n\nThe leaderboard ranks every member's lifetime spend without collapsing the roster — window territory. Stage the per-member spend, rank it with RANK OVER, and read the podium: the top three spenders, busiest first, with a spend bar that only the serious clear.",
    ask: "The top three members by lifetime spend, ranked.",
    template: `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
SELECT RANK() OVER (ORDER BY spend {1}) AS rk, name, spend
FROM s
WHERE spend {2} {3}
LIMIT 3;`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "The podium lists the biggest spenders first, so the rank orders spend descending. ASC would rank the lightest spenders as the podium and invert the board.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the bar direction",
        why: "The bar keeps members above a floor, so the test is >. Flipping to < would demand spend below the floor and empty the podium.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open spend bar",
        why: "A bar of 0 admits every spender — the ranking does the cutting. A bar of 5000 would leave only two members and shrink the podium.",
      },
    ],
    distractors: ["ASC", "<", "5000"],
    walkthrough:
      "The window ranks all sixteen members without collapsing a single one — RANK() OVER (ORDER BY spend DESC) hands back sixteen rows, each wearing its position — and the podium cut reads: Alice Chen 7262.35, Emma Wilson 6640.56, Grace Kim 4574.23. The DESC direction is the board's spine; ASC would crown Olivia's 444.80 and shame the leaderboard. The bar stays at 0 so the ranking itself does the work — a 5000 bar would slice the roster to two and fake a thinner podium. The leaderboard's top line: Alice, rank 1, 7262.35.",
  },
  {
    id: "cs-1252",
    tier: "easy",
    topic: "t5",
    universe: "supplier",
    title: "Ties that share a podium",
    brief:
      "From: Supplier audit. Re: the shelf-count board.\n\nFour suppliers carry three products each and the board wants them to share rank 1 — with no gaps after. That is DENSE_RANK's contract: ties share a rank, the next distinct value takes the very next rank. Rank the bench by product count.",
    ask: "DENSE_RANK the suppliers by product count, busiest first.",
    template: `SELECT name, n, DENSE_RANK() OVER (ORDER BY n {1}) AS rk
FROM (
  SELECT s.name, COUNT(p.id) AS n
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
)
WHERE n >= {2}
ORDER BY rk {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the bench direction",
        why: "The board leads with the widest shelves, so the rank orders counts descending. ASC would rank the two-product suppliers first and flip the board.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the shelf bar",
        why: "The bar keeps the two-product suppliers on the board — every supplier clears it. A bar of 3 would leave only the four-way tie and hide the dense-rank jump.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the read order",
        why: "The board reads top-down through the tie block, so the output sorts ranks ascending. DESC would open on the two-product pair and bury the shared podium.",
      },
    ],
    distractors: ["3", "ROW_NUMBER"],
    walkthrough:
      "DENSE_RANK honors the contract exactly: the four three-product suppliers — Nordic, Shenzhen, Pacific, Midwest — all share rank 1, and the two-product pair, Alpine and Andes, take rank 2 with no gap. That 'no gap' is the dense promise: RANK would have jumped the second tier to 5. Ordering ASC would rank the two-shelf suppliers first and obscure the tie block. And the bar at 2 keeps the comparison visible — a 3 bar would cut to the tie alone and the dense-vs-plain lesson would vanish. The board reads: four at 1, two at 2.",
  },
  {
    id: "cs-1253",
    tier: "medium",
    topic: "t5",
    universe: "supplier",
    title: "Numbered regardless of ties",
    brief:
      "From: Supplier audit. Re: the row-numbered roster.\n\nThe same four-way tie, but this report needs no shared podium — every supplier gets its own row number, ties broken by the engine's order. ROW_NUMBER is the tool. Number the bench from the lightest shelves up.",
    ask: "ROW_NUMBER the suppliers by product count, ascending.",
    template: `SELECT name, n, ROW_NUMBER() OVER (ORDER BY n {1}) AS rn
FROM (
  SELECT s.name, COUNT(p.id) AS n
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
)
WHERE n >= {3}
LIMIT {2};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the numbering direction",
        why: "The roster numbers from the lightest shelves up, so the order is ascending. DESC would hand row 1 to the four-way tie block instead.",
      },
      {
        answer: "6",
        kind: "number",
        noVerify: true,
        label: "the whole-bench cut",
        why: "Six suppliers make the bench, so the cut keeps them all. A cut of 4 would show only the tie block and hide how the numbering breaks it.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the shelf floor",
        why: "The floor of 2 keeps the whole bench — the lightest shelves carry exactly two products. A floor of 4 exceeds every shelf and would empty the roster.",
      },
    ],
    distractors: ["DESC", "4"],
    walkthrough:
      "ROW_NUMBER ignores ties by design: ascending, the two-product suppliers — Andes and Alpine — take rows 1 and 2, and the four three-product suppliers take 3 through 6 in engine order. Where DENSE_RANK let them share rank 1, ROW_NUMBER hands each a distinct number, which is exactly what a row-numbered export needs. DESC would start the numbering at the tie block and bury the light shelves. The cut of 4 would stop inside the tie and never show how the numbers keep climbing. The roster numbers: 1 through 6, no sharing.",
  },
  {
    id: "cs-1254",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The oldest member",
    brief:
      "From: Growth lead. Re: the loyalty read.\n\nThe loyalty team wants the member who signed up first — not by spend, by the calendar. Number the roster by signup date and keep only row 1: the original.",
    ask: "The customer who signed up first.",
    template: `SELECT name, created_at
FROM (
  SELECT name, created_at, ROW_NUMBER() OVER (ORDER BY created_at {1}) AS rn
  FROM customers
)
WHERE rn {2} {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar direction",
        why: "The first signup sits at the top of an ascending date order. DESC would number from the newest signup and hand row 1 to the latest member.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the row-one test",
        why: "The read wants exactly the original member, so rn = 1. Flipping to > would return everyone except the original — the opposite cohort.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the original row",
        why: "Row 1 of the ascending signup order is the oldest member. A 16-fill would select the newest signup instead.",
      },
    ],
    distractors: ["DESC", ">", "16"],
    walkthrough:
      "ROW_NUMBER over the ascending signup calendar puts Alice Chen at row 1 — November 2, 2023, the roster's original member. DESC would flip the numbering and crown Pedro's July 2024 signup, the newest rather than the oldest. The = 1 test keeps exactly one row: the > fill would return the other fifteen, a loyalty read with the honoree deleted. And the 16-fill would land on Pedro for the same inverted reason. The loyalty team's answer: Alice Chen, 2023-11-02.",
  },
  {
    id: "cs-1255",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The eighth member aboard",
    brief:
      "From: Growth lead. Re: the anniversary calendar.\n\nThe anniversary program gifts the members in signup order, and the next batch starts at the eighth. Number the roster from the newest signup backwards and read row 8.",
    ask: "The customer who signed up eighth, counting from the newest.",
    template: `SELECT name, created_at
FROM (
  SELECT name, region, created_at, ROW_NUMBER() OVER (ORDER BY created_at {1}) AS rn
  FROM customers
)
WHERE rn = {2}
AND region {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the anniversary direction",
        why: "The program counts from the newest member backwards, so the order is descending. ASC would count from Alice's 2023 signup and land somewhere else entirely.",
      },
      {
        answer: "8",
        kind: "number",
        noVerify: true,
        label: "the anniversary row",
        why: "Row 8 of the descending signup order is the eighth-newest member. A 2-fill would select Olivia, the second-newest.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the chapter gate",
        why: "The gift batch draws from one chapter, so the gate is region = 'APAC'. Flipping to != would mix every other chapter into the count.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the chapter value",
        why: "Row 8 of the descending roster is a European signup, so the gate is region = 'EU'. The 'US' fill would find no eighth member — that chapter fields only two.",
      },
    ],
    distractors: ["ASC", "2", "'US'"],
    walkthrough:
      "Numbering from the newest signup backwards — Pedro 1, Olivia 2, Noah 3, Maya 4, Liam 5, Keiko 6, Jamal 7 — row 8 lands on Isabella Rossi, who signed up on March 1, 2024. The DESC direction is the program's counting direction; ASC would count from Alice and row 8 would be Hiro instead. The 2-fill would hand the gift to Olivia, the runner-up newest. The anniversary batch starts with: Isabella Rossi, 2024-03-01.",
  },
  {
    id: "cs-1256",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "The tenth-biggest ticket",
    brief:
      "From: Month-end close. Re: the audit sample.\n\nThe audit samples every tenth order by size, starting at the tenth-biggest ticket. Rank all 103 orders by total, descending, and read row 10 — no collapsing, one numbered row per order.",
    ask: "The tenth-biggest order total and its order id.",
    template: `SELECT id, total
FROM (
  SELECT id, total, ROW_NUMBER() OVER (ORDER BY total {1}) AS rn
  FROM {2}
)
WHERE rn = {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the size direction",
        why: "The sample counts from the biggest ticket down, so the rank orders totals descending. ASC would number from the cheapest order and the tenth row would be a budget line.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ticket table",
        why: "Order totals live on orders. order_items carries line-level quantities and unit prices — ranking that would sample line items, not tickets.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the sample row",
        why: "The audit's stride starts at the tenth-biggest. A 25-fill would sample the 507.24 ticket instead — a different, smaller line.",
      },
    ],
    distractors: ["ASC", "order_items", "25"],
    walkthrough:
      "ROW_NUMBER over 103 descending totals numbers every ticket without merging a single one, and row 10 lands on order 14 at 705.23 — the audit sample's opening line. ASC would number from the 25.47 floor ticket and the tenth row would be a different order entirely. The table must be orders: ranking order_items would count line items and sample fragments of tickets. And the 25-fill would jump the stride to the 507.24 line. The sample opens with: order 14, 705.23.",
  },
  {
    id: "cs-1257",
    tier: "easy",
    topic: "t5",
    universe: "month-close",
    title: "The status leaderboard",
    brief:
      "From: Billing lead. Re: the ops board, ranked.\n\nThe four statuses already have their census — now rank them. Count each status, rank the counts with a window so no row collapses, and read the board busiest-first.",
    ask: "The four order statuses ranked by order count.",
    template: `SELECT status, n, RANK() OVER (ORDER BY n {1}) AS rk
FROM (
  SELECT status, {2}(*) AS n
  FROM orders
  GROUP BY {3}
);`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "The board leads with the busiest status, so the rank orders counts descending. ASC would rank cancelled first and flip the wall.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census tally",
        why: "The rank rides on a headcount, so the stage counts rows with COUNT. SUM would try to add up statuses — text — and the stage would fail.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the census key",
        why: "The census is one line per status, so the stage groups by status. Grouping by total would census individual price points and the board would explode to a hundred lines.",
      },
    ],
    distractors: ["ASC", "SUM", "total"],
    walkthrough:
      "The stage counts the four statuses — 52 delivered, 30 shipped, 14 pending, 7 cancelled — and the window ranks them without collapsing: delivered holds rank 1, shipped 2, pending 3, cancelled 4. DESC is the wall's direction; ASC would make cancelled the headline. SUM cannot add status labels — the tally must be COUNT. And the census key must be status itself: grouping by total would census every distinct ticket price and the four-line board would drown. The ranked wall: delivered first at 52.",
  },
  {
    id: "cs-1258",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The four-figure club, ranked",
    brief:
      "From: Growth lead. Re: the big-spend tier.\n\nThe tier report ranks only the members who cleared four figures of lifetime spend. Stage the spend, keep the lines above 1000, and rank what survives — the tier list, with its ranks starting at 1.",
    ask: "The members above 1000 lifetime spend, ranked.",
    template: `SELECT name, spend, RANK() OVER (ORDER BY spend {1}) AS rk
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE spend {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the tier direction",
        why: "The tier list leads with the biggest spender, so the rank orders spend descending. ASC would rank the just-cleared members first.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the tier floor direction",
        why: "The tier is strictly above the four-figure line, so the test is >. Flipping to < would rank the members below the line instead.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the four-figure line",
        why: "The line sits at 1000 — eight members clear it. A 3000 line would shrink the tier to five and drop Keiko's 1098.60 off the list.",
      },
    ],
    distractors: ["ASC", "<", "3000"],
    walkthrough:
      "Eight members clear the four-figure line, and the window ranks exactly those: Alice 7262.35 at 1, Emma 6640.56 at 2, down to Keiko 1098.60 at 8 — the window only ranks what survived the WHERE, so the tier's ranks start fresh at 1. ASC would lead the list with Keiko and bury Alice. The < flip would rank the eight below the line instead — the anti-tier. And the 3000 line would cut the club to five, erasing Farid and Keiko from a tier they earned. The tier list: eight members, Alice on top.",
  },
  {
    id: "cs-1259",
    tier: "easy",
    topic: "t5",
    universe: "supplier",
    title: "The quality rank",
    brief:
      "From: Supplier audit. Re: the vendor scorecard.\n\nThe scorecard ranks the bench by rating, best first, and the audit reads the top of it. Rank the suppliers with a window so every row keeps its name, and cut to the top three.",
    ask: "The top three suppliers by rating, ranked.",
    template: `SELECT name, rating, RANK() OVER (ORDER BY rating {1}) AS rk
FROM suppliers
WHERE rating {2} {3}
LIMIT 3;`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the scorecard direction",
        why: "Best rating takes rank 1, so the order is descending. ASC would rank Pacific's 3.9 first and crown the weakest bench member.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the score gate direction",
        why: "The gate keeps suppliers above the score floor, so the test is >. Flipping to < would rank the weakest scorers instead.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the score floor",
        why: "The floor sits at 4 — four suppliers clear it, which is more than the cut needs. A floor of 4.7 would leave only Alpine and empty the podium's lower steps.",
      },
    ],
    distractors: ["ASC", "<", "4.7"],
    walkthrough:
      "The window ranks the bench without collapsing it, and the cut reads: Alpine Audio GmbH 4.8 at rank 1, Nordic Gadgets AB 4.6 at 2, Midwest Hardware Co 4.4 at 3. DESC is the scorecard's spine — ASC would hand rank 1 to Pacific Textiles' 3.9, the weakest rating on the bench. The gate stays open at 4, well under the podium; the 4.7 fill would leave only Alpine standing. The scorecard's top three: 4.8, 4.6, 4.4.",
  },
  {
    id: "cs-1260",
    tier: "hard",
    topic: "t5",
    universe: "supplier",
    title: "The tie policy compare",
    brief:
      "From: Supplier audit. Re: the rank-policy memo.\n\nFour suppliers tie at three products, and the memo needs both rank policies side by side: RANK, which skips after a tie, and DENSE_RANK, which doesn't. Return both columns for the whole bench and let the difference speak.",
    ask: "Product-count ranks under both tie policies, busiest first.",
    template: `SELECT name, n,
  {1}() OVER (ORDER BY n {2}) AS rk,
  DENSE_RANK() OVER (ORDER BY n DESC) AS drk
FROM (
  SELECT s.name, {3}(p.id) AS n
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
);`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the plain rank",
        why: "The compare pairs the plain rank against the dense one, so the slotted window is RANK. ROW_NUMBER would break the tie with arbitrary numbers and the skip pattern would vanish.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the bench direction",
        why: "The memo reads the tie block first, so the order is descending. ASC would open on the two-product suppliers and bury the 5-versus-2 jump.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf tally",
        why: "The tie rides on a product headcount, so the stage counts with COUNT. SUM would add product ids together and the tie block would dissolve.",
      },
    ],
    distractors: ["ROW_NUMBER", "ASC", "SUM"],
    walkthrough:
      "Six rows, both policies live: the four three-product suppliers share rank 1 under both policies — but row five is where they split. RANK remembers the tie and skips: Alpine and Andes both take 5. DENSE_RANK never skips: they take 2. That 5-versus-2 gap is the entire memo. ROW_NUMBER in the slotted column would print 1, 2, 3, 4, 5, 6 and erase the skip pattern the memo is about. ASC would start the table at the two-product suppliers where the two policies agree, hiding the lesson. The memo's line: same at the tie, 5 versus 2 after it.",
  },
  {
    id: "cs-1261",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The runner-up pair",
    brief:
      "From: Growth lead. Re: the podium's next line.\n\nThe podium is settled; the board wants the next line — members ranked 2 through 3 by lifetime spend. Number the roster with a window and slice the band.",
    ask: "The members ranked 2 and 3 by lifetime spend.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn {1} {2}
AND rn {3} {4};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the band floor",
        why: "The band opens below the crown at rank 2, so the floor test is >=. Flipping to < would slide the band up into the crown itself.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the band's lower edge",
        why: "The band starts at rank 2 — the first runner-up. An edge of 3 would drop Emma and leave Grace alone on the line.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the band ceiling",
        why: "The band closes at rank 3, so the ceiling test is <=. Flipping to >= would run the band off the bottom of the roster.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the band's upper edge",
        why: "The band ends at rank 3 — the second runner-up. An edge of 4 would pull Maya's 3644.56 onto a two-seat line.",
      },
    ],
    distractors: [">=", "<=", "2", "3", "<", ">"],
    walkthrough:
      "ROW_NUMBER lines up all sixteen members — no ties in lifetime spend, so the numbering is strict — and the band rn >= 2 AND rn <= 3 returns exactly two rows: Emma Wilson 6640.56 and Grace Kim 4574.23. Widening either edge shifts the line: a 4 ceiling pulls Maya in, a 3 floor drops Emma. The flipped < on the floor would grab rank 1 — the crown the board already settled — and < on the ceiling would empty the band. The podium's next line: Emma, then Grace.",
  },
  {
    id: "cs-1262",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The bottom four",
    brief:
      "From: Growth lead. Re: the win-back list.\n\nThe win-back list is the four lightest spenders — ranks 13 through 16 on the lifetime board. Number the roster descending and keep the tail, with the cut proving the list holds exactly four.",
    ask: "The four lowest-ranked members by lifetime spend.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn {2} {3}
LIMIT {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "The tail of the descending board is the lightest spend, so the numbering runs DESC. ASC would put the tail at ranks 1–4 and the >= 13 test would return nothing.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the tail gate",
        why: "The win-back list starts at rank 13, so the gate is >=. Flipping to < would keep the head of the board — the exact opposite list.",
      },
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the tail's edge",
        why: "The tail opens at rank 13 — Liam's 705.39 line. An edge of 14 would drop Liam and misfile the list's first name.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the list-length cut",
        why: "The cut of 4 proves the list holds exactly the tail: ranks 13–16. A cut of 2 would stop at Jamal and hide the bottom pair.",
      },
    ],
    distractors: ["ASC", "<", "2"],
    walkthrough:
      "The descending board numbers Alice 1 through Olivia 16, and the gate rn >= 13 with a cut of 4 returns the tail: Liam O'Brien 705.39, Jamal Wright 645.60, Dmitri Volkov 599.26, Olivia Brown 444.80. ASC would flip the board so ranks 13–16 land on the biggest spenders — the wrong four entirely. The < flip would return the head of the board, and the 14 edge would drop Liam, the list's anchor. The cut of 4 certifies the tail's length. The win-back list: Liam, Jamal, Dmitri, Olivia.",
  },
  {
    id: "cs-1263",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The region order race",
    brief:
      "From: Growth lead. Re: the market map.\n\nThe market map ranks the four regions by order volume. Stage the per-region census, rank it with a window so the map keeps every bar, and keep the bar for regions that actually sold.",
    ask: "The four regions ranked by order count.",
    template: `SELECT region, n, RANK() OVER (ORDER BY n {1}) AS rk
FROM (
  SELECT c.region, COUNT(*) AS n
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
)
WHERE n {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the race direction",
        why: "The map leads with the busiest region, so the rank orders counts descending. ASC would rank LATAM's two orders first and invert the race.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the sold bar direction",
        why: "The map keeps regions that actually sold, so the bar is > 0. Flipping to < 0 would demand negative counts and empty the map.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the sold bar",
        why: "A bar of 0 admits every region in the book — all four sold. A bar of 20 would drop LATAM's two-order line and shrink the race.",
      },
    ],
    distractors: ["ASC", "<", "20"],
    walkthrough:
      "The stage censuses the four regions — EU 45, APAC 37, US 19, LATAM 2 — and the window ranks the bars without collapsing the map: EU takes rank 1, APAC 2, US 3, LATAM 4. DESC is the race direction; ASC would crown LATAM's quiet two orders. The sold bar stays at 0 so every region with a real order appears — the 20 bar would cut LATAM and fake a three-market map. The market map reads: EU first at 45.",
  },
  {
    id: "cs-1264",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The repeat-buyer rank",
    brief:
      "From: Growth lead. Re: the loyalty tier build.\n\nLoyalty ranks by order count, and the count column has real ties — several members share a purchase pace. Rank with RANK so tied paces share a rank and the skip after a tie stays honest.",
    ask: "The members ranked by order count, ties sharing a rank.",
    template: `SELECT name, n_orders, RANK() OVER (ORDER BY n_orders {1}) AS rk
FROM (
  SELECT c.name, COUNT(o.id) AS n_orders
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE n_orders {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the loyalty direction",
        why: "The tier leads with the busiest buyers, so the rank orders counts descending. ASC would rank the one-order members first.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the pace gate direction",
        why: "The tier keeps repeat buyers above the pace floor, so the test is >. Flipping to < would rank the one-and-done members instead.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the repeat floor",
        why: "The floor of 2 keeps everyone with a repeat purchase — one-order members sit below it. A floor of 4 would shrink the tier to the six members with four or more orders.",
      },
    ],
    distractors: ["ASC", "<", "4"],
    walkthrough:
      "Order counts carry real ties — four members sit at 4 orders, two at 3, three at 2 — and RANK honors them: the tied paces share a rank and the next distinct pace skips. Above the floor of 2, the board reads Alice 24 at rank 1, Emma 17 at 2, Grace 14 at 3, Maya 13 at 4, then the tied blocks below. DESC is the tier's direction; ASC would build it from the one-order members the floor excludes anyway. The < flip would rank the floor's losers, and a 4 floor would erase the very ties the rank exists to honor. The loyalty board: Alice first at 24 orders.",
  },
  {
    id: "cs-1265",
    tier: "hard",
    topic: "t5",
    universe: "month-close",
    title: "The completed-work crown",
    brief:
      "From: Billing lead. Re: the revenue crown, honestly.\n\nThe whole-book crown flatters orders still in flight. Rank only completed work — delivered orders — by spend, and read the crown line. The reshuffle is the point: the biggest book is not the biggest finished book.",
    ask: "The delivered-only spend leaderboard's top line.",
    template: `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE o.status = {1}
  GROUP BY c.id
)
SELECT name, spend, RANK() OVER (ORDER BY spend {2}) AS rk
FROM s
LIMIT {3};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed filter",
        why: "The crown counts finished journeys, so the stage keeps delivered orders. The 'shipped' fill would rank work still on the road.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown direction",
        why: "The crown sits at rank 1 of the descending order. ASC would crown the lightest completed spender.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the crown cut",
        why: "The read wants the crown line only, so the cut is 1. A cut of 3 would return the podium and soften the crown call.",
      },
    ],
    distractors: ["'shipped'", "ASC", "3"],
    walkthrough:
      "Filtered to delivered work, the leaderboard reshuffles: Grace Kim takes the completed-work crown at 3054.89, ahead of Alice Chen's 2961.81 — a full 4208 euros of Alice's book is still in flight, and the honest crown moves to Grace. The 'shipped' fill would rank the on-the-road book instead; ASC would crown the lightest finisher. The cut of 1 keeps the read to the single crown line. The completed-work crown: Grace Kim, 3054.89.",
  },
  {
    id: "cs-1266",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The region champions",
    brief:
      "From: Growth lead. Re: the market-map toppers.\n\nThe market map pins one champion per region — four regions, four names. The window that does it partitions by region so each region runs its own race. Number each region's members by spend and keep only the champions.",
    ask: "The top spender in each region.",
    template: `SELECT region, name, spend
FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.{3} ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn = {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the champion direction",
        why: "Each region's champion is its biggest spender, so the per-region race orders spend descending. ASC would crown each region's lightest spender.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion row",
        why: "The champion sits at row 1 of their region's race. A 2-fill would return the four runners-up instead.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the race partition",
        why: "The map races regions against themselves, so the partition key is region. Partitioning by city would stage sixteen one-member races and crown everyone.",
      },
    ],
    distractors: ["ASC", "2", "city"],
    walkthrough:
      "PARTITION BY region restarts the race inside each region: EU's eight members race alone, LATAM's one member races alone, and row 1 of each partition is that region's champion — Alice 7262.35 for EU, Emma 6640.56 for US, Grace 4574.23 for APAC, Bruno 852.44 for LATAM. Four rows out, one per region. ASC would crown the lightest spender in each region — a map of who to win back, not who leads. And the 2-fill would return the runners-up, a different map entirely. The champions: Alice, Emma, Grace, Bruno.",
  },
  {
    id: "cs-1267",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The regional podium count",
    brief:
      "From: Growth lead. Re: the podium math.\n\nEvery region gets a two-seat podium, but LATAM fields only one member — so how many podium seats are actually filled? Rank inside each region's partition, keep the seats at rank 2 or better, and count them.",
    ask: "How many podium seats (top-2 per region) are filled?",
    template: `SELECT COUNT(*) AS podium
FROM (
  SELECT c.id, RANK() OVER (PARTITION BY c.{3} ORDER BY SUM(o.total) DESC) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rk {1} {2};`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the podium test",
        why: "A podium seat is rank 1 or 2, so the test is <= 2. Flipping to > would count the non-podium members instead.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the podium depth",
        why: "The podium is two seats deep per region. A depth of 1 would count only the champions — four seats, not seven.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the seat partition",
        why: "The podium is regional, so the partition key is region. Partitioning by city would seat every member — sixteen one-member races, sixteen medals.",
      },
    ],
    distractors: [">", "1", "3"],
    walkthrough:
      "The partition restarts the ranking per region, and the count of seats at rank 2 or better lands on 7: EU and APAC each fill two seats, US fills two, and LATAM — with a single member — fills one. The depth matters: a 1-fill would count only the four champions, and a 3-fill would widen the podium to nine seats, spilling into members no medal ceremony would seat. The flipped > fill would count the nine members outside the podium. The podium math: 7 seats filled.",
  },
  {
    id: "cs-1268",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "The EU ladder",
    brief:
      "From: Growth lead. Re: the home-market ladder.\n\nThe EU chapter is the deepest — eight members — and the ladder ranks them inside their own partition, unaffected by the other regions' books. Rank by spend within the region partitions and read the EU rungs.",
    ask: "The EU members ranked by spend within their region.",
    template: `SELECT name, region, spend, rk
FROM (
  SELECT c.name, c.region, ROUND(SUM(o.total), 2) AS spend,
         RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.region IN ({2})
  GROUP BY c.id
)
WHERE spend {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "The ladder's top rung is the biggest spender, so the partition race orders spend descending. ASC would put Olivia's 444.80 on rung 1.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region gate",
        why: "The read is the home-market chapter, so the gate keeps EU members. An 'APAC' fill would rank the five-member APAC chapter instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the spend gate direction",
        why: "The gate keeps members above the spend floor, so the test is >. Flipping to < 0 would demand negative spend and empty the ladder.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open spend floor",
        why: "A floor of 0 keeps every EU member on the ladder — all eight rungs. A floor of 700 would drop Olivia and renumber the rungs.",
      },
    ],
    distractors: ["ASC", "'APAC'", "<", "700"],
    walkthrough:
      "PARTITION BY region means the EU ladder is ranked among EU members only — the window restarts at each region, so the rungs read Alice 1, Chloe 2, Pedro 3, Isabella 4, Noah 5, Liam 6, Dmitri 7, Olivia 8, untouched by Emma's US book. DESC keeps the biggest spender on rung 1; ASC would invert the chapter. The region gate must be EU — the APAC fill would rank a five-member ladder whose top rung is Grace. And the floor stays open: the 700 fill would snap Olivia off rung 8 and renumber the chapter. The home-market ladder: Alice on top, eight rungs.",
  },
  {
    id: "cs-1269",
    tier: "easy",
    topic: "t6",
    universe: "catalog",
    title: "The category price toppers",
    brief:
      "From: Catalog ops. Re: the shelf champions.\n\nEvery category has a price champion — the dearest tag on its shelf. Partition the catalog by category, rank each shelf's prices, and keep only the champions' row per shelf.",
    ask: "The most expensive product in each category.",
    template: `SELECT category, name, price
FROM (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY {3} ORDER BY price {1}) AS rn
  FROM products
)
WHERE rn = {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the shelf direction",
        why: "The champion is the dearest tag, so each shelf's race orders price descending. ASC would crown each category's cheapest product.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion row",
        why: "The champion sits at row 1 of their shelf's race. A 2-fill would return the seven second-priciest products instead.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf partition",
        why: "The catalog races shelves against themselves, so the partition key is category. Partitioning by supplier_id would stage six supplier races instead of seven shelf races.",
      },
    ],
    distractors: ["ASC", "2", "supplier_id"],
    walkthrough:
      "PARTITION BY category gives each shelf its own race, and row 1 of each reads: Wearables' Smart Watch S at 199.99, Audio's Noise-Canceling Headset at 149.99, Video's 4K Webcam Pro at 129, Electronics' Mechanical Keyboard K1 at 89.99, Apparel's Cycling Jersey Pro at 65, Accessories' Laptop Stand Aluminum at 42.50, Fitness' Yoga Mat Eco at 32 — seven shelves, seven champions. ASC would crown the budget tag on every shelf. The 2-fill would return the runners-up, a different catalog page. The shelf champions: seven, led by the 199.99 watch.",
  },
  {
    id: "cs-1270",
    tier: "hard",
    topic: "t6",
    universe: "fraud",
    title: "The best-day census",
    brief:
      "From: Fraud spot-check. Re: the peak-day profile.\n\nEvery member has exactly one best spending day — the day their book peaked. Stage the per-member per-day revenue, rank days inside each member's partition, and count the peak-day lines.",
    ask: "Each member's peak spending day with its revenue.",
    template: `SELECT name, day, rev
FROM (
  SELECT c.name, DATE(o.created_at) AS day, SUM(o.total) AS rev,
         ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id, {3}
)
WHERE rn = {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the peak direction",
        why: "The peak day is the biggest revenue day, so each member's race orders revenue descending. ASC would profile the quietest day instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the peak rank",
        why: "The peak sits at row 1 of the member's day race. A 3-fill would profile the third-best days — a different, longer list.",
      },
      {
        answer: "day",
        kind: "keyword",
        label: "the census grain",
        why: "The census buckets each member's orders into calendar days, so the stage groups by day. Grouping by the raw timestamp would stage per-order races and profile single purchases.",
      },
    ],
    distractors: ["ASC", "3", "created_at"],
    walkthrough:
      "The staged day-census gives every member their own race — PARTITION BY customer — and row 1 of each is the peak: sixteen members, sixteen peak-day lines, one apiece. DESC is what makes row 1 the peak; ASC would crown each member's quietest day and profile absence instead of spending power. The 2-fill would return the silver-medal days, a longer and less useful list. And the floor stays open — a 500 line would snap the quieter peaks out of the profile. The peak-day profile: sixteen lines, one per member.",
  },
  {
    id: "cs-1271",
    tier: "medium",
    topic: "t6",
    universe: "supplier",
    title: "The regional shelf rank",
    brief:
      "From: Supplier audit. Re: the regional bench board.\n\nShelf counts race twice: globally they tie four ways, but inside each supplier's region the races split. Partition the bench by region, rank the shelf counts, and keep the suppliers still carrying at least two products.",
    ask: "Suppliers ranked by product count within their region.",
    template: `SELECT name, region, n, rk
FROM (
  SELECT s.name, s.region, COUNT(p.id) AS n,
         RANK() OVER (PARTITION BY s.region ORDER BY COUNT(p.id) {1}) AS rk
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
)
WHERE n {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "Each region's widest shelf takes rank 1, so the partition races order counts descending. ASC would rank the two-product suppliers first.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the shelf gate",
        why: "The board keeps suppliers still carrying stock, and every bench member carries at least two — the gate is >= 2. Flipping to < would demand under-shelf suppliers and empty the board.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the shelf floor",
        why: "The floor of 2 keeps the whole bench — the lightest shelves carry exactly two. A floor of 3 would leave only the four-way tie block.",
      },
    ],
    distractors: ["ASC", "<", "3"],
    walkthrough:
      "Globally the shelf counts tie 1, 1, 1, 1 — but the partition splits the story: in EU, Nordic's three products take rank 1 over Alpine's two; in APAC, Shenzhen and Pacific tie at rank 1; US's Midwest and LATAM's Andes each top a one-member race. The board keeps the whole bench with the >= 2 gate and shows six rows where every rank is 1 or 2. ASC would invert each regional race; the 3-floor would erase Alpine and Andes, the members whose two-product shelves make the regional ranks real. The regional board: six rows, ties only inside APAC.",
  },
  {
    id: "cs-1272",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "The status month champions",
    brief:
      "From: Growth lead. Re: the per-lane calendars.\n\nEach order status has its own busiest month — four lanes, four calendars. Partition the monthly census by status, rank each lane's months by volume, and read the champion month per lane.",
    ask: "The busiest month for each order status.",
    template: `SELECT status, mo, n
FROM (
  SELECT status, strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY COUNT(*) {2}) AS rn
  FROM orders
  GROUP BY status, mo
)
WHERE rn = {3};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the lane partition",
        why: "Each status runs its own month race, so the partition key is status. Partitioning by mo would give every month its own one-row race — fourteen champions of nothing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the champion direction",
        why: "The champion month is the busiest, so each lane's race orders counts descending. ASC would crown each lane's quietest month.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion row",
        why: "The champion sits at row 1 of the lane's race. A 2-fill would return each lane's runner-up month instead.",
      },
    ],
    distractors: ["mo", "ASC", "2"],
    walkthrough:
      "PARTITION BY status gives each lane its own calendar race, and the champions read: delivered peaked in 2024-09 with 7 orders, shipped in 2024-05 with 4, pending in 2024-10 with 2, cancelled in 2024-11 with 2. Four lanes, four different months — the calendars never align. Partitioning by mo instead would stage fourteen one-row races and crown every month its own champion, a map of nothing. ASC would crown the quietest month per lane; the 2-fill would return the runner-up calendars. The lane champions: September for delivered, May for shipped.",
  },
  {
    id: "cs-1273",
    tier: "hard",
    topic: "t6",
    universe: "catalog",
    title: "The second shelf tag",
    brief:
      "From: Catalog ops. Re: the mid-tier page.\n\nThe mid-tier page features each category's second-priciest tag — the champion's runner-up. Partition by category, number the price race, keep row 2, and let a price floor keep the page premium.",
    ask: "The second-most expensive product in each category, above the floor.",
    template: `SELECT category, name, price
FROM (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn
  FROM products
)
WHERE rn {1} {2}
AND price {3} {4};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the runner-up test",
        why: "The page features exactly the second tag, so the test is rn = 2. Flipping to < would return the champions — the page above this one.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the runner-up row",
        why: "The mid-tier sits at row 2 of each shelf's price race. A 1-fill would return the champions instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the premium floor direction",
        why: "The page keeps premium tags above the floor, so the test is >. Flipping to < 0 would demand negative prices and empty the page.",
      },
      {
        answer: "30",
        kind: "number",
        noVerify: true,
        label: "the premium floor",
        why: "The floor sits at 30 — the runner-up tags from 34.50 up survive. A 40 floor would drop the 34.50 mouse and the 39.99 ring light from the page.",
      },
    ],
    distractors: ["<", "1", "40"],
    walkthrough:
      "Row 2 of each category's price race is the mid-tier line, and above the 30 floor the page carries four tags: Electronics' USB-C Hub at 49, Audio's Studio Desktop Mic at 119, Wearables' Fitness Band X2 at 79, and Video's Ring Light at 39.99 — Accessories' 24.99 desk mat and Apparel's 18.5 socks are runner-ups too, but the floor cuts them, and Fitness' one-product shelf has no runner-up at all. The = 2 test is the page's definition; the < flip would return the champions' row. The 40 floor would silently drop two more tags. The mid-tier page: four runner-up tags over 30.",
  },
  {
    id: "cs-1274",
    tier: "hard",
    topic: "t6",
    universe: "catalog",
    title: "The premium shelf slots",
    brief:
      "From: Catalog ops. Re: the endcap plan.\n\nThe endcaps take the top two tags per category — but only from shelves that earned them above the premium line. Partition by category, keep each shelf's first two rows among premium-priced stock, and count the slots.",
    ask: "How many top-2-per-category slots exist above the premium floor?",
    template: `SELECT COUNT(*) AS endcap_slots
FROM (
  SELECT category, price, ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY price DESC) AS rn
  FROM products
  WHERE price {2} {3}
)
WHERE rn <= {4};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the endcap partition",
        why: "Endcaps are per category, so the partition key is category. Partitioning by name would give every product its own race and stock sixteen endcaps.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the premium gate direction",
        why: "The plan keeps premium stock above the line, so the test is >. Flipping to < 30 would fill endcaps with the budget shelf.",
      },
      {
        answer: "40",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "The premium line sits at 40 — ten tags clear it. A 50 line would starve the plan to eight candidates and thin the endcaps.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the endcap depth",
        why: "Each category gets two endcap slots. A depth of 1 would count only the champions — seven slots, not the full plan.",
      },
    ],
    distractors: ["name", "<", "50", "1"],
    walkthrough:
      "Above the 40 line, ten tags compete, and the partitioned top-2 per category fills 8 endcap slots — Video, Accessories, Wearables and Apparel field only one premium tag each, and Fitness none, so their second seats stay empty. The category fill keeps the endcaps per shelf: the name fill would stage sixteen one-product races and stock sixteen endcaps — a plan with no shelf logic. The 50 line would thin the field further, and the 1-depth would count champions only. The endcap plan: 8 slots.",
  },
  {
    id: "cs-1275",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The home-market crown",
    brief:
      "From: Growth lead. Re: the board's home market.\n\nThe board's spotlight slide features the EU chapter's single biggest book. Partition the roster by region, run each chapter's race, and keep the EU champion's line only.",
    ask: "The EU region's top spender by lifetime spend.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, c.region, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn = 1
AND region = {2}
AND spend {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the chapter direction",
        why: "The chapter crown is the biggest book, so the region race orders spend descending. ASC would crown the EU member to win back.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the spotlight region",
        why: "The slide features the home-market chapter, so the gate is EU. The 'APAC' fill would feature Grace's 4574.23 instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the spend gate direction",
        why: "The gate keeps books above the floor, so the test is >. Flipping to < 0 would demand negative spend and empty the slide.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open spend floor",
        why: "A floor of 0 admits every EU book. A floor of 8000 would exceed even Alice's book and empty the slide.",
      },
    ],
    distractors: ["ASC", "'APAC'", "8000"],
    walkthrough:
      "The partition runs a race per region, and the EU gate keeps the home chapter's race alone: Alice Chen's 7262.35 takes the crown — Chloe's 2667.93 is the best the rest of the chapter can offer. ASC would crown the chapter's lightest book, the win-back target rather than the champion. The APAC fill would feature Grace instead, a different chapter's story. And the floor stays honestly open — an 8000 fill would exceed even Alice's book and hand the slide an empty podium. The home-market crown: Alice Chen, 7262.35.",
  },
  {
    id: "cs-1276",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "The shelf champions, gated",
    brief:
      "From: Catalog ops. Re: the premium champions page.\n\nSame shelf champions as the catalog page — one per category — but the premium page only features champions above 50 euros, which thins the page honestly. Rank inside each category's partition and keep the champions that clear the gate.",
    ask: "The category price champions above 50 euros.",
    template: `SELECT category, name, price
FROM (
  SELECT category, name, price,
         RANK() OVER (PARTITION BY category ORDER BY price {1}) AS rk
  FROM products
)
WHERE rk = {2}
AND price {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the champion direction",
        why: "The champion is the dearest tag on the shelf, so the race orders price descending. ASC would crown each category's cheapest product.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion rank",
        why: "The champion takes rank 1 of their shelf's race. A 3-fill would return the third-priciest tags instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the premium gate direction",
        why: "The page keeps champions above the gate, so the test is >. Flipping to < 50 would feature the budget champions instead.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the premium gate",
        why: "The gate sits at 50 — five champions clear it. A 100 gate would leave three and starve the page.",
      },
    ],
    distractors: ["ASC", "3", "<", "100"],
    walkthrough:
      "Seven categories, seven champions — but the 50-euro gate thins the page to the five that clear it: Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Mechanical Keyboard K1 89.99, Cycling Jersey Pro 65. Accessories' 42.50 laptop stand and Fitness' 32 yoga mat are champions too — just not premium ones. ASC would crown budget tags; the 3-fill would feature third-place products; the 100 gate would cut the page to three. The premium champions page: five tags, led by the 199.99 watch.",
  },
  {
    id: "cs-1277",
    tier: "hard",
    topic: "t6",
    universe: "month-close",
    title: "The one-member pot",
    brief:
      "From: Month-end close. Re: the self-carrying region.\n\nA region whose entire book is one member has a curious property: the region pot equals that member's spend. Stage member spends with the partitioned region pot beside them, and find the line where the two figures meet.",
    ask: "The member whose spend equals their whole region's pot.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         ROUND(SUM(SUM(o.total)) OVER (PARTITION BY {1}), 2) AS region_pot
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE region_pot {2} {3}
AND spend = region_pot;`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the pot partition",
        why: "The pot is the region's total book, so the window partitions by region. Partitioning by city would make every member their own one-member pot and the read would lose its rarity.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the pot gate direction",
        why: "The gate keeps real pots above the floor, so the test is >. Flipping to < 0 would demand negative pots and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open pot floor",
        why: "A floor of 0 admits every region pot — all four are real money. A floor of 10000 would keep only EU and APAC and hide the LATAM answer.",
      },
    ],
    distractors: ["city", "10000", "<"],
    walkthrough:
      "The window sums each region's book beside every member line, and the equality spend = region_pot finds the one-member region: Bruno Silva's 852.44 is the entire LATAM pot — his personal book IS the regional total. EU's pot is 15089.23 across eight books, APAC's 11605.45 across five, US's 7286.16 across two — no single member carries those. The city fill would give all sixteen members a self-carrying pot and destroy the rarity the read is about. The 10000 floor would exclude LATAM's pot and hide the answer. The self-carrying region: LATAM, carried by Bruno Silva.",
  },
  {
    id: "cs-1278",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "The biggest open invoice",
    brief:
      "From: Month-end close. Re: the collections headline.\n\nCollections chases the biggest open balance first. Partition the invoice ledger by status so each lane ranks its own amounts, and read the open lane's row 1.",
    ask: "The largest invoice with status open.",
    template: `SELECT number, amount_cents
FROM (
  SELECT number, amount_cents, status,
         ROW_NUMBER() OVER (PARTITION BY status ORDER BY amount_cents {1}) AS rn
  FROM invoices
)
WHERE rn = {2}
AND status = {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the chase direction",
        why: "The chase starts at the biggest balance, so each status lane orders amounts descending. ASC would headline the smallest open invoice.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the headline row",
        why: "The headline is row 1 of the open lane. A 2-fill would feature the second-biggest open balance instead.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the chase lane",
        why: "Collections chases open balances, so the lane gate is open. The 'paid' fill would headline a settled invoice nobody needs to chase.",
      },
    ],
    distractors: ["ASC", "2", "'paid'"],
    walkthrough:
      "PARTITION BY status gives each lane its own amount race, and the open lane's row 1 is INV-2025-024 at 493700 cents — the biggest balance the collectors can chase. ASC would headline the 87300-cent note instead, the lane's smallest. The 2-fill would feature the runner-up balance, and the paid-lane fill would chase money already settled. The collections headline: INV-2025-024, 493700 cents.",
  },
  {
    id: "cs-1279",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The US runner-up",
    brief:
      "From: Growth lead. Re: the second market line.\n\nEmma owns the US market outright, but the second line matters for the expansion deck. Partition by region, run each race, and keep row 2 of the US chapter.",
    ask: "The US region's second-biggest spender.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, c.region, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn = {1}
AND region {2} {3};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the runner-up row",
        why: "The second market line sits at row 2 of the region race. A 1-fill would return the four champions instead.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the market gate",
        why: "The deck features the US chapter, so the gate is region = 'US'. Flipping to != would return every other region's runner-up.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the market gate value",
        why: "The expansion deck's second line is the US story. An 'EU' fill would return Chloe's 2667.93 — a different chapter.",
      },
    ],
    distractors: ["1", "'EU'", "!="],
    walkthrough:
      "The partition race gives US its own two-member ladder — Emma 6640.56 at 1, Jamal Wright 645.60 at 2 — and row 2 with the US gate returns exactly the expansion deck's line: Jamal Wright at 645.60. The 1-fill would return the four region champions, a different slide. The EU fill would hand the deck Chloe, and the != flip would return the runner-up of every other region at once. The US second line: Jamal Wright, 645.60.",
  },
  {
    id: "cs-1280",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "The lane runner-up calendars",
    brief:
      "From: Growth lead. Re: the surge planning.\n\nThe champions' months are known — planning wants the runner-ups. Inside each status's partition, number the months by volume and read row 2 of every lane, keeping only real surges.",
    ask: "The second-busiest month for each order status.",
    template: `SELECT status, mo, n
FROM (
  SELECT status, strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY COUNT(*) {2}) AS rn
  FROM orders
  GROUP BY status, mo
)
WHERE rn = {3}
AND n {4} {5};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the lane partition",
        why: "Each status runs its own month race, so the partition key is status. Partitioning by mo would stage one-row races with no runner-ups at all.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the surge direction",
        why: "The runner-up is the second-busiest month, so each lane orders counts descending. ASC would return the second-quietest month per lane.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the runner-up row",
        why: "The planning read wants row 2 of each lane's race. A 1-fill would return the champion months planning already has.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the surge gate direction",
        why: "The plan keeps real surges above the floor, so the test is >. Flipping to < 0 would demand negative counts and empty the plan.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the surge floor",
        why: "A floor of 0 admits every runner-up month. A floor of 3 would drop the lanes whose runner-up carried only two orders.",
      },
    ],
    distractors: ["mo", "ASC", "<", "3"],
    walkthrough:
      "PARTITION BY status stages four month races, and row 2 of each lane is the runner-up calendar the surge plan needs — the month each lane would hit again if its champion month repeated. The status fill keeps the lanes honest: the mo fill would stage fourteen one-row races where row 2 does not exist. DESC makes row 2 the second-busiest; ASC would hand planning the second-quietest months and the plan would staff the wrong weeks. The 1-fill returns the champions, and the 2-floor would drop any lane whose runner-up carried a single order. The runner-up calendars: four lanes, four second months.",
  },
  {
    id: "cs-1281",
    tier: "easy",
    topic: "t7",
    universe: "expense",
    title: "The February verdict",
    brief:
      "From: Finance review. Re: the month-over-month read.\n\nFebruary's revenue line needs its verdict: up or down against January, and by how much. LAG fetches the previous month's take so the subtraction happens on the same row. Read February's delta.",
    ask: "February 2024's revenue change against January.",
    template: `SELECT mo, rev, delta
FROM (
  SELECT mo, SUM(total) AS rev,
         ROUND(SUM(total) - {1}(SUM(total)) OVER (ORDER BY {2}), 2) AS delta
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo = {3};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the previous-month fetch",
        why: "The verdict compares against January, so the offset looks backwards with LAG. LEAD would fetch March and compare February to its own future.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the timeline order",
        why: "Previous and next mean calendar order, so the window orders by the month key. Ordering by rev would shuffle the timeline and fetch the wrong neighbor.",
      },
      {
        answer: "'2024-02'",
        kind: "keyword",
        label: "the verdict month",
        why: "The read is February's line, so the gate is mo = '2024-02'. The '2024-03' fill would deliver March's -992.56 slide instead.",
      },
    ],
    distractors: ["LEAD", "rev"],
    walkthrough:
      "LAG(rev) OVER (ORDER BY mo) parks January's 3731.97 on February's own row, and the subtraction delivers the verdict: 3609.64 − 3731.97 = −122.33 — a small slide, not a collapse. LEAD would fetch March's 2617.08 and report +992.56, February judged against its own future. And the timeline must run on the month key: ordering by rev would make LAG fetch whichever month happened to earn less, a neighbor with no calendar meaning. The February verdict: down 122.33.",
  },
  {
    id: "cs-1282",
    tier: "easy",
    topic: "t7",
    universe: "expense",
    title: "The first-month frontier",
    brief:
      "From: Finance review. Re: the series opening.\n\nEvery time series has a frontier: the first month has no previous month, and LAG answers that honestly with NULL. Pull January's line with its previous-month column and show the frontier.",
    ask: "January 2024's revenue with its previous-month column.",
    template: `SELECT mo, rev, prev_rev
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         {3}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS prev_rev
  FROM orders
  GROUP BY mo
)
WHERE mo {1} {2};`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the frontier test",
        why: "The frontier is January and everything before it — nothing — so the test is mo <= '2024-01'. Flipping to >= would run the whole series instead.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the frontier month",
        why: "The series opens at January 2024, so the frontier gate carries that bucket. A '2024-03' fill would include February and March, where the offset column has real values.",
      },
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward fetch",
        why: "The previous-month column looks backwards, so the offset is LAG. LEAD at the frontier would fetch February's 3731.97 — a future figure posing as history.",
      },
    ],
    distractors: [">=", "'2024-03'", "LEAD"],
    walkthrough:
      "LAG(rev) OVER (ORDER BY mo) walks the timeline month by month, and at the very first row there is nothing behind it — the column reads NULL, the honest frontier marker. Gated to mo <= '2024-01', the series returns exactly one row: January, 3731.97, previous NULL. The >= fill would return all fourteen months with a full column of history; the 3000 floor would keep two months and put 3731.97 under February's LAG, erasing the frontier lesson. The frontier: January's previous month is nothing, and the NULL says so.",
  },
  {
    id: "cs-1283",
    tier: "hard",
    topic: "t7",
    universe: "expense",
    title: "The biggest slide",
    brief:
      "From: Finance review. Re: the worst month.\n\nFourteen months of revenue, thirteen deltas — one of them is the cliff. Compute every month's drop against its LAG neighbor, rank the damage, and read the single worst slide.",
    ask: "The month with the largest revenue drop against its previous month.",
    template: `SELECT mo, delta AS slide
FROM (
  SELECT mo, ROUND(rev - {3}(rev) OVER (ORDER BY mo), 2) AS delta
  FROM (
    SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev
    FROM orders
    GROUP BY mo
  )
)
WHERE delta {1} {2};`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the cliff test",
        why: "The cliff is the delta at or below the deepest figure — the extreme itself, so the test is <=. Flipping to > would census every milder month instead.",
      },
      {
        answer: "-1326.87",
        kind: "number",
        label: "the cliff figure",
        why: "November's slide is the deepest at −1326.87 — the only delta that deep. A −992.56 bound would pull March's drop in and blur the cliff.",
      },
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward delta",
        why: "A slide is measured against the month before, so the offset is LAG. LEAD would measure each month against its successor — the same thirteen deltas mirrored.",
      },
    ],
    distractors: ["-992.56", ">", "LEAD"],
    walkthrough:
      "LAG(SUM(total)) walks the month timeline and each delta measures the drop from the month before: the field runs from −122.33 in February down to the cliff — November's 1648.80 against October's 2975.67, a slide of −1326.87, the worst in the book. The −992.56 fill would pick March's drop and file the wrong month as the cliff. And the cut of 1 keeps the read to the single worst line; a cut of 3 would return November, March and April and blur the verdict. The cliff: November 2024, down 1326.87.",
  },
  {
    id: "cs-1284",
    tier: "easy",
    topic: "t7",
    universe: "expense",
    title: "The follow-up month",
    brief:
      "From: Finance review. Re: the forward look.\n\nLAG looks backwards; LEAD looks ahead — same window, opposite direction. Pull February's line with the month that follows it, so the read shows where February's momentum went.",
    ask: "February 2024's revenue with the following month's figure.",
    template: `SELECT mo, rev, next_rev
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         {1}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS next_rev
  FROM orders
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "LEAD",
        kind: "keyword",
        label: "the forward fetch",
        why: "The read wants the following month, so the offset points forward with LEAD. LAG would fetch January and look the wrong way.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the read month test",
        why: "The read is one month's forward look, so the gate is mo = '2024-02'. Flipping to < would show January, whose forward look is February itself.",
      },
      {
        answer: "'2024-02'",
        kind: "keyword",
        label: "the read month",
        why: "February's momentum is the story, so the gate carries that bucket. The '2024-03' fill would look forward from March instead.",
      },
    ],
    distractors: ["LAG", "<", "'2024-03'"],
    walkthrough:
      "LEAD(rev) OVER (ORDER BY mo) parks March's 2617.08 on February's row — the month February's 3609.64 handed off to, a 992.56 drop forward. LAG would fetch January's 3731.97 and tell the backward story instead. The = gate keeps the read to a single row; the < fill would return January, whose LEAD column carries February's figure — the same number pointing the wrong direction. The forward look: February 3609.64, next stop March 2617.08.",
  },
  {
    id: "cs-1285",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The longest silence",
    brief:
      "From: Fraud spot-check. Re: the dormant stretch.\n\nAlice's account never went dark, but some gaps between her orders ran long. LAG over her own timeline — partitioned to her, ordered by her dates — measures each silence. Pull her order stream with the gaps attached.",
    ask: "Alice's orders with the day-gap from her previous order.",
    template: `SELECT created_at, ROUND(julianday(created_at) - {1}(julianday(created_at)) OVER (ORDER BY julianday(created_at)), 0) AS gap
FROM {2}
WHERE customer_id = {3};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward fetch",
        why: "A gap measures back to the previous order, so the offset is LAG. LEAD would measure forward to the next order — the same silences labeled from the wrong end.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the timeline table",
        why: "Purchase gaps live on orders. Running the same window over customers would measure signup gaps — a different silence entirely.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the member id",
        why: "The dormant read is Alice's account, customer 1. A 2-fill would profile Bruno's rhythm instead — his longest silence runs 81 days.",
      },
    ],
    distractors: ["LEAD", "customers", "2"],
    walkthrough:
      "LAG over Alice's own 24-order timeline measures each silence: 20 days, then 29, then a stretch of 5 — and twice the stream goes quiet for more than a month, peaking at the 51-day silence before her November 11 order. LEAD would label the same silences forward — every gap would move one row down and read from the other end. The table matters: over customers the same window would measure the sixteen signup gaps, a completely different rhythm. And the 2-fill would profile Bruno, whose longest stretch runs 81 days. Alice's rhythm: quietest before 2024-11-11, 51 days.",
  },
  {
    id: "cs-1286",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The gain count",
    brief:
      "From: Finance review. Re: the momentum score.\n\nThirteen month-to-month deltas split into gains and slides, and the momentum score is the gain count. Compute every delta with LAG and count the months that beat their predecessor.",
    ask: "How many months grew revenue over the previous month?",
    template: `SELECT COUNT(*) AS gain_months
FROM (
  SELECT SUM(total) AS rev,
         SUM(total) - {3}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS delta
  FROM orders
  GROUP BY strftime('%Y-%m', created_at)
)
WHERE delta {1} {2};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the gain test",
        why: "A gain is a positive delta, so the test is > 0. Flipping to < would count the slides — the eight contracting months — and score momentum backwards.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the zero line",
        why: "The zero line splits gains from slides — five months sit above it. A 450 line would drop May's 441.40 rebound and understate the score.",
      },
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward delta",
        why: "Momentum compares each month to the one before it, so the offset is LAG. LEAD would compare to the month ahead — the same thirteen deltas mirrored, and the score would read the slides.",
      },
    ],
    distractors: ["<", "450", "LEAD"],
    walkthrough:
      "LAG builds the thirteen deltas, and the > 0 test counts the months that beat their predecessor: five gains — May's +441.40, August's +1158.21, September's +763.97, December's +452.67, February 2025's +721.03 — against eight slides. The momentum score: 5. The < flip would count the slides and call eight contracting months a winning streak, and the 400 line would miss December's +452.67 by nothing and February's +721.03 by less. Five gains, eight slides — the year leaned backwards.",
  },
  {
    id: "cs-1287",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The order-count seesaw",
    brief:
      "From: Billing lead. Re: the volume rhythm.\n\nRevenue has its deltas; order volume has its own seesaw. Compute August's order count against July's with LAG and read the tick — up two, down one, or flat.",
    ask: "August 2024's order-count change against July.",
    template: `SELECT mo, n, d
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
         COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS d
  FROM orders
  GROUP BY mo
)
WHERE mo {1} {2}
AND n {3} {4};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the read test",
        why: "The read is one month's tick, so the gate is mo = '2024-08'. Flipping to < would return the whole first half of the seesaw.",
      },
      {
        answer: "'2024-08'",
        kind: "keyword",
        label: "the read month",
        why: "August's tick is the story — the dip after July's eight. The '2024-09' fill would read September's +2 instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the volume gate direction",
        why: "The gate keeps real volume months, so the test is > 0. Flipping to < 0 would demand a negative count and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open volume floor",
        why: "A floor of 0 admits every real month — August's seven clear it. A floor of 8 would exceed August's count and empty the read.",
      },
    ],
    distractors: ["8", "<"],
    walkthrough:
      "LAG over the month census parks July's 8 on August's row, and the tick reads 7 − 8 = −1: August slipped one order below July. The n fill would order the window by count and compare August against a lookalike month — a seesaw with no calendar. The < flip would return the entire first half, and the September fill would read its +2 rebound instead. August's tick: minus one.",
  },
  {
    id: "cs-1288",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "The gap to the crown",
    brief:
      "From: Growth lead. Re: the chase narrative.\n\nThe leaderboard's story is the chase: what stands between Emma and the crown? LAG over the spend-ordered board parks the member ahead on each row — read Emma's line and the gap tells itself.",
    ask: "Emma's lifetime spend with the figure directly ahead of her.",
    template: `SELECT name, spend, above
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         {1}(SUM(o.total)) OVER (ORDER BY SUM(o.total) {2}) AS above
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE name = {3};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the ahead fetch",
        why: "The member directly ahead on a descending board is the bigger spender, so the offset is LAG. LEAD would fetch the member behind — the chase read backwards.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the chase direction",
        why: "The chase runs down a descending board, so the member ahead is the bigger spender — LAG over DESC. ASC would park a smaller spend on Emma's row and flip the chase.",
      },
      {
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the chaser",
        why: "The narrative follows Emma's chase, so the gate is her name. The 'Alice Chen' fill would return Alice's row — and NULL above it, because nobody stands above the crown.",
      },
    ],
    distractors: ["LEAD", "ASC", "'Alice Chen'"],
    walkthrough:
      "LAG over the descending board parks the spender directly ahead on each row, and Emma's line carries Alice's 7262.35 above her own 6640.56 — the chase gap is 621.79. ASC would park Grace's 4574.23 there instead, a member Emma already leads. The Alice fill would return the crown's own row, where LAG reads NULL — nobody to chase. The chase narrative: Emma at 6640.56, chasing 7262.35, 621.79 back.",
  },
  {
    id: "cs-1289",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The invoicing momentum",
    brief:
      "From: Finance review. Re: the billing pace.\n\nThe invoice ledger has its own calendar: issue months and their pots. Compute April's invoicing momentum — the pot against March's — with LAG over the ledger's months.",
    ask: "April 2024's invoice-pot change against March.",
    template: `SELECT mo, pot, d
FROM (
  SELECT strftime('%Y-%m', issued_on) AS mo, SUM(amount_cents) AS pot,
         SUM(amount_cents) - LAG(SUM(amount_cents)) OVER (ORDER BY strftime('%Y-%m', issued_on)) AS d
  FROM invoices
  GROUP BY mo
)
WHERE mo {1} {2}
AND pot {3} {4};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the read test",
        why: "The read is one month's momentum, so the gate is mo = '2024-04'. Flipping to < would return the ledger's whole opening stretch.",
      },
      {
        answer: "'2024-04'",
        kind: "keyword",
        label: "the read month",
        why: "April's pace is the story — the rebound after March. The '2024-03' fill would read March's −199400 slide instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the pot gate direction",
        why: "The gate keeps real billing months, so the test is > 0. Flipping to < 0 would demand a negative pot and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open pot floor",
        why: "A floor of 0 admits every real month — April's 528400 clears it. A floor of 600000 would exceed April's pot and empty the read.",
      },
    ],
    distractors: ["<", "'2024-03'", "600000"],
    walkthrough:
      "LAG over the issue-month pots parks March's 500900 on April's row, and the momentum reads 528400 − 500900 = +27500 — April billed a touch more than March. The pot fill would order the window by size and compare April against its biggest lookalike, a ledger with no calendar. The < flip would return the opening months, and the March fill would read its slide into April backwards. April's invoicing momentum: plus 27500 cents.",
  },
  {
    id: "cs-1290",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The long-silence census",
    brief:
      "From: Fraud spot-check. Re: the dormancy sweep.\n\nAcross the whole book, some gaps between a member's consecutive orders ran past a month. Measure every member's order-to-order gaps — LAG inside each member's own partition — and count the silences over 30 days.",
    ask: "How many order-to-order gaps ran longer than 30 days?",
    template: `SELECT COUNT(*) AS long_gaps
FROM (
  SELECT julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY {1} ORDER BY created_at) AS gap
  FROM orders
)
WHERE gap {2} {3};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the timeline partition",
        why: "A silence is the gap between one member's own consecutive orders, so the window partitions by customer. Without the member partition, LAG would measure across members — silences that belong to nobody.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the dormancy direction",
        why: "The sweep hunts silences past the month line, so the test is >. Flipping to < would census the brisk turnarounds instead.",
      },
      {
        answer: "30",
        kind: "number",
        noVerify: true,
        label: "the month line",
        why: "The dormancy line sits at 30 days — 35 gaps ran past it. A 45 line would catch only the deepest silences and understate the sweep.",
      },
    ],
    distractors: ["created_at", "45", "<"],
    walkthrough:
      "PARTITION BY customer_id keeps every LAG inside one member's own timeline — no cross-member silences — and the > 30 test counts 35 gaps that ran past a month, the dormancy sweep's headline. The created_at fill would partition by timestamp: every order its own partition, every gap NULL, and the census would read zero. The 45 line would catch only the deepest stretches, and the < flip would count the brisk one-to-three-day turnarounds instead. The dormancy sweep: 35 long silences.",
  },
  {
    id: "cs-1291",
    tier: "easy",
    topic: "t8",
    universe: "expense",
    title: "The running revenue line",
    brief:
      "From: Finance review. Re: the cumulative chart.\n\nThe board chart stacks revenue as it accumulates — each month's line carries every month before it. SUM OVER with an ordered frame builds the running line; pull the first quarter of it.",
    ask: "Running revenue through March 2024.",
    template: `SELECT mo, rev, ROUND(SUM(rev) OVER (ORDER BY {1}), 2) AS run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev
  FROM orders
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "mo",
        kind: "keyword",
        label: "the accumulation order",
        why: "Revenue accumulates along the calendar, so the window orders by the month key. Ordering by rev would accumulate in size order — a chart with no timeline.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the quarter test",
        why: "The read covers the first quarter, so the gate is mo <= '2024-03'. Flipping to >= would run from March onward and lose the opening stack.",
      },
      {
        answer: "'2024-03'",
        kind: "keyword",
        label: "the quarter end",
        why: "The chart's first frame ends at March — three months stacked. A '2024-06' fill would carry six months and the run would reach 17385.34.",
      },
    ],
    distractors: ["rev", ">=", "'2024-06'"],
    walkthrough:
      "SUM(rev) OVER (ORDER BY mo) stacks the calendar: January carries 3731.97, February carries 7341.61, and March's line lands on 9958.69 — the quarter's true cumulative take. The mo fill would accumulate in revenue-size order, a chart where the timeline jumps around and the running line means nothing. The >= flip would start the stack at March with 2617.08 and call it a beginning. The first-quarter frame: 9958.69 by March.",
  },
  {
    id: "cs-1292",
    tier: "easy",
    topic: "t8",
    universe: "expense",
    title: "The grand-total convergence",
    brief:
      "From: Finance review. Re: the reconciliation figure.\n\nThe running line has a destination: the last month's run equals the book's grand total — the window's way of proving the stack never loses a cent. Read the final line of the running revenue.",
    ask: "The final running-revenue figure across all months.",
    template: `SELECT ROUND({3}(rev) OVER (ORDER BY mo), 2) AS run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev
  FROM orders
  GROUP BY mo
)
ORDER BY mo {1}
LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the destination order",
        why: "The destination is the last month's stack, so the read orders months descending and takes the first. ASC would land on January's opening stack instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-line cut",
        why: "The reconciliation reads one figure, so the cut is 1. A cut of 2 would return the closing stack and November's, and the figure would stop being singular.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates revenue, so the window folds with SUM. COUNT would stack row counts — 14 at the end — a tally wearing a revenue label.",
      },
    ],
    distractors: ["ASC", "2", "COUNT"],
    walkthrough:
      "The running stack walks all fourteen months, and its final line — February 2025's 34833.28 — is the book's grand total, the same figure a bare SUM would produce. That convergence is the reconciliation: the window lost nothing along the way. Ordering ASC would land on January's 3731.97, the opening stack, and the COUNT fill would turn the column into row numbers — 14 at the end, a count wearing a revenue label. The reconciliation figure: 34833.28.",
  },
  {
    id: "cs-1293",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "The 20000 wall",
    brief:
      "From: Finance review. Re: the milestone timeline.\n\nThe running revenue crossed the 20000 wall somewhere in 2024 — the timeline question is how many months were still under it. Build the running stack and count the months that finished below the wall.",
    ask: "How many months finished with running revenue below 20000?",
    template: `SELECT COUNT(*) AS under_wall
FROM (
  SELECT SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run
  FROM orders
  GROUP BY strftime('%Y-%m', created_at)
)
WHERE run {1} {2}
AND rev {3} {4};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the under test",
        why: "The question counts months below the wall, so the test is run < 20000. Flipping to > would count the months already past it.",
      },
      {
        answer: "20000",
        kind: "number",
        noVerify: true,
        label: "the milestone wall",
        why: "The wall sits at 20000 — seven months finish under it. A 25000 line would count nine months and move the milestone.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the month gate direction",
        why: "The gate keeps real revenue months, so the test is > 0. Flipping to < 0 would demand a revenue-negative month and empty the timeline.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open month floor",
        why: "A floor of 0 admits every real month. A 2500 floor would drop the lean months and renumber the milestone count.",
      },
    ],
    distractors: ["25000", "COUNT", "2500", "<"],
    walkthrough:
      "The running stack climbs 3731.97, 7341.61, 9958.69 and on — and the < 20000 test counts seven months on the near side of the wall: January through July 2024, with August's 20931.27 the first stack past it. Moving the wall to 25000 would count nine months — October's 27022.98 is the stack that finally clears that line — and tell a longer story. And the COUNT fill would turn the run column into row numbers and count all fourteen — a milestone with no milestone. The wall timeline: 7 months under 20000.",
  },
  {
    id: "cs-1294",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The quartile gate",
    brief:
      "From: Growth lead. Re: the tier-1 cutoff.\n\nThe tier program splits the roster into quartiles — NTILE(4) over the spend ranking — and tier 1's entry gate is the smallest spend still inside it. Build the quartiles and read the gate.",
    ask: "The minimum spend inside the top spend quartile.",
    template: `SELECT ROUND(MIN(spend), 2) AS gate
FROM (
  SELECT ROUND(SUM(o.total), 2) AS spend,
         NTILE({1}) OVER (ORDER BY SUM(o.total) {2}) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE q = {3};`,
    slots: [
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the quartile split",
        why: "The program splits the sixteen members into four quartiles of four, so NTILE carries 4. An 8-fill would halve the quartiles and raise the gate to Alice alone.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the tier direction",
        why: "Tier 1 is the top of the spend ranking, so NTILE orders spend descending. ASC would label the lightest spenders tier 1.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the tier read",
        why: "The gate read targets tier 1, the first bucket of the split. A 4-fill would read the bottom quartile and report the opposite gate.",
      },
    ],
    distractors: ["8", "ASC", "MAX"],
    walkthrough:
      "NTILE(4) deals the sixteen ranked members into four buckets of four, and tier 1 — the descending top — runs from Alice's 7262.35 down to Maya's 3644.56. The gate is that bucket's floor: 3644.56, the spend needed to stand in tier 1. The 8-fill would split into eighths and make the gate Alice's own 7262.35; the ASC flip would label the bottom four spenders tier 1 and report a 444.80 gate. And the MAX fill would read the bucket's ceiling instead of its floor. The tier-1 gate: 3644.56.",
  },
  {
    id: "cs-1295",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The bottom-quartile ceiling",
    brief:
      "From: Growth lead. Re: the win-back line.\n\nThe same quartile split, read from the other end: the bottom quartile's ceiling is the spend line under which win-back candidates live. Build the quartiles and read that ceiling.",
    ask: "The maximum spend inside the bottom spend quartile.",
    template: `SELECT ROUND({1}(spend), 2) AS line
FROM (
  SELECT ROUND(SUM(o.total), 2) AS spend,
         NTILE(4) OVER (ORDER BY SUM(o.total) {2}) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE q = {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling pick",
        why: "The win-back line is the bottom quartile's highest spend — its ceiling — so the fold is MAX. MIN would read the bucket's floor, Olivia's 444.80, and miss the line.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the split direction",
        why: "The quartiles split the descending spend ranking, so bucket 4 is the bottom. ASC would flip the buckets and put the biggest spenders in bucket 4.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the bottom bucket",
        why: "The bottom quartile is bucket 4 of the descending split. A 1-fill would read the top quartile's members instead.",
      },
    ],
    distractors: ["MIN", "ASC", "1"],
    walkthrough:
      "NTILE(4) over the descending ranking deals the lightest four spenders into bucket 4 — Olivia 444.80, Dmitri 599.26, Jamal 645.60, Liam 705.39 — and the bucket's ceiling, its MAX, is 705.39: the line under which win-back candidates live. The MIN fill would read the floor of the bucket and report 444.80, the roster's lightest book. The ASC flip would relabel the buckets so bucket 4 held the biggest spenders, and the 1-fill would read the tier-1 bucket entirely. The win-back line: 705.39.",
  },
  {
    id: "cs-1296",
    tier: "hard",
    topic: "t8",
    universe: "expense",
    title: "The two-month smoothing",
    brief:
      "From: Finance review. Re: the smoothed read.\n\nThe raw monthly line whipsaws; the smoothed read averages each month with its predecessor through a moving frame — ROWS BETWEEN 1 PRECEDING AND CURRENT ROW. Read February's smoothed figure.",
    ask: "March 2024's two-month moving-average revenue.",
    template: `SELECT mo, ma
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         ROUND(AVG(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at) ROWS BETWEEN {1} PRECEDING AND CURRENT ROW), 2) AS ma
  FROM orders
  GROUP BY mo
)
WHERE mo {2} {3}
AND rev > 0;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the frame depth",
        why: "The smoothed read pairs each month with exactly one predecessor, so the frame carries 1 PRECEDING. A 2-fill would average three months and dilute February's figure.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the read test",
        why: "The read is one month's smoothed figure, so the gate is mo = '2024-02'. Flipping to < would demand a month before the series opens.",
      },
      {
        answer: "'2024-03'",
        kind: "keyword",
        label: "the read month",
        why: "March is the first month where the frame depth is visible — its 1-preceding average carries two months. The '2024-02' fill would read February, where every depth agrees.",
      },
    ],
    distractors: ["2", "<", "'2024-02'"],
    walkthrough:
      "The frame averages each month with its predecessor, and March is where the depth shows: 1 PRECEDING carries (3609.64 + 2617.08) / 2 = 3113.36, while a 2-month frame would reach back to January and read 3319.56 — the smoothing contract made visible. At February the two depths still agree, which is why the read targets March. The < fill would demand a month before the series opens and return nothing. And the '2024-02' fill would read a frontier row where depth is invisible. March's smoothed read: 3113.36.",
  },
  {
    id: "cs-1297",
    tier: "hard",
    topic: "t8",
    universe: "expense",
    title: "The smoothing frontier",
    brief:
      "From: Finance review. Re: where the average begins.\n\nThe moving average has its own frontier: the first month has no predecessor, so its frame holds one row and the smoothed figure equals the raw figure. Show the series opening with its smoothed column.",
    ask: "The first two months with their moving-average figures.",
    template: `SELECT mo, rev, ROUND(AVG(rev) OVER (ORDER BY mo ROWS BETWEEN {1} PRECEDING AND CURRENT ROW), 2) AS ma
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev
  FROM orders
  GROUP BY mo
)
ORDER BY mo {2}
LIMIT {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the frame depth",
        why: "The smoothing pairs each month with one predecessor, so the frame is 1 PRECEDING. A 3-fill would widen the frame and dilute February's average to 3319.56.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the series direction",
        why: "The frontier sits at the series opening, so the read orders months ascending. DESC would start at February 2025 and show its frontier instead.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the frontier cut",
        why: "Four rows show the lesson: January's frontier average equals its raw figure, and the next three carry real smoothing. A 2-fill would hide the divergence that builds at March.",
      },
    ],
    distractors: ["2", "DESC"],
    walkthrough:
      "The frame walks the ordered months, and the frontier shows in the first row: January has no predecessor, so its smoothed figure is its raw 3731.97 — the average of one row is itself. February's row carries the real smoothing: 3670.81 against a raw 3609.64. The 3-fill would widen the frame to four rows and dilute February to 3319.56, a different smoothing contract. DESC would open the read at February 2025 — the series closing, not its frontier. The smoothing frontier: January equals its raw figure; February begins the average.",
  },
  {
    id: "cs-1298",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "The region pots",
    brief:
      "From: Month-end close. Re: the regional ledger.\n\nThe close needs each region's total book beside its members — a window SUM partitioned by region keeps every member row and adds the pot. Collapse the member lines to the distinct pots and rank them.",
    ask: "The four regional pots, biggest first.",
    template: `SELECT DISTINCT ROUND(SUM(spend) OVER (PARTITION BY {1}), 2) AS pot
FROM (
  SELECT c.region, ROUND(SUM(o.total), 2) AS spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE spend {2} {3}
ORDER BY pot {4};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the pot partition",
        why: "The ledger wants one pot per region, so the window partitions by region. Partitioning by city would produce sixteen one-member pots and a ledger of noise.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the member gate direction",
        why: "The gate keeps real member books, so the test is > 0. Flipping to < 0 would demand negative spends and empty the ledger.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open member floor",
        why: "A floor of 0 admits every member book — the pots stay whole. A 3000 floor would drop the small books and shrink the regional pots.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ledger direction",
        why: "The close reads the biggest pot first, so the order is descending. ASC would lead with LATAM's single-member 852.44.",
      },
    ],
    distractors: ["city", "3000", "ASC"],
    walkthrough:
      "SUM(spend) OVER (PARTITION BY region) paints each member's row with their region's whole book, and DISTINCT collapses the repeated values into the four pots: EU 15089.23, APAC 11605.45, US 7286.16, LATAM 852.44 — biggest first. The city fill would split the ledger into sixteen one-member pots, a regional report with no regions. The 3000 floor would quietly shrink the EU pot to Alice and Chloe's books and misstate the close. And ASC would lead the ledger with LATAM's single-carry pot. The regional ledger: four pots, EU on top at 15089.23.",
  },
  {
    id: "cs-1299",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The running order census",
    brief:
      "From: Billing lead. Re: the volume stack.\n\nRevenue has its running line; order volume has one too. Stack the monthly order counts with SUM OVER and read the first quarter — where the stack lands after February.",
    ask: "Running order count through February 2024.",
    template: `SELECT mo, n, {3}(n) OVER (ORDER BY mo) AS run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM orders
  GROUP BY mo
)
WHERE mo {1} {2};`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the quarter test",
        why: "The read covers the opening quarter, so the gate is mo <= '2024-02'. Flipping to >= would start the stack at February and lose January's eight.",
      },
      {
        answer: "'2024-02'",
        kind: "keyword",
        label: "the quarter end",
        why: "The stack's first frame ends at February — two months deep. A '2024-03' fill would carry March too and land on 25.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates order counts, so the window folds with SUM. COUNT would stack row numbers — 1, 2 — a census with no volume.",
      },
    ],
    distractors: [">=", "'2024-03'", "COUNT"],
    walkthrough:
      "SUM(n) OVER (ORDER BY mo) stacks the monthly counts along the calendar: January's line carries 8, February's carries 9 more for 17 — the quarter's running volume. The >= flip would start the stack at February's own 9 and call it a beginning. The March fill would extend the frame to 25 orders, a quarter that runs one month long. And the COUNT fill would turn the stack into row numbers — 1, 2 — a census with no volume. The running census through February: 17 orders.",
  },
  {
    id: "cs-1300",
    tier: "hard",
    topic: "t8",
    universe: "expense",
    title: "The whale month, tracked",
    brief:
      "From: Finance review. Re: the capstone read.\n\nEverything together: bucket the months into quartiles by revenue, keep the top bucket, and walk the running stack to the month the board actually asks about — October, whose cumulative line crossed 25000. One query, two windows, one line.",
    ask: "October 2024's revenue with its running total, from the top quartile.",
    template: `SELECT mo, ROUND(rev, 2) AS rev, ROUND(run, 2) AS run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE({1}) OVER (ORDER BY SUM(total) {2}) AS q
  FROM orders
  GROUP BY mo
)
WHERE q = {3}
AND mo = {4};`,
    slots: [
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the quartile split",
        why: "The board reads quartiles, so NTILE carries 4. An 8-fill would split into eighths and October would fall into the second bucket, vanishing from the read.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the bucket direction",
        why: "The top bucket holds the biggest months, so NTILE orders revenue descending. ASC would label the leanest months bucket 1 and October would never appear.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the top bucket",
        why: "The capstone keeps the top quartile — bucket 1 of the descending split. A 4-fill would read the bottom bucket and lose October.",
      },
      {
        answer: "'2024-10'",
        kind: "keyword",
        label: "the tracked month",
        why: "The board tracks October — the month the running stack crossed 25000 at 27022.98. The '2024-01' fill would read January's opening stack instead.",
      },
    ],
    distractors: ["8", "'2024-01'"],
    walkthrough:
      "Two windows on one stage: NTILE(4) over the descending revenue ranking puts October's 2975.67 in the top bucket — the book's fourth-biggest month — and the running SUM walks the calendar to October's 27022.98, the stack that finally cleared the 25000 line. The 8-fill would split the months into eighths, pushing October into bucket 2 and emptying the read. The January fill would return the opening stack, 3731.97 — a frontier, not a crossing. The capstone line: October 2024, 2975.67 revenue, 27022.98 running.",
  },
];
