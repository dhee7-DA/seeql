// Joins-deck batch j2c — LEFT JOIN semantics & WHERE-vs-ON placement (cs-243..cs-250).
// The slot battle moves to preservation: keep-the-left-side, NULL-filled right arms,
// COUNT(right.id) honesty over ghost rows, real NULLs vs join-ghost NULLs, and the
// placement rule — a right-table filter in ON thins the arm, the same filter in WHERE
// deletes the preserved rows. Anti-joins here are LEFT JOIN + IS NULL only (no NOT
// EXISTS; that's batch 3). Every figure quoted in prose was probed live against the
// seed db before being written down.

import type { CaseStudy } from "../types";

export const casesJ2c: CaseStudy[] = [
  {
    id: "cs-243",
    deck: 2,
    topic: "j2",
    universe: "logistics",
    title: "Tickets that never left the building",
    brief:
      "From: Logistics desk. Re: the undispatched pile.\n\nCarrier billing reconciled clean, which leaves the opposite question: which orders have we promised but never handed to any carrier? I want the full undispatched list with the buyer attached so account management can call each one before the week closes — and I want it built so a ticket with no shipment row still shows up, not silently deleted.",
    ask: "Every order with no shipment row, showing order id, buyer name and order status, ordered by order id.",
    template: `SELECT o.id, c.name, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
{1} JOIN shipments s ON {2} = o.id
WHERE {3} {4} {5}
ORDER BY o.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The brief asks for orders with no shipment, so the join must preserve: LEFT keeps all 103 orders and fills the missing shipment side with NULL. An INNER join would delete every undispatched ticket before the WHERE ever ran — an empty report instead of a call list.",
      },
      {
        answer: "s.order_id",
        kind: "keyword",
        label: "the shipment-side foreign key",
        why: "Shipments point back at the order they moved through s.order_id, so the pairing is s.order_id = o.id. s.id = o.id looks interchangeable — both counters start at 1 — but it pairs order #N with shipment #N: the ghost list still comes back with 21 rows, only now they're the wrong tickets.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the canary column",
        why: "The ghost test reads a shipments column that can only be NULL when the arm never matched, and the primary key is the cleanest canary: s.id IS NULL means no shipment row existed at all. Any matched row carries a real shipment id, so the test fires on true ghosts and nothing else.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the absence test",
        why: "Testing for absence is the IS operator: s.id IS NULL. The tempting chip is = — but s.id = NULL is never true, not even for the ghosts, because NULL compares as unknown. The list would come back empty and the desk would file 'nothing undispatched'.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the absence value",
        why: "An unfilled arm reads NULL, so the test ends with NULL. NOT NULL is the instructive flip: it returns the 82 orders that did ship — a complete, confident answer to a question nobody asked.",
      },
    ],
    distractors: ["INNER", "CROSS", "o.id", "c.id", "=", "NOT NULL"],
    walkthrough:
      "Run it and 21 orders come back — and the status column tells the whole story: 14 pending and 7 cancelled, i.e. every open or dead ticket in the book, none of them ever handed to a carrier. The heaviest is order 74, Farid Nasser's 1,088.44 pending ticket; Alice Chen alone owns six of the twenty-one. The mechanics deserve a beat: the customers join is INNER because every order has a buyer, but the shipments join must be LEFT — 21 orders have no matching arm, and INNER would have deleted exactly those, leaving a report that says all clear. WHERE s.id IS NULL is the anti-join pattern: keep the rows the join couldn't fill. One near-miss to file away: ON s.id = o.id executes and even returns 21 rows, but they're the wrong 21 — shipment 84 pairs with order 84, so a shipped ticket and a run of delivered ones (orders 84 through 88) crowd a list that should only hold open ones. Counters that share a number range are not a join key.",
  },
  {
    id: "cs-244",
    deck: 2,
    topic: "j2",
    universe: "receivables",
    title: "Delivered, but the money never settled",
    brief:
      "From: Receivables. Re: pre-close chase list.\n\nThe close wants proof that delivered tickets actually settled. Most did — but the ledger has a habit of marking a delivery done while the payment sits in pending. Build me the delivered orders that have no settled payment at all: the join arm may only attach settlements, and the survivors must be tickets whose money never cleared. Chase figures on every row.",
    ask: "Delivered orders with no settled payment, showing order id, ticket total and the missing payment id, ordered by order id.",
    template: `SELECT o.id, o.total, p.id AS payment_id
FROM orders o
{1} JOIN payments p ON p.order_id = o.id AND {2} = {3}
WHERE o.status = {4} AND p.id IS {5}
ORDER BY o.id;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The list exists to catch orders whose settlement never arrived, so the join must preserve orders with no settled arm: LEFT keeps the ticket and fills the payment side with NULL. INNER would erase exactly the rows the memo is chasing and return an empty ledger.",
      },
      {
        answer: "p.status",
        kind: "keyword",
        label: "the arm-side status column",
        why: "Settlement is a property of the payment, so the ON arm filters p.status. Slotting o.status is the subtle killer: an order status is never 'settled', the arm matches nothing, and every delivered ticket comes back as a false ghost — 52 rows of chase list instead of the true two.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the arm filter value",
        why: "Only settled money proves the ticket closed clean, so the arm reads 'settled' — quoted, it's a value of payment status. 'pending' is the plausible swap: it runs and returns 50 delivered orders, every one of them a ticket whose money is fine.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the ticket status filter",
        why: "The chase targets delivered tickets, so the WHERE reads o.status = 'delivered'. 'shipped' executes and hands back 6 tickets that are still in flight — not late money, just early worry.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost keep-test",
        why: "The keep-test is p.id IS NULL: a NULL payment id means the settled arm never matched, which is the definition of the chase. NOT NULL inverts the desk's own question and returns the settled side of the house — 53 rows, fifty tickets properly settled, three of them printed twice for two installments.",
      },
    ],
    distractors: ["INNER", "o.status", "'pending'", "'shipped'", "NOT NULL", "="],
    walkthrough:
      "Two rows come back, and both are genuine pre-close chases: order 10 at 175.68 and order 52 at 238.38 — each holds exactly one payment, still pending, for the full ticket (a wallet try and a bank transfer). The structure is the lesson: p.status = 'settled' lives in the ON clause, not the WHERE. Move it to WHERE and the predicate collides with p.id IS NULL — a row can't carry a settled payment and a NULL payment id at once — and the list collapses to zero rows, the close signs off, and both tickets stay unpaid. In the ON, the filter only thins the arm: non-settled payments stop matching, the order row survives as a ghost, and IS NULL reads the ghost honestly. For scale: 15 orders have no payment row at all, but every one of them is pending (9) or cancelled (6) — this query deliberately ignores those; it hunts the ticket that says delivered while the money says otherwise.",
  },
  {
    id: "cs-245",
    deck: 2,
    topic: "j2",
    universe: "month-close",
    title: "Freight still floating at the close",
    brief:
      "From: Month-end close. Re: open freight exposure.\n\nBefore I can sign the logistics accrual I need the parcels still in the carrier's hands: shipments with no delivery timestamp. Attach each open leg to its order ticket so the accrual can see what value is riding on it. Mind the NULLs — a missing delivery date on a live leg is real information, not an artifact of the join.",
    ask: "Open DHL legs: shipment id, carrier, freight cost and order total for every shipment with no delivery timestamp, heaviest freight first.",
    template: `SELECT s.id, s.carrier, s.cost, o.total
FROM shipments s
LEFT JOIN orders o ON o.id = s.order_id
WHERE {1} IS {2} AND s.carrier = {3}
ORDER BY {4} DESC;`,
    slots: [
      {
        answer: "s.delivered_at",
        kind: "keyword",
        label: "the delivery timestamp",
        why: "'In transit' is stored as a missing delivery timestamp, so the test lands on s.delivered_at — a shipments column. o.total IS NULL would test the ticket value instead, which is never missing, and the exposure list would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the open-leg test",
        why: "Open legs are the NULL arms of delivered_at. NOT NULL flips the query to the 18 DHL legs that did land — a closed-shipment report for an accrual that exists to book the open ones.",
      },
      {
        answer: "'DHL'",
        kind: "keyword",
        label: "the carrier filter",
        why: "The accrual scopes to DHL this cycle, so the carrier filter reads 'DHL' — quoted, it's a value. 'FedEx' runs clean and returns 6 open legs from a different carrier account.",
      },
      {
        answer: "s.cost",
        kind: "keyword",
        label: "the exposure sort",
        why: "Freight is what the accrual reserves against, so the sort is s.cost. Sorting by o.total would rank legs by what the parcels were worth and bury the 15.79 freight bill behind every big ticket on the list.",
      },
    ],
    distractors: ["o.total", "o.id", "o.status", "NOT NULL", "'UPS'", "'FedEx'"],
    walkthrough:
      "23 legs are in transit across the book — DHL 11, FedEx 6, LocalPost 4, UPS 2 — and DHL's slice carries 102.93 of open freight, running 5.32 to 15.79 a parcel, heaviest being shipment 23 on Noah Meyer's 56.19 ticket. The NULL-hygiene point is the case's real payload: after a LEFT JOIN, a NULL in a right-table column usually means 'no match' — but this query tests a LEFT-side column, s.delivered_at, so the NULLs are the carrier's own missing timestamps: real in-transit freight, not join ghosts. Confusing the two is how desks write off live freight. And note what the LEFT JOIN is doing here: every one of the 82 shipments sits on a real order, so LEFT and INNER return identical rows today — the query is written LEFT anyway, because the day a shipment loses its order, this report should show the leg with a blank ticket, not lose the parcel.",
  },
  {
    id: "cs-246",
    deck: 2,
    topic: "j2",
    universe: "people-ops",
    title: "The bosses who report to no one",
    brief:
      "From: People-ops. Re: the org chart export.\n\nThe HR toolchain keeps chewing the org chart because the export joins staff to their managers and the department heads come out missing — the chart tool reads their blank manager references as terminations. Rebuild the export so every employee appears with their manager's name attached, managers included, blank manager cell and all. The board pack needs the full ten-person roster, not seven survivors.",
    ask: "Every employee with name, role and manager's name, ordered by employee id — managers show a blank manager name.",
    template: `SELECT e.name, e.role, {1} AS manager_name
FROM employees e
{2} JOIN employees m ON {3} = m.id
ORDER BY e.id;`,
    slots: [
      {
        answer: "m.name",
        kind: "keyword",
        label: "the manager's name",
        why: "The manager's name lives on the manager's own employee row, reached through the m alias: m.name. e.name would label every boss with their own name — Sofia Marin managing Sofia Marin — the kind of quiet corruption the chart tool chokes on.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving self-join",
        why: "Managers have no row above them, so their arm never matches and the join must preserve them: LEFT keeps all ten employees and fills the three bosses' manager cells with NULL. INNER would quietly fire the entire management layer — seven rows, no managers.",
      },
      {
        answer: "e.manager_id",
        kind: "keyword",
        label: "the report-to key",
        why: "The self-join pairs each employee's manager reference with the manager's primary key: e.manager_id = m.id. e.id = m.id compares the employee to themselves and makes everyone their own boss; m.manager_id = m.id asks a manager to be their own manager, matches nobody, and blanks every cell.",
      },
    ],
    distractors: ["INNER", "CROSS", "e.name", "e.id", "m.id", "m.manager_id"],
    walkthrough:
      "Ten rows come back, three of them with a NULL manager cell: Sofia Marin (EU), Daniel Okoye (APAC) and Petra Novak (US) — the department heads, whose manager_id is genuinely empty because nobody manages them. Everyone else threads through the self-join: Marcus Hale and Aiko Yamada lead under Sofia and Daniel, and the reps fan out beneath — including Tomas Ruiz, the LATAM rep who reports to Daniel Okoye in APAC, the one deliberate cross-region edge on the chart. The teaching beat is the same ghost logic as orders-without-shipments, pointed at your own table: the left side (employees) is preserved, the right arm (managers) fills with NULL where the reference is empty. INNER returns 7 rows and the org chart silently loses its leadership — which is precisely the failure the HR export shipped with. Self-joins look exotic but they're the ordinary LEFT JOIN contract with both sides pointing at employees; the only new discipline is that every column needs its alias, or the query can't tell the person from the boss.",
  },
  {
    id: "cs-247",
    deck: 2,
    topic: "j2",
    universe: "growth",
    title: "Every name on the referral list",
    brief:
      "From: Growth lead. Re: referral program review.\n\nThe board deck shows referral arrivals next to the full customer base, so I need one list with both: every customer, with their referral spend where one exists and an honest blank where it doesn't. Filter the acquisition arm to referrals only — but do not lose the customers the filter doesn't match; the blanks are the story the board asked for. Biggest referral spend first.",
    ask: "All 16 customers with referral channel and spend where they arrived via referral, blank otherwise, biggest referral spend first.",
    template: `SELECT c.name, a.channel, a.spend
FROM customers c
{1} JOIN acquisitions a ON {2} = c.id AND a.channel = {3}
ORDER BY {4} {5};`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The brief wants all sixteen customers, blanks included, so the join must preserve: LEFT keeps every customer and fills the unmatched acquisition side with NULL. INNER would shrink the list to the four referral arrivals and delete the twelve blanks that are the board's actual story.",
      },
      {
        answer: "a.customer_id",
        kind: "keyword",
        label: "the acquisition-side foreign key",
        why: "Acquisitions point at the buyer they touch through a.customer_id, so the pairing is a.customer_id = c.id. a.id = c.id is the near-miss that bites: acquisition ids 1 through 13 coincide with customer ids, so the referral four still match perfectly — the query runs, the slide looks right, and the join rule underneath is wrong.",
      },
      {
        answer: "'referral'",
        kind: "keyword",
        label: "the arm filter value",
        why: "The arm filters to referral touches, so the value reads 'referral' — quoted, it's a channel value. 'social' executes and returns a different campaign's arrivals (Alice Chen at 21.17, Jamal Wright at 33.71) wearing referral's clothes.",
      },
      {
        answer: "a.spend",
        kind: "keyword",
        label: "the spend sort",
        why: "Ranking by what the referral cost is the point of the slide: ORDER BY a.spend. c.name would alphabetize the deck — Alice Chen's blank row first, the 35.81 Bruno Silva referral buried mid-list.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest referral spend first, so DESC. ASC is not wrong SQL — it's the wrong slide: the twelve blanks would lead the list and the 9.22 Emma Wilson touch would be the first number anyone reads.",
      },
    ],
    distractors: ["INNER", "c.id", "'social'", "'email'", "c.name", "c.region"],
    walkthrough:
      "Sixteen rows come back — four with referral data, twelve blank. The referral four: Bruno Silva 35.81, Hiro Tanaka 28.77, Maya Patel 15.22, Emma Wilson 9.22 — 89.02 of acquisition spend against 366.19 spent across every channel. The blanks are not noise: they include the two organic walk-ins, Noah Meyer and Pedro Alvarez, who have no acquisition row at all, plus ten customers acquired through other channels whose arms the referral filter NULLs out. And here is the placement battle this case exists for: the channel filter sits in the ON clause, so it only thins the acquisition arm and the twelve blanks survive. Drag the same predicate into WHERE and it turns on the joined rows — a blank row can't equal 'referral' — and twelve of your sixteen customers evaporate, leaving the four arrivals. INNER versus LEFT tells the same story in join-keyword form: 4 rows versus 16. The board asked who the program hasn't touched; both mistakes answer a different question.",
  },
  {
    id: "cs-248",
    deck: 2,
    topic: "j2",
    universe: "cash",
    title: "Tickets with no money attached",
    brief:
      "From: Cash desk. Re: settlement coverage.\n\nThe processor's file and our orders table disagree on coverage, and I want our own number: how many tickets carry no payment attempt at all — not failed, not pending, nothing. Count payment rows per order and keep only the zeros, and make sure the counting column is one that can actually be NULL, or the zeros will lie to you. The zeros list is the deliverable.",
    ask: "Every order with zero payment rows, showing order id, ticket total and the payment-row count, ordered by order id.",
    template: `SELECT o.id, o.total, COUNT(p.id) AS payment_rows
FROM orders o
LEFT JOIN payments p ON {1} = o.id
GROUP BY o.id
HAVING COUNT({2}) = {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the payment-side foreign key",
        why: "Payments point at their ticket through p.order_id, so the arm pairs p.order_id = o.id. p.id = o.id is the classic collision — both counters run 1 through 91 — and it re-cuts the list to twelve phantom tickets: orders 92 through 103, most of them delivered or shipped.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the honest counting column",
        why: "The zero must count payment rows, and COUNT(p.id) is the honest column: on a ghost row the payment id is NULL and COUNT sees nothing, reporting 0. COUNT(*) counts the ghost row itself — every order shows at least 1 — and COUNT(o.id) counts the never-missing order key with the same effect. The zeros would never appear.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the zero threshold",
        why: "The memo wants empty tickets, so the group filter is COUNT(p.id) = 0 — the 0 shows up in the result's own payment_rows column. = 1 returns the 85 orders with a single payment attempt; = 2 finds the three installment tickets instead.",
      },
    ],
    distractors: ["*", "o.id", "SUM", "1", "2", "o.customer_id"],
    walkthrough:
      "Fifteen orders have never attracted a payment row — 4,865.61 of ticket value with nothing banked, nothing pending, nothing failed against it. Nine are pending tickets and six are cancelled; the biggest is order 74, Farid Nasser's 1,088.44. The whole case turns on one column choice: after the LEFT JOIN, an order with no payment still produces a joined row — ghost-carried, every payment column NULL — and COUNT(p.id) is the only counting chip in the bank that reads that ghost as zero. COUNT(*) counts the joined row itself and reports 1, so the HAVING = 0 filter would return nothing at all; COUNT(o.id) counts the never-null order key with the same effect. That's the deck's counting rule in its purest form: count the right table's primary key, never the star, whenever preservation is in play. The '= 1' variant is worth a glance too — 85 orders with exactly one payment attempt — the same query is the full coverage report with the threshold slid.",
  },
  {
    id: "cs-249",
    deck: 2,
    topic: "j2",
    universe: "refund-audit",
    title: "The tickets that refunded twice",
    brief:
      "From: Refund audit. Re: duplicate payouts.\n\nFinance flagged that our refund total looks heavy for the order count, and the obvious suspect is tickets that attracted more than one refund. Pull every order sitting on exactly two refunds, with the buyer's name and the actual refunded money summed from the refund rows themselves. If the total column starts printing ticket prices instead, the audit number is wrong and so is the meeting.",
    ask: "Every order with exactly two refunds, showing order id, buyer name, refund count and the summed refund amount, ordered by order id.",
    template: `SELECT o.id, c.name, COUNT(r.id) AS refund_rows, ROUND(SUM({1}), 2) AS refunded_total
FROM orders o
JOIN customers c ON c.id = o.customer_id
LEFT JOIN refunds r ON {2} = o.id
GROUP BY o.id
HAVING COUNT(r.id) = {3}
ORDER BY o.id;`,
    slots: [
      {
        answer: "r.amount",
        kind: "keyword",
        label: "the refunded money",
        why: "The money that actually went out lives on the refund rows: SUM(r.amount). SUM(o.total) is the fan-out trap — the ticket joins once per refund, so a double-refunded order prints its full price twice and order 6 inflates from 401.62 refunded to 1,505.92 of phantom exposure.",
      },
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the refund-side foreign key",
        why: "Refunds point back at their ticket through r.order_id, so the arm is r.order_id = o.id. r.id = o.id compares a refund's row number to an order's — two unrelated id spaces — the pairing never fires, and the audit comes back empty.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the duplicate threshold",
        why: "The suspect population is exactly-two, so the group filter reads COUNT(r.id) = 2 — and the 2 shows up in the result's own refund_rows column. = 1 returns the nineteen singly-refunded orders, the innocent majority; = 3 finds nobody, which is itself reassuring.",
      },
    ],
    distractors: ["r.id", "o.total", "c.id", "1", "3"],
    walkthrough:
      "Three orders sit on double refunds, all delivered: order 6, Bruno Silva, 401.62 back on a 752.96 ticket; order 55, Alice Chen, 61.52 on 113.66; order 86, Alice Chen again, 74.22 on 116.28. Alice Chen appearing twice is exactly the pattern the fraud desk flags before the refund desk does. The aggregate discipline rhymes with the count-honesty cases: the LEFT JOIN keeps all 103 orders in the tally — 81 of them ghost-carried at zero refunds — and HAVING COUNT(r.id) = 2 picks the doubles out of that honest tally (the =2 filter would forgive an INNER here, but the zeros list this audit also maintains would not). Sum the wrong column and the fan-out bites: o.total repeats once per joined refund row, so the three doubles would report 1,505.92, 227.32 and 232.56 — overstating payouts by more than double. SUM(r.amount) walks the refund rows themselves: 537.36 across the three suspects. Count what matched, sum the column that lives on the many side.",
  },
  {
    id: "cs-250",
    deck: 2,
    topic: "j2",
    universe: "fraud",
    title: "Delivered in the carrier's world, shipped in ours",
    brief:
      "From: Risk team. Re: status contradictions.\n\nThe carrier feeds say parcels landed; our order tickets still say shipped. That mismatch is either a stale fulfillment pipeline or someone hiding late deliveries behind live statuses — either way, risk wants the exact list. Find every shipment the carrier marked delivered while its order ticket still reads 'shipped', and name the buyer behind each contradiction.",
    ask: "Shipments with a delivery timestamp on an order whose status is still 'shipped', showing shipment id, carrier, order id and order status.",
    template: `SELECT s.id, s.carrier, o.id AS order_id, o.status
FROM shipments s
LEFT JOIN orders o ON {1} = s.order_id
WHERE {2} IS NOT NULL AND {3} = {4}
ORDER BY s.id;`,
    slots: [
      {
        answer: "o.id",
        kind: "keyword",
        label: "the order-side key",
        why: "The pairing is o.id = s.order_id — the order's primary key meets the shipment's foreign key. s.id = s.order_id compares the shipment's own row number to the order it moved and matches nothing, so every ticket arrives blank and the WHERE empties the hunt.",
      },
      {
        answer: "s.delivered_at",
        kind: "keyword",
        label: "the carrier's arrival stamp",
        why: "'The carrier marked it delivered' is a non-null delivery timestamp, so the test lands on s.delivered_at. o.shipped_at is the trap: it's set on all 30 shipped-status orders, so the filter passes everything and the contradiction hunt returns thirty boring rows.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the ticket's side of the contradiction",
        why: "The contradiction is between two systems, and the ticket's side of it is o.status. s.carrier = 'shipped' looks structurally identical and can never be true — carriers are DHL, FedEx, UPS and LocalPost — so the hunt returns zero and risk signs off on a lie.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the stale status value",
        why: "The stale value is 'shipped' — quoted, it's an order status. 'delivered' is the easy slip: it finds the 52 tickets where both systems agree, which is precisely the population this hunt exists to contrast against.",
      },
    ],
    distractors: ["s.id", "o.shipped_at", "s.carrier", "'delivered'", "'cancelled'", "o.total"],
    walkthrough:
      "Seven rows come back, and they span the whole year, which kills the one-bad-batch theory: shipment 25 (UPS) on Alice Chen's order 32, delivered 2024-04-23 with the ticket still reading shipped, through to shipment 77 (FedEx) on Isabella Rossi's order 98, landed 2025-03-02 and never flipped. In between: order 35 (Grace Kim, 373.00), order 36 (Pedro Alvarez, 355.07), order 37 (Emma Wilson, 379.83), order 60 (Jamal Wright, 403.72) and order 89 — Alice Chen again, 684.53, the biggest stuck ticket. A buyer repeats, and 684.53 sat on the books as in-flight while the parcel was provably delivered — that's the revenue-recognition question the controller asks next. The LEFT JOIN is the right shape even though every shipment finds its order: the query asks which matched rows contradict, and a narrower join would hide any shipment that ever lost its order — the one row that would turn this data-quality chore into a fraud case.",
  },
];
