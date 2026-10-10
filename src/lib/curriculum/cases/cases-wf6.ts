// Case batch WF6 — window functions deep-dive, t6 (Partition windows),
// cs-2226…cs-2250.
import type { CaseStudy } from "./types";

export const casesWf6: CaseStudy[] = [
  {
    id: "cs-2226",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "Month mass beside every basket",
    brief:
      "From: Growth lead. Re: the calendar mass.\n\nOn every order row show the total revenue of its calendar month — the month's mass beside each basket. Partition by the month expression of created_at and keep every row.",
    ask: "Carry each month's revenue on every order.",
    template: `SELECT id, created_at, total,
       {1}(total) OVER (PARTITION BY {2}) AS month_mass
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The month's mass is the sum of its baskets — SUM within the calendar partition." },
      { answer: "strftime('%Y-%m', created_at)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the timeline into calendar months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["AVG", "customer_id", "created_at"],
    walkthrough:
      "SUM(total) OVER (PARTITION BY the month expression) folds each month's baskets and paints the mass on every one of its rows. AVG would carry the month's typical basket instead. Repartitioning by customer would fold each account's history — the relationship lens, not the calendar lens.",
  },
  {
    id: "cs-2227",
    tier: "medium",
    topic: "t6",
    universe: "supplier",
    title: "Vendor price norms",
    brief:
      "From: Supplier audit. Re: the sourcing norms.\n\nOn every product row show the AVERAGE price across its supplier's goods — each vendor's pricing norm beside every item they provide. The fold resets per supplier.",
    ask: "Carry each supplier's average price on every product.",
    template: `SELECT name, supplier_id, price,
       {1}(price) OVER (PARTITION BY {2}) AS sup_avg
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The vendor's pricing norm is the mean of their prices — AVG within the partition." },
      { answer: "supplier_id", kind: "keyword", label: "the vendor boundary", why: "PARTITION BY supplier_id averages each vendor's shelf separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["COUNT", "category", "price"],
    walkthrough:
      "AVG(price) OVER (PARTITION BY supplier_id) computes each vendor's norm and paints it on all their products. COUNT would tally their items — width, not price level. Repartitioning by category would average each aisle — the merchandising lens rather than the sourcing lens.",
  },
  {
    id: "cs-2228",
    tier: "easy",
    topic: "t6",
    universe: "pricing",
    title: "Each product's top price",
    brief:
      "From: Pricing review. Re: the price ceilings.\n\nOn every order-items line show the HIGHEST unit price ever charged for that product — the product's ceiling beside each sale. The fold resets per product.",
    ask: "Carry each product's top unit price on every line.",
    template: `SELECT id, product_id, unit_price,
       {1}(unit_price) OVER (PARTITION BY {2}) AS product_ceiling
FROM order_items
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The product's ceiling is its highest charged price — MAX within the partition." },
      { answer: "product_id", kind: "keyword", label: "the product boundary", why: "PARTITION BY product_id scopes the ceiling to each product's own lines." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the lines as they were sold." },
    ],
    distractors: ["MIN", "order_id", "unit_price"],
    walkthrough:
      "MAX(unit_price) OVER (PARTITION BY product_id) finds each product's ceiling and paints it on every line that sold it. MIN would carry the floor — the bargain end. Repartitioning by order would find each basket's priciest line, a basket fact rather than a product fact.",
  },
  {
    id: "cs-2229",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Status money beside every bill",
    brief:
      "From: Controller. Re: the bucket masses.\n\nOn every invoice row show the total cents invoiced within its status bucket — each stage's money beside every bill. The fold resets per status.",
    ask: "Carry each status's total billed on every invoice.",
    template: `SELECT number, status, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS status_mass
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The bucket's money is the sum of its bills — SUM within the partition." },
      { answer: "status", kind: "keyword", label: "the bucket boundary", why: "PARTITION BY status folds each funnel stage's invoices separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["AVG", "customer_id", "amount_cents"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY status) folds each bucket's money and paints it on every bill inside it. AVG would carry the bucket's typical bill. Repartitioning by customer would fold each account's billing — the relationship view instead of the stage view.",
  },
  {
    id: "cs-2230",
    tier: "easy",
    topic: "t6",
    universe: "fraud",
    title: "The rail's floor payment",
    brief:
      "From: Fraud spot-check. Re: the rail floors.\n\nOn every payment row show the SMALLEST payment made through the same method — each rail's floor beside every cash-in. The fold resets per method.",
    ask: "Carry each method's smallest payment on every row.",
    template: `SELECT id, method, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS method_floor
FROM payments
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The rail's floor is its smallest payment — MIN within the partition." },
      { answer: "method", kind: "keyword", label: "the rail boundary", why: "PARTITION BY method scopes the floor to each payment rail." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in cash-application order — ORDER BY id walks payments as they landed." },
    ],
    distractors: ["MAX", "invoice_id", "amount_cents"],
    walkthrough:
      "MIN(amount_cents) OVER (PARTITION BY method) finds each rail's floor and paints it on every payment through that rail. MAX would carry the ceiling — the opposite end. Repartitioning by invoice would scope the floor to single bills, where it would nearly always equal the row itself.",
  },
  {
    id: "cs-2231",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Account credit mass",
    brief:
      "From: Controller. Re: the credit columns.\n\nOn every ledger entry show its account's total CREDITS — the account's credit mass beside every booking. The fold resets per account.",
    ask: "Carry each account's total credits on every entry.",
    template: `SELECT id, account, credit_cents,
       {1}(credit_cents) OVER (PARTITION BY {2}) AS account_credits
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the credit fold", why: "The account's credit mass is the sum of its credit cents — SUM within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account scopes the fold to each ledger account." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["MAX", "entry_date", "credit_cents"],
    walkthrough:
      "SUM(credit_cents) OVER (PARTITION BY account) folds each account's credits and paints the mass on every entry. MAX would quote the single biggest credit. Repartitioning by entry date would fold all accounts day by day — mixing the book.",
  },
  {
    id: "cs-2232",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "Region customer width",
    brief:
      "From: Growth lead. Re: the market rolls.\n\nOn every customer row show how many customers share its region — the market's roll width beside every name. The count resets per region.",
    ask: "Carry each region's customer count on every customer.",
    template: `SELECT name, region,
       {1}(*) OVER (PARTITION BY {2}) AS region_width
FROM customers
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Market width is how many customers the region holds — COUNT(*) within the partition." },
      { answer: "region", kind: "keyword", label: "the market boundary", why: "PARTITION BY region counts each market's roll." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in signup order — ORDER BY id walks customers as they joined." },
    ],
    distractors: ["SUM", "city", "email"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY region) counts each market's roll and paints the width on every one of its customers. SUM(*) would not run. Repartitioning by city would count towns — a finer geography than the memo's market roll.",
  },
  {
    id: "cs-2233",
    tier: "medium",
    topic: "t6",
    universe: "expense",
    title: "Vendor peaks beside every bill",
    brief:
      "From: Spend report. Re: the vendor peaks.\n\nOn every expense line show the LARGEST single charge for its vendor — each relationship's peak beside every bill. The fold resets per vendor.",
    ask: "Carry each vendor's biggest charge on every line.",
    template: `SELECT id, vendor, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS vendor_peak
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the peak fold", why: "The relationship's peak is its biggest charge — MAX within the partition." },
      { answer: "vendor", kind: "keyword", label: "the relationship boundary", why: "PARTITION BY vendor scopes the peak to each supplier's own bills." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the bills as they were booked." },
    ],
    distractors: ["AVG", "spent_on", "amount_cents"],
    walkthrough:
      "MAX(amount_cents) OVER (PARTITION BY vendor) finds each vendor's peak and paints it on their every bill. AVG would carry the typical charge instead. Repartitioning by spent date would fold each calendar day across all vendors — nearly every peak would equal the row itself.",
  },
  {
    id: "cs-2234",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "Month norms beside every basket",
    brief:
      "From: Growth lead. Re: the calendar norms.\n\nOn every order row show the AVERAGE total of its calendar month — the month's typical basket beside every purchase. Round to two decimals.",
    ask: "Carry each month's average basket on every order.",
    template: `SELECT id, created_at, total,
       {1}(total) OVER (PARTITION BY {2}) AS month_norm
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The month's typical basket is the mean of its totals — AVG within the calendar partition." },
      { answer: "strftime('%Y-%m', created_at)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the timeline into calendar months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["COUNT", "status", "total"],
    walkthrough:
      "AVG(total) OVER (PARTITION BY the month expression) computes each month's norm and paints it on every basket inside it. COUNT would tally the month's orders — width, not weight. Repartitioning by status would average each funnel stage across the whole timeline.",
  },
  {
    id: "cs-2235",
    tier: "medium",
    topic: "t6",
    universe: "pricing",
    title: "Aisle floors beside every sale",
    brief:
      "From: Pricing review. Re: the aisle floors.\n\nJoin lines to products; on every line show the CHEAPEST price in its category — each aisle's floor beside every sale. The fold resets per category after the join.",
    ask: "Carry each category's cheapest price on every line.",
    template: `SELECT oi.id, p.category, p.price,
       {1}(p.price) OVER (PARTITION BY {2}) AS aisle_floor
FROM order_items oi
JOIN products p ON p.id = oi.product_id
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The aisle's floor is its cheapest price — MIN within the partitioned join." },
      { answer: "p.category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY the category column scopes the floor to each aisle after the join." },
      { answer: "oi.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY oi.id walks the lines as they were sold." },
    ],
    distractors: ["MAX", "p.supplier_id", "p.price"],
    walkthrough:
      "The join gives every line its aisle; MIN(p.price) OVER (PARTITION BY p.category) floors each aisle and paints the floor on every sale. MAX would carry the aisle ceiling. Repartitioning by supplier would floor each vendor's goods — the sourcing lens rather than the aisle lens.",
  },
  {
    id: "cs-2236",
    tier: "easy",
    topic: "t6",
    universe: "fraud",
    title: "Billing widths per customer",
    brief:
      "From: Fraud spot-check. Re: the billing widths.\n\nOn every invoice row show how many invoices its customer holds in the book — the relationship's width beside every bill. The count resets per customer.",
    ask: "Carry each customer's invoice count on every invoice.",
    template: `SELECT number, customer_id,
       {1}(*) OVER (PARTITION BY {2}) AS cust_width
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Billing width is how many invoices the account holds — COUNT(*) within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id counts each account's slice of the book." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["SUM", "status", "amount_cents"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY customer_id) counts each account's invoices and repeats the width on all of them. SUM(*) would not run. Repartitioning by status would count each bucket across all customers — stage widths wearing account labels.",
  },
  {
    id: "cs-2237",
    tier: "medium",
    topic: "t6",
    universe: "month-close",
    title: "Monthly cash mass",
    brief:
      "From: Controller. Re: the calendar cash.\n\nOn every payment row show the total cash collected in its calendar month — the month's intake beside every payment. Partition by the month expression of paid_on.",
    ask: "Carry each month's collected cash on every payment.",
    template: `SELECT id, paid_on, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS month_cash
FROM payments
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the cash fold", why: "The month's intake is the sum of its payments — SUM within the calendar partition." },
      { answer: "strftime('%Y-%m', paid_on)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the payment timeline into months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in cash-application order — ORDER BY id walks payments as they landed." },
    ],
    distractors: ["MAX", "method", "amount_cents"],
    walkthrough:
      "SUM(amount_cents) OVER (PARTITION BY the month expression) folds each month's cash and paints the intake on every payment inside it. MAX would carry the biggest single payment. Repartitioning by method would fold each rail across the whole timeline — the rail view, not the calendar view.",
  },
  {
    id: "cs-2238",
    tier: "medium",
    topic: "t6",
    universe: "expense",
    title: "Each account's heaviest debit",
    brief:
      "From: Expense report. Re: the debit peaks.\n\nOn every ledger entry show the LARGEST debit ever booked to its account — each account's debit peak beside every booking. The fold resets per account.",
    ask: "Carry each account's biggest debit on every entry.",
    template: `SELECT id, account, debit_cents,
       {1}(debit_cents) OVER (PARTITION BY {2}) AS account_peak
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the peak fold", why: "The account's debit peak is its biggest single debit — MAX within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account scopes the peak to each ledger account." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["MIN", "entry_date", "debit_cents"],
    walkthrough:
      "MAX(debit_cents) OVER (PARTITION BY account) finds each account's peak and paints it on every entry. MIN would carry the thinnest debit. Repartitioning by entry date would fold each calendar day — peaks would collapse to the row itself.",
  },
  {
    id: "cs-2239",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "Market floors beside every basket",
    brief:
      "From: Growth lead. Re: the market floors.\n\nJoin orders to customers; on every order show the SMALLEST total placed in its region — each market's floor beside every basket. The fold resets per region after the join.",
    ask: "Carry each region's smallest basket on every order.",
    template: `SELECT o.id, c.region, o.total,
       {1}(o.total) OVER (PARTITION BY {2}) AS region_floor
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the floor fold", why: "The market's floor is its smallest basket — MIN within the partitioned join." },
      { answer: "c.region", kind: "keyword", label: "the market boundary", why: "PARTITION BY the region column scopes the floor to each market after the join." },
      { answer: "o.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY o.id walks the orders as they were placed." },
    ],
    distractors: ["MAX", "c.city", "o.total"],
    walkthrough:
      "The join gives every order its market; MIN(o.total) OVER (PARTITION BY c.region) floors each market and paints the floor on every basket. MAX would carry the market's ceiling. Repartitioning by city would tighten the lens to towns — finer than the memo wants.",
  },
  {
    id: "cs-2240",
    tier: "medium",
    topic: "t6",
    universe: "inventory",
    title: "Vendor stock mass",
    brief:
      "From: Inventory count. Re: the sourcing mass.\n\nOn every product row show its SUPPLIER's total stock — the vendor's inventory mass beside every item they provide. The fold resets per supplier.",
    ask: "Carry each supplier's total stock on every product.",
    template: `SELECT name, supplier_id, stock,
       {1}(stock) OVER (PARTITION BY {2}) AS sup_stock
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The vendor's mass is the sum of their shelves — SUM within the partition." },
      { answer: "supplier_id", kind: "keyword", label: "the vendor boundary", why: "PARTITION BY supplier_id totals each vendor's goods." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["MIN", "category", "stock"],
    walkthrough:
      "SUM(stock) OVER (PARTITION BY supplier_id) folds each vendor's inventory and paints the mass on all their products. MIN would carry their thinnest shelf. Repartitioning by category would fold each aisle — the merchandising lens rather than the sourcing lens.",
  },
  {
    id: "cs-2241",
    tier: "easy",
    topic: "t6",
    universe: "expense",
    title: "Monthly bill widths",
    brief:
      "From: Spend report. Re: the calendar widths.\n\nOn every expense line show how many bills its calendar month holds — the month's booking width beside every bill. Partition by the month expression of spent_on.",
    ask: "Carry each month's bill count on every expense.",
    template: `SELECT id, spent_on,
       {1}(*) OVER (PARTITION BY {2}) AS month_width
FROM expenses
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "The month's width is how many bills it holds — COUNT(*) within the calendar partition." },
      { answer: "strftime('%Y-%m', spent_on)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the spend timeline into months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the bills as they were booked." },
    ],
    distractors: ["SUM", "category", "spent_on"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY the month expression) counts each month's bills and paints the width on all of them. SUM(*) would not run. Repartitioning by category would count each spend type across the whole timeline — the category lens, not the calendar.",
  },
  {
    id: "cs-2242",
    tier: "hard",
    topic: "t6",
    universe: "pricing",
    title: "Product line norms",
    brief:
      "From: Pricing review. Re: the line norms.\n\nOn every order-items line show the AVERAGE line value (quantity times unit price) for its product — each product's typical line beside every sale. Round to two decimals.",
    ask: "Carry each product's average line value on every line.",
    template: `SELECT id, product_id,
       {1}(quantity * unit_price) OVER (PARTITION BY {2}) AS product_norm
FROM order_items
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The product's typical line is the mean of its line values — AVG within the partition." },
      { answer: "product_id", kind: "keyword", label: "the product boundary", why: "PARTITION BY product_id averages each product's own lines." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the lines as they were sold." },
    ],
    distractors: ["COUNT", "order_id", "quantity"],
    walkthrough:
      "AVG(quantity * unit_price) OVER (PARTITION BY product_id) computes each product's line norm and paints it on every sale. COUNT would tally lines — width, not value. Repartitioning by order would average each basket's lines — the basket lens instead of the product lens.",
  },
  {
    id: "cs-2243",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "Customer billing ceilings",
    brief:
      "From: Fraud spot-check. Re: the billing ceilings.\n\nOn every invoice row show the LARGEST bill its customer has received — each account's ceiling beside every invoice. The fold resets per customer.",
    ask: "Carry each customer's biggest invoice on every bill.",
    template: `SELECT number, customer_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS cust_ceiling
FROM invoices
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The account's ceiling is its biggest bill — MAX within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id scopes the ceiling to each account's invoices." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY id keeps the listing stable." },
    ],
    distractors: ["MIN", "status", "amount_cents"],
    walkthrough:
      "MAX(amount_cents) OVER (PARTITION BY customer_id) finds each account's ceiling and paints it on all their bills. MIN would carry their floor. Repartitioning by status would ceiling each bucket across all customers — mixing accounts into stage pies.",
  },
  {
    id: "cs-2244",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "Monthly cash norms",
    brief:
      "From: Fraud spot-check. Re: the cash norms.\n\nOn every payment row show the AVERAGE payment collected in its calendar month — the month's typical cash-in beside every payment. Round to two decimals.",
    ask: "Carry each month's average payment on every row.",
    template: `SELECT id, paid_on, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2}) AS month_norm
FROM payments
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The month's typical cash-in is the mean of its payments — AVG within the calendar partition." },
      { answer: "strftime('%Y-%m', paid_on)", kind: "keyword", label: "the calendar boundary", why: "PARTITION BY the month expression slices the payment timeline into months." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in cash-application order — ORDER BY id walks payments as they landed." },
    ],
    distractors: ["COUNT", "method", "amount_cents"],
    walkthrough:
      "AVG(amount_cents) OVER (PARTITION BY the month expression) computes each month's norm and paints it on every payment. COUNT would tally payments — width, not weight. Repartitioning by method would average each rail across the whole timeline.",
  },
  {
    id: "cs-2245",
    tier: "easy",
    topic: "t6",
    universe: "month-close",
    title: "Account opening dates",
    brief:
      "From: Controller. Re: the account openings.\n\nOn every ledger entry show the EARLIEST entry date of its account — each account's opening beside every booking. The fold resets per account.",
    ask: "Carry each account's opening date on every entry.",
    template: `SELECT id, account, entry_date,
       {1}(entry_date) OVER (PARTITION BY {2}) AS account_open
FROM ledger_entries
ORDER BY {3};`,
    slots: [
      { answer: "MIN", kind: "keyword", label: "the opening fold", why: "The account's opening is its earliest date — MIN within the partition." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account scopes the opening to each ledger account." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the ledger as it was written." },
    ],
    distractors: ["MAX", "entry_date", "debit_cents"],
    walkthrough:
      "MIN(entry_date) OVER (PARTITION BY account) finds each account's opening and paints it on every entry. MAX would carry the account's latest booking. Repartitioning by entry date would collapse every partition to the row's own date — the opening signal would vanish.",
  },
  {
    id: "cs-2246",
    tier: "medium",
    topic: "t6",
    universe: "growth",
    title: "Customer basket ceilings",
    brief:
      "From: Growth lead. Re: the personal ceilings.\n\nOn every order row show the BIGGEST basket its customer has ever placed — each account's ceiling beside every purchase. The fold resets per customer.",
    ask: "Carry each customer's biggest basket on every order.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY {2}) AS cust_ceiling
FROM orders
ORDER BY {3};`,
    slots: [
      { answer: "MAX", kind: "keyword", label: "the ceiling fold", why: "The account's ceiling is their biggest basket — MAX within the partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id scopes the ceiling to each account's own orders." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in book order — ORDER BY id walks the orders as they were placed." },
    ],
    distractors: ["MIN", "status", "total"],
    walkthrough:
      "MAX(total) OVER (PARTITION BY customer_id) finds each account's ceiling and paints it on all their baskets. MIN would carry their smallest basket. Repartitioning by status would ceiling each funnel stage across all customers — stage pies instead of personal histories.",
  },
  {
    id: "cs-2247",
    tier: "hard",
    topic: "t6",
    universe: "pricing",
    title: "Basket revenue mass",
    brief:
      "From: Pricing review. Re: the basket masses.\n\nOn every order-items line show the total revenue of its whole order (quantity times unit price summed) — the basket's money beside each line. The fold resets per order.",
    ask: "Carry each order's revenue on every line.",
    template: `SELECT id, order_id,
       {1}(quantity * unit_price) OVER (PARTITION BY {2}) AS order_money
FROM order_items
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the money fold", why: "The basket's money is the sum of its line values — SUM within the partition." },
      { answer: "order_id", kind: "keyword", label: "the basket boundary", why: "PARTITION BY order_id scopes the fold to each order's own lines." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in booking order — ORDER BY id walks the lines as they were sold." },
    ],
    distractors: ["MAX", "product_id", "quantity"],
    walkthrough:
      "SUM(quantity * unit_price) OVER (PARTITION BY order_id) folds each basket's money and paints it on every line inside it. MAX would carry the single heaviest line. Repartitioning by product would fold each product's lifetime revenue — the product story, not the basket story.",
  },
  {
    id: "cs-2248",
    tier: "easy",
    topic: "t6",
    universe: "growth",
    title: "Active and paused rolls",
    brief:
      "From: Growth lead. Re: the roster widths.\n\nOn every customer row show how many customers share its active flag — the width of the active roster (and the paused one) beside every name. The count resets per flag.",
    ask: "Carry each roster's customer count on every row.",
    template: `SELECT name, active,
       {1}(*) OVER (PARTITION BY {2}) AS roster_width
FROM customers
ORDER BY {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the width counter", why: "Roster width is how many customers share the flag — COUNT(*) within the partition." },
      { answer: "active", kind: "keyword", label: "the roster boundary", why: "PARTITION BY active splits the roll into active and paused rosters." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in signup order — ORDER BY id walks customers as they joined." },
    ],
    distractors: ["SUM", "region", "email"],
    walkthrough:
      "COUNT(*) OVER (PARTITION BY active) counts each roster and paints the width on all its rows. SUM(*) would not run. Repartitioning by region would count markets instead of rosters — a geographic lens on an account-state question.",
  },
  {
    id: "cs-2249",
    tier: "medium",
    topic: "t6",
    universe: "fraud",
    title: "Region billing mass",
    brief:
      "From: Fraud spot-check. Re: the regional billing.\n\nJoin invoices to customers; on every bill show its region's total billed cents — the market's billing mass beside every invoice. The fold resets per region after the join.",
    ask: "Carry each region's total billing on every invoice.",
    template: `SELECT i.number, c.region,
       {1}(i.amount_cents) OVER (PARTITION BY {2}) AS region_billed
FROM invoices i
JOIN customers c ON c.id = i.customer_id
ORDER BY {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the mass fold", why: "The market's billing mass is the sum of its bills — SUM within the partitioned join." },
      { answer: "c.region", kind: "keyword", label: "the market boundary", why: "PARTITION BY the region column folds each market's invoices after the join." },
      { answer: "i.id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in issue order of the book — ORDER BY i.id keeps the listing stable." },
    ],
    distractors: ["MAX", "c.city", "i.amount_cents"],
    walkthrough:
      "The join gives every bill its market; SUM(i.amount_cents) OVER (PARTITION BY c.region) folds each region's billing and paints the mass on every invoice. MAX would carry the biggest single bill. Repartitioning by city would slice markets into towns.",
  },
  {
    id: "cs-2250",
    tier: "medium",
    topic: "t6",
    universe: "inventory",
    title: "Aisle stock norms",
    brief:
      "From: Inventory count. Re: the aisle norms.\n\nOn every product row show the AVERAGE stock of its category — each aisle's typical shelf beside every product. Round to two decimals; the fold resets per category.",
    ask: "Carry each category's average stock on every product.",
    template: `SELECT name, category, stock,
       {1}(stock) OVER (PARTITION BY {2}) AS cat_norm
FROM products
ORDER BY {3};`,
    slots: [
      { answer: "AVG", kind: "keyword", label: "the norm fold", why: "The aisle's typical shelf is the mean of its stock — AVG within the partition." },
      { answer: "category", kind: "keyword", label: "the aisle boundary", why: "PARTITION BY category averages each aisle's shelves separately." },
      { answer: "id", kind: "keyword", noVerify: true, label: "the sheet order", why: "The sheet reads in catalog order — ORDER BY id walks products as they were stocked." },
    ],
    distractors: ["COUNT", "supplier_id", "stock"],
    walkthrough:
      "AVG(stock) OVER (PARTITION BY category) computes each aisle's norm and paints it on every product. COUNT would tally products — width, not depth. Repartitioning by supplier would average each vendor's goods — the sourcing lens rather than the aisle lens.",
  },
];
