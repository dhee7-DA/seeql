// Case batch Q2 — Module 4 (subqueries & CTEs) cases cs-951…cs-1000, wave 2.
// 50 cases: 17 easy / 17 medium / 16 hard across topics q5 (derived tables) ×15,
// q6 (CTEs) ×15, q7 (recursive CTEs) ×10, q8 (subquery capstone) ×10.
// Every figure was probed against the live seed db (scripts/m4-cases-w2-facts.ts
// W01–W63 + scripts/m4-w2-q5-edges*.ts + wave-1 receipt pool) and is mechanically
// re-verified by scripts/case-audit.ts (structure, execution, figure-in-cell,
// distractor consequence, prose gates, WITH requirement for q6/q7, RECURSIVE for q7).

import type { CaseStudy } from "./types";

export const casesQ2: CaseStudy[] = [
  {
    id: "cs-951",
    tier: "easy",
    topic: "q5",
    universe: "month-close",
    title: "Sixteen lines on the stage",
    brief:
      "From: Controller. Re: close checklist item 5.\n\nBefore we reconcile lifetime spend I need to see the stage itself: one line per account, no matter how many orders feed it. Tell me how many lines the per-customer stage holds and what those spend lines add up to — two figures, straight from the database.",
    ask: "Count the rows in the per-customer spend stage and total them.",
    template: `SELECT {1}(*) AS staged,
       ROUND({2}(spend), 2) AS total_spend
FROM (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the stage row-counter",
        why: "The deliverable is how many lines the stage holds. COUNT(*) counts rows without reading a single column, which is exactly what a stage census needs.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stage adder",
        why: "The controller wants the stage's spend lines added up. SUM(spend) runs over the derived rows and reproduces the store's 34833.28 grand total.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "One line per account means the stage folds on customer_id, collapsing 103 orders into 16 spend lines before the outer query sees them.",
      },
    ],
    distractors: ["MAX", "COUNT", "AVG", "shipped_at"],
    walkthrough:
      "The inner query is the stage: folding on customer_id turns 103 orders into 16 lifetime-spend lines (W01). The outer query walks the stage twice — COUNT(*) reports 16 lines, SUM(spend) adds them back to 34833.28, matching the store total (W09, W56) because the stage threw nothing away. Folding the stage on total instead keeps one line per distinct order amount — 103 lines (E01) — and folding on shipped_at shatters it into 76 (E02); either way the census is wrong. Swapping the outer SUM for COUNT would print 16 twice: a census where a total belongs.",
  },
  {
    id: "cs-952",
    tier: "easy",
    topic: "q5",
    universe: "growth",
    title: "The board's top five",
    brief:
      "From: Chief of staff. Re: board deck slide 3.\n\nLeadership opens every review with the same slide: our five biggest lifetime accounts, biggest first, names attached. Build it from a spend stage rather than eyeballing orders — the deck goes to investors, so the stitch between the stage and the roster has to be exact.",
    ask: "Rank the top 5 customers by lifetime spend, largest first.",
    template: `SELECT c.name, ROUND(s.spend, 2) AS spend
FROM customers c
JOIN (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
) s ON {1}
ORDER BY s.spend {2}
LIMIT {3};`,
    slots: [
      {
        answer: "s.customer_id = c.id",
        kind: "keyword",
        label: "the stitch",
        why: "The stage carries bare customer_ids; matching them to customers.id re-attaches names one-to-one. Any other join condition pairs rows arbitrarily and multiplies the roster.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the leaderboard direction",
        why: "Boards read the heavy hitters first. DESC puts Alice Chen's 7262.35 on line one; ASC would open the slide with the smallest account.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the slide's row count",
        why: "The deck holds five names — the LIMIT constant comes from the slide layout, not from the result cells.",
      },
    ],
    distractors: ["c.id = c.id", "ASC", "3"],
    walkthrough:
      "The stage sums each account's orders; the stitch s.customer_id = c.id re-attaches names; the outer query sorts by stage spend and keeps five. Result: Alice Chen 7262.35, Emma Wilson 6640.56, Grace Kim 4574.23, Maya Patel 3644.56, Chloe Dubois 2667.93 (W02). A lazy stitch like c.id = c.id is always true, so every customer pairs with every stage line — 256 rows of noise before the LIMIT (F07). Flipping to DESC's opposite hands the board the bottom five, opening with Olivia Brown's 444.80 (E14) instead of the flagship account.",
  },
  {
    id: "cs-953",
    tier: "easy",
    topic: "q5",
    universe: "pricing",
    title: "Priced above their shelf",
    brief:
      "From: Pricing analyst. Re: premium-flag review.\n\nA product earns our premium tag when it outsits its own category's average — not the catalog-wide one. Stage the category averages, then flag every product priced above its shelf's mean. How many products carry the flag?",
    ask: "Count products priced above their own category's average price.",
    template: `SELECT {3}(*) AS premium
FROM products p
JOIN (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY {1}
) ca ON {2}
WHERE p.price > ca.avg_price;`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the stage's shelf key",
        why: "Averages must be per shelf: grouping by category yields seven averages that every product can be held against. Grouping by name would give each product its own price as its own average — a meaningless stage.",
      },
      {
        answer: "ca.category = p.category",
        kind: "keyword",
        label: "the shelf matcher",
        why: "Each product must meet its own category's average. Matching category keys keeps the comparison within the shelf; a tautology would compare every product against every shelf at once.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the flag counter",
        why: "The deliverable is a headcount of flagged products. COUNT(*) collapses the surviving rows into the single number the pricing review wants.",
      },
    ],
    distractors: ["name", "p.category = p.category", "AVG"],
    walkthrough:
      "The stage computes one average per shelf — Wearables 139.5, Audio 109.66, Video 84.5 and so on. Joining products back on category and keeping price > avg_price flags 7 products (W15): Smart Watch S 199.99 over Wearables' 139.5, Noise-Canceling Headset 149.99 over Audio's 109.66, down to Laptop Stand Aluminum 42.5 over Accessories' 27.49 (W14). Grouping the stage by name collapses it to self-averages and the matcher can't even find ca.category (F18) — the query dies at prepare time. A tautological matcher pairs all 16 products with all 7 shelf averages and counts 54 hits (E06), triple the truth.",
  },
  {
    id: "cs-954",
    tier: "easy",
    topic: "q5",
    universe: "expense",
    title: "Where the money went",
    brief:
      "From: Finance ops. Re: quarterly spend note.\n\nThe board note opens with one line: what we spent, biggest bucket first. Stage the expense book into per-bucket totals — cents divided into dollars — and lay them out heaviest at the top. No bar, no filter: all four buckets, ranked.",
    ask: "Rank every expense category by total spend, heaviest first.",
    template: `SELECT category, ROUND(total, 2) AS total
FROM (
  SELECT category, {2} AS total
  FROM expenses
  GROUP BY {1}
) e
ORDER BY total {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the bucket key",
        why: "Buckets are expense categories. Grouping the stage by category folds 36 expense rows into 4 bucket lines — the grain the board note reads.",
      },
      {
        answer: "SUM(amount_cents)/100.0",
        kind: "keyword",
        label: "the cents-to-dollars adder",
        why: "amount_cents is stored in cents; summing then dividing by 100.0 converts to real dollars. Averaging instead would answer 'typical receipt', not 'total bucket'.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "The note opens with the biggest bucket, so the stage output must sort descending by total. ASC would lead with the smallest line.",
      },
    ],
    distractors: ["amount_cents", "AVG(amount_cents)/100.0", "ASC"],
    walkthrough:
      "The stage folds 36 receipts into 4 bucket totals: Rent 16800, Ads 4570, Travel 2521, Tools 1525 (W17). DESC leads the note with rent, as written. Averaging per bucket answers a different question — Rent's average receipt is 1200 (E04) because rent repeats monthly at full weight while travel receipts vary — and the note's lead figure would shrink five-fold. Sorting ASC flips the story to Tools-first, burying the bucket leadership actually asks about. Folding on amount_cents instead of category regrinds the stage to one line per distinct receipt size, wrecking the four-bucket shape.",
  },
  {
    id: "cs-955",
    tier: "easy",
    topic: "q5",
    universe: "refund-audit",
    title: "Paid, by account",
    brief:
      "From: Refunds lead. Re: settlement outreach.\n\nBefore we touch refund reserves I want the two accounts with the largest PAID invoice totals — settled money only, nothing still open. Stage the paid invoices per account and bring back the top of that list with names attached.",
    ask: "List the 2 customers with the highest paid-invoice totals.",
    template: `SELECT c.name, ROUND(p.paid, 2) AS paid
FROM customers c
JOIN (
  SELECT customer_id, {2} AS paid
  FROM invoices
  WHERE status = {1}
  GROUP BY customer_id
) p ON p.customer_id = c.id
ORDER BY p.paid DESC
LIMIT {3};`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settlement filter",
        why: "Only settled money counts for this outreach. The stage must filter invoices to status 'paid' before totaling — open or void invoices would poison the ranking.",
      },
      {
        answer: "SUM(amount_cents)/100.0",
        kind: "keyword",
        label: "the dollar adder",
        why: "Invoice amounts live in cents; summing per account then dividing by 100.0 yields real dollars. Counting rows would rank by how many invoices, not how much money.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the call-list length",
        why: "Outreach takes the top two accounts — the LIMIT constant comes from the call list, not from any result cell.",
      },
    ],
    distractors: ["'open'", "COUNT(*)", "3"],
    walkthrough:
      "The stage keeps paid invoices only, folds them per account, and the outer query ranks the result: Alice Chen 20481.00 then Maya Patel 11542.00 (W16). Loosening the filter to 'open' stages unsettled money instead and hands back Alice 6148 then Emma 4937 (E15) — a completely different call list. Swapping SUM for COUNT ranks by invoice count, where Alice and Maya tie at 4 (F13) and the 'how much' question silently becomes 'how many'.",
  },
  {
    id: "cs-956",
    tier: "medium",
    topic: "q5",
    universe: "supplier",
    title: "Beating the neighborhood average",
    brief:
      "From: Sourcing director. Re: Q3 supplier review.\n\nA supplier earns 'regional star' status when its rating beats its own region's average — not the global one, the neighborhood's. Stage the per-region averages, then count how many suppliers out-rate their home region. One number for the review deck.",
    ask: "Count suppliers whose rating beats their own region's average rating.",
    template: `SELECT {3}(*) AS beat_region
FROM suppliers s
JOIN (
  SELECT region, AVG(rating) AS region_avg
  FROM suppliers
  GROUP BY {1}
) ra ON {2}
WHERE s.rating > ra.region_avg;`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the neighborhood key",
        why: "The stage must carry one average per region, so it folds on region. Folding on name would give every supplier its own rating as its own average — a stage with nothing to compare against.",
      },
      {
        answer: "ra.region = s.region",
        kind: "keyword",
        label: "the home-region matcher",
        why: "Each supplier must face its own region's bar. Matching region keys keeps the duel local; a tautology would let every supplier spar with every region at once.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the star counter",
        why: "The review wants one number: how many stars. COUNT(*) collapses the surviving supplier rows into that figure.",
      },
    ],
    distractors: ["city", "status", "ROUND"],
    walkthrough:
      "The stage holds two bars after folding on region: EU 4.7 and APAC 4.0 (W18). Two suppliers clear their home bar — Alpine Audio GmbH at 4.8 over EU's 4.7, and Shenzhen Electro at 4.1 over APAC's 4.0 — so COUNT(*) reports 2 (F06). A tautological matcher would be always true, letting every supplier spar with every region — pairings, not suppliers. Point the stage's fold at city or status and the inner query dies at prepare time: suppliers carry neither column (F18), so nothing survives to count. ROUND in the outer slot dies the same way — ROUND(*) is not an aggregate.",
  },
  {
    id: "cs-957",
    tier: "medium",
    topic: "q5",
    universe: "funnel",
    title: "The heavy-spend shortlist",
    brief:
      "From: Growth marketer. Re: upsell pilot.\n\nThe upsell pilot targets accounts whose LIFETIME spend clears 3000 — not a single big order. Stage lifetime spend per customer, keep the heavy side of that bar, and tell me how many accounts make the pilot. One figure for the kickoff.",
    ask: "Count customers whose lifetime spend exceeds 3000.",
    template: `SELECT {3}(*) AS heavy
FROM (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
) t
WHERE spend {1} {2};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the heavy side",
        why: "The pilot enrolls spenders ABOVE the bar. Pointing the comparison the other way builds the light-spend list — the exact complement of the pilot.",
      },
      {
        answer: "3000",
        kind: "number",
        noVerify: true,
        label: "the pilot bar",
        why: "3000 is the pilot's written threshold — a filter constant from the playbook, not an output figure.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the head-counter",
        why: "The kickoff needs one number: how many accounts qualify. COUNT(*) reduces the filtered stage to that figure.",
      },
    ],
    distractors: ["<", "<>", "MAX"],
    walkthrough:
      "The stage sums lifetime spend per account; the outer query keeps the heavy side of 3000 and counts: 4 accounts make the pilot — Alice, Emma, Grace, Maya (W04, W02). Point the comparison downward and you get the 12 light accounts (E16) — everyone the pilot excludes. The not-equal probe keeps all 16 (F14): no account sits exactly on 3000, so 'different from the bar' is just 'everybody', which is not a shortlist. MAX instead of COUNT would try MAX(*) and die on syntax — aggregates need a column or a star, and only COUNT takes the star here.",
  },
  {
    id: "cs-958",
    tier: "medium",
    topic: "q5",
    universe: "inventory",
    title: "The three biggest tickets",
    brief:
      "From: Ops manager. Re: invoice spot-check.\n\nFor the audit binder I need the three largest orders by total amount — and I want them listed oldest first by order id, with the owning account visible. Stage the top of the order book, then present it in id order.",
    ask: "Show the 3 highest-total orders with their customer ids, ordered by id.",
    template: `SELECT id, {3}, total
FROM (
  SELECT * FROM orders
  ORDER BY {1} DESC
  LIMIT {2}
) t
ORDER BY id;`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the size measure",
        why: "Biggest ticket means biggest total. The stage must sort orders by total descending before trimming to three; any other sort key trims a different three.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the binder's row count",
        why: "The binder page holds three tickets — the LIMIT constant comes from the audit layout, not from result cells.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the owning account",
        why: "The spot-check traces each ticket to its account, so the projection must include customer_id. Statuses or dates would leave the binder unable to answer 'whose order'.",
      },
    ],
    distractors: ["created_at", "id", "status"],
    walkthrough:
      "The stage sorts all 103 orders by total descending and keeps three; the outer query re-sorts by id for the binder: order #39 at 845.92 (customer 5), #43 at 945.21 (customer 3), #74 at 1088.44 (customer 6) (W07). Sorting by created_at instead trims the NEWEST three — ids 97, 98, 100 with totals 585.79, 608.06, 125.88 (E18) — recency is not size. Sorting by id grabs the last three insertions, 101–103 (E07), none of which belongs on this page. Projecting status instead of customer_id leaves the binder with a column of words where account numbers belong.",
  },
  {
    id: "cs-959",
    tier: "medium",
    topic: "q5",
    universe: "month-close",
    title: "The stage's vital signs",
    brief:
      "From: Controller. Re: close checklist item 7.\n\nThe close pack carries three vital signs of customer value: average lifetime spend, the floor account, and the ceiling account — all read OFF the stage, not off raw orders. Build the per-customer stage and print all three figures, rounded to cents.",
    ask: "Report average, minimum, and maximum lifetime spend per customer.",
    template: `SELECT ROUND(AVG(spend), 2) AS avg_spend,
       ROUND({3}(spend), 2) AS floor_spend,
       ROUND(MAX(spend), 2) AS ceil_spend
FROM (
  SELECT customer_id, {1}(total) AS spend
  FROM orders
  GROUP BY {2}
);`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stage's money adder",
        why: "Lifetime spend per account means summing order totals inside the stage. Averaging inside would stage per-order typicals and every vital sign downstream changes meaning.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "Vital signs are per CUSTOMER, so the stage folds on customer_id — 103 orders collapse to 16 account lines before any aggregate reads them.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor finder",
        why: "The pack's floor line asks for the smallest lifetime spend. MIN over the stage returns the lightest account; MAX would just duplicate the ceiling line.",
      },
    ],
    distractors: ["AVG", "MAX", "COUNT", "MIN"],
    walkthrough:
      "The stage sums lifetime spend per account; the outer query reads three figures off it: average 2177.08, floor 444.80 (Olivia Brown), ceiling 7262.35 (Alice Chen) (W06, E14). Averaging INSIDE the stage instead yields per-account typical orders, and the average of those averages is 370.15 (F19) — the stage now measures orders, not accounts. Taking MAX for the floor line prints 7262.35 twice: a pack with two ceilings and no floor; taking MIN inside the stage stages each account's smallest order and every vital sign re-speaks. COUNT in any slot prints how many, not how much — the floor line would read 1 order (F09). The classic two-bars trap (W54) in stage form.",
  },
  {
    id: "cs-960",
    tier: "medium",
    topic: "q5",
    universe: "catalog",
    title: "Two roads to eight",
    brief:
      "From: Merch analyst. Re: methodology note.\n\nWe can find big spenders two ways: a scalar subquery per customer row, or a derived stage joined back. For the methodology note, build the STAGE version — stage lifetime spend per account, keep the side above 1000, count them. The note's point is that both roads land on the same figure.",
    ask: "Count customers with lifetime spend above 1000 using a derived stage.",
    template: `SELECT {3}(*) AS big_spenders
FROM (
  SELECT customer_id, {1}(total) AS spend
  FROM orders
  GROUP BY customer_id
) s
WHERE spend > {2};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stage's money adder",
        why: "Lifetime spend means adding order totals per account. COUNT would stage how many orders each account placed — frequency, not money — and no frequency reaches 1000.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the note's bar",
        why: "The methodology note pins the big-spender bar at 1000 — a written constant, not an output figure.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the head-counter",
        why: "The deliverable is a single figure: how many accounts clear the bar. COUNT(*) collapses the filtered stage to that number.",
      },
    ],
    distractors: ["COUNT", "AVG", "SUM"],
    walkthrough:
      "The stage sums lifetime spend per account (16 lines), the bar keeps the eight above 1000 (W11) — identical to the scalar-pushdown answer, which is the note's whole point (W10). Stage COUNT instead and every staged 'spend' is an order count below 25, so zero accounts clear 1000 (F10): the query answers a question nobody asked. AVG inside the stage yields per-account typical order (average of those averages 370.15, F19) and clears the bar for nobody in the same way. The outer SUM in place of COUNT would die on SUM(*) — the star belongs to COUNT alone.",
  },
  {
    id: "cs-961",
    tier: "hard",
    topic: "q5",
    universe: "fraud",
    title: "One-product shelves don't count",
    brief:
      "From: Risk analyst. Re: vendor-bench review.\n\nA category is only a real shelf if at least two products sit on it — single-item categories are ordering quirks, not lines of business. Stage category averages but keep only shelves with two or more products, then count how many real shelves the catalog has. The single-product shelf must not survive the stage.",
    ask: "Count categories that carry at least two products.",
    template: `SELECT {3}(*) AS real_shelves
FROM (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
  HAVING {1} > {2}
) ca;`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the shelf-depth test",
        why: "HAVING filters folded groups, so the depth check counts rows per group: COUNT(*) > 1 keeps shelves with two or more products and evicts the one-product quirk.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the minimum depth",
        why: "Two or more products means the count must exceed 1 — the written rule's constant, a filter literal that never appears in the result cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf counter",
        why: "The deliverable is how many real shelves survive the stage. COUNT(*) over the stage rows prints that number.",
      },
    ],
    distractors: ["AVG(*)", "SUM(*)", "2", "ROUND"],
    walkthrough:
      "The stage folds products by category and HAVING COUNT(*) > 1 evicts every single-product shelf — Fitness, a lone item at 32, drops out — leaving 6 real shelves (E09), and COUNT over the stage prints 6. Raise the bar past 2 and only the trio shelves (Accessories, Audio, Electronics, three products each) survive: 3 shelves (F05) — a different rule than the memo wrote. AVG(*) or SUM(*) in a HAVING dies on syntax: aggregates over a star belong to COUNT, and the filter needs a row count, not a price. The outer query is a pure census — the stage does the judging.",
  },
  {
    id: "cs-962",
    tier: "hard",
    topic: "q5",
    universe: "growth",
    title: "Nobody beneath the bar",
    brief:
      "From: Board analyst. Re: two-bars footnote.\n\nThe deck's footnote claims some customers' LIFETIME spend sits below the AVERAGE single order — and the CFO calls it impossible. Stage lifetime spend per account, test the light side of 338.19, and hand me the count that settles the argument. The answer may be smaller than anyone expects.",
    ask: "Count customers whose lifetime spend is below the average order total of 338.19.",
    template: `SELECT {3}(*) AS beneath
FROM (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
) t
WHERE spend {1} {2};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the light side",
        why: "The footnote claims spend BELOW the average order, so the comparison points down. Turning it up answers a different question and hides the punchline.",
      },
      {
        answer: "338.19",
        kind: "number",
        noVerify: true,
        label: "the average-order bar",
        why: "338.19 is the storewide average order (W54) used as a filter constant here — the memo's bar, not an output cell.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the verdict counter",
        why: "One number settles the CFO debate: how many accounts sit beneath the bar. COUNT(*) over the filtered stage prints it.",
      },
    ],
    distractors: [">", "<>", "MIN"],
    walkthrough:
      "The stage sums lifetime spend per account; the filter keeps the light side of 338.19 and counts: 0 (W12). The punchline is the floor — the SMALLEST lifetime spend in the book is Olivia Brown's 444.80 (W06, E14), which already clears a single average order, so every one of the 16 accounts sits above the bar. Point the comparison up and you count everybody (16, E17); test not-equal and nobody sits exactly on 338.19, so again 16 (F14) — neither settles the footnote. MIN instead of COUNT dies on MIN(*): the star is COUNT's alone. A zero that proves a rule beats a sixteen that proves nothing.",
  },
  {
    id: "cs-963",
    tier: "hard",
    topic: "q5",
    universe: "funnel",
    title: "Regional champions",
    brief:
      "From: Regional GM. Re: quarterly kickoff.\n\nEvery region has one heavyweight account and I want their numbers on the kickoff slide: per region, the biggest LIFETIME spend any single customer carries there. Stage spend per region-per-customer, then read each region's champion line off the stage. Four regions, four figures.",
    ask: "Show each region's highest single-customer lifetime spend.",
    template: `SELECT region, ROUND(MAX({3}), 2) AS champion_spend
FROM (
  SELECT c.region, c.name, SUM(o.total) AS spend
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  GROUP BY {1}, c.name
) t
GROUP BY {2};`,
    slots: [
      {
        answer: "c.region",
        kind: "keyword",
        label: "the stage's region key",
        why: "The stage folds on region-per-customer, so the group-by pairs the region key with name. Folding on a slice like status would chop each account's spend into pieces no piece of which reaches the champion figure.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the outer roll-up",
        why: "Champions are per region: the outer query folds the stage by region and takes the biggest staged line in each. Folding by name would print 16 champions, not 4.",
      },
      {
        answer: "spend",
        kind: "keyword",
        label: "the champion measure",
        why: "The champion line is the biggest STAGED SPEND per region. The outer query can only aggregate columns the stage projects — id or total never survive the stage.",
      },
    ],
    distractors: ["o.status", "id", "total"],
    walkthrough:
      "The stage folds orders by region and customer, one line per account per region (16 lines); the outer query folds by region and takes each region's max: EU 7262.35 (Alice), US 6640.56 (Emma), APAC 4574.23 (Grace), LATAM 852.44 (E11). Folding the stage by status instead chops every account into delivered/shipped/pending slices, and the biggest slice per region tops out at 3822.38 (US) — champions demoted to their best status. Swapping the measure to id or total dies at prepare time: the stage projects region, name, and spend, and the outer roll-up cannot aggregate columns that never survived the stage.",
  },
  {
    id: "cs-964",
    tier: "hard",
    topic: "q5",
    universe: "refund-audit",
    title: "Settled business only",
    brief:
      "From: Refunds lead. Re: exposure review.\n\nRefund exposure hides in accounts whose SETTLED orders — delivered plus shipped — already clear 2000 lifetime. Stage settled spend per account and count who crosses the bar. Cancelled and pending money must never touch this stage.",
    ask: "Count customers whose delivered-plus-shipped lifetime spend exceeds 2000.",
    template: `SELECT COUNT(*) AS settled_heavy
FROM (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  WHERE status {1}
  GROUP BY customer_id
) s
WHERE spend {3} {2};`,
    slots: [
      {
        answer: "IN ('delivered', 'shipped')",
        kind: "keyword",
        label: "the settled-status set",
        why: "Settled means exactly two statuses, which is what IN is for. Shipping-only stages half the business; staging cancelled would measure the loss book instead.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the exposure bar",
        why: "2000 is the review's written threshold — a filter constant, not an output figure.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the exposure side",
        why: "Exposure review counts accounts ABOVE the bar. Pointing the filter down counts the safe accounts — the complement of the question.",
      },
    ],
    distractors: ["= 'shipped'", "IN ('cancelled')", "<"],
    walkthrough:
      "The stage sums only delivered and shipped orders per account — all 16 accounts have settled business — and the outer filter counts 4 accounts above 2000 (E12): Alice, Emma, Grace, Maya (W02). Shipping-only stages half the story and clears the bar for just 2 accounts (F01); staging cancelled instead measures the loss book, where nobody reaches 2000 (F02). Point the filter down and you get the 12 safe accounts (light side of the settled stage) — the review asked for exposure, not comfort. The status set is the whole case: change what enters the stage and every figure downstream re-speaks.",
  },
  {
    id: "cs-965",
    tier: "hard",
    topic: "q5",
    universe: "catalog",
    title: "Stage math on the shelf",
    brief:
      "From: Merch analyst. Re: premium-line pricing.\n\nThe premium line's price point needs one figure: the combined price of every product that outsits its own category's average. Stage the shelf averages, join products back, keep the above-average side, and total their prices in dollars.",
    ask: "Total the prices of all products priced above their category average.",
    template: `SELECT ROUND({1}(price), 2) AS figure
FROM products p
JOIN (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
) ca ON ca.category = p.category
WHERE p.price {2} ca.{3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the combined-price adder",
        why: "The price point needs the premium set ADDED UP. Averaging would print a typical premium price and COUNT would print how many — neither is a price point.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the premium side",
        why: "Premium means ABOVE the shelf average. Flipping the comparison stages the below-average side — a discount rack, not a premium line.",
      },
      {
        answer: "avg_price",
        kind: "keyword",
        label: "the stage's bar column",
        why: "The stage exposes one column of bars, avg_price; the WHERE must read that column. Pointing at the stage's category key compares a price to a word — a type mismatch that empties the set.",
      },
    ],
    distractors: ["AVG", "COUNT", "<", "category"],
    walkthrough:
      "The stage computes seven shelf averages; the join-back keeps products above their own shelf's bar — 7 products (W15) — and SUM over their prices prints 795.47 (F03): Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129, Studio Desktop Mic 119, Mechanical Keyboard K1 89.99, Cycling Jersey Pro 65, Laptop Stand Aluminum 42.5 (W14). Averaging the set answers 113.64 (F04) — a typical premium piece, not the line's combined weight; counting answers 7. Flipping to the light side assembles the discount rack instead. Comparing price to ca.category pits a number against text in SQLite's type order — nothing survives, SUM of nothing prints NULL.",
  },
  {
    id: "cs-966",
    tier: "easy",
    topic: "q6",
    universe: "month-close",
    title: "Name the stage once",
    brief:
      "From: Controller. Re: close checklist item 9.\n\nRewrite the big-spender census as a named stage instead of a nested parenthetical: declare the spend stage up front, then count who clears 1000 from it. The close pack's reviewers read CTEs faster than nested subqueries — same eight, cleaner story.",
    ask: "Count customers whose lifetime spend exceeds 1000 using a CTE.",
    template: `{1} spend AS (
  SELECT customer_id, SUM(total) AS s
  FROM orders
  GROUP BY {2}
)
SELECT COUNT(*) AS vips
FROM spend
WHERE s > {3};`,
    slots: [
      {
        answer: "WITH",
        kind: "keyword",
        label: "the stage declaration",
        why: "A CTE is declared with WITH, which names the stage before the main query runs. Nothing else can introduce a named stage — UNION or AS in that seat is a syntax error.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "Lifetime spend per account means folding on customer_id. Folding on a column like shipped_at stages timestamps, and the VIP census counts something else entirely.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the vip bar",
        why: "The close pack's big-spender bar is 1000 — a written threshold, not an output figure.",
      },
    ],
    distractors: ["AS", "total", "shipped_at"],
    walkthrough:
      "WITH names the stage 'spend' — one row per account with its lifetime total (16 lines) — and the main query counts the eight above 1000 (W21, W11). The WITH keyword is the only door into CTE-land: AS or UNION in that seat dies at 'SELECT' with a syntax error (W34). Folding the stage on total instead of customer_id regrinds it to one line per distinct amount, and only 1 line clears 1000 (G01); folding on shipped_at yields 2 (G02) — both count the wrong universe. The result matches the nested-subquery version exactly; the shape changed, the answer didn't.",
  },
  {
    id: "cs-967",
    tier: "easy",
    topic: "q6",
    universe: "growth",
    title: "Two bars, one stage",
    brief:
      "From: Chief of staff. Re: tier-size slide.\n\nThe tier slide needs two figures from the same spend stage: accounts above 1000 and accounts above 2000. Build the stage ONCE and read both counts off it — rebuilding it twice is exactly what the CTE form exists to avoid.",
    ask: "Count customers above 1000 and above 2000 lifetime spend, from one stage.",
    template: `WITH spend AS (
  SELECT customer_id, SUM(total) AS s
  FROM orders
  GROUP BY {1}
)
SELECT (SELECT {2}(*) FROM spend WHERE s > 1000) AS over_1000,
       (SELECT COUNT(*) FROM spend WHERE s > {3}) AS over_2000;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "Both bars read the same per-account stage, so the fold must be customer_id — 103 orders collapsed to 16 spend lines the two counts share.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the lower-tier counter",
        why: "The first figure is a headcount above 1000. SUM would add the spend lines instead and print a dollar figure where a membership count belongs.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the upper bar",
        why: "The slide's upper tier starts at 2000 — the written tier boundary, not an output cell.",
      },
    ],
    distractors: ["SUM", "AVG", "1000"],
    walkthrough:
      "One stage, two readings: 8 accounts clear 1000 and 5 clear 2000 (W21) — the exact reuse pattern that makes CTEs worth naming. SUM in the counter seat prints the lower tier's dollar mass (29033-ish) instead of its 8 members — money where membership belongs. Averaging prints a typical spend, not a count. The two scalar probes both walk the same named stage; SQLite reads it once as a MATERIALIZE (W37), which is the engine's way of honoring 'build it once'.",
  },
  {
    id: "cs-968",
    tier: "easy",
    topic: "q6",
    universe: "refund-audit",
    title: "The paid club, staged",
    brief:
      "From: Refunds lead. Re: settlement summary.\n\nFor the settlement summary I need the size of the paid club — accounts with at least one PAID invoice. Declare the member list as a named stage, then count the roster against it. Same number as last quarter's ad-hoc query, but now the stage has a name the whole team can reuse.",
    ask: "Count customers who appear in the paid-invoice stage.",
    template: `{1} paid AS (
  SELECT customer_id
  FROM invoices
  WHERE status = {2}
)
SELECT COUNT(*) AS paid_club
FROM customers
WHERE id IN (SELECT customer_id FROM {3});`,
    slots: [
      {
        answer: "WITH",
        kind: "keyword",
        label: "the stage declaration",
        why: "WITH names the member list 'paid' before the main query runs. The club is a named stage, not an anonymous nested SELECT.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the membership rule",
        why: "The club's entry rule is a settled invoice. Open invoices stage a different club — six accounts with money still in flight.",
      },
      {
        answer: "paid",
        kind: "keyword",
        label: "the stage the roster checks",
        why: "The main query matches customers against the named stage 'paid'. Pointing the IN at raw invoices would count everyone with any invoice at all.",
      },
    ],
    distractors: ["AS", "'open'", "invoices"],
    walkthrough:
      "WITH stages the paid-invoice member list; the roster check counts 8 customers who appear in it (W30). Point the inner filter at 'open' instead and the stage holds a different club — 6 accounts still in flight (G03). Point the IN at the raw invoices table and the count jumps to 11 (G04): every account with any invoice, settled or not — a membership rule nobody wrote. AS in the declaration seat is a syntax error; WITH is the only way in (W34).",
  },
  {
    id: "cs-969",
    tier: "easy",
    topic: "q6",
    universe: "expense",
    title: "Travel, staged to dollars",
    brief:
      "From: Finance ops. Re: T&E footnote.\n\nThe T&E footnote needs one figure: total travel spend in dollars. Stage it — sum the travel receipts, convert cents to dollars — then read the figure off the stage. The stage name is what the footnote's methodology box cites.",
    ask: "Report total Travel expense in dollars via a CTE.",
    template: `{4} t AS (
  SELECT {1}(amount_cents)/100.0 AS amt
  FROM expenses
  WHERE {2}
)
SELECT ROUND(amt, 2) AS travel_total
FROM {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stage's adder",
        why: "A total is a sum: SUM(amount_cents)/100.0 converts the bucket to dollars. COUNT would stage how many receipts, and dividing receipts by 100 is not money.",
      },
      {
        answer: "category = 'Travel'",
        kind: "keyword",
        label: "the bucket rule",
        why: "The footnote's bucket is Travel. Tools or Ads would stage a different bucket's dollars under the same footnote.",
      },
      {
        answer: "t",
        kind: "keyword",
        label: "the named stage",
        why: "The main query reads the figure from the stage the WITH clause named. Any other name either points at a table without an amt column or at nothing at all.",
      },
      {
        answer: "WITH",
        kind: "keyword",
        label: "the declaration keyword",
        why: "WITH introduces the named stage. AS or UNION in that seat cannot declare anything — the parser stops before the query exists.",
      },
    ],
    distractors: ["COUNT", "AVG", "category = 'Tools'", "expenses", "s", "AS"],
    walkthrough:
      "WITH declares stage t: the travel receipts summed and divided into dollars — 2521.00 (W33, W17). The main query reads that one figure off the named stage. COUNT instead stages 3 receipts and divides by 100 — 0.03, money-shaped nonsense. Tools stages the wrong bucket (1525). Reading the figure from expenses directly dies because raw receipts carry amount_cents, not amt — the stage's conversion is the whole point. And the declaration has exactly one keyword: WITH (W34).",
  },
  {
    id: "cs-970",
    tier: "easy",
    topic: "q6",
    universe: "supplier",
    title: "The region chain, staged",
    brief:
      "From: Expansion analyst. Re: partner-map appendix.\n\nThe appendix's headline table: lifetime demand per region, heaviest region first, top four rows. Stage the region roll-up — customers joined to their orders — and let the main query trim it. The chain must be joined properly; every order belongs to exactly one account.",
    ask: "Rank the top 4 regions by customer lifetime spend.",
    template: `WITH region_spend AS (
  SELECT c.region, SUM(o.total) AS spend
  FROM customers c
  {1} orders o ON o.customer_id = c.id
  GROUP BY {2}
)
SELECT region, ROUND(spend, 2) AS spend
FROM region_spend
ORDER BY spend DESC
LIMIT {3};`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the chain stitch",
        why: "Region spend needs each order attached to its customer's region — an inner JOIN on the account key. The ON clause that follows only makes sense with a real join.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the stage's fold key",
        why: "One line per region means folding on the customer's region. Folding on order status stages a status report, not a geography table.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the appendix row count",
        why: "The appendix table holds four regions — the LIMIT constant comes from the layout, not the cells.",
      },
    ],
    distractors: ["NATURAL JOIN", "UNION", "o.status"],
    walkthrough:
      "The stage joins each order to its customer's region and folds: EU 15089.23, APAC 11605.45, US 7286.16, LATAM 852.44 (W24) — the appendix reads top-down exactly in that order. NATURAL JOIN cannot carry an ON clause, so the stitch seat kills the query outright; UNION there is gibberish to the parser (W34-adjacent). Folding on o.status instead stages a status report wearing a region column — APAC 15571.07 leading a table that no longer means anything (G06).",
  },
  {
    id: "cs-971",
    tier: "medium",
    topic: "q6",
    universe: "funnel",
    title: "The bar that builds itself",
    brief:
      "From: Growth marketer. Re: upsell pilot v2.\n\nThe pilot's bar shouldn't be a round number — it should be the average LIFETIME spend itself. Chain two stages: the spend stage, then a bar stage that averages it, then count accounts above their own store's average. Five names should fall out; prove it.",
    ask: "Count customers above the average customer's lifetime spend, via a two-CTE chain.",
    template: `WITH totals AS (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
),
bar AS (
  SELECT {3}(spend) AS b FROM {1}
)
SELECT COUNT(*) AS above
FROM totals, bar
WHERE {2};`,
    slots: [
      {
        answer: "totals",
        kind: "keyword",
        label: "the bar's source stage",
        why: "The bar averages the per-ACCOUNT stage. Averaging raw orders would compute the average ORDER (338.19) — a different bar that every account clears.",
      },
      {
        answer: "spend > b",
        kind: "keyword",
        label: "the above-bar test",
        why: "The pilot enrolls accounts ABOVE the bar. Reversing the comparison keeps the light side — the complement of the pilot.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The bar IS an average of lifetime spends. MIN would set the bar at the smallest account (444.80) and nearly everyone clears it; SUM would set it at the store total and nobody does.",
      },
    ],
    distractors: ["orders", "spend < b", "b > spend", "SUM", "MIN"],
    walkthrough:
      "The chain builds totals (16 account lines), then bar computes their average: 2177.08 (W27) — and 5 accounts sit above their own store's average customer (W26, W22). Point the bar stage at raw orders and the bar collapses to the average ORDER, 338.19 (W54): all 16 accounts clear it (a pilot for everyone is a pilot for no one). MIN sets the bar at Olivia's 444.80 and 15 clear it (G08); SUM sets it at the store total 34833.28 and nobody does (G07) — the bar must be an average. Reversing the comparison builds the 11-account light side (W21's complement) — the exact customers the pilot excludes.",
  },
  {
    id: "cs-972",
    tier: "medium",
    topic: "q6",
    universe: "inventory",
    title: "Three tickets, how many hands",
    brief:
      "From: Ops manager. Re: audit binder page 2.\n\nPage 2 of the binder asks a sharper question than page 1: the three biggest tickets — how many DIFFERENT accounts do they belong to? Stage the top three orders, then count distinct owners off the stage. A one-name page reads differently than a three-name page.",
    ask: "Count distinct customers among the 3 highest-total orders, via a CTE.",
    template: `WITH top3 AS (
  SELECT * FROM orders
  ORDER BY total DESC
  LIMIT {1}
)
SELECT {2}(DISTINCT customer_id) AS accounts
FROM {3};`,
    slots: [
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the page's ticket count",
        why: "The binder page holds three tickets — the LIMIT constant from the layout, not an output cell.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the distinct-owners counter",
        why: "The question is how many DIFFERENT accounts: COUNT(DISTINCT customer_id) collapses repeated owners. SUM would add account numbers together — a meaningless digit soup.",
      },
      {
        answer: "top3",
        kind: "keyword",
        label: "the staged page",
        why: "The count must run over the staged top three, not the whole order book — counting the raw table answers 'how many customers ordered at all'.",
      },
    ],
    distractors: ["SUM", "orders", "2"],
    walkthrough:
      "The stage trims the order book to its three heaviest tickets; the main query counts their distinct owners: orders 39, 43, 74 belong to customers 5, 3, 6 — three different hands (W07). SUM instead adds the customer ids and prints 14 (G11) — arithmetic where a headcount belongs. Counting over the raw orders table answers 16 (every account ordered) — the stage is what makes the page mean 'among the biggest three'. The binder's page-1 numbers (845.92, 945.21, 1088.44) and page-2's answer of 3 come from the same named stage.",
  },
  {
    id: "cs-973",
    tier: "medium",
    topic: "q6",
    universe: "pricing",
    title: "The premium shelf, staged",
    brief:
      "From: Pricing analyst. Re: premium-flag recount.\n\nRecount the premium flags with the stage named up front: shelf averages in a CTE, then the join-back against products, keeping only pieces above their own shelf's bar. Same seven the nested version found — the named form is what goes in the methodology doc.",
    ask: "Count products above their category's average price using a CTE.",
    template: `WITH shelf AS (
  SELECT category, {3}(price) AS avg_price
  FROM products
  GROUP BY {1}
)
SELECT COUNT(*) AS premium
FROM products p
JOIN shelf ON shelf.category = p.category
WHERE p.price > shelf.{2};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf key",
        why: "Averages are per shelf: the stage folds on category so every product can face its own shelf's bar.",
      },
      {
        answer: "avg_price",
        kind: "keyword",
        label: "the stage's bar column",
        why: "The stage exposes the bar as avg_price; the WHERE reads that column. Reading the category key instead compares a price to a word.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the shelf's mean",
        why: "A shelf's typical price is its average. SUM would stage the shelf's combined price — every piece sits below that, and no product could ever clear the bar.",
      },
    ],
    distractors: ["name", "category", "SUM"],
    walkthrough:
      "The stage computes one average per shelf (Wearables 139.5, Audio 109.66, …); the join-back keeps pieces above their own bar: 7 products (W15, W14) — identical to the nested-subquery count, now with a named stage. SUM instead of AVG stages each shelf's combined price, and since no single piece outweighs its whole shelf, zero products clear the bar — a premium line of nobody. Folding by name gives each product its own price as its own average, and the join-back can't even find shelf.category (F18). Comparing against the stage's category key pits number against text: SQLite ranks every number below every string, so nothing survives (type-order trap).",
  },
  {
    id: "cs-974",
    tier: "medium",
    topic: "q6",
    universe: "fraud",
    title: "The ghost in the order book",
    brief:
      "From: Risk analyst. Re: name-collision stress test.\n\nSomebody 'tested' a query by declaring a stage called orders. Pull the status of order id 1 under that declaration and tell me what comes back — the answer decides whether we ban shadowing names in our style guide. Expect exactly one row.",
    ask: "Read order id 1's status while a CTE named orders shadows the real table.",
    template: `{3} orders AS (SELECT 1 AS id, 'ghost row' AS status)
SELECT {2} FROM orders
WHERE id = {1};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the probe's id",
        why: "The stress test asks for id 1 — the probe's written constant, not an output figure.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the ghost's column",
        why: "The probe reads the status column of whatever 'orders' resolves to. Under the shadowing declaration, that column belongs to the ghost stage, not the real order book.",
      },
      {
        answer: "WITH",
        kind: "keyword",
        label: "the shadow's door",
        why: "WITH is what declares the shadowing stage. Only a declaration can put a stage named orders between the query and the real table.",
      },
    ],
    distractors: ["2", "name", "AS"],
    walkthrough:
      "SQLite resolves FROM orders to the CTE, not the table: the query prints 'ghost row' (W23) — the real order book was never touched. That's the style-guide verdict: a CTE named like a real table silently replaces the table, and nothing warns you. A probe for id 2 returns nothing (the ghost stage holds only id 1), which at least looks broken; the dangerous part is that id 1 looks perfectly healthy. Reading a column the ghost doesn't declare (name) dies with 'no such column' — errors you'll see; shadows you won't. AS cannot declare a stage; WITH is the only door (W34).",
  },
  {
    id: "cs-975",
    tier: "medium",
    topic: "q6",
    universe: "catalog",
    title: "The forward reference",
    brief:
      "From: Merch analyst. Re: style-guide trivia.\n\nFor the style guide's 'things SQLite forgives' page: stage a asks for stage b BEFORE b is declared, and b supplies the value. Run it and report what a resolves to. If the engine really reads the whole WITH list before executing, the number lands on one specific figure.",
    ask: "Resolve the forward-referencing CTE chain and report the value.",
    template: `WITH a AS (SELECT * FROM {1}), b AS (SELECT {2} AS v)
SELECT v
FROM {3};`,
    slots: [
      {
        answer: "b",
        kind: "keyword",
        label: "the forward reference",
        why: "Stage a reads b before b's own declaration — a forward reference. SQLite resolves names across the whole WITH list, so the reference lands once b exists.",
      },
      {
        answer: "42",
        kind: "number",
        noVerify: true,
        label: "the staged value",
        why: "Stage b supplies a constant 42 — the exercise's chosen figure, not an output cell.",
      },
      {
        answer: "a",
        kind: "keyword",
        label: "the read point",
        why: "The main query reads v THROUGH a — the stage that forward-referenced b. Reading b directly would sidestep the lesson the style guide is documenting.",
      },
    ],
    distractors: ["c", "products", "43"],
    walkthrough:
      "The main query reads v through a, which forward-referenced b — and SQLite answers 42 (W36): the engine resolves CTE names across the entire WITH list before executing, so order of declaration doesn't matter. A typo'd forward name (c) dies with 'no such table: c' — the mechanism has limits, and this is one. Reading v from products dies the same way; no such column exists there. And 43 would only print if b said 43 — the value travels through the chain, not around it. On the style-guide page this lands under 'forgiving but readable': legal, but declare in order anyway.",
  },
  {
    id: "cs-976",
    tier: "hard",
    topic: "q6",
    universe: "month-close",
    title: "Heavyweights, staged and stitched",
    brief:
      "From: Controller. Re: close deck appendix B.\n\nAppendix B lists every account whose LIFETIME spend clears 1000, heaviest first, names attached. Build the spend stage with WITH, stitch it back to the roster for names, apply the bar, and sort. Eight lines expected — the deck's reviewers will count them.",
    ask: "List customers with lifetime spend above 1000, heaviest first, via a CTE join-back.",
    template: `WITH totals AS (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
)
SELECT c.name, ROUND(t.spend, 2) AS spend
FROM {1} t JOIN customers c ON {2}
WHERE t.spend > {3}
ORDER BY t.spend DESC;`,
    slots: [
      {
        answer: "totals",
        kind: "keyword",
        label: "the staged source",
        why: "The main query reads the named stage 'totals' — the WITH declaration is what gives the FROM clause something to walk. Raw orders carry no spend column at all.",
      },
      {
        answer: "t.customer_id = c.id",
        kind: "keyword",
        label: "the stitch",
        why: "Names live on customers; spend lives in the stage. Matching the stage's customer_id to the roster's id re-attaches names exactly once per line.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the appendix bar",
        why: "Appendix B's bar is 1000 — the written threshold, not an output figure.",
      },
    ],
    distractors: ["orders", "c.id = c.id", "1500"],
    walkthrough:
      "The stage folds 103 orders into 16 account lines; the stitch re-attaches names; the bar trims and the sort orders the appendix: Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93, Pedro 1686.17, Farid 1458.97, Keiko 1098.60 — eight lines (W25). Reading FROM orders directly dies immediately: the raw table has no spend column — the stage IS the aggregation. A lazy stitch like c.id = c.id pairs every stage line with every account and 128 pairings clear the bar (G12) — noise where eight lines belong. And the bar is the memo's, not negotiable: at 1500 the appendix loses Farid and Keiko and reads six lines (W25) — a quietly different deliverable.",
  },
  {
    id: "cs-977",
    tier: "hard",
    topic: "q6",
    universe: "funnel",
    title: "Above our own average",
    brief:
      "From: Growth marketer. Re: pilot roster, final.\n\nThe pilot roster is the NAME LIST of accounts above the average customer's lifetime spend — not counts, names. Chain the spend stage with a bar stage, join back for names, and sort alphabetically for the kickoff email. Five names, one per line.",
    ask: "List customers above the average lifetime spend, alphabetically, via a two-CTE chain.",
    template: `WITH totals AS (
  SELECT customer_id, SUM(total) AS spend
  FROM orders
  GROUP BY customer_id
),
bar AS (
  SELECT {1}(spend) AS b FROM totals
)
SELECT c.name
FROM customers c JOIN totals t ON t.customer_id = c.id, {2}
WHERE t.spend > b
ORDER BY {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The bar is the average of the staged lifetime spends: 2177.08. MIN would drop it to 444.80 and nearly everyone clears it; MAX would raise it to the top account and only Alice clears herself.",
      },
      {
        answer: "bar",
        kind: "keyword",
        label: "the bar stage in the FROM",
        why: "The cross join with bar puts its single row — the computed bar — next to every account line. Naming totals there instead would stack stage rows with no bar column at all.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the email sort",
        why: "The kickoff email reads alphabetically. Sorting by staged spend reorders the same names by money — a different list for a different deliverable.",
      },
    ],
    distractors: ["MIN", "MAX", "totals", "t.spend"],
    walkthrough:
      "The chain: totals stages 16 account lines; bar averages them — 2177.08 (W27); the join-back pairs each account with the single bar row and keeps the heavy side: Alice, Chloe, Emma, Grace, Maya — five names, alphabetical (W28, W22). MIN lowers the bar to Olivia's 444.80 and 15 accounts qualify (G08); MAX raises it to 7262.35 and the roster is one name (Alice's own line) — neither is 'above average'. Putting totals where bar belongs leaves b undefined and the query dead. Sorting by t.spend instead hands the email a money-ranked list — same five names, wrong order for an alphabetical send.",
  },
  {
    id: "cs-978",
    tier: "hard",
    topic: "q6",
    universe: "supplier",
    title: "Stars versus their streets",
    brief:
      "From: Sourcing director. Re: Q3 review, final table.\n\nThe review's final table: every supplier that beats its OWN region's average, with the rating shown. Stage the per-region averages, join back, compare, sort by rating. Two names should survive; the table has to show why.",
    ask: "List suppliers rated above their region's average, via a CTE join-back.",
    template: `WITH region_avg AS (
  SELECT region, AVG(rating) AS ra
  FROM suppliers
  GROUP BY region
)
SELECT s.name, s.rating
FROM suppliers s JOIN {1} ON {2}
WHERE s.rating > {3}
ORDER BY s.rating DESC;`,
    slots: [
      {
        answer: "region_avg",
        kind: "keyword",
        label: "the staged bars",
        why: "The bars live in the named stage — one row per region. Joining suppliers to themselves would stage nothing and leave ra undefined.",
      },
      {
        answer: "region_avg.region = s.region",
        kind: "keyword",
        label: "the home-region matcher",
        why: "Each supplier must face its OWN region's bar. A tautology lets every supplier spar with every region's bar at once — matches, not stars.",
      },
      {
        answer: "ra",
        kind: "keyword",
        label: "the staged bar column",
        why: "The comparison reads the stage's bar column. A hand-picked constant like 4.5 would apply one global bar and miss the whole point of staging per-region averages.",
      },
    ],
    distractors: ["suppliers", "s.region = s.region", "4.5"],
    walkthrough:
      "The stage holds one bar per region — EU 4.7, APAC 4.0 (W18); the join-back compares each supplier to its home bar and two survive: Alpine Audio GmbH 4.8 and Shenzhen Electro 4.1 (F06). A tautological matcher lets suppliers face every region's bar — 11 matches, of which most are foreign-bar luck (G10), not regional stardom. A flat 4.5 bar keeps only Alpine: one star where the memo promises two, because APAC's bar is lower than any global guess. Joining suppliers to itself leaves the stage unread and ra undefined — the query dies before it can flatter anyone.",
  },
  {
    id: "cs-979",
    tier: "hard",
    topic: "q6",
    universe: "refund-audit",
    title: "The settlement ledger, staged",
    brief:
      "From: Refunds lead. Re: reserve memo.\n\nThe reserve memo cites the two largest PAID invoice totals per account, in dollars, biggest first. Stage paid totals per account with WITH, stitch names back on, sort, and trim to two. The memo's numbers must survive an audit pull word-for-word.",
    ask: "List the 2 largest paid-invoice account totals with names, via a CTE.",
    template: `WITH paid AS (
  SELECT customer_id, SUM(amount_cents)/100.0 AS amt
  FROM invoices
  WHERE {1}
  GROUP BY customer_id
)
SELECT c.name, ROUND(p.amt, 2) AS paid
FROM customers c JOIN paid p ON {2}
ORDER BY p.amt {3}
LIMIT 2;`,
    slots: [
      {
        answer: "status = 'paid'",
        kind: "keyword",
        label: "the settlement filter",
        why: "The stage must hold settled money only — that is what the reserve reserves against. Open invoices stage money still in flight and the memo's numbers change.",
      },
      {
        answer: "p.customer_id = c.id",
        kind: "keyword",
        label: "the stitch",
        why: "Names live on customers, totals in the stage. Matching the stage's customer_id to the roster's id attaches each name to its own dollars exactly once.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "The memo opens with the largest settlement. ASC would cite the two smallest accounts and the reserve would be built on the wrong end of the ledger.",
      },
    ],
    distractors: ["status = 'open'", "c.id = c.id", "ASC"],
    walkthrough:
      "The stage sums settled cents per account and divides into dollars; the stitch re-attaches names; the trim keeps two: Alice Chen 20481.00, Maya Patel 11542.00 (W16) — the memo cites exactly this. Staging 'open' instead yields Alice 6148 and Emma 4937 (E15): real money, wrong ledger, a reserve built on in-flight cash. A tautological stitch pairs every account with every staged total — noise rows where two citations belong. Sorting ASC would cite the bottom of the paid ledger — the two smallest settlement accounts — and the memo's opening line would name the wrong customers entirely.",
  },
  {
    id: "cs-980",
    tier: "hard",
    topic: "q6",
    universe: "catalog",
    title: "The stage nobody reads",
    brief:
      "From: Merch analyst. Re: dead-stage incident.\n\nA teammate's report declares a busy stage over order_items — and then never references it. The shipped-this-quarter count still comes out. Rebuild the query as-is, run it, and tell me what the main query actually returns: this number goes in the incident log as proof the stage is dead weight.",
    ask: "Count orders with a known ship date while an unreferenced CTE sits in the WITH clause.",
    template: `WITH unused AS (SELECT order_id FROM order_items WHERE quantity > 3)
SELECT {1}(*) AS recent_n
FROM {2}
WHERE shipped_at {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the live counter",
        why: "The live query counts rows of the orders table. The star belongs to COUNT; SUM(*) is not an aggregate SQLite knows.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the table the query actually reads",
        why: "The main query walks orders — the dead stage is never referenced. Reading the unused stage instead would count a different, fully unrelated row set.",
      },
      {
        answer: "IS NOT NULL",
        kind: "keyword",
        label: "the shipped filter",
        why: "'Known ship date' means shipped_at holds a value: IS NOT NULL keeps dated rows and drops the never-shipped. IS NULL would return exactly the complement — the unshipped pile.",
      },
    ],
    distractors: ["SUM", "unused", "IS NULL"],
    walkthrough:
      "The stage computes and computes — and the main query never touches it: the answer is the plain shipped-count, 82 orders with a known ship date (W29 pattern, G14). That's the incident log's point: an unreferenced CTE is perfectly legal in SQLite; nothing errors, nothing warns, the stage is just dead weight. Reading FROM unused instead counts the stage's own rows — zero, because nothing in the item lines ships three or more units (G09) — a number that looks plausible and means nothing. IS NULL flips the answer to the 21 never-shipped orders (P10) — the complement, not the count. The fix isn't SQL: it's deleting the stage.",
  },
  {
    id: "cs-981",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The five-touch ladder",
    brief:
      "From: Lifecycle marketer. Re: onboarding sequence.\n\nBefore we wire the five onboarding touchpoints into the CRM, print the rungs themselves: a recursive ladder from 1 to 5, one number per rung, comma-joined. The lifecycle deck cites the sequence verbatim.",
    ask: "Build a recursive ladder from 1 to 5 and print it comma-joined.",
    template: `WITH RECURSIVE cnt(n) AS (
  SELECT {1}
  UNION ALL
  SELECT n + 1 FROM cnt WHERE n {2} {3}
)
SELECT group_concat(n) AS ladder FROM cnt;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the first rung",
        why: "A recursive ladder needs a seed: the base SELECT emits 1 and the arm does the rest. Start at 2 and the whole ladder shifts up one rung.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the climb rule",
        why: "The arm reproduces while the current rung is below the top: n < 5 stops the climb exactly at 5. Equality or a backwards test changes which rungs print.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the top rung",
        why: "The sequence has five touchpoints — the deck's written count, a bound constant rather than an output cell.",
      },
    ],
    distractors: ["2", "0", "<=", ">", "MAX"],
    walkthrough:
      "The base SELECT seeds 1; the arm appends n + 1 while n < 5 — the ladder reads 1,2,3,4,5 (W38). Seed at 2 and the deck opens at two (2,3,4,5, H12); seed at 0 and a zeroth touchpoint sneaks in (H12-adjacent). Loosen the bound to <= and the arm prints a sixth rung, 6 (H09) — the bound gates reproduction, so the comparison decides the last rung. An equality test strangles the arm after the seed (H13), and a syntax chip kills the query outright. Every distractor here still terminates — a recursive arm that never stops climbing is the one bug this form can't survive.",
  },
  {
    id: "cs-982",
    tier: "easy",
    topic: "q7",
    universe: "refund-audit",
    title: "The escalation runbook, reversed",
    brief:
      "From: Refunds lead. Re: incident 47 wrap-up.\n\nThe runbook prints its five escalation steps in reverse — severity first, resolution last. Build a recursive countdown from 5 down to 1 and comma-join it. The wrap-up doc quotes the sequence exactly.",
    ask: "Build a recursive countdown from 5 to 1 and print it comma-joined.",
    template: `WITH RECURSIVE t(n) AS (
  SELECT {1}
  UNION ALL
  SELECT n - 1 FROM t WHERE n {2} {3}
)
SELECT group_concat(n) AS countdown FROM t;`,
    slots: [
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the severity seed",
        why: "A countdown's base SELECT emits the top rung — 5 — and the arm steps down. Seed at 4 and severity one never prints.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the descent rule",
        why: "The arm keeps stepping while the current rung is above the floor: n > 1 stops after printing 1. A backwards test ends the descent immediately.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the resolution floor",
        why: "The runbook bottoms out at step 1 — the written floor, a bound constant rather than an output cell.",
      },
    ],
    distractors: ["4", "0", ">=", "<", "MIN"],
    walkthrough:
      "The base seeds 5; the arm appends n - 1 while n > 1: 5,4,3,2,1 (W40). Seed at 4 and the doc starts at severity four, skipping the worst case; seed at 0 and the descent is one step long. Loosening the floor to >= drags a zero onto the printed line (H12-style) — the bound decides where the walk stops. Flipping the test to < ends the walk after the seed (a one-rung countdown), which at least looks broken. Every distractor terminates: a descending arm always falls toward any fixed floor.",
  },
  {
    id: "cs-983",
    tier: "easy",
    topic: "q7",
    universe: "pricing",
    title: "Rungs that double",
    brief:
      "From: Pricing analyst. Re: premium-tier ladder.\n\nThe premium ladder doubles its rung value every step until it passes the 1000 ceiling. Print the whole ladder comma-joined — the methodology note argues about the LAST rung, so the sequence has to be exact.",
    ask: "Build a doubling recursive ladder under a 1000 ceiling and print it comma-joined.",
    template: `WITH RECURSIVE p(n) AS (
  SELECT 1
  UNION ALL
  SELECT {1} FROM p WHERE n {2} {3}
)
SELECT group_concat(n) AS ladder FROM p;`,
    slots: [
      {
        answer: "n * 2",
        kind: "keyword",
        label: "the doubling step",
        why: "Each rung is twice the last: n * 2. A linear step like n + 2 climbs by twos — a different ladder with fifty times the rungs.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the ceiling test",
        why: "The arm may only reproduce below the ceiling: n < 1000. Reversing the test ends the walk after the seed.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the ceiling",
        why: "The ladder stops passing 1000 — the note's written ceiling, a bound constant rather than an output cell.",
      },
    ],
    distractors: ["n + 2", "n + 1", ">", "=", "MAX"],
    walkthrough:
      "The base seeds 1 and the arm doubles while below 1000: 1,2,4,8,…,512,1024 — eleven rungs (W41, W42), and the punchline is the last one: 1024 PASSES the ceiling because the bound gates reproduction, not birth — 512 was under 1000, so 1024 gets printed before anyone checks. A step of n + 2 builds the odd-number ladder instead: 501 rungs from 1 to 999 (H14). Reversing the ceiling test strangles the walk after 1; equality does the same. And n * n would seed an endless 1,1,1… — the one step in this family with no floor, which is exactly why it never ships.",
  },
  {
    id: "cs-984",
    tier: "medium",
    topic: "q7",
    universe: "inventory",
    title: "The cycle-count walk",
    brief:
      "From: Ops manager. Re: aisle-slot census.\n\nThe warehouse counts slot-by-slot: walk 24 numbered slots, then count how many slot numbers exist as real product ids. A recursive ladder drives the walk — no mental arithmetic, the database says which slots are real.",
    ask: "Walk slots 1–23 with a recursive ladder and count how many map to product ids.",
    template: `WITH RECURSIVE slots(n) AS (
  SELECT 1
  UNION ALL
  SELECT n {3} 1 FROM slots WHERE n < {1}
)
SELECT COUNT(*) AS filled FROM slots
WHERE n IN (SELECT id FROM {2});`,
    slots: [
      {
        answer: "24",
        kind: "number",
        noVerify: true,
        label: "the walk's slot count",
        why: "The census walks 24 slots — the layout's written count, a bound constant. The ladder emits 1 through 23 and the IN does the mapping.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the mapping table",
        why: "Slot numbers count as filled when they equal a product id, so the IN reads the products table. Suppliers or orders would map the same ladder to a different universe.",
      },
      {
        answer: "+",
        kind: "keyword",
        label: "the walk's stride",
        why: "The walk advances one slot per rung: n + 1 is the only arithmetic stride that moves forward here. An operator the parser rejects stops the census before it starts.",
      },
    ],
    distractors: ["12", "8", "suppliers", "orders", "||", "DIV"],
    walkthrough:
      "The ladder walks 23 rungs (1 through 23); the IN keeps rungs that exist as product ids and COUNT reports 16 (H01) — sixteen real slots out of the walk. Shorten the walk to 12 and only twelve slots get visited, all of them real (H15): the census then measures the walk, not the warehouse. Map against suppliers instead and six rungs match (H10) — a supplier census wearing a slot-count's name. Map against orders and every rung matches an order id, all 23 — the mapping table IS the question. Swap the stride for || and the walk leaves the number line — n || 1 is text '11', which never sorts below a number, so the walk dies after its first stride. The bound stays fixed: any walk past 23 reports the same sixteen, which is how you know the walk is long enough.",
  },
  {
    id: "cs-985",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "The rent clock",
    brief:
      "From: Finance ops. Re: lease abstract.\n\nThe lease billables every calendar day the storefront has been live. Walk the calendar from the first order date to the last with a recursive ladder — one day per step — and count the days. The abstract's day count must be defensible to the landlord.",
    ask: "Count every calendar day from the first order to the last via a recursive ladder.",
    template: `WITH RECURSIVE days(d) AS (
  SELECT date((SELECT MIN(created_at) FROM orders))
  UNION ALL
  SELECT date(d, {1}) FROM days WHERE d {2} date((SELECT MAX(created_at) FROM orders))
)
SELECT COUNT(*) AS calendar_days FROM {3};`,
    slots: [
      {
        answer: "'+1 day'",
        kind: "keyword",
        label: "the clock's tick",
        why: "The calendar advances one day per rung: date(d, '+1 day'). Weeks or months skip days the lease still bills — a shorter clock that undercounts the term.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the term's edge",
        why: "The walk continues while the current day is before the last order date, so the ladder lands on the last day and stops. Equality or a backwards test truncates the walk.",
      },
      {
        answer: "days",
        kind: "keyword",
        label: "the walked calendar",
        why: "The count runs over the ladder the WITH clause built. Counting raw orders would report order rows, not calendar days.",
      },
    ],
    distractors: ["'+1 month'", "'+2 day'", "'+7 day'", ">=", "=", "orders"],
    walkthrough:
      "The ladder seeds the first order date and ticks forward one day at a time until it lands on the last: 424 calendar days (W44). Tick by weeks instead and the walk visits only 62 days (H04); by months, 15 (H02); by two-day hops, 213 (H03) — every skipped day is a day the abstract forgot to bill. Counting the orders table instead answers 103 (rows, not days) — the ladder exists precisely to turn row-counting into day-counting. Loosening the edge to <= adds one day past the term; tightening it with equality ends the walk at the first day. A backward tick ('-1 day') would walk away from the bound forever — the one tick this query must never wear.",
  },
  {
    id: "cs-986",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "Trading days on the calendar",
    brief:
      "From: Board analyst. Re: activity footnote.\n\nThe footnote contrasts calendar span with trading days: of every day the store has been live, how many actually saw an order? Walk the calendar with the recursive ladder, then keep only the days the order book knows.",
    ask: "Count calendar days that saw at least one order, via a recursive ladder.",
    template: `WITH RECURSIVE days(d) AS (
  SELECT date((SELECT MIN(created_at) FROM orders))
  UNION ALL
  SELECT date(d, '+1 day') FROM days WHERE d {1} date((SELECT MAX(created_at) FROM orders))
)
SELECT COUNT(*) AS trading_days FROM days
WHERE d IN (SELECT {2} FROM {3});`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the walk's edge",
        why: "The ladder walks while the day is before the last order date, landing exactly on the final day. A backwards test collapses the walk to its seed.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the trading column",
        why: "A day traded when an order carries its date, so the IN reads created_at. Order ids are numbers — a date never equals one, and the count collapses to zero.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the order book",
        why: "Trading days come from the order book. Any other table either lacks the column or answers a different question.",
      },
    ],
    distractors: [">", "MAX", "id", "invoices"],
    walkthrough:
      "The ladder walks all 424 calendar days; the IN keeps the days the order book actually touches: 84 trading days (W52, W53, W45). The remaining 340 days saw the storefront open and silent — the footnote's whole point. Reading order ids instead of dates compares text dates to numbers: SQLite ranks every number below every string, so no day matches and the count collapses to 0. Pointing the IN at invoices dies outright — invoices carry issued_on and due_on, not created_at. Reversing the walk's edge truncates it to the seed day; MAX as an operator is a syntax error before any row exists.",
  },
  {
    id: "cs-987",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "The duplicated first step",
    brief:
      "From: Finance ops. Re: approval-chain cleanup.\n\nThe approval chain's seed step got pasted twice, and the ladder still built — but the printed line is shorter than the copy-paste deserves. Rebuild the three-step approval ladder with the duplicate in place and report exactly what prints. The dedup behavior decides the cleanup ticket.",
    ask: "Build a three-step approval ladder with a duplicated seed and report the printed sequence.",
    template: `WITH {3} d(n) AS (
  SELECT 1
  UNION
  SELECT 1
  UNION
  SELECT n + 1 FROM d WHERE n {1} {2}
)
SELECT group_concat(n) AS ladder FROM d;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the climb rule",
        why: "The arm reproduces while the rung is below the top: n < 3 stops the ladder at 3. Loosening it adds a fourth approval nobody signed off on.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the chain length",
        why: "The approval chain is three steps — the policy's written count, a bound constant rather than an output cell.",
      },
      {
        answer: "RECURSIVE",
        kind: "keyword",
        label: "the recursion flag",
        why: "The ladder's arm references its own CTE, so the WITH carries the RECURSIVE flag. Note SQLite's mercy: even without the flag this ladder builds — but the flag is what documents intent.",
      },
    ],
    distractors: ["<=", ">", "5", "1", "TEMP", "IF NOT EXISTS"],
    walkthrough:
      "Three compound parts feed the ladder: seed 1, the pasted duplicate 1, and the arm n + 1 while n < 3. Because the compounds use bare UNION, the duplicate collapses — the ladder prints 1,2,3 (W46), not 1,1,2,3. Swap either UNION for UNION ALL and the duplicate survives, printing the double-printed line the cleanup ticket describes — proof that UNION dedups rows and UNION ALL keeps receipts. Loosen the bound and a fourth step joins the chain; an equality test strangles the arm. And the RECURSIVE flag itself is optional in SQLite — drop it and the same three steps print (W47) — which is exactly why the style guide says the flag is documentation, not mechanics.",
  },
  {
    id: "cs-988",
    tier: "hard",
    topic: "q7",
    universe: "funnel",
    title: "Hot days on the live calendar",
    brief:
      "From: Growth marketer. Re: seasonality scan.\n\nThe scan wants the count of calendar days — first order to last — that saw at least one order land. Walk every day with the recursive ladder, and for each day ask the order book how busy it was. The seasonality deck needs the headline figure.",
    ask: "Count calendar days with at least one order, via a recursive ladder over the calendar.",
    template: `WITH RECURSIVE days(d) AS (
  SELECT date((SELECT MIN(created_at) FROM orders))
  UNION ALL
  SELECT date(d, {3}) FROM days WHERE d < date((SELECT MAX(created_at) FROM orders))
)
SELECT COUNT(*) AS hot_days FROM days
WHERE (SELECT COUNT(*) FROM orders WHERE created_at = {2}) {1} {4};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the hot-day rule",
        why: "Hot means at least one order: the per-day count must be above zero. Equality asks for exactly-one days and silence counts the cold days — neither is the headline.",
      },
      {
        answer: "days.d",
        kind: "keyword",
        label: "the correlated day",
        why: "Each rung must ask about ITS OWN date: created_at = days.d names the ladder's column explicitly. Point the comparison at the same column twice and every day looks fully booked.",
      },
      {
        answer: "'+1 day'",
        kind: "keyword",
        label: "the calendar tick",
        why: "The scan walks every calendar day, so the ladder ticks daily. Weeks and months skip days the scan never visits — the seasonality read goes blind.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the quiet floor",
        why: "Hot is anything above zero orders — the scan's written floor, a comparison constant rather than an output cell.",
      },
    ],
    distractors: ["=", "<", "created_at", "'+1 week'", "'+1 month'", "1"],
    walkthrough:
      "The ladder walks all 424 calendar days; each rung asks the order book how many orders landed that day, and the outer filter keeps the days with at least one: 84 hot days (W52) against 340 silent ones. Raise the bar past one and only 17 days — the double-order days — survive (H07): a seasonality read of rushes, not activity. Tick weekly and the walk visits 62 days, of which just 1 is an order date (H05) — a scan that misses six days in seven. Compare the column to itself and every day reports a full house — 424 hot days, a seasonality scan with no seasons. Count below-zero days instead and you've measured silence, not sales.",
  },
  {
    id: "cs-989",
    tier: "hard",
    topic: "q7",
    universe: "expense",
    title: "The fee that doubles past its cap",
    brief:
      "From: Finance ops. Re: late-fee clause audit.\n\nThe vendor's late-fee clause doubles a base penalty daily 'until it passes the legal cap'. Legal wants two numbers: how many doublings the clause produces under a 1000 cap, and the final fee actually charged — which legal suspects lands PAST the cap. Build the ladder and read both off it.",
    ask: "Count the rungs of a doubling ladder capped at 1000 and report the final value.",
    template: `WITH RECURSIVE fee(n) AS (
  SELECT 1
  UNION ALL
  SELECT n * 2 FROM fee WHERE n {1} {2}
)
SELECT {3}(n) AS rungs, MAX(n) AS last_rung FROM fee;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the cap test",
        why: "The clause doubles while the fee is still under the cap: n < 1000. Reversing the test stops the compounding after the base penalty.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the legal cap",
        why: "The cap is the clause's written ceiling — a bound constant from the contract, not an output cell.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the rung counter",
        why: "Legal's first number is how many doublings occur: COUNT over the ladder. SUM would add the rungs together — a dollar-mass, not a count.",
      },
    ],
    distractors: [">", "MAX", "100", "500", "SUM", "AVG"],
    walkthrough:
      "The ladder doubles while under 1000: 1, 2, 4, …, 512, 1024 — eleven rungs (W41, W42). The audit's finding writes itself: the final fee is 1024, twenty-four dollars PAST the 1000 cap, because the bound gates reproduction, not birth — 512 was under the cap, so 1024 gets minted before anyone checks it. SUM instead of COUNT answers 2047 (every rung added), AVG answers a meaningless mid-rung; MIN prints the base fee where the rung count belongs. Tighten the cap to 100 or 500 and the rung count drops to 8 or 10 (W41 logic) — the clause's reach depends entirely on where legal draws the line.",
  },
  {
    id: "cs-990",
    tier: "hard",
    topic: "q7",
    universe: "supplier",
    title: "Sourcing tiers on a ladder",
    brief:
      "From: Sourcing director. Re: tier threshold review.\n\nThe review scores the order book against five sourcing tiers: tier k counts orders whose total beats k times 200. A recursive ladder supplies the tiers — no hand-written UNION stack. Print tier by tier with its hit count; the thresholds get renegotiated against this table.",
    ask: "For each tier 1–5, count orders whose total exceeds k times 200.",
    template: `WITH RECURSIVE rungs(k) AS (
  SELECT 1
  UNION ALL
  SELECT k + 1 FROM rungs WHERE k {1} {2}
)
SELECT k, (SELECT COUNT(*) FROM orders WHERE total {3} k * 200) AS hits
FROM rungs;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the ladder's climb rule",
        why: "The ladder emits five tiers: the arm reproduces while k is below 5. Loosening it mints a sixth tier nobody negotiated.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the tier count",
        why: "The review defines five sourcing tiers — the written count, a bound constant rather than an output cell.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the beat rule",
        why: "A tier hit is an order ABOVE the threshold: total > k * 200. Counting below-threshold orders fills the table with the misses instead.",
      },
    ],
    distractors: ["<=", "=", "3", "MAX", "<"],
    walkthrough:
      "The ladder mints tiers 1 through 5; each rung's correlated count asks how many orders beat k times 200: 65, 34, 20, 4, 1 (probed) — a clean decay from everyday orders to the single order above 1000 (order #74, 1088.44). Count below-threshold orders instead and the table reads 38, 69, 83, 99, 102 — the same book, inverted, and every threshold decision made against misses. Loosen the climb rule and a sixth tier appears (H09-style); tighten it to three and the review loses its top rungs. The correlated count is the ladder's payload: each rung asks its own question of the same 103 rows.",
  },
  {
    id: "cs-991",
    tier: "easy",
    topic: "q8",
    universe: "month-close",
    title: "Two bars, one memo",
    brief:
      "From: Controller. Re: close memo headline.\n\nThe close memo's headline carries the pair everyone quotes: the average ORDER and the average CUSTOMER. They are different bars — one over orders, one over per-account lifetimes — and the memo needs both, rounded to cents, side by side.",
    ask: "Report the average order total and the average customer lifetime spend.",
    template: `SELECT ROUND((SELECT AVG(total) FROM orders), 2) AS avg_order,
       ROUND((SELECT {3}(spend) FROM (
         SELECT customer_id, {2}(total) AS spend
         FROM orders
         GROUP BY {1}
       )), 2) AS avg_customer;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the customer stage's grain",
        why: "Average CUSTOMER spend means folding on customer_id first — 16 lifetime lines — then averaging them. Folding on anything else stages the wrong universe.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stage's adder",
        why: "A customer's lifetime spend is the SUM of their orders. Averaging or counting inside the stage builds a different figure before the outer average ever runs.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the customer bar's probe",
        why: "The customer bar is the AVERAGE of the staged lifetimes. MIN prints the floor account's 444.80 and MAX the ceiling's 7262.35 — both true figures, neither is the mean the memo quotes.",
      },
    ],
    distractors: ["shipped_at", "COUNT", "MAX", "MIN"],
    walkthrough:
      "Two bars, two builds: the order bar averages 103 raw totals — 338.19; the customer stage folds to 16 lifetimes and averages those — 2177.08 (W54, W06). The gap between them is the whole lesson: a customer buys many times, so a lifetime dwarfs a single order. Fold the stage on shipped_at instead and the stage counts timestamp groups — the customer bar measures something that does not exist. COUNT inside the stage stages order frequencies (average 6.4 orders), MAX stages each account's biggest order (652.56 averaged, F-batch) — neither is a lifetime. And the outer probe must stay an average: MIN prints the floor account's 444.80 where the mean belongs.",
  },
  {
    id: "cs-992",
    tier: "easy",
    topic: "q8",
    universe: "fraud",
    title: "Ghost accounts",
    brief:
      "From: Risk analyst. Re: account hygiene sweep.\n\nThe sweep starts from the empty end: accounts with NO orders at all — no purchases, no risk surface, but also no reason to keep emailing. Flag them with an existence test, then count. The number decides whether hygiene is even worth a ticket.",
    ask: "Count customers with no orders at all.",
    template: `SELECT {3}(*) AS ghosts
FROM customers c
WHERE {2} (SELECT 1 FROM orders WHERE customer_id = {1});`,
    slots: [
      {
        answer: "c.id",
        kind: "keyword",
        label: "the correlated account",
        why: "Each roster row asks: any order for THIS account? c.id names the outer customer explicitly — the inner query's own id would answer a different question entirely.",
      },
      {
        answer: "NOT EXISTS",
        kind: "keyword",
        label: "the emptiness test",
        why: "Ghosts are accounts where the order probe finds NOTHING: NOT EXISTS. Plain EXISTS flags the opposite — the accounts that do trade.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ghost counter",
        why: "The sweep's deliverable is a headcount. COUNT(*) collapses the flagged roster rows into the single number the ticket hinges on.",
      },
    ],
    distractors: ["c.email", "c.name", "EXISTS", "SUM"],
    walkthrough:
      "Every one of the 16 accounts has at least one order, so the emptiness test flags nobody: the sweep reports 0 ghosts (W63) — hygiene is a non-ticket, and that IS the finding. Flip to EXISTS and you count the traders: 16, the exact complement. Correlate on c.email or c.name and the probe compares a number to text — never equal — so every account looks order-less and the count lies at 16: the classic wrong-column ghost hunt. SUM in the counter seat dies on SUM(*). The zero is honest: the EXISTS probe walked all 16 accounts and found no empty one.",
  },
  {
    id: "cs-993",
    tier: "easy",
    topic: "q8",
    universe: "pricing",
    title: "Orders above the storewide bar",
    brief:
      "From: Pricing analyst. Re: basket-size note.\n\nThe note's opening stat: how many orders outsize the storewide AVERAGE order — the bar every basket is measured against. Use the average as a scalar probe in the filter, then count the survivors.",
    ask: "Count orders whose total exceeds the storewide average order.",
    template: `SELECT {3}(*) AS premium_orders
FROM orders
WHERE total {1} (SELECT {2}(total) FROM orders);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the above-bar side",
        why: "The note counts outsized baskets: total above the storewide average. Reversing it counts the modest majority — a different story with a different number.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The bar IS the average order. MAX would set it at the single biggest ticket and nobody clears it; MIN would set it at the smallest and nearly everyone does.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the survivor counter",
        why: "The deliverable is a count of orders. COUNT(*) collapses the filtered rows to the note's headline figure.",
      },
    ],
    distractors: ["<", "MAX", "MIN", "SUM"],
    walkthrough:
      "The scalar probe computes the storewide bar — 338.19 (W54) — once, and the filter keeps orders above it: 42 of 103 orders (37 + 5 from the cross-bars decomposition, P25) — roughly four in ten baskets outsize the average, because a handful of huge baskets drag the mean up. MAX as the bar-builder sets the bar at 1088.44 and zero orders clear their own ceiling; MIN sets it at 25.47 and all but one clear it. Reversing the comparison counts the 61 modest baskets. SUM in the counter seat dies on SUM(*) — the star is COUNT's alone.",
  },
  {
    id: "cs-994",
    tier: "easy",
    topic: "q8",
    universe: "catalog",
    title: "The single biggest ticket",
    brief:
      "From: Merch analyst. Re: highlight-card data.\n\nThe highlights page pins one order: the biggest ticket in the book, with its account attached. Find it the honest way — the row whose total equals the maximum — and project id, account, and total.",
    ask: "Show the order with the highest total, including its customer id.",
    template: `SELECT id, {2}, total
FROM orders
WHERE total {3} (SELECT {1}(total) FROM orders);`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak probe",
        why: "The biggest ticket is the row matching the MAXIMUM total. MIN hunts the smallest; AVG matches nothing because no order equals the average exactly.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the owning account",
        why: "The highlight card names the buyer: the projection must carry customer_id. Statuses or dates leave the card unable to say whose order it was.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the equality test",
        why: "Peak rows are found by matching the maximum exactly — equality survives ties, printing every peak row. A one-sided test either empties the card or floods it with the whole book.",
      },
    ],
    distractors: ["MIN", "AVG", "COUNT", ">", "<", "<="],
    walkthrough:
      "The scalar probe finds the peak — 1088.44 — and the equality filter returns exactly one row: order #74, customer 6 (Farid Nasser), total 1088.44 (W62). Equality against MAX is the pattern: it survives ties (every peak row prints), which a LIMIT-based 'top 1' silently would not. MIN hunts the 25.47 floor ticket instead; AVG matches nothing — no order equals the exact mean — and the highlight card goes blank. COUNT in the probe seat compares totals to a row-count: no match, empty card. Projecting status leaves the card with a status word where the account belongs.",
  },
  {
    id: "cs-995",
    tier: "hard",
    topic: "q8",
    universe: "fraud",
    title: "The veterans test",
    brief:
      "From: Risk analyst. Re: full-lifecycle accounts.\n\nA 'veteran' account has passed through ALL FOUR order statuses — pending, shipped, delivered, cancelled — not just four orders. The distinction is COUNT DISTINCT versus bare COUNT, and the last audit mixed them up. Build the veteran list and let the impostors expose themselves.",
    ask: "List customers whose orders cover four distinct statuses.",
    template: `SELECT c.name
FROM customers c
WHERE (SELECT {2} FROM orders WHERE customer_id = c.id) {1} {3};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the exactly-four test",
        why: "Veterans have exactly four distinct statuses — the equality pins it. Reversing the test flags accounts with five statuses, of which there are none.",
      },
      {
        answer: "COUNT(DISTINCT status)",
        kind: "keyword",
        label: "the distinct-status counter",
        why: "Four DIFFERENT statuses is the veteran test: COUNT(DISTINCT status) collapses repeats before counting. A bare COUNT(status) counts orders and confuses volume with variety.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the status count",
        why: "The store runs four statuses — the veteran bar from the risk playbook, a comparison constant rather than an output cell.",
      },
    ],
    distractors: ["COUNT(status)", ">", "<", "3"],
    walkthrough:
      "The correlated probe counts each account's DISTINCT statuses; three customers have covered all four — Alice Chen, Emma Wilson, Maya Patel (W57). Swap in the bare COUNT(status) and the test counts ORDERS instead: four impostors with exactly four orders — Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez (W58) — volume masquerading as variety, the exact mix-up the audit flagged. Reversing the test (more than four) flags nobody; lowering the bar to 3 dilutes the list with partial veterans. The DISTINCT keyword is the whole case: one word separates lifecycle coverage from order volume.",
  },
  {
    id: "cs-996",
    tier: "medium",
    topic: "q8",
    universe: "supplier",
    title: "Stars via scalar",
    brief:
      "From: Sourcing director. Re: methodology cross-check.\n\nThe Q3 review listed regional stars via a named stage. Before it ships, cross-check with the OTHER form: a correlated scalar that computes each supplier's own region average inline. Same two names must fall out — or the methodology has a bug.",
    ask: "List suppliers rated above their own region's average, via a correlated scalar subquery.",
    template: `SELECT name, {3}
FROM suppliers s
WHERE rating {2} (SELECT AVG(rating) FROM suppliers s2 WHERE {1});`,
    slots: [
      {
        answer: "s2.region = s.region",
        kind: "keyword",
        label: "the correlated neighborhood",
        why: "Each supplier must face its OWN region's mean: the inner query correlates s2's region to the outer s. Without the correlation, everyone faces one global bar.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the star side",
        why: "Stars out-rate their neighborhood: rating above the correlated average. Reversing it lists the suppliers dragged down by their region.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the evidence column",
        why: "The table shows WHY each name qualifies: the rating sits next to it. Regions or names alone would leave the reviewer trusting the filter blindly.",
      },
    ],
    distractors: ["s2.region = s2.region", "<", "region"],
    walkthrough:
      "The correlated scalar recomputes each supplier's regional bar inline — EU 4.7 for the Europeans, APAC 4.0 for the Asians (W18) — and two suppliers beat their own neighborhood: Alpine Audio GmbH 4.8, Shenzhen Electro 4.1. It's the same answer the CTE join-back produced (cs-956's two stars, F06), which is exactly what a cross-check wants: two forms, one truth. Break the correlation and every supplier faces the global mean 4.28 — Alpine still clears it, but Nordic 4.6 sneaks in where Shenzhen 4.1 fell out: a different star list from an uncorrelated probe. Reversing the comparison lists the regionally dragged-down; projecting region hides the evidence the review table exists to show.",
  },
  {
    id: "cs-997",
    tier: "medium",
    topic: "q8",
    universe: "pricing",
    title: "Premium pieces, catalog-wide",
    brief:
      "From: Merch analyst. Re: catalog shape note.\n\nDifferent cut than the shelf-relative view: how many products beat the CATALOG-WIDE average price — one global bar, no shelf grouping. The note contrasts this with the per-shelf count to show how much the shelves differ.",
    ask: "Count products priced above the catalog-wide average price.",
    template: `SELECT {3}(*) AS premium
FROM products
WHERE price {1} (SELECT {2}(price) FROM products);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the above-average side",
        why: "The note counts pieces above the global bar. Reversing it counts the affordable majority — the complement, not the contrast.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the global bar",
        why: "One bar for the whole catalog: the average price. MAX and MIN set the bar at an extreme and the count collapses to zero or everything.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the piece counter",
        why: "The note's figure is a count of products. COUNT(*) over the filtered rows prints it.",
      },
    ],
    distractors: ["<", "MAX", "MIN", "SUM"],
    walkthrough:
      "The scalar probe computes one global bar — 71.78 (P01) — and the filter keeps pieces above it: 6 products (P02). The note's punchline sits next door: the per-shelf version counts 7 (W15). The two counts disagree because shelf-relative tests forgive cheap shelves: the 65 jersey misses the global 71.78 yet clears Apparel's 41.75, earning its shelf flag — THAT gap is the shelf effect. Extremes as the bar collapse the count: above MAX nobody, above MIN everybody but one. SUM in the counter seat is a syntax error.",
  },
  {
    id: "cs-998",
    tier: "medium",
    topic: "q8",
    universe: "expense",
    title: "Receipts above the mean",
    brief:
      "From: Finance ops. Re: receipt-shape memo.\n\nThe memo contrasts typical receipts with outliers: how many individual expense receipts sit above the company-wide AVERAGE receipt? One scalar bar, no bucket grouping — the buckets are the next memo's problem.",
    ask: "Count expense receipts above the company-wide average receipt size.",
    template: `SELECT {3}(*) AS big_receipts
FROM expenses
WHERE amount_cents {1} (SELECT {2}(amount_cents) FROM expenses);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the outlier side",
        why: "The memo counts receipts ABOVE the mean. Reversing it counts the ordinary bulk — a different memo entirely.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean probe",
        why: "The bar is the average receipt across all 36 rows. MAX sets the bar at the single largest receipt; MIN at the smallest — neither is a mean.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the receipt counter",
        why: "The deliverable is a count of receipts. COUNT(*) collapses the filtered rows into it.",
      },
    ],
    distractors: ["<", "MAX", "MIN", "SUM"],
    walkthrough:
      "The scalar computes the mean receipt — 706.00 (25416 dollars of receipts over 36 rows) — and the filter keeps the outliers: 15 receipts above the mean (C35). The mean sits high because rent repeats at full weight; that's the skew the memo flags — most receipts (21 of 36) live below it. MAX as the bar clears nobody, MIN clears all but one receipt — the extremes that prove the mean is the only honest bar here. Reversing the comparison counts the below-mean bulk: the same skew read from the other side. SUM in the counter seat dies on SUM(*).",
  },
  {
    id: "cs-999",
    tier: "hard",
    topic: "q8",
    universe: "inventory",
    title: "The wide-basket census",
    brief:
      "From: Ops manager. Re: pick-path planning.\n\nPick paths are planned around WIDE orders — baskets with more than three distinct line items. The census needs their count: for each order, a scalar probe counts its line rows, and the filter keeps the wide ones. The count feeds next quarter's pick-path budget.",
    ask: "Count orders carrying more than three line items.",
    template: `SELECT {3}(*) AS wide_orders
FROM orders
WHERE (SELECT COUNT(*) FROM order_items WHERE {1}) {2} {4};`,
    slots: [
      {
        answer: "order_id = orders.id",
        kind: "keyword",
        label: "the correlated basket",
        why: "Each order must count ITS OWN lines: the inner probe correlates order_items.order_id to the outer orders.id. A tautology counts the whole item book for every order.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the wide side",
        why: "Wide means MORE than three lines. Reversing it counts the narrow baskets — the pick paths nobody is re-planning.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the outer counter",
        why: "The census delivers one number: how many wide orders. COUNT(*) collapses the filtered order rows to it.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the wide threshold",
        why: "Three lines is the pick-path playbook's written width bar — a filter constant, not an output cell.",
      },
    ],
    distractors: ["orders.id = orders.id", "<", "SUM", "1"],
    walkthrough:
      "The correlated probe counts line rows per order — 251 lines across 103 orders — and the filter keeps baskets wider than three: 23 orders (probed). Break the correlation with a tautology and every order sees the entire item book — 251 lines — so all 103 orders look wide (probed): a pick-path budget for a warehouse that doesn't exist. Reversing the comparison counts the 80 narrow baskets; dropping the bar to 1 counts every multi-line order. The correlation is the census: one probe per order, each counting only its own basket.",
  },
  {
    id: "cs-1000",
    tier: "hard",
    topic: "q8",
    universe: "inventory",
    title: "White-glove orders",
    brief:
      "From: Ops manager. Re: white-glove handler budget.\n\nWhite-glove handling goes to orders that are big twice over: the ORDER outsizes the storewide average, AND the account's LIFETIME spend outsizes the VIP bar. Both tests in one query — a scalar for the order, a grouped subquery for the account — and the budget gets its count.",
    ask: "Count orders above the storewide average belonging to customers above the VIP bar.",
    template: `SELECT {3}(*) AS white_glove
FROM orders o
WHERE o.total {1} (SELECT AVG(total) FROM orders)
  AND o.customer_id IN (
    SELECT customer_id FROM orders
    GROUP BY customer_id
    HAVING SUM(total) {2}
  );`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the order-size side",
        why: "White-glove orders outsize the storewide average: total above the scalar bar. Reversing it hands premium handling to the modest baskets.",
      },
      {
        answer: "> 2177.08",
        kind: "keyword",
        label: "the vip bar test",
        why: "The account test asks for lifetime spend above the VIP bar — 2177.08 (W54). A lower bar widens the club and inflates the budget.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the budget counter",
        why: "The handler budget needs a headcount of qualifying orders. COUNT(*) collapses the double-filtered rows to it.",
      },
    ],
    distractors: ["<", "> 1000", "SUM", "MAX"],
    walkthrough:
      "Two bars, two tests: the scalar keeps orders above 338.19 (W54), the grouped subquery keeps the five accounts above 2177.08 (W21, W22), and the intersection — orders that are big AND belong to VIPs — counts 28 (W60): the white-glove population. Drop the account bar to 1000 and the club widens to eight accounts (W21), pulling in 34 orders (probed) — a budget built for six extra handlers. Reversing the order test selects the modest half of VIP traffic. SUM in the counter seat dies on SUM(*). The case is the module in miniature: a scalar bar, a grouped bar, and the discipline to test both.",
  },
];
