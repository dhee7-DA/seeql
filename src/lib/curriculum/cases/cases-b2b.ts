// Case batch B2b — topic l2 (SELECT & FROM), ids cs-029…cs-040.
// Projection lessons: choosing columns, SELECT *, AS aliases, per-row
// arithmetic and ROUND in the select list. No filtering, sorting or
// aggregates — those live in later lessons. All figures audited against the
// live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB2b: CaseStudy[] = [
  {
    id: "cs-029",
    tier: "medium",
    topic: "l2",
    universe: "pricing",
    title: "The restock planning sheet",
    brief:
      "From: Head of Product. Re: vendor restock quotes.\n\nThe supplier wants our list prices in writing before they confirm the fall restock, and finance has signed off on a 5% planning bump across the catalog. Send a clean sheet: every product with its current list price, then the bumped figure beside it, rounded properly so nobody quibbles over half-cents. All sixteen products, nothing left out.",
    ask: "Every product's name and current price (relabeled current_list), plus restock_price = price with the 5% planning bump applied, rounded to 2 decimals.",
    template: `{1} name, price AS current_list,
       ROUND(price * {2}, 2) {3} restock_price
{4} products;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "A sheet built from existing fields starts with SELECT — it declares which fields each row of the output carries. WHERE would be a filter bolted on afterwards, not the word that opens a read.",
      },
      {
        answer: "1.05",
        kind: "number",
        label: "the planning multiplier",
        why: "A 5% bump means 105% of the price, so multiply by 1.05. The tempting 0.05 computes only the 5% slice, and 1.5 would smuggle in a 50% hike nobody approved.",
        noVerify: true,
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS renames the computed column to restock_price; without it the sheet's header would be the raw expression text. IS and WHERE are comparison words — neither renames anything.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Product names and prices live in the catalog table, so FROM products. IS belongs to NULL tests and WHERE to filtering; neither introduces a table.",
      },
    ],
    distractors: ["0.05", "1.5", "WHERE", "IS"],
    walkthrough:
      "A pure projection with one per-row calculation. The brief wants current and bumped side by side, so price appears twice: once raw under the current_list alias, once inside ROUND(price * 1.05, 2), where every row gets its own bumped figure. Two tells worth internalizing here — the multiplier (5% ON a price is 1.05x the price; 0.05x yields just the five-cent slice) and the AS that gives the export a human header instead of expression soup. Run it: 16 rows come back. Mechanical Keyboard K1 lists at 89.99 and plans at 94.49, Wireless Mouse M3 goes 34.5 to 36.23, Smart Watch S goes 199.99 to 209.99. One caveat for the memo: these are planning figures — the bump stays provisional until the supplier confirms volumes.",
  },
  {
    id: "cs-030",
    tier: "medium",
    topic: "l2",
    universe: "fraud",
    title: "The reviewer hand-off extract",
    brief:
      "From: Risk team. Re: cycle 7 spot-check hand-off.\n\nThe review crew starts Monday and works straight off printed extracts, so I need the raw feed — every order on file with its reference number, the customer behind it, where it stands, and what it is worth. Stamp each line with the cycle number so the printouts file correctly. No trimming, no rearranging; the reviewers do their own triage.",
    ask: "All 103 orders showing id, customer_id, status and total, plus a constant review_cycle column set to 7 on every row.",
    template: `{1} {2}, customer_id, status, total, {3} AS review_cycle
{4} {5};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The extract lists fields from rows that already exist, so SELECT opens the statement. GROUP would announce a bucketing job and collapse the feed to one row per group — the opposite of a hand-off list.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the row reference column",
        why: "Reviewers pull full records by the order reference, so id leads the list. A constant like 6 in that position would stamp the same number on all 103 rows and destroy the reference.",
      },
      {
        answer: "7",
        kind: "number",
        label: "the cycle tag",
        why: "The cycle tag is a literal from the memo: 7 on every row. It rides in the select list as a constant column — a stray 6 there would misfile every printout under the wrong cycle.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "FROM introduces the table the rows come from — orders. unit_price lives in order_items, not here, and products is the catalog, not the transaction log.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the source table",
        why: "Order headers — customer, status, total — live in orders. products has no customer_id or status, and shipped_at is a column, not a table.",
      },
    ],
    distractors: ["unit_price", "products", "GROUP", "6", "shipped_at"],
    walkthrough:
      "The reviewers work off paper, so this is a raw hand-off: no filtering, no sorting, just the fields they need plus a filing tag. id, customer_id, status and total come straight off the order headers, and the cycle number rides along as a constant column — putting the bare 7 in the select list turns it into a review_cycle of 7 on every row, which is how you stamp an extract without touching the data. Run it and 103 rows come back, starting with order 1 (customer 16, pending, 576.54, cycle 7) and order 3 (shipped, 767.64). Two habits worth copying: lead with the reference column so a printout is scannable, and prefer a tagged constant over sticky notes on a printout. The pile is unsorted — the biggest tickets sit wherever storage put them; ranking comes in a later lesson.",
  },
  {
    id: "cs-031",
    tier: "easy",
    topic: "l2",
    universe: "inventory",
    title: "Everything on the shelf, valued",
    brief:
      "From: Warehouse ops manager. Re: the quarterly count sheet.\n\nCount weekend is here and the floor team scans against a master sheet. I want the catalog exactly as the system holds it — every field, no surprises — plus a shelf value on each line (what the units on hand are worth at list price) so we can flag high-value bays for the counting crew. If a bay says it is holding five figures of stock, I want two people on it, not one.",
    ask: "The full products table as-is (every column), plus a computed shelf_value = price x stock rounded to 2 decimals.",
    template: `{1} {2}, ROUND(price * stock, 2) AS shelf_value
{3} products;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The count sheet is a read of the catalog, so SELECT opens it. count would try to collapse the sheet into a single number — the opposite of one line per product.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the everything-selector",
        why: "The memo says every field, no surprises — the * selector projects all columns in one stroke. Naming id instead would silently drop name, category, price and stock from the sheet.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Names, categories, prices and stock all live in products. suppliers is the vendor register — it has neither price nor stock, so the shelf math would fail outright.",
      },
    ],
    distractors: ["count", "id", "WHERE", "suppliers"],
    walkthrough:
      "When a stakeholder says the table as the system holds it, that is the * selector: one character, every column, no risk of dropping a field the floor team expected. The one addition is the derived shelf value — ROUND(price * stock, 2) multiplies list price by units on hand per row, so each line carries its own figure. Run it: 16 rows, six fields each. The bays that earn a second counter: Mechanical Keyboard K1 at 120 units x 89.99 puts 10,798.80 on the shelf, HDMI 2.1 Cable 2m at 500 x 14.99 is 7,495 even, and Smart Watch S at 40 x 199.99 is 7,999.60. Worth saying in the debrief: shelf value assumes list price, not margin — high value on the shelf is not the same as high exposure in the books.",
  },
  {
    id: "cs-032",
    tier: "medium",
    topic: "l2",
    universe: "funnel",
    title: "The mailing-list import file",
    brief:
      "From: Growth marketing lead. Re: the ESP migration.\n\nWe move service providers this week and the new tool refuses an import until the headers match its template exactly. Pull our full customer roster — names and email addresses — but relabel them to the template's wording so the mapping passes validation on the first try. All sixteen records, and drop nobody; I will clean the list inside the tool.",
    ask: "Every customer's name and email, with the output headers relabeled subscriber and contact for the import file.",
    template: `{1} name AS subscriber, email {2} contact
{3} {4};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "An import file is a projection of existing fields, so SELECT opens the statement. city after it would read as a stray first token — the statement never starts that way.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the header alias",
        why: "AS performs the rename the template demands: email travels out as contact. Without the rename keyword the parser sees two bare words in a row and the statement falls over.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "The roster — names and emails — lives in customers. suppliers has names but no email field, and orders has neither; both would fail the import before it starts.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Email addresses are customer facts, so the table is customers. orders holds transactions with no contact fields, and city is a column inside customers, not a table.",
      },
    ],
    distractors: ["suppliers", "orders", "WHERE", "city"],
    walkthrough:
      "Migration tooling is pedantic about headers, so the aliases carry the case: name goes out as subscriber and email as contact, matching the vendor template word for word. Underneath the relabeling this is the simplest projection there is — two fields, one table, every row. Run it: 16 rows, starting Alice Chen with alice.chen@example.com and Bruno Silva with bruno.silva@example.com. Two things to flag before the import runs: the file carries the two switched-off accounts (Dmitri Volkov and Keiko Sato) because the brief said drop nobody, and email is the unique key in the new tool — one malformed address and the whole batch bounces. First-try pass rate is the real KPI here.",
  },
  {
    id: "cs-033",
    tier: "medium",
    topic: "l2",
    universe: "supplier",
    title: "Vendor scores on a 100-point scale",
    brief:
      "From: Supply-chain lead. Re: the vendor scorecard.\n\nProcurement reviews our six suppliers next week and the committee refuses to read five-point ratings — they want everything on a 100-point scale like their internal KPIs. Give me each vendor with its region and the raw rating, then the same rating rescaled and rounded to a whole number. It is a straight translation, but it has to look native on the scorecard.",
    ask: "Each supplier's name, region and rating, plus score_100 = rating rescaled onto a 100-point scale, rounded to a whole number.",
    template: `{1} name, region, rating,
       ROUND(rating * {2}, 0) {3} score_100
{4} suppliers;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The scorecard is a per-vendor read, so SELECT opens it. WHERE would filter vendors out of the sheet — the committee expects all six.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the rescale multiplier",
        why: "Five-point scale to 100-point scale is rating x 20 — that is the whole translation. The tempting 10 or 2 would score Alpine Audio at 48 or 9.6 and wreck the committee's comparison.",
        noVerify: true,
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS publishes the computed column under the scorecard's own label, score_100. Without it the header would read as raw multiplication and the committee would ask questions.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Vendor names, regions and ratings live in suppliers — six rows, one per vendor. products links to vendors by reference but holds no ratings at all.",
      },
    ],
    distractors: ["10", "2", "WHERE", "IS"],
    walkthrough:
      "This is the rare stakeholder ask that is purely cosmetic — same facts, different dress. rating x 20 rescales the five-point scale onto a hundred, and ROUND(..., 0) rounds to a whole number because the committee's KPI wall has no decimal places on it. Run it: 6 rows. Nordic Gadgets AB (EU) turns 4.6 into 92, Pacific Textiles (APAC) turns 3.9 into 78, and Alpine Audio GmbH tops the sheet at 4.8 into 96. One honesty note for the scorecard footer: multiplying by 20 preserves order exactly, so no vendor gains or loses rank in translation — Andes Naturals still sits at the bottom with 4 into 80. The scale looks more precise than the data underneath it; that is the point, and the caveat.",
  },
  {
    id: "cs-034",
    tier: "medium",
    topic: "l2",
    universe: "expense",
    title: "Rebuilding spend line by line",
    brief:
      "From: Ops finance spend owner. Re: spend attribution for the town hall.\n\nLeadership wants spend at line granularity, not the rolled-up order totals — they keep asking which items actually drive a basket. Reconstruct every purchase line with its order reference, product reference, units and per-unit price, then compute what each line is worth on its own. Every line in the ledger, no exceptions; I will summarize on my side.",
    ask: "Every order line with order_id, product_id, quantity and unit_price, plus line_spend = quantity x unit_price rounded to 2 decimals.",
    template: `SELECT order_id, product_id, quantity, unit_price,
       ROUND({1} * {2}, 2) {3} line_spend
{4} order_items;`,
    slots: [
      {
        answer: "quantity",
        kind: "keyword",
        label: "the units column",
        why: "A line's spend is units times per-unit price, so the first factor is quantity. id would multiply a line number by a price — a figure that means nothing on any invoice.",
      },
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the per-unit price column",
        why: "unit_price is what each unit actually sold for on that line. price exists only in the catalog table, and today's list price is not what the invoice said.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS names the computed column line_spend so the export reads like finance wrote it. Without a rename, the header would be the whole multiplication expression.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Line-level facts — order_id, product_id, quantity, unit_price — live in order_items. orders only knows basket totals; the line grain does not exist there.",
      },
    ],
    distractors: ["id", "price", "total", "SUM", "WITH"],
    walkthrough:
      "Leadership keeps asking what is inside a basket, and the answer lives at the line grain: quantity x unit_price per row, computed in the select list so every line gets its own figure. I kept order_id and product_id on the sheet so any line traces back to its basket and catalog entry without a second pull. Run it and the ledger rebuilds — 251 lines, opening with 3 x 31.02 for 93.06, then 2 x 15.15 for 30.3 (note the sheet really shows 30.3, not 30.30; trailing zeros are display, not data), then 1 x 25.26 for 25.26. The cross-check that matters: order 1's four lines — 93.06, 30.3, 25.26, 427.92 — sum to exactly its booked 576.54. If line spend ever fails to add up to the basket, a line went missing somewhere, and that is a different memo.",
  },
  {
    id: "cs-035",
    tier: "medium",
    topic: "l2",
    universe: "catalog",
    title: "The lean stock feed",
    brief:
      "From: Catalog content manager. Re: the partner stock feed.\n\nOur retail partner's storefront maps exactly two fields, and their format uses their own label for the stock figure. Send the lean version: product name and units on hand, nothing else — their importer rejects files with extra fields, and the stock label has to match their spec letter for letter. Sixteen products, one line each.",
    ask: "A two-field feed: product name plus its stock level, relabeled units_in_stock to match the partner's spec.",
    template: `{1} {2}, {3} {4} units_in_stock
{5} products;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "A feed with a fixed field list starts with SELECT — it declares the two fields the partner's importer expects to find.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the name column",
        why: "The partner maps products by name, so name is field one. stock in that slot would send numbers where their storefront expects labels, and the file would be rejected.",
      },
      {
        answer: "stock",
        kind: "keyword",
        label: "the stock column",
        why: "units_in_stock is the stock figure under a new label, so the column being aliased is stock. price would publish list prices where the spec wants counts.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS performs the rename their spec demands — stock travels as units_in_stock. Their importer matches headers literally, so this keyword is doing commercial work.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Stock counts live on the product records in products. category is a field of that table, not a table, and no other table holds stock.",
      },
    ],
    distractors: ["price", "category", "ORDER", "WHERE"],
    walkthrough:
      "Integration specs are where projection discipline pays: the partner wants exactly two fields, one of them under their label. So the select list is name plus stock AS units_in_stock — the AS is not decoration, it is the difference between a file that maps and a file that bounces. Run it: 16 rows, two fields each. The spread the partner sees: HDMI 2.1 Cable 2m at 500 units is the deepest shelf, Running Socks 3-pack at 400 is next, and Smart Watch S sits at 40 — the thinnest. What I deliberately left out matters too: no prices, no categories, no reference numbers. The partner resells at their own markup, and handing them our prices would be a commercial leak with a file extension.",
  },
  {
    id: "cs-036",
    tier: "medium",
    topic: "l2",
    universe: "month-close",
    title: "The reconciliation pull",
    brief:
      "From: Financial Controller. Re: pre-close reconciliation.\n\nBefore I tie the revenue number to the bank feed I want the raw order values as the system booked them — one line per order, labels matching the ledger's wording. Round to proper cents so the tie-out does not wobble over display precision. Every order on file, every status — the bank feed does not care whether an order later cancelled; gross is gross.",
    ask: "Order id and total for all 103 orders, with the total relabeled booked_total and rounded to 2 decimals.",
    template: `{1} id, ROUND(total, {2}) {3} booked_total
{4} orders;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The pull reads booked values off existing rows, so SELECT opens it. MIN would collapse everything into the single smallest total — one cell, not 103 rows.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding precision",
        why: "Money rounds to cents, so the precision argument is 2. A 0 would round to whole units and misstate every total, and a 1 would drop the cents entirely.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS relabels the output to the ledger's wording, booked_total, so the tie-out sheet matches the finance system term for term. WHERE cannot rename — it only filters.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Booked order values live in orders. order_items holds per-line prices at the wrong grain, and nothing else carries a total column at all.",
      },
    ],
    distractors: ["0", "1", "WHERE", "MIN", "AVG"],
    walkthrough:
      "A tie-out wants the system's own numbers, one line per order, labeled the way the ledger spells them. So: id, then ROUND(total, 2) AS booked_total — the rounding is mostly insurance, because the stored totals already carry cents; the point is that display precision never contaminates a reconciliation. No status screen: the bank feed counts gross, including orders that later cancelled. Run it: 103 rows. Order 1 books 576.54, order 39 books 845.92, and the largest booking on file is 1,088.44 on order 74. When I sum this column I should land on the same gross the close deck opens with — if the two disagree, I look at rounding first and missing orders second, in that order.",
  },
  {
    id: "cs-037",
    tier: "easy",
    topic: "l2",
    universe: "growth",
    title: "The market map roster",
    brief:
      "From: Chief of Staff. Re: the market map slide.\n\nThe board deck carries a one-slide market map and I need the customer roster behind it: who they are, where they sit, and which region bucket each belongs to. All of them, including the accounts we have switched off — the map should show footprint, not just current activity. Keep it to the three fields; design fills in the rest.",
    ask: "Every customer's name, city and region for the market map — all 16 accounts, including switched-off ones.",
    template: `{1} name, city, {2}
{3} customers;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The roster is a read of three existing fields, so SELECT opens it. COUNT would hand back a single headcount and lose every name on the map.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the region column",
        why: "The map buckets customers by region — EU, US, APAC, LATAM — so region is the third field. Repeating city would put Berlin where EU belongs and the buckets would dissolve.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Customer identities and their geography live in customers. orders knows about transactions, not people — it has no name or city to project.",
      },
    ],
    distractors: ["city", "active", "orders", "COUNT"],
    walkthrough:
      "The market map is a footprint story, so the roster needs exactly three fields: who (name), where (city), and which bucket (region). Everything else — reference numbers, signup dates, account flags — stays behind, because design only maps geography. Run it: 16 rows, reading Alice Chen, Berlin, EU; then Bruno Silva, Sao Paulo, LATAM; and so on down the roster. The regional spread that drives the slide: 8 EU, 5 APAC, 2 US, 1 LATAM — Europe is the anchor and LATAM is a single lighthouse customer. Two accounts on the map are switched off (Dmitri Volkov and Keiko Sato), and they stay: footprint means everywhere we have been, not just where we are active today.",
  },
  {
    id: "cs-038",
    tier: "medium",
    topic: "l2",
    universe: "refund-audit",
    title: "Goodwill credits, computed per order",
    brief:
      "From: refunds@ internal ticket #4517. Re: the pricing-glitch goodwill program.\n\nEvery order placed during the glitch window earns a goodwill credit worth 15% of what the customer paid, and finance wants the credit computed on the order, not guessed line by line. Pull each order with its value and the computed credit beside it, rounded to cents. I will screen statuses myself — the program applies before we know whether an order ships.",
    ask: "Order id and total for every order, plus goodwill_credit = 15% of the total, rounded to 2 decimals.",
    template: `{1} {2}, total,
       ROUND(total * {3}, 2) {4} goodwill_credit
{5} orders;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The worksheet reads order facts, so SELECT opens the statement. SUM would collapse all 103 orders into one cell — the opposite of a per-order credit sheet.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the order reference column",
        why: "Each credit must trace to its order, so id leads the row. A literal like 15 in that position would stamp the rate onto every row instead of the reference.",
      },
      {
        answer: "0.15",
        kind: "number",
        label: "the credit rate",
        why: "A credit worth 15% OF the total is the slice: multiply by 0.15. The tempting 1.15 computes the total plus 15% — charging customers extra on a goodwill program.",
        noVerify: true,
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS publishes the computed column as goodwill_credit, the name finance expects on the journal import. Without it the header is raw expression text.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Order values live in orders. products is the catalog with no order totals, and refund decisions ride on the order record, not the line items.",
      },
    ],
    distractors: ["1.15", "15", "products", "SUM"],
    walkthrough:
      "Finance wants the credit computed on the order, not eyeballed, so the multiplication lives in the select list: ROUND(total * 0.15, 2) per row. The multiplier is where goodwill programs go wrong — 0.15 takes the 15% slice; 1.15 would add 15% and turn a refund into an upcharge. Run it: 103 rows, three fields. Order 1 (576.54 booked) carries a credit of 86.48; order 3 books 767.64 for 115.15; and order 7, which cancelled, still books 152.52 for 22.88, because the program applies before we know whether anything ships. When the refunds queue is worked, the screen-out happens on their side; my sheet deliberately shows every order so the policy cost is visible in full — sum the credit column and that is the program's price tag.",
  },
  {
    id: "cs-039",
    tier: "hard",
    topic: "l2",
    universe: "pricing",
    title: "The flat-cut promo worksheet",
    brief:
      "From: Head of Product. Re: the clearance worksheet.\n\nWe are clearing slow shelves with a flat 10 off every product — the same absolute cut whether it is a cable or a watch. Marketing wants the sheet to show each item's name, category and current price with the clearance figure beside it, so they can see how the cut lands across the range. One line per product, sixteen total.",
    ask: "Product name, category, price and promo_price = price minus a flat 10, one row per product.",
    template: `{1} {2}, category, price, price - {3} {4} promo_price
{5} {6};`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The worksheet reads catalog fields plus one derived figure, so SELECT opens it. ORDER on its own means nothing until a sort clause follows — and no sort was asked for.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the name column",
        why: "Marketing keys artwork and copy to product names, so name is field one. stock would put shelf counts where the labels belong and the sheet would be useless for copy review.",
      },
      {
        answer: "10",
        kind: "number",
        label: "the flat cut",
        why: "The cut is a flat 10 off — subtraction, not a percentage. The decoy 0.1 would take 90% off everything, and 100 would push most items below zero.",
        noVerify: true,
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS names the computed column promo_price so the sheet has a header marketing can reference. Bare expression text as a header reads like an error.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Names, categories and prices all live on product records — one table. suppliers is the vendor register and holds none of these fields.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the source table",
        why: "The clearance covers the whole catalog, so the table is products. stock is a field within it, not a table, and suppliers has no price to cut.",
      },
    ],
    distractors: ["0.1", "100", "ORDER", "stock", "suppliers"],
    walkthrough:
      "A flat cut is the simplest promo math there is — price minus 10, per row, aliased promo_price — and the sheet exists to show how unequal a flat cut feels. Run it: 16 rows. Mechanical Keyboard K1: 89.99 down to 79.99, about 11% off. Smart Watch S: 199.99 down to 189.99, just 5% off. Running Socks 3-pack: 18.5 down to 8.5 — more than half the ticket gone. That is the whole story for the pricing review: the same 10 lands as a rounding error on premium shelves and a fire sale on accessories — the HDMI cable goes 14.99 to 4.99. Whether that is the intended elasticity signal or a margin incident depends on the shelf, which is exactly why marketing wanted the category field on the sheet.",
  },
  {
    id: "cs-040",
    tier: "easy",
    topic: "l2",
    universe: "fraud",
    title: "The velocity watchlist feed",
    brief:
      "From: Risk team. Re: the velocity watchlist.\n\nBefore the next sweep I want the bare timeline: every order's reference and the moment it was placed, nothing else — the analyst tooling ingests exactly those two fields and rejects anything more. Do not reorder or trim; the loader treats file order as the timeline and the pattern analysis depends on it. Fourteen months of history, all of it.",
    ask: "Order id and created_at for every order on file — two fields, no extras, no trimming.",
    template: `{1} id, {2}
{3} orders;`,
    slots: [
      {
        answer: "SELECT",
        kind: "keyword",
        label: "the projection keyword",
        why: "The loader wants exactly two fields per order, so SELECT declares them. WHERE would filter rows out — and the sweep needs the full timeline.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the timestamp column",
        why: "The moment each order was placed is created_at. shipped_at is a different event — dispatch, not placement — and the velocity pattern lives in placement times.",
      },
      {
        answer: "FROM",
        kind: "keyword",
        label: "the source clause",
        why: "Order timestamps hang off the order records in orders. total and customer_id are fields of that table, not tables themselves — FROM needs a source.",
      },
    ],
    distractors: ["shipped_at", "customer_id", "total", "WHERE"],
    walkthrough:
      "Pattern analysis wants the barest possible feed: order reference and placement moment, nothing else — the tooling rejects extra fields, so restraint is a feature. This is projection at its most disciplined: two columns, one table, all 103 rows left in storage order because the loader treats file order as the timeline. Run it and you can see the shape of the business: the earliest placement on file is 2024-01-01 and the latest is 2025-02-27 — fourteen months of history. Two fields to resist adding: customer_id feels helpful, but the join happens inside the analysis tool, and shipping it raw just gives the loader one more reason to reject the file. Gaps in this feed are order gaps, not data gaps — that is the signal the sweep hunts.",
  },
];
