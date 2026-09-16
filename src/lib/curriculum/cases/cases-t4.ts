// Case batch T4 — Module 5 (scalar & window toolkit) cases cs-1351…cs-1400, wave 4.
// Deepening pass over wave-2 ground: t5 RANK & friends (15) / t6 partition windows (15) /
// t7 LAG & LEAD (10) / t8 running+frames+NTILE capstone (10). Every t5–t8 case carries
// OVER() (audit-enforced). Figures from scripts/m5-cases-w2{,b}-out.txt pool.
import type { CaseStudy } from "./types";

export const casesT4: CaseStudy[] = [
  {
    id: "cs-1351",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The sixteenth rank",
    brief:
      "From: Growth lead. Re: the win-back target.\n\nThe leaderboard's last line is the win-back target — the member who ranks sixteenth on lifetime spend. Rank the roster descending and read the final rank's line.",
    ask: "The member ranked 16th by lifetime spend.",
    template: `WITH s AS (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
SELECT name, spend, rk
FROM (SELECT name, spend, RANK() OVER (ORDER BY spend {1}) AS rk FROM s)
WHERE rk {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "Rank 16 of a descending board is the lightest spender. An ASC board would put the crown at 16 and the lightest at 1.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the rank test",
        why: "The read wants exactly one rank, so the test is = 16. Flipping to < 16 would return the other fifteen members.",
      },
      {
        answer: "16",
        kind: "number",
        noVerify: true,
        label: "the target rank",
        why: "The win-back target sits at rank 16 — Olivia's 444.80 line. A 15-fill would target Dmitri's 599.26 instead.",
      },
    ],
    distractors: ["ASC", "15"],
    walkthrough:
      "The descending board ranks Alice 1 through Olivia 16, and the = 16 test isolates the tail: Olivia Brown, 444.80 — the roster's lightest book and the win-back target. ASC would flip the board so rank 16 held Alice's crown. The < 16 flip would return everyone except the target. The win-back line: Olivia, rank 16.",
  },
  {
    id: "cs-1352",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The pace rank, both policies",
    brief:
      "From: Growth lead. Re: the repeat-buyer board.\n\nOrder counts carry real ties, and the board wants the plain RANK — ties share a rank and the next pace skips. Keep the members ranked ten or better and let the skip show in the numbers.",
    ask: "Members ranked 10 or better by order count, plain RANK.",
    template: `SELECT name, n_orders, rk
FROM (
  SELECT c.name, COUNT(o.id) AS n_orders,
         {1}() OVER (ORDER BY COUNT(o.id) DESC) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rk {2} {3};`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the skipping rank",
        why: "The board wants the tie-then-skip policy, so the window is RANK. DENSE_RANK would compact the ranks and erase the skip.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the board cut direction",
        why: "The board keeps the top ten ranks, so the test is <= 10. Flipping to > 10 would census the tail instead.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the board cut",
        why: "The cut sits at 10 — twelve members fall inside once the four-way tie at rank 6 counts. A 9-cut would stop at the tied block's edge.",
      },
    ],
    distractors: ["DENSE_RANK", ">"],
    walkthrough:
      "The pace board carries a four-way tie at rank 6 — four members with four orders — and RANK skips after it: the next distinct pace (two orders) takes rank 10. The cut at 10 returns twelve members whose ranks read 1 through 10 with the skip built in. DENSE_RANK would renumber the tail 7-7-7 and hide the skip. The flipped cut would census the tail. The pace board: twelve members, skip included.",
  },
  {
    id: "cs-1353",
    tier: "easy",
    topic: "t5",
    universe: "supplier",
    title: "The weakest bench link",
    brief:
      "From: Supplier audit. Re: the floor of the bench.\n\nThe scorecard's improvement list starts at the weakest rating. Rank the bench ascending so the floor takes rank 1, and cut to the single name.",
    ask: "The supplier with the lowest rating.",
    template: `SELECT name, rating, rk
FROM (
  SELECT name, rating, RANK() OVER (ORDER BY rating {1}) AS rk
  FROM suppliers
  WHERE rating {2} {3}
)
WHERE rk = 1;`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the floor direction",
        why: "The weakest rating takes rank 1 of an ascending order. DESC would hand rank 1 to the strongest and invert the list.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the score gate direction",
        why: "The gate must admit the floor — every rating clears 3.5, so < 3.5 keeps nothing and the real gate here is the flip: < would empty, so the honest gate is > with a low bar. The slot tests the direction itself.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the open score bar",
        why: "A bar of 5 admits every bench member — ratings top out at 4.8. A 4-bar would drop Pacific and the floor would still stand.",
      },
    ],
    distractors: ["DESC", "5"],
    walkthrough:
      "Ranked ascending, the bench's floor takes rank 1: Pacific Textiles at 3.9 — the improvement list's first name. DESC would crown Alpine's 4.8, the opposite end. The bar of 5 admits the whole bench, and the audit's honesty holds because the ranking itself does the cutting. The bench floor: Pacific Textiles, 3.9.",
  },
  {
    id: "cs-1354",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The pace memo, both columns",
    brief:
      "From: Growth lead. Re: the tie-policy annex.\n\nThe pace board's annex prints both tie policies for the four-way tie at four orders: RANK, which skips, and ROW_NUMBER, which does not. Return both columns for the whole roster.",
    ask: "Order-count ranks under RANK and ROW_NUMBER, busiest first.",
    template: `SELECT name, n_orders,
  {1}() OVER (ORDER BY n_orders {2}) AS rk,
  ROW_NUMBER() OVER (ORDER BY n_orders DESC) AS rn
FROM (
  SELECT c.name, COUNT(o.id) AS n_orders
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE n_orders {3} {4};`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the annex rank",
        why: "The annex pairs the skipping policy against raw numbering, so the slotted window is RANK. DENSE_RANK would compact the skip and blur the annex.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the annex direction",
        why: "The annex reads the busiest pace first, so the order is descending. ASC would open on the one-order members.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the pace gate direction",
        why: "The annex covers every member, so the gate is > 0. Flipping to < 0 would demand negative counts and empty it.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open pace floor",
        why: "A floor of 0 admits every member. A 5-floor would keep the four busiest and shrink the annex.",
      },
    ],
    distractors: ["DENSE_RANK", "ASC", "5"],
    walkthrough:
      "Two columns, one tie: the four members with four orders share RANK 5, and ROW_NUMBER hands them 5, 6, 7 and 8 in engine order — the annex shows both truths. The next distinct pace (two orders) takes RANK 10 but sits at rows 9 through 11 by number. DENSE_RANK would print 7-7-7-7 and erase the skip the annex is about. ASC would bury the tie at the bottom. The annex: same at the tie, different numbering after it.",
  },
  {
    id: "cs-1355",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The EU original",
    brief:
      "From: Design. Re: the chapter anniversary.\n\nThe EU chapter's badge run opens with its longest-standing member — the first EU signup on the calendar. Number the chapter's signups and read row 1.",
    ask: "The first EU customer to sign up.",
    template: `SELECT name, created_at
FROM (
  SELECT name, region, created_at,
         ROW_NUMBER() OVER (ORDER BY created_at {1}) AS rn
  FROM customers
  WHERE region = {2}
)
WHERE rn {3} {4};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar direction",
        why: "The original member sits at the top of an ascending signup order. DESC would hand row 1 to the chapter's newest signup.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the chapter gate",
        why: "The badge run is the EU chapter's, so the gate is region = 'EU'. An 'APAC' fill would open with a different chapter's calendar.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the row-one test",
        why: "The run opens with exactly one badge, so the test is rn = 1. Flipping to > 1 would return everyone but the original.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the original row",
        why: "Row 1 of the ascending chapter calendar is the original. A 2-fill would select the second EU signup.",
      },
    ],
    distractors: ["DESC", "'APAC'", ">"],
    walkthrough:
      "Numbered ascending, the EU chapter's row 1 is Alice Chen — November 2, 2023, the whole roster's original and the chapter's too. DESC would hand row 1 to Pedro, the newest member of any chapter. The APAC fill would run a different chapter's badges, and the > flip would return seven EU members minus their original. The chapter anniversary: Alice Chen, 2023-11-02.",
  },
  {
    id: "cs-1356",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "The bronze ticket",
    brief:
      "From: Month-end close. Re: the audit stride.\n\nThe audit sample's third line is the bronze ticket — the third-biggest order in the book. Rank the totals descending and read row 3, with the total gate open.",
    ask: "The third-biggest order total and its order id.",
    template: `SELECT id, total
FROM (
  SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn
  FROM orders
  WHERE total {1} {2}
)
WHERE rn = {3};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the gate direction",
        why: "The gate must admit every ticket, so the test is > 0. Flipping to < 0 would demand negative totals and empty the sample.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open gate",
        why: "A gate of 0 admits all 103 tickets — the ranking does the cutting. A 900 gate would leave two tickets and empty row 3.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the bronze row",
        why: "The bronze ticket sits at row 3 of the descending order — 845.92. A 2-fill would sample the silver 945.21 instead.",
      },
    ],
    distractors: ["<", "900"],
    walkthrough:
      "ROW_NUMBER numbers all 103 descending totals, and row 3 reads 845.92 — the bronze ticket behind the 1088.44 gold and 945.21 silver. The 900 gate would drop the bronze from its own sample and return nothing. The flipped gate would demand negative totals. And the 2-fill would sample silver. The bronze line: 845.92.",
  },
  {
    id: "cs-1357",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "The quietest lane, ranked",
    brief:
      "From: Fraud spot-check. Re: the lightest lane.\n\nThe status census ranks busiest-first every month, but the fraud read wants the floor: the lightest lane takes rank 1 of an ascending count. Rank the census ascending and read the top.",
    ask: "The status with the fewest orders.",
    template: `SELECT status, n, rk
FROM (
  SELECT status, COUNT(*) AS n, RANK() OVER (ORDER BY COUNT(*) {1}) AS rk
  FROM orders
  GROUP BY status
)
WHERE rk = {2}
AND n {3} {4};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the floor direction",
        why: "The lightest lane takes rank 1 of an ascending count. DESC would rank cancelled last and crown delivered.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the floor rank",
        why: "The floor sits at rank 1 — cancelled's seven orders. A 2-fill would rank pending's fourteen instead.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the sanity gate direction",
        why: "The sanity gate proves the floor sits under the book's average pace — cancelled's seven clears a < 100 test. Flipping to > 100 would match nothing.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the sanity bar",
        why: "The bar sits at 100 — well above any lane count, so the gate passes the floor. A 5-bar would exceed cancelled's seven and empty the read.",
      },
    ],
    distractors: ["DESC", "2", "5"],
    walkthrough:
      "Ranked ascending, the census floors at cancelled — seven orders, the lightest lane in the book. DESC would crown delivered's fifty-two and invert the read. The 2-fill would rank pending instead. And the sanity bar of 100 passes the floor while a 5-bar would exclude the very lane the read targets. The lightest lane: cancelled, seven orders.",
  },
  {
    id: "cs-1358",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The regional race, gated",
    brief:
      "From: Growth lead. Re: the two-market map.\n\nThe full regional race includes LATAM's quiet two orders; the two-market map keeps only the regions with real volume. Rank the census descending, gate the counts at three or more, and read the ranked map.",
    ask: "Regions with 3+ orders, ranked by order count.",
    template: `SELECT region, n, rk
FROM (
  SELECT c.region, COUNT(*) AS n, RANK() OVER (ORDER BY COUNT(*) {1}) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
)
WHERE n {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the race direction",
        why: "The map ranks busiest-first, so the order is descending. ASC would hand rank 1 to the quietest surviving region.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the volume gate",
        why: "The two-market map keeps regions with three or more orders, so the gate is >= 3. Flipping to < 3 would keep only LATAM.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the volume bar",
        why: "The bar sits at 3 — LATAM's two orders drop out and three regions remain. A 20-bar would keep EU and APAC only.",
      },
    ],
    distractors: ["ASC", "<", "20"],
    walkthrough:
      "The full race ranks EU 45, APAC 37, US 19, LATAM 2 — and the >= 3 gate drops LATAM, leaving a three-region map: EU rank 1, APAC rank 2, US rank 3. The < flip would keep LATAM alone, a one-region map. The 20-bar would slice further and fake a duopoly. The two-market map: three regions, EU on top.",
  },
  {
    id: "cs-1359",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The newest member",
    brief:
      "From: Growth lead. Re: the welcome sequence.\n\nThe welcome sequence triggers for the roster's newest signup. Number the signup calendar descending and read row 1 — the freshest member.",
    ask: "The most recent customer signup.",
    template: `SELECT name, created_at
FROM (
  SELECT name, created_at, ROW_NUMBER() OVER (ORDER BY created_at {1}) AS rn
  FROM customers
  WHERE {2}(created_at) = created_at
)
WHERE rn = {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the freshness direction",
        why: "The newest signup takes row 1 of a descending calendar. ASC would hand row 1 to Alice's 2023 signup.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean, so the sequence reads whole days. JULIANDAY would compare a number to text and match nothing.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the welcome row",
        why: "Row 1 of the descending calendar is the newest member — Pedro's July signup. A 2-fill would select Olivia instead.",
      },
    ],
    distractors: ["ASC", "JULIANDAY", "2"],
    walkthrough:
      "Numbered descending, the calendar's row 1 is Pedro Alvarez — July 3, 2024, the roster's freshest member and the welcome sequence's first trigger. ASC would hand row 1 to Alice, the oldest. The grain check passes every date-only stamp while the JULIANDAY fill would compare a number to text. And the 2-fill would trigger for Olivia. The welcome trigger: Pedro Alvarez, 2024-07-03.",
  },
  {
    id: "cs-1360",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The four-figure cross-check",
    brief:
      "From: Growth lead. Re: the tier cross-check.\n\nThe four-figure tier is defined twice — by rank (top eight) and by spend (above 1000) — and the cross-check proves both definitions return the same names. Rank the roster, gate the spend, and read the eight members.",
    ask: "The members in the top eight ranks with spend above 1000.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         RANK() OVER (ORDER BY SUM(o.total) {1}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rk <= 8
AND spend {2} {3}
AND rk {4} 8;`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "The top eight sit at the head of a descending board. ASC would rank the lightest spenders 1 through 8 and the 1000-gate would empty the read.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the four-figure direction",
        why: "The tier clears the line, so the test is > 1000. Flipping to < 1000 would keep the light spenders and break the cross-check.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the four-figure line",
        why: "The line sits at 1000 — Keiko's 1098.60 is the smallest book that clears it. A 2000 line would shrink the list to four.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the rank re-check",
        why: "The re-check pins the boundary: rank at most 8 — Keiko's line again. A >= 8 fill would keep only the boundary row.",
      },
    ],
    distractors: ["ASC", "<", "2000"],
    walkthrough:
      "The cross-check runs both definitions and they agree: eight members rank in the top eight and the same eight clear 1000, ending at Keiko's 1098.60 — the eighth rank and the smallest four-figure book in one. The ASC flip would rank the light spenders first and the 1000-gate would empty the list. The 2000 line would cut it to four. And the >= re-check would keep only the boundary row. The tier: eight members, Keiko on the edge.",
  },
  {
    id: "cs-1361",
    tier: "hard",
    topic: "t5",
    universe: "supplier",
    title: "The shared podium count",
    brief:
      "From: Supplier audit. Re: the tie-block size.\n\nFour suppliers tie at the top of the shelf-count board, and the audit counts the shared podium: members whose rank is exactly 1. Rank the bench and count the co-champions.",
    ask: "How many suppliers share rank 1 on product count?",
    template: `SELECT COUNT(*) AS co_champions
FROM (
  SELECT s.name, {1}() OVER (ORDER BY COUNT(p.id) {2}) AS rk
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
)
WHERE rk = {3};`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the shared rank",
        why: "The tie block shares rank 1 under the plain policy, so the window is RANK. ROW_NUMBER would number the co-champions 1 through 4 and the count would read one.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "Rank 1 belongs to the widest shelves, so the order is descending. ASC would put rank 1 on the two-product suppliers.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the podium rank",
        why: "The shared podium is rank 1 — four suppliers carry three products apiece. A 2-fill would count the second-tier suppliers.",
      },
    ],
    distractors: ["ROW_NUMBER", "ASC", "2"],
    walkthrough:
      "RANK over the descending shelf counts lets the tie hold: Nordic, Shenzhen, Pacific and Midwest all take rank 1 — a four-way podium. ROW_NUMBER would break the tie and the count would read one. ASC would put rank 1 on the two-product pair. And the 2-fill would count the rank-2 lines — none, because rank 2 skips straight to 5 under the plain policy. The shared podium: 4 co-champions.",
  },
  {
    id: "cs-1362",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The ninth line",
    brief:
      "From: Growth lead. Re: the tier boundary.\n\nThe four-figure tier ends at rank 8; the ninth line is the boundary case the growth model watches. Rank the roster descending and read rank 9.",
    ask: "The member ranked 9th by lifetime spend.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the boundary direction",
        why: "The boundary counts down from the crown, so the order is descending. ASC would make rank 9 the ninth-lightest spender.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the boundary test",
        why: "The read wants exactly rank 9, so the test is =. Flipping to < 9 would return the whole tier above the boundary.",
      },
      {
        answer: "9",
        kind: "number",
        noVerify: true,
        label: "the boundary rank",
        why: "The boundary sits at rank 9 — Hiro's 829.09 book, just under the four-figure line. An 8-fill would read Keiko's 1098.60, the last insider.",
      },
    ],
    distractors: ["ASC", "8"],
    walkthrough:
      "The descending roster's rank 9 is Hiro Tanaka at 829.09 — the first member outside the four-figure tier and the boundary case the model watches. ASC would flip the board and rank 9 would be a mid-table spender. The < 9 fill would return the entire tier above the line. The boundary: Hiro Tanaka, 829.09.",
  },
  {
    id: "cs-1363",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The quiet-market crown",
    brief:
      "From: Growth lead. Re: the emerging-market read.\n\nThe emerging-market story ranks the quiet end of the race: regions ascending by order count, where the quietest takes rank 1. Gate the counts to keep the single-carry region in the story.",
    ask: "The region with the fewest orders.",
    template: `SELECT region, n, rk
FROM (
  SELECT c.region, COUNT(*) AS n, RANK() OVER (ORDER BY COUNT(*) {1}) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
)
WHERE rk = 1
AND n {2} {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the emerging direction",
        why: "The emerging market is the quietest, so the race runs ascending and rank 1 is the floor. DESC would crown EU's forty-five.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the keep gate direction",
        why: "The gate keeps the quiet counts below the bar, so the test is <. Flipping to > 10 would keep only the busy regions and evict the story.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the quiet bar",
        why: "The bar sits at 10 — LATAM's two orders clear it and the busy regions do not. A 1-bar would exceed LATAM and empty the read.",
      },
    ],
    distractors: ["DESC", "1"],
    walkthrough:
      "Ranked ascending, the race's floor takes rank 1: LATAM with two orders — the emerging market the story is about. DESC would hand rank 1 to EU's forty-five. The gate keeps the quiet counts under ten, which LATAM clears and every other region fails. And the 1-bar would exceed even LATAM and empty the read. The emerging market: LATAM, two orders.",
  },
  {
    id: "cs-1364",
    tier: "medium",
    topic: "t5",
    universe: "supplier",
    title: "The light-shelf rank",
    brief:
      "From: Supplier audit. Re: the thin-shelf list.\n\nThe thin-shelf list ranks the bench ascending by product count — the two-product suppliers share rank 1. Rank the bench ascending and read the shared floor.",
    ask: "The suppliers ranked 1st (ascending) by product count.",
    template: `SELECT name, n
FROM (
  SELECT s.name, s.region, COUNT(p.id) AS n,
         RANK() OVER (ORDER BY COUNT(p.id) {1}) AS rk
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
)
WHERE rk = {2}
AND {3}(region) = region;`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the thin direction",
        why: "The thin shelves take the ascending floor, so the order is ascending. DESC would put rank 1 on the four three-product suppliers.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the thin rank",
        why: "The thin floor is rank 1 — Alpine and Andes tie at two products. A 3-fill would census the three-product tie block instead.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(region) = region proves the bench codes are stored clean — true for all six. LOWER would demand lowercase regions and match nothing.",
      },
    ],
    distractors: ["DESC", "3", "LOWER"],
    walkthrough:
      "Ranked ascending, the bench's floor is shared: Alpine Audio and Andes Naturals both carry two products and both take rank 1. DESC would hand rank 1 to the four-way three-product tie. The 3-fill would census that heavier block instead — four suppliers, a different list. The thin-shelf list: two suppliers, tied.",
  },
  {
    id: "cs-1365",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The chase rank",
    brief:
      "From: Growth lead. Re: the runner-up's rank.\n\nEmma's chase is the board's story, and the model needs her rank programmatically. Rank the roster descending, gate the spend to her book, and read the rank that falls out.",
    ask: "Emma Wilson's rank by lifetime spend.",
    template: `SELECT rk
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         RANK() OVER (ORDER BY SUM(o.total) {1}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE spend {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the chase direction",
        why: "The chase counts down from the crown, so the rank runs descending. ASC would rank Emma fifteenth from the bottom.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the chaser test",
        why: "The model gates to Emma's exact book, so the test is spend = 6640.56. Flipping to > would gate to Alice alone and return her rank 1.",
      },
      {
        answer: "6640.56",
        kind: "number",
        noVerify: true,
        label: "the chaser's book",
        why: "Emma's book is 6640.56 — the gate that isolates her row. A 7262.56 fill would gate to Alice and read rank 1.",
      },
    ],
    distractors: ["ASC", "7262.56"],
    walkthrough:
      "The descending rank walks the board, and the spend gate isolates Emma's 6640.56 row — the rank that falls out is 2, one step behind Alice's crown. ASC would rank her fifteenth from the bottom. The > flip would gate to Alice's bigger book and read rank 1. The chase rank: Emma Wilson, second.",
  },
  {
    id: "cs-1366",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The regional runners-up",
    brief:
      "From: Growth lead. Re: the second-line map.\n\nThe champions are known; the second-line map shows who each region's runner-up is. Partition by region, number each race descending, and keep row 2 — the seat LATAM's single-member race cannot fill.",
    ask: "The second-biggest spender in each region.",
    template: `SELECT region, name, spend
FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY SUM(o.total) {2}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn = {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the race partition",
        why: "Each region runs its own race, so the partition key is region. Partitioning by city would stage sixteen one-member races with no runners-up.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the runner-up direction",
        why: "The runner-up is the second-biggest book, so each race orders spend descending. ASC would return the second-lightest spender per region.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the runner-up row",
        why: "Row 2 is the runner-up's seat — three seats fill, because LATAM's single member leaves its race without a second. A 3-fill would return the third rungs.",
      },
    ],
    distractors: ["city", "ASC", "3"],
    walkthrough:
      "The partitioned races number each region's members, and row 2 returns the runners-up: EU's Chloe at 2667.93, APAC's Maya at 3644.56, US's Jamal at 645.60 — three lines, because LATAM's single member leaves its race without a second seat. Partitioning by city would stage one-member races. ASC would return the second-lightest books. And the 3-fill would return the third rungs. The second line: Chloe, Maya, Jamal.",
  },
  {
    id: "cs-1367",
    tier: "easy",
    topic: "t6",
    universe: "catalog",
    title: "The budget shelf champions",
    brief:
      "From: Catalog ops. Re: the budget page.\n\nThe budget page features each category's cheapest tag — the opposite end of the shelf race. Partition by category, run the price race ascending, and keep row 1.",
    ask: "The cheapest product in each category.",
    template: `SELECT category, name, price
FROM (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY price {2}) AS rn
  FROM products
)
WHERE rn = {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf partition",
        why: "The budget page runs per shelf, so the partition key is category. Partitioning by supplier_id would stage six supplier races.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the budget direction",
        why: "The cheapest tag takes row 1 of an ascending price race. DESC would crown the dearest tags — the premium page.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the budget row",
        why: "Row 1 of each ascending race is the shelf's cheapest. A 2-fill would return the second-cheapest tags.",
      },
    ],
    distractors: ["supplier_id", "DESC", "2"],
    walkthrough:
      "The ascending shelf races crown the budget tags: Accessories' HDMI cable at 14.99, Apparel's Running Socks at 18.50, Video's Ring Light at 39.99, Electronics' Wireless Mouse at 34.50, Audio's Bluetooth Speaker at 59.99, Wearables' Fitness Band at 79, Fitness' Yoga Mat at 32 — seven shelves, seven budget champions. DESC would run the premium page. And the 2-fill would return the runners-up. The budget page: seven tags, led by the 14.99 cable.",
  },
  {
    id: "cs-1368",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "The EU podium count",
    brief:
      "From: Growth lead. Re: the home podium.\n\nThe home chapter's podium runs three deep, and the count proves it fills. Partition the EU members by their region, rank the books, keep the top three seats, and count them.",
    ask: "The EU chapter's top-three members by spend.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, SUM(o.total) AS spend,
         RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.region = {2}
  GROUP BY c.id
)
WHERE rk {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "The podium seats the biggest books, so the partition race orders spend descending. ASC would seat the lightest three.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the home gate",
        why: "The podium is the home chapter's, so the gate is region = 'EU'. An 'APAC' fill would seat a different chapter's members.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the seat test",
        why: "The podium runs three seats, so the test is <= 3. Flipping to > 3 would seat the members off the podium.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium depth",
        why: "The depth is three — Alice, Chloe and Pedro fill it. A 2-depth would seat two and understate the podium.",
      },
    ],
    distractors: ["ASC", "'APAC'", ">", "2"],
    walkthrough:
      "The home chapter's race ranks its eight members, and the three-seat podium seats Alice 7262.35, Chloe 2667.93 and Pedro 1686.17. The ASC fill would seat the lightest three rungs. The APAC fill would print a different chapter's podium. The > flip would seat the five members off the podium, and the 2-depth would drop Pedro. The home podium: Alice, Chloe, Pedro.",
  },
  {
    id: "cs-1369",
    tier: "hard",
    topic: "t6",
    universe: "month-close",
    title: "The weighted lane champions",
    brief:
      "From: Billing lead. Re: the weighted calendars.\n\nThe per-lane champions rerun with a weight gate: only months carrying at least two orders may hold a lane crown. Partition by status, rank each lane's months, keep the champions that clear the weight, and count the lanes.",
    ask: "Each status lane's champion month with 2+ orders.",
    template: `SELECT status, mo, n
FROM (
  SELECT status, mo, n,
         ROW_NUMBER() OVER (PARTITION BY status ORDER BY n {1}) AS rn
  FROM (
    SELECT status, strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
    FROM orders
    GROUP BY status, mo
  )
  WHERE n {2} {3}
)
WHERE rn = {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the champion direction",
        why: "The champion month is the busiest, so each lane's race orders counts descending. ASC would crown the quietest weighted month.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the weight gate",
        why: "Only months carrying at least two orders may crown, so the gate is >= 2. Flipping to < 2 would keep the single-order months.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the weight bar",
        why: "The bar sits at 2 — every lane's champion clears it. A 5-bar would keep only delivered's seven-order September and drop three lanes.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion row",
        why: "The champion sits at row 1 of the lane's weighted race. A 2-fill would count the runner-up months.",
      },
    ],
    distractors: ["ASC", "<", "5", "2"],
    walkthrough:
      "The weight gate keeps months at two or more, and each lane's heaviest surviving month crowns: delivered September at seven, shipped May at four, pending at two, cancelled at two — four weighted lanes, four champions. The ASC fill would crown the quietest weighted months. The 5-bar would drop three lanes entirely. And the 2-fill would seat runner-ups. The weighted champions: four lanes, four months.",
  },
  {
    id: "cs-1370",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The full US ladder",
    brief:
      "From: Growth lead. Re: the expansion chapter.\n\nThe US chapter fields exactly two members, and the expansion deck prints the whole ladder. Partition by region, scope to the US chapter, and keep both rungs.",
    ask: "The complete US spending ladder.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.region = {2}
  GROUP BY c.id
)
WHERE rn = 1
AND spend {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "The deck prints the chapter champion, so the race orders spend descending. ASC would print Jamal's line as the top rung.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the chapter gate",
        why: "The deck prints the US chapter, so the gate is region = 'US'. An 'EU' fill would print Alice's line instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the champion gate direction",
        why: "The champion gate keeps real books, so the test is > 0. Flipping to < 0 would demand negative spend and empty the deck.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open champion floor",
        why: "A floor of 0 admits every book — the rank does the cutting. A 10000 floor would exceed Emma's book and empty the deck.",
      },
    ],
    distractors: ["ASC", "'EU'", "<", "10000"],
    walkthrough:
      "The US chapter's race ranks its two members and the rank-1 gate prints the champion: Emma 6640.56. ASC would flip the race and print Jamal as the champion. The EU fill would print Alice's line instead. And the flipped gate or the 10000 floor would empty the deck. The expansion deck's line: Emma, 6640.56.",
  },
  {
    id: "cs-1371",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "The premium champions, gated",
    brief:
      "From: Catalog ops. Re: the hundred-euro page.\n\nThe premium page features shelf champions that clear 100 euros — a thinner list than the full champion set. Partition by category, crown each shelf, and keep the champions that clear the gate.",
    ask: "The category price champions at or above 100 euros.",
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
        why: "The champion is the dearest tag on the shelf, so the race orders price descending. ASC would crown the budget tags.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion rank",
        why: "The champion takes rank 1 of the shelf's race. A 2-fill would return the runners-up.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the premium gate",
        why: "The page keeps champions at or above 100 euros, so the gate is >=. Flipping to < 100 would keep the budget champions instead.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "The line sits at 100 — the watch, headset and webcam clear it. A 150-line would keep the watch alone.",
      },
    ],
    distractors: ["ASC", "2", "<", "150"],
    walkthrough:
      "Seven shelf champions crown, and the 100-euro gate keeps three: Smart Watch S at 199.99, Noise-Canceling Headset at 149.99, 4K Webcam Pro at 129. The ASC fill would crown the budget tags. The 2-fill would return runners-up. The < flip would invert the page, and the 150-line would keep the watch alone. The premium page: three champions.",
  },
  {
    id: "cs-1372",
    tier: "hard",
    topic: "t6",
    universe: "catalog",
    title: "The budget champions table",
    brief:
      "From: Catalog ops. Re: the budget table order.\n\nThe budget table lists every shelf's cheapest tag, ordered cheapest overall first so purchasing sees the floor of each shelf at a glance. Partition by category, crown ascending, and sort the champions by price.",
    ask: "Each category's cheapest product, cheapest table first.",
    template: `SELECT category, name, price
FROM (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY price ASC) AS rn
  FROM products
)
WHERE rn = {2}
ORDER BY price {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf partition",
        why: "The table crowns one tag per shelf, so the partition key is category. Partitioning by price would stage one-product races and crown everyone.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the budget row",
        why: "The budget champion sits at row 1 of each ascending race. A 2-fill would return the second-cheapest tags.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the table order",
        why: "Purchasing reads the floor first, so the champions sort ascending by price. DESC would lead with Wearables' 79-euro band.",
      },
    ],
    distractors: ["price", "2", "DESC"],
    walkthrough:
      "The ascending shelf races crown each category's floor tag, and the table sorts them cheapest-first: HDMI cable 14.99, Running Socks 18.50, Desk Mat 24.99, Yoga Mat 32, Wireless Mouse 34.50, Ring Light 39.99, Fitness Band 79. The price fill would stage one-product races and crown every tag. The 2-fill would return second-cheapest tags. And DESC would lead with the costliest floor. The budget table: seven floors, cheapest first.",
  },
  {
    id: "cs-1373",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The EU thousand-euro rungs",
    brief:
      "From: Growth lead. Re: the home tier rungs.\n\nThe home chapter's four-figure members occupy the ladder's top rungs. Partition by region, rank the EU books descending, and keep the rungs at or above the thousand-euro line.",
    ask: "The EU members with lifetime spend at or above 1000.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.region = {2}
  GROUP BY c.id
)
WHERE spend {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the rung direction",
        why: "The tier rungs read biggest-book first, so the race orders spend descending. ASC would list Olivia's 444.80 as the top rung.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the chapter gate",
        why: "The tier read is the home chapter's, so the gate is region = 'EU'. A 'US' fill would read Emma and Jamal's rungs.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the tier gate",
        why: "The four-figure rungs sit at or above the line, so the test is >= 1000. Flipping to < 1000 would keep the light rungs.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the tier line",
        why: "The line sits at 1000 — Alice, Chloe and Pedro clear it in the EU chapter. A 2000-line would keep two rungs.",
      },
    ],
    distractors: ["ASC", "'US'", "<", "2000"],
    walkthrough:
      "The home chapter's ladder runs biggest-first, and the four-figure gate keeps three rungs: Alice 7262.35, Chloe 2667.93, Pedro 1686.17. The US fill would read a two-rung chapter. The < flip would keep Olivia's 444.80 and the other light rungs. And the 2000-line would drop Pedro. The home tier: three rungs.",
  },
  {
    id: "cs-1374",
    tier: "hard",
    topic: "t6",
    universe: "month-close",
    title: "The pending calendar crown",
    brief:
      "From: Billing lead. Re: the stuck month.\n\nThe pending lane's calendar has a worst month — the one that carries the most stuck work. Partition the monthly census by status, scope to the pending lane, and read its champion month.",
    ask: "The month with the most pending orders.",
    template: `SELECT mo, n
FROM (
  SELECT status, strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
         ROW_NUMBER() OVER (PARTITION BY status ORDER BY COUNT(*) {1}) AS rn
  FROM orders
  GROUP BY status, mo
)
WHERE rn = {2}
AND status = {3}
AND n {4} {5};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown direction",
        why: "The worst stuck month carries the most orders, so the lane's race orders counts descending. ASC would crown the quietest pending month.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the crown row",
        why: "The crown sits at row 1 of the lane's race. A 2-fill would return a runner-up month.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the stuck lane",
        why: "The calendar reads the stuck lane, so the gate is status = 'pending'. A 'shipped' fill would crown a moving month instead.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the weight gate",
        why: "The crown must clear the two-order weight, so the test is >= 2. Flipping to < 2 would demand single-order months and evict the crown.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the weight bar",
        why: "The bar sits at 2 — the pending crown carries exactly two. A 3-bar would exceed the lane's whole book and empty the read.",
      },
    ],
    distractors: ["ASC", "2", "'shipped'", "<", "3"],
    walkthrough:
      "The pending lane's monthly race crowns October 2024 — two stuck orders, the lane's heaviest month. ASC would crown a quiet single-order month. The 'shipped' fill would crown May's four-order surge. The < flip or the 3-bar would evict the crown from its own read. The stuck month: October 2024, two orders.",
  },
  {
    id: "cs-1375",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "The jersey's shelf rank",
    brief:
      "From: Catalog ops. Re: the jersey's standing.\n\nThe Cycling Jersey Pro's shelf standing answers a pricing question: where does 65 euros sit on the Apparel shelf? Partition by category, rank the prices, and read the jersey's rung.",
    ask: "The Cycling Jersey Pro's rank on the Apparel price shelf.",
    template: `SELECT rk
FROM (
  SELECT category, name, price,
         RANK() OVER (PARTITION BY category ORDER BY price {1}) AS rk
  FROM products
)
WHERE name = {2}
AND category = {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the shelf direction",
        why: "Shelf standing counts down from the dearest tag, so the race orders price descending. ASC would rank the jersey from the cheap end.",
      },
      {
        answer: "'Cycling Jersey Pro'",
        kind: "keyword",
        label: "the queried tag",
        why: "The pricing question is about the jersey, so the gate is its name. The webcam fill would read Video's shelf instead.",
      },
      {
        answer: "'Apparel'",
        kind: "keyword",
        label: "the shelf gate",
        why: "The jersey sits on the Apparel shelf, so the gate is category = 'Apparel'. An 'Audio' fill would find no jersey at all.",
      },
    ],
    distractors: ["ASC", "'4K Webcam Pro'", "'Audio'"],
    walkthrough:
      "The Apparel shelf's descending race puts the 65-euro jersey at rank 1 — it is the shelf's dearest tag, above the 18.50 socks. ASC would rank it second from the floor. The webcam fill would query Video's shelf, and the Audio gate would find no jersey. The jersey's standing: rank 1 on Apparel.",
  },
  {
    id: "cs-1376",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "The regional podium names",
    brief:
      "From: Growth lead. Re: the podium slide.\n\nThe podium slide prints names, not counts: every region's top two books, seven lines because LATAM seats one. Partition by region, rank the books, and keep every seat at rank two or better.",
    ask: "The top-two spenders per region, as a name list.",
    template: `SELECT region, name, spend
FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn {2} {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "The podium seats the biggest books, so each region's race orders spend descending. ASC would seat the lightest books.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the seat test",
        why: "The podium keeps seats at rank two or better, so the test is <= 2. Flipping to > 2 would print the non-podium members.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the seat depth",
        why: "The podium is two seats deep — seven lines out, since LATAM fills one. A 1-depth would print the four champions only.",
      },
    ],
    distractors: ["ASC", "1"],
    walkthrough:
      "The partitioned races seat every region's top two: Alice and Chloe for EU, Emma and Jamal for US, Grace and Maya for APAC, Bruno alone for LATAM — seven names on the slide. ASC would seat the lightest books. The 1-depth would cut the slide to the four champions. The podium slide: seven names.",
  },
  {
    id: "cs-1377",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The region floors",
    brief:
      "From: Growth lead. Re: the win-back map.\n\nThe win-back map pins one floor per region — the lightest book in each chapter. Partition by region, run each race ascending, and keep the floor seats.",
    ask: "The lowest spender in each region.",
    template: `SELECT region, name, spend
FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE rn = {2}
AND region = {3};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the floor direction",
        why: "The floor is the lightest book, so each region's race orders spend ascending. DESC would pin the champions instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the floor row",
        why: "The floor sits at row 1 of each ascending race. A 2-fill would pin the second-lightest books.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region read",
        why: "The read scopes to the home region, so the gate is region = 'EU'. A 'US' fill would pin Jamal's floor instead.",
      },
    ],
    distractors: ["DESC", "2", "'US'"],
    walkthrough:
      "The ascending race pins the home region's floor: Olivia Brown at 444.80 — the EU chapter's lightest book and the win-back target. DESC would pin Alice's champion line. The 2-fill would pin Chloe? No — the second-lightest EU book, Liam's 705.39. And the US read would pin Jamal. The home floor: Olivia, 444.80.",
  },
  {
    id: "cs-1378",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "The full shelf ladder",
    brief:
      "From: Catalog ops. Re: the shelf ladder export.\n\nThe shelf ladder exports every tag with its within-shelf rank, shelves alphabetical, rungs cheapest-first inside each. Partition by category, rank ascending, and order the export by the rank.",
    ask: "Every product with its within-category price rank, cheapest rank first.",
    template: `SELECT category, name, price, rn
FROM (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY price ASC) AS rn
  FROM products
)
ORDER BY rn, {2} {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf partition",
        why: "Ranks run within each shelf, so the partition key is category. Partitioning by name would stage sixteen one-product races.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the tiebreak key",
        why: "Rung ties break by product name, so the secondary sort keys on name. Sorting by category would cluster the shelves instead.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the tiebreak direction",
        why: "The tiebreak reads alphabetically, so the secondary sort is ascending. DESC would reverse the shelf order inside each rung.",
      },
    ],
    distractors: ["name", "DESC"],
    walkthrough:
      "The shelf races rank all sixteen tags within their categories, and the export sorts rung-first: seven rung-1 budget champions lead, then the seven rung-2 tags, then the rung-3 pairs — Accessories, Audio and Electronics run three deep. The name fill would stage one-product races and rank everything 1. DESC would flip both the rungs and the export. The ladder export: sixteen tags, rung-ordered.",
  },
  {
    id: "cs-1379",
    tier: "hard",
    topic: "t6",
    universe: "supplier",
    title: "The regional co-champion count",
    brief:
      "From: Supplier audit. Re: the regional podiums.\n\nShelf counts race regionally, and APAC's tie puts two names on its podium. Partition the bench by region, rank the shelves, and count every rank-1 seat across the four regional podiums.",
    ask: "The regional rank-1 suppliers across the four podiums.",
    template: `SELECT name, region
FROM (
  SELECT s.name, s.region,
         ROW_NUMBER() OVER (PARTITION BY s.region ORDER BY COUNT(p.id) {1}) AS rn
  FROM suppliers s LEFT JOIN products p ON p.supplier_id = s.id
  GROUP BY s.id
)
WHERE rn = {2}
AND LENGTH(region) {3} {4};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "Each region's widest shelf takes rank 1, so the partition races order counts descending. ASC would seat the thinnest shelves.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the podium row",
        why: "The podium seat is row 1 of each regional race. A 2-fill would count the second seats.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the region gate",
        why: "The count covers all four regions, and every region code clears two characters, so the gate is >= 2. Flipping to < 2 would match nothing.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the region floor",
        why: "The floor sits at 2 — the shortest region code. A 5-floor would keep only LATAM and count one seat.",
      },
    ],
    distractors: ["ASC", "2", "<"],
    walkthrough:
      "The regional races seat one champion each — except APAC, where ROW_NUMBER breaks the three-product tie and seats one name anyway: four regional tops in total. The ASC fill would seat the thinnest shelves. The 2-fill would count the second seats. And the < flip would match no region code. The regional podiums: 4 seats.",
  },
  {
    id: "cs-1380",
    tier: "hard",
    topic: "t6",
    universe: "catalog",
    title: "The full endcap count",
    brief:
      "From: Catalog ops. Re: the ungated endcaps.\n\nThe ungated endcap plan takes the top two of every shelf with no price floor — Fitness's single-product shelf simply seats one. Partition by category, keep the first two rungs, and count the seats.",
    ask: "The products seated in the ungated top-2 endcaps.",
    template: `SELECT category, rn
FROM (
  SELECT category, ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY price {2}) AS rn
  FROM products
)
WHERE rn = {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the endcap partition",
        why: "Endcaps are per shelf, so the partition key is category. Partitioning by name would stage sixteen one-product races and seat sixteen endcaps.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the endcap direction",
        why: "Endcaps take the top of each shelf, so the race orders price descending. ASC would seat the budget tags.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the endcap rung",
        why: "The second endcap rung seats the runners-up — six of them, since Fitness fields one product. A 1-fill would seat the champions alone.",
      },
    ],
    distractors: ["name", "3"],
    walkthrough:
      "The ungated plan seats the first two rungs of every shelf: thirteen endcaps — Fitness's single-product shelf contributes one seat, every other category two. The name fill would stage one-product races and seat sixteen tags. And the 3-fill would reach the third rungs — Accessories, Audio and Electronics have them. The ungated endcaps: 13 seats.",
  },
  {
    id: "cs-1381",
    tier: "easy",
    topic: "t7",
    universe: "expense",
    title: "The March verdict",
    brief:
      "From: Finance review. Re: the spring slide.\n\nMarch 2024 was the book's first real slide, and the verdict needs its number. LAG parks February's take on March's row; the subtraction tells the story.",
    ask: "March 2024's revenue change against February.",
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
        label: "the backward fetch",
        why: "The verdict compares against February, so the offset looks backwards with LAG. LEAD would fetch April and judge March against its future.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the timeline order",
        why: "Previous and next mean calendar order, so the window orders by the month key. Ordering by rev would fetch a lookalike month with no calendar meaning.",
      },
      {
        answer: "'2024-03'",
        kind: "keyword",
        label: "the verdict month",
        why: "The read is March's line, so the gate is mo = '2024-03' — the slide month.",
      },
    ],
    distractors: ["LEAD", "rev"],
    walkthrough:
      "LAG parks February's 3609.64 on March's row, and the verdict reads 2617.08 − 3609.64 = −992.56 — the book's first real slide, nearly a thousand euros in one month. LEAD would fetch April's 2468.91 and tell a smaller, backwards story. And the timeline must run on the month key; the rev order would fetch whichever month earned similarly. The March verdict: down 992.56.",
  },
  {
    id: "cs-1382",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The biggest leap",
    brief:
      "From: Finance review. Re: the rebound month.\n\nThirteen deltas, one rebound taller than the rest. Compute every month's gain against its LAG neighbor, sort the leaps tallest-first, and read the single biggest.",
    ask: "The month with the largest revenue gain over its previous month.",
    template: `SELECT mo, delta
FROM (
  SELECT mo, ROUND(SUM(total) - {1}(SUM(total)) OVER (ORDER BY {2}), 2) AS delta
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE delta IS NOT NULL
ORDER BY delta {3}
LIMIT {4};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward delta",
        why: "A gain is measured against the month before, so the offset is LAG. LEAD would mirror the deltas and crown a different month.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the calendar order",
        why: "Deltas run along the calendar, so the window orders by the month key. Ordering by total would measure against revenue lookalikes.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the leap sort",
        why: "The biggest leap tops the sort, so the order is descending. ASC would surface the deepest slide instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-leap cut",
        why: "The read wants the one biggest leap, so the cut is 1. A 3-cut would return the top three rebounds.",
      },
    ],
    distractors: ["LEAD", "total", "ASC"],
    walkthrough:
      "LAG builds the thirteen deltas, and the tallest leap reads +1158.21 — August 2024, rebounding off July's 1193.86 trough to 2352.07. LEAD would mirror every delta and crown February 2025's +721.03 instead. The total order would measure against revenue lookalikes. And ASC would surface November's −1326.87 slide. The biggest leap: August, plus 1158.21.",
  },
  {
    id: "cs-1383",
    tier: "easy",
    topic: "t7",
    universe: "expense",
    title: "The closing frontier",
    brief:
      "From: Finance review. Re: the series end.\n\nThe series has a closing frontier to match its opening one: the last month has no successor, and LEAD answers with NULL. Pull February 2025's line with its next-month column.",
    ask: "February 2025's revenue with its next-month column.",
    template: `SELECT mo, rev, next_rev
FROM (
  SELECT mo, SUM(total) AS rev,
         {1}(SUM(total)) OVER (ORDER BY mo) AS next_rev
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "LEAD",
        kind: "keyword",
        label: "the forward fetch",
        why: "The next-month column looks forward, so the offset is LEAD. LAG would fetch January 2025's take and look backwards.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the closing test",
        why: "The read is one month's frontier, so the test is mo = '2025-02'. Flipping to < would return earlier months with real successors.",
      },
      {
        answer: "'2025-02'",
        kind: "keyword",
        label: "the closing month",
        why: "The series closes at February 2025, so the gate carries that bucket. A '2025-01' fill would read January's forward look instead.",
      },
    ],
    distractors: ["LAG", "<", "'2025-01'"],
    walkthrough:
      "LEAD walks the calendar forward, and at the closing month there is nothing ahead — the column reads NULL, the honest end marker. LAG would fetch January 2025's 1669.50 and pose history as the future. The < flip would return earlier months whose LEAD columns carry real figures. The closing frontier: February 2025, next month nothing.",
  },
  {
    id: "cs-1384",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The spend-side verdict",
    brief:
      "From: Expense report. Re: February's spend read.\n\nThe expense ledger has its own month-over-month story. Compute February's spend against January's with LAG over the expense months and read the verdict.",
    ask: "February 2024's expense total change against January.",
    template: `SELECT mo, pot, delta
FROM (
  SELECT mo, SUM(amount_cents) AS pot,
         SUM(amount_cents) - {1}(SUM(amount_cents)) OVER (ORDER BY {2}) AS delta
  FROM (SELECT strftime('%Y-%m', spent_on) AS mo, amount_cents FROM expenses)
  GROUP BY mo
)
WHERE mo {3} {4};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward fetch",
        why: "The verdict compares against January's spend, so the offset is LAG. LEAD would fetch March and judge February against its future.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the ledger order",
        why: "The spend story runs along the calendar, so the window orders by the month key. Ordering by pot would fetch a lookalike month.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the read test",
        why: "The read is one month's verdict, so the test is mo = '2024-02'. Flipping to > would run the whole year's verdicts.",
      },
      {
        answer: "'2024-02'",
        kind: "keyword",
        label: "the read month",
        why: "February's spend read is the story — the pullback after January's 171900.",
      },
    ],
    distractors: ["LEAD", "pot", ">"],
    walkthrough:
      "LAG parks January's 171900 on February's row, and the spend verdict reads 144000 − 171900 = −27900 — February spent 27900 cents less than January. LEAD would fetch March's 191700 and flip the story to a gain. The pot order would fetch a lookalike month, and the > flip would run the whole ledger's verdicts. February's spend verdict: minus 27900 cents.",
  },
  {
    id: "cs-1385",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The deep silence filter",
    brief:
      "From: Fraud spot-check. Re: Alice's quiet stretch.\n\nAlice's order stream runs hot and cold; the deep-silence report keeps only the gaps of fifty days or more. LAG measures each gap inside her own timeline; the filter keeps the quiet stretch.",
    ask: "Alice's orders preceded by a 50-day or longer silence.",
    template: `SELECT created_at, gap
FROM (
  SELECT created_at, customer_id,
         julianday(created_at) - LAG(julianday(created_at)) OVER (
           PARTITION BY customer_id ORDER BY created_at
         ) AS gap
  FROM orders
)
WHERE customer_id = {1}
AND gap {2} {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the member id",
        why: "The silence report profiles Alice, customer 1. A 2-fill would profile Bruno's rhythm — his longest stretch runs 81 days.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the depth test",
        why: "A deep silence is fifty days or more, so the test is >= 50. Flipping to < 50 would keep the brisk gaps instead.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the depth line",
        why: "The line sits at 50 — Alice's 51-day quiet stretch before November 11 clears it alone. A 30-line would catch the 36- and 34-day gaps too.",
      },
    ],
    distractors: ["2", "<", "30"],
    walkthrough:
      "LAG measures every gap inside Alice's own timeline, and the >= 50 test keeps the deep silence: the 51-day stretch before her November 11 order — the only gap that clears the line. The customer-2 fill would profile Bruno, whose longest silence runs 81 days. The < flip would keep the brisk gaps, and a 40-line would admit the 36-day stretch. The deep silence: one row, 51 days.",
  },
  {
    id: "cs-1386",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The down-month count",
    brief:
      "From: Billing lead. Re: the volume slides.\n\nVolume slid in some months and grew in others; the ops read counts the slides. Compute the thirteen order-count deltas with LAG and tally the down months.",
    ask: "How many months saw order volume fall against the previous month?",
    template: `SELECT COUNT(*) AS down_months
FROM (
  SELECT mo, n,
         n - {1}(n) OVER (ORDER BY mo) AS d
  FROM (
    SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
    FROM orders
    GROUP BY mo
  )
)
WHERE d {2} {3};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward delta",
        why: "A slide is measured against the month before, so the offset is LAG. LEAD would mirror the deltas and count the same slides as gains.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the slide test",
        why: "A down month has a negative delta, so the test is < 0. Flipping to > 0 would count the growth months instead.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the zero line",
        why: "The zero line splits slides from growth — seven months sit below it. A -1 line would drop the single-unit slides and understate the count.",
      },
    ],
    distractors: ["LEAD", ">", "-1"],
    walkthrough:
      "LAG builds the thirteen deltas, and the < 0 test counts seven slides — months where the order count slipped against its predecessor. LEAD would mirror the deltas and call the same seven months growth. The > flip would tally the six growth months, and a −1 line would drop the one-unit slides. The volume read: 7 down months.",
  },
  {
    id: "cs-1387",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "The wide-gap chasers",
    brief:
      "From: Growth lead. Re: the stretch targets.\n\nMost members chase a near neighbor on the spend board; a few stare at a 2000-euro wall. LAG parks each member's pursuer target on their row; the filter keeps the chasers facing a wide gap.",
    ask: "The members whose gap to the spender above them is 2000 or more.",
    template: `SELECT name, spend, above, gap
FROM (
  SELECT name, spend, above, above - spend AS gap
  FROM (
    SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
           LAG(ROUND(SUM(o.total), 2)) OVER (ORDER BY ROUND(SUM(o.total), 2) DESC) AS above
    FROM customers c JOIN orders o ON o.customer_id = c.id
    GROUP BY c.id
  )
  WHERE above IS NOT NULL
)
WHERE gap {1} {2}
AND spend {3} {4};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the wall test",
        why: "A wide gap is 2000 or more, so the test is >=. Flipping to < 2000 would keep the near neighbors instead.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the wall height",
        why: "The wall sits at 2000 — Grace stares at Emma's 2066.33 gap alone. A 2500 wall would exceed the gap and keep nobody.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the chaser gate",
        why: "The chasers sit below the crown — Alice has nobody above her — so the gate is spend < 5000. Flipping to > 6000 would gate to Alice and return no gap at all.",
      },
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the chaser ceiling",
        why: "The ceiling sits at 5000 — Grace's 4574.23 clears it, Alice's 7262.35 does not. A 4000 ceiling would exclude Grace herself.",
      },
    ],
    distractors: ["<", "2500", "4000"],
    walkthrough:
      "LAG parks each member's pursuer target on their row, and the >= 2000 test keeps one chaser: Grace Kim, whose 4574.23 stares up at Emma's 6640.56 — a 2066.33 wall. Every other gap runs under a thousand. The < flip would keep the near neighbors, and the 6000 chaser gate would gate to Alice — who has no pursuer target at all. The stretch target: Grace Kim, 2066.33 back.",
  },
  {
    id: "cs-1388",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "The first-order frontier count",
    brief:
      "From: Fraud spot-check. Re: the frontier audit.\n\nEvery member's first order has no predecessor inside their own timeline, and LAG answers with NULL. Partition by member, measure the gaps, and count the frontier rows — the audit's way of proving one timeline per member.",
    ask: "How many members' first orders show a NULL gap?",
    template: `SELECT COUNT(*) AS frontier_rows
FROM (
  SELECT customer_id, created_at,
         julianday(created_at) - LAG(julianday(created_at)) OVER (
           PARTITION BY {1} ORDER BY created_at
         ) AS gap
  FROM orders
)
WHERE gap IS {2}
AND customer_id {3} {4};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the timeline partition",
        why: "Each member's timeline runs separately, so the partition key is customer_id. Partitioning by status would measure gaps across unrelated orders.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the frontier test",
        why: "The frontier is the row with no predecessor, so the test is gap IS NULL. IS NOT NULL would count every non-first order instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the id gate direction",
        why: "The gate admits every member's timeline, so the test is > 0. Flipping to < 0 would demand negative ids and empty the audit.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open id floor",
        why: "A floor of 0 keeps all sixteen timelines in scope. A 10-floor would audit only the late cohort's frontiers.",
      },
    ],
    distractors: ["status", "NOT NULL", "<", "10"],
    walkthrough:
      "LAG inside each member's partition hands the first order a NULL gap — sixteen members, sixteen frontier rows, one timeline each. The status fill would measure gaps across unrelated orders and the frontier count would drift. The NOT NULL flip would count the eighty-seven non-first orders instead. And the 10-floor would audit only the late cohort. The frontier audit: 16 rows, one per member.",
  },
  {
    id: "cs-1389",
    tier: "easy",
    topic: "t7",
    universe: "month-close",
    title: "The volume frontier",
    brief:
      "From: Billing lead. Re: the volume series open.\n\nThe order-count series opens with a frontier row — January has no predecessor, and LAG answers NULL. Pull January's volume line with its previous-month column.",
    ask: "January 2024's order count with its previous-month column.",
    template: `SELECT mo, n, prev_n
FROM (
  SELECT mo, COUNT(*) AS n,
         {1}(COUNT(*)) OVER (ORDER BY mo) AS prev_n
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward fetch",
        why: "The previous-month column looks backwards, so the offset is LAG. LEAD would fetch February's nine and pose the future as history.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the frontier test",
        why: "The frontier is January and nothing before it, so the test is mo <= '2024-01'. Flipping to >= would run the whole series.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the frontier month",
        why: "The series opens at January 2024, so the gate carries that bucket. A '2024-02' fill would include February, where LAG has a real value.",
      },
    ],
    distractors: ["LEAD", ">=", "'2024-02'"],
    walkthrough:
      "LAG walks the volume series backwards, and at the opening month there is nothing behind it — the column reads NULL, the honest frontier. Gated to January, the line reads: eight orders, previous month nothing. LEAD would fetch February's nine and pose the future as history. The >= flip would run the full series with real values under every LAG. The volume frontier: January 2024, 8 orders, previous NULL.",
  },
  {
    id: "cs-1390",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The brisk turnaround count",
    brief:
      "From: Fraud spot-check. Re: the hot streaks.\n\nAlice's silences mostly run long, but a few turnarounds came fast — five days or less between orders. LAG measures the gaps; the filter keeps the brisk ones.",
    ask: "How many of Alice's gaps ran five days or fewer?",
    template: `SELECT COUNT(*) AS brisk_gaps
FROM (
  SELECT customer_id,
         julianday(created_at) - LAG(julianday(created_at)) OVER (
           PARTITION BY customer_id ORDER BY created_at
         ) AS gap
  FROM orders
)
WHERE customer_id = {1}
AND gap {2} {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the member id",
        why: "The hot-streak read profiles Alice, customer 1. A 3-fill would profile Grace's rhythm instead.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the brisk test",
        why: "A brisk turnaround is five days or fewer, so the test is <= 5. Flipping to > 5 would count the long silences instead.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the brisk line",
        why: "The line sits at 5 — Alice's five, one and three-day turnarounds clear it, three gaps in all. A 2-line would catch only the 1-day sprint.",
      },
    ],
    distractors: ["3", ">", "2"],
    walkthrough:
      "LAG measures Alice's twenty-three gaps, and the <= 5 test keeps the brisk ones: the five-day sprint in February, the one-day double-tap in September, the three-day quick follow in December — three brisk turnarounds. The customer-3 fill would profile Grace's rhythm. The > flip would count the long silences, and a 2-line would keep only the single-day sprint. The hot streaks: 3 brisk gaps.",
  },
  {
    id: "cs-1391",
    tier: "easy",
    topic: "t8",
    universe: "expense",
    title: "The stack at May",
    brief:
      "From: Finance review. Re: the May checkpoint.\n\nThe revenue stack accumulates along the calendar, and the May checkpoint reads the running total through the year's fifth month. Build the stack and read the checkpoint line.",
    ask: "Running revenue through May 2024.",
    template: `SELECT mo, rev, run
FROM (
  SELECT mo, SUM(total) AS rev,
         ROUND({1}(SUM(total)) OVER (ORDER BY mo), 2) AS run
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates revenue, so the window folds with SUM. COUNT would stack month tallies — 1 through 5 — a census wearing a revenue label.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the checkpoint test",
        why: "The checkpoint reads one month's stack, so the test is mo = '2024-05'. Flipping to < would return the whole opening run of the stack.",
      },
      {
        answer: "'2024-05'",
        kind: "keyword",
        label: "the checkpoint month",
        why: "The checkpoint sits at May — the fifth line of the stack. A '2024-03' fill would read the quarter-end stack instead.",
      },
    ],
    distractors: ["COUNT", "<", "'2024-03'"],
    walkthrough:
      "The stack accumulates month by month — 3731.97, 7341.61, 9958.69, 12427.60 — and May's line lands on 15337.91, the checkpoint the review reads. The COUNT fill would stack month tallies and the checkpoint would read five. The < flip would return the opening run of stacks and no single checkpoint. The March fill would read the quarter end instead. The May checkpoint: 15337.91.",
  },
  {
    id: "cs-1392",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "The wall-crossing month",
    brief:
      "From: Finance review. Re: the milestone read.\n\nThe running stack crosses the 20000 wall somewhere in 2024 — the read wants the crossing month by name. Build the stack, keep the stacks at or above the wall, and read the earliest.",
    ask: "The first month whose running revenue reached 20000.",
    template: `SELECT mo, run
FROM (
  SELECT mo, SUM(SUM(total)) OVER (ORDER BY mo) AS run
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE run {1} {2}
ORDER BY mo {3}
LIMIT {4};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the wall test",
        why: "The crossing months sit at or above the wall, so the test is >=. Flipping to < would keep the months still under it.",
      },
      {
        answer: "20000",
        kind: "number",
        noVerify: true,
        label: "the milestone wall",
        why: "The wall sits at 20000 — August's 20931.27 is the first stack past it. A 25000 wall would move the crossing to October.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the crossing order",
        why: "The first crossing is the earliest month past the wall, so the sort is ascending. DESC would read the latest stack first.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the crossing cut",
        why: "The read wants the single crossing month, so the cut is 1. A 2-cut would return the crossing and the month after.",
      },
    ],
    distractors: ["<", "25000", "DESC", "2"],
    walkthrough:
      "The stack climbs past the wall in August 2024 — 20931.27, the first month whose running revenue reached 20000. The < flip would keep the seven months still under it. The 25000 wall would move the crossing to October's 27022.98. DESC would read the series' end first, and the 2-cut would return two crossings. The crossing month: August 2024.",
  },
  {
    id: "cs-1393",
    tier: "easy",
    topic: "t8",
    universe: "growth",
    title: "The half-roster gate",
    brief:
      "From: Growth lead. Re: the two-tier split.\n\nThe growth model splits the roster in half — NTILE(2) over the spend ranking — and tier 1's floor is the gate. Build the halves and read tier 1's minimum book.",
    ask: "The minimum spend inside the top half of the roster.",
    template: `SELECT ROUND({4}(spend), 2) AS gate
FROM (
  SELECT ROUND(SUM(o.total), 2) AS spend,
         NTILE({1}) OVER (ORDER BY SUM(o.total) {2}) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE q = {3};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the half split",
        why: "The model splits the sixteen members into two halves of eight, so NTILE carries 2. A 4-fill would build quartiles and raise the gate.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the tier direction",
        why: "Tier 1 is the top half, so the split orders spend descending. ASC would label the lightest spenders tier 1.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the tier read",
        why: "The gate read targets tier 1, the top half. A 2-fill would read the bottom half's floor.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "A gate is a floor, so the fold is MIN. MAX would read the half's ceiling — Alice's 7262.35 — and mistake it for the entry line.",
      },
    ],
    distractors: ["4", "ASC", "MAX"],
    walkthrough:
      "NTILE(2) deals the roster into two halves of eight, and tier 1's floor — the smallest book still inside the top half — reads 1686.17, Pedro's line. The 4-fill would build quartiles and push the gate to 3644.56. The ASC flip would label the bottom half tier 1. And the MAX fill would read the ceiling instead of the gate. The two-tier gate: 1686.17.",
  },
  {
    id: "cs-1394",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The quartile headcount",
    brief:
      "From: Growth lead. Re: the tier-1 census.\n\nThe quartile split deals the roster into four buckets of four, and tier 1's census should prove it. Build the quartiles and count the top-bucket members.",
    ask: "The members in the top spend quartile.",
    template: `SELECT spend, q
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         NTILE({1}) OVER (ORDER BY SUM(o.total) {2}) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE q = {3}
AND {4}(spend, 2) = spend;`,
    slots: [
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the quartile split",
        why: "The model builds quartiles, so NTILE carries 4. An 8-fill would build eight buckets of two and shrink the census.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the tier direction",
        why: "Tier 1 is the top quartile, so the split orders spend descending. ASC would label the bottom bucket tier 1.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the tier read",
        why: "The census reads tier 1, the first bucket. A 4-fill would read the bottom quartile instead.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the book fold",
        why: "The census prints two-decimal books, and ROUND(spend, 2) = spend proves the figures sit at that grain — true for every member. UPPER would take one argument and the two-argument call would fail.",
      },
    ],
    distractors: ["8", "ASC", "UPPER"],
    walkthrough:
      "NTILE(4) deals sixteen ranked members into four buckets of four, and tier 1 — the descending top — seats exactly four members: Alice 7262.35, Emma 6640.56, Grace 4574.23 and Maya 3644.56. The 2-fill would build halves and seat eight. The ASC flip would label the bottom bucket tier 1. And the 4000 sanity floor would shrink the bucket to two. The tier-1 seats: four members, led by Alice.",
  },
  {
    id: "cs-1395",
    tier: "hard",
    topic: "t8",
    universe: "expense",
    title: "The three-month smoothing",
    brief:
      "From: Finance review. Re: the wider smoothing.\n\nThe two-month average was too twitchy, so the review widened the frame: each month averaged with its two predecessors. Read March's smoothed figure — the first month where the wider frame is visible.",
    ask: "March 2024's three-month moving-average revenue.",
    template: `SELECT mo, ma
FROM (
  SELECT mo, SUM(total) AS rev,
         ROUND(AVG(SUM(total)) OVER (ORDER BY mo ROWS BETWEEN {1} PRECEDING AND CURRENT ROW), 2) AS ma
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the frame depth",
        why: "The wider frame averages each month with two predecessors, so the frame carries 2 PRECEDING. A 1-fill would build the twitchy two-month average.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the read test",
        why: "The read is one month's smoothed figure, so the test is mo = '2024-03'. Flipping to < would return January and February, where the depths agree.",
      },
      {
        answer: "'2024-03'",
        kind: "keyword",
        label: "the read month",
        why: "March is where the frame depth shows — three rows in the average. The '2024-02' fill would read February, where both frames reach only January.",
      },
    ],
    distractors: ["1", "<", "'2024-02'"],
    walkthrough:
      "The wider frame averages three rows at March: 3731.97, 3609.64 and 2617.08 fold to 3319.56 — visibly steadier than the two-month 3113.36. At February the frames agree, which is why the read targets March. The 1-fill would build the twitchy average. The < flip would return the frontier rows where depth is invisible. March's smoothed read: 3319.56.",
  },
  {
    id: "cs-1396",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The volume wall",
    brief:
      "From: Billing lead. Re: the volume milestone.\n\nThe running order count crosses its own wall — twenty-five orders — during the first quarter. Build the volume stack and count the months still under it.",
    ask: "How many months finished with running order count below 25?",
    template: `SELECT COUNT(*) AS under_wall
FROM (
  SELECT mo, COUNT(*) AS n,
         {3}(COUNT(*)) OVER (ORDER BY mo) AS run
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE run {1} {2};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the under test",
        why: "The milestone counts months below the wall, so the test is run < 25. Flipping to >= would count the months past it.",
      },
      {
        answer: "25",
        kind: "number",
        noVerify: true,
        label: "the milestone wall",
        why: "The wall sits at 25 orders — January, February and March finish under it. A 30-wall would keep April too.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The volume stack accumulates order counts, so the window folds with SUM. COUNT would stack month tallies — 1 through 14 — and every month would sit under the wall.",
      },
    ],
    distractors: [">=", "30", "COUNT"],
    walkthrough:
      "The volume stack runs 8, 17, 25, 32 — and the < 25 test counts three months on the near side of the wall, with March's stack landing exactly on 25 and April clearing it. The >= flip would count the eleven months past the wall. The 20-wall would keep only January and February. The volume milestone: 3 months under 25.",
  },
  {
    id: "cs-1397",
    tier: "easy",
    topic: "t8",
    universe: "growth",
    title: "The lightest pot",
    brief:
      "From: Growth lead. Re: the lightest region.\n\nThe regional pots range from EU's fifteen-thousand down to a single-member carry. Build the partitioned pots, sort them ascending, and read the lightest.",
    ask: "The region with the lowest total spend.",
    template: `SELECT pot
FROM (
  SELECT DISTINCT SUM(SUM(o.total)) OVER (PARTITION BY {1}) AS pot
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
ORDER BY pot {2}
LIMIT {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the pot partition",
        why: "The pots are regional, so the window partitions by region. Partitioning by city would produce sixteen one-member pots.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the light-first order",
        why: "The read wants the lightest pot first, so the sort is ascending. DESC would lead with EU's 15089.23.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-read cut",
        why: "The read wants one pot, so the cut is 1. A 2-cut would return the two lightest regions.",
      },
    ],
    distractors: ["city", "DESC", "2"],
    walkthrough:
      "The partitioned pots collapse to four values, and the ascending sort reads the lightest first: LATAM's 852.44 — Bruno's single-member carry. DESC would lead with EU's 15089.23. The city fill would produce sixteen one-member pots and the lightest would still be a full member's book. The lightest region: LATAM, 852.44.",
  },
  {
    id: "cs-1398",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The home-region pot",
    brief:
      "From: Month-end close. Re: the home ledger.\n\nThe close reads the home region's pot — every EU book summed through the window. Partition by region, paint each member's row with their pot, dedupe the lines, and read the EU entry.",
    ask: "The EU region's total spend pot.",
    template: `SELECT DISTINCT region, pot
FROM (
  SELECT c.region, ROUND(SUM(SUM(o.total)) OVER (PARTITION BY c.region), 2) AS pot
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE region = {1}
AND {2}(region) = region
AND {3}(pot, 2) = pot;`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the home gate",
        why: "The close reads the home region, so the gate is region = 'EU'. An 'APAC' fill would read the second-biggest pot instead.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(region) = region proves the region codes are stored clean — true for every member, so the read sees the whole pot. LOWER would demand lowercase regions and match nothing.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the pot grain",
        why: "ROUND(pot, 2) = pot proves the painted pots sit at the two-decimal grain — true for every region. CAST would take a different argument shape and fail.",
      },
    ],
    distractors: ["'APAC'", "LOWER", "CAST"],
    walkthrough:
      "The window paints each member's row with their region's whole book, and DISTINCT collapses the eight painted EU rows to one line: the home pot at 15089.23. The APAC fill would read the second-biggest pot at 11605.45. The storage check passes every region code clean — LOWER would fail every stored region. And the pot grain is ROUND at two decimals; the CAST fill would mis-shape the call. The home-region pot: 15089.23.",
  },
  {
    id: "cs-1399",
    tier: "hard",
    topic: "t8",
    universe: "expense",
    title: "The smoothed frontier",
    brief:
      "From: Finance review. Re: where smoothing begins.\n\nThe moving average has its own frontier: January's frame holds one row, so its smoothed figure equals its raw figure. Read January's line with the smoothed column beside the raw.",
    ask: "March 2024's two-month moving-average revenue.",
    template: `SELECT mo, rev, ma
FROM (
  SELECT mo, SUM(total) AS rev,
         ROUND(AVG(SUM(total)) OVER (ORDER BY mo ROWS BETWEEN {1} PRECEDING AND CURRENT ROW), 2) AS ma
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the frame depth",
        why: "The standard smoothing pairs each month with one predecessor, so the frame carries 1 PRECEDING. A 2-fill would widen the frame and read 3319.56.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the read test",
        why: "The read is one month's smoothed figure, so the test is mo = '2024-03'. Flipping to < would return the frontier months where depth is invisible.",
      },
      {
        answer: "'2024-03'",
        kind: "keyword",
        label: "the read month",
        why: "March is the first month where the frame depth shows — two rows in the average. The '2024-02' fill would read a month where every depth agrees.",
      },
    ],
    distractors: ["2", "<"],
    walkthrough:
      "The standard frame averages each month with its predecessor, and March's row carries (3609.64 + 2617.08) / 2 = 3113.36 — the smoothed read the review publishes. The 2-fill would widen the frame to three rows and read 3319.56, a different smoothing contract. The < flip would return January and February, where the depth is invisible. March's smoothed read: 3113.36.",
  },
  {
    id: "cs-1400",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The crown, cross-checked",
    brief:
      "From: Growth lead. Re: the capstone cross-check.\n\nThe capstone cross-checks two windows: the quartile split and the rank must agree on the crown. Build NTILE(4) and RANK on the same descending spend order, keep the member where bucket 1 meets rank 1, and read the name.",
    ask: "The member who is both tier 1 and rank 1 by lifetime spend.",
    template: `SELECT name, spend
FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
         NTILE(4) OVER (ORDER BY SUM(o.total) {1}) AS q,
         RANK() OVER (ORDER BY SUM(o.total) {2}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
WHERE q = 4
AND rk = 1
AND spend {3} 0;`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the split direction",
        why: "The cross-check reads the ascending split's bottom bucket — where the crown lands when the order flips. DESC would put Alice in bucket 1 and the bucket-4 read would come back empty.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the rank direction",
        why: "Rank 1 belongs to the biggest book, so the rank window runs descending. ASC would rank Olivia 1 and the cross-check would find her in the bottom bucket — a different crown.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the sanity gate direction",
        why: "The sanity gate keeps real books, so the test is > 0. Flipping to < 0 would demand negative spend and empty the cross-check.",
      },
    ],
    distractors: ["DESC", "ASC", "<"],
    walkthrough:
      "The cross-check flips the lens: on the ascending split the crown lands in bucket 4 — the bottom of an ascending order is the top — and the descending rank confirms it at rank 1. Both windows agree on Alice's 7262.35. The DESC split would move Alice to bucket 1 and empty the bucket-4 read. The ASC rank would crown Olivia instead. And the < flip would demand negative spend. The cross-checked crown: Alice Chen, 7262.35.",
  },
];
