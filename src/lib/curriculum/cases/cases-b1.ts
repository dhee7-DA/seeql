// Batch B1 — case files cs-001…cs-015, topic l1 (Tables & keys).
// Orientation queries: seeing what is in a table, row counts, lookups by key.
// Every figure is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB1: CaseStudy[] = [
  {
    id: "cs-001",
    topic: "l1",
    universe: "inventory",
    title: "Shelf card for the HDMI cable",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: aisle 3 recount.\n\nThe HDMI cable bin keeps coming up short against the system, and the crew walks that aisle tomorrow morning. Before anyone heads down I want the system's shelf card for that line on my desk: its catalog registry number, the name exactly as we registered it, and the on-hand figure the system currently believes. Then we'll know whether the count sheet or the pick face is lying.",
    ask: "The registry number, product name and stock for catalog registry number 9 — one shelf card.",
    template: `SELECT {1}, name, stock
FROM products
{2} id = {3};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the registry column",
        why: "The count sheet cites the catalog's own registry number, and that number lives in the id column — category or price would print the wrong field on the card and the recount would chase the wrong fact.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the single-line filter",
        why: "One shelf card out of sixteen products means a row filter: WHERE keeps only the line whose id matches. Without it the query prints the entire catalog and nothing gets recounted.",
      },
      {
        answer: "9",
        kind: "number",
        label: "the catalog registry number",
        why: "The HDMI 2.1 Cable sits at registry number 9 in the catalog — a neighbor's number like 10 prints the Laptop Stand's card and sends the crew to the wrong bin.",
      },
    ],
    distractors: ["category", "price", "HAVING", "10", "16"],
    walkthrough:
      "This ask is a single-row lookup: one product, three fields. The count sheet says 'the HDMI cable', but catalogs don't search by nickname — they search by the registered id, and the HDMI 2.1 Cable 2m sits at id 9. So: id, name and stock off the products catalog, filtered to that one line. The card that comes back reads 9, HDMI 2.1 Cable 2m, stock 500 — five hundred units on the system's books, which also makes it the largest single holding in the whole catalog. If tomorrow's recount lands near 500, the system is healthy and the count sheet is stale; if it lands near the sheet's number, we have a receiving problem, not a data problem.",
  },
  {
    id: "cs-002",
    topic: "l1",
    universe: "funnel",
    title: "EU active roster for the mail merge",
    brief:
      "From: Growth marketing lead. Re: EU launch mailing.\n\nWe're seeding the EU launch email next week and legal only cleared contacts who are still active accounts. Pull the roster I should hand the email tool: each person's name and email address, EU region only, and nobody flagged inactive. I'd rather import a clean list once than clean a messy one after the send.",
    ask: "Name and email for every customer whose region is EU and whose account is still active.",
    template: `SELECT {1}, email
FROM {2}
WHERE region = {3} AND active = {4};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the contact column",
        why: "The mail merge needs the greeting field, and that's the name column — city or region would personalize emails with 'Berlin' instead of a person's name.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the roster source",
        why: "People and their email addresses live in customers — the vendor and catalog registers carry no email column at all, so pointing the query there fails before anything imports.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "The launch is EU-only, and region is a text value, so it wears quotes: 'EU'. A bare EU would be read as a column name and the query would die; 'APAC' would quietly import five Dubai-to-Seoul contacts legal never cleared.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "Accounts are flagged 1 for active and 0 for closed — legal cleared active contacts only, so the filter is active = 1. Swapping in 0 would import exactly the two people we're not allowed to email.",
      },
    ],
    distractors: ["city", "suppliers", "'APAC'", "0", "'US'"],
    walkthrough:
      "Two filters, one roster: region = 'EU' and active = 1, joined with AND because a contact must pass both to make legal's cut. Run it and seven rows come back — Alice Chen in Berlin, Chloe Dubois in Lyon, Isabella Rossi in Milan, Liam O'Brien in Cork, Noah Meyer in Hamburg, Olivia Brown in London and Pedro Alvarez in Madrid. Eight EU contacts are on file, but Dmitri Volkov in Tallinn sits at active = 0, so he drops and the import ships with seven. That flag column is the whole reason the EU headcount (8) and the mailable EU headcount (7) disagree — worth remembering before the next 'missing contact' ticket gets filed.",
  },
  {
    id: "cs-003",
    topic: "l1",
    universe: "supplier",
    title: "Vendor card for the audio partner",
    brief:
      "From: Supply-chain lead. Re: QBR pack, vendor section.\n\nThe quality team wants the full registry card for our audio partner in the QBR pack — every field we hold on them, nothing summarized, nothing retyped. Pull the whole card by its vendor register number so the pack shows exactly what sits in the master file, character for character.",
    ask: "Every column of the vendor whose register number is 5 — the complete master-file card, one row.",
    template: `SELECT {1}
FROM {2}
{3} {4} = {5};`,
    slots: [
      {
        answer: "*",
        kind: "keyword",
        label: "the every-column chip",
        why: "'Every field we hold' is the star's job: * returns all columns without naming them. Naming one column like name would print a card with holes in it.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the vendor register",
        why: "Vendor master files live in suppliers — products is the catalog of things we sell and customers is the account register, so either would return some other register entirely.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row filter",
        why: "One card out of six vendors means a row filter: WHERE keeps only the register number we asked for. HAVING can't stand in — it only works after rows have been grouped.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the register column",
        why: "The vendor register number is the id column — filtering on region or rating would return every vendor sharing that value, not the one card the QBR needs.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the vendor register number",
        why: "Register number 5 is Alpine Audio GmbH — the EU audio partner holding the file's best rating, 4.8. Vendor 6 would hand the QBR the Andes Naturals card instead.",
      },
    ],
    distractors: ["name", "products", "customers", "HAVING", "region", "6"],
    walkthrough:
      "'The full card' is what the star is for: SELECT * carries every column the vendor master file holds, and id = 5 narrows six vendor rows down to one. The card that prints: register 5, Alpine Audio GmbH, region EU, rating 4.8 — which happens to be the best score on the whole vendor file, a nice line for the QBR narrative. Two habits this query builds: reach for * when the ask says 'everything we hold', and pull cards by register number rather than by name, because register numbers are unique on the file while names get misspelled in meeting notes.",
  },
  {
    id: "cs-004",
    topic: "l1",
    universe: "expense",
    title: "Receipt line 4, itemized",
    brief:
      "From: Ops finance, spend review. Re: January card reconciliation.\n\nA cardholder is disputing a charge and I need the receipt line we booked for it before the call at three. Pull the full line exactly as recorded: which voucher it belongs to, which catalog item was bought, how many units, and the per-unit price we were charged. I want the stored figures, not anyone's retyping of them.",
    ask: "Order id, product id, quantity and unit price exactly as booked on receipt line 4.",
    template: `SELECT {1}, {2}, quantity, {3}
FROM {4}
WHERE {5} = {6};`,
    slots: [
      {
        answer: "order_id",
        kind: "keyword",
        label: "the voucher column",
        why: "Each receipt line records which voucher it belongs to in order_id — that's the first thing the dispute call will ask for. product_id here would name the item instead of the voucher.",
      },
      {
        answer: "product_id",
        kind: "keyword",
        label: "the item column",
        why: "What was bought is recorded as the catalog's product_id — order_id in this position would just repeat the voucher number and the call would stall on 'so what did they actually buy?'",
      },
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the per-unit charge",
        why: "The disputed figure is what each unit cost, stored as unit_price. There is no plain price column on the receipt lines — price belongs to the catalog — so typing price breaks the query.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the receipt-lines ledger",
        why: "Individual receipt lines live in order_items; the vouchers themselves are one row each in orders, which has no product or unit-price fields — the wrong ledger fails immediately.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the line-number column",
        why: "Receipt lines are numbered in the id column, so 'line 4' is WHERE id = 4 — filtering on quantity or unit price would match whatever else happens to share that value.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the receipt line number",
        why: "The disputed line is line 4: voucher 1, item 4, three units at 142.64 each. Line 3 is a different purchase entirely — a single Desk Mat at 25.26 — and would misquote the dispute.",
      },
    ],
    distractors: ["orders", "products", "price", "3", "6", "quantity"],
    walkthrough:
      "A dispute call needs the booked truth: one receipt line, four stored fields. Receipt lines live in the order_items ledger and the disputed line is line 4, so id = 4 pulls it. What comes back: voucher 1, catalog item 4, quantity 3, unit price 142.64. Cross-checking the catalog, item 4 is the Noise-Canceling Headset — so the cardholder bought three headsets at 142.64 each, 427.92 of voucher 1's 576.54 total, and the receipt math ties out. Quoting stored figures like these is what ends 'he said, she said' arguments in about a minute.",
  },
  {
    id: "cs-005",
    topic: "l1",
    universe: "catalog",
    title: "The Wearables shelf, listed",
    brief:
      "From: Catalog content manager. Re: Wearables landing page.\n\nThe merchandising team is building a Wearables landing page and wants the shelf as it's registered: each item's registry number, display name and list price. Nothing computed, nothing rearranged — just the shelf as the catalog holds it, so the page and the catalog can never disagree.",
    ask: "Id, name and price for every product whose category is Wearables.",
    template: `SELECT {1}, name, {2}
FROM {3}
WHERE {4} = {5};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the registry column",
        why: "The page links each card back to its catalog entry, and that handle is the id column — stock would put warehouse counts on a customer-facing page.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the list-price column",
        why: "The shelf shows what things cost, and list price lives in the price column — swapping in stock would print inventory figures where prices belong.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog source",
        why: "The shelf list comes from products — customers holds people, not SKUs, and has no category column to filter on, so the query would fail before it listed anything.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf column",
        why: "Shelves are labeled in the category column, so the filter is category = 'Wearables'. Filtering on name would hunt for a product literally named Wearables and come back empty.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the shelf label",
        why: "The shelf's label is the text 'Wearables', quotes included — SQL matches it character for character. 'Audio' would build the landing page from the wrong shelf.",
      },
    ],
    distractors: ["stock", "name", "suppliers", "customers", "'Audio'", "'Fitness'"],
    walkthrough:
      "Reading the ask: one shelf, three registered fields. Category is the shelf label, so the filter is category = 'Wearables' — quoted, because it's text matched character for character. Two rows come back: registry 12, Fitness Band X2 at 79, and registry 13, Smart Watch S at 199.99. That second row matters beyond the landing page — 199.99 is the highest list price in the entire catalog, so the Wearables shelf doubles as the premium anchor for merchandising. Note what the query doesn't do: no sorting, no math. The page gets the shelf exactly as registered, which is precisely the point.",
  },
  {
    id: "cs-006",
    topic: "l1",
    universe: "growth",
    title: "Headline count for the growth deck",
    brief:
      "From: Chief of Staff. Re: board deck, slide 2.\n\nSlide 2 needs one number: how many customer accounts are currently active. Not total accounts, not a region slice — the clean active count the whole growth story rests on. One figure, no decoration, and it has to match what finance reports so the deck doesn't get picked apart in the meeting.",
    ask: "The number of customer accounts whose active flag is 1.",
    template: `SELECT {1}(*)
FROM {2}
WHERE active = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a headcount of matching rows, so COUNT(*) is the aggregate — SUM before the asterisk isn't a tally at all, and the query dies parsing it.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the account register",
        why: "Accounts live in customers — orders is the booking ledger and carries no active flag at all, so pointing the count there fails before it counts anything.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag value",
        why: "The flag is 1 for active and 0 for closed — the deck wants the live base, so the filter is active = 1. Using 0 would report the two closed accounts and undo the growth story in one slide.",
      },
    ],
    distractors: ["SUM", "products", "orders", "0"],
    walkthrough:
      "One filter, one number. The active flag is the account register's on/off switch — 1 means live — so the query counts accounts where active = 1. The figure that lands is 14: fourteen of the sixteen accounts on file are open, and the two closed ones are Dmitri Volkov and Keiko Sato. Fourteen out of sixteen reads as an 87.5% live base, which is exactly the shape slide 2 wants. The analyst habit here: count from the flag, never by eyeballing the roster — flags survive the quarter, memories don't.",
  },
  {
    id: "cs-007",
    topic: "l1",
    universe: "refund-audit",
    title: "Which cancelled ticket was worth 397.99",
    brief:
      "From: refunds@ — internal ticket #4419, escalation from #4412. Re: goodwill ledger sign-off.\n\nFinance signed off the cancellation queue and one figure keeps being quoted in the wrap-up thread: a cancelled order worth 397.99. I need its booking number for the ledger note — the id and the amount exactly as recorded, from the cancelled pile only, so nobody pastes the wrong ticket into the memo.",
    ask: "The id and total of the cancelled order whose recorded total is exactly 397.99.",
    template: `SELECT {1}, total
FROM {2}
WHERE {3} = {4} AND total = {5};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the booking number",
        why: "The ledger note needs the booking number, which is the id column — name would hunt for a column the booking ledger doesn't have and the query would fail outright.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the booking ledger",
        why: "Bookings and their amounts live in orders — products is the catalog and carries neither a status nor a total to filter on, so it can't answer a bookings question.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the pile column",
        why: "The pile is defined by the status column — filtering on customer_id would hunt bookings belonging to a customer named 'cancelled', which is nobody.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the pile label",
        why: "Cancelled bookings wear the text 'cancelled', quotes included — and it must be the cancelled pile, because 'pending' would find nothing at 397.99: that amount belongs to a cancelled ticket.",
      },
      {
        answer: "397.99",
        kind: "number",
        label: "the quoted amount",
        why: "The thread quotes 397.99, so the filter is total = 397.99 — an exact match. 206.19 and 152.52 are other cancelled tickets entirely and would cite the wrong booking in the memo.",
      },
    ],
    distractors: ["name", "customer_id", "products", "'pending'", "206.19", "152.52"],
    walkthrough:
      "The quoted amount is the anchor: 397.99, out of the cancelled pile. Both conditions live in the row filter — the pile label 'cancelled' in quotes, and the exact amount — because a booking must match both to be the one. One row comes back: booking 83 at 397.99, booked 2024-11-04, and that's the number for the ledger note. Context worth filing with it: the cancelled pile holds seven bookings and 397.99 is the largest loss among them — the next biggest are 206.19 (booking 95) and 152.52 (booking 7). An exact-amount lookup like this is how you turn a quoted figure back into the record behind it.",
  },
  {
    id: "cs-008",
    topic: "l1",
    universe: "pricing",
    title: "The anchor price, confirmed",
    brief:
      "From: Head of Product. Re: pricing review kickoff.\n\nBefore we talk increases I want the catalog's ceiling on the record: the single most expensive item we sell, by name and list price, exactly as registered. When the room starts arguing about what our premium anchor actually costs, I want to read the answer off the catalog rather than off anyone's slide.",
    ask: "The name and list price of the product whose registered price is 199.99.",
    template: `SELECT {1}, {2}
FROM {3}
WHERE price = {4};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the product column",
        why: "The room needs the item's name, which lives in the name column — id would make the Head of Product quote a bare number in a pricing meeting.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the list-price column",
        why: "The claim under test is the list price, stored in price — stock would 'confirm' the ceiling with a warehouse count of 40 units, which is a different fact entirely.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog source",
        why: "Registered prices live in products — suppliers holds vendor cards with no price field at all, so the lookup would error out before it answered anything.",
      },
      {
        answer: "199.99",
        kind: "number",
        label: "the ceiling figure",
        why: "The catalog's highest registered price is 199.99, so the filter is price = 199.99 — 149.99 is the headset one rung below and would hand the room the runner-up.",
      },
    ],
    distractors: ["stock", "category", "suppliers", "149.99", "129", "id"],
    walkthrough:
      "The ask inverts the usual lookup: we know the figure — 199.99, the ceiling from the last price sheet — and want the record behind it. Filter the catalog on price = 199.99 and exactly one row comes back: Smart Watch S. That's the anchor for the review: one SKU owns the top of the price ladder, and the next rung down is the Noise-Canceling Headset at 149.99, a fifty-unit gap. One caveat to say out loud in the room: an equality check only confirms the ceiling while the number is current — if a repricing lands mid-review, the equality comes back empty, and that emptiness is itself the signal.",
  },
  {
    id: "cs-009",
    topic: "l1",
    universe: "fraud",
    title: "Pull the flagged ticket's record",
    brief:
      "From: Risk team, spot-check rotation. Re: this month's manual review.\n\nThe rotation flagged booking 74 for manual review and the reviewer needs the record as stored — the booking number, the amount, and the fulfillment state — before anyone contacts the account. No summaries, no retyped numbers: the three stored fields, exactly as the ledger holds them.",
    ask: "Id, total and status exactly as stored for booking 74.",
    template: `SELECT id, {1}, {2}
FROM {3}
WHERE id = {4};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the amount column",
        why: "The review hinges on the ticket's value, stored in total — customer_id would show whose account it is but not what makes it worth reviewing.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the fulfillment column",
        why: "Where the ticket sits in fulfillment is the status column — created_at would timestamp the booking instead of saying whether it has left the building.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the booking ledger",
        why: "Booking records live in orders — products has no status column at all, so the pull would error instead of producing a review packet.",
      },
      {
        answer: "74",
        kind: "number",
        label: "the flagged booking number",
        why: "The rotation flagged booking 74 — the ledger's biggest ticket at 1,088.44. Booking 43 is the second-largest and would put the wrong ticket in front of the reviewer.",
      },
    ],
    distractors: ["customer_id", "created_at", "products", "customers", "43", "39"],
    walkthrough:
      "A spot-check starts from the stored record, so three fields off the flagged booking: id 74, total 1,088.44, status pending. That pairing is exactly why the rotation flagged it — the single largest ticket on the ledger is also still pending: 1,088.44 booked on 2024-10-04 that hasn't moved and carries no dispatch timestamp. For scale: the runner-up tickets are booking 43 at 945.21, also pending, and booking 39 at 845.92, already shipped. Reviewing the biggest ticket while it's still in flight is the whole point of the rotation — once a parcel ships, the fraud window has largely closed.",
  },
  {
    id: "cs-010",
    topic: "l1",
    universe: "inventory",
    title: "Count the Shenzhen shelf slots",
    brief:
      "From: Warehouse operations manager. Re: inbound container planning.\n\nThe next container from our Shenzhen electronics partner is being planned and I need to know how many of our registered SKU lines that partner actually feeds — the count of catalog lines carrying their register number, 2. It decides how many shelf slots the inbound plan reserves.",
    ask: "The partner register number and the count of products whose supplier_id is 2.",
    template: `SELECT supplier_id, {1}(*)
FROM {2}
WHERE {3} = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The ask is how many lines, so COUNT(*) does the tally — SUM before the asterisk isn't a count of anything and the query dies parsing it.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog source",
        why: "The shelf slots are catalog lines, and each line stamps its partner's register number in products — order_items is receipt lines and has no partner stamp to filter on.",
      },
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the partner column",
        why: "Partners are referenced by supplier_id on each catalog line — product_id is a different registry (the item's own number) and would count a coincidence, not the partner's lines.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the partner register number",
        why: "Register 2 is the Shenzhen electronics partner. Register 5 would count the audio partner's two lines instead — a different shelf plan entirely.",
      },
    ],
    distractors: ["SUM", "order_items", "suppliers", "product_id", "5", "7"],
    walkthrough:
      "The container plan needs a count per partner, and the partner is register 2. Every catalog line stamps its partner's register number, so the query counts catalog lines carrying register 2. The tally comes back 3 — three lines fed by the Shenzhen partner: the Wireless Mouse M3, the Ring Light and the Running Socks 3-pack. Cross-check worth keeping: registers 1 through 4 each feed three lines while 5 and 6 feed two apiece, so three is a common shelf load and the inbound plan should reserve accordingly. Counting the registry stamp beats walking the aisle and guessing.",
  },
  {
    id: "cs-011",
    topic: "l1",
    universe: "funnel",
    title: "CRM seed file, first five",
    brief:
      "From: Growth marketing lead. Re: CRM migration dry run.\n\nWe're rehearsing the CRM import and I want a small seed file first — the first five accounts on the house roster, with their registry numbers, names and cities — so the field mapping can be checked by eye before we push anything bigger. Take them as the system holds them, no rearranging.",
    ask: "Id, name and city for the first 5 rows of the customer roster.",
    template: `SELECT {1}, {2}, city
FROM {3}
LIMIT {4};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the registry column",
        why: "The CRM mapping keys on each account's registry number, so id leads the seed file — swapping in region would key accounts by geography and break the dry run.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the display-name column",
        why: "A file checked by eye needs the human field: name. Region would fill the column with EU, EU, US and tell the reviewer nothing about whether the mapping works.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the roster source",
        why: "The house roster of accounts lives in customers — suppliers is the vendor register and has no city column, so the seed file would fail to build.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the seed-file size",
        why: "The rehearsal wants five rows — small enough to eyeball, real enough to test the mapping. 3 would underfeed the test and 10 would tempt the team to skip the review entirely.",
      },
    ],
    distractors: ["email", "region", "suppliers", "orders", "3", "10"],
    walkthrough:
      "Seed files are about trust, not completeness: five rows, the roster's own order, no dressing. The row cap of 5 takes exactly the first five accounts as stored: Alice Chen in Berlin (1), Bruno Silva in São Paulo (2), Chloe Dubois in Lyon (3), Dmitri Volkov in Tallinn (4) and Emma Wilson in Austin (5). A useful accident for the dry run: row 4 is one of the two inactive accounts, so the mapping review will also see how the flag travels into the CRM. The habit worth keeping: when a stakeholder says 'just a few rows to check', the row cap is the honest tool — the file is small because the ask said so, not because the query got tired.",
  },
  {
    id: "cs-012",
    topic: "l1",
    universe: "supplier",
    title: "How many partners call the EU home",
    brief:
      "From: Supply-chain lead. Re: dual-sourcing review.\n\nProcurement wants to know how concentrated our vendor base is by region, starting with Europe: the count of partners on the master file whose home region is EU. A number for the slide — and if it comes back thin, the dual-sourcing conversation starts and ends with Europe.",
    ask: "The count of suppliers whose region is EU.",
    template: `SELECT {1}(*)
FROM {2}
WHERE {3} = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "A vendor tally is COUNT(*) — the star counts rows regardless of what columns exist. SUM before the asterisk isn't a tally at all; the query dies parsing it.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the vendor register",
        why: "Home regions of vendors live in suppliers — the same filter against products fails because the catalog has no region column to look at.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the home-region column",
        why: "The register records each partner's home in region — filtering on name would look for a vendor literally named EU and count zero.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region label",
        why: "Europe's label on the file is the text 'EU', quotes included — 'US' and 'LATAM' are other regions and would each report one partner, underselling the European base.",
      },
    ],
    distractors: ["SUM", "products", "customers", "'US'", "'LATAM'", "name"],
    walkthrough:
      "Concentration questions start as counts: how many partners call the EU home. The vendor register stamps a home region on every card, so the query counts vendor cards stamped 'EU'. The number is 2 — Nordic Gadgets AB and Alpine Audio GmbH — against four partners elsewhere on the file (two in APAC, one in the US, one in LATAM). That's the slide: a third of the vendor base sits in Europe, and both EU cards happen to be strong, rated 4.6 and 4.8. Note the trap the query sidesteps: the label on the file is 'EU', not 'Europe' — region codes match exactly or not at all.",
  },
  {
    id: "cs-013",
    topic: "l1",
    universe: "expense",
    title: "The voucher's receipt lines",
    brief:
      "From: Ops finance spend owner. Re: voucher 6 audit.\n\nVoucher 6 is up in this week's sample and I want its receipt lines exactly as booked — every line on the voucher, all fields, in booking order. I'll tie each line to the card statement myself; I just need the stored rows, not a summary of them.",
    ask: "Every stored receipt line, all columns, for voucher number 6.",
    template: `SELECT {1}
FROM {2}
WHERE order_id = {3};`,
    slots: [
      {
        answer: "*",
        kind: "keyword",
        label: "the all-columns chip",
        why: "'Exactly as booked, all fields' is the star: * returns every column of every line. Naming a single column like id would hand the audit a one-field stub instead of the full line.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the receipt-lines ledger",
        why: "The lines under a voucher live in order_items — orders holds one row per voucher and would return the voucher header, not its lines.",
      },
      {
        answer: "6",
        kind: "number",
        label: "the voucher number",
        why: "The sample picked voucher 6, so the filter is order_id = 6 — voucher 1's lines would audit a different card receipt entirely.",
      },
    ],
    distractors: ["orders", "products", "id", "order_id", "1", "83"],
    walkthrough:
      "Voucher audits are line-by-line, so the pull takes every stored field of every line under voucher 6. Four lines come back: line 14, item 5 at 119.17 a unit, three of them; line 15, item 1 at 89.58, three; line 16, item 11 at 26.03, one; line 17, item 2 at 33.56, three. In catalog terms: three Studio Desktop Mics, three Mechanical Keyboards, one Desk Mat, three Wireless Mice — Bruno Silva's voucher, delivered 2024-01-01. The lines sum to 752.96, which matches the voucher total, so this one's clean. The analyst habit: pull the lines raw and tie them to the statement yourself — a pre-summarized voucher is exactly where a double-booked line hides.",
  },
  {
    id: "cs-014",
    topic: "l1",
    universe: "catalog",
    title: "Which shelf is the studio mic on",
    brief:
      "From: Catalog content manager. Re: listing QA ticket #218.\n\nQA found the Studio Desktop Mic live on the site without its shelf label — the category field never made it into the page template. Send me its registered shelf, pulled straight from the catalog by registry number 5, so the listing fix uses the stored value and not what anyone remembers.",
    ask: "The name and registered category of the product whose id is 5.",
    template: `SELECT name, {1}
FROM {2}
WHERE {3} = {4};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf column",
        why: "The missing field is the shelf label, stored in category — price would 'fix' the listing by displaying 119 where its shelf belongs.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog source",
        why: "Shelf labels are catalog data, so products — suppliers has no category column at all and the query would die before answering the ticket.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the registry column",
        why: "QA cited registry number 5, and the registry is the id column — filtering on category would return every Audio item, not the one listing in the ticket.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the registry number",
        why: "Registry 5 is the Studio Desktop Mic — registry 6 would QA the Bluetooth Speaker instead and the ticket would close on the wrong item.",
      },
    ],
    distractors: ["price", "stock", "suppliers", "orders", "6", "4"],
    walkthrough:
      "Listing QA is a stored-value lookup: registry number in, registered shelf out. The mic is registry 5, so the catalog filtered on id = 5, pulling name and category. The stored shelf comes back Audio — that's the exact string the page template was missing. Two fields the ticket didn't ask for but worth having in your pocket: the same row carries a list price of 119 and 45 units on hand, so the team can sanity-check the fix against the shelf they see. And the habit: pull labels by registry number, never by product name — names get retyped in tickets, registry numbers don't.",
  },
  {
    id: "cs-015",
    topic: "l1",
    universe: "month-close",
    title: "One account's booking register",
    brief:
      "From: Financial Controller. Re: AR tie-out, account sample.\n\nFor the receivables tie-out I'm sampling one account and need its complete booking register: each booking number with its recorded amount, nothing aggregated, nothing rearranged. If the register and the account statement disagree line by line, I want to see exactly where.",
    ask: "Id and total for every booking belonging to customer number 5.",
    template: `SELECT id, {1}
FROM {2}
WHERE customer_id = {3};`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the amount column",
        why: "The tie-out compares recorded amounts, which live in total — status would list fulfillment states where money figures belong and the tie-out would stall.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the booking ledger",
        why: "Bookings and their amounts live in orders — customers holds the account cards (names, cities, flags) but carries no booking amounts to tie out.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the account number",
        why: "The sample account is number 5 — Emma Wilson's account. Account 1 would return twenty-four bookings and tie out a different customer's statement.",
      },
    ],
    distractors: ["status", "customer_id", "products", "customers", "13", "1"],
    walkthrough:
      "The tie-out is line-by-line, so no aggregation: every booking row for account 5 with its stored amount. Seventeen bookings come back, opening with booking 5 at 725.34 and closing with booking 97 at 585.79; the largest is 845.92 (booking 39) and the smallest 30.24 (booking 72). Two anchors make the tie-out fast: the register's first entry (booking 5, 725.34) should match the account statement's opening line to the cent, and seventeen is the count the statement should show. A quiet lesson in the shape: the filter is on the account number because that's the stamp the booking ledger carries — the account register holds the name, the ledger holds the stamp.",
  },
];
