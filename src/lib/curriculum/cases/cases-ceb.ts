// Batch C-EB — easy wave B of the 300-case deck expansion: 29 easy cases,
// ids cs-230..cs-258, canonical universe cycle (10 per universe across the
// 100 new cases). One clause family per case, exactly one teach, every
// distractor consequential. Figures probed read-only against the seed db.

import type { CaseStudy } from "./types";

export const casesCEb: CaseStudy[] = [
  {
    id: "cs-230",
    tier: "easy",
    topic: "l2",
    universe: "catalog",
    title: "Depth column for the bin sheet",
    brief:
      "From: Catalog content manager. Re: bin-count sheet for the scanner import.\n\nThe warehouse scanner import expects one row per product with name, shelf category and on-hand depth, but it refuses files whose depth column is labelled anything but units_on_hand. Keep the stock figures exactly as stored and relabel the header only — touch nothing else.",
    ask: "Every product's name, category and stock, with the stock column relabelled to units_on_hand.",
    template: `SELECT name, category, {1} {2} units_on_hand
{3} products;`,
    slots: [
      {
        answer: "stock",
        kind: "keyword",
        label: "the depth column",
        why: "The count sheet tracks how many units sit in each bin, and that number is the stock column. The tempting price chip would swap money for units and the scanner import would choke on it.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the relabel keyword",
        why: "AS renames the stock column to units_on_hand, the exact header the scanner import maps on. Without it the header prints as the bare column name and the import bounces the file.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM products points the read at the catalog. order_items is the purchase ledger with no category or stock columns, so the fill would fail before printing a single row.",
      },
    ],
    distractors: ["price", "IS", "WHERE", "order_items", "SUM"],
    walkthrough:
      "A relabel job, not a math job: stock AS units_on_hand changes only the header the scanner tool reads, while name and category ride through untouched. No WHERE clause — the count sheet covers the whole floor, all 16 products. The sheet opens with Mechanical Keyboard K1 in Electronics at 120 units and Wireless Mouse M3 at 300, and the deepest line is the HDMI 2.1 Cable 2m at 500 units against the thinnest, Smart Watch S at 40. Worth telling the warehouse team: nothing here is filtered or sorted, so the sheet lands in catalog order — if the count crew wants it by aisle, that is an ORDER BY we can bolt on later without touching the header logic.",
  },
  {
    id: "cs-231",
    tier: "easy",
    topic: "l7",
    universe: "month-close",
    title: "February's revenue line",
    brief:
      "From: Financial Controller. Re: close binder, month tabs.\n\nEach month tab in the close binder opens with one number: the revenue booked in that month, all statuses included, no adjustments. February is next. Pull the booked total for every order created in 2024-02 and round it to cents so the binder prints consistently.",
    ask: "Total booked revenue across all orders created in February 2024, rounded to 2 decimals.",
    template: `SELECT {1}(total) AS feb_revenue
FROM {2}
WHERE strftime('%Y-%m', created_at) = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the total aggregate",
        why: "The deliverable is money added up across rows, so SUM(total) is the aggregate. COUNT would return a headcount of February orders and MAX only the single biggest ticket.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Booked revenue lives in orders.total. order_items has neither a total nor a created_at column, and products is the catalog — neither can produce a monthly revenue line.",
      },
      {
        answer: "'2024-02'",
        kind: "keyword",
        label: "the month literal",
        why: "strftime buckets each booking into a 'YYYY-MM' string, so February is the quoted text '2024-02'. Unquoted, the chip reads as the arithmetic 2024 minus 02 and matches nothing.",
      },
    ],
    distractors: ["COUNT", "AVG", "2024-02", "order_items", "'2024-01'"],
    walkthrough:
      "One aggregate, one filter, one row. strftime('%Y-%m', created_at) stamps every booking with its month bucket, the equality picks the February bucket, and SUM(total) adds the surviving rows. The binder line lands at 3609.64 across 9 orders — that is the figure February's tab opens with. Two habits worth copying: aggregate in one query rather than summing a spreadsheet column by hand, and quote the month literal — the unquoted 2024-02 evaluates as the arithmetic expression 2022 and silently matches zero rows, which looks exactly like 'no revenue' to anyone skimming the binder. January's tab, for comparison, closes at 3731.97, so February booked about 122 less.",
  },
  {
    id: "cs-232",
    tier: "easy",
    topic: "l3",
    universe: "refund-audit",
    title: "The 300-bar refund queue",
    brief:
      "From: refunds@ internal ticket #4471.\n\nQuarter-end goodwill sweep, stage one. Anything we booked at 300 or less gets auto-cleared by the standard policy, so the only cases a human must look at are the ones booked above the 300 line. Before we schedule reviewers I need the size of that pool: how many booked orders clear the bar?",
    ask: "Count how many booked orders have a total greater than 300.",
    template: `SELECT {1}(*) AS refund_queue
FROM {2}
WHERE total > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The ask is a headcount of rows, so COUNT(*) counts every order above the bar. SUM would try to add the '*' symbol and fail, and AVG would return a mean nobody asked for.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Booked totals live on orders. order_items carries per-line prices with no total column, and products is the catalog — neither table can answer a question about bookings.",
      },
      {
        answer: "300",
        kind: "number",
        noVerify: true,
        label: "the threshold",
        why: "The ticket defines the human-review pool as strictly above 300, so the predicate is total > 300. An order booked at exactly 300.00 falls under the auto-clear policy and must not be counted.",
      },
    ],
    distractors: ["SUM", "AVG", "MAX", "order_items", "200"],
    walkthrough:
      "A queue size, not a list: COUNT(*) over one row-level predicate. The bar is strictly greater than — an order booked at exactly 300.00 auto-clears, so > and not >=. Run it and the pool holds 49 orders. That is too many for one reviewer in a sitting, which is exactly why the policy layers thresholds: 25 of those orders sit above 500, and that sub-pile is where staffing would start. If finance tightens the bar to 200 the pool jumps to 65, which is the number to quote when someone asks why the 300 line was chosen.",
  },
  {
    id: "cs-233",
    tier: "easy",
    topic: "l2",
    universe: "pricing",
    title: "Ex-VAT prices for the EU sheet",
    brief:
      "From: Head of Product. Re: EU price-list compliance.\n\nOur storefront prices are stored tax-inclusive, but the EU sheet must show the net figure the customer actually pays before VAT. VAT here is 8 percent already inside the price, so back it out per row: divide by 1.08 and round to cents. List the gross price beside it so reviewers can see the subtraction.",
    ask: "Each product's name and gross price, plus net_price = price divided by 1.08, rounded to 2 decimals.",
    template: `SELECT name, price,
       ROUND(price / {1}, 2) {2} net_price
FROM {3};`,
    slots: [
      {
        answer: "1.08",
        kind: "number",
        noVerify: true,
        label: "the VAT divisor",
        why: "A price that already contains 8 percent VAT is 108 percent of the net figure, so dividing by 1.08 backs the tax out: 89.99 becomes 83.32. Dividing by 0.08 would inflate the price twelve-fold.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the alias keyword",
        why: "AS names the computed column net_price, the header the compliance sheet expects. Skip it and the header prints as the raw division expression, which nobody can reference downstream.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Storefront list prices live in products. order_items stores what was charged per line as unit_price (it has no price column), and suppliers holds no prices at all.",
      },
    ],
    distractors: ["0.08", "1.8", "IS", "order_items", "suppliers"],
    walkthrough:
      "Removing a tax that is already inside a price is division, not subtraction: the stored tag is 108 percent of net, so price / 1.08 lands on the net figure and ROUND(..., 2) keeps it cent-clean. The sheet's anchor rows: the 89.99 keyboard nets to 83.32, the 149.99 headset to 138.88, and the 199.99 smart watch to 185.18. Two things to tell whoever maintains this sheet: the naive instinct of subtracting 8 percent (multiplying by 0.92) drifts low because it taxes the tax, and the gross price stays beside the net on purpose — compliance reviewers check the pair, not one column. Sixteen rows, no filtering, the full catalog.",
  },
  {
    id: "cs-234",
    tier: "easy",
    topic: "l3",
    universe: "inventory",
    title: "The deep-stock eight for the count",
    brief:
      "From: Warehouse ops manager. Re: cycle count, zone C.\n\nZone C only needs a physical count of the bins that run deep — the crew has an hour, so anything under 150 units on the shelf gets counted by the sensor sweep instead. Give me the short list: every product holding 150 or more units, with the numbers visible so the crew can verify against the bins.",
    ask: "Each product with stock of at least 150 units, showing name and stock.",
    template: `SELECT name, {1}
FROM products
WHERE stock {2} {3};`,
    slots: [
      {
        answer: "stock",
        kind: "keyword",
        label: "the depth column",
        why: "The crew verifies unit counts, so the stock column rides beside the name. Price or category would hand them data the count sheet has no column for.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the comparison operator",
        why: "At least 150 means 150 itself qualifies, so the operator is >=. A strict > would silently drop a shelf sitting at exactly 150 from the physical count.",
      },
      {
        answer: "150",
        kind: "number",
        label: "the deep-stock line",
        why: "The ops brief sets the physical-count line at 150 units for this zone. It is a real edge in the data: the Ring Light sits at exactly 150, so >= versus > changes the list.",
      },
    ],
    distractors: ["price", "<", ">", "100", "300"],
    walkthrough:
      "The predicate carries the whole case: 'at least 150' is >=, because a shelf sitting at exactly 150 is still a physical-count job. Direction check: the column (stock) sits left of the operator and the threshold right, reading 'stock is at least 150', not the other way round. Eight shelves qualify: Wireless Mouse M3 at 300, Bluetooth Speaker Mini at 210, Ring Light 14-inch right on the line at 150, HDMI 2.1 Cable 2m at 500, Laptop Stand Aluminum at 180, Desk Mat Extended at 260, Running Socks 3-pack at 400 and Yoga Mat Eco 6mm at 220. Watch the edge: swap >= for > and the Ring Light drops off the list, and the crew never counts the one bin that sits exactly on the line.",
  },
  {
    id: "cs-235",
    tier: "easy",
    topic: "l6",
    universe: "funnel",
    title: "How many accounts ever bought",
    brief:
      "From: Growth marketing lead. Re: board deck, conversion slide.\n\nThe deck's conversion slide needs one honest denominator-style number: of all the accounts in the CRM, how many have ever placed an order? I don't care how many orders each placed — collapse the order book down to distinct accounts and give me the count. One cell for the slide.",
    ask: "Count the distinct customer accounts that appear in the orders table.",
    template: `SELECT {1}(DISTINCT {2}) AS buyers
FROM {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a single number of distinct accounts, so COUNT does the collapsing-and-counting in one call. SUM would add the id numbers together and print a meaningless 136.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account reference",
        why: "Accounts are identified on orders by customer_id. Status or total would count something else entirely — the slide's number is about who bought, not what they bought.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Purchases live in orders. The customers table lists every account including never-bought ones, so counting there cannot answer 'ever bought'.",
      },
    ],
    distractors: ["SUM", "status", "order_items", "customers", "product_id"],
    walkthrough:
      "The column already holds repeats — 103 orders but far fewer buyers — so the job is dedupe-then-count, which is exactly COUNT(DISTINCT customer_id) in one expression. The slide's number: 16 distinct accounts have ever bought. The interesting read for the deck: that equals the full CRM roster, so every registered account has transacted at least once — acquisition, not activation, is the constraint this funnel does not have. If the slide later needs 'bought this quarter', the same expression gains a WHERE on the booking date; the DISTINCT stays regardless, because without it a five-order account would quietly count five times.",
  },
  {
    id: "cs-236",
    tier: "easy",
    topic: "l3",
    universe: "supplier",
    title: "Below the 4.2 quality bar",
    brief:
      "From: Supply-chain lead. Re: vendor development shortlist.\n\nProcurement flags any partner whose audit score slips under 4.2 for a development conversation before renewal season. Pull the flagged vendors with their exact scores so the category managers can prep. No rounding, no grouping — just the names and the number that put them on the list.",
    ask: "Each supplier whose rating is below 4.2, showing name and rating.",
    template: `SELECT {1}, rating
FROM {2}
WHERE rating < {3};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the identity column",
        why: "Category managers prep by vendor name, so name is the identity column. Region would list where they are, not who they are, and vendor is not a column this table has.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the source table",
        why: "Audit scores live on suppliers. products has no rating column at all, so the fill would fail before the first row — and orders is a transaction ledger, not a vendor list.",
      },
      {
        answer: "4.2",
        kind: "number",
        noVerify: true,
        label: "the quality bar",
        why: "The brief sets the development trigger just under 4.2, so the predicate is rating < 4.2. A vendor scoring exactly 4.2 would stay off the shortlist.",
      },
    ],
    distractors: ["vendor", "region", "products", "4.0", "4.5"],
    walkthrough:
      "One predicate, strict inequality, done. Direction check: the list is who falls BELOW the bar, so rating < 4.2 — flipping it to > would return the healthy bench instead of the problem list. Three vendors land on the shortlist: Shenzhen Electro at 4.1, Pacific Textiles at 3.9, and Andes Naturals SA at 4. The Andes row is the one worth a comment in the pack: its score is stored as a bare 4, so it prints without a decimal — same scale, fewer digits, and a strict < 4.2 still catches it. Loosen the bar to 4.5 and Midwest Hardware Co (4.4) joins, which is the sensitivity number to have ready when renewal season argues about where the line sits.",
  },
  {
    id: "cs-237",
    tier: "easy",
    topic: "l2",
    universe: "expense",
    title: "The spend extract, field by field",
    brief:
      "From: Ops finance, spend review.\n\nThe spend-review template ingests a flat extract of the expense ledger: line id, vendor, date spent, and the raw cent amount relabelled to cents so the template's mapper can find it. No filters, no totals — reviewers want the raw lines exactly as booked, just with the header naming the template expects.",
    ask: "Every expense line's id, vendor and spent_on, with amount_cents relabelled to cents.",
    template: `SELECT id, vendor, spent_on,
       amount_cents {1} cents
{2} {3};`,
    slots: [
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS relabels amount_cents to cents, the header the spend template maps on. IS reads as a comparison and breaks the statement before a single row prints.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM declares the table the rows come from — here the expense ledger. WHERE would bolt a filter onto a read that must cover every booked line.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the source table",
        why: "Expense lines live in expenses. orders has no vendor or amount_cents column, so pointing the read there fails outright — and products is the catalog, not company spend.",
      },
    ],
    distractors: ["IS", "WHERE", "orders", "order_items", "products"],
    walkthrough:
      "A raw hand-off: three context columns and the money figure, relabelled. amount_cents AS cents is the one rename the template needs — aliases change headers, never data, so every line keeps its stored cent value. The extract covers all 36 expense lines exactly as booked: line 1 is Atlas Property GmbH on 2024-01-01 at 120000 cents, line 2 AdWorks Media on 2024-01-12 at 22000, line 3 DevTools Inc on 2024-01-15 at 29900. Nothing is filtered or summed — the reviewers asked for raw material, and pre-aggregating an extract is how reconciliation arguments start. If the template later wants dollars instead of cents, that is a one-division change to this same projection.",
  },
  {
    id: "cs-238",
    tier: "easy",
    topic: "l2",
    universe: "growth",
    title: "The cohort sheet with sign-up dates",
    brief:
      "From: Chief of Staff. Re: cohort slide for the offsite.\n\nThe offsite deck needs the CRM roster with each account's sign-up date surfaced as its own column, because the cohort story is built on when accounts joined. Header must read joined_on — the slide tool keys on it. Name and email ride along for the call list.",
    ask: "Every customer's name, email and created_at, with created_at relabelled to joined_on.",
    template: `SELECT name, {1}, created_at {2} joined_on
{3} customers;`,
    slots: [
      {
        answer: "email",
        kind: "keyword",
        label: "the contact column",
        why: "The call list needs a reachable address per account, so email is projected. City would swap contact data for geography and the call list loses its dial targets.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS renames created_at to joined_on, the header the slide tool keys on. Without it the column prints under its storage name and the tool finds nothing to plot.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM customers is the roster. orders carries no name or email, and suppliers is a different dataset entirely — both fills fail before the sheet prints.",
      },
    ],
    distractors: ["city", "region", "IS", "WHERE", "suppliers"],
    walkthrough:
      "Pure projection with one rename: name and email come straight off the roster, and created_at AS joined_on gives the slide tool the header its cohort axis expects. Sixteen rows, one per account, in storage order: Alice Chen signed up 2023-11-02, Bruno Silva 2023-11-17, Chloe Dubois 2023-12-05, and the most recent join is Pedro Alvarez on 2024-07-03. Reading the dates across the sheet is the whole cohort story — four accounts predate 2024, then sign-ups land roughly monthly through July. One caveat for the deck: nothing here is filtered by the active flag, so the two dormant accounts (Dmitri Volkov, Keiko Sato) sit in the sheet with their join dates like everyone else.",
  },
  {
    id: "cs-239",
    tier: "easy",
    topic: "l3",
    universe: "fraud",
    title: "Tickets above the 800 hold line",
    brief:
      "From: Risk team, spot-check rotation.\n\nNew policy from the processor: any booked order above 800 gets an automatic payment hold until a human reviews it. Before the weekend freeze I need the hold list itself — order ids with their booked totals — so the reviewers can work through them in order. Nothing below the line, nothing summarized.",
    ask: "Each order with a total greater than 800, showing id and total.",
    template: `SELECT {1}, {2}
FROM orders
WHERE total > {3};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the ticket reference",
        why: "Reviewers pull full records by order id, so id is the reference column. Status would tell them the stage but not which ticket to open.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the booked value",
        why: "The hold decision is made on booked value, so total rides beside the id. Swapping in created_at would give timing, which the hold policy does not read.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the hold line",
        why: "The processor's new hold line is 800 — orders at or under it stay out of the review queue entirely.",
      },
    ],
    distractors: ["status", "customer_id", "700", "900", "1000"],
    walkthrough:
      "A threshold list, and the threshold does the work: total > 800 keeps every row above the processor's line and nothing from under it. Four orders make the hold list: 15 at 826.03, 39 at 845.92, 43 at 945.21 and 74 at 1088.44 — biggest last if you sort ascending, biggest first if reviewers triage by size. Worth flagging with the list: raise the line to 900 and only two orders qualify, drop it to 700 and the queue jumps to ten, so the 800 figure is doing real load-balancing for the review team. Strict inequality matters too — an order booked at exactly 800.00 would not hold.",
  },
  {
    id: "cs-240",
    tier: "easy",
    topic: "l6",
    universe: "catalog",
    title: "Categories on the budget shelf",
    brief:
      "From: Catalog content manager. Re: budget-aisle navigation tile.\n\nThe storefront team is building a budget-aisle tile and needs the shelf labels, not the products: which distinct categories actually have an item priced under 50. Dedupe the category column so each label appears once, and send the labels only — the tile links to filtered pages, not SKUs.",
    ask: "The distinct categories that contain at least one product priced under 50.",
    template: `SELECT DISTINCT {1}
FROM {2}
WHERE price < {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the label column",
        why: "The tile lists shelf labels, so category is the column to dedupe. Name would return product names — eight of them — and the tile would read like a catalog page.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Prices and shelf labels live on products. order_items stores purchase lines with no category column, so the fill fails before the tile gets a single label.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the budget line",
        why: "The budget aisle is defined as anything priced under 50, so the filter is price < 50 before the dedupe runs.",
      },
    ],
    distractors: ["name", "stock", "order_items", "20", "100"],
    walkthrough:
      "Order of operations is the whole lesson: WHERE trims to the eight products priced under 50 first, then DISTINCT collapses the category column so each label prints once. Five labels survive: Accessories, Apparel, Electronics, Fitness and Video. Electronics makes the tile despite being a premium shelf, because two of its items (the 34.50 mouse and the 49.00 hub) undercut the line — a category qualifies on any single product, not its average. Tighten the aisle to under 20 and only Accessories and Apparel remain; loosen it to under 100 and all seven categories qualify, which is the sensitivity check that shows the 50 line is doing real work.",
  },
  {
    id: "cs-241",
    tier: "easy",
    topic: "l4",
    universe: "month-close",
    title: "The close binder's stamped count",
    brief:
      "From: Financial Controller. Re: dispatch confirmation annex.\n\nFor the close binder I can only annex orders the warehouse has confirmed out the door — rows carrying a real dispatch timestamp. The system leaves shipped_at empty until the scan lands, so emptiness is the tell. Give me the count of rows that DO carry the stamp; the limbo pile is a separate memo.",
    ask: "Count how many orders have a dispatch timestamp filled in.",
    template: `SELECT {1}(*) AS stamped
FROM orders
WHERE shipped_at IS {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount, so COUNT(*) over the filtered rows. SUM would choke on the '*' and MAX would return a single timestamp, not a count.",
      },
      {
        answer: "NOT",
        kind: "keyword",
        label: "the negation",
        why: "IS NOT turns the NULL test around: keep rows that have the stamp, not rows missing it. Dropping the NOT silently answers the opposite memo.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "The emptiness marker completes the test: shipped_at IS NOT NULL selects every row where a dispatch scan actually exists.",
      },
    ],
    distractors: ["SUM", "AVG", "=", "IN"],
    walkthrough:
      "Same table, same column as the limbo memo — the only difference is the direction of the NULL test. shipped_at IS NOT NULL keeps rows where the warehouse scan exists; COUNT(*) then sizes them: 82 of the 103 booked orders carry a stamp. The complement is worth stating in the binder: 21 rows have no stamp, and they are exactly the 14 pending plus 7 cancelled orders, because a dispatch date is only ever stamped when goods leave the building. The trap this annex guards against is writing = NULL — that comparison evaluates to unknown on every row and returns an empty set, which would print a stamped count of nothing and send the close meeting chasing a data bug that does not exist.",
  },
  {
    id: "cs-242",
    tier: "easy",
    topic: "l7",
    universe: "refund-audit",
    title: "The refund ledger's two cells",
    brief:
      "From: refunds@ internal ticket #4502.\n\nThe quarterly refund memo opens with two cells: how many bookings ended cancelled, and the money those cancellations took off the board. Pull both in one query so the cells can never disagree — count the cancelled orders and sum their totals, rounded to cents for the memo header.",
    ask: "One row with the count of cancelled orders and their combined total, rounded to 2 decimals.",
    template: `SELECT {1}(*) AS refund_cases,
       ROUND({2}(total), 2) AS refund_value
FROM orders
WHERE status = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "Cell one is a headcount of cancelled bookings, so COUNT(*) rows up the filtered set. SUM in this slot would try to add the '*' and fail outright.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the money aggregate",
        why: "Cell two is money, so SUM(total) adds the cancelled totals. AVG would water it down to a mean and MAX would report only the single worst cancellation.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status literal",
        why: "The memo targets cancelled bookings, and status is stored as text: the comparison needs the quoted literal 'cancelled'. Bare cancelled reads as a column name and the query dies.",
      },
    ],
    distractors: ["AVG", "MAX", "'pending'", "'delivered'", "status"],
    walkthrough:
      "Two aggregates, one filter, one pass — the memo's two cells can never disagree because they come from the same WHERE. The filter keeps only cancelled bookings; COUNT(*) sizes them at 7 and SUM(total) prices the damage at 1152.49. That is the exposure number for the memo header. The context that makes the number discussable: the worst single cancellation is 397.99, so no one cancellation dominates the 1152.49 — it is spread across the seven. And quote the literal carefully: status values are stored text, so 'cancelled' wears quotes, while the bare word would be read as a column reference and the query would not survive the trip.",
  },
  {
    id: "cs-243",
    tier: "easy",
    topic: "l5",
    universe: "pricing",
    title: "Three anchors for the pricing memo",
    brief:
      "From: Head of Product. Re: pricing memo, anchor slide.\n\nThe memo's anchor slide shows the three most expensive products in the catalog — the figures every other price gets benchmarked against. Biggest first, exactly three rows, name with the list price. The slide is already full, so no extras.",
    ask: "The 3 most expensive products, name and price, sorted biggest first.",
    template: `SELECT name, price
FROM products
{1} BY price {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Ranking rows by price is sorting, so ORDER BY. WHERE would filter rows out entirely instead of lining them up, and it cannot introduce a sort.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first means descending. The default ASC would serve the three cheapest products — the opposite anchor slide.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT 3 trims the sorted list to its first three rows — exactly the slide's capacity. OFFSET would skip rows instead of capping them.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the anchor count",
        why: "The slide holds exactly three anchors, no more, no fewer.",
      },
    ],
    distractors: ["WHERE", "ASC", "OFFSET", "TOP", "5"],
    walkthrough:
      "Top-N is three clauses stacked: sort by the metric, point the sort the right way, cap the output. ORDER BY price DESC lines the catalog up from 199.99 downward; LIMIT 3 keeps the first three rows and discards the rest. The anchors: Smart Watch S at 199.99, Noise-Canceling Headset at 149.99, 4K Webcam Pro at 129. The direction chip is the case's real trap — ASC with the same LIMIT hands the memo the three cheapest products (14.99, 18.50, 24.99), which would quietly re-anchor every benchmark in the deck downward. And LIMIT runs after the sort, which is why you get the three largest rather than any three.",
  },
  {
    id: "cs-244",
    tier: "easy",
    topic: "l5",
    universe: "inventory",
    title: "The deepest bin on the floor",
    brief:
      "From: Warehouse ops manager. Re: floor walkthrough prep.\n\nFor the walkthrough I want to start at the bin most worth eyeballing: the single product holding the most units on the shelf. One row, name plus the count, biggest pile first — the crew uses it as the starting landmark for the count route.",
    ask: "The single product with the highest stock, showing name and stock.",
    template: `SELECT name, stock
FROM products
{1} BY stock {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Finding the biggest pile is sorting, so ORDER BY stock lines the shelves up by depth. WHERE would only filter rows and cannot rank anything.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first means descending, so the deepest bin lands in row one. ASC would surface the thinnest shelf instead.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT 1 keeps only the first row of the sorted list — the single deepest bin the walkthrough starts at.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the landmark count",
        why: "The walkthrough needs exactly one landmark row.",
      },
    ],
    distractors: ["WHERE", "ASC", "OFFSET", "TOP", "2"],
    walkthrough:
      "Max-by-sorting: order the shelf by depth, descending, and keep one row. The landmark: HDMI 2.1 Cable 2m at 500 units — the deepest bin on the floor by a wide margin (the runner-up, Wireless Mouse M3, sits at 300). The direction chip is the trap: ASC would hand the walkthrough the thinnest bin instead, Smart Watch S at 40, and the crew would start the count at the wrong end of the building. LIMIT 1 versus eyeballing the top of a full sort matters when the list gets long — the cap guarantees exactly one row lands in the handoff, whatever the catalog does around it.",
  },
  {
    id: "cs-245",
    tier: "easy",
    topic: "l5",
    universe: "funnel",
    title: "Newest sign-ups for the onboarding wave",
    brief:
      "From: Growth marketing lead. Re: onboarding wave, latest cohort.\n\nThe onboarding sequence targets the three most recent sign-ups — fresh accounts get the welcome track first. Pull them newest first: name and home city, exactly three rows, so the CRM upload can queue the sequence.",
    ask: "The 3 most recently created customer accounts, name and city, newest first.",
    template: `SELECT name, city
FROM customers
{1} BY created_at {2}
{3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "Recency is a sort, so ORDER BY created_at lines the roster up by join date. GROUP would squash accounts into date buckets instead of listing them.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Newest first means descending dates. ASC would queue the oldest accounts — the founding cohort — into a welcome track meant for fresh sign-ups.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the row cap",
        why: "LIMIT 3 caps the queue at the sequence's batch size.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the wave size",
        why: "The onboarding wave takes exactly three accounts per batch.",
      },
    ],
    distractors: ["WHERE", "ASC", "OFFSET", "5"],
    walkthrough:
      "Recency queues are ORDER BY created_at DESC with a cap. The wave's three: Pedro Alvarez in Madrid (2024-07-03), Olivia Brown in London (2024-06-11), Noah Meyer in Hamburg (2024-05-27). Flip the direction and the same query returns Alice Chen, Bruno Silva and Chloe Dubois — the founding cohort, who are long past needing a welcome email, which is exactly the kind of quiet mis-target a direction chip causes. Worth noting for the CRM upload: created_at is the record of sign-up because the customers table has no separate joined-on column, and equal dates would fall back to storage order rather than a second sort key.",
  },
  {
    id: "cs-246",
    tier: "easy",
    topic: "l2",
    universe: "supplier",
    title: "The vendor grid, three columns",
    brief:
      "From: Supply-chain lead. Re: review pack, opening grid.\n\nThe vendor review pack opens with a bare grid: each partner's reference number, trading name and sourcing region — three columns, nothing derived, nothing filtered. It is the page everyone flips back to while the scores are debated, so build it exactly that plain.",
    ask: "Every supplier's id, name and region, with no filtering or sorting.",
    template: `{1} id, name, region
{2} {3};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "A read of specific columns starts with SELECT — it declares the three fields each row of the grid carries. WHERE at the front is a syntax error, not a filter.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM names the table the rows come from. Swapping in ORDER here breaks the statement — sorting is not a source of rows.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the source table",
        why: "The partner list lives in suppliers. products would print the catalog with no region column, and customers is a different roster entirely.",
      },
    ],
    distractors: ["WHERE", "ORDER", "products", "customers"],
    walkthrough:
      "The plainest possible read: SELECT names the three columns, FROM points at the table, and six rows come back in storage order — Nordic Gadgets AB in the EU as partner 1, Shenzhen Electro in APAC as partner 2, down through Andes Naturals SA in LATAM as partner 6. Nothing is derived or filtered because the grid's job is to be the stable reference page the debate flips back to. The one discipline this case rehearses: name the columns instead of using * — the pack prints three headers on purpose, and a star-select would silently widen the grid if the table ever gains a column, breaking the layout mid-meeting.",
  },
  {
    id: "cs-247",
    tier: "easy",
    topic: "l7",
    universe: "expense",
    title: "What the expense ledger adds up to",
    brief:
      "From: Ops finance, spend review.\n\nThe spend review's cover cell is the grand total of the expense ledger, kept in cents exactly as stored so it ties to the accounting system to the penny. Count nothing, average nothing — one sum over every booked line, whatever category or vendor it belongs to.",
    ask: "The sum of amount_cents across every expense line, as a single value.",
    template: `SELECT {1}({2}) AS total_cents
FROM {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the total aggregate",
        why: "The cover cell is everything added together, so SUM does the adding. COUNT would report how many lines exist, not what they cost.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "The ledger stores money in cents, so amount_cents is the column that ties to accounting. vendor is text — summing it returns a meaningless zero.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the source table",
        why: "The spend ledger is expenses. orders books customer revenue, not company spend, and has no amount_cents column at all.",
      },
    ],
    distractors: ["COUNT", "AVG", "vendor", "unit_price", "orders"],
    walkthrough:
      "One aggregate, no WHERE: SUM(amount_cents) sweeps all 36 booked lines and returns 2541600 — 25,416.00 in currency, kept in cents so the cell ties to the accounting system without a rounding conversation. The two neighbour numbers worth having ready: COUNT says the ledger holds 36 lines, and the per-line average sits at 70600 cents, pulled up by the 168000-cent rent lines. The column choice is the quiet lesson — ledger money lives in amount_cents; point the sum at a text column like vendor and SQLite shrugs and returns zero, which looks exactly like a year with no spend.",
  },
  {
    id: "cs-248",
    tier: "easy",
    topic: "l7",
    universe: "growth",
    title: "Average basket on the shipped book",
    brief:
      "From: BizOps, board prep.\n\nThe board's momentum slide tracks the average value of orders that have actually left the building — shipped status only, since delivered lags the story and pending is aspiration. One cell: the mean total across shipped orders, rounded to cents so the slide prints clean.",
    ask: "The average total across orders with status 'shipped', rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS avg_shipped
FROM {2}
WHERE status = {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregate",
        why: "A mean basket is AVG(total) — the sum spread across the orders. SUM would print the whole shipped book's value, and COUNT would print how many there are.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order values and their statuses live in orders. order_items has per-line prices with no status column, so the fill fails before averaging anything.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status literal",
        why: "The slide scopes to dispatched orders, and status is stored text: the literal needs quotes — 'shipped', not bare shipped.",
      },
    ],
    distractors: ["SUM", "COUNT", "order_items", "'pending'", "'delivered'"],
    walkthrough:
      "Filter first, then average: WHERE status = 'shipped' keeps the 30 orders the warehouse has dispatched, and AVG(total) spreads their combined value across the count — 399.89 per shipped order, rounded to cents for the slide. The comparison numbers for the speaker notes: delivered orders average lower at 299.44 and the pending pipeline averages highest at 436.64, so the shipped figure sits in the middle of the story. The quoting habit is the case's trap: 'shipped' is a stored text value and wears quotes, while the bare word reads as a column name and kills the query. One cell, one pass, no chance of the slide and the appendix disagreeing.",
  },
  {
    id: "cs-249",
    tier: "easy",
    topic: "l4",
    universe: "fraud",
    title: "Scan stamps, real or marked",
    brief:
      "From: Risk team, spot-check rotation.\n\nThe chargeback workbook needs one dispatch column per order with no blanks in it: the real scan date where one exists, and the marker 'no scan' where the warehouse never confirmed. Blank cells break the workbook's importer, so fill the gaps in the query rather than by hand. Order id beside it for the merge.",
    ask: "Each order's id with its shipped_at, or 'no scan' where the stamp is missing.",
    template: `SELECT id, {1}(shipped_at, {2}) AS dispatch_stamp
FROM {3};`,
    slots: [
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the fill function",
        why: "COALESCE returns its first non-NULL argument, so it passes the real stamp through and substitutes the marker only when the stamp is missing. IS and NULL are not functions and cannot fill anything.",
      },
      {
        answer: "'no scan'",
        kind: "keyword",
        label: "the gap marker",
        why: "The marker the workbook expects is the quoted text 'no scan'. It only prints on rows where shipped_at is empty.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Dispatch stamps live on orders. order_items has no shipped_at column, so the fill fails before the first row.",
      },
    ],
    distractors: ["IS", "NULL", "SUM", "'pending'", "order_items"],
    walkthrough:
      "COALESCE is the fill-the-blank function: it walks its arguments left to right and returns the first one that is not NULL. With the real stamp first and the marker second, dispatched orders print their scan date — order 2 shows 2024-01-18 — and unshipped ones print 'no scan' instead of a blank, order 1 among the 21 such rows. The workbook importer gets a column with zero empties, which is the whole point. Two near-misses to name: swapping the marker for NULL restores the blanks (COALESCE happily returns NULL when every argument is NULL), and any marker without quotes reads as a column reference and fails. Same column, same rows — only the display changes.",
  },
  {
    id: "cs-250",
    tier: "easy",
    topic: "l7",
    universe: "catalog",
    title: "Floor to ceiling on the shelf",
    brief:
      "From: Catalog content manager. Re: relaunch copy brief.\n\nThe relaunch copywriter needs the catalog's price range in one breath: the cheapest thing we sell and the dearest, as two figures on one row. Nothing between, nothing grouped — just the floor and the ceiling of the whole price column.",
    ask: "One row with the lowest and highest price in the products table.",
    template: `SELECT {1}(price) AS floor_price,
       {2}(price) AS ceiling_price
FROM {3};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor aggregate",
        why: "The floor of a column is MIN(price) — the single smallest value. SUM would add all sixteen prices together and print a nonsense floor.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The ceiling is MAX(price), the largest value in the column. COUNT would report how many products exist, not what they cost.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Prices live on the products table. orders and order_items book transactions and have no price column, so both fills fail outright.",
      },
    ],
    distractors: ["SUM", "AVG", "COUNT", "orders", "order_items"],
    walkthrough:
      "MIN and MAX are one family: both scan the whole price column and return its two extremes — 14.99 at the floor (the HDMI 2.1 Cable 2m) and 199.99 at the ceiling (the Smart Watch S). No GROUP BY, no WHERE: the brief asked for the catalog's whole range, so the aggregates sweep all 16 products into one row. Copy-brief framing that lands: everything on the shelf sits between 'about 15' and 'about 200'. Handy context from the same scan: the average tag is 71.78, much closer to the floor than to the ceiling, which tells the copywriter the premium pieces are the exceptions, not the rule.",
  },
  {
    id: "cs-251",
    tier: "easy",
    topic: "l3",
    universe: "month-close",
    title: "The January booking window",
    brief:
      "From: Financial Controller. Re: cutoff testing, January.\n\nCutoff testing needs the count of bookings that landed inside the January window — created_at from the first of the month through the last, both bounds included, nothing before or after. Give me one number for the working paper: how many orders fall in that window?",
    ask: "Count orders created between 2024-01-01 and 2024-01-31 inclusive.",
    template: `SELECT {1}(*)
FROM orders
WHERE created_at {2} {3} AND {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The working paper wants a count of rows in the window, so COUNT(*). SUM would try to add the '*' and fail; AVG is a mean nobody asked for.",
      },
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the range operator",
        why: "The window is a range with two bounds, which is exactly BETWEEN's shape — one operator, both ends. A bare > would leave the window open-ended.",
      },
      {
        answer: "'2024-01-01'",
        kind: "keyword",
        label: "the window open",
        why: "The window opens at the quoted date '2024-01-01'. Dates compare as text in this schema, so the literal must match the stored format exactly.",
      },
      {
        answer: "'2024-01-31'",
        kind: "keyword",
        label: "the window close",
        why: "The window closes at '2024-01-31', and BETWEEN is inclusive — an order booked exactly on the 31st counts for January.",
      },
    ],
    distractors: ["SUM", "AVG", ">", "<", "'2024-01-15'"],
    walkthrough:
      "BETWEEN is the two-bounds operator: created_at BETWEEN '2024-01-01' AND '2024-01-31' keeps every booking from midnight on the first through the last instant of the 31st, both ends included. The working-paper number: 8 orders booked inside January's window. The inclusive bounds are the part cutoff testing lives on — pull the upper bound in to '2024-01-15' and the window holds 6, push it out to the end of February and it swallows 17. And the operator matters as much as the dates: a bare > with a dangling second date either fails or silently reshapes the window, so the two-bound form is what makes the working paper reproducible.",
  },
  {
    id: "cs-252",
    tier: "easy",
    topic: "l4",
    universe: "refund-audit",
    title: "Rows to tag before the refund meeting",
    brief:
      "From: refunds@ internal ticket #4523.\n\nBefore Thursday's refund meeting I need the working list of orders with no dispatch confirmation — the rows our system leaves with an empty shipped_at. Show each with its account reference and current status so we can tag them in the meeting. Ids first, no sorting, no totals.",
    ask: "Every order with no dispatch timestamp, showing id, customer_id and status.",
    template: `SELECT id, customer_id, {1}
FROM orders
WHERE shipped_at {2} {3};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the stage column",
        why: "The meeting tags rows by their current stage, so status is the third column. Total would bring money the tagging exercise does not need.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the NULL operator",
        why: "NULL is not a value, so emptiness is tested with IS. The equality form shipped_at = NULL evaluates to unknown on every row and returns nothing.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "The empty marker completes the predicate: shipped_at IS NULL finds exactly the rows waiting on a warehouse stamp.",
      },
    ],
    distractors: ["total", "shipped_at", "=", "NOT NULL"],
    walkthrough:
      "The predicate is the case: shipped_at IS NULL is the only correct test for emptiness — NULL never equals anything, so = NULL looks symmetric and returns an empty set, the classic silent zero. The working list runs 21 rows: order 1 (account 16, still pending), order 5 (account 5, pending), order 7 (account 1, cancelled) and down the ledger. Read the status column and the pile explains itself: 14 pending orders waiting on dispatch and 7 cancelled ones that will never ship. Those two numbers are the talking points for Thursday — one pile needs chasing, the other needs closing out.",
  },
  {
    id: "cs-253",
    tier: "easy",
    topic: "l5",
    universe: "pricing",
    title: "Prices six through eight, descending",
    brief:
      "From: Head of Product. Re: repricing wave two.\n\nWave one repriced the top five items on the price ladder; wave two starts at rank six. Give me the products sitting in positions six through eight — sorted most expensive first, then skip the five already repriced and take the next three.",
    ask: "Products ranked 6th to 8th most expensive, showing name and price.",
    template: `SELECT name, price
FROM products
{1} BY price {2}
LIMIT 3 {3} {4};`,
    slots: [
      {
        answer: "ORDER",
        kind: "keyword",
        label: "the sort clause",
        why: "The ladder only exists once the rows are sorted, so ORDER BY price. WHERE would filter rows, not rank them.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Most expensive first means descending, so rank six is genuinely the sixth-priciest. ASC would count the ladder from the cheapest end.",
      },
      {
        answer: "OFFSET",
        kind: "keyword",
        label: "the skip clause",
        why: "OFFSET 5 skips the first five sorted rows — wave one's territory — before LIMIT 3 takes the next three.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the skip size",
        why: "Wave one already repriced the top five, so the skip is exactly 5 rows.",
      },
    ],
    distractors: ["WHERE", "ASC", "LIMIT", "TOP", "3"],
    walkthrough:
      "Pagination is sort, cap, skip: ORDER BY price DESC builds the ladder, LIMIT 3 takes a page of three, OFFSET 5 fast-forwards past wave one's five rows. The wave-two list: Fitness Band X2 at 79.00 (rank six), Cycling Jersey Pro at 65.00, Bluetooth Speaker Mini at 59.99. Read the numbers and the shape of the ladder shows: ranks four and five (119.00 and 89.99) are wave one's tail, and rank nine drops to 49.00, so the 60-to-80 band is genuinely the transition zone. Set the skip to 3 instead and the wave would reprice ranks four to six, double-touching the 79.00 band the brief already signed off.",
  },
  {
    id: "cs-254",
    tier: "easy",
    topic: "l6",
    universe: "inventory",
    title: "Vendors behind the thin shelves",
    brief:
      "From: Warehouse ops manager. Re: replenishment calls.\n\nBefore I ring vendors I want to know how many we'd actually be calling: the distinct suppliers behind any product running under 100 units. Not how many thin products — how many separate vendors do those thin shelves trace back to? One number for the call sheet.",
    ask: "Count the distinct suppliers behind products with stock under 100 units.",
    template: `SELECT {1}(DISTINCT {2}) AS vendors
FROM products
WHERE stock < {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The call sheet needs a headcount, so COUNT does the counting. SUM would add supplier id numbers together and print a meaningless 19.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the vendor reference",
        why: "Vendors are referenced on products by supplier_id. Counting product_id or stock would tally thin products or depth values, not vendors.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the thin line",
        why: "The replenishment sweep targets shelves running under 100 units.",
      },
    ],
    distractors: ["SUM", "product_id", "stock", "50", "200"],
    walkthrough:
      "The dedupe is the deliverable: six thin products trace back to only 5 vendors, because supplier 1's thin stock (the webcam and the smart watch) counts once. That gap — six shelves, five vendors — is exactly why the question says distinct. Loosen the line to 200 and a sixth vendor (supplier 2, behind the 150-unit ring light) enters the call sheet; tighten it to 50 and only two remain (the studio mic's and the smart watch's suppliers). The supplier_id column is the reference key on products — each shelf carries the id of the vendor to ring, so counting distinct ids is counting phone calls, not shelves.",
  },
  {
    id: "cs-255",
    tier: "easy",
    topic: "l6",
    universe: "funnel",
    title: "Active cities for the geo push",
    brief:
      "From: Growth marketing lead. Re: geo push, phase one.\n\nPhase one of the geo push only targets cities where we have a live account — dormant contacts don't count for the ad plan. Collapse the active roster down to distinct home cities and give me the count. One number decides how many ad sets we build.",
    ask: "Count the distinct cities among customers with active = 1.",
    template: `SELECT {1}(DISTINCT {2}) AS active_cities
FROM customers
WHERE active = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The ad-plan input is a count of distinct cities, so COUNT. SUM would add city text into a meaningless zero.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the geo column",
        why: "Home city is the geo unit the ad sets map to. Region would count four broad zones and the plan would lose all city targeting.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the activity flag",
        why: "The push targets live accounts, and the roster flags them with active = 1; the flag 0 would select exactly the dormant accounts the brief excludes.",
      },
    ],
    distractors: ["SUM", "region", "active", "0"],
    walkthrough:
      "Filter, then dedupe, then count: active = 1 keeps the 14 live accounts, DISTINCT city collapses the roster into one label per home town, and COUNT sizes the result — 14 active cities. The number equals the account count only because every account sits in its own city in this CRM, which is worth knowing before anyone budgets per city: one account, one ad set, no splitting. Flip the flag to 0 and the query answers the opposite brief — Tallinn and Nagoya, the two dormant cities. And counting region instead of city would collapse the plan to four broad zones, which is a different slide entirely.",
  },
  {
    id: "cs-256",
    tier: "easy",
    topic: "l1",
    universe: "supplier",
    title: "Shenzhen Electro's full vendor record",
    brief:
      "From: Supply-chain lead. Re: APAC partner review.\n\nThe review call with Shenzhen Electro starts by pulling their full vendor record — every field we hold, exactly as stored, so both sides are looking at the same card. They are partner number 2 in our registry. One row, all columns, no trimming.",
    ask: "The complete suppliers row for vendor id 2.",
    template: `{1} *
FROM {2}
WHERE id = {3};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the read keyword",
        why: "Reading rows starts with SELECT; the * expands to every column of the table. UPDATE at the front would be a write attempt and fails as syntax here.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the registry table",
        why: "Vendor cards live in suppliers. Pointing the read at customers would return a shopper's record instead of a vendor's, and the review call would start on the wrong page.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the partner id",
        why: "Shenzhen Electro is partner number 2 in the registry, so the filter pins id = 2. The chip 5 would pull Alpine Audio's card into an APAC review.",
      },
    ],
    distractors: ["UPDATE", "DELETE", "WHERE", "customers", "5"],
    walkthrough:
      "A key lookup is the smallest useful query in SQL: SELECT * expands every column, FROM suppliers picks the registry, and WHERE id = 2 pins exactly one row. The card: partner 2, Shenzhen Electro, region APAC, rating 4.1 — everything the review call opens with, straight from storage with no column picked over another. The discipline worth keeping: filtering by the primary key returns at most one row, which is why lookups like this are safe to build dashboards on. Swap the pin to 5 and the meeting starts on Alpine Audio's EU card — a one-character mistake that changes every number discussed for the next hour.",
  },
  {
    id: "cs-257",
    tier: "easy",
    topic: "l3",
    universe: "expense",
    title: "The sub-300 expense lines",
    brief:
      "From: Ops finance, spend review.\n\nThe petty-cash review covers the small lines only: expense bookings under 300 dollars, with the big rent and tool contracts handled separately. The ledger stores money in cents, so mind the units. I need the size of the pile first — how many lines qualify?",
    ask: "Count the expense lines with amount_cents under 30000.",
    template: `SELECT {1}(*)
FROM {2}
WHERE amount_cents < {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The review starts with how many small lines exist, so COUNT(*). SUM would try to add the '*' and fail outright.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the source table",
        why: "Expense lines live in expenses. orders has no amount_cents column, so the fill fails before counting anything.",
      },
      {
        answer: "30000",
        kind: "number",
        noVerify: true,
        label: "the petty-cash line",
        why: "The petty-cash line sits at 300 dollars, stored as 30000 cents — the ledger counts money in cents, so the literal must be in cents too.",
      },
    ],
    distractors: ["SUM", "AVG", "orders", "60000", "130000"],
    walkthrough:
      "A single bound, a count: amount_cents < 30000 keeps every expense line booked under 300 dollars — the ledger stores cents, so the literal is 30000, not 300 — and COUNT(*) sizes the pile at 10 lines. That is the petty-cash review's workload. The bound is doing the categorizing: relax it to 60000 and the pile grows to 21 lines, push it to 130000 and 35 of the 36 lines qualify, which is the sensitivity chart to bring when someone argues the threshold. Strict inequality, note: a line booked at exactly 30000 cents sits outside the review.",
  },
  {
    id: "cs-258",
    tier: "easy",
    topic: "l2",
    universe: "growth",
    title: "The board export's money column",
    brief:
      "From: BizOps, board prep.\n\nThe board pack's data appendix ingests one row per order: the order id and its total, with the money column run through ROUND so every figure prints at exactly two decimals no matter how the storage layer formats it. Header must read ticket. That is the whole export.",
    ask: "Every order's id, plus ticket = total rounded to 2 decimals.",
    template: `SELECT id, {1}(total, 2) {2} ticket
FROM {3};`,
    slots: [
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the formatting function",
        why: "ROUND(total, 2) pins the money display to two decimals for the export. SUM would collapse every order into one row, and COUNT would print a count where money belongs.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS names the output column ticket, the header the appendix maps on. Skip it and the header prints as the raw function call.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order totals live in orders. order_items has no total column, and customers has neither — both fills fail outright.",
      },
    ],
    distractors: ["SUM", "COUNT", "MIN", "IS", "order_items"],
    walkthrough:
      "The export is a per-row computation, not an aggregate: ROUND(total, 2) rides in the SELECT list so each of the 103 orders carries its own cleaned figure, and AS ticket names the column the appendix maps on. First rows out: order 1 at 576.54, order 2 at 416.81, order 3 at 767.64. The distinction worth rehearsing: aggregates like SUM collapse the table to one row — wrong tool for an export that must stay one-row-per-order — while ROUND is a scalar function applied independently to every row. No WHERE, no sort: the appendix takes the ledger exactly as stored, money column formatted.",
  },
];
