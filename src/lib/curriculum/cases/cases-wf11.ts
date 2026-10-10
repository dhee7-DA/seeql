// Case batch WF11 — window functions deep-dive, t8 (Window capstone), cs-2351…cs-2375. FIRST/LAST/NTH_VALUE, shares, corridors.
import type { CaseStudy } from "./types";

export const casesWf11: CaseStudy[] = [
  {
    id: "cs-2351",
    tier: "medium",
    topic: "t8",
    universe: "pricing",
    title: "The category champion on every shelf row",
    brief:
      "From: Pricing review. Re: the champion column. On every product row show the name of the MOST EXPENSIVE product in its category — the champion, painted on all its rivals' rows. FIRST_VALUE over a descending ladder does it.",
    ask: "Show each category's dearest product on every row.",
    template: `SELECT name, category, price,
       {1}(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_champion
FROM products
ORDER BY id
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", label: "the champion chip", why: "The champion sits at the TOP of the descending ladder — the first value; LAST_VALUE would need the full frame to find it." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints the first eight products — LIMIT 8 trims the catalog." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["LAST_VALUE", "NTILE", "8", "5"],
    walkthrough:
      "FIRST_VALUE over the price-descending ladder borrows the top of each aisle onto every row. LAST_VALUE with the default frame would return the CURRENT row's name — the famous trap; only the full-frame variant finds the true champion. The sheet's LIMIT trims the catalog for display.",
  },
  {
    id: "cs-2352",
    tier: "medium",
    topic: "t8",
    universe: "pricing",
    title: "The aisle floor on every shelf row",
    brief:
      "From: Pricing review. Re: the floor column. On every product row show the CHEAPEST product name in its category — the floor of the aisle, painted on every shelf. FIRST_VALUE over an ascending ladder does it.",
    ask: "Show each category's cheapest product on every row.",
    template: `SELECT name, category, price,
       {1}(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS aisle_floor
FROM products
ORDER BY id
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the floor chip", why: "The floor sits at the TOP of the ascending ladder — the first value." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the sheet cut", why: "LIMIT 8 trims the walked catalog to its first eight rows." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row; any other offset slides the sheet down the ladder." },
    ],
    distractors: ["LAST_VALUE", "4", "3"],
    walkthrough:
      "FIRST_VALUE over the price-ascending ladder borrows the aisle's cheapest product onto every row. LAST_VALUE with the default frame would lie (it returns the current row), and MAX cannot fold names at all — the floor is a name, and names travel by FIRST_VALUE.",
  },
  {
    id: "cs-2353",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "LAST_VALUE, told honestly",
    brief:
      "From: Controller. Re: the honest column. On every ledger entry show BOTH last_value variants for the account's entry dates: the default-frame LAST_VALUE (which trails the current row) and the true last date via the full frame. The contrast IS the lesson.",
    ask: "Show the default and the true LAST_VALUE side by side.",
    template: `SELECT id, account, entry_date,
       LAST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS trailing,
       LAST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC {1}) AS true_last
FROM ledger_entries
ORDER BY account, entry_date ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "Only the frame spanning the whole partition makes LAST_VALUE see the true last row." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the book cut", why: "The check prints ten rows — LIMIT 10 trims the walked book." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "5"],
    walkthrough:
      "The default frame ends at the current row, so the first LAST_VALUE trails — it equals the row's own date. The second column stretches the frame across the whole partition and tells the truth: the account's latest booking. Every row pairs the bug with its fix.",
  },
  {
    id: "cs-2354",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "Everyone's first basket date",
    brief:
      "From: Growth lead. Re: the anniversary anchors. On every order row show the customer's EARLIEST order date — the anniversary anchor, painted on all their baskets. FIRST_VALUE over the chronological walk does it.",
    ask: "Show each customer's first order date on every order.",
    template: `SELECT id, customer_id, created_at,
       {1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_order
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the anchor chip", why: "The anchor sits at the TOP of the chronological walk — the first value." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the private timelines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["LAST_VALUE", "NTILE", "6", "5"],
    walkthrough:
      "FIRST_VALUE over each account's chronological walk paints their opening date on every basket — the CRM's anniversary anchor. LAST_VALUE with the default frame would return the current row's date; only its full-frame variant would find the latest, which is a different column than the memo's anchor.",
  },
  {
    id: "cs-2355",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "Everyone's latest order date",
    brief:
      "From: Growth lead. Re: the recency column. On every order row show the customer's LATEST order date — but the default frame will lie. Stretch the frame across the whole partition so LAST_VALUE sees the true recency.",
    ask: "Show each customer's latest order date on every order.",
    template: `SELECT id, customer_id, created_at,
       LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS last_order
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The frame must span the whole partition — otherwise LAST_VALUE returns the current row's own date." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the private timelines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "LAST_VALUE's default frame ends at the current row, so without the fix every row would show its own date as 'latest'. Stretching the frame across the partition lets it see the account's true closing date. The memo's warning is the lesson: LAST_VALUE without a frame is a mirror, not a window.",
  },
  {
    id: "cs-2356",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "The first sale date per product",
    brief:
      "From: Inventory count. Re: the product birthdays. Join lines to orders and paint each line with its product's EARLIEST sale date — the product's birthday on every sale. FIRST_VALUE over the chronological walk per product.",
    ask: "Show each product's first sale date on every line.",
    template: `SELECT oi.id, oi.product_id,
       {1}(o.created_at) OVER (PARTITION BY oi.product_id ORDER BY o.created_at ASC, o.id ASC) AS first_sold
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
ORDER BY oi.product_id, o.created_at ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the birthday chip", why: "The birthday sits at the TOP of the product's chronological walk — the first value." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve lines — LIMIT 12 trims the walked catalog." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["LAST_VALUE", "NTILE", "6", "5"],
    walkthrough:
      "The join gives every line its sale date; FIRST_VALUE over the product's chronological walk paints the birthday on all its lines. LAST_VALUE with the default frame would return the current line's date — the mirror trap — and only its full-frame variant would find the latest sale.",
  },
  {
    id: "cs-2357",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "Each category's biggest bill",
    brief:
      "From: Spend report. Re: the category peaks. On every expense line show the LARGEST single amount within its category — the peak beside every bill. FIRST_VALUE over a descending amount ladder.",
    ask: "Show each category's biggest bill on every line.",
    template: `SELECT id, category, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY category ORDER BY amount_cents {2}, id ASC) AS cat_peak
FROM expenses
ORDER BY category, amount_cents DESC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the peak chip", why: "The peak sits at the top of the descending amount ladder — the first value." },
      { answer: "DESC", kind: "keyword", label: "the ladder direction", why: "Descending puts the biggest bill first, where FIRST_VALUE finds it." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints ten lines — LIMIT 10 trims the walked categories." },
    ],
    distractors: ["LAST_VALUE", "ASC", "5"],
    walkthrough:
      "FIRST_VALUE over the descending amount ladder borrows each category's peak onto all its bills. The ASC flip would put the smallest bill at the top and the 'peak' would be the floor. LAST_VALUE with the default frame would mirror the current row instead of finding the peak.",
  },
  {
    id: "cs-2358",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "The second-biggest invoice",
    brief:
      "From: Controller. Re: the silver medal. On every invoice row show the SECOND-largest amount in the book — NTH_VALUE with position two over the descending walk, full frame so every row sees the same medal.",
    ask: "Show the book's second-largest invoice amount on every row.",
    template: `SELECT id, number, amount_cents,
       {1}(amount_cents, 2) OVER (ORDER BY amount_cents DESC, id ASC {2}) AS silver
FROM invoices
ORDER BY id ASC
LIMIT {3};`,
    slots: [
      { answer: "NTH_VALUE", kind: "keyword", noVerify: true, label: "the medal chip", why: "The silver medal is the SECOND value of the descending walk — NTH_VALUE with position 2." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The full frame lets every row see the same podium; the default frame would show NULL until the walk passes it." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the book cut", why: "The sheet prints ten rows — LIMIT 10 trims the walked book." },
    ],
    distractors: ["FIRST_VALUE", "ROWS BETWEEN 3 PRECEDING AND CURRENT ROW", "5"],
    walkthrough:
      "NTH_VALUE(amount, 2) over the descending walk with the full frame puts the silver medal on every row. FIRST_VALUE would hand out gold instead, and the moving frame would show NULL on most rows — the podium only exists at the top of the walk.",
  },
  {
    id: "cs-2359",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "The corridor per account",
    brief:
      "From: Fraud spot-check. Re: the account corridor. On every ledger entry show the account's FIRST and LAST entry dates — the account's open and close, two windows over one walk.",
    ask: "Show each account's opening and latest dates on every entry.",
    template: `SELECT id, account, entry_date,
       FIRST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS opened,
       LAST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC {1}) AS latest
FROM ledger_entries
ORDER BY account, entry_date ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The latest date needs the full frame; FIRST_VALUE needs no help — ascending puts the opening on top." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the book cut", why: "The check prints ten rows — LIMIT 10 trims the walked book." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "5"],
    walkthrough:
      "Two windows, one walk: FIRST_VALUE grabs the opening from the top of the ascending ladder, and LAST_VALUE finds the true close only because its frame spans the whole partition. The truncated-frame chip would turn the latest column into a mirror — every row would read its own date.",
  },
  {
    id: "cs-2360",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "Share of the company",
    brief:
      "From: Growth lead. Re: the revenue shares. Stage each customer's spend and show their percent of TOTAL company revenue — the empty-window SUM is the denominator, the row's spend the numerator, dressed with ROUND.",
    ask: "Show each customer's share of total revenue.",
    template: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.id, c.name
)
SELECT name, ROUND(spend, 2) AS spend,
       {1}(100.0 * spend / {2}(spend) OVER (), 2) AS share
