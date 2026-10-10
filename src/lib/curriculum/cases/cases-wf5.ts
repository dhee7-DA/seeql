// Case batch WF5 — window functions deep-dive, t6 (Partition windows),
// cs-2201…cs-2225.
import type { CaseStudy } from "./types";

export const casesWf5: CaseStudy[] = [
  {
    id: "cs-2201",
    tier: "easy",
    topic: "t6",
    universe: "month-close",
    title: "The rail's heaviest payment",
    brief:
      "From: Controller. Re: the rail ceilings.\n\nOn every payment row show the largest payment made through the SAME method — each rail's ceiling beside every cash-in. The fold resets per method, every payment row survives.",
    ask: "Carry each method's biggest payment on every row.",
    template: `SELECT id, method, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS method_max
FROM payments
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The rail's ceiling is its biggest payment — MAX within the partition; AVG would quote the typical cash-in." },
      { answer: "method", kind: "keyword", label: "the rail boundary", why: "PARTITION BY method scopes the ceiling to each payment rail." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in cash-application order — ORDER BY id walks payments as they landed." },
    ],
    distractors: ["AVG", "invoice_id", "amount_cents"],
    walkthrough:
      "MAX(amount_cents) OVER (PARTITION BY method) finds each rail's ceiling and paints it on every payment made through that rail. AVG would carry the rail's typical payment instead of its peak. Repartitioning by invoice would scope the ceiling to a single bill's installments — the fold would nearly always equal the row itself.",
  },
  {
    id: "cs-2202",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "The lightest invoice per status",
    brief:
      "From: Fraud spot-check. Re: the status floors.\n\nOn every invoice row show the SMALLEST amount within its status bucket — each funnel stage's floor beside every bill. The fold resets per status.",
    ask: "Carry each status's smallest invoice on every row.",
    template: `SELECT number, status, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS status_min
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The bucket's floor is its smallest amount — MIN within the partition; MAX would quote the ceiling." },
      { answer: "status", kind: "keyword", label: "the bucket boundary", why: "PARTITION BY status scopes the floor to each funnel stage's invoices." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["MAX", "customer_id", "amount_cents"],
    walkthrough:
      "MIN(amount_cents) OVER (PARTITION BY status) finds each bucket's floor and paints it on every bill in that bucket. MAX would carry the ceiling — the opposite end of the distribution. Repartitioning by customer would floor each ACCOUNT's invoices, a per-relationship read instead of a per-stage read.",
  },
  {
    id: "cs-2203",
    tier: "medium",
    topic: "t6",
    universe: "inventory",
    title: "Order basket mass on every line",
    brief:
      "From: Inventory count. Re: the basket context.\n\nOn every order-items line show the total quantity of its whole order — the basket's mass beside each item. The fold resets per order, keeping every line.",
    ask: "Carry each order's total quantity on every line.",
    template: `SELECT id, order_id, quantity,
       {1}(quantity) OVER (PARTITION BY {2}) AS order_units
FROM order_items
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The basket's mass is the sum of its lines' quantities — SUM within the partition." },
      { answer: "order_id", kind: "keyword", label: "the basket boundary", why: "PARTITION BY order_id scopes the fold to each order's own lines." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the lines as they were sold." },
    ],
    distractors: ["MAX", "product_id", "quantity"],
    walkthrough:
      "SUM(quantity) OVER (PARTITION BY order_id) totals each basket and paints the mass on every line inside it. MAX would carry the single heaviest line, not the basket. Repartitioning by product would fold each product's lifetime demand — the product story rather than the basket story.",
  },
  {
    id: "cs-2204",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "City basket norms",
    brief:
      "From: Growth lead. Re: the city norms.\n\nJoin orders to customers; on every order show the AVERAGE total across its city — the local norm beside every basket. Round to two decimals; the fold resets per city.",
    ask: "Carry each city's average basket on every order.",
    template: `SELECT o.id, c.city, o.total,
       {1}(o.total) OVER (PARTITION BY {2}) AS city_avg
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The local norm is the mean basket across the city — AVG within the partitioned join." },
      { answer: "c.city", kind: "keyword", label: "the town boundary", why: "PARTITION BY the city column averages each town's orders after the join." },
      { answer: "o.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY o.id walks the orders as they were placed." },
    ],
    distractors: ["SUM", "c.region", "o.total"],
    walkthrough:
      "The join gives every order its city; AVG(o.total) OVER (PARTITION BY c.city) computes each town's norm and paints it on every basket. SUM would carry the city's whole revenue — mass, not norm. Repartitioning by region would average across the whole market, a coarser lens than the memo's city view.",
  },
  {
    id: "cs-2205",
    tier: "medium",
    topic: "t6",
    universe: "expense",
    title: "Monthly spend beside every bill",
    brief:
      "From: Spend report. Re: the calendar context.\n\nOn every expense line show the total spend of its calendar month — the month's mass beside each bill. Partition by the month expression of spent_on.",
    ask: "Carry each month's spend on every expense line.",
    template: `SELECT id, spent_on, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS month_spend
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the month fold", why: "The month's mass is the sum of its bills — SUM within the calendar partition." },
      { answer: "strftime('%Y-%m', spent_on)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the timeline into calendar months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the bills as they were booked." },
    ],
    distractors: ["MAX", "category", "amount_cents"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY the month expression) folds each calendar month's spend and paints it on every bill inside it. MAX would carry the biggest single bill of the month. Repartitioning by category would fold spend types across the whole timeline — the category pie, not the calendar.",
  },
  {
    id: "cs-2206",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "Region exposure mass",
    brief:
      "From: Fraud spot-check. Re: the regional exposure.\n\nJoin open invoices to customers; on every receivable show the total OPEN cents of its region — the market's exposure beside every bill. The gate trims to open first.",
    ask: "Carry each region's open exposure on every open invoice.",
    template: `SELECT i.number, c.region,
       {1}(i.amount_cents) OVER (PARTITION BY {2}) AS region_open
FROM invoices i
JOIN customers c ON c.id = i.customer_id
WHERE i.status = 'open'
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the exposure fold", why: "Regional exposure is the sum of open cents — SUM within the partitioned, gated join." },
      { answer: "c.region", kind: "keyword", label: "the market boundary", why: "PARTITION BY the region column folds each market's open bills after the join." },
      { answer: "i.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY i.id keeps the listing stable." },
    ],
    distractors: ["MAX", "c.city", "i.amount_cents"],
    walkthrough:
      "The gate keeps only open invoices; the join gives each bill its region; SUM folds each market's exposure and paints it on every receivable. MAX would carry the single biggest open bill, not the market's mass. Repartitioning by city would slice the markets into town-level folds.",
  },
  {
    id: "cs-2207",
    tier: "easy",
    topic: "t6",
    universe: "catalog",
    title: "Aisle width on every shelf row",
    brief:
      "From: Warehouse catalog. Re: the aisle width.\n\nOn every product row show how many products share its category — the aisle's width beside each item. The count resets per category; every product keeps its row.",
    ask: "Carry each category's product count on every product.",
    template: `SELECT name, category,
       {1}(*) OVER (PARTITION BY {2}) AS cat_width
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Aisle width is how many products the category holds — COUNT(*) within the partition." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category counts each aisle's slice of the catalog." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["SUM", "supplier_id", "name"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY category) counts each aisle and repeats the width on all its rows. SUM(*) would not run — SUM needs a column. Repartitioning by supplier would count each vendor's shelf instead of each aisle, the sourcing lens rather than the merchandising lens.",
  },
  {
    id: "cs-2208",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "The rail's typical cash-in",
    brief:
      "From: Controller. Re: the rail norms.\n\nOn every payment row show the AVERAGE payment through the same method — each rail's typical cash-in beside every payment. Round to two decimals.",
    ask: "Carry each method's average payment on every row.",
    template: `SELECT id, method, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS method_avg
FROM payments
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The rail's typical cash-in is the mean of its payments — AVG within the partition." },
      { answer: "method", kind: "keyword", label: "the rail boundary", why: "PARTITION BY method averages each payment rail separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in cash-application order — ORDER BY id walks payments as they landed." },
    ],
    distractors: ["COUNT", "invoice_id", "amount_cents"],
    walkthrough:
      "AVG(amount_cents) OVER (PARTITION BY method) computes each rail's norm and repeats it on every one of its payments. COUNT would tally the rail's payments — width, not weight. Repartitioning by invoice would average single-payment bills — every norm would equal the row's own amount.",
  },
  {
    id: "cs-2209",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "Customer spend beside every order",
    brief:
      "From: Growth lead. Re: the account context.\n\nOn every order row show the customer's lifetime spend — the whole relationship beside each basket. The fold resets per customer and keeps two decimals.",
    ask: "Carry each customer's lifetime spend on every order.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY {2}) AS cust_spend
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the relationship fold", why: "Lifetime spend is the sum of the account's totals — SUM within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id scopes the fold to each account's own orders." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["MIN", "status", "created_at"],
    walkthrough:
      "SUM(total) OVER (PARTITION BY customer_id) folds each account's history and paints the total on every one of their baskets. MIN would carry their smallest basket — noise, not relationship. Repartitioning by status would fold each funnel stage across ALL customers, mixing accounts into stage pies.",
  },
  {
    id: "cs-2210",
    tier: "hard",
    topic: "t6",
    universe: "pricing",
    title: "Aisle share of revenue",
    brief:
      "From: Pricing review. Re: the revenue shares.\n\nJoin lines to products; on every line show its category's percent of ALL sold revenue — the aisle's weight in the revenue mix, rounded to two decimals, on every line.",
    ask: "Carry each category's revenue share on every line.",
    template: `SELECT oi.id, p.category,
       {1}(100.0 * SUM(oi.quantity * oi.unit_price) OVER (PARTITION BY {2}) / SUM(oi.quantity * oi.unit_price) OVER (), 2) AS cat_rev_pct
FROM order_items oi
JOIN products p ON p.id = oi.product_id
ORDER BY {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", label: "the percent dressing", why: "Shares read cleanest at two decimals — ROUND dresses the division." },
      { answer: "p.category", kind: "keyword", label: "the slice boundary", why: "PARTITION BY the category column makes the numerator each aisle's revenue." },
      { answer: "oi.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY oi.id walks the lines as they were sold." },
    ],
    distractors: ["CAST", "p.supplier_id", "oi.quantity"],
    walkthrough:
      "The partitioned SUM folds each aisle's revenue; the empty-window SUM folds the whole book; the ratio, scaled by 100.0 and rounded, is the aisle's share — painted on every line that sold it. CAST would flatten the decimals. Repartitioning by supplier would measure vendor weight instead of aisle weight.",
  },
  {
    id: "cs-2211",
    tier: "medium",
    topic: "t6",
    universe: "inventory",
    title: "Supplier stock corridor",
    brief:
      "From: Inventory count. Re: the sourcing corridor.\n\nOn every product row show its supplier's SMALLEST stock — each vendor's thinnest shelf beside every product they provide. The fold resets per supplier.",
    ask: "Carry each supplier's thinnest stock on every product.",
    template: `SELECT name, supplier_id, stock,
       {1}(stock) OVER (PARTITION BY {2}) AS sup_min_stock
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The vendor's thinnest shelf is their smallest stock — MIN within the partition." },
      { answer: "supplier_id", kind: "keyword", label: "the vendor boundary", why: "PARTITION BY supplier_id scopes the floor to each supplier's own goods." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["MAX", "category", "stock"],
    walkthrough:
      "MIN(stock) OVER (PARTITION BY supplier_id) finds each vendor's thinnest shelf and paints it on all their products. MAX would carry their deepest shelf — the opposite end. Repartitioning by category would floor each aisle instead of each vendor, a merchandising read rather than a sourcing read.",
  },
  {
    id: "cs-2212",
    tier: "easy",
    topic: "t6",
    universe: "month-close",
    title: "Status width beside every order",
    brief:
      "From: Controller. Re: the stage widths.\n\nOn every order row show how many orders share its status — the funnel stage's width beside each basket. The count resets per status; every order keeps its row.",
    ask: "Carry each status's order count on every order.",
    template: `SELECT id, status,
       {1}(*) OVER (PARTITION BY {2}) AS status_width
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Stage width is how many orders the status holds — COUNT(*) within the partition." },
      { answer: "status", kind: "keyword", label: "the stage boundary", why: "PARTITION BY status counts each funnel stage's slice." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["SUM", "customer_id", "created_at"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY status) counts each stage and paints the width on all its rows. SUM(*) would not run. Repartitioning by customer would count each account's orders — the account lens instead of the funnel lens.",
  },
  {
    id: "cs-2213",
    tier: "medium",
    topic: "t6",
    universe: "expense",
    title: "Category's heaviest bill",
    brief:
      "From: Spend report. Re: the category peaks.\n\nOn every expense line show the LARGEST single charge within its category — each spend type's peak beside every bill. The fold resets per category.",
    ask: "Carry each category's biggest charge on every line.",
    template: `SELECT id, category, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS cat_peak
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the peak fold", why: "The category's peak is its biggest single charge — MAX within the partition." },
      { answer: "category", kind: "keyword", label: "the peak boundary", why: "PARTITION BY category scopes the peak to each spend type." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the bills as they were booked." },
    ],
    distractors: ["AVG", "spent_on", "amount_cents"],
    walkthrough:
      "MAX(amount_cents) OVER (PARTITION BY category) finds each spend type's peak and paints it on every line in that type. AVG would carry the typical bill instead of the peak. Repartitioning by spent date would fold each calendar day — nearly every peak would equal the row itself.",
  },
  {
    id: "cs-2214",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "Customer invoice corridor",
    brief:
      "From: Fraud spot-check. Re: the billing corridor.\n\nOn every invoice row show its customer's SMALLEST invoice amount — the account's billing floor beside every bill. The fold resets per customer.",
    ask: "Carry each customer's smallest invoice on every row.",
    template: `SELECT number, customer_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS cust_floor
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The account's billing floor is its smallest bill — MIN within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id scopes the floor to each account's invoices." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["MAX", "status", "amount_cents"],
    walkthrough:
      "MIN(amount_cents) OVER (PARTITION BY customer_id) floors each account's billing and paints it on all their invoices. MAX would carry their ceiling instead. Repartitioning by status would floor each bucket across ALL customers — open bills floored by other people's open bills.",
  },
  {
    id: "cs-2215",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "Region basket norms, delivered only",
    brief:
      "From: Growth lead. Re: the delivered norms.\n\nAmong DELIVERED orders, join to customers and paint every basket with its region's AVERAGE delivered total — the market norm on real, completed baskets only. Round to two decimals.",
    ask: "Carry each region's average delivered basket on every row.",
    template: `SELECT o.id, c.region, o.total,
       {1}(o.total) OVER (PARTITION BY {2}) AS region_norm
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status = '{3}'
ORDER BY o.id;`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The market norm is the mean delivered basket — AVG within the partitioned, gated join." },
      { answer: "c.region", kind: "keyword", label: "the market boundary", why: "PARTITION BY the region column averages each market's delivered baskets." },
      { answer: "delivered", kind: "keyword", label: "the gate chip", why: "WHERE delivered trims the world first — the norm must describe completed baskets, not intentions." },
    ],
    distractors: ["SUM", "c.city", "pending"],
    walkthrough:
      "The gate keeps delivered baskets; the join gives each its region; AVG folds each market's norm and paints it on every basket. SUM would carry the market's whole delivered revenue — mass, not norm. Filtering to pending would norm intentions. Repartitioning by city would tighten the lens to towns.",
  },
  {
    id: "cs-2216",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "Aisle stock mass",
    brief:
      "From: Warehouse catalog. Re: the aisle mass.\n\nOn every product row show its category's TOTAL stock — the aisle's inventory mass beside every shelf row. The fold resets per category.",
    ask: "Carry each category's total stock on every product.",
    template: `SELECT name, category, stock,
       {1}(stock) OVER (PARTITION BY {2}) AS cat_stock
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The aisle's mass is the sum of its shelves — SUM within the partition." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category totals each aisle's inventory." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["MIN", "supplier_id", "stock"],
    walkthrough:
      "SUM(stock) OVER (PARTITION BY category) folds each aisle's inventory and paints the mass on all its rows. MIN would carry the aisle's thinnest shelf. Repartitioning by supplier would fold each vendor's goods — the sourcing lens rather than the aisle lens.",
  },
  {
    id: "cs-2217",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Ledger account entry widths",
    brief:
      "From: Controller. Re: the account widths.\n\nOn every ledger entry show how many entries its account holds — the account's activity width beside each booking. The count resets per account.",
    ask: "Carry each account's entry count on every entry.",
    template: `SELECT id, account,
       {1}(*) OVER (PARTITION BY {2}) AS account_width
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Account width is how many entries it holds — COUNT(*) within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account counts each ledger account's slice." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["SUM", "entry_date", "debit_cents"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY account) counts each account's entries and repeats the width on all of them. SUM(*) would not run. Repartitioning by entry date would count each calendar day across all accounts — mixing the book together.",
  },
  {
    id: "cs-2218",
    tier: "hard",
    topic: "t6",
    universe: "fraud",
    title: "Customer basket corridor",
    brief:
      "From: Fraud spot-check. Re: the spending corridor.\n\nOn every order row show BOTH ends of the customer's basket history — their smallest and biggest totals — beside the current basket. Two folds, one partition.",
    ask: "Carry each customer's basket corridor on every order.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY customer_id) AS cust_min,
       {2}(total) OVER (PARTITION BY customer_id) AS cust_max
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The corridor's low end is the account's smallest basket — MIN." },
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The corridor's high end is the account's biggest basket — MAX." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["AVG", "SUM", "total"],
    walkthrough:
      "Two windows share the customer partition: MIN stamps the account's floor basket, MAX their ceiling — every order row carries the corridor it lives in. AVG would collapse the corridor into one norm. SUM would produce a meaningless pile of money beside each basket.",
  },
  {
    id: "cs-2219",
    tier: "medium",
    topic: "t6",
    universe: "supplier",
    title: "Supplier revenue share per line",
    brief:
      "From: Supplier audit. Re: the sourcing shares.\n\nJoin lines to products; on every line show its SUPPLIER's percent of all sold revenue — the vendor's weight in the mix, rounded to two decimals.",
    ask: "Carry each supplier's revenue share on every line.",
    template: `SELECT oi.id, s.name AS supplier,
       {1}(100.0 * SUM(oi.quantity * oi.unit_price) OVER (PARTITION BY {2}) / SUM(oi.quantity * oi.unit_price) OVER (), 2) AS sup_pct
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON s.id = p.supplier_id
ORDER BY {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", label: "the percent dressing", why: "Shares read cleanest at two decimals — ROUND dresses the division." },
      { answer: "p.supplier_id", kind: "keyword", label: "the vendor slice", why: "PARTITION BY the supplier key makes the numerator each vendor's revenue." },
      { answer: "oi.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY oi.id walks the lines as they were sold." },
    ],
    distractors: ["CAST", "p.category", "s.region"],
    walkthrough:
      "The partitioned SUM folds each vendor's revenue through the join; the empty-window SUM folds the whole book; the rounded ratio is the vendor's weight, painted on every line they sold. CAST would flatten the decimals. Repartitioning by category would measure aisle weight — the merchandising mix rather than the sourcing mix.",
  },
  {
    id: "cs-2220",
    tier: "easy",
    topic: "t6",
    universe: "funnel",
    title: "The stage's earliest order",
    brief:
      "From: Marketing funnel. Re: the stage openings.\n\nOn every order row show the EARLIEST created_at within its status — each funnel stage's opening time beside every basket. The fold resets per status.",
    ask: "Carry each status's earliest order on every row.",
    template: `SELECT id, status, created_at,
       {1}(created_at) OVER (PARTITION BY {2}) AS stage_open
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the opening fold", why: "The stage's opening is its earliest date — MIN within the partition." },
      { answer: "status", kind: "keyword", label: "the stage boundary", why: "PARTITION BY status scopes the opening to each funnel stage." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["MAX", "customer_id", "created_at"],
    walkthrough:
      "MIN(created_at) OVER (PARTITION BY status) finds each stage's opening and paints it on every basket in that stage. MAX would carry the stage's latest order instead. Repartitioning by customer would open each account's history — a personal timeline, not a funnel one.",
  },
  {
    id: "cs-2221",
    tier: "medium",
    topic: "t6",
    universe: "inventory",
    title: "Product line counts beside every sale",
    brief:
      "From: Inventory count. Re: the demand width.\n\nOn every order-items line show how many lines its product has sold across the book — the product's demand width beside each sale. The count resets per product.",
    ask: "Carry each product's line count on every line.",
    template: `SELECT id, product_id,
       {1}(*) OVER (PARTITION BY {2}) AS product_lines
FROM order_items
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Demand width is how many lines the product sold — COUNT(*) within the partition." },
      { answer: "product_id", kind: "keyword", label: "the demand boundary", why: "PARTITION BY product_id counts each product's own lines." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the lines as they were sold." },
    ],
    distractors: ["SUM", "order_id", "quantity"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY product_id) counts each product's lines and repeats the width on all of them. SUM(*) would not run. Repartitioning by order would count each basket's lines — the basket lens instead of the product lens.",
  },
  {
    id: "cs-2222",
    tier: "medium",
    topic: "t6",
    universe: "expense",
    title: "Vendor bill norms",
    brief:
      "From: Spend report. Re: the vendor norms.\n\nOn every expense line show the AVERAGE bill for its vendor — the relationship's typical charge beside every bill. Round to two decimals; the fold resets per vendor.",
    ask: "Carry each vendor's average bill on every line.",
    template: `SELECT id, vendor, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS vendor_avg
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The relationship's typical charge is the mean of their bills — AVG within the partition." },
      { answer: "vendor", kind: "keyword", label: "the relationship boundary", why: "PARTITION BY vendor averages each supplier relationship separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the bills as they were booked." },
    ],
    distractors: ["COUNT", "spent_on", "amount_cents"],
    walkthrough:
      "AVG(amount_cents) OVER (PARTITION BY vendor) computes each vendor's norm and paints it on their every bill. COUNT would tally bills — width, not weight. Repartitioning by spent date would average each calendar day across all vendors, mixing relationships.",
  },
  {
    id: "cs-2223",
    tier: "hard",
    topic: "t6",
    universe: "month-close",
    title: "Paid versus billed, per customer",
    brief:
      "From: Controller. Re: the two-fold row.\n\nOn every invoice row show the customer's total billed AND total paid cents — two folds, both partitioned by customer, so collections sees the balance shape beside every bill. Paid cents need a windowed subquery fold joined back — or simply two windows over the invoice's own amounts and the payments staged separately. For this card, show billed total and the invoice's percent of it.",
    ask: "Show each customer's billed total beside every invoice.",
    template: `SELECT number, customer_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS cust_billed,
       ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY customer_id), 2) AS bill_pct
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the billed fold", why: "The customer's total billed is the sum of their invoice amounts — SUM within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id scopes both folds to each account's invoices." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["MAX", "status", "amount_cents"],
    walkthrough:
      "Two windows share the customer partition: the first paints the account's total billing, the second the bill's percent of that mass. MAX would quote the biggest bill as the relationship. Repartitioning by status would fold open and paid bills into bucket pies, hiding the account's whole story.",
  },
  {
    id: "cs-2224",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "Region order width",
    brief:
      "From: Growth lead. Re: the market widths.\n\nJoin orders to customers; on every order show how many orders its whole REGION placed — the market's width beside every basket. The count resets per region after the join.",
    ask: "Carry each region's order count on every order.",
    template: `SELECT o.id, c.region,
       {1}(*) OVER (PARTITION BY {2}) AS region_width
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Market width is how many orders the region placed — COUNT(*) within the partitioned join." },
      { answer: "c.region", kind: "keyword", label: "the market boundary", why: "PARTITION BY the region column counts each market's orders after the join." },
      { answer: "o.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY o.id walks the orders as they were placed." },
    ],
    distractors: ["SUM", "c.city", "o.total"],
    walkthrough:
      "The join gives every order its market; COUNT(*) OVER (PARTITION BY c.region) counts each region's orders and paints the width on every basket. SUM(*) would not run. Repartitioning by city would count towns — a finer geography than the memo's market view.",
  },
  {
    id: "cs-2225",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "The account's latest booking",
    brief:
      "From: Fraud spot-check. Re: the account recency.\n\nOn every ledger entry show the LATEST entry date within its account — each account's most recent activity beside every booking. The fold resets per account.",
    ask: "Carry each account's latest entry date on every entry.",
    template: `SELECT id, account, entry_date,
       {1}(entry_date) OVER (PARTITION BY {2}) AS account_latest
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the recency fold", why: "The account's latest activity is its biggest date — MAX within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account scopes the recency to each ledger account." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["MIN", "entry_date", "debit_cents"],
    walkthrough:
      "MAX(entry_date) OVER (PARTITION BY account) finds each account's most recent booking and paints it on all their entries. MIN would carry the account's opening date instead. Repartitioning by entry date would collapse every partition to one row's date — the recency signal would vanish.",
  },
];
