// Case batch M2-L12b — topic l12 (LEFT JOIN), ids cs-419…cs-434.
// Preservation angles beyond the a-batch: threshold watchlists, blank-ledger
// sort anatomy, literal-name files, ghost-bucket SUMs by region and account,
// three-table LEFT chains that keep customer ghosts, counter trios, and hole
// lists on both the account and vendor sides. Every figure is audited against
// the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L12b: CaseStudy[] = [
  {
    id: "cs-419",
    tier: "easy",
    topic: "l12",
    universe: "fraud",
    title: "Two tickets on the fraud watchlist",
    brief:
      "From: Risk team, spot-check rotation. Re: the big-ticket watchlist.\n\nThe rotation's new watchlist flags any booking above 900, and the sheet has to show every account against it — accounts with nothing that big stay visible with empty columns, because the reviewer wants to see who is NOT on the hook as clearly as who is. Fulfillment status and amount attached, biggest amount first.",
    ask: "Account, booking status and total for every booking above 900, keeping accounts with none — biggest first.",
    template: `SELECT c.name, o.status, o.total
FROM customers c
{1} JOIN orders o ON {2} = c.id AND o.total > {3}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps clean accounts",
        why: "The watchlist shows every account, clean ones as blank rows — that is the LEFT flavor's signature. An inner reunion would erase fourteen clean accounts and the reviewer would read absence as a miss instead of a clean result.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Bookings point at accounts through customer_id — the only thread between the registers. The booking's own number against account numbers pairs the wrong rows and fabricates a watchlist nobody filed.",
      },
      {
        answer: "900",
        kind: "number",
        noVerify: true,
        label: "the watchlist line",
        why: "The watchlist flags bookings above 900 — the threshold lives in the reunion condition, not in any printed column. Dropping it to 700 would pull ten bookings onto the sheet and bury the two-real-ticket story.",
      },
    ],
    distractors: ["INNER", "o.id", "700", "o.city"],
    walkthrough:
      "Sixteen rows print: two live hits and fourteen blank seats. The hits are both still open — Farid Nasser's 1,088.44 pending ticket out of Dubai and Chloe Dubois's 945.21 pending ticket out of Lyon — and the descending sort parks them on top with their status showing, which is exactly what the reviewer wants to see first: the watchlist's entire exposure is pending money. The fourteen blanks close the sheet, and the sharpest name among them is Alice Chen: the file's biggest spender tops out at 767.64, under the line, so she sits out this list entirely. An inner reunion would have printed two rows and quietly claimed the other fourteen accounts were never checked.",
  },
  {
    id: "cs-420",
    tier: "easy",
    topic: "l12",
    universe: "catalog",
    title: "The EU page of the vendor file",
    brief:
      "From: Catalog content manager. Re: the sourcing page's EU section.\n\nThe sourcing page's EU section lists each vendor on the file with whatever catalog items they source, and vendors outside the region still take a line — blank — so merchandising sees the region's full vendor roster, present or not. Priciest item first so the section opens on its strongest shelf.",
    ask: "Vendor, region, product and price for every item sourced from EU-region vendors, keeping outside vendors — priciest first.",
    template: `SELECT s.name, s.region, p.name AS product, p.price
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND s.region = {2}
ORDER BY p.price {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps outside vendors",
        why: "Vendors outside the region must keep their page lines with blank product columns — the roster is the point. The inner flavor deletes them and the section would read as if every vendor on the file sourced from the EU.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region scope",
        why: "The section is the exact region text 'EU', quoted and case-sensitive, tested against the vendor file's own region column. 'US' would rebuild the page on Midwest's three shelves against five blank outsider lines.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the priciest-first sort",
        why: "Priciest first is descending — the 199.99 watch opens the section and the four blank lines close it, because NULL prices sort last in descending order. ASC would flip the sheet and lead with the blanks.",
      },
    ],
    distractors: ["INNER", "'US'", "s.supplier_id", "ASC"],
    walkthrough:
      "Nine rows print, five of them real: Smart Watch S at 199.99, 4K Webcam Pro at 129 and Mechanical Keyboard K1 at 89.99 — all Nordic Gadgets AB — plus Studio Desktop Mic at 119 and Desk Mat Extended at 24.99 from Alpine Audio GmbH. The four blanks are Shenzhen Electro, Pacific Textiles, Midwest Hardware Co and Andes Naturals, each holding a page line with nothing attached. The section's argument writes itself: two vendors carry the entire EU sourcing story, Nordic alone owns three of the five lines including the 199.99 price ceiling, and the other four vendors' blank lines prove the concentration is real rather than a filing gap.",
  },
  {
    id: "cs-421",
    tier: "easy",
    topic: "l12",
    universe: "month-close",
    title: "Eight empty seats open the ledger",
    brief:
      "From: Controller. Re: month-end close, the open-ticket ledger.\n\nThe close binder's open-ticket ledger files every account against their pending bookings, cheapest amount first, and accounts with nothing pending still take a row — the binder documents quiet accounts alongside exposed ones. Build it so the blanks land where the sort naturally puts them, and the binder's first page tells the preservation story on its own.",
    ask: "Account and pending total for every account, blanks kept, cheapest amount first.",
    template: `SELECT c.name, o.total
FROM customers c
{1} JOIN orders o ON {2} = c.id AND o.status = {3}
ORDER BY o.total;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps quiet accounts",
        why: "Accounts with nothing pending must survive the reunion as blank rows — that is what the binder documents. The inner flavor drops them and the ledger opens on real money with the quiet accounts gone missing.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Tickets reach accounts through customer_id — matching any other column pairs the wrong rows and puts pending money on the wrong names. The binder would document exposure that belongs to somebody else.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Open money means the exact text 'pending', quoted and lowercase. 'shipped' would rebuild the ledger on in-transit tickets — thirty-six rows, six blanks — and the close binder would describe a different book.",
      },
    ],
    distractors: ["INNER", "o.id", "'shipped'", "DESC"],
    walkthrough:
      "Twenty-two rows, and the anatomy is the lesson: an ascending sort files NULL first, so the ledger OPENS on eight blank seats — Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer and Olivia Brown, the accounts with nothing pending. The real book follows: Maya Patel's 148.28 and Keiko Sato's 149 at the thin end, climbing to Farid Nasser's 1,088.44 at the top of the exposure pile. Fourteen tickets spread across eight accounts, Emma Wilson holding three of them worth 1,471.43 together. Flip the sort and the blanks fall to the bottom — same rows, opposite story order — but drop the keeping join and the binder's first page loses its whole point.",
  },
  {
    id: "cs-422",
    tier: "easy",
    topic: "l12",
    universe: "refund-audit",
    title: "The Alice file on the cancellation desk",
    brief:
      "From: refunds@ — escalation prep. Re: the Alice file.\n\nThe escalation prep starts with the queue's heaviest canceller: every cancellation on Alice Chen's file with her city attached, while the rest of the register stays visible as blank rows so the packet shows her file against the whole base. Biggest amount first, and the name test has to be exact — a loose match pulls in accounts that do not belong on this file.",
    ask: "Account, city and total for Alice Chen's cancellations, other accounts kept as blanks — biggest first.",
    template: `SELECT c.name, {1}, o.total
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3} AND c.name = {4}
ORDER BY o.total DESC;`,
    slots: [
      {
        answer: "c.city",
        kind: "keyword",
        label: "the account's city",
        why: "Escalation prep routes by metro, and cities live on the account register. The booking ledger has no city column, so that spelling breaks before the file prints a single row.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps the whole base",
        why: "The packet shows Alice's file against all sixteen accounts — fifteen of them blank. The inner flavor would print only her three rows and the prep would lose the context that everyone else's file is clean.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The file tracks the cancellation queue: the exact text 'cancelled', quoted and lowercase. 'shipped' would fill the packet with her in-transit tickets and call it a cancellation history.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account's exact name",
        why: "The file is one named account, and the test needs the full registered text 'Alice Chen'. 'Alice' alone matches nobody in the register and the packet would print sixteen blank rows with no file in it.",
      },
    ],
    distractors: ["c.region", "INNER", "'shipped'", "'Alice'"],
    walkthrough:
      "Eighteen rows: Alice Chen's three cancellations on top — 206.19, 152.52 and 136.11, all Berlin — then fifteen blank seats for everyone else. Her three tickets are 494.82 of the queue's 1,152.49 cancellation money, close to half the book on one file, which is why the escalation starts here. The exact-name test is doing quiet work: loosen it to 'Alice' and the register matches nobody, printing sixteen empty rows and a packet with no suspect in it. Note too who does NOT appear — Emma Wilson cancelled once at 143.86, but this file is Alice's alone, and the blank rows make that boundary visible instead of silent.",
  },
  {
    id: "cs-423",
    tier: "easy",
    topic: "l12",
    universe: "pricing",
    title: "The under-40 shelf, vendors attached",
    brief:
      "From: Pricing analyst. Re: entry-tier review, the sub-40 shelf.\n\nThe entry-tier review reprices everything listed under 40 and wants the vendor file kept whole — vendors with nothing under 40 stay on the printout with blank lines, because who sits out the entry tier matters to the story as much as who stocks it. Cheapest first so the floor of the catalog leads the sheet.",
    ask: "Vendor, region, product and price for every item under 40, keeping vendors with none — cheapest first.",
    template: `SELECT s.name, s.region, p.name AS product, p.price
