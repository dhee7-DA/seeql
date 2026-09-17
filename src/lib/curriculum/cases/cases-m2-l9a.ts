// Case batch M2-L9a — topic l9 (First joins), ids cs-301…cs-318.
// First two-table reunions: orders⋈customers and products⋈suppliers with
// plain WHERE filters. Every figure is audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L9a: CaseStudy[] = [
  {
    id: "cs-301",
    tier: "easy",
    topic: "l9",
    universe: "month-close",
    title: "The biggest open item on the books",
    brief:
      "From: Controller. Re: month-end close, open items schedule.\n\nThe close binder opens with the open-items schedule and the lead line is the single biggest booking still sitting in pending. I want that line with the account holder's name attached — booking number, who owns it, and the amount — so the schedule can carry a name instead of a bare number when the auditors ask.",
    ask: "The booking id, the account holder's name and the total for booking 74 — one row.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.id = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Each booking carries a customer_id that points at the account register — that's the thread to pull. The booking's own id here would try to match booking numbers against account numbers and pair up sixteen fake matches.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The account register numbers its rows in id — the pointer on the booking side must land on this column. The register has no customer_id column of its own, so guessing that name breaks the query outright.",
      },
      {
        answer: "74",
        kind: "number",
        label: "the booking number",
        why: "The open-items schedule cites booking 74 — the ledger's largest ticket at 1,088.44. Booking 75 is a different account's line entirely and would put the wrong booking in front of the auditors.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "75", "c.name"],
    walkthrough:
      "The close binder wants the biggest open item with a name on it. Two registers hold the pieces: the booking ledger has the amount, the account register has the name, and customer_id is the thread between them — so the reunion condition is o.customer_id = c.id, filtered to booking 74. The line that comes back: booking 74, Farid Nasser, 1,088.44. That's the largest single booking on the entire ledger, and it's still pending — which is exactly why it leads the open-items schedule rather than the collected-revenue section. When the close is challenged, the name attached to the number is what turns 'a big pending ticket' into 'Farid Nasser's 1,088.44, awaiting fulfillment'.",
  },
  {
    id: "cs-302",
    tier: "easy",
    topic: "l9",
    universe: "refund-audit",
    title: "Whose name goes on the 397.99 refund",
    brief:
      "From: refunds@ — internal ticket #4419. Re: goodwill ledger sign-off.\n\nFinance signed off the cancellation queue and the wrap-up thread keeps quoting one figure: a cancelled booking worth 397.99. Before the ledger note goes out I need the account holder's name attached to that booking, exactly as the register spells it — the note gets countersigned against this record.",
    ask: "The account holder's name, plus the booking id and total, for booking 83.",
    template: `SELECT o.id, {1}, o.total
FROM orders o
JOIN customers {2} ON o.customer_id = c.id
WHERE o.id = {3};`,
    slots: [
      {
        answer: "c.name",
        kind: "keyword",
        label: "the account holder column",
        why: "The refund note needs a person, and names live in the name column of the account register — pulling city instead would put 'Nagoya' where the countersignature belongs.",
      },
      {
        answer: "c",
        kind: "keyword",
        label: "the register's alias",
        why: "The register is aliased c in this reunion, so its columns are reached as c.name. Writing s.name would reach for an alias that was never declared and the query dies before it prints anything.",
      },
      {
        answer: "83",
        kind: "number",
        label: "the booking number",
        why: "The thread quotes the cancelled booking at 397.99 — that's booking 83. Booking 82 is Emma Wilson's 143.86 ticket and would attach the wrong account to the ledger note.",
      },
    ],
    distractors: ["c.city", "s", "82", "o.name"],
    walkthrough:
      "A refund note needs three facts tied together: the booking, the amount, and above all the name. The booking ledger and the account register are separate files, so the query reunites them on customer_id = c.id under the alias c, then narrows to booking 83. What comes back: booking 83, Keiko Sato, 397.99, cancelled. Two things worth flagging when the note is countersigned. First, Keiko's account is flagged inactive — the refund still goes out, but it closes the last open ticket on a closed account. Second, her file shows four bookings totalling 1,098.60, and this 397.99 is the largest of them: the goodwill sign-off is writing off the single biggest line on a dormant account, which is precisely the kind of line auditors re-read.",
  },
  {
    id: "cs-303",
    tier: "easy",
    topic: "l9",
    universe: "pricing",
    title: "The Wearables shelf, with vendors attached",
    brief:
      "From: Head of Product. Re: pricing review, vendor concentration.\n\nBefore we talk increases I want the Wearables shelf with the vendor behind each item: product name, vendor name, and the list price as registered. If both wearables trace back to the same vendor, that's a concentration risk the review needs to hear about — and I'd rather see it on the record than hear it as an anecdote.",
    ask: "Product name, vendor name and list price for every product in the Wearables category.",
    template: `SELECT p.name, s.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE {3} = 'Wearables';`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Every catalog row carries a supplier_id pointing at the vendor file — that's the join thread. The product's own id would try to match product numbers against vendor numbers and fabricate six pairs.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id, and the pointer must land there. Vendors have no supplier_id column of their own, so writing that name breaks the query before it lists anything.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the shelf column",
        why: "Shelves are labeled in the category column of the catalog — filtering on the vendor file's columns here would hunt for a shelf label that lives in the wrong register entirely.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "'Wearables'", "s.category"],
    walkthrough:
      "The ask is a shelf list with provenance: two files, one thread. The catalog's supplier_id lands on the vendor file's id, the shelf filter keeps Wearables, and two rows come back: Fitness Band X2 at 79 from Andes Naturals SA, and Smart Watch S at 199.99 from Nordic Gadgets AB. Two different vendors — so no concentration risk on this shelf, and the review can say so on the record. The second row carries extra weight: 199.99 is the highest list price in the whole catalog, so the premium anchor we open the pricing story with is sourced from the EU's Nordic Gadgets. Knowing which vendor owns the ceiling price is exactly the kind of fact that redirects a pricing conversation.",
  },
  {
    id: "cs-304",
    tier: "easy",
    topic: "l9",
    universe: "inventory",
    title: "Headset shelf card, vendor included",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: aisle recount pack.\n\nThe headset bin is on tomorrow's recount list and the pack wants the system's card with the vendor attached — the crew needs to know who to call when a count comes up short. Catalog item 4, please: name, on-hand figure, and the vendor we source it from.",
    ask: "Product name, stock and vendor name for catalog item 4 — one shelf card.",
    template: `SELECT p.name, p.stock, s.name
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.id = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The card needs the vendor, and the catalog points at the vendor file through supplier_id. Matching the product's own id against vendor numbers would invent pairs and put the wrong vendor on the card.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file's rows are numbered in id — that's where the pointer lands. There is no stock column on the vendor file at all, so joining on stock fails before the card prints.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the catalog item number",
        why: "The recount pack cites item 4 — the Noise-Canceling Headset at 60 on hand. Item 5 is the Studio Desktop Mic, a different bin, and the crew would count the wrong shelf.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "5", "'Audio'"],
    walkthrough:
      "One shelf card, three fields, two files. The catalog holds the item and its count; the vendor file holds who to call; supplier_id = s.id is the thread. Filter to item 4 and the card reads: Noise-Canceling Headset, 60 on hand, Midwest Hardware Co. Two facts the crew should hear with it. First, 60 units is the third-thinnest shelf in the whole building — only the Smart Watch (40) and the Studio Mic (45) sit lower — so if the recount lands under 60 this bin jumps the restock queue. Second, the vendor is the US's Midwest Hardware Co at a 4.4 rating, so a shortfall is a domestic reorder, not an overseas lead time. That distinction changes who gets the phone call the morning the count comes up short.",
  },
  {
    id: "cs-305",
    tier: "easy",
    topic: "l9",
    universe: "funnel",
    title: "Everything Berlin has ever booked",
    brief:
      "From: Growth marketing lead. Re: city-level account review.\n\nWe're weighting the next campaign by city and Berlin keeps coming up in the room. Before anyone commits budget I want the full booking history out of that city — every booking number and amount the Berlin accounts have ever placed — so the spend conversation starts from the record instead of a hunch.",
    ask: "Every booking id and total from accounts in the city of Berlin.",
    template: `SELECT o.id, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE {3} = 'Berlin';`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Bookings point at accounts through customer_id — that's the reunion thread. Matching booking ids against account ids would fabricate sixteen fake pairs and pollute the city's history.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The account register numbers its rows in id, and the pointer lands there. The register has no customer_id column of its own, so that guess errors out before any rows return.",
      },
      {
        answer: "c.city",
        kind: "keyword",
        label: "the city column",
        why: "The ask is city-level, and city lives on the account register — filtering there is what keeps the list to Berlin. Region would cast a continent-wide net and drag in eight cities' worth of bookings.",
      },
    ],
    distractors: ["o.id", "'Hamburg'", "c.region", "c.customer_id"],
    walkthrough:
      "City-level history means one filter on the account side and a reunion to the booking ledger: c.city = 'Berlin', joined through customer_id = c.id. Twenty-four rows come back — every one of them Alice Chen, because Berlin has exactly one account and she uses it heavily. That single name reframes the budget conversation: Berlin's entire history is one power user with 24 bookings worth 7,262.35, the second-highest spend on the whole file, rather than a broad base of small accounts. If she churns, the 'Berlin number' goes to zero overnight. Worth saying plainly in the room: a city that looks like a market can actually be a person, and the reunion query is how you catch that before the budget does.",
  },
  {
    id: "cs-306",
    tier: "easy",
    topic: "l9",
    universe: "supplier",
    title: "What Alpine Audio actually sells us",
    brief:
      "From: Supply-chain lead. Re: QBR pack, vendor section.\n\nThe Alpine Audio page of the QBR pack is thin — I want the items we actually buy from them, with list prices, straight off the catalog. Exact vendor name as registered, no paraphrasing: if the pack shows their full catalog footprint, procurement can argue volume from it.",
    ask: "Product name and list price for every product sourced from Alpine Audio GmbH.",
    template: `SELECT p.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.name = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The catalog records who sells each item in supplier_id — the thread to the vendor file. The product's own id would match product numbers against vendor numbers and invent six pairs.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "Vendor rows are numbered in id, and the pointer must land there. The vendor file carries no supplier_id column, so that spelling errors out before the QBR page fills.",
      },
      {
        answer: "'Alpine Audio GmbH'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The vendor is registered as the exact text 'Alpine Audio GmbH', quotes included — a truncated 'Alpine Audio' matches nothing and the QBR page would print empty.",
      },
    ],
    distractors: ["p.id", "s.rating", "'Alpine Audio'", "'Midwest Hardware Co'"],
    walkthrough:
      "Vendor pages need the vendor's own words: s.name = 'Alpine Audio GmbH', matched character for character, with the catalog joined through supplier_id = s.id. Two items come back: Studio Desktop Mic at 119 and Desk Mat Extended at 24.99. So Alpine's footprint with us is one premium audio line and one desk accessory — two SKUs, spread across price tiers. Context that strengthens the volume argument: Alpine holds the best vendor rating on the file at 4.8, and their Studio Mic has run up 3,589.61 in lifetime line revenue across 16 sales lines. A two-item vendor with that scorecard is exactly the kind procurement wants to grow — the QBR page now shows both the footprint and the headroom.",
  },
  {
    id: "cs-307",
    tier: "medium",
    topic: "l9",
    universe: "expense",
    title: "US bookings that have left the building",
    brief:
      "From: Ops finance, spend review. Re: regional fulfillment audit.\n\nThe US line of the fulfillment audit needs its in-transit slice: every booking from a US account that has shipped but not yet landed. Names attached, amounts attached — I want to see which account is carrying the most in-flight value before we book next month's estimates.",
    ask: "Booking id, account name and total for every shipped booking belonging to US-region accounts.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE {3} = 'US' AND o.status = {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The audit reunites bookings with accounts through customer_id — anything else pairs the wrong rows. The booking's own id would match against account numbers and fake up sixteen phantom pairs.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The account register's rows are numbered in id, and the pointer lands there. Guessing customer_id on the register side errors immediately — that column exists on the booking ledger, not here.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the region column",
        why: "US is a region value on the account register, so the filter is c.region = 'US'. City would hunt for a city literally named US and return nothing but an empty audit line.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "In-transit means the exact text 'shipped' — lowercase, quoted. 'delivered' would report bookings that already landed and double-count them as in-flight.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'EU'", "'delivered'"],
    walkthrough:
      "The in-flight slice is two filters stacked on a reunion: region on the account side, status on the booking side, joined through customer_id = c.id. Ten rows come back — the whole US in-transit book. Reading down it, Emma Wilson carries most of the weight: her 845.92 and 785.79 bookings are both shipped, and Jamal Wright's 403.72 is the other name on the list. That's the shape the audit line needs: a region of two accounts where one account dominates the in-flight value. For the estimates memo it means US next-month revenue is effectively a bet on Emma's tickets landing — worth one sentence of risk language the region's bare count would never justify.",
  },
  {
    id: "cs-308",
    tier: "medium",
    topic: "l9",
    universe: "growth",
    title: "APAC's delivered track record",
    brief:
      "From: Chief of Staff. Re: board deck, regional slide.\n\nThe regional slide needs APAC's proven track record, not its pipeline: bookings from APAC accounts that actually completed — delivered, money landed. Booking ids, account names, amounts. If the region's completed base is thin, I want to know before the deck says otherwise.",
    ask: "Booking id, account name and total for every delivered booking from APAC-region accounts.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE {3} = 'APAC' AND o.status = {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Region lives on the account register, bookings live on the ledger, and customer_id is the only thread between them. The booking's own id would fabricate sixteen fake pairs and poison the slide's count.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. There is no customer_id on the register itself — writing it breaks the query before the slide's numbers exist.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "The region is the quoted text 'APAC' — case-sensitive and exact. 'EU' would build the regional slide out of the wrong continent and the deck would misstate the base.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "Proven track record means 'delivered' only — quoted and lowercase. 'pending' would pad the slide with bookings that haven't closed and flatter a region the numbers don't support.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'EU'", "'pending'"],
    walkthrough:
      "The board slide wants the completed base: 'delivered' on the booking side, 'APAC' on the account side, one reunion through customer_id = c.id. Twenty-one rows come back out of the region's 37 total bookings — so more than half the APAC book has actually closed, which is a defensible track-record line. The top of the completed pile: Grace Kim's 625.14 and Maya Patel's 611.87, with Hiro Tanaka's 450.12 behind them. That's the sentence for the deck: APAC's delivered base is 21 completed bookings across five accounts, led by Seoul and Mumbai. What the slide should not claim is depth — two accounts carry the top of the pile, and the next tier drops fast.",
  },
  {
    id: "cs-309",
    tier: "medium",
    topic: "l9",
    universe: "fraud",
    title: "The one live ticket on Grace Kim's file",
    brief:
      "From: Risk team, spot-check rotation. Re: open-exposure list.\n\nThe rotation works down the open-exposure list account by account, and Seoul is next. I need Grace Kim's bookings that are still pending — booking number, status, amount, exactly as stored. If there's exactly one live ticket, say so with the record to prove it.",
    ask: "Booking id, status and total for every pending booking on Grace Kim's account.",
    template: `SELECT o.id, o.status, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3} AND o.status = {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The exposure list needs the account's bookings, and customer_id is the pointer from each booking to its account. The booking's own id against account ids would invent a sixteen-row exposure that doesn't exist.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling fails before the exposure count exists.",
      },
      {
        answer: "'Grace Kim'",
        kind: "keyword",
        label: "the account name",
        why: "The rotation sheet names the account — the exact text 'Grace Kim', quoted. 'Keiko Sato' would audit a different person's file and put the wrong region's exposure on the sheet.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the live-ticket status",
        why: "Open exposure means 'pending' — quoted, lowercase. 'shipped' would list tickets already in transit and overstate the live risk the rotation is staffing for.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Keiko Sato'", "'shipped'"],
    walkthrough:
      "Open exposure is a status filter on an account slice: 'pending' bookings where the account is 'Grace Kim', reunited through customer_id = c.id. Exactly one row comes back: booking 75, pending, 273.64. That's the whole live exposure on Seoul's biggest account — one ticket, under 300, nothing aging. The context that matters for the rotation sheet: Grace's file holds 14 bookings worth 4,574.23, so 273.64 pending means roughly 94% of her history has already closed. A heavy account with a single small live ticket is the definition of a clean stop on the list — the reviewer signs it off in one line and moves to the next region.",
  },
  {
    id: "cs-310",
    tier: "medium",
    topic: "l9",
    universe: "catalog",
    title: "Electronics sourced from APAC vendors",
    brief:
      "From: Catalog content manager. Re: sourcing labels, electronics shelf.\n\nCompliance wants sourcing labels on the electronics shelf, and the first pass is APAC-sourced items only: product name, vendor name, and the stock figure so the label run can prioritize by shelf depth. Nothing computed — the labels must quote the registers exactly.",
    ask: "Product name, vendor name and stock for every Electronics product sourced from an APAC-region vendor.",
    template: `SELECT p.name, s.name, p.stock
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.region = {3} AND p.category = {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Sourcing comes from the catalog's supplier_id pointer to the vendor file. The product's own id against vendor ids would fabricate pairs and put the wrong region on compliance labels.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file's rows are numbered in id — where the pointer lands. Vendors carry no supplier_id column, so that guess breaks the query before a single label prints.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the vendor region",
        why: "The label pass is APAC-sourced only: the quoted text 'APAC' on the vendor's region. 'EU' would run labels for European-sourced gear and fail the compliance pass.",
      },
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the shelf label",
        why: "The shelf is the quoted text 'Electronics', matched exactly. 'Audio' would label headphones and mics as electronics sourcing — a different shelf entirely.",
      },
    ],
    distractors: ["s.supplier_id", "'EU'", "'Audio'"],
    walkthrough:
      "Sourcing labels need both registers: the catalog's supplier_id joined to the vendor file's id, then two exact-match filters — vendor region 'APAC', shelf 'Electronics'. Two rows come back: Wireless Mouse M3 from Shenzhen Electro with 300 on the shelf, and USB-C Hub 7-in-1 from Pacific Textiles with 85. So the electronics shelf's APAC story is two vendors, two items, and a 300-versus-85 split in shelf depth. That split sets the label priority: the Mouse bin is the deep one, the Hub bin is thin enough that a stock-out would outlive the label run. Compliance gets a two-line answer with named vendors — exactly what the sourcing label audit asks for.",
  },
  {
    id: "cs-311",
    tier: "medium",
    topic: "l9",
    universe: "month-close",
    title: "Pending bookings worth real money",
    brief:
      "From: Controller. Re: month-end close, receivables memo.\n\nThe receivables memo ignores small pending tickets — under 500 they're noise. I want the pending lines that actually matter: booking number, account name, amount. If the meaningful pending book is a handful of lines, the memo says so with the names attached.",
    ask: "Booking id, account name and total for every pending booking with a total above 500.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3} AND o.total > {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The memo attaches names to bookings, and customer_id is the pointer that does it. The booking's own id against account ids would fabricate pairs and invent receivables that don't exist.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that spelling errors before the memo has numbers.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Receivables in flight means the quoted text 'pending'. 'shipped' would count tickets already in transit as receivables and overstate the open book.",
      },
      {
        answer: "500",
        kind: "number",
        noVerify: true,
        label: "the materiality line",
        why: "The memo's materiality line is 500 — under that, pending tickets are noise. A line at 600 would drop real receivables off the memo; the threshold belongs in the filter, not the narrative.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'shipped'", "600"],
    walkthrough:
      "The receivables memo is a materiality filter on an open pile: 'pending', above 500, names attached through customer_id = c.id. Five rows clear the bar. The top of the book is no surprise — booking 74, Farid Nasser, 1,088.44 — and behind it Chloe Dubois's 945.21, Emma Wilson's 725.34, her 585.79, and one more line just over the line. So the meaningful pending book is five tickets, two of them Emma's, led by a booking worth more than the next two combined. That's the memo's whole argument: the close's open exposure is concentrated in a handful of named lines, and 'pending' here means awaiting fulfillment, not awaiting payment — the cash conversation follows the shipment, so these five dates are the ones to chase.",
  },
  {
    id: "cs-312",
    tier: "medium",
    topic: "l9",
    universe: "refund-audit",
    title: "The cancellation queue over 100, with cities",
    brief:
      "From: refunds@ — weekly queue review. Re: city breakdown for the escalation call.\n\nThe escalation call wants the cancellation queue's meaningful lines — cancelled bookings above 100 — with the account's city attached so support can see which metros keep cancelling. Booking id, account name, city, amount. The small stuff stays off the call.",
    ask: "Booking id, account name, city and total for every cancelled booking with a total above 100.",
    template: `SELECT o.id, c.name, {1}, o.total
FROM orders o
JOIN customers c ON {2} = {3}
WHERE o.status = {4} AND o.total > 100;`,
    slots: [
      {
        answer: "c.city",
        kind: "keyword",
        label: "the city column",
        why: "The call wants metros, and city lives on the account register — region would collapse Lyon, Milan and Cork into one blob and hide the metro pattern entirely.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Cities live on accounts, so each booking must be reunited through customer_id. The booking's own id against account ids would fabricate pairs and invent cancellations nobody made.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that spelling errors out and the call runs on nothing.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is defined by the exact text 'cancelled', quoted and lowercase. 'pending' would read the open pile instead of the cancellation queue and derail the call.",
      },
    ],
    distractors: ["c.region", "o.id", "c.customer_id", "'pending'"],
    walkthrough:
      "The escalation slice: 'cancelled' bookings above 100, cities attached through customer_id = c.id. Five lines make the call. Keiko Sato's 397.99 leads it, then Alice Chen's 206.19, Alice again at 152.52, Emma Wilson's 143.86, and Alice a third time at 136.11. Two metros, one name three times. So the story for the escalation call isn't geographic at all — it's one Cork account cancelling repeatedly in the low hundreds, plus the single big Nagoya cancellation the goodwill ledger already knows. Below the line sit Maya Patel's two small cancellations at 90.35 and 25.47, which is why the 100 cutoff exists: it keeps the call on patterns, not noise.",
  },
  {
    id: "cs-313",
    tier: "hard",
    topic: "l9",
    universe: "pricing",
    title: "The audio shelf's premium end, vendor-attached",
    brief:
      "From: Head of Product. Re: pricing reset, audio section.\n\nThe audio section of the reset opens with the premium end: the two priciest items on the audio shelf, priciest first, with the vendor behind each one. Two slots only on the slide — if the cut is wrong the whole section misfires, so the ranking has to come off the record.",
    ask: "Product name, vendor name and price for the 2 most expensive Audio products, priciest first.",
    template: `SELECT p.name, s.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.category = {3}
ORDER BY p.price {4}
LIMIT {5};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Vendors join through the catalog's supplier_id pointer to the vendor file's id. The product's own id would pair product numbers with vendor numbers and put a fiction on the slide.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors have no supplier_id of their own — that guess errors before the section exists.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf label",
        why: "The section is the quoted text 'Audio', exact and case-sensitive. 'Video' would put a webcam where a headset belongs and the premium story breaks.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Priciest first is descending. ASC would open the slide with the 59.99 Bluetooth Speaker — the bargain bin — and flip the section's whole narrative.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the slide's slot count",
        why: "The slide holds exactly two anchor slots, so the cut is 2 — one more and the third item dilutes the premium story; one fewer and the section is a single data point.",
      },
    ],
    distractors: ["s.supplier_id", "'Video'", "ASC", "3"],
    walkthrough:
      "The premium cut is a sort and a slice on a reunion: audio shelf, ranked by price descending, cut at two. The rows that land: Noise-Canceling Headset at 149.99 from Midwest Hardware Co, then Studio Desktop Mic at 119 from Alpine Audio GmbH. Both are US-and-EU sourced, both are the top of their vendor's range, and the third audio item — the Bluetooth Speaker Mini at 59.99 — falls off the slide by ninety dollars, so the cut is clean, not a coin flip. That's the section: two vendors, two price points, a 30-dollar gap between them. The direction is the whole ballgame — ascending would have anchored the section on the speaker and told the room audio is a budget shelf, which the record flatly contradicts.",
  },
  {
    id: "cs-314",
    tier: "hard",
    topic: "l9",
    universe: "inventory",
    title: "The thinnest APAC shelves",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: replenishment focus list.\n\nThe Friday run needs a focus list: among items sourced from APAC vendors, the three thinnest shelves, thinnest first, with the vendor named so purchasing knows who the buy order goes to. Three lines only — the run can't absorb more.",
    ask: "Product name, stock and vendor name for the 3 lowest-stock products from APAC-region vendors, thinnest first.",
    template: `SELECT p.name, p.stock, s.name
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.region = {3}
ORDER BY p.stock {4}
LIMIT {5};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The focus list names vendors, and the catalog reaches them through supplier_id. The product's own id against vendor ids would invent pairs and put the wrong vendor on a buy order.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "Vendor rows are numbered in id — the pointer's landing column. There is no supplier_id on the vendor file itself, so that guess errors before the list prints.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the vendor region",
        why: "The run is scoped to APAC-sourced items: the quoted text 'APAC' on the vendor's region. 'EU' would build the focus list from European shelves and send the buy orders to the wrong vendors.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Thinnest first is ascending — smallest stock on top. DESC would lead the list with the 500-unit HDMI cable, the fullest shelf in the building, as the top replenishment need.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the focus-list size",
        why: "The run absorbs three focus lines, so the cut is 3 — five would flood the run, two would leave a thin APAC shelf off the buy list for another week.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "'EU'", "DESC", "5"],
    walkthrough:
      "A focus list is a filter, a sort, and a slice: APAC vendors only, ranked thinnest first, cut at three. The lines that land: USB-C Hub 7-in-1 at 85 units from Pacific Textiles, Cycling Jersey Pro at 110 from Pacific Textiles, Ring Light 14-inch at 150 from Shenzhen Electro. Both APAC vendors appear, Pacific twice — so Friday's buy orders concentrate on one vendor relationship. The direction flip is the trap worth naming: descending would have topped the list with the HDMI cable's 500 units, the single deepest shelf in the catalog, and purchasing would have bought hardest where stock is safest. The slice matters too — the fourth APAC shelf (Wireless Mouse at 300) is healthy, so the cut at three is where the run stops making sense.",
  },
  {
    id: "cs-315",
    tier: "hard",
    topic: "l9",
    universe: "funnel",
    title: "EU's in-transit big five",
    brief:
      "From: Growth marketing lead. Re: EU win-back targeting.\n\nThe win-back pilot targets accounts with money currently in flight — EU accounts with shipped bookings, five biggest tickets first. Booking id, account name, amount. Five names on the target sheet, no more: the pilot's budget is fixed and the sheet must match it.",
    ask: "Booking id, account name and total for the 5 largest shipped bookings from EU-region accounts, biggest first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.region = {3} AND o.status = {4}
ORDER BY o.total {5}
LIMIT {6};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The target sheet needs names, and bookings reach accounts only through customer_id. The booking's own id against account ids would fabricate sixteen pairs and put fictional targets on the sheet.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — where the pointer lands. There is no customer_id on the register itself, so that spelling errors before the sheet exists.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "The pilot is EU-only: the quoted text 'EU' on the account's region. 'APAC' would seed the pilot with Dubai-to-Seoul accounts the budget never covered.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "Money in flight means the quoted text 'shipped'. 'delivered' would target bookings that already landed — the win-back would call people about parcels they already have.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest tickets first is descending. ASC would seed the pilot with the five smallest EU shipments — maximum names, minimum money in flight.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the target-sheet size",
        why: "The pilot's budget fixes the sheet at five targets, so the cut is 5. Three underfills the budget; eight breaks it and the sheet stops matching finance's number.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'APAC'", "'delivered'", "ASC", "3"],
    walkthrough:
      "The target sheet is a two-filter reunion with a ranked cut: EU accounts, shipped status, ordered biggest-first, sliced at five. The five that land: booking 3, Alice Chen, 767.64; booking 20, Liam O'Brien, 705.39; then Alice again at 684.53, 645.91 and 633.91. Read that back before the pilot launches: four of the five in-flight targets are one Berlin account. The EU win-back isn't a five-person campaign — it's Alice Chen's in-flight book plus one Cork ticket. That's exactly the kind of discovery the ranked slice exists to force: an unranked list of twelve EU shipments would have hidden the concentration, and the pilot would have been budgeted as a broad campaign when it's really an account plan.",
  },
  {
    id: "cs-316",
    tier: "hard",
    topic: "l9",
    universe: "supplier",
    title: "Nordic's premium lines, ranked",
    brief:
      "From: Supply-chain lead. Re: QBR pack, Nordic Gadgets section.\n\nThe Nordic Gadgets page leads with their premium lines: the items we buy at over 100 list price, priciest first, with their vendor scorecard rating beside each. The rating has to sit on the same row so the page argues quality and spend together.",
    ask: "Product name, price and vendor rating for Nordic Gadgets AB products priced above 100, priciest first.",
    template: `SELECT p.name, p.price, s.rating
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.name = {3} AND p.price > {4}
ORDER BY p.price {5};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The QBR page needs the vendor's rating beside each product, and the catalog reaches the vendor file only through supplier_id. The product's own id would pair with vendor numbers and print invented rows.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id of their own — that guess breaks the query and the page stays empty.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The section is the exact registered text 'Nordic Gadgets AB', quoted. A truncated 'Nordic Gadgets' matches nothing and the QBR page prints blank.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium price line",
        why: "The section's definition of premium is above 100 — items at or under that line belong on a different page. The threshold is the filter's job, not a figure the page prints.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Priciest first is descending, leading the page with the strongest line. ASC would open the QBR section with the cheaper item and bury the headline.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "'Nordic Gadgets'", "ASC", "50"],
    walkthrough:
      "The QBR page is a vendor slice with a price bar and a rank: Nordic Gadgets AB, above 100, priciest first, rating attached. Two rows clear the bar: Smart Watch S at 199.99 and 4K Webcam Pro at 129, both carrying Nordic's 4.6 scorecard rating. So Nordic's premium story is two lines spanning a 70-dollar gap, and the vendor's rating sits beside both — quality and spend on one row, exactly how the page argues. Below the bar sits the Mechanical Keyboard K1 at 89.99: a solid line, but the section's definition puts it on the volume page instead. The direction flip is the quiet trap — ascending would lead with the webcam and let the 199.99 anchor, the single most expensive item in the whole catalog, arrive as an afterthought.",
  },
  {
    id: "cs-317",
    tier: "hard",
    topic: "l9",
    universe: "expense",
    title: "Emma Wilson's three biggest tickets",
    brief:
      "From: Ops finance, spend review. Re: account concentration memo.\n\nThe concentration memo profiles the file's second-biggest spender: Emma Wilson's three largest bookings, biggest first, with each ticket's fulfillment state beside it. Three lines only — the memo quotes the podium and moves on.",
    ask: "Booking id, total and status for Emma Wilson's 3 largest bookings, biggest first.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3}
ORDER BY o.total {4}
LIMIT {5};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The profile gathers one account's bookings, and customer_id is the pointer from each booking to its account. The booking's own id against account ids would fabricate sixteen fake bookings for the memo.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling fails before the podium exists.",
      },
      {
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the account name",
        why: "The memo profiles the exact registered text 'Emma Wilson', quoted. 'Emily Wilson' is nobody on the file — the query would return an empty memo.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending. ASC would profile her three smallest tickets and the concentration memo would understate her weight on the file.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The memo quotes a podium of three, so the cut is 3. Ten lines is a ledger, not a profile — and the memo's format has exactly three slots.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Emily Wilson'", "ASC", "10"],
    walkthrough:
      "The profile is a name filter with a ranked cut: Emma Wilson's bookings, ordered biggest-first, sliced at three. The podium: booking 39 at 845.92 (shipped), booking 57 at 785.79 (shipped), booking 5 at 725.34 (pending). Three tickets, all over 700, stacked within 120 dollars of each other — that's a consistent high-value buyer, not one lucky order. The status column earns its place: two of the three are in flight, so Emma's concentration isn't just historical, it's live exposure right now. Context for the memo's framing line: her file totals 6,640.56 across 17 bookings, second only to Alice Chen, and these three tickets alone are about a third of it. The direction flip is the failure mode — ascending would profile three small tickets and miss the concentration entirely.",
  },
  {
    id: "cs-318",
    tier: "hard",
    topic: "l9",
    universe: "growth",
    title: "The Dubai account, ranked",
    brief:
      "From: Chief of Staff. Re: board deck, account spotlight.\n\nThe deck spotlights the Dubai account — the one behind the ledger's single biggest ticket. Pull its full booking history ranked by value, biggest first: booking id, amount, and where each sits in fulfillment. Three lines expected; the spotlight's narrative depends on the shape of that list.",
    ask: "Booking id, total and status for every booking from the city of Dubai, biggest total first.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.city = {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The spotlight gathers one city's bookings, and bookings reach the account register only through customer_id. The booking's own id against account ids would invent sixteen fake pairs and corrupt the history.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the spotlight has rows.",
      },
      {
        answer: "'Dubai'",
        kind: "keyword",
        label: "the city value",
        why: "The spotlight is the quoted text 'Dubai', exact and case-sensitive. 'Osaka' would profile a different city's account and the deck's narrative collapses.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending — the spotlight opens on the headline ticket. ASC would lead with the 44.48 line and let the deck's biggest number arrive last.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Osaka'", "ASC"],
    walkthrough:
      "The spotlight is a city filter with a value rank: Dubai, ordered biggest-first, joined through customer_id = c.id. Three rows come back: booking 74 at 1,088.44 (pending), booking 87 at 326.05 (delivered), booking 59 at 44.48 (delivered). That shape is the narrative: one headline ticket that dwarfs the rest — the ledger's largest booking, still awaiting fulfillment — sitting on top of two modest completed lines. So the Dubai account is Farid Nasser, three bookings total, 1,458.97 lifetime, and more than two-thirds of it rides on one pending ticket. The direction flip would ruin the story: ascending leads with the 44.48 line and the deck opens its spotlight on the smallest number in the file. Ranking isn't decoration here — it is the argument.",
  },
];
