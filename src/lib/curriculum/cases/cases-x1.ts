// Case batch X1 — Module 6 (Expert Clinic) cases cs-1501…cs-1520, wave 1.
// GROUP_CONCAT folds over the storefront db. Figures from the W1 receipt pool
// (m6-cases-w1-facts*.ts). All cases audited by scripts/case-audit.ts (x-laws).
import type { CaseStudy } from "./types";

export const casesX1: CaseStudy[] = [
  {
    id: "cs-1501",
    tier: "easy",
    topic: "x1",
    universe: "supplier",
    title: "The alphabetical supplier shelf",
    brief:
      "From: Procurement. Re: the vendor one-liner.\n\nThe ops deck opens with a single line naming every supplier we buy from, alphabetical, comma-separated. Fold the supplier names into one cell so the deck can carry the whole vendor list as one string.",
    ask: "What single folded line names every supplier, alphabetically, comma-separated?",
    template: `SELECT {1}(name, {2} ORDER BY {3}) AS shelf FROM suppliers;`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "GROUP_CONCAT walks every row and glues the values into one string cell — the only SQLite aggregator that returns text. SUM or COUNT would collapse the names into a number, not a line.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the glue between names",
        why: "A comma followed by a space keeps the line readable — 'Alpine Audio GmbH, Andes Naturals SA'. A bare comma 'Alpine Audio GmbH,Andes' or a pipe would read like a machine dump, and the deck wants prose.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the fold order",
        why: "ORDER BY name makes the fold deterministic and alphabetical — the same line every run. Folding on region would scatter the vendors across continents mid-sentence.",
      },
    ],
    distractors: ["TOTAL", "'; '", "region"],
    walkthrough:
      "GROUP_CONCAT is the fold: it consumes the six supplier rows bottom-up and emits one text cell. The second argument is the glue — with ', ' the names stay readable, and the in-aggregate ORDER BY name pins the order so the shelf is alphabetical no matter how the engine scans the table. The line reads: Alpine Audio GmbH, Andes Naturals SA, Midwest Hardware Co, Nordic Gadgets AB, Pacific Textiles, Shenzhen Electro. Without the ORDER BY the fold order is whatever the scan found first — Alpine's neighbours could shuffle between runs. One query, six rows in, one string out: that is the vendor one-liner for the deck.",
  },
  {
    id: "cs-1502",
    tier: "easy",
    topic: "x1",
    universe: "growth",
    title: "The order-status recital",
    brief:
      "From: Growth lead. Re: the lifecycle banner.\n\nThe dashboard banner shows the order lifecycle as one line: every distinct status, comma-separated, A to Z. Fold the distinct statuses into a single cell so the banner can render the lifecycle at a glance.",
    ask: "Which single line recites the order statuses alphabetically, comma-separated?",
    template: `SELECT {1}(status, {2}) AS recital
FROM (SELECT status FROM orders GROUP BY status ORDER BY status {3});`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "GROUP_CONCAT is the only aggregate that returns a string, so it is the only tool that can turn four status rows into one banner line. COUNT would hand back 4 — a number, not a recital.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the banner separator",
        why: "The banner wants human punctuation: 'cancelled, delivered, pending, shipped'. A bare comma or a pipe would look like a log file, and the design spec calls for prose with spaces.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the recital direction",
        why: "Ascending sorts the statuses alphabetically — cancelled first, shipped last — which is the lifecycle read the banner promises. Descending would open on shipped and read backwards.",
      },
    ],
    distractors: ["SUM", "' | '", "DESC"],
    walkthrough:
      "Two stages, one line. The derived table first collapses 103 orders to their four distinct statuses and sorts them ascending: cancelled, delivered, pending, shipped. Then GROUP_CONCAT folds those four rows into one cell, gluing with ', ' so the banner reads like a sentence: cancelled, delivered, pending, shipped. Flip the direction and the banner opens on shipped — the end of the story first. The two-stage shape matters because GROUP_CONCAT alone has no DISTINCT-plus-sort guarantee: stage one normalises, stage two renders. This is the pattern behind every 'status recital' widget in the dashboard.",
  },
  {
    id: "cs-1503",
    tier: "easy",
    topic: "x1",
    universe: "catalog",
    title: "The Audio shopping list",
    brief:
      "From: Merchandising. Re: the category shelf card.\n\nEach category page carries a shelf card: how many items the category stocks and one folded line naming them, alphabetical. Build the card for the Audio shelf — three products, one line.",
    ask: "How many Audio products do we stock, and what folded line names them alphabetically?",
    template: `SELECT COUNT(*) AS items, {1}(name, {2} ORDER BY name) AS shelf
FROM products WHERE category = {3}
GROUP BY category;`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "The shelf card needs the names in one cell, and GROUP_CONCAT is the fold that does it. TOTAL would try to sum text and error out; the card wants a string, not a number.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the shelf separator",
        why: "Comma-plus-space keeps three product names readable on one line: 'Bluetooth Speaker Mini, Noise-Canceling Headset, Studio Desktop Mic'. A slash or semicolon would fight the site's copy style.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf category",
        why: "The card is scoped to Audio — three products, from the speaker to the mic. Any other category folds a different shelf: Wearables has two items, Fitness just one.",
      },
    ],
    distractors: ["TOTAL", "' / '", "'Wearables'"],
    walkthrough:
      "The WHERE clause narrows the sixteen-product catalog to the Audio shelf, and the GROUP BY lets us show both facts at once: COUNT(*) renders the item total — three — while GROUP_CONCAT folds the names into one alphabetical line, Bluetooth Speaker Mini, Noise-Canceling Headset, Studio Desktop Mic. The in-aggregate ORDER BY name pins the order; without it the fold would follow scan order and the card could reshuffle between deploys. One row out, two cells: the count for the badge, the fold for the copy. That is the entire shelf card.",
  },
  {
    id: "cs-1504",
    tier: "easy",
    topic: "x1",
    universe: "month-close",
    title: "The EU roster fold",
    brief:
      "From: Finance ops. Re: the regional roll-call.\n\nThe month-close pack opens each region with a roll-call line: every member name folded into one string. For Europe we also report how long that folded line is, because the pack template sizes its header rows by character count.",
    ask: "What is the folded EU roster line, and how many characters long is it?",
    template: `SELECT roster, LENGTH(roster) AS fold_len FROM (
  SELECT {1}(name, {2} ORDER BY name) AS roster
  FROM customers WHERE region = {3});`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Eight names must become one string, and GROUP_CONCAT is the only aggregate that returns text. Every other aggregator would hand back a number and the roll-call would be unreadable.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the roll-call glue",
        why: "The pack prints the fold verbatim, so the separator is punctuation: 'Alice Chen, Chloe Dubois, …'. Spaces after the commas are what make it a roll-call instead of a token dump.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region scope",
        why: "The roll-call is Europe's line — eight members from Alice Chen to Pedro Alvarez. Scoping to APAC would fold five different names and a different header size.",
      },
    ],
    distractors: ["TOTAL", "'; '", "'APAC'"],
    walkthrough:
      "The inner query folds Europe's eight member names, alphabetical, glued with ', ': Alice Chen, Chloe Dubois, Dmitri Volkov, Isabella Rossi, Liam O'Brien, Noah Meyer, Olivia Brown, Pedro Alvarez. The outer query then measures the fold with LENGTH — 110 characters, because the eight names carry 96 letters plus the fourteen separator characters between them. That number drives the pack template's header sizing. Note the shape: fold first in a derived table, measure second — you cannot compute LENGTH on the same aggregate in the same SELECT list and keep the fold readable. Fold, then measure: two layers, one line.",
  },
  {
    id: "cs-1505",
    tier: "easy",
    topic: "x1",
    universe: "supplier",
    title: "The reverse pipe shelf",
    brief:
      "From: Warehouse ops. Re: the label printer.\n\nThe shelf labels print supplier names joined by pipes, and the printer driver renders the LAST name first — so the query must fold the names in reverse alphabetical order or the labels come out mirrored.",
    ask: "What does the pipe-joined supplier line look like when folded in reverse alphabetical order?",
    template: `SELECT {1}(name, {2} ORDER BY name {3}) AS shelf FROM suppliers;`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Six supplier rows must leave the query as one label string. GROUP_CONCAT is the text folder; anything else aggregates away the names entirely.",
      },
      {
        answer: "' | '",
        kind: "keyword",
        label: "the label separator",
        why: "The label spec calls for pipes — 'Shenzhen Electro | Pacific Textiles'. A comma would understate the breaks and the scanner reads pipes as field boundaries.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the fold direction",
        why: "The printer renders the last-folded name at the top, so the fold must run Z to A for the labels to read A to Z. Ascending would mirror every shelf label in the building.",
      },
    ],
    distractors: ["TOTAL", "', '", "ASC"],
    walkthrough:
      "Same fold as the alphabetical shelf, three turns of the dial. The separator becomes ' | ' because the label printer treats pipes as boundaries; the direction flips to DESC so the in-aggregate ORDER BY hands GROUP_CONCAT the names Z to A. The cell that leaves the query reads: Shenzhen Electro | Pacific Textiles | Nordic Gadgets AB | Midwest Hardware Co | Andes Naturals SA | Alpine Audio GmbH. The printer reverses it, and the label on the shelf reads A to Z. A fold is only as good as its order and its glue — both are arguments here, and both are wrong the moment one chip is misplaced.",
  },
  {
    id: "cs-1506",
    tier: "medium",
    topic: "x1",
    universe: "growth",
    title: "The five-member gate",
    brief:
      "From: Community team. Re: the big-chapter rosters.\n\nOnly regions with at least five members get a printed roster line in the welcome pack — smaller chapters get a postcard instead. Fold each qualifying region's names, alphabetical, and show the member count beside the fold.",
    ask: "Which regions fold a roster line under the five-member gate, and what do the folds say?",
    template: `SELECT region, COUNT(*) AS members, {1}(name, {2} ORDER BY name) AS roster
FROM customers GROUP BY region HAVING COUNT(*) >= {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Each qualifying region needs its member names glued into one printable line. GROUP_CONCAT folds per group — one roster cell per region — while every other aggregate would print a number.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the roster glue",
        why: "The welcome pack prints the fold as prose, so names are separated by comma-and-space. Bare commas would cram 'Grace Kim,Hiro Tanaka' together and the print shop sends it back.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the gate height",
        why: "Five is the printed-roster threshold: APAC with exactly 5 clears it and EU with 8 sails through, while US (2) and LATAM (1) fall to the postcard list. At 6 the APAC roster vanishes; at 2 the gate collapses.",
      },
    ],
    distractors: ["COUNT", "' | '", "2", "6"],
    walkthrough:
      "GROUP BY region buckets the sixteen members, HAVING applies the gate before anything prints, and GROUP_CONCAT folds each surviving bucket into one line. The census is EU 8, APAC 5, US 2, LATAM 1 — so the gate at 5 keeps two chapters. EU folds: Alice Chen, Chloe Dubois, Dmitri Volkov, Isabella Rossi, Liam O'Brien, Noah Meyer, Olivia Brown, Pedro Alvarez. APAC folds: Farid Nasser, Grace Kim, Hiro Tanaka, Keiko Sato, Maya Patel. The member count rides along as the badge. The HAVING-versus-WHERE distinction is the quiet lesson: a gate on COUNT(*) can only be applied after grouping — WHERE runs before the buckets exist.",
  },
  {
    id: "cs-1507",
    tier: "easy",
    topic: "x1",
    universe: "fraud",
    title: "The cancelled ticket fold",
    brief:
      "From: Loss prevention. Re: the cancelled-order manifest.\n\nThe fraud reviewer signs off against a manifest line: every cancelled order's ticket id, comma-separated, in one cell. Fold the cancelled tickets so the manifest carries them as a single string.",
    ask: "Which folded line lists every cancelled order id, comma-separated?",
    template: `SELECT {1}(id, {2}) AS ticket_ids
FROM orders WHERE status = {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Seven ticket ids must leave the query as one manifest string. GROUP_CONCAT folds row values into one cell; SUM would add them and produce a meaningless total.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the manifest separator",
        why: "The reviewer reads the ids aloud down the phone, so comma-plus-space keeps the line speakable: '7, 21, 50, …'. A dash would read like a date range and confuse the sign-off.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the lane filter",
        why: "The manifest is the cancelled lane only — seven tickets. Scoping to pending would fold fourteen different ids and the reviewer would sign off on the wrong set.",
      },
    ],
    distractors: ["SUM", "'-'", "'pending'"],
    walkthrough:
      "The WHERE clause cuts the 103-order table down to the seven cancelled tickets, and GROUP_CONCAT folds their ids into one cell with ', ' glue: 7, 21, 50, 51, 82, 83, 95. No ORDER BY is needed here — the ids arrive in scan order, which for this table is insertion order, already ascending — but the fold is still one string, not seven rows, because the manifest system ingests a single line. This is the audit-trail pattern: a filter that scopes the lane, an aggregate that renders the evidence, and a separator chosen for the human who has to read it back.",
  },
  {
    id: "cs-1508",
    tier: "medium",
    topic: "x1",
    universe: "month-close",
    title: "The invoice lifecycle fold",
    brief:
      "From: Billing ops. Re: the account timeline.\n\nCollections wants each account's invoice history as one line: the status of every invoice in issue order, comma-separated. Build the timeline for Alice Chen's account — the team's reference example for the dunning script.",
    ask: "What is Alice Chen's invoice lifecycle, folded in issue order?",
    template: `SELECT {1}(i.status, {2} ORDER BY i.id) AS lifecycle
FROM invoices i JOIN customers c ON c.id = i.customer_id
WHERE c.name = {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Five invoice statuses must become one timeline string. GROUP_CONCAT folds them; COUNT would say 5 and lose the order story the dunning script needs.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the timeline glue",
        why: "The script reads the line aloud: 'paid, paid, paid, paid, open'. Spaces after the commas keep the rhythm; a slash or pipe would break the reader's cadence.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account scope",
        why: "The reference timeline is Alice's account — four paid invoices then one open. Emma Wilson's fold would show three paid and one open, a different dunning story.",
      },
    ],
    distractors: ["COUNT", "' / '", "'Emma Wilson'"],
    walkthrough:
      "The join attaches each invoice to its customer, the WHERE pins the account to Alice Chen, and the in-aggregate ORDER BY i.id walks the invoices in issue order — the timeline's spine. GROUP_CONCAT then folds the statuses into one cell: paid, paid, paid, paid, open. That trailing 'open' is the dunning trigger; everything before it is history. Fold order matters as much as fold content here — drop the ORDER BY and the open invoice could surface mid-line, and the script's 'starts clean, ends open' heuristic breaks. One join, one filter, one fold: the whole account story in eleven words.",
  },
  {
    id: "cs-1509",
    tier: "hard",
    topic: "x1",
    universe: "refund-audit",
    title: "The void-pattern gate",
    brief:
      "From: Refund audit. Re: the void sweep.\n\nA voided invoice followed by anything else is the signature of a reversed billing run, and audit only reviews accounts whose folded lifecycle contains 'void'. Fold each account's invoice statuses in issue order and keep only the accounts whose fold matches the void pattern.",
    ask: "Which account's folded lifecycle matches the void pattern, and what does the fold say?",
    template: `SELECT c.name, {1}(i.status, {2} ORDER BY i.id) AS lifecycle
FROM invoices i JOIN customers c ON c.id = i.customer_id
GROUP BY c.id HAVING GROUP_CONCAT(i.status) LIKE {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "The audit reviews lifecycles — status strings folded in issue order — not raw rows. GROUP_CONCAT builds that fold per account; COUNT would reduce each account to a number and the pattern would be invisible.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the lifecycle glue",
        why: "The audit tool renders folds verbatim, so the glue is comma-plus-space: 'void, open'. It keeps the evidence human-readable when the finding is pasted into the report.",
      },
      {
        answer: "'%void%'",
        kind: "keyword",
        label: "the pattern gate",
        why: "LIKE '%void%' matches the fold wherever 'void' sits in the lifecycle — the signature of the reversed run. '%open%' would sweep five accounts into review; '%paid%' would drown the audit in noise.",
      },
    ],
    distractors: ["COUNT", "'%open%'", "'%paid%'"],
    walkthrough:
      "Fold first, filter the fold second — that is the whole discipline here. The inner GROUP_CONCAT builds each account's lifecycle in issue order, glued with ', '. The HAVING then applies LIKE '%void%' against an unslotted fold, and exactly one account survives: Liam O'Brien, whose lifecycle reads void, open. That is the reversed-billing signature — a voided invoice followed by a live one — and it is why the pattern gate must run on the fold, not the rows: WHERE status LIKE '%void%' would find the same account but lose the sequence proof. The five '%open%' matches and the twelve '%paid%' matches show how wide the net would have been. Fold, gate, report: one account under review.",
  },
  {
    id: "cs-1510",
    tier: "hard",
    topic: "x1",
    universe: "growth",
    title: "The thirteen active months",
    brief:
      "From: Growth lead. Re: the streak audit.\n\nWe measure member streaks in distinct active months, and the reference streak belongs to the member with thirteen. Count a member's distinct order months with the deduplicating counter so repeat orders in one month count once, and scope the audit to the streak holder by name.",
    ask: "How many distinct active months does the streak holder have, counted with the deduplicating counter?",
    template: `SELECT c.name, COUNT({1} strftime({2}, o.created_at)) AS active_months,
  GROUP_CONCAT(DISTINCT strftime('%Y-%m', o.created_at)) AS months
FROM customers c JOIN orders o ON o.customer_id = c.id
WHERE c.name = {3}
GROUP BY c.id;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the deduplication guard",
        why: "Alice placed several orders in the same months, so COUNT(DISTINCT month) is the streak count — 13. Without the guard, COUNT(ALL month) counts 24 order-events and the streak doubles.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "'%Y-%m' buckets each timestamp into one calendar month — 2024-01, 2024-02 — which is what a streak counts. '%Y' would collapse everything into two years and the streak would read as 2.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the streak holder",
        why: "Alice Chen is the reference streak: 13 distinct months from 2024-01 to 2025-02, missing only 2024-10. Emma Wilson is the runner-up at 12 and would understate the benchmark.",
      },
    ],
    distractors: ["ALL", "'%Y'", "'Emma Wilson'"],
    walkthrough:
      "The join fattens each member to their orders, the WHERE pins the audit to Alice Chen, and the counter does the subtle work. COUNT(DISTINCT strftime('%Y-%m', created_at)) buckets every order timestamp into a calendar month and counts each bucket once: thirteen, from 2024-01 through 2025-02 with only 2024-10 dark. Swap DISTINCT for ALL and the same query counts order-events — 24 — which is volume, not streak. The format string is the second trap: '%Y' would count two years, '%d' would count days. Streak metrics live or die on the bucket and the dedup guard, and this one query shows both.",
  },
  {
    id: "cs-1511",
    tier: "hard",
    topic: "x1",
    universe: "catalog",
    title: "The premium shelf fold",
    brief:
      "From: Merchandising. Re: the two-tier shelf card.\n\nThe catalog page splits every product into premium and budget by a 100-dollar line, then folds each tier's names into one line, alphabetical. Fold both shelves in one query so the card renders from a single result set.",
    ask: "What do the premium and budget folds look like when the catalog splits at 100 dollars?",
    template: `SELECT CASE WHEN price >= {1} THEN 'premium' ELSE 'budget' END AS band,
  {2}(name, {3} ORDER BY name) AS shelf
FROM products GROUP BY band ORDER BY band;`,
    slots: [
      {
        answer: "100",
        kind: "number",
        label: "the tier line",
        why: "The 100-dollar line is the merchandising standard: it puts exactly four products on the premium shelf — the 199.99 watch, the 149.99 headset, the 129 webcam, the 119 mic. At 50 the shelf doubles; at 150 it shrinks to one.",
        noVerify: true,
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Each tier's names must land in one cell, and GROUP_CONCAT folds per group — one shelf string for premium, one for budget. COUNT would print 4 and 12 and the card would show numbers where names belong.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the shelf glue",
        why: "The card renders the folds as copy, so the glue is comma-plus-space. Bare commas would mash 'Smart Watch S,Studio Desktop Mic' into a token dump the designer rejects.",
      },
    ],
    distractors: ["50", "150", "COUNT", "' | '"],
    walkthrough:
      "The CASE stamps every product with a band — price at or above the line is premium, everything under is budget — and GROUP BY band makes two buckets. GROUP_CONCAT folds each bucket's names alphabetically with ', ' glue. Premium at the 100-dollar line: 4K Webcam Pro, Noise-Canceling Headset, Smart Watch S, Studio Desktop Mic. Budget: the twelve remaining names from Bluetooth Speaker Mini to Yoga Mat Eco 6mm. Slide the line to 50 and the premium fold swallows the keyboard, the band, the jersey and the speaker; slide it to 150 and only the watch survives. The fold makes tier composition visible at a glance — which is exactly why merchandising reviews the line, not the count.",
  },
  {
    id: "cs-1512",
    tier: "hard",
    topic: "x1",
    universe: "pricing",
    title: "The arrow trail",
    brief:
      "From: Pricing. Re: the category price ladder.\n\nThe pricing review opens each category with a trail: product names joined by arrows, richest first, so the committee sees the price ladder at a glance. Build the trail for Accessories — three products, top price first.",
    ask: "What does the Accessories price trail look like, folded richest-first with arrows?",
    template: `SELECT category, {1}(name, {2} ORDER BY price {3}) AS trail
FROM products GROUP BY category HAVING category = {4};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Three product names must leave the query as one trail string. GROUP_CONCAT folds them in the ORDER BY's sequence; COUNT would erase the names the committee needs to see.",
      },
      {
        answer: "' → '",
        kind: "keyword",
        label: "the trail arrow",
        why: "Arrows are the ladder's punctuation — 'Laptop Stand Aluminum → Desk Mat Extended'. Commas would read as a list, not a descent, and the committee deck specifies arrows.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the price direction",
        why: "Richest first is the ladder read: the 42.50 stand, then the 24.99 mat, then the 14.99 cable. Ascending would open on the cheapest item and the trail would climb instead of descend.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the scoped category",
        why: "The review starts with Accessories — three products spanning 42.50 to 14.99. Apparel would fold a two-item trail and skip the three-step descent the committee asked to see first.",
      },
    ],
    distractors: ["COUNT", "', '", "ASC", "'Apparel'"],
    walkthrough:
      "The GROUP BY buckets the catalog by category, the HAVING pins the trail to Accessories, and the in-aggregate ORDER BY price DESC hands GROUP_CONCAT the products richest first. With ' → ' glue the cell reads: Laptop Stand Aluminum → Desk Mat Extended → HDMI 2.1 Cable 2m — the 42.50 stand leading the 24.99 mat leading the 14.99 cable. Flip to ASC and the trail starts at the cable, the cheapest thing on the shelf, which is the opposite of what a price ladder means. The arrow separator is not decoration: it is the difference between a sequence the eye follows and a list the eye skips. One bucket, three names, one string — the committee's opening slide.",
  },
  {
    id: "cs-1513",
    tier: "medium",
    topic: "x1",
    universe: "supplier",
    title: "The regional supplier folds",
    brief:
      "From: Sourcing. Re: the vendor map.\n\nThe sourcing map lists each region's suppliers as one folded line, and the map legend orders regions by shelf depth — most suppliers first. Fold the supplier names per region, count them, and sort the deepest shelf to the top.",
    ask: "Which regions fold supplier rosters, listed deepest shelf first?",
    template: `SELECT region, COUNT(*) AS suppliers, {1}(name, {2} ORDER BY name) AS roster
FROM suppliers GROUP BY region
ORDER BY suppliers {3}, region;`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Each region's vendors must land in one map line. GROUP_CONCAT folds per region — 'Pacific Textiles, Shenzhen Electro' for APAC — while COUNT alone would leave the map with numbers and no names.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the roster glue",
        why: "The map legend prints the folds verbatim, so comma-plus-space keeps the vendor names readable. Semicolons would clash with the legend's own punctuation.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the depth sort",
        why: "Deepest shelf first is the legend's order: the two-supplier regions lead, the one-supplier regions follow. Ascending would put LATAM's single vendor at the top and the map would read upside-down.",
      },
    ],
    distractors: ["SUM", "' / '", "ASC"],
    walkthrough:
      "GROUP BY region buckets the six suppliers — APAC 2, EU 2, LATAM 1, US 1 — and GROUP_CONCAT folds each bucket alphabetically with ', ' glue: Pacific Textiles, Shenzhen Electro for APAC; Alpine Audio GmbH, Nordic Gadgets AB for EU; Andes Naturals SA for LATAM; Midwest Hardware Co for US. The ORDER BY sorts on the supplier count descending with region as the tiebreak, so APAC and EU lead the legend (alphabetical between the ties) before the single-vendor regions. Sorting on an aggregate is the quiet trick here — the count exists only after grouping, so it can only be referenced in ORDER BY or HAVING, never WHERE. Fold, count, sort: the whole vendor map in four lines.",
  },
  {
    id: "cs-1514",
    tier: "medium",
    topic: "x1",
    universe: "inventory",
    title: "The longest shelf name",
    brief:
      "From: Inventory. Re: the label audit.\n\nThe label printer chokes on category shelf lines longer than 60 characters, so we audit which category's folded name list is longest. Measure each category's fold length and surface just the worst offender.",
    ask: "Which category folds the longest name line, and how long is it?",
    template: `SELECT category, COUNT(*) AS items, LENGTH({1}(name)) AS fold_len
FROM products GROUP BY category
ORDER BY fold_len {2} LIMIT {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "The audit measures folded name lines, so the fold has to happen inside the query. GROUP_CONCAT builds the line per category; measuring anything else would audit a number, not a shelf.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the audit direction",
        why: "Longest first is how the audit reads: the top row is the printer's problem. Ascending would surface Fitness's 16-character line — the one category nobody is worried about.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the offender count",
        why: "The audit wants the single worst offender, so LIMIT holds at 1 — Audio, whose folded names run 65 characters. At 2 the Electronics shelf rides along at 57 and the report loses its point.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "ASC", "2"],
    walkthrough:
      "GROUP BY category buckets the sixteen products into seven shelves, GROUP_CONCAT folds each shelf's names with the default comma, and LENGTH measures every fold. The results: Audio 65, Electronics 57, Accessories 57, Apparel 39, Wearables 29, Video 28, Fitness 16. Sorted descending and cut at one, the audit names Audio — 'Bluetooth Speaker Mini,Noise-Canceling Headset,Studio Desktop Mic' — as the line that will jam the printer, twelve characters over the budget with a mere three items. The item count riding beside the fold is the diagnosis: it is not that Audio has many products, it is that Audio's names are long. Fold, measure, cut: three lines of SQL, one actionable offender.",
  },
  {
    id: "cs-1515",
    tier: "hard",
    topic: "x1",
    universe: "catalog",
    title: "The Yoga position",
    brief:
      "From: Merchandising. Re: the fold-position check.\n\nThe storefront renders category folds alphabetically, and merchandising wants proof of where 'Yoga' lands inside its category's fold — first position means the mat leads the shelf. Find the category whose fold contains the mat and report the position.",
    ask: "In which category's fold does the yoga mat appear, and at what position?",
    template: `SELECT category, INSTR({1}(name ORDER BY name), {2}) AS pos
FROM products GROUP BY category
HAVING pos > {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "INSTR searches a string, so the category's names must first become one string. GROUP_CONCAT builds that fold per category; without it there is nothing for INSTR to search.",
      },
      {
        answer: "'Yoga'",
        kind: "keyword",
        label: "the search needle",
        why: "The needle is the product prefix 'Yoga' — short enough to survive any name, specific enough to match one product. Searching 'HDMI' instead would land in Accessories and answer the wrong question.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the presence gate",
        why: "INSTR returns 0 when the needle is absent, so HAVING pos > 0 keeps only the category whose fold actually contains the mat. At 13 the Fitness row — position 1 — drops out and the query goes silent.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "'HDMI'", "13", "20"],
    walkthrough:
      "The fold happens per category, then INSTR measures where the needle sits inside it. Fitness's fold is exactly 'Yoga Mat Eco 6mm' — one product — so the needle 'Yoga' hits at position 1: the mat leads its shelf. Every other category's fold misses, INSTR returns 0, and HAVING pos > 0 discards them, leaving a single row: Fitness, position 1. Run the same query for 'HDMI' and the answer moves to Accessories at position 20, behind Desk Mat Extended in the alphabetical fold. The alias-in-HAVING trick is SQLite letting you reference the computed column by name — the fold, the search, and the gate all in three lines. Position 1 is the proof merchandising wanted: the mat opens its shelf.",
  },
  {
    id: "cs-1516",
    tier: "hard",
    topic: "x1",
    universe: "month-close",
    title: "The Chloe position",
    brief:
      "From: Finance ops. Re: the roll-call order proof.\n\nThe month-close pack insists member rosters are alphabetical, and the auditor wants positional proof: find the region whose folded roster contains Chloe and report the character position where her name starts.",
    ask: "In which region's fold does Chloe appear, and at what character position?",
    template: `SELECT region, INSTR(GROUP_CONCAT(name, {1} ORDER BY name), {2}) AS pos
FROM customers GROUP BY region
HAVING pos > {3};`,
    slots: [
      {
        answer: "', '",
        kind: "keyword",
        label: "the roster glue",
        why: "The pack prints folds verbatim, so the measured string is the ', '-glued one: Alice Chen, Chloe Dubois, …. Measure a bare-comma fold and the position shifts by one for every name ahead of hers.",
      },
      {
        answer: "'Chloe'",
        kind: "keyword",
        label: "the search needle",
        why: "The needle is Chloe's first name — unique in the customer base, short enough to sit inside a fold. Searching 'Hiro' instead would return APAC's roster at a different position entirely.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the presence gate",
        why: "INSTR yields 0 for a miss, so HAVING pos > 0 keeps only regions whose fold contains the needle. At 13 the EU row — position 13 — fails the gate and the proof disappears.",
        noVerify: true,
      },
    ],
    distractors: ["'-", "'Hiro'", "100"],
    walkthrough:
      "EU's roster folds to Alice Chen, Chloe Dubois, Dmitri Volkov, Isabella Rossi, Liam O'Brien, Noah Meyer, Olivia Brown, Pedro Alvarez — alphabetical, glued with ', '. INSTR walks that string and finds 'Chloe' starting at character 13: ten letters of Alice Chen plus the two-character glue lands Chloe exactly at 13. Every other region's fold misses, and HAVING pos > 0 leaves one row of proof. The separator is the audit's hidden variable — switch the glue to a single dash and Chloe slides back to position 12, which is why the probe measures the same fold the pack prints. Position 13, region EU: the roll-call order is confirmed.",
  },
  {
    id: "cs-1517",
    tier: "medium",
    topic: "x1",
    universe: "supplier",
    title: "The empty-shelf promise",
    brief:
      "From: Sourcing. Re: the top-tier vendor line.\n\nThe vendor board prints a shelf line for five-star suppliers only, but no supplier has earned five stars yet — and the board refuses to print NULL. Fold the top-tier shelf with a promise fallback so the line always renders.",
    ask: "What does the five-star supplier line print while the shelf is empty?",
    template: `SELECT COALESCE({1}(name), {2}) AS shelf
FROM suppliers WHERE rating > {3};`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "The board wants names folded into one line — GROUP_CONCAT is the only tool that folds. On an empty shelf it returns NULL, which is precisely the case the fallback exists for.",
      },
      {
        answer: "'no suppliers on file'",
        kind: "keyword",
        label: "the promise fallback",
        why: "COALESCE returns its first non-NULL argument, so the empty fold falls through to the promise line. 'none' would render too, but the board's copy standard is the full phrase.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the star gate",
        why: "Five stars is the board's top tier, and the best rating on file is 4.8 — so the shelf is empty and the fold is NULL. Drop the gate to 4 and Alpine, Nordic and Midwest fold a real shelf.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "4", "4.5", "3"],
    walkthrough:
      "The WHERE scopes the shelf to suppliers rated above five stars — and nobody is: Alpine Audio leads the file at 4.8. So GROUP_CONCAT folds zero rows and returns NULL, the honest answer for an empty shelf. COALESCE then does its one job: it takes the first non-NULL argument, and the board line prints 'no suppliers on file' instead of a blank. Swap the gate to 4 and the same query folds a real shelf — Alpine Audio GmbH, Nordic Gadgets AB, Midwest Hardware Co — because three suppliers clear the bar and the fallback never fires. This is the empty-shelf contract: fold honestly, promise loudly, and never let NULL reach a printed page.",
  },
  {
    id: "cs-1518",
    tier: "medium",
    topic: "x1",
    universe: "month-close",
    title: "The month-token recital",
    brief:
      "From: Finance ops. Re: the trading-calendar audit.\n\nThe close calendar audit prints, for each busy year, one folded line of the months that saw orders — '01, 01, 02' style, one token per order. Keep only years with at least twenty order tokens and fold each year's months in chronological order.",
    ask: "Which year clears the twenty-token gate, and what does its month-token fold say?",
    template: `SELECT strftime('%Y', created_at) AS y, {1}(*) AS orders,
  GROUP_CONCAT(strftime('%m', created_at), {2} ORDER BY created_at) AS month_tokens
FROM orders GROUP BY y HAVING COUNT(*) >= {3} ORDER BY y;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the token counter",
        why: "The gate counts order tokens per year, so the counter rides beside the fold. COUNT is the tally; TOTAL would try to sum the year labels and error out.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the token glue",
        why: "The audit prints '01, 01, 02, …' — comma-plus-space keeps the token run countable by eye. A dash would read like a date range and break the calendar metaphor.",
      },
      {
        answer: "20",
        kind: "number",
        label: "the token gate",
        why: "Twenty tokens keeps 2024 (90 orders) and drops 2025 (13). Drop the gate to 10 and both years print; raise it to 100 and the audit goes silent.",
        noVerify: true,
      },
    ],
    distractors: ["TOTAL", "'-'", "10", "100"],
    walkthrough:
      "strftime('%Y') stamps each order with its year, GROUP BY y buckets them — 90 tokens in 2024, 13 in 2025 — and the HAVING gate keeps only the busy year. GROUP_CONCAT folds the month numbers in chronological order (ORDER BY created_at preserves the trading sequence), glued with ', ': the 2024 line runs 01, 01, 01, 01, 01, 01, 01, 01, 02, 02, … out to 12 — ninety tokens, seven of them in January alone. The count rides beside the fold so the audit can cross-check token tally against gate. This is the calendar-audit shape: bucket by year, gate on volume, fold the months in trade order. One row, one line, one year under review.",
  },
  {
    id: "cs-1519",
    tier: "hard",
    topic: "x1",
    universe: "funnel",
    title: "The email-match roster",
    brief:
      "From: Community team. Re: the targeted chapter line.\n\nThe mail-merge tool pulls a region's roster as one folded line, but only for regions whose members' folded email list matches a target pattern. Fold the rosters and keep the region whose emails contain the jamal address.",
    ask: "Which region's fold survives the jamal email pattern, and what roster line does it print?",
    template: `SELECT region, {1}(name, {2} ORDER BY name) AS roster
FROM customers GROUP BY region
HAVING GROUP_CONCAT(email) LIKE {3} ORDER BY roster;`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "The roster line and the email sweep are both folds — one printed, one measured. GROUP_CONCAT builds each region's strings; COUNT would leave the mail-merge with numbers.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the roster glue",
        why: "The mail-merge renders the fold verbatim, so names are glued with comma-plus-space: 'Emma Wilson, Jamal Wright'. Pipes would leak into the merge template's prose.",
      },
      {
        answer: "'%jamal%'",
        kind: "keyword",
        label: "the email pattern",
        why: "LIKE '%jamal%' matches the fold of emails containing jamal.wright@example.com — US only. '%hiro%' would return APAC's roster; '%chloe%' would return EU's, and the merge would target the wrong chapter.",
      },
    ],
    distractors: ["COUNT", "' | '", "'%hiro%'", "'%chloe%'"],
    walkthrough:
      "Two folds, one gate. GROUP BY region buckets the sixteen members into four chapters; the SELECT list folds each bucket's names alphabetically with ', ' glue; the HAVING folds each bucket's emails (plain commas are fine — nobody prints that fold) and sweeps it with LIKE '%jamal%'. Exactly one region matches: US, whose two members — Emma Wilson, Jamal Wright — fold into the roster line the mail-merge prints. The '%hiro%' probe would have returned APAC's five-name roster and '%chloe%' EU's eight-name line, which is why the pattern is the slot that matters: the tool merges into whatever chapter the pattern picks. Fold, sweep, print — one region, one line, one send.",
  },
  {
    id: "cs-1520",
    tier: "hard",
    topic: "x1",
    universe: "catalog",
    title: "The Bruno shelf fold",
    brief:
      "From: Merchandising. Re: the personal-shelf audit.\n\nThe personalization engine renders each member's purchased products as one folded shelf line, alphabetical, and Bruno Silva is the test profile — four distinct products across five order lines, so the fold must deduplicate. Build Bruno's shelf.",
    ask: "What is Bruno's folded shelf line — four distinct products, alphabetical, comma-separated?",
    template: `SELECT d.name, COUNT(*) AS items, {1}(d.pname, {2}) AS shelf
FROM (SELECT DISTINCT c.name, p.name AS pname
  FROM orders o JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id JOIN customers c ON c.id = o.customer_id
  WHERE c.name = 'Bruno Silva' ORDER BY {3}) d
GROUP BY d.name;`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "Four product names must render as one shelf string. GROUP_CONCAT is the fold; the item counter beside it verifies the fold's arity — four names, not five order lines.",
      },
      {
        answer: "', '",
        kind: "keyword",
        label: "the shelf glue",
        why: "The shelf renders as copy: 'Desk Mat Extended, Mechanical Keyboard K1, …'. Comma-plus-space keeps the four names readable; bare commas would cram the line the designer rejects.",
      },
      {
        answer: "pname",
        kind: "keyword",
        label: "the fold order",
        why: "The inner ORDER BY pname hands the fold an alphabetized, already-deduplicated list: Desk Mat Extended, Mechanical Keyboard K1, Studio Desktop Mic, Wireless Mouse M3. Ordering by a non-selected column would error out.",
      },
    ],
    distractors: ["COUNT", "'-'", "price", "p.id"],
    walkthrough:
      "Four tables deep, but the dedup happens before the fold: the inner SELECT DISTINCT collapses Bruno's five order lines to four unique products — the mouse, bought twice, appears once — and orders them alphabetically before handoff. The outer query then counts the lines (4, matching the shelf's arity) and folds them with GROUP_CONCAT and ', ' glue: Desk Mat Extended, Mechanical Keyboard K1, Studio Desktop Mic, Wireless Mouse M3. Trying to fold with DISTINCT, a separator and an ORDER BY in one call is exactly the syntax trap the clinic warns about — SQLite rejects that combination — so the derived table does the deduping and the fold stays simple. Bruno's shelf: four names, one line, no repeats.",
  },
];