FROM s
ORDER BY share DESC, name ASC
LIMIT 8 OFFSET {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the percent dressing", why: "Shares read cleanest at two decimals — ROUND dresses the division." },
      { answer: "SUM", kind: "keyword", label: "the grand denominator", why: "The empty-window SUM is the total spend across all staged customers." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["CAST", "AVG", "5"],
    walkthrough:
      "The empty-window SUM over the staged rows is the company total; each customer's spend divided by it, scaled by 100.0 first, is the share. CAST cannot take a precision argument, and averaging the shares would describe the typical share, not each customer's slice.",
  },
  {
    id: "cs-2361",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Status money shares",
    brief:
      "From: Controller. Re: the stage slices. Stage revenue per order status and show each stage's percent of total revenue — the funnel's money mix, computed with the empty-window denominator.",
    ask: "Show each status's share of total revenue.",
    template: `WITH s AS (
  SELECT status, SUM(total) AS revenue
  FROM orders
  GROUP BY status
)
SELECT status, ROUND(revenue, 2) AS revenue,
       ROUND(100.0 * revenue / {1}(revenue) OVER (), 2) AS share
FROM s
ORDER BY share DESC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", noVerify: true, label: "the grand denominator", why: "The empty-window SUM is the total revenue across all stages." },
      { answer: "3", kind: "keyword", noVerify: true, label: "the stage cut", why: "LIMIT 3 trims the four-status sheet to three rows so the cut is provable." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["AVG", "5"],
    walkthrough:
      "The empty-window SUM over the staged stages is the company revenue; each stage divided by it is the slice. The shares sum to 100. Averaging would describe the typical stage, and LIMIT 2 would hide half the funnel's money mix.",
  },
  {
    id: "cs-2362",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "Shelf share of stock",
    brief:
      "From: Inventory count. Re: the stock shares. On every product row show its percent of the WHOLE warehouse's stock — the global pie, not the aisle's. The empty-window SUM is the denominator.",
    ask: "Show each product's share of total stock.",
    template: `SELECT name, stock,
       {1}(100.0 * stock / SUM(stock) OVER (), 2) AS stock_share
FROM products
ORDER BY stock DESC, name ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the percent dressing", why: "Shares read cleanest at two decimals — ROUND dresses the division." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints the eight deepest shelves — LIMIT 8 trims the catalog." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["CAST", "AVG", "5"],
    walkthrough:
      "The empty-window SUM totals the whole warehouse's stock; each shelf divided by that pie is its global share. CAST would flatten the decimals, and averaging shares would describe the typical shelf rather than each one's slice of the warehouse.",
  },
  {
    id: "cs-2363",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Bill share of the account",
    brief:
      "From: Controller. Re: the relationship slices. On every invoice row show the bill's percent of its CUSTOMER's total billing — the partitioned pie. The windowed SUM is scoped per account.",
    ask: "Show each invoice's share of its customer's billing.",
    template: `SELECT number, customer_id, amount_cents,
       {1}(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY {2}), 2) AS bill_pct
FROM invoices
ORDER BY customer_id, amount_cents DESC
LIMIT {3};`,
    slots: [
      { answer: "ROUND", kind: "keyword", noVerify: true, label: "the percent dressing", why: "Shares read cleanest at two decimals — ROUND dresses the division." },
      { answer: "customer_id", kind: "keyword", noVerify: true, label: "the pie boundary", why: "PARTITION BY customer_id makes the pie each account's total billing." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints ten rows — LIMIT 10 trims the walked accounts." },
    ],
    distractors: ["CAST", "status", "5"],
    walkthrough:
      "The windowed SUM totals each account's billing; the row's amount over that pie is the bill's slice of the relationship. CAST would flatten the decimals. Partitioning by status would measure bills against stage buckets — open bills compared with open bills — a different denominator than the memo's.",
  },
  {
    id: "cs-2364",
    tier: "medium",
    topic: "t8",
    universe: "supplier",
    title: "Supplier revenue concentration",
    brief:
      "From: Supplier audit. Re: the sourcing mix. Join lines to products to suppliers, fold revenue per supplier, and show each vendor's percent of all sold revenue — the concentration sheet.",
    ask: "Show each supplier's share of sold revenue.",
    template: `WITH r AS (
  SELECT sup.name AS supplier, SUM(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN suppliers sup ON sup.id = p.supplier_id
  GROUP BY sup.name
)
SELECT supplier, ROUND(revenue, 2) AS revenue,
       ROUND(100.0 * revenue / {1}(revenue) OVER (), 2) AS share
FROM r
ORDER BY share DESC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", noVerify: true, label: "the grand denominator", why: "The empty-window SUM is the total sold revenue across all vendors." },
      { answer: "6", kind: "keyword", noVerify: true, label: "the vendor cut", why: "All six suppliers fit; LIMIT 6 keeps the sheet complete." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["AVG", "3", "5"],
    walkthrough:
      "The staged vendors feed the concentration sheet: each vendor's revenue over the empty-window grand total, scaled and rounded. Averaging would describe the typical vendor, and LIMIT 3 would hide half the sourcing mix — concentration reports need the whole pie.",
  },
  {
    id: "cs-2365",
    tier: "medium",
    topic: "t8",
    universe: "catalog",
    title: "The aisle's second price",
    brief:
      "From: Warehouse catalog. Re: the silver rungs. On every product row show the SECOND-most-expensive price in its category — NTH_VALUE with the full frame so every row sees the same medal.",
    ask: "Show each category's second-highest price on every row.",
    template: `SELECT name, category, price,
       {1}(price, 2) OVER (PARTITION BY category ORDER BY price DESC, name ASC {2}) AS cat_silver
FROM products
ORDER BY category, price DESC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "NTH_VALUE", kind: "keyword", noVerify: true, label: "the medal chip", why: "The silver rung is the SECOND value of the descending ladder — NTH_VALUE with position 2." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The full frame lets every row see the same podium." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The sheet prints twelve ladder rows — LIMIT 12 trims the walked aisles." },
    ],
    distractors: ["FIRST_VALUE", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "6"],
    walkthrough:
      "NTH_VALUE(price, 2) over the descending aisle ladder with the full frame paints the silver price on every row. FIRST_VALUE would hand out gold, and the running frame would show NULL on most rows — the podium only exists at the top of the walk.",
  },
  {
    id: "cs-2366",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "Region champion order",
    brief:
      "From: Growth lead. Re: the regional champions. Join orders to customers; on every order show the id of the BIGGEST basket within its region — the champion, painted on every basket in the market.",
    ask: "Show each region's champion order id on every order.",
    template: `SELECT o.id, c.region,
       {1}(o.id) OVER (PARTITION BY c.region ORDER BY o.total {2}, o.id ASC) AS region_champ
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id ASC
LIMIT {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the champion chip", why: "The champion sits at the top of the descending total ladder — the first value." },
      { answer: "DESC", kind: "keyword", label: "the ladder direction", why: "Descending puts the biggest basket first, where FIRST_VALUE finds it." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked orders." },
    ],
    distractors: ["LAST_VALUE", "ASC", "6"],
    walkthrough:
      "FIRST_VALUE over the region's descending ladder borrows the champion's id onto every basket in that market. The ASC flip would crown the smallest basket, and LAST_VALUE with the default frame would mirror the current row — the trap the memo's phrasing avoids.",
  },
  {
    id: "cs-2367",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "Gap to the aisle ceiling",
    brief:
      "From: Inventory count. Re: the headroom walk. On every product row show how far its PRICE sits below the category's most expensive price — the gap computed from FIRST_VALUE over the descending ladder.",
    ask: "Show each product's gap below its aisle ceiling.",
    template: `SELECT name, category, price,
       {1}(price) OVER (PARTITION BY category ORDER BY price DESC, name ASC) - price AS headroom
FROM products
ORDER BY category, price DESC, name ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the ceiling chip", why: "The ceiling is the first value of the descending ladder; the gap is that minus the row's own price." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints ten rows — LIMIT 10 trims the walked aisles." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["MIN", "LAST_VALUE", "5"],
    walkthrough:
      "FIRST_VALUE over the descending ladder repeats the aisle ceiling on every row; subtracting the row's price leaves the headroom. MIN would measure against the floor and produce negative headroom; LAST_VALUE with the default frame would subtract the row from itself — zero everywhere.",
  },
  {
    id: "cs-2368",
    tier: "medium",
    topic: "t8",
    universe: "catalog",
    title: "Both ends of every aisle",
    brief:
      "From: Warehouse catalog. Re: the corridor columns. On every product row show the category's cheapest AND dearest prices — the corridor, two windows over one partition.",
    ask: "Show each category's price corridor on every product.",
    template: `SELECT name, category, price,
       FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS cat_floor,
       {1}(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC {2}) AS cat_top
FROM products
ORDER BY category, price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LAST_VALUE", kind: "keyword", noVerify: true, label: "the ceiling chip", why: "The dearest price is the LAST value of the ascending ladder — but only with the full frame." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The frame must span the partition or the ceiling mirrors the current row." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the ladder cut", why: "The sheet prints twelve ladder rows — LIMIT 12 trims the walked aisles." },
    ],
    distractors: ["FIRST_VALUE", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "6"],
    walkthrough:
      "The floor comes free on an ascending ladder (FIRST_VALUE); the ceiling needs LAST_VALUE with the full frame — otherwise it mirrors the current row and the corridor collapses to a point. Two windows, one partition, one honest frame.",
  },
  {
    id: "cs-2369",
    tier: "hard",
    topic: "t8",
    universe: "fraud",
    title: "The running minimum price",
    brief:
      "From: Fraud spot-check. Re: the downward walk. Walk the catalog from cheapest upward and show the cheapest price seen SO FAR — a running minimum via FIRST_VALUE with the truncated frame. Because the walk ascends, the running first is the global floor — but the frame makes the semantics explicit.",
    ask: "Show the running minimum price along the ascending walk.",
    template: `SELECT name, price,
       {1}(price) OVER (ORDER BY price ASC, name ASC {2}) AS min_so_far
FROM products
ORDER BY price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the floor chip", why: "The running minimum is the FIRST value of the walk-so-far — FIRST_VALUE with the truncated frame." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The frame must end at the current row for the value to be 'so far'." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the ascending ladder." },
    ],
    distractors: ["LAST_VALUE", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6"],
    walkthrough:
      "FIRST_VALUE over the ascending walk with the truncated frame is the running minimum — the cheapest price seen so far. LAST_VALUE on the same walk would borrow the current price (the wrong end), and the whole-frame chip would replace the walk with the global floor.",
  },
  {
    id: "cs-2370",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "Benchmark month on every row",
    brief:
      "From: Controller. Re: the benchmark column. Stage monthly revenue; on every month show the name of the HIGHEST-revenue month — the benchmark, painted on all rows via FIRST_VALUE over the descending revenue walk.",
    ask: "Show the best month's name on every row.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       {1}(month) OVER (ORDER BY revenue DESC, month ASC) AS best_month
FROM m
ORDER BY month ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "FIRST_VALUE", kind: "keyword", noVerify: true, label: "the benchmark chip", why: "The benchmark sits at the top of the descending revenue walk — the first value." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the benchmark repeats consistently." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["LAST_VALUE", "AVG", "8", "5"],
    walkthrough:
      "FIRST_VALUE over the revenue-descending walk borrows the champion month's name onto every row — the whole series gets the same benchmark. LAST_VALUE with the default frame would mirror the current row, and averaging would describe the typical month rather than crown the champion.",
  },
  {
    id: "cs-2371",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "The honest best month",
    brief:
      "From: Controller. Re: the paired columns. Stage monthly revenue and show BOTH best-month columns: LAST_VALUE with the default frame (which trails) and LAST_VALUE with the full frame (which tells the truth). The contrast is the lesson.",
    ask: "Show the trailing and the true best month side by side.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, revenue,
       LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS trailing,
       LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC {1}) AS best_true
