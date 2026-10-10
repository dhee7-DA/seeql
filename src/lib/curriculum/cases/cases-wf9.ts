// Case batch WF9 — window functions deep-dive, t7 (LAG & LEAD), cs-2301…cs-2325.
import type { CaseStudy } from "./types";

export const casesWf9: CaseStudy[] = [
  {
    id: "cs-2301",
    tier: "medium",
    topic: "t7",
    universe: "growth",
    title: "The city before mine",
    brief:
      "From: Growth lead. Re: the geography walk. Walking the global order timeline, show the PREVIOUS order's customer city — where the store sold one basket ago. The first order reads NULL, and the walk is the store's own chronology, not any account's.",
    ask: "Show each order's previous city in the walk.",
    template: `SELECT orders.id, orders.created_at,
       {1}(city) OVER (ORDER BY {2}) AS prev_city
FROM orders
JOIN customers c ON c.id = orders.customer_id
ORDER BY orders.created_at ASC, orders.id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The walk looks BACKWARD one basket — LAG; LEAD would borrow the next city." },
      { answer: "orders.created_at ASC, orders.id ASC", kind: "keyword", label: "the walk key", why: "The chronology is created_at ASC with the id tiebreak, qualified to orders — the store's own clock." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the timeline." },
    ],
    distractors: ["LEAD", "total DESC", "6"],
    walkthrough:
      "LAG borrows the previous row's city over the unpartitioned walk; the first order reads NULL. LEAD would borrow the following order's city, shifting every answer one basket forward. Ordering by total would scramble the timeline and make previous meaningless — the walk key is the chronology itself.",
  },
  {
    id: "cs-2302",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "Filled billing horizons",
    brief:
      "From: Fraud spot-check. Re: no NULL edges on the AR sheet. For each customer's invoices, show the NEXT invoice's amount, but fill each customer's LAST invoice with 0 instead of NULL using LEAD's third argument — the integer cents column stays consistent.",
    ask: "Show the next invoice amount, filling last bills with zero.",
    template: `SELECT id, customer_id, amount_cents,
       {1}(amount_cents, 1, {2}) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS next0
FROM invoices
ORDER BY customer_id, issued_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The horizon peeks FORWARD within each account — LEAD; LAG would fill the FIRST bill instead." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the edge fill", why: "The third argument fills missing rows — 0 is the natural integer fill for cents." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked accounts." },
    ],
    distractors: ["LAG", "9", "5"],
    walkthrough:
      "LEAD(amount_cents, 1, 0) borrows the following bill and pads each account's closing edge with 0 — the third argument exists for rows with no future. LAG with the same fill would pad each account's FIRST bill, the wrong edge entirely, and 9 would inject fake money into the receivable story.",
  },
  {
    id: "cs-2303",
    tier: "medium",
    topic: "t7",
    universe: "funnel",
    title: "Volume, one month back",
    brief:
      "From: Marketing funnel. Re: the volume heartbeat. Fold order counts per month, then carry the PREVIOUS month's count beside each — the funnel's volume heartbeat. The first month reads NULL.",
    ask: "Carry the previous month's order count beside each month.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, {3}(*) AS orders
  FROM orders
  GROUP BY month
)
SELECT month, orders,
       {1}(orders) OVER (ORDER BY month {2}) AS prev_orders
FROM m
ORDER BY month
LIMIT 14;`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The heartbeat looks BACKWARD one month — LAG; LEAD would borrow the month ahead." },
      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Months run oldest to newest — ASC makes previous the earlier month." },
      { answer: "COUNT", kind: "keyword", label: "the volume fold", why: "Monthly volume is how many orders the month drew — COUNT(*) in the staging CTE." },
    ],
    distractors: ["LEAD", "DESC", "SUM"],
    walkthrough:
      "The CTE folds one count per month; LAG over the calendar walk borrows the previous month's volume. LEAD would borrow the following month, and the DESC flip would run the calendar backwards. SUM in the fold would add up ids — nonsense dressed as volume.",
  },
  {
    id: "cs-2304",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "Private month chains",
    brief:
      "From: Growth lead. Re: the calendar-private chains. Walk orders within their calendar month (partition by the month expression, chronological inside) and show the PREVIOUS basket's total in the SAME month. Month-opening baskets read NULL.",
    ask: "Show the previous basket within the same month.",
    template: `SELECT id, strftime('%Y-%m', created_at) AS month, total,
       {1}(total) OVER (PARTITION BY {2} ORDER BY created_at ASC, id ASC) AS prev_in_month
