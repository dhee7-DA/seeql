// Case batch M2-L12a — topic l12 (LEFT JOIN), ids cs-402…cs-418.
// Preservation semantics: ghost rows kept with NULL right sides, ON-filter vs
// WHERE-filter placement, IS NULL hole lists, and ghost-bucket counts. Every
// figure is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L12a: CaseStudy[] = [
  {
    id: "cs-402",
    tier: "easy",
    topic: "l12",
    universe: "refund-audit",
    title: "Every account on the cancellation map",
    brief:
      "From: refunds@ — quarterly review. Re: the cancellation map.\n\nThe quarterly review opens with a map of every account against its cancellations, and the map has to show the quiet accounts too — an account that has never cancelled is part of the story. Pull every account with whatever cancellations attach, blanks included, filed A to Z by account name.",
    ask: "Account name, booking id and total for every cancellation, keeping accounts with none — filed A to Z.",
    template: `SELECT c.name, o.id AS booking_id, o.total
FROM customers c
{1} JOIN orders o ON {2} = c.id AND o.status = {3}
ORDER BY c.name, o.total;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps every account",
        why: "The map must show accounts with no cancellations, and only the LEFT flavor keeps a row whose other side came up empty. An inner reunion would silently delete twelve accounts from the map.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Each booking points at its account through customer_id — that is the thread. The booking's own number against account numbers would pair the wrong rows and put fake cancellations on the map.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The map tracks the cancellation queue: the exact text 'cancelled', quoted and lowercase. 'delivered' would map a completely different pile and the review would open on fiction.",
      },
    ],
    distractors: ["INNER", "o.id", "'delivered'"],
    walkthrough:
      "A preservation ask: every account stays on the map, cancellations attach where they exist. Nineteen rows come back — seven real cancellations and twelve accounts printing blanks. The seven: Keiko Sato's 397.99, Alice Chen three times over at 206.19, 152.52 and 136.11, Emma Wilson's 143.86, and Maya Patel twice at 90.35 and 25.47. The blanks are the finding: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Grace Kim, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown and Pedro Alvarez have never cancelled anything. For the review that splits the file cleanly — four accounts generate every cancellation, and Alice alone is three of the seven.",
  },
  {
    id: "cs-403",
    tier: "easy",
    topic: "l12",
    universe: "pricing",
    title: "The premium shelf, vendor by vendor",
    brief:
      "From: Head of Product. Re: pricing review, premium shelf.\n\nThe premium shelf gets rebuilt first: every item listed above 100, with the vendor behind it. I want the vendor file kept whole — if a vendor has nothing premium, they still appear on the printout with a blank, because who is NOT on the premium shelf matters to the review.",
    ask: "Vendor, product and price for every item above 100, keeping vendors with none — priciest first.",
    template: `SELECT s.name, p.name AS product, p.price
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND p.price > {2}
ORDER BY p.price {3}, s.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps quiet vendors",
        why: "Vendors with nothing premium must still print, and the LEFT flavor is what keeps their rows with blank product columns. An inner reunion would erase three vendors from the printout and hide the gap entirely.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium price line",
        why: "Premium is defined as listed above 100 — the threshold lives in the reunion condition, not in any printed column. Dropping it to 60 would flood the shelf with mid-priced items and bury the premium story.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the priciest-first sort",
        why: "Priciest first is descending — the 199.99 watch opens the printout and the blank vendors close it, because NULL prices sort last in descending order. ASC would bury the premium lines under three blanks and invert the story.",
      },
    ],
    distractors: ["INNER", "s.rating", "600", "ASC"],
    walkthrough:
      "The premium shelf prints seven rows from six vendors. Four are real: Smart Watch S at 199.99 and 4K Webcam Pro at 129, both Nordic Gadgets AB; Noise-Canceling Headset at 149.99 from Midwest Hardware Co; Studio Desktop Mic at 119 from Alpine Audio GmbH. Three vendors — Shenzhen Electro, Pacific Textiles and Andes Naturals — print blanks, and that is the review's headline: nobody buys premium from them, so any premium-tier argument concentrates on three vendors, and Nordic alone owns two of the four lines including the catalog's 199.99 price ceiling.",
  },
  {
    id: "cs-404",
    tier: "easy",
    topic: "l12",
    universe: "inventory",
    title: "The audio shelves, quiet vendors included",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: audio aisle pack.\n\nThe audio aisle gets counted Thursday and the pack files by vendor: every vendor who supplies us, with their audio stock attached, and vendors who sell us no audio at all still get a line so the crew knows the silence is real and not a miss. File the pack by vendor name.",
    ask: "Vendor, product and shelf count for every Audio item, keeping audio-less vendors — filed by vendor.",
    template: `SELECT s.name, p.name AS product, p.stock
FROM suppliers s
{1} JOIN products p ON {2} = s.id AND p.category = {3}
ORDER BY s.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps every vendor",
        why: "Vendors with no audio must still take a line in the pack, blanks and all — that is the LEFT flavor's job. The inner flavor drops them and the crew would meet their absence as a surprise at the bin.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Every catalog row points at its vendor through supplier_id — the thread to the vendor file. Matching category text against vendor numbers would match nothing and blank out the whole aisle.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the aisle label",
        why: "The aisle is the exact shelf text 'Audio', quoted and case-sensitive. 'Video' would pack the crew off to count webcams and ring lights in the audio aisle's name.",
      },
    ],
    distractors: ["INNER", "p.category", "'Video'"],
    walkthrough:
      "Six rows, three real: Alpine Audio GmbH's Studio Desktop Mic at 45, Midwest Hardware Co's Noise-Canceling Headset at 60, Andes Naturals' Bluetooth Speaker Mini at 210. Nordic Gadgets, Shenzhen Electro and Pacific Textiles print blank lines — they sell us plenty, just nothing audio, and the pack says so explicitly. The count order matters too: Alpine's 45 is the thinnest audio shelf on the floor, so the Mic bin leads Thursday's recount even though it files mid-pack alphabetically. An inner reunion would have printed three rows and the crew would never have known three vendors were quietly absent from the aisle.",
  },
  {
    id: "cs-405",
    tier: "easy",
    topic: "l12",
    universe: "funnel",
    title: "Thirty-six rows on the in-flight sheet",
    brief:
      "From: Growth marketing lead. Re: win-back seeding, in-flight count.\n\nBefore the win-back budget locks I need the in-flight sheet sized honestly: how many rows the account register produces against shipped tickets, including the accounts that print a blank because nothing of theirs is in transit. The board ask is one number, and it has to be the kept number, not the matched one.",
    ask: "The row count the account register produces against shipped bookings, blanks kept — one figure.",
    template: `SELECT {1} AS in_flight
FROM customers c
{2} JOIN orders o ON {3} = c.id AND o.status = {4};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the kept-row counter",
        why: "The sheet keeps every account, so the count must include the blank rows — that is COUNT(*). COUNT(o.id) skips blank rows and would report 30, six short of the sheet the board actually sees.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Accounts with nothing shipped must survive the reunion with a blank row. The inner flavor drops them and the count quietly lands six low — the board would never know six accounts sat out.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Tickets reach accounts through customer_id — the only thread between the registers. The booking's own number against account numbers pairs the wrong rows and fabricates a sixteen-match sheet.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "In flight means the exact text 'shipped', quoted and lowercase. 'pending' would size the sheet on open tickets instead of moving ones and the budget would chase the wrong pile.",
      },
    ],
    distractors: ["COUNT(o.id)", "INNER", "o.id", "'pending'"],
    walkthrough:
      "The sheet prints 36 — and the honest read is 30 real shipped tickets plus six blank rows, one for each account with nothing in flight: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato and Olivia Brown. That distinction is the whole budgeting question: counting only matched tickets sizes the campaign by in-flight money, while the kept count of 36 reminds the room that six of sixteen accounts are sitting this out. The counter choice is where the two numbers split — COUNT(*) keeps the blanks, COUNT(o.id) drops them, and the six-row gap is the ghost story the deck should tell.",
  },
  {
    id: "cs-406",
    tier: "easy",
    topic: "l12",
    universe: "supplier",
    title: "Who actually supplies the electronics shelf",
    brief:
      "From: Supply-chain lead. Re: QBR pack, electronics page.\n\nThe QBR's electronics page lists each vendor with their scorecard rating beside whatever electronics they sell us — and vendors with no electronics stay on the page with a blank product line, because the rating-without-presence gap is the story. Rank the page by scorecard rating, best first.",
    ask: "Vendor, rating and product for every Electronics item, keeping electronics-less vendors — best rating first.",
    template: `SELECT s.name, s.rating, p.name AS product
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND p.category = {2}
ORDER BY s.rating {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps blank lines",
        why: "Vendors with no electronics must keep their page line with a blank product column — the gap is the story. The inner flavor deletes them and the page would read as if every vendor sold electronics.",
      },
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the shelf label",
        why: "The page is scoped to the exact shelf text 'Electronics', quoted and case-sensitive. 'Fitness' would audit a single yoga mat's vendor line and call it the electronics page.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the best-rating-first sort",
        why: "Best rating first is descending — Alpine's 4.8 blank line tops the page and the gap is impossible to miss. ASC would park the strongest vendors at the bottom and bury the headline.",
      },
    ],
    distractors: ["INNER", "'Fitness'", "s.supplier_id", "ASC"],
    walkthrough:
      "Six rows print, ranked by rating — and the top of the page is a blank: Alpine Audio GmbH scores 4.8, the best on the file, yet its product line is empty because Alpine sells us a mic and a desk mat, no electronics. Nordic Gadgets at 4.6 supplies the Mechanical Keyboard K1, Shenzhen Electro at 4.1 the Wireless Mouse M3, Pacific Textiles at 3.9 the USB-C Hub. Midwest (4.4) and Andes (4.0) join Alpine in the blank club. So the electronics page argues vendor quality against shelf presence, and the blanks — the best-rated vendors absent from the category — are exactly the growth conversation procurement wanted on the record.",
  },
  {
    id: "cs-407",
    tier: "easy",
    topic: "l12",
    universe: "expense",
    title: "Pending money above the materiality line",
    brief:
      "From: Ops finance, spend review. Re: materiality cut on open tickets.\n\nThe spend review ignores pending tickets under 500 — noise. Show every account against their pending bookings above the materiality line, and keep the accounts with nothing above it as blank rows, because 'nothing material pending' is a finding we want on the record. Biggest amounts first.",
    ask: "Account, city and total for every pending booking above 500, keeping accounts with none — biggest first.",
    template: `SELECT c.name, {1}, o.total
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3} AND o.total > {4}
ORDER BY o.total DESC, c.name;`,
    slots: [
      {
        answer: "c.city",
        kind: "keyword",
        label: "the account's city",
        why: "The review routes follow-ups by metro, and city lives on the account register. The booking ledger has no city column, so that spelling breaks before the sheet prints a row.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Accounts with nothing above the line must print as blank rows — that is the finding. The inner flavor drops them and the review would record twelve clean accounts as missing rather than clean.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open money means the exact text 'pending', quoted and lowercase. 'shipped' would review tickets already in transit and the materiality conversation would cover money that is not actually waiting.",
      },
      {
        answer: "500",
        kind: "number",
        noVerify: true,
        label: "the materiality line",
        why: "The review's materiality line is 500 — under it, pending tickets are noise by definition. Raising the line to 600 would push real open money off the sheet and understate the review's exposure.",
      },
    ],
    distractors: ["o.city", "INNER", "'shipped'", "600"],
    walkthrough:
      "Seventeen rows print: five material tickets and twelve blanks. The tickets — Farid Nasser's 1,088.44 in Dubai, Chloe Dubois's 945.21 in Lyon, Emma Wilson twice at 725.34 and 585.79 in Austin, Pedro Alvarez's 576.54 in Madrid — are the review's real open book. The blanks carry the sharpest finding: Alice Chen, the file's biggest spender, holds three open tickets and not one clears 500, so the biggest name on the ledger contributes nothing material to this cut. An inner reunion would have printed five rows and erased the twelve clean accounts from the record entirely.",
  },
  {
    id: "cs-408",
    tier: "medium",
    topic: "l12",
    universe: "growth",
    title: "Fifty-three rows on the delivered schedule",
    brief:
      "From: Chief of Staff. Re: board deck, delivered slide footnote.\n\nThe delivered slide carries one footnote and two numbers: how many rows the account register keeps against delivered bookings, and how many of those rows are real landed tickets. The gap between them is the footnote — name it in the deck so nobody accuses the slide of padding.",
    ask: "Two counts on one row: kept rows versus real delivered tickets, blanks included in the first.",
    template: `SELECT {1} AS kept, {2} AS landed