FROM suppliers s
{1} JOIN products p ON {2} = s.id AND p.price < {3}
ORDER BY p.price;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps absent vendors",
        why: "Vendors with nothing under 40 must print blank lines so the review can name them. The inner flavor drops Nordic and Andes from the sheet and the entry-tier story loses its absentees.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Every catalog row points at its vendor through supplier_id — the thread to the vendor file. Matching vendor numbers against the wrong column pairs nothing and blanks out the whole shelf.",
      },
      {
        answer: "40",
        kind: "number",
        noVerify: true,
        label: "the entry-tier line",
        why: "Entry tier is defined as listed under 40 — the threshold lives in the reunion condition, not in a printed cell. Tightening it to 25 would cut the shelf to three items and drop Yoga Mat, Mouse and Ring Light from the review.",
      },
    ],
    distractors: ["INNER", "25", "s.supplier_id"],
    walkthrough:
      "Eight rows, and ascending order puts the two blanks on top — Nordic Gadgets and Andes Naturals own nothing under 40, so their empty lines lead the sheet. The real shelf follows: HDMI 2.1 Cable at 14.99 from Pacific Textiles, Running Socks at 18.50 and then Wireless Mouse at 34.50 and Ring Light at 39.99 from Shenzhen Electro, Desk Mat Extended at 24.99 from Alpine, Yoga Mat at 32.00 from Midwest. Shenzhen owns three of the six entry lines — the entry tier is a Shenzhen story with four supporting vendors. Tighten the line to 25 and the shelf shrinks to the 14.99, 18.50 and 24.99 items, which is exactly the sensitivity the review quotes when it argues the tier's depth.",
  },
  {
    id: "cs-424",
    tier: "medium",
    topic: "l12",
    universe: "inventory",
    title: "The restock sheet opens with blanks",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: the restock shortlist.\n\nAnything on a shelf under 50 units goes on Thursday's restock shortlist, and the sheet keeps every vendor on the file — a vendor with nothing thin prints a blank line, so the crew sees the silence is real and not a filing miss. Fewest units first, regions attached for the pick paths.",
    ask: "Vendor, region, product and shelf count for every item under 50 units, keeping vendors with none — fewest units first.",
    template: `SELECT s.name, s.region, p.name AS product, p.stock
FROM suppliers s
{1} JOIN products p ON {2} = s.id AND p.stock < {3}
ORDER BY p.stock;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps quiet vendors",
        why: "Vendors with nothing under 50 must keep their sheet lines as blanks — the shortlist documents them. The inner flavor drops four vendors and the crew would meet their absence as a surprise at the bins.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Shelves reach vendors through the catalog's supplier_id pointer — the only thread. The catalog's own item number against vendor numbers pairs the wrong rows and stockcounts nobody's bins.",
      },
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the restock line",
        why: "Restock means under 50 units on the shelf — the threshold lives in the reunion condition, not in a printed cell. Tightening it to 44 would drop the 45-unit mic and move Alpine onto the blank list.",
      },
    ],
    distractors: ["INNER", "44", "s.stock"],
    walkthrough:
      "Six rows, and the sort order is the surprise: ascending puts NULL first, so the sheet OPENS on four blank vendor lines — Shenzhen Electro, Pacific Textiles, Midwest Hardware and Andes Naturals, none of them under 50 anywhere. The real shortlist follows: Smart Watch S at 40 units from Nordic Gadgets and Studio Desktop Mic at 45 from Alpine, the two thinnest shelves on the floor and Thursday's count priorities. The line's sensitivity is one unit of margin: tighten it to 44 and the 45-unit mic drops off, Alpine joins the blanks, and the shortlist becomes a single watch. The vendor file staying whole is what makes that sensitivity visible instead of silent.",
  },
  {
    id: "cs-425",
    tier: "medium",
    topic: "l12",
    universe: "funnel",
    title: "Open money by region, honest to the end",
    brief:
      "From: Growth marketing lead. Re: win-back budget, the regional open book.\n\nThe win-back memo prices the open book by region: pending value per region with blank accounts folded in, and a region with nothing open must print the register's own word for nothing — not a zero — so the budget note never rounds absence into a figure. Biggest open value first.",
    ask: "Region and pending value per region, blank rows preserved, biggest value first.",
    template: `SELECT c.region, {1} AS open_value
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
GROUP BY {4}
ORDER BY open_value DESC;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the open-value column",
        why: "The open book is money, so the column adds pending totals per region — and for a region with no pending tickets, SUM prints NULL, the honest empty mark. A counter would print a ticket tally where the memo wants a value.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps empty regions",
        why: "A region whose accounts all sit out the pending pile only survives as a NULL bucket if the LEFT flavor keeps the blank rows. The inner flavor deletes them and the region vanishes from the budget note entirely.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "The open book is the exact text 'pending', quoted and lowercase. 'shipped' would price the memo on in-transit money and the win-back budget would chase tickets that are already moving.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping column",
        why: "The budget splits by region, and regions live on the account register — grouping there folds blank accounts into honest regional buckets. Grouping by a booking column would shred the note into per-ticket rows.",
      },
    ],
    distractors: ["COUNT(o.total)", "AVG(o.total)", "'shipped'", "o.region"],
    walkthrough:
      "Four rows, and the blanks carry the note: EU opens 2,675.29 across six tickets, APAC 1,966.28 across five, US 1,471.43 — all Emma Wilson's three Austin tickets — and LATAM prints empty, because Bruno Silva is the whole region and nothing of his is pending. SUM over his all-ghost bucket prints NULL, the register's word for nothing, and the budget note quotes it rather than inventing a zero. The three real figures re-add to the file's 6,113.00 open book exactly, which is the reconciliation the memo attaches. Drop the keeping join and LATAM's row disappears — the note would budget three regions for a four-region file and nobody would have flagged it.",
  },
  {
    id: "cs-426",
    tier: "medium",
    topic: "l12",
    universe: "supplier",
    title: "The video page's absentees",
    brief:
      "From: Supply-chain lead. Re: QBR pack, the video page's absentee list.\n\nThe QBR's video page carries its absentee list: vendors with zero Video items, each with region and scorecard rating attached, because the pitch is that well-rated vendors are absent from the category. Best rating first so the strongest absence leads the page, and the row test has to be the one that actually reads blanks.",
    ask: "Vendor, region and rating for every vendor with no Video item — best rating first.",
    template: `SELECT s.name, s.region, s.rating
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND p.category = {2}
WHERE p.price IS {3}
ORDER BY s.rating {4};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps absentees",
        why: "Absentee rows only exist if vendors with no video match survive the reunion as blanks — the LEFT flavor's job. The inner flavor matches nothing to nothing and the page would print zero absentees.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the category scope",
        why: "The page is scoped to the exact shelf text 'Video', quoted and case-sensitive. 'Audio' would file a different absentee trio — Nordic, Shenzhen and Pacific — and the QBR would name the wrong vendors.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-row test",
        why: "A vendor with no video match keeps a row whose catalog columns all read NULL, and testing the price column for NULL finds them. Testing a vendor-file column finds nothing — those columns are never blank on a kept row.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the best-rating-first sort",
        why: "Strongest absence first is descending — Alpine's 4.8 tops the list and the pitch opens with the best-rated absentee. ASC would lead with the weakest score and bury the argument.",
      },
    ],
    distractors: ["INNER", "'Audio'", "s.rating", "NOT NULL", "ASC"],
    walkthrough:
      "Four absentees, best-rated first: Alpine Audio GmbH at 4.8, Midwest Hardware Co at 4.4, Andes Naturals at 4.0 and Pacific Textiles at 3.9. The real video shelf is thin — 4K Webcam Pro under Nordic Gadgets and Ring Light under Shenzhen Electro — so four of six vendors, including the two best-rated on the file, hold none of it. The blank-row test is doing the work: kept rows with no video match read NULL in the catalog's price column, and that is the only place the emptiness shows. Swap the test to IS NOT NULL and the page prints the two vendors who DO supply video — the complement, and the QBR would argue against itself.",
  },
  {
    id: "cs-427",
    tier: "medium",
    topic: "l12",
    universe: "expense",
    title: "The row the materiality line keeps",
    brief:
      "From: Ops finance, spend review. Re: where the materiality test lives.\n\nThe spend review counts bookings above 1,000, and the build keeps every account — the materiality test sits inside the reunion condition so accounts with nothing material keep a seat. Move the test to the row filter and the seats die, and the two counters on the summary row are how the review proves which build it got. Both numbers go in the pack.",
    ask: "Two counts on one row: accounts kept versus bookings above 1,000, blanks counted in the first.",
    template: `SELECT {1} AS kept, {2} AS matched
FROM customers c
{3} JOIN orders o ON o.customer_id = c.id {4} o.total > {5};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the kept-seats counter",
        why: "The build keeps every account, so the first number counts rows including the fifteen blanks — that is COUNT(*). It is the only counter that sees the seats the materiality line preserved.",
      },
      {
        answer: "COUNT(o.id)",
        kind: "keyword",
        label: "the matched-ticket counter",
        why: "Material bookings carry booking numbers; blank seats do not, and COUNT(o.id) skips them. COUNT(*) in this column would copy the kept figure across and erase the gap the pack is built to show.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The blank seats exist only if the LEFT flavor keeps unmatched account rows. The inner flavor deletes them before counting and both counters collapse to the matched count with no story left.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the test's home inside the reunion",
        why: "Inside the reunion condition the materiality test only decides which bookings attach — a failed test still leaves the account row, blank. Moved to the row filter, the test judges whole rows and the blank seats die.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the materiality line",
        why: "The review's materiality line is 1,000 — under it, tickets are noise by definition. Lowering it to 800 pulls three more real tickets into the matched column and the pack's one-ticket headline dissolves.",
      },
    ],
    distractors: ["INNER", "WHERE", "800", "o.city"],
    walkthrough:
      "One row, two numbers: 16 kept, 1 matched. The single real booking is Farid Nasser's 1,088.44 — the file's only four-figure ticket — and the other fifteen seats are accounts with nothing above the line, preserved because the test lives inside the reunion condition. Slide the test into the row filter and the count falls to 1: the blank seats' totals read NULL, NULL fails any comparison, and the whole register dies with them. Lower the line to 800 and the matched column climbs to 4 — Chloe Dubois's 945.21, Emma Wilson's 845.92 and Grace Kim's 826.03 join — which is exactly the sensitivity the pack footnotes when it defends the 1,000 line.",
  },
  {
    id: "cs-428",
    tier: "medium",
    topic: "l12",
    universe: "growth",
    title: "Twenty-two rows, fourteen tickets, eight accounts",
    brief:
      "From: Chief of Staff. Re: board deck, the open-book slide.\n\nThe open-book slide needs three honest numbers from one build: how many rows the account register keeps against pending tickets, how many tickets are actually matched, and how many distinct accounts hold them. The gaps between the three numbers are the ghost story, and the footnote walks the board through every gap.",
    ask: "Three counts on one row: kept rows, matched pending tickets, and distinct accounts holding them.",
    template: `SELECT {1} AS kept, {2} AS tickets, {3} AS accounts
FROM customers c
{4} JOIN orders o ON o.customer_id = c.id AND o.status = {5};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the kept-rows counter",
        why: "The slide keeps every account row, blanks included — only COUNT(*) counts them. The kept figure is deliberately the biggest of the three so the footnote has gaps to explain.",
      },
      {
        answer: "COUNT(o.id)",
        kind: "keyword",
        label: "the matched-tickets counter",
        why: "Pending tickets carry booking numbers and blank rows do not, so COUNT(o.id) counts only real tickets. COUNT(*) here would copy the kept figure and erase the first gap.",
      },
      {
        answer: "COUNT(DISTINCT o.customer_id)",
        kind: "keyword",
        label: "the distinct-accounts counter",
        why: "Several tickets share an account, so the third number counts distinct account pointers on matched tickets. COUNT(DISTINCT c.id) would print sixteen — every seat, matched or not — and flatten the exposure story.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The ghost rows are the slide's whole story, and only the LEFT flavor keeps them alive to be counted. The inner flavor deletes them and the first counter would drop to the matched count.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "The open book is the exact text 'pending', quoted and lowercase. 'shipped' would rebuild the slide on in-transit tickets — a 36, 30, 10 row — and the footnote would defend a different pile.",
      },
    ],
    distractors: ["COUNT(DISTINCT c.id)", "AVG(o.total)", "INNER", "'shipped'"],
    walkthrough:
      "One row, three numbers: 22 kept, 14 tickets, 8 accounts. The first gap is eight ghost rows — Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer and Olivia Brown, the accounts with nothing pending. The second gap is concentration: fourteen tickets over eight accounts, with Emma Wilson holding three worth 1,471.43 together, Alice Chen three worth 788.83, and Chloe Dubois two worth 1,309.92 — Farid, Pedro, Grace and Keiko hold one each. The distinct pointer is what makes the third number honest: count the register's own ids instead and the slide prints 16 accounts, claiming exposure for eight accounts that have none.",
  },
  {
    id: "cs-429",
    tier: "hard",
    topic: "l12",
    universe: "fraud",
    title: "The big-ticket chain, ghosts attached",
    brief:
      "From: Risk team, spot-check rotation. Re: the big-ticket line audit.\n\nThe rotation's deep-dive pulls every line behind any booking above 800 — and keeps an empty seat for every account with nothing on the list, so the packet shows exposure and cleanliness side by side. Account, region, booking amount and line number attached, biggest booking first, and the chain must keep the left side at both hops.",
    ask: "Account, region, booking total and line id for every line under bookings above 800, clean accounts kept — biggest first.",
    template: `SELECT c.name, c.region, o.total, oi.id AS line_id
FROM customers c
{1} JOIN orders o ON {2} = c.id AND o.total > {3}
LEFT JOIN order_items oi ON {4} = o.id
ORDER BY o.total DESC, oi.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join at the first hop",
        why: "Accounts with no big ticket must survive the first hop as blank rows — the packet's clean column. The inner flavor deletes twelve accounts before the chain even reaches the lines, and the second hop keeps its own left side so the seats reach the printed lines.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Bookings reach accounts through customer_id — the chain's first thread. The booking's own number against account numbers pairs the wrong rows and the audit packet would cite bookings that belong to other files.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the big-ticket line",
        why: "Big ticket means above 800 — the threshold lives in the reunion condition, not in a printed cell. Dropping it to 700 adds six more bookings to the chain and the packet's four-ticket story dissolves.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines point back at their booking through order_id — the chain's second thread. The line's own number against booking numbers pairs the wrong lines to the wrong tickets and fabricates the packet.",
      },
    ],
    distractors: ["INNER", "o.id", "oi.id", "700"],
    walkthrough:
      "Twenty-seven rows: fifteen real lines behind four big tickets, plus twelve blank accounts. The tickets — Farid Nasser's 1,088.44 with three lines, Chloe Dubois's 945.21 with four, Emma Wilson's 845.92 with four, Grace Kim's 826.03 with four — are the rotation's entire big-ticket exposure, and all four tickets are pending or shipped, nothing landed. The twelve blanks are the clean column: every account not on the list keeps a visible seat with NULLs across the booking and line columns, and that only happens because both hops keep the left side. Make the second hop an inner reunion and the seats die — fifteen rows, clean accounts unprovable. Drop the line to 700 and six more bookings join the chain, which is how the packet shows the threshold's own sensitivity.",
  },
  {
    id: "cs-430",
    tier: "hard",
    topic: "l12",
    universe: "catalog",
    title: "Premium lines, priced off the list",
    brief:
      "From: Catalog content manager. Re: list-price drift audit, the premium cut.\n\nList prices drift from what lines actually sell for, and the premium cut wants every line that sold above 100 against the full catalog — products with no premium line keep a blank row, because the drift story needs the items that never cross the line named alongside the ones that do. Line number and realized price attached, priciest list first.",
    ask: "Product, list price, line id and realized price for every line sold above 100, blank rows kept — priciest list first.",
    template: `SELECT p.name, p.price, oi.id AS line_id, oi.unit_price
FROM products p
{1} JOIN order_items oi ON {2} = p.id AND oi.unit_price > {3}
ORDER BY p.price DESC, oi.unit_price DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps the quiet shelf",
        why: "Products whose lines never cross 100 must keep their catalog rows with blank line columns — the cut names them. The inner flavor drops twelve products and the audit would read like every item sells premium.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's product pointer",
        why: "Lines point at their product through product_id — the audit's thread from the sales ledger to the catalog. The line's own number against product numbers pairs the wrong lines and the drift audit would misprice the shelf.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "Premium means the line realized above 100 — the threshold lives in the reunion condition, not in a printed cell. Raising it to 150 collapses the club to two products and the audit loses the mid-premium story.",
      },
    ],
    distractors: ["INNER", "p.product_id", "oi.id", "150"],
    walkthrough:
      "Eighty rows: sixty-eight premium lines behind a club of four products, plus twelve blank catalog rows for everything that never crossed the line. Smart Watch S leads with eleven lines realizing 193.51 to 209.68 around a 199.99 list — the drift runs both directions, which is the audit's headline. Noise-Canceling Headset follows with twenty-four lines from 142.63 to 157.40, then 4K Webcam Pro with seventeen and Studio Desktop Mic with sixteen. The blank rows close the sheet, and the pointed one is Mechanical Keyboard K1: fifteen lines sold, every one of them under 100, a real seller with no premium presence. Raise the line to 150 and only the watch and headset survive — the two-product extreme the audit quotes when it argues the drift's width.",
  },
  {
    id: "cs-431",
    tier: "hard",
    topic: "l12",
    universe: "month-close",
    title: "The delivered binder at line grain",
    brief:
      "From: Controller. Re: month-end close, the delivered binder's line annex.\n\nThe binder's delivered annex goes to line grain: every account, their delivered bookings, and the lines behind those bookings — with an empty seat kept for the one account the delivered pile never touches, because the binder documents absence as well as activity. Account, booking number and line number, filed by account then booking.",
    ask: "Account, booking id and line id for every delivered line, accounts with none kept — filed by account.",
    template: `SELECT c.name, o.id AS booking_id, oi.id AS line_id
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
LEFT JOIN order_items oi ON {3} = o.id
ORDER BY c.name, o.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The annex promises every account, so the one with no delivered booking must survive the first hop as a blank row — and the second hop keeps its own left side so the seat reaches the printed lines. An inner reunion at either hop deletes him and the binder silently claims a complete completed-base.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the landed status",
        why: "The annex is the delivered pile: the exact text 'delivered', quoted and lowercase. 'shipped' would rebuild it on in-transit tickets — a different pile with six ghosts — and the binder's page would misfile the quarter.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines attach to bookings through order_id — the annex's second thread. The line's own number against booking numbers pairs the wrong lines and the binder would cite bookings behind lines that never touched them.",
      },
    ],
    distractors: ["INNER", "'shipped'", "o.customer_id", "oi.id"],
    walkthrough:
      "One hundred twenty rows: 119 delivered lines plus a single blank seat. The blank belongs to Liam O'Brien — his only booking is the 705.39 Cork ticket, still shipped, so against the delivered pile his account prints one row with no booking number and no lines attached. That row is the binder's integrity check: fifteen accounts with delivered lines behind them, one account preserved in absence, and the count only reconciles because both hops keep the left side. Make either hop an inner reunion and the annex prints 119 — clean-looking, and quietly missing the one account the close team is supposed to be able to vouch for. The 120-versus-119 pair is how the close binder proves its own preservation.",
  },
  {
    id: "cs-432",
    tier: "hard",
    topic: "l12",
    universe: "refund-audit",
    title: "Cancellation money, blanks on the books",
    brief:
      "From: refunds@ — quarterly review. Re: cancellation money by account.\n\nThe review's money page lists cancellation value per account with blanks preserved — an account that never cancelled prints the register's own word for nothing, not a zero, because the review refuses to round absence into a refund figure. Biggest value first, and the page has to reconcile to the queue's total when the real rows are added.",
    ask: "Account and cancellation value per account, blank rows preserved, biggest value first.",
    template: `SELECT c.name, {1} AS cancelled_value
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3}
GROUP BY c.name
ORDER BY cancelled_value DESC;`,
    slots: [
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the cancellation-value column",
        why: "The page is money, so the column adds cancelled totals per account — and for an account with no cancellations, SUM prints NULL, the honest empty mark. A counter would print a ticket tally where the review wants a value.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that keeps clean accounts",
        why: "Twelve accounts never cancelled, and they only reach the page if their blank rows survive the reunion. The inner flavor deletes them and the money page would list four accounts as if the base had four.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The money page prices the exact text 'cancelled', quoted and lowercase. 'shipped' would price in-transit tickets instead and the quarterly review would argue over money that is still moving.",
      },
    ],
    distractors: ["COUNT(o.total)", "AVG(o.total)", "'shipped'", "INNER"],
    walkthrough:
      "Sixteen rows, four of them real: Alice Chen's 494.82 — her 206.19, 152.52 and 136.11 tickets re-added — then Keiko Sato's 397.99, Emma Wilson's 143.86 and Maya Patel's 115.82. The other twelve rows print NULL: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Grace Kim, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown and Pedro Alvarez never cancelled anything, and SUM over their all-ghost buckets refuses to invent a zero. The four real figures re-add to the file's 1,152.49 cancellation book, with Alice alone carrying close to half. A counter would have printed twelve tidy zeros and the page would have read like twelve good-news rows; the NULL column keeps the review honest about what it does not know.",
  },
  {
    id: "cs-433",
    tier: "hard",
    topic: "l12",
    universe: "pricing",
    title: "The unbadged eleven",
    brief:
      "From: Pricing analyst. Re: the repricing deck's badge gap list.\n\nThe repricing deck badges items whose vendor rates 4.5 or better, and the gap list is the complement: every item the badge pass misses, with the vendor columns empty in the build and the item's own price leading the sort. The priciest unbadged item is the deck's opening exhibit, so the list has to surface it first.",
    ask: "Product, price, vendor and rating for every item whose vendor rates under 4.5 — priciest first.",
    template: `SELECT p.name, p.price, s.name AS vendor, s.rating
FROM products p
{1} JOIN suppliers s ON p.supplier_id = s.id AND s.rating >= {2}
WHERE {3} IS {4}
ORDER BY p.price DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the join that builds the gap",
        why: "The gap list exists because items whose vendor misses the bar keep their rows with blank vendor columns — the LEFT flavor's move. The inner flavor matches nothing to nothing and the gap list would print empty.",
      },
      {
        answer: "4.5",
        kind: "number",
        noVerify: true,
        label: "the badge bar",
        why: "The badge bar is a rating of 4.5 or better — the threshold lives in the reunion condition, not in a printed cell. Raising it to 4.7 widens the gap list to fourteen items and the deck's eleven-item exhibit breaks.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor-side probe",
        why: "On a kept row with no qualifying vendor, every vendor-file column reads NULL — including the vendor's own id, which is never NULL on a matched row. That makes it a clean test for exactly the gap rows.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-match test",
        why: "The gap is a kept row whose vendor side came up empty, and IS NULL is the test that finds those rows. IS NOT NULL would flip the list to the five badged items and the deck would argue against itself.",
      },
    ],
    distractors: ["INNER", "4.7", "p.price", "NOT NULL"],
    walkthrough:
      "Eleven rows, led by the deck's exhibit: Noise-Canceling Headset at 149.99 — the catalog's second-priciest item, unbadged because Midwest Hardware rates 4.4 and misses the bar by a tenth. Then Fitness Band at 79.00, Cycling Jersey at 65.00, Bluetooth Speaker at 59.99, USB-C Hub at 49.00, Laptop Stand at 42.50, Ring Light at 39.99, Wireless Mouse at 34.50, Yoga Mat at 32.00, Running Socks at 18.50 and HDMI Cable at 14.99. The missing vendors are Midwest, Shenzhen, Pacific and Andes — every badge on the shelf belongs to Nordic or Alpine. Raise the bar to 4.7 and the gap list grows to fourteen: only Alpine's 4.8 and Nordic's 4.6 survive, which is the sensitivity the deck footnotes when it defends the 4.5 line.",
  },
  {
    id: "cs-434",
    tier: "hard",
    topic: "l12",
    universe: "inventory",
    title: "One vendor with nothing thin",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: the thin-shelf movement pack.\n\nThe movement pack pairs two counts per vendor against shelves under 150 units: rows kept and lines moved behind those shelves. A vendor with nothing under the line must print kept-one-moved-zero, because the pack documents quiet vendors rather than dropping them — and this quarter, exactly one vendor lands on that row. Biggest movement first.",
    ask: "Vendor, kept rows and moved lines per vendor against shelves under 150 units — zeros visible, biggest movement first.",
    template: `SELECT s.name, {1} AS kept, {2} AS moved
FROM suppliers s
{3} JOIN products p ON p.supplier_id = s.id AND p.stock < {4}
LEFT JOIN order_items oi ON {5} = p.id
GROUP BY s.name
ORDER BY moved DESC, s.name;`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the kept-rows counter",
        why: "Kept rows include a vendor's blank row when nothing matches the 150 line, and only COUNT(*) counts it — that is what keeps the quiet vendor visible in the pack at all.",
      },
      {
        answer: "COUNT(oi.id)",
        kind: "keyword",
        label: "the moved-lines counter",
        why: "Moved lines carry line numbers and blank rows do not, so COUNT(oi.id) separates real movement from kept blanks. COUNT(*) would copy the kept figure into the moved column and hide the zero.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The quiet vendor's row exists only if the first hop keeps it despite no thin shelf — the LEFT flavor's job — and the second hop keeps its own left side so the blank reaches the line counts. The inner flavor deletes the vendor and the pack reads five vendors on a six-vendor file.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the thin-shelf line",
        why: "Thin means under 150 units — the threshold lives in the reunion condition, not in a printed cell. Tightening it to 45 leaves the watch alone on Nordic's row and the pack's movement story collapses.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's product pointer",
        why: "Lines point at their product through product_id — the pack's thread from the sales ledger to the shelves. The line's own number against product numbers pairs the wrong lines and every vendor's movement count would lie.",
      },
    ],
    distractors: ["INNER", "45", "oi.id", "s.stock"],
    walkthrough:
      "Six rows, five of them pairs: Nordic Gadgets 43 kept and 43 moved — Keyboard's 15 lines, Webcam's 17 and Watch's 11 — then Midwest 24 and 24 behind the Headset, Pacific 21 and 21 behind the Hub and Jersey, Alpine 16 and 16 behind the Mic, Andes 14 and 14 behind the Band. The exception is Shenzhen Electro: kept 1, moved 0 — nothing on its shelves sits under 150, its shallowest shelf being the Ring Light at exactly 150, one unit above the line. That lone one-and-zero row is the pack's discipline point: 119 kept rows against 118 moved lines, the difference being a vendor documented in absence. Make the second hop an inner reunion and Shenzhen's row dies, and the pack would read five vendors with no trace of the sixth.",
  },
];