FROM orders
ORDER BY month, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD inside the month — LAG; LEAD would borrow the next basket." },
      { answer: "strftime('%Y-%m', created_at)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression restarts the chain at each month edge." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints twelve chain rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "customer_id", "6"],
    walkthrough:
      "The partition slices the timeline into months; LAG borrows the previous basket inside the same month; each month's first basket reads NULL. Repartitioning by customer would chain personal histories instead of calendar pages. LEAD would borrow the following basket, pointing the month's story forward.",
  },
  {
    id: "cs-2305",
    tier: "medium",
    topic: "t7",
    universe: "pricing",
    title: "The pricier shelf up the aisle",
    brief:
      "From: Pricing review. Re: the aisle ladders. Within each category, walk products by price ascending and show the NEXT product's price — the rung just above every shelf. The aisle's dearest product reads NULL.",
    ask: "Show the next price within the category ladder.",
    template: `SELECT name, category, price,
       {1}(price) OVER (PARTITION BY {2} ORDER BY price ASC, name ASC) AS next_in_aisle
FROM products
ORDER BY category, price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The rung ABOVE is one row forward in the ascending ladder — LEAD; LAG would borrow the cheaper shelf." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category restarts each ladder at the aisle edge." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The sheet prints twelve ladder rows — LIMIT 12 trims the walked aisles." },
    ],
    distractors: ["LAG", "supplier_id", "6"],
    walkthrough:
      "The partition scopes each ladder to one aisle; LEAD borrows the pricier neighbor inside it; the aisle ceiling reads NULL. Repartitioning by supplier would climb vendor shelves instead of aisles. LAG would borrow the cheaper neighbor — the step down, not the step up.",
  },
  {
    id: "cs-2306",
    tier: "medium",
    topic: "t7",
    universe: "pricing",
    title: "The cheaper shelf down the aisle",
    brief:
      "From: Pricing review. Re: the downward steps. Within each category, walk products by price DESCENDING and show the PREVIOUS product's price — with the ladder inverted, previous means the cheaper shelf below. The dearest product reads NULL.",
    ask: "Show the cheaper price below every rung, per category.",
    template: `SELECT name, category, price,
       {1}(price) OVER (PARTITION BY category ORDER BY price {2}, name ASC) AS cheaper_below
FROM products
ORDER BY category, price DESC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "On a descending ladder the previous row IS the cheaper shelf — LAG; LEAD would borrow the pricier one." },
      { answer: "DESC", kind: "keyword", label: "the ladder direction", why: "The ladder walks dearest-first, so previous lands on the cheaper shelf below." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The sheet prints twelve ladder rows — LIMIT 12 trims the walked aisles." },
    ],
    distractors: ["LEAD", "ASC", "6"],
    walkthrough:
      "The partition scopes the ladder to one aisle; walking DESC makes the previous row the cheaper shelf, which is exactly what LAG borrows; the aisle's dearest product reads NULL. LEAD would borrow the pricier neighbor and the ASC flip would turn the ladder right-side up, breaking the memo's inverted convention.",
  },
  {
    id: "cs-2307",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "Ledger entry gaps per account",
    brief:
      "From: Controller. Re: the booking cadence. For every ledger entry, compute the days since that account's PREVIOUS entry. Stage the LAG per account, then compute julianday days outside the window; an account's first entry reads NULL.",
    ask: "Compute days since the account's previous booking.",
    template: `WITH w AS (
  SELECT id, account, entry_date,
         {1}(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS prev
  FROM ledger_entries
)
SELECT id, account,
       CAST(julianday(entry_date) - julianday({2}) AS INTEGER) AS gap_days
FROM w
ORDER BY account, entry_date, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The cadence measures BACKWARD to the previous booking — LAG; LEAD would measure to the next." },
      { answer: "prev", kind: "keyword", label: "the staged column", why: "The julianday math runs outside the window against the staged prev column — windows cannot nest." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the gap cut", why: "The sheet prints ten gap rows — LIMIT 10 trims the walked book." },
    ],
    distractors: ["LEAD", "entry_date", "5"],
    walkthrough:
      "The partition scopes each chain to one account; LAG borrows the previous booking's date; the outer julianday turns the pair into days. LEAD would compute days UNTIL the next booking — the horizon instead of the cadence. Windows cannot nest inside julianday, which is why the borrow is staged first.",
  },
  {
    id: "cs-2308",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "Back-to-back baskets",
    brief:
      "From: Fraud spot-check. Re: the repeat markers. Walk the global order timeline and flag consecutive orders by the SAME customer: stage the previous row's customer with LAG, then stamp 'back-to-back' when it equals the current customer, else 'solo'. The first row is always 'solo'.",
    ask: "Flag orders that repeat the previous row's customer.",
    template: `WITH w AS (
  SELECT id, customer_id,
         {1}(customer_id) OVER (ORDER BY created_at ASC, id ASC) AS prev_cust
  FROM orders
)
SELECT id, customer_id,
       CASE WHEN prev_cust = customer_id THEN 'back-to-back' ELSE '{2}' END AS flag
FROM w
ORDER BY id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The repeat compares against the PREVIOUS row — LAG; LEAD would compare against the next one." },
      { answer: "solo", kind: "keyword", label: "the solo stamp", why: "The else literal must match the memo exactly: 'solo' for non-repeats." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve flagged rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "single", "6"],
    walkthrough:
      "The staging CTE borrows the previous row's customer over the timeline; the CASE stamps the repeat flag with the memo's literals. LEAD would compare against the NEXT row, shifting every flag one basket back. A wrong literal would pass SQL but poison the downstream filter that counts repeats.",
  },
  {
    id: "cs-2309",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "Cash before mine, per rail",
    brief:
      "From: Fraud spot-check. Re: the rail chains. Walk each payment method's cash-ins chronologically and show the PREVIOUS payment's amount through the SAME rail — each method's own rhythm. Chains reset per method; a rail's first payment reads NULL.",
    ask: "Show the previous payment amount within each method.",
    template: `SELECT id, method, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2} ORDER BY paid_on ASC, id ASC) AS prev_on_rail
FROM payments
ORDER BY method, paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The rail's rhythm looks BACKWARD — LAG; LEAD would borrow the next cash-in." },
      { answer: "method", kind: "keyword", label: "the rail boundary", why: "PARTITION BY method restarts the chain per payment rail." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked rails." },
    ],
    distractors: ["LEAD", "invoice_id", "5"],
    walkthrough:
      "The partition scopes each chain to one rail; LAG borrows the previous payment's amount inside it; the rail's first cash-in reads NULL. Repartitioning by invoice would chain single bills — nearly every value would collapse to the row itself. LEAD would point the rail's rhythm forward.",
  },
  {
    id: "cs-2310",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The next bill in my category",
    brief:
      "From: Spend report. Re: the category chains. Walk each expense category's bills chronologically and show the NEXT bill's date — when the spend type charges again. A category's last bill reads NULL.",
    ask: "Show the next bill date within each category.",
    template: `SELECT id, category, spent_on,
       {1}(spent_on) OVER (PARTITION BY {2} ORDER BY spent_on ASC, id ASC) AS next_in_cat
FROM expenses
ORDER BY category, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The chain peeks FORWARD inside the category — LEAD; LAG would borrow the previous bill." },
      { answer: "category", kind: "keyword", label: "the type boundary", why: "PARTITION BY category restarts the chain per spend type." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked categories." },
    ],
    distractors: ["LAG", "memo", "5"],
    walkthrough:
      "The partition scopes each chain to one spend type; LEAD borrows the following bill's date inside it; the category's last bill reads NULL. Repartitioning by vendor would chain relationships instead of categories. LAG would borrow the previous bill — history, not horizon.",
  },
  {
    id: "cs-2311",
    tier: "medium",
    topic: "t7",
    universe: "growth",
    title: "Delivered chains only",
    brief:
      "From: Growth lead. Re: the completed-basket walk. Among DELIVERED orders only, walk the global timeline and show the PREVIOUS delivered basket's total — the completed-revenue heartbeat, with cancellations invisible. The first delivered order reads NULL.",
    ask: "Show the previous delivered total in the gated walk.",
    template: `SELECT id, total,
       {1}(total) OVER (ORDER BY {2}) AS prev_delivered
FROM orders
WHERE status = 'delivered'
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The gated walk looks BACKWARD — LAG; LEAD would borrow the next delivered basket." },
      { answer: "created_at ASC, id ASC", kind: "keyword", label: "the walk key", why: "The chronology is created_at ASC with the id tiebreak — completed baskets in order." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve walk rows — LIMIT 12 trims the gated timeline." },
    ],
    distractors: ["LEAD", "total DESC", "6"],
    walkthrough:
      "The WHERE gate trims the world to delivered baskets before the window runs, so the chain never sees cancellations; LAG borrows the previous completed total. LEAD would borrow the following one. Ordering by total would scramble the chronology the heartbeat depends on.",
  },
  {
    id: "cs-2312",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "Two bills ahead",
    brief:
      "From: Controller. Re: the long horizon. Walk invoices by issue date and show the amount from TWO invoices ahead — the book's longest lookahead. The last two invoices read NULL.",
    ask: "Show the amount from two invoices ahead.",
    template: `SELECT id, number, amount_cents,
       {1}(amount_cents, {2}) OVER (ORDER BY issued_on ASC, id ASC) AS next2_billed
FROM invoices
ORDER BY issued_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "Looking FORWARD two bills is LEAD with an offset; LAG would look backward." },
      { answer: "2", kind: "keyword", noVerify: true, label: "the step count", why: "Two invoices ahead is offset 2 — LEAD's second argument." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows so the trailing NULLs stay visible — LIMIT 12." },
    ],
    distractors: ["LAG", "1", "6"],
    walkthrough:
      "LEAD(amount_cents, 2) reaches past the immediate neighbor to the bill two steps ahead. Offset 1 would stop one bill short; LAG would face backwards entirely. The LIMIT keeps the walk readable while the trailing NULLs show the horizon running out.",
  },
  {
    id: "cs-2313",
    tier: "medium",
    topic: "t7",
    universe: "supplier",
    title: "The shelf below, per supplier",
    brief:
      "From: Supplier audit. Re: the vendor ladders. Within each supplier, walk products by price ascending and show the PREVIOUS product's price — the shelf just below every rung of the vendor's ladder. The vendor's cheapest product reads NULL.",
    ask: "Show the price below every rung, per supplier.",
    template: `SELECT name, supplier_id, price,
       {1}(price) OVER (PARTITION BY {2} ORDER BY price ASC, name ASC) AS below_on_shelf
FROM products
ORDER BY supplier_id, price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The step BELOW borrows from the previous rung — LAG; LEAD would borrow the pricier one." },
      { answer: "supplier_id", kind: "keyword", label: "the vendor boundary", why: "PARTITION BY supplier_id restarts each ladder per vendor." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The sheet prints twelve ladder rows — LIMIT 12 trims the walked vendors." },
    ],
    distractors: ["LEAD", "category", "6"],
    walkthrough:
      "The partition scopes each ladder to one vendor; LAG borrows the cheaper neighbor inside it; the vendor's floor reads NULL. Repartitioning by category would climb aisles instead of vendor shelves. LEAD would borrow the pricier neighbor — the step up, not the step below.",
  },
  {
    id: "cs-2314",
    tier: "medium",
    topic: "t7",
    universe: "supplier",
    title: "The shelf above, per supplier",
    brief:
      "From: Supplier audit. Re: the upward steps. Within each supplier, walk products by price ascending and show the NEXT product's price — the rung just above. The vendor's dearest product reads NULL.",
    ask: "Show the price above every rung, per supplier.",
    template: `SELECT name, supplier_id, price,
       {1}(price) OVER (PARTITION BY supplier_id ORDER BY price {2}, name ASC) AS above_on_shelf
FROM products
ORDER BY supplier_id, price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The rung ABOVE is one row forward — LEAD; LAG would borrow the cheaper shelf." },
      { answer: "ASC", kind: "keyword", label: "the ladder direction", why: "The ladder climbs cheapest-first — ASC makes next mean the pricier shelf." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The sheet prints twelve ladder rows — LIMIT 12 trims the walked vendors." },
    ],
    distractors: ["LAG", "DESC", "6"],
    walkthrough:
      "The partition scopes each ladder to one vendor; LEAD borrows the pricier neighbor inside it; the vendor's ceiling reads NULL. The DESC flip would walk the shelf downwards so next meant cheaper. LAG would borrow the step below instead.",
  },
  {
    id: "cs-2315",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "Order gaps, whole store",
    brief:
      "From: Fraud spot-check. Re: the sales cadence. Across the whole order timeline, compute the days between consecutive orders: stage the previous created_at with LAG, then turn the pair into days with julianday. The first order reads NULL.",
    ask: "Compute days between consecutive orders, book-wide.",
    template: `WITH w AS (
  SELECT id, created_at,
         {1}(created_at) OVER (ORDER BY created_at ASC, id ASC) AS prev
  FROM orders
)
SELECT id, created_at,
       CAST(julianday(created_at) - julianday({2}) AS INTEGER) AS gap_days
FROM w
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The cadence measures BACKWARD to the previous sale — LAG; LEAD would measure forward." },
      { answer: "prev", kind: "keyword", label: "the staged column", why: "The julianday math runs outside the window against the staged prev column." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve gap rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "created_at", "6"],
    walkthrough:
      "The staging CTE borrows the previous sale's timestamp over the unpartitioned walk; the outer julianday turns the pair into days. LEAD would compute days UNTIL the next sale — the store's pulse pointing forward. Windows cannot nest inside julianday, hence the staging layer.",
  },
  {
    id: "cs-2316",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "Travel's own rhythm",
    brief:
      "From: Spend report. Re: the Travel cadence. Stage the Travel category's monthly spend, then carry the PREVIOUS month's Travel spend beside each — the category's private heartbeat. The first month reads NULL.",
    ask: "Carry the previous month's Travel spend beside each month.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend
  FROM expenses
  WHERE category = '{2}'
  GROUP BY month
)
SELECT month, spend,
       {1}(spend) OVER (ORDER BY month ASC) AS prev_spend
FROM m
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The rhythm looks BACKWARD one month — LAG; LEAD would borrow the next month." },
      { answer: "Travel", kind: "keyword", label: "the category gate", why: "WHERE Travel narrows the fold to the spend type the memo studies." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the series cut", why: "The series sheet prints twelve months — LIMIT 12 trims the walked calendar." },
    ],
    distractors: ["LEAD", "Rent", "2"],
    walkthrough:
      "The gate keeps only Travel bills; the CTE folds one spend per month; LAG over the calendar walk borrows the previous month's figure. Filtering to Rent would study the landlord instead. LEAD would borrow the month ahead — a forecast wearing a retrospective's clothes.",
  },
  {
    id: "cs-2317",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The next billing date",
    brief:
      "From: Controller. Re: the billing horizons. Walk each customer's invoices by issue date and show the NEXT invoice's date — when the account bills again. An account's last invoice reads NULL.",
    ask: "Show the next invoice date per customer.",
    template: `SELECT id, customer_id, issued_on,
       {1}(issued_on) OVER (PARTITION BY {2} ORDER BY issued_on ASC, id ASC) AS next_bill
FROM invoices
ORDER BY customer_id, issued_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The horizon peeks FORWARD within the account — LEAD; LAG would borrow the previous bill." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id restarts each chain per account." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked accounts." },
    ],
    distractors: ["LAG", "status", "5"],
    walkthrough:
      "The partition scopes each chain to one account; LEAD borrows the following bill's date inside it; the account's last invoice reads NULL. Repartitioning by status would chain buckets across all customers. LAG would borrow the previous bill — the history, not the horizon.",
  },
  {
    id: "cs-2318",
    tier: "hard",
    topic: "t7",
    universe: "pricing",
    title: "Line values, one sale back",
    brief:
      "From: Pricing review. Re: the value chains. Walk each product's order lines by id and show the PREVIOUS line's value (quantity times unit price) — how the basket's weight moved sale to sale. First lines read NULL.",
    ask: "Show the previous line value for each product.",
    template: `SELECT id, product_id,
       {1}({2}) OVER (PARTITION BY product_id ORDER BY id ASC) AS prev_value
FROM order_items
ORDER BY product_id, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD to the previous sale — LAG; LEAD would borrow the next one." },
      { answer: "quantity * unit_price", kind: "keyword", label: "the value expression", why: "The chained figure is the line value — the same expression the sheet displays." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked lines." },
    ],
    distractors: ["LEAD", "unit_price", "5"],
    walkthrough:
      "The partition scopes each chain to one product; LAG borrows the previous line's computed value inside it. LEAD would borrow the following sale. Chaining unit_price alone would ignore quantity — a cheaper product sold in bulk would look like a bigger line than it was.",
  },
  {
    id: "cs-2319",
    tier: "medium",
    topic: "t7",
    universe: "inventory",
    title: "The shelf before mine",
    brief:
      "From: Inventory count. Re: the restock chains. Walk products by stock ascending (ties alphabetical) and show the PREVIOUS product's stock — the shelf just below in the restock walk. The emptiest shelf reads NULL.",
    ask: "Show the stock of the shelf below in the walk.",
    template: `SELECT name, stock,
       {1}(stock) OVER (ORDER BY stock {2}, name ASC) AS lower_shelf
FROM products
ORDER BY stock ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The shelf BELOW borrows from the previous rung — LAG; LEAD would borrow the deeper shelf." },
      { answer: "ASC", kind: "keyword", label: "the walk direction", why: "The walk runs emptiest-first — ASC makes previous the shallower shelf." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve shelf rows — LIMIT 12 trims the restock walk." },
    ],
    distractors: ["LEAD", "DESC", "6"],
    walkthrough:
      "LAG borrows the shallower shelf over the ascending walk; the emptiest product reads NULL. LEAD would borrow the deeper shelf, pointing the restock walk upward. The DESC flip would start the walk at the deepest shelf and reverse every step.",
  },
  {
    id: "cs-2320",
    tier: "easy",
    topic: "t7",
    universe: "fraud",
    title: "The next order date",
    brief:
      "From: Fraud spot-check. Re: the forward clock. Across the whole order timeline, show the NEXT order's timestamp — when the store sold again. The final order reads NULL.",
    ask: "Show each order's next timestamp, book-wide.",
    template: `SELECT id, created_at,
       {1}(created_at) OVER (ORDER BY created_at {2}, id ASC) AS next_time
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The clock peeks FORWARD one order — LEAD; LAG would borrow the previous timestamp." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The walk runs oldest to newest — ASC makes next mean later in time." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the timeline." },
    ],
    distractors: ["LAG", "DESC", "6"],
    walkthrough:
      "LEAD borrows the following created_at over the unpartitioned walk; the final order reads NULL. LAG would borrow the previous timestamp — the past, not the future. The DESC flip would reverse the clock so next meant earlier.",
  },
  {
    id: "cs-2321",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "Filled private histories",
    brief:
      "From: Growth lead. Re: no NULL chains on the CRM sheet. Walk each customer's orders and show the PREVIOUS order total, filling each account's FIRST order with 0.0 so the sheet joins cleanly. The fill must be REAL.",
    ask: "Show the previous basket, filling first orders with zero.",
    template: `SELECT id, customer_id, total,
       {1}(total, 1, {2}) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS prev0
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The fill pads the FIRST row — the look-back edge — so LAG; LEAD would pad the last." },
      { answer: "0.0", kind: "keyword", noVerify: true, label: "the edge fill", why: "The third argument fills missing rows — 0.0 keeps the column REAL for the join." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the private timelines." },
    ],
    distractors: ["LEAD", "9.5", "5"],
    walkthrough:
      "LAG(total, 1, 0.0) borrows the previous basket and pads each account's opening edge with 0.0 — the third argument is the default for rows with no past. LEAD with the same fill would pad the LAST order instead, and 9.5 would inject phantom spending into every account's history.",
  },
  {
    id: "cs-2322",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "Cash before mine, rail by rail",
    brief:
      "From: Fraud spot-check. Re: the rail histories. Walk each method's payments chronologically and show the PREVIOUS payment's date — when the rail last paid out. Chains reset per rail; a rail's first payment reads NULL.",
    ask: "Show the previous payment date within each method.",
    template: `SELECT id, method, paid_on,
       {1}(paid_on) OVER (PARTITION BY {2} ORDER BY paid_on ASC, id ASC) AS prev_on_rail
FROM payments
ORDER BY method, paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The rail's history looks BACKWARD — LAG; LEAD would borrow the next payment." },
      { answer: "method", kind: "keyword", label: "the rail boundary", why: "PARTITION BY method restarts the chain per payment rail." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked rails." },
    ],
    distractors: ["LEAD", "paid_on", "5"],
    walkthrough:
      "The partition scopes each chain to one rail; LAG borrows the previous payment's date inside it; the rail's first cash-in reads NULL. Repartitioning by paid date would chain across rails — mixing card and wire into one story. LEAD would point the rail's history forward.",
  },
  {
    id: "cs-2323",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The next charge in my category",
    brief:
      "From: Spend report. Re: the category horizons. Walk each category's bills chronologically and show the NEXT bill's amount — what the spend type charged next. A category's last bill reads NULL.",
    ask: "Show the next bill amount within each category.",
    template: `SELECT id, category, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2} ORDER BY spent_on ASC, id ASC) AS next_in_cat
