// Case batch WF4 — window functions deep-dive, t6 (Partition windows),
// cs-2176…cs-2200. Aggregate windows that keep every row, partitioned.
import type { CaseStudy } from "./types";

export const casesWf4: CaseStudy[] = [
  {
    id: "cs-2176",
    tier: "easy",
    topic: "t6",
    universe: "pricing",
    title: "The aisle's typical price",
    brief:
      "From: Pricing review. Re: the aisle benchmark.\n\nEvery product row should carry its aisle's average price next to its own — the benchmark the pricing team eyeballs. Keep all sixteen products; the average resets at each category edge.",
    ask: "Show each product beside its category's average price.",
    template: `SELECT name, category, price,
       {1}(price) OVER (PARTITION BY {2}) AS cat_avg
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the benchmark fold", why: "The aisle benchmark is the mean price — AVG; MIN would quote the cheapest shelf instead." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category restarts the average per aisle — the benchmark the memo wants." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks the shelf as it was stocked." },
    ],
    distractors: ["MIN", "supplier_id", "price"],
    walkthrough:
      "AVG(price) OVER (PARTITION BY category) computes the mean within each aisle and paints it onto every product row — no GROUP BY collapse, all sixteen products survive. Repartitioning by supplier would benchmark each vendor's shelf instead of each aisle. Swapping AVG for MIN turns the benchmark into the floor price, a different and much meaner number.",
  },
  {
    id: "cs-2177",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "How big is my account",
    brief:
      "From: Growth lead. Re: the account-size column.\n\nOn every order row, show how many orders that customer has placed — the account size riding along with each basket. The count resets per customer, and every order keeps its row.",
    ask: "Carry each customer's order count on every order.",
    template: `SELECT id, customer_id, {1}(*) OVER (PARTITION BY {2}) AS cust_orders
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the size counter", why: "Account size is how many orders the customer placed — COUNT(*) within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id counts within each account — the reset the column needs." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["SUM", "status", "total"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY customer_id) counts each account's slice and repeats it on every one of that account's rows. SUM(*) would not run — SUM needs a column to add. Repartitioning by status would count each funnel stage's size instead, putting the same number on orders from every customer in that stage.",
  },
  {
    id: "cs-2178",
    tier: "medium",
    topic: "t6",
    universe: "pricing",
    title: "Gap to the aisle ceiling",
    brief:
      "From: Pricing review. Re: the headroom report.\n\nFor every product, show how far its price sits below the category's ceiling — the headroom a discount could eat before the product becomes its aisle's cheapest. Round to two decimals.",
    ask: "Show each product's gap below its category's top price.",
    template: `SELECT name, category, price,
       {3}({1}(price) OVER (PARTITION BY {2}) - price, 2) AS headroom
FROM products
ORDER BY id;`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The aisle ceiling is the highest price — MAX; AVG would measure distance to the typical shelf instead." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category makes the ceiling local to each aisle, not the whole store." },
      { answer: "ROUND", kind: "keyword", label: "the money dressing", why: "Headroom is money — ROUND(..., 2) shows clean decimals; CAST would need a different argument shape." },
    ],
    distractors: ["MIN", "supplier_id", "CAST"],
    walkthrough:
      "MAX(price) OVER (PARTITION BY category) repeats each aisle's ceiling on all its rows; subtracting the row's own price yields the headroom, dressed with ROUND to two decimals. The partition makes the ceiling local to each aisle — a global MAX would measure everything against the dearest product in the store. MIN would compute a negative headroom against the floor.",
  },
  {
    id: "cs-2179",
    tier: "easy",
    topic: "t6",
    universe: "expense",
    title: "Category spend on every line",
    brief:
      "From: Spend report. Re: the per-line context.\n\nEvery expense line should show its category's total spend beside its own amount — the line's share of the pie at a glance. Keep every line; the total resets per category.",
    ask: "Carry each category's total spend on every line.",
    template: `SELECT id, category, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS cat_total
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the spend fold", why: "Category total is the sum of its lines — SUM within the partition; MAX would quote only the biggest charge." },
      { answer: "category", kind: "keyword", label: "the spend boundary", why: "PARTITION BY category totals each spend type — the pie the memo slices." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the expenses as they were booked." },
    ],
    distractors: ["MAX", "spent_on", "amount_cents"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY category) folds each category's spend and paints the total on every one of its lines. Repartitioning by vendor would show each vendor's spend instead — supplier view, not category view. MAX would carry the single biggest charge rather than the whole pie.",
  },
  {
    id: "cs-2180",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Billed per customer, per invoice",
    brief:
      "From: Controller. Re: the AR context column.\n\nOn every invoice row, show the customer's total billed cents — the account's whole relationship beside each individual bill. The sum resets per customer.",
    ask: "Carry each customer's total invoiced on every invoice.",
    template: `SELECT number, customer_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS cust_billed
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the billed fold", why: "The customer's total billed is the sum of their invoice amounts — SUM within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id scopes the total to each account's invoices." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the AR listing stable." },
    ],
    distractors: ["COUNT", "status", "amount_cents"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY customer_id) walks each account's invoices and paints their total on every row. COUNT would tally invoice numbers — a count of bills, not of money. Repartitioning by status would mix paid and open invoices into the same total, quietly hiding the receivable story.",
  },
  {
    id: "cs-2181",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Paid so far, per invoice",
    brief:
      "From: Controller. Re: the settlement context.\n\nOn every payment row, show the total paid on THAT invoice across all its payments — the settlement picture beside each installment. The fold resets per invoice.",
    ask: "Carry each invoice's total paid on every payment.",
    template: `SELECT id, invoice_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS invoice_paid
FROM payments
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the settlement fold", why: "Total paid per invoice is the sum of its payments — SUM within the partition." },
      { answer: "invoice_id", kind: "keyword", label: "the bill boundary", why: "PARTITION BY invoice_id scopes the fold to each bill's own installments." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in cash-application order — ORDER BY id walks payments as they landed." },
    ],
    distractors: ["AVG", "method", "paid_on"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY invoice_id) totals each bill's installments and repeats the figure on every one of them. AVG would quote the typical installment — useful elsewhere, wrong here. Repartitioning by method would fold card and wire payments across DIFFERENT invoices into one number, mixing unrelated bills.",
  },
  {
    id: "cs-2182",
    tier: "easy",
    topic: "t6",
    universe: "month-close",
    title: "Account debit mass",
    brief:
      "From: Controller. Re: the ledger context.\n\nEvery ledger entry should carry its account's total debit mass beside its own debit — the account's weight at a glance. The fold resets per account.",
    ask: "Carry each account's total debits on every entry.",
    template: `SELECT id, account, debit_cents,
       {1}(debit_cents) OVER (PARTITION BY {2}) AS account_debits
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The account's debit mass is the sum of its debit cents — SUM within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account scopes the fold to each ledger account's entries." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["MIN", "entry_date", "debit_cents"],
    walkthrough:
      "SUM(debit_cents) OVER (PARTITION BY account) folds each account's debits and paints the total on every entry. MIN would quote the smallest debit ever booked to the account — context of a different kind. Repartitioning by entry date would fold each calendar day across ALL accounts, mixing the book together.",
  },
  {
    id: "cs-2183",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "Share of the aisle's stock",
    brief:
      "From: Warehouse catalog. Re: the shelf-share column.\n\nFor every product show its stock as a percent of its category's total stock — the shelf share. Multiply by 100.0 before dividing, round to two decimals, and keep every product row.",
    ask: "Show each product's percent of its category's stock.",
    template: `SELECT name, category, stock,
       {1}(100.0 * stock / SUM(stock) OVER (PARTITION BY {2}), 2) AS shelf_share
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", label: "the percent dressing", why: "Shares read cleanest rounded to two decimals — ROUND dresses the division." },
      { answer: "category", kind: "keyword", label: "the pie boundary", why: "PARTITION BY category makes the pie each aisle's stock, not the whole warehouse." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["CAST", "supplier_id", "stock"],
    walkthrough:
      "The windowed SUM totals each aisle's stock; dividing the row's stock by that pie and multiplying by 100.0 first avoids integer truncation; ROUND tidies the decimals. Repartitioning by supplier would compute each vendor's shelf share instead. CAST to INTEGER would truncate every share to a whole number and flatten the report.",
  },
  {
    id: "cs-2184",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "Region revenue on every order",
    brief:
      "From: Growth lead. Re: the regional context.\n\nJoin orders to customers and paint each order with its region's total revenue — the market context beside every basket. The fold resets per region and keeps two decimals.",
    ask: "Carry each region's revenue on every order.",
    template: `SELECT o.id, c.region,
       {1}(o.total) OVER (PARTITION BY {2}) AS region_revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the market fold", why: "Region revenue is the sum of its orders' totals — SUM within the partitioned join." },
      { answer: "c.region", kind: "keyword", label: "the market boundary", why: "PARTITION BY the region column folds each market's orders after the join." },
      { answer: "o.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY o.id walks the orders as they were placed." },
    ],
    distractors: ["AVG", "c.city", "o.total"],
    walkthrough:
      "After the join, every order row knows its region; SUM(o.total) OVER (PARTITION BY c.region) folds each market's orders and paints the total on every basket. AVG would carry the typical basket of the region instead of its whole revenue. Repartitioning by city would slice the markets into city-level folds — a finer report than the memo wants.",
  },
  {
    id: "cs-2185",
    tier: "medium",
    topic: "t6",
    universe: "pricing",
    title: "The aisle price corridor",
    brief:
      "From: Pricing review. Re: the corridor columns.\n\nOn every product row show the category's cheapest and dearest prices side by side — the corridor the aisle trades within. Both folds reset per category.",
    ask: "Show each category's price corridor on every product.",
    template: `SELECT name, category, price,
       {1}(price) OVER (PARTITION BY category) AS cat_min,
       {2}(price) OVER (PARTITION BY category) AS cat_max
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The corridor's low end is the cheapest price in the aisle — MIN." },
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The corridor's high end is the dearest price in the aisle — MAX." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["AVG", "SUM", "price"],
    walkthrough:
      "Two windows share one partition: MIN stamps the aisle floor, MAX stamps the ceiling, and every product row carries both — the corridor it lives in. AVG would replace the corridor with a single typical number; SUM would produce a meaningless pile of prices. The partition is what keeps the corridor local to each aisle.",
  },
  {
    id: "cs-2186",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "My share of my status's money",
    brief:
      "From: Fraud spot-check. Re: the status mix column.\n\nOn every order row show the basket's percent of its status group's revenue — how much of the delivered money, or the cancelled money, this one basket is. Round to two decimals.",
    ask: "Show each order's percent of its status revenue.",
    template: `SELECT id, status,
       {1}(100.0 * total / SUM(total) OVER (PARTITION BY {2}), 2) AS status_pct
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", label: "the percent dressing", why: "Percents read cleanest at two decimals — ROUND dresses the division." },
      { answer: "status", kind: "keyword", label: "the pie boundary", why: "PARTITION BY status makes the pie each funnel stage's revenue." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["CAST", "customer_id", "total"],
    walkthrough:
      "The windowed SUM totals each status group's revenue; the row's total divided by that pie, times 100.0 up front, is the share; ROUND tidies it. Repartitioning by customer would measure each basket against its OWNER's spend — a customer-concentration read, not a status mix. CAST to INTEGER would flatten every share.",
  },
  {
    id: "cs-2187",
    tier: "easy",
    topic: "t6",
    universe: "supplier",
    title: "The supplier's shelf width",
    brief:
      "From: Supplier audit. Re: the shelf-width column.\n\nOn every product row show how many products that supplier provides — the shelf width beside each item. The count resets per supplier.",
    ask: "Carry each supplier's product count on every product.",
    template: `SELECT name, supplier_id,
       {1}(*) OVER (PARTITION BY {2}) AS supplier_products
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Shelf width is how many products the supplier provides — COUNT(*) within the partition." },
      { answer: "supplier_id", kind: "keyword", label: "the shelf boundary", why: "PARTITION BY supplier_id counts each supplier's slice of the catalog." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["SUM", "category", "name"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY supplier_id) counts each supplier's products and repeats the figure on every one of their rows. SUM(*) would not run — SUM needs a column. Repartitioning by category would count each aisle's products instead, a merchandising number wearing a supplier label.",
  },
  {
    id: "cs-2188",
    tier: "medium",
    topic: "t6",
    universe: "inventory",
    title: "Units behind every line",
    brief:
      "From: Inventory count. Re: the demand context.\n\nOn every order-items line, show the total units ever sold of that product — the product's lifetime demand beside each sale. The fold resets per product.",
    ask: "Carry each product's total units on every line.",
    template: `SELECT id, product_id, quantity,
       {1}(quantity) OVER (PARTITION BY {2}) AS product_units
FROM order_items
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the demand fold", why: "Lifetime demand is the sum of the product's quantities — SUM within the partition." },
      { answer: "product_id", kind: "keyword", label: "the demand boundary", why: "PARTITION BY product_id scopes the fold to each product's own lines." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the lines as they were sold." },
    ],
    distractors: ["MAX", "order_id", "quantity"],
    walkthrough:
      "SUM(quantity) OVER (PARTITION BY product_id) totals each product's movement and paints it on every line that sold it. MAX would quote the biggest single basket of that product, not its lifetime demand. Repartitioning by order would fold each order's own lines — the basket total, not the product story.",
  },
  {
    id: "cs-2189",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "The customer's delivered world",
    brief:
      "From: Controller. Re: the delivered context.\n\nAmong DELIVERED orders only, show each order's customer total — the account's delivered revenue beside every delivered basket. The gate runs first; the fold resets per customer.",
    ask: "Carry each customer's delivered revenue on their delivered orders.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY customer_id) AS delivered_spend
FROM orders
WHERE status = '{2}'
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the delivered fold", why: "Delivered revenue per customer is the sum of their delivered totals — SUM within the partition." },
      { answer: "delivered", kind: "keyword", label: "the status gate", why: "WHERE delivered narrows the world first — the window then folds only real, completed baskets." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the delivered baskets as they landed." },
    ],
    distractors: ["MAX", "pending", "created_at"],
    walkthrough:
      "The WHERE gate trims the world to delivered baskets; the windowed SUM folds each customer's survivors and paints the total on their rows. Filtering to pending would measure intentions, not income. MAX would carry the biggest single delivered basket instead of the account's whole delivered story.",
  },
  {
    id: "cs-2190",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "The status basket norm",
    brief:
      "From: Controller. Re: the norm column.\n\nOn every order row show the AVERAGE total of orders sharing its status — the typical basket of that funnel stage beside each basket. Round to two decimals.",
    ask: "Carry each status's average basket on every order.",
    template: `SELECT id, status, total,
       {1}(total) OVER (PARTITION BY {2}) AS status_avg
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The stage's typical basket is the mean of its totals — AVG within the partition." },
      { answer: "status", kind: "keyword", label: "the stage boundary", why: "PARTITION BY status averages each funnel stage separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["COUNT", "customer_id", "total"],
    walkthrough:
      "AVG(total) OVER (PARTITION BY status) computes each stage's mean basket and repeats it on every one of its rows. COUNT would tally the stage's orders — width, not weight. Repartitioning by customer would average each person's baskets, personal context instead of stage context.",
  },
  {
    id: "cs-2191",
    tier: "hard",
    topic: "t6",
    universe: "fraud",
    title: "Open invoices per customer",
    brief:
      "From: Fraud spot-check. Re: the exposure width.\n\nAmong OPEN invoices only, show on every row how many open invoices that customer holds — the exposure width beside each receivable. The gate runs before the window so partitions hold only open bills.",
    ask: "Count each customer's open invoices on every open row.",
    template: `SELECT number, customer_id,
       {1}(*) OVER (PARTITION BY {2}) AS cust_open
FROM invoices
WHERE status = '{3}'
ORDER BY id;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Exposure width is how many open bills the customer holds — COUNT(*) within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id counts each account's open slice." },
      { answer: "open", kind: "keyword", label: "the exposure gate", why: "WHERE open trims the world first — paid and void bills must not inflate the width." },
    ],
    distractors: ["SUM", "status", "paid"],
    walkthrough:
      "The gate keeps only open invoices; the windowed COUNT then reports each customer's open width on every one of their rows. Filtering to paid would count history instead of exposure. SUM(*) would not run. Repartitioning by status after that gate would put every row alone in its partition — every width would read 1.",
  },
  {
    id: "cs-2192",
    tier: "medium",
    topic: "t6",
    universe: "expense",
    title: "Vendor mass on every line",
    brief:
      "From: Spend report. Re: the vendor context.\n\nOn every expense line show the vendor's total spend across the book — the relationship size beside each bill. The fold resets per vendor, not per category.",
    ask: "Carry each vendor's total spend on every line.",
    template: `SELECT id, vendor, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS vendor_total
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the vendor fold", why: "The vendor's total spend is the sum of their lines — SUM within the partition." },
      { answer: "vendor", kind: "keyword", label: "the relationship boundary", why: "PARTITION BY vendor folds each supplier relationship separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the expenses as they were booked." },
    ],
    distractors: ["MIN", "spent_on", "amount_cents"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY vendor) folds each vendor's book and paints the total on their every line. MIN would quote the smallest bill — noise, not relationship. Repartitioning by category would fold spend types instead of suppliers, the category pie rather than the vendor ledger.",
  },
  {
    id: "cs-2193",
    tier: "medium",
    topic: "t6",
    universe: "catalog",
    title: "Demand beside every sale",
    brief:
      "From: Warehouse catalog. Re: the demand column.\n\nJoin lines to products and paint each line with its category's total units sold — the aisle's demand beside every sale. The fold resets per category after the join.",
    ask: "Carry each category's unit demand on every line.",
    template: `SELECT oi.id, p.category,
       {1}(oi.quantity) OVER (PARTITION BY {2}) AS cat_units
FROM order_items oi
JOIN products p ON p.id = oi.product_id
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the demand fold", why: "The aisle's demand is the sum of its lines' quantities — SUM within the partitioned join." },
      { answer: "p.category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY the category column folds each aisle's demand after the join." },
      { answer: "oi.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY oi.id walks the lines as they were sold." },
    ],
    distractors: ["AVG", "p.supplier_id", "oi.quantity"],
    walkthrough:
      "The join attaches each line to its product's category; SUM(oi.quantity) OVER (PARTITION BY p.category) folds each aisle's movement and paints it on every sale. AVG would carry the typical line size instead of the aisle's whole demand. Repartitioning by supplier would produce vendor-level demand — the sourcing view, not the merchandising view.",
  },
  {
    id: "cs-2194",
    tier: "hard",
    topic: "t6",
    universe: "growth",
    title: "Orders in my month",
    brief:
      "From: Growth lead. Re: the calendar context.\n\nOn every order row show how many orders share its calendar month — the month's width beside each basket. Partition by the month expression of created_at.",
    ask: "Carry each month's order count on every order.",
    template: `SELECT id, created_at,
       {1}(*) OVER (PARTITION BY {2}) AS month_orders
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "The month's width is how many orders it holds — COUNT(*) within the partition." },
      { answer: "strftime('%Y-%m', created_at)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the timeline into calendar months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["SUM", "customer_id", "created_at"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY strftime(...)) slices the timeline by month and paints each month's width on its orders. Repartitioning by customer would count each account's orders — the account lens, not the calendar lens. SUM(*) would not run; the counter needs no column.",
  },
  {
    id: "cs-2195",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "My account's net mass",
    brief:
      "From: Fraud spot-check. Re: the net context.\n\nOn every ledger entry show its account's net movement — debits minus credits summed across the account — beside the entry's own net. The fold resets per account.",
    ask: "Carry each account's net on every entry.",
    template: `SELECT id, account, debit_cents - credit_cents AS net,
       {1}(debit_cents - credit_cents) OVER (PARTITION BY {2}) AS account_net
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the net fold", why: "The account's net is the sum of its signed movements — SUM within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account scopes the net to each ledger account." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["MAX", "entry_date", "debit_cents"],
    walkthrough:
      "The row's own net is debit minus credit; the windowed SUM of the same expression folds each account's whole story and paints it beside every entry. MAX would quote the biggest single movement — a spike, not a balance. Repartitioning by entry date would fold all accounts day by day, mixing the book.",
  },
  {
    id: "cs-2196",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "The customer's basket norm",
    brief:
      "From: Growth lead. Re: the personal norm.\n\nOn every order row show the AVERAGE total of that customer's orders — the account's typical basket beside each purchase. Round to two decimals; the fold resets per customer.",
    ask: "Carry each customer's average basket on every order.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY {2}) AS cust_avg
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The account's typical basket is the mean of their totals — AVG within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id averages each account's own baskets." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["MAX", "status", "total"],
    walkthrough:
      "AVG(total) OVER (PARTITION BY customer_id) computes each account's norm and repeats it on every one of their orders. MAX would carry their biggest basket — the ceiling, not the norm. Repartitioning by status would average each funnel stage's baskets, stage context instead of account context.",
  },
  {
    id: "cs-2197",
    tier: "medium",
    topic: "t6",
    universe: "pricing",
    title: "Above or below my aisle",
    brief:
      "From: Pricing review. Re: the position flags.\n\nFlag every product against its aisle's average: 'above' when the price strictly beats the category average, else 'at-or-below'. The benchmark is a windowed AVG; the flag is a CASE.",
    ask: "Flag each product against its category average.",
    template: `SELECT name, category, price,
       CASE WHEN price > {1}(price) OVER (PARTITION BY {2}) THEN 'above' ELSE 'at-or-below' END AS flag
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the benchmark fold", why: "The aisle benchmark is the mean price — AVG; MAX would compare against the ceiling instead." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category benchmarks each aisle separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["MIN", "supplier_id", "price"],
    walkthrough:
      "The windowed AVG paints each aisle's benchmark on every row; the CASE compares the row's price against it and stamps the flag. MIN would make almost everything 'above' — the floor is a poor benchmark. Repartitioning by supplier would benchmark each vendor's shelf instead of each aisle.",
  },
  {
    id: "cs-2198",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "The invoice's own weight",
    brief:
      "From: Controller. Re: the bill share.\n\nOn every invoice row show the bill's percent of its customer's total billing — how much of the relationship this one bill is. Round to two decimals.",
    ask: "Show each invoice's percent of its customer's billing.",
    template: `SELECT number, customer_id,
       {1}(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY {2}), 2) AS bill_pct
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", label: "the percent dressing", why: "Shares read cleanest at two decimals — ROUND dresses the division." },
      { answer: "customer_id", kind: "keyword", label: "the pie boundary", why: "PARTITION BY customer_id makes the pie each account's total billing." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["CAST", "status", "amount_cents"],
    walkthrough:
      "The windowed SUM totals each customer's billing; the row's amount over that pie, scaled by 100.0 first, is the share; ROUND tidies it. CAST to INTEGER would flatten the shares. Repartitioning by status would measure each bill against the status bucket — open bills compared with open bills — a different denominator than the memo's relationship view.",
  },
  {
    id: "cs-2199",
    tier: "hard",
    topic: "t6",
    universe: "fraud",
    title: "The supplier's price corridor",
    brief:
      "From: Fraud spot-check. Re: the sourcing corridor.\n\nOn every product row show its SUPPLIER's price corridor — the cheapest and dearest among that supplier's goods. Two folds, one partition, both beside the product's own price.",
    ask: "Show each supplier's price corridor on their products.",
    template: `SELECT name, supplier_id, price,
       MIN(price) OVER (PARTITION BY {1}) AS sup_min,
       {2}(price) OVER (PARTITION BY supplier_id) AS sup_max
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "supplier_id", kind: "keyword", label: "the corridor boundary", why: "PARTITION BY supplier_id scopes both folds to each vendor's own shelf." },
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The corridor's high end is the dearest price among the supplier's goods — MAX." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["category", "AVG", "price"],
    walkthrough:
      "Both windows share the supplier partition: MIN quotes the vendor's floor, MAX their ceiling, and every product row carries the corridor it lives in. Repartitioning by category would produce aisle corridors instead of sourcing corridors. AVG would replace the ceiling with a typical number and the corridor would lose its top edge.",
  },
  {
    id: "cs-2200",
    tier: "hard",
    topic: "t6",
    universe: "expense",
    title: "Category weight in cents",
    brief:
      "From: Spend report. Re: the weight column.\n\nOn every expense line show its category's total spend AND the line's percent of that spend — the mass and the share, both partitioned by category, on one row.",
    ask: "Show each line's category total and its share.",
    template: `SELECT id, category, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY category) AS cat_total,
       ROUND(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY {2}), 2) AS cat_pct
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The category's mass is the sum of its lines — SUM in the first window." },
      { answer: "category", kind: "keyword", label: "the share boundary", why: "The share's pie must match the mass — PARTITION BY category in both windows." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the expenses as they were booked." },
    ],
    distractors: ["MAX", "spent_on", "amount_cents"],
    walkthrough:
      "Two windows share the category partition: the first paints the category's mass, the second the row's percent of that mass, scaled by 100.0 and rounded. MAX would quote the biggest single charge as the mass. Repartitioning the share by vendor would divide category lines by a vendor pie — mismatched denominators and nonsense shares.",
  },
];
