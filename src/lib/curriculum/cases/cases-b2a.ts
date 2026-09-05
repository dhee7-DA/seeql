// Batch B2a — topic l2 (SELECT & FROM), cases cs-017…cs-028.
// Projection lessons: choosing columns, SELECT *, AS aliases, per-row
// arithmetic in the SELECT list, ROUND. Filters/sorting/aggregation are
// deliberately out of scope here — every query is a single-table read.

import type { CaseStudy } from "./types";

export const casesB2a: CaseStudy[] = [
  {
    id: "cs-017",
    topic: "l2",
    universe: "growth",
    title: "The CRM contact sheet",
    brief:
      "From: Chief of Staff. Re: board pack appendix.\n\nThe design team is building the market-presence slide and needs our customer roster as raw material: who they are, a working email, and where each one sits. Strip it to exactly those fields — the slide layout breaks if extra data tags along, and the CRM import expects the name header to read customer_name.",
    ask: "A contact sheet of every customer: name (as customer_name), email, city and region.",
    template: `SELECT name {1} customer_name, email, {2}, {3}
FROM {4};`,
    slots: [
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS renames the output column to customer_name so the CRM import maps cleanly — without it the header would literally read name and the slide tool would keep asking which field is which.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the home-city column",
        why: "The deck groups logos by home base, so city belongs in the projection. The tempting email chip is already in the list — repeating it would ship two identical contact columns.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the region column",
        why: "Regions are how the board reads the footprint (EU, US, APAC, LATAM), so region rides along. It lives on customers right beside city — no second table is involved.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Contact details live on customers. Pointing FROM at products or suppliers fails outright — neither table holds an email column.",
      },
    ],
    distractors: ["WHERE", "suppliers", "email", "ORDER", "products"],
    walkthrough:
      "The ask is a raw contact sheet — no math, no filtering, purely which fields make the cut. Name, email, city and region all live on customers, so it is a single-table read with one rename: AS turns the header into customer_name because that is the label the CRM import maps on. Run it and 16 rows come back: Alice Chen in Berlin with alice.chen@example.com up top, Bruno Silva in São Paulo next, down through the whole roster. Two things I would flag to the Chief of Staff before the slide ships: the sheet silently includes our two deactivated accounts (Dmitri Volkov and Keiko Sato), because trimming them needs a filter we have not reached yet, and nothing is ordered — the slide tool can sort, or we come back to it later.",
  },
  {
    id: "cs-018",
    topic: "l2",
    universe: "refund-audit",
    title: "Refund math for ticket #4519",
    brief:
      "From: refunds@ internal ticket #4519.\n\nThe customer on order 1 is returning part of the shipment, and finance wants the payout broken out line by line, not as one lump sum. Pull every line on that order with what the customer actually paid per unit, and compute the money we hand back for each line, rounded to cents.",
    ask: "For each line on order 1: id, quantity, unit_price, and refund_amount = quantity × unit_price rounded to 2 decimals.",
    template: `SELECT id, quantity, unit_price,
       ROUND(quantity * {1}, 2) {2} refund_amount
FROM order_items
WHERE order_id = {3};`,
    slots: [
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the paid-price column",
        why: "What the customer actually paid per unit is unit_price on order_items. The tempting price chip belongs to the products catalog — this table does not have it, and catalog list prices can drift from what was charged.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "The computed column needs a human header for the refund memo — AS names it refund_amount, the label the finance template maps on. Skip it and the header becomes the raw expression text, which finance will bounce straight back.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the order reference",
        why: "Ticket #4519 is about order 1, so the filter pins order_id = 1 — without the pin we would be quoting refunds on every line in the shop. The chip 2 would quote order 2's shipment instead.",
      },
    ],
    distractors: ["product_id", "price", "SUM", "2", "IS"],
    walkthrough:
      "A refund ticket is line-by-line money, so I go to order_items — the ledger of what was actually purchased — and pin it to order 1 with order_id = 1. The payout per line is quantity times unit_price, computed inside the SELECT list so every row carries its own number, and ROUND(..., 2) keeps it to cents. Four lines come back: 3 × 31.02 refunds 93.06, 2 × 15.15 refunds 30.3, 1 × 25.26 refunds 25.26, and 3 × 142.64 refunds 427.92. The sanity check that makes me trust the math: those four payouts add up to 576.54 — exactly the total booked on order 1. One trap worth naming out loud: the catalog's list price is not what was charged that day; unit_price is the number the refund owes.",
  },
  {
    id: "cs-019",
    topic: "l2",
    universe: "pricing",
    title: "The 15%-off promo sheet",
    brief:
      "From: Head of Product. Re: spring promo planning.\n\nMarketing wants to see the spring promotion before it goes live: every product next to the price it would carry at 15% off. Keep the list price visible beside the promo figure so reviewers can eyeball the drop, and round the math to cents — the sheet goes straight into the deck.",
    ask: "Each product's name, category and price, plus promo_price = price minus 15% of price, rounded to 2 decimals.",
    template: `SELECT name, category, price,
       ROUND(price - price * {1}, {2}) {3} promo_price
{4} {5};`,
    slots: [
      {
        answer: "0.15",
        kind: "number",
        noVerify: true,
        label: "the discount fraction",
        why: "15% off means the promo drops a 0.15 slice of the price: price - price * 0.15. The tempting 0.85 chip is the one-shot multiply — inside this subtraction it would leave only the discount slice as the promo.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the rounding digits",
        why: "Money is quoted to cents, so ROUND keeps 2 decimals: 76.4915 prints as 76.49. The tempting 1 would print 76.5 next to an 89.99 list price — sloppy on a pricing sheet.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS labels the computed column promo_price — without it the spreadsheet header is the whole arithmetic expression, which nobody can pivot on. The tempting IS chip reads as a comparison and breaks the statement.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM declares where the rows come from — here, products. WHERE would bolt a filter onto a read that must cover the whole catalog, and it is not what this slot needs.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "List prices live on products. order_items holds purchase lines, not the catalog — point the query there and the category column simply does not exist.",
      },
    ],
    distractors: ["0.85", "1.15", "1", "4", "IS", "order_items"],
    walkthrough:
      "Promo math is per-row, so it lives in the SELECT list: price - price * 0.15 takes each price and shaves 15% of itself off. The classic stumble here is reaching for 0.85 — right instinct, because that is the one-shot multiply version, but wrong template: this expression subtracts the slice, so the fraction 0.15 is the chip that fits. ROUND(..., 2) keeps the cents honest. The result is 16 rows with list and promo side by side: the 89.99 keyboard drops to 76.49, the 199.99 smart watch to 169.99, the 14.99 HDMI cable to 12.74. I would present it exactly like this, both columns visible, because the first question every promo reviewer asks is 'off what?'.",
  },
  {
    id: "cs-020",
    topic: "l2",
    universe: "fraud",
    title: "Cents for the gateway cross-check",
    brief:
      "From: Risk team, spot-check rotation.\n\nThe payment gateway only speaks whole cents, so before we cross-check charges we need every booked order restated that way. Nothing gets filtered or trimmed — this is the full ledger, one row per order, with the money converted for machine comparison and the context columns left visible.",
    ask: "Every order's id, customer_id, status, total and created_at, plus total_cents = total × 100 rounded to 2 decimals.",
    template: `SELECT id, customer_id, {1}, total, created_at,
       ROUND(total * {2}, 2) {3} total_cents
FROM {4};`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the status column",
        why: "Reviewers need to see which tickets are still pending, so status rides along. The tempting total chip is already projected — repeating it would print the money column twice.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the cents multiplier",
        why: "A unit of currency is 100 cents, so multiply by 100: 576.54 becomes 57654. The tempting 10 would restate the same order as 5765.4 and silently poison the cross-check.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS names the converted column total_cents so the gateway merge keys on it. Without the alias the header is the raw multiplication expression and nothing maps.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Booked transactions live in orders. order_items has no customer_id or status — the fill would fail outright — and products is the catalog, not the ledger.",
      },
    ],
    distractors: ["total", "10", "IS", "order_items", "products"],
    walkthrough:
      "This is a full-ledger dump with one derived column: the gateway wants cents, so each total is multiplied by 100 inside the projection and rounded to 2 decimals to scrape off floating-point dust — 576.54 becomes a clean 57654. No filter, no sort: all 103 orders come back, one row each, with status and booking date riding along so reviewers have context without a second lookup. Spot-checking the fill: order 1 lands at 57654 cents, order 2 at 41681, the cancelled order 7 at 15252. The analyst habit worth stealing here: never hand-convert money in a spreadsheet — derive the cents in the query so the original total and its machine copy can never drift apart.",
  },
  {
    id: "cs-021",
    topic: "l2",
    universe: "inventory",
    title: "What the shelves are holding",
    brief:
      "From: Warehouse ops manager. Re: quarterly stock valuation.\n\nInsurance wants the shelves valued at list price: for each product, what the stock we are holding would be worth if it sold tomorrow. Show stock and price side by side with the multiplication spelled out, so the auditors can re-derive every figure by hand.",
    ask: "Each product's name, stock and price, plus shelf_value = price × stock rounded to 2 decimals.",
    template: `SELECT {1}, {2}, price,
       ROUND(price * stock, 2) {3} shelf_value
FROM {4};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the product label column",
        why: "The schedule is reconciled line by line, so each valuation needs its product name attached. The tempting unit_price chip is sales-ledger vocabulary — the catalog has never heard of it.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the on-hand column",
        why: "stock is the on-hand count the valuation multiplies against. Swapping in quantity would drag in sales-line thinking — that column belongs to order_items, not the catalog.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS gives the product of the two columns a real name, shelf_value, instead of an expression header the insurance schedule cannot map.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "Stock counts and list prices live on products. orders holds transactions with no name or stock column — point the query there and it fails before printing a row.",
      },
    ],
    distractors: ["unit_price", "quantity", "SUM", "IS", "orders"],
    walkthrough:
      "Shelf valuation is two existing columns meeting per row: price times stock, computed in the projection so each product gets its own figure, rounded to cents for the schedule. No filtering — insurance wants the whole floor. Sixteen rows come back, and the big ones jump out immediately: 120 keyboards at 89.99 tie up 10798.8, the 300 mice at 34.5 hold 10350, and the 40 smart watches at 199.99 are worth 7999.6. Even the humble HDMI cable matters at volume — 500 units at 14.99 is 7495 of sitting stock. Keeping stock and price visible next to the product lets the auditors re-derive any line by hand; that is the whole point of spelling the multiplication out rather than hiding it in a report tool.",
  },
  {
    id: "cs-022",
    topic: "l2",
    universe: "funnel",
    title: "The voucher column for the win-back",
    brief:
      "From: Growth marketing lead. Re: win-back wave 2.\n\nThe email tool's ingest is picky: it wants one row per customer with name, city, region, and the voucher amount stamped as its own field so the merge tags every contact. Everyone in this wave gets the same 15 credit — bake the number right into the sheet rather than typing it sixteen times.",
    ask: "Every customer's name, city and region, plus a constant voucher_credit column of 15 on each row.",
    template: `SELECT name, {1}, region, {2} AS voucher_credit
{3} customers;`,
    slots: [
      {
        answer: "city",
        kind: "keyword",
        label: "the city column",
        why: "The wave is segmented by home city, so city is projected. The tempting email chip would duplicate contact data the tool already holds — and doubled columns get the ingest bounced.",
      },
      {
        answer: "15",
        kind: "number",
        label: "the voucher amount",
        why: "The wave budget is a flat 15 credit per contact, so the literal 15 becomes a constant column stamped on every row. The 10 or 25 chips would quietly reprice the whole campaign.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM customers pulls the whole roster. WHERE would bolt a filter onto a read that must cover everyone, and suppliers in this slot would pile two table names into one clause and fail before reading a row.",
      },
    ],
    distractors: ["email", "10", "WHERE", "25", "suppliers"],
    walkthrough:
      "The trick this sheet turns on is a constant column: put a bare number in the SELECT list and every row carries it — 15 AS voucher_credit gives the mail-merge a field it can map without a lookup table. Around it, name, city and region come straight off customers, one row per contact. The result is 16 rows: Alice Chen in Berlin, Bruno Silva in São Paulo, Chloe Dubois in Lyon, each with 15 in the voucher column. Two things I would tell the growth lead: the sheet includes the two dormant accounts (Dmitri Volkov, Keiko Sato) because no filter was requested — trimming the wave is a follow-up — and if the credit ever changes, it is one number in one place, not sixteen cells to re-type.",
  },
  {
    id: "cs-023",
    topic: "l2",
    universe: "supplier",
    title: "Supplier scores on a 50-point scale",
    brief:
      "From: Supply-chain lead. Re: vendor review pack.\n\nProcurement scores vendors on a 50-point scale, but our system stores ratings out of 5. For the review pack I need each supplier's name, home region and raw rating, with the rescaled score worked out per row and kept to one decimal so the pack reads consistently.",
    ask: "Each supplier's name, region and rating, plus score_of_50 = rating × 10 rounded to 1 decimal.",
    template: `SELECT name, {1}, rating,
       ROUND({2} * {3}, 1) {4} score_of_50
FROM suppliers;`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the region column",
        why: "The review pack groups vendors by sourcing region, so region is projected. The tempting price chip is catalog vocabulary — suppliers has no price column and the query would die.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the rating factor",
        why: "rating is the stored 0-to-5 score, and the rescale multiplies it by 10. Substituting a literal like 1.0 here would flatten every vendor to the same meaningless score of 10.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the rescale multiplier",
        why: "Stretching a 5-point scale to 50 points multiplies by 10: 4.6 becomes 46. The tempting 1.0 would rescale nothing and hand the pack raw ratings wearing a score label.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS names the rescaled column score_of_50, so the pack shows one honest header. Skip it and the header is the raw multiplication text nobody can reference.",
      },
    ],
    distractors: ["EU", "price", "1.0", "SUM", "products"],
    walkthrough:
      "Rescaling a column is per-row arithmetic: rating * 10 inside the SELECT list, wrapped in ROUND(..., 1) so the pack keeps one decimal — the stored 4.6 prints as 46, the 3.9 as 39. I keep the raw rating next to the score so reviewers can see the conversion rather than trust it. Six suppliers come back: Alpine Audio GmbH tops the sheet at 48, Nordic Gadgets AB sits at 46, Midwest Hardware Co lands mid-pack at 44, and Pacific Textiles props it up at 39. One data quirk the pack should note: Andes Naturals' rating is stored as a bare 4, so its score prints 40 — same scale, just fewer digits in the source column.",
  },
  {
    id: "cs-024",
    topic: "l2",
    universe: "expense",
    title: "Processing fees on the card ledger",
    brief:
      "From: Ops finance, spend review.\n\nBefore the card statement reconciles, every booked order needs restating with the processor's flat 2.50 handling fee loaded on top. Finance wants the original total kept untouched next to the loaded figure, so the two can be tied out line by line when the statement lands.",
    ask: "Every order's id, created_at (as booked_on) and total, plus landed_cost = total + 2.5 rounded to 2 decimals.",
    template: `SELECT id, created_at AS booked_on, total,
       ROUND(total + {1}, 2) {2} landed_cost
FROM {3};`,
    slots: [
      {
        answer: "2.5",
        kind: "number",
        noVerify: true,
        label: "the fee amount",
        why: "The processor charges a flat 2.50 per order, so the projection adds 2.5 to each total — 576.54 loads up to 579.04. The tempting 0.5 would understate every line by two whole units.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS labels the loaded figure landed_cost so the reconciliation template can find its column — and keeps it visually apart from the untouched total beside it. An alias like total would put two identical money headers side by side.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Booked totals live in orders. order_items has no created_at or total column, so the fill would fail before printing a single row.",
      },
    ],
    distractors: ["total", "0.5", "1.02", "IS", "order_items"],
    walkthrough:
      "A flat per-order fee is the simplest per-row arithmetic there is: total + 2.5 inside the projection, rounded to 2 decimals so float dust never reaches the ledger. I keep three things visible per row — the order id, the booking date renamed booked_on for the finance template, and the untouched original total beside landed_cost — because reconciliation means comparing that pair line by line. The result covers all 103 orders: order 1 loads 576.54 up to 579.04, order 6 loads 752.96 up to 755.46. One judgement call worth flagging: the fee loads on every status including the cancelled orders, since the processor took its cut at booking — unwinding those is a separate exercise, not a spreadsheet edit.",
  },
  {
    id: "cs-025",
    topic: "l2",
    universe: "catalog",
    title: "Publish-safe product sheet",
    brief:
      "From: Catalog content manager. Re: storefront relaunch.\n\nThe web team's import is strict about headers: products must arrive labelled product_name, categories labelled shelf, and the price left exactly as priced. Nothing else changes — same rows, same values, just the naming the storefront template demands before it will ingest the sheet.",
    ask: "Every product's name (as product_name), category (as shelf) and price, with exactly those headers.",
    template: `SELECT name {1} product_name,
       category AS shelf,
       {2}
FROM {3};`,
    slots: [
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS is what turns name into product_name and category into shelf — the two headers the import demands. The tempting IS chip reads as a comparison operator and breaks the statement before it ever runs.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the price column",
        why: "price rides through untouched because the storefront renders the list figure as-is. The tempting stock chip would swap money for counts — real column, completely wrong sheet.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "The catalog lives in products. suppliers has names but no category column, so the fill would fail; order_items is purchase lines, not the shelf plan.",
      },
    ],
    distractors: ["IS", "stock", "WHERE", "suppliers", "unit_price"],
    walkthrough:
      "Aliases change labels, never data — and this sheet is pure relabelling. name AS product_name and category AS shelf produce exactly the headers the storefront template demands, while price rides through untouched because the import expects it as-is. One statement, one table, sixteen rows: Mechanical Keyboard K1 under shelf Electronics at 89.99, Wireless Mouse M3 beside it at 34.5, down to the Yoga Mat Eco 6mm in Fitness at 32. The habit worth keeping: rename in the query, not in the spreadsheet afterwards — a template that breaks on header names should never depend on someone remembering to fix them by hand after every export.",
  },
  {
    id: "cs-026",
    topic: "l2",
    universe: "month-close",
    title: "The raw ledger for the auditors",
    brief:
      "From: Financial Controller. Re: external audit fieldwork.\n\nThe auditors' first request is always the same: the orders ledger exactly as stored, every column, no trimming, nothing pre-filtered on their behalf. They want to apply their own tests to the raw material, so hand over the full table and let them slice it themselves.",
    ask: "The complete orders table — every column, every row, exactly as stored.",
    template: `{1} *
{2} {3};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "SELECT * is the read-everything form: the asterisk expands to every column in stored order. WHERE at the front is a syntax error, and LIMIT would trim rows the auditors explicitly want whole.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM names the one table sitting behind the asterisk. Swapping in LIMIT here breaks the statement — a row cap is not a table.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the ledger table",
        why: "The audit targets booked transactions, so the asterisk expands over orders. products or customers would hand over a 16- or 21-row catalog instead of the 103-row ledger.",
      },
    ],
    distractors: ["WHERE", "products", "customers", "LIMIT"],
    walkthrough:
      "When the deliverable is everything, untouched, SELECT * FROM orders is the honest answer — the asterisk expands to all six columns (id, customer_id, status, total, created_at, shipped_at) and all 103 rows come back exactly as stored. Scanning the dump: order 6 shows 752.96 delivered on 2024-01-01, while the pending and cancelled orders carry an empty shipped_at — the ledger's way of saying never left the building. I would still log a caveat in the audit file: star-selects are for eyeballing and hand-offs. The moment a figure starts to matter, name the columns explicitly so a schema change upstream cannot silently reshape the extract underneath you.",
  },
  {
    id: "cs-027",
    topic: "l2",
    universe: "growth",
    title: "Bookings feed for the metrics slide",
    brief:
      "From: Chief of Staff. Re: growth metrics automation.\n\nThe metrics dashboard pulls a bookings feed and its parser expects specific headers: the order's id, the account behind it, the value labelled booked_value, and the booking date. Send the raw feed exactly once per order — the dashboard does its own grouping and trimming downstream.",
    ask: "Each order's id, customer_id, total (as booked_value) and created_at, ready for the dashboard ingest.",
    template: `SELECT id, {1}, total {2} booked_value, created_at
{3} {4};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the account column",
        why: "The dashboard attributes bookings to accounts, so customer_id is the key it needs. The tempting name chip does not exist on orders — names live on customers, and this feed is deliberately single-table.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS relabels total to booked_value, the header the parser greps for. Skip it and the ingest silently drops the column as unknown — no error, just an empty chart.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM orders points the feed at the booking ledger. WHERE would jam a filter into a read that must stay complete — the dashboard owns the trimming.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Bookings are transactions, so orders it is. products has no customer_id — the fill would fail — and the dashboard expects one row per order, not per product.",
      },
    ],
    distractors: ["name", "SUM", "WHERE", "products", "total"],
    walkthrough:
      "The dashboard owns the math; my job is a clean, complete feed with the headers its parser expects. So: id and customer_id as-is, total renamed to booked_value via AS, created_at for the time axis, and FROM orders to sweep the ledger — no filtering, because the dashboard trims downstream and a pre-trimmed feed would quietly understate every metric. The fill returns all 103 bookings: order 1 books 576.54 against customer 16 on 2024-01-05, order 6 books 752.96 against customer 2 on 2024-01-01. The rename is the whole integration: booked_value is the header the parser greps for, and getting it wrong fails silently — the dashboard shows an empty series rather than an error message.",
  },
  {
    id: "cs-028",
    topic: "l2",
    universe: "refund-audit",
    title: "Restocking fee on refund payouts",
    brief:
      "From: refunds@ internal ticket #4488.\n\nPolicy update from finance: refund payouts now deduct the flat 1.50 restocking fee at quotation time, so customers see the exact amount that will land in their account. Restate every order's total on that basis — ids, statuses and original totals stay visible for the audit trail.",
    ask: "Every order's id, customer_id, status and total, plus refund_paid = total − 1.5 rounded to 2 decimals.",
    template: `SELECT id, customer_id, status, total,
       ROUND(total - {1}, {2}) {3} refund_paid
{4} {5};`,
    slots: [
      {
        answer: "1.5",
        kind: "number",
        noVerify: true,
        label: "the fee deduction",
        why: "The restocking fee is a flat 1.50 off each payout: total - 1.5, so 576.54 quotes as 575.04. The tempting 0.5 would overpay every customer by a full unit.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the rounding digits",
        why: "Payouts settle to cents, so ROUND keeps 2 decimals: 575.04 stays 575.04. The tempting 1 would print 575 — a figure no payment gateway will accept.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the rename keyword",
        why: "AS names the quoted payout refund_paid, separating it visually from the original total beside it. Without the alias the header is raw expression text and the audit trail loses its label.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM orders sweeps the ledger the policy applies to. Jamming WHERE into this slot would pre-trim the quotation sheet — status decisions come later, not inside the projection.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Refunds are quoted against booked totals, which live in orders. products has no status or total column, so the fill would fail outright.",
      },
    ],
    distractors: ["0.5", "1", "0", "IS", "products"],
    walkthrough:
      "A flat deduction is per-row arithmetic: total - 1.5 in the SELECT list, rounded to 2 decimals, aliased refund_paid so it reads apart from the untouched total sitting next to it. No filter — the quotation sheet must cover every order so the team can answer any ticket from one page. All 103 rows restate cleanly: the cancelled order 7 drops from 152.52 to 151.02, the big pending order 1 from 576.54 to 575.04. The caveat I would staple to the sheet: this is quotation math for every order, not a payout list — working out which of these will actually be refunded is the next exercise, and it needs filters we have not unpacked yet.",
  },
];