FROM expenses
ORDER BY category, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The chain peeks FORWARD inside the category — LEAD; LAG would borrow the previous bill." },
      { answer: "category", kind: "keyword", label: "the type boundary", why: "PARTITION BY category restarts the chain per spend type." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sheet prints ten chain rows — LIMIT 10 trims the walked categories." },
    ],
    distractors: ["LAG", "memo", "5"],
    walkthrough:
      "The partition scopes each chain to one spend type; LEAD borrows the following bill's amount inside it; the category's last bill reads NULL. A partition column absent from the table would not run at all. LAG would borrow the previous bill — history, not horizon.",
  },
  {
    id: "cs-2324",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "Steps and levels together",
    brief:
      "From: Controller. Re: the two-column close sheet. Stage monthly revenue, borrow the previous month with LAG, then show BOTH the level (this month's revenue, rounded) and the step (revenue minus prev, rounded) on one row. The first month's step reads NULL.",
    ask: "Show monthly revenue and its step in one sheet.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
)
SELECT month, {2}(revenue, 2) AS level, ROUND(revenue - prev, 2) AS step
FROM d
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The step measures against the PREVIOUS month — LAG; LEAD would subtract the future." },
      { answer: "ROUND", kind: "keyword", label: "the money dressing", why: "Levels are money — ROUND(..., 2) shows clean decimals." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the first NULL step stays visible." },
    ],
    distractors: ["LEAD", "CAST", "6"],
    walkthrough:
      "The staging CTE borrows the previous month; the outer layer dresses the level with ROUND and computes the step against the borrowed value. LEAD would measure against next month. CAST cannot take a precision argument — the dressing is ROUND, and the first month's NULL step marks the edge of history.",
  },
  {
    id: "cs-2325",
    tier: "easy",
    topic: "t7",
    universe: "fraud",
    title: "The basket before, by id",
    brief:
      "From: Fraud spot-check. Re: the id walk. Walk orders by id — the pure insertion order — and show the PREVIOUS order's id, so the examiner can pair every basket with the one booked just before it. The first order reads NULL.",
    ask: "Show the previous order id in insertion order.",
    template: `SELECT id,
       {1}(id) OVER (ORDER BY {2}) AS prev_id
FROM orders
ORDER BY id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The pairing looks BACKWARD one row — LAG; LEAD would borrow the next id." },
      { answer: "id ASC", kind: "keyword", label: "the walk key", why: "The walk is the insertion order itself — id ASC." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the walked book." },
    ],
    distractors: ["LEAD", "total"],
    walkthrough:
      "LAG borrows the previous row's id over the id walk — every order pairs with the one booked just before it. LEAD would borrow the following id, pairing each basket with its successor instead. Ordering by total would scramble the insertion sequence the examiner relies on.",
  },
];
