// Module 2 · deck 2 · topic "j5" — SELF-JOINS, batch j5c (cs-317…cs-325).
// The closing third of batch 5, built on the comparative surfaces the first
// two chunks left untouched: two same-region suppliers duel on rating, the
// org chart chained THREE aliases deep (rep → manager → grand-manager),
// siblings matched through a shared lead, each account's unbeaten maximum
// ticket via LEFT anti self-join, a customer×customer pairing leaderboard,
// stock deficits inside one shelf, delivered-vs-pending exposure paired
// across statuses, payment-rail switching, and price twins on different
// shelves. The lessons this batch drills: strict-guard operator battles
// measured in row deltas, second-hop keys on the MIDDLE alias, matching on
// the FK value vs chaining through it, LEFT+IS NULL as "no bigger row",
// pair-count arithmetic (14 × 13 = 182), per-alias status filters, and
// SQLite's text-in-boolean cast. Sibling batches j5a (cs-301…308) and j5b
// (cs-309…316) covered the comparison and pair-finding angles — none of
// their fills, universes or angles are reused here.
//
// Every figure below was probed against read-only COPY copies of
// db/custom.db (scripts/.tmp-j9c.db, self-cleaned) via
// scripts/probe-j9c1..7.ts. Probe 6 pre-verified the full
// distractor×slot consequence matrix for all nine templates; probe 7
// pinned the exact arm counts quoted in the coaching. NEVER probe the
// live db.

import type { CaseStudy } from "../types";

interface Deck2Case extends CaseStudy {
  /** Deck 2 — joins deck. */
  deck: 2;
}

