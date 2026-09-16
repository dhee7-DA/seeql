// Case batch T6 — Module 5 (scalar & window toolkit) cases cs-1451…cs-1500, wave 6 (FINAL).
// Deepening pass over t5–t8 window ground. Figures from the W6 receipt pool (m5-cases-w6-facts*.ts).
import type { CaseStudy } from "./types";

export const casesT6: CaseStudy[] = [
  {
    id: "cs-1451",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The two-order rank line",
    brief:
      "From: Growth lead. Re: the engagement ladder.\n\nThe engagement ladder ranks members by orders placed, and the two-order club wants to know which line it shares. Build the ladder with a ranker that skips after ties, then read the line the club holds.",
    ask: "Which rank line does the two-order club share on the order ladder?",
    template: `SELECT name, n, rk FROM (
  SELECT c.name, COUNT(o.id) AS n, {1}() OVER (ORDER BY COUNT(o.id) {2}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE n = {3}
ORDER BY rk, name;`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the skipping ranker",
        why: "RANK prints tied members on one line and skips forward, so gaps tell the tie story. DENSE_RANK squeezes the gaps out and ROW_NUMBER would split the club across lines.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Most orders first is the engagement read, so the ladder sorts descending. Ascending would start at the one-order tail and hand the club a different line.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the club's order count",
        why: "The two-order club placed exactly two orders each. Filtering at 3 would land on the three-order pair and at 4 on the quad — different rungs entirely.",
      },
    ],
    distractors: ["DENSE_RANK", "ROW_NUMBER", "3"],
    walkthrough:
      "RANK orders the sixteen members by orders placed and hands every tie the same line: the 24-order leader takes 1, the 17-order runner-up 2, down to the five-order specialist at 5. The four-order quad shares 6, the three-order pair 10, and the two-order trio of Bruno, Dmitri and Jamal shares line 12. DENSE_RANK would print 8 for the same trio and ROW_NUMBER would split it across 12, 13 and 14. The engagement ladder's answer: the two-order club sits on rank line 12.",
  },
  {
    id: "cs-1452",
    tier: "easy",
    topic: "t5",
    universe: "month-close",
    title: "The rank-6 billing club",
    brief:
      "From: Billing ops. Re: the invoice ladder.\n\nThe finance team ranks members by invoices raised, and line six matters for the dunning sweep. Build the ladder with a skipping ranker and isolate the club that shares rank line six.",
    ask: "How many members share rank line 6 on the invoice ladder?",
    template: `SELECT name, n, rk FROM (
  SELECT c.name, i2.n, {2}() OVER (ORDER BY i2.n {3}) AS rk
  FROM (SELECT customer_id, COUNT(*) AS n FROM invoices GROUP BY customer_id) i2
  JOIN customers c ON c.id = i2.customer_id)
WHERE rk = {1};`,
    slots: [
      {
        answer: "6",
        kind: "number",
        label: "the shared rank line",
        why: "The two-invoice trio lands on rank line 6 after the tie at 2 and the pair at 4 skip ahead. Line 4 would catch the three-invoice pair instead.",
      },
      {
        answer: "RANK",
        kind: "keyword",
        label: "the skipping ranker",
        why: "RANK gives tied counts one line and skips the next, which is what creates line 6. DENSE_RANK would relabel the club to line 4 and ROW_NUMBER would break it apart.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Heaviest billers first is the dunning read, so the ladder sorts descending. Ascending would mirror every line and strand the club elsewhere.",
      },
    ],
    distractors: ["DENSE_RANK", "ROW_NUMBER", "4", "9"],
    walkthrough:
      "Eleven members carry invoices. Alice's five take line 1, the four-invoice duo shares 2, the three-invoice pair shares 4, and the two-invoice trio of Jamal, Liam and Olivia shares line 6 — the skip from 4 past 5 is the tie telling on itself. DENSE_RANK would call that same club line 4, and ROW_NUMBER would hand each member a private number. The rank-6 billing club has three members.",
  },
  {
    id: "cs-1453",
    tier: "hard",
    topic: "t5",
    universe: "refund-audit",
    title: "The dense line of the duos",
    brief:
      "From: Refund audit. Re: the billing-density map.\n\nThe audit wants the density view: ties compressed, no gaps, so equal billers sit on equal lines. Find the dense line that the two-invoice trio occupies on the invoice ladder.",
    ask: "Which dense-rank line does the two-invoice trio share?",
    template: `SELECT name, n, drk FROM (
  SELECT c.name, i2.n, {2}() OVER (ORDER BY i2.n {3}) AS drk
  FROM (SELECT customer_id, COUNT(*) AS n FROM invoices GROUP BY customer_id) i2
  JOIN customers c ON c.id = i2.customer_id)
WHERE drk = {1};`,
    slots: [
      {
        answer: "4",
        kind: "number",
        label: "the dense line",
        why: "With ties compressed the ladder reads 1, 2, 3, 4: the two-invoice trio is the fourth distinct count. Rank line 6 would be empty under DENSE_RANK.",
      },
      {
        answer: "DENSE_RANK",
        kind: "keyword",
        label: "the gapless ranker",
        why: "DENSE_RANK never skips: every distinct count gets the next line. RANK would leave holes after ties and ROW_NUMBER would deny the trio a shared line.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Heaviest billers first keeps the density map reading top-down. Ascending would mirror the lines and hand the trio a different number.",
      },
    ],
    distractors: ["RANK", "ROW_NUMBER", "2", "5"],
    walkthrough:
      "DENSE_RANK walks the distinct counts without skipping: five invoices take line 1, four take 2, three take 3, and the two-invoice trio of Jamal, Liam and Olivia takes line 4. RANK would have printed 6 for the same trio because the tie at 4 skips a line, and ROW_NUMBER would split the club across private ordinals. Under the gapless reading, the two-invoice trio lives on dense line 4.",
  },
  {
    id: "cs-1454",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The ninth row of the ladder",
    brief:
      "From: Growth lead. Re: the ordinal slice.\n\nThe leaderboard needs its ninth row named, and ties must break alphabetically so the slice is reproducible. Number the order ladder with a row counter and read off row nine.",
    ask: "Which member holds row 9 of the alphabetically tie-broken order ladder?",
    template: `SELECT name, n, rn FROM (
  SELECT c.name, COUNT(o.id) AS n,
    ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC, c.name) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE rn = {1} AND n {3} {2};`,
    slots: [
      {
        answer: "9",
        kind: "number",
        label: "the requested row",
        why: "The slice asks for row 9 specifically. Row 8 would name Noah and row 7 Keiko — each one rung off the ask.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the floor guard",
        why: "A floor of one keeps every member eligible — nobody places fewer than one order. Raising it to five would fence off the very quad the answer lives in.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the eligibility test",
        why: "The floor admits members at one order or more, so the test is >= 1. Flipping to < would demand zero-order members, who do not exist.",
      },
    ],
    distractors: ["8", "5", "<"],
    walkthrough:
      "ROW_NUMBER with an alphabetical tiebreak deals the ladder out deterministically: Alice 1, Emma 2, Grace 3, Maya 4, Chloe 5, then the four-order quad fills rows 6 through 9 in name order — Isabella, Keiko, Noah, Pedro. Row 9 is Pedro Alvarez with four orders. DENSE_RANK thinking would mislead here: the quad all shares one line, but ordinals never tie. The ninth row belongs to Pedro.",
  },
  {
    id: "cs-1455",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The three-order pair's line",
    brief:
      "From: Growth lead. Re: the density overlay.\n\nThe engagement deck overlays the gapless ladder on the skipping one, and the three-order pair is the hinge. Read the pair's dense line and watch the compression do its work.",
    ask: "Which dense-rank line do the three-order members share?",
    template: `SELECT name, n, drk FROM (
  SELECT c.name, COUNT(o.id) AS n, {1}() OVER (ORDER BY COUNT(o.id) {3}) AS drk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE drk = {2};`,
    slots: [
      {
        answer: "DENSE_RANK",
        kind: "keyword",
        label: "the gapless ranker",
        why: "DENSE_RANK compresses ties so the pair shares one line with no hole after it. RANK would skip to 10 and ROW_NUMBER would split the pair.",
      },
      {
        answer: "7",
        kind: "number",
        label: "the expected line",
        why: "Under the gapless reading the counts stack 1 through 5, then the quad takes 6 and the pair takes 7. The overlay's hinge sits exactly there.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Heaviest engagement first keeps both ladders comparable. Ascending would invert every line and park the pair on a different number.",
      },
    ],
    distractors: ["RANK", "ROW_NUMBER", "8"],
    walkthrough:
      "The gapless ladder counts distinct order totals: 24, 17, 14, 13 and 5 take lines 1 through 5, the four-order quad takes 6, and the three-order pair of Farid and Hiro takes line 7. RANK would print 10 for the same pair because the quad's tie burns a line, and ROW_NUMBER would deal them 10 and 11 separately. The overlay's hinge: dense line 7.",
  },
  {
    id: "cs-1456",
    tier: "easy",
    topic: "t5",
    universe: "catalog",
    title: "The two-product shelf line",
    brief:
      "From: Catalog ops. Re: the category ladder.\n\nThe merchandising ladder ranks categories by products carried, and the two-product shelves want their line named. Build the ladder with a skipping ranker and read where the pair-sized shelves land.",
    ask: "Which rank line do the two-product categories share?",
    template: `SELECT category, n, rk FROM (
  SELECT category, COUNT(*) AS n, {1}() OVER (ORDER BY COUNT(*) {3}) AS rk
  FROM products
  GROUP BY category)
WHERE rk = {2};`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the skipping ranker",
        why: "RANK gives the three-way tie at three products one line and skips forward, which pushes the two-product shelves to line 4. DENSE_RANK would compress them to 2.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the shared shelf line",
        why: "After the 3-product trio takes line 1, the skip lands the 2-product shelves on 4. Line 1 would catch the trio and line 7 the lone Fitness shelf.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Widest benches first is the merchandising read. Ascending would start at the one-product shelf and reshuffle every line.",
      },
    ],
    distractors: ["DENSE_RANK", "ROW_NUMBER", "1"],
    walkthrough:
      "Three categories carry three products each — Accessories, Audio, Electronics — so RANK parks all of them on line 1. The two-product shelves, Apparel, Video and Wearables, share the next line at 4 after the skip, and Fitness's single product takes 7. DENSE_RANK would read 1, 2, 3 with no holes, and ROW_NUMBER would deal each shelf a private ordinal. The two-product line: rank 4.",
  },
  {
    id: "cs-1457",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The bronze month",
    brief:
      "From: Growth lead. Re: the revenue podium.\n\nThe board deck needs the revenue podium's third step named. Rank the months by revenue and read which month takes bronze on the ladder.",
    ask: "Which month holds rank 3 on the monthly revenue ladder?",
    template: `SELECT mo, rev, rk FROM (
  SELECT strftime('{3}', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    RANK() OVER (ORDER BY SUM(total) {2}) AS rk
  FROM orders GROUP BY mo)
WHERE rk = {1};`,
    slots: [
      {
        answer: "3",
        kind: "number",
        label: "the bronze line",
        why: "The podium's third step is rank 3. Rank 4 would name October and rank 1 the January peak — each one step off the ask.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "Richest month first is how a podium reads. Ascending would crown the leanest month and hand bronze to a winter trough.",
      },
      {
        answer: "%Y-%m",
        kind: "keyword",
        label: "the month grain",
        why: "The podium compares calendar months, so the bucket is %Y-%m. The %Y grain would collapse everything into two years and leave rank 3 empty.",
      },
    ],
    distractors: ["4", "ASC", "%Y"],
    walkthrough:
      "Ranked by revenue, January's 3731.97 takes gold and February's 3609.64 silver; bronze goes to September at 3116.04. October's 2975.67 just misses the podium at rank 4. Switching the grain to %Y would flatten the board to two rows and the bronze inquiry would come back empty. The revenue podium's third step: September 2024.",
  },
  {
    id: "cs-1458",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The thirteenth spender",
    brief:
      "From: Growth lead. Re: the long-tail slice.\n\nThe tail study wants the member sitting exactly thirteenth on the spend ladder, with a guard that the read stays above water. Number the ladder and pull row thirteen.",
    ask: "Which member sits at row 13 of the spend ladder, and at what spend?",
    template: `SELECT name, spend, rn FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE rn = {1} AND spend {2} {3};`,
    slots: [
      {
        answer: "13",
        kind: "number",
        label: "the tail row",
        why: "The study pins row 13 of sixteen. Row 12 would name Chloe and row 14 Dmitri — each one seat off the target.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the waterline test",
        why: "The guard keeps members above zero spend, which every ladder row clears. Flipping to < would demand negative spend and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the waterline level",
        why: "Zero is the natural waterline — the ladder's floors are all positive. A 5000 waterline would drown the tail rows the study needs.",
      },
    ],
    distractors: ["800", "<", "5000"],
    walkthrough:
      "The spend ladder runs Alice 7262.35 down to Olivia 444.80, and row 13 is Liam O'Brien at 705.39 — fourteen euros clear of Jamal behind him. The zero waterline keeps every member in play; a 5000 line would cut the read back to the podium. Chloe sits one seat higher at 2667.93, Dmitri one lower at 599.26. The thirteenth spender: Liam, 705.39.",
  },
  {
    id: "cs-1459",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "Europe's fifth spender",
    brief:
      "From: Growth lead. Re: the regional slice.\n\nThe regional deck slices the spend ladder to Europe and needs its fifth seat named. Scope the ladder to the region and read row five.",
    ask: "Which EU member sits at row 5 of the regional spend ladder?",
    template: `SELECT name, spend, rn FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) {3}) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  WHERE c.region = {1}
  GROUP BY c.id)
WHERE rn = {2};`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the regional scope",
        why: "The deck slices Europe's eight members. APAC would run the same ladder over its five and name Hiro at the fifth seat instead.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the requested seat",
        why: "The ask pins seat 5 of the regional ladder. Seat 4 would name Isabella and seat 6 Liam — one rung off either way.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Biggest spender first is the regional read. Ascending would count up from Olivia's floor and hand seat 5 to Isabella.",
      },
    ],
    distractors: ["'APAC'", "4", "ASC"],
    walkthrough:
      "Europe's ladder reads Alice 7262.35, Chloe 2667.93, Pedro 1686.17, Isabella 985.65, then Noah Meyer at 737.68 — the fifth seat, twenty-eight euros clear of Liam behind him. The APAC slice would put Hiro Tanaka in the same seat with 829.09, which is why the regional scope must be pinned. Europe's fifth spender: Noah, 737.68.",
  },
  {
    id: "cs-1460",
    tier: "easy",
    topic: "t5",
    universe: "supplier",
    title: "The third-rated bench",
    brief:
      "From: Supplier audit. Re: the quality ladder.\n\nThe sourcing review ranks the six benches by rating and wants the third step named. Number the quality ladder and read who holds the bronze seat.",
    ask: "Which supplier holds row 3 of the rating ladder?",
    template: `SELECT name, rating, rn FROM (
  SELECT name, rating, ROW_NUMBER() OVER (ORDER BY {3} {2}) AS rn
  FROM suppliers)
WHERE rn = {1};`,
    slots: [
      {
        answer: "3",
        kind: "number",
        label: "the bronze seat",
        why: "The review pins the third-highest rating. Seat 2 would name Nordic Gadgets and seat 4 Shenzhen Electro — one step off either way.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the quality direction",
        why: "Highest rating first is how a quality ladder reads. Ascending would start at Pacific's 3.9 and hand the bronze seat to Shenzhen.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the ranking measure",
        why: "The ladder ranks on rating. Ranking on price would reshuffle the benches entirely and put Alpine Audio in the bronze seat.",
      },
    ],
    distractors: ["2", "ASC", "price"],
    walkthrough:
      "The quality ladder reads Alpine Audio 4.8, Nordic Gadgets 4.6, then Midwest Hardware Co at 4.4 — the bronze seat. Shenzhen's 4.1 and Pacific's 3.9 trail behind. Ranking on price instead would flip the podium to Nordic's 199.99 flagship and land Alpine in third. The third-rated bench: Midwest Hardware Co, 4.4.",
  },
  {
    id: "cs-1461",
    tier: "medium",
    topic: "t5",
    universe: "inventory",
    title: "The thirteenth-thinnest shelf",
    brief:
      "From: Inventory count. Re: the stock ladder.\n\nThe count crew walks the shelves thinnest-first and wants the thirteenth stop named. Read the stock ladder bottom-up and pull row thirteen.",
    ask: "Which product sits at row 13 of the stock ladder read thinnest-first?",
    template: `SELECT name, stock, rn FROM (
  SELECT name, stock, ROW_NUMBER() OVER (ORDER BY {3} {2}) AS rn
  FROM products)
WHERE rn = {1};`,
    slots: [
      {
        answer: "13",
        kind: "number",
        label: "the count stop",
        why: "The crew pins the thirteenth stop of sixteen. Stop 12 would find the yoga mat and stop 14 the extended desk mat — one shelf off either way.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the thinnest-first direction",
        why: "The walk starts at the thinnest shelf, so stock sorts ascending. Descending would start at the 500-piece HDMI shelf and land the walk on the webcam.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the count measure",
        why: "The walk counts pieces on shelves, so the measure is stock. Sorting on price would route the crew to the mic at 119 instead.",
      },
    ],
    distractors: ["12", "DESC", "price"],
    walkthrough:
      "Thinnest-first the shelves run Smart Watch 40, Desktop Mic 45, Headset 60, Webcam 70, Hub 85, Band 95, Jersey 110, Keyboard 120, Ring Light 150, Stand 180, Speaker 210, Yoga Mat 220 — and the thirteenth stop is the Desk Mat Extended at 260 pieces. Walking by price instead would route the crew to the Studio Desktop Mic. The thirteenth-thinnest shelf: Desk Mat Extended, 260.",
  },
  {
    id: "cs-1462",
    tier: "hard",
    topic: "t5",
    universe: "funnel",
    title: "The shipped lane's bronze ticket",
    brief:
      "From: Fulfillment. Re: the lane podiums.\n\nEach status lane keeps its own ticket podium, and fulfillment wants the shipped lane's bronze. Rank tickets inside the lane and read the third seat.",
    ask: "Which shipped ticket takes the lane's third-biggest seat, and whose is it?",
    template: `SELECT name, total, rn FROM (
  SELECT c.name, o.total,
    ROW_NUMBER() OVER (PARTITION BY o.status ORDER BY o.total {3}) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE o.status = {1})
WHERE rn = {2};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the lane scope",
        why: "The podium belongs to the shipped lane. The delivered lane would put Pedro's 668.45 in the same seat — a different podium entirely.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the bronze seat",
        why: "The ask pins the third-biggest ticket. Seat 2 would name Grace's 826.03 and seat 1 Emma's 845.92 — one step off the podium either way.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "Biggest ticket first is how a lane podium reads. Ascending would count up from the smallest shipment and hand bronze to a minor parcel.",
      },
    ],
    distractors: ["'delivered'", "2", "ASC"],
    walkthrough:
      "Inside the shipped lane the podium reads Emma 845.92, Grace 826.03, then Emma again at 785.79 — the bronze seat. The delivered lane's bronze is Pedro's 668.45, which is why the lane scope has to be pinned before reading. Ascending would hand the seat to one of the lane's small parcels. The shipped lane's bronze ticket: Emma Wilson, 785.79.",
  },
  {
    id: "cs-1463",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The floor of the top five",
    brief:
      "From: Growth lead. Re: the VIP threshold.\n\nThe VIP program wants a floor set at the weakest member of the current top five. Show the five-rung head of the spend ladder and read where the floor sits.",
    ask: "What is the smallest spend among the top five members?",
    template: `SELECT name, spend, rk FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
    RANK() OVER (ORDER BY SUM(o.total) {3}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE rk {2} {1};`,
    slots: [
      {
        answer: "5",
        kind: "number",
        label: "the VIP depth",
        why: "The program's current cohort is five deep, so the ladder stops at rank 5. Stopping at 4 would raise the floor to Maya's 3644.56 and misprice the tier.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the inclusion test",
        why: "The top five includes the fifth seat, so the test is <= 5. A strict < would evict the very member whose spend sets the floor.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "Biggest spend first puts the head of the ladder on ranks 1 through 5. Ascending would rank the tail instead and floor the cohort at Olivia.",
      },
    ],
    distractors: ["4", ">", "ASC"],
    walkthrough:
      "The ladder's head runs Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93 — five seats, and the floor is Chloe's 2667.93. A strict inequality would drop Chloe and pretend the floor is Maya's 3644.56, overpricing the tier by nearly a thousand. The VIP floor for a five-deep cohort: 2667.93.",
  },
  {
    id: "cs-1464",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "Above the five-order line",
    brief:
      "From: Growth lead. Re: the engagement cutoff.\n\nThe re-engagement flow fires for anyone ranked above the five-order specialist. Build the order ladder, find the five-order line, and count who sits above it.",
    ask: "How many members rank above the five-order line on the order ladder?",
    template: `SELECT {3}(*) AS above FROM (
  SELECT c.name, COUNT(o.id) AS n, RANK() OVER (ORDER BY COUNT(o.id) DESC) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE rk {2} {1};`,
    slots: [
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the five-order line",
        why: "Chloe's five orders hold rank 5, so the cutoff is the rank itself. A cutoff of 6 would sweep the four-order quad inside and overcount the flow.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the above test",
        why: "Above the line means strictly better ranks, so the test is < 5. Including the line with <= would count Chloe against her own cutoff.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census fold",
        why: "The flow needs a headcount, so the fold is COUNT. SUM would add the ranks themselves and return a meaningless 10.",
      },
    ],
    distractors: ["6", "<=", "SUM"],
    walkthrough:
      "The order ladder's five-order line belongs to Chloe at rank 5, and above her sit exactly four members: Alice at 24 orders, Emma at 17, Grace at 14, Maya at 13. A cutoff of 6 would wrongly include the four-order quad, and an inclusive test would count Chloe against herself. The re-engagement flow fires for 4 members.",
  },
  {
    id: "cs-1465",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "The one-order pair's line",
    brief:
      "From: Growth lead. Re: the ladder's last line.\n\nThe tail of the engagement ladder matters for win-back: the members with a single order. Read which line the skipping ranker gives their shared rung.",
    ask: "Which rank line does the one-order pair share on the order ladder?",
    template: `SELECT name, n, rk FROM (
  SELECT c.name, COUNT(o.id) AS n, {1}() OVER (ORDER BY COUNT(o.id) {3}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id)
WHERE n = {2}
ORDER BY rk, name;`,
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the skipping ranker",
        why: "RANK lets the ties below burn lines so the pair lands on 15. DENSE_RANK would compress them to 9 and ROW_NUMBER would split the pair.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the tail order count",
        why: "The win-back targets single-order members. Filtering at 2 would catch the two-order trio at line 12 instead of the tail.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "The engagement ladder reads heaviest first, which puts the tail at the bottom lines. Ascending would hand the pair line 1 and invert the story.",
      },
    ],
    distractors: ["DENSE_RANK", "ROW_NUMBER", "2"],
    walkthrough:
      "Below the two-order trio at 12, the ladder reaches its floor: Liam and Olivia each placed a single order, and RANK hands both line 15 — the skips at the quad, the pair and the trio burned lines 7 through 11 and 13 and 14. DENSE_RANK would call the same pair line 9; ROW_NUMBER would deal 15 and 16 separately. The one-order pair shares rank line 15.",
  },
  {
    id: "cs-1466",
    tier: "easy",
    topic: "t6",
    universe: "funnel",
    title: "The cancelled lane's crown",
    brief:
      "From: Refund audit. Re: the lane crowns.\n\nEvery status lane has a biggest ticket, and the refund audit wants the cancelled lane's crown priced. Partition the tickets by lane and read the ceiling of the cancelled one.",
    ask: "Which cancelled ticket is the lane's biggest, and whose is it?",
    template: `SELECT name, total FROM (
  SELECT o.status, c.name, o.total,
    {2}(o.total) OVER (PARTITION BY {3}) AS top
  FROM orders o JOIN customers c ON c.id = o.customer_id)
WHERE status = {1} AND total = top;`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the lane scope",
        why: "The audit prices the cancelled lane. Scoping to pending would crown Farid's 1088.44 instead — a live lane, not a cancelled one.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "The crown is the biggest ticket, so the fold is MAX. MIN would dig up the lane's 25.47 floor instead.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the lane partition",
        why: "Crowns are per-lane, so the partition is status. Partitioning by order date would give every ticket a lane of its own and crown all seven.",
      },
    ],
    distractors: ["'pending'", "MIN", "o.created_at"],
    walkthrough:
      "Partitioned by status, the cancelled lane's biggest ticket is Keiko Sato's 397.99 — comfortably above the lane's next ticket at 206.19. The MIN fold would surface the lane floor at 25.47, and a customer partition would turn one crown into several personal bests. The cancelled lane's crown: 397.99, Keiko Sato.",
  },
  {
    id: "cs-1467",
    tier: "easy",
    topic: "t6",
    universe: "funnel",
    title: "The delivered lane's floor",
    brief:
      "From: Fulfillment. Re: the lane floors.\n\nPackaging wants to know the smallest ticket it actually delivered, as the floor case for the parcel study. Partition by lane and read the delivered lane's minimum.",
    ask: "Which delivered ticket is the lane's smallest, and whose is it?",
    template: `SELECT name, total FROM (
  SELECT o.status, c.name, o.total,
    {2}(o.total) OVER (PARTITION BY {3}) AS low
  FROM orders o JOIN customers c ON c.id = o.customer_id)
WHERE status = {1} AND total = low;`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the lane scope",
        why: "The study reads the delivered lane. Scoping to pending would floor at 148.28 — a lane that has not shipped at all.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "The floor is the smallest ticket, so the fold is MIN. MAX would crown Bruno's 752.96 instead of flooring the lane.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the lane partition",
        why: "Floors are per-lane, so the partition is status. Partitioning by order date would give every ticket a lane of its own and floor all fifty-two.",
      },
    ],
    distractors: ["'pending'", "MAX", "o.created_at"],
    walkthrough:
      "Partitioned by status, the delivered lane's smallest ticket is 30.24 — the lane floor, far below the 752.96 crown Bruno set. The MAX fold would read the ceiling instead, and a customer partition would scatter the answer across a dozen personal floors. The delivered lane's floor ticket: 30.24.",
  },
  {
    id: "cs-1468",
    tier: "easy",
    topic: "t6",
    universe: "supplier",
    title: "The Pacific bench count",
    brief:
      "From: Supplier audit. Re: the bench sizes.\n\nThe audit stamps every product with the size of the bench that built it. Partition the catalog by supplier, scope to Pacific Textiles, and read the bench size.",
    ask: "How many products does the Pacific Textiles bench carry?",
    template: `SELECT product, bench FROM (
  SELECT p.name AS product, s.name AS supplier, {2}(*) OVER (PARTITION BY {3}) AS bench
  FROM products p JOIN suppliers s ON s.id = p.supplier_id)
WHERE supplier = {1};`,
    slots: [
      {
        answer: "'Pacific Textiles'",
        kind: "keyword",
        label: "the bench scope",
        why: "The read targets Pacific Textiles. Scoping to Alpine Audio would size a two-product bench instead of Pacific's.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench fold",
        why: "Bench size is a headcount of products, so the fold is COUNT. MAX cannot count rows at all and would not run.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the bench partition",
        why: "Benches are per-supplier, so the partition is the supplier key. Partitioning by category would count Pacific's products per category instead.",
      },
    ],
    distractors: ["'Alpine Audio GmbH'", "MAX", "p.category"],
    walkthrough:
      "Partitioned by supplier, every Pacific Textiles row carries the same bench stamp: 3 products — the jersey, the socks and their third listing. Alpine's bench holds 2, and a category partition would slice Pacific's own rows by shelf instead of by maker. The Pacific Textiles bench: 3 products.",
  },
  {
    id: "cs-1469",
    tier: "easy",
    topic: "t6",
    universe: "catalog",
    title: "The Wearables stock pot",
    brief:
      "From: Inventory count. Re: the shelf pots.\n\nThe count sheet stamps every product with its category's total stock. Partition the catalog by category, scope to Wearables, and read the pot.",
    ask: "What is the combined stock of the Wearables category?",
    template: `SELECT name, pot FROM (
  SELECT name, category, {2}(stock) OVER (PARTITION BY {3}) AS pot
  FROM products)
WHERE category = {1};`,
    slots: [
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the shelf scope",
        why: "The read targets the Wearables shelf. Scoping to Video would stamp a 220-piece pot — a different shelf entirely.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "A pot is a total, so the fold is SUM. AVG would halve the read to 67.5 and MAX would only lift the biggest single listing.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf partition",
        why: "Pots are per-category, so the partition is category. A supplier partition would split Wearables into two maker-level pots.",
      },
    ],
    distractors: ["'Video'", "AVG", "supplier_id"],
    walkthrough:
      "Partitioned by category, both Wearables rows carry the same stamp: the 95-piece fitness band plus the 40-piece smart watch make a 135-piece pot. The AVG fold would read 67.5 per listing, and a supplier partition would break the pot into 95 and 40. The Wearables shelf pot: 135 pieces.",
  },
  {
    id: "cs-1470",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Europe's open invoice pot",
    brief:
      "From: Billing ops. Re: the collection sheet.\n\nThe close stamps every open invoice with its region's total exposure. Partition the invoices by region, scope to Europe's open bills, and read the pot.",
    ask: "What is Europe's total open-invoice exposure in cents?",
    template: `SELECT number, pot FROM (
  SELECT i.number, c.region, {2}(i.amount_cents) OVER (PARTITION BY {3}) AS pot
  FROM invoices i JOIN customers c ON c.id = i.customer_id
  WHERE i.status = {1})
WHERE region = 'EU';`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the ledger status",
        why: "Exposure means unpaid bills, so the status is open. Scoping to paid would read the settled pot of 3233600 instead.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure fold",
        why: "Exposure is a total across bills, so the fold is SUM. MAX would lift only the biggest single invoice on the sheet.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the region partition",
        why: "The collection sheet rolls up by region, so the partition is the customer's region. A city partition would shred Europe's pot into five city-level pots.",
      },
    ],
    distractors: ["'paid'", "MAX", "c.city"],
    walkthrough:
      "Partitioned by region, each of Europe's five open invoices carries the same stamp: 1467200 cents — a 14672-euro exposure waiting on collections. The paid ledger holds 3233600, and a city partition would split the exposure into per-city pots. Europe's open-invoice exposure: 1467200 cents.",
  },
  {
    id: "cs-1471",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "The US members' shared pot",
    brief:
      "From: Growth lead. Re: the regional pots.\n\nThe deck carries each member's row with their region's whole pot riding along. Group the members per region, partition the pot, scope to the US, and read what the two members share.",
    ask: "What combined spend do the US members share, stamped on their rows?",
    template: `SELECT name, pot FROM (
  SELECT c.name, c.region, {2}(SUM(o.total)) OVER (PARTITION BY {3}) AS pot
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id)
WHERE region = {1};`,
    slots: [
      {
        answer: "'US'",
        kind: "keyword",
        label: "the regional scope",
        why: "The read targets the US pair. Scoping to LATAM would stamp Bruno's solo 852.44 pot instead of the US duo's.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "The pot is the region's total across members, so the fold is SUM over the grouped spends. MAX would lift only Emma's personal 6640.56.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the pot partition",
        why: "The pot is shared per region, so the partition is region. A city partition would split the duo into Austin and Chicago pots.",
      },
    ],
    distractors: ["'LATAM'", "MAX", "c.city"],
    walkthrough:
      "Grouped per member and partitioned by region, both US rows carry the same stamp: Emma's 6640.56 plus Jamal's 645.60 make a 7286.16 pot. The MAX fold would only echo Emma's personal total, and a city partition would split the pair into two private pots. The US members' shared pot: 7286.16.",
  },
  {
    id: "cs-1472",
    tier: "hard",
    topic: "t6",
    universe: "month-close",
    title: "The wire ledger's pot",
    brief:
      "From: Billing ops. Re: the method pots.\n\nThe treasury sheet stamps every payment with its method's running-of-the-full pot. Partition the payments by method, scope to wire, and read the pot every row carries.",
    ask: "What total have wire payments settled, in cents?",
    template: `SELECT paid_on, amount_cents, pot FROM (
  SELECT paid_on, amount_cents, method, {2}(amount_cents) OVER (PARTITION BY {3}) AS pot
  FROM payments)
WHERE method = {1};`,
    slots: [
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the method scope",
        why: "The read targets the wire method. Scoping to card would stamp a 3736400-cent pot — the bigger rail.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "The pot is everything the method has settled, so the fold is SUM. MAX would lift only the single biggest wire transfer.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "the rail partition",
        why: "Pots are per-method, so the partition is the payment method. An invoice partition would dice the ledger into per-invoice fragments.",
      },
    ],
    distractors: ["'card'", "MAX", "invoice_id"],
    walkthrough:
      "Partitioned by method, every wire row carries the same stamp: 3224800 cents settled across the wire rail — about 32248 euros. The card rail holds 3736400, and an invoice partition would shred the ledger into per-bill fragments. The wire method's settled pot: 3224800 cents.",
  },
  {
    id: "cs-1473",
    tier: "hard",
    topic: "t6",
    universe: "catalog",
    title: "The Video shelf's ceiling",
    brief:
      "From: Catalog ops. Re: the shelf ceilings.\n\nThe catalog sheet stamps every product with its category's ceiling on the chosen measure. Scope to the Video shelf, fold the ceiling on stock, and read what the pair shares.",
    ask: "What is the biggest stock any Video product holds?",
    template: `SELECT name, top FROM (
  SELECT name, {2}({3}) OVER (PARTITION BY category) AS top
  FROM products
  WHERE category = {1});`,
    slots: [
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the shelf scope",
        why: "The read targets the Video shelf. Scoping to Audio would stamp a 210-piece ceiling from the speaker — a different shelf.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "A ceiling is the biggest value, so the fold is MAX. MIN would floor the shelf at the webcam's 70 pieces instead.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the ceiling measure",
        why: "The study ceilings on stock, so the measure is stock. Ceilinging on price would stamp 129 — the webcam's tag, not its shelf count.",
      },
    ],
    distractors: ["'Audio'", "MIN", "price"],
    walkthrough:
      "Partitioned by category, both Video rows carry the same stamp: the ring light's 150 pieces is the shelf's stock ceiling, over the webcam's 70. The MIN fold would read the floor, and a price ceiling would stamp 129 from the webcam's tag. The Video shelf's stock ceiling: 150 pieces.",
  },
  {
    id: "cs-1474",
    tier: "medium",
    topic: "t6",
    universe: "refund-audit",
    title: "The cancelled lane's damage",
    brief:
      "From: Refund audit. Re: the lane damage bill.\n\nThe audit stamps every cancelled ticket with the lane's total damage. Partition by lane, scope to cancelled, and read the combined hit.",
    ask: "What is the combined value of the cancelled orders, in euros?",
    template: `SELECT total, pot FROM (
  SELECT status, total, {2}(total) OVER (PARTITION BY {3}) AS pot
  FROM orders)
WHERE status = {1};`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the lane scope",
        why: "The damage bill reads the cancelled lane. Scoping to pending would read a 6113-euro pipeline that can still convert.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the damage fold",
        why: "Damage is the lane total, so the fold is SUM. AVG would read the mean ticket of 164.64 and hide the scale of the hit.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the lane partition",
        why: "Damage bills are per-lane, so the partition is status. An order-date partition would give every ticket its own lane and stamp seven private totals.",
      },
    ],
    distractors: ["'pending'", "AVG", "created_at"],
    walkthrough:
      "Partitioned by status, each of the seven cancelled tickets carries the same stamp: 1152.49 euros of lost revenue in the lane. The pending lane's 6113 is pipeline, not damage, and the AVG fold would shrink the story to a 164.64 mean. The cancelled lane's damage: 1152.49 euros.",
  },
  {
    id: "cs-1475",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "The regional crown roll call",
    brief:
      "From: Growth lead. Re: the crown count.\n\nEach region crowns its biggest spender, and the deck wants the roll call of crowns. Rank members inside their region, isolate rank one, and count who holds a crown.",
    ask: "How many regional crowns are there in total?",
    template: `SELECT region, name, spend, rk FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
    RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {3}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id)
WHERE rk = {1}
LIMIT {2};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        label: "the crown line",
        why: "A crown is the region's rank 1. Line 2 would catch the runners-up — Maya, Chloe and Jamal — instead of the crown holders.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the roll-call cap",
        why: "Four regions mean four crowns, so a cap of 4 shows the full roll call. A cap of 3 would truncate the last region's crown.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown direction",
        why: "Crowns go to the biggest spender, so the ladder sorts descending. Ascending would crown the regional floors instead.",
      },
    ],
    distractors: ["2", "3", "ASC"],
    walkthrough:
      "Ranked inside their regions, the crowns go to Grace in APAC, Alice in Europe, Bruno in LATAM and Emma in the US — four regions, four crowns. The runner-up line would name Maya, Chloe and Jamal, and ascending would crown the floors like Olivia. The regional crown roll call: 4 holders.",
  },
  {
    id: "cs-1476",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "The regional bronze seats",
    brief:
      "From: Growth lead. Re: the depth report.\n\nThe deck asks how deep each regional bench runs: which regions even have a third-biggest spender? Rank inside regions, isolate line three, and keep only the solvency floor.",
    ask: "Which members hold rank 3 in their region, and at what spend?",
    template: `SELECT region, name, spend, rk FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
    RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {2}) AS rk
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id)
WHERE rk = {1} AND spend {3} {4};`,
    slots: [
      {
        answer: "3",
        kind: "number",
        label: "the bronze line",
        why: "The depth report reads each region's third seat. Line 2 would catch the runners-up and line 5 only APAC's and Europe's fifth seats.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the bench direction",
        why: "Bench depth reads biggest-first, so the ladder sorts descending. Ascending would hand the bronze seats to the regional tail.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the solvency test",
        why: "The floor keeps spenders above zero, which every bronze seat clears. Flipping to < would demand negative spend and empty the report.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the floor level",
        why: "Zero is the natural solvency floor — every seat is positive. A 5000 floor would evict both bronze seats the report needs.",
      },
    ],
    distractors: ["5000", "ASC", "<"],
    walkthrough:
      "Ranked inside their regions, the bronze seats belong to Farid in APAC at 1458.97 and Pedro in Europe at 1686.17 — the US and LATAM lanes are too shallow to field a third. The runner-up line would name Maya, Chloe and Jamal, and ascending would seat the regional tail instead. The regional bronze roll: Farid and Pedro.",
  },
  {
    id: "cs-1477",
    tier: "medium",
    topic: "t6",
    universe: "funnel",
    title: "The delivered lane's runner-up",
    brief:
      "From: Fulfillment. Re: the lane podiums.\n\nThe delivered lane keeps its own ticket podium, and ops wants the silver seat named. Rank the lane's tickets and read the second-biggest.",
    ask: "Which delivered ticket takes the lane's second-biggest seat, and whose is it?",
    template: `SELECT name, total, rn FROM (
  SELECT o.status, c.name, o.total,
    ROW_NUMBER() OVER (PARTITION BY {3} ORDER BY o.total {4}) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id)
WHERE status = {1} AND rn = {2};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the lane scope",
        why: "The podium belongs to the delivered lane. The shipped lane would put Grace's 826.03 in the silver seat instead.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the silver seat",
        why: "The ask pins the second-biggest ticket. Seat 1 would crown Bruno's 752.96 and seat 3 Pedro's 668.45.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the lane partition",
        why: "Podiums are per-lane, so the partition is status. A customer partition would rank each buyer against their own tickets instead of the lane.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the podium direction",
        why: "Biggest first is how a podium reads. Ascending would count up from the lane's smallest parcel and seat a minor order.",
      },
    ],
    distractors: ["'shipped'", "1", "o.customer_id", "ASC"],
    walkthrough:
      "Inside the delivered lane the podium reads Bruno 752.96, then Alice at 705.23 — the silver seat — then Pedro 668.45. The shipped lane's silver belongs to Grace, and a customer partition would rank buyers against themselves. The delivered lane's runner-up ticket: Alice Chen, 705.23.",
  },
  {
    id: "cs-1478",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "The bottom-half regional crown",
    brief:
      "From: Growth lead. Re: the halves study.\n\nEach region splits into a stronger and a weaker half, and the deck wants the best spender living in a weaker half. Tile the members per region, keep the bottom tiles, and read the crown.",
    ask: "Which spend is the biggest among the members in their region's weaker half?",
    template: `SELECT region, name, spend, q FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
    NTILE(2) OVER (PARTITION BY {3} ORDER BY SUM(o.total) {2}) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, c.id)
