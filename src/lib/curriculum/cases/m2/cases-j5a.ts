// Module 2 · deck 2 · topic "j5" — SELF-JOINS (one table under two aliases).
// Batch j5a: cs-301…cs-308. Every case turns ONE table against itself under
// two (occasionally three) aliases: alias discipline (c1 vs c2, p1 vs p2),
// self-pair + mirror elimination via `a.id < b.id`, ghost rows on the optional
// side (LEFT self-join: suppliers with no regional peer, shelf-toppers via a
// NULL-anti), aggregate-over-self-join rollups, same-table comparison logic,
// and cross-alias column confusion (whose column did you mean?).
//
// Contract note: this file is authored ahead of the deck-2 infra landing in
// ../types.ts. Deck2Case below mirrors the planned deck-2 CaseStudy (adds
// `deck: 2`; everything else is the audited Module-1 shape, so the file stays
// assignable to CaseStudy[] and mechanically auditable by scripts/case-audit.ts
// for every gate the two decks share: execution, figure-in-result,
// distractor-consequence, bank hygiene, prose minima, marker discipline).
// The deck-2-only gates (JOIN-bearing fills, ≤2 SELECTs, 3-4 slots, bank 5-6,
// topic "j5") are enforced by scripts/probe-j9a-gates.ts.
//
// All figures below were probed against a read-only COPY of db/custom.db
// (scripts/.tmp-j9a.db) via scripts/probe-j9a-*.ts. NEVER probe the live db.

import type { CaseStudy } from "../types";

export interface Deck2Case extends CaseStudy {
  /** Deck 2 — joins deck. */
  deck: 2;
}