export const casesJ5c: Deck2Case[] = [
  {
    id: "cs-317",
    deck: 2,
    topic: "j5",
    universe: "supplier",
    title: "The regional rating duel",
    brief:
      "From: Supplier audit, quarterly scorecard.\n\nSix houses supply the catalog and the scorecard wants rivalries, not averages: sit the supplier table beside itself, keep only the houses that share a region, and show each pairing with the rating edge the second house holds over the first. No house should face itself and no rivalry should print twice in mirror order — one row per duel, sharpest edge on top.",
    ask: "Same-region supplier pairings with both ratings and the rating edge, sharpest edge first.",
    template: `SELECT s1.name AS house_a, s1.rating AS rating_a, s2.name AS house_b, s2.rating AS rating_b,
       ROUND({1}, 1) AS edge
FROM suppliers s1 JOIN suppliers s2 ON {2} AND {3}
ORDER BY edge DESC, s1.id;`,
    slots: [
      {
        answer: "s2.rating - s1.rating",
        kind: "keyword",
        label: "the edge arithmetic",
        why: "The edge is challenger minus incumbent: ROUND(s2.rating - s1.rating, 1). Flip the operands and the sign flips — Alpine would read -0.2 despite out-rating Nordic; add the ratings instead and the column reports 9.4 and 8.0, which is nobody's edge.",
      },
      {
        answer: "s1.region = s2.region",
        kind: "keyword",
        label: "the same-region key",
        why: "A duel needs both houses in one region: s1.region = s2.region. Cross-copy typos like s1.region = s1.rating compare region text against a decimal and match nothing — six houses, zero duels.",
      },
      {
        answer: "s1.id < s2.id",
        kind: "keyword",
        label: "the duel guard",
        why: "The strict guard does both jobs at once: no house duels itself, and each rivalry prints once, lower id on the left. Loosen to <= and six self-duels with edge 0.0 crash the board (8 rows); <> adds both mirror orderings (4 rows); = keeps only the self-duels (6 rows of 0.0).",
      },
    ],
    distractors: ["s1.rating - s2.rating", "s2.rating + s1.rating", "s1.region = s1.rating",
      "s1.id <= s2.id", "s1.id <> s2.id", "s1.id = s2.id"],
    walkthrough:
      "Two copies of the supplier table, one region match, one strict guard — that's the whole duel board, and it comes back with exactly two rivalries because the six houses split across four regions (two houses each in EU and APAC, one each in US and LATAM). The EU duel: Nordic Gadgets AB 4.6 against Alpine Audio GmbH 4.8 — edge +0.2 to the challenger. The APAC duel: Shenzhen Electro 4.1 against Pacific Textiles 3.9 — edge -0.2, the only pairing where the second house trails. The operator ledger is the real lesson: = leaves six self-duels at 0.0, <= adds those six to the two real rows (8), <> doubles the field with mirrors (4), and only strict < yields 2. Watch the key too: matching s1.region to s1.rating joins text to decimals — SQLite casts, nothing matches, and the board goes quiet. Same table twice, two different jobs: the region arm decides WHO meets, the guard decides HOW OFTEN.",
  },
  {
    id: "cs-318",
    deck: 2,
    topic: "j5",
    universe: "people-ops",
    title: "Three seats up the line",
    brief:
      "From: Support org, escalation review.\n\nWhen a rep escalates, the ticket can cross two management seams before it lands with someone who can actually decide — and I want to know which reps that really applies to. Chain the employee table through two joins so every rep row carries their manager and their manager's manager, reps only. If a chain dead-ends at a top seat, it doesn't belong on the list.",
    ask: "Reps with both their manager and grand-manager resolved, in reporting order.",
    template: `SELECT e.name AS report, e.role AS report_role, m.name AS manager, g.name AS grand_manager
FROM employees e
JOIN employees m ON {1}
JOIN employees g ON {2}
WHERE {3}
ORDER BY e.id;`,
    slots: [
      {
        answer: "m.id = e.manager_id",
        kind: "keyword",
        label: "the first hop",
        why: "Seat one resolves the rep's own boss: m.id = e.manager_id. Point it backwards (m.manager_id = e.id) and you demand the boss report TO the rep — nobody does, the chain dies at zero rows; set m.id = e.id and every rep becomes their own manager, five phantom rows.",
      },
      {
        answer: "g.id = m.manager_id",
        kind: "keyword",
        label: "the second hop",
        why: "Seat two keys on the MIDDLE alias — the grand-manager is the manager's manager, g.id = m.manager_id. Swapping to g.id = e.manager_id re-derives seat one: the grand column just repeats the manager (5 rows, Marcus Hale printed twice up the line); g.id = m.id collapses the top two seats into one person.",
      },
      {
        answer: "e.role = 'rep'",
        kind: "keyword",
        label: "the rep filter",
        why: "The brief wants reps: e.role = 'rep' keeps the five front-line staff. Loosen it to e.role <> 'rep' and the five seniors step in — but only two of them (Marcus Hale, Aiko Yamada) even have a boss, and both dead-end at a lead with no manager of their own, so the second hop sheds them too: zero rows; m.role = 'rep' asks whether the MANAGERS are reps and empties the list just as fast.",
      },
    ],
    distractors: ["m.id = e.id", "m.manager_id = e.id", "g.id = e.manager_id",
      "g.id = m.id", "m.role = 'rep'", "e.role <> 'rep'"],
    walkthrough:
      "A two-hop chain is two self-joins sharing one alias wheel: e is the rep, m the manager, g the grand-manager, and each ON clause consumes the previous alias's manager_id — m.id = e.manager_id, then g.id = m.manager_id, the key always on the middle seat. The org has 10 people (2 leads, 3 managers, 5 reps) and 7 of them carry a manager_id, but only 3 chains survive both hops: Elena Petrova and Ingrid Larsen → Marcus Hale → Sofia Marin, and Ravi Menon → Aiko Yamada → Daniel Okoye. Tomas Ruiz (→ Daniel Okoye) and Carla Dominguez (→ Petra Novak) dead-end at a top seat — Daniel and Petra have no manager of their own, so the second hop drops them and the list stays honest at three. The failure modes are worth memorizing: g.id = e.manager_id doesn't error, it ECHOES — five rows where the grand column repeats the manager; m.id = e.id invents five self-managing reps. Both hops must consume the previous alias, or the chain silently reads one seat twice.",
  },
  {
    id: "cs-319",
    deck: 2,
    topic: "j5",
    universe: "growth",
    title: "Teammates under one lead",
    brief:
      "From: Growth board deck, team expansion slide.\n\nFor the pairing slide I want teammates who share the same team lead — those are the pairs a new hire can shadow — and I want the region split visible, because a cross-region pairing reads differently on the slide than a same-region one. Sit the employee table beside itself on the shared lead, one row per pair, and bring the lead's name along for the label.",
    ask: "Employee pairs sharing one team lead, with both regions and the lead's name.",
    template: `SELECT e1.name AS teammate_a, e1.region AS region_a, e2.name AS teammate_b, e2.region AS region_b,
       m.name AS team_lead
FROM employees e1
JOIN employees e2 ON {1} AND {2}
JOIN employees m ON {3}
ORDER BY e1.id;`,
    slots: [
      {
        answer: "e1.manager_id = e2.manager_id",
        kind: "keyword",
        label: "the shared-lead key",
        why: "Teammates match on the FK VALUE: both copies point at the same lead, e1.manager_id = e2.manager_id. e1.manager_id = e2.id instead checks whether one teammate IS the other's lead — on this org chart every manager carries a lower id than their reports, so with the guard demanding a higher id on the right, the arm matches nothing and the pairing set comes back empty.",
      },
      {
        answer: "e1.id < e2.id",
        kind: "keyword",
        label: "the pair guard",
        why: "Strict < keeps each pair once, lower id left. <= admits the self-pairs — seven employees face themselves (9 rows); <> adds both mirror orderings (4 rows); e1.id = e2.id contradicts the shared-lead arm's intent and strands each employee with nobody but themself.",
      },
      {
        answer: "m.id = e1.manager_id",
        kind: "keyword",
        label: "the lead lookup",
        why: "The third alias resolves the shared value into a name: m.id = e1.manager_id. m.id = e1.id labels each pair with teammate A as their own lead; m.manager_id = e1.id asks who reports to teammate A and collapses the board to one row with Ravi Menon mislabeled as lead.",
      },
    ],
    distractors: ["e1.id = e2.id", "e1.manager_id = e2.id", "e1.id <= e2.id",
      "e1.id <> e2.id", "m.id = e1.id", "m.manager_id = e1.id"],
    walkthrough:
      "This is the shared-parent shape: instead of chaining THROUGH the foreign key (rep → boss), both copies match ON it — e1.manager_id = e2.manager_id — and the same value resolves twice, once as the join key and once through m for the label. Two pairs survive the strict guard: Aiko Yamada (APAC) with Tomas Ruiz (LATAM) under Daniel Okoye — the deck's cross-region pairing — and Elena Petrova with Ingrid Larsen, both EU, under Marcus Hale. The operator battle: bare shared-lead matching yields 11 ordered pairs, <= trims to 9 (the seven self-pairings survive), <> keeps 4 (both directions of each pair), strict < leaves 2. And the lookup arm matters more than it looks: pointing m at e1.manager_id reads 'the person the value points at', while m.manager_id = e1.id reads 'who reports to teammate A' — the same two tables, one letter apart, two completely different org charts.",
  },
  {
    id: "cs-320",
    deck: 2,
    topic: "j5",
    universe: "expense",
    title: "The unbeaten tickets",
    brief:
      "From: Spend report, executive summary.\n\nThe spend board wants one line per account: that buyer's single largest ticket, with its amount. The catalog changes fast and I don't want a maintenance chore — write it so the answer survives new orders without editing a single id: a ticket makes the list exactly when no ticket from the same buyer costs more. Buyer name, ticket id, amount, biggest spenders at the top.",
    ask: "Each account's largest ticket by total, with the amount, no ids hard-coded.",
    template: `SELECT c.name AS account, o1.id AS ticket, ROUND(o1.total, 2) AS ticket_total
FROM orders o1
JOIN customers c ON c.id = o1.customer_id
LEFT JOIN orders o2 ON {1} AND {2}
WHERE {3}
ORDER BY o1.total DESC;`,
    slots: [
      {
        answer: "o2.customer_id = o1.customer_id",
        kind: "keyword",
        label: "the same-buyer key",
        why: "A rival ticket only competes within its own account: o2.customer_id = o1.customer_id. Slipping to o2.customer_id = o1.id joins buyer ids to ticket numbers — two unrelated id spaces — and the 'unbeaten' test then compares 90 scrambled rows instead of real rivals.",
      },
      {
        answer: "o2.total > o1.total",
        kind: "keyword",
        label: "the beaten-by test",
        why: "'Unbeaten' means nothing strictly bigger exists: o2.total > o1.total. >= lets a ticket beat itself and kills every row (0 results); < hunts the beaten side instead and returns each account's SMALLEST ticket — a different 16 rows entirely; o2.id > o1.id tests age, not money, and crowns a different 16.",
      },
      {
        answer: "o2.id IS NULL",
        kind: "keyword",
        label: "the no-rival test",
        why: "LEFT keeps a ticket even with no rival, leaving o2 empty — o2.id IS NULL is the 'nobody bigger' signature. IS NOT NULL flips it to 'has a bigger sibling' and returns the 624 beating pairs; o1.id IS NULL tests the inner side, which a successful JOIN always fills — zero rows forever.",
      },
    ],
    distractors: ["o2.customer_id = o1.id", "o2.total >= o1.total", "o2.total < o1.total",
      "o2.id > o1.id", "o2.id IS NOT NULL", "o1.id IS NULL"],
    walkthrough:
      "The classic LEFT anti self-join: sit a second copy of orders beside each ticket, keep only the rivals that would beat it (same buyer, strictly more total), and the tickets with no rival surviving the LEFT — o2.id IS NULL — are each account's maximum. Sixteen rows come back, one per buyer, topped by Farid Nasser's 1,088.44 on ticket 74, then Chloe Dubois 945.21 and Emma Wilson 845.92; because no account ties its own maximum, the list is exactly one row per buyer with no dedupe needed. The operator ledger teaches the shape: >= self-destroys to zero (a ticket always ties itself), < rotates the query into a minimum-finder — only Liam O'Brien and Olivia Brown, the two one-ticket buyers, keep their seats while every other account swaps to its smallest ticket — and o2.id > o1.id answers 'latest ticket' instead of 'biggest'. The 624 behind IS NOT NULL is the total count of ordered same-buyer pairs — the anti-join keeps the 16 rows where that count is zero. No GROUP BY, no MAX, no hard-coded ids: new orders just show up and the crown moves on its own.",
  },
  {
    id: "cs-321",
    deck: 2,
    topic: "j5",
    universe: "funnel",
    title: "The pairing leaderboard",
    brief:
      "From: Marketing funnel, co-spend review.\n\nBefore we fund joint campaigns we rank account pairs inside each region by how much they engage — every ordered ticket from account A times every ordered ticket from account B is a 'pairing', and the leaderboard takes the top four. Accounts face region-mates only, each pair counted once with the lower account id on the left. Show both account names, the region, and the pairing count.",
    ask: "The top four same-region account pairs by cross-engagement pairing count.",
    template: `SELECT c1.name AS account_a, c2.name AS account_b, c1.region AS region, COUNT(*) AS pairings
FROM customers c1
JOIN customers c2 ON {1} AND {2}
JOIN orders o1 ON {3}
JOIN orders o2 ON o2.customer_id = c2.id
GROUP BY c1.id, c2.id
ORDER BY pairings DESC
LIMIT 4;`,
    slots: [
      {
        answer: "c1.region = c2.region",
        kind: "keyword",
        label: "the same-region frame",
        why: "Rivals must share a market: c1.region = c2.region. Flip it to <> and the board ranks cross-region pairs — Alice Chen with Emma Wilson at 408 — a different tournament entirely; c1.id = c2.id pairs every account with itself before the guard has its say and the whole frame collapses to zero rows.",
      },
      {
        answer: "c1.id < c2.id",
        kind: "keyword",
        label: "the pair guard",
        why: "One row per pair, lower id left: c1.id < c2.id. Weaken to <> and both orderings survive — the 39 rivalries double to mirrored duplicates with Grace/Maya and Maya/Grace sitting back to back; = keeps only the 16 self-pairs (1,351 raw rows of a buyer's tickets crossing themselves); > mirrors the board instead of sorting it.",
      },
      {
        answer: "o1.customer_id = c1.id",
        kind: "keyword",
        label: "the left seat's orders",
        why: "o1 must hang off the LEFT account: o1.customer_id = c1.id. o1.customer_id = c2.id hands account A's seat to account B's tickets — 1,225 rows where both join legs read the same side and every pairing count lies; o1.id = c1.id repeats the id-space collision, matching ticket numbers to customer numbers for 165 bogus rows.",
      },
    ],
    distractors: ["c1.region <> c2.region", "c1.id = c2.id", "c1.id <> c2.id",
      "c1.id > c2.id", "o1.id = c1.id", "o1.customer_id = c2.id"],
    walkthrough:
      "Four joins deep and still one idea: two customer copies cut the region-mate frame, then one orders join per seat counts each side's tickets, and COUNT(*) multiplies them — Grace Kim's 14 orders against Maya Patel's 13 give 182 pairings, the board's top. Alice Chen appears three times (with Chloe Dubois 120, Isabella Rossi 96, Noah Meyer 96) because her 24 orders multiply against every EU peer — pairing count measures engagement mass, and a big buyer inflates every pair it sits in. Region coverage: EU fields 28 rivalries, APAC 10, US 1, LATAM none — the leaderboard is EU-flavored by construction. The guard ledger: = self-pairs only (1,351 rows), <> doubles to 2,408 with mirrors, strict < keeps 39. And the silent killer is the o1 leg: point it at c2 and both seats draw from the same orders — the query still runs, still sorts, and every number on the board is quietly twice as big as the truth.",
  },
  {
    id: "cs-322",
    deck: 2,
    topic: "j5",
    universe: "inventory",
    title: "The stock deficit ladder",
    brief:
      "From: Inventory count, rebalance prep.\n\nBefore the weekly rebalance I want the shelf imbalance board: product pairs that share a category where one item's stock dwarfs the other's — units behind computed as the second item's stock minus the first's, deepest deficit on top. One row per pairing with the shelf labeled, lower product id left, and no item counted against itself.",
    ask: "Same-category product pairs with the stock deficit of the second item versus the first, deepest first.",
    template: `SELECT p1.name AS item_a, p2.name AS item_b, p1.category AS shelf, {1} AS units_behind
FROM products p1 JOIN products p2 ON {2} AND {3}
ORDER BY units_behind DESC;`,
    slots: [
      {
        answer: "p2.stock - p1.stock",
        kind: "keyword",
        label: "the deficit arithmetic",
        why: "Deficit is second minus first: p2.stock - p1.stock. Reversing the operands flips every sign — the ladder would summit at HDMI 2.1 Cable 2m's +320 instead of the real worst deficit; summing the stocks invents a quantity nobody counts.",
      },
      {
        answer: "p1.category = p2.category",
        kind: "keyword",
        label: "the same-shelf key",
        why: "Rebalancing moves units within one shelf: p1.category = p2.category. Swapping to p1.supplier_id = p2.supplier_id keeps the self-join shape but changes the question to same-house pairings (14 of them, several across shelves) — a supplier audit, not a shelf audit.",
      },
      {
        answer: "p1.id < p2.id",
        kind: "keyword",
        label: "the pairing guard",
        why: "Strict < yields each pairing once, lower id left. <= adds the 16 self-pairings (28 rows, every deficit 0); <> doubles the real pairings into mirrors (24 rows); > just flips which seat is 'behind'.",
      },
    ],
    distractors: ["p1.stock - p2.stock", "p2.stock + p1.stock", "ABS(p2.stock - p1.stock)",
      "p1.supplier_id = p2.supplier_id", "p1.id <= p2.id", "p1.id <> p2.id"],
    walkthrough:
      "Twelve pairings survive the guard, and the ladder reads as a restock agenda: Mechanical Keyboard K1 sits 180 units behind shelf-mate Wireless Mouse M3, Studio Desktop Mic 165 behind Bluetooth Speaker Mini, Noise-Canceling Headset 150 behind the same speaker — three Electronics/Audio gaps at or above 100, which is the rebalance trigger. The direction test is the subtle part: p2.stock - p1.stock is positive when the SECOND item holds more, so the top of the ladder is where item_b hoards; ABS() would flatten sign into size and summit at the HDMI-to-Laptop-Stand 320 gap, hiding who actually holds the surplus. Operator ledger: <= 28 (16 self-pairings), <> 24 (mirrored), strict < 12. And the key swap matters — the same self-join on supplier_id answers 'which houses double up across shelves', a vendor question wearing an inventory coat.",
  },
  {
    id: "cs-323",
    deck: 2,
    topic: "j5",
    universe: "month-close",
    title: "The two-sided book",
    brief:
      "From: Month-end close, working capital note.\n\nFor the working-capital note I want the accounts carrying real two-sided exposure: a settled ticket and an open ticket for the same buyer, paired up with the combined book on each row. Settled means delivered, open means pending, and only pairings whose combined value clears 1,000 make the note. Lower ticket id on the settled side, biggest book at the top — the controller reads exactly five lines, no more.",
    ask: "Delivered-plus-pending ticket pairs per account worth 1,000 or more combined, biggest book first.",
    template: `SELECT c.name AS account, o1.id AS settled_ticket, ROUND(o1.total, 2) AS settled,
       o2.id AS open_ticket, ROUND(o2.total, 2) AS open_amt,
       ROUND({1}, 2) AS book
FROM orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND {2}
JOIN customers c ON c.id = o1.customer_id
WHERE {3} AND ROUND(o1.total + o2.total, 2) >= {4}
ORDER BY book DESC;`,
    slots: [
      {
        answer: "o1.total + o2.total",
        kind: "keyword",
        label: "the combined book",
        why: "Exposure is the pair summed: ROUND(o1.total + o2.total, 2). Substituting o2.total - o1.total reports the gap between tickets, not the book; o1.total alone quietly measures only the settled side — and since no settled ticket reaches 1,000 by itself, the note empties to zero rows.",
      },
      {
        answer: "o1.id < o2.id",
        kind: "keyword",
        label: "the pair guard",
        why: "Lower ticket id takes the settled seat: o1.id < o2.id. Flipping to o2.id < o1.id re-seats the pair the other way round — 6 mirror rows where the pending ticket happens to be older join the board with settled and open columns swapped; <> keeps both orderings (11 rows total).",
      },
      {
        answer: "o1.status = 'delivered' AND o2.status = 'pending'",
        kind: "keyword",
        label: "the per-alias statuses",
        why: "Each seat carries its own status: delivered on the settled alias, pending on the open alias. Swapping delivered for 'shipped' asks a different desk (9 pairings clear the bar on shipped-plus-pending); dropping the delivered arm entirely lets settled seats hold any status and floods the note.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the materiality bar",
        why: "The controller's bar is 1,000 combined. Drop it to 900 and the note grows to 8 lines — the four extras are pairings the close already waived; the bar belongs on the SUM, not on either ticket alone.",
      },
    ],
    distractors: ["o2.total - o1.total", "o1.total", "o2.id < o1.id", "o1.id <> o2.id",
      "o1.status = 'shipped' AND o2.status = 'pending'", "900"],
    walkthrough:
      "Two copies of orders, one buyer key, one strict guard — then each alias wears its own status badge: o1 must be delivered (the settled seat), o2 pending (the open seat). Five pairings clear the 1,000 bar and the top of the note is Chloe Dubois twice over: tickets 27 (577.19 settled) and 43 (945.21 open) book 1,522.40, while her 34 (121.12) pairs with the same open 43 for 1,066.33 — one open ticket feeding two settled pairings, which is exactly why rows are pairings and not accounts. Between them: Emma Wilson's 624.66 + 585.79 = 1,210.45, Farid Nasser's 44.48 + 1,088.44 = 1,132.92 — the biggest open ticket in the store riding the smallest settled partner — and Alice Chen's 705.23 + 317.49 = 1,022.72. The orientation subtlety is the real teach: flipping the guard to o2.id < o1.id does NOT return the same five rows re-sorted — it returns 6 rows, the pairings where the pending ticket is the OLDER id, because the status filter rides the aliases. The bar itself belongs on the sum: no settled ticket in the note reaches 1,000 on its own, and at 900 the ledger already swells to 8.",
  },
  {
    id: "cs-324",
    deck: 2,
    topic: "j5",
    universe: "cash",
    title: "Buyers who switch rails",
    brief:
      "From: Cash desk, payments mix review.\n\nThe processor wants to know who actually alternates payment rails — buyers whose history pairs a card with a wallet or a bank transfer — because rail-switchers behave differently on refunds. Sit the payments ledger beside itself, keep only the cross-method pairs that belong to one buyer, and count each buyer's mixed pairs. Biggest switchers first; everyone with zero mixed pairs stays off the board.",
    ask: "Per buyer, the count of cross-method payment pairs, heaviest switchers first.",
    template: `SELECT c.name AS buyer, COUNT(*) AS mixed_pairs
FROM payments p1 JOIN orders o1 ON o1.id = p1.order_id
JOIN payments p2 ON {1}
JOIN orders o2 ON o2.id = p2.order_id
JOIN customers c ON c.id = o1.customer_id
WHERE {2} AND {3}
GROUP BY c.id
ORDER BY mixed_pairs DESC, c.name;`,
    slots: [
      {
        answer: "p1.id < p2.id",
        kind: "keyword",
        label: "the pair guard",
        why: "Each payment pair once, lower id left: p1.id < p2.id. Loosening to <> doubles every pairing into mirrors — Alice's 92 balloons to 184 and the whole board doubles to 462 rows grouped; <= looks like it should add self-pairs, but a payment can't disagree with its own method, so it silently changes nothing.",
      },
      {
        answer: "o1.customer_id = o2.customer_id",
        kind: "keyword",
        label: "the shared-buyer key",
        why: "Payments don't carry the buyer — their orders do: o1.customer_id = o2.customer_id pairs only tickets from one account. Collapsing to o1.id = o2.id narrows to same-ticket pairs and the board shrinks to two rows (Dmitri Volkov and Emma Wilson, one split ticket each); o1.id = o2.customer_id matches ticket numbers to buyer numbers — 21 rows of pure id-space noise.",
      },
      {
        answer: "p1.method <> p2.method",
        kind: "keyword",
        label: "the rail-switch test",
        why: "The brief hunts MIXED rails: p1.method <> p2.method. Flip to = and you count loyal pairs instead — 237 of them, out-numbering the 231 mixed pairs and reversing the board's story; p1.amount <> p2.amount tests money, not method, and lets two card payments at different prices masquerade as a switch (468 rows).",
      },
    ],
    distractors: ["p1.id <> p2.id", "p1.order_id = p2.order_id", "o1.id = o2.id",
      "o1.id = o2.customer_id", "p1.method = p2.method", "p1.amount <> p2.amount"],
    walkthrough:
      "The buyer key lives one hop away from the self-join — payments only know their order_id, so both payment copies drag their orders along and the buyer match happens between the ORDER aliases: o1.customer_id = o2.customer_id. Twelve buyers show mixed behavior out of sixteen, led by Alice Chen at 92 mixed pairs from her 24-ticket pile, Emma Wilson 61, Grace Kim 39; the ledger totals 231 mixed pairs against 237 loyal ones (method =), a near-even split the processor didn't expect. The census behind it: 62 card charges, 16 wallet, 13 bank transfer across 91 payments. Two teaches hide in the operator battle: <= is the rare decoy with NO effect — self-pairs can never disagree with their own method, so the method test does the guard's cleanup for free — and the same-ticket variant (o1.id = o2.id) isolates just the split tickets, Dmitri's 81 and Emma's 33, the only pairs where one purchase switched rails mid-payment. Strict < keeps the board honest at one row per unordered pair.",
  },
  {
    id: "cs-325",
    deck: 2,
    topic: "j5",
    universe: "catalog",
    title: "Twins across the shelves",
    brief:
      "From: Warehouse catalog, bundling candidates.\n\nPromotions wants near-price twins from DIFFERENT shelves — items a shopper would compare across categories — to anchor bundle pricing. Sit the catalog beside itself, keep different-shelf pairs whose prices land within 5.00 of each other, and show the absolute gap to the cent. Tightest twins on top, one row per pair, lower product id left.",
    ask: "Cross-shelf product pairs priced within 5.00 of each other, tightest gap first.",
    template: `SELECT p1.name AS twin_a, p1.category AS shelf_a, p2.name AS twin_b, p2.category AS shelf_b,
       ROUND({1}, 2) AS gap
FROM products p1 JOIN products p2 ON p1.id < p2.id AND {2}
WHERE ABS(p2.price - p1.price) <= {3}
ORDER BY gap;`,
    slots: [
      {
        answer: "ABS(p2.price - p1.price)",
        kind: "keyword",
        label: "the symmetric gap",
        why: "A twin's gap can't care about direction: ABS(p2.price - p1.price). The signed version flips half the board negative — Wireless Mouse M3 against Yoga Mat Eco 6mm reads -2.50 and drops out of any upward sort — while a text column like p1.name casts to 0 in the arithmetic and flattens every gap to a useless 0.00.",
      },
      {
        answer: "p1.category <> p2.category",
        kind: "keyword",
        label: "the cross-shelf test",
        why: "Bundles pair DIFFERENT shelves: p1.category <> p2.category. Flip to = and you demand same-shelf twins — at the 5.00 bar there are none, so the bundle list goes empty; p1.supplier_id = p2.supplier_id swaps shelves for sourcing and also returns zero twins under 5.00, both silent wrong-answers.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the twin bar",
        why: "The bar is 5.00. Drop it to 3.00 and the HDMI-to-Socks twin at 3.51 falls out, leaving two; raise it to 10.00 and the board floods to 13 pairings as near-misses like Cycling Jersey Pro against Bluetooth Speaker Mini (5.01) sneak in.",
      },
    ],
    distractors: ["p1.category = p2.category", "p1.supplier_id = p2.supplier_id", "p1.name",
      "p2.name", "p1.category", "p2.category"],
    walkthrough:
      "Same table, strict guard, and the twist that defines the case: the shelf arm EXCLUDES instead of matching — p1.category <> p2.category — because a cross-shelf twin is only interesting if the shelves differ. Three pairs clear the 5.00 bar: Wireless Mouse M3 (Electronics) with Yoga Mat Eco 6mm (Fitness) at 2.50, Ring Light 14\" (Video) with Laptop Stand Aluminum (Accessories) at 2.51, and HDMI 2.1 Cable 2m (Accessories) with Running Socks 3-pack (Apparel) at 3.51 — three bundles, six shelves touched twice each. Just past the bar sit the near-misses the promos team will ask about next: Bluetooth Speaker Mini against Cycling Jersey Pro at 5.01 and Wireless Mouse M3 against Ring Light 14\" at 5.49; at a 10.00 bar the board holds 13 pairings. The quiet lesson is SQLite's cast: drop a text column like p2.name into a boolean slot and it reads as false — every row vanishes with no error. ABS() is non-negotiable: the signed gap would bury two of the three twins below zero and the bundles would never make the deck.",
  },
];
