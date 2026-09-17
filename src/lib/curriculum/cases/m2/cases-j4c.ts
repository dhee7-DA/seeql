// Joins-deck batch j4c — multi-table chains, cs-292..cs-300. Batches j1/j2/j3
// taught single joins, ghost rows and anti-joins; this batch makes the CHAIN
// itself the lesson: journeys through 3-5 tables where depth creates the trap —
// fan-out multiplication at the hub (payments x refunds, touch x payment),
// mid-chain arms that re-print the endpoint board, ghost rows propagating down
// the hops, chain direction (fact-first vs dimension-first), and id-space
// collisions at mid-chain ON keys that execute silently and fabricate pairings.
// Every figure quoted in prose was probed live against a read-only copy of the
// seed db (scripts/probe-j8c*.ts) before being written down.

import type { CaseStudy } from "../types";

export const casesJ4c: CaseStudy[] = [
  {
    id: "cs-292",
    deck: 2,
    topic: "j4",
    universe: "cash",
    title: "Settlements pinned to the channel that bought them",
    brief:
      "From: Cash desk. Re: channel P&L tie-out.\n\nThe finance partner wants settled money pinned to the acquisition channel that bought each account — but she warns the last draft didn't tie to the processor's 24,216.51 and she wants the discrepancy explained, not hidden. The money lives four tables away from the channel tag: payments → orders → customers → acquisitions. Build the per-channel board and be ready to footnote what the chain double-counts and what it never sees.",
    ask: "Settled payment count and settled amount per acquisition channel, heaviest channel first.",
    template: `SELECT a.channel, COUNT(p.id) AS settlements, ROUND(SUM({1}), 2) AS settled
FROM payments p
JOIN orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
JOIN acquisitions a ON {2} = c.id
WHERE p.status = {3}
GROUP BY {4}
ORDER BY settled DESC;`,
    slots: [
      {
        answer: "p.amount",
        kind: "keyword",
        label: "the settled money",
        why: "The money lives on the payment row, so SUM(p.amount) counts each settlement once. a.spend is the marketing cost of the touch and repeats once per payment row of the buyer — affiliate's true 57.85 of spend prints as 197.66 — and o.total is the whole ticket repeated per settlement: referral reads 9,307.56 against the true 8,682.90.",
      },
      {
        answer: "a.customer_id",
        kind: "keyword",
        label: "the touch-side key",
        why: "Acquisition touches point at buyers through a.customer_id, so the pairing is a.customer_id = c.id. a.id pairs touch row numbers to buyer row numbers — two unrelated counters that share a range — and the board mutates: retargeting collapses to one 444.80 row (Olivia's money wearing Alice's touch id). o.id = c.id matches no order here and empties the board.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the cash state",
        why: "A cash board carries cleared money, so the arm reads 'settled' — quoted, it's a value. 'pending' re-prints the whole board as open authorizations (referral 4 rows / 1,831.51) and 'failed' leaves a single row: Emma Wilson's 143.86 card attempt. Unquoted settled hunts for a column named settled and errors.",
      },
      {
        answer: "a.channel",
        kind: "keyword",
        label: "the grouping key",
        why: "The deliverable is one row per channel, so the chain groups at its far end by the column the brief names: a.channel. c.name explodes the board to fourteen per-account rows and buries the channel story; c.region re-prints it as a four-row regional map that answers a question nobody asked.",
      },
    ],
    distractors: ["a.id", "o.id", "a.spend", "o.total", "'pending'", "c.name"],
    walkthrough:
      "Six channels come back: referral 26 settlements / 8,682.90, social 22 / 5,905.12, affiliate 14 / 4,882.94, retargeting 17 / 4,660.26, search 5 / 1,728.54, email 4 / 1,659.03 (Isabella Rossi and Liam O'Brien, the email pair). Now the footnote the partner demanded: these six rows sum to 88 settlement slots and 27,518.79 — more than the processor's 77 rows / 24,216.51 — because the chain visits Alice Chen twice (social touch a1 and retargeting touch a15), so her 17 settled payments, 4,660.26, land in two channels; and it never visits Noah Meyer or Pedro Alvarez at all (no touch rows — 3+3 settlements, 1,357.98, invisible to any channel board). Within a channel the count is honest; across the report, channel attribution is a business decision, not an arithmetic one. The chain lesson generalizes: every hop can multiply, so a dimension column (a.spend) dragged through repeats per fact row, a dropped arm re-prints the board as a different ledger, and the INNER chain silently deletes buyers it has no touch row for.",
  },
  {
    id: "cs-293",
    deck: 2,
    topic: "j4",
    universe: "receivables",
    title: "Where the quarter's claims actually sit",
    brief:
      "From: Receivables. Re: quarterly claims map.\n\nThe quarter closed with twenty-five claims worth 3,579.65 spread over twenty-two tickets, and the collections call wants the map by buyer region — not by claim. Claims know money and tickets, not geography, so the query must walk refund → order → customer before it can group. The last draft grouped by a key that only looked right, so verify every pairing on the way up.",
    ask: "Claim count and claimed amount per customer region, heaviest region first.",
    template: `SELECT c.region, COUNT(r.id) AS claims, ROUND(SUM({1}), 2) AS claimed
FROM refunds r
JOIN orders o ON {2} = r.order_id
JOIN customers c ON {3} = o.customer_id
GROUP BY c.region
ORDER BY claimed DESC;`,
    slots: [
      {
        answer: "r.amount",
        kind: "keyword",
        label: "the claimed money",
        why: "Claimed money lives on the refund row, so SUM(r.amount) lands on 3,579.65 across the 25 claims. o.total is the ticket price repeated once per claim — the three double-claimed tickets inflate their regions (APAC reads 2,974.21 instead of 1,674.19) — and SUM(r.id) adds claim id numbers, arithmetic with no business meaning (EU's 1,200.42 becomes 183).",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the ticket-side key",
        why: "Refunds point back at tickets through r.order_id, so the pairing is o.id = r.order_id. r.id = r.order_id matches nothing — no claim's row number equals its ticket — and c.id = r.order_id hunts buyers by ticket number, returning a two-row fiction (APAC 6 claims / 1,204.86) that no region actually owns.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the buyer-side key",
        why: "The buyer's key is o.customer_id, so the pairing is c.id = o.customer_id. o.id = o.customer_id asks which ticket number equals its buyer number — none do — and the map empties. r.id in that slot pairs claim ids to buyer ids and re-prints the map with somebody else's money (EU 2,599.20).",
      },
    ],
    distractors: ["o.total", "r.id", "p.id", "c.name", "o.customer_id"],
    walkthrough:
      "Four regions: APAC 9 claims / 1,674.19, EU 12 / 1,200.42, LATAM 2 / 401.62, US 2 / 303.42. EU owns the volume (twelve claims) but APAC the money; LATAM's entire book is Bruno Silva's order 6 claimed twice — both 'damaged', 401.62. The chain lesson is direction plus keys: start at the claim, the fact that owns the money, and walk up to geography, grouping at the far end — and every ON key must be read as a question ('what points at what?'), because id-shaped near-misses execute without error. o.id = c.id-style collisions don't crash, they just quietly publish someone else's map. The fan-out note underneath: 25 claims over 22 tickets means three tickets carry two claims each — exactly why the sum must read the claim-side r.amount and never the ticket-side o.total, which charges those three tickets to the region once per claim.",
  },
  {
    id: "cs-294",
    deck: 2,
    topic: "j4",
    universe: "expense",
    title: "Regional spend on EU-made goods",
    brief:
      "From: Spend report. Re: sourcing mix for the close deck.\n\nThe close deck claims EU makers dominate our cost base, and the CFO wants the number by buying region: what each region actually spent, at charged line prices, on goods made by EU suppliers. That's a five-table walk — lines to tickets to buyers for the region, lines to products to makers for the sourcing arm. Charge the column the buyer actually paid, not the catalog's list.",
    ask: "Charged line value spent per customer region on EU-supplier goods, biggest region first.",
    template: `SELECT c.region, ROUND(SUM({1} * oi.quantity), 2) AS spend
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON p.id = oi.product_id
JOIN suppliers s ON {2} = p.supplier_id
WHERE s.region = {3}
GROUP BY {4}
ORDER BY spend DESC;`,
    slots: [
      {
        answer: "oi.unit_price",
        kind: "keyword",
        label: "the charged price",
        why: "The buyer paid the line's charged price, so spend = oi.unit_price × quantity. p.price is the catalog list — every one of the 251 lines was charged at a different figure than its shelf price — and o.total × quantity multiplies the whole ticket by the line count: EU reads 30,856.96 against the true 6,943.66.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the maker-side key",
        why: "Products point at their maker through p.supplier_id, so the pairing is s.id = p.supplier_id. p.id = p.supplier_id pairs products to whichever house shares their row number and prints a fictional 13,914.84 of EU spend; oi.id or o.id in that key pair line/ticket numbers to supplier ids and collapse the board to a single row.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the sourcing arm",
        why: "The sourcing filter rides on the maker, so it reads s.region = 'EU' — quoted, it's a value. 'APAC' re-prints the map on Shenzhen/Pacific goods (EU buyers 2,188.85) and 'US' leaves LATAM with no row at all: Midwest Hardware is the only US maker and LATAM never bought one.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping key",
        why: "The deliverable is spend per buying region, so group by the buyer-side column c.region. p.category hands back a five-row category board, c.city fifteen per-city rows, and s.region collapses everything to one row — the arm already pinned the maker region to 'EU'.",
      },
    ],
    distractors: ["p.price", "o.total", "p.id", "oi.id", "'APAC'", "p.category"],
    walkthrough:
      "EU buyers spent 6,943.66 on EU-made goods, APAC 4,688.54, US 3,611.40, LATAM 652.28 — the deepest money journey in the deck: five tables, four joins, with the fact table (order_items) at the center and two two-hop branches hanging off it, one to the buyer's region and one to the maker's. The mid-chain arm is the lesson: s.region = 'EU' constrains a table three joins from the endpoint it reshapes — swap the arm to the buyer side and you've answered a different question entirely, EU buyers' spend on everything rather than everyone's spend on EU goods. And the value column must be the charged one end to end: all 251 lines in the store were charged at a different unit price than the catalog list, so p.price isn't an approximation of the truth, it's a different number wearing the same column shape — EU alone drifts 6,943.66 → 6,887.61, and the CFO's sourcing claim moves with it.",
  },
  {
    id: "cs-295",
    deck: 2,
    topic: "j4",
    universe: "logistics",
    title: "The Audio shelf, maker by maker",
    brief:
      "From: Shipments desk. Re: Audio category QBR.\n\nThe QBR needs the Audio story told from the supply side: how many shipped order lines each maker's Audio gear accounts for. The chain runs maker → product → line → ticket → shipment — five tables, four joins — and every join key on the way has an id-shaped near-miss one column away. Count only lines that actually moved: a line on a never-dispatched ticket has no shipment row to pair with.",
    ask: "Shipped order-line count per supplier for Audio products, biggest book first.",
    template: `SELECT s.name, COUNT(oi.id) AS lines
FROM suppliers s
JOIN products p ON {1} = p.supplier_id
JOIN order_items oi ON {2} = p.id
JOIN orders o ON o.id = oi.order_id
JOIN shipments sh ON {3} = o.id
WHERE p.category = {4}
GROUP BY s.name
ORDER BY lines DESC;`,
    slots: [
      {
        answer: "s.id",
        kind: "keyword",
        label: "the shelf key",
        why: "The shelf pairing is s.id = p.supplier_id — each product to the house that makes it. p.id = p.supplier_id pairs products to whichever maker shares their row number and hands every one of the six houses a 40-line Audio book, when only three houses make Audio at all.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line-side key",
        why: "Lines point at products through oi.product_id, so the pairing is oi.product_id = p.id. oi.id = p.id matches each line to the product sharing its row number — sixteen collisions — and the board collapses to two one-line houses that never stocked the category.",
      },
      {
        answer: "sh.order_id",
        kind: "keyword",
        label: "the leg key",
        why: "A shipment leg belongs to its ticket: sh.order_id = o.id. sh.id = o.id pairs shipment row numbers to ticket numbers — 82 same-numbered pairs — and Midwest's Audio book reads 21 instead of 17, a quietly wrong QBR nobody can trace to an error message.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the category arm",
        why: "The category arm names the shelf: p.category = 'Audio', quoted, one hop from the maker endpoint. 'Electronics' returns a different three houses (Shenzhen 15, Nordic 12, Pacific 9), 'Fitness' leaves Midwest alone at 9, and unquoted Audio hunts for a column named Audio and errors.",
      },
    ],
    distractors: ["p.id", "oi.id", "sh.id", "'Electronics'", "'Fitness'", "'Wearables'"],
    walkthrough:
      "Three houses carry Audio: Midwest Hardware Co 17 shipped lines, Alpine Audio GmbH 12, Andes Naturals SA 11 — Nordic, Shenzhen and Pacific don't stock the category and rightly never appear. But the store's Audio book is 51 lines, and the board counts 40: the chain starts at shipments, so the 11 Audio lines on never-dispatched tickets (3 cancelled, 8 pending) have no leg to pair with and never enter the board. Chain direction is the lens — start FROM order_items and the same joins count all 51; start FROM suppliers and walk to shipments and you see only what moved. This is the deck's purest key-discipline case: four ON keys, and next to each sits an id-shaped near-miss (p.id, oi.id, sh.id) that executes silently and publishes a fabricated supply story — 40-line books for houses with zero Audio, a 21 where 17 belongs.",
  },
  {
    id: "cs-296",
    deck: 2,
    topic: "j4",
    universe: "people-ops",
    title: "Team claim exposure through the org chart",
    brief:
      "From: Support org. Re: span-of-control review.\n\nThe quarterly review scores leads on their team's claim exposure, and the org chart is the route: every claim is signed by an employee, and every signer reports to someone. Walk claim → signer → manager so each manager's board shows directs, team claim count and team dollars — and the staff nobody reports to must still appear, at zero, or the review quietly flatters them.",
    ask: "Per manager, by direct reports: directs count, team claim count and team claimed amount, heaviest book first.",
    template: `SELECT m.name, COUNT(e.id) AS directs, {1}(r.id) AS team_claims, ROUND({2}(r.amount), 2) AS exposure
FROM employees m
LEFT JOIN employees e ON {3} = m.id
{4} JOIN refunds r ON r.processed_by = e.id
GROUP BY m.id
ORDER BY exposure DESC;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the team claim tally",
        why: "team_claims tallies refund rows under each manager: COUNT(r.id) reads 10 for Marcus, 0 for the five zero-team rows. AVG(r.id) averages id numbers (Marcus 12.5) and MAX prints one id — neither is a count, and both print NULL instead of the honest 0 on empty teams.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the team exposure",
        why: "Exposure is money, so SUM(r.amount): Marcus's directs moved 1,261.40. AVG(r.amount) would print an average ticket (126.14) and MAX the single biggest claim — neither is exposure, and a review scored on averages would rank a quiet desk over a heavy one.",
      },
      {
        answer: "e.manager_id",
        kind: "keyword",
        label: "the org-chart key",
        why: "The org-chart pairing is e.manager_id = m.id — each signer to the manager they actually report to. e.id = m.id matches everyone to themselves: the board re-prints each employee as their own team (Marcus 7 / 1,128.33, Ingrid 7, Ravi 5) and the three managers read zero. m.id = m.id matches everyone to everyone and gives all ten people the whole 25-claim book.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The five reps have no directs, so their rows must survive as zeros: LEFT keeps them, carrying NULLs down through the claim hop. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — deletes them, and the review's roster loses five names it is supposed to score at zero.",
      },
    ],
    distractors: ["AVG", "MAX", "e.id", "m.id", "INNER", "CROSS"],
    walkthrough:
      "Five boards, five zeros: Marcus Hale 2 directs / 10 claims / 1,261.40 (Elena 581.82 + Ingrid 679.58), Sofia Marin 1 / 7 / 1,128.33 — Marcus is HER direct, so the lead's book rolls up one level — Aiko Yamada 1 / 5 / 955.09 (Ravi), Daniel Okoye 2 / 2 / 150.99 (Tomas signs; Aiko has never signed one), Petra Novak 1 / 1 / 83.84 (Carla), then Elena, Ingrid, Ravi, Tomas and Carla at zero — nobody reports to a rep. The five boards sum to all 25 claims / 3,579.65: every claim's signer reports to someone. The mechanics are the batch's self-join crossing: the same table supplies both the signer (e) and the manager (m), and the chain crosses it mid-route — claims → employees → employees — before the ghost rows propagate. A manager with no directs carries NULL through the whole remaining chain, which is why COUNT(e.id) stays honest at 0 where COUNT(*) would print 1 for every empty desk.",
  },
  {
    id: "cs-297",
    deck: 2,
    topic: "j4",
    universe: "month-close",
    title: "Settlements and claims, account by account",
    brief:
      "From: Month-end close. Re: account-level tie-out.\n\nBefore I sign the close I want one board per account: how many settlements it produced and how many claims it attracted, side by side. The hub is the customer — orders hang off it, and payments and refunds both hang off those orders — which means every payment pairs with every claim on the same ticket and naive counters inflate. Count distinct rows, not joined rows, or the board won't tie.",
    ask: "Per customer: distinct settled payment count, distinct claim count and claimed amount, heaviest settlement book first.",
    template: `SELECT c.name, COUNT(DISTINCT {1}) AS settlements, COUNT(DISTINCT {2}) AS claims, ROUND(SUM(r.amount), 2) AS claimed
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
LEFT JOIN payments p ON p.order_id = o.id AND p.status = {3}
{4} JOIN refunds r ON r.order_id = o.id
GROUP BY c.id
ORDER BY settlements DESC, claims DESC;`,
    slots: [
      {
        answer: "p.id",
        kind: "keyword",
        label: "the settlement counter",
        why: "Settlements are payment rows, so COUNT(DISTINCT p.id). o.id would count tickets — Alice shows 24 orders where 17 settlements exist — and c.id collapses to 1 for every account: the hub's own key repeated, counting nothing.",
      },
      {
        answer: "r.id",
        kind: "keyword",
        label: "the claim counter",
        why: "Claims are refund rows, so COUNT(DISTINCT r.id). o.id counts tickets again — Hiro Tanaka would show 3 'claims' he never attracted (he has none, just 3 tickets) — and c.id collapses to 1 per account, erasing the difference between one claim and six.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the settlement arm",
        why: "The settlement book is cleared money, so the arm reads p.status = 'settled' — quoted, it's a value. 'pending' re-prints the board as open authorizations (Alice 3, Bruno 0) and 'failed' leaves Emma Wilson's single 143.86 attempt alone at the top of a board of zeros.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the claim-side preservation",
        why: "Hiro Tanaka and Liam O'Brien attracted no claims, and a tie-out board must show them at zero, not vanish: LEFT keeps their rows with NULLs where a claim would be. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — deletes them, and the close reconciles 14 accounts against a 16-account book.",
      },
    ],
    distractors: ["o.id", "c.id", "'pending'", "'failed'", "INNER", "o.customer_id"],
    walkthrough:
      "Sixteen accounts, side by side: Alice Chen 17 settlements / 6 claims / 216.38, Grace Kim 12 / 4 / 708.59, Emma Wilson 12 / 1 / 136.62, Maya Patel 9 / 2 / 592.46, Bruno Silva 2 / 2 / 401.62 — and Hiro Tanaka (3 settlements, 0 claims) and Liam O'Brien (1, 0) as the only zero-claim rows. The DISTINCT is the whole lesson: payments and refunds both hang off orders, so the chain pairs every settled payment with every claim on the same ticket — Bruno's order 6 carries one 752.96 settlement and two claims, so naive COUNT(p.id) reads 2 where 1 settlement exists, and Alice's two double-claimed tickets push her 17 to 19. Drop the DISTINCT and the board won't tie to the 77 settled rows / 24,216.51 or the 25 claims / 3,579.65 the close already certified. Today the reverse doubling never fires — the three split-payment orders (33, 81, 100) never attracted a claim — but the query must be built for the day one does.",
  },
  {
    id: "cs-298",
    deck: 2,
    topic: "j4",
    universe: "fraud",
    title: "Tickets the desk paid out on twice",
    brief:
      "From: Fraud spot-check. Re: double-dip sweep.\n\nPolicy flags any ticket that attracted two or more refunds — same ticket, two payouts — and the sweep wants the buyer's name, the ticket total, the claim count and the dollars claimed. Twenty-five claims cover twenty-two tickets, so three tickets are carrying double somewhere. Keep claims at claim granularity while showing who owns the ticket.",
    ask: "Customers with any single order carrying 2 or more refunds: name, ticket total, claim count, claimed amount.",
    template: `SELECT c.name, o.total, COUNT(r.id) AS claims, ROUND(SUM(r.amount), 2) AS refunded
FROM orders o
JOIN customers c ON {1} = o.customer_id
JOIN refunds r ON {2} = o.id
GROUP BY o.id
HAVING COUNT(r.id) >= {3}
ORDER BY refunded DESC;`,
    slots: [
      {
        answer: "c.id",
        kind: "keyword",
        label: "the buyer key",
        why: "The buyer pairing is c.id = o.customer_id. o.id = o.customer_id asks which ticket number equals its buyer's number — none do — and the sweep empties; c.name = o.customer_id compares text to a number and matches nothing; r.id in that slot reaches for a table not joined yet and errors out.",
      },
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the claim key",
        why: "Claims point at tickets through r.order_id, so the pairing is r.order_id = o.id. r.id = o.id pairs claim row numbers to ticket numbers — every ticket then carries at most one claim and the HAVING finds nobody; o.customer_id = o.id stops constraining claims per ticket and pairs one lucky ticket with all 25 claims, printing Emma Wilson as a 25-claim monster.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the double-dip threshold",
        why: "Policy flags two-or-more, so the threshold reads 2 — and it surfaces in the output as the claims count on every flagged row. 1 relaxes the sweep to all 22 claimed tickets and drowns the signal; 3 empties it, because no ticket was ever claimed three times.",
      },
    ],
    distractors: ["o.id", "c.name", "r.id", "o.customer_id", "1", "3"],
    walkthrough:
      "Three tickets: Bruno Silva's 752.96 order claimed twice — both 'damaged', 401.62, which is the entire LATAM refund book — and Alice Chen twice, 116.28 (damaged + wrong_item, 74.22) and 113.66 (late_delivery + damaged, 61.52). The fan-out is the story: 25 claims over 22 tickets because these three tickets each carry two claim rows — the join legitimately multiplies the ticket, one row per claim, and COUNT(r.id) grouped by ticket is what sees the duplication the sweep exists to catch. Group by c.name instead and the lens quietly changes: Alice collapses into one six-claim row worth 216.38 across her four claimed tickets — a person-level board, useful, but not the ticket-level sweep policy asked for. The chain keeps claim granularity (refund rows) and borrows identity (name, ticket total) from the tables above it — that is exactly what a chain join is for.",
  },
  {
    id: "cs-299",
    deck: 2,
    topic: "j4",
    universe: "growth",
    title: "What each channel's cohort actually bought",
    brief:
      "From: Growth lead. Re: channel demand read.\n\nThe board deck wants demand pinned to acquisition channels: for each channel, how many distinct tickets and how many order lines its acquired accounts produced. The chain runs touch → buyer → ticket → line, and it has two famous distortions — a buyer the chain visits twice, and buyers it can never visit — so count tickets distinctly and say plainly in the memo what the chain cannot see.",
    ask: "Per acquisition channel: distinct ticket count and order-line count, biggest demand first.",
    template: `SELECT a.channel, COUNT(DISTINCT o.id) AS tickets, COUNT(oi.id) AS lines
FROM acquisitions a
JOIN customers c ON {1} = c.id
JOIN orders o ON {2} = c.id
JOIN order_items oi ON {3} = o.id
GROUP BY {4}
ORDER BY tickets DESC;`,
    slots: [
      {
        answer: "a.customer_id",
        kind: "keyword",
        label: "the touch key",
        why: "Touches point at buyers through a.customer_id, so the pairing is a.customer_id = c.id. a.id = c.id pairs touch row numbers to buyer row numbers — the retargeting column collapses to one 3-line ticket and affiliate grows a phantom buyer, a channel board built from coincidental row numbers.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the ticket key",
        why: "Tickets point at buyers through o.customer_id, so the pairing is o.customer_id = c.id. o.id = c.id pairs ticket numbers to buyer numbers — sixteen coincidences — and the board shrinks to a few tickets per channel; a.id = c.id in this slot stops constraining orders at all and every channel reads the whole 103-ticket store.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line key",
        why: "Lines hang off tickets through oi.order_id. oi.id = o.id pairs line numbers to ticket numbers — at most one line per ticket — and every channel's line count collapses to equal its ticket count; oi.product_id = o.id pairs products to tickets and returns a four-row board no channel ever produced.",
      },
      {
        answer: "a.channel",
        kind: "keyword",
        label: "the grouping key",
        why: "The deliverable is one row per channel, so group by a.channel at the chain's near end. c.region re-prints the board by buyer region and c.name explodes it to fourteen per-account rows — neither is the channel read the deck asked for.",
      },
    ],
    distractors: ["a.id", "o.id", "oi.id", "oi.product_id", "c.region", "c.name"],
    walkthrough:
      "Six channels of demand: referral 35 tickets / 89 lines, social 28 / 62, retargeting 24 / 50, affiliate 19 / 47, search 8 / 20, email 5 / 12 — Isabella Rossi and Liam O'Brien, the email pair, are the smallest cohort on the board. The footnote the memo owes the deck: these six rows sum to 119 tickets and 280 lines — more than the store's 103 tickets and 251 lines — because the chain visits Alice Chen twice (social touch a1 and retargeting touch a15), so her 24 tickets and 50 lines land in both of her channels; and it never visits Noah Meyer or Pedro Alvarez (no touch rows), whose 8 tickets and 21 lines are invisible to any channel board. COUNT(DISTINCT o.id) keeps each channel's own ticket count honest; the cross-channel split of a multi-touch buyer is a business decision, not an arithmetic one. The chain lesson: grouping at the touch end preserves the channel lens while the demand facts live three hops away.",
  },
  {
    id: "cs-300",
    deck: 2,
    topic: "j4",
    universe: "pricing",
    title: "Charged versus list, region by region",
    brief:
      "From: Pricing review. Re: realized-price map.\n\nThe quarterly pricing review wants the realized-price map by buyer region: what customers actually paid per line (charged) against what the same lines fetch at catalog list. The chain runs line → ticket → buyer for the region and line → product for the list price; the status arm keeps the map on delivered tickets so nothing phantom inflates it.",
    ask: "Per customer region on delivered orders: charged line value versus catalog list value, biggest charged book first.",
    template: `SELECT c.region, ROUND(SUM({1} * oi.quantity), 2) AS charged, ROUND(SUM(p.price * oi.quantity), 2) AS list_value
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
JOIN products p ON {2} = oi.product_id
WHERE o.status = {3}
GROUP BY {4}
ORDER BY charged DESC;`,
    slots: [
      {
        answer: "oi.unit_price",
        kind: "keyword",
        label: "the charged column",
        why: "Charged value is the line's actual price: oi.unit_price × quantity. p.price is the catalog list — it would make the charged column print exactly the list column (EU 6,623.99 twice) and the review would conclude nobody pays off-list — and o.total × quantity multiplies the whole ticket by line count: APAC reads 37,610.01.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the list-price key",
        why: "The list price lives on the product, paired through p.id = oi.product_id. oi.id = oi.product_id matches no line at all (the map empties), o.id pairs tickets to products and re-prints a two-row fiction, and c.id pairs buyers to products, fabricating a three-region map from a text-to-number comparison that should have failed loudly.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the realized-sales arm",
        why: "The map prices realized sales, so the arm reads o.status = 'delivered' — quoted, it's a value. 'shipped' returns a different map with LATAM missing entirely (no LATAM ticket sits in shipped status) and 'cancelled' prices the 513.81 cancellation wave as if it were revenue.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping key",
        why: "The map is per buyer region, so group by c.region. p.category hands back a seven-row category board and c.city fifteen per-city rows — both real reads, neither the regional map the review asked for.",
      },
    ],
    distractors: ["p.price", "o.total", "oi.id", "'shipped'", "'cancelled'", "p.category"],
    walkthrough:
      "Four regions, two directions: EU charged 6,656.18 against a 6,623.99 list and APAC 6,617.68 against 6,595.12 — buyers paying over shelf — while US comes in at 1,444.77 vs 1,449.87 and LATAM 852.44 vs 858.96, realized prices below list. The gap flipping sign by region is exactly why the board is per region and not a store-wide average. The chain shape is the lesson: four tables, four homes — the charged price on the line, the list price on the product, the status on the ticket, the region on the buyer — three joins stitching them into one board, with the arm riding mid-chain on the ticket. And the value discipline is absolute: all 251 lines in the store were charged at a different unit price than their catalog list, so p.price is never an approximation of charged — it is a different number that happens to share a column shape, and here it would erase the review's entire subject matter.",
  },
];
