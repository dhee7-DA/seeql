// Module 2 · l13 Anti-joins — easy/medium/hard business cases (cs-452..cs-467).
// Authored against scripts/case-m2-spec.md facts; every figure live-probed.

import type { CaseStudy } from "./types";

export const casesM2L13b: CaseStudy[] = [
  {
    id: "cs-452",
    tier: "easy",
    topic: "l13",
    universe: "refund-audit",
    title: "Eight settled books, nothing open",
    brief:
      "From: Refund audit desk. Re: the settled-book list.\n\nRefund windows only run on open tickets, so the audit's clean half is the accounts with nothing pending at all — no window can open on them this cycle. List them with regions attached, alphabetical, so the auditor can file the clean books behind a single tab.",
    ask: "Accounts with no pending booking, with region, alphabetical.",
    template: `SELECT c.name, c.region
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id IS {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Settled accounts match no pending booking and survive only as kept rows with empty booking columns — the LEFT flavor prints them. The inner flavor would erase the clean half and the audit tab would file nothing.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status being probed",
        why: "Settled means the absence of 'pending', quoted, tested inside the reunion condition. 'shipped' profiles six different names and the clean-book tab would hold workflow stragglers instead of settled accounts.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "A settled account reads NULL on the booking side, and IS NULL keeps it for the list. IS NOT NULL prints the eight accounts that DO carry open money — the audit's working set, not its clean half.",
      },
    ],
    distractors: ["INNER", "'shipped'", "'cancelled'", "NOT NULL"],
    walkthrough:
      "Eight rows print, A to Z: Bruno Silva (LATAM), Dmitri Volkov, Isabella Rossi, Liam O'Brien, Noah Meyer and Olivia Brown (EU), Hiro Tanaka (APAC), Jamal Wright (US). The book splits exactly in half — eight accounts carry the file's 14 open tickets, eight carry none — and the clean half spans every region, so no region can claim a fully-open or fully-settled book. The audit cares because refund exposure lives only where tickets are open: the settled eight generate zero windows this cycle, whatever their history. The probe discipline shows up in the near-misses: probe 'shipped' and the list becomes the six never-shipped accounts — a workflow-failure group, not a settled group — while probe 'cancelled' and it grows to twelve. INNER would print an empty tab, and an empty clean-book list reads like the whole book is exposed, the exact opposite of the record.",
  },
  {
    id: "cs-453",
    tier: "easy",
    topic: "l13",
    universe: "pricing",
    title: "Four vendors with no video line",
    brief:
      "From: Head of Product. Re: pricing reset, video section.\n\nThe video section of the reset needs its vendor map: who supplies it, and just as important, who does not. List the vendors with no video product at all, alphabetical, so the section's sourcing note can name the absentees alongside the two incumbents.",
    ask: "Vendors with no Video product, alphabetical.",
    template: `SELECT s.name
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND p.category = {2}
WHERE p.id IS {3}
ORDER BY s.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Absent vendors match no video row and survive only as kept rows with blank product columns. The inner flavor deletes them and the sourcing note would claim the whole file supplies video.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the shelf being probed",
        why: "The map is scoped to the exact shelf text 'Video', quoted and case-sensitive. 'Audio' would list the vendors absent from a different three-SKU shelf and the note would name the wrong absentees.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with no video reads NULL on the product side, and IS NULL keeps it for the list. IS NOT NULL prints the two incumbents who own the video shelf — the holders, not the absentees.",
      },
    ],
    distractors: ["INNER", "'Audio'", "NOT NULL", "OUTER"],
    walkthrough:
      "Four vendors print: Alpine Audio GmbH, Andes Naturals SA, Midwest Hardware Co and Pacific Textiles — none of them lists a single video SKU. The video shelf itself is a two-vendor affair: the 4K Webcam Pro at 129 (Nordic Gadgets AB) and the Ring Light at 39.99 (Shenzhen Electro), a 5,198.41 lifetime line-revenue shelf split between exactly two suppliers. So the pricing reset's video section has a wide-open expansion story: four qualified vendors with zero presence, and the file's best-rated supplier (Alpine, 4.8) sits at the top of the absentee list. Probe 'Audio' instead and the absentee list reshuffles to Nordic, Pacific and Shenzhen — the same Shenzhen that supplies video, suddenly looking absent, because category choice redefines the gap. INNER prints an empty list and the reset would conclude video is fully penetrated; IS NOT NULL prints the two incumbents as if they were the gaps. OUTER alone fails to parse — the keeping flavor needs its LEFT.",
  },
  {
    id: "cs-454",
    tier: "easy",
    topic: "l13",
    universe: "inventory",
    title: "Six shelves to visit, routed by city",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: the unshipped-account visit route.\n\nCycle-count follow-ups ride along with a courier route, so the desk wants the accounts with no shipped booking listed with their cities, ordered by city — the route hits Dubai before London, and the visit list should read in driving order, not in account order.",
    ask: "Accounts with no shipped booking, with city, ordered by city.",
    template: `SELECT c.city, c.name
FROM customers c
{3} JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE o.id IS {2}
ORDER BY c.city;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "The visit list is the absence of 'shipped', quoted, tested inside the reunion so unmatched accounts survive. 'delivered' would route the courier to a single city for one account and five visits would never happen.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "Unshipped accounts read NULL on the booking side, and IS NULL keeps them on the route. IS NOT NULL lists the ten shipped-covered accounts — stops the desk does not need to make.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The route needs every account, matched or not — the unmatched ones ARE the stops. The inner flavor prints an empty route sheet and the courier drives a normal day while six accounts wait.",
      },
    ],
    distractors: ["INNER", "'delivered'", "'pending'", "NOT NULL"],
    walkthrough:
      "Six stops print in city order: Dubai (Farid Nasser), London (Olivia Brown), Lyon (Chloe Dubois), Nagoya (Keiko Sato), São Paulo (Bruno Silva), Tallinn (Dmitri Volkov). One account per city — the route never doubles back, and every stop is a conversation about the 17 bookings and 7,122.00 that have never shipped. Probe 'delivered' instead and the route collapses to a single Cork visit for Liam O'Brien, whose one booking shipped but never delivered; probe 'pending' and the route grows to eight stops across eight cities, pulling in accounts that do have shipped history and do not need the unshipped conversation. The INNER flavor prints an empty sheet — a blank route that reads as nothing to do while a sixth of the book sits unshipped. The city sort is cosmetic but load-bearing: two desks sharing the list cannot split it by driving order if one of them files A to Z.",
  },
  {
    id: "cs-455",
    tier: "easy",
    topic: "l13",
    universe: "funnel",
    title: "The send list: ten accounts with shipped history",
    brief:
      "From: Growth marketing lead. Re: delivery-thanks send list.\n\nThe delivery-thanks email goes only to accounts with at least one shipped booking — thanking anyone else would reference a shipment that does not exist. Build the send list from the record: every account that DOES have shipped history, one line each, alphabetical.",
    ask: "Accounts with at least one shipped booking, one line each, alphabetical.",
    template: `SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE o.id IS {2}
GROUP BY c.name
ORDER BY c.name {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being matched",
        why: "The send list is defined by the presence of 'shipped', quoted, matched inside the reunion condition. 'delivered' would send to fifteen accounts and reference deliveries for the six whose tickets never left the building.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the presence test",
        why: "The send list keeps rows where the booking side matched — o.id IS NOT NULL. IS NULL flips the query into the suppress list: the six accounts with no shipment to thank.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing order",
        why: "The send tool diffs against an alphabetical manifest, so A to Z is ascending. DESC hands the tool the same ten names back to front and the diff flags every line as reordered.",
      },
    ],
    distractors: ["'delivered'", "'pending'", "DESC", "c.city", "c.region"],
    walkthrough:
      "Ten names print, A to Z: Alice Chen, Emma Wilson, Grace Kim, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Maya Patel, Noah Meyer, Pedro Alvarez. The GROUP BY is doing quiet work here — a LEFT reunion fans out to every shipped booking, and without it Alice alone would print once per shipped ticket and the manifest would carry duplicates the send tool counts as separate recipients. Sixteen accounts, ten with shipments, six without: the same record that builds the send list builds its suppress list, and the two reconcile to the whole book. Probe 'delivered' instead and the list grows to fifteen — only Liam drops out — and the email would thank five accounts whose tickets have shipped but never completed delivery. NULL flips the probe entirely and prints the six-name suppress list; DESC reverses the manifest; and sorting by a city column the SELECT never carried fails the query outright.",
  },
  {
    id: "cs-456",
    tier: "easy",
    topic: "l13",
    universe: "supplier",
    title: "Five vendors absent from fitness",
    brief:
      "From: Supply-chain lead. Re: fitness category audit trail.\n\nFitness is the file's thinnest shelf and the audit wants its paper trail: which vendors hold none of it, with their regions attached, filed by region then name so the audit binder groups the absentees geographically. The category's whole story is one product deep, and the binder should show it.",
    ask: "Vendors with no Fitness product, with region, by region then name.",
    template: `SELECT s.name, s.region
FROM suppliers s
{3} JOIN products p ON p.supplier_id = s.id AND p.category = {1}
WHERE p.id IS {2}
ORDER BY s.region, s.name;`,
    slots: [
      {
        answer: "'Fitness'",
        kind: "keyword",
        label: "the shelf being probed",
        why: "The audit is scoped to the exact shelf text 'Fitness', quoted and case-sensitive. 'Wearables' would list a different four-vendor absentee set and the binder would audit a category nobody asked about.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with no fitness product reads NULL on the product side, and IS NULL keeps it for the binder. IS NOT NULL prints the single incumbent — Midwest Hardware Co, holder of the entire category.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The binder needs every vendor, and the absentees only exist as kept rows with blank product columns. The inner flavor would file an empty page and the audit would read fitness as fully penetrated.",
      },
    ],
    distractors: ["INNER", "'Wearables'", "NOT NULL", "OUTER"],
    walkthrough:
      "Five vendors print, grouped by region: Pacific Textiles and Shenzhen Electro (APAC), Alpine Audio GmbH and Nordic Gadgets AB (EU), Andes Naturals SA (LATAM) — and the US prints nothing, because Midwest Hardware Co holds the entire fitness category with one product, the Yoga Mat Eco at 32. That is the audit's headline: a six-vendor file, a five-vendor gap, and a category whose entire depth is a single SKU. The regional filing exposes the expansion angle: APAC and EU each hold two absent vendors, so a second fitness source could come from either continent without a new region. Probe 'Wearables' instead and the binder prints a different four-vendor gap — the same Shenzhen and Pacific plus Midwest and Alpine — reminding the reader that category choice writes the story. INNER files an empty page; IS NOT NULL files the lone incumbent as if the audit were about presence; OUTER alone fails to parse, which the binder's appendix should note before someone retypes it.",
  },
  {
    id: "cs-457",
    tier: "medium",
    topic: "l13",
    universe: "expense",
    title: "Twelve accounts with zero cancelled spend",
    brief:
      "From: Ops finance, spend review. Re: the write-off provision base.\n\nThe write-off provision only touches accounts that have actually had a booking cancelled, so the review needs the complement counted: how many accounts carry zero cancelled spend. One number for the provision memo — the base the provision does NOT touch — counted from the record.",
    ask: "Count of accounts with no cancelled booking.",
    template: `SELECT COUNT(*) AS clean_accounts
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE {2}.id IS {3};`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status being probed",
        why: "The clean base is the absence of 'cancelled', quoted, tested inside the reunion condition. 'pending' would count the eight accounts with nothing open — a different clean, about open money rather than destroyed tickets.",
      },
      {
        answer: "o",
        kind: "keyword",
        label: "the side being probed",
        why: "The hole test reads the booking alias — o.id IS NULL marks a kept row with no cancelled match. Probing the account alias tests an id that is never empty and the memo would print a base of zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "IS NULL keeps the accounts the cancelled filter cannot match — the provision-free base. IS NOT NULL counts the four cancellation owners, which is the provision's working set, not its complement.",
      },
    ],
    distractors: ["'pending'", "'shipped'", "NOT NULL", "INNER", "c"],
    walkthrough:
      "The memo prints 12: twelve of sixteen accounts have never had a booking cancelled, so the provision's working set is just four accounts holding all 7 cancelled tickets worth 1,152.49. The base number matters as much as the working set — a provision memo that only names the four reads like the whole book is exposed, when three-quarters of it is untouched. The failure modes are the close's favorite lesson: probe 'pending' instead and the clean count drops to 8 (the open-money complement, a different virtue), move the status filter into WHERE and the count collapses to 0 (the collapse that makes a healthy book look fully exposed), and swap the probe to IS NOT NULL and the memo prints 4 — the provision set masquerading as the base. Counting with the account alias instead of rows would print 0 every time, because account ids are never the empty side of this reunion.",
  },
  {
    id: "cs-458",
    tier: "medium",
    topic: "l13",
    universe: "growth",
    title: "The delivery ledger by region",
    brief:
      "From: Chief of Staff. Re: board pack, delivery coverage ledger.\n\nThe board pack carries a delivery coverage ledger: per region, how many accounts have taken a booking through delivery and how many never have, both counts from one scan, gap-heaviest region first. The two columns must reconcile to the sixteen-account file — the pack's footnote says so, and the ledger is the footnote's proof.",
    ask: "Delivery-coverage ledger by region, gap-heaviest first.",
    template: `SELECT c.region,
COUNT(DISTINCT CASE WHEN osh.id IS NOT NULL THEN c.id END) AS del_also,
COUNT(DISTINCT CASE WHEN osh.id IS {1} THEN c.id END) AS never_del
FROM customers c
LEFT JOIN orders osh ON osh.customer_id = c.id AND osh.status = {2}
GROUP BY c.region
ORDER BY never_del {3};`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the gap-side test",
        why: "The gap column counts kept rows with no delivered match — CASE WHEN osh.id IS NULL keeps the account id only on ghost rows. IS NOT NULL here would count the covered side twice and both columns would print the same numbers.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status being probed",
        why: "The ledger reads the 'delivered' status, quoted, in both columns — one counts matches, one counts ghosts. 'shipped' reconciles to a different 10-and-6 split and the board would file coverage against the wrong milestone.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the gap-heaviest sort",
        why: "The board reads the worst gap first, so the ledger sorts by the gap column descending. ASC would lead with three covered-clean regions and bury the single gap row at the bottom of the page.",
      },
    ],
    distractors: ["NOT NULL", "'shipped'", "'pending'", "INNER", "ASC"],
    walkthrough:
      "Four rows print, gap-heaviest first: EU 7 covered / 1 never, US 2 / 0, LATAM 1 / 0, APAC 5 / 0 — and the columns reconcile to the file exactly: 15 plus 1 account, 16 total. The single gap row is the whole story: every region covers its book except the EU, where Liam O'Brien's lone ticket shipped but never delivered, and the ledger isolates him without naming him — the name pull is a one-click follow-up. The one-scan construction is why the ledger cannot lie to itself: both count columns read the same kept rows, splitting matches from ghosts with a CASE inside COUNT(DISTINCT), so the two columns always reconcile to the regional head-count. Probe 'shipped' instead and the ledger splits 10-and-6 with the EU carrying three gaps and LATAM its first; probe 'pending' and it splits 8-and-8. Swap the gap-side test to IS NOT NULL and both columns print the covered counts — a ledger that reconciles to 30 against a 16-account file, which is exactly the kind of arithmetic the footnote exists to catch.",
  },
  {
    id: "cs-459",
    tier: "medium",
    topic: "l13",
    universe: "fraud",
    title: "Five accounts juggling open and shipped",
    brief:
      "From: Fraud spot-check desk. Re: the two-state baseline.\n\nThe spot-check's baseline group is accounts that simultaneously hold open money AND completed shipments — accounts with something to lose and something in flight. Names only, A to Z. The desk knows the mirror group (never shipped, but holding open money) is already on someone's annex; this list is the healthy-activity control it gets compared against.",
    ask: "Accounts with at least one shipped AND at least one pending booking, A to Z.",
    template: `SELECT c.name
FROM customers c
LEFT JOIN orders osh ON osh.customer_id = c.id AND osh.status = {1}
LEFT JOIN orders op ON op.customer_id = c.id AND op.status = {2}
WHERE osh.id IS {3} AND op.id IS NOT NULL
GROUP BY c.name
ORDER BY c.name;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the completed-side status",
        why: "The completed side asserts the presence of 'shipped', matched in its own reunion and asserted with IS NOT NULL. Swapping the two statuses turns the baseline into its mirror — open money on accounts that never shipped — the exact annex list this group exists to contrast with.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-side status",
        why: "The open side needs 'pending', quoted, in its own LEFT reunion. Reusing 'shipped' on both sides forces an empty intersection — no booking can both have and lack the same status — and the baseline would print zero names.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the presence tests",
        why: "Both sides assert presence: osh.id IS NOT NULL and op.id IS NOT NULL keep only accounts that match both statuses. IS NULL on the shipped side flips the query into the mirror pocket — never-shipped accounts with open money.",
      },
    ],
    distractors: ["NULL", "'cancelled'", "INNER", "op.id"],
    walkthrough:
      "Five names print, A to Z: Alice Chen, Emma Wilson, Grace Kim, Maya Patel, Pedro Alvarez — accounts with at least one completed shipment and at least one open ticket at the same time. That is the desk's healthy-activity baseline: money in motion on both ends of the lifecycle, 5 of 16 accounts. The mirror group sits three names away: Chloe Dubois, Farid Nasser and Keiko Sato hold open money with zero shipped history ever — the annex list — and the contrast between 5 and 3 is the spot-check's whole argument: two-state activity is common enough to be normal, one-state open money on a never-shipped account is the exception worth a call. The construction is the same two-reunion pattern as the annex, flipped: both probes assert presence instead of one asserting absence. Drop either presence test and the query silently becomes a single-status holder list; probe 'cancelled' on the second side and the baseline becomes the shipped-and-cancelled group, a different behavioral question entirely.",
  },
  {
    id: "cs-460",
    tier: "medium",
    topic: "l13",
    universe: "catalog",
    title: "Three vendors with nothing above 100",
    brief:
      "From: Warehouse catalog desk. Re: the premium sourcing claim, revised line.\n\nThe premium sourcing claim came back from review with the line moved: anything above 100 counts as premium, not 150. Re-run the gap list on the revised line — vendors with no product priced above 100, alphabetical — so the claim's correction names the right absentees before it circulates.",
    ask: "Vendors with no product priced above 100, alphabetical.",
    template: `SELECT s.name
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND p.price > {2}
WHERE p.id IS {3}
ORDER BY s.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Vendors with nothing above the line match no product row and survive only as kept rows with blank columns. The inner flavor erases the correction and the revised claim ships unchallenged.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the revised premium line",
        why: "The claim's threshold lives in the reunion condition and never prints as a result cell. At the old 150 line the gap list held five vendors; at 200 it would swallow all six — the line's value writes the claim.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with nothing above the line keeps its row with NULL product columns, and IS NULL finds it. IS NOT NULL prints the three vendors that DO clear 100 — the claim's survivors, not its corrections.",
      },
    ],
    distractors: ["INNER", "50", "200", "NOT NULL", "RIGHT"],
    walkthrough:
      "Three vendors print: Andes Naturals SA, Pacific Textiles and Shenzhen Electro — none prices a single SKU above 100. The revised line clears three vendors as premium-sourced: Nordic Gadgets AB with the 4K Webcam Pro at 129 and the Smart Watch S at 199.99, Alpine Audio GmbH with the Studio Mic at 119, and Midwest Hardware Co with the Headset at 149.99. So the correction shrinks the gap list from five vendors at the old 150 line to three at 100 — the claim got easier to defend, not harder, because the Headset at 149.99 and the Webcam at 129 now count. The threshold's leverage is the lesson: at 50 the gap list thins to one vendor (Shenzhen, whose Wireless Mouse sits at 34.50 with nothing else close), at 200 it swallows the whole file. RIGHT would print the four qualifying product rows with no vendor context; INNER prints an empty list and the correction reads as claim fully confirmed.",
  },
  {
    id: "cs-461",
    tier: "medium",
    topic: "l13",
    universe: "month-close",
    title: "Six visits, seventeen open tickets",
    brief:
      "From: Controller. Re: close-week field visits, ticket counts attached.\n\nClose-week visits to the never-shipped accounts need sizing before anyone books travel: each stop carries a count of open tickets — actually, of ALL their bookings, since none ever shipped — so the controller knows which conversations are five-ticket reviews and which are one. Cities alphabetical, counts attached.",
    ask: "Never-shipped accounts by city with booking counts, cities alphabetical.",
    template: `SELECT c.city, c.name, COUNT(o.id) AS open_tickets
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
LEFT JOIN orders oa ON oa.customer_id = c.id
WHERE o.id IS {2} AND oa.id IS NOT NULL
GROUP BY c.city, c.name
ORDER BY c.city {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the never-side status",
        why: "The visit list is the absence of 'shipped', tested inside the first reunion so the unmatched accounts survive. 'delivered' would route one visit to Cork and the other five cities would drop off the itinerary.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "The first reunion's ghost rows mark never-shipped accounts — o.id IS NULL keeps them. IS NOT NULL builds the itinerary from shipped-covered accounts instead, six visits to the wrong ten cities.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the city-filed order",
        why: "The controller reads the itinerary city by city, A to Z ascending. DESC visits Tallinn before Dubai and the travel plan reads backwards against the courier's route sheet.",
      },
    ],
    distractors: ["INNER", "'delivered'", "'pending'", "c.name"],
    walkthrough:
      "Six rows print in city order with their sizes attached: Dubai 3 (Farid), London 1 (Olivia), Lyon 5 (Chloe), Nagoya 4 (Keiko), São Paulo 2 (Bruno), Tallinn 2 (Dmitri) — six visits carrying all 17 never-shipped bookings. The sizing changes the trip: Lyon is a five-ticket review, London a one-line confirmation, and the controller books the time accordingly. The second reunion is doing the counting — the first decides who survives, the second gathers their bookings, and the probe columns keep ghost rows out of the count. Probe 'delivered' instead and the itinerary becomes a single Cork stop carrying 1 ticket; probe 'pending' and it becomes eight stops, because five of the six never-shipped accounts do have pending tickets but so do three accounts with shipped history that do not belong on this trip. INNER prints an empty itinerary while 17 bookings wait, and IS NOT NULL on the hole test sends the controller to the ten covered accounts instead.",
  },
  {
    id: "cs-462",
    tier: "hard",
    topic: "l13",
    universe: "refund-audit",
    title: "Four mixed records: delivered AND cancelled",
    brief:
      "From: Refund audit desk. Re: the mixed-record review set.\n\nRefund behavior needs two lenses at once: accounts with real delivery history AND at least one cancellation — accounts that complete orders and also reverse them. Names and regions, A to Z, for the review set. The desk expects this group to be small; the memo says small groups are where the pattern lives.",
    ask: "Accounts with at least one delivered AND one cancelled booking, with region, A to Z.",
    template: `SELECT c.name, c.region
FROM customers c
LEFT JOIN orders od ON od.customer_id = c.id AND od.status = {1}
LEFT JOIN orders oc ON oc.customer_id = c.id AND oc.status = {2}
WHERE od.id IS {3} AND oc.id IS NOT NULL
GROUP BY c.name
ORDER BY c.name;`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed-side status",
        why: "The completed lens asserts the presence of 'delivered', matched in its own reunion. 'shipped' would build the set from tickets that only left the building — a different behavioral question about the same four names' neighbors.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the reversal-side status",
        why: "The reversal lens needs 'cancelled', quoted, in its own LEFT reunion and asserted present. 'pending' would intersect completions with open money — a cash-flow question, not a refund-behavior one.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the presence test",
        why: "Both lenses assert presence: od.id IS NOT NULL and oc.id IS NOT NULL keep only accounts matching both. IS NULL on the delivered side flips the set to cancelled-but-never-delivered accounts — the reversal-only group.",
      },
    ],
    distractors: ["NULL", "'shipped'", "INNER", "oc.id"],
    walkthrough:
      "Four names print, A to Z: Alice Chen (EU), Emma Wilson (US), Keiko Sato (APAC), Maya Patel (APAC) — accounts that both complete orders and reverse them. All four cancellation owners are here, which is the quiet finding: every account that ever cancelled also has clean delivery history, so cancellation on this file is not the behavior of accounts that fail at delivery — it is a deliberate act by otherwise healthy accounts. The set is small because the intersection is demanding: delivered holders number 15, cancelled holders just 4, and the overlap keeps all 4. Flip the delivered test to IS NULL and the set becomes cancelled-but-never-delivered — empty on this file, a zeros-are-findings result that would clear the four names entirely. Probe 'pending' on the reversal side and the set stays the same four names — on this file, pending-and-cancelled and delivered-and-cancelled happen to coincide, which is exactly why the audit tries every distractor in every slot before trusting a set. Probe 'shipped' on the completed side and it shrinks to three, because Keiko has shipped nothing. INNER prints nothing — two separate reunions cannot be flattened into one without losing one of the two questions.",
  },
  {
    id: "cs-463",
    tier: "hard",
    topic: "l13",
    universe: "pricing",
    title: "The 50-to-100 band's three absentees",
    brief:
      "From: Head of Product. Re: the mid-market band audit.\n\nThe reset's mid-market band is 50 to 100 — the shelf where impulse meets intent — and the audit asks which vendors source nothing in that band at all. Vendor names, alphabetical, for the band's gap list. The band was chosen because the premium argument is settled; this is about the middle of the catalog.",
    ask: "Vendors with no product priced between 50 and 100, alphabetical.",
    template: `SELECT s.name
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id AND p.price BETWEEN {1} AND {2}
WHERE p.id IS {3}
ORDER BY s.name;`,
    slots: [
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the band floor",
        why: "The band's floor lives in the reunion condition and never prints as a result cell. Lower it to 40 and the Laptop Stand at 42.50 pulls Midwest into the band, shrinking the gap list by a vendor.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the band ceiling",
        why: "The band's ceiling sits beside the floor in the reunion condition. Raise it to 150 and the Headset at 149.99 and Webcam at 129 pull Alpine and Nordic into coverage, cutting the gap list to one name.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with nothing in the band keeps its row with NULL product columns, and IS NULL finds the absentees. IS NOT NULL prints the band's three holders — Nordic, Pacific and Andes — not the gaps.",
      },
    ],
    distractors: ["INNER", "40", "150", "NOT NULL", "OUTER"],
    walkthrough:
      "Three vendors print: Alpine Audio GmbH, Midwest Hardware Co and Shenzhen Electro — none sources anything between 50 and 100. The band's actual holders: Nordic (Keyboard at 89.99), Pacific (Jersey at 65) and Andes (Speaker at 59.99, Fitness Band at 79), so the mid-market shelf splits three ways while three vendors sit it out entirely. The band edges are the lesson: drop the floor to 40 and the Laptop Stand at 42.50 pulls Midwest into coverage, cutting the gap list to Alpine and Shenzhen; raise the ceiling to 150 and the Headset at 149.99 plus the Webcam at 129 pull in Alpine and Nordic too, leaving Shenzhen alone — a vendor whose whole price book lives below 50 except the Mouse at 34.50. BETWEEN makes the band a single condition inside the reunion, which is exactly where a threshold belongs: filter it in WHERE and the ghost rows collapse, printing an empty gap list that reads as full band coverage. INNER does the same damage differently; OUTER alone fails to parse.",
  },
  {
    id: "cs-464",
    tier: "hard",
    topic: "l13",
    universe: "growth",
    title: "Stranded money by region, sized",
    brief:
      "From: Chief of Staff. Re: board annex, the regional unshipped split.\n\nThe unshipped book needs its regional split for the annex: bookings belonging to accounts that have never shipped, counted and summed per region, biggest count first. The board reads the split to decide which regional lead gets the escalation call — and the sums, not just the counts, because 8 small tickets and 8 large ones are different conversations.",
    ask: "Stranded booking counts and sums by region, biggest count first.",
    template: `SELECT c.region, COUNT(o.id) AS stranded, ROUND(SUM(o.total), 2) AS amt
FROM customers c
LEFT JOIN orders osh ON osh.customer_id = c.id AND osh.status = {1}
LEFT JOIN orders o ON o.customer_id = c.id
WHERE osh.id IS {2} AND o.id IS NOT NULL
GROUP BY c.region
ORDER BY stranded {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the never-side status",
        why: "The stranded set is defined by the absence of 'shipped' inside the deciding reunion. 'delivered' would strand a single EU ticket worth 705.39 and the annex would hand the escalation call to a region with almost nothing at stake.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the absence test",
        why: "osh.id IS NULL keeps the never-shipped accounts as ghost rows for the grouping. IS NOT NULL flips the annex to the shipped-covered accounts — 86 bookings of healthy history mislabeled as stranded.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-count sort",
        why: "The escalation call follows the biggest count, so regions sort descending by stranded bookings. ASC would lead with LATAM's two tickets and the board would size the problem by the smallest region first.",
      },
    ],
    distractors: ["'delivered'", "NOT NULL", "INNER", "op.id"],
    walkthrough:
      "Three rows print, biggest count first: EU 8 stranded bookings worth 3,711.99, APAC 7 worth 2,557.57, LATAM 2 worth 852.44 — and the US prints nothing, its book fully shipped-covered. The sums tell a sharper story than the counts: EU's lead is real but not overwhelming, and APAC's 7 tickets average 365.37 against the EU's 464.00, so the regional reads differ in shape, not just size. The two-reunion construction separates the deciding question from the measuring one: the first reunion picks the never-shipped accounts, the second gathers their actual bookings, and the probe pair keeps ghost rows out of the count and the sum. Probe 'delivered' instead and the annex becomes one EU row carrying Liam's single 705.39 ticket; move the status filter into WHERE and the whole annex empties — the collapse that reads as nothing stranded anywhere. The sum column rounds to the penny so the annex reconciles against the 7,122.00 total the board already saw.",
  },
  {
    id: "cs-465",
    tier: "hard",
    topic: "l13",
    universe: "funnel",
    title: "The open-money census by region",
    brief:
      "From: Growth marketing lead. Re: funnel board, the open-ticket census.\n\nThe funnel board's open-money page wants one census: per region, how many accounts hold pending tickets and how many hold none, both from one scan, biggest gap-count first. The page sits beside the shipped-coverage numbers the board already approved, and the two ledgers must stay consistent — same construction, different status.",
    ask: "Pending-coverage census by region, biggest gap-count first.",
    template: `SELECT c.region,
COUNT(DISTINCT CASE WHEN op.id IS NOT NULL THEN c.id END) AS pend_also,
COUNT(DISTINCT CASE WHEN op.id IS {1} THEN c.id END) AS never_pend
FROM customers c
LEFT JOIN orders op ON op.customer_id = c.id AND op.status = {2}
GROUP BY c.region
ORDER BY never_pend {3};`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the gap-side test",
        why: "The gap column counts kept rows with no pending match — CASE WHEN op.id IS NULL keeps the account id only on ghost rows. IS NOT NULL would print the covered counts in both columns and the census would reconcile to double the book.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the status being probed",
        why: "The census reads 'pending', quoted, in both count columns. 'shipped' would reprint the approved coverage ledger instead of the open-money page and the board would compare two copies of the same numbers.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-gap sort",
        why: "The board reads the biggest open-money gap first, so the census sorts by the gap column descending. ASC would open on a region with a single gap and bury the five-account gap at the bottom.",
      },
    ],
    distractors: ["NOT NULL", "'shipped'", "'delivered'", "INNER", "ASC"],
    walkthrough:
      "Four rows print, gap-heaviest first: EU 3 covered / 5 never, APAC 4 / 1, US 1 / 1, LATAM 0 / 1 — reconciling to 8 plus 8 accounts, the book split exactly in half on open money. The regional shape is the page's argument: the EU holds both the most players (three accounts keep open tickets) and the most absentees (five with none), while APAC is nearly all players — four of its five accounts carry pending money. The construction mirrors the shipped ledger deliberately: same CASE-inside-COUNT shape, same ghost arithmetic, different status word, so the board can lay the two pages side by side and read them with one set of rules. Probe 'shipped' instead and the page becomes the coverage ledger — 10 and 6 with the EU gap shrinking to three; probe 'delivered' and it becomes 15 and 1, the delivery story. Swap the gap test to IS NOT NULL and every region prints its covered count twice, a census that reconciles to 32 against a 16-account file. INNER zeroes the gap column region by region and the page reads as everyone covered.",
  },
  {
    id: "cs-466",
    tier: "hard",
    topic: "l13",
    universe: "supplier",
    title: "Absent from two growth categories at once",
    brief:
      "From: Supply-chain lead. Re: the double-gap shortlist.\n\nTwo categories count as growth bets this year — audio and wearables — and the QBR wants the vendors absent from BOTH, not just one. Single-category absence is a footnote; double absence is a sourcing strategy question. Vendor names, alphabetical, for the double-gap shortlist.",
    ask: "Vendors with no Audio product AND no Wearables product, alphabetical.",
    template: `SELECT s.name
FROM suppliers s
LEFT JOIN products p1 ON p1.supplier_id = s.id AND p1.category = {1}
LEFT JOIN products p2 ON p2.supplier_id = s.id AND p2.category = {2}
WHERE p1.id IS {3} AND p2.id IS NULL
GROUP BY s.name
ORDER BY s.name;`,
    slots: [
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the first growth category",
        why: "The first reunion probes 'Audio', quoted, and asserts its absence. 'Video' would intersect the video gaps with the wearables gaps and shortlist Midwest and Alpine — vendors already in the growth conversation for different reasons.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the second growth category",
        why: "The second reunion needs 'Wearables', quoted, asserted absent in its own condition. 'Apparel' would intersect the audio gaps with the apparel gaps and print Nordic alone — a single-name shortlist for a two-category strategy.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the absence tests",
        why: "Both reunions assert absence: p1.id IS NULL and p2.id IS NULL keep only vendors matching neither category. IS NOT NULL on either side flips that probe to presence and the shortlist becomes a single-category gap or an incumbents list.",
      },
    ],
    distractors: ["'Video'", "'Apparel'", "INNER", "p3.id"],
    walkthrough:
      "Two names print: Pacific Textiles and Shenzhen Electro — the APAC pair, absent from both growth categories simultaneously. The single-category gaps they sit inside are wider: five vendors lack wearables and three lack audio, but only these two lack both, which is what makes the shortlist strategic rather than incidental — nobody on it has a foot in either bet. The construction needs two independent reunions because one product row cannot be probed against two categories at once: each LEFT JOIN carries its own category condition, each probe asserts its own absence, and the AND of the two tests is the double gap. Probe 'Video' on the first side and the shortlist becomes Pacific, Midwest and Alpine — Midwest and Alpine appear because they lack video, and the strategy question quietly changes. Probe 'Apparel' on the second and Nordic alone prints, since the apparel shelf's two vendors are exactly the ones audio does reach. INNER on either reunion zeroes the list, and a third alias — p3 — was never declared, so that guess fails before the page prints.",
  },
  {
    id: "cs-467",
    tier: "hard",
    topic: "l13",
    universe: "expense",
    title: "The settled census: nothing open, nothing cancelled",
    brief:
      "From: Ops finance, spend review. Re: the fully-settled census.\n\nThe review's final page counts the fully-settled accounts: nothing pending AND nothing cancelled — money that either delivered or shipped, with no open exposure and no destroyed tickets. Names only, A to Z. The page's argument is that this group needs no line in either the provision memo or the open-spend tracker.",
    ask: "Accounts with no pending AND no cancelled booking, A to Z.",
    template: `SELECT c.name
FROM customers c
LEFT JOIN orders op ON op.customer_id = c.id AND op.status = {1}
LEFT JOIN orders oc ON oc.customer_id = c.id AND oc.status = {2}
WHERE op.id IS {3} AND oc.id IS NULL
GROUP BY c.name
ORDER BY c.name;`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-side status",
        why: "The open side asserts the absence of 'pending', quoted, in its own reunion. 'shipped' would flip the question to never-shipped accounts and the census would count workflow failures instead of settled books.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the destroyed-side status",
        why: "The destroyed side needs 'cancelled', quoted, asserted absent in its own reunion. 'delivered' would assert the absence of completions and count the accounts whose money never landed — the opposite of settled.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the absence tests",
        why: "Both reunions assert absence: op.id IS NULL and oc.id IS NULL keep only accounts matching neither status. IS NOT NULL on the pending side flips the census to accounts WITH open money — the tracker's page, not this one.",
      },
    ],
    distractors: ["'delivered'", "INNER", "s.id", "p3.id"],
    walkthrough:
      "Eight names print, A to Z: Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown — the same eight accounts that hold no open money, and the census proves none of them carries a cancellation either. The review's two watchlists therefore exclude all eight: no provision line, no open-spend line — their money either delivered or shipped and settled. The construction is a double absence, the mirror of the fraud desk's double presence: two independent reunions, two IS NULL assertions, and the AND of both is the settled set. Flip the pending test to IS NOT NULL and the page becomes a narrower tracker — the four accounts that hold open money with no cancellation. Probe 'shipped' on the first side and the census shrinks to three — Bruno, Dmitri and Olivia, the never-shipped pocket — a workflow-failure list wearing a settled-book title. INNER zeroes the page, and any probe literal the cancelled tickets can never carry leaves the census standing at eight — which is why the audit tries every distractor in every slot before trusting a count.",
  },
];
