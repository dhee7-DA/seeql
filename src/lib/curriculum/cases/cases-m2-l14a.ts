// Module 2 · l14 Self-join — easy/medium/hard business cases (cs-468..cs-484).
// Authored against scripts/case-m2-spec.md facts; every figure live-probed.

import type { CaseStudy } from "./types";

export const casesM2L14a: CaseStudy[] = [
  {
    id: "cs-468",
    tier: "easy",
    topic: "l14",
    universe: "growth",
    title: "The American pairing, one row",
    brief:
      "From: Growth marketing lead. Re: regional peer program, US pilot.\n\nThe peer program pairs accounts from the same region, and the US pilot is the smallest cohort on the file. Show the American pair or pairs exactly as the program will print them — first account, second account — so the pilot email can address both names in order.",
    ask: "Pairs of US-region accounts, one row per pair.",
    template: `SELECT a.name AS first_account, b.name AS second_account
FROM customers a
{1} JOIN customers b ON a.region = b.region AND a.id {2} b.id
WHERE a.region = {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping join",
        why: "The pilot report keeps every American account, and a US account with no same-region partner survives only as a kept row — the LEFT flavor prints that gap instead of hiding it. The inner flavor would show only completed pairs.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Pairing is unordered, so the guard a.id < b.id prints each pair once, smaller id first. Without it the row count doubles with mirror pairs; with = it collapses to self-pairs.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the pilot region",
        why: "The pilot scopes to the quoted region text 'US', matched exactly. 'EU' would run the pilot on the file's biggest cohort and bury the American pilot in twenty-eight pairs.",
      },
    ],
    distractors: ["'APAC'", "'EU'", "<>", "NOT NULL"],
    walkthrough:
      "One pair prints: the file's two American accounts, Emma Wilson and Jamal Wright, joined once with the smaller id first. The US pilot is the program's smallest cohort by far — the EU would print 28 pairs, APAC 10, LATAM none at all — so the pilot email goes to exactly two people who now share a region-mate. The guard deserves a word: a.id < b.id keeps the pairing one-sided on purpose, which is why one row covers both names. Flip the guard to <> and the count doubles to two mirrored rows — the same pair printed twice, once from each seat — which is the difference between a mailing and a duplicate. The LEFT flavor matters at bigger cohorts: it would keep an unpaired account visible as a row with an empty partner column, the program's waiting list, and at US scale that safety net is one row wide. NOT NULL as a join flavor fails before the query runs, which is the register's way of saying the flavor belongs to the WHERE clause, not the FROM.",
  },
  {
    id: "cs-469",
    tier: "easy",
    topic: "l14",
    universe: "fraud",
    title: "Ten APAC pairs for the ring check",
    brief:
      "From: Fraud spot-check desk. Re: same-region pairing, APAC pass.\n\nThe ring check reads same-region account pairs because collusion needs proximity, and the APAC pass is next. Every unordered pair of APAC accounts, first account then second, alphabetical within pair — ten rows the desk will walk one by one.",
    ask: "All pairs of APAC-region accounts, deduped, alphabetical.",
    template: `SELECT a.name AS first_account, b.name AS second_account
FROM customers a
JOIN customers b ON a.region = b.region AND a.id {1} b.id
WHERE a.region = {2}
ORDER BY first_account {3}, second_account;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The desk wants each pair once, so the guard a.id < b.id keeps the smaller-id seat first. <> would print every pair twice — once per direction — and the reviewer would count twenty rows for ten pairs.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the pass region",
        why: "This pass is the quoted text 'APAC', exact and case-sensitive. 'EU' would hand the desk twenty-eight pairs from the wrong continent and the APAC pass would stall.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the review order",
        why: "The desk walks the list top to bottom, so pairs file A to Z ascending. DESC starts the review at Maya's pairs and ends at Farid's, reversing a checklist the desk already annotated.",
      },
    ],
    distractors: ["'EU'", "'US'", "<>", "DESC", "'LATAM'"],
    walkthrough:
      "Ten pairs print, alphabetically filed: the five APAC accounts — Farid, Grace, Hiro, Keiko, Maya — combine into every two-seat pairing the region allows. The count checks by hand: five accounts taken two at a time is ten pairs, and the guard guarantees the list shows each exactly once. The desk's read: same-region proximity is necessary for a ring but nowhere near sufficient — these ten pairs are the population to sample, not a suspicion list, and the APAC pass pairs neatly against the EU's twenty-eight and the US's single pairing. Flip the guard to <> and the same ten pairs print twenty rows, every pair appearing twice in opposite seats; a reviewer who flags duplicates without understanding the mirror would waste the pass. 'LATAM' as the pass region prints nothing — Bruno has no region-mate — and an empty list on this desk means the pass is complete, not that the query broke. The sort keeps the review reproducible: file it A to Z today and the same ten rows return in the same order next month.",
  },
  {
    id: "cs-470",
    tier: "easy",
    topic: "l14",
    universe: "catalog",
    title: "Twelve same-shelf pairs on the catalog",
    brief:
      "From: Catalog content manager. Re: cross-sell pairs, same-shelf rule.\n\nThe cross-sell widget only pairs items from the same shelf, so the catalog needs the count of same-shelf product pairs as one number for the spec sheet. Counted from the record, deduped — the widget treats (A, B) and (B, A) as the same suggestion.",
    ask: "Count of same-category product pairs, deduped.",
    template: `SELECT COUNT(*) AS same_shelf_pairs
FROM products a
JOIN products b ON a.{1} = b.category AND a.id {2} b.id
WHERE a.price > {3};`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "the shared shelf column",
        why: "Same-shelf means the two rows agree on category — a.category = b.category is the thread. The supplier column would pair products by vendor instead and count bundling, not cross-sell.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The widget counts (A, B) once, so the guard a.id < b.id keeps one direction. <> doubles the count to mirror-inflated numbers and the spec sheet would promise twice the suggestions.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the price floor",
        why: "The first spec sheet floors the price at zero — every product qualifies, and the floor lives in the filter where no result cell can show it. Raising it to 100 collapses the count to the premium shelf's pairs only.",
      },
    ],
    distractors: ["supplier_id", "id", "price", "50", "100"],
    walkthrough:
      "The spec sheet prints 12: twelve same-shelf pairs across six categories — Electronics, Audio and Accessories contribute three pairs each, Wearables and Video one each, Apparel one, and Fitness none because its single yoga mat has no shelf-mate to pair with. The arithmetic behind it: three-product shelves give three pairs apiece, two-product shelves give one, one-product shelves give zero — and the guard makes each pair count once. Swap the shared column to supplier_id and the count reads 14: vendor-bundling pairs, a different feature with two extra pairs because Alpine's and Andes' two-item shelves cross category lines. Point the thread at id and the count lands on 10 — pairs where one product's id happens to equal the other's supplier number, plausible-looking garbage of exactly the kind the seed's overlapping id ranges produce. The price floor's leverage: at 50 the count thins to 4, at 100 to 1, and the widget's spec would shrink with it — which is why the floor stays at zero for launch.",
  },
  {
    id: "cs-471",
    tier: "easy",
    topic: "l14",
    universe: "month-close",
    title: "Two vendor pairs sharing a region",
    brief:
      "From: Controller. Re: close checklist, the co-warehousing note.\n\nThe close checklist's co-warehousing note pairs vendors from the same region — candidates for shared inbound logistics. List the pairs, vendor A then vendor B, alphabetical, so the note can name them without implying an order of preference.",
    ask: "Pairs of same-region vendors, deduped, alphabetical.",
    template: `SELECT a.name AS vendor_a, b.name AS vendor_b
FROM suppliers a
JOIN suppliers b ON a.{1} = b.region AND a.id {2} b.id
ORDER BY vendor_a {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the shared-column thread",
        why: "Co-region pairing means the two vendor rows agree on region — a.region = b.region is the thread. The rating column would pair by scorecard value and invent a Nordic-Andes line that shares nothing.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Each pair prints once with the smaller id first — a.id < b.id. Dropping to <> doubles every line and the note would pair Nordic with Alpine twice, once from each seat.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing order",
        why: "The note files pairs A to Z by the first vendor, ascending. DESC leads with Shenzhen-Pacific and reads bottom-up against every other list in the checklist.",
      },
    ],
    distractors: ["rating", "name", "=", "DESC"],
    walkthrough:
      "Two pairs print: Nordic Gadgets AB with Alpine Audio GmbH, the EU's two vendors, and Shenzhen Electro with Pacific Textiles, the APAC pair — filed alphabetically, no preference implied. The file's other four vendor pairings are cross-region, which is exactly the point of the note: co-warehousing needs proximity, and only these two pairs share it. The thread column matters more than it looks: point the reunion at rating instead of region and the pairing dissolves — no two vendors share a scorecard value — printing an empty list that reads as no candidates. Point it at name and the same silence falls, since vendor names are unique. The self-pair trap shows what = would do: six vendors each paired with themselves, a list of a company shipping to its own warehouse. And the guard's DESC twin, printing pairs largest-id first, would reorder two rows — cosmetic here, but the same habit at customer scale reorders twenty-eight.",
  },
  {
    id: "cs-472",
    tier: "easy",
    topic: "l14",
    universe: "refund-audit",
    title: "Twenty-eight EU pairs, counted",
    brief:
      "From: Refund audit desk. Re: sampling frame, EU cohort.\n\nThe EU refund sample draws pairs of same-region accounts, and the sampling frame needs its size first: how many distinct EU pairs exist. One number for the frame document, deduped, so the draw treats (A, B) and (B, A) as the same ticket.",
    ask: "Count of distinct same-region pairs in the EU cohort.",
    template: `SELECT COUNT(*) AS eu_pairs
FROM customers a
{3} JOIN customers b ON a.region = b.region AND a.id {1} b.id
WHERE a.region = {2};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The frame counts each pair once, so a.id < b.id keeps one direction. <> inflates the frame to mirrored pairs and the sample would draw the same pairing twice under two seats.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the cohort region",
        why: "The frame is the quoted text 'EU', exact — the file's biggest cohort. 'APAC' would size a ten-pair frame and the EU draw would run short.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping flavor",
        why: "The frame counts real pairs only, and the inner reunion delivers exactly those. LEFT would keep the EU's unpaired member as a ghost row and the frame would overcount by one empty ticket.",
      },
    ],
    distractors: ["<>", "=", "<=", "'APAC'", "INNER"],
    walkthrough:
      "The frame prints 28: eight EU accounts combine into twenty-eight distinct pairs, the arithmetic of eight choose two — and the guard is what makes the count come out even instead of doubled. The cohort math feeds the draw: 28 pairs at the EU scale, 10 at APAC, 1 at US, 0 at LATAM, which is why the sampling document sizes cohorts before regions. The near-misses teach the guard's family: <> doubles the EU frame to 56 mirrored pairs; = collapses it to 8 self-pairs, an account sampled with itself; <= lands on 36 by adding the eight self-rows to the real pairs. Each wrong guard is a plausible number, which is precisely why the frame document pins the operator instead of describing it. LEFT as the flavor would add the EU's unpaired account — the region's highest-id member, who has nobody left to pair with — as a twenty-ninth empty row, and a sampling frame with an empty ticket draws itself by accident.",
  },
  {
    id: "cs-473",
    tier: "easy",
    topic: "l14",
    universe: "pricing",
    title: "The same-shelf price-check list",
    brief:
      "From: Head of Product. Re: pricing reset, shelf-mate review.\n\nEvery product gets price-checked against its shelf-mates, so the reset needs the full list of same-shelf pairs — category, first item, second item — filed by category then item, deduped. The reviewers read it shelf by shelf and the filing order is non-negotiable.",
    ask: "All same-category product pairs with category, deduped, filed by category.",
    template: `SELECT a.category, a.name AS first_item, b.name AS second_item
FROM products a
{3} JOIN products b ON a.category = b.category AND a.id {1} b.id
ORDER BY a.category {2}, first_item;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The review reads each pair once, so a.id < b.id prints the smaller-id item first. <> doubles the list to twenty-four mirrored rows and the shelf-by-shelf review would price-check everything twice.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the category filing order",
        why: "Shelves file A to Z — Accessories first, Wearables last — ascending. DESC starts the reviewers on Wearables and walks the reset backwards through the catalog.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping flavor",
        why: "The review prices real shelf-mates, and the inner reunion returns exactly those twelve pairs. LEFT would add every shelf-mateless product as a ghost row — the yoga mat reviewing against an empty column.",
      },
    ],
    distractors: ["<>", "=", "DESC", "INNER"],
    walkthrough:
      "Twelve rows file shelf by shelf: Accessories opens with three pairs (HDMI cable with desk mat, HDMI with laptop stand, desk mat with laptop stand), Electronics follows with the keyboard-mouse-hub triangle, Audio pairs headset, mic and speaker three ways, then single pairs in Apparel, Video and Wearables — and Fitness prints nothing, its solo yoga mat having no shelf-mate to check against. The review's arithmetic: three-item shelves yield three pairs, two-item shelves one, one-item shelves zero — 3+3+3+1+1+1 = 12, with the guard keeping each check one-sided. The self-pair trap: with = the list gains seven rows where an item is price-checked against itself, and a rushed reviewer would sign off seven nonsense comparisons. LEFT would add the seven shelf-mateless items as ghost rows — including the yoga mat — which is arguably the honest review list, but the reset's spec says pairs only. DESC walks the catalog from Wearables backwards, and the reviewers' annotations would land on the wrong lines.",
  },
  {
    id: "cs-474",
    tier: "medium",
    topic: "l14",
    universe: "inventory",
    title: "The co-warehousing pairs, scored",
    brief:
      "From: Inventory count desk. Re: shared inbound logistics, vendor pairs.\n\nThe co-warehousing shortlist pairs same-region vendors with their scorecard ratings attached, so the desk can see who would share a dock and how strong each candidate is. Vendor A with rating, vendor B with rating, filed by vendor A's name.",
    ask: "Same-region vendor pairs with both ratings, filed by first vendor.",
    template: `SELECT a.name AS vendor_a, a.rating, b.name AS vendor_b, b.rating
FROM suppliers a
JOIN suppliers b ON a.region = b.region AND a.id {1} b.id
ORDER BY a.name {2}, a.rating {3};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Each pair prints once with the smaller id as vendor A — a.id < b.id. <> would print both seats and the desk would read four rows for two pairs.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the vendor-A filing order",
        why: "Pairs file A to Z by the first vendor, ascending — Nordic's pair leads. DESC files Shenzhen's pair first and the dock plan reads against the region tour.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the rating tiebreak",
        why: "When one vendor anchors two pairs, the stronger scorecard breaks the tie first — descending. ASC would bury the 4.8 under the 4.6 in a tie the desk actually needs surfaced.",
      },
    ],
    distractors: ["<>", "=", "<=", "b.rating"],
    walkthrough:
      "Two rows print, each carrying both scorecards: the EU pair — Nordic Gadgets AB at 4.6 with Alpine Audio GmbH at 4.8, the file's two best-rated vendors sharing a region — and the APAC pair, Shenzhen Electro at 4.1 with Pacific Textiles at 3.9. The dock conversation writes itself: the EU pair shares a region and the file's top ratings, while the APAC pair shares a region and the two lowest — same geography, very different vendor quality. The rating tiebreak is doing quiet future-proofing: today each vendor anchors one pair, but the day a third EU vendor appears, Nordic could anchor two, and the sort already knows stronger scorecards lead. The guard family shows its spread here: <> prints both seats of each pair (four rows), = prints six vendors paired with themselves, <= adds the self-rows to the real pairs for eight. And sorting the secondary key by the wrong side's rating fails the query outright — the tiebreak reads the first seat's column.",
  },
  {
    id: "cs-475",
    tier: "medium",
    topic: "l14",
    universe: "funnel",
    title: "Pair weights by region, heaviest first",
    brief:
      "From: Growth marketing lead. Re: peer-program weights by region.\n\nThe peer program weights regions by how many pairs they produce, so the funnel wants one row per region with its pair count, heaviest first. The counts feed email batching — and a region with no pairs should be visibly absent rather than silently zero.",
    ask: "Pair counts per region, heaviest region first.",
    template: `SELECT a.region, COUNT(*) AS pairs
FROM customers a
{1} JOIN customers b ON a.region = b.region AND a.id {2} b.id
GROUP BY a.region
ORDER BY pairs {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping flavor",
        why: "The batching plan needs to see LATAM's emptiness, not lose the row — LEFT keeps Bruno as a one-row region with no pairs. The inner flavor deletes the region and the batch plan forgets it exists.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Pair counts assume one row per pair — a.id < b.id. <> would double every region's weight and the EU would batch for fifty-six pairs that are really twenty-eight.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the heaviest-first sort",
        why: "Batching starts with the biggest cohort, so regions sort by pair count descending. ASC would batch the one-pair US region first and the EU last, backwards against the program's scale.",
      },
    ],
    distractors: ["INNER", "<>", "=", "ASC"],
    walkthrough:
      "Four rows print, heaviest first: EU 28, APAC 10, US 1, LATAM 1 — and the LATAM row is the quiet catch: with the keeping flavor it prints a count of one, but that one is a ghost row, Bruno kept with no partner column, not a real pair. The program's real pairing weight is 28, 10 and 1, with LATAM on the waiting list — which is exactly what the batching plan should see. The guard's spread across regions: <> doubles every count (56, 20, 2) and invents a LATAM zero that still isn't a pair; = collapses regions to self-pair counts (8, 5, 2, 1) that read like tiny programs. INNER would print three rows and quietly drop LATAM from the batch plan entirely — the region with the fewest resources is the one the flavor choice erases first. ASC batches US first, which the program can survive, but the EU landing last is backwards against every other metric on the funnel board.",
  },
  {
    id: "cs-476",
    tier: "medium",
    topic: "l14",
    universe: "supplier",
    title: "Fourteen bundle pairs from shared vendors",
    brief:
      "From: Supply-chain lead. Re: vendor bundle candidates, counted.\n\nBundling starts with products that share a vendor, so the audit counts same-vendor product pairs — the pool any bundle has to come from. One number for the audit pack, deduped, with a price floor the pack can adjust before the bundle round begins.",
    ask: "Count of same-vendor product pairs above the price floor, deduped.",
    template: `SELECT COUNT(*) AS bundle_pairs
FROM products a
JOIN products b ON a.{1} = b.supplier_id AND a.id {2} b.id
WHERE a.price > {3};`,
    slots: [
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the shared-vendor thread",
        why: "Bundles pair products from the same vendor — a.supplier_id = b.supplier_id is the thread. The category column would count shelf-mates instead and the audit would promise cross-vendor bundles.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The pool counts each pair once — a.id < b.id. <> doubles it to twenty-eight and the bundle round would plan against mirrors.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the price floor",
        why: "The pack opens with no floor — every product qualifies, and the threshold lives in the filter where no result cell shows it. The floor is the pack's one adjustment knob going into the bundle round.",
      },
    ],
    distractors: ["category", "id", "price", "50", "100"],
    walkthrough:
      "The pool prints 14: fourteen same-vendor product pairs across the six vendors — the four three-product vendors (Nordic, Shenzhen, Pacific, Midwest) contribute three pairs each, and the two two-product vendors (Alpine, Andes) one apiece — 4 times 3 plus 2, with the guard keeping each pair one-sided. The thread check matters because the neighbor number is seductive: same-shelf pairs also number 12, close enough to pass in a glance, but a bundle across category lines is exactly what the vendor relationship enables and the shelf does not. Point the thread at id instead and the count lands on 10 — pairs where one product's number happens to equal the other's vendor number, the seed's id-overlap quirk manufacturing plausible garbage. The floor's leverage: at 50 the pool thins to four pairs, at 100 to a single Audio pairing — the bundle round's size is one literal away from empty, which is why the pack pins the floor last.",
  },
  {
    id: "cs-477",
    tier: "medium",
    topic: "l14",
    universe: "expense",
    title: "Eleven pairs where status splits",
    brief:
      "From: Ops finance, spend review. Re: mixed-status pair mapping.\n\nThe review maps same-region pairs where exactly one account is active and the other dormant — mixed pairs are where a dormant account's spend hides behind a live one. Both names, live side first, filed A to Z, for the exposure walkthrough.",
    ask: "Same-region pairs with one active and one inactive account, live side first.",
    template: `SELECT a.name AS active_side, b.name AS dormant_side
FROM customers a
JOIN customers b ON a.region = b.region AND a.id < b.id
WHERE a.active = {1} AND b.active = {2}
ORDER BY active_side {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the live-side flag",
        why: "The live side carries the active flag 1, a status bit that never prints as a result cell. Flipping the pair of flags turns the list into its mirror — dormant side first — and the walkthrough reads backwards.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the dormant-side flag",
        why: "The dormant side carries the flag 0, the register's word for inactive. Both flags set to 1 would list all-active pairs — healthy pairings, not the exposure this map exists to find.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the walkthrough order",
        why: "The exposure walkthrough reads A to Z by the live side, ascending. DESC starts at the file's last live account and the walkthrough loses its agreed sequence.",
      },
    ],
    distractors: ["0", "2", "DESC", "b.active"],
    walkthrough:
      "Eleven pairs print, live side first: seven in the EU, where dormant Dmitri Volkov pairs with each of his active region-mates, and four in APAC around dormant Keiko Sato — the file's two inactive accounts, each sitting in a region full of live ones. The US and LATAM print nothing: both American accounts are active, and Bruno has no region-mate to be mismatched with. The mixed pair is the review's unit of concern because spend patterns migrate — a dormant account's subscriptions ride on the live neighbor's negotiating shadow, and eleven pairs is a small enough map to walk in one sitting. The flag swap is the map's mirror test: set both flags to 1 and the list becomes the 28 all-active EU-and-APAC pairings — healthy pairs, zero exposure; set the first flag to 2 and the query asks for a status that does not exist, printing silence. Sorting by the dormant side's flag column fails outright — the sort reads the printed columns, and the dormant flag never printed.",
  },
  {
    id: "cs-478",
    tier: "medium",
    topic: "l14",
    universe: "growth",
    title: "Fifty-six EU invitations, mirrors included",
    brief:
      "From: Growth marketing lead. Re: invitation counts, EU cohort.\n\nThe EU referral email sends one invitation per ordered pairing — every account invites every other account in its region, both directions counted, because each side writes its own note. One number for the send estimate, EU cohort, mirrors included on purpose.",
    ask: "Count of ordered EU account pairs, both directions included.",
    template: `SELECT COUNT(*) AS invite_pairs
FROM customers a
{1} JOIN customers b ON a.region = b.region AND a.id {2} b.id
WHERE a.region = {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the keeping flavor",
        why: "The send estimate keeps the EU's unpaired member visible as a ghost row — one account with nobody to invite prints as an empty invitation. The inner flavor would hide that account from a count that should explain the whole cohort.",
      },
      {
        answer: "<>",
        kind: "keyword",
        label: "the both-directions guard",
        why: "Invitations run both ways, so the guard a.id <> b.id counts every ordered pairing — Alice inviting Chloe and Chloe inviting Alice are two notes. < would count each note once and the send estimate would ship half the emails.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the cohort region",
        why: "The estimate scopes to the quoted text 'EU', the file's biggest cohort. 'APAC' would estimate twenty invitations and the EU send would go out short by thirty-six emails.",
      },
    ],
    distractors: ["<", "=", "<=", "'APAC'", "b.name"],
    walkthrough:
      "The estimate prints 56 — and the arithmetic is the eight-EU-account grid minus its diagonal: eight seats times eight minus eight self-pairs, every ordered pairing counted because each account writes its own note. The ghost row rides along: the keeping flavor would add a fifty-seventh row only if some EU account had no partner — with <> every EU account has seven, so the count is exactly 56, and the keeping flavor is there so the query pattern survives the day the cohort has an odd man out. The guard family, priced in emails: < estimates 28 (half the sends), = estimates 8 self-invitations nobody wants, <= estimates 36. The near-region check: APAC would estimate 20, which is why the send tool takes the region as a parameter rather than a guess. INNER versus LEFT never splits on this data — both print 56 — but the pattern that survives cohort changes is the one that keeps the ghost row visible.",
  },
  {
    id: "cs-479",
    tier: "medium",
    topic: "l14",
    universe: "fraud",
    title: "APAC pairs with cities attached",
    brief:
      "From: Fraud spot-check desk. Re: proximity tagging, APAC pass.\n\nThe ring check tags each APAC pair with the first account's city, so the reviewer can see which pairings cross a city line without opening another report. City, first account, second account — deduped, filed by city then name.",
    ask: "APAC pairs with base city, deduped, filed by city then name.",
    template: `SELECT a.city AS base_city, a.name AS first_account, b.name AS second_account
FROM customers a
JOIN customers b ON a.region = b.region AND a.id {1} b.id
WHERE a.region = {2}
ORDER BY base_city {3}, first_account;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The pass tags each pair once — a.id < b.id. <> prints both seats and the reviewer tags ten pairs as twenty, double-flagging every proximity read.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the pass region",
        why: "The pass is the quoted text 'APAC', exact. 'US' would tag one pair and the APAC reviewer would close the pass believing the region was swept.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the city filing order",
        why: "Proximity reads file by city A to Z, then by name — ascending. DESC starts the sweep in Tallinn's orbit and walks the map backwards against the region tour.",
      },
    ],
    distractors: ["'EU'", "'US'", "DESC", "b.city"],
    walkthrough:
      "Ten rows print, each carrying its base city — Dubai anchors Farid's four pairs, Seoul anchors Grace's three, Osaka anchors Hiro's two, Nagoya anchors Keiko's one, and Maya anchors none as a first seat — and the cities tell the real story: every APAC pairing crosses a city line, because no two APAC accounts share a city. That is the pass's finding: same-region proximity is universal here, same-city proximity is zero — the ring check's tighter test passes clean. The desk reads the base city knowing the second account's city differs every time; the tagged column is the sort key, not a match key. The guard keeps the ten rows from becoming twenty mirrored tags, and the reviewer's annotation sheet stays one row per pair. Sorting by the second seat's city fails the query outright — the sort reads printed columns, and the second seat's city never printed. 'US' as the pass region would print one tagged pair and the APAC reviewer would sign off on a region the query never walked.",
  },
  {
    id: "cs-480",
    tier: "hard",
    topic: "l14",
    universe: "catalog",
    title: "The pairing ladder, from grid to product",
    brief:
      "From: Catalog content manager. Re: the pairing engine's spec, customers edition.\n\nThe pairing engine's spec documents one number — the product-ready pair count — but the review wants the whole ladder understood: what the raw grid produces, what the mirror kill removes, and what survives the dedupe. One number with the ladder in the footnotes, counted from the register.",
    ask: "Count of deduped same-region account pairs, whole file.",
    template: `SELECT COUNT(*) AS ready_pairs
FROM customers a
{1} JOIN customers b ON a.region = b.region AND a.id {2} b.id
WHERE a.active = {3};`,
    slots: [
      {
        answer: "INNER",
        kind: "keyword",
        label: "the pairing flavor",
        why: "The spec counts real pairs, and the inner reunion keeps only rows where both seats exist. LEFT would add the unpaired accounts — one per region's last seat — as ghost rows the spec does not price.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Product-ready pairs are unordered and counted once — a.id < b.id. <> doubles everything with mirrors; = collapses the count to self-pairs the engine must never ship.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active-side flag",
        why: "The engine pairs active accounts, and the flag lives in the filter where no result cell prints it. Dropping the filter to zero would pair through the dormant accounts instead.",
      },
    ],
    distractors: ["<>", "=", "<=", "0", "LEFT"],
    walkthrough:
      "The spec prints 28: with the active filter the ready pool is the both-active pairs — EU 21, APAC 6, US 1, LATAM 0. The ladder behind it, region by region: the raw same-region grid across all sixteen accounts produces 94 rows (78 real pairs plus 16 self-rows), the mirror kill at <> keeps 78 ordered pairs, and the dedupe at < lands on 39 — of which 28 survive the active flag. Three operators, three completely different products, and the spec pins the one that ships. The flag's leverage: at 0 the engine pairs through Dmitri and Keiko instead of around them, and the count shifts by exactly their pair contributions — 2 EU rows and 4 APAC rows on the a-side — a different product with two dormant names in the middle. LEFT as the flavor adds four ghost rows (one unpaired account per region that has one), which the spec's footnote should mention so nobody mistakes 43 for a better offer. The self-pair count is the floor of the ladder: 16 rows where an account pairs with itself, the engine's degenerate case.",
  },
  {
    id: "cs-481",
    tier: "hard",
    topic: "l14",
    universe: "month-close",
    title: "Thirty-nine pairs, city tagged, whole file",
    brief:
      "From: Controller. Re: close checklist, the full pairing appendix.\n\nThe checklist's appendix lists every same-region account pair with the first seat's city attached — all regions, no filter — filed by region, then city, then name. The appendix is the audit trail for the co-region exposure note, and it must reconcile to the pair count the note quotes.",
    ask: "All same-region account pairs with base city, deduped, filed by region.",
    template: `SELECT a.city AS base_city, a.name AS first_account, b.name AS second_account
FROM customers a
{1} JOIN customers b ON a.region = b.region AND a.id {2} b.id
ORDER BY a.region {3}, base_city, first_account;`,
    slots: [
      {
        answer: "INNER",
        kind: "keyword",
        label: "the pairing flavor",
        why: "The appendix lists real pairs — the inner reunion keeps only rows where both seats exist. LEFT would append the unpaired accounts as ghost rows with empty partner columns, and the appendix would not reconcile to the note's count.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The appendix prints each pair once, smaller id first — a.id < b.id. <> doubles the appendix to seventy-eight rows and the reconciliation fails on sight.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the region filing order",
        why: "Regions file A to Z — APAC, EU, LATAM, US — ascending. DESC walks the appendix US-first and the reviewer's cross-references against the note all point the wrong way.",
      },
    ],
    distractors: ["<>", "=", "LEFT", "DESC"],
    walkthrough:
      "Thirty-nine rows file region by region: APAC's ten pairs, the EU's twenty-eight, LATAM none, the US one — Emma Wilson and Jamal Wright closing the appendix. The reconciliation the note needs: 10 plus 28 plus 0 plus 1 equals 39, the same number the pair count quotes, and every row carries its base city so the reviewer can spot that no pair shares a city — the region test binds, the city test never does. The flavor choice is the appendix's integrity check: LEFT would add four ghost rows — Bruno, Jamal, Maya and Pedro, the regional last seats with nobody after them — and the appendix would print forty-three rows against a note that says thirty-nine, a reconciliation failure with nothing actually wrong. The guard's mirror, <>, doubles every pair and the appendix becomes seventy-eight rows of duplicates arranged in mirrored seats — the most expensive way to learn what <> means. DESC files the US pair first and LATAM's silence last, which reads like an afterthought rather than a checked region.",
  },
  {
    id: "cs-482",
    tier: "hard",
    topic: "l14",
    universe: "refund-audit",
    title: "The mirror test: fifty-six ordered EU rows",
    brief:
      "From: Refund audit desk. Re: the ordered-pair exhibit.\n\nThe desk's training exhibit shows what ordered pairing looks like on the biggest cohort: every EU account paired with every other EU account, both directions printed, mirrors visible. Fifty-six rows, first seat alphabetical — the exhibit that teaches reviewers why deduped lists are half this size.",
    ask: "All ordered EU account pairs, mirrors included, alphabetical by first seat.",
    template: `SELECT a.name AS from_account, b.name AS to_account
FROM customers a
JOIN customers b ON a.region = b.region AND a.id {1} b.id
WHERE a.region = {2}
ORDER BY from_account {3}, to_account;`,
    slots: [
      {
        answer: "<>",
        kind: "keyword",
        label: "the ordered-pair guard",
        why: "The exhibit exists to show mirrors, so the guard keeps both directions — a.id <> b.id. The dedupe guard would halve the exhibit to twenty-eight rows and the teaching point would vanish.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the exhibit cohort",
        why: "The exhibit uses the quoted text 'EU', the file's biggest cohort — mirrors need a cohort big enough to see them. 'US' would exhibit a single pair and nobody would spot the mirror.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the exhibit order",
        why: "The exhibit files by first seat A to Z, then second seat, ascending — mirrors land exactly twenty-eight rows apart where the trainer can point at them. DESC scatters the mirrored rows and the pairing pattern hides.",
      },
    ],
    distractors: ["<", "=", "'APAC'", "DESC", "c.name"],
    walkthrough:
      "Fifty-six rows print, and the exhibit's power is the repetition: Alice Chen's name leads seven rows — one per EU region-mate — and Alice appears again as second seat in seven more rows further down, each pair printed twice in opposite seats. That is what ordered pairing means: fifty-six rows for twenty-eight real pairs, the mirror doubling the desk must recognize before it can trust a deduped list. The training beat lands hardest against the dedupe guard: swap <> for < and the exhibit collapses to twenty-eight rows, every mirror gone, and a reviewer who learned on the ordered version reads the deduped list as if rows were missing. The self-guard trap: = would exhibit the eight accounts paired with themselves — Alice with Alice — the degenerate rows that explain why every pairing spec starts with an inequality. 'APAC' would exhibit twenty ordered rows, a smaller mirror; c.name as a sort key fails outright, because the exhibit's columns are aliased seats, not the register's bare columns.",
  },
  {
    id: "cs-483",
    tier: "hard",
    topic: "l14",
    universe: "pricing",
    title: "The audio shelf's three pairings, priced",
    brief:
      "From: Head of Product. Re: the audio reset's pair view.\n\nThe audio reset prices shelf-mates against each other, so the pair view lists every Audio pairing with both prices attached — first item and price, second item and price — priciest first shelf anchored on the top of the range. Three rows expected; the reset checks the count before the prices.",
    ask: "All Audio product pairs with both prices, priciest first seat first.",
    template: `SELECT a.name AS first_item, a.price, b.name AS second_item, b.price
FROM products a
JOIN products b ON a.category = b.category AND a.id {1} b.id
WHERE a.category = {2}
ORDER BY a.price {3};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "Each pairing prices once with the smaller id first — a.id < b.id. <> would print six rows, every pairing twice, and the reset would anchor on the same pair from both seats.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the reset shelf",
        why: "The view scopes to the quoted shelf 'Audio', exact and case-sensitive. 'Electronics' would anchor the reset on a different trio and the audio narrative would inherit someone else's prices.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the priciest-first anchor",
        why: "The first seat anchors the reset, so pairs sort by the first item's price descending — the 149.99 headset leads. ASC would anchor on the 59.99 speaker and flip the shelf's story to bargain.",
      },
    ],
    distractors: ["<>", "'Electronics'", "'Fitness'", "ASC", "="],
    walkthrough:
      "Three rows print, priciest anchor first: the Noise-Canceling Headset at 149.99 paired with the Studio Mic at 119, the Headset with the Bluetooth Speaker at 59.99, and the Mic with the Speaker — the audio shelf's full triangle, three items taken two at a time. The prices make the spread visible: the Headset-to-Speaker gap is ninety dollars, which is the reset's argument that audio spans two price tiers with one shelf. The guard keeps the triangle one-sided — swap to <> and six rows print, every pairing repeated from the other seat, and the anchoring sort would list the Speaker twice at both ends of the story. The shelf check is the reset's safety: 'Electronics' also prints three pairs — keyboard, mouse and hub — a same-shaped answer with someone else's prices, which is exactly why the count alone never proves the shelf. = would exhibit the three audio items paired with themselves at identical prices, rows that look like pairings and price-check nothing. ASC anchors on the Speaker and the premium story collapses into a bargain story.",
  },
  {
    id: "cs-484",
    tier: "hard",
    topic: "l14",
    universe: "inventory",
    title: "Fourteen same-vendor pairs, filed",
    brief:
      "From: Inventory count desk. Re: the vendor-bundle appendix.\n\nThe bundle appendix lists every same-vendor product pair — first item, second item — filed A to Z by first item, deduped. The count desk walks the fourteen rows against the vendor map, and any row pairing products from different vendors invalidates the appendix.",
    ask: "All same-vendor product pairs, deduped, filed by first item.",
    template: `SELECT a.name AS first_item, b.name AS second_item
FROM products a
JOIN products b ON a.{1} = b.supplier_id AND a.id {2} b.id
ORDER BY first_item {3};`,
    slots: [
      {
        answer: "supplier_id",
        kind: "keyword",
        label: "the shared-vendor thread",
        why: "The appendix pairs products through the vendor pointer — a.supplier_id = b.supplier_id. The category column would list shelf-mates instead and the appendix would fail its own vendor check on twelve rows.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the dedupe guard",
        why: "The appendix prints each pair once — a.id < b.id. <> doubles it to twenty-eight rows and the walk would count every bundle twice.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing order",
        why: "The walk files A to Z by first item, ascending — the keyboard's pairs lead. DESC starts at the yoga mat and the desk's checklist runs against the vendor map's order.",
      },
    ],
    distractors: ["category", "id", "price", "<>", "DESC"],
    walkthrough:
      "Fourteen rows file A to Z, and the vendor map explains every one: Nordic's trio (keyboard, webcam, smart watch) contributes three pairs, Shenzhen's trio (mouse, ring light, running socks) three, Pacific's trio (hub, HDMI cable, jersey) three, Midwest's trio (headset, laptop stand, yoga mat) three, and the two-item vendors — Alpine with mic and desk mat, Andes with speaker and fitness band — one pair each. Twelve plus two, with the guard keeping each pair one-sided. The thread check is the appendix's spine: point the reunion at category instead and the list silently becomes the twelve shelf-mate pairs — same shape, wrong vendor logic, and two rows would pair products from different vendors, failing the appendix's own rule. Point it at id and ten rows print where a product number happens to equal a vendor number — the seed's overlapping id ranges manufacturing pairings that look audited and are not. <> doubles the walk; DESC walks it backwards; and a price-based thread pairs nothing, because no two prices share a value on this file.",
  },
];