FROM customers c
{3} JOIN orders o ON o.customer_id = c.id AND o.status = {4};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the kept-row counter",
        why: "The slide keeps every account, so the first number counts rows including the blank one — COUNT(*). It is the only counter that sees Liam O'Brien's empty seat on the delivered pile.",
      },
      {
        answer: "COUNT(o.id)",
        kind: "keyword",
        label: "the matched-ticket counter",
        why: "Landed tickets carry booking numbers; blank rows do not, and COUNT(o.id) skips them. COUNT(*) would copy the kept figure into the landed column and erase the footnote's gap.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The blank seat exists only if the LEFT flavor keeps the unmatched account row. The inner flavor deletes it before counting and both counters would print 52 with no story between them.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed status",
        why: "Landed means the exact text 'delivered', quoted and lowercase. 'shipped' would rebuild the slide on in-transit tickets — a 36-and-30 pair — and the footnote would document the wrong pile.",
      },
    ],
    distractors: ["COUNT(o.id)", "COUNT(*)", "INNER", "'shipped'"],
    walkthrough:
      "One row, two numbers: 53 kept, 52 landed. The single blank row belongs to Liam O'Brien — his only booking is the shipped 705.39 Cork ticket, so against the delivered pile his account prints one empty row. That is the footnote verbatim: the delivered schedule keeps all sixteen accounts and lands bookings for fifteen of them, and the 53rd row is absence made visible, not a hidden ticket. Swap the counters and both columns print 53, the footnote dies, and the deck quietly claims a landed booking that does not exist.",
  },
  {
    id: "cs-409",
    tier: "medium",
    topic: "l12",
    universe: "fraud",
    title: "Six accounts with nothing in transit",
    brief:
      "From: Risk team, spot-check rotation. Re: the never-in-transit list.\n\nThe rotation's new control flags accounts that have never had a booking leave the building — no shipped ticket, ever. Names and regions on the list, nothing else; the region split decides which desk owns each follow-up. If the list is short, say so with the count.",
    ask: "Account name and region for every account with no shipped booking — one row per account, alphabetical.",
    template: `SELECT c.name, {1}
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
WHERE o.id IS {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "c.region",
        kind: "keyword",
        label: "the routing column",
        why: "Follow-ups route by desk, and regions live on the account register. The booking ledger has no region column, so that spelling errors before the control prints a single name.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The hole list exists only if blank rows survive the reunion, which is the LEFT flavor's job. The inner flavor matches nothing to nothing and the control reports a clean file that is anything but.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "Never-in-transit means no booking with the exact status 'shipped', quoted and lowercase. 'delivered' would hunt a different gap — a one-name list — and the desks would chase the wrong absence.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-row test",
        why: "A kept row with no booking prints NULL in every booking column, and IS NULL is the test that finds them. IS NOT NULL would return the opposite list — every account with a shipped ticket.",
      },
    ],
    distractors: ["o.region", "INNER", "'delivered'", "NOT NULL"],
    walkthrough:
      "Six names come back, and the regions split them three ways: Bruno Silva (LATAM); Chloe Dubois, Dmitri Volkov and Olivia Brown (EU); Farid Nasser and Keiko Sato (APAC). Between them the six hold 17 bookings — Dmitri and Keiko are the file's inactive accounts, so the list is really four active accounts whose money never leaves. EU owns three of the six names, which is where the follow-up desk starts. The control works because the blanks survive: an inner reunion would have matched nothing against nothing and reported a clean file that is anything but.",
  },
  {
    id: "cs-410",
    tier: "medium",
    topic: "l12",
    universe: "catalog",
    title: "The four-point-five vendor bar",
    brief:
      "From: Catalog content manager. Re: vendor-score badge pass.\n\nThe badge pass pins a quality badge on items whose vendor scores 4.5 or better, and the sheet must keep every catalog item — unbadged items print with a blank vendor so merchandising sees the full shelf, badges and gaps together. Priciest first so the top of the sheet argues for itself.",
    ask: "Product, price, vendor and rating for every item, badges only where the vendor rates 4.5+ — priciest first.",
    template: `SELECT p.name, p.price, {1} AS vendor, {2}
FROM products p
{3} JOIN suppliers s ON p.supplier_id = s.id AND s.rating >= {4}
ORDER BY p.price DESC, p.name;`,
    slots: [
      {
        answer: "s.name",
        kind: "keyword",
        label: "the vendor column",
        why: "Badges name vendors, and vendor names live in the vendor file. The catalog has no vendor column of its own, so that guess errors before the sheet prints a row.",
      },
      {
        answer: "s.rating",
        kind: "keyword",
        label: "the scorecard column",
        why: "The badge bar is a rating, and ratings live on the vendor file beside each vendor. Pulling region instead would print a continent where the score belongs and the badge read would be nonsense.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Unbadged items must keep their sheet rows with blank vendor columns — the full shelf, badges and gaps. The inner flavor drops the eleven unbadged items and the pass would look complete when it is not.",
      },
      {
        answer: "4.5",
        kind: "number",
        noVerify: true,
        label: "the badge bar",
        why: "The badge bar is a rating of 4.5 or better — the threshold lives in the reunion condition, not in any printed cell. Lowering it to 4.3 would badge Midwest's shelves and erase the pass's main gap.",
      },
    ],
    distractors: ["p.name", "s.region", "INNER", "4.3"],
    walkthrough:
      "Sixteen rows, five badges: Smart Watch S at 199.99, 4K Webcam Pro at 129 and Mechanical Keyboard K1 at 89.99 under Nordic's 4.6, plus Studio Desktop Mic at 119 and Desk Mat Extended at 24.99 under Alpine's 4.8. Eleven items print blank vendors — including the Noise-Canceling Headset at 149.99, the second-priciest item on the sheet, whose vendor Midwest rates 4.4 and misses the bar by a tenth. That near-miss is the pass's real output: the premium end of the catalog is mostly badge-clean, and the one expensive gap has a named, fixable cause.",
  },
  {
    id: "cs-411",
    tier: "medium",
    topic: "l12",
    universe: "month-close",
    title: "The row the WHERE clause loses",
    brief:
      "From: Controller. Re: month-end close, delivered schedule integrity.\n\nThe delivered support schedule must carry all sixteen accounts — the one account with no delivered booking still appears, its columns empty, because the close binder documents absence as well as activity. The count the binder quotes is the kept count, and one word in the reunion decides whether the ghost row survives. Choose it correctly.",
    ask: "The kept row count for the account-by-booking reunion against delivered bookings, ghost row intact.",
    template: `SELECT COUNT(*) AS schedule_rows
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id {2} o.status = {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The ghost row only exists under the LEFT flavor — the inner flavor deletes unmatched accounts before any filter runs and the schedule prints 52 with the absence undocumented.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the filter's home inside the reunion",
        why: "Inside the reunion condition the status test only decides which bookings attach — a failed test still leaves the account row, blank. Moved to the row filter, the test judges whole rows and the blank account dies, printing 52 instead of 53.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed status",
        why: "The support schedule is the delivered pile: the exact text 'delivered', quoted and lowercase. 'shipped' would rebuild the schedule on in-transit tickets and quote 36 where the binder says 53.",
      },
    ],
    distractors: ["INNER", "WHERE", "'shipped'"],
    walkthrough:
      "The binder's number is 53: sixteen accounts, fifteen of them with delivered bookings attached, and Liam O'Brien's lone blank row holding the schedule's sixteenth seat. Slide the status test out of the reunion condition into the row filter and the count drops to 52 — the blank row's status reads NULL, NULL fails any equality test, and the account vanishes from a schedule that promises every account. The close team's rule is now written into the build: preservation lives in the reunion condition, elimination lives in the row filter, and 53 versus 52 is how you prove which one you built.",
  },
  {
    id: "cs-412",
    tier: "medium",
    topic: "l12",
    universe: "refund-audit",
    title: "The account the delivered pile forgot",
    brief:
      "From: refunds@ — escalation prep. Re: the delivered-pile exception.\n\nEvery other queue review found its accounts; the delivered pile has exactly one account that never appears in it. Find that account for the escalation prep: name and city, exactly as registered. One row expected, and the row should be visibly empty where the delivered booking would sit.",
    ask: "Name, city and delivered-status for the one account with no delivered booking — one blank row.",
    template: `SELECT c.name, {1}, o.status
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
WHERE o.id IS {4};`,
    slots: [
      {
        answer: "c.city",
        kind: "keyword",
        label: "the account's city",
        why: "Escalation prep routes by metro, and cities live on the account register. The booking ledger has no city column, so that spelling errors before the exception prints.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The exception only exists if the unmatched account keeps a blank row — the LEFT flavor's signature move. The inner flavor deletes him and the prep would report no exception at all.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The pile in question is the exact text 'delivered', quoted and lowercase. 'shipped' would hunt the never-shipped list instead — six names, a different escalation entirely.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-row test",
        why: "The exception is a kept row whose booking columns all read NULL, and IS NULL is the test that surfaces it. IS NOT NULL would print the other fifty-two matched rows and bury the one name that matters.",
      },
    ],
    distractors: ["c.region", "o.city", "INNER", "'shipped'", "NOT NULL"],
    walkthrough:
      "One row comes back: Liam O'Brien, Cork, status blank. His file holds exactly one booking — the 705.39 Cork ticket — and it is shipped, not delivered, so against the delivered pile his account keeps its seat with nothing attached. Every other one of the sixteen accounts appears in the delivered pile at least once, which is what makes the exception escalation-worthy: one account, one ticket, in transit, and the sole gap in an otherwise complete completed-base. The IS NULL test is what surfaces him; the opposite test would have printed fifty-two matched rows and the exception would still be hiding in plain sight.",
  },
  {
    id: "cs-413",
    tier: "medium",
    topic: "l12",
    universe: "pricing",
    title: "Vendors with no premium line at all",
    brief:
      "From: Head of Product. Re: pricing review, the premium gap.\n\nBefore we pitch premium-tier increases, I want the vendors who could not participate named: no item above 100, not one. Keep the file honest — these rows should print a zero in the item count, not vanish, because the premium story's weak side needs faces. File them A to Z.",
    ask: "Vendor, region and premium-item count for every vendor with no item above 100 — zeros visible, alphabetical.",
    template: `SELECT s.name, s.region, {1} AS premium_items
FROM suppliers s
{2} JOIN products p ON p.supplier_id = s.id AND p.price > {3}
WHERE {4} IS NULL
GROUP BY s.name
ORDER BY s.name;`,
    slots: [
      {
        answer: "COUNT(p.id)",
        kind: "keyword",
        label: "the matched-item counter",
        why: "These vendors matched nothing, so the honest count of matched catalog rows is zero — COUNT(p.id) prints it. COUNT(*) would count each vendor's own blank row as one and dress the gap up as an item.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The gap list needs blank rows to survive so the NULL test can find them — the LEFT flavor's job. The inner flavor matches nothing to nothing and the premium gap would print as an empty page.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium price line",
        why: "Premium is defined as listed above 100 — the threshold sits in the reunion condition, not in a printed cell. Raising it to 120 would push Alpine's 119 mic below the line and add a fourth vendor to the gap list.",
      },
      {
        answer: "p.price",
        kind: "keyword",
        label: "the blank-row probe",
        why: "A vendor with no premium match keeps a row whose catalog columns all read NULL, and testing the price column for NULL finds them. Testing a vendor-file column would fail — those columns are never blank on a kept row.",
      },
    ],
    distractors: ["COUNT(*)", "SUM(p.price)", "INNER", "120", "s.rating"],
    walkthrough:
      "Three vendors carry the premium gap: Shenzhen Electro and Pacific Textiles (both APAC) and Andes Naturals (LATAM), each printing a clean zero. The count column is the honesty device — COUNT(p.id) shows zero matched items, while COUNT(*) would have printed three flattering ones that are really blank rows. Context the review should hear: the premium shelf above 100 holds four items across three vendors, so the pitch already leans on Nordic, Alpine and Midwest — and the three zero-rows name exactly which vendor relationships cap the premium story.",
  },
  {
    id: "cs-414",
    tier: "hard",
    topic: "l12",
    universe: "inventory",
    title: "Thin shelves, counted without losing vendors",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: thin-shelf two-count.\n\nThe cycle-count pack reports two counts per vendor against shelves under 150 units: how many rows the vendor file keeps, and how many of those are real thin shelves. Vendors with nothing thin keep their row with a zero — the pack documents quiet vendors rather than dropping them. Deepest count first, then name.",
    ask: "Vendor, kept rows and thin shelves per vendor against the 150-unit line — zeros kept, biggest count first.",
    template: `SELECT s.name, {1} AS kept, {2} AS thin
FROM suppliers s
{3} JOIN products p ON p.supplier_id = s.id AND p.stock < {4}
GROUP BY s.name
ORDER BY thin DESC, s.name;`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the kept-row counter",
        why: "Kept rows include a vendor's blank row when nothing matches the 150 line, and only COUNT(*) counts it — that is what keeps a quiet vendor visible in the pack at all.",
      },
      {
        answer: "COUNT(p.id)",
        kind: "keyword",
        label: "the matched-shelf counter",
        why: "Thin shelves carry catalog ids; blank rows do not, so COUNT(p.id) separates real shelves from kept blanks. COUNT(*) would copy the kept figure into the thin column and hide the zero.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "A vendor with nothing under 150 must keep a pack line with a zero — the LEFT flavor keeps the row, the counter pair prints the zero. The inner flavor drops the vendor and the pack undercounts the file.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the thin-shelf line",
        why: "Thin is defined as under 150 units — the threshold lives in the reunion condition, not in a printed cell. Tightening it to 45 would leave a single shelf on the whole pack and the two-count story would collapse.",
      },
    ],
    distractors: ["COUNT(p.id)", "COUNT(*)", "INNER", "45"],
    walkthrough:
      "Six rows, and the pair of counts tells the story per vendor. Nordic Gadgets keeps 3 rows, all 3 thin — Smart Watch at 40, 4K Webcam at 70, Keyboard at 120. Pacific Textiles 2 and 2 (Hub 85, Jersey 110). Alpine, Andes and Midwest one each (Mic 45, Band 95, Headset 60). And Shenzhen Electro prints kept 1, thin 0 — a blank row for a vendor whose shallowest shelf is the Ring Light at exactly 150, one unit above the line. That lone zero is the pack's discipline point: the inner reunion would have dropped Shenzhen's row and the pack would read five vendors instead of six.",
  },
  {
    id: "cs-415",
    tier: "hard",
    topic: "l12",
    universe: "funnel",
    title: "In-flight money, region by region",
    brief:
      "From: Growth marketing lead. Re: win-back budget, regional split.\n\nThe win-back memo budgets by region, so the in-flight sheet needs the same two-count per region: rows kept against shipped tickets matched, blanks folded in. A region whose kept and matched counts differ is carrying ghost rows — name the gap per region so the budget note can price the absence.",
    ask: "Region, kept rows and matched shipped tickets per region, blanks folded in — biggest kept first.",
    template: `SELECT c.region, COUNT(*) AS kept, {1} AS in_flight
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
GROUP BY {4}
ORDER BY kept DESC, c.region;`,
    slots: [
      {
        answer: "COUNT(o.id)",
        kind: "keyword",
        label: "the matched-ticket counter",
        why: "In-flight tickets carry booking numbers; blank rows do not, so COUNT(o.id) counts only real tickets. COUNT(*) would copy the kept figure into the in-flight column and erase every region's ghost gap.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Ghost rows are the sheet's whole story, and only the LEFT flavor keeps them alive to be counted. The inner flavor deletes them and every region would read kept-equals-matched — a clean lie.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "In flight means the exact text 'shipped', quoted and lowercase. 'delivered' would budget on landed money instead of moving money and the regional split would describe last quarter's wins.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping column",
        why: "The budget splits by region, and regions live on the account register — grouping there produces four regional buckets. Grouping by a booking column would shred the sheet into per-ticket rows.",
      },
    ],
    distractors: ["COUNT(*)", "'delivered'", "o.region", "ASC"],
    walkthrough:
      "Four regions print: EU keeps 15 rows for 12 real shipped tickets, APAC 10 for 8, US 10 for 10, LATAM 1 for 0. The gaps are the ghosts: EU's three blanks are Chloe Dubois, Dmitri Volkov and Olivia Brown; APAC's two are Farid Nasser and Keiko Sato; LATAM's single 1-and-0 row is Bruno Silva's whole region — one account, nothing in flight. The US pair reading 10-and-10 is itself a finding: both US accounts ship steadily, so no ghost pads that row. Total the kept column and the sheet reconciles to 36 — 30 real tickets plus six blanks, which is the number the budget note quotes with the ghost story attached.",
  },
  {
    id: "cs-416",
    tier: "hard",
    topic: "l12",
    universe: "supplier",
    title: "The Wearables gap list",
    brief:
      "From: Supply-chain lead. Re: QBR pack, the Wearables gap.\n\nThe QBR's wearables page needs its gap list: vendors who hold zero Wearables items, each with their scorecard rating beside the zero, because the pitch is that these vendors are rated well and still absent from the category. Rank the gap list by rating so the best-rated absence leads the page.",
    ask: "Vendor, rating and wearables count for every vendor with zero Wearables items — best rating first.",
    template: `SELECT s.name, s.rating, {1} AS wearable_items
FROM suppliers s
{2} JOIN products p ON p.supplier_id = s.id AND p.category = {3}
GROUP BY s.name
HAVING COUNT(p.id) = {4}
ORDER BY wearable_items DESC, s.rating DESC;`,
    slots: [
      {
        answer: "COUNT(p.id)",
        kind: "keyword",
        label: "the matched-item counter",
        why: "The gap list prints zeros, and COUNT(p.id) prints a true zero for vendors whose wearables reunion matched nothing. COUNT(*) counts their blank rows as ones and the gap list loses its point.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Zero-item vendors only reach the page if their blank rows survive the reunion — the LEFT flavor's job. An inner reunion deletes them and the gap list prints empty, which reads as no gap.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the category",
        why: "The gap is scoped to the exact shelf text 'Wearables', quoted and case-sensitive. 'Audio' would build the gap list from different vendors entirely — Nordic, Shenzhen and Pacific — and the QBR page would misname the absentees.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the gap count",
        why: "The gap is defined as zero matched items, so the filter keeps only vendors whose matched count is 0. A bar of 1 would flip the page into the haves — Andes and Nordic — instead of the have-nots.",
      },
    ],
    distractors: ["COUNT(*)", "INNER", "'Audio'", "1"],
    walkthrough:
      "Four vendors make the gap list, led by the best-rated: Alpine Audio GmbH at 4.8, Midwest Hardware Co at 4.4, Shenzhen Electro at 4.1, Pacific Textiles at 3.9 — each with a hard zero in the wearables count. The whole category lives with just two vendors: Andes Naturals (Fitness Band X2) and Nordic Gadgets (Smart Watch S). So the QBR page argues concentration with named absences: four of six vendors, including the two best-rated on the file, hold none, while Andes and Nordic split the shelf between them. The zero column is what keeps the argument honest — blank rows counted as ones would have flattered everyone.",
  },
  {
    id: "cs-417",
    tier: "hard",
    topic: "l12",
    universe: "expense",
    title: "Accounts with a blank pending column",
    brief:
      "From: Ops finance, spend review. Re: the blank pending column.\n\nThe spend-trim memo profiles the eight accounts with nothing pending, and the profile's value column must print the register's own word for nothing — not a zero, not a dash — so nobody reads a fabricated figure into it. Names and regions attached, filed A to Z, for the escalation annex.",
    ask: "Account, region and pending value for every account with no pending booking — blanks preserved, alphabetical.",
    template: `SELECT c.name, c.region, {1} AS pending_value
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
WHERE o.id IS {4}
GROUP BY c.name
ORDER BY c.name;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the pending value column",
        why: "With no pending bookings to add up, the honest sum is NULL — the blank row carries no totals and SUM prints that emptiness through. A counter would print a misleading 0 where the annex wants the empty mark.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The eight clean accounts only exist as rows because the LEFT flavor keeps them with NULL booking columns. The inner flavor drops them and the annex would profile nobody.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Nothing pending means no booking with the exact status 'pending', quoted and lowercase. 'shipped' would profile a different six-account list and the annex would document the wrong absence.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-row test",
        why: "A kept row with no pending booking reads NULL in every booking column, and IS NULL is the test that finds those rows. IS NOT NULL would flip the annex to the eight accounts that DO have open money.",
      },
    ],
    distractors: ["COUNT(o.total)", "'shipped'", "0", "INNER"],
    walkthrough:
      "Eight rows, every value column empty: Bruno Silva (LATAM); Dmitri Volkov, Isabella Rossi, Liam O'Brien, Noah Meyer and Olivia Brown (EU); Hiro Tanaka (APAC); Jamal Wright (US). The empty cell is the point — SUM over a row with no bookings prints NULL, the register's own word for nothing, and the annex quotes it verbatim rather than rounding absence down to zero. Two details sharpen the annex: the EU dominates with five of the eight names, and Dmitri Volkov sits on the list as an inactive account, so nothing-pending on a closed account is cleanup rather than exposure. A counter would have printed eight tidy zeros and the annex would have read like eight good-news rows; the NULL column keeps the profile honest about what it does not know.",
  },
  {
    id: "cs-418",
    tier: "hard",
    topic: "l12",
    universe: "growth",
    title: "Thirty-three rows on the EU slide",
    brief:
      "From: Chief of Staff. Re: board deck, the EU slide's row count.\n\nThe deck's EU slide counts rows from a reunion of the account register against delivered bookings, scoped to the EU. The row count must survive scrutiny: accounts outside the region and accounts without delivered bookings both keep a seat with blanks, and the slide's footnote explains the difference between rows kept and tickets landed. Both figures go in the footnote.",
    ask: "Row count for the EU-scoped, delivered-only reunion with every account kept — the footnote's first number.",
    template: `SELECT COUNT(*) AS slide_rows
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2} AND c.region = {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The slide keeps every account row — eight non-EU accounts and Cork's undelivered account print blanks, and only the LEFT flavor keeps them. The inner flavor collapses the count to 24 and the footnote's gap story disappears.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed status",
        why: "The slide counts landed EU money: the exact text 'delivered', quoted and lowercase. 'shipped' would rebuild the slide on in-transit tickets and the footnote would defend a different pile.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region scope",
        why: "The slide is the EU slide: the exact text 'EU' on the account's region, inside the reunion condition. 'US' would count a different region's landed bookings against fourteen blank outsider seats.",
      },
    ],
    distractors: ["INNER", "'shipped'", "'US'", "o.region"],
    walkthrough:
      "The slide prints 33 rows, and the footnote unpacks them: 24 are real delivered EU bookings, and 9 are blank seats — the eight accounts outside the region, plus Liam O'Brien whose only ticket is still in transit. Swap the join flavor and the count falls to 24: clean-looking, and quietly wrong for a slide that promises the full register. The same construction is why the region test lives inside the reunion condition — move it to the row filter and the eight outsiders vanish rather than printing as blanks. 33 kept against 24 landed is the deck's preservation story in two numbers.",
  },
];
