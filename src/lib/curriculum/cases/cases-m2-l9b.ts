// Case batch M2-L9b — topic l9 (First joins), ids cs-319…cs-335.
// First two-table reunions: orders⋈customers and products⋈suppliers with
// plain WHERE filters. Every figure is audited against the live seed db by
// scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L9b: CaseStudy[] = [
  {
    id: "cs-319",
    tier: "easy",
    topic: "l9",
    universe: "fraud",
    title: "The one-and-done account behind booking 20",
    brief:
      "From: Risk team, spot-check rotation. Re: single-booking accounts.\n\nThe rotation flags accounts whose entire history is one booking, and booking 20 is on this month's list. Before the reviewer opens the file I need the record with a name attached: booking id, account holder, amount, and where it sits in fulfillment — stored figures only, no retyping.",
    ask: "Booking id, account holder's name, total and status for booking 20 — one row.",
    template: `SELECT o.id, c.name, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.id = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The review needs the person behind the booking, and customer_id is the pointer from the booking to the account register. The booking's own id would match against account numbers and fabricate sixteen fake pairs.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling errors out before the review packet exists.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the booking number",
        why: "The rotation cites booking 20 — a 705.39 shipped ticket. Booking 21 is Alice Chen's cancelled 136.11 line and would put a different account's paper in front of the reviewer.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "21", "c.total"],
    walkthrough:
      "Single-booking accounts get a name the moment the two registers are reunited: o.customer_id = c.id, filtered to booking 20. The packet reads: booking 20, Liam O'Brien, 705.39, shipped. That closes the flag's biggest question — the account behind the booking is a real, active Cork contact, and the ticket is in transit, not stranded. The 'one-and-done' shape is the interesting part: Liam's file holds exactly this one booking worth 705.39, a substantial first-and-only order. For the rotation that's a note, not a alarm — a clean shipped ticket from an active account — but the pattern is worth watching, because a single big order with no history is precisely the profile the rotation exists to eyeball before fulfillment completes.",
  },
  {
    id: "cs-320",
    tier: "easy",
    topic: "l9",
    universe: "catalog",
    title: "The LATAM vendor's shelf",
    brief:
      "From: Catalog content manager. Re: regional sourcing page.\n\nThe sourcing page is adding a LATAM section and I need its shelf: every product we buy from LATAM-region vendors, with the vendor name and list price as registered. If the section is only one vendor deep, the page says so — better than padding it with items that don't qualify.",
    ask: "Product name, vendor name and list price for every product sourced from a LATAM-region vendor.",
    template: `SELECT p.name, s.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.region = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Sourcing is the catalog's supplier_id pointer to the vendor file. The product's own id against vendor ids would fabricate six pairs and stock the LATAM section with items from the wrong hemisphere.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id column of their own, so that guess breaks the query before the section fills.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the region value",
        why: "The section is the quoted text 'LATAM', exact and case-sensitive. 'latam' in lowercase matches nothing — text comparisons don't forgive case — and the page would print empty.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "'APAC'", "'latam'"],
    walkthrough:
      "A regional sourcing page is one filter on the vendor side of a reunion: region 'LATAM', joined through supplier_id = s.id. Two rows come back, both from the same vendor: Bluetooth Speaker Mini at 59.99 and Fitness Band X2 at 79, both sourced from Andes Naturals SA. So the LATAM section is exactly one vendor deep — Andes is the only LATAM supplier on the file, and both of the region's items are theirs. That's a cleaner page than a padded one, and it carries a real point for the narrative: Andes holds a 4.0 rating and their two lines span audio and wearables, so the 'LATAM sourcing story' is really an 'Andes Naturals story'. The lowercase trap is worth a line in the content notes — 'latam' would have quietly produced an empty section and the page would have shipped blank.",
  },
  {
    id: "cs-321",
    tier: "easy",
    topic: "l9",
    universe: "month-close",
    title: "The delivered pile, named",
    brief:
      "From: Controller. Re: month-end close, revenue support schedule.\n\nThe revenue support schedule starts from the delivered pile — completed bookings only, with the account name on each line. Booking number, account, amount. It's a long list and that's fine; the schedule needs the full completed base, not a sample.",
    ask: "Booking id, account name and total for every delivered booking.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Names attach to bookings only through the customer_id pointer to the account register. The booking's own id against account ids would fabricate sixteen phantom lines on a schedule that has to reconcile.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that spelling errors before the schedule exists.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The completed base is the quoted text 'delivered', lowercase and exact. 'Delivered' capitalized matches nothing — the schedule would come back empty and the close would stall on a typo.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Delivered'", "'cancelled'"],
    walkthrough:
      "The schedule's foundation is a status slice on a reunion: 'delivered' bookings, names attached through customer_id = c.id. Fifty-two rows come back — the completed base of the whole ledger, more than half of the 103 bookings on file. Scanning the top of the list, Alice Chen's name recurs again and again, which tracks with her standing as the file's biggest spender at 7,262.35 across 24 bookings. Two discipline points the schedule depends on. First, the pile is exactly the delivered pile — the 30 shipped and 14 pending bookings stay off it, because revenue support only counts what actually landed. Second, every line carries a real account name, so when an auditor samples the schedule, any line can be traced to a person in one step. That traceability is the entire point of attaching the register.",
  },
  {
    id: "cs-322",
    tier: "easy",
    topic: "l9",
    universe: "refund-audit",
    title: "The closed account with live paperwork",
    brief:
      "From: refunds@ — queue hygiene check. Re: dormant-account tickets.\n\nRefunds policy says closed accounts shouldn't still have tickets moving through the pipeline, and Keiko Sato's name came up in the wrap-up thread. Pull her full booking history — booking number, amount, status — so hygiene can see exactly what's still open on a closed account.",
    ask: "Booking id, total and status for every booking on Keiko Sato's account.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The history check gathers one account's bookings, and customer_id is the pointer that finds them. The booking's own id against account ids would invent a sixteen-row history that belongs to nobody.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling fails before the hygiene check starts.",
      },
      {
        answer: "'Keiko Sato'",
        kind: "keyword",
        label: "the account name",
        why: "The thread names the account — the exact quoted text 'Keiko Sato'. A typo like 'Kiko Sato' matches nobody and the check would report a clean file that was never examined.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Kiko Sato'", "'Dmitri Volkov'"],
    walkthrough:
      "The hygiene check is a name slice on a reunion: Keiko Sato's bookings, statuses attached, through customer_id = c.id. Four rows come back: booking 10 at 175.68 delivered, booking 73 at 375.93 delivered, booking 83 at 397.99 cancelled, and booking 94 at 149 pending. So the closed account still has one live ticket — booking 94, pending — plus the 397.99 cancellation the goodwill ledger is already signing off. That's the hygiene finding in one line: a dormant account with 1,098.60 of lifetime history, of which 149 is still in the pipeline. The quiet trap in this check is the name itself — 'Kiko Sato' would have matched zero rows and reported the account clean, which is exactly the failure mode a spot check exists to catch.",
  },
  {
    id: "cs-323",
    tier: "easy",
    topic: "l9",
    universe: "pricing",
    title: "The HDMI card, vendor attached",
    brief:
      "From: Head of Product. Re: pricing review, entry-level anchor.\n\nThe review's entry-level anchor is the HDMI cable, and the slide wants its full registered card: catalog number, name, list price, and the vendor behind it. One row, straight off the registers — when the room argues about the floor price, I read the card.",
    ask: "Catalog id, product name, price and vendor name for catalog item 9 — one card.",
    template: `SELECT p.id, p.name, p.price, s.name
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.id = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The card names the vendor, and the catalog points at the vendor file through supplier_id. The product's own id against vendor ids would fabricate a pair and attach the wrong vendor to the floor price.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The vendor file numbers its rows in id — where the pointer lands. There is no price column on the vendor file, so joining through price fails before the card prints.",
      },
      {
        answer: "9",
        kind: "number",
        label: "the catalog item number",
        why: "The anchor is item 9 — the HDMI 2.1 Cable at 14.99. Item 8 is the Ring Light at 39.99, a different price story, and the slide would anchor on the wrong rung.",
      },
    ],
    distractors: ["p.id", "s.stock", "8", "s.price"],
    walkthrough:
      "The floor-price card is a single-row reunion: supplier_id = s.id joins the two registers, item 9 pins the row. The card reads: 9, HDMI 2.1 Cable 2m, 14.99, Pacific Textiles. That's the entry-level anchor with provenance — the cheapest item in the catalog, sourced from an APAC vendor holding a 3.9 rating, the lowest scorecard on the file. Both facts are useful on one slide: the floor price frames where the pricing ladder starts, and the vendor note quietly flags that our cheapest SKU rides on our weakest-rated supplier. The card also settles the floor-price argument before it starts — all sixteen catalog prices are distinct, so 14.99 has no twin to confuse it with.",
  },
  {
    id: "cs-324",
    tier: "easy",
    topic: "l9",
    universe: "inventory",
    title: "Who supplies the Yoga Mat",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: vendor contact sheet.\n\nThe yoga mat bin failed its last cycle count and the recount needs the vendor contact line: the item's registered name, the vendor we buy it from, and the vendor's region so the sheet shows whether a shortfall means a domestic or overseas reorder.",
    ask: "Product name, vendor name and vendor region for the product registered as 'Yoga Mat Eco 6mm'.",
    template: `SELECT p.name, s.name, s.region
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.name = {3};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The contact sheet needs the vendor, and the catalog's supplier_id is the pointer to the vendor file. The product's own id against vendor ids would invent a pair and route the reorder to the wrong vendor.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors have no supplier_id column of their own, so that guess errors before the sheet prints.",
      },
      {
        answer: "'Yoga Mat Eco 6mm'",
        kind: "keyword",
        label: "the registered product name",
        why: "The catalog registers the item as the exact text 'Yoga Mat Eco 6mm', quotes included. A bare 'Yoga Mat' matches nothing — names match character for character or not at all.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "'Yoga Mat'", "'Fitness'"],
    walkthrough:
      "The contact line is a name lookup on a reunion: the item's full registered name, joined to the vendor file through supplier_id = s.id. One row comes back: Yoga Mat Eco 6mm, Midwest Hardware Co, region US. That's the whole contact decision made — a shortfall on this bin is a domestic reorder with the file's joint-second-rated vendor at 4.4, not an overseas wait. The registered name is the trap worth flagging for the sheet: 'Yoga Mat' alone matches nothing, because the catalog stores the full string 'Yoga Mat Eco 6mm'. Nicknames don't survive exact matching — which is exactly why the desk pulls cards by registered name only when it has the full string in front of it, and by item number when it doesn't.",
  },
  {
    id: "cs-325",
    tier: "medium",
    topic: "l9",
    universe: "funnel",
    title: "Emma Wilson's completed tickets",
    brief:
      "From: Growth marketing lead. Re: loyalty tier review.\n\nThe loyalty tier model counts completed bookings, not promises. For the file's second-biggest account I need the delivered slice: Emma Wilson's bookings that actually landed, with amounts. If the tier engine only sees a handful of completed tickets, the tier conversation changes.",
    ask: "Booking id and total for every delivered booking on Emma Wilson's account.",
    template: `SELECT o.id, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3} AND o.status = {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The tier review gathers one account's bookings, and customer_id is the pointer from booking to account. The booking's own id against account ids would fabricate sixteen bookings on a file that has seventeen.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the tier count exists.",
      },
      {
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the account name",
        why: "The tier review names the account — the exact quoted text 'Emma Wilson'. 'Jamal Wright' would build the tier case on a different person's history entirely.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The tier engine counts the quoted text 'delivered' only. 'shipped' would credit tickets still in the air, and the tier would be earned on bookings that might still cancel.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Jamal Wright'", "'shipped'"],
    walkthrough:
      "The completed slice is two filters on a reunion: 'Emma Wilson' on the account side, 'delivered' on the booking side, joined through customer_id = c.id. Four rows come back: booking 17 at 285.10, booking 33 at 624.66, booking 72 at 30.24, booking 85 at 262.89. That's the finding for the tier conversation: Austin's biggest account has exactly four completed tickets, and one of them is a 30.24 rounding error of an order. Her headline number — 6,640.56 across 17 bookings, second on the whole file — is mostly promise, not history: the delivered slice captures under a fifth of her lifetime spend. If the tier engine counts completions, Emma is not yet a top-tier account, and the review should say that with these four numbers rather than the headline she'd prefer.",
  },
  {
    id: "cs-326",
    tier: "medium",
    topic: "l9",
    universe: "supplier",
    title: "US-sourced shelves running deep",
    brief:
      "From: Supply-chain lead. Re: QBR pack, domestic sourcing page.\n\nThe domestic sourcing page wants the upside story: US-sourced items whose stock position is genuinely deep — above 100 units — with the vendor's rating beside each so the page can argue that domestic supply is both deep and well-scored.",
    ask: "Product name, stock and vendor rating for US-region vendor products with stock above 100.",
    template: `SELECT p.name, p.stock, s.rating
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE s.region = {3} AND p.stock > {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The page pairs each product with its vendor's rating, and the catalog reaches the vendor file only through supplier_id. The product's own id against vendor ids would invent pairs and misattribute the scorecard.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id of their own — that guess breaks the query and the page stays blank.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the vendor region",
        why: "The page is the domestic story: the quoted text 'US' on the vendor's region. 'EU' would stock the page with European-sourced lines and the domestic argument evaporates.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the deep-stock line",
        why: "'Genuinely deep' is defined as above 100 units — the page's own bar. At 50 the headline would include thin shelves and undercut the story it exists to tell.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "'EU'", "50"],
    walkthrough:
      "The upside story is a region filter with a depth bar: US vendors, stock above 100, rating attached through supplier_id = s.id. Two rows clear the bar: Laptop Stand Aluminum at 180 and Yoga Mat Eco 6mm at 220, both from Midwest Hardware Co at a 4.4 rating. So the domestic sourcing page is one vendor deep — and that's the strongest possible version of it: the single US vendor on the file holds both deep-stock lines and a joint-best 4.4 scorecard. The 50 trap is worth naming for the pack: at a 50 bar the Noise-Canceling Headset's 60 units would have made the page, and '60 units' undercuts a deep-stock headline. The bar at 100 is what keeps the page honest, and both surviving lines clear it by a wide margin.",
  },
  {
    id: "cs-327",
    tier: "medium",
    topic: "l9",
    universe: "expense",
    title: "The big-ticket ledger, ranked",
    brief:
      "From: Ops finance, spend review. Re: big-ticket annex.\n\nThe spend review's annex lists the ledger's big tickets — anything above 800 — with the account name on each line, biggest first. It's a short annex by design; if only a handful of bookings clear the bar, the annex says the spend is concentrated and shows where.",
    ask: "Booking id, account name and total for every booking above 800, biggest first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.total > {3}
ORDER BY o.total {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The annex names accounts, and bookings reach the register only through customer_id. The booking's own id against account ids would fabricate phantom tickets and break the annex's arithmetic.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that spelling errors before the annex exists.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the big-ticket line",
        why: "The annex's bar is 800 — the review's own definition of big-ticket. At 900 the annex would drop real big tickets and understate the concentration it exists to show.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending, so the annex opens on its headline number. ASC would bury the 1,088.44 ticket under the smaller lines and the concentration story lands last.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "900", "ASC"],
    walkthrough:
      "The annex is a bar and a rank on a reunion: totals above 800, ordered biggest-first, names attached through customer_id = c.id. Four tickets clear it: booking 74, Farid Nasser, 1,088.44; booking 43, Chloe Dubois, 945.21; booking 39, Emma Wilson, 845.92; booking 15, Grace Kim, 826.03. Four names, four cities, four accounts — the big-ticket book is a quarter of one percent of bookings by count, spread across the whole customer base, and led by the ledger's single biggest line. That's the annex's concentration argument in its strongest form: no account owns the top of the ledger, but every name on it is a top-five spender on the file. The 900 trap matters here — raising the bar would have dropped Emma and Grace and made the annex look like a two-ticket story, which the record contradicts.",
  },
  {
    id: "cs-328",
    tier: "medium",
    topic: "l9",
    universe: "growth",
    title: "The live EU book, line by line",
    brief:
      "From: Chief of Staff. Re: board deck, regional appendix.\n\nThe appendix needs the live EU book: bookings from active EU accounts only — the dormant Tallinn account's history stays off the slide. Booking id, account name, amount. The appendix count has to match what finance reports, and finance reports live accounts only.",
    ask: "Booking id, account name and total for every booking from active EU-region accounts.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.region = {3} AND c.active = {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The appendix pairs each booking with its account, and customer_id is the only thread between the two registers. The booking's own id against account ids would fabricate sixteen phantom lines.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The pointer lands on the register's id column. The register has no customer_id of its own — that guess errors before the appendix has rows.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region value",
        why: "The slide is the EU story: the quoted text 'EU' on the account's region. 'APAC' would build the appendix from the wrong continent and the deck's regional math breaks.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "Live accounts are flagged 1 for active and 0 for closed — the appendix reports the live book, so the filter is active = 1. Using 0 would report exactly the dormant history the slide must exclude.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'APAC'", "0"],
    walkthrough:
      "The live book is two filters on the account side of a reunion: region 'EU', active flag 1, joined through customer_id = c.id. Forty-three rows come back — the entire booking history of the seven live EU accounts, Alice Chen's Berlin file dominating it as usual. The flag is the whole point of the slide: the EU region holds eight accounts and 45 bookings in total, but Dmitri Volkov's Tallinn account is flagged inactive, and his two bookings belong to the dormant history, not the live book. That's the difference between the region's raw 45 and the appendix's 43 — a two-booking gap that would have surfaced as a reconciliation embarrassment if the flag had been skipped. Finance reports live accounts; the deck now matches them line for line.",
  },
  {
    id: "cs-329",
    tier: "medium",
    topic: "l9",
    universe: "fraud",
    title: "The ticket over a thousand",
    brief:
      "From: Risk team, spot-check rotation. Re: high-value ticket review.\n\nAnything above 1,000 goes to manual review before fulfillment, and this cycle's list comes from the Dubai account. I need Farid Nasser's bookings above that line — booking number, amount, status — stored figures, because the review packet gets filed against the record.",
    ask: "Booking id, total and status for Farid Nasser's bookings with totals above 1000.",
    template: `SELECT o.id, o.total, o.status
FROM orders o
JOIN customers c ON {1} = {2}
WHERE c.name = {3} AND o.total > {4};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "The review gathers one account's tickets, and customer_id is the pointer from each booking to its account. The booking's own id against account ids would invent a sixteen-ticket file that doesn't exist.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id — the pointer's landing column. The register has no customer_id of its own, so that spelling fails before the packet exists.",
      },
      {
        answer: "'Farid Nasser'",
        kind: "keyword",
        label: "the account name",
        why: "The rotation names the account — the exact quoted text 'Farid Nasser'. A misspelled 'Farid Nasir' matches nobody and the packet would review an empty file while the real ticket ships.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the review threshold",
        why: "Manual review is required above 1,000 — the policy line itself. It's the filter's threshold, not a figure the packet prints, and lowering it floods the rotation with small tickets.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'Farid Nasir'", "300"],
    walkthrough:
      "The review packet is a threshold inside an account slice: Farid Nasser, totals above 1,000, reunited through customer_id = c.id. Exactly one ticket clears it: booking 74, 1,088.44, pending. That's the ledger's largest booking and the only four-figure line on the file — it sits at the Dubai account, it hasn't shipped, and it's now flagged for manual review before fulfillment. Context that sharpens the packet: Farid's full history is three bookings worth 1,458.97, so this single ticket is about three-quarters of the account's lifetime value — a first-cycle account concentrating almost everything in one high-value order. The misspelling trap matters most here: 'Farid Nasir' returns nothing, and the policy's whole point — eyes on the big ticket before it leaves the building — silently fails.",
  },
  {
    id: "cs-330",
    tier: "medium",
    topic: "l9",
    universe: "catalog",
    title: "Audio from Europe, one line",
    brief:
      "From: Catalog content manager. Re: sourcing page, audio section.\n\nThe sourcing page's audio section needs the EU-sourced line: audio products whose vendor sits in the EU region, with the vendor name and region quoted. If the section is a single line, print the single line — the page doesn't pad.",
    ask: "Product name, vendor name and vendor region for every Audio product sourced from an EU-region vendor.",
    template: `SELECT p.name, s.name, s.region
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.category = {3} AND s.region = {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Sourcing comes from the catalog's supplier_id pointer to the vendor file. The product's own id against vendor ids would fabricate pairs and stock the section with invented sourcing.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id column of their own, so that guess breaks the query before the section fills.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf label",
        why: "The section is the quoted text 'Audio', exact and case-sensitive. 'Video' would put a webcam on the audio page and the sourcing claim fails its audit.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the vendor region",
        why: "The sourcing claim is the quoted text 'EU' on the vendor's region. 'US' would move an American headset onto a European sourcing page — the exact error the page exists to prevent.",
      },
    ],
    distractors: ["s.supplier_id", "'Video'", "'US'"],
    walkthrough:
      "The sourcing claim is two exact filters on a reunion: shelf 'Audio', vendor region 'EU', joined through supplier_id = s.id. One row comes back: Studio Desktop Mic, Alpine Audio GmbH, EU. That's the entire European audio sourcing story — one vendor, one product. The other two audio lines fail the filter for clear reasons: the Noise-Canceling Headset is Midwest Hardware Co in the US region, and the Bluetooth Speaker Mini is Andes Naturals in LATAM. So the page prints one honest line, and it's a good one — Alpine holds the file's best vendor rating at 4.8, and the Studio Mic has run 3,589.61 in lifetime line revenue. A single-line section with a top-rated vendor beats a padded one, and the two 'wrong region' rows are exactly what the filters exist to keep off the page.",
  },
  {
    id: "cs-331",
    tier: "hard",
    topic: "l9",
    universe: "month-close",
    title: "The pending podium for the close memo",
    brief:
      "From: Controller. Re: month-end close, open-items narrative.\n\nThe close memo's narrative opens on the pending podium: the four biggest open bookings, biggest first, names attached. Four lines only — the memo's format is fixed, and the podium must show where the open book's weight actually sits.",
    ask: "Booking id, account name and total for the 4 largest pending bookings, biggest first.",
    template: `SELECT o.id, c.name, o.total
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
        why: "The podium attaches names, and bookings reach the account register only through customer_id. The booking's own id against account ids would fabricate sixteen fake podium lines.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that spelling errors before the memo exists.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "The podium is the open book: the quoted text 'pending', lowercase and exact. 'cancelled' would podium seven dead tickets and the close memo would chase revenue that was never collected.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending — the memo opens on its headline exposure. ASC would lead with the smallest open ticket and bury the 1,088.44 line at the bottom.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The memo's format holds exactly four lines, so the cut is 4. Two is a headline without depth; six floods the format and dilutes the concentration story.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'cancelled'", "ASC", "2"],
    walkthrough:
      "The podium is a status slice with a ranked cut: pending bookings, ordered biggest-first, sliced at four, names attached through customer_id = c.id. The lines that land: booking 74, Farid Nasser, 1,088.44; booking 43, Chloe Dubois, 945.21; booking 5, Emma Wilson, 725.34; booking 97, Emma Wilson, 585.79. Read as a memo, that's the open book's weight in four names — Dubai's single giant ticket, Lyon's 945.21, and Austin twice. Two of the four podium lines belong to one account, and the top line is worth more than the bottom two combined. That concentration sentence is why the podium exists, and the direction flip is its silent killer: ascending would open the memo on the 585.79 line and let the four-figure exposure arrive unannounced at the bottom of the page.",
  },
  {
    id: "cs-332",
    tier: "hard",
    topic: "l9",
    universe: "refund-audit",
    title: "The smallest cancellations, first",
    brief:
      "From: refunds@ — weekly queue review. Re: goodwill floor analysis.\n\nThe goodwill policy review needs the floor of the cancellation queue: the three smallest cancelled bookings, smallest first, with account names. The floor is where the auto-approve threshold should sit — if the smallest cancellations are trivial, the threshold moves up.",
    ask: "Booking id, account name and total for the 3 smallest cancelled bookings, smallest first.",
    template: `SELECT o.id, c.name, o.total
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
        why: "The floor analysis names accounts, and bookings reach the register only through customer_id. The booking's own id against account ids would fabricate pairs and pollute a threshold decision with fake rows.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the analysis exists.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is the quoted text 'cancelled', lowercase and exact. 'delivered' would analyze completed bookings as cancellations and the goodwill threshold would be set from the wrong pile entirely.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Smallest first is ascending — the analysis wants the floor of the queue. DESC would deliver the ceiling, the 397.99 ticket, which the goodwill ledger already knows by heart.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the sample size",
        why: "The threshold review reads a three-line floor sample, so the cut is 3. Six lines would be the whole queue, and the review asked for the floor, not a reprint of it.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'delivered'", "DESC", "6"],
    walkthrough:
      "The floor sample is a status slice ranked from the bottom: cancelled bookings, ascending, sliced at three, names attached through customer_id = c.id. The lines that land: booking 51, Maya Patel, 25.47; booking 50, Maya Patel, 90.35; booking 21, Alice Chen, 136.11. Two of the three smallest cancellations belong to one Mumbai account, and the floor of the queue starts at 25.47 — barely a rounding error. That's the threshold argument in one breath: the queue's floor is trivial, so an auto-approve line set at 100 clears exactly these two Maya tickets plus Alice's 136.11 and Emma's 143.86, leaving the big goodwill calls — Keiko's 397.99, Alice's 206.19 — for human sign-off. The direction flip is the failure mode: descending would hand the review the ceiling and the threshold debate would start from the wrong end of the queue.",
  },
  {
    id: "cs-333",
    tier: "hard",
    topic: "l9",
    universe: "pricing",
    title: "The catalog's premium five, vendor-attached",
    brief:
      "From: Head of Product. Re: pricing reset, opening slide.\n\nThe reset's opening slide carries the catalog's premium five: the five most expensive items, priciest first, each with the vendor behind it. Design drops these straight onto the slide — if a bargain item sneaks into the five, the reset's whole framing misfires.",
    ask: "Product name, vendor name and price for the 5 most expensive products, priciest first.",
    template: `SELECT p.name, s.name, p.price
FROM products p
JOIN suppliers s ON {1} = {2}
ORDER BY p.price {3}
LIMIT {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "The slide names each vendor, and the catalog reaches the vendor file only through supplier_id. The product's own id against vendor ids would fabricate pairs and credit the wrong suppliers on the opening slide.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors have no supplier_id of their own — that guess errors before the slide exists.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Priciest first is descending. ASC would open the reset with the 14.99 HDMI cable as the catalog's anchor — the exact opposite of the premium framing the slide needs.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the slide's line count",
        why: "The opening slide carries exactly five lines, so the cut is 5. Ten doubles the slide; three loses two premium lines the story needs.",
      },
    ],
    distractors: ["p.id", "s.supplier_id", "ASC", "10", "15"],
    walkthrough:
      "The opening slide is a rank and a cut over the whole catalog, vendors attached: prices descending, sliced at five, joined through supplier_id = s.id. The five that land: Smart Watch S at 199.99 (Nordic Gadgets AB), Noise-Canceling Headset at 149.99 (Midwest Hardware Co), 4K Webcam Pro at 129 (Nordic Gadgets AB), Studio Desktop Mic at 119 (Alpine Audio GmbH), Mechanical Keyboard K1 at 89.99 (Nordic Gadgets AB). Nordic owns half the premium shelf — three of five lines — which is a supplier-concentration fact the reset should say out loud. The sixth product, the Fitness Band at 79, misses the cut by eleven dollars, so the boundary is clean. And the direction flip is the whole slide: ascending would anchor the premium story on the 14.99 cable and the reset would open with the bargain bin.",
  },
  {
    id: "cs-334",
    tier: "hard",
    topic: "l9",
    universe: "inventory",
    title: "The restock watchlist, thinnest three",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: Friday replenishment run.\n\nThe watchlist is anything under 100 units, but Friday's run only absorbs the three thinnest shelves, thinnest first, with the vendor named so the buy orders know where to go. Anything the run can't reach stays on the list for next week.",
    ask: "Product name, stock and vendor name for the 3 lowest-stock products under 100 units, thinnest first.",
    template: `SELECT p.name, p.stock, s.name
FROM products p
JOIN suppliers s ON {1} = {2}
WHERE p.stock < {3}
ORDER BY p.stock {4}
LIMIT {5};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Buy orders need the vendor, and the catalog points at the vendor file through supplier_id. The product's own id against vendor ids would invent pairs and route a reorder to the wrong supplier.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id of their own, so that guess breaks the query before the watchlist prints.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the watchlist threshold",
        why: "The watchlist's definition of thin is under 100 — the desk's own bar. At 50 the headset bin slips off the run entirely: a 60-unit shelf would sit unwatched while the promo calendar moves.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Thinnest first is ascending — smallest stock on top. DESC would lead the run with the 85-unit hub while the 40-unit watch sits at the bottom of the list.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the run's line count",
        why: "Friday's run absorbs three lines, so the cut is 3. Five would buy the whole watchlist in one go; two leaves the third-thinnest shelf exposed another week.",
      },
    ],
    distractors: ["s.stock", "s.supplier_id", "50", "DESC", "5"],
    walkthrough:
      "The watchlist is a threshold, a rank, and a slice: stock under 100, ascending, cut at three, vendors attached through supplier_id = s.id. The lines that land: Smart Watch S at 40 from Nordic Gadgets AB, Studio Desktop Mic at 45 from Alpine Audio GmbH, Noise-Canceling Headset at 60 from Midwest Hardware Co. Read the shape before the buy orders go out: the three thinnest shelves in the building are all premium electronics, one from each of the top-rated vendors. That's policy, not panic — these are deliberately shallow stocks of expensive SKUs — but the watch at 40 units is the one that breaks first if the promo calendar moves. The threshold trap matters: drop the bar to 50 and the headset bin falls off the run entirely — three shelves become two, and a 60-unit shelf ships no buy order at all.",
  },
  {
    id: "cs-335",
    tier: "hard",
    topic: "l9",
    universe: "funnel",
    title: "APAC's delivered podium",
    brief:
      "From: Growth marketing lead. Re: regional campaign debrief.\n\nThe APAC debrief opens on the delivered podium: the region's four biggest completed bookings, biggest first, names attached. Four lines — the debrief's first slide carries exactly that, and the narrative hangs on which accounts own the top of the completed pile.",
    ask: "Booking id, account name and total for the 4 largest delivered bookings from APAC-region accounts, biggest first.",
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
        why: "The podium attaches names, and bookings reach the account register only through customer_id. The booking's own id against account ids would fabricate sixteen fake podium lines.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the debrief exists.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region value",
        why: "The debrief is the APAC story: the quoted text 'APAC' on the account's region. 'EU' would podium Berlin and Lyon accounts on an APAC slide.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The podium counts completed bookings — the quoted text 'delivered'. 'pending' would celebrate bookings that haven't shipped and the debrief would rest on promises.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first is descending — the slide opens on the headline completion. ASC would lead with a small completed ticket and bury the 625.14 top line.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The slide carries exactly four lines, so the cut is 4. Two is a headline without depth; eight is a table, not a podium.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'EU'", "'pending'", "ASC", "2"],
    walkthrough:
      "The podium is two filters and a ranked cut on a reunion: APAC accounts, delivered status, biggest-first, sliced at four, names through customer_id = c.id. The lines that land: booking 68, Grace Kim, 625.14; booking 64, Maya Patel, 611.87; booking 22, Hiro Tanaka, 450.12; booking 24, Maya Patel, 419.37. Two metros own the podium — Seoul and Mumbai — and Maya appears twice, so the region's completed value concentrates in accounts the debrief can name. The spread from top to bottom is barely 200 dollars, which is its own finding: APAC's completed book has no single dominant ticket, just a tight tier of solid completions. The direction flip would open the debrief on the smallest of the four and let the 625.14 headline arrive as a footnote — the ranking is the slide.",
  },
];
