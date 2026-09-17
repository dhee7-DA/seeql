// Module 2 · l14 Self-join — easy/medium/hard business cases (cs-485..cs-500).
// Sibling deck to cases-m2-l14a.ts: same topic, different territory — EU/APAC
// seat-grids, cross-region and city threads, rating-pair averages, stock-pair
// and price-gap sorts, ghost waiting lists and the self-pair artifact.
// Every figure is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L14b: CaseStudy[] = [
  {
    id: "cs-485",
    tier: "easy",
    topic: "l14",
    universe: "funnel",
    title: "Thirty-six seat-checks on the EU grid",
    brief:
      "From: Growth marketing lead. Re: peer-program engine benchmark, EU run.\n\nBefore we point the pairing engine at the full file I want its EU workload measured: every account checked against every account at or after it in the register, self-checks included. One number for the capacity sheet — the benchmark has to match what the engine actually does, not what we assume it does.",
    ask: "Count of EU seat-comparisons including each account's self-check.",
    template: `SELECT COUNT(*) AS eu_grid
FROM customers a
JOIN customers b ON {1} = b.region AND a.id {2} b.id
WHERE a.region = {3};`,
    slots: [
      {
        answer: "a.region",
        kind: "keyword",
        label: "the first seat's region",
        why: "The grid counts seats that share a region, so the left side reads the first account's region. Swapping in the second seat's own column compares the column against itself — every pairing passes and the benchmark inflates to 62; the city column never holds region text and the grid empties to nothing.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the at-or-after guard",
        why: "At-or-after is the engine's rule — each seat is checked against itself and every later seat, which is what makes 36. The strict guard drops the eight self-checks and reads 28; <> doubles the work to 56 mirrored comparisons; = leaves only the eight seats checking themselves.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the benchmark region",
        why: "The run is the quoted region text 'EU', exact and case-sensitive. 'APAC' would benchmark the ten-pair cohort's grid of 15 and the EU capacity sheet would carry a number the engine never produced.",
      },
    ],
    distractors: ["b.region", "a.city", "<", "<>", "=", "'APAC'"],
    walkthrough:
      "The capacity sheet prints 36 — and the arithmetic is the point: 28 real EU pairings plus 8 self-checks, one per account, because the engine's at-or-after rule makes every seat compare against itself. That self-check layer is what the strict guard would hide: at < the benchmark reads 28 and the capacity plan under-provisions by the exact amount the engine spends checking seats against themselves. Flip the guard to <> and the workload doubles to 56 mirrored comparisons — every pair checked from both seats, which is the one rule the engine must not adopt. For scale, the same run on APAC's five accounts reads 15 (10 pairings plus 5 self-checks) and the US pair reads 3 — so the EU run is the engine's heaviest regional workload by more than double. The benchmark now matches the machine, which is the only version of a capacity number worth signing.",
  },
  {
    id: "cs-486",
    tier: "easy",
    topic: "l14",
    universe: "supplier",
    title: "The vendor duo above the quality bar",
    brief:
      "From: Supply-chain lead. Re: QBR pack, co-located vendor quality.\n\nThe QBR's vendor-geography page carries one line about paired vendors: the same-region duos whose combined scorecard clears our quality bar. I want the qualifying pair or pairs with their average score printed to one decimal, computed from the record — the page argues quality with numbers, not adjectives.",
    ask: "Same-region vendor pairs whose average rating clears 4.5, with the average.",
    template: `SELECT a.name AS vendor_a, b.name AS vendor_b, ROUND((a.rating + b.rating) / 2, 1) AS pair_score
FROM suppliers a
JOIN suppliers b ON {1} = b.region AND a.id {2} b.id
WHERE (a.rating + b.rating) / 2 > {3};`,
    slots: [
      {
        answer: "a.region",
        kind: "keyword",
        label: "the first vendor's region",
        why: "Co-located duos share a region, so the left side reads the first vendor's region. The scorecard column in its place would compare a rating against region text — nothing matches and the QBR loses its one qualifying line before the page prints.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "A duo is two different vendors counted once, smaller id first — the guard keeps it that way. At <= the pair picks up each vendor scoring itself and the page lists three rows; = keeps only the self-scores; <> prints the same duo twice from both seats.",
      },
      {
        answer: "4.5",
        kind: "number",
        noVerify: true,
        label: "the quality bar",
        why: "The QBR's bar is an average above 4.5 — a threshold the page argues with but never prints. Lowering it to 3.9 lets the APAC duo's exactly-4.0 average through and the one-elite-pairing story dies on the page.",
      },
    ],
    distractors: ["s.region", "<=", "=", "3.9"],
    walkthrough:
      "One duo clears the bar: Nordic Gadgets AB at 4.6 with Alpine Audio GmbH at 4.8, an average of 4.7 — the file's two best scorecards, and they happen to share the EU. That is the page's whole argument: our strongest vendors are also our co-located ones, so the EU's vendor density is a quality asset, not just a logistics convenience. The near-miss is worth a footnote: the APAC duo of Shenzhen Electro and Pacific Textiles averages exactly 4.0 — 4.1 plus 3.9 — which clears a 3.9 bar but not this one, so the bar's placement is doing real work. Drop the guard to <= and the page picks up two self-scores, Nordic with Nordic and Alpine with Alpine, rows that read as a vendor partnering with itself. One qualifying pair, printed with its 4.7 average, is the line the QBR can defend.",
  },
  {
    id: "cs-487",
    tier: "medium",
    topic: "l14",
    universe: "expense",
    title: "Every pairing that touches a dormant seat",
    brief:
      "From: Ops finance, spend review. Re: dormant-seat reallocation map.\n\nThe reallocation map pairs every account with a same-region neighbor so we can see which live seats are effectively carrying a dormant one on shared negotiations. I need every same-region pairing that touches a dormant account — either seat — with the region, both names, filed by region. The map has to be exhaustive: a single missed pairing is a seat cost nobody re-tenders.",
    ask: "All same-region pairs where either account is inactive, filed by region.",
    template: `SELECT a.region, a.name AS first_seat, b.name AS second_seat
FROM customers a
JOIN customers b ON a.region = b.region AND a.id {1} b.id
WHERE a.active = 0 {2} b.active = 0
ORDER BY a.region {3}, first_seat;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The map prints each pairing once with the earlier-seated account first — the guard keeps it one-sided. <> doubles the rollcall to 22 mirrored rows and the review would re-tender the same seat twice; = collapses the map to the two dormant accounts sitting with themselves; <= sneaks those two self-rows in for 13.",
      },
      {
        answer: "OR",
        kind: "keyword",
        label: "the either-seat test",
        why: "The sweep wants pairings that touch a dormant seat on either side — live-or-dormant counts. AND demands both seats dormant and finds none, because the file's two dormant accounts sit in different regions, and the map would silently miss all eleven real exposures.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the region filing order",
        why: "Regions file A to Z — APAC's pairs lead, the EU's follow. DESC walks the map US-first and the walkthrough loses the region order every other schedule in the review already uses.",
      },
    ],
    distractors: ["=", "<=", "AND", "DESC"],
    walkthrough:
      "Eleven rows print, and the shape is the finding: APAC contributes four pairings around dormant Keiko Sato and the EU seven around dormant Dmitri Volkov, while the US and LATAM print nothing at all — both American accounts are live, and Bruno has no region-mate to be mismatched with. The OR is doing the heavy lifting: both-dormant pairings number zero on this file, so an AND here would have produced a clean-looking map that missed every real exposure, and a chained comparison in OR's seat quietly re-derives the same eleven rows the map already prints. The guard deserves a word in the walkthrough — at = the map prints the two dormant accounts paired with themselves, self-rows that look like findings and are not, and <= slips those same two rows into an otherwise correct list. Eleven pairings, two dormant seats, four regions examined — the reallocation conversation now has a closed set to work through.",
  },
  {
    id: "cs-488",
    tier: "medium",
    topic: "l14",
    universe: "growth",
    title: "The raw grid before the region rule",
    brief:
      "From: Chief of Staff. Re: board deck, pairing-program baseline.\n\nThe deck's pairing slide needs its baseline: how many account pairings the program would handle if every account were paired with every later-seated account, before the same-region rule cuts anything. File the raw counts by the first seat's region, heaviest region first. If the rule is doing half the work, the board should see that in one glance.",
    ask: "Raw pairing counts per region, grouped by the first seat's region.",
    template: `SELECT a.region, COUNT(*) AS raw_pairs
FROM customers a
JOIN customers b ON {1}.id {2} b.id
GROUP BY a.region
ORDER BY raw_pairs {3}, a.region;`,
    slots: [
      {
        answer: "a",
        kind: "keyword",
        label: "the first seat's alias",
        why: "The census files each pairing under the first seat's region, so the join reads the first alias's id against the second's. Point it at the second alias and the condition compares the second seat's id with itself — nothing pairs, the grid reads zero, and the board's baseline is a rounding error.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the pairing guard",
        why: "The raw grid takes each unordered pairing once, earlier id first — 120 pairings file into the census. <> counts both directions and every region's weight doubles; = files only the sixteen self-checks, one per account, and the baseline collapses.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "The board reads heaviest region first — the EU's line leads. ASC files the smallest census on top and the deck's biggest baseline number arrives last, exactly backwards for a slide.",
      },
    ],
    distractors: ["b", "<>", "=", "ASC"],
    walkthrough:
      "The census prints four lines: EU 54, APAC 35, US 17, LATAM 14 — 120 raw pairings in total, every unordered account pair counted once by its first seat's region. Now the rule's cost is visible: the same-region policy keeps only 39 of those 120 pairings, so the program's scoping rule discards 81 pairings — two-thirds of the raw grid — before a single campaign ships. The first-seat framing matters for the deck: these counts are workloads, not populations, because each pairing is filed under the seat that initiates it, and the EU's 54 reflects both its eight accounts and how early they sit in the register. Flip the guard to <> and every region doubles — 120, 75, 30, 15 — a baseline the program cannot staff; at = the census reads 8, 5, 2, 1, the self-check rows that pair nobody. One slide, four numbers, and the rule's true price on the record.",
  },
  {
    id: "cs-489",
    tier: "easy",
    topic: "l14",
    universe: "fraud",
    title: "Eighty-one pairs the regional sweep never sees",
    brief:
      "From: Risk team, spot-check rotation. Re: sweep coverage memo.\n\nThe rotation's collusion sweep pairs same-region accounts, and the coverage memo needs the other side of the ledger: how many account pairings cross a region line and therefore escape the sweep entirely. One number, every unordered pair counted once, so the memo can state the blind spot without softening it.",
    ask: "Count of cross-region account pairs, deduped.",
    template: `SELECT COUNT(*) AS cross_region_pairs
FROM customers a
JOIN customers b ON a.id {1} b.id AND {2} <> {3};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The memo counts each pairing once, earlier seat first. <> counts both directions and the blind spot doubles to 162 — an overstatement the memo would have to walk back; = demands one account occupy two seats at once and finds nothing.",
      },
      {
        answer: "a.region",
        kind: "keyword",
        label: "the first seat's region",
        why: "The census separates pairs whose regions differ, so the left side reads the first seat's region. The city column never holds region text, so the mismatch test passes for all 120 pairings and the memo would claim every pairing is a blind spot.",
      },
      {
        answer: "b.region",
        kind: "keyword",
        label: "the second seat's region",
        why: "The right side must read the second seat's region — the two sides must be different columns for the test to mean anything. Duplicating the first seat's column compares a value to itself, every pairing fails, and the memo reports a blind spot of zero.",
      },
    ],
    distractors: ["<>", "=", "a.city", "b.city"],
    walkthrough:
      "The memo prints 81: of the 120 possible account pairings on this file, 81 cross a region line. Read against the sweep's coverage, that is the headline — the same-region rule the rotation pairs on keeps only 39 pairings, so for every pairing the sweep walks, two more escape it entirely. Split collusion does not care about the org chart's geography, and this number says the regional sweep is a coverage decision, not a completeness claim. The mechanics earn their line in the memo too: the strict guard keeps each pair counted once, <> would double the blind spot to 162 by counting both seats of every pairing, and the equality test finds nothing because no account sits in two regions at once — a zero that would read as full coverage, which is the most dangerous number in the file. Eighty-one pairs, stated plainly, is the memo's whole point.",
  },
  {
    id: "cs-490",
    tier: "medium",
    topic: "l14",
    universe: "catalog",
    title: "The shelf census behind the cross-sell spec",
    brief:
      "From: Catalog content manager. Re: cross-sell widget spec, shelf census.\n\nThe widget's spec sheet needs the shelf census: one row per category with the count of deduped same-shelf product pairs, deepest shelves first. Engineering sizes the widget's suggestion pool from this census, and a shelf with no pairs should be visibly absent from the count rather than padded with a zero the spec would then have to explain.",
    ask: "Same-category product pair counts per category, deepest first.",
    template: `SELECT a.category, COUNT(*) AS shelf_pairs
FROM products a
JOIN products b ON a.{1} = b.category AND a.id {2} b.id
GROUP BY a.category
ORDER BY shelf_pairs {3}, a.category;`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shared-shelf column",
        why: "The widget pairs shelf-mates, so the thread is the category column on both sides. The vendor column would census bundling partners instead — fourteen pairs across the file, a different feature with a different pool; price never equals shelf text and the census empties to nothing.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The spec counts each shelf-mate pair once, earlier item first — that is what keeps the pool honest. <> doubles every shelf to mirrored pairs and the widget would promise twice the suggestions; = counts each product standing in for itself; <= folds the self-checks in and every shelf inflates.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the deepest-first sort",
        why: "The spec reads deepest shelf first — the three-pair shelves lead. ASC buries them under the single-pair shelves and engineering would size the widget from its weakest pools first.",
      },
    ],
    distractors: ["supplier_id", "price", "<>", "=", "<=", "ASC"],
    walkthrough:
      "The census prints six shelves: Accessories, Audio and Electronics at 3 pairs each, then Apparel, Video and Wearables at 1 apiece — and Fitness is absent, which is the spec's quiet finding. Its solo Yoga Mat has no shelf-mate to pair with, so the widget's suggestion pool for that shelf is structurally empty, and the census says so by omission rather than by a padded zero. The arithmetic reconciles on sight: three-item shelves yield three pairs each, two-item shelves one, 3+3+3+1+1+1 = 12, with the guard keeping every pair one-sided. The thread check matters more than usual here: point the reunion at the vendor column and the census silently becomes the bundling census — fourteen pairs, a different widget — because four vendors run three-item shelves. Twelve pairs across six shelves, one shelf structurally absent: that is the spec sheet engineering can build against.",
  },
  {
    id: "cs-491",
    tier: "easy",
    topic: "l14",
    universe: "month-close",
    title: "Fifty-five comparisons, thirty-nine pairs",
    brief:
      "From: Controller. Re: close checklist, the co-region reconciliation.\n\nThe checklist's co-region exposure note quotes thirty-nine same-region account pairs, but the appendix engine's run log shows a bigger comparison count and the auditors want the bridge. Give me the engine's full comparison count for the whole register — every seat against itself and every later seat in its region — so the note can reconcile the two numbers on one line.",
    ask: "Count of same-region seat-comparisons including self-checks, whole register.",
    template: `SELECT COUNT(*) AS grid_rows
FROM customers a
JOIN customers b ON {1} = b.region {2} a.id {3} b.id;`,
    slots: [
      {
        answer: "a.region",
        kind: "keyword",
        label: "the first seat's region",
        why: "The appendix pairs seats that share a region, so the left side reads the first account's region. The city column holds no region text — nothing matches, the bridge loses all 55 rows, and the reconciliation note would bridge from a number to a void.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the both-conditions join",
        why: "Both conditions must hold — same region and at-or-after seat — so the clauses join with AND. OR keeps any pairing that satisfies either one and the grid floods to 136 rows, a bridge no auditor will sign.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the at-or-after guard",
        why: "The engine compares each seat against itself and every later seat — that is where the extra rows come from. The strict guard would print exactly the 39 real pairs the note quotes and the bridge would have nothing to explain; <> files both directions for 78.",
      },
    ],
    distractors: ["OR", "<", "<>", "a.city"],
    walkthrough:
      "The bridge lands on 55: the engine ran 55 same-region comparisons, of which 39 are the real pairs the exposure note quotes and 16 are self-checks — every account against itself, one per seat, the at-or-after rule's signature. That is the reconciliation in one line, and it is the version the auditors accept because both numbers now have an owner. The guard is the whole story: at < the grid prints exactly the note's 39 and the run log's 55 looks like an error rather than an arithmetic fact; at <> the grid files both directions for 78 and the bridge breaks in the other direction. The clause join matters too — OR between same-region and at-or-after floods the grid to 136 by keeping every pairing that satisfies either test alone. Fifty-five explained as thirty-nine plus sixteen: the note, the log, and the bridge now agree.",
  },
  {
    id: "cs-492",
    tier: "medium",
    topic: "l14",
    universe: "refund-audit",
    title: "The pairing queue's waiting list",
    brief:
      "From: refunds@ — internal ticket #4517. Re: dual-ticket review queue.\n\nThe dual-ticket review pairs each account with a later-seated same-region account so two complaint files get read together. The queue's waiting list is whoever never anchors a pairing — accounts with no later region-mate to pair with. Names and regions, register order, so the reviewers know exactly which accounts only ever appear as the second seat this cycle.",
    ask: "Accounts with no later-seated same-region partner, in register order.",
    template: `SELECT a.name AS unpaired_account, a.region
FROM customers a
{1} JOIN customers b ON a.region = b.region AND a.id < b.id
WHERE {2} IS NULL
ORDER BY a.id {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping flavor",
        why: "The waiting list exists to show accounts with no later region-mate — the keeping flavor prints those gaps as rows with an empty partner side. The inner flavor drops every unpaired account and the queue would book nobody, which reads as a clean sweep the record does not support.",
      },
      {
        answer: "b.id",
        kind: "keyword",
        label: "the partner-side probe",
        why: "The gap test probes the partner's id — the column that stays blank when no later mate exists. Probing the kept account's own id tests a column that is never blank, and the waiting list would read empty while four accounts quietly wait.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the register filing order",
        why: "The queue files waiting accounts in register order — the earliest id first. DESC walks the list last-seated first and the reviewers' tick-sheets run backwards against every other queue in the desk.",
      },
    ],
    distractors: ["INNER", "a.id", "a.city", "DESC"],
    walkthrough:
      "Four names file out: Bruno Silva in LATAM, Jamal Wright in the US, Maya Patel in APAC, Pedro Alvarez in the EU — each the highest-seated account in its region, so no later seat ever follows them into a pairing. That is the waiting list's logic: the pairing engine scans forward, and these four never anchor a row; they still appear as second seats on other accounts' pairings, which is why the queue routes them as readers, never as leads. The keeping flavor is what makes the list visible at all — the inner flavor returns zero rows and the desk would close the cycle believing every account anchored a pairing. The probe column matters just as much: the kept account's own id is never blank, so probing it prints an empty list that looks like a completed pass. Flip the guard to <> and only Bruno survives — a one-name list that would understate the queue by three. Four accounts, four regions, one list the reviewers can actually walk.",
  },
  {
    id: "cs-493",
    tier: "hard",
    topic: "l14",
    universe: "pricing",
    title: "The three widest gaps on the shelves",
    brief:
      "From: Head of Product. Re: pricing reset, within-shelf spread memo.\n\nThe reset opens with spread discipline: the widest price gaps inside a single shelf, where one shelf spans two price tiers. Three gap lines in the memo, widest first, with both items named so the room can see the pair behind each spread. The cut is fixed — three lines — and the gaps must come off the record, not off memory.",
    ask: "The 3 widest same-shelf price gaps, both items named, widest first.",
    template: `SELECT a.category, a.name AS first_item, b.name AS second_item, ROUND(b.{1} - a.price, 2) AS gap
FROM products a
JOIN products b ON a.category = b.category AND a.id < b.id
ORDER BY gap {2}
LIMIT {3};`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the second item's price column",
        why: "The gap is shelf price against shelf price, so the second item's price column completes the spread. Stock in its place measures shelf depth, not money, and the memo would rank bins by units; the id column subtracts register numbers, arithmetic without a story.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the widest-first sort",
        why: "Widest gap first is the memo's reading order — the headline spread leads. ASC opens on the tightest spreads and the repricing conversation starts at the wrong end of the shelf.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the memo's line count",
        why: "The memo carries exactly three gap lines, so the cut is 3 — a fourth row dilutes the headline and a second would hide the spread story the reset is built on.",
      },
    ],
    distractors: ["stock", "ASC", "5", "id"],
    walkthrough:
      "Three lines print, and the top one is the reset's headline: the Wearables shelf spans 120.99 — Fitness Band X2 at 79 against Smart Watch S at 199.99 — one shelf selling both a value band and the catalog's most expensive item. Behind it, Apparel's 46.50 spread (Running Socks at 18.50 up to Cycling Jersey Pro at 65) and Accessories' 27.51 (the 14.99 HDMI cable up to the 42.50 Laptop Stand). The cut bites honestly: Electronics' mouse-to-hub spread of 14.50 is the next line down and misses the memo, which is how the room knows three was a real cut, not a round number. The mechanics hold the memo together — the guard keeps each shelf pair one-sided so no spread prints twice, and the sort reads the computed gap, widest first. One shelf spanning two tiers is a merchandising decision; the memo now shows which shelf, which pair, and by how much.",
  },
  {
    id: "cs-494",
    tier: "easy",
    topic: "l14",
    universe: "inventory",
    title: "Six co-replenishment pairs under 300",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: combined-shelf buy list.\n\nThe desk co-replenishes items that share a vendor, and the buy list targets vendor-mate pairs whose combined on-hand sits under 300 units — thin pairs that stock out together. Item names and their combined count, thinnest first, so purchasing can phone the vendor once per pair. Keep it to the pairs that actually qualify.",
    ask: "Same-vendor product pairs with combined stock under 300, thinnest first.",
    template: `SELECT a.name AS first_item, b.name AS second_item, a.stock + b.stock AS combined_stock
FROM products a
JOIN products b ON {1} = b.supplier_id AND a.id < b.id
WHERE a.stock + b.stock {2} {3}
ORDER BY combined_stock {4};`,
    slots: [
      {
        answer: "a.supplier_id",
        kind: "keyword",
        label: "the shared-vendor thread",
        why: "Co-replenishment pairs items from the same vendor, so the thread is the catalog's vendor pointer on both sides. The category column would pair shelf-mates across vendors — a different buy list entirely; a vendor-file column name breaks the query outright because no vendor alias exists in this reunion.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the combined-stock test",
        why: "The buy list targets pairs whose combined shelves sit under 300 units. Flipping the operator fills the list with the eight deep pairs the desk is trying to avoid, and at = nothing qualifies at all — no vendor-mate pair sums to exactly 300.",
      },
      {
        answer: "300",
        kind: "number",
        noVerify: true,
        label: "the combined-shelf trigger",
        why: "300 is the desk's combined-shelf trigger — a threshold the printed list never shows. At 200 only the thinnest pair survives and the buy round loses half its calls; the trigger belongs to the filter, not to the cells.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the thinnest-first sort",
        why: "Thinnest combined shelf first is the buy order — the 110-unit pair tops the list. DESC would lead with the 280 pair and purchasing would phone the healthiest bin first.",
      },
    ],
    distractors: ["a.category", "s.supplier_id", ">", "DESC"],
    walkthrough:
      "Six pairs make the buy list, thinnest first: 4K Webcam Pro with Smart Watch S at 110 combined, Mechanical Keyboard K1 with Smart Watch S at 160, Keyboard with Webcam at 190, USB-C Hub with Cycling Jersey Pro at 195, Noise-Canceling Headset with Laptop Stand at 240, and Headset with Yoga Mat at 280. Read the vendor column behind them and the list concentrates fast: Nordic Gadgets owns the entire top three, which means one phone call covers the three thinnest vendor-mate pairs on the file. The threshold is doing honest work at the other end too — no pair sums to exactly 300, so the boundary is clean, and above the line sit eight deep pairs the desk is deliberately not buying this round. Same-vendor pairing keeps the list actionable: six pairs, four vendors, thinnest first, every row a call purchasing can actually make.",
  },
  {
    id: "cs-495",
    tier: "medium",
    topic: "l14",
    universe: "funnel",
    title: "Six live pairings in the APAC cohort",
    brief:
      "From: Growth marketing lead. Re: co-seed pilot, APAC cohort.\n\nThe co-seed pilot pairs neighboring accounts so campaign creative can be tested two households at a time, and the APAC cohort is the pilot region. Count the pairings where both accounts are live — dormant seats cannot receive, so a pairing leaning on one is dead weight. One number for the pilot's reach sheet.",
    ask: "Count of APAC pairs where both accounts are active.",
    template: `SELECT COUNT(*) AS live_pairs
FROM customers a
JOIN customers b ON a.region = b.region AND a.id < b.id
WHERE a.active = 1 {1} b.active = {2} AND a.region = {3};`,
    slots: [
      {
        answer: "AND",
        kind: "keyword",
        label: "the both-seats requirement",
        why: "Both seats must be live — the two flag tests hold together with AND. OR keeps any pairing with at least one live seat and the count balloons to 34, padding the reach sheet with pairings that lean on a dormant partner and cannot actually receive.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the live flag",
        why: "Live is the register flag 1 — a status bit that never prints in a count. At 0 the query counts pairings leaning on the dormant Nagoya account instead — three dead-weight pairs — and the pilot's reach number would describe seats that cannot receive.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the pilot region",
        why: "The cohort is the quoted text 'APAC', exact and case-sensitive. 'EU' would count the twenty-one live EU pairings and the pilot would plan against the wrong continent's reach.",
      },
    ],
    distractors: ["OR", "0", "'EU'", "'US'"],
    walkthrough:
      "The reach sheet prints 6: of APAC's ten same-region pairings, six have both seats live, and the other four all lean on dormant Keiko Sato — her Nagoya account sits in every one of the cohort's dead pairings. That is the pilot's real shape: a ten-pair cohort that behaves like a six-pair one, with a single dormant account responsible for the entire gap. The AND is what keeps the number honest — OR would read 34 by counting every pairing with at least one live seat across all regions, a reach number the pilot cannot spend. For calibration, the same both-live test prints 21 in the EU and just 1 in the US, so APAC's six sits mid-pack: enough pairs to test creative, few enough that every dormant seat matters. Six live pairings, one named cause, and a reach sheet the pilot can staff against.",
  },
  {
    id: "cs-496",
    tier: "hard",
    topic: "l14",
    universe: "supplier",
    title: "The vendor pages behind the bundle list",
    brief:
      "From: Supply-chain lead. Re: QBR pack, bundle appendix with provenance.\n\nThe bundle appendix lists every pair of catalog items that share a vendor, but this quarter procurement wants provenance on each row: which vendor page the pair belongs to. Vendor name first, then the two items, filed by vendor and item — so the appendix reads page by page instead of as a flat list of fourteen anonymous rows.",
    ask: "All same-vendor product pairs with the vendor named, filed by vendor.",
    template: `SELECT s.name AS vendor, a.name AS first_item, b.name AS second_item
FROM products a
JOIN products b ON a.supplier_id = b.supplier_id AND a.id {1} b.id
JOIN suppliers s ON {2} = s.id
ORDER BY vendor {3}, first_item, second_item;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Each vendor pairing prints once, earlier item first — the appendix stays one row per pair. <> doubles the list to 28 mirrored rows; = lists six vendors paired with themselves, a company bundled with its own shelf; <= folds those self-rows in for 30.",
      },
      {
        answer: "a.supplier_id",
        kind: "keyword",
        label: "the pair's vendor pointer",
        why: "The second hop reads the pair's shared vendor pointer into the vendor file — that is what names the page. The item's own id only matches a vendor number for the catalog's first six rows, so four pairings would silently lose their vendor page; pointing the hop at the vendor file's own id matches every vendor to itself and floods the list to 84 rows.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the vendor filing order",
        why: "Pages file A to Z — Alpine's duo leads, Shenzhen's trio closes the appendix. DESC starts the pack at Shenzhen and the QBR reads against the region tour every other page follows.",
      },
    ],
    distractors: ["<=", "=", "a.id", "s.id", "DESC"],
    walkthrough:
      "Fourteen rows file page by page: Nordic, Shenzhen, Pacific and Midwest each contribute three pairings from their three-item shelves, while Alpine and Andes contribute one apiece from their duos — 4 times 3 plus 2, the arithmetic procurement can check in the margin. The provenance hop is what turns a list into pages: the pair's shared vendor pointer lands on the vendor file's id, and every row now carries the page name. The wrong key is the quiet failure worth naming — swap the hop to the item's own id and the appendix keeps only the ten pairings whose first item happens to number in the vendor file's range, silently dropping four rows that still exist on paper. At = the appendix exhibits six vendors bundled with themselves; at <> it doubles to twenty-eight mirrored rows. Fourteen pairs, six vendor pages, filed A to Z — the appendix procurement asked for.",
  },
  {
    id: "cs-497",
    tier: "hard",
    topic: "l14",
    universe: "expense",
    title: "Seven budget pairs on the swap list",
    brief:
      "From: Ops finance, spend review. Re: budget-swap candidates.\n\nBefore anyone calls a vendor, the swap list needs its pool: same-shelf pairs where both items sit under the 100 line, so an expensive line item can be swapped for its budget shelf-mate without leaving the shelf. One count for the review pack, deduped — and if a shelf contributes nothing to the pool, the count should say so by its absence.",
    ask: "Count of same-shelf pairs where both items are priced under 100.",
    template: `SELECT COUNT(*) AS budget_pairs
FROM products a
JOIN products b ON a.{1} = b.category AND a.id {2} b.id
WHERE a.{3} < 100 AND b.price < 100;`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shared-shelf column",
        why: "The swap list pairs shelf-mates, so the thread is the category column. The vendor column would count budget bundles from one vendor's bins instead — a different pool with different rules; stock never equals shelf text and the list empties to zero.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Each budget pairing counts once, earlier item first. <> doubles the count to 14 mirrored pairs; = counts the twelve sub-100 items standing in for themselves; <= folds those self-rows into the real pairs and the pool reads nineteen.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the first seat's price column",
        why: "Budget means list price under 100 on both seats — the first seat's price column carries that test. Stock in its place would pass thin shelves regardless of cost and the pool would read three; the vendor column passes every row, vendor numbers run 1 to 6, and the count drifts to ten pairings where only price was tested.",
      },
    ],
    distractors: ["supplier_id", "stock", "<>", "=", "<="],
    walkthrough:
      "The pool prints 7, and the shelf-by-shelf read is the review's substance: Electronics contributes three pairs (Mechanical Keyboard K1 at 89.99, Wireless Mouse at 34.50 and USB-C Hub at 49.00 all clear the line), Accessories contributes three (HDMI cable 14.99, Laptop Stand 42.50, Desk Mat 24.99), and Apparel contributes one — Running Socks at 18.50 with Cycling Jersey Pro at 65. The absentees carry the argument: Audio contributes nothing, because the Noise-Canceling Headset at 149.99 and the Studio Mic at 119 both sit over the line, leaving the 59.99 speaker with no budget mate to swap toward. The guard keeps each pair counted once — <> would read fourteen by mirroring every pairing, and the self-rows at = would pad the pool with twelve items swapped for themselves. Seven real swap candidates, three shelves, two shelves structurally out: the pack now shows the pool and its edges.",
  },
  {
    id: "cs-498",
    tier: "hard",
    topic: "l14",
    universe: "growth",
    title: "Sixteen self-invites from the pre-guard build",
    brief:
      "From: Growth marketing lead. Re: referral build post-mortem, the artifact.\n\nBefore the pairing guard shipped, the referral build sent invitations using whatever pairing the engine produced — including accounts inviting themselves. The post-mortem wants the artifact reproduced exactly: every pairing the broken build generated where both seats are the same account, filed last-seated first so the register's tail leads the exhibit. This is the exhibit that justifies the guard to the review board.",
    ask: "Every account paired with itself, last-seated first.",
    template: `SELECT a.name AS first_account, b.name AS second_account
FROM customers a
JOIN customers b ON {1} = b.region AND a.id {2} b.id
ORDER BY first_account {3};`,
    slots: [
      {
        answer: "a.region",
        kind: "keyword",
        label: "the first seat's region",
        why: "The artifact reproduces the broken build exactly, same-region thread included — the left side reads the first seat's region. The city column matches no region text and the exhibit prints nothing, which would read as the bug never existing.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the equality bug",
        why: "The bug paired every account with itself, so the guard is equality — each seat matched to its own id. The dedupe guard < is the fixed build and would print the 39 healthy pairs; <> prints the 78 ordered pairings and the exhibit loses its point entirely.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the last-seated-first order",
        why: "The exhibit files Z to A so the register's tail leads — Pedro's self-pair on top. ASC hides the tail behind Alice's rows and the walkthrough opens on the file's first account instead of the artifact's shape.",
      },
    ],
    distractors: ["a.city", "<", "<>", "ASC"],
    walkthrough:
      "Sixteen rows print, every account standing opposite itself — Pedro Alvarez with Pedro Alvarez at the top, Alice Chen with Alice Chen closing the exhibit — and that is the whole defect in one screen: the pre-guard build compared each seat to its own register number and called it a pairing, so all sixteen accounts invited themselves. The exhibit earns its board slot by contrast: the fixed build's strict guard prints the 39 real pairings, none of them self-rows, and the ordered variant would print 78 by counting both directions. The equality guard is the artifact's fingerprint — it is the only comparison that produces exactly the sixteen self-pairs, which is why the post-mortem reproduces the bug rather than describing it. Sixteen self-invites, sixteen accounts, one missing inequality: the review board sees the bug, the fix, and the reason the pairing spec starts with a strict comparison.",
  },
  {
    id: "cs-499",
    tier: "hard",
    topic: "l14",
    universe: "fraud",
    title: "The city test that finds nothing",
    brief:
      "From: Risk team, spot-check rotation. Re: the tightened proximity test.\n\nThe rotation wants to know whether the pairing rule can be tightened from region to city before next quarter's sweep — same-city collusion is the sharper signal if the data supports it. Count the account pairings that share a city, deduped, and bring the number back whatever it is. If the tightened test binds nothing, that is the finding and the memo needs it stated, not buried.",
    ask: "Count of same-city account pairs, deduped.",
    template: `SELECT COUNT(*) AS same_city_pairs
FROM customers a
JOIN customers b ON a.{1} = b.city {2} a.id {3} b.id;`,
    slots: [
      {
        answer: "city",
        kind: "keyword",
        label: "the shared-city column",
        why: "The tightened test pairs accounts that share a city, so the thread reads the city column on both seats. There is no city-id column on the account register — the guess breaks the query before the count exists, and the memo would go out with no finding at all.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the both-conditions join",
        why: "Both conditions must hold — same city and earlier seat — so the clauses join with AND. Chaining a third comparison where AND belongs folds the tests into one expression and the count floods to 120, reporting city overlap that does not exist.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Each pairing counts once, earlier seat first. = counts the sixteen accounts standing in for themselves; <= does the same by keeping every self-check — either way the memo reads city overlap where the register has none.",
      },
    ],
    distractors: ["city_id", "postal_code", "="],
    walkthrough:
      "The count prints zero, and the zero is the finding: no two accounts on this file share a city, so the tightened proximity test binds nothing — all 120 possible pairings cross a city line, which is why the same-region rule binds the 39 pairings it does. The memo states it both ways: the city test is strictly sharper in theory and strictly empty in practice, so next quarter's sweep keeps the region rule and the city column stays a tiebreaker, not a match key. The mechanics protect the zero from impostors — the equality guard would print sixteen self-pairs and the at-or-after guard the same, both of which read as city overlap to a skimming reader, and the self-rows are exactly what the strict guard exists to exclude. A zero that reconciles against 120 possible pairings and 39 regional ones is a defensible finding; an unexplained zero is just an empty cell. This one is defensible.",
  },
  {
    id: "cs-500",
    tier: "hard",
    topic: "l14",
    universe: "catalog",
    title: "The shelf grid, self-checks included",
    brief:
      "From: Catalog content manager. Re: the audit grid, self-checks on the books.\n\nThe catalog audit runs every item against itself and every later item on its shelf — the self-checks are deliberate, they prove each row was visited. I want the grid census: one row per shelf with the full comparison count, filed A to Z to match the master list. A shelf whose count equals its self-checks alone has no pairings at all, and the audit sheet should make that unmistakable.",
    ask: "Per-shelf comparison counts including self-checks, filed A to Z.",
    template: `SELECT a.category, COUNT(*) AS grid_rows
FROM products a
JOIN products b ON a.{1} = b.category AND a.id {2} b.id
GROUP BY a.category
ORDER BY a.category {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shared-shelf column",
        why: "The grid audits shelf-mates, so the thread is the category column. The vendor column would grid the bundling pairs — a different audit with a different row set; price never equals shelf text and the grid empties before the first shelf prints.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the at-or-after guard",
        why: "The grid includes each item's self-check — that is the audit's proof of visitation — so the guard is at-or-after. The strict guard prints the twelve real pairings only and Fitness's visited-once row vanishes; = keeps nothing but self-checks and every shelf's pairing work disappears.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the A-to-Z filing order",
        why: "Shelves file A to Z to match the master list — Accessories first, Wearables last, Fitness between them by alphabet. DESC walks the catalog backwards and every audit sheet mismatches the list it certifies.",
      },
    ],
    distractors: ["supplier_id", "price", "<", "=", "DESC"],
    walkthrough:
      "The grid prints seven shelves totalling 28 rows: the three deep shelves — Accessories, Audio, Electronics — at 6 each (three pairings plus three self-checks), Apparel, Video and Wearables at 3 each, and Fitness at exactly 1. That single row is the audit's sharpest signal: one self-check and nothing else means the yoga mat was visited and has no shelf-mate, the singleton's signature, visible only because the guard keeps self-checks on the books. The bridge to the pairing census reconciles on sight: 12 real pairings plus 16 self-checks equals 28, so the audit grid and the cross-sell census are the same work counted two ways. Run the thread at the vendor column and the grid counts bundling pairs instead — fourteen across the file, four vendors with three-item shelves — a different audit whose Fitness signal is gone. Seven shelves, twenty-eight rows, one singleton: the audit sheet the desk can certify against the master list.",
  },
];
