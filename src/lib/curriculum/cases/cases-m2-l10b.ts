// Case batch M2-L10b — topic l10 (Join mechanics), ids cs-353…cs-368.
// The FK inside ON is the star: pointer-and-landing pairs as chip slots,
// qualified-column discipline, ORDER BY joined columns, and the wrong-key
// trap told in the walkthrough. Every figure is audited against the live
// seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L10b: CaseStudy[] = [
  {
    id: "cs-353",
    tier: "easy",
    topic: "l10",
    universe: "pricing",
    title: "Nordic's three lines, registered",
    brief:
      "From: Pricing analyst. Re: vendor deep-dive, Nordic Gadgets AB.\n\nThe Nordic page of the deep-dive needs their catalog footprint exactly as registered: every item we buy under their full registered name, with list price and on-hand figure per row. The name goes into the filter spelled the way the vendor file spells it — the last analyst who shortened it spent a week wondering why the page was blank.",
    ask: "Product name, price and stock for every product sourced from Nordic Gadgets AB.",
    template: `SELECT p.name, p.price, p.stock
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.name = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The catalog records who sells each item in supplier_id — the pointer the reunion follows. The product's own id would pair product numbers with vendor numbers and return six coincidental rows while ten real items disappeared.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id, and the pointer must land there. Vendors carry no supplier_id column of their own, so that spelling breaks the query before the page fills.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The file registers the vendor as the exact text 'Nordic Gadgets AB', quotes included. A shortened 'Nordic Gadgets' matches no row and the deep-dive page prints empty — the exact mistake the last analyst made.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Nordic Gadgets'", "'Shenzhen Electro'"],
    walkthrough:
      "The Nordic page is a pointer reunion with an exact-name gate: supplier_id = s.id, vendor name spelled in full. Three rows come back — Mechanical Keyboard K1 at 89.99 with 120 on hand, 4K Webcam Pro at 129 with 70, and Smart Watch S at 199.99 with just 40. So Nordic's footprint is three SKUs across three categories, including the catalog's single most expensive item. Context the page should carry: Nordic holds a 4.6 vendor rating and the largest lifetime book of any vendor — 11,130.25 across 43 sales lines and 82 units. The reunion mechanic is what lets one page argue price, shelf depth and provenance together: the pointer brings the vendor's identity to every product row, and the exact-text filter keeps the page honest about whose items they are.",
  },
  {
    id: "cs-354",
    tier: "easy",
    topic: "l10",
    universe: "inventory",
    title: "The Midwest restock list",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: vendor restock sheet, Midwest.\n\nThe restock sheet for our US vendor needs their bins thinnest first so the buy order follows the shelf that needs it most: item number, product name and on-hand figure per row, with the vendor's region confirmed on the page. Vendor 4 in the file, no other.",
    ask: "Item number, product name, stock and vendor region for every product sourced from vendor 4, thinnest shelf first.",
    template: `SELECT p.id AS item_no, p.name, p.stock, s.region
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.id = {3}
ORDER BY p.stock;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Bins reach their vendor through the catalog's supplier_id pointer — the thread this sheet follows. The product's own id would match item numbers against vendor numbers and restock according to a coincidence.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id — the pointer's landing column. There is no supplier_id on the vendor file itself, so that guess errors before the sheet prints.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the vendor's file number",
        why: "The sheet is vendor 4, Midwest Hardware Co — the number shows up on every row the reunion prints, so it can be checked against the page. Vendor 5 is Alpine Audio GmbH, a different continent and a different buy order.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "5", "'US'"],
    walkthrough:
      "The restock sheet is a pointer reunion pinned to one vendor number: supplier_id = s.id, file number 4, thinnest first. Three rows come back, each carrying the vendor number and region on the page — item 4, Noise-Canceling Headset, 60 on hand; item 10, Laptop Stand Aluminum, 180; item 16, Yoga Mat Eco, 220. The headset bin leads the buy order by a wide margin, and the region column confirms the order is domestic: Midwest Hardware Co is the US vendor with a 4.4 rating and the deepest relationship on the file — 56 sales lines, 109 units, 9,294.93 lifetime. The aliased item number is worth a word: with the catalog's own id printed as item_no, the sheet can quote item 4 unambiguously instead of a bare number that could be mistaken for a vendor or booking number. The pointer did the vendor work; the alias did the clerical work.",
  },
  {
    id: "cs-355",
    tier: "easy",
    topic: "l10",
    universe: "funnel",
    title: "Mumbai's thirteen bookings",
    brief:
      "From: Growth marketing lead. Re: city-level account review, Mumbai.\n\nThe Mumbai review needs the city's complete booking history off the ledger, biggest amount first, with each ticket's fulfillment state visible so the churn conversation starts from the record. Thirteen tickets or three, whatever the ledger says — the review quotes the ledger.",
    ask: "Booking id, total and status for every booking from accounts in the city of Mumbai, biggest total first.",
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
        why: "Bookings point at accounts through customer_id — the reunion thread that lets a city filter reach the ledger. Booking ids matched against account ids would fabricate sixteen rows and put strangers' tickets in Mumbai's history.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. The register has no customer_id of its own, so that spelling errors before the review has a single row.",
      },
      {
        answer: "'Mumbai'",
        kind: "keyword",
        label: "the city filter",
        why: "The review is the quoted text 'Mumbai', exact and case-sensitive. 'Nagoya' would audit a different city's account and the churn conversation would start from the wrong file.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending, opening the review on the 611.87 ticket. ASC would lead with the 25.47 cancellation and set the meeting's tone from the smallest line on the file.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Nagoya'", "c.region"],
    walkthrough:
      "Mumbai's history is a pointer reunion with a city gate and a value rank: customer_id = c.id, city 'Mumbai', biggest first. Thirteen rows come back — one account, Maya Patel, carrying the entire city: 611.87 delivered at the top, then 419.37, 416.81 and 324.16 delivered behind it, a shipped tier from 283.12 down to 158.48, two open tickets at 306.92 and 148.28, and two cancellations at 90.35 and 25.47. The state mix is the story: five landed, four in flight, two open, two written off — a genuinely active account, worth 3,644.56 lifetime. The region chip is the trap worth naming: region would match every row to itself and print the whole ledger as 'Mumbai history', which is precisely the kind of plausible nonsense a review repeats out loud if nobody rebuilds the filter on the city column. Thirteen real rows beat one tautology every time.",
  },
  {
    id: "cs-356",
    tier: "easy",
    topic: "l10",
    universe: "supplier",
    title: "The best-reviewed vendor's shelf",
    brief:
      "From: Supply-chain lead. Re: QBR pack, quality spotlight.\n\nThe quality spotlight leads with our best-reviewed vendor: everything we buy from the vendor whose scorecard rating is 4.8, with the rating printed on the row so the page argues quality and assortment together. If the spotlight is two SKUs, it is two SKUs — the page quotes the file.",
    ask: "Product name, price and vendor rating for every product sourced from the vendor rated 4.8.",
    template: `SELECT p.name, p.price, s.rating
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.rating = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Ratings live on the vendor file, so each catalog row reaches them through supplier_id. The product's own id against vendor ids would pair six product numbers with six vendor numbers and attribute the wrong shelf to the spotlight.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors have no supplier_id of their own — that guess errors before the spotlight has a row.",
      },
      {
        answer: "4.8",
        kind: "number",
        label: "the scorecard rating",
        why: "The spotlight is the file's top rating, 4.8, printed on every row the reunion returns. 4.6 belongs to a different vendor with a three-item shelf, and 4.0 to a third — the figure on the page must be the one the filter asked for.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "4.6", "4"],
    walkthrough:
      "The spotlight filters the vendor file on its own scorecard: rating 4.8, with the catalog reunited through supplier_id = s.id so the rating prints beside each item. Two rows come back — Studio Desktop Mic at 119 and Desk Mat Extended at 24.99, both carrying Alpine Audio GmbH's 4.8. So the best-reviewed vendor on the file is a two-SKU relationship spanning a premium audio line and a desk accessory. The rating chip is a number with a job: 4.6 would file Nordic's three-item shelf under the spotlight, and 4 would file Andes' pair — different vendors, different stories, same-looking page. Context for the QBR: Alpine's lifetime book is 4,765.63 across 40 sales lines, so the quality argument has volume behind it. The pointer reunion is what lets a vendor-file figure ride on catalog rows at all — that is the mechanic the spotlight is quietly demonstrating.",
  },
  {
    id: "cs-357",
    tier: "easy",
    topic: "l10",
    universe: "expense",
    title: "Under thirty dollars",
    brief:
      "From: Finance operations. Re: immaterial-pile definition, spend policy.\n\nThe spend policy needs its immaterial pile defined from the record: bookings under 30, with the account holder attached, so the policy document can say exactly what falls beneath chasing. If the entire pile is one ticket, the policy says so — no padding the definition with near-misses.",
    ask: "Booking id, total and account name for every booking with a total under 30, smallest first.",
    template: `SELECT o.id, o.total, c.name
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total < {3}
ORDER BY o.total;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names live on the account register, and each booking reaches them through customer_id. The booking's own id against account ids would invent sixteen under-30 tickets that no account ever placed.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. There is no customer_id on the register itself, so that spelling errors before the policy line has evidence.",
      },
      {
        answer: "30",
        kind: "number",
        noVerify: true,
        label: "the immaterial line",
        why: "The policy's line is 30 — the threshold lives in the filter, never in a cell. Raising it to 60 would fold nine tickets into the pile and redefine 'immaterial' out of recognition.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "60", "'pending'"],
    walkthrough:
      "The immaterial pile is one bar over a pointer reunion: totals under 30, names attached through customer_id = c.id, smallest first. One row comes back — Maya Patel's 25.47, booking 51, already cancelled. That is the entire under-30 book: a single written-off ticket, which is exactly the sentence the policy document needs — beneath 30, this ledger has nothing left to chase. The threshold chip is where the definition lives: move the bar to 60 and the pile jumps to nine tickets, most of them real money, and the policy would bless ignoring purchases that clearly are not immaterial. The pointer is doing quiet work here too — the one row that comes back carries a name, so the policy can say whose 25.47 it was, rather than quoting an anonymous figure no auditor can trace. Small numbers, honest reunion, clean definition.",
  },
  {
    id: "cs-358",
    tier: "medium",
    topic: "l10",
    universe: "growth",
    title: "The APAC in-transit register",
    brief:
      "From: Chief of Staff. Re: board deck, regional operations appendix.\n\nThe operations appendix needs APAC's in-transit register: shipped bookings only, filed under each account holder's name with the city beside it, and within an account the bigger ticket first. The deck's ops narrative claims the region's in-flight money is concentrated — the register either proves that or rewrites it.",
    ask: "Booking id, account name, city and total for every shipped booking from APAC-region accounts, sorted by account name then biggest total first.",
    template: `SELECT c.name, c.city, o.id, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.region = {3} AND o.status = {4}
ORDER BY {5}, o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names and cities sit on the register, and every booking reaches them through customer_id. Pairing booking ids with account ids would invent sixteen fake shipments and misattribute the region's in-flight money.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that guess errors out and the appendix prints nothing.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "The appendix is scoped to the quoted text 'APAC' on the register's region column. 'EU' would file twelve European shipments under the region's ops narrative.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "In transit means the exact text 'shipped' — quoted, lowercase. 'pending' would fill the register with tickets that have not left the building and overstate the region's movement.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the filing column",
        why: "The appendix files under the account holder's name — the register's name column leads the sort. Filing by city instead regroups the same rows under metros, which is not the account-by-account reading the deck promises.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'EU'", "'pending'", "c.city"],
    walkthrough:
      "The register stacks a region gate, a status gate and a two-key sort on the pointer reunion: customer_id = c.id, region 'APAC', status 'shipped', filed by account name with the bigger ticket first inside each name. Eight rows come back, filed — under Grace Kim, Seoul: 826.03, 373 and 46.67; under Hiro Tanaka, Osaka: 263.91; under Maya Patel, Mumbai: 283.12, 282.51, 273.96 and 158.48. The concentration claim survives, with an asterisk: Seoul's Grace Kim holds the single biggest in-flight ticket by far, but Mumbai's Maya Patel owns the deepest column — four of the eight rows. The filing chip is the discipline point: city-sorting produces an equally tidy sheet that reads metro-first, which quietly rewrites the deck's account-level claim. For contrast, the EU's in-transit register would show twelve rows — APAC moves less, and now the deck can say exactly how.",
  },
  {
    id: "cs-359",
    tier: "medium",
    topic: "l10",
    universe: "fraud",
    title: "Cancelled exposure above two hundred",
    brief:
      "From: Risk team, spot-check rotation. Re: written-off money review.\n\nThe rotation's written-off line draws its bar at 200 this cycle: cancelled bookings above it, account holder and city attached, biggest first, so the review can see whether big cancellations cluster anywhere. The status word goes in exactly as the ledger stores it — the ledger has no 'refunded' state, whatever the old playbook says.",
    ask: "Booking id, total, account name and city for every cancelled booking with a total above 200, biggest first.",
    template: `SELECT o.id, o.total, c.name, c.city
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3} AND o.total > {4}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names and cities reach the ledger rows only through the customer_id pointer. Booking ids matched against account ids would fabricate sixteen cancellations and scatter them across cities that never cancelled anything.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own, so that spelling errors before the review line exists.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the written-off status",
        why: "Written-off money is the exact text 'cancelled' — quoted, lowercase, one of the ledger's four real states. 'refunded' is not a state on this ledger at all and would return an empty review.",
      },
      {
        answer: "200",
        kind: "number",
        noVerify: true,
        label: "the review bar",
        why: "This cycle's bar is 200 — the threshold lives in the filter, not in a cell. Lowering it to 100 pulls three more tickets into a review scoped for the heavy end of the write-off pile.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'refunded'", "100"],
    walkthrough:
      "The written-off line is a status gate and a value bar on the pointer reunion: customer_id = c.id, status 'cancelled', totals above 200, biggest first. Two rows come back — Keiko Sato's 397.99 in Nagoya and Alice Chen's 206.19 in Berlin. That is the whole heavy end of the write-off pile: one Nagoya ticket on a dormant account, one Berlin ticket on the file's most active account. The bar placement shapes the review — drop it to 100 and Alice's 152.52 and 136.11 join Emma's 143.86, turning a two-ticket look into a five-ticket meeting with a repeat name. The status chip carries the case's craft lesson: the ledger's states are pending, shipped, delivered and cancelled, and inventing a fifth — 'refunded' — empties the review silently rather than erroring loudly. Silent empties are worse than errors; the rotation signs off on rows, not on blanks.",
  },
  {
    id: "cs-360",
    tier: "medium",
    topic: "l10",
    universe: "catalog",
    title: "The sub-fifty shelf, cheapest first",
    brief:
      "From: Catalog content manager. Re: assortment review, entry tier.\n\nThe entry-tier review wants the whole sub-fifty shelf on one page: every item under 50, cheapest first, with the vendor behind each one named so the page can show who actually owns the budget end of the catalog. The sort direction matters — the page opens on the cheapest line and walks up.",
    ask: "Product name, price and vendor name for every product priced under 50, cheapest first.",
    template: `SELECT p.name, p.price, s.name AS vendor
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.price < {3}
ORDER BY p.price {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Vendor names reach the row only through the catalog's supplier_id pointer. The product's own id against vendor ids would file the budget shelf under invented vendors and lose ten of the sixteen items entirely.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file's rows are numbered in id — where the pointer lands. Vendors carry no supplier_id column, so that guess breaks the query before the page prints.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the entry-tier line",
        why: "The tier's definition is under 50 — the line lives in the filter, never in a cell. Cutting it to 25 shrinks the shelf to three items and the review loses the budget story it came for.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Cheapest first is ascending — the page opens on the 14.99 cable. DESC would invert the page's whole premise and open the entry tier on its most expensive line.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "25", "DESC"],
    walkthrough:
      "The entry tier is a price bar and a direction on the pointer reunion: supplier_id = s.id, price under 50, cheapest first. Eight rows come back, walking up from the HDMI 2.1 Cable at 14.99 through Running Socks at 18.50, the Desk Mat at 24.99, the Yoga Mat at 32, the Wireless Mouse at 34.50, the Ring Light at 39.99, the Laptop Stand at 42.50, to the USB-C Hub at 49. The vendor column turns the walk into a finding: Shenzhen Electro owns three of the eight budget slots and Midwest Hardware Co two — the budget end is a two-vendor story with Pacific Textiles and Alpine holding one each. The direction chip is the page's spine: reversed, the review would open the entry tier at 49 and read like a premium shelf with cheap padding. And the 25 line matters — under it, the shelf is three items and the two-vendor finding vanishes.",
  },
  {
    id: "cs-361",
    tier: "medium",
    topic: "l10",
    universe: "month-close",
    title: "The chase list, account by account",
    brief:
      "From: Controller. Re: month-end close, receivables chase list.\n\nThe chase list goes out grouped the way the team works it: every open booking filed under the account holder's name, contact address on the row, and within an account the smaller amount first so the quick wins sit on top. The extract's columns are aliased, so read the contact column through the right alias — the ledger side has no contact field at all.",
    ask: "Booking id, total and contact email for every pending booking, filed by account name then smallest total first.",
    template: `SELECT o.id, o.total, {1}.email
FROM orders o
JOIN customers c ON o.customer_id = c.id
WHERE o.status = {2}
ORDER BY {3}, o.total;`,
    slots: [
      {
        answer: "c",
        kind: "keyword",
        label: "the register's alias",
        why: "Contact addresses live on the account register, aliased c in this extract, so the column is c.email. Writing o.email reaches for a contact field on the booking ledger, which has none, and the chase list dies before it prints.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "The chase list is open money — the exact text 'pending', quoted and lowercase. 'shipped' would file in-transit tickets as chase targets and send the team after money that is already moving.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the filing column",
        why: "The list files under the account holder's name, so the register's name column leads the sort. Sorting by the ledger's total instead abandons the account grouping and reads as a raw ranked pile.",
      },
    ],
    distractors: ["o", "s", "'shipped'", "o.total", "c.region"],
    walkthrough:
      "The chase list is a status gate, an alias discipline test, and a two-key sort on the pointer reunion: customer_id = c.id, status 'pending', filed by account name with the smaller amount first inside each name. Fourteen rows come back, filed — Alice Chen with 212.03, 259.31 and 317.49; Chloe Dubois with 364.71 and 945.21; Emma Wilson with 160.30, 585.79 and 725.34; Farid Nasser with 1,088.44; Grace Kim with 273.64; Keiko Sato with 149; Maya Patel with 148.28 and 306.92; Pedro Alvarez with 576.54. The file's open money totals 6,113.00 across the fourteen tickets, and the filing shows the quick wins: Maya's 148.28 and Keiko's 149 go out first, while Farid's 1,088.44 waits on its own conversation. The alias chip is the case's teaching spine — the ledger carries amounts and states but no contact field, so every email on this list arrived through the register side of the reunion. Sort by region instead and the list still prints, but grouped under continents, which is not how anyone works a chase list.",
  },
  {
    id: "cs-362",
    tier: "medium",
    topic: "l10",
    universe: "refund-audit",
    title: "The dormant files",
    brief:
      "From: refunds@ — quarterly account review. Re: dormant-account exposure.\n\nThe quarterly review closes with the dormant files: every booking still on the ledger from accounts flagged inactive, biggest first, with the account holder named. Two accounts on this file are flagged inactive — the review wants their remaining tickets laid out in one list, whatever the count.",
    ask: "Booking id, total and account name for every booking from inactive accounts, biggest total first.",
    template: `SELECT o.id, o.total, c.name
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.active = {3}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The active flag lives on the register, and each booking reaches it through customer_id. The booking's own id against account ids would invent sixteen dormant tickets and misattribute them to accounts that are wide open.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. There is no customer_id on the register itself, so that spelling errors before the review has rows.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the inactive flag",
        why: "Dormant accounts carry the flag 0 — the value lives in the filter, not in a cell. The flag 1 would build the dormant list out of the file's ninety-seven live accounts instead.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "1", "'pending'"],
    walkthrough:
      "The dormant list is a flag gate on the pointer reunion: customer_id = c.id, active flag 0, biggest first. Six rows come back from the file's two dormant accounts — Dmitri Volkov with 435.09 and 164.17 out of Tallinn, and Keiko Sato with 397.99, 375.93, 175.68 and 149 out of Nagoya. So the dormant exposure is six tickets, and Keiko's file carries four of them, including her 397.99 goodwill cancellation from the sign-off pack. The lifetimes frame the review: Keiko's ledger history is 1,098.60 and Dmitri's is 599.26, so together the dormant files hold roughly 1,700 in remaining footprint. The flag chip is a number doing categorical work — flip it to 1 and the list rebuilds itself from ninety-seven live accounts, a dormant review of everyone. The pointer keeps the six tickets honest; without it, the wrong-key version writes sixteen fictional tickets across accounts that never went dormant.",
  },
  {
    id: "cs-363",
    tier: "hard",
    topic: "l10",
    universe: "pricing",
    title: "The fifty-to-one-fifty repricing band",
    brief:
      "From: Pricing analyst. Re: autumn repricing, mid-market band.\n\nThe mid-market band runs 50 to 150 inclusive, and the repricing sheet files it under vendor names with price ascending inside each vendor, so the negotiation walk goes vendor by vendor up their ladder. Both ends of the band go in as stated — the sheet quotes the policy, not the analyst's memory of it.",
    ask: "Vendor name, product name and price for every product priced between 50 and 150 inclusive, filed by vendor name then price.",
    template: `SELECT s.name AS vendor, p.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.price >= {3} AND p.price <= {4}
ORDER BY {5}, p.price;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Filing under vendors only works if the reunion follows the catalog's supplier_id pointer. The product's own id against vendor ids would file the band under invented pairings and lose most of the catalog on the way.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id of their own, so that guess errors before the band prints a row.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the band's floor",
        why: "The policy's floor is 50, inclusive — it lives in the filter, never in a cell. Raising it to 60 would slide the 59.99 speaker out of the band and the sheet would understate the vendor's mid-market presence.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the band's ceiling",
        why: "The policy's ceiling is 150, inclusive — the second half of the same filter. The figure never appears in a result cell; it only decides which rows survive.",
      },
      {
        answer: "s.name",
        kind: "keyword",
        label: "the filing column",
        why: "The walk goes vendor by vendor, so the vendor file's name column leads the sort. Filing by the vendor's region instead regroups the band under continents and breaks the negotiation order the sheet promises.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "60", "s.region"],
    walkthrough:
      "The band is a two-sided price filter, a pointer reunion, and a two-key sort: supplier_id = s.id, price from 50 through 150 inclusive, filed by vendor name with price ascending inside each vendor. Seven rows come back, filed — under Alpine Audio GmbH: Studio Desktop Mic at 119; under Andes Naturals SA: Bluetooth Speaker Mini at 59.99, then Fitness Band X2 at 79; under Midwest Hardware Co: Noise-Canceling Headset at 149.99; under Nordic Gadgets AB: Mechanical Keyboard K1 at 89.99, then 4K Webcam Pro at 129; under Pacific Textiles: Cycling Jersey Pro at 65. Five vendors, seven SKUs, no vendor owning more than two slots — the mid-market is genuinely contested, which is the sheet's headline. The floor chip matters: at 60 the speaker drops and Andes becomes a single-SKU vendor in the band. And the filing chip is the audit's requirement — region-sorting the same seven rows files Pacific under APAC first and Alpine third, a different walk for the same band.",
  },
  {
    id: "cs-364",
    tier: "hard",
    topic: "l10",
    universe: "inventory",
    title: "The cycle-count exception list",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: Friday count pack, exceptions.\n\nThe Friday pack leads with the exception list: every bin under 100 on hand, thinnest first, with the vendor behind each bin and the vendor's own region on the row — the crew routes domestic and overseas shortfalls differently, so the region has to print. If all four sourcing regions show up on one exception list, say so on the pack.",
    ask: "Item number, product name, stock, vendor name and vendor region for every product with stock under 100, thinnest first.",
    template: `SELECT p.id AS item_no, p.name, p.stock, s.name AS vendor, s.region
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.stock < {3}
ORDER BY p.stock {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Vendor names and regions reach the bin rows only through the catalog's supplier_id pointer. The product's own id against vendor ids would route restocks by coincidence — six bins paired by number, ten bins routed to nobody.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors have no supplier_id column of their own, so that guess errors before the exception list exists.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the exception line",
        why: "The pack's exception line is 100 — the threshold lives in the filter, never in a cell. Raising it to 150 would grow the list to eight bins and drown Friday's focus.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Thinnest first is ascending — the pack leads with the bin closest to a stock-out. DESC would open Friday's count on the healthiest exception and route the crew backwards.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "150", "DESC"],
    walkthrough:
      "The exception list is a stock bar, a direction, and a pointer reunion carrying vendor identity: supplier_id = s.id, stock under 100, thinnest first, with vendor name and region printed on every row. Six bins come back — item 13, Smart Watch S, 40, Nordic Gadgets AB, EU; item 5, Studio Desktop Mic, 45, Alpine Audio GmbH, EU; item 4, Noise-Canceling Headset, 60, Midwest Hardware Co, US; item 7, 4K Webcam Pro, 70, Nordic Gadgets AB, EU; item 3, USB-C Hub 7-in-1, 85, Pacific Textiles, APAC; item 12, Fitness Band X2, 95, Andes Naturals SA, LATAM. All four sourcing regions appear on one exception list — the pack's own observation, now on the record. Nordic owns two of the six thin bins, so the EU routing gets two stops. The aliased item number keeps the crew quoting bin numbers unambiguously, and the direction chip is the routing: reversed, Friday would count the healthiest bin first while the 40-unit watch shelf waits.",
  },
  {
    id: "cs-365",
    tier: "hard",
    topic: "l10",
    universe: "funnel",
    title: "Big tickets by metro",
    brief:
      "From: Growth marketing lead. Re: premium campaign, metro targeting.\n\nThe premium campaign targets metros, not accounts: every booking above 700 filed under the metro it ships to, with the account holder beside it and the bigger ticket first within each metro. If Austin ends up holding three of the ten slots, the campaign brief should say so before budget does.",
    ask: "Booking id, account name, city and total for every booking with a total above 700, filed by city then biggest total first.",
    template: `SELECT o.id, c.name, c.city, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total > {3}
ORDER BY {4}, o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Cities live on the register, so each big ticket reaches its metro through customer_id. Booking ids matched against account ids would invent sixteen premium targets and file them under metros nobody shipped to.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that guess errors before the metro table exists.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the premium bar",
        why: "Premium starts above 700 — the bar lives in the filter, never in a cell. Raising it to 800 cuts the metro table to four rows and Austin's dominance disappears from the picture.",
      },
      {
        answer: "c.city",
        kind: "keyword",
        label: "the filing column",
        why: "The campaign files under metros, so the register's city column leads the sort. Filing by account name instead regroups the same rows under people — an account-level reading for a metro-level campaign.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "800", "c.name"],
    walkthrough:
      "The metro table is a value bar, a pointer reunion, and a two-key sort: customer_id = c.id, totals above 700, filed by city with the bigger ticket first inside each metro. Ten rows come back, filed — Austin: 845.92, 785.79 and 725.34, all Emma Wilson; Berlin: 767.64 and 705.23, both Alice Chen; Cork: 705.39, Liam O'Brien; Dubai: 1,088.44, Farid Nasser; Lyon: 945.21, Chloe Dubois; Seoul: 826.03, Grace Kim; São Paulo: 752.96, Bruno Silva. Read as metros, Austin holds three of the ten premium slots — the concentration the brief suspected, now on the record. The filing chip is the case's pivot: name-sorting produces the same ten rows read account-first, which is the right table for a different campaign and the wrong one here. And the bar chip shapes the story — at 800, Austin keeps two slots and Cork, Berlin's second ticket and São Paulo drop out entirely, shrinking the metro table to four rows and muting the finding.",
  },
  {
    id: "cs-366",
    tier: "hard",
    topic: "l10",
    universe: "supplier",
    title: "The audio shelf, vendor pages",
    brief:
      "From: Supply-chain lead. Re: QBR pack, audio section rebuild.\n\nThe audio section gets rebuilt vendor-page style: every item on the audio shelf filed under its vendor with the vendor's scorecard rating on the row, and within a vendor the pricier item first. Three vendors or one, whatever the shelf says — the section argues concentration from the filing itself.",
    ask: "Vendor name, vendor rating, product name and price for every Audio product, filed by vendor name then priciest first.",
    template: `SELECT s.name AS vendor, s.rating, p.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.category = {3}
ORDER BY {4}, p.price DESC;`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Ratings and vendor names reach the shelf rows only through the catalog's supplier_id pointer. The product's own id against vendor ids would file six invented vendor pages and drop two-thirds of the audio shelf.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id of their own, so that guess errors before the section prints.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf label",
        why: "The section is the quoted text 'Audio', exact and case-sensitive. 'Electronics' would rebuild the section from keyboards, mice and hubs — a different shelf with a different vendor story.",
      },
      {
        answer: "s.name",
        kind: "keyword",
        label: "the filing column",
        why: "The section files under the vendor's registered name, so the vendor file's name column leads the sort. Filing by product name instead interleaves the vendors alphabetically and the concentration argument dissolves into a flat list.",
      },
    ],
    distractors: ["s.supplier_id", "s.stock", "'Electronics'", "p.name"],
    walkthrough:
      "The section is a shelf gate, a pointer reunion, and a two-key sort: supplier_id = s.id, category 'Audio', filed by vendor name with the pricier item first inside each vendor. Three rows come back, filed — under Alpine Audio GmbH, rating 4.8: Studio Desktop Mic at 119; under Andes Naturals SA, rating 4.0: Bluetooth Speaker Mini at 59.99; under Midwest Hardware Co, rating 4.4: Noise-Canceling Headset at 149.99. Three vendors, one shelf each, ratings spanning 4.0 to 4.8 — the concentration narrative writes itself: the audio shelf is a three-way split with no house vendor. The filing chip is what makes that visible; product-name sorting files the same three rows as speaker, headset, mic and hides the vendor structure entirely. Context the section should carry: audio is the ledger's biggest category by line revenue at 11,744.01 across 51 sales lines, so the three-way split is a fight over the largest prize in the catalog.",
  },
  {
    id: "cs-367",
    tier: "hard",
    topic: "l10",
    universe: "expense",
    title: "In-flight money above seven hundred",
    brief:
      "From: Finance operations. Re: in-flight exposure memo.\n\nThe exposure memo covers money currently moving: shipped bookings above 700, filed under the account holder's name with the bigger ticket first inside each account. The memo's language says the in-flight book is one account's shipping schedule — either the filing proves that or the memo gets rewritten.",
    ask: "Account name, booking id and total for every shipped booking with a total above 700, filed by account name then biggest total first.",
    template: `SELECT c.name, o.id, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total > {3} AND o.status = {4}
ORDER BY {5}, o.total DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names reach the ledger rows only through the customer_id pointer. Booking ids matched against account ids would write the memo around sixteen invented shipments and miss every real one.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own, so that spelling errors before the memo has a row to cite.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the exposure bar",
        why: "The memo's bar is 700 — the threshold lives in the filter, not in a cell. It decides which tickets count as exposure and never appears among the results themselves.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "Money currently moving is the exact text 'shipped' — quoted, lowercase. 'delivered' would file landed money as exposure and the memo would chase tickets the recipients already have.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the filing column",
        why: "The memo files under the account holder's name, so the register's name column leads the sort. Filing by city instead regroups the same tickets under metros and the account-level claim goes unproven.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'delivered'", "c.city"],
    walkthrough:
      "The memo is a value bar, a status gate, and a two-key sort on the pointer reunion: customer_id = c.id, totals above 700, status 'shipped', filed by account name with the bigger ticket first. Five rows come back, filed — Alice Chen: 767.64; Emma Wilson: 845.92, then 785.79; Grace Kim: 826.03; Liam O'Brien: 705.39. So the in-flight book above the bar is five tickets across four accounts, and the claim survives with nuance: Emma holds two of the five and the two biggest outright, but this is a shared schedule, not one account's. Liam's 705.39 deserves its own line in the memo — it is his only booking on the entire file, which makes Cork's in-flight ticket a single-point story. The contrast the memo should close on: the delivered side above 700 holds just two tickets, so most of the file's big money is still moving, not landed. The filing chip keeps all of this account-readable; city-sorting the same five rows buries the two-Emma pattern under Austin.",
  },
  {
    id: "cs-368",
    tier: "hard",
    topic: "l10",
    universe: "growth",
    title: "The board slide's open-five",
    brief:
      "From: Chief of Staff. Re: board deck, pipeline slide.\n\nThe pipeline slide carries exactly five open tickets, biggest first, with the account holder and city on each row — the deck's format is fixed and the cut has to match it. If two of the five rows turn out to be one Austin account, the slide's caption should say the pipeline is narrower than it looks.",
    ask: "Booking id, account name, city and total for the 5 largest pending bookings, biggest first.",
    template: `SELECT o.id, c.name, c.city, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3}
ORDER BY o.total {4}
LIMIT {5};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names and cities reach the ledger only through the customer_id pointer. The booking's own id against account ids would seat sixteen invented tickets on a five-row slide and misattribute every figure on it.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that guess errors before the slide has a single row.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Pipeline means the exact text 'pending' — quoted, lowercase. 'delivered' would build the pipeline slide from landed money and the deck would promise revenue it has already collected.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending, so the slide leads with the headline ticket. ASC would open the board's pipeline story on the smallest open ticket and let the real headline arrive last, if the cut even keeps it.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the slide's row count",
        why: "The deck's format fixes the slide at five rows, so the cut is 5 — the constant lives in the limit, never in a cell. Three would underfill the slide; eight would break the format the board approved.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'delivered'", "ASC", "3"],
    walkthrough:
      "The slide is a status gate, a value rank, and a fixed cut on the pointer reunion: customer_id = c.id, status 'pending', biggest first, sliced at five. The rows that land: booking 74, Farid Nasser, Dubai, 1,088.44; booking 43, Chloe Dubois, Lyon, 945.21; booking 5, Emma Wilson, Austin, 725.34; booking 97, Emma again, 585.79; booking 1, Pedro Alvarez, Madrid, 576.54. Five rows, four accounts, 3,921.32 of open money — and the caption writes itself: two of the five slots are one Austin account, so the pipeline is narrower than the row count suggests. The cut chip is the deck's contract — at 3, Pedro's Madrid ticket falls off and the slide loses a metro the board will ask about. The direction chip is the framing: reversed, the slide opens on 576.54 and the 1,088.44 headline arrives buried. And the pointer keeps every attribution honest — the wrong-key version of this query would put Dubai's headline ticket on whatever account happens to share its number.",
  },
];
