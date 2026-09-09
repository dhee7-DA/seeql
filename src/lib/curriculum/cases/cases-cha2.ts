// Case Files — hard-tier batch HA2 (cs-270..279): catalog, pricing, inventory,
// supplier and expense universes. Authored against scripts/facts + the live
// seed db; audited by scripts/case-audit.ts. Companion to cases-chb2.ts
// (cs-280..300), which finishes the M1 100/100/100 tier program.

import type { CaseStudy } from "./types";

export const casesCHa2: CaseStudy[] = [
  {
    id: "cs-270",
    tier: "hard",
    topic: "l5",
    universe: "catalog",
    title: "Cheapest three with real headroom",
    brief:
      "From: Warehouse ops. Re: the tag-print queue.\n\nThe tag printer queues the three cheapest items that also carry real headroom — at least a hundred units on the shelf — so we are not printing labels for display pieces we can barely fulfill. Cheapest first, and keep the sheet to three lines.",
    ask: "Name, price and stock of the three cheapest products holding 100 or more units, cheapest first.",
    template: `SELECT name, price, stock
FROM products
WHERE stock {1} {2}
ORDER BY {3} {4}
LIMIT {5};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the headroom test",
        why: "At least a hundred units is a floor, so >= keeps every shelf at or above 100. A strict > would silently drop an item sitting exactly on 100 — the boundary rows are exactly the ones ops argues about.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the headroom floor",
        why: "Ops set the bar at 100 units. Numbers never take quotes — a quoted '100' is text and matches nothing.",
        noVerify: true,
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the ranking key",
        why: "Cheapest first is a price ranking, so price drives the ORDER BY. Sorting by name would alphabetize the shelf, and sorting by stock would rank by how much we hoard, not what the tag costs.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Cheapest first is ascending price — ASC is technically the default, but stating it pins the intent. DESC would serve the 199.99 smart watch first, the exact opposite of the queue's purpose.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the queue size",
        why: "The printer queue holds three labels, so LIMIT 3 trims the finished ranking. The limit applies after the sort, so the cut lands on the finished cheapest-first list.",
        noVerify: true,
      },
    ],
    distractors: ["<", "DESC", "name", "category", "300"],
    walkthrough:
      "Two filters and a rank, in the right order: WHERE first (stock >= 100 keeps ten of the sixteen products), then ORDER BY price ASC turns the survivors into a cheapest-first ranking, then LIMIT 3 cuts the queue. The sheet prints the HDMI cable at 14.99 with 500 units, the running socks at 18.50 with 400, and the desk mat at 24.99 with 260. The yoga mat at 32.00 is first out — it cleared the headroom test just fine, but only three labels fit. That is the habit worth stealing: LIMIT cuts the finished ranking, so decide the sort before you decide the cut.",
  },
  {
    id: "cs-271",
    tier: "hard",
    topic: "l3",
    universe: "catalog",
    title: "Mid-shelf band, stock-capped",
    brief:
      "From: Category manager. Re: the mid-shelf review.\n\nI want the mid-shelf on one sheet: everything priced from 18 up to 60, but only where the stockroom is not drowning in it — 400 units or fewer on hand. Price order, cheapest first, so the review reads like a ladder.",
    ask: "Name, category, price and stock of products priced between 18 and 60 with no more than 400 units in stock, cheapest first.",
    template: `SELECT name, category, price, stock
FROM products
WHERE price BETWEEN {1} AND {2} AND stock {3} {4}
ORDER BY {5} ASC;`,
    slots: [
      {
        answer: "18",
        kind: "number",
        label: "the band floor",
        why: "The lower bound of the mid-shelf. BETWEEN is inclusive on both ends, so an item priced exactly 18 would make the sheet — the bounds are part of the band, not outside it.",
        noVerify: true,
      },
      {
        answer: "60",
        kind: "number",
        label: "the band ceiling",
        why: "The upper bound of the mid-shelf, inclusive like the floor. The Bluetooth speaker at 59.99 squeaks under it.",
        noVerify: true,
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the stock cap test",
        why: "No more than 400 units is a ceiling, so <=. The socks sit exactly on 400 and the manager said 'no more than' — boundary language means the edge stays in.",
      },
      {
        answer: "400",
        kind: "number",
        label: "the stock cap",
        why: "Ops caps the sheet at 400 on-hand units so the review focuses on lines that will actually move.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the ladder key",
        why: "Cheapest first is a price ordering. Ordering by name would alphabetize the review; by stock would rank by hoarding.",
      },
    ],
    distractors: ["OR", ">=", "<", "DESC", "MAX", "180"],
    walkthrough:
      "AND binds two independent tests: the price must live inside the 18–60 band and the stock must sit at or under 400 — a row qualifies only when both hold. Eight lines survive: the socks at 18.50 (exactly on the 400 cap, which is why <= matters), the desk mat, the yoga mat, the mouse, the ring light, the laptop stand, the USB-C hub at just 85 units, and the Bluetooth speaker at 59.99, squeezing under the 60 ceiling. Swap AND for OR and the sheet explodes — every cheap item plus every capped item, with rows meeting neither test sneaking in. The ladder reads cheapest first because the review is about price positions, and BETWEEN's inclusive edges mean both boundary prices would print if stock ever sat exactly on 18 or 60.",
  },
  {
    id: "cs-272",
    tier: "hard",
    topic: "l7",
    universe: "pricing",
    title: "The mouse never sells at sticker",
    brief:
      "From: Retail pricing analyst. Re: register-price spread check.\n\nThe catalog lists the Wireless Mouse M3 at one price, but the register disagrees line by line — discounts, surcharges, whatever the promotions team did that week. Pull the spread for that product alone: how many register lines it has, the cheapest and dearest it ever rang, and the mean it averages out to, rounded to two decimals.",
    ask: "Line count, minimum unit price, maximum unit price and the average unit price (2 decimals) across all order lines of product 2.",
    template: `SELECT {1}(*) AS register_lines,
       {2}(unit_price) AS floor_price,
       MAX({3}) AS ceiling_price,
       ROUND({4}(unit_price), 2) AS typical_price
FROM order_items
WHERE product_id = {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line tally",
        why: "How many register lines exist is a row count, so COUNT(*). SUM(*) is not valid SQL and ROUND cannot count.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "The cheapest the mouse ever rang is MIN over unit_price. MAX would print the ceiling twice and AVG would print a number no receipt actually shows.",
      },
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the measured column",
        why: "The spread lives in unit_price — the price actually charged per unit on each line. quantity counts units sold, and order_id is just the ticket number.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "The typical price is the mean, so AVG inside the ROUND. MIN would report the floor again, and SUM would print a total no one asked for.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the product under audit",
        why: "The Wireless Mouse M3 is product 2 — an integer key, never quoted. The id itself never prints; it only pins which lines the aggregates read.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "MAX", "order_id", "quantity", "ROUND"],
    walkthrough:
      "Four cells, one row, zero grouping: the WHERE pins the query to product 2, and the four aggregates each answer one stakeholder question about the same 18 lines. The register spread runs from 32.79 to 35.93 — the mouse never sells at its sticker — yet the average lands back on exactly 34.5, the catalog price: the discounts and markups wash out across the book. That is the punchline of the case — a mean can restore a number no single row contains. Note what the query does NOT do: no GROUP BY, because one product filtered by WHERE is already a single bucket, and adding one would be ceremony, not logic.",
  },
  {
    id: "cs-273",
    tier: "hard",
    topic: "l4",
    universe: "pricing",
    title: "The deferred pot: booked, not shipped",
    brief:
      "From: Finance systems. Re: the deferred-revenue cell.\n\nRevenue we can book is revenue that has left the building — everything still pending is deferred. For the deferred-revenue cell I need the count of pending tickets and their booked value, on one row, every morning, even on the day the queue finally empties: the value cell must read 0 then, never blank.",
    ask: "Count of pending orders with no dispatch stamp plus their total booked value, where an emptied queue must still print 0 in the value cell.",
    template: `SELECT {1}(*) AS stuck_tickets,
       {2}(SUM(total), {3}) AS stuck_value
FROM orders
WHERE status = {4} AND shipped_at {5} {6};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ticket tally",
        why: "Counting stuck tickets is COUNT(*). SUM(*) is not valid SQL, and ROUND cannot count rows.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the null-proof wrapper",
        why: "SUM over an emptied queue returns NULL, and NULL prints as a blank cell. COALESCE stands guard: take the sum, and if it comes back NULL, print the fallback instead.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the clean-zero fallback",
        why: "The cell must read 0 — 'checked, nothing deferred' — not a blank that reads as 'not checked'. The fallback only fires when the sum is NULL, which today it never is.",
        noVerify: true,
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the stage under test",
        why: "Deferred means still pending — quoted as a text value. 'shipped' and 'delivered' orders have left the building, and 'cancelled' orders are dead, not deferred.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness operator",
        why: "A missing stamp is tested with IS NULL. The everyday = reads NULL as unknown and matches nothing — the silent false-clean that makes a deferred report lie.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "shipped_at IS NULL is the exact predicate for 'never dispatched'. IS and NULL form one two-word operator — either half alone is a syntax error or a different test.",
      },
    ],
    distractors: ["SUM", "AVG", "MIN", "IS NOT", "="],
    walkthrough:
      "Today the guard looks decorative: all 14 pending orders lack a stamp, the sweep matches 14 rows, SUM(total) returns 6113 and COALESCE passes it through untouched. The guard earns its keep the day the queue empties — say a month-end push ships everything — because then SUM over zero rows returns NULL, and without COALESCE the cell would print blank, which every reader parses as 'someone forgot to run it'. With the wrapper, the same morning prints 0 tickets and 0 value: checked, clean. Note the two traps sitting in plain sight: status = 'pending' must be quoted text, and shipped_at IS NULL cannot become shipped_at = NULL — the equality reads NULL as unknown and quietly matches nothing, turning a 14-ticket pot into an invisible one.",
  },
  {
    id: "cs-274",
    tier: "hard",
    topic: "l3",
    universe: "inventory",
    title: "Deep shelves or the audio wall",
    brief:
      "From: Inventory control. Re: the count-week shortlist.\n\nCount week wants two kinds of shelves on the shortlist: anything sitting on 220 or more units, because deep stock miscounts are expensive — plus the entire Audio wall regardless of depth, because the new scanner loses Bluetooth there and gets counted twice by hand. Deepest first.",
    ask: "Name, category and stock of products with 220 or more units OR in the Audio category, deepest stock first.",
    template: `SELECT name, category, stock
FROM products
WHERE stock {1} {2} {3} category = {4}
ORDER BY stock {5};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the depth test",
        why: "220 or more is a floor, so >=. A strict > would drop a product sitting exactly on 220 — and the yoga mat does, at exactly 220.",
      },
      {
        answer: "220",
        kind: "number",
        label: "the depth bar",
        why: "Count week draws the deep-stock line at 220 units, a number that itself prints on the sheet — the yoga mat sits exactly on it and stays on the list.",
      },
      {
        answer: "OR",
        kind: "keyword",
        label: "the union connector",
        why: "A row qualifies by EITHER test — deep stock or the Audio wall — so OR. AND would demand both, and no Audio product is that deep: the wall would vanish.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the wall category",
        why: "The scanner-blind wall is Audio — quoted as a text value. 'Video' or 'Wearables' would pull the wrong wall entirely.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the depth order",
        why: "Deepest first is descending stock. ASC would open the sheet with the thinnest shelf, exactly backwards for a count-week shortlist.",
      },
    ],
    distractors: ["AND", "<", ">", "'Wearables'", "ASC"],
    walkthrough:
      "OR unions two different reasons to count a shelf: five products clear the 220 bar (the HDMI cable at 500 down to the yoga mat at exactly 220), and the Audio wall joins on category alone — the speaker at 210, the headset at 60, the mic at 45. Eight shelves make the list, deepest first. Run the same line with AND and the shortlist collapses to five: no Audio product is anywhere near 220, so the wall the scanner struggles with would vanish from the very sheet meant to protect it. That is the OR lesson in miniature — AND intersects reasons, OR adds them, and the boundary row matters: the yoga mat at exactly 220 survives >= but not >.",
  },
  {
    id: "cs-275",
    tier: "hard",
    topic: "l6",
    universe: "inventory",
    title: "Which aisles run deep?",
    brief:
      "From: Count-week coordinator. Re: the aisle shortlist.\n\nThe shortlist is not products, it's aisles: give me every category that owns at least one shelf of 220 or more units, one row per category, alphabetical. And make it honest — if two deep products share a category, that aisle must still print once.",
    ask: "The distinct categories that hold at least one product with 220 or more units, one row each, alphabetical.",
    template: `SELECT DISTINCT {1}
FROM products
WHERE {2} {3} {4}
ORDER BY category {5};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the deduplicated column",
        why: "The deliverable is aisles, so DISTINCT collapses category. Running DISTINCT on name would 'deduplicate' products that can never repeat and answer nothing.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the tested column",
        why: "Depth lives in stock — the on-hand count. Filtering on price would shortlist aisles by cost, and on id by registration order.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the depth test",
        why: "220 or more is a floor, so >=. The yoga mat sits exactly on 220 and its aisle must make the list — a strict > would erase Fitness for the sake of one unit.",
      },
      {
        answer: "220",
        kind: "number",
        label: "the depth bar",
        why: "Count week's deep-stock line. The bound itself never prints — the sheet lists categories — but the boundary decides which aisles qualify.",
        noVerify: true,
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the alphabetical order",
        why: "Alphabetical is ascending. DESC would run the shortlist from Wearables down and read backwards to the coordinators.",
      },
    ],
    distractors: ["ALL", "<", "COUNT", "DESC", "name"],
    walkthrough:
      "DISTINCT answers a question about kinds, not rows: five products clear the 220 bar, but two of them — the HDMI cable and the desk mat — share Accessories, so the aisle list prints four names, not five. Swap DISTINCT for ALL and the duplicate aisle prints twice, and the coordinator sends two teams to the same shelf. The WHERE runs before the collapse: stock is filtered product by product, and only the survivors get deduplicated — order of operations that matters, because a DISTINCT cannot rescue a WHERE that kept the wrong shelves. Note the shape: one column in, one column out — DISTINCT earns its keep on exactly the columns it collapses, and ordering the collapsed list alphabetically (ASC) makes the shortlist checkable by eye.",
  },
  {
    id: "cs-276",
    tier: "hard",
    topic: "l8",
    universe: "supplier",
    title: "The supplier report card, ties settled",
    brief:
      "From: Procurement lead. Re: the quarterly supplier card.\n\nOne row per region: how many partners we hold there and their average rating to two decimals, best region first. Last quarter the card embarrassed us — two regions tied on the average and the rows came out in whatever order the database felt like. Settle ties by region name, A to Z, so the card prints the same way every time.",
    ask: "Each supplier region with its partner count and average rating (2 decimals), best average first, region name A-to-Z breaking ties.",
    template: `SELECT region, {1}(*) AS partners,
       ROUND({2}(rating), 2) AS avg_rating
FROM suppliers
GROUP BY {3}
ORDER BY avg_rating {4}, region {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the partner tally",
        why: "Partners per region is a row count, so COUNT(*). SUM(*) is not valid SQL, and ROUND cannot count.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the rating aggregate",
        why: "An average rating is AVG inside the ROUND. MIN or MAX would print one supplier's rating as the whole region's grade.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the bucketing key",
        why: "One row per region means GROUP BY region. Grouping by rating or name would shard the book into per-supplier specks and the card would list six rows of one.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the headline direction",
        why: "Best region first is descending average rating. ASC would crown the weakest region — an inverted report card.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the tie-break direction",
        why: "A-to-Z is ascending region name — the rule that makes the card deterministic. APAC and LATAM tie at exactly 4.0, so without this second key their order is a coin flip that changes run to run.",
      },
    ],
    distractors: ["SUM", "MIN", "MAX", "rating", "DESC"],
    walkthrough:
      "Two aggregates, one bucket: GROUP BY region folds six suppliers into four rows, and COUNT + AVG grade each fold — EU leads at 4.70 across two partners, the US holds 4.40, and then the trap: APAC and LATAM both average exactly 4.00. A single sort key leaves that pair's order undefined, which is precisely the embarrassment the lead described — so the second key, region ASC, prints APAC before LATAM, every time, on every machine. Read the card as procurement would: EU's 4.70 is a real grade on two suppliers; the US 4.40 rests on one partner, so it moves the moment that relationship moves. Aggregates summarize, but the GROUP BY choice decides what 'one supplier' even means on the card.",
  },
  {
    id: "cs-277",
    tier: "hard",
    topic: "l5",
    universe: "supplier",
    title: "The A-list, best foot first",
    brief:
      "From: Procurement lead. Re: the renewal shortlist.\n\nRenewals go to the A-list: any partner rated 4.2 or better, highest rating first, and only the top two make the meeting. Keep it to id, name and rating — the card is pinned to the wall, not filed.",
    ask: "Id, name and rating of suppliers rated 4.2 or higher, best first, capped at two rows.",
    template: `SELECT id, name, rating
FROM suppliers
WHERE rating {1} {2}
ORDER BY {3} {4}
LIMIT {5};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the A-list test",
        why: "4.2 or better is a floor, so >=. There is no supplier at exactly 4.2 today, so > happens to match — until one does, and the strict sign silently bars a qualifying partner from its own meeting.",
      },
      {
        answer: "4.2",
        kind: "number",
        label: "the A-list bar",
        why: "Procurement draws the line at 4.2. Ratings are REAL numbers — 4.2, never a quoted '4.2', which is text and matches nothing.",
        noVerify: true,
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the ranking key",
        why: "Best first is a rating ranking. Ordering by id would seat whoever registered first, and by name would alphabetize the partnership.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Highest rating first is DESC. ASC would serve the 3.9 partner as the headline act of a renewal meeting.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the meeting cap",
        why: "Only the top two make the meeting, so LIMIT 2 cuts the finished ranking. The cut lands after the sort — decide the order before the cap.",
        noVerify: true,
      },
    ],
    distractors: ["<=", "ASC", "id", "5", "MAX"],
    walkthrough:
      "The A-list query is three decisions in a trench coat: the >= 4.2 floor admits three partners (Alpine at 4.8, Nordic at 4.6, Midwest at 4.4), rating DESC stacks them best-first, and LIMIT 2 seats the top two — Alpine Audio and Nordic Gadgets. Midwest is first out, and the interesting part is by how little: a 4.4 against a 4.6. Note the boundary hazard on the floor sign — today no supplier sits exactly on 4.2, so >= and > return the same rows, but the sign on the door should still read >=, because '4.2 or better' is what was promised, and the day a 4.2 partner appears, the strict sign locks them out. LIMIT cuts the sorted result, never the raw table — flip those two steps mentally and every 'top N' query breaks.",
  },
  {
    id: "cs-278",
    tier: "hard",
    topic: "l7",
    universe: "expense",
    title: "The big-ticket slice of the spend book",
    brief:
      "From: Controller. Re: the spend summary cell.\n\nFor the board pack I need one row describing the big end of the spend book: how many receipts cleared 25,000 cents, how much they added up to, and the single largest one among them. The full book is noise — this slice is the story.",
    ask: "Count of expenses of 25,000 cents or more, their total in cents, and the largest single amount among them.",
    template: `SELECT {1}(*) AS big_tickets,
       SUM({2}) AS big_spend,
       {3}(amount_cents) AS biggest
FROM expenses
WHERE amount_cents {4} {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the receipt tally",
        why: "How many receipts cleared the line is COUNT(*). AVG cannot count, and SUM(*) is not valid SQL.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the measured column",
        why: "The money lives in amount_cents. SUM over vendor or spent_on would try to add text and print a meaningless 0.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak aggregate",
        why: "The single largest receipt is MAX. MIN would report the smallest big ticket — technically in the slice, but the opposite of 'biggest' — and AVG would print a number no receipt shows.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the slice test",
        why: "25,000 and up is a floor, so >=. The controller said 'cleared 25,000' meaning the line itself counts — boundary language the sign has to match.",
      },
      {
        answer: "25000",
        kind: "number",
        label: "the slice line",
        why: "The big-ticket line sits at 25,000 cents, unquoted — cents are integers, not text. The bound itself never prints; it only decides which receipts are in.",
        noVerify: true,
      },
    ],
    distractors: ["MIN", "AVG", "SUM", "vendor", "<="],
    walkthrough:
      "One WHERE, three answers: the >= 25000 test keeps 34 of the book's 36 receipts, and the aggregates read the slice three ways — COUNT says how many, SUM stacks them into 2,495,600 cents, MAX flags the single 168,000-cent travel bill at the top. The two receipts left under the line are the whole point of the slice: a summary that averaged all 36 would let two small receipts drag the story, and a summary of every receipt would hide it entirely. Note the division of labor in the SELECT — COUNT tallies rows, SUM adds a column, MAX inspects it — and that all three run after WHERE, so the slice is agreed once, then measured three ways.",
  },
  {
    id: "cs-279",
    tier: "hard",
    topic: "l8",
    universe: "expense",
    title: "Vendors that earn a line item",
    brief:
      "From: Controller. Re: the vendor board.\n\nThe vendor board only lists vendors with five or more receipts — one-off bookings go to the appendix. For every vendor that clears the bar: receipt count and total cents, biggest spender first. Two vendors are tied on receipts, and the board must not shuffle them between printings — money settles it, bigger total first.",
    ask: "Each vendor with 5 or more receipts, showing receipt count and total amount in cents, biggest total first.",
    template: `SELECT vendor, {1}(*) AS receipts,
       {2}(amount_cents) AS total_cents
FROM expenses
GROUP BY {3}
{4} COUNT(*) >= {5}
ORDER BY total_cents {6};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the receipt tally",
        why: "Receipts per vendor is a row count, so COUNT(*). MIN cannot count rows and SUM(*) is not valid SQL.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "Total cents per vendor is SUM over amount_cents. AVG would print a per-receipt mean, MAX the single biggest — neither is what the board sums to.",
      },
      {
        answer: "vendor",
        kind: "keyword",
        label: "the bucketing key",
        why: "One row per vendor means GROUP BY vendor. Grouping by category or spent_on would count receipts in the wrong buckets entirely.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "Five-or-more receipts is a fact about the vendor's whole bucket, so the test runs after grouping — HAVING. WHERE cannot see COUNT and the query would not parse.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the board bar",
        why: "The board bar sits at five receipts — a threshold that itself prints on the sheet, since the smallest listed vendor has exactly 5. Lower it to 3 and the one-off vendor sneaks onto the board.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the money order",
        why: "Biggest spender first is DESC on total cents. ASC would open the board with the smallest budget line, and the receipt-count tie (14 against 14) is settled by this money key, not by luck.",
      },
    ],
    distractors: ["AVG", "MAX", "WHERE", "3", "ASC"],
    walkthrough:
      "The pipeline is WHERE-less on purpose: every receipt belongs on some vendor's bucket, GROUP BY vendor folds 36 receipts into four buckets, and HAVING COUNT(*) >= 5 evicts the one vendor with only 3 receipts — the board keeps Atlas (14 receipts, 1,680,000 cents), AdWorks (14, 457,000) and DevTools (5, 152,500). Atlas and AdWorks tie on receipt count at 14 apiece, so a naive ORDER BY receipts would leave their order to chance; sorting by total_cents DESC settles it with money — over a million cents apart. That is the two-layer lesson: HAVING filters buckets WHERE cannot reach, and when a displayed column ties, rank by the column that still separates them.",
  },
];