WHERE q = {1};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        label: "the weaker tile",
        why: "NTILE(2) tiles each region into halves; tile 2 is the weaker one. Tile 3 does not exist under a two-way split and would empty the read.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the tile direction",
        why: "Biggest-first tiling puts the stronger members in tile 1, so the weaker half is tile 2. Ascending would flip the tiles and crown Alice.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the tiling partition",
        why: "Halves are per-region, so the partition is region. A city partition would leave every member alone in their tile — no weaker half at all.",
      },
    ],
    distractors: ["3", "ASC", "c.city"],
    walkthrough:
      "Tiled per region, the weaker halves hold Keiko and Hiro in APAC, Noah, Liam, Dmitri and Olivia in Europe, and Jamal in the US — seven members. The strongest among them is Keiko Sato at 1098.60. Ascending tiling would flip the halves and crown Alice, and a city partition would dissolve the halves entirely. The bottom-half crown: Keiko, 1098.60.",
  },
  {
    id: "cs-1479",
    tier: "easy",
    topic: "t6",
    universe: "pricing",
    title: "The Apparel price crown",
    brief:
      "From: Pricing review. Re: the shelf ceilings.\n\nThe pricing sheet stamps every product with its category's price ceiling. Scope to the Apparel shelf, fold the ceiling on price, and read the tag the pair shares.",
    ask: "What is the highest price on the Apparel shelf?",
    template: `SELECT name, top FROM (
  SELECT name, {2}({3}) OVER (PARTITION BY category) AS top
  FROM products
  WHERE category = {1});`,
    slots: [
      {
        answer: "'Apparel'",
        kind: "keyword",
        label: "the shelf scope",
        why: "The read targets the Apparel shelf. Scoping to Fitness would stamp a 32-euro crown from its single listing.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "A price ceiling is the biggest tag, so the fold is MAX. MIN would floor the shelf at the socks' 18.50.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the ceiling measure",
        why: "The sheet ceilings on price, so the measure is price. Ceilinging on stock would stamp 400 — the socks' shelf count, not a tag.",
      },
    ],
    distractors: ["'Fitness'", "MIN", "stock"],
    walkthrough:
      "Partitioned by category, both Apparel rows carry the same stamp: the cycling jersey's 65-euro tag is the shelf ceiling over the socks' 18.50. The MIN fold would read the floor, and a stock ceiling would stamp the socks' 400 pieces. The Apparel price crown: 65 euros.",
  },
  {
    id: "cs-1480",
    tier: "medium",
    topic: "t6",
    universe: "funnel",
    title: "Alice's order bench",
    brief:
      "From: Growth lead. Re: the bench stamps.\n\nThe engagement sheet stamps every order with how many orders its buyer has placed in total. Partition the orders by buyer, scope to Alice, and read her bench stamp.",
    ask: "How many orders has Alice Chen placed in total?",
    template: `SELECT created_at, bench FROM (
  SELECT c.name, o.created_at, {2}(*) OVER (PARTITION BY {3}) AS bench
  FROM orders o JOIN customers c ON c.id = o.customer_id)
WHERE name = {1};`,
    slots: [
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the buyer scope",
        why: "The read targets Alice's rows. Scoping to Emma would stamp a 17-order bench — a different buyer.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench fold",
        why: "A bench is a headcount of orders, so the fold is COUNT. MAX cannot count rows and would not run.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the bench partition",
        why: "Benches are per-buyer, so the partition is the customer key. A status partition would count Alice's orders per lane instead.",
      },
    ],
    distractors: ["'Emma Wilson'", "MAX", "o.status"],
    walkthrough:
      "Partitioned by buyer, all 24 of Alice's order rows carry the same stamp: a 24-order bench, the deepest on the roster. Emma's bench reads 17, and a status partition would slice Alice's orders across her lanes instead. Alice's bench stamp: 24 orders.",
  },
  {
    id: "cs-1481",
    tier: "easy",
    topic: "t7",
    universe: "growth",
    title: "The padded opening month",
    brief:
      "From: Growth lead. Re: the delta convention.\n\nThe delta report pads the series so the first month has a number to show: the padding treats the pre-history as zero. Pin January, pad the look-back, and read the opening delta.",
    ask: "What opening delta does the zero-padded convention print for January 2024?",
    template: `SELECT mo, delta FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    ROUND(SUM(total) - LAG(SUM(total), 1, {1}) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta
  FROM orders GROUP BY mo)
WHERE mo = {2} AND delta {3} 0;`,
    slots: [
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the pad value",
        why: "The convention pads pre-history with zero, so January's look-back is 0. A 1000 pad would quietly shrink the opening delta to 2731.97.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the opening month",
        why: "The opening delta lives on the series' first month. Pinning 2025-02 would read the closing delta of 721.03 instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the sign test",
        why: "The convention expects a positive opening — the store opened with sales, not refunds. Flipping to < would demand a negative opening and print nothing.",
      },
    ],
    distractors: ["1000", "'2025-02'", "<"],
    walkthrough:
      "LAG with a zero pad gives January a look-back of 0, so the opening delta is the whole month: 3731.97. A 1000 pad would silently rewrite history to 2731.97, and the closing month under the same convention reads just 721.03. The zero-padded opening delta: 3731.97.",
  },
  {
    id: "cs-1482",
    tier: "easy",
    topic: "t7",
    universe: "growth",
    title: "October's next-month read",
    brief:
      "From: Growth lead. Re: the forward look.\n\nThe forecast deck pins what each month's revenue rolled into next. Use the forward-looking offset, keep the calendar order, and read what October rolled into.",
    ask: "What revenue did the month after October 2024 post?",
    template: `SELECT mo, rev, nxt FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    {2}(ROUND(SUM(total), 2)) OVER (ORDER BY strftime('%Y-%m', created_at) {3}) AS nxt
  FROM orders GROUP BY mo)
WHERE mo = {1};`,
    slots: [
      {
        answer: "'2024-10'",
        kind: "keyword",
        label: "the pinned month",
        why: "The read follows October's row. Pinning 2024-06 would read November's 1193.86 — a different month's roll.",
      },
      {
        answer: "LEAD",
        kind: "keyword",
        label: "the forward offset",
        why: "Looking ahead one row is LEAD's job. LAG would look backward and hand October's previous month instead.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar order",
        why: "The series runs in calendar order, so the window sorts ascending. Descending would reverse time and make LEAD read the past.",
      },
    ],
    distractors: ["'2024-06'", "LAG", "DESC"],
    walkthrough:
      "In calendar order, LEAD hands October's row the next month's revenue: November's 1648.80 — the pre-cliff level before the 1326.87 drop. LAG would look backward to September, and a descending window would run time backward and read September too. October's next-month read: 1648.80.",
  },
  {
    id: "cs-1483",
    tier: "easy",
    topic: "t7",
    universe: "growth",
    title: "The June slide",
    brief:
      "From: Growth lead. Re: the summer soften.\n\nThe monthly delta report needs June's move against May named for the summer story. Build the month-over-month deltas and read June's slide.",
    ask: "What was June 2024's revenue change against May?",
    template: `SELECT mo, delta FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    ROUND(SUM(total) - LAG(SUM(total), {2}) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta
  FROM orders GROUP BY mo)
WHERE mo = {1} AND delta {3} 0;`,
    slots: [
      {
        answer: "'2024-06'",
        kind: "keyword",
        label: "the slide month",
        why: "The summer story pins June. Pinning 2024-05 would read May's own move — a gain, not the slide.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the look-back depth",
        why: "A month-over-month delta steps back one row, so the LAG depth is 1. A depth of 2 would compare June to April — a different story.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the slide test",
        why: "A slide means the delta sits below zero, so the test is < 0. Flipping to > would hunt for gains and print nothing for June.",
      },
    ],
    distractors: ["'2024-05'", "2", ">"],
    walkthrough:
      "June's revenue of 2047.43 against May's 2910.31 is a slide of 862.88 euros — the second-deepest fall of the summer after July's. May's own delta was a 441.40 gain, which the sign test correctly refuses. June's slide against May: minus 862.88.",
  },
  {
    id: "cs-1484",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "The two-month swing into July",
    brief:
      "From: Growth lead. Re: the deeper look-back.\n\nThe board wants the two-month view: each month against where it stood two months before, not one. Set the look-back depth, pin July, and read the swing.",
    ask: "What was July 2024's revenue against May's, two months before?",
    template: `SELECT mo, rev, swing FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    ROUND(SUM(total) - LAG(SUM(total), {1}) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS swing
  FROM orders GROUP BY mo)
WHERE mo = {2} AND swing {3} 0;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the look-back depth",
        why: "The board's view is two months deep, so LAG steps back 2 rows. A depth of 1 would compare July to June — the shallow delta instead.",
      },
      {
        answer: "'2024-07'",
        kind: "keyword",
        label: "the pinned month",
        why: "The swing story pins July. Pinning 2024-06 would read June against April — a different row's swing.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the fall test",
        why: "July's story is a fall, so the test keeps negative swings. Flipping to > would hunt for gains and print nothing.",
      },
    ],
    distractors: ["1", "'2024-06'", ">"],
    walkthrough:
      "Two months back from July is May: 2910.31 against July's 1193.86 makes a swing of minus 1716.45 — deeper than any one-month cliff on the books. The one-month depth would read only 853.57, and June's own two-month swing was a milder 421.48. July's two-month swing: minus 1716.45.",
  },
  {
    id: "cs-1485",
    tier: "easy",
    topic: "t7",
    universe: "fraud",
    title: "The silent-stretch census",
    brief:
      "From: Fraud spot-check. Re: the dead-air sweep.\n\nThe sweep counts the stretches where a member went silent for over two months between orders. Lag each order against its predecessor and run the census at the 60-day rail.",
    ask: "How many customer-to-customer order gaps exceed 60 days?",
    template: `SELECT {3} AS big_gaps FROM (
  SELECT customer_id, julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap
  FROM orders)
WHERE gap {2} {1};`,
    slots: [
      {
        answer: "60",
        kind: "number",
        noVerify: true,
        label: "the silence rail",
        why: "Two months of silence is the 60-day rail. A 30-day rail would catch ordinary browsing gaps and overcount the sweep.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the over test",
        why: "Over the rail means strictly greater, so the test is > 60. Flipping to < would count the ordinary gaps instead of the silences.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the gap census",
        why: "The sweep counts silent stretches, so the fold is a row count. Counting distinct customers would collapse 16 stretches into 11 members.",
      },
    ],
    distractors: ["30", "<", "COUNT(DISTINCT customer_id)"],
    walkthrough:
      "Each member's orders lag against their predecessor, and 16 of those gaps stretch past 60 days — Hiro's 299-day silence the deepest of them. The 30-day rail would count 35 ordinary gaps, and a distinct-customer count would report 11 members instead of 16 stretches. Silent stretches over 60 days: 16.",
  },
  {
    id: "cs-1486",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The slow-bill census",
    brief:
      "From: Billing ops. Re: the re-issue sweep.\n\nThe sweep counts the stretches where a customer waited over a quarter between consecutive invoices. Lag each bill against its predecessor per customer and run the census at 90 days.",
    ask: "How many customer invoice gaps exceed 90 days?",
    template: `SELECT COUNT(*) AS slow_bills FROM (
  SELECT customer_id, julianday(issued_on) - LAG(julianday(issued_on)) OVER (PARTITION BY {3} ORDER BY issued_on) AS gap
  FROM invoices)
WHERE gap {2} {1};`,
    slots: [
      {
        answer: "90",
        kind: "number",
        noVerify: true,
        label: "the slow rail",
        why: "A quarter between bills is the 90-day rail. A 60-day rail would count 16 stretches and pad the sweep with ordinary cadence.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the over test",
        why: "Over the rail means strictly greater, so the test is > 90. Flipping to < would count the fast bills instead of the slow ones.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the sequence partition",
        why: "Waiting stretches run per customer, so the lag partitions on the customer key. An invoice partition would leave every gap NULL — nothing to count.",
      },
    ],
    distractors: ["60", "<", "invoice_id"],
    walkthrough:
      "Each customer's invoices lag against their predecessor, and 13 of those waiting stretches pass 90 days — Liam's 196-day wait the deepest. The 60-day rail would count 16, and partitioning by invoice would null every gap and zero the census. Slow stretches over 90 days: 13.",
  },
  {
    id: "cs-1487",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "Hiro's long silence",
    brief:
      "From: Fraud spot-check. Re: the deepest dead air.\n\nThe sweep wants the single longest order-to-order silence named and priced in days. Lag each order against its predecessor, keep the member's worst stretch, and read it.",
    ask: "How long was Hiro Tanaka's longest silence between orders, in days?",
    template: `SELECT name, stretch FROM (
  SELECT c.name, ROUND(MAX(g.gap)) AS stretch
  FROM (SELECT customer_id, julianday(created_at) - LAG(julianday(created_at)) OVER (PARTITION BY customer_id ORDER BY created_at) AS gap FROM orders) g
  JOIN customers c ON c.id = g.customer_id
  WHERE c.name = {1}
  GROUP BY c.id)
WHERE stretch {3} {2};`,
    slots: [
      {
        answer: "'Hiro Tanaka'",
        kind: "keyword",
        label: "the silent member",
        why: "The sweep pins Hiro's history. Pinning Keiko would read her 241-day worst — a different member's silence.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the sanity rail",
        why: "Any real silence clears zero, so the rail only filters empty joins. A 500-day rail would demand a longer silence than anyone's.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the rail test",
        why: "The stretch must clear the rail, so the test is > 0. Flipping to < would hunt for negative time and print nothing.",
      },
    ],
    distractors: ["'Keiko Sato'", "500", "<"],
    walkthrough:
      "Hiro's orders lag against their predecessors and his worst stretch rounds to 299 days — the deepest silence on the roster, ahead of Keiko's 241. A 500-day rail would demand more patience than anyone showed, and the flip test would fish for negative time. Hiro's longest silence: 299 days.",
  },
  {
    id: "cs-1488",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The August expense surge",
    brief:
      "From: Spend report. Re: the cost spike.\n\nThe expense report needs August's jump against July named for the cost review. Build the month-over-month deltas on the spend ledger and read the surge.",
    ask: "By how much did August 2024's expenses exceed July's, in cents?",
    template: `SELECT mo, pot, delta FROM (
  SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) AS pot,
    SUM(amount_cents) - {2}(SUM(amount_cents)) OVER (ORDER BY strftime('%Y-%m', spent_on)) AS delta
  FROM expenses
  WHERE amount_cents > 0
  GROUP BY mo)
