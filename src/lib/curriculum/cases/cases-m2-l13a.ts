// Module 2 · l13 Anti-joins — easy/medium/hard business cases (cs-435..cs-451).
// Authored against scripts/case-m2-spec.md facts; every figure live-probed.

import type { CaseStudy } from "./types";

export const casesM2L13a: CaseStudy[] = [
  {
    id: "cs-435",
    tier: "easy",
    topic: "l13",
    universe: "funnel",
    title: "The six accounts with no shipped history",
    brief:
      "From: Growth marketing lead. Re: nurture-track suppress list.\n\nThe next nurture email thanks accounts for recent deliveries, and sending that note to an account whose bookings have never shipped once would land badly. I want the suppress list: every account with no shipped booking on the record, names alphabetical, so the send tool can skip them before the batch goes out.",
    ask: "Accounts with no shipped booking, alphabetical.",
    template: `SELECT c.name
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id IS {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The suppress list is made of accounts the shipped filter cannot match, and only the LEFT flavor keeps those rows with empty booking columns. An inner reunion would erase exactly the people the list exists to catch.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "The probe asks who has never had the status 'shipped', quoted and lowercase. 'delivered' profiles a different absence entirely — one name instead of six — and the suppress list would miss five accounts.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "A kept row with no shipped booking reads NULL in every booking column, and IS NULL is the test that finds the holes. IS NOT NULL flips the list to the ten accounts that do have shipped history.",
      },
    ],
    distractors: ["INNER", "'delivered'", "'pending'", "NOT NULL"],
    walkthrough:
      "Six rows print, A to Z: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato, Olivia Brown. Between them they hold 17 bookings — none of which has ever shipped — so the nurture note would have gone to a sixth of the book on a false premise. The regional shape matters for the follow-up: the EU carries three of the six (Chloe, Dmitri, Olivia), APAC two (Farid, Keiko), LATAM one (Bruno), and the US prints nothing at all. The hole filter lives inside the reunion condition, not beside it — move the status test into WHERE and the kept ghosts collapse away, leaving zero rows and a suppress list that silently does nothing. That failure mode is invisible in the send tool: the batch just runs, six accounts get the wrong email, and nobody sees the empty list that should have stopped it.",
  },
  {
    id: "cs-436",
    tier: "easy",
    topic: "l13",
    universe: "supplier",
    title: "Vendors with nothing on the audio shelf",
    brief:
      "From: Catalog content manager. Re: audio sourcing page, vendor list.\n\nThe audio sourcing page carries every vendor on the file, and the ones with no audio at all stay on it with a blank — the page exists to show who is and is not in the audio business. List the vendors with no audio product, alphabetical, so the page can mark them as out of category.",
    ask: "Vendors with no Audio product, alphabetical.",
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
        why: "Vendors with no audio match nothing and survive only as kept rows with blank product columns — the LEFT flavor is what prints them. The inner flavor drops them and the page would read as if every vendor sold audio.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf being probed",
        why: "The out-of-category list is defined against the exact shelf text 'Audio', quoted and case-sensitive. 'Electronics' would print a different three-vendor list and mislabel the page.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with no audio keeps its row but every product column reads NULL, and IS NULL finds those rows. IS NOT NULL would flip the page to the three vendors who DO hold the audio shelf.",
      },
    ],
    distractors: ["INNER", "'Electronics'", "NOT NULL", "s.supplier_id"],
    walkthrough:
      "Three vendors print: Nordic Gadgets AB, Pacific Textiles, Shenzhen Electro — none of them sells a single audio SKU. The audio shelf itself belongs entirely to the other half of the file: the Noise-Canceling Headset at 149.99 (Midwest Hardware Co), the Studio Desktop Mic at 119 (Alpine Audio GmbH) and the Bluetooth Speaker Mini at 59.99 (Andes Naturals SA), a shelf worth 11,744.01 in lifetime line revenue concentrated in just three vendors. So the audio story is bimodal: three vendors own all of it, three own none of it, and nobody straddles the line. The sourcing page's blank rows are the actionable half — Nordic, Pacific and Shenzhen are the natural first calls if the audio category ever needs a fourth vendor, because they already pass every other audit on the file. Swap the probe to IS NOT NULL and the page prints the holders instead of the holes — the same six vendors, inverted.",
  },
  {
    id: "cs-437",
    tier: "easy",
    topic: "l13",
    universe: "expense",
    title: "Eight accounts with no open spend",
    brief:
      "From: Ops finance, spend review. Re: the open-ticket census.\n\nThe spend review opens with a census: how many accounts carry nothing pending right now. Open money is the review's working set, and the clean half of the book should be a number everyone can quote — one figure for the cover page, counted from the record, not eyeballed.",
    ask: "Count of accounts with no pending booking.",
    template: `SELECT COUNT(*) AS no_open_spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE {2}.id IS {3};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Nothing open means no booking with the exact status 'pending', quoted and lowercase, tested inside the reunion condition. 'shipped' would count a different six-account absence and the census would misstate the working set.",
      },
      {
        answer: "o",
        kind: "keyword",
        label: "the side being probed",
        why: "The hole test reads the booking side of the reunion — o.id IS NULL marks a kept row with no matching booking. Probing the account side instead would test the one column that is never empty and count zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "Kept rows with no pending booking read NULL across every booking column, and IS NULL is the test that keeps them for the count. IS NOT NULL counts the other half — the accounts that DO carry open money.",
      },
    ],
    distractors: ["'shipped'", "'delivered'", "'cancelled'", "c"],
    walkthrough:
      "The census prints 8 — exactly half the book carries no pending ticket at all: Bruno Silva, Dmitri Volkov, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer and Olivia Brown. The symmetry is the story: 8 accounts hold the file's 14 open tickets, the other 8 hold none, and the cover-page number is the clean half. The census only works because the status filter lives inside the reunion condition — move it to WHERE and the kept ghost rows collapse, the count drops to zero, and the review would open by announcing that every account has open spend, the exact opposite of the record. The count also survives the probe-direction check: counting o.id instead of rows would print 0 for this list, because ghost rows carry no booking numbers to count — which is why the census counts kept rows, not matched tickets.",
  },
  {
    id: "cs-438",
    tier: "easy",
    topic: "l13",
    universe: "growth",
    title: "The one account the delivery deck cannot cite",
    brief:
      "From: Chief of Staff. Re: board deck, the delivery claim.\n\nThe deck's growth section wants to say every account has taken a booking through to delivery, and that sentence has to survive the record before it goes on a slide. If even one account has never had a delivered booking, I want the name and city — one line, so the claim gets rewritten instead of defended.",
    ask: "Accounts with no delivered booking, with city.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id IS {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The claim-breaker is an account the delivered filter cannot match, and only the LEFT flavor keeps it on the page. The inner flavor would delete the one row the slide exists to check.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status being probed",
        why: "The deck's claim is about delivery, so the probe asks for the absence of 'delivered', exact and quoted. 'shipped' would answer a different question and surface six names the slide never asked about.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "An account with no delivered booking survives as a kept row with NULL booking columns, and IS NULL finds it. IS NOT NULL prints the 15 accounts that satisfy the claim and hides the exception completely.",
      },
    ],
    distractors: ["INNER", "'shipped'", "'pending'", "NOT NULL"],
    walkthrough:
      "One row prints: Liam O'Brien, Cork. His only booking — ticket 20, worth 705.39 — shipped but never delivered, so the delivery claim breaks on exactly one account out of sixteen. The deck gets rewritten as fifteen of sixteen, or the footnote carries the name; either way the sentence survives scrutiny because the record was checked. The count behind it: 52 delivered tickets sit with 15 accounts, and the 16th shows up only as a kept ghost row with empty booking columns. The near-misses are worth hearing too — probe 'shipped' instead and the list grows to six names, probe 'pending' and it grows to eight, so the delivery claim is the strongest sentence on that slide and the shipped claim is the weakest. One status word, three different decks.",
  },
  {
    id: "cs-439",
    tier: "easy",
    topic: "l13",
    universe: "fraud",
    title: "APAC accounts with no shipped record",
    brief:
      "From: Fraud spot-check desk. Re: regional unshipped sweep.\n\nThe APAC sweep profiles accounts whose bookings have never reached shipped status — unshipped money is not fraud by itself, but the desk wants the regional list with cities before deciding who gets a call. Two fields per account, names alphabetical, APAC only for this pass.",
    ask: "APAC accounts with no shipped booking, with city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE o.id IS {2} AND c.region = {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "The sweep profiles the absence of 'shipped', tested inside the reunion condition so the ghosts survive. 'delivered' would shrink the sweep to a single EU name and the APAC pass would profile nobody.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "An account with no shipped booking reads NULL on the booking side, and IS NULL keeps that row for the sweep. IS NOT NULL lists the APAC accounts that do ship — the complement, not the target.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the region scope",
        why: "This pass is the quoted region text 'APAC', matched exactly. 'EU' would sweep a different three-name list and the desk would phone the wrong continent.",
      },
    ],
    distractors: ["'EU'", "'US'", "'LATAM'", "INNER"],
    walkthrough:
      "Two rows print: Farid Nasser in Dubai and Keiko Sato in Nagoya. Between them they hold 7 bookings worth 2,557.57 — none shipped — while the region's other three accounts (Grace, Hiro, Maya) all carry shipped history. That is the sweep's headline: APAC's unshipped money is concentrated in exactly two names, not spread across the region. The desk's read: unshipped is a workflow fact, not an accusation — but 2,557.57 with zero shipment events is where a phone call goes first, and Farid holds the file's single biggest open ticket at 1,088.44. Widen the scope to the EU and the sweep prints three names (Chloe, Dmitri, Olivia); to LATAM, one (Bruno); to the US, nothing — the American book ships clean. The INNER flavor would have printed an empty list and closed the sweep before it started.",
  },
  {
    id: "cs-440",
    tier: "easy",
    topic: "l13",
    universe: "catalog",
    title: "Vendors with nothing above the 150 line",
    brief:
      "From: Warehouse catalog desk. Re: premium sourcing note.\n\nThe premium sourcing note claims every vendor on the file has skin above the 150 price line. Before the note circulates, show the vendors with no product priced above 150 — the blanks are the correction. Vendor names alphabetical, so the note can be annotated line by line.",
    ask: "Vendors with no product priced above 150, alphabetical.",
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
        why: "Vendors with nothing above the line match no product row and survive only as kept rows with blank columns — the LEFT flavor prints them. The inner flavor erases the correction and the note ships unchallenged.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "The note's claim is about the 150 price line, a threshold that lives in the reunion condition and never prints as a result cell. Drop it to 100 and three more vendors clear the bar; raise it to 200 and every vendor prints as a hole.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with nothing above the line keeps its row with NULL product columns, and IS NULL finds those rows. IS NOT NULL would list the one vendor that does clear 150 and invert the correction.",
      },
    ],
    distractors: ["INNER", "RIGHT", "OUTER", "100", "200"],
    walkthrough:
      "Five vendors print: Alpine Audio GmbH, Andes Naturals SA, Midwest Hardware Co, Pacific Textiles and Shenzhen Electro — none of them prices a single SKU above 150. The claim's lone survivor is Nordic Gadgets AB, whose Smart Watch S sits at 199.99; the closest runners are the Noise-Canceling Headset at 149.99, which misses the line by a cent and a half, and the 4K Webcam Pro at 129. So premium-above-150 is a one-vendor story, and the note gets rewritten as such. The threshold's sensitivity is the teaching point: at 100 the hole list shrinks to three vendors (Shenzhen, Pacific, Andes), at 200 it swallows all six — the line's exact value decides whether the claim survives, and the record, not the note, settles it. The RIGHT flavor would print Nordic's one qualifying line and nothing else; the filter-in-WHERE mistake would drop the ghosts and print an empty list that reads as claim confirmed.",
  },
  {
    id: "cs-441",
    tier: "medium",
    topic: "l13",
    universe: "month-close",
    title: "Six names the close has to chase",
    brief:
      "From: Controller. Re: month-close chase list, unshipped book.\n\nClose week needs its chase list: accounts whose bookings have never shipped even once, counted, so ops knows how many conversations this month's unshipped review actually is. One number for the tracker, then the team pulls names from it — but the number has to be the record's number, not a guess from last month.",
    ask: "Count of accounts with no shipped booking.",
    template: `SELECT COUNT(*) AS never_shipped
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE {2}.id IS {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "The chase list is the absence of 'shipped', quoted, and it must sit inside the reunion condition so the unmatched accounts survive as rows. Filtering status in WHERE instead collapses the ghosts and the tracker would read zero.",
      },
      {
        answer: "o",
        kind: "keyword",
        label: "the side being probed",
        why: "The hole test reads the booking alias — o.id IS NULL marks a kept row with no match. Probing the account alias instead tests an id that is never empty and the tracker prints 0 chase items.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "IS NULL keeps the ghost rows the count exists for; IS NOT NULL counts the ten accounts that do ship — the complement, and the wrong list for chase week.",
      },
    ],
    distractors: ["'delivered'", "'pending'", "NOT NULL", "INNER", "c"],
    walkthrough:
      "The tracker prints 6 — six accounts have never had a booking ship: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato, Olivia Brown, holding 17 bookings and 7,122.00 between them. Chase week is six conversations, not a backlog purge, and the money figure sizes them. Two failure modes are worth rehearsing before anyone re-runs this. First, the filter-in-WHERE collapse: move the status test out of the reunion and the count prints 0 — a tracker that says nobody needs chasing while 7,122.00 sits unshipped. Second, the probe-direction swap: count with IS NOT NULL and the tracker prints 10, the shipped-clean half, which reads as good news and closes the review early. The close wants the six names and their 17 tickets; everything else on that spectrum is a different report.",
  },
  {
    id: "cs-442",
    tier: "medium",
    topic: "l13",
    universe: "refund-audit",
    title: "Delivered coverage, ghosts included",
    brief:
      "From: Refund audit desk. Re: coverage denominator, delivered book.\n\nThe refund policy keys off accounts with delivery history, so the audit needs the covered-account denominator counted from the record — accounts, not tickets. The registrar keeps every account on the roll even when their columns come back empty, and the audit wants the roll-count as printed, with a second figure for what the count becomes if the roll is cut to matched accounts only.",
    ask: "Account-count coverage of the delivered book, ghosts kept.",
    template: `SELECT COUNT({1}) AS covered_accounts
FROM customers c
{2} JOIN orders o ON o.customer_id = c.id AND o.status = {3};`,
    slots: [
      {
        answer: "DISTINCT c.id",
        kind: "keyword",
        label: "the account counter",
        why: "Coverage is a head-count of accounts, so the counter must dedupe the account id — one row per account no matter how many delivered tickets they hold. Counting rows instead prints ticket volume and the denominator nearly triples.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The roll keeps every account, matched or not — that is what a registrar's roll is. The inner flavor silently drops the one unmatched account and the coverage count misses it.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status being probed",
        why: "The refund book keys on 'delivered', quoted and exact. 'shipped' counts a different covered set and the refund eligibility rules would be audited against the wrong denominator.",
      },
    ],
    distractors: ["*", "INNER", "c.status"],
    walkthrough:
      "The roll-count prints 16: 15 accounts with at least one delivered ticket, plus one kept ghost — Liam O'Brien, whose only booking shipped but never delivered, yet still counts as an account on the roll because the LEFT flavor keeps his row. Behind the headline: 52 delivered tickets land on those 15 matched accounts, and the 16th account is exactly the audit's finding — the refund rules say delivery history, and one account sits at zero. Swap the counter to a row count and the figure becomes 53 (52 tickets plus one ghost row); cut the roll to an inner reunion and it becomes 15, and the hole disappears from the very report meant to surface it. The three versions — 16, 53, 15 — are the same reunion read three ways, and only the account-deduped roll-count answers the question the policy actually asks.",
  },
  {
    id: "cs-443",
    tier: "medium",
    topic: "l13",
    universe: "pricing",
    title: "Six cities, six holes, one account each",
    brief:
      "From: Head of Product. Re: regional follow-up map, unshipped book.\n\nThe unshipped review organizes by city — each follow-up owns a geography, so the map wants the cities holding accounts with no shipped booking, one row per city with the count of gap accounts. Filed A to Z so the regional owners can split the list without arguing about order.",
    ask: "Cities with accounts lacking any shipped booking, counted, A to Z.",
    template: `SELECT c.city, COUNT(*) AS gap_accounts
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE o.id IS {2}
GROUP BY c.city
ORDER BY c.city {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "The map profiles the absence of 'shipped', tested inside the reunion so unmatched accounts survive. 'delivered' would map a single city and the regional split would hand five owners nothing to do.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "Gap accounts exist as kept rows with NULL booking columns, and IS NULL keeps them for the grouping. IS NOT NULL maps the shipped-covered cities instead — the complement of the follow-up list.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing order",
        why: "A to Z is ascending — Dubai first, Tallinn last, a stable order two owners can share. DESC files the same six cities back to front and every regional split gets argued twice.",
      },
    ],
    distractors: ["'delivered'", "'pending'", "INNER", "DESC"],
    walkthrough:
      "Six cities print, each with a count of one: Dubai, London, Lyon, Nagoya, São Paulo, Tallinn. The count column is the quiet finding — no city holds two gap accounts, so the follow-up map is six one-account geographies with zero handoff risk. The names behind the cities: Farid in Dubai, Olivia in London, Chloe in Lyon, Keiko in Nagoya, Bruno in São Paulo, Dmitri in Tallinn. Probe 'delivered' instead and the map collapses to one city (Cork, Liam's); probe 'pending' and it grows to eight cities, and the regional owners would be chasing accounts that do have shipped history. The direction flag matters less than the probe but still matters: DESC files the same six rows back to front, and a list that must be split three ways wants one canonical order. The INNER flavor prints nothing at all — a blank map that reads as no gaps.",
  },
  {
    id: "cs-444",
    tier: "medium",
    topic: "l13",
    universe: "inventory",
    title: "The electronics shelf's three absent vendors",
    brief:
      "From: Inventory count desk. Re: electronics sourcing coverage.\n\nThe electronics shelf gets audited for sourcing coverage: which vendors on the file hold none of it. The count desk wants those absentees with their scorecard ratings attached, best rating first, so the coverage note can point at the strongest vendors not yet on the shelf.",
    ask: "Vendors with no Electronics product, with rating, best first.",
    template: `SELECT s.name, s.rating
FROM suppliers s
{1} JOIN products p ON p.supplier_id = s.id AND p.category = {2}
WHERE p.id IS {3}
ORDER BY s.rating {4};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Absent vendors match no electronics row and survive only as kept rows with blank product columns. The inner flavor deletes them and the coverage note would claim every vendor is on the shelf.",
      },
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the shelf being probed",
        why: "The coverage audit is scoped to the exact shelf text 'Electronics', quoted and case-sensitive. 'Fitness' would audit a single yoga mat's vendor and print five absentees from a one-SKU category.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with no electronics keeps its row with NULL product columns, and IS NULL finds the absentees. IS NOT NULL lists the three vendors who hold the shelf — the holders, not the gaps.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the best-rating-first sort",
        why: "The note points at the strongest absent vendors first, so ratings sort descending — the 4.8 gap leads. ASC would bury the best prospect under the weakest and the note loses its point.",
      },
    ],
    distractors: ["INNER", "'Fitness'", "NOT NULL", "ASC"],
    walkthrough:
      "Three absentees print, best rating first: Alpine Audio GmbH at 4.8, Midwest Hardware Co at 4.4, Andes Naturals SA at 4.0. The electronics shelf itself — Mechanical Keyboard K1 at 89.99, Wireless Mouse M3 at 34.50, USB-C Hub at 49 — sources entirely from the other three vendors (Nordic, Shenzhen, Pacific), worth 4,818.61 in lifetime line revenue that the absentees share none of. The coverage note's angle writes itself: the file's single best-rated vendor holds zero electronics, and the second-strongest absentee is not far behind. Probe 'Fitness' instead and the absentees balloon to five, because that category lives on one yoga mat with one vendor — category choice decides whether the audit reads as a gap or as the whole file. Swap to IS NOT NULL and the note prints the shelf's actual holders; flip the sort and the 3.0-point rating spread reads bottom-up, leading with the weakest prospect.",
  },
  {
    id: "cs-445",
    tier: "medium",
    topic: "l13",
    universe: "funnel",
    title: "Where the shipped-gaps live",
    brief:
      "From: Growth marketing lead. Re: suppress-list weights by region.\n\nThe nurture suppress list gets weighted by region before the send: how many no-shipment accounts sit in each region, heaviest first, so the regional teams see their own slice. One row per region with the gap count — and the regions that print nothing matter as much as the ones that do.",
    ask: "Gap counts by region for accounts with no shipped booking, heaviest first.",
    template: `SELECT c.region, COUNT(*) AS gaps
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = {1}
WHERE o.id IS {2}
GROUP BY c.region
ORDER BY gaps {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "The weights track the absence of 'shipped', tested inside the reunion so the gap rows survive to be counted. 'delivered' would weight a one-region map and three teams would stand down.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "Gap accounts are kept rows with NULL booking columns, and IS NULL keeps them for the regional count. IS NOT NULL counts the shipped-clean accounts — the compliment, not the gap.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "Regional teams read their slice by weight, so the biggest gap count leads. ASC would put the single-account region on top and the three-account region — the actual workload — at the bottom.",
      },
    ],
    distractors: ["'delivered'", "'pending'", "NOT NULL", "INNER", "ASC"],
    walkthrough:
      "Three rows print, heaviest first: EU 3, APAC 2, LATAM 1 — and the US prints nothing, because both American accounts ship clean. That absence is the map's cleanest fact: the US needs no suppress logic at all, while the EU carries half the gap list (Chloe, Dmitri, Olivia) and APAC a third (Farid, Keiko). Six gaps over four regions is a concentrated problem: one region holds half of it, one holds none. Probe 'delivered' and the map shrinks to a single EU row; probe 'pending' and it becomes EU 5, APAC 1, US 1, LATAM 1 — a completely different workload split, with two teams that had nothing to do suddenly on the list. The INNER flavor prints an empty map and every region stands down while six accounts still hold 17 unshipped bookings. Flip to ascending and the LATAM single sits on top, reading like the biggest problem in the file.",
  },
  {
    id: "cs-446",
    tier: "medium",
    topic: "l13",
    universe: "supplier",
    title: "Four vendors never seen in apparel",
    brief:
      "From: Supply-chain lead. Re: apparel expansion shortlist.\n\nApparel is the smallest shelf on the file and the QBR wants to know who is not in it: every vendor with no apparel product, alphabetical, as the expansion shortlist. The note argues the strongest of them already pass every other audit, so the shortlist order is alphabetical and the argument is prose.",
    ask: "Vendors with no Apparel product, alphabetical.",
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
        why: "Shortlist vendors match no apparel row and survive only as kept rows with blank product columns. The inner flavor prints an empty shortlist and the expansion note loses its candidates.",
      },
      {
        answer: "'Apparel'",
        kind: "keyword",
        label: "the shelf being probed",
        why: "The shortlist is defined against the exact shelf text 'Apparel', quoted and case-sensitive. 'Wearables' would shortlist a different pair of vendors and the QBR note would argue from the wrong list.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with no apparel reads NULL on the product side, and IS NULL keeps it for the shortlist. IS NOT NULL prints the two vendors who own the shelf — the incumbents, not the candidates.",
      },
    ],
    distractors: ["INNER", "OUTER", "'Fitness'", "'Wearables'", "NOT NULL"],
    walkthrough:
      "Four vendors print: Alpine Audio GmbH, Andes Naturals SA, Midwest Hardware Co, Nordic Gadgets AB. The apparel shelf itself is tiny — Running Socks at 18.50 (Shenzhen Electro) and the Cycling Jersey at 65 (Pacific Textiles) are the whole category, 1,984.93 of lifetime line revenue split between exactly two vendors. So the expansion story is four candidates against a two-vendor incumbent set, and the strongest candidate by rating (Alpine, 4.8) already tops the shortlist alphabetically by coincidence. Probe 'Fitness' instead and the shortlist grows to five — that category is one yoga mat deep at one vendor — while 'Wearables' swaps Andes and Nordic out for Shenzhen and Pacific, the incumbent pair, which would put the current holders on their own expansion list. The INNER flavor prints nothing and the QBR reads apparel as fully covered. OUTER alone fails to parse — the flavor needs its LEFT.",
  },
  {
    id: "cs-447",
    tier: "hard",
    topic: "l13",
    universe: "expense",
    title: "Open money on accounts that never shipped",
    brief:
      "From: Ops finance, spend review. Re: the exposure pocket.\n\nThe review's sharpest question is the pocket where two absences overlap: accounts that currently hold open money yet have never had a single booking ship. Names only, A to Z — this list goes straight to the escalation annex, and it must be the overlap, not either absence alone.",
    ask: "Accounts with no shipped booking but at least one pending booking, A to Z.",
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
        label: "the never-side status",
        why: "The never-side probe asks for the absence of 'shipped', inside its own reunion condition. Swapping the two status probes turns the list into its mirror — accounts that shipped but hold nothing open — and the annex would escalate the wrong names.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-side status",
        why: "The open side needs 'pending', quoted, matched in its own LEFT reunion and asserted present with IS NOT NULL. Reusing 'shipped' on both sides forces an empty intersection — nothing can both have and lack a shipped booking.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the absence test",
        why: "The never-side asserts osh.id IS NULL — a kept row with no shipped match. Flip it to IS NOT NULL and the pocket becomes never-pending accounts with open money, a contradiction that prints zero rows.",
      },
    ],
    distractors: ["'delivered'", "'cancelled'", "INNER", "NOT NULL"],
    walkthrough:
      "Three names print: Chloe Dubois, Farid Nasser, Keiko Sato — accounts with open money and zero shipped history, ever. The exposure: Chloe holds 1,309.92 pending, Farid 1,088.44 (the file's single biggest open ticket, number 74), Keiko 149.00 — 2,547.36 of open money on accounts that have never completed the shipping step once. The overlap construction is the hard part: two independent LEFT reunions on the same register, one asserting absence (IS NULL on the shipped side) and one asserting presence (IS NOT NULL on the pending side), and the pocket is the AND of both. Get the directions backwards and the list empties; merge the probes into one reunion and the two questions interfere — a row cannot both match and not match the same condition. The mirror pockets are worth naming: never-shipped AND never-pending is Bruno, Dmitri and Olivia, and shipped-but-nothing-open is ten accounts the annex never needs to see.",
  },
  {
    id: "cs-448",
    tier: "hard",
    topic: "l13",
    universe: "growth",
    title: "Seventeen stranded bookings, one sum",
    brief:
      "From: Chief of Staff. Re: board annex, the unshipped book.\n\nThe annex sizes the unshipped book in one row: how many bookings sit with accounts that have never shipped anything, and what they total. Both figures on one line, computed from the record — the board reads the count and the money, and neither number may come from a sample or a hunch.",
    ask: "Count and total of bookings belonging to accounts with no shipped booking.",
    template: `SELECT COUNT(o.id) AS stranded_orders, ROUND(SUM(o.total), 2) AS exposure
FROM customers c
LEFT JOIN orders osh ON osh.customer_id = c.id AND osh.status = {1}
LEFT JOIN orders o ON o.customer_id = c.id
WHERE osh.id IS {2} AND {3} IS NOT NULL;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the never-side status",
        why: "The stranded set is defined by the absence of 'shipped', tested inside the reunion that decides which accounts survive. 'delivered' would strand only Liam's single 705.39 ticket and the annex would understate the book by sixteen bookings.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the absence test",
        why: "osh.id IS NULL keeps the accounts with no shipped match — the hole rows the whole annex counts from. IS NOT NULL flips to the ten shipped-covered accounts and sums their 86 bookings instead.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the live-order probe",
        why: "The second reunion pairs every booking of the surviving accounts, and o.id IS NOT NULL keeps only real ticket rows — the kept ghosts carry no ticket numbers to sum. Probing the shipped side's id instead contradicts the hole test and zeroes the row.",
      },
    ],
    distractors: ["INNER", "op.id", "oi.id", "s.id"],
    walkthrough:
      "One row prints: 17 stranded bookings, 7,122.00 of exposure. Per account: Chloe 5 / 2,667.93, Farid 3 / 1,458.97, Keiko 4 / 1,098.60, Bruno 2 / 852.44, Dmitri 2 / 599.26, Olivia 1 / 444.80 — six accounts, 17 of the file's 103 bookings, and 7,122.00 against the 34,833.28 book: roughly a fifth of all recorded value sits with accounts that have never shipped once. The construction earns its hard tier: the first reunion decides who survives (never-shipped accounts as kept ghosts), the second reunion gathers their actual bookings, and the probe columns separate kept-ghost rows from real tickets — sum without that separation and the arithmetic still works here, but the pattern is one edit away from doubling the ghost rows into the sum. Swap the probe status to 'delivered' and the annex prints 1 / 705.39; the difference between those two lines is the entire point of running it from the record.",
  },
  {
    id: "cs-449",
    tier: "hard",
    topic: "l13",
    universe: "fraud",
    title: "Twelve clean accounts against seven cancellations",
    brief:
      "From: Fraud spot-check desk. Re: cancellation control group.\n\nThe spot-check needs a control group: accounts with no cancelled booking at all, with regions attached, filed by region then name. Seven tickets got cancelled somewhere in the book — the desk wants the clean list as the control, and expects the exposed minority to be visibly small.",
    ask: "Accounts with no cancelled booking, with region, by region then name.",
    template: `SELECT c.name, c.region
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE o.id IS {3}
ORDER BY c.region, c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "Clean accounts are the ones the cancelled filter cannot match, kept only by the LEFT flavor. The inner flavor would print the four exposed accounts and hand the desk the suspects as the control group.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status being probed",
        why: "The control group is defined by the absence of 'cancelled', quoted, inside the reunion condition. 'shipped' profiles six different names and the control group stops being a control.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the hole test",
        why: "Clean accounts read NULL on the booking side, and IS NULL keeps them. IS NOT NULL lists the cancellation owners — the exact four people the control group exists to contrast with.",
      },
    ],
    distractors: ["INNER", "'shipped'", "'delivered'", "'pending'", "NOT NULL"],
    walkthrough:
      "Twelve rows print — twelve of sixteen accounts have never had a booking cancelled, while the file's 7 cancellation tickets concentrate in just 4 accounts. That concentration is the desk's opening fact: cancellation is a minority behavior, and the 12-name control list is three-quarters of the book. The regional filing matters because the spot-check reads patterns geographically: the control list spans all four regions, so whatever drives the 4 exposed accounts, it is not a region-wide effect — clean and exposed accounts sit side by side in the same regions. Probe 'shipped' instead and the control shrinks to six names, which would accidentally describe the opposite risk profile (never-shipped accounts are the workflow-failure group, not the fraud-control). The probe discipline is the case's lesson: one status word separates a control group from a suspect list, and swapping IS NULL for IS NOT NULL hands the desk the four cancellation owners labelled as clean.",
  },
  {
    id: "cs-450",
    tier: "hard",
    topic: "l13",
    universe: "catalog",
    title: "Wearables' four absent vendors, best first",
    brief:
      "From: Warehouse catalog desk. Re: wearables sourcing gap.\n\nWearables is the growth category and the desk believes the vendor file is deep enough to expand it. The gap list: vendors with no wearables product, with scorecard ratings, best rating first — the desk wants the strongest unassigned vendors at the top of the page, not buried under the weak ones.",
    ask: "Vendors with no Wearables product, with rating, best first.",
    template: `SELECT s.name, s.rating
FROM suppliers s
LEFT JOIN products p ON p.supplier_id = s.id AND p.category = {1}
WHERE p.id IS {2}
ORDER BY s.rating {3};`,
    slots: [
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the category being probed",
        why: "The gap list is defined against the exact category text 'Wearables', quoted and case-sensitive, inside the reunion condition. 'Audio' would print the vendors absent from a three-SKU shelf someone else already sources.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the blank-line test",
        why: "A vendor with no wearables keeps its row with NULL product columns, and IS NULL finds the gap list. IS NOT NULL prints the two incumbents who already own the category — Nordic and Andes.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the best-rating-first sort",
        why: "The desk wants the strongest unassigned vendor at the top, so ratings sort descending — the 4.8 gap leads the page. ASC would open on the weakest prospect and the expansion call would start at the wrong desk.",
      },
    ],
    distractors: ["'Audio'", "NOT NULL", "INNER", "ASC", "s.supplier_id"],
    walkthrough:
      "Four vendors print, best first: Alpine Audio GmbH at 4.8, Midwest Hardware Co at 4.4, Shenzhen Electro at 4.1, Pacific Textiles at 3.9. The category they are absent from is a two-vendor affair — Fitness Band X2 at 79 (Andes Naturals) and Smart Watch S at 199.99 (Nordic Gadgets) — worth 6,929.12 in lifetime line revenue. So the wearables expansion story has an obvious first call: the file's best-rated vendor holds zero wearables and sits at the top of the gap list with the rating to argue for itself. The probe's sensitivity is the lesson: swap to 'Audio' and the gap list reshuffles to Nordic, Shenzhen and Pacific — the incumbent Smart Watch vendor suddenly looks like a candidate for a shelf it already supplies. INNER would print an empty page and the desk would conclude the file is fully wearables-committed; IS NOT NULL prints the two incumbents as if they were the gaps. And the erroring guess — pointing the reunion at the vendor file's non-existent supplier column — fails before the page prints at all.",
  },
  {
    id: "cs-451",
    tier: "hard",
    topic: "l13",
    universe: "month-close",
    title: "Ten and six: the shipped ledger reconciles",
    brief:
      "From: Controller. Re: close checklist, the coverage ledger.\n\nThe close checklist wants one ledger that reads both sides of the shipped question per region: how many accounts in each region have shipped history, how many have none, heaviest gap-count first. Two count columns, one scan, regions grouped — and the ledger must reconcile to the sixteen accounts on the file, because a ledger that does not add up gets re-run at 11pm.",
    ask: "Shipped-coverage ledger by region, gap side sorted heaviest first.",
    template: `SELECT c.region,
COUNT(DISTINCT CASE WHEN osh.id IS NOT NULL THEN c.id END) AS shipped_also,
COUNT(DISTINCT CASE WHEN osh.id IS {1} THEN c.id END) AS never_shipped
FROM customers c
LEFT JOIN orders osh ON osh.customer_id = c.id AND osh.status = {2}
GROUP BY c.region
ORDER BY never_shipped {3};`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the gap-side test",
        why: "The gap column counts kept rows with no shipped match — CASE WHEN osh.id IS NULL keeps the account id only on ghost rows. IS NOT NULL here would count the covered side twice and the ledger's two columns would print identical numbers.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the status being probed",
        why: "Both columns read the same 'shipped' reunion — one counts matches, one counts ghosts. 'delivered' reconciles to a different split (15 and 1) and the close checklist would file coverage against the wrong status.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "The close works the biggest gap first, so the ledger sorts by the gap column descending. ASC would lead with the region that has nothing to chase and bury the three-account gap at the bottom.",
      },
    ],
    distractors: ["NOT NULL", "'delivered'", "'pending'", "INNER", "ASC"],
    walkthrough:
      "Four rows print, gap-heaviest first: EU splits 5 shipped-also / 3 never, APAC 3 / 2, LATAM 0 / 1, US 2 / 0 — and the two count columns reconcile to the file exactly: 10 plus 6 accounts, 16 total. The one-scan construction is the point: both count columns read the same kept rows, splitting matches from ghosts with a CASE inside COUNT(DISTINCT), so the ledger cannot disagree with itself the way two separate reports can. The US row is the quiet headline — two accounts, both covered, zero gaps — while LATAM's single account is its entire gap list. Swap the gap-side test to IS NOT NULL and both columns print the covered counts (5/5, 3/3, 2/2) — a ledger that reconciles to 20 and gets re-run at 11pm. Probe 'delivered' and the split becomes 15 and 1 with the single gap in the EU; probe 'pending' and it becomes 8 and 8, a completely different chase list. Drop the ghosts with an inner reunion and the gap column zeroes out region by region — a clean-looking ledger built on rows that were never there.",
  },
];
