// Case batch Q4 — Module 4 (subqueries & CTEs) cases cs-1051…cs-1100, wave 4.
// 50 cases: 17 easy / 17 medium / 16 hard across topics q5 (derived tables) ×15,
// q6 (CTEs) ×15, q7 (recursive CTEs) ×10, q8 (subquery capstone) ×10 — the
// deepening pass over wave 2's ground: two-deep derived stages, CTE chains and
// twice-referenced stages, self-limiting recursive ladders (bound always literal
// in the template — only monotone-safe distractors slotted), and capstone mixes.
// Every figure was probed against the live seed db (scripts/m4-cases-w4-facts.ts
// W401–W445 + wave-2 receipts W01–W63, E/F/G/H edges) and is mechanically
// re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesQ4: CaseStudy[] = [
  {
    id: "cs-1051",
    tier: "easy",
    topic: "q5",
    universe: "growth",
    title: "The quiet tail",
    brief:
      "From: Growth lead. Re: the bottom of the league.\n\nEvery board shows the top five; the retention story lives at the bottom. Stage the per-customer spends in a derived table, then read the quietest five off it — smallest first, names attached.",
    ask: "List the 5 customers with the lowest lifetime spend, smallest first.",
    template: `SELECT c.name, stage.spend
FROM (
  SELECT customer_id, {1}(total) AS spend FROM orders GROUP BY customer_id
) AS stage
JOIN customers c ON c.id = stage.{2}
ORDER BY stage.spend {3}
LIMIT 5;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the spend builder",
        why: "The stage stores each account's lifetime total, so the derived aggregation is SUM(total). COUNT would stage order tallies and rank the quietest by frequency instead.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back key",
        why: "The stage keys rows by customer_id, so joining back to customers needs that column. Any other key finds nothing to match.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the smallest-first sort",
        why: "The tail means smallest spend first. DESC would print the whales the board has seen a hundred times.",
      },
    ],
    distractors: ["COUNT", "DESC", "region"],
    walkthrough:
      "The derived table stages one row per customer with their SUM(total); joining back on customer_id attaches names, and the ascending sort reads off the quiet tail: Olivia Brown 444.80, Dmitri Volkov 599.26, Jamal Wright 645.60, Liam O'Brien 705.39, Noah Meyer 737.68. COUNT would rank by order counts and surface the one-order accounts in a different order, DESC would print Alice, Emma and Grace, and stage has no region column to join on.",
  },
  {
    id: "cs-1052",
    tier: "easy",
    topic: "q5",
    universe: "growth",
    title: "Regional peaks",
    brief:
      "From: Growth lead. Re: the region map annotation.\n\nEach region's dot on the map gets its best customer's spend annotated — the peak, not the total, because the story is concentration. Stage the per-customer spends, join the regions, collapse to the peak per region.",
    ask: "Show each region's highest single-customer lifetime spend.",
    template: `SELECT c.region, {1}(stage.spend) AS top
FROM (
  SELECT {2}, SUM(total) AS spend FROM orders GROUP BY customer_id
) AS stage
JOIN customers c ON c.id = stage.customer_id
GROUP BY c.region
ORDER BY top {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak picker",
        why: "The annotation is the best customer per region, so MAX over the staged spends. SUM would print region totals — a different story entirely.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "One row per customer makes the stage a customer league; grouping by anything else changes what the peak means.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the strongest-first sort",
        why: "The map reads strongest region first. ASC would lead with LATAM's 852.44 footnote instead of Europe's peak.",
      },
    ],
    distractors: ["region", "SUM", "ASC"],
    walkthrough:
      "The stage collapses orders to one spend per customer; joining customers attaches regions, and MAX per region finds each map dot's peak: EU 7262.35 (Alice), US 6640.56 (Emma), APAC 4574.23 (Grace), LATAM 852.44 (Olivia). SUM would print the region totals instead — 15089.23 in Europe — and ASC would open the map with the smallest footnote.",
  },
  {
    id: "cs-1053",
    tier: "easy",
    topic: "q5",
    universe: "month-close",
    title: "The paperwork league table",
    brief:
      "From: Controller. Re: billing-ops review, one-liner.\n\nThe review opens with two numbers: the busiest billing relationship and how many accounts hold any bill at all. Stage the per-customer invoice counts in a derived table and read both figures off it.",
    ask: "Show the highest per-customer invoice count and the number of billed customers.",
    template: `SELECT {1}(bills) AS busiest, COUNT(*) AS holders
FROM (
  SELECT customer_id, {2}(*) AS bills FROM invoices GROUP BY {3}
) AS stage;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the busiest reader",
        why: "The one-liner leads with the busiest relationship: MAX over the staged counts. MIN would report the quietest bill-holder instead.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-counter tally",
        why: "The stage counts invoices per customer, so COUNT(*) builds the bills column. SUM would add cent amounts — a money stage, not a paperwork stage.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "One row per customer makes the counts meaningful. Grouping by anything else dissolves the relationship the controller asked about.",
      },
    ],
    distractors: ["MIN", "SUM", "region"],
    walkthrough:
      "The derived table counts invoices per customer — 11 accounts hold the 28 bills, topped by Alice Chen's 5. MAX reads the busiest off the stage and COUNT reads how many accounts hold any bill at all: 5 and 11. MIN would answer 1, the quietest relationship, SUM would stage dollar totals instead of counts, and grouping by region crashes because invoices carry no region.",
  },
  {
    id: "cs-1054",
    tier: "easy",
    topic: "q5",
    universe: "fraud",
    title: "Wide lanes only",
    brief:
      "From: Fraud analyst. Re: coverage cut for the basket study.\n\nThe basket study only covers lanes with real traffic: categories hitting at least 30 distinct baskets. Stage the per-category basket counts, then keep the wide lanes. The narrow ones distort the read.",
    ask: "List categories with at least 30 distinct baskets, busiest first.",
    template: `SELECT {3}, baskets
FROM (
  SELECT p.category, COUNT(DISTINCT oi.order_id) AS baskets
  FROM order_items oi
  JOIN {1} p ON p.id = oi.product_id
  GROUP BY p.category
) AS stage
WHERE baskets {2} 30
ORDER BY baskets DESC;`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "the lane's name source",
        why: "Categories live on products, so the stage joins the detail table to products. Customers have ids but no category column, so the grouping would crash.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the wide-lane floor",
        why: "At least 30 means the inclusive floor. A strict > would drop the lane sitting exactly on 30 and skew the study.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the lane's row key",
        why: "The study reads as a lane table, so each stage row is keyed by category. Keying by product name would stage 16 one-product lanes.",
      },
    ],
    distractors: ["customers", "<", "name"],
    walkthrough:
      "The stage joins order detail to products and counts distinct baskets per category: Accessories 54, Audio 46, Electronics 40, Video 30, Wearables 23, Apparel 22, Fitness 13. The >= 30 floor keeps the four wide lanes. Joining customers would crash on the missing category column, < would keep only Fitness's 13-basket lane, and keying the stage by name would explode it into per-product rows that all fall below the floor.",
  },
  {
    id: "cs-1055",
    tier: "easy",
    topic: "q5",
    universe: "inventory",
    title: "The lane load",
    brief:
      "From: Ops analyst. Re: pick-face balancing.\n\nBalancing the pick faces needs two numbers per pass: the average number of order lines a product appears in, and the heaviest single product. Stage the per-product line counts in a derived table and read both off.",
    ask: "Show the average lines per product and the busiest product's line count.",
    template: `SELECT ROUND(AVG(n), 2) AS lane_load, {3}(n) AS busiest
FROM (
  SELECT product_id, {1}(*) AS n FROM {2} GROUP BY product_id
) AS stage;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "Each stage row counts the order lines referencing one product. SUM would add quantities — a unit load, not a line load.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "where lines live",
        why: "Order lines are order_items rows. Orders carry no product_id, so the stage could not group, and products staging themselves would count 1 each.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the busiest reader",
        why: "The heaviest single product is the MAX of the staged counts. MIN would report the least-picked product — the opposite of the balancing ask.",
      },
    ],
    distractors: ["SUM", "suppliers", "MIN"],
    walkthrough:
      "The stage counts order lines per product across the 16-product catalog; the outer row reads the lane load — an average of 15.69 lines per product — and the busiest single product at 24 lines. SUM would stage unit quantities and answer with a much bigger load, suppliers has neither product_id to group by nor lines to count, and MIN would hand the balancer the sleepiest product instead of the heaviest.",
  },
  {
    id: "cs-1056",
    tier: "medium",
    topic: "q5",
    universe: "fraud",
    title: "The steady-spend six",
    brief:
      "From: Fraud analyst. Re: the typicality paradox.\n\nBig lifetime spend flatters whales with dozens of orders. The paradox list: accounts whose AVERAGE ticket still clears 400 — steady bigness, not accumulated bigness. Stage the per-customer averages and keep the six.",
    ask: "List customers whose average order value exceeds 400, best average first.",
    template: `SELECT c.name, ROUND(stage.t, 2) AS avg_ticket
FROM (
  SELECT customer_id, AVG(total) AS t FROM {1} GROUP BY customer_id
) AS stage
JOIN customers c ON c.id = stage.{2}
WHERE stage.t {3} 400
ORDER BY stage.t DESC;`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "where tickets live",
        why: "Average ticket is an order-value measure, so the stage aggregates orders. Invoices would average billing documents instead.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back key",
        why: "The stage keys by customer_id; the join needs that exact column to attach names. Any other key mismatches.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the clears-400 edge",
        why: "The list keeps averages strictly above 400. < would keep the ten accounts below it — the ordinary half.",
      },
    ],
    distractors: ["invoices", "region", "<"],
    walkthrough:
      "The stage averages each account's tickets; six clear the 400 bar — Liam O'Brien 705.39, Chloe Dubois 533.59, Farid Nasser 486.32, Olivia Brown 444.80, Bruno Silva 426.22, Pedro Alvarez 421.54. Notice who is missing: Alice and Emma, whose many small orders drag their averages down. Staging invoices would average bills, region is not a stage column to join on, and < would list the other ten accounts.",
  },
  {
    id: "cs-1057",
    tier: "medium",
    topic: "q5",
    universe: "expense",
    title: "The vendor heavyweights",
    brief:
      "From: Finance partner. Re: the spend-concentration header.\n\nThe header names the two vendors that own the ledger: stage the per-vendor totals in a derived-friendly grouping, convert cents to dollars, and read off the top two.",
    ask: "Show the top 2 vendors by total expense, in dollars.",
    template: `SELECT vendor, ROUND(vendor_total, 2) AS vendor_total
FROM (
  SELECT vendor, SUM(amount_cents) {3} AS vendor_total FROM {1} GROUP BY vendor
) AS stage
ORDER BY vendor_total DESC
LIMIT {2};`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "the vendor ledger",
        why: "Vendors bill through the expense ledger. Payments have no vendor column, so the grouping would crash.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the header's row count",
        why: "The header names exactly two heavyweights. It is a presentation constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "/ 100.0",
        kind: "keyword",
        label: "the cents-to-dollars step",
        why: "amount_cents stores cents; dividing by 100.0 prints the dollars the header reads. Multiplying would print 1680000.00 where 16800.00 belongs.",
      },
    ],
    distractors: ["payments", "5", "* 100.0"],
    walkthrough:
      "Grouping the ledger by vendor and converting cents to dollars, the top two read: Atlas Property GmbH at 16800.00 — the landlord, one rent line at a time — and AdWorks Media at 4570.00. Payments would crash the grouping (no vendor column), LIMIT 5 would overflow the header, and multiplying cents by 100 would print six-figure nonsense where the rent belongs.",
  },
  {
    id: "cs-1058",
    tier: "medium",
    topic: "q5",
    universe: "fraud",
    title: "Anatomy of the big half",
    brief:
      "From: Fraud analyst. Re: above-bar composition.\n\nThe 42 above-bar orders are not one population — the composition matters. Stage the big orders in a CTE-style derived table, then break them down by status. One status barely shows up; that is the story.",
    ask: "Show the status breakdown of orders above the storewide average, busiest status first.",
    template: `SELECT status, {1}(*) AS n
FROM (
  SELECT * FROM orders
  WHERE total > (SELECT {2}(total) FROM orders)
) AS stage
GROUP BY {3}
ORDER BY n DESC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the segment tally",
        why: "The breakdown counts orders per status. SUM would add their totals — a value mix, not a count mix.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar inside the stage",
        why: "The stage filters with the storewide average bar. MAX would set the bar at 1088.44 and stage nothing at all.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the breakdown key",
        why: "The composition question is by status. Grouping by customer would give 16 one-to-two-order rows; grouping by total gives 42 singles.",
      },
    ],
    distractors: ["SUM", "MAX", "customer_id"],
    walkthrough:
      "The stage keeps the 42 orders above the storewide average of about 338.19; grouped by status they read: 18 delivered, 17 shipped, 6 pending — and exactly 1 cancelled — order 83, a 397.99 ticket that still cleared the bar. SUM would produce a dollar mix, MAX would empty the stage entirely, and grouping by customer would dissolve the status story into one row per account.",
  },
  {
    id: "cs-1059",
    tier: "medium",
    topic: "q5",
    universe: "growth",
    title: "The floor pot",
    brief:
      "From: Growth lead. Re: the mirror of the crown pot.\n\nThe crown pot added up everyone's biggest ticket. The mirror: stage each customer's floor ticket, join back to the real orders, and add the floors up. Sixteen floors, one pot.",
    ask: "Sum every customer's smallest order, rounded to cents.",
    template: `SELECT ROUND({3}(o.total), 2) AS floor_pot
FROM orders o
JOIN (
  SELECT customer_id, {1}(total) AS mn FROM orders GROUP BY {2}
) f ON f.customer_id = o.customer_id AND o.total = f.mn;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor maker",
        why: "The stage keeps each customer's smallest ticket. MAX would stage ceilings and rebuild the crown pot instead — the mirror image.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "Floors are per-customer, so the stage groups by the customer key. Grouping by anything else floors the wrong kingdoms.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot builder",
        why: "Sixteen matched floor rows add up with SUM. COUNT would answer 16 — a row count, not a value.",
      },
    ],
    distractors: ["MAX", "COUNT", "AVG"],
    walkthrough:
      "The stage holds one floor ticket per customer; joining back on customer and exact total matches those 16 real orders, and SUM lands on 2407.43 — the floor pot, the mirror of the 10441.02 crown pot. MAX would rebuild the crowns, COUNT would answer the row count 16, and averaging the matched floors would report 150.46 — a per-floor figure, not the pot.",
  },
  {
    id: "cs-1060",
    tier: "medium",
    topic: "q5",
    universe: "catalog",
    title: "Two stages deep",
    brief:
      "From: Merchandising analyst. Re: the region-revenue gate.\n\nThe gate: regions whose customers collectively spend over 10000. That needs a stage of per-customer spends folded into region totals — a stage inside a stage. Name the regions that clear the gate, biggest first.",
    ask: "List regions whose total customer spend exceeds 10000, biggest first.",
    template: `SELECT region, ROUND(region_total, 2) AS region_total
FROM (
  SELECT c.region AS region, SUM(stage.spend) AS region_total
  FROM (
    SELECT {2}, SUM(total) AS spend FROM orders GROUP BY customer_id
  ) AS stage
  JOIN customers c ON c.id = stage.customer_id
  GROUP BY c.{3}
) AS t
WHERE region_total > {1}
ORDER BY region_total DESC;`,
    slots: [
      {
        answer: "10000",
        kind: "number",
        noVerify: true,
        label: "the gate's bar",
        why: "10000 is the stakeholder-set gate. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the inner stage's grain",
        why: "The inner stage stages one spend per customer — the unit the region fold then sums. Any other grain changes what a spend row means.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the fold key",
        why: "The outer stage folds customer spends into regions. Folding by city would print sixteen neighbourhood rows; by status would print four pipeline rows.",
      },
    ],
    distractors: ["region", "city", "name"],
    walkthrough:
      "The inner stage stages 16 per-customer spends; the middle fold sums them per region; the gate keeps the two heavyweights: EU at 15089.23 and APAC at 11605.45. US lands at 7286.16 and LATAM at 852.44 — real money, below the gate. Replacing the inner grain with region itself is circular (orders carries no region), folding by city or name would dissolve the map into neighbourhood rows, and the gate bar is a constant that never prints.",
  },
  {
    id: "cs-1061",
    tier: "hard",
    topic: "q5",
    universe: "funnel",
    title: "The podium, counted sideways",
    brief:
      "From: Growth lead. Re: the rank-without-windows memo.\n\nNo window functions in this module's toolkit — so rank the spend league sideways: keep the customers who are beaten by FEWER than three rivals. The stage holds the league; the correlated count does the ranking.",
    ask: "Count customers beaten by fewer than 3 higher spenders.",
    template: `SELECT {3}(*) AS podium
FROM (
  SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id
) AS stage
WHERE (
  SELECT COUNT(*) FROM (
    SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id
  ) s2
  WHERE s2.spend {2} stage.spend
) < {1};`,
    slots: [
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "Fewer than three rivals above you means the top three. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the rival test",
        why: "Rivals are strictly higher spenders. >= would count ties as rivals — and the league has no ties, so the boundary matters at exactly-three.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the podium tally",
        why: "The memo asks how many make the podium: COUNT(*) over the survivors prints it.",
      },
    ],
    distractors: ["<=", ">", "SUM"],
    walkthrough:
      "The stage holds the 16-customer spend league; the correlated count asks each row how many rivals beat it, and fewer than three wins a podium seat: Alice 7262.35, Emma 6640.56, Grace 4574.23 — the count is 3. Using >= would promote Maya too (four rivals at zero-tolerance ties), > would shrink the podium to Alice and Emma, and SUM cannot count rivals.",
  },
  {
    id: "cs-1062",
    tier: "hard",
    topic: "q5",
    universe: "fraud",
    title: "Steady AND busy",
    brief:
      "From: Fraud analyst. Re: refining the paradox list.\n\nThe paradox list had a flaw: one-order accounts clear any average trivially. Refine it — average ticket above 400 AND more than one order. The stage computes both per customer; the conjunctive filter keeps the genuinely busy big spenders.",
    ask: "Count customers with average ticket above 400 and more than one order.",
    template: `SELECT COUNT(*) AS busy_big_spenders
FROM (
  SELECT customer_id, AVG(total) AS t, COUNT(*) AS n
  FROM orders GROUP BY customer_id
) AS stage
WHERE stage.t > {3} AND stage.{2} > {1};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the busy floor",
        why: "More than one order is the busy test. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the busy measure",
        why: "The stage carries the per-customer order count as n. total is not a stage column, so the busy test would crash.",
      },
      {
        answer: "400",
        kind: "number",
        noVerify: true,
        label: "the steady bar",
        why: "400 is the paradox list's average-ticket bar. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["500", "total", "2"],
    walkthrough:
      "The stage carries both measures per customer; the conjunctive filter keeps accounts above the 400 average AND past the one-order floor: Chloe 533.59, Farid 486.32, Bruno 426.22 and Pedro 421.54 — 4 accounts, with Liam's and Olivia's solo 705.39 and 444.80 correctly evicted. Raising the bar to 500 would keep two, testing the nonexistent stage column total would crash, and a floor of 2 would evict Bruno and Pedro too, leaving 2.",
  },
  {
    id: "cs-1063",
    tier: "hard",
    topic: "q5",
    universe: "catalog",
    title: "Lane leaders, staged",
    brief:
      "From: Pricing analyst. Re: the premium-lane census, staged.\n\nThe census counts products priced above their OWN category's average. Stage the per-category averages once, join the shelf back to the stage, and count the leaders. One product sits exactly on its lane mean — the strict edge decides it.",
    ask: "Count products priced above their own category's average.",
    template: `SELECT COUNT(*) AS lane_leaders
FROM products p
JOIN (
  SELECT category, {1}(price) AS avg_price FROM products GROUP BY {2}
) a ON a.category = p.category
WHERE p.price {3} a.avg_price;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the lane mean",
        why: "The stage holds each category's average price. MAX would stage the lane ceiling, which nothing exceeds — the census would find zero leaders.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the stage's grain",
        why: "Lanes are categories, so the stage groups by category. Grouping by id would stage one average per product — every product its own baseline.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the leader edge",
        why: "Leaders sit strictly above the lane mean. < would count the eight laggards instead — the mirror census.",
      },
    ],
    distractors: ["MAX", "id", "<"],
    walkthrough:
      "The stage averages price per lane; the join attaches each product's lane mean; the strict edge counts 7 leaders — Smart Watch S over the 139.50 Wearables lane, Noise-Canceling Headset over the 109.66 Audio lane, and five more. MAX would stage unbeatable ceilings and find nobody, staging by id would compare every product only with itself and find nobody, and < would count the 8 laggards — the census the buyer did not order.",
  },
  {
    id: "cs-1064",
    tier: "hard",
    topic: "q5",
    universe: "growth",
    title: "Undefeated, staged",
    brief:
      "From: Growth lead. Re: the top-spender attestation.\n\nThe attestation names the customer nobody out-spends — proven, not assumed: keep the staged league rows where NOT EXISTS a higher spender. If the query returns one name, the throne is mathematically unoccupied.",
    ask: "List the customer with no higher spender in the staged league.",
    template: `SELECT c.name
FROM customers c
JOIN (
  SELECT customer_id, {3}(total) AS spend FROM orders GROUP BY {2}
) stage ON stage.customer_id = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM (
    SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id
  ) s2
  WHERE s2.spend {1} stage.spend
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the rival test",
        why: "Undefeated means no rival spends strictly more. >= would make every row its own rival — nobody survives the NOT EXISTS.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "The league stages one spend per customer. Grouping by anything else changes what being unbeaten means.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the league's measure",
        why: "The attestation is about lifetime spend, so the stage sums totals. COUNT would stage order tallies and crown the busiest account instead.",
      },
    ],
    distractors: [">=", "region", "COUNT"],
    walkthrough:
      "Both stages hold the same 16-row spend league; the NOT EXISTS keeps rows with no strictly-higher rival, and exactly one survives: Alice Chen at 7262.35 — the attestation's proof. >= would make each row rival itself and return nobody, region would crash the stage (orders has no region), and COUNT would stage order counts and crown Alice's 24-order ledger for the wrong reason.",
  },
  {
    id: "cs-1065",
    tier: "hard",
    topic: "q5",
    universe: "month-close",
    title: "The billing annex",
    brief:
      "From: Controller. Re: the three-heaviest ledgers.\n\nThe annex lists the three heaviest billing relationships in dollars, with the ledger's grand total stamped beside each row for scale. Stage the per-customer invoice sums, join the names, convert, and stamp.",
    ask: "Show the 3 customers with the highest invoiced totals, with the ledger total stamped.",
    template: `SELECT c.name, ROUND(stage.billed {3}, 2) AS billed,
  (SELECT ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices) AS ledger
FROM (
  SELECT customer_id, SUM(amount_cents) AS billed FROM invoices GROUP BY {2}
) AS stage
JOIN customers c ON c.id = stage.customer_id
WHERE stage.billed > {1}
ORDER BY stage.billed DESC
LIMIT 3;`,
    slots: [
      {
        answer: "1000000",
        kind: "number",
        noVerify: true,
        label: "the annex's cents gate",
        why: "One million cents — ten thousand dollars — is the annex's entry gate. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "Billing relationships are per customer, so the stage groups by the customer key. Grouping by status would stage three document states, not relationships.",
      },
      {
        answer: "/ 100.0",
        kind: "keyword",
        label: "the cents-to-dollars step",
        why: "amount_cents stores cents; dividing by 100.0 prints dollars. Multiplying would print 2662900.00 where 26629.00 belongs.",
      },
    ],
    distractors: ["status", "* 100.0", "2000000"],
    walkthrough:
      "The stage sums each relationship's invoices in cents; the gate keeps the heavyweights, the conversion prints dollars, and the uncorrelated scalar stamps the ledger's 86977.00 grand total on every row: Alice Chen 26629.00, Emma Wilson 13384.00, Maya Patel 11542.00. Grouping by status would stage paid-open-void buckets that cannot join, multiplying cents would print nonsense, and a two-million-cent gate would annex only Alice.",
  },
  {
    id: "cs-1066",
    tier: "easy",
    topic: "q6",
    universe: "fraud",
    title: "Hot carts, staged",
    brief:
      "From: Fraud analyst. Re: the live-cart watchlist.\n\nThe watchlist pipeline stages pending orders once, then everything downstream reads the stage. Build the stage with a CTE and count what flows through it — the figure the watchlist opens with.",
    ask: "Count pending orders via a staged CTE.",
    template: `WITH hot AS (SELECT {3} AS val FROM orders WHERE status = {1})
SELECT {2}(val) AS hot_count FROM hot;`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the watchlist state",
        why: "Live carts are pending orders. Any other status stages a different population for the watchlist.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the watchlist opener",
        why: "COUNT(val) tallies non-null staged values. SUM would add the order values — a dollar figure where a count belongs.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the staged column",
        why: "The stage carries order values for downstream pricing checks. Staging shipped_at would count nothing — pending carts have never shipped.",
      },
    ],
    distractors: ["SUM", "shipped_at"],
    walkthrough:
      "The CTE stages the 14 pending orders as values, and COUNT(val) reads 14 off the stage — the count that skips NULLs, which is exactly why the staged column matters: staging shipped_at instead would read zero, because a pending cart has never shipped and the column is NULL on every staged row. Reaching for SUM would answer 6113 — the dollars sitting in the stage, not the rows — and the watchlist opener needs a tally, not a balance.",
  },
  {
    id: "cs-1067",
    tier: "easy",
    topic: "q6",
    universe: "month-close",
    title: "Done deals, staged",
    brief:
      "From: Controller. Re: close checklist, fulfillment cut.\n\nThe fulfillment line counts completed orders — the stage-first way. Build a CTE over the completed orders, then count the stage. The stage pattern keeps the close workbook composable.",
    ask: "Count delivered orders via a staged CTE.",
    template: `WITH done AS (SELECT id FROM {1} WHERE {2} = 'delivered')
SELECT {3}(*) AS done_count FROM done;`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "where fulfillment lives",
        why: "Delivered is an order state. The stage must read orders; invoices stage billing states, not boxes.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the stage's filter column",
        why: "The stage keeps rows whose status is 'delivered'. Filtering any other column against that literal stages nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the checklist figure",
        why: "The close checklist wants the count of completed orders: COUNT(*) over the stage prints it.",
      },
    ],
    distractors: ["customer_id", "SUM", "invoices"],
    walkthrough:
      "The CTE stages the 52 delivered orders once; COUNT reads 52 off the stage for the checklist. Filtering customer_id against 'delivered' would stage nothing — ids never equal that string — SUM cannot count rows, and staging invoices would find no delivered document state and count zero.",
  },
  {
    id: "cs-1068",
    tier: "easy",
    topic: "q6",
    universe: "growth",
    title: "The middle league",
    brief:
      "From: Growth lead. Re: the mid-tier cohort.\n\nThe mid-tier cohort spends comfortably but not spectacularly: lifetime totals between 1000 and 2000. Stage the per-customer spends in a CTE, then count who lands in the band.",
    ask: "Count customers with lifetime spend between 1000 and 2000.",
    template: `WITH s AS (SELECT customer_id, {1}(total) AS spend FROM {3} GROUP BY customer_id)
SELECT COUNT(*) AS mid_league
FROM s
WHERE spend {2} 1000 AND 2000;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime builder",
        why: "Lifetime spend is the sum of a customer's orders. COUNT would stage order tallies — numbers far below the band.",
      },
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the band test",
        why: "Between 1000 and 2000 is a range, and BETWEEN is the inclusive range test. NOT BETWEEN would count everyone outside the cohort.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where spend accrues",
        why: "Lifetime spend accrues on orders. The CTE must read orders; expenses have no customer to group by.",
      },
    ],
    distractors: ["COUNT", "NOT BETWEEN", "expenses"],
    walkthrough:
      "The CTE stages 16 lifetime spends; BETWEEN keeps the band: Pedro Alvarez 1686.17, Farid Nasser 1458.97 and Keiko Sato 1098.60 — the middle league of 3. COUNT would stage tallies of 1 to 24 and find nobody in a 1000-to-2000 band, NOT BETWEEN would count the 13 accounts outside it, and staging expenses would crash on the missing customer_id.",
  },
  {
    id: "cs-1069",
    tier: "easy",
    topic: "q6",
    universe: "fraud",
    title: "Outside the VIP rope",
    brief:
      "From: Fraud analyst. Re: the non-VIP audit sample.\n\nThe audit samples accounts OUTSIDE the VIP rope: customers absent from the staged VIP list. Build the VIP list in a CTE, then count who stands outside it with a guarded complement.",
    ask: "Count customers not on the VIP list (lifetime spend above 2177.08).",
    template: `WITH vip AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM(total) {1} 2177.08)
SELECT COUNT(*) AS outside
FROM customers
WHERE id NOT {2} (SELECT customer_id FROM {3});`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the rope's height",
        why: "VIP means lifetime spend above the 2177.08 house mean. MAX would test single biggest orders — none reaches the rope.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the complement's shape",
        why: "The audit wants NOT IN — absent from the staged list. Plain IN would count the VIPs themselves.",
      },
      {
        answer: "vip",
        kind: "keyword",
        label: "the staged list",
        why: "The complement reads the CTE's staged list. Reading orders would match every customer — the complement would be empty.",
      },
    ],
    distractors: ["MAX", "IN", "orders"],
    walkthrough:
      "The CTE stages the 5 VIPs — Alice, Emma, Grace, Maya, Chloe — and NOT IN keeps everyone absent from it: 11 accounts make the audit sample. MAX inside the HAVING would test single orders, stage an empty list, and pass all 16 through, IN would count the 5 VIPs instead, and reading the raw orders table would put every customer id on the blacklist, leaving the sample empty.",
  },
  {
    id: "cs-1070",
    tier: "easy",
    topic: "q6",
    universe: "expense",
    title: "Unpaid, staged",
    brief:
      "From: AR clerk. Re: the dunning counter, staged.\n\nThe dunning dashboard stages open invoices once and every widget reads the stage. Build the stage with a CTE and produce the opener figure: how many open documents are there?",
    ask: "Count open invoices via a staged CTE.",
    template: `WITH unpaid AS (SELECT id FROM {3} WHERE status = {1})
SELECT {2}(*) AS unpaid_count FROM unpaid;`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the dunning state",
        why: "Dunning targets open invoices specifically. Paid documents need thanks; voided ones need archive checks.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the dashboard opener",
        why: "The widget opens with the stage's row count: COUNT(*) over the staged documents.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "where document states live",
        why: "Open is an invoice state. The stage must read invoices; orders know nothing about billing documents.",
      },
    ],
    distractors: ["'paid'", "SUM", "orders"],
    walkthrough:
      "The CTE stages the 6 open invoices — the dunning queue's whole population — and COUNT reads 6 off the stage. 'paid' would stage the 21 settled documents, SUM cannot count rows, and staging orders would find no 'open' order state and count zero.",
  },
  {
    id: "cs-1071",
    tier: "medium",
    topic: "q6",
    universe: "fraud",
    title: "Whales by region, staged",
    brief:
      "From: Fraud analyst. Re: the whale geography memo.\n\nThe memo maps whales — accounts over 2000 lifetime — by region. Stage the spends once, stage the regions once, join the two stages, and collapse. Two regions tie; one region is a footnote.",
    ask: "Show the region counts of customers with lifetime spend above 2000.",
    template: `WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id),
r AS (SELECT id, region FROM {1})
SELECT r.region, {2}(*) AS whales
FROM s JOIN r ON r.id = s.customer_id
WHERE s.spend {3} 2000
GROUP BY r.region
ORDER BY whales DESC;`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the region source",
        why: "Regions live on customers, so the second stage reads customers. Products carry no region column, so the stage could not build.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the whale tally",
        why: "The memo counts whales per region: COUNT(*) over the joined stages. SUM would add their spends — a value map, not a headcount map.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the whale bar",
        why: "Whales sit strictly above the 2000 bar. < would map the eleven smaller accounts instead.",
      },
    ],
    distractors: ["products", "SUM", "<"],
    walkthrough:
      "Two stages — one per-customer spend, one customer-to-region map — join on the customer key; the 2000 bar keeps the five whales, and the region collapse reads: EU 2, APAC 2, US 1. Staging products would crash on the missing region column, SUM would produce a spend map whose rows read like the region chain, and < would map the eleven non-whales.",
  },
  {
    id: "cs-1072",
    tier: "medium",
    topic: "q6",
    universe: "fraud",
    title: "The headline number",
    brief:
      "From: Fraud analyst. Re: the board slide's two anchors.\n\nThe slide anchors on two numbers from one stage: the mean lifetime spend across accounts, and the peak. Stage the per-customer spends in a CTE, then read both anchors — computed once, printed twice.",
    ask: "Show the average and maximum per-customer lifetime spend.",
    template: `WITH s AS (SELECT customer_id, {1}(total) AS spend FROM {3} GROUP BY customer_id)
SELECT ROUND({2}(spend), 2) AS headline, MAX(spend) AS peak FROM s;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime builder",
        why: "The stage stores lifetime totals, so SUM builds the spend column. COUNT would stage order tallies and shrink every anchor.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the headline reader",
        why: "The slide's headline is the mean across accounts. COUNT would answer 16 — the account count, not a money figure.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where spend accrues",
        why: "Lifetime spend accrues on orders. The stage must read orders; invoices would stage cents and misplace every decimal.",
      },
    ],
    distractors: ["COUNT", "MIN", "invoices"],
    walkthrough:
      "The CTE stages 16 lifetime spends; the outer row reads the headline — the 2177.08 house mean, the bar every VIP brief cites — and the peak, Alice's 7262.35. COUNT would answer 16 as the headline, MIN would read 444.80 — the floor, not the anchor — and staging invoices would average cents into a figure 100× too large.",
  },
  {
    id: "cs-1073",
    tier: "medium",
    topic: "q6",
    universe: "fraud",
    title: "The chain to the heavyweights",
    brief:
      "From: Fraud analyst. Re: the two-stage filter, formalized.\n\nThe heavyweight filter chains: stage lifetime spends, then stage only the rows clearing 2500. The second CTE references the first — the chain is the pattern. Count what survives the full chain.",
    ask: "Count customers with lifetime spend above 2500 via a two-CTE chain.",
    template: `WITH t1 AS (SELECT customer_id, SUM(total) AS spend FROM {1} GROUP BY customer_id),
t2 AS (SELECT customer_id FROM t1 WHERE spend > {2})
SELECT {3}(*) AS heavy FROM t2;`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the chain's source",
        why: "The first stage reads orders to build lifetime spends. Payments have no customer_id, so the chain would break at its first link.",
      },
      {
        answer: "2500",
        kind: "number",
        noVerify: true,
        label: "the heavyweight bar",
        why: "2500 is the stakeholder-set bar. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chain's output",
        why: "The chain ends in a count of surviving accounts: COUNT(*) over the second stage.",
      },
    ],
    distractors: ["payments", "3000", "SUM"],
    walkthrough:
      "The first CTE stages 16 lifetime spends; the second stages only the rows above 2500 — a chain where each stage reads the last. Five heavyweights survive: Alice, Emma, Grace, Maya and Chloe, whose 2667.93 clears the bar. Payments would break the chain immediately, a 3000 bar would drop Chloe and leave 4, and SUM cannot count the survivors.",
  },
  {
    id: "cs-1074",
    tier: "medium",
    topic: "q6",
    universe: "expense",
    title: "Heavy categories, staged",
    brief:
      "From: Finance partner. Re: the category gate.\n\nThe gate keeps expense categories whose staged total clears 2000 dollars. Stage the per-category totals in a CTE — cents converted on the way in — then count the categories that clear it.",
    ask: "Count expense categories with staged totals above 2000 dollars.",
    template: `WITH cats AS (SELECT category, SUM(amount_cents) {3} AS total FROM {1} GROUP BY category)
SELECT {2}(*) AS heavy
FROM cats
WHERE total > 2000;`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "the ledger's home table",
        why: "Categories and cents live on the expense ledger. Invoices have no category column, so the stage could not group.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the gate's tally",
        why: "The gate reports how many categories clear it: COUNT(*) over the surviving stage rows.",
      },
      {
        answer: "/ 100.0",
        kind: "keyword",
        label: "the cents-to-dollars step",
        why: "Converting inside the stage means every downstream comparison reads dollars. Multiplying would inflate the stage a hundredfold.",
      },
    ],
    distractors: ["invoices", "SUM", "* 100.0"],
    walkthrough:
      "The CTE stages four category totals in dollars — Rent 16800.00, Ads 4570.00, Travel 2521.00, Tools 1525.00 — and the gate clears three of them past 2000. Staging invoices would crash on the missing category, SUM cannot count the survivors, and multiplying cents by 100 would push even Tools past the gate for 4.",
  },
  {
    id: "cs-1075",
    tier: "medium",
    topic: "q6",
    universe: "fraud",
    title: "The five-thousand club, staged",
    brief:
      "From: Fraud analyst. Re: the club roster with live stamps.\n\nThe club: accounts whose staged lifetime spend clears 5000. The roster prints each member with their staged spend stamped beside the name — one stage, two uses: filtered for membership, read for the stamp.",
    ask: "List customers with lifetime spend above 5000, with their staged spend.",
    template: `WITH s AS (SELECT customer_id, {3}(total) AS spend FROM orders GROUP BY customer_id)
SELECT c.name, (SELECT {2} FROM s WHERE s.customer_id = c.id) AS spend
FROM customers c
WHERE c.id IN (SELECT customer_id FROM s WHERE spend {1} 5000)
ORDER BY c.name;`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the club's bar",
        why: "Membership means spend strictly above 5000. < would roster the fourteen accounts below the bar.",
      },
      {
        answer: "spend",
        kind: "keyword",
        label: "the staged stamp",
        why: "The stamp reads the stage's spend column for each member. Reading customer_id would stamp ids where money belongs.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime builder",
        why: "The stage stores lifetime totals, so SUM builds the spend column. COUNT would stage order tallies and nobody would clear 5000.",
      },
    ],
    distractors: ["<", "customer_id", "COUNT"],
    walkthrough:
      "The stage is used twice: the IN subquery filters membership down to the accounts above 5000 — Alice Chen and Emma Wilson only — and the correlated scalar stamps each member's staged spend: 7262.35 and 6640.56. < would roster the other fourteen accounts, stamping customer ids would print keys where money belongs, and COUNT as the stage builder would tally orders — 24 at most — leaving the club empty.",
  },
  {
    id: "cs-1076",
    tier: "hard",
    topic: "q6",
    universe: "growth",
    title: "The even-keel pot, staged",
    brief:
      "From: Growth lead. Re: the mirror pots, formalized.\n\nThe crown pot grabbed each customer's biggest ticket; the even-keel pot grabs each customer's most TYPICAL ticket — the one sitting exactly on their staged average. Stage the averages in a CTE, match by row-value, sum what matches. Only the solo accounts can hit their own mean.",
    ask: "Sum the orders whose total equals their customer's staged average, via CTE.",
    template: `{2} crowns AS (SELECT customer_id, {1}(total) AS mt FROM orders GROUP BY {3})
SELECT ROUND(SUM(total), 2) AS pot
FROM orders
WHERE (customer_id, total) IN (SELECT customer_id, mt FROM crowns);`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the typical-ticket maker",
        why: "The stage stores each customer's average ticket. MAX would stage the crowns and rebuild the 10441.02 pot instead.",
      },
      {
        answer: "WITH",
        kind: "keyword",
        label: "the staging keyword",
        why: "The stage is a CTE, and CTEs begin with WITH. AS alone cannot introduce a stage — the parser rejects it.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the stage's grain",
        why: "Typicality is per customer, so the stage groups by the customer key. Grouping by status would stage state averages that no order-total pair matches.",
      },
    ],
    distractors: ["MAX", "AS", "region"],
    walkthrough:
      "The CTE stages each customer's average ticket; the row-value IN keeps orders whose total equals their owner's staged mean — and only the two solo accounts can manage it: Liam's single 705.39 order IS his average, and Olivia's 444.80 is hers. The pot lands on 1150.19. MAX would rebuild the crown pot of 10441.02, AS cannot introduce a CTE and the parser rejects it outright, and staging by status would pair state averages against customer ids — no matches, an empty pot.",
  },
  {
    id: "cs-1077",
    tier: "hard",
    topic: "q6",
    universe: "supplier",
    title: "Peak and floor, one stage",
    brief:
      "From: Procurement. Re: the spend-league bookends.\n\nThe bookends memo reads two numbers off one stage: the league's peak and its floor. Build the stage once as a CTE, then read both extremes — no second pass over the base table.",
    ask: "Show the highest and lowest per-customer lifetime spend from one staged CTE.",
    template: `WITH s AS (SELECT customer_id, {2}(total) AS spend FROM {1} GROUP BY customer_id)
SELECT (SELECT ROUND({3}(spend), 2) FROM s) AS peak,
  (SELECT ROUND(MIN(spend), 2) FROM s) AS floor_line;`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the stage's source",
        why: "Lifetime spend accrues on orders. The stage must read orders once; invoices would stage cents and break every decimal.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime builder",
        why: "The stage stores lifetime totals, so SUM builds the spend column. AVG would stage average tickets — a 705.39 peak, a very different league.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak reader",
        why: "The bookend on top is MAX over the staged spends. AVG would read the 2177.08 mean — neither bookend.",
      },
    ],
    distractors: ["AVG", "invoices", "SUM"],
    walkthrough:
      "One CTE stages the 16-row spend league; two scalar reads print the bookends: peak 7262.35 (Alice) and floor 444.80 (Olivia). AVG as the stage builder would make the league about typical tickets — peak 705.39 — staging invoices would shift every decimal, and SUM as the peak reader would print the 34833.28 store total where the league's best belongs.",
  },
  {
    id: "cs-1078",
    tier: "hard",
    topic: "q6",
    universe: "fraud",
    title: "The complement, staged twice",
    brief:
      "From: Fraud analyst. Re: the non-VIP roster, formalized.\n\nThe roster needs the eleven accounts outside the VIP rope — but built the staged way: stage the spends, stage the rope-clearers as a second CTE, then take the complement. Two stages, one complement.",
    ask: "List customers absent from the staged above-2177.08 roster.",
    template: `WITH t1 AS (SELECT customer_id, {1}(total) AS spend FROM orders GROUP BY customer_id),
t2 AS (SELECT customer_id FROM t1 WHERE spend {2} 2177.08)
SELECT c.name
FROM customers c
WHERE c.id NOT IN (SELECT customer_id FROM {3})
ORDER BY c.name;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime builder",
        why: "The first stage stores lifetime totals, so SUM builds the spend column. COUNT would stage tallies of at most 24 and the rope would catch nobody.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the rope's edge",
        why: "The rope catches strictly-above-2177.08 spends. < would stage the eleven smaller accounts as the rope itself.",
      },
      {
        answer: "t2",
        kind: "keyword",
        label: "the complement's target",
        why: "The complement reads the second stage — the rope list. Reading t1 would complement against the whole league and roster nobody.",
      },
    ],
    distractors: ["<", "t1", "COUNT"],
    walkthrough:
      "The chain stages spends, then the rope — five customers clear 2177.08 — and the complement prints the eleven names outside it, from Bruno Silva to Pedro Alvarez. A < rope would stage the eleven smaller accounts and print the five VIPs instead, complementing against t1 would put all 16 on the blacklist and roster nobody, and COUNT as the stage builder would leave the rope empty and pass all sixteen through.",
  },
  {
    id: "cs-1079",
    tier: "hard",
    topic: "q6",
    universe: "catalog",
    title: "Premium past the lane, staged",
    brief:
      "From: Pricing analyst. Re: the multiple-of-lane census.\n\nThe census sharpens: products priced above their lane's staged average TIMES a multiple. Stage the lane averages in a CTE, join the shelf, apply the multiple. At the 1× multiple, seven products lead their lanes.",
    ask: "Count products priced above their category's staged average times 1.",
    template: `WITH lanes AS (SELECT category, {1}(price) AS lane FROM products GROUP BY category)
SELECT COUNT(*) AS premium
FROM products p
JOIN lanes ON lanes.category = p.category
WHERE p.price > lanes.{2} * {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the lane builder",
        why: "The stage holds each category's average price. SUM would stage lane totals — ceilings that no single price exceeds.",
      },
      {
        answer: "lane",
        kind: "keyword",
        label: "the staged column",
        why: "The comparison multiplies the stage's lane column. Multiplying the category name would compare a price against text — nothing survives.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the census multiple",
        why: "The 1× multiple is the census's setting. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["2", "category", "SUM"],
    walkthrough:
      "The CTE stages the seven lane averages — Wearables 139.50, Audio 109.66 — and the join applies the 1× multiple: seven products price above their own lane, from the Smart Watch to the Laptop Stand. At a 2× multiple the census empties — no product doubles its lane — multiplying the category text compares price against words and finds nothing, and SUM as the lane builder stages unbeatable totals.",
  },
  {
    id: "cs-1080",
    tier: "hard",
    topic: "q6",
    universe: "growth",
    title: "The heavyweight map, chained",
    brief:
      "From: Growth lead. Re: the region map, whale cut.\n\nThe map plots accounts above 3000 lifetime by region. Chain the stages: spends first, rope-clearers second, then join the map stage to customers and collapse. Three links, one geography.",
    ask: "Show the region counts of customers with lifetime spend above 3000.",
    template: `WITH t1 AS (SELECT customer_id, {3}(total) AS spend FROM orders GROUP BY customer_id),
t2 AS (SELECT customer_id FROM t1 WHERE spend > 3000)
SELECT region, COUNT(*) AS whales
FROM t2
JOIN customers c ON c.{1} = t2.customer_id
GROUP BY c.{2}
ORDER BY whales DESC;`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the map join key",
        why: "The map stage joins to customers on the account id. Joining on region compares text to numbers — no match, an empty map.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the map's collapse key",
        why: "The geography collapses by region. Grouping by name would print four account rows where a map belongs.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime builder",
        why: "The first stage stores lifetime totals, so SUM builds the spend column. COUNT would stage order tallies and the 3000 rope would catch nobody.",
      },
    ],
    distractors: ["region", "name", "COUNT"],
    walkthrough:
      "The chain stages spends, keeps the four above 3000 — Alice, Emma, Grace, Maya — and the map collapses them by region: APAC 2, EU 1, US 1. Joining on region would compare text against ids and blank the map, collapsing by name would print four account labels where two-to-one geography belongs, and COUNT as the stage builder would leave the rope empty at every link.",
  },
  {
    id: "cs-1081",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The ten-step runbook",
    brief:
      "From: Growth lead. Re: the onboarding runbook ladder.\n\nThe runbook generator builds its step numbers with a recursive ladder: start at 10, walk down by one, stop at the floor. Build the ladder and count its rungs — the anchor and the step are the whole machine.",
    ask: "Count the rungs of a recursive countdown from 10 stepping down by 1.",
    template: `WITH RECURSIVE run(n) AS (SELECT {3} UNION ALL SELECT n {2} FROM run WHERE n > 1)
SELECT {1}(*) AS rungs FROM run;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the rung counter",
        why: "The runbook needs the ladder's length: COUNT(*) over the recursive output. SUM would add the step numbers — a different figure entirely.",
      },
      {
        answer: "- 1",
        kind: "keyword",
        label: "the step down",
        why: "The runbook walks down one step at a time. A two-at-a-time step skips every second rung and shortens the ladder.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the anchor",
        why: "Ten is where the countdown starts. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["- 2", "- 5", "20"],
    walkthrough:
      "The anchor seeds the ladder with 10; the recursive arm emits n minus 1 while n > 1 — the bound in the WHERE is what stops the walk. The ladder runs 10, 9, 8 … 1 and COUNT reads 10 rungs. A two-at-a-time step visits only 10, 8, 6, 4, 2 — five rungs — an anchor of 20 doubles the ladder, and SUM would total the step numbers instead of counting them.",
  },
  {
    id: "cs-1082",
    tier: "easy",
    topic: "q7",
    universe: "inventory",
    title: "The count by twos",
    brief:
      "From: Ops analyst. Re: the cycle-count cadence.\n\nThe cycle-count clock counts down from 40 by twos — the bench checks a slot every second tick. Build the recursive countdown and count its ticks.",
    ask: "Count the ticks of a recursive countdown from 40 stepping down by 2.",
    template: `WITH RECURSIVE run(n) AS (SELECT {3} UNION ALL SELECT n {2} FROM run WHERE n > 1)
SELECT {1}(*) AS rungs FROM run;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tick counter",
        why: "The cadence report wants the tick count: COUNT(*) over the recursive output.",
      },
      {
        answer: "- 2",
        kind: "keyword",
        label: "the two-step down",
        why: "The clock ticks by twos. A one-step down would tick every integer and double the run count.",
      },
      {
        answer: "40",
        kind: "number",
        noVerify: true,
        label: "the anchor",
        why: "Forty is where the countdown starts. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["- 4", "- 1", "- 5"],
    walkthrough:
      "The anchor seeds 40; the arm emits n minus 2 while n > 1 — so the walk runs 40, 38, 38 … down to 0, twenty-one ticks in all, the floor bound doing the stopping. A four-step cadence ticks eleven times, a one-step cadence ticks forty times, and SUM would add the tick values instead of counting them.",
  },
  {
    id: "cs-1083",
    tier: "easy",
    topic: "q7",
    universe: "supplier",
    title: "The odd rungs",
    brief:
      "From: Procurement. Re: the tier ladder, odd tiers only.\n\nThe sourcing ladder walks odd tiers only: start at 1, step by 2, stop below 9. Build the recursive ladder and count its rungs — the bound stays literal, the step does the steering.",
    ask: "Count the rungs of a recursive odd-tier ladder from 1 to below 9.",
    template: `WITH RECURSIVE odd(n) AS (SELECT {3} UNION ALL SELECT n + {2} FROM odd WHERE n < 9)
SELECT {1}(*) AS odd_rows FROM odd;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the rung counter",
        why: "The ladder report wants its rung count: COUNT(*) over the recursive output.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the odd step",
        why: "Stepping by 2 from 1 keeps every rung odd. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the anchor",
        why: "One is where the ladder starts. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["3", "4", "+ 3"],
    walkthrough:
      "The anchor seeds 1; the arm emits n plus 2 while n < 9 — the ladder runs 1, 3, 5, 7, 9 and COUNT reads 5 rungs. A step of 3 would visit 1, 4, 7 and stop at three rungs, an anchor of 2 would walk the even rungs 2, 4, 6, 8 for four, and SUM would total the tier numbers instead of counting them.",
  },
  {
    id: "cs-1084",
    tier: "medium",
    topic: "q7",
    universe: "month-close",
    title: "The halving clock",
    brief:
      "From: Finance partner. Re: the depreciation ladder.\n\nThe model halves a value each period until the floor: start at 100, divide by 2, keep going while the value is at least 1. Build the recursive halving ladder and count its periods — integer division makes the tail land exactly.",
    ask: "Count the periods of a recursive halving ladder from 100.",
    template: `WITH RECURSIVE halves(n) AS (SELECT {1} UNION ALL SELECT n {2} FROM halves WHERE n >= 1)
SELECT {3}(*) AS steps FROM halves;`,
    slots: [
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the anchor",
        why: "One hundred is the model's starting value. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "/ 2",
        kind: "keyword",
        label: "the halving step",
        why: "Each period halves the value. A division by 4 would skip the middle of the decay and shorten the schedule.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the period counter",
        why: "The schedule reports its length: COUNT(*) over the recursive output.",
      },
    ],
    distractors: ["50", "/ 4", "- 2"],
    walkthrough:
      "The anchor seeds 100; the arm emits half of n while n >= 1, and integer division makes the tail clean: 100, 50, 25, 12, 6, 3, 1 — and one more 0, because 1 still satisfies the floor. Eight periods, COUNT says so. An anchor of 50 shortens the schedule to seven, a division by 4 lands in five, and SUM would total the decaying values instead of counting the periods.",
  },
  {
    id: "cs-1085",
    tier: "medium",
    topic: "q7",
    universe: "fraud",
    title: "Doubling past the bar",
    brief:
      "From: Fraud analyst. Re: the exposure-growth stress test.\n\nThe stress test grows an exposure from 3 by doubling, stopping below 200. Build the recursive doubling ladder and count how many values it visits — the bound is literal, the doubling does the work.",
    ask: "Count the values of a recursive doubling ladder from 3 below 200.",
    template: `WITH RECURSIVE p(n) AS (SELECT {1} UNION ALL SELECT n * {2} FROM p WHERE n < 200)
SELECT {3}(*) AS doublings FROM p;`,
    slots: [
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the anchor",
        why: "Three is the stress test's seed. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the doubling factor",
        why: "Doubling is the growth model. Tripling would grow faster and visit fewer values before the bar.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the visit counter",
        why: "The test reports how many values the ladder visits: COUNT(*) over the recursive output.",
      },
    ],
    distractors: ["5", "4", "SUM"],
    walkthrough:
      "The anchor seeds 3; the arm doubles while n < 200 — 3, 6, 12, 24, 48, 96, 192 — and one more doubling bursts past the bar to 384 before the bound stops the walk: eight values visited. An anchor of 5 visits six values, tripling visits five (3, 9, 27, 81, 243), and SUM would total the exposures instead of counting the visits.",
  },
  {
    id: "cs-1086",
    tier: "medium",
    topic: "q7",
    universe: "catalog",
    title: "The shelf walk",
    brief:
      "From: Inventory lead. Re: the slot audit ladder.\n\nThe slot audit walks ids 1 through 11 and reports which shelf rows actually exist: build the recursive number ladder, join it to the shelf, and count the hits. Every id below 12 finds a product.",
    ask: "Count the shelf rows hit by a recursive id ladder from 1 to below 12.",
    template: `WITH RECURSIVE nums(n) AS (SELECT 1 UNION ALL SELECT n {2} FROM nums WHERE n < 12)
SELECT {1}(*) AS shelf_rows
FROM nums
JOIN {3} ON products.id = nums.n;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the hit counter",
        why: "The audit counts the ids that matched a shelf row: COUNT(*) over the join.",
      },
      {
        answer: "+ 1",
        kind: "keyword",
        label: "the walk step",
        why: "The ladder walks one id at a time. A two-step walk skips every even id and audits only the odd slots.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the shelf table",
        why: "The audit walks the product shelf. Suppliers only reach id 6, so half the ladder would find nothing to join.",
      },
    ],
    distractors: ["+ 2", "+ 5", "* 2"],
    walkthrough:
      "The ladder emits 1 through 12 (the arm runs while n < 12, so 12 itself is emitted on the last step), the join keeps the ids that exist on the shelf, and COUNT reads 12 hits — every rung found a product. A two-step walk would audit 1, 3, 5 … 13 and land 7 hits, joining suppliers would cap the hits at the 6 supplier ids, and SUM would add the matched ids instead of counting rows.",
  },
  {
    id: "cs-1087",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "The ledger calendar",
    brief:
      "From: Finance partner. Re: the ledger's day count.\n\nThe audit needs every calendar day the billing ledger spans: build a recursive date ladder from the first invoice date to the last, one day per rung, and count the rungs. The arm's bound is a subquery — the ledger bounds itself.",
    ask: "Count the days a recursive ladder spans from first to last invoice date.",
    template: `WITH RECURSIVE d(day) AS (
  SELECT (SELECT MIN(issued_on) FROM invoices)
  UNION ALL SELECT date(day, {2}) FROM d WHERE day < (SELECT {3}(issued_on) FROM invoices)
)
SELECT {1}(*) AS ledger_days FROM d;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the day counter",
        why: "The audit counts the calendar days the ledger spans: COUNT(*) over the ladder.",
      },
      {
        answer: "'+1 day'",
        kind: "keyword",
        label: "the day tick",
        why: "The ladder ticks one day at a time. A weekly tick would land on every seventh day and shrink the count sevenfold.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ladder's ceiling",
        why: "The arm climbs toward the newest invoice date. MIN would set the ceiling at the first date — the anchor already sits there, so the ladder never climbs.",
      },
    ],
    distractors: ["'+7 day'", "SUM", "MIN"],
    walkthrough:
      "The anchor seeds the ladder with the ledger's first date (2024-02-05); the arm ticks one day forward while day is below the newest date (2025-02-19) — a self-bounding ladder that spans 381 days. A weekly tick lands 56 rungs, a MIN ceiling would never let the arm climb past the anchor and the ladder would stop at one rung, and SUM would add dates — nonsense where a day count belongs.",
  },
  {
    id: "cs-1088",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "The accumulator ladder",
    brief:
      "From: Growth lead. Re: the running-total generator.\n\nThe report generator needs a ladder that carries TWO columns: the step number and a running total that each step adds into. Seed the total at 1, add the step number at every arm, stop past step 10. The final total is the deliverable.",
    ask: "Show the final running total and row count of a two-column recursive accumulator.",
    template: `WITH RECURSIVE s(n, total) AS (SELECT 1, {1} UNION ALL SELECT n + 1, total {2} FROM s WHERE n {3} 10)
SELECT MAX(total) AS final_total, COUNT(*) AS rows_n FROM s;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the total's seed",
        why: "The running total starts at 1. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "+ n",
        kind: "keyword",
        label: "the carried step",
        why: "Each arm adds the CURRENT step number into the carried total — the two-column carry is the whole trick. Adding 1 would count steps, not accumulate them.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the stop rule",
        why: "The ladder runs while n is below 10. <= would emit an eleventh row and carry one more step into the total.",
      },
    ],
    distractors: ["10", "+ 2", "<="],
    walkthrough:
      "The anchor seeds (n=1, total=1); every arm emits the next step and adds the current n into the carried total — 1, 2, 4, 7, 11 … — stopping when n reaches 10. The final total reads 46 over 10 rows, and that lag (the arm adds the OLD n) is exactly what the walkthrough exists to teach. Seeding the total at 10 would finish at 55, carrying a flat +2 per step would finish at 19, and a <= bound would carry an eleventh step for 56.",
  },
  {
    id: "cs-1089",
    tier: "hard",
    topic: "q7",
    universe: "fraud",
    title: "Trading days, self-bounded",
    brief:
      "From: Fraud analyst. Re: the trading-calendar crosscheck.\n\nThe crosscheck walks the calendar from nine months before the newest order up to the newest order — a ladder whose ceiling is a subquery — and counts how many rungs land on real order dates. The ladder bounds itself; the calendar does the rest.",
    ask: "Count ladder days from minus-9-months that land on actual order dates.",
    template: `WITH RECURSIVE d(day) AS (
  SELECT date((SELECT MAX(created_at) FROM orders), {2})
  UNION ALL SELECT date(day, '+1 day') FROM d WHERE day < (SELECT MAX(created_at) FROM orders)
)
SELECT {1}(*) AS trading_days
FROM d
WHERE day IN (SELECT created_at FROM {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the hit counter",
        why: "The crosscheck counts ladder rungs that land on real order dates: COUNT(*) over the filtered ladder.",
      },
      {
        answer: "'-9 month'",
        kind: "keyword",
        label: "the window's depth",
        why: "Nine months back is the crosscheck's window. A future offset would anchor the ladder ahead of the data and never climb into an order date.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the date source",
        why: "The rungs are checked against actual order dates. Invoices carry no created_at column, so the match would crash.",
      },
    ],
    distractors: ["'+9 month'", "invoices", "SUM"],
    walkthrough:
      "The anchor starts nine months before the newest order (2025-02-27 minus 9 months); the arm ticks forward one day while it is still below that newest date — 273-odd rungs, each checked against the 84 real order dates. Fifty-three rungs land on trading days. A future offset would anchor past the ceiling and the ladder would stop at one empty rung, invoices would crash the date match, and SUM would add calendar days where a count belongs.",
  },
  {
    id: "cs-1090",
    tier: "hard",
    topic: "q7",
    universe: "expense",
    title: "The overshoot rung",
    brief:
      "From: Finance partner. Re: the triple-growth ladder.\n\nThe model triples a value while it stays below 100 — but the bound tests the CURRENT rung, so the ladder always overshoots once before stopping. Build it and read the final rung: the overshoot is the lesson.",
    ask: "Show the final rung of a recursive tripling ladder from 1 bounded below 100.",
    template: `WITH RECURSIVE p(n) AS (SELECT {1} UNION ALL SELECT n * 3 FROM p WHERE n {2} 100)
SELECT {3}(n) AS top FROM p;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the anchor",
        why: "One is the model's seed. It is a ladder constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the bound's edge",
        why: "The arm runs while n is strictly below 100. An equality bound would never fire on the seed and the ladder would stop at one rung.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the final rung reader",
        why: "The last rung is the ladder's largest value: MAX over the recursive output. MIN would read the seed — the first rung, not the last.",
      },
    ],
    distractors: ["2", "MIN", "="],
    walkthrough:
      "The anchor seeds 1; the arm triples while n < 100 — 1, 3, 9, 27, 81 — and because the bound tests the current rung, 81 passes and emits 243 before the ladder stops. MAX reads the overshoot: 243, a final rung far past the bar. An anchor of 2 would overshoot to 162, MIN would read the seed 1, and an equality bound would never let the arm run at all — the ladder would stop at its single seed rung.",
  },
  {
    id: "cs-1091",
    tier: "easy",
    topic: "q8",
    universe: "fraud",
    title: "The VIP census, capped",
    brief:
      "From: Fraud analyst. Re: the capstone census.\n\nThe capstone pulls the module together: a CTE stages the VIP list with a HAVING gate on summed order values, and the outer query counts it. Three tools, one figure — the census the whole module keeps circling.",
    ask: "Count customers whose summed order total exceeds 2177.08 via a CTE.",
    template: `WITH vip AS (SELECT customer_id FROM orders GROUP BY customer_id HAVING SUM({3}) {2} 2177.08)
SELECT {1}(*) AS vip_count FROM vip;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census counter",
        why: "The capstone reports the list's size: COUNT(*) over the staged VIP rows.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the rope's edge",
        why: "VIP means strictly above the 2177.08 house mean. < would stage the eleven smaller accounts as the census.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the gated column",
        why: "The HAVING gate sums order values. Summing status text would sum to zero and gate out the whole roster.",
      },
    ],
    distractors: ["SUM", "<", "status"],
    walkthrough:
      "The CTE groups orders per customer, HAVING gates the groups on summed totals above 2177.08, and COUNT reads the staged list: 5 VIPs — the same five names every bar in this module has measured against. A < gate would stage the eleven non-VIPs instead, SUM cannot count the stage's rows, and summing the status column would gate everyone out — text sums to zero.",
  },
  {
    id: "cs-1092",
    tier: "easy",
    topic: "q8",
    universe: "fraud",
    title: "The two-account region",
    brief:
      "From: Fraud analyst. Re: the US sample pull.\n\nThe US sample needs every order from the two US accounts. Membership over a staged region list, counted at the top — a two-tool capstone with one figure.",
    ask: "Count orders placed by customers in the US region.",
    template: `SELECT {1}(*) AS us_orders
FROM orders
WHERE customer_id {2} (SELECT id FROM customers WHERE {3} = 'US');`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the sample counter",
        why: "The sample is measured in orders: COUNT(*) over the membership matches.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the membership test",
        why: "Each order qualifies when its customer id sits in the US id list. NOT IN would count the other eighty-four orders.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the region column",
        why: "US is a region value. No city is named 'US', so filtering the city column would stage an empty list.",
      },
    ],
    distractors: ["SUM", "NOT IN", "city"],
    walkthrough:
      "The inner query stages the two US customer ids; the outer IN keeps their orders and COUNT reads 19 — the full US order book. SUM cannot count rows, NOT IN would keep the 84 orders from everywhere else, and filtering city for 'US' would match no city name and empty the sample.",
  },
  {
    id: "cs-1093",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "Everyone touched the bar",
    brief:
      "From: Growth lead. Re: the bar-reach attestation.\n\nThe attestation asks how many accounts have EVER placed an order above the storewide average — the reach of the bar across the roster. The answer will make the point better than any chart.",
    ask: "Count customers with at least one order above the storewide average.",
    template: `SELECT {1}(*) AS touched_bar
FROM customers
WHERE {3} IN (
  SELECT customer_id FROM orders
  WHERE total > (SELECT {2}(total) FROM orders)
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach counter",
        why: "The attestation is one number: COUNT(*) over the accounts that touched the bar.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The bar is the storewide average. MAX would set it at the 1088.44 ceiling, which no second order reaches.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the roster's match key",
        why: "The membership test matches account ids against the staged customer ids. Matching region text against ids would find nothing.",
      },
    ],
    distractors: ["SUM", "region", "MAX"],
    walkthrough:
      "The inner scalar sets the bar at about 338.19; the middle query stages the customer ids behind the 42 above-bar orders; the outer count reads 16 — every single account has touched the bar at least once. That is the attestation's point: the bar is a floor, not a filter. SUM cannot count rows, MAX would raise the bar to the one whale order and stage a single id, and matching region against ids would empty the roster.",
  },
  {
    id: "cs-1094",
    tier: "easy",
    topic: "q8",
    universe: "catalog",
    title: "The premium cut, staged",
    brief:
      "From: Merchandising analyst. Re: the premium cut, staged.\n\nThe premium cut stages everything above the catalog average first, then the planogram reads the stage. Build the CTE with the bar inside it and count what the stage holds.",
    ask: "Count products above the catalog average price via a staged CTE.",
    template: `WITH shelf AS (SELECT * FROM products WHERE price {3} (SELECT AVG(price) FROM {2}))
SELECT {1}(*) AS premium FROM shelf;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the stage counter",
        why: "The planogram wants the stage's depth: COUNT(*) over the staged premium rows.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the bar's source table",
        why: "The catalog average comes from products. Suppliers carry ratings, not prices, so the scalar would crash.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the premium edge",
        why: "Premium means strictly above the bar. < would stage the ten value products instead.",
      },
    ],
    distractors: ["SUM", "suppliers", "<"],
    walkthrough:
      "The CTE stages the products above the catalog average of about 71.78, and COUNT reads 6 off the stage — the premium shelf's depth. SUM cannot count the stage's rows, staging suppliers would crash the scalar on the missing price column, and < would stage the ten-product value shelf instead.",
  },
  {
    id: "cs-1095",
    tier: "medium",
    topic: "q8",
    universe: "fraud",
    title: "The three-thousand shortlist",
    brief:
      "From: Fraud analyst. Re: the review scope, staged.\n\nThe review scopes to accounts whose staged lifetime spend clears 3000. Stage the spends, probe them with EXISTS per account, and print the shortlist alphabetically — the stage does the measuring, the probe does the gating.",
    ask: "List customers whose staged lifetime spend exceeds 3000, alphabetically.",
    template: `WITH s AS (SELECT customer_id, SUM(total) AS spend FROM {3} GROUP BY customer_id)
SELECT c.name
FROM customers c
WHERE EXISTS (SELECT 1 FROM s WHERE s.customer_id = c.id AND s.spend {2} {1})
ORDER BY c.name;`,
    slots: [
      {
        answer: "3000",
        kind: "number",
        noVerify: true,
        label: "the review bar",
        why: "3000 is the stakeholder-set review bar. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the scope edge",
        why: "The review takes strictly-above-bar accounts. < would list the twelve below the bar instead.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the stage's source",
        why: "Lifetime spend accrues on orders. Payments have no customer_id, so the stage could not build.",
      },
    ],
    distractors: ["5000", "<", "payments"],
    walkthrough:
      "The CTE stages 16 lifetime spends; the EXISTS probe keeps accounts whose staged spend clears 3000: Alice Chen, Emma Wilson, Grace Kim and Maya Patel — four names for the review. A 5000 bar would trim the list to two, < would list the twelve below-bar accounts, and payments would break the stage at its source.",
  },
  {
    id: "cs-1096",
    tier: "medium",
    topic: "q8",
    universe: "month-close",
    title: "The billing podium, stamped",
    brief:
      "From: Controller. Re: the annex podium.\n\nThe annex prints the three heaviest billing relationships in dollars, staged once and converted on the way out. The stage sums cents per customer; the podium reads the top three.",
    ask: "Show the 3 highest per-customer invoiced totals in dollars.",
    template: `WITH billed AS (SELECT customer_id, SUM(amount_cents) AS cents FROM {3} GROUP BY customer_id)
SELECT c.name, ROUND(billed.cents {2}, 2) AS billed_usd
FROM billed
JOIN customers c ON c.id = billed.customer_id
WHERE billed.cents {4} {1}
ORDER BY billed_usd DESC
LIMIT 3;`,
    slots: [
      {
        answer: "1000000",
        kind: "number",
        noVerify: true,
        label: "the annex's cents gate",
        why: "One million cents — ten thousand dollars — is the annex's entry gate. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "/ 100.0",
        kind: "keyword",
        label: "the cents-to-dollars step",
        why: "The stage stores cents; dividing by 100.0 prints dollars. Multiplying would print 2662900.00 where 26629.00 belongs.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the stage's source",
        why: "Billing documents live on invoices. The stage must sum their cents; orders would measure a different ledger.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the gate's edge",
        why: "The annex admits strictly above the gate. < would admit the light majority the gate excludes.",
      },
    ],
    distractors: ["* 100.0", "20000000", "<"],
    walkthrough:
      "The stage sums each relationship's invoices in cents; the million-cent gate, the conversion and the fixed LIMIT 3 shape the podium: Alice Chen 26629.00, Emma Wilson 13384.00, Maya Patel 11542.00. Multiplying cents would print seven-figure nonsense, a twenty-million-cent gate would annex nobody, and < would list the light majority the gate was built to exclude.",
  },
  {
    id: "cs-1097",
    tier: "hard",
    topic: "q8",
    universe: "growth",
    title: "Above the staged mean",
    brief:
      "From: Growth lead. Re: the VIP roll, self-referenced.\n\nThe roll prints every account whose staged lifetime spend beats the stage's OWN average — the mean of means computed inside the same CTE. One stage, referenced twice: once for the bar, once for the rows.",
    ask: "List customers whose staged spend beats the stage's own average, with their spend.",
    template: `WITH s AS (SELECT customer_id, SUM(total) AS spend FROM {2} GROUP BY customer_id)
SELECT c.name, s.spend
FROM s
JOIN customers c ON c.id = s.customer_id
WHERE s.spend {3} (SELECT {1}(spend) FROM s)
ORDER BY s.spend DESC;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean of the stage",
        why: "The bar is the average of the staged spends — the mean of means. MAX would set the bar at the league's own peak, which nothing exceeds.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the stage's source",
        why: "Lifetime spend accrues on orders. Payments have no customer_id, so the stage could not build.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the above-mean edge",
        why: "The roll keeps strictly-above-bar accounts. < would print the eleven below the house mean.",
      },
    ],
    distractors: ["MAX", "<", "payments"],
    walkthrough:
      "The CTE stages 16 lifetime spends; the scalar reads the stage's own mean — 2177.08 — and the comparison keeps the five accounts above it: Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56, Chloe 2667.93. MAX as the bar would demand someone above Alice and return nobody, < would print the eleven smaller accounts, and payments would break the stage before the bar existed.",
  },
  {
    id: "cs-1098",
    tier: "hard",
    topic: "q8",
    universe: "fraud",
    title: "Crowned past 800",
    brief:
      "From: Fraud analyst. Re: the peak-review scope, capped.\n\nThe scope: accounts whose single biggest order clears 800. Stage the crowns in a CTE, match them by row-value, then cap the crowns with the review bar. One crown per account, four past the cap.",
    ask: "Count customers whose staged biggest order exceeds 800.",
    template: `WITH crowns AS (SELECT customer_id, {3}(total) AS mt FROM orders GROUP BY customer_id)
SELECT COUNT(*) AS peak_club
FROM orders o
WHERE (o.customer_id, o.total) IN (SELECT customer_id, mt FROM crowns)
  AND o.total {1} {2};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the cap's edge",
        why: "The review takes crowns strictly above 800. < would count the twelve crowns below it.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the review cap",
        why: "800 is the stakeholder-set cap. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the crown maker",
        why: "The stage keeps each account's biggest ticket. AVG would stage typical tickets — and no solo ticket beats 800 by being typical.",
      },
    ],
    distractors: ["<", "1000", "AVG"],
    walkthrough:
      "The CTE stages one crown per account; the row-value match keeps those 16 real orders; the cap keeps the four above 800 — Farid 1088.44, Chloe 945.21, Emma 845.92, Grace 826.03. A 1000 cap would leave Farid alone, < would count the twelve below-bar crowns, and staging averages would match only the two solo accounts, whose tickets fall short of the cap — an empty club.",
  },
  {
    id: "cs-1099",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The light majority, verified twice",
    brief:
      "From: Finance partner. Re: the below-average attestation, double-checked.\n\nThe attestation counts expenses below the ledger average — but the partner wants it verified from both sides: stage the heavy rows in a CTE, then keep the rows that are neither staged as heavy NOR above the bar. Two tools, one honest 21.",
    ask: "Count expenses below the ledger average, excluding the staged heavy rows.",
    template: `WITH heavy AS (SELECT id FROM {2} WHERE amount_cents {1} (SELECT {3}(amount_cents) FROM expenses))
SELECT COUNT(*) AS light_majority
FROM expenses
WHERE id NOT IN (SELECT id FROM heavy);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the heavy edge",
        why: "Heavy means strictly above the ledger-wide average of about 706. < would stage the light majority as the blacklist.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the stage's source",
        why: "Heavy rows are expense rows, staged from the same ledger the outer query walks. Any other table would either crash or drag outside columns into the stage.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the heavy bar",
        why: "The stage's bar is the ledger-wide average. MAX would stage nothing — no amount beats the maximum — and the complement would count the whole ledger.",
      },
    ],
    distractors: ["suppliers", "customer_id", "MAX"],
    walkthrough:
      "The CTE stages the 15 heavy rows — amounts above the ledger-wide average of about 706 — and the complement counts everything not staged: 21 light expenses, the honest majority. Staging suppliers would drag the outer ledger's amount column into the stage through SQLite's outward column resolution and skew the complement, a customer_id stage would crash on the missing table, and MAX as the bar would stage nobody and count all 36.",
  },
  {
    id: "cs-1100",
    tier: "hard",
    topic: "q8",
    universe: "funnel",
    title: "The whale who tops the pot",
    brief:
      "From: Growth lead. Re: the capstone finish.\n\nThe finish: stage the mid-league (spend above 1000), then keep the member who placed THE biggest order in the store. Two tools chained — a staged cohort and a scalar-found whale — and one name comes out.",
    ask: "List members of the above-1000 cohort who placed the store's biggest order.",
    template: `WITH s AS (SELECT customer_id, SUM(total) AS spend FROM orders GROUP BY customer_id)
SELECT c.name
FROM (SELECT customer_id, spend FROM s WHERE spend > {3}) AS whales
JOIN customers c ON c.id = whales.customer_id
WHERE c.id {2} (SELECT customer_id FROM orders WHERE total {1})
ORDER BY c.name;`,
    slots: [
      {
        answer: "= (SELECT MAX(total) FROM orders)",
        kind: "keyword",
        label: "the whale test",
        why: "The biggest order in the store is the one equal to its own MAX. > would demand an order above the maximum — which cannot exist.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the membership handoff",
        why: "The cohort member must appear in the whale's id list. NOT IN would keep the cohort members who did NOT place it.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the cohort's bar",
        why: "1000 is the cohort's entry bar. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["> (SELECT MAX(total) FROM orders)", "NOT IN", "2000"],
    walkthrough:
      "The CTE stages lifetime spends; the whale test stages the customer id behind order 74 — Farid Nasser's 1088.44, the store's biggest ticket; the cohort bar at 1000 keeps Farid in the mid-league, and the join prints exactly one name: Farid Nasser. Demanding an order above the maximum would empty the whale list, NOT IN would print the seven other cohort members, and a 2000 bar would exclude Farid's 1458.97 from his own cohort — the whale locked out of the club he tops.",
  },
];