WHERE mo = {1} AND delta {3} 0;`,
    slots: [
      {
        answer: "'2024-08'",
        kind: "keyword",
        label: "the spike month",
        why: "The cost review pins August. Pinning 2024-03 would read March's milder 47700-cent step instead.",
      },
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward look",
        why: "A month's jump is measured against the month before, so the look is LAG. LEAD would measure August against September and find a fall.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the surge test",
        why: "A surge means the delta sits above zero, so the test is > 0. Flipping to < would hunt for cost drops and print nothing for August.",
      },
    ],
    distractors: ["'2024-03'", "LEAD", "<"],
    walkthrough:
      "August's 321000-cent pot against July's 179400 is a surge of 141600 cents — the biggest single month-over-month cost jump in the ledger. LEAD would measure toward September's cooler 154500 and find a fall, which the surge test refuses. August's surge against July: 141600 cents.",
  },
  {
    id: "cs-1489",
    tier: "hard",
    topic: "t7",
    universe: "expense",
    title: "The ledger's biggest jump",
    brief:
      "From: Spend report. Re: the debit leaps.\n\nThe ledger review wants the single biggest month-over-month debit jump named. Build the debit deltas, order them steepest-first, and read the top leap.",
    ask: "Which month-over-month debit jump is the biggest, in cents?",
    template: `SELECT mo, debit, delta FROM (
  SELECT strftime('%Y-%m', entry_date) AS mo, SUM(debit_cents) AS debit,
    SUM(debit_cents) - LAG(SUM(debit_cents)) OVER (ORDER BY strftime('%Y-%m', entry_date)) AS delta
  FROM ledger_entries
  WHERE debit_cents {3} 0
  GROUP BY mo)