FROM m
ORDER BY month ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "Only the whole-partition frame lets LAST_VALUE see the true top month." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the contrast is visible everywhere." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "8", "5"],
    walkthrough:
      "The first LAST_VALUE trails the current row (the default frame's edge), so it names whichever month the walk has reached — usually a lie. The second stretches across the partition and always names the true champion. Every row pairs the bug with its fix, which is exactly what the close binder's appendix documents.",
  },
  {
    id: "cs-2372",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "Product lifetime demand beside every sale",
    brief:
      "From: Inventory count. Re: the demand column. Join lines to orders and paint each line with its product LIFETIME units sold — the partitioned pie: SUM of quantity over the product partition.",
    ask: "Show each product's lifetime units on every line.",
    template: `SELECT oi.id, oi.product_id,
       SUM(oi.quantity) OVER (PARTITION BY {1}) AS product_units
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
ORDER BY oi.product_id, oi.id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "oi.product_id", kind: "keyword", noVerify: true, label: "the demand boundary", why: "PARTITION BY the product key folds each product's whole demand onto its lines." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve lines — LIMIT 12 trims the walked catalog." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["o.customer_id", "6", "5"],
    walkthrough:
      "The windowed SUM over the product partition totals every unit ever sold of that product and paints it on all its lines — the demand context for replenishment. Partitioning by customer would answer a different question entirely: how much each BUYER bought, not how much each PRODUCT sold.",
  },
  {
    id: "cs-2373",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "Region revenue on every basket",
    brief:
      "From: Fraud spot-check. Re: the market context. Join orders to customers and paint every basket with its region's total revenue — the market's money beside each order. The windowed SUM over the region partition.",
    ask: "Show each region's revenue on every order.",
    template: `SELECT o.id, c.region,
       {1}(o.total) OVER (PARTITION BY {2}) AS region_revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
ORDER BY o.id ASC
LIMIT {3};`,
    slots: [
      { answer: "SUM", kind: "keyword", noVerify: true, label: "the market fold", why: "The market's money is the sum of its baskets — SUM within the partitioned join." },
      { answer: "c.region", kind: "keyword", noVerify: true, label: "the market boundary", why: "PARTITION BY the region column folds each market after the join." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked orders." },
    ],
    distractors: ["AVG", "c.city", "6"],
    walkthrough:
      "The join gives every basket its market; the windowed SUM folds each region's revenue and paints it on all its orders. AVG would carry the typical basket instead of the market's mass, and the city partition would tighten the lens beyond the memo's market view.",
  },
  {
    id: "cs-2374",
    tier: "hard",
    topic: "t8",
    universe: "catalog",
    title: "Third-largest basket, everywhere",
    brief:
      "From: Warehouse catalog. Re: the bronze basket. On every order row show the THIRD-largest total in the book — NTH_VALUE with position three over the descending walk, full frame so every row sees the same medal.",
    ask: "Show the book's third-largest basket on every row.",
    template: `SELECT id, total,
       {1}(total, 3) OVER (ORDER BY total DESC, id ASC {2}) AS bronze
FROM orders
ORDER BY id ASC
LIMIT {3};`,
    slots: [
      { answer: "NTH_VALUE", kind: "keyword", noVerify: true, label: "the medal chip", why: "The bronze basket is the THIRD value of the descending walk — NTH_VALUE with position 3." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The full frame lets every row see the same podium." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the book cut", why: "The sheet prints ten rows — LIMIT 10 trims the walked book." },
    ],
    distractors: ["FIRST_VALUE", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "5"],
    walkthrough:
      "NTH_VALUE(total, 3) over the descending walk with the full frame puts the bronze basket on every row. FIRST_VALUE would hand out gold, and the running frame would show NULL on most rows — the podium only exists at the top of the walk, and the full frame is what broadcasts it.",
  },
  {
    id: "cs-2375",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "Vendor floor and peak",
    brief:
      "From: Spend report. Re: the relationship corridor. On every expense line show the vendor's SMALLEST and LARGEST single charges — the corridor, two windows over one vendor partition.",
    ask: "Show each vendor's bill corridor on every line.",
    template: `SELECT id, vendor, amount_cents,
       FIRST_VALUE(amount_cents) OVER (PARTITION BY vendor ORDER BY amount_cents ASC, id ASC) AS vendor_floor,
       LAST_VALUE(amount_cents) OVER (PARTITION BY vendor ORDER BY amount_cents ASC, id ASC {1}) AS vendor_peak
FROM expenses
ORDER BY vendor, amount_cents ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", kind: "keyword", noVerify: true, label: "the honest frame", why: "The peak needs the whole-partition frame; the floor comes free on the ascending ladder." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the sheet cut", why: "The sheet prints ten rows — LIMIT 10 trims the walked vendors." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "5"],
    walkthrough:
      "The floor rides the top of the ascending ladder (FIRST_VALUE); the peak needs LAST_VALUE with the full frame — the corridor's two ends from one partition. The truncated-frame chip would mirror the current bill into the peak column, collapsing the corridor.",
  },
];