export const casesJ5a: Deck2Case[] = [
  {
    id: "cs-301",
    deck: 2,
    topic: "j5",
    universe: "growth",
    title: "Region-mate pairs for the launch wave",
    brief:
      "From: Growth marketing lead. Re: buddy-cohort seeding for the regional launch wave.\n\nWe're pairing accounts inside each region so every cohort has two people who can compare notes — same region, and each partnership listed once, with the earlier signup always taking the left column so the list never shows a mirror of itself. Give me the full pairing list, buyer_a and buyer_b, ordered stably.",
    ask: "Every same-region pair of accounts, listed once (no self-pairs, no mirrors), ordered by the left account's id.",
    template: `SELECT c1.name AS buyer_a, c2.name AS buyer_b
FROM customers c1
{1} customers c2
  ON c1.region = {2} AND
     c1.id < {3}
ORDER BY c1.id, c2.id;`,
    slots: [
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the self-join keyword",
        why: "The list pairs customers WITH customers, so the FROM table is joined to itself: JOIN customers c2 gives the second copy the pairing needs. A bare LEFT here would also keep every region-loner as a ghost row with an empty partner — this list wants real pairs only.",
      },
      {
        answer: "c2.region",
        kind: "keyword",
        label: "the right-hand region",
        why: "The match is c1.region = c2.region — the LEFT copy's region against the RIGHT copy's. Writing c1.region = c1.region compares the column to itself, which is always true and pairs every account with every later id (120 rows). Reaching for c2.city confuses region with city and matches nothing.",
      },
      {
        answer: "c2.id",
        kind: "keyword",
        label: "the upper-bound id",
        why: "c1.id < c2.id does two jobs at once: it kills self-pairs (an account can't be its own buddy) and it kills mirror duplicates (only the lower id takes the left seat). c1.id < c1.id compares a row to itself and is false for every row — the pairing list would come back empty.",
      },
    ],
    distractors: ["LEFT", "INNER", "CROSS", "c1.region", "c2.city", "c1.id"],
    walkthrough:
      "One table, two aliases: c1 is the left seat, c2 the right seat, and the ON clause is the whole game. c1.region = c2.region keeps partnerships inside a region; c1.id < c2.id is the discipline — a self-pair would need id < id, impossible, and the mirror of a pair would need the bigger id to sit left, also impossible, so each partnership appears exactly once. Run it and you get 39 pairs: 28 inside EU (8 accounts), 10 inside APAC (5), 1 inside US (Emma Wilson with Jamal Wright — the only two US accounts), and none in LATAM because Bruno Silva is the region's sole account. The first row is Alice Chen with Chloe Dubois, both EU. If the chip c1.region had gone into the right-hand slot, the guard c1.id < c2.id would still be the only real filter and you'd have shipped 120 cross-region pairs — a buddy list that pairs Berlin with Dubai.",
  },
  {
    id: "cs-302",
    deck: 2,
    topic: "j5",
    universe: "catalog",
    title: "Shelf-mate census with the mirror guard",
    brief:
      "From: Warehouse catalog steward. Re: shelf-mate audit before the category review.\n\nI need every pair of products that share a shelf — same category — listed once per pair: the lower-id item as item_a, the higher as item_b. The category review counts on this census being pair-exact, so no product may face itself and no pair may show up twice in opposite orders. Category and both names, please.",
    ask: "Each same-category product pair once, lower id first, with the shared category shown.",
    template: `SELECT p1.name AS item_a, p2.name AS item_b, p1.category
FROM products p1
JOIN products p2
  ON p1.category = p2.category
 AND {1} {2} {3}
ORDER BY p1.category, p1.id;`,
    slots: [
      {
        answer: "p1.id",
        kind: "keyword",
        label: "the left-seat id",
        why: "The guard compares the two copies' ids, and the left seat is p1: p1.id is the smaller one by construction of <. Reaching for p1.price here would compare a price against an id — a numeric accident, not a pairing rule.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the strict guard",
        why: "Strict < does the de-duplication for free: equal ids (self-pairs) fail it and only the smaller id leads, so mirrors can't appear. <= would readmit every product facing itself (28 rows), and <> would readmit both orders of each pair (24 rows, every mirror doubled).",
      },
      {
        answer: "p2.id",
        kind: "keyword",
        label: "the right-seat id",
        why: "The right side of the comparison must come from the second alias: p1.id < p2.id. Swapping in p1.id on both sides — p1.id < p1.id — compares each row to itself and is false everywhere, silently returning an empty census instead of 12 pairs.",
      },
    ],
    distractors: ["OR", "=", "<>", "<=", "AND", "p1.price"],
    walkthrough:
      "This is the alias-discipline workout: one products table, two aliases, and three numbers that tell you what each guard choice costs. With no id guard at all the shelf match yields 40 rows — 16 of them products facing themselves, the rest mirrors. Tighten to <> and the self-pairs die but mirrors remain: 24 rows. The strict p1.id < p2.id is the census form: 12 pairs, each once, lower id left. Watch the Fitness shelf — Yoga Mat Eco 6mm is its only product, so it contributes zero pairs; Accessories, Audio and Electronics contribute three each. The two traps worth naming: = collapses the census to 16 self-pairs (every product paired with itself), and OR between the shelf match and the id guard explodes the result to 256 rows by pairing everything with a higher id regardless of category. One table, two names, one strict comparison — that's the whole self-join.",
  },
  {
    id: "cs-303",
    deck: 2,
    topic: "j5",
    universe: "supplier",
    title: "Suppliers with no regional peer",
    brief:
      "From: Procurement lead. Re: supplier audit — single-point-of-region risk.\n\nBefore we consolidate contracts I want the suppliers who are alone in their region — no second source on the same ground, so a local disruption hits them with no backup. Our system has no 'peer count' column; the only way to see loneliness is to sit each supplier next to the others and look for the empty chair. Flag the lonely ones by name and region.",
    ask: "Suppliers that have no other supplier in their region, shown with that region.",
    template: `SELECT s1.name, s1.region
FROM suppliers s1
{1} JOIN suppliers s2
  ON s1.region = s2.region
 AND s1.id {2} s2.id
WHERE s2.id IS {3};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the ghost-keeping join",
        why: "Ghost rows only survive a LEFT JOIN: suppliers with no peer keep their row with NULLs on the s2 side. INNER would erase exactly the lonely suppliers we're hunting — the audit would return zero rows and 'prove' there is no risk.",
      },
      {
        answer: "<>",
        kind: "keyword",
        label: "the not-me guard",
        why: "s1.id <> s2.id removes each supplier from its own peer set — without it every supplier would 'match' itself and nobody would look lonely. Swapping in = inverts the logic entirely: the join then matches each row only to itself, every chair is filled, and the ghost list is empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-chair test",
        why: "After a LEFT JOIN, a NULL s2.id is the signature of no match — the empty chair. IS NULL finds the lonely suppliers; IS NOT NULL flips the panel and reports the four suppliers that DO have a regional peer.",
      },
    ],
    distractors: ["INNER", "RIGHT", "CROSS", "=", "NOT NULL", "IS"],
    walkthrough:
      "This is the anti-flavored self-join: sit every supplier next to every other supplier in its region (s1.id <> s2.id keeps me out of my own chair), then keep only the rows where the right chair never got filled — s2.id IS NULL after a LEFT JOIN. Two suppliers come back: Midwest Hardware Co (US) and Andes Naturals SA (LATAM) — each is the only supplier on its ground, so a regional disruption there has no same-region fallback. The mirror test tells you the guards are right: NOT NULL instead returns the four suppliers with peers (Nordic Gadgets AB and Alpine Audio GmbH in EU, Shenzhen Electro and Pacific Textiles in APAC), and INNER join returns nothing at all because an inner join can't keep the very rows the question asks about. One 6-row table, two aliases, and the emptiness on one side IS the answer.",
  },
  {
    id: "cs-304",
    deck: 2,
    topic: "j5",
    universe: "funnel",
    title: "How many accounts ever came back",
    brief:
      "From: Growth marketing lead. Re: exec funnel appendix — the repeat question.\n\nEvery exec deck gets asked 'how many customers are actually repeat buyers?' and the honest answer needs pairing, not grouping vibes: an account counts as repeat only if a second, different order exists for the same customer. Count the distinct accounts that have at least one earlier-later order pair. One number for the slide.",
    ask: "Count of distinct accounts that have at least two orders, via an earlier-later order pairing.",
    template: `SELECT COUNT({1} o1.customer_id) AS repeat_accounts
FROM orders o1
JOIN orders o2
  ON o1.{2} = o2.customer_id
 AND o1.id {3} o2.id;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the de-duplication inside COUNT",
        why: "The pairing repeats each account once per pair it appears in — 624 pair-rows cover the same accounts many times over. COUNT(DISTINCT …) collapses them to accounts; COUNT(ALL …) would report the pair count 624 as if it were customers.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the pairing key",
        why: "Orders link to their owner through customer_id: o1.customer_id = o2.customer_id means 'same account, two orders'. The near-miss o1.id = o2.customer_id joins an order number to a customer number — the two id spaces overlap, so it silently fabricates 103 fake pairs and a plausible-but-wrong 7.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the earlier-later guard",
        why: "o1.id < o2.id makes the second order a genuinely different one and counts each pair once. <= would let an order pair with itself — every order qualifies, and the count inflates to 16, the whole customer book, including the two one-time buyers.",
      },
    ],
    distractors: ["ALL", "SUM", "id", "<=", "="],
    walkthrough:
      "The self-join builds every earlier-later order pair within an account: o1.customer_id = o2.customer_id finds siblings, o1.id < o2.id keeps the two orders distinct and each pair single-counted — 624 pair-rows in total. That raw count is not the answer, because an account with 24 orders (Alice Chen's customer id) contributes 276 pairs alone; COUNT(DISTINCT o1.customer_id) is what turns pairs into people: 14 of our 16 accounts have come back at least once. Only two accounts never did — the ones with a single order each. Two traps this case exists for: the id-space collision (o1.id = o2.customer_id looks symmetric but joins order numbers to customer numbers; the overlap fabricates 103 rows and counts 7 — a beautifully plausible wrong answer) and <=, which lets every order be its own 'second order' and inflates the census to all 16.",
  },
  {
    id: "cs-305",
    deck: 2,
    topic: "j5",
    universe: "fraud",
    title: "Accounts with three or more orders",
    brief:
      "From: Risk team, spot-check rotation. Re: exposure census for the quarter.\n\nPolicy caps manual review attention, so we rank accounts by order count: anything with three or more orders carries enough volume to warrant a file this cycle. There's no order-count column — prove the third order exists by walking the pairing twice: an order, a later sibling, and a later sibling of that. Count the distinct accounts that clear it.",
    ask: "Count of distinct accounts having at least three orders, proven by a chained three-order pairing.",
    template: `SELECT COUNT({1} o1.customer_id) AS exposed_accounts
FROM orders o1
JOIN orders o2
  ON o1.customer_id = o2.customer_id
 AND o1.id < o2.id
JOIN orders o3
  ON o2.customer_id = {2}
 AND o2.id < {3};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the de-duplication inside COUNT",
        why: "The chain repeats every qualifying account once per ordered triple it owns — 3,382 triple-rows in total. DISTINCT is what folds triples back into accounts; ALL (the default) would report 3,382 as the answer, a triple count masquerading as a headcount.",
      },
      {
        answer: "o3.customer_id",
        kind: "keyword",
        label: "the third hop's owner",
        why: "The second hop needs the third alias's owner: o2.customer_id = o3.customer_id keeps all three orders on one account. o2.customer_id = o2.customer_id is trivially true and drops the third hop entirely — the query slides back to the two-order census (14).",
      },
      {
        answer: "o3.id",
        kind: "keyword",
        label: "the chain's forward guard",
        why: "o2.id < o3.id walks time forward and keeps the chain of three distinct orders. Pointing it at o2.id instead — o2.id < o2.id — is false for every row, the chain never forms, and the count collapses to zero.",
      },
    ],
    distractors: ["ALL", "o2.customer_id", "o2.id", "o1.id", ">"],
    walkthrough:
      "Two hops along the same edge: the first join pairs each order with a later sibling (same customer, o1.id < o2.id); the second join asks the middle order for a later sibling of its own — o2.customer_id = o3.customer_id and o2.id < o3.id — so the chain visits three distinct orders on one account. The raw chain is 3,382 ordered triples, which is why COUNT(DISTINCT o1.customer_id) is the deliverable: 11 accounts have placed at least three orders. The census brackets cleanly — 14 accounts have two or more, 11 have three or more, so the exposure tier is the repeat population minus its two-order edge. The alias confusion this case trains: pointing the forward guard at o2.id (o2.id < o2.id) zeroes the whole query, and > instead of < walks the chain backwards, inflating the count to 14 by letting the 'third' order precede the middle one.",
  },
  {
    id: "cs-306",
    deck: 2,
    topic: "j5",
    universe: "pricing",
    title: "Shelf gaps worth a premium review",
    brief:
      "From: Head of Product. Re: pricing review — where the premium story already exists.\n\nOn shelves where we sell a budget and a premium option, I want the gaps that clear 40: the premium item, the budget item it towers over, and the gap rounded to cents. Those are the shelves where customers already accept a steep step-up. Biggest gap first so the review opens with the strongest evidence.",
    ask: "Same-shelf pairs whose price gap exceeds 40, with the gap rounded to 2 decimals, biggest first.",
    template: `SELECT p1.name AS premium_item, p2.name AS budget_item,
       ROUND(p1.price - p2.price, 2) AS gap
FROM products p1
JOIN products p2
  ON p1.category = p2.category
 AND p1.price {2} p2.price + {1}
ORDER BY gap {3};`,
    slots: [
      {
        answer: "40",
        kind: "number",
        label: "the minimum gap",
        why: "The brief sets the premium bar at a gap over 40, so the comparison is price > other price + 40 — strictly greater, a gap of exactly 40.00 misses the cut. The threshold lives in the ON clause because it is part of what makes two rows a pair here.",
        noVerify: true,
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the premium direction",
        why: "p1 is the premium seat: p1.price > p2.price + 40 keeps only pairs where the first item towers over the second. Flipping to < turns the panel upside down — it lists budget items 'towering' by negative gaps (33 rows of them) and the review reads backwards.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the evidence order",
        why: "Biggest gap first is DESC on the computed gap — the review opens with the 120.99 headline. ASC would open on the weakest 40.99 pair and bury the headline at the bottom of the list.",
      },
    ],
    distractors: ["20", "60", "<", "=", "ASC"],
    walkthrough:
      "Same-shelf pairing with a price condition in the ON clause: p1.category = p2.category makes them shelf-mates, and p1.price > p2.price + 40 both orients the pair (p1 is the premium seat) and enforces the gap. Seven pairs clear the bar. The headline: Smart Watch S at 199.99 over Fitness Band X2 at 79 — a 120.99 gap on the Wearables shelf. Then Noise-Canceling Headset over Bluetooth Speaker Mini at 90, 4K Webcam Pro over Ring Light 14\" at 89.01, Studio Desktop Mic over the same speaker at 59.01, Mechanical Keyboard K1 over Wireless Mouse M3 at 55.49, Cycling Jersey Pro over Running Socks 3-pack at 46.5, and the thinnest qualifier, Mechanical Keyboard K1 over USB-C Hub 7-in-1 at 40.99 — the one that proves the bar is strict, because 40.00 would have missed it. The threshold is doing real work: at 60 only three pairs survive, at 20 the list swells to nine and the story dilutes.",
  },
  {
    id: "cs-307",
    deck: 2,
    topic: "j5",
    universe: "inventory",
    title: "One shelf-topper per shelf",
    brief:
      "From: Warehouse ops manager. Re: cycle-count priorities for the premium plan.\n\nThe counting crew hits the expensive shelves first, so I need each category's single most expensive product — and if a category has no dearer alternative to compare against, it still owns the top spot. No per-category subqueries in this toolchain; prove top rank by sitting every product next to its shelf-mates and keeping the one nobody beats.",
    ask: "The most expensive product in each category, proved by a join that finds no dearer shelf-mate.",
    template: `SELECT p1.name, p1.category, p1.price
FROM products p1
{1} JOIN products p2
  ON p2.category = p1.category
 AND p2.price {2} p1.price
WHERE p2.id IS {3}
ORDER BY p1.price DESC;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the unbeaten-row keeper",
        why: "A shelf-topper is a row whose only possible 'dearer shelf-mate' match doesn't exist — that row survives exclusively as a LEFT JOIN ghost. INNER join deletes exactly the rows the question asks to keep and returns nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the dearer-than probe",
        why: "The ON clause asks p2 for a shelf-mate that is strictly dearer: p2.price > p1.price. A top product finds none, so its join side stays NULL. >= would let every product match itself (its own price is >= its price), leaving no NULLs and an empty result.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the no-beater test",
        why: "s2-style emptiness is the proof: p2.id IS NULL means no dearer shelf-mate exists, which is the definition of the top spot. IS NOT NULL flips it and lists the beaten products — 12 rows of also-rans, some twice.",
      },
    ],
    distractors: ["INNER", "CROSS", "RIGHT", "<", ">=", "NOT NULL"],
    walkthrough:
      "Ranking without window functions: the LEFT self-join offers every product a dearer shelf-mate (p2.category = p1.category AND p2.price > p1.price), and the ones with no match — p2.id IS NULL — are precisely the shelf-toppers. Seven categories, seven rows: Smart Watch S 199.99 on Wearables, Noise-Canceling Headset 149.99 on Audio, 4K Webcam Pro 129 on Video, Mechanical Keyboard K1 89.99 on Electronics, Cycling Jersey Pro 65 on Apparel, Laptop Stand Aluminum 42.5 on Accessories, and Yoga Mat Eco 6mm 32 on Fitness — note that last one: Fitness has a single product, no competition at all, and the LEFT join still crowns it, which is exactly the 'no dearer alternative still owns the top spot' clause in the brief. The two instructive failures: INNER join returns zero rows (it cannot keep unmatched rows, and unmatched IS the answer), and >= returns zero too because every product beats-or-ties itself. Flip the probe to < and you get the seven floor items — the cheapest per shelf — a valid census, but not the one ops asked for.",
  },
  {
    id: "cs-308",
    deck: 2,
    topic: "j5",
    universe: "month-close",
    title: "No shelf shares a source",
    brief:
      "From: Financial Controller. Re: close notes — concentration risk annex.\n\nBefore I sign the inventory valuation I want the shelf-pair panel: every pair of same-category products with both suppliers named, so the annex can show no shelf ever leans on one source twice. Pair each shelf's products once (lower id left), pull each side's supplier name, and exclude any pair whose two products come from the same supplier.",
    ask: "Each same-category product pair once, with both supplier names, excluding same-supplier pairs.",
    template: `SELECT p1.category,
       p1.name AS shelf_a, s1.name AS source_a,
       p2.name AS shelf_b, s2.name AS source_b
FROM products p1
JOIN products p2
  ON p1.category = {1}
 AND p1.id < p2.id
JOIN suppliers s1 ON s1.id = p1.supplier_id
JOIN suppliers s2 ON {2} = p2.supplier_id
WHERE p1.supplier_id {3} p2.supplier_id
ORDER BY p1.category, p1.id;`,
    slots: [
      {
        answer: "p2.category",
        kind: "keyword",
        label: "the shelf match",
        why: "The shelf match compares the two product copies: p1.category = p2.category. Pointing it at p1.category on both sides is always true and the panel explodes to 106 pairs that ignore shelves; p2.name compares a category against a product name and matches nothing.",
      },
      {
        answer: "s2.id",
        kind: "keyword",
        label: "the second supplier's key",
        why: "The second outward join keys on the RIGHT product's supplier: s2.id = p2.supplier_id. Reusing s1.id there attaches the LEFT product's supplier to the right seat — a cross-wired lookup that demands both products share a source and silently empties the panel.",
      },
      {
        answer: "<>",
        kind: "keyword",
        label: "the cross-source filter",
        why: "The annex excludes same-source pairs, so the filter is p1.supplier_id <> p2.supplier_id. Flipping it to = turns the panel into the same-source watchlist — which is empty on this data, and would read as 'no shelf pairs exist' instead of 'every pair is cross-sourced'.",
      },
    ],
    distractors: ["p2.name", "p1.category", "s1.id", "p2.id", "=", "<"],
    walkthrough:
      "The self-join stays the star — p1 and p2 are two copies of products paired per shelf with the p1.id < p2.id guard (each pair once, lower id left) — and the two outward joins only decorate: s1 reads the left product's supplier, s2 the right's. The panel lands at 12 cross-source pairs across six categories, and the annex's headline writes itself: zero same-source shelf pairs exist. All six suppliers feed two or three shelves, but never twice on the same one — Accessories alone pairs Pacific Textiles with Alpine Audio GmbH and with Midwest Hardware Co, and so on down the panel. Two instructive near-misses: = instead of <> returns zero rows (which is the TRUE statement about same-source pairs, but a lie about the panel), and < keeps 11 of the 12 — it silently drops the one Wearables pair where the left product's supplier id (6, Andes Naturals SA) is the larger, a reminder that < filters supplier ids just as brutally as it filters product ids.",
  },
];
