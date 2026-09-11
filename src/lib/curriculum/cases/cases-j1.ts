// Case batch J1 — Module 2 (joins) cases cs-301…cs-350.
// 50 cases: 17 easy / 17 medium / 16 hard across topics j1 (two tables),
// j2 (INNER JOIN), j3 (3-table chains), j4 (LEFT JOIN), j5 (anti-join),
// j6 (self-join), j7 (joins + aggregates). Every figure below was probed
// against the live seed db (scripts/m2-case-facts.ts + scripts/m2-j1-probes.ts)
// and is mechanically re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesJ1: CaseStudy[] = [
  {
    id: "cs-301",
    tier: "easy",
    topic: "j1",
    universe: "month-close",
    title: "Pending money needs a name",
    brief:
      "From: Financial Controller. Re: month-end receivables review.\n\nBefore I can sign the close I need to know how many orders are still sitting in pending — and I want them tied to real accounts, not naked order rows. One number for the file: how many pending orders does the book hold right now?",
    ask: "Count the pending orders, joined to their customers so every row has a named buyer behind it.",
    template: `SELECT {1}(*) AS pending_orders
FROM orders o
{2} customers c ON c.id = o.{3}
WHERE o.status = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount of pending orders, so COUNT(*) is the tool. SUM would try to add up the '*' placeholder and fail outright.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The buyer's name lives in customers, not orders — JOIN reunites the two tables so the count runs over rows that carry an account.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the foreign key column",
        why: "orders.customer_id points at customers.id — that thread is the join key. Joining on o.id would pair order 7 with customer 7, a coincidence, not a relationship.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status literal",
        why: "The gate targets pending orders, and status is text: SQL needs the quotes. A bare pending would be read as a column name and blow up.",
      },
    ],
    distractors: ["SUM", "UNION", "id", "'shipped'"],
    walkthrough:
      "The ask is a queue size, so COUNT(*) — and because the brief insists every row carry a buyer, the count runs over the joined rows, not bare orders. The join key is the foreign key thread orders.customer_id = customers.id; joining on the coincidence o.id = c.id would silently count a different (nonsense) population. The status filter is a text literal, so 'pending' wears quotes. Run it and the answer is 14 pending orders, worth 6,113.00 in total — spread across 8 customers, so no single account dominates the queue.",
  },
  {
    id: "cs-302",
    tier: "easy",
    topic: "j1",
    universe: "growth",
    title: "Where the orders live",
    brief:
      "From: Head of Growth. Re: board deck, slide 3.\n\nI want a simple geography story for the board: which cities actually generate our order volume? Not revenue yet — just raw order counts per city, biggest first, top three only. Keep it clean: one row per city with its order count.",
    ask: "The top 3 cities by number of orders, biggest first.",
    template: `SELECT c.city, {1}(*) AS orders
FROM customers c
{2} orders o ON {3}
GROUP BY c.city
ORDER BY orders {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "Order volume per city is a row count, so COUNT(*). SUM would try to add the '*' text and error out.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "City lives on customers, orders live in orders — JOIN reunites them per row so each order carries its city.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The foreign key is orders.customer_id pointing at customers.id. Any other pairing (like o.id = c.id) matches order numbers against customer numbers — meaningless coincidence rows.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest first' means descending: DESC. ASC would hand the board the three quietest cities.",
      },
    ],
    distractors: ["SUM", "UNION", "c.id = o.id", "ASC"],
    walkthrough:
      "Each order must inherit its city, so join orders to customers on the foreign key, bucket by city, count, sort descending, and trim to three. The join condition is the whole lesson: o.customer_id = c.id follows the real relationship, while c.id = o.id would match order 7 to customer 7 and fabricate a geography. Run it and the podium is Berlin 24, Austin 17, Seoul 14 — Berlin's lead is really one customer (Alice Chen) ordering 24 times. Sixteen cities hold all sixteen customers, one each, so city rankings here are customer rankings in disguise.",
  },
  {
    id: "cs-303",
    tier: "easy",
    topic: "j1",
    universe: "supplier",
    title: "Whose headset are we selling?",
    brief:
      "From: Procurement lead. Re: restock question.\n\nThe Noise-Canceling Headset keeps selling out and I want to know who actually makes the thing before I negotiate the next batch. Pull the product together with its supplier — and double-check by price too, so we're certain we're looking at the 149.99 unit and not some other gadget.",
    ask: "The headset's name, price and supplier name — matched by name AND the 149.99 price.",
    template: `SELECT p.name, p.price, s.name AS supplier
FROM products p
JOIN suppliers s ON {1}
WHERE p.name = {2} AND p.price = {3};`,
    slots: [
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id is the foreign key into suppliers.id. Matching p.id to s.id would pair product 4 with supplier 4 by coincidence, not by the real relationship.",
      },
      {
        answer: "'Noise-Canceling Headset'",
        kind: "keyword",
        label: "the product name literal",
        why: "The brief names the product, and names are text: quotes required. The bare words would be parsed as identifiers and the query dies.",
      },
      {
        answer: "149.99",
        kind: "number",
        label: "the price pin",
        why: "Pinning the price to 149.99 makes the match unambiguous — the result cell shows the price right next to the name, so both filters verify at a glance.",
      },
    ],
    distractors: ["s.region = p.category", "'4K Webcam Pro'", "129"],
    walkthrough:
      "This is the first-join pattern in miniature: one fact (the product) plus one lookup (its supplier), stitched on products.supplier_id = suppliers.id. The two WHERE pins — name and price — make the target unambiguous, and both appear in the returned row so you can eyeball-verify. Run it and you get exactly one row: Noise-Canceling Headset, 149.99, Midwest Hardware Co. A tempting wrong turn is joining on matching id numbers; here product id 4 and supplier id 4 both exist, so that accident would still return a row — just a relationship that means nothing.",
  },
  {
    id: "cs-304",
    tier: "easy",
    topic: "j1",
    universe: "funnel",
    title: "Region scoreboard",
    brief:
      "From: Marketing lead. Re: regional funnel review.\n\nI need the crudest possible split to open the funnel meeting: how many orders does each customer region place? Four rows maximum — one per region — ordered so the biggest book sits on top. This is the anchor chart everything else hangs off.",
    ask: "Order count per customer region, biggest region first.",
    template: `SELECT c.region, {1}(*) AS orders
FROM customers c
{2} orders o ON o.customer_id = c.id
GROUP BY {3}
ORDER BY orders {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The scoreboard tracks order volume, so COUNT(*) per group. SUM(*) is not valid SQL and errors immediately.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Region is a customer attribute; the rows being counted are orders. JOIN attaches the region to every order row before grouping.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the group key",
        why: "The buckets are customer regions — GROUP BY c.region. There is no o.region column on orders; referencing one is an immediate 'no such column' error.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest book on top means descending order. ASC would open the meeting with LATAM's two orders instead of EU's forty-five.",
      },
    ],
    distractors: ["SUM", "UNION", "o.region", "ASC"],
    walkthrough:
      "One region label per order, four buckets, count, sort down. The join rides the foreign key o.customer_id = c.id (already written for you), and the group key must be the customer-side region — orders has no region column at all, which is exactly why the join exists. Run it and the board reads EU 45, APAC 37, US 19, LATAM 2. The spread is the story: EU and APAC together carry 82 of the 103 orders, while LATAM is a two-order afterthought — Bruno Silva's account alone.",
  },
  {
    id: "cs-305",
    tier: "medium",
    topic: "j1",
    universe: "refund-audit",
    title: "The one cancellation worth chasing",
    brief:
      "From: refunds@ internal ticket #4412.\n\nQuarter-end goodwill review. We manually assess cancelled orders big enough to hurt — anything over 300 in value. I don't need the full cancellation log, just the painful one: which order, which customer, how much. Attach the customer name so the outreach email has a recipient.",
    ask: "Cancelled orders with total over 300 — order id, customer name and total, biggest first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1}
WHERE o.status = {2} AND o.total > {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The customer for an order is found through orders.customer_id — that's the real thread. o.id = c.id would match order numbers against customer numbers and return nothing useful here.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "Cancellations live under the status value 'cancelled' — text, so it wears quotes. 'pending' would silently swap the audit to a different queue.",
      },
      {
        answer: "300",
        kind: "number",
        label: "the value threshold",
        why: "The ticket says 'over 300', so total > 300 — strictly greater. An order worth exactly 300.00 would not qualify, and none does.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The painful one should sit on top: biggest total first is DESC. ASC would bury it under the small fry.",
      },
    ],
    distractors: ["o.id = c.id", "'pending'", "100", "400"],
    walkthrough:
      "Three gates stack before the sort: the join (real foreign key, not the id coincidence), the status literal 'cancelled' in quotes, and the money bar total > 300. Loosen the bar to 100 and a second cancellation (206.19) sneaks in — which is why the threshold is pinned in the ticket. Run it and exactly one row comes back: order 83, Maya Patel, 397.99 — the single largest cancellation on file, and the only one that clears the goodwill bar. One outreach email, not a temp staffing plan.",
  },
  {
    id: "cs-306",
    tier: "medium",
    topic: "j1",
    universe: "fraud",
    title: "Money in limbo, name by name",
    brief:
      "From: Fraud spot-check desk. Re: open exposure.\n\nPending orders are the window where money is committed but nothing has shipped — our favorite window for a spot-check. Give me the five biggest pending orders with the buyer's name attached, largest total first, so I can start at the top of the exposure stack.",
    ask: "The 5 largest pending orders — order id, buyer name, total — biggest first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
{1} customers c ON o.customer_id = c.id
WHERE o.status = {2}
ORDER BY {3} {4}
{5} 5;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Buyer names live in customers; the fraud desk wants names on every row, so the order rows must be joined to their accounts.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status literal",
        why: "The exposure window is pending orders — text literal, quotes required. 'shipped' would quietly audit a completely different 30-order population.",
      },
      {
        answer: "o.total",
        kind: "keyword",
        label: "the sort column",
        why: "'Biggest exposure first' sorts by the order total. Sorting by c.total is a typo that errors — customers have no total column.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Largest first is descending. ASC would start the spot-check at the smallest pending order and waste the desk's time.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap keyword",
        why: "'Give me five' is LIMIT 5 — the trim keyword. HAVING belongs after GROUP BY and is a syntax error here.",
        noVerify: true,
      },
    ],
    distractors: ["UNION", "'shipped'", "c.total", "HAVING", "c.name"],
    walkthrough:
      "The fraud desk's ask decomposes cleanly: join buyers onto their orders, keep only 'pending' rows, sort by total descending, cap at five. Every keyword slot fails loudly if swapped — UNION can't appear mid-FROM, HAVING has no GROUP BY to lean on, and c.total doesn't exist. Run it and the top of the exposure stack is five named rows out of 14 pending orders worth 6,113.00 overall; the desk works down from the biggest total. The remaining nine stay one LIMIT tweak away whenever the desk escalates.",
  },
  {
    id: "cs-307",
    tier: "medium",
    topic: "j1",
    universe: "inventory",
    title: "Stock backed by a rated supplier",
    brief:
      "From: Inventory control. Re: count week prep.\n\nBefore we physically count, I want the shelf list narrowed to products whose supplier we actually rate — 4.4 or better. Give me the product name, its stock, and the supplier's rating, heaviest stock on top, five rows. That's where miscounts hurt most.",
    ask: "5 products from suppliers rated 4.4+, showing stock and rating, heaviest stock first.",
    template: `SELECT p.name, p.stock, s.rating
FROM products p
JOIN suppliers s ON s.id = {1}
WHERE s.rating >= {2}
ORDER BY {3} {4}
LIMIT {5};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the join key column",
        why: "The supplier for a product is products.supplier_id. p.id would compare the product's own id to suppliers.id — a coincidence match, not the relationship.",
      },
      {
        answer: "4.4",
        kind: "number",
        label: "the rating floor",
        why: "'4.4 or better' is rating >= 4.4 — inclusive. Dropping to 4.0 would let Andes Naturals (4.0) sneak in.",
        noVerify: true,
      },
      {
        answer: "p.stock",
        kind: "keyword",
        label: "the sort column",
        why: "'Heaviest stock on top' sorts by the stock count. Sorting by s.rating would reshuffle by supplier score instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest first is descending; ASC would lead with the 40-unit Smart Watch and misdirect the count crew.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the row cap",
        why: "The brief asks for five rows: LIMIT 5. A cap of 3 would truncate the list before the Webcam appears.",
        noVerify: true,
      },
    ],
    distractors: ["p.id", "4.9", "s.rating", "ASC", "3"],
    walkthrough:
      "Two tables, one gate: join products to suppliers on the real foreign key, keep suppliers rated 4.4 and up, sort by stock descending, trim to five. The rating floor is doing heavy lifting — the catalog's biggest stock piles (500 HDMI cables, 400 sock packs, 300 mice) all belong to suppliers rated below 4.4 and vanish. What survives: Desk Mat Extended 260, Yoga Mat Eco 220, Laptop Stand 180, Mechanical Keyboard K1 120, 4K Webcam Pro 70 — eight products qualify in total, all from Alpine Audio (4.8), Nordic Gadgets (4.6) and Midwest Hardware (4.4).",
  },
  {
    id: "cs-308",
    tier: "medium",
    topic: "j1",
    universe: "pricing",
    title: "Regions that clear the revenue bar",
    brief:
      "From: Pricing committee. Re: regional price test shortlist.\n\nWe pilot the new price book where the revenue actually is. Rank the customer regions by joined order revenue, and keep only regions with at least 10 orders — a pilot region needs volume, not just a fat average. Biggest revenue on top.",
    ask: "Regions ranked by total order revenue, keeping only those with 10+ orders.",
    template: `SELECT c.region, ROUND({1}(o.total), 2) AS revenue, COUNT(*) AS orders
FROM customers c
JOIN orders o ON {2}
GROUP BY c.region
{3} COUNT(*) >= {4}
ORDER BY revenue {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Revenue is money summed across orders: SUM(o.total). COUNT would report row counts where a currency belongs.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "Revenue must ride the real relationship — orders.customer_id to customers.id. o.id = c.id would sum the totals of a random id-coincidence population.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "The 10-order bar filters AGGREGATES, so it belongs in HAVING after GROUP BY. WHERE runs before grouping and errors on COUNT(*).",
      },
      {
        answer: "10",
        kind: "number",
        label: "the volume bar",
        why: "The committee's bar is 10 orders. At 1, LATAM's two orders would sneak back into the pilot list.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Where the revenue actually is' means biggest first: DESC. ASC would pilot the price book in the smallest market.",
      },
    ],
    distractors: ["COUNT", "o.id = c.id", "WHERE", "1", "ASC"],
    walkthrough:
      "Join orders to customers, sum totals per region, then filter the GROUPS with HAVING — that's the clause boundary this case teaches: WHERE filters rows before grouping (and chokes on COUNT), HAVING filters after. Run it and three regions clear both bars: EU 15,089.23 over 45 orders, APAC 11,605.45 over 37, US 7,286.16 over 19. LATAM drops — two orders, 852.44 — exactly the volume-the-committee-feared outcome. The HAVING bar and the revenue sort are independent axes; loosening the bar to 1 brings LATAM back without touching the ranking.",
  },
  {
    id: "cs-309",
    tier: "hard",
    topic: "j1",
    universe: "month-close",
    title: "Next quarter's planning prices",
    brief:
      "From: Financial Controller. Re: planning grid for the board pre-read.\n\nFinance plans next quarter at an 8% uplift on realized revenue. I need that planning view by region — but only regions that are material, say 5,000 or more in realized revenue. Show the inflated planning figure per region, biggest first, and keep the immaterial regions out of the grid entirely.",
    ask: "Per region: realized revenue scaled by 1.08, keeping only regions with at least 5,000 realized, biggest planned figure first.",
    template: `SELECT c.region, ROUND(SUM(o.total) * {1}, 2) AS planned_q
FROM orders o
JOIN customers c ON {2}
GROUP BY c.region
{3} SUM(o.total) >= {4}
ORDER BY planned_q {5};`,
    slots: [
      {
        answer: "1.08",
        kind: "number",
        label: "the uplift multiplier",
        why: "An 8% uplift means 108% of the base — multiply by 1.08. 0.08 would produce the 8% slice alone, not the planned total.",
        noVerify: true,
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "Region arrives through the foreign key. Joining on o.id = c.id would plan next quarter on a fabricated population of sixteen orders.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "The 5,000 bar applies to SUM(o.total), an aggregate — that's HAVING territory. WHERE can't see aggregates and errors.",
      },
      {
        answer: "5000",
        kind: "number",
        label: "the materiality bar",
        why: "The grid keeps regions from 5,000 realized upward. At 500 even LATAM's 852.44 would sneak into a board grid.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The pre-read opens with the biggest planning number: DESC. ASC would lead with the region that just got filtered logic right.",
      },
    ],
    distractors: ["0.08", "o.id = c.id", "WHERE", "500", "ASC"],
    walkthrough:
      "The trap density is the point: a multiplier (1.08, not 0.08), a real join key, and an aggregate filter that must be HAVING. Run it and three regions make the grid: EU plans at 16,296.37 (from 15,089.23), APAC at 12,533.89 (from 11,605.45), US at 7,869.05 (from 7,286.16). LATAM's 852.44 misses the 5,000 materiality bar and stays off the board page. Note what the HAVING compares: the RAW realized sum, not the inflated figure — gating on planned_q would work numerically here but reads as an accident; gating on the realized number is the defensible habit.",
  },
  {
    id: "cs-310",
    tier: "hard",
    topic: "j1",
    universe: "expense",
    title: "Capital parked on shelves, by supplier",
    brief:
      "From: Spend analyst. Re: working-capital memo.\n\nEvery unit on a shelf is cash we spent. I want the exposure ranked by supplier: how many of their products we carry and the total shelf value — price times stock, summed, rounded to cents. Only suppliers carrying at least two products matter for the memo; single-product suppliers can't move the number.",
    ask: "Per supplier (2+ products): product count and total shelf value (price × stock), biggest value first.",
    template: `SELECT s.name, s.region, {1}(p.id) AS products, ROUND(SUM(p.price * p.stock), 2) AS stock_value
FROM suppliers s
{2} products p ON {3}
GROUP BY s.id
{4} COUNT(p.id) >= {5}
ORDER BY stock_value {6};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the product counter",
        why: "Products carried is a row count: COUNT(p.id). SUM(p.id) would add up id numbers — 1+7+13 — and produce a meaningless total.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Shelf value lives per product; the memo needs it grouped under supplier names, so products must join to suppliers.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id points at suppliers.id — the real thread. p.supplier_id = s.region compares a number to text like 'EU' and matches nothing.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "The two-product floor filters a COUNT, so HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the product floor",
        why: "'At least two products' is COUNT >= 2 — inclusive. At 3, Alpine and Andes (two products each) would drop.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The memo opens with the biggest parked capital: DESC on stock_value.",
      },
    ],
    distractors: ["SUM", "UNION", "p.supplier_id = s.region", "WHERE", "3", "ASC"],
    walkthrough:
      "The join fans products under their suppliers; two aggregates ride on top — COUNT for breadth, SUM(price × stock) for the cash view — and HAVING enforces the two-product floor on the count, not the value. Run it and six suppliers qualify (3/3/3/3/2/2 products), led by Nordic Gadgets AB at 27,828.40 parked (keyboard, webcam, smart watch) with Shenzhen Electro next at 23,748.50. Alpine Audio GmbH sits at the bottom of the qualifying list, 11,852.40 — fewest products among the majors. The DESC keeps the memo's eye on the top of the cash pile.",
  },
  {
    id: "cs-311",
    tier: "easy",
    topic: "j2",
    universe: "catalog",
    title: "Catalog snapshot with the maker",
    brief:
      "From: Catalog ops. Re: print proof for the warehouse binder.\n\nThe binder needs one clean page: every product with its category and the supplier's home region — in product id order so the page matches the shelf walk. Sixteen rows, nothing filtered, nothing fancy.",
    ask: "All 16 products with name, category and supplier region, in product id order.",
    template: `SELECT p.name, p.category, s.region
FROM products p
{1} suppliers s ON {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The supplier's region lives in suppliers, so each product row must be joined to its maker. UNION cannot appear in FROM — it stacks result sets instead.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "products.supplier_id is the foreign key into suppliers.id — the only relationship that puts the right region on the right product.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the sort key",
        why: "Shelf-walk order is product id order: ORDER BY p.id. Sorting by price would scramble the page against the physical aisle.",
      },
    ],
    distractors: ["UNION", "s.id = p.id", "p.price"],
    walkthrough:
      "A pure inner join over the whole catalog: every product has exactly one supplier, so nothing is lost or duplicated — sixteen rows in, sixteen rows out. The join key is s.id = p.supplier_id; the id-coincidence variant (s.id = p.id) would return only the six products whose id happens to equal some supplier's id, silently amputating the binder page. Ordered by p.id, the page leads with Mechanical Keyboard K1 (Nordic Gadgets, EU) and ends at Yoga Mat Eco 6mm (Midwest Hardware, US) — proof the binder matches the shelf.",
  },
  {
    id: "cs-312",
    tier: "easy",
    topic: "j2",
    universe: "growth",
    title: "Units out the door",
    brief:
      "From: Head of Growth. Re: fulfillment volume slide.\n\nOne number for the deck: total units across every order line we've ever taken. Not revenue — physical units, quantity summed over the joined line items. This is the volume story the revenue chart gets compared against.",
    ask: "Total units sold — the sum of quantity over all joined order lines.",
    template: `SELECT SUM(oi.{1}) AS units
FROM orders o
{2} order_items oi ON {3};`,
    slots: [
      {
        answer: "quantity",
        kind: "keyword",
        label: "the units column",
        why: "Units live in order_items.quantity. unit_price would sum to the line-price total — money, not units — and 'id' would add up row numbers.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Lines live in order_items; orders provides the parent context. The join makes the line rows addressable through their order.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id points at orders.id — the real grain link. Matching oi.id to o.id pairs line numbers with order numbers and yields a coincidence population.",
      },
    ],
    distractors: ["unit_price", "id", "UNION", "oi.id = o.id"],
    walkthrough:
      "The whole case rides one discipline: sum the right column over the right join. quantity is units; unit_price is money wearing a unit costume; id is bookkeeping. The join key oi.order_id = o.id is the actual parent-child link — the oi.id = o.id variant silently keeps only the 103 lines whose id equals some order's id, and the sum lands somewhere meaningless. Run it: 498 units across 251 lines on 103 orders — roughly 4.8 units per order, the volume baseline for the deck.",
  },
  {
    id: "cs-313",
    tier: "easy",
    topic: "j2",
    universe: "expense",
    title: "Cash actually collected",
    brief:
      "From: Treasury. Re: cash reconciliation.\n\nForget invoiced amounts — I want the cash that actually landed. Sum every payment amount (in whole currency units) across the payments that are properly joined to their invoices. This is the reconciliation anchor: everything else we claim about cash has to tie to it.",
    ask: "Total cash collected — sum of payment amounts over invoice-joined payments, divided to whole units.",
    template: `SELECT {1}(p.amount_cents) / 100.0 AS collected
FROM invoices i
{2} payments p ON {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the cash aggregate",
        why: "Collected cash is money summed: SUM(p.amount_cents). COUNT would return the number of payments — 27 — where a currency belongs.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Payments reference invoices by foreign key; the join is what makes 'payment against a real invoice' the unit being summed.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id points at invoices.id — the ledger thread. Matching i.number (text) to the numeric id matches nothing.",
      },
    ],
    distractors: ["COUNT", "UNION", "p.invoice_id = i.number"],
    walkthrough:
      "Every payment carries amount_cents and an invoice_id — the join turns that id into a real invoice so the sum is 'cash against recognized invoices', not a stray total. Dividing by 100.0 converts cents to display units; the .0 matters because integer division would floor the pennies away. Run it and collected cash is 69,612.00 over 27 payments — which reconciles exactly with the regional cash split (EU 37,261 + APAC 20,613 + US 11,738). Any cash claim that doesn't tie to this number is a rounding story.",
  },
  {
    id: "cs-314",
    tier: "medium",
    topic: "j2",
    universe: "pricing",
    title: "Catalog value by supplier region",
    brief:
      "From: Pricing committee. Re: regional sourcing review.\n\nBefore we touch list prices we want to know where catalog value concentrates — sum of list price per supplier region, with a product count next to it so nobody mistakes a big total for a big catalog. Rank the regions by that value, richest first.",
    ask: "Per supplier region: total catalog price and product count, ranked by value descending.",
    template: `SELECT s.region, ROUND(SUM(p.price), 2) AS catalog_value, {1}(*) AS products
FROM products p
JOIN suppliers s ON {2}
GROUP BY {3}
ORDER BY catalog_value {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the product counter",
        why: "Catalog breadth is a row count: COUNT(*). SUM(*) isn't valid SQL and errors — the '*' is a placeholder, not a column.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join condition",
        why: "A product's region arrives through products.supplier_id → suppliers.id. Matching ids by coincidence (p.id = s.id) would value a phantom six-product catalog.",
      },
      {
        answer: "s.region",
        kind: "keyword",
        label: "the group key",
        why: "The buckets are supplier regions — GROUP BY s.region. Grouping by p.category would produce a per-category view instead of the requested map.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Richest first' is descending on catalog_value. ASC would open the review with LATAM's two-product corner.",
      },
    ],
    distractors: ["SUM", "s.id = p.id", "p.category", "ASC"],
    walkthrough:
      "Join the catalog to its makers on the real foreign key, bucket by supplier region, then carry two aggregates: SUM(p.price) for value and COUNT(*) for breadth — the pairing that stops a big total being mistaken for a deep catalog. Run it and EU leads at 562.97 across 5 products (Nordic's premium trio plus Alpine's pair), then US 224.49/3, APAC 221.98/6, LATAM 138.99/2. The tell is APAC: six products, barely a fifth of EU's value — volume of SKUs, not depth of price. That's the sourcing story the committee opens with.",
  },
  {
    id: "cs-315",
    tier: "medium",
    topic: "j2",
    universe: "refund-audit",
    title: "Follow a payment back to its buyer",
    brief:
      "From: Refunds desk. Re: high-value payment trace.\n\nWe're tracing substantial cash movements for the audit file. Every payment of 100.00 or more needs its paper trail surfaced: payment id, invoice number, buyer name, amount. Sort by amount, biggest first. The chain is two joins long — payments to invoices to customers — and the file rejects rows with missing links.",
    ask: "Payments of 100.00+ with invoice number and buyer name attached, biggest amount first.",
    template: `SELECT p.id, i.number, c.name, p.amount_cents / 100.0 AS paid
FROM payments p
JOIN invoices i ON {1}
JOIN customers c ON {2}
WHERE p.amount_cents >= {3}
ORDER BY {4} {5};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the first join (payment→invoice)",
        why: "payments.invoice_id is the ledger thread into invoices.id. Matching it to i.number compares a number to text like 'INV-2024-001' and matches nothing.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the second join (invoice→customer)",
        why: "The buyer's name hangs off the invoice, not the payment — invoices.customer_id → customers.id is hop two of the chain.",
      },
      {
        answer: "10000",
        kind: "number",
        label: "the amount floor (in cents)",
        why: "100.00 in display units is 10000 cents — the comparison runs in the stored unit. 0 would flood the file with every payment.",
        noVerify: true,
      },
      {
        answer: "p.amount_cents",
        kind: "keyword",
        label: "the sort column",
        why: "'Biggest first' sorts by the payment amount in its stored unit. Sorting by c.name would alphabetize the buyers instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Descending puts the largest movement on line one of the audit file; ASC would start at the smallest.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "c.id = i.id", "5000000", "c.name", "ASC"],
    walkthrough:
      "Two joins, one direction of travel: payment → invoice → customer, each hop on the real foreign key. The audit's unit trap lives in the WHERE: amounts are stored in cents, so the 100.00 floor is 10000 — and the sort must run on the same stored column. Run it and every qualifying row carries all four fields; the biggest movements sit on top. The desk's working rule from this file: if a payment can't name its invoice and buyer in one query, the chain is broken somewhere — and on this book it never is (27 payments, all linked).",
  },
  {
    id: "cs-316",
    tier: "easy",
    topic: "j2",
    universe: "fraud",
    title: "Pull one order's paper trail",
    brief:
      "From: Fraud spot-check desk. Re: sample audit, order #1.\n\nWe're spot-checking a sample order end to end. For order 1, show each line's quantity next to the product it bought — joined through the catalog so the rows read as things, not ids. This is the reconciliation view the desk compares against the shipping manifest.",
    ask: "Order 1's lines: quantity and product name for each line.",
    template: `SELECT oi.{1}, p.name
FROM order_items oi
JOIN products p ON {2}
WHERE oi.order_id = {3};`,
    slots: [
      {
        answer: "quantity",
        kind: "keyword",
        label: "the per-line count column",
        why: "How many of each thing was bought lives in order_items.quantity. unit_price would show money instead of counts.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id points at products.id — the catalog thread. p.id = oi.order_id would compare product ids to order numbers.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the sampled order id",
        why: "The desk sampled order 1 — the filter pins the 251-line book down to this order's lines. Order 2's basket is a different sample.",
      },
    ],
    distractors: ["unit_price", "id", "p.id = oi.order_id", "2"],
    walkthrough:
      "A single-order trace: pin order_items to order 1, join each line to its product via the catalog foreign key, and surface quantity next to name. Run it and the basket reads like a receipt — Yoga Mat Eco 6mm ×3, HDMI 2.1 Cable ×2, Desk Mat Extended ×1, Noise-Canceling Headset ×3: four lines, nine units. The distractor join (p.id = oi.order_id) is the classic grain error — it would compare the product's catalog id against the order number and return whatever coincidence allows. The manifest comparison works because every row is a real thing at a real count.",
  },
  {
    id: "cs-317",
    tier: "hard",
    topic: "j2",
    universe: "growth",
    title: "Lines and spend, biggest books first",
    brief:
      "From: Head of Growth. Re: account book sizes.\n\nFor the growth review I want our customers ranked by the money in their order book — but counted at the line grain, where spend means quantity times unit price summed over joined lines. Show the three biggest books with their line counts. Watch the joins: line grain only works if both hops are real.",
    ask: "Top 3 customers by line-grain spend (Σ quantity × unit_price), with line counts, biggest first.",
    template: `SELECT c.name, COUNT(oi.id) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM {1} c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.id
ORDER BY spend {4}
LIMIT {5};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the base table",
        why: "The books belong to customers — the chain starts there. 'orders' as the base would alias an order table as c and dissolve the customer grain.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "Orders attach to accounts through orders.customer_id → customers.id. o.id = c.id matches order numbers to customer ids — a coincidence population.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "Lines attach to orders through order_items.order_id → orders.id. oi.id = o.id pairs line numbers with order numbers and corrupts every sum downstream.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest books first' is descending spend. ASC would rank the one-order accounts on top.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the row cap",
        why: "The review wants the podium: LIMIT 3. A cap of 16 would list every customer including the one-order accounts.",
        noVerify: true,
      },
    ],
    distractors: ["orders", "o.id = c.id", "oi.id = o.id", "ASC", "16"],
    walkthrough:
      "Three tables in a chain, and every hop must be the real foreign key or the money silently reroutes. From customers down through orders to lines, spend is Σ(quantity × unit_price) — the line grain — while COUNT(oi.id) gives each book's depth. Run it and the podium is Alice Chen 50 lines / 7,262.35, Emma Wilson 46 / 6,640.56, Grace Kim 34 / 4,574.23. Note what the grain choice buys: summing order totals over these same joined rows would double-count every order once per line — the classic fan-out trap this query dodges by never touching o.total.",
  },
  {
    id: "cs-318",
    tier: "hard",
    topic: "j2",
    universe: "funnel",
    title: "Units by region, gated",
    brief:
      "From: Marketing lead. Re: regional capacity call.\n\nWhere does physical volume actually flow? Sum units (and count lines) per customer region through the full three-table chain, then keep only the regions moving more than 100 units — the call doesn't need the long tail. Biggest book on top.",
    ask: "Per region with over 100 units: units and line count, biggest first.",
    template: `SELECT c.region, SUM(oi.quantity) AS units, COUNT(oi.id) AS lines
FROM customers c
{1} orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.region
{4} SUM(oi.quantity) > {5}
ORDER BY units DESC;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the first join keyword",
        why: "The chain from customers to their orders starts with a plain JOIN. UNION can't sit inside FROM.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join condition",
        why: "orders.customer_id → customers.id is the account thread. o.id = c.id would chain lines to a coincidence.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join condition",
        why: "order_items.order_id → orders.id extends the chain to line grain. oi.id = o.id is the number-coincidence trap.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "Filtering on SUM(oi.quantity) — an aggregate — must happen in HAVING, after the groups exist. WHERE errors on aggregates.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the unit floor",
        why: "The call keeps regions moving 100+ units. Raising to 150 would cut the US book and shrink the call to two markets.",
        noVerify: true,
      },
    ],
    distractors: ["UNION", "o.id = c.id", "oi.id = o.id", "WHERE", "150"],
    walkthrough:
      "The full chain — customers → orders → lines — with two aggregates riding the line grain: SUM(quantity) for units, COUNT(oi.id) for lines. The gate is HAVING precisely because the floor applies to a SUM computed per group. Run it and three regions clear 100 units: EU 199 (on 105 lines), APAC 174 (88), US 112 (53) — while LATAM's 13 units don't make the call. Raise the floor to 150 and the US book drops out: the gate is a one-number policy lever. Swap HAVING for WHERE and the query doesn't argue, it errors: 'misuse of aggregate' is SQLite telling you the clause boundary is real.",
  },
  {
    id: "cs-319",
    tier: "hard",
    topic: "j2",
    universe: "inventory",
    title: "Four-line baskets",
    brief:
      "From: Warehouse ops. Re: pick-path planning.\n\nOur biggest pick paths are the four-line orders — one stop per line, four stops per order. Isolate them: orders with exactly 4 lines, showing line count and total units, heaviest basket first, top five. These drive the cart layout.",
    ask: "The 5 four-line orders with the most units — order id, line count, total units.",
    template: `SELECT o.id, COUNT(oi.id) AS lines, SUM(oi.quantity) AS units
FROM orders o
{1} order_items oi ON {2}
GROUP BY o.id
{3} COUNT(oi.id) = {4}
ORDER BY units DESC
{5} 5;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Line counts come from order_items, so each order row must join to its lines. UNION can't appear in FROM.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "The parent-child thread is order_items.order_id → orders.id. oi.id = o.id would group by id coincidences and fabricate line counts.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "'Exactly 4 lines' filters the COUNT per group — HAVING territory. WHERE can't see aggregates and errors with 'misuse of aggregate'.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the basket size",
        why: "Four-line baskets: COUNT = 4 exactly, not >= — the pick path is defined by size. At 3, the twenty-five three-line orders flood the list.",
        noVerify: true,
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap keyword",
        why: "Top five is LIMIT 5 — the trim clause after ORDER BY. HAVING here is a syntax error.",
        noVerify: true,
      },
    ],
    distractors: ["UNION", "oi.id = o.id", "WHERE", "3", "23"],
    walkthrough:
      "Group orders with their lines, then HAVING picks the exact basket size — 4, not '4 or more', because the pick path is a physical constraint. The unit total rides the same groups: SUM(quantity). Run it and 23 orders carry exactly four lines (the catalog's basket distribution runs 1:26, 2:29, 3:25, 4:23 across 103 orders), with the five heaviest by units on the planning list — orders 1, 6 and 11, the known 4-line veterans, all in the set. Swap the HAVING for WHERE and SQLite refuses before it misleads: aggregates only exist after grouping.",
  },
  {
    id: "cs-320",
    tier: "easy",
    topic: "j3",
    universe: "catalog",
    title: "Name every line's product",
    brief:
      "From: Catalog ops. Re: line-level binder page.\n\nThe binder's line-level page needs the first ten lines with their product names readable — quantity and unit price next to a real product name, in name order. Ids are for joins, not for humans.",
    ask: "The first 10 lines (by product name) with product name, quantity and unit price.",
    template: `SELECT p.name, oi.quantity, oi.unit_price
FROM order_items oi
{1} products p ON {2}
ORDER BY {3}
LIMIT 10;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Product names live in products; lines only carry product ids. JOIN translates ids into names row by row.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id is the catalog thread. p.id = oi.order_id would compare catalog ids to order numbers.",
      },
      {
        answer: "p.name",
        kind: "keyword",
        label: "the sort key",
        why: "'In name order' sorts by the product name — the human-readable key. Sorting by unit_price would order the page by money instead.",
      },
    ],
    distractors: ["UNION", "p.id = oi.order_id", "oi.unit_price"],
    walkthrough:
      "One join, one purpose: turn product ids into product names so a human can read the page. The join key is the real foreign key p.id = oi.product_id; the order_id variant is the grain error that would pair catalog entries with order numbers. Sorted by name, the page opens on Bluetooth Speaker Mini lines and cuts at ten — the full line book is 251 rows, but a binder page trims. Quantity and unit_price come straight off the line row; nothing here is aggregated, so every row is one physical line event.",
  },
  {
    id: "cs-321",
    tier: "easy",
    topic: "j3",
    universe: "funnel",
    title: "Units by customer region",
    brief:
      "From: Marketing lead. Re: regional volume split.\n\nExtend the regional story from orders to physical units: for each customer region, sum the quantity across every line of their orders. Four rows — one per region — so the meeting sees where the boxes actually go.",
    ask: "Total units (Σ quantity) per customer region, one row per region.",
    template: `SELECT c.region, SUM(oi.quantity) AS units
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.region
ORDER BY units {3};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join (customer→order)",
        why: "orders.customer_id → customers.id attaches each order to its account. o.id = c.id matches order numbers to customer ids.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join (order→line)",
        why: "order_items.order_id → orders.id reaches the line grain where quantities live. oi.id = o.id is the coincidence trap.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The meeting reads biggest region first: DESC. ASC would lead with LATAM's handful of units.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "ASC"],
    walkthrough:
      "Two hops, both on real foreign keys: customers to orders, orders to lines — then the quantity sums roll up per region. The chain discipline is the lesson: break either hop and the units reroute through id coincidences, and no error message will warn you. Four rows come back, one per region. The gap worth narrating: EU and APAC dominate the box count while LATAM's two-order book contributes a handful of units — a rounding error next to the leaders. For the line-count version of this same split, the ordering holds; the units story just weights heavy baskets more.",
  },
  {
    id: "cs-322",
    tier: "easy",
    topic: "j3",
    universe: "supplier",
    title: "Order 1's supplier spread",
    brief:
      "From: Procurement lead. Re: single-order supplier mix.\n\nFor the order-1 sample audit I want the supplier spread: each line's product name next to the supplier that made it. Two joins — catalog first, then supplier — and the filter pins everything to order 1. This shows whether one order quietly depends on one vendor.",
    ask: "Order 1's lines: product name and supplier name for each.",
    template: `SELECT p.name, s.name AS supplier
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
WHERE oi.order_id = {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id names the thing bought. p.id = oi.order_id compares catalog ids to order numbers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id names the maker. Skipping this hop leaves the supplier column impossible.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the sampled order",
        why: "The audit pins the sample to order 1 — without it the query lists every line in the book, supplier and all.",
        noVerify: true,
      },
    ],
    distractors: ["p.id = oi.order_id", "s.region = p.category", "2"],
    walkthrough:
      "The chain reads right to left: line → product → supplier, each hop on the real key. Pin to order 1 and four rows come back — Yoga Mat Eco 6mm from Midwest Hardware, HDMI 2.1 Cable from Pacific Textiles, Desk Mat Extended from Alpine Audio, Noise-Canceling Headset from Midwest Hardware again. The procurement insight: even a four-line basket can concentrate — Midwest appears twice here, and the region=text distractor (s.region = p.category) is the reminder that 'EU' never equals 'Electronics'. Supplier spread per basket is exactly how vendor dependency gets spotted early.",
  },
  {
    id: "cs-323",
    tier: "medium",
    topic: "j3",
    universe: "supplier",
    title: "Supplier volume leaderboard",
    brief:
      "From: Supplier audit. Re: who actually ships the goods.\n\nRank our suppliers by physical volume — units shipped through their products, summed over joined lines. One row per supplier, heaviest shipper on top. This is the leverage chart for the next negotiation round.",
    ask: "Suppliers ranked by total units sold through their products, biggest first.",
    template: `SELECT s.name, {1}(oi.quantity) AS units
FROM order_items oi
JOIN products p ON {2}
JOIN suppliers s ON {3}
GROUP BY s.id
ORDER BY units {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the volume aggregate",
        why: "Units shipped is quantity summed: SUM(oi.quantity). COUNT would count lines — a different (smaller) number where a weight belongs.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "Lines reference the catalog through order_items.product_id → products.id — the hop that names what was sold.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id attaches each product to its maker — the hop that groups units under vendor names.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Heaviest shipper on top: DESC on units. ASC would open the negotiation with the smallest vendor.",
      },
    ],
    distractors: ["COUNT", "p.id = oi.order_id", "s.region = p.category", "ASC"],
    walkthrough:
      "Volume flows line → product → supplier; two real joins and a SUM over quantity give each vendor its shipped weight. Run it and Midwest Hardware Co leads at 109 units on just three products, Shenzhen Electro follows at 99, then Nordic Gadgets 82, Pacific Textiles 80, Alpine Audio 77, Andes Naturals 51. Read regionally and the concentration is starker: APAC's two suppliers combined ship 179 units — more than any other region's total. That's the leverage chart: volume buys the meeting, per-vendor numbers set the agenda.",
  },
  {
    id: "cs-324",
    tier: "hard",
    topic: "j3",
    universe: "growth",
    title: "Spend at the line grain, gated",
    brief:
      "From: Head of Growth. Re: whale watch.\n\nI want the customers whose order books are both deep and valuable: at least 30 order lines, ranked by line-grain spend — quantity times unit price summed over the joined chain. Names and line counts next to the spend, biggest spender on top. The floor keeps the one-order accounts out of the review.",
    ask: "Customers with 30+ lines ranked by line-grain spend (Σ quantity × unit_price), biggest first.",
    template: `SELECT c.name, COUNT(oi.id) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM customers c
JOIN orders o ON {1}
JOIN order_items oi ON {2}
GROUP BY c.id
{3} COUNT(oi.id) >= {4}
ORDER BY spend {5};`,
    slots: [
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "The account thread is orders.customer_id → customers.id. o.id = c.id would chain spend through an id coincidence.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "The line grain arrives via order_items.order_id → orders.id. oi.id = o.id corrupts every count and sum downstream.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "The 30-line floor filters COUNT(oi.id) per customer — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "30",
        kind: "number",
        label: "the depth floor",
        why: "'Deep' means 30+ lines. At 40 only two books survive; at 14 the mid-tier floods the review.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest spender on top' is DESC on spend — the whale watch reads downward.",
      },
    ],
    distractors: ["o.id = c.id", "oi.id = o.id", "WHERE", "40", "ASC"],
    walkthrough:
      "The full chain to line grain, two aggregates per customer — COUNT for depth, SUM(quantity × unit_price) for value — and HAVING enforces the depth floor before the ranking. Run it and four books clear 30 lines: Alice Chen 50 / 7,262.35, Emma Wilson 46 / 6,640.56, Grace Kim 34 / 4,574.23, Maya Patel 30 / 3,644.56. Chloe Dubois misses at 14 lines — the floor doing its job. The spend figure is honest precisely because it never touches o.total: summing order totals over 30+ joined lines would inflate every book by its own line count.",
  },
  {
    id: "cs-325",
    tier: "medium",
    topic: "j3",
    universe: "refund-audit",
    title: "Where the cash came from",
    brief:
      "From: Refunds desk. Re: regional cash exposure.\n\nBefore we approve refund budgets we map where collected cash actually originates: payments joined through invoices to the paying customer's region. Payments count and cash total per region, biggest total first. Expect fewer regions than the map has — that absence is itself a finding.",
    ask: "Per region: payment count and total cash (Σ payments ÷ 100), biggest cash first.",
    template: `SELECT c.region, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS paid
FROM payments p
JOIN invoices i ON {1}
JOIN customers c ON {2}
GROUP BY {3}
ORDER BY paid {4};`,
    slots: [
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the first join (payment→invoice)",
        why: "payments.invoice_id → invoices.id is the only real link from cash to paper. Matching i.number to the id compares text to a number.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the second join (invoice→customer)",
        why: "The payer's region hangs off the invoice — invoices.customer_id → customers.id is hop two.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the group key",
        why: "The buckets are customer regions: GROUP BY c.region. Grouping by i.status would split cash by invoice state instead of geography.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Biggest total first' is DESC on paid. ASC would open with the smallest cash pool.",
      },
    ],
    distractors: ["p.invoice_id = i.number", "c.id = i.id", "i.status", "ASC"],
    walkthrough:
      "Cash → paper → payer: two joins on real foreign keys, then region buckets with a count and a sum. Run it and three rows come back — EU 14 payments / 37,261.00, APAC 8 / 20,613.00, US 5 / 11,738.00 — and that's all of them. LATAM is absent because its only customer, Bruno Silva, has no invoices at all, hence no payments; the desk should read the missing fourth row as 'no cash exposure', not 'query bug'. The three totals reconcile to 69,612.00, the full collected cash — a closed map with a deliberate hole.",
  },
  {
    id: "cs-326",
    tier: "medium",
    topic: "j3",
    universe: "pricing",
    title: "What a line really costs",
    brief:
      "From: Pricing committee. Re: realized price points.\n\nCatalog list prices are one thing; what lines actually transact at is another. For each category, give me the average realized unit price over joined lines and the line count, ranked by that average. This is where premium positioning survives or dies.",
    ask: "Per category: average line unit price and line count, highest average first.",
    template: `SELECT p.category, ROUND(AVG(oi.unit_price), 2) AS avg_line, COUNT(*) AS lines
FROM order_items oi
{1} products p ON {2}
GROUP BY {3}
ORDER BY {4} DESC;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Categories live in products; the join brings each line's category alongside its transacted price.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id is the catalog thread. p.id = oi.order_id would pair products with order numbers.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the group key",
        why: "The buckets are product categories — GROUP BY p.category. Grouping by p.supplier_id would average prices per vendor instead.",
      },
      {
        answer: "avg_line",
        kind: "keyword",
        label: "the sort column",
        why: "'Highest average first' sorts by the computed alias — SQLite resolves avg_line to the AVG expression. Sorting by lines would rank by volume instead.",
      },
    ],
    distractors: ["UNION", "p.id = oi.order_id", "p.supplier_id", "lines"],
    walkthrough:
      "Realized pricing is a join-then-average: lines joined to their products, AVG(unit_price) per category, COUNT for weight. Run it and Wearables tops the realized ladder at 131.81 across 25 lines — the Smart Watch's 199.99 list doing exactly what premium positioning should — with Audio next at 120.77 over a deep 51 lines. Accessories anchor the bottom: 27.39 average across a volume-heavy 62 lines. The committee's takeaway writes itself: high average with low count (Wearables) is a margin story; low average with high count (Accessories) is a traffic story — different price books for each.",
  },
  {
    id: "cs-327",
    tier: "hard",
    topic: "j3",
    universe: "supplier",
    title: "Where the money ships from",
    brief:
      "From: Supplier audit. Re: regional revenue exposure.\n\nUnits are one thing; revenue is another. Through the line→product→supplier chain, sum the realized revenue (quantity × unit price) per supplier region, keep only regions clearing 5,000, and rank them. The memo needs to know where our revenue physically originates.",
    ask: "Supplier regions with 5,000+ realized revenue: Σ quantity × unit_price per region, biggest first.",
    template: `SELECT s.region, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1}
JOIN suppliers s ON {2}
GROUP BY s.region
{3} SUM(oi.quantity * oi.unit_price) >= {4}
ORDER BY revenue {5};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the first join (line→product)",
        why: "order_items.product_id → products.id attaches the catalog to each line — the hop that eventually names the maker.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the second join (product→supplier)",
        why: "products.supplier_id → suppliers.id carries each product to its vendor, whose region buckets the revenue.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group gate",
        why: "The 5,000 bar applies to a per-group SUM — HAVING after GROUP BY. WHERE cannot see aggregates.",
      },
      {
        answer: "5000",
        kind: "number",
        label: "the revenue floor",
        why: "The memo's bar is 5,000. Dropping to 3,500 readsmits LATAM's 3,613.25 and dilutes the exposure list.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The memo opens with the biggest revenue region: DESC.",
      },
    ],
    distractors: ["20000", "s.region = p.category", "WHERE", "3500", "ASC"],
    walkthrough:
      "Revenue flows line → product → supplier, and the region buckets sum quantity × unit_price — realized money, not list-price arithmetic. HAVING applies the 5,000 floor to the group sums. Run it and three regions make the memo: EU 15,895.88, US 9,294.93, APAC 6,029.22 — while LATAM's 3,613.25 misses the bar. The unit-economics are the story: APAC ships the most units of any region (179) but converts at just 33.7 per unit, while LATAM realizes 70.9 per unit on only 51 units — the highest rate in the book, on too little volume to matter to this memo. Volume ships from APAC; per-unit value ships from LATAM; the headline money ships from EU.",
  },
  {
    id: "cs-328",
    tier: "hard",
    topic: "j3",
    universe: "month-close",
    title: "Cash by city",
    brief:
      "From: Financial Controller. Re: close binder, cash geography.\n\nThe close binder wants collected cash mapped to cities — payments joined through invoices to the payer's city. Top three cities by cash, with payment counts. Berlin's dominance should be visible, not assumed.",
    ask: "Top 3 cities by collected cash: payment count and cash total (Σ ÷ 100), biggest first.",
    template: `SELECT c.city, COUNT(p.id) AS payments, ROUND(SUM(p.amount_cents) / 100.0, 2) AS cash
FROM payments p
{1} invoices i ON {2}
JOIN customers c ON {3}
GROUP BY c.city
ORDER BY cash {4}
LIMIT {5};`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the first join keyword",
        why: "The chain starts payment → invoice; a plain JOIN on the real key. UNION cannot sit in FROM.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the first join condition",
        why: "payments.invoice_id → invoices.id is the ledger thread. i.number is text — matching it to the numeric id matches nothing.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the second join condition",
        why: "The payer's city hangs off the invoice's customer: invoices.customer_id → customers.id completes the chain.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Top by cash' means descending. ASC would put the smallest cash pool on the binder's first line.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the city cap",
        why: "The binder page carries three cities. A cap of 5 would readmit Austin and Milan and crowd the page.",
        noVerify: true,
      },
    ],
    distractors: ["UNION", "p.invoice_id = i.number", "c.id = i.id", "ASC", "5"],
    walkthrough:
      "The two-hop chain payment → invoice → customer puts a city on every cash movement; group by city, count and sum, sort down, trim to three. Run it and Berlin leads at 24,481.00 over 9 payments — that's Alice Chen's five invoices plus her installments, since every city hosts exactly one customer on this book. Mumbai follows at 11,542.00 (5 payments), Seoul at 9,071.00 (3). The binder takeaway: cash geography is customer geography — one heavy payer can own a city's line, which is exactly why the payment count sits next to the total.",
  },
  {
    id: "cs-329",
    tier: "easy",
    topic: "j4",
    universe: "month-close",
    title: "Nobody off the books",
    brief:
      "From: Financial Controller. Re: account coverage check.\n\nFor the close I want every customer on the receivables view — including the ones we've never invoiced, shown with a zero rather than silently dropped. Invoice count per customer, zeros first. If someone falls off this list, the close is wrong.",
    ask: "Invoice count per customer INCLUDING never-invoiced accounts, zeros first, then by name.",
    template: `SELECT c.name, COUNT(i.id) AS invoices
FROM customers c
{1} invoices i ON {2}
GROUP BY c.id
ORDER BY invoices {3}, c.name;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps every customer row even when no invoice matches — the never-invoiced appear with count 0. A plain JOIN would silently drop them.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "invoices.customer_id → customers.id is the real thread. Matching i.number to c.name compares text to text but means nothing.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "'Zeros first' is ascending on the count — ASC puts the never-invoiced at the top of the page where the controller looks first.",
      },
    ],
    distractors: ["JOIN", "UNION", "i.customer_id = c.name", "DESC"],
    walkthrough:
      "The whole case is one keyword: LEFT JOIN preserves the left table — every customer — and fills unmatched invoice columns with NULL, which COUNT(i.id) reads as 0. Run it and sixteen customers appear, five of them at zero (Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer), with Alice Chen's five invoices at the far end. Swap LEFT JOIN for JOIN and the five zeros vanish from the close — eleven accounts where sixteen belong. The ASC keeps the holes at the top of the page, which is exactly where a controller wants them.",
  },
  {
    id: "cs-330",
    tier: "easy",
    topic: "j4",
    universe: "refund-audit",
    title: "The 33-vs-28 tell",
    brief:
      "From: Refunds desk. Re: reconciliation sanity drill.\n\nTeach the new analyst the oldest LEFT JOIN tell in the book: count two ways over the customer-invoice join — all joined rows, and rows with a real invoice — and read the gap. The two numbers in one row say everything about who got preserved.",
    ask: "One row: total joined rows vs rows with a matched invoice (customer→invoices, LEFT JOIN).",
    template: `SELECT {1}(*) AS all_rows, COUNT(i.id) AS with_invoice
FROM customers c
{2} invoices i ON {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "Both figures are counts — COUNT(*) over the joined rows and COUNT(i.id) over matched ones. SUM(*) errors immediately.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps the five never-invoiced customers as NULL-filled rows — that's what makes 33 ≠ 28. A plain JOIN collapses both counts to 28.",
      },
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real foreign key: invoices.customer_id → customers.id. Anything else populates the two counts with coincidence rows.",
      },
    ],
    distractors: ["SUM", "JOIN", "i.customer_id = c.name"],
    walkthrough:
      "One query, two counts, one diagnosis. COUNT(*) counts every row the LEFT JOIN produced — 33, because 28 matched invoices plus 5 NULL-filled rows for the never-invoiced customers. COUNT(i.id) counts only rows where an invoice actually matched — 28. The gap of 5 IS the finding: five accounts on the books with zero invoices. Run the same counts over a plain JOIN and both read 28, the gap gone and the holes hidden. Every reconciliation drill starts here: when all_rows ≠ with_invoice, the left table has unmatched members, and you should be able to name them.",
  },
  {
    id: "cs-331",
    tier: "easy",
    topic: "j4",
    universe: "expense",
    title: "Six invoices nobody touched",
    brief:
      "From: Treasury. Re: collections list.\n\nFor the collections call I need the invoices with no payment at all — number, status, and amount owed, biggest amount first. These are the rows where the paper says we're owed and the cash table says nothing arrived.",
    ask: "Invoices with zero payments: number, status, amount owed — biggest amount first.",
    template: `SELECT i.number, i.status, ROUND(i.amount_cents / 100.0, 2) AS owed
FROM invoices i
{1} payments p ON {2}
WHERE p.id IS {3}
ORDER BY owed {4};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps unpaid invoices as NULL-filled rows; a plain JOIN would erase exactly the rows the collections call needs.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash-to-paper thread. Matching p.invoice_id to i.number compares number to text.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL — the only test that sees NULL. IS NOT would flip the query to the 21 paid invoices.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Collections works biggest exposure first: DESC on owed. ASC would start the call at the smallest balance.",
      },
    ],
    distractors: ["JOIN", "p.invoice_id = i.number", "NOT", "ASC"],
    walkthrough:
      "The anti-payment pattern: LEFT JOIN payments onto invoices, then IS NULL to keep only the unmatched — six invoices come back, 15,217.00 of exposure, biggest first: 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00. The wrinkle worth a raised eyebrow: five sit at status 'open' as expected, but one is marked 'paid' — the ledger says settled, the cash table disagrees, and that invoice is Monday's first phone call. Swap LEFT for INNER JOIN and the list doesn't shrink, it disappears — the collection call would go ahead with nothing on screen and everything still owed.",
  },
  {
    id: "cs-332",
    tier: "medium",
    topic: "j4",
    universe: "fraud",
    title: "Prove nobody is order-less",
    brief:
      "From: Fraud spot-check desk. Re: coverage assertion.\n\nThe assertion to test: every customer on the books has placed at least one order — no dormant zero-order accounts that fraudsters love. Build the zero-bucket query honestly and run it. An empty result here isn't failure; it's the assertion passing.",
    ask: "Customers with zero orders (expect: an empty result that PROVES the assertion).",
    template: `SELECT c.name, COUNT(o.id) AS orders
FROM customers c
{1} orders o ON {2}
GROUP BY c.id
{3} COUNT(o.id) = 0;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Zero-hunting requires LEFT JOIN — unmatched customers must survive as NULL-filled rows for the HAVING to see. A plain JOIN deletes the very rows being hunted.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real thread: orders.customer_id → customers.id. Comparing o.customer_id to c.name matches numbers to names — zero matches everywhere.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the zero-bucket filter",
        why: "COUNT(o.id) = 0 filters grouped aggregates — HAVING territory. WHERE errors on aggregates before grouping even happens.",
      },
    ],
    distractors: ["UNION", "o.customer_id = c.name", "WHERE"],
    walkthrough:
      "The zero-bucket pattern, run as an assertion: LEFT JOIN keeps all 16 customers, COUNT(o.id) counts real matches (NULL reads as 0), HAVING keeps only the zero-buckets. Run it and the result is EMPTY — and that empty grid is the proof: all sixteen customers have ordered at least once, so no dormant accounts exist to exploit. The desk's discipline is reading emptiness correctly: 'no rows' here means the assertion passed, not that the query broke. Distractor-by-error is deliberate: WHERE COUNT(o.id) doesn't debate you, it refuses — aggregates only exist after GROUP BY.",
  },
  {
    id: "cs-333",
    tier: "hard",
    topic: "j4",
    universe: "month-close",
    title: "Keep the pipeline visible",
    brief:
      "From: Financial Controller. Re: pending-order coverage view.\n\nI want a coverage view where every customer appears, and — for those with pending orders — their pending order totals. The filter must live INSIDE the join so customers without pending business still show up as a NULL row I can eyeball. Sorted by customer name, then total. If a WHERE sneaks in, the coverage silently dies.",
    ask: "Every customer with their pending-order totals attached (NULL row when none) — filter inside the ON.",
    template: `SELECT c.name, o.total
FROM customers c
{1} orders o ON {2} {3} o.status = {4}
ORDER BY c.name, o.{5};`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Coverage for every customer requires LEFT JOIN. A plain JOIN would return only the pending rows and drop eight customers who have none.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real account thread: orders.customer_id → customers.id. o.id = c.id would pair orders 1–16 with customers 1–16 by coincidence.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the ON-combinator",
        why: "Inside ON, AND attaches the status filter to the match condition — unmatched customers survive as NULL rows. WHERE in that position moves the filter out of the join and kills the preservation.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status literal",
        why: "The pipeline is pending orders — text, quoted. 'delivered' would cover the 52-order history instead of the live pipeline.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the secondary sort",
        why: "Within one customer, orders sort by their total: o.total. Sorting by o.id would order by creation sequence instead of size.",
      },
    ],
    distractors: ["JOIN", "o.id = c.id", "WHERE", "'delivered'", "id"],
    walkthrough:
      "The ON-placement lesson in one query. With the status filter inside the ON (joined with AND), a LEFT JOIN keeps every customer: the eight with pending orders show their rows, the other eight appear once with a NULL total — 22 rows total, coverage intact. Move the filter to WHERE and the NULL rows fail the test, so the eight no-pending customers vanish: 14 rows, and the controller's 'who has no pipeline?' question becomes unanswerable. Run it and the named pending book is Alice Chen ×3, Emma Wilson ×3, Chloe Dubois ×2, Maya Patel ×2, plus four single-order accounts — 14 orders across exactly 8 customers.",
  },
  {
    id: "cs-334",
    tier: "medium",
    topic: "j4",
    universe: "refund-audit",
    title: "Name the unpaid six",
    brief:
      "From: Refunds desk. Re: receivables hygiene list.\n\nWe need the named list behind the collections number: every invoice with no payment against it — number, status, amount owed — sorted so the biggest problems lead. And we want status visible, because last quarter an invoice marked paid turned up with no cash behind it.",
    ask: "Invoices with zero payments: number, status, amount owed — status first in the sort, then biggest owed.",
    template: `SELECT i.number, i.status, ROUND(i.amount_cents / 100.0, 2) AS owed
FROM invoices i
{1} payments p ON {2}
WHERE p.id IS {3}
ORDER BY {4}, owed DESC;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Unpaid invoices survive only under LEFT JOIN — as NULL-filled rows the IS NULL test can catch. INNER JOIN deletes them outright.",
      },
      {
        answer: "p.invoice_id = i.id",
        kind: "keyword",
        label: "the join condition",
        why: "payments.invoice_id → invoices.id is the cash thread. Matching p.invoice_id to i.number compares a number to text like 'INV-2024-001'.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL. IS NOT NULL would return the 21 matched invoices — the exact complement.",
      },
      {
        answer: "i.status",
        kind: "keyword",
        label: "the primary sort",
        why: "Status leads the sort so anomalies group together — an invoice reading 'paid' with no payments jumps out. Sorting by i.number would bury it alphabetically.",
      },
    ],
    distractors: ["JOIN", "p.invoice_id = i.number", "NOT", "i.number"],
    walkthrough:
      "The anti-payment pattern with an audit twist: LEFT JOIN payments, keep IS NULL survivors, and sort by status FIRST so the ledger's claims group together. Six invoices come back worth 15,217.00 — five at status 'open', behaving exactly as a receivables list should. The sixth reads 'paid'. That's the audit hook: the status column and the payments table disagree, and only this query shape — preserve, test for emptiness, sort by claim — surfaces it. The desk's rule: an unpaid list is a hygiene chore; an unpaid list sorted by status is an audit.",
  },
  {
    id: "cs-335",
    tier: "hard",
    topic: "j4",
    universe: "growth",
    title: "Coverage with the empties kept",
    brief:
      "From: Head of Growth. Re: regional coverage grid.\n\nThe board grid needs every region present with two honest counts: joined rows and rows with a real order, plus revenue. If the two counts ever diverge, a region has an order-less account and the grid must show it. Build it so it WOULD show that — even though today it won't.",
    ask: "Per region: joined row count, matched-order count, and revenue — built to expose any divergence.",
    template: `SELECT c.region, COUNT(*) AS rows_, COUNT({1}) AS with_orders, ROUND(SUM(o.total), 2) AS revenue
FROM customers c
{2} orders o ON {3}
GROUP BY c.region
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "o.id",
        kind: "keyword",
        label: "the matched-row counter",
        why: "COUNT(o.id) counts rows where an order actually matched — NULL ids from preserved non-orders read as zero. COUNT(*) would blur the two counts into one.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The grid's promise — divergence visible — only holds if order-less customers survive the join. LEFT JOIN preserves them; INNER JOIN deletes the evidence.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "The real thread: orders.customer_id → customers.id. o.id = c.id would fabricate a sixteen-order population.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The board reads biggest revenue first: DESC on revenue.",
      },
    ],
    distractors: ["UNION", "i.id", "o.region", "ASC"],
    walkthrough:
      "The discipline here is building a control panel that works before you need it: COUNT(*) against COUNT(o.id) — the pair that diverges the day an account stops ordering — riding on a LEFT JOIN so the evidence can't be deleted at the join step. Run it today and the counts agree everywhere: EU 45/45/15,089.23, APAC 37/37/11,605.45, US 19/19/7,286.16, LATAM 2/2/852.44. Every customer has ordered; the grid is clean. But two accounts (Dmitri Volkov, Keiko Sato) carry an inactive flag — the day they lapse with no orders, rows_ stays and with_orders drops, and this exact query is the alarm.",
  },
  {
    id: "cs-336",
    tier: "hard",
    topic: "j4",
    universe: "month-close",
    title: "Two-hop holes",
    brief:
      "From: Financial Controller. Re: receivables dead-end audit.\n\nThe dead-end pattern: customers with no invoices at all — which also means no payments, since cash references invoices. Build the chain customer → invoice → payment with BOTH hops preserving, keep only the zero-invoice buckets, and name them. If the second hop hardens to an inner join, watch the holes vanish.",
    ask: "Customers with zero invoices (hence zero payments) — names, with both chain hops preserving.",
    template: `SELECT c.name, COUNT(i.id) AS invoices, COUNT(p.id) AS payments
FROM customers c
LEFT JOIN invoices i ON {1}
{2} JOIN payments p ON p.invoice_id = i.id
GROUP BY c.id
{3} COUNT(i.id) = 0
ORDER BY {4}
LIMIT {5};`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the first join condition",
        why: "invoices.customer_id → customers.id is hop one. Matching i.number to the customer name compares invoice codes to people.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the second hop's join type",
        why: "The second hop must also preserve: a LEFT-then-INNER chain kills the NULL-invoice rows at the payments step, erasing the five customers being hunted.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the zero-bucket filter",
        why: "COUNT(i.id) = 0 filters a per-group aggregate — HAVING after GROUP BY. WHERE errors on aggregates.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the sort key",
        why: "Names make the audit list readable: ORDER BY c.name. Sorting by the all-zero counts would be a no-op that leaves db order.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the expected row count",
        why: "Exactly five never-invoiced customers exist; LIMIT 5 is the assertion. At 3 the list would truncate and hide two holes.",
        noVerify: true,
      },
    ],
    distractors: ["INNER", "WHERE", "c.city"],
    walkthrough:
      "A two-hop preservation chain: customer LEFT JOIN invoice LEFT JOIN payment. The chain totals 38 rows — 33 with invoices (27 carrying payments), 5 NULL-filled for the never-invoiced. HAVING COUNT(i.id) = 0 isolates those five, and COUNT(p.id) confirms the corollary: no invoices, no payments — zeros across both columns for Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato and Noah Meyer. Harden hop two to INNER JOIN and the result is EMPTY: the inner join discards the NULL invoice rows before HAVING ever sees them. Preservation is per-hop; one hard link breaks the whole safety net.",
  },
  {
    id: "cs-337",
    tier: "easy",
    topic: "j5",
    universe: "fraud",
    title: "The unbilled five",
    brief:
      "From: Fraud spot-check desk. Re: billing coverage sweep.\n\nFraud loves the gaps, and the biggest gap is an account we've never billed. List every customer with no invoice on file — name and region, alphabetical. Five rows expected; if you see sixteen, your join isn't hunting.",
    ask: "Customers with zero invoices: name and region, alphabetical by name.",
    template: `SELECT c.name, c.region
FROM customers c
LEFT JOIN invoices i ON {1}
WHERE i.id IS {2}
ORDER BY {3};`,
    slots: [
      {
        answer: "i.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "invoices.customer_id → customers.id is the real thread. Matching i.number (text) against the customer name produces no meaningful pairs.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never invoiced' is i.id IS NULL — the anti-join signature. IS NOT NULL flips the query to the 11 invoiced customers.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the sort key",
        why: "'Alphabetical by name' sorts on c.name. Sorting by c.city would organize people by geography instead.",
      },
    ],
    distractors: ["NOT", "c.city"],
    walkthrough:
      "The anti-join pattern in its purest form: LEFT JOIN leaves the never-invoiced as NULL rows, and IS NULL keeps exactly those. Run it and five names surface — Bruno Silva (LATAM), Dmitri Volkov (EU), Farid Nasser (APAC), Keiko Sato (APAC), Noah Meyer (EU). Note the two EU members: 'region with no billing' would be the wrong summary — Europe is on this list twice AND fully billed eight times elsewhere. Sixteen minus five is eleven: the invoiced complement the NOT distractor would have returned. The desk files the five, then checks their order histories separately — unbilled doesn't mean inactive.",
  },
  {
    id: "cs-338",
    tier: "easy",
    topic: "j5",
    universe: "expense",
    title: "Count the unbilled",
    brief:
      "From: Spend analyst. Re: billing gap count.\n\nCompanion to the named list: I just want the size of the billing gap as ONE number — how many customers have never received an invoice. The count must run over the preserved join, or the gap counts as zero and the memo lies.",
    ask: "One number: customers with no invoice on file.",
    template: `SELECT {1}(*) AS never_invoiced
FROM customers c
{2} invoices i ON i.customer_id = c.id
WHERE i.id IS {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount: COUNT(*). SUM(*) and AVG(*) are invalid SQL over a placeholder and error immediately.",
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "The gap exists only if unmatched customers survive the join. A plain JOIN returns zero matched-then-unmatched rows — the count would report 0 and hide the gap.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "i.id IS NULL marks the never-invoiced. IS NOT NULL would count the 11 billed customers instead.",
      },
    ],
    distractors: ["SUM", "AVG", "JOIN", "NOT"],
    walkthrough:
      "Counting a gap is a three-part discipline: preserve the left table (LEFT JOIN), mark the unmatched (IS NULL), count what remains (COUNT(*) → 5). Break any part and the number inverts or vanishes — a plain JOIN here counts rows that matched and then didn't, which is nothing, so the memo would print '0 unbilled accounts' while five real ones sit off the books. The number ties out with the named list: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer. Same population, one row, five members — the memo's single stat and the audit's named list must always agree.",
  },
  {
    id: "cs-339",
    tier: "medium",
    topic: "j5",
    universe: "inventory",
    title: "Zero dead stock, proven",
    brief:
      "From: Inventory control. Re: dead-stock assertion.\n\nThe assertion from the last count meeting: every product in the catalog has sold at least once — no dead stock on the shelves. Prove it with data: join products to sold lines and isolate products with zero sales. The expected result is empty, and empty is the proof.",
    ask: "Products with zero sales lines (expect: empty result = assertion passes).",
    template: `SELECT p.name, p.category
FROM products p
LEFT JOIN order_items oi ON {1}
WHERE oi.{2} IS {3};`,
    slots: [
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id is the sales thread. Matching p.supplier_id to oi.product_id would join products to the wrong table's key entirely.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the line existence column",
        why: "oi.id IS NULL means no line matched — the row-existence test. There is no oi.p.name; qualifying the wrong table errors out.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'Never sold' is IS NULL. IS NOT NULL returns the 251 matched lines — the entire sales book, the opposite of dead stock.",
      },
    ],
    distractors: ["NOT", "p.supplier"],
    walkthrough:
      "Assertion queries and fraud queries share one shape: preserve everything (LEFT JOIN), test for the absence (IS NULL), read the survivors. Run it and the result is EMPTY — all sixteen products have at least one sales line, so dead stock is zero and the meeting's assertion stands. The discipline is trusting emptiness: the same grid that looks like a broken query in the fraud module is, here, a clean bill of health. And the distractors here are deliberately merciless: on an assertion query, a near-miss key or a flipped IS NOT doesn't argue with you — it either errors out or silently inverts the verdict, which is exactly the failure mode the assertion shape exists to expose.",
  },
  {
    id: "cs-340",
    tier: "hard",
    topic: "j5",
    universe: "fraud",
    title: "The no-pending eight",
    brief:
      "From: Fraud spot-check desk. Re: pipeline-quiet accounts.\n\nThe counterpart to the exposure list: customers with NO pending order right now — accounts with nothing in limbo. The status filter must ride INSIDE the join so the never-pending survive as NULL rows for the emptiness test. Name them with their cities, alphabetical. Expect eight.",
    ask: "Customers with zero pending orders (filter inside ON, emptiness test outside): name and city.",
    template: `SELECT c.name, c.city
FROM customers c
{1} orders o ON {2} {3} o.status = {4}
WHERE o.{5} IS NULL
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "Only LEFT JOIN lets customers without pending orders survive as NULL rows. A plain JOIN returns just the 14 pending rows and the anti-join finds nothing.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "orders.customer_id → customers.id is the real thread. o.id = c.id would match pending order ids 1–16 against customer ids and fabricate survivors.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the ON-combinator",
        why: "AND keeps the status filter inside the match condition — customers with no PENDING match survive as NULL rows. WHERE in that slot moves the filter out and destroys the anti-join.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status literal",
        why: "The hunted state is 'pending' — quoted text. 'shipped' would hunt customers with no shipped order: a different, larger population.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the existence column",
        why: "o.id IS NULL certifies no pending row matched. o.total IS NULL is equivalent here but o.customer_id can't be — testing a never-null column finds zero rows.",
      },
    ],
    distractors: ["JOIN", "o.id = c.id", "WHERE", "'shipped'", "c.id"],
    walkthrough:
      "Anti-join with a twist — the filter must live in the ON clause. LEFT JOIN with AND o.status = 'pending' preserves every customer: 14 pending rows for the eight accounts that have them, NULL rows for everyone else; IS NULL then keeps exactly the never-pending eight — Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown. Put the filter in WHERE instead and the NULL rows fail the status test before the emptiness check ever runs: zero rows, assertion dead. One keyword of placement (AND vs WHERE) is the difference between a working control and a silent one.",
  },
  {
    id: "cs-341",
    tier: "hard",
    topic: "j5",
    universe: "expense",
    title: "Unbilled exposure",
    brief:
      "From: Spend analyst. Re: the receivables gap, in money.\n\nOne number for the working-capital memo: how much invoiced money has no cash behind it — count of unpaid invoices and their total value. The anti-join must preserve the unpaid side, and the money math must run on the INVOICE amounts, not the (absent) payments.",
    ask: "Count of invoices with zero payments, and their total amount in whole units.",
    template: `SELECT {1}(*) AS unpaid, ROUND(SUM({2}) / {3}, 2) AS exposure
FROM invoices i
{4} payments p ON p.invoice_id = i.id
WHERE p.id IS {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The headcount of unpaid invoices: COUNT(*). SUM(*) is invalid SQL over a placeholder.",
      },
      {
        answer: "i.amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "Owed money lives on the INVOICE. p.amount_cents is NULL on every preserved row here — the anti-join's whole point — so summing it returns NULL, not the exposure.",
      },
      {
        answer: "100.0",
        kind: "number",
        label: "the unit divisor",
        why: "Cents to units needs 100.0 — the decimal keeps the division float so pennies survive rounding.",
        noVerify: true,
      },
      {
        answer: "LEFT JOIN",
        kind: "keyword",
        label: "the preserving join",
        why: "LEFT JOIN keeps unpaid invoices as NULL rows for IS NULL to catch. A plain JOIN returns only paid invoices — the unpaid set would be empty and the memo would print zeros.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness test",
        why: "'No payment' is p.id IS NULL. IS NOT NULL counts the 21 paid invoices — the complement of the gap.",
      },
    ],
    distractors: ["SUM", "i.number", "10.0", "JOIN", "NOT"],
    walkthrough:
      "The anti-join goes financial: LEFT JOIN payments, keep IS NULL survivors, then aggregate over the SURVIVING side — invoice amounts. Run it and the memo gets both numbers: 6 unpaid invoices worth 15,217.00. The classic corruption is summing p.amount_cents — every one of those is NULL on the preserved rows, so the 'exposure' prints as NULL and the memo goes out blank. The divisor trap is quieter: the wrong scale (10.0 instead of 100.0) misprints the memo by an order of magnitude, and an integer divisor floors the pennies away — 100.0 keeps cents exact until ROUND cleans up. Count and value in one row, both honest to the same preserved population.",
  },
  {
    id: "cs-342",
    tier: "easy",
    topic: "j6",
    universe: "funnel",
    title: "Same-region teammates",
    brief:
      "From: Marketing lead. Re: regional clustering stat.\n\nFor the regional narrative I want a pairing stat: how many distinct customer pairs share a region? Each pair counted once — no self-pairs, no double-counting. One number for the slide.",
    ask: "Count of distinct customer pairs (a.id < b.id) sharing the same region.",
    template: `SELECT {1}(*) AS pairs
FROM customers a
JOIN customers b ON {2} AND a.id {3} b.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total is a row count: COUNT(*). SUM(*) errors — the placeholder isn't a column.",
      },
      {
        answer: "a.region = b.region",
        kind: "keyword",
        label: "the pairing condition",
        why: "Teammates share a region: a.region = b.region. a.name = b.name would pair a customer with themselves — every name is unique here.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id counts each pair once and never pairs a row with itself. <= would include 16 self-pairs; = would count only the 16 self-matches.",
      },
    ],
    distractors: ["SUM", "a.name = b.name", "<=", "="],
    walkthrough:
      "A self-join is one table wearing two aliases: a and b are both customers, and the ON clause defines what 'paired' means. a.region = b.region finds same-region rows; the guard a.id < b.id is what turns a cross-match into a pair list — strictly less-than kills self-pairs (a row can't be less than itself) and the direction kills mirror duplicates (Alice–Bruno counted once, not twice). Run it and the slide gets 39: EU's eight customers pair 28 ways, APAC's five pair 10, US's two pair 1 — LATAM's lone customer pairs with nobody. One number, three stories.",
  },
  {
    id: "cs-343",
    tier: "medium",
    topic: "j6",
    universe: "fraud",
    title: "Order twins",
    brief:
      "From: Fraud spot-check desk. Re: repeat-order pattern baseline.\n\nBefore we flag anything, we need the baseline: how many distinct order pairs exist within the same customer's book? Same customer, two different orders, each pair once. This number is the denominator every 'suspicious clustering' claim gets divided by.",
    ask: "Count of distinct order pairs (o1.id < o2.id) belonging to the same customer.",
    template: `SELECT {1}(*) AS pairs
FROM orders o1
{4} orders o2 ON {2} AND o1.id {3} o2.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a pair count: COUNT(*). SUM(*) is invalid over the placeholder token.",
      },
      {
        answer: "o1.customer_id = o2.customer_id",
        kind: "keyword",
        label: "the same-customer condition",
        why: "'Within one customer's book' is matching customer ids across the aliases. o1.id = o2.id with a less-than guard can never both hold — zero rows forever.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "o1.id < o2.id counts each pair once, self-pairs impossible. <= would add every order's self-match; != would count both directions.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "Pair-matching is an inner self-join: rows survive only when a partner exists. A LEFT JOIN would pad in 16 unmatched rows — the biggest-order-per-customer leftovers.",
      },
    ],
    distractors: ["o1.id = o2.id", "<=", "!=", "LEFT JOIN"],
    walkthrough:
      "Orders paired with orders, same customer, counted once: the guard o1.id < o2.id does the hygiene — no self-pairs, no mirrors. Run it and the baseline is 624 pairs across the book, and the distribution is the real story: Alice Chen's 24 orders alone contribute 276 pairs (24 choose 2), Emma's 17 contribute 136 — two customers own over half the pairing universe, so 'many pairs' usually means 'one heavy account', not collusion. Swap the guard to <= and self-pairs inflate the count by 103 (every order paired with itself) — a baseline quietly wrong in exactly the direction that creates false positives.",
  },
  {
    id: "cs-344",
    tier: "hard",
    topic: "j6",
    universe: "growth",
    title: "Alice's order twins",
    brief:
      "From: Head of Growth. Re: the Alice deep-dive.\n\nFor the Alice Chen case study I need her repeat-activity footprint: how many distinct pairs of orders sit inside her 24-order book? Pin the pairing to her account, keep the once-only guard, and report the single number her case study hangs on.",
    ask: "Count of same-customer order pairs (o1.id < o2.id) for customer 1 only.",
    template: `SELECT {1}(*) AS pairs
FROM orders o1
JOIN orders o2 ON {2} AND o1.id {3} o2.id
WHERE o1.customer_id = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number requested: COUNT(*). SUM(*) errors on the placeholder.",
      },
      {
        answer: "o1.customer_id = o2.customer_id",
        kind: "keyword",
        label: "the same-customer condition",
        why: "Pairs must live inside one account — matching the two aliases' customer ids. Matching order ids contradicts the guard and returns nothing.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "Strict less-than: each pair once, no self-pairs. <= would count her 24 self-matches too — 300 instead of 276.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the pinned customer id",
        why: "Alice Chen is customer 1 — the WHERE pin narrows 624 book-wide pairs to her footprint. Customer 2 (Emma) would give her own, smaller number.",
        noVerify: true,
      },
    ],
    distractors: ["o1.id = o2.id", "<=", "=", "2"],
    walkthrough:
      "The book-wide pairing query (624 pairs) narrowed to one account by the WHERE pin. Alice Chen is customer 1; her 24 orders pair among themselves — 24 choose 2, which is 24×23÷2 = 276. The guard operator is the audit trail: strict < means every pair appears once with the smaller id first, and self-pairs are arithmetically impossible. Watch the near-misses: <= returns 300 (her 276 real pairs plus 24 self-matches), = returns 24 (only the self-matches), and pinning customer 2 gives Emma's 136. Same query, four numbers — the guard and the pin are where the meaning lives.",
  },
  {
    id: "cs-345",
    tier: "hard",
    topic: "j6",
    universe: "funnel",
    title: "One city, one customer",
    brief:
      "From: Marketing lead. Re: the city-pairing hypothesis.\n\nSomeone hypothesized 'customers in the same city order alike' — step one is testing whether same-city PAIRS even exist. Build the guarded city self-join and run it. If the result is zero, the hypothesis isn't weak — it's vacuous, and you'll have proven it with the same query shape that found 39 region pairs.",
    ask: "Count of distinct same-city customer pairs (a.id < b.id) — expect zero, and understand why.",
    template: `SELECT {1}(*) AS same_city_pairs
FROM customers a
{4} customers b ON {2} AND a.id {3} b.id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A pair total: COUNT(*). SUM(*) errors over the placeholder.",
      },
      {
        answer: "a.city = b.city",
        kind: "keyword",
        label: "the pairing condition",
        why: "'Same city' is city equality across the aliases. a.region = b.region would silently answer the REGION question — 39 pairs — under this query's city label.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the guard operator",
        why: "a.id < b.id: pairs once, no self-pairs. <= would return 16 — every customer's self-match — masquerading as evidence.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "With zero matches an inner join returns zero rows — correct. A LEFT JOIN would return 16 NULL-padded rows, manufacturing fake 'pairs' that never existed.",
      },
    ],
    distractors: ["SUM", "a.region = b.region", "<=", "LEFT JOIN"],
    walkthrough:
      "Same self-join shape as the region stat — COUNT over a guarded, aliased pairing — aimed at cities. Run it and the answer is 0, and the zero is informative: this book's sixteen customers live in sixteen DIFFERENT cities, so same-city pairs cannot exist and the 'order alike' hypothesis has no population to test. The traps are all substitution traps: region under the city label returns 39 (a true number answering the wrong question), <= returns 16 self-pairs (fake evidence), LEFT JOIN pads 16 NULL rows that LOOK like pairs. A vacuous result and a broken query look identical on screen — the query shape is what tells them apart.",
  },
  {
    id: "cs-346",
    tier: "medium",
    topic: "j7",
    universe: "pricing",
    title: "City revenue ranking",
    brief:
      "From: Pricing committee. Re: where the money lives, city edition.\n\nRank cities by joined order revenue — sum of order totals per city through the customer join — top three only, with the revenue rounded to cents. One caveat to respect: on this book, city and customer are the same thing, so the ranking will read like a customer list. That's fine; say so in the footnote.",
    ask: "Top 3 cities by total order revenue (Σ o.total, rounded), biggest first.",
    template: `SELECT c.city, {1}(o.total) AS revenue
FROM customers c
JOIN orders o ON {2}
GROUP BY c.city
ORDER BY revenue {3}
LIMIT {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregate",
        why: "Revenue per city is totals summed: SUM(o.total). COUNT would rank cities by order count — volume, not money.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the join condition",
        why: "City rides the account thread: orders.customer_id → customers.id. o.id = c.id would revenue-rank a fabricated population.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Richest city on top: DESC. ASC would open the committee with the smallest book.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the city cap",
        why: "Top three: LIMIT 3. A cap of 16 would list every city including one-order London and Cork.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "o.id = c.id", "ASC", "16"],
    walkthrough:
      "Grouped revenue over a join: attach each order to its customer's city, SUM the totals, sort down, trim to three. Run it and Berlin leads at 7,262.35, Austin follows at 6,640.56, Seoul at 4,574.23 — and the footnote writes itself: every city hosts exactly one customer, so Berlin's crown is Alice Chen's 24-order book, Austin's is Emma Wilson's 17. The committee is really looking at customer concentration wearing a city costume, which is precisely why the footnote matters — revenue geography you can't act on regionally is a customer story, not a market story.",
  },
  {
    id: "cs-347",
    tier: "medium",
    topic: "j7",
    universe: "inventory",
    title: "Units vs distinct orders",
    brief:
      "From: Warehouse ops. Re: fan-out literacy drill.\n\nOne query, two truths: total units shipped, and the number of DISTINCT orders those units came from — computed over the joined lines so the fan-out is in play. If the second count comes back equal to the line count, the DISTINCT is missing and the number lies.",
    ask: "One row: total units (Σ quantity) and COUNT of DISTINCT orders over joined lines.",
    template: `SELECT SUM({1}) AS units, COUNT({2} o.id) AS orders
FROM orders o
{3} order_items oi ON {4};`,
    slots: [
      {
        answer: "quantity",
        kind: "keyword",
        label: "the units column",
        why: "Physical units live in order_items.quantity. unit_price sums to money; oi.id sums id numbers — neither is a weight.",
      },
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup keyword",
        why: "The join fans each order out once per line (103 orders → 251 rows). COUNT(DISTINCT o.id) collapses back to 103 real orders; without it the count lies by the fan-out factor.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the join keyword",
        why: "The drill requires the joined context — lines exist only after order_items joins. UNION cannot appear in FROM.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id is the real parent-child link. oi.id = o.id keeps only the 103 id-coincidence lines and poisons both numbers.",
      },
    ],
    distractors: ["unit_price", "id", "UNION", "ALL", "oi.id = o.id"],
    walkthrough:
      "The fan-out literacy drill: after the join, the result has 251 rows — one per line — so SUM(quantity) reads 498 units honestly (each unit counted where it shipped), while a bare COUNT(o.id) would read 251 and claim 251 orders. The DISTINCT is the correction: COUNT(DISTINCT o.id) = 103, the real order count. One row, two truths, both correct because each aggregate respects the grain it reports on. Swap DISTINCT for ALL and the drill demonstrates its own lesson — ALL is the default, the count inflates to 251, and the difference (148) is exactly the fan-out this query exists to teach.",
  },
  {
    id: "cs-348",
    tier: "medium",
    topic: "j7",
    universe: "pricing",
    title: "Category units and revenue",
    brief:
      "From: Pricing committee. Re: volume vs value by category.\n\nFor the mix review: per category, units moved and realized revenue — revenue computed at the LINE grain as quantity times unit price, summed over joined lines. Rank by revenue. The interesting column is where the two disagree.",
    ask: "Per category: units (Σ quantity) and line-grain revenue (Σ quantity × unit_price), by revenue.",
    template: `SELECT p.category, SUM(oi.quantity) AS units, ROUND(SUM(oi.{1}), 2) AS revenue
FROM order_items oi
JOIN products p ON {2}
GROUP BY {3}
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "quantity * unit_price",
        kind: "keyword",
        label: "the revenue expression",
        why: "Line revenue is quantity × unit_price — both line columns multiplied per row, then summed. unit_price alone sums the price of ONE unit per line, ignoring how many moved.",
      },
      {
        answer: "p.id = oi.product_id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.product_id → products.id attaches the category. p.id = oi.order_id pairs catalog ids with order numbers.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the group key",
        why: "The buckets are categories: GROUP BY p.category. Grouping by p.id would report 16 one-product rows — a catalog listing, not a mix review.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'By revenue' with the biggest story on top: DESC. ASC would lead with Fitness's single-product book.",
      },
    ],
    distractors: ["unit_price", "quantity", "p.id = oi.order_id", "p.id", "ASC"],
    walkthrough:
      "Two aggregates, two grains, one join: units is Σ(quantity) — raw volume — while revenue is Σ(quantity × unit_price), the per-line money product. The expression slot is the case's spine: forgetting the quantity and summing unit_price alone prices every line at one unit, and Accessories' 62-line, 121-unit book would report a third of its real 3,294.29. Run it and Audio leads at 11,744.01 on 97 units; Accessories sits fifth by revenue (3,294.29) despite leading units at 121. Volume and value disagree — that's the mix story the committee scheduled this review for.",
  },
  {
    id: "cs-349",
    tier: "medium",
    topic: "j7",
    universe: "expense",
    title: "Top books at the line grain",
    brief:
      "From: Spend analyst. Re: the expense-side mirror.\n\nSame money, different lens: rank customers by what their books cost at the line grain — Σ quantity × unit_price over the full three-table chain — and show the top three. This is the expense-side mirror of the growth team's revenue podium; the numbers must reconcile.",
    ask: "Top 3 customers by line-grain spend (Σ quantity × unit_price), biggest first.",
    template: `SELECT c.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM {1} c
JOIN orders o ON {2}
JOIN order_items oi ON {3}
GROUP BY c.id
ORDER BY spend {4}
LIMIT {5};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the base table",
        why: "Books belong to customers — the chain starts at the account. 'orders' aliased as c dissolves the customer grain.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the first join",
        why: "orders.customer_id → customers.id is the account thread. o.id = c.id reroutes spend through an id coincidence.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the second join",
        why: "order_items.order_id → orders.id reaches the line grain. oi.id = o.id keeps only the 103 id-coincidence lines.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest spend on top: DESC. ASC would surface the one-order accounts as the 'top' books.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the row cap",
        why: "Top three: LIMIT 3 — the mirror of the growth podium. A cap of 16 would list every account.",
        noVerify: true,
      },
    ],
    distractors: ["orders", "o.id = c.id", "oi.id = o.id", "ASC", "16"],
    walkthrough:
      "Three-table chain, one money expression, one podium: customers → orders → lines, Σ(quantity × unit_price) per customer, sorted down, capped at three. Run it and the mirror reconciles exactly with the growth team: Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23. That reconciliation is the point — the same rows joined through the same real foreign keys produce the same money regardless of which department asks, and any gap between the two teams' numbers is a join-key bug, not a business story. The chain discipline IS the audit control.",
  },
  {
    id: "cs-350",
    tier: "hard",
    topic: "j7",
    universe: "inventory",
    title: "Rows and money after the fan-out",
    brief:
      "From: Warehouse ops. Re: the inflation number, quantified.\n\nFinance flagged our joined-line report as 'inflated'. Quantify it: over the orders-to-lines join, count the joined rows and sum the order totals on them — then the same two numbers for the pending slice only. The gap between the bare and joined figures is the inflation the memo needs.",
    ask: "For pending orders: joined row count and SUM of order totals over the joined rows.",
    template: `SELECT {1}(*) AS rows_after_join, ROUND({2}({3}), 2) AS inflated_total
FROM orders o
JOIN order_items oi ON {4}
WHERE o.status = {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the row counter",
        why: "Joined rows are counted with COUNT(*). SUM(*) errors — the '*' is a placeholder, not a column.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "The inflated money figure is SUM over the joined rows. COUNT would put a row count where a currency belongs.",
      },
      {
        answer: "o.total",
        kind: "keyword",
        label: "the inflated money column",
        why: "o.total repeats once per joined line — that repetition IS the inflation. Σ(quantity × unit_price) would sum the honest line money instead.",
      },
      {
        answer: "oi.order_id = o.id",
        kind: "keyword",
        label: "the join condition",
        why: "order_items.order_id → orders.id creates the fan-out being measured. oi.id = o.id measures a coincidence instead.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status slice",
        why: "The memo's slice is pending orders — quoted text. 'shipped' would audit the 30-order delivered-history slice instead.",
      },
    ],
    distractors: ["SUM", "COUNT", "oi.quantity * oi.unit_price", "oi.id = o.id", "'shipped'"],
    walkthrough:
      "This case quantifies the fan-out the module keeps warning about. Book-wide: 103 orders carrying 34,833.28 become 251 joined rows carrying 103,244.55 — ×2.44 on rows, ×2.96 on money, because every order's total repeats once per line (an order with 4 lines counts its total 4 times). The pending slice shows the same mechanics at work: 36 joined rows, and the summed o.total across them is inflated by exactly each pending order's line count. The honest alternative sits in the distractor slot: Σ(quantity × unit_price) is the line-grain money that never inflates. Count the rows, sum the wrong column once, and you'll never forget which is which.",
  },
];

