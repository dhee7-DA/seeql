// Joins-deck batch j3b — anti-joins on the order / payment / shipment axis,
// cs-259..cs-266. Sibling j3a hunted ghosts that start or end at the customer
// dimension; this batch works the money-and-freight corridors: attempts hung
// on tickets where nothing settled, tickets never attempted at all, legs whose
// ticket never flipped, and claims filed before the scan. The signature battle
// stays the anti-join itself: the arm filter rides in the ON clause, WHERE
// right.id IS NULL is the ghost test, INNER/CROSS silently return the
// complement or delete the gaps, and id-space collisions (p.id = o.id) fabricate
// pairings instead of erroring. Every figure quoted in prose was probed live
// against a read-only copy of the seed db via the corridor scripts
// scripts/probe-j7b*.ts (output: scripts/.probe-j7b-out.txt) before being
// written down.

import type { CaseStudy } from "../types";

export const casesJ3b: CaseStudy[] = [
  {
    id: "cs-259",
    deck: 2,
    topic: "j3",
    universe: "receivables",
    title: "Attempts on tickets where money never landed",
    brief:
      "From: Receivables lead. Re: authorization hygiene sweep.\n\nThirteen pending authorizations worth 5,607.30 are hanging on the ledger, plus one failed card attempt, and the stand-up keeps assuming every one of them sits on a ticket where money eventually cleared. Before I present it that way, prove the ugly version: find the payment attempts whose ticket carries no dated payment anywhere — no settled row, no paid_at date, nothing. This is a ledger checking itself, so the payments table joins against itself.",
    ask: "Every payment attempt whose ticket has no dated payment row, showing the attempt id, ticket, amount and method.",
    template: `SELECT p.id, p.order_id, p.amount, p.method
FROM payments p
{1} JOIN payments s ON s.order_id = p.order_id AND s.{2} IS {3}
WHERE s.id IS {4}
ORDER BY p.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving self-join",
        why: "The ghosts are attempts with NO dated sibling, so attempts without a match must survive the join: LEFT keeps every payment row and paints NULL where no dated sibling exists. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only matched pairs, and then the IS NULL test has nothing left to find.",
      },
      {
        answer: "paid_at",
        kind: "keyword",
        label: "the dated-money column",
        why: "Dated money is defined by paid_at, so the sibling arm tests s.paid_at. s.status IS NOT NULL is meaningless — every payment row carries a status, so the arm matches everything and no attempt can be a ghost. An unqualified paid_at is ambiguous here: both p and s ship the column.",
      },
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the settled-arm test",
        why: "The arm looks FOR dated siblings: s.paid_at IS NOT NULL inside the ON. Flip it to a bare comparison against the literal 'settled' and nothing ever pairs — paid_at holds dates, not the word 'settled' — so all 91 attempts come back as ghosts.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost test",
        why: "An attempt is a ghost when the LEFT JOIN found no dated sibling, and that state is spelled s.id IS NULL. IS = NULL is not SQL — it errors. And testing p.id instead would ask whether the attempt itself exists; it always does, so the list empties to zero rows.",
      },
    ],
    distractors: ["INNER", "CROSS", "status", "= NULL", "'settled'", "p.id"],
    walkthrough:
      "This is a table anti-joining against itself: payments p holds the attempts, payments s holds the definition of real money — a row with a paid_at date — and the arm s.paid_at IS NOT NULL rides inside the ON so an attempt only pairs when its ticket actually settled somewhere. The ghost test s.id IS NULL then keeps exactly the attempts whose ticket never produced a date. Run it and 14 attempts worth 5,751.16 come back: 8 pending cards (3,921.72), 3 wallets (957.87), 2 bank transfers (727.71) and 1 failed card (143.86). The biggest hang is attempt 38 on order 43 — Chloe Dubois' 945.21 ticket with no settlement behind it — and the failed one is attempt 73 on order 82, Emma Wilson's cancelled 143.86 ticket. Ledger note: in this book a dated payment and a settled payment are the same 77 rows, so arm s.status = 'settled' happens to return the identical 14 — but paid_at is the column the brief actually names, and it is the one that survives if the processor ever stamps dates without flipping status.",
  },
  {
    id: "cs-260",
    deck: 2,
    topic: "j3",
    universe: "cash",
    title: "Pending tickets the wallet never saw",
    brief:
      "From: Cash desk. Re: demand-deposit chase list.\n\nFifteen tickets on the book carry no payment row at all — 4,865.61 of exposure — and the pending ones are the ones we can still collect. I want the chase list scoped to tickets sitting in pending with zero attempts: no authorization, no decline, nothing. Oldest first, because the January stragglers have waited a year. Buyer name and created date on every line so the team can actually call someone.",
    ask: "Every pending order with no payment row at all: order id, buyer name, total and created date, oldest first.",
    template: `SELECT o.id, c.name, o.total, o.created_at
FROM orders o
JOIN customers c ON c.id = o.customer_id
{1} JOIN payments p ON {2} = o.id
WHERE o.status = {3} AND p.id IS {4}
ORDER BY o.created_at;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Tickets with no payment row must still appear — that emptiness is the whole finding. LEFT JOIN keeps every order and paints NULL across the missing payment side; INNER keeps only orders that paired with a payment, and the IS NULL test then returns nothing but an empty desk.",
      },
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the payment-side foreign key",
        why: "Payments point back at their ticket through p.order_id, so the pairing is p.order_id = o.id. p.id = o.id compares two unrelated counters — a payment row number against a ticket number — and fabricates pairings wherever the counters happen to collide, leaving just 2 lucky rows. ON o.id = o.id is always true and pairs every order with every payment, killing the ghosts entirely.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-ticket state",
        why: "The chase targets pending tickets, and status values are text literals: 'pending', quoted. 'cancelled' returns the 6 dead tickets instead of the 9 live ones, and 'shipped' or 'delivered' come back empty — dispatched tickets always carry a payment row in this book. Unquoted pending reads as a column name and errors.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the no-attempt test",
        why: "No payment row means the joined payment side is NULL-painted, so the ghost test reads p.id IS NULL. IS NOT NULL would list the 5 pending tickets that DO carry attempts — the opposite list. Writing IS = NULL is a syntax error, not a filter.",
      },
    ],
    distractors: ["INNER", "CROSS", "o.id", "'cancelled'", "'shipped'", "'delivered'"],
    walkthrough:
      "Two joins do different jobs here: the INNER join to customers just attaches the buyer — every order has one — while the LEFT join to payments is the audit itself, preserved so that never-attempted tickets survive with a NULL payment id. The arm o.status = 'pending' scopes the book to live tickets, and p.id IS NULL keeps only those with zero attempts. Nine tickets come back worth 3,856.98 — the collectible slice of the 15 no-payment tickets / 4,865.61 on the full book. Farid Nasser's order 74 leads at 1,088.44; Emma Wilson and Alice Chen each own two; the list runs from January 2024 (order 5, 725.34) to January 2025 (order 94, 149.00). Contrast for the desk: 5 other pending tickets DO carry attempts, and the 13 pending authorizations across the ledger hold 5,607.30 — this list is the money nobody has even tried to take.",
  },
  {
    id: "cs-261",
    deck: 2,
    topic: "j3",
    universe: "fraud",
    title: "Cancelled without a single attempt",
    brief:
      "From: Fraud spot-check. Re: cancellation integrity.\n\nA cancelled ticket should have a story: an authorization that bounced, a card that failed, something. Six cancelled tickets on the book — 1,008.63 — were never attempted at all: no payment row exists. Were these real cancellations or rows someone killed before the money question was even asked? Pull the six with buyer names, biggest first, so I can trace who cancelled them and when. Exactly one cancelled ticket on the book does carry a payment — flag it in the notes as the control case.",
    ask: "Every cancelled order with no payment row: order id, buyer name and total, biggest ticket first.",
    template: `SELECT o.id, c.name, o.total
FROM orders o
JOIN customers c ON c.id = {1}
LEFT JOIN payments p ON p.order_id = o.id
WHERE o.status = {2} AND p.id IS NULL
ORDER BY o.total {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the buyer foreign key",
        why: "The order holds the buyer's key: o.customer_id = c.id. Writing c.id = o.id compares a customer counter to a ticket counter — orders numbered above 16 find no customer at all and fall out of the join, silently shrinking the audit. The owning table qualifies the column: the FK lives on orders.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket state",
        why: "The audit scopes to cancelled tickets, quoted as a text literal: 'cancelled'. 'pending' returns the 9-ticket receivables chase instead — a different desk's list — and 'shipped' returns nothing, because dispatched tickets always carry a payment row. The literal needs its quotes or SQLite hunts for a column named cancelled.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "Fraud review reads biggest exposure first, so o.total sorts DESC. ASC would hand the reviewer the 25.47 ticket first and bury the 397.99 one at the bottom — same six rows, wrong order of business. The keyword sits after the column it governs.",
      },
    ],
    distractors: ["INNER", "CROSS", "ASC", "'pending'", "'shipped'", "o.id"],
    walkthrough:
      "The customers join is plumbing — INNER is fine because every order has a buyer — but the payments join must preserve: LEFT JOIN, because the finding is the absence. p.id IS NULL keeps tickets whose payment side painted NULL, and o.status = 'cancelled' scopes the sweep to dead tickets. Six come back, 1,008.63 in total: Keiko Sato's 397.99 order 83 leads, then Alice Chen's 206.19, 152.52 and 136.11 tickets, with Maya Patel's two small ones (90.35, 25.47) closing the list — Alice owns three of the six, 494.82 overall. The control case the memo asked about is order 82: Emma Wilson's cancelled 143.86 ticket whose single card attempt FAILED, so it carries a payment row and correctly stays off this list. It is the only cancelled ticket with any payment history — one decline story among six silences.",
  },
  {
    id: "cs-262",
    deck: 2,
    topic: "j3",
    universe: "logistics",
    title: "The open-freight board by carrier",
    brief:
      "From: Shipments desk. Re: Monday carrier review.\n\nThe carrier scorecards only count legs in transit, but freight isn't closed until the TICKET is delivered — a scan that lands on a pending or cancelled ticket is still open money. Build the real board: per carrier, the legs whose order is not delivered, with leg counts and freight cost at stake. DHL should top it. The ghost test has to run against the order side, because a shipment row always exists for itself.",
    ask: "Per carrier: count of shipment legs whose order is not delivered, plus their freight cost, busiest carrier first.",
    template: `SELECT s.carrier, COUNT(s.id) AS open_legs, ROUND(SUM(s.cost), 2) AS open_freight
FROM shipments s
{1} JOIN orders o ON o.id = s.order_id AND o.status = {2}
WHERE {3} IS NULL
GROUP BY s.carrier
ORDER BY open_legs {4};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Legs whose ticket isn't delivered must survive with a NULL-painted order side — they are the board. LEFT keeps every shipment row; INNER keeps only legs paired with a delivered order, and the IS NULL test then has zero rows to group. CROSS with an ON behaves the same as INNER in SQLite.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the closed-ticket arm",
        why: "The arm in the ON defines what counts as closed: o.status = 'delivered', quoted. Swap in 'shipped' and the board explodes to UPS 15 / DHL 15 / LocalPost 14 / FedEx 8 — legs of already-closed tickets re-opened by the wrong arm. 'pending' re-opens nearly everything (DHL 29). The arm rides in the ON so unmatched legs survive as ghosts.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the right-side ghost marker",
        why: "An unmatched leg carries NULL across the whole order side, so the ghost test is o.id IS NULL — the RIGHT table's key. s.id IS NULL tests the shipment's own key, which is never NULL on a preserved left row, and empties the board. s.cost IS NULL fails the same way: cost lives on the left row and is always populated.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the busiest-first sort",
        why: "The review reads worst carrier first, so open_legs sorts DESC. Anything that isn't DESC either errors in that position or flips the board upside down, putting UPS's 3 legs where DHL's 14 belong. The keyword belongs immediately after the column it orders.",
      },
    ],
    distractors: ["INNER", "CROSS", "'shipped'", "'pending'", "s.id", "s.cost"],
    walkthrough:
      "This is the aggregate anti-join: the arm o.status = 'delivered' lives inside the ON so a leg only pairs when its ticket is actually closed, and o.id IS NULL keeps the legs that never paired — grouped per carrier into a board. Thirty open legs come back: DHL 14 legs / 129.75 freight, FedEx 8 / 82.42, LocalPost 5 / 51.04, UPS 3 / 39.01. The 30 reconcile against the desk's other numbers: 23 legs are genuinely in transit (delivered_at still NULL) and 7 are the awkward ones — delivery scans that landed while the ticket never flipped to delivered, which the in-transit-only scorecard misses entirely. Carrier leg books for context: DHL 29, LocalPost 19, UPS 18, FedEx 16. The ghost-marker choice is the case's spine: o.id (right side) is the only honest test — s.id or s.cost are never NULL on preserved rows and would hand the review a clean-looking, completely empty board.",
  },
  {
    id: "cs-263",
    deck: 2,
    topic: "j3",
    universe: "refund-audit",
    title: "Claims filed before the delivery scan",
    brief:
      "From: Refund audit. Re: process integrity.\n\nA refund filed before the parcel was even scanned as delivered is either a preprocessing error or a data-entry fiction, and either way it needs a name attached. Of the 25 refunds on file this year, find the claims whose ticket had NO delivery scan on or before the refund date. The comparison between the scan date and the refund date has to ride in the join's arm — pairing the shipment and then filtering afterward would delete the very claims we're hunting.",
    ask: "Every refund whose order has no delivery scan dated on or before the refund date, with claim id, ticket, buyer, amount and the refund date.",
    template: `SELECT r.id, r.order_id, c.name, r.amount, {4}
FROM refunds r
JOIN orders o ON o.id = r.order_id
JOIN customers c ON c.id = o.customer_id
{1} JOIN shipments s ON s.order_id = r.order_id AND s.delivered_at {2} r.refunded_at
WHERE {3} IS NULL
ORDER BY r.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Claims with no qualifying scan must survive the join — they are the findings. LEFT keeps every refund row and paints the shipment side NULL when the arm fails; INNER keeps only claims that paired with an early-enough scan, which deletes exactly the rows the audit exists to find.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the scan-before-claim arm",
        why: "The arm asks for a scan on or before the refund date: s.delivered_at <= r.refunded_at. Flip to >= and 22 of the 25 claims become ghosts — that lists every properly-scanned refund, not the anomalies. A bare = finds no exact date ties at all, and <> pairs every scan, returning zero ghosts.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the shipment-side ghost marker",
        why: "A claim with no qualifying scan carries NULL across the shipment side, so the test is s.id IS NULL — the right table's key. r.id IS NULL or o.total IS NULL test columns on the left rows, which are always present, and would report zero anomalies on a desk that has three.",
      },
      {
        answer: "r.refunded_at",
        kind: "keyword",
        label: "the claim date",
        why: "The date that proves the claim came early is the refund's own timestamp, r.refunded_at. s.delivered_at would print the scan date — but on ghost rows the whole shipment side is NULL, so the evidence column would come back blank on exactly the rows that matter.",
      },
    ],
    distractors: ["INNER", ">=", "=", "<>", "r.id", "o.total"],
    walkthrough:
      "The arm carries the whole audit: s.delivered_at <= r.refunded_at inside the ON means a refund only pairs with a scan that predates or matches it, and s.id IS NULL keeps the claims that never found one. Three of 25 come back. Claim 8: Noah Meyer, 62.77 on order 38, refunded 2024-05-19 with the UPS scan reading 2024-05-22 — three days late. Claim 9: Grace Kim, 230.31 on order 46, refunded 06-12 against a 06-13 scan. Claim 16: Grace Kim again, 203.91 on order 76, refunded 10-18 against 10-19. Two UPS legs and one FedEx; reasons run changed_mind and damaged. The other 22 claims all have a scan predating the refund — healthy process, three exceptions. And the ghost marker has to be s.id: r.id or o.total are never NULL on preserved refund rows, so either would file this audit as perfectly clean.",
  },
  {
    id: "cs-264",
    deck: 2,
    topic: "j3",
    universe: "people-ops",
    title: "Money held on tickets that never moved",
    brief:
      "From: Support ops stand-up. Re: stuck-ticket escalation.\n\nTwenty-one tickets have never dispatched a shipment, and a subset of those are worse than stuck — we're holding attempted money on them. For the escalation list I need tickets that have at least one payment attempt AND no shipment row at all: authorization or decline on file, zero stock movement. Per ticket: attempt count and the money we're holding, biggest exposure first. These get a human phone call today.",
    ask: "Every order that has payment attempts but no shipment row: order id, buyer, status, attempt count and held amount, biggest held first.",
    template: `SELECT o.id, c.name, o.status, COUNT(p.id) AS attempts, ROUND(SUM(p.amount), 2) AS held
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN payments p ON {1} = o.id
{2} JOIN shipments s ON s.order_id = o.id
WHERE {3} IS NULL
GROUP BY o.id
ORDER BY held {4};`,
    slots: [
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the attempt-side foreign key",
        why: "Attempts attach to tickets through p.order_id = o.id. p.id = o.id matches payment row numbers to ticket numbers — the id spaces overlap 1:1 — and fabricates attempts on 18 tickets instead of the real 6. o.id = o.id pairs every order with every payment, and c.id = o.id compares a customer counter to a ticket counter.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving shipment join",
        why: "The brief wants tickets with NO shipment, so the shipment join must preserve the unmatched: LEFT paints s.id NULL for never-dispatched tickets and the WHERE keeps them. INNER keeps only tickets that paired with a shipment, so the IS NULL test finds nothing — the escalation list deletes itself.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the never-dispatched ghost test",
        why: "No shipment row means the LEFT-joined shipment side is NULL-painted: s.id IS NULL. Testing o.id, p.id or c.id asks whether left-side rows exist — they always do — and returns an empty desk. The ghost marker must come from the right table the join failed to match.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-exposure sort",
        why: "Escalations work biggest exposure first, so held sorts DESC. ASC opens the call list with the 143.86 failed attempt and buries the 945.21 ticket at the bottom — same six rows, backwards priorities.",
      },
    ],
    distractors: ["p.id", "o.id", "c.id", "INNER", "CROSS", "ASC"],
    walkthrough:
      "Two joins with opposite contracts: the INNER join to payments is a precondition — the list only contains tickets where money was attempted — while the LEFT join to shipments is the audit, preserved so never-dispatched tickets survive with a NULL s.id for the WHERE to catch. GROUP BY o.id then rolls attempts and held money per ticket. Six tickets qualify: order 43 (Chloe Dubois, 945.21 held), order 97 (585.79), order 25 (364.71), order 79 (212.03), order 12 (148.28) and order 82 (143.86) — about 2,400 in held money, each with exactly one attempt. The wrinkle for the stand-up: order 82 is CANCELLED and its attempt FAILED, so it is not pending money but a decline on a dead ticket; the other five are live pending tickets nobody has dispatched. The remaining 15 of the 21 never-dispatched tickets hold no attempts at all — that is the receivables chase's problem, not ops'.",
  },
  {
    id: "cs-265",
    deck: 2,
    topic: "j3",
    universe: "month-close",
    title: "The no-dated-money book at close",
    brief:
      "From: Financial controller. Re: close checklist, item 4.\n\nAt close I sign against dated money: a payment only counts when it carries a paid_at stamp. The processor's file shows 91 payment rows, but only 77 are dated — and some tickets carry nothing at all. Give me the whole book of tickets with NO dated payment row: no settled stamp anywhere on the ticket, whether that's zero attempts or attempts that never stamped. Ticket id, buyer, status and total, biggest first, and I want the status mix so I can split pending exposure from the rest.",
    ask: "Every order with no dated payment row (paid_at IS NULL on every attempt, or no attempts): id, buyer, status, total — biggest first.",
    template: `SELECT o.id, c.name, o.status, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS {1}
WHERE {2} IS NULL
ORDER BY o.{3} {4};`,
    slots: [
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the dated-money arm",
        why: "The arm defines real money: p.paid_at IS NOT NULL, so a ticket pairs only when some attempt actually stamped a date. Drop the NOT and the arm matches the undated rows instead — the anti-join inverts and the book balloons to every ticket without a pending attempt. The arm must live in the ON, not WHERE, or the ghosts die.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the right-side ghost marker",
        why: "A ticket with no dated attempt carries NULL across the whole payment side, so the test is p.id IS NULL — the right table's key. o.id, c.id or o.total belong to left rows that always exist and would report a perfectly closed book. p.order_id IS NULL is equivalent to p.id here, but the id is the row's identity — test the key you join on.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the exposure column",
        why: "The controller reads biggest exposure first, so the sort key is o.total. o.created_at would sort by age instead — the receivables desk's order, not the close's — and o.id would sort by ticket number. The owning-table prefix o. matters: bare total names no source.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "Biggest exposure first means DESC after o.total. ASC leads with the 25.47 nobody worries about and pushes the 1,088.44 ticket to the bottom of a close checklist. Direction keywords follow the column they govern.",
      },
    ],
    distractors: ["NULL", "o.id", "c.id", "o.total", "created_at", "ASC"],
    walkthrough:
      "The close's definition of money is a date: the arm p.paid_at IS NOT NULL rides in the ON so a ticket only pairs when at least one attempt stamped, and p.id IS NULL keeps the tickets that never did — zero attempts or attempts that never settled, both count as undated exposure. Twenty-nine tickets, 10,616.77: pending 14 / 6,113.00, shipped 6 / 2,937.22, cancelled 7 / 1,152.49, and the alarming two — DELIVERED tickets with no dated money (order 10, Keiko Sato 175.68, wallet attempt still pending; order 52, Grace Kim 238.38, same story). Farid Nasser's 1,088.44 order 74 tops the list, then 945.21 and 725.34. Reconciliation note: 91 payment rows exist, 77 carry paid_at, so the dated book is 77 rows / 24,216.51 — everything else is this list, and the two delivered rows are the ones that should worry the controller most.",
  },
  {
    id: "cs-266",
    deck: 2,
    topic: "j3",
    universe: "growth",
    title: "Win-back list: lapsed accounts, undated money",
    brief:
      "From: Growth lead. Re: win-back spend, January cohort.\n\nBefore we spend win-back credits on lapsed accounts I want the honest picture: which INACTIVE accounts still have tickets with no dated payment — money we hold but never settled, or tickets never attempted at all. Flag the churned accounts with c.active = 0, and keep tickets that never saw a paid_at stamp. If a lapsed account's history is fully settled, it does not belong on this list; clean churn should not earn credits.",
    ask: "Every order on an inactive account (active = 0) with no dated payment row: order id, buyer, status and total.",
    template: `SELECT o.id, c.name, o.status, o.total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN payments p ON p.order_id = o.id AND p.paid_at IS NOT NULL
WHERE {1} IS {2} AND c.active = {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "p.id",
        kind: "keyword",
        label: "the right-side ghost marker",
        why: "A ticket with no dated attempt paints the whole payment side NULL, so the ghost test is p.id IS NULL — the right table's key. o.id IS NULL or c.active IS NULL test left-side columns that are always populated and would return an empty list. p.amount IS NULL would pass here too, but the join key is the honest marker.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the no-dated-money test",
        why: "The anti-join's ghost state is spelled IS NULL. IS NOT NULL inverts the list to the lapsed tickets whose money DID settle — a different three tickets, and the opposite of a win-back case. IS = NULL is a syntax error, and IS 1 asks whether a payment id equals one, which no ghost can satisfy.",
      },
      {
        answer: "0",
        kind: "keyword",
        label: "the churned-account flag",
        why: "Lapsed accounts carry active = 0, an unquoted numeric flag. Switching to 1 lists the 26 no-dated tickets on healthy accounts instead — the whole book minus the churn — and any other value like 2 matches no account state at all, silently emptying the list. The flag is a number on the customers table; keep the comparison numeric.",
      },
    ],
    distractors: ["o.id", "c.active", "= NULL", "NOT NULL", "1", "2"],
    walkthrough:
      "Three filters stack into the win-back rule: the arm p.paid_at IS NOT NULL in the ON defines dated money, p.id IS NULL keeps tickets that never found any, and c.active = 0 scopes to churned accounts. Three tickets come back, all Keiko Sato's (customer 11): order 10, a DELIVERED 175.68 ticket whose wallet attempt is still pending; order 83, a cancelled 397.99 ticket never attempted at all; order 94, a pending 149.00 ticket with no attempt. Total 722.67 of undated history on one lapsed account. The control that proves the filter earns its keep: Dmitri Volkov (customer 4) is equally inactive, but every ticket he ever placed settled with a dated payment — he correctly stays off the list. Widen the flag to active = 1 and the list explodes to 26 tickets / the healthy book, which is a receivables problem wearing a growth badge, not a win-back case.",
  },
];
