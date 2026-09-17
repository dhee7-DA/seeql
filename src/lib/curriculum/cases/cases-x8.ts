// Case batch X8 — Module 6 (Expert Clinic) cases cs-1651…cs-1675, wave 4.
// Clinic capstone — every case stacks at least one clinic move (subquery,
// CTE, set operation or window function) on top of the wave-1-through-3
// patterns. Figures from the W4 receipt pool (m6-cases-w4-facts.ts) and
// earlier waves. Audited by scripts/case-audit.ts (x-law: capstone must
// carry subquery / WITH / set-op / OVER; bank law: no join-type
// distractors). Key receipts: region crowns 4 (Grace 4574.23 / Alice
// 7262.35 / Bruno 852.44 / Emma 6640.56); per-region lanes APAC 21/8/5/3,
// EU 24/12/6/3; lane shares 44.7/34.44/17.55/3.31; quartile pots
// 22121.70/6911.67/3404.86/2395.05; ghost ranks Farid 1..Dmitri 5; month
// jumps Jul +2; source stack 103/28/27; card wall 2024-12-16; premium 6
// above avg 127.83; busy months 11 at >=7 orders; MA2 Jul 1620.64.
import type { CaseStudy } from "./types";

export const casesX8: CaseStudy[] = [
  {
    id: "cs-1651",
    tier: "easy",
    topic: "x8",
    universe: "growth",
    title: "The four crowns",
    brief:
      "From: Growth lead. Re: the regional champions.\n\nThe board slide needs one number: how many regional crowns were handed out when every region's biggest spender took a crown. Rank within each region and count the kings.",
    ask: "How many regional crowns exist when each region's top spender is crowned?",
    template: `SELECT COUNT(*) AS crowns FROM (
  SELECT c.region, RANK() OVER (PARTITION BY {1} ORDER BY SUM(o.total) {2}) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region, c.id
) WHERE rk = {3};`,
    slots: [
      {
        answer: "c.region",
        kind: "keyword",
        label: "the crown partition",
        why: "Crowns are per-region: PARTITION BY c.region restarts the ranking inside each territory — four regions, four crowns. Partitioning by c.id would rank each member against themselves and hand out sixteen crowns.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown order",
        why: "DESC ranks biggest spend first, so rank 1 is the region's top spender. ASC would crown the smallest spender in every region and the board would honor the wrong names.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the crown line",
        noVerify: true,
        why: "The crown is rank 1 — one per region, four in total. Line 2 counts the runner-ups, a different slide entirely.",
      },
    ],
    distractors: ["c.id", "2", "SUM", "'name'"],
    walkthrough:
      "Four crowns — one per region, and the board knows all four names: Grace Kim (APAC, 4574.23), Alice Chen (EU, 7262.35), Bruno Silva (LATAM, 852.44) and Emma Wilson (US, 6640.56). The capstone stacks a window over an aggregate: orders join customers, GROUP BY c.region, c.id folds each member's spend, and RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) ranks members inside their region — the partition restarts the contest per territory. The outer count keeps rank-1 rows: four regions, four kings. The partition slot is the finding: c.id would isolate every member in their own partition and hand out sixteen crowns, one apiece — a meaningless ceremony. SUM in the ORDER BY slot errors, and line 2 would count runner-ups. Four crowns, four regions, one slide.",
  },
  {
    id: "cs-1652",
    tier: "easy",
    topic: "x8",
    universe: "funnel",
    title: "The regional lanes, one pass",
    brief:
      "From: Fulfillment. Re: the APAC lane read.\n\nThe APAC review opens with one row: of everything APAC ordered, how much has already delivered? One query, one region, one filter clause doing the lane work.",
    ask: "How many APAC orders sit in the delivered lane?",
    template: `SELECT {2}(*) FILTER (WHERE status = {3}) AS apac_delivered FROM (
  SELECT o.status, c.region FROM orders o
  JOIN customers c ON c.id = o.customer_id
) WHERE region = {1};`,
    slots: [
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region scope",
        why: "The review is APAC's: c.region = 'APAC' scopes every aggregate to the region's 37 orders. 'EU' would read 24 delivered and the APAC slide would print Europe's number.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the lane counter",
        why: "COUNT(*) FILTER (WHERE ...) counts the lane's rows in the same scan — 21 delivered. SUM or AVG would fold the asterisk and error.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the lane filter",
        why: "The FILTER clause pins the lane inside the aggregate: 'delivered' catches 21 APAC orders. 'shipped' would print 8 — the still-in-transit column — and 'cancelled' just 3.",
      },
    ],
    distractors: ["'EU'", "'US'", "'shipped'", "'cancelled'", "SUM"],
    walkthrough:
      "21 of APAC's 37 orders have delivered — the region's strongest completion read. The capstone move is the FILTER clause: one scan of orders joined to customers, with COUNT(*) FILTER (WHERE o.status = 'delivered') counting only the delivered rows while the WHERE c.region = 'APAC' scopes the whole scan. Three of the region's numbers in context: 21 delivered, 8 shipped, 5 pending, 3 cancelled — the delivered share dwarfs the open lanes. The distractors each move the slide: 'EU' prints Europe's 24, 'shipped' prints APAC's in-transit 8, and SUM errors on the asterisk. One scan, one region, one honest lane count — the pattern the whole regional review reuses.",
  },
  {
    id: "cs-1653",
    tier: "easy",
    topic: "x8",
    universe: "month-close",
    title: "The crowned stack",
    brief:
      "From: Controller. Re: the headline stack.\n\nThe close pack's first table is the lane revenue stack with the grand total — but the controller wants the TOTAL row on top, crowning the lanes, not buried underneath. Build the stack, order it so the crown leads.",
    ask: "What does the lane order-count stack look like with the TOTAL row leading?",
    template: `SELECT * FROM (
  SELECT status, {2}(*) AS n FROM orders GROUP BY status
  {1} SELECT 'TOTAL', COUNT(*) FROM orders
) ORDER BY n {3};`,
    slots: [
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "UNION ALL appends the grand-total arm verbatim — five rows, no dedup pass. INTERSECT would look for rows the two arms share and return nothing: no lane equals the total.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the lane tally",
        why: "The stacked measure is order counts: delivered 52, shipped 30, pending 14, cancelled 7 — and COUNT(*) is the tally on every arm. SUM would demand a numeric column to fold and error on the asterisk.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown order",
        why: "DESC sorts the stacked revenue biggest-first, and the total outranks every lane — the crown leads: 34833.28, then delivered 15571.07. ASC would bury the total at the bottom.",
      },
    ],
    distractors: ["SUM", "ASC", "INTERSECT", "EXCEPT", "'GRAND'"],
    walkthrough:
      "The crowned stack reads: TOTAL 103 on top, then delivered 52, shipped 30, pending 14, cancelled 7. The capstone stacks two SELECT arms — the grouped lane counts and the labelless grand total — under UNION ALL, then lets the outer ORDER BY n DESC put the crown where the controller wants it: first. UNION ALL is the honest append: every arm's rows survive verbatim. INTERSECT would intersect the lane rows with the total row and find nothing shared; EXCEPT would keep the lanes but silently drop the total the slide is named for. The arithmetic self-audits: four lane counts summing to exactly the crowned 103. DESC puts the whole book above every lane — the pack opens with the total, then reads the lanes.",
  },
  {
    id: "cs-1654",
    tier: "easy",
    topic: "x8",
    universe: "month-close",
    title: "The ghost line, staged",
    brief:
      "From: Billing ops. Re: the staged chase list.\n\nThe CRM sync wants the never-invoiced members as one folded line — but this time the fold reads from a staged set: filter the ghosts into a CTE first, then fold the stage.",
    ask: "What single folded line names every never-invoiced member, built from a staged ghost set?",
    template: `WITH ghost AS (
  SELECT c.name FROM invoices i
  RIGHT JOIN customers c ON i.customer_id = c.id WHERE i.id IS {1}
) SELECT {2}(name, ', ' ORDER BY name {3}) AS line FROM ghost;`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost gate",
        why: "The CTE stages only members no invoice matched: i.id IS NULL. NOT NULL would stage the invoiced book — twenty-eight rows with repeats — and fold a line of the wrong people.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the stage fold",
        why: "GROUP_CONCAT with the in-aggregate ORDER BY glues the staged names into one alphabetical cell. SUM or MAX cannot fold text — they error on the separator argument.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the stage order",
        why: "ORDER BY name ASC pins the fold alphabetical — Bruno Silva leads. DESC would flip the line and the CRM sync would read bottom-up.",
      },
    ],
    distractors: ["SUM", "MAX", "AVG", "DESC", "name"],
    walkthrough:
      "The staged line reads: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer — one cell, five names, alphabetical. The capstone move is the staging: WITH ghost AS (...) filters the never-invoiced members into a named set first — the RIGHT JOIN keeps every member alive, i.id IS NULL keeps the five the billing walk never touched — and the main query folds the stage, not the raw tables. The fold itself carries the in-aggregate ORDER BY, pinning alphabetical order where a bare fold would follow scan order. NOT NULL would stage the invoiced book instead and the line would name twenty-eight rows' worth of billed members. SUM, MAX or AVG cannot fold text with a separator — each errors on the second argument. Staging first, folding second: the CTE makes the ghost set nameable, testable, and reusable.",
  },
  {
    id: "cs-1655",
    tier: "easy",
    topic: "x8",
    universe: "month-close",
    title: "The opening jump",
    brief:
      "From: Finance ops. Re: the best month-on-month print.\n\nThe trend slide needs the biggest month-over-month revenue jump, with the first month anchored at zero so January's opening counts as a jump. Find it.",
    ask: "Which month shows the largest revenue jump over the previous month, with January anchored at zero?",
    template: `SELECT mo, delta FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    ROUND(SUM(total) - LAG(SUM(total), 1, {1}) OVER (ORDER BY strftime('%Y-%m', created_at)), 2) AS delta
  FROM orders GROUP BY mo
) WHERE delta IS NOT NULL ORDER BY delta {2} LIMIT {3};`,
    slots: [
      {
        answer: "0",
        kind: "number",
        label: "the opening anchor",
        noVerify: true,
        why: "LAG's default anchors the first month at zero, so January 2024's 3731.97 reads as a full jump from nothing. Anchoring at 1000 would shrink the opening to 2731.97 and bury the lead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the jump order",
        why: "DESC stacks the biggest jumps first, so LIMIT 1 lands on the opening 3731.97. ASC would surface the deepest drop instead — a different, gloomier slide.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the single print",
        noVerify: true,
        why: "The slide prints one month: LIMIT 1. LIMIT 0 would print nothing and LIMIT 2 would dilute the headline with the runner-up jump.",
      },
    ],
    distractors: ["1000", "2000", "ASC", "LEAD", "0", "2"],
    walkthrough:
      "The biggest jump is the opening one: January 2024's 3731.97, measured from a zero anchor. The capstone pairs the window LAG with a default — LAG(SUM(total), 1, 0) hands the first month a zero predecessor, so its delta is its full revenue rather than a NULL that the WHERE would discard. ORDER BY delta DESC LIMIT 1 takes the steepest climb; the runner-up jumps are +1s and the single -1, which is why the opening dominates so completely. The anchor is the slide's honesty device: anchor at 1000 or 2000 and January's print shrinks mechanically, quietly demoting the strongest month. LEAD in the window slot would point the wrong way down the calendar and rank the jumps against next months. ASC would crown the deepest drop. One window, one anchor, one honest 3731.97.",
  },  {
    id: "cs-1656",
    tier: "medium",
    topic: "x8",
    universe: "funnel",
    title: "The EU shipped read",
    brief:
      "From: Fulfillment. Re: the EU transit column.\n\nThe EU logistics cell wants one number from the one-pass pattern: how many EU orders are currently sitting in the shipped lane — out the door, not yet landed. One scan, lane-filtered.",
    ask: "How many EU orders are in the shipped lane?",
    template: `SELECT {2}(*) FILTER (WHERE status = {1}) AS eu_shipped FROM (
  SELECT o.status, c.region FROM orders o
  JOIN customers c ON c.id = o.customer_id
) WHERE region = {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the transit lane",
        why: "FILTER (WHERE o.status = 'shipped') counts the in-transit rows: twelve EU orders. 'pending' would print the six not-yet-picked ones and 'cancelled' the three dead ones.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the lane counter",
        why: "COUNT(*) FILTER (WHERE ...) counts the lane inside one scan. SUM or AVG would fold the asterisk and error — the cell wants a headcount.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region scope",
        why: "c.region = 'EU' scopes the scan: twelve shipped. 'US' would print ten — America's transit column — and 'APAC' eight.",
      },
    ],
    distractors: ["'pending'", "'cancelled'", "'US'", "'APAC'", "SUM"],
    walkthrough:
      "Twelve EU orders sit in the shipped lane — the region's in-transit column, read in one pass. The capstone is the FILTER-clause pattern pressed into regional service: one scan of orders joined to customers, WHERE c.region = 'EU' scopes the territory, and COUNT(*) FILTER (WHERE o.status = 'shipped') counts only the transit rows. The EU lane row in full: 24 delivered, 12 shipped, 6 pending, 3 cancelled — the healthiest completion profile in the book. The distractors each print a neighboring cell: 'pending' the six awaiting pick-up, 'US' America's ten in transit, 'APAC' its eight. SUM cannot take the asterisk. One scan, three decisions — region, lane, counter — and the logistics cell gets its number.",
  },
  {
    id: "cs-1657",
    tier: "medium",
    topic: "x8",
    universe: "growth",
    title: "The spend ladder, line two",
    brief:
      "From: Growth lead. Re: the runner-up spender.\n\nThe spend leaderboard is famous for its champion. Pull line two — the member with the second-highest lifetime spend — so the deck can show the chasing pack is real.",
    ask: "Which member ranks second by lifetime spend, and what is that spend?",
    template: `SELECT name, {3} FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) {1}) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id
) WHERE rn = {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ladder direction",
        why: "DESC ranks biggest spend first, so line 2 is the runner-up — Emma Wilson. ASC would rank from the cheapest up and line 2 would be Noah Meyer's 737.68.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the runner-up line",
        noVerify: true,
        why: "ROW_NUMBER pins the ladder: Alice 1 at 7262.35, Emma 2 at 6640.56, Grace 3 at 4574.23. The outer rn = 2 peels the runner-up off the board.",
      },
      {
        answer: "spend",
        kind: "keyword",
        label: "the figure column",
        why: "The deck reads the runner-up's spend: the outer projection carries spend — 6640.56. Projecting rn would print the rank 2 where the figure belongs, and name would print Emma's name twice.",
      },
    ],
    distractors: ["ASC", "1", "rn", "name", "AVG"],
    walkthrough:
      "Emma Wilson is the runner-up spender: 6640.56, chasing Alice Chen's 7262.35 with the book's second-deepest ordering history. The capstone is the window leaderboard over a grouped aggregate: GROUP BY c.id folds each member's lifetime spend, ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) pins the ladder, and the outer WHERE rn = 2 takes the second line. The gap matters to the story: Alice leads by only 621.79 — the closest title race in the book — which is exactly why the deck shows line two. ASC would rebuild the ladder from the floor and crown Noah Meyer's 737.68; lines 1 and 3 fetch the champion and Grace Kim. AVG in the direction slot errors on the window's ORDER BY shape. Line two, 6640.56 — the chase is on.",
  },
  {
    id: "cs-1658",
    tier: "medium",
    topic: "x8",
    universe: "month-close",
    title: "The source stack",
    brief:
      "From: Controller. Re: the table inventory.\n\nThe close pack's appendix inventories the three transaction tables — orders, invoices, payments — in one stacked result, and the payments line is the one that gets audited. Build the stack and pull the payments count.",
    ask: "How many payment rows does the three-source stack report?",
    template: `SELECT rows_n FROM (
  SELECT 'orders' AS source, {2}(*) AS rows_n FROM orders
  UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
  {1} SELECT 'payments', COUNT(*) FROM payments
) WHERE source = {3};`,
    slots: [
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack append",
        why: "UNION ALL appends the payments arm verbatim — three rows in the stack. INTERSECT would intersect the invoices arm with the payments arm and find nothing shared: an empty appendix.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the orders counter",
        why: "COUNT(*) sizes the first arm — 103 orders — while the other arms carry their own counts. SUM would fold the asterisk and error inside the stack.",
      },
      {
        answer: "'payments'",
        kind: "keyword",
        label: "the audited arm",
        why: "The WHERE picks the audited arm: source = 'payments' reports 27. 'orders' would print 103 and 'invoices' 28 — the appendix's other two lines.",
      },
    ],
    distractors: ["INTERSECT", "SUM", "'orders'", "'invoices'"],
    walkthrough:
      "The payments arm of the stack reports 27 rows. The capstone is a three-arm UNION ALL stack — orders 103, invoices 28, payments 27 — wrapped so the outer WHERE can pull one audited line by name. UNION ALL keeps every arm verbatim; INTERSECT would intersect arms that share no rows and the appendix would print nothing, silently dropping the very line the audit asked for. The first arm's counter is slotted to make the pattern explicit: COUNT(*) sizes each source the same way. 'orders' or 'invoices' in the WHERE would report the neighboring lines — real numbers, wrong audit. 27 payments, one stack, one appendix.",
  },
  {
    id: "cs-1659",
    tier: "medium",
    topic: "x8",
    universe: "pricing",
    title: "The premium tier",
    brief:
      "From: Pricing. Re: the above-average shelf.\n\nThe premium shelf is defined against the catalog itself: every product priced above the catalog's own average price. Count how many products earn the premium tag.",
    ask: "How many products are priced above the catalog's average price?",
    template: `SELECT {3}(*) AS premium, ROUND((SELECT {2}(price) FROM products), 2) AS bar FROM products
  WHERE price {1} (SELECT AVG(price) FROM products);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the premium direction",
        why: "Above average means price > (SELECT AVG(price)): six products clear the 127.83 bar. '<' would count the ten below — the standard shelf, not the premium one.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the average fold",
        why: "The bar column re-reads the catalog's own mean — AVG(price) = 127.83, computed in a subquery so the shelf prints its own bar. MAX would print 199.99, the ceiling, as the bar.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf counter",
        why: "COUNT(*) sizes the premium shelf: six products. SUM or AVG would fold the asterisk and error — the tag audit wants a headcount.",
      },
    ],
    distractors: ["<", "MAX", "MIN", "SUM"],
    walkthrough:
      "Six products earn the premium tag, and the shelf prints its own bar: 127.83, the catalog's average price, computed in a sibling subquery. The capstone is the self-referential comparison: the WHERE tests price against AVG(price) computed from the same table, and the projection re-reads the bar so the audit sees the threshold beside the count. The direction is the tag: '<' would count the ten standard-shelf products and the premium audit would brand the wrong half of the catalog. The fold choice is the trap: MAX sets the printed bar at the most expensive product — 199.99, which nothing exceeds — and MIN at 14.99, which everything clears. SUM would sum every price to about 2045. Six above average, bar printed — the premium shelf, self-defined and self-documenting.",
  },
  {
    id: "cs-1660",
    tier: "medium",
    topic: "x8",
    universe: "month-close",
    title: "The quartile pot",
    brief:
      "From: Finance ops. Re: the top-quartile concentration.\n\nSplit the member book into spend quartiles and price the top one: how much revenue sits with the highest-spending quartile? NTILE draws the lines, SUM prices the pot.",
    ask: "How much revenue sits with the top-spending quartile of members?",
    template: `SELECT q, {3}(spend) AS pot FROM (
  SELECT c.id, ROUND(SUM(o.total), 2) AS spend,
    NTILE({2}) OVER (ORDER BY SUM(o.total) {1}) AS q
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id
) GROUP BY q ORDER BY q LIMIT 1;`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the quartile direction",
        why: "DESC ranks biggest spend first, so quartile 1 is the top-spending fourth — pot 22121.70. ASC would make quartile 1 the poorest and the concentration slide would invert.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the quartile count",
        noVerify: true,
        why: "NTILE(4) cuts the sixteen members into four quartiles of four. NTILE(2) would cut halves and the top pot would swell to 29033.37 — half the book, not a quarter.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "SUM(spend) prices each quartile: the top pot is 22121.70 — nearly two-thirds of the book's revenue. AVG would print the mean member spend (5530.43) and COUNT the headcount (4).",
      },
    ],
    distractors: ["ASC", "2", "AVG", "COUNT"],
    walkthrough:
      "The top quartile holds 22121.70 — four members, nearly two-thirds of the 34833.28 book. The capstone stacks NTILE over a grouped aggregate: GROUP BY c.id folds each member's spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) deals the sixteen members into four ranked buckets, and the outer SUM(spend) prices each pot — 22121.70, 6911.67, 3404.86, 2395.05. The concentration is the story: the top pot is more than nine times the bottom one. The direction is the definition: ASC would call the poorest four members 'quartile 1' and the concentration slide would invert its message. NTILE(2) would halve instead of quarter, swelling the top pot to 29033.37. AVG or COUNT would print the pot's mean or headcount — real numbers for other slides. 22121.70 in the top fourth — the concentration the pack leads with.",
  },
  {
    id: "cs-1661",
    tier: "medium",
    topic: "x8",
    universe: "month-close",
    title: "The month sprint",
    brief:
      "From: Finance ops. Re: the sharpest month print.\n\nMonth-over-month order counts step up and down; the trend slide wants the single best month — the biggest positive jump in orders versus the month before, LAG-anchored.",
    ask: "Which month shows the largest jump in order count over the previous month?",
    template: `SELECT mo, dn FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS dn
  FROM orders GROUP BY mo
) WHERE dn IS {2}
ORDER BY dn {1}, mo
LIMIT {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sprint order",
        why: "DESC stacks the biggest jumps first, so LIMIT 1 lands on 2024-07 — two more orders than June. ASC would surface the deepest drop instead.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the anchor trim",
        why: "dn IS NOT NULL drops January's anchor row — its delta is NULL because nothing precedes it — leaving the twelve real month-over-month steps for the sort. IS NULL would keep only that anchor and print a NULL delta.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the single print",
        noVerify: true,
        why: "The slide prints one month. LIMIT 2 would print September's matching +2 alongside it and the slide would lose its point.",
      },
    ],
    distractors: ["ASC", "NULL", "0", "LEAD"],
    walkthrough:
      "The sharpest month sprint is 2024-07: two more orders than June (8 versus 6), with September matching the +2 but losing the alphabetical tie-break. The capstone windows a LAG over a grouped count: GROUP BY mo folds the monthly order counts, LAG(COUNT(*)) OVER (ORDER BY ...) pairs each month with its predecessor, and the subtraction prints the step. WHERE dn IS NOT NULL trims the anchor row — January's delta is NULL because nothing precedes it — and ORDER BY dn DESC, mo LIMIT 1 takes the best sprint with a deterministic tie-break. The direction rule is the slide: ASC would crown the deepest drop. LEAD in the window would point down the calendar and measure next months against current ones. LIMIT 2 would print the September tie and dilute the headline. 2024-07, plus two — the sprint month.",
  },
  {
    id: "cs-1662",
    tier: "medium",
    topic: "x8",
    universe: "refund-audit",
    title: "The ghost ranks",
    brief:
      "From: Billing ops. Re: the ghost leaderboard.\n\nThe never-invoiced members get their own leaderboard — lifetime spend, ranked, anti-joined against the invoice book. Crown the ghost champion.",
    ask: "Which never-invoiced member has the highest lifetime spend, and what is that spend?",
    template: `SELECT name, spend, rk FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
    RANK() OVER (ORDER BY SUM(o.total) {2}) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE c.id {1} (SELECT customer_id FROM invoices)
  GROUP BY c.id
) WHERE rk = {3};`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the anti-join gate",
        why: "NOT IN (SELECT customer_id FROM invoices) keeps only members the invoice book never touched — the five ghosts. IN would rank the eleven billed members instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown order",
        why: "DESC ranks biggest spend first, so rank 1 is Farid Nasser at 1458.97. ASC would crown Dmitri Volkov's 599.26 — the gentlest ghost, not the champion.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the crown line",
        noVerify: true,
        why: "The crown is rank 1: Farid Nasser, 1458.97 across three orders. Line 2 is Keiko Sato's 1098.60 — the onboarding list's second call.",
      },
    ],
    distractors: ["IN", "ASC", "2", "3", "AVG"],
    walkthrough:
      "Farid Nasser is the ghost champion: 1458.97 of lifetime spend, rank 1 among the five members the invoice book never touched. The capstone stacks a window over an anti-join: WHERE c.id NOT IN (SELECT customer_id FROM invoices) is the anti-join that isolates the ghost set, GROUP BY c.id folds their lifetime spend, and RANK() OVER (ORDER BY SUM(o.total) DESC) pins the leaderboard — Farid 1458.97, Keiko 1098.60, Bruno 852.44, Noah 737.68, Dmitri 599.26. The outer WHERE rk = 1 takes the crown. The gate direction is the case: IN would rank the eleven billed members and the ghost list would vanish into the general population. ASC would crown the gentlest ghost for the hardest sales call. Lines 2 and 3 are the onboarding queue's next names. 1458.97 — the biggest unbilled book in the store, wearing a crown.",
  },
  {
    id: "cs-1663",
    tier: "medium",
    topic: "x8",
    universe: "growth",
    title: "The half-way census",
    brief:
      "From: Growth lead. Re: the APAC lower half.\n\nEach region's book splits into halves by spend; the APAC team wants its lower-half headcount — the members below the regional median line. NTILE draws the line, the region scopes it.",
    ask: "How many APAC members sit in the lower-spending half of their region?",
    template: `SELECT {3}(*) AS apac_bottom FROM (
  SELECT c.region, c.id,
    NTILE(2) OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS q
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region, c.id
) WHERE q = {2} AND region = 'APAC';`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the half direction",
        why: "DESC ranks biggest spend first, so tile 2 is the lower-spending half — APAC's two quieter members. ASC would flip the tiles and count the region's heavy half: three.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the lower tile",
        noVerify: true,
        why: "NTILE(2) deals each region into two tiles: tile 1 the heavy half, tile 2 the light. APAC's five members split 3-and-2, so tile 2 holds two. Tile 1 would count three.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the half counter",
        why: "COUNT(*) sizes the lower half: two members. SUM or AVG would fold the asterisk and error — the census wants a headcount.",
      },
    ],
    distractors: ["1", "3", "SUM", "AVG"],
    walkthrough:
      "Two APAC members sit in the region's lower-spending half. The capstone partitions a window by region: GROUP BY c.region, c.id folds regional spend, NTILE(2) OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) deals each territory's members into heavy and light halves — APAC's five members split three-and-two — and the outer count scopes to region = 'APAC' with q = 2. The direction decides which half gets counted: ASC would rank from the cheapest up and tile 2 would become the heavy half, printing three. Tile 1 would count the heavy side too — three again, which is exactly why the tile and the direction must agree. AVG errors on the window's ORDER BY shape. Two quiet APAC members — the regional median line, drawn and counted.",
  },
  {
    id: "cs-1664",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The lane share map",
    brief:
      "From: Controller. Re: the concentration read.\n\nThe close pack's concentration panel prints each lane's share of the book's revenue, computed against the store total via a subquery. Pull the delivered lane's share to two decimals.",
    ask: "What percentage of total book revenue does the delivered lane hold, to two decimals?",
    template: `SELECT ROUND(100.0 * SUM(total) / (SELECT {2}(total) FROM orders), {3}) AS share FROM orders
  WHERE status = {1};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the headline lane",
        why: "The concentration panel leads with the delivered lane: 15571.07 of 34833.28 — 44.70 percent. 'shipped' would print 34.44 and the headline would understate the landed book.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the book denominator",
        why: "The share's denominator is the whole book: (SELECT SUM(total) FROM orders) = 34833.28. MAX would divide by the biggest single order — 1088.44 — and print a nonsense 1429 percent.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the decimals finisher",
        noVerify: true,
        why: "ROUND(..., 2) prints 44.70 to the panel's convention. Zero decimals would print 45 and two panels would disagree by rounding alone.",
      },
    ],
    distractors: ["'shipped'", "'pending'", "MAX", "COUNT", "0", "4"],
    walkthrough:
      "The delivered lane holds 44.70 percent of the book — 15571.07 of 34833.28, measured against a subquery that sums the whole store. The capstone nests an aggregate inside the comparison: the subquery computes the denominator once, the outer SUM(total) folds the lane, and the ratio times 100 prints the share. The denominator is where audits bite: MAX(total) would divide the lane by a single order's 1088.44 and print a four-digit 'share'; COUNT would divide by 103 and print fifteen-thousand percent. The lane scope is the headline: 'shipped' reads 34.44 — real, but the second line of the panel. Zero decimals rounds 44.70 to 45 and the panel disagrees with every other figure on the page. 44.70 percent — the landed book's share, honestly denominated.",
  },
  {
    id: "cs-1665",
    tier: "hard",
    topic: "x8",
    universe: "refund-audit",
    title: "The card wall crossing",
    brief:
      "From: Treasury. Re: the running wall.\n\nThe card rail's running total climbs day by day; the 30000-dollar wall is crossed on the day the cumulative sum first clears it. Find that date, window arithmetic doing the climbing.",
    ask: "On which date does the card rail's running total first clear 30000 dollars?",
    template: `SELECT paid_on, run FROM (
  SELECT paid_on, {3}(SUM(SUM(amount_cents)) OVER (ORDER BY paid_on), 2) / 100 AS run
  FROM payments WHERE method = {1}
  GROUP BY paid_on
) WHERE run >= {2} LIMIT 1;`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the climbing rail",
        why: "The wall watch runs on the card rail: 16 card payments climbing day by day. 'wire' would climb to only 26018.50 — the wire rail never clears the 30000 wall at all.",
      },
      {
        answer: "30000",
        kind: "number",
        label: "the wall height",
        noVerify: true,
        why: "The wall sits at 30000 dollars: the card run first clears it on 2024-12-16 at 30640.50. A 25000 wall would have been crossed weeks earlier — a different date entirely.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(running cents, 2) / 100 prints the climb in dollars: 30640.50 on crossing day. SUM cannot wrap a window the template's way and errors on the , 2.",
      },
    ],
    distractors: ["'wire'", "25000", "35000", "SUM"],
    walkthrough:
      "The card rail clears the 30000-dollar wall on 2024-12-16, the running total landing at 30640.50. The capstone stacks a window over a grouped aggregate: GROUP BY paid_on folds each day's card takings, SUM(SUM(amount_cents)) OVER (ORDER BY paid_on) turns the daily sums into a running climb, and the outer WHERE run >= 30000 finds the first crossing day. The rail is the finding: the wire rail's whole climb tops out at 26018.50 — it never touches the wall, so a wire run of this query returns nothing, which is itself the answer to a different question. The wall height is the trigger: lower it to 25000 and the crossing moves weeks earlier. ROUND(..., 2) / 100 prints the climb in dollars to the cent. 2024-12-16 — the day the card book broke through.",
  },
  {
    id: "cs-1666",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The deep-gap census",
    brief:
      "From: Retention. Re: the billing silences.\n\nBetween an invoice and the member's next one sits a silence. Count the silences deeper than 90 days — the gaps the dunning cycle never should have allowed.",
    ask: "How many consecutive invoice pairs sit more than 90 days apart?",
    template: `SELECT {3}(*) AS deep FROM invoices a
  JOIN invoices b ON a.customer_id = b.customer_id
  AND a.issued_on {1} b.issued_on
  WHERE NOT EXISTS (
    SELECT 1 FROM invoices m
    WHERE m.customer_id = a.customer_id
      AND m.issued_on > a.issued_on AND m.issued_on < b.issued_on
  ) AND julianday(b.issued_on) - julianday(a.issued_on) > {2};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the forward direction",
        why: "a.issued_on < b.issued_on orders each consecutive pair forward so the gap is positive and the adjacency test is meaningful. Equality would keep only self-pairings — zero-day silences.",
      },
      {
        answer: "90",
        kind: "number",
        label: "the deep line",
        noVerify: true,
        why: "Ninety days defines deep: 13 consecutive gaps cross it. A 60-day line would catch 20-odd gaps and the dunning audit would cry wolf; 120 would miss the worst tier.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the silence counter",
        why: "COUNT(*) tallies the deep silences: 13. SUM or AVG would fold the asterisk and error — the audit wants a gap count.",
      },
    ],
    distractors: ["=", "60", "120", "SUM", "b.issued_at"],
    walkthrough:
      "Thirteen consecutive invoice pairs sit more than 90 days apart — thirteen silences the dunning cycle should never have allowed. The capstone is the adjacency census from the order book, ported to paper: invoices self-join on the member key with a forward direction, NOT EXISTS keeps only true consecutive pairs (no third invoice between), and julianday arithmetic measures each silence in days. The deepest runs 196 days — Liam O'Brien's paper drought. The line is the finding's edge: 60 days would flag the ordinary monthly-cycle noise and the count would explode; 120 would hide the 91-to-119-day tier that still breached policy. Equality in the direction slot keeps nothing. 13 deep silences — the dunning audit's indictment, counted.",
  },
  {
    id: "cs-1667",
    tier: "hard",
    topic: "x8",
    universe: "growth",
    title: "The crown pot",
    brief:
      "From: Growth lead. Re: the champions' combined weight.\n\nThe four regional crowns — Grace, Alice, Bruno and Emma — get weighed together: their combined lifetime spend is the champions' pot. Rank per region, keep the kings, sum their weight.",
    ask: "What is the combined lifetime spend of the four regional champions?",
    template: `SELECT {3}(spend) AS crown_pot FROM (
  SELECT c.region, c.name, ROUND(SUM(o.total), 2) AS spend,
    RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) {1}) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region, c.id
) WHERE rk = {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown order",
        why: "DESC crowns each region's biggest spender — Grace 4574.23, Alice 7262.35, Bruno 852.44, Emma 6640.56. ASC would weigh the four quietest members instead: a pot of about 2900.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the crown line",
        noVerify: true,
        why: "The champions sit at rank 1 in their regions. Line 2 would weigh the runner-ups — a different pot for a different slide.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "SUM(spend) weighs the crowns together: 4574.23 + 7262.35 + 852.44 + 6640.56 = 19329.58. COUNT would print the headcount (4) and MAX the single heaviest crown (7262.35).",
      },
    ],
    distractors: ["ASC", "2", "COUNT", "AVG", "MAX"],
    walkthrough:
      "The champions' pot weighs 19329.58 — more than half the book's revenue held by just four members. The capstone chains the window to the fold: RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) crowns each region's heaviest spender, the outer WHERE rk = 1 keeps the four kings, and SUM(spend) weighs them together — Alice 7262.35, Emma 6640.56, Grace 4574.23, Bruno 852.44. The direction is the definition of a crown: ASC would rank from the cheapest up and the 'champions' pot' would hold the four quietest books. The fold is the deliverable: COUNT prints four — a headcount, not a weight; MAX prints Alice alone; AVG prints 4832.40, a per-crown average that answers nothing asked. 19329.58 — the concentration the board was built to see.",
  },
  {
    id: "cs-1668",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The busy calendar fold",
    brief:
      "From: Finance ops. Re: the busy-month roll call.\n\nA month is 'busy' when it carries seven or more orders. Fold every busy month into one alphabetical line for the close pack's calendar panel — and count matters less than the roll call itself.",
    ask: "What single folded line names every month carrying at least seven orders, alphabetical?",
    template: `SELECT {3}(mo, ', ' ORDER BY mo) AS busy_line FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, {2}(*) AS n FROM orders
  GROUP BY mo
) WHERE n >= {1};`,
    slots: [
      {
        answer: "7",
        kind: "number",
        label: "the busy line",
        noVerify: true,
        why: "Seven or more orders defines busy: eleven months qualify (five at 7, four at 8, two at 9). Lowering to 6 admits every month in the book — fourteen — and the roll call loses its filter.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the month tally",
        why: "COUNT(*) sizes each month so the gate can test it — the derived table's whole job. SUM or AVG would fold the asterisk and error before the gate ever ran.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the roll-call fold",
        why: "GROUP_CONCAT with the in-aggregate ORDER BY glues the eleven month keys into one alphabetical line. SUM or MAX cannot fold text — they error on the separator argument.",
      },
    ],
    distractors: ["6", "8", "SUM", "AVG", "MAX"],
    walkthrough:
      "Eleven months make the roll call — every month in the book except the three six-order stragglers. The capstone stages a derived table (GROUP BY mo with COUNT(*) sizing each month) and folds the survivors: WHERE n >= 7 keeps the eleven busy months, and GROUP_CONCAT(mo, ', ' ORDER BY mo) glues their keys into one alphabetical line — the calendar panel's entire story in a single cell. The line is the lever: 6 admits all fourteen months and the panel stops filtering anything; 8 cuts the roll call to six. The tally inside the stage is what makes the gate possible — COUNT(*) per month, computed before the outer fold ever runs. SUM, AVG or MAX cannot fold text with a separator. Eleven months, one line, alphabetical — the busy calendar, folded.",
  },
  {
    id: "cs-1669",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The smoothed sprint",
    brief:
      "From: Finance ops. Re: the two-month smooth.\n\nRaw monthly revenue is spiky; the trend slide smooths it with a two-month moving average — current month plus the one before, averaged. Read the smoothed figure for July 2024.",
    ask: "What is the two-month moving average of revenue through July 2024?",
    template: `SELECT mo, ma FROM (
  SELECT strftime('%Y-%m', created_at) AS mo,
    {3}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at) ROWS BETWEEN {2} PRECEDING AND CURRENT ROW) AS ma
  FROM orders GROUP BY mo
) WHERE mo = {1};`,
    slots: [
      {
        answer: "'2024-07'",
        kind: "keyword",
        label: "the read month",
        why: "The slide reads July 2024: the two-month window covering June and July averages to 1620.64. '2024-06' would read the May-June pair — a different point on the smoothing curve.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the window depth",
        noVerify: true,
        why: "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW is the two-month smooth. Widening to 2 PRECEDING would average three months and the July print would blend away the sprint.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the smoothing fold",
        why: "AVG over the sliding window is what makes it a moving average: (June + July) / 2 = 1620.64. SUM would print the two-month total — a stacked bar, not a smooth.",
      },
    ],
    distractors: ["'2024-06'", "'2025-01'", "2", "0", "SUM", "MAX"],
    walkthrough:
      "July 2024's smoothed revenue reads 1620.64 — June and July averaged, the two-month window damping the month's spike. The capstone is the sliding window: GROUP BY mo folds monthly revenue, AVG(SUM(total)) OVER (ORDER BY ... ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) averages each month with its predecessor, and the outer WHERE pins the read to July. The window depth is the smoothing contract: 2 PRECEDING would blend three months and the sprint would wash out; 0 PRECEDING would collapse the window to the current row and print July's raw figure. SUM would stack instead of smooth — a total, not an average — and MAX would print the heavier of the two months. Reading 2024-06 or 2025-01 moves the slide to a different point on the curve. 1620.64 — July, smoothed.",
  },
  {
    id: "cs-1670",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The lean arms",
    brief:
      "From: Controller. Re: the small-table lines.\n\nThe appendix stack lists all three sources, but the controller's summary table prints only the lean arms — sources with fewer than 50 rows. Build the stack, filter the arms, order them by name.",
    ask: "Which sources report fewer than 50 rows, in alphabetical order?",
    template: `SELECT source, rows_n FROM (
  SELECT 'orders' AS source, COUNT(*) AS rows_n FROM orders
  UNION ALL SELECT 'invoices', COUNT(*) FROM invoices
  UNION ALL SELECT 'payments', COUNT(*) FROM payments
) WHERE rows_n {1} {2}
ORDER BY source {3};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the lean test",
        why: "rows_n < 50 keeps the lean arms: invoices 28 and payments 27, dropping orders' 103. '>' would keep orders alone and the summary would lose the audited lines.",
      },
      {
        answer: "50",
        kind: "number",
        label: "the lean line",
        noVerify: true,
        why: "Fifty splits the stack cleanly: two arms under it, orders far above. A line of 30 would keep payments only, and 100 would let orders back into the summary.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the alphabetical read",
        why: "ASC orders the summary invoices-then-payments, matching the appendix's alphabetical convention. DESC would print payments first and the appendix would look shuffled.",
      },
    ],
    distractors: [">", "=", "25", "20", "DESC"],
    walkthrough:
      "Two lean arms make the summary: invoices 28, payments 27 — alphabetical, invoices first. The capstone builds the three-arm stack (orders 103, invoices 28, payments 27) and filters it like a table: WHERE rows_n < 50 drops the orders arm, and ORDER BY source ASC prints the survivors in appendix order. The line is the definition of lean: 30 would keep only payments — the invoices line, at 28, would survive a < 30 test? No: 28 < 30 keeps both; a 100-line would readmit orders at 103? No — 103 > 100 drops it still. The real lever is direction: '>' keeps orders alone and the summary prints one row where two belong. '=' matches nothing — no arm reports exactly 50. Two lean arms, alphabetical, one summary.",
  },
  {
    id: "cs-1671",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The EU position matrix",
    brief:
      "From: Collections. Re: the regional position grid.\n\nThe collections grid scopes the open-vs-paid census to Europe: how many EU members sit in the union, and how many are exclusively open — holding open paper with no payment history? One pass, both numbers.",
    ask: "How many EU members hold an open or paid invoice, and how many are open-only?",
    template: `SELECT COUNT(*) AS members,
  {3}(CASE WHEN p.customer_id IS {2} THEN 1 ELSE 0 END) AS open_only
FROM (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') o
FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid') p
  ON o.customer_id = p.customer_id
JOIN customers c ON c.id = {4}(o.customer_id, p.customer_id)
WHERE c.region = {1};`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the territory scope",
        why: "The grid scopes to Europe: six members in the open-or-paid union, three of them open-only. 'US' would read two members and zero open-only — a different territory's problem.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the exclusive flag",
        why: "p.customer_id IS NULL flags members the paid list never matched — the open-only three (Chloe, Liam, Pedro, all EU). NOT NULL would flag the both-side members instead.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the flag fold",
        why: "SUM totals the 1/0 flags: three open-only EU members. COUNT would tally every row's flag as 1 — six — reading the whole union as exclusive.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the either-side key",
        why: "Census members hold their key on whichever side matched: COALESCE(o.customer_id, p.customer_id) resolves it so every survivor finds a region. SUM cannot resolve a key — it errors.",
      },
    ],
    distractors: ["'US'", "'APAC'", "COUNT", "MAX"],
    walkthrough:
      "Europe's collections grid reads: six members on the open-or-paid books, three of them open-only — Chloe Dubois, Liam O'Brien and Pedro Alvarez, the never-paid trio, all EU. The capstone stacks the clinic's biggest moves: FULL OUTER JOIN preserves both invoice-state lists, the CASE flags each row's exclusivity (p NULL means never paid), COALESCE resolves the member key for the region join, and SUM totals the flags — with COUNT(*) reading the union's size. The scope is the memo: 'US' would read Emma plus Jamal — two members, zero open-only — and APAC three paid-only members with the same zero. NOT NULL would flag the both-side book (Alice and Isabella) and the hot-chase column would count settled accounts. COUNT in the flag slot reads six everywhere. Six members, three open-only — Europe's collections map in one row.",
  },
  {
    id: "cs-1672",
    tier: "hard",
    topic: "x8",
    universe: "refund-audit",
    title: "The ghost ladder, folded",
    brief:
      "From: Billing ops. Re: the champion chase order.\n\nThe ghost leaderboard folds into one line — the five never-invoiced members in spend order, biggest first, comma-separated. Build it with the window ranking the ladder and the anti-join isolating the ghosts.",
    ask: "What single folded line names the never-invoiced members in descending spend order?",
    template: `SELECT {3}(name, ', ' ORDER BY rk) AS ladder FROM (
  SELECT c.name, RANK() OVER (ORDER BY SUM(o.total) {2}) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  WHERE c.id {1} (SELECT customer_id FROM invoices)
  GROUP BY c.id
);`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the ghost gate",
        why: "NOT IN (SELECT customer_id FROM invoices) stages the five never-invoiced members. IN would stage the eleven billed members and the ladder would name the wrong book.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the chase order",
        why: "DESC ranks biggest spend first, so the ladder leads with Farid Nasser. ASC would lead with Dmitri Volkov — the gentlest ghost — and reverse the chase order.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the ladder fold",
        why: "GROUP_CONCAT with ORDER BY rk inside the fold glues the names in rank order — the window's ranking becomes the fold's ordering. SUM or MAX cannot fold text.",
      },
    ],
    distractors: ["IN", "ASC", "SUM", "MAX"],
    walkthrough:
      "The chase line reads: Farid Nasser, Keiko Sato, Bruno Silva, Noah Meyer, Dmitri Volkov — the five ghosts in descending spend, 1458.97 down to 599.26. The capstone stacks three moves: the anti-join (NOT IN the invoice book) isolates the ghost set, the window (RANK() OVER (ORDER BY SUM(o.total) DESC)) pins each ghost's ladder position, and GROUP_CONCAT with ORDER BY rk inside the fold glues the names in chase order — the window's ranking drives the fold's ordering, which is the pattern's whole point. The gate direction is the book: IN would stage the eleven billed members and the CRM would chase accounts that already have paper. ASC would reverse the ladder and lead the call sheet with the smallest unbilled book. SUM or MAX cannot fold names. One line, five names, biggest first.",
  },
  {
    id: "cs-1673",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The quartile walls",
    brief:
      "From: Finance ops. Re: the concentration ratio.\n\nThe concentration slide's punchline is a ratio: the top quartile's revenue pot divided by the bottom quartile's. Build both walls with NTILE and print the multiple to two decimals.",
    ask: "How many times larger is the top quartile's revenue pot than the bottom quartile's?",
    template: `SELECT {3}(top_pot / low_pot, 2) AS spread FROM (
  SELECT SUM(CASE WHEN q = 1 THEN spend END) AS top_pot,
         SUM(CASE WHEN q = 4 THEN spend END) AS low_pot
  FROM (
    SELECT c.id, SUM(o.total) AS spend,
      NTILE({2}) OVER (ORDER BY SUM(o.total) {1}) AS q
    FROM orders o JOIN customers c ON c.id = o.customer_id
    GROUP BY c.id
  )
);`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the wall direction",
        why: "DESC ranks biggest spend first, so quartile 1 is the top wall (22121.70) and quartile 4 the bottom (2395.05). ASC would swap the walls and the ratio would flip below one.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the wall count",
        noVerify: true,
        why: "NTILE(4) builds the quartile walls. NTILE(2) would build halves — top 29033.37 over bottom 5799.91 — and the ratio would soften to about 5.0.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the multiple finisher",
        why: "ROUND(top / low, 2) prints the concentration as 9.24x. SUM or AVG cannot take the , 2 argument — they error where ROUND consumes the precision.",
      },
    ],
    distractors: ["ASC", "2", "SUM", "AVG"],
    walkthrough:
      "The top quartile outweighs the bottom by 9.24 to one — 22121.70 against 2395.05, the concentration slide's punchline. The capstone nests three layers: the inner query folds each member's spend and NTILE(4) deals them into quartile walls, the middle layer prices each wall with conditional SUMs (CASE WHEN q = 1, WHEN q = 4), and the outer ROUND divides the walls into the 9.24 multiple. The direction builds the walls right: ASC would rank from the cheapest up and the 'top' wall would hold the poorest four members, flipping the ratio below one. NTILE(2) would halve the book and soften the ratio to roughly five. SUM or AVG in the finisher error on the ', 2' — ROUND consumes the precision argument legitimately. 9.24x — the book's concentration, measured wall to wall.",
  },
  {
    id: "cs-1674",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The crowned ghost",
    brief:
      "From: Billing ops. Re: the champion with no paper.\n\nOne regional champion has never been invoiced — a king with no paper. Cross the crown list with the dark roster and name the ghost who wears a crown, with their region.",
    ask: "Which regional champion has never been invoiced, and which region do they rule?",
    template: `SELECT name, region FROM (
  SELECT c.id, c.name, c.region,
    RANK() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rk
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region, c.id
) WHERE rk = {3} AND id {1} (
  SELECT {2}(o.customer_id, p.customer_id)
  FROM (SELECT DISTINCT customer_id FROM invoices WHERE status = 'open') o
  FULL OUTER JOIN (SELECT DISTINCT customer_id FROM invoices WHERE status = 'paid') p
    ON o.customer_id = p.customer_id
);`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the dark-roster test",
        why: "NOT IN the billing union keeps champions the invoice book never touched — Bruno Silva. IN would return the three billed crowns and the ghost would escape the audit.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the union key",
        why: "The billing union resolves each member's key from whichever side matched: COALESCE(o.customer_id, p.customer_id) builds the complete population the champions are tested against. SUM cannot resolve a key — it errors.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the crown line",
        noVerify: true,
        why: "The crown is rank 1 per region. Line 2 would test the runner-ups and the audit would miss the king entirely.",
      },
    ],
    distractors: ["IN", "SUM", "2", "3"],
    walkthrough:
      "Bruno Silva rules LATAM with 852.44 — and has never held an invoice. The capstone crosses two clinic constructions: the crown list (RANK() OVER (PARTITION BY c.region ...) pinned to rank 1) meets the dark roster (the open-or-paid member union built under FULL OUTER JOIN, keyed by COALESCE), and NOT IN keeps the champion the billing system never touched. The test direction is the audit: IN would return the three billed crowns — Alice, Grace and Emma — and the ghost king would slip past. The union key must resolve from either side: COALESCE reads the open key or the paid key per row; SUM cannot. Lines 2 and 3 would audit the runner-ups and miss the crown. Bruno Silva, LATAM — a regional champion with no paper, found by crossing the lists.",
  },
  {
    id: "cs-1675",
    tier: "hard",
    topic: "x8",
    universe: "month-close",
    title: "The total reach",
    brief:
      "From: Controller. Re: the appendix closer.\n\nThe close pack's final number: how many distinct members appear across the order and invoice books combined? Union the two member lists, deduplicated, and count the reach.",
    ask: "How many distinct members appear across the order and invoice books combined?",
    template: `SELECT {2}(*) AS reachable FROM (
  SELECT customer_id FROM orders
  {1} SELECT customer_id FROM {3}
);`,
    slots: [
      {
        answer: "UNION",
        kind: "keyword",
        label: "the dedup union",
        why: "UNION merges the two member lists and deduplicates — 16 distinct members, the whole roster. UNION ALL would keep every pair and count 131 rows of repeats.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach counter",
        why: "COUNT(*) sizes the deduplicated union: 16 members. SUM or AVG would fold the asterisk and error — the appendix wants a member count.",
      },
      {
        answer: "'invoices'",
        kind: "keyword",
        label: "the second book",
        why: "The reach spans orders and invoices — the second arm reads the invoice book. 'payments' would break the join: the payments table carries no customer_id and errors outright.",
      },
    ],
    distractors: ["UNION ALL", "INTERSECT", "EXCEPT", "'payments'", "SUM"],
    walkthrough:
      "The total reach is 16 — every member in the storefront appears in the order book, so the union with the invoice book deduplicates right back down to the full roster. The capstone is the set-operation family in miniature: UNION merges and deduplicates (16), UNION ALL would keep all 131 order-plus-invoice rows and count repeats, INTERSECT would keep only the 11 members on both books, and EXCEPT would keep only the 5 invoice-free ghosts — four operators, four different answers, one slot. The second arm's table is the join's spine: the payments table has no customer_id, so 'payments' there errors before any counting. COUNT(*) lands the appendix's final number. 16 members reached — every member the store has, on paper or in the cart.",
  },
];
