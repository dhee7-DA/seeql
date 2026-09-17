// Case batch M2-L10a — topic l10 (Join mechanics), ids cs-336…cs-352.
// The FK inside ON is the star: pointer-and-landing pairs as chip slots,
// qualified-column discipline, ORDER BY joined columns, and the wrong-key
// trap told in the walkthrough. Every figure is audited against the live
// seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L10a: CaseStudy[] = [
  {
    id: "cs-336",
    tier: "easy",
    topic: "l10",
    universe: "supplier",
    title: "The Andes page: two lines, one vendor",
    brief:
      "From: Supply-chain lead. Re: QBR pack, Andes Naturals section.\n\nThe Andes Naturals page of the QBR pack is due and I want the footprint straight off the catalog: every item we buy from the vendor numbered 6 in the vendor file, with list price and the vendor's registered name and number carried on the row. If the page shows two SKUs where procurement assumes six, I want the record to say so.",
    ask: "Product name, list price, vendor name and vendor number for every product sourced from vendor 6.",
    template: `SELECT p.name, p.price, s.name AS vendor, s.id
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.id = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Each catalog row points at its vendor through supplier_id — that is the thread the reunion follows. The product's own id would match product numbers against vendor numbers and pair up six fake matches while ten real items vanish.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id, and the pointer must land exactly there. Vendors carry no supplier_id column of their own, so spelling it on this side breaks the query before the page fills.",
      },
      {
        answer: "6",
        kind: "number",
        label: "the vendor's file number",
        why: "Andes Naturals SA sits at number 6 in the vendor file. Vendor 5 is Alpine Audio GmbH — a different page in the pack with a different two-item shelf.",
      },
    ],
    distractors: ["s.supplier_id", "p.stock", "5", "'Andes Naturals SA'"],
    walkthrough:
      "One vendor page, one thread: the catalog's supplier_id lands on the vendor file's id, and the filter pins the file to vendor 6. Two rows come back: Bluetooth Speaker Mini at 59.99 and Fitness Band X2 at 79, both carrying Andes Naturals SA and file number 6. This is the join where the lazy shortcut looks most tempting, because both sides have a column called id — but id-to-id pairs only the first six catalog rows and silently drops the other ten items, a fiction the pack would print as fact. The pointer is supplier_id, always. Context for the page: Andes is the LATAM vendor with a 4.0 rating, and their lifetime book with us is 3,613.25 across 25 sales lines — a two-SKU vendor carrying real volume.",
  },
  {
    id: "cs-337",
    tier: "easy",
    topic: "l10",
    universe: "expense",
    title: "Hamburg's four bookings",
    brief:
      "From: Finance operations. Re: regional spend sweep, Germany.\n\nThe spend sweep is walking city by city and Hamburg is next on the list. Before the reviewer opens the file I want the city's full booking history off the ledger: booking number, amount, and where each one sits in fulfillment. If the whole city rides on one account, the sweep notes should say exactly that.",
    ask: "Booking id, total and status for every booking placed by an account in the city of Hamburg.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.city = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Bookings reach their account only through the customer_id pointer — that is the column the engine reads to find the matching register row. The booking's own id would pair booking numbers with account numbers and fabricate sixteen rows of coincidence.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The account register numbers its rows in id — the pointer's landing column. The register has no customer_id of its own, so that spelling errors out before the sweep line exists.",
      },
      {
        answer: "'Hamburg'",
        kind: "keyword",
        label: "the city filter",
        why: "The sweep is city-level, so the exact text 'Hamburg' goes on the register's city column. 'Munich' matches no account on the file and the sweep would log an empty city.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Munich'", "'shipped'"],
    walkthrough:
      "A city's history is one pointer reunion plus one exact-text filter: customer_id lands on c.id, and city = 'Hamburg' keeps the register side to one metro. Four bookings come back: 56.19 shipped, 75.47 delivered, 116.69 delivered, and 489.33 shipped — and the register confirms all four belong to a single Hamburg account, Noah Meyer. Two of the four are still in flight, which matters for a spend sweep: Hamburg's number is not settled history, it is partly open. The lifetime total on the file is 737.68, modest against the leaders, but the sweep's real finding is structural — one account is the entire city, so chasing 'Hamburg' means phoning one person. The wrong-key version of this reunion prints sixteen rows and buries that finding under noise.",
  },
  {
    id: "cs-338",
    tier: "easy",
    topic: "l10",
    universe: "growth",
    title: "The LATAM line, ranked",
    brief:
      "From: Chief of Staff. Re: board deck, regional slide.\n\nThe regional slide has a LATAM strip and I want it built from the ledger rather than from memory: every booking the region has ever placed, biggest amount first, with fulfillment state visible. If the region's entire story is one account with two bookings, the slide should carry that shape honestly.",
    ask: "Booking id, total and status for every booking from LATAM-region accounts, biggest total first.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.region = {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Region lives on the account register, and each booking reaches it through customer_id. Pairing booking ids against account ids would invent sixteen phantom matches and the regional strip would be fiction.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the slide has a single row.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the region value",
        why: "The strip is the quoted text 'LATAM', exact and case-sensitive. 'EU' would fill the slide with forty-five bookings from the wrong continent.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending. ASC would open the regional strip with the 99.48 ticket and let the headline number arrive last, upside down for a boardroom.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'EU'", "ASC"],
    walkthrough:
      "The LATAM strip is a pointer reunion, a region filter, and a value rank: customer_id = c.id, region 'LATAM', biggest first. Two rows come back — booking 6 at 752.96 and booking 23 at 99.48, both delivered, both belonging to the register's one São Paulo account, Bruno Silva. That is the whole regional story: LATAM's 852.44 lifetime sits in a single city, fully completed, nothing in flight. The direction chip is doing real work here — descending puts the 752.96 headline on top; flipped, the slide leads with the small ticket and reads as a region with no pulse. And the pointer matters more than usual at this scale: with only two real rows, even one fabricated wrong-key match would visibly distort the strip the board sees.",
  },
  {
    id: "cs-339",
    tier: "easy",
    topic: "l10",
    universe: "fraud",
    title: "The nine-hundred sweep",
    brief:
      "From: Risk team, spot-check rotation. Re: high-value ticket review.\n\nThe rotation opens every session with the file's biggest tickets, and this month the bar is nine hundred: anything above that gets a manual look with the account holder's name and the fulfillment state attached. Pull the sweep line exactly as the register stores it — no retyping, no rounding.",
    ask: "Booking id, account name, total and status for every booking with a total above 900, biggest first.",
    template: `SELECT o.id, c.name, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total > {3}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names live on the account register, so every booking must be reunited through its customer_id pointer. The booking's own id against account ids would produce sixteen plausible-looking rows that are pure coincidence of small numbers.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id column of its own — writing it breaks the query and the sweep prints nothing.",
      },
      {
        answer: "900",
        kind: "number",
        noVerify: true,
        label: "the review bar",
        why: "The rotation's bar this month is 900 — the threshold belongs to the filter, not to any result cell. Dropping it to 800 would pull two mid-size tickets into a review built for the extreme tail.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "1000", "800"],
    walkthrough:
      "The sweep is one filter on top of a pointer reunion: totals above 900, names attached through customer_id = c.id, biggest first. Two tickets clear the bar: booking 74, Farid Nasser, 1,088.44, pending; booking 43, Chloe Dubois, 945.21, pending. Read the status column twice, because it is the finding — both of the file's largest tickets are still open, not one of them has completed. For contrast, the biggest completed booking anywhere on the ledger is 752.96, well under the bar. So the top of this file is exposure, not history, and the rotation's note writes itself: the two names above 900 are chasing, not archiving. The 800 bar would have padded the sweep with Emma's 845.92 and Grace's 826.03 — real tickets, wrong review.",
  },
  {
    id: "cs-340",
    tier: "easy",
    topic: "l10",
    universe: "catalog",
    title: "The video shelf's two vendors",
    brief:
      "From: Catalog content manager. Re: shelf provenance audit, video.\n\nThe provenance audit wants each shelf's sourcing story on the record. Video first: every item on the shelf with its list price, the vendor behind it, and the vendor's scorecard rating so the audit can see quality and source side by side. Registered names only — the audit rejects paraphrases.",
    ask: "Product name, price, vendor name and vendor rating for every product in the Video category.",
    template: `SELECT p.name, p.price, s.name AS vendor, s.rating
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.category = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Sourcing is recorded as a supplier_id pointer on each catalog row — the only thread to the vendor file. The product's own id would pair six product numbers with six vendor numbers and drop the rest of the shelf.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id, and the pointer lands there. Vendors have no supplier_id column, so that spelling errors before the audit sheet prints.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the shelf label",
        why: "Shelves are labeled in the category column with exact text — 'Video', quoted. 'Audio' would audit the microphone and headset shelf instead, and 'Electronics' a third shelf entirely.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Audio'", "'Electronics'"],
    walkthrough:
      "Provenance per shelf means the catalog's supplier_id pointer landing on the vendor file's id, with the shelf filter set to the exact text 'Video'. Two rows come back: 4K Webcam Pro at 129 sourced from Nordic Gadgets AB with a 4.6 rating, and Ring Light at 39.99 sourced from Shenzhen Electro with a 4.1. So the video shelf splits across two vendors on two continents, and the premium item carries the better scorecard — a tidy line for the audit. The rating column is only possible because the pointer reunion brought the vendor file to the row; the catalog alone knows the supplier_id number but not the 4.6 behind it. That is the whole mechanic in one shelf: the pointer carries you from what we sell to who we buy it from.",
  },
  {
    id: "cs-341",
    tier: "easy",
    topic: "l10",
    universe: "month-close",
    title: "The US open-items line",
    brief:
      "From: Controller. Re: month-end close, US receivables line.\n\nThe close binder's US line needs its open items with the account holder's name spelled out on each row. The register's columns are all aliased in this extract, so make sure the name column is read through the right alias — the booking side has no name field at all, and the binder has bounced extracts before for exactly that.",
    ask: "Booking id, total and account name for every pending booking from US-region accounts.",
    template: `SELECT o.id, o.total, {1}.name
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = {2} AND c.region = {3};`,
    slots: [
      {
        answer: "c",
        kind: "keyword",
        label: "the register's alias",
        why: "Names live on the account register, aliased c in this extract, so the name column is c.name. Writing o.name reaches for a name column on the booking ledger, which has none, and the extract dies before the binder line prints.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open items means the exact text 'pending' — quoted, lowercase. 'shipped' would fill the US line with tickets already in transit and overstate the receivable.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the region value",
        why: "The binder line is the quoted text 'US' on the register's region column. 'EU' would build the American line out of eight European cities.",
      },
    ],
    distractors: ["o", "s", "c.city", "'shipped'"],
    walkthrough:
      "The US open-items line is a status filter and a region filter on a pointer reunion — and an alias discipline test. The booking ledger carries no name, so the extract reads c.name through the register's alias; the ledger's alias o has no name column, and an undeclared alias like s never resolves at all. Three rows come back, every one of them Emma Wilson in Austin: 725.34, 585.79 and 160.30 — 1,471.43 of open US money, all in one account. The region's other account, Jamal Wright in Chicago, contributes nothing pending this cycle, which is exactly the kind of concentration the binder should flag. When the auditors ask why the US line is one name long, the extract is the answer: the pointer reunion proves it, row by row.",
  },
  {
    id: "cs-342",
    tier: "medium",
    topic: "l10",
    universe: "refund-audit",
    title: "The cancellation queue, biggest first",
    brief:
      "From: refunds@ — weekly queue review. Re: escalation shortlist.\n\nBefore Thursday's call I want the whole cancellation queue on one sheet, biggest amount first, with the account holder and their city on every row so support can see which metros keep cancelling. Every cancelled booking, no threshold — the call can skip down the list as time allows.",
    ask: "Booking id, total, account name and city for every cancelled booking, biggest total first.",
    template: `SELECT o.id, o.total, c.name, c.city
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Cities and names sit on the account register, and each booking reaches them only through customer_id. Matching booking ids to account ids would fabricate sixteen pairings and put cancellations in cities that never made them.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling errors before the shortlist exists.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is defined by the exact text 'cancelled', quoted and lowercase. 'pending' would read the open pile instead and the escalation call would debate bookings nobody cancelled.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending, so the call opens on the money that matters. ASC would lead with a 25.47 ticket and burn the meeting's first minutes on pocket change.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'pending'", "ASC"],
    walkthrough:
      "The full queue is a pointer reunion with a status gate and a value rank: customer_id = c.id, status 'cancelled', biggest first. Seven rows come back, and they tell a three-metro story. Keiko Sato's 397.99 in Nagoya leads; then Alice Chen appears three times — 206.19, 152.52 and 136.11, all Berlin; Emma Wilson's 143.86 in Austin sits mid-list; and Maya Patel closes it with 90.35 and 25.47, both Mumbai. So the queue is one big Nagoya cancellation, one Berlin account cancelling repeatedly in the low hundreds, and a long Mumbai tail. The direction chip is what makes the sheet readable — descending turns seven scattered rows into a ranked agenda. And the city column earns its place: without the register reunion, the queue would be seven anonymous amounts with no metros to pattern-match.",
  },
  {
    id: "cs-343",
    tier: "medium",
    topic: "l10",
    universe: "pricing",
    title: "The triple-digit shelf",
    brief:
      "From: Pricing analyst. Re: autumn repricing, premium tier.\n\nThe repricing shortlist starts at the top of the market: every catalog item listed above 100, priciest first, with the vendor behind each one named. If the premium tier turns out to be one vendor's game, that concentration goes straight into the narrative — so show the vendor on the row, not in a footnote.",
    ask: "Product name, price and vendor name for every product priced above 100, priciest first.",
    template: `SELECT p.name, p.price, s.name AS vendor
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.price > {3}
ORDER BY p.price DESC;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The vendor's name reaches the row only through the catalog's supplier_id pointer. Pairing product ids with vendor ids would hand the shortlist six invented rows and silently lose half the shelf.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file's rows are numbered in id — where the pointer lands. Vendors carry no supplier_id of their own, so that guess breaks the query before the tier exists.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium bar",
        why: "The tier's definition is above 100 — the bar lives in the filter and never in a result cell. Lowering it to 50 doubles the list and dissolves the premium story the section is built on.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "50", "'Video'"],
    walkthrough:
      "The premium tier is a price bar on a pointer reunion: supplier_id = s.id, price above 100, priciest first. Four items clear the bar — Smart Watch S at 199.99 from Nordic Gadgets AB, Noise-Canceling Headset at 149.99 from Midwest Hardware Co, 4K Webcam Pro at 129 from Nordic again, and Studio Desktop Mic at 119 from Alpine Audio GmbH. Read as a shortlist, that is three vendors and a concentration story: Nordic owns two of the four premium slots, including the catalog's ceiling price. The bar placement matters as much as the reunion — drop it to 50 and the list doubles to eight items, burying the tier under mid-market stock. This is the mechanic worth internalizing: the filter shapes the shelf, but the pointer is what puts a vendor's name on every row of it.",
  },
  {
    id: "cs-344",
    tier: "medium",
    topic: "l10",
    universe: "inventory",
    title: "EU shelves under the hundred line",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: European replenishment focus.\n\nThe European vendor pages need a thin-shelf focus list: items sourced from EU-region vendors where on-hand stock sits below 100, thinnest first, vendor named so purchasing knows who the buy order goes to. Nothing padded — if it is three lines, the list is three lines.",
    ask: "Product name, stock and vendor name for every product from EU-region vendors with stock below 100, thinnest first.",
    template: `SELECT p.name, p.stock, s.name AS vendor
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.region = {3} AND p.stock < {4}
ORDER BY p.stock;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Stock lives on the catalog row, the vendor's region on the vendor file, and supplier_id is the only thread between them. The product's own id against vendor ids would invent pairings and aim buy orders at the wrong vendors.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. There is no supplier_id on the vendor file itself, so that spelling errors before the focus list prints.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the vendor region",
        why: "The list is scoped to the quoted text 'EU' on the vendor's region. 'APAC' would rebuild the list from a different continent and send the buy orders the wrong way.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the thin-stock line",
        why: "Thin means below 100 on hand — the line lives in the filter, never in a cell. Cutting it to 50 would drop the third-thinnest EU shelf off its own focus list.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'APAC'", "50"],
    walkthrough:
      "The focus list stacks two filters on the pointer reunion: the vendor file scoped to region 'EU', the catalog scoped to stock under 100, thinnest first. Three lines come back — Smart Watch S at 40 from Nordic Gadgets AB, Studio Desktop Mic at 45 from Alpine Audio GmbH, 4K Webcam Pro at 70 from Nordic again. Both EU vendors appear, Nordic twice, so Friday's European buy orders concentrate on one relationship. The mechanics are where this one bites: the region filter runs on the vendor file's columns, the stock filter on the catalog's, and only the pointer reunion lets one query speak both dialects. Cut the line to 50 and the webcam's 70-unit shelf falls off the list it belongs on; flip the region to 'APAC' and the list shrinks to a single hub at 85. Filters on the wrong file are the quiet way focus lists go wrong.",
  },
  {
    id: "cs-345",
    tier: "medium",
    topic: "l10",
    universe: "funnel",
    title: "Seoul's in-transit tickets",
    brief:
      "From: Growth marketing lead. Re: win-back pilot, Seoul slice.\n\nThe win-back pilot's Seoul slice needs its in-flight money mapped: bookings from the city of Seoul that have shipped but not landed, ranked by amount. If the slice is really one account's shipping schedule, the pilot brief should name the account rather than pretend there is a market.",
    ask: "Booking id and total for every shipped booking from accounts in the city of Seoul, biggest first.",
    template: `SELECT o.id, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.city = {3} AND o.status = {4}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The city sits on the account register, so each booking reaches the filter through its customer_id pointer. Booking ids matched against account ids would fabricate sixteen rows and seed the pilot with fictional targets.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the slice exists.",
      },
      {
        answer: "'Seoul'",
        kind: "keyword",
        label: "the city filter",
        why: "The slice is the quoted text 'Seoul', exact and case-sensitive. 'Osaka' would map a different city's shipping schedule into the Seoul brief.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "In flight means the exact text 'shipped' — quoted, lowercase. 'pending' would map bookings that have not even left the building and overstate the pilot's urgency.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Osaka'", "'pending'"],
    walkthrough:
      "The Seoul slice is two filters on a pointer reunion: city 'Seoul' on the register side, status 'shipped' on the ledger side, ranked by amount. Three rows come back — 826.03, 373, and 46.67 — and the register says all three belong to Grace Kim, the city's single account. So the pilot's Seoul brief is not a market, it is one person's shipping schedule: her file holds 14 bookings worth 4,574.23, and these three in-flight tickets are the slice currently between warehouses. The 826.03 alone is worth the pilot's attention; the 46.67 is a rounding error riding along. This is what the pointer reunion is for — proving that a city-level number is really an account-level story before budget attaches to the wrong noun.",
  },
  {
    id: "cs-346",
    tier: "medium",
    topic: "l10",
    universe: "supplier",
    title: "Pacific Textiles' price ladder",
    brief:
      "From: Supply-chain lead. Re: QBR pack, Pacific Textiles section.\n\nThe Pacific Textiles page needs its price ladder rebuilt from the catalog: every item we buy from them, dearest to cheapest, list price visible. The vendor's registered name goes in the filter exactly as the file spells it — last quarter's pack showed an empty page because the name was truncated.",
    ask: "Product name and list price for every product sourced from Pacific Textiles, priciest first.",
    template: `SELECT p.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.name = {3}
ORDER BY p.price {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The catalog records the vendor relationship in supplier_id — the pointer the reunion follows. The product's own id would pair product numbers with vendor numbers and print a ladder of six coincidental rows.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors have no supplier_id column of their own, so that guess errors and the QBR page stays blank.",
      },
      {
        answer: "'Pacific Textiles'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The file registers the vendor as the exact text 'Pacific Textiles' — quotes included. A truncated 'Pacific Textile' matches nothing and the page prints empty, which is how last quarter's pack failed.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Dearest to cheapest is descending. ASC would open the page with a 14.99 cable and let the 65 jersey — the actual headline — arrive last.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Pacific Textile'", "ASC"],
    walkthrough:
      "The ladder is a pointer reunion with an exact-name gate and a price rank: supplier_id = s.id, vendor name 'Pacific Textiles' spelled in full, dearest first. Three rows come back — Cycling Jersey Pro at 65, USB-C Hub 7-in-1 at 49, and the HDMI 2.1 Cable at 14.99. So Pacific's catalog footprint with us is three SKUs spanning apparel, accessories and cabling, spread across a 50-dollar price range. Context the page should carry: their scorecard rating is 3.9, the lowest on the vendor file, and their lifetime book is 2,980.15 across 40 sales lines. The exact-text discipline is the quiet lesson here — the pointer reunion was never the problem last quarter, the truncated filter was. Vendor pages live and die on spelled-out names.",
  },
  {
    id: "cs-347",
    tier: "medium",
    topic: "l10",
    universe: "expense",
    title: "The eight-hundred-dollar line",
    brief:
      "From: Finance operations. Re: big-ticket review, current cycle.\n\nThe big-ticket review draws its line at 800 this cycle: every booking above it, with the account holder and the fulfillment state on the row, so the review can split what has landed from what is still moving. Ranked biggest first — the meeting opens on the largest number the file holds.",
    ask: "Booking id, total, account name and status for every booking with a total above 800, biggest first.",
    template: `SELECT o.id, o.total, c.name, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total > {3}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Account names live on the register, so each booking is reunited through customer_id. The booking's own id against account ids would fabricate sixteen matches and put eight-hundred-dollar tickets on accounts that never placed them.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. There is no customer_id on the register itself, so that spelling errors before the review has rows.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the review line",
        why: "This cycle's line is 800 — the threshold sits in the filter, not in any result cell. Dropping to 300 would flood the review with forty-nine tickets and defeat the point of a big-ticket meeting.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "300", "'delivered'"],
    walkthrough:
      "The review is one bar over a pointer reunion: totals above 800, names and states attached through customer_id = c.id, biggest first. Four tickets clear the line: Farid Nasser's 1,088.44 pending, Chloe Dubois's 945.21 pending, Emma Wilson's 845.92 shipped, Grace Kim's 826.03 shipped. The split is the story — the top two are still open, the bottom two are in flight, and nothing above 800 has completed. For the review's risk language: the file's biggest ticket is unfulfilled money sitting in Dubai, and the second-biggest in Lyon. The bar itself is doing real filtering work — below 800 the file sprawls to forty-nine tickets, which is a ledger, not a meeting. Keep the reunion honest and the four names on the page are the whole agenda.",
  },
  {
    id: "cs-348",
    tier: "hard",
    topic: "l10",
    universe: "growth",
    title: "The APAC open book, account by account",
    brief:
      "From: Chief of Staff. Re: board deck, regional pipeline appendix.\n\nThe appendix needs APAC's open book grouped the way the board reads it: pending bookings only, sorted under each account holder's name with the city beside it, and within an account the bigger ticket first. If the appendix shows one Dubai ticket carrying the region's pipeline, that is the sentence the deck leads with.",
    ask: "Booking id, account name, city and total for every pending booking from APAC-region accounts, sorted by account name then biggest total first.",
    template: `SELECT o.id, c.name, c.city, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.region = {3} AND o.status = {4}
ORDER BY {5}, o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names and cities live on the register, and every booking reaches them through customer_id. Pairing booking ids with account ids would print sixteen fictional rows and the appendix would misattribute the region's entire pipeline.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that guess errors out and the appendix prints nothing at all.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "The appendix is scoped to the quoted text 'APAC' on the register's region column. 'EU' would file Berlin-to-Madrid open items under a region they do not belong to.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open book means the exact text 'pending' — quoted, lowercase. 'shipped' would fill the appendix with tickets already in transit and double the region's exposure on paper.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "The board reads the appendix account by account, so the sort leads with the register's name column. Sorting by c.city instead regroups the same rows under metros and breaks the account-by-account reading the deck promises.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'EU'", "'shipped'", "c.city", "o.total"],
    walkthrough:
      "The appendix stacks a region gate, a status gate, and a two-key sort on the pointer reunion: customer_id = c.id, region 'APAC', status 'pending', then account name with the bigger ticket first inside each name. Five rows come back, grouped: Farid Nasser in Dubai with 1,088.44; Grace Kim in Seoul with 273.64; Keiko Sato in Nagoya with 149; Maya Patel in Mumbai with 306.92 and 148.28. That grouping is the finding — APAC's open book is five tickets, and the largest is more than the other four combined, sitting on one Dubai account. The sort-key chip is where hard-won discipline shows: sorting by city produces a defensible-looking sheet that reads metro-first, which is not what the deck promises, and sorting by the booking's own total scrambles the grouping entirely. The wrong-key version is worse — sixteen invented pairs, the region's pipeline turned into fiction.",
  },
  {
    id: "cs-349",
    tier: "hard",
    topic: "l10",
    universe: "fraud",
    title: "Pending exposure above four hundred",
    brief:
      "From: Risk team, spot-check rotation. Re: open-exposure sweep.\n\nThis rotation's sweep line is open money: pending bookings above 400, with the account holder and city attached, biggest first. The intern's first attempt paired rows by position instead of by the account pointer and produced a sheet of plausible garbage — this rebuild is the corrected version the sign-off goes on.",
    ask: "Booking id, account name, city and total for every pending booking with a total above 400, biggest first.",
    template: `SELECT o.id, c.name, c.city, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3} AND o.total > {4}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The intern's sheet paired booking numbers against account numbers — sixteen coincidental matches, eighty-seven real bookings silently dropped. Only the customer_id pointer reunites each pending ticket with the account that actually owns it.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own, so that spelling errors — and an errored sweep beats a fictional one every time.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open exposure means the exact text 'pending' — quoted, lowercase. 'cancelled' would sweep the goodwill queue instead and count written-off tickets as live risk.",
      },
      {
        answer: "400",
        kind: "number",
        noVerify: true,
        label: "the sweep bar",
        why: "The rotation's bar is 400 — the threshold lives in the filter, never in a cell. Lowering it to 300 pulls three mid-size tickets into a sweep scoped for the heavy tail.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'cancelled'", "300"],
    walkthrough:
      "The corrected sweep is a status gate and a value bar on the pointer reunion: customer_id = c.id, status 'pending', totals above 400, biggest first. Five tickets come back: Farid Nasser's 1,088.44 in Dubai, Chloe Dubois's 945.21 in Lyon, Emma Wilson's 725.34 and 585.79 — both Austin — and Pedro Alvarez's 576.54 in Madrid. Four metros, five tickets, one account appearing twice, and the top ticket bigger than the next two combined. The walkthrough of what went wrong matters as much as the numbers: pairing on the booking's own id against account ids returns sixteen rows that look orderly and mean nothing, because numbers 1 through 16 happen to exist on both files. The pointer is the only honest thread. Lower the bar to 300 and the sweep gains three tickets it was never scoped to chase.",
  },
  {
    id: "cs-350",
    tier: "hard",
    topic: "l10",
    universe: "catalog",
    title: "The EU vendor pages, A to Z",
    brief:
      "From: Catalog content manager. Re: provenance audit, EU section.\n\nThe audit's EU section prints one merged list: every item sourced from EU-region vendors, filed under the vendor's registered name with price ascending inside each vendor. Get the filing column right — the audit rejected last quarter's list because items were filed alphabetically across vendors instead of under them.",
    ask: "Vendor name, product name and price for every product from EU-region vendors, filed by vendor name then price.",
    template: `SELECT s.name AS vendor, p.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.region = {3}
ORDER BY {4}, p.price;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Filing items under vendors only works if the reunion follows the catalog's supplier_id pointer. The product's own id against vendor ids would file ten of the sixteen items under nobody and invent matches for the rest.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file's rows are numbered in id — the pointer's landing column. Vendors carry no supplier_id column, so that guess errors before the section prints a row.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the section's region",
        why: "The section is the quoted text 'EU' on the vendor's region column. 'APAC' would file the section under the wrong continent and the audit fails it on provenance.",
      },
      {
        answer: "s.name",
        kind: "keyword",
        label: "the filing column",
        why: "The audit files under the vendor's registered name — the vendor file's name column leads the sort. Sorting by the product's own name interleaves vendors alphabetically, which is exactly the filing mistake the audit bounced last quarter.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'APAC'", "p.name", "p.price"],
    walkthrough:
      "The EU section is a region gate and a two-key sort on the pointer reunion: supplier_id = s.id, vendor region 'EU', filed by vendor name with price ascending inside each vendor. Five rows come back, properly filed — under Alpine Audio GmbH: Desk Mat Extended at 24.99, then Studio Desktop Mic at 119; under Nordic Gadgets AB: Mechanical Keyboard K1 at 89.99, 4K Webcam Pro at 129, Smart Watch S at 199.99. Two vendors, five items, and the premium anchor clearly Nordic's. The filing column is the case's spine: sorting by product name produces the interleaved list the audit rejected — webcam, desk mat, keyboard, watch, mic, vendors shuffled mid-list — and sorting by price abandons the filing entirely. The pointer reunion is what makes vendor-filed pages possible at all; the sort key is what makes them auditable.",
  },
  {
    id: "cs-351",
    tier: "hard",
    topic: "l10",
    universe: "month-close",
    title: "The seven-hundred completed club",
    brief:
      "From: Controller. Re: month-end close, collected-money narrative.\n\nThe close narrative needs its anchor fact: which bookings above 700 have actually completed, with the account holder named and the region visible for the roll-up. Sort under account names so the narrative can say who holds the club membership, not just that it exists.",
    ask: "Account name, booking id, total and region for every delivered booking with a total above 700, sorted by account name.",
    template: `SELECT c.name, o.id, o.total, c.region
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3} AND o.total > {4}
ORDER BY {5}, o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names and regions live on the register, and each booking reaches them through customer_id. The booking's own id against account ids would invent sixteen members for a club that has two.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that guess errors before the club has a roster.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "Completed money means the exact text 'delivered' — quoted, lowercase. 'shipped' would seat in-flight tickets at a table reserved for landed money and overstate the close.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the club's entry bar",
        why: "Membership starts above 700 — the bar lives in the filter, not in a cell. Lowering it to 500 admits a longer table and dilutes the anchor fact the narrative needs.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the roster's sort column",
        why: "The narrative reads the roster account by account, so the register's name column leads the sort. Any other key either regroups the roster under the wrong heading or surrenders the order to the total fallback and reads like a leaderboard instead of a membership list.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'shipped'", "500", "c.active"],
    walkthrough:
      "The club is a status gate and a value bar on the pointer reunion: customer_id = c.id, status 'delivered', totals above 700, rostered by account name. Two rows come back — Alice Chen in the EU with booking 14 at 705.23, and Bruno Silva in LATAM with booking 6 at 752.96. Two members, two regions, and the punchline for the narrative: Bruno's 752.96 is the single biggest completed booking anywhere on the ledger, while the two biggest tickets outright — 1,088.44 and 945.21 — are both still pending and therefore not in the club. The sort chip keeps the roster readable by account; letting the booking's total lead the sort would crown 752.96 on top and read like a leaderboard, which is not the close's framing. Contrast for the memo: the shipped side above 700 holds five tickets, so the completed club is genuinely small — landed money at the top of this file is scarce.",
  },
  {
    id: "cs-352",
    tier: "hard",
    topic: "l10",
    universe: "refund-audit",
    title: "The four lines behind ticket 83",
    brief:
      "From: refunds@ — goodwill sign-off pack. Re: ticket 83 itemization.\n\nThe sign-off pack itemizes the goodwill ticket line by line: the four register lines behind booking 83, each with its line number, quantity and unit price, so the 397.99 reconciles arithmetically on the page. The pairing between lines and bookings runs on the line's booking pointer — the intern's version paired on row numbers and the pack refused to reconcile.",
    ask: "Booking id, line number, quantity and unit price for every line item belonging to booking 83.",
    template: `SELECT o.id, oi.id AS line_no, oi.quantity, oi.unit_price
FROM order_items oi
JOIN orders o ON {1} = {2}
WHERE oi.order_id = {3};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Each line carries an order_id that points at its booking — the only honest thread. Pairing line numbers against booking numbers matches 103 of the 251 lines by pure coincidence and drops the other 148, which is how the intern's pack failed to reconcile.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the booking ledger's id column. The ledger has no order_id of its own, so that spelling errors before the itemization prints.",
      },
      {
        answer: "83",
        kind: "number",
        label: "the goodwill ticket number",
        why: "The sign-off pack itemizes booking 83 — Keiko Sato's 397.99 cancellation. Booking 84 holds a different account's lines and the reconciliation would fail on the first row.",
      },
    ],
    distractors: ["oi.id", "o.order_id", "o.customer_id", "84"],
    walkthrough:
      "The itemization is the line register's order_id pointer landing on the booking ledger's id, pinned to ticket 83. Four lines come back — line 200 at 2 units of 62.56, line 201 at 2 of 41.81, line 202 at 2 of 32.49, line 203 at 1 of 124.27 — and they reconcile exactly: 125.12 plus 83.62 plus 64.98 plus 124.27 is 397.99, the figure the goodwill ledger quotes. The wrong-key version is the trap this case exists to teach: pairing each line's own id against booking ids happens to match for the 103 lines numbered 103 or under and silently drops the other 148 — an itemization that reconciles nothing. The alias on the line number keeps the two id columns distinct on the page, which is what lets the pack quote line 200 rather than an ambiguous number. Reconciliation is the point of the pack, and only the true pointer delivers it.",
  },
];