ORDER BY delta {2}
LIMIT {1};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the top slice",
        why: "The review names the single biggest leap, so the slice is one row. A slice of 2 would drag the runner-up onto the page.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the steepest-first order",
        why: "The biggest leap tops the board, so deltas sort descending. Ascending would surface the deepest drop instead — April's fall.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the debit test",
        why: "Debits are positive entries, so the filter is > 0. Flipping to < would keep no ledger rows at all and empty the review.",
      },
    ],
    distractors: ["5000", "ASC", "<"],
    walkthrough:
      "The ledger's debit deltas ordered steepest-first top out at February 2024: 1087300 cents against January's 171900 — a leap of 915400 cents that no later month matches; August comes closest at 608450. Ascending would surface April's 365500-cent drop instead. The biggest debit jump: 915400 cents.",
  },
  {
    id: "cs-1490",
    tier: "medium",
    topic: "t7",
    universe: "growth",
    title: "The July order jump",
    brief:
      "From: Growth lead. Re: the volume report.\n\nThe volume report tracks how the order count moved month to month, and July's step is the one the deck cites. Build the count deltas and read July's jump.",
    ask: "By how many orders did July 2024 beat June?",
    template: `SELECT mo, n, dn FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n,
    COUNT(*) - {2}(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS dn
  FROM orders GROUP BY mo)
WHERE mo = {1} AND dn {3} 0;`,
    slots: [
      {
        answer: "'2024-07'",
        kind: "keyword",
        label: "the jump month",
        why: "The deck cites July's step. Pinning 2024-06 would read June's own move — a fall of two orders, not a jump.",
      },
      {
        answer: "LAG",
        kind: "keyword",
        label: "the backward look",
        why: "A month's jump is measured against its predecessor, so the look is LAG. LEAD would measure July against August and find a dip.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the jump test",
        why: "A jump means the delta sits above zero, so the test is > 0. Flipping to < would keep only the falling months.",
      },
    ],
    distractors: ["'2024-06'", "LEAD", "<"],
    walkthrough:
      "July's 8 orders against June's 6 is a jump of 2 — tied with September's step as the biggest volume gain in the series. LEAD would measure toward August's 7 and find a one-order dip, and June's own delta was a fall. July's jump: 2 orders.",
  },
  {
    id: "cs-1491",
    tier: "easy",
    topic: "t8",
    universe: "growth",
    title: "The 30000 wall",
    brief:
      "From: Growth lead. Re: the cumulative wall.\n\nThe revenue board tracks the running total against a 30000 milestone and wants the month that finally cleared it. Build the running series, keep the clears, and read the first.",
    ask: "Which running total first cleared 30000, and in which month?",
    template: `SELECT mo, run FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    ROUND(SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS run
  FROM orders GROUP BY mo)
WHERE run {2} {1}
LIMIT {3};`,
    slots: [
      {
        answer: "30000",
        kind: "number",
        noVerify: true,
        label: "the wall height",
        why: "The milestone board sets the wall at 30000. A 25000 wall would clear back in October and misdate the milestone.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the clear test",
        why: "Clearing the wall means reaching it, so the test is >= 30000. Flipping to < would keep only the months still short of the wall.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the first slice",
        why: "The milestone wants the first clear, so the slice is one row. A slice of 2 would drag the following month onto the page.",
      },
    ],
    distractors: ["25000", "<", "2"],
    walkthrough:
      "The running total climbs all year and stands at 28671.78 after November; December's 2101.47 pushes it to 30773.25 — the first clear of the 30000 wall. The 25000 wall fell back in October at 27022.98, which is why the wall height must be pinned. The 30000 wall clears: December 2024, at 30773.25.",
  },
  {
    id: "cs-1492",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The smoothed July read",
    brief:
      "From: Growth lead. Re: the smoothing frame.\n\nThe trend line smooths each month against its immediate predecessor to soften the noise. Set the one-month look-behind frame, pin July, and read the smoothed value.",
    ask: "What is July 2024's revenue smoothed against June, to two decimals?",
    template: `SELECT mo, rev, ma FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev,
    ROUND({3}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)
      ROWS BETWEEN {2} PRECEDING AND CURRENT ROW), 2) AS ma
  FROM orders GROUP BY mo)
WHERE mo = {1};`,
    slots: [
      {
        answer: "'2024-07'",
        kind: "keyword",
        label: "the pinned month",
        why: "The trend read pins July, the year's trough. Pinning 2024-03 would read March's smoothed 3113.36 instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the frame depth",
        why: "The line smooths one month back, so the frame runs 1 PRECEDING to current. A depth of 2 would pull May in and shift the read to 2050.53.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the smoothing fold",
        why: "Smoothing is an average across the frame, so the fold is AVG. SUM would add the frame's months and read the two-month stack instead.",
      },
    ],
    distractors: ["'2024-03'", "2", "SUM"],
    walkthrough:
      "The one-month frame averages June's 2047.43 with July's 1193.86 into a smoothed 1620.64 — the floor of the trend line. The deeper frame would drag May's 2910.31 in and lift the read to 2050.53, and the SUM fold would stack the months instead of smoothing them. July's smoothed read: 1620.64.",
  },
  {
    id: "cs-1493",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The bottom quartile's best",
    brief:
      "From: Growth lead. Re: the quartile map.\n\nThe revenue map splits the fourteen months into quartiles, leanest first. Tile the months, keep the bottom tile, and read the strongest month hiding in it.",
    ask: "What is the biggest monthly revenue inside the bottom quartile?",
    template: `SELECT {3}(rev) AS peak FROM (
  SELECT ROUND(SUM(total), 2) AS rev,
    NTILE(4) OVER (ORDER BY SUM(total) {2}) AS q
  FROM orders GROUP BY strftime('%Y-%m', created_at))
WHERE q = {1};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the bottom tile",
        why: "Leanest-first tiling puts the lean months in tile 1. Tile 4 would hold the richest months and crown January instead.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean-first order",
        why: "The map tiles leanest-first, so the revenue sorts ascending. Descending would flip the map and make tile 1 the luxury tier.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak fold",
        why: "The read wants the tile's strongest month, so the fold is MAX. MIN would surface July's 1193.86 — the trough, not the peak.",
      },
    ],
    distractors: ["4", "DESC", "MIN"],
    walkthrough:
      "Tiled leanest-first, the bottom quartile holds July, November, this January and June — and its strongest month is June at 2047.43. Tile 4 would hold the luxury tier peaking at January's 3731.97, and the MIN fold would surface the 1193.86 trough. The bottom quartile's best month: 2047.43.",
  },
  {
    id: "cs-1494",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The top-quartile pot",
    brief:
      "From: Growth lead. Re: the tier pots.\n\nThe tier report splits the members into spend quartiles and pots each tier. Tile the members on spend, keep the top tier, and read the pot it holds.",
    ask: "What combined spend sits in the members' top spend quartile?",
    template: `SELECT ROUND({3}(spend), 2) AS pot, COUNT(*) AS members FROM (
  SELECT ROUND(SUM(total), 2) AS spend,
    NTILE(4) OVER (ORDER BY SUM(total) {2}) AS q
  FROM orders GROUP BY customer_id)
WHERE q = {1}
GROUP BY q;`,
    slots: [
      {
        answer: "4",
        kind: "number",
        label: "the top tile",
        why: "Leanest-first tiling puts the heaviest spenders in tile 4. Tile 1 would pot the lean tier at 2395.05 instead.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean-first order",
        why: "Tiers build leanest-first, so spend sorts ascending. Descending would invert the tiles and make tile 4 the lean tier.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "A tier pot is the tier's total, so the fold is SUM. MAX would lift only Alice's 7262.35 and hide the tier's depth.",
      },
    ],
    distractors: ["1", "DESC", "MAX"],
    walkthrough:
      "Tiled leanest-first, the top quartile holds the four heaviest spenders — Alice, Emma, Grace and Maya — and their pot reads 22121.70, nearly two-thirds of the store's revenue. Tile 1 would pot the lean tier at 2395.05, and the MAX fold would shrink the story to Alice alone. The top-quartile pot: 22121.70.",
  },
  {
    id: "cs-1495",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "Bruno's January run",
    brief:
      "From: Growth lead. Re: the regional runs.\n\nThe regional board runs each region's revenue cumulatively through the calendar. Partition the running total by region, pin LATAM's opening month, and read the run.",
    ask: "What was LATAM's running revenue total after January 2024?",
    template: `SELECT region, mo, run FROM (
  SELECT c.region, strftime('%Y-%m', o.created_at) AS mo,
    ROUND({3}(SUM(o.total)) OVER (PARTITION BY c.region ORDER BY strftime('%Y-%m', o.created_at)), 2) AS run
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.region, mo)
WHERE region = {1} AND mo = {2};`,
    slots: [
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the regional scope",
        why: "The read targets LATAM's run. Scoping to APAC would read its January run — a different region's ledger.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the opening month",
        why: "The run starts at the calendar's first month. Pinning 2024-03 would read the closing run of 852.44 after March's order.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the running fold",
        why: "A running total accumulates, so the fold is SUM. COUNT would tally months, not revenue, and print a 1.",
      },
    ],
    distractors: ["'APAC'", "'2024-03'", "COUNT"],
    walkthrough:
      "Partitioned by region, LATAM's run opens with Bruno's January order: 752.96 — and stays there until March adds 99.48 for a closing 852.44. The COUNT fold would tally one month instead of summing revenue, and APAC's January run is a different ledger entirely. LATAM's January run: 752.96.",
  },
  {
    id: "cs-1496",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "The wire crossing at 25000",
    brief:
      "From: Billing ops. Re: the rail milestones.\n\nThe treasury tracks each rail's payments cumulatively and wants the wire rail's 25000 crossing named. Run the wire ledger in payment order, keep the clears, and read the first.",
    ask: "Which running wire total first cleared 25000 euros, and on what date?",
    template: `SELECT paid_on, run FROM (
  SELECT paid_on, ROUND(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments
  WHERE method = {1}
  GROUP BY paid_on)
WHERE run {2} {3}
LIMIT {4};`,
    slots: [
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the rail scope",
        why: "The milestone belongs to the wire rail. Scoping to card would clear 25000 earlier — at its 27957.50 payment.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the clear test",
        why: "Clearing the milestone means reaching it, so the test is >= 25000. Flipping to < would keep only the payments still short.",
      },
      {
        answer: "25000",
        kind: "number",
        noVerify: true,
        label: "the milestone height",
        why: "The board sets the wire milestone at 25000. A 30000 milestone would not clear until the rail's final payment.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the first slice",
        why: "The milestone names the first crossing, so the slice is one row. A slice of 2 would drag the next payment onto the page.",
      },
    ],
    distractors: ["'card'", "<", "30000", "2"],
    walkthrough:
      "Run in payment order, the wire rail reaches 23211.50 by late October and clears 25000 on the next payment: a running 26018.50 on December 5th. The card rail crossed the same line weeks earlier, and the 30000 milestone waits for the rail's final payment. The wire rail's 25000 crossing: 26018.50 on 2024-12-05.",
  },
  {
    id: "cs-1497",
    tier: "easy",
    topic: "t8",
    universe: "growth",
    title: "The floor that held",
    brief:
      "From: Growth lead. Re: the running floor.\n\nThe trend desk tracks a running minimum through the calendar and wants the level it settled at. Run the months in order, fold the running minimum, and read the settled floor.",
    ask: "At what level did the running minimum settle from July 2024 onward?",
    template: `SELECT mo, floor FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    {3}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS floor
  FROM orders GROUP BY mo)
WHERE mo {2} {1};`,
    slots: [
      {
        answer: "'2024-07'",
        kind: "keyword",
        label: "the settle month",
        why: "July is the year's trough, so the settled floor starts there. Pinning 2024-06 would read June's still-falling floor of 2047.43.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the from test",
        why: "The read runs from July onward, so the test is >= the month. An equality would show one row and hide how long the floor held.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "A running floor takes the smallest value so far, so the fold is MIN. MAX would run a ceiling and pin 3731.97 forever.",
      },
    ],
    distractors: ["'2024-06'", "=", "MAX"],
    walkthrough:
      "The running minimum steps down all spring — 3731.97, 3609.64, 2617.08, 2468.91, 2047.43 — and lands on July's 1193.86, where it stays through the series' end: no later month runs leaner. The MAX fold would run a ceiling at the January peak instead. The settled floor: 1193.86.",
  },
  {
    id: "cs-1498",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The top quartile's weakest",
    brief:
      "From: Growth lead. Re: the quartile edges.\n\nThe quartile map needs its edges named: the weakest month still rich enough for the top tile. Tile the months leanest-first, keep tile four, and read its floor.",
    ask: "What is the smallest monthly revenue inside the top quartile?",
    template: `SELECT {3}(rev) AS low FROM (
  SELECT ROUND(SUM(total), 2) AS rev,
    NTILE(4) OVER (ORDER BY SUM(total) {2}) AS q
  FROM orders GROUP BY strftime('%Y-%m', created_at))
WHERE q = {1};`,
    slots: [
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the top tile",
        why: "Leanest-first tiling puts the richest months in tile 4. Tile 1 would floor at July's 1193.86 — the lean tier's edge.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean-first order",
        why: "The map tiles leanest-first, so the revenue sorts ascending. Descending would flip the tiles and put the lean months in tile 4.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the edge fold",
        why: "The tile's lower edge is its smallest revenue, so the fold is MIN. MAX would read the tier's ceiling at January's peak.",
      },
    ],
    distractors: ["1", "DESC", "MAX"],
    walkthrough:
      "Tiled leanest-first, the top quartile holds September, February and January, and its lower edge is September's 3116.04 — the weakest month still rich enough for the tier. Tile 1's floor is July's 1193.86, and the MAX fold would read the tier's 3731.97 ceiling. The top quartile's lower edge: 3116.04.",
  },
  {
    id: "cs-1499",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The card rail's final figure",
    brief:
      "From: Billing ops. Re: the rail finals.\n\nThe treasury's close names each rail's settled total from its running ledger. Run the card rail in payment order, read it backward, and take the final figure.",
    ask: "What total have card payments settled, in euros?",
    template: `SELECT paid_on, run FROM (
  SELECT paid_on, ROUND(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments
  WHERE method = {1}
  GROUP BY paid_on)
ORDER BY paid_on {2}
LIMIT {3};`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the rail scope",
        why: "The read settles the card rail. Scoping to wire would name 32248.00 — the smaller rail's final figure.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the backward order",
        why: "The final figure is the newest payment, so the ledger reads backward. Ascending would surface the rail's first payment instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the final slice",
        why: "The close takes the newest row only, so the slice is one. A slice of 2 would drag the second-newest payment onto the page.",
      },
    ],
    distractors: ["'wire'", "ASC", "2"],
    walkthrough:
      "Read backward, the card rail's newest payment closes the ledger at 37364.00 euros settled — the final figure the close names. The wire rail's final reads 32248.00, and reading forward would surface the rail's first 2430.00 payment. The card rail's final: 37364.00.",
  },
  {
    id: "cs-1500",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The weaker half's best month",
    brief:
      "From: Growth lead. Re: the halves map.\n\nThe revenue map splits the fourteen months into a stronger and a weaker half. Tile them richest-first, keep the weaker tile, and read the best month still in it.",
    ask: "What is the biggest monthly revenue inside the weaker half?",
    template: `SELECT {3}(rev) AS peak FROM (
  SELECT ROUND(SUM(total), 2) AS rev,
    NTILE(2) OVER (ORDER BY SUM(total) {2}) AS q
  FROM orders GROUP BY strftime('%Y-%m', created_at))
WHERE q = {1};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the weaker tile",
        why: "Richest-first tiling puts the strong half in tile 1, so the weaker half is tile 2. Tile 3 does not exist under a two-way split.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the rich-first order",
        why: "The map tiles richest-first, so the revenue sorts descending. Ascending would flip the halves and crown a luxury month instead.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak fold",
        why: "The read wants the weaker half's best month, so the fold is MAX. MIN would surface July's 1193.86 — the map's overall trough.",
      },
    ],
    distractors: ["3", "ASC", "MIN"],
    walkthrough:
      "Tiled richest-first, the weaker half holds this February's 2390.53 at its top — the best month outside the luxury seven, ahead of August's 2352.07. A three-way tiling would reshuffle the tiles and crown March instead, and ascending tiling would flip the halves entirely. The weaker half's best month: 2390.53.",
  },
];

